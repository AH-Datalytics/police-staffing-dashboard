'use client';

import { create } from 'zustand';
import type { StaffingAssumptions, AgencyStaffingResult } from '@/types/staffing';
import type { TimeAllocation, ReliefFactorInputs } from '@/types/agency';
import { agencyConfig, cfsData, unitsData, getDefaultCategoryResponsePct } from '@/lib/data/sample-data-loader';
import { calculateAgencyStaffing } from '@/lib/engine/staffing-calculator';

interface StaffingStore {
  assumptions: StaffingAssumptions;
  result: AgencyStaffingResult;
  // Actions
  setTimeAllocation: (ta: TimeAllocation) => void;
  setOnePersonCarPct: (pct: number) => void;
  setAgencySize: (size: number) => void;
  setReliefFactorInputs: (inputs: ReliefFactorInputs) => void;
  setCategoryResponsePct: (subcategory: string, pct: number) => void;
  resetDefaults: () => void;
}

function getDefaultAssumptions(): StaffingAssumptions {
  return {
    timeAllocation: {
      respondingCFS: agencyConfig.defaults.respondingCFS,
      communityTime: agencyConfig.defaults.communityTime,
      proactiveTime: agencyConfig.defaults.proactiveTime,
      adminTime: agencyConfig.defaults.adminTime,
    },
    onePersonCarPct: agencyConfig.defaults.onePersonCarPct,
    agencySize: agencyConfig.defaults.agencySize,
    reliefFactorInputs: { ...agencyConfig.reliefFactorDefaults },
    categoryResponsePct: getDefaultCategoryResponsePct(),
  };
}

function recalculate(assumptions: StaffingAssumptions): AgencyStaffingResult {
  return calculateAgencyStaffing(cfsData, unitsData, agencyConfig, assumptions);
}

const defaultAssumptions = getDefaultAssumptions();

export const useStaffingStore = create<StaffingStore>((set) => ({
  assumptions: defaultAssumptions,
  result: recalculate(defaultAssumptions),

  setTimeAllocation: (ta) =>
    set((state) => {
      const assumptions = { ...state.assumptions, timeAllocation: ta };
      return { assumptions, result: recalculate(assumptions) };
    }),

  setOnePersonCarPct: (pct) =>
    set((state) => {
      const assumptions = { ...state.assumptions, onePersonCarPct: pct };
      return { assumptions, result: recalculate(assumptions) };
    }),

  setAgencySize: (size) =>
    set((state) => {
      const assumptions = { ...state.assumptions, agencySize: size };
      return { assumptions, result: recalculate(assumptions) };
    }),

  setReliefFactorInputs: (inputs) =>
    set((state) => {
      const assumptions = { ...state.assumptions, reliefFactorInputs: inputs };
      return { assumptions, result: recalculate(assumptions) };
    }),

  setCategoryResponsePct: (subcategory, pct) =>
    set((state) => {
      const categoryResponsePct = { ...state.assumptions.categoryResponsePct, [subcategory]: pct };
      const assumptions = { ...state.assumptions, categoryResponsePct };
      return { assumptions, result: recalculate(assumptions) };
    }),

  resetDefaults: () => {
    const assumptions = getDefaultAssumptions();
    set({ assumptions, result: recalculate(assumptions) });
  },
}));
