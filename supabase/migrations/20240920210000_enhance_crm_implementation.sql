-- Enhanced CRM Implementation Migration
-- Implements enhancements from the Complete Implementation Guide

-- 1. Enhance existing contact_submissions table
ALTER TABLE contact_submissions
ADD COLUMN IF NOT EXISTS session_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS source_campaign VARCHAR(100),
ADD COLUMN IF NOT EXISTS qualified_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS assigned_to UUID,
ADD COLUMN IF NOT EXISTS tcpa_consent_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tcpa_consent_ip_address INET,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS referrer_url TEXT,
ADD COLUMN IF NOT EXISTS utm_source VARCHAR(100),
ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(100),
ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(100);

-- 2. Enhance projects table with additional fields from implementation guide
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES contact_submissions(id),
ADD COLUMN IF NOT EXISTS custom_id VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS assigned_to UUID,
ADD COLUMN IF NOT EXISTS sales_rep VARCHAR(255),
ADD COLUMN IF NOT EXISTS installer_crew VARCHAR(255),
ADD COLUMN IF NOT EXISTS contract_signed_date DATE,
ADD COLUMN IF NOT EXISTS installation_date DATE,
ADD COLUMN IF NOT EXISTS completion_date DATE,
ADD COLUMN IF NOT EXISTS current_stage_varchar VARCHAR(50) DEFAULT 'lead';

-- 3. Add constraint for current_stage_varchar
ALTER TABLE projects
ADD CONSTRAINT projects_current_stage_varchar_check
CHECK (current_stage_varchar IN (
    'lead', 'contacted', 'qualified', 'proposal_sent', 'contract_signed',
    'permits_submitted', 'permits_approved', 'installation_scheduled',
    'installation_complete', 'inspection_passed', 'pto_granted'
));

-- 4. Create project_status_history table for audit trail
CREATE TABLE IF NOT EXISTS project_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    previous_stage VARCHAR(50),
    new_stage VARCHAR(50) NOT NULL,
    changed_by UUID,
    change_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create enhanced project_files table
CREATE TABLE IF NOT EXISTS project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    file_url TEXT NOT NULL,
    category VARCHAR(50) CHECK (category IN (
        'contract', 'permit', 'inspection', 'photo', 'utility_bill', 'other'
    )),
    uploaded_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create analytics tracking table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(100) NOT NULL,
    user_id UUID,
    session_id VARCHAR(255),
    event_data JSONB,
    page_url TEXT,
    referrer_url TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create lead conversion funnel table
CREATE TABLE IF NOT EXISTS lead_conversion_funnel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    step_order INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    form_data JSONB,
    conversion_rate DECIMAL(5,2),
    time_spent_seconds INTEGER
);

-- 8. Create team performance tracking table
CREATE TABLE IF NOT EXISTS team_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    leads_assigned INTEGER DEFAULT 0,
    leads_converted INTEGER DEFAULT 0,
    projects_completed INTEGER DEFAULT 0,
    revenue_generated DECIMAL(12,2) DEFAULT 0,
    avg_response_time_hours DECIMAL(8,2),
    customer_satisfaction_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Enhanced RLS policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON projects;

-- Contact submissions: Enhanced access control
CREATE POLICY "contact_submissions_enhanced_access" ON contact_submissions
    FOR ALL TO authenticated
    USING (
        assigned_to = auth.uid() OR
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'sales_manager' OR
        auth.jwt() ->> 'role' = 'sales_rep'
    );

-- Projects: Team-based access control
CREATE POLICY "projects_enhanced_access" ON projects
    FOR ALL TO authenticated
    USING (
        assigned_to = auth.uid() OR
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'project_manager' OR
        (auth.jwt() ->> 'role' = 'sales_rep' AND assigned_to = auth.uid())
    );

-- Project status history: Read access for project team
CREATE POLICY "project_status_history_access" ON project_status_history
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_status_history.project_id
            AND (projects.assigned_to = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
        )
    );

-- Project files: Restricted to project team members
CREATE POLICY "project_files_enhanced_access" ON project_files
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_files.project_id
            AND (projects.assigned_to = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
        )
    );

-- Analytics events: Admin and manager access
CREATE POLICY "analytics_events_access" ON analytics_events
    FOR ALL TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'sales_manager' OR
        user_id = auth.uid()
    );

-- 10. Functions for enhanced project management
CREATE OR REPLACE FUNCTION update_project_stage_enhanced(
    p_project_id UUID,
    p_new_stage VARCHAR(50),
    p_changed_by UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_stage VARCHAR(50);
BEGIN
    -- Get current stage
    SELECT projects.current_stage_varchar INTO current_stage
    FROM projects WHERE id = p_project_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Project not found: %', p_project_id;
    END IF;

    -- Update project stage
    UPDATE projects
    SET current_stage_varchar = p_new_stage,
        updated_at = NOW()
    WHERE id = p_project_id;

    -- Insert history record
    INSERT INTO project_status_history (
        project_id, previous_stage, new_stage, changed_by, change_reason
    ) VALUES (
        p_project_id, current_stage, p_new_stage, p_changed_by, p_reason
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Function to generate custom project IDs
CREATE OR REPLACE FUNCTION generate_project_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    year_part TEXT;
    sequence_part TEXT;
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');
    sequence_part := LPAD(EXTRACT(epoch FROM NOW())::TEXT, 6, '0');
    new_id := 'QS-P-' || year_part || '-' || sequence_part;

    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM projects WHERE custom_id = new_id) LOOP
        sequence_part := LPAD((EXTRACT(epoch FROM NOW()) + random() * 1000)::INTEGER::TEXT, 6, '0');
        new_id := 'QS-P-' || year_part || '-' || sequence_part;
    END LOOP;

    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- 12. Trigger to automatically set custom_id for new projects
CREATE OR REPLACE FUNCTION set_project_custom_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.custom_id IS NULL THEN
        NEW.custom_id := generate_project_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_set_custom_id
    BEFORE INSERT ON projects
    FOR EACH ROW EXECUTE FUNCTION set_project_custom_id();

-- 13. Update timestamps trigger for enhanced tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to relevant tables
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_submissions_updated_at
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. Performance indexes
CREATE INDEX IF NOT EXISTS idx_contact_submissions_session_id ON contact_submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_source_campaign ON contact_submissions(source_campaign);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_qualified_score ON contact_submissions(qualified_score);
CREATE INDEX IF NOT EXISTS idx_projects_custom_id ON projects(custom_id);
CREATE INDEX IF NOT EXISTS idx_projects_current_stage_varchar ON projects(current_stage_varchar);
CREATE INDEX IF NOT EXISTS idx_projects_assigned_to ON projects(assigned_to);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_conversion_funnel_session_id ON lead_conversion_funnel(session_id);

-- 15. Enable RLS on new tables
ALTER TABLE project_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_conversion_funnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_performance ENABLE ROW LEVEL SECURITY;

-- 16. Insert sample data for testing (optional - can be removed in production)
-- This helps verify the migration worked correctly
-- COMMENTED OUT: Removed test data to avoid NOT NULL constraint violations
-- INSERT INTO contact_submissions (
--     name, email, phone, message, address, session_id, source_campaign, qualified_score
-- ) VALUES (
--     'Test Lead', 'test@example.com', '555-123-4567', 'Test message', '123 Test St',
--     'test-session-123', 'website', 85
-- ) ON CONFLICT DO NOTHING;

COMMENT ON TABLE project_status_history IS 'Tracks all project stage changes with audit trail';
COMMENT ON TABLE project_files IS 'Stores project-related documents and files';
COMMENT ON TABLE analytics_events IS 'Tracks user interactions and business events';
COMMENT ON TABLE lead_conversion_funnel IS 'Tracks lead progression through conversion steps';
COMMENT ON TABLE team_performance IS 'Tracks team member performance metrics';