'use client';

import { useMemo, useState, useCallback } from 'react';
import { Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { incidentData, agencyConfig } from '@/lib/data/sample-data-loader';
import { getHeatmapColor } from '@/lib/utils/color';
import { formatHour, getDayName } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface MapFilters {
  hourRange: [number, number];
  days: number[];
  districts: string[];
}

export default function MapPage() {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [filters, setFilters] = useState<MapFilters>({
    hourRange: [0, 23],
    days: [0, 1, 2, 3, 4, 5, 6],
    districts: [...agencyConfig.districts],
  });

  const filteredIncidents = useMemo(() => {
    return incidentData.filter((inc) => {
      if (inc.hour < filters.hourRange[0] || inc.hour > filters.hourRange[1]) return false;
      if (!filters.days.includes(inc.dayOfWeek)) return false;
      if (!filters.districts.includes(inc.district)) return false;
      return true;
    });
  }, [filters]);

  const toggleDay = useCallback((day: number) => {
    setFilters((f) => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter((d) => d !== day) : [...f.days, day],
    }));
  }, []);

  const toggleDistrict = useCallback((district: string) => {
    setFilters((f) => ({
      ...f,
      districts: f.districts.includes(district)
        ? f.districts.filter((d) => d !== district)
        : [...f.districts, district],
    }));
  }, []);

  // Aggregate incidents into grid cells for heatmap rendering
  const heatmapCells = useMemo(() => {
    const cellSize = 0.003; // ~300m grid cells
    const cells = new Map<string, { lat: number; lng: number; count: number }>();

    for (const inc of filteredIncidents) {
      const gridLat = Math.round(inc.lat / cellSize) * cellSize;
      const gridLng = Math.round(inc.lng / cellSize) * cellSize;
      const key = `${gridLat}:${gridLng}`;
      const cell = cells.get(key);
      if (cell) {
        cell.count++;
      } else {
        cells.set(key, { lat: gridLat, lng: gridLng, count: 1 });
      }
    }

    return Array.from(cells.values());
  }, [filteredIncidents]);

  const maxCount = Math.max(1, ...heatmapCells.map((c) => c.count));

  // Map bounds
  const centerLat = 35.9606;
  const centerLng = -83.9207;

  // SVG-based map visualization
  const svgWidth = 800;
  const svgHeight = 500;
  const latRange = 0.06;
  const lngRange = 0.1;

  const toSvg = (lat: number, lng: number) => ({
    x: ((lng - (centerLng - lngRange / 2)) / lngRange) * svgWidth,
    y: ((centerLat + latRange / 2 - lat) / latRange) * svgHeight,
  });

  return (
    <div className="h-[calc(100vh-7rem)] relative -mx-4 sm:-mx-6 lg:-mx-8 rounded-lg overflow-hidden">
      {/* Map area */}
      <div className="absolute inset-0 bg-gray-900">
        <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="xMidYMid meet">
          {/* Background */}
          <rect width={svgWidth} height={svgHeight} fill="#1a1a2e" />

          {/* Grid lines */}
          {Array.from({ length: 10 }, (_, i) => {
            const x = (i / 9) * svgWidth;
            return (
              <line key={`v${i}`} x1={x} y1={0} x2={x} y2={svgHeight} stroke="#2a2a3e" strokeWidth={0.5} />
            );
          })}
          {Array.from({ length: 7 }, (_, i) => {
            const y = (i / 6) * svgHeight;
            return (
              <line key={`h${i}`} x1={0} y1={y} x2={svgWidth} y2={y} stroke="#2a2a3e" strokeWidth={0.5} />
            );
          })}

          {/* District labels */}
          {agencyConfig.districts.map((d) => {
            const center = agencyConfig.districtCenters[d];
            const pos = toSvg(center.lat, center.lng);
            return (
              <text
                key={d}
                x={pos.x}
                y={pos.y - 60}
                textAnchor="middle"
                fill="#6b7280"
                fontSize={14}
                fontWeight={600}
              >
                {agencyConfig.districtLabels[d]} District
              </text>
            );
          })}

          {/* Heatmap cells */}
          {heatmapCells.map((cell, i) => {
            const pos = toSvg(cell.lat, cell.lng);
            const intensity = cell.count / maxCount;
            const radius = 4 + intensity * 12;
            const color = getHeatmapColor(cell.count, 0, maxCount);

            return (
              <circle
                key={i}
                cx={pos.x}
                cy={pos.y}
                r={radius}
                fill={color}
                opacity={0.4 + intensity * 0.4}
              >
                <title>{cell.count} incidents</title>
              </circle>
            );
          })}

          {/* District center markers */}
          {agencyConfig.districts.map((d) => {
            const center = agencyConfig.districtCenters[d];
            const pos = toSvg(center.lat, center.lng);
            return (
              <g key={`marker-${d}`}>
                <circle cx={pos.x} cy={pos.y} r={6} fill="white" stroke="#3b82f6" strokeWidth={2} />
              </g>
            );
          })}
        </svg>

        {/* Incident count overlay */}
        <div className="absolute bottom-4 left-4 bg-gray-950/80 backdrop-blur text-white rounded-lg px-4 py-3">
          <p className="text-xs text-gray-400">Showing</p>
          <p className="text-2xl font-bold">{filteredIncidents.length.toLocaleString()}</p>
          <p className="text-xs text-gray-400">incidents</p>
          <p className="text-[10px] text-gray-500 mt-1.5 max-w-[180px] leading-relaxed">
            Brighter, larger circles indicate higher incident density. Use filters to narrow by time or district.
          </p>
        </div>
      </div>

      {/* Filter panel */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="mb-2 bg-white shadow-lg"
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
        </Button>

        {filtersOpen && (
          <Card className="w-64 shadow-xl">
            <div className="p-4 space-y-4">
              {/* Hour range */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Hours: {formatHour(filters.hourRange[0])} - {formatHour(filters.hourRange[1])}
                </label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="range"
                    min={0}
                    max={23}
                    value={filters.hourRange[0]}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        hourRange: [parseInt(e.target.value), f.hourRange[1]],
                      }))
                    }
                    className="w-full accent-blue-600"
                  />
                  <input
                    type="range"
                    min={0}
                    max={23}
                    value={filters.hourRange[1]}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        hourRange: [f.hourRange[0], parseInt(e.target.value)],
                      }))
                    }
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>

              {/* Day of week */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Days of Week
                </label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                    <button
                      key={d}
                      onClick={() => toggleDay(d)}
                      className={cn(
                        'px-2 py-1 text-xs rounded font-medium transition-colors',
                        filters.days.includes(d)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      )}
                    >
                      {getDayName(d)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Districts */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Districts
                </label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {agencyConfig.districts.map((d) => (
                    <button
                      key={d}
                      onClick={() => toggleDistrict(d)}
                      className={cn(
                        'px-2 py-1 text-xs rounded font-medium transition-colors',
                        filters.districts.includes(d)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      )}
                    >
                      {agencyConfig.districtLabels[d]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
