import { describe, it, expect } from 'vitest';

describe('Anti-Fraud Dwell & Focus Verification Logic', () => {
  const MIN_DWELL_MS = 4000;

  function evaluateImpressionQualification(params: {
    dwellMs: number;
    isTabFocusedDuringWait: boolean;
    dismissedThisTurn: boolean;
    adMounted: boolean;
  }): { qualified: boolean; reason?: string } {
    if (!params.adMounted) {
      return { qualified: false, reason: 'Ad was not mounted or card was unmounted' };
    }
    if (params.dismissedThisTurn) {
      return { qualified: false, reason: 'Ad was dismissed by user' };
    }
    if (!params.isTabFocusedDuringWait) {
      return { qualified: false, reason: 'Tab lost focus or visibility during AI generation' };
    }
    if (params.dwellMs < MIN_DWELL_MS) {
      return {
        qualified: false,
        reason: `Dwell time ${params.dwellMs}ms below minimum threshold of ${MIN_DWELL_MS}ms`,
      };
    }
    return { qualified: true };
  }

  it('should qualify impressions with >= 4000ms dwell in focused tab', () => {
    const result = evaluateImpressionQualification({
      dwellMs: 4200,
      isTabFocusedDuringWait: true,
      dismissedThisTurn: false,
      adMounted: true,
    });

    expect(result.qualified).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('should reject impressions when dwell is 3999ms (under 4000ms)', () => {
    const result = evaluateImpressionQualification({
      dwellMs: 3999,
      isTabFocusedDuringWait: true,
      dismissedThisTurn: false,
      adMounted: true,
    });

    expect(result.qualified).toBe(false);
    expect(result.reason).toContain('below minimum threshold');
  });

  it('should reject impressions if tab was switched or blurred during AI generation', () => {
    const result = evaluateImpressionQualification({
      dwellMs: 6500,
      isTabFocusedDuringWait: false, // Tab switched away
      dismissedThisTurn: false,
      adMounted: true,
    });

    expect(result.qualified).toBe(false);
    expect(result.reason).toContain('Tab lost focus');
  });

  it('should reject impressions if user clicked dismiss before AI finished', () => {
    const result = evaluateImpressionQualification({
      dwellMs: 5000,
      isTabFocusedDuringWait: true,
      dismissedThisTurn: true, // User clicked 'x'
      adMounted: true,
    });

    expect(result.qualified).toBe(false);
    expect(result.reason).toContain('dismissed by user');
  });

  it('should reject impressions if card was never mounted', () => {
    const result = evaluateImpressionQualification({
      dwellMs: 5000,
      isTabFocusedDuringWait: true,
      dismissedThisTurn: false,
      adMounted: false,
    });

    expect(result.qualified).toBe(false);
    expect(result.reason).toContain('not mounted');
  });
});
