# Research Summary: PromptPay Platform & Extension

**Executive Synthesis:**
PromptPay is uniquely positioned to dominate the emerging AI wait-time monetization space by directly addressing the three fatal flaws of existing competitors (Chatwait, uwait, and AdWait):
1. **Unreachable Payouts**: Replaces competitors' $10/€10 floors and 30-day holding periods with a friction-free **$2 minimum cashout** and instant payout rails (UPI for India, PayPal / Gift Cards globally).
2. **Low CPMs & Cluttered Ads**: Swaps low-rent programmatic banner ads for high-yield ($15–$30 CPM) direct B2B AI tool sponsorships and premium affiliate fallbacks, paying users a market-leading **60% revenue share**.
3. **Chrome Store Rejection & Trust Risks**: Built from Day 1 on strict Manifest V3 compliance with zero remote code execution, Shadow DOM style isolation, pure JSON data pipelines, and a 100% open-source client codebase verifying that user prompts and AI responses are never touched or harvested.

**Architecture Decisions:**
- **Monorepo**: Next.js 15 App Router platform (`apps/web`) paired with a WXT TypeScript extension (`apps/extension`) and shared contract types (`packages/shared`).
- **Resilient Content Injection**: Modular adapters covering ChatGPT, Claude, Gemini, Perplexity, and DeepSeek, fortified with remote JSON selector updates.
- **Anti-AI-Slop Marketing UI**: Minimalist, high-converting aesthetic (Linear/Stripe inspired) eliminating all developer jargon, neon gradients, and fake claims.
