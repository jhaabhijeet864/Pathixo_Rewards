import { NextResponse } from 'next/server';
import { referralEngine } from '@/lib/referral-engine';
import { userStore } from '@/lib/user-store';
import { accountStoreKey, getSessionFromRequest } from '@/lib/auth-session';

function productionUnavailable() {
  return NextResponse.json(
    { status: 'error', message: 'Rewards storage is not configured. No account data was changed.' },
    { status: 503 }
  );
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') return productionUnavailable();
  const session = getSessionFromRequest(request);
  if (process.env.NODE_ENV !== 'test' && !session) {
    return NextResponse.json({ status: 'error', message: 'Sign-in required.' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const deviceId = process.env.NODE_ENV === 'test'
    ? searchParams.get('device_id') || 'dev_guest'
    : accountStoreKey(session!.email);
  const email = process.env.NODE_ENV === 'test' ? searchParams.get('email') || undefined : session?.email;

  const user = userStore.getOrCreateUser(deviceId, email);
  const refStats = referralEngine.getReferrerStats(deviceId);

  return NextResponse.json({
    status: 'ok',
    device_id: user.deviceId,
    referral_code: user.referralCode,
    referral_url: `https://pathixorewards.com/?ref=${user.referralCode}`,
    earnings: {
      ...user.earnings,
      referral_count: refStats.totalReferrals,
      referral_bonus_usd: refStats.totalEarnedUsd,
    },
    viewed_ads: user.viewedAds,
    can_cashout: user.earnings.balance_usd >= 2.0,
    min_threshold_usd: 2.0,
    referral_stats: {
      ...refStats,
      commission_rate: '10%',
      max_cap_per_referee_usd: 10.0,
      turnaround_cycle: 'weekly',
    },
  });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') return productionUnavailable();
  const session = getSessionFromRequest(request);
  if (process.env.NODE_ENV !== 'test' && !session) {
    return NextResponse.json({ status: 'error', message: 'Sign-in required.' }, { status: 401 });
  }
  if (process.env.NODE_ENV !== 'test') {
    return NextResponse.json({ status: 'error', message: 'Client synchronization is disabled. Earnings are accepted only from verified server events.' }, { status: 405 });
  }
  try {
    const body = await request.json();
    // Clients may sync display history in local development, but may never set balances.
    if (body.earnings !== undefined) {
      return NextResponse.json({ status: 'error', message: 'Client-supplied earnings are not accepted.' }, { status: 400 });
    }
    const deviceId = body.device_id || 'dev_guest';
    const email = process.env.NODE_ENV === 'test' ? body.email || undefined : session?.email;
    const viewedAds = body.viewed_ads;

    const user = userStore.syncUserEarnings(deviceId, {
      email,
      viewedAds,
    });

    const refStats = referralEngine.getReferrerStats(user.deviceId);

    return NextResponse.json({
      status: 'ok',
      device_id: user.deviceId,
      referral_code: user.referralCode,
      referral_url: `https://pathixorewards.com/?ref=${user.referralCode}`,
      earnings: {
        ...user.earnings,
        referral_count: refStats.totalReferrals,
        referral_bonus_usd: refStats.totalEarnedUsd,
      },
      viewed_ads: user.viewedAds,
      can_cashout: user.earnings.balance_usd >= 2.0,
      min_threshold_usd: 2.0,
      referral_stats: {
        ...refStats,
        commission_rate: '10%',
        max_cap_per_referee_usd: 10.0,
        turnaround_cycle: 'weekly',
      },
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: 'error', message: errorMsg }, { status: 400 });
  }
}
