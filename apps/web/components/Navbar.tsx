'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { ChromeIcon } from './StopWaitingSection';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  useEffect(() => {
    setIsMounted(true);

    const checkAuth = () => {
      try {
        const stored = localStorage.getItem('pathixo_auth_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          setIsLoggedIn(Boolean(parsed?.logged_in && parsed?.email));
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      }
    };

    checkAuth();

    // Listen for storage changes across tabs or custom dispatch on login/logout
    window.addEventListener('storage', checkAuth);
    window.addEventListener('pathixo_auth_change', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('pathixo_auth_change', checkAuth);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#070a0e]/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl lg:max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        {/* Left: Brand */}
        <div className="flex items-center flex-1 justify-start">
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 group transition-opacity hover:opacity-90"
            title="Pathixo Rewards Home"
          >
            <img src={`${basePath}/pathixo-rewards.svg`} alt="Pathixo Rewards" className="h-8 w-8 sm:h-9 sm:w-9 object-contain" />
            <span className="text-xl sm:text-[22px] font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              Pathixo Rewards
            </span>
          </Link>
        </div>

        {/* Center: Perfectly Centered Navigation Links */}
        <nav className="hidden md:flex items-center justify-center gap-8 lg:gap-10 text-sm font-medium text-slate-300">
          <Link href="/#how-it-works" className="transition-colors hover:text-white">
            How it works
          </Link>
          <Link href="/#faq" className="transition-colors hover:text-white">
            FAQ
          </Link>
          <Link href="/advertise" className="transition-colors hover:text-white">
            Advertise
          </Link>
        </nav>

        {/* Right: Actions & Dashboard / Login */}
        <div className="flex items-center flex-1 justify-end gap-4 sm:gap-6 shrink-0">
          {/* Default for non-login users is 'Login'; changes to 'Dashboard' when logged in */}
          {isMounted && isLoggedIn ? (
            <Link
              href="/dashboard"
              className="hidden md:inline-flex text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden md:inline-flex text-sm font-semibold text-slate-300 hover:text-emerald-400 transition-colors"
            >
              Login
            </Link>
          )}

          <Link
            href="/coming-soon"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10b981] px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-emerald-500/20 transition-all hover:bg-[#0ea371] hover:shadow-emerald-500/40 whitespace-nowrap cursor-pointer"
          >
            <ChromeIcon className="h-4 w-4" />
            <span>Add to Chrome</span>
          </Link>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-800 md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-[#090d14] px-6 py-5 md:hidden space-y-3">
          <div className="flex flex-col space-y-3 text-base font-medium text-slate-300">
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              How it works
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              FAQ
            </Link>
            <Link
              href="/advertise"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Advertise
            </Link>
            {isMounted && isLoggedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-emerald-400 font-semibold"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-slate-300 font-medium hover:text-white"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
