-- Migration: Fix Splash Lead Auto-Enrollment Trigger
-- Created: 2025-12-01 15:00
-- Purpose: Ensure trigger is properly created and enabled

-- ============================================================================
-- Step 1: Drop any existing trigger (clean slate)
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_auto_enroll_splash_lead ON splash_leads;
DROP TRIGGER IF EXISTS auto_enroll_splash_lead_trigger ON splash_leads;

-- ============================================================================
-- Step 2: Ensure the function exists and works
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_enroll_splash_lead()
RETURNS TRIGGER AS $$
DECLARE
    v_campaign_id UUID;
    v_lead_email VARCHAR(255);
    v_language VARCHAR(2) := 'en';
BEGIN
    -- Get email for logging
    v_lead_email := COALESCE(NEW.email, 'no-email');

    -- CRITICAL: Only proceed if TCPA consent is TRUE
    IF NEW.tcpa_consent IS NOT TRUE THEN
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
        PERFORM enroll_lead_in_campaign(
            'splash_leads',
            NEW.id::text,
            v_campaign_id
        );
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Don't fail the insert if enrollment fails
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Step 3: Create the trigger
-- ============================================================================

CREATE TRIGGER trigger_auto_enroll_splash_lead
    AFTER INSERT ON splash_leads
    FOR EACH ROW
    EXECUTE FUNCTION auto_enroll_splash_lead();

-- ============================================================================
-- Step 4: Verify trigger was created
-- ============================================================================

DO $$
DECLARE
    trigger_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE c.relname = 'splash_leads'
        AND t.tgname = 'trigger_auto_enroll_splash_lead'
    ) INTO trigger_exists;

    IF trigger_exists THEN
        RAISE NOTICE '✅ Trigger trigger_auto_enroll_splash_lead created successfully!';
    ELSE
        RAISE EXCEPTION '❌ Failed to create trigger!';
    END IF;
END $$;
