'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ChromeIcon } from '@/components/StopWaitingSection';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Bell,
  ArrowRight,
  Terminal,
  Zap,
  Clock,
  Layers,
} from 'lucide-react';

export default function ComingSoonPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#070a0e] text-white selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden py-20 sm:py-28 text-center px-4 sm:px-6 lg:px-8">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 h-72 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="mx-auto max-w-3xl relative z-10">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Chrome Web Store Listing — Under Review</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl text-white">
              Official Store Launch <br />
              <span className="font-serif italic font-normal text-emerald-400">
                Coming Very Soon.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
              We have submitted the Manifest V3 package to the Google Chrome Web Store &amp; Firefox AMO. Public 1-click install is arriving shortly!
            </p>

            {/* NOTIFY ME EMAIL FORM */}
            <div className="mt-8 max-w-md mx-auto">
              {submitted ? (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-5 text-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white">You&apos;re on the early access VIP list!</p>
                  <p className="text-xs text-slate-400 mt-1">
                    We&apos;ll ping <strong className="text-emerald-300">{email}</strong> the second the Chrome Web Store listing goes live.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email to get notified..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-800 bg-[#0d121c] px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    <Bell className="h-4 w-4" />
                    <span>Notify Me</span>
                  </button>
                </form>
              )}
            </div>

            {/* EARLY DEVELOPER ACCESS INSTRUCTIONS */}
            <div className="mt-12 rounded-3xl border border-slate-800/90 bg-[#0c121d] p-6 sm:p-8 text-left shadow-2xl">
              <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm mb-3">
                <Terminal className="h-4 w-4" />
                <span>Want to test it right now? (Developer Unpacked Mode)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Because Pathixo Rewards is 100% open source, you don&apos;t have to wait for Google&apos;s review process. You can clone the repo and load the unpacked extension in 30 seconds:
              </p>

              <ol className="mt-4 space-y-2 text-xs sm:text-sm text-slate-400 list-decimal list-inside">
                <li>
                  Clone or download the repository from{' '}
                  <a
                    href="https://github.com/jhaabhijeet864/Pathixo_Rewards"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline font-medium"
                  >
                    GitHub
                  </a>.
                </li>
                <li>
                  Open <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-200">chrome://extensions</code> in your browser and toggle <strong>Developer mode</strong>.
                </li>
                <li>
                  Click <strong>Load unpacked</strong> and select the directory: <br />
                  <code className="mt-1 block overflow-x-auto rounded-lg bg-[#070a0e] border border-slate-800 p-2 font-mono text-[11px] text-emerald-300">
                    apps/extension/.output/chrome-mv3
                  </code>
                </li>
              </ol>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href="https://github.com/jhaabhijeet864/Pathixo_Rewards"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-white transition-colors"
                >
                  <span>View Repository on GitHub</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700/80 hover:border-slate-600 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <span>Explore Dashboard Preview</span>
                </Link>
              </div>
            </div>

            {/* TRUST & GUARANTEES */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="rounded-2xl border border-slate-800/80 bg-[#090d14] p-5">
                <ShieldCheck className="h-5 w-5 text-emerald-400 mb-2" />
                <h3 className="font-bold text-white text-sm">Privacy Inviolable</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Strictly zero prompt reading, zero conversation harvesting. Inspected and verified.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-[#090d14] p-5">
                <Zap className="h-5 w-5 text-emerald-400 mb-2" />
                <h3 className="font-bold text-white text-sm">Instant $2.00 Floor</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Cash out your wait-time earnings via UPI or PayPal as soon as you reach just $2.00.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-[#090d14] p-5">
                <Layers className="h-5 w-5 text-emerald-400 mb-2" />
                <h3 className="font-bold text-white text-sm">5 AI Platforms</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Works seamlessly on ChatGPT, Claude, Gemini, Perplexity, and DeepSeek.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
