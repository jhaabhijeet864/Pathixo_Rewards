import { defineContentScript } from 'wxt/sandbox';

export default defineContentScript({
  matches: [
    'http://localhost:3000/*',
    'https://*.github.io/*',
    'https://pathixo.com/*',
    'https://*.pathixo.com/*',
  ],
  runAt: 'document_idle',
  main() {
    console.log('[Pathixo Rewards] Web Auth Bridge initialized.');

    // Signal to the web page that the extension is active
    window.postMessage({ type: 'PATHIXO_EXTENSION_DETECTED', version: '0.1.0' }, '*');

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

      if (event.data.type === 'PATHIXO_AUTH_LOGIN') {
        const { user } = event.data;
        try {
          const res = (await browser.runtime.sendMessage({
            type: 'AUTH_LOGIN_SUCCESS',
            user,
          })) as { success: boolean; earnings?: unknown; user?: unknown } | undefined;

          window.postMessage({
            type: 'PATHIXO_AUTH_ACK',
            success: res?.success ?? true,
            earnings: res?.earnings,
            user: res?.user,
          }, '*');
        } catch (err) {
          console.debug('[Pathixo Rewards] Failed to forward auth to background:', err);
        }
      }
    });

    // Forward real-time impression notifications from extension background worker to web page
    try {
      browser.runtime.onMessage.addListener((message: unknown) => {
        const msg = message as { type: string; earnings?: unknown; ad?: unknown };
        if (msg && msg.type === 'PATHIXO_NEW_IMPRESSION') {
          window.postMessage({
            type: 'PATHIXO_IMPRESSION_LOGGED',
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
