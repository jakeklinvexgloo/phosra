# Max (HBO Max) -- Phosra Integration Notes

**Platform:** Max (HBO Max)
**Assessment Date:** 2026-03-01
**Integration Priority:** Tier 1 (research complete, adapter needed)
**Recommended Approach:** Hybrid (REST API reads + Playwright writes)

---

## 1. Phosra Rule Category Coverage

Of Phosra's 45 enforcement rule categories, Max can enforce the following:

### Fully Enforceable (via existing Max features)

| Rule Category | Max Feature | Enforcement Method |
|---|---|---|
| `content_rating_filter` | Per-profile maturity tier (4 levels: Little Kids, Big Kids, Pre-teens, Teens) | API read / Playwright write |
| `profile_lock` | Profile PIN (Adult profiles) + Kid-Proof Exit (Kids profiles) | Playwright |
| `parental_consent_gate` | Password required for parental control changes; Parent Code for Kid-Proof Exit | Built-in (no Phosra action needed) |
| `age_gate` | Maturity tier acts as age gate; Kids Mode locked if birthdate < 18 | Playwright write |
| `autoplay_control` | Autoplay next episode / previews / recommended toggle (3 settings) | Playwright |
| `kids_profile` | Dedicated Kids Mode with restricted UI, character-based navigation, content filtering | Playwright write |

### Partially Enforceable (Phosra-managed workaround)

| Rule Category | Gap | Phosra Workaround |
|---|---|---|
| `screen_time_limit` | No native support (or very limited, unconfirmed) | Toggle Kid-Proof Exit or change Parent Code to lock profile when limit reached. Poor accuracy due to lack of viewing duration data |
| `screen_time_report` | No usage dashboard, no viewing history | Poll Continue Watching section; build approximate activity log. Reports will be incomplete (no duration, no timestamps, completed titles missed) |
| `bedtime_schedule` | No native support | Lock/unlock Kids profile on schedule via cron-triggered Playwright (Kid-Proof Exit toggle or Parent Code change) |
| `parental_event_notification` | No native alerts | Phosra monitors Continue Watching for new/unexpected titles and sends parent notifications. Very limited fidelity compared to Netflix |
| `viewing_history_access` | Only Continue Watching available (no historical log, no timestamps, no duration) | Poll Continue Watching; maintain Phosra-side viewing log. Significant data gaps |

### Not Enforceable on Max

| Rule Category | Reason |
|---|---|
| `title_restriction` | **Max does not offer per-title blocking.** Content filtering is maturity-tier-based only. This is a significant gap vs. Netflix |
| `purchase_control` | Max is subscription-only; no in-app purchases to control |
| `social_control` | Max has no social features (no messaging, comments, friends, sharing) |
| `location_tracking` | Not applicable to streaming |
| `web_filtering` | Not applicable (content is curated, not user-generated) |
| `safe_search` | Not applicable |
| `app_control` | Not applicable (Max is one app, not an app store) |
| `custom_blocklist` / `custom_allowlist` | No per-title control mechanism exists |
| `commercial_data_ban` | Not controllable from consumer side |
| `algorithmic_audit` | Not controllable from consumer side |

---

## 2. Enforcement Strategy

### Read Operations (REST API -- no browser needed)
```
GET profile list            -> comet.api.hbo.com (profile endpoint, TBD)
GET profile settings        -> comet.api.hbo.com (profile settings, TBD)
GET Continue Watching       -> comet.api.hbo.com/content (Continue Watching section)
```
- Use cached session tokens (TTL to be determined via live testing)
- Lightweight, fast, lower detection risk than browser automation
- Run on schedule: profile settings every 4-6 hours, Continue Watching every 15-30 minutes
- REST architecture is more standard than Netflix's Falcor -- easier to discover and maintain

### Write Operations (Playwright -- browser required)
```
SET maturity level          -> Playwright + account password
SET/REMOVE Profile PIN      -> Playwright + account password
SET/CHANGE Parent Code      -> Playwright + account password
TOGGLE Kid-Proof Exit       -> Playwright + Parent Code
CREATE Kids profile         -> Playwright (no auth required -- security gap)
TOGGLE autoplay settings    -> Playwright
```
- Requires browser context with stealth mode
- **No MFA** -- Max uses password-only gate for settings changes (simpler than Netflix)
- Password sharing detection is the primary risk: use residential proxy or user's home network
- Batch writes in single session to minimize browser launches
- Rate limit: max 1 write session per hour
- **Email notifications:** PIN changes trigger email to account owner

### Screen Time Enforcement (Phosra-managed)
```
1. Parent sets daily limit in Phosra (e.g., 2 hours)
2. Phosra checks Continue Watching every 15-30 minutes via REST API
3. Track changes to Continue Watching:
   - New titles appearing -> child started watching something new
   - Progress changes -> child is actively watching
   - Titles disappearing -> completed or manually removed
4. When estimated watch time exceeds limit:
   a. Toggle Kid-Proof Exit ON (if not already on)
   b. Change Parent Code to Phosra-generated value
   c. Notify parent via Phosra notification
5. Next day (or at parent's discretion):
   a. Restore original Parent Code
   b. Reset daily counter
```

**Severe limitations of this approach:**
- **No viewing duration data.** Max does not expose how long a child watched. Phosra must estimate based on Continue Watching changes, which is highly imprecise
- **Completed titles vanish.** Once a movie ends, it leaves Continue Watching. Phosra will miss it unless polled at the right moment
- **Child can clear Continue Watching.** A child can manually remove items from Continue Watching to hide activity
- **15-30 minute polling means significant overshoot.** A child could watch for 30+ minutes beyond the limit before detection
- **Parent Code change affects all Kids profiles.** Since Parent Code is account-wide, locking one child locks all children

### Why Playwright for Writes
- Max does not expose write endpoints in its internal API (or they have not been discovered)
- Password gate on settings changes prevents direct API writes even if endpoints were discovered
- CAPTCHA system may block automated API requests
- Playwright provides the most reliable path for form submission, password entry, and multi-step settings flows
- **Advantage over Netflix:** No MFA (email/SMS codes) -- only password re-entry required, which is automatable

---

## 3. Credential Storage Requirements

Phosra needs to store the following per family connection:

| Credential | Purpose | Sensitivity | Storage Notes |
|---|---|---|---|
| Max email | Login | High | Encrypted at rest (AES-256) |
| Max password | Login + settings changes | Critical | AES-256, per-user keys, never logged |
| Session tokens | API reads | High | Rotate on schedule (TTL TBD). Token-based auth (not cookies) |
| Profile identifiers | Map Phosra child to Max profile | Low | Can be stored in plain DB |
| Parent Code | Kid-Proof Exit management, screen time enforcement | High | Encrypted. Phosra must store both original and Phosra-generated values |
| Profile PINs | Adult profile lock management | High | Encrypted. Store original for restoration |

### Security Considerations
- All credentials must be encrypted at rest (AES-256)
- Session tokens should be stored encrypted with per-user keys
- Password should never be logged or included in error reports
- Parent Code and Profile PINs need special handling: Phosra must maintain both the user's original values and any Phosra-generated replacement values
- PIN changes trigger email notifications to the account email -- this is visible to the user and cannot be suppressed
- Consider using Phosra's vault service for credential management

---

## 4. OAuth Assessment

**Max does not offer any partner OAuth or third-party API access.**

- No developer portal or API program
- No OAuth redirect flow
- No API keys or partner tokens
- All integration requires credential-based authentication
- No known plans to introduce OAuth or third-party access

This means:
- Phosra must store user's Max email + password
- User must explicitly consent to credential storage
- Re-authentication needed when session tokens expire (frequency TBD)
- Higher UX friction vs platforms with OAuth (e.g., YouTube, Apple TV+)
- **Password sharing crackdown adds risk:** Phosra's server-based access may trigger household enforcement, requiring residential proxy infrastructure or on-device agent architecture

### Comparison to OAuth-capable platforms
| Platform | Auth Method | UX Friction | Risk |
|---|---|---|---|
| YouTube (Google) | OAuth with scopes | Low (one-click consent) | Low (authorized) |
| Max | Credential storage | High (password entry + consent) | High (ToS violation + sharing detection) |
| Netflix | Credential storage | High (same as Max) | High (same, but no sharing enforcement yet as aggressive) |

---

## 5. Adapter Gap Analysis

No Max adapter currently exists in the Phosra codebase. This section defines what needs to be built.

### What Exists (current state)

| Feature | Status |
|---|---|
| Max adapter | **Does not exist** |
| REST API endpoint catalog | Partial (community research, likely outdated) |
| Authentication flow | Research-only (from reverse engineering blog) |
| Profile management | Not implemented |
| Parental controls | Not implemented |
| Viewing monitoring | Not implemented |

### What's Needed (for production Phosra integration)

| Feature | Status | Priority |
|---|---|---|
| REST API endpoint discovery (live) | Missing | P0 |
| Session Manager (token auth + CAPTCHA fallback) | Missing | P0 |
| Profile reader (REST API) | Missing | P0 |
| Profile settings reader (REST API) | Missing | P0 |
| Maturity tier setter (Playwright) | Missing | P1 |
| Parent Code manager (Playwright) | Missing | P1 |
| Profile PIN manager (Playwright) | Missing | P1 |
| Kid-Proof Exit toggle (Playwright) | Missing | P1 |
| Continue Watching poller (REST API or Playwright) | Missing | P1 |
| Kids profile creator (Playwright) | Missing | P2 |
| Autoplay toggle (Playwright) | Missing | P2 |
| Screen time enforcer (Kid-Proof Exit + polling) | Missing | P2 |
| Error recovery & retry logic | Missing | P1 |
| Stealth mode configuration | Missing | P0 |
| CAPTCHA detection & handling | Missing | P0 |
| Residential proxy integration | Missing | P1 |

### Development Path
1. **Phase 0 (Foundation):** Live API endpoint discovery via HAR recording on play.hbomax.com. Identify current endpoint paths, request/response formats, and authentication flow. This is critical because community research may be outdated
2. **Phase 1 (Read Layer):** Build REST API read layer -- profile listing, settings reading, Continue Watching polling
3. **Phase 2 (Write Layer):** Build Playwright write layer -- maturity settings, PIN management, profile creation
4. **Phase 3 (Enforcement):** Build screen time enforcement via Kid-Proof Exit toggling and Continue Watching monitoring
5. **Phase 4 (Hardening):** CAPTCHA handling, residential proxy integration, error recovery, stealth mode tuning

---

## 6. Platform-Specific Considerations

### The Rebrand Instability Problem
Max has undergone two major rebrands in 3 years:
- **HBO Max** (May 2020 - May 2023): Original launch
- **Max** (May 2023 - July 2025): Dropped "HBO" branding, added Discovery content, redesigned UI
- **HBO Max** (July 2025 - present): Reverted to HBO branding, shifted away from kids/family content toward premium adult content

Each rebrand changes:
- Domain URLs (play.max.com vs play.hbomax.com)
- Help center URLs (help.max.com redirects to help.hbomax.com)
- UI layout and DOM structure
- Potentially API endpoint paths

**Phosra impact:** Adapter maintenance burden is higher than Netflix. Budget for quarterly review and potential rebuild around rebrand events.

### The Kids Content Exodus
Warner Bros. Discovery's 2025 strategy shift actively reduces kids content:
- Dozens of Cartoon Network shows removed in January and August 2025
- HBO Family channel shut down August 15, 2025
- Only 11 Cartoon Network shows remain on the platform
- Sesame Street licensed through 2027 but new episodes deal not renewed
- Studio Ghibli films and DC animated content remain but catalog is shrinking

**Phosra impact:** Max's value proposition for kids content is weakening. Parents may have less reason to set up Kids profiles on Max vs. Disney+ or Netflix. However, HBO's heavily adult content library (Game of Thrones, Euphoria, Succession, The Last of Us) makes parental controls MORE critical -- the risk of accidental exposure to mature content is high.

### Unprotected Profile Creation (Security Gap)
Like Peacock, Max does not require authentication (password or PIN) to create a new profile. A child who knows how to navigate to Manage Profiles can:
1. Create a new Adult profile (Kids Mode off)
2. Access all content including R and TV-MA rated titles
3. Bypass all parental controls

**Phosra should:**
- Flag this gap to parents during onboarding
- Monitor for new profile creation via periodic profile list polling
- Alert parents when new profiles appear on the account
- Recommend parents lock all Adult profiles with Profile PINs

### Password Sharing Crackdown (Critical for Phosra)
Max's password sharing enforcement (September 2025 onward) is the most significant risk unique to this platform:
- IP address monitoring: Phosra's data center IPs will be detected as outside the household
- Device ID tracking: Headless browsers generate new device IDs that may trigger alerts
- User activity patterns: Automated access patterns differ from human usage
- Escalating enforcement: Started with soft messaging, becoming "more assertive" per WBD executives
- Extra Member add-on ($7.99/month): The sanctioned alternative to password sharing

**Mitigation options:**
1. **Residential proxy:** Route Phosra traffic through a residential IP (adds cost and latency)
2. **On-device agent:** Run Phosra automation on the user's home network device (higher setup complexity)
3. **API-only approach:** Minimize browser automation; REST API calls may be less detectable than full browser sessions
4. **Transparent disclosure:** Inform Max that access is from a parental control tool (no framework for this exists)

### Dual PIN System Complexity
Unlike Netflix (one PIN system) or Peacock (one PIN system), Max has TWO distinct PIN mechanisms:
1. **Parent Code** -- Account-wide, used for Kid-Proof Exit. Applies to all Kids profiles equally
2. **Profile PIN** -- Per-Adult-profile, used for profile access locking

Phosra must manage both, and they serve different purposes:
- Parent Code is the primary tool for locking children INTO their Kids profiles
- Profile PIN is the tool for locking children OUT of Adult profiles
- Both should be configured for comprehensive protection

---

## 7. API Accessibility Reality Check

**Platform:** Max (HBO Max)
**API Accessibility Score:** Level 1 -- Unofficial Read-Only
**Phosra Enforcement Level:** Browser-Automated (with REST API reads where possible)

### What Phosra CAN do:
- Read profile list and settings via REST API (unofficial, with session token)
- Read Continue Watching section for approximate viewing monitoring
- Set maturity tier per Kids profile via Playwright (password gate, no MFA)
- Enable/disable Kid-Proof Exit via Playwright
- Set/change Profile PINs on Adult profiles via Playwright (password gate)
- Set/change Parent Code via Playwright (password gate)
- Create new Kids profiles via Playwright (no auth required)
- Toggle autoplay settings via Playwright

### What Phosra CANNOT do:
- Block specific titles (feature does not exist on Max)
- Access viewing history (Max has no viewing history feature; Continue Watching is the only proxy and is severely limited)
- Set native screen time limits (feature does not exist)
- Send platform-native parental notifications (feature does not exist)
- Get real-time viewing status (no API or UI indicator)
- Export viewing data (no export capability)
- Lock one child's profile without affecting all children (Parent Code is account-wide)

### What Phosra MIGHT be able to do (with risk):
- Authenticate via REST API `/tokens` endpoint (may be blocked by CAPTCHA)
- Poll Continue Watching frequently to approximate viewing monitoring (low fidelity, ToS violation)
- Maintain persistent sessions to avoid re-authentication (may trigger sharing detection)
- Run write automation from data center IPs (may trigger household enforcement)

### Recommendation:

Max presents a **moderate integration opportunity** for Phosra with significant limitations. The REST API architecture is more approachable than Netflix's Falcor, and the absence of MFA on settings changes simplifies the write layer. However, Max's integration value is diminished by three critical factors:

1. **No viewing history.** Phosra's parental monitoring capabilities will be severely limited. Parents cannot get meaningful viewing reports for their children's Max activity. This is the single biggest gap.

2. **No per-title blocking.** Tier-based filtering is a blunt instrument. A parent who wants to allow most PG content but block a specific PG-rated show cannot do so.

3. **Password sharing enforcement.** Max's active IP/device monitoring as of September 2025 creates a real risk of account disruption from Phosra's server-based access. This may require residential proxy infrastructure or an on-device agent architecture, both of which add significant complexity and cost.

The recommended strategy is to prioritize Max for **control operations** (maturity tier management, PIN management, Kid-Proof Exit enforcement) rather than monitoring operations, and to be transparent with parents about the monitoring limitations. Device-level controls (iOS Screen Time, Android Digital Wellbeing, router schedules) should be recommended as supplements for screen time management and content-level monitoring.
