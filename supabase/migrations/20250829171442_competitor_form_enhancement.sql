-- Competitor Form Enhancement Migration
-- Adds missing columns for the new competitor-style form structure
-- Supports expanded data collection and better lead qualification

-- Add new columns for competitor-style form
ALTER TABLE splash_leads 
ADD COLUMN IF NOT EXISTS average_monthly_bill INTEGER,
ADD COLUMN IF NOT EXISTS roof_condition VARCHAR(50),
ADD COLUMN IF NOT EXISTS roof_material VARCHAR(50),
ADD COLUMN IF NOT EXISTS home_square_footage INTEGER,
ADD COLUMN IF NOT EXISTS energy_usage_pattern VARCHAR(50),
ADD COLUMN IF NOT EXISTS preferred_contact_time VARCHAR(50),
ADD COLUMN IF NOT EXISTS how_heard_about_us VARCHAR(100),
ADD COLUMN IF NOT EXISTS existing_solar BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hoa_restrictions BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS financing_preference VARCHAR(50),
ADD COLUMN IF NOT EXISTS timeline_preference VARCHAR(50),
ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- Add form variant tracking
ALTER TABLE splash_leads 
ADD COLUMN IF NOT EXISTS form_variant VARCHAR(50) DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS qualification_status VARCHAR(50) DEFAULT 'pending';

-- Update form_type values to distinguish between variants
UPDATE splash_leads 
SET form_type = 'ameren_illinois_competitor'
WHERE form_type = 'ameren_illinois_splash' 
AND created_at > NOW() - INTERVAL '30 days'; -- Only update recent records

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_splash_leads_bill ON splash_leads(average_monthly_bill);
CREATE INDEX IF NOT EXISTS idx_splash_leads_variant ON splash_leads(form_variant);
CREATE INDEX IF NOT EXISTS idx_splash_leads_qualification ON splash_leads(qualification_status);

-- Drop existing function if it exists to avoid conflicts
DROP FUNCTION IF EXISTS upsert_splash_lead CASCADE;

-- Update the upsert function to handle new fields
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
    p_average_monthly_bill INTEGER DEFAULT NULL,
    p_preferred_contact_time VARCHAR(50) DEFAULT NULL,
    p_form_variant VARCHAR(50) DEFAULT 'standard',
    p_is_partial BOOLEAN DEFAULT false,
    p_current_step INTEGER DEFAULT NULL,
    p_completed_at TIMESTAMPTZ DEFAULT NULL,
    p_tcpa_consent BOOLEAN DEFAULT false,
    p_sms_consent BOOLEAN DEFAULT false
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
        average_monthly_bill = COALESCE(p_average_monthly_bill, average_monthly_bill),
        preferred_contact_time = COALESCE(p_preferred_contact_time, preferred_contact_time),
        form_variant = COALESCE(p_form_variant, form_variant),
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
        -- Calculate lead score based on available data
        lead_score = CASE 
            WHEN p_is_partial = false THEN
                COALESCE(
                    (CASE WHEN p_homeowner_status = 'yes' THEN 25 ELSE 0 END) +
                    (CASE WHEN p_credit_score IN ('above-650', '650+') THEN 25 ELSE 
                          CASE WHEN p_credit_score IN ('600-650', 'between-600-and-650') THEN 15 ELSE 0 END END) +
                    (CASE WHEN p_shading IN ('no-shading', 'light-shading') THEN 20 ELSE 
                          CASE WHEN p_shading = 'heavy-shading' THEN 5 ELSE 10 END END) +
                    (CASE WHEN p_average_monthly_bill >= 150 THEN 20 ELSE 
                          CASE WHEN p_average_monthly_bill >= 100 THEN 10 ELSE 5 END END) +
                    (CASE WHEN p_tcpa_consent = true THEN 10 ELSE 0 END),
                    lead_score
                )
            ELSE lead_score
        END,
        -- Update qualification status
        qualification_status = CASE 
            WHEN p_is_partial = false THEN
                CASE 
                    WHEN p_homeowner_status = 'no' THEN 'disqualified_homeowner'
                    WHEN p_credit_score IN ('below-600', 'below600') THEN 'disqualified_credit'
                    WHEN p_shading = 'heavy-shading' THEN 'qualified_conditional'
                    WHEN p_homeowner_status = 'yes' AND p_credit_score IN ('above-650', '650+') 
                         AND p_shading IN ('no-shading', 'light-shading') THEN 'qualified'
                    ELSE 'qualified_conditional'
                END
            ELSE 'pending'
        END
    WHERE session_id = p_session_id
    RETURNING id INTO lead_id;
    
    -- If no existing record, insert new one
    IF NOT FOUND THEN
        INSERT INTO splash_leads (
            session_id, first_name, last_name, phone, email,
            street_address, city, state, zip_code, utility_company,
            homeowner_status, credit_score, shading, average_monthly_bill,
            preferred_contact_time, form_variant, is_partial, current_step,
            completed_at, tcpa_consent, sms_consent, consent_timestamp,
            form_type, source, created_at,
            lead_score, qualification_status
        )
        VALUES (
            p_session_id, p_first_name, p_last_name, p_phone, p_email,
            p_street_address, p_city, p_state, p_zip_code, p_utility_company,
            p_homeowner_status, p_credit_score, p_shading, p_average_monthly_bill,
            p_preferred_contact_time, p_form_variant, p_is_partial, p_current_step,
            p_completed_at, p_tcpa_consent, p_sms_consent,
            CASE WHEN (p_tcpa_consent = true OR p_sms_consent = true) THEN NOW() ELSE NULL END,
            'ameren_illinois_competitor', 'splash_page', NOW(),
            -- Calculate initial lead score
            CASE 
                WHEN p_is_partial = false THEN
                    (CASE WHEN p_homeowner_status = 'yes' THEN 25 ELSE 0 END) +
                    (CASE WHEN p_credit_score IN ('above-650', '650+') THEN 25 ELSE 
                          CASE WHEN p_credit_score IN ('600-650', 'between-600-and-650') THEN 15 ELSE 0 END END) +
                    (CASE WHEN p_shading IN ('no-shading', 'light-shading') THEN 20 ELSE 
                          CASE WHEN p_shading = 'heavy-shading' THEN 5 ELSE 10 END END) +
                    (CASE WHEN p_average_monthly_bill >= 150 THEN 20 ELSE 
                          CASE WHEN p_average_monthly_bill >= 100 THEN 10 ELSE 5 END END) +
                    (CASE WHEN p_tcpa_consent = true THEN 10 ELSE 0 END)
                ELSE 0
            END,
            -- Set initial qualification status
            CASE 
                WHEN p_is_partial = false THEN
                    CASE 
                        WHEN p_homeowner_status = 'no' THEN 'disqualified_homeowner'
                        WHEN p_credit_score IN ('below-600', 'below600') THEN 'disqualified_credit'
                        WHEN p_shading = 'heavy-shading' THEN 'qualified_conditional'
                        WHEN p_homeowner_status = 'yes' AND p_credit_score IN ('above-650', '650+') 
                             AND p_shading IN ('no-shading', 'light-shading') THEN 'qualified'
                        ELSE 'qualified_conditional'
                    END
                ELSE 'pending'
            END
        )
        RETURNING id INTO lead_id;
    END IF;
    
    RETURN lead_id;
END;
$$;

-- Create updated analytics view
DROP VIEW IF EXISTS splash_leads_analytics;
CREATE OR REPLACE VIEW splash_leads_analytics AS
SELECT 
    DATE(created_at) as date,
    form_type,
    form_variant,
    COUNT(DISTINCT COALESCE(session_id, id::text)) as unique_sessions,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE is_partial = false) as completed_submissions,
    COUNT(*) FILTER (WHERE is_partial = true) as partial_submissions,
    COUNT(*) FILTER (WHERE qualification_status = 'qualified') as qualified_leads,
    COUNT(*) FILTER (WHERE qualification_status = 'qualified_conditional') as conditional_leads,
    COUNT(*) FILTER (WHERE qualification_status LIKE 'disqualified%') as disqualified_leads,
    AVG(lead_score) FILTER (WHERE lead_score > 0) as avg_lead_score,
    COUNT(*) FILTER (WHERE tcpa_consent = true) as tcpa_consented_leads,
    COUNT(*) FILTER (WHERE sms_consent = true) as sms_consented_leads,
    AVG(average_monthly_bill) FILTER (WHERE average_monthly_bill IS NOT NULL) as avg_monthly_bill
FROM splash_leads
GROUP BY DATE(created_at), form_type, form_variant
ORDER BY date DESC, form_type, form_variant;

-- Add comments for new columns
COMMENT ON COLUMN splash_leads.average_monthly_bill IS 'Monthly electricity bill amount in USD';
COMMENT ON COLUMN splash_leads.form_variant IS 'Form variant used (standard, competitor, etc.)';
COMMENT ON COLUMN splash_leads.lead_score IS 'Calculated lead quality score (0-100)';
COMMENT ON COLUMN splash_leads.qualification_status IS 'Lead qualification status based on form responses';

-- Grant permissions
GRANT EXECUTE ON FUNCTION upsert_splash_lead TO service_role;
GRANT EXECUTE ON FUNCTION upsert_splash_lead TO authenticated;
GRANT SELECT ON splash_leads_analytics TO authenticated;
