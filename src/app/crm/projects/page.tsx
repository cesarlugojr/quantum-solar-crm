import { Metadata } from 'next';
import { Suspense } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProjects } from '../actions';
import { ProjectsTable } from '@/components/crm/ProjectsTable';

export const metadata: Metadata = {
  title: 'Projects | Quantum Solar CRM',
  description: 'Manage solar installation projects with pipeline tracking',
};

async function ProjectsTableWrapper() {
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

  return <ProjectsTable projects={projects} />;
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
        <ProjectsTableWrapper />
      </Suspense>
    </div>
  );
}
