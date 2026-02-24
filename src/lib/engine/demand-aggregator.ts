import type { CFSRow, UnitsRow } from '@/types/cfs';
import type { HourlyDemand } from '@/types/staffing';

/**
 * Aggregate CFS data by district, day of week, and hour.
 * Returns a map keyed by "district:dayOfWeek:hour"
 */
export function aggregateCFSData(
  cfsData: CFSRow[],
  categoryResponsePct: Record<string, number>
): Map<string, { totalMinutes: number; totalUnits: number }> {
  const map = new Map<string, { totalMinutes: number; totalUnits: number }>();

  for (const row of cfsData) {
    const responsePct = categoryResponsePct[row.subcategory] ?? 1.0;
    const key = `${row.district}:${row.dayOfWeek}:${row.hour}`;
    const existing = map.get(key) || { totalMinutes: 0, totalUnits: 0 };
    existing.totalMinutes += row.totalMinutes * responsePct;
    existing.totalUnits += row.units * responsePct;
    map.set(key, existing);
  }

  return map;
}

/**
 * Build a lookup map for units assigned data.
 * Keyed by "district:dayOfWeek:hour"
 */
export function buildUnitsLookup(
  unitsData: UnitsRow[]
): Map<string, number> {
  const map = new Map<string, number>();

  for (const row of unitsData) {
    const key = `${row.district}:${row.dayOfWeek}:${row.hour}`;
    map.set(key, (map.get(key) || 0) + row.unitsAssigned);
  }

  return map;
}

/**
 * Calculate hourly demand metrics for a given district, day, and hour.
 */
export function calculateHourlyDemand(
  cfsAgg: Map<string, { totalMinutes: number; totalUnits: number }>,
  unitsLookup: Map<string, number>,
  district: string,
  dayOfWeek: number,
  hour: number,
  personCarFactor: number
): HourlyDemand {
  const key = `${district}:${dayOfWeek}:${hour}`;
  const cfs = cfsAgg.get(key) || { totalMinutes: 0, totalUnits: 0 };
  const unitsAssigned = unitsLookup.get(key) || 1; // Avoid division by zero

  const timePerUnit = unitsAssigned > 0 ? cfs.totalMinutes / unitsAssigned : 0;
  const avgDailyCalls = cfs.totalUnits / (365 / 7);
  const officersNeeded = ((timePerUnit * avgDailyCalls) / 60) * personCarFactor;

  return {
    dayOfWeek,
    hour,
    district,
    totalMinutes: cfs.totalMinutes,
    totalUnits: cfs.totalUnits,
    unitsAssigned,
    timePerUnit,
    avgDailyCalls,
    officersNeeded,
  };
}

/**
 * Get all hourly demand for a district across all days and hours.
 */
export function getDistrictDemandGrid(
  cfsAgg: Map<string, { totalMinutes: number; totalUnits: number }>,
  unitsLookup: Map<string, number>,
  district: string,
  personCarFactor: number
): HourlyDemand[] {
  const demands: HourlyDemand[] = [];

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      demands.push(
        calculateHourlyDemand(cfsAgg, unitsLookup, district, day, hour, personCarFactor)
      );
    }
  }

  return demands;
}

/**
 * Get aggregate demand across all districts for heatmap display.
 * Returns a 7×24 grid of total officers needed.
 */
export function getAgencyDemandGrid(
  cfsAgg: Map<string, { totalMinutes: number; totalUnits: number }>,
  unitsLookup: Map<string, number>,
  districts: string[],
  personCarFactor: number
): number[][] {
  const grid: number[][] = [];

  for (let day = 0; day < 7; day++) {
    const row: number[] = [];
    for (let hour = 0; hour < 24; hour++) {
      let total = 0;
      for (const district of districts) {
        const demand = calculateHourlyDemand(
          cfsAgg, unitsLookup, district, day, hour, personCarFactor
        );
        total += demand.officersNeeded;
      }
      row.push(total);
    }
    grid.push(row);
  }

  return grid;
}
