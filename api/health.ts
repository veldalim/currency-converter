/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Request, Response } from 'express';

export interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  sgtTime: string;
  uptimeSeconds: number;
  environment: string;
  masGateway: {
    endpoint: string;
    isKeyConfigured: boolean;
    keyIdPreview?: string;
  };
}

const startTime = Date.now();

/**
 * Serverless / Express handler for GET /api/health
 */
export default async function handler(req: Request, res: Response) {
  try {
    const masKey = process.env.MAS_KEY_ID || process.env.MAS_API_KEY || '';
    const isKeyConfigured = Boolean(masKey && masKey.trim().length > 0);

    const now = new Date();
    const sgtFormatted = new Intl.DateTimeFormat('en-SG', {
      timeZone: 'Asia/Singapore',
      dateStyle: 'full',
      timeStyle: 'long',
    }).format(now);

    const data: HealthResponse = {
      status: 'ok',
      timestamp: now.toISOString(),
      sgtTime: sgtFormatted,
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      environment: process.env.NODE_ENV || 'development',
      masGateway: {
        endpoint: 'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily',
        isKeyConfigured,
        keyIdPreview: isKeyConfigured ? `${masKey.slice(0, 4)}...${masKey.slice(-4)}` : undefined,
      },
    };

    if (res && typeof res.status === 'function') {
      return res.status(200).json(data);
    }
    
    // In Edge/Web Fetch standard environments
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    const errorData = {
      status: 'degraded',
      error: error?.message || 'Internal health check failure',
      timestamp: new Date().toISOString(),
    };

    if (res && typeof res.status === 'function') {
      return res.status(500).json(errorData);
    }

    return new Response(JSON.stringify(errorData), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
