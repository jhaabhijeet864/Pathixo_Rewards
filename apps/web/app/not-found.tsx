import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AlertCircle, ArrowLeft, Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#070a0e] text-white selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20 text-center relative overflow-hidden">
        {/* Subtle Ambient Background Glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-96 rounded-full bg-emerald-500/5 blur-3xl" />

        <div className="relative z-10 max-w-lg mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 mb-6">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Error 404 • Page Not Found</span>
          </div>

          {/* Big Error Number */}
          <h1 className="text-7xl sm:text-8xl font-black tracking-tight text-white font-mono">
            4<span className="text-emerald-400">0</span>4
          </h1>

          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Lost in the AI Latency?
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed max-w-md mx-auto">
            The page you are looking for doesn&apos;t exist, was moved, or is waiting for the model to generate.
          </p>

          {/* Quick Helpful Nav Links */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 hover:-translate-y-0.5"
            >
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0d121c] px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
            >
              <Compass className="h-4 w-4 text-slate-400" />
              <span>Earnings Dashboard</span>
            </Link>

            <Link
              href="/advertise"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0d121c] px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
            >
              <span>Advertiser Portal</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
