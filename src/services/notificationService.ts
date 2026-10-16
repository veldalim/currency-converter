import { AirAlert, NotificationSettings, RegionalReading, RegionId } from '../types/psi';
import { getPsiBand, getPM25Band, SINGAPORE_REGIONS } from '../constants/singaporeData';

const SETTINGS_KEY = 'breezesg_notification_settings';
const ALERTS_KEY = 'breezesg_alert_history';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  pushEnabled: false,
  permission: typeof Notification !== 'undefined' ? Notification.permission : 'default',
  thresholdMetric: 'psi',
  psiThreshold: 100, // Unhealthy threshold
  pm25Threshold: 55, // 1-hour PM2.5 Elevated threshold
  subscribedRegions: ['national', 'north', 'south', 'east', 'west', 'central'],
  soundEnabled: true,
  vibrateEnabled: true,
  minIntervalMinutes: 15,
};

class SoundSynthesizer {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playAlert(severity: 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous' = 'unhealthy') {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = severity === 'hazardous' || severity === 'very_unhealthy' ? 'sawtooth' : 'sine';
      osc2.type = 'triangle';

      const baseFreq = severity === 'hazardous' ? 440 : severity === 'very_unhealthy' ? 520 : severity === 'unhealthy' ? 587.33 : 659.25;

      osc1.frequency.setValueAtTime(baseFreq, now);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.15);
      osc1.frequency.setValueAtTime(baseFreq * 1.25, now + 0.22);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.38);

      osc2.frequency.setValueAtTime(baseFreq * 0.5, now);
      osc2.frequency.setValueAtTime(baseFreq * 0.75, now + 0.22);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } catch {
      // Audio playback fails gracefully if un-interacted
    }
  }

  playTestChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.24); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.36); // C6

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    } catch {
      // Audio fallback
    }
  }
}

export const soundManager = new SoundSynthesizer();

export function loadNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...parsed,
      permission: typeof Notification !== 'undefined' ? Notification.permission : 'default',
    };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // LocalStorage quota or privacy mode fallback
  }
}

export function loadAlertHistory(): AirAlert[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ALERTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAlertHistory(alerts: AirAlert[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts.slice(0, 50))); // retain up to 50
  } catch {
    // Fallback
  }
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch {
    return 'denied';
  }
}

export function sendBrowserPushNotification(title: string, options: NotificationOptions): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
      return true;
    } catch {
      // Notification constructor failed (e.g. requires service worker in some contexts)
      return false;
    }
  }
  return false;
}

// Track sent alerts in memory to avoid repetitive alarms
const lastAlertedByRegion: Record<string, { timestamp: number; value: number }> = {};

export function evaluateThresholdAndAlert(
  readings: Record<RegionId, RegionalReading>,
  settings: NotificationSettings,
  onNewAlert: (alert: AirAlert) => void
): void {
  if (!settings.pushEnabled) return;

  const now = Date.now();
  const cooldownMs = settings.minIntervalMinutes * 60 * 1000;

  for (const regionId of settings.subscribedRegions) {
    const reading = readings[regionId];
    if (!reading) continue;

    const metricValue = settings.thresholdMetric === 'psi' ? reading.psi24h : reading.pm25_1h;
    const threshold = settings.thresholdMetric === 'psi' ? settings.psiThreshold : settings.pm25Threshold;

    if (metricValue >= threshold) {
      const last = lastAlertedByRegion[regionId];
      // Check cooldown or if value jumped by 20+ points
      const shouldTrigger = !last || (now - last.timestamp > cooldownMs) || (metricValue >= last.value + 20);

      if (shouldTrigger) {
        lastAlertedByRegion[regionId] = { timestamp: now, value: metricValue };

        const band = settings.thresholdMetric === 'psi' ? getPsiBand(metricValue) : getPM25Band(metricValue);
        const regionMeta = SINGAPORE_REGIONS[regionId];

        const title = `Air Quality Alert: ${regionMeta.name}`;
        const message = `${settings.thresholdMetric.toUpperCase()} has reached ${metricValue} (${band.label}), exceeding your alert threshold of ${threshold}. ${'healthAction' in band ? band.healthAction : band.advice}`;

        const alert: AirAlert = {
          id: `alert-${now}-${regionId}`,
          timestamp: now,
          region: regionId,
          regionName: regionMeta.name,
          metric: settings.thresholdMetric === 'psi' ? 'PSI' : 'PM2.5',
          value: metricValue,
          threshold,
          band: band.band,
          title,
          message,
          read: false,
        };

        // 1. Play sound if configured
        if (settings.soundEnabled) {
          const sev = metricValue >= 300 ? 'hazardous' : metricValue >= 200 ? 'very_unhealthy' : metricValue >= 100 ? 'unhealthy' : 'moderate';
          soundManager.playAlert(sev);
        }

        // 2. Vibrate on mobile if supported
        if (settings.vibrateEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([200, 100, 200]);
          } catch {
            // vibration unsupported
          }
        }

        // 3. Dispatch Web Notification
        sendBrowserPushNotification(title, {
          body: message,
          tag: `air-alert-${regionId}`,
        });

        // 4. Notify app state
        onNewAlert(alert);
      }
    }
  }
}
