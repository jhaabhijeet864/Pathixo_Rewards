import { describe, it, expect } from 'vitest';
import { GET, POST } from '../../../apps/web/app/api/user/earnings/route';

describe('API Route: /api/user/earnings', () => {
  it('should return user balance, referral stats, and threshold status', async () => {
    const req = new Request('http://localhost:3000/api/user/earnings?device_id=dev_guest_123');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.device_id).toBe('dev_guest_123');
    expect(json.min_threshold_usd).toBe(2.0);
    expect(json.earnings).toBeDefined();
    expect(typeof json.earnings.balance_usd).toBe('number');
    expect(json.can_cashout).toBe(json.earnings.balance_usd >= 2.0);
    expect(json.referral_url).toContain('dev_guest_123');
  });

  it('should reject client-supplied balance manipulation and permit display history sync via POST', async () => {
    // 1. Client attempting to inject balance must be rejected
    const forgeryPayload = {
      device_id: 'dev_sync_test_999',
      email: 'syncuser@gmail.com',
      earnings: {
        balance_usd: 15.50, // Forged balance above cashout floor
      },
    };

    const forgeryReq = new Request('http://localhost:3000/api/user/earnings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(forgeryPayload),
    });

    const forgeryRes = await POST(forgeryReq);
    expect(forgeryRes.status).toBe(400);
    const forgeryJson = await forgeryRes.json();
    expect(forgeryJson.message).toBe('Client-supplied earnings are not accepted.');

    // 2. Legitimate display history sync (viewed_ads only) is permitted in test/development
    const historyPayload = {
      device_id: 'dev_sync_test_999',
      email: 'syncuser@gmail.com',
      viewed_ads: [
        {
          id: 'evt_sync_01',
          sponsor: 'KrocPDF',
          headline: 'Create PDFs 100% locally',
          model: 'Google Gemini 4 Argon',
          dwellSeconds: 4.8,
          earnedUsd: 0.00654,
          timestamp: Date.now(),
          verified: true,
        },
      ],
    };

    const postReq = new Request('http://localhost:3000/api/user/earnings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(historyPayload),
    });

    const postRes = await POST(postReq);
    expect(postRes.status).toBe(200);
    const postJson = await postRes.json();
    expect(postJson.status).toBe('ok');
    expect(postJson.viewed_ads.length).toBeGreaterThanOrEqual(1);
    expect(postJson.viewed_ads[0].sponsor).toBe('KrocPDF');

    // Subsequent GET should return the exact synced display ads
    const getReq = new Request('http://localhost:3000/api/user/earnings?device_id=dev_sync_test_999&email=syncuser@gmail.com');
    const getRes = await GET(getReq);
    const getJson = await getRes.json();
    expect(getJson.status).toBe('ok');
    expect(getJson.viewed_ads[0].id).toBe('evt_sync_01');
  });
});
