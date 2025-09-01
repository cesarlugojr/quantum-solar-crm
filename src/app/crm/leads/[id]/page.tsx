/**
 * Lead Detail Page
 * 
 * Comprehensive lead management view with:
 * - Lead information and status
 * - Communication history
 * - Lead progression tracking
 * - Follow-up scheduling
 * - Conversion management
 */

"use client";

import { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Calendar, Phone, Mail, DollarSign, User, TrendingUp } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed' | 'lost';
  created_at: string;
  electric_bill: number | null;
  location: string;
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLead = useCallback(async () => {
    try {
      const response = await fetch(`/api/crm/leads?id=${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setLead(data);
      }
    } catch (error) {
      console.error('Error loading lead:', error);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

  const getStatusColor = (status: string): string => {
    const colors = {
      new: 'bg-blue-500',
      contacted: 'bg-yellow-500',
      qualified: 'bg-green-500',
      proposal: 'bg-purple-500',
      closed: 'bg-green-600',
      lost: 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusDescription = (status: string): string => {
    const descriptions = {
      new: 'Fresh lead, not yet contacted',
      contacted: 'Initial contact made',
      qualified: 'Lead shows genuine interest',
      proposal: 'Proposal sent to prospect',
      closed: 'Successfully converted to customer',
      lost: 'Lead did not convert'
    };
    return descriptions[status as keyof typeof descriptions] || 'Unknown status';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading lead details...</div>
      </div>
    );
  }

  if (!lead) {
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
            <h1 className="text-2xl font-bold text-white mb-4">Lead Not Found</h1>
            <p className="text-gray-400">The requested lead could not be found.</p>
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

        {/* Lead Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{lead.name}</h1>
              <div className="flex items-center text-gray-400 text-lg">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{lead.location}</span>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`${getStatusColor(lead.status || 'new')} text-white px-4 py-2 text-lg mb-2`}>
                {(lead.status || 'new').toUpperCase()}
              </Badge>
              <p className="text-gray-400 text-sm">{getStatusDescription(lead.status || 'new')}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Lead Overview */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Lead Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-300">
                    <Mail className="h-5 w-5 mr-3 text-purple-400" />
                    <span className="font-medium">Email:</span>
                    <span className="ml-2">{lead.email}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Phone className="h-5 w-5 mr-3 text-green-400" />
                    <span className="font-medium">Phone:</span>
                    <span className="ml-2">{lead.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Calendar className="h-5 w-5 mr-3 text-blue-400" />
                    <span className="font-medium">Created:</span>
                    <span className="ml-2">{new Date(lead.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {lead.electric_bill && (
                    <div className="flex items-center text-gray-300">
                      <DollarSign className="h-5 w-5 mr-3 text-yellow-400" />
                      <span className="font-medium">Electric Bill:</span>
                      <span className="ml-2">${lead.electric_bill}/month</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-300">
                    <User className="h-5 w-5 mr-3 text-[#ff0000]" />
                    <span className="font-medium">Lead ID:</span>
                    <span className="ml-2 font-mono text-sm">{lead.id ? `${lead.id.slice(0, 8)}...` : 'Unknown'}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <TrendingUp className="h-5 w-5 mr-3 text-orange-400" />
                    <span className="font-medium">Potential:</span>
                    <span className="ml-2">
                      {lead.electric_bill && typeof lead.electric_bill === 'number' ? 
                        lead.electric_bill > 150 ? 'High' : lead.electric_bill > 100 ? 'Medium' : 'Low' 
                        : 'Unknown'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lead Actions */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Lead Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-[#ff0000] hover:bg-[#cc0000]">
                  Update Status
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  Schedule Follow-up
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  Send Email
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  Create Proposal
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  Convert to Project
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lead Pipeline */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Lead Pipeline Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {['new', 'contacted', 'qualified', 'proposal', 'closed'].map((stage, index) => (
                  <div key={stage} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      ['new', 'contacted', 'qualified', 'proposal', 'closed'].indexOf(lead.status || 'new') >= index
                        ? 'bg-[#ff0000] text-white' 
                        : 'bg-gray-600 text-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`ml-2 text-sm ${
                      ['new', 'contacted', 'qualified', 'proposal', 'closed'].indexOf(lead.status || 'new') >= index
                        ? 'text-white' 
                        : 'text-gray-400'
                    }`}>
                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
                    </span>
                    {index < 4 && (
                      <div className={`w-8 h-0.5 mx-4 ${
                        ['new', 'contacted', 'qualified', 'proposal', 'closed'].indexOf(lead.status || 'new') > index
                          ? 'bg-[#ff0000]' 
                          : 'bg-gray-600'
                      }`} />
                    )}
                  </div>
                ))}
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
                  <li>• Communication history</li>
                  <li>• Email templates</li>
                  <li>• Automated follow-ups</li>
                  <li>• Lead scoring system</li>
                </ul>
                <ul className="space-y-2">
                  <li>• Solar calculator integration</li>
                  <li>• Proposal generation</li>
                  <li>• Calendar integration</li>
                  <li>• Lead source tracking</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
