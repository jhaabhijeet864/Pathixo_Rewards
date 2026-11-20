import type { PromptAdapter, PromptCallbacks } from './types';
import { lastOf } from '../shared';

const SEND_BTN = 'button[aria-label="Send message"]';
const COMPOSER = '[data-testid="chat-input"]';
export const USER_MSG = '[data-testid="user-message"]';
const USER_BUBBLE_SELECTORS = ['[data-cds="UserMessage"]', '[data-user-message-bubble]'];

const WIDEN_RATIO = 1.3;
const MAX_WALK = 6;
const SUBMIT_CORROBORATION_MS = 1000;

export function resolveAnchor(userMsgEl: HTMLElement): HTMLElement {
  for (const sel of USER_BUBBLE_SELECTORS) {
    const bubble = userMsgEl.closest<HTMLElement>(sel);
    if (bubble?.parentElement) return bubble.parentElement;
  }
  let el: HTMLElement = userMsgEl;
  const baseWidth = userMsgEl.getBoundingClientRect().width;
  for (let i = 0; i < MAX_WALK && el.parentElement; i++) {
    const parent = el.parentElement;
    if (parent.getBoundingClientRect().width >= baseWidth * WIDEN_RATIO) return parent;
    el = parent;
  }
  return userMsgEl;
}

export class ClaudeAdapter implements PromptAdapter {
  host = 'claude.ai';

  private cb: PromptCallbacks | null = null;
  private sendHandler: (() => void) | null = null;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;
  private boundBtn: HTMLElement | null = null;
  private boundComposer: HTMLElement | null = null;
  private trackingObserver: MutationObserver | null = null;
  private doneObserver: MutationObserver | null = null;
  private reattachObserver: MutationObserver | null = null;

  private lastAnchoredMsg: HTMLElement | null = null;
  private settling = true;
  private settleTimer: ReturnType<typeof setTimeout> | null = null;
  private lastSubmitTime = 0;

  start(cb: PromptCallbacks): void {
    this.cb = cb;
    this.attach();

    // Snapshot existing trailing message so history doesn't trigger an ad
    const existing = document.querySelectorAll<HTMLElement>(USER_MSG);
    this.lastAnchoredMsg = lastOf(existing);

    this.startSettling();

    this.trackingObserver = new MutationObserver(() => this.handleMutations());
    this.trackingObserver.observe(document.body, { childList: true, subtree: true });

    this.reattachObserver = new MutationObserver(() => this.attach());
    this.reattachObserver.observe(document.body, { childList: true, subtree: true });
  }

  stop(): void {
    this.detach();
    this.trackingObserver?.disconnect();
    this.doneObserver?.disconnect();
    this.reattachObserver?.disconnect();
    if (this.settleTimer) clearTimeout(this.settleTimer);
    this.trackingObserver = null;
    this.doneObserver = null;
    this.reattachObserver = null;
  }

  hostAdVisible(): boolean {
    return false;
  }

  private startSettling(): void {
    this.settling = true;
    if (this.settleTimer) clearTimeout(this.settleTimer);
    this.settleTimer = setTimeout(() => {
      this.settling = false;
      const current = document.querySelectorAll<HTMLElement>(USER_MSG);
      this.lastAnchoredMsg = lastOf(current);
    }, 400);
  }

  private attach(): void {
    const btn = document.querySelector<HTMLElement>(SEND_BTN);
    const composer = document.querySelector<HTMLElement>(COMPOSER);
    if (!btn || !composer) return;
    if (btn === this.boundBtn && composer === this.boundComposer) return;
    this.detach();

    this.boundBtn = btn;
    this.boundComposer = composer;
    this.sendHandler = () => this.recordSubmit();
    btn.addEventListener('click', this.sendHandler, true);

    this.keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        this.recordSubmit();
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

  private recordSubmit(): void {
    this.lastSubmitTime = Date.now();
    this.cb?.onSubmit();
  }

  private handleMutations(): void {
    if (this.settling) {
      this.startSettling();
      return;
    }

    const messages = document.querySelectorAll<HTMLElement>(USER_MSG);
    const trailing = lastOf(messages);
    if (!trailing || trailing === this.lastAnchoredMsg) return;

    // Verify submission happened close in time
    const timeSinceSubmit = Date.now() - this.lastSubmitTime;
    if (timeSinceSubmit > SUBMIT_CORROBORATION_MS) {
      // Uncorroborated mutation (likely sidebar history switch)
      this.lastAnchoredMsg = trailing;
      return;
    }

    this.lastAnchoredMsg = trailing;
    const anchor = resolveAnchor(trailing);
    this.cb?.onAnchorReady(anchor);
    this.watchForDone();
  }

  private watchForDone(): void {
    this.doneObserver?.disconnect();
    this.doneObserver = new MutationObserver(() => {
      const btn = document.querySelector<HTMLButtonElement>(SEND_BTN);
      if (btn && !btn.disabled) {
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
