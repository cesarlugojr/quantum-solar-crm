/**
 * QuickBooks Invoice Sync Endpoint
 *
 * Syncs an invoice to QuickBooks Online.
 * POST /api/crm/invoices/[id]/sync-qbo
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import {
  isQBOConnected,
  findOrCreateQBOCustomer,
  createQBOInvoice,
  logQBOSync,
  type QBOInvoiceData,
} from '@/lib/quickbooks';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: invoiceId } = await params;

    // Check QBO connection
    const connected = await isQBOConnected();
    if (!connected) {
      return NextResponse.json(
        { error: 'QuickBooks is not connected. Please connect QuickBooks in Settings.' },
        { status: 400 }
      );
    }

    // Fetch the invoice with line items and client
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        line_items:invoice_line_items(*),
        client:clients(*)
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check if already synced
    if (invoice.quickbooks_invoice_id) {
      return NextResponse.json(
        { error: 'Invoice already synced to QuickBooks', qbo_invoice_id: invoice.quickbooks_invoice_id },
        { status: 400 }
      );
    }

    // Get or create customer in QBO
    const clientName = invoice.client?.company_name || invoice.client?.name || 'Unknown Customer';

    let qboCustomer;
    try {
      qboCustomer = await findOrCreateQBOCustomer(clientName, {
        CompanyName: invoice.client?.company_name,
        PrimaryEmailAddr: invoice.client?.email ? { Address: invoice.client.email } : undefined,
        PrimaryPhone: invoice.client?.phone ? { FreeFormNumber: invoice.client.phone } : undefined,
        BillAddr: invoice.client?.billing_street ? {
          Line1: invoice.client.billing_street,
          City: invoice.client.billing_city,
          CountrySubDivisionCode: invoice.client.billing_state,
          PostalCode: invoice.client.billing_zip,
        } : undefined,
      });
    } catch (error) {
      console.error('Error creating QBO customer:', error);
      await logQBOSync(invoiceId, 'create', 'error', undefined, `Customer creation failed: ${error}`);

      // Update invoice with error status
      await supabase
        .from('invoices')
        .update({
          quickbooks_sync_status: 'error',
          quickbooks_error: `Customer creation failed: ${error}`,
        })
        .eq('id', invoiceId);

      return NextResponse.json(
        { error: `Failed to create customer in QuickBooks: ${error}` },
        { status: 500 }
      );
    }

    // Build invoice line items for QBO
    const qboLineItems: QBOInvoiceData['Line'] = invoice.line_items.map((item: {
      description: string;
      amount: number;
      unit_rate: number;
      quantity: number;
    }) => ({
      DetailType: 'SalesItemLineDetail' as const,
      Amount: item.amount,
      Description: item.description,
      SalesItemLineDetail: {
        UnitPrice: item.unit_rate,
        Qty: item.quantity,
      },
    }));

    // Build QBO invoice data
    const qboInvoiceData: QBOInvoiceData = {
      CustomerRef: {
        value: qboCustomer.Id,
      },
      Line: qboLineItems,
      DocNumber: invoice.invoice_number?.toString(),
      TxnDate: invoice.invoice_date,
      DueDate: invoice.due_date,
      CustomerMemo: invoice.notes ? { value: invoice.notes } : undefined,
    };

    // Create invoice in QBO
    let qboInvoice;
    try {
      const result = await createQBOInvoice(qboInvoiceData);
      qboInvoice = result.Invoice;
    } catch (error) {
      console.error('Error creating QBO invoice:', error);
      await logQBOSync(invoiceId, 'create', 'error', undefined, `Invoice creation failed: ${error}`);

      // Update invoice with error status
      await supabase
        .from('invoices')
        .update({
          quickbooks_sync_status: 'error',
          quickbooks_error: `Invoice creation failed: ${error}`,
        })
        .eq('id', invoiceId);

      return NextResponse.json(
        { error: `Failed to create invoice in QuickBooks: ${error}` },
        { status: 500 }
      );
    }

    // Update invoice with QBO details
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        quickbooks_invoice_id: qboInvoice.Id,
        quickbooks_sync_status: 'synced',
        quickbooks_synced_at: new Date().toISOString(),
        quickbooks_error: null,
      })
      .eq('id', invoiceId);

    if (updateError) {
      console.error('Error updating invoice:', updateError);
    }

    // Log successful sync
    await logQBOSync(invoiceId, 'create', 'success', qboInvoice.Id);

    return NextResponse.json({
      success: true,
      message: 'Invoice synced to QuickBooks successfully',
      qbo_invoice_id: qboInvoice.Id,
      qbo_customer_id: qboCustomer.Id,
    });
  } catch (error) {
    console.error('Error syncing invoice to QBO:', error);
    return NextResponse.json(
      { error: 'Failed to sync invoice to QuickBooks' },
      { status: 500 }
    );
  }
}
