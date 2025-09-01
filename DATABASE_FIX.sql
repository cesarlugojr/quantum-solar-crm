-- Run this in your Supabase SQL Editor to fix the bill_uploads table

-- Add the missing google_drive_id column
ALTER TABLE bill_uploads ADD COLUMN IF NOT EXISTS google_drive_id VARCHAR(255);

-- Add comment for the new column
COMMENT ON COLUMN bill_uploads.google_drive_id IS 'Google Drive file ID for uploaded bills';

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'bill_uploads' 
ORDER BY ordinal_position;
