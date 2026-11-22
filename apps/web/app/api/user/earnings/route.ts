import { NextResponse } from 'next/server';
import { referralEngine } from '@/lib/referral-engine';
import { userStore } from '@/lib/user-store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get('device_id') || 'dev_guest';
  const email = searchParams.get('email') || undefined;

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
