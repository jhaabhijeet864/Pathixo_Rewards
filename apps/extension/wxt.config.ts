import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: '.',
  zip: {
    name: 'pathixo-rewards-extension',
    artifactTemplate: '{{name}}.zip',
  },
  manifest: {
    name: 'Pathixo Rewards: Get paid while AI thinks',
    description:
      'Earn cash rewards while ChatGPT, Claude, Gemini, Perplexity, and DeepSeek generate responses. Open source and privacy first: never reads your chats.',
    version: '0.1.0',
    permissions: ['storage'],
    host_permissions: [
      'https://chatgpt.com/*',
      'https://claude.ai/*',
      'https://gemini.google.com/*',
      'https://www.perplexity.ai/*',
      'https://chat.deepseek.com/*',
      'https://api.pathixo.com/*',
      'http://localhost:3000/*',
    ],
    action: {
      default_title: 'Pathixo Rewards',
      default_popup: 'entrypoints/popup/index.html',
    },
    icons: {
      16: '/icon/16.png',
      32: '/icon/32.png',
      48: '/icon/48.png',
      96: '/icon/96.png',
      128: '/icon/128.png',
    },
  },
});
