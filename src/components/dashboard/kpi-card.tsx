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
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        'border-t-2 border-gray-900 pt-3 pb-1',
        className
      )}
    >
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1">
        {title}
      </p>
      <AnimatePresence mode="popLayout">
        <motion.p
          key={value}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="text-3xl font-bold text-gray-900 tracking-tight"
          style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
        >
          {format(value)}
        </motion.p>
      </AnimatePresence>
      {(subtitle || trendLabel) && (
        <div className="mt-1 flex items-center gap-1.5">
          {trend && trendLabel && (
            <span
              className={cn(
                'text-xs font-medium',
                trend === 'up' && 'text-red-600',
                trend === 'down' && 'text-green-600',
                trend === 'neutral' && 'text-gray-400'
              )}
            >
              {trendLabel}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-gray-400">
              {trend && trendLabel ? '· ' : ''}{subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
