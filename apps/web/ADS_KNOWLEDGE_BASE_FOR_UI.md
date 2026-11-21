# Pathixo Rewards: Ads Division Knowledge Base & UI Guidelines
**Author:** Ads Head, Pathixo Rewards  
**Target Audience:** Frontend Developers, UI Bots, Landing Page Designers, Copywriters  
**Status:** Mandatory Source of Truth (Approved Architecture)

---

## 1. Core Financial Ledger & Split Formulas

Any earnings calculator, prediction widget, or marketing copy on the landing page **MUST** use these exact formulas. No inflated or fabricated numbers are allowed.

### 1.1 The Golden Invariants
- **User Revenue Share:** Exactly **60%** of verified ad revenue.
- **Platform Reserve:** Exactly **40%** (used to fund server infrastructure, anti-fraud telemetry, and payment rails).
- **Minimum Cashout Floor:** Exactly **$2.00 USD** (or ~₹170 INR via instant UPI).
- **Currency Parity Standard:** Fixed internal parity of **$1.00 USD = ₹85.00 INR**.
- **Payout Rails:** Domestic instant **UPI (India)**, global **PayPal**, and digital **Gift Cards**.

### 1.2 CPM & Per-Prompt Math
- **Standard Baseline CPM:** **$20.00 USD** per 1,000 verified impressions (range: $15–$25 CPM).
- **Gross Cost per Qualified View:** `$20.00 / 1,000 = $0.020 USD`.
- **Net User Credit per Qualified View:** `$0.020 × 0.60 = $0.0120 USD` (or ₹1.02 INR per prompt).
- *(Conservative fallback at $15 CPM: `$0.015 × 0.60 = $0.0090 USD`)*.

---

## 2. Official Prompts/Day Earning Reference Table

When the UI bot creates sliders, tables, or earning projection cards, use this exact table:

| Daily Prompts | Monthly Prompts | User Earnings @ $20 CPM | User Earnings (INR @ ₹85/$) | Days to Reach $2.00 Cashout |
| :---: | :---: | :---: | :---: | :---: |
| **5 / day** (Casual) | 150 | **$1.80** | ₹153 | ~34 days |
| **10 / day** (Light) | 300 | **$3.60** | ₹306 | ~17 days |
| **25 / day** (Average Developer) | 750 | **$9.00** | ₹765 | ~7 days |
| **50 / day** (Heavy AI User) | 1,500 | **$18.00** | ₹1,530 | ~4 days |
| **100 / day** (Power User / Coder) | 3,000 | **$36.00** | ₹3,060 | ~2 days |

Formula for Days to First Cashout:
```typescript
const daysToFirstCashout = Math.max(1, Math.ceil(2.0 / (dailyPrompts * 0.012)));
```

---

## 3. Strict Rules: Allowed Claims vs. Forbidden Claims

### ❌ STRICTLY FORBIDDEN CLAIMS (Never show on UI):
1. **Never claim users can "get rich" or earn hundreds of dollars passively:**
   - 🚫 *Wrong:* "Earn $500/month while chatting with AI!"
   - ✅ *Allowed:* "Earn $5 to $35/month passively during your normal daily coding & AI workflow."
2. **Never claim we read prompts, harvest chat history, or train AI models:**
   - 🚫 *Wrong:* "We match ads to what you're asking AI."
   - ✅ *Allowed:* "100% Zero-Prompt-Reading privacy. We observe button states (e.g. Stop button) — your prompts and responses are NEVER read, logged, or transmitted."
3. **Never claim advertisers "pay at the end of the month" (Post-Pay):**
   - 🚫 *Wrong:* "Link your bank and pay based on monthly usage."
   - ✅ *Allowed:* "Zero-debt prepaid self-serve model. Fund a $5 test tier or custom budget with instant rotation."
4. **Never claim instant payouts on unverified impressions:**
   - 🚫 *Wrong:* "Get paid the millisecond an ad appears."
   - ✅ *Allowed:* "Earn cash on verified 4-second dwell wait times (ensuring advertisers get real focus, and you get real cash)."

### ✅ MANDATORY APPROVED VALUE PROPOSITIONS:
- **60% Revenue Share**: Highest verified split in the extension ecosystem (vs Chatwait 50%, uwait 50%).
- **$2.00 Cashout Floor**: Lowest cashout minimum anywhere (vs Chatwait $10 with 30-day holds, uwait €10).
- **Supported Chatbots**: Exactly 5 platforms: **ChatGPT, Claude, Gemini, Perplexity, and DeepSeek**.
- **Open Source & Transparent**: 100% open-source code with pure Shadow DOM isolation (`attachShadow({ mode: 'open' })`) and zero `innerHTML` sinks.

---

## 4. Advertiser Division Architecture (What We Offer to Advertisers)

The landing page must feature a clean bridge to our self-serve advertising engine (`/advertise` and `/advertise/manage`).

### 4.1 Key Advertiser Selling Points
1. **Peak Focus In-Stream Placement**: 1-line sponsored cards render at the exact moment of anticipation while the AI generates answers.
2. **The 4-Second Verified Attention Guarantee**: Advertisers are never billed for phantom views, accidental scrolls, or blurred background tabs. Impressions are debited **only** after 4,000ms of active window dwell.
3. **Prepaid Micro-Plans (Zero Friction)**:
   - **Micro-Test**: **$5.00** (₹425) — ~250 impressions
   - **Starter**: **$15.00** (₹1,275) — ~750 impressions
   - **Growth (Popular)**: **$50.00** (₹4,250) — ~2,500 impressions
   - **Scale**: **$150.00** (₹12,750) — ~7,500 impressions
   - **Custom Input**: Any amount with a **$5.00 USD / ₹400 INR baseline**.
4. **Dual Currency Engine**: Seamless toggle between **USD ($)** and **INR (₹)** with UPI/card support.
5. **Real-time Advertiser Command Center (`/advertise/manage`)**:
   - Live telemetry showing impressions delivered vs budget.
   - Cross-platform delivery distribution across ChatGPT, Claude, and Gemini.
   - Instant Pause / Resume toggle and live headline/destination URL editor.

---

## 5. UI Bot Prompt Checklist (Copy-Paste Ready)

When briefing the UI bot to build or update components, instruct it with this checklist:

```text
[UI BOT INSTRUCTION CHECKLIST]
1. Financial Split: Verify user share is ALWAYS stated as 60%, platform 40%.
2. Cashout Minimum: Always state $2.00 USD floor (instant UPI / PayPal).
3. Calculator Formula: User per prompt = $0.012 USD (based on $20 blended CPM).
4. Daily Prompt Math: 25 prompts/day = $9.00/month (~7 days to first $2 cashout).
5. Chatbots Listed: Exactly 5: ChatGPT, Claude, Gemini, Perplexity, DeepSeek.
6. Advertiser Plans: State $5, $15, $50, $150 and custom (with USD and INR toggle).
7. Privacy Standard: Emphasize 0% prompt reading — strictly observes button states.
8. Links: Navigation must link to /advertise and /advertise/manage.
```
