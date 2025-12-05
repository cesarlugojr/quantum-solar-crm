/**
 * Invoice PDF Generation API
 *
 * Generates a PDF document for a specific invoice.
 * GET /api/crm/invoices/[id]/pdf
 */

import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDFTemplate } from '@/components/crm/InvoicePDFTemplate';
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(
      React.createElement(InvoicePDFTemplate, {
        invoice: invoice as Invoice,
        lineItems: (lineItems || []) as InvoiceLineItem[],
        client,
      }) as any
    );

    // Create filename
    const filename = `Invoice_${invoice.invoice_number}${invoice.gpin ? `_${invoice.gpin}` : ''}.pdf`;

    // Convert to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(pdfBuffer);

    // Return PDF as response
    return new NextResponse(uint8Array, {
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
