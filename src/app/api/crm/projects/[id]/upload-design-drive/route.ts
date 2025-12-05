/**
 * Design PDF Upload to Google Drive API
 *
 * Uploads a design/planset PDF to Google Drive for a project.
 * POST /api/crm/projects/[id]/upload-design-drive
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { uploadDesignPDF, isDesignDriveConfigured } from '@/lib/google-drive';

// POST - Upload design PDF to Google Drive
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Google Drive is configured for designs
    if (!isDesignDriveConfigured()) {
      return NextResponse.json(
        { error: 'Google Drive is not configured for design uploads. Set GOOGLE_DESIGN_FOLDER_ID environment variable.' },
        { status: 400 }
      );
    }

    const { id: projectId } = await params;

    // Get the form data with the PDF file
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Fetch project to get GPIN and customer name for filename
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, customer_name')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Google Drive
    const uploadResult = await uploadDesignPDF(
      buffer,
      projectId, // Use project ID as identifier (GPIN equivalent)
      project.customer_name,
      file.name
    );

    // Update project with Google Drive info
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        design_pdf_drive_id: uploadResult.fileId,
        design_pdf_drive_url: uploadResult.webViewLink,
        design_pdf_filename: file.name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Error updating project with Drive info:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Design PDF uploaded to Google Drive',
      fileId: uploadResult.fileId,
      webViewLink: uploadResult.webViewLink,
      webContentLink: uploadResult.webContentLink,
      filename: file.name,
    });
  } catch (error) {
    console.error('Error uploading design to Google Drive:', error);
    return NextResponse.json(
      { error: `Failed to upload to Google Drive: ${error}` },
      { status: 500 }
    );
  }
}
