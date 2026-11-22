import { NextResponse } from 'next/server';
import { referralEngine } from '@/lib/referral-engine';
import { userStore } from '@/lib/user-store';
import { checkRateLimit, createRateLimitExceededResponse } from '@/lib/rate-limit';

export async function GET(request: Request) {
  const rateLimit = checkRateLimit(request, { maxRequests: 60, windowMs: 60_000, prefix: 'referrals_get' });
  if (!rateLimit.success) {
    return createRateLimitExceededResponse(rateLimit);
  }

  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get('device_id') || 'dev_guest';
  const email = searchParams.get('email') || undefined;

  const user = userStore.getOrCreateUser(deviceId, email);
  const stats = referralEngine.getReferrerStats(deviceId);
  const refereeStatus = referralEngine.getRefereeStatus(deviceId);
  const referralsList = referralEngine.getReferralList(deviceId);

  return NextResponse.json({
    status: 'ok',
    device_id: deviceId,
    referral_code: user.referralCode,
    referral_url: `https://pathixorewards.com/?ref=${user.referralCode}`,
    referrals: referralsList,
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

    if (action === 'simulate_referral') {
      const targetReferrer = referrer_id || 'dev_guest';
      const mockFriendId = `peer_${Math.random().toString(36).substring(2, 6)}`;
      const rel = referralEngine.registerReferral(targetReferrer, mockFriendId);
      if (rel) {
        // Record 12 impressions for this simulated friend (~$0.108 earnings -> 10% royalty ~$0.0108)
        for (let i = 0; i < 12; i++) {
          referralEngine.recordVerifiedImpression(mockFriendId, 0.009);
        }
        referralEngine.processWeeklyTurnaround();
      }
      const updatedList = referralEngine.getReferralList(targetReferrer);
      const updatedStats = referralEngine.getReferrerStats(targetReferrer);
      return NextResponse.json({
        status: 'ok',
        message: 'Simulated friend referral added and weekly royalty processed!',
        referrals: updatedList,
        stats: updatedStats,
      });
    }

    return NextResponse.json({ status: 'error', message: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: 'error', message: msg }, { status: 400 });
  }
}
