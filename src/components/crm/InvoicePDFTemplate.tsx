import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { Invoice, InvoiceLineItem, Client } from '@/types/crm';

// Styles matching Quantum Solar branding
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  companyInfo: {
    width: '50%',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF0000', // Quantum Solar red
    marginBottom: 5,
  },
  companyAddress: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.4,
  },
  invoiceTitle: {
    width: '50%',
    textAlign: 'right',
  },
  invoiceTitleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  invoiceNumber: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  invoiceDate: {
    fontSize: 10,
    color: '#666666',
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF0000',
    marginVertical: 20,
  },
  clientSection: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  clientBox: {
    width: '50%',
    paddingRight: 20,
  },
  boxLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  boxText: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.5,
  },
  projectBox: {
    width: '50%',
  },
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#333333',
    padding: 10,
  },
  tableHeaderCell: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 9,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    padding: 10,
  },
  tableRowAlt: {
    backgroundColor: '#F9F9F9',
  },
  descriptionCol: {
    width: '40%',
  },
  qtyCol: {
    width: '20%',
    textAlign: 'right',
  },
  rateCol: {
    width: '20%',
    textAlign: 'right',
  },
  amountCol: {
    width: '20%',
    textAlign: 'right',
  },
  tableCell: {
    fontSize: 10,
    color: '#333333',
  },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 30,
  },
  totalsBox: {
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  totalRowDivider: {
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  totalLabel: {
    fontSize: 10,
    color: '#666666',
  },
  totalValue: {
    fontSize: 10,
    color: '#333333',
    fontWeight: 'bold',
  },
  grandTotalRow: {
    backgroundColor: '#333333',
    marginTop: 5,
  },
  grandTotalLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  grandTotalValue: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  paymentSection: {
    marginBottom: 30,
  },
  paymentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  paymentInfo: {
    fontSize: 10,
    color: '#666666',
    lineHeight: 1.5,
  },
  paymentInfoBold: {
    fontWeight: 'bold',
    color: '#333333',
  },
  notesSection: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  notesText: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#999999',
  },
  footerDivider: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginBottom: 10,
    paddingTop: 10,
  },
});

interface InvoicePDFProps {
  invoice: Invoice;
  lineItems: InvoiceLineItem[];
  client?: Client;
}

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

export const InvoicePDFTemplate: React.FC<InvoicePDFProps> = ({
  invoice,
  lineItems,
  client,
}) => {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>Quantum Solar</Text>
            <Text style={styles.companyAddress}>Quantum Solar Enterprises LLC</Text>
            <Text style={styles.companyAddress}>Illinois, USA</Text>
            <Text style={styles.companyAddress}>cesar@quantumsolar.us</Text>
            <Text style={styles.companyAddress}>quantumsolar.us</Text>
          </View>
          <View style={styles.invoiceTitle}>
            <Text style={styles.invoiceTitleText}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoice.invoice_number}</Text>
            <Text style={styles.invoiceDate}>
              Date: {formatDate(invoice.invoice_date)}
            </Text>
            {invoice.due_date && (
              <Text style={styles.invoiceDate}>
                Due: {formatDate(invoice.due_date)}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Bill To / Project Info */}
        <View style={styles.clientSection}>
          <View style={styles.clientBox}>
            <Text style={styles.boxLabel}>Bill To</Text>
            <Text style={styles.boxText}>
              {client?.company_name || client?.name || 'Client'}
            </Text>
            {client?.billing_street && (
              <Text style={styles.boxText}>{client.billing_street}</Text>
            )}
            {client?.billing_city && client?.billing_state && client?.billing_zip && (
              <Text style={styles.boxText}>
                {client.billing_city}, {client.billing_state} {client.billing_zip}
              </Text>
            )}
          </View>
          <View style={styles.projectBox}>
            <Text style={styles.boxLabel}>Project Details</Text>
            {invoice.gpin && (
              <Text style={styles.boxText}>GPIN: {invoice.gpin}</Text>
            )}
            {invoice.project_name && (
              <Text style={styles.boxText}>Customer: {invoice.project_name}</Text>
            )}
            {invoice.project_address && (
              <Text style={styles.boxText}>Address: {invoice.project_address}</Text>
            )}
            {invoice.system_size_watts && (
              <Text style={styles.boxText}>
                System: {(invoice.system_size_watts / 1000).toFixed(2)} kW ({invoice.system_size_watts.toLocaleString()} W)
              </Text>
            )}
            {invoice.milestone && (
              <Text style={styles.boxText}>Milestone: {invoice.milestone}</Text>
            )}
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.descriptionCol]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderCell, styles.qtyCol]}>
              Qty
            </Text>
            <Text style={[styles.tableHeaderCell, styles.rateCol]}>
              Rate
            </Text>
            <Text style={[styles.tableHeaderCell, styles.amountCol]}>
              Amount
            </Text>
          </View>

          {/* Table Rows */}
          {lineItems.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.tableRow,
                index % 2 === 1 ? styles.tableRowAlt : {},
              ]}
            >
              <Text style={[styles.tableCell, styles.descriptionCol]}>
                {item.description}
              </Text>
              <Text style={[styles.tableCell, styles.qtyCol]}>
                {item.quantity.toLocaleString()} {item.unit}
              </Text>
              <Text style={[styles.tableCell, styles.rateCol]}>
                ${item.unit_rate.toFixed(4)}
              </Text>
              <Text style={[styles.tableCell, styles.amountCol]}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(invoice.subtotal || 0)}
              </Text>
            </View>
            {invoice.discount_amount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount</Text>
                <Text style={styles.totalValue}>
                  -{formatCurrency(invoice.discount_amount)}
                </Text>
              </View>
            )}
            {invoice.tax_amount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(invoice.tax_amount)}
                </Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(invoice.total_amount || 0)}
              </Text>
            </View>
            {invoice.amount_paid > 0 && (
              <View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Amount Paid</Text>
                  <Text style={styles.totalValue}>
                    -{formatCurrency(invoice.amount_paid)}
                  </Text>
                </View>
                <View style={[styles.totalRow, styles.totalRowDivider]}>
                  <Text style={styles.totalLabel}>Balance Due</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(invoice.balance_due || 0)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>Payment Information</Text>
          <Text style={styles.paymentInfo}>
            Terms: {invoice.terms || 'Net 10'}
          </Text>
          <Text style={styles.paymentInfo}>
            Payment Method: {invoice.payment_method || 'Bank Transfer'}
          </Text>
          <Text style={styles.paymentInfo}> </Text>
          <Text style={styles.paymentInfo}>
            Please make payment within the terms specified above.
          </Text>
          <Text style={styles.paymentInfo}>
            For questions, contact cesar@quantumsolar.us
          </Text>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.footerText}>
            Thank you for your business! | Quantum Solar Enterprises LLC | quantumsolar.us
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDFTemplate;
