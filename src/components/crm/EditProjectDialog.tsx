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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateProject } from '@/app/crm/actions';
import type { ProjectV2 } from '@/types/crm';
import {
  PROJECT_STAGE_LABELS,
  REVENUE_TYPE_INFO,
  type ProjectStage,
  type RevenueType,
  type FinancingType,
} from '@/types/crm';
import { DesignUploader, type ExtractedDesignData } from './DesignUploader';
import { ProjectFileUploader } from './ProjectFileUploader';

interface EditProjectDialogProps {
  project: ProjectV2;
}

export function EditProjectDialog({ project }: EditProjectDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const [hasGroundMount, setHasGroundMount] = useState(project.has_ground_mount || false);
  const [hasEvCharger, setHasEvCharger] = useState(project.has_ev_charger || false);
  const [trenchLengthFt, setTrenchLengthFt] = useState(project.trench_length_ft?.toString() || '');
  const [batteryCount, setBatteryCount] = useState(project.battery_count?.toString() || '');
  const [hasSteepPitch, setHasSteepPitch] = useState(project.has_steep_pitch || false);
  const [hasFlatRoof, setHasFlatRoof] = useState(project.has_flat_roof || false);
  const [hasTileRoof, setHasTileRoof] = useState(project.has_tile_roof || false);
  const [hasMetalRoof, setHasMetalRoof] = useState(project.has_metal_roof || false);
  const [hasThreeStory, setHasThreeStory] = useState(project.has_three_story || false);
  const [moduleWattage, setModuleWattage] = useState(project.module_wattage?.toString() || '');
  const [moduleModel, setModuleModel] = useState(project.module_model || '');
  const [arrayCount, setArrayCount] = useState(project.array_count?.toString() || '');
  const [roofType, setRoofType] = useState(project.roof_type || '');
  const [roofSections, setRoofSections] = useState(project.roof_sections || []);
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

  // Handler for design PDF extraction
  const handleDesignDataExtracted = (data: ExtractedDesignData) => {
    // Debug: Log extracted adders to trace MPU detection
    console.log('[EditProjectDialog] Extracted adders:', data.adders);
    console.log('[EditProjectDialog] has_mpu value:', data.adders?.has_mpu);

    // Auto-populate form fields from extracted data
    if (data.customer_name) setCustomerName(data.customer_name);
    if (data.address) setAddress(data.address);
    if (data.city) setCity(data.city);
    if (data.state) setState(data.state);
    if (data.zip_code) setZipCode(data.zip_code);
    if (data.system_size_kw) setSystemSizeKw(data.system_size_kw.toString());
    if (data.module_count) setPanelCount(data.module_count.toString());
    if (data.module_wattage) setModuleWattage(data.module_wattage.toString());
    if (data.module_model) setModuleModel(data.module_model);
    if (data.inverter_model) setInverterType(data.inverter_model);
    if (data.array_count) setArrayCount(data.array_count.toString());
    if (data.roof_type) setRoofType(data.roof_type);

    // Set roof sections from extracted data
    if (data.roof_sections && data.roof_sections.length > 0) {
      setRoofSections(data.roof_sections);
    }

    // Set permitting and utility info
    if (data.ahj_jurisdiction) setAhjJurisdiction(data.ahj_jurisdiction);
    if (data.utility_company) setUtilityAccountNumber(data.utility_company); // Store in utility field for now

    // Set adders from extracted data
    if (data.adders.has_mpu !== undefined) {
      console.log('[EditProjectDialog] Setting hasMpu to:', data.adders.has_mpu);
      setHasMpu(data.adders.has_mpu);
    }
    if (data.adders.has_battery !== undefined) setHasBattery(data.adders.has_battery);
    if (data.adders.has_trench !== undefined) setHasTrench(data.adders.has_trench);
    if (data.adders.has_ground_mount !== undefined) setHasGroundMount(data.adders.has_ground_mount);
    if (data.adders.has_ev_charger !== undefined) setHasEvCharger(data.adders.has_ev_charger);
    if (data.adders.trench_length_ft) setTrenchLengthFt(data.adders.trench_length_ft.toString());
    if (data.adders.battery_count) setBatteryCount(data.adders.battery_count.toString());
    if (data.adders.has_steep_pitch !== undefined) setHasSteepPitch(data.adders.has_steep_pitch);
    if (data.adders.has_flat_roof !== undefined) setHasFlatRoof(data.adders.has_flat_roof);
    if (data.adders.has_tile_roof !== undefined) setHasTileRoof(data.adders.has_tile_roof);
    if (data.adders.has_metal_roof !== undefined) setHasMetalRoof(data.adders.has_metal_roof);
    if (data.adders.has_three_story !== undefined) setHasThreeStory(data.adders.has_three_story);
  };

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
        module_wattage: moduleWattage ? parseInt(moduleWattage) : undefined,
        module_model: moduleModel || undefined,
        inverter_type: inverterType || undefined,
        array_count: arrayCount ? parseInt(arrayCount) : undefined,
        roof_type: roofType || undefined,
        roof_sections: roofSections.length > 0 ? roofSections : undefined,
        revenue_type: revenueType,
        estimated_revenue: estimatedRevenue ? parseFloat(estimatedRevenue) : undefined,
        actual_revenue: actualRevenue ? parseFloat(actualRevenue) : undefined,
        financing_type: financingType || undefined,
        monthly_payment: monthlyPayment ? parseFloat(monthlyPayment) : undefined,
        current_stage: currentStage,
        has_mpu: hasMpu,
        has_battery: hasBattery,
        has_trench: hasTrench,
        has_ground_mount: hasGroundMount,
        has_ev_charger: hasEvCharger,
        trench_length_ft: trenchLengthFt ? parseInt(trenchLengthFt) : undefined,
        battery_count: batteryCount ? parseInt(batteryCount) : undefined,
        has_steep_pitch: hasSteepPitch,
        has_flat_roof: hasFlatRoof,
        has_tile_roof: hasTileRoof,
        has_metal_roof: hasMetalRoof,
        has_three_story: hasThreeStory,
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
            {/* Design/Planset Upload */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-2">
                Upload Design/Planset PDF
              </h3>
              <p className="text-sm text-gray-400">
                Upload a design or planset PDF to automatically extract project details.
              </p>
              <DesignUploader
                onDataExtracted={handleDesignDataExtracted}
                projectId={project.id}
                compact
              />
            </div>

            {/* Project Documents Upload */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-2">
                Project Documents
              </h3>
              <p className="text-sm text-gray-400">
                Upload project documents to Google Drive (utility bills, permits, inspection reports, etc.)
              </p>
              <ProjectFileUploader projectId={project.id} />
            </div>

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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="moduleWattage" className="text-gray-300">Module Wattage (W)</Label>
                  <Input
                    id="moduleWattage"
                    type="number"
                    value={moduleWattage}
                    onChange={(e) => setModuleWattage(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="e.g., 400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arrayCount" className="text-gray-300">Array Count</Label>
                  <Input
                    id="arrayCount"
                    type="number"
                    value={arrayCount}
                    onChange={(e) => setArrayCount(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Number of arrays"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="moduleModel" className="text-gray-300">Module Model</Label>
                  <Input
                    id="moduleModel"
                    value={moduleModel}
                    onChange={(e) => setModuleModel(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="e.g., REC Alpha Pure 400"
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
              <div className="space-y-2">
                <Label htmlFor="roofType" className="text-gray-300">Roof Type</Label>
                <Select value={roofType || '_none'} onValueChange={(value) => setRoofType(value === '_none' ? '' : value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select roof type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="_none">Not Set</SelectItem>
                    <SelectItem value="composition">Composition/Asphalt Shingle</SelectItem>
                    <SelectItem value="tile">Tile</SelectItem>
                    <SelectItem value="metal">Metal</SelectItem>
                    <SelectItem value="flat">Flat/Low-Slope</SelectItem>
                    <SelectItem value="shake">Wood Shake</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Roof Sections (from Claude Vision extraction) */}
            {roofSections.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-2">
                  Roof Sections ({roofSections.length})
                </h3>
                <div className="space-y-2">
                  {roofSections.map((section, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-gray-800 p-3 rounded text-sm">
                      <span className="text-white font-medium min-w-[100px]">{section.section_name}</span>
                      <span className="text-gray-300">{section.panel_count} panels</span>
                      {section.pitch_ratio && (
                        <span className="text-blue-400">Pitch: {section.pitch_ratio}</span>
                      )}
                      {section.pitch_degrees && (
                        <span className="text-blue-400">({section.pitch_degrees}°)</span>
                      )}
                      {section.orientation && (
                        <span className="text-yellow-400">Facing: {section.orientation}</span>
                      )}
                      {section.azimuth && (
                        <span className="text-gray-500">({section.azimuth}°)</span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Extracted from design PDF. Upload a new PDF to update.
                </p>
              </div>
            )}

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
                    className="data-[state=unchecked]:bg-gray-600 data-[state=checked]:bg-green-600"
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 bg-gray-800 p-3 rounded">
                  <Label htmlFor="hasBattery" className="text-gray-300">Battery</Label>
                  <Switch
                    id="hasBattery"
                    checked={hasBattery}
                    onCheckedChange={setHasBattery}
                    className="data-[state=unchecked]:bg-gray-600 data-[state=checked]:bg-green-600"
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 bg-gray-800 p-3 rounded">
                  <Label htmlFor="hasTrench" className="text-gray-300">Trench Work</Label>
                  <Switch
                    id="hasTrench"
                    checked={hasTrench}
                    onCheckedChange={setHasTrench}
                    className="data-[state=unchecked]:bg-gray-600 data-[state=checked]:bg-green-600"
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 bg-gray-800 p-3 rounded">
                  <Label htmlFor="hasGroundMount" className="text-gray-300">Ground Mount</Label>
                  <Switch
                    id="hasGroundMount"
                    checked={hasGroundMount}
                    onCheckedChange={setHasGroundMount}
                    className="data-[state=unchecked]:bg-gray-600 data-[state=checked]:bg-green-600"
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 bg-gray-800 p-3 rounded">
                  <Label htmlFor="hasEvCharger" className="text-gray-300">EV Charger</Label>
                  <Switch
                    id="hasEvCharger"
                    checked={hasEvCharger}
                    onCheckedChange={setHasEvCharger}
                    className="data-[state=unchecked]:bg-gray-600 data-[state=checked]:bg-green-600"
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 bg-gray-800 p-3 rounded">
                  <Label htmlFor="hasThreeStory" className="text-gray-300">3-Story</Label>
                  <Switch
                    id="hasThreeStory"
                    checked={hasThreeStory}
                    onCheckedChange={setHasThreeStory}
                    className="data-[state=unchecked]:bg-gray-600 data-[state=checked]:bg-green-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batteryCount" className="text-gray-300">Battery Count</Label>
                  <Input
                    id="batteryCount"
                    type="number"
                    value={batteryCount}
                    onChange={(e) => setBatteryCount(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Number of batteries"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trenchLengthFt" className="text-gray-300">Trench Length (ft)</Label>
                  <Input
                    id="trenchLengthFt"
                    type="number"
                    value={trenchLengthFt}
                    onChange={(e) => setTrenchLengthFt(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Feet of trenching"
                  />
                </div>
              </div>
            </div>

            {/* Roof Characteristics */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-2">Roof Characteristics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center justify-between space-x-2 bg-gray-800 p-3 rounded">
                  <Label htmlFor="hasSteepPitch" className="text-gray-300">Steep Pitch</Label>
                  <Switch
                    id="hasSteepPitch"
                    checked={hasSteepPitch}
                    onCheckedChange={setHasSteepPitch}
                    className="data-[state=unchecked]:bg-gray-600 data-[state=checked]:bg-green-600"
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 bg-gray-800 p-3 rounded">
                  <Label htmlFor="hasFlatRoof" className="text-gray-300">Flat Roof</Label>
                  <Switch
                    id="hasFlatRoof"
                    checked={hasFlatRoof}
                    onCheckedChange={setHasFlatRoof}
                    className="data-[state=unchecked]:bg-gray-600 data-[state=checked]:bg-green-600"
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 bg-gray-800 p-3 rounded">
                  <Label htmlFor="hasTileRoof" className="text-gray-300">Tile Roof</Label>
                  <Switch
                    id="hasTileRoof"
                    checked={hasTileRoof}
                    onCheckedChange={setHasTileRoof}
                    className="data-[state=unchecked]:bg-gray-600 data-[state=checked]:bg-green-600"
                  />
                </div>
                <div className="flex items-center justify-between space-x-2 bg-gray-800 p-3 rounded">
                  <Label htmlFor="hasMetalRoof" className="text-gray-300">Metal Roof</Label>
                  <Switch
                    id="hasMetalRoof"
                    checked={hasMetalRoof}
                    onCheckedChange={setHasMetalRoof}
                    className="data-[state=unchecked]:bg-gray-600 data-[state=checked]:bg-green-600"
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="utilityAccountNumber" className="text-gray-300">Utility</Label>
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
