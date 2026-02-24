'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { CFSRow } from '@/types/cfs';

interface CallCategoryBreakdownProps {
  cfsData: CFSRow[];
  district?: string | null;
  limit?: number;
}

export function CallCategoryBreakdown({
  cfsData,
  district,
  limit = 15,
}: CallCategoryBreakdownProps) {
  const data = useMemo(() => {
    const catMap = new Map<string, { calls: number; minutes: number }>();

    for (const row of cfsData) {
      if (district && row.district !== district) continue;
      const key = row.category;
      const existing = catMap.get(key) || { calls: 0, minutes: 0 };
      existing.calls += row.units;
      existing.minutes += row.totalMinutes;
      catMap.set(key, existing);
    }

    return Array.from(catMap.entries())
      .map(([name, { calls, minutes }]) => ({
        name,
        calls,
        hours: Math.round(minutes / 60),
      }))
      .sort((a, b) => b.calls - a.calls)
      .slice(0, limit);
  }, [cfsData, district, limit]);

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 28)}>
      <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis
          dataKey="name"
          type="category"
          tick={{ fontSize: 11 }}
          width={95}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: '1px solid #e5e7eb',
          }}
          formatter={(value, name) => {
            const v = typeof value === 'number' ? value : 0;
            return [
              name === 'calls' ? v.toLocaleString() : `${v.toLocaleString()} hrs`,
              name === 'calls' ? 'Total Calls' : 'Officer Hours',
            ];
          }}
        />
        <Bar dataKey="calls" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}
