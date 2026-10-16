/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import { MergedCurrency, QuoteDisplayMode } from '../types/currency';

interface CurrencyCardProps {
  currency: MergedCurrency;
  isFavorite: boolean;
  onToggleFavorite: (code: string) => void;
  onOpenDetails: (currency: MergedCurrency) => void;
  onQuickConvert: (currency: MergedCurrency) => void;
  quoteMode: QuoteDisplayMode;
}

export const CurrencyCard: React.FC<CurrencyCardProps> = ({
  currency,
  isFavorite,
  onToggleFavorite,
  onOpenDetails,
  onQuickConvert,
  quoteMode,
}) => {
  const isPositive = currency.change24h >= 0;

  // Mini sparkline SVG generator
  const renderSparkline = () => {
    const points = currency.history7d;
    if (!points || points.length < 2) return null;

    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min === 0 ? 1 : max - min;
    const width = 80;
    const height = 24;

    const coords = points.map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={isPositive ? '#10b981' : '#f43f5e'}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords}
        />
      </svg>
    );
  };

  // Determine quote representation
  const isMas100 = currency.masUnit === 100;
  const showPer100 = quoteMode === 'mas' && isMas100;

  const quoteRate = showPer100 ? currency.rateToSgd * 100 : currency.rateToSgd;
  const quoteLabel = showPer100 ? `100 ${currency.code}` : `1 ${currency.code}`;

  function formatValue(val: number): string {
    if (val < 0.001) return val.toFixed(6);
    if (val < 0.1) return val.toFixed(5);
    if (val < 10) return val.toFixed(4);
    return val.toFixed(2);
  }

  function formatInverse(val: number): string {
    if (val >= 1000) return Math.round(val).toLocaleString();
    if (val >= 100) return val.toFixed(2);
    if (val >= 1) return val.toFixed(4);
    return val.toFixed(4);
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 flex flex-col justify-between group">
      
      {/* Top Header: Flag, Code, Favorite button */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl select-none" role="img" aria-label={currency.name}>
            {currency.flag}
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-base tracking-tight">{currency.code}</span>
              <span className="text-xs text-slate-400">({currency.symbol})</span>
              {showPer100 && (
                <span className="text-[10px] px-1 rounded bg-sky-950 text-sky-300 border border-sky-800/40">
                  MAS 100
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[150px]">{currency.name}</p>
          </div>
        </div>

        <button
          onClick={() => onToggleFavorite(currency.code)}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
            isFavorite
              ? 'bg-amber-400/10 text-amber-400 hover:bg-amber-400/20'
              : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Main Rate Figures */}
      <div className="my-3.5 pt-2 border-t border-slate-800/60">
        <div className="text-[11px] text-slate-400 flex items-center justify-between mb-0.5">
          <span>{quoteLabel} =</span>
          <span className="font-mono-nums text-slate-400 text-[11px]">
            1 SGD = {formatInverse(currency.rateFromSgd)} {currency.code}
          </span>
        </div>
        
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-xl font-extrabold text-white font-mono-nums tracking-tight">
            <span className="text-slate-400 text-sm font-semibold mr-1">S$</span>
            {formatValue(quoteRate)}
          </div>

          <div
            className={`flex items-center gap-0.5 text-xs font-semibold font-mono-nums ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>
              {isPositive ? '+' : ''}
              {currency.change24h.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Sparkline & Quick Actions */}
      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5" title="7-day rate trend">
          {renderSparkline()}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onQuickConvert(currency)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-xs font-medium text-slate-300 transition-colors flex items-center gap-1"
            title="Convert in Calculator"
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>Calc</span>
          </button>
          
          <button
            onClick={() => onOpenDetails(currency)}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
          >
            Details
          </button>
        </div>
      </div>

    </div>
  );
};
