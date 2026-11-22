# GitHub Copilot & Coding Agent Instructions

## Master Operational Context
Pathixo Rewards is an enterprise-grade AI monetization platform and browser extension.
All agents and contributors are bound by **`AGENTS.md`** (Single Point of Contact) and **`SUBSTANTIAL_DEVELOPMENT.md`**.

## Automated Channel Router
Run `pnpm agent:route` to inspect the sequential documentation tree for the subsystem you are editing.
Full channel documentation is located at `docs/AGENT_NETWORK_TREE.md`.

## Critical Architecture Invariants
1. **No Rapid Prototypes / No Stub Data:** Real production infrastructure only. No mock arrays, no fake demo advertisers, no arbitrary fallback numbers.
2. **Authentication Gating:**
   - Unauthenticated visitors can never access `/dashboard` or `/dashboard/referrals`.
   - Navbar displays "Sign in" for guests; "Dashboard" is only visible when logged in.
   - Public `/login` must never display admin emails or test account pickers.
   - Allowlisted admin (`jhaabhijeet864@gmail.com`) is silently redirected to `/admin`.
3. **Extension & Shadow DOM:**
   - Isolated Shadow DOM using pure DOM methods (`document.createElement`, `textContent`). Zero `innerHTML`.
   - Anti-fraud 4-second minimum dwell timer with tab visibility checking.
   - Zero prompt reading: Never inspect user inputs or LLM generated text.
4. **Financial Ledger:**
   - 60% user revenue share / 30% platform take / 10% referral reserve.
   - $2.00 minimum payout floor.
   - Payout settlements require transaction UTR/ref entry. Rejections refund balance automatically.

## Pre-Merge Verification
Always verify changes with:
```bash
pnpm pre-merge
```
