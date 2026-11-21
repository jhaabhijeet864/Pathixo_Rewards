/**
 * Pathixo Rewards - API Rate Limiting Utility
 * In-memory sliding window rate limiter for Next.js App Router API endpoints.
 * Protects against DDoS, impression replay attacks, and abusive cashout calls.
 */

export interface RateLimitOptions {
  /** Maximum number of allowed requests in the sliding window */
  maxRequests?: number;
  /** Duration of the sliding window in milliseconds (default: 60,000ms = 1 min) */
  windowMs?: number;
  /** Custom key prefix to partition limits (e.g., 'impression', 'cashout') */
  prefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

interface WindowRecord {
  timestamps: number[];
}

class SlidingWindowRateLimiter {
  private records = new Map<string, WindowRecord>();
  private lastPrune = Date.now();

  /**
   * Evaluates if a request from the given identifier is within rate limits.
   */
  public check(identifier: string, options: RateLimitOptions = {}): RateLimitResult {
    const maxRequests = options.maxRequests ?? 60;
    const windowMs = options.windowMs ?? 60_000;
    const prefix = options.prefix ?? 'default';
    const key = `${prefix}:${identifier}`;

    const now = Date.now();
    const windowStart = now - windowMs;

    // Prune stale records every 5 minutes to prevent memory growth
    if (now - this.lastPrune > 300_000) {
      this.prune(windowStart);
      this.lastPrune = now;
    }

    let record = this.records.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.records.set(key, record);
    }

    // Filter timestamps within the current sliding window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    const currentCount = record.timestamps.length;
    const oldestTimestamp = record.timestamps[0] ?? now;
    const resetMs = Math.max(0, oldestTimestamp + windowMs - now);

    if (currentCount >= maxRequests) {
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        resetMs,
      };
    }

    record.timestamps.push(now);

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - record.timestamps.length,
      resetMs,
    };
  }

  /**
   * Resets rate limit records (useful for test isolation)
   */
  public reset(): void {
    this.records.clear();
  }

  private prune(cutoff: number): void {
    for (const [key, record] of this.records.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > cutoff);
      if (record.timestamps.length === 0) {
        this.records.delete(key);
      }
    }
  }
}

// Global singleton rate limiter instance
export const rateLimiter = new SlidingWindowRateLimiter();

/**
 * Extracts a client identifier from Request headers (CF-Connecting-IP, X-Forwarded-For, etc.)
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return '127.0.0.1';
}

/**
 * Convenience helper to check rate limits for incoming Next.js requests.
 */
export function checkRateLimit(
  request: Request,
  options: RateLimitOptions = {}
): RateLimitResult {
  const ip = getClientIp(request);
  return rateLimiter.check(ip, options);
}

/**
 * Standard 429 response helper with RFC-compliant headers
 */
export function createRateLimitExceededResponse(result: RateLimitResult): Response {
  const retrySeconds = Math.max(1, Math.ceil(result.resetMs / 1000));
  return new Response(
    JSON.stringify({
      status: 'error',
      message: 'Rate limit exceeded. Please slow down your requests.',
      retry_after_seconds: retrySeconds,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retrySeconds),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(retrySeconds),
      },
    }
  );
}
