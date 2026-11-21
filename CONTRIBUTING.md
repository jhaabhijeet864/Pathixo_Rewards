# Contributing to Pathixo Rewards

Thank you for your interest in contributing to Pathixo Rewards. We welcome contributions to improve the extension adapters, web portal, API endpoints, and developer tooling.

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
