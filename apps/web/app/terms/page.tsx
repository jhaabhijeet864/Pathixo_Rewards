import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 space-y-8 text-slate-700">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Legal</span>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Terms of Service
            </h1>
            <p className="mt-2 text-xs text-slate-400">Last updated: November 21, 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p className="text-sm leading-relaxed">
              By installing the Pathixo Rewards browser extension or utilizing the Pathixo Rewards web platform, you agree to comply with and be legally bound by these Terms of Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">2. Earnings &amp; Payout Policy</h2>
            <p className="text-sm leading-relaxed">
              Users earn 60% of verified ad revenue resulting from qualified dwell-time impressions during AI generation. An impression is deemed qualified when the browser tab remains active, focused, and visible for at least 4 contiguous seconds while the AI model streams its response. Payouts can be requested at a minimum balance of $2.00 USD.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">3. Anti-Fraud &amp; Abuse</h2>
            <p className="text-sm leading-relaxed">
              Any attempt to simulate artificial impressions through headless browsers, automated scripts, prompt-spamming bots, or click rings will result in immediate forfeiture of earnings and device revocation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">4. Third-Party Trademarks</h2>
            <p className="text-sm leading-relaxed">
              ChatGPT is a registered trademark of OpenAI. Claude is a registered trademark of Anthropic. Gemini is a registered trademark of Google LLC. Perplexity is a trademark of Perplexity AI, Inc. DeepSeek is a trademark of DeepSeek AI. Pathixo Rewards is an independent platform and extension not affiliated with or endorsed by any of these entities.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
