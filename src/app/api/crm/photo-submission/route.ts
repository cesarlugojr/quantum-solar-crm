/**
 * Photo Submission API Endpoint
 * 
 * Handles photo uploads for different project stages:
 * - Site surveys, installations, and inspections
 * - Processes multiple photos with metadata
 * - Stores files in Supabase Storage
 * - Creates database records for tracking
 * - Supports GPS location data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PhotoMetadata {
  originalName: string;
  size: number;
  type: string;
  id: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const projectId = formData.get('projectId') as string;
    const submissionType = formData.get('submissionType') as string;
    const technician = formData.get('technician') as string;
    const notes = formData.get('notes') as string || '';
    const weatherConditions = formData.get('weatherConditions') as string || '';
    const completionPercentage = formData.get('completionPercentage') as string || '100';
    const timestamp = formData.get('timestamp') as string;
    const locationString = formData.get('location') as string;
    
    // Parse location data if provided
    let location: LocationData | null = null;
    if (locationString) {
      try {
        location = JSON.parse(locationString);
      } catch (error) {
        console.error('Error parsing location data:', error);
      }
    }

    // Validate required fields
    if (!submissionType || !technician) {
      return NextResponse.json(
        { error: 'Missing required fields: submissionType and technician are required' },
        { status: 400 }
      );
    }

    if (!['site_survey', 'installation', 'inspection'].includes(submissionType)) {
      return NextResponse.json(
        { error: 'Invalid submission type. Must be: site_survey, installation, or inspection' },
        { status: 400 }
      );
    }

    // Get all photo files
    const photos = formData.getAll('photos') as File[];
    
    if (photos.length === 0) {
      return NextResponse.json(
        { error: 'No photos provided' },
        { status: 400 }
      );
    }

    console.log(`Processing ${photos.length} photos for ${submissionType} submission`);

    // Create photo submission record
    const submissionData = {
      project_id: projectId || null,
      submission_type: submissionType,
      technician_name: technician,
      notes,
      weather_conditions: weatherConditions,
      completion_percentage: parseInt(completionPercentage),
      submission_timestamp: timestamp,
      location_data: location,
      photo_count: photos.length,
      status: 'processing',
      created_at: new Date().toISOString()
    };

    const { data: submissionRecord, error: submissionError } = await supabase
      .from('photo_submissions')
      .insert(submissionData)
      .select()
      .single();

    if (submissionError) {
      console.error('Error creating submission record:', submissionError);
      return NextResponse.json(
        { error: 'Failed to create submission record', details: submissionError.message },
        { status: 500 }
      );
    }

    const submissionId = submissionRecord.id;
    const uploadedPhotos = [];
    const errors = [];

    // Process each photo
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      
      try {
        // Get photo metadata if provided
        const metadataString = formData.get(`photoMetadata_${i}`) as string;
        let metadata: PhotoMetadata | null = null;
        if (metadataString) {
          try {
            metadata = JSON.parse(metadataString);
          } catch (error) {
            console.error(`Error parsing metadata for photo ${i}:`, error);
          }
        }

        // Generate unique filename
        const fileExtension = photo.name.split('.').pop() || 'jpg';
        const fileName = `${submissionId}_${Date.now()}_${i + 1}.${fileExtension}`;
        const filePath = `photo-submissions/${submissionType}/${fileName}`;

        // Convert File to ArrayBuffer for Supabase Storage
        const arrayBuffer = await photo.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('project-photos')
          .upload(filePath, buffer, {
            contentType: photo.type,
            upsert: false
          });

        if (uploadError) {
          console.error(`Error uploading photo ${i + 1}:`, uploadError);
          errors.push({
            photoIndex: i + 1,
            fileName: photo.name,
            error: uploadError.message
          });
          continue;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('project-photos')
          .getPublicUrl(filePath);

        // Create photo record
        const photoData = {
          submission_id: submissionId,
          project_id: projectId || null,
          file_name: fileName,
          original_name: metadata?.originalName || photo.name,
          file_path: filePath,
          file_size: photo.size,
          file_type: photo.type,
          public_url: publicUrlData.publicUrl,
          upload_order: i + 1,
          created_at: new Date().toISOString()
        };

        const { data: photoRecord, error: photoError } = await supabase
          .from('photo_records')
          .insert(photoData)
          .select()
          .single();

        if (photoError) {
          console.error(`Error creating photo record ${i + 1}:`, photoError);
          errors.push({
            photoIndex: i + 1,
            fileName: photo.name,
            error: photoError.message
          });
          continue;
        }

        uploadedPhotos.push({
          id: photoRecord.id,
          fileName: fileName,
          originalName: metadata?.originalName || photo.name,
          publicUrl: publicUrlData.publicUrl,
          fileSize: photo.size
        });

      } catch (error) {
        console.error(`Error processing photo ${i + 1}:`, error);
        errors.push({
          photoIndex: i + 1,
          fileName: photo.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Update submission record with final status
    const finalStatus = errors.length === 0 ? 'completed' : 
                       uploadedPhotos.length === 0 ? 'failed' : 'partially_completed';
    
    const { error: updateError } = await supabase
      .from('photo_submissions')
      .update({
        status: finalStatus,
        photos_uploaded: uploadedPhotos.length,
        upload_errors: errors.length > 0 ? errors : null,
        processed_at: new Date().toISOString()
      })
      .eq('id', submissionId);

    if (updateError) {
      console.error('Error updating submission status:', updateError);
    }

    // Create response
    const response = {
      success: true,
      id: submissionId,
      status: finalStatus,
      photosUploaded: uploadedPhotos.length,
      totalPhotos: photos.length,
      photos: uploadedPhotos,
      ...(errors.length > 0 && { errors })
    };

    console.log(`Photo submission completed: ${uploadedPhotos.length}/${photos.length} photos uploaded successfully`);

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Photo submission API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to submit photos.' },
    { status: 405 }
  );
}
