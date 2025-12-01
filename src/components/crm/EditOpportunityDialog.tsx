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
import { updateOpportunity } from '@/app/crm/actions';
import type { OpportunityV2 } from '@/types/crm';
import {
  OPPORTUNITY_STATUS_LABELS,
  OPPORTUNITY_LOST_REASON_LABELS,
  type OpportunityMainStatus,
  type OpportunityLostReason,
} from '@/types/crm';

interface EditOpportunityDialogProps {
  opportunity: OpportunityV2;
}

export function EditOpportunityDialog({ opportunity }: EditOpportunityDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState(opportunity.customer_name || '');
  const [email, setEmail] = useState(opportunity.email || '');
  const [phone, setPhone] = useState(opportunity.phone || '');
  const [address, setAddress] = useState(opportunity.address || '');
  const [city, setCity] = useState(opportunity.city || '');
  const [state, setState] = useState(opportunity.state || '');
  const [zipCode, setZipCode] = useState(opportunity.zip_code || '');
  const [utilityCompany, setUtilityCompany] = useState(opportunity.utility_company || '');
  const [averageMonthlyBill, setAverageMonthlyBill] = useState(opportunity.average_monthly_bill?.toString() || '');
  const [systemSizeKw, setSystemSizeKw] = useState(opportunity.system_size_kw?.toString() || '');
  const [estimatedMonthlySavings, setEstimatedMonthlySavings] = useState(opportunity.estimated_monthly_savings?.toString() || '');
  const [proposalAmount, setProposalAmount] = useState(opportunity.proposal_amount?.toString() || '');
  const [appointmentDate, setAppointmentDate] = useState(
    opportunity.appointment_date ? opportunity.appointment_date.slice(0, 16) : ''
  );
  const [appointmentType, setAppointmentType] = useState(opportunity.appointment_type || 'initial');
  const [assignedTo, setAssignedTo] = useState(opportunity.assigned_to || '');
  const [status, setStatus] = useState<OpportunityMainStatus>(opportunity.status as OpportunityMainStatus || 'appointment_scheduled');
  const [lostReason, setLostReason] = useState<OpportunityLostReason | ''>(opportunity.lost_reason as OpportunityLostReason || '');
  const [notes, setNotes] = useState(opportunity.notes || '');
  const [appointmentNotes, setAppointmentNotes] = useState(opportunity.appointment_notes || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateOpportunity(opportunity.id, {
        customer_name: customerName,
        email,
        phone,
        address,
        city,
        state,
        zip_code: zipCode,
        utility_company: utilityCompany,
        average_monthly_bill: averageMonthlyBill ? parseFloat(averageMonthlyBill) : undefined,
        system_size_kw: systemSizeKw ? parseFloat(systemSizeKw) : undefined,
        estimated_monthly_savings: estimatedMonthlySavings ? parseFloat(estimatedMonthlySavings) : undefined,
        proposal_amount: proposalAmount ? parseFloat(proposalAmount) : undefined,
        appointment_date: appointmentDate || undefined,
        appointment_type: appointmentType as 'initial' | 'follow_up',
        assigned_to: assignedTo || undefined,
        status,
        lost_reason: lostReason || undefined,
        notes,
        appointment_notes: appointmentNotes,
      });

      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error || 'Failed to update opportunity');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Opportunity</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update the opportunity information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-2">Contact Information</h3>
              <div className="space-y-2">
                <Label htmlFor="customerName" className="text-gray-300">Customer Name</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
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
                <Label htmlFor="address" className="text-gray-300">Street Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
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
                  <Label htmlFor="averageMonthlyBill" className="text-gray-300">Monthly Bill ($)</Label>
                  <Input
                    id="averageMonthlyBill"
                    type="number"
                    value={averageMonthlyBill}
                    onChange={(e) => setAverageMonthlyBill(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systemSizeKw" className="text-gray-300">System Size (kW)</Label>
                  <Input
                    id="systemSizeKw"
                    type="number"
                    step="0.1"
                    value={systemSizeKw}
                    onChange={(e) => setSystemSizeKw(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedMonthlySavings" className="text-gray-300">Est. Monthly Savings ($)</Label>
                  <Input
                    id="estimatedMonthlySavings"
                    type="number"
                    value={estimatedMonthlySavings}
                    onChange={(e) => setEstimatedMonthlySavings(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="proposalAmount" className="text-gray-300">Proposal Amount ($)</Label>
                <Input
                  id="proposalAmount"
                  type="number"
                  value={proposalAmount}
                  onChange={(e) => setProposalAmount(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            {/* Appointment Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-2">Appointment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointmentDate" className="text-gray-300">Appointment Date/Time</Label>
                  <Input
                    id="appointmentDate"
                    type="datetime-local"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointmentType" className="text-gray-300">Appointment Type</Label>
                  <Select value={appointmentType} onValueChange={(value) => setAppointmentType(value as 'initial' | 'follow_up')}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="initial">Initial</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedTo" className="text-gray-300">Assigned To</Label>
                <Input
                  id="assignedTo"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Sales rep name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointmentNotes" className="text-gray-300">Appointment Notes</Label>
                <Textarea
                  id="appointmentNotes"
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white min-h-[80px]"
                  placeholder="Notes from the appointment..."
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-2">Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-gray-300">Status</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as OpportunityMainStatus)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {Object.entries(OPPORTUNITY_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {status === 'opportunity_lost' && (
                  <div className="space-y-2">
                    <Label htmlFor="lostReason" className="text-gray-300">Lost Reason</Label>
                    <Select value={lostReason} onValueChange={(value) => setLostReason(value as OpportunityLostReason)}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {Object.entries(OPPORTUNITY_LOST_REASON_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-2">General Notes</h3>
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
