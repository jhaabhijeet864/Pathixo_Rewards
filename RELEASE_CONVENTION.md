# Release Versioning and Tagging Specification

This document defines the formal release versioning and git tag naming convention for **Pathixo Rewards**.

All contributors, engineers, and autonomous AI agents working in this repository must strictly adhere to this specification. Do not create arbitrary or unstructured git tags (such as `v1`, `release-test`, `test-tag`, or `latest`).

---

## 1. Context and Architectural Rationale

Pathixo Rewards is not a monolithic single-binary application. It consists of three decoupled operational lifecycles with differing deployment cadences and approval constraints:

1. **Browser Extension Client (`apps/extension`)**:
   - Manifest V3 bundle for Google Chrome, Microsoft Edge, and Mozilla Firefox.
   - Subject to external store review cycles (typically 1 to 5 business days).
   - Version numbers must strictly adhere to ascending numeric format (`X.Y.Z`) required by web stores.

2. **Web Platform and Ad Engine (`apps/web`)**:
   - Next.js 15 App Router running the advertiser portal, user cashout dashboard, and REST API.
   - Continuous deployment on edge infrastructure with zero-downtime rollouts.

3. **Remote DOM Selector Configurations (`/api/config/selectors`)**:
   - Edge-cached JSON selector configurations used by content scripts to detect prompt submissions across ChatGPT, Claude, Gemini, Perplexity, and DeepSeek.
   - Must be hot-patched in minutes when an AI provider alters its DOM structure, without waiting for store reviews.

To govern these independent lifecycles without collisions, Pathixo Rewards uses **Domain-Qualified Semantic Tagging (DQST)**.

---

## 2. Tag Naming Format Matrix

| Release Scope | Git Tag Pattern | Example Tag | Target Subsystem | Artifacts Produced |
| :--- | :--- | :--- | :--- | :--- |
| **Monorepo Milestone** | `v<MAJOR>.<MINOR>.<PATCH>` | `v0.1.0`, `v1.0.0` | All workspaces | Chrome ZIP, Firefox ZIP, Web Build, Release Notes, Checksums |
| **Extension Store Release** | `ext-v<MAJOR>.<MINOR>.<PATCH>[-<CHANNEL>]` | `ext-v0.1.0`, `ext-v0.1.1-rc.1` | `apps/extension` | Chrome MV3 ZIP, Firefox AMO ZIP, Store Compliance Audit Report |
| **Web & Ad Engine Release** | `web-v<MAJOR>.<MINOR>.<PATCH>` | `web-v0.1.0`, `web-v0.2.0` | `apps/web` | Container images, API deployment verification |
| **Selector Hot-Patch** | `selectors-<YYYY>.<MM>.<DD>-r<N>` | `selectors-2026.11.21-r1` | `apps/web/app/api/config/selectors` | Selector syntax verification, edge cache invalidation payload |

---

## 3. Subsystem Tag Specifications

### 3.1 Monorepo Milestone Tags (`vX.Y.Z`)
Used when rolling out a synchronized platform-wide milestone across both web and extension.

- **Format**: `v<MAJOR>.<MINOR>.<PATCH>`
- **Rules**:
  - `MAJOR`: Breaking changes to cross-subsystem protocol (e.g. ad token cryptographic signing algorithm, event payload schema, database model).
  - `MINOR`: New core platform features (e.g. supporting a new AI chatbot platform, introducing a new payment rail).
  - `PATCH`: Cross-system bug fixes, security remediations, dependency patches.

### 3.2 Extension Store Tags (`ext-vX.Y.Z[-channel]`)
Used for browser extension package builds destined for the Chrome Web Store, Microsoft Edge Add-ons, and Firefox Add-ons (AMO).

- **Format**: `ext-v<MAJOR>.<MINOR>.<PATCH>[-<CHANNEL>]`
- **Permitted Channels**:
  - `preview`: Internal developer builds.
  - `beta.<N>`: Community beta testing channel (e.g. `ext-v0.1.1-beta.1`).
  - `rc.<N>`: Release candidate submitted to store staging (e.g. `ext-v0.1.1-rc.1`).
  - *No suffix*: Final verified production store release (e.g. `ext-v0.1.0`).
- **Prerequisite**:
  The version declared in `apps/extension/wxt.config.ts` must match `<MAJOR>.<MINOR>.<PATCH>`.

### 3.3 Web and API Platform Tags (`web-vX.Y.Z`)
Used for updates to the marketing landing page, self-serve advertiser portal (`/advertise`), user cashout terminal (`/dashboard`), or API routes.

- **Format**: `web-v<MAJOR>.<MINOR>.<PATCH>`
- **Rules**: Follows standard Semantic Versioning for web services and database schemas.

### 3.4 Dynamic Selector Hot-Patch Tags (`selectors-YYYY.MM.DD-rN`)
Used exclusively when an AI provider (e.g. ChatGPT, Claude, Gemini, Perplexity, or DeepSeek) updates its frontend markup and breaks DOM element detection.

- **Format**: `selectors-<YYYY>.<MM>.<DD>-r<REVISION>`
- **Example**: `selectors-2026.11.21-r1`
- **Rules**:
  - `<YYYY>.<MM>.<DD>` is the calendar date of the patch.
  - `r<N>` is the revision counter for that calendar date (e.g. `r1`, `r2`).
  - Must match the `version` field inside `apps/web/app/api/config/selectors/route.ts`.
  - Does **not** require an extension rebuild or Chrome Web Store resubmission.

---

## 4. Decision Tree for Engineers and AI Agents

When preparing a release, identify your changes and select the appropriate tag format:

```
Did your changes touch only apps/web/app/api/config/selectors/route.ts?
  ├── YES ──> Use selector tag: selectors-YYYY.MM.DD-rN
  └── NO  ──> Did your changes touch apps/extension?
                ├── YES ──> Did changes also modify web, API, or shared contracts?
                │             ├── YES ──> Use milestone tag: vX.Y.Z
                │             └── NO  ──> Use extension tag: ext-vX.Y.Z[-channel]
                └── NO  ──> Use web tag: web-vX.Y.Z
```

---

## 5. Mandatory Pre-Release Verification Protocol

Before cutting any release tag or running the release workflow, execute the following commands locally:

```bash
# 1. Type-check all packages
pnpm typecheck

# 2. Run master QA verification suite (DOM, security, anti-fraud, financials)
pnpm run qa:all

# 3. Verify extension builds cleanly
pnpm --filter @pathixo/extension build
pnpm --filter @pathixo/extension zip

# 4. Verify web application builds cleanly
pnpm --filter @pathixo/web build
```

---

## 6. How to Cut a Release

### Option A: Using Git CLI

```bash
# 1. Create the annotated tag
git tag -a v0.1.0 -m "Release v0.1.0: Initial production release of Pathixo Rewards"

# 2. Push tag to GitHub
git push origin v0.1.0
```

### Option B: Using GitHub Actions Workflow Dispatch
Navigate to **Actions** -> **Release Automation** in GitHub, select **Run workflow**, choose the branch, enter the desired tag name, and confirm.
