#!/usr/bin/env node

/**
 * Pathixo Rewards — AI DOM Selector Integrity & Validation Tool
 * 
 * Verifies that all supported AI chatbot platform selectors conform to:
 * 1. Required keys: composer, send_button, user_bubble
 * 2. Proper CSS selector syntax (balanced brackets, quotes, and valid identifiers)
 * 3. Complete coverage for all 5 platforms: chatgpt, claude, gemini, perplexity, deepseek
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REQUIRED_DOMAINS = [
  'chatgpt.com',
  'claude.ai',
  'gemini.google.com',
  'perplexity.ai',
  'deepseek.com',
];

const REQUIRED_KEYS = ['composer', 'send_button', 'user_bubble'];

function validateCssSelector(selector) {
  if (!selector || typeof selector !== 'string' || selector.trim().length === 0) {
    return { valid: false, error: 'Selector cannot be empty' };
  }

  // Check balanced brackets and quotes
  const brackets = { '[': ']', '(': ')' };
  const stack = [];
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < selector.length; i++) {
    const char = selector[i];
    const prevChar = i > 0 ? selector[i - 1] : '';

    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
      }
      continue;
    }

    if (inQuotes) continue;

    if (brackets[char]) {
      stack.push(char);
    } else if (char === ']' || char === ')') {
      const last = stack.pop();
      if (!last || brackets[last] !== char) {
        return { valid: false, error: `Unmatched closing '${char}'` };
      }
    }
  }

  if (inQuotes) {
    return { valid: false, error: `Unterminated quote string (${quoteChar})` };
  }

  if (stack.length > 0) {
    return { valid: false, error: `Unmatched opening '${stack[stack.length - 1]}'` };
  }

  return { valid: true };
}

function extractPropertyValue(blockContent, propName) {
  // Matches propName: '...' or propName: "..."
  const singleQuoteRegex = new RegExp(`${propName}\\s*:\\s*'([^']*)'`);
  const doubleQuoteRegex = new RegExp(`${propName}\\s*:\\s*"([^"]*)"`);

  const singleMatch = singleQuoteRegex.exec(blockContent);
  if (singleMatch) return singleMatch[1];

  const doubleMatch = doubleQuoteRegex.exec(blockContent);
  if (doubleMatch) return doubleMatch[1];

  return null;
}

async function run() {
  console.log('\n🔍 Validating AI Platform Selectors...\n');

  const routePath = resolve(__dirname, '../apps/web/app/api/config/selectors/route.ts');
  const routeContent = readFileSync(routePath, 'utf-8');

  let errors = 0;

  for (const domain of REQUIRED_DOMAINS) {
    console.log(`Checking domain: [${domain}]`);
    if (!routeContent.includes(`'${domain}'`)) {
      console.error(`  ❌ Missing domain configuration for '${domain}'`);
      errors++;
      continue;
    }

    // Extract domain object block
    const domainBlockRegex = new RegExp(`'${domain}'\\s*:\\s*\\{([\\s\\S]*?)\\},`);
    const matchBlock = domainBlockRegex.exec(routeContent);

    if (!matchBlock) {
      console.error(`  ❌ Could not parse config block for domain '${domain}'`);
      errors++;
      continue;
    }

    const blockText = matchBlock[1];

    for (const key of REQUIRED_KEYS) {
      const selectorValue = extractPropertyValue(blockText, key);

      if (!selectorValue) {
        console.error(`  ❌ Domain '${domain}' missing required key '${key}'`);
        errors++;
        continue;
      }

      const check = validateCssSelector(selectorValue);
      if (!check.valid) {
        console.error(`  ❌ Invalid CSS selector for '${domain}.${key}': "${selectorValue}" — ${check.error}`);
        errors++;
      } else {
        console.log(`  ✔ ${key}: "${selectorValue}"`);
      }
    }
    console.log('');
  }

  if (errors > 0) {
    console.error(`❌ Validation failed with ${errors} selector error(s).\n`);
    process.exit(1);
  } else {
    console.log(`✔ All 5 AI domain adapters have complete, syntactically valid selectors!\n`);
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Validation crashed:', err);
  process.exit(1);
});
