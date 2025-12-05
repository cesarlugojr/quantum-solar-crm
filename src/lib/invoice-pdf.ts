/**
 * Invoice PDF Generator
 *
 * Creates PDF documents for invoices using jspdf.
 * This approach avoids React rendering compatibility issues with Next.js 16.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice, InvoiceLineItem, Client } from '@/types/crm';

// Quantum Solar brand colors
const COLORS = {
  primary: '#FF0000',
  dark: '#333333',
  medium: '#666666',
  light: '#999999',
  border: '#EEEEEE',
  background: '#F5F5F5',
};

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Generate PDF buffer
export const generateInvoicePDF = async (
  invoice: Invoice,
  lineItems: InvoiceLineItem[],
  client?: Client
): Promise<Buffer> => {
  // Create PDF document (Letter size: 8.5 x 11 inches)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = margin;

  // ===== HEADER =====
  // Company name
  doc.setFontSize(24);
  doc.setTextColor(COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('Quantum Solar', margin, y + 20);

  // Company address
  doc.setFontSize(9);
  doc.setTextColor(COLORS.medium);
  doc.setFont('helvetica', 'normal');
  doc.text('Quantum Solar Enterprises LLC', margin, y + 35);
  doc.text('Illinois, USA', margin, y + 47);
  doc.text('cesar@quantumsolar.us', margin, y + 59);
  doc.text('quantumsolar.us', margin, y + 71);

  // Invoice title (right side)
  doc.setFontSize(28);
  doc.setTextColor(COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - margin, y + 20, { align: 'right' });

  doc.setFontSize(14);
  doc.setTextColor(COLORS.medium);
  doc.setFont('helvetica', 'normal');
  doc.text(`#${invoice.invoice_number}`, pageWidth - margin, y + 40, { align: 'right' });

  doc.setFontSize(10);
  doc.text(`Date: ${formatDate(invoice.invoice_date)}`, pageWidth - margin, y + 55, { align: 'right' });

  if (invoice.due_date) {
    doc.text(`Due: ${formatDate(invoice.due_date)}`, pageWidth - margin, y + 70, { align: 'right' });
  }

  y += 90;

  // ===== DIVIDER =====
  doc.setDrawColor(COLORS.primary);
  doc.setLineWidth(2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 25;

  // ===== CLIENT & PROJECT SECTION =====
  const sectionWidth = (pageWidth - margin * 2 - 20) / 2;

  // Bill To section
  doc.setFontSize(10);
  doc.setTextColor(COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.dark);

  let billToY = y + 15;
  const clientName = client?.company_name || client?.name || 'Client';
  doc.text(clientName, margin, billToY);
  billToY += 14;

  if (client?.billing_street) {
    doc.text(client.billing_street, margin, billToY);
    billToY += 14;
  }

  if (client?.billing_city && client?.billing_state && client?.billing_zip) {
    doc.text(`${client.billing_city}, ${client.billing_state} ${client.billing_zip}`, margin, billToY);
    billToY += 14;
  }

  // Project Details section (right side)
  const projectX = margin + sectionWidth + 20;
  doc.setFont('helvetica', 'bold');
  doc.text('PROJECT DETAILS', projectX, y);

  doc.setFont('helvetica', 'normal');
  let projectY = y + 15;

  if (invoice.gpin) {
    doc.text(`GPIN: ${invoice.gpin}`, projectX, projectY);
    projectY += 14;
  }

  if (invoice.project_name) {
    doc.text(`Customer: ${invoice.project_name}`, projectX, projectY);
    projectY += 14;
  }

  if (invoice.project_address) {
    doc.text(`Address: ${invoice.project_address}`, projectX, projectY);
    projectY += 14;
  }

  if (invoice.system_size_watts) {
    const kw = (invoice.system_size_watts / 1000).toFixed(2);
    doc.text(`System: ${kw} kW (${invoice.system_size_watts.toLocaleString()} W)`, projectX, projectY);
    projectY += 14;
  }

  if (invoice.milestone) {
    doc.text(`Milestone: ${invoice.milestone}`, projectX, projectY);
    projectY += 14;
  }

  y = Math.max(billToY, projectY) + 20;

  // ===== LINE ITEMS TABLE =====
  const tableData = lineItems.map((item) => [
    item.description,
    `${item.quantity.toLocaleString()} ${item.unit}`,
    `$${item.unit_rate.toFixed(4)}`,
    formatCurrency(item.amount),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Description', 'Qty', 'Rate', 'Amount']],
    body: tableData,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: COLORS.dark,
      textColor: '#FFFFFF',
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 'auto', halign: 'left' },
      1: { cellWidth: 80, halign: 'right' },
      2: { cellWidth: 80, halign: 'right' },
      3: { cellWidth: 80, halign: 'right' },
    },
    styles: {
      fontSize: 10,
      cellPadding: 8,
      textColor: COLORS.dark,
    },
    alternateRowStyles: {
      fillColor: '#F9F9F9',
    },
    theme: 'plain',
    didDrawPage: () => {
      // Draw borders
    },
  });

  // Get the final Y position after the table
  y = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y + 100;
  y += 20;

  // ===== TOTALS SECTION =====
  const totalsX = pageWidth - margin - 200;
  const totalsWidth = 200;

  // Subtotal
  doc.setFontSize(10);
  doc.setTextColor(COLORS.medium);
  doc.text('Subtotal', totalsX, y);
  doc.setTextColor(COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(invoice.subtotal || 0), totalsX + totalsWidth, y, { align: 'right' });
  y += 18;

  // Discount (if any)
  if (invoice.discount_amount && invoice.discount_amount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.medium);
    doc.text('Discount', totalsX, y);
    doc.setTextColor(COLORS.dark);
    doc.setFont('helvetica', 'bold');
    doc.text(`-${formatCurrency(invoice.discount_amount)}`, totalsX + totalsWidth, y, { align: 'right' });
    y += 18;
  }

  // Tax (if any)
  if (invoice.tax_amount && invoice.tax_amount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.medium);
    doc.text('Tax', totalsX, y);
    doc.setTextColor(COLORS.dark);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(invoice.tax_amount), totalsX + totalsWidth, y, { align: 'right' });
    y += 18;
  }

  // Grand Total (highlighted)
  y += 5;
  doc.setFillColor(COLORS.dark);
  doc.rect(totalsX - 10, y - 12, totalsWidth + 20, 25, 'F');
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total', totalsX, y + 5);
  doc.text(formatCurrency(invoice.total_amount || 0), totalsX + totalsWidth, y + 5, { align: 'right' });
  y += 30;

  // Amount Paid & Balance Due (if applicable)
  if (invoice.amount_paid && invoice.amount_paid > 0) {
    doc.setTextColor(COLORS.medium);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Amount Paid', totalsX, y);
    doc.setTextColor(COLORS.dark);
    doc.setFont('helvetica', 'bold');
    doc.text(`-${formatCurrency(invoice.amount_paid)}`, totalsX + totalsWidth, y, { align: 'right' });
    y += 18;

    doc.setDrawColor(COLORS.dark);
    doc.setLineWidth(1);
    doc.line(totalsX, y - 5, totalsX + totalsWidth, y - 5);

    doc.setTextColor(COLORS.medium);
    doc.setFont('helvetica', 'normal');
    doc.text('Balance Due', totalsX, y + 5);
    doc.setTextColor(COLORS.dark);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(invoice.balance_due || 0), totalsX + totalsWidth, y + 5, { align: 'right' });
    y += 25;
  }

  y += 20;

  // ===== PAYMENT INFORMATION =====
  doc.setFontSize(12);
  doc.setTextColor(COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Information', margin, y);
  y += 18;

  doc.setFontSize(10);
  doc.setTextColor(COLORS.medium);
  doc.setFont('helvetica', 'normal');
  doc.text(`Terms: ${invoice.terms || 'Net 10'}`, margin, y);
  y += 14;
  doc.text(`Payment Method: ${invoice.payment_method || 'Bank Transfer'}`, margin, y);
  y += 20;
  doc.text('Please make payment within the terms specified above.', margin, y);
  y += 14;
  doc.text('For questions, contact cesar@quantumsolar.us', margin, y);
  y += 25;

  // ===== NOTES (if any) =====
  if (invoice.notes) {
    doc.setFillColor(COLORS.background);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 60, 3, 3, 'F');

    doc.setFontSize(10);
    doc.setTextColor(COLORS.dark);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes', margin + 15, y + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.medium);

    // Split notes into lines that fit
    const splitNotes = doc.splitTextToSize(invoice.notes, pageWidth - margin * 2 - 30);
    doc.text(splitNotes, margin + 15, y + 32);
  }

  // ===== FOOTER =====
  const footerY = pageHeight - 40;
  doc.setDrawColor(COLORS.border);
  doc.setLineWidth(1);
  doc.line(margin, footerY - 15, pageWidth - margin, footerY - 15);

  doc.setFontSize(8);
  doc.setTextColor(COLORS.light);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Thank you for your business! | Quantum Solar Enterprises LLC | quantumsolar.us',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  // Return as Buffer
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
};
