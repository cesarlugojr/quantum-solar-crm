-- Splash Leads Table for Ameren Illinois Promotion
-- Stores both partial and complete form submissions from the splash page
--
-- Features:
-- - Stores all form fields with proper data types
-- - Tracks partial vs complete submissions
-- - Includes metadata for analytics and follow-up
-- - Optimized indexing for common queries

-- Create splash_leads table
CREATE TABLE IF NOT EXISTS splash_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Personal Information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    
    -- Address Information
    street_address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    
    -- Solar Qualification Fields
    utility_company VARCHAR(200),
    homeowner_status VARCHAR(10), -- 'yes' or 'no'
    credit_score VARCHAR(20), -- '650+' or 'below650'
    shading VARCHAR(20), -- 'none' or 'heavy'
    
    -- Form Metadata
    is_partial BOOLEAN DEFAULT false,
    current_step INTEGER, -- For partial submissions
    form_type VARCHAR(50) DEFAULT 'ameren_illinois_splash',
    source VARCHAR(100) DEFAULT 'splash_page',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Additional tracking fields
    ip_address INET,
    user_agent TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    -- Lead management
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'closed'
    assigned_to UUID, -- Reference to user who handles this lead
    notes TEXT,
    follow_up_date DATE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_splash_leads_created_at ON splash_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_splash_leads_email ON splash_leads(email);
CREATE INDEX IF NOT EXISTS idx_splash_leads_phone ON splash_leads(phone);
CREATE INDEX IF NOT EXISTS idx_splash_leads_is_partial ON splash_leads(is_partial);
CREATE INDEX IF NOT EXISTS idx_splash_leads_status ON splash_leads(status);
CREATE INDEX IF NOT EXISTS idx_splash_leads_form_type ON splash_leads(form_type);

-- Create composite index for analytics
CREATE INDEX IF NOT EXISTS idx_splash_leads_analytics 
ON splash_leads(form_type, is_partial, created_at DESC);

-- Add RLS (Row Level Security) policy if needed
-- Enable RLS on the table
ALTER TABLE splash_leads ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role to have full access
CREATE POLICY "Service role has full access to splash_leads" 
ON splash_leads FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Policy for authenticated users (if you have admin panel)
-- CREATE POLICY "Authenticated users can view splash_leads" 
-- ON splash_leads FOR SELECT 
-- TO authenticated 
-- USING (true);

-- Add helpful comments
COMMENT ON TABLE splash_leads IS 'Stores lead data from the Ameren Illinois splash page promotion';
COMMENT ON COLUMN splash_leads.is_partial IS 'True if user abandoned form before completion';
COMMENT ON COLUMN splash_leads.current_step IS 'Last completed step for partial submissions';
COMMENT ON COLUMN splash_leads.homeowner_status IS 'Whether user owns their home (disqualifies if no)';
COMMENT ON COLUMN splash_leads.credit_score IS 'Credit score range (disqualifies if below 650)';
COMMENT ON COLUMN splash_leads.shading IS 'Home shading condition (disqualifies if heavy)';

-- Create a view for qualified leads only
CREATE OR REPLACE VIEW qualified_splash_leads AS
SELECT *
FROM splash_leads
WHERE is_partial = false 
  AND homeowner_status = 'yes'
  AND credit_score = '650+'
  AND shading = 'none';

-- Create a view for analytics
CREATE OR REPLACE VIEW splash_leads_analytics AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_submissions,
    COUNT(*) FILTER (WHERE is_partial = false) as completed_submissions,
    COUNT(*) FILTER (WHERE is_partial = true) as partial_submissions,
    COUNT(*) FILTER (WHERE homeowner_status = 'no') as disqualified_homeowner,
    COUNT(*) FILTER (WHERE credit_score = 'below650') as disqualified_credit,
    COUNT(*) FILTER (WHERE shading = 'heavy') as disqualified_shading,
    COUNT(*) FILTER (WHERE is_partial = false AND homeowner_status = 'yes' 
                     AND credit_score = '650+' AND shading = 'none') as qualified_leads
FROM splash_leads
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON splash_leads TO authenticated;
GRANT SELECT ON qualified_splash_leads TO authenticated;
GRANT SELECT ON splash_leads_analytics TO authenticated;
