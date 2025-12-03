-- ============================================================================
-- QUANTUM SOLAR - FIX #5 EMAIL LOGO ATTRIBUTES
-- Purpose: Fix logo in #5 emails - they use HTML attributes not CSS styles
-- Current: width="150" height="50"
-- Target: width="200" (remove height to maintain aspect ratio)
-- ============================================================================

-- Calculator EN - Final Reminder (#5)
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'width="150" height="50"',
    'width="200"'
  ),
  updated_at = NOW()
WHERE id = '33d8c5a9-6341-4417-9a3f-df19a52b8f46';

-- Calculator ES - Último Recordatorio (#5)
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'width="150" height="50"',
    'width="200"'
  ),
  updated_at = NOW()
WHERE id = '57748d80-337c-4dca-bda5-d0637047df4a';

-- Splash EN - Limited Time Offer (#5)
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'width="150" height="50"',
    'width="200"'
  ),
  updated_at = NOW()
WHERE id = '6af5add6-5413-4b69-9572-0aaefd4843a7';

-- Splash ES - Oferta Por Tiempo Limitado (#5)
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'width="150" height="50"',
    'width="200"'
  ),
  updated_at = NOW()
WHERE id = '84f73b3a-8625-4cb0-bc52-aaf95f3ca464';

-- Confirmation
DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'EMAIL #5 LOGO ATTRIBUTES FIXED';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Changed: width="150" height="50" -> width="200"';
  RAISE NOTICE 'Templates: Calculator EN/ES #5, Splash EN/ES #5';
  RAISE NOTICE '============================================================================';
END $$;
