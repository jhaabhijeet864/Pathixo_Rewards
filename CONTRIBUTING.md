# Contributing to Pathixo Rewards

Thank you for your interest in contributing to Pathixo Rewards. We welcome contributions to improve the extension adapters, web portal, API endpoints, and developer tooling.

---

> [!IMPORTANT]
> ### THE PARAMOUNT PRINCIPLE: NO RAPID PROTOTYPING
> **There is no such thing as "rapid prototyping" or "college-project code" in this repository.**
> We do not accept temporary hacks, fragile proofs-of-concept, or code shortcuts. Pathixo Rewards is engineered as **substantial, production-ready, bank-grade industrial software** serving an unbounded number of concurrent users and financial transactions.
>
> Every PR, contribution, and AI-assisted change must meet complete production standards:
> 1. Strict TypeScript validation (zero loose `any` types).
> 2. Full error handling and edge-case protection (network timeouts, offline modes, rate-limits).
> 3. Zero security bypasses (open Shadow DOM isolation, zero `innerHTML`, zero prompt-reading).
> 4. 100% passing automated test and QA suite verification (`pnpm run check:all`).
>
> *(Read [SUBSTANTIAL_DEVELOPMENT.md](./SUBSTANTIAL_DEVELOPMENT.md) and [AGENTS.md](./AGENTS.md) before submitting any work).*

---

## 1. Development Prerequisites

- **Node.js**: v20.0.0 or later (v22 LTS recommended)
- **pnpm**: v9.0.0 or later (`npm install -g pnpm`)
- **Browser**: Google Chrome, Microsoft Edge, Brave, or Mozilla Firefox

---

## 2. Getting Started

1. Clone the repository and install dependencies:
   ```bash
   pnpm install
   ```

2. Copy the environment configuration template:
   ```bash
   cp .env.example .env.local
   ```

3. Start development servers:
   - **Web Platform**:
     ```bash
     pnpm dev:web
     ```
     Access the web UI at `http://localhost:3000`.
   - **Browser Extension**:
     ```bash
     pnpm dev:extension
     ```
     Loads extension in hot-reload mode.

---

## 3. Loading the Extension Locally

1. Build the extension package:
   ```bash
   pnpm build:extension
   ```
2. Navigate to `chrome://extensions` in your browser.
3. Enable **Developer mode** in the upper-right corner.
4. Click **Load unpacked** and select `apps/extension/.output/chrome-mv3`.
5. Visit any supported platform (ChatGPT, Claude, Gemini, Perplexity, or DeepSeek) to test functionality.

---

## 4. Coding Standards

### 4.1 Chrome Web Store Compliance
- **Never use `innerHTML`**: Always create DOM nodes using `document.createElement()` and assign text via `element.textContent`.
- **Zero Remote Code**: Do not dynamically evaluate strings or load remote script resources.
- **Privacy First**: Content scripts must not read, inspect, or transmit user conversation prompts or AI output texts.

### 4.2 Code Structure
- Shared data types belong in `packages/shared/src/types.ts`.
- Content script adapters for AI platforms belong in `apps/extension/entrypoints/content/adapters/`.
- Backend API routes belong in `apps/web/app/api/`.

---

## 5. Verification Commands

Before opening a pull request, run the following verification checks:

```bash
# Type-check all workspaces
pnpm typecheck

# Validate AI platform DOM selectors
pnpm test:selectors

# Verify repository structure and security constraints
pnpm verify:repo

# Build web application and extension artifacts
pnpm build:web
pnpm build:extension
```

---

## 6. Submitting Changes

1. Create a descriptive feature branch:
   `git checkout -b feat/add-new-adapter` or `git checkout -b fix/selector-update`
2. Commit your modifications with concise commit messages.
3. Push to your branch and open a Pull Request against the `main` branch.

---

## 7. Release Versioning and Tagging

When preparing or proposing release tags, follow the [Release Versioning and Tagging Specification](file:///e:/Open%20Source/Ad_AI/RELEASE_CONVENTION.md). Never invent arbitrary tags. Always use domain-qualified tags:
- Milestone: `vX.Y.Z`
- Extension: `ext-vX.Y.Z[-channel]`
- Web: `web-vX.Y.Z`
- Selectors: `selectors-YYYY.MM.DD-rN`
