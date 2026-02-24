'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DistrictStaffingResult } from '@/types/staffing';

interface StaffingBarChartProps {
  districts: DistrictStaffingResult[];
  mode?: 'total' | 'byShift';
}

export function StaffingBarChart({ districts, mode = 'total' }: StaffingBarChartProps) {
  if (mode === 'total') {
    const data = districts.map((d) => ({
      name: d.districtLabel,
      Current: Math.round(d.totalCurrent),
      Proposed: d.totalProposed,
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Current" fill="#94a3b8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Proposed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // By shift mode
  const data = districts.flatMap((d) =>
    d.shifts.map((s) => ({
      name: `${d.districtLabel} ${s.shiftLabel}`,
      Current: Math.round(s.currentStaffing * 100) / 100,
      Proposed: s.proposedWithRelief,
    }))
  );

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: '1px solid #e5e7eb',
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Current" fill="#94a3b8" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Proposed" fill="#3b82f6" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
