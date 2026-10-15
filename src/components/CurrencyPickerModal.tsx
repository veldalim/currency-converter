import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Check, Star, Globe, Sparkles, Filter } from 'lucide-react';
import { CURRENCIES, Currency, CurrencyRegion } from '../data/currencies';

export type CategoryFilter = 'All' | 'Favorites' | 'Asia' | 'Europe' | 'Americas' | 'Oceania & Others';

interface CurrencyPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCode: string;
  onSelectCurrency: (currency: Currency) => void;
  rates: Record<string, number>;
  customOverrides: Record<string, number>;
}

const FAVORITES_STORAGE_KEY = 'singarate_favorites_v1';

export const CurrencyPickerModal: React.FC<CurrencyPickerModalProps> = ({
  isOpen,
  onClose,
  selectedCode,
  onSelectCurrency,
  rates,
  customOverrides,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [favoriteCodes, setFavoriteCodes] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    // Default favorites for Singapore users
    return ['MYR', 'JPY', 'THB', 'IDR', 'USD', 'EUR', 'KRW', 'TWD', 'HKD', 'CNY', 'GBP', 'AUD', 'BND'];
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync favorites to local storage
  const handleToggleFavorite = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteCodes((prev) => {
      const exists = prev.includes(code);
      const next = exists ? prev.filter((c) => c !== code) : [...prev, code];
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Category matching helper
  const matchesCategory = (c: Currency, cat: CategoryFilter): boolean => {
    if (cat === 'All') return true;
    if (cat === 'Favorites') return favoriteCodes.includes(c.code) || Boolean(c.popular);
    if (cat === 'Asia') return c.region === 'Asia';
    if (cat === 'Europe') return c.region === 'Europe';
    if (cat === 'Americas') return c.region === 'Americas';
    if (cat === 'Oceania & Others') {
      return c.region === 'Oceania' || c.region === 'Middle East' || c.region === 'Africa';
    }
    return true;
  };

  // Compute category counts for tab badges
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilter, number> = {
      All: CURRENCIES.length,
      Favorites: CURRENCIES.filter((c) => favoriteCodes.includes(c.code) || c.popular).length,
      Asia: CURRENCIES.filter((c) => c.region === 'Asia').length,
      Europe: CURRENCIES.filter((c) => c.region === 'Europe').length,
      Americas: CURRENCIES.filter((c) => c.region === 'Americas').length,
      'Oceania & Others': CURRENCIES.filter(
        (c) => c.region === 'Oceania' || c.region === 'Middle East' || c.region === 'Africa'
      ).length,
    };
    return counts;
  }, [favoriteCodes]);

  // Main filtered & sorted currencies
  const filteredCurrencies = useMemo(() => {
    const query = search.trim().toLowerCase();

    return CURRENCIES.filter((c) => {
      // 1. Category check
      if (!matchesCategory(c, activeCategory)) {
        return false;
      }

      // 2. Search query check
      if (!query) return true;

      const codeMatch = c.code.toLowerCase().includes(query);
      const nameMatch = c.name.toLowerCase().includes(query);
      const countryMatch = c.country.toLowerCase().includes(query);
      const tagMatch = Boolean(c.travelTag && c.travelTag.toLowerCase().includes(query));
      const symbolMatch = c.symbol.toLowerCase() === query;

      // Common regional search aliases
      const aliasMatch =
        (query === 'ringgit' && c.code === 'MYR') ||
        (query === 'yen' && c.code === 'JPY') ||
        (query === 'baht' && c.code === 'THB') ||
        (query === 'won' && c.code === 'KRW') ||
        (query === 'rupiah' && c.code === 'IDR') ||
        (query === 'dong' && c.code === 'VND') ||
        (query === 'yuan' && c.code === 'CNY') ||
        (query === 'pound' && c.code === 'GBP') ||
        (query === 'brunei' && c.code === 'BND') ||
        (query === 'dollar' && (c.code === 'USD' || c.code === 'CAD' || c.code === 'AUD' || c.code === 'NZD' || c.code === 'HKD' || c.code === 'TWD' || c.code === 'BND'));

      return codeMatch || nameMatch || countryMatch || tagMatch || symbolMatch || aliasMatch;
    }).sort((a, b) => {
      // If browsing 'Favorites' or 'All' without search, prioritize favorites/selected
      const aFav = favoriteCodes.includes(a.code) ? 1 : 0;
      const bFav = favoriteCodes.includes(b.code) ? 1 : 0;
      if (aFav !== bFav && activeCategory === 'Favorites') {
        return bFav - aFav;
      }
      return 0;
    });
  }, [search, activeCategory, favoriteCodes]);

  if (!isOpen) return null;

  const categories: { key: CategoryFilter; label: string }[] = [
    { key: 'All', label: 'All' },
    { key: 'Favorites', label: 'Favorites' },
    { key: 'Asia', label: 'Asia' },
    { key: 'Europe', label: 'Europe' },
    { key: 'Americas', label: 'Americas' },
    { key: 'Oceania & Others', label: 'Oceania & Others' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/45 backdrop-blur-sm transition-opacity">
      <div 
        className="w-full sm:max-w-xl max-h-[88vh] sm:max-h-[82vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-currency-title"
      >
        {/* Mobile handle indicator */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <h2 id="modal-currency-title" className="text-lg font-bold text-slate-900 tracking-tight">
              Select Foreign Currency
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live conversion into Singapore Dollars (SGD)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar Section */}
        <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code (MYR, JPY), city (JB, Tokyo), or name..."
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filtering Tabs (Segmented control) */}
        <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/40 overflow-x-auto scrollbar-none flex items-center gap-1.5">
          {categories.map(({ key, label }) => {
            const isTabActive = activeCategory === key;
            const count = categoryCounts[key];

            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
                  isTabActive
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {key === 'Favorites' && (
                  <Star
                    className={`w-3 h-3 ${isTabActive ? 'text-amber-300 fill-amber-300' : 'text-amber-500 fill-amber-500'}`}
                  />
                )}
                <span>{label}</span>
                <span
                  className={`text-[10px] font-mono tabular-nums ${
                    isTabActive ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results Counter / Filter status */}
        <div className="px-4 py-1.5 bg-slate-50/20 border-b border-slate-100/60 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            {search ? (
              <>Found <strong className="font-semibold text-slate-800">{filteredCurrencies.length}</strong> matching "{search}"</>
            ) : (
              <>Showing <strong className="font-semibold text-slate-800">{filteredCurrencies.length}</strong> {activeCategory} currencies</>
            )}
          </span>
          <span className="text-slate-400">Tap ★ to pin favorites</span>
        </div>

        {/* Currencies List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredCurrencies.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <Globe className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No matching currencies</p>
              <p className="text-xs text-slate-400 mt-1">
                {search
                  ? `No results found for "${search}" in ${activeCategory}.`
                  : `No currencies currently in ${activeCategory}.`}
              </p>
              {(search || activeCategory !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setActiveCategory('All');
                  }}
                  className="mt-3 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                >
                  Reset Search & Filters
                </button>
              )}
            </div>
          ) : (
            filteredCurrencies.map((c) => {
              const isSelected = selectedCode === c.code;
              const isFav = favoriteCodes.includes(c.code);
              const currentRate = customOverrides[c.code] || rates[c.code] || c.defaultRatePerSGD;
              const hasOverride = Boolean(customOverrides[c.code]);

              return (
                <div
                  key={c.code}
                  onClick={() => {
                    onSelectCurrency(c);
                    onClose();
                  }}
                  className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors cursor-pointer hover:bg-slate-50 group ${
                    isSelected ? 'bg-rose-50/50' : ''
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelectCurrency(c);
                      onClose();
                    }
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Star favorite trigger */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(c.code, e)}
                      className="p-1 -ml-1 text-slate-300 hover:text-amber-500 rounded-md transition-colors cursor-pointer shrink-0"
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      aria-label={`${isFav ? 'Unstar' : 'Star'} ${c.code}`}
                    >
                      <Star
                        className={`w-4 h-4 transition-transform active:scale-125 ${
                          isFav ? 'text-amber-500 fill-amber-500' : 'text-slate-300 hover:text-amber-400'
                        }`}
                      />
                    </button>

                    {/* Flag */}
                    <span className="text-2xl shrink-0" role="img" aria-label={c.country}>
                      {c.flag}
                    </span>

                    {/* Code & Names */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{c.code}</span>
                        <span className="text-xs text-slate-400 font-normal">·</span>
                        <span className="text-xs text-slate-600 truncate">{c.name}</span>
                        {hasOverride && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1 rounded font-mono font-medium">
                            Cash
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        {c.travelTag || `${c.country} (${c.region})`}
                      </div>
                    </div>
                  </div>

                  {/* Rates */}
                  <div className="text-right shrink-0 ml-3">
                    <div className="text-xs font-mono font-medium text-slate-700 tabular-nums">
                      1 SGD = {currentRate.toLocaleString('en-SG', { maximumFractionDigits: 4 })} {c.code}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                      1 {c.code} ≈ S${(1 / currentRate).toFixed(4)}
                    </div>
                  </div>

                  {/* Selected check indicator */}
                  {isSelected && (
                    <div className="ml-2 pl-2 border-l border-slate-200 shrink-0">
                      <Check className="w-4 h-4 text-rose-600" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Rates are cached for reliable offline usage</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
