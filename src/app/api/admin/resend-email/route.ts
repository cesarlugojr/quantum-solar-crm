/**
 * Admin endpoint to resend a campaign email to a lead
 * POST /api/admin/resend-email
 * Body: {
 *   campaignId: string,
 *   leadId?: string,          // Either leadId or leadEmail required
 *   leadEmail?: string,       // Direct email address
 *   sequenceId?: string,      // Specific sequence to send (optional, defaults to last)
 *   sequenceOrder?: number    // Or specify by order number
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

interface LeadData {
  first_name?: string;
  last_name?: string;
  email?: string;
  city?: string;
  average_monthly_bill?: number;
  estimated_savings?: number;
  utility_company?: string;
  [key: string]: string | number | boolean | undefined;
}

function substituteVariables(template: string, leadData: LeadData): string {
  let result = template;

  const mappings: Record<string, string> = {
    'firstName': leadData.first_name || '',
    'lastName': leadData.last_name || '',
    'city': leadData.city || '',
    'electricBill': String(leadData.average_monthly_bill || ''),
    'estimatedSavings': String(leadData.estimated_savings || ''),
    'utilityCompany': leadData.utility_company || '',
  };

  Object.entries(mappings).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { campaignId, leadId, leadEmail, sequenceId, sequenceOrder } = await request.json();

    if (!campaignId) {
      return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });
    }

    if (!leadId && !leadEmail) {
      return NextResponse.json({ error: 'Either leadId or leadEmail is required' }, { status: 400 });
    }

    // Get the sequence - either specific one or last one
    let sequenceQuery = supabase
      .from('email_sequences')
      .select('*, email_templates(*)')
      .eq('campaign_id', campaignId)
      .eq('active', true);

    if (sequenceId) {
      sequenceQuery = sequenceQuery.eq('id', sequenceId);
    } else if (sequenceOrder !== undefined) {
      sequenceQuery = sequenceQuery.eq('sequence_order', sequenceOrder);
    } else {
      // Default to last sequence
      sequenceQuery = sequenceQuery.order('sequence_order', { ascending: false }).limit(1);
    }

    const { data: sequences, error: seqError } = await sequenceQuery;

    if (seqError || !sequences?.length) {
      return NextResponse.json({ error: 'Campaign sequence not found', details: seqError }, { status: 404 });
    }

    const sequence = sequences[0];
    const template = sequence.email_templates;

    // Get lead data - either by ID or create minimal data from email
    let leadData: LeadData | null = null;
    let recipientEmail = leadEmail;

    if (leadId) {
      // Try splash_leads first
      const { data: splashLead } = await supabase
        .from('splash_leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (splashLead) {
        leadData = splashLead;
        recipientEmail = splashLead.email;
      } else {
        // Try contact_submissions
        const { data: contactLead } = await supabase
          .from('contact_submissions')
          .select('*')
          .eq('id', leadId)
          .single();

        if (contactLead) {
          leadData = contactLead;
          recipientEmail = contactLead.email;
        }
      }

      if (!leadData) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }
    } else {
      // Using direct email - create minimal lead data
      leadData = { email: leadEmail };
    }

    if (!recipientEmail) {
      return NextResponse.json({ error: 'No email address available' }, { status: 400 });
    }

    // Get subject/html/text from sequence or template
    const subjectTemplate = sequence.subject_template || template?.subject_template || '';
    const htmlTemplate = sequence.html_template || template?.html_template || '';
    const textTemplate = sequence.text_template || template?.text_template || '';

    // Debug: log what we found
    console.log('Resending email:', {
      sequenceId: sequence.id,
      sequenceOrder: sequence.sequence_order,
      subject: subjectTemplate?.substring(0, 50),
      to: recipientEmail,
      leadName: leadData.first_name ? `${leadData.first_name} ${leadData.last_name}` : 'N/A',
    });

    // Substitute variables
    const subject = substituteVariables(subjectTemplate, leadData);
    const html = substituteVariables(htmlTemplate, leadData);
    const text = substituteVariables(textTemplate, leadData);

    if (!html) {
      return NextResponse.json({
        error: 'No HTML template found',
        sequenceId: sequence.id,
        templateId: sequence.template_id
      }, { status: 400 });
    }

    // Send the email
    const result = await resend.emails.send({
      from: 'Quantum Solar <info@quantumsolar.us>',
      to: [recipientEmail],
      subject,
      html,
      text: text || undefined,
      headers: {
        'X-Entity-Ref-ID': `manual-resend-${Date.now()}`,
      },
    });

    return NextResponse.json({
      success: true,
      to: recipientEmail,
      subject,
      sequenceId: sequence.id,
      sequenceOrder: sequence.sequence_order,
      resendId: result.data?.id,
    });

  } catch (error) {
    console.error('Error resending email:', error);
    return NextResponse.json({
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
