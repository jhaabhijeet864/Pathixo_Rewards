import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ShieldAlert, ArrowLeft, KeyRound, LogIn } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#070a0e] text-white selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20 text-center relative overflow-hidden">
        {/* Subtle Ambient Amber Glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-96 rounded-full bg-amber-500/5 blur-3xl" />

        <div className="relative z-10 max-w-lg mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-950/30 px-3.5 py-1 text-xs font-semibold text-amber-400 mb-6">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>401 / 403 • Access Restricted</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Authentication Required
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed max-w-md mx-auto">
            You do not have permission to view this resource. Please sign in or link your verified device to continue.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 hover:-translate-y-0.5"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In with Account</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0d121c] px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
            >
              <ArrowLeft className="h-4 w-4 text-slate-400" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
