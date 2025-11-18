'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Search, Filter, Plus, MoreHorizontal, Calendar, DollarSign, Users, TrendingUp } from "lucide-react";
import { useRouter } from 'next/navigation';
import { crmRealtime } from '@/lib/realtime-crm';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  custom_id: string;
  customer_name: string;
  customer_email: string;
  current_stage: string | number;
  system_size_kw: number;
  estimated_cost: number;
  assigned_to: string;
  created_at: string;
  updated_at: string;
}

interface DashboardStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_value: number;
  monthly_revenue: number;
}

export const ProjectDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const router = useRouter();
  const { toast } = useToast();

  // Real-time project updates handler
  const handleProjectUpdate = useCallback((payload: Record<string, unknown>) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    setProjects(prevProjects => {
      switch (eventType) {
        case 'INSERT':
          // Add new project to list
          return [newRecord as Project, ...prevProjects];

        case 'UPDATE':
          // Update existing project
          return prevProjects.map(project =>
            project.id === (newRecord as Project).id ? { ...project, ...newRecord as Project } : project
          );

        case 'DELETE':
          // Remove deleted project
          return prevProjects.filter(project => project.id !== (oldRecord as Project).id);

        default:
          return prevProjects;
      }
    });

    // Show toast notification for updates
    const newProj = newRecord as Project;
    const oldProj = oldRecord as Project | undefined;
    if (eventType === 'UPDATE' && newProj.current_stage !== oldProj?.current_stage) {
      toast({
        title: 'Project Updated',
        description: `${newProj.customer_name}'s project moved to ${newProj.current_stage}`,
        duration: 3000,
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();

    // Set up real-time subscriptions
    crmRealtime.subscribeToProjects(handleProjectUpdate);

    // Cleanup subscriptions on unmount
    return () => {
      crmRealtime.disconnect();
    };
  }, [handleProjectUpdate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch projects and stats in parallel
      const [projectsResponse, statsResponse] = await Promise.all([
        fetch('/api/crm/projects'),
        fetch('/api/crm/stats')
      ]);

      if (projectsResponse.ok && statsResponse.ok) {
        const projectsData = await projectsResponse.json();
        const statsData = await statsResponse.json();

        setProjects(projectsData.data || []);
        setStats(statsData.data || null);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageColor = (stage: string | number): string => {
    const stageStr = String(stage);
    const stageColors: Record<string, string> = {
      'lead': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-yellow-100 text-yellow-800',
      'qualified': 'bg-purple-100 text-purple-800',
      'proposal_sent': 'bg-orange-100 text-orange-800',
      'contract_signed': 'bg-green-100 text-green-800',
      'permits_submitted': 'bg-indigo-100 text-indigo-800',
      'permits_approved': 'bg-cyan-100 text-cyan-800',
      'installation_scheduled': 'bg-pink-100 text-pink-800',
      'installation_complete': 'bg-emerald-100 text-emerald-800',
      'inspection_passed': 'bg-lime-100 text-lime-800',
      'pto_granted': 'bg-green-200 text-green-900'
    };
    return stageColors[stageStr] || 'bg-gray-100 text-gray-800';
  };

  const getStageProgress = (stage: string | number): number => {
    const stageStr = String(stage);
    const stageOrder = [
      'lead', 'contacted', 'qualified', 'proposal_sent', 'contract_signed',
      'permits_submitted', 'permits_approved', 'installation_scheduled',
      'installation_complete', 'inspection_passed', 'pto_granted'
    ];
    const index = stageOrder.indexOf(stageStr);
    return index >= 0 ? ((index + 1) / stageOrder.length) * 100 : 0;
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.custom_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'all' || String(project.current_stage) === stageFilter;
    return matchesSearch && matchesStage;
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Dashboard</h1>
          <p className="text-gray-600">Manage your solar installation projects</p>
        </div>
        <Button
          onClick={() => router.push('/crm/projects/new')}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_projects}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active_projects} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed_projects}</div>
              <p className="text-xs text-muted-foreground">
                Systems commissioned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.total_value)}</div>
              <p className="text-xs text-muted-foreground">
                Project portfolio value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.monthly_revenue)}</div>
              <p className="text-xs text-muted-foreground">
                This month's revenue
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search projects by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
            <SelectItem value="contract_signed">Contract Signed</SelectItem>
            <SelectItem value="permits_submitted">Permits Submitted</SelectItem>
            <SelectItem value="permits_approved">Permits Approved</SelectItem>
            <SelectItem value="installation_scheduled">Installation Scheduled</SelectItem>
            <SelectItem value="installation_complete">Installation Complete</SelectItem>
            <SelectItem value="inspection_passed">Inspection Passed</SelectItem>
            <SelectItem value="pto_granted">PTO Granted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
          <Card
            key={project.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/crm/projects/${project.id}`)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    {project.customer_name}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {project.custom_id}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Stage Badge */}
              <div className="flex justify-between items-center">
                <Badge className={getStageColor(project.current_stage)}>
                  {String(project.current_stage).replace(/_/g, ' ').toUpperCase()}
                </Badge>
                <span className="text-sm text-gray-600">
                  {project.system_size_kw}kW
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(getStageProgress(project.current_stage))}%</span>
                </div>
                <Progress value={getStageProgress(project.current_stage)} className="h-2" />
              </div>

              {/* Project Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Value:</span>
                  <span className="font-medium">{formatCurrency(project.estimated_cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No projects found</div>
          <p className="text-gray-600 mb-4">
            {searchTerm || stageFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first project'
            }
          </p>
          {!searchTerm && stageFilter === 'all' && (
            <Button onClick={() => router.push('/crm/projects/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Project
            </Button>
          )}
        </div>
      )}
    </div>
  );
};