import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#090d16] text-slate-100 selection:bg-indigo-500/30 selection:text-white">
      <Navbar />

      <main className="flex-1 py-14 sm:py-20 w-full">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10 text-slate-300">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Legal Agreement
            </span>
            <h1 className="mt-2 text-3xl sm:text-5xl font-black text-white tracking-tight">
              Terms of Service
            </h1>
            <p className="mt-2 text-xs font-mono text-slate-400">Last updated: November 21, 2026</p>
          </div>

          <section className="rounded-2xl border border-white/[0.08] bg-[#0c1220] p-6 sm:p-8 space-y-3">
            <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              By installing the Pathixo Rewards browser extension or utilizing the Pathixo Rewards web platform, you agree to comply with and be legally bound by these Terms of Service.
            </p>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-[#0c1220] p-6 sm:p-8 space-y-3">
            <h2 className="text-xl font-bold text-white">2. Earnings &amp; Payout Policy</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Users earn 60% of verified ad revenue resulting from qualified dwell-time impressions during AI generation. An impression is deemed qualified when the browser tab remains active, focused, and visible for at least 4 contiguous seconds while the AI model streams its response. Payouts can be requested at a minimum balance of $2.00 USD.
            </p>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-[#0c1220] p-6 sm:p-8 space-y-3">
            <h2 className="text-xl font-bold text-white">3. Anti-Fraud &amp; Abuse</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Any attempt to simulate artificial impressions through headless browsers, automated scripts, prompt-spamming bots, or click rings will result in immediate forfeiture of earnings and device revocation.
            </p>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-[#0c1220] p-6 sm:p-8 space-y-3">
            <h2 className="text-xl font-bold text-white">4. Third-Party Trademarks</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              ChatGPT is a registered trademark of OpenAI. Claude is a registered trademark of Anthropic. Gemini is a registered trademark of Google LLC. Perplexity is a trademark of Perplexity AI, Inc. DeepSeek is a trademark of DeepSeek AI. Pathixo Rewards is an independent platform and extension not affiliated with or endorsed by any of these entities.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
