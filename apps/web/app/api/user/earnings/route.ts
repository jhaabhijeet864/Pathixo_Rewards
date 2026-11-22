import { NextResponse } from 'next/server';
import type { UserEarnings } from '@pathixo/shared';
import { referralEngine } from '@/lib/referral-engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get('device_id') || 'dev_guest';

  const refStats = referralEngine.getReferrerStats(deviceId);

  // Demo earnings state
  const earnings: UserEarnings = {
    balance_usd: 2.148, // Over $2 threshold to demonstrate cashout readiness
    lifetime_earned_usd: 5.62,
    impressions_today: 18,
    referral_count: refStats.totalReferrals > 0 ? refStats.totalReferrals : 3,
    referral_bonus_usd: refStats.totalEarnedUsd > 0 ? refStats.totalEarnedUsd : 0.54,
  };

  return NextResponse.json({
    status: 'ok',
    device_id: deviceId,
    earnings,
    can_cashout: earnings.balance_usd >= 2.0,
    min_threshold_usd: 2.0,
    referral_url: `https://pathixorewards.com/?ref=${deviceId}`,
    referral_stats: {
      ...refStats,
      commission_rate: '10%',
      max_cap_per_referee_usd: 10.0,
      turnaround_cycle: 'weekly',
    },
  });
}
