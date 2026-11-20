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
      this.watchForReanchor();
      this.watchForDone();
    });
    this.anchorObserver.observe(document.body, { childList: true, subtree: true });
  }

  private watchForReanchor(): void {
    this.reanchorObserver?.disconnect();
    this.reanchorObserver = new MutationObserver(() => {
      // When Gemini swaps <pending-request> for permanent <model-response>, re-anchor card
      const responses = document.querySelectorAll<HTMLElement>(MODEL_RESPONSE);
      const lastResp = lastOf(responses);
      if (!lastResp) return;
      const turnContainer = lastResp.closest<HTMLElement>('.conversation-turn, [data-turn-id]') ?? lastResp.parentElement;
      if (turnContainer) {
        this.cb?.onReanchor?.(turnContainer);
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
