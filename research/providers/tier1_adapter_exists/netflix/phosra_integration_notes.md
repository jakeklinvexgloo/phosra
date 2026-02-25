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
