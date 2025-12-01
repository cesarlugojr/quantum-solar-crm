-- ============================================================================
-- QUANTUM SOLAR - CALCULATOR SPANISH EMAIL REDESIGN
-- Purpose: Complete redesign of Solar Calculator Spanish campaign (5 emails)
-- Date: 2025-12-01
-- ============================================================================

-- Email 2: Completa Tu Cotización (Day 2)
UPDATE email_templates
SET
  subject_template = '{{firstName}}, ¿listo para ver tu diseño solar personalizado?',
  html_template = '<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Completa Tu Cotización Solar</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif;">
  <div style="display: none; max-height: 0; overflow: hidden;">
    Convierte tus ${{estimatedSavings}}/año de ahorros en realidad con un diseño personalizado...
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
              <img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="180" height="60" style="display: block; margin: 0 auto;" />
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px; line-height: 1.3;">
                Hola {{firstName}}, Hagamos Esto Realidad
              </h2>
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Descubriste que podrías ahorrar <strong>${{estimatedSavings}} por año</strong> con energía solar. ¡Eso es emocionante! Pero una calculadora solo puede decirte cierta información.
              </p>

              <!-- What You Get -->
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                <h3 style="color: #1a1a2e; margin: 0 0 15px 0; font-size: 16px;">Esto es lo que un diseño personalizado te muestra:</h3>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong style="color: #ff0000;">1.</strong> Disposición exacta de paneles para TU techo
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong style="color: #ff0000;">2.</strong> Pagos mensuales precisos vs. factura eléctrica actual
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong style="color: #ff0000;">3.</strong> Proyección real de ahorros a 25 años
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong style="color: #ff0000;">4.</strong> Tu cantidad de crédito fiscal federal (usualmente $6,000-$12,000)
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong style="color: #ff0000;">5.</strong> Opciones de financiamiento adaptadas a tu situación
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Reminder Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <p style="color: rgba(255,255,255,0.9); margin: 0 0 5px 0; font-size: 14px;">Tus Ahorros Estimados</p>
                    <p style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 700;">${{estimatedSavings}}/año</p>
                    <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 13px;">Eso es dinero real que regresa a tu bolsillo</p>
                  </td>
                </tr>
              </table>

              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                La consulta es <strong>100% gratuita</strong>, toma unos 15 minutos, y no hay presión alguna. Responderemos todas tus preguntas y te mostraremos exactamente cómo se ve la energía solar para tu hogar.
              </p>

              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #ff0000; border-radius: 8px;">
                    <a href="https://quantumsolar.us/schedule" style="display: inline-block; padding: 18px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700;">
                      Agendar Mi Consulta Gratuita
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #888888; font-size: 13px; margin: 15px 0 0 0; text-align: center;">
                Horarios más populares: Noches entre semana 5-7pm
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a2e; padding: 30px 40px; text-align: center;">
              <p style="color: #ffffff; margin: 0 0 5px 0; font-size: 14px; font-weight: 600;">Quantum Solar Enterprises LLC</p>
              <p style="color: #a0a0a0; margin: 0 0 15px 0; font-size: 12px;">511 W 5th St, Tilton, IL 61833</p>
              <a href="{{unsubscribeUrl}}" style="color: #888888; font-size: 11px; text-decoration: underline;">Cancelar suscripción</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  text_template = 'Hola {{firstName}}, Hagamos Esto Realidad

Descubriste que podrías ahorrar ${{estimatedSavings}} por año con energía solar. ¡Eso es emocionante! Pero una calculadora solo puede decirte cierta información.

ESTO ES LO QUE UN DISEÑO PERSONALIZADO TE MUESTRA:
1. Disposición exacta de paneles para TU techo
2. Pagos mensuales precisos vs. factura eléctrica actual
3. Proyección real de ahorros a 25 años
4. Tu cantidad de crédito fiscal federal (usualmente $6,000-$12,000)
5. Opciones de financiamiento adaptadas a tu situación

TUS AHORROS ESTIMADOS: ${{estimatedSavings}}/año

La consulta es 100% gratuita, toma 15 minutos, y no hay presión. Responderemos todas tus preguntas.

Agendar consulta gratuita: https://quantumsolar.us/schedule
Horarios populares: Noches entre semana 5-7pm

---
Quantum Solar Enterprises LLC
511 W 5th St, Tilton, IL 61833
Cancelar suscripción: {{unsubscribeUrl}}',
  updated_at = NOW()
WHERE name = 'Calculator ES - Completa Tu Cotización' AND language = 'es';

-- Email 3: Cómo Funciona Solar (Day 5)
UPDATE email_templates
SET
  subject_template = 'Cómo funciona la energía solar para hogares en {{city}} (explicación simple)',
  html_template = '<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cómo Funciona la Energía Solar</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif;">
  <div style="display: none; max-height: 0; overflow: hidden;">
    La energía solar es más simple de lo que piensas - así funciona en Illinois...
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
              <img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="180" height="60" style="display: block; margin: 0 auto;" />
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px; line-height: 1.3;">
                {{firstName}}, La Energía Solar Es Más Simple de Lo Que Piensas
              </h2>
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Sé que los paneles solares parecen complicados. Pero aquí está la verdad: en realidad es bastante sencillo. Déjame explicártelo en términos simples.
              </p>

              <!-- Process Steps -->
              <div style="margin-bottom: 30px;">
                <!-- Step 1 -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
                  <tr>
                    <td style="width: 50px; vertical-align: top;">
                      <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%); border-radius: 50%;">
                        <span style="color: white; font-size: 18px; font-weight: bold; line-height: 40px; text-align: center; display: block; width: 40px;">1</span>
                      </div>
                    </td>
                    <td style="vertical-align: top;">
                      <h3 style="color: #1a1a2e; margin: 0 0 8px 0; font-size: 17px;">Los Paneles Generan Energía</h3>
                      <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0;">
                        La luz solar golpea tus paneles en el techo y crea electricidad DC. Sin partes móviles, sin ruido, solo física haciendo lo suyo.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Step 2 -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
                  <tr>
                    <td style="width: 50px; vertical-align: top;">
                      <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%); border-radius: 50%;">
                        <span style="color: white; font-size: 18px; font-weight: bold; line-height: 40px; text-align: center; display: block; width: 40px;">2</span>
                      </div>
                    </td>
                    <td style="vertical-align: top;">
                      <h3 style="color: #1a1a2e; margin: 0 0 8px 0; font-size: 17px;">El Inversor La Convierte</h3>
                      <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0;">
                        El inversor (una caja pequeña que instalamos) convierte esa energía DC en energía AC que tu hogar puede usar. Toma milisegundos.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Step 3 -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
                  <tr>
                    <td style="width: 50px; vertical-align: top;">
                      <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%); border-radius: 50%;">
                        <span style="color: white; font-size: 18px; font-weight: bold; line-height: 40px; text-align: center; display: block; width: 40px;">3</span>
                      </div>
                    </td>
                    <td style="vertical-align: top;">
                      <h3 style="color: #1a1a2e; margin: 0 0 8px 0; font-size: 17px;">Tu Hogar La Usa Primero</h3>
                      <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0;">
                        Esa energía solar va directo a tus luces, refrigerador, AC, lo que esté funcionando. Usas tu propia energía antes de tomar de la red.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Step 4 -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="width: 50px; vertical-align: top;">
                      <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%); border-radius: 50%;">
                        <span style="color: white; font-size: 18px; font-weight: bold; line-height: 40px; text-align: center; display: block; width: 40px;">4</span>
                      </div>
                    </td>
                    <td style="vertical-align: top;">
                      <h3 style="color: #1a1a2e; margin: 0 0 8px 0; font-size: 17px;">El Exceso Va a la Red (Recibes Crédito)</h3>
                      <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0;">
                        ¿Produces más energía de la que usas? Illinois tiene medición neta - el exceso va a la red y tu compañía eléctrica te da crédito en tu cuenta. De noche, usas esos créditos.
                      </p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Illinois Advantage -->
              <div style="background-color: #dcfce7; border-left: 4px solid #16a34a; border-radius: 0 12px 12px 0; padding: 25px; margin-bottom: 30px;">
                <h3 style="color: #166534; margin: 0 0 10px 0; font-size: 16px;">Por Qué Illinois es Perfecto Para Solar:</h3>
                <p style="color: #166534; margin: 0; font-size: 15px; line-height: 1.6;">
                  Illinois tiene <strong>medición neta 1:1</strong> - cada kilovatio-hora que envías a la red te da un crédito 1:1. Muchos estados no tienen esto. Es una de las mejores políticas solares del país.
                </p>
              </div>

              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Eso es todo. No hay ciencia complicada. Paneles hacen energía → La usas → Ahorras dinero. Así de simple.
              </p>

              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #ff0000; border-radius: 8px;">
                    <a href="https://quantumsolar.us/schedule" style="display: inline-block; padding: 18px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700;">
                      Ver Cómo Funciona Para Mi Hogar
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a2e; padding: 30px 40px; text-align: center;">
              <p style="color: #ffffff; margin: 0 0 5px 0; font-size: 14px; font-weight: 600;">Quantum Solar Enterprises LLC</p>
              <p style="color: #a0a0a0; margin: 0 0 15px 0; font-size: 12px;">511 W 5th St, Tilton, IL 61833</p>
              <a href="{{unsubscribeUrl}}" style="color: #888888; font-size: 11px; text-decoration: underline;">Cancelar suscripción</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  text_template = '{{firstName}}, La Energía Solar Es Más Simple de Lo Que Piensas

Sé que los paneles solares parecen complicados. Pero la verdad: es bastante sencillo.

CÓMO FUNCIONA:

1. LOS PANELES GENERAN ENERGÍA
La luz solar golpea tus paneles y crea electricidad DC. Sin partes móviles, sin ruido.

2. EL INVERSOR LA CONVIERTE
El inversor convierte energía DC en energía AC que tu hogar usa. Toma milisegundos.

3. TU HOGAR LA USA PRIMERO
La energía solar va a tus luces, refrigerador, AC, lo que esté funcionando. Usas tu propia energía antes de tomar de la red.

4. EL EXCESO VA A LA RED (RECIBES CRÉDITO)
¿Produces más de lo que usas? Illinois tiene medición neta - el exceso va a la red y te dan crédito en tu cuenta.

POR QUÉ ILLINOIS ES PERFECTO PARA SOLAR:
Illinois tiene medición neta 1:1 - cada kWh que envías a la red = crédito 1:1. Una de las mejores políticas solares del país.

Eso es todo. Paneles hacen energía → La usas → Ahorras.

Ver cómo funciona para tu hogar: https://quantumsolar.us/schedule

---
Quantum Solar Enterprises LLC
511 W 5th St, Tilton, IL 61833
Cancelar suscripción: {{unsubscribeUrl}}',
  updated_at = NOW()
WHERE name = 'Calculator ES - Cómo Funciona Solar' AND language = 'es';

-- Email 4: Recordatorio Crédito Fiscal (Day 8)
UPDATE email_templates
SET
  subject_template = '{{firstName}}, el crédito fiscal del 30% no durará para siempre',
  html_template = '<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fecha Límite del Crédito Fiscal Federal</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif;">
  <div style="display: none; max-height: 0; overflow: hidden;">
    El crédito fiscal solar del 30% está disminuyendo - aquí está el calendario...
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
              <img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="180" height="60" style="display: block; margin: 0 auto;" />
            </td>
          </tr>

          <!-- Urgency Banner -->
          <tr>
            <td style="background-color: #fef2f2; padding: 15px 40px; text-align: center; border-bottom: 2px solid #fecaca;">
              <p style="color: #dc2626; margin: 0; font-size: 14px; font-weight: 600;">
                ⚠ URGENTE: Calendario de Reducción del Crédito Fiscal Federal
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px; line-height: 1.3;">
                {{firstName}}, Esto Es Lo Que Necesitas Saber
              </h2>
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                El crédito fiscal solar federal es uno de los mejores incentivos disponibles para instalar energía solar. Pero no es permanente. Aquí está el calendario:
              </p>

              <!-- Tax Credit Timeline -->
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                <h3 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 16px;">Calendario del Crédito Fiscal Solar Federal:</h3>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding: 12px 15px; background-color: #dcfce7; border-radius: 8px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="color: #166534; font-size: 15px; font-weight: 600;">2024-2032</td>
                          <td style="color: #16a34a; font-size: 20px; font-weight: 700; text-align: right;">30%</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr><td style="height: 8px;"></td></tr>
                  <tr>
                    <td style="padding: 12px 15px; background-color: #fef9c3; border-radius: 8px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="color: #854d0e; font-size: 15px;">2033</td>
                          <td style="color: #ca8a04; font-size: 20px; font-weight: 700; text-align: right;">26%</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr><td style="height: 8px;"></td></tr>
                  <tr>
                    <td style="padding: 12px 15px; background-color: #fee2e2; border-radius: 8px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="color: #991b1b; font-size: 15px;">2034</td>
                          <td style="color: #dc2626; font-size: 20px; font-weight: 700; text-align: right;">22%</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr><td style="height: 8px;"></td></tr>
                  <tr>
                    <td style="padding: 12px 15px; background-color: #f3f4f6; border-radius: 8px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="color: #6b7280; font-size: 15px;">2035+</td>
                          <td style="color: #374151; font-size: 20px; font-weight: 700; text-align: right;">0%</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- What This Means -->
              <div style="background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                <h3 style="color: #ffffff; margin: 0 0 10px 0; font-size: 18px;">Lo Que Esto Significa Para Ti:</h3>
                <p style="color: rgba(255,255,255,0.95); margin: 0; font-size: 16px; line-height: 1.6;">
                  En un sistema típico de <strong>$25,000</strong>, el crédito del 30% = <strong>$7,500 de vuelta</strong> en tus impuestos. Eso es dinero real que puedes reclamar en tu declaración de 2025.
                </p>
              </div>

              <!-- Real Example -->
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                <h3 style="color: #1a1a2e; margin: 0 0 15px 0; font-size: 16px;">Ejemplo Real:</h3>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="color: #555555; font-size: 15px; padding: 5px 0;">Costo del sistema:</td>
                    <td style="color: #1a1a2e; font-size: 15px; font-weight: 600; text-align: right; padding: 5px 0;">$25,000</td>
                  </tr>
                  <tr>
                    <td style="color: #555555; font-size: 15px; padding: 5px 0;">Crédito fiscal federal (30%):</td>
                    <td style="color: #16a34a; font-size: 15px; font-weight: 600; text-align: right; padding: 5px 0;">-$7,500</td>
                  </tr>
                  <tr style="border-top: 2px solid #e5e7eb;">
                    <td style="color: #1a1a2e; font-size: 16px; font-weight: 600; padding: 10px 0 0 0;">Costo neto:</td>
                    <td style="color: #ff0000; font-size: 18px; font-weight: 700; text-align: right; padding: 10px 0 0 0;">$17,500</td>
                  </tr>
                </table>
              </div>

              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Además, estás ahorrando <strong>${{estimatedSavings}} por año</strong> en electricidad. El crédito hace la energía solar aún más asequible desde el primer día.
              </p>

              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #ff0000; border-radius: 8px;">
                    <a href="https://quantumsolar.us/schedule" style="display: inline-block; padding: 18px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700;">
                      Calcular Mi Crédito Fiscal
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #888888; font-size: 13px; margin: 15px 0 0 0; text-align: center;">
                Consulta gratuita • Te mostraremos los números exactos
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a2e; padding: 30px 40px; text-align: center;">
              <p style="color: #ffffff; margin: 0 0 5px 0; font-size: 14px; font-weight: 600;">Quantum Solar Enterprises LLC</p>
              <p style="color: #a0a0a0; margin: 0 0 15px 0; font-size: 12px;">511 W 5th St, Tilton, IL 61833</p>
              <a href="{{unsubscribeUrl}}" style="color: #888888; font-size: 11px; text-decoration: underline;">Cancelar suscripción</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  text_template = '{{firstName}}, Esto Es Lo Que Necesitas Saber

⚠ URGENTE: Calendario de Reducción del Crédito Fiscal Federal

El crédito fiscal solar federal es uno de los mejores incentivos disponibles. Pero no es permanente.

CALENDARIO DEL CRÉDITO FISCAL SOLAR FEDERAL:
• 2024-2032: 30% ← Estás aquí
• 2033: 26%
• 2034: 22%
• 2035+: 0%

LO QUE ESTO SIGNIFICA PARA TI:
En un sistema típico de $25,000, el crédito del 30% = $7,500 de vuelta en tus impuestos. Dinero real que puedes reclamar en tu declaración de 2025.

EJEMPLO REAL:
Costo del sistema: $25,000
Crédito fiscal (30%): -$7,500
Costo neto: $17,500

Además estás ahorrando ${{estimatedSavings}}/año en electricidad. El crédito hace la energía solar aún más asequible desde el día uno.

Calcular tu crédito fiscal: https://quantumsolar.us/schedule
Consulta gratuita • Te mostraremos los números exactos

---
Quantum Solar Enterprises LLC
511 W 5th St, Tilton, IL 61833
Cancelar suscripción: {{unsubscribeUrl}}',
  updated_at = NOW()
WHERE name = 'Calculator ES - Recordatorio Crédito Fiscal' AND language = 'es';

-- Email 5: Último Recordatorio (Day 12)
UPDATE email_templates
SET
  subject_template = 'Una pregunta rápida, {{firstName}}',
  html_template = '<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seguimiento Rápido</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif;">
  <div style="display: none; max-height: 0; overflow: hidden;">
    Solo verificando una última vez sobre tus ahorros solares...
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Simple Header -->
          <tr>
            <td style="padding: 40px 40px 0 40px;">
              <img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="150" height="50" style="display: block;" />
            </td>
          </tr>

          <!-- Main Content - Personal Letter Style -->
          <tr>
            <td style="padding: 30px 40px 40px 40px;">
              <p style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                Hola {{firstName}},
              </p>

              <p style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                Noté que usaste nuestra calculadora solar pero no has agendado una consulta todavía. Lo entiendo completamente - es una gran decisión y la vida se pone ocupada.
              </p>

              <p style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                Tu calculadora mostró que podrías ahorrar <strong>${{estimatedSavings}} por año</strong>. Eso es dinero real. Pero también respeto tu tiempo, así que este será mi último correo a menos que quieras escuchar más.
              </p>

              <p style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
                <strong>Pregunta rápida:</strong> ¿Qué te está deteniendo?
              </p>

              <!-- Common Concerns -->
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                <p style="color: #1a1a2e; margin: 0 0 15px 0; font-size: 15px; font-weight: 600;">Si es una de estas, hablemos:</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong>"No estoy seguro del costo"</strong> → Tenemos opciones de $0 de enganche con pagos a menudo más bajos que tu factura actual
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong>"Mi techo podría necesitar trabajo"</strong> → Hacemos evaluaciones gratuitas de techo y podemos coordinar reparaciones necesarias
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong>"Hay muchas compañías solares dudosas"</strong> → Preocupación justa. Somos locales, licenciados en Illinois, y no vamos a ningún lado. Revisa nuestras opiniones.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong>"Simplemente no estoy listo todavía"</strong> → ¡No hay problema! Responde "más tarde" y me comunicaré en 6 meses
                    </td>
                  </tr>
                </table>
              </div>

              <p style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0;">
                De cualquier manera, aprecio que te hayas tomado el tiempo de explorar la energía solar. Si alguna vez tienes preguntas en el futuro, mi puerta siempre está abierta.
              </p>

              <!-- Simple CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background-color: #ff0000; border-radius: 8px;">
                          <a href="https://quantumsolar.us/schedule" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600;">
                            Sí, Hablemos
                          </a>
                        </td>
                        <td style="width: 15px;"></td>
                        <td style="background-color: #e5e7eb; border-radius: 8px;">
                          <a href="mailto:cesar@quantumsolar.us?subject=No%20me%20interesa%20energía%20solar" style="display: inline-block; padding: 16px 32px; color: #374151; text-decoration: none; font-size: 15px; font-weight: 600;">
                            No Me Interesa
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Signature -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-right: 15px; vertical-align: top;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                      <span style="color: white; font-size: 20px; font-weight: bold; line-height: 50px; text-align: center; display: block; width: 50px;">C</span>
                    </div>
                  </td>
                  <td style="vertical-align: top;">
                    <p style="color: #1a1a2e; margin: 0; font-size: 15px; font-weight: 600;">Cesar Lugo</p>
                    <p style="color: #888888; margin: 3px 0 0 0; font-size: 13px;">Fundador, Quantum Solar</p>
                    <p style="color: #888888; margin: 3px 0 0 0; font-size: 13px;">(407) 487-6890</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 25px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 12px;">Quantum Solar Enterprises LLC • 511 W 5th St, Tilton, IL 61833</p>
              <a href="{{unsubscribeUrl}}" style="color: #9ca3af; font-size: 11px; text-decoration: underline;">Cancelar suscripción</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  text_template = 'Hola {{firstName}},

Noté que usaste nuestra calculadora solar pero no has agendado una consulta todavía. Lo entiendo - es una gran decisión y la vida se pone ocupada.

Tu calculadora mostró que podrías ahorrar ${{estimatedSavings}} por año. Eso es dinero real. Pero también respeto tu tiempo, así que este será mi último correo a menos que quieras escuchar más.

Pregunta rápida: ¿Qué te está deteniendo?

SI ES UNA DE ESTAS, HABLEMOS:

• "No estoy seguro del costo" → Opciones de $0 de enganche, pagos a menudo más bajos que tu factura

• "Mi techo podría necesitar trabajo" → Evaluaciones gratuitas, coordinamos reparaciones

• "Muchas compañías solares dudosas" → Somos locales, licenciados en Illinois, no vamos a ningún lado

• "No estoy listo todavía" → ¡No hay problema! Responde "más tarde" y me comunicaré en 6 meses

De cualquier manera, aprecio que hayas explorado la energía solar. Si tienes preguntas en el futuro, mi puerta siempre está abierta.

→ Hablemos: https://quantumsolar.us/schedule
→ ¿No te interesa? Responde "no gracias"

Cesar Lugo
Fundador, Quantum Solar
(407) 487-6890

---
Quantum Solar Enterprises LLC
511 W 5th St, Tilton, IL 61833
Cancelar suscripción: {{unsubscribeUrl}}',
  updated_at = NOW()
WHERE name = 'Calculator ES - Último Recordatorio' AND language = 'es';

-- ============================================================================
-- Confirmation
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'SOLAR CALCULATOR (SPANISH) - 5 EMAILS REDESIGNED';
  RAISE NOTICE '============================================================================';
END $$;
