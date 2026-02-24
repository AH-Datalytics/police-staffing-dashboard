import type { StaffingAssumptions, AgencyStaffingResult } from './staffing';

export interface Scenario {
  id: string;
  name: string;
  createdAt: string; // ISO date string
  assumptions: StaffingAssumptions;
  result: AgencyStaffingResult;
}
