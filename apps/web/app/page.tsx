import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HeroChatMockup } from '@/components/HeroChatMockup';
import { EarningsCalculator } from '@/components/EarningsCalculator';
import { FaqSection } from '@/components/FaqSection';
import {
  Download,
  ShieldCheck,
  Zap,
  ArrowRight,
  Lock,
  Layers,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  DollarSign,
  Cpu,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#090d16] text-slate-100 selection:bg-indigo-500/30 selection:text-white">
      <Navbar />

      <main className="flex-1 w-full">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
          {/* Subtle Ambient Background Gradients */}
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-cyan-600/15 via-indigo-600/20 to-purple-600/10 blur-[130px]" />
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            
            {/* Top Value Pill */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-mono font-semibold text-cyan-300 shadow-glow backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>60% Revenue Share • $2.00 Instant Cashout • Open Source MV3</span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-7 text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] max-w-5xl mx-auto">
              Turn AI wait time into{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                instant passive cash.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mt-6 max-w-3xl text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed">
              Earn real dollars while ChatGPT, Claude, Gemini, Perplexity, or DeepSeek are thinking. See one elegant, non-intrusive card, keep 60% of verified ad revenue, and cash out immediately at just $2.
            </p>

            {/* Action Buttons */}
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://github.com/jhaabhijeet864/Pathixo_Rewards"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 px-7 py-4 text-base font-bold text-white shadow-glow transition-all hover:opacity-95 hover:shadow-glow-indigo hover:scale-[1.01]"
              >
                <Download className="h-5 w-5" />
                <span>Add to Chrome — Free Extension</span>
                <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs uppercase font-extrabold text-white">
                  v0.1.0
                </span>
              </a>

              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-6 py-4 text-base font-semibold text-slate-200 backdrop-blur-sm transition hover:bg-white/[0.08] hover:text-white hover:border-white/[0.2]"
              >
                <span>See How It Works</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            </div>

            {/* Trust Assurances Under CTAs */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Zero Account Required to Start
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" /> Never Reads Prompt Content
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> Instant UPI / PayPal at $2
              </span>
            </div>

            {/* Interactive Multi-Model Studio Mockup */}
            <div className="mt-14 flex justify-center w-full">
              <HeroChatMockup />
            </div>

            {/* Supported Models Bar */}
            <div className="mt-16 border-t border-white/[0.08] pt-10">
              <p className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Native DOM Adapters for the Top 5 AI Reasoning Engines
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-bold text-slate-300">
                <span className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 hover:border-white/[0.15] transition">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span> ChatGPT o3-mini &amp; 4o
                </span>
                <span className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 hover:border-white/[0.15] transition">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-400"></span> Claude 3.7 Sonnet
                </span>
                <span className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 hover:border-white/[0.15] transition">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-400"></span> DeepSeek R1 Reasoner
                </span>
                <span className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 hover:border-white/[0.15] transition">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-400"></span> Google Gemini 2.0
                </span>
                <span className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 hover:border-white/[0.15] transition">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-400"></span> Perplexity Pro
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3-STEP "HOW IT WORKS" */}
        <section id="how-it-works" className="relative border-t border-white/[0.08] bg-[#0c111e] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                Frictionless Workflow
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                How Pathixo Rewards works
              </h2>
              <p className="text-base text-slate-400">
                You already spend hundreds of seconds each day waiting for AI models to draft code and essays. Pathixo monetizes that idle dead time automatically.
              </p>
            </div>

            {/* 3 Steps Grid */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative rounded-2xl border border-white/[0.08] bg-[#111728] p-8 space-y-5 transition-all hover:border-cyan-500/30 hover:shadow-glow">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono font-black text-lg">
                  01
                </div>
                <h3 className="text-xl font-bold text-white">Install in 10 seconds</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Add the lightweight Chrome extension. No passwords, credit cards, or accounts needed. Your browser is instantly assigned a private local device token.
                </p>
                <div className="text-xs font-mono text-cyan-400 pt-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Manifest V3 Compliant
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative rounded-2xl border border-white/[0.08] bg-[#111728] p-8 space-y-5 transition-all hover:border-indigo-500/30 hover:shadow-glow-indigo">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono font-black text-lg">
                  02
                </div>
                <h3 className="text-xl font-bold text-white">Prompt normally</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Ask questions on ChatGPT, Claude, DeepSeek, Gemini, or Perplexity. During the generation wait time, a clean sponsored card appears below your prompt without covering any text.
                </p>
                <div className="text-xs font-mono text-indigo-400 pt-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 4s Dwell Verified
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative rounded-2xl border border-white/[0.08] bg-[#111728] p-8 space-y-5 transition-all hover:border-emerald-500/30 hover:shadow-glow-emerald">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-black text-lg">
                  03
                </div>
                <h3 className="text-xl font-bold text-white">Cash out at $2.00</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Keep 60% of ad revenue. As soon as your verified balance hits the low $2.00 threshold, withdraw immediately via UPI (India), PayPal (Global), or Digital Amazon Gift Cards.
                </p>
                <div className="text-xs font-mono text-emerald-400 pt-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Instant (Zero 30-Day Hold)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DYNAMIC EARNINGS CALCULATOR & COMPETITOR MATRIX */}
        <section id="calculator" className="relative border-t border-white/[0.08] bg-[#090d16] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <EarningsCalculator />
          </div>
        </section>

        {/* PRIVACY & SECURITY ARCHITECTURAL GUARANTEE */}
        <section className="relative border-t border-white/[0.08] bg-[#0a0f1c] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                Engineered For Trust
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                Architectural Zero-Data Harvesting
              </h2>
              <p className="text-base text-slate-400">
                You should never install a browser extension that reads your thoughts. Here is why Pathixo Rewards is provably safe.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Architecture 1 */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#111728] p-7 space-y-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Zero Prompt Reading</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Our content script binds only to the send button and keyboard submission events. It contains zero query selectors for user text and never captures conversation payloads.
                </p>
              </div>

              {/* Architecture 2 */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#111728] p-7 space-y-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Isolated Shadow DOM Host</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Every ad card renders inside an isolated ShadowRoot with native DOM methods (`createElement`). Zero `innerHTML` usage guarantees complete immunity from cross-site scripting.
                </p>
              </div>

              {/* Architecture 3 */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#111728] p-7 space-y-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">100% Open Source</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Every line of TypeScript code in our extension is published on GitHub. You can inspect, compile, and run it unpacked yourself anytime.
                </p>
              </div>
            </div>

            {/* GitHub Audit Link Banner */}
            <div className="mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-center">
              <a
                href="https://github.com/jhaabhijeet864/Pathixo_Rewards"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition"
              >
                <span>Audit our open source codebase on GitHub</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section className="relative border-t border-white/[0.08] bg-[#090d16] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                Clear Answers
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-base text-slate-400">
                Everything you need to know about payments, ad formats, and privacy guarantees.
              </p>
            </div>

            <FaqSection />
          </div>
        </section>

        {/* BOTTOM FINAL CALL TO ACTION */}
        <section className="relative border-t border-white/[0.08] bg-gradient-to-b from-[#0e1628] to-[#070b14] py-20 sm:py-28 text-center">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Ready to start earning while AI thinks?
            </h2>
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
              Install the lightweight extension in 10 seconds. Cash out as soon as you reach $2.00 via instant UPI or PayPal.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <a
                href="https://github.com/jhaabhijeet864/Pathixo_Rewards"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 px-8 py-4 text-base font-bold text-white shadow-glow transition hover:opacity-95 hover:scale-[1.01]"
              >
                <Download className="h-5 w-5" />
                <span>Add Pathixo Rewards to Chrome — It&apos;s Free</span>
              </a>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-base font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition"
              >
                <span>Open Dashboard</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
