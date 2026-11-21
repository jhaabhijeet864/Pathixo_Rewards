'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'Does Pathixo Rewards read my chat prompts or AI responses?',
    a: 'Never. Our client extension is 100% open-source on GitHub for anyone to audit. The content script exclusively binds to the prompt submit button and DOM mutation hooks. It has zero code for reading, storing, harvesting, or transmitting your prompt text or generated completions.',
  },
  {
    q: 'How does the $2.00 instant cashout work?',
    a: 'Unlike other extensions that impose $10 minimums and 30-day payout holding periods, Pathixo sets a low $2.00 floor. As soon as your verified balance reaches $2.00, click "Cash Out" in your dashboard to receive an instant transfer via UPI (India), PayPal (Global), or Digital Amazon Gift Cards.',
  },
  {
    q: 'Why do you offer 60% revenue share when others give 50%?',
    a: 'We believe user attention is the most valuable part of the AI ecosystem. By operating with an automated, ultra-lean ad engine with zero bloat, we return 60% of verified ad revenue directly to users, and an extra 10% referral bonus to creators.',
  },
  {
    q: 'Which AI chatbots are supported?',
    a: 'Pathixo Rewards works across the 5 top AI platforms: ChatGPT (chatgpt.com), Claude (claude.ai), Google Gemini (gemini.google.com), Perplexity (perplexity.ai), and DeepSeek (chat.deepseek.com).',
  },
  {
    q: 'Does the extension slow down my browser or streaming speed?',
    a: 'Zero slowdown. The extension compiles to a lightweight ~35 KB bundle using native DOM APIs (`createElement`/`textContent`) inside an isolated open Shadow DOM. It introduces no network latency or prompt lag.',
  },
  {
    q: 'Can I dismiss ads or pause monetization whenever I want?',
    a: 'Yes. Every sponsored unit features an instant "×" dismiss button. You can also click the extension icon in your browser toolbar to toggle monetization to "Paused" with a single click.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3.5">
      {FAQS.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={`overflow-hidden rounded-2xl border transition-all ${
              isOpen
                ? 'border-cyan-500/30 bg-[#0e1424] shadow-lg shadow-indigo-950/20'
                : 'border-white/[0.08] bg-[#0c111e] hover:border-white/[0.14]'
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="flex w-full items-center justify-between px-6 py-4.5 text-left font-semibold text-slate-100 hover:text-white transition"
            >
              <span className="flex items-center gap-3 text-sm sm:text-base">
                <HelpCircle className={`h-4 w-4 shrink-0 ${isOpen ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{faq.q}</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-cyan-400' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-5 pt-1 text-sm leading-relaxed text-slate-300 border-t border-white/[0.06]">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
