# Clerk Auth Migration Plan — Phosra

**Date:** 2026-02-22
**Goal:** Replace WorkOS (main app) + custom phone OTP/Twilio (investor portal) with a single Clerk auth system. Unified user model with role-based access.

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

### Target (Unified Clerk)

```
Clerk (Single Auth Provider)
├── Phone OTP (primary for investors)
├── Email/password (primary for main app users)
├── Google OAuth (both)
├── clerkMiddleware() (single middleware)
├── Session: Clerk-managed (encrypted cookies + JWT)
├── Roles: publicMetadata { role: "admin" | "investor" | "user" }
├── Invite system: custom (Clerk doesn't provide referral tracking)
└── Single user table in Clerk — no investor_approved_phones
```

---

## 2. Unified User Model

### Clerk User Structure

```typescript
// Every user in Clerk
{
  id: "user_xxx",                    // Clerk user ID
  primaryPhoneNumber: "+12125551234", // For investors (primary identifier)
  primaryEmailAddress: "jake@phosra.com", // For main app users
  firstName: "John",
  lastName: "Doe",

  // Custom metadata (set via Backend API only)
  publicMetadata: {
    role: "investor" | "admin" | "user",  // Access control
    company: "Acme Corp",                  // Investor company
    referred_by: "user_yyy",               // Referral tracking (Clerk user ID)
    is_approved: true,                     // Investor approval gate
  },

  // Identifiers (Clerk manages linking)
  phoneNumbers: [{ id: "idn_xxx", phoneNumber: "+12125551234" }],
  emailAddresses: [{ id: "idn_yyy", emailAddress: "john@acme.com" }],
  externalAccounts: [{ provider: "google", ... }],
}
```

### Role-Based Access

| Role | Access | Login Method |
|------|--------|-------------|
| `admin` | Dashboard + admin routes + investor portal | Email/password or Google |
| `user` | Dashboard only | Email/password or Google |
| `investor` | Investor portal only (if `is_approved: true`) | Phone OTP, email, or Google |

---

## 3. Migration Phases

### Phase 1: Install Clerk & Set Up (Day 1)

**Tasks:**
1. Create Clerk account and application
2. Enable auth strategies in Clerk Dashboard:
   - Phone number (SMS OTP) — for investors
   - Email/password — for main app
   - Google OAuth — for both
3. Configure SMS allowlist (US + Canada minimum)
4. Install packages:
   ```bash
   cd web
   npm uninstall @workos-inc/authkit-nextjs
   npm install @clerk/nextjs @clerk/themes
   ```
5. Add environment variables:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   ```

**Files created/modified:**
- `web/.env.local` — add Clerk keys, keep INVESTOR_DB_URL (for invite system)
- `web/.env.example` — update with Clerk var names

---

### Phase 2: Replace WorkOS in Main App (Day 1-2)

**File-by-file migration:**

| File | Change | Effort |
|------|--------|--------|
| `web/src/app/layout.tsx` | Replace `<AuthKitProvider>` → `<ClerkProvider>` | Low |
| `web/src/middleware.ts` | Replace `authkitMiddleware()` → `clerkMiddleware()` with route matchers | Low |
| `web/src/lib/auth-actions.ts` | Delete — Clerk handles sign-in/up/out via components or `useClerk()` | Low |
| `web/src/lib/useApi.ts` | Replace `useAccessToken()` → `useAuth().getToken()` from `@clerk/nextjs` | Low |
| `web/src/lib/api.ts` | Update token header logic (same pattern, different source) | Low |
| `web/src/app/auth/callback/route.ts` | Delete — Clerk handles OAuth callbacks internally | Low |
| `web/src/app/(auth)/login/page.tsx` | Replace WorkOS buttons → Clerk `<SignIn>` component or custom flow | Medium |
| `web/src/app/(dashboard)/layout.tsx` | Replace `useAuth()` → Clerk's `useUser()` + `useAuth()`. Replace admin check: `user.publicMetadata.role === "admin"` | Low |
| `web/src/components/layout/PublicPageHeader.tsx` | Replace `useAuth()` → Clerk's `useUser()` for name/avatar. Replace sign-out → `useClerk().signOut()` | Low |
| `web/src/app/(dashboard)/dashboard/settings/page.tsx` | Replace `useAuth()` → `useUser()` for user info | Low |
| `web/src/app/api/investors/admin/*/route.ts` (3 files) | Replace `withAuth()` → `auth()` from `@clerk/nextjs/server`. Check `publicMetadata.role === "admin"` | Low |
| `web/src/app/api/agents/*/route.ts` (2 files) | Same as admin routes | Low |

**Sandbox mode:** Keep as-is — it's independent of auth provider.

**Admin flag migration:**
- Current: Backend Go `/auth/me` returns `is_admin`
- New: Set `publicMetadata.role = "admin"` on Clerk users via Backend API
- One-time script to set admin role on existing admin users

---

### Phase 3: Replace Investor Portal Auth (Day 2-4)

This is the larger change. The investor portal currently has 9 API routes, 7 auth libraries, and 6 DB tables.

#### 3a. What Gets Deleted (Clerk replaces)

| File/Table | Why |
|------------|-----|
| `api/investors/auth/request-otp/route.ts` | Clerk handles SMS OTP |
| `api/investors/auth/verify-otp/route.ts` | Clerk handles verification |
| `api/investors/auth/session/route.ts` | Clerk handles sessions |
| `api/investors/auth/link-email/route.ts` | Clerk handles email as identifier |
| `api/investors/auth/link-google/route.ts` | Clerk handles Google OAuth |
| `api/investors/auth/login-linked/route.ts` | Clerk handles multi-identifier login |
| `lib/investors/session.ts` | Clerk manages JWT/sessions |
| `lib/investors/twilio.ts` | Clerk replaces Twilio for OTP |
| `lib/investors/otp.ts` | Unused, delete |
| `lib/investors/rate-limit.ts` | Clerk handles rate limiting |
| `lib/investors/investor-auth.ts` | Replace with Clerk's `useUser()` |
| `investor_sessions` table | Clerk manages sessions |
| `investor_otp_codes` table | Clerk manages OTP lifecycle |
| `investor_linked_accounts` table | Clerk manages identifiers |

#### 3b. What Gets Modified

| File | Change |
|------|--------|
| `lib/investors/db.ts` | Keep — still needed for invite system + referral data |
| `lib/investors/phone.ts` | Keep — still useful for display formatting |
| `components/investors/InvestorLoginForm.tsx` | Rewrite to use Clerk custom flow: phone input → `signIn.create({ identifier: phone })` → OTP input → `signIn.attemptFirstFactor({ strategy: "phone_code", code })` |
| `components/investors/AccountLinking.tsx` | Simplify — Clerk's user profile handles adding email/Google. Or use `user.createEmailAddress()` / `user.createExternalAccount()` |
| `components/investors/PhoneInput.tsx` | Keep — reuse in new login form |
| `components/investors/OtpInput.tsx` | Keep — reuse in new login form |

#### 3c. What Stays Custom (Clerk doesn't provide)

| File/Table | Why |
|------------|-----|
| `api/investors/portal/invite/route.ts` | Referral invite generation (custom business logic) |
| `api/investors/portal/invite/[code]/route.ts` | Invite validation |
| `api/investors/portal/invite/[code]/claim/route.ts` | Invite claiming + audit |
| `investor_invite_links` table | Custom invite codes |
| `investor_invite_claims` table | Audit trail |
| `investor_approved_phones` table | **Modified** — becomes approval gate checked against Clerk user metadata. Or: keep as source of truth for "is this phone approved?" and sync to Clerk `publicMetadata.is_approved` on sign-up |
| Referral components (ReferralHub, Stats, etc.) | Custom UI — data source changes from DB queries to Clerk user lookups + custom tables |

#### 3d. Investor Approval Flow (Key Design Decision)

**Option A: Clerk-first (recommended)**
- Investor signs up with phone via Clerk (anyone can create account)
- On sign-up webhook (`user.created`), check if phone is in `investor_approved_phones`
- If approved: set `publicMetadata.is_approved = true, role = "investor"`
- If not approved: account exists but portal access blocked
- Invite codes: on claim, add phone to `investor_approved_phones` AND update Clerk metadata

**Option B: Gate at sign-up**
- Use Clerk's `allowlist` feature to restrict sign-ups to pre-approved phones
- More secure but less flexible for invite flow

**Recommendation: Option A** — allows the invite flow to work naturally while keeping approval gating.

#### 3e. New Investor Login Flow

```
1. User visits /investors/portal
2. If not authenticated → show custom login form
3. User enters phone number
4. Clerk signIn.create({ identifier: phone }) → sends SMS OTP
5. User enters 6-digit code
6. Clerk signIn.attemptFirstFactor({ strategy: "phone_code", code })
7. Clerk session created automatically
8. Check publicMetadata.is_approved === true
9. If not approved → show "pending approval" message
10. If approved → show investor portal
```

For invite-based onboarding:
```
1. User clicks invite link → /investors/portal?invite=CODE
2. Validate invite code (existing API)
3. User enters phone → Clerk handles sign-up/sign-in
4. On success: claim invite, auto-approve phone, set Clerk metadata
5. Portal access granted
```

---

### Phase 4: Webhook & Sync (Day 3-4)

**Clerk Webhooks to implement:**

| Event | Handler | Purpose |
|-------|---------|---------|
| `user.created` | `/api/clerk/webhooks` | Check if phone in approved list, set metadata |
| `session.created` | (optional) | Audit logging |

**Webhook route:** `web/src/app/api/clerk/webhooks/route.ts`

```typescript
// Verify webhook signature (svix)
// On user.created:
//   - Look up phone in investor_approved_phones
//   - If found: clerkClient.users.updateUser(userId, { publicMetadata: { role: "investor", is_approved: true, company, referred_by } })
//   - If not found: leave as default user
```

---

### Phase 5: Existing User Migration (Day 4-5)

**Main app users (WorkOS → Clerk):**
- Export users from WorkOS (email, name)
- Import to Clerk via Backend API: `clerkClient.users.createUser({ emailAddress, firstName, lastName })`
- Set `publicMetadata.role` for admins
- Users will need to set new password on first Clerk login (or use passwordless)

**Investor users (DB → Clerk):**
- Script to read `investor_approved_phones` table
- For each: `clerkClient.users.createUser({ phoneNumber: [phone], firstName: name, publicMetadata: { role: "investor", is_approved: true, company, referred_by } })`
- Linked accounts (email/Google) imported as additional identifiers

**Migration script location:** `scripts/migrate-to-clerk.ts`

---

### Phase 6: Cleanup (Day 5-6)

**Remove:**
- `@workos-inc/authkit-nextjs` package
- All WorkOS env vars
- Twilio env vars (if not used elsewhere)
- `investor_sessions` table (after confirming Clerk sessions work)
- `investor_otp_codes` table
- `investor_linked_accounts` table
- Dead auth library files (session.ts, twilio.ts, otp.ts, rate-limit.ts)

**Keep:**
- `INVESTOR_DB_URL` — still needed for invite system, referral data, SAFE documents
- `investor_approved_phones` — approval gate + referral tracking source of truth
- `investor_invite_links` + `investor_invite_claims` — custom invite system
- `lib/investors/db.ts` — DB pool for custom queries
- `lib/investors/phone.ts` — phone formatting utility

**Update Go backend:**
- Replace WorkOS token validation with Clerk JWT verification
- Clerk JWTs can be verified with Clerk's JWKS endpoint or public key

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
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET          # For svix webhook verification
```

### Keep
```
INVESTOR_DB_URL               # Invite system + referral data
RESEND_API_KEY                # If still used for non-auth emails
NEXT_PUBLIC_SANDBOX_MODE      # Dev bypass
```

---

## 5. Risk Assessment

| Risk | Mitigation |
|------|-----------|
| SMS delivery issues (Clerk vs Twilio) | Test SMS delivery in dev before switching. Clerk uses own SMS infra. |
| Existing investor sessions invalidated | Run migration during low-traffic window. Investors re-login once. |
| Invite system breaks | Invite system stays custom — minimal change. Test invite→signup flow end-to-end. |
| Go backend token validation | Clerk provides JWKS endpoint. Update backend to verify Clerk JWTs. |
| Clerk SMS requires Pro plan | Pro plan $25/mo + $0.01/SMS. Budget ~$25-30/mo. |
| Referral tracking data loss | Keep `investor_approved_phones` table. Referral data preserved. |

---

## 6. Rollback Plan

1. Keep WorkOS package installed but unused (don't remove for 2 weeks)
2. Keep all investor auth DB tables intact (just stop writing to sessions/otp tables)
3. Feature flag: `NEXT_PUBLIC_AUTH_PROVIDER=clerk|workos` to switch back if needed
4. Maintain WorkOS env vars in Vercel (inactive) for 2 weeks
5. If rollback needed: revert middleware + layout to WorkOS, re-enable investor auth routes

---

## 7. Testing Checklist

### Main App Auth
- [ ] Email/password sign-up creates Clerk user
- [ ] Email/password sign-in works
- [ ] Google OAuth sign-in works
- [ ] Dashboard protected (redirect to login if unauthenticated)
- [ ] Admin routes check `publicMetadata.role === "admin"`
- [ ] Sign-out clears session
- [ ] Sandbox mode still works in dev
- [ ] Go backend accepts Clerk JWT tokens

### Investor Portal Auth
- [ ] Phone OTP sign-up/sign-in works via Clerk
- [ ] OTP delivery within 30 seconds
- [ ] Unapproved phone → "pending approval" message
- [ ] Approved phone → portal access
- [ ] Invite link → auto-approve + sign-up flow
- [ ] Invite claiming + referral tracking preserved
- [ ] Email linking works via Clerk
- [ ] Google linking works via Clerk
- [ ] Sign-out works
- [ ] Session persists across page refreshes
- [ ] Session expires after configured period

### Cross-Cutting
- [ ] Same user can have phone + email + Google (multi-identifier)
- [ ] Admin user can access both dashboard and investor portal
- [ ] Investor user cannot access dashboard
- [ ] Rate limiting on SMS OTP (Clerk-managed)
- [ ] Webhook fires on user.created → metadata set correctly
- [ ] Existing users migrated with correct roles

---

## 8. Estimated Timeline

| Phase | Duration | Dependencies |
|-------|----------|-------------|
| 1. Clerk setup | 0.5 day | Clerk account created |
| 2. Replace WorkOS (main app) | 1 day | Phase 1 |
| 3. Replace investor auth | 2 days | Phase 1 |
| 4. Webhooks & sync | 0.5 day | Phases 2+3 |
| 5. User migration | 1 day | Phase 4 |
| 6. Cleanup & testing | 1 day | Phase 5 |
| **Total** | **~6 days** | |

---

## 9. Files Changed Summary

### Deleted (~20 files)
- 6 investor auth API routes
- 4 investor auth libraries (session, twilio, otp, rate-limit)
- 1 WorkOS callback route
- 1 WorkOS auth-actions library
- investor_auth.ts hook

### Modified (~15 files)
- middleware.ts (WorkOS → Clerk)
- layout.tsx (provider swap)
- login page (WorkOS → Clerk)
- dashboard layout (auth check)
- PublicPageHeader (auth check)
- settings page (user info)
- 5 admin/agent API routes (auth check)
- useApi.ts (token source)
- api.ts (token header)
- InvestorLoginForm.tsx (Clerk custom flow)
- AccountLinking.tsx (simplified)

### Created (~3 files)
- `/api/clerk/webhooks/route.ts` (webhook handler)
- `scripts/migrate-to-clerk.ts` (user migration script)
- `lib/clerk.ts` (shared Clerk helpers, if needed)
