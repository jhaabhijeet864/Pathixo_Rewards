import {
  getDeviceId,
  isEnabled,
  setEnabled,
  getEarnings,
  addEarnings,
  enqueueEvent,
  drainQueuedEvents,
  setCachedAds,
} from '../lib/storage';
import { fetchAdBundle, sendImpressionEvents } from '../lib/api';
import type { ImpressionEvent } from '@pathixo/shared';

export default defineBackground(() => {
  console.log('[Pathixo Rewards] Service Worker activated.');

  // Initialize device ID
  getDeviceId().then(async (deviceId) => {
    console.log('[Pathixo Rewards] Device registered:', deviceId);
    syncAds(deviceId);
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
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'GET_STATE') {
      Promise.all([getDeviceId(), isEnabled(), getEarnings()]).then(
        ([deviceId, enabled, earnings]) => {
          sendResponse({ deviceId, enabled, earnings });
        }
      );
      return true; // Keep message channel open for async response
    }

    if (message.type === 'SET_ENABLED') {
      setEnabled(!!message.enabled).then(() => {
        sendResponse({ success: true, enabled: !!message.enabled });
      });
      return true;
    }

    if (message.type === 'RECORD_QUALIFIED_IMPRESSION') {
      const event = message.event as ImpressionEvent;
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

    if (message.type === 'OPEN_DASHBOARD') {
      getDeviceId().then((deviceId) => {
        const url = `http://localhost:3000/dashboard?device_id=${encodeURIComponent(deviceId)}`;
        browser.tabs.create({ url });
        sendResponse({ success: true });
      });
      return true;
    }
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
