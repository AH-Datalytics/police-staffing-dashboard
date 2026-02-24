# Police Staffing Dashboard — Developer Guide

> This file is the single source of truth for an AI assistant (or developer) picking up this codebase. Read this before making any changes.

## Quick Reference

- **Framework:** Next.js 16.1.6, App Router, TypeScript, React 19
- **Styling:** Tailwind CSS 4 (with `@tailwindcss/postcss`), no component library — all UI is custom
- **State:** Zustand 5 (3 stores: staffing, scenarios, UI)
- **Charts:** Recharts 3 (bar charts), custom SVG (heatmap)
- **Fonts:** Inter (sans), Source Serif 4 (serif — used for headlines and KPI numbers)
- **Deploy:** Vercel, auto-deploys from `master` branch on GitHub (AH-Datalytics org)
- **Live URL:** https://police-staffing-dashboard.vercel.app

---

## Architecture Overview

```
User adjusts controls (sliders, inputs)
  → Zustand store action fires
    → recalculate() runs the pure calculation engine
      → React components re-render with new results
```

Everything is client-side. There is no backend, no API, no database. The CFS data (~16K rows, ~2.6MB) is bundled as static JSON and imported at build time.

---

## Directory Map

```
src/
├── app/
│   ├── layout.tsx                    # Root: loads Inter + Source Serif 4 fonts, white bg
│   ├── globals.css                   # @import "tailwindcss", custom scrollbar, number inputs
│   └── (dashboard)/
│       ├── layout.tsx                # TopNav + <main> wrapper (max-w-7xl centered)
│       ├── page.tsx                  # Overview — KPIs, controls, heatmap, bar chart, table
│       ├── staffing/page.tsx         # Relief factor editor + response % sliders
│       ├── demand/page.tsx           # Heatmaps with district tabs + animated cycle
│       ├── scenarios/page.tsx        # Save/compare assumption snapshots
│       ├── guide/page.tsx            # Methodology explainer (static content)
│       └── district/[id]/page.tsx    # District drill-down (dynamic route)
│
├── components/
│   ├── ui/                           # Low-level primitives
│   │   ├── card.tsx                  # Card, CardHeader, CardTitle, CardContent
│   │   ├── button.tsx                # 4 variants (primary/secondary/ghost/destructive), 3 sizes
│   │   ├── slider.tsx                # Radix slider with label + value display
│   │   ├── number-input.tsx          # Controlled numeric input with min/max/suffix
│   │   ├── tooltip.tsx               # InfoTooltip — "?" icon with Radix tooltip
│   │   ├── tabs.tsx                  # Radix tabs wrapper
│   │   └── badge.tsx                 # 5 variants (default/success/warning/danger/info)
│   │
│   ├── controls/                     # Model assumption editors
│   │   ├── controls-panel.tsx        # Collapsible 3-column panel on Overview page
│   │   ├── time-allocation-sliders.tsx  # 4 linked sliders that always sum to 100%
│   │   ├── relief-factor-editor.tsx     # Editable leave-day table → computed relief factor
│   │   └── response-percent-editor.tsx  # Per-subcategory sliders, searchable, grouped
│   │
│   ├── charts/
│   │   ├── demand-heatmap.tsx        # Custom SVG 7-row × 24-col grid, blue→amber→red
│   │   ├── staffing-bar-chart.tsx    # Recharts grouped bar, modes: 'total' | 'byShift'
│   │   └── call-category-breakdown.tsx  # Recharts horizontal bar, top 15 categories
│   │
│   ├── dashboard/
│   │   └── kpi-card.tsx              # Animated number card (framer-motion), serif font
│   │
│   └── layout/
│       ├── top-nav.tsx               # Sticky header: masthead + horizontal tab nav
│       ├── page-shell.tsx            # Simple <div className="space-y-8"> wrapper
│       ├── sidebar.tsx               # (Unused — kept for reference, replaced by top-nav)
│       └── header.tsx                # (Unused — kept for reference)
│
├── lib/
│   ├── engine/                       # Pure calculation functions (no side effects)
│   │   ├── staffing-calculator.ts    # Main engine — see "Calculation Engine" below
│   │   ├── relief-factor.ts          # calculateReliefFactor(inputs, shiftLength)
│   │   └── demand-aggregator.ts      # CFS aggregation, unit lookups, demand grids
│   │
│   ├── data/
│   │   ├── sample-data-loader.ts     # Imports all JSON, exports typed arrays + helpers
│   │   ├── sample-config.json        # Agency config (districts, shifts, staffing, defaults)
│   │   ├── sample-cfs.json           # 16,497 CFS records (category, hour, day, district, minutes, units)
│   │   ├── sample-units.json         # 504 records (units assigned per hour/day/district)
│   │   └── sample-incidents.json     # 5,000 synthetic incident points (unused since map removed)
│   │
│   └── utils/
│       ├── cn.ts                     # clsx + twMerge wrapper
│       ├── color.ts                  # getHeatmapColor(value, min, max) → CSS color string
│       └── format.ts                 # formatNumber, formatPercent, formatHour, getDayName
│
├── stores/
│   ├── staffing-store.ts             # Core model state — see "Stores" below
│   ├── scenario-store.ts             # Saved scenarios with localStorage persistence
│   └── ui-store.ts                   # Sidebar, animation, active district, panels
│
└── types/
    ├── agency.ts                     # AgencyConfig, ShiftConfig, ReliefFactorInputs, TimeAllocation, DistrictCenter
    ├── cfs.ts                        # CFSRow, UnitsRow, IncidentPoint
    ├── staffing.ts                   # StaffingAssumptions, ShiftStaffingResult, DistrictStaffingResult, AgencyStaffingResult, HourlyDemand
    └── scenario.ts                   # Scenario (id, name, date, assumptions, result)
```

---

## Calculation Engine

All calculation logic lives in `src/lib/engine/`. These are pure functions with no React or store dependencies.

### staffing-calculator.ts

**`getPersonCarFactor(onePersonCarPct: number): number`**
- Input: 0.0 (all two-person cars) to 1.0 (all one-person cars)
- Output: 1.0 to 2.0 (multiplier on officer count)
- Formula: `(1 * pct) + (2 * (1 - pct))`

**`getShiftHours(shift: ShiftConfig): number[]`**
- Returns array of hour indices (0-23) that fall within the shift
- Handles overnight shifts with OR logic: `hour >= start || hour < end`

**`calculateShiftStaffing(...): ShiftStaffingResult`**
- For each hour/day combination in the shift:
  1. Look up aggregated CFS minutes and unit count
  2. `timePerUnit = totalMinutes / unitsAssigned`
  3. `avgDailyCalls = units / (365 / 7)`
  4. `officersForCFS = (timePerUnit * avgDailyCalls / 60) * personCarFactor`
  5. `totalOfficers = officersForCFS / respondingCFSPct`
- Takes the MAX across all hour/day combos (worst-case staffing)
- Applies relief factor and agency size modifier
- Returns proposed count, current count, and gap

**`calculateAgencyStaffing(config, cfsData, unitsData, assumptions): AgencyStaffingResult`**
- Orchestrates the full calculation across all districts and shifts
- Returns totals (proposed, current, gap) plus per-district/per-shift breakdowns
- This is the function called by the Zustand store on every assumption change

### relief-factor.ts

**`calculateReliefFactor(inputs: ReliefFactorInputs, shiftLengthHours: number): number`**
- Converts leave days to hours: `totalHoursOff = sumOfAllDays * shiftLengthHours`
- Formula: `(365 * shiftLength) / (365 * shiftLength - totalHoursOff)`
- Typical output: ~1.6-1.8x

### demand-aggregator.ts

**`aggregateCFSData(cfsData, categoryResponsePct)`**
- Groups CFS rows by `district:dayOfWeek:hour`
- Applies per-subcategory response percentage filter
- Returns Map of `{totalMinutes, totalUnits}` per cell

**`buildUnitsLookup(unitsData)`**
- Returns Map of `district:dayOfWeek:hour` → `unitsAssigned`

**`getAgencyDemandGrid(cfsAgg, unitsLookup, districts, personCarFactor)`**
- Returns `HourlyDemand[][]` — a 7×24 grid of officer demand values
- Used by the demand heatmap component

---

## Zustand Stores

### staffing-store.ts (main model)

```typescript
interface StaffingState {
  assumptions: StaffingAssumptions;  // All user-adjustable inputs
  result: AgencyStaffingResult;      // Computed output

  // Actions — each calls recalculate() internally
  setTimeAllocation(ta: TimeAllocation): void;
  setOnePersonCarPct(pct: number): void;
  setAgencySize(size: number): void;
  setReliefFactorInputs(inputs: ReliefFactorInputs): void;
  setCategoryResponsePct(pct: Record<string, number>): void;
  resetDefaults(): void;
}
```

**Key pattern:** Every setter calls `recalculate()` which runs `calculateAgencyStaffing()` with the full dataset. This is fast (~50ms for 16K rows) so there's no debouncing.

### scenario-store.ts (persisted)

```typescript
interface ScenarioState {
  scenarios: Scenario[];
  compareIds: [string | null, string | null];

  saveScenario(name: string, assumptions: StaffingAssumptions, result: AgencyStaffingResult): void;
  deleteScenario(id: string): void;
  setCompareIds(ids: [string | null, string | null]): void;
}
```

Uses `zustand/middleware` `persist` with `localStorage` key `'staffing-scenarios'`.

### ui-store.ts

Tracks UI-only state: `controlsPanelOpen`, `activeDistrict`, `animationHour`, `animationPlaying`, etc.

---

## Data Format

### sample-config.json
```json
{
  "agencyName": "Sample Agency",
  "districts": ["west", "central", "east"],
  "districtLabels": { "west": "West", "central": "Central", "east": "East" },
  "shifts": [
    { "id": "day", "label": "6AM - 6PM", "startHour": 6, "endHour": 18 },
    { "id": "night", "label": "6PM - 6AM", "startHour": 18, "endHour": 6 },
    { "id": "power", "label": "3PM - 3AM", "startHour": 15, "endHour": 3 }
  ],
  "shiftLengthHours": 12,
  "currentStaffing": {
    "west": { "day": 14, "night": 12, "power": 9 },
    "central": { "day": 9, "night": 7, "power": 5 },
    "east": { "day": 10, "night": 9, "power": 8 }
  },
  "defaults": {
    "respondingCFS": 0.4,
    "communityTime": 0.2,
    "proactiveTime": 0.2,
    "adminTime": 0.2,
    "onePersonCarPct": 1.0,
    "agencySize": 90,
    "baselineSize": 130
  },
  "reliefFactorDefaults": {
    "personalTimeDays": 4,
    "vacationDays": 12,
    "holidayDays": 12,
    "sickLeaveDays": 5,
    "trainingDays": 5,
    "regularDaysOff": 182.5,
    "otherDaysOut": 1
  }
}
```

### sample-cfs.json (array, ~16K rows)
```json
{
  "category": "Criminal Activity",
  "subcategory": "Robbery",
  "signal": "10-45",
  "dayOfWeek": 0,
  "hour": 14,
  "units": 2,
  "totalMinutes": 45.2,
  "district": "west"
}
```

### sample-units.json (array, 504 rows)
```json
{
  "dayOfWeek": 0,
  "hour": 14,
  "unitsAssigned": 12,
  "district": "west"
}
```

---

## Key Component Details

### Time Allocation Sliders (`controls/time-allocation-sliders.tsx`)
- 4 sliders: Responding to CFS, Community Time, Proactive Time, Admin Time
- **Must always sum to exactly 100%**
- When one slider moves, the other 3 redistribute proportionally
- Uses a normalization pass on the largest value to fix floating-point drift
- Calls `store.setTimeAllocation()` on every change

### Demand Heatmap (`charts/demand-heatmap.tsx`)
- Custom SVG — not a library component
- 7 rows (Sun-Sat) x 24 columns (midnight-11 PM)
- Color scale via `getHeatmapColor()`: blue (low) → amber (mid) → red (high)
- Hover tooltip shows exact officer count
- Has a `compact` prop for smaller inline usage

### KPI Card (`dashboard/kpi-card.tsx`)
- Uses framer-motion `AnimatePresence` for number transitions
- Serif font for the value (`var(--font-serif)`)
- Optional `trend` prop (up/down arrow) and `trendLabel`
- `format` prop is a function: `(value: number) => string`

### Top Navigation (`layout/top-nav.tsx`)
- Sticky header with two rows: masthead (logo + tagline) and tab navigation
- Active tab detection: exact match for `/`, startsWith for all other routes
- Nav items array at top of file — edit this to add/remove pages

---

## How To: Common Tasks

### Add a new page
1. Create `src/app/(dashboard)/your-page/page.tsx`
2. Add `'use client'` at top
3. Import `useStaffingStore()` for model data
4. Add `{ href: '/your-page', label: 'Your Page' }` to `navItems` in `src/components/layout/top-nav.tsx`

### Add a new control/assumption
1. Add the field to `StaffingAssumptions` in `src/types/staffing.ts`
2. Add a setter action in `src/stores/staffing-store.ts` (remember to call `recalculate()`)
3. Wire it into the calculation in `src/lib/engine/staffing-calculator.ts`
4. Build a UI control in `src/components/controls/` and add it to the relevant page

### Change the agency data
1. Replace `src/lib/data/sample-config.json` — districts, shifts, current staffing, defaults
2. Replace `src/lib/data/sample-cfs.json` — CFS records from CAD export
3. Replace `src/lib/data/sample-units.json` — units assigned by hour/day/district
4. Update default response percentages in `src/lib/data/sample-data-loader.ts` (`getDefaultCategoryResponsePct()`)
5. The TypeScript types enforce the expected schema — the build will fail if the data shape is wrong

### Adjust the design/styling
- Fonts are set in `src/app/layout.tsx` (Inter + Source Serif 4)
- Color palette is standard Tailwind (gray-900 for text, blue-600 for accents, red-600 for warnings)
- Card styling is in `src/components/ui/card.tsx` — currently minimal borders, no shadows
- Heatmap colors are in `src/lib/utils/color.ts` (`getHeatmapColor`)

### Deploy
- Push to `master` on GitHub → Vercel auto-deploys
- Manual deploy: `vercel --prod` from project root
- The Vercel project is under the AH-Datalytics team

---

## Known Quirks

1. **`sidebar.tsx` and `header.tsx` still exist** but are unused — the app switched to `top-nav.tsx` for a horizontal layout. Safe to delete if cleaning up.

2. **`sample-incidents.json` still exists** but is unused since the map page was removed. Safe to delete if cleaning up.

3. **`maplibre-gl` and `react-map-gl`** are still in `package.json` but unused. Can be removed with `npm uninstall maplibre-gl react-map-gl` to reduce bundle size.

4. **`@nivo/core` and `@nivo/heatmap`** are installed but unused — the heatmap is custom SVG. Can be removed.

5. **The time allocation sliders** use proportional redistribution which can feel slightly unintuitive — moving one slider affects all others.

6. **Scenarios are browser-local** — stored in `localStorage`. Clearing browser data deletes all saved scenarios. There is no server-side persistence.

7. **The `agencySize` modifier** scales proposed staffing by `agencySize / baselineSize`. The baseline (130) is from the original sample data. When adapting for a new agency, set both `agencySize` and `baselineSize` in `sample-config.json`.

---

## Build & Dev Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Serve production build locally
npm run lint     # ESLint
```

---

## Dependencies Worth Knowing

| Package | Purpose | Used Where |
|---------|---------|------------|
| `zustand` | State management | 3 stores in `src/stores/` |
| `recharts` | Bar charts | `staffing-bar-chart.tsx`, `call-category-breakdown.tsx` |
| `@radix-ui/react-slider` | Accessible range slider | `slider.tsx`, used by all slider controls |
| `@radix-ui/react-tooltip` | Accessible tooltips | `tooltip.tsx` (InfoTooltip) |
| `@radix-ui/react-tabs` | Tab switching | `tabs.tsx`, demand page district tabs |
| `@radix-ui/react-dialog` | Modal dialogs | Scenario naming dialog |
| `framer-motion` | Animations | KPI card number transitions |
| `lucide-react` | Icons | Throughout (Shield, Filter, ChevronDown, etc.) |
| `class-variance-authority` | CSS variant utility | `button.tsx`, `badge.tsx` |
| `clsx` | Class name merging | `cn.ts` utility |
