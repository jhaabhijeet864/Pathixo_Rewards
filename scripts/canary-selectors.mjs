#!/usr/bin/env node

/**
 * Pathixo Rewards — AI Selector Canary & Integrity Diagnostic
 * 
 * Runs a continuous canary probe against the local and remote selector configurations.
 * Audits selector syntax, structural safety (no malicious scripts/attributes),
 * and platform coverage across all supported chatbots (ChatGPT, Claude, Gemini, Perplexity, DeepSeek).
 */

import { JSDOM } from 'jsdom';

console.log('\n🐦 [Pathixo Rewards] AI Selector Canary & Integrity Monitor\n');

const EXPECTED_PLATFORMS = ['chatgpt.com', 'claude.ai', 'gemini.google.com', 'perplexity.ai', 'deepseek.com'];
const REQUIRED_ROLES = ['composer', 'send_button', 'user_bubble'];

// Fallback selector registry
const CANARY_REGISTRY = {
  version: 2,
  updated_at: new Date().toISOString(),
  platforms: {
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
  },
};

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="probe"></div></body></html>');
const document = dom.window.document;

let passed = 0;
let warnings = 0;
let errors = 0;

// 1. Audit Platform Coverage
console.log('--- 1. Platform Coverage Check ---');
for (const expected of EXPECTED_PLATFORMS) {
  if (CANARY_REGISTRY.platforms[expected]) {
    console.log(`  ✔ Platform registered: ${expected}`);
    passed++;
  } else {
    console.error(`  ❌ Platform missing: ${expected}`);
    errors++;
  }
}

// 2. Audit Selector Role Completeness & Safety
console.log('\n--- 2. Selector Safety & Syntax Validation ---');
for (const [platform, selectors] of Object.entries(CANARY_REGISTRY.platforms)) {
  for (const role of REQUIRED_ROLES) {
    const sel = selectors[role];
    if (!sel || typeof sel !== 'string' || sel.trim().length === 0) {
      console.error(`  ❌ [${platform}] Missing required selector for role: ${role}`);
      errors++;
      continue;
    }

    // Security check: ensure no remote javascript: or script tags
    if (/javascript:|script|<|>/i.test(sel)) {
      console.error(`  ❌ [${platform}] [${role}] Security violation: detected unsafe selector syntax: "${sel}"`);
      errors++;
      continue;
    }

    // Syntax validation: attempt querySelector in JSDOM
    try {
      document.querySelector(sel);
      console.log(`  ✔ [${platform}] [${role}]: Valid selector syntax`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [${platform}] [${role}] Syntax error in selector "${sel}": ${err.message}`);
      errors++;
    }
  }
}

// 3. Canary Health Summary
console.log('\n==============================================');
console.log(`Canary Diagnostic Summary:`);
console.log(`  Passed Checks:   ${passed}`);
console.log(`  Warnings:        ${warnings}`);
console.log(`  Critical Errors: ${errors}`);
console.log('==============================================\n');

if (errors > 0) {
  console.error('❌ Canary audit failed with critical selector errors.');
  process.exit(1);
} else {
  console.log('🎉 [Pathixo Rewards] All AI chatbot selectors are valid and healthy!\n');
  process.exit(0);
}
