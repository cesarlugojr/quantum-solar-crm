'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { Switch } from '@/components/ui/switch';

interface Campaign {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  active: boolean;
  created_at: string;
  sequences?: unknown[];
  stats?: {
    totalEnrollments: number;
    activeEnrollments: number;
  };
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/crm/campaigns');
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCampaignActive = async (campaignId: string, currentActive: boolean) => {
    try {
      const response = await fetch('/api/crm/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: campaignId,
          active: !currentActive
        })
      });

      const data = await response.json();

      if (data.error) {
        alert('Error updating campaign: ' + data.error);
      } else {
        // Update local state
        setCampaigns(campaigns.map(c =>
          c.id === campaignId ? { ...c, active: !currentActive } : c
        ));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert('Error: ' + message);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading campaigns: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="text-gray-600 mt-2">Manage automated email drip campaigns</p>
        </div>
        <Button asChild>
          <Link href="/crm/campaigns/new">Create Campaign</Link>
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">No campaigns created yet</p>
          <Button asChild>
            <Link href="/crm/campaigns/new">Create Your First Campaign</Link>
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Trigger Type</TableHead>
                <TableHead>Emails</TableHead>
                <TableHead>Enrollments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{campaign.name}</p>
                      <p className="text-sm text-gray-500">{campaign.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {campaign.trigger_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {campaign.sequences?.length || 0} emails
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">{campaign.stats?.totalEnrollments || 0} total</p>
                      <p className="text-gray-500">{campaign.stats?.activeEnrollments || 0} active</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={campaign.active}
                        onCheckedChange={() => toggleCampaignActive(campaign.id, campaign.active)}
                      />
                      <span className="text-sm text-gray-600">
                        {campaign.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/crm/campaigns/${campaign.id}`}>
                          Edit
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/crm/campaigns/${campaign.id}/analytics`}>
                          Analytics
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
