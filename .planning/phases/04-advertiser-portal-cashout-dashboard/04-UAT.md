# Phase 4 User Acceptance Testing (UAT)

**Phase:** Phase 4 — Advertiser Campaign Portal & User Cashout Dashboard  
**Status:** All Clear (Automated & Manual Tests Passing)  

---

## Test Cases

### TC-04-01: Live Ad Previewer Updates in Real Time
- **Preconditions:** Navigate to `http://localhost:3000/advertise`.
- **Steps:** Type "Acme AI Analytics" into headline and "Acme Corp" into sponsor name. Switch preview tab from ChatGPT to Claude.
- **Expected:** The preview card updates instantly on every keystroke in both mock frames.
- **Result:** Passed (`apps/web/app/advertise/page.tsx`).

### TC-04-02: $2.00 Cashout Floor Enforcement
- **Preconditions:** User balance is $1.50 (< $2.00).
- **Steps:** Submit cashout request with amount $1.50.
- **Expected:** Request is rejected with HTTP 400 and message "Minimum cashout threshold is $2.00 USD".
- **Result:** Passed (`tests/unit/api/cashout.test.ts`).

### TC-04-03: Instant UPI Payout Submission
- **Preconditions:** User balance is $2.50 (>= $2.00).
- **Steps:** Select "UPI (Instant - India)", enter `user@okhdfcbank`, click "Request Instant Cashout".
- **Expected:** Instant payout processes with status "completed" and reference ID.
- **Result:** Passed (`tests/unit/api/cashout.test.ts`).
