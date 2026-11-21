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
    <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl rounded-3xl border border-slate-200 bg-slate-50/70 p-8 sm:p-12 lg:p-16 shadow-sm">
      <div className="grid gap-10 lg:gap-16 lg:grid-cols-12 items-center">
        {/* Slider Section */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-emerald-800">
              <Zap className="h-4 w-4 text-emerald-600" />
              Transparent 60 / 40 Split
            </div>
            <h3 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Estimate your monthly payout
            </h3>
            <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
              You keep 60% of all ad revenue generated during your wait time. No points, no lock-ins — real dollars transferred directly to your balance.
            </p>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex justify-between items-center text-base font-semibold text-slate-700">
              <span>Daily AI prompts sent:</span>
              <span className="text-emerald-700 font-bold text-xl">{dailyPrompts} prompts / day</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={dailyPrompts}
              onChange={(e) => setDailyPrompts(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2.5 bg-slate-200 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-xs sm:text-sm text-slate-400 font-medium">
              <span>Casual (5/day)</span>
              <span>Average (25/day)</span>
              <span>Power User (100/day)</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 space-y-2 text-sm text-slate-600 shadow-sm">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>Fastest cashout in the industry: $2 floor</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              At your current pace, you hit your first $2 cashout in approximately{' '}
              <strong className="text-slate-900 font-bold">{daysToFirstCashout} days</strong>. Withdraw instantly via UPI, PayPal, or Gift Cards.
            </p>
          </div>
        </div>

        {/* Output Card */}
        <div className="lg:col-span-5 rounded-3xl border border-emerald-200 bg-white p-8 sm:p-12 text-center shadow-xl shadow-emerald-500/5">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400">
            Estimated Monthly Earnings
          </span>
          <div className="mt-3 text-6xl sm:text-7xl font-extrabold tracking-tight text-slate-900">
            ${estimatedMonthly}
          </div>
          <span className="mt-2 block text-sm font-medium text-slate-400">per month in passive cash</span>

          <div className="mt-8 border-t border-slate-100 pt-8 space-y-4 text-sm text-slate-600 text-left">
            <div className="flex justify-between py-1">
              <span>Monthly Prompts:</span>
              <span className="font-bold text-slate-900">{monthlyPrompts} prompts</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Your Share:</span>
              <span className="font-bold text-emerald-700">60% (Highest in industry)</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Minimum Payout:</span>
              <span className="font-bold text-slate-900">$2.00 (vs Chatwait $10, uwait €10)</span>
            </div>
          </div>

          <a
            href="https://github.com/jhaabhijeet864/Pathixo_Rewards"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 py-4 text-base font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            Start Earning Now — Free
          </a>
        </div>
      </div>
    </div>
  );
}
