'use client';

import { useState, useEffect } from 'react';
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsCashoutSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14 space-y-10">
          {/* Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Earnings Dashboard
              </h1>
              <p className="text-xs text-slate-500">
                Connected device: <span className="font-mono text-slate-700">dev_usr_8829</span> • Extension active
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                Live Revenue Sync
              </span>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Balance */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Balance</span>
              <div className="mt-2 text-3xl font-extrabold text-slate-900">
                ${earnings.balance_usd.toFixed(4)}
              </div>
              <p className="mt-1 text-xs text-emerald-700 font-medium">
                {canCashout ? '✓ Ready for instant cashout' : `$${(minThreshold - earnings.balance_usd).toFixed(2)} to cashout`}
              </p>
            </div>

            {/* Today's Views */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today&apos;s Verified Views</span>
              <div className="mt-2 text-3xl font-extrabold text-slate-900">
                {earnings.impressions_today}
              </div>
              <p className="mt-1 text-xs text-slate-500">Across ChatGPT, Claude &amp; Gemini</p>
            </div>

            {/* Lifetime Cashouts */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Lifetime Cashouts</span>
              <div className="mt-2 text-3xl font-extrabold text-slate-900">
                ${earnings.lifetime_earned_usd.toFixed(2)}
              </div>
              <p className="mt-1 text-xs text-slate-500">Paid out via instant rails</p>
            </div>
          </div>

          {/* CASHOUT TERMINAL & REFERRAL GRID */}
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            {/* Cashout Terminal (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Instant Redemption</span>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Withdraw your earnings</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Threshold: $2.00 USD. Once requested, funds are routed through instant rails without 30-day holds.
                </p>
              </div>

              {/* Progress toward threshold */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Threshold Progress</span>
                  <span>${earnings.balance_usd.toFixed(2)} / $2.00 ({progressPercent}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {cashoutSuccess ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                  <h3 className="font-bold text-slate-900">Transfer Initiated!</h3>
                  <p className="text-xs text-slate-600">{cashoutSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleCashout} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Payout Rail</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('upi')}
                        className={`rounded-xl p-3 text-xs font-bold border transition text-center ${
                          payoutMethod === 'upi'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        UPI (India Instant)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('paypal')}
                        className={`rounded-xl p-3 text-xs font-bold border transition text-center ${
                          payoutMethod === 'paypal'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        PayPal (Global)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('gift_card')}
                        className={`rounded-xl p-3 text-xs font-bold border transition text-center ${
                          payoutMethod === 'gift_card'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Amazon Card
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {payoutMethod === 'upi'
                        ? 'Your VPA / UPI ID (e.g. yourname@okhdfcbank)'
                        : payoutMethod === 'paypal'
                        ? 'Your PayPal Email Address'
                        : 'Delivery Email Address'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={payoutMethod === 'upi' ? 'username@upi' : 'you@domain.com'}
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!canCashout || isCashoutSubmitting}
                    className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-40"
                  >
                    {isCashoutSubmitting
                      ? 'Transacting...'
                      : canCashout
                      ? `Cash out $${earnings.balance_usd.toFixed(2)} Now`
                      : 'Minimum $2.00 Required'}
                  </button>
                </form>
              )}
            </div>

            {/* Referral Hub (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Earn 10% Forever</span>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Invite Friends</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Share your link. Whenever someone you invite views sponsored cards, you get 10% of their earnings forever.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-2">
                <span className="truncate text-xs font-mono text-slate-600">{referralLink}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 shadow-xs hover:bg-slate-50"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-center text-xs">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <span className="text-slate-400 block mb-1">Friends Referred</span>
                  <strong className="text-lg text-slate-900">{earnings.referral_count}</strong>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <span className="text-slate-400 block mb-1">Bonus Earned</span>
                  <strong className="text-lg text-emerald-700">${earnings.referral_bonus_usd.toFixed(2)}</strong>
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
