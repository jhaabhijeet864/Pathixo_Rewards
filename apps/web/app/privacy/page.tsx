import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#090d16] text-slate-100 selection:bg-indigo-500/30 selection:text-white">
      <Navbar />

      <main className="flex-1 py-14 sm:py-20 w-full">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10 text-slate-300">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Architectural Trust &amp; Privacy
            </span>
            <h1 className="mt-2 text-3xl sm:text-5xl font-black text-white tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-2 text-xs font-mono text-slate-400">Last updated: November 21, 2026</p>
          </div>

          <section className="rounded-2xl border border-white/[0.08] bg-[#0c1220] p-6 sm:p-8 space-y-3">
            <h2 className="text-xl font-bold text-white">1. Core Philosophy: Zero Prompt Reading</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Pathixo Rewards is architected with strict zero-data harvesting. The browser extension operates in an isolated content script environment that never reads, captures, stores, or logs your user prompt text, uploaded files, or the generated answers from any AI model (including ChatGPT, Claude, Gemini, Perplexity, or DeepSeek).
            </p>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-[#0c1220] p-6 sm:p-8 space-y-3">
            <h2 className="text-xl font-bold text-white">2. Chrome Web Store Limited Use Disclosure</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Pathixo Rewards strictly complies with the Google Chrome Web Store Developer Program Policies, including the Limited Use requirements:
            </p>
            <ul className="list-disc pl-5 text-sm space-y-1.5 text-slate-300">
              <li>We only request the <code className="text-cyan-400">storage</code> permission to persist anonymous device credentials and cached ad configurations locally.</li>
              <li>We do not request or access <code className="text-rose-400">&lt;all_urls&gt;</code>, browsing history, cookies, or tabs.</li>
              <li>We do not sell, rent, or monetize your personal information to third-party data brokers.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-[#0c1220] p-6 sm:p-8 space-y-3">
            <h2 className="text-xl font-bold text-white">3. What We Collect and Why</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              To operate the rewards and impressions accounting system, the extension logs strictly:
            </p>
            <ul className="list-disc pl-5 text-sm space-y-1.5 text-slate-300">
              <li><strong>Anonymous Device Identifier</strong>: A random client-generated UUID used to route micro-earnings to your account.</li>
              <li><strong>Impression Verification Tokens</strong>: An anonymized event record confirming that an ad was displayed on screen for at least 4 continuous seconds during model thinking.</li>
              <li><strong>Payout Destination</strong>: When you request a cashout (UPI ID, PayPal email, or delivery email), this is used exclusively to transfer your money.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-[#0c1220] p-6 sm:p-8 space-y-3">
            <h2 className="text-xl font-bold text-white">4. Open Source Transparency</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Our complete browser extension codebase is public and open-source on GitHub at{' '}
              <a
                href="https://github.com/jhaabhijeet864/Pathixo_Rewards"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 underline hover:text-cyan-300"
              >
                https://github.com/jhaabhijeet864/Pathixo_Rewards
              </a>
              . Anyone can audit the source code and compile the extension independently.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
