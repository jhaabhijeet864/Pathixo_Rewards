'use client';

import Link from 'next/link';
import { Lock, ArrowRight } from 'lucide-react';

export function ChromeIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.85.63-3.55 1.69-4.9L9.36 13.5c.29 1.48 1.47 2.62 2.97 2.85L8.5 20.31c1.08.44 2.26.69 3.5.69zm-1.85-6c-.64-.64-1-1.51-1-2.48 0-1.93 1.57-3.5 3.5-3.5.97 0 1.84.36 2.48 1L11.27 15c-.41-.3-.79-.65-1.12-1zm8.16-.9c-.19.78-.54 1.49-1.01 2.1l-3.83-6.63c.48-.36 1.05-.57 1.68-.57 1.93 0 3.5 1.57 3.5 3.5 0 .58-.14 1.12-.34 1.6zm-4.46-8.23C13.25 4.31 12.64 4.1 12 4.1c-2.85 0-5.32 1.5-6.68 3.73l3.52 6.1c.14-.82.59-1.51 1.22-1.97l3.79-6.09z" />
    </svg>
  );
}

export function StopWaitingSection() {
  return (
    <section className="relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-4xl lg:max-w-5xl overflow-hidden rounded-3xl sm:rounded-[36px] border border-[#162534] bg-[#080d14] px-6 py-14 sm:px-14 sm:py-20 text-center shadow-2xl">
        {/* Soft Ambient Radial Glow (Exact match to Chatwait Screenshot) */}
        <div
          className="pointer-events-none absolute inset-0 -top-24 bg-[radial-gradient(ellipse_70%_60%_at_50%_30%,rgba(16,185,129,0.18),rgba(6,78,59,0.08)_50%,transparent_80%)]"
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Main Headline */}
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white">
            Stop waiting{' '}
            <span className="font-serif italic font-normal text-[#10e599]">
              for free.
            </span>
          </h2>

          {/* Subtitle */}
          <p className="mt-5 max-w-xl text-base sm:text-lg text-slate-400 font-normal leading-relaxed">
            You already wait for the model dozens of times a day. Get paid for it.
          </p>

          {/* Add to Chrome CTA Button */}
          <div className="mt-8 flex flex-col items-center">
            <Link
              href="/coming-soon"
              className="inline-flex items-center gap-2.5 rounded-xl bg-[#10b981] px-7 py-3.5 text-base sm:text-lg font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-[#0ea371] hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <ChromeIcon className="h-5 w-5" />
              <span>Add to Chrome</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Micro-Trust Copy */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs sm:text-sm text-slate-400">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <span>Safe, free and</span>
              <a
                href="https://github.com/jhaabhijeet864/Pathixo_Rewards"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 text-slate-300 hover:text-white transition-colors"
              >
                open source
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}