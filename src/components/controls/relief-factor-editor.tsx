'use client';

import { useStaffingStore } from '@/stores/staffing-store';
import { NumberInput } from '@/components/ui/number-input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { ReliefFactorInputs } from '@/types/agency';

const RELIEF_FIELDS: { key: keyof ReliefFactorInputs; label: string }[] = [
  { key: 'personalTimeDays', label: 'Personal Time' },
  { key: 'vacationDays', label: 'Vacation' },
  { key: 'holidayDays', label: 'Holiday' },
  { key: 'sickLeaveDays', label: 'Sick Leave' },
  { key: 'trainingDays', label: 'Training' },
  { key: 'regularDaysOff', label: 'Regular Days Off' },
  { key: 'otherDaysOut', label: 'Other Days Out' },
];

export function ReliefFactorEditor() {
  const { assumptions, result, setReliefFactorInputs } = useStaffingStore();
  const inputs = assumptions.reliefFactorInputs;

  const totalDays = Object.values(inputs).reduce((sum, v) => sum + v, 0);
  const totalHours = totalDays * 12;

  const handleChange = (key: keyof ReliefFactorInputs, value: number) => {
    setReliefFactorInputs({ ...inputs, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Relief Factor Calculation</CardTitle>
          <div className="text-right">
            <span className="text-2xl font-bold text-blue-600">
              {result.reliefFactor.toFixed(4)}
            </span>
            <p className="text-xs text-gray-400">relief factor</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-500 border-b border-gray-200 pb-2">
            <span>Category</span>
            <span className="text-right">Days</span>
            <span className="text-right">Hours</span>
          </div>

          {RELIEF_FIELDS.map(({ key, label }) => (
            <div key={key} className="grid grid-cols-3 gap-2 items-center">
              <span className="text-sm text-gray-700">{label}</span>
              <div className="flex justify-end">
                <NumberInput
                  value={inputs[key]}
                  onChange={(v) => handleChange(key, v)}
                  min={0}
                  max={key === 'regularDaysOff' ? 365 : 60}
                  step={key === 'regularDaysOff' ? 0.5 : 1}
                  className="w-20"
                />
              </div>
              <span className="text-sm text-right text-gray-400">
                {(inputs[key] * 12).toFixed(0)}
              </span>
            </div>
          ))}

          <div className="grid grid-cols-3 gap-2 items-center border-t border-gray-200 pt-3 font-semibold">
            <span className="text-sm text-gray-900">Total</span>
            <span className="text-sm text-right text-gray-900">{totalDays.toFixed(1)}</span>
            <span className="text-sm text-right text-gray-900">{totalHours.toFixed(0)}</span>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <strong>Formula:</strong> (365 × 12) / (365 × 12 - {totalHours.toFixed(0)}) ={' '}
            {(4380 / (4380 - totalHours)).toFixed(4)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
