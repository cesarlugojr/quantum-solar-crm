/**
 * Invoice PDF Upload to Google Drive API
 *
 * Generates and uploads an invoice PDF to Google Drive.
 * POST /api/crm/invoices/[id]/upload-drive
 */

import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDFTemplate } from '@/components/crm/InvoicePDFTemplate';
import { uploadInvoicePDF, isGoogleDriveConfigured } from '@/lib/google-drive';
import type { Invoice, InvoiceLineItem, Client } from '@/types/crm';

// POST - Generate PDF and upload to Google Drive
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Google Drive is configured
    if (!isGoogleDriveConfigured()) {
      return NextResponse.json(
        { error: 'Google Drive is not configured' },
        { status: 400 }
      );
    }

    const { id: invoiceId } = await params;

    // Fetch invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
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
      .eq('invoice_id', invoiceId)
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

    // Upload to Google Drive
    const uploadResult = await uploadInvoicePDF(
      Buffer.from(pdfBuffer),
      invoice.invoice_number,
      invoice.gpin,
      invoice.project_name
    );

    // Update invoice with Google Drive info
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        google_drive_file_id: uploadResult.fileId,
        google_drive_url: uploadResult.webViewLink,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId);

    if (updateError) {
      console.error('Error updating invoice with Drive info:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: 'PDF uploaded to Google Drive',
      fileId: uploadResult.fileId,
      webViewLink: uploadResult.webViewLink,
      webContentLink: uploadResult.webContentLink,
    });
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    return NextResponse.json(
      { error: `Failed to upload to Google Drive: ${error}` },
      { status: 500 }
    );
  }
}
