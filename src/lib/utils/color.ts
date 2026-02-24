/**
 * Interpolate between colors for heatmap display.
 * Uses a blue → amber → red scale.
 */
const HEATMAP_COLORS = [
  { stop: 0, r: 59, g: 130, b: 246 },    // blue-500
  { stop: 0.25, r: 96, g: 165, b: 250 },  // blue-400
  { stop: 0.5, r: 251, g: 191, b: 36 },   // amber-400
  { stop: 0.75, r: 245, g: 158, b: 11 },  // amber-500
  { stop: 1, r: 239, g: 68, b: 68 },      // red-500
];

export function getHeatmapColor(value: number, min: number, max: number): string {
  if (max === min) return `rgb(${HEATMAP_COLORS[0].r}, ${HEATMAP_COLORS[0].g}, ${HEATMAP_COLORS[0].b})`;

  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));

  let lower = HEATMAP_COLORS[0];
  let upper = HEATMAP_COLORS[HEATMAP_COLORS.length - 1];

  for (let i = 0; i < HEATMAP_COLORS.length - 1; i++) {
    if (t >= HEATMAP_COLORS[i].stop && t <= HEATMAP_COLORS[i + 1].stop) {
      lower = HEATMAP_COLORS[i];
      upper = HEATMAP_COLORS[i + 1];
      break;
    }
  }

  const range = upper.stop - lower.stop;
  const localT = range === 0 ? 0 : (t - lower.stop) / range;

  const r = Math.round(lower.r + (upper.r - lower.r) * localT);
  const g = Math.round(lower.g + (upper.g - lower.g) * localT);
  const b = Math.round(lower.b + (upper.b - lower.b) * localT);

  return `rgb(${r}, ${g}, ${b})`;
}

export function getGapColor(gap: number): string {
  if (gap > 0) return 'text-red-600';
  if (gap < 0) return 'text-green-600';
  return 'text-gray-500';
}

export function getGapBg(gap: number): string {
  if (gap > 0) return 'bg-red-50';
  if (gap < 0) return 'bg-green-50';
  return 'bg-gray-50';
}
