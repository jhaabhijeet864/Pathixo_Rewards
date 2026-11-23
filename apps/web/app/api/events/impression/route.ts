import { NextResponse } from 'next/server';
import type { ImpressionEvent } from '@pathixo/shared';
import { campaignStore } from '../../../../lib/campaign-store';
import { checkRateLimit, createRateLimitExceededResponse } from '@/lib/rate-limit';
import { userStore } from '@/lib/user-store';

// This local-only ledger keeps unit/development behavior deterministic; it is not production storage.
const verifiedImpressionsLedger: ImpressionEvent[] = [];
const processedEventIds = new Set<string>();

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ status: 'error', message: 'Verified impression storage is not configured. No credit was issued.' }, { status: 503 });
  }
  try {
    const rateLimit = checkRateLimit(request, { maxRequests: 120, windowMs: 60_000, prefix: 'impression' });
    if (!rateLimit.success) {
      return createRateLimitExceededResponse(rateLimit);
    }

    const body = await request.json();
    const events: ImpressionEvent[] = Array.isArray(body.events) ? body.events.slice(0, 20) : [];
    if (events.length === 0) {
      return NextResponse.json({ status: 'error', message: 'Provide at least one impression event.' }, { status: 400 });
    }

    const qualifiedEvents: ImpressionEvent[] = [];
    const disqualifiedEvents: { event_id: string; reason: string }[] = [];

    for (const evt of events) {
      // 1. Verify required fields
      if (!evt.event_id || !evt.ad_token || !evt.ai_platform) {
        disqualifiedEvents.push({ event_id: evt.event_id, reason: 'Malformed payload' });
        continue;
      }
      if (processedEventIds.has(evt.event_id)) {
        disqualifiedEvents.push({ event_id: evt.event_id, reason: 'Duplicate event' });
        continue;
      }
      if (!['chatgpt', 'claude', 'gemini', 'perplexity', 'deepseek'].includes(evt.ai_platform)) {
        disqualifiedEvents.push({ event_id: evt.event_id, reason: 'Unsupported platform' });
        continue;
      }

      const campaign = campaignStore.getAllCampaigns().find((item) => item.ad_token === evt.ad_token);
      if (!campaign || campaign.status !== 'active' || campaign.budget_remaining_usd <= 0) {
        disqualifiedEvents.push({ event_id: evt.event_id, reason: 'Unknown, inactive, or exhausted ad' });
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
      processedEventIds.add(evt.event_id);
      verifiedImpressionsLedger.push(evt);

      // Record in campaignStore (updates campaign metrics, platform breakdown & deducts budget)
      campaignStore.recordImpression({
        adToken: evt.ad_token,
        adId: evt.ad_id,
        dwellMs: evt.dwell_ms,
        platform: evt.ai_platform,
      });

      // Record in userStore for live user dashboard tracking
      let sponsorName = 'Sponsored Partner';
      let headline = 'Wait-time sponsored message';
      const cmp = campaign;
      sponsorName = cmp.sponsor_name;
      headline = cmp.headline;
      const cpmRateUsd = cmp.cpm_rate_usd;
      userStore.recordImpression({
        deviceId: evt.device_id || 'dev_guest',
        adId: evt.ad_id,
        sponsorName,
        headline,
        platform: evt.ai_platform,
        dwellMs: evt.dwell_ms,
        timestamp: evt.timestamp,
        cpmRateUsd,
        earnedUsd: Number(((cpmRateUsd / 1000) * 0.6).toFixed(5)),
        id: evt.event_id,
      });
    }

    const totalCreditedUsd = qualifiedEvents.reduce((acc, evt) => {
      const cmp = campaignStore.getAllCampaigns().find((item) => item.ad_token === evt.ad_token);
      return acc + ((cmp?.cpm_rate_usd || 0) / 1000) * 0.60;
    }, 0);

    return NextResponse.json({
      status: 'ok',
      processed: events.length,
      qualified_count: qualifiedEvents.length,
      disqualified_count: disqualifiedEvents.length,
      disqualified: disqualifiedEvents,
      credited_usd: Number(totalCreditedUsd.toFixed(5)),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: 'error', message: errorMsg }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    total_verified_impressions: verifiedImpressionsLedger.length,
  });
}
