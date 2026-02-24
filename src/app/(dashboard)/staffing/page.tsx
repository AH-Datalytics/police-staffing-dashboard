'use client';

import { PageShell } from '@/components/layout/page-shell';
import { ReliefFactorEditor } from '@/components/controls/relief-factor-editor';
import { ResponsePercentEditor } from '@/components/controls/response-percent-editor';
import { StaffingBarChart } from '@/components/charts/staffing-bar-chart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/tooltip';
import { useStaffingStore } from '@/stores/staffing-store';

export default function StaffingPage() {
  const { result } = useStaffingStore();

  return (
    <PageShell>
      <div className="border-b border-gray-200 pb-5">
        <h2
          className="text-2xl font-bold text-gray-900 tracking-tight"
          style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
        >
          Staffing Detail
        </h2>
        <p className="mt-2 text-[15px] text-gray-500 leading-relaxed max-w-2xl">
          Fine-tune the model&apos;s assumptions. Edit the relief factor inputs on the left to reflect
          your agency&apos;s leave policies. On the right, adjust which call types require a sworn officer
          response — reducing a category models the impact of civilian alternatives.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Relief Factor */}
        <ReliefFactorEditor />

        {/* CFS Response Adjustments */}
        <ResponsePercentEditor />
      </div>

      {/* Detailed Staffing Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Staffing by District & Shift</CardTitle>
            <InfoTooltip content="Each bar pair shows current (gray) vs. proposed (blue) staffing for a specific district and shift. The proposed values reflect all your current assumptions." />
          </div>
        </CardHeader>
        <CardContent>
          <StaffingBarChart districts={result.districts} mode="byShift" />
        </CardContent>
      </Card>

      {/* Detailed Staffing Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Detailed Staffing Grid</CardTitle>
            <InfoTooltip content="'Raw Need' is the unrounded officer count before applying the relief factor. 'With Relief' is the final recommendation after accounting for time off and rounding." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">District</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Shift</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Current</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Raw Need</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">With Relief</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Gap</th>
                </tr>
              </thead>
              <tbody>
                {result.districts.map((d) =>
                  d.shifts.map((s, si) => (
                    <tr
                      key={`${d.district}-${s.shiftId}`}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      {si === 0 && (
                        <td
                          className="py-2 px-3 font-medium text-gray-900"
                          rowSpan={d.shifts.length}
                        >
                          {d.districtLabel}
                        </td>
                      )}
                      <td className="py-2 px-3 text-gray-600">{s.shiftLabel}</td>
                      <td className="py-2 px-3 text-right text-gray-600">
                        {s.currentStaffing.toFixed(1)}
                      </td>
                      <td className="py-2 px-3 text-right text-gray-400">
                        {s.proposedRaw.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-gray-900">
                        {s.proposedWithRelief}
                      </td>
                      <td
                        className={`py-2 px-3 text-right font-medium ${
                          s.gap > 0 ? 'text-red-600' : s.gap < 0 ? 'text-green-600' : 'text-gray-500'
                        }`}
                      >
                        {s.gap > 0 ? '+' : ''}{s.gap.toFixed(1)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
