'use client';

import { PageShell } from '@/components/layout/page-shell';
import { ReliefFactorEditor } from '@/components/controls/relief-factor-editor';
import { ResponsePercentEditor } from '@/components/controls/response-percent-editor';
import { StaffingBarChart } from '@/components/charts/staffing-bar-chart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useStaffingStore } from '@/stores/staffing-store';

export default function StaffingPage() {
  const { result } = useStaffingStore();

  return (
    <PageShell>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Relief Factor */}
        <ReliefFactorEditor />

        {/* CFS Response Adjustments */}
        <ResponsePercentEditor />
      </div>

      {/* Detailed Staffing Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Staffing by District & Shift</CardTitle>
        </CardHeader>
        <CardContent>
          <StaffingBarChart districts={result.districts} mode="byShift" />
        </CardContent>
      </Card>

      {/* Detailed Staffing Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Staffing Grid</CardTitle>
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
