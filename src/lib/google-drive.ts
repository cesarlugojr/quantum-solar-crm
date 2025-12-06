/**
 * Google Drive API Integration for PDF Storage
 *
 * Uploads invoice PDFs and design PDFs to Google Drive shared folder.
 */

import { google } from 'googleapis';
import { Readable } from 'stream';

// Get Google Drive configuration for invoices
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

// Get Google Drive configuration for designs
const getDesignDriveConfig = () => {
  const clientEmail = process.env.GOOGLE_DESIGN_CLIENT_EMAIL || process.env.GOOGLE_INVOICE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_DESIGN_PRIVATE_KEY || process.env.GOOGLE_INVOICE_PRIVATE_KEY;
  const folderId = process.env.GOOGLE_DESIGN_FOLDER_ID;

  if (!clientEmail || !privateKey) {
    throw new Error('Google Drive credentials not configured');
  }

  if (!folderId) {
    throw new Error('Google Drive design folder ID not configured (GOOGLE_DESIGN_FOLDER_ID)');
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
        try {
          await drive.files.delete({
            fileId: file.id,
            supportsAllDrives: true,
          });
        } catch (deleteError: unknown) {
          // Ignore 404 errors (file already deleted or doesn't exist)
          const error = deleteError as { code?: number };
          if (error.code !== 404) {
            throw deleteError;
          }
        }
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

// Check if Google Drive is configured (for invoices)
export const isGoogleDriveConfigured = (): boolean => {
  try {
    getGoogleDriveConfig();
    return true;
  } catch {
    return false;
  }
};

// Check if Google Drive is configured for designs
export const isDesignDriveConfigured = (): boolean => {
  try {
    getDesignDriveConfig();
    return true;
  } catch {
    return false;
  }
};

// Get authenticated Google Drive client for designs
const getDesignDriveClient = () => {
  const config = getDesignDriveConfig();

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: config.clientEmail,
      private_key: config.privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  return google.drive({ version: 'v3', auth });
};

// Upload design PDF to Google Drive
export const uploadDesignPDF = async (
  pdfBuffer: Buffer,
  gpin?: string,
  customerName?: string,
  originalFilename?: string
): Promise<UploadResult> => {
  const config = getDesignDriveConfig();
  const drive = getDesignDriveClient();

  // Build filename: Design_GPIN12345_CustomerName.pdf or use original
  const parts = ['Design'];
  if (gpin) parts.push(gpin);
  if (customerName) {
    // Sanitize customer name for filename
    const sanitizedName = customerName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    parts.push(sanitizedName);
  }
  const fileName = originalFilename
    ? `${parts.join('_')}_${originalFilename}`
    : `${parts.join('_')}.pdf`;

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
        try {
          await drive.files.delete({
            fileId: file.id,
            supportsAllDrives: true,
          });
        } catch (deleteError: unknown) {
          // Ignore 404 errors (file already deleted or doesn't exist)
          const error = deleteError as { code?: number };
          if (error.code !== 404) {
            throw deleteError;
          }
        }
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
    throw new Error('Failed to upload design file to Google Drive');
  }

  return {
    fileId: response.data.id,
    webViewLink: response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`,
    webContentLink: response.data.webContentLink || `https://drive.google.com/uc?id=${response.data.id}&export=download`,
  };
};

// Get design file info from Google Drive
export const getDesignPDFInfo = async (fileId: string) => {
  const drive = getDesignDriveClient();

  const response = await drive.files.get({
    fileId,
    fields: 'id,name,webViewLink,webContentLink,size,modifiedTime',
    supportsAllDrives: true,
  });

  return response.data;
};

// Delete design PDF from Google Drive
export const deleteDesignPDF = async (fileId: string): Promise<void> => {
  const drive = getDesignDriveClient();

  await drive.files.delete({
    fileId,
    supportsAllDrives: true,
  });
};

// Project folder result
export interface ProjectFolderResult {
  folderId: string;
  folderUrl: string;
}

// Create or get a project folder in Google Drive
export const getOrCreateProjectFolder = async (
  projectId: string,
  customerName?: string,
  address?: string
): Promise<ProjectFolderResult> => {
  const config = getDesignDriveConfig();
  const drive = getDesignDriveClient();

  // Build folder name: "CustomerName - Address" or "Project-{id}"
  let folderName = `Project-${projectId.substring(0, 8)}`;
  if (customerName) {
    const sanitizedName = customerName.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    folderName = sanitizedName;
    if (address) {
      const sanitizedAddress = address.replace(/[^a-zA-Z0-9\s]/g, '').trim().substring(0, 50);
      folderName = `${sanitizedName} - ${sanitizedAddress}`;
    }
  }

  // Check if folder already exists (by name in the Projects folder)
  const existingFolders = await drive.files.list({
    q: `name='${folderName}' and '${config.folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id,webViewLink)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  // If folder exists, return it
  if (existingFolders.data.files && existingFolders.data.files.length > 0) {
    const folder = existingFolders.data.files[0];
    return {
      folderId: folder.id!,
      folderUrl: folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`,
    };
  }

  // Create new folder
  const response = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [config.folderId],
    },
    fields: 'id,webViewLink',
    supportsAllDrives: true,
  });

  if (!response.data.id) {
    throw new Error('Failed to create project folder in Google Drive');
  }

  return {
    folderId: response.data.id,
    folderUrl: response.data.webViewLink || `https://drive.google.com/drive/folders/${response.data.id}`,
  };
};

// Get MIME type from filename
const getMimeType = (filename: string): string => {
  const ext = filename.toLowerCase().split('.').pop();
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    txt: 'text/plain',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
};

// Upload file to a specific project folder (supports any file type)
export const uploadFileToFolder = async (
  fileBuffer: Buffer,
  folderId: string,
  filename: string
): Promise<UploadResult> => {
  const drive = getDesignDriveClient();
  const mimeType = getMimeType(filename);

  // Check if file already exists in the folder
  const existingFiles = await drive.files.list({
    q: `name='${filename}' and '${folderId}' in parents and trashed=false`,
    fields: 'files(id)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  // If file exists, delete it (we'll upload a fresh version)
  if (existingFiles.data.files && existingFiles.data.files.length > 0) {
    for (const file of existingFiles.data.files) {
      if (file.id) {
        try {
          await drive.files.delete({
            fileId: file.id,
            supportsAllDrives: true,
          });
        } catch (deleteError: unknown) {
          // Ignore 404 errors (file already deleted or doesn't exist)
          const error = deleteError as { code?: number };
          if (error.code !== 404) {
            throw deleteError;
          }
        }
      }
    }
  }

  // Upload new file to the project folder
  const response = await drive.files.create({
    requestBody: {
      name: filename,
      mimeType,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: bufferToStream(fileBuffer),
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

// Upload design PDF to a specific project folder (legacy - uses uploadFileToFolder)
export const uploadDesignPDFToFolder = async (
  pdfBuffer: Buffer,
  folderId: string,
  originalFilename?: string
): Promise<UploadResult> => {
  const fileName = originalFilename || `Design_${Date.now()}.pdf`;
  return uploadFileToFolder(pdfBuffer, folderId, fileName);
};
