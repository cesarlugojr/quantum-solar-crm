import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, Clock, Users, Play, Pause, Calendar, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCampaignById } from '../../actions';

export const metadata: Metadata = {
  title: 'Campaign Details | Quantum Solar CRM',
};

interface CampaignDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { id } = await params;
  const campaign = await getCampaignById(id);

  if (!campaign) {
    notFound();
  }

  const sequences = campaign.sequences || [];

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-5 w-5 text-blue-400" />
            <p className="text-gray-400 text-sm">Email Sequences</p>
          </div>
          <p className="text-2xl font-bold text-white">{sequences.length}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-green-400" />
            <p className="text-gray-400 text-sm">Trigger Type</p>
          </div>
          <p className="text-2xl font-bold text-white capitalize">
            {campaign.trigger_type?.replace('_', ' ') || 'Manual'}
          </p>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-yellow-400" />
            <p className="text-gray-400 text-sm">Total Duration</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {sequences.reduce((total: number, seq: any) => total + (seq.delay_days || 0), 0)} days
          </p>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            <p className="text-gray-400 text-sm">Created</p>
          </div>
          <p className="text-lg font-bold text-white">
            {new Date(campaign.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
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
                    <div
                      key={sequence.id}
                      className="border border-gray-700 rounded-lg p-4 hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <span className="text-blue-400 font-bold">{index + 1}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-white font-medium truncate">
                              {sequence.subject || `Email ${index + 1}`}
                            </h3>
                            {sequence.active !== false && (
                              <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {sequence.delay_days || 0} days after{' '}
                              {index === 0 ? 'enrollment' : 'previous email'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Send className="h-4 w-4" />
                              Sequence #{sequence.sequence_order || index + 1}
                            </span>
                          </div>
                          {sequence.email_templates && (
                            <div className="mt-2">
                              <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                                Template: {sequence.email_templates.name || 'Custom'}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
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
    </div>
  );
}
