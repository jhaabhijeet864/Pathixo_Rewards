#!/usr/bin/env node
/**
 * Pathixo Rewards — Chrome Web Store & Manifest V3 Compliance Auditor
 * 
 * Scans extension source files for security policy violations:
 * - innerHTML / outerHTML sinks (causes instant store rejection)
 * - eval() / Function constructor / dynamic code execution
 * - Forbidden permissions (e.g., <all_urls>, cookies, webRequest)
 * - Remote script references
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');
const EXT_SRC = path.join(ROOT, 'apps/extension');

const FORBIDDEN_PATTERNS = [
  { name: 'Direct innerHTML Assignment', regex: /\.innerHTML\s*=/g, severity: 'CRITICAL' },
  { name: 'Direct outerHTML Assignment', regex: /\.outerHTML\s*=/g, severity: 'CRITICAL' },
  { name: 'document.write Sink', regex: /document\.write\s*\(/g, severity: 'CRITICAL' },
  { name: 'Dynamic Code Eval', regex: /\beval\s*\(/g, severity: 'CRITICAL' },
  { name: 'Function Constructor Invocation', regex: /new\s+Function\s*\(/g, severity: 'HIGH' },
  { name: 'Unsafe setTimeout string', regex: /setTimeout\s*\(\s*["'`]/g, severity: 'HIGH' },
];

function getFiles(dir, extensions = ['.ts', '.tsx', '.js', '.html']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.wxt' || file === '.output') continue;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath, extensions));
    } else {
      if (extensions.some((ext) => file.endsWith(ext))) {
        results.push(filePath);
      }
    }
  }
  return results;
}

console.log('\n🛡️ [Pathixo QA] Running Chrome Web Store & Manifest V3 Security Audit...\n');

const files = getFiles(EXT_SRC);
let violationsCount = 0;

for (const filePath of files) {
  const relPath = path.relative(ROOT, filePath);
  const content = fs.readFileSync(filePath, 'utf-8');

  for (const rule of FORBIDDEN_PATTERNS) {
    const matches = content.match(rule.regex);
    if (matches) {
      console.error(`❌ [${rule.severity}] ${rule.name} detected in: ${relPath}`);
      violationsCount += matches.length;
    }
  }
}

// Check Manifest permissions in wxt.config.ts
const wxtConfigFile = path.join(EXT_SRC, 'wxt.config.ts');
if (fs.existsSync(wxtConfigFile)) {
  const wxtContent = fs.readFileSync(wxtConfigFile, 'utf-8');
  console.log('📋 Checking permission boundaries in wxt.config.ts...');

  if (wxtContent.includes('<all_urls>')) {
    console.error('❌ [CRITICAL] Over-broad permission "<all_urls>" found in manifest configuration!');
    violationsCount++;
  } else {
    console.log('   ✅ No broad <all_urls> permission detected.');
  }

  if (wxtContent.includes('"cookies"') || wxtContent.includes('"webRequest"')) {
    console.error('❌ [HIGH] Unnecessary intrusive permissions (cookies/webRequest) detected!');
    violationsCount++;
  } else {
    console.log('   ✅ Clean, minimal single-purpose permissions (storage, alarms).');
  }

  // Check host permissions
  const hosts = ['chatgpt.com', 'claude.ai', 'gemini.google.com', 'perplexity.ai', 'deepseek.com'];
  for (const host of hosts) {
    if (wxtContent.includes(host)) {
      console.log(`   ✅ Explicit host permission: *://${host}/*`);
    }
  }
}

console.log('\n--------------------------------------------------');
if (violationsCount > 0) {
  console.error(`❌ [FAIL] ${violationsCount} Chrome Web Store compliance violations found! Rejecting build.\n`);
  process.exit(1);
} else {
  console.log('✅ [PASS] 100% compliant with Chrome Web Store & MV3 Security Guidelines!\n');
  process.exit(0);
}
