import type { CFSRow, UnitsRow, IncidentPoint } from '@/types/cfs';
import type { AgencyConfig } from '@/types/agency';

import cfsRaw from './sample-cfs.json';
import unitsRaw from './sample-units.json';
import configRaw from './sample-config.json';
import incidentsRaw from './sample-incidents.json';

export const cfsData: CFSRow[] = cfsRaw as CFSRow[];
export const unitsData: UnitsRow[] = unitsRaw as UnitsRow[];
export const agencyConfig: AgencyConfig = configRaw as unknown as AgencyConfig;
export const incidentData: IncidentPoint[] = incidentsRaw as IncidentPoint[];

/**
 * Get unique categories from CFS data.
 */
export function getCategories(): string[] {
  const cats = new Set<string>();
  for (const row of cfsData) {
    cats.add(row.category);
  }
  return Array.from(cats).sort();
}

/**
 * Get unique subcategories from CFS data.
 */
export function getSubcategories(): { category: string; subcategory: string }[] {
  const map = new Map<string, string>();
  for (const row of cfsData) {
    if (!map.has(row.subcategory)) {
      map.set(row.subcategory, row.category);
    }
  }
  return Array.from(map.entries())
    .map(([subcategory, category]) => ({ category, subcategory }))
    .sort((a, b) => a.category.localeCompare(b.category) || a.subcategory.localeCompare(b.subcategory));
}

/**
 * Get default category response percentages (all 1.0 except known adjustments).
 */
export function getDefaultCategoryResponsePct(): Record<string, number> {
  const pct: Record<string, number> = {};
  const subcats = getSubcategories();
  for (const { subcategory } of subcats) {
    pct[subcategory] = 1.0;
  }
  // Default adjustments from sample data
  pct['Welfare Check'] = 0.5;
  pct['Traffic Accident'] = 0.5;
  return pct;
}
