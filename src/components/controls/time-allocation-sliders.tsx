'use client';

import { useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { useStaffingStore } from '@/stores/staffing-store';
import type { TimeAllocation } from '@/types/agency';

const ALLOCATION_KEYS: (keyof TimeAllocation)[] = [
  'respondingCFS',
  'communityTime',
  'proactiveTime',
  'adminTime',
];

const ALLOCATION_LABELS: Record<keyof TimeAllocation, string> = {
  respondingCFS: 'Responding to CFS',
  communityTime: 'Community Time',
  proactiveTime: 'Proactive Policing',
  adminTime: 'Administrative',
};

/**
 * Four linked sliders that always sum to 100%.
 * Moving one proportionally adjusts the others.
 */
export function TimeAllocationSliders() {
  const { assumptions, setTimeAllocation } = useStaffingStore();
  const ta = assumptions.timeAllocation;

  const handleChange = useCallback(
    (key: keyof TimeAllocation, newValue: number) => {
      const oldValue = ta[key];
      const delta = newValue - oldValue;

      if (delta === 0) return;

      // Get the other keys and their current values
      const otherKeys = ALLOCATION_KEYS.filter((k) => k !== key);
      const otherSum = otherKeys.reduce((sum, k) => sum + ta[k], 0);

      const updated = { ...ta, [key]: newValue };

      if (otherSum === 0) {
        // Edge case: all other sliders are 0, distribute equally
        const share = (1 - newValue) / otherKeys.length;
        for (const k of otherKeys) {
          updated[k] = Math.round(share * 100) / 100;
        }
      } else {
        // Proportionally redistribute the remaining among others
        const remaining = 1 - newValue;
        for (const k of otherKeys) {
          updated[k] = Math.round(((ta[k] / otherSum) * remaining) * 100) / 100;
        }
      }

      // Normalize to ensure exact sum = 1.0
      const sum = ALLOCATION_KEYS.reduce((s, k) => s + updated[k], 0);
      if (Math.abs(sum - 1) > 0.001) {
        const diff = 1 - sum;
        // Apply diff to the largest other value
        const largestOther = otherKeys.reduce((a, b) =>
          updated[a] >= updated[b] ? a : b
        );
        updated[largestOther] = Math.round((updated[largestOther] + diff) * 100) / 100;
      }

      setTimeAllocation(updated);
    },
    [ta, setTimeAllocation]
  );

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Time Allocation
      </h4>
      {ALLOCATION_KEYS.map((key) => (
        <Slider
          key={key}
          label={ALLOCATION_LABELS[key]}
          valueLabel={`${Math.round(ta[key] * 100)}%`}
          value={[ta[key] * 100]}
          onValueChange={([v]) => handleChange(key, v / 100)}
          min={5}
          max={80}
          step={1}
        />
      ))}
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">Total</span>
        <span className="font-semibold text-gray-900">
          {Math.round(ALLOCATION_KEYS.reduce((sum, k) => sum + ta[k], 0) * 100)}%
        </span>
      </div>
    </div>
  );
}
