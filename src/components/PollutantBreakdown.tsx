import React from 'react';
import { RegionalReading } from '../types/psi';
import { Gauge } from 'lucide-react';

interface PollutantBreakdownProps {
  reading: RegionalReading;
}

export const PollutantBreakdown: React.FC<PollutantBreakdownProps> = ({ reading }) => {
  const metrics = [
    {
      code: 'PM2.5 (1-hr)',
      name: 'Fine Particulates',
      value: `${reading.pm25_1h} µg/m³`,
      limit: '55 µg/m³ standard',
      percent: Math.min(100, Math.round((reading.pm25_1h / 150) * 100)),
      status: reading.pm25_1h > 150 ? 'danger' : reading.pm25_1h > 55 ? 'warning' : 'nominal',
      desc: 'Combustion soot, transboundary haze smoke',
    },
    {
      code: 'PM2.5 (24-hr)',
      name: 'Fine Dust 24h Mean',
      value: `${reading.pm25_24h} µg/m³`,
      limit: '35 µg/m³ target',
      percent: Math.min(100, Math.round((reading.pm25_24h / 100) * 100)),
      status: reading.pm25_24h > 75 ? 'danger' : reading.pm25_24h > 35 ? 'warning' : 'nominal',
      desc: '24-hour moving average fine particulate',
    },
    {
      code: 'PM10 (24-hr)',
      name: 'Coarse Particles',
      value: `${reading.pm10_24h} µg/m³`,
      limit: '150 µg/m³',
      percent: Math.min(100, Math.round((reading.pm10_24h / 200) * 100)),
      status: reading.pm10_24h > 150 ? 'warning' : 'nominal',
      desc: 'Construction dust, road spray, pollen',
    },
    {
      code: 'Ozone (8-hr)',
      name: 'O3 Sub-index',
      value: `${reading.o3_8h} µg/m³`,
      limit: '100 µg/m³',
      percent: Math.min(100, Math.round((reading.o3_8h / 160) * 100)),
      status: reading.o3_8h > 100 ? 'warning' : 'nominal',
      desc: 'Formed via sunlight and vehicle emissions',
    },
    {
      code: 'NO2 (1-hr)',
      name: 'Nitrogen Dioxide',
      value: `${reading.no2_1h} µg/m³`,
      limit: '200 µg/m³',
      percent: Math.min(100, Math.round((reading.no2_1h / 200) * 100)),
      status: reading.no2_1h > 120 ? 'warning' : 'nominal',
      desc: 'Traffic, thermal power generation',
    },
    {
      code: 'SO2 (24-hr)',
      name: 'Sulphur Dioxide',
      value: `${reading.so2_24h} µg/m³`,
      limit: '50 µg/m³',
      percent: Math.min(100, Math.round((reading.so2_24h / 100) * 100)),
      status: reading.so2_24h > 50 ? 'warning' : 'nominal',
      desc: 'Refineries, shipping corridor bunker fuel',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">Sub-Indices Breakdown</h3>
          <span className="text-xs text-slate-500">· {reading.name}</span>
        </div>
        <span className="text-xs font-mono tabular-nums text-slate-500">
          6 Chemical Precursors
        </span>
      </div>

      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div key={m.code} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/40">
            <div className="flex items-start justify-between mb-1.5">
              <div>
                <div className="text-xs font-bold text-slate-800">{m.code}</div>
                <div className="text-[11px] text-slate-500">{m.name}</div>
              </div>
              <span className="text-sm font-bold font-mono tabular-nums text-slate-900">
                {m.value}
              </span>
            </div>

            {/* Gauge Progress Bar */}
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden my-2">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  m.status === 'danger'
                    ? 'bg-rose-600'
                    : m.status === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.max(8, m.percent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span className="truncate max-w-[140px]">{m.desc}</span>
              <span className="font-mono">{m.limit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
