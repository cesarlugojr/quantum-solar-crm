/**
 * CRM Invoices API Route
 *
 * Manages invoice generation, tracking, and QuickBooks integration.
 * Supports GoodPWR billing with configurable rate sheets.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
);

// GET - Fetch invoices or single invoice
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('id');
    const clientId = searchParams.get('client_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (invoiceId) {
      // Get single invoice with line items and client
      const { data: invoice, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(*),
          line_items:invoice_line_items(*)
        `)
        .eq('id', invoiceId)
        .single();

      if (error) {
        console.error('Error fetching invoice:', error);
        return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
      }

      return NextResponse.json({ invoice });
    }

    // Build query for invoice list
    let query = supabase
      .from('invoices')
      .select(`
        *,
        client:clients(id, name, company_name)
      `, { count: 'exact' })
      .order('invoice_number', { ascending: false })
      .range(offset, offset + limit - 1);

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: invoices, error, count } = await query;

    if (error) {
      console.error('Error fetching invoices:', error);
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }

    return NextResponse.json({
      invoices: invoices || [],
      total: count || 0,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error in invoices GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      client_id,
      project_id,
      gpin,
      project_name,
      project_address,
      system_size_watts,
      invoice_date,
      terms = 'Net 10',
      payment_method = 'Bank Transfer',
      milestone,
      notes,
      line_items = []
    } = body;

    if (!client_id) {
      return NextResponse.json({ error: 'Client is required' }, { status: 400 });
    }

    // Get next invoice number
    const { data: nextNum } = await supabase.rpc('get_next_invoice_number');
    const invoiceNumber = nextNum || 1266;

    // Calculate due date (default Net 10)
    const invoiceDateObj = new Date(invoice_date || Date.now());
    const dueDateObj = new Date(invoiceDateObj);
    const termsDays = parseInt(terms?.replace('Net ', '') || '10');
    dueDateObj.setDate(dueDateObj.getDate() + termsDays);

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        client_id,
        project_id,
        gpin,
        project_name,
        project_address,
        system_size_watts,
        invoice_date: invoiceDateObj.toISOString().split('T')[0],
        due_date: dueDateObj.toISOString().split('T')[0],
        terms,
        payment_method,
        milestone,
        notes,
        status: 'draft',
        created_by: userId
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError);
      return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
    }

    // Insert line items
    if (line_items.length > 0) {
      const lineItemsWithInvoiceId = line_items.map((item: Record<string, unknown>, index: number) => ({
        invoice_id: invoice.id,
        line_number: index + 1,
        item_type: item.item_type,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_rate: item.unit_rate,
        amount: item.amount,
        adder_key: item.adder_key
      }));

      const { error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .insert(lineItemsWithInvoiceId);

      if (lineItemsError) {
        console.error('Error creating line items:', lineItemsError);
        // Invoice was created, but line items failed - return partial success
        return NextResponse.json({
          invoice,
          warning: 'Invoice created but line items failed to save'
        });
      }
    }

    // Fetch complete invoice with line items
    const { data: completeInvoice } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(*),
        line_items:invoice_line_items(*)
      `)
      .eq('id', invoice.id)
      .single();

    return NextResponse.json({ invoice: completeInvoice });
  } catch (error) {
    console.error('Error in invoices POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update invoice
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    // Handle specific actions
    if (action === 'mark_sent') {
      const { error } = await supabase
        .from('invoices')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: 'Failed to mark as sent' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'mark_paid') {
      const { payment_amount, payment_method, reference_number } = updateData;

      // Record payment
      const { error: paymentError } = await supabase
        .from('invoice_payments')
        .insert({
          invoice_id: id,
          amount: payment_amount,
          payment_method,
          reference_number,
          created_by: userId
        });

      if (paymentError) {
        console.error('Error recording payment:', paymentError);
        return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
      }

      // Update invoice status
      const { data: invoice } = await supabase
        .from('invoices')
        .select('total_amount, amount_paid')
        .eq('id', id)
        .single();

      if (invoice) {
        const newAmountPaid = (invoice.amount_paid || 0) + payment_amount;
        const newStatus = newAmountPaid >= invoice.total_amount ? 'paid' : 'partial';

        await supabase
          .from('invoices')
          .update({
            status: newStatus,
            paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'void') {
      const { error } = await supabase
        .from('invoices')
        .update({
          status: 'void',
          voided_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: 'Failed to void invoice' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // Generic update
    const { error } = await supabase
      .from('invoices')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating invoice:', error);
      return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in invoices PATCH:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete invoice
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    // Check if invoice is draft
    const { data: invoice } = await supabase
      .from('invoices')
      .select('status')
      .eq('id', id)
      .single();

    if (invoice?.status !== 'draft') {
      return NextResponse.json({
        error: 'Only draft invoices can be deleted. Void sent invoices instead.'
      }, { status: 400 });
    }

    // Delete line items first (cascade should handle this, but being explicit)
    await supabase
      .from('invoice_line_items')
      .delete()
      .eq('invoice_id', id);

    // Delete invoice
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting invoice:', error);
      return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in invoices DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
