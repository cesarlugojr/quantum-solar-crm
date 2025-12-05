'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

interface ProjectInvoicesSectionProps {
  projectId: string;
  projectName: string;
  projectAddress?: string;
  systemSizeKw?: number;
}

export function ProjectInvoicesSection({
  projectId,
  projectName,
  projectAddress,
  systemSizeKw,
}: ProjectInvoicesSectionProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch invoices that match this project
      const response = await fetch(`/api/crm/invoices`);
      const data = await response.json();

      if (data.invoices) {
        // Filter invoices for this project (by project_id or matching project_name)
        const projectInvoices = data.invoices.filter(
          (inv: Invoice) =>
            inv.project_id === projectId ||
            inv.project_name?.toLowerCase() === projectName.toLowerCase()
        );
        setInvoices(projectInvoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, projectName]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Calculate totals
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0);
  const totalOutstanding = invoices
    .filter((inv) => !['void', 'paid'].includes(inv.status))
    .reduce((sum, inv) => sum + (inv.balance_due || 0), 0);

  // Build create invoice URL with pre-filled data
  const createInvoiceParams = new URLSearchParams();
  if (projectName) createInvoiceParams.set('project_name', projectName);
  if (projectAddress) createInvoiceParams.set('project_address', projectAddress);
  if (systemSizeKw) createInvoiceParams.set('system_size_kw', systemSizeKw.toString());
  createInvoiceParams.set('project_id', projectId);

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Invoices
        </h2>
        <Link href={`/crm/invoices/new?${createInvoiceParams.toString()}`}>
          <Button size="sm" className="bg-[#ff0000] hover:bg-[#cc0000] text-white">
            <Plus className="h-4 w-4 mr-1" />
            Create Invoice
          </Button>
        </Link>
      </div>

      {/* Summary Stats */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-400">Invoiced</p>
            <p className="text-lg font-bold text-white">{formatCurrency(totalInvoiced)}</p>
          </div>
          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-400">Paid</p>
            <p className="text-lg font-bold text-green-400">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-400">Outstanding</p>
            <p className={`text-lg font-bold ${totalOutstanding > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
              {formatCurrency(totalOutstanding)}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-4">Loading invoices...</p>
      ) : invoices.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-10 w-10 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 text-sm mb-3">No invoices for this project yet</p>
          <Link href={`/crm/invoices/new?${createInvoiceParams.toString()}`}>
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">
              <Plus className="h-4 w-4 mr-1" />
              Create First Invoice
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-white font-medium">
                    #{invoice.invoice_number}
                    {invoice.milestone && (
                      <span className="text-gray-400 text-sm ml-2">({invoice.milestone})</span>
                    )}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {invoice.invoice_date
                      ? new Date(invoice.invoice_date).toLocaleDateString()
                      : 'No date'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-white font-medium">
                    {formatCurrency(invoice.total_amount || 0)}
                  </p>
                  {invoice.balance_due > 0 && invoice.status !== 'paid' && (
                    <p className="text-yellow-400 text-sm">
                      Due: {formatCurrency(invoice.balance_due)}
                    </p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={STATUS_COLORS[invoice.status as InvoiceStatus]}
                >
                  {INVOICE_STATUS_LABELS[invoice.status as InvoiceStatus]}
                </Badge>
                <Link href={`/crm/invoices/${invoice.id}`}>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Link to all invoices */}
      {invoices.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <Link href="/crm/invoices">
            <Button variant="link" className="text-gray-400 hover:text-white p-0">
              View all invoices
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
