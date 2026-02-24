'use client';

import { useMemo } from 'react';
import { Users, UserPlus, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PageShell } from '@/components/layout/page-shell';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { ControlsPanel } from '@/components/controls/controls-panel';
import { StaffingBarChart } from '@/components/charts/staffing-bar-chart';
import { DemandHeatmap } from '@/components/charts/demand-heatmap';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useStaffingStore } from '@/stores/staffing-store';
import { cfsData, unitsData, agencyConfig } from '@/lib/data/sample-data-loader';
import { aggregateCFSData, buildUnitsLookup, getAgencyDemandGrid } from '@/lib/engine/demand-aggregator';
import { getPersonCarFactor } from '@/lib/engine/staffing-calculator';
import { formatNumber } from '@/lib/utils/format';
import Link from 'next/link';

export default function OverviewPage() {
  const { result, assumptions } = useStaffingStore();

  const demandGrid = useMemo(() => {
    const cfsAgg = aggregateCFSData(cfsData, assumptions.categoryResponsePct);
    const unitsLookup = buildUnitsLookup(unitsData);
    const personCarFactor = getPersonCarFactor(assumptions.onePersonCarPct);
    return getAgencyDemandGrid(cfsAgg, unitsLookup, agencyConfig.districts, personCarFactor);
  }, [assumptions.categoryResponsePct, assumptions.onePersonCarPct]);

  return (
    <PageShell>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Proposed Staffing"
          value={result.totalProposed}
          format={(n) => formatNumber(n)}
          subtitle="officers needed"
          icon={<Users className="w-5 h-5" />}
        />
        <KpiCard
          title="Current Staffing"
          value={Math.round(result.totalCurrent)}
          format={(n) => formatNumber(n)}
          subtitle="officers assigned"
          icon={<ShieldCheck className="w-5 h-5" />}
        />
        <KpiCard
          title="Staffing Gap"
          value={result.totalGap}
          format={(n) => {
            const sign = n > 0 ? '+' : '';
            return `${sign}${formatNumber(Math.round(n))}`;
          }}
          trend={result.totalGap > 0 ? 'up' : 'down'}
          trendLabel={result.totalGap > 0 ? 'understaffed' : 'overstaffed'}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <KpiCard
          title="Relief Factor"
          value={result.reliefFactor}
          format={(n) => n.toFixed(2)}
          subtitle="roster multiplier"
          icon={<UserPlus className="w-5 h-5" />}
        />
      </div>

      {/* Controls */}
      <ControlsPanel />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staffing Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Current vs Proposed Staffing by District</CardTitle>
          </CardHeader>
          <CardContent>
            <StaffingBarChart districts={result.districts} mode="total" />
          </CardContent>
        </Card>

        {/* Demand Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Agency-Wide Demand (Officers Needed by Hour & Day)</CardTitle>
          </CardHeader>
          <CardContent>
            <DemandHeatmap data={demandGrid} compact />
          </CardContent>
        </Card>
      </div>

      {/* District Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staffing Summary by District & Shift</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">District</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Shift</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Current</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Proposed</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Gap</th>
                </tr>
              </thead>
              <tbody>
                {result.districts.map((d) =>
                  d.shifts.map((s, si) => (
                    <tr key={`${d.district}-${s.shiftId}`} className="border-b border-gray-100 hover:bg-gray-50">
                      {si === 0 && (
                        <td
                          className="py-2 px-3 font-medium text-gray-900"
                          rowSpan={d.shifts.length}
                        >
                          <Link
                            href={`/district/${d.district}`}
                            className="text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            {d.districtLabel}
                          </Link>
                        </td>
                      )}
                      <td className="py-2 px-3 text-gray-600">{s.shiftLabel}</td>
                      <td className="py-2 px-3 text-right text-gray-600">
                        {s.currentStaffing.toFixed(1)}
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
                {/* Totals */}
                <tr className="border-t-2 border-gray-300 font-semibold">
                  <td className="py-2 px-3 text-gray-900" colSpan={2}>
                    Agency Total
                  </td>
                  <td className="py-2 px-3 text-right text-gray-600">
                    {result.totalCurrent.toFixed(1)}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-900">
                    {result.totalProposed}
                  </td>
                  <td
                    className={`py-2 px-3 text-right ${
                      result.totalGap > 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {result.totalGap > 0 ? '+' : ''}{result.totalGap.toFixed(1)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
