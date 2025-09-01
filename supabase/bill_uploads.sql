-- Bill Uploads Table for Electric Bill Processing
-- Stores metadata and file information for uploaded electric bills
-- Used for system pre-building and savings calculations

-- Create bill_uploads table
CREATE TABLE IF NOT EXISTS bill_uploads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- File Information
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    file_url TEXT, -- URL to stored file (S3, etc.)
    
    -- Upload Metadata
    source VARCHAR(100) DEFAULT 'unknown',
    upload_ip INET,
    user_agent TEXT,
    status VARCHAR(50) DEFAULT 'received', -- 'received', 'processed', 'error'
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    
    -- Processing Results (for future use)
    processing_notes TEXT,
    extracted_data JSONB, -- Store extracted bill data as JSON
    
    -- Google Drive Integration
    google_drive_id VARCHAR(255), -- Google Drive file ID
    
    -- Lead Association (optional)
    lead_id UUID, -- Can reference splash_leads table
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bill_uploads_created_at ON bill_uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bill_uploads_status ON bill_uploads(status);
CREATE INDEX IF NOT EXISTS idx_bill_uploads_source ON bill_uploads(source);
CREATE INDEX IF NOT EXISTS idx_bill_uploads_file_type ON bill_uploads(file_type);
CREATE INDEX IF NOT EXISTS idx_bill_uploads_lead_id ON bill_uploads(lead_id);

-- Enable RLS on the table
ALTER TABLE bill_uploads ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role to have full access
CREATE POLICY "Service role has full access to bill_uploads" 
ON bill_uploads FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Policy to allow anonymous users to insert bill uploads
CREATE POLICY "Anonymous users can insert bill_uploads" 
ON bill_uploads FOR INSERT 
TO anon 
WITH CHECK (true);

-- Grant necessary permissions
GRANT INSERT ON bill_uploads TO anon;
GRANT SELECT, INSERT, UPDATE ON bill_uploads TO authenticated;

-- Add helpful comments
COMMENT ON TABLE bill_uploads IS 'Stores metadata for uploaded electric bills';
COMMENT ON COLUMN bill_uploads.file_name IS 'Generated unique filename for storage';
COMMENT ON COLUMN bill_uploads.original_name IS 'Original filename from user upload';
COMMENT ON COLUMN bill_uploads.file_size IS 'File size in bytes';
COMMENT ON COLUMN bill_uploads.status IS 'Processing status: received, processed, error';
COMMENT ON COLUMN bill_uploads.extracted_data IS 'JSON data extracted from bill processing';

-- Create a view for upload statistics
CREATE OR REPLACE VIEW bill_upload_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_uploads,
    COUNT(*) FILTER (WHERE status = 'received') as pending_uploads,
    COUNT(*) FILTER (WHERE status = 'processed') as processed_uploads,
    COUNT(*) FILTER (WHERE status = 'error') as failed_uploads,
    AVG(file_size) as avg_file_size,
    SUM(file_size) as total_storage_used
FROM bill_uploads
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Grant access to the view
GRANT SELECT ON bill_upload_stats TO authenticated;
