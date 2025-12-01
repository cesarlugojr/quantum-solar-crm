-- Migration: Remove firstName from Solar Calculator templates
-- Created: 2025-12-01
-- Purpose: Solar Calculator only captures email, address, utility, and bill amount
--          It does NOT capture first name, so templates shouldn't use {{firstName}}

-- ============================================================================
-- Update Calculator EN templates - Remove firstName, use generic greetings
-- ============================================================================

-- Calculator EN - Welcome & Results
UPDATE email_templates
SET
  subject_template = 'Your Solar Calculator Results Are Ready',
  variables = '["city", "estimatedSavings", "electricBill", "systemSize", "unsubscribeUrl"]'::jsonb,
  html_template = REPLACE(REPLACE(REPLACE(html_template, '{{firstName}}, ', ''), 'Hi {{firstName}}', 'Hi there'), 'Hello {{firstName}}', 'Hello'),
  text_template = REPLACE(REPLACE(REPLACE(text_template, '{{firstName}}, ', ''), 'Hi {{firstName}}', 'Hi there'), 'Hello {{firstName}}', 'Hello'),
  updated_at = NOW()
WHERE name = 'Calculator EN - Welcome & Results';

-- Calculator EN - Complete Your Quote
UPDATE email_templates
SET
  subject_template = 'Ready to see your custom solar design?',
  variables = '["estimatedSavings", "unsubscribeUrl"]'::jsonb,
  html_template = REPLACE(REPLACE(REPLACE(html_template, '{{firstName}}, ', ''), 'Hi {{firstName}}', 'Hi there'), 'Hello {{firstName}}', 'Hello'),
  text_template = REPLACE(REPLACE(REPLACE(text_template, '{{firstName}}, ', ''), 'Hi {{firstName}}', 'Hi there'), 'Hello {{firstName}}', 'Hello'),
  updated_at = NOW()
WHERE name = 'Calculator EN - Complete Your Quote';

-- Calculator EN - How Solar Works
UPDATE email_templates
SET
  variables = '["city", "unsubscribeUrl"]'::jsonb,
  html_template = REPLACE(REPLACE(REPLACE(html_template, '{{firstName}}, ', ''), 'Hi {{firstName}}', 'Hi there'), 'Hello {{firstName}}', 'Hello'),
  text_template = REPLACE(REPLACE(REPLACE(text_template, '{{firstName}}, ', ''), 'Hi {{firstName}}', 'Hi there'), 'Hello {{firstName}}', 'Hello'),
  updated_at = NOW()
WHERE name = 'Calculator EN - How Solar Works';

-- Calculator EN - Tax Credit Reminder
UPDATE email_templates
SET
  subject_template = 'The 30% tax credit won''t last forever',
  variables = '["taxCredit", "unsubscribeUrl"]'::jsonb,
  html_template = REPLACE(REPLACE(REPLACE(html_template, '{{firstName}}, ', ''), 'Hi {{firstName}}', 'Hi there'), 'Hello {{firstName}}', 'Hello'),
  text_template = REPLACE(REPLACE(REPLACE(text_template, '{{firstName}}, ', ''), 'Hi {{firstName}}', 'Hi there'), 'Hello {{firstName}}', 'Hello'),
  updated_at = NOW()
WHERE name = 'Calculator EN - Tax Credit Reminder';

-- Calculator EN - Final Reminder
UPDATE email_templates
SET
  subject_template = 'Quick question about your solar quote',
  variables = '["estimatedSavings", "unsubscribeUrl"]'::jsonb,
  html_template = REPLACE(REPLACE(REPLACE(html_template, '{{firstName}}, ', ''), 'Hi {{firstName}}', 'Hi there'), 'Hello {{firstName}}', 'Hello'),
  text_template = REPLACE(REPLACE(REPLACE(text_template, '{{firstName}}, ', ''), 'Hi {{firstName}}', 'Hi there'), 'Hello {{firstName}}', 'Hello'),
  updated_at = NOW()
WHERE name = 'Calculator EN - Final Reminder';

-- ============================================================================
-- Update Calculator ES templates - Remove firstName, use generic greetings
-- ============================================================================

-- Calculator ES - Bienvenida y Resultados
UPDATE email_templates
SET
  subject_template = 'Tus Resultados de la Calculadora Solar Están Listos',
  variables = '["city", "estimatedSavings", "electricBill", "systemSize", "unsubscribeUrl"]'::jsonb,
  html_template = REPLACE(REPLACE(REPLACE(html_template, '{{firstName}}, ', ''), 'Hola {{firstName}}', 'Hola'), '{{firstName}}', ''),
  text_template = REPLACE(REPLACE(REPLACE(text_template, '{{firstName}}, ', ''), 'Hola {{firstName}}', 'Hola'), '{{firstName}}', ''),
  updated_at = NOW()
WHERE name = 'Calculator ES - Bienvenida y Resultados';

-- Calculator ES - Completa Tu Cotización
UPDATE email_templates
SET
  subject_template = '¿Listo para ver tu diseño solar personalizado?',
  variables = '["estimatedSavings", "unsubscribeUrl"]'::jsonb,
  html_template = REPLACE(REPLACE(REPLACE(html_template, '{{firstName}}, ', ''), 'Hola {{firstName}}', 'Hola'), '{{firstName}}', ''),
  text_template = REPLACE(REPLACE(REPLACE(text_template, '{{firstName}}, ', ''), 'Hola {{firstName}}', 'Hola'), '{{firstName}}', ''),
  updated_at = NOW()
WHERE name = 'Calculator ES - Completa Tu Cotización';

-- Calculator ES - Cómo Funciona Solar
UPDATE email_templates
SET
  variables = '["city", "unsubscribeUrl"]'::jsonb,
  html_template = REPLACE(REPLACE(REPLACE(html_template, '{{firstName}}, ', ''), 'Hola {{firstName}}', 'Hola'), '{{firstName}}', ''),
  text_template = REPLACE(REPLACE(REPLACE(text_template, '{{firstName}}, ', ''), 'Hola {{firstName}}', 'Hola'), '{{firstName}}', ''),
  updated_at = NOW()
WHERE name = 'Calculator ES - Cómo Funciona Solar';

-- Calculator ES - Recordatorio Crédito Fiscal
UPDATE email_templates
SET
  subject_template = 'El crédito fiscal del 30% no durará para siempre',
  variables = '["taxCredit", "unsubscribeUrl"]'::jsonb,
  html_template = REPLACE(REPLACE(REPLACE(html_template, '{{firstName}}, ', ''), 'Hola {{firstName}}', 'Hola'), '{{firstName}}', ''),
  text_template = REPLACE(REPLACE(REPLACE(text_template, '{{firstName}}, ', ''), 'Hola {{firstName}}', 'Hola'), '{{firstName}}', ''),
  updated_at = NOW()
WHERE name = 'Calculator ES - Recordatorio Crédito Fiscal';

-- Calculator ES - Último Recordatorio
UPDATE email_templates
SET
  subject_template = 'Una pregunta rápida sobre tu cotización solar',
  variables = '["estimatedSavings", "unsubscribeUrl"]'::jsonb,
  html_template = REPLACE(REPLACE(REPLACE(html_template, '{{firstName}}, ', ''), 'Hola {{firstName}}', 'Hola'), '{{firstName}}', ''),
  text_template = REPLACE(REPLACE(REPLACE(text_template, '{{firstName}}, ', ''), 'Hola {{firstName}}', 'Hola'), '{{firstName}}', ''),
  updated_at = NOW()
WHERE name = 'Calculator ES - Último Recordatorio';

-- ============================================================================
-- Verification
-- ============================================================================
DO $$
DECLARE
  templates_with_firstname INTEGER;
BEGIN
  SELECT COUNT(*) INTO templates_with_firstname
  FROM email_templates
  WHERE name LIKE 'Calculator%'
  AND variables::text LIKE '%firstName%';

  IF templates_with_firstname > 0 THEN
    RAISE WARNING 'Still have % Calculator templates with firstName in variables', templates_with_firstname;
  ELSE
    RAISE NOTICE 'All Calculator templates updated - firstName removed from variables array';
  END IF;
END $$;
