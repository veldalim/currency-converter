import React from 'react';
import { Bell, BellRing } from 'lucide-react';

interface TopBarProps {
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  pushEnabled: boolean;
  unreadAlertCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSettings,
  onOpenHistory,
  pushEnabled,
  unreadAlertCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark */}
        <a
          href="/"
          className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
          <span>BreezeSG</span>
        </a>

        {/* Zone 2: 4-5 Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a href="#interactive-map" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Live Map
          </a>
          <a href="#health-advisory" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Health Advisory
          </a>
          <a href="#trend-analysis" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            24h Trends
          </a>
          <a href="#pollutant-data" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Pollutants
          </a>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenHistory}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
            title="Alert history log"
          >
            <BellRing className="w-4 h-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                {unreadAlertCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenSettings}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Alert Preferences</span>
          </button>
        </div>
      </div>
    </header>
  );
};
