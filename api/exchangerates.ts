/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Request, Response } from 'express';

const MAS_BASE_URL =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily';

export interface MasExchangeRatesResponse {
  success: boolean;
  source: string;
  queryDate: string;
  timestamp: string;
  rates?: Record<string, number>;
  raw?: any;
  error?: string;
  code?: string;
  hint?: string;
}

/**
 * Calculates a reasonable default date in SGT (Singapore Time UTC+8) in YYYY-MM-DD format.
 * If today is Sunday/Saturday, step back to Friday to match daily financial reporting.
 */
function getDefaultSgtDate(): string {
  const now = new Date();
  // Adjust to SGT (UTC+8)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const sgtDate = new Date(utc + 8 * 3600000);

  // If weekend, adjust to previous Friday
  const day = sgtDate.getDay();
  if (day === 0) {
    // Sunday -> Friday (-2 days)
    sgtDate.setDate(sgtDate.getDate() - 2);
  } else if (day === 6) {
    // Saturday -> Friday (-1 day)
    sgtDate.setDate(sgtDate.getDate() - 1);
  }

  const yyyy = sgtDate.getFullYear();
  const mm = String(sgtDate.getMonth() + 1).padStart(2, '0');
  const dd = String(sgtDate.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Maps raw MAS response field keys to currency codes and standard 1-unit SGD conversion rates.
 */
function parseMasRates(record: Record<string, any>): Record<string, number> {
  const rates: Record<string, number> = {};

  // Standard fields from MAS exchange_rates_end_of_period_daily
  const fieldMapping: Record<string, { code: string; isPer100: boolean }> = {
    usd_sgd: { code: 'USD', isPer100: false },
    gbp_sgd: { code: 'GBP', isPer100: false },
    eur_sgd: { code: 'EUR', isPer100: false },
    aud_sgd: { code: 'AUD', isPer100: false },
    cad_sgd: { code: 'CAD', isPer100: false },
    chf_sgd: { code: 'CHF', isPer100: false },
    nzd_sgd: { code: 'NZD', isPer100: false },
    // Asian currencies quoted per 100 units in MAS dataset
    myr_sgd_100: { code: 'MYR', isPer100: true },
    '100myr_sgd': { code: 'MYR', isPer100: true },
    jpy_sgd_100: { code: 'JPY', isPer100: true },
    '100jpy_sgd': { code: 'JPY', isPer100: true },
    thb_sgd_100: { code: 'THB', isPer100: true },
    '100thb_sgd': { code: 'THB', isPer100: true },
    idr_sgd_100: { code: 'IDR', isPer100: true },
    '100idr_sgd': { code: 'IDR', isPer100: true },
    cny_sgd_100: { code: 'CNY', isPer100: true },
    '100cny_sgd': { code: 'CNY', isPer100: true },
    hkd_sgd_100: { code: 'HKD', isPer100: true },
    '100hkd_sgd': { code: 'HKD', isPer100: true },
    krw_sgd_100: { code: 'KRW', isPer100: true },
    '100krw_sgd': { code: 'KRW', isPer100: true },
    twd_sgd_100: { code: 'TWD', isPer100: true },
    '100twd_sgd': { code: 'TWD', isPer100: true },
    inr_sgd_100: { code: 'INR', isPer100: true },
    '100inr_sgd': { code: 'INR', isPer100: true },
    php_sgd_100: { code: 'PHP', isPer100: true },
    '100php_sgd': { code: 'PHP', isPer100: true },
    vnd_sgd_100: { code: 'VND', isPer100: true },
    '100vnd_sgd': { code: 'VND', isPer100: true },
    aed_sgd_100: { code: 'AED', isPer100: true },
    '100aed_sgd': { code: 'AED', isPer100: true },
    sar_sgd_100: { code: 'SAR', isPer100: true },
    '100sar_sgd': { code: 'SAR', isPer100: true },
  };

  for (const [key, value] of Object.entries(record)) {
    const cleanKey = key.toLowerCase().trim();
    const config = fieldMapping[cleanKey];
    if (config) {
      const numVal = parseFloat(value);
      if (!isNaN(numVal) && numVal > 0) {
        // Convert to 1 foreign unit = X SGD
        rates[config.code] = config.isPer100 ? numVal / 100 : numVal;
      }
    }
  }

  return rates;
}

/**
 * Serverless / Express handler for GET /api/exchangerates
 */
export default async function handler(req: Request, res: Response) {
  try {
    // Read KeyId from environment variables (never hardcoded)
    const masKeyId =
      process.env.MAS_KEY_ID ||
      process.env.MAS_API_KEY ||
      (req.headers['x-mas-key-id'] as string) ||
      '';

    // Allow user to specify end_of_day query parameter e.g. ?end_of_day=2026-10-14
    const requestedDate =
      (req.query?.end_of_day as string) ||
      (req.query?.date as string) ||
      getDefaultSgtDate();

    // Verify key exists
    if (!masKeyId || masKeyId.trim().length === 0) {
      const missingKeyPayload: MasExchangeRatesResponse = {
        success: false,
        source: 'Monetary Authority of Singapore (MAS)',
        queryDate: requestedDate,
        timestamp: new Date().toISOString(),
        error: 'MAS_KEY_ID environment variable is not configured.',
        code: 'MISSING_MAS_KEY_ID',
        hint: 'Please set MAS_KEY_ID in your environment variables or provide x-mas-key-id header.',
      };

      if (res && typeof res.status === 'function') {
        return res.status(401).json(missingKeyPayload);
      }

      return new Response(JSON.stringify(missingKeyPayload), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Construct full MAS API endpoint URL
    const targetUrl = new URL(MAS_BASE_URL);
    targetUrl.searchParams.set('end_of_day', requestedDate);

    // Call live MAS API catalogue
    const masResponse = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        KeyId: masKeyId.trim(),
        Accept: 'application/json',
        'User-Agent': 'SGFXLive-CurrencyConverter/1.0',
      },
    });

    if (!masResponse.ok) {
      const errorText = await masResponse.text();
      const errorPayload: MasExchangeRatesResponse = {
        success: false,
        source: 'Monetary Authority of Singapore (MAS)',
        queryDate: requestedDate,
        timestamp: new Date().toISOString(),
        error: `MAS API responded with status ${masResponse.status}: ${errorText || masResponse.statusText}`,
        code: 'MAS_GATEWAY_ERROR',
      };

      if (res && typeof res.status === 'function') {
        return res.status(masResponse.status).json(errorPayload);
      }

      return new Response(JSON.stringify(errorPayload), {
        status: masResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const masJson = await masResponse.json();

    // MAS results typically return under result.records or root array/object
    let rawRecords = masJson?.result?.records || masJson?.records || masJson;
    let primaryRecord: Record<string, any> = {};

    if (Array.isArray(rawRecords) && rawRecords.length > 0) {
      primaryRecord = rawRecords[0];
    } else if (rawRecords && typeof rawRecords === 'object') {
      primaryRecord = rawRecords;
    }

    const parsedRates = parseMasRates(primaryRecord);

    const successPayload: MasExchangeRatesResponse = {
      success: true,
      source: 'Monetary Authority of Singapore (MAS) - Monthly Statistical Bulletin',
      queryDate: requestedDate,
      timestamp: new Date().toISOString(),
      rates: parsedRates,
      raw: masJson,
    };

    if (res && typeof res.status === 'function') {
      return res.status(200).json(successPayload);
    }

    return new Response(JSON.stringify(successPayload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    const failPayload: MasExchangeRatesResponse = {
      success: false,
      source: 'Monetary Authority of Singapore (MAS)',
      queryDate: (req.query?.end_of_day as string) || getDefaultSgtDate(),
      timestamp: new Date().toISOString(),
      error: error?.message || 'Failed to fetch live exchange rates from MAS API',
      code: 'INTERNAL_FETCH_ERROR',
    };

    if (res && typeof res.status === 'function') {
      return res.status(500).json(failPayload);
    }

    return new Response(JSON.stringify(failPayload), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
