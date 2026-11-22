'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  ShieldCheck,
  CheckCircle2,
  Bell,
  Zap,
  Layers,
} from 'lucide-react';

export default function ComingSoonPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responseMsg, setResponseMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/preregister', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'coming_soon' }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        setResponseMsg(data.message);
        setSubmitted(true);
      } else {
        setErrorMsg(data.message || 'Something went wrong. Please check your email.');
      }
    } catch {
      setErrorMsg('Unable to reach server. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#070a0e] text-white selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center">
        {/* HERO & EMAIL PRE-REGISTRATION */}
        <section className="relative overflow-hidden py-24 sm:py-32 text-center px-4 sm:px-6 lg:px-8">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 h-72 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="mx-auto max-w-2xl relative z-10">
            {/* Main Headline */}
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl text-white">
              Official Launch <br />
              <span className="font-serif italic font-normal text-emerald-400">
                Coming Soon.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
              We are finalizing store approvals. Be the first to get access and unlock your wait-time earnings the moment we go live.
            </p>

            {/* TRUST HIGHLIGHTS */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left">
              <div className="rounded-2xl border border-slate-800/80 bg-[#090d14]/80 p-4">
                <ShieldCheck className="h-5 w-5 text-emerald-400 mb-2" />
                <h3 className="font-bold text-white text-xs sm:text-sm">Privacy Inviolable</h3>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1 leading-relaxed">
                  Strictly zero prompt reading and zero conversation harvesting.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-[#090d14]/80 p-4">
                <Zap className="h-5 w-5 text-emerald-400 mb-2" />
                <h3 className="font-bold text-white text-xs sm:text-sm">Instant $2.00 Floor</h3>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1 leading-relaxed">
                  Cash out wait-time earnings via UPI or PayPal as soon as you hit $2.00.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-[#090d14]/80 p-4">
                <Layers className="h-5 w-5 text-emerald-400 mb-2" />
                <h3 className="font-bold text-white text-xs sm:text-sm">5 AI Platforms</h3>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1 leading-relaxed">
                  Works on ChatGPT, Claude, Gemini, Perplexity, and DeepSeek.
                </p>
              </div>
            </div>

            {/* NOTIFY ME EMAIL FORM */}
            <div className="mt-10 max-w-md mx-auto">
              {submitted ? (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-5 text-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white">You&apos;re on the early access VIP list!</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {responseMsg || `We'll ping ${email} the moment we go live.`}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row gap-2.5">
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
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                      <Bell className="h-4 w-4" />
                      <span>{loading ? 'Saving...' : 'Notify Me'}</span>
                    </button>
                  </div>
                  {errorMsg && (
                    <p className="text-xs text-rose-400 text-left px-1 mt-1 font-medium">{errorMsg}</p>
                  )}
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
