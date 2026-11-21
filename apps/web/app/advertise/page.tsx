'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Lock,
} from 'lucide-react';
import { ChatGptIcon, ClaudeIcon, GeminiIcon } from '@/components/HeroChatMockup';
import {
  Currency,
  SupportedPlatform,
  DEFAULT_USD_INR_RATE,
  PRICING_TIERS,
} from '@pathixo/shared';

export default function AdvertisePage() {
  const [headline, setHeadline] = useState('Build software 10x faster with Cursor — The AI Code Editor.');
  const [sponsorName, setSponsorName] = useState('Cursor');
  const [targetUrl, setTargetUrl] = useState('https://cursor.com');
  const iconUrl = '';
  const [badge, setBadge] = useState('Developer Tool');
  const [cpm, setCpm] = useState(20);
  const [email, setEmail] = useState('');

  // Currency & Tier selection
  const [currency, setCurrency] = useState<Currency>('USD');
  const [selectedTierId, setSelectedTierId] = useState<string>('tier_growth');
  const [customAmount, setCustomAmount] = useState<string>('75');

  // Multi-chatbot preview tab
  const [previewPlatform, setPreviewPlatform] = useState<SupportedPlatform>('gemini');

  // Submission state
  const [createdCampaign, setCreatedCampaign] = useState<{ id: string; budget_total_usd: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute budget
  const selectedTier = PRICING_TIERS.find((t) => t.id === selectedTierId);
  const budgetInSelectedCurrency =
    selectedTierId === 'custom'
      ? Number(customAmount) || (currency === 'USD' ? 5 : 425)
      : currency === 'USD'
      ? selectedTier?.price_usd ?? 50
      : selectedTier?.price_inr ?? 4250;

  const budgetInUsd =
    currency === 'USD'
      ? budgetInSelectedCurrency
      : Number((budgetInSelectedCurrency / DEFAULT_USD_INR_RATE).toFixed(2));

  const estimatedImpressions = Math.max(10, Math.round((budgetInUsd / cpm) * 1000));

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
          badge,
          currency,
          cpm_rate_usd: cpm,
          budget_usd: currency === 'USD' ? budgetInSelectedCurrency : undefined,
          budget_inr: currency === 'INR' ? budgetInSelectedCurrency : undefined,
          target_platforms: ['chatgpt', 'claude', 'gemini', 'perplexity', 'deepseek'],
          status: 'pending_review',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedCampaign(data.campaign);
        // Automatically unlock and navigate to campaign management page
        if (data.campaign?.id) {
          window.location.href = `/advertise/manage?id=${encodeURIComponent(data.campaign.id)}`;
        }
      }
    } catch (err) {
      console.error('Failed to submit campaign:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] text-slate-900 isolate">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16 bg-[#f8fafc]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800 mb-3">
              <Zap className="h-3.5 w-3.5" />
              <span>Self-Serve In-Stream Ad Engine</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              One Line. Peak Focus.
            </h1>
            <p className="mt-3 text-base text-slate-600 sm:text-lg">
              Place your developer tool or AI SaaS directly inside <strong>ChatGPT</strong>, <strong>Claude</strong>, and <strong>Gemini</strong> during the response wait time. Pay only for verified 4s+ active dwell views.
            </p>
          </div>

          {/* Builder & Live Preview Grid */}
          <div className="mt-12 grid gap-10 lg:grid-cols-12 items-start">
            {/* Form Section */}
            <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Campaign Builder</h2>
                  <p className="text-xs text-slate-500">Setup your ad creative and prepaid budget</p>
                </div>

                {/* Currency Switcher */}
                <div className="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`rounded-md px-2.5 py-1 transition ${
                      currency === 'USD'
                        ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    USD ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('INR')}
                    className={`rounded-md px-2.5 py-1 transition ${
                      currency === 'INR'
                        ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    INR (₹)
                  </button>
                </div>
              </div>

              {createdCampaign ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-6 text-center space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Campaign Live & Funded!</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Campaign ID: <strong className="font-mono text-emerald-800">{createdCampaign.id}</strong>
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Prepaid budget of <strong>{currency === 'USD' ? `$${createdCampaign.budget_total_usd}` : `₹${Math.round(createdCampaign.budget_total_usd * DEFAULT_USD_INR_RATE)}`}</strong> is now active in rotation across ChatGPT, Claude, and Gemini.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                    <Link
                      href={`/advertise/manage?id=${createdCampaign.id}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                    >
                      Open Advertiser Control Panel
                    </Link>
                    <button
                      type="button"
                      onClick={() => setCreatedCampaign(null)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Create Another Ad
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Work Email</label>
                    <input
                      type="email"
                      required
                      placeholder="founder@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Brand / Product</label>
                      <input
                        type="text"
                        required
                        placeholder="Cursor, v0, Resend..."
                        value={sponsorName}
                        onChange={(e) => setSponsorName(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Promo Badge</label>
                      <input
                        type="text"
                        placeholder="e.g. Developer Tool, 20% OFF"
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-semibold text-slate-700">Headline Text</label>
                      <span className="text-[10px] text-slate-400">{headline.length}/70 chars</span>
                    </div>
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
                      placeholder="https://yourproduct.com/signup?ref=ad"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Select Prepaid Plan Tier
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PRICING_TIERS.map((tier) => {
                        const isSelected = selectedTierId === tier.id;
                        const price = currency === 'USD' ? `$${tier.price_usd}` : `₹${tier.price_inr}`;
                        return (
                          <button
                            key={tier.id}
                            type="button"
                            onClick={() => setSelectedTierId(tier.id)}
                            className={`relative rounded-xl p-2.5 text-center transition border ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {tier.popular && (
                              <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold uppercase text-white shadow-xs">
                                Popular
                              </span>
                            )}
                            <div className="text-[11px] font-medium text-slate-500">{tier.name}</div>
                            <div className="text-sm font-bold text-slate-900 mt-0.5">{price}</div>
                            <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                              ~{tier.estimated_impressions} views
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom input toggle */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTierId('custom')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${
                          selectedTierId === 'custom'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Custom Amount
                      </button>
                      {selectedTierId === 'custom' && (
                        <div className="flex-1 flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs">
                          <span className="font-bold text-slate-500 mr-1">
                            {currency === 'USD' ? '$' : '₹'}
                          </span>
                          <input
                            type="number"
                            min={currency === 'USD' ? 5 : 400}
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            placeholder={currency === 'USD' ? 'Min 5' : 'Min 400'}
                            className="w-full bg-transparent text-slate-900 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CPM Bidding Priority Selector */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        CPM Bid Priority: <strong className="text-emerald-700">${cpm}.00 / 1k</strong>
                      </label>
                      <span className="text-[11px] text-slate-500">Higher bid = faster delivery</span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={40}
                      step={5}
                      value={cpm}
                      onChange={(e) => setCpm(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>$15 (Standard)</span>
                      <span>$25 (Accelerated)</span>
                      <span>$40 (Priority)</span>
                    </div>
                  </div>

                  {/* Metrics Estimation Bar */}
                  <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/60 p-3 text-xs text-slate-700 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-slate-600">Estimated Verified Views:</div>
                      <div className="text-[11px] text-slate-500">Only debited after 4s+ continuous dwell</div>
                    </div>
                    <strong className="text-emerald-800 text-base font-extrabold">
                      {estimatedImpressions.toLocaleString()} views
                    </strong>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="h-4 w-4" />
                    <span>
                      {isSubmitting
                        ? 'Funding Campaign...'
                        : `Fund Campaign (${currency === 'USD' ? `$${budgetInSelectedCurrency}` : `₹${budgetInSelectedCurrency}`})`}
                    </span>
                  </button>
                  <p className="text-[11px] text-center text-slate-400">
                    Safe zero-debt prepaid model • Instant campaign live activation
                  </p>
                </form>
              )}
            </div>

            {/* Live Interactive Multi-Chatbot Preview Section */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Live Chatbot Ad Previewer
                  </span>
                  <div className="text-[11px] text-emerald-700 font-medium">
                    See exactly how your ad renders on each AI platform
                  </div>
                </div>

                {/* Chatbot Switcher Tabs */}
                <div className="flex items-center rounded-lg bg-white border border-slate-200 p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setPreviewPlatform('chatgpt')}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                      previewPlatform === 'chatgpt'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ChatGptIcon className="h-3.5 w-3.5" />
                    <span>ChatGPT</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewPlatform('claude')}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                      previewPlatform === 'claude'
                        ? 'bg-[#D97757] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ClaudeIcon className="h-3.5 w-3.5" />
                    <span>Claude</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewPlatform('gemini')}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                      previewPlatform === 'gemini'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <GeminiIcon className="h-3.5 w-3.5" />
                    <span>Gemini</span>
                  </button>
                </div>
              </div>

              {/* The Styled Chat Frame based on Selected Platform */}
              <div
                className={`overflow-hidden rounded-2xl border shadow-sm transition-all ${
                  previewPlatform === 'chatgpt'
                    ? 'border-slate-800 bg-[#212121] text-slate-100'
                    : previewPlatform === 'claude'
                    ? 'border-[#E8DFD5] bg-[#FAF8F5] text-slate-900'
                    : 'border-blue-100 bg-white text-slate-900'
                }`}
              >
                {/* Chat Frame Top Bar */}
                <div
                  className={`flex items-center justify-between border-b px-4 py-2.5 text-xs font-mono ${
                    previewPlatform === 'chatgpt'
                      ? 'border-slate-800 bg-slate-900/60 text-slate-400'
                      : previewPlatform === 'claude'
                      ? 'border-[#E8DFD5] bg-[#F3EDE2] text-amber-900/70'
                      : 'border-slate-100 bg-slate-50 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/80"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80"></span>
                    <span className="ml-2 font-medium capitalize">
                      {previewPlatform === 'chatgpt'
                        ? 'ChatGPT (GPT-4o Stream)'
                        : previewPlatform === 'claude'
                        ? 'Claude 3.5 Sonnet'
                        : 'Google Gemini 4 Argon'}
                    </span>
                  </div>
                </div>

                {/* Conversation Body */}
                <div className="p-5 space-y-4">
                  {/* User Turn */}
                  <div className="flex justify-end">
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-xs max-w-sm ${
                        previewPlatform === 'chatgpt'
                          ? 'bg-[#303030] text-slate-100'
                          : previewPlatform === 'claude'
                          ? 'bg-[#ECE5D8] text-slate-800'
                          : 'bg-blue-50 text-slate-800 border border-blue-100'
                      }`}
                    >
                      {previewPlatform === 'chatgpt'
                        ? 'How do I scale my backend to handle 50,000 concurrent WebSocket connections?'
                        : previewPlatform === 'claude'
                        ? 'Explain the architectural tradeoffs between micro-frontends and modular monoliths.'
                        : 'Write a Python FastAPI service with streaming server-sent events for AI responses.'}
                    </div>
                  </div>

                  {/* Inline Sponsored Ad Card */}
                  <div
                    className={`rounded-xl border p-3.5 text-xs shadow-xs transition-all ${
                      previewPlatform === 'chatgpt'
                        ? 'border-slate-700 bg-[#2A2A2A] text-slate-100'
                        : previewPlatform === 'claude'
                        ? 'border-[#D9CEBF] bg-[#F7F3EC] text-slate-800'
                        : 'border-blue-200/80 bg-blue-50/50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Avatar */}
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-600 font-bold text-white text-xs shadow-xs">
                          {(sponsorName || 'P').charAt(0).toUpperCase()}
                        </span>

                        {badge && (
                          <span className="rounded bg-emerald-100/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 shrink-0">
                            {badge}
                          </span>
                        )}

                        <span className="truncate font-semibold text-emerald-600 hover:underline">
                          {headline || 'Your Headline Here...'}
                        </span>

                        <span className="text-slate-400 text-[11px] shrink-0 hidden sm:inline">
                          • sponsored via Pathixo
                        </span>
                      </div>
                      <span className="text-slate-400 text-xs hover:text-slate-200 cursor-pointer">×</span>
                    </div>
                  </div>

                  {/* AI Response Stream Simulator */}
                  <div className="flex items-center gap-2 text-xs opacity-75">
                    <Sparkles
                      className={`h-3.5 w-3.5 animate-spin ${
                        previewPlatform === 'chatgpt'
                          ? 'text-emerald-400'
                          : previewPlatform === 'claude'
                          ? 'text-[#D97757]'
                          : 'text-blue-500'
                      }`}
                    />
                    <span className="font-mono">
                      {previewPlatform === 'chatgpt'
                        ? 'ChatGPT is generating answer...'
                        : previewPlatform === 'claude'
                        ? 'Claude is thinking...'
                        : 'Gemini is answering...'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 text-xs text-slate-600 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>The 4-Second Verified Attention Guarantee</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Accidental scrolls or backgrounded tabs are discarded immediately. An impression is only debited from your prepaid budget after the active AI window has streamed for at least 4 continuous seconds.
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-emerald-700 font-semibold border-t border-slate-100">
                  <span>✓ Verified 4s+ Active Dwell</span>
                  <span>✓ Zero Host CSS Conflicts</span>
                  <span>✓ Real-time Pacing</span>
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
