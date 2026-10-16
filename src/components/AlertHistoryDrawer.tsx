import React from 'react';
import { AirAlert } from '../types/psi';
import { X, Clock, Trash2, BellRing, AlertTriangle } from 'lucide-react';

interface AlertHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AirAlert[];
  onClearHistory: () => void;
}

export const AlertHistoryDrawer: React.FC<AlertHistoryDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-slate-700" />
            <h3 className="text-base font-bold text-slate-900">Alert History Log</h3>
            <span className="text-xs text-slate-500">({alerts.length})</span>
          </div>

          <div className="flex items-center gap-1">
            {alerts.length > 0 && (
              <button
                onClick={onClearHistory}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Clear all alerts"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-slate-600">No air quality alerts recorded</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Alerts will be logged here whenever PSI or PM2.5 crosses your configured threshold.
              </p>
            </div>
          ) : (
            alerts.map((alert) => {
              const dateStr = new Date(alert.timestamp).toLocaleTimeString('en-SG', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
              });

              const isUnhealthy = alert.value >= 101;

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-lg border transition-colors ${
                    isUnhealthy ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle
                        className={`w-3.5 h-3.5 ${isUnhealthy ? 'text-amber-600' : 'text-slate-500'}`}
                      />
                      <span className="text-xs font-bold text-slate-900">{alert.regionName}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                      {dateStr}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span className="text-sm font-extrabold font-mono tabular-nums text-slate-900">
                      {alert.value} {alert.metric}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      (Threshold: {alert.threshold})
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{alert.message}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Storage: Browser Local Storage</span>
          <span>Max 50 events</span>
        </div>
      </div>
    </div>
  );
};
