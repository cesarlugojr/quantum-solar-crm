'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  FileText,
  Search,
  Filter,
  MoreHorizontal,
  Send,
  DollarSign,
  Download,
  Trash2,
  Eye,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Invoice, InvoiceStatus } from '@/types/crm';
import { INVOICE_STATUS_LABELS, formatCurrency } from '@/types/crm';

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  sent: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  viewed: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  partial: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  paid: 'bg-green-500/20 text-green-300 border-green-500/30',
  overdue: 'bg-red-500/20 text-red-300 border-red-500/30',
  void: 'bg-gray-400/20 text-gray-400 border-gray-400/30',
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/crm/invoices?${params.toString()}`);
      const data = await response.json();

      if (data.invoices) {
        setInvoices(data.invoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleAction = async (invoiceId: string, action: string) => {
    try {
      if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this draft invoice?')) {
          return;
        }
        await fetch(`/api/crm/invoices?id=${invoiceId}`, { method: 'DELETE' });
      } else {
        await fetch('/api/crm/invoices', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: invoiceId, action }),
        });
      }
      fetchInvoices();
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  // Filter invoices by search query
  const filteredInvoices = invoices.filter((invoice) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      invoice.invoice_number?.toString().includes(query) ||
      invoice.gpin?.toLowerCase().includes(query) ||
      invoice.project_name?.toLowerCase().includes(query) ||
      invoice.client?.company_name?.toLowerCase().includes(query)
    );
  });

  // Calculate summary stats
  const stats = {
    total: filteredInvoices.length,
    draft: filteredInvoices.filter((i) => i.status === 'draft').length,
    sent: filteredInvoices.filter((i) => i.status === 'sent').length,
    paid: filteredInvoices.filter((i) => i.status === 'paid').length,
    outstanding: filteredInvoices
      .filter((i) => ['sent', 'partial', 'overdue'].includes(i.status))
      .reduce((sum, i) => sum + (i.balance_due || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Invoices</h1>
          <p className="text-gray-400 mt-1">
            Generate and manage invoices for GoodPWR and other clients
          </p>
        </div>
        <Link href="/crm/invoices/new">
          <Button className="bg-[#ff0000] hover:bg-[#cc0000] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Invoices</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-500" />
          </div>
        </div>
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Draft</p>
              <p className="text-2xl font-bold text-white">{stats.draft}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-500/20 flex items-center justify-center">
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Paid</p>
              <p className="text-2xl font-bold text-green-400">{stats.paid}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Outstanding</p>
              <p className="text-2xl font-bold text-yellow-400">
                {formatCurrency(stats.outstanding)}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by invoice #, GPIN, or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700 text-white">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="partial">Partially Paid</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="void">Void</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <p className="text-gray-400">Loading invoices...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Invoices Found</h3>
            <p className="text-gray-400 mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'No invoices match your filters.'
                : 'Create your first invoice to get started.'}
            </p>
            <Link href="/crm/invoices/new">
              <Button className="bg-[#ff0000] hover:bg-[#cc0000] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-800/50">
                <TableHead className="text-gray-400">Invoice #</TableHead>
                <TableHead className="text-gray-400">Client</TableHead>
                <TableHead className="text-gray-400">GPIN / Project</TableHead>
                <TableHead className="text-gray-400">Date</TableHead>
                <TableHead className="text-gray-400">Amount</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  className="border-gray-700 hover:bg-gray-800/50"
                >
                  <TableCell className="font-mono text-white">
                    #{invoice.invoice_number}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {invoice.client?.company_name || invoice.client?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div>
                      {invoice.gpin && (
                        <span className="text-white font-medium">{invoice.gpin}</span>
                      )}
                      {invoice.project_name && (
                        <p className="text-gray-400 text-sm truncate max-w-[200px]">
                          {invoice.project_name}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {invoice.invoice_date
                      ? new Date(invoice.invoice_date).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="text-white font-medium">
                        {formatCurrency(invoice.total_amount || 0)}
                      </span>
                      {invoice.balance_due > 0 && invoice.balance_due !== invoice.total_amount && (
                        <p className="text-yellow-400 text-sm">
                          Due: {formatCurrency(invoice.balance_due)}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={STATUS_COLORS[invoice.status as InvoiceStatus]}
                    >
                      {INVOICE_STATUS_LABELS[invoice.status as InvoiceStatus] || invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                        <Link href={`/crm/invoices/${invoice.id}`}>
                          <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-gray-800">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-gray-800">
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-700" />
                        {invoice.status === 'draft' && (
                          <DropdownMenuItem
                            onClick={() => handleAction(invoice.id, 'mark_sent')}
                            className="text-blue-400 focus:text-blue-300 focus:bg-gray-800"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Mark as Sent
                          </DropdownMenuItem>
                        )}
                        {['sent', 'partial', 'overdue'].includes(invoice.status) && (
                          <DropdownMenuItem
                            onClick={() => handleAction(invoice.id, 'mark_paid')}
                            className="text-green-400 focus:text-green-300 focus:bg-gray-800"
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Record Payment
                          </DropdownMenuItem>
                        )}
                        {invoice.status !== 'void' && invoice.status !== 'paid' && (
                          <DropdownMenuItem
                            onClick={() => handleAction(invoice.id, 'void')}
                            className="text-gray-400 focus:text-gray-300 focus:bg-gray-800"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Void Invoice
                          </DropdownMenuItem>
                        )}
                        {invoice.status === 'draft' && (
                          <>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            <DropdownMenuItem
                              onClick={() => handleAction(invoice.id, 'delete')}
                              className="text-red-400 focus:text-red-300 focus:bg-gray-800"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
