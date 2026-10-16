import React from 'react';
import { AirAlert } from '../types/psi';
import { AlertTriangle, X, ShieldAlert, Bell } from 'lucide-react';

interface AlertBannerProps {
  alerts: AirAlert[];
  onDismiss: (id: string) => void;
  onOpenSettings: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onDismiss, onOpenSettings }) => {
  const unreadAlerts = alerts.filter((a) => !a.read);
  if (unreadAlerts.length === 0) return null;

  const latestAlert = unreadAlerts[0];
  const isSevere = latestAlert.value >= 200;

  return (
    <div
      className={`border-b transition-colors px-4 py-3 sm:px-6 ${
        isSevere
          ? 'bg-rose-950 text-rose-50 border-rose-800'
          : 'bg-amber-950 text-amber-50 border-amber-800'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
              isSevere ? 'bg-rose-900 text-rose-200' : 'bg-amber-900 text-amber-200'
            }`}
          >
            {isSevere ? <ShieldAlert className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isSevere ? 'Severe Air Quality Alert' : 'Unhealthy Threshold Exceeded'}
              </span>
              <span className="text-xs opacity-75">· {latestAlert.regionName}</span>
            </div>
            <p className="text-xs sm:text-sm mt-0.5 font-medium opacity-90 leading-snug">
              {latestAlert.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            onClick={onOpenSettings}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1"
          >
            <Bell className="w-3 h-3" />
            <span>Preferences</span>
          </button>
          <button
            onClick={() => onDismiss(latestAlert.id)}
            className="p-1 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
