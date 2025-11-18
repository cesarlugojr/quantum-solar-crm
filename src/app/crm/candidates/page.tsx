"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Download, Eye, Edit, Phone, Mail, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position_applied: string;
  experience_level: string;
  location: string;
  status: string;
  resume_url: string;
  availability: string;
  salary_expectation: number;
  application_date: string;
  last_contact: string;
  notes: string;
}

export default function CandidatesPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPosition, setFilterPosition] = useState('all');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await fetch('/api/crm/candidates');
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = searchTerm === '' ||
      `${candidate.first_name || ''} ${candidate.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.position_applied || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || candidate.status === filterStatus;
    const matchesPosition = filterPosition === 'all' || candidate.position_applied === filterPosition;

    return matchesSearch && matchesStatus && matchesPosition;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'applied':
        return 'bg-blue-500';
      case 'screening':
        return 'bg-yellow-500';
      case 'interview':
        return 'bg-purple-500';
      case 'offer':
        return 'bg-green-500';
      case 'hired':
        return 'bg-emerald-500';
      case 'rejected':
        return 'bg-red-500';
      case 'withdrawn':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getExperienceColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'entry':
        return 'text-blue-400';
      case 'junior':
        return 'text-green-400';
      case 'mid':
        return 'text-yellow-400';
      case 'senior':
        return 'text-orange-400';
      case 'lead':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Job Candidates</h1>
          <p className="text-gray-400 mt-2">Manage solar industry job applications</p>
        </div>
        <Button
          onClick={() => router.push('/crm/candidates/new')}
          className="bg-[#ff0000] hover:bg-[#cc0000] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-900 p-4 rounded-lg">
        <div className="flex flex-1 items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff0000]"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff0000]"
          >
            <option value="all">All Statuses</option>
            <option value="applied">Applied</option>
            <option value="screening">Screening</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>

          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff0000]"
          >
            <option value="all">All Positions</option>
            <option value="Solar Installer">Solar Installer</option>
            <option value="Project Manager">Project Manager</option>
            <option value="Sales Representative">Sales Representative</option>
            <option value="Electrician">Electrician</option>
            <option value="Designer">Designer</option>
            <option value="Administrator">Administrator</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-gray-900 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Total Candidates</h3>
          <p className="text-2xl font-bold text-white mt-2">{candidates.length}</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Active Applications</h3>
          <p className="text-2xl font-bold text-blue-400 mt-2">
            {candidates.filter(c => ['applied', 'screening', 'interview'].includes(c.status)).length}
          </p>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">In Interview</h3>
          <p className="text-2xl font-bold text-purple-400 mt-2">
            {candidates.filter(c => c.status === 'interview').length}
          </p>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Offers Extended</h3>
          <p className="text-2xl font-bold text-green-400 mt-2">
            {candidates.filter(c => c.status === 'offer').length}
          </p>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Hired</h3>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            {candidates.filter(c => c.status === 'hired').length}
          </p>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-gray-400 py-8">
            Loading candidates...
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-8">
            No candidates found
          </div>
        ) : (
          filteredCandidates.map((candidate) => (
            <div key={candidate.id} className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {candidate.first_name} {candidate.last_name}
                  </h3>
                  <p className="text-gray-300">{candidate.position_applied}</p>
                  <p className={`text-sm ${getExperienceColor(candidate.experience_level)}`}>
                    {candidate.experience_level} Level
                  </p>
                </div>
                <Badge className={`${getStatusColor(candidate.status)} text-white`}>
                  {candidate.status}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-400">
                  <Mail className="h-4 w-4 mr-2" />
                  {candidate.email}
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <Phone className="h-4 w-4 mr-2" />
                  {candidate.phone}
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  {candidate.location}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-400">Applied</p>
                  <p className="text-white">
                    {candidate.application_date ?
                      new Date(candidate.application_date).toLocaleDateString() :
                      'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Salary Expectation</p>
                  <p className="text-white">
                    {candidate.salary_expectation ?
                      `$${candidate.salary_expectation.toLocaleString()}` :
                      'Not specified'
                    }
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-400 text-sm">Availability</p>
                <p className="text-white text-sm">{candidate.availability || 'Not specified'}</p>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-400">
                  Last Contact: {candidate.last_contact ?
                    new Date(candidate.last_contact).toLocaleDateString() :
                    'Never'
                  }
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/crm/candidates/${candidate.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/crm/candidates/${candidate.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}