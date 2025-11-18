import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
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
  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('email_campaigns')
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ campaign: data });
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
  } catch (error: any) {
    console.error('Error updating campaign:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
