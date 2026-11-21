# Browser Store Listing Copy & Compliance Package

Official submission text, policy justifications, and asset specifications for the **Chrome Web Store**, **Microsoft Edge Add-ons**, and **Firefox Add-ons (AMO)**.

---

## 1. Chrome Web Store Listing

### Title (max 45 characters)
`Pathixo Rewards: Get Paid While AI Thinks`

### Summary / Short Description (max 132 characters)
`Earn cash rewards while ChatGPT, Claude, Gemini, Perplexity, and DeepSeek generate answers. Privacy-first: never reads your chats.`

### Category
- **Primary**: Productivity
- **Secondary**: Developer Tools

### Detailed Description (Markdown)
```text
Turn the idle seconds you spend waiting for AI chatbot responses into cash rewards.

Pathixo Rewards is an open-source, privacy-first browser extension that displays subtle, 1-line sponsored cards while ChatGPT, Claude, Gemini, Perplexity, and DeepSeek generate responses.

WHY INSTALL PATHIXO REWARDS?
- 60% Revenue Share: You receive the majority of all verified ad revenue.
- $2.00 Instant Cashout: Cash out anytime with an industry-low $2 threshold via UPI (India) or PayPal globally.
- Non-Intrusive by Design: No popups, no full-screen overlays, no banner clutter. Cards mount inline within the chat stream and can be dismissed in 1 click.
- 5 Major AI Platforms Supported: Works seamlessly on ChatGPT, Claude, Gemini, Perplexity, and DeepSeek.
- 10% Lifetime Referral Bonus: Invite friends and earn 10% of their lifetime rewards.

STRICT PRIVACY GUARANTEE:
- Zero Chat Reading: Pathixo never accesses, reads, logs, or transmits your prompts or AI outputs. Content scripts observe only UI state transitions (like Send/Stop button clicks) to measure generation duration.
- Open Source: Complete source code is audited and publicly available on GitHub.
- Isolated Shadow DOM: Cards are rendered in an isolated Shadow DOM container with zero host style bleeding.
```

### Single-Purpose Policy Statement (for Google Reviewer)
```text
The single purpose of Pathixo Rewards is to reward users with cash while they wait for AI chatbot conversational responses to stream, displaying non-intrusive inline sponsored cards during the model generation interval.
```

### Host Permissions Justification (for Google Reviewer)
```text
- https://chatgpt.com/* : Required to inject the inline sponsored card adjacent to the user message turn during prompt streaming.
- https://claude.ai/* : Required to observe Claude response generation state and display inline sponsored cards.
- https://gemini.google.com/* : Required to observe Google Gemini response generation state.
- https://www.perplexity.ai/* : Required to observe Perplexity search generation state.
- https://chat.deepseek.com/* : Required to observe DeepSeek response streaming state.
- https://api.pathixo.com/* : Required to fetch ad inventory bundles, sync dynamic DOM selectors, and submit verified dwell-time impressions.
```

---

## 2. Firefox AMO Listing

- **Gecko ID**: `rewards@pathixo.com`
- **Minimum Firefox Version**: `109.0` (Manifest V3 support)
- **Support Email**: `support@pathixo.com`

---

## 3. Store Graphic Asset Specifications

| Asset | Dimensions | Format | Requirements |
| :--- | :--- | :--- | :--- |
| **Extension Icon** | 128×128 px | PNG | Transparent background, crisp at 16, 32, 48, 96, 128 |
| **Small Promo Tile** | 440×280 px | PNG / JPG | Brand emblem + tagline ("Get paid while AI thinks") |
| **Large Marquee Tile**| 1400×560 px | PNG / JPG | High-contrast showcase of inline card inside ChatGPT |
| **Store Screenshots** | 1280×800 px | PNG | Min 1, recommended 4: (1) ChatGPT inline card, (2) Extension popup balance, (3) Cashout terminal, (4) Privacy guarantee |
