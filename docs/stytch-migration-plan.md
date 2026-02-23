# Stytch Auth Migration Plan — Phosra

**Date:** 2026-02-23
**Goal:** Replace WorkOS (main app) + custom phone OTP/Twilio (investor portal) with a single Stytch auth system. Unified user model with role-based access.

---

## 1. Architecture Overview

### Current (Two Separate Systems)

```
Main App (Dashboard)          Investor Portal
├── WorkOS AuthKit            ├── Custom phone OTP (Twilio)
├── Email/password + Google   ├── Email magic link (Resend)
├── authkitMiddleware()       ├── Google linking
├── Session: WorkOS cookies   ├── Session: custom JWT + httpOnly cookie
├── Admin: backend /auth/me   ├── Approved: investor_approved_phones table
└── 14 files touched          └── 9 API routes, 7 libs, 11 components, 6 DB tables
```

### Target (Unified Stytch)

```
Stytch (Single Auth Provider)
├── Phone OTP (primary for investors) — otps.sms.loginOrCreate()
├── Email/password (primary for main app) — passwords.authenticate()
├── Google OAuth (both) — oauth.authenticate()
├── Custom middleware.ts (Stytch doesn't provide built-in)
├── Session: Stytch-managed (stytch_session + stytch_session_jwt cookies)
├── Roles: trusted_metadata { role: "admin" | "investor" | "user" }
├── Invite system: custom (keep existing — Stytch has no B2C invite system)
└── Single user in Stytch — investor_approved_phones stays as approval gate
```

---

## 2. Unified User Model

### Stytch User Structure

```typescript
// Every user in Stytch
{
  user_id: "user-xxx",
  name: { first_name: "John", last_name: "Doe" },
  phone_numbers: [{ phone_id: "phone-xxx", phone_number: "+12125551234", verified: true }],
  emails: [{ email_id: "email-xxx", email: "john@acme.com", verified: true }],
  providers: [{ provider_type: "Google", provider_subject: "xxx" }],

  // Server-only metadata (set via backend SDK)
  trusted_metadata: {
    role: "investor",           // "admin" | "investor" | "user"
    company: "Acme Corp",
    is_approved: true,          // Investor approval gate
    referred_by: "user-yyy",    // Referral tracking
  },

  // User-editable metadata
  untrusted_metadata: {
    theme: "dark",
  },
}
```

### Role-Based Access

| Role | Access | Login Method |
|------|--------|-------------|
| `admin` | Dashboard + admin routes + investor portal | Email/password or Google |
| `user` | Dashboard only | Email/password or Google |
| `investor` | Investor portal only (if `is_approved: true`) | Phone OTP, email, or Google |

### Key Difference from Clerk

Stytch B2C does **not** have built-in roles/RBAC. Roles live in `trusted_metadata` and are checked in your app code. This means:
- No automatic role-based route blocking in middleware
- Role checks happen in page components and API route handlers
- More manual wiring but same end result

---

## 3. Migration Phases

### Phase 1: Install Stytch & Set Up (Day 1)

**Tasks:**
1. Create Stytch account and Consumer project
2. Enable auth methods in Stytch Dashboard:
   - SMS OTP — for investors
   - Passwords — for main app
   - Google OAuth — configure with Google Cloud credentials
3. Configure SMS allowlist (US + Canada)
4. Set up Custom Claim Template in Dashboard:
   ```json
   { "role": "{{ user.trusted_metadata.role }}" }
   ```
5. Install packages:
   ```bash
   cd web
   npm uninstall @workos-inc/authkit-nextjs
   npm install stytch @stytch/nextjs @stytch/react
   ```
6. Add environment variables:
   ```env
   STYTCH_PROJECT_ID=project-test-xxx
   STYTCH_PROJECT_ENV=test
   STYTCH_SECRET=secret-test-xxx
   NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN=public-token-test-xxx
   STYTCH_WEBHOOK_SECRET=whsec_xxx
   ```

**Files created:**
- `web/src/lib/stytch-server.ts` — Backend SDK singleton
- `web/src/components/StytchProvider.tsx` — Client provider (headless mode)

```typescript
// web/src/lib/stytch-server.ts
import * as stytch from "stytch";

let client: stytch.Client;

export function getStytchClient(): stytch.Client {
  if (!client) {
    client = new stytch.Client({
      project_id: process.env.STYTCH_PROJECT_ID!,
      secret: process.env.STYTCH_SECRET!,
      env: process.env.STYTCH_PROJECT_ENV === "live"
        ? stytch.envs.live
        : stytch.envs.test,
    });
  }
  return client;
}
```

```tsx
// web/src/components/StytchProvider.tsx
"use client";
import { StytchProvider as Provider } from "@stytch/nextjs";
import { createStytchHeadlessClient } from "@stytch/nextjs/headless";
import { ReactNode } from "react";

const stytch = createStytchHeadlessClient(
  process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN || ""
);

export default function StytchProvider({ children }: { children: ReactNode }) {
  return <Provider stytch={stytch}>{children}</Provider>;
}
```

---

### Phase 2: Replace WorkOS in Main App (Day 1-2)

**File-by-file migration:**

| File | Change | Effort |
|------|--------|--------|
| `web/src/app/layout.tsx` | Replace `<AuthKitProvider>` → `<StytchProvider>` | Low |
| `web/src/middleware.ts` | Replace `authkitMiddleware()` → custom middleware reading `stytch_session_jwt` cookie | Medium |
| `web/src/lib/auth-actions.ts` | Delete — replace with Stytch SDK calls in components | Low |
| `web/src/lib/useApi.ts` | Replace `useAccessToken()` → `useStytch().session.getTokens().session_jwt` | Low |
| `web/src/lib/api.ts` | Update token header logic (same pattern, different source) | Low |
| `web/src/app/auth/callback/route.ts` | Rewrite → Stytch OAuth callback: `stytchClient.oauth.authenticate({ token })` | Medium |
| `web/src/app/(auth)/login/page.tsx` | Rewrite → custom form using `useStytch()` for passwords.authenticate() + Google OAuth | Medium |
| `web/src/app/(dashboard)/layout.tsx` | Replace `useAuth()` → `useStytchUser()` + role check from trusted_metadata (or DB lookup) | Medium |
| `web/src/components/layout/PublicPageHeader.tsx` | Replace `useAuth()` → `useStytchUser()` for name. Sign-out → `useStytch().session.revoke()` | Low |
| `web/src/app/(dashboard)/dashboard/settings/page.tsx` | Replace user info source → `useStytchUser()` | Low |
| `web/src/app/api/investors/admin/*/route.ts` (3 files) | Replace `withAuth()` → read cookie + `getStytchClient().sessions.authenticateJwt()` + role check | Medium |
| `web/src/app/api/agents/*/route.ts` (2 files) | Same pattern as admin routes | Medium |

**New middleware.ts:**

```typescript
// web/src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/", "/login", "/pricing", "/compliance", "/docs",
  "/investors/portal", // has its own auth gate
  "/api/investors/auth", "/api/clerk",
  // ... existing whitelist
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Sandbox mode bypass
  if (process.env.NEXT_PUBLIC_SANDBOX_MODE === "true") {
    return NextResponse.next();
  }

  // Check for Stytch session cookie
  const sessionJwt = req.cookies.get("stytch_session_jwt")?.value;
  if (!sessionJwt) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Note: Full JWT validation happens in route handlers/pages
  // Middleware does a lightweight cookie-existence check only
  // (Stytch Node SDK may not work in Edge Runtime)
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/agents/:path*", "/api/investors/admin/:path*"],
};
```

**New server-side auth helper:**

```typescript
// web/src/lib/stytch-auth.ts
import { cookies } from "next/headers";
import { getStytchClient } from "./stytch-server";

export async function requireAuth() {
  const cookieStore = await cookies();
  const sessionJwt = cookieStore.get("stytch_session_jwt")?.value;

  if (!sessionJwt) {
    return { authenticated: false, session: null, user: null };
  }

  try {
    const client = getStytchClient();
    const { session } = await client.sessions.authenticateJwt({
      session_jwt: sessionJwt,
    });
    const { user } = await client.users.get({ user_id: session.user_id });
    return { authenticated: true, session, user };
  } catch {
    return { authenticated: false, session: null, user: null };
  }
}

export async function requireAdmin() {
  const { authenticated, user } = await requireAuth();
  if (!authenticated || !user) {
    return { authorized: false };
  }
  const role = (user.trusted_metadata as any)?.role;
  if (role !== "admin") {
    return { authorized: false };
  }
  return { authorized: true, user };
}
```

**Sandbox mode:** Keep as-is — independent of auth provider.

---

### Phase 3: Replace Investor Portal Auth (Day 2-4)

This is the larger change. The investor portal currently has 9 API routes, 7 auth libraries, and 6 DB tables.

#### 3a. What Gets Deleted (Stytch replaces)

| File/Table | Why |
|------------|-----|
| `api/investors/auth/request-otp/route.ts` | Stytch handles SMS OTP via `otps.sms.loginOrCreate()` |
| `api/investors/auth/verify-otp/route.ts` | Stytch handles verification via `otps.authenticate()` |
| `api/investors/auth/session/route.ts` | Stytch handles sessions (cookies auto-managed) |
| `api/investors/auth/link-email/route.ts` | Stytch handles multi-identifier users natively |
| `api/investors/auth/link-google/route.ts` | Stytch handles Google OAuth account linking |
| `api/investors/auth/login-linked/route.ts` | Stytch handles login via any identifier |
| `lib/investors/session.ts` | Stytch manages JWT/sessions |
| `lib/investors/twilio.ts` | Stytch replaces Twilio for OTP delivery |
| `lib/investors/otp.ts` | Unused, delete |
| `lib/investors/rate-limit.ts` | Stytch handles rate limiting |
| `lib/investors/investor-auth.ts` | Replace with `useStytchUser()` / `useStytchSession()` |
| `investor_sessions` table | Stytch manages sessions |
| `investor_otp_codes` table | Stytch manages OTP lifecycle |
| `investor_linked_accounts` table | Stytch manages identifiers natively |

#### 3b. What Gets Modified

| File | Change |
|------|--------|
| `lib/investors/db.ts` | Keep — still needed for invite system + referral data |
| `lib/investors/phone.ts` | Keep — still useful for display formatting |
| `InvestorLoginForm.tsx` | Rewrite to use Stytch headless SDK (see below) |
| `AccountLinking.tsx` | Simplify — use Stytch's `user.createPhoneNumber()` / OAuth attach |
| `PhoneInput.tsx` | Keep — reuse in new login form |
| `OtpInput.tsx` | Keep — reuse in new login form |

#### 3c. What Stays Custom (Stytch doesn't provide)

| File/Table | Why |
|------------|-----|
| `api/investors/portal/invite/route.ts` | Referral invite generation (custom business logic) |
| `api/investors/portal/invite/[code]/route.ts` | Invite validation |
| `api/investors/portal/invite/[code]/claim/route.ts` | Invite claiming + audit |
| `investor_invite_links` table | Custom invite codes |
| `investor_invite_claims` table | Audit trail |
| `investor_approved_phones` table | Approval gate — checked after Stytch auth |
| Referral components (ReferralHub, Stats, etc.) | Custom UI — unchanged |

#### 3d. Investor Approval Flow

**Design: Stytch auth first, then app-level approval check**

1. Anyone can authenticate with Stytch (phone OTP creates user if new)
2. After Stytch session established, app checks `investor_approved_phones`
3. If approved → set `trusted_metadata.role = "investor"` + show portal
4. If not approved → show "pending approval" message
5. Invite codes: on claim, add phone to `investor_approved_phones` + update Stytch metadata

**Why this works:** Stytch's `otps.sms.loginOrCreate()` auto-creates users. We gate portal access at the app level, not the auth level. This matches the current anti-enumeration pattern.

#### 3e. New Investor Login Form

```tsx
// web/src/components/investors/InvestorLoginForm.tsx (rewritten)
"use client";
import { useState, useCallback, useEffect } from "react";
import { useStytch, useStytchSession } from "@stytch/nextjs";
import PhoneInput from "./PhoneInput";
import OtpInput from "./OtpInput";

export default function InvestorLoginForm({
  onAuthenticated,
  inviteCode,
}: {
  onAuthenticated: () => void;
  inviteCode?: string | null;
}) {
  const stytch = useStytch();
  const { session } = useStytchSession();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [methodId, setMethodId] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already authenticated, notify parent
  useEffect(() => {
    if (session) onAuthenticated();
  }, [session, onAuthenticated]);

  const handleSendOtp = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Normalize to E.164 (reuse existing phone.ts utility)
      const e164 = `+1${phone.replace(/\D/g, "")}`;

      // Check approval (anti-enumeration: same response either way)
      const approvalRes = await fetch("/api/investors/auth/check-approved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: e164, inviteCode }),
      });

      if (!approvalRes.ok) {
        // Random delay already applied server-side
        setStep("otp"); // Show OTP screen even if not approved (anti-enumeration)
        return;
      }

      // Send OTP via Stytch
      const resp = await stytch.otps.sms.loginOrCreate(e164, {
        expiration_minutes: 5,
      });
      setMethodId(resp.method_id);
      setStep("otp");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [stytch, phone, inviteCode]);

  const handleVerifyOtp = useCallback(async () => {
    if (!methodId) return;
    setLoading(true);
    setError("");
    try {
      await stytch.otps.authenticate(otp, methodId, {
        session_duration_minutes: 60 * 24 * 30, // 30 days
      });
      // Session cookie set automatically by Stytch SDK
      // Claim invite if applicable
      if (inviteCode) {
        await fetch(`/api/investors/portal/invite/${inviteCode}/claim`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: `+1${phone.replace(/\D/g, "")}` }),
        });
      }
      onAuthenticated();
    } catch {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [stytch, otp, methodId, phone, inviteCode, onAuthenticated]);

  // ... render PhoneInput or OtpInput based on step
}
```

#### 3f. New Approval Check Route (Replaces request-otp anti-enumeration)

```typescript
// web/src/app/api/investors/auth/check-approved/route.ts
// Lightweight route that checks approval + handles invite codes
// Returns same response shape regardless (anti-enumeration)
// Does NOT send OTP — Stytch client SDK does that
```

This is the one new API route needed. It replaces the approval-checking logic from the old `request-otp` route without the Twilio dependency.

---

### Phase 4: Webhooks & Metadata Sync (Day 3-4)

**Stytch Webhooks to implement:**

| Event | Handler | Purpose |
|-------|---------|---------|
| `direct.user.create` | `/api/stytch/webhooks` | Check if phone in approved list, set trusted_metadata |
| `direct.user.update` | `/api/stytch/webhooks` | Sync metadata changes |

**Webhook route:**

```typescript
// web/src/app/api/stytch/webhooks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { getStytchClient } from "@/lib/stytch-server";
import { queryOne } from "@/lib/investors/db";

const webhookSecret = process.env.STYTCH_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headers = {
    "svix-id": req.headers.get("svix-id") || "",
    "svix-timestamp": req.headers.get("svix-timestamp") || "",
    "svix-signature": req.headers.get("svix-signature") || "",
  };

  // Verify signature
  const wh = new Webhook(webhookSecret);
  const payload = wh.verify(body, headers) as any;

  if (payload.action === "CREATE" && payload.object_type === "user") {
    const user = payload.user;
    const phone = user.phone_numbers?.[0]?.phone_number;

    if (phone) {
      // Check if phone is pre-approved
      const approved = await queryOne<{ name: string; company: string }>(
        "SELECT name, company FROM investor_approved_phones WHERE phone_e164 = $1 AND is_active = TRUE",
        [phone]
      );

      if (approved) {
        const client = getStytchClient();
        await client.users.update({
          user_id: user.user_id,
          trusted_metadata: {
            role: "investor",
            is_approved: true,
            company: approved.company,
          },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
```

---

### Phase 5: Existing User Migration (Day 4-5)

**Main app users (WorkOS → Stytch):**

```typescript
// scripts/migrate-to-stytch.ts
import * as stytch from "stytch";

const client = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID!,
  secret: process.env.STYTCH_SECRET!,
});

// For email/password users — migrate with password hash
async function migratePasswordUser(email: string, passwordHash: string, name: string, isAdmin: boolean) {
  await client.passwords.migrate({
    email,
    hash: passwordHash,
    hash_type: "bcrypt", // adjust based on WorkOS hash format
    trusted_metadata: { role: isAdmin ? "admin" : "user" },
    name: { first_name: name.split(" ")[0], last_name: name.split(" ").slice(1).join(" ") },
  });
}

// For investor portal users — create with phone
async function migrateInvestor(phone: string, name: string, company: string, referredBy?: string) {
  await client.users.create({
    phone_number: phone,
    trusted_metadata: {
      role: "investor",
      is_approved: true,
      company,
      referred_by: referredBy || null,
    },
    name: { first_name: name.split(" ")[0], last_name: name.split(" ").slice(1).join(" ") },
  });
}
```

**Migration notes:**
- WorkOS password hashes: check format (likely bcrypt). Stytch supports bcrypt, scrypt, argon2, md5, sha1, sha512, pbkdf2, phpass.
- Investor users (phone-only): use `users.create()` with phone_number. No password to migrate.
- Linked accounts (email/Google on investors): create user with phone, then add email identifier.
- Rate limit: 65 req/sec for user creation, 100 req/sec for password migration.
- Contact Stytch to bulk-set `verified: true` on migrated phones/emails.

---

### Phase 6: Cleanup (Day 5-6)

**Remove:**
- `@workos-inc/authkit-nextjs` package
- All WorkOS env vars (`WORKOS_CLIENT_ID`, `WORKOS_API_KEY`, `WORKOS_COOKIE_PASSWORD`, `NEXT_PUBLIC_WORKOS_REDIRECT_URI`)
- Twilio env vars (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`, `TWILIO_MESSAGING_SERVICE_SID`, `TWILIO_PHONE_NUMBER`)
- `INVESTOR_JWT_SECRET`, `INVESTOR_SESSION_DAYS`
- Dead auth files: session.ts, twilio.ts, otp.ts, rate-limit.ts, investor-auth.ts
- Dead API routes: 6 investor auth routes
- Dead callback route: auth/callback/route.ts
- Dead auth-actions.ts

**Keep:**
- `INVESTOR_DB_URL` — invite system, referral data, approval gate
- `RESEND_API_KEY` — if used for non-auth emails
- `NEXT_PUBLIC_SANDBOX_MODE` — dev bypass
- `investor_approved_phones` table — approval gate + referral tracking
- `investor_invite_links` + `investor_invite_claims` tables
- `lib/investors/db.ts`, `lib/investors/phone.ts`

**Deprecate (drop after 2 weeks):**
- `investor_sessions` table
- `investor_otp_codes` table
- `investor_linked_accounts` table

**Update Go backend:**
- Replace WorkOS token validation with Stytch JWT verification
- Stytch JWTs can be validated locally using JWKS or via `sessions.authenticateJwt()` API
- Or use Stytch Go SDK: `github.com/stytchauth/stytch-go`

---

## 4. Environment Variables (Final State)

### Remove
```
WORKOS_CLIENT_ID
WORKOS_API_KEY
WORKOS_COOKIE_PASSWORD
NEXT_PUBLIC_WORKOS_REDIRECT_URI
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_VERIFY_SERVICE_SID
TWILIO_MESSAGING_SERVICE_SID
TWILIO_PHONE_NUMBER
INVESTOR_JWT_SECRET
INVESTOR_SESSION_DAYS
```

### Add
```
STYTCH_PROJECT_ID
STYTCH_PROJECT_ENV              # "test" or "live"
STYTCH_SECRET
NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN
STYTCH_WEBHOOK_SECRET           # For svix webhook verification
```

### Keep
```
INVESTOR_DB_URL               # Invite system + referral data
RESEND_API_KEY                # Non-auth emails
NEXT_PUBLIC_SANDBOX_MODE      # Dev bypass
```

---

## 5. Key Differences from Clerk Plan

| Aspect | Clerk | Stytch |
|--------|-------|--------|
| **Cost at our scale** | $25/mo + $0.01/SMS | **$0/mo** (under 10K MAU free tier) |
| **Built-in middleware** | `clerkMiddleware()` (drop-in) | **None — write custom** (more work) |
| **Server-side auth helper** | `auth()` one-liner | **Manual: read cookie + authenticateJwt()** |
| **Role-based access** | publicMetadata in session claims | **trusted_metadata + Custom Claim Template** |
| **Phone OTP** | Supported (Pro plan required) | **First-class, included in free tier** |
| **Next.js DX** | First-class, minimal boilerplate | Good, but more manual wiring |
| **Custom UI** | Hooks-based | **Headless SDK — excellent for custom UX** |
| **Invitations** | Built-in (email-only) | **None for B2C — keep custom** |
| **Migration effort** | ~6 days | **~7 days** (extra day for custom middleware/auth helpers) |

**Bottom line:** Stytch saves ~$300+/year vs Clerk, but requires ~1 extra day of setup for custom middleware and auth helpers. Better fit for Phosra's pre-seed stage.

---

## 6. Risk Assessment

| Risk | Mitigation |
|------|-----------|
| No built-in middleware | Write custom middleware.ts — straightforward, ~30 lines |
| Edge Runtime compatibility | Use lightweight cookie check in middleware, full validation in route handlers |
| SMS delivery (Stytch vs Twilio) | Test in Stytch test environment first. Stytch handles delivery infra. |
| Existing investor sessions invalidated | Run migration during low-traffic window. Investors re-login once. |
| Invite system breaks | Stays fully custom — minimal change. Test invite→signup flow end-to-end. |
| Go backend token validation | Stytch Go SDK available (`stytch-go`). Or validate JWT via JWKS. |
| trusted_metadata size | Max 20 top-level keys. Plenty for role + company + referral. |
| JWT 5-min expiry | Frontend SDK auto-refreshes every 3 min. Transparent to users. |
| No B2C roles feature | Roles via trusted_metadata + Custom Claim Template. Same end result. |

---

## 7. Rollback Plan

1. Keep WorkOS package installed but unused (don't remove for 2 weeks)
2. Keep all investor auth DB tables intact (stop writing to sessions/otp tables)
3. Feature flag: `NEXT_PUBLIC_AUTH_PROVIDER=stytch|workos` to switch back if needed
4. Maintain WorkOS env vars in Vercel (inactive) for 2 weeks
5. If rollback needed: revert middleware + layout to WorkOS, re-enable investor auth routes

---

## 8. Testing Checklist

### Main App Auth
- [ ] Email/password sign-up creates Stytch user with `role: "user"` in trusted_metadata
- [ ] Email/password sign-in works → session cookies set
- [ ] Google OAuth sign-in works → redirect flow → session cookies set
- [ ] Dashboard protected (redirect to login if no `stytch_session_jwt` cookie)
- [ ] Admin routes validate session + check `trusted_metadata.role === "admin"`
- [ ] Sign-out calls `stytch.session.revoke()` → cookies cleared
- [ ] Sandbox mode still works in dev
- [ ] Go backend accepts Stytch JWT tokens (validate via JWKS or Stytch API)

### Investor Portal Auth
- [ ] Phone OTP send via `otps.sms.loginOrCreate()` → SMS received within 30s
- [ ] Phone OTP verify via `otps.authenticate()` → session cookies set
- [ ] Unapproved phone → Stytch user created but portal shows "pending approval"
- [ ] Approved phone → portal access granted
- [ ] Invite link → auto-approve phone + Stytch signup flow works
- [ ] Invite claiming + referral tracking preserved
- [ ] Webhook fires on user.create → trusted_metadata set if phone approved
- [ ] Session persists across page refreshes (cookie-based)
- [ ] Session expires after configured period (30 days)
- [ ] Sign-out works

### Cross-Cutting
- [ ] Same user can have phone + email + Google (multi-identifier)
- [ ] Admin user can access both dashboard and investor portal
- [ ] Investor user cannot access dashboard routes
- [ ] Custom Claim Template injects `role` into JWT
- [ ] `stytch_session_jwt` refreshes automatically (< 5-min expiry, SDK refreshes at 3 min)
- [ ] Existing users migrated with correct roles and verified identifiers
- [ ] Anti-enumeration on investor phone lookup preserved

---

## 9. Estimated Timeline

| Phase | Duration | Dependencies |
|-------|----------|-------------|
| 1. Stytch setup + helpers | 1 day | Stytch account created |
| 2. Replace WorkOS (main app) | 1.5 days | Phase 1 |
| 3. Replace investor auth | 2.5 days | Phase 1 |
| 4. Webhooks & sync | 0.5 day | Phases 2+3 |
| 5. User migration | 1 day | Phase 4 |
| 6. Cleanup & testing | 1 day | Phase 5 |
| **Total** | **~7 days** | |

---

## 10. Cost Analysis

### Current costs
- Twilio Verify: ~$0.05/verification (send + check) × ~100 investor logins/mo = **~$5/mo**
- WorkOS AuthKit: **$0/mo** (free up to 1M MAU)
- Resend (magic links): **~$0/mo** (low volume)
- **Total: ~$5/mo**

### Stytch costs
- Free tier: 10,000 MAU included
- SMS OTP: **$0.01/SMS** (US/Canada) × ~100 investor logins/mo = **$1/mo**
- No platform fee at our scale
- **Total: ~$1/mo**

### Savings: ~$4/mo + eliminated Twilio account management overhead

---

## 11. Files Changed Summary

### Deleted (~20 files)
- 6 investor auth API routes (request-otp, verify-otp, session, link-email, link-google, login-linked)
- 5 investor auth libraries (session.ts, twilio.ts, otp.ts, rate-limit.ts, investor-auth.ts)
- 1 WorkOS callback route (auth/callback)
- 1 WorkOS auth-actions library

### Modified (~15 files)
- `middleware.ts` — rewrite for Stytch cookie check
- `layout.tsx` — provider swap (AuthKit → Stytch)
- `login/page.tsx` — rewrite for Stytch password + OAuth
- `(dashboard)/layout.tsx` — auth check via `useStytchUser()`
- `PublicPageHeader.tsx` — auth state via `useStytchUser()`
- `settings/page.tsx` — user info from Stytch
- 5 admin/agent API routes — auth via `requireAdmin()` helper
- `useApi.ts` — token from `stytch.session.getTokens()`
- `api.ts` — token header update
- `InvestorLoginForm.tsx` — rewrite with Stytch headless SDK
- `AccountLinking.tsx` — simplify with Stytch multi-identifier

### Created (~5 files)
- `lib/stytch-server.ts` — backend SDK singleton
- `lib/stytch-auth.ts` — `requireAuth()` / `requireAdmin()` helpers
- `components/StytchProvider.tsx` — headless client provider
- `api/stytch/webhooks/route.ts` — webhook handler
- `api/investors/auth/check-approved/route.ts` — approval gate (replaces OTP send logic)
- `scripts/migrate-to-stytch.ts` — user migration script
