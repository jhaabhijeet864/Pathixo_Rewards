#!/usr/bin/env node

/**
 * Pathixo Rewards Health Check & Endpoint Diagnostics Utility
 * 
 * Usage:
 *   node scripts/health-check.mjs
 *   HEALTH_CHECK_URL=https://pathixorewards.com node scripts/health-check.mjs
 */

const BASE_URL = process.env.HEALTH_CHECK_URL || 'http://localhost:3000';

const ENDPOINTS_TO_CHECK = [
  {
    name: 'Web Landing Page',
    path: '/',
    method: 'GET',
    expectedStatus: 200,
    validate: (res, text) => text.includes('Pathixo') || text.includes('AI'),
  },
  {
    name: 'API Health Check (Deep)',
    path: '/api/health',
    method: 'GET',
    expectedStatus: 200,
    validate: (res, text, json) => json && json.status === 'healthy' && json.services?.selectors?.status === 'healthy',
  },
  {
    name: 'API Health Ping (Fast HEAD)',
    path: '/api/health',
    method: 'HEAD',
    expectedStatus: 200,
    validate: (res) => res.headers.get('x-health-check') === 'healthy',
  },
  {
    name: 'API Health Ping (Query)',
    path: '/api/health?check=ping',
    method: 'GET',
    expectedStatus: 200,
    validate: (res, text, json) => json && json.ping === 'pong',
  },
  {
    name: 'Remote Selectors Sync',
    path: '/api/config/selectors',
    method: 'GET',
    expectedStatus: 200,
    validate: (res, text, json) => json && json.domains && Object.keys(json.domains).length >= 5,
  },
  {
    name: 'Ad Bundle Delivery',
    path: '/api/ads/bundle?device_id=test_health_probe',
    method: 'GET',
    expectedStatus: 200,
    validate: (res, text, json) => json && Array.isArray(json.ads) && json.ads.length > 0,
  },
  {
    name: 'User Earnings Endpoint',
    path: '/api/user/earnings?device_id=test_health_probe',
    method: 'GET',
    expectedStatus: 200,
    validate: (res, text, json) => json && json.status === 'ok' && json.earnings !== undefined,
  },
  {
    name: 'Impression Processor GET',
    path: '/api/events/impression',
    method: 'GET',
    expectedStatus: 200,
    validate: (res, text, json) => json && typeof json.total_verified_impressions === 'number',
  },
  {
    name: 'Advertiser Campaigns GET',
    path: '/api/campaigns',
    method: 'GET',
    expectedStatus: 200,
    validate: (res, text, json) => json && json.status === 'ok',
  },
];

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

async function runCheck() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}=== Pathixo Rewards Health Check Diagnostics ===${COLORS.reset}`);
  console.log(`${COLORS.dim}Target Host: ${BASE_URL}${COLORS.reset}\n`);

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const item of ENDPOINTS_TO_CHECK) {
    const url = `${BASE_URL}${item.path}`;
    const start = performance.now();
    let status = 'FAIL';
    let duration = 0;
    let detail = '';

    try {
      const res = await fetch(url, {
        method: item.method,
        headers: {
          'User-Agent': 'PathixoHealthProbe/1.0 (+https://pathixorewards.com)',
        },
      });

      duration = Math.round(performance.now() - start);

      if (res.status !== item.expectedStatus) {
        detail = `HTTP ${res.status} (expected ${item.expectedStatus})`;
      } else {
        let text = '';
        let json = null;

        if (item.method !== 'HEAD') {
          text = await res.text();
          try {
            json = JSON.parse(text);
          } catch {
            // Not JSON
          }
        }

        const valid = item.validate ? item.validate(res, text, json) : true;
        if (valid) {
          status = 'PASS';
          passed++;
        } else {
          detail = 'Validation rule failed on payload content';
        }
      }
    } catch (err) {
      duration = Math.round(performance.now() - start);
      detail = err instanceof Error ? err.message : String(err);
    }

    if (status === 'FAIL') {
      failed++;
    }

    results.push({ name: item.name, path: item.path, status, duration, detail });

    const statusBadge =
      status === 'PASS'
        ? `${COLORS.green}✔ PASS${COLORS.reset}`
        : `${COLORS.red}✖ FAIL${COLORS.reset}`;

    const timingBadge = `${COLORS.dim}(${duration}ms)${COLORS.reset}`;
    const note = detail ? ` ${COLORS.yellow}[${detail}]${COLORS.reset}` : '';

    console.log(`  ${statusBadge}  ${item.name.padEnd(30)} ${item.path.padEnd(35)} ${timingBadge}${note}`);
  }

  console.log(`\n${COLORS.dim}------------------------------------------------------------${COLORS.reset}`);
  const summaryColor = failed === 0 ? COLORS.green : COLORS.red;
  console.log(
    `${COLORS.bold}Summary:${COLORS.reset} ${summaryColor}${passed} passed, ${failed} failed${COLORS.reset} of ${ENDPOINTS_TO_CHECK.length} checks.\n`
  );

  if (failed > 0) {
    console.error(`${COLORS.red}Health check detected failures. Ensure web service is running on ${BASE_URL}.${COLORS.reset}`);
    process.exit(1);
  } else {
    console.log(`${COLORS.green}All systems operational and within specifications.${COLORS.reset}\n`);
    process.exit(0);
  }
}

runCheck().catch((err) => {
  console.error('Fatal health check error:', err);
  process.exit(1);
});
