import React from 'react';
import { RegionalReading } from '../types/psi';
import { getPsiBand, getPM25Band } from '../constants/singaporeData';
import { Bell, RefreshCw, Radio } from 'lucide-react';

interface HeroSectionProps {
  nationalReading: RegionalReading;
  timestamp: string;
  updateTimestamp: string;
  isLiveApi: boolean;
  isSimulated: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
  pushEnabled: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  nationalReading,
  timestamp,
  updateTimestamp,
  isLiveApi,
  isSimulated,
  onRefresh,
  onOpenSettings,
  pushEnabled,
}) => {
  const psiBand = getPsiBand(nationalReading.psi24h);
  const pm25Band = getPM25Band(nationalReading.pm25_1h);

  const formattedTime = new Date(timestamp).toLocaleTimeString('en-SG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <section className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top metadata kicker */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-2">
            <span>Singapore Islandwide Telemetry</span>
            <span aria-hidden="true">·</span>
            <span>Refreshed {formattedTime}</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-slate-700">
              {isSimulated ? 'Simulation Mode' : isLiveApi ? 'Official NEA / data.gov.sg' : 'Standard Baseline'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
              title="Refresh readings"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Feed</span>
            </button>
          </div>
        </div>

        {/* Hero Split */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 text-balance">
              Singapore Live PSI &amp; Air Quality Tracker
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
              Real-time monitoring across 5 regional NEA stations with automated push alerts when air quality crosses unhealthy thresholds.
            </p>
          </div>

          {/* National Snapshot KPI Cards */}
          <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-4 shrink-0">
            {/* 24-hr PSI Primary KPI */}
            <div className="flex-1 sm:w-48 p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold uppercase tracking-wider">24-Hr PSI</span>
                <span className={`text-[11px] font-semibold ${psiBand.badgeText}`}>
                  {psiBand.label}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-4xl font-black font-mono tabular-nums"
                  style={{ color: psiBand.colorHex }}
                >
                  {nationalReading.psi24h}
                </span>
                <span className="text-xs text-slate-400 font-medium">Index</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                {nationalReading.psi24h <= 100 ? 'Within safe parameters' : 'Threshold exceeded'}
              </div>
            </div>

            {/* 1-hr PM2.5 KPI */}
            <div className="flex-1 sm:w-48 p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold uppercase tracking-wider">1-Hr PM2.5</span>
                <span className="text-[11px] font-semibold text-sky-700">
                  {pm25Band.label.split(' ')[1] || 'Normal'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black font-mono tabular-nums text-slate-900">
                  {nationalReading.pm25_1h}
                </span>
                <span className="text-xs text-slate-400 font-medium">µg/m³</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                Hourly exposure indicator
              </div>
            </div>

            {/* Notification Status Button */}
            <div className="w-full sm:w-auto flex flex-col justify-between p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                <Radio className={`w-3.5 h-3.5 ${pushEnabled ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="font-semibold text-slate-700">Push Monitor</span>
              </div>
              <div className="text-xs text-slate-600">
                {pushEnabled ? (
                  <span className="text-emerald-700 font-semibold">Active · Background check</span>
                ) : (
                  <span className="text-slate-500">Inactive</span>
                )}
              </div>
              <button
                onClick={onOpenSettings}
                className="mt-3 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>{pushEnabled ? 'Configure' : 'Enable Alerts'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
