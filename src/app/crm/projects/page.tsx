"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Download, Eye, Edit, MapPin, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  custom_id: string;
  customer_name: string;
  customer_email: string;
  address: string;
  system_size_kw: number;
  project_value: number;
  current_stage: number;
  overall_status: string;
  assigned_project_manager: string;
  assigned_installer: string;
  estimated_completion_date: string;
  created_at: string;
}

const PROJECT_STAGES = [
  'Site Survey',
  'Design',
  'Permits',
  'Approval',
  'Scheduling',
  'Installation',
  'Inspection',
  'Commissioning',
  'PTO Submission',
  'PTO Approval',
  'System Activation'
];

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/crm/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchTerm === '' ||
      project.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.custom_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || project.overall_status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-blue-500';
      case 'on_hold':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCurrentStage = (stageNumber: number) => {
    return PROJECT_STAGES[stageNumber - 1] || 'Unknown';
  };

  const getStageProgress = (stageNumber: number) => {
    return Math.round((stageNumber / PROJECT_STAGES.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 mt-2">Track solar installation projects</p>
        </div>
        <Button
          onClick={() => router.push('/crm/projects/new')}
          className="bg-[#ff0000] hover:bg-[#cc0000] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-900 p-4 rounded-lg">
        <div className="flex flex-1 items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff0000]"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff0000]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Total Projects</h3>
          <p className="text-2xl font-bold text-white mt-2">{projects.length}</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Active</h3>
          <p className="text-2xl font-bold text-blue-400 mt-2">
            {projects.filter(p => p.overall_status === 'active').length}
          </p>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Completed</h3>
          <p className="text-2xl font-bold text-green-400 mt-2">
            {projects.filter(p => p.overall_status === 'completed').length}
          </p>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Total Value</h3>
          <p className="text-2xl font-bold text-yellow-400 mt-2">
            ${projects.reduce((sum, p) => sum + (p.project_value || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-gray-400 py-8">
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-8">
            No projects found
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div key={project.id} className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{project.custom_id}</h3>
                  <p className="text-gray-300">{project.customer_name}</p>
                </div>
                <Badge className={`${getStatusColor(project.overall_status)} text-white`}>
                  {project.overall_status}
                </Badge>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  {project.address}
                </div>

                <div className="flex items-center text-sm text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  Due: {project.estimated_completion_date ?
                    new Date(project.estimated_completion_date).toLocaleDateString() :
                    'TBD'
                  }
                </div>

                <div className="text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-gray-300">{getStageProgress(project.current_stage)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-[#ff0000] h-2 rounded-full"
                      style={{ width: `${getStageProgress(project.current_stage)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Stage {project.current_stage}: {getCurrentStage(project.current_stage)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-400">System Size</p>
                  <p className="text-white font-medium">{project.system_size_kw} kW</p>
                </div>
                <div>
                  <p className="text-gray-400">Value</p>
                  <p className="text-white font-medium">
                    ${project.project_value?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-400">
                  PM: {project.assigned_project_manager || 'Unassigned'}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/crm/projects/${project.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/crm/projects/${project.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}