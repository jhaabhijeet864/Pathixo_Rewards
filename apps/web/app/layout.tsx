import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pathixo Rewards: Get paid while AI thinks',
  description:
    'Earn cash rewards while ChatGPT, Claude, Gemini, Perplexity, and DeepSeek generate answers. The privacy-first, open-source wait-time monetization network.',
  keywords: [
    'AI rewards',
    'ChatGPT extension',
    'Claude extension',
    'Get paid while AI thinks',
    'Wait time ads',
    'Pathixo Rewards',
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
      <body className="min-h-full flex flex-col bg-[#070a0e] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
