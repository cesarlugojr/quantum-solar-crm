/**
 * Profitability calculation utilities for solar projects
 * Based on GoodPWR contract pricing
 */

import { ProjectV2 } from '@/types/crm';

// Constants based on GoodPWR contract and operational costs
const HARD_COST_PER_DAY = 2542.46;
const MATERIAL_COST_PER_WATT = 0.10;
const BASE_PAY_PER_WATT = 0.53; // Option A (includes site survey)

// Adder prices from GoodPWR contract
const ADDER_PRICES = {
  // Per-watt adders
  groundMountOver8kw: 0.25,
  metalRoof: 0.05,
  flatRoof: 0.07,
  tileRoof: 0.07,
  steepPitch: 0.07,

  // Fixed price adders
  groundMountUnder8kw: 3500,
  threeStory: 500,
  mpuBase: 2500,
  evCharger: 650,
  wholeHomeBattery: 2500,
  additionalBattery: 1500,
  backupBattery: 1500,
  trenchSoftscape: 20, // per foot
  moreThan4Arrays: 400,
  smallSystem: 650,
};

export interface QuickProfitability {
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
  days: number;
}

/**
 * Calculate base installation days based on system size
 */
const calculateBaseDays = (systemSizeKw: number): number => {
  if (systemSizeKw < 10) return 1;
  return Math.ceil(systemSizeKw / 10);
};

/**
 * Calculate additional days for steep pitch based on system size
 */
const calculatePitchDays = (systemSizeKw: number, isSteepPitch: boolean): number => {
  if (!isSteepPitch) return 0;
  return Math.ceil(systemSizeKw / 7);
};

/**
 * Quick profitability calculation for a project
 * Uses project data with sensible defaults for unknown values
 */
export function calculateQuickProfitability(project: ProjectV2): QuickProfitability {
  const systemSizeKw = project.system_size_kw || 0;

  if (systemSizeKw <= 0) {
    return { revenue: 0, costs: 0, profit: 0, margin: 0, days: 0 };
  }

  const watts = systemSizeKw * 1000;

  // Calculate days
  const baseDays = calculateBaseDays(systemSizeKw);
  const mpuDays = project.has_mpu ? 1 : 0;
  const batteryDays = (project.has_battery && (project.battery_count || 0) > 0) ? 2 : 0;
  const trenchDays = project.has_trench ? 1 : 0;
  const pitchDays = calculatePitchDays(systemSizeKw, project.has_steep_pitch || false);
  const totalDays = baseDays + mpuDays + batteryDays + trenchDays + pitchDays;

  // Calculate costs
  const hardCosts = totalDays * HARD_COST_PER_DAY;
  const materialCosts = watts * MATERIAL_COST_PER_WATT;
  const totalCosts = hardCosts + materialCosts;

  // Calculate revenue
  let revenue = watts * BASE_PAY_PER_WATT;

  // Add per-watt adders
  if (project.has_ground_mount && systemSizeKw >= 8) {
    revenue += watts * ADDER_PRICES.groundMountOver8kw;
  }
  if (project.has_metal_roof) revenue += watts * ADDER_PRICES.metalRoof;
  if (project.has_flat_roof) revenue += watts * ADDER_PRICES.flatRoof;
  if (project.has_tile_roof) revenue += watts * ADDER_PRICES.tileRoof;
  if (project.has_steep_pitch) revenue += watts * ADDER_PRICES.steepPitch;

  // Add fixed adders
  if (project.has_ground_mount && systemSizeKw < 8) {
    revenue += ADDER_PRICES.groundMountUnder8kw;
  }
  if (project.has_three_story) revenue += ADDER_PRICES.threeStory;
  if (project.has_mpu) revenue += ADDER_PRICES.mpuBase;
  if (project.has_ev_charger) revenue += ADDER_PRICES.evCharger;
  if (systemSizeKw < 4) revenue += ADDER_PRICES.smallSystem;

  // Array count adder (if >4 arrays)
  if ((project.array_count || 0) > 4) revenue += ADDER_PRICES.moreThan4Arrays;

  // Batteries - use Powerwall pricing (whole home) as default
  const batteryCount = project.battery_count || 0;
  if (batteryCount > 0) {
    revenue += ADDER_PRICES.wholeHomeBattery;
    if (batteryCount > 1) {
      revenue += (batteryCount - 1) * ADDER_PRICES.additionalBattery;
    }
  }

  // Trenching (assume softscape)
  if (project.has_trench && project.trench_length_ft) {
    revenue += project.trench_length_ft * ADDER_PRICES.trenchSoftscape;
  }

  const profit = revenue - totalCosts;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  return {
    revenue,
    costs: totalCosts,
    profit,
    margin,
    days: totalDays,
  };
}

/**
 * Format profitability margin with color indicator
 */
export function getMarginColor(margin: number): string {
  if (margin >= 20) return 'text-green-400';
  if (margin >= 10) return 'text-yellow-400';
  if (margin >= 0) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Format profitability margin as badge variant
 */
export function getMarginBadgeClass(margin: number): string {
  if (margin >= 20) return 'bg-green-500/20 text-green-400 border-green-500/50';
  if (margin >= 10) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
  if (margin >= 0) return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
  return 'bg-red-500/20 text-red-400 border-red-500/50';
}
