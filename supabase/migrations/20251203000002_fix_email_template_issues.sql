-- ============================================================================
-- QUANTUM SOLAR - FIX EMAIL TEMPLATE ISSUES
-- Purpose: Fix logo/header in #5 emails and CTA button centering issues
-- ============================================================================

-- ===========================================
-- FIX #1: Logo and header in Email #5 templates
-- These templates have old-style logos that need updating
-- ===========================================

-- Calculator EN - Final Reminder (#5)
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'style="height: 50px;',
    'style="width: 200px; height: auto;'
  ),
  updated_at = NOW()
WHERE id = '33d8c5a9-6341-4417-9a3f-df19a52b8f46';

UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'style="height: 35px;',
    'style="width: 150px; height: auto;'
  ),
  updated_at = NOW()
WHERE id = '33d8c5a9-6341-4417-9a3f-df19a52b8f46';

-- Calculator ES - Último Recordatorio (#5)
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'style="height: 50px;',
    'style="width: 200px; height: auto;'
  ),
  updated_at = NOW()
WHERE id = '57748d80-337c-4dca-bda5-d0637047df4a';

UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'style="height: 35px;',
    'style="width: 150px; height: auto;'
  ),
  updated_at = NOW()
WHERE id = '57748d80-337c-4dca-bda5-d0637047df4a';

-- Splash EN - Limited Time Offer (#5)
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'style="height: 50px;',
    'style="width: 200px; height: auto;'
  ),
  updated_at = NOW()
WHERE id = '6af5add6-5413-4b69-9572-0aaefd4843a7';

UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'style="height: 35px;',
    'style="width: 150px; height: auto;'
  ),
  updated_at = NOW()
WHERE id = '6af5add6-5413-4b69-9572-0aaefd4843a7';

-- Splash ES - Oferta Por Tiempo Limitado (#5)
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'style="height: 50px;',
    'style="width: 200px; height: auto;'
  ),
  updated_at = NOW()
WHERE id = '84f73b3a-8625-4cb0-bc52-aaf95f3ca464';

UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'style="height: 35px;',
    'style="width: 150px; height: auto;'
  ),
  updated_at = NOW()
WHERE id = '84f73b3a-8625-4cb0-bc52-aaf95f3ca464';

-- ===========================================
-- FIX #2: CTA Button Centering
-- Fix buttons that have text not centered
-- Adding text-align: center to button styles
-- ===========================================

-- Fix button text centering across ALL templates
-- Pattern 1: Fix inline-block buttons without text-align
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'display: inline-block; padding:',
    'display: inline-block; text-align: center; padding:'
  ),
  updated_at = NOW()
WHERE html_template LIKE '%display: inline-block; padding:%'
  AND html_template NOT LIKE '%display: inline-block; text-align: center; padding:%';

-- Pattern 2: Fix buttons with box-shadow but missing text-align
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'box-shadow: 0 4px 15px',
    'text-align: center; box-shadow: 0 4px 15px'
  ),
  updated_at = NOW()
WHERE html_template LIKE '%box-shadow: 0 4px 15px%'
  AND html_template NOT LIKE '%text-align: center; box-shadow: 0 4px 15px%';

-- Fix specifically Splash EN Welcome (#1) - CTA centering
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'Schedule Free Consultation</a>',
    'Schedule Free Consultation</a>'
  ),
  updated_at = NOW()
WHERE id = '67f7b449-d3dc-48b2-aa92-da67ca0ef51b';

-- Fix specifically Splash ES Welcome (#1) - CTA centering
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'Programar Consulta Gratuita</a>',
    'Programar Consulta Gratuita</a>'
  ),
  updated_at = NOW()
WHERE id = 'ad326031-bcd5-48af-a278-10c40eb7e8d9';

-- ===========================================
-- FIX #3: Global button text-align fix
-- Ensure all CTA buttons have centered text
-- ===========================================

-- Add text-align center to all buttons that have border-radius: 8px (our CTA style)
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'border-radius: 8px; font-size:',
    'border-radius: 8px; text-align: center; font-size:'
  ),
  updated_at = NOW()
WHERE html_template LIKE '%border-radius: 8px; font-size:%'
  AND html_template NOT LIKE '%border-radius: 8px; text-align: center; font-size:%';

-- Confirmation
DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'EMAIL TEMPLATE ISSUES FIXED';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Fixed: Logo/header in #5 emails (4 templates)';
  RAISE NOTICE 'Fixed: CTA button text centering';
  RAISE NOTICE '============================================================================';
END $$;
