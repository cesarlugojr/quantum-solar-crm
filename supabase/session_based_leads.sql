-- Session-Based Lead Tracking Migration
-- Adds session_id column and implements UPSERT logic to prevent duplicate leads
-- while maintaining abandoned form capture functionality
--
-- This migration allows multiple form steps from the same session to update
-- a single lead record instead of creating duplicates

-- Add session_id column to splash_leads table
ALTER TABLE splash_leads 
ADD COLUMN IF NOT EXISTS session_id VARCHAR(100);

-- Add TCPA consent tracking columns
ALTER TABLE splash_leads 
ADD COLUMN IF NOT EXISTS tcpa_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMPTZ;

-- Create index for session_id for efficient lookups
CREATE INDEX IF NOT EXISTS idx_splash_leads_session_id ON splash_leads(session_id);

-- Create unique constraint on session_id to prevent duplicates
-- Note: We use WHERE clause to only apply constraint to non-null session_ids
CREATE UNIQUE INDEX IF NOT EXISTS idx_splash_leads_session_id_unique 
ON splash_leads(session_id) 
WHERE session_id IS NOT NULL;

-- Update the analytics view to include session-based metrics
DROP VIEW IF EXISTS splash_leads_analytics;
CREATE OR REPLACE VIEW splash_leads_analytics AS
SELECT 
    DATE(created_at) as date,
    COUNT(DISTINCT COALESCE(session_id, id::text)) as unique_sessions,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE is_partial = false) as completed_submissions,
    COUNT(*) FILTER (WHERE is_partial = true) as partial_submissions,
    COUNT(DISTINCT session_id) FILTER (WHERE session_id IS NOT NULL) as sessions_with_id,
    COUNT(*) FILTER (WHERE homeowner_status = 'no') as disqualified_homeowner,
    COUNT(*) FILTER (WHERE credit_score = 'below650') as disqualified_credit,
    COUNT(*) FILTER (WHERE shading = 'heavy') as disqualified_shading,
    COUNT(*) FILTER (WHERE is_partial = false AND homeowner_status = 'yes' 
                     AND credit_score = '650+' AND shading = 'none') as qualified_leads,
    COUNT(*) FILTER (WHERE tcpa_consent = true) as tcpa_consented_leads,
    COUNT(*) FILTER (WHERE sms_consent = true) as sms_consented_leads
FROM splash_leads
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Create a function to handle session-based upsert
CREATE OR REPLACE FUNCTION upsert_splash_lead(
    p_session_id VARCHAR(100),
    p_first_name VARCHAR(100),
    p_last_name VARCHAR(100),
    p_phone VARCHAR(20),
    p_email VARCHAR(255),
    p_street_address VARCHAR(500),
    p_city VARCHAR(100),
    p_state VARCHAR(50),
    p_zip_code VARCHAR(10),
    p_utility_company VARCHAR(200),
    p_homeowner_status VARCHAR(10),
    p_credit_score VARCHAR(20),
    p_shading VARCHAR(20),
    p_is_partial BOOLEAN,
    p_current_step INTEGER,
    p_completed_at TIMESTAMPTZ,
    p_tcpa_consent BOOLEAN,
    p_sms_consent BOOLEAN
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    lead_id UUID;
BEGIN
    -- Attempt to update existing record
    UPDATE splash_leads
    SET 
        first_name = COALESCE(p_first_name, first_name),
        last_name = COALESCE(p_last_name, last_name),
        phone = COALESCE(p_phone, phone),
        email = COALESCE(p_email, email),
        street_address = COALESCE(p_street_address, street_address),
        city = COALESCE(p_city, city),
        state = COALESCE(p_state, state),
        zip_code = COALESCE(p_zip_code, zip_code),
        utility_company = COALESCE(p_utility_company, utility_company),
        homeowner_status = COALESCE(p_homeowner_status, homeowner_status),
        credit_score = COALESCE(p_credit_score, credit_score),
        shading = COALESCE(p_shading, shading),
        is_partial = p_is_partial,
        current_step = GREATEST(COALESCE(current_step, 0), COALESCE(p_current_step, 0)),
        completed_at = COALESCE(p_completed_at, completed_at),
        tcpa_consent = COALESCE(p_tcpa_consent, tcpa_consent),
        sms_consent = COALESCE(p_sms_consent, sms_consent),
        consent_timestamp = CASE 
            WHEN (p_tcpa_consent = true OR p_sms_consent = true) AND consent_timestamp IS NULL 
            THEN NOW() 
            ELSE consent_timestamp 
        END,
        -- Update timestamps
        created_at = COALESCE(created_at, NOW()) -- Keep original if exists
    WHERE session_id = p_session_id
    RETURNING id INTO lead_id;
    
    -- If no existing record, insert new one
    IF NOT FOUND THEN
        INSERT INTO splash_leads (
            session_id, first_name, last_name, phone, email,
            street_address, city, state, zip_code, utility_company,
            homeowner_status, credit_score, shading, is_partial, current_step,
            completed_at, tcpa_consent, sms_consent, consent_timestamp,
            form_type, source, created_at
        )
        VALUES (
            p_session_id, p_first_name, p_last_name, p_phone, p_email,
            p_street_address, p_city, p_state, p_zip_code, p_utility_company,
            p_homeowner_status, p_credit_score, p_shading, p_is_partial, p_current_step,
            p_completed_at, p_tcpa_consent, p_sms_consent,
            CASE WHEN (p_tcpa_consent = true OR p_sms_consent = true) THEN NOW() ELSE NULL END,
            'ameren_illinois_splash', 'splash_page', NOW()
        )
        RETURNING id INTO lead_id;
    END IF;
    
    RETURN lead_id;
END;
$$;

-- Add helpful comments
COMMENT ON COLUMN splash_leads.session_id IS 'Unique session ID to track form progression and prevent duplicates';
COMMENT ON COLUMN splash_leads.tcpa_consent IS 'Whether user consented to marketing communications per TCPA';
COMMENT ON COLUMN splash_leads.sms_consent IS 'Whether user consented to SMS communications';
COMMENT ON COLUMN splash_leads.consent_timestamp IS 'When user provided consent for tracking compliance';

COMMENT ON FUNCTION upsert_splash_lead IS 'Handles session-based lead updates to prevent duplicate entries while preserving abandoned form tracking';

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION upsert_splash_lead TO service_role;
GRANT EXECUTE ON FUNCTION upsert_splash_lead TO authenticated;
