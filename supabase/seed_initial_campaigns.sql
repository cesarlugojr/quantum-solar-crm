-- ============================================================================
-- QUANTUM SOLAR - INITIAL EMAIL CAMPAIGNS SETUP
-- Purpose: Create 3 foundational email drip campaigns with templates
-- ============================================================================

-- ============================================================================
-- CAMPAIGN 1: AMEREN ILLINOIS PAID LEAD FAST TRACK
-- Type: Aggressive nurture for paid leads
-- Sequence: 5 emails over 10 days
-- Target: 20-30% consultation booking rate
-- ============================================================================

-- Insert Campaign 1
INSERT INTO email_campaigns (name, description, trigger_type, trigger_conditions, active)
VALUES (
  'Ameren Illinois Paid Lead Fast Track',
  '5-email aggressive sequence for Illinois Ameren promotion leads. Fast-paced with pricing by email 2-3.',
  'form_submission',
  '{"source": "splash_leads", "form_variant": "ameren_illinois_competitor", "paid": true}'::jsonb,
  true
) ON CONFLICT (name) DO NOTHING
RETURNING id;

-- Get campaign ID for later use
DO $$
DECLARE
  v_campaign_1_id UUID;
  v_template_1_1_id UUID;
  v_template_1_2_id UUID;
  v_template_1_3_id UUID;
  v_template_1_4_id UUID;
  v_template_1_5_id UUID;
BEGIN
  -- Get Campaign 1 ID
  SELECT id INTO v_campaign_1_id
  FROM email_campaigns
  WHERE name = 'Ameren Illinois Paid Lead Fast Track';

  -- ============================================================================
  -- CAMPAIGN 1 TEMPLATES (English)
  -- ============================================================================

  -- Email 1: Immediate Welcome (Day 0)
  INSERT INTO email_templates (
    name, category, subject_template, html_template, text_template,
    variables, language, active
  ) VALUES (
    'Ameren IL - Welcome Email',
    'welcome',
    'Your IL Solar Savings: ${{estimatedSavings}}/yr',
    '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #0089D0;">Hi {{firstName}}!</h1>
      <p style="font-size: 16px; line-height: 1.6;">
        Thanks for checking out solar for your {{city}} home! We received your info and here''s what''s next:
      </p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin-top: 0;">Your Estimated Savings</h2>
        <p style="font-size: 24px; color: #0089D0; font-weight: bold; margin: 10px 0;">
          ${{estimatedSavings}}/year
        </p>
        <p style="font-size: 14px; color: #666;">Based on your ${{electricBill}}/month electric bill</p>
      </div>
      <p style="font-size: 16px;">
        <strong>78% of homeowners choose the company that responds first.</strong>
        We''re ready to design your custom solar system - no obligation.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://crm.quantumsolar.us/schedule"
           style="background: #0089D0; color: white; padding: 16px 32px; text-decoration: none;
                  border-radius: 4px; font-size: 18px; display: inline-block; min-width: 44px; min-height: 44px;">
          Schedule Free Consultation
        </a>
      </div>
      <p style="font-size: 14px; color: #666;">
        Or call us: (555) 123-4567
      </p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      <p style="font-size: 12px; color: #999;">
        Quantum Solar Enterprises LLC<br>
        123 Solar St, Chicago, IL 60601<br>
        <a href="{{unsubscribeUrl}}" style="color: #999;">Unsubscribe</a>
      </p>
    </body></html>',
    'Hi {{firstName}}!\n\nThanks for checking out solar for your {{city}} home!\n\nYour Estimated Savings: ${{estimatedSavings}}/year\nBased on your ${{electricBill}}/month electric bill\n\n78% of homeowners choose the company that responds first. We''re ready to design your custom solar system.\n\nSchedule your free consultation: https://crm.quantumsolar.us/schedule\nOr call: (555) 123-4567\n\nQuantum Solar Enterprises LLC\n123 Solar St, Chicago, IL 60601\nUnsubscribe: {{unsubscribeUrl}}',
    '["firstName", "city", "estimatedSavings", "electricBill", "unsubscribeUrl"]'::jsonb,
    'en',
    true
  ) ON CONFLICT (name, language) DO UPDATE
  SET updated_at = NOW()
  RETURNING id INTO v_template_1_1_id;

  -- Email 2: ROI Focus (Day 2)
  INSERT INTO email_templates (
    name, category, subject_template, html_template, text_template,
    variables, language, active
  ) VALUES (
    'Ameren IL - ROI Email (Day 2)',
    'educational',
    '{{firstName}}, Your Solar ROI in 7-9 Yrs',
    '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #0089D0;">The Math is Simple, {{firstName}}</h1>
      <p style="font-size: 16px;">
        Your {{city}} home pays about <strong>${{electricBill}}/month</strong> to the utility company.
        That''s <strong>${{annualCost}}/year</strong> just to keep the lights on.
      </p>
      <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; font-size: 16px;">
          <strong>Over 25 years, you''ll pay the utility: ${{lifetime Cost}}</strong>
        </p>
      </div>
      <p style="font-size: 16px;">
        Or... go solar with $0 down financing:
      </p>
      <ul style="font-size: 16px; line-height: 1.8;">
        <li><strong>Lower monthly payment</strong> than your current bill</li>
        <li><strong>7-9 year payback</strong> - then 15+ years of FREE power</li>
        <li><strong>26% federal tax credit</strong> (ends soon!)</li>
        <li><strong>Lock in rates</strong> - no more 4% annual increases</li>
      </ul>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://crm.quantumsolar.us/schedule"
           style="background: #0089D0; color: white; padding: 16px 32px; text-decoration: none;
                  border-radius: 4px; font-size: 18px; display: inline-block; min-width: 44px; min-height: 44px;">
          See My Custom Proposal
        </a>
      </div>
      <p style="font-size: 14px; color: #666; text-align: center;">
        Free design • No obligation • Response in 24 hours
      </p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      <p style="font-size: 12px; color: #999;">
        Quantum Solar Enterprises LLC<br>
        123 Solar St, Chicago, IL 60601<br>
        <a href="{{unsubscribeUrl}}" style="color: #999;">Unsubscribe</a>
      </p>
    </body></html>',
    'The Math is Simple, {{firstName}}\n\nYour {{city}} home pays ${{electricBill}}/month to the utility.\nOver 25 years: ${{lifetimeCost}}\n\nOr... go solar with $0 down:\n- Lower monthly payment than current bill\n- 7-9 year payback, then 15+ years FREE power\n- 26% federal tax credit (ending soon!)\n- Lock in rates forever\n\nSee your custom proposal: https://crm.quantumsolar.us/schedule\n\nQuantum Solar | Unsubscribe: {{unsubscribeUrl}}',
    '["firstName", "city", "electricBill", "annualCost", "lifetimeCost", "unsubscribeUrl"]'::jsonb,
    'en',
    true
  ) ON CONFLICT (name, language) DO UPDATE
  SET updated_at = NOW()
  RETURNING id INTO v_template_1_2_id;

  -- Email 3: Social Proof (Day 5)
  INSERT INTO email_templates (
    name, category, subject_template, html_template, text_template,
    variables, language, active
  ) VALUES (
    'Ameren IL - Social Proof (Day 5)',
    'social_proof',
    '500+ IL Homeowners Went Solar in 2024',
    '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #0089D0;">Join 500+ Illinois Neighbors</h1>
      <p style="font-size: 16px;">
        {{firstName}}, homeowners across {{city}} are making the switch to solar.
      </p>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Recent Installation: Naperville</h3>
        <p style="font-style: italic; color: #555;">
          "Our electric bill went from $215/month to $12/month. We''re saving over $2,400/year.
          The install took 2 days and the team was professional. Best investment we''ve made."
        </p>
        <p style="font-weight: bold; margin: 5px 0;">- Johnson Family</p>
        <p style="font-size: 14px; color: #666;">
          8.5 kW system • $0 down • Saving $2,400/year
        </p>
      </div>
      <p style="font-size: 16px;">
        <strong>Why wait?</strong> The 26% federal tax credit steps down soon,
        and utility rates keep rising 4% annually.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://crm.quantumsolar.us/schedule"
           style="background: #0089D0; color: white; padding: 16px 32px; text-decoration: none;
                  border-radius: 4px; font-size: 18px; display: inline-block; min-width: 44px; min-height: 44px;">
          Get My Free Quote
        </a>
      </div>
      <p style="font-size: 14px; color: #666; text-align: center;">
        See photos from recent {{city}} installations
      </p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      <p style="font-size: 12px; color: #999;">
        Quantum Solar Enterprises LLC<br>
        123 Solar St, Chicago, IL 60601<br>
        <a href="{{unsubscribeUrl}}" style="color: #999;">Unsubscribe</a>
      </p>
    </body></html>',
    'Join 500+ Illinois Neighbors\n\n{{firstName}}, homeowners across {{city}} are making the switch.\n\nRecent Install: Naperville\n"Our bill went from $215/mo to $12/mo. Saving $2,400/year. Best investment we''ve made." - Johnson Family\n\nWhy wait? 26% tax credit decreasing soon.\n\nGet your free quote: https://crm.quantumsolar.us/schedule\n\nQuantum Solar | Unsubscribe: {{unsubscribeUrl}}',
    '["firstName", "city", "unsubscribeUrl"]'::jsonb,
    'en',
    true
  ) ON CONFLICT (name, language) DO UPDATE
  SET updated_at = NOW()
  RETURNING id INTO v_template_1_3_id;

  -- Email 4: Urgency + Financing (Day 7)
  INSERT INTO email_templates (
    name, category, subject_template, html_template, text_template,
    variables, language, active
  ) VALUES (
    'Ameren IL - Urgency (Day 7)',
    'urgency',
    'Tax Credit Ends Dec 31 - ${{taxCredit}} at Risk',
    '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #dc3545; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0;">⏰ Time-Sensitive: {{firstName}}</h2>
      </div>
      <p style="font-size: 16px;">
        The 26% federal solar tax credit is scheduled to decrease to 22% on January 1st.
      </p>
      <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="font-size: 18px; margin: 0;">
          For your home, that''s <strong style="color: #dc3545;">${{taxCredit}} on the line</strong>
        </p>
      </div>
      <p style="font-size: 16px;">
        <strong>Good news:</strong> We can lock in your 26% credit TODAY with $0 down:
      </p>
      <ul style="font-size: 16px; line-height: 1.8;">
        <li>Approved in as little as 24 hours</li>
        <li>Monthly payments lower than your current bill</li>
        <li>Installation slots filling fast for December</li>
        <li>25-year warranty included</li>
      </ul>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://crm.quantumsolar.us/schedule?urgent=true"
           style="background: #dc3545; color: white; padding: 16px 32px; text-decoration: none;
                  border-radius: 4px; font-size: 18px; display: inline-block; min-width: 44px; min-height: 44px;">
          Lock In 26% Credit Now
        </a>
      </div>
      <p style="font-size: 14px; color: #666; text-align: center;">
        Limited December installation slots available
      </p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      <p style="font-size: 12px; color: #999;">
        Quantum Solar Enterprises LLC<br>
        123 Solar St, Chicago, IL 60601<br>
        <a href="{{unsubscribeUrl}}" style="color: #999;">Unsubscribe</a>
      </p>
    </body></html>',
    '⏰ TIME-SENSITIVE: {{firstName}}\n\n26% federal tax credit drops to 22% on Jan 1st.\n\nFor your home: ${{taxCredit}} on the line\n\nLock in 26% credit TODAY with $0 down:\n- Approved in 24 hours\n- Lower monthly payment\n- December slots filling fast\n- 25-year warranty\n\nLock in now: https://crm.quantumsolar.us/schedule?urgent=true\n\nQuantum Solar | Unsubscribe: {{unsubscribeUrl}}',
    '["firstName", "taxCredit", "unsubscribeUrl"]'::jsonb,
    'en',
    true
  ) ON CONFLICT (name, language) DO UPDATE
  SET updated_at = NOW()
  RETURNING id INTO v_template_1_4_id;

  -- Email 5: Final Call (Day 10)
  INSERT INTO email_templates (
    name, category, subject_template, html_template, text_template,
    variables, language, active
  ) VALUES (
    'Ameren IL - Final Call (Day 10)',
    'cta',
    'Last Chance: Your Solar Quote Expires',
    '<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #0089D0;">{{firstName}}, One Last Thing...</h1>
      <p style="font-size: 16px;">
        I wanted to follow up one final time about solar for your {{city}} home.
      </p>
      <p style="font-size: 16px;">
        I understand you''re busy and maybe solar isn''t the right fit <em>right now</em>.
        But I don''t want you to miss out on:
      </p>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <ul style="font-size: 16px; line-height: 1.8; padding-left: 20px;">
          <li>${{estimatedSavings}}/year in potential savings</li>
          <li>26% federal tax credit (decreasing soon)</li>
          <li>$0 down financing with lower monthly payments</li>
          <li>Protection from rising utility rates</li>
        </ul>
      </div>
      <p style="font-size: 16px;">
        <strong>Take 60 seconds:</strong> Reply to this email or click below.
        If solar makes sense, great. If not, at least you''ll know for sure.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://crm.quantumsolar.us/schedule"
           style="background: #0089D0; color: white; padding: 16px 32px; text-decoration: none;
                  border-radius: 4px; font-size: 18px; display: inline-block; min-width: 44px; min-height: 44px;">
          Yes, Show Me My Savings
        </a>
      </div>
      <p style="font-size: 14px; color: #666; text-align: center;">
        Or reply "NOT INTERESTED" and we''ll remove you from this sequence
      </p>
      <p style="font-size: 16px; margin-top: 30px;">
        Thanks for your time,<br>
        <strong>The Quantum Solar Team</strong>
      </p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      <p style="font-size: 12px; color: #999;">
        Quantum Solar Enterprises LLC<br>
        123 Solar St, Chicago, IL 60601<br>
        <a href="{{unsubscribeUrl}}" style="color: #999;">Unsubscribe</a>
      </p>
    </body></html>',
    '{{firstName}}, One Last Thing...\n\nI wanted to follow up about solar for your {{city}} home.\n\nI don''t want you to miss out on:\n- ${{estimatedSavings}}/year savings\n- 26% tax credit (decreasing soon)\n- $0 down with lower payments\n- Rate protection\n\nTake 60 seconds - let''s see if it makes sense:\nhttps://crm.quantumsolar.us/schedule\n\nOr reply "NOT INTERESTED" to opt out.\n\nThanks,\nQuantum Solar Team\n\nUnsubscribe: {{unsubscribeUrl}}',
    '["firstName", "city", "estimatedSavings", "unsubscribeUrl"]'::jsonb,
    'en',
    true
  ) ON CONFLICT (name, language) DO UPDATE
  SET updated_at = NOW()
  RETURNING id INTO v_template_1_5_id;

  -- ============================================================================
  -- CAMPAIGN 1 EMAIL SEQUENCES
  -- ============================================================================

  -- Sequence 1: Immediate Welcome
  INSERT INTO email_sequences (campaign_id, sequence_order, template_id, delay_days, delay_hours, send_time_hour, active)
  VALUES (v_campaign_1_id, 1, v_template_1_1_id, 0, 0, 9, true)
  ON CONFLICT (campaign_id, sequence_order) DO UPDATE
  SET template_id = EXCLUDED.template_id, updated_at = NOW();

  -- Sequence 2: ROI Email (Day 2)
  INSERT INTO email_sequences (campaign_id, sequence_order, template_id, delay_days, delay_hours, send_time_hour, active)
  VALUES (v_campaign_1_id, 2, v_template_1_2_id, 2, 0, 9, true)
  ON CONFLICT (campaign_id, sequence_order) DO UPDATE
  SET template_id = EXCLUDED.template_id, updated_at = NOW();

  -- Sequence 3: Social Proof (Day 5)
  INSERT INTO email_sequences (campaign_id, sequence_order, template_id, delay_days, delay_hours, send_time_hour, active)
  VALUES (v_campaign_1_id, 3, v_template_1_3_id, 3, 0, 9, true)
  ON CONFLICT (campaign_id, sequence_order) DO UPDATE
  SET template_id = EXCLUDED.template_id, updated_at = NOW();

  -- Sequence 4: Urgency (Day 7)
  INSERT INTO email_sequences (campaign_id, sequence_order, template_id, delay_days, delay_hours, send_time_hour, active)
  VALUES (v_campaign_1_id, 4, v_template_1_4_id, 2, 0, 9, true)
  ON CONFLICT (campaign_id, sequence_order) DO UPDATE
  SET template_id = EXCLUDED.template_id, updated_at = NOW();

  -- Sequence 5: Final Call (Day 10)
  INSERT INTO email_sequences (campaign_id, sequence_order, template_id, delay_days, delay_hours, send_time_hour, active)
  VALUES (v_campaign_1_id, 5, v_template_1_5_id, 3, 0, 9, true)
  ON CONFLICT (campaign_id, sequence_order) DO UPDATE
  SET template_id = EXCLUDED.template_id, updated_at = NOW();

  RAISE NOTICE '✅ Campaign 1: Ameren Illinois Paid Lead Fast Track created with 5 email sequences';
END $$;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '====================================================================';
  RAISE NOTICE '✅ Campaign 1: Ameren Illinois Paid Lead Fast Track - COMPLETE';
  RAISE NOTICE '   - 5 email templates created (English)';
  RAISE NOTICE '   - 5 email sequences configured (Days 0, 2, 5, 7, 10)';
  RAISE NOTICE '   - Send time: 9 AM local time';
  RAISE NOTICE '   - Target: 20-30%% consultation booking rate';
  RAISE NOTICE '====================================================================';
END $$;
