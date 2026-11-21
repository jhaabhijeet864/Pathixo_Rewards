import type { AdCreative, ImpressionEvent, UserEarnings } from '@pathixo/shared';

export interface PathixoStorageSchema {
  device_id: string;
  enabled: boolean;
  earnings: UserEarnings;
  cached_ads: AdCreative[];
  queued_events: ImpressionEvent[];
  last_sync: number;
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
