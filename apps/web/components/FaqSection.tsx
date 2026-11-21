'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
  {
    q: "Does this violate the AI sites' terms?",
    a: 'No. The extension runs strictly in an isolated client-side sandbox inside your own browser. It inserts non-intrusive elements into empty display space during generation wait intervals and never modifies AI server traffic, reverse-engineers APIs, or scrapes models.',
  },
  {
    q: 'How much can I actually earn?',
    a: 'Earnings scale with your daily AI usage. Typical users earn between $3 and $15 per month. You receive a direct 60% revenue share of all verified ad impressions accumulated during model thinking time, with cashouts available from just $2.',
  },
  {
    q: 'Which browsers do you support?',
    a: 'Pathixo Rewards is compatible with Google Chrome, Microsoft Edge, Brave, and other Chromium-based browsers via our open-source Manifest V3 extension.',
  },
  {
    q: 'Does Pathixo Rewards read my chat messages or prompts?',
    a: 'Never. Our extension is 100% open-source on GitHub so anyone can inspect the code. It strictly looks for the "Stop generating" indicator and empty layout space. It never reads, logs, stores, or transmits your prompt text or AI answers.',
  },
  {
    q: 'Can I pause or disable ads if I need full focus?',
    a: 'Yes. Simply click the extension icon in your browser toolbar and toggle the switch to "Off" at any time. You can also dismiss any individual ad with a single click.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
            className="overflow-hidden rounded-2xl border border-[#162534] bg-[#0c1219] transition-all"
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="flex w-full items-center justify-between px-6 py-4 sm:py-5 text-left font-bold text-white transition hover:text-[#10e599]"
            >
              <span className="text-base sm:text-lg">{faq.q}</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#14212e] text-[#10e599] shrink-0 ml-4">
                {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </div>
            </button>
            {isOpen && (
              <div className="px-6 pb-5 pt-1 text-sm sm:text-base leading-relaxed text-slate-400 border-t border-[#162534]/70">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}