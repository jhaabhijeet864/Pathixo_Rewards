import Link from 'next/link';

export function Footer() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-16 text-base text-slate-600">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-8 px-6 sm:px-10 lg:px-14 sm:flex-row">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <div className="flex items-center gap-2.5">
            <img src={`${basePath}/icon.svg`} alt="Pathixo Rewards" className="h-6 w-6 rounded-md" />
            <span className="font-bold text-slate-900 text-lg">Pathixo Rewards</span>
          </div>
          <p className="text-sm text-slate-500">Get paid while AI thinks. 100% open-source.</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 text-sm sm:justify-end font-medium">
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
      <div className="mx-auto mt-10 max-w-7xl border-t border-slate-200/70 px-6 sm:px-10 lg:px-14 pt-8 text-center text-xs sm:text-sm text-slate-400">
        © {new Date().getFullYear()} Pathixo Rewards. Not affiliated with OpenAI, Anthropic, Google, Perplexity, or DeepSeek.
      </div>
    </footer>
  );
}
