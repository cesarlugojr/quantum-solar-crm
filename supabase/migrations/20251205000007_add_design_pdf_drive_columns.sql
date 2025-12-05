-- Add Google Drive columns for design PDFs to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS design_pdf_drive_id TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS design_pdf_drive_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS design_pdf_filename TEXT;

-- Add column for the project's Google Drive folder
ALTER TABLE projects ADD COLUMN IF NOT EXISTS google_drive_folder_id TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS google_drive_folder_url TEXT;

-- Add comment for clarity
COMMENT ON COLUMN projects.design_pdf_drive_id IS 'Google Drive file ID for the uploaded design/planset PDF';
COMMENT ON COLUMN projects.design_pdf_drive_url IS 'Google Drive web view URL for the design/planset PDF';
COMMENT ON COLUMN projects.design_pdf_filename IS 'Original filename of the uploaded design/planset PDF';
COMMENT ON COLUMN projects.google_drive_folder_id IS 'Google Drive folder ID for this project (contains all project files)';
COMMENT ON COLUMN projects.google_drive_folder_url IS 'Google Drive folder URL for this project';
