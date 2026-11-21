import { describe, it, expect } from 'vitest';
import { GET } from '../../../apps/web/app/api/ads/bundle/route';

describe('API Route: /api/ads/bundle', () => {
  it('should deliver non-empty ad inventory bundle with verified tokens', async () => {
    const req = new Request('http://localhost:3000/api/ads/bundle?device_id=dev_test_01');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.device_id).toBe('dev_test_01');
    expect(Array.isArray(json.ads)).toBe(true);
    expect(json.ads.length).toBeGreaterThan(0);

    for (const ad of json.ads) {
      expect(ad.id).toBeTruthy();
      expect(ad.headline).toBeTruthy();
      expect(ad.sponsor_name).toBeTruthy();
      expect(ad.url).toBeTruthy();
      expect(ad.ad_token).toBeTruthy();
      expect(typeof ad.target_cpm).toBe('number');
    }
  });

  it('should handle missing device_id gracefully by defaulting to anonymous', async () => {
    const req = new Request('http://localhost:3000/api/ads/bundle');
    const res = await GET(req);
    const json = await res.json();
    expect(json.device_id).toBe('anonymous');
  });

  it('should include dynamically created active campaigns in the delivered ad bundle', async () => {
    const { campaignStore } = await import('../../../apps/web/lib/campaign-store');
    const created = campaignStore.createCampaign({
      advertiser_email: 'new_sponsor@ai.com',
      headline: 'Next-Gen Vector Database for LLMs',
      sponsor_name: 'VectorMax',
      target_url: 'https://vectormax.ai',
      badge: 'Database',
      budget_usd: 50.0,
      cpm_rate_usd: 30.0,
    });

    const req = new Request('http://localhost:3000/api/ads/bundle');
    const res = await GET(req);
    const json = await res.json();

    const found = json.ads.find((a: any) => a.id === created.id);
    expect(found).toBeDefined();
    expect(found.headline).toBe('Next-Gen Vector Database for LLMs');
    expect(found.sponsor_name).toBe('VectorMax');
    expect(found.target_cpm).toBe(30.0);
    expect(found.ad_token).toBe(created.ad_token);
  });
});
