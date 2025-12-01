-- ============================================================================
-- QUANTUM SOLAR - PROFESSIONAL EMAIL TEMPLATES V2
-- Purpose: Update email templates with professional, conversion-optimized designs
-- Run this after the initial seed to upgrade email templates
-- ============================================================================

-- Email 1: Welcome Email (Day 0) - First Impression is Everything
UPDATE email_templates
SET
  subject_template = '{{firstName}}, Your Free Solar Savings Report is Ready',
  html_template = '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your Solar Savings Report</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif;">
  <!-- Preheader Text -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    See how much you could save with solar - personalized estimate inside...
  </div>

  <!-- Email Container -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Main Content Card -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                <span style="color: #ff0000;">QUANTUM</span> SOLAR
              </h1>
              <p style="color: #a0a0a0; margin: 8px 0 0 0; font-size: 12px; letter-spacing: 2px;">POWERING ILLINOIS HOMES</p>
            </td>
          </tr>

          <!-- Hero Section -->
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <h2 style="color: #1a1a2e; margin: 0 0 15px 0; font-size: 24px; line-height: 1.3;">
                Hey {{firstName}}, Great News!
              </h2>
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0;">
                Thanks for requesting your personalized solar savings estimate. Based on your {{city}} home and current electric bill, here''s what we found:
              </p>
            </td>
          </tr>

          <!-- Savings Highlight Box -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%); border-radius: 12px;">
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <p style="color: rgba(255,255,255,0.9); margin: 0 0 5px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Estimated Annual Savings</p>
                    <p style="color: #ffffff; margin: 0; font-size: 48px; font-weight: 700;">${{estimatedSavings}}</p>
                    <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px;">Based on your ${{electricBill}}/month electric bill</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Benefits List -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h3 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 18px;">What You Get With Quantum Solar:</h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding: 10px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="width: 30px; vertical-align: top;">
                          <span style="color: #ff0000; font-size: 18px;">&#10003;</span>
                        </td>
                        <td style="color: #555555; font-size: 15px; line-height: 1.5;">
                          <strong>$0 Down Financing</strong> - Start saving immediately with no upfront cost
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="width: 30px; vertical-align: top;">
                          <span style="color: #ff0000; font-size: 18px;">&#10003;</span>
                        </td>
                        <td style="color: #555555; font-size: 15px; line-height: 1.5;">
                          <strong>30% Federal Tax Credit</strong> - Claim thousands back on your taxes
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="width: 30px; vertical-align: top;">
                          <span style="color: #ff0000; font-size: 18px;">&#10003;</span>
                        </td>
                        <td style="color: #555555; font-size: 15px; line-height: 1.5;">
                          <strong>25-Year Warranty</strong> - Complete peace of mind, guaranteed
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="width: 30px; vertical-align: top;">
                          <span style="color: #ff0000; font-size: 18px;">&#10003;</span>
                        </td>
                        <td style="color: #555555; font-size: 15px; line-height: 1.5;">
                          <strong>Local Illinois Team</strong> - Expert installation by certified pros
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #ff0000; border-radius: 8px;">
                    <a href="https://quantumsolar.us/schedule" style="display: inline-block; padding: 18px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700;">
                      Get Your Free Custom Design
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #888888; font-size: 13px; margin: 15px 0 0 0;">
                Free consultation • No obligation • Takes 15 minutes
              </p>
            </td>
          </tr>

          <!-- Personal Touch -->
          <tr>
            <td style="padding: 0 40px 40px 40px; border-top: 1px solid #eeeeee;">
              <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 30px 0 0 0;">
                Have questions? Just reply to this email or call us at <strong>(407) 487-6890</strong>. We''re real people, and we''re here to help you make the best decision for your home.
              </p>
              <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 20px 0 0 0;">
                Talk soon,<br>
                <strong>The Quantum Solar Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a2e; padding: 30px 40px; text-align: center;">
              <p style="color: #ffffff; margin: 0 0 5px 0; font-size: 14px; font-weight: 600;">Quantum Solar Enterprises LLC</p>
              <p style="color: #a0a0a0; margin: 0 0 15px 0; font-size: 12px;">511 W 5th St, Tilton, IL 61833</p>
              <p style="margin: 0;">
                <a href="{{unsubscribeUrl}}" style="color: #888888; font-size: 11px; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  text_template = 'Hey {{firstName}}!

Thanks for requesting your personalized solar savings estimate. Based on your {{city}} home and current electric bill, here''s what we found:

YOUR ESTIMATED ANNUAL SAVINGS: ${{estimatedSavings}}
Based on your ${{electricBill}}/month electric bill

What You Get With Quantum Solar:
- $0 Down Financing - Start saving immediately
- 30% Federal Tax Credit - Claim thousands back
- 25-Year Warranty - Complete peace of mind
- Local Illinois Team - Expert installation

Ready to see your custom solar design?
Schedule your free consultation: https://quantumsolar.us/schedule

Questions? Reply to this email or call (407) 487-6890

Talk soon,
The Quantum Solar Team

---
Quantum Solar Enterprises LLC
511 W 5th St, Tilton, IL 61833
Unsubscribe: {{unsubscribeUrl}}',
  updated_at = NOW()
WHERE name = 'Ameren IL - Welcome Email';

-- Email 2: ROI Email (Day 2) - The Numbers Don't Lie
UPDATE email_templates
SET
  subject_template = '{{firstName}}, the math on solar might surprise you',
  html_template = '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solar ROI Breakdown</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif;">
  <div style="display: none; max-height: 0; overflow: hidden;">
    Your utility bill vs. solar payment - see the real numbers...
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                <span style="color: #ff0000;">QUANTUM</span> SOLAR
              </h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px; line-height: 1.3;">
                {{firstName}}, Let''s Talk Numbers
              </h2>
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                I know solar seems like a big decision. So let me break down exactly what happens to your money over the next 25 years:
              </p>

              <!-- Comparison Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="width: 48%; vertical-align: top;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fee2e2; border-radius: 12px; overflow: hidden;">
                      <tr>
                        <td style="padding: 25px; text-align: center;">
                          <p style="color: #991b1b; margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Without Solar</p>
                          <p style="color: #dc2626; margin: 0; font-size: 32px; font-weight: 700;">${{lifetimeCost}}</p>
                          <p style="color: #991b1b; margin: 10px 0 0 0; font-size: 13px;">Paid to utility over 25 years</p>
                          <p style="color: #b91c1c; margin: 15px 0 0 0; font-size: 12px;">+ 4% annual rate increases</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="width: 4%;"></td>
                  <td style="width: 48%; vertical-align: top;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #dcfce7; border-radius: 12px; overflow: hidden;">
                      <tr>
                        <td style="padding: 25px; text-align: center;">
                          <p style="color: #166534; margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">With Solar</p>
                          <p style="color: #16a34a; margin: 0; font-size: 32px; font-weight: 700;">$0</p>
                          <p style="color: #166534; margin: 10px 0 0 0; font-size: 13px;">After system pays itself off</p>
                          <p style="color: #15803d; margin: 15px 0 0 0; font-size: 12px;">Locked rate, never increases</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Key Points -->
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                <h3 style="color: #1a1a2e; margin: 0 0 15px 0; font-size: 16px;">Here''s what most people don''t realize:</h3>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong style="color: #ff0000;">1.</strong> Your solar payment is often <strong>lower</strong> than your current electric bill
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong style="color: #ff0000;">2.</strong> You''ll own a system worth $15,000-$30,000 that adds home value
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong style="color: #ff0000;">3.</strong> The 30% tax credit is like getting a $6,000-$10,000 check from the government
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong style="color: #ff0000;">4.</strong> Once paid off (7-10 years), your power is essentially FREE for 15+ more years
                    </td>
                  </tr>
                </table>
              </div>

              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                <strong>Bottom line:</strong> You''re going to pay for electricity either way. The question is whether you want to keep renting power from the utility, or own your energy and build equity.
              </p>

              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #ff0000; border-radius: 8px;">
                    <a href="https://quantumsolar.us/schedule" style="display: inline-block; padding: 18px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700;">
                      See My Exact Numbers
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #888888; font-size: 13px; margin: 15px 0 0 0; text-align: center;">
                15-minute call • Custom proposal • Zero pressure
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a2e; padding: 30px 40px; text-align: center;">
              <p style="color: #ffffff; margin: 0 0 5px 0; font-size: 14px; font-weight: 600;">Quantum Solar Enterprises LLC</p>
              <p style="color: #a0a0a0; margin: 0 0 15px 0; font-size: 12px;">511 W 5th St, Tilton, IL 61833</p>
              <a href="{{unsubscribeUrl}}" style="color: #888888; font-size: 11px; text-decoration: underline;">Unsubscribe</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  text_template = '{{firstName}}, Let''s Talk Numbers

I know solar seems like a big decision. So let me break down exactly what happens to your money over the next 25 years:

WITHOUT SOLAR: ${{lifetimeCost}}
- Paid to utility over 25 years
- Plus 4% annual rate increases

WITH SOLAR: $0
- After system pays itself off (7-10 years)
- Locked rate, never increases

Here''s what most people don''t realize:

1. Your solar payment is often LOWER than your current electric bill
2. You''ll own a system worth $15,000-$30,000 that adds home value
3. The 30% tax credit is like getting a $6,000-$10,000 check from the government
4. Once paid off, your power is essentially FREE for 15+ more years

Bottom line: You''re going to pay for electricity either way. The question is whether you want to keep renting power or own your energy.

See your exact numbers: https://quantumsolar.us/schedule
15-minute call • Custom proposal • Zero pressure

---
Quantum Solar Enterprises LLC
511 W 5th St, Tilton, IL 61833
Unsubscribe: {{unsubscribeUrl}}',
  updated_at = NOW()
WHERE name = 'Ameren IL - ROI Email (Day 2)';

-- Email 3: Social Proof (Day 5) - Your Neighbors Are Doing It
UPDATE email_templates
SET
  subject_template = 'Your {{city}} neighbors are going solar (here''s why)',
  html_template = '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Illinois Homeowners Going Solar</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif;">
  <div style="display: none; max-height: 0; overflow: hidden;">
    See what Illinois homeowners are saying about their solar investment...
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                <span style="color: #ff0000;">QUANTUM</span> SOLAR
              </h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px; line-height: 1.3;">
                {{firstName}}, You''re Not Alone
              </h2>
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Over <strong>500 Illinois homeowners</strong> went solar with us in the past year. Here''s what a few of them have to say:
              </p>

              <!-- Testimonial 1 -->
              <div style="background-color: #f8fafc; border-left: 4px solid #ff0000; border-radius: 0 12px 12px 0; padding: 25px; margin-bottom: 20px;">
                <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0; font-style: italic;">
                  "Our electric bill dropped from $287/month to $12. We''re putting that $275 savings toward our kids'' college fund. Best financial decision we''ve made."
                </p>
                <p style="color: #1a1a2e; margin: 0; font-size: 14px; font-weight: 600;">
                  — Mike & Sarah T., Champaign
                </p>
                <p style="color: #888888; margin: 5px 0 0 0; font-size: 13px;">
                  10.2 kW system • Saving $3,300/year
                </p>
              </div>

              <!-- Testimonial 2 -->
              <div style="background-color: #f8fafc; border-left: 4px solid #ff0000; border-radius: 0 12px 12px 0; padding: 25px; margin-bottom: 20px;">
                <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0; font-style: italic;">
                  "I was skeptical at first, but the numbers made sense. My solar payment is actually $40 LESS than my old electric bill was. Why didn''t I do this sooner?"
                </p>
                <p style="color: #1a1a2e; margin: 0; font-size: 14px; font-weight: 600;">
                  — Jennifer R., Decatur
                </p>
                <p style="color: #888888; margin: 5px 0 0 0; font-size: 13px;">
                  8.5 kW system • $0 down financing
                </p>
              </div>

              <!-- Testimonial 3 -->
              <div style="background-color: #f8fafc; border-left: 4px solid #ff0000; border-radius: 0 12px 12px 0; padding: 25px; margin-bottom: 30px;">
                <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0; font-style: italic;">
                  "The Quantum team was professional from start to finish. Installation took 2 days, and they handled all the permits and paperwork. Couldn''t be happier."
                </p>
                <p style="color: #1a1a2e; margin: 0; font-size: 14px; font-weight: 600;">
                  — Robert & Linda K., Springfield
                </p>
                <p style="color: #888888; margin: 5px 0 0 0; font-size: 13px;">
                  12 kW system • Includes battery backup
                </p>
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

              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
                <strong>Your neighbors made the switch.</strong> Ready to join them?
              </p>

              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #ff0000; border-radius: 8px;">
                    <a href="https://quantumsolar.us/schedule" style="display: inline-block; padding: 18px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700;">
                      Get My Free Quote
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
              <a href="{{unsubscribeUrl}}" style="color: #888888; font-size: 11px; text-decoration: underline;">Unsubscribe</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  text_template = '{{firstName}}, You''re Not Alone

Over 500 Illinois homeowners went solar with us in the past year. Here''s what they''re saying:

---

"Our electric bill dropped from $287/month to $12. We''re putting that $275 savings toward our kids'' college fund."
— Mike & Sarah T., Champaign
10.2 kW system • Saving $3,300/year

---

"My solar payment is actually $40 LESS than my old electric bill was. Why didn''t I do this sooner?"
— Jennifer R., Decatur
8.5 kW system • $0 down financing

---

"The Quantum team was professional from start to finish. Installation took 2 days."
— Robert & Linda K., Springfield
12 kW system • Includes battery backup

---

BY THE NUMBERS:
• 500+ Illinois Homes Powered
• 4.9 Google Rating
• $2.8M in Customer Savings

Your neighbors made the switch. Ready to join them?

Get your free quote: https://quantumsolar.us/schedule

---
Quantum Solar Enterprises LLC
511 W 5th St, Tilton, IL 61833
Unsubscribe: {{unsubscribeUrl}}',
  updated_at = NOW()
WHERE name = 'Ameren IL - Social Proof (Day 5)';

-- Email 4: Urgency (Day 7) - Time-Sensitive Opportunity
UPDATE email_templates
SET
  subject_template = '{{firstName}}, this incentive expires soon',
  html_template = '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solar Incentive Deadline</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif;">
  <div style="display: none; max-height: 0; overflow: hidden;">
    The 30% federal tax credit won''t last forever - here''s what you need to know...
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                <span style="color: #ff0000;">QUANTUM</span> SOLAR
              </h1>
            </td>
          </tr>

          <!-- Urgency Banner -->
          <tr>
            <td style="background-color: #fef2f2; padding: 15px 40px; text-align: center; border-bottom: 2px solid #fecaca;">
              <p style="color: #dc2626; margin: 0; font-size: 14px; font-weight: 600;">
                &#9888; TIME-SENSITIVE: Federal Tax Credit Schedule
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 24px; line-height: 1.3;">
                {{firstName}}, I Need to Be Straight With You
              </h2>
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                The solar industry is changing, and I don''t want you to miss out on the best incentives we''ve seen in years. Here''s the situation:
              </p>

              <!-- Tax Credit Timeline -->
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                <h3 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 16px;">Federal Solar Tax Credit Schedule:</h3>
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
                <h3 style="color: #ffffff; margin: 0 0 10px 0; font-size: 18px;">What This Means For You:</h3>
                <p style="color: rgba(255,255,255,0.95); margin: 0; font-size: 16px; line-height: 1.6;">
                  On a typical $25,000 system, the 30% credit saves you <strong>$7,500</strong>. That''s money directly off your tax bill.
                </p>
              </div>

              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                <strong>The other factor:</strong> Installation slots fill up fast, especially toward year-end. Our December schedule is already 70% booked.
              </p>

              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                I''m not trying to pressure you - I just want you to have all the facts so you can make the best decision for your family.
              </p>

              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #ff0000; border-radius: 8px;">
                    <a href="https://quantumsolar.us/schedule" style="display: inline-block; padding: 18px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700;">
                      Lock In My 30% Credit
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #888888; font-size: 13px; margin: 15px 0 0 0; text-align: center;">
                Check availability • No commitment required
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a2e; padding: 30px 40px; text-align: center;">
              <p style="color: #ffffff; margin: 0 0 5px 0; font-size: 14px; font-weight: 600;">Quantum Solar Enterprises LLC</p>
              <p style="color: #a0a0a0; margin: 0 0 15px 0; font-size: 12px;">511 W 5th St, Tilton, IL 61833</p>
              <a href="{{unsubscribeUrl}}" style="color: #888888; font-size: 11px; text-decoration: underline;">Unsubscribe</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  text_template = '{{firstName}}, I Need to Be Straight With You

The solar industry is changing, and I don''t want you to miss out on the best incentives we''ve seen in years.

FEDERAL SOLAR TAX CREDIT SCHEDULE:
• 2024-2032: 30% ← You''re here
• 2033: 26%
• 2034: 22%
• 2035+: 0%

WHAT THIS MEANS FOR YOU:
On a typical $25,000 system, the 30% credit saves you $7,500. That''s money directly off your tax bill.

The other factor: Installation slots fill up fast. Our December schedule is already 70% booked.

I''m not trying to pressure you - I just want you to have all the facts so you can make the best decision for your family.

Lock in your 30% credit: https://quantumsolar.us/schedule
Check availability • No commitment required

---
Quantum Solar Enterprises LLC
511 W 5th St, Tilton, IL 61833
Unsubscribe: {{unsubscribeUrl}}',
  updated_at = NOW()
WHERE name = 'Ameren IL - Urgency (Day 7)';

-- Email 5: Final Call (Day 10) - Last Chance, Personal Touch
UPDATE email_templates
SET
  subject_template = 'Quick question, {{firstName}}',
  html_template = '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quick Follow-up</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif;">
  <div style="display: none; max-height: 0; overflow: hidden;">
    Just wanted to check in one more time about your solar quote...
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Simple Header -->
          <tr>
            <td style="padding: 40px 40px 0 40px;">
              <p style="color: #ff0000; margin: 0; font-size: 14px; font-weight: 600; letter-spacing: 1px;">QUANTUM SOLAR</p>
            </td>
          </tr>

          <!-- Main Content - Personal Letter Style -->
          <tr>
            <td style="padding: 30px 40px 40px 40px;">
              <p style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                Hey {{firstName}},
              </p>

              <p style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                I noticed you checked out solar savings for your {{city}} home but haven''t scheduled a consultation yet. I totally get it - it''s a big decision and life gets busy.
              </p>

              <p style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                I just wanted to reach out one more time because I genuinely think solar could be a great fit for you. But I also respect your time, so this will be my last email unless you want to hear more.
              </p>

              <p style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
                <strong>Quick question:</strong> What''s holding you back?
              </p>

              <!-- Common Concerns -->
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                <p style="color: #1a1a2e; margin: 0 0 15px 0; font-size: 15px; font-weight: 600;">If it''s one of these, I can help:</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong>"Not sure about the cost"</strong> → We have $0 down options with payments lower than most electric bills
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong>"My roof might need work"</strong> → We do free roof assessments and can coordinate repairs if needed
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong>"Too many shady solar companies"</strong> → Totally fair. Check our reviews - we''re local, licensed, and not going anywhere
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #555555; font-size: 15px;">
                      <strong>"Just not ready yet"</strong> → No worries! Reply "later" and I''ll check back in 6 months
                    </td>
                  </tr>
                </table>
              </div>

              <p style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0;">
                Either way, I appreciate you taking the time to look into solar. If you ever have questions down the road, my door''s always open.
              </p>

              <!-- Simple CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background-color: #ff0000; border-radius: 8px;">
                          <a href="https://quantumsolar.us/schedule" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600;">
                            Yes, Let''s Talk
                          </a>
                        </td>
                        <td style="width: 15px;"></td>
                        <td style="background-color: #e5e7eb; border-radius: 8px;">
                          <a href="mailto:cesar@quantumsolar.us?subject=Not%20interested%20in%20solar" style="display: inline-block; padding: 16px 32px; color: #374151; text-decoration: none; font-size: 15px; font-weight: 600;">
                            Not Interested
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
                    <p style="color: #888888; margin: 3px 0 0 0; font-size: 13px;">Founder, Quantum Solar</p>
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
              <a href="{{unsubscribeUrl}}" style="color: #9ca3af; font-size: 11px; text-decoration: underline;">Unsubscribe from these emails</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  text_template = 'Hey {{firstName}},

I noticed you checked out solar savings for your {{city}} home but haven''t scheduled a consultation yet. I totally get it - it''s a big decision and life gets busy.

I just wanted to reach out one more time because I genuinely think solar could be a great fit for you. But I also respect your time, so this will be my last email unless you want to hear more.

Quick question: What''s holding you back?

If it''s one of these, I can help:

• "Not sure about the cost" → We have $0 down options with payments lower than most electric bills

• "My roof might need work" → We do free roof assessments and can coordinate repairs if needed

• "Too many shady solar companies" → Totally fair. Check our reviews - we''re local, licensed, and not going anywhere

• "Just not ready yet" → No worries! Reply "later" and I''ll check back in 6 months

Either way, I appreciate you taking the time to look into solar. If you ever have questions down the road, my door''s always open.

→ Let''s talk: https://quantumsolar.us/schedule
→ Not interested? Just reply "no thanks"

Cesar Lugo
Founder, Quantum Solar
(407) 487-6890

---
Quantum Solar Enterprises LLC
511 W 5th St, Tilton, IL 61833
Unsubscribe: {{unsubscribeUrl}}',
  updated_at = NOW()
WHERE name = 'Ameren IL - Final Call (Day 10)';

-- Confirmation
DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'EMAIL TEMPLATES V2 UPDATE COMPLETE';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Updated 5 email templates with professional designs:';
  RAISE NOTICE '  1. Welcome Email - Clean, branded, benefit-focused';
  RAISE NOTICE '  2. ROI Email - Side-by-side comparison, data-driven';
  RAISE NOTICE '  3. Social Proof - Testimonials, trust signals, stats';
  RAISE NOTICE '  4. Urgency Email - Tax credit timeline, scarcity';
  RAISE NOTICE '  5. Final Call - Personal, conversational, objection handling';
  RAISE NOTICE '============================================================================';
END $$;
