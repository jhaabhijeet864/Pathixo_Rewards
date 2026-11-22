'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AlertTriangle, RotateCcw, Home, LifeBuoy } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client-side exception
    console.error('Pathixo App Encountered Exception:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-[#070a0e] text-white selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20 text-center relative overflow-hidden">
        {/* Subtle Ambient Red/Orange Warning Glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-96 rounded-full bg-rose-500/5 blur-3xl" />

        <div className="relative z-10 max-w-lg mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-950/30 px-3.5 py-1 text-xs font-semibold text-rose-400 mb-6">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Application Error</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Something went wrong
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed max-w-md mx-auto">
            An unexpected error occurred while processing this request. Your verified earnings and account data remain completely secure.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 cursor-pointer hover:-translate-y-0.5"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Try again</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0d121c] px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
            >
              <Home className="h-4 w-4 text-slate-400" />
              <span>Back to Home</span>
            </Link>

            <a
              href="https://github.com/jhaabhijeet864/Pathixo_Rewards/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0d121c] px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
            >
              <LifeBuoy className="h-4 w-4 text-slate-400" />
              <span>Report Issue</span>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
