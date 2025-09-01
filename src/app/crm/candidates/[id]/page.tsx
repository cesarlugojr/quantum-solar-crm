/**
 * Job Candidate Detail Page
 * 
 * Comprehensive candidate management view with:
 * - Candidate information and status
 * - Application history
 * - Interview scheduling
 * - Skills assessment results
 * - Hiring pipeline tracking
 */

"use client";

import { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Phone, Mail, User, Briefcase, Award, Clock } from 'lucide-react';

interface JobCandidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  created_at: string;
  experience_years?: number;
  skills_test_score?: number;
  resume_url?: string;
}

export default function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [candidate, setCandidate] = useState<JobCandidate | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCandidate = useCallback(async () => {
    try {
      const response = await fetch(`/api/crm/candidates?id=${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setCandidate(data);
      }
    } catch (error) {
      console.error('Error loading candidate:', error);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    loadCandidate();
  }, [resolvedParams.id, loadCandidate]);

  const getStatusColor = (status: string): string => {
    const colors = {
      applied: 'bg-blue-500',
      screening: 'bg-yellow-500',
      interview: 'bg-orange-500',
      offer: 'bg-purple-500',
      hired: 'bg-green-600',
      rejected: 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusDescription = (status: string): string => {
    const descriptions = {
      applied: 'Application submitted and under review',
      screening: 'Initial screening in progress',
      interview: 'Interview scheduled or completed',
      offer: 'Job offer extended to candidate',
      hired: 'Successfully hired and onboarded',
      rejected: 'Application not successful'
    };
    return descriptions[status as keyof typeof descriptions] || 'Unknown status';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading candidate details...</div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-4xl mx-auto">
          <Button 
            onClick={() => router.push('/crm')}
            variant="outline" 
            className="mb-6 border-gray-600 text-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CRM
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Candidate Not Found</h1>
            <p className="text-gray-400">The requested candidate could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button 
          onClick={() => router.push('/crm')}
          variant="outline" 
          className="mb-6 border-gray-600 text-gray-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to CRM
        </Button>

        {/* Candidate Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{candidate.name}</h1>
              <div className="flex items-center text-gray-400 text-lg">
                <Briefcase className="h-5 w-5 mr-2" />
                <span>{candidate.position}</span>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`${getStatusColor(candidate.status || 'applied')} text-white px-4 py-2 text-lg mb-2`}>
                {(candidate.status || 'applied').toUpperCase()}
              </Badge>
              <p className="text-gray-400 text-sm">{getStatusDescription(candidate.status || 'applied')}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Candidate Overview */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Candidate Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-300">
                    <Mail className="h-5 w-5 mr-3 text-purple-400" />
                    <span className="font-medium">Email:</span>
                    <span className="ml-2">{candidate.email}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Phone className="h-5 w-5 mr-3 text-green-400" />
                    <span className="font-medium">Phone:</span>
                    <span className="ml-2">{candidate.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Calendar className="h-5 w-5 mr-3 text-blue-400" />
                    <span className="font-medium">Applied:</span>
                    <span className="ml-2">{new Date(candidate.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {candidate.experience_years && (
                    <div className="flex items-center text-gray-300">
                      <Clock className="h-5 w-5 mr-3 text-orange-400" />
                      <span className="font-medium">Experience:</span>
                      <span className="ml-2">{candidate.experience_years} years</span>
                    </div>
                  )}
                  {candidate.skills_test_score && (
                    <div className="flex items-center text-gray-300">
                      <Award className="h-5 w-5 mr-3 text-yellow-400" />
                      <span className="font-medium">Skills Test:</span>
                      <span className={`ml-2 font-semibold ${getScoreColor(candidate.skills_test_score)}`}>
                        {candidate.skills_test_score}% ({getScoreLabel(candidate.skills_test_score)})
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-300">
                    <User className="h-5 w-5 mr-3 text-[#ff0000]" />
                    <span className="font-medium">Candidate ID:</span>
                    <span className="ml-2 font-mono text-sm">{candidate.id ? `${candidate.id.slice(0, 8)}...` : 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Candidate Actions */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Candidate Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-[#ff0000] hover:bg-[#cc0000]">
                  Update Status
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  Schedule Interview
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  Send Email
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  View Resume
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  Add Notes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Hiring Pipeline */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Hiring Pipeline Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {['applied', 'screening', 'interview', 'offer', 'hired'].map((stage, index) => (
                  <div key={stage} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      ['applied', 'screening', 'interview', 'offer', 'hired'].indexOf(candidate.status || 'applied') >= index
                        ? 'bg-[#ff0000] text-white' 
                        : 'bg-gray-600 text-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`ml-2 text-sm ${
                      ['applied', 'screening', 'interview', 'offer', 'hired'].indexOf(candidate.status || 'applied') >= index
                        ? 'text-white' 
                        : 'text-gray-400'
                    }`}>
                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
                    </span>
                    {index < 4 && (
                      <div className={`w-8 h-0.5 mx-4 ${
                        ['applied', 'screening', 'interview', 'offer', 'hired'].indexOf(candidate.status || 'applied') > index
                          ? 'bg-[#ff0000]' 
                          : 'bg-gray-600'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Position Requirements */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Position Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div>
                  <h4 className="font-semibold text-white mb-3">For Solar Installers:</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Solar installation experience preferred</li>
                    <li>• Physical fitness for rooftop work</li>
                    <li>• Ability to lift 50+ lbs</li>
                    <li>• Height tolerance and safety awareness</li>
                    <li>• Team collaboration skills</li>
                    <li>• Clean driving record</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-3">For Licensed Electricians:</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Valid electrical license</li>
                    <li>• Solar/renewable energy experience</li>
                    <li>• NEC code knowledge</li>
                    <li>• Inverter and monitoring systems</li>
                    <li>• Electrical troubleshooting skills</li>
                    <li>• Safety protocol compliance</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coming Soon Features */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400">
                <ul className="space-y-2">
                  <li>• Interview scheduling system</li>
                  <li>• Background check integration</li>
                  <li>• Reference verification</li>
                  <li>• Onboarding workflow</li>
                </ul>
                <ul className="space-y-2">
                  <li>• Skills test retake options</li>
                  <li>• Document management</li>
                  <li>• Calendar integration</li>
                  <li>• Employee portal access</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
