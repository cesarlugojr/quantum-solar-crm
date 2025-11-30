import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Project Details | Quantum Solar CRM v2',
};

interface ProjectDetailPageProps {
  params: {
    id: string;
  };
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = params;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/crmv2/projects">
        <Button variant="ghost" className="text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </Link>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Project Details</h1>
          <p className="text-gray-400 mt-1">Project ID: {id}</p>
        </div>
      </div>

      {/* Project Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <p className="text-gray-400 text-sm">System Size</p>
          <p className="text-2xl font-bold text-white mt-2">-- kW</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Revenue Type</p>
          <p className="text-2xl font-bold text-white mt-2">--</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Estimated Value</p>
          <p className="text-2xl font-bold text-white mt-2">$--</p>
        </div>
      </div>

      {/* Project Detail Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Project Information</h2>
            <p className="text-gray-400">Project details and editing form will be implemented here</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Pipeline Timeline</h2>
            <p className="text-gray-400">12-stage pipeline timeline will be implemented here</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Milestone Payments</h2>
            <p className="text-gray-400">Milestone payment tracker will be implemented here</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Documents</h3>
            <p className="text-gray-400 text-sm">Document attachments will be implemented here</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Installation Crew</h3>
            <p className="text-gray-400 text-sm">Crew assignment will be implemented here</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Photo Gallery</h3>
            <p className="text-gray-400 text-sm">Site photos will be implemented here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
