'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Zap, Minus, Plus, ExternalLink, Clock, Lock } from 'lucide-react';
import { DEFAULT_USD_INR_RATE } from '@pathixo/shared';

// Directive-compliant reference matrix presets
const PRESETS = [
  { label: 'Casual', value: 5, note: '5/day' },
  { label: 'Light', value: 10, note: '10/day' },
  { label: 'Average Developer', value: 25, note: '25/day' },
  { label: 'Heavy', value: 50, note: '50/day' },
  { label: 'Power User / Coder', value: 100, note: '100/day' },
];

// Official Ads Division specs
const BLENDED_CPM_USD = 20.0;
const USER_SPLIT_PERCENT = 60; // 60% user / 40% platform
const USER_CREDIT_PER_PROMPT_USD = 0.012; // Exactly $0.0120 USD (₹1.02 INR)
const CASHOUT_FLOOR_USD = 2.0;

export function EarningsCalculator() {
  const [dailyPrompts, setDailyPrompts] = useState<number>(25);
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');

  // Official Earning Prediction Formula (Prompts/Day)
  // monthlyEarnings = (dailyPrompts * 30) * 0.012
  // daysToCashout = Math.ceil(2.0 / (dailyPrompts * 0.012))
  const monthlyPrompts = dailyPrompts * 30;
  const monthlyEarningsUsd = monthlyPrompts * USER_CREDIT_PER_PROMPT_USD;
  const dailyEarningsUsd = dailyPrompts * USER_CREDIT_PER_PROMPT_USD;
  const annualEarningsUsd = monthlyEarningsUsd * 12;
  const daysToFirstCashout = Math.max(1, Math.ceil(CASHOUT_FLOOR_USD / (dailyEarningsUsd || 0.001)));

  // Currency Parity: $1.00 USD = ₹85.00 INR standard parity
  const inrRate = DEFAULT_USD_INR_RATE || 85.0;

  const formatMoney = (usdVal: number) => {
    if (currency === 'INR') {
      const inrVal = Math.round(usdVal * inrRate);
      return `₹${inrVal.toLocaleString('en-IN')}`;
    }
    return `$${usdVal.toFixed(2)}`;
  };

  const handleSliderChange = (val: number) => {
    const clamped = Math.max(1, Math.min(150, val));
    setDailyPrompts(clamped);
  };

  return (
    <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl rounded-3xl border border-[#162534] bg-[#0c1219] p-6 sm:p-10 lg:p-14 shadow-2xl">
      <div className="grid gap-10 lg:gap-14 lg:grid-cols-12 items-start">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-[#072f20] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-[#10e599]">
              <Zap className="h-4 w-4" />
              Transparent 60 / 40 Split • $20.00 Standard Blended CPM
            </div>
            <h3 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Estimate your monthly payout
            </h3>
            <p className="mt-2.5 text-sm sm:text-base text-slate-400 leading-relaxed">
              Passive coffee cash ($5 – $35/mo) earned during your everyday AI coding workflow. Keep an industry-highest 60% of verified ad revenue.
            </p>
          </div>

          {/* Slider & Controls Card */}
          <div className="space-y-5 rounded-2xl border border-[#1b2b3c] bg-[#0f1722] p-5 sm:p-7 shadow-sm">
            {/* Header + Number Input */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm sm:text-base font-semibold text-slate-200">
                Daily AI prompts sent:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="150"
                  value={dailyPrompts}
                  onChange={(e) => handleSliderChange(Number(e.target.value))}
                  className="w-16 rounded-lg border border-[#233547] bg-[#141f2d] px-2 py-1 text-center font-mono text-base font-bold text-[#10e599] outline-none focus:border-[#10e599]"
                />
                <span className="text-sm font-bold text-slate-300">prompts / day</span>
              </div>
            </div>

            {/* Slider with [-] and [+] Stepper Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSliderChange(dailyPrompts - 5)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#233547] bg-[#141f2d] text-slate-300 transition hover:bg-[#1a293b] hover:text-white active:scale-95"
                title="Decrease 5 prompts"
                aria-label="Decrease prompts"
              >
                <Minus className="h-4 w-4" />
              </button>

              <div className="relative flex-1 flex items-center">
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={dailyPrompts}
                  onChange={(e) => handleSliderChange(Number(e.target.value))}
                  onInput={(e) => handleSliderChange(Number(e.currentTarget.value))}
                  className="earnings-slider w-full"
                  aria-label="Daily AI Prompts Slider"
                />
              </div>

              <button
                type="button"
                onClick={() => handleSliderChange(dailyPrompts + 5)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#233547] bg-[#141f2d] text-slate-300 transition hover:bg-[#1a293b] hover:text-white active:scale-95"
                title="Increase 5 prompts"
                aria-label="Increase prompts"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Clickable Presets matching Official Reference Matrix */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
              {PRESETS.map((p) => {
                const isActive = dailyPrompts === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => handleSliderChange(p.value)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#10e599] text-[#05281a] shadow-sm font-bold scale-105'
                        : 'bg-[#141f2d] text-slate-400 hover:bg-[#1b2b3d] hover:text-slate-200 border border-[#213244]'
                    }`}
                  >
                    {p.label} ({p.note})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Strict Verification & Privacy Callouts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="rounded-2xl border border-[#1b2b3c] bg-[#0f1722] p-4 space-y-1">
              <div className="flex items-center gap-2 text-white font-bold">
                <ShieldCheck className="h-4 w-4 text-[#10e599] shrink-0" />
                <span>Instant $2.00 Floor (₹170)</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-xs">
                Withdraw anytime via instant UPI in India or PayPal globally with no 30-day holds.
              </p>
            </div>

            <div className="rounded-2xl border border-[#1b2b3c] bg-[#0f1722] p-4 space-y-1">
              <div className="flex items-center gap-2 text-white font-bold">
                <Clock className="h-4 w-4 text-[#10e599] shrink-0" />
                <span>4-Second Dwell Verification</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-xs">
                Qualified views require continuous active dwell while AI generates. Zero prompt reading.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Earning Output Card */}
        <div className="lg:col-span-5 rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#111e2b] to-[#0c141e] p-6 sm:p-10 text-center shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />

          {/* Currency Toggle */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Estimated Monthly Earnings
            </span>
            <div className="flex items-center rounded-lg border border-[#223547] bg-[#141f2d] p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`rounded px-2.5 py-0.5 transition ${
                  currency === 'USD' ? 'bg-[#10e599] text-[#05281a]' : 'text-slate-400 hover:text-white'
                }`}
              >
                $ USD
              </button>
              <button
                type="button"
                onClick={() => setCurrency('INR')}
                className={`rounded px-2.5 py-0.5 transition ${
                  currency === 'INR' ? 'bg-[#10e599] text-[#05281a]' : 'text-slate-400 hover:text-white'
                }`}
              >
                ₹ INR
              </button>
            </div>
          </div>

          {/* Primary Calculated Earnings Amount */}
          <div className="mt-2 text-5xl sm:text-6xl font-black tracking-tight text-white font-mono">
            {formatMoney(monthlyEarningsUsd)}
          </div>
          <span className="mt-2 block text-xs sm:text-sm font-medium text-slate-400">
            per month in passive cash
          </span>

          {/* Official Reference Metrics Table */}
          <div className="mt-6 border-t border-slate-800/80 pt-5 space-y-3 text-xs sm:text-sm text-slate-300 text-left">
            <div className="flex justify-between py-0.5 border-b border-slate-800/40 pb-2">
              <span className="text-slate-400">Monthly Prompts:</span>
              <span className="font-mono font-bold text-white">{monthlyPrompts.toLocaleString()} prompts</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-800/40 pb-2">
              <span className="text-slate-400">Daily Average:</span>
              <span className="font-mono font-bold text-[#10e599]">+{formatMoney(dailyEarningsUsd)} / day</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-800/40 pb-2">
              <span className="text-slate-400">Your Share:</span>
              <span className="font-bold text-white">60% (${USER_CREDIT_PER_PROMPT_USD.toFixed(4)} / prompt)</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-800/40 pb-2">
              <span className="text-slate-400">Minimum Payout:</span>
              <span className="font-bold text-white">{formatMoney(CASHOUT_FLOOR_USD)} floor (vs Chatwait $10, uwait €10)</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Time to First Cashout:</span>
              <span className="font-bold text-[#10e599]">~{daysToFirstCashout} days</span>
            </div>
          </div>

          {/* Direct Advertiser Link */}
          <div className="mt-6 rounded-xl border border-[#1b2b3c] bg-[#0c141e] p-3 text-left">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Advertiser Zero-Debt Plans</span>
              <Link
                href="/advertise"
                className="text-[#10e599] hover:underline flex items-center gap-1 font-semibold normal-case"
              >
                Campaigns <ExternalLink className="h-2.5 w-2.5" />
              </Link>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Prepaid self-serve tiers: $5 (Micro-Test), $15 (Starter), $50 (Growth), and $150 (Scale).
            </p>
          </div>

          {/* CTA Action */}
          <a
            href="https://github.com/jhaabhijeet864/Pathixo_Rewards"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#10b981] py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-[#0ea371] hover:-translate-y-0.5"
          >
            Start Earning Now — Free
          </a>
        </div>
      </div>
    </div>
  );
}