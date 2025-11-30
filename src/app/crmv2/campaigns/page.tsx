import { Metadata } from 'next';
import { Suspense } from 'react';
import { Plus, Mail, Clock, Users, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { getCampaigns } from '../actions';

export const metadata: Metadata = {
  title: 'Campaigns | Quantum Solar CRM v2',
  description: 'Manage email drip campaigns and automation',
};

function getTriggerLabel(trigger: string): string {
  const labels: Record<string, string> = {
    'lead_created': 'New Lead',
    'status_change': 'Status Change',
    'manual': 'Manual',
    'time_based': 'Scheduled',
  };
  return labels[trigger] || trigger;
}

async function CampaignsTable() {
  const campaigns = await getCampaigns();

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-12 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">No Campaigns Found</h3>
        <p className="text-gray-400 mb-4">
          Create your first email drip campaign to automate lead nurturing.
        </p>
        <Button className="bg-[#ff0000] hover:bg-[#cc0000] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700 hover:bg-gray-800/50">
            <TableHead className="text-gray-400">Campaign Name</TableHead>
            <TableHead className="text-gray-400">Trigger</TableHead>
            <TableHead className="text-gray-400">Emails</TableHead>
            <TableHead className="text-gray-400">Status</TableHead>
            <TableHead className="text-gray-400">Created</TableHead>
            <TableHead className="text-gray-400 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow
              key={campaign.id}
              className="border-gray-700 hover:bg-gray-800/50"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{campaign.name}</p>
                    {campaign.description && (
                      <p className="text-sm text-gray-500 truncate max-w-[200px]">
                        {campaign.description}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-gray-300">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-gray-500" />
                  {getTriggerLabel(campaign.trigger_type)}
                </div>
              </TableCell>
              <TableCell className="text-gray-300">
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-gray-500" />
                  {campaign.sequences?.length || 0} emails
                </div>
              </TableCell>
              <TableCell>
                {campaign.active ? (
                  <Badge
                    variant="outline"
                    className="text-green-400 border-green-500 bg-green-500/10"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-gray-400 border-gray-500 bg-gray-500/10"
                  >
                    <Pause className="h-3 w-3 mr-1" />
                    Paused
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-gray-400 text-sm">
                {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }) : '-'}
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/crmv2/campaigns/${campaign.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    Edit
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Email Campaigns</h1>
          <p className="text-gray-400 mt-1">
            Manage automated email drip campaigns
          </p>
        </div>
        <Button className="bg-[#ff0000] hover:bg-[#cc0000] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Campaigns Data Table */}
      <Suspense fallback={
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-12">
          <p className="text-center text-gray-400">Loading campaigns...</p>
        </div>
      }>
        <CampaignsTable />
      </Suspense>
    </div>
  );
}
