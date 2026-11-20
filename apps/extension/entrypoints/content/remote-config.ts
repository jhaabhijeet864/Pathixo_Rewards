import type { DomainSelectors, RemoteSelectorConfig } from '@pathixo/shared';

const CACHE_KEY = 'pathixo_remote_selectors';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export const DEFAULT_SELECTORS: Record<string, DomainSelectors> = {
  'chatgpt.com': {
    composer: '#prompt-textarea, [data-mobile-composer-prompt], [data-composer-markdown]',
    send_button: '[data-testid="send-button"], button[data-composer-submit], form button[type="submit"][aria-label="Send"]',
    stop_button: 'button[aria-label="Stop"], button[data-testid="stop-button"]',
    user_bubble: '[data-message-author-role="user"], [data-user-message-bubble]',
    turn_anchor: '[data-chatgpt-search-unit-key]',
  },
  'claude.ai': {
    composer: '[data-testid="chat-input"]',
    send_button: 'button[aria-label="Send message"]',
    user_bubble: '[data-testid="user-message"]',
  },
  'gemini.google.com': {
    composer: 'rich-textarea [contenteditable]',
    send_button: 'button[aria-label="Send message"]',
    user_bubble: 'user-query',
    turn_anchor: 'model-response',
  },
  'perplexity.ai': {
    composer: 'textarea[placeholder*="Ask"], [contenteditable="true"]',
    send_button: 'button[aria-label*="Submit"], button[type="submit"]',
    user_bubble: '[data-testid="user-query"], div[class*="query-text"]',
  },
  'deepseek.com': {
    composer: 'textarea#chat-input, textarea[placeholder*="DeepSeek"]',
    send_button: 'div[role="button"][aria-label="Send"], button[aria-label="Send"]',
    stop_button: 'button[aria-label="Stop"]',
    user_bubble: 'div[class*="user-message"], div[data-role="user"]',
  },
};

export async function getSelectorsForHost(host: string): Promise<DomainSelectors> {
  try {
    const cached = await browser.storage.local.get(CACHE_KEY);
    const data = cached[CACHE_KEY] as { timestamp: number; config: RemoteSelectorConfig } | undefined;

    if (data && Date.now() - data.timestamp < CACHE_TTL_MS) {
      for (const [domainKey, selectors] of Object.entries(data.config.domains)) {
        if (host.includes(domainKey)) {
          return selectors;
        }
      }
    }
  } catch (err) {
    console.debug('[Pathixo Rewards] Storage read fallback:', err);
  }

  // Fallback to bundled defaults
  for (const [domainKey, selectors] of Object.entries(DEFAULT_SELECTORS)) {
    if (host.includes(domainKey)) {
      return selectors;
    }
  }

  return DEFAULT_SELECTORS['chatgpt.com'];
}
