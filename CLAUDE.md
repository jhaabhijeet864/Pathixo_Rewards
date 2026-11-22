# CLAUDE.md — Agent Directive & Sequential Network Router Entrypoint

> **CRITICAL DIRECTIVE FOR CLAUDE CODE & CODING AGENTS**  
> Before generating code or planning modifications in this repository, you **MUST** route through the Multi-Agent Network Wiring Framework.  
> Run: `pnpm agent:route` to identify your active squad channel and read documentation in the **exact deterministic sequence**.

---

## 1. Single Point of Contact (SPOC) & Supreme Law
- **`AGENTS.md`** is the master operational contract for this entire monorepo. It overrides any default assumptions.
- **`SUBSTANTIAL_DEVELOPMENT.md`** establishes the production standard: There is no rapid prototyping, temporary stubs, mock APIs, or student-tier shortcuts in this repository.

---

## 2. Deterministic Sequential Reading Tree
This repository organizes work into **8 Specialized Squad Channels**. Read the files in your channel's deterministic order before writing code:

### Channel 0: Root Orchestrator & SPOC
1. `AGENTS.md`
2. `SUBSTANTIAL_DEVELOPMENT.md`
3. `ARCHITECTURE.md`
4. `docs/AGENT_NETWORK_TREE.md`

### Channel 1: UI & Design Squad (`ui`)
1. `AGENTS.md` (Section 3: Agent 1)
2. `SUBSTANTIAL_DEVELOPMENT.md`
3. `apps/web/ADS_KNOWLEDGE_BASE_FOR_UI.md`
4. `apps/web/app/globals.css`
*Invariants: Primary Background `#070a0e`, Card `#0d121c`, Emerald `#10b981`. Max width `max-w-6xl` or `max-w-7xl` with `mx-auto`. Zero AI slop.*

### Channel 2: Web & Homepage Squad (`home`)
1. `AGENTS.md` (Section 2 & 3: Agent 2)
2. `docs/AUTH_AND_DASHBOARD_RULES.md`
3. `apps/web/app/page.tsx`
4. `apps/web/components/Navbar.tsx`
5. `apps/web/components/EarningsCalculator.tsx`
*Invariants: Navbar only shows "Dashboard" when logged in. Unauthenticated visitors see "Sign in". Calculator maintains 60/40 split.*

### Channel 3: Auth & Security Squad (`auth`)
1. `AGENTS.md` (Section 2.1 & 3: Agent 3)
2. `docs/AUTH_AND_DASHBOARD_RULES.md`
3. `apps/web/lib/admin-auth.ts`
4. `apps/web/lib/user-store.ts`
5. `apps/web/app/login/page.tsx`
6. `apps/web/app/dashboard/page.tsx`
*Invariants: Protected routes strictly redirect unauthenticated visits to `/login`. `/login` never exposes admin badges or test accounts. Silent internal routing for allowlisted admin.*

### Channel 4: Admin Command Console Squad (`admin`)
1. `AGENTS.md` (SPOC Master Directive)
2. `docs/ADMIN_CONSOLE_SPEC.md`
3. `docs/AUTH_AND_DASHBOARD_RULES.md` (Section 4)
4. `apps/web/app/admin/layout.tsx`
5. `apps/web/app/admin/page.tsx`
6. `apps/web/lib/admin-store.ts`
*Invariants: ZERO STUB DATA. Only live telemetry & verified records. Admin email locked to `jhaabhijeet864@gmail.com`. Impersonation is read-only. Payout settlements require bank UTR/ref.*

### Channel 5: Extension & MV3 Squad (`ext`)
1. `AGENTS.md` (Section 3: Agent 4)
2. `SUBSTANTIAL_DEVELOPMENT.md` (Section 4)
3. `ARCHITECTURE.md` (Section 3)
4. `apps/extension/wxt.config.ts`
5. `apps/extension/entrypoints/content/ad-card.ts`
6. `apps/extension/lib/storage.ts`
*Invariants: Open Shadow DOM with pure DOM APIs (`createElement`, `textContent`). ZERO `innerHTML`. 4s minimum visible dwell time. Zero prompt/query reading.*

### Channel 6: Backend API & Financials Squad (`api`)
1. `AGENTS.md` (Section 3: Agent 5)
2. `ARCHITECTURE.md` (Section 4)
3. `docs/ADMIN_CONSOLE_SPEC.md`
4. `apps/web/app/api/events/impression/route.ts`
5. `apps/web/app/api/cashout/route.ts`
6. `apps/web/lib/campaign-store.ts`
*Invariants: 60% user / 30% platform / 10% referral reserve. $2.00 cashout floor. Rate limiting on all public routes.*

### Channel 7: QA Gatekeeper & Verification Squad (`qa`)
1. `AGENTS.md` (Section 3: Agent 6)
2. `SUBSTANTIAL_DEVELOPMENT.md`
3. `tests/unit/api/admin.test.ts`
4. `tests/unit/extension/ad-card.test.ts`
5. `scripts/qa/audit-financials.mjs`
*Invariants: All 84+ Vitest tests must pass. `tsc --noEmit` must pass with 0 errors. Pre-merge check must be green.*

---

## 3. Essential CLI Commands
```bash
# Route to your channel and inspect the reading tree
pnpm agent:route

# Stream channel documentation in order
pnpm agent:route --channel=admin --read

# Verify all documentation tree nodes
pnpm agent:verify

# Run full pre-merge compliance check (stub audit, doc tree, tsc, vitest)
pnpm pre-merge

# Run tests
pnpm test

# Typecheck monorepo
pnpm typecheck
```
