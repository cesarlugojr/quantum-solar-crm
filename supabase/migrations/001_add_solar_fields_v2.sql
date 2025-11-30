-- Migration: Add Solar-Specific Fields for CRM v2
-- Date: 2025-01-19
-- Description: Extends existing leads and projects tables with solar industry fields

-- ============================================
-- LEADS TABLE EXTENSIONS
-- ============================================

-- Add solar-specific fields to leads table
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS system_size_kw DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS utility_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS average_monthly_bill DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS homeowner_status VARCHAR(50) CHECK (homeowner_status IN ('owner', 'renter', 'other', NULL)),
ADD COLUMN IF NOT EXISTS credit_score VARCHAR(50) CHECK (credit_score IN ('excellent', 'good', 'fair', 'poor', NULL)),
ADD COLUMN IF NOT EXISTS property_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS roof_condition VARCHAR(100),
ADD COLUMN IF NOT EXISTS shading_concerns TEXT,
ADD COLUMN IF NOT EXISTS county VARCHAR(100),
ADD COLUMN IF NOT EXISTS source_medium VARCHAR(100),
ADD COLUMN IF NOT EXISTS source_campaign VARCHAR(255);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leads_system_size ON leads(system_size_kw);
CREATE INDEX IF NOT EXISTS idx_leads_utility_company ON leads(utility_company);
CREATE INDEX IF NOT EXISTS idx_leads_homeowner_status ON leads(homeowner_status);
CREATE INDEX IF NOT EXISTS idx_leads_county ON leads(county);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Add comment for documentation
COMMENT ON COLUMN leads.system_size_kw IS 'Estimated solar system size in kilowatts';
COMMENT ON COLUMN leads.utility_company IS 'Primary utility provider (e.g., Ameren, ComEd)';
COMMENT ON COLUMN leads.average_monthly_bill IS 'Average monthly electric bill in USD';
COMMENT ON COLUMN leads.homeowner_status IS 'Property ownership status: owner, renter, or other';
COMMENT ON COLUMN leads.credit_score IS 'Credit score category: excellent, good, fair, or poor';
COMMENT ON COLUMN leads.county IS 'County location for geographic analytics (e.g., St. Clair County)';

-- ============================================
-- PROJECTS TABLE EXTENSIONS
-- ============================================

-- Add solar-specific fields to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS revenue_type VARCHAR(50) CHECK (revenue_type IN ('goodpwr', 'self_gen', NULL)),
ADD COLUMN IF NOT EXISTS system_size_kw DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS estimated_revenue DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS actual_revenue DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS ahj_jurisdiction VARCHAR(255),
ADD COLUMN IF NOT EXISTS permit_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS utility_account_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS installation_date DATE,
ADD COLUMN IF NOT EXISTS pto_date DATE,
ADD COLUMN IF NOT EXISTS contract_signed_date DATE,
ADD COLUMN IF NOT EXISTS milestone_payments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS panel_count INTEGER,
ADD COLUMN IF NOT EXISTS inverter_type VARCHAR(255),
ADD COLUMN IF NOT EXISTS battery_included BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS financing_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS monthly_payment DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS assigned_installer_id UUID,
ADD COLUMN IF NOT EXISTS project_notes TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_revenue_type ON projects(revenue_type);
CREATE INDEX IF NOT EXISTS idx_projects_system_size ON projects(system_size_kw);
CREATE INDEX IF NOT EXISTS idx_projects_current_stage ON projects(current_stage);
CREATE INDEX IF NOT EXISTS idx_projects_installation_date ON projects(installation_date);
CREATE INDEX IF NOT EXISTS idx_projects_pto_date ON projects(pto_date);
CREATE INDEX IF NOT EXISTS idx_projects_assigned_installer ON projects(assigned_installer_id);
CREATE INDEX IF NOT EXISTS idx_projects_milestone_payments ON projects USING GIN(milestone_payments);

-- Add comments for documentation
COMMENT ON COLUMN projects.revenue_type IS 'Revenue model: goodpwr ($0.60/W) or self_gen ($1.47/W)';
COMMENT ON COLUMN projects.system_size_kw IS 'Actual solar system size in kilowatts';
COMMENT ON COLUMN projects.estimated_revenue IS 'Estimated project revenue in USD';
COMMENT ON COLUMN projects.actual_revenue IS 'Actual project revenue in USD';
COMMENT ON COLUMN projects.ahj_jurisdiction IS 'Authority Having Jurisdiction for permitting';
COMMENT ON COLUMN projects.milestone_payments IS 'JSON array of milestone payment tracking: [{name, percentage, amount, due_date, paid, paid_date}]';
COMMENT ON COLUMN projects.pto_date IS 'Permission to Operate grant date';

-- ============================================
-- CANDIDATES TABLE EXTENSIONS (if needed)
-- ============================================

-- Add role-specific fields to candidates table
ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS desired_role VARCHAR(255),
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS certifications TEXT[],
ADD COLUMN IF NOT EXISTS availability_date DATE,
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS resume_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_candidates_desired_role ON candidates(desired_role);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);

-- ============================================
-- ANALYTICS & REPORTING VIEWS
-- ============================================

-- Create materialized view for revenue analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_revenue_analytics AS
SELECT
  DATE_TRUNC('month', created_at) AS month,
  revenue_type,
  COUNT(*) AS project_count,
  SUM(system_size_kw) AS total_kw,
  SUM(estimated_revenue) AS total_estimated_revenue,
  SUM(actual_revenue) AS total_actual_revenue,
  AVG(system_size_kw) AS avg_system_size,
  AVG(estimated_revenue) AS avg_revenue_per_project
FROM projects
WHERE revenue_type IS NOT NULL
GROUP BY DATE_TRUNC('month', created_at), revenue_type
ORDER BY month DESC, revenue_type;

CREATE INDEX IF NOT EXISTS idx_mv_revenue_analytics_month ON mv_revenue_analytics(month DESC);

-- Create materialized view for pipeline analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_pipeline_analytics AS
SELECT
  current_stage,
  COUNT(*) AS project_count,
  SUM(estimated_revenue) AS total_revenue,
  AVG(EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400) AS avg_days_in_pipeline
FROM projects
GROUP BY current_stage
ORDER BY current_stage;

-- Create materialized view for lead conversion analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_lead_conversion AS
SELECT
  DATE_TRUNC('month', l.created_at) AS month,
  l.status,
  l.county,
  l.utility_company,
  COUNT(*) AS lead_count,
  COUNT(p.id) AS converted_count,
  ROUND((COUNT(p.id)::DECIMAL / NULLIF(COUNT(*), 0) * 100), 2) AS conversion_rate
FROM leads l
LEFT JOIN projects p ON p.lead_id = l.id
GROUP BY DATE_TRUNC('month', l.created_at), l.status, l.county, l.utility_company
ORDER BY month DESC, lead_count DESC;

CREATE INDEX IF NOT EXISTS idx_mv_lead_conversion_month ON mv_lead_conversion(month DESC);

-- ============================================
-- FUNCTIONS FOR CASH FLOW FORECASTING
-- ============================================

-- Function to calculate 13-week cash flow forecast
CREATE OR REPLACE FUNCTION calculate_cash_flow_forecast(
  start_date DATE DEFAULT CURRENT_DATE,
  weeks INTEGER DEFAULT 13
)
RETURNS TABLE (
  week_number INTEGER,
  week_start_date DATE,
  week_end_date DATE,
  expected_inflows DECIMAL(12, 2),
  expected_outflows DECIMAL(12, 2),
  net_cash_flow DECIMAL(12, 2)
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE weeks AS (
    SELECT
      1 AS week_num,
      start_date AS week_start,
      start_date + INTERVAL '6 days' AS week_end
    UNION ALL
    SELECT
      week_num + 1,
      week_end + INTERVAL '1 day',
      week_end + INTERVAL '7 days'
    FROM weeks
    WHERE week_num < weeks
  ),
  milestone_inflows AS (
    SELECT
      w.week_num,
      COALESCE(SUM(
        (milestone->>'amount')::DECIMAL
      ), 0) AS inflows
    FROM weeks w
    LEFT JOIN projects p ON p.current_stage >= 5  -- Contract signed or later
    LEFT JOIN LATERAL jsonb_array_elements(p.milestone_payments) AS milestone ON TRUE
    WHERE (milestone->>'due_date')::DATE BETWEEN w.week_start AND w.week_end
      AND (milestone->>'paid')::BOOLEAN = false
    GROUP BY w.week_num
  )
  SELECT
    w.week_num,
    w.week_start,
    w.week_end,
    COALESCE(mi.inflows, 0),
    0::DECIMAL(12, 2) AS outflows,  -- Placeholder for expenses
    COALESCE(mi.inflows, 0) AS net_flow
  FROM weeks w
  LEFT JOIN milestone_inflows mi ON w.week_num = mi.week_num
  ORDER BY w.week_num;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- REFRESH FUNCTION FOR MATERIALIZED VIEWS
-- ============================================

CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_revenue_analytics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_pipeline_analytics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_lead_conversion;
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job to refresh views (requires pg_cron extension)
-- Uncomment if pg_cron is enabled:
-- SELECT cron.schedule('refresh-analytics', '0 2 * * *', 'SELECT refresh_analytics_views();');

-- ============================================
-- SEED DEFAULT MILESTONE PAYMENT STRUCTURE
-- ============================================

-- Function to generate default milestone payments for a project
CREATE OR REPLACE FUNCTION generate_default_milestones(
  project_id UUID,
  total_amount DECIMAL(12, 2)
)
RETURNS JSONB AS $$
DECLARE
  milestones JSONB;
BEGIN
  milestones := jsonb_build_array(
    jsonb_build_object(
      'name', 'Contract Signing',
      'percentage', 10,
      'amount', ROUND(total_amount * 0.10, 2),
      'due_date', CURRENT_DATE,
      'paid', false
    ),
    jsonb_build_object(
      'name', 'Permits Submitted',
      'percentage', 20,
      'amount', ROUND(total_amount * 0.20, 2),
      'due_date', CURRENT_DATE + INTERVAL '2 weeks',
      'paid', false
    ),
    jsonb_build_object(
      'name', 'Installation Complete',
      'percentage', 40,
      'amount', ROUND(total_amount * 0.40, 2),
      'due_date', CURRENT_DATE + INTERVAL '6 weeks',
      'paid', false
    ),
    jsonb_build_object(
      'name', 'Inspection Passed',
      'percentage', 20,
      'amount', ROUND(total_amount * 0.20, 2),
      'due_date', CURRENT_DATE + INTERVAL '10 weeks',
      'paid', false
    ),
    jsonb_build_object(
      'name', 'PTO Granted',
      'percentage', 10,
      'amount', ROUND(total_amount * 0.10, 2),
      'due_date', CURRENT_DATE + INTERVAL '13 weeks',
      'paid', false
    )
  );

  RETURN milestones;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS & CONSTRAINTS
-- ============================================

-- Trigger to auto-calculate estimated revenue when system size changes
CREATE OR REPLACE FUNCTION calculate_estimated_revenue()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.system_size_kw IS NOT NULL AND NEW.revenue_type IS NOT NULL THEN
    -- GoodPWR: $0.60/W, Self-Gen: $1.47/W (convert kW to W by * 1000)
    IF NEW.revenue_type = 'goodpwr' THEN
      NEW.estimated_revenue := NEW.system_size_kw * 1000 * 0.60;
    ELSIF NEW.revenue_type = 'self_gen' THEN
      NEW.estimated_revenue := NEW.system_size_kw * 1000 * 1.47;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_estimated_revenue
BEFORE INSERT OR UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION calculate_estimated_revenue();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Example: Update existing projects with revenue types
-- UPDATE projects SET revenue_type = 'self_gen', system_size_kw = 8.5 WHERE id = 'your-project-id';

-- Example: Generate milestones for a project
-- UPDATE projects
-- SET milestone_payments = generate_default_milestones(id, estimated_revenue)
-- WHERE id = 'your-project-id';

-- ============================================
-- PERMISSIONS (if using RLS)
-- ============================================

-- Ensure RLS policies cover new columns (existing policies should work)
-- Add specific policies if needed for sensitive columns

-- COMMENT ON EXTENSION pg_cron IS 'Job scheduler for periodic tasks';
-- Note: pg_cron extension comment skipped as it may not be installed

-- Migration complete
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Verify all columns were added: SELECT * FROM information_schema.columns WHERE table_name IN ('leads', 'projects', 'candidates');
-- 3. Test materialized views: SELECT * FROM mv_revenue_analytics LIMIT 10;
-- 4. Test cash flow function: SELECT * FROM calculate_cash_flow_forecast();
