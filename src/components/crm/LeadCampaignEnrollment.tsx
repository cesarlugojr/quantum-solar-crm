'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Plus, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  enrollLeadInCampaign,
  getLeadEnrollments,
  getActiveCampaigns,
  type CampaignEnrollment,
} from '@/app/crm/actions';
import type { Campaign } from '@/types/crm';

interface LeadCampaignEnrollmentProps {
  leadId: string;
  leadEmail: string | null;
}

export function LeadCampaignEnrollment({ leadId, leadEmail }: LeadCampaignEnrollmentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [enrollments, setEnrollments] = useState<(CampaignEnrollment & { campaign_name?: string })[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [leadId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [enrollmentsData, campaignsData] = await Promise.all([
        getLeadEnrollments(leadId),
        getActiveCampaigns(),
      ]);
      setEnrollments(enrollmentsData);
      setCampaigns(campaignsData);
    } catch (err) {
      console.error('Error loading enrollment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!selectedCampaign) return;

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await enrollLeadInCampaign(leadId, selectedCampaign, 'splash_leads');

      if (result.success) {
        setSuccess('Lead enrolled in campaign successfully!');
        setSelectedCampaign('');
        loadData();
        router.refresh();
      } else {
        setError(result.error || 'Failed to enroll lead');
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><Clock className="h-3 w-3 mr-1" />Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><AlertCircle className="h-3 w-3 mr-1" />Paused</Badge>;
      case 'unsubscribed':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />Unsubscribed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get campaigns not already enrolled in
  const availableCampaigns = campaigns.filter(
    campaign => !enrollments.some(e => e.campaign_id === campaign.id && e.status === 'active')
  );

  if (!leadEmail) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Mail className="h-5 w-5" />
          <span>No email address - cannot enroll in campaigns</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-400" />
          Email Campaigns
        </h3>
      </div>

      {/* Current Enrollments */}
      {loading ? (
        <div className="text-gray-400 text-sm">Loading enrollments...</div>
      ) : enrollments.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">Current Enrollments:</p>
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="flex items-center justify-between bg-gray-800/50 rounded p-3"
            >
              <div>
                <p className="text-white font-medium">{enrollment.campaign_name}</p>
                <p className="text-xs text-gray-400">
                  Step {enrollment.current_step} |
                  {enrollment.next_send_at
                    ? ` Next email: ${new Date(enrollment.next_send_at).toLocaleDateString()}`
                    : ' Campaign complete'}
                </p>
              </div>
              {getStatusBadge(enrollment.status)}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">Not enrolled in any campaigns</p>
      )}

      {/* Enroll in New Campaign */}
      {availableCampaigns.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-700">
          <p className="text-sm text-gray-400">Enroll in Campaign:</p>
          <div className="flex gap-2">
            <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
              <SelectTrigger className="flex-1 bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select a campaign" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {availableCampaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleEnroll}
              disabled={!selectedCampaign || isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              {isPending ? 'Enrolling...' : 'Enroll'}
            </Button>
          </div>
        </div>
      )}

      {availableCampaigns.length === 0 && campaigns.length > 0 && enrollments.length > 0 && (
        <p className="text-sm text-gray-500 pt-2 border-t border-gray-700">
          Lead is enrolled in all available campaigns
        </p>
      )}

      {campaigns.length === 0 && !loading && (
        <p className="text-sm text-gray-500 pt-2 border-t border-gray-700">
          No active campaigns available. Create campaigns in the Campaigns section.
        </p>
      )}

      {/* Messages */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-900/30 border border-green-500/50 text-green-300 px-3 py-2 rounded text-sm">
          {success}
        </div>
      )}
    </div>
  );
}
