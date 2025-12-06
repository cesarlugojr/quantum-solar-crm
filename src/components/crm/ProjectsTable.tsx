'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, DollarSign, Zap, TrendingUp, TrendingDown, Search, ChevronUp, ChevronDown, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { calculateQuickProfitability, getMarginColor } from '@/lib/profitability';

interface ProjectsTableProps {
  projects: ProjectV2[];
}

type SortColumn = 'customer' | 'address' | 'city' | 'state' | 'system_size' | 'profit' | 'margin' | 'stage' | 'created';
type SortDirection = 'asc' | 'desc';

function getStageColor(stage: number): string {
  if (stage === 13) return 'text-red-400 border-red-500'; // Issue
  if (stage === 14) return 'text-gray-500 border-gray-600'; // Canceled
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

  // Search, filter, and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [profitabilityFilter, setProfitabilityFilter] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<SortColumn>('created');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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
    if (selectedIds.size === filteredAndSortedProjects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedProjects.map(p => p.id)));
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

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ChevronsUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc'
      ? <ChevronUp className="h-3 w-3 ml-1" />
      : <ChevronDown className="h-3 w-3 ml-1" />;
  };

  // Compute profitability for all projects once
  const projectsWithProfitability = useMemo(() => {
    return projects.map(project => ({
      project,
      profitability: calculateQuickProfitability(project)
    }));
  }, [projects]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let result = projectsWithProfitability;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(({ project }) => {
        return (
          (project.customer_name?.toLowerCase() || '').includes(query) ||
          (project.address?.toLowerCase() || '').includes(query) ||
          (project.city?.toLowerCase() || '').includes(query) ||
          (project.state?.toLowerCase() || '').includes(query)
        );
      });
    }

    // Apply stage filter
    if (stageFilter !== 'all') {
      const stage = parseInt(stageFilter, 10);
      result = result.filter(({ project }) => project.current_stage === stage);
    }

    // Apply profitability filter
    if (profitabilityFilter !== 'all') {
      result = result.filter(({ profitability }) => {
        switch (profitabilityFilter) {
          case 'profitable':
            return profitability.profit > 0;
          case 'unprofitable':
            return profitability.profit <= 0;
          case 'high-margin':
            return profitability.margin >= 20;
          case 'low-margin':
            return profitability.margin > 0 && profitability.margin < 10;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case 'customer':
          comparison = (a.project.customer_name || '').localeCompare(b.project.customer_name || '');
          break;
        case 'address':
          comparison = (a.project.address || '').localeCompare(b.project.address || '');
          break;
        case 'city':
          comparison = (a.project.city || '').localeCompare(b.project.city || '');
          break;
        case 'state':
          comparison = (a.project.state || '').localeCompare(b.project.state || '');
          break;
        case 'system_size':
          comparison = (a.project.system_size_kw || 0) - (b.project.system_size_kw || 0);
          break;
        case 'profit':
          comparison = a.profitability.profit - b.profitability.profit;
          break;
        case 'margin':
          comparison = a.profitability.margin - b.profitability.margin;
          break;
        case 'stage':
          comparison = (a.project.current_stage || 0) - (b.project.current_stage || 0);
          break;
        case 'created':
          comparison = new Date(a.project.created_at || 0).getTime() - new Date(b.project.created_at || 0).getTime();
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result.map(({ project }) => project);
  }, [projectsWithProfitability, searchQuery, stageFilter, profitabilityFilter, sortColumn, sortDirection]);

  const selectedNames = filteredAndSortedProjects
    .filter(p => selectedIds.has(p.id))
    .map(p => p.customer_name || 'Unknown');

  const clearFilters = () => {
    setSearchQuery('');
    setStageFilter('all');
    setProfitabilityFilter('all');
  };

  const hasActiveFilters = searchQuery || stageFilter !== 'all' || profitabilityFilter !== 'all';

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by customer, address, city, or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-600 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Stage Filter */}
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-gray-900 border-gray-600 text-white">
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="all" className="text-white hover:bg-gray-800">All Stages</SelectItem>
              {Object.entries(PROJECT_STAGE_LABELS).map(([stage, label]) => (
                <SelectItem key={stage} value={stage} className="text-white hover:bg-gray-800">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Profitability Filter */}
          <Select value={profitabilityFilter} onValueChange={setProfitabilityFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-gray-900 border-gray-600 text-white">
              <SelectValue placeholder="Filter by profit" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="all" className="text-white hover:bg-gray-800">All Projects</SelectItem>
              <SelectItem value="profitable" className="text-green-400 hover:bg-gray-800">Profitable</SelectItem>
              <SelectItem value="unprofitable" className="text-red-400 hover:bg-gray-800">Unprofitable</SelectItem>
              <SelectItem value="high-margin" className="text-green-400 hover:bg-gray-800">High Margin (20%+)</SelectItem>
              <SelectItem value="low-margin" className="text-orange-400 hover:bg-gray-800">Low Margin (&lt;10%)</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-400">
          Showing {filteredAndSortedProjects.length} of {projects.length} projects
          {hasActiveFilters && ' (filtered)'}
        </div>
      </div>

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
                    checked={selectedIds.size === filteredAndSortedProjects.length && filteredAndSortedProjects.length > 0}
                    onCheckedChange={toggleSelectAll}
                    className="border-gray-500"
                  />
                </TableHead>
                <TableHead
                  className="text-gray-400 cursor-pointer hover:text-white select-none"
                  onClick={() => handleSort('customer')}
                >
                  <div className="flex items-center">
                    Customer
                    <SortIcon column="customer" />
                  </div>
                </TableHead>
                <TableHead
                  className="text-gray-400 cursor-pointer hover:text-white select-none"
                  onClick={() => handleSort('address')}
                >
                  <div className="flex items-center">
                    Street Address
                    <SortIcon column="address" />
                  </div>
                </TableHead>
                <TableHead
                  className="text-gray-400 cursor-pointer hover:text-white select-none"
                  onClick={() => handleSort('city')}
                >
                  <div className="flex items-center">
                    City
                    <SortIcon column="city" />
                  </div>
                </TableHead>
                <TableHead
                  className="text-gray-400 cursor-pointer hover:text-white select-none"
                  onClick={() => handleSort('state')}
                >
                  <div className="flex items-center">
                    State
                    <SortIcon column="state" />
                  </div>
                </TableHead>
                <TableHead
                  className="text-gray-400 cursor-pointer hover:text-white select-none"
                  onClick={() => handleSort('system_size')}
                >
                  <div className="flex items-center">
                    System Size
                    <SortIcon column="system_size" />
                  </div>
                </TableHead>
                <TableHead
                  className="text-gray-400 cursor-pointer hover:text-white select-none"
                  onClick={() => handleSort('margin')}
                >
                  <div className="flex items-center">
                    Profitability
                    <SortIcon column="margin" />
                  </div>
                </TableHead>
                <TableHead
                  className="text-gray-400 cursor-pointer hover:text-white select-none"
                  onClick={() => handleSort('stage')}
                >
                  <div className="flex items-center">
                    Stage
                    <SortIcon column="stage" />
                  </div>
                </TableHead>
                <TableHead
                  className="text-gray-400 cursor-pointer hover:text-white select-none"
                  onClick={() => handleSort('created')}
                >
                  <div className="flex items-center">
                    Created
                    <SortIcon column="created" />
                  </div>
                </TableHead>
                <TableHead className="text-gray-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                    {hasActiveFilters
                      ? 'No projects match your filters. Try adjusting your search or filters.'
                      : 'No projects found.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedProjects.map((project) => {
                  const profitability = calculateQuickProfitability(project);
                  const marginColor = getMarginColor(profitability.margin);

                  return (
                    <TableRow
                      key={project.id}
                      className={`border-gray-700 hover:bg-gray-800/50 cursor-pointer ${
                        selectedIds.has(project.id) ? 'bg-gray-800/30' : ''
                      }`}
                      onClick={(e) => {
                        // Don't navigate if clicking on checkbox or button
                        if ((e.target as HTMLElement).closest('input, button')) return;
                        router.push(`/crm/projects/${project.id}`);
                      }}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
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
                            <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
                            <span className="text-white truncate max-w-[180px]">
                              {project.address}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {project.city ? (
                          <span className="text-white">{project.city}</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {project.state ? (
                          <span className="text-white">{project.state}</span>
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
                      <TableCell>
                        {project.system_size_kw && project.system_size_kw > 0 ? (
                          <div className="flex flex-col text-sm">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-green-500" />
                              <span className="text-white">{formatCurrency(profitability.revenue)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {profitability.profit >= 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-400" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-red-400" />
                              )}
                              <span className={marginColor}>
                                {formatCurrency(profitability.profit)} ({profitability.margin.toFixed(1)}%)
                              </span>
                            </div>
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
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
