-- Migration: Create Performance Indexes
-- Purpose: Optimize query performance for common CRM operations
-- Date: 2025-01-19

-- Lead management indexes
CREATE INDEX IF NOT EXISTS idx_splash_leads_status_created ON splash_leads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_splash_leads_custom_id ON splash_leads(custom_id);
CREATE INDEX IF NOT EXISTS idx_splash_leads_utility_company ON splash_leads(utility_company);
CREATE INDEX IF NOT EXISTS idx_splash_leads_tcpa_consent ON splash_leads(tcpa_consent) WHERE tcpa_consent = true;
CREATE INDEX IF NOT EXISTS idx_splash_leads_session_id ON splash_leads(session_id);
CREATE INDEX IF NOT EXISTS idx_splash_leads_email_phone ON splash_leads(email, phone);
CREATE INDEX IF NOT EXISTS idx_splash_leads_qualification_status ON splash_leads(qualification_status);
CREATE INDEX IF NOT EXISTS idx_splash_leads_lead_score ON splash_leads(lead_score DESC);

-- Opportunities indexes
CREATE INDEX IF NOT EXISTS idx_opportunities_status_priority ON opportunities(status, priority);
CREATE INDEX IF NOT EXISTS idx_opportunities_custom_id ON opportunities(custom_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_lead_id ON opportunities(lead_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_probability ON opportunities(probability DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_financing_type ON opportunities(financing_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_follow_up_date ON opportunities(next_follow_up_date);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_date ON opportunities(created_at DESC);

-- Project tracking indexes
CREATE INDEX IF NOT EXISTS idx_projects_current_stage ON projects(current_stage);
CREATE INDEX IF NOT EXISTS idx_projects_custom_id ON projects(custom_id);
CREATE INDEX IF NOT EXISTS idx_projects_status_stage ON projects(overall_status, current_stage);
CREATE INDEX IF NOT EXISTS idx_projects_completion_date ON projects(estimated_completion_date);
CREATE INDEX IF NOT EXISTS idx_projects_value ON projects(project_value DESC);
CREATE INDEX IF NOT EXISTS idx_projects_system_size ON projects(system_size_kw DESC);
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(updated_at DESC) 
    WHERE overall_status NOT IN ('complete', 'cancelled');

-- Equipment tracking indexes (already created in previous migration, but ensure they exist)
CREATE INDEX IF NOT EXISTS idx_installation_equipment_project_type ON installation_equipment(project_id, equipment_type);
CREATE INDEX IF NOT EXISTS idx_installation_equipment_serial ON installation_equipment(serial_number);
CREATE INDEX IF NOT EXISTS idx_installation_equipment_warranty ON installation_equipment(warranty_end_date) 
    WHERE warranty_end_date > CURRENT_DATE;

-- Photo management indexes
CREATE INDEX IF NOT EXISTS idx_photo_submissions_project_type ON photo_submissions(project_id, submission_type);
CREATE INDEX IF NOT EXISTS idx_photo_submissions_status ON photo_submissions(status);
CREATE INDEX IF NOT EXISTS idx_photo_submissions_created ON photo_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photo_records_submission ON photo_records(submission_id);
CREATE INDEX IF NOT EXISTS idx_photo_records_filename ON photo_records(file_name);

-- Contact and communication indexes
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bill_uploads_status ON bill_uploads(status);
CREATE INDEX IF NOT EXISTS idx_bill_uploads_lead_id ON bill_uploads(lead_id);

-- Job applications indexes
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_submitted ON job_applications(submitted_at DESC);

-- Project lifecycle indexes
CREATE INDEX IF NOT EXISTS idx_project_stage_history_project ON project_stage_history(project_id, entered_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_stage_history_stage ON project_stage_history(stage_id);
CREATE INDEX IF NOT EXISTS idx_project_stage_history_duration ON project_stage_history(duration_days DESC);

-- Chatbot conversation indexes
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session ON chatbot_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_status ON chatbot_conversations(lead_status);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_capture_ready ON chatbot_conversations(capture_ready) 
    WHERE capture_ready = true;
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_activity ON chatbot_conversations(last_activity_at DESC);

-- Full-text search indexes for improved search functionality
CREATE INDEX IF NOT EXISTS idx_splash_leads_search ON splash_leads USING gin(
    to_tsvector('english', COALESCE(first_name, '') || ' ' || 
    COALESCE(last_name, '') || ' ' || COALESCE(street_address, '') || ' ' ||
    COALESCE(city, '') || ' ' || COALESCE(email, ''))
);

CREATE INDEX IF NOT EXISTS idx_projects_search ON projects USING gin(
    to_tsvector('english', COALESCE(customer_name, '') || ' ' || 
    COALESCE(address, '') || ' ' || COALESCE(notes, ''))
);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_splash_leads_status_score_created ON splash_leads(status, lead_score DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_assigned_status_priority ON opportunities(assigned_to, status, priority);
CREATE INDEX IF NOT EXISTS idx_projects_manager_status_stage ON projects(assigned_project_manager, overall_status, current_stage);

-- Partial indexes for active/pending records only
CREATE INDEX IF NOT EXISTS idx_splash_leads_active_assigned ON splash_leads(assigned_to, created_at DESC) 
    WHERE status IN ('new', 'contacted', 'qualified', 'follow_up');

CREATE INDEX IF NOT EXISTS idx_opportunities_active_probability ON opportunities(probability DESC, created_at DESC) 
    WHERE status NOT IN ('closed_won', 'closed_lost', 'cancelled');

CREATE INDEX IF NOT EXISTS idx_projects_in_progress ON projects(current_stage, estimated_completion_date) 
    WHERE overall_status = 'active';

-- Geographic indexes for location-based queries
CREATE INDEX IF NOT EXISTS idx_splash_leads_location ON splash_leads(state, city);
CREATE INDEX IF NOT EXISTS idx_projects_coordinates ON projects(site_latitude, site_longitude) 
    WHERE site_latitude IS NOT NULL AND site_longitude IS NOT NULL;

-- Add statistics collection for better query planning
ANALYZE splash_leads;
ANALYZE opportunities;
ANALYZE projects;
ANALYZE installation_equipment;
ANALYZE photo_submissions;
ANALYZE photo_records;

-- Comments for documentation
COMMENT ON INDEX idx_splash_leads_search IS 'Full-text search index for leads';
COMMENT ON INDEX idx_projects_search IS 'Full-text search index for projects';
COMMENT ON INDEX idx_splash_leads_active_assigned IS 'Partial index for active leads only';
COMMENT ON INDEX idx_opportunities_active_probability IS 'Partial index for open opportunities only';
COMMENT ON INDEX idx_projects_in_progress IS 'Partial index for active projects only';