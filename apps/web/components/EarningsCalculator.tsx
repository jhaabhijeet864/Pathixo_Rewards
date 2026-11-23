'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Zap, Minus, Plus, Clock, ArrowRight } from 'lucide-react';
import { DEFAULT_USD_INR_RATE } from '@pathixo/shared';

const PRESETS = [
  { label: 'Casual', value: 5 },
  { label: 'Light', value: 10 },
  { label: 'Regular', value: 25 },
  { label: 'Heavy', value: 50 },
  { label: 'Power', value: 100 },
];
const MIN_DAILY_PROMPTS = 5;
const MAX_DAILY_PROMPTS = 100;
const PROMPT_STEP = 1;

const USER_CREDIT_PER_PROMPT_USD = 0.0015; // $0.0015 USD avg (60% split on $2.50 blended CPM, dynamic per-ad auction)
const CASHOUT_FLOOR_USD = 2.0;

export function EarningsCalculator() {
  const [dailyPrompts, setDailyPrompts] = useState<number>(25);
  const [dailyPromptInput, setDailyPromptInput] = useState('25');
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');

  const monthlyPrompts = dailyPrompts * 30;
  const monthlyEarningsUsd = monthlyPrompts * USER_CREDIT_PER_PROMPT_USD;
  const dailyEarningsUsd = dailyPrompts * USER_CREDIT_PER_PROMPT_USD;
  const daysToFirstCashout = Math.max(1, Math.ceil(CASHOUT_FLOOR_USD / (dailyEarningsUsd || 0.001)));

  const inrRate = DEFAULT_USD_INR_RATE || 85.0;

  const formatMoney = (usdVal: number) => {
    if (currency === 'INR') {
      const inrVal = Math.round(usdVal * inrRate);
      return `₹${inrVal.toLocaleString('en-IN')}`;
    }
    return `$${usdVal.toFixed(2)}`;
  };

  const formatDaily = (usdVal: number) => {
    if (currency === 'INR') {
      const inrVal = usdVal * inrRate;
      return `₹${inrVal.toFixed(2)}`;
    }
    if (usdVal < 0.01) {
      return `$${usdVal.toFixed(3)}`;
    }
    return `$${usdVal.toFixed(2)}`;
  };

  const handleSliderChange = (val: number) => {
    if (!Number.isFinite(val)) return;
    const clamped = Math.max(MIN_DAILY_PROMPTS, Math.min(MAX_DAILY_PROMPTS, Math.round(val)));
    setDailyPrompts(clamped);
    setDailyPromptInput(String(clamped));
  };

  const sliderProgress = ((dailyPrompts - MIN_DAILY_PROMPTS) / (MAX_DAILY_PROMPTS - MIN_DAILY_PROMPTS)) * 100;

  return (
    <div className="w-full max-w-4xl lg:max-w-5xl mx-auto rounded-2xl border border-slate-800/80 bg-[#0a0f18] p-5 sm:p-8 lg:p-10 shadow-xl">
      <div className="grid gap-8 lg:gap-10 lg:grid-cols-12 items-center">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
              <Zap className="h-3.5 w-3.5" />
              <span>
                {currency === 'USD'
                  ? 'Transparent 60% User Split • Instant $2.00 Floor'
                  : 'Transparent 60% User Split • Instant ₹170 Floor'}
              </span>
            </div>
            <h3 className="mt-3.5 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Estimate your monthly payout
            </h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Earn real cash during everyday AI generation wait time. 60% of all ad revenue goes directly to your balance.
            </p>
          </div>

          {/* Slider & Controls Card */}
          <div className="space-y-4 rounded-2xl border border-slate-800 bg-[#0e1624] p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-200">Daily prompts sent</span>
              <label className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-1 font-mono text-sm font-bold text-emerald-400 focus-within:border-emerald-500">
                <input
                  type="text"
                  inputMode="numeric"
                  value={dailyPromptInput}
                  onChange={(event) => {
                    const raw = event.currentTarget.value;
                    setDailyPromptInput(raw);
                    if (!/^\d+$/.test(raw)) return;
                    const next = Number(raw);
                    if (next >= MIN_DAILY_PROMPTS && next <= MAX_DAILY_PROMPTS) setDailyPrompts(next);
                  }}
                  onBlur={() => {
                    const value = Number(dailyPromptInput);
                    if (Number.isFinite(value)) handleSliderChange(value);
                    else setDailyPromptInput(String(dailyPrompts));
                  }}
                  aria-label="Daily prompts sent"
                  aria-describedby="daily-prompts-range"
                  className="w-10 appearance-none bg-transparent text-right outline-none"
                />
                <span className="text-xs text-slate-400 font-sans font-normal">/ day</span>
              </label>
            </div>

            {/* Stepper + Slider */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSliderChange(dailyPrompts - 5)}
                disabled={dailyPrompts <= MIN_DAILY_PROMPTS}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Decrease prompts"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>

              <div className="relative flex-1 flex items-center">
                <input
                  type="range"
                  min={MIN_DAILY_PROMPTS}
                  max={MAX_DAILY_PROMPTS}
                  step={PROMPT_STEP}
                  value={dailyPrompts}
                  onChange={(e) => handleSliderChange(Number(e.target.value))}
                  style={{ background: `linear-gradient(to right, #10e599 ${sliderProgress}%, #1e293b ${sliderProgress}%)` }}
                  className="earnings-slider w-full cursor-pointer accent-emerald-500"
                  aria-label="Daily AI Prompts Slider"
                  aria-valuetext={`${dailyPrompts} prompts per day`}
                  id="daily-prompts-range"
                />
              </div>

              <button
                type="button"
                onClick={() => handleSliderChange(dailyPrompts + 5)}
                disabled={dailyPrompts >= MAX_DAILY_PROMPTS}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Increase prompts"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Clean 5-col presets */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {PRESETS.map((p) => {
                const isActive = dailyPrompts === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => handleSliderChange(p.value)}
                    className={`rounded-lg py-1.5 text-xs font-medium transition cursor-pointer text-center ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                        : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    {p.value}/d
                  </button>
                );
              })}
            </div>
          </div>

          {/* Simple Feature Callouts */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-slate-800/80 bg-[#0e1624]/70 px-3 py-2.5 flex items-center justify-center gap-2 text-center transition-colors hover:border-slate-700">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="font-semibold text-slate-100 text-xs sm:text-[13px] whitespace-nowrap">
                {currency === 'USD' ? '$2.00 Minimum' : '₹170 Minimum'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-[#0e1624]/70 px-3 py-2.5 flex items-center justify-center gap-2 text-center transition-colors hover:border-slate-700">
              <Clock className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="font-semibold text-slate-100 text-xs sm:text-[13px] whitespace-nowrap">
                4s View Time
              </span>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-[#0e1624]/70 px-3 py-2.5 flex items-center justify-center gap-2 text-center transition-colors hover:border-slate-700">
              <Zap className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="font-semibold text-slate-100 text-xs sm:text-[13px] whitespace-nowrap">
                10% Referral Bonus
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Clean & Direct Payout Card */}
        <div className="lg:col-span-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-[#0f1d2c] to-[#0a121c] p-6 sm:p-8 text-center shadow-xl relative overflow-hidden">
          {/* Subtle glow */}
          <div className="pointer-events-none absolute -top-10 -right-10 h-36 w-36 rounded-full bg-emerald-500/10 blur-2xl" />

          {/* Currency Switcher */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Estimated Payout
            </span>
            <div className="inline-flex rounded-lg border border-slate-700 bg-slate-900/90 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`rounded-md px-2.5 py-1 transition cursor-pointer ${
                  currency === 'USD' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('INR')}
                className={`rounded-md px-2.5 py-1 transition cursor-pointer ${
                  currency === 'INR' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                INR (₹)
              </button>
            </div>
          </div>

          {/* Big Amount */}
          <div className="py-6">
            <div className="text-5xl sm:text-6xl font-black tracking-tight text-white font-mono">
              <span aria-live="polite" aria-atomic="true">{formatMoney(monthlyEarningsUsd)}</span>
            </div>
            <div className="mt-1 text-sm font-medium text-emerald-400">
              per month in passive cash
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Based on ~$0.0015 avg reward (60% split on $2.50 blended CPM)
            </div>
          </div>

          {/* 3 Clean Spaced Metrics */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 space-y-2 text-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Daily average</span>
              <span className="font-mono font-bold text-emerald-400">+{formatDaily(dailyEarningsUsd)} / day</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-800/60 pt-2">
              <span className="text-slate-400">Minimum cashout</span>
              <span className="font-semibold text-white">
                {currency === 'USD' ? '$2.00 instant floor' : '₹170 instant floor'}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-800/60 pt-2">
              <span className="text-slate-400">First payout in</span>
              <span className="font-semibold text-white">~{daysToFirstCashout} days</span>
            </div>
          </div>

          {/* Direct CTA */}
          <Link
            href="/coming-soon"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-3.5 text-sm sm:text-base font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Start Earning Now — Free</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
