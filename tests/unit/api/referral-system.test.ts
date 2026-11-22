import { describe, it, expect } from 'vitest';
import { getPermanentReferralCode, referralEngine } from '../../../apps/web/lib/referral-engine';
import { userStore } from '../../../apps/web/lib/user-store';
import { GET as getEarnings } from '../../../apps/web/app/api/user/earnings/route';
import { POST as postCashout } from '../../../apps/web/app/api/cashout/route';
import { GET as getReferrals, POST as postReferrals } from '../../../apps/web/app/api/referrals/route';

describe('Referral System & Real-Time Earnings Metrics', () => {
  it('generates a permanent, deterministic referral code that never changes', () => {
    const code1 = getPermanentReferralCode('user@gmail.com');
    const code2 = getPermanentReferralCode('user@gmail.com');
    const codeUpper = getPermanentReferralCode('USER@GMAIL.COM');

    expect(code1).toBe(code2);
    expect(code1).toBe(codeUpper);
    expect(code1).toMatch(/^user_[a-f0-9]{6}$/);

    // Different user gets different permanent code
    const alexCode = getPermanentReferralCode('alex@company.com');
    expect(alexCode).toMatch(/^alex_[a-f0-9]{6}$/);
    expect(alexCode).not.toBe(code1);
  });

  it('correctly tracks balance, impressions, and lifetime cashouts on userStore', () => {
    const testDeviceId = 'dev_test_device_101';
    userStore.resetUser(testDeviceId);

    // Initial state
    const user = userStore.getOrCreateUser(testDeviceId, 'tester@gmail.com');
    expect(user.earnings.balance_usd).toBe(0.0);
    expect(user.earnings.impressions_today).toBe(0);
    expect(user.earnings.lifetime_cashouts_usd).toBe(0.0);

    // Simulate 3 impressions
    userStore.recordImpression({
      deviceId: testDeviceId,
      adId: 'ad_1',
      sponsorName: 'Test Sponsor',
      headline: 'Test Headline',
      platform: 'chatgpt',
      dwellMs: 5000,
    });
    userStore.recordImpression({
      deviceId: testDeviceId,
      adId: 'ad_2',
      sponsorName: 'Test Sponsor 2',
      headline: 'Test Headline 2',
      platform: 'claude',
      dwellMs: 6000,
    });

    expect(user.earnings.balance_usd).toBeCloseTo(0.018, 4);
    expect(user.earnings.impressions_today).toBe(2);
    expect(user.viewedAds.length).toBe(2);
  });

  it('correctly syncs cashouts with lifetime_cashouts_usd', async () => {
    const testDeviceId = 'dev_cashout_test_202';
    userStore.resetUser(testDeviceId);

    // Credit user balance above $2.00 threshold
    const user = userStore.getOrCreateUser(testDeviceId);
    user.earnings.balance_usd = 3.5;

    const req = new Request('http://localhost:3000/api/cashout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_id: testDeviceId,
        amount_usd: 3.5,
        payout_method: 'upi',
        payout_destination: 'user@upi',
      }),
    });

    const res = await postCashout(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('success');
    expect(json.earnings.balance_usd).toBe(0.0);
    expect(json.earnings.lifetime_cashouts_usd).toBe(3.5);

    // Verify user store state
    const updatedUser = userStore.getOrCreateUser(testDeviceId);
    expect(updatedUser.earnings.balance_usd).toBe(0.0);
    expect(updatedUser.earnings.lifetime_cashouts_usd).toBe(3.5);
  });

  it('returns referrals and allows simulating peer referrals via /api/referrals', async () => {
    const referrerId = 'dev_referrer_303';
    referralEngine.reset();

    // GET empty referrals
    const getReq = new Request(`http://localhost:3000/api/referrals?device_id=${referrerId}`);
    const getRes = await getReferrals(getReq);
    expect(getRes.status).toBe(200);

    const getJson = await getRes.json();
    expect(getJson.status).toBe('ok');
    expect(getJson.referrals).toEqual([]);
    expect(getJson.stats.totalReferrals).toBe(0);

    // POST simulate_referral
    const postReq = new Request('http://localhost:3000/api/referrals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'simulate_referral',
        referrer_id: referrerId,
      }),
    });

    const postRes = await postReferrals(postReq);
    expect(postRes.status).toBe(200);

    const postJson = await postRes.json();
    expect(postJson.status).toBe('ok');
    expect(postJson.referrals.length).toBe(1);
    expect(postJson.stats.totalReferrals).toBe(1);
    expect(postJson.stats.totalEarnedUsd).toBeGreaterThan(0);
  });
});
