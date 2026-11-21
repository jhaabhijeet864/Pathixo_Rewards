import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HeroChatMockup } from '@/components/HeroChatMockup';
import { LiveImpressionCounter } from '@/components/LiveImpressionCounter';
import { StopWaitingSection, ChromeIcon } from '@/components/StopWaitingSection';
import { EarningsCalculator } from '@/components/EarningsCalculator';
import { FaqSection } from '@/components/FaqSection';
import { Lock, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#070a0e] text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
          <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14 text-center">
            {/* Main Headline */}
            <h1 className="text-5xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl sm:leading-[1.05]">
              Get paid while AI{' '}
              <span className="font-serif italic font-normal text-[#10e599]">
                thinks.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-400 sm:text-2xl sm:leading-relaxed">
              Pathixo Rewards shows one sponsored line while ChatGPT, Claude, Gemini, Perplexity, or DeepSeek generates, and pays you 60% of the ad revenue.
            </p>

            {/* Live Impression Counter (Directly as in Chatwait original) */}
            <div className="mt-8 sm:mt-10 flex justify-center">
              <LiveImpressionCounter initialCount={5790394} />
            </div>

            {/* Primary Action Button & Safe Open Source Notice */}
            <div className="mt-8 flex flex-col items-center justify-center">
              <a
                href="https://github.com/jhaabhijeet864/Pathixo_Rewards"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-xl bg-[#10b981] px-7 py-3.5 text-base sm:text-lg font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-[#0ea371] hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                <ChromeIcon className="h-5 w-5" />
                <span>Add to Chrome</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <div className="mt-3.5 flex items-center justify-center gap-1.5 text-xs sm:text-sm text-slate-400">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                <span>Safe, free and</span>
                <a
                  href="https://github.com/jhaabhijeet864/Pathixo_Rewards"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 text-slate-300 hover:text-white transition-colors"
                >
                  open source
                </a>
              </div>
            </div>

            {/* Interactive Browser Mockup (Duolingo Ad & Live Balance Increment) */}
            <div className="mt-16 sm:mt-20 flex justify-center w-full">
              <HeroChatMockup />
            </div>
          </div>
        </section>

        {/* 3-STEP "HOW IT WORKS" */}
        <section id="how-it-works" className="border-t border-slate-800/80 bg-[#090d14] py-20 sm:py-28">
          <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14">
            <div className="text-center">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#10e599]">Simple &amp; Frictionless</span>
              <h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-white">
                How Pathixo Rewards works
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-slate-400">
                Turn the seconds you already spend waiting for AI answers into passive dollars.
              </p>
            </div>

            <div className="mt-14 sm:mt-18 grid gap-8 lg:gap-10 sm:grid-cols-3">
              {/* Step 1 */}
              <div className="rounded-3xl border border-[#162534] bg-[#0c1219] p-8 sm:p-10 text-left shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#072f20] text-[#10e599] font-black text-xl">
                  1
                </div>
                <h3 className="mt-6 text-xl font-bold text-white">Install in 10 seconds</h3>
                <p className="mt-3 text-base leading-relaxed text-slate-400">
                  Add the extension to Chrome, Edge, or Brave. An anonymous device ID is assigned immediately with no forced signup.
                </p>
              </div>

              {/* Step 2 */}
              <div className="rounded-3xl border border-[#162534] bg-[#0c1219] p-8 sm:p-10 text-left shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#072f20] text-[#10e599] font-black text-xl">
                  2
                </div>
                <h3 className="mt-6 text-xl font-bold text-white">Prompt as usual</h3>
                <p className="mt-3 text-base leading-relaxed text-slate-400">
                  When your model is thinking, a single non-intrusive sponsored line appears in empty display space. It clears once streaming starts.
                </p>
              </div>

              {/* Step 3 */}
              <div className="rounded-3xl border border-[#162534] bg-[#0c1219] p-8 sm:p-10 text-left shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#072f20] text-[#10e599] font-black text-xl">
                  3
                </div>
                <h3 className="mt-6 text-xl font-bold text-white">Cash out at $2</h3>
                <p className="mt-3 text-base leading-relaxed text-slate-400">
                  Withdraw your earnings via instant UPI (India), PayPal, or digital gift cards as soon as you hit $2. No 30-day holds.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* EARNINGS CALCULATOR & SPLIT */}
        <section id="calculator" className="border-t border-slate-800/80 py-20 sm:py-28">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-6 sm:px-10 lg:px-14">
            <EarningsCalculator />
          </div>
        </section>

        {/* PRIVACY & TRUST GUARANTEE */}
        <section id="privacy" className="border-t border-slate-800/80 bg-[#090d14] py-20 sm:py-28">
          <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14">
            <div className="text-center">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#10e599]">Privacy First</span>
              <h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-white">
                Built with zero-data harvesting
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-slate-400">
                Browser extensions running on AI tools must be trustworthy. Here is our architectural guarantee.
              </p>
            </div>

            <div className="mt-14 sm:mt-18 grid gap-8 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#162534] bg-[#0c1219] p-8 space-y-4 shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#072f20] text-[#10e599]">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Zero Prompt Reading</h3>
                <p className="text-base leading-relaxed text-slate-400">
                  The extension queries only generation buttons and layout wrappers. It never reads, logs, or transmits your prompt text or AI responses.
                </p>
              </div>

              <div className="rounded-2xl border border-[#162534] bg-[#0c1219] p-8 space-y-4 shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#072f20] text-[#10e599]">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">100% Open Source</h3>
                <p className="text-base leading-relaxed text-slate-400">
                  Every line of client-side code is publicly hosted on GitHub. You and the developer community can audit and verify its safety anytime.
                </p>
              </div>

              <div className="rounded-2xl border border-[#162534] bg-[#0c1219] p-8 space-y-4 shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#072f20] text-[#10e599]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">1-Click Pause</h3>
                <p className="text-base leading-relaxed text-slate-400">
                  Need complete silence during sensitive work? One click in your browser toolbar pauses all sponsored lines instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="border-t border-slate-800/80 py-20 sm:py-28">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 sm:px-10">
            <div className="text-center mb-14">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#10e599]">FAQ</span>
              <h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-white">
                Frequently asked questions
              </h2>
            </div>
            <FaqSection />
          </div>
        </section>

        {/* STOP WAITING FOR FREE (Matching Chatwait original with ambient glow) */}
        <StopWaitingSection />
      </main>

      <Footer />
    </div>
  );
}