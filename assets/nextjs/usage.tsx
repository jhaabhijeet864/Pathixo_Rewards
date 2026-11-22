// Copy nextjs/app/icon.png, apple-icon.png, and favicon.ico into your Next.js app/ directory.
// Next.js App Router automatically detects these conventional filenames.
//
// Optional explicit metadata in app/layout.tsx:
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pathixo Rewards",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};
