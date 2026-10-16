import React, { useState, useEffect, useCallback } from 'react';
import {
  AirAlert,
  AirQualityState,
  HistoricalDataPoint,
  NotificationSettings,
  RegionId,
} from './types/psi';
import {
  fetchLiveSingaporeAirQuality,
  applyScenarioAirQuality,
  generate24HourHistory,
  generateBaselineAirQualityState,
} from './services/airQualityService';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  evaluateThresholdAndAlert,
  loadAlertHistory,
  loadNotificationSettings,
  saveAlertHistory,
  saveNotificationSettings,
  sendBrowserPushNotification,
  soundManager,
} from './services/notificationService';
import { TopBar } from './components/TopBar';
import { HeroSection } from './components/HeroSection';
import { AlertBanner } from './components/AlertBanner';
import { AlertToast } from './components/AlertToast';
import { InteractiveMap } from './components/InteractiveMap';
import { HealthAdvisoryCard } from './components/HealthAdvisoryCard';
import { RegionalGrid } from './components/RegionalGrid';
import { TrendChart } from './components/TrendChart';
import { PollutantBreakdown } from './components/PollutantBreakdown';
import { HazeSimulatorBar } from './components/HazeSimulatorBar';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { AlertHistoryDrawer } from './components/AlertHistoryDrawer';
import { Footer } from './components/Footer';

export default function App() {
  // Air quality state
  const [airState, setAirState] = useState<AirQualityState>(generateBaselineAirQualityState());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<RegionId>('national');
  const [activeMetric, setActiveMetric] = useState<'psi' | 'pm25'>('psi');

  // Simulation state
  const [activeScenarioId, setActiveScenarioId] = useState<string | undefined>(undefined);
  const [customPsi, setCustomPsi] = useState<number>(34);

  // 24h History state
  const [history, setHistory] = useState<HistoricalDataPoint[]>([]);

  // Notifications state
  const [settings, setSettings] = useState<NotificationSettings>(loadNotificationSettings());
  const [alerts, setAlerts] = useState<AirAlert[]>(loadAlertHistory());
  const [activeToast, setActiveToast] = useState<{
    title: string;
    body: string;
    type?: 'alert' | 'success' | 'info';
  } | null>(null);

  // Modals & Drawers
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load live data from NEA data.gov.sg
  const loadLiveData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchLiveSingaporeAirQuality();
      setAirState(data);
      setActiveScenarioId(undefined);
      setCustomPsi(data.regions.national.psi24h);
      setHistory(generate24HourHistory(data.regions.national.psi24h));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadLiveData();
    const interval = setInterval(loadLiveData, 5 * 60 * 1000); // 5 min sync
    return () => clearInterval(interval);
  }, [loadLiveData]);

  // Handle new alert triggered by threshold evaluator
  const handleNewAlert = useCallback((newAlert: AirAlert) => {
    setAlerts((prev) => {
      const updated = [newAlert, ...prev.filter((a) => a.id !== newAlert.id)];
      saveAlertHistory(updated);
      return updated;
    });

    setActiveToast({
      title: newAlert.title,
      body: newAlert.message,
      type: 'alert',
    });
  }, []);

  // Whenever airState or settings change, evaluate threshold alerts
  useEffect(() => {
    if (airState && airState.regions) {
      evaluateThresholdAndAlert(airState.regions, settings, handleNewAlert);
    }
  }, [airState, settings, handleNewAlert]);

  // Scenario Simulator actions
  const handleSelectScenario = (scenarioId: string) => {
    setActiveScenarioId(scenarioId);
    const simulated = applyScenarioAirQuality(scenarioId);
    setAirState(simulated);
    setCustomPsi(simulated.regions.national.psi24h);
    setHistory(generate24HourHistory(simulated.regions.national.psi24h));
  };

  const handleChangeCustomPsi = (psi: number) => {
    setCustomPsi(psi);
    const simulated = applyScenarioAirQuality(activeScenarioId || 'unhealthy', psi);
    setAirState(simulated);
    setHistory(generate24HourHistory(psi));
  };

  const handleResetToLive = () => {
    loadLiveData();
  };

  // Immediate Test Notification trigger
  const handleTriggerTestAlert = () => {
    soundManager.playTestChime();

    const title = '⚠️ Singapore Air Quality Alert: West Region (Test)';
    const body = 'PSI reached 128 (Unhealthy). Transboundary smoke surge detected. Limit prolonged outdoor exertion.';

    sendBrowserPushNotification(title, {
      body,
      tag: 'air-quality-test-alert',
    });

    const testAlert: AirAlert = {
      id: `test-${Date.now()}`,
      timestamp: Date.now(),
      region: 'west',
      regionName: 'West Region',
      metric: 'PSI',
      value: 128,
      threshold: 100,
      band: 'unhealthy',
      title: 'Air Quality Alert: West Region (Test Trigger)',
      message: 'PSI reached 128 (Unhealthy). Exceeded alert threshold of 100. Reduce prolonged outdoor exercise.',
      read: false,
    };

    handleNewAlert(testAlert);
  };

  // Notification settings save
  const handleSaveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const handleDismissBanner = (alertId: string) => {
    setAlerts((prev) => {
      const updated = prev.map((a) => (a.id === alertId ? { ...a, read: true } : a));
      saveAlertHistory(updated);
      return updated;
    });
  };

  const handleClearAlertHistory = () => {
    setAlerts([]);
    saveAlertHistory([]);
  };

  const selectedReading = airState.regions[selectedRegion] || airState.regions.national;
  const unreadAlerts = alerts.filter((a) => !a.read);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-200">
      {/* Top Bar Contract (Wordmark - Clean Links - Primary Action) */}
      <TopBar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        pushEnabled={settings.pushEnabled}
        unreadAlertCount={unreadAlerts.length}
      />

      {/* Unhealthy Alert Banner if threshold crossed */}
      <AlertBanner
        alerts={unreadAlerts}
        onDismiss={handleDismissBanner}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Hero Section */}
      <HeroSection
        nationalReading={airState.regions.national}
        timestamp={airState.timestamp}
        updateTimestamp={airState.updateTimestamp}
        isLiveApi={airState.isLiveApi}
        isSimulated={airState.isSimulated}
        onRefresh={loadLiveData}
        onOpenSettings={() => setIsSettingsOpen(true)}
        pushEnabled={settings.pushEnabled}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Haze Simulator & Alert Triggering Bar */}
        <section>
          <HazeSimulatorBar
            isSimulated={airState.isSimulated}
            isLiveApi={airState.isLiveApi}
            activeScenarioId={activeScenarioId}
            customPsi={customPsi}
            onSelectScenario={handleSelectScenario}
            onChangeCustomPsi={handleChangeCustomPsi}
            onResetToLive={handleResetToLive}
            onTriggerTestAlert={handleTriggerTestAlert}
          />
        </section>

        {/* Interactive Map & Health Advisory Split */}
        <section id="interactive-map" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Interactive Map Canvas (7 cols on desktop) */}
          <div className="lg:col-span-7">
            <InteractiveMap
              readings={airState.regions}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              activeMetric={activeMetric}
              onChangeMetric={setActiveMetric}
              windDirection={airState.windDirection}
              windSpeedKmh={airState.windSpeedKmh}
            />
          </div>

          {/* Health Advisory & Guidance (5 cols on desktop) */}
          <div id="health-advisory" className="lg:col-span-5 space-y-6">
            <HealthAdvisoryCard
              reading={selectedReading}
              activeMetric={activeMetric}
            />
          </div>
        </section>

        {/* Regional Stations Overview Grid */}
        <section>
          <RegionalGrid
            readings={airState.regions}
            selectedRegion={selectedRegion}
            onSelectRegion={setSelectedRegion}
            activeMetric={activeMetric}
          />
        </section>

        {/* 24-Hour Trend Chart */}
        <section id="trend-analysis">
          <TrendChart
            history={history}
            selectedRegion={selectedRegion}
          />
        </section>

        {/* Sub-Indices Pollutant Breakdown */}
        <section id="pollutant-data">
          <PollutantBreakdown reading={selectedReading} />
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Settings Modal */}
      <NotificationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onSendTestNotification={handleTriggerTestAlert}
      />

      {/* Alert History Drawer */}
      <AlertHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        alerts={alerts}
        onClearHistory={handleClearAlertHistory}
      />

      {/* Real-time Toast Notification */}
      <AlertToast
        toast={activeToast}
        onClose={() => setActiveToast(null)}
      />
    </div>
  );
}
