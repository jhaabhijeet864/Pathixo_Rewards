import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#070a0e] text-white">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <span className="rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 mb-4">
          404 Not Found
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
          Page Not Found
        </h1>
        <p className="mt-4 max-w-md text-sm text-slate-400 leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been moved to another URL.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/"
            className="rounded-xl bg-[#10b981] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0ea371]"
          >
            Back to Home
          </Link>
          <Link
            href="/advertise/manage"
            className="rounded-xl border border-slate-800 bg-[#0c121d] px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition"
          >
            Manage Campaign
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
