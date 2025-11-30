-- Migration: Create Base Tables for CRM
-- Date: 2025-01-19
-- Description: Creates the core tables if they don't exist

-- ============================================
-- ENABLE EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- LEADS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,

  -- Contact information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,

  -- Address information
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  location TEXT,

  -- Lead management
  status TEXT DEFAULT 'new',
  assigned_to TEXT,
  source_campaign TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Additional fields
  notes TEXT,
  electric_bill DECIMAL(10, 2)
);

-- Create indexes for leads
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at_desc ON leads(created_at DESC);

-- ============================================
-- PROJECTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

  -- Customer information
  customer_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_code TEXT,

  -- Project management
  current_stage INTEGER DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  estimated_completion_date TIMESTAMPTZ,

  -- Additional fields
  project_notes TEXT
);

-- Create indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_lead_id ON projects(lead_id);
CREATE INDEX IF NOT EXISTS idx_projects_current_stage_idx ON projects(current_stage);
CREATE INDEX IF NOT EXISTS idx_projects_created_at_desc ON projects(created_at DESC);

-- ============================================
-- CANDIDATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,

  -- Application details
  position TEXT NOT NULL,
  status TEXT DEFAULT 'applied',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  applied_at TIMESTAMPTZ DEFAULT NOW(),

  -- Additional fields
  notes TEXT
);

-- Create indexes for candidates
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_status_idx ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at_desc ON candidates(created_at DESC);

-- ============================================
-- EMAIL CAMPAIGNS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EMAIL TEMPLATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  subject_template TEXT NOT NULL,
  html_template TEXT NOT NULL,
  text_template TEXT,
  variables TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EMAIL SEQUENCES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE,
  send_order INTEGER NOT NULL,
  send_delay_minutes INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CAMPAIGN ENROLLMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS campaign_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  current_sequence INTEGER DEFAULT 0,
  next_send_date TIMESTAMPTZ,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ
);

-- ============================================
-- CONTACT SUBMISSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- UPDATE TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_leads_updated_at') THEN
    CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_projects_updated_at') THEN
    CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_candidates_updated_at') THEN
    CREATE TRIGGER update_candidates_updated_at
    BEFORE UPDATE ON candidates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================
-- ROW LEVEL SECURITY (Optional - enable as needed)
-- ============================================

-- Uncomment these if you want to enable RLS
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE leads IS 'Solar installation leads from various sources';
COMMENT ON TABLE projects IS 'Active solar installation projects';
COMMENT ON TABLE candidates IS 'Job applicants and candidates';
COMMENT ON TABLE email_campaigns IS 'Automated email drip campaigns';
COMMENT ON TABLE email_templates IS 'Reusable email templates';
COMMENT ON TABLE email_sequences IS 'Email sequences within campaigns';

-- Base tables created successfully
