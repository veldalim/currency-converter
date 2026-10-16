/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Copy, 
  ExternalLink, 
  KeyRound, 
  Server, 
  ShieldAlert, 
  Sparkles, 
  Terminal, 
  Activity, 
  FolderCheck,
  RefreshCw
} from 'lucide-react';
import { RatesService } from '../services/ratesService';

interface MasApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRatesRefreshed: () => void;
}

export const MasApiModal: React.FC<MasApiModalProps> = ({
  isOpen,
  onClose,
  onRatesRefreshed,
}) => {
  const [testingStatus, setTestingStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testOutput, setTestOutput] = useState<any>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [backendHealth, setBackendHealth] = useState<{
    isOnline: boolean;
    isKeyConfigured: boolean;
    keyIdPreview?: string;
    sgtTime?: string;
  } | null>(null);

  const masCatalogueUrl =
    'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily?end_of_day=2026-10-14';

  useEffect(() => {
    if (isOpen) {
      RatesService.checkBackendHealth().then((res) => setBackendHealth(res));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const testHealthEndpoint = async () => {
    setTestingStatus('testing');
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setTestOutput({ endpoint: 'GET /api/health', status: res.status, data });
      setTestingStatus(res.ok ? 'success' : 'error');
      setBackendHealth({
        isOnline: res.ok,
        isKeyConfigured: Boolean(data?.masGateway?.isKeyConfigured),
        keyIdPreview: data?.masGateway?.keyIdPreview,
        sgtTime: data?.sgtTime,
      });
    } catch (err: any) {
      setTestOutput({ endpoint: 'GET /api/health', error: err?.message });
      setTestingStatus('error');
    }
  };

  const testExchangeRatesEndpoint = async () => {
    setTestingStatus('testing');
    try {
      const res = await fetch('/api/exchangerates?end_of_day=2026-10-14');
      const data = await res.json();
      setTestOutput({ endpoint: 'GET /api/exchangerates?end_of_day=2026-10-14', status: res.status, data });
      if (res.ok && data.success) {
        setTestingStatus('success');
        onRatesRefreshed();
      } else {
        // e.g. 401 missing key
        setTestingStatus('error');
      }
    } catch (err: any) {
      setTestOutput({ endpoint: 'GET /api/exchangerates', error: err?.message });
      setTestingStatus('error');
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(masCatalogueUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">MAS Serverless API Hub</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/60">
                  /api/exchangerates.ts
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live connection to MAS Exchange Rates End of Period Daily Catalogue
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
          
          {/* KeyId Status Banner */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-sm">MAS KeyId Environment Status</span>
              </div>
              <p className="text-slate-400 mt-1">
                {backendHealth?.isKeyConfigured ? (
                  <span className="text-emerald-400 font-medium">
                    Configured securely in environment ({backendHealth.keyIdPreview})
                  </span>
                ) : (
                  <span className="text-amber-400">
                    No KeyId set in environment yet. Add <code className="text-white font-mono bg-slate-900 px-1 py-0.5 rounded">MAS_KEY_ID=&quot;YOUR_KEY&quot;</code> to your secrets or <code className="text-white font-mono bg-slate-900 px-1 py-0.5 rounded">.env</code>.
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={testHealthEndpoint}
                disabled={testingStatus === 'testing'}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                <span>Test /health</span>
              </button>

              <button
                onClick={testExchangeRatesEndpoint}
                disabled={testingStatus === 'testing'}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingStatus === 'testing' ? 'animate-spin' : ''}`} />
                <span>Test /exchangerates</span>
              </button>
            </div>
          </div>

          {/* Directory Architecture */}
          <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <FolderCheck className="w-4 h-4 text-emerald-400" />
              <span>Serverless Handlers in Project Root (/api):</span>
            </div>
            <div className="font-mono text-[11px] space-y-1.5 text-slate-300">
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80 flex items-center justify-between">
                <span>/api/health.ts</span>
                <span className="text-sky-400 text-[10px]">GET /api/health</span>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80 flex items-center justify-between">
                <span>/api/exchangerates.ts</span>
                <span className="text-emerald-400 text-[10px]">GET /api/exchangerates?end_of_day=YYYY-MM-DD</span>
              </div>
            </div>
          </div>

          {/* MAS Endpoint Specification */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-sky-400" />
                Configured MAS Catalogue Target Endpoint:
              </span>
              <button
                onClick={copyUrl}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
              >
                {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[11px] text-sky-300 break-all select-all">
              {masCatalogueUrl}
            </div>

            <div className="text-[11px] text-slate-400">
              Header required by MAS Gateway: <code className="text-white font-mono bg-slate-900 px-1 py-0.5 rounded">KeyId: &lt;MAS_KEY_ID&gt;</code> (handled automatically via serverless route).
            </div>
          </div>

          {/* Test Output Console */}
          {testOutput && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Response Console ({testOutput.endpoint}):</span>
                <span className={testingStatus === 'success' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  HTTP {testOutput.status || 500}
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto">
                <pre>{JSON.stringify(testOutput.data || testOutput, null, 2)}</pre>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <a
            href="https://eservices.mas.gov.sg/statistics/masapi.aspx"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-medium"
          >
            <span>MAS API Gateway Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
