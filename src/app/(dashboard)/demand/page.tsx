'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack } from 'lucide-react';
import { PageShell } from '@/components/layout/page-shell';
import { DemandHeatmap } from '@/components/charts/demand-heatmap';
import { CallCategoryBreakdown } from '@/components/charts/call-category-breakdown';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useStaffingStore } from '@/stores/staffing-store';
import { cfsData, unitsData, agencyConfig } from '@/lib/data/sample-data-loader';
import {
  aggregateCFSData,
  buildUnitsLookup,
  getAgencyDemandGrid,
  getDistrictDemandGrid,
} from '@/lib/engine/demand-aggregator';
import { getPersonCarFactor } from '@/lib/engine/staffing-calculator';
import { formatHour, getDayName } from '@/lib/utils/format';

export default function DemandPage() {
  const { assumptions } = useStaffingStore();
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [animHour, setAnimHour] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const personCarFactor = getPersonCarFactor(assumptions.onePersonCarPct);
  const cfsAgg = useMemo(
    () => aggregateCFSData(cfsData, assumptions.categoryResponsePct),
    [assumptions.categoryResponsePct]
  );
  const unitsLookup = useMemo(() => buildUnitsLookup(unitsData), []);

  const demandGrid = useMemo(() => {
    if (selectedDistrict === 'all') {
      return getAgencyDemandGrid(cfsAgg, unitsLookup, agencyConfig.districts, personCarFactor);
    }
    const districtDemand = getDistrictDemandGrid(
      cfsAgg, unitsLookup, selectedDistrict, personCarFactor
    );
    // Convert to 7×24 grid
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    for (const d of districtDemand) {
      grid[d.dayOfWeek][d.hour] = d.officersNeeded;
    }
    return grid;
  }, [cfsAgg, unitsLookup, selectedDistrict, personCarFactor]);

  // Animation of demand cycle
  const togglePlay = useCallback(() => {
    setPlaying((p) => !p);
  }, []);

  const resetAnim = useCallback(() => {
    setAnimHour(0);
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setAnimHour((h) => (h + 1) % 24);
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing]);

  // Get hourly total for animation display
  const hourlyTotals = useMemo(() => {
    return Array.from({ length: 24 }, (_, h) =>
      demandGrid.reduce((sum, row) => sum + row[h], 0) / 7
    );
  }, [demandGrid]);

  return (
    <PageShell>
      {/* District Tabs + Heatmap */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Demand Heatmap (Officers Needed)</CardTitle>
            <Tabs value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <TabsList>
                <TabsTrigger value="all">All Districts</TabsTrigger>
                {agencyConfig.districts.map((d) => (
                  <TabsTrigger key={d} value={d}>
                    {agencyConfig.districtLabels[d]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <DemandHeatmap data={demandGrid} />
        </CardContent>
      </Card>

      {/* Animated Demand Cycle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>24-Hour Demand Cycle</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={resetAnim}>
                <SkipBack className="w-3.5 h-3.5" />
              </Button>
              <Button variant="secondary" size="sm" onClick={togglePlay}>
                {playing ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                {playing ? 'Pause' : 'Play'}
              </Button>
              <span className="text-sm font-mono font-medium text-gray-900 min-w-[60px]">
                {formatHour(animHour)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Hour scrubber */}
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={23}
              value={animHour}
              onChange={(e) => setAnimHour(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between mt-1">
              {[0, 6, 12, 18, 23].map((h) => (
                <span key={h} className="text-[10px] text-gray-400">
                  {formatHour(h)}
                </span>
              ))}
            </div>
          </div>

          {/* Bar display for current hour */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, day) => {
              const value = demandGrid[day][animHour];
              const maxVal = Math.max(...demandGrid.flat());
              const pct = maxVal > 0 ? (value / maxVal) * 100 : 0;

              return (
                <div key={day} className="text-center">
                  <div className="h-32 flex items-end justify-center">
                    <div
                      className="w-8 bg-blue-500 rounded-t transition-all duration-300"
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">{getDayName(day)}</span>
                  <span className="text-xs font-medium text-gray-700">{value.toFixed(1)}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-500">
              Average across all days at {formatHour(animHour)}:{' '}
              <strong className="text-gray-900">
                {hourlyTotals[animHour].toFixed(1)} officers
              </strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Call Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Call Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <CallCategoryBreakdown
            cfsData={cfsData}
            district={selectedDistrict === 'all' ? null : selectedDistrict}
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
