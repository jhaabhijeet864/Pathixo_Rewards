# Phase 3 User Acceptance Testing (UAT)

**Phase:** Phase 3 — Anti-AI-Slop Marketing Web Platform  
**Status:** All Clear (Automated & Manual Tests Passing)  

---

## Test Cases

### TC-03-01: Hero Interactive Chat Simulation
- **Preconditions:** Navigate to `http://localhost:3000/`.
- **Steps:** In the hero mockup, click "Ask AI" or submit sample prompt.
- **Expected:** AI enters wait/thinking state, sponsored card slides into view below user prompt with attribution, then streamed completion finishes.
- **Result:** Passed (`apps/web/app/components/HeroChatMockup.tsx`).

### TC-03-02: Dynamic Earnings Calculator Slider
- **Preconditions:** Navigate to "Calculate your earnings" section.
- **Steps:** Drag slider from 10 to 60 prompts/day.
- **Expected:** Projected monthly rewards dynamically adjust from ~$3.00 to ~$21.60/month, highlighting instant $2 cashout qualification.
- **Result:** Passed (`apps/web/app/components/EarningsCalculator.tsx`).

### TC-03-03: FAQ Accordion Expand/Collapse
- **Preconditions:** Navigate to FAQ section.
- **Steps:** Click on each question accordion header.
- **Expected:** Item toggles cleanly; clicking another question collapses previous or expands target smoothly.
- **Result:** Passed (`apps/web/app/components/FaqSection.tsx`).
