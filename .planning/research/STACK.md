# Research: Technical Stack for PromptPay

**Domain:** Browser Extension Monetization & AI Inline Ad Network
**Target Environment:** Chrome Manifest V3 (Cross-browser: Chrome, Edge, Firefox), Modern Fullstack Web Platform
**Status:** Prescriptive & Locked

---

## Recommended Stack

### 1. Browser Extension Subsystem

| Layer | Technology | Version | Rationale | Confidence |
|-------|------------|---------|-----------|------------|
| Extension Framework | **WXT (Web Extension Tools)** | `latest` (~v0.19+) | Vite-powered MV3 framework, instantaneous HMR, TypeScript-native, clean cross-browser outputs (`.output/chrome-mv3`, `.output/firefox-mv2`). | HIGH |
| Language | **TypeScript** | `^5.4` | Strict type safety across content scripts, background service workers, and popup components. | HIGH |
| Content Script Injection | **Vanilla DOM + Shadow DOM (`attachShadow`)** | Native | Complete style encapsulation from host pages (ChatGPT, Claude, Gemini, etc.). Pure `document.createElement` / `textContent` prevents innerHTML XSS vulnerabilities and passes Chrome Web Store security scans instantly. | HIGH |
| Storage & State | **WXT Storage (`@wxt-dev/storage`) / browser.storage.local** | Native | Atomic local storage for anonymous device IDs, device auth tokens, ad bundles, offline impression queues, and user toggle preferences. | HIGH |
| Remote Config | **Edge-cached JSON endpoint** | Cloudflare R2 / Vercel Edge | Enables dynamic updates of CSS selectors and container anchors when AI websites modify their DOM layouts without waiting 3-5 days for Chrome Web Store reviews. | HIGH |

### 2. Web Platform & Backend Subsystem

| Layer | Technology | Version | Rationale | Confidence |
|-------|------------|---------|-----------|------------|
| Web Framework | **Next.js (App Router)** | `15.x` | React Server Components, server actions, ultra-fast static page generation for landing pages and serverless API route handlers. | HIGH |
| Styling & UI | **Tailwind CSS + Lucide React** | `v3.4+` | Utility-first styling enabling strict anti-AI-slop design system (pure whites, deep slate, clean 1px borders, generous vertical spacing). | HIGH |
| Database & ORM | **PostgreSQL (Supabase / Neon / Prisma)** | Postgres 16 | Relational data integrity for user wallets, advertiser campaign balances, impressions ledger, and referral tracking. | HIGH |
| Payments & Payouts | **Stripe Checkout + Tremendous / UPI / PayPal** | Latest | Stripe for advertiser campaign top-ups (pre-paid ad balance); instant micro-payout rails ($2 minimum) for users. | HIGH |
| Monorepo Tooling | **pnpm Workspaces / Turborepo** | `pnpm 10.x` | Clean separation between `apps/extension`, `apps/web`, and `packages/shared`. | HIGH |

---

## What NOT to Use (and Why)

- **External Hosted Scripts / Remote JS (`<script src="...">`)**: Strictly banned by Chrome Web Store Manifest V3 policy. Extensions loading remote JS will be permanently rejected. All ad rendering logic must exist locally in the content script; only pure JSON data is fetched over HTTPS.
- **`innerHTML` in Content Scripts**: Chrome Web Store automated security linters flag string-based DOM insertion as security risks. We use pure `createElement` and `textContent`.
- **Heavy React / Vue Frameworks inside Content Scripts**: Injected content scripts should remain featherweight (<30KB) to ensure sub-50ms execution and zero perceptible slowdown on the host AI tabs.
- **Broad Permissions (`<all_urls>`, `webRequest`, `cookies`, `tabs`)**: Triggers extensive manual security review and immediate rejection. We only request `storage` and targeted `host_permissions` for specified chatbot URLs.
- **Neon AI Gradients & Bento-Grid Clutter**: Banned by our anti-AI-slop guidelines. Landing page must maintain crisp, high-contrast, minimalist SaaS aesthetic.
