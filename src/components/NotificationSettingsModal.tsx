import React from 'react';
import { NotificationSettings, RegionId } from '../types/psi';
import { SINGAPORE_REGIONS } from '../constants/singaporeData';
import { requestPushPermission, soundManager } from '../services/notificationService';
import { Bell, X, Volume2, VolumeX, Smartphone, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onSaveSettings: (settings: NotificationSettings) => void;
  onSendTestNotification: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onSendTestNotification,
}) => {
  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const perm = await requestPushPermission();
    const updated: NotificationSettings = {
      ...settings,
      permission: perm,
      pushEnabled: perm === 'granted',
    };
    onSaveSettings(updated);
    if (perm === 'granted') {
      soundManager.playTestChime();
    }
  };

  const toggleRegion = (regionId: RegionId) => {
    const isSubscribed = settings.subscribedRegions.includes(regionId);
    let updated: RegionId[];
    if (isSubscribed) {
      updated = settings.subscribedRegions.filter((r) => r !== regionId);
    } else {
      updated = [...settings.subscribedRegions, regionId];
    }
    onSaveSettings({ ...settings, subscribedRegions: updated });
  };

  const updateSetting = <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
    onSaveSettings({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Push Alert Preferences</h2>
              <p className="text-xs text-slate-500">Unhealthy air quality threshold notifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Permission Status Box */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">Browser Push Permission</span>
                {settings.permission === 'granted' ? (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Granted
                  </span>
                ) : settings.permission === 'denied' ? (
                  <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Blocked in Browser
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                    Not Prompted
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Receive instant desktop and mobile notifications when PSI spikes above threshold.
              </p>
            </div>

            {settings.permission !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shadow-xs"
              >
                Enable Notifications
              </button>
            )}
          </div>

          {/* Master Push Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <div className="font-semibold text-slate-900">Enable Air Quality Alerts</div>
              <div className="text-xs text-slate-500">Monitor continuous background telemetry</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pushEnabled}
                onChange={(e) => updateSetting('pushEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {/* Threshold Selection */}
          <div className="space-y-3">
            <div className="font-semibold text-slate-900">Alert Trigger Threshold</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateSetting('thresholdMetric', 'psi')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  settings.thresholdMetric === 'psi'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold uppercase tracking-wider">24-Hour PSI</div>
                <div className="text-xs mt-0.5 opacity-80">Trigger on official PSI scale</div>
              </button>
              <button
                type="button"
                onClick={() => updateSetting('thresholdMetric', 'pm25')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  settings.thresholdMetric === 'pm25'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold uppercase tracking-wider">1-Hour PM2.5</div>
                <div className="text-xs mt-0.5 opacity-80">Trigger on immediate hourly surge</div>
              </button>
            </div>

            {settings.thresholdMetric === 'psi' ? (
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs mb-2 text-slate-600">
                  <span>Trigger when PSI reaches or exceeds:</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {settings.psiThreshold} PSI ({settings.psiThreshold >= 101 ? 'Unhealthy' : 'Moderate'})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[50, 75, 100, 150, 200].map((val) => (
                    <button
                      key={val}
                      onClick={() => updateSetting('psiThreshold', val)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                        settings.psiThreshold === val
                          ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Recommendation: 100 PSI (official Singapore NEA Unhealthy threshold).
                </p>
              </div>
            ) : (
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs mb-2 text-slate-600">
                  <span>Trigger when 1-hr PM2.5 reaches:</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {settings.pm25Threshold} µg/m³
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[35, 55, 100, 150].map((val) => (
                    <button
                      key={val}
                      onClick={() => updateSetting('pm25Threshold', val)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                        settings.pm25Threshold === val
                          ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {val} µg
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Recommendation: 55 µg/m³ (Band II Elevated particulate threshold).
                </p>
              </div>
            )}
          </div>

          {/* Subscribed Regions */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">Monitored Singapore Regions</span>
              <span className="text-xs text-slate-500">
                {settings.subscribedRegions.length} selected
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(['national', 'north', 'south', 'east', 'west', 'central'] as RegionId[]).map((regId) => {
                const reg = SINGAPORE_REGIONS[regId];
                const isSelected = settings.subscribedRegions.includes(regId);
                return (
                  <button
                    key={regId}
                    type="button"
                    onClick={() => toggleRegion(regId)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 text-slate-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span>{reg.shortLabel}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-slate-900" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audio Chime and Vibration */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-slate-700" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                <div>
                  <div className="font-semibold text-slate-900">Acoustic Alert Chime</div>
                  <div className="text-xs text-slate-500">Harmonic warning chime on threshold breach</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-slate-700" />
                <div>
                  <div className="font-semibold text-slate-900">Haptic Vibration</div>
                  <div className="text-xs text-slate-500">Vibrate on mobile devices</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.vibrateEnabled}
                onChange={(e) => updateSetting('vibrateEnabled', e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Footer with Test button */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onSendTestNotification}
            className="px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>Send Test Push Now</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
