-- ============================================================================
-- QUANTUM SOLAR - ADD MISSING TAGLINES TO EMAIL HEADERS
-- Purpose: Add "POWERING ILLINOIS HOMES" / "ENERGIZANDO HOGARES DE ILLINOIS"
-- tagline to all templates that have gradient + centered logo but missing tagline
-- ============================================================================

-- The templates already have the gradient header and centered logo like:
-- <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
--   <img src="..." width="200" style="display: block; margin: 0 auto;" />
-- </td>
-- We need to add the tagline after the logo

-- ENGLISH TEMPLATES - Add "POWERING ILLINOIS HOMES"
-- Calculator EN #2 - How Solar Works
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
            </td>',
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
              <p style="color: #a0a0a0; margin: 12px 0 0 0; font-size: 12px; letter-spacing: 2px;">POWERING ILLINOIS HOMES</p>
            </td>'
  ),
  updated_at = NOW()
WHERE id = '276233a8-408c-4685-b3be-6c8ab33ac557';

-- Calculator EN #3 - Tax Credit Reminder
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
            </td>',
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
              <p style="color: #a0a0a0; margin: 12px 0 0 0; font-size: 12px; letter-spacing: 2px;">POWERING ILLINOIS HOMES</p>
            </td>'
  ),
  updated_at = NOW()
WHERE id = 'ec01d702-ea68-435f-a257-253390981680';

-- Calculator EN #4 - Complete Your Quote
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
            </td>',
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
              <p style="color: #a0a0a0; margin: 12px 0 0 0; font-size: 12px; letter-spacing: 2px;">POWERING ILLINOIS HOMES</p>
            </td>'
  ),
  updated_at = NOW()
WHERE id = '7f76176f-b9d5-4877-ba32-496710338950';

-- Splash EN #2 - Solar Benefits
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
            </td>',
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
              <p style="color: #a0a0a0; margin: 12px 0 0 0; font-size: 12px; letter-spacing: 2px;">POWERING ILLINOIS HOMES</p>
            </td>'
  ),
  updated_at = NOW()
WHERE id = 'ae9b56d2-62cb-454f-99a3-6c54352f7c13';

-- Splash EN #3 - Financing Options
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
            </td>',
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
              <p style="color: #a0a0a0; margin: 12px 0 0 0; font-size: 12px; letter-spacing: 2px;">POWERING ILLINOIS HOMES</p>
            </td>'
  ),
  updated_at = NOW()
WHERE id = 'edd77061-5110-4694-888d-9148035a4843';

-- Splash EN #4 - Social Proof
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
            </td>',
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
              <p style="color: #a0a0a0; margin: 12px 0 0 0; font-size: 12px; letter-spacing: 2px;">POWERING ILLINOIS HOMES</p>
            </td>'
  ),
  updated_at = NOW()
WHERE id = '4835eb27-f32b-46ac-a66b-b89a7d64457a';

-- SPANISH TEMPLATES - Add "ENERGIZANDO HOGARES DE ILLINOIS"
-- Calculator ES #1 - Bienvenida y Resultados
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
            </td>',
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
              <p style="color: #a0a0a0; margin: 12px 0 0 0; font-size: 12px; letter-spacing: 2px;">ENERGIZANDO HOGARES DE ILLINOIS</p>
            </td>'
  ),
  updated_at = NOW()
WHERE id = '1e29108c-293b-476a-8f3c-857b8b864c0f';

-- Calculator ES #2 - Cómo Funciona Solar
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
            </td>',
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
              <p style="color: #a0a0a0; margin: 12px 0 0 0; font-size: 12px; letter-spacing: 2px;">ENERGIZANDO HOGARES DE ILLINOIS</p>
            </td>'
  ),
  updated_at = NOW()
WHERE id = '2e403f36-2673-463a-969d-72821ea0fb8c';

-- Calculator ES #3 - Recordatorio Crédito Fiscal
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
            </td>',
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
              <p style="color: #a0a0a0; margin: 12px 0 0 0; font-size: 12px; letter-spacing: 2px;">ENERGIZANDO HOGARES DE ILLINOIS</p>
            </td>'
  ),
  updated_at = NOW()
WHERE id = '1b1ca2a5-8d14-47fb-9530-cd2d24dbe081';

-- Calculator ES #4 - Completa Tu Cotización
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
            </td>',
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
              <p style="color: #a0a0a0; margin: 12px 0 0 0; font-size: 12px; letter-spacing: 2px;">ENERGIZANDO HOGARES DE ILLINOIS</p>
            </td>'
  ),
  updated_at = NOW()
WHERE id = 'dfd5bb9a-362c-4502-83c3-60ccb84a8a89';

-- Splash ES #1 - Correo de Bienvenida
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
            </td>',
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
              <p style="color: #a0a0a0; margin: 12px 0 0 0; font-size: 12px; letter-spacing: 2px;">ENERGIZANDO HOGARES DE ILLINOIS</p>
            </td>'
  ),
  updated_at = NOW()
WHERE id = 'ad326031-bcd5-48af-a278-10c40eb7e8d9';

-- Splash ES #2 - Beneficios Solares
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
            </td>',
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
              <p style="color: #a0a0a0; margin: 12px 0 0 0; font-size: 12px; letter-spacing: 2px;">ENERGIZANDO HOGARES DE ILLINOIS</p>
            </td>'
  ),
  updated_at = NOW()
WHERE id = '2d39b978-b66d-4580-bd07-ac428d635dbb';

-- Splash ES #3 - Opciones de Financiamiento
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
            </td>',
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
              <p style="color: #a0a0a0; margin: 12px 0 0 0; font-size: 12px; letter-spacing: 2px;">ENERGIZANDO HOGARES DE ILLINOIS</p>
            </td>'
  ),
  updated_at = NOW()
WHERE id = '6f6d630c-6ef3-4885-adf3-815f33ad6802';

-- Splash ES #4 - Testimonios
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
            </td>',
    '<img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
              <p style="color: #a0a0a0; margin: 12px 0 0 0; font-size: 12px; letter-spacing: 2px;">ENERGIZANDO HOGARES DE ILLINOIS</p>
            </td>'
  ),
  updated_at = NOW()
WHERE id = '7680ce21-547a-4332-af79-ec839a82c710';

-- Confirmation
DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'TAGLINES ADDED TO 14 EMAIL TEMPLATES';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'English templates: POWERING ILLINOIS HOMES';
  RAISE NOTICE 'Spanish templates: ENERGIZANDO HOGARES DE ILLINOIS';
  RAISE NOTICE '============================================================================';
END $$;
