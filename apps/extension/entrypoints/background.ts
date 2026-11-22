import {
  getDeviceId,
  isEnabled,
  setEnabled,
  getEarnings,
  setEarnings,
  addEarnings,
  enqueueEvent,
  drainQueuedEvents,
  setCachedAds,
  getAuthUser,
  setAuthUser,
  resetEarningsForNewUser,
  getViewedAds,
  addViewedAd,
  type AuthUser,
  type ViewedAdRecord,
} from '../lib/storage';
import { fetchAdBundle, sendImpressionEvents } from '../lib/api';
import type { ImpressionEvent, UserEarnings } from '@pathixo/shared';

interface RuntimeMessage {
  type: string;
  enabled?: boolean;
  event?: ImpressionEvent;
  ad?: { sponsor_name?: string; headline?: string; target_cpm?: number };
  user?: AuthUser;
  earnings?: UserEarnings;
}

const DASHBOARD_BASE = (typeof process !== 'undefined' && process.env?.PATHIXO_WEB_URL)
  ? process.env.PATHIXO_WEB_URL
  : 'http://localhost:3000';

export default defineBackground(() => {
  console.log('[Pathixo Rewards] Service Worker activated.');

  // Initialize device ID
  getDeviceId().then(async (deviceId) => {
    console.log('[Pathixo Rewards] Device registered:', deviceId);
    syncAds(deviceId);
  });

  // Auto-open login/activation page on install / unpack
  browser.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
      const deviceId = await getDeviceId();
      const existingUser = await getAuthUser();
      if (!existingUser) {
        const loginUrl = `${DASHBOARD_BASE}/login?source=extension&deviceId=${encodeURIComponent(deviceId)}`;
        try {
          browser.tabs.create({ url: loginUrl });
        } catch (err) {
          console.debug('[Pathixo Rewards] Could not auto-open install tab:', err);
        }
      }
    }
  });

  // Periodic alarm for flushing impression events and refreshing ads
  browser.alarms.create('pathixo_sync_alarm', {
    periodInMinutes: 10,
  });

  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'pathixo_sync_alarm') {
      performSync();
    }
  });

  // Message handler for Popup and Content Scripts
  browser.runtime.onMessage.addListener((message: unknown, _sender, sendResponse): true => {
    const msg = message as RuntimeMessage;
    if (!msg || !msg.type) return true;

    if (msg.type === 'GET_STATE') {
      Promise.all([getDeviceId(), isEnabled(), getEarnings(), getAuthUser(), getViewedAds()]).then(
        ([deviceId, enabled, earnings, user, viewedAds]) => {
          sendResponse({ deviceId, enabled, earnings, user, viewedAds });
        }
      );
      return true;
    }

    if (msg.type === 'SET_ENABLED') {
      setEnabled(!!msg.enabled).then(() => {
        sendResponse({ success: true, enabled: !!msg.enabled });
      });
      return true;
    }

    if (msg.type === 'RECORD_QUALIFIED_IMPRESSION' && msg.event) {
      (async () => {
        const canonicalDeviceId = await getDeviceId();
        const authUser = await getAuthUser();

        const event = msg.event!;
        // Guarantee canonical device ID and user email on event
        event.device_id = canonicalDeviceId;
        if (authUser?.email && !event.user_email) {
          event.user_email = authUser.email;
        }

        // Dynamic per-ad variable payout: 60% of (target_cpm / 1000) with subtle natural variance (±5%)
        const cpm = Number(msg.ad?.target_cpm) || 2.20;
        const baseCredit = (cpm / 1000) * 0.60;
        const jitter = 1 + (Math.random() * 0.10 - 0.05); // ±5% subtle variance
        const creditPerImpression = Number((baseCredit * jitter).toFixed(5));

        event.earned_usd = creditPerImpression;

        const formatPlatform = (p: string) => {
          const lower = (p || '').toLowerCase();
          if (lower.includes('chatgpt')) return 'ChatGPT o3-mini';
          if (lower.includes('claude')) return 'Claude 3.7 Sonnet';
          if (lower.includes('gemini')) return 'Google Gemini 4 Argon';
          if (lower.includes('perplexity')) return 'Perplexity Pro';
          if (lower.includes('deepseek')) return 'DeepSeek R1';
          return p ? p.charAt(0).toUpperCase() + p.slice(1) : 'AI Wait';
        };

        const viewedRecord: ViewedAdRecord = {
          id: event.event_id,
          sponsor: msg.ad?.sponsor_name || 'Sponsored Partner',
          headline: msg.ad?.headline || 'Wait-time sponsored message',
          model: formatPlatform(event.ai_platform),
          dwellSeconds: Number(((event.dwell_ms || 4000) / 1000).toFixed(1)),
          earnedUsd: creditPerImpression,
          timestamp: event.timestamp || Date.now(),
          verified: true,
        };

        const [updatedEarnings, _, updatedAds] = await Promise.all([
          addEarnings(creditPerImpression),
          enqueueEvent(event),
          addViewedAd(viewedRecord),
        ]);

        console.log('[Pathixo Rewards] Qualified impression logged! New balance: $' + updatedEarnings.balance_usd);

        // IMMEDIATELY dispatch HTTP event to backend server so userStore & campaignStore are in sync instantly
        sendImpressionEvents([event]).then(async (sent) => {
          if (sent) {
            // Also drain and flush any previously queued offline events
            const queued = await drainQueuedEvents();
            if (queued.length > 0) {
              const flushed = await sendImpressionEvents(queued);
              if (!flushed) {
                for (const evt of queued) {
                  await enqueueEvent(evt);
                }
              }
            }
          }
        }).catch((err) => {
          console.debug('[Pathixo Rewards] Immediate dispatch failed, left in queue:', err);
        });

        // Notify open dashboard tabs in real time
        try {
          const tabs = await browser.tabs.query({});
          for (const tab of tabs) {
            if (tab.id) {
              browser.tabs.sendMessage(tab.id, {
                type: 'PATHIXO_NEW_IMPRESSION',
                deviceId: canonicalDeviceId,
                earnings: updatedEarnings,
                ad: viewedRecord,
              }).catch(() => {});
            }
          }
        } catch {
          // ignore
        }

        sendResponse({ success: true, earnings: updatedEarnings, viewedAds: updatedAds });
      })();
      return true;
    }

    if (msg.type === 'SET_EARNINGS' && msg.earnings) {
      setEarnings(msg.earnings).then(() => {
        sendResponse({ success: true, earnings: msg.earnings });
      });
      return true;
    }

    if (msg.type === 'OPEN_DASHBOARD') {
      getDeviceId().then((deviceId) => {
        const url = `${DASHBOARD_BASE}/dashboard?device_id=${encodeURIComponent(deviceId)}`;
        browser.tabs.create({ url });
        sendResponse({ success: true });
      });
      return true;
    }

    if (msg.type === 'OPEN_LOGIN') {
      getDeviceId().then((deviceId) => {
        const url = `${DASHBOARD_BASE}/login?source=extension&deviceId=${encodeURIComponent(deviceId)}`;
        browser.tabs.create({ url });
        sendResponse({ success: true });
      });
      return true;
    }

    if (msg.type === 'AUTH_LOGIN_SUCCESS' && msg.user) {
      const user = msg.user;
      Promise.all([
        setAuthUser(user),
        resetEarningsForNewUser(),
      ]).then(([_, freshEarnings]) => {
        console.log('[Pathixo Rewards] User signed in and verified:', user.email);
        sendResponse({ success: true, earnings: freshEarnings, user });
      });
      return true;
    }

    if (msg.type === 'AUTH_LOGOUT') {
      setAuthUser(null).then(() => {
        sendResponse({ success: true });
      });
      return true;
    }

    return true;
  });

  async function performSync() {
    const deviceId = await getDeviceId();
    const queued = await drainQueuedEvents();
    if (queued.length > 0) {
      const sent = await sendImpressionEvents(queued);
      if (!sent) {
        for (const evt of queued) {
          await enqueueEvent(evt);
        }
      }
    }
    await syncAds(deviceId);
  }

  async function syncAds(deviceId: string) {
    const freshAds = await fetchAdBundle(deviceId);
    if (freshAds && freshAds.length > 0) {
      await setCachedAds(freshAds);
    }
  }
});
