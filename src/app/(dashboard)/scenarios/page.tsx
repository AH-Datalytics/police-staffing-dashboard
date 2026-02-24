'use client';

import { useState } from 'react';
import { Plus, Trash2, GitCompareArrows } from 'lucide-react';
import { PageShell } from '@/components/layout/page-shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStaffingStore } from '@/stores/staffing-store';
import { useScenarioStore } from '@/stores/scenario-store';
import { formatNumber } from '@/lib/utils/format';

export default function ScenariosPage() {
  const { assumptions, result } = useStaffingStore();
  const { scenarios, compareIds, saveScenario, deleteScenario, setCompareIds } =
    useScenarioStore();
  const [saveName, setSaveName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleSave = () => {
    if (!saveName.trim()) return;
    saveScenario({
      name: saveName.trim(),
      assumptions: structuredClone(assumptions),
      result: structuredClone(result),
    });
    setSaveName('');
    setShowSaveDialog(false);
  };

  const toggleCompare = (id: string) => {
    if (compareIds[0] === id) {
      setCompareIds([null, compareIds[1]]);
    } else if (compareIds[1] === id) {
      setCompareIds([compareIds[0], null]);
    } else if (!compareIds[0]) {
      setCompareIds([id, compareIds[1]]);
    } else if (!compareIds[1]) {
      setCompareIds([compareIds[0], id]);
    } else {
      // Replace first
      setCompareIds([id, compareIds[1]]);
    }
  };

  const scenarioA = scenarios.find((s) => s.id === compareIds[0]);
  const scenarioB = scenarios.find((s) => s.id === compareIds[1]);

  return (
    <PageShell>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Saved Scenarios</h2>
          <p className="text-sm text-gray-500">
            Save your current model settings as a named scenario, then change assumptions and save another. Select any two to compare side by side.
          </p>
        </div>
        <Button onClick={() => setShowSaveDialog(true)}>
          <Plus className="w-4 h-4" />
          Save Current
        </Button>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Scenario Name
                </label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="e.g., Baseline Scenario"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>
              <Button onClick={handleSave} disabled={!saveName.trim()}>
                Save
              </Button>
              <Button variant="ghost" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Current: {result.totalProposed} proposed officers, relief factor{' '}
              {result.reliefFactor.toFixed(2)}, {Math.round(assumptions.timeAllocation.respondingCFS * 100)}%
              CFS
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scenario Cards */}
      {scenarios.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GitCompareArrows className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No scenarios saved yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Adjust the model controls on the Overview or Staffing Detail page, then come
              back here and click &ldquo;Save Current&rdquo; to capture a snapshot. Scenarios
              are stored in your browser and persist across sessions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((s) => {
            const isComparing =
              compareIds[0] === s.id || compareIds[1] === s.id;

            return (
              <Card
                key={s.id}
                className={isComparing ? 'ring-2 ring-blue-500' : ''}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {s.name}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteScenario(s.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Proposed</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatNumber(s.result.totalProposed)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Gap</p>
                      <p
                        className={`text-lg font-bold ${
                          s.result.totalGap > 0
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}
                      >
                        {s.result.totalGap > 0 ? '+' : ''}
                        {formatNumber(Math.round(s.result.totalGap))}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="info">
                      RF {s.result.reliefFactor.toFixed(2)}
                    </Badge>
                    <Badge>
                      {Math.round(s.assumptions.timeAllocation.respondingCFS * 100)}% CFS
                    </Badge>
                    <Badge>
                      {Math.round(s.assumptions.onePersonCarPct * 100)}% 1-person
                    </Badge>
                  </div>

                  <Button
                    variant={isComparing ? 'primary' : 'secondary'}
                    size="sm"
                    className="w-full"
                    onClick={() => toggleCompare(s.id)}
                  >
                    <GitCompareArrows className="w-3.5 h-3.5" />
                    {isComparing ? 'Comparing' : 'Compare'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Comparison View */}
      {scenarioA && scenarioB && (
        <Card>
          <CardHeader>
            <CardTitle>
              Comparing: {scenarioA.name} vs {scenarioB.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-500">
                      Metric
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-blue-600">
                      {scenarioA.name}
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-purple-600">
                      {scenarioB.name}
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">
                      Delta
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-3 text-gray-700">Total Proposed</td>
                    <td className="py-2 px-3 text-right font-medium">
                      {scenarioA.result.totalProposed}
                    </td>
                    <td className="py-2 px-3 text-right font-medium">
                      {scenarioB.result.totalProposed}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-gray-500">
                      {scenarioB.result.totalProposed -
                        scenarioA.result.totalProposed >
                      0
                        ? '+'
                        : ''}
                      {scenarioB.result.totalProposed -
                        scenarioA.result.totalProposed}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-3 text-gray-700">Relief Factor</td>
                    <td className="py-2 px-3 text-right">
                      {scenarioA.result.reliefFactor.toFixed(4)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {scenarioB.result.reliefFactor.toFixed(4)}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-500">
                      {(
                        scenarioB.result.reliefFactor -
                        scenarioA.result.reliefFactor
                      ).toFixed(4)}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-3 text-gray-700">CFS %</td>
                    <td className="py-2 px-3 text-right">
                      {Math.round(
                        scenarioA.assumptions.timeAllocation.respondingCFS * 100
                      )}
                      %
                    </td>
                    <td className="py-2 px-3 text-right">
                      {Math.round(
                        scenarioB.assumptions.timeAllocation.respondingCFS * 100
                      )}
                      %
                    </td>
                    <td className="py-2 px-3 text-right text-gray-500">
                      {Math.round(
                        (scenarioB.assumptions.timeAllocation.respondingCFS -
                          scenarioA.assumptions.timeAllocation.respondingCFS) *
                          100
                      )}
                      pp
                    </td>
                  </tr>
                  {scenarioA.result.districts.map((dA, i) => {
                    const dB = scenarioB.result.districts[i];
                    return (
                      <tr key={dA.district} className="border-b border-gray-100">
                        <td className="py-2 px-3 text-gray-700">
                          {dA.districtLabel}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {dA.totalProposed}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {dB.totalProposed}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-500">
                          {dB.totalProposed - dA.totalProposed > 0 ? '+' : ''}
                          {dB.totalProposed - dA.totalProposed}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
