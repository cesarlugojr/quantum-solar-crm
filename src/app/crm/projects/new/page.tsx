'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
import { createProject } from '@/app/crm/actions';
import {
  PROJECT_STAGE_LABELS,
  REVENUE_TYPE_INFO,
  type ProjectStage,
  type RevenueType,
  type FinancingType,
} from '@/types/crm';
import { DesignUploader, type ExtractedDesignData } from '@/components/crm/DesignUploader';

export default function NewProjectPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [systemSizeKw, setSystemSizeKw] = useState('');
  const [panelCount, setPanelCount] = useState('');
  const [inverterType, setInverterType] = useState('');
  const [revenueType, setRevenueType] = useState<RevenueType>('self_gen');
  const [estimatedRevenue, setEstimatedRevenue] = useState('');
  const [financingType, setFinancingType] = useState<FinancingType | ''>('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [currentStage, setCurrentStage] = useState<ProjectStage>(1);
  const [hasMpu, setHasMpu] = useState(false);
  const [hasBattery, setHasBattery] = useState(false);
  const [hasTrench, setHasTrench] = useState(false);
  const [ahjJurisdiction, setAhjJurisdiction] = useState('');
  const [permitNumber, setPermitNumber] = useState('');
  const [utilityAccountNumber, setUtilityAccountNumber] = useState('');
  const [assignedInstaller, setAssignedInstaller] = useState('');
  const [installationDate, setInstallationDate] = useState('');
  const [ptoDate, setPtoDate] = useState('');
  const [projectNotes, setProjectNotes] = useState('');

  // Handler for design PDF extraction
  const handleDesignDataExtracted = (data: ExtractedDesignData) => {
    // Auto-populate form fields from extracted data
    if (data.customer_name) setCustomerName(data.customer_name);
    if (data.address) setAddress(data.address);
    if (data.city) setCity(data.city);
    if (data.state) setState(data.state);
    if (data.zip_code) setZipCode(data.zip_code);
    if (data.system_size_kw) setSystemSizeKw(data.system_size_kw.toString());
    if (data.module_count) setPanelCount(data.module_count.toString());
    if (data.inverter_model) setInverterType(data.inverter_model);

    // Set adders from extracted data
    if (data.adders.has_mpu !== undefined) setHasMpu(data.adders.has_mpu);
    if (data.adders.has_battery !== undefined) setHasBattery(data.adders.has_battery);
    if (data.adders.has_trench !== undefined) setHasTrench(data.adders.has_trench);

    // Calculate estimated revenue based on system size and revenue type
    if (data.system_size_kw) {
      const rate = REVENUE_TYPE_INFO[revenueType]?.rate || 1.47;
      const revenue = data.system_size_kw * 1000 * rate;
      setEstimatedRevenue(revenue.toFixed(2));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError('Customer name is required');
      return;
    }

    startTransition(async () => {
      const result = await createProject({
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
        financing_type: financingType || undefined,
        monthly_payment: monthlyPayment ? parseFloat(monthlyPayment) : undefined,
        current_stage: currentStage,
        has_mpu: hasMpu,
        has_battery: hasBattery,
        has_trench: hasTrench,
        ahj_jurisdiction: ahjJurisdiction || undefined,
        permit_number: permitNumber || undefined,
        utility_account_number: utilityAccountNumber || undefined,
        assigned_installer: assignedInstaller || undefined,
        installation_date: installationDate || undefined,
        pto_date: ptoDate || undefined,
        project_notes: projectNotes,
      });

      if (result.success && result.id) {
        router.push(`/crm/projects/${result.id}`);
      } else {
        setError(result.error || 'Failed to create project');
      }
    });
  };

  // Auto-calculate estimated revenue when system size or revenue type changes
  const handleSystemSizeChange = (value: string) => {
    setSystemSizeKw(value);
    if (value) {
      const rate = REVENUE_TYPE_INFO[revenueType]?.rate || 1.47;
      const revenue = parseFloat(value) * 1000 * rate;
      setEstimatedRevenue(revenue.toFixed(2));
    }
  };

  const handleRevenueTypeChange = (value: RevenueType) => {
    setRevenueType(value);
    if (systemSizeKw) {
      const rate = REVENUE_TYPE_INFO[value]?.rate || 1.47;
      const revenue = parseFloat(systemSizeKw) * 1000 * rate;
      setEstimatedRevenue(revenue.toFixed(2));
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/crm/projects">
        <Button variant="ghost" className="text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </Link>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Create New Project</h1>
        <p className="text-gray-400 mt-1">
          Add a new solar installation project to the pipeline
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="space-y-8">
          {/* Design/Planset Upload */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Upload Design/Planset PDF
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Upload a design or planset PDF to automatically extract project details.
              The extracted data will populate the form fields below.
            </p>
            <DesignUploader onDataExtracted={handleDesignDataExtracted} />
          </div>

          {/* Customer Information */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="customerName" className="text-gray-300">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="(555) 555-5555"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Address Information</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-300">Street Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="123 Main St"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 space-y-2">
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
                    placeholder="IL"
                  />
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
            </div>
          </div>

          {/* System Details */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">System Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="systemSizeKw" className="text-gray-300">System Size (kW)</Label>
                <Input
                  id="systemSizeKw"
                  type="number"
                  step="0.1"
                  value={systemSizeKw}
                  onChange={(e) => handleSystemSizeChange(e.target.value)}
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
          </div>

          {/* Project Adders */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Project Adders</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between space-x-2 bg-gray-800 p-4 rounded-lg">
                <Label htmlFor="hasMpu" className="text-gray-300">MPU Upgrade</Label>
                <Switch
                  id="hasMpu"
                  checked={hasMpu}
                  onCheckedChange={setHasMpu}
                />
              </div>
              <div className="flex items-center justify-between space-x-2 bg-gray-800 p-4 rounded-lg">
                <Label htmlFor="hasBattery" className="text-gray-300">Battery Storage</Label>
                <Switch
                  id="hasBattery"
                  checked={hasBattery}
                  onCheckedChange={setHasBattery}
                />
              </div>
              <div className="flex items-center justify-between space-x-2 bg-gray-800 p-4 rounded-lg">
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
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Revenue & Financials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="revenueType" className="text-gray-300">Revenue Type</Label>
                <Select value={revenueType} onValueChange={handleRevenueTypeChange}>
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
              <div className="space-y-2">
                <Label htmlFor="estimatedRevenue" className="text-gray-300">Estimated Revenue ($)</Label>
                <Input
                  id="estimatedRevenue"
                  type="number"
                  value={estimatedRevenue}
                  onChange={(e) => setEstimatedRevenue(e.target.value)}
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
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Pipeline Status</h2>
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
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Permitting & Compliance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ahjJurisdiction" className="text-gray-300">AHJ Jurisdiction</Label>
                <Input
                  id="ahjJurisdiction"
                  value={ahjJurisdiction}
                  onChange={(e) => setAhjJurisdiction(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
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
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="utilityAccountNumber" className="text-gray-300">Utility Account Number</Label>
                <Input
                  id="utilityAccountNumber"
                  value={utilityAccountNumber}
                  onChange={(e) => setUtilityAccountNumber(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
          </div>

          {/* Assignment & Dates */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Assignment & Dates</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assignedInstaller" className="text-gray-300">Assigned Installer</Label>
                <Input
                  id="assignedInstaller"
                  value={assignedInstaller}
                  onChange={(e) => setAssignedInstaller(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Notes */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Notes</h2>
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

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#ff0000] hover:bg-[#cc0000] text-white"
            >
              {isPending ? 'Creating...' : 'Create Project'}
            </Button>
            <Link href="/crm/projects">
              <Button
                type="button"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
