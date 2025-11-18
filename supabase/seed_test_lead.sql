-- Test Lead Creation for Email Flow Verification
-- Run this manually in Supabase SQL Editor to create a test lead
-- This will trigger the auto_enroll_splash_lead trigger

-- Create test lead with TCPA consent
INSERT INTO splash_leads (
  session_id,
  first_name,
  last_name,
  email,
  phone,
  street_address,
  city,
  state,
  zip_code,
  utility_company,
  average_monthly_bill,
  homeowner_status,
  credit_score,
  tcpa_consent,
  tcpa_timestamp,
  consent_ip,
  source,
  form_variant,
  created_at,
  updated_at
) VALUES (
  'TEST-' || gen_random_uuid()::text,
  'Test',
  'Lead',
  'cesar@quantumsolar.us',
  '555-123-4567',
  '123 Test St',
  'Chicago',
  'IL',
  '60601',
  'Ameren Illinois',
  150,
  'own',
  'above-650',
  TRUE,  -- TCPA consent given
  NOW(),
  '127.0.0.1',
  'paid',  -- This triggers enrollment in "Ameren Illinois Paid Lead Fast Track"
  'ameren_illinois_solar_ppa',
  NOW(),
  NOW()
)
RETURNING
  id,
  email,
  tcpa_consent,
  'Lead created - should auto-enroll in campaign' as status;

-- Check if enrollment was created
SELECT
  ce.id as enrollment_id,
  ce.email_address,
  ce.status as enrollment_status,
  ce.current_step,
  ce.next_send_at,
  ce.tcpa_consent_given,
  c.name as campaign_name
FROM campaign_enrollments ce
JOIN email_campaigns c ON ce.campaign_id = c.id
WHERE ce.email_address = 'cesar@quantumsolar.us'
ORDER BY ce.created_at DESC
LIMIT 1;

-- Check if email is in the queue
SELECT
  es.id,
  es.sent_to,
  es.subject,
  es.status,
  es.sent_at,
  'Email should be sent within 15 minutes by cron job' as note
FROM email_sends es
WHERE es.sent_to = 'cesar@quantumsolar.us'
ORDER BY es.created_at DESC
LIMIT 1;
