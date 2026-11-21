import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ChatGPTAdapter,
  ClaudeAdapter,
  GeminiAdapter,
  PerplexityAdapter,
  DeepSeekAdapter,
} from '../../../apps/extension/entrypoints/content/adapters';

describe('AI Chatbot Content Script Adapters', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ChatGPTAdapter', () => {
    it('should initialize and attach submit listeners to ChatGPT DOM elements', () => {
      document.body.innerHTML = `
        <form id="chat-form">
          <textarea id="prompt-textarea"></textarea>
          <button data-testid="send-button">Send</button>
        </form>
      `;

      const adapter = new ChatGPTAdapter();
      const callbacks = {
        onSubmit: vi.fn(),
        onAnchorReady: vi.fn(),
        onDone: vi.fn(),
      };

      adapter.start(callbacks);

      const sendBtn = document.querySelector<HTMLButtonElement>('[data-testid="send-button"]')!;
      sendBtn.click();

      expect(callbacks.onSubmit).toHaveBeenCalledTimes(1);
      adapter.stop();
    });

    it('should detect host sponsored ads on ChatGPT', () => {
      const adapter = new ChatGPTAdapter();
      expect(adapter.hostAdVisible()).toBe(false);

      const adDiv = document.createElement('div');
      adDiv.className = 'ad-container';
      document.body.appendChild(adDiv);

      expect(adapter.hostAdVisible()).toBe(true);
      adapter.stop();
    });

    it('should trigger onSubmit on Enter key in composer', () => {
      document.body.innerHTML = `
        <form>
          <textarea id="prompt-textarea"></textarea>
          <button data-testid="send-button">Send</button>
        </form>
      `;

      const adapter = new ChatGPTAdapter();
      const callbacks = {
        onSubmit: vi.fn(),
        onAnchorReady: vi.fn(),
        onDone: vi.fn(),
      };

      adapter.start(callbacks);

      const composer = document.querySelector<HTMLTextAreaElement>('#prompt-textarea')!;
      composer.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      expect(callbacks.onSubmit).toHaveBeenCalledTimes(1);
      adapter.stop();
    });
  });

  describe('ClaudeAdapter', () => {
    it('should attach to Claude chat input and send button', () => {
      document.body.innerHTML = `
        <div data-testid="chat-input" contenteditable="true"></div>
        <button aria-label="Send message">Send</button>
      `;

      const adapter = new ClaudeAdapter();
      const callbacks = {
        onSubmit: vi.fn(),
        onAnchorReady: vi.fn(),
        onDone: vi.fn(),
      };

      adapter.start(callbacks);

      const sendBtn = document.querySelector<HTMLButtonElement>('button[aria-label="Send message"]')!;
      sendBtn.click();

      expect(callbacks.onSubmit).toHaveBeenCalledTimes(1);
      adapter.stop();
    });

    it('should detect when user message bubble becomes available', async () => {
      document.body.innerHTML = `
        <div data-testid="chat-input" contenteditable="true"></div>
        <button aria-label="Send message">Send</button>
        <div id="messages"></div>
      `;

      const adapter = new ClaudeAdapter();
      const callbacks = {
        onSubmit: vi.fn(),
        onAnchorReady: vi.fn(),
        onDone: vi.fn(),
      };

      adapter.start(callbacks);

      const sendBtn = document.querySelector<HTMLButtonElement>('button[aria-label="Send message"]')!;
      sendBtn.click();

      // Simulate Claude creating user message bubble in DOM
      const userBubble = document.createElement('div');
      userBubble.setAttribute('data-testid', 'user-message');
      document.getElementById('messages')!.appendChild(userBubble);

      // Wait for MutationObserver microtask
      await new Promise((r) => setTimeout(r, 20));

      expect(callbacks.onAnchorReady).toHaveBeenCalled();
      adapter.stop();
    });
  });

  describe('GeminiAdapter', () => {
    it('should attach to Gemini rich-textarea and submit button', () => {
      document.body.innerHTML = `
        <rich-textarea>
          <div contenteditable="true"></div>
        </rich-textarea>
        <button aria-label="Send message">Send</button>
      `;

      const adapter = new GeminiAdapter();
      const callbacks = {
        onSubmit: vi.fn(),
        onAnchorReady: vi.fn(),
        onDone: vi.fn(),
      };

      adapter.start(callbacks);

      const sendBtn = document.querySelector<HTMLButtonElement>('button[aria-label="Send message"]')!;
      sendBtn.click();

      expect(callbacks.onSubmit).toHaveBeenCalledTimes(1);
      adapter.stop();
    });
  });

  describe('PerplexityAdapter', () => {
    it('should attach to Perplexity ask textarea and submit button', () => {
      document.body.innerHTML = `
        <textarea placeholder="Ask anything..."></textarea>
        <button aria-label="Submit query">Ask</button>
      `;

      const adapter = new PerplexityAdapter();
      const callbacks = {
        onSubmit: vi.fn(),
        onAnchorReady: vi.fn(),
        onDone: vi.fn(),
      };

      adapter.start(callbacks);

      const sendBtn = document.querySelector<HTMLButtonElement>('button[aria-label="Submit query"]')!;
      sendBtn.click();

      expect(callbacks.onSubmit).toHaveBeenCalledTimes(1);
      adapter.stop();
    });
  });

  describe('DeepSeekAdapter', () => {
    it('should attach to DeepSeek textarea and send button', () => {
      document.body.innerHTML = `
        <textarea id="chat-input" placeholder="Type a message to DeepSeek..."></textarea>
        <div role="button" aria-label="Send">Send</div>
      `;

      const adapter = new DeepSeekAdapter();
      const callbacks = {
        onSubmit: vi.fn(),
        onAnchorReady: vi.fn(),
        onDone: vi.fn(),
      };

      adapter.start(callbacks);

      const sendBtn = document.querySelector<HTMLElement>('div[role="button"][aria-label="Send"]')!;
      sendBtn.click();

      expect(callbacks.onSubmit).toHaveBeenCalledTimes(1);
      adapter.stop();
    });
  });
});
