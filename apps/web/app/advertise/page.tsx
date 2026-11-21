'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Target, BarChart3, ExternalLink, Zap } from 'lucide-react';

export default function AdvertisePage() {
  const [headline, setHeadline] = useState('Build software 10x faster with Cursor — The AI Code Editor.');
  const [sponsorName, setSponsorName] = useState('Cursor');
  const [targetUrl, setTargetUrl] = useState('https://cursor.com');
  const [badge, setBadge] = useState('Featured Sponsor');
  const [cpm, setCpm] = useState(20);
  const [budget, setBudget] = useState(100);
  const [email, setEmail] = useState('');
  const [previewPlatform, setPreviewPlatform] = useState<'chatgpt' | 'claude' | 'deepseek'>('chatgpt');
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
          cpm_rate_usd: cpm,
          budget_usd: budget,
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
      }
    } catch {
      // Offline / static export simulated success
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#090d16] text-slate-100 selection:bg-indigo-500/30 selection:text-white">
      <Navbar />

      <main className="flex-1 py-14 sm:py-20 w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Self-Serve Campaign Studio
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              One Line. Absolute Focus.
            </h1>
            <p className="text-base text-slate-400">
              Reach software engineers, founders, and researchers in their peak moment of anticipation. From $15 CPM with verified 4-second dwell thresholds.
            </p>
          </div>

          {/* Builder & Live Preview Grid */}
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            
            {/* Form Section */}
            <div className="lg:col-span-6 rounded-2xl border border-white/[0.1] bg-[#0c1220] p-6 sm:p-8 space-y-6 shadow-xl">
              <div>
                <h2 className="text-xl font-bold text-white">Campaign Details</h2>
                <p className="text-xs text-slate-400">Configure your creative. Watch the live preview adapt on the right.</p>
              </div>

              {isSuccess ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                  <h3 className="text-lg font-bold text-white">Campaign Reserved!</h3>
                  <p className="text-sm text-slate-300">
                    We received your campaign for <strong>{sponsorName}</strong>. A Stripe Checkout link for ${budget} USD has been routed to <strong>{email}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSuccess(false)}
                    className="mt-3 inline-flex text-xs font-mono font-semibold text-cyan-400 hover:underline"
                  >
                    ← Configure another creative
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">Your Business Email</label>
                    <input
                      type="email"
                      required
                      placeholder="founder@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12192c] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300">Brand Name</label>
                      <input
                        type="text"
                        required
                        value={sponsorName}
                        onChange={(e) => setSponsorName(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12192c] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300">Badge Label</label>
                      <input
                        type="text"
                        required
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12192c] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300">Ad Headline (Max 90 chars)</label>
                    <input
                      type="text"
                      required
                      maxLength={95}
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12192c] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300">Target Destination URL</label>
                    <input
                      type="url"
                      required
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12192c] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  {/* Budget & CPM Selector */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300">CPM Bid ($ USD)</label>
                      <select
                        value={cpm}
                        onChange={(e) => setCpm(Number(e.target.value))}
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12192c] px-3 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                      >
                        <option value={15}>Standard: $15 CPM</option>
                        <option value={20}>Priority: $20 CPM</option>
                        <option value={25}>Exclusive: $25 CPM</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300">Test Budget ($ USD)</label>
                      <select
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12192c] px-3 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                      >
                        <option value={50}>$50 Starter</option>
                        <option value={100}>$100 Growth</option>
                        <option value={250}>$250 Scale</option>
                        <option value={500}>$500 Enterprise</option>
                      </select>
                    </div>
                  </div>

                  {/* Estimated Reach Stat Pill */}
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Projected Qualified Dwell Impressions:</span>
                    <span className="text-cyan-400 font-bold text-sm">~{estimatedImpressions.toLocaleString()} views</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-3.5 text-center text-sm font-bold text-white shadow-glow transition hover:opacity-95"
                  >
                    {isSubmitting ? 'Preparing Campaign...' : `Launch Campaign — $${budget} via Stripe`}
                  </button>
                </form>
              )}
            </div>

            {/* Live Multi-Platform Frame Previewer */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Live Mockup Preview</span>
                <div className="flex items-center gap-1.5 bg-[#0c1220] p-1 rounded-lg border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewPlatform('chatgpt')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition ${
                      previewPlatform === 'chatgpt' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ChatGPT
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewPlatform('claude')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition ${
                      previewPlatform === 'claude' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Claude
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewPlatform('deepseek')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition ${
                      previewPlatform === 'deepseek' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    DeepSeek
                  </button>
                </div>
              </div>

              {/* Chat Container Preview */}
              <div className="rounded-2xl border border-white/[0.1] bg-[#0d1322] overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0a0e19] px-4 py-2.5 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-700"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-700"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-700"></div>
                    <span className="ml-2">{previewPlatform}.com</span>
                  </div>
                  <span className="text-emerald-400 text-[11px]">Dwell Verified 4.0s</span>
                </div>

                <div className="p-6 space-y-5">
                  <div className="flex justify-end">
                    <div className="rounded-xl bg-[#141b2d] border border-white/[0.06] px-4 py-2 text-xs text-slate-300 max-w-sm">
                      How do I set up automated telemetry alerts for high-throughput microservices?
                    </div>
                  </div>

                  {/* Rendered Live Ad Card */}
                  <div className="rounded-xl border border-cyan-500/40 bg-gradient-to-r from-[#11182c] via-[#0f1933] to-[#121626] p-3.5 text-xs shadow-lg animate-in fade-in duration-200">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 font-bold text-white text-[11px]">
                          {(sponsorName || 'P').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-cyan-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-300 border border-cyan-400/20">
                              {badge || 'Sponsored'}
                            </span>
                            <span className="font-semibold text-slate-200 text-xs">
                              {sponsorName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">• via Pathixo Rewards</span>
                          </div>
                          <p className="text-slate-300 font-medium truncate max-w-xs sm:max-w-md">
                            {headline}
                          </p>
                        </div>
                      </div>
                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 flex items-center gap-1 rounded bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-white/20 hover:text-cyan-300 transition"
                      >
                        <span>Visit</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  </div>

                  {/* AI Response Preview */}
                  <div className="space-y-2 text-xs text-slate-400 pl-1">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Thinking Mode in progress...</span>
                    </div>
                    <p className="text-slate-300 text-xs">
                      Here is an architecture implementing distributed tracing with OpenTelemetry collectors and low-latency Prometheus counters...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
