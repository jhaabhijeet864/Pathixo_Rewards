import { describe, it, expect, beforeEach } from 'vitest';
import { POST, GET } from '../../../apps/web/app/api/preregister/route';

describe('API Route: /api/preregister', () => {
  it('should accept valid email addresses and record pre-registration', async () => {
    const testEmail = `tester_${Date.now()}@domain.com`;
    const req = new Request('https://pathixorewards.com/api/preregister', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': `192.168.1.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({ email: testEmail, source: 'coming_soon' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.registration.email).toBe(testEmail);
    expect(json.message).toContain('early access VIP list');
  });

  it('should reject invalid or missing email formatting', async () => {
    const reqInvalid = new Request('https://pathixorewards.com/api/preregister', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.0.0.99',
      },
      body: JSON.stringify({ email: 'not-an-email' }),
    });

    const res = await POST(reqInvalid);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.status).toBe('error');
    expect(json.message).toContain('valid email address');
  });

  it('should handle already-registered emails gracefully with friendly notice', async () => {
    const req = new Request('https://pathixorewards.com/api/preregister', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.0.0.101',
      },
      body: JSON.stringify({ email: 'vip.tester@gmail.com' }), // seeded
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.already_registered).toBe(true);
    expect(json.message).toContain('already on the launch notification list');
  });

  it('should report registered count on GET query', async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.total_pre_registered).toBeGreaterThanOrEqual(2);
  });
});
