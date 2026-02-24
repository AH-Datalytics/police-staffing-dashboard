export interface CFSRow {
  category: string;
  subcategory: string;
  signal: string;
  dayOfWeek: number; // 0=Sunday, 6=Saturday
  hour: number; // 0-23
  units: number;
  totalMinutes: number;
  district: string; // "west" | "central" | "east"
}

export interface UnitsRow {
  dayOfWeek: number;
  hour: number;
  unitsAssigned: number;
  district: string;
}

export interface IncidentPoint {
  lat: number;
  lng: number;
  hour: number;
  dayOfWeek: number;
  category: string;
  district: string;
}
