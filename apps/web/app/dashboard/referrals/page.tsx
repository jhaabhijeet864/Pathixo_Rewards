'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Copy,
  Check,
  Share2,
  Users,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { getPermanentReferralCode } from '@/lib/referral-engine';

interface ReferralItem {
  id: string;
  referred_id: string;
  date_joined: string;
  impressions: number;
  commission_usd: number;
  status: 'active' | 'capped';
}

function formatTimeAgo(timestamp: string): string {
  const ts = new Date(timestamp).getTime();
  if (isNaN(ts) || ts <= 0) return 'Just now';
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export default function ReferralsPage() {
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [deviceId, setDeviceId] = useState('');
  const [userSession, setUserSession] = useState<{ email: string; name: string } | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalEarnedUsd: 0,
    activeReferrals: 0,
    cappedReferrals: 0,
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // STRICT AUTH CHECK: The dashboard section must only appear when properly logged in
    let session: { email: string; name: string; logged_in?: boolean } | null = null;
    try {
      const storedAuth = localStorage.getItem('pathixo_auth_session');
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        if (parsed?.logged_in && parsed?.email) {
          session = parsed;
          setUserSession(session);
        }
      }
    } catch {}

    if (!session) {
      setIsAuthLoading(false);
      router.replace('/login');
      return;
    }

    setIsAuthLoading(false);

    let currentId = localStorage.getItem('pathixo_device_id') || '';
    if (!currentId) {
      currentId = `dev_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
      localStorage.setItem('pathixo_device_id', currentId);
    }
    setDeviceId(currentId);

    // Permanent unique referral code tied to user email or device ID
    const seed = session?.email || currentId;
    const permanentCode = getPermanentReferralCode(seed);
    setReferralCode(permanentCode);

    // Fetch referral data
    const query = new URLSearchParams({
      device_id: currentId,
      ...(session?.email ? { email: session.email } : {}),
    });

    fetch(`/api/referrals?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          if (Array.isArray(data.referrals)) {
            setReferrals(data.referrals);
          }
          if (data.stats) {
            setStats({
              totalReferrals: data.stats.totalReferrals || 0,
              totalEarnedUsd: data.stats.totalEarnedUsd || 0,
              activeReferrals: data.stats.activeReferrals || 0,
              cappedReferrals: data.stats.cappedReferrals || 0,
            });
          }
          if (data.referral_code) {
            setReferralCode(data.referral_code);
          }
        }
      })
      .catch(() => {});
  }, []);

  const fullReferralUrl = `https://pathixorewards.com/?ref=${referralCode || deviceId || 'member'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullReferralUrl);
    setCopied(true);
    setToastMessage('Permanent referral link copied to clipboard!');
    setTimeout(() => {
      setCopied(false);
      setToastMessage(null);
    }, 2500);
  };

  const handleSimulateReferral = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate_referral',
          referrer_id: deviceId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        if (Array.isArray(data.referrals)) {
          setReferrals(data.referrals);
        }
        if (data.stats) {
          setStats({
            totalReferrals: data.stats.totalReferrals || 0,
            totalEarnedUsd: data.stats.totalEarnedUsd || 0,
            activeReferrals: data.stats.activeReferrals || 0,
            cappedReferrals: data.stats.cappedReferrals || 0,
          });
        }
        setToastMessage('Simulated peer referral recorded & 10% royalty added!');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch {
      // Local fallback
    } finally {
      setIsSimulating(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070a0e] text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <img src={`${basePath}/pathixo-rewards.svg`} alt="Pathixo Rewards" className="h-10 w-10 animate-pulse" />
          <span className="text-sm font-medium text-slate-400">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!userSession) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#070a0e] px-4 text-center text-slate-100">
        <img src={`${basePath}/pathixo-rewards.svg`} alt="Pathixo Rewards" className="h-12 w-12 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Sign in required</h1>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          The referrals dashboard is only accessible when signed in with your account.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition"
        >
          Sign in to Pathixo
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#070a0e] text-slate-100 font-sans antialiased">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#070a0e]/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl lg:max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard Console</span>
          </Link>

          <div className="flex items-center gap-3">
            {userSession && (
              <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-[#0d121c] px-3 py-1 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="font-mono">{userSession.email}</span>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-800 bg-[#0d121c] px-3 py-1 text-xs text-slate-400">
              <span className="text-slate-500">ID:</span>
              <span className="font-mono text-slate-300">{deviceId.slice(0, 12)}...</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 py-8 sm:py-10">
        <div className="mx-auto w-full max-w-5xl lg:max-w-6xl px-4 sm:px-6 lg:px-8 space-y-7">
          
          {/* TOAST FEEDBACK */}
          {toastMessage && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3.5 text-emerald-200 text-sm flex items-center gap-2.5 shadow-lg animate-fadeIn">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* PAGE TITLE */}
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Referral Program &amp; Royalties</h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Share your permanent link with peers. Earn an ongoing 10% weekly royalty on every verified wait-time impression they generate.
            </p>
          </div>

          {/* TOP SECTION: YOUR PERMANENT REFERRAL LINK */}
          <div className="rounded-2xl border border-slate-800 bg-[#0d121c] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Your Permanent Referral Link</span>
                <h2 className="text-xl font-bold text-white mt-1">Unique to your account &bull; Never expires</h2>
              </div>
              <span className="self-start sm:self-auto text-[11px] font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-700/50 px-2.5 py-1 rounded-full">
                Permanent 10% Weekly Royalty
              </span>
            </div>

            {/* Link Box */}
            <div className="rounded-xl border border-slate-800 bg-[#090d14] p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <span className="font-mono text-sm text-slate-200 break-all select-all sm:pr-4">
                {fullReferralUrl}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-500 transition shrink-0 cursor-pointer"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            {/* 4 SUMMARY STAT CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
              <div className="rounded-xl bg-[#090d14] p-4 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Friends Referred</span>
                  <Users className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-2 text-2xl font-bold text-white">{stats.totalReferrals}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Active connections</div>
              </div>

              <div className="rounded-xl bg-[#090d14] p-4 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Royalty Earned</span>
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="mt-2 text-2xl font-bold text-emerald-400">${stats.totalEarnedUsd.toFixed(2)}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Deposited to balance</div>
              </div>

              <div className="rounded-xl bg-[#090d14] p-4 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Weekly Royalty</span>
                  <TrendingUp className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-2 text-2xl font-bold text-white">10%</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Of verified impressions</div>
              </div>

              <div className="rounded-xl bg-[#090d14] p-4 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Cap Per Friend</span>
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-2 text-2xl font-bold text-white">$10.00</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Pathixo reserve funded</div>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: REFERRED USERS & GENERATED REVENUE TABLE */}
          <div className="rounded-2xl border border-slate-800 bg-[#0d121c] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Referred Users &amp; Commission Log</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  List of peers onboarded with your link and the royalties generated.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSimulateReferral}
                disabled={isSimulating}
                className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer disabled:opacity-50"
                title="Simulate a friend using your referral link"
              >
                <Play className="h-3 w-3 text-emerald-400" />
                <span>{isSimulating ? 'Simulating...' : 'Simulate Peer Referral'}</span>
              </button>
            </div>

            {/* TABLE / EMPTY STATE */}
            {referrals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 bg-[#090d14]/60 py-12 px-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/60 text-slate-400 mb-3">
                  <Share2 className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-white">No referrals yet</h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  Share your permanent link above with fellow developers. As they use AI chatbots, their activity and your 10% royalties will appear here in real-time.
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleSimulateReferral}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold hover:underline cursor-pointer"
                  >
                    <Play className="h-3 w-3" />
                    <span>Click to simulate a test referral to see live updates</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider">
                      <th className="pb-3 font-semibold">Referred User</th>
                      <th className="pb-3 font-semibold">Date Joined</th>
                      <th className="pb-3 font-semibold">Verified Views</th>
                      <th className="pb-3 font-semibold">Earned Royalty</th>
                      <th className="pb-3 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {referrals.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="py-3.5 pr-4 font-mono text-slate-300">
                          {item.referred_id.slice(0, 10)}...
                        </td>
                        <td className="py-3.5 pr-4 text-slate-400">
                          {formatTimeAgo(item.date_joined)}
                        </td>
                        <td className="py-3.5 pr-4 text-slate-300 font-medium">
                          {item.impressions} views
                        </td>
                        <td className="py-3.5 pr-4">
                          <span className="font-bold text-emerald-400">
                            +${item.commission_usd.toFixed(4)}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              item.status === 'active'
                                ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/50'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {item.status === 'active' ? 'Active Royalty' : 'Capped ($10 Max)'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-[#070a0e] py-6 text-xs text-slate-500">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6">
          <span>Pathixo Rewards &bull; Partner Referral Hub</span>
          <Link href="/dashboard" className="text-slate-400 hover:text-emerald-400 transition-colors">
            Return to Console
          </Link>
        </div>
      </footer>
    </div>
  );
}
