/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  Star, 
  Grid3X3, 
  ListFilter, 
  ArrowUpDown, 
  Sparkles, 
  Info, 
  SlidersHorizontal,
  X,
  Compass,
  Building2,
  PlaneTakeoff,
  Landmark
} from 'lucide-react';
import { RatesService } from './services/ratesService';
import { MergedCurrency, QuoteDisplayMode, SortOption, Region } from './types/currency';
import { Navbar } from './components/Navbar';
import { Calculator } from './components/Calculator';
import { CurrencyCard } from './components/CurrencyCard';
import { CurrencyTable } from './components/CurrencyTable';
import { CurrencyDetailModal } from './components/CurrencyDetailModal';
import { MasApiModal } from './components/MasApiModal';

export default function App() {
  const [rates, setRates] = useState(RatesService.getRates());
  const [currencies, setCurrencies] = useState<MergedCurrency[]>([]);
  const [favorites, setFavorites] = useState<string[]>(RatesService.getFavorites());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'popular' | 'asean' | 'major'>('all');
  const [quoteMode, setQuoteMode] = useState<QuoteDisplayMode>('mas');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('popular');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(RatesService.getLastUpdatedTime());
  
  // Modals state
  const [selectedCurrencyForModal, setSelectedCurrencyForModal] = useState<MergedCurrency | null>(null);
  const [isMasModalOpen, setIsMasModalOpen] = useState<boolean>(false);

  const calculatorRef = useRef<HTMLDivElement>(null);

  // Sync currencies on mount or when rates update
  useEffect(() => {
    setCurrencies(RatesService.getAllMergedCurrencies());
  }, [rates]);

  // Periodic subtle live tick simulation every 15 seconds to simulate active foreign exchange market
  useEffect(() => {
    const timer = setInterval(() => {
      const updated = RatesService.refreshRates();
      setRates({ ...updated });
      setLastUpdated(RatesService.getLastUpdatedTime());
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  // Try fetching live rates from /api/exchangerates on mount
  useEffect(() => {
    RatesService.fetchLiveMasRates().then((res) => {
      if (res.success) {
        setRates({ ...RatesService.getRates() });
        setLastUpdated(RatesService.getLastUpdatedTime());
      }
    });
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const liveResult = await RatesService.fetchLiveMasRates();
      if (liveResult.success) {
        setRates({ ...RatesService.getRates() });
        setLastUpdated(RatesService.getLastUpdatedTime());
      } else {
        // Fallback simulation
        const updated = RatesService.refreshRates();
        setRates({ ...updated });
        setLastUpdated(RatesService.getLastUpdatedTime());
      }
    } catch {
      const updated = RatesService.refreshRates();
      setRates({ ...updated });
      setLastUpdated(RatesService.getLastUpdatedTime());
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleFavorite = (code: string) => {
    const updated = RatesService.toggleFavorite(code);
    setFavorites(updated);
  };

  const handleSelectForCalculator = (_currency: MergedCurrency) => {
    if (calculatorRef.current) {
      calculatorRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter and sort currencies
  const filteredCurrencies = useMemo(() => {
    return currencies.filter((c) => {
      // Tab filtering
      if (activeTab === 'favorites' && !favorites.includes(c.code)) return false;
      if (activeTab === 'popular' && !c.isPopularInSg) return false;
      if (activeTab === 'asean' && c.region !== 'ASEAN') return false;
      if (activeTab === 'major' && c.region !== 'Major FX') return false;

      // Search term filtering
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        c.code.toLowerCase().includes(term) ||
        c.name.toLowerCase().includes(term) ||
        c.country.toLowerCase().includes(term) ||
        c.symbol.toLowerCase().includes(term) ||
        c.region.toLowerCase().includes(term)
      );
    }).sort((a, b) => {
      switch (sortOption) {
        case 'code-asc':
          return a.code.localeCompare(b.code);
        case 'change-desc':
          return b.change24h - a.change24h;
        case 'change-asc':
          return a.change24h - b.change24h;
        case 'rate-desc':
          return b.rateToSgd - a.rateToSgd;
        case 'rate-asc':
          return a.rateToSgd - b.rateToSgd;
        case 'popular':
        default:
          if (a.isPopularInSg && !b.isPopularInSg) return -1;
          if (!a.isPopularInSg && b.isPopularInSg) return 1;
          return a.code.localeCompare(b.code);
      }
    });
  }, [currencies, activeTab, favorites, searchTerm, sortOption]);

  const favoritesCount = favorites.length;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Top Navbar */}
      <Navbar
        rates={rates}
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        onOpenMasModal={() => setIsMasModalOpen(true)}
        lastUpdated={lastUpdated}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-8">
        
        {/* Converter / Calculator Section */}
        <section ref={calculatorRef} className="scroll-mt-20">
          <Calculator
            rates={rates}
            favorites={favorites}
          />
        </section>

        {/* Currency Explorer & Rates Monitor */}
        <section className="space-y-4">
          
          {/* Header Row: Title & View Mode Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  Singapore Dollar (SGD) Cross Rates
                </h3>
                <span className="text-xs text-slate-400">
                  ({filteredCurrencies.length} currencies)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Monetary Authority of Singapore (MAS) reference and financial market quotes
              </p>
            </div>

            {/* Quick Quotation Mode & View Mode Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* MAS 100 Unit Toggle */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setQuoteMode('mas')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    quoteMode === 'mas'
                      ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="MAS convention quotes Asian currencies per 100 units (e.g. 100 JPY, 100 MYR, 100 THB)"
                >
                  MAS 100-Unit
                </button>
                <button
                  onClick={() => setQuoteMode('unit')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    quoteMode === 'unit'
                      ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Standard 1:1 single unit conversion"
                >
                  1:1 Unit
                </button>
              </div>

              {/* Grid vs Table View */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Grid Cards View"
                  aria-label="Grid Cards View"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'table'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Compact Table View"
                  aria-label="Compact Table View"
                >
                  <ListFilter className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

          {/* Search, Filter Tabs & Sort Controls */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search currency, code, country (e.g. Ringgit, MYR, Yen, USD)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
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

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-400 hidden sm:inline">Sort:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-slate-700"
                >
                  <option value="popular">Most Popular in SG</option>
                  <option value="code-asc">Currency Code (A-Z)</option>
                  <option value="change-desc">24h Gainers (High to Low)</option>
                  <option value="change-asc">24h Losers (Low to High)</option>
                  <option value="rate-desc">Rate in SGD (Highest First)</option>
                  <option value="rate-asc">Rate in SGD (Lowest First)</option>
                </select>
              </div>

            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
                }`}
              >
                All Currencies ({currencies.length})
              </button>

              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'favorites'
                    ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Favorites ({favoritesCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('popular')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'popular'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Top SG Pairs</span>
              </button>

              <button
                onClick={() => setActiveTab('asean')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'asean'
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                <span>ASEAN Regional</span>
              </button>

              <button
                onClick={() => setActiveTab('major')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'major'
                    ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Major Global FX</span>
              </button>
            </div>
          </div>

          {/* Results Render: Cards Grid or Table */}
          {filteredCurrencies.length === 0 ? (
            <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">No Currencies Found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No exchange rate pair matched &quot;{searchTerm}&quot;. Try searching for code (e.g. MYR, JPY) or clear your filter.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveTab('all');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCurrencies.map((currency) => (
                <CurrencyCard
                  key={currency.code}
                  currency={currency}
                  isFavorite={favorites.includes(currency.code)}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenDetails={(c) => setSelectedCurrencyForModal(c)}
                  onQuickConvert={handleSelectForCalculator}
                  quoteMode={quoteMode}
                />
              ))}
            </div>
          ) : (
            <CurrencyTable
              currencies={filteredCurrencies}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onOpenDetails={(c) => setSelectedCurrencyForModal(c)}
              onQuickConvert={handleSelectForCalculator}
              quoteMode={quoteMode}
            />
          )}

        </section>

        {/* Singapore Financial FX Context / Travel Guide */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Landmark className="w-4 h-4 text-sky-400" />
              <h4>MAS Benchmark Standards</h4>
            </div>
            <p className="text-slate-400 leading-relaxed">
              The Monetary Authority of Singapore (MAS) compiles daily representative exchange rates. In Singapore markets, currencies like JPY, MYR, THB, IDR, and KRW are conventionally quoted per 100 units against the Singapore Dollar.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <PlaneTakeoff className="w-4 h-4 text-emerald-400" />
              <h4>Travel &amp; Money Changer Spreads</h4>
            </div>
            <p className="text-slate-400 leading-relaxed">
              For weekend trips across the Causeway to Johor Bahru or flights to Tokyo and Bangkok, money changers at The Arcade (Raffles Place) or People&apos;s Park typically offer spreads of 0.3% - 0.5% vs bank credit card FX fees (~2.5% - 3.5%).
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Building2 className="w-4 h-4 text-amber-400" />
              <h4>Singapore 9% GST Calculator</h4>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Use the built-in +9% SG GST toggle in the converter above to quickly figure out Singapore import duties or overseas price comparisons when buying electronics or luxury goods abroad.
            </p>
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/40 py-6 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">SG FX Live</span>
            <span aria-hidden="true">·</span>
            <span>Singapore Exchange Rates &amp; Currency Converter</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMasModalOpen(true)}
              className="text-sky-400 hover:underline"
            >
              MAS API Integration Setup
            </button>
            <span aria-hidden="true">·</span>
            <span>SGT UTC+8 Benchmark</span>
          </div>
        </div>
      </footer>

      {/* Currency Detail Modal */}
      <CurrencyDetailModal
        currency={selectedCurrencyForModal}
        isOpen={Boolean(selectedCurrencyForModal)}
        onClose={() => setSelectedCurrencyForModal(null)}
        isFavorite={selectedCurrencyForModal ? favorites.includes(selectedCurrencyForModal.code) : false}
        onToggleFavorite={handleToggleFavorite}
        onSelectForCalculator={handleSelectForCalculator}
      />

      {/* MAS API Configuration Modal */}
      <MasApiModal
        isOpen={isMasModalOpen}
        onClose={() => setIsMasModalOpen(false)}
        onRatesRefreshed={handleManualRefresh}
      />

    </div>
  );
}
