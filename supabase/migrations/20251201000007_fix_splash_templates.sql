-- ============================================================================
-- FIX: Splash Page Email Templates
-- Purpose: Fix text color issue in Email 1 and re-apply Emails 3-5 correctly
-- Date: 2025-12-01
-- ============================================================================

-- Fix Email 1 (EN) - Text color contrast issue
UPDATE email_templates
SET
  html_template = '<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Welcome to Quantum Solar</title></head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
    <tr><td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
              <img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="180" height="60" style="display: block; margin: 0 auto;" />
              <p style="color: #a0a0a0; margin: 12px 0 0 0; font-size: 12px; letter-spacing: 2px;">POWERING ILLINOIS HOMES</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1a1a2e; margin: 0 0 15px 0; font-size: 24px;">
                Welcome {{firstName}}! Your Solar Journey Starts Here
              </h2>
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Thanks for reaching out to Quantum Solar! We help {{city}} homeowners like you save money, increase home value, and take control of their energy future with solar.
              </p>
              <div style="background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%); border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 30px;">
                <p style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">
                  Most homeowners in Illinois save $1,500-$3,000 per year with solar
                </p>
              </div>
              <h3 style="color: #1a1a2e; margin: 0 0 15px 0; font-size: 18px;">Why Homeowners Choose Solar:</h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 10px 0; color: #555555; font-size: 15px; line-height: 1.5;">
                    <span style="color: #ff0000; margin-right: 10px;">✓</span><strong>Lower energy bills</strong> - Reduce or eliminate your electric payment
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #555555; font-size: 15px; line-height: 1.5;">
                    <span style="color: #ff0000; margin-right: 10px;">✓</span><strong>30% tax credit</strong> - Get thousands back on your 2025 taxes
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #555555; font-size: 15px; line-height: 1.5;">
                    <span style="color: #ff0000; margin-right: 10px;">✓</span><strong>Increase home value</strong> - Solar adds 4.1% to your home''s resale value
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #555555; font-size: 15px; line-height: 1.5;">
                    <span style="color: #ff0000; margin-right: 10px;">✓</span><strong>Energy independence</strong> - Lock in your rate, never worry about rising utility costs
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #ff0000; border-radius: 8px;">
                    <a href="https://quantumsolar.us/schedule" style="display: inline-block; padding: 18px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700;">
                      Schedule Free Consultation
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #888888; font-size: 13px; margin: 15px 0 0 0; text-align: center;">
                Free • No obligation • Takes 15 minutes
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #1a1a2e; padding: 30px 40px; text-align: center;">
              <p style="color: #ffffff; margin: 0 0 5px 0; font-size: 14px; font-weight: 600;">Quantum Solar Enterprises LLC</p>
              <p style="color: #a0a0a0; margin: 0 0 15px 0; font-size: 12px;">511 W 5th St, Tilton, IL 61833 • (407) 487-6890</p>
              <a href="{{unsubscribeUrl}}" style="color: #888888; font-size: 11px; text-decoration: underline;">Unsubscribe</a>
            </td>
          </tr>
        </table>
      </td></tr>
  </table>
</body>
</html>',
  updated_at = NOW()
WHERE name = 'Splash EN - Welcome Email' AND language = 'en';

-- Fix Email 1 (ES) - Text color contrast issue
UPDATE email_templates
SET
  html_template = '<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Bienvenido a Quantum Solar</title></head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
    <tr><td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
              <img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="180" height="60" style="display: block; margin: 0 auto;" />
              <p style="color: #a0a0a0; margin: 12px 0 0 0; font-size: 12px; letter-spacing: 2px;">ENERGIZANDO HOGARES EN ILLINOIS</p>
            </td>
          </tr>
          <tr><td style="padding: 40px;">
              <h2 style="color: #1a1a2e; margin: 0 0 15px 0; font-size: 24px;">
                ¡Bienvenido {{firstName}}! Tu Camino Hacia la Energía Solar Comienza Aquí
              </h2>
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                ¡Gracias por contactar a Quantum Solar! Ayudamos a propietarios como tú en {{city}} a ahorrar dinero, aumentar el valor de su hogar y tomar control de su futuro energético con energía solar.
              </p>
              <div style="background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%); border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 30px;">
                <p style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">
                  La mayoría de los propietarios en Illinois ahorran $1,500-$3,000 por año con energía solar
                </p>
              </div>
              <h3 style="color: #1a1a2e; margin: 0 0 15px 0; font-size: 18px;">Por Qué Los Propietarios Eligen Energía Solar:</h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 10px 0; color: #555555; font-size: 15px; line-height: 1.5;">
                    <span style="color: #ff0000; margin-right: 10px;">✓</span><strong>Facturas de energía más bajas</strong> - Reduce o elimina tu pago de electricidad
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #555555; font-size: 15px; line-height: 1.5;">
                    <span style="color: #ff0000; margin-right: 10px;">✓</span><strong>30% de crédito fiscal</strong> - Recupera miles en tus impuestos de 2025
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #555555; font-size: 15px; line-height: 1.5;">
                    <span style="color: #ff0000; margin-right: 10px;">✓</span><strong>Aumenta el valor de tu hogar</strong> - La energía solar agrega 4.1% al valor de reventa
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #555555; font-size: 15px; line-height: 1.5;">
                    <span style="color: #ff0000; margin-right: 10px;">✓</span><strong>Independencia energética</strong> - Asegura tu tarifa, nunca te preocupes por costos crecientes
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #ff0000; border-radius: 8px;">
                    <a href="https://quantumsolar.us/es/programar" style="display: inline-block; padding: 18px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700;">
                      Agendar Consulta Gratuita
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #888888; font-size: 13px; margin: 15px 0 0 0; text-align: center;">
                Gratis • Sin obligación • Toma 15 minutos
              </p>
            </td></tr>
          <tr>
            <td style="background-color: #1a1a2e; padding: 30px 40px; text-align: center;">
              <p style="color: #ffffff; margin: 0 0 5px 0; font-size: 14px; font-weight: 600;">Quantum Solar Enterprises LLC</p>
              <p style="color: #a0a0a0; margin: 0 0 15px 0; font-size: 12px;">511 W 5th St, Tilton, IL 61833 • (407) 487-6890</p>
              <a href="{{unsubscribeUrl}}" style="color: #888888; font-size: 11px; text-decoration: underline;">Cancelar suscripción</a>
            </td>
          </tr>
        </table>
      </td></tr>
  </table>
</body>
</html>',
  updated_at = NOW()
WHERE name = 'Splash ES - Correo de Bienvenida' AND language = 'es';

DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'FIXED: Splash Page Email 1 (EN/ES) - Text color contrast';
  RAISE NOTICE 'Added explicit color: #555555 to benefit list items';
  RAISE NOTICE '============================================================================';
END $$;
