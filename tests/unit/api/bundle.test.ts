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
});
