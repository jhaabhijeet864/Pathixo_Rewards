'use client';

import { useState } from 'react';
import { ShieldCheck, Zap, Minus, Plus, Clock, ArrowRight } from 'lucide-react';
import { DEFAULT_USD_INR_RATE } from '@pathixo/shared';

const PRESETS = [
  { label: 'Casual', value: 5 },
  { label: 'Light', value: 10 },
  { label: 'Regular', value: 25 },
  { label: 'Heavy', value: 50 },
  { label: 'Power', value: 100 },
];

const USER_CREDIT_PER_PROMPT_USD = 0.012; // $0.0120 USD (60% split on $20 CPM)
const CASHOUT_FLOOR_USD = 2.0;

export function EarningsCalculator() {
  const [dailyPrompts, setDailyPrompts] = useState<number>(25);
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

  const handleSliderChange = (val: number) => {
    const clamped = Math.max(1, Math.min(150, val));
    setDailyPrompts(clamped);
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl border border-slate-800/80 bg-[#0a0f18] p-6 sm:p-10 lg:p-12 shadow-2xl">
      <div className="grid gap-8 lg:gap-12 lg:grid-cols-12 items-center">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
              <Zap className="h-3.5 w-3.5" />
              <span>Transparent 60% User Split • Instant $2.00 Floor</span>
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
              <div className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-1 font-mono text-sm font-bold text-emerald-400">
                <span>{dailyPrompts}</span>
                <span className="text-xs text-slate-400 font-sans font-normal">/ day</span>
              </div>
            </div>

            {/* Stepper + Slider */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSliderChange(dailyPrompts - 5)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white active:scale-95 cursor-pointer"
                aria-label="Decrease prompts"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>

              <div className="relative flex-1 flex items-center">
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={dailyPrompts}
                  onChange={(e) => handleSliderChange(Number(e.target.value))}
                  className="earnings-slider w-full cursor-pointer accent-emerald-500"
                  aria-label="Daily AI Prompts Slider"
                />
              </div>

              <button
                type="button"
                onClick={() => handleSliderChange(dailyPrompts + 5)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white active:scale-95 cursor-pointer"
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
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-800/70 bg-[#0e1624]/60 p-3 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">$2.00 Instant Floor</strong>
                <span className="text-slate-400 text-[11px]">Withdraw via UPI (India) or PayPal globally.</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800/70 bg-[#0e1624]/60 p-3 flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">4s Active Dwell</strong>
                <span className="text-slate-400 text-[11px]">Zero prompt reading. Tab must be active.</span>
              </div>
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
              {formatMoney(monthlyEarningsUsd)}
            </div>
            <div className="mt-1 text-sm font-medium text-emerald-400">
              per month in passive cash
            </div>
          </div>

          {/* 3 Clean Spaced Metrics */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 space-y-2 text-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Daily average</span>
              <span className="font-mono font-bold text-emerald-400">+{formatMoney(dailyEarningsUsd)} / day</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-800/60 pt-2">
              <span className="text-slate-400">Minimum cashout</span>
              <span className="font-semibold text-white">{formatMoney(CASHOUT_FLOOR_USD)} instant floor</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-800/60 pt-2">
              <span className="text-slate-400">First payout in</span>
              <span className="font-semibold text-white">~{daysToFirstCashout} days</span>
            </div>
          </div>

          {/* Direct CTA */}
          <a
            href="https://github.com/jhaabhijeet864/Pathixo_Rewards"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-3.5 text-sm sm:text-base font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Start Earning Now — Free</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
