-- ============================================================================
-- QUANTUM SOLAR - SPLASH PAGE SPANISH EMAIL REDESIGN
-- Purpose: Complete redesign of Splash Page Spanish campaign (5 emails)
-- Date: 2025-12-01
-- IMPORTANT: Uses Spanish schedule link: https://quantumsolar.us/es/programar
-- ============================================================================

-- Email 1: Correo de Bienvenida (Day 0)
UPDATE email_templates
SET
  subject_template = '¡{{firstName}}, bienvenido a Quantum Solar! Tu camino hacia la energía solar comienza aquí',
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
                <tr><td style="padding: 10px 0;"><span style="color: #ff0000; margin-right: 10px;">✓</span><strong>Facturas de energía más bajas</strong> - Reduce o elimina tu pago de electricidad</td></tr>
                <tr><td style="padding: 10px 0;"><span style="color: #ff0000; margin-right: 10px;">✓</span><strong>30% de crédito fiscal</strong> - Recupera miles en tus impuestos de 2025</td></tr>
                <tr><td style="padding: 10px 0;"><span style="color: #ff0000; margin-right: 10px;">✓</span><strong>Aumenta el valor de tu hogar</strong> - La energía solar agrega 4.1% al valor de reventa</td></tr>
                <tr><td style="padding: 10px 0;"><span style="color: #ff0000; margin-right: 10px;">✓</span><strong>Independencia energética</strong> - Asegura tu tarifa, nunca te preocupes por costos crecientes</td></tr>
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
  text_template = '¡Bienvenido {{firstName}}! Tu Camino Hacia la Energía Solar Comienza Aquí

¡Gracias por contactar a Quantum Solar! Ayudamos a propietarios en {{city}} a ahorrar dinero y tomar control de su futuro energético.

La mayoría de propietarios en Illinois ahorran $1,500-$3,000 por año con energía solar

POR QUÉ ELIGEN ENERGÍA SOLAR:
✓ Facturas más bajas - Reduce o elimina tu pago de electricidad
✓ 30% de crédito fiscal - Recupera miles en tus impuestos 2025
✓ Aumenta el valor - Agrega 4.1% al valor de reventa
✓ Independencia energética - Asegura tarifas, evita costos crecientes

Agendar consulta gratuita: https://quantumsolar.us/es/programar
Gratis • Sin obligación • Toma 15 minutos

Quantum Solar Enterprises LLC
511 W 5th St, Tilton, IL 61833 • (407) 487-6890
Cancelar suscripción: {{unsubscribeUrl}}',
  updated_at = NOW()
WHERE name = 'Splash ES - Correo de Bienvenida' AND language = 'es';

-- Email 2: Beneficios Solares (Day 3)
UPDATE email_templates
SET
  subject_template = '5 formas en que la energía solar ahorra dinero a propietarios en {{city}}',
  html_template = '<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>5 Formas de Ahorrar con Solar</title></head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
    <tr><td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
              <img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="180" height="60" style="display: block; margin: 0 auto;" />
            </td>
          </tr>
          <tr><td style="padding: 40px;">
              <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">5 Formas en Que la Energía Solar Ahorra Dinero</h2>
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Hola {{firstName}}, la energía solar no solo es buena para el planeta - es excelente para tu billetera. Aquí hay 5 formas comprobadas en que solar pone dinero de vuelta en tu bolsillo:
              </p>
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
                <h3 style="color: #ff0000; margin: 0 0 10px 0; font-size: 18px;">1. Facturas Mensuales Más Bajas</h3>
                <p style="color: #555555; margin: 0; font-size: 15px; line-height: 1.6;">
                  Tus paneles generan electricidad gratis durante el día, reduciendo drásticamente lo que pagas a la compañía eléctrica. Muchos propietarios reducen sus facturas 70-100%.
                </p>
              </div>
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
                <h3 style="color: #ff0000; margin: 0 0 10px 0; font-size: 18px;">2. 30% de Crédito Fiscal Federal</h3>
                <p style="color: #555555; margin: 0; font-size: 15px; line-height: 1.6;">
                  En un sistema de $25,000, recibes $7,500 de vuelta como crédito directo en tus impuestos federales. No es una deducción - es dinero real.
                </p>
              </div>
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
                <h3 style="color: #ff0000; margin: 0 0 10px 0; font-size: 18px;">3. Medición Neta de Illinois</h3>
                <p style="color: #555555; margin: 0; font-size: 15px; line-height: 1.6;">
                  El exceso de energía que generas va a la red, y recibes crédito 1:1. Usa esos créditos por la noche o días nublados. Es como tener una batería gratis.
                </p>
              </div>
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
                <h3 style="color: #ff0000; margin: 0 0 10px 0; font-size: 18px;">4. Protección Contra Aumentos de Tarifas</h3>
                <p style="color: #555555; margin: 0; font-size: 15px; line-height: 1.6;">
                  Las tarifas eléctricas suben 2-4% anualmente. Con solar, aseguras tu costo de energía. Durante 25 años, esto ahorra decenas de miles en aumentos evitados.
                </p>
              </div>
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <h3 style="color: #ff0000; margin: 0 0 10px 0; font-size: 18px;">5. Aumento del Valor de Tu Hogar</h3>
                <p style="color: #555555; margin: 0; font-size: 15px; line-height: 1.6;">
                  Los estudios muestran que la energía solar agrega un promedio de 4.1% al valor de reventa de tu hogar. En una casa de $300,000, eso es $12,300 en plusvalía.
                </p>
              </div>
              <div style="background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%); border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 30px;">
                <p style="color: #ffffff; margin: 0; font-size: 17px; font-weight: 600;">
                  Combinados, estos beneficios significan que a menudo GANAS dinero, no lo gastas
                </p>
              </div>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr><td style="background-color: #ff0000; border-radius: 8px;">
                    <a href="https://quantumsolar.us/es/programar" style="display: inline-block; padding: 18px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700;">
                      Ver Mis Ahorros Exactos
                    </a>
                  </td></tr>
              </table>
            </td></tr>
          <tr>
            <td style="background-color: #1a1a2e; padding: 30px 40px; text-align: center;">
              <p style="color: #ffffff; margin: 0 0 5px 0; font-size: 14px; font-weight: 600;">Quantum Solar Enterprises LLC</p>
              <p style="color: #a0a0a0; margin: 0 0 15px 0; font-size: 12px;">511 W 5th St, Tilton, IL 61833</p>
              <a href="{{unsubscribeUrl}}" style="color: #888888; font-size: 11px; text-decoration: underline;">Cancelar suscripción</a>
            </td>
          </tr>
        </table>
      </td></tr>
  </table>
</body>
</html>',
  text_template = '5 Formas en Que la Energía Solar Ahorra Dinero

Hola {{firstName}}, la energía solar no solo es buena para el planeta - es excelente para tu billetera.

1. FACTURAS MENSUALES MÁS BAJAS
Tus paneles generan electricidad gratis, reduciendo facturas 70-100%.

2. 30% CRÉDITO FISCAL FEDERAL
En sistema de $25,000 = $7,500 de vuelta. Dinero real, no deducción.

3. MEDICIÓN NETA DE ILLINOIS
Exceso energía → red → créditos 1:1 → Usa de noche. Batería gratis.

4. PROTECCIÓN CONTRA AUMENTOS
Tarifas suben 2-4%/año. Solar asegura tu costo. Ahorra decenas de miles.

5. AUMENTO VALOR DE HOGAR
Solar agrega 4.1% a valor de reventa. Casa $300k = $12,300 en plusvalía.

Combinados, a menudo GANAS dinero, no lo gastas.

Ver tus ahorros: https://quantumsolar.us/es/programar

Quantum Solar Enterprises LLC
Cancelar suscripción: {{unsubscribeUrl}}',
  updated_at = NOW()
WHERE name = 'Splash ES - Beneficios Solares' AND language = 'es';

-- Email 3: Opciones de Financiamiento (Day 6)
UPDATE email_templates
SET
  subject_template = '{{firstName}}, Solar con $0 de Enganche es Real - Así Funciona',
  html_template = '<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Opciones de Solar con $0</title></head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
    <tr><td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
              <img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="180" height="60" style="display: block; margin: 0 auto;" />
            </td>
          </tr>
          <tr><td style="padding: 40px;">
              <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">{{firstName}}, No Necesitas Efectivo Para Instalar Solar</h2>
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                La pregunta #1 que recibimos: <em>"¿Cómo pago por solar?"</em> Aquí está la verdad - tienes más opciones de las que piensas, y la mayoría no requieren dinero inicial.
              </p>
              <div style="background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%); border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 30px;">
                <p style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">
                  90% de nuestros clientes eligen financiamiento de $0 de enganche
                </p>
              </div>
              <h3 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 18px;">Tus 3 Opciones de Financiamiento Solar:</h3>
              <div style="background-color: #f8fafc; border-left: 4px solid #ff0000; border-radius: 0 12px 12px 0; padding: 25px; margin-bottom: 20px;">
                <h4 style="color: #ff0000; margin: 0 0 10px 0; font-size: 16px;">1. Préstamo Solar (Más Popular)</h4>
                <p style="color: #555555; margin: 0 0 10px 0; font-size: 15px; line-height: 1.6;">
                  <strong>Cómo funciona:</strong> Financia tu sistema con $0 de enganche. Pagos mensuales a menudo más bajos que tu factura eléctrica actual.
                </p>
                <p style="color: #555555; margin: 0; font-size: 15px; line-height: 1.6;">
                  <strong>Mejor para:</strong> Propietarios que quieren ser dueños del sistema, maximizar créditos fiscales y construir plusvalía.
                </p>
              </div>
              <div style="background-color: #f8fafc; border-left: 4px solid #ff0000; border-radius: 0 12px 12px 0; padding: 25px; margin-bottom: 20px;">
                <h4 style="color: #ff0000; margin: 0 0 10px 0; font-size: 16px;">2. Compra en Efectivo</h4>
                <p style="color: #555555; margin: 0 0 10px 0; font-size: 15px; line-height: 1.6;">
                  <strong>Cómo funciona:</strong> Paga por adelantado, obtén el crédito fiscal del 30%, y disfruta el ROI más rápido (típicamente 6-8 años).
                </p>
                <p style="color: #555555; margin: 0; font-size: 15px; line-height: 1.6;">
                  <strong>Mejor para:</strong> Propietarios con capital disponible que quieren máximos ahorros a largo plazo.
                </p>
              </div>
              <div style="background-color: #f8fafc; border-left: 4px solid #ff0000; border-radius: 0 12px 12px 0; padding: 25px; margin-bottom: 30px;">
                <h4 style="color: #ff0000; margin: 0 0 10px 0; font-size: 16px;">3. Arrendamiento / PPA Solar</h4>
                <p style="color: #555555; margin: 0 0 10px 0; font-size: 15px; line-height: 1.6;">
                  <strong>Cómo funciona:</strong> Nosotros instalamos y mantenemos el sistema. Tú pagas una cuota mensual fija o tarifa por kWh.
                </p>
                <p style="color: #555555; margin: 0; font-size: 15px; line-height: 1.6;">
                  <strong>Mejor para:</strong> Propietarios que quieren cero mantenimiento y costos predecibles sin ser dueños.
                </p>
              </div>
              <div style="background-color: #dcfce7; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <p style="color: #166534; margin: 0; font-size: 15px; line-height: 1.6;">
                  <strong>💡 Consejo:</strong> Con préstamos solares de $0 de enganche, tu pago mensual es a menudo <strong>menor</strong> que tu factura eléctrica actual - significa que empiezas a ahorrar desde el día uno.
                </p>
              </div>
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                ¿No estás seguro cuál opción es correcta para ti? Para eso es exactamente nuestra consulta gratuita. Revisaremos todas las opciones, calcularemos los números y te ayudaremos a elegir lo mejor para tu situación.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr><td style="background-color: #ff0000; border-radius: 8px;">
                    <a href="https://quantumsolar.us/es/programar" style="display: inline-block; padding: 18px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700;">
                      Explorar Mis Opciones
                    </a>
                  </td></tr>
              </table>
              <p style="color: #888888; font-size: 13px; margin: 15px 0 0 0; text-align: center;">
                No requiere verificación de crédito para comenzar
              </p>
            </td></tr>
          <tr>
            <td style="background-color: #1a1a2e; padding: 30px 40px; text-align: center;">
              <p style="color: #ffffff; margin: 0 0 5px 0; font-size: 14px; font-weight: 600;">Quantum Solar Enterprises LLC</p>
              <p style="color: #a0a0a0; margin: 0 0 15px 0; font-size: 12px;">511 W 5th St, Tilton, IL 61833</p>
              <a href="{{unsubscribeUrl}}" style="color: #888888; font-size: 11px; text-decoration: underline;">Cancelar suscripción</a>
            </td>
          </tr>
        </table>
      </td></tr>
  </table>
</body>
</html>',
  text_template = '{{firstName}}, No Necesitas Efectivo Para Instalar Solar

Pregunta #1: "¿Cómo pago?" Tienes más opciones de las que piensas.

90% de nuestros clientes eligen $0 de enganche

TUS 3 OPCIONES:

1. PRÉSTAMO SOLAR (Más Popular)
Financia con $0 enganche. Pagos a menudo < factura actual.
Mejor para: Ser dueño, créditos fiscales, plusvalía.

2. COMPRA EN EFECTIVO
Paga adelantado, obtén 30% crédito, ROI rápido (6-8 años).
Mejor para: Capital disponible, máximos ahorros largo plazo.

3. ARRENDAMIENTO / PPA
Instalamos y mantenemos. Pagas cuota fija mensual.
Mejor para: Cero mantenimiento, costos predecibles.

💡 CONSEJO: Préstamos $0 enganche tienen pagos MENORES que factura - ahorras desde día uno.

¿No estás seguro? Consulta gratuita para revisar opciones.

Explorar opciones: https://quantumsolar.us/es/programar
Sin verificación de crédito

Quantum Solar Enterprises LLC
Cancelar suscripción: {{unsubscribeUrl}}',
  updated_at = NOW()
WHERE name = 'Splash ES - Opciones de Financiamiento' AND language = 'es';

-- Email 4: Testimonios (Day 10)
UPDATE email_templates
SET
  subject_template = 'Por qué más de 500 familias de Illinois eligieron Quantum Solar',
  html_template = '<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Historias de Éxito Solar en Illinois</title></head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
    <tr><td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
              <img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="180" height="60" style="display: block; margin: 0 auto;" />
            </td>
          </tr>
          <tr><td style="padding: 40px;">
              <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">{{firstName}}, No Estás Solo en Esta Decisión</h2>
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Más de <strong>500 propietarios en Illinois</strong> ya han hecho el cambio a energía solar con Quantum Solar. Esto es lo que están diciendo:
              </p>
              <div style="background-color: #f8fafc; border-left: 4px solid #ff0000; border-radius: 0 12px 12px 0; padding: 25px; margin-bottom: 20px;">
                <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0; font-style: italic;">
                  "Nuestra factura eléctrica bajó de $287/mes a $12. Estamos poniendo esos $275 de ahorros hacia el fondo universitario de nuestros hijos. La mejor decisión financiera que hemos tomado."
                </p>
                <p style="color: #1a1a2e; margin: 0; font-size: 14px; font-weight: 600;">— Mike & Sarah T., Champaign</p>
                <p style="color: #888888; margin: 5px 0 0 0; font-size: 13px;">Sistema 10.2 kW • Ahorrando $3,300/año</p>
              </div>
              <div style="background-color: #f8fafc; border-left: 4px solid #ff0000; border-radius: 0 12px 12px 0; padding: 25px; margin-bottom: 20px;">
                <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0; font-style: italic;">
                  "Era escéptica al principio, pero los números tenían sentido. Mi pago solar es en realidad $40 MENOS que mi antigua factura eléctrica. ¿Por qué no hice esto antes?"
                </p>
                <p style="color: #1a1a2e; margin: 0; font-size: 14px; font-weight: 600;">— Jennifer R., Decatur</p>
                <p style="color: #888888; margin: 5px 0 0 0; font-size: 13px;">Sistema 8.5 kW • $0 de enganche</p>
              </div>
              <div style="background-color: #f8fafc; border-left: 4px solid #ff0000; border-radius: 0 12px 12px 0; padding: 25px; margin-bottom: 30px;">
                <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0; font-style: italic;">
                  "El equipo de Quantum fue profesional de principio a fin. La instalación tomó 2 días, y manejaron todos los permisos y papeleo. No podríamos estar más felices."
                </p>
                <p style="color: #1a1a2e; margin: 0; font-size: 14px; font-weight: 600;">— Robert & Linda K., Springfield</p>
                <p style="color: #888888; margin: 5px 0 0 0; font-size: 13px;">Sistema 12 kW • Incluye batería de respaldo</p>
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px; text-align: center; width: 33%;">
                    <p style="color: #ff0000; margin: 0; font-size: 32px; font-weight: 700;">500+</p>
                    <p style="color: #a0a0a0; margin: 5px 0 0 0; font-size: 12px;">Hogares Energizados en IL</p>
                  </td>
                  <td style="padding: 25px; text-align: center; width: 33%; border-left: 1px solid #333; border-right: 1px solid #333;">
                    <p style="color: #ff0000; margin: 0; font-size: 32px; font-weight: 700;">4.9</p>
                    <p style="color: #a0a0a0; margin: 5px 0 0 0; font-size: 12px;">Calificación Google</p>
                  </td>
                  <td style="padding: 25px; text-align: center; width: 33%;">
                    <p style="color: #ff0000; margin: 0; font-size: 32px; font-weight: 700;">$2.8M</p>
                    <p style="color: #a0a0a0; margin: 5px 0 0 0; font-size: 12px;">Ahorros de Clientes</p>
                  </td>
                </tr>
              </table>
              <div style="background-color: #dcfce7; border-radius: 12px; padding: 20px; margin-bottom: 30px; text-align: center;">
                <p style="color: #166534; margin: 0; font-size: 16px; font-weight: 600;">
                  Tus vecinos hicieron el cambio. ¿Listo para unirte a ellos?
                </p>
              </div>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr><td style="background-color: #ff0000; border-radius: 8px;">
                    <a href="https://quantumsolar.us/es/programar" style="display: inline-block; padding: 18px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700;">
                      Unirme a Nuestra Familia Solar
                    </a>
                  </td></tr>
              </table>
            </td></tr>
          <tr>
            <td style="background-color: #1a1a2e; padding: 30px 40px; text-align: center;">
              <p style="color: #ffffff; margin: 0 0 5px 0; font-size: 14px; font-weight: 600;">Quantum Solar Enterprises LLC</p>
              <p style="color: #a0a0a0; margin: 0 0 15px 0; font-size: 12px;">511 W 5th St, Tilton, IL 61833</p>
              <a href="{{unsubscribeUrl}}" style="color: #888888; font-size: 11px; text-decoration: underline;">Cancelar suscripción</a>
            </td>
          </tr>
        </table>
      </td></tr>
  </table>
</body>
</html>',
  text_template = '{{firstName}}, No Estás Solo en Esta Decisión

Más de 500 propietarios en Illinois han hecho el cambio con Quantum Solar.

LO QUE ESTÁN DICIENDO:

"Factura bajó de $287/mes a $12. Poniendo $275 de ahorros hacia universidad. Mejor decisión."
— Mike & Sarah T., Champaign
Sistema 10.2 kW • Ahorrando $3,300/año

"Mi pago solar es $40 MENOS que factura antigua. ¿Por qué no hice esto antes?"
— Jennifer R., Decatur
Sistema 8.5 kW • $0 de enganche

"Profesionales de principio a fin. Instalación 2 días, manejaron permisos."
— Robert & Linda K., Springfield
Sistema 12 kW • Batería respaldo

POR LOS NÚMEROS:
• 500+ Hogares Energizados en Illinois
• 4.9 Calificación Google
• $2.8M en Ahorros de Clientes

Tus vecinos hicieron el cambio. ¿Listo para unirte?

Unirte a familia solar: https://quantumsolar.us/es/programar

Quantum Solar Enterprises LLC
Cancelar suscripción: {{unsubscribeUrl}}',
  updated_at = NOW()
WHERE name = 'Splash ES - Testimonios' AND language = 'es';

-- Email 5: Oferta Por Tiempo Limitado (Day 14)
UPDATE email_templates
SET
  subject_template = '{{firstName}}, tu consulta gratuita te está esperando',
  html_template = '<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Consulta Solar Gratuita</title></head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
    <tr><td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 0 40px;">
              <img src="https://crm.quantumsolar.us/Quantum%20Solar-LOGO-B1%20cropped.png" alt="Quantum Solar" width="150" height="50" style="display: block;" />
            </td>
          </tr>
          <tr><td style="padding: 30px 40px 40px 40px;">
              <p style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">Hola {{firstName}},</p>
              <p style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                Quería contactarte una vez más porque genuinamente creo que la energía solar podría ser excelente para ti. Pero también respeto tu tiempo, así que este será mi último correo a menos que quieras escuchar más.
              </p>
              <p style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
                <strong>Esto es lo que obtienes en tu consulta gratuita:</strong>
              </p>
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr><td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong style="color: #ff0000;">✓</strong> Diseño solar personalizado para tu techo específico
                    </td></tr>
                  <tr><td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong style="color: #ff0000;">✓</strong> Análisis exacto de ahorros (proyección 25 años)
                    </td></tr>
                  <tr><td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong style="color: #ff0000;">✓</strong> Tu cantidad de crédito fiscal federal calculada
                    </td></tr>
                  <tr><td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong style="color: #ff0000;">✓</strong> Todas las opciones de financiamiento con números reales
                    </td></tr>
                  <tr><td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong style="color: #ff0000;">✓</strong> Respuestas a todas tus preguntas (sin presión, nunca)
                    </td></tr>
                </table>
              </div>
              <div style="background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%); border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 25px;">
                <p style="color: #ffffff; margin: 0; font-size: 17px; font-weight: 600;">
                  15 minutos de tu tiempo podrían ahorrarte miles por año
                </p>
              </div>
              <p style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
                <strong>¿Aún no estás seguro?</strong> Estas son las preocupaciones más comunes que escuchamos:
              </p>
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr><td style="padding: 6px 0; color: #555555; font-size: 14px;">
                      <strong>"No puedo pagarlo"</strong> → Opciones $0 enganche, pagos a menudo < factura
                    </td></tr>
                  <tr><td style="padding: 6px 0; color: #555555; font-size: 14px;">
                      <strong>"Mi techo podría necesitar trabajo"</strong> → Evaluación gratuita incluida
                    </td></tr>
                  <tr><td style="padding: 6px 0; color: #555555; font-size: 14px;">
                      <strong>"No confío en compañías solares"</strong> → Somos locales, licenciados, 500+ clientes
                    </td></tr>
                  <tr><td style="padding: 6px 0; color: #555555; font-size: 14px;">
                      <strong>"Necesito pensarlo"</strong> → ¡Perfecto! La consulta te da info para decidir
                    </td></tr>
                </table>
              </div>
              <p style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0;">
                De cualquier manera, aprecio que hayas tomado el tiempo de explorar energía solar. Si alguna vez tienes preguntas, siempre estamos aquí para ayudar.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr><td>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background-color: #ff0000; border-radius: 8px;">
                          <a href="https://quantumsolar.us/es/programar" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600;">
                            Reservar Mi Consulta Gratuita
                          </a>
                        </td>
                        <td style="width: 15px;"></td>
                        <td style="background-color: #e5e7eb; border-radius: 8px;">
                          <a href="mailto:cesar@quantumsolar.us?subject=No%20me%20interesa" style="display: inline-block; padding: 16px 32px; color: #374151; text-decoration: none; font-size: 15px; font-weight: 600;">
                            No Me Interesa
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td></tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-right: 15px; vertical-align: top;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%); border-radius: 50%;">
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
            </td></tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 25px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 12px;">Quantum Solar Enterprises LLC • 511 W 5th St, Tilton, IL 61833</p>
              <a href="{{unsubscribeUrl}}" style="color: #9ca3af; font-size: 11px; text-decoration: underline;">Cancelar suscripción</a>
            </td>
          </tr>
        </table>
      </td></tr>
  </table>
</body>
</html>',
  text_template = 'Hola {{firstName}},

Quería contactarte una vez más porque genuinamente creo que solar podría ser excelente para ti. Este será mi último correo a menos que quieras escuchar más.

LO QUE OBTIENES EN TU CONSULTA GRATUITA:
✓ Diseño solar personalizado para tu techo
✓ Análisis exacto de ahorros (proyección 25 años)
✓ Tu cantidad de crédito fiscal calculada
✓ Todas las opciones con números reales
✓ Respuestas a preguntas (sin presión, nunca)

15 minutos podrían ahorrarte miles por año

¿AÚN NO ESTÁS SEGURO? Preocupaciones comunes:
• "No puedo pagarlo" → $0 enganche, pagos < factura
• "Techo podría necesitar trabajo" → Evaluación gratuita
• "No confío en compañías solares" → Locales, licenciados, 500+ clientes
• "Necesito pensarlo" → ¡Consulta te da info para decidir!

De cualquier manera, aprecio que hayas explorado solar. ¿Preguntas? Siempre aquí.

→ Reservar consulta: https://quantumsolar.us/es/programar
→ ¿No te interesa? Responde "no gracias"

Cesar Lugo
Fundador, Quantum Solar
(407) 487-6890

---
Quantum Solar Enterprises LLC
511 W 5th St, Tilton, IL 61833
Cancelar suscripción: {{unsubscribeUrl}}',
  updated_at = NOW()
WHERE name = 'Splash ES - Oferta Por Tiempo Limitado' AND language = 'es';

DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'SPLASH PAGE (SPANISH) - ALL 5 EMAILS REDESIGNED';
  RAISE NOTICE 'Spanish schedule link: https://quantumsolar.us/es/programar';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE ' ';
  RAISE NOTICE 'EMAIL CAMPAIGN REDESIGN 100%% COMPLETE!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Total: 20 professional email templates across 4 campaigns';
  RAISE NOTICE '  - Solar Calculator (EN): 5 emails';
  RAISE NOTICE '  - Solar Calculator (ES): 5 emails';
  RAISE NOTICE '  - Splash Page (EN): 5 emails';
  RAISE NOTICE '  - Splash Page (ES): 5 emails';
  RAISE NOTICE '============================================================================';
END $$;
