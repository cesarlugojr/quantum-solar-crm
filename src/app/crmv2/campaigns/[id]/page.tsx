import { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Campaign Details | Quantum Solar CRM v2',
};

interface CampaignDetailPageProps {
  params: {
    id: string;
  };
}

export default function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { id } = params;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/crmv2/campaigns">
        <Button variant="ghost" className="text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
      </Link>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Campaign Details</h1>
          <p className="text-gray-400 mt-1">Campaign ID: {id}</p>
        </div>
      </div>

      {/* Campaign Detail Content */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Campaign Configuration</h2>
        <p className="text-gray-400">Campaign details and email sequences will be implemented here</p>
      </div>
    </div>
  );
}
