import { describe, it, expect, beforeEach } from 'vitest';
import {
  rateLimiter,
  checkRateLimit,
  getClientIp,
  createRateLimitExceededResponse,
} from '../../../apps/web/lib/rate-limit';

describe('API Rate Limiting Utility (apps/web/lib/rate-limit.ts)', () => {
  beforeEach(() => {
    rateLimiter.reset();
  });

  it('should extract client IP correctly across common proxy headers', () => {
    const cfReq = new Request('https://api.pathixorewards.com/test', {
      headers: { 'cf-connecting-ip': '203.0.113.195' },
    });
    expect(getClientIp(cfReq)).toBe('203.0.113.195');

    const forwardedReq = new Request('https://api.pathixorewards.com/test', {
      headers: { 'x-forwarded-for': '198.51.100.1, 10.0.0.1' },
    });
    expect(getClientIp(forwardedReq)).toBe('198.51.100.1');

    const realIpReq = new Request('https://api.pathixorewards.com/test', {
      headers: { 'x-real-ip': '192.0.2.1' },
    });
    expect(getClientIp(realIpReq)).toBe('192.0.2.1');

    const fallbackReq = new Request('https://api.pathixorewards.com/test');
    expect(getClientIp(fallbackReq)).toBe('127.0.0.1');
  });

  it('should allow requests within limit and decrement remaining balance', () => {
    const req = new Request('https://api.pathixorewards.com/api/events/impression', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });

    const res1 = checkRateLimit(req, { maxRequests: 3, windowMs: 10000, prefix: 'imp' });
    expect(res1.success).toBe(true);
    expect(res1.limit).toBe(3);
    expect(res1.remaining).toBe(2);

    const res2 = checkRateLimit(req, { maxRequests: 3, windowMs: 10000, prefix: 'imp' });
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = checkRateLimit(req, { maxRequests: 3, windowMs: 10000, prefix: 'imp' });
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);

    // 4th request must be rejected
    const res4 = checkRateLimit(req, { maxRequests: 3, windowMs: 10000, prefix: 'imp' });
    expect(res4.success).toBe(false);
    expect(res4.remaining).toBe(0);
  });

  it('should isolate limits by IP and by prefix partition', () => {
    const userAReq = new Request('https://api.pathixorewards.com/test', {
      headers: { 'x-real-ip': '10.0.0.1' },
    });
    const userBReq = new Request('https://api.pathixorewards.com/test', {
      headers: { 'x-real-ip': '10.0.0.2' },
    });

    // Exhaust user A limit
    checkRateLimit(userAReq, { maxRequests: 1, prefix: 'test' });
    const blockedA = checkRateLimit(userAReq, { maxRequests: 1, prefix: 'test' });
    expect(blockedA.success).toBe(false);

    // User B should still be allowed
    const allowedB = checkRateLimit(userBReq, { maxRequests: 1, prefix: 'test' });
    expect(allowedB.success).toBe(true);

    // User A on a different prefix should still be allowed
    const allowedDifferentPrefix = checkRateLimit(userAReq, { maxRequests: 1, prefix: 'other' });
    expect(allowedDifferentPrefix.success).toBe(true);
  });

  it('should generate proper RFC 429 response structure and headers', async () => {
    const rejectedResult = {
      success: false,
      limit: 10,
      remaining: 0,
      resetMs: 5000,
    };

    const res = createRateLimitExceededResponse(rejectedResult);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('5');
    expect(res.headers.get('X-RateLimit-Limit')).toBe('10');
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');

    const body = await res.json();
    expect(body.status).toBe('error');
    expect(body.message).toContain('Rate limit exceeded');
    expect(body.retry_after_seconds).toBe(5);
  });
});
