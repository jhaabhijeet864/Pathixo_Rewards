'use client';

import Link from 'next/link';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <img src="/icon.svg" alt="Pathixo Rewards" className="h-7 w-7 rounded-md" />
          <span className="text-lg font-bold tracking-tight text-slate-900">Pathixo Rewards</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 sm:flex">
          <Link href="#how-it-works" className="transition-colors hover:text-slate-900">
            How it works
          </Link>
          <Link href="#calculator" className="transition-colors hover:text-slate-900">
            Earnings
          </Link>
          <Link href="/advertise" className="transition-colors hover:text-slate-900">
            Advertise
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-slate-900">
            Privacy
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3.5">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Dashboard
          </Link>
          <a
            href="https://github.com/jhaabhijeet864/Pathixo_Rewards"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            Add to Chrome — Free
          </a>
        </div>
      </div>
    </header>
  );
}
