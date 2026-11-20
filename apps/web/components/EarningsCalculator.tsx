'use client';

import { useState } from 'react';
import { DollarSign, ShieldCheck, Zap } from 'lucide-react';

export function EarningsCalculator() {
  const [dailyPrompts, setDailyPrompts] = useState(25);

  // Math: 60% user share of a blended $20 CPM = $12 CPM ($0.012 per qualified prompt)
  const monthlyPrompts = dailyPrompts * 30;
  const userPerPrompt = 0.012;
  const estimatedMonthly = (monthlyPrompts * userPerPrompt).toFixed(2);
  const daysToFirstCashout = Math.max(1, Math.ceil(2.0 / (dailyPrompts * userPerPrompt)));

  return (
    <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-slate-50/60 p-8 sm:p-10">
      <div className="grid gap-8 md:grid-cols-2 items-center">
        {/* Slider Section */}
        <div className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              <Zap className="h-3.5 w-3.5 text-emerald-600" />
              Transparent 60 / 40 Split
            </div>
            <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              Estimate your monthly payout
            </h3>
            <p className="mt-1.5 text-sm text-slate-600">
              You keep 60% of all ad revenue generated during your wait time. No tokens, no coupons — real dollars.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm font-semibold text-slate-700">
              <span>Daily AI prompts sent:</span>
              <span className="text-emerald-700 font-bold text-base">{dailyPrompts} prompts / day</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={dailyPrompts}
              onChange={(e) => setDailyPrompts(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>Casual (5/day)</span>
              <span>Average (25/day)</span>
              <span>Power User (100/day)</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 text-slate-800 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Fastest cashout in the industry: $2 floor</span>
            </div>
            <p className="text-slate-500">
              At your current pace, you hit your first $2 cashout in approximately{' '}
              <strong className="text-slate-900">{daysToFirstCashout} days</strong>. Withdraw instantly via UPI, PayPal, or Gift Cards.
            </p>
          </div>
        </div>

        {/* Output Card */}
        <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-lg shadow-emerald-500/5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Estimated Monthly Earnings</span>
          <div className="mt-2 text-5xl font-extrabold tracking-tight text-slate-900">
            ${estimatedMonthly}
          </div>
          <span className="mt-1 block text-xs text-slate-400">per month in passive cash</span>

          <div className="mt-6 border-t border-slate-100 pt-6 space-y-3 text-xs text-slate-600 text-left">
            <div className="flex justify-between">
              <span>Monthly Prompts:</span>
              <span className="font-semibold text-slate-900">{monthlyPrompts} prompts</span>
            </div>
            <div className="flex justify-between">
              <span>Your Share:</span>
              <span className="font-semibold text-emerald-700">60% (Highest among all competitors)</span>
            </div>
            <div className="flex justify-between">
              <span>Minimum Payout:</span>
              <span className="font-semibold text-slate-900">$2.00 (vs Chatwait $10, uwait €10)</span>
            </div>
          </div>

          <a
            href="https://github.com/jhaabhijeet864/Pathixo_Rewards"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Start Earning Now — Free
          </a>
        </div>
      </div>
    </div>
  );
}
