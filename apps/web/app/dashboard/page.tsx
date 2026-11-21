'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  DollarSign,
  TrendingUp,
  Share2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Copy,
  Check,
  CreditCard,
  AlertCircle,
  Zap,
  ShieldCheck,
  Gift,
} from 'lucide-react';
import type { UserEarnings } from '@pathixo/shared';

export default function DashboardPage() {
  const [earnings, setEarnings] = useState<UserEarnings>({
    balance_usd: 2.148,
    lifetime_earned_usd: 5.62,
    impressions_today: 18,
    referral_count: 3,
    referral_bonus_usd: 0.54,
  });

  const [copied, setCopied] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'paypal' | 'gift_card'>('upi');
  const [destination, setDestination] = useState('');
  const [cashoutSuccess, setCashoutSuccess] = useState<string | null>(null);
  const [isCashoutSubmitting, setIsCashoutSubmitting] = useState(false);

  const referralLink = 'https://pathixorewards.com/?ref=dev_usr_8829';
  const minThreshold = 2.0;
  const canCashout = earnings.balance_usd >= minThreshold;
  const progressPercent = Math.min(100, Math.round((earnings.balance_usd / minThreshold) * 100));

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCashout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCashout) return;
    setIsCashoutSubmitting(true);

    try {
      const res = await fetch('/api/cashout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_usd: earnings.balance_usd,
          payout_method: payoutMethod,
          payout_destination: destination,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCashoutSuccess(data.message || 'Payout processed successfully!');
        setEarnings((prev) => ({
          ...prev,
          balance_usd: 0.0,
          lifetime_earned_usd: Number((prev.lifetime_earned_usd + prev.balance_usd).toFixed(4)),
        }));
      }
    } catch {
      // Static export mock simulation
      setCashoutSuccess(`Simulated cashout of $${earnings.balance_usd.toFixed(2)} sent via ${payoutMethod.toUpperCase()}!`);
      setEarnings((prev) => ({
        ...prev,
        balance_usd: 0.0,
        lifetime_earned_usd: Number((prev.lifetime_earned_usd + prev.balance_usd).toFixed(4)),
      }));
    } finally {
      setIsCashoutSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#090d16] text-slate-100 selection:bg-indigo-500/30 selection:text-white">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16 w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.08] pb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>DEVICE TOKEN: dev_8829_chrome</span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight mt-1">Earnings &amp; Wallet Hub</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Track verified impressions, referral dividends, and initiate instant $2.00 cashouts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-mono text-slate-300">
                60% Direct Cut Active
              </span>
            </div>
          </div>

          {/* Key Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Balance */}
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-tr from-[#0d1424] to-[#121c33] p-6 space-y-2 shadow-lg">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-300">Available Balance</span>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                ${earnings.balance_usd.toFixed(4)}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <Zap className="h-3.5 w-3.5" />
                <span>Ready to cash out (Threshold: $2.00)</span>
              </div>
            </div>

            {/* Lifetime Payouts */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c1220] p-6 space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Lifetime Earned</span>
              <div className="text-3xl sm:text-4xl font-black text-slate-100 font-mono">
                ${earnings.lifetime_earned_usd.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400">Total verified wait-time yield</p>
            </div>

            {/* Today's Views */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c1220] p-6 space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Today&apos;s Verified Views</span>
              <div className="text-3xl sm:text-4xl font-black text-slate-100 font-mono">
                {earnings.impressions_today}
              </div>
              <p className="text-xs text-slate-400">4s+ active tab dwell verified</p>
            </div>

            {/* Referral Credits */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c1220] p-6 space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Referral Bonus (10%)</span>
              <div className="text-3xl sm:text-4xl font-black text-indigo-400 font-mono">
                ${earnings.referral_bonus_usd.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400">From {earnings.referral_count} invited peers</p>
            </div>
          </div>

          {/* Main 2-Column: Instant Cashout Terminal & Referral Hub */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Cashout Terminal (7 Cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-white/[0.1] bg-[#0c1220] p-6 sm:p-8 space-y-6 shadow-xl">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Instant Cashout Terminal</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Minimum threshold: $2.00 USD. No 30-day holds or lock-in periods.
                </p>
              </div>

              {/* Progress to next threshold */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Progress to $2.00 Floor:</span>
                  <span className="text-emerald-400 font-bold">{progressPercent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {cashoutSuccess ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                  <h3 className="text-lg font-bold text-white">Cashout Complete!</h3>
                  <p className="text-sm text-slate-300">{cashoutSuccess}</p>
                  <button
                    type="button"
                    onClick={() => setCashoutSuccess(null)}
                    className="text-xs font-mono font-semibold text-cyan-400 hover:underline"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCashout} className="space-y-5">
                  {/* Select Rail */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">Choose Payout Method:</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('upi')}
                        className={`rounded-xl border p-3.5 text-center text-xs font-semibold transition ${
                          payoutMethod === 'upi'
                            ? 'border-cyan-400 bg-cyan-400/10 text-white'
                            : 'border-white/10 bg-[#12192c] text-slate-400 hover:text-white'
                        }`}
                      >
                        <Zap className="h-4 w-4 mx-auto mb-1 text-emerald-400" />
                        UPI (India Instant)
                      </button>

                      <button
                        type="button"
                        onClick={() => setPayoutMethod('paypal')}
                        className={`rounded-xl border p-3.5 text-center text-xs font-semibold transition ${
                          payoutMethod === 'paypal'
                            ? 'border-cyan-400 bg-cyan-400/10 text-white'
                            : 'border-white/10 bg-[#12192c] text-slate-400 hover:text-white'
                        }`}
                      >
                        <CreditCard className="h-4 w-4 mx-auto mb-1 text-cyan-400" />
                        PayPal (Global)
                      </button>

                      <button
                        type="button"
                        onClick={() => setPayoutMethod('gift_card')}
                        className={`rounded-xl border p-3.5 text-center text-xs font-semibold transition ${
                          payoutMethod === 'gift_card'
                            ? 'border-cyan-400 bg-cyan-400/10 text-white'
                            : 'border-white/10 bg-[#12192c] text-slate-400 hover:text-white'
                        }`}
                      >
                        <Gift className="h-4 w-4 mx-auto mb-1 text-indigo-400" />
                        Amazon Gift Card
                      </button>
                    </div>
                  </div>

                  {/* Destination Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">
                      {payoutMethod === 'upi'
                        ? 'Enter Virtual Payment Address (VPA / UPI ID):'
                        : payoutMethod === 'paypal'
                        ? 'Enter PayPal Account Email:'
                        : 'Enter Email for Gift Card Delivery:'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={
                        payoutMethod === 'upi'
                          ? 'name@okaxis or user@upi'
                          : 'name@email.com'
                      }
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12192c] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!canCashout || isCashoutSubmitting}
                    className={`w-full rounded-xl py-3.5 text-center text-sm font-bold text-white shadow-glow transition ${
                      canCashout
                        ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    {isCashoutSubmitting
                      ? 'Processing Transfer...'
                      : canCashout
                      ? `Request Instant Cashout ($${earnings.balance_usd.toFixed(2)})`
                      : `Earn $${(minThreshold - earnings.balance_usd).toFixed(2)} more to reach $2.00 floor`}
                  </button>
                </form>
              )}
            </div>

            {/* Referral Center & Feed (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Referral Box */}
              <div className="rounded-2xl border border-white/[0.1] bg-[#0c1220] p-6 sm:p-7 space-y-4">
                <div className="flex items-center gap-2.5">
                  <Share2 className="h-4 w-4 text-cyan-400" />
                  <h3 className="font-bold text-white">10% Lifetime Referral Tier</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Invite other developers and power users. You earn 10% of their ad rewards forever, without reducing their 60% share.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="w-full rounded-xl border border-white/10 bg-[#12192c] px-3 py-2 text-xs font-mono text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="shrink-0 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 transition"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Activity Ledger Feed */}
              <div className="rounded-2xl border border-white/[0.1] bg-[#0c1220] p-6 space-y-4">
                <h3 className="font-bold text-white text-sm">Recent Verified Dwells</h3>
                <div className="space-y-3 text-xs divide-y divide-white/[0.06]">
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <div className="font-semibold text-slate-200">ChatGPT Prompt Turn</div>
                      <div className="text-[11px] text-slate-500">4.2s dwell • Cursor ad unit</div>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">+$0.009 USD</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <div className="font-semibold text-slate-200">Claude 3.7 Thinking Mode</div>
                      <div className="text-[11px] text-slate-500">5.8s dwell • Vercel v0 unit</div>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">+$0.009 USD</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <div className="font-semibold text-slate-200">DeepSeek R1 Query</div>
                      <div className="text-[11px] text-slate-500">6.1s dwell • Perplexity unit</div>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">+$0.009 USD</span>
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
