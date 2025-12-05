/**
 * Google Drive API Integration for Invoice PDF Storage
 *
 * Uploads invoice PDFs to Google Drive shared folder.
 */

import { google } from 'googleapis';
import { Readable } from 'stream';

// Get Google Drive configuration
const getGoogleDriveConfig = () => {
  const clientEmail = process.env.GOOGLE_INVOICE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_INVOICE_PRIVATE_KEY;
  const folderId = process.env.GOOGLE_INVOICE_FOLDER_ID;

  if (!clientEmail || !privateKey) {
    throw new Error('Google Drive credentials not configured');
  }

  if (!folderId) {
    throw new Error('Google Drive folder ID not configured');
  }

  return {
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
    folderId,
  };
};

// Get authenticated Google Drive client
const getDriveClient = () => {
  const config = getGoogleDriveConfig();

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: config.clientEmail,
      private_key: config.privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  return google.drive({ version: 'v3', auth });
};

// Convert Buffer to Readable stream
const bufferToStream = (buffer: Buffer): Readable => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
};

// Upload invoice PDF to Google Drive
export interface UploadResult {
  fileId: string;
  webViewLink: string;
  webContentLink: string;
}

export const uploadInvoicePDF = async (
  pdfBuffer: Buffer,
  invoiceNumber: number,
  gpin?: string,
  customerName?: string
): Promise<UploadResult> => {
  const config = getGoogleDriveConfig();
  const drive = getDriveClient();

  // Build filename: Invoice_1266_GPIN12345_CustomerName.pdf
  const parts = [`Invoice_${invoiceNumber}`];
  if (gpin) parts.push(gpin);
  if (customerName) {
    // Sanitize customer name for filename
    const sanitizedName = customerName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    parts.push(sanitizedName);
  }
  const fileName = `${parts.join('_')}.pdf`;

  // Check if file already exists
  const existingFiles = await drive.files.list({
    q: `name='${fileName}' and '${config.folderId}' in parents and trashed=false`,
    fields: 'files(id)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  // If file exists, delete it (we'll upload a fresh version)
  if (existingFiles.data.files && existingFiles.data.files.length > 0) {
    for (const file of existingFiles.data.files) {
      if (file.id) {
        await drive.files.delete({
          fileId: file.id,
          supportsAllDrives: true,
        });
      }
    }
  }

  // Upload new file
  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType: 'application/pdf',
      parents: [config.folderId],
    },
    media: {
      mimeType: 'application/pdf',
      body: bufferToStream(pdfBuffer),
    },
    fields: 'id,webViewLink,webContentLink',
    supportsAllDrives: true,
  });

  if (!response.data.id) {
    throw new Error('Failed to upload file to Google Drive');
  }

  return {
    fileId: response.data.id,
    webViewLink: response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`,
    webContentLink: response.data.webContentLink || `https://drive.google.com/uc?id=${response.data.id}&export=download`,
  };
};

// Get file info from Google Drive
export const getInvoicePDFInfo = async (fileId: string) => {
  const drive = getDriveClient();

  const response = await drive.files.get({
    fileId,
    fields: 'id,name,webViewLink,webContentLink,size,modifiedTime',
    supportsAllDrives: true,
  });

  return response.data;
};

// Delete invoice PDF from Google Drive
export const deleteInvoicePDF = async (fileId: string): Promise<void> => {
  const drive = getDriveClient();

  await drive.files.delete({
    fileId,
    supportsAllDrives: true,
  });
};

// Check if Google Drive is configured
export const isGoogleDriveConfigured = (): boolean => {
  try {
    getGoogleDriveConfig();
    return true;
  } catch {
    return false;
  }
};
