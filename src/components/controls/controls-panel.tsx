'use client';

import { ChevronDown, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useUIStore } from '@/stores/ui-store';
import { useStaffingStore } from '@/stores/staffing-store';
import { TimeAllocationSliders } from './time-allocation-sliders';
import { Slider } from '@/components/ui/slider';
import { NumberInput } from '@/components/ui/number-input';
import { Button } from '@/components/ui/button';

export function ControlsPanel() {
  const { controlsPanelOpen, toggleControlsPanel } = useUIStore();
  const { assumptions, setOnePersonCarPct, setAgencySize, resetDefaults } = useStaffingStore();

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={toggleControlsPanel}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-900">Model Controls</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform',
            controlsPanelOpen && 'rotate-180'
          )}
        />
      </button>

      {controlsPanelOpen && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* Time Allocation */}
            <div>
              <TimeAllocationSliders />
            </div>

            {/* Unit Configuration */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Unit Configuration
              </h4>
              <Slider
                label="One-Person Car %"
                valueLabel={`${Math.round(assumptions.onePersonCarPct * 100)}%`}
                value={[assumptions.onePersonCarPct * 100]}
                onValueChange={([v]) => setOnePersonCarPct(v / 100)}
                min={0}
                max={100}
                step={5}
              />
              <NumberInput
                label="Agency Size (officers)"
                value={assumptions.agencySize}
                onChange={setAgencySize}
                min={10}
                max={500}
                step={1}
              />
            </div>

            {/* Reset */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Actions
              </h4>
              <Button variant="secondary" size="sm" onClick={resetDefaults}>
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Defaults
              </Button>
              <p className="text-xs text-gray-400">
                Reset all controls to the Knoxville baseline values.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
