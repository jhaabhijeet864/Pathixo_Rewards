import { describe, it, expect, beforeEach } from 'vitest';
import {
  getDeviceId,
  isEnabled,
  setEnabled,
  getEarnings,
  addEarnings,
  getCachedAds,
  setCachedAds,
  enqueueEvent,
  drainQueuedEvents,
  getAuthUser,
  setAuthUser,
  resetEarningsForNewUser,
} from '../../../apps/extension/lib/storage';
import { resetMockStorage } from '../../setup';
import type { AdCreative, ImpressionEvent } from '@pathixo/shared';

describe('Extension Storage Library (apps/extension/lib/storage.ts)', () => {
  beforeEach(() => {
    resetMockStorage();
  });

  it('should generate and persist a device ID with dev_ prefix', async () => {
    const id1 = await getDeviceId();
    expect(id1).toMatch(/^dev_[a-f0-9]{16}$/);

    // Repeated call must return identical cached device ID
    const id2 = await getDeviceId();
    expect(id2).toBe(id1);
  });

  it('should default enabled to true and allow toggling', async () => {
    const defaultState = await isEnabled();
    expect(defaultState).toBe(true);

    await setEnabled(false);
    expect(await isEnabled()).toBe(false);

    await setEnabled(true);
    expect(await isEnabled()).toBe(true);
  });

  it('should retrieve default earnings and accurately add earnings increments', async () => {
    const initial = await getEarnings();
    expect(initial.balance_usd).toBeGreaterThan(0);
    expect(initial.impressions_today).toBe(4);

    const prevBalance = initial.balance_usd;
    const increment = 0.009; // 1 qualified impression
    const updated = await addEarnings(increment);

    expect(updated.balance_usd).toBe(Number((prevBalance + increment).toFixed(4)));
    expect(updated.impressions_today).toBe(initial.impressions_today + 1);
  });

  it('should store and retrieve cached ads', async () => {
    expect(await getCachedAds()).toEqual([]);

    const mockAds: AdCreative[] = [
      {
        id: 'ad_cursor',
        headline: 'AI code editor',
        sponsor_name: 'Cursor',
        url: 'https://cursor.com',
        ad_token: 'tok_1',
      },
    ];

    await setCachedAds(mockAds);
    const retrieved = await getCachedAds();
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].sponsor_name).toBe('Cursor');
  });

  it('should enqueue and drain impression events atomically', async () => {
    const event1: ImpressionEvent = {
      event_id: 'evt_001',
      ad_id: 'ad_cursor',
      ad_token: 'tok_1',
      device_id: 'dev_123',
      timestamp: Date.now(),
      dwell_ms: 4500,
      ai_platform: 'chatgpt',
    };

    const event2: ImpressionEvent = {
      event_id: 'evt_002',
      ad_id: 'ad_pplx',
      ad_token: 'tok_2',
      device_id: 'dev_123',
      timestamp: Date.now(),
      dwell_ms: 5200,
      ai_platform: 'claude',
    };

    await enqueueEvent(event1);
    await enqueueEvent(event2);

    const drained = await drainQueuedEvents();
    expect(drained).toHaveLength(2);
    expect(drained[0].event_id).toBe('evt_001');
    expect(drained[1].event_id).toBe('evt_002');

    // Queue must now be empty
    const secondDrain = await drainQueuedEvents();
    expect(secondDrain).toHaveLength(0);
  });

  it('should cap the queued events at MAX_QUEUED_EVENTS to prevent memory exhaustion', async () => {
    // Enqueue 110 events
    for (let i = 0; i < 110; i++) {
      await enqueueEvent({
        event_id: `evt_${i}`,
        ad_id: 'ad_test',
        ad_token: 'tok_test',
        device_id: 'dev_test',
        timestamp: Date.now(),
        dwell_ms: 4200,
        ai_platform: 'chatgpt',
      });
    }

    const drained = await drainQueuedEvents();
    expect(drained).toHaveLength(100);
    // Oldest 10 (0..9) should have been pruned, remaining starts at evt_10
    expect(drained[0].event_id).toBe('evt_10');
    expect(drained[99].event_id).toBe('evt_109');
  });

  it('should manage authenticated user session and reset earnings to $0.0000 on fresh login', async () => {
    // 1. Initially no user logged in
    expect(await getAuthUser()).toBeNull();

    // 2. Set authenticated user
    const mockUser = {
      email: 'founder@pathixo.com',
      name: 'Pathixo Founder',
      logged_in: true,
      logged_in_at: new Date().toISOString(),
      provider: 'google' as const,
    };

    await setAuthUser(mockUser);
    const loggedUser = await getAuthUser();
    expect(loggedUser).not.toBeNull();
    expect(loggedUser?.email).toBe('founder@pathixo.com');
    expect(loggedUser?.logged_in).toBe(true);

    // 3. Reset earnings for new user onboarding
    const reset = await resetEarningsForNewUser();
    expect(reset.balance_usd).toBe(0.0);
    expect(reset.lifetime_earned_usd).toBe(0.0);
    expect(reset.impressions_today).toBe(0);

    const activeEarnings = await getEarnings();
    expect(activeEarnings.balance_usd).toBe(0.0);

    // 4. Log out user
    await setAuthUser(null);
    expect(await getAuthUser()).toBeNull();
  });
});
