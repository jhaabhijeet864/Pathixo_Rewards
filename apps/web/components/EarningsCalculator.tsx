'use client';

import { useState } from 'react';
import { DollarSign, Zap, TrendingUp, ShieldCheck, Check, X, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function EarningsCalculator() {
  const [promptsPerDay, setPromptsPerDay] = useState(30);
  const [avgWaitSeconds, setAvgWaitSeconds] = useState(6);

  // Economics:
  // CPM is $15–$25 (average $18 CPM = $0.018 per view)
  // Pathixo 60% user cut = $0.0108 / prompt (baseline floor $0.009/prompt)
  const creditPerPrompt = 0.009;
  const dailyEarnings = Number((promptsPerDay * creditPerPrompt).toFixed(3));
  const monthlyEarnings = Number((dailyEarnings * 30).toFixed(2));
  const daysToTwoDollarCashout = Math.max(1, Math.ceil(2.0 / dailyEarnings));
  const annualEarnings = Number((monthlyEarnings * 12).toFixed(2));

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12">
      
      {/* Dynamic Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Interactive Sliders & Configuration */}
        <div className="lg:col-span-7 rounded-2xl border border-white/[0.1] bg-[#0d1322] p-6 sm:p-8 space-y-8 shadow-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-mono font-semibold text-cyan-400">
              <Zap className="h-3.5 w-3.5" />
              <span>Real-Time Earning Model</span>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              Calculate your wait-time dividends
            </h3>
            <p className="text-sm text-slate-400">
              Move the sliders to project how much you earn during normal coding, drafting, and research workflows.
            </p>
          </div>

          {/* Slider 1: Prompts Per Day */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="prompts-slider" className="font-semibold text-slate-200">
                Daily AI Prompts (ChatGPT, Claude, DeepSeek):
              </label>
              <span className="font-mono text-base font-bold text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-lg border border-cyan-400/20">
                {promptsPerDay} prompts / day
              </span>
            </div>
            <input
              id="prompts-slider"
              type="range"
              min="5"
              max="120"
              step="5"
              value={promptsPerDay}
              onChange={(e) => setPromptsPerDay(Number(e.target.value))}
              className="h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Casual (10/day)</span>
              <span>Software Engineer (35/day)</span>
              <span>Power User (80+/day)</span>
            </div>
          </div>

          {/* Slider 2: Average Thinking Time */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="wait-slider" className="font-semibold text-slate-200">
                Average Model Thinking Time:
              </label>
              <span className="font-mono text-base font-bold text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-lg border border-indigo-400/20">
                ~{avgWaitSeconds}s per answer
              </span>
            </div>
            <input
              id="wait-slider"
              type="range"
              min="4"
              max="20"
              step="1"
              value={avgWaitSeconds}
              onChange={(e) => setAvgWaitSeconds(Number(e.target.value))}
              className="h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Fast (4s minimum)</span>
              <span>Deep Reasoning (8-12s)</span>
              <span>Complex Synthesis (15s+)</span>
            </div>
          </div>

          {/* Transparent Cut Callout */}
          <div className="rounded-xl border border-white/[0.08] bg-[#12192c] p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400">
                60%
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-200">Direct User Revenue Share</div>
                <div className="text-slate-400">Industry high — 10% higher than Chatwait and uwait</div>
              </div>
            </div>
            <div className="text-right text-xs font-mono text-emerald-400 font-bold">
              +$0.009 / view
            </div>
          </div>
        </div>

        {/* Right Side: Projected Earnings Card */}
        <div className="lg:col-span-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-[#10172a] via-[#0d1424] to-[#0a0f1d] p-6 sm:p-8 flex flex-col justify-between shadow-2xl shadow-cyan-950/20">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Estimated Payout</span>
              <span className="rounded-full bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                Instant Cashout Eligible
              </span>
            </div>

            {/* Big Headline Monthly Metric */}
            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-baseline gap-1">
                <span className="text-cyan-400">$</span>
                <span>{monthlyEarnings.toFixed(2)}</span>
                <span className="text-lg font-medium text-slate-400">/ mo</span>
              </div>
              <p className="text-xs text-slate-400">
                Projected annual cashout: <strong className="text-white">${annualEarnings} USD/year</strong>
              </p>
            </div>

            {/* Stat Pills */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-center space-y-0.5">
                <div className="text-xs text-slate-400">Daily Dividends</div>
                <div className="font-mono font-bold text-lg text-white">${dailyEarnings.toFixed(2)}</div>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-center space-y-0.5">
                <div className="text-xs text-slate-400">Time to $2 Floor</div>
                <div className="font-mono font-bold text-lg text-cyan-400">~{daysToTwoDollarCashout} days</div>
              </div>
            </div>

            {/* Payout Channels Supported */}
            <div className="rounded-xl border border-white/[0.06] bg-[#090d16] p-3.5 space-y-2 text-xs">
              <div className="font-semibold text-slate-300">Supported Instant Payout Rails:</div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span className="rounded bg-white/5 border border-white/10 px-2 py-1 text-slate-200">
                  ⚡ UPI (Instant - India)
                </span>
                <span className="rounded bg-white/5 border border-white/10 px-2 py-1 text-slate-200">
                  🌐 PayPal (Global)
                </span>
                <span className="rounded bg-white/5 border border-white/10 px-2 py-1 text-slate-200">
                  🎁 Amazon Gift Card
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 py-3.5 text-center text-sm font-bold text-white shadow-glow transition hover:opacity-95"
            >
              <span>Start Earning Free</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* COMPARISON MATRIX (Pathixo vs Chatwait vs uwait) */}
      <div id="comparison" className="rounded-2xl border border-white/[0.1] bg-[#0c1220] p-6 sm:p-10 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">Competitive Transparency</span>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            How Pathixo Rewards beats existing platforms
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            We built Pathixo Rewards because other wait-time extensions lock your earnings behind $10 minimums and 30-day payout holds.
          </p>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.1] text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-4">Feature</th>
                <th className="py-4 px-4 text-cyan-300 font-bold bg-cyan-950/20 rounded-t-lg">Pathixo Rewards</th>
                <th className="py-4 px-4">Chatwait</th>
                <th className="py-4 px-4">uwait</th>
                <th className="py-4 px-4">AdWait</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-xs sm:text-sm">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-200">User Revenue Share</td>
                <td className="py-3.5 px-4 font-bold text-emerald-400 bg-cyan-950/20">60% to User</td>
                <td className="py-3.5 px-4 text-slate-400">50%</td>
                <td className="py-3.5 px-4 text-slate-400">50%</td>
                <td className="py-3.5 px-4 text-slate-400">50%</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-200">Minimum Cashout Floor</td>
                <td className="py-3.5 px-4 font-bold text-emerald-400 bg-cyan-950/20">$2.00 (Instant)</td>
                <td className="py-3.5 px-4 text-rose-400">$10.00 (High)</td>
                <td className="py-3.5 px-4 text-rose-400">€10.00 (High)</td>
                <td className="py-3.5 px-4 text-slate-400">$5.00</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-200">Payout Holding Period</td>
                <td className="py-3.5 px-4 font-bold text-emerald-400 bg-cyan-950/20">Instant (Zero Hold)</td>
                <td className="py-3.5 px-4 text-rose-400">30-Day Hold</td>
                <td className="py-3.5 px-4 text-rose-400">Monthly Payout</td>
                <td className="py-3.5 px-4 text-slate-400">N/A (Pre-launch)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-200">Supported AI Platforms</td>
                <td className="py-3.5 px-4 font-bold text-white bg-cyan-950/20">5 Models (inc. DeepSeek)</td>
                <td className="py-3.5 px-4 text-slate-400">3 Models</td>
                <td className="py-3.5 px-4 text-slate-400">3 Models</td>
                <td className="py-3.5 px-4 text-slate-400">3 Models</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-200">Client Code Transparency</td>
                <td className="py-3.5 px-4 font-bold text-emerald-400 bg-cyan-950/20">100% Open Source (Audit on GitHub)</td>
                <td className="py-3.5 px-4 text-slate-400">Closed Client</td>
                <td className="py-3.5 px-4 text-slate-400">Closed Client</td>
                <td className="py-3.5 px-4 text-slate-400">Closed Client</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-200">DOM Security Guarantee</td>
                <td className="py-3.5 px-4 font-bold text-white bg-cyan-950/20">Isolated Shadow DOM (0 innerHTML)</td>
                <td className="py-3.5 px-4 text-slate-400">Injected node</td>
                <td className="py-3.5 px-4 text-slate-400">Injected node</td>
                <td className="py-3.5 px-4 text-slate-400">Unknown</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
