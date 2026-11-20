# Requirements: Pathixo Rewards

**Defined:** 2026-11-21
**Core Value:** Users earn real money with instant low-threshold cashouts ($2 floor) while AI generates, while advertisers reach laser-focused AI power users via non-intrusive, privacy-first inline cards that never read or harvest user chats.

## v1 Requirements

### Extension & Site Adapters

- [ ] **EXT-01**: Manifest V3 extension configuration with WXT + TypeScript targeting Chrome, Edge, and Firefox.
- [ ] **EXT-02**: ChatGPT adapter detecting classic, wm-app, and redesigned bubble composers, monitoring send/stop buttons and reanchoring across SPA navigations.
- [ ] **EXT-03**: Claude adapter detecting Tiptap input, send message triggers, and settlement debounce window during conversation loading.
- [ ] **EXT-04**: Gemini adapter handling Angular web components (`rich-textarea`, `user-query`, `pending-request`) and surviving transition to permanent model response.
- [ ] **EXT-05**: Perplexity adapter detecting query submissions and reasoning generation state.
- [ ] **EXT-06**: DeepSeek adapter detecting deep-thinking cycles and positioning card cleanly above the thinking box.
- [ ] **EXT-07**: Remote selector update listener fetching edge-cached JSON selectors so DOM changes are patched without waiting for Web Store reviews.

### In-Page Ad Presentation & Safety

- [ ] **CARD-01**: Shadow DOM wrapper (`attachShadow({ mode: 'open' })`) isolating all card styles from host AI CSS.
- [ ] **CARD-02**: Native DOM creation (`createElement` / `textContent`) with zero `innerHTML` usage to guarantee XSS immunity and pass Web Store security audits.
- [ ] **CARD-03**: Visible "Sponsored • via Pathixo Rewards" attribution badge and sponsor logo/icon.
- [ ] **CARD-04**: Dismiss ("×") button enabling the user to immediately hide the ad for that turn.
- [ ] **CARD-05**: Strict non-blocking positioning ensuring chatbot prompts and streamed outputs are never obscured.

### Anti-Fraud & Dwell Tracking

- [ ] **VERIF-01**: Minimum 4-5 seconds continuous visible dwell time timer before logging an impression.
- [ ] **VERIF-02**: Active tab and window focus check via `document.visibilityState === 'visible'`.
- [ ] **VERIF-03**: Hourly rate-limiting (maximum 30 impressions per user per hour) to stop automated bot spamming.
- [ ] **VERIF-04**: Batched, cryptographically signed impression event flushing to `/api/events/impression`.

### Extension Popup & Account Sync

- [ ] **POP-01**: Real-time earnings display (in USD to 4 decimal places).
- [ ] **POP-02**: Master toggle switch (Pause / Resume sponsored cards).
- [ ] **POP-03**: Today's impression counter.
- [ ] **POP-04**: 1-click referral link copy shortcut.
- [ ] **POP-05**: "Open Dashboard" button linking to web portal.
- [ ] **POP-06**: Hybrid device onboarding (instant anonymous device ID + optional account linking).

### Web Platform & Anti-AI-Slop Landing Page

- [ ] **LAND-01**: Minimalist, anti-AI-slop design system (pure white #FFFFFF / off-white #F9FAFB, slate text #0F172A, 1px subtle borders, emerald accent #10B981, zero dev jargon, zero neon blobs).
- [ ] **LAND-02**: Sticky minimal navbar with wordmark, 3 links (How it works, Privacy, FAQ), and "Add to Chrome — Free" CTA button.
- [ ] **LAND-03**: Hero section with outcome-driven H1 ("Get paid while AI thinks."), 2-sentence subheadline, supported AI badges, and an interactive simulated chatbot preview with inline ad card.
- [ ] **LAND-04**: 3-step "How It Works" row (1. Install in 10s, 2. Prompt normally, 3. Cash out at $2).
- [ ] **LAND-05**: Interactive Earnings Estimator slider and transparent revenue split visual (60% User / 40% Platform).
- [ ] **LAND-06**: Privacy & Trust section detailing zero prompt reading and linking to open-source GitHub repository.
- [ ] **LAND-07**: Clean 4-item FAQ accordion and minimal footer.

### Advertiser Portal (`/advertise`)

- [ ] **ADV-01**: Live Interactive Creative Previewer (advertisers type headline, brand name, target link, icon and view real-time rendering inside mock ChatGPT and Claude frames).
- [ ] **ADV-02**: Campaign builder with platform selection (e.g. Claude devs vs ChatGPT power users) and geo/country filters.
- [ ] **ADV-03**: Transparent CPM calculator ($15–$25 CPM) with estimated impression projections.
- [ ] **ADV-04**: Stripe Checkout integration for balance deposits ($50, $100, $250, $500).

### User Earnings & Cashout Dashboard (`/dashboard`)

- [ ] **DASH-01**: Overview of total earnings balance, lifetime payouts, and today's verified impressions.
- [ ] **DASH-02**: $2 Cashout terminal with instant payout support (UPI for India, PayPal, or Digital Gift Cards).
- [ ] **DASH-03**: Referral Hub with unique referral link, referral count, and 10% bonus earnings tracker.
- [ ] **DASH-04**: Device linking manager to aggregate earnings from multiple personal computers.

### Core Backend & Ad Engine

- [ ] **API-01**: `/api/ads/bundle` endpoint returning targeted active ad campaigns with cryptographically signed `ad_token`s.
- [ ] **API-02**: Default high-yield affiliate fallback engine (Cursor, Perplexity Pro, Notion) ensuring 100% fill rate and sustainable baseline earnings.
- [ ] **API-03**: `/api/events/impression` endpoint verifying dwell tokens, debiting advertiser balances, and crediting 60% user revenue share + 10% referral bonus.
- [ ] **API-04**: `/api/config/selectors` edge endpoint serving dynamic DOM selectors for real-time AI site adaptation.

---

## v2 Requirements

### Deferred to Future Milestones
- **V2-01**: Direct AI Subscription Credit Redemptions (convert earnings directly into ChatGPT Plus or Claude Pro voucher codes).
- **V2-02**: Interactive Micro-Bounties / 1-Click Polls during long (>15s) deep research queries paying $0.10–$0.25 per interaction.
- **V2-03**: Mobile browser support (Firefox for Android).

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Prompt text or response harvesting | Strictly banned by Chrome Web Store policies and breaks our zero-data privacy guarantee. |
| Injected video or interstitial popups | Destroys chatbot UX, increases latency, and guarantees store removal. |
| Over-broad browser permissions (`<all_urls>`, `cookies`, `tabs`) | Causes extended manual review delays or rejection by Google. |
| High payout thresholds ($10+) | Competitor failure mode; we commit to the $2 cashout floor. |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| EXT-01, EXT-02, EXT-03, EXT-04, EXT-05, EXT-06, EXT-07 | Phase 1 | Pending |
| CARD-01, CARD-02, CARD-03, CARD-04, CARD-05 | Phase 1 | Pending |
| VERIF-01, VERIF-02, VERIF-03, VERIF-04 | Phase 2 | Pending |
| POP-01, POP-02, POP-03, POP-04, POP-05, POP-06 | Phase 2 | Pending |
| API-01, API-02, API-03, API-04 | Phase 2 | Pending |
| LAND-01, LAND-02, LAND-03, LAND-04, LAND-05, LAND-06, LAND-07 | Phase 3 | Pending |
| ADV-01, ADV-02, ADV-03, ADV-04 | Phase 4 | Pending |
| DASH-01, DASH-02, DASH-03, DASH-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 32 total
- Mapped to phases: 32
- Unmapped: 0 ✓

---
*Requirements defined: 2026-11-21*
*Last updated: 2026-11-21 after initial definition*
