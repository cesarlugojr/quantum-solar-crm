import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * SETUP ENDPOINT: Seed Initial Email Drip Campaigns
 *
 * This endpoint populates the database with email campaigns for:
 * 1. Solar Calculator leads (English) - 5 emails for incomplete calculator submissions
 * 2. Solar Calculator leads (Spanish) - Same sequence in Spanish
 * 3. Splash Page leads (English) - 5 emails for splash page form submissions
 * 4. Splash Page leads (Spanish) - Same sequence in Spanish
 *
 * Only run this ONCE after the email_drip_system migration is applied.
 */

export async function POST() {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    interface ResultItem {
      status?: string;
      [key: string]: unknown;
    }

    const results = {
      campaigns: [] as ResultItem[],
      templates: [] as ResultItem[],
      sequences: [] as ResultItem[],
      errors: [] as ResultItem[]
    };

    // Helper function to create a campaign with templates and sequences
    async function createCampaignWithSequences(
      campaignData: {
        name: string;
        description: string;
        trigger_conditions: Record<string, unknown>;
      },
      templates: Array<{
        name: string;
        category: string;
        subject_template: string;
        html_template: string;
        text_template: string;
        variables: string[];
        language: string;
      }>,
      sequenceDelays: number[] // Days after trigger for each email
    ) {
      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .insert({
          ...campaignData,
          trigger_type: 'form_submission',
          active: true
        })
        .select()
        .single();

      if (campaignError) {
        if (campaignError.code === '23505') {
          const { data: existing } = await supabase
            .from('email_campaigns')
            .select('*')
            .eq('name', campaignData.name)
            .single();
          results.campaigns.push({ campaign: campaignData.name, status: 'already_exists', data: existing });
          return existing?.id;
        } else {
          results.errors.push({ campaign: campaignData.name, error: campaignError.message });
          return null;
        }
      }
      results.campaigns.push({ campaign: campaignData.name, status: 'created', data: campaign });

      // Get campaign ID
      const campaignId = campaign?.id;
      if (!campaignId) {
        const { data: existing } = await supabase
          .from('email_campaigns')
          .select('id')
          .eq('name', campaignData.name)
          .single();
        return existing?.id;
      }

      // Create templates and sequences
      const templateIds: string[] = [];
      for (const template of templates) {
        const { data, error } = await supabase
          .from('email_templates')
          .insert({ ...template, active: true })
          .select('id')
          .single();

        if (error) {
          if (error.code === '23505') {
            const { data: existing } = await supabase
              .from('email_templates')
              .select('id')
              .eq('name', template.name)
              .eq('language', template.language)
              .single();
            templateIds.push(existing?.id || '');
            results.templates.push({ template: template.name, status: 'already_exists' });
          } else {
            results.errors.push({ template: template.name, error: error.message });
            templateIds.push('');
          }
        } else {
          templateIds.push(data.id);
          results.templates.push({ template: template.name, status: 'created', id: data.id });
        }
      }

      // Create sequences
      for (let i = 0; i < sequenceDelays.length; i++) {
        if (!templateIds[i]) continue;

        const { error } = await supabase
          .from('email_sequences')
          .insert({
            campaign_id: campaignId,
            sequence_order: i + 1,
            template_id: templateIds[i],
            delay_days: sequenceDelays[i],
            delay_hours: 0,
            send_time_hour: 9,
            active: true
          });

        if (error) {
          results.errors.push({ sequence: `${campaignData.name} #${i + 1}`, error: error.message });
        } else {
          results.sequences.push({ campaign: campaignData.name, sequence: i + 1, status: 'created' });
        }
      }

      return campaignId;
    }

    // ========================================================================
    // CAMPAIGN 1: SOLAR CALCULATOR - ENGLISH
    // ========================================================================
    console.log('Creating Campaign: Solar Calculator (English)...');

    await createCampaignWithSequences(
      {
        name: 'Solar Calculator Lead Nurture (English)',
        description: '5-email sequence for solar calculator submissions that did not convert to fully qualified leads. Focuses on completing their solar assessment.',
        trigger_conditions: {
          source_type: 'solar_calculator',
          language: 'en',
          form_type: 'calculator'
        }
      },
      [
        {
          name: 'Calculator EN - Welcome & Results',
          category: 'welcome',
          subject_template: '{{firstName}}, Your Solar Savings Estimate: ${{estimatedSavings}}/yr',
          html_template: getCalculatorWelcomeHTML_EN(),
          text_template: getCalculatorWelcomeText_EN(),
          variables: ['firstName', 'city', 'estimatedSavings', 'electricBill', 'systemSize', 'unsubscribeUrl'],
          language: 'en'
        },
        {
          name: 'Calculator EN - Complete Your Quote',
          category: 'follow_up',
          subject_template: '{{firstName}}, Your Custom Solar Design is Waiting',
          html_template: getCalculatorFollowUp1HTML_EN(),
          text_template: getCalculatorFollowUp1Text_EN(),
          variables: ['firstName', 'estimatedSavings', 'unsubscribeUrl'],
          language: 'en'
        },
        {
          name: 'Calculator EN - How Solar Works',
          category: 'educational',
          subject_template: 'How Solar Actually Works for {{city}} Homes',
          html_template: getCalculatorEducationalHTML_EN(),
          text_template: getCalculatorEducationalText_EN(),
          variables: ['firstName', 'city', 'unsubscribeUrl'],
          language: 'en'
        },
        {
          name: 'Calculator EN - Tax Credit Reminder',
          category: 'urgency',
          subject_template: '{{firstName}}, Don\'t Miss the 30% Federal Tax Credit',
          html_template: getCalculatorUrgencyHTML_EN(),
          text_template: getCalculatorUrgencyText_EN(),
          variables: ['firstName', 'taxCredit', 'unsubscribeUrl'],
          language: 'en'
        },
        {
          name: 'Calculator EN - Final Reminder',
          category: 'cta',
          subject_template: 'Last Chance: Your Solar Estimate Expires Soon',
          html_template: getCalculatorFinalHTML_EN(),
          text_template: getCalculatorFinalText_EN(),
          variables: ['firstName', 'estimatedSavings', 'unsubscribeUrl'],
          language: 'en'
        }
      ],
      [0, 2, 5, 8, 12] // Days: Immediate, Day 2, Day 5, Day 8, Day 12
    );

    // ========================================================================
    // CAMPAIGN 2: SOLAR CALCULATOR - SPANISH
    // ========================================================================
    console.log('Creating Campaign: Solar Calculator (Spanish)...');

    await createCampaignWithSequences(
      {
        name: 'Solar Calculator Lead Nurture (Spanish)',
        description: 'Secuencia de 5 correos para leads del calculador solar que no se convirtieron en leads completamente calificados.',
        trigger_conditions: {
          source_type: 'solar_calculator',
          language: 'es',
          form_type: 'calculator'
        }
      },
      [
        {
          name: 'Calculator ES - Bienvenida y Resultados',
          category: 'welcome',
          subject_template: '{{firstName}}, Tu Estimado de Ahorro Solar: ${{estimatedSavings}}/año',
          html_template: getCalculatorWelcomeHTML_ES(),
          text_template: getCalculatorWelcomeText_ES(),
          variables: ['firstName', 'city', 'estimatedSavings', 'electricBill', 'systemSize', 'unsubscribeUrl'],
          language: 'es'
        },
        {
          name: 'Calculator ES - Completa Tu Cotización',
          category: 'follow_up',
          subject_template: '{{firstName}}, Tu Diseño Solar Personalizado Te Espera',
          html_template: getCalculatorFollowUp1HTML_ES(),
          text_template: getCalculatorFollowUp1Text_ES(),
          variables: ['firstName', 'estimatedSavings', 'unsubscribeUrl'],
          language: 'es'
        },
        {
          name: 'Calculator ES - Cómo Funciona Solar',
          category: 'educational',
          subject_template: 'Cómo Funciona la Energía Solar para Hogares en {{city}}',
          html_template: getCalculatorEducationalHTML_ES(),
          text_template: getCalculatorEducationalText_ES(),
          variables: ['firstName', 'city', 'unsubscribeUrl'],
          language: 'es'
        },
        {
          name: 'Calculator ES - Recordatorio Crédito Fiscal',
          category: 'urgency',
          subject_template: '{{firstName}}, No Pierdas el 30% de Crédito Fiscal Federal',
          html_template: getCalculatorUrgencyHTML_ES(),
          text_template: getCalculatorUrgencyText_ES(),
          variables: ['firstName', 'taxCredit', 'unsubscribeUrl'],
          language: 'es'
        },
        {
          name: 'Calculator ES - Último Recordatorio',
          category: 'cta',
          subject_template: 'Última Oportunidad: Tu Estimado Solar Expira Pronto',
          html_template: getCalculatorFinalHTML_ES(),
          text_template: getCalculatorFinalText_ES(),
          variables: ['firstName', 'estimatedSavings', 'unsubscribeUrl'],
          language: 'es'
        }
      ],
      [0, 2, 5, 8, 12] // Days: Immediate, Day 2, Day 5, Day 8, Day 12
    );

    // ========================================================================
    // CAMPAIGN 3: AMEREN ILLINOIS - ENGLISH
    // ========================================================================
    console.log('Creating Campaign: Ameren Illinois Lead Nurture (English)...');

    await createCampaignWithSequences(
      {
        name: 'Ameren Illinois Lead Nurture (English)',
        description: 'Aggressive 5-email sequence for Ameren Illinois promotion leads. Fast-track conversion with urgency and social proof.',
        trigger_conditions: {
          source_type: 'splash_page',
          language: 'en',
          form_type: 'ameren_illinois'
        }
      },
      [
        {
          name: 'Ameren IL EN - Email 1: Savings Hook',
          category: 'welcome',
          subject_template: '{{firstName}}, Ameren Customers Are Saving $2,847/Year - Your Custom Quote is Ready',
          html_template: getAmerenWelcomeHTML_EN(),
          text_template: getAmerenWelcomeText_EN(),
          variables: ['firstName', 'city', 'electricBill', 'unsubscribeUrl'],
          language: 'en'
        },
        {
          name: 'Ameren IL EN - Email 2: ROI Breakdown',
          category: 'educational',
          subject_template: '{{firstName}}: $72,000 to Ameren vs. $0 - Your 25-Year Cost Comparison',
          html_template: getAmerenROIHTML_EN(),
          text_template: getAmerenROIText_EN(),
          variables: ['firstName', 'city', 'electricBill', 'unsubscribeUrl'],
          language: 'en'
        },
        {
          name: 'Ameren IL EN - Email 3: Social Proof',
          category: 'social_proof',
          subject_template: '312 Ameren Customers Switched This Month - Here\'s Why',
          html_template: getAmerenSocialProofHTML_EN(),
          text_template: getAmerenSocialProofText_EN(),
          variables: ['firstName', 'city', 'unsubscribeUrl'],
          language: 'en'
        },
        {
          name: 'Ameren IL EN - Email 4: Urgency',
          category: 'cta',
          subject_template: '⚠️ {{firstName}}, Tax Credit Deadline + Limited Ameren Slots',
          html_template: getAmerenUrgencyHTML_EN(),
          text_template: getAmerenUrgencyText_EN(),
          variables: ['firstName', 'unsubscribeUrl'],
          language: 'en'
        },
        {
          name: 'Ameren IL EN - Email 5: Final Call',
          category: 'cta',
          subject_template: '{{firstName}}, Last Chance: Your Ameren Solar Savings Expire Soon',
          html_template: getAmerenFinalHTML_EN(),
          text_template: getAmerenFinalText_EN(),
          variables: ['firstName', 'unsubscribeUrl'],
          language: 'en'
        }
      ],
      [0, 2, 5, 8, 12] // Days: Immediate, Day 2, Day 5, Day 8, Day 12 (faster sequence)
    );

    // ========================================================================
    // CAMPAIGN 4: AMEREN ILLINOIS - SPANISH
    // ========================================================================
    console.log('Creating Campaign: Ameren Illinois Lead Nurture (Spanish)...');

    await createCampaignWithSequences(
      {
        name: 'Ameren Illinois Lead Nurture (Spanish)',
        description: 'Secuencia agresiva de 5 correos para leads de promoción Ameren Illinois. Conversión rápida con urgencia y prueba social.',
        trigger_conditions: {
          source_type: 'splash_page',
          language: 'es',
          form_type: 'ameren_illinois'
        }
      },
      [
        {
          name: 'Ameren IL ES - Email 1: Gancho de Ahorros',
          category: 'welcome',
          subject_template: '{{firstName}}, Clientes de Ameren Ahorran $2,847/Año - Tu Cotización Está Lista',
          html_template: getAmerenWelcomeHTML_ES(),
          text_template: getAmerenWelcomeText_ES(),
          variables: ['firstName', 'city', 'electricBill', 'unsubscribeUrl'],
          language: 'es'
        },
        {
          name: 'Ameren IL ES - Email 2: Desglose ROI',
          category: 'educational',
          subject_template: '{{firstName}}: $72,000 a Ameren vs. $0 - Tu Comparación de 25 Años',
          html_template: getAmerenROIHTML_ES(),
          text_template: getAmerenROIText_ES(),
          variables: ['firstName', 'city', 'electricBill', 'unsubscribeUrl'],
          language: 'es'
        },
        {
          name: 'Ameren IL ES - Email 3: Prueba Social',
          category: 'social_proof',
          subject_template: '312 Clientes de Ameren Cambiaron Este Mes - Descubre Por Qué',
          html_template: getAmerenSocialProofHTML_ES(),
          text_template: getAmerenSocialProofText_ES(),
          variables: ['firstName', 'city', 'unsubscribeUrl'],
          language: 'es'
        },
        {
          name: 'Ameren IL ES - Email 4: Urgencia',
          category: 'cta',
          subject_template: '⚠️ {{firstName}}, Fecha Límite del Crédito Fiscal + Cupos Limitados',
          html_template: getAmerenUrgencyHTML_ES(),
          text_template: getAmerenUrgencyText_ES(),
          variables: ['firstName', 'unsubscribeUrl'],
          language: 'es'
        },
        {
          name: 'Ameren IL ES - Email 5: Última Llamada',
          category: 'cta',
          subject_template: '{{firstName}}, Última Oportunidad: Tus Ahorros Solares de Ameren Expiran Pronto',
          html_template: getAmerenFinalHTML_ES(),
          text_template: getAmerenFinalText_ES(),
          variables: ['firstName', 'unsubscribeUrl'],
          language: 'es'
        }
      ],
      [0, 2, 5, 8, 12] // Days: Immediate, Day 2, Day 5, Day 8, Day 12 (faster sequence)
    );

    // ========================================================================
    // SUCCESS RESPONSE
    // ========================================================================

    return NextResponse.json({
      success: true,
      message: 'Campaign seeding completed',
      summary: {
        campaigns_created: results.campaigns.filter(c => c.status === 'created').length,
        campaigns_existing: results.campaigns.filter(c => c.status === 'already_exists').length,
        templates_created: results.templates.filter(t => t.status === 'created').length,
        templates_existing: results.templates.filter(t => t.status === 'already_exists').length,
        sequences_created: results.sequences.length,
        errors: results.errors.length
      },
      details: results
    }, { status: 200 });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('Campaign seeding error:', error);
    return NextResponse.json({
      success: false,
      error: message,
      stack: process.env.NODE_ENV === 'development' ? stack : undefined
    }, { status: 500 });
  }
}

// ============================================================================
// EMAIL TEMPLATE HTML GENERATORS - SOLAR CALCULATOR (ENGLISH)
// ============================================================================

function getCalculatorWelcomeHTML_EN(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); padding: 40px 20px; text-align: center;">
    <img src="https://quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 200px; height: auto; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Your IL Solar Savings: \${{estimatedSavings}}/yr</h1>
  </div>
  <div style="background: white; padding: 40px 30px;">
    <p style="font-size: 18px; color: #333; margin-bottom: 25px;">Hi {{firstName}}!</p>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      Thanks for using our solar calculator for your {{city}} home! We received your info and here's what's next:
    </p>
    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #0089D0; padding: 25px; margin: 30px 0; border-radius: 0 12px 12px 0;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Your Estimated Annual Savings</p>
      <p style="margin: 0; font-size: 42px; color: #0089D0; font-weight: bold;">\${{estimatedSavings}}/year</p>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Based on your \${{electricBill}}/month electric bill</p>
    </div>
    <div style="background: #fef3cd; border: 1px solid #ffc107; padding: 15px 20px; border-radius: 8px; margin: 25px 0;">
      <p style="margin: 0; font-size: 16px; color: #856404;">
        <strong>78% of homeowners choose the company that responds first.</strong> We're ready to design your custom solar system - no obligation.
      </p>
    </div>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      Your calculator estimate is a great start, but a personalized design from our local Illinois experts can unlock even MORE savings. We'll show you:
    </p>
    <ul style="color: #555; font-size: 16px; line-height: 2;">
      <li><strong>Your exact 30% federal tax credit</strong> (potentially \${{taxCredit}}+)</li>
      <li><strong>$0 down financing</strong> with payments lower than your current bill</li>
      <li><strong>Custom roof analysis</strong> using satellite imagery</li>
      <li><strong>7-9 year payback</strong> - then 15+ years of FREE power</li>
    </ul>
    <div style="text-align: center; margin: 35px 0;">
      <a href="https://quantumsolar.us/state-promotions/illinois/ameren-il" style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(0,137,208,0.3);">
        Get My Free Custom Design
      </a>
    </div>
    <p style="font-size: 14px; color: #888; text-align: center;">
      Free design - No obligation - Response in 24 hours<br>
      Or call us: <a href="tel:+14074876890" style="color: #0089D0;">(407) 487-6890</a>
    </p>
  </div>
  <div style="background: #1a1a2e; padding: 30px; text-align: center;">
    <img src="https://quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 150px; height: auto; margin-bottom: 15px; filter: brightness(0) invert(1);">
    <p style="color: #aaa; font-size: 12px; margin: 10px 0;">
      Quantum Solar Enterprises LLC<br>
      511 W 5th St, Tilton, IL 61833<br>
      Restoring faith in residential solar
    </p>
    <p style="margin: 15px 0 0 0;">
      <a href="{{unsubscribeUrl}}" style="color: #888; font-size: 12px;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;
}

function getCalculatorWelcomeText_EN(): string {
  return `Hi {{firstName}}!

Thanks for using our solar calculator for your {{city}} home! We received your info and here's what's next:

YOUR ESTIMATED ANNUAL SAVINGS: \${{estimatedSavings}}/year
Based on your \${{electricBill}}/month electric bill

78% OF HOMEOWNERS choose the company that responds first. We're ready to design your custom solar system - no obligation.

Your calculator estimate is a great start, but a personalized design can unlock even MORE savings:
- Your exact 30% federal tax credit (potentially \${{taxCredit}}+)
- $0 down financing with payments lower than your current bill
- Custom roof analysis using satellite imagery
- 7-9 year payback - then 15+ years of FREE power

Get your free custom design: https://quantumsolar.us/state-promotions/illinois/ameren-il
Or call us: (407) 487-6890

Free design - No obligation - Response in 24 hours

Quantum Solar Enterprises LLC
511 W 5th St, Tilton, IL 61833
Restoring faith in residential solar

Unsubscribe: {{unsubscribeUrl}}`;
}

function getCalculatorFollowUp1HTML_EN(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); padding: 40px 20px; text-align: center;">
    <img src="https://quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 200px; height: auto; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0; font-size: 26px;">{{firstName}}, Your Solar ROI in 7-9 Years</h1>
  </div>
  <div style="background: white; padding: 40px 30px;">
    <p style="font-size: 18px; color: #333; margin-bottom: 25px;">The Math is Simple, {{firstName}}</p>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      Your {{city}} home pays about <strong>\${{electricBill}}/month</strong> to the utility company. That's <strong>\${{annualCost}}/year</strong> just to keep the lights on.
    </p>
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 18px; color: #856404;">
        <strong>Over 25 years, you'll pay the utility: \${{lifetimeCost}}</strong>
      </p>
    </div>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      Or... go solar with <strong>$0 down financing</strong>:
    </p>
    <ul style="color: #555; font-size: 16px; line-height: 2;">
      <li><strong>Lower monthly payment</strong> than your current \${{electricBill}}/mo bill</li>
      <li><strong>7-9 year payback</strong> - then 15+ years of FREE power</li>
      <li><strong>30% federal tax credit</strong> - \${{taxCredit}} back in your pocket</li>
      <li><strong>Lock in rates</strong> - no more 4% annual utility increases</li>
    </ul>
    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
      <p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">Your Potential 25-Year Solar Savings</p>
      <p style="margin: 0; font-size: 32px; color: #2e7d32; font-weight: bold;">\${{totalSavings}}+</p>
    </div>
    <div style="text-align: center; margin: 35px 0;">
      <a href="https://quantumsolar.us/state-promotions/illinois/ameren-il" style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: 600; display: inline-block;">
        See My Custom Proposal
      </a>
    </div>
    <p style="font-size: 14px; color: #888; text-align: center;">
      Free design - No obligation - Response in 24 hours
    </p>
  </div>
  <div style="background: #1a1a2e; padding: 30px; text-align: center;">
    <p style="color: #aaa; font-size: 12px; margin: 0;">
      Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833<br>
      <a href="{{unsubscribeUrl}}" style="color: #888;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;
}

function getCalculatorFollowUp1Text_EN(): string {
  return `The Math is Simple, {{firstName}}

Your {{city}} home pays about \${{electricBill}}/month to the utility company.
That's \${{annualCost}}/year just to keep the lights on.

OVER 25 YEARS, YOU'LL PAY THE UTILITY: \${{lifetimeCost}}

Or... go solar with $0 down financing:
- Lower monthly payment than your current \${{electricBill}}/mo bill
- 7-9 year payback - then 15+ years of FREE power
- 30% federal tax credit - \${{taxCredit}} back in your pocket
- Lock in rates - no more 4% annual utility increases

YOUR POTENTIAL 25-YEAR SOLAR SAVINGS: \${{totalSavings}}+

See your custom proposal: https://quantumsolar.us/state-promotions/illinois/ameren-il

Free design - No obligation - Response in 24 hours

Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833
Unsubscribe: {{unsubscribeUrl}}`;
}

function getCalculatorEducationalHTML_EN(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); padding: 40px 20px; text-align: center;">
    <img src="https://quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 200px; height: auto; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0; font-size: 26px;">500+ IL Homeowners Went Solar in 2024</h1>
  </div>
  <div style="background: white; padding: 40px 30px;">
    <p style="font-size: 18px; color: #333; margin-bottom: 25px;">Join 500+ Illinois Neighbors, {{firstName}}</p>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      Homeowners across {{city}} are making the switch to solar. Here's what they're saying:
    </p>
    <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0089D0;">
      <h3 style="margin: 0 0 10px 0; color: #0089D0;">Recent Installation: Naperville</h3>
      <p style="font-style: italic; color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
        "Our electric bill went from $215/month to $12/month. We're saving over $2,400/year. The install took 2 days and the team was professional. Best investment we've made."
      </p>
      <p style="font-weight: bold; margin: 5px 0; color: #333;">- Johnson Family</p>
      <p style="font-size: 14px; color: #666; margin: 0;">8.5 kW system | $0 down | Saving $2,400/year</p>
    </div>
    <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2e7d32;">
      <h3 style="margin: 0 0 10px 0; color: #2e7d32;">Recent Installation: Aurora</h3>
      <p style="font-style: italic; color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
        "I was skeptical at first, but Quantum Solar walked me through everything. Now my solar payment is less than what I was paying ComEd. Wish I'd done this years ago."
      </p>
      <p style="font-weight: bold; margin: 5px 0; color: #333;">- Maria S.</p>
      <p style="font-size: 14px; color: #666; margin: 0;">10.2 kW system | $0 down | Saving $2,800/year</p>
    </div>
    <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <p style="margin: 0; font-size: 16px; color: #856404;">
        <strong>Why wait?</strong> The 30% federal tax credit won't last forever, and utility rates keep rising 4% annually.
      </p>
    </div>
    <div style="text-align: center; margin: 35px 0;">
      <a href="https://quantumsolar.us/state-promotions/illinois/ameren-il" style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: 600; display: inline-block;">
        Get My Free Quote
      </a>
    </div>
    <p style="font-size: 14px; color: #888; text-align: center;">
      See photos from recent {{city}} installations
    </p>
  </div>
  <div style="background: #1a1a2e; padding: 30px; text-align: center;">
    <p style="color: #aaa; font-size: 12px; margin: 0;">
      Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833<br>
      <a href="{{unsubscribeUrl}}" style="color: #888;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;
}

function getCalculatorEducationalText_EN(): string {
  return `Join 500+ Illinois Neighbors, {{firstName}}

Homeowners across {{city}} are making the switch to solar. Here's what they're saying:

RECENT INSTALLATION: NAPERVILLE
"Our electric bill went from $215/month to $12/month. We're saving over $2,400/year. The install took 2 days and the team was professional. Best investment we've made."
- Johnson Family
8.5 kW system | $0 down | Saving $2,400/year

RECENT INSTALLATION: AURORA
"I was skeptical at first, but Quantum Solar walked me through everything. Now my solar payment is less than what I was paying ComEd. Wish I'd done this years ago."
- Maria S.
10.2 kW system | $0 down | Saving $2,800/year

WHY WAIT? The 30% federal tax credit won't last forever, and utility rates keep rising 4% annually.

Get your free quote: https://quantumsolar.us/state-promotions/illinois/ameren-il

Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833
Unsubscribe: {{unsubscribeUrl}}`;
}

function getCalculatorUrgencyHTML_EN(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #dc3545 0%, #b02a37 100%); padding: 40px 20px; text-align: center;">
    <img src="https://quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 200px; height: auto; margin-bottom: 20px; filter: brightness(0) invert(1);">
    <h1 style="color: white; margin: 0; font-size: 26px;">TIME-SENSITIVE: \${{taxCredit}} Tax Credit at Risk</h1>
  </div>
  <div style="background: white; padding: 40px 30px;">
    <div style="background: #dc3545; color: white; padding: 15px 20px; border-radius: 8px; margin-bottom: 25px;">
      <p style="margin: 0; font-size: 18px; font-weight: bold;">Time-Sensitive: {{firstName}}</p>
    </div>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      The <strong>30% federal solar tax credit</strong> is scheduled to step down. This isn't a sales tactic - it's tax law.
    </p>
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border: 2px solid #dc3545; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Your Tax Credit On The Line</p>
      <p style="margin: 0; font-size: 48px; color: #dc3545; font-weight: bold;">\${{taxCredit}}</p>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Cash back on your taxes</p>
    </div>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      <strong>Good news:</strong> We can lock in your 30% credit TODAY with $0 down:
    </p>
    <ul style="color: #555; font-size: 16px; line-height: 2;">
      <li><strong>Approved in as little as 24 hours</strong></li>
      <li><strong>Monthly payments lower than your current \${{electricBill}}/mo bill</strong></li>
      <li><strong>Installation slots filling fast</strong></li>
      <li><strong>25-year warranty included</strong></li>
    </ul>
    <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px 20px; border-radius: 8px; margin: 25px 0;">
      <p style="margin: 0; font-size: 16px; color: #856404;">
        <strong>Limited Availability:</strong> Our installation calendar is filling up. Lock in your spot now to avoid delays.
      </p>
    </div>
    <div style="text-align: center; margin: 35px 0;">
      <a href="https://quantumsolar.us/state-promotions/illinois/ameren-il" style="background: linear-gradient(135deg, #dc3545 0%, #b02a37 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: 600; display: inline-block;">
        Lock In 30% Credit Now
      </a>
    </div>
    <p style="font-size: 14px; color: #888; text-align: center;">
      Limited installation slots available
    </p>
  </div>
  <div style="background: #1a1a2e; padding: 30px; text-align: center;">
    <p style="color: #aaa; font-size: 12px; margin: 0;">
      Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833<br>
      <a href="{{unsubscribeUrl}}" style="color: #888;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;
}

function getCalculatorUrgencyText_EN(): string {
  return `TIME-SENSITIVE: {{firstName}}

The 30% federal solar tax credit is scheduled to step down. This isn't a sales tactic - it's tax law.

YOUR TAX CREDIT ON THE LINE: \${{taxCredit}}
Cash back on your taxes

Good news: We can lock in your 30% credit TODAY with $0 down:
- Approved in as little as 24 hours
- Monthly payments lower than your current \${{electricBill}}/mo bill
- Installation slots filling fast
- 25-year warranty included

LIMITED AVAILABILITY: Our installation calendar is filling up. Lock in your spot now to avoid delays.

Lock in 30% credit now: https://quantumsolar.us/state-promotions/illinois/ameren-il

Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833
Unsubscribe: {{unsubscribeUrl}}`;
}

function getCalculatorFinalHTML_EN(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); padding: 40px 20px; text-align: center;">
    <img src="https://quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 200px; height: auto; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0; font-size: 26px;">Last Chance: Your Solar Quote Expires</h1>
  </div>
  <div style="background: white; padding: 40px 30px;">
    <p style="font-size: 18px; color: #333; margin-bottom: 25px;">{{firstName}}, One Last Thing...</p>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      I wanted to follow up one final time about solar for your {{city}} home.
    </p>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      I understand you're busy and maybe solar isn't the right fit <em>right now</em>. But I don't want you to miss out on:
    </p>
    <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
      <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 16px; line-height: 2;">
        <li><strong>\${{estimatedSavings}}/year</strong> in potential savings</li>
        <li><strong>30% federal tax credit</strong> (\${{taxCredit}} back)</li>
        <li><strong>$0 down financing</strong> with lower monthly payments</li>
        <li><strong>Protection from rising utility rates</strong> (4% annual increases)</li>
      </ul>
    </div>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      <strong>Take 60 seconds:</strong> Reply to this email or click below. If solar makes sense, great. If not, at least you'll know for sure.
    </p>
    <div style="text-align: center; margin: 35px 0;">
      <a href="https://quantumsolar.us/state-promotions/illinois/ameren-il" style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: 600; display: inline-block;">
        Yes, Show Me My Savings
      </a>
    </div>
    <p style="font-size: 14px; color: #888; text-align: center;">
      Or reply "NOT INTERESTED" and we'll remove you from this sequence
    </p>
    <p style="font-size: 16px; color: #555; margin-top: 30px;">
      Thanks for your time,<br>
      <strong>The Quantum Solar Team</strong>
    </p>
  </div>
  <div style="background: #1a1a2e; padding: 30px; text-align: center;">
    <p style="color: #aaa; font-size: 12px; margin: 0;">
      Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833<br>
      <a href="{{unsubscribeUrl}}" style="color: #888;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;
}

function getCalculatorFinalText_EN(): string {
  return `{{firstName}}, One Last Thing...

I wanted to follow up one final time about solar for your {{city}} home.

I understand you're busy and maybe solar isn't the right fit right now. But I don't want you to miss out on:

- \${{estimatedSavings}}/year in potential savings
- 30% federal tax credit (\${{taxCredit}} back)
- $0 down financing with lower monthly payments
- Protection from rising utility rates (4% annual increases)

Take 60 seconds: Reply to this email or click below. If solar makes sense, great. If not, at least you'll know for sure.

Yes, show me my savings: https://quantumsolar.us/state-promotions/illinois/ameren-il

Or reply "NOT INTERESTED" and we'll remove you from this sequence.

Thanks for your time,
The Quantum Solar Team

Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833
Unsubscribe: {{unsubscribeUrl}}`;
}

// ============================================================================
// EMAIL TEMPLATE HTML GENERATORS - SOLAR CALCULATOR (SPANISH)
// ============================================================================

function getCalculatorWelcomeHTML_ES(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); padding: 40px 20px; text-align: center;">
    <img src="https://quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 200px; height: auto; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Tus Ahorros Solares en IL: \${{estimatedSavings}}/ano</h1>
  </div>
  <div style="background: white; padding: 40px 30px;">
    <p style="font-size: 18px; color: #333; margin-bottom: 25px;">Hola {{firstName}}!</p>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      Gracias por usar nuestra calculadora solar para tu hogar en {{city}}! Recibimos tu informacion y esto es lo que sigue:
    </p>
    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #0089D0; padding: 25px; margin: 30px 0; border-radius: 0 12px 12px 0;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Tu Ahorro Anual Estimado</p>
      <p style="margin: 0; font-size: 42px; color: #0089D0; font-weight: bold;">\${{estimatedSavings}}/ano</p>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Basado en tu factura electrica de \${{electricBill}}/mes</p>
    </div>
    <div style="background: #fef3cd; border: 1px solid #ffc107; padding: 15px 20px; border-radius: 8px; margin: 25px 0;">
      <p style="margin: 0; font-size: 16px; color: #856404;">
        <strong>El 78% de los propietarios eligen la primera compania solar que responde.</strong> Estamos listos para disenar tu sistema solar personalizado - sin compromiso.
      </p>
    </div>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      Tu estimado de la calculadora es un buen comienzo, pero un diseno personalizado de nuestros expertos locales de Illinois puede desbloquear MAS ahorros. Te mostraremos:
    </p>
    <ul style="color: #555; font-size: 16px; line-height: 2;">
      <li><strong>Tu credito fiscal federal exacto del 30%</strong> (potencialmente \${{taxCredit}}+)</li>
      <li><strong>Financiamiento con $0 de enganche</strong> con pagos menores a tu factura actual</li>
      <li><strong>Analisis personalizado de tu techo</strong> usando imagenes satelitales</li>
      <li><strong>Retorno de 7-9 anos</strong> - luego 15+ anos de energia GRATIS</li>
    </ul>
    <div style="text-align: center; margin: 35px 0;">
      <a href="https://quantumsolar.us/state-promotions/illinois/ameren-il" style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(0,137,208,0.3);">
        Obtener Mi Diseno Gratuito
      </a>
    </div>
    <p style="font-size: 14px; color: #888; text-align: center;">
      Diseno gratuito - Sin compromiso - Respuesta en 24 horas<br>
      O llamanos: <a href="tel:+14074876890" style="color: #0089D0;">(407) 487-6890</a>
    </p>
  </div>
  <div style="background: #1a1a2e; padding: 30px; text-align: center;">
    <img src="https://quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 150px; height: auto; margin-bottom: 15px; filter: brightness(0) invert(1);">
    <p style="color: #aaa; font-size: 12px; margin: 10px 0;">
      Quantum Solar Enterprises LLC<br>
      511 W 5th St, Tilton, IL 61833<br>
      Restaurando la fe en la energia solar residencial
    </p>
    <p style="margin: 15px 0 0 0;">
      <a href="{{unsubscribeUrl}}" style="color: #888; font-size: 12px;">Cancelar suscripcion</a>
    </p>
  </div>
</body>
</html>`;
}

function getCalculatorWelcomeText_ES(): string {
  return `Hola {{firstName}}!

Gracias por usar nuestra calculadora solar para tu hogar en {{city}}! Recibimos tu informacion y esto es lo que sigue:

TU AHORRO ANUAL ESTIMADO: \${{estimatedSavings}}/ano
Basado en tu factura electrica de \${{electricBill}}/mes

EL 78% DE LOS PROPIETARIOS eligen la primera compania solar que responde. Estamos listos para disenar tu sistema solar - sin compromiso.

Tu estimado es un buen comienzo, pero un diseno personalizado puede desbloquear MAS ahorros:
- Tu credito fiscal federal exacto del 30% (potencialmente \${{taxCredit}}+)
- Financiamiento con $0 de enganche con pagos menores a tu factura actual
- Analisis personalizado de tu techo usando imagenes satelitales
- Retorno de 7-9 anos - luego 15+ anos de energia GRATIS

Obtener tu diseno gratuito: https://quantumsolar.us/state-promotions/illinois/ameren-il
O llamanos: (407) 487-6890

Diseno gratuito - Sin compromiso - Respuesta en 24 horas

Quantum Solar Enterprises LLC
511 W 5th St, Tilton, IL 61833
Restaurando la fe en la energia solar residencial

Cancelar suscripcion: {{unsubscribeUrl}}`;
}

function getCalculatorFollowUp1HTML_ES(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); padding: 40px 20px; text-align: center;">
    <img src="https://quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 200px; height: auto; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0; font-size: 26px;">{{firstName}}, Tu Retorno Solar en 7-9 Anos</h1>
  </div>
  <div style="background: white; padding: 40px 30px;">
    <p style="font-size: 18px; color: #333; margin-bottom: 25px;">Las Matematicas Son Simples, {{firstName}}</p>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      Tu hogar en {{city}} paga aproximadamente <strong>\${{electricBill}}/mes</strong> a la compania electrica. Eso es <strong>\${{annualCost}}/ano</strong> solo para mantener las luces encendidas.
    </p>
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 18px; color: #856404;">
        <strong>En 25 anos, le pagaras a la compania electrica: \${{lifetimeCost}}</strong>
      </p>
    </div>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      O... instala solar con <strong>$0 de enganche</strong>:
    </p>
    <ul style="color: #555; font-size: 16px; line-height: 2;">
      <li><strong>Pago mensual mas bajo</strong> que tu factura actual de \${{electricBill}}/mes</li>
      <li><strong>Retorno en 7-9 anos</strong> - luego 15+ anos de energia GRATIS</li>
      <li><strong>30% credito fiscal federal</strong> - \${{taxCredit}} de vuelta</li>
      <li><strong>Congela tus tarifas</strong> - no mas aumentos del 4% anual</li>
    </ul>
    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
      <p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">Tu Ahorro Potencial en 25 Anos</p>
      <p style="margin: 0; font-size: 32px; color: #2e7d32; font-weight: bold;">\${{totalSavings}}+</p>
    </div>
    <div style="text-align: center; margin: 35px 0;">
      <a href="https://quantumsolar.us/state-promotions/illinois/ameren-il" style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: 600; display: inline-block;">
        Ver Mi Propuesta Personalizada
      </a>
    </div>
    <p style="font-size: 14px; color: #888; text-align: center;">
      Diseno gratuito - Sin compromiso - Respuesta en 24 horas
    </p>
  </div>
  <div style="background: #1a1a2e; padding: 30px; text-align: center;">
    <p style="color: #aaa; font-size: 12px; margin: 0;">
      Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833<br>
      <a href="{{unsubscribeUrl}}" style="color: #888;">Cancelar suscripcion</a>
    </p>
  </div>
</body>
</html>`;
}

function getCalculatorFollowUp1Text_ES(): string {
  return `Las Matematicas Son Simples, {{firstName}}

Tu hogar en {{city}} paga aproximadamente \${{electricBill}}/mes a la compania electrica.
Eso es \${{annualCost}}/ano solo para mantener las luces encendidas.

EN 25 ANOS, LE PAGARAS A LA COMPANIA ELECTRICA: \${{lifetimeCost}}

O... instala solar con $0 de enganche:
- Pago mensual mas bajo que tu factura actual de \${{electricBill}}/mes
- Retorno en 7-9 anos - luego 15+ anos de energia GRATIS
- 30% credito fiscal federal - \${{taxCredit}} de vuelta
- Congela tus tarifas - no mas aumentos del 4% anual

TU AHORRO POTENCIAL EN 25 ANOS: \${{totalSavings}}+

Ver tu propuesta personalizada: https://quantumsolar.us/state-promotions/illinois/ameren-il

Diseno gratuito - Sin compromiso - Respuesta en 24 horas

Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833
Cancelar suscripcion: {{unsubscribeUrl}}`;
}

function getCalculatorEducationalHTML_ES(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); padding: 40px 20px; text-align: center;">
    <img src="https://quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 200px; height: auto; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0; font-size: 26px;">500+ Propietarios de IL Instalaron Solar en 2024</h1>
  </div>
  <div style="background: white; padding: 40px 30px;">
    <p style="font-size: 18px; color: #333; margin-bottom: 25px;">Unete a 500+ Vecinos de Illinois, {{firstName}}</p>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      Propietarios en {{city}} estan haciendo el cambio a solar. Esto es lo que dicen:
    </p>
    <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0089D0;">
      <h3 style="margin: 0 0 10px 0; color: #0089D0;">Instalacion Reciente: Naperville</h3>
      <p style="font-style: italic; color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
        "Nuestra factura electrica bajo de $215/mes a $12/mes. Estamos ahorrando mas de $2,400/ano. La instalacion tomo 2 dias y el equipo fue muy profesional. La mejor inversion que hemos hecho."
      </p>
      <p style="font-weight: bold; margin: 5px 0; color: #333;">- Familia Johnson</p>
      <p style="font-size: 14px; color: #666; margin: 0;">Sistema de 8.5 kW | $0 enganche | Ahorrando $2,400/ano</p>
    </div>
    <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2e7d32;">
      <h3 style="margin: 0 0 10px 0; color: #2e7d32;">Instalacion Reciente: Aurora</h3>
      <p style="font-style: italic; color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
        "Al principio era esceptica, pero Quantum Solar me explico todo. Ahora mi pago solar es menor de lo que pagaba a ComEd. Ojala lo hubiera hecho antes."
      </p>
      <p style="font-weight: bold; margin: 5px 0; color: #333;">- Maria S.</p>
      <p style="font-size: 14px; color: #666; margin: 0;">Sistema de 10.2 kW | $0 enganche | Ahorrando $2,800/ano</p>
    </div>
    <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <p style="margin: 0; font-size: 16px; color: #856404;">
        <strong>Por que esperar?</strong> El credito fiscal federal del 30% no durara para siempre, y las tarifas electricas siguen subiendo 4% anualmente.
      </p>
    </div>
    <div style="text-align: center; margin: 35px 0;">
      <a href="https://quantumsolar.us/state-promotions/illinois/ameren-il" style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: 600; display: inline-block;">
        Obtener Mi Cotizacion Gratuita
      </a>
    </div>
    <p style="font-size: 14px; color: #888; text-align: center;">
      Ve fotos de instalaciones recientes en {{city}}
    </p>
  </div>
  <div style="background: #1a1a2e; padding: 30px; text-align: center;">
    <p style="color: #aaa; font-size: 12px; margin: 0;">
      Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833<br>
      <a href="{{unsubscribeUrl}}" style="color: #888;">Cancelar suscripcion</a>
    </p>
  </div>
</body>
</html>`;
}

function getCalculatorEducationalText_ES(): string {
  return `Unete a 500+ Vecinos de Illinois, {{firstName}}

Propietarios en {{city}} estan haciendo el cambio a solar. Esto es lo que dicen:

INSTALACION RECIENTE: NAPERVILLE
"Nuestra factura electrica bajo de $215/mes a $12/mes. Estamos ahorrando mas de $2,400/ano. La mejor inversion que hemos hecho."
- Familia Johnson
Sistema de 8.5 kW | $0 enganche | Ahorrando $2,400/ano

INSTALACION RECIENTE: AURORA
"Al principio era esceptica, pero Quantum Solar me explico todo. Ahora mi pago solar es menor de lo que pagaba a ComEd."
- Maria S.
Sistema de 10.2 kW | $0 enganche | Ahorrando $2,800/ano

POR QUE ESPERAR? El credito fiscal federal del 30% no durara para siempre, y las tarifas electricas siguen subiendo 4% anualmente.

Obtener tu cotizacion gratuita: https://quantumsolar.us/state-promotions/illinois/ameren-il

Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833
Cancelar suscripcion: {{unsubscribeUrl}}`;
}

function getCalculatorUrgencyHTML_ES(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #dc3545 0%, #b02a37 100%); padding: 40px 20px; text-align: center;">
    <img src="https://quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 200px; height: auto; margin-bottom: 20px; filter: brightness(0) invert(1);">
    <h1 style="color: white; margin: 0; font-size: 26px;">URGENTE: \${{taxCredit}} en Credito Fiscal en Riesgo</h1>
  </div>
  <div style="background: white; padding: 40px 30px;">
    <div style="background: #dc3545; color: white; padding: 15px 20px; border-radius: 8px; margin-bottom: 25px;">
      <p style="margin: 0; font-size: 18px; font-weight: bold;">Urgente: {{firstName}}</p>
    </div>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      El <strong>credito fiscal federal del 30%</strong> esta programado para disminuir. Esto no es una tactica de ventas - es ley fiscal.
    </p>
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border: 2px solid #dc3545; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Tu Credito Fiscal en Riesgo</p>
      <p style="margin: 0; font-size: 48px; color: #dc3545; font-weight: bold;">\${{taxCredit}}</p>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Dinero de vuelta en tus impuestos</p>
    </div>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      <strong>Buenas noticias:</strong> Podemos asegurar tu credito del 30% HOY con $0 de enganche:
    </p>
    <ul style="color: #555; font-size: 16px; line-height: 2;">
      <li><strong>Aprobacion en tan solo 24 horas</strong></li>
      <li><strong>Pagos mensuales mas bajos que tu factura actual de \${{electricBill}}/mes</strong></li>
      <li><strong>Espacios de instalacion llenandose rapido</strong></li>
      <li><strong>Garantia de 25 anos incluida</strong></li>
    </ul>
    <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px 20px; border-radius: 8px; margin: 25px 0;">
      <p style="margin: 0; font-size: 16px; color: #856404;">
        <strong>Disponibilidad Limitada:</strong> Nuestro calendario de instalaciones se esta llenando. Asegura tu espacio ahora para evitar retrasos.
      </p>
    </div>
    <div style="text-align: center; margin: 35px 0;">
      <a href="https://quantumsolar.us/state-promotions/illinois/ameren-il" style="background: linear-gradient(135deg, #dc3545 0%, #b02a37 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: 600; display: inline-block;">
        Asegurar Credito del 30% Ahora
      </a>
    </div>
    <p style="font-size: 14px; color: #888; text-align: center;">
      Espacios de instalacion limitados disponibles
    </p>
  </div>
  <div style="background: #1a1a2e; padding: 30px; text-align: center;">
    <p style="color: #aaa; font-size: 12px; margin: 0;">
      Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833<br>
      <a href="{{unsubscribeUrl}}" style="color: #888;">Cancelar suscripcion</a>
    </p>
  </div>
</body>
</html>`;
}

function getCalculatorUrgencyText_ES(): string {
  return `URGENTE: {{firstName}}

El credito fiscal federal del 30% esta programado para disminuir. Esto no es una tactica de ventas - es ley fiscal.

TU CREDITO FISCAL EN RIESGO: \${{taxCredit}}
Dinero de vuelta en tus impuestos

Buenas noticias: Podemos asegurar tu credito del 30% HOY con $0 de enganche:
- Aprobacion en tan solo 24 horas
- Pagos mensuales mas bajos que tu factura actual de \${{electricBill}}/mes
- Espacios de instalacion llenandose rapido
- Garantia de 25 anos incluida

DISPONIBILIDAD LIMITADA: Nuestro calendario de instalaciones se esta llenando. Asegura tu espacio ahora.

Asegurar credito del 30% ahora: https://quantumsolar.us/state-promotions/illinois/ameren-il

Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833
Cancelar suscripcion: {{unsubscribeUrl}}`;
}

function getCalculatorFinalHTML_ES(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); padding: 40px 20px; text-align: center;">
    <img src="https://quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 200px; height: auto; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0; font-size: 26px;">Ultima Oportunidad: Tu Cotizacion Solar Expira</h1>
  </div>
  <div style="background: white; padding: 40px 30px;">
    <p style="font-size: 18px; color: #333; margin-bottom: 25px;">{{firstName}}, Una Ultima Cosa...</p>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      Queria darte seguimiento una ultima vez sobre energia solar para tu hogar en {{city}}.
    </p>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      Entiendo que estas ocupado y tal vez solar no es lo correcto <em>ahora mismo</em>. Pero no quiero que te pierdas:
    </p>
    <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
      <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 16px; line-height: 2;">
        <li><strong>\${{estimatedSavings}}/ano</strong> en ahorros potenciales</li>
        <li><strong>30% credito fiscal federal</strong> (\${{taxCredit}} de vuelta)</li>
        <li><strong>Financiamiento $0 enganche</strong> con pagos mensuales mas bajos</li>
        <li><strong>Proteccion contra aumentos de tarifas</strong> (4% anual)</li>
      </ul>
    </div>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      <strong>Toma 60 segundos:</strong> Responde a este correo o haz clic abajo. Si solar tiene sentido, excelente. Si no, al menos sabras con certeza.
    </p>
    <div style="text-align: center; margin: 35px 0;">
      <a href="https://quantumsolar.us/state-promotions/illinois/ameren-il" style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: 600; display: inline-block;">
        Si, Muestrame Mis Ahorros
      </a>
    </div>
    <p style="font-size: 14px; color: #888; text-align: center;">
      O responde "NO INTERESADO" y te removeremos de esta secuencia
    </p>
    <p style="font-size: 16px; color: #555; margin-top: 30px;">
      Gracias por tu tiempo,<br>
      <strong>El Equipo de Quantum Solar</strong>
    </p>
  </div>
  <div style="background: #1a1a2e; padding: 30px; text-align: center;">
    <p style="color: #aaa; font-size: 12px; margin: 0;">
      Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833<br>
      <a href="{{unsubscribeUrl}}" style="color: #888;">Cancelar suscripcion</a>
    </p>
  </div>
</body>
</html>`;
}

function getCalculatorFinalText_ES(): string {
  return `{{firstName}}, Una Ultima Cosa...

Queria darte seguimiento una ultima vez sobre energia solar para tu hogar en {{city}}.

Entiendo que estas ocupado y tal vez solar no es lo correcto ahora mismo. Pero no quiero que te pierdas:

- \${{estimatedSavings}}/ano en ahorros potenciales
- 30% credito fiscal federal (\${{taxCredit}} de vuelta)
- Financiamiento $0 enganche con pagos mensuales mas bajos
- Proteccion contra aumentos de tarifas (4% anual)

Toma 60 segundos: Responde a este correo o haz clic abajo. Si solar tiene sentido, excelente. Si no, al menos sabras con certeza.

Si, muestrame mis ahorros: https://quantumsolar.us/state-promotions/illinois/ameren-il

O responde "NO INTERESADO" y te removeremos de esta secuencia.

Gracias por tu tiempo,
El Equipo de Quantum Solar

Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833
Cancelar suscripcion: {{unsubscribeUrl}}`;
}

// ============================================================================
// EMAIL TEMPLATE HTML GENERATORS - AMEREN ILLINOIS (ENGLISH)
// ============================================================================

function getAmerenWelcomeHTML_EN(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); padding: 40px 20px; text-align: center;">
    <img src="https://crm.quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 200px; height: auto; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0; font-size: 26px;">{{firstName}}, Ameren Customers Save $2,847/Year</h1>
    <p style="color: #87CEEB; margin: 10px 0 0 0; font-size: 16px;">Your personalized savings quote is ready</p>
  </div>
  <div style="background: white; padding: 40px 30px;">
    <div style="background: #dc3545; color: white; padding: 12px 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
      <strong>⚡ 78% of homeowners choose the company that responds first</strong>
    </div>
    <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hi {{firstName}},</p>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      Great news! As an <strong>Ameren Illinois customer</strong>, you qualify for our exclusive solar promotion. We've already started calculating your potential savings based on your {{city}} location.
    </p>
    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border: 2px solid #4caf50;">
      <h3 style="margin: 0 0 15px 0; color: #2e7d32; font-size: 18px;">🏠 Average Ameren Customer Savings:</h3>
      <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
        <div style="text-align: center; padding: 10px;">
          <p style="margin: 0; font-size: 28px; font-weight: bold; color: #2e7d32;">$2,847</p>
          <p style="margin: 5px 0 0 0; color: #555; font-size: 12px;">YEARLY SAVINGS</p>
        </div>
        <div style="text-align: center; padding: 10px;">
          <p style="margin: 0; font-size: 28px; font-weight: bold; color: #2e7d32;">$71,175</p>
          <p style="margin: 5px 0 0 0; color: #555; font-size: 12px;">25-YEAR SAVINGS</p>
        </div>
        <div style="text-align: center; padding: 10px;">
          <p style="margin: 0; font-size: 28px; font-weight: bold; color: #2e7d32;">30%</p>
          <p style="margin: 5px 0 0 0; color: #555; font-size: 12px;">TAX CREDIT</p>
        </div>
      </div>
    </div>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      <strong>In your free 15-minute consultation, you'll get:</strong>
    </p>
    <ul style="color: #555; font-size: 16px; line-height: 2;">
      <li>✓ <strong>Your exact savings number</strong> based on your Ameren bill</li>
      <li>✓ <strong>Custom system design</strong> for your roof (satellite analysis)</li>
      <li>✓ <strong>$0 down options</strong> with payments lower than your current bill</li>
      <li>✓ <strong>30% tax credit calculation</strong> - get thousands back</li>
    </ul>
    <div style="text-align: center; margin: 35px 0;">
      <a href="https://quantumsolar.us/schedule" style="background: linear-gradient(135deg, #28a745 0%, #218838 100%); color: white; padding: 20px 50px; text-decoration: none; border-radius: 8px; font-size: 20px; font-weight: 700; display: inline-block; box-shadow: 0 4px 15px rgba(40,167,69,0.4);">
        GET MY FREE QUOTE NOW →
      </a>
    </div>
    <p style="font-size: 14px; color: #888; text-align: center;">
      Or call us directly: <a href="tel:+14074876890" style="color: #0089D0; font-weight: bold;">(407) 487-6890</a>
    </p>
  </div>
  <div style="background: #1a1a2e; padding: 30px; text-align: center;">
    <img src="https://crm.quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 150px; height: auto; margin-bottom: 15px; filter: brightness(0) invert(1);">
    <p style="color: #aaa; font-size: 12px; margin: 10px 0;">
      Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833 | Restoring faith in residential solar
    </p>
    <p style="margin: 15px 0 0 0;">
      <a href="{{unsubscribeUrl}}" style="color: #888; font-size: 12px;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;
}

function getAmerenWelcomeText_EN(): string {
  return `Hi {{firstName}},

⚡ 78% OF HOMEOWNERS CHOOSE THE COMPANY THAT RESPONDS FIRST

Great news! As an Ameren Illinois customer, you qualify for our exclusive solar promotion. We've already started calculating your potential savings.

AVERAGE AMEREN CUSTOMER SAVINGS:
• $2,847 per year
• $71,175 over 25 years
• 30% federal tax credit

IN YOUR FREE 15-MINUTE CONSULTATION:
✓ Your exact savings number based on your Ameren bill
✓ Custom system design for your roof
✓ $0 down options with payments lower than your current bill
✓ 30% tax credit calculation - get thousands back

Get your free quote: https://quantumsolar.us/schedule
Or call: (407) 487-6890

Quantum Solar Enterprises LLC
511 W 5th St, Tilton, IL 61833
Restoring faith in residential solar

Unsubscribe: {{unsubscribeUrl}}`;
}

function getAmerenROIHTML_EN(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); padding: 40px 20px; text-align: center;">
    <img src="https://crm.quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 200px; height: auto; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0; font-size: 24px;">{{firstName}}, Here's What 25 Years of Ameren Bills Really Costs</h1>
  </div>
  <div style="background: white; padding: 40px 30px;">
    <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hi {{firstName}},</p>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      Let me show you the math that Ameren doesn't want you to see...
    </p>

    <div style="background: #ffebee; border: 2px solid #ef5350; padding: 25px; border-radius: 12px; margin: 25px 0;">
      <h3 style="margin: 0 0 15px 0; color: #c62828; font-size: 18px;">❌ WITHOUT SOLAR (Paying Ameren):</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #555;">Current monthly bill:</td>
          <td style="padding: 8px 0; color: #c62828; font-weight: bold; text-align: right;">~$240/month</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #555;">Annual cost:</td>
          <td style="padding: 8px 0; color: #c62828; font-weight: bold; text-align: right;">$2,880/year</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #555;">Rate increases (3%/yr):</td>
          <td style="padding: 8px 0; color: #c62828; font-weight: bold; text-align: right;">Adds $35,000+</td>
        </tr>
        <tr style="border-top: 2px solid #ef5350;">
          <td style="padding: 12px 0; color: #c62828; font-weight: bold; font-size: 18px;">25-YEAR TOTAL:</td>
          <td style="padding: 12px 0; color: #c62828; font-weight: bold; font-size: 24px; text-align: right;">$107,000+</td>
        </tr>
      </table>
      <p style="margin: 15px 0 0 0; color: #c62828; font-size: 14px; text-align: center;">
        <strong>And you OWN NOTHING at the end.</strong>
      </p>
    </div>

    <div style="background: #e8f5e9; border: 2px solid #4caf50; padding: 25px; border-radius: 12px; margin: 25px 0;">
      <h3 style="margin: 0 0 15px 0; color: #2e7d32; font-size: 18px;">✅ WITH SOLAR (Own Your Power):</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #555;">System cost:</td>
          <td style="padding: 8px 0; color: #2e7d32; font-weight: bold; text-align: right;">$35,000</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #555;">30% tax credit:</td>
          <td style="padding: 8px 0; color: #2e7d32; font-weight: bold; text-align: right;">-$10,500</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #555;">Net metering credits:</td>
          <td style="padding: 8px 0; color: #2e7d32; font-weight: bold; text-align: right;">-$8,000</td>
        </tr>
        <tr style="border-top: 2px solid #4caf50;">
          <td style="padding: 12px 0; color: #2e7d32; font-weight: bold; font-size: 18px;">25-YEAR TOTAL:</td>
          <td style="padding: 12px 0; color: #2e7d32; font-weight: bold; font-size: 24px; text-align: right;">$16,500</td>
        </tr>
      </table>
      <p style="margin: 15px 0 0 0; color: #2e7d32; font-size: 14px; text-align: center;">
        <strong>Plus you OWN a $25,000+ asset!</strong>
      </p>
    </div>

    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
      <p style="margin: 0; font-size: 24px; font-weight: bold; color: #856404;">
        YOUR SAVINGS: $90,500+
      </p>
      <p style="margin: 10px 0 0 0; color: #856404; font-size: 14px;">
        That's like getting paid $3,620/year to power your home!
      </p>
    </div>

    <div style="text-align: center; margin: 35px 0;">
      <a href="https://quantumsolar.us/schedule" style="background: linear-gradient(135deg, #28a745 0%, #218838 100%); color: white; padding: 20px 50px; text-decoration: none; border-radius: 8px; font-size: 20px; font-weight: 700; display: inline-block; box-shadow: 0 4px 15px rgba(40,167,69,0.4);">
        GET MY EXACT SAVINGS →
      </a>
    </div>
  </div>
  <div style="background: #1a1a2e; padding: 30px; text-align: center;">
    <p style="color: #aaa; font-size: 12px; margin: 0;">
      Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833<br>
      <a href="{{unsubscribeUrl}}" style="color: #888;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;
}

function getAmerenROIText_EN(): string {
  return `Hi {{firstName}},

Let me show you the math that Ameren doesn't want you to see...

❌ WITHOUT SOLAR (Paying Ameren):
• Current monthly bill: ~$240/month
• Annual cost: $2,880/year
• Rate increases (3%/yr): Adds $35,000+
• 25-YEAR TOTAL: $107,000+
• And you OWN NOTHING at the end.

✅ WITH SOLAR (Own Your Power):
• System cost: $35,000
• 30% tax credit: -$10,500
• Net metering credits: -$8,000
• 25-YEAR TOTAL: $16,500
• Plus you OWN a $25,000+ asset!

YOUR SAVINGS: $90,500+
That's like getting paid $3,620/year to power your home!

Get your exact savings: https://quantumsolar.us/schedule

Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833
Unsubscribe: {{unsubscribeUrl}}`;
}

function getAmerenSocialProofHTML_EN(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); padding: 40px 20px; text-align: center;">
    <img src="https://crm.quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 200px; height: auto; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0; font-size: 24px;">312 Ameren Customers Switched This Month</h1>
    <p style="color: #87CEEB; margin: 10px 0 0 0; font-size: 16px;">Here's what they're saying...</p>
  </div>
  <div style="background: white; padding: 40px 30px;">
    <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hi {{firstName}},</p>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      You're not alone in considering solar. <strong>312 Ameren Illinois customers switched to solar just this month.</strong> Here's what some of your neighbors are saying:
    </p>

    <div style="background: #f8f9fa; border-left: 4px solid #4caf50; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 16px; color: #555; font-style: italic;">
        "My Ameren bill went from $287/month to $12. I should have done this years ago. The Quantum team made it so easy."
      </p>
      <p style="margin: 10px 0 0 0; color: #2e7d32; font-weight: bold;">— Mike R., Springfield, IL (8.2 kW system)</p>
    </div>

    <div style="background: #f8f9fa; border-left: 4px solid #4caf50; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 16px; color: #555; font-style: italic;">
        "We were skeptical after hearing solar horror stories. Quantum was completely different - transparent pricing, no pressure, and they delivered exactly what they promised. Saving $3,100/year now!"
      </p>
      <p style="margin: 10px 0 0 0; color: #2e7d32; font-weight: bold;">— Jennifer & Tom S., Champaign, IL (9.8 kW system)</p>
    </div>

    <div style="background: #f8f9fa; border-left: 4px solid #4caf50; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 16px; color: #555; font-style: italic;">
        "The tax credit alone was $9,400 back in my pocket. Plus my home value went up. Why would anyone keep paying Ameren when this exists?"
      </p>
      <p style="margin: 10px 0 0 0; color: #2e7d32; font-weight: bold;">— David M., Decatur, IL (10.4 kW system)</p>
    </div>

    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
      <p style="margin: 0; font-size: 20px; font-weight: bold; color: #2e7d32;">
        4.9 ★★★★★ Rating
      </p>
      <p style="margin: 10px 0 0 0; color: #555; font-size: 14px;">
        Based on 500+ Illinois installations
      </p>
    </div>

    <div style="text-align: center; margin: 35px 0;">
      <a href="https://quantumsolar.us/schedule" style="background: linear-gradient(135deg, #28a745 0%, #218838 100%); color: white; padding: 20px 50px; text-decoration: none; border-radius: 8px; font-size: 20px; font-weight: 700; display: inline-block; box-shadow: 0 4px 15px rgba(40,167,69,0.4);">
        JOIN YOUR NEIGHBORS →
      </a>
    </div>
  </div>
  <div style="background: #1a1a2e; padding: 30px; text-align: center;">
    <p style="color: #aaa; font-size: 12px; margin: 0;">
      Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833<br>
      <a href="{{unsubscribeUrl}}" style="color: #888;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;
}

function getAmerenSocialProofText_EN(): string {
  return `Hi {{firstName}},

312 AMEREN CUSTOMERS SWITCHED TO SOLAR THIS MONTH

You're not alone in considering solar. Here's what your neighbors are saying:

★★★★★ "My Ameren bill went from $287/month to $12. I should have done this years ago."
— Mike R., Springfield, IL (8.2 kW system)

★★★★★ "We were skeptical after hearing solar horror stories. Quantum was completely different - transparent pricing, no pressure. Saving $3,100/year now!"
— Jennifer & Tom S., Champaign, IL (9.8 kW system)

★★★★★ "The tax credit alone was $9,400 back in my pocket. Plus my home value went up."
— David M., Decatur, IL (10.4 kW system)

4.9 STAR RATING - Based on 500+ Illinois installations

Join your neighbors: https://quantumsolar.us/schedule

Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833
Unsubscribe: {{unsubscribeUrl}}`;
}

function getAmerenUrgencyHTML_EN(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
  <div style="background: #dc3545; padding: 40px 20px; text-align: center;">
    <img src="https://crm.quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 200px; height: auto; margin-bottom: 20px; filter: brightness(0) invert(1);">
    <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ URGENT: Tax Credit Deadline Approaching</h1>
    <p style="color: #ffcdd2; margin: 10px 0 0 0; font-size: 16px;">Limited installation slots available for Ameren territory</p>
  </div>
  <div style="background: white; padding: 40px 30px;">
    <p style="font-size: 18px; color: #333; margin-bottom: 20px;">{{firstName}},</p>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      I need to be direct with you: <strong>the 30% federal tax credit won't last forever</strong>, and our installation calendar for Ameren Illinois territory is filling up fast.
    </p>

    <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 25px; border-radius: 12px; margin: 25px 0;">
      <h3 style="margin: 0 0 15px 0; color: #856404; font-size: 18px;">⏰ WHY ACT NOW:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #856404; line-height: 2;">
        <li><strong>30% tax credit</strong> - This generous incentive WILL decrease</li>
        <li><strong>Only 8 installation slots left</strong> this month for your area</li>
        <li><strong>Ameren rate hike coming</strong> - Lock in savings before prices rise</li>
        <li><strong>Net metering rules</strong> could change at any time</li>
      </ul>
    </div>

    <div style="background: #ffebee; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
      <p style="margin: 0; font-size: 18px; color: #c62828;">
        <strong>Every month you wait costs you ~$237</strong>
      </p>
      <p style="margin: 10px 0 0 0; color: #c62828; font-size: 14px;">
        That's money going to Ameren instead of staying in your pocket
      </p>
    </div>

    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      I've seen too many homeowners say "I'll do it next year" only to miss out on thousands in savings. Don't let that be you.
    </p>

    <div style="text-align: center; margin: 35px 0;">
      <a href="https://quantumsolar.us/schedule" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 20px 50px; text-decoration: none; border-radius: 8px; font-size: 20px; font-weight: 700; display: inline-block; box-shadow: 0 4px 15px rgba(220,53,69,0.4);">
        🔒 LOCK IN MY SAVINGS NOW
      </a>
    </div>

    <p style="font-size: 14px; color: #888; text-align: center;">
      Or call: <a href="tel:+14074876890" style="color: #dc3545; font-weight: bold;">(407) 487-6890</a>
    </p>
  </div>
  <div style="background: #1a1a2e; padding: 30px; text-align: center;">
    <p style="color: #aaa; font-size: 12px; margin: 0;">
      Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833<br>
      <a href="{{unsubscribeUrl}}" style="color: #888;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;
}

function getAmerenUrgencyText_EN(): string {
  return `{{firstName}},

⚠️ URGENT: TAX CREDIT DEADLINE + LIMITED SLOTS

I need to be direct with you: the 30% federal tax credit won't last forever, and our installation calendar for Ameren Illinois territory is filling up fast.

WHY ACT NOW:
• 30% tax credit - This generous incentive WILL decrease
• Only 8 installation slots left this month for your area
• Ameren rate hike coming - Lock in savings before prices rise
• Net metering rules could change at any time

⚠️ Every month you wait costs you ~$237
That's money going to Ameren instead of staying in your pocket

I've seen too many homeowners say "I'll do it next year" only to miss out on thousands in savings. Don't let that be you.

Lock in your savings: https://quantumsolar.us/schedule
Or call: (407) 487-6890

Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833
Unsubscribe: {{unsubscribeUrl}}`;
}

function getAmerenFinalHTML_EN(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); padding: 40px 20px; text-align: center;">
    <img src="https://crm.quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 200px; height: auto; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0; font-size: 24px;">{{firstName}}, This is My Last Email</h1>
    <p style="color: #87CEEB; margin: 10px 0 0 0; font-size: 16px;">Unless you want to save $90,000+</p>
  </div>
  <div style="background: white; padding: 40px 30px;">
    <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hi {{firstName}},</p>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      I've sent you a few emails over the past week about how Ameren Illinois customers are saving thousands with solar. This will be my last one.
    </p>

    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      <strong>Here's a quick recap of what you'd be getting:</strong>
    </p>

    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border: 2px solid #4caf50;">
      <ul style="margin: 0; padding-left: 20px; color: #2e7d32; line-height: 2; font-size: 16px;">
        <li><strong>$2,847/year</strong> in energy savings (average Ameren customer)</li>
        <li><strong>$10,500+</strong> back from the 30% federal tax credit</li>
        <li><strong>$71,175+</strong> total savings over 25 years</li>
        <li><strong>$0 down</strong> financing with payments lower than your Ameren bill</li>
        <li><strong>25-year warranty</strong> on equipment and performance</li>
        <li><strong>Free maintenance</strong> for the life of your system</li>
      </ul>
    </div>

    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      If you're still on the fence, I get it. Solar is a big decision. But here's the thing: <strong>every month you wait is another $237+ going to Ameren</strong> instead of staying in your pocket.
    </p>

    <div style="text-align: center; margin: 35px 0;">
      <a href="https://quantumsolar.us/schedule" style="background: linear-gradient(135deg, #28a745 0%, #218838 100%); color: white; padding: 20px 50px; text-decoration: none; border-radius: 8px; font-size: 20px; font-weight: 700; display: inline-block; box-shadow: 0 4px 15px rgba(40,167,69,0.4);">
        YES, I WANT TO SAVE →
      </a>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
      <p style="margin: 0; font-size: 14px; color: #666;">
        <strong>Not interested?</strong> No worries - just reply "NOT INTERESTED" and I'll remove you from future emails.
      </p>
    </div>

    <p style="font-size: 14px; color: #888; text-align: center;">
      Questions? Call me directly: <a href="tel:+14074876890" style="color: #0089D0; font-weight: bold;">(407) 487-6890</a>
    </p>
  </div>
  <div style="background: #1a1a2e; padding: 30px; text-align: center;">
    <p style="color: #aaa; font-size: 12px; margin: 0;">
      Quantum Solar Enterprises LLC | Restoring faith in residential solar<br>
      <a href="{{unsubscribeUrl}}" style="color: #888;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;
}

function getAmerenFinalText_EN(): string {
  return `Hi {{firstName}},

This is my last email about solar savings for Ameren Illinois customers.

HERE'S WHAT YOU'D BE GETTING:
✓ $2,847/year in energy savings (average Ameren customer)
✓ $10,500+ back from the 30% federal tax credit
✓ $71,175+ total savings over 25 years
✓ $0 down financing with payments lower than your Ameren bill
✓ 25-year warranty on equipment and performance
✓ Free maintenance for the life of your system

Every month you wait is another $237+ going to Ameren instead of staying in your pocket.

YES, I WANT TO SAVE: https://quantumsolar.us/schedule

Not interested? No worries - just reply "NOT INTERESTED" and I'll remove you from future emails.

Questions? Call me: (407) 487-6890

Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833
Unsubscribe: {{unsubscribeUrl}}`;
}

// ============================================================================
// EMAIL TEMPLATE HTML GENERATORS - AMEREN ILLINOIS (SPANISH)
// ============================================================================

function getAmerenWelcomeHTML_ES(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); padding: 40px 20px; text-align: center;">
    <img src="https://crm.quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 200px; height: auto; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0; font-size: 26px;">{{firstName}}, Clientes de Ameren Ahorran $2,847/Año</h1>
    <p style="color: #87CEEB; margin: 10px 0 0 0; font-size: 16px;">Tu cotización personalizada está lista</p>
  </div>
  <div style="background: white; padding: 40px 30px;">
    <div style="background: #dc3545; color: white; padding: 12px 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
      <strong>⚡ 78% de los propietarios eligen la compañía que responde primero</strong>
    </div>
    <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hola {{firstName}},</p>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      ¡Excelentes noticias! Como <strong>cliente de Ameren Illinois</strong>, calificas para nuestra promoción exclusiva de solar. Ya comenzamos a calcular tus ahorros potenciales basados en tu ubicación en {{city}}.
    </p>
    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border: 2px solid #4caf50;">
      <h3 style="margin: 0 0 15px 0; color: #2e7d32; font-size: 18px;">🏠 Ahorros Promedio de Clientes Ameren:</h3>
      <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
        <div style="text-align: center; padding: 10px;">
          <p style="margin: 0; font-size: 28px; font-weight: bold; color: #2e7d32;">$2,847</p>
          <p style="margin: 5px 0 0 0; color: #555; font-size: 12px;">AHORRO ANUAL</p>
        </div>
        <div style="text-align: center; padding: 10px;">
          <p style="margin: 0; font-size: 28px; font-weight: bold; color: #2e7d32;">$71,175</p>
          <p style="margin: 5px 0 0 0; color: #555; font-size: 12px;">AHORRO 25 AÑOS</p>
        </div>
        <div style="text-align: center; padding: 10px;">
          <p style="margin: 0; font-size: 28px; font-weight: bold; color: #2e7d32;">30%</p>
          <p style="margin: 5px 0 0 0; color: #555; font-size: 12px;">CRÉDITO FISCAL</p>
        </div>
      </div>
    </div>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      <strong>En tu consulta gratuita de 15 minutos, recibirás:</strong>
    </p>
    <ul style="color: #555; font-size: 16px; line-height: 2;">
      <li>✓ <strong>Tu número exacto de ahorros</strong> basado en tu factura de Ameren</li>
      <li>✓ <strong>Diseño personalizado del sistema</strong> para tu techo (análisis satelital)</li>
      <li>✓ <strong>Opciones de $0 de enganche</strong> con pagos menores a tu factura actual</li>
      <li>✓ <strong>Cálculo del crédito fiscal del 30%</strong> - recibe miles de vuelta</li>
    </ul>
    <div style="text-align: center; margin: 35px 0;">
      <a href="https://quantumsolar.us/schedule" style="background: linear-gradient(135deg, #28a745 0%, #218838 100%); color: white; padding: 20px 50px; text-decoration: none; border-radius: 8px; font-size: 20px; font-weight: 700; display: inline-block; box-shadow: 0 4px 15px rgba(40,167,69,0.4);">
        OBTENER MI COTIZACIÓN GRATIS →
      </a>
    </div>
    <p style="font-size: 14px; color: #888; text-align: center;">
      O llámanos directamente: <a href="tel:+14074876890" style="color: #0089D0; font-weight: bold;">(407) 487-6890</a>
    </p>
  </div>
  <div style="background: #1a1a2e; padding: 30px; text-align: center;">
    <img src="https://crm.quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 150px; height: auto; margin-bottom: 15px; filter: brightness(0) invert(1);">
    <p style="color: #aaa; font-size: 12px; margin: 10px 0;">
      Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833 | Restaurando la fe en la energía solar residencial
    </p>
    <p style="margin: 15px 0 0 0;">
      <a href="{{unsubscribeUrl}}" style="color: #888; font-size: 12px;">Cancelar suscripción</a>
    </p>
  </div>
</body>
</html>`;
}

function getAmerenWelcomeText_ES(): string {
  return `Hola {{firstName}},

⚡ 78% DE LOS PROPIETARIOS ELIGEN LA COMPAÑÍA QUE RESPONDE PRIMERO

¡Excelentes noticias! Como cliente de Ameren Illinois, calificas para nuestra promoción exclusiva de solar. Ya comenzamos a calcular tus ahorros potenciales.

AHORROS PROMEDIO DE CLIENTES AMEREN:
• $2,847 por año
• $71,175 en 25 años
• 30% crédito fiscal federal

EN TU CONSULTA GRATUITA DE 15 MINUTOS:
✓ Tu número exacto de ahorros basado en tu factura de Ameren
✓ Diseño personalizado del sistema para tu techo
✓ Opciones de $0 de enganche con pagos menores a tu factura actual
✓ Cálculo del crédito fiscal del 30% - recibe miles de vuelta

Obtén tu cotización gratis: https://quantumsolar.us/schedule
O llama: (407) 487-6890

Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833
Restaurando la fe en la energía solar residencial

Cancelar suscripción: {{unsubscribeUrl}}`;
}

function getAmerenROIHTML_ES(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); padding: 40px 20px; text-align: center;">
    <img src="https://crm.quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 200px; height: auto; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0; font-size: 24px;">{{firstName}}, Esto es lo que Cuestan 25 Años de Facturas de Ameren</h1>
  </div>
  <div style="background: white; padding: 40px 30px;">
    <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hola {{firstName}},</p>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      Déjame mostrarte las matemáticas que Ameren no quiere que veas...
    </p>

    <div style="background: #ffebee; border: 2px solid #ef5350; padding: 25px; border-radius: 12px; margin: 25px 0;">
      <h3 style="margin: 0 0 15px 0; color: #c62828; font-size: 18px;">❌ SIN SOLAR (Pagando a Ameren):</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #555;">Factura mensual actual:</td>
          <td style="padding: 8px 0; color: #c62828; font-weight: bold; text-align: right;">~$240/mes</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #555;">Costo anual:</td>
          <td style="padding: 8px 0; color: #c62828; font-weight: bold; text-align: right;">$2,880/año</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #555;">Aumentos de tarifas (3%/año):</td>
          <td style="padding: 8px 0; color: #c62828; font-weight: bold; text-align: right;">Suma $35,000+</td>
        </tr>
        <tr style="border-top: 2px solid #ef5350;">
          <td style="padding: 12px 0; color: #c62828; font-weight: bold; font-size: 18px;">TOTAL 25 AÑOS:</td>
          <td style="padding: 12px 0; color: #c62828; font-weight: bold; font-size: 24px; text-align: right;">$107,000+</td>
        </tr>
      </table>
      <p style="margin: 15px 0 0 0; color: #c62828; font-size: 14px; text-align: center;">
        <strong>Y NO ERES DUEÑO DE NADA al final.</strong>
      </p>
    </div>

    <div style="background: #e8f5e9; border: 2px solid #4caf50; padding: 25px; border-radius: 12px; margin: 25px 0;">
      <h3 style="margin: 0 0 15px 0; color: #2e7d32; font-size: 18px;">✅ CON SOLAR (Sé Dueño de tu Energía):</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #555;">Costo del sistema:</td>
          <td style="padding: 8px 0; color: #2e7d32; font-weight: bold; text-align: right;">$35,000</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #555;">Crédito fiscal 30%:</td>
          <td style="padding: 8px 0; color: #2e7d32; font-weight: bold; text-align: right;">-$10,500</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #555;">Créditos de medición neta:</td>
          <td style="padding: 8px 0; color: #2e7d32; font-weight: bold; text-align: right;">-$8,000</td>
        </tr>
        <tr style="border-top: 2px solid #4caf50;">
          <td style="padding: 12px 0; color: #2e7d32; font-weight: bold; font-size: 18px;">TOTAL 25 AÑOS:</td>
          <td style="padding: 12px 0; color: #2e7d32; font-weight: bold; font-size: 24px; text-align: right;">$16,500</td>
        </tr>
      </table>
      <p style="margin: 15px 0 0 0; color: #2e7d32; font-size: 14px; text-align: center;">
        <strong>¡Además ERES DUEÑO de un activo de $25,000+!</strong>
      </p>
    </div>

    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
      <p style="margin: 0; font-size: 24px; font-weight: bold; color: #856404;">
        TUS AHORROS: $90,500+
      </p>
      <p style="margin: 10px 0 0 0; color: #856404; font-size: 14px;">
        ¡Es como si te pagaran $3,620/año por alimentar tu hogar!
      </p>
    </div>

    <div style="text-align: center; margin: 35px 0;">
      <a href="https://quantumsolar.us/schedule" style="background: linear-gradient(135deg, #28a745 0%, #218838 100%); color: white; padding: 20px 50px; text-decoration: none; border-radius: 8px; font-size: 20px; font-weight: 700; display: inline-block; box-shadow: 0 4px 15px rgba(40,167,69,0.4);">
        OBTENER MIS AHORROS EXACTOS →
      </a>
    </div>
  </div>
  <div style="background: #1a1a2e; padding: 30px; text-align: center;">
    <p style="color: #aaa; font-size: 12px; margin: 0;">
      Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833<br>
      <a href="{{unsubscribeUrl}}" style="color: #888;">Cancelar suscripción</a>
    </p>
  </div>
</body>
</html>`;
}

function getAmerenROIText_ES(): string {
  return `Hola {{firstName}},

Déjame mostrarte las matemáticas que Ameren no quiere que veas...

❌ SIN SOLAR (Pagando a Ameren):
• Factura mensual actual: ~$240/mes
• Costo anual: $2,880/año
• Aumentos de tarifas (3%/año): Suma $35,000+
• TOTAL 25 AÑOS: $107,000+
• Y NO ERES DUEÑO DE NADA al final.

✅ CON SOLAR (Sé Dueño de tu Energía):
• Costo del sistema: $35,000
• Crédito fiscal 30%: -$10,500
• Créditos de medición neta: -$8,000
• TOTAL 25 AÑOS: $16,500
• ¡Además ERES DUEÑO de un activo de $25,000+!

TUS AHORROS: $90,500+
¡Es como si te pagaran $3,620/año por alimentar tu hogar!

Obtén tus ahorros exactos: https://quantumsolar.us/schedule

Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833
Cancelar suscripción: {{unsubscribeUrl}}`;
}

function getAmerenSocialProofHTML_ES(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); padding: 40px 20px; text-align: center;">
    <img src="https://crm.quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 200px; height: auto; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0; font-size: 24px;">312 Clientes de Ameren Cambiaron Este Mes</h1>
    <p style="color: #87CEEB; margin: 10px 0 0 0; font-size: 16px;">Esto es lo que están diciendo...</p>
  </div>
  <div style="background: white; padding: 40px 30px;">
    <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hola {{firstName}},</p>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      No estás solo considerando solar. <strong>312 clientes de Ameren Illinois cambiaron a solar solo este mes.</strong> Esto es lo que algunos de tus vecinos están diciendo:
    </p>

    <div style="background: #f8f9fa; border-left: 4px solid #4caf50; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 16px; color: #555; font-style: italic;">
        "Mi factura de Ameren pasó de $287/mes a $12. Debí haber hecho esto hace años. El equipo de Quantum lo hizo muy fácil."
      </p>
      <p style="margin: 10px 0 0 0; color: #2e7d32; font-weight: bold;">— Miguel R., Springfield, IL (sistema de 8.2 kW)</p>
    </div>

    <div style="background: #f8f9fa; border-left: 4px solid #4caf50; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 16px; color: #555; font-style: italic;">
        "Éramos escépticos después de escuchar historias de terror sobre solar. Quantum fue completamente diferente - precios transparentes, sin presión, y entregaron exactamente lo que prometieron. ¡Ahorrando $3,100/año ahora!"
      </p>
      <p style="margin: 10px 0 0 0; color: #2e7d32; font-weight: bold;">— Jennifer y Tomás S., Champaign, IL (sistema de 9.8 kW)</p>
    </div>

    <div style="background: #f8f9fa; border-left: 4px solid #4caf50; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 16px; color: #555; font-style: italic;">
        "Solo el crédito fiscal fue $9,400 de vuelta a mi bolsillo. Además el valor de mi casa subió. ¿Por qué alguien seguiría pagándole a Ameren cuando esto existe?"
      </p>
      <p style="margin: 10px 0 0 0; color: #2e7d32; font-weight: bold;">— David M., Decatur, IL (sistema de 10.4 kW)</p>
    </div>

    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
      <p style="margin: 0; font-size: 20px; font-weight: bold; color: #2e7d32;">
        4.9 ★★★★★ Calificación
      </p>
      <p style="margin: 10px 0 0 0; color: #555; font-size: 14px;">
        Basado en más de 500 instalaciones en Illinois
      </p>
    </div>

    <div style="text-align: center; margin: 35px 0;">
      <a href="https://quantumsolar.us/schedule" style="background: linear-gradient(135deg, #28a745 0%, #218838 100%); color: white; padding: 20px 50px; text-decoration: none; border-radius: 8px; font-size: 20px; font-weight: 700; display: inline-block; box-shadow: 0 4px 15px rgba(40,167,69,0.4);">
        ÚNETE A TUS VECINOS →
      </a>
    </div>
  </div>
  <div style="background: #1a1a2e; padding: 30px; text-align: center;">
    <p style="color: #aaa; font-size: 12px; margin: 0;">
      Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833<br>
      <a href="{{unsubscribeUrl}}" style="color: #888;">Cancelar suscripción</a>
    </p>
  </div>
</body>
</html>`;
}

function getAmerenSocialProofText_ES(): string {
  return `Hola {{firstName}},

312 CLIENTES DE AMEREN CAMBIARON A SOLAR ESTE MES

No estás solo considerando solar. Esto es lo que tus vecinos están diciendo:

★★★★★ "Mi factura de Ameren pasó de $287/mes a $12. Debí haber hecho esto hace años."
— Miguel R., Springfield, IL (sistema de 8.2 kW)

★★★★★ "Éramos escépticos después de escuchar historias de terror sobre solar. Quantum fue completamente diferente - precios transparentes, sin presión. ¡Ahorrando $3,100/año ahora!"
— Jennifer y Tomás S., Champaign, IL (sistema de 9.8 kW)

★★★★★ "Solo el crédito fiscal fue $9,400 de vuelta a mi bolsillo. Además el valor de mi casa subió."
— David M., Decatur, IL (sistema de 10.4 kW)

4.9 ESTRELLAS - Basado en más de 500 instalaciones en Illinois

Únete a tus vecinos: https://quantumsolar.us/schedule

Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833
Cancelar suscripción: {{unsubscribeUrl}}`;
}

function getAmerenUrgencyHTML_ES(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
  <div style="background: #dc3545; padding: 40px 20px; text-align: center;">
    <img src="https://crm.quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 200px; height: auto; margin-bottom: 20px; filter: brightness(0) invert(1);">
    <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ URGENTE: Fecha Límite del Crédito Fiscal Se Acerca</h1>
    <p style="color: #ffcdd2; margin: 10px 0 0 0; font-size: 16px;">Cupos de instalación limitados para territorio de Ameren</p>
  </div>
  <div style="background: white; padding: 40px 30px;">
    <p style="font-size: 18px; color: #333; margin-bottom: 20px;">{{firstName}},</p>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      Necesito ser directo contigo: <strong>el crédito fiscal federal del 30% no durará para siempre</strong>, y nuestro calendario de instalaciones para el territorio de Ameren Illinois se está llenando rápido.
    </p>

    <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 25px; border-radius: 12px; margin: 25px 0;">
      <h3 style="margin: 0 0 15px 0; color: #856404; font-size: 18px;">⏰ POR QUÉ ACTUAR AHORA:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #856404; line-height: 2;">
        <li><strong>Crédito fiscal del 30%</strong> - Este generoso incentivo DISMINUIRÁ</li>
        <li><strong>Solo quedan 8 cupos de instalación</strong> este mes para tu área</li>
        <li><strong>Aumento de tarifas de Ameren viene</strong> - Asegura tus ahorros antes de que suban los precios</li>
        <li><strong>Las reglas de medición neta</strong> podrían cambiar en cualquier momento</li>
      </ul>
    </div>

    <div style="background: #ffebee; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
      <p style="margin: 0; font-size: 18px; color: #c62828;">
        <strong>Cada mes que esperas te cuesta ~$237</strong>
      </p>
      <p style="margin: 10px 0 0 0; color: #c62828; font-size: 14px;">
        Ese es dinero yendo a Ameren en lugar de quedarse en tu bolsillo
      </p>
    </div>

    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      He visto a muchos propietarios decir "lo haré el próximo año" solo para perder miles en ahorros. No dejes que eso te pase a ti.
    </p>

    <div style="text-align: center; margin: 35px 0;">
      <a href="https://quantumsolar.us/schedule" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 20px 50px; text-decoration: none; border-radius: 8px; font-size: 20px; font-weight: 700; display: inline-block; box-shadow: 0 4px 15px rgba(220,53,69,0.4);">
        🔒 ASEGURAR MIS AHORROS AHORA
      </a>
    </div>

    <p style="font-size: 14px; color: #888; text-align: center;">
      O llama: <a href="tel:+14074876890" style="color: #dc3545; font-weight: bold;">(407) 487-6890</a>
    </p>
  </div>
  <div style="background: #1a1a2e; padding: 30px; text-align: center;">
    <p style="color: #aaa; font-size: 12px; margin: 0;">
      Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833<br>
      <a href="{{unsubscribeUrl}}" style="color: #888;">Cancelar suscripción</a>
    </p>
  </div>
</body>
</html>`;
}

function getAmerenUrgencyText_ES(): string {
  return `{{firstName}},

⚠️ URGENTE: FECHA LÍMITE DEL CRÉDITO FISCAL + CUPOS LIMITADOS

Necesito ser directo contigo: el crédito fiscal federal del 30% no durará para siempre, y nuestro calendario de instalaciones para el territorio de Ameren Illinois se está llenando rápido.

POR QUÉ ACTUAR AHORA:
• Crédito fiscal del 30% - Este generoso incentivo DISMINUIRÁ
• Solo quedan 8 cupos de instalación este mes para tu área
• Aumento de tarifas de Ameren viene - Asegura tus ahorros antes de que suban los precios
• Las reglas de medición neta podrían cambiar en cualquier momento

⚠️ Cada mes que esperas te cuesta ~$237
Ese es dinero yendo a Ameren en lugar de quedarse en tu bolsillo

He visto a muchos propietarios decir "lo haré el próximo año" solo para perder miles en ahorros. No dejes que eso te pase a ti.

Asegura tus ahorros: https://quantumsolar.us/schedule
O llama: (407) 487-6890

Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833
Cancelar suscripción: {{unsubscribeUrl}}`;
}

function getAmerenFinalHTML_ES(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #0089D0 0%, #005A8C 100%); padding: 40px 20px; text-align: center;">
    <img src="https://crm.quantumsolar.us/quantum-solar-logo.png" alt="Quantum Solar" style="width: 200px; height: auto; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0; font-size: 24px;">{{firstName}}, Este es Mi Último Correo</h1>
    <p style="color: #87CEEB; margin: 10px 0 0 0; font-size: 16px;">A menos que quieras ahorrar $90,000+</p>
  </div>
  <div style="background: white; padding: 40px 30px;">
    <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hola {{firstName}},</p>
    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      Te he enviado algunos correos durante la última semana sobre cómo los clientes de Ameren Illinois están ahorrando miles con solar. Este será el último.
    </p>

    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      <strong>Aquí está un resumen rápido de lo que estarías obteniendo:</strong>
    </p>

    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border: 2px solid #4caf50;">
      <ul style="margin: 0; padding-left: 20px; color: #2e7d32; line-height: 2; font-size: 16px;">
        <li><strong>$2,847/año</strong> en ahorros de energía (cliente promedio de Ameren)</li>
        <li><strong>$10,500+</strong> de vuelta del crédito fiscal federal del 30%</li>
        <li><strong>$71,175+</strong> ahorros totales en 25 años</li>
        <li><strong>$0 de enganche</strong> con pagos menores a tu factura de Ameren</li>
        <li><strong>Garantía de 25 años</strong> en equipos y rendimiento</li>
        <li><strong>Mantenimiento gratuito</strong> de por vida del sistema</li>
      </ul>
    </div>

    <p style="font-size: 16px; color: #555; line-height: 1.7;">
      Si todavía estás indeciso, lo entiendo. Solar es una gran decisión. Pero aquí está el punto: <strong>cada mes que esperas son otros $237+ yendo a Ameren</strong> en lugar de quedarse en tu bolsillo.
    </p>

    <div style="text-align: center; margin: 35px 0;">
      <a href="https://quantumsolar.us/schedule" style="background: linear-gradient(135deg, #28a745 0%, #218838 100%); color: white; padding: 20px 50px; text-decoration: none; border-radius: 8px; font-size: 20px; font-weight: 700; display: inline-block; box-shadow: 0 4px 15px rgba(40,167,69,0.4);">
        SÍ, QUIERO AHORRAR →
      </a>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
      <p style="margin: 0; font-size: 14px; color: #666;">
        <strong>¿No te interesa?</strong> No hay problema - solo responde "NO INTERESADO" y te removeré de futuros correos.
      </p>
    </div>

    <p style="font-size: 14px; color: #888; text-align: center;">
      ¿Preguntas? Llámame directamente: <a href="tel:+14074876890" style="color: #0089D0; font-weight: bold;">(407) 487-6890</a>
    </p>
  </div>
  <div style="background: #1a1a2e; padding: 30px; text-align: center;">
    <p style="color: #aaa; font-size: 12px; margin: 0;">
      Quantum Solar Enterprises LLC | Restaurando la fe en la energía solar residencial<br>
      <a href="{{unsubscribeUrl}}" style="color: #888;">Cancelar suscripción</a>
    </p>
  </div>
</body>
</html>`;
}

function getAmerenFinalText_ES(): string {
  return `Hola {{firstName}},

Este es mi último correo sobre ahorros solares para clientes de Ameren Illinois.

ESTO ES LO QUE ESTARÍAS OBTENIENDO:
✓ $2,847/año en ahorros de energía (cliente promedio de Ameren)
✓ $10,500+ de vuelta del crédito fiscal federal del 30%
✓ $71,175+ ahorros totales en 25 años
✓ $0 de enganche con pagos menores a tu factura de Ameren
✓ Garantía de 25 años en equipos y rendimiento
✓ Mantenimiento gratuito de por vida del sistema

Cada mes que esperas son otros $237+ yendo a Ameren en lugar de quedarse en tu bolsillo.

SÍ, QUIERO AHORRAR: https://quantumsolar.us/schedule

¿No te interesa? No hay problema - solo responde "NO INTERESADO" y te removeré de futuros correos.

¿Preguntas? Llámame: (407) 487-6890

Quantum Solar Enterprises LLC | 511 W 5th St, Tilton, IL 61833
Cancelar suscripción: {{unsubscribeUrl}}`;
}
