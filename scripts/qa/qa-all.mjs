#!/usr/bin/env node
/**
 * Pathixo Rewards — Master QA Pipeline Runner
 * 
 * Runs the complete specialized quality assurance verification suite:
 * 1. Vitest Unit & Integration Suite
 * 2. AI Chatbot Selector Verification
 * 3. Chrome Web Store & MV3 Policy Auditor
 * 4. Anti-Fraud Dwell & Tamper Matrix
 * 5. Financial Invariant & Split Auditor
 * 6. Stream Injection & Dwell Lifecycle Simulation
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');

const steps = [
  { name: '1. Vitest Test Suite (43+ Tests)', command: 'pnpm test' },
  { name: '2. AI Chatbot Selector Verification', command: 'node scripts/qa/verify-selectors.mjs' },
  { name: '3. Chrome Web Store Compliance Audit', command: 'node scripts/qa/audit-store-compliance.mjs' },
  { name: '4. Anti-Fraud Adversarial Dwell Matrix', command: 'node scripts/qa/simulate-antifraud.mjs' },
  { name: '5. Financial Invariants & Split Ledger Audit', command: 'node scripts/qa/audit-financials.mjs' },
  { name: '6. AI Stream & Ad Injection Lifecycle', command: 'node scripts/qa/simulate-stream.mjs' },
];

console.log('====================================================');
console.log('🚀 Pathixo Rewards — Master QA Verification Suite');
console.log('====================================================\n');

let failedStep = null;

for (const step of steps) {
  console.log(`▶ Running: ${step.name}...`);
  try {
    execSync(step.command, { cwd: ROOT, stdio: 'inherit' });
    console.log(`✅ ${step.name} Completed.\n`);
  } catch (err) {
    failedStep = step.name;
    console.error(`\n❌ Failed during: ${step.name}`);
    break;
  }
}

console.log('====================================================');
if (failedStep) {
  console.error(`🚨 Master QA Pipeline FAILED at: ${failedStep}`);
  process.exit(1);
} else {
  console.log('🌟 ALL 6 QA VERIFICATION SUITES PASSED FLAWLESSLY!');
  console.log('Ready for Production & Chrome Web Store Distribution.');
  console.log('====================================================\n');
  process.exit(0);
}
