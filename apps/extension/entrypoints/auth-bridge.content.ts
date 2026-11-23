import { defineContentScript } from 'wxt/sandbox';

export default defineContentScript({
  matches: [
    'http://localhost:3000/*',
    'https://pathixorewards.com/*',
  ],
  runAt: 'document_idle',
  main() {
    console.log('[Pathixo Rewards] Web Auth Bridge initialized.');

    // Signal to the web page that the extension is active with full initial state
    try {
      browser.runtime.sendMessage({ type: 'GET_STATE' }).then((state: any) => {
        window.postMessage({
          type: 'PATHIXO_EXTENSION_DETECTED',
          version: '0.1.0',
          installed: true,
          deviceId: state?.deviceId,
          user: state?.user,
          earnings: state?.earnings,
          viewedAds: state?.viewedAds,
        }, '*');
      }).catch(() => {
        window.postMessage({ type: 'PATHIXO_EXTENSION_DETECTED', version: '0.1.0', installed: true }, '*');
      });
    } catch {
      window.postMessage({ type: 'PATHIXO_EXTENSION_DETECTED', version: '0.1.0', installed: true }, '*');
    }

    window.addEventListener('message', async (event) => {
      if (event.source !== window || !event.data || typeof event.data !== 'object') {
        return;
      }

      if (event.data.type === 'PATHIXO_PING_EXTENSION') {
        try {
          const state = (await browser.runtime.sendMessage({ type: 'GET_STATE' })) as {
            deviceId?: string;
            user?: unknown;
            earnings?: unknown;
            viewedAds?: unknown;
          } | undefined;

          window.postMessage({
            type: 'PATHIXO_EXTENSION_PONG',
            installed: true,
            deviceId: state?.deviceId,
            user: state?.user,
            earnings: state?.earnings,
            viewedAds: state?.viewedAds,
          }, '*');
        } catch {
          window.postMessage({ type: 'PATHIXO_EXTENSION_PONG', installed: true }, '*');
        }
      }

      if (event.data.type === 'PATHIXO_CLEAR_HISTORY') {
        try {
          await browser.runtime.sendMessage({ type: 'CLEAR_VIEWED_ADS' });
        } catch {
          console.debug('[Pathixo Rewards] Could not clear extension ad history.');
        }
      }
    });

    // Forward real-time impression notifications from extension background worker to web page
    try {
      browser.runtime.onMessage.addListener((message: unknown) => {
        const msg = message as { type: string; deviceId?: string; earnings?: unknown; ad?: unknown };
        if (msg && msg.type === 'PATHIXO_NEW_IMPRESSION') {
          window.postMessage({
            type: 'PATHIXO_IMPRESSION_LOGGED',
            deviceId: msg.deviceId,
            earnings: msg.earnings,
            ad: msg.ad,
          }, '*');
        }
      });
    } catch {
      // ignore
    }
  },
});
