export type RegionId = 'north' | 'south' | 'east' | 'west' | 'central' | 'national';

export type AirQualityBand = 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous';

export type PM25Band = 'normal' | 'elevated' | 'high' | 'very_high';

export interface RegionalReading {
  region: RegionId;
  name: string;
  psi24h: number;
  pm25_1h: number;
  pm25_24h: number;
  pm10_24h: number;
  so2_24h: number;
  co_8h: number;
  no2_1h: number;
  o3_8h: number;
}

export interface AirQualityState {
  timestamp: string;
  updateTimestamp: string;
  isLiveApi: boolean;
  isSimulated: boolean;
  simulatedScenarioTitle?: string;
  windDirection: string;
  windSpeedKmh: number;
  regions: Record<RegionId, RegionalReading>;
}

export interface HistoricalDataPoint {
  hour: string;
  timestamp: number;
  national: number;
  north: number;
  south: number;
  east: number;
  west: number;
  central: number;
  pm25National: number;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  permission: NotificationPermission;
  thresholdMetric: 'psi' | 'pm25';
  psiThreshold: number; // e.g. 100 for Unhealthy, or 50 for Moderate
  pm25Threshold: number; // e.g. 55 for Elevated
  subscribedRegions: RegionId[];
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  minIntervalMinutes: number;
  lastNotifiedTimestamp?: number;
}

export interface AirAlert {
  id: string;
  timestamp: number;
  region: RegionId;
  regionName: string;
  metric: 'PSI' | 'PM2.5';
  value: number;
  threshold: number;
  band: AirQualityBand | PM25Band;
  title: string;
  message: string;
  read: boolean;
}

export interface RegionMetadata {
  id: RegionId;
  name: string;
  shortLabel: string;
  keyNeighborhoods: string[];
  lat: number;
  lng: number;
  svgCenter: { x: number; y: number };
}
