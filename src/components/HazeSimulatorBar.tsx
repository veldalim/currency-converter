import React from 'react';
import { PRESET_SCENARIOS } from '../constants/singaporeData';
import { Sliders, RefreshCw, Bell, AlertTriangle } from 'lucide-react';

interface HazeSimulatorBarProps {
  isSimulated: boolean;
  isLiveApi: boolean;
  activeScenarioId?: string;
  customPsi: number;
  onSelectScenario: (scenarioId: string) => void;
  onChangeCustomPsi: (psi: number) => void;
  onResetToLive: () => void;
  onTriggerTestAlert: () => void;
}

export const HazeSimulatorBar: React.FC<HazeSimulatorBarProps> = ({
  isSimulated,
  isLiveApi,
  activeScenarioId,
  customPsi,
  onSelectScenario,
  onChangeCustomPsi,
  onResetToLive,
  onTriggerTestAlert,
}) => {
  return (
    <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-sm border border-slate-800">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg text-amber-400 shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight">Haze &amp; Alert Threshold Simulator</span>
              {isSimulated ? (
                <span className="text-[11px] font-semibold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  Simulation Active
                </span>
              ) : isLiveApi ? (
                <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  Live NEA Singapore Feed
                </span>
              ) : (
                <span className="text-[11px] font-semibold bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                  Baseline Mode
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate transboundary haze events to test real browser push notifications and automated threshold triggers.
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onTriggerTestAlert}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors whitespace-nowrap"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Send Test Push Alert</span>
          </button>

          {isSimulated && (
            <button
              onClick={onResetToLive}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition-colors whitespace-nowrap border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Live Feed</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset Scenarios Grid */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {PRESET_SCENARIOS.map((scenario) => {
          const isSelected = activeScenarioId === scenario.id;
          const isUnhealthy = scenario.nationalPsi > 100;

          return (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario.id)}
              className={`p-2.5 rounded-lg text-left transition-all border ${
                isSelected
                  ? 'bg-slate-800 border-amber-400 ring-1 ring-amber-400/40 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/70 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold truncate">{scenario.name}</span>
                {isUnhealthy && (
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 ml-1" />
                )}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-base font-bold tabular-nums text-amber-300">
                  {scenario.nationalPsi}
                </span>
                <span className="text-[10px] text-slate-400">PSI (24h)</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom PSI Range Slider */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="font-medium">Direct National PSI Slider:</span>
          <span className="font-mono font-bold tabular-nums text-amber-400 text-sm">
            {customPsi} PSI
          </span>
          <span className="text-[11px] text-slate-400">
            {customPsi <= 50
              ? '(Good)'
              : customPsi <= 100
              ? '(Moderate)'
              : customPsi <= 200
              ? '(Unhealthy - Alert Triggered)'
              : customPsi <= 300
              ? '(Very Unhealthy)'
              : '(Hazardous)'}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-64">
          <span className="text-[10px] text-slate-500 font-mono">20</span>
          <input
            type="range"
            min="20"
            max="380"
            step="2"
            value={customPsi}
            onChange={(e) => onChangeCustomPsi(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <span className="text-[10px] text-slate-500 font-mono">380</span>
        </div>
      </div>
    </div>
  );
};
