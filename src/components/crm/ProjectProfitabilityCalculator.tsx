'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Calculator, DollarSign, TrendingUp, TrendingDown, Info, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Zap, FileText } from 'lucide-react';
import { ProjectV2 } from '@/types/crm';
import { Badge } from '@/components/ui/badge';

// Constants based on GoodPWR contract and operational costs
const HARD_COST_PER_DAY = 2542.46;
const MATERIAL_COST_PER_WATT = 0.10;

// GoodPWR Base Pay Options
const BASE_PAY_OPTIONS = {
  optionA: 0.53, // Includes site survey
  optionB: 0.50, // No site survey
};

// Bonuses
const BONUSES = {
  scheduleWithin7Days: 0.05, // $/watt
  inspectionWithin5Days: 0.02, // $/watt
};

// Adder prices from GoodPWR contract
const ADDER_PRICES = {
  // Per-watt adders
  pestControl: 0.15,
  groundMountOver8kw: 0.25,
  metalRoof: 0.05,
  flatRoof: 0.07,
  tileRoof: 0.07,
  steepPitch: 0.07,

  // Fixed price adders
  groundMountUnder8kw: 3500,
  threeStory: 500,
  homeSurgeProtector: 300,
  productionMeter: 250,
  derateBreaker: 400,
  mainBreakerAddition: 400,
  newSubpanel: 500,
  mpuBase: 2500,
  mpuStucco: 3000,
  meterSwap: 750,
  rmaCollar: 250,
  spanPanel: 2000,
  evCharger: 650,
  wholeHomeBattery: 2500,
  additionalBattery: 1500,
  backupBattery: 1500,
  smartThermostat: 200,
  smallSystem: 650,
  moreThan4Arrays: 400,
  trenchSoftscape: 20,
  trenchConcrete: 60,
};

type PricingOption = 'optionA' | 'optionB';
type MpuType = 'none' | 'exterior' | 'interior' | 'stucco';
type TrenchType = 'none' | 'softscape' | 'concrete';

interface ProjectConfig {
  systemSizeKw: number;
  pricingOption: PricingOption;
  scheduleBonus: boolean;
  inspectionBonus: boolean;
  steepPitch: boolean;
  roofPipe: boolean;
  threeStory: boolean;
  mpuType: MpuType;
  hasMetalRoof: boolean;
  hasFlatRoof: boolean;
  hasTileRoof: boolean;
  wholeHomeBatteryCount: number;
  backupBatteryCount: number;
  groundMount: boolean;
  trenchType: TrenchType;
  trenchFeet: number;
  pestControl: boolean;
  evCharger: boolean;
  moreThan4Arrays: boolean;
  spanPanel: boolean;
  derateBreaker: boolean;
  mainBreakerAddition: boolean;
  newSubpanel: boolean;
  meterSwap: boolean;
  homeSurgeProtector: boolean;
  productionMeter: boolean;
  rmaCollar: boolean;
  smartThermostatCount: number;
}

interface CalculationResult {
  baseDays: number;
  mpuDays: number;
  batteryDays: number;
  trenchDays: number;
  pitchDays: number;
  roofPipeDays: number;
  totalDays: number;
  hardCosts: number;
  materialCosts: number;
  totalCosts: number;
  baseRevenue: number;
  bonusRevenue: number;
  adderRevenue: number;
  totalRevenue: number;
  grossProfit: number;
  profitMargin: number;
  revenuePerDay: number;
  profitPerDay: number;
}

const calculateBaseDays = (systemSizeKw: number): number => {
  if (systemSizeKw < 10) return 1;
  return Math.ceil(systemSizeKw / 10);
};

const calculatePitchDays = (systemSizeKw: number, isSteepPitch: boolean): number => {
  if (!isSteepPitch) return 0;
  return Math.ceil(systemSizeKw / 7);
};

const calculateProject = (config: ProjectConfig): CalculationResult => {
  const watts = config.systemSizeKw * 1000;

  // Days
  const baseDays = calculateBaseDays(config.systemSizeKw);
  let mpuDays = 0;
  if (config.mpuType === 'exterior') mpuDays = 1;
  if (config.mpuType === 'interior' || config.mpuType === 'stucco') mpuDays = 2;
  const batteryDays = (config.wholeHomeBatteryCount > 0 || config.backupBatteryCount > 0) ? 2 : 0;
  const trenchDays = config.trenchType !== 'none' ? 1 : 0;
  const pitchDays = calculatePitchDays(config.systemSizeKw, config.steepPitch);
  const roofPipeDays = config.roofPipe ? 1 : 0;
  const totalDays = baseDays + mpuDays + batteryDays + trenchDays + pitchDays + roofPipeDays;

  // Costs
  const hardCosts = totalDays * HARD_COST_PER_DAY;
  const materialCosts = watts * MATERIAL_COST_PER_WATT;
  const totalCosts = hardCosts + materialCosts;

  // Revenue
  const basePay = BASE_PAY_OPTIONS[config.pricingOption];
  const baseRevenue = watts * basePay;

  let bonusRevenue = 0;
  if (config.scheduleBonus) bonusRevenue += watts * BONUSES.scheduleWithin7Days;
  if (config.inspectionBonus) bonusRevenue += watts * BONUSES.inspectionWithin5Days;

  let adderRevenue = 0;

  // Per-watt adders
  if (config.pestControl) adderRevenue += watts * ADDER_PRICES.pestControl;
  if (config.groundMount && config.systemSizeKw >= 8) {
    adderRevenue += watts * ADDER_PRICES.groundMountOver8kw;
  }
  if (config.hasMetalRoof) adderRevenue += watts * ADDER_PRICES.metalRoof;
  if (config.hasFlatRoof) adderRevenue += watts * ADDER_PRICES.flatRoof;
  if (config.hasTileRoof) adderRevenue += watts * ADDER_PRICES.tileRoof;
  if (config.steepPitch) adderRevenue += watts * ADDER_PRICES.steepPitch;

  // Fixed adders
  if (config.groundMount && config.systemSizeKw < 8) adderRevenue += ADDER_PRICES.groundMountUnder8kw;
  if (config.threeStory) adderRevenue += ADDER_PRICES.threeStory;
  if (config.homeSurgeProtector) adderRevenue += ADDER_PRICES.homeSurgeProtector;
  if (config.productionMeter) adderRevenue += ADDER_PRICES.productionMeter;
  if (config.derateBreaker) adderRevenue += ADDER_PRICES.derateBreaker;
  if (config.mainBreakerAddition) adderRevenue += ADDER_PRICES.mainBreakerAddition;
  if (config.newSubpanel) adderRevenue += ADDER_PRICES.newSubpanel;
  if (config.mpuType === 'exterior' || config.mpuType === 'interior') adderRevenue += ADDER_PRICES.mpuBase;
  if (config.mpuType === 'stucco') adderRevenue += ADDER_PRICES.mpuStucco;
  if (config.meterSwap) adderRevenue += ADDER_PRICES.meterSwap;
  if (config.rmaCollar) adderRevenue += ADDER_PRICES.rmaCollar;
  if (config.spanPanel) adderRevenue += ADDER_PRICES.spanPanel;
  if (config.evCharger) adderRevenue += ADDER_PRICES.evCharger;
  if (config.systemSizeKw < 4) adderRevenue += ADDER_PRICES.smallSystem;
  if (config.moreThan4Arrays) adderRevenue += ADDER_PRICES.moreThan4Arrays;

  // Batteries
  if (config.wholeHomeBatteryCount > 0) {
    adderRevenue += ADDER_PRICES.wholeHomeBattery;
    if (config.wholeHomeBatteryCount > 1) {
      adderRevenue += (config.wholeHomeBatteryCount - 1) * ADDER_PRICES.additionalBattery;
    }
  }
  adderRevenue += config.backupBatteryCount * ADDER_PRICES.backupBattery;
  adderRevenue += config.smartThermostatCount * ADDER_PRICES.smartThermostat;

  // Trenching
  if (config.trenchType === 'softscape') adderRevenue += config.trenchFeet * ADDER_PRICES.trenchSoftscape;
  if (config.trenchType === 'concrete') adderRevenue += config.trenchFeet * ADDER_PRICES.trenchConcrete;

  const totalRevenue = baseRevenue + bonusRevenue + adderRevenue;
  const grossProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const revenuePerDay = totalDays > 0 ? totalRevenue / totalDays : 0;
  const profitPerDay = totalDays > 0 ? grossProfit / totalDays : 0;

  return {
    baseDays,
    mpuDays,
    batteryDays,
    trenchDays,
    pitchDays,
    roofPipeDays,
    totalDays,
    hardCosts,
    materialCosts,
    totalCosts,
    baseRevenue,
    bonusRevenue,
    adderRevenue,
    totalRevenue,
    grossProfit,
    profitMargin,
    revenuePerDay,
    profitPerDay,
  };
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

interface ProjectProfitabilityCalculatorProps {
  project: ProjectV2;
}

export function ProjectProfitabilityCalculator({ project }: ProjectProfitabilityCalculatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine if any roof section has steep pitch (>34°)
  const hasSteepPitchFromSections = useMemo(() => {
    if (!project.roof_sections || !Array.isArray(project.roof_sections)) return false;
    return project.roof_sections.some(section => {
      if (section.pitch_degrees && section.pitch_degrees >= 34) return true;
      if (section.pitch_ratio) {
        const match = section.pitch_ratio.match(/(\d+):12/);
        if (match) {
          const rise = parseInt(match[1]);
          const degrees = Math.atan(rise / 12) * (180 / Math.PI);
          return degrees >= 34;
        }
      }
      return false;
    });
  }, [project.roof_sections]);

  // Detect battery type from battery_model
  const batteryInfo = useMemo(() => {
    const model = project.battery_model?.toUpperCase() || '';
    const count = project.battery_count || 0;

    // Powerwall = whole home battery
    // Encharge = backup battery (typically)
    const isPowerwall = model.includes('POWERWALL');
    const isEncharge = model.includes('ENCHARGE');

    return {
      wholeHomeCount: isPowerwall ? count : (isEncharge ? 0 : (project.has_battery ? count : 0)),
      backupCount: isEncharge ? count : 0,
      model: model,
      hasBackupPanel: project.has_backup_panel || project.has_backup_gateway || false,
    };
  }, [project.battery_model, project.battery_count, project.has_battery, project.has_backup_panel, project.has_backup_gateway]);

  // Track which fields were auto-detected from design
  const autoDetectedFields = useMemo(() => {
    const fields: string[] = [];
    if (project.system_size_kw) fields.push('systemSize');
    if (project.has_steep_pitch || hasSteepPitchFromSections) fields.push('steepPitch');
    if (project.has_ground_mount) fields.push('groundMount');
    if (project.has_trench && project.trench_length_ft) fields.push('trench');
    if (project.has_battery || project.battery_count) fields.push('battery');
    if (project.has_mpu) fields.push('mpu');
    if (project.has_metal_roof) fields.push('metalRoof');
    if (project.has_flat_roof) fields.push('flatRoof');
    if (project.has_tile_roof) fields.push('tileRoof');
    if (project.has_ev_charger) fields.push('evCharger');
    if (project.has_three_story) fields.push('threeStory');
    if (project.has_derate) fields.push('derate');
    if (project.has_attic_run === false) fields.push('roofPipe'); // No attic run = roof pipe
    if (project.array_count && project.array_count > 4) fields.push('moreThan4Arrays');
    return fields;
  }, [project, hasSteepPitchFromSections]);

  // Initialize config from project data
  const [config, setConfig] = useState<ProjectConfig>(() => ({
    systemSizeKw: project.system_size_kw || 10,
    pricingOption: 'optionA',
    scheduleBonus: true,
    inspectionBonus: true,
    steepPitch: project.has_steep_pitch || hasSteepPitchFromSections,
    // If has_attic_run is explicitly false, suggest roof pipe (no attic access)
    roofPipe: project.has_attic_run === false,
    threeStory: project.has_three_story || false,
    mpuType: project.has_mpu ? 'exterior' : 'none',
    hasMetalRoof: project.has_metal_roof || false,
    hasFlatRoof: project.has_flat_roof || false,
    hasTileRoof: project.has_tile_roof || false,
    wholeHomeBatteryCount: batteryInfo.wholeHomeCount,
    backupBatteryCount: batteryInfo.backupCount,
    groundMount: project.has_ground_mount || false,
    trenchType: project.has_trench ? 'softscape' : 'none',
    trenchFeet: project.trench_length_ft || 0,
    pestControl: false,
    evCharger: project.has_ev_charger || false,
    moreThan4Arrays: (project.array_count || 0) > 4,
    spanPanel: false,
    // Auto-detect derate from design extraction
    derateBreaker: project.has_derate || false,
    mainBreakerAddition: false,
    newSubpanel: false,
    meterSwap: false,
    homeSurgeProtector: false,
    productionMeter: false,
    rmaCollar: false,
    smartThermostatCount: 0,
  }));

  // Update config when project changes
  useEffect(() => {
    setConfig(prev => ({
      ...prev,
      systemSizeKw: project.system_size_kw || prev.systemSizeKw,
      steepPitch: project.has_steep_pitch || hasSteepPitchFromSections,
      roofPipe: project.has_attic_run === false ? true : prev.roofPipe,
      threeStory: project.has_three_story || false,
      mpuType: project.has_mpu ? (prev.mpuType === 'none' ? 'exterior' : prev.mpuType) : 'none',
      hasMetalRoof: project.has_metal_roof || false,
      hasFlatRoof: project.has_flat_roof || false,
      hasTileRoof: project.has_tile_roof || false,
      wholeHomeBatteryCount: batteryInfo.wholeHomeCount,
      backupBatteryCount: batteryInfo.backupCount,
      groundMount: project.has_ground_mount || false,
      trenchType: project.has_trench ? (prev.trenchType === 'none' ? 'softscape' : prev.trenchType) : 'none',
      trenchFeet: project.trench_length_ft || prev.trenchFeet,
      evCharger: project.has_ev_charger || false,
      moreThan4Arrays: (project.array_count || 0) > 4,
      derateBreaker: project.has_derate || prev.derateBreaker,
    }));
  }, [project, hasSteepPitchFromSections, batteryInfo]);

  const result = useMemo(() => calculateProject(config), [config]);

  const updateConfig = <K extends keyof ProjectConfig>(key: K, value: ProjectConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const isProfitable = result.grossProfit > 0;
  const isGoodMargin = result.profitMargin >= 20;

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Calculator className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Profitability Calculator</h2>
          {autoDetectedFields.length > 0 && (
            <Badge variant="outline" className="text-green-400 border-green-500/50 text-xs">
              <Zap className="h-3 w-3 mr-1" />
              {autoDetectedFields.length} auto-detected
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Quick Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="text-gray-400">
              <span className="text-gray-500">Days:</span>{' '}
              <span className="text-white font-medium">{result.totalDays}</span>
            </div>
            <div className="text-gray-400">
              <span className="text-gray-500">Revenue:</span>{' '}
              <span className="text-green-400 font-medium">{formatCurrency(result.totalRevenue)}</span>
            </div>
            <div className="text-gray-400">
              <span className="text-gray-500">Profit:</span>{' '}
              <span className={`font-medium ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(result.grossProfit)}
              </span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded ${
              isGoodMargin ? 'bg-green-500/20 text-green-400' :
              isProfitable ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {isGoodMargin ? <TrendingUp className="h-4 w-4" /> :
               isProfitable ? <TrendingUp className="h-4 w-4" /> :
               <TrendingDown className="h-4 w-4" />}
              <span className="font-medium">{result.profitMargin.toFixed(1)}%</span>
            </div>
          </div>
          {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-700 p-4 space-y-4">
          {/* Auto-Detected Fields Summary */}
          {autoDetectedFields.length > 0 && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-green-400 mb-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Auto-Detected from Design Upload</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {autoDetectedFields.includes('systemSize') && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-300 border-green-500/30">
                    {project.system_size_kw} kW System
                  </Badge>
                )}
                {autoDetectedFields.includes('groundMount') && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-300 border-green-500/30">
                    Ground Mount
                  </Badge>
                )}
                {autoDetectedFields.includes('battery') && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-300 border-green-500/30">
                    {project.battery_count || 1}× {batteryInfo.model || 'Battery'}
                  </Badge>
                )}
                {autoDetectedFields.includes('trench') && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-300 border-green-500/30">
                    {project.trench_length_ft} ft Trench
                  </Badge>
                )}
                {autoDetectedFields.includes('mpu') && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-300 border-green-500/30">
                    MPU
                  </Badge>
                )}
                {autoDetectedFields.includes('steepPitch') && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-300 border-green-500/30">
                    Steep Pitch
                  </Badge>
                )}
                {autoDetectedFields.includes('metalRoof') && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-300 border-green-500/30">
                    Metal Roof
                  </Badge>
                )}
                {autoDetectedFields.includes('flatRoof') && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-300 border-green-500/30">
                    Flat Roof
                  </Badge>
                )}
                {autoDetectedFields.includes('tileRoof') && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-300 border-green-500/30">
                    Tile Roof
                  </Badge>
                )}
                {autoDetectedFields.includes('evCharger') && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-300 border-green-500/30">
                    EV Charger
                  </Badge>
                )}
                {autoDetectedFields.includes('threeStory') && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-300 border-green-500/30">
                    3-Story
                  </Badge>
                )}
                {autoDetectedFields.includes('derate') && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-300 border-green-500/30">
                    Derate
                  </Badge>
                )}
                {autoDetectedFields.includes('moreThan4Arrays') && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-300 border-green-500/30">
                    {project.array_count}+ Arrays
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Configuration Options */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* System Size (display only from project) */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">System Size</label>
              <div className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white">
                {config.systemSizeKw} kW
              </div>
            </div>

            {/* Pricing Option */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Pricing Option</label>
              <select
                value={config.pricingOption}
                onChange={(e) => updateConfig('pricingOption', e.target.value as PricingOption)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
              >
                <option value="optionA">Option A ($0.53/W)</option>
                <option value="optionB">Option B ($0.50/W)</option>
              </select>
            </div>

            {/* MPU Type */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">MPU Type</label>
              <select
                value={config.mpuType}
                onChange={(e) => updateConfig('mpuType', e.target.value as MpuType)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
              >
                <option value="none">None</option>
                <option value="exterior">Exterior (+1 day)</option>
                <option value="interior">Ext + Int (+2 days)</option>
                <option value="stucco">Stucco/NorCal (+2 days)</option>
              </select>
            </div>

            {/* Trench Type */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Trenching</label>
              <select
                value={config.trenchType}
                onChange={(e) => updateConfig('trenchType', e.target.value as TrenchType)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
              >
                <option value="none">None</option>
                <option value="softscape">Softscape ($20/ft)</option>
                <option value="concrete">Concrete ($60/ft)</option>
              </select>
            </div>
          </div>

          {/* Trench Length if applicable */}
          {config.trenchType !== 'none' && (
            <div className="max-w-xs">
              <label className="block text-xs text-gray-400 mb-1">Trench Length (ft)</label>
              <input
                type="number"
                min="0"
                value={config.trenchFeet}
                onChange={(e) => updateConfig('trenchFeet', Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
              />
            </div>
          )}

          {/* Checkboxes Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={config.scheduleBonus}
                onChange={(e) => updateConfig('scheduleBonus', e.target.checked)}
                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500"
              />
              <span className="text-gray-300">Schedule Bonus</span>
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={config.inspectionBonus}
                onChange={(e) => updateConfig('inspectionBonus', e.target.checked)}
                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500"
              />
              <span className="text-gray-300">Inspection Bonus</span>
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={config.steepPitch}
                onChange={(e) => updateConfig('steepPitch', e.target.checked)}
                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500"
              />
              <span className="text-gray-300">Steep Pitch (&gt;34°)</span>
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={config.roofPipe}
                onChange={(e) => updateConfig('roofPipe', e.target.checked)}
                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500"
              />
              <span className="text-gray-300">Roof Pipe (no attic)</span>
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={config.pestControl}
                onChange={(e) => updateConfig('pestControl', e.target.checked)}
                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500"
              />
              <span className="text-gray-300">Pest Control</span>
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={config.spanPanel}
                onChange={(e) => updateConfig('spanPanel', e.target.checked)}
                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500"
              />
              <span className="text-gray-300">Span Panel</span>
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={config.derateBreaker}
                onChange={(e) => updateConfig('derateBreaker', e.target.checked)}
                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500"
              />
              <span className="text-gray-300">Derate Breaker</span>
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={config.mainBreakerAddition}
                onChange={(e) => updateConfig('mainBreakerAddition', e.target.checked)}
                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500"
              />
              <span className="text-gray-300">Main Breaker Add</span>
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={config.newSubpanel}
                onChange={(e) => updateConfig('newSubpanel', e.target.checked)}
                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500"
              />
              <span className="text-gray-300">New Subpanel</span>
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={config.meterSwap}
                onChange={(e) => updateConfig('meterSwap', e.target.checked)}
                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500"
              />
              <span className="text-gray-300">Meter Swap</span>
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={config.homeSurgeProtector}
                onChange={(e) => updateConfig('homeSurgeProtector', e.target.checked)}
                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500"
              />
              <span className="text-gray-300">Surge Protector</span>
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={config.productionMeter}
                onChange={(e) => updateConfig('productionMeter', e.target.checked)}
                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500"
              />
              <span className="text-gray-300">Production Meter</span>
            </label>
          </div>

          {/* Battery Controls */}
          <div className="flex gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Whole Home Batteries</label>
              <input
                type="number"
                min="0"
                max="10"
                value={config.wholeHomeBatteryCount}
                onChange={(e) => updateConfig('wholeHomeBatteryCount', Number(e.target.value))}
                className="w-24 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Backup Batteries</label>
              <input
                type="number"
                min="0"
                max="10"
                value={config.backupBatteryCount}
                onChange={(e) => updateConfig('backupBatteryCount', Number(e.target.value))}
                className="w-24 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Smart Thermostats</label>
              <input
                type="number"
                min="0"
                max="10"
                value={config.smartThermostatCount}
                onChange={(e) => updateConfig('smartThermostatCount', Number(e.target.value))}
                className="w-24 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
              />
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700">
            {/* Days Breakdown */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Days Breakdown
              </h4>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="text-center p-2 bg-gray-900/50 rounded">
                  <div className="text-gray-400">Base</div>
                  <div className="font-bold text-white">{result.baseDays}</div>
                </div>
                <div className="text-center p-2 bg-gray-900/50 rounded">
                  <div className="text-gray-400">MPU</div>
                  <div className="font-bold text-white">{result.mpuDays}</div>
                </div>
                <div className="text-center p-2 bg-gray-900/50 rounded">
                  <div className="text-gray-400">Battery</div>
                  <div className="font-bold text-white">{result.batteryDays}</div>
                </div>
                <div className="text-center p-2 bg-gray-900/50 rounded">
                  <div className="text-gray-400">Trench</div>
                  <div className="font-bold text-white">{result.trenchDays}</div>
                </div>
                <div className="text-center p-2 bg-gray-900/50 rounded">
                  <div className="text-gray-400">Pitch</div>
                  <div className="font-bold text-white">{result.pitchDays}</div>
                </div>
                <div className="text-center p-2 bg-gray-900/50 rounded">
                  <div className="text-gray-400">Roof Pipe</div>
                  <div className="font-bold text-white">{result.roofPipeDays}</div>
                </div>
                <div className="col-span-2 text-center p-2 bg-blue-500/20 rounded">
                  <div className="text-blue-300">Total Days</div>
                  <div className="font-bold text-white text-lg">{result.totalDays}</div>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Hard Costs ({result.totalDays} × ${HARD_COST_PER_DAY.toLocaleString()})</span>
                  <span className="text-red-400">{formatCurrency(result.hardCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Material Costs</span>
                  <span className="text-red-400">{formatCurrency(result.materialCosts)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-700 pt-2">
                  <span className="text-gray-300 font-medium">Total Costs</span>
                  <span className="text-red-400 font-medium">{formatCurrency(result.totalCosts)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-gray-400">Base Revenue</span>
                  <span className="text-green-400">{formatCurrency(result.baseRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bonuses</span>
                  <span className="text-green-400">{formatCurrency(result.bonusRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Adders</span>
                  <span className="text-green-400">{formatCurrency(result.adderRevenue)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-700 pt-2">
                  <span className="text-gray-300 font-medium">Total Revenue</span>
                  <span className="text-green-400 font-medium">{formatCurrency(result.totalRevenue)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Final Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg text-center ${isProfitable ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              <div className="text-xs text-gray-400 mb-1">Gross Profit</div>
              <div className={`text-xl font-bold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(result.grossProfit)}
              </div>
            </div>

            <div className={`p-4 rounded-lg text-center ${
              isGoodMargin ? 'bg-green-500/10 border border-green-500/30' :
              isProfitable ? 'bg-yellow-500/10 border border-yellow-500/30' :
              'bg-red-500/10 border border-red-500/30'
            }`}>
              <div className="text-xs text-gray-400 mb-1">Profit Margin</div>
              <div className={`text-xl font-bold flex items-center justify-center gap-2 ${
                isGoodMargin ? 'text-green-400' : isProfitable ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {result.profitMargin.toFixed(1)}%
                {isGoodMargin && <CheckCircle2 className="h-5 w-5" />}
                {!isProfitable && <AlertTriangle className="h-5 w-5" />}
              </div>
            </div>

            <div className="p-4 rounded-lg text-center bg-blue-500/10 border border-blue-500/30">
              <div className="text-xs text-gray-400 mb-1">Revenue/Day</div>
              <div className="text-xl font-bold text-blue-400">
                {formatCurrency(result.revenuePerDay)}
              </div>
            </div>

            <div className={`p-4 rounded-lg text-center ${isProfitable ? 'bg-indigo-500/10 border border-indigo-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              <div className="text-xs text-gray-400 mb-1">Profit/Day</div>
              <div className={`text-xl font-bold ${isProfitable ? 'text-indigo-400' : 'text-red-400'}`}>
                {formatCurrency(result.profitPerDay)}
              </div>
            </div>
          </div>

          {/* Reference Info */}
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
            <strong>Reference:</strong> Hard Cost = ${HARD_COST_PER_DAY.toLocaleString()}/day | Material = ${MATERIAL_COST_PER_WATT}/W |
            Base Days = ceil(kW/10) | MPU Ext = +1 day, Int = +2 days | Battery = +2 days |
            Trench = +1 day | 34°+ = +1 day per 7kW | Roof Pipe = +1 day
          </div>
        </div>
      )}
    </div>
  );
}
