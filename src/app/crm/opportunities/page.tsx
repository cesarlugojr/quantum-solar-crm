import { Metadata } from 'next';
import { Suspense } from 'react';
import { Plus, Target, Calendar, DollarSign, User } from 'lucide-react';
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
import { getOpportunities } from '../actions';
import { formatCurrency, OPPORTUNITY_STATUS_LABELS } from '@/types/crm';

export const metadata: Metadata = {
  title: 'Opportunities | Quantum Solar CRM',
  description: 'Manage solar opportunities and scheduled appointments',
};

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    appointment_scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    followup_needed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    followup_booked: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    sale: 'bg-green-500/20 text-green-400 border-green-500/30',
    opportunity_lost: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
}

async function OpportunitiesTable() {
  const opportunities = await getOpportunities();

  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-12 text-center">
        <Target className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Opportunities Yet</h3>
        <p className="text-gray-400 mb-4">
          Create opportunities from qualified leads to track appointments and sales.
        </p>
        <Button className="bg-[#ff0000] hover:bg-[#cc0000] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create First Opportunity
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700 hover:bg-gray-800/50">
            <TableHead className="text-gray-400">Customer</TableHead>
            <TableHead className="text-gray-400">Status</TableHead>
            <TableHead className="text-gray-400">Appointment</TableHead>
            <TableHead className="text-gray-400">System Size</TableHead>
            <TableHead className="text-gray-400">Proposal Amount</TableHead>
            <TableHead className="text-gray-400">Assigned To</TableHead>
            <TableHead className="text-gray-400 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {opportunities.map((opportunity) => (
            <TableRow
              key={opportunity.id}
              className="border-gray-700 hover:bg-gray-800/50"
            >
              <TableCell>
                <div>
                  <p className="font-medium text-white">{opportunity.customer_name}</p>
                  <p className="text-sm text-gray-400">{opportunity.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={getStatusColor(opportunity.status)}
                >
                  {OPPORTUNITY_STATUS_LABELS[opportunity.status] || opportunity.status}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-300">
                {opportunity.appointment_date ? (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    {new Date(opportunity.appointment_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                ) : (
                  <span className="text-gray-500">Not scheduled</span>
                )}
              </TableCell>
              <TableCell className="text-gray-300">
                {opportunity.system_size_kw ? (
                  `${opportunity.system_size_kw} kW`
                ) : (
                  <span className="text-gray-500">TBD</span>
                )}
              </TableCell>
              <TableCell className="text-gray-300">
                {opportunity.proposal_amount ? (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    {formatCurrency(opportunity.proposal_amount)}
                  </div>
                ) : (
                  <span className="text-gray-500">No proposal</span>
                )}
              </TableCell>
              <TableCell className="text-gray-300">
                {opportunity.assigned_to ? (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-300">Assigned</span>
                  </div>
                ) : (
                  <span className="text-gray-500">Unassigned</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/crm/opportunities/${opportunity.id}`}>
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

export default function OpportunitiesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Opportunities</h1>
          <p className="text-gray-400 mt-1">
            Track appointments and convert leads to projects
          </p>
        </div>
        <Button className="bg-[#ff0000] hover:bg-[#cc0000] text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Opportunity
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-400 text-sm font-medium">Scheduled</p>
          <p className="text-2xl font-bold text-white mt-1">-</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-400 text-sm font-medium">Follow-up Needed</p>
          <p className="text-2xl font-bold text-white mt-1">-</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <p className="text-purple-400 text-sm font-medium">Follow-up Booked</p>
          <p className="text-2xl font-bold text-white mt-1">-</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-green-400 text-sm font-medium">Sales</p>
          <p className="text-2xl font-bold text-white mt-1">-</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 text-sm font-medium">Lost</p>
          <p className="text-2xl font-bold text-white mt-1">-</p>
        </div>
      </div>

      {/* Opportunities Table */}
      <Suspense
        fallback={
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-12">
            <p className="text-center text-gray-400">Loading opportunities...</p>
          </div>
        }
      >
        <OpportunitiesTable />
      </Suspense>
    </div>
  );
}
