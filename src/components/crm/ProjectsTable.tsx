'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, DollarSign, Zap } from 'lucide-react';
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
import { formatCurrency, PROJECT_STAGE_LABELS, ProjectV2 } from '@/types/crm';
import { deleteProjects } from '@/app/crm/actions';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

interface ProjectsTableProps {
  projects: ProjectV2[];
}

function getStageColor(stage: number): string {
  if (stage <= 2) return 'text-gray-400 border-gray-500';
  if (stage <= 4) return 'text-blue-400 border-blue-500';
  if (stage <= 6) return 'text-yellow-400 border-yellow-500';
  if (stage <= 8) return 'text-orange-400 border-orange-500';
  if (stage <= 10) return 'text-purple-400 border-purple-500';
  return 'text-green-400 border-green-500';
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
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
    if (selectedIds.size === projects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(projects.map(p => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    startTransition(async () => {
      const result = await deleteProjects(ids);
      if (result.success) {
        setSelectedIds(new Set());
        router.refresh();
      } else {
        throw new Error(result.error || 'Failed to delete projects');
      }
    });
  };

  const selectedNames = projects
    .filter(p => selectedIds.has(p.id))
    .map(p => p.customer_name || 'Unknown');

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-white">
            {selectedIds.size} project{selectedIds.size !== 1 ? 's' : ''} selected
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
              title="Delete Selected Projects"
              description={`Are you sure you want to delete ${selectedIds.size} project${selectedIds.size !== 1 ? 's' : ''}?`}
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-800/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.size === projects.length && projects.length > 0}
                    onCheckedChange={toggleSelectAll}
                    className="border-gray-500"
                  />
                </TableHead>
                <TableHead className="text-gray-400">Customer</TableHead>
                <TableHead className="text-gray-400">Location</TableHead>
                <TableHead className="text-gray-400">System Size</TableHead>
                <TableHead className="text-gray-400">Revenue</TableHead>
                <TableHead className="text-gray-400">Stage</TableHead>
                <TableHead className="text-gray-400">Created</TableHead>
                <TableHead className="text-gray-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow
                  key={project.id}
                  className={`border-gray-700 hover:bg-gray-800/50 ${
                    selectedIds.has(project.id) ? 'bg-gray-800/30' : ''
                  }`}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(project.id)}
                      onCheckedChange={() => toggleSelect(project.id)}
                      className="border-gray-500"
                    />
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-white">
                      {project.customer_name || 'Unknown'}
                    </p>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {project.address ? (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-gray-500" />
                        <span className="truncate max-w-[200px]">
                          {project.address}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {project.system_size_kw ? (
                      <div className="flex items-center gap-2">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        {project.system_size_kw.toFixed(2)} kW
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {project.estimated_revenue ? (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3 w-3 text-green-500" />
                        {formatCurrency(project.estimated_revenue)}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${getStageColor(project.current_stage || 1)} bg-opacity-20 border-current`}
                    >
                      {PROJECT_STAGE_LABELS[project.current_stage as keyof typeof PROJECT_STAGE_LABELS] || `Stage ${project.current_stage || 1}`}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm whitespace-nowrap">
                    {project.created_at ? new Date(project.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/crm/projects/${project.id}`}>
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
    </div>
  );
}
