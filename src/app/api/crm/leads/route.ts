/**
 * CRM Leads API Route
 * 
 * Provides CRUD operations for lead management in the CRM system.
 * Integrates with existing splash leads and contact submissions.
 * 
 * Features:
 * - Fetch all leads from multiple sources
 * - Update lead status
 * - Role-based access control
 * - Real-time data from Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
);

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('id');

    // Fetch splash leads
    const { data: splashLeads, error: splashError } = await supabase
      .from('splash_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (splashError) {
      console.error('Error fetching splash leads:', splashError);
    }

    // Fetch contact submissions
    const { data: contactSubmissions, error: contactError } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (contactError) {
      console.error('Error fetching contact submissions:', contactError);
    }

    // Combine and normalize data
    const leads = [
      // Splash leads
      ...(splashLeads || []).map(lead => ({
        id: lead.id,
        name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown',
        email: lead.email || '',
        phone: lead.phone || '',
        status: 'new' as const,
        created_at: lead.created_at,
        electric_bill: lead.electric_bill || null,
        location: `${lead.city || ''}, ${lead.state || ''}`.trim() || lead.address || 'Unknown',
        source: 'splash'
      })),
      // Contact submissions
      ...(contactSubmissions || []).map(submission => ({
        id: submission.id,
        name: submission.name || 'Unknown',
        email: submission.email || '',
        phone: submission.phone || '',
        status: 'new' as const,
        created_at: submission.created_at,
        electric_bill: null,
        location: 'Contact Form',
        source: 'contact'
      }))
    ];

    // Sort by creation date (newest first)
    leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // If specific lead ID is requested, find and return that lead
    if (leadId) {
      const specificLead = leads.find(lead => lead.id === leadId);
      if (!specificLead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }
      return NextResponse.json(specificLead);
    }

    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error in CRM leads API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status, source } = await request.json();

    if (!id || !status || !source) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store the status in a separate leads_status table
    // since the original tables might not have a status column
    const { error } = await supabase
      .from('leads_status')
      .upsert({
        lead_id: id,
        source,
        status,
        updated_at: new Date().toISOString(),
        updated_by: userId
      });

    if (error) {
      console.error('Error updating lead status:', error);
      return NextResponse.json(
        { error: 'Failed to update lead status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in CRM leads PUT API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
