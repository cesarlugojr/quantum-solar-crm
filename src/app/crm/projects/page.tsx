import { Metadata } from 'next';
import { Suspense } from 'react';
import { Plus, MapPin, DollarSign, Zap } from 'lucide-react';
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
import { getProjects } from '../actions';
import { formatCurrency, PROJECT_STAGE_LABELS } from '@/types/crm';

export const metadata: Metadata = {
  title: 'Projects | Quantum Solar CRM',
  description: 'Manage solar installation projects with pipeline tracking',
};

function getStageColor(stage: number): string {
  if (stage <= 2) return 'text-gray-400 border-gray-500';
  if (stage <= 4) return 'text-blue-400 border-blue-500';
  if (stage <= 6) return 'text-yellow-400 border-yellow-500';
  if (stage <= 8) return 'text-orange-400 border-orange-500';
  if (stage <= 10) return 'text-purple-400 border-purple-500';
  return 'text-green-400 border-green-500';
}

async function ProjectsTable() {
  const projects = await getProjects(100);

  if (!projects || projects.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-12 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">No Projects Found</h3>
        <p className="text-gray-400 mb-4">
          Projects will appear here when leads are converted.
        </p>
        <Button className="bg-[#ff0000] hover:bg-[#cc0000] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Project Manually
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
              className="border-gray-700 hover:bg-gray-800/50"
            >
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
              <TableCell className="text-gray-400 text-sm">
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
  );
}

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 mt-1">
            Track solar installation projects through the pipeline
          </p>
        </div>
        <Button className="bg-[#ff0000] hover:bg-[#cc0000] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add New Project
        </Button>
      </div>

      {/* Projects Data Table */}
      <Suspense fallback={
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-12">
          <p className="text-center text-gray-400">Loading projects...</p>
        </div>
      }>
        <ProjectsTable />
      </Suspense>
    </div>
  );
}
