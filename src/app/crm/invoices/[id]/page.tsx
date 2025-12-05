'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Calendar,
  DollarSign,
  Send,
  Download,
  Printer,
  XCircle,
  CheckCircle,
  Clock,
  Building2,
  MapPin,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Invoice, InvoiceStatus } from '@/types/crm';
import { formatCurrency, INVOICE_STATUS_LABELS } from '@/types/crm';

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  sent: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  viewed: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  partial: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  paid: 'bg-green-500/20 text-green-300 border-green-500/30',
  overdue: 'bg-red-500/20 text-red-300 border-red-500/30',
  void: 'bg-gray-400/20 text-gray-400 border-gray-400/30',
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/crm/invoices?id=${params.id}`);
      const data = await response.json();
      if (data.invoice) {
        setInvoice(data.invoice);
        setPaymentAmount(data.invoice.balance_due?.toString() || '');
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchInvoice();
    }
  }, [params.id, fetchInvoice]);

  const handleAction = async (action: string, extraData?: Record<string, unknown>) => {
    if (!invoice) return;

    try {
      setActionLoading(true);

      if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this draft invoice?')) {
          return;
        }
        await fetch(`/api/crm/invoices?id=${invoice.id}`, { method: 'DELETE' });
        router.push('/crm/invoices');
        return;
      }

      await fetch('/api/crm/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: invoice.id, action, ...extraData }),
      });

      fetchInvoice();
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    await handleAction('mark_paid', { payment_amount: amount });
    setPaymentDialogOpen(false);
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;

    try {
      const response = await fetch(`/api/crm/invoices/${invoice.id}/pdf`);

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${invoice.invoice_number}${invoice.gpin ? `_${invoice.gpin}` : ''}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handlePrint = async () => {
    if (!invoice) return;

    try {
      const response = await fetch(`/api/crm/invoices/${invoice.id}/pdf`);

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Open in new window for printing
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error('Error printing PDF:', error);
      alert('Failed to print. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-400">Loading invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Invoice Not Found</h3>
        <p className="text-gray-400 mb-4">
          The invoice you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/crm/invoices">
          <Button className="bg-[#ff0000] hover:bg-[#cc0000] text-white">
            Back to Invoices
          </Button>
        </Link>
      </div>
    );
  }

  const systemSizeKw = invoice.system_size_watts
    ? (invoice.system_size_watts / 1000).toFixed(2)
    : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/crm/invoices">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              Invoice #{invoice.invoice_number}
              <Badge
                variant="outline"
                className={STATUS_COLORS[invoice.status as InvoiceStatus]}
              >
                {INVOICE_STATUS_LABELS[invoice.status as InvoiceStatus]}
              </Badge>
            </h1>
            {invoice.gpin && (
              <p className="text-gray-400 mt-1">GPIN: {invoice.gpin}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {invoice.status === 'draft' && (
            <Button
              onClick={() => handleAction('mark_sent')}
              disabled={actionLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Mark as Sent
            </Button>
          )}

          {['sent', 'partial', 'overdue'].includes(invoice.status) && (
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Record Payment</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Record a payment for Invoice #{invoice.invoice_number}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Payment Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0.00"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <p className="text-sm text-gray-500">
                      Balance due: {formatCurrency(invoice.balance_due || 0)}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setPaymentDialogOpen(false)}
                    className="border-gray-700 text-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRecordPayment}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {actionLoading ? 'Recording...' : 'Record Payment'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            className="border-gray-700 text-gray-300"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>

          <Button
            variant="outline"
            onClick={handlePrint}
            className="border-gray-700 text-gray-300"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>

          {invoice.status !== 'void' && invoice.status !== 'paid' && (
            <Button
              variant="outline"
              onClick={() => handleAction('void')}
              disabled={actionLoading}
              className="border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-600"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Void
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Info */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Project Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invoice.project_name && (
                <div>
                  <p className="text-sm text-gray-400">Project Name</p>
                  <p className="text-white font-medium">{invoice.project_name}</p>
                </div>
              )}
              {invoice.gpin && (
                <div>
                  <p className="text-sm text-gray-400">GPIN</p>
                  <p className="text-white font-medium">{invoice.gpin}</p>
                </div>
              )}
              {invoice.project_address && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Address
                  </p>
                  <p className="text-white">{invoice.project_address}</p>
                </div>
              )}
              {systemSizeKw && (
                <div>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Zap className="h-3 w-3" /> System Size
                  </p>
                  <p className="text-white font-medium">{systemSizeKw} kW</p>
                </div>
              )}
              {invoice.milestone && (
                <div>
                  <p className="text-sm text-gray-400">Milestone</p>
                  <p className="text-white font-medium">{invoice.milestone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Line Items
              </h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-800/50">
                  <TableHead className="text-gray-400">#</TableHead>
                  <TableHead className="text-gray-400">Description</TableHead>
                  <TableHead className="text-gray-400 text-right">Qty</TableHead>
                  <TableHead className="text-gray-400 text-right">Rate</TableHead>
                  <TableHead className="text-gray-400 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.line_items && invoice.line_items.length > 0 ? (
                  invoice.line_items.map((item, index) => (
                    <TableRow key={item.id || index} className="border-gray-700 hover:bg-gray-800/50">
                      <TableCell className="text-gray-400">{item.line_number}</TableCell>
                      <TableCell className="text-white">{item.description}</TableCell>
                      <TableCell className="text-gray-300 text-right">
                        {item.quantity?.toLocaleString()} {item.unit}
                      </TableCell>
                      <TableCell className="text-gray-300 text-right">
                        ${item.unit_rate?.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-white text-right font-medium">
                        {formatCurrency(item.amount || 0)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-gray-700">
                    <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                      No line items
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Totals */}
            <div className="p-4 border-t border-gray-700 bg-gray-800/30">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(invoice.subtotal || 0)}</span>
                  </div>
                  {invoice.tax_amount > 0 && (
                    <div className="flex justify-between text-gray-300">
                      <span>Tax:</span>
                      <span>{formatCurrency(invoice.tax_amount)}</span>
                    </div>
                  )}
                  {invoice.discount_amount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount:</span>
                      <span>-{formatCurrency(invoice.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-gray-700">
                    <span>Total:</span>
                    <span>{formatCurrency(invoice.total_amount || 0)}</span>
                  </div>
                  {invoice.amount_paid > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Paid:</span>
                      <span>-{formatCurrency(invoice.amount_paid)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-gray-700">
                    <span>Balance Due:</span>
                    <span className={invoice.balance_due > 0 ? 'text-yellow-400' : 'text-green-400'}>
                      {formatCurrency(invoice.balance_due || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-2">Notes</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invoice Summary */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Amount:</span>
                <span className="text-white font-bold">
                  {formatCurrency(invoice.total_amount || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount Paid:</span>
                <span className="text-green-400">
                  {formatCurrency(invoice.amount_paid || 0)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-4">
                <span className="text-gray-400">Balance Due:</span>
                <span className={`font-bold ${invoice.balance_due > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {formatCurrency(invoice.balance_due || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Client Info */}
          {invoice.client && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Bill To
              </h2>
              <div className="space-y-2">
                <p className="text-white font-medium">
                  {invoice.client.company_name || invoice.client.name}
                </p>
                {invoice.client.billing_street && (
                  <p className="text-gray-400 text-sm">
                    {invoice.client.billing_street}
                    {invoice.client.billing_city && (
                      <>
                        <br />
                        {invoice.client.billing_city}, {invoice.client.billing_state}{' '}
                        {invoice.client.billing_zip}
                      </>
                    )}
                  </p>
                )}
                {invoice.client.email && (
                  <p className="text-gray-400 text-sm">{invoice.client.email}</p>
                )}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dates
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Invoice Date:</span>
                <span className="text-white">
                  {invoice.invoice_date
                    ? new Date(invoice.invoice_date).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Due Date:</span>
                <span className="text-white">
                  {invoice.due_date
                    ? new Date(invoice.due_date).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              {invoice.sent_at && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Sent:</span>
                  <span className="text-blue-400">
                    {new Date(invoice.sent_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              {invoice.paid_at && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Paid:</span>
                  <span className="text-green-400">
                    {new Date(invoice.paid_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Terms */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Payment Terms
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Terms:</span>
                <span className="text-white">{invoice.terms || 'Net 10'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Method:</span>
                <span className="text-white">{invoice.payment_method || 'Bank Transfer'}</span>
              </div>
            </div>
          </div>

          {/* Status History */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Activity
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                <div>
                  <p className="text-sm text-white">Invoice Created</p>
                  <p className="text-xs text-gray-500">
                    {invoice.created_at
                      ? new Date(invoice.created_at).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
              {invoice.sent_at && (
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                  <div>
                    <p className="text-sm text-white">Invoice Sent</p>
                    <p className="text-xs text-gray-500">
                      {new Date(invoice.sent_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {invoice.paid_at && (
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                  <div>
                    <p className="text-sm text-white">Payment Received</p>
                    <p className="text-xs text-gray-500">
                      {new Date(invoice.paid_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {invoice.voided_at && (
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500 mt-2"></div>
                  <div>
                    <p className="text-sm text-white">Invoice Voided</p>
                    <p className="text-xs text-gray-500">
                      {new Date(invoice.voided_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
