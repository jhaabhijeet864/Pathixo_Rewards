import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HeroChatMockup } from '@/components/HeroChatMockup';
import { EarningsCalculator } from '@/components/EarningsCalculator';
import { FaqSection } from '@/components/FaqSection';
import { Download, ShieldCheck, Cpu, ArrowRight, Zap, CheckCircle2, Lock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-16 pb-24 sm:pt-28 sm:pb-36">
          <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14 text-center">
            {/* Pill tag */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              Open Source • Free Forever • 60% Revenue Share
            </div>

            {/* Main H1 Headline */}
            <h1 className="mt-8 text-5xl font-black tracking-tight text-slate-900 sm:text-7xl lg:text-8xl sm:leading-[1.05]">
              Get paid while AI thinks.
            </h1>

            {/* Plain English Subheadline */}
            <p className="mx-auto mt-6 max-w-4xl text-lg text-slate-600 sm:text-2xl sm:leading-relaxed">
              See one non-intrusive sponsored card while ChatGPT, Claude, Gemini, Perplexity, or DeepSeek generates your answer. Keep 60% of the ad revenue with instant cashouts starting at just $2.
            </p>

            {/* Primary Action Button */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="https://github.com/jhaabhijeet864/Pathixo_Rewards"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-2xl bg-emerald-600 px-8 py-4 text-base sm:text-lg font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 hover:shadow-xl hover:-translate-y-0.5"
              >
                <Download className="h-5 w-5" />
                Add to Chrome — It&apos;s Free
              </a>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-4 text-base font-semibold text-slate-700 transition hover:bg-slate-50 shadow-sm"
              >
                See how it works
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            </div>

            <p className="mt-4 text-sm text-slate-400">
              No credit card required • Zero chat tracking • Instant payouts from $2
            </p>

            {/* Interactive Browser Mockup */}
            <div className="mt-16 sm:mt-20 flex justify-center w-full">
              <HeroChatMockup />
            </div>

            {/* Supported AI Models Strip */}
            <div className="mt-20 border-t border-slate-100 pt-12">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-400">
                Works seamlessly across your favorite AI platforms
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-10 sm:gap-14 text-base sm:text-lg font-bold text-slate-600">
                <span className="flex items-center gap-2.5 hover:text-slate-900 transition">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> ChatGPT
                </span>
                <span className="flex items-center gap-2.5 hover:text-slate-900 transition">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-500"></span> Claude
                </span>
                <span className="flex items-center gap-2.5 hover:text-slate-900 transition">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span> Google Gemini
                </span>
                <span className="flex items-center gap-2.5 hover:text-slate-900 transition">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-500"></span> Perplexity
                </span>
                <span className="flex items-center gap-2.5 hover:text-slate-900 transition">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span> DeepSeek
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3-STEP "HOW IT WORKS" */}
        <section id="how-it-works" className="border-t border-slate-100 bg-slate-50/70 py-24 sm:py-32">
          <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14">
            <div className="text-center">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-700">Simple &amp; Frictionless</span>
              <h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
                How Pathixo Rewards works
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-slate-600">
                Turn the seconds you already spend waiting for AI answers into passive dollars.
              </p>
            </div>

            <div className="mt-16 sm:mt-20 grid gap-8 lg:gap-10 sm:grid-cols-3">
              {/* Step 1 */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 text-left shadow-sm hover:shadow-md transition">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 font-black text-2xl">
                  1
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">Install in 10 seconds</h3>
                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  Add the extension to Chrome, Edge, or Brave. An anonymous device ID is assigned immediately with no forced signup.
                </p>
              </div>

              {/* Step 2 */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 text-left shadow-sm hover:shadow-md transition">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 font-black text-2xl">
                  2
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">Prompt as usual</h3>
                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  When your model is thinking, a single labeled sponsored card appears in empty screen space. It disappears once streaming finishes.
                </p>
              </div>

              {/* Step 3 */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 text-left shadow-sm hover:shadow-md transition">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 font-black text-2xl">
                  3
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">Cash out at $2</h3>
                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  Withdraw your earnings via instant UPI (India), PayPal, or digital gift cards as soon as you hit $2. No 30-day holds.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* EARNINGS CALCULATOR & SPLIT */}
        <section id="calculator" className="py-24 sm:py-32">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-6 sm:px-10 lg:px-14">
            <EarningsCalculator />
          </div>
        </section>

        {/* PRIVACY & TRUST GUARANTEE */}
        <section id="privacy" className="border-t border-slate-100 bg-slate-50/70 py-24 sm:py-32">
          <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14">
            <div className="text-center">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-700">Privacy First</span>
              <h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
                Built with zero-data harvesting
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-slate-600">
                Browser extensions running on AI tools must be trustworthy. Here is our architectural guarantee.
              </p>
            </div>

            <div className="mt-16 sm:mt-20 grid gap-8 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-8 space-y-4 shadow-sm hover:shadow-md transition">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Zero Prompt Reading</h3>
                <p className="text-base leading-relaxed text-slate-600">
                  The extension queries only generation buttons and layout wrappers. It never reads, logs, or transmits your prompt text or AI responses.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-8 space-y-4 shadow-sm hover:shadow-md transition">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">100% Open Source</h3>
                <p className="text-base leading-relaxed text-slate-600">
                  Every line of client-side code is publicly hosted on GitHub. You and the developer community can audit and verify its safety anytime.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-8 space-y-4 shadow-sm hover:shadow-md transition">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">1-Click Pause</h3>
                <p className="text-base leading-relaxed text-slate-600">
                  Need complete silence during sensitive work? One click in your browser toolbar pauses all sponsored cards instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-24 sm:py-32">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 sm:px-10">
            <div className="text-center mb-16">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-700">FAQ</span>
              <h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
                Frequently asked questions
              </h2>
            </div>
            <FaqSection />
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="border-t border-slate-100 bg-slate-900 py-20 sm:py-28 text-white text-center">
          <div className="mx-auto w-full max-w-5xl px-6 sm:px-10">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight">
              Stop waiting for free.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-slate-400 text-lg sm:text-xl leading-relaxed">
              One lightweight extension. Every major AI model. Earn from your very next prompt.
            </p>
            <div className="mt-10 flex justify-center">
              <a
                href="https://github.com/jhaabhijeet864/Pathixo_Rewards"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-2xl bg-emerald-500 px-8 py-4 text-base sm:text-lg font-bold text-slate-950 shadow-xl transition hover:bg-emerald-400 hover:-translate-y-0.5"
              >
                <Download className="h-5 w-5" />
                Install Pathixo Rewards — Free
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
