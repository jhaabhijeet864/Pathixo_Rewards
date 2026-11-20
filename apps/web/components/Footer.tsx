import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-12 text-sm text-slate-600">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <div className="flex items-center gap-2">
            <img src="/icon.svg" alt="Pathixo Rewards" className="h-5 w-5 rounded" />
            <span className="font-semibold text-slate-900">Pathixo Rewards</span>
          </div>
          <p className="text-xs text-slate-500">Get paid while AI thinks. 100% open-source.</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:justify-end">
          <Link href="/privacy" className="hover:text-slate-900 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-slate-900 transition-colors">
            Terms of Service
          </Link>
          <Link href="/advertise" className="hover:text-slate-900 transition-colors">
            Advertise
          </Link>
          <a
            href="https://github.com/jhaabhijeet864/Pathixo_Rewards"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-900 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-5xl border-t border-slate-200/60 px-6 pt-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Pathixo Rewards. Not affiliated with OpenAI, Anthropic, Google, Perplexity, or DeepSeek.
      </div>
    </footer>
  );
}
