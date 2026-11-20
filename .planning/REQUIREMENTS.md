# Requirements: Pathixo Rewards

**Defined:** 2026-11-21
**Core Value:** Users earn real money with instant low-threshold cashouts ($2 floor) while AI generates, while advertisers reach laser-focused AI power users via non-intrusive, privacy-first inline cards that never read or harvest user chats.

## v1 Requirements

### Extension & Site Adapters

- [x] **EXT-01**: Manifest V3 extension configuration with WXT + TypeScript targeting Chrome, Edge, and Firefox.
- [x] **EXT-02**: ChatGPT adapter detecting classic, wm-app, and redesigned bubble composers, monitoring send/stop buttons and reanchoring across SPA navigations.
- [x] **EXT-03**: Claude adapter detecting Tiptap input, send message triggers, and settlement debounce window during conversation loading.
- [x] **EXT-04**: Gemini adapter handling Angular web components (`rich-textarea`, `user-query`, `pending-request`) and surviving transition to permanent model response.
- [x] **EXT-05**: Perplexity adapter detecting query submissions and reasoning generation state.
- [x] **EXT-06**: DeepSeek adapter detecting deep-thinking cycles and positioning card cleanly above the thinking box.
- [x] **EXT-07**: Remote selector update listener fetching edge-cached JSON selectors so DOM changes are patched without waiting for Web Store reviews.

### In-Page Ad Presentation & Safety

- [x] **CARD-01**: Shadow DOM wrapper (`attachShadow({ mode: 'open' })`) isolating all card styles from host AI CSS.
- [x] **CARD-02**: Native DOM creation (`createElement` / `textContent`) with zero `innerHTML` usage to guarantee XSS immunity and pass Web Store security audits.
- [x] **CARD-03**: Visible "Sponsored • via Pathixo Rewards" attribution badge and sponsor logo/icon.
- [x] **CARD-04**: Dismiss ("×") button enabling the user to immediately hide the ad for that turn.
- [x] **CARD-05**: Strict non-blocking positioning ensuring chatbot prompts and streamed outputs are never obscured.

### Anti-Fraud & Dwell Tracking

- [x] **VERIF-01**: Minimum 4-5 seconds continuous visible dwell time timer before logging an impression.
- [x] **VERIF-02**: Active tab and window focus check via `document.visibilityState === 'visible'`.
- [x] **VERIF-03**: Hourly rate-limiting (maximum 30 impressions per user per hour) to stop automated bot spamming.
- [x] **VERIF-04**: Batched, cryptographically signed impression event flushing to `/api/events/impression`.

### Extension Popup & Account Sync

- [x] **POP-01**: Real-time earnings display (in USD to 4 decimal places).
- [x] **POP-02**: Master toggle switch (Pause / Resume sponsored cards).
- [x] **POP-03**: Today's impression counter.
- [x] **POP-04**: 1-click referral link copy shortcut.
- [x] **POP-05**: "Open Dashboard" button linking to web portal.
- [x] **POP-06**: Hybrid device onboarding (instant anonymous device ID + optional account linking).

### Web Platform & Anti-AI-Slop Landing Page

- [x] **LAND-01**: Minimalist, anti-AI-slop design system (pure white #FFFFFF / off-white #F9FAFB, slate text #0F172A, 1px subtle borders, emerald accent #10B981, zero dev jargon, zero neon blobs).
- [x] **LAND-02**: Sticky minimal navbar with wordmark, 3 links (How it works, Privacy, FAQ), and "Add to Chrome — Free" CTA button.
- [x] **LAND-03**: Hero section with outcome-driven H1 ("Get paid while AI thinks."), 2-sentence subheadline, supported AI badges, and an interactive simulated chatbot preview with inline ad card.
- [x] **LAND-04**: 3-step "How It Works" row (1. Install in 10s, 2. Prompt normally, 3. Cash out at $2).
- [x] **LAND-05**: Interactive Earnings Estimator slider and transparent revenue split visual (60% User / 40% Platform).
- [x] **LAND-06**: Privacy & Trust section detailing zero prompt reading and linking to open-source GitHub repository.
- [x] **LAND-07**: Clean 4-item FAQ accordion and minimal footer.

### Advertiser Portal (`/advertise`)

- [x] **ADV-01**: Live Interactive Creative Previewer (advertisers type headline, brand name, target link, icon and view real-time rendering inside mock ChatGPT and Claude frames).
- [x] **ADV-02**: Campaign builder with platform selection (e.g. Claude devs vs ChatGPT power users) and geo/country filters.
- [x] **ADV-03**: Transparent CPM calculator ($15–$25 CPM) with estimated impression projections.
- [x] **ADV-04**: Stripe Checkout integration for balance deposits ($50, $100, $250, $500).

### User Earnings & Cashout Dashboard (`/dashboard`)

- [x] **DASH-01**: Overview of total earnings balance, lifetime payouts, and today's verified impressions.
- [x] **DASH-02**: $2 Cashout terminal with instant payout support (UPI for India, PayPal, or Digital Gift Cards).
- [x] **DASH-03**: Referral Hub with unique referral link, referral count, and 10% bonus earnings tracker.
- [x] **DASH-04**: Device linking manager to aggregate earnings from multiple personal computers.

### Core Backend & Ad Engine

- [x] **API-01**: `/api/ads/bundle` endpoint returning targeted active ad campaigns with cryptographically signed `ad_token`s.
- [x] **API-02**: Default high-yield affiliate fallback engine (Cursor, Perplexity Pro, Notion) ensuring 100% fill rate and sustainable baseline earnings.
- [x] **API-03**: `/api/events/impression` endpoint verifying dwell tokens, debiting advertiser balances, and crediting 60% user revenue share + 10% referral bonus.
- [x] **API-04**: `/api/config/selectors` edge endpoint serving dynamic DOM selectors for real-time AI site adaptation.

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| EXT-01, EXT-02, EXT-03, EXT-04, EXT-05, EXT-06, EXT-07 | Phase 1 | Complete |
| CARD-01, CARD-02, CARD-03, CARD-04, CARD-05 | Phase 1 | Complete |
| VERIF-01, VERIF-02, VERIF-03, VERIF-04 | Phase 2 | Complete |
| POP-01, POP-02, POP-03, POP-04, POP-05, POP-06 | Phase 2 | Complete |
| API-01, API-02, API-03, API-04 | Phase 2 | Complete |
| LAND-01, LAND-02, LAND-03, LAND-04, LAND-05, LAND-06, LAND-07 | Phase 3 | Complete |
| ADV-01, ADV-02, ADV-03, ADV-04 | Phase 4 | Complete |
| DASH-01, DASH-02, DASH-03, DASH-04 | Phase 4 | Complete |

**Coverage:**
- v1 requirements: 32 total
- Completed: 32 / 32
- Unmapped: 0 ✓

---
*Requirements verified: 2026-11-21*
