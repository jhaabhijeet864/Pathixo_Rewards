'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight, Shield, Zap, Sparkles } from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#090d16]/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
        
        {/* Brand Identity */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-3 transition-transform hover:scale-[1.02]">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-[1.5px] shadow-glow">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#090d16]">
                <Sparkles className="h-4 w-4 text-cyan-400 transition-transform group-hover:rotate-12" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-white">Pathixo</span>
                <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-lg font-extrabold text-transparent">Rewards</span>
              </div>
              <span className="text-[10px] font-mono tracking-wider text-slate-400 -mt-1">60% REVENUE SHARE</span>
            </div>
          </Link>

          {/* Network Health Ticker */}
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>$2.00 Floor • Instant UPI / PayPal</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <Link href="#how-it-works" className="transition-colors hover:text-white">
            How It Works
          </Link>
          <Link href="#calculator" className="transition-colors hover:text-white">
            Calculator
          </Link>
          <Link href="#comparison" className="transition-colors hover:text-white">
            Why Pathixo
          </Link>
          <Link href="/advertise" className="transition-colors hover:text-cyan-400">
            Advertisers
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-white">
            Privacy
          </Link>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 backdrop-blur-sm transition hover:bg-white/[0.08] hover:text-white hover:border-white/[0.18]"
          >
            Dashboard
          </Link>
          <a
            href="https://github.com/jhaabhijeet864/Pathixo_Rewards"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 px-4 py-2 text-sm font-bold text-white shadow-glow transition-all hover:opacity-95 hover:shadow-glow-indigo"
          >
            <span>Add to Chrome</span>
            <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-extrabold text-white">
              Free
            </span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex md:hidden items-center justify-center rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/5"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-[#0c121e] px-6 py-5 md:hidden space-y-4 animate-in fade-in duration-200">
          <nav className="flex flex-col gap-3.5 text-base font-medium text-slate-300">
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white"
            >
              How It Works
            </Link>
            <Link
              href="#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white"
            >
              Earnings Calculator
            </Link>
            <Link
              href="#comparison"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white"
            >
              Why Pathixo vs Chatwait
            </Link>
            <Link
              href="/advertise"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-cyan-400"
            >
              Advertiser Space
            </Link>
            <Link
              href="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white"
            >
              Privacy &amp; Security
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white text-emerald-400 font-semibold"
            >
              User Dashboard ($2 Cashout)
            </Link>
          </nav>
          <div className="pt-2">
            <a
              href="https://github.com/jhaabhijeet864/Pathixo_Rewards"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-3 text-center text-sm font-bold text-white shadow-glow"
            >
              <span>Add to Chrome — Free Extension</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
