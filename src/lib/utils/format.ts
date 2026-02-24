export function formatNumber(n: number, decimals: number = 0): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(n: number, decimals: number = 0): string {
  return `${(n * 100).toFixed(decimals)}%`;
}

export function formatDelta(n: number, decimals: number = 0): string {
  const sign = n > 0 ? '+' : '';
  return `${sign}${formatNumber(n, decimals)}`;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function getDayName(dayOfWeek: number, full: boolean = false): string {
  return full ? DAY_NAMES_FULL[dayOfWeek] : DAY_NAMES[dayOfWeek];
}

export function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}
