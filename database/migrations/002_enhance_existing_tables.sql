-- Migration: Enhance Existing Tables with Custom IDs and Solar Fields
-- Purpose: Add custom IDs to existing tables and solar industry-specific fields
-- Date: 2025-01-19

-- Enhance splash_leads table with custom ID and additional solar fields
ALTER TABLE splash_leads 
ADD COLUMN IF NOT EXISTS custom_id TEXT UNIQUE DEFAULT generate_lead_id(),
ADD COLUMN IF NOT EXISTS monthly_electric_bill DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS roof_type TEXT CHECK (roof_type IN ('asphalt_shingle', 'tile', 'metal', 'flat', 'other')),
ADD COLUMN IF NOT EXISTS roof_age INTEGER,
ADD COLUMN IF NOT EXISTS roof_shading_percentage INTEGER CHECK (roof_shading_percentage >= 0 AND roof_shading_percentage <= 100),
ADD COLUMN IF NOT EXISTS home_ownership TEXT CHECK (home_ownership IN ('own', 'rent')),
ADD COLUMN IF NOT EXISTS credit_score_range TEXT CHECK (credit_score_range IN ('excellent', 'good', 'fair', 'poor'));

-- Enhanced TCPA compliance fields (some already exist, add missing ones)
ALTER TABLE splash_leads 
ADD COLUMN IF NOT EXISTS tcpa_consent_ip_address INET,
ADD COLUMN IF NOT EXISTS tcpa_consent_method TEXT CHECK (tcpa_consent_method IN ('website', 'phone', 'email', 'in_person'));

-- Enhance projects table with custom ID and solar-specific fields
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS custom_id TEXT UNIQUE DEFAULT generate_project_id(),
ADD COLUMN IF NOT EXISTS panel_count INTEGER,
ADD COLUMN IF NOT EXISTS panel_model TEXT,
ADD COLUMN IF NOT EXISTS inverter_type TEXT,
ADD COLUMN IF NOT EXISTS inverter_model TEXT,
ADD COLUMN IF NOT EXISTS battery_included BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS battery_model TEXT,
ADD COLUMN IF NOT EXISTS google_drive_folder_id TEXT,
ADD COLUMN IF NOT EXISTS site_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS site_longitude DECIMAL(11, 8);

-- Add 11-stage pipeline tracking fields to projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS site_survey_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS design_completed_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS permits_submitted_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS permits_approved_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS installation_scheduled_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS installation_completed_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS inspection_scheduled_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS inspection_completed_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pto_submitted_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pto_approved_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS system_activated_date TIMESTAMP WITH TIME ZONE;

-- Update existing records with custom IDs (for testing)
UPDATE splash_leads SET custom_id = generate_lead_id() WHERE custom_id IS NULL;
UPDATE projects SET custom_id = generate_project_id() WHERE custom_id IS NULL;