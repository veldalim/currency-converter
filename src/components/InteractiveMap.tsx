import React, { useState } from 'react';
import { RegionId, RegionalReading } from '../types/psi';
import { getPsiBand, getPM25Band, SINGAPORE_REGIONS } from '../constants/singaporeData';
import { Compass, Eye, Wind, Layers } from 'lucide-react';

interface InteractiveMapProps {
  readings: Record<RegionId, RegionalReading>;
  selectedRegion: RegionId;
  onSelectRegion: (region: RegionId) => void;
  activeMetric: 'psi' | 'pm25';
  onChangeMetric: (metric: 'psi' | 'pm25') => void;
  windDirection: string;
  windSpeedKmh: number;
}

// Handcrafted SVG paths matching the geographic bounds of the 5 Singapore NEA regions
// ViewBox is 0 0 920 540
const REGION_SVG_PATHS: Record<Exclude<RegionId, 'national'>, { d: string; name: string; labelPos: { x: number; y: number } }> = {
  north: {
    name: 'North Region',
    labelPos: { x: 470, y: 135 },
    // Woodlands, Sembawang, Yishun, Mandai down to Upper Thomson border
    d: `M 320,130
        C 335,115 370,100 410,95
        C 435,90 470,88 510,92
        C 545,95 575,108 595,125
        C 610,138 615,152 605,168
        C 590,190 560,195 530,195
        C 500,195 470,215 450,215
        C 420,215 390,205 375,195
        C 355,180 330,165 320,130 Z`,
  },
  west: {
    name: 'West Region',
    labelPos: { x: 250, y: 260 },
    // Tuas, Jurong West, Jurong East, Bukit Batok, Choa Chu Kang, Lim Chu Kang
    d: `M 320,130
        C 330,165 355,180 375,195
        C 390,205 400,225 390,250
        C 380,275 365,305 345,335
        C 330,358 310,380 270,390
        C 230,400 185,395 150,380
        C 120,365 95,340 85,305
        C 75,270 90,230 120,195
        C 150,160 190,140 235,130
        C 275,120 305,120 320,130 Z`,
  },
  central: {
    name: 'Central Region',
    labelPos: { x: 475, y: 245 },
    // Bishan, Ang Mo Kio, Toa Payoh, Novena, Bukit Timah, Tanglin
    d: `M 450,215
        C 470,215 500,195 530,195
        C 560,195 575,215 570,240
        C 565,265 555,290 540,310
        C 525,328 505,335 480,335
        C 455,335 435,325 420,310
        C 405,295 385,275 390,250
        C 400,225 420,215 450,215 Z`,
  },
  east: {
    name: 'East Region',
    labelPos: { x: 675, y: 235 },
    // Tampines, Bedok, Pasir Ris, Changi Airport, Marine Parade East
    d: `M 595,125
        C 625,115 675,120 720,135
        C 760,150 805,175 830,210
        C 845,230 840,255 815,280
        C 785,310 740,325 690,325
        C 645,325 605,320 580,305
        C 565,295 555,275 570,240
        C 575,215 560,195 590,190
        C 605,168 610,138 595,125 Z`,
  },
  south: {
    name: 'South Region',
    labelPos: { x: 485, y: 360 },
    // Marina Bay, Tanjong Pagar, Telok Blangah, Queenstown, Harbourfront
    d: `M 420,310
        C 435,325 455,335 480,335
        C 505,335 525,328 540,310
        C 555,290 565,295 580,305
        C 605,320 645,325 690,325
        C 650,355 600,375 550,385
        C 500,395 450,395 400,385
        C 360,375 340,355 345,335
        C 365,305 405,295 420,310 Z`,
  },
};

// Offshore islands
const ISLANDS = [
  { id: 'sentosa', name: 'Sentosa', d: 'M 445,415 C 470,410 495,415 515,425 C 500,435 470,440 450,430 Z', region: 'south' as const },
  { id: 'jurong_island', name: 'Jurong Island', d: 'M 255,420 C 290,415 315,425 330,440 C 310,465 270,465 245,445 Z', region: 'west' as const },
  { id: 'pulau_ubin', name: 'Pulau Ubin', d: 'M 715,100 C 740,95 765,102 780,112 C 765,122 735,120 720,112 Z', region: 'east' as const },
  { id: 'pulau_tekong', name: 'Pulau Tekong', d: 'M 805,115 C 835,110 860,125 870,145 C 850,160 820,155 800,135 Z', region: 'east' as const },
];

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  readings,
  selectedRegion,
  onSelectRegion,
  activeMetric,
  onChangeMetric,
  windDirection,
  windSpeedKmh,
}) => {
  const [hoveredRegion, setHoveredRegion] = useState<RegionId | null>(null);
  const [showWind, setShowWind] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showStations, setShowStations] = useState(true);

  const getRegionValue = (regId: RegionId) => {
    const r = readings[regId];
    if (!r) return 0;
    return activeMetric === 'psi' ? r.psi24h : r.pm25_1h;
  };

  const getRegionBandColor = (regId: RegionId) => {
    const val = getRegionValue(regId);
    if (activeMetric === 'psi') {
      return getPsiBand(val).colorHex;
    }
    return getPM25Band(val).colorHex;
  };

  const getFillOpacity = (regId: RegionId) => {
    if (!showHeatmap) return 0.15;
    const isSelected = selectedRegion === regId;
    const isHovered = hoveredRegion === regId;
    if (isSelected) return 0.72;
    if (isHovered) return 0.62;
    return 0.45;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Top Map Toolbar */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Layers className="w-4 h-4 text-slate-600" />
            <span className="text-slate-800 font-semibold">Singapore Air Basin</span>
            <span aria-hidden="true">·</span>
            <span>5 NEA Monitoring Stations</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => onChangeMetric('psi')}
              className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                activeMetric === 'psi' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              24-Hour PSI
            </button>
            <button
              onClick={() => onChangeMetric('pm25')}
              className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                activeMetric === 'pm25' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1-Hour PM2.5
            </button>
          </div>
        </div>

        {/* Layer Toggles & Wind Marker */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-700">
            <Compass className="w-3.5 h-3.5 text-sky-600" />
            <span>Wind {windDirection}</span>
            <span className="font-mono tabular-nums text-slate-500">{windSpeedKmh} km/h</span>
          </div>

          <button
            onClick={() => setShowWind(!showWind)}
            className={`flex items-center gap-1 px-2.5 py-1 border rounded-md font-medium transition-colors ${
              showWind ? 'bg-sky-50 border-sky-200 text-sky-800' : 'bg-white border-slate-200 text-slate-600'
            }`}
            title="Toggle wind flow vectors"
          >
            <Wind className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Vectors</span>
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1 px-2.5 py-1 border rounded-md font-medium transition-colors ${
              showHeatmap ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600'
            }`}
            title="Toggle air quality choropleth overlay"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Heatmap</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full aspect-16/10 sm:aspect-16/9 bg-gradient-to-b from-sky-50/40 via-slate-50/50 to-blue-50/30 overflow-hidden">
        {/* Subtle Waterway Coastlines & Straits Labels */}
        <div className="absolute top-3 left-4 text-[11px] text-slate-400 font-medium tracking-wide uppercase pointer-events-none select-none">
          Straits of Johor
        </div>
        <div className="absolute bottom-3 right-6 text-[11px] text-slate-400 font-medium tracking-wide uppercase pointer-events-none select-none">
          Singapore Strait
        </div>

        <svg
          viewBox="0 0 920 540"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients and Filters */}
            <filter id="map-drop-shadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="3" stdDeviation="6" floodOpacity="0.1" />
            </filter>
            <pattern id="grid-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.8" fill="#cbd5e1" opacity="0.4" />
            </pattern>
            {/* Wind Vector Arrow Marker */}
            <marker id="wind-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#0284c7" opacity="0.6" />
            </marker>
          </defs>

          {/* Background grid */}
          <rect width="100%" height="100%" fill="url(#grid-dots)" />

          {/* Johor / Malaysia northern coastline indication */}
          <path
            d="M 120,60 Q 300,40 500,35 Q 700,30 890,50"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Mainland Singapore Regions */}
          <g filter="url(#map-drop-shadow)">
            {(['north', 'west', 'central', 'east', 'south'] as Array<Exclude<RegionId, 'national'>>).map((regionKey) => {
              const regData = REGION_SVG_PATHS[regionKey];
              const isSelected = selectedRegion === regionKey;
              const isHovered = hoveredRegion === regionKey;
              const color = getRegionBandColor(regionKey);
              const opacity = getFillOpacity(regionKey);
              const val = getRegionValue(regionKey);

              return (
                <g key={regionKey} className="transition-transform duration-200">
                  <path
                    d={regData.d}
                    fill={color}
                    fillOpacity={opacity}
                    stroke={isSelected ? '#0f172a' : isHovered ? '#334155' : '#ffffff'}
                    strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 1.75}
                    className="cursor-pointer transition-all duration-200 hover:brightness-105"
                    onClick={() => onSelectRegion(regionKey)}
                    onMouseEnter={() => setHoveredRegion(regionKey)}
                    onMouseLeave={() => setHoveredRegion(null)}
                  >
                    <title>{`${regData.name}: ${activeMetric.toUpperCase()} ${val}`}</title>
                  </path>
                </g>
              );
            })}
          </g>

          {/* Offshore Islands */}
          <g>
            {ISLANDS.map((island) => {
              const color = getRegionBandColor(island.region);
              return (
                <path
                  key={island.id}
                  d={island.d}
                  fill={color}
                  fillOpacity={0.65}
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  className="cursor-pointer hover:opacity-100 transition-opacity"
                  onClick={() => onSelectRegion(island.region)}
                >
                  <title>{`${island.name} (${island.region.toUpperCase()})`}</title>
                </path>
              );
            })}
          </g>

          {/* Wind Stream Lines (Animated vectors across Singapore basin) */}
          {showWind && (
            <g className="pointer-events-none opacity-60">
              <path
                d="M 180,470 C 230,370 290,270 360,170"
                fill="none"
                stroke="#0284c7"
                strokeWidth="1.5"
                strokeDasharray="8 6"
                markerEnd="url(#wind-arrow)"
                className="animate-pulse"
              />
              <path
                d="M 330,480 C 380,380 440,290 510,180"
                fill="none"
                stroke="#0284c7"
                strokeWidth="1.5"
                strokeDasharray="8 6"
                markerEnd="url(#wind-arrow)"
                className="animate-pulse"
              />
              <path
                d="M 480,480 C 530,390 600,300 680,200"
                fill="none"
                stroke="#0284c7"
                strokeWidth="1.5"
                strokeDasharray="8 6"
                markerEnd="url(#wind-arrow)"
                className="animate-pulse"
              />
              <path
                d="M 640,460 C 690,380 750,300 810,210"
                fill="none"
                stroke="#0284c7"
                strokeWidth="1.5"
                strokeDasharray="8 6"
                markerEnd="url(#wind-arrow)"
                className="animate-pulse"
              />
            </g>
          )}

          {/* Station Pins & Reading Badges */}
          {showStations &&
            (['north', 'west', 'central', 'east', 'south'] as Array<Exclude<RegionId, 'national'>>).map((regionKey) => {
              const regMeta = SINGAPORE_REGIONS[regionKey];
              const regData = REGION_SVG_PATHS[regionKey];
              const val = getRegionValue(regionKey);
              const band = activeMetric === 'psi' ? getPsiBand(val) : getPM25Band(val);
              const isSelected = selectedRegion === regionKey;
              const isUnhealthy = val >= (activeMetric === 'psi' ? 101 : 56);

              const px = regData.labelPos.x;
              const py = regData.labelPos.y;

              return (
                <g
                  key={`pin-${regionKey}`}
                  transform={`translate(${px}, ${py})`}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRegion(regionKey);
                  }}
                  onMouseEnter={() => setHoveredRegion(regionKey)}
                  onMouseLeave={() => setHoveredRegion(null)}
                >
                  {/* Alert pulse ripple if unhealthy */}
                  {isUnhealthy && (
                    <circle cx="0" cy="0" r="26" fill={band.colorHex} fillOpacity="0.25">
                      <animate attributeName="r" values="18;34;18" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Station Marker Card */}
                  <rect
                    x="-55"
                    y="-28"
                    width="110"
                    height="56"
                    rx="8"
                    fill="#ffffff"
                    stroke={isSelected ? '#0f172a' : band.colorHex}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    filter="url(#map-drop-shadow)"
                    className="transition-transform group-hover:scale-105"
                  />

                  {/* Region name label */}
                  <text
                    x="0"
                    y="-12"
                    textAnchor="middle"
                    fill="#475569"
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                    className="select-none"
                  >
                    {regMeta.shortLabel}
                  </text>

                  {/* Large Value */}
                  <text
                    x="0"
                    y="11"
                    textAnchor="middle"
                    fill={band.colorHex}
                    fontSize="19"
                    fontWeight="800"
                    fontFamily="JetBrains Mono, monospace"
                    className="tabular-nums select-none"
                  >
                    {val}
                  </text>

                  {/* Metric Sub-indicator */}
                  <text
                    x="0"
                    y="22"
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="8.5"
                    fontWeight="600"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                    className="uppercase tracking-wider select-none"
                  >
                    {activeMetric === 'psi' ? '24h PSI' : '1h PM2.5'}
                  </text>
                </g>
              );
            })}
        </svg>

        {/* Floating Quick Region Selector (Bottom-Left) */}
        <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-lg border border-slate-200/80 shadow-xs text-xs">
          <button
            onClick={() => onSelectRegion('national')}
            className={`px-2.5 py-1 rounded font-medium transition-colors whitespace-nowrap ${
              selectedRegion === 'national' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Island
          </button>
          {(['north', 'south', 'east', 'west', 'central'] as Array<Exclude<RegionId, 'national'>>).map((rid) => (
            <button
              key={rid}
              onClick={() => onSelectRegion(rid)}
              className={`px-2 py-1 rounded font-medium transition-colors capitalize whitespace-nowrap ${
                selectedRegion === rid ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {rid}
            </button>
          ))}
        </div>
      </div>

      {/* Map Footer Legend (Singapore NEA Official Scale) */}
      <div className="px-5 py-3 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <span>NEA Reference Bands:</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#059669]" />
            <span className="text-slate-700 font-medium">Good (0–50)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#0284c7]" />
            <span className="text-slate-700 font-medium">Moderate (51–100)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#d97706]" />
            <span className="text-slate-700 font-medium">Unhealthy (101–200)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#dc2626]" />
            <span className="text-slate-700 font-medium">Very Unhealthy (201–300)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#7e22ce]" />
            <span className="text-slate-700 font-medium">Hazardous (&gt;300)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
