import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Lead Details | Quantum Solar CRM',
};

interface LeadDetailPageProps {
  params: {
    id: string;
  };
}

export default function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = params;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/crm/leads">
        <Button variant="ghost" className="text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Leads
        </Button>
      </Link>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Lead Details</h1>
          <p className="text-gray-400 mt-1">Lead ID: {id}</p>
        </div>
      </div>

      {/* Lead Detail Content - Will be implemented */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Lead Information</h2>
            <p className="text-gray-400">Lead details and editing form will be implemented here</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Activity Timeline</h2>
            <p className="text-gray-400">Activity timeline will be implemented here</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
            <p className="text-gray-400 text-sm">Quick action buttons will be implemented here</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Notes</h3>
            <p className="text-gray-400 text-sm">Notes section will be implemented here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
