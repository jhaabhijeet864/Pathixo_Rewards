import type { AdCreative, PromptAdapter } from '@pathixo/shared';
import {
  ChatGPTAdapter,
  ClaudeAdapter,
  GeminiAdapter,
  PerplexityAdapter,
  DeepSeekAdapter,
} from './adapters';
import { PathixoAdCard } from './ad-card';

// Default high-yield affiliate fallbacks ensure 100% fill rate from Day 1
const FALLBACK_ADS: AdCreative[] = [
  {
    id: 'ad_fallback_cursor',
    headline: 'Build software 10x faster with Cursor — The AI code editor.',
    sponsor_name: 'Cursor',
    url: 'https://cursor.com/?ref=pathixo',
    badge: 'Trending AI',
    is_house_ad: true,
    ad_token: 'tok_house_cursor_001',
  },
  {
    id: 'ad_fallback_perplexity',
    headline: 'Get instant answers with sources using Perplexity Pro.',
    sponsor_name: 'Perplexity',
    url: 'https://perplexity.ai/pro?ref=pathixo',
    badge: 'Recommended',
    is_house_ad: true,
    ad_token: 'tok_house_pplx_002',
  },
  {
    id: 'ad_fallback_notion',
    headline: 'Organize your thoughts, projects & docs with Notion AI.',
    sponsor_name: 'Notion',
    url: 'https://notion.so/?ref=pathixo',
    badge: 'Popular',
    is_house_ad: true,
    ad_token: 'tok_house_notion_003',
  },
];

function selectAd(): AdCreative {
  const index = Math.floor(Math.random() * FALLBACK_ADS.length);
  return FALLBACK_ADS[index];
}

function resolveAdapter(hostname: string): PromptAdapter | null {
  if (hostname.includes('chatgpt.com')) return new ChatGPTAdapter();
  if (hostname.includes('claude.ai')) return new ClaudeAdapter();
  if (hostname.includes('gemini.google.com')) return new GeminiAdapter();
  if (hostname.includes('perplexity.ai')) return new PerplexityAdapter();
  if (hostname.includes('deepseek.com')) return new DeepSeekAdapter();
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
    const adapter = resolveAdapter(window.location.hostname);
    if (!adapter) {
      console.debug('[Pathixo Rewards] No matching adapter for host:', window.location.hostname);
      return;
    }

    console.log('[Pathixo Rewards] Active adapter attached for:', adapter.host);

    let activeCard: PathixoAdCard | null = null;
    let cardStartTime = 0;

    adapter.start({
      onSubmit() {
        if (activeCard) {
          activeCard.unmount();
          activeCard = null;
        }
      },

      onAnchorReady(anchor: HTMLElement) {
        if (adapter.hostAdVisible()) {
          console.debug('[Pathixo Rewards] Host ad detected, suppressing injection.');
          return;
        }

        activeCard = new PathixoAdCard();
        activeCard.mount(anchor);
        cardStartTime = Date.now();

        const ad = selectAd();
        activeCard.render(ad, {
          onDismiss() {
            activeCard = null;
            cardStartTime = 0;
          },
          onClick() {
            console.debug('[Pathixo Rewards] Ad clicked:', ad.id);
          },
        });
      },

      onReanchor(newAnchor: HTMLElement) {
        if (activeCard && activeCard.mounted) {
          activeCard.reanchor(newAnchor);
        }
      },

      onDone() {
        if (!activeCard || !activeCard.mounted) return;
        const dwellMs = Date.now() - cardStartTime;
        console.debug('[Pathixo Rewards] Generation completed. Dwell time:', dwellMs, 'ms');
      },
    });
  },
});
