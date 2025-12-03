-- ============================================================================
-- QUANTUM SOLAR - FIX SPLASH #5 EMAIL HEADERS
-- Purpose: Splash #5 templates have different structure than Calculator #5
-- ============================================================================

-- Splash EN - Limited Time Offer (#5)
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    '<tr>
            <td style="padding: 40px 40px 0 40px;">
              <img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block;" />
            </td>
          </tr>',
    '<tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
              <img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
              <p style="color: #a0a0a0; margin: 12px 0 0 0; font-size: 12px; letter-spacing: 2px;">POWERING ILLINOIS HOMES</p>
            </td>
          </tr>'
  ),
  updated_at = NOW()
WHERE id = '6af5add6-5413-4b69-9572-0aaefd4843a7';

-- Splash ES - Oferta Por Tiempo Limitado (#5)
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    '<tr>
            <td style="padding: 40px 40px 0 40px;">
              <img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block;" />
            </td>
          </tr>',
    '<tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
              <img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="200" style="display: block; margin: 0 auto;" />
              <p style="color: #a0a0a0; margin: 12px 0 0 0; font-size: 12px; letter-spacing: 2px;">ENERGIZANDO HOGARES DE ILLINOIS</p>
            </td>
          </tr>'
  ),
  updated_at = NOW()
WHERE id = '84f73b3a-8625-4cb0-bc52-aaf95f3ca464';

-- Confirmation
DO $$
BEGIN
  RAISE NOTICE 'SPLASH #5 HEADERS FIXED';
END $$;
