export default defineContentScript({
  matches: [
    'https://chatgpt.com/*',
    'https://claude.ai/*',
    'https://gemini.google.com/*',
    'https://www.perplexity.ai/*',
    'https://chat.deepseek.com/*',
  ],
  runAt: 'document_idle',
  main() {
    console.log('[Pathixo Rewards] Content script loaded on AI host:', window.location.hostname);
  },
});
