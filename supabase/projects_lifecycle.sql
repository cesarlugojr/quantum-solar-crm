-- Projects Lifecycle Management System
-- Comprehensive 12-stage project tracking with automation

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
(12, 'PTO Approval', 'Permission to Operate - project complete', 7, TRUE, 'project_complete', 12);

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

-- Create project documents table
CREATE TABLE IF NOT EXISTS project_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path TEXT,
    uploaded_by VARCHAR(255),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    stage_id INTEGER REFERENCES project_lifecycle_stages(id)
);

-- Create project photos table
CREATE TABLE IF NOT EXISTS project_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    photo_type VARCHAR(100) NOT NULL, -- 'before', 'during', 'after', 'inspection'
    file_path TEXT NOT NULL,
    caption TEXT,
    taken_by VARCHAR(255),
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    stage_id INTEGER REFERENCES project_lifecycle_stages(id),
    gps_latitude DECIMAL(10, 8),
    gps_longitude DECIMAL(11, 8)
);

-- Create project automation rules table
CREATE TABLE IF NOT EXISTS project_automation_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stage_id INTEGER REFERENCES project_lifecycle_stages(id),
    trigger_condition VARCHAR(100) NOT NULL, -- 'time_elapsed', 'document_uploaded', 'manual_advance'
    trigger_value INTEGER, -- days for time_elapsed
    action_type VARCHAR(100) NOT NULL, -- 'send_sms', 'advance_stage', 'send_email', 'create_task'
    action_config JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert automation rules
INSERT INTO project_automation_rules (stage_id, trigger_condition, trigger_value, action_type, action_config) VALUES
-- Auto-advance stages with time limits
(1, 'time_elapsed', 2, 'advance_stage', '{"auto_advance": true}'),
(3, 'time_elapsed', 5, 'send_sms', '{"template": "permit_followup", "message": "Your permit application is in progress. We''ll notify you once approved!"}'),
(4, 'document_uploaded', NULL, 'advance_stage', '{"auto_advance": true, "document_type": "permit_approval"}'),
(6, 'time_elapsed', 10, 'send_sms', '{"template": "installation_reminder", "message": "Your installation is coming up! We''ll contact you 24 hours before to confirm."}'),
(8, 'document_uploaded', NULL, 'send_sms', '{"template": "inspection_scheduled", "document_type": "installation_complete"}'),
(12, 'manual_advance', NULL, 'send_sms', '{"template": "project_celebration", "message": "🎉 Congratulations! Your solar system is now producing clean energy and saving you money!"}');

-- Create function to advance project stages
CREATE OR REPLACE FUNCTION advance_project_stage(project_uuid UUID, new_stage_id INTEGER, notes_text TEXT DEFAULT NULL, advanced_by VARCHAR(255) DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    current_stage_id INTEGER;
    stage_record RECORD;
BEGIN
    -- Get current stage
    SELECT current_stage INTO current_stage_id FROM projects WHERE id = project_uuid;
    
    -- Validate stage advancement
    IF new_stage_id <= current_stage_id THEN
        RAISE EXCEPTION 'Cannot advance to previous or same stage';
    END IF;
    
    -- Complete current stage in history
    UPDATE project_stage_history 
    SET completed_at = CURRENT_TIMESTAMP,
        duration_days = EXTRACT(DAY FROM (CURRENT_TIMESTAMP - entered_at)),
        completed_by = advanced_by,
        notes = COALESCE(notes_text, notes)
    WHERE project_id = project_uuid AND stage_id = current_stage_id AND completed_at IS NULL;
    
    -- Update project current stage
    UPDATE projects 
    SET current_stage = new_stage_id, updated_at = CURRENT_TIMESTAMP 
    WHERE id = project_uuid;
    
    -- Add new stage to history
    INSERT INTO project_stage_history (project_id, stage_id, notes, completed_by)
    VALUES (project_uuid, new_stage_id, notes_text, advanced_by);
    
    -- Get stage info for automation
    SELECT * INTO stage_record FROM project_lifecycle_stages WHERE id = new_stage_id;
    
    -- Mark project as complete if at final stage
    IF new_stage_id = 12 THEN
        UPDATE projects SET overall_status = 'complete', actual_completion_date = CURRENT_DATE WHERE id = project_uuid;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to check for automated stage advancements
CREATE OR REPLACE FUNCTION process_project_automation()
RETURNS void AS $$
DECLARE
    project_record RECORD;
    rule_record RECORD;
    stage_history_record RECORD;
BEGIN
    -- Loop through active projects
    FOR project_record IN SELECT * FROM projects WHERE overall_status = 'active' LOOP
        
        -- Get current stage history
        SELECT * INTO stage_history_record 
        FROM project_stage_history 
        WHERE project_id = project_record.id 
        AND stage_id = project_record.current_stage 
        AND completed_at IS NULL
        ORDER BY entered_at DESC LIMIT 1;
        
        -- Check automation rules for current stage
        FOR rule_record IN 
            SELECT * FROM project_automation_rules 
            WHERE stage_id = project_record.current_stage 
            AND is_active = TRUE 
        LOOP
            -- Time-based automation
            IF rule_record.trigger_condition = 'time_elapsed' THEN
                IF stage_history_record.entered_at + INTERVAL '1 day' * rule_record.trigger_value <= CURRENT_TIMESTAMP THEN
                    IF rule_record.action_type = 'advance_stage' AND project_record.current_stage < 12 THEN
                        PERFORM advance_project_stage(project_record.id, project_record.current_stage + 1, 'Auto-advanced by system', 'system');
                    END IF;
                END IF;
            END IF;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_current_stage ON projects(current_stage);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(overall_status);
CREATE INDEX IF NOT EXISTS idx_project_stage_history_project_id ON project_stage_history(project_id);
CREATE INDEX IF NOT EXISTS idx_project_photos_project_id ON project_photos(project_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON project_documents(project_id);

-- Enable RLS (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_photos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic - can be expanded based on needs)
CREATE POLICY "Enable read access for authenticated users" ON projects
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON projects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON projects
FOR UPDATE USING (auth.role() = 'authenticated');
