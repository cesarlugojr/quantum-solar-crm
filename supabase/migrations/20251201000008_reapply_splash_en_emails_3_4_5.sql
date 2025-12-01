-- ============================================================================
-- RE-APPLY: Splash Page English Emails 3-5
-- Purpose: Fix emails that didn't update correctly in previous migration
-- Date: 2025-12-01
-- ============================================================================

-- Email 3: Financing Options (Day 6)
UPDATE email_templates
SET
  subject_template = '{{firstName}}, $0 Down Solar is Real - Here''s How',
  html_template = '<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>$0 Down Solar Options</title></head>
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
              <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">{{firstName}}, You Don''t Need Cash to Go Solar</h2>
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                The #1 question we get: <em>"How do I pay for solar?"</em> Here''s the truth - you have more options than you think, and most don''t require any money down.
              </p>
              <div style="background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%); border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 30px;">
                <p style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">
                  90% of our customers choose $0 down financing
                </p>
              </div>
              <h3 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 18px;">Your 3 Solar Financing Options:</h3>

              <!-- Option 1: Solar Loan -->
              <div style="background-color: #f8fafc; border-left: 4px solid #ff0000; border-radius: 0 12px 12px 0; padding: 25px; margin-bottom: 20px;">
                <h4 style="color: #ff0000; margin: 0 0 10px 0; font-size: 16px;">1. Solar Loan (Most Popular)</h4>
                <p style="color: #555555; margin: 0 0 10px 0; font-size: 15px; line-height: 1.6;">
                  <strong>How it works:</strong> Finance your system with $0 down. Monthly payments often lower than your current electric bill.
                </p>
                <p style="color: #555555; margin: 0; font-size: 15px; line-height: 1.6;">
                  <strong>Best for:</strong> Homeowners who want to own their system, maximize tax credits, and build equity.
                </p>
              </div>

              <!-- Option 2: Cash Purchase -->
              <div style="background-color: #f8fafc; border-left: 4px solid #ff0000; border-radius: 0 12px 12px 0; padding: 25px; margin-bottom: 20px;">
                <h4 style="color: #ff0000; margin: 0 0 10px 0; font-size: 16px;">2. Cash Purchase</h4>
                <p style="color: #555555; margin: 0 0 10px 0; font-size: 15px; line-height: 1.6;">
                  <strong>How it works:</strong> Pay upfront, get the 30% tax credit, and enjoy the fastest ROI (typically 6-8 years).
                </p>
                <p style="color: #555555; margin: 0; font-size: 15px; line-height: 1.6;">
                  <strong>Best for:</strong> Homeowners with available capital who want maximum long-term savings.
                </p>
              </div>

              <!-- Option 3: Lease/PPA -->
              <div style="background-color: #f8fafc; border-left: 4px solid #ff0000; border-radius: 0 12px 12px 0; padding: 25px; margin-bottom: 30px;">
                <h4 style="color: #ff0000; margin: 0 0 10px 0; font-size: 16px;">3. Solar Lease / PPA</h4>
                <p style="color: #555555; margin: 0 0 10px 0; font-size: 15px; line-height: 1.6;">
                  <strong>How it works:</strong> We install and maintain the system. You pay a fixed monthly fee or per-kWh rate.
                </p>
                <p style="color: #555555; margin: 0; font-size: 15px; line-height: 1.6;">
                  <strong>Best for:</strong> Homeowners who want zero maintenance and predictable costs without ownership.
                </p>
              </div>

              <div style="background-color: #dcfce7; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <p style="color: #166534; margin: 0; font-size: 15px; line-height: 1.6;">
                  <strong>💡 Pro Tip:</strong> With $0 down solar loans, your monthly payment is often <strong>less than</strong> your current electric bill - meaning you start saving from day one.
                </p>
              </div>

              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Not sure which option is right for you? That''s exactly what our free consultation is for. We''ll review all options, run the numbers, and help you choose the best fit for your situation.
              </p>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr><td style="background-color: #ff0000; border-radius: 8px;">
                    <a href="https://quantumsolar.us/schedule" style="display: inline-block; padding: 18px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700;">
                      Explore My Financing Options
                    </a>
                  </td></tr>
              </table>
              <p style="color: #888888; font-size: 13px; margin: 15px 0 0 0; text-align: center;">
                No credit check to get started
              </p>
            </td></tr>
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
  text_template = '{{firstName}}, You Don''t Need Cash to Go Solar

The #1 question: "How do I pay for solar?" You have more options than you think.

90% of our customers choose $0 down financing

YOUR 3 SOLAR FINANCING OPTIONS:

1. SOLAR LOAN (Most Popular)
How it works: Finance with $0 down. Monthly payments often lower than current electric bill.
Best for: Homeowners who want ownership, tax credits, and equity.

2. CASH PURCHASE
How it works: Pay upfront, get 30% tax credit, fastest ROI (6-8 years).
Best for: Available capital, maximum long-term savings.

3. SOLAR LEASE / PPA
How it works: We install and maintain. You pay fixed monthly fee.
Best for: Zero maintenance, predictable costs without ownership.

💡 PRO TIP: $0 down solar loans often have monthly payments LESS than your current electric bill - you save from day one.

Not sure which option fits? That''s what our free consultation is for.

Explore financing options: https://quantumsolar.us/schedule
No credit check to get started

Quantum Solar Enterprises LLC
511 W 5th St, Tilton, IL 61833 • (407) 487-6890
Unsubscribe: {{unsubscribeUrl}}',
  updated_at = NOW()
WHERE name = 'Splash EN - Financing Options' AND language = 'en';

-- Email 4: Social Proof (Day 10)
UPDATE email_templates
SET
  subject_template = 'Why 500+ Illinois families chose Quantum Solar',
  html_template = '<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Illinois Solar Success Stories</title></head>
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
              <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px;">{{firstName}}, You''re Not Alone in This Decision</h2>
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Over <strong>500 Illinois homeowners</strong> have already made the switch to solar with Quantum Solar. Here''s what they''re saying:
              </p>

              <!-- Testimonial 1 -->
              <div style="background-color: #f8fafc; border-left: 4px solid #ff0000; border-radius: 0 12px 12px 0; padding: 25px; margin-bottom: 20px;">
                <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0; font-style: italic;">
                  "Our electric bill went from $287/month to $12. We''re putting that $275 savings toward our kids'' college fund. Best financial decision we''ve made."
                </p>
                <p style="color: #1a1a2e; margin: 0; font-size: 14px; font-weight: 600;">— Mike & Sarah T., Champaign</p>
                <p style="color: #888888; margin: 5px 0 0 0; font-size: 13px;">10.2 kW system • Saving $3,300/year</p>
              </div>

              <!-- Testimonial 2 -->
              <div style="background-color: #f8fafc; border-left: 4px solid #ff0000; border-radius: 0 12px 12px 0; padding: 25px; margin-bottom: 20px;">
                <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0; font-style: italic;">
                  "I was skeptical at first, but the numbers made sense. My solar payment is actually $40 LESS than my old electric bill was. Why didn''t I do this sooner?"
                </p>
                <p style="color: #1a1a2e; margin: 0; font-size: 14px; font-weight: 600;">— Jennifer R., Decatur</p>
                <p style="color: #888888; margin: 5px 0 0 0; font-size: 13px;">8.5 kW system • $0 down financing</p>
              </div>

              <!-- Testimonial 3 -->
              <div style="background-color: #f8fafc; border-left: 4px solid #ff0000; border-radius: 0 12px 12px 0; padding: 25px; margin-bottom: 30px;">
                <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0; font-style: italic;">
                  "The Quantum team was professional from start to finish. Installation took 2 days, and they handled all the permits and paperwork. Couldn''t be happier."
                </p>
                <p style="color: #1a1a2e; margin: 0; font-size: 14px; font-weight: 600;">— Robert & Linda K., Springfield</p>
                <p style="color: #888888; margin: 5px 0 0 0; font-size: 13px;">12 kW system • Includes battery backup</p>
              </div>

              <!-- Stats Bar -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px; text-align: center; width: 33%;">
                    <p style="color: #ff0000; margin: 0; font-size: 32px; font-weight: 700;">500+</p>
                    <p style="color: #a0a0a0; margin: 5px 0 0 0; font-size: 12px;">IL Homes Powered</p>
                  </td>
                  <td style="padding: 25px; text-align: center; width: 33%; border-left: 1px solid #333; border-right: 1px solid #333;">
                    <p style="color: #ff0000; margin: 0; font-size: 32px; font-weight: 700;">4.9</p>
                    <p style="color: #a0a0a0; margin: 5px 0 0 0; font-size: 12px;">Google Rating</p>
                  </td>
                  <td style="padding: 25px; text-align: center; width: 33%;">
                    <p style="color: #ff0000; margin: 0; font-size: 32px; font-weight: 700;">$2.8M</p>
                    <p style="color: #a0a0a0; margin: 5px 0 0 0; font-size: 12px;">Customer Savings</p>
                  </td>
                </tr>
              </table>

              <div style="background-color: #dcfce7; border-radius: 12px; padding: 20px; margin-bottom: 30px; text-align: center;">
                <p style="color: #166534; margin: 0; font-size: 16px; font-weight: 600;">
                  Your neighbors made the switch. Ready to join them?
                </p>
              </div>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr><td style="background-color: #ff0000; border-radius: 8px;">
                    <a href="https://quantumsolar.us/schedule" style="display: inline-block; padding: 18px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700;">
                      Join Our Solar Family
                    </a>
                  </td></tr>
              </table>
            </td></tr>
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
  text_template = '{{firstName}}, You''re Not Alone in This Decision

Over 500 Illinois homeowners have made the switch with Quantum Solar.

WHAT THEY''RE SAYING:

"Our electric bill went from $287/month to $12. We''re putting that $275 savings toward college. Best decision we''ve made."
— Mike & Sarah T., Champaign
10.2 kW system • Saving $3,300/year

"My solar payment is $40 LESS than my old electric bill. Why didn''t I do this sooner?"
— Jennifer R., Decatur
8.5 kW system • $0 down financing

"Professional from start to finish. Installation took 2 days, handled all permits."
— Robert & Linda K., Springfield
12 kW system • Battery backup

BY THE NUMBERS:
• 500+ Illinois Homes Powered
• 4.9 Google Rating
• $2.8M in Customer Savings

Your neighbors made the switch. Ready to join them?

Join our solar family: https://quantumsolar.us/schedule

Quantum Solar Enterprises LLC
511 W 5th St, Tilton, IL 61833 • (407) 487-6890
Unsubscribe: {{unsubscribeUrl}}',
  updated_at = NOW()
WHERE name = 'Splash EN - Social Proof' AND language = 'en';

-- Email 5: Limited Time Offer (Day 14)
UPDATE email_templates
SET
  subject_template = '{{firstName}}, your free consultation is waiting',
  html_template = '<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Free Solar Consultation</title></head>
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
              <p style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">Hey {{firstName}},</p>

              <p style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                I wanted to reach out one more time because I genuinely think solar could be a great fit for you. But I also respect your time, so this will be my last email unless you want to hear more.
              </p>

              <p style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
                <strong>Here''s what you get in your free consultation:</strong>
              </p>

              <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr><td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong style="color: #ff0000;">✓</strong> Custom solar design for your specific roof
                    </td></tr>
                  <tr><td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong style="color: #ff0000;">✓</strong> Exact savings analysis (25-year projection)
                    </td></tr>
                  <tr><td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong style="color: #ff0000;">✓</strong> Your federal tax credit amount calculated
                    </td></tr>
                  <tr><td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong style="color: #ff0000;">✓</strong> All financing options with real numbers
                    </td></tr>
                  <tr><td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong style="color: #ff0000;">✓</strong> Answers to all your questions (no pressure, ever)
                    </td></tr>
                </table>
              </div>

              <div style="background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%); border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 25px;">
                <p style="color: #ffffff; margin: 0; font-size: 17px; font-weight: 600;">
                  15 minutes of your time could save you thousands per year
                </p>
              </div>

              <p style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
                <strong>Still not sure?</strong> Here are the most common concerns we hear:
              </p>

              <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr><td style="padding: 6px 0; color: #555555; font-size: 14px;">
                      <strong>"Can''t afford it"</strong> → $0 down options, payments often lower than your bill
                    </td></tr>
                  <tr><td style="padding: 6px 0; color: #555555; font-size: 14px;">
                      <strong>"Roof might need work"</strong> → Free roof assessment included
                    </td></tr>
                  <tr><td style="padding: 6px 0; color: #555555; font-size: 14px;">
                      <strong>"Don''t trust solar companies"</strong> → We''re local, licensed, 500+ happy customers
                    </td></tr>
                  <tr><td style="padding: 6px 0; color: #555555; font-size: 14px;">
                      <strong>"Need to think about it"</strong> → Perfect! The consultation gives you info to decide
                    </td></tr>
                </table>
              </div>

              <p style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0;">
                Either way, I appreciate you taking the time to explore solar. If you ever have questions down the road, we''re always here to help.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr><td>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background-color: #ff0000; border-radius: 8px;">
                          <a href="https://quantumsolar.us/schedule" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600;">
                            Book My Free Consultation
                          </a>
                        </td>
                        <td style="width: 15px;"></td>
                        <td style="background-color: #e5e7eb; border-radius: 8px;">
                          <a href="mailto:cesar@quantumsolar.us?subject=Not%20interested" style="display: inline-block; padding: 16px 32px; color: #374151; text-decoration: none; font-size: 15px; font-weight: 600;">
                            Not Interested
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td></tr>
              </table>

              <!-- Signature -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-right: 15px; vertical-align: top;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%); border-radius: 50%;">
                      <span style="color: white; font-size: 20px; font-weight: bold; line-height: 50px; text-align: center; display: block; width: 50px;">C</span>
                    </div>
                  </td>
                  <td style="vertical-align: top;">
                    <p style="color: #1a1a2e; margin: 0; font-size: 15px; font-weight: 600;">Cesar Lugo</p>
                    <p style="color: #888888; margin: 3px 0 0 0; font-size: 13px;">Founder, Quantum Solar</p>
                    <p style="color: #888888; margin: 3px 0 0 0; font-size: 13px;">(407) 487-6890</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 25px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 12px;">Quantum Solar Enterprises LLC • 511 W 5th St, Tilton, IL 61833</p>
              <a href="{{unsubscribeUrl}}" style="color: #9ca3af; font-size: 11px; text-decoration: underline;">Unsubscribe</a>
            </td>
          </tr>
        </table>
      </td></tr>
  </table>
</body>
</html>',
  text_template = 'Hey {{firstName}},

I wanted to reach out one more time because I genuinely think solar could be great for you. This will be my last email unless you want to hear more.

HERE''S WHAT YOU GET IN YOUR FREE CONSULTATION:
✓ Custom solar design for your specific roof
✓ Exact savings analysis (25-year projection)
✓ Your federal tax credit amount calculated
✓ All financing options with real numbers
✓ Answers to all questions (no pressure, ever)

15 minutes could save you thousands per year

STILL NOT SURE? Common concerns we hear:
• "Can''t afford it" → $0 down, payments < your bill
• "Roof might need work" → Free roof assessment
• "Don''t trust solar companies" → Local, licensed, 500+ customers
• "Need to think about it" → Consultation gives you info to decide

Either way, I appreciate you exploring solar. Questions? We''re always here.

→ Book free consultation: https://quantumsolar.us/schedule
→ Not interested? Reply "no thanks"

Cesar Lugo
Founder, Quantum Solar
(407) 487-6890

---
Quantum Solar Enterprises LLC
511 W 5th St, Tilton, IL 61833
Unsubscribe: {{unsubscribeUrl}}',
  updated_at = NOW()
WHERE name = 'Splash EN - Limited Time Offer' AND language = 'en';

DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'RE-APPLIED: Splash EN Emails 3-5 (Financing, Social Proof, Final CTA)';
  RAISE NOTICE 'These templates now have the full professional HTML redesign';
  RAISE NOTICE '============================================================================';
END $$;
