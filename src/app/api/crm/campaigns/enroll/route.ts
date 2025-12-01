/**
 * Campaign Enrollment API
 *
 * Provides manual and automatic enrollment of leads into email campaigns.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST - Manually enroll a lead in a campaign
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { lead_id, campaign_id, lead_type: rawLeadType = 'splash_leads' } = body;

    if (!lead_id || !campaign_id) {
      return NextResponse.json(
        { error: 'Missing required fields: lead_id and campaign_id' },
        { status: 400 }
      );
    }

    // Normalize lead_type to plural form (table name)
    const lead_type = (rawLeadType === 'splash_lead' || rawLeadType === 'splash_leads')
      ? 'splash_leads'
      : 'contact_submissions';

    // Table name matches the normalized lead_type
    const tableName = lead_type;

    // Fetch the lead to get email
    const { data: lead, error: leadError } = await supabase
      .from(tableName)
      .select('id, email, first_name, last_name')
      .eq('id', lead_id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    if (!lead.email) {
      return NextResponse.json(
        { error: 'Lead does not have an email address' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const { data: existing } = await supabase
      .from('campaign_enrollments')
      .select('id, status')
      .eq('campaign_id', campaign_id)
      .eq('lead_id', lead_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Lead is already enrolled in this campaign', enrollment: existing },
        { status: 409 }
      );
    }

    // Get campaign details to calculate first send time
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('id, name, active')
      .eq('id', campaign_id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (!campaign.active) {
      return NextResponse.json(
        { error: 'Campaign is not active' },
        { status: 400 }
      );
    }

    // Get first sequence to calculate initial send time
    const { data: firstSequence } = await supabase
      .from('email_sequences')
      .select('delay_days, delay_hours, send_time_hour')
      .eq('campaign_id', campaign_id)
      .eq('sequence_order', 1)
      .eq('active', true)
      .single();

    // Calculate next send time
    let nextSendAt = new Date();
    if (firstSequence) {
      nextSendAt.setDate(nextSendAt.getDate() + (firstSequence.delay_days || 0));
      nextSendAt.setHours(nextSendAt.getHours() + (firstSequence.delay_hours || 0));

      // If send_time_hour is set, adjust to that hour
      if (firstSequence.send_time_hour !== null) {
        nextSendAt.setHours(firstSequence.send_time_hour, 0, 0, 0);
        // If it's in the past, move to tomorrow
        if (nextSendAt < new Date()) {
          nextSendAt.setDate(nextSendAt.getDate() + 1);
        }
      }
    }

    // Create enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from('campaign_enrollments')
      .insert({
        campaign_id,
        lead_type,
        lead_id,
        email_address: lead.email,
        current_step: 0,
        status: 'active',
        next_send_at: nextSendAt.toISOString(),
        enrolled_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (enrollError) {
      console.error('Error creating enrollment:', enrollError);
      return NextResponse.json(
        { error: enrollError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      enrollment,
      message: `Lead enrolled in campaign "${campaign.name}"`,
      next_email_at: nextSendAt.toISOString(),
    });

  } catch (error) {
    console.error('Error in campaign enrollment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET - Get enrollment status for a lead
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('lead_id');

    if (!leadId) {
      return NextResponse.json(
        { error: 'Missing lead_id parameter' },
        { status: 400 }
      );
    }

    // Fetch all enrollments for this lead
    const { data: enrollments, error } = await supabase
      .from('campaign_enrollments')
      .select(`
        *,
        campaign:email_campaigns(id, name, active)
      `)
      .eq('lead_id', leadId)
      .order('enrolled_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ enrollments: enrollments || [] });

  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Unenroll a lead from a campaign
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const enrollmentId = searchParams.get('enrollment_id');

    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'Missing enrollment_id parameter' },
        { status: 400 }
      );
    }

    // Update status to unsubscribed instead of deleting
    const { error } = await supabase
      .from('campaign_enrollments')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
        next_send_at: null,
      })
      .eq('id', enrollmentId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Lead unenrolled from campaign' });

  } catch (error) {
    console.error('Error unenrolling:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
