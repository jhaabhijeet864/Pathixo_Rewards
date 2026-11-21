'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 transition-opacity hover:opacity-90">
          <img src={`${basePath}/icon.svg`} alt="Pathixo Rewards" className="h-7 w-7 rounded-md" />
          <span className="text-lg font-bold tracking-tight text-slate-900">Pathixo Rewards</span>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden items-center gap-7 lg:gap-8 text-sm font-medium text-slate-600 md:flex">
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

        {/* Action Buttons & Mobile Toggle */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
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
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 whitespace-nowrap"
          >
            Add to Chrome — Free
          </a>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col space-y-2.5 text-sm font-medium text-slate-600">
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-slate-900"
            >
              How it works
            </Link>
            <Link
              href="#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-slate-900"
            >
              Earnings
            </Link>
            <Link
              href="/advertise"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-slate-900"
            >
              Advertise
            </Link>
            <Link
              href="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-slate-900"
            >
              Privacy
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
