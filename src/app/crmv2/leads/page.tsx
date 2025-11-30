import { Metadata } from 'next';
import { Suspense } from 'react';
import { Plus, Phone, Mail, MapPin } from 'lucide-react';
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
import Link from 'next/link';
import { getLeads } from '../actions';
import { formatCurrency, getLeadStatusColor, LEAD_STATUS_LABELS } from '@/types/crmv2';

export const metadata: Metadata = {
  title: 'Leads | Quantum Solar CRM v2',
  description: 'Manage solar leads with enhanced filtering and data tables',
};

async function LeadsTable() {
  const leads = await getLeads(100);

  if (!leads || leads.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-12 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">No Leads Found</h3>
        <p className="text-gray-400 mb-4">
          Leads will appear here when they come in from your website.
        </p>
        <Button className="bg-[#ff0000] hover:bg-[#cc0000] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Lead Manually
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700 hover:bg-gray-800/50">
            <TableHead className="text-gray-400">Name</TableHead>
            <TableHead className="text-gray-400">Contact</TableHead>
            <TableHead className="text-gray-400">Location</TableHead>
            <TableHead className="text-gray-400">Electric Bill</TableHead>
            <TableHead className="text-gray-400">Status</TableHead>
            <TableHead className="text-gray-400">Created</TableHead>
            <TableHead className="text-gray-400 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow
              key={lead.id}
              className="border-gray-700 hover:bg-gray-800/50"
            >
              <TableCell>
                <p className="font-medium text-white">{lead.name || `${lead.first_name} ${lead.last_name}`}</p>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {lead.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Mail className="h-3 w-3 text-gray-500" />
                      {lead.email}
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Phone className="h-3 w-3 text-gray-500" />
                      {lead.phone}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-gray-300">
                {lead.location || lead.city ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-gray-500" />
                    {lead.location || `${lead.city}, ${lead.state}`}
                  </div>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </TableCell>
              <TableCell className="text-gray-300">
                {lead.electric_bill ? (
                  formatCurrency(lead.electric_bill)
                ) : lead.average_monthly_bill ? (
                  formatCurrency(lead.average_monthly_bill)
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`${getLeadStatusColor(lead.status)} bg-opacity-20 border-current`}
                >
                  {LEAD_STATUS_LABELS[lead.status as keyof typeof LEAD_STATUS_LABELS] || lead.status || 'new'}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-400 text-sm">
                {new Date(lead.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/crmv2/leads/${lead.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Leads</h1>
          <p className="text-gray-400 mt-1">
            Manage and track all solar leads
          </p>
        </div>
        <Button className="bg-[#ff0000] hover:bg-[#cc0000] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add New Lead
        </Button>
      </div>

      {/* Leads Data Table */}
      <Suspense fallback={
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-12">
          <p className="text-center text-gray-400">Loading leads...</p>
        </div>
      }>
        <LeadsTable />
      </Suspense>
    </div>
  );
}
