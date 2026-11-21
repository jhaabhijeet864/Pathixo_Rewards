# Pathixo Rewards Release Notes

Project milestone updates and release history for Pathixo Rewards.

---

## Version 0.1.0 — Initial Release (November 2026)

### Added
- **Browser Extension (Manifest V3)**:
  - WXT TypeScript multi-browser framework targeting Chrome, Edge, and Firefox.
  - Modular content script adapters for 5 major AI platforms: ChatGPT, Claude, Gemini, Perplexity, and DeepSeek.
  - Dynamic remote selector synchronization via `/api/config/selectors` for zero-review DOM updates.
  - Shadow DOM ad card container with strictly safe `createElement` rendering (zero `innerHTML` sinks).
  - Client-side anti-fraud dwell verification requiring active window focus and 4-second minimum visibility.
  - Extension popup interface with real-time balance counter, pause toggle, referral shortcut, and dashboard link.
  - Support for instant guest device identification with optional account linking.

- **Web Platform (Next.js 15 App Router)**:
  - Responsive landing page featuring live interactive chatbot simulation and earnings estimation tool.
  - Transparent revenue split display (60% User / 40% Platform).
  - Self-serve Advertiser Portal (`/advertise`) with live interactive ad creative previewer and CPM calculator.
  - User Earnings Dashboard (`/dashboard`) with instant micro-cashout system supporting $2.00 threshold.
  - Dedicated Privacy Policy (`/privacy`) and Terms of Service (`/terms`) pages.

- **API Engine**:
  - `/api/health`: Comprehensive system telemetry and uptime endpoint with fast ping support.
  - `/api/ads/bundle`: Targeted ad delivery with high-yield B2B and affiliate fallbacks.
  - `/api/events/impression`: Dwell-time verified impression accounting and credit ledger.
  - `/api/cashout`: Low-floor micro-cashout processing (UPI, PayPal, Gift Cards).
  - `/api/config/selectors`: Versioned AI platform DOM selector distribution.

- **Operational Tooling**:
  - `scripts/health-check.mjs`: CLI endpoint latency and status verification tool.
  - `scripts/validate-selectors.mjs`: Syntax and coverage validator for AI platform CSS selectors.
  - `scripts/verify-repo.mjs`: Pre-flight monorepo integrity and security audit utility.
