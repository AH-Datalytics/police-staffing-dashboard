'use client';

import { PageShell } from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';

export default function GuidePage() {
  return (
    <PageShell className="max-w-3xl mx-auto">
      {/* Hero */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          How This Dashboard Works
        </h2>
        <p className="text-base text-gray-500 leading-relaxed">
          A guide to understanding the staffing model, its inputs, and how to
          use interactive controls to explore different scenarios.
        </p>
      </div>

      {/* What is this? */}
      <Card>
        <CardContent className="py-6 prose prose-sm prose-gray max-w-none">
          <h3 className="text-lg font-semibold text-gray-900 mt-0">What is this dashboard?</h3>
          <p className="text-gray-600 leading-relaxed">
            This tool helps police agencies answer a simple but critical question:{' '}
            <em className="text-gray-900 font-medium">How many officers do we actually need?</em>
          </p>
          <p className="text-gray-600 leading-relaxed">
            It takes real calls-for-service (CFS) data — every dispatched call over
            a full year — and uses an established methodology to calculate how many
            officers are needed to cover that workload. The model accounts for time
            spent on calls, how officers split their time, and the reality that
            officers need days off, vacation, and training.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Every number on this dashboard updates in real time as you adjust the
            controls. There is no &ldquo;submit&rdquo; button — just move a slider
            and watch the results change.
          </p>
        </CardContent>
      </Card>

      {/* The Core Calculation */}
      <Card>
        <CardContent className="py-6 prose prose-sm prose-gray max-w-none">
          <h3 className="text-lg font-semibold text-gray-900 mt-0">The Core Calculation</h3>
          <p className="text-gray-600 leading-relaxed">
            The model works in five steps. Each step builds on the previous one:
          </p>

          <div className="space-y-4 mt-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Measure the workload</p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  For every hour of every day, the model calculates how much time
                  officers spend responding to calls. It uses the actual dispatch
                  data: number of calls, units dispatched, and minutes spent on scene.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Calculate officers needed for CFS</p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Using time-per-call and call volume, the model determines how many
                  officers are needed <em>just for responding to calls</em> during
                  the busiest periods. This is the baseline demand.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Account for all officer activities</p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Officers don&apos;t spend 100% of their time on calls. The
                  &ldquo;Time Allocation&rdquo; split (default: 40% CFS, 20%
                  community, 20% proactive, 20% admin) means you need more officers
                  than just the call-response minimum. If only 40% of time goes to
                  CFS, you need 2.5&times; the CFS-only number.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Apply the Relief Factor</p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  A single officer can&apos;t work every day of the year. Between
                  vacation, sick leave, training, holidays, and regular days off,
                  each position requires multiple people on the roster to keep it
                  filled. The relief factor (typically 2.0&ndash;3.0) converts
                  &ldquo;positions needed on the street&rdquo; to &ldquo;officers
                  needed on the payroll.&rdquo;
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">5</div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Scale to agency size</p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Finally, an agency-size modifier scales the results. This allows
                  you to model a department of any size using the same underlying
                  call patterns.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Understanding the Controls */}
      <Card>
        <CardContent className="py-6 prose prose-sm prose-gray max-w-none">
          <h3 className="text-lg font-semibold text-gray-900 mt-0">Understanding the Controls</h3>

          <div className="space-y-5 mt-4">
            <div className="border-l-2 border-blue-400 pl-4">
              <p className="font-medium text-gray-900 mb-1">Time Allocation (4 sliders)</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                How should officers split their time? These four categories must
                always total 100%. Moving one slider automatically adjusts the
                others. A lower CFS percentage means officers spend more time on
                community engagement and proactive work — but it also means you
                need more total officers to cover the same call volume.
              </p>
              <p className="text-gray-400 text-xs italic mt-1">
                Try it: Lower &ldquo;Responding to CFS&rdquo; from 40% to 30% and
                watch the proposed staffing increase.
              </p>
            </div>

            <div className="border-l-2 border-blue-400 pl-4">
              <p className="font-medium text-gray-900 mb-1">One-Person Car %</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                What percentage of patrol units have a single officer? At 100%
                (all one-person cars), each unit = 1 officer. At 0% (all
                two-person cars), each unit = 2 officers, doubling the staffing
                requirement.
              </p>
            </div>

            <div className="border-l-2 border-blue-400 pl-4">
              <p className="font-medium text-gray-900 mb-1">Agency Size</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Scales all results proportionally. The sample data is from an
                agency of 130 officers; setting this to 90 scales everything
                by 90/130 = 0.69. This lets you model a smaller or larger
                department using the same call patterns.
              </p>
            </div>

            <div className="border-l-2 border-blue-400 pl-4">
              <p className="font-medium text-gray-900 mb-1">Relief Factor (Staffing Detail page)</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Edit the number of vacation days, sick days, training days, and
                other time off to see how leave policies affect total staffing
                needs. More time off = higher relief factor = more officers needed
                on the roster.
              </p>
            </div>

            <div className="border-l-2 border-blue-400 pl-4">
              <p className="font-medium text-gray-900 mb-1">CFS Response Adjustments (Staffing Detail page)</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Not every type of call requires a sworn officer response. Use
                these per-category sliders to model &ldquo;what if we diverted 50%
                of welfare checks to a civilian crisis team?&rdquo; Reducing a
                category&apos;s response percentage removes that workload from the
                staffing calculation.
              </p>
              <p className="text-gray-400 text-xs italic mt-1">
                Categories highlighted in amber have been modified from the default 100%.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Page Guide */}
      <Card>
        <CardContent className="py-6 prose prose-sm prose-gray max-w-none">
          <h3 className="text-lg font-semibold text-gray-900 mt-0">Page-by-Page Guide</h3>

          <div className="space-y-4 mt-4">
            <div>
              <p className="font-medium text-gray-900 mb-1">Overview</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Your starting point. See the headline numbers at a glance — total
                proposed staffing, current staffing, the gap between them, and the
                relief factor. The controls panel lets you adjust the model right
                here. The bar chart compares current vs. proposed across districts,
                and the heatmap shows when demand is highest.
              </p>
            </div>

            <div>
              <p className="font-medium text-gray-900 mb-1">Staffing Detail</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                The deep-dive page. Edit the relief factor inputs line by line
                (e.g., &ldquo;what if we reduced vacation to 10 days?&rdquo;).
                Search and adjust response percentages for individual call
                categories. See the full district-by-shift staffing grid.
              </p>
            </div>

            <div>
              <p className="font-medium text-gray-900 mb-1">Demand Analysis</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Understand <em>when</em> officers are needed. The heatmap shows
                demand intensity for every hour of every day. Use the animated
                24-hour cycle to watch demand rise and fall through the day. The
                category breakdown shows which types of calls drive the most
                workload.
              </p>
            </div>

            <div>
              <p className="font-medium text-gray-900 mb-1">Map View</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                See <em>where</em> incidents occur. Filter by time of day, day of
                week, or district to identify geographic hotspots. Brighter, larger
                circles indicate higher incident density.
              </p>
            </div>

            <div>
              <p className="font-medium text-gray-900 mb-1">Scenarios</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Save a snapshot of your current settings and results, give it a
                name, then adjust the controls and save another. Select any two
                scenarios to see a side-by-side comparison of how different
                assumptions affect staffing. Scenarios persist in your browser
                across sessions.
              </p>
            </div>

            <div>
              <p className="font-medium text-gray-900 mb-1">District Drill-Down</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Click any district name in the overview table to see district-specific
                KPIs, demand patterns, and call breakdowns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Terms */}
      <Card>
        <CardContent className="py-6 prose prose-sm prose-gray max-w-none">
          <h3 className="text-lg font-semibold text-gray-900 mt-0">Key Terms</h3>
          <dl className="space-y-3 mt-4">
            <div>
              <dt className="font-medium text-gray-900 text-sm">Calls for Service (CFS)</dt>
              <dd className="text-gray-500 text-sm leading-relaxed mt-0.5">
                Incidents dispatched through the CAD (Computer Aided Dispatch)
                system. Each record includes the call type, time spent, number of
                units dispatched, and geographic district.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900 text-sm">Relief Factor</dt>
              <dd className="text-gray-500 text-sm leading-relaxed mt-0.5">
                The ratio of total roster positions to on-duty positions. A factor
                of 2.54 means you need ~2.54 officers on the payroll for every 1
                position that needs to be staffed at all times, accounting for
                time off.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900 text-sm">Person-Car Factor</dt>
              <dd className="text-gray-500 text-sm leading-relaxed mt-0.5">
                Converts units (patrol cars) to officers. Ranges from 1.0 (all
                solo cars) to 2.0 (all two-officer cars). A mix produces a value
                in between.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900 text-sm">Proposed Staffing</dt>
              <dd className="text-gray-500 text-sm leading-relaxed mt-0.5">
                The model&apos;s recommendation for how many officers should be on the
                roster, based on peak demand, time allocation, and the relief factor.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900 text-sm">Gap</dt>
              <dd className="text-gray-500 text-sm leading-relaxed mt-0.5">
                The difference between proposed and current staffing. A positive
                gap (shown in red) means the agency is understaffed relative to
                the model&apos;s recommendation.
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Methodology note */}
      <div className="text-center py-6">
        <p className="text-xs text-gray-400 leading-relaxed max-w-lg mx-auto">
          This staffing model follows the methodology described in the COPS/DOJ
          publication &ldquo;Calculating Staffing Needs.&rdquo; The relief factor
          calculation and time allocation framework are standard approaches used
          in police workforce planning nationwide.
        </p>
      </div>
    </PageShell>
  );
}
