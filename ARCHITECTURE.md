# System Architecture — Pathixo Rewards

Pathixo Rewards is an open-source browser extension and two-sided advertising platform designed to deliver relevant sponsor messages while users wait for AI conversational responses to generate.

> [!IMPORTANT]
> **Substantial Engineering Architecture (No Rapid Development):**  
> Every subsystem detailed in this document is designed for enterprise-grade fault tolerance, high-concurrency throughput, zero data-harvesting privacy guarantees, and banking-grade financial ledgers. We do not design or accept throwaway prototypes. Refer to [SUBSTANTIAL_DEVELOPMENT.md](./SUBSTANTIAL_DEVELOPMENT.md) for architectural invariants.

---

## 1. High-Level System Architecture

```
User Browser (Tab)                     Pathixo Cloud (Next.js 15)
+---------------------------------+    +---------------------------------+
|  AI Chatbot Interface           |    |  Ad Engine API                  |
|  (ChatGPT / Claude / Gemini /   |    |  - /api/ads/bundle              |
|   Perplexity / DeepSeek)        |    |  - /api/config/selectors        |
|               |                 |    |  - /api/events/impression       |
|               v                 |    +----------------+----------------+
|  Pathixo Content Script         |                     |
|  - Detection of Submit action   |                     |
|  - Shadow DOM Container         |                     v
|  - Anti-Fraud Dwell Timer       |    +---------------------------------+
|               |                 |    |  Storage & Settlement Engine    |
|               v                 |    |  - Campaign Budget Debits       |
|  Background Worker (WXT)        |    |  - User Earnings Ledger (60%)   |
|  - Local storage caching        |    |  - Instant Micro-Cashouts ($2)  |
|  - Batch event flushing --------+--> |  - Payout Rails (UPI / PayPal)  |
+---------------------------------+    +---------------------------------+
```

---

## 2. Monorepo Organization

The project is structured as a pnpm workspace monorepo:

- **`apps/extension`**: The client-side browser extension built with WXT (Web Extension Tools) and TypeScript targeting Chrome Manifest V3, Edge, and Firefox.
- **`apps/web`**: Next.js 15 App Router web platform containing:
  - Landing page
  - Self-serve advertiser portal (`/advertise`)
  - User earnings dashboard (`/dashboard`)
  - REST API endpoints (`/api/*`)
- **`packages/shared`**: Shared TypeScript types, data contracts, and schemas used by both the extension and web platforms.
- **`scripts`**: Operational utilities for health checks, selector verification, and repository diagnostics.

---

## 3. Extension Subsystem

### 3.1 Content Script Adapters
Each supported AI platform has a dedicated content script adapter that:
1. Observes DOM events (form submissions, button clicks, keyboard shortcuts).
2. Attaches an isolated Shadow DOM container to prevent host styling collisions.
3. Renders the sponsor message using safe DOM creation APIs (`document.createElement`, `textContent`).
4. Tracks active viewing time via an anti-fraud timer requiring at least 4 contiguous seconds while the page remains visible and focused.

### 3.2 Background Service Worker
- Synchronizes remote selector definitions to maintain compatibility when AI platforms alter their DOM structures.
- Caches ad creative bundles in `browser.storage.local`.
- Batches verified impression events and flushes them to the backend API.

---

## 4. Backend & Ad Engine Subsystem

- **`/api/ads/bundle`**: Delivers targeted sponsor creatives with fallback to high-yield affiliate partners to guarantee 100% inventory fill rate.
- **`/api/config/selectors`**: Serves versioned DOM selector maps with caching headers.
- **`/api/events/impression`**: Validates signed impression tokens, verifies dwell criteria, debits campaign budgets, and credits user balances.
- **`/api/cashout`**: Processes micro-cashout requests meeting the $2.00 minimum threshold.
- **`/api/health`**: Comprehensive health check and telemetry endpoint.
- **`/admin` & `/api/admin/*`**: Master Command Console providing real-time dual telemetry (Chrome Web Store vs. live heartbeat pings), campaign moderation, advertiser inflow ledger, user fraud shields with Read-Only impersonation, and payout settlement rails. Governed by [ADMIN_CONSOLE_SPEC.md](file:///e:/Open Source/Ad_AI/docs/ADMIN_CONSOLE_SPEC.md).

---

## 5. Security & Privacy Guarantees

1. **Zero Prompt Inspection**: The extension monitors only UI control state (e.g. stop/send buttons). It does not access, store, or transmit chat queries or generated responses.
2. **No Dynamic Execution**: All executable code is bundled within the extension package to comply with Manifest V3 policies.
3. **DOM Isolation**: Injected elements are encapsulated in Shadow DOM trees with zero `innerHTML` usage.
4. **Strict Authentication Gate**: The user rewards console and dashboard navigation are strictly protected. The `Dashboard` button beside `Add to Chrome` is hidden when unauthenticated, and `/dashboard` immediately redirects unauthenticated visitors to `/login`. Local `user@gmail.com` stubbing is restricted exclusively to non-production environments.

---

## 6. Multi-Agent Operational Model (SPOC)

To coordinate simultaneous development across specialized AI agents (UI bot, Homepage bot, Backend bot, Extension bot, QA bot), the repository is governed by **[AGENTS.md](file:///e:/Open%20Source/Ad_AI/AGENTS.md)** as the Single Point of Contact (SPOC). Every agent must read `AGENTS.md` before planning and update project documentation upon completing changes to eliminate multi-agent divergence and visual regressions.
