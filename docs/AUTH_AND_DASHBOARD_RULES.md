# Authentication & Dashboard Display Rules

> **CRITICAL ARCHITECTURAL DIRECTIVE FOR ALL DEVELOPERS & AI ASSISTANTS**
>
> **Do not alter or violate these rules under any circumstances.**
> **SUBSTANTIAL ENGINEERING ENFORCEMENT:** No temporary auth removal, bypasses, or "prototype shortcuts" are permitted.
> The rewards dashboard (`/dashboard` and `/dashboard/referrals`) and the `Dashboard` navigation link in `Navbar.tsx` are strictly gated behind verified user authentication.

---

## 1. Navbar Rules (`apps/web/components/Navbar.tsx`)

1. **Login & Dashboard Button Switching**:
   - In normal unauthenticated cases, the button beside `Add to Chrome` (and in the mobile menu drawer) displays **`Login`**. Non-login users must ONLY see `Login`.
   - Once a user has a valid server-issued HttpOnly `pathixo_session` cookie, this button dynamically switches to **`Dashboard`**. The localStorage mirror is presentation-only and is never authorization proof.
   - When a user logs out / signs out, the button immediately switches back to **`Login`**.

2. **Hydration & State Sync**:
   - `Navbar.tsx` must verify authentication after mounting (`isMounted`) to avoid SSR/hydration mismatches or visual flashes.
   - Listen to `storage` events and the custom `pathixo_auth_change` DOM event so navbar links update immediately upon login or logout without requiring a hard page refresh.

3. **Strict Navbar Element Lock**:
   - The navigation links are strictly locked to: `How it works` (`/#how-it-works`), `FAQ` (`/#faq`), and `Advertise` (`/advertise`).
   - The Calculator button is strictly removed from the navbar.
   - **DO NOT** add any new links, buttons, calculators, dropdowns, or icons to the Navbar unless explicitly and unequivocally requested by the user.

---

## 2. Dashboard Route Rules (`apps/web/app/dashboard/page.tsx` & `/referrals`)

1. **Strict Route Protection**:
   - The user rewards console, metric cards, telemetry/impression logs, and withdrawal forms **MUST NEVER RENDER** for unauthenticated visitors. Client route checks use `GET /api/auth/session`; sensitive API routes independently verify the signed HttpOnly cookie.
   - If a visitor navigates directly to `/dashboard` or `/dashboard/referrals` without a valid `pathixo_auth_session`:
     - The page must immediately redirect them to `/login`.
     - While redirecting, the page must show an authentication barrier ("Sign in required"), never the rewards console or stub metrics.

2. **Sign Out Functionality**:
   - The authenticated dashboard header must include the user's logged-in email and a dedicated `Sign out` action.
   - Signing out must clear the server cookie through `DELETE /api/auth/session`, clear the local presentation mirror, dispatch `pathixo_auth_change`, and redirect to `/login`.

---

## 3. Environment & Local Testing Rules

1. **Local Development Stubbing**:
   - The convenience `user@gmail.com` stub / single-click bypass is strictly restricted to local development environments (`process.env.NODE_ENV !== 'production'`).
2. **Production Safeguard**:
   - In production (`process.env.NODE_ENV === 'production'`), the local email stub cannot create a session. OAuth and verified email routes are not implemented/configured yet; sign-in therefore fails closed until a provider is added. Do not present the current local development sign-in as production authentication.

4. **Production readiness state**:
   - `AUTH_SECRET` must be configured to at least 32 characters for signed sessions.
   - Rewards, history, campaign writes, referrals, preregistration, and cashout must stay unavailable in production until durable storage and the relevant verified financial/provider workflows exist. See [GO_LIVE_BUG_AUDIT.md](./GO_LIVE_BUG_AUDIT.md).

---

## 4. Admin Command Console Rules (`/admin`)

1. **Access Allowlist**:
   - Access to `/admin` and all `/api/admin/*` endpoints is strictly limited to `jhaabhijeet864@gmail.com`.
2. **Zero Stub Data**:
   - Never inject mock companies, fake users, fake payouts, or fallback fake metric numbers into the Admin Console.
   - For complete specifications, auto-sync rules, and architectural invariants, refer to [ADMIN_CONSOLE_SPEC.md](file:///e:/Open Source/Ad_AI/docs/ADMIN_CONSOLE_SPEC.md).
