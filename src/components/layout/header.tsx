'use client';

import { usePathname } from 'next/navigation';
import { agencyConfig } from '@/lib/data/sample-data-loader';

const pageTitles: Record<string, string> = {
  '/': 'Overview',
  '/staffing': 'Staffing Detail',
  '/demand': 'Demand Analysis',
  '/map': 'Map View',
  '/scenarios': 'Scenarios',
  '/guide': 'How It Works',
};

export function Header() {
  const pathname = usePathname();

  const title = pathname.startsWith('/district/')
    ? 'District Detail'
    : pageTitles[pathname] || 'Dashboard';

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-500">{agencyConfig.agencyName}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">Sample CFS Data</span>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-semibold">
          21CP
        </div>
      </div>
    </header>
  );
}
