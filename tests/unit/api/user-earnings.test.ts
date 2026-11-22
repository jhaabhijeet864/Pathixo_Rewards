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

  it('should sync earnings and viewed ads via POST without losing higher client balance', async () => {
    const syncPayload = {
      device_id: 'dev_sync_test_999',
      email: 'syncuser@gmail.com',
      earnings: {
        balance_usd: 0.02617,
        lifetime_earned_usd: 0.02617,
        impressions_today: 4,
      },
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
      body: JSON.stringify(syncPayload),
    });

    const postRes = await POST(postReq);
    expect(postRes.status).toBe(200);
    const postJson = await postRes.json();
    expect(postJson.status).toBe('ok');
    expect(postJson.earnings.balance_usd).toBe(0.02617);
    expect(postJson.earnings.impressions_today).toBe(4);
    expect(postJson.viewed_ads.length).toBeGreaterThanOrEqual(1);
    expect(postJson.viewed_ads[0].sponsor).toBe('KrocPDF');

    // Subsequent GET should return the exact synced balance and ads
    const getReq = new Request('http://localhost:3000/api/user/earnings?device_id=dev_sync_test_999&email=syncuser@gmail.com');
    const getRes = await GET(getReq);
    const getJson = await getRes.json();
    expect(getJson.status).toBe('ok');
    expect(getJson.earnings.balance_usd).toBe(0.02617);
    expect(getJson.earnings.impressions_today).toBe(4);
    expect(getJson.viewed_ads[0].id).toBe('evt_sync_01');
  });
});
