import type { AdCreative } from '@pathixo/shared';

/** Static CSS text scoped to the Shadow DOM host.
 * No user or advertiser data is ever injected into this string. */
const CARD_CSS = `
  :host {
    all: initial;
    display: block;
    width: 100%;
    box-sizing: border-box;
  }
  .pathixo-card-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 4px;
    margin: 6px 0 10px 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: 14.5px;
    line-height: 1.45;
    border-bottom: 1px solid rgba(127, 127, 142, 0.2);
    box-sizing: border-box;
    transition: background-color 0.15s ease;
  }
  .pathixo-icon {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    border-radius: 6px;
    background: #0f172a;
    color: #ffffff;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    overflow: hidden;
  }
  .pathixo-icon.has-img {
    background: #0f172a;
  }
  .pathixo-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
  .pathixo-content {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    color: rgba(30, 41, 59, 0.9);
  }
  .pathixo-link {
    color: #0284c7;
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
  }
  .pathixo-link:hover {
    text-decoration: underline;
  }
  .pathixo-badge {
    font-size: 10.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(16, 185, 129, 0.12);
    color: #047857;
    white-space: nowrap;
  }
  .pathixo-sponsor-tag {
    font-size: 11px;
    color: rgba(100, 116, 139, 0.8);
    margin-left: 2px;
  }
  .pathixo-dismiss {
    background: none;
    border: none;
    color: rgba(100, 116, 139, 0.5);
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    padding: 3px 6px;
    border-radius: 4px;
    flex-shrink: 0;
    opacity: 0.7;
    transition: opacity 0.15s ease, background-color 0.15s ease, color 0.15s ease;
  }
  .pathixo-card-row:hover .pathixo-dismiss,
  .pathixo-dismiss:focus-visible {
    opacity: 1;
  }
  .pathixo-dismiss:hover {
    color: rgba(15, 23, 42, 0.9);
    background: rgba(100, 116, 139, 0.12);
  }

  @media (prefers-color-scheme: dark) {
    .pathixo-card-row {
      border-bottom-color: rgba(148, 163, 184, 0.18);
    }
    .pathixo-content {
      color: #cbd5e1;
    }
    .pathixo-link {
      color: #38bdf8;
    }
    .pathixo-badge {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
    }
    .pathixo-sponsor-tag {
      color: #94a3b8;
    }
    .pathixo-dismiss {
      color: #64748b;
    }
    .pathixo-dismiss:hover {
      color: #f1f5f9;
      background: rgba(148, 163, 184, 0.15);
    }
  }
`;

export class PathixoAdCard {
  private container: HTMLElement;
  private shadow: ShadowRoot;
  private isMounted = false;
  private currentAd: AdCreative | null = null;
  private onDismissCallback?: () => void;
  private onClickCallback?: () => void;

  // DOM node references inside Shadow DOM
  private rowEl: HTMLDivElement;
  private iconEl: HTMLSpanElement;
  private iconImgEl: HTMLImageElement;
  private iconInitialEl: HTMLSpanElement;
  private linkEl: HTMLAnchorElement;
  private badgeEl: HTMLSpanElement;
  private sponsorTagEl: HTMLSpanElement;
  private dismissBtn: HTMLButtonElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'pathixo-ad-host';
    this.container.setAttribute('data-pathixo-card-container', 'true');
    this.shadow = this.container.attachShadow({ mode: 'open' });

    // Append styles
    const styleEl = document.createElement('style');
    styleEl.textContent = CARD_CSS;
    this.shadow.appendChild(styleEl);

    // Build Row Structure via native DOM methods (Zero innerHTML)
    this.rowEl = document.createElement('div');
    this.rowEl.className = 'pathixo-card-row';

    // Icon Container
    this.iconEl = document.createElement('span');
    this.iconEl.className = 'pathixo-icon';
    this.iconImgEl = document.createElement('img');
    this.iconImgEl.style.display = 'none';
    this.iconInitialEl = document.createElement('span');
    this.iconEl.appendChild(this.iconImgEl);
    this.iconEl.appendChild(this.iconInitialEl);
    this.rowEl.appendChild(this.iconEl);

    // Content container
    const contentEl = document.createElement('div');
    contentEl.className = 'pathixo-content';

    this.badgeEl = document.createElement('span');
    this.badgeEl.className = 'pathixo-badge';
    this.badgeEl.textContent = 'Sponsored';
    contentEl.appendChild(this.badgeEl);

    this.linkEl = document.createElement('a');
    this.linkEl.className = 'pathixo-link';
    this.linkEl.target = '_blank';
    this.linkEl.rel = 'noopener noreferrer';
    contentEl.appendChild(this.linkEl);

    this.sponsorTagEl = document.createElement('span');
    this.sponsorTagEl.className = 'pathixo-sponsor-tag';
    contentEl.appendChild(this.sponsorTagEl);

    this.rowEl.appendChild(contentEl);

    // Dismiss button
    this.dismissBtn = document.createElement('button');
    this.dismissBtn.type = 'button';
    this.dismissBtn.className = 'pathixo-dismiss';
    this.dismissBtn.setAttribute('aria-label', 'Dismiss sponsored card');
    this.dismissBtn.textContent = '×';
    this.dismissBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleDismiss();
    });
    this.rowEl.appendChild(this.dismissBtn);

    // Click handler on link
    this.linkEl.addEventListener('click', () => {
      if (this.onClickCallback) this.onClickCallback();
    });

    this.shadow.appendChild(this.rowEl);
  }

  /**
   * Renders the ad creative into the card.
   */
  render(
    ad: AdCreative,
    callbacks?: { onDismiss?: () => void; onClick?: () => void }
  ): void {
    this.currentAd = ad;
    this.onDismissCallback = callbacks?.onDismiss;
    this.onClickCallback = callbacks?.onClick;

    // Set link text and destination safely
    this.linkEl.textContent = ad.headline;
    this.linkEl.href = ad.url;

    // Sponsor attribution tag
    this.sponsorTagEl.textContent = `• via Pathixo Rewards (${ad.sponsor_name})`;

    // Optional promotional badge
    if (ad.badge) {
      this.badgeEl.textContent = ad.badge;
    } else {
      this.badgeEl.textContent = 'Sponsored';
    }

    // Icon setup
    if (ad.icon_url) {
      let iconSrc = ad.icon_url;
      if (iconSrc.startsWith('/') && typeof browser !== 'undefined' && browser.runtime?.getURL) {
        try {
          iconSrc = (browser.runtime.getURL as (path: string) => string)(iconSrc);
        } catch {
          // Keep relative path if getURL fails
        }
      }
      this.iconImgEl.src = iconSrc;
      this.iconImgEl.alt = ad.sponsor_name;
      this.iconImgEl.style.display = 'block';
      this.iconInitialEl.style.display = 'none';
      this.iconEl.classList.add('has-img');
    } else {
      this.iconImgEl.style.display = 'none';
      const initial = (ad.sponsor_name || 'P').charAt(0).toUpperCase();
      this.iconInitialEl.textContent = initial;
      this.iconInitialEl.style.display = 'inline';
      this.iconEl.classList.remove('has-img');
    }

    this.container.style.display = 'block';
  }

  /**
   * Mounts the card element immediately after the anchor element.
   */
  mount(anchorEl: HTMLElement): void {
    if (this.container.parentElement === anchorEl.parentElement && this.container.previousElementSibling === anchorEl) {
      return; // Already cleanly positioned
    }
    anchorEl.after(this.container);
    this.isMounted = true;
  }

  /**
   * Re-anchors the card to a newly created/mutated turn element.
   */
  reanchor(newAnchorEl: HTMLElement): void {
    if (!this.isMounted) return;
    this.mount(newAnchorEl);
  }

  /**
   * Unmounts and hides the card.
   */
  unmount(): void {
    this.container.remove();
    this.isMounted = false;
  }

  private handleDismiss(): void {
    this.container.style.display = 'none';
    if (this.onDismissCallback) {
      this.onDismissCallback();
    }
    this.unmount();
  }

  get mounted(): boolean {
    return this.isMounted;
  }

  get element(): HTMLElement {
    return this.container;
  }
}
