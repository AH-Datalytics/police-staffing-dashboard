'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Map,
  GitCompareArrows,
  ChevronLeft,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useUIStore } from '@/stores/ui-store';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/staffing', label: 'Staffing Detail', icon: Users },
  { href: '/demand', label: 'Demand Analysis', icon: BarChart3 },
  { href: '/map', label: 'Map View', icon: Map },
  { href: '/scenarios', label: 'Scenarios', icon: GitCompareArrows },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-gray-950 text-white transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-56' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-800">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <Shield className="w-4 h-4" />
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <span className="text-sm font-semibold whitespace-nowrap">Staffing Dashboard</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse button */}
      <div className="px-2 py-3 border-t border-gray-800">
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full"
        >
          <ChevronLeft
            className={cn(
              'w-4 h-4 transition-transform flex-shrink-0',
              !sidebarOpen && 'rotate-180'
            )}
          />
          {sidebarOpen && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
