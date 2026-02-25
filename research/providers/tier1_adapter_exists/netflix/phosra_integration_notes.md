# Netflix — Phosra Integration Notes

**Platform:** Netflix
**Assessment Date:** 2026-02-25
**Integration Priority:** Tier 1 (adapter already exists)
**Recommended Approach:** Hybrid (Falcor API reads + Playwright writes)

---

## 1. Phosra Rule Category Coverage

Of Phosra's 45 enforcement rule categories, Netflix can enforce the following:

### Fully Enforceable (via existing Netflix features)

| Rule Category | Netflix Feature | Enforcement Method |
|---|---|---|
| `content_rating_filter` | Per-profile maturity tier (4 levels) | API read / Playwright write |
| `title_restriction` | Per-profile title block list | Playwright (MFA required) |
| `profile_lock` | 4-digit PIN per profile | Playwright |
| `parental_consent_gate` | MFA required for control changes | Built-in (no Phosra action needed) |
| `age_gate` | Maturity tier acts as age gate | Playwright write |
| `viewing_history_access` | Per-profile viewing activity | API read |
| `autoplay_control` | Autoplay next episode / previews toggle | Playwright |

### Partially Enforceable (Phosra-managed workaround)

| Rule Category | Gap | Phosra Workaround |
|---|---|---|
| `screen_time_limit` | No native support | Monitor viewing history, lock profile via PIN change when limit hit |
| `screen_time_report` | No usage dashboard | Aggregate viewing activity data into Phosra's own reports |
| `bedtime_schedule` | No native support | Lock/unlock profile on schedule via cron-triggered Playwright |
| `parental_event_notification` | No native alerts | Phosra monitors viewing activity and sends parent notifications |

### Not Enforceable on Netflix

| Rule Category | Reason |
|---|---|
| `purchase_control` | Netflix is subscription-only; no in-app purchases to control |
| `social_control` | Netflix has no social features (no messaging, comments, friends) |
| `location_tracking` | Not applicable to streaming |
| `web_filtering` | Not applicable (content is curated, not user-generated) |
| `safe_search` | Not applicable |
| `app_control` | Not applicable (Netflix is one app, not an app store) |
| `custom_blocklist` / `custom_allowlist` | Title restrictions partially cover this, but no domain/URL blocking |
| `commercial_data_ban` | Not controllable from consumer side |
| `algorithmic_audit` | Not controllable from consumer side |

---

## 2. Enforcement Strategy

### Read Operations (Falcor API — no browser needed)
```
GET profile list         -> Falcor pathEvaluator (profile paths)
GET maturity settings     -> /api/shakti/*/parentalControls
GET viewing history       -> /api/shakti/*/viewingactivity
GET profile lock status   -> Falcor pathEvaluator
```
- Use cached session cookies (7-14 day TTL)
- Lightweight, fast, low detection risk
- Run on schedule (every 4-6 hours) for monitoring

### Write Operations (Playwright — browser required)
```
SET maturity level        -> Playwright + MFA verification
SET title restrictions    -> Playwright + MFA verification
SET/REMOVE profile PIN    -> Playwright + password re-entry
LOCK/UNLOCK profile       -> Playwright (PIN change)
CREATE kids profile       -> Playwright
TOGGLE autoplay           -> Playwright
```
- Requires browser context with stealth mode
- MFA adds complexity — prefer password-based MFA path (simplest)
- Batch writes in single session to minimize browser launches
- Rate limit: max 1 write session per hour

### Screen Time Enforcement (Phosra-managed)
```
1. Parent sets daily limit in Phosra (e.g., 2 hours)
2. Phosra checks viewing activity every 30 minutes via API
3. Calculate total watch time from history entries
4. When limit reached:
   a. Lock the child's profile (change PIN to Phosra-generated value)
   b. Notify parent via Phosra notification
5. Next day (or at parent's discretion):
   a. Unlock profile (restore or remove PIN)
   b. Reset daily counter
```

**Limitations of this approach:**
- Viewing activity only shows title + date, not exact duration
- 30-minute polling means up to 30 min overshoot
- Locking a profile mid-stream is disruptive (can't resume where left off)
- Requires Phosra to store/manage the profile PIN

---

## 3. Credential Storage Requirements

Phosra needs to store the following per family connection:

| Credential | Purpose | Sensitivity |
|---|---|---|
| Netflix email | Login | High |
| Netflix password | Login + MFA (password path) | Critical |
| Session cookies | API reads, avoid re-login | High (rotate every 7-14 days) |
| Profile GUIDs | Map Phosra child to Netflix profile | Low |
| Phosra-managed PINs | Screen time enforcement (lock/unlock) | Medium |

### Security Considerations
- All credentials must be encrypted at rest (AES-256)
- Session cookies should be stored encrypted with per-user keys
- Password should never be logged or included in error reports
- Consider using Phosra's vault service for credential management
- MFA codes are ephemeral — no storage needed

---

## 4. OAuth Assessment

**Netflix does not offer any partner OAuth or third-party API access.**

- No developer portal or API program
- No OAuth redirect flow
- No API keys or partner tokens
- All integration requires credential-based authentication

This means:
- Phosra must store user's Netflix email + password
- User must explicitly consent to credential storage
- Re-authentication needed every 7-14 days (or when Netflix invalidates sessions)
- Higher UX friction vs platforms with OAuth (e.g., YouTube, Apple TV+)

---

## 5. Existing Adapter Gap Analysis

The current adapter at `web/src/lib/platform-research/adapters/netflix.ts` is a **research adapter** (read-only). For production Phosra integration, we need a **control adapter** with:

### What Exists (research adapter)
- Login flow (email + password)
- Navigate to parental controls page
- Screenshot capture (4 screenshot types)
- Extract structured notes (capabilities, maturity tiers)

### What's Needed (production adapter)

| Feature | Status | Priority |
|---|---|---|
| Session cookie extraction + caching | Missing | P0 |
| Falcor API integration (read layer) | Missing | P0 |
| MFA handling (3 methods) | Missing | P0 |
| Maturity level setter | Missing | P1 |
| Title restriction setter | Missing | P1 |
| Profile PIN management | Missing | P1 |
| Profile lock/unlock (screen time) | Missing | P1 |
| Watch history poller | Missing | P1 |
| Kids profile creator | Missing | P2 |
| Autoplay toggle | Missing | P2 |
| Error recovery & retry logic | Missing | P1 |
| Stealth mode configuration | Missing | P0 |

### Migration Path
1. Keep research adapter as-is for ongoing research runs
2. Build production adapter in `web/src/lib/platform-adapters/netflix/` (new directory)
3. Production adapter imports session management from research adapter
4. Research adapter can optionally use production session manager for efficiency

---

## 6. Netflix Games Consideration

Netflix Games (mobile) has a separate experience:
- Available only on iOS/Android (not web)
- Uses its own content ratings (not tied to profile maturity)
- Cannot be controlled via web parental controls
- Phosra cannot manage Netflix Games via web automation

**Recommendation:** Document as out-of-scope for initial Netflix adapter. Revisit if Netflix adds web-based game controls.

---

## 7. API Accessibility Reality Check

### Complete Absence of Legitimate API Access

Netflix shut down its public API in **November 2014**. Since then:

- **No public API** has been made available for any purpose
- **No partner program** exists for parental control or child safety tools (Open Connect serves ISP/device partners for CDN optimization only)
- **No OAuth flow** or delegated access mechanism exists
- **No developer portal**, API keys, or partner tokens are available
- **No third-party application** has been granted authorized access to Netflix user accounts

This is not a temporary gap or an access request pending approval. Netflix has made a deliberate, decade-long strategic decision to operate as a closed platform with zero third-party API access.

### What Phosra Wants vs. What's Actually Available

| Phosra Goal | What's Needed | What's Available | Gap |
|---|---|---|---|
| Read child's profile settings | Authorized API to query maturity level, restrictions | Unofficial Shakti/Falcor internal API (fragile, ToS violation) | No legitimate access path |
| Set content maturity level | Write API for parental controls | Nothing — no write endpoint exists even unofficially | Must use browser automation (Playwright) |
| Block specific titles | Write API for title restrictions | Nothing — no write endpoint exists even unofficially | Must use browser automation + MFA handling |
| Set/manage profile PIN | Write API for profile lock | Nothing — no write endpoint exists even unofficially | Must use browser automation |
| Monitor viewing history | Read API for watch activity | Unofficial Shakti read endpoint (most reliable unofficial capability, but still fragile) | Fragile unofficial read, ToS violation |
| Enforce screen time limits | Native screen time API or reliable write access | Netflix has no screen time feature; no write API exists | Must chain viewing history reads + profile lock via browser automation |
| Create kids profile | Write API for profile management | Nothing — no known endpoint even in unofficial API surface | Must use browser automation |
| Real-time viewing alerts | Streaming/webhook API for current activity | Nothing — Netflix does not expose real-time viewing status anywhere | Not achievable by any method |

### Current State of the Art: What Competitors Actually Do

Every major parental control product treats Netflix as an opaque, device-level application. None have solved the API access problem:

**Bark:**
- Monitors device-level app usage (detects Netflix is open)
- Cannot see what content is being watched
- Cannot modify any Netflix settings
- Approach: OS-level screen time monitoring only

**Qustodio:**
- Applies device-level time limits to the Netflix app
- Can block the Netflix app entirely on a schedule
- Cannot interact with Netflix profiles, maturity settings, or content
- Approach: Treat Netflix as a black box, control at OS level

**Net Nanny:**
- Web/app filtering at the device level
- Binary control: allow Netflix or block Netflix
- Cannot filter within Netflix (e.g., block mature content but allow kids content)
- Approach: All-or-nothing device-level blocking

**Canopy:**
- OS-level screen time management
- Aggregates Netflix into overall device usage time
- No visibility into Netflix content or settings
- Approach: Device-level time management only

**Mobicip:**
- Device-level app scheduling and blocking
- Can restrict Netflix to certain hours of the day
- Cannot interact with Netflix internal controls
- Approach: Schedule-based device-level blocking

**FamiSafe:**
- Device-level app usage monitoring and time limits
- Reports how long Netflix was open (not what was watched)
- Cannot modify Netflix settings
- Approach: Passive monitoring + device-level time limits

**Key insight:** Phosra's proposed approach of directly integrating with Netflix (reading settings, modifying controls, monitoring content) would be **unprecedented in the industry**. No competitor has attempted this, likely because the ToS/legal risk and maintenance burden outweigh the benefits given Netflix's hostile API posture.

### Regulatory Context: Forces That Could Change the Landscape

Several legislative efforts could eventually compel Netflix to provide APIs for child safety tools:

**KOSA (Kids Online Safety Act — US):**
- Would require covered platforms to provide tools that allow parents to supervise minors' use
- Could be interpreted to mandate API access for authorized parental control tools
- Status: Passed Senate in 2024, reintroduced with bipartisan support. Enactment would create pressure but specific API mandate is uncertain

**EU Digital Services Act (DSA):**
- Requires "very large online platforms" (Netflix qualifies) to assess and mitigate systemic risks to minors
- Article 35 mandates independent auditing of algorithmic systems
- Could create framework for authorized third-party access for child safety purposes
- Status: In force. Enforcement actions beginning. API access mandates are plausible but not yet specified

**UK Online Safety Act:**
- Requires platforms to implement age verification and protect children from harmful content
- Ofcom (regulator) has broad powers to mandate technical measures
- Could potentially require platforms to support third-party parental control integration
- Status: Enacted. Ofcom developing enforcement codes of practice

**Age Appropriate Design Code (UK, California):**
- Requires platforms to default to highest privacy/safety settings for users likely to be children
- Does not currently mandate third-party API access but creates regulatory environment favorable to such mandates

**Timeline estimate:** If legislation forces open APIs, the earliest realistic implementation would be **2027-2028** given rulemaking, compliance periods, and legal challenges. Phosra should not depend on this but should position to be an early adopter when/if it happens.

### Risk Matrix: Browser Automation Approach

| Risk | Likelihood | Impact | Severity | Mitigation |
|---|---|---|---|---|
| **Netflix detects automation, suspends user's account** | Medium | Critical — user loses Netflix service entirely | **Critical** | Stealth mode, human-like timing, minimal frequency, prominent user consent/disclosure |
| **Netflix changes DOM/UI, breaking Playwright selectors** | High (happens regularly) | High — write operations fail until adapter updated | **High** | Robust selector strategy (data-testid, aria attributes over CSS classes), automated regression testing, rapid response maintenance team |
| **Netflix migrates web app from Falcor to GraphQL** | Medium (happened on mobile in 2022) | Critical — all read operations break simultaneously | **Critical** | Monitor Netflix engineering blog, maintain Playwright fallback for reads, design adapter to swap transport layer |
| **MFA flow changes or adds new verification methods** | Medium | High — write operations blocked until MFA handler updated | **High** | Support all 3 current MFA methods, design extensible MFA handler |
| **Netflix rate-limits or blocks Phosra's IP ranges** | Low-Medium | High — all operations fail for affected users | **High** | Distribute operations across residential IPs, use user's own network when possible |
| **Legal action from Netflix (C&D or lawsuit)** | Low | Critical — existential threat to Netflix integration | **Critical** | Legal review before launch, clear user consent, monitor for C&D signals, maintain device-level fallback |
| **User credential compromise via Phosra's storage** | Low | Critical — Netflix account + personal data exposed | **Critical** | AES-256 encryption at rest, per-user encryption keys, HSM for key management, SOC 2 compliance |
| **Netflix adds native parental control APIs** | Low (but desirable) | Positive — eliminates all above risks | **Positive** | Design adapter interface to swap implementation from automation to official API with minimal code changes |
