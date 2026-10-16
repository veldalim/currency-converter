import React, { useState } from 'react';
import { HistoricalDataPoint, RegionId } from '../types/psi';
import { SINGAPORE_REGIONS } from '../constants/singaporeData';
import { TrendingUp } from 'lucide-react';

interface TrendChartProps {
  history: HistoricalDataPoint[];
  selectedRegion: RegionId;
}

export const TrendChart: React.FC<TrendChartProps> = ({ history, selectedRegion }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!history || history.length === 0) return null;

  const width = 800;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find max value to calibrate y-axis (minimum 120 so threshold lines are visible)
  const maxVal = Math.max(120, ...history.map((h) => {
    if (selectedRegion === 'national') return h.national;
    return (h as unknown as Record<string, number>)[selectedRegion] || h.national;
  }));

  const getY = (val: number) => {
    const clamped = Math.max(0, val);
    return padding.top + chartHeight - (clamped / maxVal) * chartHeight;
  };

  const getX = (index: number) => {
    return padding.left + (index / (history.length - 1)) * chartWidth;
  };

  // Generate SVG path for selected region
  const points = history.map((h, i) => {
    const val = selectedRegion === 'national' ? h.national : (h as unknown as Record<string, number>)[selectedRegion] || h.national;
    return `${getX(i)},${getY(val)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${getX(history.length - 1)},${padding.top + chartHeight} L ${getX(0)},${padding.top + chartHeight} Z`;

  // PM2.5 line
  const pm25Points = history.map((h, i) => `${getX(i)},${getY(h.pm25National)}`);
  const pm25PathD = `M ${pm25Points.join(' L ')}`;

  // Threshold lines
  const yGood = getY(50);
  const yModerate = getY(100);
  const yUnhealthy = getY(200);

  const activeHover = hoverIndex !== null ? history[hoverIndex] : history[history.length - 1];
  const activeVal = activeHover ? (selectedRegion === 'national' ? activeHover.national : (activeHover as unknown as Record<string, number>)[selectedRegion] || activeHover.national) : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">24-Hour PSI Trend</h3>
          <span className="text-xs text-slate-500">· {SINGAPORE_REGIONS[selectedRegion].name}</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-900" />
            <span className="text-slate-700 font-medium">24-hr PSI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-sky-500" />
            <span className="text-slate-700 font-medium">1-hr PM2.5</span>
          </div>
          {activeHover && (
            <div className="text-xs font-mono tabular-nums text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
              {activeHover.hour}: <strong className="text-slate-900">{activeVal} PSI</strong> / {activeHover.pm25National} PM2.5
            </div>
          )}
        </div>
      </div>

      <div className="p-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[500px]"
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Threshold horizontal guides */}
          {/* 50 Good/Moderate line */}
          <line
            x1={padding.left}
            y1={yGood}
            x2={width - padding.right}
            y2={yGood}
            stroke="#10b981"
            strokeDasharray="4 4"
            strokeWidth="1"
            opacity="0.6"
          />
          <text
            x={width - padding.right + 4}
            y={yGood + 3}
            fill="#059669"
            fontSize="9"
            fontFamily="JetBrains Mono"
          >
            50
          </text>

          {/* 100 Moderate/Unhealthy line */}
          <line
            x1={padding.left}
            y1={yModerate}
            x2={width - padding.right}
            y2={yModerate}
            stroke="#d97706"
            strokeDasharray="4 4"
            strokeWidth="1"
            opacity="0.7"
          />
          <text
            x={width - padding.right + 4}
            y={yModerate + 3}
            fill="#d97706"
            fontSize="9"
            fontFamily="JetBrains Mono"
            fontWeight="bold"
          >
            100 (Alert)
          </text>

          {/* 200 Very Unhealthy line if within range */}
          {maxVal >= 200 && (
            <>
              <line
                x1={padding.left}
                y1={yUnhealthy}
                x2={width - padding.right}
                y2={yUnhealthy}
                stroke="#dc2626"
                strokeDasharray="4 4"
                strokeWidth="1"
                opacity="0.8"
              />
              <text
                x={width - padding.right + 4}
                y={yUnhealthy + 3}
                fill="#dc2626"
                fontSize="9"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                200
              </text>
            </>
          )}

          {/* Gradient for area fill */}
          <defs>
            <linearGradient id="trend-psi-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Shaded Area */}
          <path d={areaD} fill="url(#trend-psi-gradient)" />

          {/* PM2.5 line */}
          <path
            d={pm25PathD}
            fill="none"
            stroke="#0284c7"
            strokeWidth="1.75"
            strokeDasharray="2 2"
          />

          {/* Primary PSI Path */}
          <path
            d={pathD}
            fill="none"
            stroke="#0f172a"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Scrubbing Columns */}
          {history.map((h, i) => {
            const x = getX(i);
            const val = selectedRegion === 'national' ? h.national : (h as unknown as Record<string, number>)[selectedRegion] || h.national;
            const y = getY(val);
            const isHovered = hoverIndex === i;

            return (
              <g
                key={h.timestamp}
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
              >
                <rect
                  x={x - chartWidth / (history.length * 2)}
                  y={padding.top}
                  width={chartWidth / history.length}
                  height={chartHeight}
                  fill="transparent"
                />

                {isHovered && (
                  <>
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={padding.top + chartHeight}
                      stroke="#64748b"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <circle cx={x} cy={y} r="5" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
                    <circle cx={x} cy={getY(h.pm25National)} r="4" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                  </>
                )}

                {/* X axis labels every 4 hours */}
                {i % 4 === 0 && (
                  <text
                    x={x}
                    y={height - 12}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="JetBrains Mono"
                  >
                    {h.hour}
                  </text>
                )}
              </g>
            );
          })}

          {/* Y Axis Labels */}
          <text
            x={padding.left - 8}
            y={padding.top + 10}
            textAnchor="end"
            fill="#64748b"
            fontSize="10"
            fontFamily="JetBrains Mono"
          >
            {Math.round(maxVal)}
          </text>
          <text
            x={padding.left - 8}
            y={padding.top + chartHeight}
            textAnchor="end"
            fill="#64748b"
            fontSize="10"
            fontFamily="JetBrains Mono"
          >
            0
          </text>
        </svg>
      </div>
    </div>
  );
};
