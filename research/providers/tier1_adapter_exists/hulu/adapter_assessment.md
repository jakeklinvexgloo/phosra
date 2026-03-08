# Hulu Adapter Assessment for Phosra

**Platform:** Hulu
**Assessment Date:** 2026-03-01
**Existing Adapter:** None (new adapter required)
**Recommended Approach:** Playwright-only (no known unofficial API surface)
**Critical Context:** Hulu standalone app shutting down in 2026; adapter has limited lifespan

---

## API Accessibility Context

**Before evaluating individual adapter methods, it is critical to understand the API landscape reality:**

Hulu has **never** offered a public API for account or user features. Unlike Netflix (which had a public API until 2014 and has well-studied internal Shakti/Falcor APIs), Hulu's internal API surface is largely undocumented and unstudied by the community. There are no known unofficial API libraries, no maintained open-source integrations, and minimal reverse-engineering effort in the public domain.

### What This Means for Each Method

| Access Pattern | API Accessibility | Stability | ToS Status |
|---|---|---|---|
| **Read via internal REST** | Possibly exists but undocumented; no community knowledge base | Unknown -- Hulu transitioning to Disney+ backend | Violation of Subscriber Agreement (automated means, scraping) |
| **Write via Playwright** | No API exists -- browser automation required for all writes | Breaks when Hulu changes UI; entire app being phased out in 2026 | Violation of Subscriber Agreement (robots, automated means) |
| **Authentication** | No OAuth/token flow -- credential-based browser login only | Subject to device fingerprinting and household sharing detection | Violation of Subscriber Agreement |

### Industry Benchmark

No parental control app (Bark, Qustodio, Net Nanny, Mobicip, FamiSafe, Apple Screen Time) integrates with Hulu APIs. All operate at the device/OS level only. Phosra's proposed direct Hulu integration would be unprecedented.

### Disney+ Transition Advisory

**Any Hulu-specific adapter has a limited lifespan.** The standalone Hulu app is being discontinued in 2026, with all content moving to the Disney+ app. Engineering effort invested in a Hulu adapter should be weighed against building a Disney+ adapter that will cover both services long-term.

---

## Adapter Method Assessment

### 1. `authenticate(credentials) -> Session`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright browser automation |
| **API Accessibility Verdict** | Level 0 -- No OAuth, no token exchange, no delegated auth. Browser login is the only option. |
| **Approach** | Navigate to `auth.hulu.com/web/login`, fill email + password, handle profile picker. Extract session cookies from browser context. |
| **API Alternative** | None. Hulu provides no OAuth flow, no API keys, no partner authentication mechanism. |
| **Auth Required** | Email + password |
| **Data Available** | Session cookies enabling subsequent requests |
| **Data NOT Available** | No structured session token; no refresh token mechanism; no API key |
| **Complexity** | Low-Medium |
| **Risk Level** | Medium -- login automation triggers device fingerprinting and household sharing detection. Hulu actively monitors for out-of-household access since March 2024. |
| **Recommendation** | Use Playwright with stealth mode. Cache session cookies aggressively. Minimize login frequency. Consider residential proxy or user's own network to avoid household detection. |

### 2. `listProfiles() -> Profile[]`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (primary); possibly internal REST API |
| **API Accessibility Verdict** | Level 0 -- No known public or documented internal API for profile listing |
| **Approach** | Navigate to Manage Profiles page or "Who's Watching" screen. Extract profile names, types (Kids/Standard), and IDs from page DOM. |
| **API Alternative** | Possible REST endpoint at `home.hulu.com/v*/users/self/profiles` (inferred, not confirmed). Would need HAR capture to verify. |
| **Auth Required** | Session cookies |
| **Data Available** | Profile name, type (Kids/Standard), avatar, birthdate age category |
| **Data NOT Available** | Exact birthdate, detailed maturity settings (binary Kids/not-Kids) |
| **Complexity** | Low |
| **Risk Level** | Low -- read-only page navigation |
| **Recommendation** | Playwright to scrape profile list. Investigate internal REST endpoint via HAR capture for a more reliable read path. |

### 3. `getProfileSettings(profileId) -> Settings`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright |
| **API Accessibility Verdict** | Level 0 -- No known API endpoint for reading profile settings |
| **Approach** | Navigate to Manage Profiles > Edit [Profile]. Extract settings from form fields: Kids toggle status, autoplay preference. Navigate to Parental Controls section to read PIN Protection status. |
| **API Alternative** | None known. Internal API may exist but is undocumented. |
| **Auth Required** | Session cookies |
| **Data Available** | Kids profile status (on/off), autoplay setting, PIN protection enabled/disabled |
| **Data NOT Available** | Specific maturity rating level (not configurable -- determined by birthdate), content descriptor preferences (not available), viewing restrictions details |
| **Complexity** | Low-Medium |
| **Risk Level** | Low -- read-only page navigation |
| **Recommendation** | Playwright scrape of profile edit and parental controls pages. Limited value compared to Netflix due to Hulu's binary Kids/Standard model. |

### 4. `setContentRestrictions(profileId, maturityLevel)`

| Aspect | Detail |
|---|---|
| **Implementation** | Not possible (in the Netflix sense) |
| **API Accessibility Verdict** | N/A -- Feature does not exist in a configurable form |
| **Approach** | Hulu does not offer a configurable maturity level slider. Content restrictions are determined by: (a) whether the profile is a Kids profile, or (b) the birthdate entered at profile creation. The only way to change maturity level is to toggle the Kids switch or change the birthdate (which requires contacting Hulu support). |
| **API Alternative** | None. The feature itself does not exist. |
| **Auth Required** | N/A |
| **Data Available** | N/A |
| **Data NOT Available** | No maturity level to set -- binary Kids/Standard only |
| **Complexity** | N/A |
| **Risk Level** | N/A |
| **Recommendation** | Return `UnsupportedOperationError` with explanation that Hulu uses binary Kids/Standard model. Document workaround: Phosra can create/delete Kids profiles or recommend the parent contact Hulu support to change the birthdate. |

### 5. `setTitleRestrictions(profileId, titles[])`

| Aspect | Detail |
|---|---|
| **Implementation** | Not possible |
| **API Accessibility Verdict** | N/A -- Feature does not exist on platform |
| **Approach** | Hulu does not offer per-title blocking of any kind. There is no mechanism -- UI, API, or otherwise -- to block individual shows or movies by name. |
| **API Alternative** | None. The feature itself does not exist. |
| **Auth Required** | N/A |
| **Data Available** | N/A |
| **Data NOT Available** | Everything -- feature does not exist |
| **Complexity** | N/A |
| **Risk Level** | N/A |
| **Recommendation** | Return `UnsupportedOperationError`. This is a hard platform limitation. Document as a key gap for Phosra families using Hulu. |

### 6. `setProfilePIN(profileId, pin) / removeProfilePIN(profileId)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright |
| **API Accessibility Verdict** | Level 0 -- No known API. Browser automation required. |
| **Approach** | Navigate to hulu.com > Manage Profiles > Parental Controls > PIN Protection. Toggle PIN on/off. Enter 4-digit PIN. Password re-entry required to change or disable. |
| **API Alternative** | None known. |
| **Auth Required** | Session cookies + account password (for PIN changes) |
| **Data Available** | PIN enabled/disabled status |
| **Data NOT Available** | Current PIN value (cannot be read, only set/changed) |
| **Complexity** | Medium |
| **Risk Level** | Low-Medium -- account-wide change affects all profiles |
| **Recommendation** | Playwright with password re-entry handling. Important: this is an account-wide PIN, not per-profile. Changing it affects access to ALL non-Kids profiles. Use cautiously. |

### 7. `supportsNativeScreenTime() -> false`

| Aspect | Detail |
|---|---|
| **Implementation** | Static return |
| **API Accessibility Verdict** | N/A |
| **Value** | `false` -- Hulu has zero native screen time features |
| **Alternative Enforcement** | Profile PIN enable/disable as time-based gate; device-level controls (iOS Screen Time, router schedules); autoplay disable to reduce passive viewing |
| **Complexity** | None |
| **Risk Level** | None |
| **Recommendation** | Return false. Document screen time enforcement strategy separately. Hulu's lack of screen time controls is identical to Netflix. |

### 8. `getWatchHistory(profileId) -> WatchEntry[]`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (primary); possibly internal REST API |
| **API Accessibility Verdict** | Level 0 -- No known public API. Possible internal REST endpoint but undocumented. |
| **Approach** | Navigate to Profile > History. Scrape title names, episode/season info, and progress indicators from the page. Pagination may be required for long histories. |
| **API Alternative** | Possible REST endpoint at `home.hulu.com/v*/users/self/watch_history` (inferred, not confirmed). |
| **Auth Required** | Session cookies + profile switch (must be viewing as the target profile) |
| **Data Available** | Title name, series/episode info, watch progress (percentage or completed) |
| **Data NOT Available** | Watch date/timestamp, session duration, time of day, device used. **Critical gap: without timestamps, Phosra cannot calculate daily watch time for screen time enforcement.** |
| **Complexity** | Medium |
| **Risk Level** | Low-Medium -- read-only but requires profile switching |
| **Recommendation** | Playwright scrape of History page. The lack of timestamps is a severe limitation -- Phosra cannot build meaningful time-based reports or enforce screen time limits without knowing when viewing occurred. This fundamentally limits the value of Hulu watch history data. |

### 9. `lockProfile(profileId) / unlockProfile(profileId)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright |
| **API Accessibility Verdict** | Level 0 -- No known API. |
| **Approach** | Toggle PIN Protection on/off via Parental Controls. To "lock" a profile: enable PIN protection (requires setting a 4-digit PIN). To "unlock": disable PIN protection (requires account password). |
| **API Alternative** | None known. |
| **Auth Required** | Session cookies + account password |
| **Data Available** | PIN protection enabled/disabled status |
| **Data NOT Available** | N/A |
| **Complexity** | Medium |
| **Risk Level** | Medium -- account-wide change. Enabling PIN locks ALL non-Kids profiles, not just the target child's profile. Disabling PIN unlocks ALL non-Kids profiles. This is a blunt instrument compared to Netflix's per-profile PIN. |
| **Recommendation** | Use with extreme caution. Because Hulu's PIN is account-wide, locking one child's profile also locks every other non-Kids profile on the account. This approach is only viable if the goal is to restrict ALL non-Kids profile access during certain hours. Consider alternative: delete/recreate the child's non-Kids profile as a Kids profile to restrict content, then switch back. Both approaches are disruptive. |

### 10. `createKidsProfile(name, maturityLevel)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright |
| **API Accessibility Verdict** | Level 0 -- No known API for profile creation. |
| **Approach** | Navigate to "Who's Watching" > Add Profile. Enter profile name, toggle Kids switch ON, optionally set birthdate. Click Create Profile. If PIN protection is enabled, Kids profiles can still be created without PIN entry. |
| **API Alternative** | None known. |
| **Auth Required** | Session cookies (no PIN required for Kids profile creation) |
| **Data Available** | Profile name, Kids toggle, birthdate |
| **Data NOT Available** | Maturity level selection (Kids profile has fixed maturity -- no configurable level) |
| **Complexity** | Low-Medium |
| **Risk Level** | Low -- additive action. Kids profile creation is the least risky operation. |
| **Recommendation** | Playwright automation. Note: `maturityLevel` parameter is ignored because Hulu Kids profiles have a single, non-configurable maturity level. Check profile count before creating (max 7 total). |

---

## Overall Architecture

### Recommended Architecture Diagram

```
Phosra Hulu Adapter
  |
  +-- Session Manager
  |     +-- Login via Playwright (stealth mode)
  |     +-- Cookie extraction & caching
  |     +-- Re-auth detection & handling
  |     +-- Household detection avoidance (residential proxy or user network)
  |
  +-- Read Layer (Playwright-only)
  |     +-- listProfiles() -- scrape profile picker
  |     +-- getProfileSettings() -- scrape profile edit page
  |     +-- getWatchHistory() -- scrape History page (no timestamps)
  |     Note: No known API for reads. All reads go through Playwright.
  |     Future: Investigate internal REST endpoints via HAR capture.
  |
  +-- Write Layer (Playwright)
  |     +-- setProfilePIN() -- toggle + password re-entry
  |     +-- createKidsProfile() -- profile creation flow
  |     +-- lockProfile() / unlockProfile() -- PIN toggle
  |     Note: No MFA gate (simpler than Netflix, but less secure)
  |
  +-- Screen Time Enforcer
  |     +-- Cannot enforce on Hulu directly (no timestamps in history)
  |     +-- Defer to device-level controls
  |     +-- Autoplay toggle as passive measure
  |
  +-- NOT SUPPORTED
        +-- setContentRestrictions() -- binary model, not configurable
        +-- setTitleRestrictions() -- feature does not exist
        +-- Native screen time -- does not exist
```

### Development Effort Estimate

| Component | Effort | Priority | Notes |
|---|---|---|---|
| Session Manager (login + cookie cache) | 2-3 days | P0 | Simpler than Netflix (no MFA) but household detection is a concern |
| Read Layer (Playwright scraping) | 2-3 days | P0 | All reads via Playwright; investigate REST endpoints opportunistically |
| Write Layer (PIN management) | 1-2 days | P1 | Account-wide PIN; simpler than Netflix per-profile PIN |
| Kids Profile Creator | 1 day | P1 | Simple Playwright flow |
| Autoplay Toggle | 0.5 day | P2 | Per-profile, per-device complication |
| Testing & hardening | 2-3 days | P1 | Must test across subscription tiers (ad vs no-ad, Live TV) |
| Disney+ transition planning | 1 day | P0 | Assess timeline, plan adapter migration strategy |
| **Total** | **9-13 days** | | **Note: Limited lifespan due to Hulu app shutdown in 2026** |

### Detection Vectors and Mitigations

| Vector | Risk Level | Mitigation |
|---|---|---|
| Headless browser detection | Medium | Use Playwright stealth plugin (playwright-extra) |
| Household sharing detection | High | Hulu actively monitors IP patterns since March 2024. Use residential proxy or run automation from user's home network if possible. |
| Request frequency | Low | Rate limit to natural browsing patterns. Cache session aggressively. |
| Login from new device/IP | Medium | Maintain persistent browser profile. Minimize re-authentication. |
| AWS WAF / bot detection | Low-Medium | Standard mitigations: stealth mode, human-like timing, jitter |
| Device fingerprinting | Medium | Consistent browser profile across sessions |

### Terms of Service Summary

**Hulu Subscriber Agreement** prohibits:
- Accessing services using robots, spiders, scripts, or other automated means
- Using automated means for data mining, web scraping, or building data sets
- Using technology to obscure or disguise location
- Bypassing, modifying, or circumventing protections of the services
- Sharing account access outside of household

**Consequences:** Account limitation or termination "at Hulu's sole discretion"

**Risk assessment:** Medium-High. Hulu (Disney) has more legal resources than most streaming platforms and has already demonstrated willingness to enforce terms (password sharing crackdown). However, no precedent exists for enforcement against parental control tools specifically.

---

## Adapter Viability Assessment

### Should Phosra Build a Hulu Adapter?

**Arguments FOR:**
- Hulu has ~48 million subscribers (significant market)
- Hulu's parental controls are among the weakest of major platforms -- Phosra adds clear value
- No competitor offers Hulu-level integration
- Simpler than Netflix (no MFA gate)

**Arguments AGAINST:**
- Hulu standalone app shutting down in 2026 -- adapter has months of useful life, not years
- All investment should arguably go to Disney+ adapter (which will cover Hulu content)
- No API surface -- 100% Playwright-based is fragile and expensive to maintain
- Household sharing detection adds risk that Netflix adapter does not face
- Binary maturity model (Kids/Standard) limits what Phosra can configure

**Recommendation:**
1. **Prioritize Disney+ adapter development** -- this is the long-term play and will cover Hulu content
2. **Build a minimal Hulu adapter** only if Disney+ adapter timeline extends beyond Hulu app shutdown
3. **If building Hulu adapter:** Focus on P0 items only (session management, profile reads, PIN management). Skip P2 items. Accept the limited lifespan.
4. **Communicate to families:** Hulu's parental controls are weak compared to competitors, and the upcoming Disney+ integration will bring significantly better controls
