'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { href: '/', label: 'Overview' },
  { href: '/staffing', label: 'Staffing' },
  { href: '/demand', label: 'Demand' },
  { href: '/scenarios', label: 'Scenarios' },
  { href: '/guide', label: 'Methodology' },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* Top masthead */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-gray-900" />
            <span className="text-sm font-semibold text-gray-900 tracking-tight">
              Police Staffing Analysis
            </span>
          </Link>
          <span className="text-[11px] text-gray-400 hidden sm:block">
            Interactive staffing model &middot; Sample agency data
          </span>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-0.5 -mb-px overflow-x-auto" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative px-3 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-900 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
