import type { PromptAdapter, PromptCallbacks } from './types';
import { lastOf } from '../shared';

const SEND_BTN = 'div[role="button"][aria-label="Send"], button[aria-label="Send"], [data-testid="send-btn"]';
const COMPOSER = 'textarea#chat-input, textarea[placeholder*="DeepSeek"], textarea';
const USER_MSG = 'div[class*="user-message"], div[data-role="user"], div.ds-message--user';
const STOP_BTN = 'button[aria-label="Stop"], div[role="button"][aria-label="Stop"], [data-testid="stop-btn"]';

export class DeepSeekAdapter implements PromptAdapter {
  host = 'chat.deepseek.com';

  private cb: PromptCallbacks | null = null;
  private sendHandler: (() => void) | null = null;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;
  private boundBtn: HTMLElement | null = null;
  private boundComposer: HTMLElement | null = null;
  private anchorObserver: MutationObserver | null = null;
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
    this.doneObserver?.disconnect();
    this.reattachObserver = null;
    this.anchorObserver = null;
    this.doneObserver = null;
  }

  hostAdVisible(): boolean {
    return false;
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
    this.preSubmitUserMsg = lastOf(document.querySelectorAll<HTMLElement>(USER_MSG));
    this.watchForUserTurn();
  }

  private watchForUserTurn(): void {
    this.anchorObserver?.disconnect();
    this.anchorObserver = new MutationObserver(() => {
      const messages = document.querySelectorAll<HTMLElement>(USER_MSG);
      const latest = lastOf(messages);
      if (!latest || latest === this.preSubmitUserMsg) return;

      const anchor = latest.closest<HTMLElement>('.ds-message-row, [data-row-id]') ?? latest;
      this.anchorObserver?.disconnect();
      this.cb?.onAnchorReady(anchor);
      this.watchForDone();
    });
    this.anchorObserver.observe(document.body, { childList: true, subtree: true });
  }

  private watchForDone(): void {
    this.doneObserver?.disconnect();
    let stopSeen = false;
    this.doneObserver = new MutationObserver(() => {
      const stopBtn = document.querySelector(STOP_BTN);
      if (stopBtn) {
        stopSeen = true;
        return;
      }
      if (stopSeen) {
        this.cb?.onDone();
        this.doneObserver?.disconnect();
        return;
      }
      const sendBtn = document.querySelector<HTMLElement>(SEND_BTN);
      if (sendBtn && !sendBtn.getAttribute('aria-disabled')) {
        this.cb?.onDone();
        this.doneObserver?.disconnect();
      }
    });
    this.doneObserver.observe(document.body, { childList: true, subtree: true });
  }
}
