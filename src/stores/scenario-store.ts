'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Scenario } from '@/types/scenario';

interface ScenarioStore {
  scenarios: Scenario[];
  compareIds: [string | null, string | null];
  saveScenario: (scenario: Omit<Scenario, 'id' | 'createdAt'>) => string;
  deleteScenario: (id: string) => void;
  setCompareIds: (ids: [string | null, string | null]) => void;
}

export const useScenarioStore = create<ScenarioStore>()(
  persist(
    (set) => ({
      scenarios: [],
      compareIds: [null, null],

      saveScenario: (scenario) => {
        const id = `scenario-${Date.now()}`;
        const newScenario: Scenario = {
          ...scenario,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          scenarios: [...state.scenarios, newScenario],
        }));
        return id;
      },

      deleteScenario: (id) =>
        set((state) => ({
          scenarios: state.scenarios.filter((s) => s.id !== id),
          compareIds: state.compareIds.map((cid) => (cid === id ? null : cid)) as [string | null, string | null],
        })),

      setCompareIds: (ids) => set({ compareIds: ids }),
    }),
    {
      name: 'staffing-scenarios',
    }
  )
);
