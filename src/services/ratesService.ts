/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BASE_SGD_CURRENCY, DEFAULT_FAVORITES, INITIAL_RATES, SUPPORTED_CURRENCIES } from '../data/singaporeCurrencies';
import { MergedCurrency, RateData } from '../types/currency';

const FAVORITES_KEY = 'sg_fx_favorites_v1';
const RECENT_CONVERSIONS_KEY = 'sg_fx_recent_conversions_v1';
const MAS_CONFIG_KEY = 'sg_fx_mas_config_v1';

export interface MasApiConfig {
  endpoint: string;
  resourceId: string;
  apiKey: string;
  useLiveApi: boolean;
}

export const DEFAULT_MAS_CONFIG: MasApiConfig = {
  endpoint: 'https://eservices.mas.gov.sg/api/action/datastore/search.json',
  resourceId: '95932927-9e5c-44d0-ac7a-97491cf64547', // MAS Exchange Rates dataset
  apiKey: '',
  useLiveApi: false,
};

export class RatesService {
  private static ratesCache: Record<string, RateData> | null = null;
  private static lastUpdatedTime: string = new Date().toISOString();

  /**
   * Initializes or returns cached rates.
   */
  public static getRates(): Record<string, RateData> {
    if (this.ratesCache) {
      return this.ratesCache;
    }

    const rates: Record<string, RateData> = {};
    const now = new Date().toISOString();
    this.lastUpdatedTime = now;

    for (const [code, initial] of Object.entries(INITIAL_RATES)) {
      rates[code] = {
        code,
        rateToSgd: initial.rateToSgd,
        rateFromSgd: initial.rateFromSgd,
        change24h: initial.change24h,
        dayHigh: initial.dayHigh,
        dayLow: initial.dayLow,
        history7d: [...initial.history7d],
        lastUpdated: now,
        moneyChangerSpread: initial.moneyChangerSpread,
        bankMarkup: initial.bankMarkup,
      };
    }

    this.ratesCache = rates;
    return rates;
  }

  /**
   * Returns all supported currencies with their latest rate information merged.
   */
  public static getAllMergedCurrencies(): MergedCurrency[] {
    const rates = this.getRates();
    return SUPPORTED_CURRENCIES.map((currency) => {
      const rateInfo = rates[currency.code] || {
        code: currency.code,
        rateToSgd: 1,
        rateFromSgd: 1,
        change24h: 0,
        dayHigh: 1,
        dayLow: 1,
        history7d: [1, 1, 1, 1, 1, 1, 1],
        lastUpdated: this.lastUpdatedTime,
        moneyChangerSpread: 0.5,
        bankMarkup: 2.8,
      };

      return {
        ...currency,
        ...rateInfo,
      };
    });
  }

  /**
   * Simulates a live market tick or refreshes with slight micro-market fluctuations.
   */
  public static refreshRates(): Record<string, RateData> {
    const current = this.getRates();
    const updated: Record<string, RateData> = {};
    const now = new Date().toISOString();
    this.lastUpdatedTime = now;

    for (const [code, rate] of Object.entries(current)) {
      // Simulate real-world micro-variance (between -0.08% and +0.08%)
      const deltaPercent = (Math.random() - 0.49) * 0.0016;
      const newRateToSgd = +(rate.rateToSgd * (1 + deltaPercent)).toPrecision(6);
      const newRateFromSgd = +(1 / newRateToSgd).toPrecision(6);
      const newChange = +(rate.change24h + deltaPercent * 100).toFixed(2);
      
      const newHistory = [...rate.history7d.slice(1), newRateToSgd];

      updated[code] = {
        ...rate,
        rateToSgd: newRateToSgd,
        rateFromSgd: newRateFromSgd,
        change24h: newChange,
        dayHigh: Math.max(rate.dayHigh, newRateToSgd),
        dayLow: Math.min(rate.dayLow, newRateToSgd),
        history7d: newHistory,
        lastUpdated: now,
      };
    }

    this.ratesCache = updated;
    return updated;
  }

  /**
   * Converts an amount from one currency to another using SGD as cross-currency peg.
   */
  public static convert(
    amount: number,
    fromCode: string,
    toCode: string,
    rates: Record<string, RateData>
  ): {
    result: number;
    rateDirect: number;     // 1 From = X To
    rateInverse: number;    // 1 To = Y From
    sgdEquivalent: number;  // S$ value
  } {
    if (isNaN(amount) || amount < 0) {
      return { result: 0, rateDirect: 1, rateInverse: 1, sgdEquivalent: 0 };
    }

    // Step 1: Calculate amount in SGD
    let sgdAmount = 0;
    if (fromCode === 'SGD') {
      sgdAmount = amount;
    } else {
      const fromRate = rates[fromCode]?.rateToSgd || 1;
      sgdAmount = amount * fromRate;
    }

    // Step 2: Convert SGD to target currency
    let targetAmount = 0;
    if (toCode === 'SGD') {
      targetAmount = sgdAmount;
    } else {
      const toRate = rates[toCode]?.rateFromSgd || 1;
      targetAmount = sgdAmount * toRate;
    }

    // Direct exchange rate: 1 fromCode = ? toCode
    let rateDirect = 1;
    if (fromCode === toCode) {
      rateDirect = 1;
    } else if (fromCode === 'SGD') {
      rateDirect = rates[toCode]?.rateFromSgd || 1;
    } else if (toCode === 'SGD') {
      rateDirect = rates[fromCode]?.rateToSgd || 1;
    } else {
      const fromToSgd = rates[fromCode]?.rateToSgd || 1;
      const toFromSgd = rates[toCode]?.rateFromSgd || 1;
      rateDirect = fromToSgd * toFromSgd;
    }

    const rateInverse = rateDirect !== 0 ? 1 / rateDirect : 0;

    return {
      result: targetAmount,
      rateDirect,
      rateInverse,
      sgdEquivalent: sgdAmount,
    };
  }

  /**
   * Formats the MAS standard quotation.
   * MAS convention: Asian currencies typically quoted as S$ per 100 units.
   */
  public static formatMasQuote(
    currency: MergedCurrency,
    displayMode: 'unit' | 'mas' = 'mas'
  ): {
    label: string;
    value: string;
    subtext: string;
  } {
    if (displayMode === 'mas' && currency.masUnit === 100) {
      const quoteVal = (currency.rateToSgd * 100).toFixed(currency.code === 'IDR' || currency.code === 'VND' ? 5 : 2);
      return {
        label: `100 ${currency.code}`,
        value: `S$ ${quoteVal}`,
        subtext: `1 SGD = ${(1 / currency.rateToSgd).toFixed(currency.code === 'JPY' ? 2 : 2)} ${currency.code}`,
      };
    }

    // Standard 1 Unit quote
    let decimals = 4;
    if (currency.rateToSgd < 0.001) decimals = 7;
    else if (currency.rateToSgd < 0.1) decimals = 5;
    else if (currency.rateToSgd >= 1) decimals = 4;

    return {
      label: `1 ${currency.code}`,
      value: `S$ ${currency.rateToSgd.toFixed(decimals)}`,
      subtext: `1 SGD = ${currency.rateFromSgd.toFixed(currency.rateFromSgd > 100 ? 2 : 4)} ${currency.code}`,
    };
  }

  /**
   * Favorites management (persisted in localStorage)
   */
  public static getFavorites(): string[] {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return DEFAULT_FAVORITES;
  }

  public static toggleFavorite(code: string): string[] {
    const current = this.getFavorites();
    let updated: string[];
    if (current.includes(code)) {
      updated = current.filter((c) => c !== code);
    } else {
      updated = [...current, code];
    }
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch {
      // storage unavailable
    }
    return updated;
  }

  /**
   * MAS Configuration management for user to easily plug in backend/API keys later
   */
  public static getMasConfig(): MasApiConfig {
    try {
      const stored = localStorage.getItem(MAS_CONFIG_KEY);
      if (stored) {
        return { ...DEFAULT_MAS_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_MAS_CONFIG;
  }

  public static saveMasConfig(config: MasApiConfig): void {
    try {
      localStorage.setItem(MAS_CONFIG_KEY, JSON.stringify(config));
    } catch {
      // fallback
    }
  }

  public static getLastUpdatedTime(): string {
    return this.lastUpdatedTime;
  }

  /**
   * Checks the health and MAS Gateway configuration status of /api/health
   */
  public static async checkBackendHealth(): Promise<{
    isOnline: boolean;
    isKeyConfigured: boolean;
    keyIdPreview?: string;
    sgtTime?: string;
  }> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) {
        return { isOnline: false, isKeyConfigured: false };
      }
      const data = await res.json();
      return {
        isOnline: true,
        isKeyConfigured: Boolean(data?.masGateway?.isKeyConfigured),
        keyIdPreview: data?.masGateway?.keyIdPreview,
        sgtTime: data?.sgtTime,
      };
    } catch {
      return { isOnline: false, isKeyConfigured: false };
    }
  }

  /**
   * Attempts to fetch live daily exchange rates from /api/exchangerates
   */
  public static async fetchLiveMasRates(endOfDay?: string): Promise<{
    success: boolean;
    source?: string;
    rates?: Record<string, number>;
    error?: string;
    code?: string;
    hint?: string;
  }> {
    try {
      const url = endOfDay
        ? `/api/exchangerates?end_of_day=${encodeURIComponent(endOfDay)}`
        : '/api/exchangerates';

      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.success && data.rates) {
        const current = this.getRates();
        const updated: Record<string, RateData> = { ...current };
        const now = new Date().toISOString();
        this.lastUpdatedTime = now;

        for (const [code, newRateToSgd] of Object.entries(data.rates as Record<string, number>)) {
          if (updated[code]) {
            const oldRate = updated[code].rateToSgd;
            const changePercent = oldRate > 0 ? +(((newRateToSgd - oldRate) / oldRate) * 100).toFixed(2) : 0;
            const newRateFromSgd = +(1 / newRateToSgd).toPrecision(6);
            const history = [...updated[code].history7d.slice(1), newRateToSgd];

            updated[code] = {
              ...updated[code],
              rateToSgd: newRateToSgd,
              rateFromSgd: newRateFromSgd,
              change24h: changePercent !== 0 ? changePercent : updated[code].change24h,
              dayHigh: Math.max(updated[code].dayHigh, newRateToSgd),
              dayLow: Math.min(updated[code].dayLow, newRateToSgd),
              history7d: history,
              lastUpdated: now,
            };
          }
        }

        this.ratesCache = updated;
        return { success: true, source: data.source, rates: data.rates };
      }

      return {
        success: false,
        error: data.error || 'Failed to fetch MAS rates',
        code: data.code,
        hint: data.hint,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network error connecting to /api/exchangerates',
      };
    }
  }
}

