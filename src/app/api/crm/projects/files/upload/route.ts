/**
 * Project File Upload API
 *
 * Uploads files to the project's Google Drive folder.
 * POST /api/crm/projects/files/upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import {
  getOrCreateProjectFolder,
  uploadFileToFolder,
  isDesignDriveConfigured,
} from '@/lib/google-drive';

// Valid document types
const VALID_DOCUMENT_TYPES = [
  'utility_bill',
  'design',
  'permit',
  'inspection_report',
  'pto_approval',
  'contract',
  'site_survey',
  'other',
];

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Google Drive is configured
    if (!isDesignDriveConfigured()) {
      return NextResponse.json(
        { error: 'Google Drive is not configured' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;
    const documentType = formData.get('documentType') as string;
    const notes = formData.get('notes') as string | null;

    // Validate inputs
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    if (!documentType || !VALID_DOCUMENT_TYPES.includes(documentType)) {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }

    if (documentType === 'other' && !notes?.trim()) {
      return NextResponse.json(
        { error: 'Notes are required for "other" document type' },
        { status: 400 }
      );
    }

    // Validate file size (25MB max)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 25MB' },
        { status: 400 }
      );
    }

    // Get project info for folder naming
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, customer_name, address, google_drive_folder_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get or create the project folder
    let folderId = project.google_drive_folder_id;

    if (!folderId) {
      const folderResult = await getOrCreateProjectFolder(
        projectId,
        project.customer_name,
        project.address
      );
      folderId = folderResult.folderId;

      // Save the folder ID to the project
      await supabase
        .from('projects')
        .update({
          google_drive_folder_id: folderId,
          google_drive_folder_url: folderResult.folderUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Google Drive
    const uploadResult = await uploadFileToFolder(
      buffer,
      folderId,
      file.name
    );

    // Save file record to database
    const { data: fileRecord, error: insertError } = await supabase
      .from('project_files')
      .insert({
        project_id: projectId,
        document_type: documentType,
        filename: file.name,
        drive_file_id: uploadResult.fileId,
        drive_url: uploadResult.webViewLink,
        notes: notes?.trim() || null,
        uploaded_by: userId,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving file record:', insertError);
      return NextResponse.json(
        { error: 'File uploaded but failed to save record' },
        { status: 500 }
      );
    }

    // If this is a design document, also update the project's design fields
    if (documentType === 'design') {
      await supabase
        .from('projects')
        .update({
          design_pdf_drive_id: uploadResult.fileId,
          design_pdf_drive_url: uploadResult.webViewLink,
          design_pdf_filename: file.name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);
    }

    return NextResponse.json({
      success: true,
      file: fileRecord,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: `Failed to upload file: ${error}` },
      { status: 500 }
    );
  }
}
