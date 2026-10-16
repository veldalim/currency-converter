/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Region = 'ASEAN' | 'East Asia' | 'Major FX' | 'South Asia' | 'Middle East' | 'Oceania' | 'Europe';

export interface Currency {
  code: string;           // e.g. "MYR"
  name: string;           // e.g. "Malaysian Ringgit"
  country: string;        // e.g. "Malaysia"
  flag: string;           // Emoji flag e.g. "🇲🇾"
  symbol: string;         // e.g. "RM"
  region: Region;
  isPopularInSg: boolean; // Frequently traded or traveled to from Singapore
  masUnit: 1 | 100;       // Standard MAS quote unit (100 for JPY, MYR, THB, IDR, KRW, TWD, INR, PHP, VND; 1 for USD, EUR, etc.)
  masDescription?: string;// Official MAS series title if applicable
}

export interface RateData {
  code: string;
  rateToSgd: number;       // How many SGD is 1 unit of this currency (e.g., 1 USD = 1.315 SGD, 1 MYR = 0.287 SGD)
  rateFromSgd: number;     // How many foreign units is 1 SGD (e.g., 1 SGD = 3.484 MYR)
  change24h: number;       // Percentage change over 24h e.g. +0.32% or -0.15%
  dayHigh: number;         // 24h high in SGD
  dayLow: number;          // 24h low in SGD
  history7d: number[];     // 7 recent data points of rateToSgd for sparkline
  lastUpdated: string;     // ISO timestamp
  moneyChangerSpread: number; // Typical cash money changer spread percentage in Singapore (e.g. 0.4%)
  bankMarkup: number;      // Typical bank credit card FX markup in Singapore (e.g. 2.8%)
}

export interface MergedCurrency extends Currency, RateData {}

export type SortOption = 
  | 'popular' 
  | 'code-asc' 
  | 'change-desc' 
  | 'change-asc' 
  | 'rate-desc' 
  | 'rate-asc';

export type QuoteDisplayMode = 'unit' | 'mas'; // 'unit': 1 Foreign = X SGD, 'mas': respect 100 units for JPY/THB/IDR etc.

export interface ConversionRecord {
  fromCode: string;
  toCode: string;
  fromAmount: number;
  toAmount: number;
  timestamp: string;
}
