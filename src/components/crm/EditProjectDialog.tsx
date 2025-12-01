'use client';

import { useState, useTransition, useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateProject, getAHJs } from '@/app/crm/actions';
import type { ProjectV2, AHJ } from '@/types/crm';
import {
  PROJECT_STAGE_LABELS,
  REVENUE_TYPE_INFO,
  type ProjectStage,
  type RevenueType,
  type FinancingType,
} from '@/types/crm';

interface EditProjectDialogProps {
  project: ProjectV2;
}

export function EditProjectDialog({ project }: EditProjectDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AHJ list
  const [ahjs, setAhjs] = useState<AHJ[]>([]);
  const [loadingAhjs, setLoadingAhjs] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState(project.customer_name || '');
  const [email, setEmail] = useState(project.email || '');
  const [phone, setPhone] = useState(project.phone || '');
  const [address, setAddress] = useState(project.address || '');
  const [city, setCity] = useState(project.city || '');
  const [state, setState] = useState(project.state || '');
  const [zipCode, setZipCode] = useState(project.zip_code || '');
  const [systemSizeKw, setSystemSizeKw] = useState(project.system_size_kw?.toString() || '');
  const [panelCount, setPanelCount] = useState(project.panel_count?.toString() || '');
  const [inverterType, setInverterType] = useState(project.inverter_type || '');
  const [revenueType, setRevenueType] = useState<RevenueType>(project.revenue_type || 'self_gen');
  const [estimatedRevenue, setEstimatedRevenue] = useState(project.estimated_revenue?.toString() || '');
  const [actualRevenue, setActualRevenue] = useState(project.actual_revenue?.toString() || '');
  const [financingType, setFinancingType] = useState<FinancingType | ''>(project.financing_type || '');
  const [monthlyPayment, setMonthlyPayment] = useState(project.monthly_payment?.toString() || '');
  const [currentStage, setCurrentStage] = useState<ProjectStage>(project.current_stage || 5);
  const [hasMpu, setHasMpu] = useState(project.has_mpu || false);
  const [hasBattery, setHasBattery] = useState(project.has_battery || false);
  const [hasTrench, setHasTrench] = useState(project.has_trench || false);
  const [ahjId, setAhjId] = useState(project.ahj_id || '');
  const [ahjJurisdiction, setAhjJurisdiction] = useState(project.ahj_jurisdiction || '');
  const [permitNumber, setPermitNumber] = useState(project.permit_number || '');
  const [utilityAccountNumber, setUtilityAccountNumber] = useState(project.utility_account_number || '');
  const [assignedInstaller, setAssignedInstaller] = useState(project.assigned_installer || '');
  const [installationDate, setInstallationDate] = useState(
    project.installation_date ? project.installation_date.slice(0, 10) : ''
  );
  const [ptoDate, setPtoDate] = useState(
    project.pto_date ? project.pto_date.slice(0, 10) : ''
  );
  const [projectNotes, setProjectNotes] = useState(project.project_notes || '');

  // Load AHJs when dialog opens
  useEffect(() => {
    if (open) {
      setLoadingAhjs(true);
      getAHJs({ activeOnly: true }).then((data) => {
        setAhjs(data);
        setLoadingAhjs(false);
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateProject(project.id, {
        customer_name: customerName,
        email,
        phone,
        address,
        city,
        state,
        zip_code: zipCode,
        system_size_kw: systemSizeKw ? parseFloat(systemSizeKw) : undefined,
        panel_count: panelCount ? parseInt(panelCount) : undefined,
        inverter_type: inverterType || undefined,
        revenue_type: revenueType,
        estimated_revenue: estimatedRevenue ? parseFloat(estimatedRevenue) : undefined,
        actual_revenue: actualRevenue ? parseFloat(actualRevenue) : undefined,
        financing_type: financingType || undefined,
        monthly_payment: monthlyPayment ? parseFloat(monthlyPayment) : undefined,
        current_stage: currentStage,
        has_mpu: hasMpu,
        has_battery: hasBattery,
        has_trench: hasTrench,
        ahj_id: ahjId || undefined,
        ahj_jurisdiction: ahjJurisdiction || undefined,
        permit_number: permitNumber || undefined,
        utility_account_number: utilityAccountNumber || undefined,
        assigned_installer: assignedInstaller || undefined,
        installation_date: installationDate || undefined,
        pto_date: ptoDate || undefined,
        project_notes: projectNotes,
      });

      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error || 'Failed to update project');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
          <Edit className="h-4 w-4 mr-2" />
          Edit Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Project</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update the project information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-2">Customer Information</h3>
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

            {/* System Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-2">System Details</h3>
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
                  <Label htmlFor="panelCount" className="text-gray-300">Panel Count</Label>
                  <Input
                    id="panelCount"
                    type="number"
                    value={panelCount}
                    onChange={(e) => setPanelCount(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="inverterType" className="text-gray-300">Inverter Type</Label>
                <Input
                  id="inverterType"
                  value={inverterType}
                  onChange={(e) => setInverterType(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="e.g., Enphase IQ8+"
                />
              </div>
            </div>

            {/* Project Adders */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-2">Project Adders</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center justify-between space-x-2 bg-gray-800 p-3 rounded">
                  <Label htmlFor="hasMpu" className="text-gray-300">MPU Upgrade</Label>
                  <Switch
                    id="hasMpu"
                    checked={hasMpu}
                    onCheckedChange={setHasMpu}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 bg-gray-800 p-3 rounded">
                  <Label htmlFor="hasBattery" className="text-gray-300">Battery</Label>
                  <Switch
                    id="hasBattery"
                    checked={hasBattery}
                    onCheckedChange={setHasBattery}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 bg-gray-800 p-3 rounded">
                  <Label htmlFor="hasTrench" className="text-gray-300">Trench Work</Label>
                  <Switch
                    id="hasTrench"
                    checked={hasTrench}
                    onCheckedChange={setHasTrench}
                  />
                </div>
              </div>
            </div>

            {/* Revenue & Financials */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-2">Revenue & Financials</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="revenueType" className="text-gray-300">Revenue Type</Label>
                  <Select value={revenueType} onValueChange={(value) => setRevenueType(value as RevenueType)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {Object.entries(REVENUE_TYPE_INFO).map(([value, info]) => (
                        <SelectItem key={value} value={value}>{info.label} (${info.rate}/W)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="financingType" className="text-gray-300">Financing Type</Label>
                  <Select value={financingType || '_none'} onValueChange={(value) => setFinancingType(value === '_none' ? '' : value as FinancingType)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="_none">Not Set</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="loan">Loan</SelectItem>
                      <SelectItem value="lease">Lease</SelectItem>
                      <SelectItem value="ppa">PPA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedRevenue" className="text-gray-300">Est. Revenue ($)</Label>
                  <Input
                    id="estimatedRevenue"
                    type="number"
                    value={estimatedRevenue}
                    onChange={(e) => setEstimatedRevenue(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actualRevenue" className="text-gray-300">Actual Revenue ($)</Label>
                  <Input
                    id="actualRevenue"
                    type="number"
                    value={actualRevenue}
                    onChange={(e) => setActualRevenue(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyPayment" className="text-gray-300">Monthly Payment ($)</Label>
                  <Input
                    id="monthlyPayment"
                    type="number"
                    value={monthlyPayment}
                    onChange={(e) => setMonthlyPayment(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Pipeline Status */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-2">Pipeline Status</h3>
              <div className="space-y-2">
                <Label htmlFor="currentStage" className="text-gray-300">Current Stage</Label>
                <Select value={currentStage.toString()} onValueChange={(value) => setCurrentStage(parseInt(value) as ProjectStage)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {Object.entries(PROJECT_STAGE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{value}. {label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Permitting & Compliance */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-2">Permitting & Compliance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ahjId" className="text-gray-300">AHJ (Authority Having Jurisdiction)</Label>
                  <Select value={ahjId || 'none'} onValueChange={(value) => setAhjId(value === 'none' ? '' : value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder={loadingAhjs ? "Loading AHJs..." : "Select AHJ..."} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {ahjs.map((ahj) => (
                        <SelectItem key={ahj.id} value={ahj.id}>
                          {ahj.name} ({ahj.state})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permitNumber" className="text-gray-300">Permit Number</Label>
                  <Input
                    id="permitNumber"
                    value={permitNumber}
                    onChange={(e) => setPermitNumber(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="utilityAccountNumber" className="text-gray-300">Utility Account Number</Label>
                <Input
                  id="utilityAccountNumber"
                  value={utilityAccountNumber}
                  onChange={(e) => setUtilityAccountNumber(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            {/* Assignment & Dates */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-2">Assignment & Dates</h3>
              <div className="space-y-2">
                <Label htmlFor="assignedInstaller" className="text-gray-300">Assigned Installer</Label>
                <Input
                  id="assignedInstaller"
                  value={assignedInstaller}
                  onChange={(e) => setAssignedInstaller(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="installationDate" className="text-gray-300">Installation Date</Label>
                  <Input
                    id="installationDate"
                    type="date"
                    value={installationDate}
                    onChange={(e) => setInstallationDate(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ptoDate" className="text-gray-300">PTO Date</Label>
                  <Input
                    id="ptoDate"
                    type="date"
                    value={ptoDate}
                    onChange={(e) => setPtoDate(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-2">Notes</h3>
              <div className="space-y-2">
                <Label htmlFor="projectNotes" className="text-gray-300">Project Notes</Label>
                <Textarea
                  id="projectNotes"
                  value={projectNotes}
                  onChange={(e) => setProjectNotes(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                  placeholder="Add any additional project notes..."
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
