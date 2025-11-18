# Email Drip Campaign System - Testing Guide

## System Status: ✅ PRODUCTION READY

The email drip campaign infrastructure is fully deployed and operational. This guide will help you test the complete email flow end-to-end.

---

## 🎯 What's Been Built

### ✅ Infrastructure (Deployed to Production)
1. **Email Queue Processor** (`/api/cron/process-emails`) - Runs every 15 minutes via Vercel cron
2. **Resend Webhook Handler** (`/api/webhooks/resend`) - Tracks email events (delivered, opened, clicked, bounced)
3. **Unsubscribe Handler** (`/api/unsubscribe`) - CAN-SPAM compliant unsubscribe page
4. **TCPA Consent Enforcement** - Database triggers verify consent before enrollment
5. **Campaign Creation Wizard** - UI at `/crm/campaigns/new` for creating new campaigns

### ✅ Campaigns Available
1. **Campaign 1: Ameren Illinois Paid Lead Fast Track** (Already configured in database)
2. **Campaign 2: Abandoned Calculator Recovery** (SQL script ready to deploy)
3. **Campaign 3: Organic Contact Nurture** (SQL script ready to deploy)

---

## 📋 Testing Checklist

### Step 1: Deploy Campaigns 2 & 3 (Optional)

**Campaign 2: Abandoned Calculator**
```bash
# Run in Supabase SQL Editor
# File: /supabase/seed_campaign_2_abandoned_calculator.sql
```

**Campaign 3: Organic Contact Nurture**
```bash
# Run in Supabase SQL Editor
# File: /supabase/seed_campaign_3_organic_nurture.sql
```

### Step 2: Create Test Lead

Run this SQL in Supabase SQL Editor to create a test lead:

```sql
-- File: /supabase/seed_test_lead.sql
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
  tcpa_consent,  -- CRITICAL: Must be TRUE
  tcpa_timestamp,
  consent_ip,
  source,  -- 'paid' triggers Ameren IL campaign
  form_variant,
  created_at,
  updated_at
) VALUES (
  'TEST-' || gen_random_uuid()::text,
  'Test',
  'Lead',
  'cesar@quantumsolar.us',  -- Change to your email
  '555-123-4567',
  '123 Test St',
  'Chicago',
  'IL',
  '60601',
  'Ameren Illinois',
  150,
  'own',
  'above-650',
  TRUE,  -- TCPA consent = triggers auto-enrollment
  NOW(),
  '127.0.0.1',
  'paid',  -- Triggers "Ameren Illinois Paid Lead Fast Track" campaign
  'ameren_illinois_solar_ppa',
  NOW(),
  NOW()
)
RETURNING
  id,
  email,
  tcpa_consent,
  'Lead created - should auto-enroll in campaign' as status;
```

**Expected Result:**
- One row returned with the newly created lead
- `tcpa_consent` should be `true`

### Step 3: Verify Auto-Enrollment

Run this query to check if the lead was enrolled in a campaign:

```sql
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
WHERE ce.email_address = 'cesar@quantumsolar.us'  -- Your test email
ORDER BY ce.created_at DESC
LIMIT 1;
```

**Expected Result:**
- One enrollment record
- `campaign_name`: "Ameren Illinois Paid Lead Fast Track"
- `status`: "active"
- `tcpa_consent_given`: `true`
- `next_send_at`: Should be ~15 minutes from now (next cron run)

### Step 4: Wait for Cron Job (Max 15 Minutes)

The email queue processor runs **every 15 minutes**. You can check its status:

**Option A: Check Vercel Cron Logs**
1. Go to Vercel Dashboard → Your Project → Cron Jobs
2. Look for `/api/cron/process-emails`
3. Check recent executions

**Option B: Manually Trigger (for faster testing)**
```bash
# Open in browser or use curl
https://crm.quantumsolar.us/api/cron/process-emails

# Expected response:
{
  "success": true,
  "processed": 1,
  "message": "Processed 1 emails successfully"
}
```

### Step 5: Verify Email Sent to Queue

Check the `email_sends` table:

```sql
SELECT
  es.id,
  es.sent_to,
  es.subject,
  es.status,
  es.sent_at,
  es.resend_id,
  'Email should be sent' as note
FROM email_sends es
WHERE es.sent_to = 'cesar@quantumsolar.us'
ORDER BY es.created_at DESC
LIMIT 1;
```

**Expected Result:**
- One email record
- `status`: "sent" (if Resend API succeeded) or "pending" (if not yet sent)
- `resend_id`: Should have a value if sent via Resend
- `sent_at`: Timestamp when email was sent

### Step 6: Check Your Inbox

Within 1-2 minutes of the cron job running, you should receive:

**Email Subject:** (Based on Campaign 1 template)
- From: Quantum Solar
- To: cesar@quantumsolar.us

**Email Content Should Include:**
- Personalized greeting: "Hi Test,"
- Utility company mention: "Ameren Illinois"
- Electric bill amount: "$150"
- Unsubscribe link (CAN-SPAM compliant)

### Step 7: Test Email Event Tracking

Once you receive the email:

1. **Open the email** → Should trigger `email.opened` webhook
2. **Click a link** → Should trigger `email.clicked` webhook

Check the `email_events` table:

```sql
SELECT
  ee.event_type,
  ee.event_data,
  ee.created_at,
  es.sent_to
FROM email_events ee
JOIN email_sends es ON ee.email_send_id = es.id
WHERE es.sent_to = 'cesar@quantumsolar.us'
ORDER BY ee.created_at DESC;
```

**Expected Result:**
- `delivered` event (from Resend webhook)
- `opened` event (when you open the email)
- `clicked` event (if you click a link)

### Step 8: Test Unsubscribe

1. Click the unsubscribe link in the email
2. Should open: `https://crm.quantumsolar.us/api/unsubscribe?enrollment_id=...`
3. Click "Unsubscribe" button
4. Should see success message

Verify unsubscribe in database:

```sql
SELECT
  id,
  email_address,
  status,
  unsubscribed_at
FROM campaign_enrollments
WHERE email_address = 'cesar@quantumsolar.us';
```

**Expected Result:**
- `status`: "unsubscribed"
- `unsubscribed_at`: Timestamp when unsubscribed

---

## 🔧 Troubleshooting

### No Email Received

**Check 1: Was enrollment created?**
```sql
SELECT * FROM campaign_enrollments WHERE email_address = 'cesar@quantumsolar.us';
```
- If no record: TCPA consent might be false, or trigger conditions didn't match
- Fix: Ensure `tcpa_consent = TRUE` in the test lead

**Check 2: Was email queued?**
```sql
SELECT * FROM email_sends WHERE sent_to = 'cesar@quantumsolar.us';
```
- If no record: Email queue processor hasn't run yet (wait up to 15 min)
- If record exists with `status = 'failed'`: Check `error_message` column

**Check 3: Resend API errors**
- Check Vercel function logs for `/api/cron/process-emails`
- Verify `RESEND_API_KEY` is set in environment variables

### Email Sent But Not Delivered

**Check Resend Dashboard:**
1. Go to https://resend.com/emails
2. Search for the test email
3. Check delivery status

**Common Issues:**
- Email in spam folder (check spam/junk)
- Resend API key not configured
- Email address typo

### Webhook Not Receiving Events

**Check webhook configuration:**
1. Go to Resend Dashboard → Webhooks
2. Verify webhook URL: `https://crm.quantumsolar.us/api/webhooks/resend`
3. Verify events are enabled: delivered, opened, clicked, bounced, complained

**Test webhook endpoint:**
```bash
curl https://crm.quantumsolar.us/api/webhooks/resend

# Expected response:
{
  "status": "ok",
  "endpoint": "resend-webhook",
  "message": "Webhook handler is active"
}
```

---

## 📊 Expected Sequence Timeline

**Campaign 1: Ameren Illinois Paid Lead Fast Track**

| Email # | Delay | When It Sends | Subject (Example) |
|---------|-------|---------------|-------------------|
| Email 1 | 0 days | Immediately (next cron run) | Welcome message |
| Email 2 | 3 days | 3 days after email 1 | Follow-up |
| Email 3 | 7 days | 7 days after email 1 | Final touch |

**Note:** "Immediately" means within 15 minutes (next cron job execution).

---

## ✅ Success Criteria

Your email system is working correctly if:

1. ✅ Test lead creates enrollment in `campaign_enrollments`
2. ✅ Email appears in `email_sends` table with `status = 'sent'`
3. ✅ Email delivered to inbox within 2 minutes
4. ✅ Email events recorded in `email_events` (delivered, opened, clicked)
5. ✅ Unsubscribe link works and updates enrollment status
6. ✅ Cron job runs every 15 minutes without errors

---

## 🎉 Next Steps After Testing

Once testing is complete:

1. **Deploy Campaigns 2 & 3** (run SQL scripts)
2. **Create additional campaigns** using the wizard at `/crm/campaigns/new`
3. **Monitor analytics** in the CRM dashboard
4. **Integrate with main website** for calculator abandonment tracking
5. **Build lead scoring library** for intelligent campaign routing

---

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Check Supabase database logs
3. Check Resend dashboard for email delivery status
4. Review this testing guide step-by-step

**System is production ready!** 🚀
