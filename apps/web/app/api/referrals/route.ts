import { NextResponse } from 'next/server';
import { referralEngine } from '@/lib/referral-engine';
import { checkRateLimit, createRateLimitExceededResponse } from '@/lib/rate-limit';

// Seed demo referral relationships for instant interactive dashboard display
referralEngine.registerReferral('dev_usr_8829', 'dev_friend_alex');
referralEngine.registerReferral('dev_usr_8829', 'dev_friend_priya');
referralEngine.registerReferral('dev_usr_8829', 'dev_friend_marcus');

// Simulate historical activity:
// Alex reached $10 cap
referralEngine.recordVerifiedImpression('dev_friend_alex', 100.0);
referralEngine.processWeeklyTurnaround();

// Priya generated $14 this week ($1.40 pending weekly turnaround)
referralEngine.recordVerifiedImpression('dev_friend_priya', 14.0);

// Marcus is a fresh referred user with 7/10 impressions towards $0.25 milestone
for (let i = 0; i < 7; i++) {
  referralEngine.recordVerifiedImpression('dev_friend_marcus', 0.012);
}

export async function GET(request: Request) {
  const rateLimit = checkRateLimit(request, { maxRequests: 60, windowMs: 60_000, prefix: 'referrals_get' });
  if (!rateLimit.success) {
    return createRateLimitExceededResponse(rateLimit);
  }

  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get('device_id') || 'dev_usr_8829';

  const stats = referralEngine.getReferrerStats(deviceId);
  const refereeStatus = referralEngine.getRefereeStatus(deviceId);

  return NextResponse.json({
    status: 'ok',
    device_id: deviceId,
    referral_url: `https://pathixorewards.com/?ref=${deviceId}`,
    stats: {
      ...stats,
      weekly_turnaround_day: 'Every Sunday 23:59 UTC',
      commission_rate: '10%',
      economic_safeguard: '4% Referrer / 60% User / 36% Platform (funded by Pathixo)',
      max_cap_per_referral: 10.0,
    },
    welcome_milestone: {
      credit_amount_usd: 0.25,
      impressions_required: 10,
      current_impressions: refereeStatus ? refereeStatus.welcome_credit_impressions : 0,
      unlocked: refereeStatus ? refereeStatus.welcome_credit_unlocked : false,
      progress_percent: refereeStatus
        ? Math.min(100, Math.round((refereeStatus.welcome_credit_impressions / 10) * 100))
        : 0,
    },
  });
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, { maxRequests: 20, windowMs: 60_000, prefix: 'referrals_post' });
  if (!rateLimit.success) {
    return createRateLimitExceededResponse(rateLimit);
  }

  try {
    const body = await request.json();
    const { action, referrer_id, referred_id } = body;

    if (action === 'register') {
      const rel = referralEngine.registerReferral(referrer_id, referred_id);
      if (!rel) {
        return NextResponse.json(
          { status: 'error', message: 'Invalid or self-referral ID' },
          { status: 400 }
        );
      }
      return NextResponse.json({ status: 'ok', relationship: rel });
    }

    if (action === 'trigger_turnaround') {
      const summary = referralEngine.processWeeklyTurnaround();
      return NextResponse.json({ status: 'ok', summary });
    }

    return NextResponse.json({ status: 'error', message: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: 'error', message: msg }, { status: 400 });
  }
}
