-- Quantum Solar CRM Database Setup
-- Run this in your Supabase SQL Editor to create the projects tables

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    address TEXT NOT NULL,
    system_size_kw DECIMAL(5,2),
    estimated_annual_production_kwh INTEGER,
    project_value DECIMAL(10,2),
    contract_signed_date DATE,
    notice_to_proceed_date DATE,
    estimated_completion_date DATE,
    actual_completion_date DATE,
    current_stage INTEGER DEFAULT 1,
    overall_status VARCHAR(50) DEFAULT 'active',
    assigned_project_manager VARCHAR(255),
    assigned_installer VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create project lifecycle stages lookup table
CREATE TABLE IF NOT EXISTS project_lifecycle_stages (
    id INTEGER PRIMARY KEY,
    stage_name VARCHAR(100) NOT NULL,
    stage_description TEXT,
    typical_duration_days INTEGER,
    requires_approval BOOLEAN DEFAULT FALSE,
    auto_sms_template VARCHAR(50),
    sort_order INTEGER
);

-- Insert the 12 lifecycle stages
INSERT INTO project_lifecycle_stages (id, stage_name, stage_description, typical_duration_days, requires_approval, auto_sms_template, sort_order) VALUES
(1, 'Notice to Proceed', 'Contract signed, project officially started', 1, TRUE, 'project_started', 1),
(2, 'Site Survey & Engineering', 'Site assessment and system design', 7, FALSE, 'survey_scheduled', 2),
(3, 'Permit Application', 'Submitting permits to local authorities', 3, FALSE, 'permits_submitted', 3),
(4, 'Permit Approval', 'Waiting for permit approval', 14, TRUE, 'permits_approved', 4),
(5, 'Material Procurement', 'Ordering and receiving equipment', 10, FALSE, 'materials_ordered', 5),
(6, 'Installation Scheduling', 'Scheduling installation crew and date', 7, FALSE, 'installation_scheduled', 6),
(7, 'Installation Start', 'Installation crew arrives on-site', 1, FALSE, 'installation_started', 7),
(8, 'Installation Complete', 'System physically installed', 2, TRUE, 'installation_complete', 8),
(9, 'Electrical Inspection', 'Local electrical inspection', 5, TRUE, 'inspection_passed', 9),
(10, 'Utility Interconnection', 'Utility company connection process', 10, FALSE, 'utility_submitted', 10),
(11, 'System Commissioning', 'Final system testing and activation', 2, FALSE, 'system_commissioned', 11),
(12, 'PTO Approval', 'Permission to Operate - project complete', 7, TRUE, 'project_complete', 12)
ON CONFLICT (id) DO NOTHING;

-- Create project stage history table
CREATE TABLE IF NOT EXISTS project_stage_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    stage_id INTEGER REFERENCES project_lifecycle_stages(id),
    entered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_days INTEGER,
    notes TEXT,
    completed_by VARCHAR(255),
    auto_advanced BOOLEAN DEFAULT FALSE,
    sms_sent BOOLEAN DEFAULT FALSE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_current_stage ON projects(current_stage);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(overall_status);
CREATE INDEX IF NOT EXISTS idx_project_stage_history_project_id ON project_stage_history(project_id);

-- DISABLE RLS entirely for development - this will show "unrestricted" in Supabase
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_stage_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_lifecycle_stages DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies (they won't be needed with RLS disabled)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable all for authenticated users on project_stage_history" ON project_stage_history;

-- Note: RLS is completely disabled for development
-- In production, you should enable RLS and create appropriate policies

-- Grant necessary permissions
GRANT ALL ON projects TO authenticated;
GRANT ALL ON project_lifecycle_stages TO authenticated;
GRANT ALL ON project_stage_history TO authenticated;

-- Output success message
SELECT 'Database setup completed successfully! You can now import your Excel projects.' as message;
