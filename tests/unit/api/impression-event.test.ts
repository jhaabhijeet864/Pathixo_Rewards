import { describe, it, expect } from 'vitest';
import { POST, GET } from '../../../apps/web/app/api/events/impression/route';
import type { ImpressionEvent } from '@pathixo/shared';

describe('API Route: /api/events/impression', () => {
  it('should accept qualified impressions with dwell >= 4000ms and credit $0.009 USD', async () => {
    const validEvent: ImpressionEvent = {
      event_id: 'evt_test_qual_01',
      ad_id: 'ad_cursor',
      ad_token: 'tok_valid_123',
      device_id: 'dev_test_01',
      timestamp: Date.now(),
      dwell_ms: 4500,
      ai_platform: 'chatgpt',
    };

    const req = new Request('http://localhost:3000/api/events/impression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: [validEvent] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.processed).toBe(1);
    expect(json.qualified_count).toBe(1);
    expect(json.disqualified_count).toBe(0);
    expect(json.credited_usd).toBe(0.009);
  });

  it('should disqualify impressions with dwell time < 4000ms', async () => {
    const shortEvent: ImpressionEvent = {
      event_id: 'evt_test_short_02',
      ad_id: 'ad_cursor',
      ad_token: 'tok_valid_123',
      device_id: 'dev_test_01',
      timestamp: Date.now(),
      dwell_ms: 2500, // Insufficient dwell
      ai_platform: 'claude',
    };

    const req = new Request('http://localhost:3000/api/events/impression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: [shortEvent] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.qualified_count).toBe(0);
    expect(json.disqualified_count).toBe(1);
    expect(json.disqualified[0].reason).toContain('Insufficient dwell time');
    expect(json.credited_usd).toBe(0);
  });

  it('should disqualify malformed events missing required fields', async () => {
    const malformedEvent = {
      event_id: 'evt_bad',
      // Missing ad_token and ai_platform
      dwell_ms: 5000,
    };

    const req = new Request('http://localhost:3000/api/events/impression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: [malformedEvent] }),
    });

    const res = await POST(req);
    const json = await res.json();
    expect(json.qualified_count).toBe(0);
    expect(json.disqualified_count).toBe(1);
    expect(json.disqualified[0].reason).toBe('Malformed payload');
  });

  it('should return recent events via GET', async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(typeof json.total_verified_impressions).toBe('number');
    expect(Array.isArray(json.recent)).toBe(true);
  });
});
