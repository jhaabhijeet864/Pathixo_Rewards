import type { UserEarnings } from '@pathixo/shared';
import { referralEngine } from './referral-engine';
import { adminStore } from './admin-store';

export interface ViewedAdItem {
  id: string;
  sponsor: string;
  headline: string;
  model: string;
  dwellSeconds: number;
  earnedUsd: number;
  timestamp: number;
  verified: boolean;
}

export interface UserDeviceRecord {
  deviceId: string;
  email?: string;
  referralCode: string;
  earnings: UserEarnings;
  viewedAds: ViewedAdItem[];
  lastActive: string;
}

/**
 * Deterministic permanent referral code generator.
 * Tied to user's email address or device ID so it never changes across sessions.
 */
export function getPermanentReferralCode(identifier: string): string {
  if (!identifier) return 'ref_member';
  const clean = identifier.trim().toLowerCase();
  let hash = 5381;
  for (let i = 0; i < clean.length; i++) {
    hash = ((hash << 5) + hash) + clean.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(6, '0').slice(0, 6);
  if (clean.includes('@')) {
    const prefix = clean.split('@')[0].replace(/[^a-z0-9]/gi, '').slice(0, 8);
    return `${prefix || 'usr'}_${hex}`;
  }
  if (clean.startsWith('dev_')) {
    return clean;
  }
  return `ref_${clean.slice(0, 6)}_${hex}`;
}

class UserStore {
  private users: Map<string, UserDeviceRecord> = new Map();
  // Map email -> deviceId for unified account lookup
  private emailToDevice: Map<string, string> = new Map();

  public getOrCreateUser(deviceId: string, email?: string): UserDeviceRecord {
    let resolvedId = deviceId;
    if (email && this.emailToDevice.has(email.toLowerCase())) {
      const mappedId = this.emailToDevice.get(email.toLowerCase())!;
      if (deviceId && deviceId !== 'dev_guest') {
        resolvedId = deviceId;
        this.emailToDevice.set(email.toLowerCase(), deviceId);
      } else {
        resolvedId = mappedId;
      }
    }

    const existing = this.users.get(resolvedId);
    if (existing) {
      if (email && !existing.email) {
        existing.email = email;
        existing.referralCode = getPermanentReferralCode(email);
        this.emailToDevice.set(email.toLowerCase(), existing.deviceId);
      }
      return existing;
    }

    const referralCode = getPermanentReferralCode(email || resolvedId);
    const refStats = referralEngine.getReferrerStats(resolvedId);
    const freshUser: UserDeviceRecord = {
      deviceId: resolvedId,
      email: email || undefined,
      referralCode,
      earnings: {
        balance_usd: 0.0,
        lifetime_earned_usd: 0.0,
        lifetime_cashouts_usd: 0.0,
        impressions_today: 0,
        referral_count: refStats.totalReferrals,
        referral_bonus_usd: refStats.totalEarnedUsd,
      },
      viewedAds: [],
      lastActive: new Date().toISOString(),
    };

    this.users.set(resolvedId, freshUser);
    if (email) {
      this.emailToDevice.set(email.toLowerCase(), resolvedId);
    }
    this.syncToAdmin(freshUser);
    return freshUser;
  }

  public linkUserAccount(deviceId: string, email: string): UserDeviceRecord {
    const user = this.getOrCreateUser(deviceId, email);
    user.email = email;
    user.referralCode = getPermanentReferralCode(email);
    this.emailToDevice.set(email.toLowerCase(), deviceId);
    this.syncToAdmin(user);
    return user;
  }

  public syncUserEarnings(
    deviceId: string,
    data: {
      email?: string;
      earnings?: Partial<UserEarnings>;
      viewedAds?: ViewedAdItem[];
    }
  ): UserDeviceRecord {
    const user = this.getOrCreateUser(deviceId, data.email);

    if (data.email) {
      user.email = data.email;
      user.referralCode = getPermanentReferralCode(data.email);
      this.emailToDevice.set(data.email.toLowerCase(), user.deviceId);
    }

    if (data.earnings) {
      const incomingBalance = Number(data.earnings.balance_usd || 0);
      const incomingLifetime = Number(data.earnings.lifetime_earned_usd || 0);
      const incomingImpressions = Number(data.earnings.impressions_today || 0);

      user.earnings.balance_usd = Number(
        Math.max(user.earnings.balance_usd, incomingBalance).toFixed(5)
      );
      user.earnings.lifetime_earned_usd = Number(
        Math.max(user.earnings.lifetime_earned_usd, incomingLifetime, incomingBalance).toFixed(5)
      );
      user.earnings.impressions_today = Math.max(
        user.earnings.impressions_today,
        incomingImpressions
      );
    }

    if (Array.isArray(data.viewedAds) && data.viewedAds.length > 0) {
      const adMap = new Map<string, ViewedAdItem>();
      for (const ad of user.viewedAds) {
        if (ad && ad.id) adMap.set(ad.id, ad);
      }
      for (const ad of data.viewedAds) {
        if (ad && ad.id) adMap.set(ad.id, ad);
      }
      user.viewedAds = Array.from(adMap.values())
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, 50);

      if (user.earnings.impressions_today < user.viewedAds.length) {
        user.earnings.impressions_today = user.viewedAds.length;
      }
    }

    user.lastActive = new Date().toISOString();
    this.syncToAdmin(user);
    return user;
  }

  public recordImpression(params: {
    deviceId: string;
    adId: string;
    sponsorName: string;
    headline: string;
    platform: string;
    dwellMs: number;
    timestamp?: number;
    cpmRateUsd?: number;
    earnedUsd?: number;
    id?: string;
    email?: string;
  }): { earnings: UserEarnings; viewedAd: ViewedAdItem } {
    const user = this.getOrCreateUser(params.deviceId, params.email);
    const creditPerImpression = typeof params.earnedUsd === 'number' && params.earnedUsd > 0
      ? params.earnedUsd
      : (typeof params.cpmRateUsd === 'number'
          ? Number(((params.cpmRateUsd / 1000) * 0.60).toFixed(5))
          : 0.009); // 60% of verified ad revenue

    user.earnings.balance_usd = Number((user.earnings.balance_usd + creditPerImpression).toFixed(5));
    user.earnings.lifetime_earned_usd = Number((user.earnings.lifetime_earned_usd + creditPerImpression).toFixed(5));
    user.earnings.impressions_today += 1;
    user.lastActive = new Date().toISOString();

    const formattedModel = this.formatPlatformName(params.platform);
    const viewedAd: ViewedAdItem = {
      id: params.id || `ad_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sponsor: params.sponsorName,
      headline: params.headline,
      model: formattedModel,
      dwellSeconds: Number((params.dwellMs / 1000).toFixed(1)),
      earnedUsd: creditPerImpression,
      timestamp: params.timestamp || Date.now(),
      verified: true,
    };

    const existingIndex = user.viewedAds.findIndex((a) => a.id === viewedAd.id);
    if (existingIndex >= 0) {
      user.viewedAds[existingIndex] = viewedAd;
    } else {
      user.viewedAds.unshift(viewedAd);
    }
    if (user.viewedAds.length > 50) {
      user.viewedAds = user.viewedAds.slice(0, 50);
    }

    this.syncToAdmin(user);
    return { earnings: { ...user.earnings }, viewedAd };
  }

  private syncToAdmin(user: UserDeviceRecord): void {
    try {
      adminStore.registerUser({
        id: user.deviceId,
        email: user.email || `${user.deviceId.slice(0, 12)}@guest.pathixo`,
        full_name: user.email ? user.email.split('@')[0] : 'Extension Member',
        device_ids: [user.deviceId],
        balance_usd: user.earnings.balance_usd,
        impressions_count: user.earnings.impressions_today,
        lifetime_earned_usd: user.earnings.lifetime_earned_usd,
        referral_code: user.referralCode,
        referral_count: user.earnings.referral_count,
        fraud_risk_score: 'low',
        is_banned: false,
        created_at: user.lastActive || new Date().toISOString(),
      });
    } catch {
      // Safe no-op
    }
  }

  public cashout(
    deviceId: string,
    amountUsd?: number,
    payoutMethod?: string,
    payoutDestination?: string
  ): { success: boolean; amount: number; message: string; earnings: UserEarnings } {
    const user = this.getOrCreateUser(deviceId);
    const requestedAmount = typeof amountUsd === 'number' && amountUsd > 0 ? amountUsd : user.earnings.balance_usd;

    if (!Number.isFinite(requestedAmount) || requestedAmount < 2.0 || user.earnings.balance_usd < 2.0) {
      return { success: false, amount: 0, message: 'Minimum cashout floor is $2.00 USD', earnings: { ...user.earnings } };
    }
    if (requestedAmount > user.earnings.balance_usd) {
      return { success: false, amount: 0, message: 'Requested amount exceeds the available balance.', earnings: { ...user.earnings } };
    }

    const cashedAmount = Number(requestedAmount.toFixed(2));
    user.earnings.balance_usd = 0.0;
    user.earnings.lifetime_cashouts_usd = Number(((user.earnings.lifetime_cashouts_usd || 0) + cashedAmount).toFixed(4));
    user.lastActive = new Date().toISOString();

    const railName = payoutMethod ? payoutMethod.toUpperCase() : 'instant rail';
    return {
      success: true,
      amount: cashedAmount,
      message: `Cashout request for $${cashedAmount.toFixed(2)} via ${railName} was recorded for review. No transfer was made.`,
      earnings: { ...user.earnings },
    };
  }

  public resetUser(deviceId: string): void {
    const user = this.getOrCreateUser(deviceId);
    user.earnings = {
      balance_usd: 0.0,
      lifetime_earned_usd: 0.0,
      lifetime_cashouts_usd: 0.0,
      impressions_today: 0,
      referral_count: 0,
      referral_bonus_usd: 0,
    };
    user.viewedAds = [];
  }

  public clearViewedAdsForEmail(email: string): boolean {
    const deviceId = this.emailToDevice.get(email.trim().toLowerCase());
    const user = deviceId ? this.users.get(deviceId) : undefined;
    if (!user || user.email?.toLowerCase() !== email.trim().toLowerCase()) return false;
    user.viewedAds = [];
    this.syncToAdmin(user);
    return true;
  }

  private formatPlatformName(platform: string): string {
    const p = platform.toLowerCase();
    if (p.includes('chatgpt')) return 'ChatGPT o3-mini';
    if (p.includes('claude')) return 'Claude 3.7 Sonnet';
    if (p.includes('gemini')) return 'Google Gemini 4 Argon';
    if (p.includes('perplexity')) return 'Perplexity Pro';
    if (p.includes('deepseek')) return 'DeepSeek R1';
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  }
}

export const userStore = new UserStore();
