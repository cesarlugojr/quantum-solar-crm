import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User, Home, Zap, DollarSign, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getLeadById } from '../../actions';
import { getLeadStatusColor, LEAD_STATUS_LABELS } from '@/types/crm';

export const metadata: Metadata = {
  title: 'Lead Details | Quantum Solar CRM',
};

interface LeadDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

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
          <h1 className="text-3xl font-bold text-white">{lead.name || 'Unknown Lead'}</h1>
          <p className="text-gray-400 mt-1">
            Lead created {new Date(lead.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`${getLeadStatusColor(lead.status)} bg-opacity-20 border-current text-lg px-4 py-2`}
        >
          {LEAD_STATUS_LABELS[lead.status as keyof typeof LEAD_STATUS_LABELS] || lead.status || 'New'}
        </Badge>
      </div>

      {/* Lead Detail Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lead.email && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <a href={`mailto:${lead.email}`} className="text-white hover:text-blue-400">
                      {lead.email}
                    </a>
                  </div>
                </div>
              )}

              {lead.phone && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Phone className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <a href={`tel:${lead.phone}`} className="text-white hover:text-green-400">
                      {lead.phone}
                    </a>
                  </div>
                </div>
              )}

              {(lead.address || lead.city) && (
                <div className="flex items-center gap-3 md:col-span-2">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <MapPin className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Address</p>
                    <p className="text-white">
                      {lead.address && <span>{lead.address}<br /></span>}
                      {lead.city && `${lead.city}, `}
                      {lead.state && `${lead.state} `}
                      {lead.zip_code}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Solar Information */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Solar Assessment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lead.utility_company && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Zap className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Utility Company</p>
                    <p className="text-white">{lead.utility_company}</p>
                  </div>
                </div>
              )}

              {(lead.average_monthly_bill || lead.electric_bill) && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Monthly Electric Bill</p>
                    <p className="text-white">
                      ${lead.average_monthly_bill || lead.electric_bill}
                    </p>
                  </div>
                </div>
              )}

              {lead.homeowner_status && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Home className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Homeowner Status</p>
                    <p className="text-white capitalize">{lead.homeowner_status}</p>
                  </div>
                </div>
              )}

              {lead.credit_score && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <CreditCard className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Credit Score</p>
                    <p className="text-white capitalize">{lead.credit_score}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Notes</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="block">
                  <Button variant="outline" className="w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-800">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </a>
              )}
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className="block">
                  <Button variant="outline" className="w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-800">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Lead
                  </Button>
                </a>
              )}
              <Button variant="outline" className="w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-800">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>
          </div>

          {/* Lead Details */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Lead Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Lead ID</p>
                <p className="text-white text-sm font-mono">{lead.id}</p>
              </div>
              {lead.session_id && (
                <div>
                  <p className="text-sm text-gray-400">Session ID</p>
                  <p className="text-white text-sm font-mono truncate">{lead.session_id}</p>
                </div>
              )}
              {lead.source_campaign && (
                <div>
                  <p className="text-sm text-gray-400">Source Campaign</p>
                  <p className="text-white">{lead.source_campaign}</p>
                </div>
              )}
              {lead.assigned_to && (
                <div>
                  <p className="text-sm text-gray-400">Assigned To</p>
                  <p className="text-white">{lead.assigned_to}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-400">Created</p>
                <p className="text-white">
                  {new Date(lead.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {lead.updated_at && (
                <div>
                  <p className="text-sm text-gray-400">Last Updated</p>
                  <p className="text-white">
                    {new Date(lead.updated_at).toLocaleString('en-US', {
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
