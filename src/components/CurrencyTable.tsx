/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, TrendingUp, TrendingDown, ArrowRightLeft, ArrowUpDown } from 'lucide-react';
import { MergedCurrency, QuoteDisplayMode } from '../types/currency';

interface CurrencyTableProps {
  currencies: MergedCurrency[];
  favorites: string[];
  onToggleFavorite: (code: string) => void;
  onOpenDetails: (currency: MergedCurrency) => void;
  onQuickConvert: (currency: MergedCurrency) => void;
  quoteMode: QuoteDisplayMode;
}

export const CurrencyTable: React.FC<CurrencyTableProps> = ({
  currencies,
  favorites,
  onToggleFavorite,
  onOpenDetails,
  onQuickConvert,
  quoteMode,
}) => {
  const renderSparkline = (points: number[], isPositive: boolean) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min === 0 ? 1 : max - min;
    const width = 70;
    const height = 20;

    const coords = points
      .map((val, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible inline-block">
        <polyline
          fill="none"
          stroke={isPositive ? '#10b981' : '#f43f5e'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords}
        />
      </svg>
    );
  };

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
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
      <table className="w-full text-left text-xs whitespace-nowrap">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            <th className="py-3 px-4 w-10">Fav</th>
            <th className="py-3 px-4">Currency</th>
            <th className="py-3 px-4">MAS Quotation</th>
            <th className="py-3 px-4">Direct (1 Unit = SGD)</th>
            <th className="py-3 px-4">1 SGD Buys</th>
            <th className="py-3 px-4">24h Change</th>
            <th className="py-3 px-4">7D Trend</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {currencies.map((currency) => {
            const isFav = favorites.includes(currency.code);
            const isPositive = currency.change24h >= 0;
            const isMas100 = currency.masUnit === 100;
            const masQuote = isMas100 ? (currency.rateToSgd * 100) : currency.rateToSgd;

            return (
              <tr
                key={currency.code}
                className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                onClick={() => onOpenDetails(currency)}
              >
                {/* Favorite Button */}
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onToggleFavorite(currency.code)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-600 hover:text-amber-400 transition-colors"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        isFav ? 'fill-amber-400 text-amber-400' : ''
                      }`}
                    />
                  </button>
                </td>

                {/* Currency identity */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl select-none">{currency.flag}</span>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                        <span>{currency.code}</span>
                        <span className="text-xs text-slate-400 font-normal">({currency.symbol})</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {currency.name} · {currency.country}
                      </div>
                    </div>
                  </div>
                </td>

                {/* MAS Official Quotation */}
                <td className="py-3 px-4">
                  <div className="font-mono-nums font-semibold text-white">
                    <span className="text-slate-400 mr-1">S$</span>
                    {formatValue(masQuote)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isMas100 ? 'Per 100 units' : 'Per 1 unit'}
                  </div>
                </td>

                {/* Direct 1 Unit to SGD */}
                <td className="py-3 px-4">
                  <div className="font-mono-nums text-slate-300">
                    S$ {formatValue(currency.rateToSgd)}
                  </div>
                </td>

                {/* 1 SGD Buys */}
                <td className="py-3 px-4">
                  <div className="font-mono-nums font-semibold text-emerald-400">
                    {formatInverse(currency.rateFromSgd)} {currency.symbol}
                  </div>
                </td>

                {/* 24h Change */}
                <td className="py-3 px-4">
                  <div
                    className={`inline-flex items-center gap-1 font-mono-nums font-semibold ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>
                      {isPositive ? '+' : ''}
                      {currency.change24h.toFixed(2)}%
                    </span>
                  </div>
                </td>

                {/* 7D Trend */}
                <td className="py-3 px-4">
                  {renderSparkline(currency.history7d, isPositive)}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onQuickConvert(currency)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 font-medium transition-colors flex items-center gap-1"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>Convert</span>
                    </button>
                    <button
                      onClick={() => onOpenDetails(currency)}
                      className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
