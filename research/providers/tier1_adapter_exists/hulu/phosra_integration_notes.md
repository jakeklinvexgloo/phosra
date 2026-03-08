# Hulu -- Phosra Integration Notes

**Platform:** Hulu
**Assessment Date:** 2026-03-01
**Integration Priority:** Tier 1 (adapter assessment; limited lifespan due to Disney+ migration)
**Recommended Approach:** Playwright-only (no known API surface)

---

## 1. Phosra Rule Category Coverage

Of Phosra's 45 enforcement rule categories, Hulu can enforce the following:

### Fully Enforceable (via existing Hulu features)

| Rule Category | Hulu Feature | Enforcement Method |
|---|---|---|
| `profile_lock` | Account-wide 4-digit PIN | Playwright (toggle + password re-entry) |
| `parental_consent_gate` | PIN required for non-Kids profile access and creation | Built-in (when PIN enabled) |
| `kids_profile` | Kids profile with restricted UI and content | Playwright (create Kids profile) |
| `autoplay_control` | Autoplay next episode toggle (per-profile, per-device) | Playwright |
| `viewing_history_access` | Per-profile watch history (limited data) | Playwright scrape |

### Partially Enforceable (Phosra-managed workaround)

| Rule Category | Gap | Phosra Workaround |
|---|---|---|
| `content_rating_filter` | Binary Kids/Standard model -- no configurable maturity slider | Phosra can create/delete Kids profiles to toggle restriction level. For finer control, recommend migration to Disney+ (7-level maturity). |
| `age_gate` | Birthdate-based restriction, not configurable by parent | Phosra documents the gap and recommends parents set correct birthdate at profile creation. Cannot override programmatically. |
| `screen_time_limit` | No native support; no timestamps in watch history | Phosra defers to device-level controls (iOS Screen Time, router schedules). Cannot implement time-based enforcement via Hulu directly due to lack of timestamp data. |
| `screen_time_report` | No usage dashboard; no timestamp data | Phosra can report titles watched but cannot calculate duration or timing. Partial reports only. |
| `bedtime_schedule` | No native support | Phosra can toggle PIN protection on schedule (lock all non-Kids profiles at bedtime, unlock in morning). Blunt instrument -- affects all profiles. |
| `parental_event_notification` | No native alerts | Phosra polls watch history and notifies parents of new titles watched. No real-time alerting possible. No content flagging (no descriptors available). |

### Not Enforceable on Hulu

| Rule Category | Reason |
|---|---|
| `title_restriction` | Hulu does not offer per-title blocking of any kind |
| `content_rating_filter` (granular) | Cannot set intermediate maturity levels (e.g., PG-13 but not R) -- binary Kids/Standard only |
| `purchase_control` | Hulu is subscription-only; no in-app purchases |
| `social_control` | Hulu has no social features |
| `location_tracking` | Not applicable to streaming |
| `web_filtering` | Not applicable (curated content, not user-generated) |
| `safe_search` | Not applicable |
| `app_control` | Not applicable |
| `custom_blocklist` / `custom_allowlist` | No per-title blocking exists |
| `commercial_data_ban` | Not controllable from consumer side |
| `algorithmic_audit` | Not controllable from consumer side |

---

## 2. Enforcement Strategy

### Read Operations (Playwright -- no API alternative)
```
SCRAPE profile list       -> Manage Profiles / "Who's Watching" page
SCRAPE profile settings   -> Profile edit page + Parental Controls page
SCRAPE viewing history    -> Profile > History page
READ PIN status           -> Parental Controls > PIN Protection toggle state
```
- All reads require Playwright browser context with valid session cookies
- No known REST/GraphQL API for read operations (unlike Netflix's Falcor)
- Run on schedule: every 4-6 hours for history monitoring
- Investigate internal REST endpoints via HAR capture to potentially reduce browser dependency

### Write Operations (Playwright -- browser required)
```
TOGGLE PIN protection     -> Parental Controls page + password re-entry
SET PIN value             -> Parental Controls page + 4-digit entry
CREATE Kids profile       -> Add Profile flow + Kids toggle
DELETE profile            -> Manage Profiles > Remove
TOGGLE autoplay           -> Account > Playback Settings per profile
```
- All writes require Playwright browser context
- No MFA gate (simpler than Netflix), but password re-entry needed for PIN changes
- Account-wide PIN means any PIN change affects all non-Kids profiles
- Rate limit: max 1 write session per hour

### Screen Time Enforcement (Phosra-managed)

**Hulu's screen time enforcement is severely limited compared to Netflix:**

```
1. Parent sets daily limit in Phosra (e.g., 2 hours)
2. Phosra CANNOT effectively enforce this on Hulu because:
   a. Watch history has no timestamps (cannot calculate when viewing occurred)
   b. Watch history has no duration (cannot calculate how long child watched)
   c. Account-wide PIN toggle is the only lock mechanism
3. Best available approach:
   a. Schedule-based PIN enforcement (e.g., enable PIN at 8pm, disable at 3pm)
   b. This blocks ALL non-Kids profiles, not just the child's
   c. Supplement with device-level controls (iOS Screen Time, router)
4. Phosra should prominently recommend device-level controls for Hulu
```

**Comparison to Netflix screen time strategy:**
| Aspect | Netflix | Hulu |
|---|---|---|
| Watch history timestamps | Yes (date available) | No |
| Watch duration data | No | No |
| Per-profile PIN lock | Yes | No (account-wide) |
| Feasibility of Phosra enforcement | Partial (poll + lock) | Very limited (schedule-based only) |

### Why Playwright for Everything

Unlike Netflix (which has documented Falcor/Shakti internal APIs enabling API-based reads), Hulu's internal API surface is:
- Undocumented by the community
- Not reverse-engineered in any public forum
- Transitioning to Disney+ backend (unstable target)
- Less studied than any other major streaming platform

This means Phosra must use Playwright for ALL operations -- reads and writes. This is the least efficient and most fragile integration pattern. It is recommended to invest engineering time in HAR capture analysis to discover internal REST endpoints that could enable API-based reads, reducing Playwright dependency.

---

## 3. Credential Storage Requirements

Phosra needs to store the following per family connection:

| Credential | Purpose | Sensitivity | Storage Notes |
|---|---|---|---|
| Hulu email | Login | High | Encrypted at rest (AES-256) |
| Hulu password | Login + PIN changes | Critical | AES-256, per-user keys, never logged |
| Session cookies | Browser context reuse | High | Rotate on schedule; exact TTL unknown |
| Profile names/IDs | Map Phosra child to Hulu profile | Low | Can be stored in plain DB |
| Account PIN | PIN management (if Phosra manages PIN) | High | Encrypted at rest |

### Security Considerations
- All credentials must be encrypted at rest (AES-256)
- Password should never be logged or included in error reports
- Hulu does not offer 2FA/MFA, so password is the single point of authentication failure
- Household sharing detection may flag credential use from Phosra servers -- consider residential proxy or user-side automation
- Session cookie TTL is unknown -- more aggressive session refresh may be needed than Netflix

---

## 4. OAuth Assessment

**Hulu does not offer any partner OAuth or third-party API access.**

- No developer portal or API program has ever existed
- No OAuth redirect flow
- No API keys or partner tokens
- No delegated access mechanism of any kind
- All integration requires direct credential-based authentication

This means:
- Phosra must store user's Hulu email + password
- User must explicitly consent to credential storage
- Re-authentication needed when sessions expire (frequency unknown, likely every few days to weeks)
- Higher UX friction vs platforms with OAuth
- **Hulu is identical to Netflix in this regard** -- neither offers OAuth for third-party parental control access

Comparison to platforms with better OAuth support:
| Platform | OAuth Available | Third-Party Access |
|---|---|---|
| YouTube (Google) | Yes (Google OAuth) | Family Link API |
| Apple TV+ | Yes (Sign in with Apple) | Limited |
| Netflix | No | None |
| **Hulu** | **No** | **None** |
| Peacock | No | None |

---

## 5. Adapter Gap Analysis

### What Exists (current state)
There is **no existing Hulu adapter** in the Phosra codebase. This is a greenfield development.

| Feature | Status |
|---|---|
| Login flow | Missing |
| Profile listing | Missing |
| Profile settings read | Missing |
| Parental controls read | Missing |
| Watch history read | Missing |
| PIN management | Missing |
| Kids profile creation | Missing |
| Autoplay toggle | Missing |
| Content restrictions | N/A (feature does not exist on Hulu) |
| Title blocking | N/A (feature does not exist on Hulu) |

### What's Needed (for production Phosra integration)

| Feature | Status | Priority | Notes |
|---|---|---|---|
| Session Manager (login + cookies) | Missing | P0 | Foundation for all other operations |
| Profile listing (Playwright) | Missing | P0 | Core read operation |
| PIN management | Missing | P1 | Primary enforcement mechanism |
| Watch history reader | Missing | P1 | Limited value without timestamps |
| Kids profile creator | Missing | P1 | Key family setup operation |
| Profile settings reader | Missing | P1 | Limited data available |
| Autoplay toggle | Missing | P2 | Per-device complication |
| Internal REST API investigation | Missing | P1 | HAR capture to find API endpoints for reads |
| Disney+ migration planning | Missing | P0 | Must plan for Hulu app shutdown |
| Error recovery & retry logic | Missing | P1 | Standard adapter resilience |
| Stealth mode configuration | Missing | P0 | Essential for household detection avoidance |

### Recommended Development Path
1. **Phase 0 (Now):** Evaluate whether to build Hulu adapter at all, given Disney+ migration timeline
2. **Phase 1 (If proceeding):** Session Manager + Profile reads + PIN management (5-6 days)
3. **Phase 2:** Watch history + Kids profile creation (3-4 days)
4. **Phase 3:** Disney+ adapter development (separate effort, higher priority long-term)

---

## 6. Platform-Specific Considerations

### Hulu's Historically Weak Parental Controls

Hulu was the **last major streaming platform** to add parental controls. For years, it offered no Kids profiles, no PIN protection, and no content filtering. Controls were added in late 2022/early 2023 under competitive pressure from Netflix, Disney+, and regulatory scrutiny. As a result:

- The controls feel bolted-on rather than designed from the ground up
- The binary Kids/Standard model is far less granular than competitors
- No per-title blocking (Netflix has had this for years)
- No configurable maturity slider (Disney+ has 7 levels)
- No content descriptor filtering (no ability to filter by violence, language, etc.)
- Account-wide PIN (not per-profile) creates a single point of failure

### Advertising Content Gap (Ad-Supported Plans)

This is a unique and significant concern for Hulu that does not apply to Netflix, Disney+, or Apple TV+:

- On ad-supported plans ($11.99/mo and $89.99/mo Live TV), advertisements are **not filtered by profile maturity**
- A child watching a TV-PG show can see an ad trailer for a TV-MA horror movie or adult drama
- These ads cannot be immediately skipped
- Parents on ad-supported plans should be warned that parental controls do not extend to advertising content
- **Phosra recommendation:** Advise families with young children to consider the ad-free tier or supplement with device-level ad blocking

### FX on Hulu Content

FX on Hulu is a major source of mature content (TV-MA):
- Includes shows like American Horror Story, The Bear, Shogun, What We Do in the Shadows
- All FX content is automatically blocked on Kids profiles and under-17 standard profiles
- However, there is no way to allow some FX shows while blocking others
- This is a consequence of the binary maturity model

### Hulu + Live TV Complications

- Kids profiles **block access to Live TV entirely** -- this is actually a good safety measure but may frustrate families who want kids to watch live sports or news
- Standard profiles with Live TV have **no content filtering on live broadcasts** -- a 15-year-old standard profile can watch any live channel
- DVR recordings inherit the channel's content, with no additional filtering
- Live TV adds 95+ channels of unfiltered content that Phosra cannot control

### Premium Add-On Channels

- STARZ, Max (HBO), and other add-ons follow the same profile-level restrictions
- Kids profiles cannot access add-on content
- No separate parental controls exist for add-on channels
- Parents cannot, for example, allow Max but block STARZ on a specific profile

### Disney+ Bundle Profile Interaction

- Hulu + Live TV plans automatically include Disney+ and ESPN Select
- Profiles are **NOT shared** between Hulu and Disney+ -- each service has independent profile management
- Parental controls are managed separately on each platform
- A child restricted on Hulu could have different restrictions on Disney+ (or vice versa)
- **Phosra opportunity:** Unified cross-platform parental control management across Hulu + Disney+ profiles

### Hulu App Phaseout Timeline

- **2024 (Spring):** "Hulu on Disney+" launched for bundle subscribers
- **2024 (August):** Disney announced Hulu app phaseout
- **2025 (October):** All Hulu catalog available on Disney+
- **2026 (February):** Hulu app shutting down on Nintendo Switch
- **2026 (TBD):** Hulu standalone app fully discontinued; Hulu exists only as a brand within Disney+
- **Impact on Phosra:** Any Hulu-specific adapter has months of useful life remaining. Disney+ adapter is the correct long-term investment.

---

## 7. API Accessibility Reality Check

**Platform:** Hulu
**API Accessibility Score:** Level 0 -- Walled Garden
**Phosra Enforcement Level:** Browser-Automated (with significant limitations)

### What Phosra CAN do:
- Read profile list via Playwright scraping
- Read basic profile settings (Kids/Standard, autoplay) via Playwright
- Read watch history (titles only, no timestamps) via Playwright
- Toggle account-wide PIN protection via Playwright + password
- Create Kids profiles via Playwright
- Toggle autoplay per profile via Playwright

### What Phosra CANNOT do:
- Set configurable maturity levels (feature does not exist -- binary model only)
- Block specific titles (feature does not exist)
- Enforce screen time limits (no timestamp data, account-wide PIN only)
- Filter advertising content (ads bypass maturity restrictions)
- Control Live TV channel access (binary Kids block or full access)
- Receive real-time viewing alerts (no mechanism exists)
- Access any API directly (no public or documented internal API)
- Monitor viewing duration (no duration data available)

### What Phosra MIGHT be able to do (with risk):
- Discover internal REST endpoints via HAR analysis for more reliable reads
- Schedule-based PIN enforcement (enable/disable PIN on a clock) for crude bedtime enforcement
- Monitor watch history changes to detect new viewing activity (poll-based, no real-time)
- Create/delete profiles to toggle between Kids and Standard mode as a crude maturity switch

### Recommendation:

Hulu represents one of the **least favorable integration targets** among major streaming platforms for Phosra:

1. **Weakest native parental controls** of any major platform (binary Kids/Standard, no title blocking, no configurable maturity, no screen time)
2. **No API access** -- even worse than Netflix, which has well-studied internal APIs enabling read operations without Playwright
3. **Limited lifespan** -- the Hulu standalone app is shutting down in 2026
4. **Household detection** -- active password sharing crackdown adds risk that other platforms do not have

**The recommended strategy is:**

- **Short term (now):** Document Hulu's limitations prominently for Phosra families. Recommend device-level controls for Hulu. Recommend ad-free plan to avoid advertising content gap.
- **Medium term (2026):** Invest engineering effort in a Disney+ adapter rather than a standalone Hulu adapter. Disney+ will absorb all Hulu content and has significantly better parental controls (7-level maturity, Junior Mode, content descriptors).
- **If a Hulu adapter is built:** Minimize scope to P0 items only (session management, profile reads, PIN toggle). Accept the limited lifespan and plan for migration to Disney+ adapter.
