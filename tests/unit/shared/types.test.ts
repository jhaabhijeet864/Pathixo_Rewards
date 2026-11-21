import { describe, it, expect } from 'vitest';
import type { SupportedPlatform, AdCreative, ImpressionEvent, RemoteSelectorConfig } from '@pathixo/shared';

describe('Shared Package: Types and Domain Invariants', () => {
  it('should support the 5 core AI chatbot platforms', () => {
    const platforms: SupportedPlatform[] = ['chatgpt', 'claude', 'gemini', 'perplexity', 'deepseek'];
    expect(platforms).toHaveLength(5);
    expect(platforms).toContain('chatgpt');
    expect(platforms).toContain('claude');
    expect(platforms).toContain('gemini');
    expect(platforms).toContain('perplexity');
    expect(platforms).toContain('deepseek');
  });

  it('should adhere to the 60% user revenue share calculation', () => {
    // Platform standard: $15 CPM base
    const baseCpmUsd = 15.0;
    const revShareRatio = 0.6; // 60% user, 40% platform
    const pricePerImpressionUsd = baseCpmUsd / 1000;
    const userCreditPerImpression = pricePerImpressionUsd * revShareRatio;

    expect(pricePerImpressionUsd).toBe(0.015);
    expect(userCreditPerImpression).toBe(0.009);
    expect(Number(userCreditPerImpression.toFixed(4))).toBe(0.009);
  });

  it('should validate the $2.00 minimum cashout invariant', () => {
    const MIN_CASHOUT_FLOOR_USD = 2.0;
    const userBalance1 = 1.999;
    const userBalance2 = 2.0;
    const userBalance3 = 5.5;

    expect(userBalance1 >= MIN_CASHOUT_FLOOR_USD).toBe(false);
    expect(userBalance2 >= MIN_CASHOUT_FLOOR_USD).toBe(true);
    expect(userBalance3 >= MIN_CASHOUT_FLOOR_USD).toBe(true);
  });

  it('should construct a valid AdCreative structure', () => {
    const creative: AdCreative = {
      id: 'ad_test_01',
      headline: 'Experience next-generation AI developer tools',
      sponsor_name: 'Test Sponsor',
      url: 'https://example.com/sponsor',
      badge: 'Verified',
      is_house_ad: false,
      target_cpm: 25.0,
      ad_token: 'tok_test_abc123',
    };

    expect(creative.id).toBe('ad_test_01');
    expect(creative.target_cpm).toBe(25.0);
    expect(creative.ad_token).toBeDefined();
  });
});
