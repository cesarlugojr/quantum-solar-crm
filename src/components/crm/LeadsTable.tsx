'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Mail, Calculator, FileText } from 'lucide-react';
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
import { formatCurrency, getLeadStatusColor, LEAD_STATUS_LABELS, LeadV2 } from '@/types/crm';
import { deleteLeads } from '@/app/crm/actions';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

interface LeadsTableProps {
  leads: LeadV2[];
}

// Helper to determine lead source type
function getLeadSourceInfo(lead: LeadV2): { type: 'calculator' | 'splash'; label: string; color: string } {
  const formType = (lead as any).form_type || '';
  const source = (lead as any).source || '';

  if (formType.includes('calculator') || source.includes('calculator')) {
    return { type: 'calculator', label: 'Calculator', color: 'text-purple-400 bg-purple-500/20 border-purple-500' };
  }
  return { type: 'splash', label: 'Splash', color: 'text-blue-400 bg-blue-500/20 border-blue-500' };
}

export function LeadsTable({ leads }: LeadsTableProps) {
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
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map(l => l.id)));
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    startTransition(async () => {
      const result = await deleteLeads(ids);
      if (result.success) {
        setSelectedIds(new Set());
        router.refresh();
      } else {
        throw new Error(result.error || 'Failed to delete leads');
      }
    });
  };

  const selectedLeadNames = leads
    .filter(l => selectedIds.has(l.id))
    .map(l => l.name || `${l.first_name} ${l.last_name}`.trim() || 'Unknown');

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-white">
            {selectedIds.size} lead{selectedIds.size !== 1 ? 's' : ''} selected
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
              title="Delete Selected Leads"
              description={`Are you sure you want to delete ${selectedIds.size} lead${selectedIds.size !== 1 ? 's' : ''}?`}
              itemCount={selectedIds.size}
              itemNames={selectedLeadNames}
              onConfirm={handleBulkDelete}
              variant="destructive"
              disabled={isPending}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-800/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.size === leads.length && leads.length > 0}
                    onCheckedChange={toggleSelectAll}
                    className="border-gray-500"
                  />
                </TableHead>
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400">Source</TableHead>
                <TableHead className="text-gray-400">Contact</TableHead>
                <TableHead className="text-gray-400">Street Address</TableHead>
                <TableHead className="text-gray-400">City</TableHead>
                <TableHead className="text-gray-400">State</TableHead>
                <TableHead className="text-gray-400">ZIP</TableHead>
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
                  className={`border-gray-700 hover:bg-gray-800/50 ${
                    selectedIds.has(lead.id) ? 'bg-gray-800/30' : ''
                  }`}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(lead.id)}
                      onCheckedChange={() => toggleSelect(lead.id)}
                      className="border-gray-500"
                    />
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-white">{lead.name || `${lead.first_name} ${lead.last_name}`}</p>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const sourceInfo = getLeadSourceInfo(lead);
                      return (
                        <Badge
                          variant="outline"
                          className={`${sourceInfo.color} text-xs`}
                        >
                          {sourceInfo.type === 'calculator' ? (
                            <Calculator className="h-3 w-3 mr-1" />
                          ) : (
                            <FileText className="h-3 w-3 mr-1" />
                          )}
                          {sourceInfo.label}
                        </Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {lead.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Mail className="h-3 w-3 text-gray-500" />
                          <span className="truncate max-w-[180px]">{lead.email}</span>
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
                    {lead.street_address || lead.address ? (
                      <span className="truncate max-w-[200px] block">
                        {lead.street_address || lead.address}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {lead.city || <span className="text-gray-500">-</span>}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {lead.state || <span className="text-gray-500">-</span>}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {lead.zip_code || <span className="text-gray-500">-</span>}
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
                  <TableCell className="text-gray-400 text-sm whitespace-nowrap">
                    {new Date(lead.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/crm/leads/${lead.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
                        >
                          View
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
