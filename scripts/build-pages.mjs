#!/usr/bin/env node

import { existsSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

const WEB_DIR = resolve(ROOT, 'apps/web');
const API_DIR = resolve(WEB_DIR, 'app/api');
const TEMP_API_DIR = resolve(WEB_DIR, 'app/_api');
const OUT_DIR = resolve(WEB_DIR, 'out');
const EXT_ZIP = resolve(ROOT, 'apps/extension/.output/pathixo-rewards-extension.zip');

console.log('\n🚀 [Pathixo Rewards] Building static export for GitHub Pages...\n');

function moveDir(src, dest) {
  if (process.platform === 'win32') {
    const ps = spawnSync('powershell.exe', [
      '-NoProfile',
      '-Command',
      `if (Test-Path "${src}") { Move-Item -Path "${src}" -Destination "${dest}" -Force }`,
    ]);
    if (ps.status !== 0) {
      throw new Error(`Failed to move ${src} -> ${dest}: ${ps.stderr?.toString()}`);
    }
  } else {
    const mv = spawnSync('mv', [src, dest]);
    if (mv.status !== 0) {
      throw new Error(`Failed to move ${src} -> ${dest}`);
    }
  }
}

let apiRenamed = false;
try {
  // 1. Temporarily isolate dynamic API routes for static HTML export
  if (existsSync(API_DIR)) {
    console.log('📦 Isolating API routes for static export...');
    moveDir(API_DIR, TEMP_API_DIR);
    apiRenamed = true;
  }

  // 2. Clean stale .next build cache to ensure pure static export
  const NEXT_DIR = resolve(WEB_DIR, '.next');
  if (existsSync(NEXT_DIR)) {
    console.log('🧹 Cleaning stale .next cache...');
    if (process.platform === 'win32') {
      spawnSync('powershell.exe', ['-NoProfile', '-Command', `Remove-Item -Recurse -Force "${NEXT_DIR}"`]);
    } else {
      rmSync(NEXT_DIR, { recursive: true, force: true });
    }
  }

  // 3. Build web application with static export & GitHub Pages base path
  console.log('⚡ Running Next.js static export build...');
  const isWindows = process.platform === 'win32';
  const pnpmCmd = isWindows ? 'pnpm.cmd' : 'pnpm';

  const buildResult = spawnSync(pnpmCmd, ['--filter', '@pathixo/web', 'build'], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      GITHUB_PAGES: 'true',
      STATIC_EXPORT: 'true',
      NEXT_PUBLIC_BASE_PATH: '/Pathixo_Rewards',
    },
  });

  if (buildResult.status !== 0) {
    throw new Error(`Build failed with exit code ${buildResult.status}`);
  }

  // 3. Ensure .nojekyll exists in out/ so GitHub Pages serves _next/ directories
  const noJekyllPath = resolve(OUT_DIR, '.nojekyll');
  writeFileSync(noJekyllPath, '', 'utf-8');
  console.log('✔ Created .nojekyll in out/');

  // 4. Bundle extension download zip for landing page downloads
  const downloadsDir = resolve(OUT_DIR, 'downloads');
  if (!existsSync(downloadsDir)) {
    mkdirSync(downloadsDir, { recursive: true });
  }

  if (existsSync(EXT_ZIP)) {
    copyFileSync(EXT_ZIP, resolve(downloadsDir, 'pathixo-rewards-extension.zip'));
    console.log('✔ Bundled extension zip into out/downloads/');
  }

  console.log('\n🎉 [Pathixo Rewards] Static export build complete in apps/web/out/!\n');
} finally {
  // Always restore API directory
  if (apiRenamed && existsSync(TEMP_API_DIR)) {
    try {
      moveDir(TEMP_API_DIR, API_DIR);
      console.log('✔ Restored apps/web/app/api');
    } catch (err) {
      console.error('⚠ Failed to restore API directory:', err);
    }
  }
}
