import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pathixo Rewards: Turn AI Wait Time Into Instant Cash',
  description:
    'Earn 60% of ad revenue while ChatGPT, Claude, Gemini, Perplexity, and DeepSeek are thinking. 100% open-source, zero prompt harvesting, instant $2 cashouts.',
  keywords: [
    'Pathixo Rewards',
    'AI wait time monetization',
    'Earn while AI generates',
    'ChatGPT extension',
    'Claude rewards',
    'DeepSeek rewards',
  ],
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth dark">
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
