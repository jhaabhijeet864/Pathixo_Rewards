'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  AlertTriangle,
  Power,
  LogOut,
  ExternalLink,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { isSuperAdminEmail } from '@/lib/admin-auth';
import type { CircuitBreakerKey } from '@pathixo/shared';

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [circuitBreakers, setCircuitBreakers] = useState<Record<CircuitBreakerKey, boolean>>({
    PAUSE_PAID_ADS: false,
    EXTENSION_MAINTENANCE: false,
    FREEZE_PAYOUTS: false,
  });
  const [loadingBreakers, setLoadingBreakers] = useState(false);
  const [updatingKey, setUpdatingKey] = useState<CircuitBreakerKey | null>(null);

  // Check superadmin session
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let email = '';
    try {
      const adminSession = localStorage.getItem('pathixo_admin_session');
      if (adminSession) {
        const parsed = JSON.parse(adminSession);
        if (parsed.email && isSuperAdminEmail(parsed.email)) {
          email = parsed.email;
        }
      }

      if (!email) {
        const authSession = localStorage.getItem('pathixo_auth_session');
        if (authSession) {
          const parsed = JSON.parse(authSession);
          if (parsed.email && isSuperAdminEmail(parsed.email)) {
            email = parsed.email;
            localStorage.setItem(
              'pathixo_admin_session',
              JSON.stringify({ ...parsed, role: 'superadmin' })
            );
          }
        }
      }
    } catch {
      // Storage read error
    }

    if (email && isSuperAdminEmail(email)) {
      setAdminEmail(email);
      setAuthorized(true);
    } else {
      setAuthorized(false);
      // Give a tiny grace period for display or redirect
      const timer = setTimeout(() => {
        router.push('/login?source=admin&error=admin_required');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [router]);

  // Load circuit breakers
  const fetchBreakers = useCallback(async () => {
    if (!adminEmail) return;
    try {
      setLoadingBreakers(true);
      const res = await fetch('/api/admin/circuit-breakers', {
        headers: {
          'x-admin-email': adminEmail,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.circuit_breakers) {
          setCircuitBreakers(data.circuit_breakers);
        }
      }
    } catch {
      // Ignore network errors in offline/dev
    } finally {
      setLoadingBreakers(false);
    }
  }, [adminEmail]);

  useEffect(() => {
    if (authorized && adminEmail) {
      fetchBreakers();
    }
  }, [authorized, adminEmail, fetchBreakers]);

  const toggleCircuitBreaker = async (key: CircuitBreakerKey) => {
    const nextVal = !circuitBreakers[key];
    setUpdatingKey(key);
    try {
      const res = await fetch('/api/admin/circuit-breakers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail,
        },
        body: JSON.stringify({
          breaker_key: key,
          is_tripped: nextVal,
          reason: `Toggled via Admin Console top emergency bar to ${nextVal}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.circuit_breakers) {
          setCircuitBreakers(data.circuit_breakers);
        } else {
          setCircuitBreakers((prev) => ({ ...prev, [key]: nextVal }));
        }
      } else {
        // Fallback local toggle
        setCircuitBreakers((prev) => ({ ...prev, [key]: nextVal }));
      }
    } catch {
      setCircuitBreakers((prev) => ({ ...prev, [key]: nextVal }));
    } finally {
      setUpdatingKey(null);
    }
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('pathixo_admin_session');
    } catch {}
    router.push('/login');
  };

  // Auth checking state
  if (authorized === null) {
    return (
      <div className="min-h-screen bg-[#070a0e] text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-white">Verifying Superadmin Credentials</h2>
            <p className="text-xs text-slate-400 mt-1">Validating allowlist identity against secure enclave...</p>
          </div>
        </div>
      </div>
    );
  }

  // Unauthorized state
  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#070a0e] text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0d121c] border border-rose-500/30 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Superadmin Access Required</h1>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              This console is strictly restricted to authorized administrators.
              Access requires signing in with{' '}
              <span className="font-mono text-emerald-400 font-semibold">jhaabhijeet864@gmail.com</span>.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login?source=admin"
              className="inline-flex items-center justify-center w-full px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/10"
            >
              Sign In with Authorized Admin Account →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const anyBreakerTripped =
    circuitBreakers.PAUSE_PAID_ADS ||
    circuitBreakers.EXTENSION_MAINTENANCE ||
    circuitBreakers.FREEZE_PAYOUTS;

  return (
    <div className="min-h-screen bg-[#070a0e] text-slate-100 font-sans flex flex-col">
      {/* 1. EMERGENCY GLOBAL CIRCUIT BREAKER BAR */}
      <div
        className={`border-b transition-colors px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs z-50 ${
          anyBreakerTripped
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            : 'bg-[#0a0f18] border-slate-800 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {anyBreakerTripped ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          ) : (
            <Power className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="font-bold tracking-wide uppercase text-[11px] text-slate-200">
            Emergency Circuit Breakers:
          </span>
          <span className="text-slate-400 hidden md:inline text-[11px]">
            Master network kill switches with immediate propagation
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Switch 1: Pause Paid Ads */}
          <button
            type="button"
            onClick={() => toggleCircuitBreaker('PAUSE_PAID_ADS')}
            disabled={updatingKey === 'PAUSE_PAID_ADS'}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
              circuitBreakers.PAUSE_PAID_ADS
                ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 hover:bg-rose-900/80'
                : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
            title="When active, paid ads are suppressed and 100% fallback to House Ads (Vakxo, Pathixo, KrocPDF, Blip) occurs."
          >
            <span
              className={`w-2 h-2 rounded-full ${
                circuitBreakers.PAUSE_PAID_ADS ? 'bg-rose-400 animate-ping' : 'bg-slate-600'
              }`}
            />
            <span>Paid Ads: {circuitBreakers.PAUSE_PAID_ADS ? 'PAUSED (House Only)' : 'Active'}</span>
          </button>

          {/* Switch 2: Extension Maintenance */}
          <button
            type="button"
            onClick={() => toggleCircuitBreaker('EXTENSION_MAINTENANCE')}
            disabled={updatingKey === 'EXTENSION_MAINTENANCE'}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
              circuitBreakers.EXTENSION_MAINTENANCE
                ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 hover:bg-amber-900/80'
                : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
            title="When active, all extensions pause ad display for maintenance."
          >
            <span
              className={`w-2 h-2 rounded-full ${
                circuitBreakers.EXTENSION_MAINTENANCE ? 'bg-amber-400 animate-ping' : 'bg-slate-600'
              }`}
            />
            <span>Extensions: {circuitBreakers.EXTENSION_MAINTENANCE ? 'MAINTENANCE' : 'Online'}</span>
          </button>

          {/* Switch 3: Freeze Payouts */}
          <button
            type="button"
            onClick={() => toggleCircuitBreaker('FREEZE_PAYOUTS')}
            disabled={updatingKey === 'FREEZE_PAYOUTS'}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
              circuitBreakers.FREEZE_PAYOUTS
                ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 hover:bg-rose-900/80'
                : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
            title="When active, new cashout submissions are frozen."
          >
            <span
              className={`w-2 h-2 rounded-full ${
                circuitBreakers.FREEZE_PAYOUTS ? 'bg-rose-400 animate-ping' : 'bg-slate-600'
              }`}
            />
            <span>Payouts: {circuitBreakers.FREEZE_PAYOUTS ? 'FROZEN' : 'Active'}</span>
          </button>

          <button
            type="button"
            onClick={fetchBreakers}
            className="p-1 rounded text-slate-400 hover:text-white transition"
            title="Refresh breaker statuses"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingBreakers ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. MASTER ADMIN HEADER */}
      <header className="border-b border-slate-800/90 bg-[#070a0e]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 sm:px-10 py-3.5">
          {/* Left Brand */}
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-3 group transition-opacity hover:opacity-90"
            >
              <img
                src={`${basePath}/pathixo-rewards.svg`}
                alt="Pathixo Rewards"
                className="h-8 w-8 object-contain"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                    Pathixo Rewards
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
                    SUPERADMIN
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Master Command Center</span>
              </div>
            </Link>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/dashboard"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-[#0d121c] text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition"
              title="Open User Rewards Console"
            >
              <span>User Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </Link>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-800 bg-[#0d121c] text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] text-emerald-300 font-semibold">{adminEmail}</span>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 bg-[#0d121c] text-xs font-semibold text-slate-400 hover:text-rose-400 hover:border-rose-900/60 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. MAIN WORKSPACE */}
      <main className="flex-1 py-8 sm:py-10">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
          {children}
        </div>
      </main>

      {/* 4. FOOTER */}
      <footer className="border-t border-slate-900 bg-[#05070a] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>Pathixo Master Control Enclave &bull; Strictly Confidential</span>
          </div>
          <div>
            <span>Grievances / Direct Escalations: </span>
            <a href="mailto:founder@pathixo.com" className="text-slate-400 hover:text-white font-mono underline">
              founder@pathixo.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070a0e] text-slate-100 flex items-center justify-center p-6">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
            <span className="text-sm font-semibold text-slate-300">Loading Command Center...</span>
          </div>
        </div>
      }
    >
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </Suspense>
  );
}
