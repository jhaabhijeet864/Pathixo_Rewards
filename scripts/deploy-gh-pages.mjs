#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'apps/web/out');
const REMOTE_URL = 'https://github.com/jhaabhijeet864/Pathixo_Rewards.git';

console.log('\n🚀 [Pathixo Rewards] Deploying static landing page to gh-pages branch...\n');

// 1. Build pages first if out/ does not exist or needs update
const skipBuild = process.argv.includes('--skip-build') || process.env.SKIP_BUILD === 'true';

if (!skipBuild) {
  console.log('⚡ Step 1: Ensuring static export build is fresh...');
  const buildScript = resolve(__dirname, 'build-pages.mjs');
  const buildResult = spawnSync('node', [buildScript], {
    cwd: ROOT,
    stdio: 'inherit',
  });

  if (buildResult.status !== 0) {
    console.error('❌ Build failed before deployment');
    process.exit(1);
  }
} else {
  console.log('⚡ Step 1: Using existing static export in out/...');
}

if (!existsSync(OUT_DIR)) {
  console.error(`❌ Output directory not found at: ${OUT_DIR}`);
  process.exit(1);
}

// 2. Publish to gh-pages branch
console.log('⚡ Step 2: Publishing out/ to gh-pages branch...');

function runGit(args, cwd = OUT_DIR) {
  const res = spawnSync('git', args, { cwd, stdio: 'inherit' });
  if (res.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed with code ${res.status}`);
  }
}

try {
  runGit(['init']);
  runGit(['checkout', '-B', 'gh-pages']);
  runGit(['add', '-A']);
  runGit(['commit', '-m', 'deploy(pages): publish static landing page to GitHub Pages']);
  
  // Set remote origin
  spawnSync('git', ['remote', 'remove', 'origin'], { cwd: OUT_DIR });
  runGit(['remote', 'add', 'origin', REMOTE_URL]);

  console.log('⚡ Step 3: Pushing to remote gh-pages branch...');
  runGit(['push', 'origin', 'gh-pages', '--force']);

  console.log('\n🎉 [Pathixo Rewards] Successfully deployed to GitHub Pages (branch: gh-pages)!');
  console.log('🔗 URL: https://jhaabhijeet864.github.io/Pathixo_Rewards/\n');
} catch (err) {
  console.error('❌ Deployment error:', err.message);
  process.exit(1);
}
