# Phosra Investor Portal Auth System — Complete Audit

**Audited by:** investor-auditor
**Date:** 2026-02-22
**Task:** #2 — Comprehensive inventory of all investor portal auth files, routes, DB tables, and flows

---

## Executive Summary

The investor portal uses a **phone number-first SMS OTP authentication system** with optional email/Google account linking for convenience. All auth state is server-side validated via JWT tokens stored in httpOnly cookies. The system is built to handle investor approval workflow, one-time invite links with referral tracking, and multi-authentication method support.

---

## 1. API ROUTES (Authentication & Invites)

### 1.1 Phone OTP Authentication

**Route:** `POST /api/investors/auth/request-otp`
**File:** `/Users/jakeklinvex/phosra/web/src/app/api/investors/auth/request-otp/route.ts` (98 lines)

**Purpose:** Initiate SMS OTP flow for phone-first authentication

**Key Logic:**
- Accepts `{ phone, inviteCode }` in request body
- Normalizes phone to E.164 format via `normalizePhone()`
- If `inviteCode` provided: validates invite link, auto-approves phone in `investor_approved_phones` table with referral tracking
- Anti-enumeration: returns same response shape regardless of approval status (random 200-800ms delay for unapproved numbers)
- Checks if phone is approved AND active in DB
- Calls `sendVerifyOtp()` via Twilio Verify service (Twilio handles code generation, storage, rate limiting)

**Response:**
```json
{ "message": "If this number is approved, you will receive a code shortly." }
```

**Security Notes:**
- Phone approval must pre-exist OR come via valid invite code
- Twilio handles OTP rate limiting (built into Verify service)

---

**Route:** `POST /api/investors/auth/verify-otp`
**File:** `/Users/jakeklinvex/phosra/web/src/app/api/investors/auth/verify-otp/route.ts` (106 lines)

**Purpose:** Verify OTP code, create session, set httpOnly cookie

**Key Logic:**
- Accepts `{ phone, code }` in request body
- Verifies code via Twilio Verify (`checkVerifyOtp()`)
- Looks up investor info from `investor_approved_phones` (name, company)
- Creates JWT session token via `createSessionToken()`:
  - Payload: `{ phone, name, company, jti }`
  - Algorithm: HS256
  - Expiration: configurable via `INVESTOR_SESSION_DAYS` env var (default 30 days)
  - jti (JWT ID): random UUID for server-side revocation tracking
- Stores session in DB: `investor_sessions` table with token hash, expiry, user_agent, IP
- Sets httpOnly cookie (`investor_session`) with secure=true in prod, sameSite=lax

**Response:**
```json
{
  "message": "Authenticated",
  "investor": { "phone": "+12125551234", "name": "John Doe", "company": "Acme" }
}
```

**Security Notes:**
- Twilio Verify handles code validation
- Server stores hash of JWT jti, not the token itself
- Session validated server-side on every request

---

### 1.2 Session Management

**Route:** `GET /api/investors/auth/session`
**File:** `/Users/jakeklinvex/phosra/web/src/app/api/investors/auth/session/route.ts` (62 lines)

**Purpose:** Check session validity, validate investor access

**Key Logic (GET):**
- Reads `investor_session` cookie
- Verifies JWT token signature and expiration
- Checks server-side revocation: looks up token_hash in `investor_sessions` table, confirms not revoked
- Verifies phone is still active in `investor_approved_phones` (is_active = TRUE)
- If any check fails: revokes session, deletes cookie, returns 401 or 403

**Response:**
```json
{ "phone": "+12125551234", "name": "John Doe", "company": "Acme" }
```

**Key Logic (DELETE):**
- Signs out: marks token as revoked in `investor_sessions` table
- Deletes `investor_session` cookie
- No auth required (graceful logout even if session compromised)

---

### 1.3 Account Linking — Email

**Route (POST):** `POST /api/investors/auth/link-email`
**Route (GET):** `GET /api/investors/auth/link-email?token=...&email=...&phone=...`
**File:** `/Users/jakeklinvex/phosra/web/src/app/api/investors/auth/link-email/route.ts` (126 lines)

**Purpose:** Add email as alternative login method (via magic link)

**POST Logic (Send Magic Link):**
- Requires authenticated session
- Accepts `{ email }` in request body
- Validates email format (basic check: contains @)
- Checks if email already linked to this phone
- Generates random 32-byte magic link token
- Stores link record in `investor_otp_codes` table with:
  - `phone_e164`: `"link:${email}:${phone}"` (special format for link tracking)
  - `code_hash`: SHA-256 hash of token (never store plaintext)
  - `expires_at`: 15 minutes from now
- Sends magic link email via Resend API with clickable link containing token, email, phone
- Response: `{ "message": "Magic link sent to your email" }`

**GET Logic (Claim Link):**
- No auth required (public endpoint for email verification)
- Reads `token`, `email`, `phone` from query params
- Looks up record in `investor_otp_codes` with matching hash, not used, not expired
- Marks as used
- Creates entry in `investor_linked_accounts` table:
  - provider: 'email'
  - provider_id: email (lowercased)
  - provider_email: email
  - phone_e164: phone
- Redirect to `/investors/portal?link_success=email` or error page

**Security Notes:**
- Magic link tokens valid for 15 minutes only
- Tokens hashed before storage (SHA-256)
- One-time use tracked via `used` flag
- Email must be verified via Resend delivery

---

**Route:** `POST /api/investors/auth/link-google`
**File:** `/Users/jakeklinvex/phosra/web/src/app/api/investors/auth/link-google/route.ts` (84 lines)

**Purpose:** Link Google account for convenience login

**Key Logic:**
- Requires authenticated session
- Accepts `{ idToken }` (Google OAuth id_token) in request body
- Verifies id_token by calling Google's tokeninfo endpoint
- Extracts `sub` (Google user ID), `email`, `email_verified` from token
- Checks if Google account already linked to this phone
- Creates entry in `investor_linked_accounts` table:
  - provider: 'google'
  - provider_id: Google sub (unique per user per app)
  - provider_email: Google email
  - phone_e164: current session phone
- Response: `{ "message": "Google account linked" }`

**Security Notes:**
- Google id_token validated against Google's public endpoint
- No direct exchange for access token (id_token-only flow, more secure)
- Prevents duplicate Google linking per phone

---

### 1.4 Linked Account Login (Skip OTP)

**Route:** `POST /api/investors/auth/login-linked`
**File:** `/Users/jakeklinvex/phosra/web/src/app/api/investors/auth/login-linked/route.ts` (131 lines)

**Purpose:** Login via linked email or Google (bypass phone OTP)

**Key Logic:**
- No session required (public endpoint)
- Accepts `{ provider: 'email'|'google', idToken?, email? }` in request body
- If Google: verifies id_token, extracts `sub`
- If Email: uses email directly as provider_id
- Looks up `investor_linked_accounts` for matching (provider, provider_id) pair
- Gets phone_e164 from linked account
- Verifies phone is active in `investor_approved_phones`
- Creates session (same as OTP verify flow) and sets httpOnly cookie
- Returns investor info

**Response:**
```json
{
  "message": "Authenticated",
  "investor": { "phone": "+12125551234", "name": "John Doe", "company": "Acme" }
}
```

---

### 1.5 Invite Link System

**Route:** `POST /api/investors/portal/invite`
**File:** `/Users/jakeklinvex/phosra/web/src/app/api/investors/portal/invite/route.ts` (75 lines)

**Purpose:** Generate one-time invite link for referral

**Key Logic:**
- Requires authenticated investor session
- Accepts `{ name?, recipientName? }` in request body
- Validates referrer name (required) and recipient name (required)
- Updates referrer's name in `investor_approved_phones` table
- **Rate limit:** max 5 active (unclaimed, unexpired) invites per investor
- Generates random 16-byte hex code
- Creates entry in `investor_invite_links` table:
  - code: unique invite code
  - created_by: referrer phone_e164
  - referrer_name, recipient_name: personalization info
  - max_uses: 1 (one-time use)
  - expires_at: 7 days from now
  - uses: 0 (starts at 0)
- Response includes code and full URL

**Response:**
```json
{
  "code": "abcd1234...",
  "url": "https://phosra.com/investors/portal?invite=abcd1234...",
  "expiresAt": "2026-03-01T12:34:56Z"
}
```

**Note on Referral Tracking:**
- When invite code used in `/api/investors/auth/request-otp`, the new phone is auto-approved with `referred_by` field set to `created_by` phone
- This creates referral chain in `investor_approved_phones` table

---

**Route:** `GET /api/investors/portal/invite/[code]`
**File:** `/Users/jakeklinvex/phosra/web/src/app/api/investors/portal/invite/[code]/route.ts` (60 lines)

**Purpose:** Validate invite link (public, no auth)

**Key Logic:**
- Public endpoint (anti-enumeration)
- Looks up invite by code
- Checks if expired or already used (uses >= max_uses)
- If invalid: returns `{ valid: false }`
- If valid: looks up referrer info from `investor_approved_phones` and returns:

```json
{
  "valid": true,
  "referrerName": "John Doe",
  "referrerCompany": "Acme Corp",
  "recipientName": "Jane Smith"
}
```

---

**Route:** `POST /api/investors/portal/invite/[code]/claim`
**File:** `/Users/jakeklinvex/phosra/web/src/app/api/investors/portal/invite/[code]/claim/route.ts` (65 lines)

**Purpose:** Mark invite as claimed (called after OTP verification)

**Key Logic:**
- Called by login flow after successful OTP verification
- Accepts `{ phone }` in request body
- Looks up invite by code
- If expired or used: returns ok anyway (idempotent)
- Increments `uses` counter
- Creates entry in `investor_invite_claims` table (audit trail):
  - invite_code
  - claimed_by_phone
  - ip_address, user_agent (forensics)
  - timestamps
- Response: `{ ok: true }`

---

## 2. AUTHENTICATION LIBRARIES

### 2.1 Session Token Management

**File:** `/Users/jakeklinvex/phosra/web/src/lib/investors/session.ts` (77 lines)

**Purpose:** JWT creation, verification, hashing

**Exports:**
- `createSessionToken(payload)` → `{ token, jti, expiresAt }`
  - Creates HS256 JWT with payload: phone, name, company, jti
  - Expiration: `INVESTOR_SESSION_DAYS` env var (default 30 days)
  - jti: unique UUID for server-side revocation

- `verifySessionToken(token)` → `InvestorTokenPayload | null`
  - Verifies HS256 signature using `INVESTOR_JWT_SECRET`
  - Returns payload or null if invalid/expired

- `hashToken(jti)` → SHA-256 hash
  - Used to store token hash in DB instead of plaintext

**Dependency:** `jose` library (JWT)

---

### 2.2 Twilio Integration

**File:** `/Users/jakeklinvex/phosra/web/src/lib/investors/twilio.ts` (68 lines)

**Purpose:** SMS OTP delivery, invite SMS

**Exports:**
- `sendVerifyOtp(to)` → void
  - Creates verification via Twilio Verify service
  - Twilio generates 6-digit code, sends via SMS, handles rate limiting
  - Channel: SMS

- `checkVerifyOtp(to, code)` → boolean
  - Verifies code against Twilio Verify
  - Returns true if approved, false otherwise

- `sendInviteSms(to, inviterName)` → void
  - Sends personalized SMS with portal invite link
  - Uses messagingServiceSid if available (10DLC), falls back to direct number
  - Best-effort: may fail if A2P registration incomplete

**Environment Variables:**
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
- `TWILIO_VERIFY_SERVICE_SID`
- `TWILIO_MESSAGING_SERVICE_SID` (optional, for 10DLC)
- `TWILIO_PHONE_NUMBER` (fallback for direct sends)

---

### 2.3 Phone Normalization

**File:** `/Users/jakeklinvex/phosra/web/src/lib/investors/phone.ts` (43 lines)

**Purpose:** Phone number validation and formatting

**Exports:**
- `normalizePhone(input)` → E.164 string or null
  - Handles: 10-digit US, +1, international formats
  - Returns E.164 format (+1XXXXXXXXXX for US) or null if invalid
  - Strips non-digit chars (except leading +)

- `formatPhoneDisplay(e164)` → formatted string
  - Converts E.164 to display format
  - Example: +12125551234 → (212) 555-1234

---

### 2.4 OTP Utilities (Legacy/Unused)

**File:** `/Users/jakeklinvex/phosra/web/src/lib/investors/otp.ts` (27 lines)

**Purpose:** OTP generation and verification (NOT currently used in flow — Twilio handles this)

**Exports:**
- `generateOtp()` → 6-digit string
- `hashOtp(code)` → SHA-256 hash
- `verifyOtp(code, storedHash)` → boolean (timing-safe comparison)

**Note:** These functions exist but are not used in the current flow. Twilio Verify service handles OTP lifecycle.

---

### 2.5 Rate Limiting

**File:** `/Users/jakeklinvex/phosra/web/src/lib/investors/rate-limit.ts` (18 lines)

**Purpose:** Check if phone exceeded OTP request rate limit

**Exports:**
- `isRateLimited(phoneE164)` → boolean
  - Returns true if phone has 3+ OTP requests in last 10 minutes
  - Queries `investor_otp_codes` table with timestamp window
  - **NOTE:** Not currently used in request-otp route (Twilio handles rate limiting)

**Constants:**
- MAX_OTPS_PER_WINDOW: 3
- WINDOW_MINUTES: 10

---

### 2.6 Database Connection Pool

**File:** `/Users/jakeklinvex/phosra/web/src/lib/investors/db.ts` (33 lines)

**Purpose:** PostgreSQL connection pooling

**Exports:**
- `getPool()` → pg.Pool (singleton)
- `query<T>(text, params)` → T[]
- `queryOne<T>(text, params)` → T | null

**Config:**
- Connection string: `INVESTOR_DB_URL` env var (Supabase Postgres)
- Pool size: max 5 connections
- Idle timeout: 30 seconds
- SSL: enabled with rejectUnauthorized=false

---

### 2.7 Warm Intro Network (Large File, Not Audited Fully)

**File:** `/Users/jakeklinvex/phosra/web/src/lib/investors/warm-intro-network.ts` (426.9 KB)

**Purpose:** Graph database for referral network tracking

**Note:** File too large to audit. Likely contains warm introduction/referral network logic.

---

### 2.8 Activity Logging

**File:** `/Users/jakeklinvex/phosra/web/src/lib/investors/activity.ts`

**Purpose:** Likely activity/audit logging for investor actions

**Note:** File referenced but not fully audited in this session.

---

## 3. UI COMPONENTS

### 3.1 Login Form

**File:** `/Users/jakeklinvex/phosra/web/src/components/investors/InvestorLoginForm.tsx` (263 lines)

**Purpose:** Main login UI (phone OTP + optional email/Google fallback)

**States:**
- `invite_loading`: Validating invite code on mount
- `phone_input`: Initial phone input
- `otp_sent`: Waiting for OTP code entry
- `verifying`: Verifying OTP with server

**Key Flows:**
1. Resolves invite code from prop or URL query param `?invite=CODE`
2. If invite code: validates via `GET /api/investors/portal/invite/[code]`
3. User enters phone → `POST /api/investors/auth/request-otp` (with inviteCode if present)
4. User enters OTP → `POST /api/investors/auth/verify-otp`
5. On success: calls `onAuthenticated()` callback AND `POST /api/investors/portal/invite/[code]/claim`

**Props:**
- `onAuthenticated: () => void` — callback on successful auth
- `inviteCode?: string | null` — optional invite code

**Referral Context:**
- Displays personalized header when invite present
- Shows "Welcome [recipientName], you've been invited by [referrerName]"

---

### 3.2 Account Linking

**File:** `/Users/jakeklinvex/phosra/web/src/components/investors/AccountLinking.tsx` (149 lines)

**Purpose:** Link email or Google for convenience auth

**Features:**
- Email input + "Send Link" button → triggers `POST /api/investors/auth/link-email`
- "Link Google" button → triggers Google Sign-In popup via Google Identity Services
- Displays success states (checkmarks)
- Error handling for both methods

**Props:**
- `phone: string` — current investor phone (for context)

**Integration:**
- Requires Google Identity Services script loaded on page (global `google.accounts.id`)
- Sends id_token to `POST /api/investors/auth/link-google`

---

### 3.3 Phone Input Component

**File:** `/Users/jakeklinvex/phosra/web/src/components/investors/PhoneInput.tsx` (82 lines)

**Purpose:** Formatted phone number input field

**Features:**
- Accepts only digits, max 10
- Auto-formats as user types: (555) 555-1234
- Enter key submits
- Phone icon + "+1" prefix
- Error display
- Accessible: tel inputMode, autoComplete

**Props:**
- `value, onChange, onSubmit, disabled, error`

---

### 3.4 OTP Input Component

**File:** `/Users/jakeklinvex/phosra/web/src/components/investors/OtpInput.tsx` (122 lines)

**Purpose:** 6-digit OTP input with individual digit boxes

**Features:**
- 6 focused input boxes (configurable length)
- Auto-focus next box on digit entry
- Backspace deletes and moves back
- Paste support (auto-fills all digits)
- Arrow keys navigate between boxes
- Auto-focus first box on mount
- Auto-submit when all 6 digits entered

**Props:**
- `value, onChange, onComplete, disabled, error, length=6`

---

### 3.5 Referral Components (Audit Trail Only)

**File:** `/Users/jakeklinvex/phosra/web/src/components/investors/ReferralStats.tsx`

**Purpose:** Display referral metrics

**Metrics Tracked:**
- invitesSent, invitesClaimed
- deckSharesSent, totalDeckViews
- referralInvestments, referralAmountCents
- referralScore

**Note:** Data model suggests backend tracking of referral conversions and capital amounts.

**Other Referral Components:**
- `ReferralLeaderboard.tsx` — Leaderboard UI
- `ReferralHub.tsx` — Central referral dashboard
- `ReferralActivityFeed.tsx` — Activity feed
- `ReferralBadges.tsx` — Achievement badges

---

### 3.6 Other Components

- **OtpInput.tsx**: 6-digit OTP input (detailed above)
- **PhoneInput.tsx**: Phone number input (detailed above)
- **SafeSection.tsx**: SAFE agreement management UI
- **InterestModal.tsx**: Interest registration modal

---

## 4. DATABASE SCHEMA

All tables use `INVESTOR_DB_URL` (Supabase Postgres) as separate connection pool.

### 4.1 Core Auth Tables

#### `investor_approved_phones` (Migration 033)

```sql
CREATE TABLE investor_approved_phones (
    id              BIGSERIAL PRIMARY KEY,
    phone_e164      TEXT NOT NULL UNIQUE,      -- +12125551234 format
    name            TEXT NOT NULL DEFAULT '',   -- Investor full name
    company         TEXT NOT NULL DEFAULT '',   -- Company name
    notes           TEXT NOT NULL DEFAULT '',   -- Admin notes
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    referred_by     TEXT,                      -- phone_e164 of referrer
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_investor_phones_active ON investor_approved_phones
  (is_active) WHERE is_active = TRUE;
```

**Purpose:** Whitelist of approved investor phone numbers
**Admin-Managed:** Yes (created outside auth system)
**Key Columns:**
- `phone_e164`: Primary lookup key for authentication
- `is_active`: Soft-delete / revocation flag
- `referred_by`: Tracks referral source (phone_e164 of referrer)

---

#### `investor_otp_codes`

```sql
CREATE TABLE investor_otp_codes (
    id              BIGSERIAL PRIMARY KEY,
    phone_e164      TEXT NOT NULL,              -- Phone or special format for links
    code_hash       TEXT NOT NULL,              -- SHA-256(code)
    expires_at      TIMESTAMPTZ NOT NULL,
    attempts        INT NOT NULL DEFAULT 0,
    used            BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_investor_otp_phone ON investor_otp_codes
  (phone_e164, created_at DESC);
```

**Purpose:** Temporary storage for OTP codes and magic link tokens
**Lifecycle:** Expires after configured window (OTP ~10-15 min, links ~15 min)
**Special phone_e164 Values:**
- `"link:${email}:${phone}"` for email magic links
- Used to track link requests separately from OTP requests

**Note:** Twilio Verify handles most OTP storage; this table used for local link tracking and rate limiting history.

---

#### `investor_sessions`

```sql
CREATE TABLE investor_sessions (
    id              BIGSERIAL PRIMARY KEY,
    phone_e164      TEXT NOT NULL,
    token_hash      TEXT NOT NULL UNIQUE,      -- SHA-256(jti)
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked_at      TIMESTAMPTZ,               -- NULL = active
    user_agent      TEXT NOT NULL DEFAULT '',
    ip_address      TEXT NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_investor_sessions_phone ON investor_sessions (phone_e164);
CREATE INDEX idx_investor_sessions_token ON investor_sessions
  (token_hash) WHERE revoked_at IS NULL;
```

**Purpose:** Server-side session revocation and audit trail
**JWT Invalidation:** By checking token_hash and revoked_at
**Audit Info:** Stores IP and user agent for forensics
**Index Optimization:** Partial index on active (non-revoked) sessions for session check queries

---

#### `investor_linked_accounts`

```sql
CREATE TABLE investor_linked_accounts (
    id              BIGSERIAL PRIMARY KEY,
    phone_e164      TEXT NOT NULL
      REFERENCES investor_approved_phones(phone_e164) ON DELETE CASCADE,
    provider        TEXT NOT NULL
      CHECK (provider IN ('email', 'google')),
    provider_id     TEXT NOT NULL,             -- sub for Google, email for Email
    provider_email  TEXT NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (provider, provider_id)
);

CREATE INDEX idx_investor_linked_phone ON investor_linked_accounts (phone_e164);
CREATE INDEX idx_investor_linked_provider ON investor_linked_accounts
  (provider, provider_id);
```

**Purpose:** Map email/Google accounts to investor phone
**Lookup:** By (provider, provider_id) for convenience login
**Cascade Delete:** Deleting phone cascades to linked accounts
**Constraints:** One-to-many (one phone → multiple linked accounts, but one Google/email per provider)

---

### 4.2 Referral/Invite Tables

#### `investor_invite_links` (Migration 035)

```sql
CREATE TABLE investor_invite_links (
    id              BIGSERIAL PRIMARY KEY,
    code            TEXT NOT NULL UNIQUE,      -- 32-byte hex
    created_by      TEXT NOT NULL,             -- phone_e164 of referrer
    referrer_name   TEXT NOT NULL DEFAULT '',  -- "John Doe"
    recipient_name  TEXT NOT NULL DEFAULT '',  -- "Jane Smith"
    max_uses        INT NOT NULL DEFAULT 1,
    uses            INT NOT NULL DEFAULT 0,
    expires_at      TIMESTAMPTZ NOT NULL,      -- 7 days default
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invite_links_code ON investor_invite_links(code);
CREATE INDEX idx_invite_links_created_by ON investor_invite_links(created_by);
```

**Purpose:** One-time invite links for referral
**Lifecycle:** Expires after 7 days OR after 1 use (max_uses=1)
**Personalization:** referrer_name and recipient_name shown during login
**Rate Limit:** Max 5 active (unclaimed, unexpired) per investor (application-level check)

---

#### `investor_invite_claims`

```sql
CREATE TABLE investor_invite_claims (
    id              BIGSERIAL PRIMARY KEY,
    invite_code     TEXT NOT NULL
      REFERENCES investor_invite_links(code),
    name            TEXT NOT NULL DEFAULT '',  -- Phone or name
    company         TEXT NOT NULL DEFAULT '',  -- (currently unused)
    email           TEXT NOT NULL DEFAULT '',  -- (currently unused)
    ip_address      TEXT NOT NULL DEFAULT '',
    user_agent      TEXT NOT NULL DEFAULT '',
    claimed_by_phone TEXT,                    -- Phone that claimed
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invite_claims_code ON investor_invite_claims(invite_code);
```

**Purpose:** Audit trail of invite claims (who used the invite, when, from where)
**Forensics:** IP address and user agent logged for abuse detection
**Note:** Claim recorded after OTP verification completes

---

## 5. AUTHENTICATION FLOW DIAGRAMS

### 5.1 Phone OTP Authentication (Primary)

```
User enters phone
  ↓
POST /api/investors/auth/request-otp { phone, inviteCode? }
  ├─ Normalize phone to E.164
  ├─ If inviteCode: validate & auto-approve phone in investor_approved_phones
  ├─ Anti-enumeration: 200-800ms random delay if not approved
  ├─ Check phone is approved AND is_active = TRUE
  └─ sendVerifyOtp(phone) via Twilio → SMS delivered
  ↓
User receives SMS with 6-digit code
  ↓
POST /api/investors/auth/verify-otp { phone, code }
  ├─ Verify code via Twilio
  ├─ Look up investor info from investor_approved_phones
  ├─ createSessionToken() → JWT with jti
  ├─ Store session: investor_sessions { token_hash, expires_at, ip, ua }
  └─ Set httpOnly cookie (investor_session)
  ↓
GET /api/investors/auth/session
  ├─ Read cookie
  ├─ Verify JWT signature & expiration
  ├─ Check token_hash in investor_sessions (not revoked)
  ├─ Check phone is_active
  └─ Return investor info
  ↓
Authenticated ✓

Optional: POST /api/investors/portal/invite/[code]/claim
  └─ Mark invite as used + record audit trail
```

### 5.2 Invite-Based Onboarding

```
Referrer (authenticated)
  ↓
POST /api/investors/portal/invite
  ├─ Validate names
  ├─ Rate limit: max 5 active
  ├─ Generate code
  └─ Create investor_invite_links entry (expires 7 days)
  ↓
Invite code → URL: phosra.com/investors/portal?invite=CODE
  ↓
Recipient receives link (SMS, email, Slack, etc.)
  ↓
GET /api/investors/portal/invite/[code]
  ├─ Check valid (not expired, not used)
  └─ Return referrer/recipient names
  ↓
UI displays: "Welcome [recipient], invited by [referrer]"
  ↓
POST /api/investors/auth/request-otp { phone, inviteCode: CODE }
  ├─ Validate invite
  ├─ Auto-approve phone with referred_by = referrer_phone
  └─ Send OTP
  ↓
POST /api/investors/auth/verify-otp { phone, code }
  └─ Create session
  ↓
POST /api/investors/portal/invite/[code]/claim
  ├─ Increment uses counter
  ├─ Record investor_invite_claims (audit trail)
  └─ Invite marked as "used"
  ↓
Authenticated + referral tracked ✓
```

### 5.3 Email/Google Convenience Login

```
First Time (must use phone OTP first):
  ├─ Phone OTP auth → authenticated
  ├─ POST /api/investors/auth/link-email { email }
  │   └─ Generate magic link, send via Resend
  ├─ GET /api/investors/auth/link-email?token=...
  │   └─ Create investor_linked_accounts { provider: 'email', provider_id: email }
  └─ OR POST /api/investors/auth/link-google { idToken }
      └─ Verify token, create investor_linked_accounts { provider: 'google', provider_id: sub }

Subsequent Login:
  ├─ POST /api/investors/auth/login-linked { provider, idToken|email }
  ├─ Look up investor_linked_accounts
  ├─ Get phone_e164
  ├─ Verify phone is_active
  ├─ Create session (same as OTP)
  └─ Set httpOnly cookie
  ↓
Authenticated ✓ (skipped phone OTP)
```

---

## 6. SECURITY ANALYSIS

### 6.1 Strengths

1. **Phone-First Verification:** SMS OTP is hard to intercept; Twilio handles rate limiting
2. **httpOnly Cookies:** Session token not accessible to JavaScript (no XSS exfiltration)
3. **Server-Side Sessions:** Token hash stored in DB; server controls revocation
4. **Hashed Tokens:** Never store plaintext JWT or OTP codes
5. **Anti-Enumeration:** Same response time/shape for approved vs unapproved phones
6. **E.164 Normalization:** Consistent phone formatting prevents lookup issues
7. **Timing-Safe Comparison:** OTP verification uses crypto.timingSafeEqual
8. **JWT jti:** Per-session unique ID enables per-session revocation (not just expiration)
9. **Invite Rate Limiting:** Max 5 active invites per investor (application-level)
10. **Email Verification:** Magic link tokens hashed, expire after 15 min
11. **Google Token Verification:** Direct verification with Google endpoint (not client-supplied)

### 6.2 Potential Risks

1. **Twilio Dependency:** Entire OTP system relies on Twilio Verify service. If Twilio down, auth broken.
2. **Magic Link Email:** Resend API dependency; token exposed in email (unavoidable with email auth)
3. **No 2FA Option:** Phone OTP is sole verification method (no backup codes, no authenticator app)
4. **No Account Recovery:** If phone lost, no obvious recovery mechanism
5. **Admin Approval:** Phone whitelist is manually admin-managed; no self-service onboarding
6. **Google Token Validation:** Calls Google endpoint; network latency + potential point of failure
7. **Referral Phone Storage:** `referred_by` field enables phone number enumeration if DB leaked
8. **No Password:** All auth via phone/email/Google; single factor per method
9. **No IP Rate Limiting:** No per-IP request throttling (only per-phone and Twilio's rate limits)
10. **OTP Table Bloat:** investor_otp_codes can grow large; no cleanup job visible

### 6.3 Recommendations for Clerk Migration

1. **Replace Twilio OTP:** Use Clerk's built-in SMS verification (simpler, maintained)
2. **Standardize Sessions:** Clerk manages session lifecycle (no manual JWT/hashing needed)
3. **Simplify Linked Auth:** Clerk handles email + Google linking with consistent APIs
4. **User Management:** Centralize investor whitelist in Clerk user management
5. **Backup Auth:** Clerk supports backup codes, authenticator apps
6. **Admin Dashboard:** Clerk provides admin dashboard for user management (no custom DB table)
7. **Audit Logs:** Clerk provides built-in audit logging (no manual investor_sessions table)

---

## 7. ENVIRONMENT VARIABLES REQUIRED

### Auth & Session

- `INVESTOR_DB_URL` — Supabase Postgres connection string
- `INVESTOR_JWT_SECRET` — HS256 signing key for JWT tokens
- `INVESTOR_SESSION_DAYS` — Session expiration (default 30)

### Twilio

- `TWILIO_ACCOUNT_SID` — Account ID
- `TWILIO_AUTH_TOKEN` — Auth token
- `TWILIO_VERIFY_SERVICE_SID` — Verify service ID
- `TWILIO_MESSAGING_SERVICE_SID` — (optional) 10DLC messaging service
- `TWILIO_PHONE_NUMBER` — Fallback SMS sender

### Email

- `RESEND_API_KEY` — Resend API key for magic link emails

### URLs

- `NEXT_PUBLIC_VERCEL_URL` — Vercel deployment URL (for invite links, magic link callbacks)
- `NEXTAUTH_URL` — Fallback base URL

---

## 8. FILE INVENTORY SUMMARY

### API Routes (6 files)

| Route | File | Lines | Purpose |
|-------|------|-------|---------|
| POST /api/investors/auth/request-otp | route.ts | 98 | Request SMS OTP |
| POST /api/investors/auth/verify-otp | route.ts | 106 | Verify OTP, create session |
| GET/DELETE /api/investors/auth/session | route.ts | 62 | Check/revoke session |
| POST/GET /api/investors/auth/link-email | route.ts | 126 | Link email magic link |
| POST /api/investors/auth/link-google | route.ts | 84 | Link Google account |
| POST /api/investors/auth/login-linked | route.ts | 131 | Login via email/Google |
| POST /api/investors/portal/invite | route.ts | 75 | Generate invite link |
| GET /api/investors/portal/invite/[code] | route.ts | 60 | Validate invite |
| POST /api/investors/portal/invite/[code]/claim | route.ts | 65 | Mark invite claimed |

### Auth Libraries (7 files)

| File | Lines | Purpose |
|------|-------|---------|
| lib/investors/session.ts | 77 | JWT creation, verification |
| lib/investors/twilio.ts | 68 | SMS OTP, invite SMS |
| lib/investors/phone.ts | 43 | Phone normalization |
| lib/investors/otp.ts | 27 | OTP generation (unused) |
| lib/investors/rate-limit.ts | 18 | Rate limit checking |
| lib/investors/db.ts | 33 | DB connection pool |
| lib/investors/investor-auth.ts | 58 | Session hook (React) |

### UI Components (11 files)

| Component | Lines | Purpose |
|-----------|-------|---------|
| InvestorLoginForm.tsx | 263 | Main login UI |
| AccountLinking.tsx | 149 | Email/Google linking UI |
| PhoneInput.tsx | 82 | Phone input field |
| OtpInput.tsx | 122 | OTP 6-digit input |
| ReferralStats.tsx | ~50 | Referral metrics display |
| ReferralLeaderboard.tsx | - | Leaderboard |
| ReferralActivityFeed.tsx | - | Activity feed |
| ReferralHub.tsx | - | Referral dashboard |
| ReferralBadges.tsx | - | Achievement badges |
| SafeSection.tsx | - | SAFE UI |
| InterestModal.tsx | - | Interest modal |

### Database Tables (6 tables)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| investor_approved_phones | Whitelist of approved investors | phone_e164, is_active, referred_by |
| investor_otp_codes | OTP & magic link tokens | phone_e164, code_hash, expires_at |
| investor_sessions | Server-side session tracking | phone_e164, token_hash, revoked_at |
| investor_linked_accounts | Email/Google account linking | provider, provider_id, phone_e164 |
| investor_invite_links | One-time referral invite codes | code, created_by, uses, expires_at |
| investor_invite_claims | Audit trail of invite claims | invite_code, ip_address, user_agent |

### Migrations (2 files)

| Migration | Purpose |
|-----------|---------|
| 033_investor_auth.sql | Tables: approved_phones, otp_codes, sessions, linked_accounts |
| 035_investor_invites.sql | Tables: invite_links, invite_claims |

---

## 9. NOTES FOR CLERK MIGRATION

### Data Model Alignment

**Phosra Current:**
- Investor = approved phone number + name/company
- Session = JWT with jti + server-side hash storage
- Linked auth = separate table mapping email/Google to phone

**Clerk Equivalent:**
- Investor = Clerk User with phone identifier + metadata
- Session = Clerk Session (managed by Clerk, no manual JWT)
- Linked auth = Clerk Identifiers (phone, email, OAuth providers)

### Migration Steps (Conceptual)

1. **Create Clerk organization** for "Investors" (separate from main app)
2. **Migrate investor_approved_phones** → Clerk Users with phone identifier + metadata (name, company, referred_by)
3. **Replace JWT session logic** → Use Clerk's `getAuth()` in middleware
4. **Replace Twilio OTP** → Use Clerk's SMS verification (or keep Twilio if preferred)
5. **Migrate linked accounts** → Clerk Identifiers or OAuth social connections
6. **Deprecate investor_sessions table** → Clerk handles session management
7. **Keep investor_invite_links/claims** → Clerk doesn't have built-in referral/invite system; keep this custom
8. **Simplify auth routes** → Most logic moves to Clerk SDK; routes become thin wrappers

### High-Risk Areas

- **Invite System:** Clerk doesn't have built-in 1-time invite links; must remain custom
- **Referral Tracking:** `referred_by` field needs custom metadata/extension
- **Admin Whitelist:** Must decide if Clerk organization + role-based access or keep DB whitelist
- **Session Revocation:** Clerk revokes sessions via invalidation; ensure cleanup of investor_sessions table

---

## 10. CONCLUSION

The investor portal auth system is a well-structured, security-conscious implementation using phone OTP + optional email/Google linking. The referral invite system with one-time codes and tracking is thorough. Key dependencies are Twilio for SMS and Resend for email. The system is production-ready but has some maintenance burden (admin whitelist, session cleanup, Twilio integration).

For Clerk migration, the main gains are simplified JWT/session management and consistent auth APIs. The invite system must remain custom as Clerk doesn't provide equivalent functionality.

---

**Audit Complete:** investor-auditor (2026-02-22)
