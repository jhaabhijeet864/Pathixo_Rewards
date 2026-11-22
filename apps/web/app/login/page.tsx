'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { isSuperAdminEmail } from '@/lib/admin-auth';

interface AuthSessionUser {
  email: string;
  name: string;
  avatar_url?: string;
  provider: 'google' | 'github' | 'email';
  logged_in: boolean;
  logged_in_at: string;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  const paramDeviceId = searchParams?.get('deviceId') || '';
  const paramError = searchParams?.get('error') || '';

  const [resolvedDeviceId, setResolvedDeviceId] = useState(paramDeviceId);
  const [emailInput, setEmailInput] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signedInUser, setSignedInUser] = useState<AuthSessionUser | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    paramError === 'admin_required' ? 'Superadmin privileges required to access the admin console.' : null
  );

  // Quick OAuth modal state (if clicking Google/GitHub without typing an email)
  const [oauthModalProvider, setOauthModalProvider] = useState<'google' | 'github' | null>(null);
  const [oauthModalEmail, setOauthModalEmail] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
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

  const executeSignIn = (
    emailToUse: string,
    provider: 'google' | 'github' | 'email' = 'email'
  ) => {
    const email = emailToUse.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setErrorMessage(null);
    setIsSigningIn(true);
    setOauthModalProvider(null);

    const user: AuthSessionUser = {
      email,
      name:
        email === 'jhaabhijeet864@gmail.com'
          ? 'Abhijeet Jha'
          : provider === 'google'
          ? 'Google User'
          : provider === 'github'
          ? 'GitHub User'
          : email.split('@')[0],
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

    // Dynamic Route Resolution:
    // Superadmin email -> /admin
    // Normal User -> /dashboard
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
    }, 500);
  };

  const handleOAuthClick = (provider: 'google' | 'github') => {
    if (emailInput.trim()) {
      executeSignIn(emailInput, provider);
    } else {
      setOauthModalProvider(provider);
      setOauthModalEmail('');
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSignIn(emailInput, 'email');
  };

  return (
    <div className="min-h-screen bg-[#070a0e] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30 font-sans antialiased">
      {/* Minimal Header */}
      <header className="border-b border-slate-800/80 bg-[#070a0e]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-base tracking-tight text-white hover:text-emerald-400 transition"
          >
            <img src={`${basePath}/pathixo-rewards.svg`} alt="Pathixo Rewards" className="h-8 w-8 object-contain" />
            <span>Pathixo Rewards</span>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-[#0d121c] border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl relative">
            {/* Top Glow Accent */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

            {/* Brand Logo & Heading */}
            <div className="text-center mb-7">
              <Link href="/" className="inline-block transition-transform hover:scale-105 mb-4">
                <img src={`${basePath}/pathixo-rewards.svg`} alt="Pathixo" className="h-12 w-12 object-contain mx-auto" />
              </Link>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Sign in to Pathixo
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                Enter your account to access your rewards dashboard and sync with the browser extension.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/70 border border-rose-700/60 flex items-center gap-2.5 text-rose-200 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Toast */}
            {signedInUser && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-700/60 flex items-center gap-3 text-emerald-200 text-xs font-semibold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Signed in as <strong>{signedInUser.email}</strong>! Redirecting...
                </span>
              </div>
            )}

            {/* Social OAuth Buttons */}
            <div className="space-y-3">
              {/* Google Button */}
              <button
                type="button"
                disabled={isSigningIn}
                onClick={() => handleOAuthClick('google')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm rounded-xl transition duration-150 shadow-sm disabled:opacity-50 cursor-pointer"
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
                <span>Continue with Google</span>
              </button>

              {/* GitHub Button */}
              <button
                type="button"
                disabled={isSigningIn}
                onClick={() => handleOAuthClick('github')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#161f30] hover:bg-[#1a253a] text-white font-bold text-sm rounded-xl border border-slate-700/80 transition duration-150 disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>Continue with GitHub</span>
              </button>
            </div>

            {/* Minimal Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0d121c] px-3 text-slate-500 font-medium">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Email Direct Input */}
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <div>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-[#070a0e] px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSigningIn || !emailInput.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Continue with Email</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Terms & Privacy Footnote */}
            <p className="text-[11px] text-slate-500 text-center mt-6">
              By continuing, you agree to Pathixo&apos;s{' '}
              <Link href="/terms" className="underline hover:text-slate-300">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline hover:text-slate-300">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </main>

      {/* Standard OAuth Account Selector Modal (when clicking Google/GitHub with empty email) */}
      {oauthModalProvider && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0d121c] border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {oauthModalProvider === 'google' ? (
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
                ) : (
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                )}
                <span className="text-sm font-bold text-white capitalize">
                  Sign in with {oauthModalProvider}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOauthModalProvider(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Choose an account to continue to Pathixo:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => executeSignIn('jhaabhijeet864@gmail.com', oauthModalProvider)}
                className="w-full text-left p-3 rounded-xl bg-[#070a0e] border border-slate-800 hover:border-emerald-500/50 hover:bg-[#0a0f18] transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Abhijeet Jha
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">jhaabhijeet864@gmail.com</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  Admin
                </span>
              </button>

              <button
                type="button"
                onClick={() => executeSignIn('user@gmail.com', oauthModalProvider)}
                className="w-full text-left p-3 rounded-xl bg-[#070a0e] border border-slate-800 hover:border-slate-700 hover:bg-[#0a0f18] transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-white">Member User</div>
                  <div className="text-[11px] font-mono text-slate-400">user@gmail.com</div>
                </div>
                <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                  Member
                </span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (oauthModalEmail.trim()) {
                    executeSignIn(oauthModalEmail, oauthModalProvider);
                  }
                }}
                className="space-y-2"
              >
                <label className="block text-[11px] text-slate-400 font-medium">
                  Or enter your account email:
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={oauthModalEmail}
                    onChange={(e) => setOauthModalEmail(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-800 bg-[#070a0e] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Pathixo AI Labs. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070a0e] flex items-center justify-center text-slate-400">
          Loading sign in...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
