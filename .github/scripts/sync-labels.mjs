#!/usr/bin/env node
/**
 * Synchronizes unique GitHub labels defined in .github/labels.yml with the remote repository.
 * Usage: GITHUB_TOKEN=ghp_xxx node .github/scripts/sync-labels.mjs [owner/repo]
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REPO = process.argv[2] || process.env.GITHUB_REPOSITORY || 'jhaabhijeet864/Pathixo_Rewards';
const TOKEN = process.env.GITHUB_TOKEN;

function parseYamlLabels(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const labels = [];
  let current = null;

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- name:')) {
      if (current) labels.push(current);
      current = { name: trimmed.replace(/^- name:\s*['"]?([^'"]+)['"]?/, '$1') };
    } else if (trimmed.startsWith('color:') && current) {
      current.color = trimmed.replace(/^color:\s*['"]?([^'"]+)['"]?/, '$1');
    } else if (trimmed.startsWith('description:') && current) {
      current.description = trimmed.replace(/^description:\s*['"]?([^'"]+)['"]?/, '$1');
    }
  }
  if (current) labels.push(current);
  return labels;
}

async function sync() {
  const labelsPath = resolve('.github/labels.yml');
  const labels = parseYamlLabels(labelsPath);

  console.log(`[Pathixo Rewards] Found ${labels.length} labels in .github/labels.yml for repository ${REPO}`);

  if (!TOKEN) {
    console.log('[Notice] No GITHUB_TOKEN provided. Labels parsed successfully:');
    for (const l of labels) {
      console.log(`  - [${l.name}] (#${l.color}): ${l.description}`);
    }
    console.log('\nRun with GITHUB_TOKEN=<token> to apply these labels to GitHub via REST API.');
    return;
  }

  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Pathixo-Rewards-Label-Sync',
  };

  for (const label of labels) {
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO}/labels`, {
        method: 'POST',
        headers,
        body: JSON.stringify(label),
      });

      if (res.status === 201) {
        console.log(`  ✓ Created label: ${label.name}`);
      } else if (res.status === 422) {
        // Label already exists, update it
        const patchRes = await fetch(
          `https://api.github.com/repos/${REPO}/labels/${encodeURIComponent(label.name)}`,
          {
            method: 'PATCH',
            headers,
            body: JSON.stringify(label),
          }
        );
        if (patchRes.ok) {
          console.log(`  ✓ Updated label: ${label.name}`);
        } else {
          console.warn(`  ! Failed to update: ${label.name}`);
        }
      } else {
        console.warn(`  ! Unexpected response for ${label.name}: ${res.status}`);
      }
    } catch (err) {
      console.error(`  × Error syncing ${label.name}:`, err.message);
    }
  }

  console.log('[Pathixo Rewards] Label sync complete!');
}

sync();
