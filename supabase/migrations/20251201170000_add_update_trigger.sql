-- Migration: Add UPDATE trigger for auto-enrollment
-- Created: 2025-12-01 17:00
-- Purpose: Fire enrollment when tcpa_consent changes to TRUE on UPDATE

-- The marketing site uses a multi-step form that:
-- 1. Creates a partial lead (INSERT) with tcpa_consent = false
-- 2. Updates the lead (UPDATE) when user completes form with tcpa_consent = true
--
-- Our AFTER INSERT trigger never sees tcpa_consent = true because
-- it's only set to true during the UPDATE phase.

-- ============================================================================
-- Step 1: Create function for UPDATE trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_enroll_splash_lead_on_update()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_campaign_id UUID;
    v_language VARCHAR(2) := 'en';
    v_already_enrolled BOOLEAN;
BEGIN
    -- Only proceed if tcpa_consent changed from false/null to TRUE
    IF NEW.tcpa_consent IS TRUE AND (OLD.tcpa_consent IS NOT TRUE) THEN

        -- Check if already enrolled in any Splash campaign
        SELECT EXISTS (
            SELECT 1 FROM campaign_enrollments ce
            JOIN email_campaigns ec ON ce.campaign_id = ec.id
            WHERE ce.lead_id = NEW.id::text
            AND ec.name LIKE 'Splash Page Lead Nurture%'
        ) INTO v_already_enrolled;

        IF v_already_enrolled THEN
            -- Already enrolled, skip
            RETURN NEW;
        END IF;

        -- Determine language from form_variant
        IF NEW.form_variant IS NOT NULL AND (
           NEW.form_variant ILIKE '%spanish%' OR
           NEW.form_variant ILIKE '%espanol%'
        ) THEN
            v_language := 'es';
        END IF;

        -- Get campaign ID based on language
        IF v_language = 'es' THEN
            SELECT id INTO v_campaign_id
            FROM email_campaigns
            WHERE name = 'Splash Page Lead Nurture (Spanish)'
              AND active = true
            LIMIT 1;
        ELSE
            SELECT id INTO v_campaign_id
            FROM email_campaigns
            WHERE name = 'Splash Page Lead Nurture (English)'
              AND active = true
            LIMIT 1;
        END IF;

        -- Enroll if campaign found
        IF v_campaign_id IS NOT NULL THEN
            INSERT INTO campaign_enrollments (
                campaign_id,
                lead_type,
                lead_id,
                email_address,
                current_step,
                status,
                enrolled_at,
                next_send_at,
                tcpa_consent_given
            ) VALUES (
                v_campaign_id,
                'splash_leads',
                NEW.id::text,
                NEW.email,
                0,
                'active',
                NOW(),
                NOW(),
                true
            )
            ON CONFLICT (campaign_id, lead_id) DO NOTHING;
        END IF;
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Auto-enrollment on update failed for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Step 2: Create UPDATE trigger
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_auto_enroll_splash_lead_on_update ON splash_leads;

CREATE TRIGGER trigger_auto_enroll_splash_lead_on_update
    AFTER UPDATE ON splash_leads
    FOR EACH ROW
    EXECUTE FUNCTION auto_enroll_splash_lead_on_update();

-- ============================================================================
-- Step 3: Verify both triggers exist
-- ============================================================================

DO $$
DECLARE
    insert_trigger_exists BOOLEAN;
    update_trigger_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE c.relname = 'splash_leads'
        AND t.tgname = 'trigger_auto_enroll_splash_lead'
    ) INTO insert_trigger_exists;

    SELECT EXISTS (
        SELECT 1 FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE c.relname = 'splash_leads'
        AND t.tgname = 'trigger_auto_enroll_splash_lead_on_update'
    ) INTO update_trigger_exists;

    RAISE NOTICE 'INSERT trigger exists: %', insert_trigger_exists;
    RAISE NOTICE 'UPDATE trigger exists: %', update_trigger_exists;

    IF NOT update_trigger_exists THEN
        RAISE EXCEPTION 'Failed to create UPDATE trigger!';
    END IF;
END $$;

-- ============================================================================
-- Step 4: Enroll existing leads that have tcpa_consent but weren't enrolled
-- ============================================================================

DO $$
DECLARE
    v_lead RECORD;
    v_campaign_id UUID;
    v_enrolled_count INTEGER := 0;
BEGIN
    -- Get English campaign ID
    SELECT id INTO v_campaign_id
    FROM email_campaigns
    WHERE name = 'Splash Page Lead Nurture (English)'
      AND active = true
    LIMIT 1;

    IF v_campaign_id IS NULL THEN
        RAISE NOTICE 'English campaign not found, skipping backfill';
        RETURN;
    END IF;

    -- Find leads with tcpa_consent that aren't enrolled
    FOR v_lead IN
        SELECT sl.id, sl.email
        FROM splash_leads sl
        WHERE sl.tcpa_consent = true
        AND NOT EXISTS (
            SELECT 1 FROM campaign_enrollments ce
            WHERE ce.lead_id = sl.id::text
            AND ce.campaign_id = v_campaign_id
        )
    LOOP
        INSERT INTO campaign_enrollments (
            campaign_id,
            lead_type,
            lead_id,
            email_address,
            current_step,
            status,
            enrolled_at,
            next_send_at,
            tcpa_consent_given
        ) VALUES (
            v_campaign_id,
            'splash_leads',
            v_lead.id::text,
            v_lead.email,
            0,
            'active',
            NOW(),
            NOW(),
            true
        )
        ON CONFLICT (campaign_id, lead_id) DO NOTHING;

        v_enrolled_count := v_enrolled_count + 1;
    END LOOP;

    RAISE NOTICE '✅ Backfilled % leads with tcpa_consent into campaign', v_enrolled_count;
END $$;
