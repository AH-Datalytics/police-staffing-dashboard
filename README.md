# Police Staffing Analysis Dashboard

An interactive web dashboard that calculates police agency patrol staffing needs from calls-for-service (CFS) data. Built for consulting engagements where agencies need data-driven staffing recommendations with adjustable assumptions.

**Live demo:** [police-staffing-dashboard.vercel.app](https://police-staffing-dashboard.vercel.app)

## What It Does

The dashboard takes a full year of CFS data and calculates how many patrol officers an agency needs, broken down by district and shift. Users can adjust assumptions in real time:

- **Time allocation** — What percentage of an officer's time goes to responding to calls vs. community engagement vs. proactive patrol vs. admin work
- **Relief factor** — How much leave (vacation, sick, training, holidays) inflates the roster requirement
- **Response percentages** — Which call categories actually require a patrol response
- **Unit configuration** — Ratio of one-officer vs. two-officer cars

Every slider change instantly recalculates all staffing numbers, charts, and heatmaps.

## Pages

| Page | Description |
|------|-------------|
| **Overview** | KPI cards, controls panel, demand heatmap, staffing bar chart, district summary table |
| **Staffing** | Relief factor editor, per-category response % sliders, detailed staffing grid |
| **Demand** | District-tabbed heatmaps, animated 24-hour demand cycle, call category breakdown |
| **Scenarios** | Save assumption snapshots, compare two scenarios side-by-side |
| **Methodology** | Plain-English explanation of the calculation model and how to use each page |
| **District Detail** | Per-district KPIs, heatmap, staffing chart, and category breakdown |

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS 4** — styling
- **Zustand** — state management (3 stores: staffing, scenarios, UI)
- **Recharts** — bar charts and category breakdowns
- **Radix UI** — accessible slider, tooltip, tabs, dialog primitives
- **Framer Motion** — animated KPI number transitions
- **Vercel** — deployment

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                           # Next.js pages
│   ├── layout.tsx                 # Root layout (fonts, global CSS)
│   ├── globals.css                # Tailwind config + custom styles
│   └── (dashboard)/               # All dashboard routes
│       ├── page.tsx               # Overview (main page)
│       ├── staffing/page.tsx      # Staffing detail
│       ├── demand/page.tsx        # Demand analysis
│       ├── scenarios/page.tsx     # Scenario comparison
│       ├── guide/page.tsx         # Methodology guide
│       └── district/[id]/page.tsx # District drill-down
├── components/
│   ├── ui/                        # Reusable primitives (Card, Button, Slider, etc.)
│   ├── controls/                  # Model controls (time sliders, relief editor, response %)
│   ├── charts/                    # Visualizations (heatmap, bar charts, category breakdown)
│   ├── dashboard/                 # KPI cards
│   └── layout/                    # Top navigation, page shell
├── lib/
│   ├── engine/                    # Pure calculation functions
│   │   ├── staffing-calculator.ts # Core staffing formula chain
│   │   ├── relief-factor.ts       # Relief factor computation
│   │   └── demand-aggregator.ts   # CFS aggregation & demand grids
│   ├── data/                      # Sample JSON data + loader
│   └── utils/                     # Formatting, color scales, class names
├── stores/                        # Zustand stores
│   ├── staffing-store.ts          # Main model state + recalculation
│   ├── scenario-store.ts          # Saved scenarios (localStorage)
│   └── ui-store.ts                # UI state (animation, panels)
└── types/                         # TypeScript interfaces
    ├── agency.ts                  # Agency config, shifts, districts
    ├── cfs.ts                     # CFS rows, units, incidents
    ├── staffing.ts                # Assumptions, results
    └── scenario.ts                # Saved scenario shape
```

## Core Calculation

The engine replicates a validated Excel staffing model:

```
Per district, per shift:
  1. Aggregate CFS data → total minutes + units per hour/day
  2. time_per_unit = totalMinutes / unitsAssigned
  3. avg_daily_calls = units / (365/7)
  4. officers_for_CFS = (time_per_unit * avg_daily_calls / 60) * person_car_factor
  5. total_officers = officers_for_CFS / pct_responding_to_CFS
  6. proposed = ROUND(total_officers * relief_factor)

Relief factor = (365 * shift_hours) / (365 * shift_hours - total_hours_off)
Person car factor = 2.0 - one_person_car_pct
```

Overnight shifts (e.g., 6 PM - 6 AM) use OR logic: `hour >= 18 || hour < 6`.

## Adapting for a Real Agency

1. Replace `src/lib/data/sample-config.json` with agency-specific districts, shifts, current staffing, and defaults
2. Replace `src/lib/data/sample-cfs.json` with real CAD export data (see the existing file for the expected schema)
3. Replace `src/lib/data/sample-units.json` with units-assigned-by-hour data
4. Adjust default response percentages in `src/lib/data/sample-data-loader.ts`

## Deployment

The app auto-deploys to Vercel on push to `master`. To deploy manually:

```bash
vercel --prod
```

## License

Private. Built by AH Datalytics.
