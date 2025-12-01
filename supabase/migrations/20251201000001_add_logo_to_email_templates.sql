-- ============================================================================
-- QUANTUM SOLAR - ADD LOGO TO EMAIL TEMPLATES
-- Purpose: Update email template headers to use the Quantum Solar logo image
-- Logo hosted at: https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png
-- ============================================================================

-- Email 1: Welcome Email - Update header with logo
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    '<!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                <span style="color: #ff0000;">QUANTUM</span> SOLAR
              </h1>
              <p style="color: #a0a0a0; margin: 8px 0 0 0; font-size: 12px; letter-spacing: 2px;">POWERING ILLINOIS HOMES</p>
            </td>
          </tr>',
    '<!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
              <img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="180" height="60" style="display: block; margin: 0 auto 10px auto; max-width: 180px; height: auto;" />
              <p style="color: #a0a0a0; margin: 8px 0 0 0; font-size: 12px; letter-spacing: 2px;">POWERING ILLINOIS HOMES</p>
            </td>
          </tr>'
  ),
  updated_at = NOW()
WHERE name = 'Ameren IL - Welcome Email';

-- Email 2: ROI Email - Update header with logo
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    '<!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                <span style="color: #ff0000;">QUANTUM</span> SOLAR
              </h1>
            </td>
          </tr>',
    '<!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
              <img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="180" height="60" style="display: block; margin: 0 auto; max-width: 180px; height: auto;" />
            </td>
          </tr>'
  ),
  updated_at = NOW()
WHERE name = 'Ameren IL - ROI Email (Day 2)';

-- Email 3: Social Proof - Update header with logo
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    '<!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                <span style="color: #ff0000;">QUANTUM</span> SOLAR
              </h1>
            </td>
          </tr>',
    '<!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
              <img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="180" height="60" style="display: block; margin: 0 auto; max-width: 180px; height: auto;" />
            </td>
          </tr>'
  ),
  updated_at = NOW()
WHERE name = 'Ameren IL - Social Proof (Day 5)';

-- Email 4: Urgency - Update header with logo
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    '<!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                <span style="color: #ff0000;">QUANTUM</span> SOLAR
              </h1>
            </td>
          </tr>',
    '<!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
              <img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="180" height="60" style="display: block; margin: 0 auto; max-width: 180px; height: auto;" />
            </td>
          </tr>'
  ),
  updated_at = NOW()
WHERE name = 'Ameren IL - Urgency (Day 7)';

-- Email 5: Final Call - Update header with logo (different format - simpler header)
UPDATE email_templates
SET
  html_template = REPLACE(
    html_template,
    '<!-- Simple Header -->
          <tr>
            <td style="padding: 40px 40px 0 40px;">
              <p style="color: #ff0000; margin: 0; font-size: 14px; font-weight: 600; letter-spacing: 1px;">QUANTUM SOLAR</p>
            </td>
          </tr>',
    '<!-- Simple Header -->
          <tr>
            <td style="padding: 40px 40px 0 40px;">
              <img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="120" height="40" style="display: block; max-width: 120px; height: auto;" />
            </td>
          </tr>'
  ),
  updated_at = NOW()
WHERE name = 'Ameren IL - Final Call (Day 10)';

-- Confirmation
DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'LOGO ADDED TO EMAIL TEMPLATES';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Updated all 5 email templates with Quantum Solar logo';
  RAISE NOTICE 'Logo URL: https://crm.quantumsolar.us/Quantum%%20Solar-LOGO-B1%%20cropped.png';
  RAISE NOTICE '============================================================================';
END $$;
