'use client';

import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

export function DuolingoOwl({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Duolingo iconic green squircle body */}
      <rect width="36" height="36" rx="10" fill="#58CC02" />
      {/* Belly curve */}
      <path d="M10 24C10 20 13 18 18 18C23 18 26 20 26 24C26 28 22 30 18 30C14 30 10 28 10 24Z" fill="#78C800" />
      {/* Left eye */}
      <circle cx="12.5" cy="15" r="5" fill="white" />
      <circle cx="13.5" cy="15" r="2.8" fill="#4B4B4B" />
      <circle cx="12.5" cy="14" r="1.1" fill="white" />
      {/* Right eye */}
      <circle cx="23.5" cy="15" r="5" fill="white" />
      <circle cx="22.5" cy="15" r="2.8" fill="#4B4B4B" />
      <circle cx="21.5" cy="14" r="1.1" fill="white" />
      {/* Orange beak */}
      <path d="M15 17.5H21L18 22L15 17.5Z" fill="#FF9600" />
    </svg>
  );
}

export function ChatGptIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.5045 4.5045 0 0 1-4.4945 4.4947zm-9.66-4.1255a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1401-1.6465zM2.3428 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1683a.0757.0757 0 0 1-.071 0l-4.8303-2.7866A4.504 4.504 0 0 1 2.3428 7.8956zm16.0993 3.8558L12.5993 8.3829l5.8428-3.3685a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.3879-.6765zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.6648zm-8.8687 4.5218l-2.6074-1.5054 2.6074-1.5054 2.6074 1.5054-2.6074 1.5054z" />
    </svg>
  );
}

export function ClaudeIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#D97757">
      <path d="M12 2L13.8 8.6L20.4 10.4L13.8 12.2L12 18.8L10.2 12.2L3.6 10.4L10.2 8.6L12 2Z" />
      <path d="M17.5 17.5L18.5 21L19.5 17.5L23 16.5L19.5 15.5L18.5 12L17.5 15.5L14 16.5L17.5 17.5Z" opacity="0.8" />
    </svg>
  );
}

export function GeminiIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z"
        fill="url(#gemini-grad-hero)"
      />
      <defs>
        <linearGradient id="gemini-grad-hero" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4E82EE" />
          <stop offset="0.5" stopColor="#9B72CB" />
          <stop offset="1" stopColor="#D96570" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function PerplexityIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3L6.3 17.7" />
    </svg>
  );
}

export function DeepSeekIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#6366f1">
      <path d="M12 3c-4.97 0-9 4.03-9 9 0 3.86 2.45 7.15 5.88 8.38.45.08.62-.2.62-.44v-1.54c-2.42.53-2.93-1.17-2.93-1.17-.4-.1-1.02-.6-1.02-.6-.79-.54.06-.53.06-.53.87.06 1.33.9 1.33.9.78 1.33 2.04.95 2.54.72.08-.56.3-.95.55-1.17-1.93-.22-3.96-.97-3.96-4.3 0-.95.34-1.73.9-2.34-.09-.22-.39-1.11.09-2.31 0 0 .73-.23 2.4 1.13.7-.19 1.45-.29 2.2-.29.75 0 1.5.1 2.2.29 1.67-1.36 2.4-1.13 2.4-1.13.48 1.2.18 2.09.09 2.31.56.61.9 1.39.9 2.34 0 3.34-2.04 4.08-3.98 4.29.31.27.59.8.59 1.61v2.39c0 .24.17.53.63.44C18.55 19.15 21 15.86 21 12c0-4.97-4.03-9-9-9z" />
    </svg>
  );
}

export function HeroChatMockup() {
  const [balance, setBalance] = useState<number>(12.622);
  const [showEarnedBadge, setShowEarnedBadge] = useState<boolean>(true);
  const [isAdVisible] = useState<boolean>(true);

  // Auto-playing live GIF animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Pulse credit animation and tick up balance
      setShowEarnedBadge(false);
      setTimeout(() => {
        setBalance((prev) => {
          const next = Number((prev + 0.005).toFixed(3));
          return next > 12.95 ? 12.622 : next;
        });
        setShowEarnedBadge(true);
      }, 400);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-3xl flex flex-col items-center">
      {/* Chat Window Container with Relative Badges */}
      <div className="relative w-full">
        {/* Top-Right Floating Balance Card */}
        <div className="absolute -top-7 sm:-top-8 -right-2 sm:-right-6 z-30 flex flex-col items-start rounded-2xl border border-[#223244] bg-[#0c131c]/95 px-4 py-3 shadow-2xl backdrop-blur-md">
          {/* Green +$0.005 Toast */}
          <div className="absolute -top-3 right-3">
            <span
              className={`inline-block rounded-full bg-[#10e599] px-2.5 py-0.5 text-xs font-black text-[#04281a] shadow-md transition-all duration-300 ${
                showEarnedBadge ? 'scale-100 opacity-100' : 'scale-90 opacity-70'
              }`}
            >
              +$0.005
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10e599] animate-pulse"></span>
            YOUR BALANCE
          </div>
          <div className="mt-0.5 font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            ${balance.toFixed(3)}
          </div>
        </div>

        {/* Main Mockup Window */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0c1017] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {/* macOS Title Bar */}
          <div className="relative flex items-center justify-between border-b border-slate-800/80 bg-[#090d14] px-4 sm:px-6 py-3">
            {/* Traffic Lights */}
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ff5f56]"></span>
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]"></span>
              <span className="h-3 w-3 rounded-full bg-[#27c93f]"></span>
            </div>

            {/* URL Capsule */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-md bg-[#131b24] border border-white/5 px-3 py-1 text-xs font-mono text-slate-400">
              <Lock className="h-3 w-3 text-slate-400" />
              <span>chatgpt.com</span>
            </div>

            {/* Spacer */}
            <div className="w-12"></div>
          </div>

          {/* Chat Window Body */}
          <div className="p-6 sm:p-10 space-y-6">
            {/* User Prompt (Right Aligned Bubble) */}
            <div className="flex justify-end">
              <div className="rounded-2xl bg-[#262c36] px-5 py-3 text-sm sm:text-base font-medium text-white shadow-sm">
                Help me plan a weekend getaway
              </div>
            </div>

            {/* Sponsored Line + Divider + Thinking Block */}
            <div className="space-y-4 pt-2">
              {/* Duolingo Sponsored Line */}
              {isAdVisible && (
                <div className="flex items-center gap-3 animate-in fade-in duration-300">
                  <DuolingoOwl className="h-7 w-7 shrink-0 rounded-lg shadow-sm" />
                  <a
                    href="https://duolingo.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-base font-semibold text-[#38bdf8] hover:underline"
                  >
                    Learn a language while you wait
                  </a>
                </div>
              )}

              {/* Horizontal Separator */}
              <div className="border-t border-slate-800/80"></div>

              {/* Thinking State */}
              <div className="flex items-center gap-2.5 text-sm font-medium text-slate-400">
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse"></span>
                <span>Thinking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-Right Floating Revenue Split Badge */}
        <div className="absolute -bottom-4 right-4 sm:right-8 z-30 flex items-center gap-2 rounded-full border border-[#223244] bg-[#0c131c] px-3.5 py-1.5 shadow-xl">
          <span className="rounded bg-[#083524] px-2 py-0.5 text-xs font-bold text-[#10e599]">
            60%
          </span>
          <span className="text-xs font-medium text-slate-300">
            of ad revenue goes to you
          </span>
        </div>
      </div>

      {/* WORKS WHERE YOU ALREADY WAIT Section - Exactly 5 Supported Chatbots */}
      <div className="mt-14 flex flex-col items-center">
        <p className="text-xs font-bold tracking-widest uppercase text-slate-400">
          WORKS WHERE YOU ALREADY WAIT
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
          {/* ChatGPT Pill */}
          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-[#0e141d] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:border-slate-700">
            <ChatGptIcon className="h-4 w-4 text-white" />
            <span>ChatGPT</span>
          </div>

          {/* Claude Pill */}
          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-[#0e141d] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:border-slate-700">
            <ClaudeIcon className="h-4 w-4" />
            <span>Claude</span>
          </div>

          {/* Gemini Pill */}
          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-[#0e141d] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:border-slate-700">
            <GeminiIcon className="h-4 w-4" />
            <span>Gemini</span>
          </div>

          {/* Perplexity Pill */}
          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-[#0e141d] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:border-slate-700">
            <PerplexityIcon className="h-4 w-4" />
            <span>Perplexity</span>
          </div>

          {/* DeepSeek Pill */}
          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-[#0e141d] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:border-slate-700">
            <DeepSeekIcon className="h-4 w-4" />
            <span>DeepSeek</span>
          </div>
        </div>
      </div>
    </div>
  );
}