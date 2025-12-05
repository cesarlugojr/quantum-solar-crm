/**
 * Invoice PDF Generation API
 *
 * Generates a PDF document for a specific invoice.
 * GET /api/crm/invoices/[id]/pdf
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { generateInvoicePDF } from '@/lib/invoice-pdf';
import type { Invoice, InvoiceLineItem, Client } from '@/types/crm';

// GET - Generate PDF for invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Fetch line items
    const { data: lineItems, error: lineItemsError } = await supabase
      .from('invoice_line_items')
      .select('*')
      .eq('invoice_id', id)
      .order('line_number', { ascending: true });

    if (lineItemsError) {
      console.error('Error fetching line items:', lineItemsError);
    }

    // Fetch client
    let client: Client | undefined;
    if (invoice.client_id) {
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', invoice.client_id)
        .single();

      if (clientData) {
        client = clientData;
      }
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(
      invoice as Invoice,
      (lineItems || []) as InvoiceLineItem[],
      client
    );

    // Create filename
    const filename = `Invoice_${invoice.invoice_number}${invoice.gpin ? `_${invoice.gpin}` : ''}.pdf`;

    // Return PDF as response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
