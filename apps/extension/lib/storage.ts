import type { AdCreative, ImpressionEvent, UserEarnings } from '@pathixo/shared';

export interface AuthUser {
  email: string;
  name: string;
  avatar_url?: string;
  provider?: 'google' | 'github';
  logged_in: boolean;
  logged_in_at?: string;
}

export interface PathixoStorageSchema {
  device_id: string;
  enabled: boolean;
  earnings: UserEarnings;
  cached_ads: AdCreative[];
  queued_events: ImpressionEvent[];
  last_sync: number;
  auth_user?: AuthUser;
}

const DEFAULT_EARNINGS: UserEarnings = {
  balance_usd: 0.0923, // Initial starter credit for demo & active display
  lifetime_earned_usd: 0.0923,
  impressions_today: 4,
  referral_count: 0,
  referral_bonus_usd: 0,
};

export async function getDeviceId(): Promise<string> {
  const data = await browser.storage.local.get('device_id');
  if (data.device_id && typeof data.device_id === 'string') {
    return data.device_id;
  }
  const newId = `dev_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  await browser.storage.local.set({ device_id: newId });
  return newId;
}

export async function isEnabled(): Promise<boolean> {
  const data = await browser.storage.local.get('enabled');
  return data.enabled !== false; // Default true
}

export async function setEnabled(val: boolean): Promise<void> {
  await browser.storage.local.set({ enabled: val });
}

export async function getEarnings(): Promise<UserEarnings> {
  const data = await browser.storage.local.get('earnings');
  if (data.earnings && typeof data.earnings === 'object') {
    return data.earnings as UserEarnings;
  }
  await browser.storage.local.set({ earnings: DEFAULT_EARNINGS });
  return DEFAULT_EARNINGS;
}

export async function addEarnings(amountUsd: number): Promise<UserEarnings> {
  const current = await getEarnings();
  const updated: UserEarnings = {
    ...current,
    balance_usd: Number((current.balance_usd + amountUsd).toFixed(4)),
    lifetime_earned_usd: Number((current.lifetime_earned_usd + amountUsd).toFixed(4)),
    impressions_today: current.impressions_today + 1,
  };
  await browser.storage.local.set({ earnings: updated });
  return updated;
}

export async function getCachedAds(): Promise<AdCreative[]> {
  const data = await browser.storage.local.get('cached_ads');
  return Array.isArray(data.cached_ads) ? (data.cached_ads as AdCreative[]) : [];
}

export async function setCachedAds(ads: AdCreative[]): Promise<void> {
  await browser.storage.local.set({ cached_ads: ads });
}

export const MAX_QUEUED_EVENTS = 100;

export async function enqueueEvent(event: ImpressionEvent): Promise<void> {
  const data = await browser.storage.local.get('queued_events');
  const queue = Array.isArray(data.queued_events) ? (data.queued_events as ImpressionEvent[]) : [];
  queue.push(event);
  const boundedQueue = queue.length > MAX_QUEUED_EVENTS ? queue.slice(-MAX_QUEUED_EVENTS) : queue;
  await browser.storage.local.set({ queued_events: boundedQueue });
}

export async function drainQueuedEvents(): Promise<ImpressionEvent[]> {
  const data = await browser.storage.local.get('queued_events');
  const queue = Array.isArray(data.queued_events) ? (data.queued_events as ImpressionEvent[]) : [];
  await browser.storage.local.set({ queued_events: [] });
  return queue;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const data = await browser.storage.local.get('auth_user');
  if (data.auth_user && typeof data.auth_user === 'object' && (data.auth_user as AuthUser).logged_in) {
    return data.auth_user as AuthUser;
  }
  return null;
}

export async function setAuthUser(user: AuthUser | null): Promise<void> {
  if (user) {
    await browser.storage.local.set({ auth_user: user });
  } else {
    await browser.storage.local.remove('auth_user');
  }
}

export async function resetEarningsForNewUser(): Promise<UserEarnings> {
  const zeroEarnings: UserEarnings = {
    balance_usd: 0.0000,
    lifetime_earned_usd: 0.0000,
    impressions_today: 0,
    referral_count: 0,
    referral_bonus_usd: 0,
  };
  await browser.storage.local.set({ earnings: zeroEarnings });
  return zeroEarnings;
}
