import { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Candidate Details | Quantum Solar CRM v2',
};

interface CandidateDetailPageProps {
  params: {
    id: string;
  };
}

export default function CandidateDetailPage({ params }: CandidateDetailPageProps) {
  const { id } = params;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/crmv2/candidates">
        <Button variant="ghost" className="text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Candidates
        </Button>
      </Link>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Candidate Details</h1>
          <p className="text-gray-400 mt-1">Candidate ID: {id}</p>
        </div>
      </div>

      {/* Candidate Detail Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Candidate Information</h2>
            <p className="text-gray-400">Candidate details will be implemented here</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Application Timeline</h2>
            <p className="text-gray-400">Application timeline will be implemented here</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Resume</h3>
            <p className="text-gray-400 text-sm">Resume viewer will be implemented here</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Interview Notes</h3>
            <p className="text-gray-400 text-sm">Interview notes will be implemented here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
