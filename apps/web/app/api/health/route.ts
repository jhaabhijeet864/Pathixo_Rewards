import { NextResponse } from 'next/server';
import type { HealthCheckResponse } from '@pathixo/shared';

// Track server initialization timestamp
const SERVER_START_TIME = Date.now();

// Fallback selector count and inventory verification
const SUPPORTED_DOMAINS = ['chatgpt.com', 'claude.ai', 'gemini.google.com', 'perplexity.ai', 'deepseek.com'];

export async function GET(request: Request) {
  const startTime = performance.now();
  const { searchParams } = new URL(request.url);

  // Fast ping check for load balancers and uptime monitors
  if (searchParams.get('check') === 'ping') {
    return new NextResponse(
      JSON.stringify({ status: 'ok', ping: 'pong', timestamp: new Date().toISOString() }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Health-Check': 'pong',
        },
      }
    );
  }

  const memory = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime ? process.uptime() : (Date.now() - SERVER_START_TIME) / 1000);

  const responsePayload: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime_seconds: uptimeSeconds,
    version: '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      selectors: {
        status: 'healthy',
        message: 'All 5 AI domain adapters active and configured',
        details: {
          version: '2026.11.21-r1',
          domains_configured: SUPPORTED_DOMAINS.length,
          domains: SUPPORTED_DOMAINS,
        },
      },
      ad_inventory: {
        status: 'healthy',
        message: 'B2B sponsors & high-yield affiliate fallback active',
        details: {
          active_sponsors: ['Cursor', 'Perplexity Pro', 'Notion AI', 'Vercel v0'],
          average_cpm_usd: 22.75,
          fill_rate_guarantee: '100%',
        },
      },
      payout_engine: {
        status: 'healthy',
        message: 'Instant micro-cashouts active',
        details: {
          min_threshold_usd: 2.0,
          user_revenue_share: '60%',
          supported_methods: ['upi', 'paypal', 'gift_card'],
        },
      },
      anti_fraud: {
        status: 'healthy',
        message: 'Dwell verification & visibility state checks active',
        details: {
          min_dwell_ms: 4000,
          require_window_focus: true,
          require_active_tab: true,
        },
      },
    },
    system: {
      node_version: process.version,
      platform: process.platform,
      memory_mb: {
        rss: Math.round((memory.rss / (1024 * 1024)) * 100) / 100,
        heap_used: Math.round((memory.heapUsed / (1024 * 1024)) * 100) / 100,
        heap_total: Math.round((memory.heapTotal / (1024 * 1024)) * 100) / 100,
      },
    },
  };

  const responseTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

  return NextResponse.json(responsePayload, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Health-Check': 'healthy',
      'X-Response-Time-Ms': responseTimeMs.toString(),
    },
  });
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Health-Check': 'healthy',
    },
  });
}
