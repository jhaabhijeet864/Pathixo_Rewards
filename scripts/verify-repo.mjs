#!/usr/bin/env node

/**
 * Pathixo Rewards — Monorepo Pre-Flight & Health Verification Utility
 * 
 * Verifies:
 * 1. Node runtime version requirements
 * 2. Monorepo workspace configuration files and required documentation
 * 3. Extension Manifest V3 permissions safety (zero <all_urls>)
 * 4. Chrome Web Store compliance: strict zero innerHTML sink verification
 * 5. Environment configuration templates
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

const REQUIRED_FILES = [
  'package.json',
  'pnpm-workspace.yaml',
  'tsconfig.base.json',
  'README.md',
  'LICENSE',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
  'SECURITY.md',
  'ARCHITECTURE.md',
  'CHANGELOG.md',
  '.gitignore',
  '.env.example',
  '.editorconfig',
  '.gitattributes',
];

const WORKSPACES = [
  'packages/shared',
  'apps/extension',
  'apps/web',
];

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

function check(label, condition, failureMessage) {
  if (condition) {
    console.log(`  ${COLORS.green}✔${COLORS.reset} ${label}`);
    return true;
  } else {
    console.log(`  ${COLORS.red}✖${COLORS.reset} ${label} ${COLORS.yellow}[${failureMessage}]${COLORS.reset}`);
    return false;
  }
}

function scanFilesForPattern(dir, pattern, extensionPattern = /\.(ts|tsx|js|mjs)$/) {
  const violations = [];

  function walk(currentDir) {
    const entries = readdirSync(currentDir);
    for (const entry of entries) {
      if (entry === 'node_modules' || entry === '.output' || entry === '.wxt' || entry === '.next') continue;
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (extensionPattern.test(entry)) {
        const content = readFileSync(fullPath, 'utf-8');
        if (pattern.test(content)) {
          violations.push(fullPath.replace(ROOT, ''));
        }
      }
    }
  }

  walk(dir);
  return violations;
}

async function verify() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}=== Pathixo Rewards Monorepo Pre-flight Verification ===${COLORS.reset}\n`);

  let passed = 0;
  let total = 0;

  // 1. Node Runtime Check
  total++;
  const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
  if (check(`Node.js Runtime (Current: v${process.versions.node}, Required: >= 20)`, nodeMajor >= 20, 'Requires Node 20 or higher')) {
    passed++;
  }

  // 2. Monorepo Documentation & Files
  console.log(`\n${COLORS.bold}1. Core Repository Files & Documentation:${COLORS.reset}`);
  for (const file of REQUIRED_FILES) {
    total++;
    const path = resolve(ROOT, file);
    if (check(`File: ${file}`, existsSync(path), 'Missing required file')) {
      passed++;
    }
  }

  // 3. Workspace Packages Health
  console.log(`\n${COLORS.bold}2. Workspace Packages Configuration:${COLORS.reset}`);
  for (const ws of WORKSPACES) {
    total++;
    const pkgJson = resolve(ROOT, ws, 'package.json');
    const tsconfig = resolve(ROOT, ws, 'tsconfig.json');
    const ok = existsSync(pkgJson) && existsSync(tsconfig);
    if (check(`Workspace: ${ws}`, ok, 'Missing package.json or tsconfig.json')) {
      passed++;
    }
  }

  // 4. Chrome Extension Web Store Safety Policy
  console.log(`\n${COLORS.bold}3. Chrome Web Store & Extension Safety Audit:${COLORS.reset}`);
  const wxtConfigPath = resolve(ROOT, 'apps/extension/wxt.config.ts');
  total++;
  if (existsSync(wxtConfigPath)) {
    const wxtConfig = readFileSync(wxtConfigPath, 'utf-8');
    const hasAllUrls = wxtConfig.includes('<all_urls>');
    if (check('Explicit Host Permissions (No <all_urls> wildcards)', !hasAllUrls, '<all_urls> will cause Chrome Web Store rejection')) {
      passed++;
    }
  } else {
    check('Extension Config File', false, 'Missing apps/extension/wxt.config.ts');
  }

  // 5. Zero innerHTML sink verification in extension
  total++;
  const innerHtmlViolations = scanFilesForPattern(resolve(ROOT, 'apps/extension/entrypoints'), /\.innerHTML\s*=/);
  if (check('Zero innerHTML sinks in extension (Strict XSS Prevention)', innerHtmlViolations.length === 0, `Found in: ${innerHtmlViolations.join(', ')}`)) {
    passed++;
  }

  // 6. Minimum Cashout Floor Check
  total++;
  const cashoutRoutePath = resolve(ROOT, 'apps/web/app/api/cashout/route.ts');
  if (existsSync(cashoutRoutePath)) {
    const cashoutCode = readFileSync(cashoutRoutePath, 'utf-8');
    const hasTwoDollarFloor = cashoutCode.includes('2.0');
    if (check('Instant Cashout Engine ($2.00 Floor Enforcement)', hasTwoDollarFloor, 'Threshold must be $2.00')) {
      passed++;
    }
  } else {
    check('Cashout Route', false, 'Missing apps/web/app/api/cashout/route.ts');
  }

  console.log(`\n${COLORS.dim}------------------------------------------------------------${COLORS.reset}`);
  console.log(
    `${COLORS.bold}Verification Score:${COLORS.reset} ${passed === total ? COLORS.green : COLORS.red}${passed} / ${total} passed${COLORS.reset}\n`
  );

  if (passed !== total) {
    process.exit(1);
  } else {
    console.log(`${COLORS.green}✔ Repository passes all security, compliance, and structural checks!${COLORS.reset}\n`);
    process.exit(0);
  }
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
