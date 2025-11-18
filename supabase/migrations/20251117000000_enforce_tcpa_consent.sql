-- Migration: Enforce TCPA Consent in Campaign Enrollment
-- Created: 2025-11-17
-- Purpose: Update triggers to only enroll leads who have given TCPA consent
--          CRITICAL: Prevents $1,500/violation penalties

-- ============================================================================
-- Drop existing triggers
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_auto_enroll_splash_lead ON splash_leads;
DROP TRIGGER IF EXISTS trigger_auto_enroll_contact ON contact_submissions;

-- ============================================================================
-- Update auto-enrollment function for splash leads with TCPA check
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_enroll_splash_lead()
RETURNS TRIGGER AS $$
DECLARE
    v_campaign_id UUID;
    v_lead_email VARCHAR(255);
BEGIN
    -- Extract email from the lead
    v_lead_email := NEW.email;

    -- CRITICAL: Only proceed if TCPA consent is TRUE
    IF NEW.tcpa_consent IS NOT TRUE THEN
        RAISE NOTICE 'Skipping enrollment for % - No TCPA consent', v_lead_email;
        RETURN NEW;
    END IF;

    RAISE NOTICE 'TCPA consent verified for %, proceeding with enrollment', v_lead_email;

    -- Determine which campaign to enroll in based on lead source
    -- Paid lead → Campaign 1 (Ameren Illinois Paid Lead Fast Track)
    IF NEW.source = 'paid' OR NEW.form_variant LIKE '%ameren%' THEN
        SELECT id INTO v_campaign_id
        FROM email_campaigns
        WHERE name = 'Ameren Illinois Paid Lead Fast Track'
          AND active = true
        LIMIT 1;

        IF v_campaign_id IS NOT NULL THEN
            -- Enroll in paid lead campaign
            PERFORM enroll_lead_in_campaign(
                'splash_leads',
                NEW.id::text,
                v_campaign_id
            );
            RAISE NOTICE 'Enrolled % in Ameren Illinois Paid Lead Fast Track', v_lead_email;
        END IF;

    -- Organic lead → Campaign 3 (Organic Contact Nurture)
    ELSE
        SELECT id INTO v_campaign_id
        FROM email_campaigns
        WHERE name = 'Organic Contact Nurture'
          AND active = true
        LIMIT 1;

        IF v_campaign_id IS NOT NULL THEN
            -- Enroll in organic nurture campaign
            PERFORM enroll_lead_in_campaign(
                'splash_leads',
                NEW.id::text,
                v_campaign_id
            );
            RAISE NOTICE 'Enrolled % in Organic Contact Nurture', v_lead_email;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION auto_enroll_splash_lead IS 'Auto-enroll splash leads in appropriate campaign ONLY if tcpa_consent = TRUE. TCPA compliance check prevents $1,500/violation penalties.';

-- ============================================================================
-- Update auto-enrollment function for contact submissions with TCPA check
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_enroll_contact()
RETURNS TRIGGER AS $$
DECLARE
    v_campaign_id UUID;
    v_lead_email VARCHAR(255);
BEGIN
    -- Extract email from the contact
    v_lead_email := NEW.email;

    -- CRITICAL: Only proceed if TCPA consent is TRUE
    IF NEW.tcpa_consent IS NOT TRUE THEN
        RAISE NOTICE 'Skipping enrollment for % - No TCPA consent', v_lead_email;
        RETURN NEW;
    END IF;

    RAISE NOTICE 'TCPA consent verified for %, proceeding with enrollment', v_lead_email;

    -- Enroll contact submissions in Organic Contact Nurture campaign
    SELECT id INTO v_campaign_id
    FROM email_campaigns
    WHERE name = 'Organic Contact Nurture'
      AND active = true
    LIMIT 1;

    IF v_campaign_id IS NOT NULL THEN
        PERFORM enroll_lead_in_campaign(
            'contact_submissions',
            NEW.id::text,
            v_campaign_id
        );
        RAISE NOTICE 'Enrolled % in Organic Contact Nurture', v_lead_email;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION auto_enroll_contact IS 'Auto-enroll contact submissions in nurture campaign ONLY if tcpa_consent = TRUE. TCPA compliance check prevents $1,500/violation penalties.';

-- ============================================================================
-- Recreate triggers with TCPA enforcement
-- ============================================================================

CREATE TRIGGER trigger_auto_enroll_splash_lead
    AFTER INSERT ON splash_leads
    FOR EACH ROW
    EXECUTE FUNCTION auto_enroll_splash_lead();

COMMENT ON TRIGGER trigger_auto_enroll_splash_lead ON splash_leads IS 'Trigger auto-enrollment for splash leads with TCPA consent verification';

CREATE TRIGGER trigger_auto_enroll_contact
    AFTER INSERT ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION auto_enroll_contact();

COMMENT ON TRIGGER trigger_auto_enroll_contact ON contact_submissions IS 'Trigger auto-enrollment for contact submissions with TCPA consent verification';

-- ============================================================================
-- Update process_email_queue function to also verify TCPA consent
-- ============================================================================

CREATE OR REPLACE FUNCTION process_email_queue(p_batch_size INTEGER DEFAULT 100)
RETURNS TABLE (
    enrollment_id UUID,
    sequence_id UUID,
    lead_type VARCHAR(50),
    lead_id UUID,
    email_address VARCHAR(255),
    subject TEXT,
    html_template TEXT,
    text_template TEXT,
    template_variables JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id AS enrollment_id,
        s.id AS sequence_id,
        e.lead_type,
        e.lead_id,
        e.email_address,
        t.subject_template AS subject,
        t.html_template,
        t.text_template,
        t.variables AS template_variables
    FROM campaign_enrollments e
    INNER JOIN email_campaigns c ON e.campaign_id = c.id
    INNER JOIN email_sequences s ON c.id = s.campaign_id
        AND s.sequence_order = e.current_step + 1
        AND s.active = true
    INNER JOIN email_templates t ON s.template_id = t.id
        AND t.active = true
    WHERE e.status = 'active'
      AND e.next_send_at IS NOT NULL
      AND e.next_send_at <= NOW()
      AND c.active = true
      -- Additional TCPA safety check
      AND e.tcpa_consent_given = true
    ORDER BY e.next_send_at ASC
    LIMIT p_batch_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION process_email_queue IS 'Returns emails ready to be sent with TCPA consent verification. Called by Vercel Cron job every 15 minutes.';

-- ============================================================================
-- Add TCPA consent tracking to campaign_enrollments if not exists
-- ============================================================================

ALTER TABLE campaign_enrollments
    ADD COLUMN IF NOT EXISTS tcpa_consent_given BOOLEAN DEFAULT false;

COMMENT ON COLUMN campaign_enrollments.tcpa_consent_given IS 'Cached TCPA consent status at time of enrollment. Used as additional safety check in email queue processor.';

-- ============================================================================
-- Update enroll_lead_in_campaign to cache TCPA consent status
-- ============================================================================

CREATE OR REPLACE FUNCTION enroll_lead_in_campaign(
    p_lead_type VARCHAR(50),
    p_lead_id TEXT,
    p_campaign_id UUID
) RETURNS SETOF campaign_enrollments AS $$
DECLARE
    v_lead_uuid UUID;
    v_email_address VARCHAR(255);
    v_tcpa_consent BOOLEAN := false;
    v_enrollment campaign_enrollments%ROWTYPE;
BEGIN
    -- Convert text lead_id to UUID
    BEGIN
        v_lead_uuid := p_lead_id::UUID;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Invalid UUID format for lead_id: %', p_lead_id;
    END;

    -- Fetch lead email and TCPA consent based on lead type
    IF p_lead_type = 'splash_leads' THEN
        SELECT email, COALESCE(tcpa_consent, false)
        INTO v_email_address, v_tcpa_consent
        FROM splash_leads
        WHERE id = v_lead_uuid;

    ELSIF p_lead_type = 'contact_submissions' OR p_lead_type = 'leads' THEN
        SELECT email, COALESCE(tcpa_consent, false)
        INTO v_email_address, v_tcpa_consent
        FROM contact_submissions
        WHERE id = v_lead_uuid;

    ELSE
        RAISE EXCEPTION 'Unknown lead type: %', p_lead_type;
    END IF;

    -- Validate email exists
    IF v_email_address IS NULL THEN
        RAISE EXCEPTION 'Lead not found: % / %', p_lead_type, p_lead_id;
    END IF;

    -- Check for existing enrollment
    SELECT * INTO v_enrollment
    FROM campaign_enrollments
    WHERE lead_type = p_lead_type
      AND lead_id = v_lead_uuid
      AND campaign_id = p_campaign_id;

    -- If already enrolled, return existing enrollment
    IF FOUND THEN
        RETURN NEXT v_enrollment;
        RETURN;
    END IF;

    -- Create new enrollment with TCPA consent cached
    INSERT INTO campaign_enrollments (
        campaign_id,
        lead_type,
        lead_id,
        email_address,
        current_step,
        status,
        next_send_at,
        tcpa_consent_given,
        enrolled_at,
        created_at,
        updated_at
    ) VALUES (
        p_campaign_id,
        p_lead_type,
        v_lead_uuid,
        v_email_address,
        0,
        'active',
        NOW(), -- Send first email immediately
        v_tcpa_consent, -- Cache TCPA consent
        NOW(),
        NOW(),
        NOW()
    )
    RETURNING * INTO v_enrollment;

    RETURN NEXT v_enrollment;
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION enroll_lead_in_campaign IS 'Enroll a lead in an email drip campaign with TCPA consent caching for safety.';

-- ============================================================================
-- Verification Query
-- ============================================================================

-- Run this to verify TCPA enforcement is working:
-- SELECT
--     COUNT(*) as total_enrollments,
--     COUNT(*) FILTER (WHERE tcpa_consent_given = true) as with_consent,
--     COUNT(*) FILTER (WHERE tcpa_consent_given = false) as without_consent
-- FROM campaign_enrollments;
