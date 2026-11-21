'use client';

import { useState } from 'react';
import { Play, Sparkles, X } from 'lucide-react';

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
    <div className="w-full max-w-5xl xl:max-w-6xl overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-200/70 text-left transition-all">
      {/* Mock Browser Title Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-6 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="h-3.5 w-3.5 rounded-full bg-slate-300"></div>
          <div className="h-3.5 w-3.5 rounded-full bg-slate-300"></div>
          <div className="h-3.5 w-3.5 rounded-full bg-slate-300"></div>
          <span className="ml-3 text-sm font-mono text-slate-400">chatgpt.com</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/70">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Extension active: +${simulatedEarnings.toFixed(4)}
        </div>
      </div>

      {/* Mock Chat Feed */}
      <div className="p-6 sm:p-10 space-y-7">
        {/* User Prompt */}
        <div className="flex justify-end">
          <div className="max-w-2xl rounded-2xl bg-slate-100 px-5 py-3.5 text-base text-slate-800 shadow-sm leading-relaxed">
            Write a high-performance Next.js server action to process verified ad impressions.
          </div>
        </div>

        {/* Pathixo Rewards Sponsored Card (Injected cleanly in dead space) */}
        {showCard && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:p-4.5 text-sm transition-all animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-600 font-bold text-white text-xs">
                  C
                </span>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold uppercase text-emerald-800 shrink-0">
                  Sponsored
                </span>
                <a
                  href="https://cursor.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate font-medium text-sky-600 hover:underline text-sm sm:text-base"
                >
                  Build software 10x faster with Cursor — The AI Code Editor.
                </a>
                <span className="text-slate-400 text-xs shrink-0 hidden sm:inline">• via Pathixo Rewards</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCard(false)}
                className="shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded-md transition"
                title="Dismiss ad"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* AI Response Block */}
        <div className="space-y-4">
          {/* Thinking Accordion */}
          <div className="flex items-center gap-2.5 text-sm font-medium text-slate-500">
            <Sparkles className="h-4 w-4 text-sky-500" />
            <span>{isGenerating ? 'Thinking (4s dwell verified)...' : 'Thought for 4 seconds'}</span>
          </div>

          <div className="text-base leading-relaxed text-slate-700">
            {isGenerating ? (
              <div className="flex items-center gap-3 text-slate-400 py-2">
                <div className="h-2.5 w-2.5 rounded-full bg-slate-400 animate-ping"></div>
                Streaming response tokens from AI model...
              </div>
            ) : (
              <p>
                Here is a lightweight, edge-compatible Next.js Server Action designed to validate impression events, enforce dwell-time constraints, and credit earnings in under 150ms.
              </p>
            )}
          </div>
        </div>

        {/* Interactive Try Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-slate-500">
          <span>Notice: The card occupies zero prompt space and vanishes immediately if dismissed.</span>
          <button
            type="button"
            onClick={handleSimulate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 shadow-sm shrink-0"
          >
            <Play className="h-3.5 w-3.5 text-emerald-600 fill-emerald-600" />
            {isGenerating ? 'Simulating Generation...' : 'Test Wait Simulation'}
          </button>
        </div>
      </div>
    </div>
  );
}
