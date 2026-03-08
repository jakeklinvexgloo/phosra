# Max (HBO Max) Adapter Assessment for Phosra

**Platform:** Max (HBO Max)
**Assessment Date:** 2026-03-01
**Existing Adapter:** None (new research)
**Recommended Approach:** Hybrid (REST API for reads where possible, Playwright for writes)

---

## API Accessibility Context

**Before evaluating individual adapter methods, it is critical to understand the API landscape reality:**

Max does not offer a public API, developer portal, partner program, or OAuth flow. The internal REST API at `comet.api.hbo.com` has been partially reverse-engineered by community projects (DmanCoder/hbo-max-api on GitHub, abhishekbanthia.com blog). This API uses standard REST patterns with token-based authentication, making it more approachable than Netflix's proprietary Falcor protocol, but it remains undocumented, unsupported, and subject to change.

### What This Means for Each Method

| Access Pattern | API Accessibility | Stability | ToS Status |
|---|---|---|---|
| **Read via REST API** | Unofficial internal API, token auth | Moderate -- REST is more stable than Falcor, but endpoints change during rebrands (HBO Max to Max to HBO Max) | Violation of ToS (robots, data mining prohibited) |
| **Write via Playwright** | No write API exists for parental controls | Breaks when UI/DOM changes; rebrand cycles cause major UI overhauls | Violation of ToS (automated means, circumventing security) |
| **Authentication** | Token endpoint at `/tokens` | Subject to CAPTCHA challenges, password sharing detection | Violation of ToS |

### Industry Benchmark

No parental control app (Bark, Qustodio, Net Nanny, Canopy, Mobicip, FamiSafe) integrates with Max APIs. All operate at the device/OS level only. Phosra's proposed approach would be unprecedented.

### Unofficial API Details

- **comet.api.hbo.com:** REST API handling authentication, content, profiles. Token-based auth via `/tokens` endpoint
- **DmanCoder/hbo-max-api (GitHub):** Community reverse-engineering project with API routes, utilities, validations. Likely outdated due to multiple rebrands
- **telegraph.api.hbo.com:** Analytics/telemetry endpoint. Tracks app launches, profile switches, page loads, errors
- **Rebrand instability:** The platform has undergone HBO Max -> Max (May 2023) -> HBO Max (July 2025) rebranding. Each cycle changes URLs, UI structure, and potentially API endpoints

---

## Adapter Method Assessment

### 1. `authenticate(credentials) -> Session`

| Aspect | Detail |
|---|---|
| **Implementation** | REST API (preferred) or Playwright browser automation |
| **API Accessibility Verdict** | Level 1 -- Unofficial token endpoint exists at `comet.api.hbo.com/tokens` |
| **Approach** | POST to `/tokens` with username and password. Extract session token for subsequent API calls. If CAPTCHA is triggered, fall back to Playwright with stealth mode for browser-based login |
| **API Alternative** | The `/tokens` endpoint IS the API approach. Playwright is the fallback when CAPTCHA blocks API login |
| **Auth Required** | Email + password (sent in request body) |
| **Data Available** | Session token, account metadata, subscription status |
| **Data NOT Available** | Token expiration policy (needs live testing), refresh token flow |
| **Complexity** | Medium -- CAPTCHA handling adds significant complexity |
| **Risk Level** | Medium -- login automation is the most detectable action. CAPTCHA system with ~5 attempt lockout. Password sharing detection may flag data center IPs |
| **Recommendation** | Attempt REST API `/tokens` first. If CAPTCHA triggered, use Playwright with stealth mode. Cache tokens aggressively. Implement CAPTCHA detection and graceful fallback. Consider residential proxy for login to avoid household enforcement triggers |

### 2. `listProfiles() -> Profile[]`

| Aspect | Detail |
|---|---|
| **Implementation** | REST API (preferred) or Playwright |
| **API Accessibility Verdict** | Level 1 -- Unofficial REST API at `comet.api.hbo.com` supports profile queries |
| **Approach** | Authenticated REST API call to profile listing endpoint. Parse response for profile names, types (Adult/Kids), maturity tiers, Kids Mode status, Kid-Proof Exit status, and avatar URLs |
| **API Alternative** | REST API is the primary approach. Playwright fallback scrapes the Manage Profiles page |
| **Auth Required** | Session token |
| **Data Available** | Profile name, type (Adult/Kids), maturity tier, Kids Mode status, Kid-Proof Exit enabled, avatar URL, birthdate (if set), Profile PIN lock status |
| **Data NOT Available** | Internal profile IDs may require endpoint discovery |
| **Complexity** | Low |
| **Risk Level** | Low -- read-only API call |
| **Recommendation** | Use REST API directly with cached session token. Map profile types and maturity tiers to Phosra's internal model |

### 3. `getProfileSettings(profileId) -> Settings`

| Aspect | Detail |
|---|---|
| **Implementation** | REST API (preferred) or Playwright |
| **API Accessibility Verdict** | Level 1 -- Profile settings readable via REST API with session token |
| **Approach** | Authenticated REST API call to retrieve profile-specific settings. Parse maturity tier, Kid-Proof Exit status, autoplay toggles, and PIN lock status |
| **API Alternative** | REST API is primary. Playwright fallback navigates to profile edit page |
| **Auth Required** | Session token (reads should not require password/PIN) |
| **Data Available** | Maturity tier, Kids Mode flag, Kid-Proof Exit enabled, autoplay settings (3 toggles), profile lock status, language preference |
| **Data NOT Available** | Parent Code value (stored server-side, not readable). Continue Watching items may require separate endpoint |
| **Complexity** | Low |
| **Risk Level** | Low -- read-only |
| **Recommendation** | Use REST API with cached session token. This is the lowest-risk, highest-value read operation |

### 4. `setContentRestrictions(profileId, maturityLevel)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (required) |
| **API Accessibility Verdict** | Level 0 -- No write endpoint exists for maturity settings. Browser automation is the only path |
| **Approach** | Navigate to Manage Profiles > select Kids profile > change ratings group dropdown (Little Kids / Big Kids / Pre-teens / Teens) > Save. Account password may be required for changes |
| **API Alternative** | None known. The REST API does not expose write endpoints for parental control settings |
| **Auth Required** | Session token + account password (for settings changes) |
| **Data Available** | 4 maturity tiers: Little Kids (TV-Y), Big Kids (TV-Y7/TV-G/G), Pre-teens (TV-PG/PG), Teens (TV-14/PG-13) |
| **Data NOT Available** | Per-title blocking (feature does not exist on Max) |
| **Complexity** | Medium -- password gate but no MFA (simpler than Netflix's MFA flow) |
| **Risk Level** | Medium -- involves password automation |
| **Recommendation** | Playwright with stealth mode. Simpler than Netflix because Max uses password-only gate (no email/SMS MFA). Store account password securely for automation |

### 5. `setTitleRestrictions(profileId, titles[])`

| Aspect | Detail |
|---|---|
| **Implementation** | **Not Supported** |
| **API Accessibility Verdict** | N/A -- Feature does not exist on Max |
| **Approach** | Return `UnsupportedOperationError`. Max does not offer per-title blocking. Content filtering is tier-based only |
| **API Alternative** | N/A |
| **Auth Required** | N/A |
| **Data Available** | N/A |
| **Data NOT Available** | N/A |
| **Complexity** | None |
| **Risk Level** | None |
| **Recommendation** | Return `UnsupportedOperationError` with a clear message: "Max does not support per-title blocking. Content is filtered by maturity tier only. Consider adjusting the maturity tier or using device-level controls for specific titles." |

### 6. `setProfilePIN(profileId, pin) / setParentCode(code)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (required) |
| **API Accessibility Verdict** | Level 0 -- No write endpoint exists for PIN management. Browser automation is the only path |
| **Approach** | **For Adult Profile PIN:** Manage Profiles > select Adult profile > Lock Profile > enter account password > enter 4-digit PIN > Save. **For Parent Code:** Account settings or hbomax.com/parentcode > enter/change 4-digit Parent Code |
| **API Alternative** | None known |
| **Auth Required** | Session token + account password |
| **Data Available** | Profile PIN set/change/remove. Parent Code set/change |
| **Data NOT Available** | Cannot read existing PIN values (only set new ones) |
| **Complexity** | Medium -- two separate PIN systems (Profile PIN + Parent Code) |
| **Risk Level** | Low-Medium -- password gate, email notification sent on PIN changes (creates audit trail visible to account owner) |
| **Recommendation** | Playwright for both PIN systems. Note: Max sends email notifications when PINs are changed -- Phosra should inform parents that they will receive these emails when Phosra manages PINs on their behalf |

### 7. `supportsNativeScreenTime() -> false`

| Aspect | Detail |
|---|---|
| **Implementation** | Static return |
| **API Accessibility Verdict** | N/A |
| **Approach** | Return `false`. Max has no meaningful native screen time features. One search result hinted at a possible screen time slider for kids profiles, but this is not confirmed in official documentation and may be region-specific or experimental |
| **API Alternative** | N/A |
| **Auth Required** | N/A |
| **Data Available** | N/A |
| **Data NOT Available** | N/A |
| **Complexity** | None |
| **Risk Level** | None |
| **Recommendation** | Return `false`. Document screen time enforcement strategy separately. If Max adds native screen time features in the future, this method should be updated |

### 8. `getWatchHistory(profileId) -> WatchEntry[]`

| Aspect | Detail |
|---|---|
| **Implementation** | REST API or Playwright (severely limited data) |
| **API Accessibility Verdict** | Level 0-1 -- Continue Watching may be readable via REST API, but Max has no viewing history feature |
| **Approach** | Poll the Continue Watching section via REST API or Playwright scrape. This returns only titles currently in progress, not a historical viewing log |
| **API Alternative** | REST API `comet.api.hbo.com/content` may include Continue Watching data. Needs live endpoint discovery |
| **Auth Required** | Session token + profile context |
| **Data Available** | Title name (currently in progress), progress indicator (percentage or episode number) |
| **Data NOT Available** | **Historical viewing log (does not exist), watch duration, timestamps (when watched), completed titles, date watched, session duration.** This is the most critical data gap on Max |
| **Complexity** | Low (for the limited data available) |
| **Risk Level** | Low -- read-only |
| **Recommendation** | Poll Continue Watching via REST API every 15-30 minutes. Maintain Phosra's own viewing log by tracking changes to Continue Watching over time. This is a lossy approach -- completed titles disappear from Continue Watching and will be missed. **Set clear expectations with parents that Max viewing reports will be incomplete** |

### 9. `lockProfile(profileId) / unlockProfile(profileId)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (required) |
| **API Accessibility Verdict** | Level 0 -- No write endpoint exists. Browser automation is the only path |
| **Approach** | **Lock:** Enable Kid-Proof Exit on the Kids profile (requires Parent Code) and/or change the Parent Code to a Phosra-generated value. **Unlock:** Disable Kid-Proof Exit or restore original Parent Code. For Adult profiles: toggle Profile PIN lock on/off |
| **API Alternative** | None known |
| **Auth Required** | Session token + account password + Parent Code |
| **Data Available** | Kid-Proof Exit toggle, Profile PIN toggle |
| **Data NOT Available** | Cannot query current lock state reliably without reading profile settings first |
| **Complexity** | Medium-High -- involves both Parent Code and Profile PIN systems |
| **Risk Level** | Medium -- changes user's security settings. Email notifications sent on PIN changes |
| **Recommendation** | Use Kid-Proof Exit toggling as the primary lock/unlock mechanism for Kids profiles. Store original Parent Code for restoration. For screen time enforcement, consider toggling Kid-Proof Exit rather than changing the Parent Code (less disruptive). Inform parents about email notifications triggered by PIN changes |

### 10. `createKidsProfile(name, maturityLevel)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (required) |
| **API Accessibility Verdict** | Level 0 -- No known API endpoint for profile creation. Browser automation is the only path |
| **Approach** | Navigate to Manage Profiles > + New Profile > enter name (1-14 chars) > select avatar > toggle Kids Mode ON > select maturity tier (Little Kids / Big Kids / Pre-teens / Teens) > optionally enable Kid-Proof Exit > save |
| **API Alternative** | None known |
| **Auth Required** | Session token (profile creation does NOT require password -- this is a security gap) |
| **Data Available** | Profile name, avatar selection, Kids Mode toggle, maturity tier, Kid-Proof Exit toggle, birthdate |
| **Data NOT Available** | Internal profile ID assigned after creation |
| **Complexity** | Medium -- multi-step form with avatar selection |
| **Risk Level** | Low -- additive action, no auth barrier |
| **Recommendation** | Playwright with stealth mode. Verify profile count before attempting (max 5). Enable Kid-Proof Exit by default for new Kids profiles. Note the security gap: profile creation requires no authentication, meaning Phosra (or a child) can create profiles without password verification |

---

## Overall Architecture

### Recommended Architecture Diagram

```
Phosra Max Adapter
  |
  +-- Session Manager
  |     +-- Login via REST API /tokens (primary)
  |     +-- CAPTCHA fallback via Playwright (stealth mode)
  |     +-- Token caching (TTL TBD -- needs live testing)
  |     +-- Re-auth detection & handling
  |     +-- Residential proxy consideration (household sharing enforcement)
  |
  +-- Read Layer (REST API)
  |     +-- listProfiles()
  |     +-- getProfileSettings()
  |     +-- getWatchHistory() (Continue Watching only -- severely limited)
  |     Uses: cached session tokens, no browser needed
  |
  +-- Write Layer (Playwright)
  |     +-- setContentRestrictions()
  |     +-- setProfilePIN() / setParentCode()
  |     +-- lockProfile() / unlockProfile()
  |     +-- createKidsProfile()
  |     Requires: password handling, Parent Code management
  |     Note: No MFA (simpler than Netflix's write layer)
  |
  +-- Screen Time Enforcer
  |     +-- Monitor Continue Watching via REST API
  |     +-- Toggle Kid-Proof Exit for lock/unlock
  |     +-- No native screen time -- fully Phosra-managed
  |     Limitation: No viewing duration data; poor monitoring fidelity
  |
  +-- PIN Manager
        +-- Manage Parent Code (account-wide, for Kid-Proof Exit)
        +-- Manage Profile PINs (per Adult profile, for profile access)
        +-- Track PIN change email notifications
        +-- Store original values for restoration
```

### Development Effort Estimate

| Component | Effort | Priority |
|---|---|---|
| Session Manager (REST API login + CAPTCHA fallback) | 3-4 days | P0 |
| Read Layer (REST API -- profiles, settings) | 2-3 days | P0 |
| Read Layer (Continue Watching polling) | 1-2 days | P1 |
| Write Layer (Playwright -- maturity, profiles) | 3-4 days | P1 |
| PIN Manager (Parent Code + Profile PIN) | 2-3 days | P1 |
| Screen Time Enforcer (Kid-Proof Exit toggling) | 2-3 days | P2 |
| Testing & hardening | 2-3 days | P1 |
| **Total** | **15-22 days** | |

### Detection Vectors and Mitigations

| Vector | Risk | Mitigation |
|---|---|---|
| CAPTCHA at login | High | Attempt REST API login first; fall back to Playwright. Implement CAPTCHA detection and retry with delay. Cache tokens aggressively to minimize logins |
| Headless browser detection | Medium | Use Playwright stealth plugin (playwright-extra) to mask automation signals |
| Password sharing detection (IP-based) | High | Use residential proxies or encourage users to run Phosra agent on their home network. Data center IPs will likely trigger household enforcement |
| Request frequency analysis | Low | Rate limit to 1 action per 5-10 seconds; cache aggressively |
| PIN change email notifications | Low | Inform parents they will receive emails when Phosra changes PINs. This is informational, not a detection risk |
| Multiple rapid setting changes | Medium | Batch changes within single sessions; add jitter between actions |
| Rebrand-cycle breakage | Medium | Monitor WBD announcements. Maintain flexible selectors. Budget for quarterly adapter maintenance |

### Terms of Service Summary

HBO Max Terms of Use prohibit:
- Use of "**data mining, robots, viruses, worms, bugs, or other data gathering and extraction tools** on the Platform"
- Attempts to "**circumvent, disable, or otherwise tamper with any security technology** protecting any Content, system resources, accounts or any other part of the Platform"

**Risk severity: MEDIUM-HIGH.** Max is actively enforcing password sharing (IP monitoring, device fingerprinting) as of September 2025. While this enforcement targets multi-household sharing rather than parental control tools specifically, Phosra's server-based access could trigger the same detection mechanisms. The CAPTCHA system adds an additional barrier. However, Max's overall bot detection is less sophisticated than Netflix's (no MSL tokens, no device fingerprinting at the API level beyond CAPTCHA).
