-- ============================================================================
-- QUANTUM SOLAR - FIX TAGLINE CONSISTENCY
-- Purpose: Change "ENERGIZANDO HOGARES EN ILLINOIS" to "ENERGIZANDO HOGARES DE ILLINOIS"
-- for consistency across all Spanish templates
-- ============================================================================

-- Calculator ES #1 - Bienvenida y Resultados
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'ENERGIZANDO HOGARES EN ILLINOIS',
    'ENERGIZANDO HOGARES DE ILLINOIS'
  ),
  updated_at = NOW()
WHERE id = '1e29108c-293b-476a-8f3c-857b8b864c0f';

-- Splash ES #1 - Correo de Bienvenida
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'ENERGIZANDO HOGARES EN ILLINOIS',
    'ENERGIZANDO HOGARES DE ILLINOIS'
  ),
  updated_at = NOW()
WHERE id = 'ad326031-bcd5-48af-a278-10c40eb7e8d9';

-- Also fix any other templates that might have this inconsistency
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    'ENERGIZANDO HOGARES EN ILLINOIS',
    'ENERGIZANDO HOGARES DE ILLINOIS'
  ),
  updated_at = NOW()
WHERE html_template LIKE '%ENERGIZANDO HOGARES EN ILLINOIS%';

-- Confirmation
DO $$
BEGIN
  RAISE NOTICE 'TAGLINE CONSISTENCY FIXED: EN -> DE';
END $$;
