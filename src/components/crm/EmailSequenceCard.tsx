'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Send,
  CheckCircle,
  Edit2,
  Eye,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateEmailTemplate } from '@/app/crm/actions';

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject_template: string;
  html_template: string;
  text_template: string;
  variables: string[];
  language: string;
  active: boolean;
}

interface EmailSequence {
  id: string;
  campaign_id: string;
  sequence_order: number;
  template_id: string;
  delay_days: number;
  delay_hours: number;
  send_time_hour: number;
  active: boolean;
  email_templates: EmailTemplate | null;
}

interface EmailSequenceCardProps {
  sequence: EmailSequence;
  index: number;
  totalSequences: number;
}

export function EmailSequenceCard({ sequence, index, totalSequences }: EmailSequenceCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const template = sequence.email_templates;

  // Form state for editing
  const [editSubject, setEditSubject] = useState(template?.subject_template || '');
  const [editHtml, setEditHtml] = useState(template?.html_template || '');
  const [editText, setEditText] = useState(template?.text_template || '');

  const handleSaveTemplate = async () => {
    if (!template) return;

    setError(null);
    startTransition(async () => {
      const result = await updateEmailTemplate(template.id, {
        subject_template: editSubject,
        html_template: editHtml,
        text_template: editText,
      });

      if (result.success) {
        setIsEditOpen(false);
        router.refresh();
      } else {
        setError(result.error || 'Failed to update template');
      }
    });
  };

  // Reset form when dialog opens
  const handleEditOpen = (open: boolean) => {
    if (open && template) {
      setEditSubject(template.subject_template);
      setEditHtml(template.html_template);
      setEditText(template.text_template);
      setError(null);
    }
    setIsEditOpen(open);
  };

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      {/* Header - Always visible */}
      <div
        className="p-4 hover:bg-gray-800/50 transition-colors cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400 font-bold">{index + 1}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-white font-medium truncate">
                {template?.name || `Email ${index + 1}`}
              </h3>
              {sequence.active !== false && (
                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {sequence.delay_days || 0} days after{' '}
                {index === 0 ? 'enrollment' : 'previous email'}
              </span>
              <span className="flex items-center gap-1">
                <Send className="h-4 w-4" />
                Sequence #{sequence.sequence_order || index + 1}
              </span>
            </div>
            {template && (
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                  {template.category || 'email'}
                </Badge>
                <span className="text-xs text-gray-500 truncate">
                  Subject: {template.subject_template}
                </span>
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && template && (
        <div className="border-t border-gray-700 p-4 bg-gray-800/30">
          {/* Subject Line */}
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-1">Subject Line</p>
            <p className="text-white bg-gray-900/50 p-3 rounded border border-gray-700 font-mono text-sm">
              {template.subject_template}
            </p>
          </div>

          {/* Variables */}
          {template.variables && template.variables.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Template Variables</p>
              <div className="flex flex-wrap gap-2">
                {template.variables.map((variable: string) => (
                  <Badge
                    key={variable}
                    variant="outline"
                    className="text-xs text-purple-400 border-purple-500/50 bg-purple-500/10"
                  >
                    {`{{${variable}}}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Email Preview (Text version summary) */}
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-1">Email Preview (Text)</p>
            <div className="text-gray-300 bg-gray-900/50 p-3 rounded border border-gray-700 text-sm max-h-40 overflow-y-auto whitespace-pre-wrap">
              {template.text_template?.substring(0, 500)}
              {template.text_template && template.text_template.length > 500 && '...'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            {/* Preview HTML Button */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-300 border-gray-600 hover:bg-gray-700"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview HTML
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle className="text-white">Email Preview: {template.name}</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    HTML email preview with template variables shown
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-white rounded-lg overflow-auto max-h-[60vh]">
                  <div
                    className="p-4"
                    dangerouslySetInnerHTML={{ __html: template.html_template }}
                  />
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Button */}
            <Dialog open={isEditOpen} onOpenChange={handleEditOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-300 border-gray-600 hover:bg-gray-700"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Template
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white">Edit Email Template</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Edit the subject, HTML, and text content for {template.name}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-gray-300">Subject Line</Label>
                    <Input
                      id="subject"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Email subject with {{variables}}"
                    />
                    <p className="text-xs text-gray-500">
                      Use variables like {`{{firstName}}`}, {`{{city}}`}, etc.
                    </p>
                  </div>

                  {/* HTML Template */}
                  <div className="space-y-2">
                    <Label htmlFor="html" className="text-gray-300">HTML Template</Label>
                    <Textarea
                      id="html"
                      value={editHtml}
                      onChange={(e) => setEditHtml(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white font-mono text-sm min-h-[200px]"
                      placeholder="<html>...</html>"
                    />
                  </div>

                  {/* Text Template */}
                  <div className="space-y-2">
                    <Label htmlFor="text" className="text-gray-300">Plain Text Template</Label>
                    <Textarea
                      id="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white min-h-[150px]"
                      placeholder="Plain text version of the email"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-3 py-2 rounded text-sm">
                      {error}
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditOpen(false)}
                    disabled={isPending}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveTemplate}
                    disabled={isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {/* No Template Message */}
      {isExpanded && !template && (
        <div className="border-t border-gray-700 p-4 bg-gray-800/30">
          <div className="text-center py-4">
            <Mail className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400">No template linked to this sequence</p>
          </div>
        </div>
      )}
    </div>
  );
}
