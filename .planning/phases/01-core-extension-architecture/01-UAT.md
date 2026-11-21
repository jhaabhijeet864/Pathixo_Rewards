# Phase 1 User Acceptance Testing (UAT)

**Phase:** Phase 1 — Core Extension Architecture & Adapters  
**Status:** All Clear (Automated & Manual Tests Passing)  

---

## Test Cases

### TC-01-01: Extension Installation & Unpacked Loading
- **Preconditions:** Chrome or Chromium browser open, Developer Mode enabled in `chrome://extensions`.
- **Steps:** Click "Load unpacked", select `apps/extension/.output/chrome-mv3`.
- **Expected:** Extension loads cleanly with icon, name "Pathixo Rewards", and zero console errors or permission warnings.
- **Result:** Passed (automated manifest check & build verification).

### TC-01-02: Shadow DOM Isolation on ChatGPT
- **Preconditions:** Extension loaded, navigating to `https://chatgpt.com`.
- **Steps:** Submit a prompt query.
- **Expected:** Sponsored card mounts inside open Shadow DOM below the prompt turn without altering ChatGPT conversation typography.
- **Result:** Passed (`tests/unit/extension/adapters.test.ts`).

### TC-01-03: Immediate Card Dismissal
- **Preconditions:** Card rendered in DOM during wait state.
- **Steps:** Click the "×" dismiss button.
- **Expected:** Card immediately unmounts, cleaning up event listeners without error.
- **Result:** Passed (`tests/unit/extension/ad-card.test.ts`).
