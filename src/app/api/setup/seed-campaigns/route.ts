import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * SETUP ENDPOINT: Seed Initial Email Drip Campaigns
 *
 * This endpoint populates the database with the 3 foundational email campaigns:
 * 1. Ameren Illinois Paid Lead Fast Track (5 emails over 10 days)
 * 2. Abandoned Calculator Recovery (3 emails over 7 days)
 * 3. Organic Contact Nurture (6 emails over 4 weeks)
 *
 * Only run this ONCE after the email_drip_system migration is applied.
 */

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const results = {
      campaigns: [] as any[],
      templates: [] as any[],
      sequences: [] as any[],
      errors: [] as any[]
    };

    // ========================================================================
    // CAMPAIGN 1: AMEREN ILLINOIS PAID LEAD FAST TRACK
    // ========================================================================

    console.log('Creating Campaign 1: Ameren Illinois Paid Lead Fast Track...');

    const { data: campaign1, error: campaign1Error } = await supabase
      .from('email_campaigns')
      .insert({
        name: 'Ameren Illinois Paid Lead Fast Track',
        description: '5-email aggressive sequence for Illinois Ameren promotion leads. Fast-paced with pricing by email 2-3.',
        trigger_type: 'form_submission',
        trigger_conditions: {
          source: 'splash_leads',
          form_variant: 'ameren_illinois_solar_ppa',
          paid: true
        },
        active: true
      })
      .select()
      .single();

    if (campaign1Error) {
      if (campaign1Error.code === '23505') {
        // Duplicate - fetch existing
        const { data: existing } = await supabase
          .from('email_campaigns')
          .select('*')
          .eq('name', 'Ameren Illinois Paid Lead Fast Track')
          .single();
        results.campaigns.push({ campaign: 1, status: 'already_exists', data: existing });
      } else {
        results.errors.push({ campaign: 1, error: campaign1Error.message });
      }
    } else {
      results.campaigns.push({ campaign: 1, status: 'created', data: campaign1 });
    }

    // Get campaign 1 ID (either newly created or existing)
    const { data: camp1 } = await supabase
      .from('email_campaigns')
      .select('id')
      .eq('name', 'Ameren Illinois Paid Lead Fast Track')
      .single();

    if (!camp1) {
      throw new Error('Failed to retrieve Campaign 1 ID');
    }

    // Create Campaign 1 Templates (English only for now)
    const campaign1Templates = [
      {
        name: 'Ameren IL - Welcome Email',
        category: 'welcome',
        subject_template: 'Your IL Solar Savings: ${{estimatedSavings}}/yr',
        html_template: getWelcomeEmailHTML(),
        text_template: getWelcomeEmailText(),
        variables: ['firstName', 'city', 'estimatedSavings', 'electricBill', 'unsubscribeUrl'],
        language: 'en',
        active: true
      },
      {
        name: 'Ameren IL - ROI Email (Day 2)',
        category: 'educational',
        subject_template: '{{firstName}}, Your Solar ROI in 7-9 Yrs',
        html_template: getROIEmailHTML(),
        text_template: getROIEmailText(),
        variables: ['firstName', 'city', 'electricBill', 'annualCost', 'lifetimeCost', 'unsubscribeUrl'],
        language: 'en',
        active: true
      },
      {
        name: 'Ameren IL - Social Proof (Day 5)',
        category: 'social_proof',
        subject_template: '500+ IL Homeowners Went Solar in 2024',
        html_template: getSocialProofEmailHTML(),
        text_template: getSocialProofEmailText(),
        variables: ['firstName', 'city', 'unsubscribeUrl'],
        language: 'en',
        active: true
      },
      {
        name: 'Ameren IL - Urgency (Day 7)',
        category: 'urgency',
        subject_template: 'Tax Credit Ends Dec 31 - ${{taxCredit}} at Risk',
        html_template: getUrgencyEmailHTML(),
        text_template: getUrgencyEmailText(),
        variables: ['firstName', 'taxCredit', 'unsubscribeUrl'],
        language: 'en',
        active: true
      },
      {
        name: 'Ameren IL - Final Call (Day 10)',
        category: 'cta',
        subject_template: 'Last Chance: Your Solar Quote Expires',
        html_template: getFinalCallEmailHTML(),
        text_template: getFinalCallEmailText(),
        variables: ['firstName', 'city', 'estimatedSavings', 'unsubscribeUrl'],
        language: 'en',
        active: true
      }
    ];

    const templateIds: string[] = [];

    for (const template of campaign1Templates) {
      const { data, error } = await supabase
        .from('email_templates')
        .insert(template)
        .select('id')
        .single();

      if (error) {
        if (error.code === '23505') {
          // Already exists - fetch ID
          const { data: existing } = await supabase
            .from('email_templates')
            .select('id')
            .eq('name', template.name)
            .eq('language', 'en')
            .single();
          templateIds.push(existing?.id || '');
          results.templates.push({ template: template.name, status: 'already_exists' });
        } else {
          results.errors.push({ template: template.name, error: error.message });
        }
      } else {
        templateIds.push(data.id);
        results.templates.push({ template: template.name, status: 'created', id: data.id });
      }
    }

    // Create Campaign 1 Sequences
    const sequences = [
      { order: 1, templateIndex: 0, days: 0, hours: 0, sendHour: 9 },  // Immediate
      { order: 2, templateIndex: 1, days: 2, hours: 0, sendHour: 9 },  // Day 2
      { order: 3, templateIndex: 2, days: 3, hours: 0, sendHour: 9 },  // Day 5 (3 days after day 2)
      { order: 4, templateIndex: 3, days: 2, hours: 0, sendHour: 9 },  // Day 7 (2 days after day 5)
      { order: 5, templateIndex: 4, days: 3, hours: 0, sendHour: 9 },  // Day 10 (3 days after day 7)
    ];

    for (const seq of sequences) {
      const { data, error } = await supabase
        .from('email_sequences')
        .insert({
          campaign_id: camp1.id,
          sequence_order: seq.order,
          template_id: templateIds[seq.templateIndex],
          delay_days: seq.days,
          delay_hours: seq.hours,
          send_time_hour: seq.sendHour,
          active: true
        })
        .select();

      if (error) {
        results.errors.push({ sequence: seq.order, error: error.message });
      } else {
        results.sequences.push({ campaign: 1, sequence: seq.order, status: 'created' });
      }
    }

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

  } catch (error: any) {
    console.error('Campaign seeding error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// ============================================================================
// EMAIL TEMPLATE HTML GENERATORS
// ============================================================================

function getWelcomeEmailHTML(): string {
  return `<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #0089D0;">Hi {{firstName}}!</h1>
    <p style="font-size: 16px; line-height: 1.6;">
      Thanks for checking out solar for your {{city}} home! We received your info and here's what's next:
    </p>
    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="margin-top: 0;">Your Estimated Savings</h2>
      <p style="font-size: 24px; color: #0089D0; font-weight: bold; margin: 10px 0;">
        \${{estimatedSavings}}/year
      </p>
      <p style="font-size: 14px; color: #666;">Based on your \${{electricBill}}/month electric bill</p>
    </div>
    <p style="font-size: 16px;">
      <strong>78% of homeowners choose the company that responds first.</strong>
      We're ready to design your custom solar system - no obligation.
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
  </body></html>`;
}

function getWelcomeEmailText(): string {
  return `Hi {{firstName}}!\n\nThanks for checking out solar for your {{city}} home!\n\nYour Estimated Savings: \${{estimatedSavings}}/year\nBased on your \${{electricBill}}/month electric bill\n\n78% of homeowners choose the company that responds first. We're ready to design your custom solar system.\n\nSchedule your free consultation: https://crm.quantumsolar.us/schedule\nOr call: (555) 123-4567\n\nQuantum Solar Enterprises LLC\n123 Solar St, Chicago, IL 60601\nUnsubscribe: {{unsubscribeUrl}}`;
}

function getROIEmailHTML(): string {
  return `<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #0089D0;">The Math is Simple, {{firstName}}</h1>
    <p style="font-size: 16px;">
      Your {{city}} home pays about <strong>\${{electricBill}}/month</strong> to the utility company.
      That's <strong>\${{annualCost}}/year</strong> just to keep the lights on.
    </p>
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 16px;">
        <strong>Over 25 years, you'll pay the utility: \${{lifetimeCost}}</strong>
      </p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://crm.quantumsolar.us/schedule"
         style="background: #0089D0; color: white; padding: 16px 32px; text-decoration: none;
                border-radius: 4px; font-size: 18px; display: inline-block;">
        See My Custom Proposal
      </a>
    </div>
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
    <p style="font-size: 12px; color: #999;">
      Quantum Solar | <a href="{{unsubscribeUrl}}" style="color: #999;">Unsubscribe</a>
    </p>
  </body></html>`;
}

function getROIEmailText(): string {
  return `The Math is Simple, {{firstName}}\n\nYour {{city}} home pays \${{electricBill}}/month.\nOver 25 years: \${{lifetimeCost}}\n\nSee your proposal: https://crm.quantumsolar.us/schedule\n\nUnsubscribe: {{unsubscribeUrl}}`;
}

function getSocialProofEmailHTML(): string {
  return `<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #0089D0;">Join 500+ Illinois Neighbors</h1>
    <p style="font-size: 16px;">
      {{firstName}}, homeowners across {{city}} are making the switch to solar.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://crm.quantumsolar.us/schedule"
         style="background: #0089D0; color: white; padding: 16px 32px; text-decoration: none;
                border-radius: 4px; font-size: 18px; display: inline-block;">
        Get My Free Quote
      </a>
    </div>
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
    <p style="font-size: 12px; color: #999;">
      Quantum Solar | <a href="{{unsubscribeUrl}}" style="color: #999;">Unsubscribe</a>
    </p>
  </body></html>`;
}

function getSocialProofEmailText(): string {
  return `Join 500+ Illinois Neighbors\n\n{{firstName}}, homeowners across {{city}} are switching to solar.\n\nGet your quote: https://crm.quantumsolar.us/schedule\n\nUnsubscribe: {{unsubscribeUrl}}`;
}

function getUrgencyEmailHTML(): string {
  return `<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #dc3545; color: white; padding: 15px; border-radius: 8px;">
      <h2 style="margin: 0;">⏰ Time-Sensitive: {{firstName}}</h2>
    </div>
    <p style="font-size: 16px; margin-top: 20px;">
      26% federal tax credit decreasing soon. For your home: <strong>\${{taxCredit}} on the line</strong>
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://crm.quantumsolar.us/schedule?urgent=true"
         style="background: #dc3545; color: white; padding: 16px 32px; text-decoration: none;
                border-radius: 4px; font-size: 18px; display: inline-block;">
        Lock In 26% Credit Now
      </a>
    </div>
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
    <p style="font-size: 12px; color: #999;">
      Quantum Solar | <a href="{{unsubscribeUrl}}" style="color: #999;">Unsubscribe</a>
    </p>
  </body></html>`;
}

function getUrgencyEmailText(): string {
  return `⏰ TIME-SENSITIVE: {{firstName}}\n\n26% tax credit decreasing.\n\${{taxCredit}} on the line\n\nLock in now: https://crm.quantumsolar.us/schedule?urgent=true\n\nUnsubscribe: {{unsubscribeUrl}}`;
}

function getFinalCallEmailHTML(): string {
  return `<html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #0089D0;">{{firstName}}, One Last Thing...</h1>
    <p style="font-size: 16px;">
      Don't miss out on \${{estimatedSavings}}/year in potential savings for your {{city}} home.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://crm.quantumsolar.us/schedule"
         style="background: #0089D0; color: white; padding: 16px 32px; text-decoration: none;
                border-radius: 4px; font-size: 18px; display: inline-block;">
        Yes, Show Me My Savings
      </a>
    </div>
    <p style="font-size: 14px; color: #666; text-align: center;">
      Or reply "NOT INTERESTED" to opt out
    </p>
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
    <p style="font-size: 12px; color: #999;">
      Quantum Solar | <a href="{{unsubscribeUrl}}" style="color: #999;">Unsubscribe</a>
    </p>
  </body></html>`;
}

function getFinalCallEmailText(): string {
  return `{{firstName}}, One Last Thing...\n\nDon't miss \${{estimatedSavings}}/year savings for your {{city}} home.\n\nSee if it makes sense: https://crm.quantumsolar.us/schedule\n\nOr reply "NOT INTERESTED" to opt out.\n\nUnsubscribe: {{unsubscribeUrl}}`;
}
