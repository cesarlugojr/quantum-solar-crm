import { Metadata } from 'next';
import { Suspense } from 'react';
import { Plus, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOpportunities } from '../actions';
import { OpportunitiesTable } from '@/components/crm/OpportunitiesTable';

export const metadata: Metadata = {
  title: 'Opportunities | Quantum Solar CRM',
  description: 'Manage solar opportunities and scheduled appointments',
};

async function OpportunitiesTableWrapper() {
  const opportunities = await getOpportunities();

  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-12 text-center">
        <Target className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Opportunities Yet</h3>
        <p className="text-gray-400 mb-4">
          Create opportunities from qualified leads to track appointments and sales.
        </p>
        <Button className="bg-[#ff0000] hover:bg-[#cc0000] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create First Opportunity
        </Button>
      </div>
    );
  }

  return <OpportunitiesTable opportunities={opportunities} />;
}

export default function OpportunitiesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Opportunities</h1>
          <p className="text-gray-400 mt-1">
            Track appointments and convert leads to projects
          </p>
        </div>
        <Button className="bg-[#ff0000] hover:bg-[#cc0000] text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Opportunity
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-400 text-sm font-medium">Scheduled</p>
          <p className="text-2xl font-bold text-white mt-1">-</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-400 text-sm font-medium">Follow-up Needed</p>
          <p className="text-2xl font-bold text-white mt-1">-</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <p className="text-purple-400 text-sm font-medium">Follow-up Booked</p>
          <p className="text-2xl font-bold text-white mt-1">-</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-green-400 text-sm font-medium">Sales</p>
          <p className="text-2xl font-bold text-white mt-1">-</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 text-sm font-medium">Lost</p>
          <p className="text-2xl font-bold text-white mt-1">-</p>
        </div>
      </div>

      {/* Opportunities Table */}
      <Suspense
        fallback={
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-12">
            <p className="text-center text-gray-400">Loading opportunities...</p>
          </div>
        }
      >
        <OpportunitiesTableWrapper />
      </Suspense>
    </div>
  );
}
