# Admin Command Console Specification & Invariant Rules

> **CRITICAL ARCHITECTURAL DIRECTIVE FOR ALL DEVELOPERS & AI ASSISTANTS**
>
> **Do NOT alter or remove the core functionality, real-time synchronization, or privacy guarantees of the Admin Console.**
> **STRICT PROHIBITION ON STUB DATA:** Never add fake demo users, fake payouts, fake advertiser companies (e.g. Cursor, Perplexity, Vercel), or hardcoded fallback numbers into the Admin Console or backend stores.

---

## 1. Core Architecture Overview

The **Admin Command Console** (`/admin`, powered by `apps/web/app/admin/page.tsx` and `apps/web/app/admin/layout.tsx`) is the central executive cockpit for Pathixo Rewards. It manages live operations across 5 streamlined pillars:

1. **Overview & Dual-Metric Telemetry**: Real-time financial split (60/10/30), Chrome Web Store downloads sync, live extension heartbeat device count, verified user count, and AI assistant platform dwell distributions.
2. **Campaign Moderation**: Inspecting, pausing/resuming, and editing creative headlines, target links, badges, CPM bids, and budgets for all ad campaigns running on the network.
3. **Advertisers & Inflow Ledger**: Auditing prepaid advertiser funds, consumed impression spend, remaining balances, and payment rails under a strict **No-Refund Policy**.
4. **User & Device Directory**: Searching member accounts, auditing fraud risk scores, executing 1-click **Read-Only Dashboard Impersonation**, 1-click banning of click-fraud bots, and manual balance adjustments with mandatory audit justification.
5. **Payout Settlement & Audit Rails**: 1-click copying of UPI VPAs and PayPal emails, recording bank UTR transaction references, automatic balance refunds on claim rejection, 1-click CSV bookkeeping exports (Revenue, Payouts, P&L), and immutable administrative audit logging.

---

## 2. Invariant Rules (What MUST NOT Be Changed)

### Rule 1: Zero Stub Data Invariant
- **No Mock Companies**: Never seed fake advertiser rows like `Cursor AI Tools Ltd`, `Perplexity Enterprise`, or `Vercel v0 Team`. Only real external campaigns funded via `/advertise` appear in the Advertisers ledger. When none exist, the UI must show the clean, production-grade empty state card explaining house ads are active.
- **No Mock Users or Payouts**: Never seed fake user accounts (`Alex Developer`, `Priya Sharma`) or fake payouts (`pay_req_101`). All user entries must reflect real authenticated accounts and devices.
- **No Hardcoded Fallback Numbers**: Never write fallback constants like `?? 450.0`, `?? 1248`, or `?? 1842`. All metrics must render live computed values, cleanly displaying `$0.00` or `0` when the store is initialized.

### Rule 2: Strict Access Control & Silent Internal Redirection
- **Single Master Admin**: Access is strictly gated to `jhaabhijeet864@gmail.com` via `apps/web/lib/admin-auth.ts`.
- **Zero Public Exposure**: The public `/login` page must **NEVER** expose the admin email, admin badges, or account selector dialogs. Any user seeing the login page sees only standard OAuth buttons (`Continue with Google`, `Continue with GitHub`, `Continue with Email`).
- **Silent Route Guarding**:
  - When `jhaabhijeet864@gmail.com` logs in, they are silently and automatically routed to `/admin`.
  - When any normal user logs in, they are routed to `/dashboard`.
  - If an unauthenticated or unauthorized user navigates directly to `/admin`, they receive a strict `403 Access Denied` and are redirected to `/login`.

### Rule 3: Real-Time Synchronization & Dual Telemetry
- **Continuous Polling**: The console auto-polls `/api/admin/overview` every 10 seconds in the background without screen flickering.
- **Window Focus Resync**: Whenever the browser window regains focus, an immediate fresh sync is triggered.
- **Dual-Metric Engine**:
  1. *Official Chrome Web Store Installs*: Tracked via CWS Developer API, with a 1-click sync/edit dialog in the console to update the count at any time.
  2. *Live Active Extensions*: Tracked directly via lightweight heartbeat pings sent by live browser extensions.

### Rule 4: Read-Only Safety Impersonation Mode
- When an admin clicks the **"Inspect"** button on any user row, it opens the target user's dashboard in a new tab with query parameters:
  ```
  /dashboard?device_id=<TARGET_DEVICE_ID>&impersonate=true
  ```
- In impersonation mode:
  - An amber banner displays: *"Admin Inspection Mode (Read-Only) • Impersonating User"*.
  - All withdrawal forms and cashout submission buttons are strictly **disabled** to prevent accidental fund disbursement.
  - Every impersonation jump is logged in the tamper-proof `admin_audit_logs`.

### Rule 5: 60/10/30 Financial Revenue Split Invariant
All financial calculations and P&L exports must adhere strictly to the platform split:
$$\text{User Rewards Pool Liability} = 60\% \text{ of Gross Inflow}$$
$$\text{Referral Reserve Pool} = 10\% \text{ of Gross Inflow}$$
$$\text{Platform Gross Profit} = 30\% \text{ of Gross Inflow}$$
House ads (`cmp_house_*`) represent internal placeholder inventory and do not contribute to external gross advertiser inflow.

### Rule 6: Payout Settlement & Auto-Refund Guarantee
- **UTR Requirement**: When settling a pending UPI or PayPal claim, the admin must enter a bank UTR / transaction reference number. This reference is permanently stored and visible to the user.
- **Auto-Refund on Rejection**: If a payout claim is rejected (e.g. invalid VPA address), the amount is **automatically refunded back into the user's rewards balance** so their hard-earned money is never lost.

### Rule 7: Emergency Circuit Breakers
The top bar must maintain the 3 global kill switches:
1. `PAUSE_PAID_ADS`: Pauses paid ad propagation and forces 100% fallback to safe startup house ads (Vakxo, Pathixo, KrocPDF, Blip).
2. `EXTENSION_MAINTENANCE`: Instructs all connected extensions to pause injection during maintenance.
3. `FREEZE_PAYOUTS`: Locks all new cashout submissions during financial reconciliations or security reviews.
