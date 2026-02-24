export interface ShiftConfig {
  id: string;
  label: string;
  startHour: number;
  endHour: number;
}

export interface ReliefFactorInputs {
  personalTimeDays: number;
  vacationDays: number;
  holidayDays: number;
  sickLeaveDays: number;
  trainingDays: number;
  regularDaysOff: number;
  otherDaysOut: number;
}

export interface TimeAllocation {
  respondingCFS: number;
  communityTime: number;
  proactiveTime: number;
  adminTime: number;
}

export interface DistrictCenter {
  lat: number;
  lng: number;
}

export interface AgencyConfig {
  agencyName: string;
  districts: string[];
  districtLabels: Record<string, string>;
  shifts: ShiftConfig[];
  shiftLengthHours: number;
  currentStaffing: Record<string, Record<string, number>>;
  defaults: {
    respondingCFS: number;
    communityTime: number;
    proactiveTime: number;
    adminTime: number;
    onePersonCarPct: number;
    agencySize: number;
    kpdSize: number;
  };
  reliefFactorDefaults: ReliefFactorInputs;
  districtCenters: Record<string, DistrictCenter>;
}
