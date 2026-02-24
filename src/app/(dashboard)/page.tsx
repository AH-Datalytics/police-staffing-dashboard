'use client';

import { useMemo } from 'react';
import { PageShell } from '@/components/layout/page-shell';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { ControlsPanel } from '@/components/controls/controls-panel';
import { StaffingBarChart } from '@/components/charts/staffing-bar-chart';
import { DemandHeatmap } from '@/components/charts/demand-heatmap';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/tooltip';
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
      {/* Headline */}
      <div className="border-b border-gray-200 pb-5">
        <h2
          className="text-2xl font-bold text-gray-900 tracking-tight"
          style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
        >
          How many officers does this agency need?
        </h2>
        <p className="mt-2 text-[15px] text-gray-500 leading-relaxed max-w-2xl">
          This model calculates patrol staffing from a full year of calls-for-service data.
          Adjust the assumptions below and watch the numbers update in real time.{' '}
          <Link href="/guide" className="text-gray-900 underline underline-offset-2 decoration-gray-300 hover:decoration-gray-900">
            Read the methodology
          </Link>
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Proposed"
          value={result.totalProposed}
          format={(n) => formatNumber(n)}
          subtitle="officers recommended"
        />
        <KpiCard
          title="Current"
          value={Math.round(result.totalCurrent)}
          format={(n) => formatNumber(n)}
          subtitle="officers assigned"
        />
        <KpiCard
          title="Gap"
          value={result.totalGap}
          format={(n) => {
            const sign = n > 0 ? '+' : '';
            return `${sign}${formatNumber(Math.round(n))}`;
          }}
          trend={result.totalGap > 0 ? 'up' : 'down'}
          trendLabel={result.totalGap > 0 ? 'understaffed' : 'surplus'}
        />
        <KpiCard
          title="Relief Factor"
          value={result.reliefFactor}
          format={(n) => n.toFixed(2) + '\u00d7'}
          subtitle="roster multiplier"
        />
      </div>

      {/* Controls */}
      <ControlsPanel />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Current vs. Proposed</CardTitle>
              <InfoTooltip content="Gray bars show current staffing. Blue bars show the model's recommendation based on call volume and your assumptions." />
            </div>
          </CardHeader>
          <CardContent>
            <StaffingBarChart districts={result.districts} mode="total" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Demand by Hour & Day</CardTitle>
              <InfoTooltip content="Each cell shows officers needed during that hour. Blue is low demand, red is high. Hover for exact values." />
            </div>
          </CardHeader>
          <CardContent>
            <DemandHeatmap data={demandGrid} compact />
            <p className="text-[11px] text-gray-400 mt-3">
              Rows = days of the week. Columns = hours (midnight to 11 PM). Hover any cell for details.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* District Summary Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>By District & Shift</CardTitle>
            <InfoTooltip content="Click a district name for a detailed breakdown. Positive gaps (red) mean more officers are needed." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">District</th>
                  <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Shift</th>
                  <th className="text-right py-2.5 px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Current</th>
                  <th className="text-right py-2.5 px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Proposed</th>
                  <th className="text-right py-2.5 px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Gap</th>
                </tr>
              </thead>
              <tbody>
                {result.districts.map((d) =>
                  d.shifts.map((s, si) => (
                    <tr key={`${d.district}-${s.shiftId}`} className="border-b border-gray-100 hover:bg-gray-50/50">
                      {si === 0 && (
                        <td
                          className="py-2.5 px-3 font-medium text-gray-900"
                          rowSpan={d.shifts.length}
                        >
                          <Link
                            href={`/district/${d.district}`}
                            className="underline underline-offset-2 decoration-gray-300 hover:decoration-gray-900"
                          >
                            {d.districtLabel}
                          </Link>
                        </td>
                      )}
                      <td className="py-2.5 px-3 text-gray-500">{s.shiftLabel}</td>
                      <td className="py-2.5 px-3 text-right text-gray-500 tabular-nums">
                        {s.currentStaffing.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-gray-900 tabular-nums">
                        {s.proposedWithRelief}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-semibold tabular-nums ${
                          s.gap > 0 ? 'text-red-600' : s.gap < 0 ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {s.gap > 0 ? '+' : ''}{s.gap.toFixed(1)}
                      </td>
                    </tr>
                  ))
                )}
                <tr className="border-t-2 border-gray-900">
                  <td className="py-2.5 px-3 font-semibold text-gray-900" colSpan={2}>
                    Total
                  </td>
                  <td className="py-2.5 px-3 text-right text-gray-500 font-semibold tabular-nums">
                    {result.totalCurrent.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-gray-900 tabular-nums">
                    {result.totalProposed}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-bold tabular-nums ${
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
