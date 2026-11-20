# Roadmap: PromptPay

## Overview

PromptPay delivers an open-source Manifest V3 Chrome extension and fullstack web monetization platform that pays users cash while AI chatbots are thinking, funded by high-yield B2B sponsors and affiliate deals. The project moves from core extension injection and modular chatbot adapters (Phase 1) through backend ad delivery, fraud prevention, and popup UI (Phase 2), to the anti-AI-slop high-converting landing page (Phase 3), culminating in the self-serve advertiser campaign portal and $2 user cashout dashboard (Phase 4).

## Phases

- [ ] **Phase 1: Core Extension Architecture & Chatbot Adapters** - Manifest V3 setup, Shadow DOM ad card component, and resilient DOM detection across ChatGPT, Claude, Gemini, Perplexity, and DeepSeek.
- [ ] **Phase 2: Ad Engine Backend, Anti-Fraud & Extension Popup** - Ad bundle distribution, dynamic selector updates, 4s dwell verification, tamper-proof impression logging, and extension popup UI.
- [ ] **Phase 3: Anti-AI-Slop Marketing Web Platform** - Crisp, minimalist SaaS landing page, interactive chatbot preview mockup, 3-step "How It Works", earnings calculator, and privacy guarantee.
- [ ] **Phase 4: Advertiser Campaign Portal & User Cashout Dashboard** - Self-serve campaign builder with live ad previewer, Stripe balance top-up, and user dashboard with instant $2 cashouts (UPI/PayPal/Gift Cards).

## Phase Details

### Phase 1: Core Extension Architecture & Chatbot Adapters
**Goal**: Deliver a production-ready, Manifest V3 compliant browser extension client with isolated Shadow DOM card injection and resilient adapters for the top 5 AI chatbots.
**Depends on**: Nothing
**Requirements**: EXT-01, EXT-02, EXT-03, EXT-04, EXT-05, EXT-06, EXT-07, CARD-01, CARD-02, CARD-03, CARD-04, CARD-05
**Success Criteria**:
  1. Extension builds cleanly with WXT targeting Chrome (`.output/chrome-mv3`) with zero Manifest V3 errors.
  2. Content script attaches to ChatGPT, Claude, Gemini, Perplexity, and DeepSeek on prompt submit without intercepting or reading user input text.
  3. Ad card renders inside an open Shadow DOM with pure `createElement` nodes, strict non-blocking alignment, and an instant dismiss ("×") button.
  4. Remote selector configuration interface is wired up to fall back to hardcoded selectors gracefully.
**Plans**: 3 plans

Plans:
- [ ] 01-01: WXT project scaffolding, manifest configuration, shared type contracts, and Shadow DOM card renderer.
- [ ] 01-02: Modular site adapters for ChatGPT, Claude, and Gemini with capture-phase submit handling and SPA re-anchoring.
- [ ] 01-03: Site adapters for Perplexity and DeepSeek, plus remote selector sync mechanism.

---

### Phase 2: Ad Engine Backend, Anti-Fraud & Extension Popup
**Goal**: Build the core backend API for ad bundle distribution and verified impression ingestion, paired with anti-fraud dwell verification and a sleek extension popup.
**Depends on**: Phase 1
**Requirements**: VERIF-01, VERIF-02, VERIF-03, VERIF-04, POP-01, POP-02, POP-03, POP-04, POP-05, POP-06, API-01, API-02, API-03, API-04
**Success Criteria**:
  1. `/api/ads/bundle` serves targeted active ads and high-converting affiliate fallbacks (Cursor, Perplexity Pro, Notion) with signed tokens.
  2. Content script requires at least 4 contiguous seconds of active, focused window time (`document.visibilityState === 'visible'`) before recording a qualified impression.
  3. Batched events endpoint `/api/events/impression` validates tokens and updates the 60% user revenue share ledger and 10% referral credits.
  4. Extension popup displays real-time earnings ($), pause/resume switch, today's impression counter, and referral link copy button.
**Plans**: 3 plans

Plans:
- [ ] 02-01: Ad Engine API routes (`/api/ads/bundle`, `/api/events/impression`, `/api/config/selectors`) with affiliate fallback inventory.
- [ ] 02-02: Content script impression tracker with 4s dwell verification, active tab focus guard, and local storage batch queue.
- [ ] 02-03: Extension popup UI (earnings counter, pause toggle, referral link, dashboard link) and anonymous device ID registration.

---

### Phase 3: Anti-AI-Slop Marketing Web Platform
**Goal**: Create a high-converting, minimalist web platform that looks like a world-class consumer product (on par with Chatwait, uwait, and Linear), completely free of AI-generated clutter.
**Depends on**: Phase 2
**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04, LAND-05, LAND-06, LAND-07
**Success Criteria**:
  1. Landing page renders with strict anti-AI-slop design system (pure white/off-white background, deep slate text, 1px subtle borders, emerald accent, zero neon blobs or dev jargon).
  2. Interactive hero visual features a realistic browser mockup simulating a prompt with a live inline ad card sliding into view during wait time.
  3. 3-step "How It Works" row clearly outlines installation, prompting, and the $2 cashout.
  4. Interactive Earnings Estimator slider calculates projected earnings based on daily prompt habits.
  5. Privacy & Trust section clearly communicates zero prompt reading and links to the open-source GitHub repository.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Next.js 15 web application foundation with anti-AI-slop design system, minimal header, and interactive hero mockup.
- [ ] 03-02: "How It Works" 3-step section, dynamic earnings calculator, privacy assurance guarantee, and FAQ accordion.

---

### Phase 4: Advertiser Campaign Portal & User Cashout Dashboard
**Goal**: Deliver a self-serve advertiser portal with a live mockup previewer and Stripe top-up, alongside the user earnings dashboard with instant $2 cashouts.
**Depends on**: Phase 3
**Requirements**: ADV-01, ADV-02, ADV-03, ADV-04, DASH-01, DASH-02, DASH-03, DASH-04
**Success Criteria**:
  1. Advertisers can type their headline, display URL, and icon on `/advertise` and preview it live inside mock ChatGPT and Claude chat frames.
  2. Advertisers can choose platform/geo targeting, select CPM budgets, and top up ad balance via Stripe Checkout.
  3. User dashboard displays verified earnings balance, impression history chart, and 10% referral stats.
  4. Users with ≥$2 can request immediate cashouts via UPI (instant in India), PayPal, or Digital Gift Cards.
**Plans**: 2 plans

Plans:
- [ ] 04-01: Self-serve Advertiser Portal (`/advertise`) with live interactive ad previewer, targeting filters, and Stripe top-up flow.
- [ ] 04-02: User Earnings Dashboard (`/dashboard`) with balance overview, referral hub, and $2 instant cashout terminal.

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Core Extension Architecture & Adapters | 0/3 | Not started | - |
| 2. Ad Engine, Anti-Fraud & Extension Popup | 0/3 | Not started | - |
| 3. Anti-AI-Slop Marketing Web Platform | 0/2 | Not started | - |
| 4. Advertiser Portal & Cashout Dashboard | 0/2 | Not started | - |

---
*Roadmap created: 2026-11-21*
