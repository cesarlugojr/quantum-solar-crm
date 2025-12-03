import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, FileText, User, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCandidateById } from '../../actions';

export const metadata: Metadata = {
  title: 'Candidate Details | Quantum Solar CRM',
};

// Force dynamic rendering - this page fetches data by ID
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

interface CandidateDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const CANDIDATE_STATUS_LABELS: Record<string, string> = {
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer Extended',
  hired: 'Hired',
  rejected: 'Rejected',
};

const CANDIDATE_STATUS_COLORS: Record<string, string> = {
  applied: 'text-blue-400',
  screening: 'text-yellow-400',
  interview: 'text-purple-400',
  offer: 'text-green-400',
  hired: 'text-emerald-400',
  rejected: 'text-red-400',
};

export default async function CandidateDetailPage({ params }: CandidateDetailPageProps) {
  const { id } = await params;
  const candidateData = await getCandidateById(id);

  if (!candidateData) {
    notFound();
  }

  // Cast to any to handle dynamic fields from job_applications table
  const candidate = candidateData as any;
  const statusLabel = CANDIDATE_STATUS_LABELS[candidate.status] || candidate.status;
  const statusColor = CANDIDATE_STATUS_COLORS[candidate.status] || 'text-gray-400';

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/crm/candidates">
        <Button variant="ghost" className="text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Candidates
        </Button>
      </Link>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{candidate.name || 'Unknown Candidate'}</h1>
          <p className="text-gray-400 mt-1 flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            {candidate.position || 'Position not specified'}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`${statusColor} bg-opacity-20 border-current text-lg px-4 py-2`}
        >
          {statusLabel}
        </Badge>
      </div>

      {/* Candidate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-5 w-5 text-blue-400" />
            <p className="text-gray-400 text-sm">Position Applied</p>
          </div>
          <p className="text-xl font-bold text-white">{candidate.position || candidate.desired_position || 'N/A'}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-green-400" />
            <p className="text-gray-400 text-sm">Applied On</p>
          </div>
          <p className="text-xl font-bold text-white">
            {new Date(candidate.created_at || candidate.submitted_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-5 w-5 text-purple-400" />
            <p className="text-gray-400 text-sm">Application Status</p>
          </div>
          <p className={`text-xl font-bold ${statusColor}`}>{statusLabel}</p>
        </div>
      </div>

      {/* Candidate Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidate.email && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <a href={`mailto:${candidate.email}`} className="text-white hover:text-blue-400">
                      {candidate.email}
                    </a>
                  </div>
                </div>
              )}

              {candidate.phone && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Phone className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <a href={`tel:${candidate.phone}`} className="text-white hover:text-green-400">
                      {candidate.phone}
                    </a>
                  </div>
                </div>
              )}

              {(candidate.city || candidate.state) && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <MapPin className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Location</p>
                    <p className="text-white">
                      {candidate.city && `${candidate.city}, `}
                      {candidate.state}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cover Letter / Application Message */}
          {(candidate.cover_letter || candidate.message) && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Cover Letter / Message</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 whitespace-pre-wrap">
                  {candidate.cover_letter || candidate.message}
                </p>
              </div>
            </div>
          )}

          {/* Experience / Skills */}
          {(candidate.experience || candidate.skills) && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Experience & Skills</h2>
              {candidate.experience && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Experience</h3>
                  <p className="text-gray-300 whitespace-pre-wrap">{candidate.experience}</p>
                </div>
              )}
              {candidate.skills && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Skills</h3>
                  <p className="text-gray-300 whitespace-pre-wrap">{candidate.skills}</p>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {candidate.notes && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Notes</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{candidate.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {candidate.email && (
                <a href={`mailto:${candidate.email}`} className="block">
                  <Button variant="outline" className="w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-800">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </a>
              )}
              {candidate.phone && (
                <a href={`tel:${candidate.phone}`} className="block">
                  <Button variant="outline" className="w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-800">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Candidate
                  </Button>
                </a>
              )}
              <Button variant="outline" className="w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-800">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Interview
              </Button>
            </div>
          </div>

          {/* Resume */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Resume</h3>
            {candidate.resume_url ? (
              <a
                href={candidate.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
              >
                <FileText className="h-5 w-5" />
                <span>View Resume</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <p className="text-gray-500 text-sm">No resume uploaded</p>
            )}
          </div>

          {/* Application Details */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Application Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Candidate ID</p>
                <p className="text-white text-sm font-mono">{candidate.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Applied</p>
                <p className="text-white">
                  {new Date(candidate.created_at || candidate.submitted_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {candidate.source && (
                <div>
                  <p className="text-sm text-gray-400">Source</p>
                  <p className="text-white">{candidate.source}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
