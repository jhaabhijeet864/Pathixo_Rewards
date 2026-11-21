import Link from 'next/link';

export function Footer() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return (
    <footer className="border-t border-slate-800/80 bg-[#05070a] py-12 text-sm text-slate-400">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:px-10 lg:px-14 sm:flex-row">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <img src={`${basePath}/icon.svg`} alt="Pathixo Rewards" className="h-6 w-6 rounded-md" />
          <span className="font-bold text-white text-base">Pathixo Rewards</span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm font-medium">
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms
          </Link>
          <Link href="/advertise" className="hover:text-white transition-colors">
            Advertise
          </Link>
          <Link href="/advertise/manage" className="hover:text-white transition-colors">
            Ads Manager
          </Link>
          <a
            href="https://github.com/jhaabhijeet864/Pathixo_Rewards"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>

        {/* Right side info */}
        <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} Pathixo Rewards
        </div>
      </div>
    </footer>
  );
}