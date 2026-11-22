# THE SUBSTANTIAL ENGINEERING MANIFESTO
## ZERO TOLERANCE FOR "RAPID PROTOTYPING" & CODE SLOP

> **SUPREME DIRECTIVE FOR ALL AI AGENTS, DEVELOPERS, ARCHITECTS, AND AUTOMATED TOOLS WORKING IN THIS CODEBASE.**
>
> **THERE IS NO SUCH THING AS "RAPID PROTOTYPING" IN PATHIXO REWARDS.**
>
> We do not build hacks, half-baked demos, student proofs-of-concept, throwaways, or "quick-and-dirty" prototypes.  
> We build **substantial, production-grade, industrial financial and monetization infrastructure designed to serve unbounded numbers of users, transactions, and concurrent sessions.**

---

### 1. THE FOUNDATIONAL PRINCIPLE: SUBSTANTIAL DEVELOPMENT

Every AI coding agent (Gemini, Claude, GPT, Cursor, Copilot, Antigravity Swarm workers) is default-biased toward *rapid prototyping*—cutting corners, omitting error states, stubbing mock APIs with brittle assumptions, skipping defensive boundaries, and producing fragile, non-scalable artifacts.

**That bias is explicitly prohibited in this repository.**

In this monorepo:
1. **Production-Ready Is The Only Standard:** Every commit, component, database migration, API route, and extension adapter must be engineered for production deployment.
2. **Industrial Scalability:** Assume millions of devices, concurrent impression streams, and live bank/UPI payouts. If a solution does not scale gracefully or introduces race conditions, it is defective.
3. **Rock-Solid Fault Tolerance:** Network dropouts, DOM mutation changes across AI chatbots, unexpected user inputs, malicious payload injections, and browser reloads must be defensively handled.
4. **Architectural Completeness:** No "TODO: implement in production", no unhandled promise rejections, no loose `any` types in public interfaces, and no superficial designs.

---

### 2. THE 10 COMMANDMENTS OF SUBSTANTIAL DEVELOPMENT

#### I. Defensive Engineering Over Quick Wins
Never write code that assumes the happy path. Handle every offline state, network timeout, rate limit, quota exhaustion, and malformed payload.

#### II. Strict Security & Privacy Inviolability
- **Zero Remote Code**: Manifest V3 extensions must bundle 100% of executable code. No `eval()`, no remote script tags.
- **Zero DOM Scraping**: We never inspect, read, log, or harvest prompt text or AI model responses. We monitor layout containers and button states only.
- **Zero `innerHTML`**: Injected Shadow DOM components must use strict `document.createElement()` and `textContent` to guarantee zero XSS exposure.

#### III. Financial Precision & Exact Invariants
- The **60% User / 40% Platform** split and **$2.00 cashout floor** are mathematical invariants.
- Floating-point financial accumulation must always be normalized to avoid IEEE-754 drift.
- Anti-fraud dwell verification (minimum 4.0 contiguous foreground seconds) is an uncompromisable barrier.

#### IV. Industrial Monorepo Isolation
- Code shared between `apps/extension` and `apps/web` must live in `packages/shared`.
- No cross-app illegal directory imports. Dependencies must be properly declared in package manifests.

#### V. Comprehensive Error & Edge Case Architecture
Every route, screen, and workflow must have dedicated, branded error handling:
- 404 (Not Found)
- 500 (Application Runtime Error with error boundaries)
- 401 / 403 (Unauthorized / Forbidden)
- Rate-limiting (RFC-compliant 429 with retry backoff)
- Maintenance & Coming Soon states

#### VI. Comprehensive Automated Verification
No task is complete until verified through:
- `pnpm typecheck` (zero TypeScript errors across all workspaces)
- `pnpm lint` (clean lint rules, zero circular references)
- `pnpm test` (100% test passing rate across all unit and integration suites)
- `pnpm run qa:all` (all master QA simulation vectors passed)
- Full production builds (`pnpm --filter @pathixo/web build`, `pnpm build:extension`)

#### VII. Complete Documentation As Single Source of Truth
Whenever architectural decisions, database schemas, API routes, or user flows are introduced or modified:
- `AGENTS.md` must be updated.
- `ARCHITECTURE.md` must be updated.
- Relevant domain docs in `docs/` must be synchronized.
- Zero undocumented tribal knowledge.

#### VIII. Clean, Minimal, Non-Intrusive UX
- Zero "AI slop", neon gradients, or childish toy aesthetics.
- Professional, dark slate, high-contrast, accessibility-compliant design with responsive constraints (`max-w-6xl` / `max-w-7xl`).

#### IX. Deterministic Versioning & Releases
Follow the novel, semantic tagging and rollout conventions documented in `RELEASE_CONVENTION.md`. No random version numbers or unverified commits.

#### X. Respect The User & Advertiser Invariants
- For users: Real cash, low friction, instant low-threshold cashout, absolute privacy.
- For advertisers: Laser-targeted developer attention, verified dwell times, zero fraudulent bot impressions, automated budget safety.

---

### 3. WHAT AGENTS MUST REJECT

When working on Pathixo Rewards, AI agents and engineers must automatically refuse:
* *“Let’s just mock this for now without error handling.”*
* *“We can fix types with `any` and clean it up later.”*
* *“Skip testing because it’s a prototype.”*
* *“Hardcode this credential or URL for speed.”*
* *“Use innerHTML to inject this quickly.”*
* *“Remove this validation check so the demo works.”*

**Every line of code you write must be worthy of running in a bank-grade, high-volume consumer application.**
