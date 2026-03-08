# Disney+ Adapter Assessment for Phosra

**Platform:** Disney+
**Assessment Date:** 2026-03-01
**Existing Adapter:** None (new platform)
**Recommended Approach:** Hybrid (Unofficial REST API for reads, Playwright for writes)

---

## API Accessibility Context

**Before evaluating individual adapter methods, it is critical to understand the API landscape reality:**

Disney+ has never offered a public API. There is no developer portal, no partner program for parental control apps, no OAuth flow, and no delegated access mechanism. However, unlike Netflix's complex Falcor protocol, Disney+ uses a more conventional REST API with OAuth 2.0 Bearer tokens, which has been successfully reverse-engineered by two independent community projects (jonbarrow/disneyplus-client in Node.js, pam-param-pam/Disney-Plus-api-wrapper in Python).

### What This Means for Each Method

| Access Pattern | API Accessibility | Stability | ToS Status |
|---|---|---|---|
| **Read via private REST API** | Unofficial internal API, OAuth Bearer token auth | Moderate -- more conventional than Netflix Falcor, two independent implementations exist | Violation of Section 2.B.x (automated means, scraping) |
| **Write via Playwright** | No API exists for parental control writes -- browser automation required | Breaks whenever Disney+ changes UI/DOM structure | Violation of Section 2.B.x (robots, automated means) |
| **Authentication** | Private OAuth flow reverse-engineered (device grant > token exchange > login) | Moderate -- OAuth is a standard protocol; changes are less frequent than custom auth systems | Violation of Section 2.B.v (reverse engineering) |

### Industry Benchmark

No parental control app (Bark, Qustodio, Net Nanny, Mobicip, Apple Screen Time, Google Family Link) integrates with Disney+ APIs. All operate at the device/OS level only (app blocking, time limits). Phosra's proposed approach of direct Disney+ integration would be **unprecedented**.

### Unofficial API Details

- **jonbarrow/disneyplus-client (Node.js):** Reverse-engineered from iOS app. Supports device grants, OAuth token exchange, login, and profile listing. Development appears low-activity.
- **pam-param-pam/Disney-Plus-api-wrapper (Python, PyPI: `pydisney`):** More feature-rich. Supports auth with token caching, profile management (list, select, PIN-protected access), content search, metadata retrieval. Actively maintained.
- **Authentication flow:** Device Grant Token > OAuth Token Exchange > Email/Password Login. Disney+ requires an OAuth token even before login, creating a two-step authentication process.
- **Key advantage over Netflix:** Disney+ uses standard OAuth 2.0 Bearer tokens rather than Netflix's proprietary Falcor/MSL token system. This makes the auth layer more predictable and maintainable.

---

## Adapter Method Assessment

### 1. `authenticate(credentials) -> Session`

| Aspect | Detail |
|---|---|
| **Implementation** | Unofficial REST API (preferred) with Playwright fallback |
| **API Accessibility Verdict** | Level 1 -- Unofficial API exists and has been independently validated by two community projects |
| **Approach** | Use the reverse-engineered authentication flow: (1) Request device grant token with API key, (2) Exchange device grant for OAuth token, (3) Authenticate with email/password to get Bearer token + refresh token. Cache tokens for reuse. |
| **API Alternative** | Primary approach IS the API. Playwright fallback: navigate to disneyplus.com/login, fill email + password, extract session tokens from network traffic. |
| **Auth Required** | Email + password (credential-based, no third-party OAuth available) |
| **Data Available** | OAuth Bearer token, refresh token, account metadata |
| **Data NOT Available** | Token expiration details (must be determined empirically) |
| **Complexity** | Medium -- three-step OAuth flow, but well-documented by community projects |
| **Risk Level** | Medium -- login automation is detectable; device grant registration may be tracked |
| **Recommendation** | Use the unofficial REST API authentication flow. Cache Bearer + refresh tokens aggressively. Implement token refresh to minimize re-authentication frequency. Fall back to Playwright only if API auth is blocked. |

### 2. `listProfiles() -> Profile[]`

| Aspect | Detail |
|---|---|
| **Implementation** | Unofficial REST API |
| **API Accessibility Verdict** | Level 1 -- Both community clients implement `getUserProfiles()` / `get_profiles()` successfully |
| **Approach** | Call the profile listing endpoint with Bearer token. Parse response for profile name, ID, avatar, content rating, Junior Mode status, PIN-enabled flag. |
| **API Alternative** | Playwright fallback: navigate to profile picker page and scrape profile cards. |
| **Auth Required** | OAuth Bearer token only (no additional auth for profile listing) |
| **Data Available** | Profile name, profile ID, avatar URL, content rating level, isKids/Junior Mode flag, language |
| **Data NOT Available** | Profile PIN value (only whether PIN is enabled), detailed parental control settings |
| **Complexity** | Low |
| **Risk Level** | Low -- read-only API call |
| **Recommendation** | Use unofficial REST API directly with cached Bearer token. This is the highest-confidence API method available. |

### 3. `getProfileSettings(profileId) -> Settings`

| Aspect | Detail |
|---|---|
| **Implementation** | Unofficial REST API (partial) + Playwright (full settings) |
| **API Accessibility Verdict** | Level 1 -- Profile metadata readable via API; detailed parental control settings may require browser |
| **Approach** | Use API to get profile-level metadata (content rating, Junior Mode, PIN status). For full settings (autoplay toggles, Kid-Proof Exit status), use Playwright to navigate to Edit Profiles > [Profile] and extract settings from the DOM. |
| **API Alternative** | API provides partial data; Playwright needed for complete settings readout |
| **Auth Required** | Bearer token for API reads; session for Playwright |
| **Data Available** | Content rating level, Junior Mode status, PIN-enabled flag (via API). Autoplay settings, Kid-Proof Exit status, profile creation restriction status (via Playwright). |
| **Data NOT Available** | PIN value itself, internal profile configuration details |
| **Complexity** | Medium (hybrid approach) |
| **Risk Level** | Low -- primarily read operations |
| **Recommendation** | Use API for basic profile metadata. Supplement with Playwright scrape for full settings only when needed (e.g., initial setup audit, periodic verification). |

### 4. `setContentRestrictions(profileId, maturityLevel)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (required) |
| **API Accessibility Verdict** | Level 0 -- No write endpoint exists for content rating changes, even in the unofficial API surface |
| **Approach** | Navigate to Edit Profiles > select profile > Content Rating. Enter account password when prompted. Select the desired rating level from the available options (TV-Y through TV-MA). Save changes. |
| **API Alternative** | None known. Neither community API client exposes a content rating write endpoint. |
| **Auth Required** | Account password (re-entry required for every content rating change) |
| **Data Available** | Can set any of the standard rating levels: TV-Y, TV-Y7/TV-Y7-FV, G/TV-G, PG/TV-PG, PG-13/TV-14, R/TV-MA |
| **Data NOT Available** | No per-title or per-content-descriptor filtering (tier-based only) |
| **Complexity** | Medium -- password re-entry is simpler than Netflix's MFA (no email/SMS code), but still requires password storage |
| **Risk Level** | Medium -- browser automation with password entry; detectable |
| **Recommendation** | Playwright with password handling. Batch content rating changes across multiple profiles in a single browser session. The password-only gate (no MFA) makes this simpler than the equivalent Netflix operation. |

### 5. `setTitleRestrictions(profileId, titles[])`

| Aspect | Detail |
|---|---|
| **Implementation** | Not Supported |
| **API Accessibility Verdict** | N/A -- Feature does not exist on Disney+ |
| **Approach** | Return `UnsupportedOperationError`. Disney+ does not offer per-title blocking. |
| **API Alternative** | N/A |
| **Auth Required** | N/A |
| **Data Available** | N/A |
| **Data NOT Available** | Disney+ has no mechanism to block individual titles while allowing others at the same rating level |
| **Complexity** | None |
| **Risk Level** | None |
| **Recommendation** | Return `UnsupportedOperationError` with explanatory message. Recommend parents use content rating tiers as the closest alternative. Document this as a platform limitation in Phosra's UI. |

### 6. `setProfilePIN(profileId, pin) / removeProfilePIN(profileId)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (required) |
| **API Accessibility Verdict** | Level 0 -- No write endpoint exists for PIN management. The pydisney wrapper supports accessing PIN-protected profiles (entering a PIN to select a profile), but not setting/changing PINs. |
| **Approach** | Navigate to Edit Profiles > select profile > Profile PIN. Enter account password when prompted. Toggle PIN on/off and enter the desired 4-digit PIN. Save changes. |
| **API Alternative** | None. PIN read (is PIN enabled?) is available via API; PIN write is not. |
| **Auth Required** | Account password (re-entry required) |
| **Data Available** | Can set or remove 4-digit numeric PIN on any profile |
| **Data NOT Available** | Cannot read the current PIN value (only whether a PIN is set) |
| **Complexity** | Medium |
| **Risk Level** | Low-Medium -- straightforward Playwright flow with password entry |
| **Recommendation** | Playwright with password re-entry handling. This is the primary mechanism for profile-level access control and is critical for screen time enforcement. |

### 7. `supportsNativeScreenTime() -> false`

| Aspect | Detail |
|---|---|
| **Implementation** | Static return |
| **API Accessibility Verdict** | N/A |
| **Approach** | Return `false`. Disney+ has zero native screen time features -- no daily limits, no scheduling, no usage reports, no session alerts. |
| **API Alternative** | N/A |
| **Auth Required** | N/A |
| **Data Available** | N/A |
| **Data NOT Available** | N/A |
| **Complexity** | None |
| **Risk Level** | None |
| **Recommendation** | Return false. Document screen time enforcement strategy separately. Phosra must manage screen time entirely through external means (profile locking, device-level controls). |

### 8. `getWatchHistory(profileId) -> WatchEntry[]`

| Aspect | Detail |
|---|---|
| **Implementation** | Unofficial REST API (limited) + Playwright (Continue Watching scrape) |
| **API Accessibility Verdict** | Level 1 -- Profile activity partially accessible via API; viewing history is significantly more sparse than Netflix |
| **Approach** | Use API to select the target profile, then attempt to retrieve Continue Watching data. Supplement with Playwright scrape of the home screen's Continue Watching row. Parse title names, progress indicators, and episode/season info. |
| **API Alternative** | API provides content metadata but no dedicated viewing history endpoint has been documented by community projects |
| **Auth Required** | Bearer token + profile selection |
| **Data Available** | Title name, progress percentage, episode/season (for series), from Continue Watching |
| **Data NOT Available** | Date/time watched, watch duration, completed titles (disappear from Continue Watching), chronological history, CSV export. Disney+ viewing history is dramatically weaker than Netflix. |
| **Complexity** | Medium |
| **Risk Level** | Low -- read-only operations |
| **Recommendation** | Combine API profile selection with Playwright scrape of Continue Watching. Set expectations that Disney+ provides far less viewing data than Netflix -- no timestamps, no completed content log, no duration data. Phosra's parent reports for Disney+ will be significantly less detailed than for Netflix. |

### 9. `lockProfile(profileId) / unlockProfile(profileId)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright |
| **API Accessibility Verdict** | Level 0 -- No write endpoint exists for profile PIN management |
| **Approach** | **Lock:** Set or change the profile PIN to a Phosra-managed value, effectively locking the child out. **Unlock:** Remove the PIN or change it back to the parent's original value. Both require navigating to Edit Profiles > [Profile] > Profile PIN and entering the account password. |
| **API Alternative** | None. Profile PIN changes require browser automation. |
| **Auth Required** | Account password |
| **Data Available** | Can enable/disable PIN, set 4-digit PIN value |
| **Data NOT Available** | Cannot read current PIN value; can only know if PIN is enabled |
| **Complexity** | Medium |
| **Risk Level** | Medium -- changes user's PIN state, requires password entry |
| **Recommendation** | Use cautiously. Store original PIN status (enabled/disabled) to restore later. This is the primary screen time enforcement mechanism on Disney+. The password-only gate (no MFA) makes this more reliable than the equivalent Netflix operation. |

### 10. `createKidsProfile(name, maturityLevel)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright |
| **API Accessibility Verdict** | Level 0 -- No known API endpoint for profile creation |
| **Approach** | Navigate to profile management > Add Profile. If Restrict Profile Creation is enabled, enter account password. Set display name, select avatar, enable Junior Mode toggle (for kids), set appropriate content rating, enable Kid-Proof Exit. Save. |
| **API Alternative** | None. Profile creation requires browser automation. |
| **Auth Required** | Account password (if Restrict Profile Creation is enabled; otherwise no auth required) |
| **Data Available** | Can set: name, avatar, Junior Mode, content rating, Kid-Proof Exit, autoplay settings |
| **Data NOT Available** | Cannot bypass the 7-profile maximum per account |
| **Complexity** | Medium |
| **Risk Level** | Low -- additive action |
| **Recommendation** | Playwright. Verify profile count before attempting (max 7). Recommend enabling Restrict Profile Creation during setup to prevent children from creating unrestricted profiles. |

---

## Overall Architecture

### Recommended Architecture Diagram

```
Phosra Disney+ Adapter
  |
  +-- Session Manager
  |     +-- OAuth authentication (device grant > token exchange > login)
  |     +-- Token caching & refresh (Bearer + refresh tokens)
  |     +-- Re-auth detection & handling
  |     +-- Household detection mitigation
  |
  +-- Read Layer (Private REST API)
  |     +-- listProfiles()
  |     +-- getProfileSettings() [partial]
  |     +-- getWatchHistory() [limited -- Continue Watching only]
  |     Uses: cached Bearer tokens, no browser needed
  |
  +-- Write Layer (Playwright)
  |     +-- setContentRestrictions() [password gate]
  |     +-- setProfilePIN() [password gate]
  |     +-- lockProfile() / unlockProfile() [password gate]
  |     +-- createKidsProfile() [password gate if restricted]
  |     +-- Autoplay toggles
  |     Requires: password handling, browser context, stealth mode
  |
  +-- Screen Time Enforcer
        +-- Monitor Continue Watching for activity
        +-- Lock profile (change PIN) when daily limit hit
        +-- Unlock profile when new day/period starts
        +-- Notify parent via Phosra
        No native Disney+ support -- Phosra-managed entirely
```

### Development Effort Estimate

| Component | Effort | Priority |
|---|---|---|
| Session Manager (OAuth flow + token cache) | 2-3 days | P0 |
| Read Layer (REST API integration) | 1-2 days | P0 |
| Write Layer (Playwright + password handling) | 3-4 days | P1 |
| Screen Time Enforcer | 2-3 days | P2 |
| Household detection mitigation | 1-2 days | P1 |
| Testing & hardening | 2-3 days | P1 |
| **Total** | **11-17 days** | |

### Key Advantage Over Netflix Adapter

The Disney+ adapter has a simpler authentication model than Netflix:
- **Netflix:** Session cookies + MSL tokens + CSRF headers + email/SMS MFA for writes
- **Disney+:** OAuth Bearer tokens + password re-entry for writes (no MFA)

This means the Disney+ Write Layer is less complex than Netflix's, though both require Playwright for parental control changes.

### Detection Vectors and Mitigations

| Vector | Risk Level | Mitigation |
|---|---|---|
| Headless browser detection | Medium | Use Playwright stealth plugin (playwright-extra) |
| Request frequency analysis | Low | Rate limit to 1 action per 5-10 seconds; cache aggressively |
| Device grant registration | Medium | Reuse device tokens; do not create new device grants frequently |
| Out-of-household IP detection | High | Paid sharing crackdown actively monitors IPs. Consider running from user's network or residential proxy. |
| OAuth token usage patterns | Low-Medium | Mimic mobile app request patterns (the API was reverse-engineered from iOS) |
| Unusual navigation patterns | Low | Randomize delays, follow natural page flow |

### Terms of Service Summary

**Disney Terms of Use, Section 2.B.x:** Prohibits access via "a robot, spider, script, or other automated means" including for "data mining or web scraping."

**Disney Terms of Use, Section 2.B.v:** Prohibits reverse engineering, decompiling, or disassembling Disney products.

**Enforcement history:**
- Disney shut down third-party dining reservation scraping services
- Disney paid $10M COPPA settlement (December 2025) -- heightened sensitivity to child data
- Paid sharing crackdown infrastructure actively monitors for out-of-household access

**Risk severity: Medium-High.** Disney has demonstrated willingness to enforce ToS and has technical infrastructure (household detection) that could identify Phosra's access patterns. The COPPA settlement context means Disney may be especially aggressive about third-party access to child profiles.
