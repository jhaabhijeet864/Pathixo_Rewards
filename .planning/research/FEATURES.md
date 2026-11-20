# Research: Features Specification for Pathixo Rewards

**Domain:** Browser Extension Monetization & AI Inline Ad Network
**Status:** Approved

---

## 1. Extension Features (Client-Side)

### A. Modular Site Adapters
- **Supported AI Chatbots**:
  1. `ChatGPT` (`https://chatgpt.com/*`): Detects classic composer, wm-app (signed-out), and redesigned bubble surfaces; hooks into send button / Enter keydown (capture phase); monitors `Stop generating` button and reanchors across dynamic SPA rebuilds.
  2. `Claude` (`https://claude.ai/*`): Hooks into Tiptap composer, monitors trailing messages with settlement debounce (preventing false triggers during chat history hydration), and inserts ad escaping bubble background.
  3. `Gemini` (`https://gemini.google.com/*`): Hooks Angular web components (`rich-textarea`, `user-query`, `pending-request`), surviving DOM teardown when transient stream becomes permanent `model-response`.
  4. `Perplexity` (`https://www.perplexity.ai/*`): Detects search query submission, monitors active search/pro reasoning state, and positions card below the query turn.
  5. `DeepSeek` (`https://chat.deepseek.com/*`): Detects deep-thinking generation cycles, attaches non-intrusively above reasoning accordion.

### B. Inline Ad Card Presentation
- **Shadow DOM Isolation**: Attached to a host wrapper node with `attachShadow({ mode: 'open' })`.
- **Layout & Structure**:
  - Small sponsor icon / logo (20x20 rounded).
  - Clean sponsor link + crisp headline.
  - "Sponsored • via Pathixo Rewards" micro-badge.
  - Subtle close button ("×") that dismisses the card and cancels impression logging for that turn.
- **Strict Non-Blocking Placement**: Never covers the chatbot input area, never obscures streamed response tokens, and never breaks page navigation.

### C. Impression Verification & Anti-Fraud Engine
- **Dwell Time Requirement**: Minimum 4-5 seconds of continuous visible presence.
- **Window Visibility Check**: Must satisfy `document.visibilityState === 'visible'` and window focus.
- **Rate-Limiting & Capping**: Maximum 30 verified impressions per user per hour to prevent synthetic automated prompt spamming.
- **Cryptographic Event Payload**: Impression logs sent in batches with timestamp, signed ad token, dwell duration, and anonymous device hash.

### D. User Extension Popup
- Real-time earnings tally (e.g. `$1.4520`).
- Master toggle switch: Pause / Resume sponsored cards.
- Today's impression count.
- One-click copy referral link (10% referral tier).
- "Open Dashboard" button linking to web portal.
- Build identifier and version badge.

---

## 2. Web Platform Features

### A. Anti-AI-Slop Landing Page
- **Color Palette & Styling**: Pure white (`#FFFFFF`) / light slate (`#F9FAFB`), slate text (`#0F172A`), single emerald accent (`#10B981`), zero purple/cyan neon blobs.
- **Navbar**: Wordmark logo, 3 links (`How it works`, `Privacy`, `FAQ`), and high-contrast CTA button (`Add to Chrome — Free`).
- **Hero Section**:
  - Outcome-focused H1: *"Get paid while AI thinks."*
  - Plain-English 2-line explanation.
  - "Add to Chrome" button + supported badges (ChatGPT, Claude, Gemini, Perplexity, DeepSeek).
  - Realistic interactive UI mockup simulating a prompt with the subtle ad card sliding in.
- **3-Step "How It Works"**:
  1. *Install in 10 seconds*: Add extension to Chrome, no sign-up or credit card required.
  2. *Prompt as usual*: One neat, labeled line appears only while the AI is thinking.
  3. *Cash out at $2*: Withdraw instant cash via UPI, PayPal, or Gift Cards once you hit $2.
- **Transparent Split & Interactive Calculator**:
  - Visual breakdown: 60% to you / 40% platform cut.
  - Dynamic slider: Select daily prompt volume (e.g., 20 prompts/day) -> instant monthly earnings estimation.
- **Zero-Data Privacy Guarantee**:
  - Crisp assurances: Never reads chat text, never logs prompts, open source on GitHub, 1-click pause anytime.
- **Minimalist FAQ & Clean Footer**.

### B. Advertiser Portal (`/advertise`)
- **Self-Serve Campaign Builder**:
  - Live Interactive Creative Previewer: Advertisers enter headline, display URL, target URL, and brand icon; view live interactive rendering inside mock ChatGPT and Claude chat frames.
  - Targeting Controls: Platform selection (e.g. Claude devs vs ChatGPT power users), country/geo filters.
  - Transparent CPM Pricing: Fixed transparent tiers ($15 - $25 CPM) with clear estimated reach.
  - Instant Stripe Checkout: Top up ad balance ($50, $100, $250, $500).

### C. User Dashboard (`/dashboard`)
- **Overview**: Current balance, total lifetime cashouts, and today's verified impressions.
- **Cashout Terminal**:
  - Active balance progress toward the $2 cashout floor.
  - Withdrawal options: UPI (Instant for India), PayPal, and Digital Gift Cards.
- **Referral Center**:
  - Unique referral link.
  - 10% referral bonus tracking (earn 10% on referred friends' earnings for life).
- **Device Management**:
  - Sync multiple browsers/laptops to a single unified account.
