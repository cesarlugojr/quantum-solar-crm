-- ============================================================================
-- QUANTUM SOLAR - FIX EMAIL TEMPLATE LOGO SIZES
-- Purpose: Update all email templates to use larger, more visible logo sizes
-- Header logos: 200px wide (was 50px tall)
-- Footer logos: 150px wide (was 35px tall)
-- ============================================================================

-- Update email_templates table - header logos (height: 50px -> width: 200px)
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'style="height: 50px; margin-bottom: 20px;"',
    'style="width: 200px; height: auto; margin-bottom: 20px;"'
  ),
  updated_at = NOW()
WHERE html_template LIKE '%height: 50px; margin-bottom: 20px;%';

-- Update email_templates table - header logos with invert filter
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'style="height: 50px; margin-bottom: 20px; filter: brightness(0) invert(1);"',
    'style="width: 200px; height: auto; margin-bottom: 20px; filter: brightness(0) invert(1);"'
  ),
  updated_at = NOW()
WHERE html_template LIKE '%height: 50px; margin-bottom: 20px; filter: brightness(0) invert(1);%';

-- Update email_templates table - footer logos
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'style="height: 35px; margin-bottom: 15px; filter: brightness(0) invert(1);"',
    'style="width: 150px; height: auto; margin-bottom: 15px; filter: brightness(0) invert(1);"'
  ),
  updated_at = NOW()
WHERE html_template LIKE '%height: 35px; margin-bottom: 15px; filter: brightness(0) invert(1);%';

-- Update email_sequences table - header logos (height: 50px -> width: 200px)
UPDATE email_sequences
SET
  html_template = REPLACE(
    html_template,
    'style="height: 50px; margin-bottom: 20px;"',
    'style="width: 200px; height: auto; margin-bottom: 20px;"'
  ),
  updated_at = NOW()
WHERE html_template LIKE '%height: 50px; margin-bottom: 20px;%';

-- Update email_sequences table - header logos with invert filter
UPDATE email_sequences
SET
  html_template = REPLACE(
    html_template,
    'style="height: 50px; margin-bottom: 20px; filter: brightness(0) invert(1);"',
    'style="width: 200px; height: auto; margin-bottom: 20px; filter: brightness(0) invert(1);"'
  ),
  updated_at = NOW()
WHERE html_template LIKE '%height: 50px; margin-bottom: 20px; filter: brightness(0) invert(1);%';

-- Update email_sequences table - footer logos
UPDATE email_sequences
SET
  html_template = REPLACE(
    html_template,
    'style="height: 35px; margin-bottom: 15px; filter: brightness(0) invert(1);"',
    'style="width: 150px; height: auto; margin-bottom: 15px; filter: brightness(0) invert(1);"'
  ),
  updated_at = NOW()
WHERE html_template LIKE '%height: 35px; margin-bottom: 15px; filter: brightness(0) invert(1);%';

-- Also update older format from initial migration (width="180" height="60")
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'width="180" height="60"',
    'width="200"'
  ),
  updated_at = NOW()
WHERE html_template LIKE '%width="180" height="60"%';

UPDATE email_sequences
SET
  html_template = REPLACE(
    html_template,
    'width="180" height="60"',
    'width="200"'
  ),
  updated_at = NOW()
WHERE html_template LIKE '%width="180" height="60"%';

-- Update max-width constraints
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'max-width: 180px;',
    'max-width: 200px;'
  ),
  updated_at = NOW()
WHERE html_template LIKE '%max-width: 180px;%';

UPDATE email_sequences
SET
  html_template = REPLACE(
    html_template,
    'max-width: 180px;',
    'max-width: 200px;'
  ),
  updated_at = NOW()
WHERE html_template LIKE '%max-width: 180px;%';

-- Confirmation
DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'EMAIL TEMPLATE LOGO SIZES UPDATED';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Header logos: now 200px wide (was 50px tall or 180px wide)';
  RAISE NOTICE 'Footer logos: now 150px wide (was 35px tall)';
  RAISE NOTICE '============================================================================';
END $$;
