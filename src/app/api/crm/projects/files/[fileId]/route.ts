/**
 * Project File Delete API
 *
 * Deletes a file from Google Drive and the database.
 * DELETE /api/crm/projects/files/[fileId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { deleteDesignPDF } from '@/lib/google-drive';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileId } = await params;

    // Get the file record
    const { data: fileRecord, error: fetchError } = await supabase
      .from('project_files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fetchError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete from Google Drive
    try {
      await deleteDesignPDF(fileRecord.drive_file_id);
    } catch (driveError) {
      console.error('Error deleting from Google Drive:', driveError);
      // Continue to delete database record even if Drive delete fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('project_files')
      .delete()
      .eq('id', fileId);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete file record' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: `Failed to delete file: ${error}` },
      { status: 500 }
    );
  }
}
