# Pathixo Rewards

## What This Is

Pathixo Rewards is an open-source browser extension and two-sided advertising platform that pays users cash while AI chatbots (ChatGPT, Claude, Gemini, Perplexity, and DeepSeek) are generating responses. It turns dead waiting time into user earnings and high-attention B2B ad inventory, accompanied by a clean, minimalist web platform featuring a high-converting landing page, self-serve advertiser campaign portal with real-time live preview, user earnings dashboard with instant micro-cashouts ($2 minimum), and an open-source Manifest V3 extension.

## Core Value

Users earn real money with instant low-threshold cashouts ($2 floor) while AI generates, while advertisers reach laser-focused AI power users via non-intrusive, privacy-first inline cards that never read or harvest user chats.

## Engineering Standard: Substantial Development (No Rapid Prototyping)

**Crucial Mandate for All Agents & Engineers:**
There is NO such thing as "rapid development" or "quick throwaway prototyping" on Pathixo Rewards. We build substantial, industrial-grade software engineered for unbounded scale, rock-solid security, and financial ledger integrity. Temporary hacks, unhandled errors, mock stubs in production, or superficial feature implementation are categorically forbidden. Refer to `SUBSTANTIAL_DEVELOPMENT.md` and `AGENTS.md`.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **EXT-01**: Manifest V3 browser extension built with WXT and TypeScript supporting Chrome, Edge, and Firefox.
- [ ] **EXT-02**: Modular DOM content script adapters detecting prompt generation and streaming completion across ChatGPT, Claude, Gemini, Perplexity, and DeepSeek.
- [ ] **EXT-03**: Remote selector configuration sync so AI DOM updates can be patched instantly without waiting for Chrome Web Store reviews.
- [ ] **EXT-04**: Isolated Shadow DOM ad card container (`attachShadow({ mode: 'open' })`) that prevents style conflicts, ensures non-blocking placement, and features clear "Sponsored • via Pathixo Rewards" labeling and instant dismiss ("×") button.
- [ ] **EXT-05**: Verification and anti-fraud dwell timer requiring `document.visibilityState === 'visible'` and 4-5 seconds active window time before issuing a verified impression event.
- [ ] **EXT-06**: Clean browser extension popup displaying real-time earnings balance, status toggle (Pause/Resume), today's impression counter, referral link shortcut, and direct dashboard button.
- [ ] **EXT-07**: Hybrid onboarding allowing instant anonymous usage via client-generated device ID, with optional 1-click Google/Email account linking to sync devices and request cashouts.
- [ ] **WEB-01**: Ultra-clean, anti-AI-slop landing page built with Next.js App Router and Tailwind CSS following a minimalist light-mode aesthetic (pure white #FFFFFF / off-white #F9FAFB, deep slate text #0F172A, 1px subtle borders, emerald accent #10B981, zero dev jargon, zero neon gradients).
- [ ] **WEB-02**: Interactive Hero section with live mock chatbot UI showing the non-intrusive sponsored card sliding in during simulated AI generation.
- [ ] **WEB-03**: 3-step "How It Works" section (Install in 10s -> Prompt normally -> Cash out at $2).
- [ ] **WEB-04**: Interactive Earnings Estimator slider and transparent revenue split breakdown (60% User / 40% Platform).
- [ ] **WEB-05**: Strict Privacy & Trust section proving zero chat reading, open-source code link, and single-purpose permission compliance.
- [ ] **WEB-06**: Self-serve Advertiser Portal (`/advertise`) with a live interactive ad creative previewer (type headline/link and see it render inside mock ChatGPT/Claude), CPM budget calculator, and campaign checkout.
- [ ] **WEB-07**: User Earnings Dashboard (`/dashboard`) displaying balance, verified impression history, referral statistics (10% bonus tier), and cashout request flow ($2 minimum via instant rails: UPI, PayPal, or Gift Cards). Note: STRICTLY GATED. The Dashboard route and the Navbar Dashboard link appear ONLY when a user is authenticated.

### Authentication & Dashboard Invariants (Mandatory Rule for All Agents)

1. **Navbar Link Visibility**: The `Dashboard` button beside `Add to Chrome` and inside the mobile drawer **ONLY** appears when a user is properly logged in (`pathixo_auth_session` exists with `logged_in === true` and a valid email). When unauthenticated, it is hidden and replaced by `Sign in`.
2. **Route Gating**: Direct access to `/dashboard` or `/dashboard/referrals` without authentication immediately redirects to `/login`. Unauthenticated visitors must never see the rewards console, metric cards, or cashout forms.
3. **Environment Security**: The `user@gmail.com` stub / 1-click test bypass is restricted exclusively to local development (`process.env.NODE_ENV !== 'production'`) and is strictly forbidden in production.
- [ ] **API-01**: Secure Ad Engine API endpoints: `/api/ads/bundle` (targeted ad delivery), `/api/events/impression` (tamper-proof dwell-time verification and impression debit/credit), and `/api/device/sync`.
- [ ] **API-02**: Default high-yield fallback inventory (AI & devtool affiliate deals e.g., Cursor, Perplexity, Notion) ensuring users always earn even before initial advertiser volume ramps up.

### Out of Scope

- Reading or scraping user prompt text or AI generation content — strictly prohibited by Chrome Web Store policies and privacy guarantee.
- Intrusive banner takeovers, video overlays, or unskippable popups — degrades chatbot usability and triggers instant store rejection.
- Overly broad browser permissions (`<all_urls>`, `webRequest`, `cookies`, `tabs`) — will trigger Chrome Web Store rejection.
- Cryptomining in the browser — malicious and universally banned.
- High payout thresholds ($10+ / €10) with 30-day holds (Chatwait/Uwait flaw) — Pathixo Rewards' competitive moat is the instant $2 threshold.

## Context

- Competitive landscape analysis demonstrates clear market gaps:
  - **Chatwait**: 70k+ users, but restricted to 3 chatbots, 50% split, and a high $10 payout floor through Whop with a 30-day holding period.
  - **uwait**: 8 chatbots, but closed source, reads cited domains (creating privacy hesitation), and enforces a €10 threshold via Stripe.
  - **AdWait**: Pre-launch, closed source, low-yield display ads ($0.0002/view requiring 25,000 queries to hit $5).
- Direct B2B sponsorships and targeted SaaS affiliate offers allow Pathixo Rewards to monetize at $15–$30 CPM instead of $1–$2 display networks, funding the generous 60% user split and rapid $2 payout floor.
- Strict adherence to Chrome Web Store Manifest V3 guidelines is required: zero remote executable code, pure JSON payloads, Shadow DOM injection, and explicit host permissions.
- The marketing site must rigorously avoid "AI slop" (neon purple gradients, floating glowing blobs, Bento grid overload, internal developer jargon like "Shadow DOM" or "Supabase" on user-facing pages) and look like a premium, trustworthy SaaS product (Linear / Stripe / Minimalist aesthetic).

## Constraints

- **Manifest**: Chrome Manifest V3 compatibility with zero remote code execution.
- **Frontend / Platform**: Next.js 15 (App Router), React, Tailwind CSS, Lucide Icons.
- **Extension**: WXT (Web Extension Tools) with TypeScript, multi-browser build target (Chrome, Edge, Firefox).
- **Styling Architecture**: Ad card UI must be rendered in open Shadow DOM with pure vanilla DOM construction (avoiding innerHTML sinks to pass Web Store security audits).
- **Design Standard**: Anti-AI-slop design rules: clean light theme, Inter/Geist typography, generous whitespace, max 3 links in header, no buzzwords.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Monorepo with Next.js + WXT TypeScript | Shared TypeScript types, unified repository, fast local iteration | — Pending |
| 60% User / 40% Platform revenue share | Differentiates from Chatwait (50%) and Uwait (50%), driving organic user growth | — Pending |
| $2 minimum cashout floor | Eliminates the #1 user complaint about competitors (unreachable $10 thresholds) | — Pending |
| 5 Supported AI Platforms (ChatGPT, Claude, Gemini, Perplexity, DeepSeek) | Exceeds Chatwait (3) and covers modern developer favorites like DeepSeek | — Pending |
| Remote Selector JSON Config | Allows instant DOM adaptation when AI providers update their UI without waiting for Web Store reviews | — Pending |
| Shadow DOM with textContent/createElement | Guaranteed zero style collision and passes automated Chrome Web Store security scans | — Pending |
| High-value Direct B2B & Affiliate Fallback | Yields $15–$30 CPM to sustainably fund rapid user cashouts from Day 1 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-11-21 after initialization*
