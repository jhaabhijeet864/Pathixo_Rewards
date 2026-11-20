# Research: Pitfalls & Mitigation Strategies for Pathixo Rewards

**Domain:** Browser Extension Monetization & AI Inline Ad Network
**Status:** Approved

---

## 1. Chrome Web Store Policy Pitfalls

| Pitfall | Risk Level | Root Cause | Architectural Mitigation in Pathixo Rewards |
|---------|------------|------------|---------------------------------------|
| **Remote Code Execution Rejection** | CRITICAL (Immediate Store Ban) | Loading external JS (e.g. ad network scripts, eval, dynamic script tags). | All logic bundled locally in Manifest V3 package. Backend sends strict JSON data only. Ad cards built with native DOM elements (`createElement`). Zero `eval()` or `new Function()`. |
| **Over-Broad Permissions** | HIGH (Rejection or Weeks of Delays) | Requesting `<all_urls>`, `webRequest`, `cookies`, or broad host patterns. | Request only `storage`. Limit `host_permissions` strictly to the 5 targeted AI domains (`chatgpt.com`, `claude.ai`, `gemini.google.com`, `perplexity.ai`, `chat.deepseek.com`). |
| **Deceptive / Unlabeled Ads** | HIGH (Store Rejection under Ad Policy) | Ads masquerading as organic AI responses or hiding affiliation. | Every card is explicitly labeled with `"Sponsored • via Pathixo Rewards"`, includes an identifiable brand mark, and provides an instant dismiss ("×") button. |
| **Prompt Harvesting Suspicions** | HIGH (Trust Barrier & Review Scrutiny) | Extensions reading chat contents or full page DOM text. | Zero reading of prompt `<textarea>` values or response innerText. DOM queries are strictly confined to action buttons (e.g. `button[aria-label="Stop"]` or `data-testid="send-button"`). Open-source codebase on GitHub proves zero data harvesting. |

---

## 2. Technical & Platform Stability Pitfalls

| Pitfall | Risk Level | Root Cause | Architectural Mitigation in Pathixo Rewards |
|---------|------------|------------|---------------------------------------|
| **Frequent AI DOM Updates** | HIGH (Broken injection after AI redesign) | OpenAI, Anthropic, or Google changing CSS classes or DOM structure weekly. | **Remote Selector Config**: Extension pulls a cached JSON configuration mapping selectors. When an AI site updates its DOM, selectors are updated on the edge in 30 seconds without submitting a Chrome Web Store update. |
| **CSS Style Leakage & Collisions** | HIGH (Broken layout on host page) | Global CSS styles leaking from host site into ad card or vice versa. | **Shadow DOM Isolation**: Every ad card is enclosed in `element.attachShadow({ mode: 'open' })`. All styles are encapsulated within the shadow root; external styles cannot cascade in. |
| **Virtual DOM / Virtualized List Node Recycling** | MEDIUM (Cards unmounting or moving during long chats) | ChatGPT and Claude recycle message nodes as the chat grows. | Multi-tier anchoring: Track per-message IDs (`data-message-id` or turn UUIDs) instead of raw index counts. Continuously re-anchor on mutation if thread moves. |
| **Hydration / SPA Navigation False Triggers** | MEDIUM (Triggering ads during chat history loading) | Opening an existing thread dynamically adds user bubbles. | Settlement debounce window: When opening a chat, ignore mutations until DOM settles; only fire when an actual Enter keydown or Send button click preceded the mutation. |

---

## 3. Business & Monetization Pitfalls

| Pitfall | Risk Level | Root Cause | Architectural Mitigation in Pathixo Rewards |
|---------|------------|------------|---------------------------------------|
| **Cold Start / Zero Advertiser Liquidity** | HIGH (No ads to show on Day 1) | Launching without an active advertiser base leaves user earnings at $0. | **Affiliate Fallback Engine**: High-converting, high-yield SaaS & AI affiliate deals (Perplexity Pro, Notion, Cursor, NordVPN) are pre-bundled as default inventory, generating $15–$30 effective CPM immediately. |
| **Unattainable Payout Thresholds** | HIGH (User churn & negative reviews) | Competitors setting $10/€10 floors requiring 10,000+ prompts to cash out. | **$2 Cashout Floor & Instant Rails**: Users can withdraw their first $2 within days via instant local rails (UPI for India, PayPal / Gift Cards globally), sparking viral social proof. |
| **Bot & Synthetic Prompt Fraud** | HIGH (Advertiser budget drain) | Scripted bots spamming prompts to generate ad impressions. | Multi-layer anti-fraud: active window focus requirement (`document.visibilityState === 'visible'`), minimum 4-5s dwell timer, hourly caps (30 impressions/hour/user), and anomaly detection on user devices. |
