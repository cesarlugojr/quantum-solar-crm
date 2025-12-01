import { Metadata } from 'next';
import { Suspense } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getLeads } from '../actions';
import { LeadsTable } from '@/components/crm/LeadsTable';

export const metadata: Metadata = {
  title: 'Leads | Quantum Solar CRM',
  description: 'Manage solar leads with enhanced filtering and data tables',
};

async function LeadsTableWrapper() {
  const leads = await getLeads(100);

  if (!leads || leads.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-12 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">No Leads Found</h3>
        <p className="text-gray-400 mb-4">
          Leads will appear here when they come in from your website.
        </p>
        <Button className="bg-[#ff0000] hover:bg-[#cc0000] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Lead Manually
        </Button>
      </div>
    );
  }

  return <LeadsTable leads={leads} />;
}

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Leads</h1>
          <p className="text-gray-400 mt-1">
            Manage and track all solar leads
          </p>
        </div>
        <Button className="bg-[#ff0000] hover:bg-[#cc0000] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add New Lead
        </Button>
      </div>

      {/* Leads Data Table */}
      <Suspense fallback={
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-12">
          <p className="text-center text-gray-400">Loading leads...</p>
        </div>
      }>
        <LeadsTableWrapper />
      </Suspense>
    </div>
  );
}
