'use client';

import { useState } from 'react';
import { Play, Sparkles, X, CheckCircle } from 'lucide-react';

export function HeroChatMockup() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCard, setShowCard] = useState(true);
  const [simulatedEarnings, setSimulatedEarnings] = useState(0.0923);

  const handleSimulate = () => {
    setIsGenerating(true);
    setShowCard(true);

    setTimeout(() => {
      setIsGenerating(false);
      setSimulatedEarnings((prev) => Number((prev + 0.009).toFixed(4)));
    }, 4500);
  };

  return (
    <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      {/* Mock Browser Title Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-slate-300"></div>
          <div className="h-3 w-3 rounded-full bg-slate-300"></div>
          <div className="h-3 w-3 rounded-full bg-slate-300"></div>
          <span className="ml-2 text-xs font-mono text-slate-400">chatgpt.com</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Extension active: +${simulatedEarnings.toFixed(4)}
        </div>
      </div>

      {/* Mock Chat Feed */}
      <div className="p-6 space-y-5">
        {/* User Prompt */}
        <div className="flex justify-end">
          <div className="max-w-md rounded-2xl bg-slate-100 px-4 py-2.5 text-sm text-slate-800">
            Write a high-performance Next.js server action to process verified ad impressions.
          </div>
        </div>

        {/* Pathixo Rewards Sponsored Card (Injected cleanly in dead space) */}
        {showCard && (
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs transition-all animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-600 font-bold text-white text-[10px]">
                  C
                </span>
                <span className="rounded bg-emerald-100/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                  Sponsored
                </span>
                <a
                  href="https://cursor.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate font-medium text-sky-600 hover:underline"
                >
                  Build software 10x faster with Cursor — The AI Code Editor.
                </a>
                <span className="text-slate-400 text-[11px] shrink-0">• via Pathixo Rewards</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCard(false)}
                className="shrink-0 text-slate-400 hover:text-slate-600"
                title="Dismiss ad"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* AI Response Block */}
        <div className="space-y-3">
          {/* Thinking Accordion */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Sparkles className="h-3.5 w-3.5 text-sky-500" />
            <span>{isGenerating ? 'Thinking (4s dwell verified)...' : 'Thought for 4 seconds'}</span>
          </div>

          <div className="text-sm leading-relaxed text-slate-700">
            {isGenerating ? (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="h-2 w-2 rounded-full bg-slate-400 animate-ping"></div>
                Streaming response tokens...
              </div>
            ) : (
              <p>
                Here is a lightweight, edge-compatible Next.js Server Action designed to validate impression events, enforce dwell-time constraints, and credit earnings in under 150ms.
              </p>
            )}
          </div>
        </div>

        {/* Interactive Try Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Notice: The card occupies zero prompt space and vanishes immediately if dismissed.</span>
          <button
            type="button"
            onClick={handleSimulate}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <Play className="h-3 w-3 text-emerald-600 fill-emerald-600" />
            {isGenerating ? 'Simulating Generation...' : 'Test Wait Simulation'}
          </button>
        </div>
      </div>
    </div>
  );
}
