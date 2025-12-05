/**
 * CRM Clients API Route
 *
 * Manages billing clients and their associated rate sheets.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
);

// GET - Fetch clients with their active rate sheets
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('id');
    const includeRateSheets = searchParams.get('include_rate_sheets') === 'true';

    if (clientId) {
      // Get single client with rate sheets
      const query = supabase
        .from('clients')
        .select(includeRateSheets ? `
          *,
          rate_sheets(*)
        ` : '*')
        .eq('id', clientId)
        .single();

      const { data: client, error } = await query;

      if (error) {
        console.error('Error fetching client:', error);
        return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
      }

      return NextResponse.json({ client });
    }

    // Get all active clients
    const query = supabase
      .from('clients')
      .select(includeRateSheets ? `
        *,
        rate_sheets(*)
      ` : '*')
      .eq('active', true)
      .order('name');

    const { data: clients, error } = await query;

    if (error) {
      console.error('Error fetching clients:', error);
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }

    return NextResponse.json({ clients: clients || [] });
  } catch (error) {
    console.error('Error in clients GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new client
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      company_name,
      email,
      phone,
      billing_street,
      billing_city,
      billing_state,
      billing_zip,
      billing_country = 'USA',
      shipping_street,
      shipping_city,
      shipping_state,
      shipping_zip,
      shipping_country = 'USA',
      default_terms = 'Net 10',
      default_payment_method = 'Bank Transfer'
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
    }

    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        name,
        company_name: company_name || name,
        email,
        phone,
        billing_street,
        billing_city,
        billing_state,
        billing_zip,
        billing_country,
        shipping_street: shipping_street || billing_street,
        shipping_city: shipping_city || billing_city,
        shipping_state: shipping_state || billing_state,
        shipping_zip: shipping_zip || billing_zip,
        shipping_country: shipping_country || billing_country,
        default_terms,
        default_payment_method,
        active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error('Error in clients POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
