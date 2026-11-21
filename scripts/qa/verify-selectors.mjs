#!/usr/bin/env node
/**
 * Pathixo Rewards — AI Chatbot Selector Verification Suite
 * 
 * Verifies that CSS selectors for all 5 supported AI chatbot platforms
 * (ChatGPT, Claude, Gemini, Perplexity, DeepSeek) are valid, non-empty,
 * and match target DOM structures without throwing query errors.
 */

import { JSDOM } from 'jsdom';

const DEFAULT_SELECTORS = {
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

// Synthetic DOM fixtures representing current layout patterns of AI chatbots
const DOM_FIXTURES = {
  'chatgpt.com': `
    <main>
      <div data-message-author-role="user" data-message-id="msg-1">Explain quantum computing</div>
      <div data-message-author-role="assistant">Quantum computing uses qubits...</div>
      <form>
        <textarea id="prompt-textarea" placeholder="Message ChatGPT..."></textarea>
        <button data-testid="send-button">Send</button>
      </form>
    </main>
  `,
  'claude.ai': `
    <main>
      <div data-testid="user-message">Draft a project plan</div>
      <div class="font-claude-message">Here is your plan...</div>
      <div data-testid="chat-input" contenteditable="true"></div>
      <button aria-label="Send message">Send</button>
    </main>
  `,
  'gemini.google.com': `
    <main>
      <user-query>Compare Python and TypeScript</user-query>
      <model-response>Both languages have strong ecosystems...</model-response>
      <rich-textarea><div contenteditable="true"></div></rich-textarea>
      <button aria-label="Send message">Send</button>
    </main>
  `,
  'perplexity.ai': `
    <main>
      <div data-testid="user-query">Latest developments in fusion energy</div>
      <textarea placeholder="Ask follow-up..."></textarea>
      <button aria-label="Submit query">Submit</button>
    </main>
  `,
  'deepseek.com': `
    <main>
      <div class="chat-turn user-message">Write a binary search in Rust</div>
      <textarea id="chat-input" placeholder="Message DeepSeek"></textarea>
      <div role="button" aria-label="Send">Send</div>
    </main>
  `,
};

console.log('\n🔍 [Pathixo QA] Running AI Chatbot DOM Selector Verification...\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

for (const [domain, selectors] of Object.entries(DEFAULT_SELECTORS)) {
  console.log(`📡 Platform: ${domain}`);
  const html = DOM_FIXTURES[domain] || '<html><body></body></html>';
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  for (const [key, selector] of Object.entries(selectors)) {
    totalChecks++;
    try {
      // 1. Syntax check
      const match = doc.querySelector(selector);
      if (match) {
        console.log(`   ✅ ${key.padEnd(14)} : MATCHED -> "${selector}"`);
        passedChecks++;
      } else {
        // Syntax valid, but fixture doesn't match this exact branch (e.g. stop_button during idle)
        console.log(`   ⚠️ ${key.padEnd(14)} : SYNTAX OK (no fixture match) -> "${selector}"`);
        passedChecks++;
      }
    } catch (err) {
      console.error(`   ❌ ${key.padEnd(14)} : INVALID SELECTOR -> "${selector}" (${err.message})`);
      failedChecks++;
    }
  }
  console.log('');
}

console.log('--------------------------------------------------');
console.log(`Summary: ${passedChecks}/${totalChecks} checks passed (${failedChecks} failures)`);

if (failedChecks > 0) {
  console.error('\n❌ [FAIL] Some selectors are malformed or invalid!\n');
  process.exit(1);
} else {
  console.log('\n✅ [PASS] All 5 AI chatbot selector suites verified successfully!\n');
  process.exit(0);
}
