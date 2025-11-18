import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch all campaigns with their templates and sequences
    const { data: campaigns, error: campaignsError } = await supabase
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (campaignsError) {
      return NextResponse.json({ error: campaignsError.message }, { status: 500 });
    }

    // For each campaign, fetch its templates and sequences
    const campaignsWithDetails = await Promise.all(
      campaigns.map(async (campaign) => {
        // Fetch templates
        const { data: templates } = await supabase
          .from('email_templates')
          .select('*')
          .order('created_at', { ascending: true });

        // Fetch sequences for this campaign
        const { data: sequences } = await supabase
          .from('email_sequences')
          .select('*, email_templates(*)')
          .eq('campaign_id', campaign.id)
          .order('send_order', { ascending: true });

        // Count enrollments
        const { count: totalEnrollments } = await supabase
          .from('campaign_enrollments')
          .select('id', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id);

        const { count: activeEnrollments } = await supabase
          .from('campaign_enrollments')
          .select('id', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id)
          .eq('status', 'active');

        return {
          ...campaign,
          templates,
          sequences,
          stats: {
            totalEnrollments: totalEnrollments || 0,
            activeEnrollments: activeEnrollments || 0
          }
        };
      })
    );

    return NextResponse.json({ campaigns: campaignsWithDetails });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Extract sequences from body (they'll be created separately)
    const { sequences, target_segment, ...campaignData } = body;

    // Convert target_segment to trigger_conditions JSON
    const trigger_conditions = target_segment || {};

    // Create the campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .insert({
        ...campaignData,
        trigger_conditions,
      })
      .select()
      .single();

    if (campaignError) {
      console.error('Error creating campaign:', campaignError);
      return NextResponse.json({ error: campaignError.message }, { status: 500 });
    }

    // If sequences were provided, create them
    if (sequences && Array.isArray(sequences) && sequences.length > 0) {
      const sequencesToInsert = sequences.map((seq, index) => ({
        campaign_id: campaign.id,
        send_order: seq.sequence_number || index + 1,
        delay_days: seq.delay_days || 0,
        subject_template: seq.subject,
        html_template: seq.html_template,
        template_variables: seq.template_variables || [],
        active: true,
      }));

      const { error: sequencesError } = await supabase
        .from('email_sequences')
        .insert(sequencesToInsert);

      if (sequencesError) {
        console.error('Error creating sequences:', sequencesError);

        // Rollback: Delete the campaign since sequences failed
        await supabase
          .from('email_campaigns')
          .delete()
          .eq('id', campaign.id);

        return NextResponse.json(
          { error: `Campaign created but sequences failed: ${sequencesError.message}` },
          { status: 500 }
        );
      }
    }

    // Fetch the complete campaign with sequences
    const { data: createdSequences } = await supabase
      .from('email_sequences')
      .select('*')
      .eq('campaign_id', campaign.id)
      .order('send_order', { ascending: true });

    return NextResponse.json({
      campaign: {
        ...campaign,
        sequences: createdSequences,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('email_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ campaign: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating campaign:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
