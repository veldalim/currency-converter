/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, X, Star, Check } from 'lucide-react';
import { BASE_SGD_CURRENCY, SUPPORTED_CURRENCIES } from '../data/singaporeCurrencies';
import { Currency } from '../types/currency';

interface CurrencySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (currency: Currency) => void;
  selectedCode: string;
  favorites: string[];
  title?: string;
}

export const CurrencySelectModal: React.FC<CurrencySelectModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedCode,
  favorites,
  title = 'Select Currency',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'popular' | 'favorites'>('all');

  // All currencies including base SGD
  const allCurrencies = useMemo(() => [BASE_SGD_CURRENCY, ...SUPPORTED_CURRENCIES], []);

  const filteredCurrencies = useMemo(() => {
    return allCurrencies.filter((c) => {
      // Tab filter
      if (activeTab === 'popular' && !c.isPopularInSg) return false;
      if (activeTab === 'favorites' && !favorites.includes(c.code) && c.code !== 'SGD') return false;

      // Search filter
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        c.code.toLowerCase().includes(term) ||
        c.name.toLowerCase().includes(term) ||
        c.country.toLowerCase().includes(term) ||
        c.symbol.toLowerCase().includes(term)
      );
    });
  }, [allCurrencies, activeTab, favorites, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">{title}</h3>
            <p className="text-xs text-slate-400">Search by code, country, or currency name</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search e.g. MYR, Ringgit, Yen, USD..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 mt-2.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({allCurrencies.length})
            </button>
            <button
              onClick={() => setActiveTab('popular')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                activeTab === 'popular'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Popular in SG
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors flex items-center gap-1 ${
                activeTab === 'favorites'
                  ? 'bg-slate-800 text-amber-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Star className="w-3 h-3 fill-amber-400/40 text-amber-400" />
              Favorites ({favorites.length})
            </button>
          </div>
        </div>

        {/* Currency list */}
        <div className="overflow-y-auto flex-1 p-2 divide-y divide-slate-800/40">
          {filteredCurrencies.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No currencies found matching &quot;{searchTerm}&quot;
            </div>
          ) : (
            filteredCurrencies.map((c) => {
              const isSelected = c.code === selectedCode;
              const isFav = favorites.includes(c.code);

              return (
                <button
                  key={c.code}
                  onClick={() => {
                    onSelect(c);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                    isSelected
                      ? 'bg-emerald-500/10 border border-emerald-500/30'
                      : 'hover:bg-slate-800/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl select-none" role="img" aria-label={c.name}>
                      {c.flag}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm">{c.code}</span>
                        <span className="text-xs text-slate-400">({c.symbol})</span>
                        {c.code === 'SGD' && (
                          <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            Base
                          </span>
                        )}
                        {c.masUnit === 100 && (
                          <span className="text-[10px] px-1 rounded bg-sky-950 text-sky-300 border border-sky-800/50">
                            MAS 100
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span>{c.name}</span>
                        <span aria-hidden="true">·</span>
                        <span>{c.country}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isFav && (
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    )}
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
