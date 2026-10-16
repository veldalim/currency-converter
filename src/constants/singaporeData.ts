import { RegionId, RegionMetadata, AirQualityBand, PM25Band } from '../types/psi';

export const SINGAPORE_REGIONS: Record<RegionId, RegionMetadata> = {
  national: {
    id: 'national',
    name: 'Singapore Overall',
    shortLabel: 'National',
    keyNeighborhoods: ['Islandwide Average'],
    lat: 1.3521,
    lng: 103.8198,
    svgCenter: { x: 500, y: 250 },
  },
  north: {
    id: 'north',
    name: 'North Region',
    shortLabel: 'North',
    keyNeighborhoods: ['Woodlands', 'Yishun', 'Sembawang', 'Mandai', 'Simpang'],
    lat: 1.4180,
    lng: 103.8200,
    svgCenter: { x: 470, y: 130 },
  },
  south: {
    id: 'south',
    name: 'South Region',
    shortLabel: 'South',
    keyNeighborhoods: ['Marina Bay', 'Bukit Merah', 'Sentosa', 'Queenstown', 'Telok Blangah'],
    lat: 1.2958,
    lng: 103.8249,
    svgCenter: { x: 490, y: 350 },
  },
  east: {
    id: 'east',
    name: 'East Region',
    shortLabel: 'East',
    keyNeighborhoods: ['Bedok', 'Tampines', 'Pasir Ris', 'Changi', 'Marine Parade'],
    lat: 1.3574,
    lng: 103.9400,
    svgCenter: { x: 670, y: 230 },
  },
  west: {
    id: 'west',
    name: 'West Region',
    shortLabel: 'West',
    keyNeighborhoods: ['Jurong West', 'Jurong East', 'Clementi', 'Tuas', 'Bukit Batok'],
    lat: 1.3574,
    lng: 103.7000,
    svgCenter: { x: 260, y: 240 },
  },
  central: {
    id: 'central',
    name: 'Central Region',
    shortLabel: 'Central',
    keyNeighborhoods: ['Bishan', 'Toa Payoh', 'Ang Mo Kio', 'Novena', 'Orchard'],
    lat: 1.3574,
    lng: 103.8200,
    svgCenter: { x: 480, y: 240 },
  },
};

export interface BandConfig {
  band: AirQualityBand;
  label: string;
  min: number;
  max: number;
  colorHex: string;
  badgeBg: string;
  badgeText: string;
  cardBorder: string;
  description: string;
  healthAction: string;
  maskRecommended: boolean;
}

export const PSI_BANDS: Record<AirQualityBand, BandConfig> = {
  good: {
    band: 'good',
    label: 'Good',
    min: 0,
    max: 50,
    colorHex: '#059669', // emerald-600
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    badgeText: 'text-emerald-700',
    cardBorder: 'border-emerald-200',
    description: 'Air quality is satisfactory and poses little or no risk.',
    healthAction: 'Normal outdoor activities for everyone. Windows can stay open.',
    maskRecommended: false,
  },
  moderate: {
    band: 'moderate',
    label: 'Moderate',
    min: 51,
    max: 100,
    colorHex: '#0284c7', // sky-600
    badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
    badgeText: 'text-sky-700',
    cardBorder: 'border-sky-200',
    description: 'Air quality is acceptable. Fine particulate levels are modest.',
    healthAction: 'Normal activity for general population. Sensitive individuals can monitor symptoms.',
    maskRecommended: false,
  },
  unhealthy: {
    band: 'unhealthy',
    label: 'Unhealthy',
    min: 101,
    max: 200,
    colorHex: '#d97706', // amber-600
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    badgeText: 'text-amber-700',
    cardBorder: 'border-amber-300',
    description: 'Unhealthy air threshold crossed. Transboundary haze or particulate surge.',
    healthAction: 'Reduce prolonged or strenuous outdoor exertion. Vulnerable groups avoid intense outdoor workouts.',
    maskRecommended: true,
  },
  very_unhealthy: {
    band: 'very_unhealthy',
    label: 'Very Unhealthy',
    min: 201,
    max: 300,
    colorHex: '#dc2626', // rose-600
    badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
    badgeText: 'text-rose-700',
    cardBorder: 'border-rose-300',
    description: 'Significant health hazard. Noticeable smoke smell and reduced visibility.',
    healthAction: 'Avoid outdoor exertion. Wear N95 respirator if stepping outside. Run indoor HEPA air purifiers.',
    maskRecommended: true,
  },
  hazardous: {
    band: 'hazardous',
    label: 'Hazardous',
    min: 301,
    max: 500,
    colorHex: '#7e22ce', // purple-700
    badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
    badgeText: 'text-purple-700',
    cardBorder: 'border-purple-400',
    description: 'Emergency air quality conditions. Severe respiratory threat.',
    healthAction: 'Stay indoors with closed doors and windows. N95 respirator mandatory outdoors.',
    maskRecommended: true,
  },
};

export const PM25_BANDS_CONFIG: Record<PM25Band, { band: PM25Band; label: string; min: number; max: number; colorHex: string; advice: string }> = {
  normal: {
    band: 'normal',
    label: 'Band I (Normal)',
    min: 0,
    max: 55,
    colorHex: '#059669',
    advice: 'Normal outdoor activities may be taken by all individuals.',
  },
  elevated: {
    band: 'elevated',
    label: 'Band II (Elevated)',
    min: 56,
    max: 150,
    colorHex: '#d97706',
    advice: 'Sensitive individuals should reduce strenuous outdoor activities.',
  },
  high: {
    band: 'high',
    label: 'Band III (High)',
    min: 151,
    max: 250,
    colorHex: '#dc2626',
    advice: 'General public should reduce outdoor exertion; vulnerable groups stay indoors.',
  },
  very_high: {
    band: 'very_high',
    label: 'Band IV (Very High)',
    min: 251,
    max: 999,
    colorHex: '#7e22ce',
    advice: 'Avoid all outdoor activity. Keep indoor air sealed with air cleaners.',
  },
};

export function getPsiBand(psi: number): BandConfig {
  if (psi <= 50) return PSI_BANDS.good;
  if (psi <= 100) return PSI_BANDS.moderate;
  if (psi <= 200) return PSI_BANDS.unhealthy;
  if (psi <= 300) return PSI_BANDS.very_unhealthy;
  return PSI_BANDS.hazardous;
}

export function getPM25Band(pm25: number): typeof PM25_BANDS_CONFIG[PM25Band] {
  if (pm25 <= 55) return PM25_BANDS_CONFIG.normal;
  if (pm25 <= 150) return PM25_BANDS_CONFIG.elevated;
  if (pm25 <= 250) return PM25_BANDS_CONFIG.high;
  return PM25_BANDS_CONFIG.very_high;
}

export const PRESET_SCENARIOS = [
  {
    id: 'normal',
    name: 'Tropical Clean Day',
    description: 'Typical sunny Singapore afternoon with clean sea breeze.',
    nationalPsi: 34,
    readings: {
      north: 32,
      south: 29,
      east: 28,
      west: 39,
      central: 34,
      national: 34,
    },
    pm25: {
      north: 12,
      south: 9,
      east: 8,
      west: 15,
      central: 11,
      national: 11,
    },
    windDirection: 'SSW',
    windSpeedKmh: 14,
  },
  {
    id: 'moderate',
    name: 'Dry Season Moderate',
    description: 'Dry spell with moderate industrial & regional baseline readings.',
    nationalPsi: 68,
    readings: {
      north: 65,
      south: 62,
      east: 59,
      west: 78,
      central: 66,
      national: 68,
    },
    pm25: {
      north: 28,
      south: 24,
      east: 22,
      west: 36,
      central: 27,
      national: 28,
    },
    windDirection: 'S',
    windSpeedKmh: 18,
  },
  {
    id: 'unhealthy',
    name: 'Transboundary Haze (Unhealthy Alert)',
    description: 'Regional fires with southwest monsoon winds pushing smoke into Singapore.',
    nationalPsi: 124,
    readings: {
      north: 118,
      south: 132,
      east: 108,
      west: 142,
      central: 126,
      national: 124,
    },
    pm25: {
      north: 68,
      south: 74,
      east: 61,
      west: 82,
      central: 70,
      national: 71,
    },
    windDirection: 'SW',
    windSpeedKmh: 24,
  },
  {
    id: 'very_unhealthy',
    name: 'Severe Incursion (Very Unhealthy)',
    description: 'Dense smoke plume blanket across the island. Visibility under 2 km.',
    nationalPsi: 218,
    readings: {
      north: 205,
      south: 228,
      east: 195,
      west: 246,
      central: 220,
      national: 218,
    },
    pm25: {
      north: 155,
      south: 172,
      east: 145,
      west: 188,
      central: 165,
      national: 165,
    },
    windDirection: 'SW',
    windSpeedKmh: 28,
  },
  {
    id: 'hazardous',
    name: 'Extreme Episode (Hazardous Warning)',
    description: 'Critical historic haze crisis condition. Emergency stay-at-home advisory.',
    nationalPsi: 335,
    readings: {
      north: 315,
      south: 348,
      east: 305,
      west: 368,
      central: 340,
      national: 335,
    },
    pm25: {
      north: 270,
      south: 295,
      east: 260,
      west: 320,
      central: 285,
      national: 286,
    },
    windDirection: 'SW',
    windSpeedKmh: 32,
  },
];
