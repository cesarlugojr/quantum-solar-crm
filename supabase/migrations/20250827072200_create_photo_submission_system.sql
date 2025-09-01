-- Photo Submission System Migration
-- Creates tables for managing photo uploads across project lifecycle stages

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create photo_submissions table
-- Tracks photo submission sessions with metadata
CREATE TABLE IF NOT EXISTS public.photo_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id TEXT, -- Can be null for general submissions
    submission_type TEXT NOT NULL CHECK (submission_type IN ('site_survey', 'installation', 'inspection')),
    technician_name TEXT NOT NULL,
    notes TEXT DEFAULT '',
    weather_conditions TEXT DEFAULT '',
    completion_percentage INTEGER DEFAULT 100 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    submission_timestamp TIMESTAMPTZ NOT NULL,
    location_data JSONB, -- GPS coordinates and accuracy
    photo_count INTEGER NOT NULL DEFAULT 0,
    photos_uploaded INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'partially_completed')),
    upload_errors JSONB, -- Array of error details
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create photo_records table  
-- Individual photo file records with storage information
CREATE TABLE IF NOT EXISTS public.photo_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES photo_submissions(id) ON DELETE CASCADE,
    project_id TEXT, -- Denormalized for easier querying
    file_name TEXT NOT NULL, -- Unique storage filename
    original_name TEXT NOT NULL, -- Original uploaded filename
    file_path TEXT NOT NULL, -- Storage path in Supabase
    file_size BIGINT NOT NULL, -- File size in bytes
    file_type TEXT NOT NULL, -- MIME type
    public_url TEXT NOT NULL, -- Public access URL
    upload_order INTEGER NOT NULL DEFAULT 1, -- Order within submission
    metadata JSONB, -- Additional file metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Ensure unique file names
    CONSTRAINT unique_file_name UNIQUE (file_name),
    -- Ensure reasonable file sizes (max 50MB)
    CONSTRAINT reasonable_file_size CHECK (file_size > 0 AND file_size <= 52428800)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_photo_submissions_project_id ON photo_submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_photo_submissions_type ON photo_submissions(submission_type);
CREATE INDEX IF NOT EXISTS idx_photo_submissions_technician ON photo_submissions(technician_name);
CREATE INDEX IF NOT EXISTS idx_photo_submissions_created_at ON photo_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photo_submissions_status ON photo_submissions(status);

CREATE INDEX IF NOT EXISTS idx_photo_records_submission_id ON photo_records(submission_id);
CREATE INDEX IF NOT EXISTS idx_photo_records_project_id ON photo_records(project_id);
CREATE INDEX IF NOT EXISTS idx_photo_records_upload_order ON photo_records(submission_id, upload_order);
CREATE INDEX IF NOT EXISTS idx_photo_records_created_at ON photo_records(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_photo_submissions_updated_at 
    BEFORE UPDATE ON photo_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE photo_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for photo_submissions
CREATE POLICY "Enable read access for authenticated users" ON photo_submissions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON photo_submissions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON photo_submissions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create RLS policies for photo_records
CREATE POLICY "Enable read access for authenticated users" ON photo_records
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON photo_records
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON photo_records
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON photo_submissions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON photo_records TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create view for photo submission summary with stats
CREATE OR REPLACE VIEW photo_submission_summary AS
SELECT 
    ps.id,
    ps.project_id,
    ps.submission_type,
    ps.technician_name,
    ps.notes,
    ps.weather_conditions,
    ps.completion_percentage,
    ps.submission_timestamp,
    ps.location_data,
    ps.status,
    ps.created_at,
    ps.processed_at,
    COUNT(pr.id) as actual_photo_count,
    ps.photo_count as reported_photo_count,
    ARRAY_AGG(
        JSON_BUILD_OBJECT(
            'id', pr.id,
            'file_name', pr.file_name,
            'original_name', pr.original_name,
            'file_size', pr.file_size,
            'public_url', pr.public_url,
            'upload_order', pr.upload_order
        ) ORDER BY pr.upload_order
    ) FILTER (WHERE pr.id IS NOT NULL) as photos
FROM photo_submissions ps
LEFT JOIN photo_records pr ON ps.id = pr.submission_id
GROUP BY ps.id, ps.project_id, ps.submission_type, ps.technician_name, 
         ps.notes, ps.weather_conditions, ps.completion_percentage, 
         ps.submission_timestamp, ps.location_data, ps.status, 
         ps.created_at, ps.processed_at, ps.photo_count;

-- Grant access to the view
GRANT SELECT ON photo_submission_summary TO authenticated;

-- Create function to get photos by project
CREATE OR REPLACE FUNCTION get_project_photos(project_id_param TEXT)
RETURNS TABLE (
    submission_id UUID,
    submission_type TEXT,
    technician_name TEXT,
    submission_date TIMESTAMPTZ,
    photo_count BIGINT,
    photos JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pss.id,
        pss.submission_type,
        pss.technician_name,
        pss.created_at,
        COUNT(pr.id)::BIGINT,
        JSONB_AGG(
            JSONB_BUILD_OBJECT(
                'id', pr.id,
                'file_name', pr.file_name,
                'original_name', pr.original_name,
                'public_url', pr.public_url,
                'file_size', pr.file_size,
                'upload_order', pr.upload_order
            ) ORDER BY pr.upload_order
        ) FILTER (WHERE pr.id IS NOT NULL)
    FROM photo_submissions pss
    LEFT JOIN photo_records pr ON pss.id = pr.submission_id
    WHERE pss.project_id = project_id_param
    GROUP BY pss.id, pss.submission_type, pss.technician_name, pss.created_at
    ORDER BY pss.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permission on the function
GRANT EXECUTE ON FUNCTION get_project_photos TO authenticated;

-- Create function to clean up old submissions (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_photo_submissions(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete submissions older than specified days with failed status
    DELETE FROM photo_submissions 
    WHERE created_at < (now() - INTERVAL '1 day' * days_old)
    AND status = 'failed';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permission for cleanup function to service role only
GRANT EXECUTE ON FUNCTION cleanup_old_photo_submissions TO service_role;

-- Add comments for documentation
COMMENT ON TABLE photo_submissions IS 'Photo submission sessions for project documentation';
COMMENT ON TABLE photo_records IS 'Individual photo file records with storage metadata';
COMMENT ON VIEW photo_submission_summary IS 'Comprehensive view of photo submissions with aggregated photo data';
COMMENT ON FUNCTION get_project_photos IS 'Retrieves all photos for a specific project organized by submission';
COMMENT ON FUNCTION cleanup_old_photo_submissions IS 'Maintenance function to remove old failed submissions';

-- Sample data for testing (commented out for production)
/*
INSERT INTO photo_submissions (
    project_id, 
    submission_type, 
    technician_name, 
    notes,
    weather_conditions,
    completion_percentage,
    submission_timestamp,
    location_data,
    photo_count,
    status
) VALUES 
(
    'QSLID-1234567890-ABC123',
    'site_survey',
    'John Smith',
    'Initial site survey completed. Good roof condition, minimal shading.',
    'Sunny, 72°F',
    100,
    now(),
    '{"latitude": 41.8781, "longitude": -87.6298, "accuracy": 10}',
    5,
    'completed'
),
(
    'QSLID-1234567890-ABC123',
    'installation',
    'Mike Johnson',
    'Installation Day 1 - Panel mounting complete',
    'Partly cloudy, 68°F', 
    50,
    now(),
    '{"latitude": 41.8781, "longitude": -87.6298, "accuracy": 8}',
    8,
    'completed'
);
*/
