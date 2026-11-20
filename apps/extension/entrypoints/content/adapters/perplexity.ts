import type { PromptAdapter, PromptCallbacks } from './types';
import { lastOf } from '../shared';

const SEND_BTN = 'button[aria-label*="Submit"], button[type="submit"], button[aria-label*="Ask"], button[aria-label*="Search"]';
const COMPOSER = 'textarea[placeholder*="Ask"], [contenteditable="true"], textarea';
const USER_QUERY = '[data-testid="user-query"], div[class*="query-text"], div[class*="UserQuery"]';

export class PerplexityAdapter implements PromptAdapter {
  host = 'perplexity.ai';

  private cb: PromptCallbacks | null = null;
  private sendHandler: (() => void) | null = null;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;
  private boundBtn: HTMLElement | null = null;
  private boundComposer: HTMLElement | null = null;
  private anchorObserver: MutationObserver | null = null;
  private doneObserver: MutationObserver | null = null;
  private reattachObserver: MutationObserver | null = null;

  start(cb: PromptCallbacks): void {
    this.cb = cb;
    this.attach();
    this.reattachObserver = new MutationObserver(() => this.attach());
    this.reattachObserver.observe(document.body, { childList: true, subtree: true });
  }

  stop(): void {
    this.detach();
    this.reattachObserver?.disconnect();
    this.anchorObserver?.disconnect();
    this.doneObserver?.disconnect();
    this.reattachObserver = null;
    this.anchorObserver = null;
    this.doneObserver = null;
  }

  hostAdVisible(): boolean {
    return !!document.querySelector('[data-testid="sponsored-link"], .ad-slot');
  }

  private attach(): void {
    const btn = document.querySelector<HTMLElement>(SEND_BTN);
    const composer = document.querySelector<HTMLElement>(COMPOSER);
    if (!btn && !composer) return;
    if (btn === this.boundBtn && composer === this.boundComposer) return;
    this.detach();

    this.boundBtn = btn;
    this.boundComposer = composer;
    this.sendHandler = () => this.handleSubmit();
    if (btn) btn.addEventListener('click', this.sendHandler, true);

    if (composer) {
      this.keyHandler = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          this.handleSubmit();
        }
      };
      composer.addEventListener('keydown', this.keyHandler, true);
    }
  }

  private detach(): void {
    if (this.sendHandler && this.boundBtn) {
      this.boundBtn.removeEventListener('click', this.sendHandler, true);
    }
    if (this.keyHandler && this.boundComposer) {
      this.boundComposer.removeEventListener('keydown', this.keyHandler, true);
    }
    this.sendHandler = null;
    this.keyHandler = null;
    this.boundBtn = null;
    this.boundComposer = null;
  }

  private handleSubmit(): void {
    this.cb?.onSubmit();
    this.watchForQueryTurn();
  }

  private watchForQueryTurn(): void {
    this.anchorObserver?.disconnect();
    this.anchorObserver = new MutationObserver(() => {
      const queries = document.querySelectorAll<HTMLElement>(USER_QUERY);
      const lastQuery = lastOf(queries);
      if (!lastQuery) return;

      const anchor = lastQuery.closest<HTMLElement>('[data-testid="thread-item"], div[class*="turn"]') ?? lastQuery;
      this.anchorObserver?.disconnect();
      this.cb?.onAnchorReady(anchor);
      this.watchForDone();
    });
    this.anchorObserver.observe(document.body, { childList: true, subtree: true });
  }

  private watchForDone(): void {
    this.doneObserver?.disconnect();
    this.doneObserver = new MutationObserver(() => {
      const isSearching = !!document.querySelector('[data-testid="searching-indicator"], div[class*="loading-shimmer"]');
      const stopBtn = document.querySelector('button[aria-label*="Stop"]');
      if (!isSearching && !stopBtn) {
        this.cb?.onDone();
        this.doneObserver?.disconnect();
      }
    });
    this.doneObserver.observe(document.body, { childList: true, subtree: true });
  }
}
