'use client';

import { useMemo, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { incidentData, agencyConfig } from '@/lib/data/sample-data-loader';
import { formatHour, getDayName } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

const MapView = dynamic(() => import('@/components/map/map-view'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
      <p className="text-sm text-gray-400">Loading map...</p>
    </div>
  ),
});

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

  const geojson = useMemo(
    (): GeoJSON.FeatureCollection => ({
      type: 'FeatureCollection',
      features: filteredIncidents.map((inc) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [inc.lng, inc.lat],
        },
        properties: {
          category: inc.category,
          district: inc.district,
          hour: inc.hour,
        },
      })),
    }),
    [filteredIncidents]
  );

  const center = agencyConfig.districtCenters['central'];

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

  return (
    <div className="h-[calc(100vh-7rem)] relative -mx-4 sm:-mx-6 lg:-mx-8 rounded-lg overflow-hidden">
      {/* Map */}
      <MapView center={center} geojson={geojson} />

      {/* Incident count overlay */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg px-4 py-3 shadow-lg border border-gray-200 z-10">
        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Showing</p>
        <p
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
        >
          {filteredIncidents.length.toLocaleString()}
        </p>
        <p className="text-[11px] text-gray-400">incidents</p>
      </div>

      {/* Filter panel */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="mb-2 bg-white shadow-lg border-gray-200"
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
        </Button>

        {filtersOpen && (
          <Card className="w-64 shadow-xl bg-white/95 backdrop-blur">
            <div className="p-4 space-y-4">
              {/* Hour range */}
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Hours: {formatHour(filters.hourRange[0])} &ndash;{' '}
                  {formatHour(filters.hourRange[1])}
                </label>
                <div className="flex gap-2 mt-1.5">
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
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Days of Week
                </label>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                    <button
                      key={d}
                      onClick={() => toggleDay(d)}
                      className={cn(
                        'px-2 py-1 text-[11px] rounded font-medium transition-colors',
                        filters.days.includes(d)
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      )}
                    >
                      {getDayName(d)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Districts */}
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Districts
                </label>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {agencyConfig.districts.map((d) => (
                    <button
                      key={d}
                      onClick={() => toggleDistrict(d)}
                      className={cn(
                        'px-2 py-1 text-[11px] rounded font-medium transition-colors',
                        filters.districts.includes(d)
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
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
