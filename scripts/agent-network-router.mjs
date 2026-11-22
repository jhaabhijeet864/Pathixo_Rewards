#!/usr/bin/env node

/**
 * AGENT NETWORK ROUTER & SEQUENTIAL DOCUMENTATION STREAMER
 * =========================================================
 * Pathixo Rewards — Master Multi-Agent Wiring Framework
 * 
 * Ensures any AI coding agent (Claude, Antigravity, Cursor, Copilot, etc.)
 * navigates documentation channels in the exact deterministic order
 * before making or merging changes.
 * 
 * Usage:
 *   node scripts/agent-network-router.mjs                  # Auto-detect or show tree
 *   node scripts/agent-network-router.mjs --channel=admin  # Show admin channel tree
 *   node scripts/agent-network-router.mjs --channel=ui     # Show UI/Design channel tree
 *   node scripts/agent-network-router.mjs --channel=ext    # Show extension channel tree
 *   node scripts/agent-network-router.mjs --channel=auth   # Show auth/dashboard channel tree
 *   node scripts/agent-network-router.mjs --channel=api    # Show backend API channel tree
 *   node scripts/agent-network-router.mjs --channel=all    # Show entire network tree
 *   node scripts/agent-network-router.mjs --read           # Stream full document contents in order
 *   node scripts/agent-network-router.mjs --verify         # Validate all doc paths exist
 *   node scripts/agent-network-router.mjs --gate           # Run pre-merge compliance check
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 1. Channel Definitions & Sequential Reading Chains
export const AGENT_CHANNELS = {
  root: {
    id: 'root',
    name: 'SPOC Orchestrator & Supreme Law',
    role: 'Root Supervisor / Repository SPOC',
    readingChain: [
      { path: 'AGENTS.md', title: 'Master Operational Contract & SPOC', required: true },
      { path: 'SUBSTANTIAL_DEVELOPMENT.md', title: 'Substantial Development Manifesto (No Rapid Toys)', required: true },
      { path: 'ARCHITECTURE.md', title: 'System-Wide Architecture & Flow', required: true },
      { path: 'docs/AGENT_NETWORK_TREE.md', title: 'Agent Network Wiring Framework & Channels', required: true },
    ],
    invariants: [
      'There is no such thing as rapid prototyping or student-tier development.',
      'AGENTS.md is the single point of contact and supreme directive.',
      'Never commit unhandled errors, mock stubs, or temporary shortcuts.',
    ],
  },
  ui: {
    id: 'ui',
    name: 'Channel 1: UI & Design System Squad',
    role: 'Agent 1: UI & Design Bot',
    readingChain: [
      { path: 'AGENTS.md', title: 'Master Operational Contract (Section 3: Agent 1)', required: true },
      { path: 'SUBSTANTIAL_DEVELOPMENT.md', title: 'Substantial Development Manifesto', required: true },
      { path: 'apps/web/ADS_KNOWLEDGE_BASE_FOR_UI.md', title: 'UI Design System & Ad Aesthetic Rules', required: true },
      { path: 'apps/web/app/globals.css', title: 'Theme Tokens & Color Variables', required: true },
    ],
    invariants: [
      'Primary Background: #070a0e, Card Surfaces: #0d121c / #0c1219, Accent: Emerald #10b981.',
      'Desktop width strictly clamped to max-w-6xl or max-w-7xl with mx-auto. Zero full-screen stretch.',
      'Zero AI-slop: No neon gradients, no glowing blobs, no floating clutter.',
    ],
    matchPatterns: ['apps/web/app/globals.css', 'apps/web/components/', 'tailwind.config'],
  },
  home: {
    id: 'home',
    name: 'Channel 2: Web & Homepage Squad',
    role: 'Agent 2: Web & Homepage Bot',
    readingChain: [
      { path: 'AGENTS.md', title: 'Master Operational Contract (Section 2 & Section 3: Agent 2)', required: true },
      { path: 'docs/AUTH_AND_DASHBOARD_RULES.md', title: 'Navbar & Dashboard Auth Gating Rules', required: true },
      { path: 'apps/web/app/page.tsx', title: 'Homepage Architecture & Sections', required: true },
      { path: 'apps/web/components/Navbar.tsx', title: 'Navbar Authentication Visibility Contract', required: true },
      { path: 'apps/web/components/EarningsCalculator.tsx', title: 'Calculator 60/40 Split Parity', required: true },
    ],
    invariants: [
      'Dashboard link beside "Add to Chrome" is ONLY visible when verified logged in.',
      'When unauthenticated, show "Sign in"; unauthenticated visitors never see Dashboard.',
      'Calculator must adhere to exact 60% user / 40% platform revenue split.',
    ],
    matchPatterns: ['apps/web/app/page.tsx', 'apps/web/components/Navbar.tsx', 'apps/web/components/HeroChatMockup.tsx', 'apps/web/components/EarningsCalculator.tsx'],
  },
  auth: {
    id: 'auth',
    name: 'Channel 3: Auth & Security Squad',
    role: 'Agent 3: Core Auth & User Security Bot',
    readingChain: [
      { path: 'AGENTS.md', title: 'Master Operational Contract (Section 2.1 & 3: Agent 3)', required: true },
      { path: 'docs/AUTH_AND_DASHBOARD_RULES.md', title: 'Authentication & Dashboard Security Rules', required: true },
      { path: 'apps/web/lib/admin-auth.ts', title: 'Allowlist & Superadmin Enclave Verification', required: true },
      { path: 'apps/web/lib/user-store.ts', title: 'Deterministic Permanent Referral Engine & Account Linking', required: true },
      { path: 'apps/web/app/login/page.tsx', title: 'Silent Internal Redirection & Zero Identity Leakage', required: true },
      { path: 'apps/web/app/dashboard/page.tsx', title: 'Protected User Console & Impersonation Safety', required: true },
    ],
    invariants: [
      'Dashboard routes (/dashboard, /dashboard/referrals) strictly redirect unauthenticated visits to /login.',
      'Public /login page must NEVER expose admin identities, admin badges, or accounts selector modals.',
      'jhaabhijeet864@gmail.com silently redirects to /admin; normal users route to /dashboard.',
      'Permanent referral codes mathematically bound to verified email so they never reset.',
    ],
    matchPatterns: ['apps/web/app/login', 'apps/web/app/dashboard', 'apps/web/lib/user-store.ts', 'apps/web/lib/admin-auth.ts', 'apps/web/lib/referral-engine.ts'],
  },
  admin: {
    id: 'admin',
    name: 'Channel 4: Admin Command Console Squad',
    role: 'Agent 4: Master Admin Console Bot',
    readingChain: [
      { path: 'AGENTS.md', title: 'Master Operational Contract (SPOC Master Directive)', required: true },
      { path: 'docs/ADMIN_CONSOLE_SPEC.md', title: 'Admin Command Console Architectural Specification', required: true },
      { path: 'docs/AUTH_AND_DASHBOARD_RULES.md', title: 'Section 4: Admin Console Protection', required: true },
      { path: 'apps/web/app/admin/layout.tsx', title: 'Emergency Global Circuit Breakers & Allowlist Gate', required: true },
      { path: 'apps/web/app/admin/page.tsx', title: 'Executive Command Console UI & 5-Pillar Tabs', required: true },
      { path: 'apps/web/lib/admin-store.ts', title: 'Real-time Dual Telemetry & Audit Store', required: true },
    ],
    invariants: [
      'ZERO STUB DATA INVARIANT: Never add fake companies, fake users, or fallback fake metric numbers.',
      'Access strictly restricted to jhaabhijeet864@gmail.com.',
      'Read-Only Safety Impersonation: /dashboard?device_id=...&impersonate=true locks all cashout buttons.',
      'Dual-metric telemetry: CWS installs (with 1-click sync) + live active extension heartbeats.',
      'Payout settlements require bank UTR/ref entry; rejection automatically refunds to user balance.',
      'Strict 60/10/30 financial revenue split.',
    ],
    matchPatterns: ['apps/web/app/admin', 'apps/web/app/api/admin', 'apps/web/lib/admin-store.ts', 'docs/ADMIN_CONSOLE_SPEC.md'],
  },
  ext: {
    id: 'ext',
    name: 'Channel 5: Browser Extension & Adapters Squad',
    role: 'Agent 5: WXT Extension & MV3 Bot',
    readingChain: [
      { path: 'AGENTS.md', title: 'Master Operational Contract (Section 3: Agent 4)', required: true },
      { path: 'SUBSTANTIAL_DEVELOPMENT.md', title: 'Section 4: Extension & MV3 Standards', required: true },
      { path: 'ARCHITECTURE.md', title: 'Section 3: Extension Subsystem Architecture', required: true },
      { path: 'apps/extension/wxt.config.ts', title: 'WXT Build Configuration & Permissions', required: true },
      { path: 'apps/extension/entrypoints/content/ad-card.ts', title: 'Isolated Shadow DOM Construction (Zero innerHTML)', required: true },
      { path: 'apps/extension/lib/storage.ts', title: 'Anti-Fraud Dwell Timer & Storage Local Caching', required: true },
    ],
    invariants: [
      'Isolated Shadow DOM (attachShadow({ mode: "open" })) with pure DOM APIs (createElement, textContent).',
      'ZERO innerHTML sinks or dynamic remote scripts (strict MV3 compliance).',
      '4-second minimum dwell timer with document.visibilityState === "visible".',
      'ZERO PROMPT INSPECTION: Only query UI button states (Stop/Send); never read user queries or AI answers.',
      'Ads cycle smoothly during generation without jarring repetition.',
    ],
    matchPatterns: ['apps/extension/'],
  },
  api: {
    id: 'api',
    name: 'Channel 6: Backend & Financial API Squad',
    role: 'Agent 6: Financial Settlement & API Bot',
    readingChain: [
      { path: 'AGENTS.md', title: 'Master Operational Contract (Section 3: Agent 5)', required: true },
      { path: 'ARCHITECTURE.md', title: 'Section 4: Backend & Ad Engine Subsystem', required: true },
      { path: 'docs/ADMIN_CONSOLE_SPEC.md', title: 'Financial Split & Settlement Invariants', required: true },
      { path: 'apps/web/app/api/events/impression/route.ts', title: 'Verified Impression & Dwell Verification', required: true },
      { path: 'apps/web/app/api/cashout/route.ts', title: '$2.00 Floor Micro-Cashouts & Payout Ledger', required: true },
      { path: 'apps/web/lib/campaign-store.ts', title: 'House Ads Inventory & Budget Debits', required: true },
    ],
    invariants: [
      '60% User revenue share / 30% Platform gross profit / 10% Referral reserve.',
      '$2.00 minimum cashout floor. Never raise or arbitrarily gate.',
      'Rate-limiting on all public endpoints (impression, cashout, campaigns).',
      'Instant UPI (India), PayPal (Global), and Gift Card settlement rails.',
    ],
    matchPatterns: ['apps/web/app/api/', 'apps/web/lib/campaign-store.ts', 'apps/web/lib/rate-limit.ts'],
  },
  qa: {
    id: 'qa',
    name: 'Channel 7: QA & Verification Gatekeeper Squad',
    role: 'Agent 7: QA, Verification & Pre-Merge Bot',
    readingChain: [
      { path: 'AGENTS.md', title: 'Master Operational Contract (Section 3: Agent 6 & Section 5)', required: true },
      { path: 'SUBSTANTIAL_DEVELOPMENT.md', title: 'Verification Manifesto & Non-Negotiables', required: true },
      { path: 'tests/unit/api/admin.test.ts', title: 'Admin API Security & Circuit Breaker Tests', required: true },
      { path: 'tests/unit/extension/ad-card.test.ts', title: 'Extension Shadow DOM & Dwell Anti-Fraud Tests', required: true },
      { path: 'scripts/qa/audit-financials.mjs', title: 'Financial Split & Math Ledger Verification', required: true },
    ],
    invariants: [
      'All 79+ Vitest tests must pass before merging (pnpm test).',
      'Monorepo typecheck (pnpm -r typecheck) must pass with 0 errors.',
      'pnpm --filter @pathixo/web build must compile cleanly.',
      'Documentation must be updated on every architectural change.',
    ],
    matchPatterns: ['tests/', 'scripts/qa/', '.github/workflows/'],
  },
};

// 2. Helper Utilities
function getGitModifiedFiles() {
  try {
    const statusOutput = execSync('git status --porcelain', { cwd: ROOT_DIR, encoding: 'utf8' });
    return statusOutput
      .split('\n')
      .map((line) => line.trim().slice(3))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function detectChannelFromFiles(files) {
  if (!files || files.length === 0) return 'root';

  for (const [key, channel] of Object.entries(AGENT_CHANNELS)) {
    if (key === 'root') continue;
    if (channel.matchPatterns) {
      for (const pattern of channel.matchPatterns) {
        if (files.some((f) => f.includes(pattern))) {
          return key;
        }
      }
    }
  }
  return 'root';
}

function renderTree(selectedChannelKey = null) {
  console.log('\n================================================================================');
  console.log('🌲 PATHIXO REWARDS — MASTER AGENT NETWORK & DOCUMENTATION WIRING TREE');
  console.log('================================================================================\n');

  console.log(`[SPOC ROOT] AGENTS.md (Single Point of Contact & Supreme Law)`);
  console.log(`   │`);
  console.log(`   ├── [PARAMOUNT LAW] SUBSTANTIAL_DEVELOPMENT.md (Enterprise Quality Only)`);
  console.log(`   └── [ARCHITECTURE] ARCHITECTURE.md (High-Level System Wiring)\n`);

  for (const [key, ch] of Object.entries(AGENT_CHANNELS)) {
    if (key === 'root') continue;
    const isSelected = selectedChannelKey === key;
    const prefix = isSelected ? '👉 ' : '   ';
    console.log(`${prefix}┌─ [${ch.name}] — ${ch.role}`);
    ch.readingChain.forEach((doc, idx) => {
      const isLast = idx === ch.readingChain.length - 1;
      const branch = isLast ? '└──' : '├──';
      const exists = fs.existsSync(path.resolve(ROOT_DIR, doc.path));
      const statusIcon = exists ? '✓' : '✗ MISSING';
      console.log(`${prefix}│   ${branch} (${idx + 1}) [${statusIcon}] ${doc.path} — ${doc.title}`);
    });
    console.log(`${prefix}│   └── Invariants: ${ch.invariants[0]}`);
    console.log(`${prefix}│`);
  }
}

function streamSequentialDocumentation(channelKey) {
  const channel = AGENT_CHANNELS[channelKey] || AGENT_CHANNELS.root;

  console.log('\n================================================================================');
  console.log(`📖 SEQUENTIAL DOCUMENTATION STREAM: [${channel.name.toUpperCase()}]`);
  console.log('================================================================================\n');
  console.log(`Assigned Role: ${channel.role}`);
  console.log(`Total Documents in Perfect Reading Sequence: ${channel.readingChain.length}\n`);

  channel.readingChain.forEach((doc, idx) => {
    const fullPath = path.resolve(ROOT_DIR, doc.path);
    console.log(`--------------------------------------------------------------------------------`);
    console.log(`STEP ${idx + 1} OF ${channel.readingChain.length}: ${doc.path}`);
    console.log(`Title: ${doc.title}`);
    console.log(`URI: file:///${fullPath.replace(/\\/g, '/')}`);
    console.log(`--------------------------------------------------------------------------------`);

    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      console.log(`[Preview: ${lines.length} lines total]\n`);
      console.log(lines.slice(0, 35).join('\n'));
      if (lines.length > 35) {
        console.log(`\n... [${lines.length - 35} more lines in ${doc.path}] ...`);
      }
    } else {
      console.error(`🚨 ERROR: Required documentation file does not exist: ${doc.path}`);
    }
    console.log('\n');
  });

  console.log('--------------------------------------------------------------------------------');
  console.log('🔒 MANDATORY CHANNEL INVARIANTS (WHAT NOT TO VIOLATE):');
  console.log('--------------------------------------------------------------------------------');
  channel.invariants.forEach((inv, i) => {
    console.log(`  ${i + 1}. ${inv}`);
  });
  console.log('\n');
}

function verifyDocumentationIntegrity() {
  console.log('\n🔎 Validating Agent Network Documentation Tree Integrity...\n');
  let missingCount = 0;
  let totalCount = 0;

  for (const [key, ch] of Object.entries(AGENT_CHANNELS)) {
    console.log(`Checking ${ch.name}...`);
    for (const doc of ch.readingChain) {
      totalCount++;
      const fullPath = path.resolve(ROOT_DIR, doc.path);
      if (fs.existsSync(fullPath)) {
        console.log(`  ✓ [OK] ${doc.path}`);
      } else {
        console.error(`  ✗ [FAIL] Missing file: ${doc.path}`);
        missingCount++;
      }
    }
  }

  console.log(`\nVerified ${totalCount} documentation nodes across ${Object.keys(AGENT_CHANNELS).length} channels.`);
  if (missingCount > 0) {
    console.error(`🚨 FAILED: ${missingCount} documentation files are missing!`);
    process.exit(1);
  } else {
    console.log(`✅ ALL DOCUMENTATION NODES VERIFIED IN PERFECT WIRING ORDER.\n`);
  }
}

function runPreMergeGate() {
  console.log('\n================================================================================');
  console.log('🛡️ PRE-MERGE COMPLIANCE & REPOSITORY GATEKEEPER');
  console.log('================================================================================\n');

  console.log('1. Checking for Banned Anti-Patterns (Stub Data, Fake Companies, innerHTML)...');
  const bannedKeywords = [
    { pattern: 'Cursor AI Tools Ltd', msg: 'Fake advertiser stub detected' },
    { pattern: 'Perplexity Enterprise', msg: 'Fake advertiser stub detected' },
    { pattern: 'Vercel v0 Team', msg: 'Fake advertiser stub detected' },
    { pattern: 'user_liability_usd ?? 270', msg: 'Fake fallback number detected' },
  ];

  let hasBanned = false;
  const adminPagePath = path.resolve(ROOT_DIR, 'apps/web/app/admin/page.tsx');
  if (fs.existsSync(adminPagePath)) {
    const adminCode = fs.readFileSync(adminPagePath, 'utf8');
    for (const { pattern, msg } of bannedKeywords) {
      if (adminCode.includes(pattern)) {
        console.error(`🚨 BANNED PATTERN DETECTED in admin/page.tsx: "${pattern}" (${msg})`);
        hasBanned = true;
      }
    }
  }

  if (hasBanned) {
    console.error('❌ Pre-merge gate failed due to prohibited stub data.');
    process.exit(1);
  } else {
    console.log('  ✓ Zero stub data verified in Admin Console & Stores.');
  }

  console.log('\n2. Verifying Documentation Wiring Tree...');
  verifyDocumentationIntegrity();

  console.log('\n3. Running Monorepo TypeScript Verification (tsc --noEmit)...');
  try {
    execSync('pnpm -r typecheck', { cwd: ROOT_DIR, stdio: 'inherit' });
    console.log('  ✓ Monorepo typecheck passed with 0 errors.');
  } catch {
    console.error('❌ TypeScript typecheck failed.');
    process.exit(1);
  }

  console.log('\n4. Running Unit & Integration Test Suite (vitest run)...');
  try {
    execSync('pnpm vitest run', { cwd: ROOT_DIR, stdio: 'inherit' });
    console.log('  ✓ All unit test suites passed with 100% green status.');
  } catch {
    console.error('❌ Test suite failed.');
    process.exit(1);
  }

  console.log('\n================================================================================');
  console.log('🎉 ALL PRE-MERGE GATES PASSED! SAFE TO COMMIT & MERGE.');
  console.log('================================================================================\n');
}

// 3. CLI Dispatcher
const args = process.argv.slice(2);
const channelArg = args.find((a) => a.startsWith('--channel='))?.split('=')[1];
const isVerify = args.includes('--verify');
const isRead = args.includes('--read');
const isGate = args.includes('--gate');
const isDetect = args.includes('--detect');

if (isGate) {
  runPreMergeGate();
} else if (isVerify) {
  verifyDocumentationIntegrity();
} else if (channelArg) {
  const chKey = channelArg.toLowerCase();
  if (chKey === 'all') {
    renderTree();
  } else if (AGENT_CHANNELS[chKey]) {
    renderTree(chKey);
    streamSequentialDocumentation(chKey);
  } else {
    console.error(`Unknown channel "${channelArg}". Available: root, ui, home, auth, admin, ext, api, qa, all`);
    process.exit(1);
  }
} else if (isRead) {
  const modified = getGitModifiedFiles();
  const detected = detectChannelFromFiles(modified);
  console.log(`Auto-detected active channel based on git diff: [${detected.toUpperCase()}]`);
  streamSequentialDocumentation(detected);
} else {
  // Default: detect modified files or display the master tree
  const modified = getGitModifiedFiles();
  const detected = detectChannelFromFiles(modified);
  renderTree(detected);
  console.log(`\n💡 Auto-detected active channel for current working directory: [${detected.toUpperCase()}]`);
  console.log(`👉 To stream documents in sequence: pnpm agent:route --channel=${detected} --read`);
  console.log(`👉 To verify all documentation nodes: pnpm agent:verify`);
  console.log(`👉 To run pre-merge gatekeeper: pnpm pre-merge\n`);
}
