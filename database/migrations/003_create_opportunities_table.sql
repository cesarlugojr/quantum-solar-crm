-- Migration: Create Opportunities Table
-- Purpose: Sales pipeline management between leads and projects
-- Date: 2025-01-19

-- Create opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    custom_id TEXT UNIQUE DEFAULT generate_opportunity_id(),
    lead_id UUID REFERENCES splash_leads(id) ON DELETE CASCADE,
    
    -- Solar system details
    estimated_system_size DECIMAL(8,2),
    estimated_annual_savings DECIMAL(10,2),
    estimated_cost DECIMAL(12,2),
    financing_type TEXT CHECK (financing_type IN ('cash', 'loan', 'lease', 'ppa')),
    
    -- Appointment scheduling
    site_survey_scheduled TIMESTAMP WITH TIME ZONE,
    site_survey_completed TIMESTAMP WITH TIME ZONE,
    proposal_sent_date TIMESTAMP WITH TIME ZONE,
    contract_signed_date TIMESTAMP WITH TIME ZONE,
    
    -- Status and assignment
    status TEXT DEFAULT 'initial_contact',
    assigned_to UUID, -- Will reference profiles table when created
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    probability INTEGER DEFAULT 25 CHECK (probability >= 0 AND probability <= 100),
    
    -- Solar-specific details
    roof_analysis_complete BOOLEAN DEFAULT FALSE,
    shading_analysis_complete BOOLEAN DEFAULT FALSE,
    utility_interconnection_approved BOOLEAN DEFAULT FALSE,
    hoa_approval_required BOOLEAN DEFAULT FALSE,
    hoa_approval_received BOOLEAN DEFAULT FALSE,
    
    -- Financial details
    down_payment_amount DECIMAL(10,2),
    monthly_payment_amount DECIMAL(10,2),
    loan_term_months INTEGER,
    interest_rate DECIMAL(5,3),
    
    -- Communication tracking
    last_contact_date TIMESTAMP WITH TIME ZONE,
    next_follow_up_date TIMESTAMP WITH TIME ZONE,
    contact_attempts INTEGER DEFAULT 0,
    
    -- Notes and documentation
    notes TEXT,
    internal_notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_by UUID, -- Will reference profiles table when created
    updated_by UUID  -- Will reference profiles table when created
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_opportunities_updated_at 
    BEFORE UPDATE ON opportunities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE opportunities IS 'Sales opportunities generated from qualified leads';
COMMENT ON COLUMN opportunities.custom_id IS 'Human-readable ID format: QSOID000001';
COMMENT ON COLUMN opportunities.probability IS 'Probability of closing deal (0-100%)';
COMMENT ON COLUMN opportunities.financing_type IS 'Preferred financing method';
COMMENT ON COLUMN opportunities.status IS 'Current opportunity status in sales pipeline';