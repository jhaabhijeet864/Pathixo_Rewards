import { NextResponse } from 'next/server';
import type { ImpressionEvent } from '@pathixo/shared';
import { campaignStore } from '../../../../lib/campaign-store';
import { checkRateLimit, createRateLimitExceededResponse } from '@/lib/rate-limit';

// In-memory ledger for fast demonstration & event auditing
const verifiedImpressionsLedger: ImpressionEvent[] = [];

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(request, { maxRequests: 120, windowMs: 60_000, prefix: 'impression' });
    if (!rateLimit.success) {
      return createRateLimitExceededResponse(rateLimit);
    }

    const body = await request.json();
    const events: ImpressionEvent[] = body.events || [];

    const qualifiedEvents: ImpressionEvent[] = [];
    const disqualifiedEvents: { event_id: string; reason: string }[] = [];

    for (const evt of events) {
      // 1. Verify required fields
      if (!evt.event_id || !evt.ad_token || !evt.ai_platform) {
        disqualifiedEvents.push({ event_id: evt.event_id, reason: 'Malformed payload' });
        continue;
      }

      // 2. Anti-fraud: minimum 4000ms dwell time verification
      if (!evt.dwell_ms || evt.dwell_ms < 4000) {
        disqualifiedEvents.push({
          event_id: evt.event_id,
          reason: `Insufficient dwell time (${evt.dwell_ms || 0}ms < 4000ms)`,
        });
        continue;
      }

      // 3. Qualified impression: record in ledger and deduct from campaign balance
      qualifiedEvents.push(evt);
      verifiedImpressionsLedger.push(evt);

      // Record in campaignStore (updates campaign metrics, platform breakdown & deducts budget)
      campaignStore.recordImpression({
        adToken: evt.ad_token,
        adId: evt.ad_id,
        dwellMs: evt.dwell_ms,
        platform: evt.ai_platform,
      });
    }

    return NextResponse.json({
      status: 'ok',
      processed: events.length,
      qualified_count: qualifiedEvents.length,
      disqualified_count: disqualifiedEvents.length,
      disqualified: disqualifiedEvents,
      // Total credited in USD (60% rev share on $15 CPM = $0.009 per qualified view)
      credited_usd: Number((qualifiedEvents.length * 0.009).toFixed(4)),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: 'error', message: errorMsg }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    total_verified_impressions: verifiedImpressionsLedger.length,
    recent: verifiedImpressionsLedger.slice(-10),
  });
}
