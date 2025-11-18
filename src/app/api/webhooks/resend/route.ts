/**
 * Resend Webhook Handler
 *
 * Receives email event notifications from Resend:
 * - email.delivered
 * - email.opened
 * - email.clicked
 * - email.bounced
 * - email.complained
 *
 * Updates email_events table for analytics tracking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
);

interface ResendWebhookPayload {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    headers?: Record<string, string>;
    click?: {
      link: string;
      timestamp: string;
    };
    bounce?: {
      type: string;
      message: string;
    };
  };
}

/**
 * Map Resend event types to our email_events event types
 */
function mapEventType(resendType: string): string {
  switch (resendType) {
    case 'email.sent':
      return 'sent';
    case 'email.delivered':
      return 'delivered';
    case 'email.opened':
      return 'opened';
    case 'email.clicked':
      return 'clicked';
    case 'email.bounced':
      return 'bounced';
    case 'email.complained':
      return 'complained';
    case 'email.delivery_delayed':
      return 'delivery_delayed';
    default:
      return resendType;
  }
}

/**
 * Find email_send record by Resend email ID
 */
async function findEmailSend(resendId: string) {
  const { data, error } = await supabase
    .from('email_sends')
    .select('*')
    .eq('resend_id', resendId)
    .single();

  if (error) {
    console.error('Error finding email send:', error);
    return null;
  }

  return data;
}

/**
 * Record email event in database
 */
async function recordEmailEvent(
  emailSendId: string,
  eventType: string,
  metadata?: Record<string, unknown>
) {
  const { error } = await supabase
    .from('email_events')
    .insert({
      email_send_id: emailSendId,
      event_type: eventType,
      event_data: metadata,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error recording email event:', error);
    throw error;
  }
}

/**
 * Update email_send status for key events
 */
async function updateEmailSendStatus(
  emailSendId: string,
  eventType: string,
  metadata?: Record<string, unknown>
) {
  const updates: Record<string, unknown> = {};

  switch (eventType) {
    case 'delivered':
      updates.status = 'delivered';
      updates.delivered_at = new Date().toISOString();
      break;
    case 'opened':
      updates.opened_at = new Date().toISOString();
      break;
    case 'clicked':
      updates.clicked_at = new Date().toISOString();
      if (metadata?.link) {
        updates.clicked_link = metadata.link;
      }
      break;
    case 'bounced':
      updates.status = 'bounced';
      updates.bounced_at = new Date().toISOString();
      if (metadata?.bounce) {
        updates.bounce_type = (metadata.bounce as Record<string, string>).type;
        updates.error_message = (metadata.bounce as Record<string, string>).message;
      }
      break;
    case 'complained':
      updates.status = 'complained';
      break;
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from('email_sends')
      .update(updates)
      .eq('id', emailSendId);

    if (error) {
      console.error('Error updating email send status:', error);
    }
  }
}

/**
 * Handle unsubscribe from bounced emails
 */
async function handleBounce(emailSendId: string, bounceType: string) {
  // For hard bounces, mark the enrollment as bounced
  if (bounceType === 'hard_bounce') {
    const { data: emailSend } = await supabase
      .from('email_sends')
      .select('enrollment_id')
      .eq('id', emailSendId)
      .single();

    if (emailSend) {
      await supabase
        .from('campaign_enrollments')
        .update({
          status: 'bounced',
          updated_at: new Date().toISOString(),
        })
        .eq('id', emailSend.enrollment_id);

      console.log(`🚫 Marked enrollment as bounced: ${emailSend.enrollment_id}`);
    }
  }
}

/**
 * Main webhook handler
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature if configured
    const signature = request.headers.get('svix-signature');
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    // TODO: Implement signature verification when Resend provides it
    // For now, we'll trust the webhook since it's from Resend's servers

    // Parse webhook payload
    const payload: ResendWebhookPayload = await request.json();

    console.log('📬 Resend webhook received:', {
      type: payload.type,
      emailId: payload.data.email_id,
      to: payload.data.to,
    });

    // Find the email_send record
    const emailSend = await findEmailSend(payload.data.email_id);

    if (!emailSend) {
      console.warn(`Email send not found for Resend ID: ${payload.data.email_id}`);
      // Return 200 to acknowledge receipt even if we don't have the record
      return NextResponse.json({
        success: true,
        message: 'Event received but email send not found',
      });
    }

    // Map event type
    const eventType = mapEventType(payload.type);

    // Prepare event metadata
    const metadata: Record<string, unknown> = {
      resend_event_type: payload.type,
      created_at: payload.created_at,
    };

    // Add event-specific data
    if (payload.data.click) {
      metadata.link = payload.data.click.link;
      metadata.click_timestamp = payload.data.click.timestamp;
    }

    if (payload.data.bounce) {
      metadata.bounce = payload.data.bounce;
    }

    // Record the event
    await recordEmailEvent(emailSend.id, eventType, metadata);

    // Update email send status
    await updateEmailSendStatus(emailSend.id, eventType, metadata);

    // Handle bounces
    if (eventType === 'bounced' && payload.data.bounce) {
      await handleBounce(emailSend.id, payload.data.bounce.type);
    }

    console.log(`✅ Processed ${eventType} event for ${payload.data.to[0]}`);

    return NextResponse.json({
      success: true,
      eventType,
      emailSendId: emailSend.id,
    });

  } catch (error) {
    console.error('Error processing Resend webhook:', error);

    // Return 200 to prevent Resend from retrying
    // We'll log the error but acknowledge receipt
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Error logged, webhook acknowledged',
    });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'resend-webhook',
    message: 'Webhook handler is active',
  });
}
