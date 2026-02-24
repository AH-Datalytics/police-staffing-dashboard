import type { CFSRow, UnitsRow } from '@/types/cfs';
import type { AgencyConfig, ShiftConfig } from '@/types/agency';
import type {
  StaffingAssumptions,
  ShiftStaffingResult,
  DistrictStaffingResult,
  AgencyStaffingResult,
} from '@/types/staffing';
import { calculateReliefFactor } from './relief-factor';
import { aggregateCFSData, buildUnitsLookup, calculateHourlyDemand } from './demand-aggregator';

/**
 * Calculate the person-car factor from one-person car percentage.
 * 100% one-person cars = factor 1.0
 * 0% one-person cars (all two-person) = factor 2.0
 */
export function getPersonCarFactor(onePersonCarPct: number): number {
  return (1 * onePersonCarPct) + (2 * (1 - onePersonCarPct));
}

/**
 * Get the hours that belong to a shift.
 * Handles overnight shifts (e.g., 18:00 - 06:00) with OR logic.
 */
export function getShiftHours(shift: ShiftConfig): number[] {
  const hours: number[] = [];
  if (shift.startHour < shift.endHour) {
    // Normal shift: e.g., 6-18
    for (let h = shift.startHour; h < shift.endHour; h++) {
      hours.push(h);
    }
  } else {
    // Overnight shift: e.g., 18-6 or 15-3
    for (let h = shift.startHour; h < 24; h++) {
      hours.push(h);
    }
    for (let h = 0; h < shift.endHour; h++) {
      hours.push(h);
    }
  }
  return hours;
}

/**
 * Calculate staffing for a single district and shift.
 *
 * For each hour in the shift, across all 7 days:
 *   1. Time per unit = totalMinutes / unitsAssigned
 *   2. Avg daily calls = units / (365/7)
 *   3. Officers for CFS = (timePerUnit × avgDailyCalls / 60) × personCarFactor
 *   4. Total officers = CFS officers / respondingCFS%
 *   5. Proposed = ROUND(totalOfficers × reliefFactor)
 *
 * The shift staffing = MAX across all hour/day combinations in the shift.
 */
export function calculateShiftStaffing(
  cfsAgg: Map<string, { totalMinutes: number; totalUnits: number }>,
  unitsLookup: Map<string, number>,
  district: string,
  shift: ShiftConfig,
  assumptions: StaffingAssumptions,
  reliefFactor: number,
  personCarFactor: number,
  agencySizeModifier: number,
  currentStaffingRaw: number
): ShiftStaffingResult {
  const shiftHours = getShiftHours(shift);
  let maxTotalUnits = 0;

  // Find the peak hour across all days for this shift
  for (let day = 0; day < 7; day++) {
    for (const hour of shiftHours) {
      const demand = calculateHourlyDemand(
        cfsAgg, unitsLookup, district, day, hour, personCarFactor
      );

      // Total units needed = CFS officers / % responding CFS
      const totalUnits = demand.officersNeeded / assumptions.timeAllocation.respondingCFS;
      if (totalUnits > maxTotalUnits) {
        maxTotalUnits = totalUnits;
      }
    }
  }

  const proposedRaw = maxTotalUnits;
  const proposedRounded = Math.ceil(maxTotalUnits);
  const proposedWithRelief = Math.round(maxTotalUnits * reliefFactor * agencySizeModifier);
  const currentStaffing = Math.round(currentStaffingRaw * agencySizeModifier * 100) / 100;

  return {
    district,
    shiftId: shift.id,
    shiftLabel: shift.label,
    currentStaffing,
    proposedRaw,
    proposedRounded,
    proposedWithRelief,
    gap: proposedWithRelief - currentStaffing,
  };
}

/**
 * Calculate full agency staffing across all districts and shifts.
 */
export function calculateAgencyStaffing(
  cfsData: CFSRow[],
  unitsData: UnitsRow[],
  config: AgencyConfig,
  assumptions: StaffingAssumptions
): AgencyStaffingResult {
  const reliefFactor = calculateReliefFactor(
    assumptions.reliefFactorInputs,
    config.shiftLengthHours
  );
  const personCarFactor = getPersonCarFactor(assumptions.onePersonCarPct);
  const agencySizeModifier = assumptions.agencySize / config.defaults.baselineSize;

  const cfsAgg = aggregateCFSData(cfsData, assumptions.categoryResponsePct);
  const unitsLookup = buildUnitsLookup(unitsData);

  const districtResults: DistrictStaffingResult[] = [];

  for (const district of config.districts) {
    const shifts: ShiftStaffingResult[] = [];
    const currentRaw = config.currentStaffing[district] || {};

    for (const shift of config.shifts) {
      const result = calculateShiftStaffing(
        cfsAgg,
        unitsLookup,
        district,
        shift,
        assumptions,
        reliefFactor,
        personCarFactor,
        agencySizeModifier,
        currentRaw[shift.id] || 0
      );
      shifts.push(result);
    }

    const totalCurrent = shifts.reduce((sum, s) => sum + s.currentStaffing, 0);
    const totalProposed = shifts.reduce((sum, s) => sum + s.proposedWithRelief, 0);

    districtResults.push({
      district,
      districtLabel: config.districtLabels[district] || district,
      shifts,
      totalCurrent: Math.round(totalCurrent * 100) / 100,
      totalProposed,
      totalGap: totalProposed - Math.round(totalCurrent * 100) / 100,
    });
  }

  const totalCurrent = districtResults.reduce((sum, d) => sum + d.totalCurrent, 0);
  const totalProposed = districtResults.reduce((sum, d) => sum + d.totalProposed, 0);

  return {
    districts: districtResults,
    totalCurrent: Math.round(totalCurrent * 100) / 100,
    totalProposed,
    totalGap: Math.round((totalProposed - totalCurrent) * 100) / 100,
    reliefFactor,
    personCarFactor,
  };
}
