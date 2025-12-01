-- ============================================================================
-- SEED: Solar Calculator & Splash Page Email Campaigns (English & Spanish)
-- Created: 2025-11-30
-- ============================================================================

-- Delete existing campaigns with these names (to allow re-running)
DELETE FROM email_sequences WHERE campaign_id IN (
  SELECT id FROM email_campaigns WHERE name IN (
    'Solar Calculator Lead Nurture (English)',
    'Solar Calculator Lead Nurture (Spanish)',
    'Splash Page Lead Nurture (English)',
    'Splash Page Lead Nurture (Spanish)'
  )
);

DELETE FROM email_templates WHERE name LIKE 'Calculator EN%' OR name LIKE 'Calculator ES%' OR name LIKE 'Splash EN%' OR name LIKE 'Splash ES%';

DELETE FROM email_campaigns WHERE name IN (
  'Solar Calculator Lead Nurture (English)',
  'Solar Calculator Lead Nurture (Spanish)',
  'Splash Page Lead Nurture (English)',
  'Splash Page Lead Nurture (Spanish)'
);

-- ============================================================================
-- CAMPAIGN 1: SOLAR CALCULATOR - ENGLISH
-- ============================================================================

INSERT INTO email_campaigns (name, description, trigger_type, trigger_conditions, active)
VALUES (
  'Solar Calculator Lead Nurture (English)',
  '5-email sequence for solar calculator submissions that did not convert to fully qualified leads. Focuses on completing their solar assessment.',
  'form_submission',
  '{"source_type": "solar_calculator", "language": "en", "form_type": "calculator"}'::jsonb,
  true
);

-- Templates for Calculator English
INSERT INTO email_templates (name, category, subject_template, html_template, text_template, variables, language, active)
VALUES
(
  'Calculator EN - Welcome & Results',
  'welcome',
  '{{firstName}}, Your Solar Savings Estimate: ${{estimatedSavings}}/yr',
  '<p>Hi {{firstName}}, Thanks for using our solar calculator! Based on your information, your estimated annual savings are ${{estimatedSavings}}. <a href="https://quantumsolar.us/schedule">Get Your Free Custom Design</a></p>',
  'Hi {{firstName}}, Thanks for using our solar calculator! Your estimated annual savings: ${{estimatedSavings}}. Get your free design: https://quantumsolar.us/schedule',
  '["firstName", "city", "estimatedSavings", "electricBill", "systemSize", "unsubscribeUrl"]'::jsonb,
  'en',
  true
),
(
  'Calculator EN - Complete Your Quote',
  'follow_up',
  '{{firstName}}, Your Custom Solar Design is Waiting',
  '<p>Hi {{firstName}}, You could save ${{estimatedSavings}} per year with solar. Ready to see your personalized design? <a href="https://quantumsolar.us/schedule">Schedule My Free Consultation</a></p>',
  'Hi {{firstName}}, You could save ${{estimatedSavings}} per year. Schedule your consultation: https://quantumsolar.us/schedule',
  '["firstName", "estimatedSavings", "unsubscribeUrl"]'::jsonb,
  'en',
  true
),
(
  'Calculator EN - How Solar Works',
  'educational',
  'How Solar Actually Works for {{city}} Homes',
  '<p>Hi {{firstName}}, Wondering how solar works? 1) Panels generate power 2) Your home uses it first 3) Excess goes to grid 4) You save money. Illinois has great net metering! <a href="https://quantumsolar.us/schedule">Get My Custom Analysis</a></p>',
  'Hi {{firstName}}, How solar works: 1) Panels generate power 2) Home uses it first 3) Excess to grid 4) You save. Get analysis: https://quantumsolar.us/schedule',
  '["firstName", "city", "unsubscribeUrl"]'::jsonb,
  'en',
  true
),
(
  'Calculator EN - Tax Credit Reminder',
  'urgency',
  '{{firstName}}, Don''t Miss the 30% Federal Tax Credit',
  '<p>Hi {{firstName}}, The 30% federal tax credit could save you ${{taxCredit}}! This credit steps down over time. <a href="https://quantumsolar.us/schedule">Lock In My Tax Credit</a></p>',
  'Hi {{firstName}}, 30% tax credit = ${{taxCredit}} back! Lock it in: https://quantumsolar.us/schedule',
  '["firstName", "taxCredit", "unsubscribeUrl"]'::jsonb,
  'en',
  true
),
(
  'Calculator EN - Final Reminder',
  'cta',
  'Last Chance: Your Solar Estimate Expires Soon',
  '<p>Hi {{firstName}}, One last reminder about your ${{estimatedSavings}}/year solar savings potential. Have questions? <a href="https://quantumsolar.us/schedule">Yes, I Have Questions</a></p>',
  'Hi {{firstName}}, Last chance for ${{estimatedSavings}}/year savings. Questions? https://quantumsolar.us/schedule',
  '["firstName", "estimatedSavings", "unsubscribeUrl"]'::jsonb,
  'en',
  true
);

-- Create sequences for Calculator English
INSERT INTO email_sequences (campaign_id, sequence_order, template_id, delay_days, delay_hours, send_time_hour, active)
SELECT
  c.id,
  t.seq_order,
  t.id,
  t.delay,
  0,
  9,
  true
FROM email_campaigns c
CROSS JOIN (
  SELECT id, 1 as seq_order, 0 as delay FROM email_templates WHERE name = 'Calculator EN - Welcome & Results' AND language = 'en'
  UNION ALL
  SELECT id, 2, 2 FROM email_templates WHERE name = 'Calculator EN - Complete Your Quote' AND language = 'en'
  UNION ALL
  SELECT id, 3, 5 FROM email_templates WHERE name = 'Calculator EN - How Solar Works' AND language = 'en'
  UNION ALL
  SELECT id, 4, 8 FROM email_templates WHERE name = 'Calculator EN - Tax Credit Reminder' AND language = 'en'
  UNION ALL
  SELECT id, 5, 12 FROM email_templates WHERE name = 'Calculator EN - Final Reminder' AND language = 'en'
) t
WHERE c.name = 'Solar Calculator Lead Nurture (English)';

-- ============================================================================
-- CAMPAIGN 2: SOLAR CALCULATOR - SPANISH
-- ============================================================================

INSERT INTO email_campaigns (name, description, trigger_type, trigger_conditions, active)
VALUES (
  'Solar Calculator Lead Nurture (Spanish)',
  'Secuencia de 5 correos para leads del calculador solar que no se convirtieron en leads completamente calificados.',
  'form_submission',
  '{"source_type": "solar_calculator", "language": "es", "form_type": "calculator"}'::jsonb,
  true
);

-- Templates for Calculator Spanish
INSERT INTO email_templates (name, category, subject_template, html_template, text_template, variables, language, active)
VALUES
(
  'Calculator ES - Bienvenida y Resultados',
  'welcome',
  '{{firstName}}, Tu Estimado de Ahorro Solar: ${{estimatedSavings}}/año',
  '<p>Hola {{firstName}}, Gracias por usar nuestra calculadora solar! Tu ahorro anual estimado: ${{estimatedSavings}}. <a href="https://quantumsolar.us/schedule">Obtener Mi Diseño Gratuito</a></p>',
  'Hola {{firstName}}, Gracias por usar nuestra calculadora! Ahorro estimado: ${{estimatedSavings}}. Diseño gratuito: https://quantumsolar.us/schedule',
  '["firstName", "city", "estimatedSavings", "electricBill", "systemSize", "unsubscribeUrl"]'::jsonb,
  'es',
  true
),
(
  'Calculator ES - Completa Tu Cotización',
  'follow_up',
  '{{firstName}}, Tu Diseño Solar Personalizado Te Espera',
  '<p>Hola {{firstName}}, Podrías ahorrar ${{estimatedSavings}} por año. <a href="https://quantumsolar.us/schedule">Agendar Mi Consulta Gratuita</a></p>',
  'Hola {{firstName}}, Ahorra ${{estimatedSavings}}/año. Consulta: https://quantumsolar.us/schedule',
  '["firstName", "estimatedSavings", "unsubscribeUrl"]'::jsonb,
  'es',
  true
),
(
  'Calculator ES - Cómo Funciona Solar',
  'educational',
  'Cómo Funciona la Energía Solar para Hogares en {{city}}',
  '<p>Hola {{firstName}}, Cómo funciona: 1) Paneles generan energía 2) Tu hogar la usa primero 3) Exceso va a la red 4) Tú ahorras. <a href="https://quantumsolar.us/schedule">Obtener Mi Análisis</a></p>',
  'Hola {{firstName}}, Cómo funciona solar: 1) Paneles generan 2) Hogar usa 3) Exceso a red 4) Ahorras. Análisis: https://quantumsolar.us/schedule',
  '["firstName", "city", "unsubscribeUrl"]'::jsonb,
  'es',
  true
),
(
  'Calculator ES - Recordatorio Crédito Fiscal',
  'urgency',
  '{{firstName}}, No Pierdas el 30% de Crédito Fiscal Federal',
  '<p>Hola {{firstName}}, El crédito fiscal del 30% = ${{taxCredit}} de vuelta! <a href="https://quantumsolar.us/schedule">Asegurar Mi Crédito Fiscal</a></p>',
  'Hola {{firstName}}, 30% crédito fiscal = ${{taxCredit}}! Asegurar: https://quantumsolar.us/schedule',
  '["firstName", "taxCredit", "unsubscribeUrl"]'::jsonb,
  'es',
  true
),
(
  'Calculator ES - Último Recordatorio',
  'cta',
  'Última Oportunidad: Tu Estimado Solar Expira Pronto',
  '<p>Hola {{firstName}}, Último recordatorio sobre tus ahorros de ${{estimatedSavings}}/año. <a href="https://quantumsolar.us/schedule">Sí, Tengo Preguntas</a></p>',
  'Hola {{firstName}}, Última oportunidad: ${{estimatedSavings}}/año. Preguntas: https://quantumsolar.us/schedule',
  '["firstName", "estimatedSavings", "unsubscribeUrl"]'::jsonb,
  'es',
  true
);

-- Create sequences for Calculator Spanish
INSERT INTO email_sequences (campaign_id, sequence_order, template_id, delay_days, delay_hours, send_time_hour, active)
SELECT
  c.id,
  t.seq_order,
  t.id,
  t.delay,
  0,
  9,
  true
FROM email_campaigns c
CROSS JOIN (
  SELECT id, 1 as seq_order, 0 as delay FROM email_templates WHERE name = 'Calculator ES - Bienvenida y Resultados' AND language = 'es'
  UNION ALL
  SELECT id, 2, 2 FROM email_templates WHERE name = 'Calculator ES - Completa Tu Cotización' AND language = 'es'
  UNION ALL
  SELECT id, 3, 5 FROM email_templates WHERE name = 'Calculator ES - Cómo Funciona Solar' AND language = 'es'
  UNION ALL
  SELECT id, 4, 8 FROM email_templates WHERE name = 'Calculator ES - Recordatorio Crédito Fiscal' AND language = 'es'
  UNION ALL
  SELECT id, 5, 12 FROM email_templates WHERE name = 'Calculator ES - Último Recordatorio' AND language = 'es'
) t
WHERE c.name = 'Solar Calculator Lead Nurture (Spanish)';

-- ============================================================================
-- CAMPAIGN 3: SPLASH PAGE - ENGLISH
-- ============================================================================

INSERT INTO email_campaigns (name, description, trigger_type, trigger_conditions, active)
VALUES (
  'Splash Page Lead Nurture (English)',
  '5-email sequence for splash page form submissions. General solar education and conversion focused.',
  'form_submission',
  '{"source_type": "splash_page", "language": "en", "form_type": "splash"}'::jsonb,
  true
);

-- Templates for Splash English
INSERT INTO email_templates (name, category, subject_template, html_template, text_template, variables, language, active)
VALUES
(
  'Splash EN - Welcome Email',
  'welcome',
  '{{firstName}}, Your Solar Journey Starts Here!',
  '<p>Hi {{firstName}}, Thanks for reaching out to Quantum Solar! We help {{city}} homeowners save with solar. <a href="https://quantumsolar.us/schedule">Schedule Free Consultation</a></p>',
  'Hi {{firstName}}, Thanks for reaching out! Schedule consultation: https://quantumsolar.us/schedule',
  '["firstName", "city", "electricBill", "unsubscribeUrl"]'::jsonb,
  'en',
  true
),
(
  'Splash EN - Solar Benefits',
  'educational',
  '5 Ways Solar Saves {{city}} Homeowners Money',
  '<p>Hi {{firstName}}, 5 ways solar saves: 1) Lower bills 2) 30% tax credit 3) Net metering 4) Rate protection 5) Home value. <a href="https://quantumsolar.us/schedule">See My Savings</a></p>',
  'Hi {{firstName}}, 5 ways solar saves: Lower bills, tax credit, net metering, rate protection, home value. https://quantumsolar.us/schedule',
  '["firstName", "city", "unsubscribeUrl"]'::jsonb,
  'en',
  true
),
(
  'Splash EN - Financing Options',
  'educational',
  '{{firstName}}, $0 Down Solar is Real - Here''s How',
  '<p>Hi {{firstName}}, Go solar with $0 down! Options: Solar Loans, Lease/PPA, or Cash. <a href="https://quantumsolar.us/schedule">Explore My Options</a></p>',
  'Hi {{firstName}}, $0 down solar options: Loans, Lease, Cash. Explore: https://quantumsolar.us/schedule',
  '["firstName", "unsubscribeUrl"]'::jsonb,
  'en',
  true
),
(
  'Splash EN - Social Proof',
  'social_proof',
  'Why 500+ Illinois Families Chose Quantum Solar',
  '<p>Hi {{firstName}}, 500+ families trust us. Transparent pricing, local expertise, quality installation. <a href="https://quantumsolar.us/schedule">Join Our Solar Family</a></p>',
  'Hi {{firstName}}, 500+ families trust Quantum Solar. Join us: https://quantumsolar.us/schedule',
  '["firstName", "city", "unsubscribeUrl"]'::jsonb,
  'en',
  true
),
(
  'Splash EN - Limited Time Offer',
  'cta',
  '{{firstName}}, Your Free Solar Consultation is Waiting',
  '<p>Hi {{firstName}}, Your free consultation includes: custom design, savings analysis, financing options. <a href="https://quantumsolar.us/schedule">Book My Free Consultation</a></p>',
  'Hi {{firstName}}, Free consultation waiting. Book now: https://quantumsolar.us/schedule',
  '["firstName", "unsubscribeUrl"]'::jsonb,
  'en',
  true
);

-- Create sequences for Splash English
INSERT INTO email_sequences (campaign_id, sequence_order, template_id, delay_days, delay_hours, send_time_hour, active)
SELECT
  c.id,
  t.seq_order,
  t.id,
  t.delay,
  0,
  9,
  true
FROM email_campaigns c
CROSS JOIN (
  SELECT id, 1 as seq_order, 0 as delay FROM email_templates WHERE name = 'Splash EN - Welcome Email' AND language = 'en'
  UNION ALL
  SELECT id, 2, 3 FROM email_templates WHERE name = 'Splash EN - Solar Benefits' AND language = 'en'
  UNION ALL
  SELECT id, 3, 6 FROM email_templates WHERE name = 'Splash EN - Financing Options' AND language = 'en'
  UNION ALL
  SELECT id, 4, 10 FROM email_templates WHERE name = 'Splash EN - Social Proof' AND language = 'en'
  UNION ALL
  SELECT id, 5, 14 FROM email_templates WHERE name = 'Splash EN - Limited Time Offer' AND language = 'en'
) t
WHERE c.name = 'Splash Page Lead Nurture (English)';

-- ============================================================================
-- CAMPAIGN 4: SPLASH PAGE - SPANISH
-- ============================================================================

INSERT INTO email_campaigns (name, description, trigger_type, trigger_conditions, active)
VALUES (
  'Splash Page Lead Nurture (Spanish)',
  'Secuencia de 5 correos para leads de página splash. Educación solar general y enfoque en conversión.',
  'form_submission',
  '{"source_type": "splash_page", "language": "es", "form_type": "splash"}'::jsonb,
  true
);

-- Templates for Splash Spanish
INSERT INTO email_templates (name, category, subject_template, html_template, text_template, variables, language, active)
VALUES
(
  'Splash ES - Correo de Bienvenida',
  'welcome',
  '{{firstName}}, ¡Tu Camino Hacia la Energía Solar Comienza Aquí!',
  '<p>Hola {{firstName}}, Gracias por contactar a Quantum Solar! Ayudamos a propietarios en {{city}} a ahorrar. <a href="https://quantumsolar.us/schedule">Agendar Consulta Gratuita</a></p>',
  'Hola {{firstName}}, Gracias por contactarnos! Consulta: https://quantumsolar.us/schedule',
  '["firstName", "city", "electricBill", "unsubscribeUrl"]'::jsonb,
  'es',
  true
),
(
  'Splash ES - Beneficios Solares',
  'educational',
  '5 Formas en que la Energía Solar Ahorra Dinero a Hogares en {{city}}',
  '<p>Hola {{firstName}}, 5 formas de ahorrar: 1) Facturas bajas 2) Crédito 30% 3) Medición neta 4) Protección tarifas 5) Valor casa. <a href="https://quantumsolar.us/schedule">Ver Mis Ahorros</a></p>',
  'Hola {{firstName}}, 5 formas de ahorrar con solar. Ver: https://quantumsolar.us/schedule',
  '["firstName", "city", "unsubscribeUrl"]'::jsonb,
  'es',
  true
),
(
  'Splash ES - Opciones de Financiamiento',
  'educational',
  '{{firstName}}, Solar con $0 de Enganche es Real - Así Funciona',
  '<p>Hola {{firstName}}, Solar con $0 de enganche! Opciones: Préstamos, Arrendamiento, Efectivo. <a href="https://quantumsolar.us/schedule">Explorar Mis Opciones</a></p>',
  'Hola {{firstName}}, $0 enganche solar. Opciones: https://quantumsolar.us/schedule',
  '["firstName", "unsubscribeUrl"]'::jsonb,
  'es',
  true
),
(
  'Splash ES - Testimonios',
  'social_proof',
  'Por Qué Más de 500 Familias de Illinois Eligieron Quantum Solar',
  '<p>Hola {{firstName}}, 500+ familias confían en nosotros. Precios transparentes, experiencia local, instalación de calidad. <a href="https://quantumsolar.us/schedule">Únete a Nuestra Familia Solar</a></p>',
  'Hola {{firstName}}, 500+ familias confían en nosotros. Únete: https://quantumsolar.us/schedule',
  '["firstName", "city", "unsubscribeUrl"]'::jsonb,
  'es',
  true
),
(
  'Splash ES - Oferta Por Tiempo Limitado',
  'cta',
  '{{firstName}}, Tu Consulta Solar Gratuita Te Espera',
  '<p>Hola {{firstName}}, Tu consulta gratuita incluye: diseño personalizado, análisis de ahorros, opciones de financiamiento. <a href="https://quantumsolar.us/schedule">Reservar Mi Consulta Gratuita</a></p>',
  'Hola {{firstName}}, Consulta gratuita esperando. Reservar: https://quantumsolar.us/schedule',
  '["firstName", "unsubscribeUrl"]'::jsonb,
  'es',
  true
);

-- Create sequences for Splash Spanish
INSERT INTO email_sequences (campaign_id, sequence_order, template_id, delay_days, delay_hours, send_time_hour, active)
SELECT
  c.id,
  t.seq_order,
  t.id,
  t.delay,
  0,
  9,
  true
FROM email_campaigns c
CROSS JOIN (
  SELECT id, 1 as seq_order, 0 as delay FROM email_templates WHERE name = 'Splash ES - Correo de Bienvenida' AND language = 'es'
  UNION ALL
  SELECT id, 2, 3 FROM email_templates WHERE name = 'Splash ES - Beneficios Solares' AND language = 'es'
  UNION ALL
  SELECT id, 3, 6 FROM email_templates WHERE name = 'Splash ES - Opciones de Financiamiento' AND language = 'es'
  UNION ALL
  SELECT id, 4, 10 FROM email_templates WHERE name = 'Splash ES - Testimonios' AND language = 'es'
  UNION ALL
  SELECT id, 5, 14 FROM email_templates WHERE name = 'Splash ES - Oferta Por Tiempo Limitado' AND language = 'es'
) t
WHERE c.name = 'Splash Page Lead Nurture (Spanish)';

-- ============================================================================
-- VERIFY
-- ============================================================================

SELECT 'Campaigns created:' as status, count(*) as count FROM email_campaigns WHERE name LIKE '%Lead Nurture%';
SELECT 'Templates created:' as status, count(*) as count FROM email_templates WHERE name LIKE 'Calculator%' OR name LIKE 'Splash%';
SELECT 'Sequences created:' as status, count(*) as count FROM email_sequences es
  JOIN email_campaigns c ON es.campaign_id = c.id
  WHERE c.name LIKE '%Lead Nurture%';
