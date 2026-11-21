# Phase 2 User Acceptance Testing (UAT)

**Phase:** Phase 2 — Ad Engine, Anti-Fraud & Extension Popup  
**Status:** All Clear (Automated & Manual Tests Passing)  

---

## Test Cases

### TC-02-01: Popup State & Toggle Interaction
- **Preconditions:** Extension installed.
- **Steps:** Click extension icon to open popup. Toggle switch off, then on.
- **Expected:** Earnings display updates to reflect balance. Status dot turns gray when paused, emerald when active.
- **Result:** Passed (`apps/extension/entrypoints/popup/main.ts`).

### TC-02-02: 1-Click Referral Link Copy
- **Preconditions:** Popup open.
- **Steps:** Click "Copy Referral Link".
- **Expected:** Button text changes to "✓ Copied to clipboard!" and clipboard contains `https://pathixorewards.com/?ref=<device_id>`.
- **Result:** Passed.

### TC-02-03: Dwell Threshold Qualification ($\ge 4\text{s}$)
- **Preconditions:** Prompt submitted on AI chatbot.
- **Steps:**
  - Case A: Chatbot completes in 2 seconds (< 4000ms).
  - Case B: Chatbot completes in 5 seconds (>= 4000ms) with visible window.
- **Expected:**
  - Case A: Disqualified (`tests/unit/api/impression-event.test.ts`).
  - Case B: Qualified, impression logged, $0.009 USD credited.
- **Result:** Passed.
