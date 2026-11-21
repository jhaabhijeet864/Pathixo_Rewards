import Link from 'next/link';
import { Sparkles, Github, Shield, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#070a12] text-slate-400 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#090d16]">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                </div>
              </div>
              <span className="text-base font-bold text-white tracking-tight">Pathixo Rewards</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              The open-source browser extension and monetization engine that pays users 60% of ad revenue while AI models think. Privacy-first, zero prompt reading, and instant $2 cashouts.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-mono text-emerald-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>All Systems Operational • Instant Payout Rails Active</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3 text-xs sm:text-sm">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#how-it-works" className="hover:text-white transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#calculator" className="hover:text-white transition">
                  Earnings Calculator
                </Link>
              </li>
              <li>
                <Link href="#comparison" className="hover:text-white transition">
                  Comparison Matrix
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="hover:text-cyan-400 transition">
                  Advertiser Space
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition">
                  User Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Open Source */}
          <div className="space-y-3 text-xs sm:text-sm">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">Transparency</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/jhaabhijeet864/Pathixo_Rewards"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition"
                >
                  <Github className="h-3.5 w-3.5" />
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy (Zero Logs)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="https://jhaabhijeet864.github.io/Pathixo_Rewards/downloads/pathixo-rewards-extension.zip"
                  className="hover:text-cyan-400 transition"
                >
                  Download Extension .zip
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Pathixo Rewards. 100% open-source under MIT License.
          </div>
          <div>
            Not affiliated with OpenAI, Anthropic, Google, Perplexity, or DeepSeek. All trademarks belong to their respective owners.
          </div>
        </div>
      </div>
    </footer>
  );
}
