'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface KpiCardProps {
  title: string;
  value: number;
  format?: (n: number) => string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function KpiCard({
  title,
  value,
  format = (n) => n.toLocaleString(),
  subtitle,
  trend,
  trendLabel,
  icon,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-5 shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <AnimatePresence mode="popLayout">
            <motion.p
              key={value}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-2xl font-bold text-gray-900"
            >
              {format(value)}
            </motion.p>
          </AnimatePresence>
        </div>
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            {icon}
          </div>
        )}
      </div>
      {(subtitle || trendLabel) && (
        <div className="mt-3 flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                'text-xs font-medium',
                trend === 'up' && 'text-red-600',
                trend === 'down' && 'text-green-600',
                trend === 'neutral' && 'text-gray-500'
              )}
            >
              {trendLabel}
            </span>
          )}
          {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
