import type { ReliefFactorInputs, TimeAllocation } from './agency';

export interface StaffingAssumptions {
  timeAllocation: TimeAllocation;
  onePersonCarPct: number;
  agencySize: number;
  reliefFactorInputs: ReliefFactorInputs;
  categoryResponsePct: Record<string, number>; // subcategory → 0-1 multiplier
}

export interface ShiftStaffingResult {
  district: string;
  shiftId: string;
  shiftLabel: string;
  currentStaffing: number;
  proposedRaw: number;
  proposedRounded: number;
  proposedWithRelief: number;
  gap: number; // proposed - current
}

export interface DistrictStaffingResult {
  district: string;
  districtLabel: string;
  shifts: ShiftStaffingResult[];
  totalCurrent: number;
  totalProposed: number;
  totalGap: number;
}

export interface AgencyStaffingResult {
  districts: DistrictStaffingResult[];
  totalCurrent: number;
  totalProposed: number;
  totalGap: number;
  reliefFactor: number;
  personCarFactor: number;
}

export interface HourlyDemand {
  dayOfWeek: number;
  hour: number;
  district: string;
  totalMinutes: number;
  totalUnits: number;
  unitsAssigned: number;
  timePerUnit: number;
  avgDailyCalls: number;
  officersNeeded: number;
}
