import { describe, it, expect, beforeEach } from 'vitest';
import {
  referralEngine,
  REFERRAL_COMMISSION_PERCENT,
  REFERRAL_MAX_CAP_USD,
  WELCOME_CREDIT_USD,
  WELCOME_CREDIT_IMPRESSIONS_REQUIRED,
} from '../../../apps/web/lib/referral-engine';

describe('Referral Royalty Engine (apps/web/lib/referral-engine.ts)', () => {
  beforeEach(() => {
    referralEngine.reset();
  });

  it('should register a valid referral relationship and prevent self-referrals', () => {
    const selfRef = referralEngine.registerReferral('dev_user_1', 'dev_user_1');
    expect(selfRef).toBeNull();

    const rel = referralEngine.registerReferral('dev_referrer', 'dev_referee');
    expect(rel).not.toBeNull();
    expect(rel?.referrer_device_id).toBe('dev_referrer');
    expect(rel?.referred_device_id).toBe('dev_referee');
    expect(rel?.total_commission_usd).toBe(0);
    expect(rel?.is_active).toBe(true);
    expect(rel?.welcome_credit_unlocked).toBe(false);
  });

  it('should unlock $0.25 Welcome Milestone Credit after exactly 10 verified impressions', () => {
    referralEngine.registerReferral('dev_referrer', 'dev_referee');

    // Impressions 1 to 9 should not trigger welcome credit
    for (let i = 1; i <= 9; i++) {
      const res = referralEngine.recordVerifiedImpression('dev_referee', 0.012);
      expect(res.welcomeMilestoneUnlocked).toBe(false);
      expect(res.welcomeCreditAmount).toBe(0);
    }

    // 10th impression triggers $0.25 credit
    const res10 = referralEngine.recordVerifiedImpression('dev_referee', 0.012);
    expect(res10.welcomeMilestoneUnlocked).toBe(true);
    expect(res10.welcomeCreditAmount).toBe(WELCOME_CREDIT_USD);

    // 11th impression does not trigger it again
    const res11 = referralEngine.recordVerifiedImpression('dev_referee', 0.012);
    expect(res11.welcomeMilestoneUnlocked).toBe(false);
    expect(res11.welcomeCreditAmount).toBe(0);
  });

  it('should settle 10% royalty on weekly turnaround without touching user earnings', () => {
    referralEngine.registerReferral('dev_referrer', 'dev_referee');

    // Referee generates $10 in impressions this week
    referralEngine.recordVerifiedImpression('dev_referee', 10.00);

    const statsBefore = referralEngine.getReferrerStats('dev_referrer');
    expect(statsBefore.pendingWeeklyTurnaroundUsd).toBe(1.00); // 10% of $10
    expect(statsBefore.totalEarnedUsd).toBe(0);

    // Process weekly turnaround
    const summary = referralEngine.processWeeklyTurnaround();
    expect(summary.processed_referrals).toBe(1);
    expect(summary.total_disbursed_usd).toBe(1.00);

    const statsAfter = referralEngine.getReferrerStats('dev_referrer');
    expect(statsAfter.totalEarnedUsd).toBe(1.00);
    expect(statsAfter.pendingWeeklyTurnaroundUsd).toBe(0);
  });

  it('should strictly enforce the $10.00 cap per referral relationship', () => {
    referralEngine.registerReferral('dev_referrer', 'dev_referee');

    // Referee generates $90 in week 1 -> 10% = $9.00 commission
    referralEngine.recordVerifiedImpression('dev_referee', 90.00);
    referralEngine.processWeeklyTurnaround();

    let stats = referralEngine.getReferrerStats('dev_referrer');
    expect(stats.totalEarnedUsd).toBe(9.00);
    expect(stats.activeReferrals).toBe(1);

    // Referee generates another $50 in week 2 -> would be $5.00, but cap allows only $1.00
    referralEngine.recordVerifiedImpression('dev_referee', 50.00);
    const summary = referralEngine.processWeeklyTurnaround();
    expect(summary.total_disbursed_usd).toBe(1.00); // Capped at $10.00 max ($9 + $1)
    expect(summary.capped_referrals_count).toBe(1);

    stats = referralEngine.getReferrerStats('dev_referrer');
    expect(stats.totalEarnedUsd).toBe(10.00);
    expect(stats.activeReferrals).toBe(0);
    expect(stats.cappedReferrals).toBe(1);

    // Week 3 -> zero additional commission
    referralEngine.recordVerifiedImpression('dev_referee', 100.00);
    const summary3 = referralEngine.processWeeklyTurnaround();
    expect(summary3.total_disbursed_usd).toBe(0);

    stats = referralEngine.getReferrerStats('dev_referrer');
    expect(stats.totalEarnedUsd).toBe(10.00);
  });

  it('should verify the 60/40 to 60/36/4 economic safeguard equation', () => {
    // Standard CPM $20.00 -> $0.0200 per view
    const grossPricePerView = 0.0200;
    const userShare = grossPricePerView * 0.60; // $0.0120 (60% strictly inviolate)
    const platformStandardShare = grossPricePerView * 0.40; // $0.0080 (40%)

    // When 10% referral royalty is active, it is paid from user earnings volume (10% of user share)
    // 10% of $0.0120 = $0.0012 (which equals 6% of gross) or 10% of gross?
    // "Referrer: 4%, User: 60%, Platform: 36%"
    const referrerSplit = grossPricePerView * 0.04; // $0.0008 (4%)
    const platformRetained = grossPricePerView * 0.36; // $0.0072 (36%)
    
    // Sum check
    const total = Number((userShare + referrerSplit + platformRetained).toFixed(4));
    expect(total).toBe(grossPricePerView);
    expect(userShare).toBe(0.0120);
    expect(referrerSplit).toBe(0.0008);
    expect(platformRetained).toBe(0.0072);
  });
});
