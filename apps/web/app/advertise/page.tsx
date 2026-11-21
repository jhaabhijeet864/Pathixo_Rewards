'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Target, BarChart3 } from 'lucide-react';

export default function AdvertisePage() {
  const [headline, setHeadline] = useState('Build software 10x faster with Cursor — The AI Code Editor.');
  const [sponsorName, setSponsorName] = useState('Cursor');
  const [targetUrl, setTargetUrl] = useState('https://cursor.com');
  const [iconUrl, setIconUrl] = useState('');
  const [badge, setBadge] = useState('Developer Tool');
  const [cpm, setCpm] = useState(20);
  const [budget, setBudget] = useState(100);
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const estimatedImpressions = Math.round((budget / cpm) * 1000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advertiser_email: email,
          headline,
          sponsor_name: sponsorName,
          target_url: targetUrl,
          icon_url: iconUrl || undefined,
          cpm_rate_usd: cpm,
          budget_usd: budget,
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Self-Serve Advertiser Space</span>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              One line. Peak focus.
            </h1>
            <p className="mt-3 text-base text-slate-600">
              Put your product directly in front of active developers and AI power users at the exact moment of anticipation. From $15 per 1,000 verified impressions.
            </p>
          </div>

          {/* Builder & Live Preview Grid */}
          <div className="mt-14 grid gap-10 lg:grid-cols-12 items-start">
            {/* Form Section */}
            <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-5">Create your campaign</h2>

              {isSuccess ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-900">Campaign Submitted!</h3>
                  <p className="text-sm text-slate-600">
                    We received your campaign for <strong>{sponsorName}</strong>. A Stripe payment invoice for ${budget} has been sent to <strong>{email}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSuccess(false)}
                    className="mt-3 inline-flex text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Create another ad campaign
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Your Work Email</label>
                    <input
                      type="email"
                      required
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Sponsor / Brand Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Cursor, Notion, Vercel..."
                      value={sponsorName}
                      onChange={(e) => setSponsorName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Headline Text (Max 70 chars)</label>
                    <input
                      type="text"
                      required
                      maxLength={70}
                      placeholder="Build software 10x faster with Cursor..."
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Destination URL</label>
                    <input
                      type="url"
                      required
                      placeholder="https://yourwebsite.com/signup"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Promo Badge</label>
                      <input
                        type="text"
                        placeholder="e.g. 20% OFF"
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">CPM Bid ($)</label>
                      <input
                        type="number"
                        min="15"
                        max="50"
                        value={cpm}
                        onChange={(e) => setCpm(Number(e.target.value))}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Prepay Budget Tier</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[50, 100, 250, 500].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setBudget(amt)}
                          className={`rounded-lg py-2 text-xs font-semibold transition border ${
                            budget === amt
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg bg-emerald-50/60 border border-emerald-200/60 p-3 text-xs text-slate-700 flex justify-between items-center">
                    <span>Estimated Verified Views:</span>
                    <strong className="text-emerald-800 text-sm">{estimatedImpressions.toLocaleString()} impressions</strong>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Processing...' : `Fund Campaign ($${budget})`}
                  </button>
                </form>
              )}
            </div>

            {/* Live Interactive Preview Section */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Live Interactive Ad Preview
                </span>
                <span className="text-xs text-emerald-600 font-medium">Updates in real time</span>
              </div>

              {/* Mock Chat Frame */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-400 font-mono">
                  <span className="h-2 w-2 rounded-full bg-slate-300"></span>
                  <span className="h-2 w-2 rounded-full bg-slate-300"></span>
                  <span className="h-2 w-2 rounded-full bg-slate-300"></span>
                  <span className="ml-2">Live AI In-Stream Placement</span>
                </div>

                <div className="p-5 space-y-4">
                  {/* User Question */}
                  <div className="flex justify-end">
                    <div className="rounded-xl bg-slate-100 px-3.5 py-2 text-xs text-slate-700 max-w-xs">
                      How can I scale my SaaS backend to handle 50,000 concurrent requests?
                    </div>
                  </div>

                  {/* THE LIVE AD CARD */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-600 font-bold text-white text-[10px]">
                          {(sponsorName || 'P').charAt(0).toUpperCase()}
                        </span>
                        {badge && (
                          <span className="rounded bg-emerald-100/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-800 shrink-0">
                            {badge}
                          </span>
                        )}
                        <span className="truncate font-medium text-sky-600">
                          {headline || 'Your Headline Here...'}
                        </span>
                        <span className="text-slate-400 text-[11px] shrink-0">
                          • via Pathixo Rewards ({sponsorName || 'Brand'})
                        </span>
                      </div>
                      <span className="text-slate-400 text-xs">×</span>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Sparkles className="h-3 w-3 text-sky-500 animate-spin" />
                    <span>AI Model generating answer...</span>
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Only 100% verified impressions are billed</span>
                </div>
                <p>
                  You are never billed for accidental scrolls or immediate tab switches. We require a minimum of 4 seconds of continuous, active window visibility before an impression is debited from your balance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
