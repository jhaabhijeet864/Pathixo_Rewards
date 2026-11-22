'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  TrendingUp,
  Share2,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Play,
  Trash2,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Wallet,
} from 'lucide-react';
import type { UserEarnings } from '@pathixo/shared';
import { getPermanentReferralCode } from '@/lib/referral-engine';

export interface ViewedAdItem {
  id: string;
  sponsor: string;
  headline: string;
  model: string;
  dwellSeconds: number;
  earnedUsd: number;
  timestamp: number;
  verified: boolean;
}

function formatTimeAgo(timestamp: number | string): string {
  const ts = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  if (isNaN(ts) || ts <= 0) return 'Just now';
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [deviceId, setDeviceId] = useState('');
  const [userSession, setUserSession] = useState<{ email: string; name: string } | null>(null);
  const [isNewLogin, setIsNewLogin] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [extensionConnected, setExtensionConnected] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [earnings, setEarnings] = useState<UserEarnings>({
    balance_usd: 0.0,
    lifetime_earned_usd: 0.0,
    lifetime_cashouts_usd: 0.0,
    impressions_today: 0,
    referral_count: 0,
    referral_bonus_usd: 0,
  });

  const [viewedAds, setViewedAds] = useState<ViewedAdItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'paypal' | 'gift_card'>('upi');
  const [destination, setDestination] = useState('');
  const [cashoutSuccess, setCashoutSuccess] = useState<string | null>(null);
  const [isCashoutSubmitting, setIsCashoutSubmitting] = useState(false);

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
    } catch {
      // Storage parse fallback
    }

    if (!session) {
      setIsAuthLoading(false);
      router.replace('/login');
      return;
    }

    setIsAuthLoading(false);

    const params = new URLSearchParams(window.location.search);
    const devParam = params.get('device_id');
    const loginParam = params.get('login');
    const impersonateParam = params.get('impersonate');

    if (impersonateParam === 'true') {
      setIsImpersonating(true);
    }

    let currentId = devParam || localStorage.getItem('pathixo_device_id') || '';
    if (!currentId) {
      currentId = `dev_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
      localStorage.setItem('pathixo_device_id', currentId);
    }
    setDeviceId(currentId);

    if (loginParam === 'success') {
      setIsNewLogin(true);
    }

    try {
      const storedEarnings = localStorage.getItem(`pathixo_earnings_${currentId}`);
      if (storedEarnings) {
        setEarnings(JSON.parse(storedEarnings));
      }

      const storedAds = localStorage.getItem(`pathixo_viewed_ads_${currentId}`);
      if (storedAds) {
        setViewedAds(JSON.parse(storedAds));
      }
    } catch {
      // Storage parse fallback
    }

    const code = getPermanentReferralCode(session?.email || currentId);
    setReferralCode(code);

    // Helper to push synced state to server
    const syncToServer = (syncedEarnings: UserEarnings, adsToSync?: ViewedAdItem[]) => {
      fetch('/api/user/earnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: currentId,
          email: session?.email,
          earnings: syncedEarnings,
          viewed_ads: adsToSync,
        }),
      }).catch(() => {});
    };

    // Helper to fetch from backend API
    const fetchBackendEarnings = () => {
      const query = new URLSearchParams({
        device_id: currentId,
        ...(session?.email ? { email: session.email } : {}),
      });

      fetch(`/api/user/earnings?${query.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'ok') {
            if (data.earnings) {
              setEarnings((prev) => {
                const serverBal = Number(data.earnings?.balance_usd || 0);
                const clientBal = Number(prev.balance_usd || 0);
                const maxBal = Number(Math.max(clientBal, serverBal).toFixed(5));
                const maxLifetime = Number(
                  Math.max(
                    Number(prev.lifetime_earned_usd || 0),
                    Number(data.earnings?.lifetime_earned_usd || 0),
                    maxBal
                  ).toFixed(5)
                );
                const maxImpressions = Math.max(
                  Number(prev.impressions_today || 0),
                  Number(data.earnings?.impressions_today || 0)
                );

                const merged: UserEarnings = {
                  ...data.earnings,
                  balance_usd: maxBal,
                  lifetime_earned_usd: maxLifetime,
                  impressions_today: maxImpressions,
                };

                localStorage.setItem(`pathixo_earnings_${currentId}`, JSON.stringify(merged));

                // If client balance is higher than server balance, push synced state to server
                if (clientBal > serverBal) {
                  syncToServer(merged);
                }

                return merged;
              });
            }

            if (Array.isArray(data.viewed_ads)) {
              setViewedAds((prev) => {
                const adMap = new Map<string, ViewedAdItem>();
                for (const ad of prev) {
                  if (ad && ad.id) adMap.set(ad.id, ad);
                }
                for (const ad of data.viewed_ads) {
                  if (ad && ad.id) adMap.set(ad.id, ad);
                }
                const merged = Array.from(adMap.values())
                  .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                  .slice(0, 50);
                localStorage.setItem(`pathixo_viewed_ads_${currentId}`, JSON.stringify(merged));
                return merged;
              });
            }

            if (data.referral_code) {
              setReferralCode(data.referral_code);
            }
          }
        })
        .catch(() => {});
    };

    // Extension bridge message listener
    const handleExtensionMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'PATHIXO_EXTENSION_DETECTED' || event.data.type === 'PATHIXO_EXTENSION_PONG') {
        setExtensionConnected(true);
        if (event.data.deviceId) {
          setDeviceId(event.data.deviceId);
          currentId = event.data.deviceId;
          localStorage.setItem('pathixo_device_id', event.data.deviceId);
        }

        let updatedEarningsSnapshot: UserEarnings | null = null;
        let updatedAdsSnapshot: ViewedAdItem[] | null = null;

        if (event.data.earnings) {
          const inc = event.data.earnings;
          setEarnings((prev) => {
            const merged: UserEarnings = {
              ...prev,
              balance_usd: Number(Math.max(Number(prev.balance_usd || 0), Number(inc.balance_usd || 0)).toFixed(5)),
              lifetime_earned_usd: Number(
                Math.max(
                  Number(prev.lifetime_earned_usd || 0),
                  Number(inc.lifetime_earned_usd || 0),
                  Number(inc.balance_usd || 0)
                ).toFixed(5)
              ),
              impressions_today: Math.max(Number(prev.impressions_today || 0), Number(inc.impressions_today || 0)),
              referral_count: Math.max(Number(prev.referral_count || 0), Number(inc.referral_count || 0)),
              referral_bonus_usd: Math.max(Number(prev.referral_bonus_usd || 0), Number(inc.referral_bonus_usd || 0)),
            };
            localStorage.setItem(`pathixo_earnings_${currentId}`, JSON.stringify(merged));
            updatedEarningsSnapshot = merged;
            return merged;
          });
        }

        if (Array.isArray(event.data.viewedAds)) {
          setViewedAds((prev) => {
            const adMap = new Map<string, ViewedAdItem>();
            for (const ad of prev) {
              if (ad && ad.id) adMap.set(ad.id, ad);
            }
            for (const ad of event.data.viewedAds) {
              if (ad && ad.id) adMap.set(ad.id, ad);
            }
            const merged = Array.from(adMap.values())
              .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
              .slice(0, 50);
            localStorage.setItem(`pathixo_viewed_ads_${currentId}`, JSON.stringify(merged));
            updatedAdsSnapshot = merged;
            return merged;
          });
        }

        // Reconcile extension state with server
        if (updatedEarningsSnapshot) {
          syncToServer(updatedEarningsSnapshot, updatedAdsSnapshot || undefined);
        }
      }

      if (event.data.type === 'PATHIXO_IMPRESSION_LOGGED') {
        let updatedEarningsSnapshot: UserEarnings | null = null;
        let updatedAdsSnapshot: ViewedAdItem[] | null = null;

        if (event.data.earnings) {
          const inc = event.data.earnings;
          setEarnings((prev) => {
            const merged: UserEarnings = {
              ...prev,
              balance_usd: Number(Math.max(Number(prev.balance_usd || 0), Number(inc.balance_usd || 0)).toFixed(5)),
              lifetime_earned_usd: Number(
                Math.max(
                  Number(prev.lifetime_earned_usd || 0),
                  Number(inc.lifetime_earned_usd || 0),
                  Number(inc.balance_usd || 0)
                ).toFixed(5)
              ),
              impressions_today: Math.max(Number(prev.impressions_today || 0), Number(inc.impressions_today || 0)),
            };
            localStorage.setItem(`pathixo_earnings_${currentId}`, JSON.stringify(merged));
            updatedEarningsSnapshot = merged;
            return merged;
          });
        }

        if (event.data.ad) {
          setViewedAds((prev) => {
            const next = [event.data.ad, ...prev.filter((a) => a.id !== event.data.ad.id)].slice(0, 50);
            localStorage.setItem(`pathixo_viewed_ads_${currentId}`, JSON.stringify(next));
            updatedAdsSnapshot = next;
            return next;
          });
        }

        if (updatedEarningsSnapshot) {
          syncToServer(updatedEarningsSnapshot, updatedAdsSnapshot || undefined);
        }
      }
    };

    window.addEventListener('message', handleExtensionMessage);
    window.postMessage({ type: 'PATHIXO_PING_EXTENSION' }, '*');
    fetchBackendEarnings();

    // Auto-sync when switching back from Gemini / ChatGPT to Dashboard tab
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        window.postMessage({ type: 'PATHIXO_PING_EXTENSION' }, '*');
        fetchBackendEarnings();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    // Periodic sync ping
    const intervalId = setInterval(() => {
      window.postMessage({ type: 'PATHIXO_PING_EXTENSION' }, '*');
    }, 5000);

    return () => {
      window.removeEventListener('message', handleExtensionMessage);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      clearInterval(intervalId);
    };
  }, []);

  const simulateTestImpression = () => {
    const platforms = ['ChatGPT o3-mini', 'Claude 3.7 Sonnet', 'Google Gemini 4 Argon', 'DeepSeek R1', 'Perplexity Pro'];
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const demoSponsors = [
      { sponsor: 'Cursor', headline: 'Build software 10x faster with Cursor — The AI code editor.' },
      { sponsor: 'Perplexity', headline: 'Instant research with verified sources using Perplexity Pro.' },
      { sponsor: 'Pathixo AI Labs', headline: 'Building AI Native Applications with Instant Web Rewards.' },
      { sponsor: 'KrocPDF', headline: 'Create PDFs and Other Docs: 100% Locally, Anti-ilovePDF.' },
      { sponsor: 'Blip', headline: 'Vanish From Meeting with just a snap.' },
    ];
    const picked = demoSponsors[Math.floor(Math.random() * demoSponsors.length)];
    const dwellSec = Number((4.0 + Math.random() * 3.5).toFixed(1));
    const credit = 0.009;

    const newAd: ViewedAdItem = {
      id: `ad_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      sponsor: picked.sponsor,
      headline: picked.headline,
      model: platform,
      dwellSeconds: dwellSec,
      earnedUsd: credit,
      timestamp: Date.now(),
      verified: true,
    };

    const updatedEarnings: UserEarnings = {
      ...earnings,
      balance_usd: Number((earnings.balance_usd + credit).toFixed(4)),
      lifetime_earned_usd: Number((earnings.lifetime_earned_usd + credit).toFixed(4)),
      impressions_today: earnings.impressions_today + 1,
    };

    setEarnings(updatedEarnings);
    setViewedAds((prev) => {
      const next = [newAd, ...prev].slice(0, 50);
      try {
        localStorage.setItem(`pathixo_viewed_ads_${deviceId}`, JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      localStorage.setItem(`pathixo_earnings_${deviceId}`, JSON.stringify(updatedEarnings));
    } catch {}

    // Post to API backend
    try {
      fetch('/api/events/impression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: [
            {
              event_id: newAd.id,
              ad_id: 'cmp_demo_cursor',
              ad_token: 'tok_demo',
              device_id: deviceId,
              timestamp: Date.now(),
              dwell_ms: Math.round(dwellSec * 1000),
              ai_platform: platform.toLowerCase().includes('claude') ? 'claude' : 'chatgpt',
            },
          ],
        }),
      }).catch(() => {});
    } catch {}
  };

  const clearHistory = () => {
    setViewedAds([]);
    try {
      localStorage.removeItem(`pathixo_viewed_ads_${deviceId}`);
    } catch {}
  };

  const fullReferralUrl = `https://pathixorewards.com/?ref=${referralCode || deviceId || 'member'}`;
  const minThreshold = 2.0;
  const canCashout = earnings.balance_usd >= minThreshold;
  const progressPercent = Math.min(100, Math.round((earnings.balance_usd / minThreshold) * 100));

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(fullReferralUrl);
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
          device_id: deviceId,
          amount_usd: earnings.balance_usd,
          payout_method: payoutMethod,
          payout_destination: destination,
          user_email: userSession?.email,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCashoutSuccess(data.message || 'Payout request received and queued for instant settlement!');
        const cashedAmount = earnings.balance_usd;
        const updated: UserEarnings = {
          ...earnings,
          balance_usd: 0.0,
          lifetime_cashouts_usd: Number(((earnings.lifetime_cashouts_usd || 0) + cashedAmount).toFixed(4)),
        };
        setEarnings(updated);
        try {
          localStorage.setItem(`pathixo_earnings_${deviceId}`, JSON.stringify(updated));
        } catch {}

        // Notify extension overlay to reset balance
        window.postMessage({ type: 'PATHIXO_CASHOUT_SUCCESS', earnings: updated }, '*');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCashoutSubmitting(false);
    }
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('pathixo_auth_session');
      window.dispatchEvent(new Event('pathixo_auth_change'));
    } catch {}
    router.replace('/login');
  };

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

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
          The rewards dashboard is only accessible when signed in with your account.
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
      {/* MINIMAL STANDALONE DASHBOARD HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#070a0e]/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
            title="Back to Pathixo Rewards Home"
          >
            <img src={`${basePath}/pathixo-rewards.svg`} alt="Pathixo Rewards" className="h-8 w-8 object-contain" />
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                Pathixo Rewards
              </span>
              <span className="text-[10px] text-slate-400 font-medium">User Rewards Console</span>
            </div>
          </Link>

          {/* Right Header Status Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {userSession && (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-800 bg-[#0d121c] px-3 py-1 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="font-mono text-xs">{userSession.email}</span>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-full border border-slate-800 bg-[#0d121c] px-3 py-1 text-xs font-medium text-slate-400 hover:text-rose-400 hover:border-rose-900/50 transition cursor-pointer"
                  title="Sign out"
                >
                  Sign out
                </button>
              </div>
            )}

            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-800 bg-[#0d121c] px-3 py-1 text-xs text-slate-400">
              <span className="text-slate-500">Device:</span>
              <span className="font-mono text-slate-300 font-semibold">{deviceId.slice(0, 10)}...</span>
            </div>

            {extensionConnected ? (
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Extension Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-[#0d121c] px-3 py-1 text-xs font-medium text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                <span>Extension Ready</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ADMIN IMPERSONATION BANNER */}
      {isImpersonating && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 sm:px-10 py-3 flex items-center justify-between text-xs text-amber-200 sticky top-16 z-40 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Admin Impersonation Mode:</strong> Viewing rewards console for device{' '}
              <code className="font-mono bg-amber-950/60 px-1.5 py-0.5 rounded text-amber-300">{deviceId}</code>{' '}
              in read-only inspection mode.
            </span>
          </div>
          <Link
            href="/admin"
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition shrink-0 ml-4"
          >
            Return to Admin Console →
          </Link>
        </div>
      )}

      {/* DASHBOARD CONTENT BODY */}
      <main className="flex-1 py-8 sm:py-10">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 space-y-7">

          {/* ONBOARDING SUCCESS BANNER */}
          {isNewLogin && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/50 p-4 text-emerald-200 text-sm flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-300">Account Linked Successfully!</p>
                  <p className="text-xs text-emerald-400/90 mt-0.5">
                    Your session is synced. Keep using ChatGPT, Claude, and Gemini to accumulate earnings!
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono bg-emerald-900/60 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-700/50 hidden sm:inline-block">
                {userSession?.email || 'Logged In'}
              </span>
            </div>
          )}

          {/* WELCOME BANNER & METRICS */}
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Your Rewards &amp; Payouts
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
                Track your wait-time earnings, review live impressions during AI thinking mode, and request instant cashouts.
              </p>
            </div>

            {/* 4 CORE METRIC TILES */}
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Available Balance */}
              <div className="rounded-xl border border-emerald-500/30 bg-[#0d141e] p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Available Balance</span>
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
                  ${earnings.balance_usd.toFixed(4)}
                </div>
                <p className="mt-1.5 text-[11px] font-medium text-emerald-400">
                  {canCashout ? '✓ Ready for instant cashout' : `$${(minThreshold - earnings.balance_usd).toFixed(2)} to $2.00 cashout floor`}
                </p>
              </div>

              {/* Today's Views */}
              <div className="rounded-xl border border-slate-800 bg-[#0d121c] p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today&apos;s Verified Views</span>
                  <Clock className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
                  {earnings.impressions_today}
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">Across ChatGPT, Claude &amp; Gemini</p>
              </div>

              {/* Lifetime Cashouts */}
              <div className="rounded-xl border border-slate-800 bg-[#0d121c] p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Lifetime Cashouts</span>
                  <TrendingUp className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
                  ${(earnings.lifetime_cashouts_usd || 0).toFixed(2)}
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">Settled via instant rails</p>
              </div>

              {/* Referral Commission (Clicks to dedicated Referrals page) */}
              <Link
                href="/dashboard/referrals"
                className="group rounded-xl border border-slate-800 bg-[#0d121c] p-4 sm:p-5 shadow-xs hover:border-emerald-500/50 hover:bg-[#0f1724] transition-all cursor-pointer block"
                title="View dedicated Referrals dashboard"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-400 transition-colors">
                    Referral Commission
                  </span>
                  <Share2 className="h-4 w-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-400">
                  ${earnings.referral_bonus_usd.toFixed(2)}
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>10% weekly royalty</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform whitespace-nowrap shrink-0">
                    View Details <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* TWO-COLUMN WORKSPACE: CASHOUT TERMINAL + REFERRAL QUICK HUB */}
          <div className="grid gap-5 lg:grid-cols-12 items-start">

            {/* CASHOUT TERMINAL (7 cols) */}
            <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0d121c] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Instant Redemption</span>
                  <h2 className="mt-0.5 text-lg sm:text-xl font-bold text-white">Withdraw your earnings</h2>
                </div>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
                  $2.00 Floor
                </span>
              </div>

              {/* Threshold Progress Bar */}
              <div className="rounded-lg bg-[#090d14] p-3 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Threshold Progress</span>
                  <span className="text-emerald-400 font-mono">
                    ${earnings.balance_usd.toFixed(2)} / $2.00 ({progressPercent}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {cashoutSuccess ? (
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/30 p-4 text-center space-y-1.5">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
                  <h3 className="font-bold text-white text-sm">Transfer Initiated!</h3>
                  <p className="text-xs text-emerald-300/80">{cashoutSuccess}</p>
                  <button
                    type="button"
                    onClick={() => setCashoutSuccess(null)}
                    className="mt-1 text-xs text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Make another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCashout} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Select Payout Rail</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('upi')}
                        className={`rounded-lg py-2 px-2.5 text-xs font-bold border transition text-center cursor-pointer ${
                          payoutMethod === 'upi'
                            ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 shadow-xs'
                            : 'border-slate-800 bg-[#090d14] text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        UPI (India Instant)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('paypal')}
                        className={`rounded-lg py-2 px-2.5 text-xs font-bold border transition text-center cursor-pointer ${
                          payoutMethod === 'paypal'
                            ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 shadow-xs'
                            : 'border-slate-800 bg-[#090d14] text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        PayPal (Global)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('gift_card')}
                        className={`rounded-lg py-2 px-2.5 text-xs font-bold border transition text-center cursor-pointer ${
                          payoutMethod === 'gift_card'
                            ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 shadow-xs'
                            : 'border-slate-800 bg-[#090d14] text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        Amazon Card
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
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
                      className="w-full rounded-lg border border-slate-800 bg-[#090d14] px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!canCashout || isCashoutSubmitting || isImpersonating}
                    className="w-full rounded-lg bg-[#10b981] py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-[#0ea371] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isImpersonating
                      ? 'Cashout Disabled During Admin Impersonation'
                      : isCashoutSubmitting
                      ? 'Processing Transfer...'
                      : canCashout
                      ? `Cash out $${earnings.balance_usd.toFixed(2)} Now`
                      : 'Minimum $2.00 Floor Required to Cash Out'}
                  </button>
                </form>
              )}
            </div>

            {/* COMFY REFERRAL QUICK HUB (5 cols) */}
            <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0d121c] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Referral Program</span>
                  <h2 className="mt-0.5 text-lg sm:text-xl font-bold text-white">Invite &amp; Earn 10%</h2>
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  Weekly Royalty
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Earn a 10% weekly royalty on verified wait-time impressions from developers who join through your unique link.
              </p>

              {/* Permanent Referral Link Box */}
              <div className="rounded-lg border border-slate-800 bg-[#090d14] p-2.5 flex items-center justify-between gap-2">
                <span className="truncate text-xs font-mono text-slate-300 select-all">{fullReferralUrl}</span>
                <button
                  type="button"
                  onClick={handleCopyReferral}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-500 transition cursor-pointer"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Quick 2-stat summary */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-lg bg-[#090d14] p-2.5 border border-slate-800">
                  <span className="text-slate-400 block text-[11px] mb-0.5">Friends Referred</span>
                  <strong className="text-base font-bold text-white">{earnings.referral_count}</strong>
                </div>
                <div className="rounded-lg bg-[#090d14] p-2.5 border border-slate-800">
                  <span className="text-slate-400 block text-[11px] mb-0.5">Total Royalty</span>
                  <strong className="text-base font-bold text-emerald-400">${earnings.referral_bonus_usd.toFixed(2)}</strong>
                </div>
              </div>

              {/* Dedicated Referral Link Navigation */}
              <Link
                href="/dashboard/referrals"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition"
              >
                <span>View Full Referrals Dashboard &amp; Peers</span>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
              </Link>
            </div>

          </div>

          {/* ADS SEEN SO FAR (AD HISTORY LOG) */}
          <div className="rounded-xl border border-slate-800 bg-[#0d121c] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Ads seen so far</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Live history of sponsored messages displayed during your AI wait times.
                </p>
              </div>

              {/* Action & Sync Controls */}
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-950/50 border border-emerald-800/40 px-2.5 py-1 rounded-lg">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Live Sync</span>
                </div>

                <button
                  type="button"
                  onClick={simulateTestImpression}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                  title="Simulate a verified 4s wait impression"
                >
                  <Play className="h-3 w-3 text-emerald-400" />
                  <span>Simulate Wait</span>
                </button>

                {viewedAds.length > 0 && (
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition cursor-pointer px-1 py-1"
                    title="Clear history"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Table / List */}
            {viewedAds.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 bg-[#090d14]/60 py-12 px-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/60 text-slate-400 mb-3">
                  <Clock className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-white">No ads viewed yet</h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  Start chatting on ChatGPT, Claude, Gemini, Perplexity, or DeepSeek. Sponsored lines shown during thinking mode will automatically appear here with real-time earnings.
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={simulateTestImpression}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold hover:underline cursor-pointer"
                  >
                    <Play className="h-3 w-3" />
                    <span>Simulate a test wait impression to see live updates</span>
                  </button>
                </div>
              </div>
            ) : (
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
                          {formatTimeAgo(ad.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>
                {viewedAds.length === 0
                  ? '0 impressions recorded'
                  : `Showing ${viewedAds.length} verified impression${viewedAds.length === 1 ? '' : 's'}`}
              </span>
              <span>
                {viewedAds.length === 0 ? 'Minimum 4s wait dwell to qualify' : 'Credits deposited in real-time'}
              </span>
            </div>
          </div>

        </div>
      </main>

      {/* MINIMAL STANDALONE DASHBOARD FOOTER */}
      <footer className="border-t border-slate-800/80 bg-[#070a0e] py-8 text-xs text-slate-500">
        <div className="mx-auto flex w-full max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-6 sm:px-10">
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
