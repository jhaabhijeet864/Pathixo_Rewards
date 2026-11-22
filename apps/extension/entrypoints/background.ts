import {
  getDeviceId,
  isEnabled,
  setEnabled,
  getEarnings,
  addEarnings,
  enqueueEvent,
  drainQueuedEvents,
  setCachedAds,
  getAuthUser,
  setAuthUser,
  resetEarningsForNewUser,
  type AuthUser,
} from '../lib/storage';
import { fetchAdBundle, sendImpressionEvents } from '../lib/api';
import type { ImpressionEvent } from '@pathixo/shared';

interface RuntimeMessage {
  type: string;
  enabled?: boolean;
  event?: ImpressionEvent;
  user?: AuthUser;
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
      Promise.all([getDeviceId(), isEnabled(), getEarnings(), getAuthUser()]).then(
        ([deviceId, enabled, earnings, user]) => {
          sendResponse({ deviceId, enabled, earnings, user });
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
      const event = msg.event;
      // Calculate earnings credit: 60% of $0.015 ($0.009 per qualified impression)
      const creditPerImpression = 0.009;
      Promise.all([addEarnings(creditPerImpression), enqueueEvent(event)]).then(
        ([updatedEarnings]) => {
          console.log('[Pathixo Rewards] Qualified impression logged! New balance: $' + updatedEarnings.balance_usd);
          sendResponse({ success: true, earnings: updatedEarnings });
        }
      );
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
