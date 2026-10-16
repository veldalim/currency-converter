import React from 'react';
import { RegionId, RegionalReading } from '../types/psi';
import { SINGAPORE_REGIONS, getPsiBand, getPM25Band } from '../constants/singaporeData';
import { MapPin, ChevronRight, Wind } from 'lucide-react';

interface RegionalGridProps {
  readings: Record<RegionId, RegionalReading>;
  selectedRegion: RegionId;
  onSelectRegion: (region: RegionId) => void;
  activeMetric: 'psi' | 'pm25';
}

export const RegionalGrid: React.FC<RegionalGridProps> = ({
  readings,
  selectedRegion,
  onSelectRegion,
  activeMetric,
}) => {
  const regions: RegionId[] = ['north', 'south', 'east', 'west', 'central'];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">Regional Stations Overview</h3>
        </div>
        <span className="text-xs text-slate-500">Click station to isolate data</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {regions.map((regId) => {
          const regMeta = SINGAPORE_REGIONS[regId];
          const reading = readings[regId];
          if (!reading) return null;

          const psiBand = getPsiBand(reading.psi24h);
          const pm25Band = getPM25Band(reading.pm25_1h);
          const isSelected = selectedRegion === regId;
          const isUnhealthy = reading.psi24h >= 101;

          return (
            <div
              key={regId}
              onClick={() => onSelectRegion(regId)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-slate-900 bg-white ring-2 ring-slate-900/10 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <span>{regMeta.shortLabel}</span>
                    {isSelected && <span className="text-[10px] text-slate-400 font-normal">Active</span>}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate max-w-[120px]">
                    {regMeta.keyNeighborhoods[0]}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    activeMetric === 'psi' ? psiBand.badgeBg : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {activeMetric === 'psi' ? psiBand.label : pm25Band.label}
                </span>
              </div>

              {/* Primary Value Display */}
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <div className="text-2xl font-black font-mono tabular-nums text-slate-900">
                    {activeMetric === 'psi' ? reading.psi24h : reading.pm25_1h}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {activeMetric === 'psi' ? '24h PSI' : '1h PM2.5 (µg)'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono tabular-nums text-slate-500">
                    {activeMetric === 'psi' ? `${reading.pm25_1h} µg` : `${reading.psi24h} PSI`}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {activeMetric === 'psi' ? '1h PM2.5' : '24h PSI'}
                  </div>
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    backgroundColor: psiBand.colorHex,
                    width: `${Math.min(100, Math.max(8, (reading.psi24h / 200) * 100))}%`,
                  }}
                />
              </div>

              {/* Key neighborhoods ticker */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span className="truncate">{regMeta.keyNeighborhoods.slice(0, 2).join(', ')}</span>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
