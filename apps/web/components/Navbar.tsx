'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { ChromeIcon } from './StopWaitingSection';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#070a0e]/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-14 py-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 transition-opacity hover:opacity-90">
          <img src={`${basePath}/icon.svg`} alt="Pathixo Rewards" className="h-7 w-7 rounded-lg" />
          <span className="text-xl font-bold tracking-tight text-white">Pathixo Rewards</span>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden items-center gap-7 lg:gap-8 text-sm font-medium text-slate-400 md:flex">
          <Link href="#how-it-works" className="transition-colors hover:text-white">
            How it works
          </Link>
          <Link href="#faq" className="transition-colors hover:text-white">
            FAQ
          </Link>
          <Link href="/advertise" className="transition-colors hover:text-white">
            Advertise
          </Link>
          <Link href="/advertise/manage" className="transition-colors hover:text-white">
            Ads Manager
          </Link>
        </nav>

        {/* Action Buttons & Mobile Toggle */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            Dashboard
          </Link>
          <a
            href="https://github.com/jhaabhijeet864/Pathixo_Rewards"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10b981] px-4 py-2 text-sm font-bold text-white shadow-sm shadow-emerald-500/20 transition-all hover:bg-[#0ea371] hover:shadow-emerald-500/40 whitespace-nowrap"
          >
            <ChromeIcon className="h-4 w-4" />
            <span>Add to Chrome</span>
          </a>

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
        <div className="border-b border-slate-800 bg-[#090d14] px-6 py-4 md:hidden">
          <div className="flex flex-col space-y-3 text-base font-medium text-slate-300">
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              How it works
            </Link>
            <Link
              href="#faq"
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
            <Link
              href="/advertise/manage"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Ads Manager
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}