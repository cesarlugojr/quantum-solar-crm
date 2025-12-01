-- Migration: Standardize lead_type to use plural table names
-- Created: 2025-12-01
-- Purpose: Update lead_type CHECK constraint and values to use plural forms
--          ('splash_leads', 'contact_submissions') to match actual table names
--
-- This fixes inconsistencies between:
-- - Database table names (plural): splash_leads, contact_submissions
-- - lead_type column values (were singular): splash_lead, contact_submission

-- ============================================================================
-- STEP 1: Drop the existing CHECK constraint first
-- ============================================================================

ALTER TABLE campaign_enrollments
DROP CONSTRAINT IF EXISTS campaign_enrollments_lead_type_check;

-- ============================================================================
-- STEP 2: Update existing enrollments to use plural form
-- ============================================================================

UPDATE campaign_enrollments
SET lead_type = 'splash_leads'
WHERE lead_type = 'splash_lead';

UPDATE campaign_enrollments
SET lead_type = 'contact_submissions'
WHERE lead_type = 'contact_submission';

-- ============================================================================
-- STEP 3: Add new CHECK constraint with plural values
-- ============================================================================

ALTER TABLE campaign_enrollments
ADD CONSTRAINT campaign_enrollments_lead_type_check
CHECK (lead_type IN ('splash_leads', 'contact_submissions'));

-- ============================================================================
-- STEP 3: Update email_sends table if it has lead_type column
-- ============================================================================

UPDATE email_sends
SET lead_type = 'splash_leads'
WHERE lead_type = 'splash_lead';

UPDATE email_sends
SET lead_type = 'contact_submissions'
WHERE lead_type = 'contact_submission';

-- Update constraint on email_sends if exists
ALTER TABLE email_sends
DROP CONSTRAINT IF EXISTS email_sends_lead_type_check;

-- ============================================================================
-- STEP 4: Update enroll_lead_in_campaign function to use plural forms
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
    v_normalized_lead_type VARCHAR(50);
BEGIN
    -- Convert text lead_id to UUID
    BEGIN
        v_lead_uuid := p_lead_id::UUID;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Invalid UUID format for lead_id: %', p_lead_id;
    END;

    -- Normalize lead_type to plural form (handle both singular and plural input)
    IF p_lead_type IN ('splash_lead', 'splash_leads') THEN
        v_normalized_lead_type := 'splash_leads';
    ELSIF p_lead_type IN ('contact_submission', 'contact_submissions', 'leads') THEN
        v_normalized_lead_type := 'contact_submissions';
    ELSE
        RAISE EXCEPTION 'Unknown lead type: %', p_lead_type;
    END IF;

    -- Fetch lead email and TCPA consent based on lead type
    IF v_normalized_lead_type = 'splash_leads' THEN
        SELECT email, COALESCE(tcpa_consent, false)
        INTO v_email_address, v_tcpa_consent
        FROM splash_leads
        WHERE id = v_lead_uuid;

    ELSIF v_normalized_lead_type = 'contact_submissions' THEN
        SELECT email, COALESCE(tcpa_consent, false)
        INTO v_email_address, v_tcpa_consent
        FROM contact_submissions
        WHERE id = v_lead_uuid;
    END IF;

    -- Validate email exists
    IF v_email_address IS NULL THEN
        RAISE EXCEPTION 'Lead not found: % / %', p_lead_type, p_lead_id;
    END IF;

    -- Check for existing enrollment
    SELECT * INTO v_enrollment
    FROM campaign_enrollments
    WHERE lead_type = v_normalized_lead_type
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
        v_normalized_lead_type,  -- Always use normalized plural form
        v_lead_uuid,
        v_email_address,
        0,
        'active',
        NOW(),
        v_tcpa_consent,
        NOW(),
        NOW(),
        NOW()
    )
    RETURNING * INTO v_enrollment;

    RETURN NEXT v_enrollment;
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION enroll_lead_in_campaign(VARCHAR, TEXT, UUID) IS 'Enroll a lead in an email drip campaign. Accepts both singular and plural lead_type values but normalizes to plural.';

-- ============================================================================
-- STEP 5: Update auto_enroll_splash_lead trigger function
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
            -- Enroll in paid lead campaign (using plural form)
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
            -- Enroll in organic nurture campaign (using plural form)
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

COMMENT ON FUNCTION auto_enroll_splash_lead IS 'Auto-enroll splash leads in appropriate campaign ONLY if tcpa_consent = TRUE. Uses plural lead_type values.';

-- ============================================================================
-- STEP 6: Update auto_enroll_contact trigger function
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

COMMENT ON FUNCTION auto_enroll_contact IS 'Auto-enroll contact submissions in nurture campaign ONLY if tcpa_consent = TRUE. Uses plural lead_type values.';

-- ============================================================================
-- STEP 7: Update process_email_queue function to use plural forms
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
      AND e.tcpa_consent_given = true
    ORDER BY e.next_send_at ASC
    LIMIT p_batch_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION process_email_queue IS 'Returns emails ready to be sent. lead_type values are now plural (splash_leads, contact_submissions).';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
    v_singular_count INTEGER;
BEGIN
    -- Check for any remaining singular values
    SELECT COUNT(*) INTO v_singular_count
    FROM campaign_enrollments
    WHERE lead_type IN ('splash_lead', 'contact_submission');

    IF v_singular_count = 0 THEN
        RAISE NOTICE '✅ Migration completed: All lead_type values are now plural';
    ELSE
        RAISE WARNING '⚠️ Found % enrollments still using singular lead_type', v_singular_count;
    END IF;
END $$;
