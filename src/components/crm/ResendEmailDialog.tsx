'use client';

import { useState } from 'react';
import { Send, Mail, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface EmailSequence {
  id: string;
  sequence_order: number;
  subject_template?: string;
  email_templates?: {
    subject_template?: string;
    name?: string;
  };
}

interface EnrolledLead {
  id: string;
  lead_id: string;
  email_address: string;
  lead_name?: string;
  status: string;
}

interface ResendEmailDialogProps {
  campaignId: string;
  campaignName: string;
  sequences: EmailSequence[];
  enrolledLeads?: EnrolledLead[];
  defaultSequenceId?: string;
  trigger?: React.ReactNode;
}

export function ResendEmailDialog({
  campaignId,
  campaignName,
  sequences,
  enrolledLeads = [],
  defaultSequenceId,
  trigger,
}: ResendEmailDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedSequenceId, setSelectedSequenceId] = useState(defaultSequenceId || '');
  const [recipientType, setRecipientType] = useState<'enrolled' | 'custom'>('enrolled');
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const selectedSequence = sequences.find(s => s.id === selectedSequenceId);
  const selectedLead = enrolledLeads.find(l => l.lead_id === selectedLeadId);

  const getSubjectPreview = (seq: EmailSequence) => {
    const subject = seq.subject_template || seq.email_templates?.subject_template || 'No subject';
    return subject.length > 50 ? subject.substring(0, 50) + '...' : subject;
  };

  const handleSend = async () => {
    if (!selectedSequenceId) {
      setResult({ success: false, message: 'Please select an email to send' });
      return;
    }

    if (recipientType === 'enrolled' && !selectedLeadId) {
      setResult({ success: false, message: 'Please select a lead' });
      return;
    }

    if (recipientType === 'custom' && !customEmail) {
      setResult({ success: false, message: 'Please enter an email address' });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          sequenceId: selectedSequenceId,
          ...(recipientType === 'enrolled'
            ? { leadId: selectedLeadId }
            : { leadEmail: customEmail }
          ),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: `Email sent successfully to ${data.to}`,
        });
        // Reset form after success
        setTimeout(() => {
          setOpen(false);
          setResult(null);
          setSelectedLeadId('');
          setCustomEmail('');
        }, 2000);
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to send email',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
            <Send className="h-4 w-4 mr-2" />
            Resend Email
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-purple-400" />
            Resend Campaign Email
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Send a specific email from "{campaignName}" to a lead
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email Sequence Selection */}
          <div className="space-y-2">
            <Label className="text-gray-300">Select Email</Label>
            <Select value={selectedSequenceId} onValueChange={setSelectedSequenceId}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Choose an email to send" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {sequences.map((seq) => (
                  <SelectItem
                    key={seq.id}
                    value={seq.id}
                    className="text-white hover:bg-gray-700 focus:bg-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-gray-600">
                        #{seq.sequence_order}
                      </Badge>
                      <span className="truncate">{getSubjectPreview(seq)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSequence && (
              <p className="text-sm text-gray-500">
                Email #{selectedSequence.sequence_order} in sequence
              </p>
            )}
          </div>

          {/* Recipient Type Selection */}
          <div className="space-y-2">
            <Label className="text-gray-300">Send To</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={recipientType === 'enrolled' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRecipientType('enrolled')}
                className={recipientType === 'enrolled'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                }
              >
                <User className="h-4 w-4 mr-1" />
                Enrolled Lead
              </Button>
              <Button
                type="button"
                variant={recipientType === 'custom' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRecipientType('custom')}
                className={recipientType === 'custom'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                }
              >
                <Mail className="h-4 w-4 mr-1" />
                Custom Email
              </Button>
            </div>
          </div>

          {/* Recipient Selection */}
          {recipientType === 'enrolled' ? (
            <div className="space-y-2">
              <Label className="text-gray-300">Select Lead</Label>
              {enrolledLeads.length > 0 ? (
                <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Choose a lead" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 max-h-[200px]">
                    {enrolledLeads.map((lead) => (
                      <SelectItem
                        key={lead.lead_id}
                        value={lead.lead_id}
                        className="text-white hover:bg-gray-700 focus:bg-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          <span>{lead.lead_name || lead.email_address}</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              lead.status === 'active'
                                ? 'border-green-500 text-green-400'
                                : 'border-gray-500 text-gray-400'
                            }`}
                          >
                            {lead.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-500 py-2">
                  No leads enrolled in this campaign. Use custom email instead.
                </p>
              )}
              {selectedLead && (
                <p className="text-sm text-gray-500">
                  Will send to: {selectedLead.email_address}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-gray-300">Email Address</Label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
              />
              <p className="text-sm text-gray-500">
                Note: Variable substitution will use minimal data (no personalization)
              </p>
            </div>
          )}

          {/* Result Message */}
          {result && (
            <div
              className={`p-3 rounded-lg text-sm ${
                result.success
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {result.message}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isLoading || !selectedSequenceId}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
