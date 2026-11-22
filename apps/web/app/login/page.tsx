'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, CheckCircle2, Laptop, AlertTriangle } from 'lucide-react';
import { isSuperAdminEmail } from '@/lib/admin-auth';

interface AuthSessionUser {
  email: string;
  name: string;
  avatar_url?: string;
  provider: 'google' | 'github';
  logged_in: boolean;
  logged_in_at: string;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  const source = searchParams?.get('source') || 'web';
  const paramDeviceId = searchParams?.get('deviceId') || '';

  const [extensionDetected, setExtensionDetected] = useState(false);
  const [resolvedDeviceId, setResolvedDeviceId] = useState(paramDeviceId);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signedInUser, setSignedInUser] = useState<AuthSessionUser | null>(null);
  const [isLocalHost, setIsLocalHost] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customTestEmail, setCustomTestEmail] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocal =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '::1' ||
        window.location.hostname.endsWith('.local');
      setIsLocalHost(isLocal);

      let currentId = paramDeviceId || localStorage.getItem('pathixo_device_id') || '';
      if (!currentId) {
        currentId = `dev_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
        localStorage.setItem('pathixo_device_id', currentId);
      }
      setResolvedDeviceId(currentId);
    }

    // Listen for extension detection ping/pong
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'PATHIXO_EXTENSION_DETECTED' || event.data.type === 'PATHIXO_EXTENSION_PONG') {
        setExtensionDetected(true);
        if (event.data.deviceId) {
          setResolvedDeviceId(event.data.deviceId);
          localStorage.setItem('pathixo_device_id', event.data.deviceId);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    window.postMessage({ type: 'PATHIXO_PING_EXTENSION' }, '*');

    // Check if user is already signed in
    try {
      const stored = localStorage.getItem('pathixo_auth_session');
      if (stored) {
        const parsed = JSON.parse(stored) as AuthSessionUser;
        if (parsed.logged_in) {
          setSignedInUser(parsed);
        }
      }
    } catch {
      // Ignore local storage error
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [paramDeviceId]);

  const handleSignIn = (provider: 'google' | 'github') => {
    setErrorMessage(null);

    // CRITICAL SECURITY ENFORCEMENT:
    // Stub login with 'user@gmail.com' is strictly restricted to local development environments.
    // In production / deployed domains, fake stub authentication is strictly prohibited.
    if (!isLocalHost) {
      setErrorMessage(
        'Production OAuth provider integration required. The development bypass is restricted to localhost environments.'
      );
      return;
    }

    setIsSigningIn(true);

    const email = customTestEmail.trim()
      ? customTestEmail.trim().toLowerCase()
      : provider === 'google'
      ? 'user@gmail.com'
      : 'user@github.com';

    const user: AuthSessionUser = {
      email,
      name: provider === 'google' ? 'Google User' : 'GitHub User',
      provider,
      logged_in: true,
      logged_in_at: new Date().toISOString(),
    };

    try {
      localStorage.setItem('pathixo_auth_session', JSON.stringify(user));
    } catch {
      // Local storage fallback
    }

    // Register user & device in backend store
    const targetDevice = resolvedDeviceId || `dev_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
    fetch(`/api/user/earnings?device_id=${encodeURIComponent(targetDevice)}&email=${encodeURIComponent(email)}`)
      .catch(() => {});

    // Bridge authentication session to Chrome extension via postMessage
    window.postMessage(
      {
        type: 'PATHIXO_AUTH_LOGIN',
        user,
      },
      '*'
    );

    setSignedInUser(user);

    // Automatic route resolution: Superadmin -> /admin, Normal User -> /dashboard
    setTimeout(() => {
      if (isSuperAdminEmail(email)) {
        localStorage.setItem(
          'pathixo_admin_session',
          JSON.stringify({ ...user, role: 'superadmin' })
        );
        router.push('/admin');
      } else {
        router.push(`/dashboard?device_id=${encodeURIComponent(targetDevice)}&login=success`);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30">
      {/* Minimal Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-black text-lg tracking-tight text-white hover:text-emerald-400 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-base shadow-sm">
              P
            </div>
            <span>Pathixo Rewards</span>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            ← Back to Homepage
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Top Glow Accent */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/15 blur-3xl pointer-events-none rounded-full" />

            {/* Logo & Brand Mark */}
            <div className="flex justify-center mb-5">
              <Link href="/" className="group transition-transform hover:scale-105" title="Back to Home">
                <img src={`${basePath}/pathixo-rewards.svg`} alt="Pathixo Rewards" className="h-12 w-12 object-contain" />
              </Link>
            </div>

            {/* Environment & Connection Pill */}
            <div className="flex flex-col items-center gap-2 mb-6">
              {isLocalHost ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-950/60 border border-amber-800/60 text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Local Development Environment
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-800/60 border border-slate-700/60 text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Production Domain Protected
                </div>
              )}

              {extensionDetected ? (
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-medium bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Extension Connected
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-medium bg-slate-800/60 border border-slate-700/60 text-slate-300">
                  <Laptop className="w-3.5 h-3.5 text-slate-400" />
                  {source === 'extension' ? 'Linking Extension' : 'Direct Web Console'}
                </div>
              )}
            </div>

            {/* Heading */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                Sign in to Pathixo
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Connect your account to activate your wait-time reward overlay and start earning $0.009 for every AI prompt wait.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-red-950/70 border border-red-700/60 flex items-start gap-2.5 text-red-200 text-xs">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Toast */}
            {signedInUser && (
              <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-700/60 flex items-center gap-3 text-emerald-200 text-xs font-medium animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Signed in as <strong>{signedInUser.email}</strong>! Redirecting to rewards console...
                </span>
              </div>
            )}

            {/* Auth Buttons */}
            <div className="space-y-3">
              {/* Google OAuth Button */}
              <button
                type="button"
                disabled={isSigningIn}
                onClick={() => handleSignIn('google')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-slate-900 hover:bg-slate-100 font-semibold text-sm rounded-xl transition duration-150 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                {isLocalHost ? 'Continue with Google (user@gmail.com)' : 'Continue with Google'}
              </button>

              {/* GitHub OAuth Button */}
              <button
                type="button"
                disabled={isSigningIn}
                onClick={() => handleSignIn('github')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-800 hover:bg-slate-700/80 text-white font-semibold text-sm rounded-xl border border-slate-700 transition duration-150 disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                {isLocalHost ? 'Continue with GitHub (user@github.com)' : 'Continue with GitHub'}
              </button>
            </div>

            {/* Local Dev Custom Email Switcher */}
            {isLocalHost && (
              <div className="mt-4 pt-3 border-t border-slate-800/60">
                <label className="block text-[11px] text-slate-400 mb-1">
                  Or test with custom email (Local Dev only):
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="custom_test@domain.com"
                    value={customTestEmail}
                    onChange={(e) => setCustomTestEmail(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-800 bg-[#070a0e] px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSignIn('google')}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 cursor-pointer"
                  >
                    Test Login
                  </button>
                </div>
              </div>
            )}

            {/* Privacy & Cashout Guarantees */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2">
              <div className="flex items-start gap-2.5 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero Chat Tracking:</strong> The extension operates inside isolated Shadow DOM and never inspects prompts or LLM output.
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Instant $2 Payouts:</strong> Withdraw earnings directly to UPI (India Instant), PayPal, or Gift Cards.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-400">
        <p>© 2026 Pathixo AI Labs. All rights reserved. Open source wait-time monetization.</p>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          Loading login session...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
