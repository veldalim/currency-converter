import React from 'react';
import { RegionalReading } from '../types/psi';
import { getPsiBand, getPM25Band } from '../constants/singaporeData';
import { ShieldAlert, Heart, Activity, CheckCircle2, AlertTriangle, XCircle, Wind } from 'lucide-react';

interface HealthAdvisoryCardProps {
  reading: RegionalReading;
  activeMetric: 'psi' | 'pm25';
}

export const HealthAdvisoryCard: React.FC<HealthAdvisoryCardProps> = ({
  reading,
  activeMetric,
}) => {
  const psiBand = getPsiBand(reading.psi24h);
  const pm25Band = getPM25Band(reading.pm25_1h);
  const isElevated = reading.psi24h > 100 || reading.pm25_1h > 55;
  const isSevere = reading.psi24h > 200 || reading.pm25_1h > 150;

  // Outdoor activity recommendations based on Singapore NEA guidelines
  const activities = [
    {
      title: 'Strenuous Outdoor Exercise',
      subtitle: 'Running, football, cycling',
      status: isSevere ? 'danger' : isElevated ? 'warning' : 'safe',
      healthyAdvice: isSevere
        ? 'Avoid strenuous outdoor activities'
        : isElevated
        ? 'Reduce prolonged or strenuous exertion'
        : 'Normal outdoor activities',
      vulnerableAdvice: isElevated ? 'Avoid outdoor exertion' : 'Normal activities',
    },
    {
      title: 'Casual Outdoor Walking',
      subtitle: 'Commuting, errands, park walks',
      status: isSevere ? 'warning' : 'safe',
      healthyAdvice: isSevere ? 'Minimize prolonged exposure' : 'Normal activity',
      vulnerableAdvice: isSevere ? 'Stay indoors' : isElevated ? 'Reduce prolonged walking' : 'Normal activity',
    },
    {
      title: 'Schools & Child Outdoor Play',
      subtitle: 'Physical education, playground',
      status: isSevere ? 'danger' : isElevated ? 'warning' : 'safe',
      healthyAdvice: isSevere ? 'Move activities indoors' : isElevated ? 'Reduce intensity and duration' : 'Normal PE schedule',
      vulnerableAdvice: isElevated ? 'Exempt from outdoor play' : 'Normal monitoring',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">NEA Health Advisory</h3>
          <span className="text-xs text-slate-500">· {reading.name}</span>
        </div>
        <span
          className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${psiBand.badgeBg}`}
        >
          {psiBand.label} ({reading.psi24h} PSI)
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Primary Health Action Callout */}
        <div
          className={`p-4 rounded-lg border transition-colors ${
            isSevere
              ? 'bg-rose-50/70 border-rose-200 text-rose-950'
              : isElevated
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex items-start gap-3">
            {isSevere ? (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : isElevated ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
                {isSevere ? 'Severe Air Quality Advisory' : isElevated ? 'Unhealthy Air Threshold' : 'Nominal Air Conditions'}
              </p>
              <p className="text-sm font-semibold leading-relaxed">
                {psiBand.healthAction}
              </p>
              <p className="text-xs mt-1.5 opacity-85">
                {psiBand.description} 1-Hour PM2.5 is currently{' '}
                <span className="font-mono font-bold tabular-nums">{reading.pm25_1h} µg/m³</span> ({pm25Band.label}).
              </p>
            </div>
          </div>
        </div>

        {/* Audience Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Healthy Individuals */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-2.5">
              <Activity className="w-4 h-4 text-slate-700" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Healthy Population</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {reading.psi24h > 200
                ? 'Avoid prolonged or strenuous outdoor exertion. Keep windows closed and stay in air-conditioned or filtered rooms.'
                : reading.psi24h > 100
                ? 'Reduce prolonged or heavy outdoor workouts. Switch high-intensity runs to indoor treadmills or gyms.'
                : 'Free to participate in all outdoor physical activities and sports without restriction.'}
            </p>
          </div>

          {/* Vulnerable Groups */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-2.5">
              <Heart className="w-4 h-4 text-rose-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Elderly, Pregnant &amp; Children
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {reading.psi24h > 100
                ? 'Minimize all outdoor exertion. Persons with asthma, COPD, or heart disease should ensure fast-relief inhalers are accessible.'
                : 'Air quality poses no immediate risk. Continue regular routines.'}
            </p>
          </div>
        </div>

        {/* Activity Planner Table */}
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            Activity Guidance Matrix
          </div>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
            {activities.map((act) => (
              <div key={act.title} className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-900">{act.title}</div>
                  <div className="text-[11px] text-slate-500">{act.subtitle}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-slate-700 font-medium">{act.healthyAdvice}</span>
                  </div>
                  <div className="shrink-0">
                    {act.status === 'safe' && (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Permitted
                      </span>
                    )}
                    {act.status === 'warning' && (
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Reduce
                      </span>
                    )}
                    {act.status === 'danger' && (
                      <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Avoid
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Protection Checklist */}
        <div className="pt-1 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
            <span>N95 Respirator:</span>
            <span className="font-semibold text-slate-900">
              {psiBand.maskRecommended ? 'Recommended Outdoors' : 'Not Required'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-slate-500" />
            <span>Air Purifier (HEPA):</span>
            <span className="font-semibold text-slate-900">
              {reading.psi24h > 100 ? 'Run Indoors' : 'Optional'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
