'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useStaffingStore } from '@/stores/staffing-store';
import { getSubcategories } from '@/lib/data/sample-data-loader';

export function ResponsePercentEditor() {
  const { assumptions, setCategoryResponsePct } = useStaffingStore();
  const [search, setSearch] = useState('');

  const subcategories = useMemo(() => getSubcategories(), []);

  const filtered = useMemo(() => {
    if (!search) return subcategories;
    const q = search.toLowerCase();
    return subcategories.filter(
      (s) =>
        s.subcategory.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [subcategories, search]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const item of filtered) {
      const arr = map.get(item.category) || [];
      arr.push(item);
      map.set(item.category, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>CFS Response Adjustments</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2">
          {grouped.map(([category, items]) => (
            <div key={category}>
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {category}
              </h5>
              <div className="space-y-2">
                {items.map(({ subcategory }) => {
                  const pct = assumptions.categoryResponsePct[subcategory] ?? 1.0;
                  const isModified = pct !== 1.0;

                  return (
                    <div
                      key={subcategory}
                      className={`rounded-md px-3 py-2 ${
                        isModified ? 'bg-amber-50 border border-amber-200' : ''
                      }`}
                    >
                      <Slider
                        label={subcategory}
                        valueLabel={`${Math.round(pct * 100)}%`}
                        value={[pct * 100]}
                        onValueChange={([v]) =>
                          setCategoryResponsePct(subcategory, v / 100)
                        }
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
