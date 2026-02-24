'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Users, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { PageShell } from '@/components/layout/page-shell';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { DemandHeatmap } from '@/components/charts/demand-heatmap';
import { CallCategoryBreakdown } from '@/components/charts/call-category-breakdown';
import { StaffingBarChart } from '@/components/charts/staffing-bar-chart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useStaffingStore } from '@/stores/staffing-store';
import { cfsData, unitsData, agencyConfig } from '@/lib/data/sample-data-loader';
import {
  aggregateCFSData,
  buildUnitsLookup,
  getDistrictDemandGrid,
} from '@/lib/engine/demand-aggregator';
import { getPersonCarFactor } from '@/lib/engine/staffing-calculator';
import { formatNumber } from '@/lib/utils/format';

export default function DistrictPage() {
  const params = useParams();
  const districtId = params.id as string;
  const { result, assumptions } = useStaffingStore();

  const districtResult = result.districts.find((d) => d.district === districtId);
  const districtLabel = agencyConfig.districtLabels[districtId] || districtId;

  const demandGrid = useMemo(() => {
    const cfsAgg = aggregateCFSData(cfsData, assumptions.categoryResponsePct);
    const unitsLookup = buildUnitsLookup(unitsData);
    const personCarFactor = getPersonCarFactor(assumptions.onePersonCarPct);
    const demand = getDistrictDemandGrid(cfsAgg, unitsLookup, districtId, personCarFactor);
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    for (const d of demand) {
      grid[d.dayOfWeek][d.hour] = d.officersNeeded;
    }
    return grid;
  }, [districtId, assumptions.categoryResponsePct, assumptions.onePersonCarPct]);

  if (!districtResult) {
    return (
      <PageShell>
        <div className="text-center py-12">
          <p className="text-gray-500">District &quot;{districtId}&quot; not found.</p>
          <Link href="/" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
            Back to Overview
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Overview
      </Link>

      <h2
        className="text-2xl font-bold text-gray-900 tracking-tight border-b border-gray-200 pb-4"
        style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
      >
        {districtLabel} District
      </h2>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Proposed"
          value={districtResult.totalProposed}
          format={(n) => formatNumber(n)}
          icon={<Users className="w-5 h-5" />}
        />
        <KpiCard
          title="Current"
          value={Math.round(districtResult.totalCurrent)}
          format={(n) => formatNumber(n)}
        />
        <KpiCard
          title="Gap"
          value={districtResult.totalGap}
          format={(n) => `${n > 0 ? '+' : ''}${formatNumber(Math.round(n))}`}
          trend={districtResult.totalGap > 0 ? 'up' : 'down'}
          trendLabel={districtResult.totalGap > 0 ? 'understaffed' : 'surplus'}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staffing Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Staffing by Shift</CardTitle>
          </CardHeader>
          <CardContent>
            <StaffingBarChart districts={[districtResult]} mode="byShift" />
          </CardContent>
        </Card>

        {/* Demand Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Demand Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <DemandHeatmap data={demandGrid} />
          </CardContent>
        </Card>
      </div>

      {/* Shift Detail Table */}
      <Card>
        <CardHeader>
          <CardTitle>Shift Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-500">Shift</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Current</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Proposed</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Gap</th>
              </tr>
            </thead>
            <tbody>
              {districtResult.shifts.map((s) => (
                <tr key={s.shiftId} className="border-b border-gray-100">
                  <td className="py-2 px-3 text-gray-700">{s.shiftLabel}</td>
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
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Call Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <CallCategoryBreakdown cfsData={cfsData} district={districtId} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
