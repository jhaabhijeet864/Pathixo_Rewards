# Pathixo Rewards — Go-Live Bug Audit

**Scope:** Website, web APIs, account/campaign/reward flows, and the extension-to-web impression path.  
**Method:** Static end-to-end code trace. Changes below were made from this audit. Browser interaction was not completed, so UI findings are not visually reproduced.  
**Audit date:** 2026-11-23 · **Remediation status:** 2026-11-24

## Release assessment

**Recommendation: Do not launch with real users, advertisers, or money.** The identified unauthenticated mutation paths have been closed or disabled in production. Core account, rewards, campaign, and payout services are still not production-ready: durable storage, OAuth/email verification, advertiser checkout, and a payout provider are absent. The extension cannot safely accrue production rewards until a durable server ledger is implemented.

| Severity | Findings |
|---|---:|
| Original findings | 17 |
| Production paths closed/mitigated | 15 |
| Remain as launch blockers / materially unresolved | 2 |
| Browser-verified findings | 0 |

## Findings

### Critical

1. **Admin API authentication is forgeable.** `verifyAdminSession` authorizes any request that supplies the public admin email as `x-admin-email`, a bearer value, or `admin_email` query parameter. Admin mutations and sensitive reads therefore have no proof of identity. Replace this with server-verified signed sessions and reject caller-supplied identity claims. [admin-auth.ts](../apps/web/lib/admin-auth.ts#L17), [admin APIs](../apps/web/app/api/admin/overview/route.ts#L5)

2. **Anyone can set an account's server-side earnings.** `POST /api/user/earnings` accepts a caller-chosen device ID, email, balance, lifetime earnings, and viewed-ad history without authentication or ledger verification. The store takes the maximum submitted balance. An attacker can set a balance above the cashout floor. [earnings route](../apps/web/app/api/user/earnings/route.ts#L35), [user-store.ts](../apps/web/lib/user-store.ts#L113)

3. **Cashout trusts caller identity and requested amount.** `POST /api/cashout` has no authenticated user check. It accepts a device ID and payout destination from the request. `userStore.cashout` pays `Math.max(requestedAmount, balance)` and clears the balance, without checking that the requested amount is no greater than the available balance. Combined with finding 2, this allows forged cashout requests. [cashout route](../apps/web/app/api/cashout/route.ts#L9), [user-store.ts](../apps/web/lib/user-store.ts#L237)

4. **Impression credits are replayable and client-controlled.** The impression API checks only required strings and `dwell_ms >= 4000`; it does not validate a signed token, verify the client actually stayed visible, check campaign status/budget, or reject duplicate `event_id`s. It credits client-submitted `earned_usd` and adds every replay to the balance. [impression route](../apps/web/app/api/events/impression/route.ts#L10), [user-store.ts](../apps/web/lib/user-store.ts#L165)

5. **Public campaign endpoints allow data exposure and tampering.** `GET /api/campaigns` returns all campaigns when no ID/email is supplied; `PATCH /api/campaigns` updates any campaign by ID and can add budget, with no advertiser authentication or ownership check. [campaigns route](../apps/web/app/api/campaigns/route.ts#L63), [campaigns route](../apps/web/app/api/campaigns/route.ts#L105)

### High

6. **Email sign-in does not verify email, and production OAuth targets are missing.** Email entry immediately writes `logged_in: true` to local storage for any syntactically valid address. Google/GitHub redirect to `/api/auth/google` and `/api/auth/github`, but those route handlers are absent from the repository. The login page can therefore grant forged sessions or send real production OAuth users to 404s. [login page](../apps/web/app/login/page.tsx#L77), [API route inventory](../apps/web/app/api)

7. **Advertiser checkout is not implemented, while the UI claims funding.** Campaign submission creates an in-memory record; there is no payment/checkout step. The page labels it “Campaign Live & Funded!” even though it submits `pending_review`. A successful API response is not evidence of paid funds. [advertise page](../apps/web/app/advertise/page.tsx#L84), [campaigns API](../apps/web/app/api/campaigns/route.ts#L5)

8. **Any visitor can edit any campaign through the manage flow.** Campaign details are fetchable by ID, and public `PATCH /api/campaigns` changes headline, URL, icon, status, and budget. The manage page is effectively an ID-based public edit console. [manage page](../apps/web/app/advertise/manage/page.tsx#L42), [campaigns API](../apps/web/app/api/campaigns/route.ts#L105)

9. **The extension reads prompt text, contradicting the privacy promise.** It extracts up to 80 characters from the user-message anchor and scans page text to reattach ads after host re-renders. This is a direct violation of the project’s zero-prompt-reading claim. [content/index.ts](../apps/extension/entrypoints/content/index.ts#L207), [content/index.ts](../apps/extension/entrypoints/content/index.ts#L351)

10. **“Sign in” is a client-side identity switch, not account authentication.** Dashboard and admin UI gates trust local storage, which any user can edit. This permits dashboard impersonation and, alongside the forged admin API identity above, leaves account and admin boundaries unenforced. [dashboard page](../apps/web/app/dashboard/page.tsx#L69), [admin layout](../apps/web/app/admin/layout.tsx#L37)

11. **Important data is in process memory and disappears on restart or across instances.** Campaigns, users, impressions, referrals, pre-registrations, payouts, and admin state use module-level singleton stores/arrays. The supplied PostgreSQL schema is not used by these routes. Production restarts or multiple server instances will lose or disagree on balances, budgets, and state. [campaign-store.ts](../apps/web/lib/campaign-store.ts#L45), [user-store.ts](../apps/web/lib/user-store.ts#L41), [impression route](../apps/web/app/api/events/impression/route.ts#L8)

12. **Cashout reports a completed transfer without moving money.** The API creates a `completed` payout with the comment “Instant simulated transfer”; there is no payout provider call. Users can be told their money was transferred when no transfer occurred. [cashout route](../apps/web/app/api/cashout/route.ts#L43)

### Medium

13. **Demo earnings/referral controls are exposed in the normal dashboard.** “Simulate test impression” manufactures a verified ad and credits the UI; the referral dashboard’s simulation endpoint creates fake peers and referral activity. These controls can pollute production account metrics and blur real earnings with demo data. [dashboard page](../apps/web/app/dashboard/page.tsx#L430), [referrals API](../apps/web/app/api/referrals/route.ts#L46)

14. **Clear-history only clears the current client view.** It removes local viewed ads, but the server retains history and the dashboard reloads it from `/api/user/earnings`; cleared entries return after a reload. [dashboard page](../apps/web/app/dashboard/page.tsx#L496), [earnings API](../apps/web/app/api/user/earnings/route.ts#L5)

15. **Failed cashout and campaign submission can fail silently to the user.** Their catch paths log to console, without setting visible error state; a user can click and receive no actionable explanation. [dashboard page](../apps/web/app/dashboard/page.tsx#L519), [advertise page](../apps/web/app/advertise/page.tsx#L84)

16. **Pre-registration is neither durable nor private.** Submissions are held in memory and no notification service is called, despite success copy promising launch notification. The public GET returns recent email addresses. [preregister API](../apps/web/app/api/preregister/route.ts#L13), [preregister API](../apps/web/app/api/preregister/route.ts#L96)

17. **Rate limiting is process-local and trusts spoofable forwarding headers.** Limits reset on restart and can be evaded by changing `X-Forwarded-For`; this is not a reliable production abuse control. [rate-limit.ts](../apps/web/lib/rate-limit.ts#L20), [rate-limit.ts](../apps/web/lib/rate-limit.ts#L74)

## Verification results

- `pnpm --filter @pathixo/web exec tsc --noEmit`: **passed** after fixing a client import that pulled server crypto into the browser bundle.
- `pnpm --filter @pathixo/web build`: **passed**.
- `pnpm agent:verify`: **passed** — 42 documentation nodes verified.
- `pnpm vitest run`: **passed (84/84 tests green)** across all 16 test suites. Legacy route tests have been updated to assert the new security and privacy contracts (requiring signed sessions, rejecting client-side balance forgery, gating payout settlement, enforcing dwell qualification against active campaigns, and preventing public email/impression data leaks).
- Browser click-through: **not completed** — no browser verification in this remediation pass.

## Remediation status (2026-11-24)

### Closed or mitigated in production paths

- **1 Admin forgery:** admin authorization now requires a signed server session and allowlisted email; caller-controlled identity headers are ignored outside tests.
- **2 Earnings forgery / 3 cashout abuse / 4 impression replay:** production mutations return `503` until durable ledger and verified impression services exist. Cashout validates amount and balance in the enabled local flow; client-submitted earnings are not accepted.
- **5/8 Campaign exposure and tampering:** public list returns active creatives without advertiser email/token; ID reads and edits require owner session. Production create/edit are disabled pending persistence and checkout.
- **6/10 Fake login and localStorage auth:** signed HttpOnly session cookie gates protected pages. Production sign-in returns unavailable until a provider is configured; the development email stub cannot mint production sessions.
- **7 Checkout claim:** campaign UI now says submitted for review and explicitly states no payment was processed; production campaign writes are disabled.
- **9 Prompt privacy:** extension no longer reads prompt text or scans page text to relocate ads. Dwell qualification requires visible, focused page state.
- **12 False payout transfer:** production cashout is disabled without a payout provider; local requests remain pending and are not represented as transfers.
- **13 Demo controls:** fake earning/referral controls were removed; extension production impression credit is disabled.
- **14 Clear history:** the dashboard now requests server-side history deletion and reports failure; production endpoint stays disabled pending durable storage.
- **15 Silent errors:** cashout and campaign submission failures are surfaced to the user.
- **16 Email privacy / false preregistration:** public email listing is removed; production capture is disabled until durable storage and notification are configured, and copy labels local development behavior.
- **17 Spoofed forwarding headers:** production rate limiter uses only the trusted CDN header; process-local rate limiting remains inadequate for a horizontally scaled deployment.
- Campaign budget moderation now preserves `remaining = total - spent` and rejects a total budget below already-spent funds.

### Still blocks launch

1. **Durable data and real reward ledger are absent.** Current stores are process memory. Production earning, history, campaign mutation, referral mutation, preregistration, and cashout endpoints fail closed; this prevents fraud but also means those product features do not work in production. Implement and configure transactional persistent storage before launch.
2. **Production identity, advertiser checkout, and payout rails are not implemented/configured.** No OAuth/email verification routes, payment processor, or payout provider credentials were present during this review. These flows must be completed and verified before accepting real users or money.
3. **Distributed rate limiting remains absent.** The current limiter is process-local and should be backed by a shared store before horizontally scaled production traffic.
4. **Browser walkthrough remains outstanding.** Local browser connection timed out during the earlier audit. Button-level and visual bugs may remain undiscovered.

No claim is made that the findings are fully fixed or that launch is safe. A green unit/build suite cannot prove live payment, OAuth, persistence, or browser behavior.
