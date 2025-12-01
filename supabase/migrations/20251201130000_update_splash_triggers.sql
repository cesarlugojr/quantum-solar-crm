-- Migration: Update Splash Lead Auto-Enrollment for New Campaigns
-- Created: 2025-12-01
-- Purpose: Update triggers to enroll in new "Splash Page Lead Nurture" campaigns

-- ============================================================================
-- Drop existing trigger
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_auto_enroll_splash_lead ON splash_leads;

-- ============================================================================
-- Update auto-enrollment function for new campaign structure
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_enroll_splash_lead()
RETURNS TRIGGER AS $$
DECLARE
    v_campaign_id UUID;
    v_lead_email VARCHAR(255);
    v_language VARCHAR(2) := 'en'; -- Default to English
BEGIN
    -- Extract email from the lead
    v_lead_email := NEW.email;

    -- CRITICAL: Only proceed if TCPA consent is TRUE
    IF NEW.tcpa_consent IS NOT TRUE THEN
        RAISE NOTICE 'Skipping enrollment for % - No TCPA consent', v_lead_email;
        RETURN NEW;
    END IF;

    RAISE NOTICE 'TCPA consent verified for %, proceeding with enrollment', v_lead_email;

    -- Determine language (look for 'spanish' or 'es' in form_variant or other fields)
    IF NEW.form_variant LIKE '%spanish%'
       OR NEW.form_variant LIKE '%es%'
       OR NEW.form_variant LIKE '%espanol%' THEN
        v_language := 'es';
    END IF;

    -- Enroll in appropriate Splash Page Lead Nurture campaign based on language
    IF v_language = 'es' THEN
        SELECT id INTO v_campaign_id
        FROM email_campaigns
        WHERE name = 'Splash Page Lead Nurture (Spanish)'
          AND active = true
        LIMIT 1;

        IF v_campaign_id IS NOT NULL THEN
            PERFORM enroll_lead_in_campaign(
                'splash_leads',
                NEW.id::text,
                v_campaign_id
            );
            RAISE NOTICE 'Enrolled % in Splash Page Lead Nurture (Spanish)', v_lead_email;
        ELSE
            RAISE NOTICE 'Splash Page Lead Nurture (Spanish) campaign not found or inactive';
        END IF;
    ELSE
        -- Default to English
        SELECT id INTO v_campaign_id
        FROM email_campaigns
        WHERE name = 'Splash Page Lead Nurture (English)'
          AND active = true
        LIMIT 1;

        IF v_campaign_id IS NOT NULL THEN
            PERFORM enroll_lead_in_campaign(
                'splash_leads',
                NEW.id::text,
                v_campaign_id
            );
            RAISE NOTICE 'Enrolled % in Splash Page Lead Nurture (English)', v_lead_email;
        ELSE
            RAISE NOTICE 'Splash Page Lead Nurture (English) campaign not found or inactive';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION auto_enroll_splash_lead IS 'Auto-enroll splash leads in appropriate Splash Page Lead Nurture campaign (EN/ES) ONLY if tcpa_consent = TRUE.';

-- ============================================================================
-- Recreate trigger
-- ============================================================================

CREATE TRIGGER trigger_auto_enroll_splash_lead
    AFTER INSERT ON splash_leads
    FOR EACH ROW
    EXECUTE FUNCTION auto_enroll_splash_lead();

COMMENT ON TRIGGER trigger_auto_enroll_splash_lead ON splash_leads IS 'Trigger auto-enrollment for splash leads in Splash Page Lead Nurture campaigns with TCPA consent verification';

-- ============================================================================
-- Update contact submissions trigger (Solar Calculator leads)
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_auto_enroll_contact ON contact_submissions;

CREATE OR REPLACE FUNCTION auto_enroll_contact()
RETURNS TRIGGER AS $$
DECLARE
    v_campaign_id UUID;
    v_lead_email VARCHAR(255);
    v_language VARCHAR(2) := 'en'; -- Default to English
BEGIN
    -- Extract email from the contact
    v_lead_email := NEW.email;

    -- CRITICAL: Only proceed if TCPA consent is TRUE
    IF NEW.tcpa_consent IS NOT TRUE THEN
        RAISE NOTICE 'Skipping enrollment for % - No TCPA consent', v_lead_email;
        RETURN NEW;
    END IF;

    RAISE NOTICE 'TCPA consent verified for %, proceeding with enrollment', v_lead_email;

    -- Determine language from form data
    IF NEW.form_data::text LIKE '%spanish%'
       OR NEW.form_data::text LIKE '%es%'
       OR NEW.form_data::text LIKE '%espanol%' THEN
        v_language := 'es';
    END IF;

    -- Enroll contact submissions in Solar Calculator Lead Nurture campaign based on language
    IF v_language = 'es' THEN
        SELECT id INTO v_campaign_id
        FROM email_campaigns
        WHERE name = 'Solar Calculator Lead Nurture (Spanish)'
          AND active = true
        LIMIT 1;

        IF v_campaign_id IS NOT NULL THEN
            PERFORM enroll_lead_in_campaign(
                'contact_submissions',
                NEW.id::text,
                v_campaign_id
            );
            RAISE NOTICE 'Enrolled % in Solar Calculator Lead Nurture (Spanish)', v_lead_email;
        ELSE
            RAISE NOTICE 'Solar Calculator Lead Nurture (Spanish) campaign not found or inactive';
        END IF;
    ELSE
        -- Default to English
        SELECT id INTO v_campaign_id
        FROM email_campaigns
        WHERE name = 'Solar Calculator Lead Nurture (English)'
          AND active = true
        LIMIT 1;

        IF v_campaign_id IS NOT NULL THEN
            PERFORM enroll_lead_in_campaign(
                'contact_submissions',
                NEW.id::text,
                v_campaign_id
            );
            RAISE NOTICE 'Enrolled % in Solar Calculator Lead Nurture (English)', v_lead_email;
        ELSE
            RAISE NOTICE 'Solar Calculator Lead Nurture (English) campaign not found or inactive';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION auto_enroll_contact IS 'Auto-enroll contact submissions (Solar Calculator) in appropriate nurture campaign (EN/ES) ONLY if tcpa_consent = TRUE.';

-- ============================================================================
-- Recreate contact trigger
-- ============================================================================

CREATE TRIGGER trigger_auto_enroll_contact
    AFTER INSERT ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION auto_enroll_contact();

COMMENT ON TRIGGER trigger_auto_enroll_contact ON contact_submissions IS 'Trigger auto-enrollment for Solar Calculator leads in nurture campaigns with TCPA consent verification';
