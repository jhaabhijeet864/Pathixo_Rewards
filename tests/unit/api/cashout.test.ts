import { describe, it, expect } from 'vitest';
import { POST } from '../../../apps/web/app/api/cashout/route';

describe('API Route: /api/cashout', () => {
  it('should enforce the $2.00 minimum cashout floor', async () => {
    const underThresholdPayload = {
      device_id: 'dev_user_1',
      amount_usd: 1.5, // Below $2.00
      payout_method: 'upi',
      payout_destination: 'user@okhdfcbank',
    };

    const req = new Request('http://localhost:3000/api/cashout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(underThresholdPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.status).toBe('error');
    expect(json.message).toContain('Minimum cashout threshold is $2.00 USD');
  });

  it('should reject requests with missing payout method or destination', async () => {
    const invalidPayload = {
      device_id: 'dev_user_1',
      amount_usd: 3.5,
      // Missing payout_method and payout_destination
    };

    const req = new Request('http://localhost:3000/api/cashout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.message).toContain('required');
  });

  it('should successfully process valid cashout >= $2.00', async () => {
    const validPayload = {
      device_id: 'dev_user_1',
      amount_usd: 2.5,
      payout_method: 'paypal',
      payout_destination: 'user@example.com',
    };

    const req = new Request('http://localhost:3000/api/cashout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('success');
    expect(json.payout).toBeDefined();
    expect(json.payout.id).toMatch(/^payout_[a-f0-9]{12}$/);
    expect(json.payout.amount_usd).toBe(2.5);
    expect(json.payout.status).toBe('completed');
  });
});
