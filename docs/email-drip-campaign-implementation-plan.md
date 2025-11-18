# Email Drip Campaign System - Multi-Repository Implementation Plan

## Architecture Overview

**Two-Repository System:**
- **quantum-solar** (Main Site): Lead capture → Triggers campaign enrollment
- **quantum-solar-crm** (CRM): Campaign management → Email automation → Analytics

**Lead Flow:**
```
Main Site Form Submission → Supabase (splash_leads/contact_submissions)
  → Database Trigger → CRM Campaign Enrollment → Email Drip Sequence
```

---

## Phase 1: CRM Database Foundation (Week 1) - quantum-solar-crm

### 1.1 Fix Migration Dependencies
**File**: `supabase/migrations/20251113000000_create_email_drip_system.sql`

**Critical Fixes:**
- Line 37, 86: Remove `REFERENCES profiles(id)` foreign key constraints
- Change `created_by UUID REFERENCES profiles(id)` to `created_by UUID` (nullable)
- Add comment: `-- created_by stores Clerk user ID without FK constraint`

**Add TCPA Consent Fields:**
```sql
-- Add to migration
ALTER TABLE contact_submissions
  ADD COLUMN IF NOT EXISTS tcpa_consent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tcpa_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_ip TEXT;
```

### 1.2 Apply Migration to Supabase
- Run migration via Supabase CLI or dashboard
- Verify all 6 tables created: email_campaigns, email_templates, email_sequences, campaign_enrollments, email_sends, email_events
- Verify materialized view: campaign_performance
- Test functions work: `enroll_lead_in_campaign()`, `process_email_queue()`

---

## Phase 2: Initial Campaign Setup (Week 1-2) - quantum-solar-crm

### 2.1 Create 3 Foundational Campaigns in Database

**Campaign 1: "Ameren Illinois Paid Lead Fast Track"**
```sql
-- Campaign targeting paid leads from main site splash form
INSERT INTO email_campaigns (name, description, type, is_active, target_segment)
VALUES (
  'Ameren Illinois Paid Lead Fast Track',
  '5-email aggressive sequence for Illinois Ameren promotion leads',
  'nurture',
  true,
  '{"source": "splash_leads", "form_type": "ameren-il", "paid": true}'
);

-- 5 email sequences: Day 0, 2, 5, 7, 10
-- Subject lines: 30-35 char max (mobile optimization)
-- Tone: Action-oriented, pricing by email 2-3
```

**Campaign 2: "Abandoned Calculator Recovery"** (HIGHEST ROI)
```sql
-- Campaign targeting calculator users who didn't complete
INSERT INTO email_campaigns (name, description, type, is_active, target_segment)
VALUES (
  'Abandoned Calculator Recovery',
  '3-email sequence to recover incomplete calculator sessions',
  're_engagement',
  true,
  '{"action": "calculator_abandoned", "minutes_elapsed": 15}'
);

-- 3 emails: 15 min, 48 hours, 7 days
-- Expected: 10-15% recovery rate
```

**Campaign 3: "Organic Contact Nurture"**
```sql
-- Campaign for contact_submissions (organic leads)
INSERT INTO email_campaigns (name, description, type, is_active, target_segment)
VALUES (
  'Organic Contact Nurture',
  '6-email educational sequence for organic leads',
  'nurture',
  true,
  '{"source": "contact_submissions", "organic": true}'
);

-- 6 emails over 4 weeks
-- Tone: 80/20 educational/promotional ratio
-- Focus: Illinois local case studies, ROI calculations
```

### 2.2 Create Mobile-Responsive Email Templates
**File**: Create `/src/components/email-templates/` directory

**Requirements** (per Compass artifact):
- Single-column layout (41-45% mobile opens)
- 30-35 character subject lines maximum
- Minimum 44×44 pixel CTA buttons
- 16px minimum body font size
- Dark mode compatibility testing
- Variable placeholders: {{firstName}}, {{lastName}}, {{city}}, {{electricBill}}, {{estimatedSavings}}

---

## Phase 3: API Infrastructure (Week 2-3) - quantum-solar-crm

### 3.1 Campaign Management APIs

**Create `/src/app/api/crm/campaigns/route.ts`:**
```typescript
// GET - List all campaigns with stats
// POST - Create new campaign with segment rules
// PUT - Update campaign (pause/resume/edit)
// DELETE - Soft delete campaign
```

**Create `/src/app/api/crm/enrollments/route.ts`:**
```typescript
// POST - Manually enroll lead in campaign
// GET - Check lead enrollment status
// PUT - Update enrollment (skip step, pause, cancel)
```

**Create `/src/app/api/crm/templates/route.ts`:**
```typescript
// GET - List email templates with performance metrics
// POST - Create custom template
// PUT - Update template content
```

### 3.2 Email Queue Processor (CRITICAL)

**Create `/src/app/api/cron/process-emails/route.ts`:**
```typescript
// Vercel Cron Job - runs every 15 minutes
// 1. Call Supabase function: process_email_queue()
// 2. For each email ready to send:
//    - Fetch template and lead data
//    - Substitute variables {{firstName}}, etc.
//    - Call /api/send (Resend integration)
//    - Update email_sends table
//    - Track email_events
// 3. Respect unsubscribe list
// 4. Implement retry logic (3 attempts)
```

**Create `/src/app/api/webhooks/resend/route.ts`:**
```typescript
// Resend webhook handler for tracking
// Events: email.delivered, email.opened, email.clicked, email.bounced
// Update email_events table for analytics
```

### 3.3 Resend Integration (Use Same Account as Main Site)

**Environment Variables:**
```bash
# Add to .env.local in quantum-solar-crm
RESEND_API_KEY=re_xxxxx  # Same as main site
RESEND_FROM_EMAIL=info@quantumsolar.us
```

**Create `/src/app/api/send/route.ts`** (mirrors main site):
```typescript
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const body = await request.json();

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: body.to,
    subject: body.subject,
    html: body.html,
    headers: {
      'X-Entity-Ref-ID': body.eventId, // Tracking ID
    },
  });

  return NextResponse.json({ data, error });
}
```

---

## Phase 4: Behavioral Triggers & Lead Scoring (Week 3-4) - quantum-solar-crm

### 4.1 BANT Lead Scoring Implementation

**Create `/src/lib/lead-scoring.ts`:**
```typescript
// BANT Scoring (from Compass artifact)
export function calculateLeadScore(lead: Lead): number {
  let score = 0;

  // Budget (0-10 points)
  if (lead.electricBill > 200) score += 10;
  else if (lead.electricBill > 150) score += 6;

  // Authority (10 points)
  if (lead.homeowner === true) score += 10;

  // Need (0-10 points)
  if (lead.creditScore === 'above-650') score += 10;
  if (lead.shading === 'none' || lead.shading === 'minimal') score += 5;

  // Time (0-10 points)
  // Inferred from engagement behavior

  return score;
}

// Classification:
// Hot (70+): 5-minute sales contact
// Warm (40-69): 24-hour follow-up
// Cold (20-39): 3-6 month drip
// Unqualified (<20): Quarterly check-ins
```

### 4.2 Automated Behavioral Triggers

**Modify Supabase Trigger: `auto_enroll_splash_lead`**
```sql
-- Trigger on splash_leads INSERT
-- Auto-enroll based on:
--   1. Lead source (paid vs organic)
--   2. Form variant (ameren-il, florida, etc.)
--   3. Lead score calculation
--   4. TCPA consent status

CREATE OR REPLACE FUNCTION auto_enroll_splash_lead()
RETURNS TRIGGER AS $$
BEGIN
  -- Only enroll if TCPA consent given
  IF NEW.tcpa_consent = true THEN
    -- Paid lead → Campaign 1
    IF NEW.source = 'paid' THEN
      PERFORM enroll_lead_in_campaign(
        'splash_leads',
        NEW.id::text,
        (SELECT id FROM email_campaigns WHERE name = 'Ameren Illinois Paid Lead Fast Track')
      );
    -- Organic lead → Campaign 3
    ELSE
      PERFORM enroll_lead_in_campaign(
        'splash_leads',
        NEW.id::text,
        (SELECT id FROM email_campaigns WHERE name = 'Organic Contact Nurture')
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Phase 5: Main Site Integration (Week 4) - quantum-solar

### 5.1 Add Calculator Abandonment Tracking

**Modify `/src/app/solar-calculator/page.tsx`** (main site):
```typescript
// Track calculator abandonment for Campaign 2
useEffect(() => {
  const abandonmentTimer = setTimeout(() => {
    if (!calculationComplete && email) {
      // Send abandonment event to CRM via webhook
      fetch('https://crm.quantumsolar.us/api/webhooks/calculator-abandoned', {
        method: 'POST',
        body: JSON.stringify({
          email,
          sessionId,
          abandonedAt: new Date(),
          partialData: { address, electricBill }
        })
      });
    }
  }, 15 * 60 * 1000); // 15 minutes

  return () => clearTimeout(abandonmentTimer);
}, [calculationComplete, email]);
```

### 5.2 Add TCPA Consent Timestamp Tracking

**Modify `/src/app/api/splash-form/route.ts`** (main site):
```typescript
// Add consent metadata when storing leads
const consentMetadata = {
  tcpa_timestamp: body.tcpaConsent ? new Date() : null,
  consent_ip: request.headers.get('x-forwarded-for') || request.ip,
  consent_user_agent: request.headers.get('user-agent'),
};

// Store with lead data for TCPA compliance ($1,500/violation)
```

---

## Phase 6: CRM Dashboard UI (Week 5-6) - quantum-solar-crm

### 6.1 Campaign Management Pages

**Create `/src/app/crm/campaigns/page.tsx`:**
- Campaign list with performance cards
- Real-time stats: Open rate (target 20-25%), CTR (target 3-5%), Conversion (target 5-10%)
- Active/Paused status toggles
- Campaign type badges (Welcome/Nurture/Re-engagement)

**Create `/src/app/crm/campaigns/[id]/page.tsx`:**
- Email sequence timeline visualization
- Individual email performance metrics
- Enrollment list with lead details
- A/B test results dashboard

**Create `/src/app/crm/campaigns/new/page.tsx`:**
- Campaign wizard with 4 steps:
  1. Campaign details (name, type, description)
  2. Target segment selection (paid/organic, lead source, score range)
  3. Email sequence builder (drag-and-drop emails with delay configuration)
  4. Review and launch

### 6.2 Analytics Dashboard

**Create `/src/app/crm/campaigns/analytics/page.tsx`:**
- Funnel visualization: Enrolled → Opened → Clicked → Booked → Closed
- Revenue attribution (which email prompted consultation)
- Campaign comparison charts
- Unsubscribe rate tracking (<0.5% target)
- Best/worst performing subject lines
- Send time optimization insights

---

## Phase 7: Compliance & Testing (Week 7) - Both Repos

### 7.1 TCPA Compliance Audit (CRITICAL - $1,500/violation)

**Main Site Checklist:**
- [ ] All web forms include TCPA disclosure
- [ ] Consent language: "By clicking submit, I consent to receive calls, texts, and emails from Quantum Solar..."
- [ ] Consent timestamp and IP stored with every lead
- [ ] Email list scrubbed against FCC wireless domains
- [ ] No emails sent to carrier format (###@carrier.com)

**CRM Checklist:**
- [ ] Only enrolled leads with `tcpa_consent = true`
- [ ] Unsubscribe link in every email footer
- [ ] Opt-outs honored within 10 business days (CAN-SPAM)
- [ ] Physical address included in all emails
- [ ] Non-deceptive subject lines
- [ ] Consent records stored 4-5 years minimum

### 7.2 End-to-End Testing

**Test Scenarios:**
1. Paid lead submission → Auto-enrollment in Campaign 1 → Email 1 within 5 min
2. Calculator abandonment → Campaign 2 enrollment → Recovery email at 15 min
3. Organic contact → Campaign 3 enrollment → Educational sequence
4. Unsubscribe flow → Status updated → No future emails sent
5. Email webhook → Events tracked → Analytics updated

### 7.3 Vercel Cron Configuration

**File**: `vercel.json` in quantum-solar-crm
```json
{
  "crons": [{
    "path": "/api/cron/process-emails",
    "schedule": "*/15 * * * *"  // Every 15 minutes
  }]
}
```

---

## Success Metrics (From Compass Artifact)

### 3-Month Targets:
- **25-40% improvement** in lead-to-customer conversion
- **20-30% higher** consultation booking rates
- **10-15% recovery** of abandoned calculator leads
- **$36 ROI per $1 spent** on email marketing

### Email Performance:
- Welcome emails: **83.63% open rate**, 16.60% CTR
- Standard campaigns: **20-25% open rate**, 3-5% CTR
- Conversion to consultation: **5-10%** overall

### Compliance:
- **0% CAN-SPAM violations** ($43,792 penalty)
- **0% TCPA violations** ($1,500/violation)
- **<0.5% unsubscribe rate**
- **<2% bounce rate**

---

## Timeline: 7 weeks to full production deployment

- **Week 1**: Database foundation + initial campaigns
- **Week 2-3**: APIs + email processor + Resend integration
- **Week 3-4**: Lead scoring + behavioral triggers
- **Week 4**: Main site integration (calculator abandonment)
- **Week 5-6**: CRM dashboard UI
- **Week 7**: Compliance audit + testing + launch

---

## Implementation Status

Track progress at: `/docs/implementation-status.md`

## Reference Documents

- Compass Artifact: Email drip campaign research and best practices
- Main Site README: `/Users/cesarlugojr/Documents/GitHub/quantum-solar/README.md`
- CRM CLAUDE.md: Project-specific instructions and architecture

## Notes

- All email templates must be mobile-responsive (41-45% mobile opens)
- Subject lines limited to 30-35 characters for mobile devices
- TCPA compliance is CRITICAL - $1,500 penalty per violation
- Lead scoring determines campaign assignment and urgency level
- Progressive lead valuation: $10 (start) → $200 (complete)
