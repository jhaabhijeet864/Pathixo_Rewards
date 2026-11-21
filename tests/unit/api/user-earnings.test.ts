import { describe, it, expect } from 'vitest';
import { GET } from '../../../apps/web/app/api/user/earnings/route';

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
});
