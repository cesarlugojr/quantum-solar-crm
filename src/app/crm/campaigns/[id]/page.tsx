import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, Users, Play, Pause, CheckCircle, UserCheck, UserX } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCampaignById, getCampaignEnrollments, getCampaignStats } from '../../actions';
import { EmailSequenceCard } from '@/components/crm/EmailSequenceCard';

export const metadata: Metadata = {
  title: 'Campaign Details | Quantum Solar CRM',
};

// Force dynamic rendering - this page fetches data by ID
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

interface CampaignDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { id } = await params;
  const [campaign, enrollments, stats] = await Promise.all([
    getCampaignById(id),
    getCampaignEnrollments(id),
    getCampaignStats(id),
  ]);

  if (!campaign) {
    notFound();
  }

  const sequences = campaign.sequences || [];

  // Helper function to get step label
  const getStepLabel = (currentStep: number): string => {
    if (sequences.length === 0) return `Email ${currentStep}`;
    const sequence = sequences.find((s: any) => s.sequence_order === currentStep) as any;
    return sequence?.subject || `Email ${currentStep}`;
  };

  // Helper function to get status color and icon
  const getEnrollmentStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'text-green-400', bgColor: 'bg-green-500/20', label: 'Active' };
      case 'paused':
        return { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', label: 'Paused' };
      case 'completed':
        return { color: 'text-blue-400', bgColor: 'bg-blue-500/20', label: 'Completed' };
      case 'unsubscribed':
        return { color: 'text-red-400', bgColor: 'bg-red-500/20', label: 'Unsubscribed' };
      case 'bounced':
        return { color: 'text-orange-400', bgColor: 'bg-orange-500/20', label: 'Bounced' };
      default:
        return { color: 'text-gray-400', bgColor: 'bg-gray-500/20', label: status };
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/crm/campaigns">
        <Button variant="ghost" className="text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
      </Link>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{campaign.name}</h1>
          {campaign.description && (
            <p className="text-gray-400 mt-1">{campaign.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={`${campaign.active ? 'text-green-400 border-green-500 bg-green-500/20' : 'text-gray-400 border-gray-500 bg-gray-500/20'} text-lg px-4 py-2`}
          >
            {campaign.active ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                Active
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Paused
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-blue-400" />
            <p className="text-gray-400 text-sm">Total Enrolled</p>
          </div>
          <p className="text-2xl font-bold text-white">{stats.total_enrolled}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="h-5 w-5 text-green-400" />
            <p className="text-gray-400 text-sm">Active</p>
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.active}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-blue-400" />
            <p className="text-gray-400 text-sm">Completed</p>
          </div>
          <p className="text-2xl font-bold text-blue-400">{stats.completed}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <UserX className="h-5 w-5 text-red-400" />
            <p className="text-gray-400 text-sm">Unsubscribed</p>
          </div>
          <p className="text-2xl font-bold text-red-400">{stats.unsubscribed}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-5 w-5 text-purple-400" />
            <p className="text-gray-400 text-sm">Email Steps</p>
          </div>
          <p className="text-2xl font-bold text-white">{sequences.length}</p>
        </div>
      </div>

      {/* Campaign Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Email Sequences */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Email Sequences</h2>

            {sequences.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No email sequences configured yet</p>
                <p className="text-sm text-gray-500 mt-1">Add email sequences to start your drip campaign</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sequences
                  .sort((a: any, b: any) => (a.sequence_order || 0) - (b.sequence_order || 0))
                  .map((sequence: any, index: number) => (
                    <EmailSequenceCard
                      key={sequence.id}
                      sequence={sequence}
                      index={index}
                      totalSequences={sequences.length}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Campaign Settings */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Campaign Settings</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p className={`text-white font-medium ${campaign.active ? 'text-green-400' : 'text-gray-400'}`}>
                  {campaign.active ? 'Active' : 'Paused'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Trigger Type</p>
                <p className="text-white capitalize">{campaign.trigger_type?.replace('_', ' ') || 'Manual'}</p>
              </div>
              {(campaign as any).target_status && (
                <div>
                  <p className="text-sm text-gray-400">Target Status</p>
                  <p className="text-white capitalize">{(campaign as any).target_status.replace('_', ' ')}</p>
                </div>
              )}
              {(campaign as any).target_lead_type && (
                <div>
                  <p className="text-sm text-gray-400">Target Lead Type</p>
                  <p className="text-white">{(campaign as any).target_lead_type}</p>
                </div>
              )}
            </div>
          </div>

          {/* Campaign Details */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Campaign Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Campaign ID</p>
                <p className="text-white text-sm font-mono">{campaign.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Created</p>
                <p className="text-white">
                  {new Date(campaign.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {campaign.updated_at && (
                <div>
                  <p className="text-sm text-gray-400">Last Updated</p>
                  <p className="text-white">
                    {new Date(campaign.updated_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Leads Section */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-400" />
          Enrolled Leads ({enrollments.length})
        </h2>

        {enrollments.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No leads enrolled in this campaign yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Leads will appear here once they are enrolled in this campaign
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Lead</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Current Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Progress</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Last Sent</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Next Send</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => {
                  const statusInfo = getEnrollmentStatusInfo(enrollment.status);
                  const progress = sequences.length > 0
                    ? Math.round((enrollment.current_step / sequences.length) * 100)
                    : 0;

                  return (
                    <tr
                      key={enrollment.id}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Link
                          href={`/crm/leads/${enrollment.lead_id}`}
                          className="text-white hover:text-blue-400 font-medium"
                        >
                          {enrollment.lead_name || 'Unknown'}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-300 text-sm">{enrollment.email_address}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={`${statusInfo.color} ${statusInfo.bgColor} border-current`}
                        >
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">
                            #{enrollment.current_step}
                          </span>
                          <span className="text-gray-500 text-sm truncate max-w-[150px]">
                            {getStepLabel(enrollment.current_step)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">
                            {enrollment.current_step}/{sequences.length}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {enrollment.last_sent_at ? (
                          <span className="text-gray-400 text-sm">
                            {new Date(enrollment.last_sent_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-sm">Not yet</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {enrollment.status === 'active' && enrollment.next_send_at ? (
                          <span className="text-green-400 text-sm">
                            {new Date(enrollment.next_send_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        ) : enrollment.status === 'completed' ? (
                          <span className="text-blue-400 text-sm flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Done
                          </span>
                        ) : enrollment.status === 'unsubscribed' ? (
                          <span className="text-red-400 text-sm">Unsubscribed</span>
                        ) : enrollment.status === 'paused' ? (
                          <span className="text-yellow-400 text-sm">Paused</span>
                        ) : (
                          <span className="text-gray-600 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
