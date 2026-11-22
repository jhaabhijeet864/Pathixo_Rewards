# Pathixo Rewards: Ads Division Knowledge Base & UI Guidelines
**Author:** Ads Head, Pathixo Rewards  
**Target Audience:** Frontend Developers, UI Bots, Landing Page Designers, Copywriters  
**Status:** Mandatory Source of Truth (Approved Architecture - Chatwait Aligned)

---

## 1. Core Financial Ledger & Split Formulas

Any earnings calculator, prediction widget, or marketing copy on the landing page **MUST** use these exact formulas. No inflated or fabricated numbers are allowed.

### 1.1 The Golden Invariants
- **User Revenue Share:** Exactly **60%** of verified ad revenue (higher than Chatwait's 50% and uwait's 50%).
- **Platform Reserve:** Exactly **40%** (used to fund server infrastructure, anti-fraud telemetry, and payment rails).
- **Minimum Cashout Floor:** Exactly **$2.00 USD** (or ₹170 INR via instant domestic UPI). Lowest in the industry (Chatwait has $10 floor with 30-day holds).
- **Currency Parity Standard:** Fixed internal parity of **$1.00 USD = ₹85.00 INR**.
- **Payout Rails:** Domestic instant **UPI (India)**, global **PayPal**, and digital **Gift Cards**.

### 1.2 Market Realities & Sustainable CPM Math
- **Chatwait Benchmark:** Advertisers are billed starting at **$2.00 USD per 1,000 views** ($2.00 CPM).
- **Pathixo Advertiser Bidding Rates:**
  - Standard Bid: **$2.00 CPM** (₹170 / 1k views)
  - Accelerated Bid: **$2.50 CPM** (₹215 / 1k views) — *Default / Most Popular*
  - Priority Bid: **$5.00 CPM** (₹425 / 1k views)
  - Custom Bid: **$2.00+ USD** (₹170+ INR)
- **Gross Cost per View:** `$0.0020 – $0.0050 USD`.
- **Dynamic Variable User Reward (Per Ad):**
  - Pathixo does **NOT** pay a fixed, artificial amount per prompt.
  - Every ad displayed pays differently based on that specific advertiser's auction CPM rate:
    $$\text{User Credit} = \left(\frac{\text{Target CPM}}{1,000}\right) \times 0.60 \times (1 \pm 5\%\text{ jitter})$$
  - *Examples:*
    - KrocPDF (@ $2.00 CPM) $\rightarrow$ User earns **~$0.0012** (₹0.10)
    - Blip (@ $2.20 CPM) $\rightarrow$ User earns **~$0.0013** (₹0.11)
    - Pathixo Labs (@ $2.80 CPM) $\rightarrow$ User earns **~$0.0017** (₹0.14)
    - Cursor (@ $4.50 CPM) $\rightarrow$ User earns **~$0.0027** (₹0.23)
  - **Blended Average:** **~$0.0015 USD** per qualified 4s+ impression (based on $2.50 blended network CPM).

---

## 2. Official Prompts/Day Earning Reference Table

When the UI bot creates sliders, calculators, or earning projection cards, use this exact table:

| Daily Prompts | Monthly Prompts | User Earnings @ $2.50 Blended CPM | User Earnings (INR @ ₹85/$) | Days to Reach $2.00 Cashout |
| :---: | :---: | :---: | :---: | :---: |
| **5 / day** (Casual) | 150 | **$0.23** | ₹19 | ~267 days |
| **10 / day** (Light) | 300 | **$0.45** | ₹38 | ~133 days |
| **25 / day** (Average Developer) | 750 | **$1.13** | ₹96 | ~54 days |
| **50 / day** (Heavy AI User) | 1,500 | **$2.25** | ₹191 | ~27 days |
| **100 / day** (Power User / Coder) | 3,000 | **$4.50** | ₹383 | ~14 days |

Formula for Days to First Cashout:
```typescript
const daysToFirstCashout = Math.max(1, Math.ceil(2.0 / (dailyPrompts * 0.0015)));
```

---

## 3. In-Stream Ad Persistence Model (Model 1)

1. **Permanent In-History Placement:**
   - In-stream ad cards **do not vanish** when generation ends or when the user scrolls.
   - The ad card remains pinned directly above its respective turn response in conversation history.
   - If a user sends 5 prompts in a chat session, each of the 5 responses retains its own sponsored ad above it.
   - Users can scroll up at any time to inspect, read, or click earlier sponsors.
2. **Zero Duplicate Impressions:**
   - Dwell timer qualifies the impression once (after 4,000ms continuous active attention).
   - Subsequent viewings while scrolling chat history do not re-bill the advertiser nor re-credit the user.

---

## 4. Advertiser Division Architecture (`/advertise` & `/advertise/manage`)

Our advertiser onboarding matches the proven block-pricing model popularized by Chatwait, adapted for global (USD) and Indian (INR) founders.

### 4.1 Chatwait-Style Block Pricing Engine
- **Bid per 1,000 impressions:**
  - Preset options: `$2.00`, `$2.50`, `$5.00`, `Custom $` (or `₹170`, `₹215`, `₹425`, `Custom ₹`).
  - Copy: *"Higher bids get more impressions. Every active campaign is eligible to show, weighted by bid, so a $5 bid earns roughly 2.5x the impressions of a $2 bid."*
- **Blocks (1 block = 1,000 impressions):**
  - Stepper / input box where advertisers select total blocks (e.g., `1 block = 1,000 impressions`, `5 blocks = 5,000 impressions`).
  - Minimum entry: **1 block ($2.00 USD / ₹170 INR)**.
- **Total Due Now Box:**
  - Transparent calculation: $\text{Total} = \text{Bid} \times \text{Blocks}$.
  - Instant checkout with zero monthly debt or deferred billing.
- **Advertiser Command Center (`/advertise/manage?id=...`):**
  - Live progress tracking (Impressions Delivered / Total Blocks Purchased).
  - Cross-platform distribution charts (ChatGPT, Claude, Gemini, etc.).
  - Instant Pause / Resume toggle and creative copy editor.

---

## 5. Strict Rules: Allowed Claims vs. Forbidden Claims

### ❌ STRICTLY FORBIDDEN CLAIMS (Never show on UI):
1. **Never claim users can "make thousands of dollars" passively:**
   - 🚫 *Wrong:* "Earn $500/month just by chatting with ChatGPT!"
   - ✅ *Allowed:* "Earn $1 to $5/month in passive cash during your normal coding and AI work — cover your coffee or API credits effortlessly."
2. **Never claim we read prompts or harvest personal data:**
   - 🚫 *Wrong:* "AI analyzes your conversation to match relevant ads."
   - ✅ *Allowed:* "100% Zero-Prompt-Reading privacy. We only detect generation states (e.g. Stop button presence) — your prompts and model responses are NEVER inspected, logged, or sent to any server."
3. **Never claim advertisers "pay at the end of the month" (Post-Pay):**
   - 🚫 *Wrong:* "Link your card and pay based on monthly invoice."
   - ✅ *Allowed:* "Prepaid block-based model. Start with just $2.00 (1,000 impressions) with instant live rotation."
4. **Never claim unverified instant credits:**
   - 🚫 *Wrong:* "Get paid the microsecond an ad renders."
   - ✅ *Allowed:* "Earn credit once the response streams for 4+ seconds of active user focus."

### ✅ MANDATORY APPROVED VALUE PROPOSITIONS:
- **60% Revenue Share**: Highest verified split in the extension ecosystem (vs Chatwait 50%, uwait 50%).
- **$2.00 Cashout Floor**: Lowest cashout minimum anywhere (vs Chatwait $10 with 30-day holds, uwait €10).
- **Supported Chatbots**: Exactly 5 platforms: **ChatGPT, Claude, Gemini, Perplexity, and DeepSeek**.
- **Open Source & Transparent**: 100% open-source code with pure Shadow DOM isolation (`attachShadow({ mode: 'open' })`) and zero `innerHTML` sinks.

---

## 6. UI Bot Prompt Checklist (Copy-Paste Ready)

When briefing the UI bot to build or update components, instruct it with this checklist:

```text
[UI BOT INSTRUCTION CHECKLIST]
1. Financial Split: Verify user share is ALWAYS stated as 60%, platform 40%.
2. Cashout Minimum: Always state $2.00 USD floor (instant UPI / PayPal).
3. Calculator Formula: User per prompt = $0.0015 USD avg (based on $2.50 blended CPM).
4. Daily Prompt Math: 25 prompts/day = $1.13/month (~54 days to first $2 cashout).
5. Chatbots Listed: Exactly 5: ChatGPT, Claude, Gemini, Perplexity, DeepSeek.
6. Advertiser Plans: Chatwait block model: Bids ($2, $2.50, $5, Custom), Blocks (1 block = 1k impressions, min $2 / ₹170).
7. Privacy Standard: Emphasize 0% prompt reading — strictly observes button states.
8. Links: Navigation must link to /advertise and /advertise/manage.
```
