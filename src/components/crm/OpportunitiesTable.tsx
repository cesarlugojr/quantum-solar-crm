'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, DollarSign, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { formatCurrency, OPPORTUNITY_STATUS_LABELS, OpportunityV2 } from '@/types/crm';
import { deleteOpportunities } from '@/app/crm/actions';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

interface OpportunitiesTableProps {
  opportunities: OpportunityV2[];
}

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

export function OpportunitiesTable({ opportunities }: OpportunitiesTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === opportunities.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(opportunities.map(o => o.id)));
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    startTransition(async () => {
      const result = await deleteOpportunities(ids);
      if (result.success) {
        setSelectedIds(new Set());
        router.refresh();
      } else {
        throw new Error(result.error || 'Failed to delete opportunities');
      }
    });
  };

  const selectedNames = opportunities
    .filter(o => selectedIds.has(o.id))
    .map(o => o.customer_name || 'Unknown');

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-white">
            {selectedIds.size} opportunit{selectedIds.size !== 1 ? 'ies' : 'y'} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Clear Selection
            </Button>
            <DeleteConfirmationDialog
              title="Delete Selected Opportunities"
              description={`Are you sure you want to delete ${selectedIds.size} opportunit${selectedIds.size !== 1 ? 'ies' : 'y'}?`}
              itemCount={selectedIds.size}
              itemNames={selectedNames}
              onConfirm={handleBulkDelete}
              variant="destructive"
              disabled={isPending}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700 hover:bg-gray-800/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.size === opportunities.length && opportunities.length > 0}
                  onCheckedChange={toggleSelectAll}
                  className="border-gray-500"
                />
              </TableHead>
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
                className={`border-gray-700 hover:bg-gray-800/50 ${
                  selectedIds.has(opportunity.id) ? 'bg-gray-800/30' : ''
                }`}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(opportunity.id)}
                    onCheckedChange={() => toggleSelect(opportunity.id)}
                    className="border-gray-500"
                  />
                </TableCell>
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
    </div>
  );
}
