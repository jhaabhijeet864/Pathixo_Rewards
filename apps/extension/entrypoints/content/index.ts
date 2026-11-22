import type { AdCreative, ImpressionEvent, PromptAdapter, SupportedPlatform } from '@pathixo/shared';
import {
  ChatGPTAdapter,
  ClaudeAdapter,
  GeminiAdapter,
  PerplexityAdapter,
  DeepSeekAdapter,
} from './adapters';
import { PathixoAdCard } from './ad-card';

const MIN_DWELL_MS = 4000; // 4 seconds minimum active dwell time

const FALLBACK_ADS: AdCreative[] = [
  {
    id: 'ad_house_vakxo',
    headline: 'Run AI Agents Locally: 0 API Cost',
    sponsor_name: 'Vakxo',
    url: 'https://vakxo.pathixo.com/',
    icon_url: '/house-ads/pathixo-icon.jpg',
    badge: 'By Pathixo',
    is_house_ad: true,
    ad_token: 'tok_house_vakxo_001',
  },
  {
    id: 'ad_house_pathixo',
    headline: 'Pathixo AI Labs: Builds AI Native Apps',
    sponsor_name: 'Pathixo',
    url: 'https://pathixo.com/',
    icon_url: '/house-ads/pathixo-icon.jpg',
    badge: 'By Pathixo',
    is_house_ad: true,
    ad_token: 'tok_house_pathixo_002',
  },
  {
    id: 'ad_house_krocpdf',
    headline: 'Create PDFs and Other Docs: 100% Locally, Anti-ilovePDF',
    sponsor_name: 'KrocPDF',
    url: 'https://jpg-to-pdf-zeta.vercel.app/',
    icon_url: '/house-ads/krocpdf-icon.png',
    badge: '100% Local',
    is_house_ad: true,
    ad_token: 'tok_house_krocpdf_003',
  },
  {
    id: 'ad_house_blip',
    headline: 'Vanish From Meeting with just a snap',
    sponsor_name: 'Blip',
    url: 'https://blip-hnu8.vercel.app/',
    icon_url: '/house-ads/blip-icon.png',
    badge: 'Chrome Extension',
    is_house_ad: true,
    ad_token: 'tok_house_blip_004',
  },
];

async function getAvailableAds(): Promise<AdCreative[]> {
  try {
    const data = await browser.storage.local.get('cached_ads');
    if (Array.isArray(data.cached_ads) && data.cached_ads.length > 0) {
      return data.cached_ads as AdCreative[];
    }
  } catch {
    // Fallback if local storage unavailable
  }
  return FALLBACK_ADS;
}

function resolvePlatform(hostname: string): { adapter: PromptAdapter; platform: SupportedPlatform } | null {
  if (hostname.includes('chatgpt.com')) return { adapter: new ChatGPTAdapter(), platform: 'chatgpt' };
  if (hostname.includes('claude.ai')) return { adapter: new ClaudeAdapter(), platform: 'claude' };
  if (hostname.includes('gemini.google.com')) return { adapter: new GeminiAdapter(), platform: 'gemini' };
  if (hostname.includes('perplexity.ai')) return { adapter: new PerplexityAdapter(), platform: 'perplexity' };
  if (hostname.includes('deepseek.com')) return { adapter: new DeepSeekAdapter(), platform: 'deepseek' };
  return null;
}

export default defineContentScript({
  matches: [
    'https://chatgpt.com/*',
    'https://claude.ai/*',
    'https://gemini.google.com/*',
    'https://www.perplexity.ai/*',
    'https://chat.deepseek.com/*',
  ],
  runAt: 'document_idle',
  main() {
    const resolved = resolvePlatform(window.location.hostname);
    if (!resolved) return;
    const { adapter, platform } = resolved;

    console.log('[Pathixo Rewards] Content script active on:', platform);

    let activeCard: PathixoAdCard | null = null;
    let currentAd: AdCreative | null = null;
    let cardStartTime = 0;
    let isTabFocusedDuringWait = true;
    let dismissedThisTurn = false;
    let registeredDeviceId = 'dev_guest';

    // Track tab visibility during active wait
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        isTabFocusedDuringWait = false;
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    adapter.start({
      onSubmit() {
        if (activeCard) {
          activeCard.unmount();
          activeCard = null;
        }
        dismissedThisTurn = false;
        isTabFocusedDuringWait = document.visibilityState === 'visible';
      },

      async onAnchorReady(anchor: HTMLElement) {
        if (dismissedThisTurn) return;

        // Verify if user paused sponsored cards in extension settings and get device ID
        try {
          const state = (await browser.runtime.sendMessage({ type: 'GET_STATE' })) as {
            deviceId?: string;
            enabled?: boolean;
          } | undefined;

          if (state?.deviceId) {
            registeredDeviceId = state.deviceId;
          }

          if (state && state.enabled === false) {
            console.debug('[Pathixo Rewards] Ads currently paused by user toggle.');
            return;
          }
        } catch {
          // If background worker busy, proceed with defaults
        }

        if (adapter.hostAdVisible()) {
          console.debug('[Pathixo Rewards] Host ad visible, suppressing injection.');
          return;
        }

        activeCard = new PathixoAdCard();
        activeCard.mount(anchor);
        cardStartTime = Date.now();

        const ads = await getAvailableAds();
        currentAd = ads[Math.floor(Math.random() * ads.length)];

        activeCard.render(currentAd, {
          onDismiss() {
            dismissedThisTurn = true;
            activeCard = null;
            currentAd = null;
            cardStartTime = 0;
          },
          onClick() {
            console.debug('[Pathixo Rewards] Clicked ad:', currentAd?.id);
          },
        });
      },

      onReanchor(newAnchor: HTMLElement) {
        if (activeCard && activeCard.mounted) {
          activeCard.reanchor(newAnchor);
        }
      },

      async onDone() {
        if (!activeCard || !activeCard.mounted || !currentAd || cardStartTime === 0) {
          return;
        }

        const elapsedMs = Date.now() - cardStartTime;

        // Anti-Fraud Dwell & Focus Verification
        if (elapsedMs >= MIN_DWELL_MS && isTabFocusedDuringWait && !dismissedThisTurn) {
          const impressionEvent: ImpressionEvent = {
            event_id: `evt_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
            ad_id: currentAd.id,
            ad_token: currentAd.ad_token,
            device_id: registeredDeviceId,
            timestamp: Date.now(),
            dwell_ms: elapsedMs,
            ai_platform: platform,
          };

          try {
            await browser.runtime.sendMessage({
              type: 'RECORD_QUALIFIED_IMPRESSION',
              event: impressionEvent,
            });
            console.log(`[Pathixo Rewards] Verified ${elapsedMs}ms dwell time! Reward credited.`);
          } catch (err) {
            console.debug('[Pathixo Rewards] Failed to notify service worker:', err);
          }
        } else {
          console.debug(`[Pathixo Rewards] Unqualified impression (Dwell: ${elapsedMs}ms, Focused: ${isTabFocusedDuringWait})`);
        }

        // Clean up state
        cardStartTime = 0;
      },
    });
  },
});
