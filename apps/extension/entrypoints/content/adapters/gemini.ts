import type { PromptAdapter, PromptCallbacks } from './types';
import { lastOf } from '../shared';

const SEND_BTN = 'button[aria-label="Send message"]';
const COMPOSER_INNER = 'rich-textarea [contenteditable]';
export const USER_MSG = 'user-query';
const MODEL_RESPONSE = 'model-response';

export class GeminiAdapter implements PromptAdapter {
  host = 'gemini.google.com';

  private cb: PromptCallbacks | null = null;
  private sendHandler: (() => void) | null = null;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;
  private boundBtn: HTMLElement | null = null;
  private boundComposer: HTMLElement | null = null;
  private anchorObserver: MutationObserver | null = null;
  private reanchorObserver: MutationObserver | null = null;
  private doneObserver: MutationObserver | null = null;
  private reattachObserver: MutationObserver | null = null;

  private preSubmitUserMsg: HTMLElement | null = null;

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
    this.reanchorObserver?.disconnect();
    this.doneObserver?.disconnect();
    this.reattachObserver = null;
    this.anchorObserver = null;
    this.reanchorObserver = null;
    this.doneObserver = null;
  }

  hostAdVisible(): boolean {
    return !!document.querySelector('shopping-list, [data-ad-slot]');
  }

  private attach(): void {
    const btn = document.querySelector<HTMLElement>(SEND_BTN);
    const composer = document.querySelector<HTMLElement>(COMPOSER_INNER);
    if (!btn || !composer) return;
    if (btn === this.boundBtn && composer === this.boundComposer) return;
    this.detach();

    this.boundBtn = btn;
    this.boundComposer = composer;
    this.sendHandler = () => this.handleSubmit();
    btn.addEventListener('click', this.sendHandler, true);

    this.keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        this.handleSubmit();
      }
    };
    composer.addEventListener('keydown', this.keyHandler, true);
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
    this.preSubmitUserMsg = lastOf(document.querySelectorAll<HTMLElement>(USER_MSG));
    this.watchForUserMessage();
  }

  private watchForUserMessage(): void {
    this.anchorObserver?.disconnect();
    this.anchorObserver = new MutationObserver(() => {
      const all = document.querySelectorAll<HTMLElement>(USER_MSG);
      const newEl = lastOf(all);
      if (!newEl || newEl === this.preSubmitUserMsg) return;
      this.anchorObserver?.disconnect();
      this.cb?.onAnchorReady(newEl);
      this.watchForReanchor(newEl);
      this.watchForDone();
    });
    this.anchorObserver.observe(document.body, { childList: true, subtree: true });
  }

  private watchForReanchor(userMsgEl: HTMLElement): void {
    this.reanchorObserver?.disconnect();
    this.reanchorObserver = new MutationObserver(() => {
      // Keep card anchored directly after userMsgEl if disconnected during template updates
      if (userMsgEl.isConnected) {
        this.cb?.onReanchor?.(userMsgEl);
      }
      // Once model-response has mounted, DOM structure is stable; disconnect observer to avoid stream churn
      if (document.querySelector(MODEL_RESPONSE)) {
        this.reanchorObserver?.disconnect();
        this.reanchorObserver = null;
      }
    });
    this.reanchorObserver.observe(document.body, { childList: true, subtree: true });
  }

  private watchForDone(): void {
    this.doneObserver?.disconnect();
    this.doneObserver = new MutationObserver(() => {
      const btn = document.querySelector<HTMLButtonElement>(SEND_BTN);
      const isGenerating = !!document.querySelector('.loading-spinner, .sparkle-thinking, [aria-label*="Stop"]');
      if (btn && !btn.disabled && !isGenerating) {
        this.cb?.onDone();
        this.doneObserver?.disconnect();
      }
    });
    this.doneObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'aria-label'],
    });
  }
}
