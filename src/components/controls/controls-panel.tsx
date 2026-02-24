'use client';

import { ChevronDown, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useUIStore } from '@/stores/ui-store';
import { useStaffingStore } from '@/stores/staffing-store';
import { TimeAllocationSliders } from './time-allocation-sliders';
import { Slider } from '@/components/ui/slider';
import { NumberInput } from '@/components/ui/number-input';
import { Button } from '@/components/ui/button';
import { InfoTooltip } from '@/components/ui/tooltip';

export function ControlsPanel() {
  const { controlsPanelOpen, toggleControlsPanel } = useUIStore();
  const { assumptions, setOnePersonCarPct, setAgencySize, resetDefaults } = useStaffingStore();

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <button
        onClick={toggleControlsPanel}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
            Adjust Assumptions
          </span>
          <InfoTooltip content="These controls change how the model calculates staffing needs. Every change updates all numbers on the page instantly." />
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform duration-200',
            controlsPanelOpen && 'rotate-180'
          )}
        />
      </button>

      {controlsPanelOpen && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-5">
            {/* Time Allocation */}
            <div>
              <TimeAllocationSliders />
              <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
                How should officers divide their time? Lowering CFS % means more community-focused policing, but requires more officers total.
              </p>
            </div>

            {/* Unit Configuration */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
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
              <p className="text-[11px] text-gray-400 leading-relaxed">
                At 100%, every patrol car has one officer. At 0%, all cars are two-officer units, doubling the staffing need.
              </p>
              <NumberInput
                label="Agency Size (officers)"
                value={assumptions.agencySize}
                onChange={setAgencySize}
                min={10}
                max={500}
                step={1}
              />
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Scales all results proportionally. The sample data is from an agency of 130.
              </p>
            </div>

            {/* Reset */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                Actions
              </h4>
              <Button variant="secondary" size="sm" onClick={resetDefaults}>
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Defaults
              </Button>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Restore all controls to the original baseline values.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
