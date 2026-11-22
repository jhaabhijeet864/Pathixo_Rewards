import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://pathixorewards.com'),
  title: 'Pathixo Rewards: Get paid while AI thinks',
  description:
    'Earn cash rewards while ChatGPT, Claude, Gemini, Perplexity, and DeepSeek generate responses. Privacy-first, open-source wait-time monetization network with instant $2.00 cashouts.',
  keywords: [
    'AI rewards',
    'ChatGPT extension',
    'Claude extension',
    'Gemini extension',
    'Get paid while AI thinks',
    'Wait time ads',
    'Pathixo Rewards',
    'AI monetization',
  ],
  icons: {
    icon: [
      { url: `${basePath}/favicon.ico` },
      { url: `${basePath}/icons/favicon-32x32.png`, sizes: '32x32', type: 'image/png' },
      { url: `${basePath}/icons/favicon-16x16.png`, sizes: '16x16', type: 'image/png' },
      { url: `${basePath}/pathixo-rewards.svg`, type: 'image/svg+xml' },
    ],
    apple: [
      { url: `${basePath}/icons/apple-touch-icon.png`, sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: `${basePath}/manifest.webmanifest`,
  openGraph: {
    title: 'Pathixo Rewards: Get paid while AI thinks',
    description:
      'Turn the seconds you spend waiting for AI chatbot responses into cash rewards. 60% user split, instant $2 cashout floor.',
    url: 'https://pathixorewards.com',
    siteName: 'Pathixo Rewards',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pathixo Rewards: Get paid while AI thinks',
    description:
      'Earn cash rewards while ChatGPT, Claude, Gemini, Perplexity, and DeepSeek generate responses. Instant $2 cashout.',
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
