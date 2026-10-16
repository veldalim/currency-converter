/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RefreshCw, Code2, Clock, Landmark } from 'lucide-react';
import { RateData } from '../types/currency';

interface NavbarProps {
  rates: Record<string, RateData>;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenMasModal: () => void;
  lastUpdated: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  rates,
  onRefresh,
  isRefreshing,
  onOpenMasModal,
  lastUpdated,
}) => {
  const [sgtTime, setSgtTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      // Singapore Time is UTC+8
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-SG', {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        day: 'numeric',
        month: 'short',
      });
      setSgtTime(formatter.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Quick ticker key pairs
  const tickerItems = [
    { code: 'MYR', label: 'SGD/MYR', rate: rates.MYR?.rateFromSgd, change: rates.MYR?.change24h },
    { code: 'USD', label: 'USD/SGD', rate: rates.USD?.rateToSgd, change: rates.USD?.change24h },
    { code: 'JPY', label: 'SGD/JPY', rate: rates.JPY?.rateFromSgd, change: rates.JPY?.change24h },
    { code: 'THB', label: 'SGD/THB', rate: rates.THB?.rateFromSgd, change: rates.THB?.change24h },
    { code: 'EUR', label: 'EUR/SGD', rate: rates.EUR?.rateToSgd, change: rates.EUR?.change24h },
  ];

  const formatLastUpdated = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Singapore identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 p-[1px] shadow-lg shadow-red-500/10 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center text-lg font-bold">
                🇸🇬
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">SG FX</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Singapore Exchange Rates · MAS Benchmark
              </p>
            </div>
          </div>

          {/* SGT Clock & Status */}
          <div className="hidden md:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>SGT (UTC+8):</span>
              <span className="font-mono-nums font-semibold text-white">{sgtTime || '12:00:00 PM'}</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              <Landmark className="w-3.5 h-3.5 text-sky-400" />
              <span>MAS Daily Reference Ready</span>
            </div>
          </div>

          {/* Actions: Refresh & Backend MAS Config */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title={`Updated at ${formatLastUpdated(lastUpdated)}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
              <span className="text-[10px] text-slate-400 font-mono-nums hidden lg:inline">
                ({formatLastUpdated(lastUpdated)})
              </span>
            </button>

            <button
              onClick={onOpenMasModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 border border-sky-800/60 text-xs font-medium text-sky-300 transition-all hover:border-sky-700"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>MAS API</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Ticker Bar for Top Singapore Currencies */}
      <div className="border-t border-slate-800/60 bg-slate-900/50 py-1.5 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 text-xs whitespace-nowrap">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            SG Market Ticker:
          </span>
          {tickerItems.map((item) => {
            const isPositive = (item.change ?? 0) >= 0;
            return (
              <div key={item.code} className="flex items-center gap-2">
                <span className="text-slate-300 font-medium">{item.label}</span>
                <span className="font-mono-nums text-white font-semibold">
                  {item.rate !== undefined
                    ? item.rate > 10
                      ? item.rate.toFixed(2)
                      : item.rate.toFixed(4)
                    : '--'}
                </span>
                <span
                  className={`font-mono-nums text-[11px] font-medium flex items-center ${
                    isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {item.change?.toFixed(2)}%
                </span>
                <span className="text-slate-700 select-none">|</span>
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
};
