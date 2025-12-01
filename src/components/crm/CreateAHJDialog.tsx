'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
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

interface CreateAHJDialogProps {
  children?: React.ReactNode;
}

export function CreateAHJDialog({ children }: CreateAHJDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [county, setCounty] = useState('');
  const [city, setCity] = useState('');
  const [buildingDeptNumber, setBuildingDeptNumber] = useState('');
  const [buildingDeptPhone, setBuildingDeptPhone] = useState('');
  const [buildingDeptEmail, setBuildingDeptEmail] = useState('');
  const [buildingDeptWebsite, setBuildingDeptWebsite] = useState('');
  const [inspectorName, setInspectorName] = useState('');
  const [inspectorNumber, setInspectorNumber] = useState('');
  const [inspectorPhone, setInspectorPhone] = useState('');
  const [inspectorEmail, setInspectorEmail] = useState('');
  const [requiresTechOnSite, setRequiresTechOnSite] = useState(false);
  const [requiresRoughInspection, setRequiresRoughInspection] = useState(false);
  const [requiresFinalInspection, setRequiresFinalInspection] = useState(true);
  const [requiresElectricalInspection, setRequiresElectricalInspection] = useState(true);
  const [typicalPermitTurnaroundDays, setTypicalPermitTurnaroundDays] = useState('');
  const [typicalInspectionTurnaroundDays, setTypicalInspectionTurnaroundDays] = useState('');
  const [permitApplicationUrl, setPermitApplicationUrl] = useState('');
  const [onlinePermittingAvailable, setOnlinePermittingAvailable] = useState(false);
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [notes, setNotes] = useState('');
  const [active, setActive] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !state) {
      setError('Name and State are required');
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/crm/ahj', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            state: state.toUpperCase(),
            county: county || undefined,
            city: city || undefined,
            building_department_number: buildingDeptNumber || undefined,
            building_department_phone: buildingDeptPhone || undefined,
            building_department_email: buildingDeptEmail || undefined,
            building_department_website: buildingDeptWebsite || undefined,
            inspector_name: inspectorName || undefined,
            inspector_number: inspectorNumber || undefined,
            inspector_phone: inspectorPhone || undefined,
            inspector_email: inspectorEmail || undefined,
            requires_tech_on_site: requiresTechOnSite,
            requires_rough_inspection: requiresRoughInspection,
            requires_final_inspection: requiresFinalInspection,
            requires_electrical_inspection: requiresElectricalInspection,
            typical_permit_turnaround_days: typicalPermitTurnaroundDays
              ? parseInt(typicalPermitTurnaroundDays)
              : undefined,
            typical_inspection_turnaround_days: typicalInspectionTurnaroundDays
              ? parseInt(typicalInspectionTurnaroundDays)
              : undefined,
            permit_application_url: permitApplicationUrl || undefined,
            online_permitting_available: onlinePermittingAvailable,
            special_requirements: specialRequirements || undefined,
            notes: notes || undefined,
            active,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create AHJ');
        }

        // Reset form
        setName('');
        setState('');
        setCounty('');
        setCity('');
        setBuildingDeptNumber('');
        setBuildingDeptPhone('');
        setBuildingDeptEmail('');
        setBuildingDeptWebsite('');
        setInspectorName('');
        setInspectorNumber('');
        setInspectorPhone('');
        setInspectorEmail('');
        setRequiresTechOnSite(false);
        setRequiresRoughInspection(false);
        setRequiresFinalInspection(true);
        setRequiresElectricalInspection(true);
        setTypicalPermitTurnaroundDays('');
        setTypicalInspectionTurnaroundDays('');
        setPermitApplicationUrl('');
        setOnlinePermittingAvailable(false);
        setSpecialRequirements('');
        setNotes('');
        setActive(true);

        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add AHJ
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle>Add New AHJ</DialogTitle>
          <DialogDescription>
            Create a new Authority Having Jurisdiction record for permitting and inspection tracking.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="St. Clair County"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    placeholder="IL"
                    maxLength={2}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="county">County</Label>
                  <Input
                    id="county"
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    placeholder="St. Clair"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Belleville"
                  />
                </div>
              </div>
            </div>

            {/* Building Department Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Building Department Contact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buildingDeptNumber">Department Number</Label>
                  <Input
                    id="buildingDeptNumber"
                    value={buildingDeptNumber}
                    onChange={(e) => setBuildingDeptNumber(e.target.value)}
                    placeholder="Dept #123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buildingDeptPhone">Phone</Label>
                  <Input
                    id="buildingDeptPhone"
                    type="tel"
                    value={buildingDeptPhone}
                    onChange={(e) => setBuildingDeptPhone(e.target.value)}
                    placeholder="(618) 555-1234"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buildingDeptEmail">Email</Label>
                  <Input
                    id="buildingDeptEmail"
                    type="email"
                    value={buildingDeptEmail}
                    onChange={(e) => setBuildingDeptEmail(e.target.value)}
                    placeholder="building@county.gov"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buildingDeptWebsite">Website</Label>
                  <Input
                    id="buildingDeptWebsite"
                    type="url"
                    value={buildingDeptWebsite}
                    onChange={(e) => setBuildingDeptWebsite(e.target.value)}
                    placeholder="https://county.gov/building"
                  />
                </div>
              </div>
            </div>

            {/* Inspector Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Inspector Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inspectorName">Inspector Name</Label>
                  <Input
                    id="inspectorName"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inspectorNumber">Inspector Number</Label>
                  <Input
                    id="inspectorNumber"
                    value={inspectorNumber}
                    onChange={(e) => setInspectorNumber(e.target.value)}
                    placeholder="INS-123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inspectorPhone">Inspector Phone</Label>
                  <Input
                    id="inspectorPhone"
                    type="tel"
                    value={inspectorPhone}
                    onChange={(e) => setInspectorPhone(e.target.value)}
                    placeholder="(618) 555-5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inspectorEmail">Inspector Email</Label>
                  <Input
                    id="inspectorEmail"
                    type="email"
                    value={inspectorEmail}
                    onChange={(e) => setInspectorEmail(e.target.value)}
                    placeholder="inspector@county.gov"
                  />
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Inspection Requirements</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="requiresTechOnSite" className="cursor-pointer">
                    Requires Tech On Site
                  </Label>
                  <Switch
                    id="requiresTechOnSite"
                    checked={requiresTechOnSite}
                    onCheckedChange={setRequiresTechOnSite}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="requiresRoughInspection" className="cursor-pointer">
                    Requires Rough Inspection
                  </Label>
                  <Switch
                    id="requiresRoughInspection"
                    checked={requiresRoughInspection}
                    onCheckedChange={setRequiresRoughInspection}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="requiresFinalInspection" className="cursor-pointer">
                    Requires Final Inspection
                  </Label>
                  <Switch
                    id="requiresFinalInspection"
                    checked={requiresFinalInspection}
                    onCheckedChange={setRequiresFinalInspection}
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="requiresElectricalInspection" className="cursor-pointer">
                    Requires Electrical Inspection
                  </Label>
                  <Switch
                    id="requiresElectricalInspection"
                    checked={requiresElectricalInspection}
                    onCheckedChange={setRequiresElectricalInspection}
                  />
                </div>
              </div>
            </div>

            {/* Permitting Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Permitting Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="typicalPermitTurnaroundDays">
                    Typical Permit Turnaround (days)
                  </Label>
                  <Input
                    id="typicalPermitTurnaroundDays"
                    type="number"
                    value={typicalPermitTurnaroundDays}
                    onChange={(e) => setTypicalPermitTurnaroundDays(e.target.value)}
                    placeholder="14"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="typicalInspectionTurnaroundDays">
                    Typical Inspection Turnaround (days)
                  </Label>
                  <Input
                    id="typicalInspectionTurnaroundDays"
                    type="number"
                    value={typicalInspectionTurnaroundDays}
                    onChange={(e) => setTypicalInspectionTurnaroundDays(e.target.value)}
                    placeholder="7"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permitApplicationUrl">Permit Application URL</Label>
                  <Input
                    id="permitApplicationUrl"
                    type="url"
                    value={permitApplicationUrl}
                    onChange={(e) => setPermitApplicationUrl(e.target.value)}
                    placeholder="https://county.gov/permits"
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="onlinePermittingAvailable" className="cursor-pointer">
                    Online Permitting Available
                  </Label>
                  <Switch
                    id="onlinePermittingAvailable"
                    checked={onlinePermittingAvailable}
                    onCheckedChange={setOnlinePermittingAvailable}
                  />
                </div>
              </div>
            </div>

            {/* Special Requirements & Notes */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Additional Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="specialRequirements">Special Requirements</Label>
                  <Textarea
                    id="specialRequirements"
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    placeholder="Any special requirements or procedures..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes about this AHJ..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="active" className="cursor-pointer">
                Active
              </Label>
              <Switch
                id="active"
                checked={active}
                onCheckedChange={setActive}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-[#ff0000] hover:bg-[#cc0000]">
              {isPending ? 'Creating...' : 'Create AHJ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
