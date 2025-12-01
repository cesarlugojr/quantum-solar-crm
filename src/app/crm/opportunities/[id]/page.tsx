import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  User,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getOpportunityById } from '../../actions';
import {
  formatCurrency,
  OPPORTUNITY_STATUS_LABELS,
  OPPORTUNITY_LOST_REASON_LABELS,
  OpportunityLostReason,
} from '@/types/crm';
import { ConvertOpportunityToProjectButton } from '@/components/crm/ConversionButtons';

export const metadata: Metadata = {
  title: 'Opportunity Details | Quantum Solar CRM',
  description: 'View and manage opportunity details',
};

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    appointment_scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    followup_needed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    followup_booked: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    sale: 'bg-green-500/20 text-green-400 border-green-500/30',
    opportunity_lost: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const opportunity = await getOpportunityById(id);

  if (!opportunity) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <Link href="/crm/opportunities">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Opportunities
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{opportunity.customer_name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge
              variant="outline"
              className={getStatusColor(opportunity.status)}
            >
              {OPPORTUNITY_STATUS_LABELS[opportunity.status] || opportunity.status}
            </Badge>
            {opportunity.lost_reason && (
              <span className="text-gray-400 text-sm">
                Reason: {OPPORTUNITY_LOST_REASON_LABELS[opportunity.lost_reason as OpportunityLostReason] || opportunity.lost_reason}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
            Edit
          </Button>
          {opportunity.status !== 'sale' && opportunity.status !== 'opportunity_lost' && (
            <>
              <ConvertOpportunityToProjectButton
                opportunityId={opportunity.id}
                customerName={opportunity.customer_name}
                existingProjectId={opportunity.project_id || undefined}
              />
              <Button variant="destructive">
                <XCircle className="h-4 w-4 mr-2" />
                Mark as Lost
              </Button>
            </>
          )}
          {opportunity.status === 'sale' && opportunity.project_id && (
            <Link href={`/crm/projects/${opportunity.project_id}`}>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                View Project
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white">{opportunity.email || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-400">Phone</p>
                <p className="text-white">{opportunity.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-400">Address</p>
                <p className="text-white">
                  {opportunity.address || 'Not provided'}
                  {opportunity.city && `, ${opportunity.city}`}
                  {opportunity.state && `, ${opportunity.state}`}
                  {opportunity.zip_code && ` ${opportunity.zip_code}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Appointment Details</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-400">Appointment Date</p>
                <p className="text-white">
                  {opportunity.appointment_date
                    ? new Date(opportunity.appointment_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : 'Not scheduled'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-400">Appointment Type</p>
                <p className="text-white capitalize">
                  {opportunity.appointment_type?.replace('_', ' ') || 'Initial'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-400">Assigned To</p>
                <p className="text-white">{opportunity.assigned_to || 'Unassigned'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Solar Assessment */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Solar Assessment</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-400">System Size</p>
                <p className="text-white">
                  {opportunity.system_size_kw ? `${opportunity.system_size_kw} kW` : 'TBD'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-400">Proposal Amount</p>
                <p className="text-white">
                  {opportunity.proposal_amount
                    ? formatCurrency(opportunity.proposal_amount)
                    : 'No proposal'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-400">Monthly Bill</p>
                <p className="text-white">
                  {opportunity.average_monthly_bill
                    ? formatCurrency(opportunity.average_monthly_bill)
                    : 'Not provided'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm text-gray-400">Estimated Savings</p>
                <p className="text-white">
                  {opportunity.estimated_monthly_savings
                    ? `${formatCurrency(opportunity.estimated_monthly_savings)}/mo`
                    : 'TBD'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Notes</h2>
        <div className="prose prose-invert max-w-none">
          {opportunity.notes ? (
            <p className="text-gray-300">{opportunity.notes}</p>
          ) : (
            <p className="text-gray-500 italic">No notes added yet.</p>
          )}
        </div>
      </div>

      {/* Appointment Notes */}
      {opportunity.appointment_notes && (
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Appointment Notes</h2>
          <p className="text-gray-300">{opportunity.appointment_notes}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Record Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Created</p>
            <p className="text-white">
              {new Date(opportunity.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Last Updated</p>
            <p className="text-white">
              {opportunity.updated_at
                ? new Date(opportunity.updated_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Never'}
            </p>
          </div>
          {opportunity.lead_id && (
            <div>
              <p className="text-gray-400">Source Lead</p>
              <Link
                href={`/crm/leads/${opportunity.lead_id}`}
                className="text-blue-400 hover:underline"
              >
                View Lead
              </Link>
            </div>
          )}
          {opportunity.project_id && (
            <div>
              <p className="text-gray-400">Converted Project</p>
              <Link
                href={`/crm/projects/${opportunity.project_id}`}
                className="text-green-400 hover:underline"
              >
                View Project
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
