-- Migration: Add separate address columns to projects table
-- Date: 2025-12-05
-- Description: Breaks up the single 'address' field into street_address, city, state, zip_code, county

-- Add separate address columns
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS street_address VARCHAR(255),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(50),
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS county VARCHAR(100);

-- Add comments for documentation
COMMENT ON COLUMN projects.street_address IS 'Street address portion of the project location';
COMMENT ON COLUMN projects.city IS 'City of the project location';
COMMENT ON COLUMN projects.state IS 'State of the project location';
COMMENT ON COLUMN projects.zip_code IS 'ZIP/postal code of the project location';
COMMENT ON COLUMN projects.county IS 'County of the project location';

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_projects_city ON projects(city);
CREATE INDEX IF NOT EXISTS idx_projects_state ON projects(state);
CREATE INDEX IF NOT EXISTS idx_projects_zip_code ON projects(zip_code);

-- Migration complete
