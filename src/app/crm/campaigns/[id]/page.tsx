'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject_template: string;
  html_template: string;
  text_template: string;
  variables: string[];
  active: boolean;
  language: string;
}

interface EmailSequence {
  id: string;
  send_order: number;
  send_delay_minutes: number;
  active: boolean;
  email_templates: EmailTemplate;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  trigger_conditions: any;
  active: boolean;
  sequences: EmailSequence[];
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/crm/campaigns');
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        const foundCampaign = data.campaigns.find((c: Campaign) => c.id === campaignId);
        if (foundCampaign) {
          setCampaign(foundCampaign);
        } else {
          setError('Campaign not found');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowEditor(true);
  };

  const formatDelay = (minutes: number) => {
    if (minutes === 0) return 'Immediate';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = minutes / 60;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''}`;
    const days = hours / 24;
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error || 'Campaign not found'}</p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/crm/campaigns">Back to Campaigns</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (showEditor && selectedTemplate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TemplateEditor
          template={selectedTemplate}
          onClose={() => {
            setShowEditor(false);
            setSelectedTemplate(null);
            fetchCampaign();
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/crm/campaigns">← Back to Campaigns</Link>
          </Button>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
            <p className="text-gray-600 mt-2">{campaign.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={campaign.active ? 'default' : 'outline'}>
              {campaign.active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Trigger Type</h3>
          <p className="text-2xl font-bold text-gray-900">
            {campaign.trigger_type.replace('_', ' ')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Email Sequence</h3>
          <p className="text-2xl font-bold text-gray-900">
            {campaign.sequences?.length || 0} Emails
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Duration</h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatDelay(
              campaign.sequences?.reduce((max, seq) => Math.max(max, seq.send_delay_minutes), 0) || 0
            )}
          </p>
        </div>
      </div>

      {/* Email Templates */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Email Sequence</h2>
          <p className="text-gray-600 mt-1">Click any email to edit its template</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Order</TableHead>
              <TableHead>Email Name</TableHead>
              <TableHead>Subject Line</TableHead>
              <TableHead>Send Delay</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaign.sequences
              ?.sort((a, b) => a.send_order - b.send_order)
              .map((sequence) => (
                <TableRow key={sequence.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-medium">
                      {sequence.send_order}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-gray-900">
                      {sequence.email_templates.name}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600">
                      {sequence.email_templates.subject_template}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {formatDelay(sequence.send_delay_minutes)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge>
                      {sequence.email_templates.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={sequence.email_templates.active ? 'default' : 'outline'}>
                      {sequence.email_templates.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTemplate(sequence.email_templates)}
                    >
                      Edit Template
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function TemplateEditor({ template, onClose }: { template: EmailTemplate; onClose: () => void }) {
  const [subjectTemplate, setSubjectTemplate] = useState(template.subject_template);
  const [htmlTemplate, setHtmlTemplate] = useState(template.html_template);
  const [textTemplate, setTextTemplate] = useState(template.text_template);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/crm/templates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: template.id,
          subject_template: subjectTemplate,
          html_template: htmlTemplate,
          text_template: textTemplate
        })
      });

      const data = await response.json();

      if (data.error) {
        alert('Error saving template: ' + data.error);
      } else {
        alert('Template saved successfully!');
        onClose();
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{template.name}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Variables available: {template.variables.join(', ')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Editor/Preview */}
      <div className="flex-1 overflow-auto p-6">
        {showPreview ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-lg font-bold mb-4">Preview</h3>
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Subject:</p>
                <p className="text-lg">{subjectTemplate}</p>
              </div>
              <div className="border-t pt-6">
                <div dangerouslySetInnerHTML={{ __html: htmlTemplate }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Subject Line */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Line Template
              </label>
              <input
                type="text"
                value={subjectTemplate}
                onChange={(e) => setSubjectTemplate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter subject line..."
              />
            </div>

            {/* HTML Template */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTML Template
              </label>
              <textarea
                value={htmlTemplate}
                onChange={(e) => setHtmlTemplate(e.target.value)}
                rows={20}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Enter HTML template..."
              />
            </div>

            {/* Text Template */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plain Text Template (fallback)
              </label>
              <textarea
                value={textTemplate}
                onChange={(e) => setTextTemplate(e.target.value)}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Enter plain text template..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
