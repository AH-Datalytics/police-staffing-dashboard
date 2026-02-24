'use client';

import { useMemo } from 'react';
import { getHeatmapColor } from '@/lib/utils/color';
import { getDayName, formatHour } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface DemandHeatmapProps {
  /** 7×24 grid of values (day × hour) */
  data: number[][];
  className?: string;
  compact?: boolean;
}

export function DemandHeatmap({ data, className, compact = false }: DemandHeatmapProps) {
  const { min, max } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const row of data) {
      for (const v of row) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    return { min, max };
  }, [data]);

  const cellSize = compact ? 'w-4 h-4' : 'w-7 h-7';
  const fontSize = compact ? 'text-[7px]' : 'text-[9px]';

  return (
    <div className={cn('overflow-x-auto', className)}>
      <div className="inline-block">
        {/* Hour labels */}
        <div className="flex ml-10">
          {Array.from({ length: 24 }, (_, h) => (
            <div
              key={h}
              className={cn(cellSize, 'flex items-center justify-center', fontSize, 'text-gray-400')}
            >
              {compact ? (h % 3 === 0 ? h : '') : h}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        {data.map((row, dayIdx) => (
          <div key={dayIdx} className="flex items-center">
            <div className="w-10 text-right pr-2 text-xs text-gray-500">
              {getDayName(dayIdx)}
            </div>
            {row.map((value, hourIdx) => (
              <div
                key={hourIdx}
                className={cn(
                  cellSize,
                  'rounded-sm border border-white/50 cursor-default transition-transform hover:scale-110',
                  fontSize
                )}
                style={{ backgroundColor: getHeatmapColor(value, min, max) }}
                title={`${getDayName(dayIdx, true)} ${formatHour(hourIdx)}: ${value.toFixed(1)} officers`}
              />
            ))}
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 ml-10">
          <span className="text-[10px] text-gray-400">Low</span>
          <div className="flex h-2">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="w-3 h-full"
                style={{ backgroundColor: getHeatmapColor(i / 19, 0, 1) }}
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-400">High</span>
        </div>
      </div>
    </div>
  );
}
