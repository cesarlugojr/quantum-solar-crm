-- Migration: Add roof sections data to projects table
-- Date: 2025-12-05
-- Description: Stores detailed roof section info extracted by Claude Vision (panel count, pitch, orientation per section)

-- Add JSONB column to store roof sections array
-- Each section contains: section_name, panel_count, pitch_degrees, pitch_ratio, azimuth, orientation
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS roof_sections JSONB;

-- Add comment for documentation
COMMENT ON COLUMN projects.roof_sections IS 'Array of roof sections with panels. Each object: {section_name, panel_count, pitch_degrees, pitch_ratio, azimuth, orientation}';

-- Create GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_projects_roof_sections ON projects USING GIN (roof_sections);

-- Example roof_sections data structure:
-- [
--   {
--     "section_name": "South Roof",
--     "panel_count": 12,
--     "pitch_degrees": 22,
--     "pitch_ratio": "5:12",
--     "azimuth": 180,
--     "orientation": "S"
--   },
--   {
--     "section_name": "West Garage",
--     "panel_count": 6,
--     "pitch_degrees": 18,
--     "pitch_ratio": "4:12",
--     "azimuth": 270,
--     "orientation": "W"
--   }
-- ]

-- Migration complete
