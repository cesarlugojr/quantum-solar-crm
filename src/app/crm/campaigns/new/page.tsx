'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, Send, Eye, Save } from 'lucide-react';
import Link from 'next/link';

// Campaign creation schema
const emailSequenceSchema = z.object({
  sequence_number: z.number().min(1),
  delay_days: z.number().min(0).max(365),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  html_template: z.string().min(10, 'Email content must be at least 10 characters'),
  template_variables: z.array(z.string()).default([]),
});

const campaignSchema = z.object({
  name: z.string().min(3, 'Campaign name must be at least 3 characters'),
  description: z.string().optional(),
  trigger_type: z.enum(['lead_created', 'status_change', 'manual', 'calculator_abandoned']),
  trigger_conditions: z.record(z.any()).optional(),
  target_segment: z.object({
    lead_type: z.enum(['splash_leads', 'contact_submissions']).optional(),
    source: z.string().optional(),
    form_variant: z.string().optional(),
    utility_company: z.string().optional(),
  }).optional(),
  sequences: z.array(emailSequenceSchema).min(1, 'At least one email is required'),
  active: z.boolean().default(false),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

export default function NewCampaignPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<number | null>(null);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      description: '',
      trigger_type: 'lead_created',
      trigger_conditions: {},
      target_segment: {
        lead_type: 'splash_leads',
      },
      sequences: [
        {
          sequence_number: 1,
          delay_days: 0,
          subject: '',
          html_template: '',
          template_variables: ['firstName', 'lastName', 'utilityCompany', 'electricBill'],
        },
      ],
      active: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'sequences',
  });

  const onSubmit = async (data: CampaignFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/crm/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        form.setError('root', { message: error.error || 'Failed to create campaign' });
        setIsSubmitting(false);
        return;
      }

      const result = await response.json();
      router.push(`/crm/campaigns/${result.campaign.id}`);
    } catch (error) {
      form.setError('root', { message: 'Network error. Please try again.' });
      setIsSubmitting(false);
    }
  };

  const addEmailSequence = () => {
    const nextSequenceNumber = fields.length + 1;
    append({
      sequence_number: nextSequenceNumber,
      delay_days: nextSequenceNumber === 1 ? 0 : 1,
      subject: '',
      html_template: '',
      template_variables: ['firstName', 'lastName', 'utilityCompany', 'electricBill'],
    });
  };

  const renderVariableHints = (variables: string[]) => {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        <span className="text-sm text-gray-600">Available variables:</span>
        {variables.map((variable) => (
          <Badge key={variable} variant="secondary" className="text-xs">
            {`{{${variable}}}`}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/crm/campaigns" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
          <p className="text-gray-600 mt-2">Build an automated email drip campaign to nurture leads</p>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="details">Campaign Details</TabsTrigger>
              <TabsTrigger value="targeting">Targeting</TabsTrigger>
              <TabsTrigger value="emails">Email Sequences</TabsTrigger>
              <TabsTrigger value="review">Review & Launch</TabsTrigger>
            </TabsList>

            {/* Tab 1: Campaign Details */}
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Information</CardTitle>
                  <CardDescription>Basic details about your email campaign</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="name">Campaign Name *</Label>
                    <Input
                      id="name"
                      {...form.register('name')}
                      placeholder="e.g., Ameren Illinois Paid Lead Fast Track"
                      className="mt-2"
                    />
                    {form.formState.errors.name && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...form.register('description')}
                      placeholder="Describe the purpose and goals of this campaign..."
                      className="mt-2"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="trigger_type">Trigger Type *</Label>
                    <select
                      id="trigger_type"
                      {...form.register('trigger_type')}
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="lead_created">Lead Created</option>
                      <option value="status_change">Status Change</option>
                      <option value="calculator_abandoned">Calculator Abandoned</option>
                      <option value="manual">Manual Enrollment</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                      When should leads be automatically enrolled in this campaign?
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="active">Activate Campaign Immediately</Label>
                      <p className="text-sm text-gray-500">
                        Start enrolling leads as soon as campaign is created
                      </p>
                    </div>
                    <Switch
                      id="active"
                      checked={form.watch('active')}
                      onCheckedChange={(checked) => form.setValue('active', checked)}
                    />
                  </div>

                  <Button type="button" onClick={() => setActiveTab('targeting')} className="w-full">
                    Next: Targeting
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Targeting */}
            <TabsContent value="targeting">
              <Card>
                <CardHeader>
                  <CardTitle>Target Segment</CardTitle>
                  <CardDescription>Define which leads should be enrolled in this campaign</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="lead_type">Lead Type</Label>
                    <select
                      id="lead_type"
                      {...form.register('target_segment.lead_type')}
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="splash_leads">Splash Leads (Main Form)</option>
                      <option value="contact_submissions">Contact Submissions</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="source">Lead Source (Optional)</Label>
                    <Input
                      id="source"
                      {...form.register('target_segment.source')}
                      placeholder="e.g., paid, organic, referral"
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">Leave blank to target all sources</p>
                  </div>

                  <div>
                    <Label htmlFor="form_variant">Form Variant (Optional)</Label>
                    <Input
                      id="form_variant"
                      {...form.register('target_segment.form_variant')}
                      placeholder="e.g., ameren_illinois_solar_ppa"
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">Leave blank to target all form variants</p>
                  </div>

                  <div>
                    <Label htmlFor="utility_company">Utility Company (Optional)</Label>
                    <Input
                      id="utility_company"
                      {...form.register('target_segment.utility_company')}
                      placeholder="e.g., Ameren Illinois"
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">Leave blank to target all utility companies</p>
                  </div>

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setActiveTab('details')} className="flex-1">
                      Back
                    </Button>
                    <Button type="button" onClick={() => setActiveTab('emails')} className="flex-1">
                      Next: Email Sequences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Email Sequences */}
            <TabsContent value="emails">
              <Card>
                <CardHeader>
                  <CardTitle>Email Sequences</CardTitle>
                  <CardDescription>Create the automated email sequence for this campaign</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="border-2">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            Email #{index + 1}
                            {index === 0 && <Badge className="ml-2">Initial Email</Badge>}
                          </CardTitle>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor={`delay_${index}`}>
                            {index === 0 ? 'Send Immediately After Enrollment' : `Send After (Days)`}
                          </Label>
                          {index > 0 && (
                            <Input
                              id={`delay_${index}`}
                              type="number"
                              min="0"
                              {...form.register(`sequences.${index}.delay_days`, { valueAsNumber: true })}
                              className="mt-2"
                            />
                          )}
                          {index === 0 && (
                            <p className="text-sm text-gray-500 mt-2">
                              This email will be sent immediately when a lead is enrolled
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`subject_${index}`}>Subject Line *</Label>
                          <Input
                            id={`subject_${index}`}
                            {...form.register(`sequences.${index}.subject`)}
                            placeholder="e.g., Welcome to Quantum Solar, {{firstName}}!"
                            className="mt-2"
                          />
                          {form.formState.errors.sequences?.[index]?.subject && (
                            <p className="text-red-500 text-sm mt-1">
                              {form.formState.errors.sequences[index]?.subject?.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`html_${index}`}>Email Content (HTML) *</Label>
                          <Textarea
                            id={`html_${index}`}
                            {...form.register(`sequences.${index}.html_template`)}
                            placeholder="Enter HTML email content with variables like {{firstName}}, {{utilityCompany}}, etc."
                            className="mt-2 font-mono text-sm"
                            rows={12}
                          />
                          {form.formState.errors.sequences?.[index]?.html_template && (
                            <p className="text-red-500 text-sm mt-1">
                              {form.formState.errors.sequences[index]?.html_template?.message}
                            </p>
                          )}
                          {renderVariableHints(field.template_variables)}
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setPreviewEmail(index)}
                          className="w-full"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview Email
                        </Button>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addEmailSequence}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Email
                  </Button>

                  {form.formState.errors.sequences && (
                    <p className="text-red-500 text-sm">{form.formState.errors.sequences.message}</p>
                  )}

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setActiveTab('targeting')} className="flex-1">
                      Back
                    </Button>
                    <Button type="button" onClick={() => setActiveTab('review')} className="flex-1">
                      Next: Review & Launch
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Review & Launch */}
            <TabsContent value="review">
              <Card>
                <CardHeader>
                  <CardTitle>Review Campaign</CardTitle>
                  <CardDescription>Review all settings before creating your campaign</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Campaign Name</h3>
                      <p className="text-gray-600">{form.watch('name') || 'Not set'}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">Description</h3>
                      <p className="text-gray-600">{form.watch('description') || 'No description'}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">Trigger Type</h3>
                      <p className="text-gray-600 capitalize">{form.watch('trigger_type')?.replace('_', ' ')}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">Email Sequences</h3>
                      <p className="text-gray-600">{fields.length} email{fields.length !== 1 ? 's' : ''}</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {fields.map((field, index) => (
                          <li key={field.id} className="text-sm text-gray-600">
                            Email #{index + 1}: {index === 0 ? 'Immediate' : `After ${field.delay_days} day${field.delay_days !== 1 ? 's' : ''}`}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">Status</h3>
                      <Badge variant={form.watch('active') ? 'default' : 'secondary'}>
                        {form.watch('active') ? 'Active' : 'Draft'}
                      </Badge>
                    </div>
                  </div>

                  {form.formState.errors.root && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800">{form.formState.errors.root.message}</p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setActiveTab('emails')} className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                      {isSubmitting ? (
                        <>Creating Campaign...</>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Create Campaign
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </div>
  );
}
