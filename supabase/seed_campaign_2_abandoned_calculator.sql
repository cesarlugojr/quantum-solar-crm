-- Campaign 2: Abandoned Calculator Recovery
-- Target: Users who started but didn't complete the solar calculator
-- Goal: 10-15% recovery rate
-- Sequences: 3 emails (15 min, 48 hours, 7 days)

-- Create the campaign
INSERT INTO email_campaigns (
  name,
  description,
  trigger_type,
  trigger_conditions,
  active,
  created_at,
  updated_at
) VALUES (
  'Abandoned Calculator Recovery',
  'Automated follow-up sequence for users who started the solar calculator but didn''t complete it. Designed to re-engage and convert calculator abandoners into qualified leads.',
  'calculator_abandoned',
  '{
    "event": "calculator_abandoned",
    "min_completion_percentage": 25,
    "max_time_since_abandonment_hours": 168
  }'::jsonb,
  true,
  NOW(),
  NOW()
)
RETURNING id;

-- Store the campaign ID in a variable for sequence creation
-- Note: You'll need to replace {{CAMPAIGN_ID}} with the actual ID returned above

-- Email Sequence 1: 15 minutes after abandonment
INSERT INTO email_sequences (
  campaign_id,
  send_order,
  delay_days,
  subject_template,
  html_template,
  template_variables,
  active,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM email_campaigns WHERE name = 'Abandoned Calculator Recovery'),
  1,
  0,  -- Send immediately (15 min is handled by cron schedule)
  'Don''t Leave Money on the Table, {{firstName}}',
  '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Your Solar Savings Estimate</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f9fafb;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">QUANTUM SOLAR</h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">Hi {{firstName}},</h2>

                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                We noticed you started calculating your solar savings but didn''t finish. No worries - your progress is saved!
                            </p>

                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                <strong>Based on your {{utilityCompany}} bill of ${{electricBill}}/month,</strong> our preliminary analysis shows you could save thousands on electricity over the next 25 years.
                            </p>

                            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
                                <p style="color: #92400e; font-size: 16px; margin: 0; font-weight: 600;">
                                    ⚡ Illinois homeowners are saving an average of $1,200-$2,400 per year with solar
                                </p>
                            </div>

                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                It only takes 60 seconds to finish your personalized estimate and see your exact savings potential.
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://quantumsolar.us/calculator?session={{sessionId}}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                            Complete My Solar Estimate
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                                Questions? Reply to this email or call us at (XXX) XXX-XXXX
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                                Quantum Solar Enterprises LLC<br>
                                Illinois | Florida | Nationwide
                            </p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                <a href="{{unsubscribeUrl}}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a> |
                                <a href="https://quantumsolar.us" style="color: #9ca3af; text-decoration: underline;">quantumsolar.us</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>',
  ARRAY['firstName', 'lastName', 'utilityCompany', 'electricBill', 'sessionId', 'unsubscribeUrl'],
  true,
  NOW(),
  NOW()
);

-- Email Sequence 2: 48 hours (2 days) after abandonment
INSERT INTO email_sequences (
  campaign_id,
  send_order,
  delay_days,
  subject_template,
  html_template,
  template_variables,
  active,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM email_campaigns WHERE name = 'Abandoned Calculator Recovery'),
  2,
  2,  -- 48 hours = 2 days
  'Limited Time: Lock In Your Solar Savings Estimate',
  '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Solar Savings Are Waiting</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f9fafb;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">QUANTUM SOLAR</h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">{{firstName}}, Your Solar Savings Are Waiting</h2>

                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Utility rates keep rising, but your solar savings calculator is still ready to show you how to break free from unpredictable electric bills.
                            </p>

                            <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 20px; margin: 30px 0; border-radius: 4px;">
                                <p style="color: #166534; font-size: 18px; margin: 0 0 10px 0; font-weight: 700;">
                                    Why Solar Makes Sense in Illinois:
                                </p>
                                <ul style="color: #15803d; font-size: 16px; margin: 0; padding-left: 20px;">
                                    <li style="margin-bottom: 8px;">25% Federal Tax Credit (ITC)</li>
                                    <li style="margin-bottom: 8px;">Illinois Shines Incentive Program</li>
                                    <li style="margin-bottom: 8px;">Net Metering with {{utilityCompany}}</li>
                                    <li>Lock in energy costs for 25+ years</li>
                                </ul>
                            </div>

                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                <strong>Your personalized estimate is ready.</strong> See exactly how much you could save based on your home, location, and energy usage.
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://quantumsolar.us/calculator?session={{sessionId}}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                            See My Solar Savings Now
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                                Have questions? Our solar experts are here to help: (XXX) XXX-XXXX
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                                Quantum Solar Enterprises LLC<br>
                                Illinois | Florida | Nationwide
                            </p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                <a href="{{unsubscribeUrl}}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a> |
                                <a href="https://quantumsolar.us" style="color: #9ca3af; text-decoration: underline;">quantumsolar.us</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>',
  ARRAY['firstName', 'lastName', 'utilityCompany', 'electricBill', 'sessionId', 'unsubscribeUrl'],
  true,
  NOW(),
  NOW()
);

-- Email Sequence 3: 7 days after abandonment (Final attempt)
INSERT INTO email_sequences (
  campaign_id,
  send_order,
  delay_days,
  subject_template,
  html_template,
  template_variables,
  active,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM email_campaigns WHERE name = 'Abandoned Calculator Recovery'),
  3,
  7,  -- 7 days
  'Last Chance: Your Solar Savings Estimate Expires Soon',
  '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Final Reminder: Solar Savings</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f9fafb;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">QUANTUM SOLAR</h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">{{firstName}}, This Is Your Last Reminder</h2>

                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                We''ve been holding your solar savings estimate for 7 days, but it will expire soon.
                            </p>

                            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 30px 0; border-radius: 4px;">
                                <p style="color: #991b1b; font-size: 16px; margin: 0; font-weight: 600;">
                                    ⏰ Your saved progress will be deleted in 48 hours
                                </p>
                            </div>

                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                <strong>What you''re missing:</strong>
                            </p>

                            <ul style="color: #4b5563; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0; padding-left: 20px;">
                                <li>Exact solar system size for your home</li>
                                <li>Projected lifetime savings ($15,000-$40,000 typical)</li>
                                <li>Monthly payment vs. current electric bill</li>
                                <li>Available incentives and tax credits</li>
                                <li>Environmental impact (CO2 reduction)</li>
                            </ul>

                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                <strong>It takes just 60 seconds to finish.</strong> Don''t let this opportunity slip away.
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://quantumsolar.us/calculator?session={{sessionId}}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                            Complete My Estimate Now
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                                Not interested? <a href="{{unsubscribeUrl}}" style="color: #9ca3af; text-decoration: underline;">Click here</a> and we won''t email you again.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                                Quantum Solar Enterprises LLC<br>
                                Illinois | Florida | Nationwide
                            </p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                <a href="{{unsubscribeUrl}}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a> |
                                <a href="https://quantumsolar.us" style="color: #9ca3af; text-decoration: underline;">quantumsolar.us</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>',
  ARRAY['firstName', 'lastName', 'utilityCompany', 'electricBill', 'sessionId', 'unsubscribeUrl'],
  true,
  NOW(),
  NOW()
);

-- Verify campaign and sequences were created
SELECT
  c.id,
  c.name,
  c.trigger_type,
  c.active,
  COUNT(es.id) as sequence_count
FROM email_campaigns c
LEFT JOIN email_sequences es ON es.campaign_id = c.id
WHERE c.name = 'Abandoned Calculator Recovery'
GROUP BY c.id, c.name, c.trigger_type, c.active;
