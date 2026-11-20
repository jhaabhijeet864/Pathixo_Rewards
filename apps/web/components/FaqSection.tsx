'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'Does Pathixo Rewards read my chat messages or prompts?',
    a: 'Never. Our extension is 100% open-source on GitHub so anyone can inspect the code. It strictly looks for the "Stop generating" button and empty layout space. It never reads, logs, stores, or transmits your prompt text or AI answers.',
  },
  {
    q: 'How and when can I cash out my earnings?',
    a: 'You can withdraw as soon as your balance reaches $2.00 USD. We support instant UPI transfers (India), PayPal, and digital gift cards. There are no 30-day holds or lock-in periods.',
  },
  {
    q: 'Which AI chatbots are currently supported?',
    a: 'Pathixo Rewards supports ChatGPT (chatgpt.com), Claude (claude.ai), Gemini (gemini.google.com), Perplexity (perplexity.ai), and DeepSeek (chat.deepseek.com).',
  },
  {
    q: 'Does this slow down my AI generation or browser?',
    a: 'No. The extension runs in an isolated content script with a bundle size of under 40 KB. It adds zero latency to your prompt submissions and uses pure native DOM rendering.',
  },
  {
    q: 'Can I pause or disable ads if I need full focus?',
    a: 'Yes. Simply click the extension icon in your browser toolbar and toggle the switch to "Off" at any time. You can also dismiss any individual ad with a single click on the "×" button.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full max-w-3xl space-y-3">
      {FAQS.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors"
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="flex w-full items-center justify-between px-6 py-4 text-left font-semibold text-slate-800 hover:text-slate-900"
            >
              <span>{faq.q}</span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-emerald-600' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-4 text-sm leading-relaxed text-slate-600 border-t border-slate-50 pt-2">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
