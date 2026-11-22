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
    id: 'ad_sponsor_cursor',
    headline: 'Build software 10x faster with Cursor — The AI code editor.',
    sponsor_name: 'Cursor',
    url: 'https://cursor.com/?ref=pathixo',
    icon_url: 'https://cursor.com/favicon.ico',
    badge: 'Trending AI',
    is_house_ad: false,
    target_cpm: 4.50,
    ad_token: 'tok_b2b_cursor_2026',
  },
  {
    id: 'ad_house_vakxo',
    headline: 'Run AI Agents Locally: 0 API Cost',
    sponsor_name: 'Vakxo',
    url: 'https://vakxo.pathixo.com/',
    icon_url: '/house-ads/pathixo-icon.png',
    badge: 'By Pathixo',
    is_house_ad: true,
    target_cpm: 2.50,
    ad_token: 'tok_house_vakxo_001',
  },
  {
    id: 'ad_sponsor_perplexity',
    headline: 'Instant research with verified sources using Perplexity Pro.',
    sponsor_name: 'Perplexity',
    url: 'https://perplexity.ai/pro?ref=pathixo',
    icon_url: 'https://www.perplexity.ai/favicon.ico',
    badge: 'Pro Pick',
    is_house_ad: false,
    target_cpm: 3.20,
    ad_token: 'tok_b2b_pplx_2026',
  },
  {
    id: 'ad_house_pathixo',
    headline: 'Pathixo AI Labs: Builds AI Native Apps',
    sponsor_name: 'Pathixo',
    url: 'https://pathixo.com/',
    icon_url: '/house-ads/pathixo-icon.png',
    badge: 'By Pathixo',
    is_house_ad: true,
    target_cpm: 2.80,
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
    target_cpm: 2.00,
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
    target_cpm: 2.20,
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

let lastServedAdId: string | null = null;
let currentRotationIndex = 0;
let rotationLoaded = false;

/**
 * Strict Anti-Repetition & Round-Robin Sequential Ad Rotation.
 * Guarantees that every new prompt shows a fresh, different ad without consecutive repeats.
 */
async function getNextAdCreative(): Promise<AdCreative> {
  const ads = await getAvailableAds();
  if (!ads || ads.length === 0) return FALLBACK_ADS[0];
  if (ads.length === 1) return ads[0];

  if (!rotationLoaded) {
    try {
      const stored = await browser.storage.local.get(['pathixo_ad_rotation_index', 'pathixo_last_ad_id']);
      if (typeof stored.pathixo_ad_rotation_index === 'number') {
        currentRotationIndex = stored.pathixo_ad_rotation_index;
      }
      if (typeof stored.pathixo_last_ad_id === 'string') {
        lastServedAdId = stored.pathixo_last_ad_id;
      }
      rotationLoaded = true;
    } catch {}
  }

  // Filter out the last served ad to strictly prevent back-to-back repetitions
  const filtered = ads.filter((a) => a.id !== lastServedAdId);
  const pool = filtered.length > 0 ? filtered : ads;

  // Round-robin pick next in sequence
  const nextIdx = currentRotationIndex % pool.length;
  const chosen = pool[nextIdx];

  // Advance index and persist for next prompt
  currentRotationIndex = (currentRotationIndex + 1) % 10000;
  lastServedAdId = chosen.id;

  try {
    await browser.storage.local.set({
      pathixo_ad_rotation_index: currentRotationIndex,
      pathixo_last_ad_id: chosen.id,
    });
  } catch {}

  console.log(`[Pathixo Rewards] Serving fresh ad [${chosen.sponsor_name} - ${chosen.id}], rotation #${currentRotationIndex}`);
  return chosen;
}

function resolvePlatform(hostname: string): { adapter: PromptAdapter; platform: SupportedPlatform } | null {
  if (hostname.includes('chatgpt.com')) return { adapter: new ChatGPTAdapter(), platform: 'chatgpt' };
  if (hostname.includes('claude.ai')) return { adapter: new ClaudeAdapter(), platform: 'claude' };
  if (hostname.includes('gemini.google.com')) return { adapter: new GeminiAdapter(), platform: 'gemini' };
  if (hostname.includes('perplexity.ai')) return { adapter: new PerplexityAdapter(), platform: 'perplexity' };
  if (hostname.includes('deepseek.com')) return { adapter: new DeepSeekAdapter(), platform: 'deepseek' };
  return null;
}

interface SustainedCardEntry {
  id: string;
  card: PathixoAdCard;
  ad: AdCreative;
  anchor: HTMLElement;
  turnKey: string;
  userPromptText: string;
  dismissed: boolean;
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

    const sustainedCards: SustainedCardEntry[] = [];
    let activeCard: PathixoAdCard | null = null;
    let currentAd: AdCreative | null = null;
    let cardStartTime = 0;
    let isTabFocusedDuringWait = true;
    let dismissedThisTurn = false;
    let registeredDeviceId = 'dev_guest';

    // Self-healing continuous persistence enforcer:
    // When host frameworks (React, Angular, Next.js) re-render message turns after streaming,
    // they remove or reorder foreign DOM nodes. This reconciler ensures all ad cards remain permanently sustained in the conversation.
    const findReplacementAnchor = (entry: SustainedCardEntry): HTMLElement | null => {
      // Case 1: Search by turnKey / data-message-id
      if (entry.turnKey && entry.turnKey.length > 3) {
        const byId = document.querySelector<HTMLElement>(`[data-message-id="${entry.turnKey}"]`);
        if (byId) {
          const article = byId.closest<HTMLElement>('article');
          return article || byId;
        }
      }

      // Case 2: Search by prompt text content
      if (entry.userPromptText) {
        const queryList = document.querySelectorAll<HTMLElement>(
          'article, [data-message-author-role="user"], [data-user-message-bubble], [data-testid="user-message"], user-query'
        );
        for (let i = queryList.length - 1; i >= 0; i--) {
          const node = queryList[i];
          if (node.textContent && node.textContent.includes(entry.userPromptText.slice(0, 25))) {
            const article = node.closest<HTMLElement>('article');
            return article || node;
          }
        }
      }

      // Case 3: Fallback to last user message container
      const userList = document.querySelectorAll<HTMLElement>(
        'article, [data-message-author-role="user"], [data-testid="user-message"], user-query'
      );
      if (userList.length > 0) {
        return userList[userList.length - 1];
      }

      return null;
    };

    const enforceSustainedMount = () => {
      for (const entry of sustainedCards) {
        if (entry.dismissed) continue;

        const cardEl = entry.card.element;

        let anchor = entry.anchor && entry.anchor.isConnected && document.body.contains(entry.anchor)
          ? entry.anchor
          : findReplacementAnchor(entry);

        if (anchor && anchor.isConnected) {
          entry.anchor = anchor;
          if (anchor.nextElementSibling !== cardEl || !document.body.contains(cardEl)) {
            anchor.after(cardEl);
            cardEl.style.display = 'block';
          }
        }
      }
    };

    // Permanent DOM mutation observer to ensure cards never vanish
    const sustainObserver = new MutationObserver(() => {
      enforceSustainedMount();
    });
    sustainObserver.observe(document.body, { childList: true, subtree: true });

    // Fallback heartbeat timer
    const sustainHeartbeat = setInterval(enforceSustainedMount, 350);

    // Track tab visibility during active wait
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        isTabFocusedDuringWait = false;
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Record verified impression helper
    const recordImpression = async (ad: AdCreative, elapsedMs: number) => {
      const impressionEvent: ImpressionEvent = {
        event_id: `evt_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
        ad_id: ad.id,
        ad_token: ad.ad_token,
        device_id: registeredDeviceId,
        timestamp: Date.now(),
        dwell_ms: elapsedMs,
        ai_platform: platform,
      };

      try {
        await browser.runtime.sendMessage({
          type: 'RECORD_QUALIFIED_IMPRESSION',
          event: impressionEvent,
          ad: {
            sponsor_name: ad.sponsor_name,
            headline: ad.headline,
            target_cpm: ad.target_cpm,
          },
        });
        console.log(`[Pathixo Rewards] Verified ${elapsedMs}ms dwell time! Reward credited.`);
      } catch (err) {
        console.debug('[Pathixo Rewards] Failed to notify service worker:', err);
      }
    };

    adapter.start({
      onSubmit() {
        // Complete any pending dwell qualification for previous active card before starting new turn
        if (activeCard && cardStartTime > 0 && currentAd) {
          const elapsed = Date.now() - cardStartTime;
          if (elapsed >= MIN_DWELL_MS && isTabFocusedDuringWait && !dismissedThisTurn) {
            recordImpression(currentAd, elapsed);
          }
        }

        // Previous card stays sustained in chat history!
        activeCard = null;
        currentAd = null;
        cardStartTime = 0;
        dismissedThisTurn = false;
        isTabFocusedDuringWait = document.visibilityState === 'visible';
      },

      async onAnchorReady(anchor: HTMLElement) {
        if (dismissedThisTurn) return;

        // Prevent duplicate card on the same prompt anchor
        const next = anchor.nextElementSibling;
        if (next && next.getAttribute('data-pathixo-card-container') === 'true') {
          return;
        }

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

        // 1. Resolve fresh non-repeating ad creative FIRST
        const chosenAd = await getNextAdCreative();
        currentAd = chosenAd;

        const promptText = anchor.textContent?.trim().slice(0, 80) || '';
        const messageId =
          anchor.getAttribute('data-message-id') ||
          anchor.closest('[data-message-id]')?.getAttribute('data-message-id') ||
          promptText;

        // 2. Prepare card & populate content before DOM attachment (Zero empty DOM gap)
        const newCard = new PathixoAdCard();
        activeCard = newCard;
        cardStartTime = Date.now();

        const entry: SustainedCardEntry = {
          id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          card: newCard,
          ad: chosenAd,
          anchor,
          turnKey: messageId,
          userPromptText: promptText,
          dismissed: false,
        };
        sustainedCards.push(entry);

        newCard.render(chosenAd, {
          onDismiss() {
            entry.dismissed = true;
            dismissedThisTurn = true;
            if (activeCard === newCard) {
              activeCard = null;
              currentAd = null;
              cardStartTime = 0;
            }
          },
          onClick() {
            console.debug('[Pathixo Rewards] Clicked ad:', chosenAd.id);
          },
        });

        // 3. Atomically mount fully rendered card
        newCard.mount(anchor);
      },

      onReanchor(newAnchor: HTMLElement) {
        if (activeCard) {
          activeCard.ensureMounted(newAnchor);
        }
        enforceSustainedMount();
      },

      async onDone() {
        if (!activeCard || !activeCard.mounted || !currentAd || cardStartTime === 0) {
          return;
        }

        const elapsedMs = Date.now() - cardStartTime;

        // Anti-Fraud Dwell & Focus Verification
        if (elapsedMs >= MIN_DWELL_MS && isTabFocusedDuringWait && !dismissedThisTurn) {
          await recordImpression(currentAd, elapsedMs);
        } else {
          console.debug(
            `[Pathixo Rewards] Unqualified impression (Dwell: ${elapsedMs}ms, Focused: ${isTabFocusedDuringWait})`
          );
        }

        // Clean up timing state, but leave the ad card permanently mounted and sustained in the DOM!
        cardStartTime = 0;
        enforceSustainedMount();
      },
    });
  },
});
