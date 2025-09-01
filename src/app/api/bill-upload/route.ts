/**
 * Bill Upload API Endpoint
 * 
 * Handles electric bill file uploads from the thank you page.
 * Integrates with Google Suite for complete business workflow.
 * 
 * Features:
 * - File validation and security
 * - Google Drive file storage
 * - Google Sheets tracking
 * - Gmail notifications
 * - Supabase metadata backup
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { google } from 'googleapis';
import { Resend } from 'resend';
import { PassThrough } from 'stream';

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder-resend-key');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg', 
  'image/png',
  'image/jpg'
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('bill') as File;
    const source = formData.get('source') as string;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF, JPG, or PNG file.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Please upload a file smaller than 10MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer for storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileExtension = file.name.split('.').pop() || 'unknown';
    const fileName = `bill-${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    try {
      // Try Google Suite integration, but fallback gracefully if it fails
      let driveFileUrl = null;
      let driveFileId = null;
      let integrationStatus = 'local_only';

      try {
        const auth = await getGoogleAuth();
        driveFileId = await uploadToGoogleDrive(auth, buffer, fileName, file.type);
        driveFileUrl = `https://drive.google.com/file/d/${driveFileId}/view`;
        integrationStatus = 'google_integrated';

        // Add to Google Sheets
        await addToGoogleSheets(auth, {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadTime: new Date().toLocaleString(),
          source: source || 'unknown',
          driveUrl: driveFileUrl,
          uploadId: 'pending'
        });

        // Get lead information for email notification
        const leadInfo = await getRecentLeadInfo();

        // Send email notification
        await sendUploadNotification({
          fileName: file.name,
          fileSize: file.size,
          source: source || 'unknown',
          driveUrl: driveFileUrl,
          leadInfo
        });

      } catch (googleError) {
        console.warn('Google Suite integration failed, continuing with local storage:', googleError);
        // Continue without Google integration - still save to database
        driveFileUrl = 'local_storage_only';
        integrationStatus = 'google_failed';
        
        // Send email notification even if Google integration fails
        await sendUploadNotification({
          fileName: file.name,
          fileSize: file.size,
          source: source || 'unknown',
          driveUrl: driveFileUrl,
          leadInfo: await getRecentLeadInfo()
        });
      }

      const uploadRecord = {
        file_name: fileName,
        original_name: file.name,
        file_type: file.type,
        file_size: file.size,
        source: source || 'unknown',
        upload_ip: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        created_at: new Date().toISOString(),
        file_url: driveFileUrl,
        status: 'received',
        google_drive_id: driveFileId,
        processing_notes: integrationStatus
      };

      // Store upload record in database
      const { data, error } = await supabase
        .from('bill_uploads')
        .insert([uploadRecord])
        .select();

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to process upload' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Bill uploaded successfully',
        data: {
          id: data?.[0]?.id,
          fileName: fileName,
          status: 'received',
          integration: integrationStatus
        }
      });

    } catch (storageError) {
      console.error('Storage error:', storageError);
      return NextResponse.json(
        { error: 'Failed to store file' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Lead Information Retrieval
 */

/**
 * Get the most recent lead information from splash form
 */
async function getRecentLeadInfo() {
  try {
    const { data, error } = await supabase
      .from('splash_leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching lead info:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error in getRecentLeadInfo:', error);
    return null;
  }
}

/**
 * Google Suite Integration Functions
 */

/**
 * Initialize Google Auth using service account
 */
async function getGoogleAuth() {
  // Debug environment variables
  console.log('Google environment variables check:');
  console.log('GOOGLE_PROJECT_ID:', process.env.GOOGLE_PROJECT_ID ? 'SET' : 'MISSING');
  console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? 'SET (length: ' + process.env.GOOGLE_PRIVATE_KEY?.length + ')' : 'MISSING');
  console.log('GOOGLE_CLIENT_EMAIL:', process.env.GOOGLE_CLIENT_EMAIL ? 'SET' : 'MISSING');
  console.log('GOOGLE_PRIVATE_KEY_ID:', process.env.GOOGLE_PRIVATE_KEY_ID ? 'SET' : 'MISSING');
  console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING');
  console.log('GOOGLE_DRIVE_FOLDER_ID:', process.env.GOOGLE_DRIVE_FOLDER_ID ? 'SET' : 'MISSING');
  console.log('GOOGLE_SHEETS_ID:', process.env.GOOGLE_SHEETS_ID ? 'SET' : 'MISSING');

  // Validate environment variables first
  if (!process.env.GOOGLE_PROJECT_ID || 
      !process.env.GOOGLE_PRIVATE_KEY || 
      !process.env.GOOGLE_CLIENT_EMAIL) {
    const missing = [];
    if (!process.env.GOOGLE_PROJECT_ID) missing.push('GOOGLE_PROJECT_ID');
    if (!process.env.GOOGLE_PRIVATE_KEY) missing.push('GOOGLE_PRIVATE_KEY');
    if (!process.env.GOOGLE_CLIENT_EMAIL) missing.push('GOOGLE_CLIENT_EMAIL');
    throw new Error(`Missing required Google environment variables: ${missing.join(', ')}`);
  }

  try {
    // Enhanced Google Auth with better private key handling for serverless environments
    console.log('Initializing Google Auth with enhanced approach...');
    
    // Clean and prepare the private key - handle multiple possible formats
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    
    // Handle different private key formats that might come from environment variables
    if (privateKey) {
      // Remove quotes if present
      privateKey = privateKey.replace(/^["']|["']$/g, '');
      
      // Replace literal \n with actual newlines (common in environment variables)
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      // Ensure proper formatting
      if (!privateKey.startsWith('-----BEGIN')) {
        throw new Error('Private key appears to be malformed - missing BEGIN marker');
      }
      if (!privateKey.endsWith('-----\n') && !privateKey.endsWith('-----')) {
        privateKey += '\n';
      }
    }
    
    console.log('Private key preparation complete, length:', privateKey?.length || 0);
    
    // Single robust JWT approach with enhanced error handling
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/spreadsheets'
      ]
    });
    
    // Test authentication
    console.log('Testing Google Auth authorization...');
    const tokens = await auth.authorize();
    console.log('Google Auth successful - token type:', tokens.token_type || 'bearer');
    
    return auth;
    
  } catch (authError: unknown) {
    console.error('Google Auth initialization failed:', authError);
    const errorMessage = authError instanceof Error ? authError.message : 'Unknown authentication error';
    throw new Error(`Failed to initialize Google Auth: ${errorMessage}`);
  }
}

/**
 * Upload file to Google Drive (supports Shared Drives) - Final stream fix
 */
async function uploadToGoogleDrive(auth: InstanceType<typeof google.auth.JWT>, buffer: Buffer, fileName: string, mimeType: string): Promise<string> {
  try {
    console.log('Starting Google Drive upload for file:', fileName);
    
    // Initialize Google Drive API with explicit auth
    console.log('Initializing Google Drive API...');
    const drive = google.drive({ version: 'v3', auth });
    
    // Handle optional folder ID - only include parents if folder ID is provided
    const fileMetadata: Record<string, unknown> = {
      name: fileName,
    };

    if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
      console.log('Using Google Drive folder:', process.env.GOOGLE_DRIVE_FOLDER_ID);
      fileMetadata.parents = [process.env.GOOGLE_DRIVE_FOLDER_ID];
    }

    // Create a proper Readable stream from Buffer using Node.js stream API
    console.log('Creating readable stream from buffer, size:', buffer.length);
    const bufferStream = new PassThrough();
    bufferStream.end(buffer);

    const media = {
      mimeType: mimeType,
      body: bufferStream,
    };

    // Upload file with support for Shared Drives
    console.log('Uploading file to Google Drive...');
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
      supportsAllDrives: true,  // Required for Shared Drive access
      supportsTeamDrives: true, // Legacy support
    });

    console.log('Google Drive upload response:', response.data);
    
    if (!response.data.id) {
      throw new Error('Failed to upload file to Google Drive - no file ID returned');
    }

    console.log('Google Drive upload successful, file ID:', response.data.id);
    return response.data.id;
    
  } catch (driveError) {
    console.error('Google Drive upload error details:', driveError);
    throw new Error(`Google Drive upload failed: ${driveError instanceof Error ? driveError.message : 'Unknown error'}`);
  }
}

/**
 * Add upload record to Google Sheets - Fixed for production
 */
async function addToGoogleSheets(auth: InstanceType<typeof google.auth.JWT>, data: {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadTime: string;
  source: string;
  driveUrl: string;
  uploadId: string;
}) {
  try {
    console.log('Starting Google Sheets update...');
    
    // Use the imported google object directly instead of dynamic imports
    const sheets = google.sheets({ version: 'v4', auth });
    
    const values = [
      [
        data.uploadTime,
        data.fileName,
        (data.fileSize / 1024 / 1024).toFixed(2) + ' MB',
        data.fileType,
        data.source,
        data.driveUrl,
        data.uploadId
      ]
    ];

    console.log('Adding row to Google Sheets:', values);
    
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Sheet1!A:G', // Adjust range as needed
      valueInputOption: 'RAW',
      requestBody: {
        values: values,
      },
    });

    console.log('Google Sheets update successful:', response.data);
    
  } catch (sheetsError) {
    console.error('Google Sheets update error details:', sheetsError);
    throw new Error(`Google Sheets update failed: ${sheetsError instanceof Error ? sheetsError.message : 'Unknown error'}`);
  }
}


/**
 * Fallback email notification function with enhanced lead information
 */
async function sendUploadNotification(uploadData: {
  fileName: string;
  fileSize: number;
  source: string;
  driveUrl?: string;
  leadInfo?: Record<string, unknown>;
}) {
  try {
    const emailData = {
      to: process.env.NOTIFICATION_EMAIL || 'cesar@quantumsolar.us', // Note: This emailData.to is overridden in the actual send call below
      subject: 'New Electric Bill Upload - Ameren Illinois Campaign',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa;">
          <h2 style="color: #333; border-bottom: 3px solid #ff0000; padding-bottom: 10px;">🔥 New Lead & Bill Upload - Ameren Illinois</h2>
          
          ${uploadData.leadInfo ? `
            <div style="background-color: #fff; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #28a745; margin-top: 0; margin-bottom: 15px;">👤 Lead Information</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                  <p><strong>📝 Name:</strong> ${uploadData.leadInfo.first_name} ${uploadData.leadInfo.last_name}</p>
                  <p><strong>📞 Phone:</strong> ${uploadData.leadInfo.phone}</p>
                  <p><strong>📧 Email:</strong> ${uploadData.leadInfo.email}</p>
                </div>
                <div>
                  <p><strong>🏠 Address:</strong><br>
                     ${uploadData.leadInfo.street_address}<br>
                     ${uploadData.leadInfo.city}, ${uploadData.leadInfo.state} ${uploadData.leadInfo.zip_code}</p>
                </div>
              </div>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 15px;">
                <h4 style="margin-top: 0; color: #333;">🎯 Qualification Details</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  <p><strong>⚡ Utility Company:</strong> ${uploadData.leadInfo.utility_company}</p>
                  <p><strong>🏠 Homeowner:</strong> ${uploadData.leadInfo.homeowner_status === 'yes' ? '✅ Yes' : '❌ No'}</p>
                  <p><strong>💳 Credit Score:</strong> ${uploadData.leadInfo.credit_score}</p>
                  <p><strong>🌳 Shading:</strong> ${uploadData.leadInfo.shading === 'none' ? '✅ No Heavy Shading' : '⚠️ Heavy Shading'}</p>
                </div>
                <p><strong>📋 Status:</strong> <span style="color: ${
                  // Calculate qualification dynamically based on actual field values
                  (uploadData.leadInfo.homeowner_status === 'yes' && 
                   uploadData.leadInfo.credit_score === '650+' && 
                   uploadData.leadInfo.shading === 'none') ? '#28a745' : '#dc3545'
                }; font-weight: bold;">
                  ${(uploadData.leadInfo.homeowner_status === 'yes' && 
                    uploadData.leadInfo.credit_score === '650+' && 
                    uploadData.leadInfo.shading === 'none') ? '✅ QUALIFIED' : '❌ DISQUALIFIED'}
                </span></p>
                <p><strong>📅 Form Completed:</strong> ${new Date(uploadData.leadInfo.created_at as string).toLocaleString()}</p>
              </div>
            </div>
          ` : `
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404;"><strong>⚠️ Lead Information:</strong> No recent form submission found. This may be a direct bill upload.</p>
            </div>
          `}
          
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff0000;">
            <h3 style="color: #ff0000; margin-top: 0; margin-bottom: 15px;">📄 Bill Upload Details</h3>
            <p><strong>📄 File Name:</strong> ${uploadData.fileName}</p>
            <p><strong>📊 File Size:</strong> ${(uploadData.fileSize / 1024 / 1024).toFixed(2)} MB</p>
            <p><strong>🎯 Source:</strong> ${uploadData.source}</p>
            <p><strong>⏰ Upload Time:</strong> ${new Date().toLocaleString()}</p>
          </div>

          ${uploadData.driveUrl && uploadData.driveUrl !== 'local_storage_only' ? 
            `<div style="text-align: center; margin: 30px 0;">
              <a href="${uploadData.driveUrl}" target="_blank" 
                 style="display: inline-block; background-color: #ff0000; color: white; padding: 15px 35px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                📁 View Bill in Google Drive
              </a>
            </div>` : 
            '<p style="color: #666; font-style: italic;">📁 File stored locally - Google Drive integration was unavailable</p>'
          }
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
            <p style="margin: 0; color: #004085;"><strong>🚀 Next Steps:</strong> 
              ${(uploadData.leadInfo?.homeowner_status === 'yes' && 
                uploadData.leadInfo?.credit_score === '650+' && 
                uploadData.leadInfo?.shading === 'none') ? 
                'Lead is qualified! Review the bill and contact the customer to schedule their solar consultation.' :
                'Review lead details and bill. Follow up as appropriate based on qualification status.'
              }
            </p>
          </div>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
            Sent from your Quantum Solar website • Ameren Illinois Campaign<br>
            Lead ID: ${uploadData.leadInfo?.id || 'N/A'} • Bill Upload: ${new Date().toISOString()}
          </p>
        </div>
      `
    };

    // Send email using Resend directly
    await resend.emails.send({
      from: 'Quantum Solar <info@quantumsolar.us>',
      to: [
        'cesar@quantumsolar.us',
        // 'leads@leadrnnr.com', // Commented out for testing
        // 'doug@leadrnnr.com', // Commented out for testing
        // 'bryan@leadrnnr.com' // Commented out for testing
      ],
      subject: emailData.subject,
      html: emailData.html
    });

  } catch (error) {
    console.error('Email notification error:', error);
    // Don't fail the upload if email fails
  }
}
