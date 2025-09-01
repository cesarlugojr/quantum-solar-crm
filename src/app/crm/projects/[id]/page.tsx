/**
 * Project Detail Page
 * 
 * Comprehensive project management view with:
 * - Project timeline and milestones
 * - Stage progression tracking
 * - Customer information
 * - Photo and document management
 * - Communication history
 */

"use client";

import { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Calendar, TrendingUp, Phone, Mail, User } from 'lucide-react';

interface Project {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  address: string;
  current_stage: number;
  system_size_kw: number;
  estimated_completion_date?: string;
  created_at: string;
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/crm/projects?id=${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      }
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const getReadableStage = (stage: number): string => {
    const stageNames: { [key: number]: string } = {
      1: 'Notice to Proceed',
      2: 'Site Survey & Engineering',
      3: 'Permit Application', 
      4: 'Permit Approval',
      5: 'Material Procurement',
      6: 'Installation Scheduling',
      7: 'Installation Start',
      8: 'Installation Complete',
      9: 'Electrical Inspection',
      10: 'Utility Interconnection',
      11: 'System Commissioning',
      12: 'PTO Approval'
    };
    return stageNames[stage] || 'Unknown Stage';
  };

  const getStatusColor = (stage: number): string => {
    if (stage <= 2) return 'bg-blue-500';
    if (stage <= 4) return 'bg-yellow-500';
    if (stage <= 8) return 'bg-orange-500';
    if (stage <= 11) return 'bg-purple-500';
    return 'bg-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading project details...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-4xl mx-auto">
          <Button 
            onClick={() => router.push('/crm')}
            variant="outline" 
            className="mb-6 border-gray-600 text-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CRM
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Project Not Found</h1>
            <p className="text-gray-400">The requested project could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button 
          onClick={() => router.push('/crm')}
          variant="outline" 
          className="mb-6 border-gray-600 text-gray-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to CRM
        </Button>

        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{project.customer_name}</h1>
              <div className="flex items-center text-gray-400 text-lg">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{project.address}</span>
              </div>
            </div>
            <Badge className={`${getStatusColor(project.current_stage || 1)} text-white px-4 py-2 text-lg`}>
              {getReadableStage(project.current_stage || 1)}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Project Overview */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-300">
                    <TrendingUp className="h-5 w-5 mr-3 text-yellow-400" />
                    <span className="font-medium">System Size:</span>
                    <span className="ml-2">{project.system_size_kw || 'Unknown'} kW</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Calendar className="h-5 w-5 mr-3 text-blue-400" />
                    <span className="font-medium">Created:</span>
                    <span className="ml-2">{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                  {project.estimated_completion_date && (
                    <div className="flex items-center text-gray-300">
                      <Calendar className="h-5 w-5 mr-3 text-green-400" />
                      <span className="font-medium">Est. Completion:</span>
                      <span className="ml-2">{new Date(project.estimated_completion_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {project.customer_email && (
                    <div className="flex items-center text-gray-300">
                      <Mail className="h-5 w-5 mr-3 text-purple-400" />
                      <span className="font-medium">Email:</span>
                      <span className="ml-2">{project.customer_email}</span>
                    </div>
                  )}
                  {project.customer_phone && (
                    <div className="flex items-center text-gray-300">
                      <Phone className="h-5 w-5 mr-3 text-green-400" />
                      <span className="font-medium">Phone:</span>
                      <span className="ml-2">{project.customer_phone}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-300">
                    <User className="h-5 w-5 mr-3 text-[#ff0000]" />
                    <span className="font-medium">Project ID:</span>
                    <span className="ml-2 font-mono text-sm">{project.id ? `${project.id.slice(0, 8)}...` : 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Actions */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Project Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-[#ff0000] hover:bg-[#cc0000]">
                  Update Stage
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  Add Photos
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  Send Update
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  View Timeline
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Coming Soon Features */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400">
                <ul className="space-y-2">
                  <li>• Project timeline visualization</li>
                  <li>• Photo gallery management</li>
                  <li>• Document attachments</li>
                  <li>• Customer communication history</li>
                </ul>
                <ul className="space-y-2">
                  <li>• Progress tracking charts</li>
                  <li>• Automated notifications</li>
                  <li>• Installation scheduling</li>
                  <li>• Financial tracking</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
