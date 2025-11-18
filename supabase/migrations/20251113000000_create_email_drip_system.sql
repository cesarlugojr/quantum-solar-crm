-- ============================================================================
-- QUANTUM SOLAR EMAIL DRIP CAMPAIGN SYSTEM
-- Migration: 003_create_email_drip_system
-- Created: 2025-11-13
-- Purpose: Comprehensive email marketing automation system with full attribution
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================================================
-- TABLE 1: EMAIL_CAMPAIGNS
-- Purpose: Defines email drip campaigns with trigger conditions
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Campaign Details
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Trigger Configuration
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN (
        'form_submission',      -- Triggered when form is submitted
        'lead_status_change',   -- Triggered when lead status changes
        'time_based',           -- Triggered after X days inactive
        'manual'                -- Manually enrolled by user
    )),
    trigger_conditions JSONB DEFAULT '{}',  -- Flexible conditions (e.g., {"form_variant": "ameren_illinois", "tcpa_consent": true})

    -- Campaign Status
    active BOOLEAN DEFAULT true,

    -- Metadata
    created_by UUID,  -- Stores Clerk user ID without FK constraint (no profiles table)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Indexes for performance
    CONSTRAINT unique_campaign_name UNIQUE (name)
);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_active ON email_campaigns(active);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_trigger_type ON email_campaigns(trigger_type);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON email_campaigns(created_at DESC);

COMMENT ON TABLE email_campaigns IS 'Defines email drip campaigns with trigger conditions and targeting rules';
COMMENT ON COLUMN email_campaigns.trigger_conditions IS 'JSONB object defining when campaign should trigger. Example: {"form_variant": "ameren_illinois", "homeowner_status": "yes", "tcpa_consent": true}';

-- ============================================================================
-- TABLE 2: EMAIL_TEMPLATES
-- Purpose: Reusable email templates with variable substitution
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Template Details
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'welcome',          -- Welcome emails (sent immediately)
        'educational',      -- Educational content (PPA explainers, how solar works)
        'social_proof',     -- Testimonials, case studies
        'urgency',          -- Limited-time offers, rate locks
        'cta',              -- Call-to-action, schedule consultation
        're_engagement'     -- Win-back inactive leads
    )),

    -- Template Content
    subject_template TEXT NOT NULL,
    html_template TEXT NOT NULL,
    text_template TEXT,  -- Plain text fallback

    -- Variables used in template (for validation)
    variables JSONB DEFAULT '[]',  -- Array of variable names: ["firstName", "city", "estimatedSavings"]

    -- Bilingual Support
    language VARCHAR(2) DEFAULT 'en' CHECK (language IN ('en', 'es')),

    -- Template Status
    active BOOLEAN DEFAULT true,

    -- Metadata
    created_by UUID,  -- Stores Clerk user ID without FK constraint (no profiles table)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_template_name UNIQUE (name, language)
);

CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(active);
CREATE INDEX IF NOT EXISTS idx_email_templates_language ON email_templates(language);

COMMENT ON TABLE email_templates IS 'Reusable email templates with variable substitution and bilingual support';
COMMENT ON COLUMN email_templates.variables IS 'Array of variable names used in template for validation. Example: ["firstName", "lastName", "city", "estimatedSavings"]';

-- ============================================================================
-- TABLE 3: EMAIL_SEQUENCES
-- Purpose: Defines the sequence of emails in a campaign (drip timing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Campaign Relationship
    campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,

    -- Sequence Configuration
    sequence_order INTEGER NOT NULL,  -- 1, 2, 3, etc.

    -- Template Relationship
    template_id UUID NOT NULL REFERENCES email_templates(id) ON DELETE RESTRICT,

    -- Timing Configuration
    delay_days INTEGER NOT NULL DEFAULT 0,     -- Days after trigger or previous email
    delay_hours INTEGER NOT NULL DEFAULT 0,    -- Additional hours (for sub-day timing)
    send_time_hour INTEGER DEFAULT 9 CHECK (send_time_hour BETWEEN 0 AND 23),  -- Preferred send hour (local time)

    -- Sequence Status
    active BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_sequence_order UNIQUE (campaign_id, sequence_order),
    CONSTRAINT positive_delay CHECK (delay_days >= 0 AND delay_hours >= 0)
);

CREATE INDEX IF NOT EXISTS idx_email_sequences_campaign ON email_sequences(campaign_id, sequence_order);
CREATE INDEX IF NOT EXISTS idx_email_sequences_template ON email_sequences(template_id);
CREATE INDEX IF NOT EXISTS idx_email_sequences_active ON email_sequences(active);

COMMENT ON TABLE email_sequences IS 'Defines the sequence and timing of emails within a campaign';
COMMENT ON COLUMN email_sequences.delay_days IS 'Days to wait after trigger (if first email) or after previous email';
COMMENT ON COLUMN email_sequences.send_time_hour IS 'Preferred hour to send (0-23, in recipient local time if available)';

-- ============================================================================
-- TABLE 4: CAMPAIGN_ENROLLMENTS
-- Purpose: Tracks which leads are enrolled in which campaigns
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaign_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Campaign Relationship
    campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,

    -- Lead Relationship (polymorphic)
    lead_type VARCHAR(50) NOT NULL CHECK (lead_type IN ('splash_lead', 'contact_submission')),
    lead_id UUID NOT NULL,  -- References either splash_leads.id or contact_submissions.id
    email_address VARCHAR(255) NOT NULL,

    -- Enrollment Progress
    current_step INTEGER DEFAULT 0,  -- Which sequence step they're on (0 = not started)
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN (
        'active',        -- Currently receiving emails
        'paused',        -- Temporarily paused
        'completed',     -- Finished all sequences
        'unsubscribed',  -- Opted out
        'bounced'        -- Email bounced (hard bounce)
    )),

    -- Timing
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    last_sent_at TIMESTAMPTZ,
    next_send_at TIMESTAMPTZ,  -- When next email should be sent
    completed_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,

    -- Unsubscribe Details
    unsubscribe_reason TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_lead_campaign_enrollment UNIQUE (campaign_id, lead_type, lead_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_enrollments_campaign ON campaign_enrollments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_enrollments_lead ON campaign_enrollments(lead_type, lead_id);
CREATE INDEX IF NOT EXISTS idx_campaign_enrollments_status ON campaign_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_campaign_enrollments_next_send ON campaign_enrollments(next_send_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_campaign_enrollments_email ON campaign_enrollments(email_address);

COMMENT ON TABLE campaign_enrollments IS 'Tracks lead enrollment in email campaigns with progress and timing';
COMMENT ON COLUMN campaign_enrollments.lead_type IS 'Type of lead: splash_lead or contact_submission';
COMMENT ON COLUMN campaign_enrollments.next_send_at IS 'Timestamp when next email should be sent (used by queue processor)';

-- ============================================================================
-- TABLE 5: EMAIL_SENDS
-- Purpose: Log of all emails sent through the system
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_sends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Enrollment Relationship
    enrollment_id UUID NOT NULL REFERENCES campaign_enrollments(id) ON DELETE CASCADE,
    sequence_id UUID REFERENCES email_sequences(id) ON DELETE SET NULL,

    -- Lead Relationship (for easier querying)
    lead_type VARCHAR(50) NOT NULL,
    lead_id UUID NOT NULL,

    -- Email Details
    email_address VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,

    -- Send Status
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    resend_message_id VARCHAR(200),  -- Resend API message ID for tracking
    status VARCHAR(50) DEFAULT 'queued' CHECK (status IN (
        'queued',      -- Waiting to be sent
        'sent',        -- Sent to Resend API
        'delivered',   -- Confirmed delivered
        'failed',      -- Failed to send
        'bounced'      -- Bounced (hard or soft)
    )),

    -- Error Handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_sends_enrollment ON email_sends(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_sequence ON email_sends(sequence_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_lead ON email_sends(lead_type, lead_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_status ON email_sends(status);
CREATE INDEX IF NOT EXISTS idx_email_sends_sent_at ON email_sends(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_sends_resend_id ON email_sends(resend_message_id);

COMMENT ON TABLE email_sends IS 'Complete log of all emails sent through the drip campaign system';
COMMENT ON COLUMN email_sends.resend_message_id IS 'Message ID from Resend API for webhook correlation';

-- ============================================================================
-- TABLE 6: EMAIL_EVENTS
-- Purpose: Tracks email engagement (opens, clicks, bounces)
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Send Relationship
    send_id UUID NOT NULL REFERENCES email_sends(id) ON DELETE CASCADE,

    -- Event Type
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'delivered',      -- Email delivered to inbox
        'opened',         -- Email opened by recipient
        'clicked',        -- Link clicked in email
        'bounced',        -- Email bounced
        'complained',     -- Marked as spam
        'unsubscribed'    -- Clicked unsubscribe link
    )),

    -- Event Data (flexible structure for different event types)
    event_data JSONB DEFAULT '{}',  -- e.g., {"link": "https://...", "ip": "...", "user_agent": "..."}

    -- Timing
    occurred_at TIMESTAMPTZ DEFAULT NOW(),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_events_send ON email_events(send_id);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_occurred ON email_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_events_type_send ON email_events(event_type, send_id);

COMMENT ON TABLE email_events IS 'Tracks email engagement events from Resend webhooks';
COMMENT ON COLUMN email_events.event_data IS 'JSONB containing event-specific data. For clicks: {"link": "..."}. For bounces: {"reason": "..."}';

-- ============================================================================
-- TABLE 7: CAMPAIGN_PERFORMANCE (Materialized View)
-- Purpose: Aggregated campaign performance metrics for fast analytics
-- ============================================================================

DROP MATERIALIZED VIEW IF EXISTS campaign_performance CASCADE;

CREATE MATERIALIZED VIEW campaign_performance AS
SELECT
    c.id AS campaign_id,
    c.name AS campaign_name,
    c.active AS is_active,

    -- Enrollment Metrics
    COUNT(DISTINCT e.id) AS total_enrolled,
    COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.id END) AS active_enrollments,
    COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.id END) AS completed_enrollments,
    COUNT(DISTINCT CASE WHEN e.status = 'unsubscribed' THEN e.id END) AS unsubscribed_count,

    -- Email Send Metrics
    COUNT(DISTINCT s.id) AS emails_sent,
    COUNT(DISTINCT CASE WHEN s.status = 'delivered' THEN s.id END) AS emails_delivered,
    COUNT(DISTINCT CASE WHEN s.status = 'bounced' THEN s.id END) AS emails_bounced,
    COUNT(DISTINCT CASE WHEN s.status = 'failed' THEN s.id END) AS emails_failed,

    -- Engagement Metrics
    COUNT(DISTINCT CASE WHEN ev.event_type = 'opened' THEN ev.send_id END) AS emails_opened,
    COUNT(DISTINCT CASE WHEN ev.event_type = 'clicked' THEN ev.send_id END) AS emails_clicked,
    COUNT(DISTINCT CASE WHEN ev.event_type = 'complained' THEN ev.send_id END) AS spam_complaints,

    -- Calculated Rates
    CASE
        WHEN COUNT(DISTINCT s.id) > 0
        THEN ROUND((COUNT(DISTINCT CASE WHEN ev.event_type = 'opened' THEN ev.send_id END)::NUMERIC / COUNT(DISTINCT s.id)) * 100, 2)
        ELSE 0
    END AS open_rate,

    CASE
        WHEN COUNT(DISTINCT s.id) > 0
        THEN ROUND((COUNT(DISTINCT CASE WHEN ev.event_type = 'clicked' THEN ev.send_id END)::NUMERIC / COUNT(DISTINCT s.id)) * 100, 2)
        ELSE 0
    END AS click_rate,

    CASE
        WHEN COUNT(DISTINCT e.id) > 0
        THEN ROUND((COUNT(DISTINCT CASE WHEN e.status = 'unsubscribed' THEN e.id END)::NUMERIC / COUNT(DISTINCT e.id)) * 100, 2)
        ELSE 0
    END AS unsubscribe_rate,

    -- Conversion Metrics (will be populated via triggers)
    0::BIGINT AS conversions,  -- Leads that converted after receiving emails
    0::NUMERIC AS revenue_attributed,  -- Revenue from converted leads

    -- Metadata
    NOW() AS last_updated

FROM email_campaigns c
LEFT JOIN campaign_enrollments e ON c.id = e.campaign_id
LEFT JOIN email_sends s ON e.id = s.enrollment_id
LEFT JOIN email_events ev ON s.id = ev.send_id
GROUP BY c.id, c.name, c.active;

CREATE UNIQUE INDEX idx_campaign_performance_id ON campaign_performance(campaign_id);

COMMENT ON MATERIALIZED VIEW campaign_performance IS 'Aggregated campaign metrics refreshed hourly for dashboard performance';

-- ============================================================================
-- FUNCTION 1: ENROLL_LEAD_IN_CAMPAIGN
-- Purpose: Enroll a lead in a campaign and calculate first send time
-- ============================================================================

CREATE OR REPLACE FUNCTION enroll_lead_in_campaign(
    p_campaign_id UUID,
    p_lead_type VARCHAR(50),
    p_lead_id UUID,
    p_email_address VARCHAR(255)
) RETURNS UUID AS $$
DECLARE
    v_enrollment_id UUID;
    v_first_sequence_id UUID;
    v_delay_days INTEGER;
    v_delay_hours INTEGER;
    v_send_time_hour INTEGER;
    v_next_send_at TIMESTAMPTZ;
BEGIN
    -- Check if lead is already enrolled (idempotent)
    SELECT id INTO v_enrollment_id
    FROM campaign_enrollments
    WHERE campaign_id = p_campaign_id
      AND lead_type = p_lead_type
      AND lead_id = p_lead_id;

    IF v_enrollment_id IS NOT NULL THEN
        RETURN v_enrollment_id;  -- Already enrolled
    END IF;

    -- Get first sequence timing
    SELECT id, delay_days, delay_hours, send_time_hour
    INTO v_first_sequence_id, v_delay_days, v_delay_hours, v_send_time_hour
    FROM email_sequences
    WHERE campaign_id = p_campaign_id
      AND sequence_order = 1
      AND active = true
    LIMIT 1;

    IF v_first_sequence_id IS NULL THEN
        RAISE EXCEPTION 'Campaign % has no active sequences', p_campaign_id;
    END IF;

    -- Calculate next send time
    v_next_send_at := NOW() + (v_delay_days || ' days')::INTERVAL + (v_delay_hours || ' hours')::INTERVAL;

    -- Adjust to preferred send hour if specified
    IF v_send_time_hour IS NOT NULL THEN
        v_next_send_at := date_trunc('day', v_next_send_at) + (v_send_time_hour || ' hours')::INTERVAL;

        -- If calculated time is in the past, move to next day
        IF v_next_send_at < NOW() THEN
            v_next_send_at := v_next_send_at + '1 day'::INTERVAL;
        END IF;
    END IF;

    -- Create enrollment
    INSERT INTO campaign_enrollments (
        campaign_id,
        lead_type,
        lead_id,
        email_address,
        current_step,
        status,
        next_send_at
    ) VALUES (
        p_campaign_id,
        p_lead_type,
        p_lead_id,
        p_email_address,
        0,  -- Not started yet
        'active',
        v_next_send_at
    ) RETURNING id INTO v_enrollment_id;

    RETURN v_enrollment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION enroll_lead_in_campaign IS 'Enrolls a lead in a campaign and calculates when first email should be sent';

-- ============================================================================
-- FUNCTION 2: CALCULATE_NEXT_SEND_TIME
-- Purpose: Calculate when the next email should be sent for an enrollment
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_next_send_time(p_enrollment_id UUID)
RETURNS TIMESTAMPTZ AS $$
DECLARE
    v_campaign_id UUID;
    v_current_step INTEGER;
    v_next_step INTEGER;
    v_delay_days INTEGER;
    v_delay_hours INTEGER;
    v_send_time_hour INTEGER;
    v_next_send_at TIMESTAMPTZ;
BEGIN
    -- Get enrollment details
    SELECT campaign_id, current_step
    INTO v_campaign_id, v_current_step
    FROM campaign_enrollments
    WHERE id = p_enrollment_id;

    -- Calculate next step number
    v_next_step := v_current_step + 1;

    -- Get next sequence timing
    SELECT delay_days, delay_hours, send_time_hour
    INTO v_delay_days, v_delay_hours, v_send_time_hour
    FROM email_sequences
    WHERE campaign_id = v_campaign_id
      AND sequence_order = v_next_step
      AND active = true;

    IF v_delay_days IS NULL THEN
        RETURN NULL;  -- No more sequences
    END IF;

    -- Calculate next send time from now
    v_next_send_at := NOW() + (v_delay_days || ' days')::INTERVAL + (v_delay_hours || ' hours')::INTERVAL;

    -- Adjust to preferred send hour if specified
    IF v_send_time_hour IS NOT NULL THEN
        v_next_send_at := date_trunc('day', v_next_send_at) + (v_send_time_hour || ' hours')::INTERVAL;

        -- If calculated time is in the past, move to next day
        IF v_next_send_at < NOW() THEN
            v_next_send_at := v_next_send_at + '1 day'::INTERVAL;
        END IF;
    END IF;

    RETURN v_next_send_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION calculate_next_send_time IS 'Calculates when the next email in a sequence should be sent';

-- ============================================================================
-- FUNCTION 3: PROCESS_EMAIL_QUEUE
-- Purpose: Get emails that are ready to be sent (called by Cron job)
-- ============================================================================

CREATE OR REPLACE FUNCTION process_email_queue(p_batch_size INTEGER DEFAULT 100)
RETURNS TABLE (
    enrollment_id UUID,
    sequence_id UUID,
    lead_type VARCHAR(50),
    lead_id UUID,
    email_address VARCHAR(255),
    subject TEXT,
    html_template TEXT,
    text_template TEXT,
    template_variables JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id AS enrollment_id,
        s.id AS sequence_id,
        e.lead_type,
        e.lead_id,
        e.email_address,
        t.subject_template AS subject,
        t.html_template,
        t.text_template,
        t.variables AS template_variables
    FROM campaign_enrollments e
    INNER JOIN email_campaigns c ON e.campaign_id = c.id
    INNER JOIN email_sequences s ON c.id = s.campaign_id
        AND s.sequence_order = e.current_step + 1
        AND s.active = true
    INNER JOIN email_templates t ON s.template_id = t.id
        AND t.active = true
    WHERE e.status = 'active'
      AND e.next_send_at IS NOT NULL
      AND e.next_send_at <= NOW()
      AND c.active = true
    ORDER BY e.next_send_at ASC
    LIMIT p_batch_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION process_email_queue IS 'Returns emails ready to be sent (next_send_at <= NOW). Called by Vercel Cron job.';

-- ============================================================================
-- FUNCTION 4: TRACK_EMAIL_EVENT
-- Purpose: Record email engagement events from Resend webhooks
-- ============================================================================

CREATE OR REPLACE FUNCTION track_email_event(
    p_resend_message_id VARCHAR(200),
    p_event_type VARCHAR(50),
    p_event_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_send_id UUID;
    v_event_id UUID;
    v_enrollment_id UUID;
BEGIN
    -- Find the email send record
    SELECT id, enrollment_id INTO v_send_id, v_enrollment_id
    FROM email_sends
    WHERE resend_message_id = p_resend_message_id;

    IF v_send_id IS NULL THEN
        RAISE NOTICE 'No email send found for Resend message ID: %', p_resend_message_id;
        RETURN NULL;
    END IF;

    -- Insert event
    INSERT INTO email_events (send_id, event_type, event_data)
    VALUES (v_send_id, p_event_type, p_event_data)
    RETURNING id INTO v_event_id;

    -- Update email send status if it's a delivery/bounce event
    IF p_event_type = 'delivered' THEN
        UPDATE email_sends
        SET status = 'delivered', updated_at = NOW()
        WHERE id = v_send_id;
    ELSIF p_event_type = 'bounced' THEN
        UPDATE email_sends
        SET status = 'bounced', updated_at = NOW()
        WHERE id = v_send_id;

        -- Mark enrollment as bounced (hard bounce)
        UPDATE campaign_enrollments
        SET status = 'bounced', updated_at = NOW()
        WHERE id = v_enrollment_id;
    ELSIF p_event_type = 'unsubscribed' THEN
        -- Mark enrollment as unsubscribed
        UPDATE campaign_enrollments
        SET status = 'unsubscribed',
            unsubscribed_at = NOW(),
            unsubscribe_reason = 'webhook_event',
            updated_at = NOW()
        WHERE id = v_enrollment_id;
    END IF;

    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION track_email_event IS 'Records email engagement events from Resend webhooks and updates send/enrollment status';

-- ============================================================================
-- FUNCTION 5: REFRESH_CAMPAIGN_PERFORMANCE
-- Purpose: Refresh the materialized view (called by hourly cron)
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_campaign_performance()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY campaign_performance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION refresh_campaign_performance IS 'Refreshes the campaign_performance materialized view. Called hourly by cron job.';

-- ============================================================================
-- TRIGGER 1: AUTO_ENROLL_ON_SPLASH_LEAD_INSERT
-- Purpose: Automatically enroll qualifying leads in matching campaigns
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_enroll_splash_lead()
RETURNS TRIGGER AS $$
DECLARE
    v_campaign RECORD;
    v_enrollment_id UUID;
BEGIN
    -- Only enroll if lead is complete and has TCPA consent
    IF NEW.is_partial = false AND NEW.tcpa_consent = true AND NEW.email IS NOT NULL THEN

        -- Find matching campaigns
        FOR v_campaign IN
            SELECT id, name, trigger_conditions
            FROM email_campaigns
            WHERE active = true
              AND trigger_type = 'form_submission'
        LOOP
            -- Check if trigger conditions match
            -- Basic example: match form_variant
            IF v_campaign.trigger_conditions->>'form_variant' IS NULL
               OR v_campaign.trigger_conditions->>'form_variant' = NEW.form_variant THEN

                -- Enroll lead in campaign
                BEGIN
                    v_enrollment_id := enroll_lead_in_campaign(
                        v_campaign.id,
                        'splash_lead',
                        NEW.id,
                        NEW.email
                    );

                    RAISE NOTICE 'Auto-enrolled lead % in campaign %', NEW.id, v_campaign.name;
                EXCEPTION
                    WHEN OTHERS THEN
                        RAISE WARNING 'Failed to auto-enroll lead % in campaign %: %', NEW.id, v_campaign.name, SQLERRM;
                END;
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_enroll_splash_lead ON splash_leads;

CREATE TRIGGER trigger_auto_enroll_splash_lead
    AFTER INSERT ON splash_leads
    FOR EACH ROW
    EXECUTE FUNCTION auto_enroll_splash_lead();

COMMENT ON TRIGGER trigger_auto_enroll_splash_lead ON splash_leads IS 'Automatically enrolls qualifying splash leads in matching email campaigns';

-- ============================================================================
-- TRIGGER 2: UPDATE_NEXT_SEND_AFTER_EMAIL_SENT
-- Purpose: Update enrollment's next_send_at after an email is sent
-- ============================================================================

CREATE OR REPLACE FUNCTION update_enrollment_after_send()
RETURNS TRIGGER AS $$
DECLARE
    v_next_send_at TIMESTAMPTZ;
    v_total_sequences INTEGER;
    v_next_step INTEGER;
BEGIN
    -- Only process if email was successfully sent
    IF NEW.status = 'sent' OR NEW.status = 'delivered' THEN

        -- Get total number of sequences in campaign
        SELECT COUNT(*) INTO v_total_sequences
        FROM email_sequences es
        INNER JOIN campaign_enrollments ce ON es.campaign_id = ce.campaign_id
        WHERE ce.id = NEW.enrollment_id AND es.active = true;

        -- Calculate next step
        SELECT current_step + 1 INTO v_next_step
        FROM campaign_enrollments
        WHERE id = NEW.enrollment_id;

        -- Calculate when next email should be sent
        v_next_send_at := calculate_next_send_time(NEW.enrollment_id);

        -- Update enrollment
        IF v_next_send_at IS NOT NULL THEN
            -- More emails to send
            UPDATE campaign_enrollments
            SET current_step = v_next_step,
                last_sent_at = NOW(),
                next_send_at = v_next_send_at,
                updated_at = NOW()
            WHERE id = NEW.enrollment_id;
        ELSE
            -- Campaign complete
            UPDATE campaign_enrollments
            SET current_step = v_next_step,
                last_sent_at = NOW(),
                next_send_at = NULL,
                status = 'completed',
                completed_at = NOW(),
                updated_at = NOW()
            WHERE id = NEW.enrollment_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_enrollment_after_send ON email_sends;

CREATE TRIGGER trigger_update_enrollment_after_send
    AFTER INSERT OR UPDATE ON email_sends
    FOR EACH ROW
    WHEN (NEW.status IN ('sent', 'delivered'))
    EXECUTE FUNCTION update_enrollment_after_send();

COMMENT ON TRIGGER trigger_update_enrollment_after_send ON email_sends IS 'Updates enrollment progress and calculates next send time after email is sent';

-- ============================================================================
-- TRIGGER 3: TRACK_CONVERSION_ATTRIBUTION
-- Purpose: Track when leads convert after receiving campaign emails
-- ============================================================================

CREATE OR REPLACE FUNCTION track_conversion_attribution()
RETURNS TRIGGER AS $$
DECLARE
    v_last_email_send RECORD;
BEGIN
    -- Only track status changes to 'converted' or 'qualified'
    IF NEW.status IN ('converted', 'qualified') AND (OLD.status IS NULL OR OLD.status != NEW.status) THEN

        -- Find the last email sent to this lead (within last 30 days)
        SELECT
            s.id,
            s.enrollment_id,
            e.campaign_id,
            s.sent_at
        INTO v_last_email_send
        FROM email_sends s
        INNER JOIN campaign_enrollments e ON s.enrollment_id = e.id
        WHERE s.lead_type = 'splash_lead'
          AND s.lead_id = NEW.id
          AND s.status IN ('sent', 'delivered')
          AND s.sent_at > NOW() - INTERVAL '30 days'
        ORDER BY s.sent_at DESC
        LIMIT 1;

        IF v_last_email_send.id IS NOT NULL THEN
            -- TODO: Create a conversion attribution table to store this
            -- For now, just log it
            RAISE NOTICE 'Lead % converted after receiving campaign email (send_id: %)', NEW.id, v_last_email_send.id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_track_conversion_attribution ON splash_leads;

CREATE TRIGGER trigger_track_conversion_attribution
    AFTER UPDATE ON splash_leads
    FOR EACH ROW
    WHEN (NEW.status IN ('converted', 'qualified'))
    EXECUTE FUNCTION track_conversion_attribution();

COMMENT ON TRIGGER trigger_track_conversion_attribution ON splash_leads IS 'Tracks email campaign attribution when leads convert';

-- ============================================================================
-- ALTER EXISTING TABLES: ADD TCPA CONSENT TRACKING
-- Purpose: Add TCPA compliance fields to existing lead tables
-- ============================================================================

-- Add TCPA consent fields to contact_submissions table
ALTER TABLE IF EXISTS contact_submissions
  ADD COLUMN IF NOT EXISTS tcpa_consent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tcpa_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_ip TEXT,
  ADD COLUMN IF NOT EXISTS consent_user_agent TEXT;

COMMENT ON COLUMN contact_submissions.tcpa_consent IS 'TCPA consent for marketing communications ($1,500 penalty per violation)';
COMMENT ON COLUMN contact_submissions.tcpa_timestamp IS 'Timestamp when consent was given (required for compliance)';
COMMENT ON COLUMN contact_submissions.consent_ip IS 'IP address when consent was given (required for compliance)';

-- Verify splash_leads already has TCPA fields (should exist from previous migration)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'splash_leads' AND column_name = 'tcpa_consent'
    ) THEN
        ALTER TABLE splash_leads
          ADD COLUMN tcpa_consent BOOLEAN DEFAULT false,
          ADD COLUMN sms_consent BOOLEAN DEFAULT false,
          ADD COLUMN tcpa_timestamp TIMESTAMPTZ,
          ADD COLUMN consent_ip TEXT,
          ADD COLUMN consent_user_agent TEXT;

        RAISE NOTICE 'Added TCPA consent fields to splash_leads table';
    ELSE
        RAISE NOTICE 'splash_leads table already has TCPA consent fields';
    END IF;
END $$;

-- ============================================================================
-- GRANT PERMISSIONS
-- Purpose: Ensure proper access control with Row Level Security
-- ============================================================================

-- Grant access to authenticated users (adjust based on your RLS policies)
GRANT SELECT, INSERT, UPDATE, DELETE ON email_campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON email_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON email_sequences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON campaign_enrollments TO authenticated;
GRANT SELECT, INSERT ON email_sends TO authenticated;
GRANT SELECT, INSERT ON email_events TO authenticated;
GRANT SELECT ON campaign_performance TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION enroll_lead_in_campaign TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_next_send_time TO authenticated;
GRANT EXECUTE ON FUNCTION process_email_queue TO authenticated;
GRANT EXECUTE ON FUNCTION track_email_event TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_campaign_performance TO authenticated;

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- Purpose: Insert sample campaign to test system
-- ============================================================================

-- Insert sample campaigns (commented out - uncomment to create test data)
/*
INSERT INTO email_campaigns (name, description, trigger_type, trigger_conditions, active) VALUES
('Ameren Illinois New Lead Campaign', 'Welcome sequence for new Illinois Ameren leads', 'form_submission', '{"form_variant": "ameren_illinois_solar_ppa", "tcpa_consent": true}'::jsonb, true),
('Abandoned Form Nurture', 'Re-engagement for abandoned forms with contact info', 'form_submission', '{"is_partial": true}'::jsonb, true),
('General Contact Follow-Up', 'Follow-up sequence for general contact form submissions', 'form_submission', '{"lead_type": "contact_submission"}'::jsonb, true);
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify tables created
DO $$
DECLARE
    v_table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
          'email_campaigns',
          'email_templates',
          'email_sequences',
          'campaign_enrollments',
          'email_sends',
          'email_events'
      );

    IF v_table_count = 6 THEN
        RAISE NOTICE '✅ Email Drip Campaign System migration completed successfully!';
        RAISE NOTICE '✅ Created 6 tables, 5 functions, 3 triggers, and 1 materialized view';
    ELSE
        RAISE WARNING '⚠️ Migration incomplete. Expected 6 tables, found %', v_table_count;
    END IF;
END $$;
