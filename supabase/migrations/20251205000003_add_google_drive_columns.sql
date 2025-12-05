-- Google Drive Columns Migration
-- Adds columns for storing Google Drive file information for invoice PDFs

-- ============================================
-- ADD GOOGLE DRIVE COLUMNS TO INVOICES
-- ============================================

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS google_drive_file_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS google_drive_url TEXT;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN invoices.google_drive_file_id IS 'Google Drive file ID for the invoice PDF';
COMMENT ON COLUMN invoices.google_drive_url IS 'Google Drive web view URL for the invoice PDF';
