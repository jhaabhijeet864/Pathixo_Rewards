# Pathixo Rewards 💰

> **Get paid while AI thinks.** The high-yield, privacy-first browser extension and ad monetization network for AI wait time.

[![CI Status Checks](https://github.com/jhaabhijeet864/Pathixo_Rewards/actions/workflows/ci.yml/badge.svg)](https://github.com/jhaabhijeet864/Pathixo_Rewards/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Next.js 15](https://img.shields.io/badge/Web-Next.js%2015%20App%20Router-black.svg)](https://nextjs.org)

Pathixo Rewards turns the idle seconds you spend waiting for AI chatbot responses (ChatGPT, Claude, Gemini, Perplexity, and DeepSeek) into cash rewards. Users receive **60% of all verified ad revenue**, cash out at an industry-low **$2.00 threshold**, while advertisers reach high-intent AI developers and founders with non-intrusive, 1-line sponsored cards.

---

## ⚡ Competitive Edge

| Feature | Pathixo Rewards (This Project) | Chatwait | uwait | AdWait |
| :--- | :--- | :--- | :--- | :--- |
| **User Revenue Share** | **60% User** / 40% Platform | 50% / 50% | 50% / 30% publishers / 20% | 50% / 50% |
| **Cashout Minimum** | **$2.00 USD (Instant)** | $10.00 (Whop, 30-day hold) | €10.00 (Stripe) | $5.00 (25k queries needed) |
| **Payout Rails** | **UPI (India Instant), PayPal, Gift Cards** | Whop | Stripe Bank Transfer | PayPal / Venmo |
| **Supported AI Tools** | **ChatGPT, Claude, Gemini, Perplexity, DeepSeek (5)** | ChatGPT, Claude, Gemini (3) | 8 chatbots | ChatGPT, Gemini, Perplexity |
| **Open Source & Privacy** | **100% Open Source** (Zero prompt reading) | Open Source (3 tools only) | Closed Source (reads citations) | Closed Source |
| **DOM Selector Resilience**| **Remote Edge-Cached JSON Config** | Hardcoded | Closed | Hardcoded |
| **Ad Presentation** | **Shadow DOM (`attachShadow`)** | Shadow DOM | Shadow DOM | Inline DOM |

---

## 🏗️ Monorepo Architecture

```text
Pathixo_Rewards/
├── apps/
│   ├── extension/             # WXT Manifest V3 browser extension
│   │   ├── entrypoints/
│   │   │   ├── background.ts  # Service worker, alarm sync, event queuing
│   │   │   ├── popup/         # Extension popup UI (earnings counter, pause toggle)
│   │   │   └── content/       # Modular content script adapters & Shadow DOM card
│   │   │       ├── adapters/  # ChatGPT, Claude, Gemini, Perplexity, DeepSeek
│   │   │       ├── ad-card.ts # Isolated Shadow DOM component (zero innerHTML)
│   │   │       └── remote-config.ts # Dynamic selector fallback & sync
│   │   └── wxt.config.ts      # Multi-target configuration (Chrome MV3, Firefox MV2)
│   └── web/                   # Next.js 15 App Router web platform
│       ├── app/
│       │   ├── page.tsx       # Anti-AI-slop marketing landing page
│       │   ├── advertise/     # Self-serve advertiser space & live ad previewer
│       │   ├── dashboard/     # User earnings dashboard & $2 cashout terminal
│       │   ├── privacy/       # Chrome Web Store compliant Privacy Policy
│       │   └── api/           # Ad engine, impression logging, and cashout routes
│       └── components/        # Reusable UI components (HeroChatMockup, Calculator)
├── packages/
│   └── shared/                # Shared TypeScript contracts and schemas
├── .github/
│   ├── workflows/             # CI status checks & Release automation
│   ├── ISSUE_TEMPLATE/        # Selector breakage & Bug report templates
│   ├── labels.yml             # Project taxonomy labels
│   └── scripts/               # sync-labels.mjs REST API script
└── .planning/                 # Comprehensive GSD project roadmap, requirements & state
```

---

## 🚀 Quickstart

### Prerequisites
- Node.js 20+ (Node v22 or v24 recommended)
- pnpm 10+ (`npm install -g pnpm`)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run Extension Development Mode
```bash
pnpm dev:extension
```

### 3. Run Web Platform
```bash
pnpm dev:web
```
Open [http://localhost:3000](http://localhost:3000) to view the landing page, `/advertise` for the campaign builder, and `/dashboard` for the user earnings terminal.

---

## 📦 How to Load Extension in Chrome / Edge

1. Build the production extension package:
   ```bash
   pnpm build:extension
   ```
2. Open Google Chrome (or Edge / Brave) and navigate to `chrome://extensions/`.
3. Enable **Developer mode** via the toggle switch in the top-right corner.
4. Click **Load unpacked**.
5. Select the folder `apps/extension/.output/chrome-mv3`.
6. Open [ChatGPT](https://chatgpt.com), [Claude](https://claude.ai), [Gemini](https://gemini.google.com), [Perplexity](https://perplexity.ai), or [DeepSeek](https://chat.deepseek.com) and submit a prompt!

---

## 🧪 Testing & QA Verification Suite

Pathixo Rewards features a production-grade automated testing and verification suite powered by Vitest, jsdom, and custom adversarial QA simulation harnesses:

### Standard Test Commands
| Command | Description |
| :--- | :--- |
| `pnpm test` | Runs the full Vitest unit & integration test suite (43+ tests across extension, API & shared packages) |
| `pnpm test:watch` | Starts Vitest in interactive watch mode for rapid test-driven iteration |
| `pnpm test:coverage` | Computes test coverage using the `@vitest/coverage-v8` engine |

### Specialized QA Commands (Novel to Pathixo Rewards)
These custom run commands address failure modes unique to AI chatbot ad-insertion extensions:

| Command | Why It's Critical | What It Does |
| :--- | :--- | :--- |
| `pnpm run verify:selectors` | **AI DOM Drift Prevention** | Validates CSS selectors across all 5 AI platforms (ChatGPT, Claude, Gemini, Perplexity, DeepSeek) against synthetic DOM trees and verifies syntax before deployment. |
| `pnpm run audit:store-compliance` | **Store Rejection Safeguard** | Statically scans source code and build output for forbidden sinks (`innerHTML`, `outerHTML`, `eval()`, dynamic scripts) and audits Manifest V3 permission boundaries. |
| `pnpm run simulate:antifraud` | **Anti-Fraud Integrity Matrix** | Tests dwell verification against adversarial attacks: sub-threshold dwell (3999ms), tab blur/backgrounding, negative dwell, and missing security tokens. |
| `pnpm run audit:financials` | **Financial Invariant Check** | Verifies 60/40 revenue split precision, IEEE-754 micro-accumulation drift, and strict enforcement of the $2.00 minimum cashout floor. |
| `pnpm run simulate:stream` | **AI Generation Lifecycle Harness** | Simulates real-time token streaming character-by-character in a mock DOM, mounting the ad card into an open Shadow DOM and verifying dwell qualification. |
| `pnpm run qa:all` | **Master QA Pipeline** | Executes all 6 test and verification suites in sequence. Must pass before shipping or releasing to stores. |

---

## 🛡️ Chrome Web Store Compliance & Safety

Pathixo Rewards was built from Day 1 to pass Chrome Web Store automated security reviews on first submission:

1. **Zero Remote Code Execution**: No external `<script>` tags, ad SDKs, or `eval()` calls. All rendering code is compiled locally into the extension package.
2. **Pure DOM Construction**: The ad card is constructed strictly using `document.createElement()` and `textContent`. There are **zero `innerHTML` sinks**, eliminating XSS risks.
3. **Style Encapsulation**: Uses `attachShadow({ mode: 'open' })` so host CSS styles never break the card, and extension styles never bleed onto host AI pages.
4. **Single-Purpose Permissions**: Requests strictly `storage` and targeted `host_permissions` for the 5 AI domains.
5. **Zero Prompt Harvesting**: Content scripts monitor only button action states (e.g., `button[aria-label="Stop"]`). Prompt text and response contents are never accessed or logged.

---

## 🏷️ GitHub Issues & Labels Taxonomy

This project includes a tailored label taxonomy for AI site changes, subsystems, and bounties:

| Label | Description |
| :--- | :--- |
| `domain:chatgpt` | ChatGPT adapter, composer, or turn injection |
| `domain:claude` | Claude adapter, Tiptap composer, bubble escaping |
| `domain:gemini` | Google Gemini Angular web components |
| `domain:perplexity` | Perplexity search turn & reasoning adapter |
| `domain:deepseek` | DeepSeek thinking accordion adapter |
| `type:selector-breakage` | Urgent: An AI site changed its DOM and broke selector mapping |
| `compliance:webstore` | Chrome Web Store policy compliance |
| `bounty:eligible` | Community tasks eligible for reward bounties |

Sync labels to your repository anytime:
```bash
GITHUB_TOKEN=your_token node .github/scripts/sync-labels.mjs
```

---

## 📄 License

MIT License. Open source and free for the community.
