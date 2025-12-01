-- Migration: Fix Trigger Security Context
-- Created: 2025-12-01 16:00
-- Purpose: Ensure trigger can execute enrollment even with RLS

-- The issue: When marketing site inserts using anon key with RLS,
-- the trigger runs in the same security context and can't insert
-- into campaign_enrollments due to RLS policies.

-- Solution: Make the trigger function run with SECURITY DEFINER
-- so it executes as the function owner (postgres) with full access.

-- ============================================================================
-- Step 1: Drop existing trigger
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_auto_enroll_splash_lead ON splash_leads;

-- ============================================================================
-- Step 2: Recreate function with SECURITY DEFINER
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_enroll_splash_lead()
RETURNS TRIGGER
SECURITY DEFINER  -- Run as function owner, not caller
SET search_path = public  -- Required for security definer functions
AS $$
DECLARE
    v_campaign_id UUID;
    v_email VARCHAR(255);
    v_language VARCHAR(2) := 'en';
BEGIN
    -- Get email for logging
    v_email := COALESCE(NEW.email, 'no-email');

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
        -- Insert directly into campaign_enrollments (bypasses RLS due to SECURITY DEFINER)
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
        ON CONFLICT (campaign_id, lead_id) DO NOTHING;  -- Prevent duplicates
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Auto-enrollment failed for %: %', v_email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION auto_enroll_splash_lead() TO anon;
GRANT EXECUTE ON FUNCTION auto_enroll_splash_lead() TO authenticated;

-- ============================================================================
-- Step 3: Recreate trigger
-- ============================================================================

CREATE TRIGGER trigger_auto_enroll_splash_lead
    AFTER INSERT ON splash_leads
    FOR EACH ROW
    EXECUTE FUNCTION auto_enroll_splash_lead();

-- ============================================================================
-- Step 4: Ensure RLS policy allows trigger to insert enrollments
-- ============================================================================

-- Add RLS policy for service role (trigger runs as postgres/service role with SECURITY DEFINER)
DROP POLICY IF EXISTS "Allow trigger to insert enrollments" ON campaign_enrollments;

-- Actually, with SECURITY DEFINER, we don't need RLS policy changes
-- The function runs as postgres which bypasses RLS

-- ============================================================================
-- Step 5: Verify trigger was created
-- ============================================================================

DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE c.relname = 'splash_leads'
    AND t.tgname = 'trigger_auto_enroll_splash_lead';

    IF trigger_count > 0 THEN
        RAISE NOTICE '✅ Trigger created successfully with SECURITY DEFINER';
    ELSE
        RAISE EXCEPTION '❌ Failed to create trigger';
    END IF;
END $$;
