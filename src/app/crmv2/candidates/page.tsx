import { Metadata } from 'next';
import { Suspense } from 'react';
import { Plus, Phone, Mail, Briefcase } from 'lucide-react';
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
import { getCandidates } from '../actions';

export const metadata: Metadata = {
  title: 'Candidates | Quantum Solar CRM v2',
  description: 'Manage job candidates and recruitment pipeline',
};

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'applied': 'text-blue-400 border-blue-500',
    'screening': 'text-yellow-400 border-yellow-500',
    'interview': 'text-purple-400 border-purple-500',
    'offer': 'text-orange-400 border-orange-500',
    'hired': 'text-green-400 border-green-500',
    'rejected': 'text-red-400 border-red-500',
  };
  return colors[status] || 'text-gray-400 border-gray-500';
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'applied': 'Applied',
    'screening': 'Screening',
    'interview': 'Interview',
    'offer': 'Offer',
    'hired': 'Hired',
    'rejected': 'Rejected',
  };
  return labels[status] || status;
}

async function CandidatesTable() {
  const candidates = await getCandidates(100);

  if (!candidates || candidates.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-12 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">No Candidates Found</h3>
        <p className="text-gray-400 mb-4">
          Job applications will appear here when candidates apply.
        </p>
        <Button className="bg-[#ff0000] hover:bg-[#cc0000] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Candidate Manually
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700 hover:bg-gray-800/50">
            <TableHead className="text-gray-400">Name</TableHead>
            <TableHead className="text-gray-400">Contact</TableHead>
            <TableHead className="text-gray-400">Position</TableHead>
            <TableHead className="text-gray-400">Status</TableHead>
            <TableHead className="text-gray-400">Applied</TableHead>
            <TableHead className="text-gray-400 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((candidate) => (
            <TableRow
              key={candidate.id}
              className="border-gray-700 hover:bg-gray-800/50"
            >
              <TableCell>
                <p className="font-medium text-white">
                  {candidate.name || `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || 'Unknown'}
                </p>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {candidate.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Mail className="h-3 w-3 text-gray-500" />
                      {candidate.email}
                    </div>
                  )}
                  {candidate.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Phone className="h-3 w-3 text-gray-500" />
                      {candidate.phone}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-gray-300">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-3 w-3 text-gray-500" />
                  {candidate.position || candidate.desired_role || 'Not specified'}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`${getStatusColor(candidate.status)} bg-opacity-20 border-current`}
                >
                  {getStatusLabel(candidate.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-400 text-sm">
                {candidate.created_at ? new Date(candidate.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }) : '-'}
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/crmv2/candidates/${candidate.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    View
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

export default function CandidatesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Candidates</h1>
          <p className="text-gray-400 mt-1">
            Manage job applications and recruitment pipeline
          </p>
        </div>
        <Button className="bg-[#ff0000] hover:bg-[#cc0000] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add New Candidate
        </Button>
      </div>

      {/* Candidates Data Table */}
      <Suspense fallback={
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-12">
          <p className="text-center text-gray-400">Loading candidates...</p>
        </div>
      }>
        <CandidatesTable />
      </Suspense>
    </div>
  );
}
