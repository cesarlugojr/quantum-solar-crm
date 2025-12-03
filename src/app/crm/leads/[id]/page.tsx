import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, User, Home, Zap, DollarSign,
  CreditCard, Clock, FileText, Globe, Building, Sun, Briefcase,
  MessageSquare, Target, CheckCircle, XCircle, TrendingUp, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getLeadById, getOpportunityIdForLead } from '../../actions';
import { getLeadStatusColor, LEAD_STATUS_LABELS, CONTACTED_DETAIL_LABELS, LEAD_LOST_REASON_LABELS } from '@/types/crm';
import { ConvertLeadToOpportunityButton } from '@/components/crm/ConversionButtons';
import { EditLeadDialog } from '@/components/crm/EditLeadDialog';
import { LeadCampaignEnrollment } from '@/components/crm/LeadCampaignEnrollment';
import { DeleteRecordButton } from '@/components/crm/DeleteRecordButton';

export const metadata: Metadata = {
  title: 'Lead Details | Quantum Solar CRM',
};

// Force dynamic rendering - this page fetches data by ID
export const dynamic = 'force-dynamic';

interface LeadDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Helper to build Google Maps Static API URL for satellite view
function getSatelliteMapUrl(address: string, city?: string, state?: string, zipCode?: string): string | null {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  const fullAddress = [address, city, state, zipCode].filter(Boolean).join(', ');
  if (!fullAddress) return null;

  const encodedAddress = encodeURIComponent(fullAddress);
  return `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=19&size=600x400&maptype=satellite&markers=color:red%7C${encodedAddress}&key=${apiKey}`;
}

// Helper component for displaying field values
function FieldDisplay({ label, value, icon: Icon }: { label: string; value: string | number | boolean | null | undefined; icon?: React.ElementType }) {
  if (value === null || value === undefined || value === '') return null;

  const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);

  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="p-2 bg-gray-700/50 rounded-lg mt-0.5">
          <Icon className="h-4 w-4 text-gray-400" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-white break-words">{displayValue}</p>
      </div>
    </div>
  );
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const [lead, existingOpportunityId] = await Promise.all([
    getLeadById(id),
    getOpportunityIdForLead(id),
  ]);

  if (!lead) {
    notFound();
  }

  // Get full address for map
  const streetAddress = lead.street_address || lead.address;
  const satelliteMapUrl = getSatelliteMapUrl(streetAddress || '', lead.city, lead.state, lead.zip_code);

  // Get status detail label
  const getStatusDetailLabel = (detail: string | undefined) => {
    if (!detail) return null;
    return CONTACTED_DETAIL_LABELS[detail as keyof typeof CONTACTED_DETAIL_LABELS] ||
           LEAD_LOST_REASON_LABELS[detail as keyof typeof LEAD_LOST_REASON_LABELS] ||
           detail;
  };

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
      <div className="flex items-center justify-between flex-wrap gap-4">
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
        <div className="flex items-center gap-3">
          <EditLeadDialog lead={lead} />
          <Badge
            variant="outline"
            className={`${getLeadStatusColor(lead.status)} bg-opacity-20 border-current text-lg px-4 py-2`}
          >
            {LEAD_STATUS_LABELS[lead.status as keyof typeof LEAD_STATUS_LABELS] || lead.status || 'New'}
          </Badge>
          {lead.status_detail && (
            <Badge variant="outline" className="text-gray-300 border-gray-600">
              {getStatusDetailLabel(lead.status_detail)}
            </Badge>
          )}
        </div>
      </div>

      {/* Lead Detail Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Satellite Map */}
          {satelliteMapUrl && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-400" />
                  Property Location
                </h2>
              </div>
              <div className="relative w-full h-[300px]">
                <Image
                  src={satelliteMapUrl}
                  alt={`Satellite view of ${streetAddress}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-4 bg-gray-800/50">
                <p className="text-gray-300 text-sm">
                  {streetAddress && <span>{streetAddress}<br /></span>}
                  {lead.city && `${lead.city}, `}
                  {lead.state && `${lead.state} `}
                  {lead.zip_code}
                </p>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-400" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldDisplay label="First Name" value={lead.first_name} icon={User} />
              <FieldDisplay label="Last Name" value={lead.last_name} icon={User} />
              {lead.email && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg mt-0.5">
                    <Mail className="h-4 w-4 text-blue-400" />
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
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg mt-0.5">
                    <Phone className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <a href={`tel:${lead.phone}`} className="text-white hover:text-green-400">
                      {lead.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          {(streetAddress || lead.city || lead.state || lead.zip_code) && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-400" />
                Address Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldDisplay label="Street Address" value={streetAddress} icon={Home} />
                <FieldDisplay label="City" value={lead.city} icon={Building} />
                <FieldDisplay label="State" value={lead.state} icon={MapPin} />
                <FieldDisplay label="ZIP Code" value={lead.zip_code} icon={MapPin} />
                <FieldDisplay label="County" value={lead.county} icon={MapPin} />
              </div>
            </div>
          )}

          {/* Solar Assessment & Qualification */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Sun className="h-5 w-5 text-yellow-400" />
              Solar Assessment & Qualification
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldDisplay label="Utility Company" value={lead.utility_company} icon={Zap} />
              <FieldDisplay
                label="Monthly Electric Bill"
                value={lead.average_monthly_bill || lead.electric_bill ? `$${lead.average_monthly_bill || lead.electric_bill}` : undefined}
                icon={DollarSign}
              />
              <FieldDisplay label="Homeowner Status" value={lead.homeowner_status} icon={Home} />
              <FieldDisplay label="Credit Score" value={lead.credit_score} icon={CreditCard} />
              <FieldDisplay label="Shading" value={lead.shading_concerns} icon={Sun} />
              <FieldDisplay label="Qualification Status" value={lead.qualification_status} icon={CheckCircle} />
              <FieldDisplay label="Lead Score" value={lead.lead_score} icon={TrendingUp} />
              <FieldDisplay label="Existing Solar" value={lead.existing_solar} icon={Sun} />
              <FieldDisplay label="HOA Restrictions" value={lead.hoa_restrictions} icon={AlertCircle} />
            </div>
          </div>

          {/* Property Details */}
          {(lead.roof_condition || lead.roof_material || lead.home_square_footage || lead.property_type) && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Home className="h-5 w-5 text-orange-400" />
                Property Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldDisplay label="Property Type" value={lead.property_type} icon={Building} />
                <FieldDisplay label="Roof Condition" value={lead.roof_condition} icon={Home} />
                <FieldDisplay label="Roof Material" value={lead.roof_material} icon={Home} />
                <FieldDisplay label="Home Square Footage" value={lead.home_square_footage ? `${lead.home_square_footage} sq ft` : undefined} icon={Home} />
                <FieldDisplay label="Energy Usage Pattern" value={lead.energy_usage_pattern} icon={Zap} />
              </div>
            </div>
          )}

          {/* Preferences & Timeline */}
          {(lead.financing_preference || lead.timeline_preference || lead.preferred_contact_time || lead.how_heard_about_us) && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-green-400" />
                Preferences & Timeline
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldDisplay label="Financing Preference" value={lead.financing_preference} icon={DollarSign} />
                <FieldDisplay label="Timeline Preference" value={lead.timeline_preference} icon={Calendar} />
                <FieldDisplay label="Preferred Contact Time" value={lead.preferred_contact_time} icon={Clock} />
                <FieldDisplay label="How Heard About Us" value={lead.how_heard_about_us} icon={MessageSquare} />
              </div>
            </div>
          )}

          {/* Lead Tracking & Attribution */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-cyan-400" />
              Lead Tracking & Attribution
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldDisplay label="Source" value={lead.source} icon={Globe} />
              <FieldDisplay label="Form Type" value={lead.form_type} icon={FileText} />
              <FieldDisplay label="Form Variant" value={lead.form_variant} icon={FileText} />
              <FieldDisplay label="UTM Source" value={lead.utm_source} icon={Target} />
              <FieldDisplay label="UTM Medium" value={lead.utm_medium} icon={Target} />
              <FieldDisplay label="UTM Campaign" value={lead.utm_campaign} icon={Target} />
              <FieldDisplay label="IP Address" value={lead.ip_address} icon={Globe} />
              <FieldDisplay label="User Agent" value={lead.user_agent} icon={Globe} />
            </div>
          </div>

          {/* Status & Campaign Information */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-400" />
              Status & Campaign Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldDisplay label="Status" value={LEAD_STATUS_LABELS[lead.status as keyof typeof LEAD_STATUS_LABELS] || lead.status} icon={CheckCircle} />
              <FieldDisplay label="Status Detail" value={getStatusDetailLabel(lead.status_detail)} icon={FileText} />
              <FieldDisplay label="Drip Campaign Status" value={lead.drip_campaign_status} icon={Mail} />
              <FieldDisplay label="Lost Reason" value={lead.lost_reason ? LEAD_LOST_REASON_LABELS[lead.lost_reason as keyof typeof LEAD_LOST_REASON_LABELS] || lead.lost_reason : undefined} icon={XCircle} />
              {lead.last_contacted_at && (
                <FieldDisplay
                  label="Last Contacted"
                  value={new Date(lead.last_contacted_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                  icon={Clock}
                />
              )}
              {lead.appointment_date && (
                <FieldDisplay
                  label="Appointment Date"
                  value={new Date(lead.appointment_date).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                  icon={Calendar}
                />
              )}
              {lead.follow_up_date && (
                <FieldDisplay
                  label="Follow-up Date"
                  value={new Date(lead.follow_up_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  icon={Calendar}
                />
              )}
            </div>
          </div>

          {/* Notes & Additional Information */}
          {(lead.notes || lead.additional_notes) && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                Notes & Additional Information
              </h2>
              {lead.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Notes</p>
                  <p className="text-gray-300 whitespace-pre-wrap bg-gray-800/50 p-4 rounded-lg">{lead.notes}</p>
                </div>
              )}
              {lead.additional_notes && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Additional Notes</p>
                  <p className="text-gray-300 whitespace-pre-wrap bg-gray-800/50 p-4 rounded-lg">{lead.additional_notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {/* Convert to Opportunity */}
              <ConvertLeadToOpportunityButton
                leadId={lead.id}
                leadName={lead.name || 'this lead'}
                existingOpportunityId={existingOpportunityId || undefined}
              />

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
              {satelliteMapUrl && streetAddress && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([streetAddress, lead.city, lead.state, lead.zip_code].filter(Boolean).join(', '))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-800">
                    <MapPin className="h-4 w-4 mr-2" />
                    View on Google Maps
                  </Button>
                </a>
              )}

              {/* Delete Lead */}
              <div className="pt-3 border-t border-gray-700">
                <DeleteRecordButton
                  recordId={lead.id}
                  recordName={lead.name || 'Unknown Lead'}
                  recordType="lead"
                  redirectPath="/crm/leads"
                />
              </div>
            </div>
          </div>

          {/* Email Campaign Enrollment */}
          <LeadCampaignEnrollment leadId={lead.id} leadEmail={lead.email} />

          {/* Lead Metadata */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Lead Metadata</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Lead ID</p>
                <p className="text-white text-sm font-mono break-all">{lead.id}</p>
              </div>
              {lead.session_id && (
                <div>
                  <p className="text-sm text-gray-400">Session ID</p>
                  <p className="text-white text-sm font-mono break-all">{lead.session_id}</p>
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
                <p className="text-sm text-gray-400">Is Partial</p>
                <p className="text-white">{lead.is_partial ? 'Yes' : 'No'}</p>
              </div>
              {lead.current_step !== undefined && lead.current_step !== null && (
                <div>
                  <p className="text-sm text-gray-400">Current Step</p>
                  <p className="text-white">{lead.current_step}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Timestamps</h3>
            <div className="space-y-3">
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
              {lead.completed_at && (
                <div>
                  <p className="text-sm text-gray-400">Completed</p>
                  <p className="text-white">
                    {new Date(lead.completed_at).toLocaleString('en-US', {
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

          {/* Status History */}
          {lead.status_history && lead.status_history.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-white mb-4">Status History</h3>
              <div className="space-y-3">
                {lead.status_history.map((entry, index) => (
                  <div key={index} className="border-l-2 border-gray-600 pl-3">
                    <p className="text-sm text-gray-400">
                      {new Date(entry.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-white text-sm">
                      {entry.previous_status} → {entry.new_status}
                    </p>
                    {entry.notes && (
                      <p className="text-gray-400 text-sm">{entry.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
