import { describe, it, expect } from 'vitest';
import { GET } from '../../../apps/web/app/api/config/selectors/route';
import type { RemoteSelectorConfig } from '@pathixo/shared';

describe('API Route: /api/config/selectors', () => {
  it('should deliver valid remote selector JSON for all 5 AI platforms', async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const config: RemoteSelectorConfig = await res.json();
    expect(config.version).toBeDefined();
    expect(config.domains).toBeDefined();

    const expectedDomains = [
      'chatgpt.com',
      'claude.ai',
      'gemini.google.com',
      'perplexity.ai',
      'deepseek.com',
    ];

    for (const domain of expectedDomains) {
      expect(config.domains[domain]).toBeDefined();
      const sel = config.domains[domain];
      expect(sel.composer).toBeTruthy();
      expect(sel.send_button).toBeTruthy();
      expect(sel.user_bubble).toBeTruthy();
    }
  });

  it('should include appropriate cache headers', async () => {
    const res = await GET();
    const cacheHeader = res.headers.get('Cache-Control');
    expect(cacheHeader).toContain('public');
    expect(cacheHeader).toContain('s-maxage=3600');
  });
});
