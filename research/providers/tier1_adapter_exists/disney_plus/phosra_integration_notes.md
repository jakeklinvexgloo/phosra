# Disney+ -- Phosra Integration Notes

**Platform:** Disney+
**Assessment Date:** 2026-03-01
**Integration Priority:** Tier 1 (adapter planned)
**Recommended Approach:** Hybrid (Private REST API reads + Playwright writes)

---

## 1. Phosra Rule Category Coverage

Of Phosra's 45 enforcement rule categories, Disney+ can enforce the following:

### Fully Enforceable (via existing Disney+ features)

| Rule Category | Disney+ Feature | Enforcement Method |
|---|---|---|
| `content_rating_filter` | Per-profile content rating (TV-Y through TV-MA, 6 tiers) | API read / Playwright write (password gate) |
| `profile_lock` | 4-digit PIN per profile | Playwright (password gate) |
| `parental_consent_gate` | Password required for settings changes + Restrict Profile Creation | Built-in (no Phosra action needed) |
| `age_gate` | Content rating tier acts as age gate; Junior Mode for youngest | Playwright write |
| `viewing_history_access` | Continue Watching row per profile | API read + Playwright scrape |
| `autoplay_control` | Autoplay next episode + Background Video toggles | Playwright |
| `kids_profile` | Junior Mode with simplified UI and content filtering | Playwright (toggle during profile creation/edit) |

### Partially Enforceable (Phosra-managed workaround)

| Rule Category | Gap | Phosra Workaround |
|---|---|---|
| `screen_time_limit` | No native support | Monitor Continue Watching for activity; lock profile via PIN change when limit hit |
| `screen_time_report` | No usage dashboard | Aggregate Continue Watching data into Phosra's own reports (limited by lack of timestamps/duration) |
| `bedtime_schedule` | No native support | Lock/unlock profile on schedule via cron-triggered Playwright |
| `parental_event_notification` | No native alerts | Phosra monitors Continue Watching and sends parent notifications when new content appears |

### Not Enforceable on Disney+

| Rule Category | Reason |
|---|---|
| `title_restriction` | Disney+ does not offer per-title blocking. Content filtering is tier-based only. |
| `purchase_control` | Disney+ is subscription-only; no in-app purchases to control |
| `social_control` | Disney+ has no social features (no messaging, comments, friends) -- GroupWatch was removed September 2023 |
| `location_tracking` | Not applicable to streaming |
| `web_filtering` | Not applicable (content is curated, not user-generated) |
| `safe_search` | Not applicable -- Disney+ search only returns catalog content |
| `app_control` | Not applicable (Disney+ is one app, not an app store) |
| `custom_blocklist` / `custom_allowlist` | No per-title blocking mechanism exists |
| `commercial_data_ban` | Not controllable from consumer side |
| `algorithmic_audit` | Not controllable from consumer side |

---

## 2. Enforcement Strategy

### Read Operations (Private REST API -- no browser needed)
```
GET profile list           -> Private REST API (get_profiles / getUserProfiles)
GET profile metadata       -> Private REST API (content rating, Junior Mode, PIN status)
GET Continue Watching      -> Private REST API (profile activity) or Playwright scrape
```
- Use cached OAuth Bearer tokens (refresh as needed)
- Lightweight, fast, lower detection risk than Playwright
- Run on schedule (every 4-6 hours) for monitoring
- Continue Watching polling for screen time: every 30 minutes when active

### Write Operations (Playwright -- browser required)
```
SET content rating         -> Playwright + account password entry
SET/REMOVE profile PIN     -> Playwright + account password entry
LOCK/UNLOCK profile        -> Playwright (PIN change) + account password entry
CREATE Junior Mode profile -> Playwright + account password entry (if restricted)
TOGGLE autoplay            -> Playwright
TOGGLE Kid-Proof Exit      -> Playwright + account password entry
```
- Requires browser context with stealth mode
- Password gate is simpler than Netflix's MFA (no email/SMS code required)
- Batch writes in single session to minimize browser launches
- Rate limit: max 1 write session per hour

### Screen Time Enforcement (Phosra-managed)
```
1. Parent sets daily limit in Phosra (e.g., 2 hours)
2. Phosra checks Continue Watching every 30 minutes via API/Playwright
3. Detect new activity (new titles appearing in Continue Watching)
4. When limit reached (estimated from activity frequency):
   a. Lock the child's profile (set PIN to Phosra-generated value)
   b. Notify parent via Phosra notification
5. Next day (or at parent's discretion):
   a. Unlock profile (remove PIN or restore original)
   b. Reset daily counter
```

**Critical limitations of this approach:**
- Disney+ Continue Watching has **no timestamps** -- Phosra cannot calculate actual watch time
- No duration data -- Phosra can only detect that content was watched, not for how long
- 30-minute polling means up to 30 min overshoot before lockout
- Locking a profile mid-stream is disruptive
- Screen time enforcement on Disney+ is significantly less precise than on Netflix (which at least has viewing activity with dates)

### Why Playwright for Writes

Disney+ parental control settings (content rating, PIN, Junior Mode, Kid-Proof Exit) are exclusively managed through the web/app UI. No API endpoint -- public or private -- has been discovered for writing parental control settings. Both community reverse-engineering projects (jonbarrow and pam-param-pam) support reads and profile selection but not settings modification.

The password re-entry requirement for all parental control changes means that even if a write endpoint were discovered, it would require the account password as part of the API call, which adds security complexity.

---

## 3. Credential Storage Requirements

Phosra needs to store the following per family connection:

| Credential | Purpose | Sensitivity | Storage Notes |
|---|---|---|---|
| Disney+ email | Login (OAuth flow) | High | Encrypted at rest (AES-256) |
| Disney+ password | Login + settings changes (password gate) | Critical | AES-256, per-user keys, never logged |
| OAuth Bearer token | API reads, profile operations | High | Encrypted, rotate on refresh |
| OAuth Refresh token | Token renewal without re-login | High | Encrypted, long-lived |
| Device grant token | Device registration for API access | Medium | Encrypted, reuse to avoid new registrations |
| Profile IDs | Map Phosra child to Disney+ profile | Low | Can be stored in plain DB |
| Phosra-managed PINs | Screen time enforcement (lock/unlock) | Medium | Encrypted, only stored during active enforcement |

### Security Considerations
- All credentials must be encrypted at rest (AES-256)
- OAuth tokens should be stored encrypted with per-user keys
- Password should never be logged or included in error reports
- Consider using Phosra's vault service for credential management
- Device grant tokens should be reused to minimize device registration events (which could trigger Disney+'s sharing detection)
- MFA codes are NOT required for Disney+ (simpler than Netflix)

---

## 4. OAuth Assessment

**Disney+ does not offer any partner OAuth or third-party API access.**

- No developer portal or API program for streaming functionality (the ADK is for licensed device distributors only)
- No OAuth redirect flow for third-party apps
- No API keys or partner tokens
- The Disney+ Partner Program is affiliate marketing only -- no API access
- All integration requires credential-based authentication via the private OAuth flow

This means:
- Phosra must store user's Disney+ email + password
- User must explicitly consent to credential storage
- Token refresh extends sessions beyond the initial login, but tokens eventually expire
- Higher UX friction vs hypothetical platforms with third-party OAuth
- The private OAuth flow (device grant > token exchange > login) is more standard than Netflix's cookie-based auth, making session management more predictable

### Comparison to Other Platforms

| Platform | Auth Model for Phosra | Credential Storage Required | Session Durability |
|---|---|---|---|
| Disney+ | Private OAuth (Bearer + refresh tokens) | Email + password | Moderate (refresh tokens extend sessions) |
| Netflix | Session cookies (proprietary) | Email + password | ~2 weeks (cookie TTL) |
| YouTube | Google OAuth (public, limited scopes) | OAuth tokens only | Long-lived (Google OAuth) |

Disney+ is marginally better than Netflix for session management due to the standard OAuth token model, but still requires full credential storage.

---

## 5. Adapter Gap Analysis

No existing adapter exists for Disney+. This is a greenfield implementation.

### What Exists (current state)

| Feature | Status |
|---|---|
| Research completed | Complete (this document) |
| Community API clients analyzed | Complete (jonbarrow + pam-param-pam) |
| Production adapter | Missing |
| Research adapter | Missing |

### What's Needed (for production Phosra integration)

| Feature | Status | Priority |
|---|---|---|
| OAuth authentication flow (device grant > token > login) | Missing | P0 |
| Token caching & refresh | Missing | P0 |
| Profile listing via API | Missing | P0 |
| Profile metadata reading via API | Missing | P0 |
| Continue Watching reader (API + Playwright) | Missing | P1 |
| Content rating setter (Playwright + password) | Missing | P1 |
| Profile PIN management (Playwright + password) | Missing | P1 |
| Profile lock/unlock (screen time enforcement) | Missing | P1 |
| Junior Mode profile creator (Playwright) | Missing | P1 |
| Autoplay toggle (Playwright) | Missing | P2 |
| Kid-Proof Exit toggle (Playwright) | Missing | P2 |
| Household detection mitigation | Missing | P1 |
| Stealth mode configuration | Missing | P0 |
| Error recovery & retry logic | Missing | P1 |
| Playwright selector resilience | Missing | P1 |

### Implementation Path
1. Build production adapter in `web/src/lib/platform-adapters/disney_plus/` (new directory)
2. Start with Session Manager using the community API client patterns as reference
3. Implement Read Layer (profile listing, metadata) using REST API
4. Implement Write Layer (content rating, PIN, Junior Mode) using Playwright
5. Add Screen Time Enforcer using Continue Watching monitoring

---

## 6. Platform-Specific Considerations

### Junior Mode Is a Significant Differentiator
Disney+'s Junior Mode is more comprehensive than Netflix's Kids profile:
- Completely simplified interface with only age-appropriate content
- Ads disabled (even on the ad-supported plan)
- Autoplay and Background Video disabled by default
- Kid-Proof Exit prevents young children from leaving the profile
- Content locked to all-ages appropriate (cannot be adjusted)

**Phosra opportunity:** For families with young children (under 7), Junior Mode is the recommended configuration. Phosra should default to recommending Junior Mode for young children and educate parents about its benefits.

### Restrict Profile Creation Is Off By Default
This is a significant security gap. Any person with access to the Disney+ account can create a new standard profile (with unrestricted content access) unless the account holder has manually enabled the Restrict Profile Creation setting.

**Phosra recommendation:** During initial Disney+ connection setup, Phosra should:
1. Check if Restrict Profile Creation is enabled
2. If not, prompt the parent to enable it (or offer to enable it via Playwright)
3. Flag this as a security gap in the parent dashboard

### Paid Sharing Crackdown (September 2024)
Disney+ actively monitors for out-of-household access:
- Device links and internet connections are tracked
- Out-of-household access triggers a verification prompt
- One-time passcode sent to account holder's email for verification

**Phosra implication:** If Phosra's servers access Disney+ from a data center IP, it may trigger the "this TV doesn't seem to be part of the Household" verification flow. Mitigations:
1. Run Playwright from user's own network when possible (browser extension approach)
2. Use residential proxies if server-side access is required
3. Handle the verification passcode flow (would require email access or user intervention)
4. Minimize the frequency of server-side access

### No Per-Title Blocking
Unlike Netflix, Disney+ does not allow blocking specific titles. This is a notable gap:
- A parent cannot block a specific PG-13 movie while allowing other PG-13 content
- The only option is to lower the entire profile's content rating, which removes ALL content above that level
- This makes content restriction a blunt instrument on Disney+

**Phosra recommendation:** Document this limitation clearly in the parent-facing UI. For parents who need per-title control, recommend using content rating tiers as the closest approximation and supplementing with conversation about content choices.

### COPPA Settlement Context
Disney's $10M FTC COPPA settlement (December 2025) creates heightened regulatory sensitivity:
- Disney is under scrutiny for children's privacy practices
- Additional third-party tools accessing child profiles may trigger legal/compliance concerns from Disney
- On the positive side, COPPA/KOSA legislative pressure may eventually motivate Disney to provide legitimate APIs for parental control tools

### Disney+ Content Expansion
Disney+ has evolved significantly from its 2019 launch:
- Originally positioned as a family-friendly platform with no mature content
- Now includes R-rated movies (Deadpool, Logan) and TV-MA series (Daredevil, Punisher, etc.)
- International markets include Star brand with significantly more adult content
- This expansion makes robust parental controls MORE important, creating a larger addressable market for Phosra

---

## 7. API Accessibility Reality Check

**Platform:** Disney+
**API Accessibility Score:** Level 1 -- Unofficial Read-Only
**Phosra Enforcement Level:** Browser-Automated

### What Phosra CAN do:
- Read profile list via unofficial REST API (Bearer token auth)
- Read profile metadata (content rating, Junior Mode status, PIN-enabled flag) via API
- Read Continue Watching data via API / Playwright scrape
- Set content rating per profile via Playwright (password gate, simpler than Netflix MFA)
- Set/remove profile PIN via Playwright (password gate)
- Lock/unlock profile via PIN changes for screen time enforcement via Playwright
- Create Junior Mode profiles via Playwright
- Toggle autoplay settings via Playwright

### What Phosra CANNOT do:
- Block specific titles (platform does not offer this feature)
- Set native screen time limits (feature does not exist)
- Access real-time viewing status (no "currently watching" indicator)
- Get detailed viewing history with timestamps/duration (only Continue Watching without dates)
- Generate detailed watch time reports (insufficient data from platform)
- Send parental notifications natively (Phosra-managed only)

### What Phosra MIGHT be able to do (with risk):
- All Playwright-based write operations carry ToS violation risk
- Household detection may flag Phosra's server-based access
- Device grant registration could be tracked and limited by Disney+
- OAuth token usage patterns could be analyzed by Disney+ for automation detection
- The COPPA settlement context may make Disney more aggressive about enforcement

### Recommendation:
Disney+ is a strong candidate for Phosra integration despite the lack of public APIs. The platform's parental controls are robust and well-designed (Junior Mode, password-gated settings, profile creation restrictions), but they require manual configuration by parents. Phosra's value proposition is centralizing the management of these controls across multiple platforms.

The authentication model is more straightforward than Netflix (standard OAuth tokens vs. proprietary Falcor/MSL), and the write gate is simpler (password-only vs. MFA). However, the paid sharing crackdown presents a unique operational challenge that Netflix's adapter does not face as acutely.

The biggest limitation is the weakness of viewing history data. Disney+ provides dramatically less viewing data than Netflix, which limits Phosra's ability to generate meaningful parent reports and enforce precise screen time limits. Screen time enforcement on Disney+ will be approximate at best.

**Recommended integration priority:** P1 (after Netflix, before smaller platforms). Disney+ is the #2 US streaming platform by subscribers and is used heavily by families with children -- making it a high-value integration despite the API constraints.
