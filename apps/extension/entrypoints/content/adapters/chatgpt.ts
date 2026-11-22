import type { PromptAdapter, PromptCallbacks } from './types';
import { lastOf } from '../shared';

const SEND_BTN = '[data-testid="send-button"], button[data-composer-submit], form button[type="submit"][aria-label="Send"]';
const COMPOSER = '#prompt-textarea, [data-mobile-composer-prompt], [data-composer-markdown]';
export const USER_MSG = '[data-message-author-role="user"], [data-user-message-bubble]';

function anchorFor(el: HTMLElement): HTMLElement {
  const searchUnit = el.closest<HTMLElement>('[data-chatgpt-search-unit-key]');
  if (searchUnit?.parentElement) return searchUnit.parentElement;
  const turnArticle = el.closest<HTMLElement>('article');
  if (turnArticle) return turnArticle;
  return el;
}

function stopButton(): Element | null {
  const form = document.querySelector(COMPOSER)?.closest('form');
  return form?.querySelector('button[aria-label="Stop"], button[data-testid="stop-button"]') ?? null;
}

function lastMsgKey(list: NodeListOf<HTMLElement>): string | HTMLElement | null {
  const el = lastOf(list);
  if (!el) return null;
  return (
    el.getAttribute('data-message-id') ??
    el.closest('li[id]')?.id ??
    (el.closest('[data-chatgpt-search-message-ids]')?.getAttribute('data-chatgpt-search-message-ids') || null) ??
    el
  );
}

export class ChatGPTAdapter implements PromptAdapter {
  host = 'chatgpt.com';

  private cb: PromptCallbacks | null = null;
  private sendHandler: (() => void) | null = null;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;
  private boundBtn: HTMLElement | null = null;
  private boundComposer: HTMLElement | null = null;
  private anchorObserver: MutationObserver | null = null;
  private doneObserver: MutationObserver | null = null;
  private reattachObserver: MutationObserver | null = null;
  private reanchorObserver: MutationObserver | null = null;
  private preSubmitUserMsgKey: string | HTMLElement | null = null;

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
    this.reanchorObserver?.disconnect();
    this.reattachObserver = null;
    this.anchorObserver = null;
    this.doneObserver = null;
    this.reanchorObserver = null;
  }

  hostAdVisible(): boolean {
    return !!document.querySelector('[data-testid="sponsored-result"], .ad-container');
  }

  private attach(): void {
    const btn = document.querySelector<HTMLElement>(SEND_BTN);
    const composer = document.querySelector<HTMLElement>(COMPOSER);
    if (!btn || !composer) return;
    if (btn === this.boundBtn && composer === this.boundComposer) return;
    this.detach();

    this.boundBtn = btn;
    this.boundComposer = composer;
    this.sendHandler = () => this.handleSubmit();

    // Capture-phase listener ensures we capture before ChatGPT's own same-node submit handler clears the composer
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
    this.reanchorObserver?.disconnect();
    this.preSubmitUserMsgKey = lastMsgKey(document.querySelectorAll<HTMLElement>(USER_MSG));
    this.watchForUserMessage();
  }

  private watchForUserMessage(): void {
    this.anchorObserver?.disconnect();
    this.anchorObserver = new MutationObserver(() => {
      const all = document.querySelectorAll<HTMLElement>(USER_MSG);
      const newEl = lastOf(all);
      if (!newEl || lastMsgKey(all) === this.preSubmitUserMsgKey) return;
      this.anchorObserver?.disconnect();
      this.cb?.onAnchorReady(anchorFor(newEl));
      this.watchForReanchor(newEl);
      this.watchForDone();
    });
    this.anchorObserver.observe(document.body, { childList: true, subtree: true });
  }

  private watchForReanchor(userMsgEl: HTMLElement): void {
    this.reanchorObserver?.disconnect();
    this.reanchorObserver = new MutationObserver(() => {
      const anchor = anchorFor(userMsgEl);
      if (anchor && anchor.isConnected) {
        this.cb?.onReanchor?.(anchor);
      }
    });
    this.reanchorObserver.observe(document.body, { childList: true, subtree: true });
  }

  private watchForDone(): void {
    this.doneObserver?.disconnect();
    let stopSeen = false;
    this.doneObserver = new MutationObserver(() => {
      if (stopButton()) {
        stopSeen = true;
        return;
      }
      if (stopSeen) {
        this.cb?.onDone();
        this.doneObserver?.disconnect();
        return;
      }
      const btn = document.querySelector<HTMLButtonElement>(SEND_BTN);
      if (!btn) return;
      const sendLabel = btn.getAttribute('data-send-label');
      const ready = sendLabel ? btn.getAttribute('aria-label') === sendLabel : !btn.disabled;
      if (ready) {
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
