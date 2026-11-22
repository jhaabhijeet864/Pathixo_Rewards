'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  Share2,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import type { UserEarnings } from '@pathixo/shared';

interface ViewedAdItem {
  id: string;
  sponsor: string;
  headline: string;
  model: string;
  dwellSeconds: number;
  earnedUsd: number;
  timeAgo: string;
  verified: boolean;
}

const INITIAL_VIEWED_ADS: ViewedAdItem[] = [
  {
    id: 'ad-1',
    sponsor: 'Vakxo',
    headline: 'Run AI Agents Locally: 0 API Cost',
    model: 'ChatGPT o3-mini',
    dwellSeconds: 4.8,
    earnedUsd: 0.009,
    timeAgo: '4 mins ago',
    verified: true,
  },
  {
    id: 'ad-2',
    sponsor: 'Pathixo',
    headline: 'Pathixo AI Labs: Builds AI Native Apps',
    model: 'Claude 3.7 Sonnet',
    dwellSeconds: 5.4,
    earnedUsd: 0.009,
    timeAgo: '18 mins ago',
    verified: true,
  },
  {
    id: 'ad-3',
    sponsor: 'KrocPDF',
    headline: 'Create PDFs and Other Docs: 100% Locally, Anti-ilovePDF',
    model: 'DeepSeek R1',
    dwellSeconds: 6.2,
    earnedUsd: 0.009,
    timeAgo: '42 mins ago',
    verified: true,
  },
  {
    id: 'ad-4',
    sponsor: 'Blip',
    headline: 'Vanish From Meeting with just a snap',
    model: 'Google Gemini',
    dwellSeconds: 4.2,
    earnedUsd: 0.009,
    timeAgo: '2 hours ago',
    verified: true,
  },
];

export default function DashboardPage() {
  const [deviceId, setDeviceId] = useState('dev_usr_8829');
  const [userSession, setUserSession] = useState<{ email: string; name: string } | null>(null);
  const [isNewLogin, setIsNewLogin] = useState(false);
  const [earnings, setEarnings] = useState<UserEarnings>({
    balance_usd: 2.148,
    lifetime_earned_usd: 5.62,
    impressions_today: 18,
    referral_count: 3,
    referral_bonus_usd: 0.54,
  });

  const [viewedAds] = useState<ViewedAdItem[]>(INITIAL_VIEWED_ADS);
  const [copied, setCopied] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'paypal' | 'gift_card'>('upi');
  const [destination, setDestination] = useState('');
  const [cashoutSuccess, setCashoutSuccess] = useState<string | null>(null);
  const [isCashoutSubmitting, setIsCashoutSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const devParam = params.get('device_id');
      const loginParam = params.get('login');
      if (devParam) {
        setDeviceId(devParam);
      }
      if (loginParam === 'success') {
        setIsNewLogin(true);
        // Fresh user onboarding state
        setEarnings({
          balance_usd: 0.0000,
          lifetime_earned_usd: 0.0000,
          impressions_today: 0,
          referral_count: 0,
          referral_bonus_usd: 0,
        });
      }

      try {
        const stored = localStorage.getItem('pathixo_auth_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          setUserSession(parsed);
        }
      } catch {
        // Local storage fallback
      }
    }
  }, []);

  const referralLink = `https://pathixorewards.com/?ref=${deviceId}`;
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
        setCashoutSuccess(data.message || 'Payout request received and queued for instant settlement!');
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

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return (
    <div className="flex min-h-screen flex-col bg-[#070a0e] text-slate-100 font-sans antialiased">
      {/* MINIMAL STANDALONE DASHBOARD HEADER (NOT CONNECTED TO WEBSITE MARKETING NAV) */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#070a0e]/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-14 py-4">
          {/* Brand Heading linking back to main landing page */}
          <Link
            href="/"
            className="flex items-center gap-3 group transition-opacity hover:opacity-90"
            title="Back to Pathixo Rewards Home"
          >
            <img src={`${basePath}/icon.svg`} alt="Pathixo Rewards" className="h-8 w-8 rounded-lg" />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                Pathixo Rewards
              </span>
              <span className="text-[11px] text-slate-400 font-medium">User Rewards Console</span>
            </div>
          </Link>

          {/* Right Header Status Bar */}
          <div className="flex items-center gap-3 sm:gap-5">
            {userSession && (
              <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-800 bg-[#0d121c] px-3.5 py-1.5 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-mono text-xs">{userSession.email}</span>
              </div>
            )}

            <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-800 bg-[#0d121c] px-3.5 py-1.5 text-xs text-slate-400">
              <span className="text-slate-500">Device ID:</span>
              <span className="font-mono text-slate-300 font-semibold">{deviceId}</span>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1.5 text-xs font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Extension Connected</span>
            </div>
          </div>
        </div>
      </header>

      {/* DASHBOARD CONTENT BODY */}
      <main className="flex-1 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14 space-y-10">

          {/* ONBOARDING SUCCESS BANNER */}
          {isNewLogin && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/50 p-4 text-emerald-200 text-sm flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-300">Account Linked Successfully!</p>
                  <p className="text-xs text-emerald-400/90 mt-0.5">
                    Your browser extension overlay is activated and synced at $0.0000 balance. Keep using ChatGPT, Claude, and Gemini to accumulate earnings!
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono bg-emerald-900/60 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-700/50 hidden sm:inline-block">
                {userSession?.email || 'Logged In'}
              </span>
            </div>
          )}

          {/* WELCOME BANNER & METRICS */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Your Rewards &amp; Payouts
              </h1>
              <p className="mt-2 text-sm text-slate-400 max-w-2xl">
                Track your wait-time earnings, review ads verified during AI thinking mode, manage your referrals, and request instant cashouts starting at $2.00.
              </p>
            </div>

            {/* 4 CORE METRIC TILES */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Available Balance */}
              <div className="rounded-2xl border border-emerald-500/30 bg-[#0d141e] p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Available Balance</span>
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                  ${earnings.balance_usd.toFixed(4)}
                </div>
                <p className="mt-2 text-xs font-medium text-emerald-400">
                  {canCashout ? '✓ Ready for instant cashout' : `$${(minThreshold - earnings.balance_usd).toFixed(2)} to $2.00 cashout floor`}
                </p>
              </div>

              {/* Today's Views */}
              <div className="rounded-2xl border border-slate-800 bg-[#0d121c] p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today&apos;s Verified Views</span>
                  <Clock className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                  {earnings.impressions_today}
                </div>
                <p className="mt-2 text-xs text-slate-500">Across ChatGPT, Claude &amp; Gemini</p>
              </div>

              {/* Lifetime Earned */}
              <div className="rounded-2xl border border-slate-800 bg-[#0d121c] p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Lifetime Cashouts</span>
                  <TrendingUp className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                  ${earnings.lifetime_earned_usd.toFixed(2)}
                </div>
                <p className="mt-2 text-xs text-slate-500">Settled via instant rails</p>
              </div>

              {/* Referral Bonus */}
              <div className="rounded-2xl border border-slate-800 bg-[#0d121c] p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Referral Commission</span>
                  <Share2 className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-emerald-400">
                  ${earnings.referral_bonus_usd.toFixed(2)}
                </div>
                <p className="mt-2 text-xs text-slate-500">10% lifetime share from {earnings.referral_count} friends</p>
              </div>
            </div>
          </div>

          {/* TWO-COLUMN WORKSPACE: CASHOUT TERMINAL + REFERRALS */}
          <div className="grid gap-8 lg:grid-cols-12 items-start">

            {/* CASHOUT TERMINAL (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#0d121c] p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Instant Redemption</span>
                <h2 className="mt-1 text-2xl font-bold text-white">Withdraw your earnings</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Threshold: $2.00 USD. Once requested, funds are routed through instant rails without 30-day holds.
                </p>
              </div>

              {/* Threshold Progress Bar */}
              <div className="rounded-xl bg-[#090d14] p-4 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Threshold Progress</span>
                  <span className="text-emerald-400">
                    ${earnings.balance_usd.toFixed(2)} / $2.00 ({progressPercent}%)
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {cashoutSuccess ? (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-6 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                  <h3 className="font-bold text-white text-base">Transfer Initiated!</h3>
                  <p className="text-xs sm:text-sm text-emerald-300/80">{cashoutSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleCashout} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Select Payout Rail</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('upi')}
                        className={`rounded-xl p-3 text-xs font-bold border transition text-center ${
                          payoutMethod === 'upi'
                            ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 shadow-sm'
                            : 'border-slate-800 bg-[#090d14] text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        UPI (India Instant)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('paypal')}
                        className={`rounded-xl p-3 text-xs font-bold border transition text-center ${
                          payoutMethod === 'paypal'
                            ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 shadow-sm'
                            : 'border-slate-800 bg-[#090d14] text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        PayPal (Global)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('gift_card')}
                        className={`rounded-xl p-3 text-xs font-bold border transition text-center ${
                          payoutMethod === 'gift_card'
                            ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 shadow-sm'
                            : 'border-slate-800 bg-[#090d14] text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        Amazon Card
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {payoutMethod === 'upi'
                        ? 'Your VPA / UPI ID (e.g. username@okhdfcbank)'
                        : payoutMethod === 'paypal'
                        ? 'Your PayPal Email Address'
                        : 'Delivery Email Address for Gift Card'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={payoutMethod === 'upi' ? 'username@upi' : 'you@domain.com'}
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-[#090d14] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!canCashout || isCashoutSubmitting}
                    className="w-full rounded-xl bg-[#10b981] py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0ea371] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isCashoutSubmitting
                      ? 'Processing Transfer...'
                      : canCashout
                      ? `Cash out $${earnings.balance_usd.toFixed(2)} Now`
                      : 'Minimum $2.00 Floor Required to Cash Out'}
                  </button>
                </form>
              )}
            </div>

            {/* REFERRALS & HOW TO EARN MORE (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Referrals Box */}
              <div className="rounded-2xl border border-slate-800 bg-[#0d121c] p-6 sm:p-8 shadow-sm space-y-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Earn 10% Forever</span>
                  <h2 className="mt-1 text-2xl font-bold text-white">Invite Friends</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Share your personal referral link. Whenever someone you invite views sponsored cards while AI thinks, you get 10% of their earnings for life.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#090d14] p-3 flex items-center justify-between gap-3">
                  <span className="truncate text-xs font-mono text-slate-300">{referralLink}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 transition"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied' : 'Copy Link'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center text-xs">
                  <div className="rounded-xl bg-[#090d14] p-3.5 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Friends Referred</span>
                    <strong className="text-xl font-bold text-white">{earnings.referral_count}</strong>
                  </div>
                  <div className="rounded-xl bg-[#090d14] p-3.5 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Commission Earned</span>
                    <strong className="text-xl font-bold text-emerald-400">${earnings.referral_bonus_usd.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {/* How to Earn More Box */}
              <div className="rounded-2xl border border-slate-800 bg-[#0d121c] p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-white font-bold text-base">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <h3>How to earn more passive cash</h3>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-400">
                  <li className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-950 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      1
                    </span>
                    <span>
                      <strong className="text-slate-200">Use reasoning models:</strong> ChatGPT o1/o3-mini, Claude 3.7 Sonnet, and DeepSeek R1 have extended 4s–15s thinking times which consistently qualify for ad rewards.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-950 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      2
                    </span>
                    <span>
                      <strong className="text-slate-200">Keep extension pinned:</strong> Pin Pathixo to your Chrome toolbar to ensure cards trigger smoothly while working.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-950 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      3
                    </span>
                    <span>
                      <strong className="text-slate-200">Share with developer peers:</strong> Friends who use AI for coding and research quickly earn, building up your 10% commission.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

          </div>

          {/* ADS SEEN SO FAR (AD HISTORY LOG) */}
          <div className="rounded-2xl border border-slate-800 bg-[#0d121c] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Telemetry Log</span>
                <h2 className="text-2xl font-bold text-white mt-1">Ads seen so far</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Full transparent audit trail of sponsored cards shown on this device during AI wait times.
                </p>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 self-start sm:self-auto">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Zero prompt reading • DOM-timing only</span>
              </div>
            </div>

            {/* Table / List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider">
                    <th className="pb-3 font-semibold">Sponsor &amp; Message</th>
                    <th className="pb-3 font-semibold">AI Platform</th>
                    <th className="pb-3 font-semibold">Dwell Time</th>
                    <th className="pb-3 font-semibold">Earned</th>
                    <th className="pb-3 font-semibold text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {viewedAds.map((ad) => (
                    <tr key={ad.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold text-white">{ad.sponsor}</div>
                        <div className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">{ad.headline}</div>
                      </td>
                      <td className="py-3.5 pr-4 text-slate-300 font-medium">
                        {ad.model}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300 font-mono">
                          {ad.dwellSeconds.toFixed(1)}s dwell
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="font-bold text-emerald-400">
                          +${ad.earnedUsd.toFixed(4)}
                        </span>
                      </td>
                      <td className="py-3.5 text-right text-xs text-slate-500 whitespace-nowrap">
                        {ad.timeAgo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Showing last 6 qualified impressions</span>
              <span>Credits deposited in real-time</span>
            </div>
          </div>

        </div>
      </main>

      {/* MINIMAL STANDALONE DASHBOARD FOOTER */}
      <footer className="border-t border-slate-800/80 bg-[#070a0e] py-8 text-xs text-slate-500">
        <div className="mx-auto flex w-full max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-6 sm:px-10 lg:px-14">
          <div className="flex items-center gap-2">
            <span>Pathixo Rewards User Console</span>
            <span>•</span>
            <span>Anonymous Device Mode</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-emerald-400 transition-colors">
              ← Return to Main Website
            </Link>
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
              Privacy Guarantee
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
