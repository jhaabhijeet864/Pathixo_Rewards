'use client';

import { useState, useEffect } from 'react';
import { Play, Sparkles, X, ExternalLink, ShieldCheck, CheckCircle2, RotateCw } from 'lucide-react';

interface ModelPreset {
  id: string;
  name: string;
  tag: string;
  color: string;
  prompt: string;
  thinkingLabel: string;
  thinkingDetails: string;
  streamedSnippet: string;
  sponsorCreative: {
    brand: string;
    headline: string;
    badge: string;
    url: string;
    initial: string;
  };
}

const PRESETS: ModelPreset[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek R1',
    tag: 'Deep Reasoning',
    color: 'from-blue-500 to-indigo-600',
    prompt: 'Synthesize optimal zero-copy serialization for high-frequency telemetry in Rust.',
    thinkingLabel: 'DeepSeek Thinking Mode (4.2s dwell)',
    thinkingDetails: 'Analyzing memory layout -> Comparing FlatBuffers vs Cap’n Proto -> SIMD alignment verification...',
    streamedSnippet: 'For sub-microsecond serialization without GC overhead, utilize rkyv or flatbuffers with zero-copy deserialization buffers aligned to 64-byte cache lines.',
    sponsorCreative: {
      brand: 'Cursor AI',
      headline: 'Build & refactor Rust systems 10x faster with AI-native editor autocompletions.',
      badge: 'Featured Developer Sponsor',
      url: 'https://cursor.com',
      initial: 'C',
    },
  },
  {
    id: 'claude',
    name: 'Claude 3.7 Sonnet',
    tag: 'Hybrid Thinking',
    color: 'from-amber-500 to-orange-600',
    prompt: 'Architect an ultra-resilient browser extension ad insertion engine avoiding all DOM conflicts.',
    thinkingLabel: 'Thinking Process (Extended Thought)',
    thinkingDetails: 'Evaluating open Shadow DOM boundaries -> Verifying zero innerHTML sinks -> Implementing MutationObserver disconnect safeguards...',
    streamedSnippet: 'By attaching an isolated open ShadowRoot to the prompt anchor and mutating elements via native createElement/textContent, host stylesheets and DOM scripts cannot collide.',
    sponsorCreative: {
      brand: 'V0 by Vercel',
      headline: 'Generate production-ready React components with Tailwind CSS in seconds.',
      badge: 'UI Tool of the Month',
      url: 'https://v0.dev',
      initial: 'V',
    },
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT o3-mini',
    tag: 'High Speed',
    color: 'from-emerald-500 to-teal-600',
    prompt: 'How does Pathixo Rewards verify 4-second dwell time without reading user messages?',
    thinkingLabel: 'Reasoned for 4 seconds',
    thinkingDetails: 'Verifying document.visibilityState -> Checking performance.now() elapsed timestamps -> Validating signed HMAC token...',
    streamedSnippet: 'Pathixo binds exclusively to prompt submit buttons. It tracks timestamp deltas and window focus states without ever accessing or inspecting composer input text.',
    sponsorCreative: {
      brand: 'Perplexity Pro',
      headline: 'Instant, cited research queries across scientific papers and industry filings.',
      badge: 'Pro Research Sponsor',
      url: 'https://perplexity.ai',
      initial: 'P',
    },
  },
];

export function HeroChatMockup() {
  const [selectedModel, setSelectedModel] = useState<ModelPreset>(PRESETS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cardDismissed, setCardDismissed] = useState(false);
  const [balance, setBalance] = useState(0.0923);
  const [verifiedCredits, setVerifiedCredits] = useState(0);

  const startSimulation = () => {
    setIsGenerating(true);
    setProgress(0);
    setCardDismissed(false);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 1000);

    setTimeout(() => {
      setIsGenerating(false);
      setBalance((b) => Number((b + 0.009).toFixed(4)));
      setVerifiedCredits((c) => c + 1);
    }, 4200);
  };

  return (
    <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0d1322] shadow-2xl shadow-indigo-950/50">
      
      {/* Console Top Chrome Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-[#0a0e19] px-4 py-3 sm:px-6">
        {/* Model Switcher Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {PRESETS.map((preset) => {
            const isSelected = preset.id === selectedModel.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setSelectedModel(preset);
                  setIsGenerating(false);
                  setProgress(0);
                }}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-white/[0.1] text-white shadow-sm border border-white/[0.15]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${preset.color}`}></span>
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>

        {/* Live Wallet Micro-Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-mono font-medium text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Wallet: ${balance.toFixed(4)} USD</span>
            {verifiedCredits > 0 && (
              <span className="text-[10px] text-emerald-400 font-bold ml-0.5">
                (+${(verifiedCredits * 0.009).toFixed(3)})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Chat Canvas */}
      <div className="p-5 sm:p-7 space-y-6">
        
        {/* User Prompt Bubble */}
        <div className="flex justify-end">
          <div className="max-w-xl rounded-2xl border border-white/[0.08] bg-[#141b2d] px-4 py-3 text-sm leading-relaxed text-slate-100 shadow-sm">
            <div className="text-[10px] uppercase tracking-wider font-mono text-cyan-400 mb-1">User Query</div>
            {selectedModel.prompt}
          </div>
        </div>

        {/* BESPOKE PATHIXO INLINE SPONSORED CARD */}
        {!cardDismissed && (
          <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-r from-[#11182c] via-[#0f1933] to-[#121626] p-4 text-xs shadow-lg transition-all">
            {/* Dwell Progress Indicator Bar */}
            {isGenerating && (
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400 transition-all duration-1000 ease-linear"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* Brand Monogram */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 font-bold text-white shadow-glow">
                  {selectedModel.sponsorCreative.initial}
                </div>

                {/* Creative Details */}
                <div className="min-w-0 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300 border border-cyan-400/20">
                      {selectedModel.sponsorCreative.badge}
                    </span>
                    <span className="font-semibold text-slate-200">
                      {selectedModel.sponsorCreative.brand}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      • 60% Rev Share Credit: <strong className="text-emerald-400">+$0.009</strong>
                    </span>
                  </div>
                  <p className="text-slate-300 font-medium truncate sm:max-w-md lg:max-w-lg">
                    {selectedModel.sponsorCreative.headline}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <a
                  href={selectedModel.sponsorCreative.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 hover:text-cyan-300"
                >
                  <span>Explore</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <button
                  type="button"
                  onClick={() => setCardDismissed(true)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
                  title="Dismiss sponsored unit"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Verification Footer Pill */}
            <div className="mt-2.5 flex items-center justify-between border-t border-white/[0.06] pt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Zero prompt reading • Sandboxed Shadow DOM layer</span>
              </span>
              <span className="font-mono text-slate-400">
                {isGenerating ? `Verifying 4s Dwell (${progress}%)` : 'Qualified 4.2s Impression ✓'}
              </span>
            </div>
          </div>
        )}

        {/* AI Thought Process & Generated Output */}
        <div className="space-y-3 pt-1">
          {/* Thinking State Box */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0a0e1a] p-3.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-medium text-indigo-300">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
                <span>{selectedModel.thinkingLabel}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {isGenerating ? 'Active thinking cycle' : 'Settled'}
              </span>
            </div>
            <p className="mt-1.5 text-[11.5px] font-mono text-slate-400 leading-relaxed">
              {selectedModel.thinkingDetails}
            </p>
          </div>

          {/* Streamed Output Text */}
          <div className="text-sm leading-relaxed text-slate-200 pl-1">
            {isGenerating ? (
              <div className="flex items-center gap-2 text-slate-400 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
                </span>
                <span className="font-mono text-xs text-cyan-300">Streaming tokens while you earn...</span>
              </div>
            ) : (
              <p className="border-l-2 border-indigo-500/50 pl-3">
                {selectedModel.streamedSnippet}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Simulator Interactive Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.08] bg-[#090d16] px-5 py-3.5">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Interactive Live Simulator: Try triggering a prompt below</span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {cardDismissed && (
            <button
              type="button"
              onClick={() => setCardDismissed(false)}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5 transition"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Reset Ad Card
            </button>
          )}

          <button
            type="button"
            disabled={isGenerating}
            onClick={startSimulation}
            className={`flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-glow transition-all ${
              isGenerating
                ? 'bg-slate-700 opacity-60 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500'
            }`}
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            <span>{isGenerating ? 'Thinking in Progress (4s)...' : 'Test Prompt Wait (Earn +$0.009)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
