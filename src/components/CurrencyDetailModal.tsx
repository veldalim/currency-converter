/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Star, TrendingUp, TrendingDown, Landmark, ArrowRightLeft, ShieldCheck, Wallet } from 'lucide-react';
import { MergedCurrency } from '../types/currency';

interface CurrencyDetailModalProps {
  currency: MergedCurrency | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (code: string) => void;
  onSelectForCalculator: (currency: MergedCurrency) => void;
}

export const CurrencyDetailModal: React.FC<CurrencyDetailModalProps> = ({
  currency,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onSelectForCalculator,
}) => {
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);

  if (!isOpen || !currency) return null;

  const isPositive = currency.change24h >= 0;
  const isMas100 = currency.masUnit === 100;
  const masQuoteVal = isMas100 ? (currency.rateToSgd * 100) : currency.rateToSgd;

  // Chart computations
  const history = currency.history7d;
  const minVal = Math.min(...history);
  const maxVal = Math.max(...history);
  const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const chartWidth = 460;
  const chartHeight = 140;
  const paddingX = 24;
  const paddingY = 20;

  const points = history.map((val, idx) => {
    const x = paddingX + (idx / (history.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - ((val - minVal) / range) * (chartHeight - paddingY * 2);
    return { x, y, val, day: `Day -${6 - idx}` };
  });

  const polylineCoords = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Travel cash denominations quick list
  const travelPresets = [50, 100, 200, 500, 1000, 2000];

  function formatVal(val: number): string {
    if (val < 0.001) return val.toFixed(6);
    if (val < 0.1) return val.toFixed(5);
    if (val < 10) return val.toFixed(4);
    return val.toFixed(2);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <span className="text-3xl select-none" role="img" aria-label={currency.name}>
              {currency.flag}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white">{currency.code}</h3>
                <span className="text-sm text-slate-400">({currency.symbol})</span>
                {isMas100 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-sky-950 text-sky-300 border border-sky-800/60 font-medium">
                    MAS 100 Unit Standard
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {currency.name} · {currency.country} · {currency.region}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(currency.code)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
                isFavorite
                  ? 'bg-amber-400/10 border-amber-400/30 text-amber-400'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-white'
              }`}
              title={isFavorite ? 'Remove Favorite' : 'Save Favorite'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          
          {/* Key Rates Highlight */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">
                {isMas100 ? `100 ${currency.code}` : `1 ${currency.code}`}
              </span>
              <div className="text-lg font-bold text-white font-mono-nums mt-0.5">
                S$ {formatVal(masQuoteVal)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {isMas100 ? 'MAS Official Quote' : 'Rate in SGD'}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">1 SGD Buys</span>
              <div className="text-lg font-bold text-emerald-400 font-mono-nums mt-0.5">
                {currency.rateFromSgd >= 100
                  ? currency.rateFromSgd.toFixed(2)
                  : currency.rateFromSgd.toFixed(4)}{' '}
                {currency.code}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Direct Foreign Yield</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-400 font-medium">24h Net Change</span>
              <div
                className={`text-lg font-bold font-mono-nums mt-0.5 flex items-center gap-1 ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>
                  {isPositive ? '+' : ''}
                  {currency.change24h.toFixed(2)}%
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Market Variation</div>
            </div>
          </div>

          {/* 7-Day Trend Chart */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-slate-300">
                7-Day Rate Movement (vs SGD)
              </div>
              <div className="text-xs text-slate-400 font-mono-nums">
                {hoveredPointIdx !== null ? (
                  <span className="text-white font-medium">
                    {points[hoveredPointIdx].day === 'Day -0' ? 'Today' : points[hoveredPointIdx].day}:{' '}
                    S$ {formatVal(points[hoveredPointIdx].val)}
                  </span>
                ) : (
                  <span>Hover points to inspect</span>
                )}
              </div>
            </div>

            {/* SVG Chart */}
            <div className="relative w-full overflow-hidden flex justify-center">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full max-h-36 overflow-visible"
              >
                {/* Horizontal guide lines */}
                <line
                  x1={paddingX}
                  y1={paddingY}
                  x2={chartWidth - paddingX}
                  y2={paddingY}
                  stroke="#334155"
                  strokeDasharray="3 3"
                  strokeWidth="0.8"
                />
                <line
                  x1={paddingX}
                  y1={chartHeight - paddingY}
                  x2={chartWidth - paddingX}
                  y2={chartHeight - paddingY}
                  stroke="#334155"
                  strokeDasharray="3 3"
                  strokeWidth="0.8"
                />

                {/* Line */}
                <polyline
                  fill="none"
                  stroke={isPositive ? '#10b981' : '#f43f5e'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={polylineCoords}
                />

                {/* Points */}
                {points.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={hoveredPointIdx === i ? 5 : 3.5}
                    fill={hoveredPointIdx === i ? '#ffffff' : (isPositive ? '#10b981' : '#f43f5e')}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredPointIdx(i)}
                    onMouseLeave={() => setHoveredPointIdx(null)}
                  />
                ))}
              </svg>
            </div>

            {/* Chart min/max labels */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono-nums mt-1 px-1">
              <span>7D Low: S$ {formatVal(minVal)}</span>
              <span>7D High: S$ {formatVal(maxVal)}</span>
            </div>
          </div>

          {/* MAS Official Metadata Series Info */}
          <div className="p-3.5 rounded-2xl bg-sky-950/30 border border-sky-800/40 text-xs">
            <div className="flex items-center gap-2 text-sky-300 font-semibold mb-1">
              <Landmark className="w-4 h-4" />
              <span>Monetary Authority of Singapore (MAS) Quotation Rules</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {currency.masDescription || `Quoted per ${currency.masUnit} unit(s) against the Singapore Dollar.`}
              {isMas100 ? (
                <>
                  {' '}Under MAS conventions, Asian currencies like {currency.code} are officially quoted per 100 units rather than single units to prevent fractional micro-cents.
                </>
              ) : (
                <>
                  {' '}Quoted in 1-to-1 units per standard international financial conventions.
                </>
              )}
            </p>
          </div>

          {/* Travel Quick Denominations */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Singapore Traveler&apos;s Quick Cash Sheet</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {travelPresets.map((amt) => {
                const foreignAmt = amt * currency.rateFromSgd;
                return (
                  <div key={amt} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div className="text-slate-400 font-mono-nums font-medium">S$ {amt.toLocaleString()}</div>
                    <div className="text-white font-mono-nums font-bold mt-0.5 truncate">
                      {currency.symbol} {foreignAmt >= 100 ? Math.round(foreignAmt).toLocaleString() : foreignAmt.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Benchmark Mid-Market Rate</span>
          </div>

          <button
            onClick={() => {
              onSelectForCalculator(currency);
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Load into Calculator</span>
          </button>
        </div>
      </div>
    </div>
  );
};
