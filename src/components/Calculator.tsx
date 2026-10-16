/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useId } from 'react';
import { 
  ArrowUpDown, 
  Copy, 
  Check, 
  ChevronDown, 
  Calculator as CalcIcon, 
  Percent, 
  DollarSign, 
  Info,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { BASE_SGD_CURRENCY, SUPPORTED_CURRENCIES } from '../data/singaporeCurrencies';
import { Currency, RateData } from '../types/currency';
import { RatesService } from '../services/ratesService';
import { CurrencySelectModal } from './CurrencySelectModal';

interface CalculatorProps {
  rates: Record<string, RateData>;
  favorites: string[];
  activeFromCurrency?: Currency;
  activeToCurrency?: Currency;
  onCurrencySelect?: (from: Currency, to: Currency) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({
  rates,
  favorites,
}) => {
  const [fromCurrency, setFromCurrency] = useState<Currency>(BASE_SGD_CURRENCY);
  const [toCurrency, setToCurrency] = useState<Currency>(
    SUPPORTED_CURRENCIES.find((c) => c.code === 'MYR') || SUPPORTED_CURRENCIES[0]
  );
  const [amountStr, setAmountStr] = useState<string>('100');
  const [isKeypadOpen, setIsKeypadOpen] = useState<boolean>(false);
  const [includeSgGst, setIncludeSgGst] = useState<boolean>(false); // +9% SG GST
  const [modalTarget, setModalTarget] = useState<'from' | 'to' | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewSavings, setViewSavings] = useState<boolean>(false);

  const amountInputId = useId();

  // Parse amount cleanly
  const rawAmount = parseFloat(amountStr) || 0;
  const effectiveAmount = includeSgGst ? rawAmount * 1.09 : rawAmount;

  // Perform conversion
  const conversion = RatesService.convert(
    effectiveAmount,
    fromCurrency.code,
    toCurrency.code,
    rates
  );

  // Swap currencies
  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  // Quick amount presets
  const presetAmounts = [50, 100, 500, 1000, 2500, 5000];

  const handleCopy = () => {
    const text = `${effectiveAmount.toLocaleString()} ${fromCurrency.code} = ${formatNumber(
      conversion.result,
      toCurrency.code
    )} ${toCurrency.code} (Rate: 1 ${fromCurrency.code} = ${formatRate(conversion.rateDirect)} ${toCurrency.code})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format currency output depending on value
  function formatNumber(val: number, code: string): string {
    if (code === 'IDR' || code === 'VND' || code === 'KRW') {
      return Math.round(val).toLocaleString('en-US');
    }
    if (val < 0.01) {
      return val.toFixed(6);
    }
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }

  function formatRate(rate: number): string {
    if (rate >= 100) return rate.toFixed(2);
    if (rate >= 1) return rate.toFixed(4);
    return rate.toFixed(6);
  }

  // Keypad actions
  const handleKeypadPress = (val: string) => {
    if (val === 'C') {
      setAmountStr('0');
      return;
    }
    if (val === 'DEL') {
      setAmountStr((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
      return;
    }
    if (val === '.') {
      if (!amountStr.includes('.')) {
        setAmountStr((prev) => prev + '.');
      }
      return;
    }
    setAmountStr((prev) => (prev === '0' ? val : prev + val));
  };

  // Typical bank markup savings computation
  const targetRateData = rates[toCurrency.code];
  const bankMarkup = targetRateData?.bankMarkup ?? 2.8; // e.g. 2.8%
  const cashSpread = targetRateData?.moneyChangerSpread ?? 0.4; // e.g. 0.4%
  const bankLossInSgd = conversion.sgdEquivalent * (bankMarkup / 100);
  const moneyChangerLossInSgd = conversion.sgdEquivalent * (cashSpread / 100);
  const estimatedSavings = Math.max(0, bankLossInSgd - moneyChangerLossInSgd);

  // MAS 100 unit representation if applicable
  const isMas100Target = toCurrency.masUnit === 100;
  const masEquivalentQuote = isMas100Target
    ? (rates[toCurrency.code]?.rateToSgd ? rates[toCurrency.code].rateToSgd * 100 : 0)
    : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl shadow-black/30 relative overflow-hidden">
      {/* Decorative subtle ambient backdrop */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Title & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Currency Converter</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Real-time
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-currency calculations benchmarked against the Singapore Dollar (SGD)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Keypad toggle */}
          <button
            onClick={() => setIsKeypadOpen(!isKeypadOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              isKeypadOpen
                ? 'bg-slate-800 text-white border-slate-600'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            <CalcIcon className="w-3.5 h-3.5" />
            <span>Keypad</span>
          </button>

          {/* +9% SG GST toggle */}
          <button
            onClick={() => setIncludeSgGst(!includeSgGst)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              includeSgGst
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border-slate-800'
            }`}
            title="Toggle +9% Singapore Goods and Services Tax (GST) for shopping estimation"
          >
            <Receipt className="w-3.5 h-3.5 text-amber-400" />
            <span>+9% SG GST</span>
          </button>
        </div>
      </div>

      {/* Main Conversion Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-center relative z-10">
        
        {/* FROM BOX */}
        <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 transition-all focus-within:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor={amountInputId} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              You Send / Have
            </label>
            <button
              onClick={() => setModalTarget('from')}
              className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white font-bold text-sm transition-all"
            >
              <span className="text-lg select-none">{fromCurrency.flag}</span>
              <span>{fromCurrency.code}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-500 font-mono-nums select-none">
              {fromCurrency.symbol}
            </span>
            <input
              id={amountInputId}
              type="number"
              step="any"
              min="0"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-right text-2xl sm:text-3xl font-bold text-white font-mono-nums focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
            <span>{fromCurrency.name}</span>
            {includeSgGst && (
              <span className="text-amber-400 text-[11px] font-medium">
                Includes 9% GST (${(rawAmount * 0.09).toFixed(2)})
              </span>
            )}
          </div>
        </div>

        {/* SWAP BUTTON */}
        <div className="lg:col-span-2 flex justify-center py-1 sm:py-0">
          <button
            onClick={handleSwap}
            className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 text-slate-300 flex items-center justify-center shadow-lg transition-all transform hover:rotate-180 active:scale-95 group"
            title="Swap Currencies"
            aria-label="Swap Currencies"
          >
            <ArrowUpDown className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* TO BOX */}
        <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 transition-all focus-within:border-emerald-500/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              You Receive (Estimated)
            </span>
            <button
              onClick={() => setModalTarget('to')}
              className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white font-bold text-sm transition-all"
            >
              <span className="text-lg select-none">{toCurrency.flag}</span>
              <span>{toCurrency.code}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xl sm:text-2xl font-bold text-emerald-500/70 font-mono-nums select-none">
              {toCurrency.symbol}
            </span>
            <div className="text-right text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono-nums tracking-tight truncate">
              {formatNumber(conversion.result, toCurrency.code)}
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
            <span>{toCurrency.name}</span>
            <span className="text-slate-400 font-mono-nums">
              1 {fromCurrency.code} = {formatRate(conversion.rateDirect)} {toCurrency.code}
            </span>
          </div>
        </div>

      </div>

      {/* Preset Amounts & Copy Summary Bar */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 mr-1 font-medium flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-slate-500" /> Quick S$:
          </span>
          {presetAmounts.map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setFromCurrency(BASE_SGD_CURRENCY);
                setAmountStr(preset.toString());
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono-nums font-semibold transition-colors ${
                fromCurrency.code === 'SGD' && amountStr === preset.toString()
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              ${preset >= 1000 ? `${preset / 1000}k` : preset}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Result</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Optional Interactive Keypad */}
      {isKeypadOpen && (
        <div className="mt-4 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl max-w-sm mx-auto grid grid-cols-4 gap-2">
          {['7', '8', '9', 'C', '4', '5', '6', 'DEL', '1', '2', '3', '.', '0', '00', '+50', '+100'].map((btn) => (
            <button
              key={btn}
              onClick={() => {
                if (btn === '+50') setAmountStr((p) => ((parseFloat(p) || 0) + 50).toString());
                else if (btn === '+100') setAmountStr((p) => ((parseFloat(p) || 0) + 100).toString());
                else if (btn === '00') setAmountStr((p) => p + '00');
                else handleKeypadPress(btn);
              }}
              className="py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white font-mono-nums font-semibold rounded-xl text-sm border border-slate-800/80 transition-colors"
            >
              {btn}
            </button>
          ))}
        </div>
      )}

      {/* Singapore Context Rate Callouts & Money Changer Comparison */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10 text-xs">
        
        {/* MAS Benchmark Quote Notice */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <span>MAS Benchmark Indicator</span>
              {isMas100Target && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300">
                  Per 100 Units
                </span>
              )}
            </div>
            <p className="text-slate-400 mt-0.5">
              {isMas100Target && masEquivalentQuote ? (
                <>
                  Official MAS quoting standard: <strong className="text-white font-mono-nums">100 {toCurrency.code} = S$ {masEquivalentQuote.toFixed(2)}</strong>.
                </>
              ) : (
                <>
                  Rate pegged to MAS reference: <strong className="text-white font-mono-nums">1 {toCurrency.code} = S$ {rates[toCurrency.code]?.rateToSgd?.toFixed(4) || '--'}</strong>.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Singapore Travel / Money Changer Spread Estimator */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5">
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-200">
                Cash vs Bank Card FX Spread
              </div>
              <p className="text-slate-400 mt-0.5">
                Bank cards charge ~{bankMarkup}% vs Raffles Place / The Arcade cash changers (~{cashSpread}%).
                {estimatedSavings > 0.5 && (
                  <span className="text-emerald-400 font-medium ml-1">
                    Est. S${estimatedSavings.toFixed(2)} saved with cash!
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Currency Selection Modals */}
      <CurrencySelectModal
        isOpen={modalTarget === 'from'}
        onClose={() => setModalTarget(null)}
        onSelect={(cur) => setFromCurrency(cur)}
        selectedCode={fromCurrency.code}
        favorites={favorites}
        title="Select Source Currency"
      />

      <CurrencySelectModal
        isOpen={modalTarget === 'to'}
        onClose={() => setModalTarget(null)}
        onSelect={(cur) => setToCurrency(cur)}
        selectedCode={toCurrency.code}
        favorites={favorites}
        title="Select Target Currency"
      />
    </div>
  );
};
