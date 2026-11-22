import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PathixoAdCard } from '../../../apps/extension/entrypoints/content/ad-card';
import type { AdCreative } from '@pathixo/shared';

describe('Ad Card Component (apps/extension/entrypoints/content/ad-card.ts)', () => {
  let container: HTMLElement;
  let anchor: HTMLElement;

  const sampleAd: AdCreative = {
    id: 'ad_cursor_001',
    headline: 'Build software 10x faster with Cursor',
    sponsor_name: 'Cursor',
    url: 'https://cursor.com/?ref=pathixo',
    badge: 'Trending AI',
    is_house_ad: false,
    ad_token: 'tok_cursor_123',
  };

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.id = 'chat-container';
    anchor = document.createElement('div');
    anchor.id = 'user-message-1';
    container.appendChild(anchor);
    document.body.appendChild(container);
  });

  it('should mount with an isolated open Shadow DOM host', () => {
    const card = new PathixoAdCard();
    expect(card.mounted).toBe(false);

    card.mount(anchor);
    expect(card.mounted).toBe(true);

    const host = container.querySelector('#pathixo-ad-host');
    expect(host).not.toBeNull();
    expect(host?.shadowRoot).toBeDefined();
    expect(host?.shadowRoot?.mode).toBe('open');
  });

  it('should render ad creative details using secure DOM APIs', () => {
    const card = new PathixoAdCard();
    card.mount(anchor);
    card.render(sampleAd);

    const host = container.querySelector('#pathixo-ad-host');
    const shadow = host?.shadowRoot;
    expect(shadow).toBeDefined();

    // Verify content rendered
    const linkEl = shadow?.querySelector<HTMLAnchorElement>('.pathixo-link');
    expect(linkEl).not.toBeNull();
    expect(linkEl?.textContent).toBe(sampleAd.headline);
    expect(linkEl?.href).toBe(sampleAd.url);

    const sponsorTag = shadow?.querySelector('.pathixo-sponsor-tag');
    expect(sponsorTag?.textContent).toContain(sampleAd.sponsor_name);

    const badgeEl = shadow?.querySelector('.pathixo-badge');
    expect(badgeEl?.textContent).toBe(sampleAd.badge);
  });

  it('should handle dismiss button clicks and trigger onDismiss callback', () => {
    const onDismiss = vi.fn();
    const card = new PathixoAdCard();
    card.mount(anchor);
    card.render(sampleAd, { onDismiss });

    const shadow = container.querySelector('#pathixo-ad-host')?.shadowRoot;
    const dismissBtn = shadow?.querySelector<HTMLButtonElement>('.pathixo-dismiss');
    expect(dismissBtn).not.toBeNull();

    dismissBtn?.click();
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(card.mounted).toBe(false);
    expect(container.querySelector('#pathixo-ad-host')).toBeNull();
  });

  it('should handle link click callback', () => {
    const onClick = vi.fn();
    const card = new PathixoAdCard();
    card.mount(anchor);
    card.render(sampleAd, { onClick });

    const shadow = container.querySelector('#pathixo-ad-host')?.shadowRoot;
    const linkEl = shadow?.querySelector<HTMLAnchorElement>('.pathixo-link');
    linkEl?.click();

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should support reanchoring without recreating shadow DOM', () => {
    const card = new PathixoAdCard();
    card.mount(anchor);
    card.render(sampleAd);

    const newAnchor = document.createElement('div');
    newAnchor.id = 'user-message-2';
    container.appendChild(newAnchor);

    card.reanchor(newAnchor);
    expect(card.mounted).toBe(true);
    expect(newAnchor.nextElementSibling?.id).toBe('pathixo-ad-host');
  });

  it('should automatically recover via ensureMounted if detached by host framework (Model 1 Persistence)', () => {
    const card = new PathixoAdCard();
    card.mount(anchor);
    card.render(sampleAd);

    expect(card.mounted).toBe(true);
    expect(card.isConnected).toBe(true);

    // Simulate Angular / React framework wiping unmanaged child nodes during stream swap
    card.element.remove();
    expect(card.isConnected).toBe(false);
    expect(card.mounted).toBe(false);

    // Ensure resilience kicks in
    card.ensureMounted(anchor);
    expect(card.isConnected).toBe(true);
    expect(card.mounted).toBe(true);
    expect(anchor.nextElementSibling?.id).toBe('pathixo-ad-host');
  });

  it('should cleanly unmount and reset state', () => {
    const card = new PathixoAdCard();
    card.mount(anchor);
    expect(card.mounted).toBe(true);

    card.unmount();
    expect(card.mounted).toBe(false);
    expect(container.querySelector('#pathixo-ad-host')).toBeNull();
  });
});
