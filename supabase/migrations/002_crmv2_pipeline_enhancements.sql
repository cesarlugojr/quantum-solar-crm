-- Migration: CRMv2 Pipeline Enhancements
-- Date: 2025-01-29
-- Description: Adds opportunities table, status system, and detailed project tracking

-- ============================================
-- SPLASH_LEADS TABLE EXTENSIONS
-- ============================================

-- Add status tracking columns to splash_leads
ALTER TABLE splash_leads
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'new',
ADD COLUMN IF NOT EXISTS status_detail VARCHAR(100),
ADD COLUMN IF NOT EXISTS drip_campaign_status VARCHAR(50) DEFAULT 'not_enrolled',
ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS assigned_to UUID,
ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS appointment_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS lost_reason VARCHAR(100),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_splash_leads_status ON splash_leads(status);
CREATE INDEX IF NOT EXISTS idx_splash_leads_status_detail ON splash_leads(status_detail);
CREATE INDEX IF NOT EXISTS idx_splash_leads_drip_status ON splash_leads(drip_campaign_status);
CREATE INDEX IF NOT EXISTS idx_splash_leads_assigned ON splash_leads(assigned_to);

-- Add comments for documentation
COMMENT ON COLUMN splash_leads.status IS 'Main lead status: new, contacted, appointment_scheduled, lead_lost';
COMMENT ON COLUMN splash_leads.status_detail IS 'Sub-status detail: phone_call, texted_back, emailed_back, left_message_text, left_message_voicemail, dnc, renter, exhausted, too_much_shading, other';
COMMENT ON COLUMN splash_leads.drip_campaign_status IS 'Drip campaign enrollment: not_enrolled, enrolled, paused, completed, unsubscribed';
COMMENT ON COLUMN splash_leads.status_history IS 'JSON array of status change history for audit trail';

-- ============================================
-- OPPORTUNITIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES splash_leads(id) ON DELETE SET NULL,

  -- Contact info (copied from lead for quick access)
  customer_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  county TEXT,

  -- Opportunity tracking
  status VARCHAR(50) DEFAULT 'appointment_scheduled',
  status_detail VARCHAR(100),
  lost_reason VARCHAR(100),

  -- Appointment details
  appointment_date TIMESTAMPTZ,
  appointment_type VARCHAR(50), -- 'initial', 'follow_up'
  appointment_notes TEXT,

  -- Solar assessment
  utility_company VARCHAR(255),
  average_monthly_bill DECIMAL(10,2),
  system_size_kw DECIMAL(10,2),
  estimated_monthly_savings DECIMAL(10,2),
  proposal_amount DECIMAL(12,2),
  credit_score VARCHAR(50),

  -- Assignment
  assigned_to UUID,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ, -- When converted to project
  project_id UUID, -- Reference to created project

  -- History
  status_history JSONB DEFAULT '[]'::jsonb,

  -- Notes
  notes TEXT
);

-- Create indexes for opportunities
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_lead_id ON opportunities(lead_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_assigned ON opportunities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_opportunities_appointment ON opportunities(appointment_date);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON opportunities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_project_id ON opportunities(project_id);

-- Add comments
COMMENT ON TABLE opportunities IS 'Opportunities created from qualified leads with scheduled appointments';
COMMENT ON COLUMN opportunities.status IS 'Opportunity status: appointment_scheduled, followup_needed, followup_booked, sale, opportunity_lost';
COMMENT ON COLUMN opportunities.status_detail IS 'Detailed status or reason for lost opportunities';
COMMENT ON COLUMN opportunities.lost_reason IS 'Reason for lost opportunity: failed_credit, needs_to_think, moving, too_much_shading, other';

-- ============================================
-- PROJECTS TABLE EXTENSIONS
-- ============================================

-- Add detailed stage tracking columns
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS main_stage VARCHAR(50) DEFAULT 'site_survey',
ADD COLUMN IF NOT EXISTS sub_stage VARCHAR(50) DEFAULT 'pending',

-- Site Survey dates
ADD COLUMN IF NOT EXISTS site_survey_scheduled_date DATE,
ADD COLUMN IF NOT EXISTS site_survey_completed_date DATE,

-- Design dates
ADD COLUMN IF NOT EXISTS design_started_date DATE,
ADD COLUMN IF NOT EXISTS design_completed_date DATE,

-- Permitting dates (already have some, add missing)
ADD COLUMN IF NOT EXISTS interconnection_submitted_date DATE,
ADD COLUMN IF NOT EXISTS permitting_submitted_date DATE,
ADD COLUMN IF NOT EXISTS interconnection_approved_date DATE,
ADD COLUMN IF NOT EXISTS permitting_approved_date DATE,

-- Installation dates (installation_date already exists, add scheduled)
ADD COLUMN IF NOT EXISTS installation_scheduled_date DATE,
ADD COLUMN IF NOT EXISTS installation_complete_date DATE,

-- Inspection dates
ADD COLUMN IF NOT EXISTS inspection_scheduled_date DATE,
ADD COLUMN IF NOT EXISTS inspection_complete_date DATE,

-- PTO dates (pto_date already exists, add submitted)
ADD COLUMN IF NOT EXISTS pto_submitted_date DATE,
ADD COLUMN IF NOT EXISTS pto_approved_date DATE,

-- Project Complete
ADD COLUMN IF NOT EXISTS project_complete_date DATE,

-- Adders (for reports)
ADD COLUMN IF NOT EXISTS has_mpu BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_battery BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_trench BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS adders JSONB DEFAULT '[]'::jsonb,

-- Contact info
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS county TEXT,

-- Stage history
ADD COLUMN IF NOT EXISTS stage_history JSONB DEFAULT '[]'::jsonb;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_projects_opportunity_id ON projects(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_projects_main_stage ON projects(main_stage);
CREATE INDEX IF NOT EXISTS idx_projects_sub_stage ON projects(sub_stage);
CREATE INDEX IF NOT EXISTS idx_projects_permitting_approved ON projects(permitting_approved_date);
CREATE INDEX IF NOT EXISTS idx_projects_installation_scheduled ON projects(installation_scheduled_date);
CREATE INDEX IF NOT EXISTS idx_projects_installation_complete ON projects(installation_complete_date);
CREATE INDEX IF NOT EXISTS idx_projects_inspection_complete ON projects(inspection_complete_date);
CREATE INDEX IF NOT EXISTS idx_projects_pto_approved ON projects(pto_approved_date);

-- Add comments
COMMENT ON COLUMN projects.main_stage IS 'Main project stage: site_survey, design, permitting, installation, inspection, pto, complete';
COMMENT ON COLUMN projects.sub_stage IS 'Sub-stage within main stage';
COMMENT ON COLUMN projects.adders IS 'JSON array of project add-ons: [{type: "mpu", cost: 1500}, {type: "battery", cost: 8000}]';

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_opportunities_updated_at') THEN
    CREATE TRIGGER update_opportunities_updated_at
    BEFORE UPDATE ON opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_splash_leads_updated_at') THEN
    CREATE TRIGGER update_splash_leads_updated_at
    BEFORE UPDATE ON splash_leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================
-- HELPER FUNCTIONS FOR STATUS TRACKING
-- ============================================

-- Function to add status history entry for leads
CREATE OR REPLACE FUNCTION add_lead_status_history()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status OR OLD.status_detail IS DISTINCT FROM NEW.status_detail THEN
    NEW.status_history = COALESCE(NEW.status_history, '[]'::jsonb) || jsonb_build_object(
      'timestamp', NOW(),
      'previous_status', OLD.status,
      'new_status', NEW.status,
      'previous_detail', OLD.status_detail,
      'new_detail', NEW.status_detail
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to add status history entry for opportunities
CREATE OR REPLACE FUNCTION add_opportunity_status_history()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status OR OLD.status_detail IS DISTINCT FROM NEW.status_detail THEN
    NEW.status_history = COALESCE(NEW.status_history, '[]'::jsonb) || jsonb_build_object(
      'timestamp', NOW(),
      'previous_status', OLD.status,
      'new_status', NEW.status,
      'previous_detail', OLD.status_detail,
      'new_detail', NEW.status_detail
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to add stage history entry for projects
CREATE OR REPLACE FUNCTION add_project_stage_history()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.main_stage IS DISTINCT FROM NEW.main_stage OR OLD.sub_stage IS DISTINCT FROM NEW.sub_stage THEN
    NEW.stage_history = COALESCE(NEW.stage_history, '[]'::jsonb) || jsonb_build_object(
      'timestamp', NOW(),
      'previous_main_stage', OLD.main_stage,
      'new_main_stage', NEW.main_stage,
      'previous_sub_stage', OLD.sub_stage,
      'new_sub_stage', NEW.sub_stage
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create history triggers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_lead_status_history') THEN
    CREATE TRIGGER trg_lead_status_history
    BEFORE UPDATE ON splash_leads
    FOR EACH ROW
    EXECUTE FUNCTION add_lead_status_history();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_opportunity_status_history') THEN
    CREATE TRIGGER trg_opportunity_status_history
    BEFORE UPDATE ON opportunities
    FOR EACH ROW
    EXECUTE FUNCTION add_opportunity_status_history();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_project_stage_history') THEN
    CREATE TRIGGER trg_project_stage_history
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION add_project_stage_history();
  END IF;
END $$;

-- ============================================
-- MATERIALIZED VIEWS FOR REPORTS
-- ============================================

-- Drop and recreate to ensure latest schema
DROP MATERIALIZED VIEW IF EXISTS mv_adders_breakdown;

CREATE MATERIALIZED VIEW mv_adders_breakdown AS
SELECT
  COUNT(*) FILTER (WHERE has_mpu AND NOT has_battery AND NOT has_trench) AS mpu_only,
  COUNT(*) FILTER (WHERE has_battery AND NOT has_mpu AND NOT has_trench) AS battery_only,
  COUNT(*) FILTER (WHERE has_trench AND NOT has_mpu AND NOT has_battery) AS trench_only,
  COUNT(*) FILTER (WHERE has_mpu AND has_battery AND NOT has_trench) AS mpu_battery,
  COUNT(*) FILTER (WHERE has_mpu AND has_trench AND NOT has_battery) AS mpu_trench,
  COUNT(*) FILTER (WHERE has_battery AND has_trench AND NOT has_mpu) AS battery_trench,
  COUNT(*) FILTER (WHERE has_mpu AND has_battery AND has_trench) AS mpu_battery_trench,
  COUNT(*) FILTER (WHERE NOT has_mpu AND NOT has_battery AND NOT has_trench) AS no_adders,
  COUNT(*) AS total_projects
FROM projects;

-- Average days between stages by month
DROP MATERIALIZED VIEW IF EXISTS mv_average_days_metrics;

CREATE MATERIALIZED VIEW mv_average_days_metrics AS
SELECT
  DATE_TRUNC('month', permitting_approved_date) AS month,
  AVG(installation_scheduled_date - permitting_approved_date) AS avg_days_permit_to_install_scheduled,
  AVG(installation_complete_date - installation_scheduled_date) AS avg_days_install_scheduled_to_complete,
  AVG(inspection_scheduled_date - installation_complete_date) AS avg_days_install_to_inspection,
  AVG(inspection_complete_date - inspection_scheduled_date) AS avg_days_inspection_scheduled_to_complete,
  COUNT(*) AS project_count
FROM projects
WHERE permitting_approved_date IS NOT NULL
GROUP BY DATE_TRUNC('month', permitting_approved_date)
ORDER BY month DESC;

-- Monthly kW permitted
DROP MATERIALIZED VIEW IF EXISTS mv_monthly_kw_permitted;

CREATE MATERIALIZED VIEW mv_monthly_kw_permitted AS
SELECT
  DATE_TRUNC('month', permitting_approved_date) AS month,
  SUM(system_size_kw) AS total_kw,
  COUNT(*) AS project_count,
  AVG(system_size_kw) AS avg_kw_per_project
FROM projects
WHERE permitting_approved_date IS NOT NULL
  AND system_size_kw IS NOT NULL
GROUP BY DATE_TRUNC('month', permitting_approved_date)
ORDER BY month DESC;

-- Create indexes for materialized views
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_average_days_month ON mv_average_days_metrics(month);
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_monthly_kw_month ON mv_monthly_kw_permitted(month);

-- Function to refresh report views
CREATE OR REPLACE FUNCTION refresh_report_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_adders_breakdown;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_average_days_metrics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_kw_permitted;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ENABLE RLS (Optional - uncomment if needed)
-- ============================================

-- ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE opportunities IS 'Opportunities table for tracking appointments and proposals between leads and projects';

-- Migration complete
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor or via supabase db push
-- 2. Verify columns were added: SELECT column_name FROM information_schema.columns WHERE table_name = 'opportunities';
-- 3. Test triggers: UPDATE opportunities SET status = 'followup_needed' WHERE id = 'test-id';
-- 4. Refresh views: SELECT refresh_report_views();
