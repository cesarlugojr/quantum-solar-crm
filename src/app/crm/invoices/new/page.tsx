'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calculator,
  Save,
  FileText,
  DollarSign,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  Client,
  RateSheet,
  InvoiceMilestone,
  AdderConfig,
} from '@/types/crm';
import { formatCurrency, calculateLaborAmount, calculateAdderAmount } from '@/types/crm';

interface LineItemDraft {
  id: string;
  item_type: string;
  description: string;
  quantity: number;
  unit: string;
  unit_rate: number;
  amount: number;
  adder_key?: string;
}

// GoodPWR adder options with their keys
const ADDER_OPTIONS = [
  { key: 'ground_mount_over_8kw', label: 'Ground Mount (>8kW)', unit: 'watt' },
  { key: 'ground_mount_under_8kw', label: 'Ground Mount (<8kW)', unit: 'flat' },
  { key: 'trench_softscape', label: 'Trench - Softscape', unit: 'foot' },
  { key: 'trench_concrete', label: 'Trench - Concrete', unit: 'foot' },
  { key: 'pest_control', label: 'Pest Control (Critter Guard)', unit: 'module' },
  { key: 'metal_roof', label: 'Metal Roof', unit: 'watt' },
  { key: 'flat_roof', label: 'Flat Roof', unit: 'watt' },
  { key: 'tile_roof', label: 'Tile Roof', unit: 'watt' },
  { key: 'steep_pitch', label: 'Steep Pitch (8:12+)', unit: 'watt' },
  { key: 'three_story', label: 'Three Story', unit: 'watt' },
  { key: 'main_panel_upgrade', label: 'Main Panel Upgrade (MPU)', unit: 'flat' },
  { key: 'main_panel_upgrade_stucco', label: 'MPU - Stucco', unit: 'flat' },
  { key: 'main_panel_upgrade_norcal', label: 'MPU - NorCal', unit: 'flat' },
  { key: 'whole_home_battery_first', label: 'Whole Home Battery (First)', unit: 'flat' },
  { key: 'whole_home_battery_additional', label: 'Whole Home Battery (Additional)', unit: 'each' },
  { key: 'backup_battery_first', label: 'Backup Battery (First)', unit: 'flat' },
  { key: 'backup_battery_additional', label: 'Backup Battery (Additional)', unit: 'each' },
  { key: 'ev_charger', label: 'EV Charger', unit: 'flat' },
  { key: 'span_smart_panel', label: 'SPAN Smart Panel', unit: 'flat' },
  { key: 'derate_breaker', label: 'Derate Breaker', unit: 'flat' },
  { key: 'new_subpanel', label: 'New Subpanel', unit: 'flat' },
  { key: 'meter_swap', label: 'Meter Swap', unit: 'flat' },
  { key: 'home_surge_protector', label: 'Home Surge Protector', unit: 'flat' },
  { key: 'production_meter', label: 'Production Meter', unit: 'flat' },
  { key: 'small_system_under_4kw', label: 'Small System (<4kW)', unit: 'flat' },
  { key: 'over_4_arrays', label: 'Over 4 Arrays', unit: 'flat' },
  { key: 'remove_reinstall', label: 'Remove & Reinstall', unit: 'module' },
  { key: 'remove_discard', label: 'Remove & Discard', unit: 'module' },
];

export default function NewInvoicePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Client and rate sheet data
  const [clients, setClients] = useState<Client[]>([]);
  const [rateSheet, setRateSheet] = useState<RateSheet | null>(null);

  // Form fields
  const [clientId, setClientId] = useState<string>('');
  const [gpin, setGpin] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [systemSizeKw, setSystemSizeKw] = useState<string>('');
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [terms, setTerms] = useState('Net 10');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [milestone, setMilestone] = useState<InvoiceMilestone>('M1');
  const [notes, setNotes] = useState('');

  // Line items
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([]);

  // Base rate selection (Option A or B)
  const [baseRateOption, setBaseRateOption] = useState<'A' | 'B'>('A');

  // Bonuses
  const [includeEarlyBonus, setIncludeEarlyBonus] = useState(false);
  const [includeInspectionBonus, setIncludeInspectionBonus] = useState(false);

  // Calculate system size in watts
  const systemSizeWatts = parseFloat(systemSizeKw || '0') * 1000;

  // Fetch clients on mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/crm/clients?include_rate_sheets=true');
        const data = await response.json();
        if (data.clients) {
          setClients(data.clients);
          // Pre-select GoodPWR if available
          const goodpwr = data.clients.find(
            (c: Client) => c.company_name?.toLowerCase().includes('goodpwr')
          );
          if (goodpwr) {
            setClientId(goodpwr.id);
          }
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    fetchClients();
  }, []);

  // Fetch rate sheet when client changes
  useEffect(() => {
    const fetchRateSheet = async () => {
      if (!clientId) {
        setRateSheet(null);
        return;
      }

      try {
        const response = await fetch(`/api/crm/clients?id=${clientId}&include_rate_sheets=true`);
        const data = await response.json();
        if (data.client?.rate_sheets?.length > 0) {
          // Get the active rate sheet
          const activeSheet = data.client.rate_sheets.find((rs: RateSheet) => rs.active);
          setRateSheet(activeSheet || data.client.rate_sheets[0]);
        } else {
          setRateSheet(null);
        }
      } catch (error) {
        console.error('Error fetching rate sheet:', error);
      }
    };
    fetchRateSheet();
  }, [clientId]);

  // Generate labor line item
  const generateLaborLineItem = useCallback((): LineItemDraft | null => {
    if (!rateSheet || !systemSizeWatts) return null;

    const baseRate = baseRateOption === 'A'
      ? rateSheet.base_rate_option_a
      : rateSheet.base_rate_option_b;

    const amount = calculateLaborAmount(
      systemSizeWatts,
      baseRate,
      milestone,
      rateSheet.m1_percentage,
      rateSheet.m2_percentage
    );

    const milestoneLabel = milestone === 'FULL' ? '' : ` (${milestone})`;
    const optionLabel = baseRateOption === 'A' ? 'Option A' : 'Option B';

    return {
      id: `labor-${milestone}`,
      item_type: 'labor',
      description: `Labor Only Install${milestoneLabel} - ${optionLabel}`,
      quantity: systemSizeWatts,
      unit: 'W',
      unit_rate: baseRate * (milestone === 'M1' ? rateSheet.m1_percentage / 100 :
        milestone === 'M2' ? rateSheet.m2_percentage / 100 : 1),
      amount,
    };
  }, [rateSheet, systemSizeWatts, baseRateOption, milestone]);

  // Generate bonus line items
  const generateBonusLineItems = useCallback((): LineItemDraft[] => {
    if (!rateSheet || !systemSizeWatts) return [];

    const bonuses: LineItemDraft[] = [];

    if (includeEarlyBonus) {
      bonuses.push({
        id: 'bonus-early',
        item_type: 'bonus',
        description: 'Scheduled Early Bonus',
        quantity: systemSizeWatts,
        unit: 'W',
        unit_rate: rateSheet.early_schedule_bonus,
        amount: systemSizeWatts * rateSheet.early_schedule_bonus,
      });
    }

    if (includeInspectionBonus) {
      bonuses.push({
        id: 'bonus-inspection',
        item_type: 'bonus',
        description: 'Inspection Bonus',
        quantity: systemSizeWatts,
        unit: 'W',
        unit_rate: rateSheet.inspection_bonus,
        amount: systemSizeWatts * rateSheet.inspection_bonus,
      });
    }

    return bonuses;
  }, [rateSheet, systemSizeWatts, includeEarlyBonus, includeInspectionBonus]);

  // Add adder line item
  const addAdder = (adderKey: string) => {
    if (!rateSheet?.adders?.[adderKey]) return;

    const adderConfig = rateSheet.adders[adderKey] as AdderConfig;
    const option = ADDER_OPTIONS.find((o) => o.key === adderKey);

    // Determine default quantity
    let defaultQuantity = 1;
    if (adderConfig.unit === 'watt') {
      defaultQuantity = systemSizeWatts || 0;
    }

    const amount = calculateAdderAmount(adderConfig, defaultQuantity, systemSizeWatts);

    const newItem: LineItemDraft = {
      id: `adder-${adderKey}-${Date.now()}`,
      item_type: 'adder',
      description: adderConfig.description || option?.label || adderKey,
      quantity: defaultQuantity,
      unit: adderConfig.unit === 'watt' ? 'W' :
        adderConfig.unit === 'foot' ? 'ft' :
          adderConfig.unit === 'module' ? 'mod' : 'ea',
      unit_rate: adderConfig.rate,
      amount,
      adder_key: adderKey,
    };

    setLineItems((prev) => [...prev, newItem]);
  };

  // Update line item quantity
  const updateLineItemQuantity = (id: string, quantity: number) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const adderConfig = item.adder_key && rateSheet?.adders?.[item.adder_key];
        const amount = adderConfig
          ? calculateAdderAmount(adderConfig as AdderConfig, quantity, systemSizeWatts)
          : quantity * item.unit_rate;

        return { ...item, quantity, amount };
      })
    );
  };

  // Remove line item
  const removeLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculate totals
  const laborItem = generateLaborLineItem();
  const bonusItems = generateBonusLineItems();
  const allItems = [
    ...(laborItem ? [laborItem] : []),
    ...bonusItems,
    ...lineItems,
  ];

  const subtotal = allItems.reduce((sum, item) => sum + item.amount, 0);
  const total = subtotal; // No tax for now

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId) {
      alert('Please select a client');
      return;
    }

    if (!systemSizeWatts) {
      alert('Please enter the system size');
      return;
    }

    setSaving(true);

    try {
      // Prepare line items for API
      const apiLineItems = allItems.map((item, index) => ({
        line_number: index + 1,
        item_type: item.item_type,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_rate: item.unit_rate,
        amount: item.amount,
        adder_key: item.adder_key,
      }));

      const response = await fetch('/api/crm/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          gpin,
          project_name: projectName,
          project_address: projectAddress,
          system_size_watts: systemSizeWatts,
          invoice_date: invoiceDate,
          terms,
          payment_method: paymentMethod,
          milestone,
          notes,
          line_items: apiLineItems,
        }),
      });

      const data = await response.json();

      if (data.invoice) {
        router.push(`/crm/invoices/${data.invoice.id}`);
      } else {
        throw new Error(data.error || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/crm/invoices">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">New Invoice</h1>
            <p className="text-gray-400 mt-1">
              Create a new invoice for GoodPWR billing
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Details */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Client */}
            <div className="space-y-2">
              <Label className="text-gray-300">Client *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company_name || client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* GPIN */}
            <div className="space-y-2">
              <Label className="text-gray-300">GPIN</Label>
              <Input
                value={gpin}
                onChange={(e) => setGpin(e.target.value)}
                placeholder="GPIN-XXXX"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            {/* Project Name */}
            <div className="space-y-2">
              <Label className="text-gray-300">Project Name</Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Customer Name"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            {/* Project Address */}
            <div className="space-y-2 md:col-span-2">
              <Label className="text-gray-300">Project Address</Label>
              <Input
                value={projectAddress}
                onChange={(e) => setProjectAddress(e.target.value)}
                placeholder="Full address"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            {/* System Size */}
            <div className="space-y-2">
              <Label className="text-gray-300">System Size (kW) *</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  value={systemSizeKw}
                  onChange={(e) => setSystemSizeKw(e.target.value)}
                  placeholder="e.g., 8.10"
                  className="bg-gray-900 border-gray-700 text-white pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  kW
                </span>
              </div>
              {systemSizeWatts > 0 && (
                <p className="text-sm text-gray-500">
                  = {systemSizeWatts.toLocaleString()} watts
                </p>
              )}
            </div>

            {/* Invoice Date */}
            <div className="space-y-2">
              <Label className="text-gray-300">Invoice Date</Label>
              <Input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            {/* Terms */}
            <div className="space-y-2">
              <Label className="text-gray-300">Terms</Label>
              <Select value={terms} onValueChange={setTerms}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="Net 10">Net 10</SelectItem>
                  <SelectItem value="Net 15">Net 15</SelectItem>
                  <SelectItem value="Net 30">Net 30</SelectItem>
                  <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label className="text-gray-300">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="ACH">ACH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Pricing Configuration */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Pricing Configuration
          </h2>

          {rateSheet ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Using rate sheet: <span className="text-white">{rateSheet.name}</span>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Base Rate Option */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Base Rate Option</Label>
                  <Select
                    value={baseRateOption}
                    onValueChange={(v) => setBaseRateOption(v as 'A' | 'B')}
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="A">
                        Option A - ${rateSheet.base_rate_option_a}/W (w/ Site Survey)
                      </SelectItem>
                      <SelectItem value="B">
                        Option B - ${rateSheet.base_rate_option_b}/W (Install Only)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Milestone */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Milestone</Label>
                  <Select
                    value={milestone}
                    onValueChange={(v) => setMilestone(v as InvoiceMilestone)}
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="M1">
                        M1 - {rateSheet.m1_percentage}% (Install Complete)
                      </SelectItem>
                      <SelectItem value="M2">
                        M2 - {rateSheet.m2_percentage}% (Final Inspection)
                      </SelectItem>
                      <SelectItem value="FULL">
                        Full Payment (100%)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bonuses */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Bonuses</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeEarlyBonus}
                        onChange={(e) => setIncludeEarlyBonus(e.target.checked)}
                        className="rounded border-gray-700 bg-gray-900 text-[#ff0000]"
                      />
                      <span className="text-gray-300 text-sm">
                        Early Schedule (${rateSheet.early_schedule_bonus}/W)
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeInspectionBonus}
                        onChange={(e) => setIncludeInspectionBonus(e.target.checked)}
                        className="rounded border-gray-700 bg-gray-900 text-[#ff0000]"
                      />
                      <span className="text-gray-300 text-sm">
                        Inspection (${rateSheet.inspection_bonus}/W)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">
              {clientId ? 'No rate sheet found for this client.' : 'Select a client to load pricing.'}
            </p>
          )}
        </div>

        {/* Adders */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Adders
          </h2>

          {rateSheet?.adders ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {ADDER_OPTIONS.map((option) => {
                  const adder = rateSheet.adders[option.key] as AdderConfig | undefined;
                  if (!adder) return null;

                  return (
                    <Button
                      key={option.key}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addAdder(option.key)}
                      className="border-gray-700 text-gray-300 hover:text-white hover:border-gray-500"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {option.label}
                      <span className="ml-1 text-gray-500">
                        (${adder.rate}/{option.unit === 'watt' ? 'W' : option.unit === 'foot' ? 'ft' : 'ea'})
                      </span>
                    </Button>
                  );
                })}
              </div>

              {lineItems.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Added Adders:</h3>
                  <div className="space-y-2">
                    {lineItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-gray-800/50 rounded px-3 py-2"
                      >
                        <span className="text-gray-300">{item.description}</span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateLineItemQuantity(item.id, parseFloat(e.target.value) || 0)
                              }
                              className="w-24 bg-gray-900 border-gray-700 text-white text-sm"
                            />
                            <span className="text-gray-500 text-sm">{item.unit}</span>
                          </div>
                          <span className="text-white font-medium w-24 text-right">
                            {formatCurrency(item.amount)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(item.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400">Select a client with a rate sheet to add adders.</p>
          )}
        </div>

        {/* Line Items Preview */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Invoice Preview
            </h2>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-800/50">
                <TableHead className="text-gray-400">Description</TableHead>
                <TableHead className="text-gray-400 text-right">Qty</TableHead>
                <TableHead className="text-gray-400 text-right">Rate</TableHead>
                <TableHead className="text-gray-400 text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allItems.length === 0 ? (
                <TableRow className="border-gray-700">
                  <TableCell colSpan={4} className="text-center text-gray-400 py-8">
                    Configure pricing above to see line items
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {allItems.map((item, index) => (
                    <TableRow key={item.id || index} className="border-gray-700 hover:bg-gray-800/50">
                      <TableCell className="text-white">{item.description}</TableCell>
                      <TableCell className="text-gray-300 text-right">
                        {item.quantity.toLocaleString()} {item.unit}
                      </TableCell>
                      <TableCell className="text-gray-300 text-right">
                        ${item.unit_rate.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-white text-right font-medium">
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>

          {/* Totals */}
          {allItems.length > 0 && (
            <div className="p-4 border-t border-gray-700 bg-gray-800/30">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-gray-700">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <Label className="text-gray-300">Notes (visible on invoice)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes for this invoice..."
            className="mt-2 bg-gray-900 border-gray-700 text-white"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/crm/invoices">
            <Button type="button" variant="outline" className="border-gray-700 text-gray-300">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={saving || !clientId || !systemSizeWatts}
            className="bg-[#ff0000] hover:bg-[#cc0000] text-white"
          >
            {saving ? (
              <>
                <span className="animate-spin mr-2">...</span>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Invoice
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
