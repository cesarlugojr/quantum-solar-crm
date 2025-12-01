'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateLead } from '@/app/crm/actions';
import type { LeadV2 } from '@/types/crm';
import {
  LEAD_STATUS_LABELS,
  CONTACTED_DETAIL_LABELS,
  LEAD_LOST_REASON_LABELS,
  type LeadMainStatus,
  type ContactedDetail,
  type LeadLostReason,
} from '@/types/crm';

interface EditLeadDialogProps {
  lead: LeadV2;
}

export function EditLeadDialog({ lead }: EditLeadDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState(lead.first_name || '');
  const [lastName, setLastName] = useState(lead.last_name || '');
  const [email, setEmail] = useState(lead.email || '');
  const [phone, setPhone] = useState(lead.phone || '');
  const [streetAddress, setStreetAddress] = useState(lead.street_address || lead.address || '');
  const [city, setCity] = useState(lead.city || '');
  const [state, setState] = useState(lead.state || '');
  const [zipCode, setZipCode] = useState(lead.zip_code || '');
  const [utilityCompany, setUtilityCompany] = useState(lead.utility_company || '');
  const [averageMonthlyBill, setAverageMonthlyBill] = useState(lead.average_monthly_bill?.toString() || '');
  const [homeownerStatus, setHomeownerStatus] = useState(lead.homeowner_status || '');
  const [creditScore, setCreditScore] = useState(lead.credit_score || '');
  const [status, setStatus] = useState<LeadMainStatus>(lead.status as LeadMainStatus || 'new');
  const [statusDetail, setStatusDetail] = useState(lead.status_detail || '');
  const [notes, setNotes] = useState(lead.notes || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateLead(lead.id, {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        street_address: streetAddress,
        city,
        state,
        zip_code: zipCode,
        utility_company: utilityCompany,
        average_monthly_bill: averageMonthlyBill ? parseFloat(averageMonthlyBill) : undefined,
        homeowner_status: homeownerStatus || undefined,
        credit_score: creditScore || undefined,
        status,
        status_detail: statusDetail || undefined,
        notes,
      });

      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error || 'Failed to update lead');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
          <Edit className="h-4 w-4 mr-2" />
          Edit Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Lead</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update the lead information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-2">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-2">Address Information</h3>
              <div className="space-y-2">
                <Label htmlFor="streetAddress" className="text-gray-300">Street Address</Label>
                <Input
                  id="streetAddress"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-gray-300">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-gray-300">State</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode" className="text-gray-300">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            {/* Solar Assessment */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-2">Solar Assessment</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="utilityCompany" className="text-gray-300">Utility Company</Label>
                  <Input
                    id="utilityCompany"
                    value={utilityCompany}
                    onChange={(e) => setUtilityCompany(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="averageMonthlyBill" className="text-gray-300">Monthly Electric Bill</Label>
                  <Input
                    id="averageMonthlyBill"
                    type="number"
                    value={averageMonthlyBill}
                    onChange={(e) => setAverageMonthlyBill(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="$"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="homeownerStatus" className="text-gray-300">Homeowner Status</Label>
                  <Select value={homeownerStatus} onValueChange={setHomeownerStatus}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="renter">Renter</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditScore" className="text-gray-300">Credit Score</Label>
                  <Select value={creditScore} onValueChange={setCreditScore}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select score" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="excellent">Excellent (750+)</SelectItem>
                      <SelectItem value="good">Good (700-749)</SelectItem>
                      <SelectItem value="fair">Fair (650-699)</SelectItem>
                      <SelectItem value="poor">Poor (&lt;650)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-2">Lead Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-gray-300">Status</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as LeadMainStatus)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statusDetail" className="text-gray-300">Status Detail</Label>
                  <Select value={statusDetail || '_none'} onValueChange={(value) => setStatusDetail(value === '_none' ? '' : value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select detail" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="_none">None</SelectItem>
                      {status === 'contacted' && Object.entries(CONTACTED_DETAIL_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                      {status === 'lead_lost' && Object.entries(LEAD_LOST_REASON_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-2">Notes</h3>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-gray-300">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                  placeholder="Add any additional notes..."
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
