/**
 * Email Queue Processor - Vercel Cron Job
 *
 * Runs every 15 minutes to process pending drip campaign emails.
 * Fetches emails from queue, substitutes variables, sends via Resend, tracks results.
 *
 * CRITICAL: This endpoint enables automated email drip campaigns.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
);

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder-resend-key');

interface EmailQueueItem {
  enrollment_id: string;
  sequence_id: string;
  lead_type: string;
  lead_id: string;
  email_address: string;
  subject: string;
  html_template: string;
  text_template: string;
  template_variables: string[];
}

interface LeadData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  utility_company?: string;
  average_monthly_bill?: number;
  estimated_savings?: number;
  homeowner_status?: string;
  credit_score?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Fetch lead data from the appropriate table
 */
async function fetchLeadData(leadType: string, leadId: string): Promise<LeadData | null> {
  let tableName = '';

  switch (leadType) {
    case 'splash_leads':
      tableName = 'splash_leads';
      break;
    case 'contact_submissions':
      tableName = 'contact_submissions';
      break;
    case 'leads':
      tableName = 'contact_submissions'; // Alias
      break;
    default:
      console.error(`Unknown lead type: ${leadType}`);
      return null;
  }

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', leadId)
    .single();

  if (error) {
    console.error(`Error fetching lead data from ${tableName}:`, error);
    return null;
  }

  return data as LeadData;
}

/**
 * Substitute template variables with actual lead data
 */
function substituteVariables(template: string, leadData: LeadData, variables: string[]): string {
  let result = template;

  // Common mappings from camelCase template variables to snake_case database fields
  const commonMappings: Record<string, string> = {
    'firstName': leadData.first_name || '',
    'lastName': leadData.last_name || '',
    'electricBill': String(leadData.average_monthly_bill || ''),
    'estimatedSavings': String(leadData.estimated_savings || ''),
    'utilityCompany': leadData.utility_company || '',
    'zipCode': leadData.zip_code || '',
  };

  // Substitute each variable - check commonMappings first, then fall back to direct property access
  variables.forEach(variable => {
    let displayValue: string;

    if (variable in commonMappings) {
      // Use the mapped value for camelCase variables
      displayValue = commonMappings[variable];
    } else {
      // Fall back to direct property access for snake_case or other variables
      const value = leadData[variable];
      displayValue = value !== undefined && value !== null ? String(value) : '';
    }

    // Replace all occurrences of {{variable}}
    const regex = new RegExp(`{{${variable}}}`, 'g');
    result = result.replace(regex, displayValue);
  });

  // Also apply commonMappings for any remaining unmapped variables not in the variables array
  Object.entries(commonMappings).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });

  return result;
}

/**
 * Send email via Resend API
 */
async function sendEmail(to: string, subject: string, html: string, text: string, eventId: string) {
  try {
    const result = await resend.emails.send({
      from: 'Quantum Solar <info@quantumsolar.us>',
      to: [to],
      subject,
      html,
      text,
      headers: {
        'X-Entity-Ref-ID': eventId, // For tracking
      },
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Resend API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Record email send in database
 */
async function recordEmailSend(
  enrollmentId: string,
  sequenceId: string,
  to: string,
  subject: string,
  status: 'sent' | 'failed',
  resendId?: string,
  errorMessage?: string
) {
  const { error } = await supabase
    .from('email_sends')
    .insert({
      enrollment_id: enrollmentId,
      sequence_id: sequenceId,
      sent_to: to,
      subject,
      status,
      resend_id: resendId,
      error_message: errorMessage,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
    });

  if (error) {
    console.error('Error recording email send:', error);
  }
}

/**
 * Update enrollment after successful send
 */
async function updateEnrollment(enrollmentId: string, sequenceId: string) {
  // Get the sequence delay to calculate next send date
  const { data: sequence } = await supabase
    .from('email_sequences')
    .select('delay_days, sequence_order')
    .eq('id', sequenceId)
    .single();

  if (!sequence) {
    console.error('Could not find sequence for enrollment update');
    return;
  }

  // Calculate next send date
  const nextSendDate = new Date();
  nextSendDate.setDate(nextSendDate.getDate() + (sequence.delay_days || 0));

  // Get the next sequence in the campaign to check if we're done
  const { data: enrollment } = await supabase
    .from('campaign_enrollments')
    .select('campaign_id, current_step')
    .eq('id', enrollmentId)
    .single();

  if (!enrollment) return;

  // Check if there's a next sequence
  const { data: nextSequence } = await supabase
    .from('email_sequences')
    .select('id')
    .eq('campaign_id', enrollment.campaign_id)
    .eq('sequence_order', sequence.sequence_order + 1)
    .eq('active', true)
    .single();

  // Update enrollment
  const updateData: Record<string, unknown> = {
    current_step: sequence.sequence_order,
    last_sent_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (nextSequence) {
    // More emails to send
    updateData.next_send_at = nextSendDate.toISOString();
  } else {
    // Campaign complete
    updateData.status = 'completed';
    updateData.next_send_at = null;
    updateData.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('campaign_enrollments')
    .update(updateData)
    .eq('id', enrollmentId);

  if (error) {
    console.error('Error updating enrollment:', error);
  }
}

/**
 * Main cron handler
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify cron secret for security (Vercel provides this)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('Unauthorized cron request attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Email queue processor started');

    // Fetch emails ready to send (batch of 50)
    const { data: emailQueue, error: queueError } = await supabase
      .rpc('process_email_queue', { p_batch_size: 50 });

    if (queueError) {
      console.error('Error fetching email queue:', queueError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch email queue',
        details: queueError.message
      }, { status: 500 });
    }

    const emails = (emailQueue || []) as EmailQueueItem[];
    console.log(`📧 Found ${emails.length} emails to process`);

    if (emails.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No emails to send',
        duration: Date.now() - startTime
      });
    }

    // Process each email
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const email of emails) {
      try {
        // Fetch lead data
        const leadData = await fetchLeadData(email.lead_type, email.lead_id);

        if (!leadData) {
          results.failed++;
          results.errors.push(`Lead not found: ${email.lead_type}/${email.lead_id}`);
          await recordEmailSend(
            email.enrollment_id,
            email.sequence_id,
            email.email_address,
            email.subject,
            'failed',
            undefined,
            'Lead data not found'
          );
          continue;
        }

        // Substitute variables in subject and body
        const subject = substituteVariables(
          email.subject,
          leadData,
          email.template_variables || []
        );

        const html = substituteVariables(
          email.html_template,
          leadData,
          email.template_variables || []
        );

        const text = substituteVariables(
          email.text_template,
          leadData,
          email.template_variables || []
        );

        // Send email
        const sendResult = await sendEmail(
          email.email_address,
          subject,
          html,
          text,
          email.enrollment_id
        );

        if (sendResult.success && sendResult.data) {
          // Success
          results.sent++;
          const resendId = typeof sendResult.data === 'object' && 'id' in sendResult.data
            ? String(sendResult.data.id)
            : undefined;
          await recordEmailSend(
            email.enrollment_id,
            email.sequence_id,
            email.email_address,
            subject,
            'sent',
            resendId
          );
          await updateEnrollment(email.enrollment_id, email.sequence_id);
          console.log(`✅ Sent email to ${email.email_address}`);
        } else {
          // Failed
          results.failed++;
          results.errors.push(`Failed to send to ${email.email_address}: ${sendResult.error}`);
          await recordEmailSend(
            email.enrollment_id,
            email.sequence_id,
            email.email_address,
            subject,
            'failed',
            undefined,
            sendResult.error
          );
          console.error(`❌ Failed to send to ${email.email_address}`);
        }

      } catch (emailError) {
        results.failed++;
        const errorMsg = emailError instanceof Error ? emailError.message : 'Unknown error';
        results.errors.push(`Error processing ${email.email_address}: ${errorMsg}`);
        console.error('Error processing email:', emailError);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✨ Queue processed: ${results.sent} sent, ${results.failed} failed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      processed: emails.length,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined,
      duration
    });

  } catch (error) {
    console.error('Critical error in email queue processor:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    }, { status: 500 });
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
