# Paramount+ Adapter Assessment for Phosra

**Platform:** Paramount+
**Assessment Date:** 2026-03-01
**Existing Adapter:** None (new adapter required)
**Recommended Approach:** Playwright-only (no known unofficial API for account management)

---

## API Accessibility Context

**Before evaluating individual adapter methods, it is critical to understand the API landscape reality:**

Paramount+ has never offered a public API for any purpose. There is no developer portal, no partner program for parental control apps, no OAuth flow, and no delegated access mechanism. Unlike Netflix (which has documented unofficial Shakti/Falcor APIs for reads), Paramount+ has **no known unofficial API endpoints for account settings or parental controls**. The SlyGuy Kodi addon demonstrates that internal APIs exist for content delivery, but these are focused on video playback, not account management.

### What This Means for Each Method

| Access Pattern | API Accessibility | Stability | ToS Status |
|---|---|---|---|
| **Read via internal API** | No known endpoints for parental controls or profiles (unlike Netflix Shakti) | Unknown | Violation of ToS (automated access) |
| **Write via Playwright** | Only viable path -- all parental control changes go through web UI | Breaks on UI/DOM changes | Violation of ToS (bots, automated means) |
| **Authentication** | No OAuth -- must use credential-based browser login | Subject to CAPTCHA, session expiry | Violation of ToS |

### Industry Benchmark

No parental control app (Bark, Qustodio, Net Nanny, Google Family Link, Apple Screen Time, Circle) integrates with Paramount+ APIs. All operate at the device/OS level only (app blocking, time limits, DNS filtering). Phosra's proposed approach of direct Paramount+ integration is **unprecedented**.

### Key Differences from Netflix

| Aspect | Netflix | Paramount+ |
|---|---|---|
| Unofficial read API | Yes (Shakti/Falcor) | No known endpoints |
| MFA on parental controls | Yes (email/SMS/password) | No (password only for enable/disable) |
| PIN scope | Per-profile | Account-wide |
| Per-title blocking | Yes | No |
| Bot detection aggressiveness | High (device fingerprinting, behavioral) | Moderate (Google Cloud Armor) |
| Authentication complexity | High (MSL tokens, CSRF headers) | Low (standard session cookies) |

---

## Adapter Method Assessment

### 1. `authenticate(credentials) -> Session`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright browser automation |
| **API Accessibility Verdict** | Level 0 -- No API, no OAuth, no token exchange. Browser login is the only option |
| **Approach** | Navigate to paramountplus.com/account/signin, fill email + password, handle profile picker. Extract session cookies after successful login |
| **API Alternative** | None. No OAuth flow, no login API endpoint documented |
| **Auth Required** | Email + password |
| **Data Available** | Session cookies, account state, profile list (from profile picker page) |
| **Data NOT Available** | API tokens, OAuth refresh tokens |
| **Complexity** | Low-Medium (simpler than Netflix -- no MFA, no MSL tokens, no CSRF) |
| **Risk Level** | Medium -- login automation is the most detectable action |
| **Recommendation** | Use Playwright with stealth mode. Cache session cookies aggressively to minimize login frequency. Monitor for CAPTCHA challenges. Unlike Netflix, no MFA handling needed during standard login |

### 2. `listProfiles() -> Profile[]`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (scrape profile picker page) |
| **API Accessibility Verdict** | Level 0 -- No known API endpoint for profile listing |
| **Approach** | Navigate to profile picker (displayed after login or at paramountplus.com/account), scrape profile names, types (Kids/Standard), and avatar images from DOM |
| **API Alternative** | None discovered. Unlike Netflix (Falcor profile paths), no internal API for Paramount+ profile listing has been documented |
| **Auth Required** | Session cookies only |
| **Data Available** | Profile name, profile type (Kids/Standard), avatar URL, Kids age tier (Younger/Older) |
| **Data NOT Available** | Internal profile IDs (may need to be inferred from DOM attributes), profile creation date |
| **Complexity** | Low |
| **Risk Level** | Low -- read-only page scrape |
| **Recommendation** | Playwright scrape of profile picker. Cache profile data to minimize scraping frequency. Extract DOM IDs or data attributes for stable profile identification |

### 3. `getProfileSettings(profileId) -> Settings`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (scrape account settings page) |
| **API Accessibility Verdict** | Level 0 -- No known API endpoint for settings |
| **Approach** | Navigate to paramountplus.com/account, scrape parental controls section to read: parental controls enabled/disabled, current rating restriction level, live TV lock status, PIN existence |
| **API Alternative** | None. All settings are web-UI-only |
| **Auth Required** | Session cookies. PIN may be required to view certain settings |
| **Data Available** | Parental controls toggle state, rating restriction level, live TV lock toggle, profile Kids/Standard type |
| **Data NOT Available** | PIN value, per-profile maturity details (account-wide settings only), viewing history data |
| **Complexity** | Low-Medium |
| **Risk Level** | Low -- read-only page scrape |
| **Recommendation** | Playwright scrape of account page. Note: settings are account-wide, not per-profile. The "profile settings" concept maps to the account-level parental controls plus the profile's Kids/Standard type |

### 4. `setContentRestrictions(profileId, maturityLevel)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (required) |
| **API Accessibility Verdict** | Level 0 -- No API exists, even unofficially. Browser automation is the only path |
| **Approach** | Navigate to paramountplus.com/account > Parental Controls section > adjust the rating slider to the desired level (All Kids / Older Kids / Teens / Adult). If parental controls are not yet enabled, first toggle them on (requires account password) and set a PIN |
| **API Alternative** | None |
| **Auth Required** | Session cookie + account password (to enable/modify parental controls). No MFA |
| **Data Available** | Current restriction level (before and after change) |
| **Data NOT Available** | N/A |
| **Complexity** | Medium |
| **Risk Level** | Medium -- involves password entry and settings mutation. Account-wide scope means changes affect ALL profiles |
| **Recommendation** | Playwright with password handling. Critical caveat: this is an ACCOUNT-WIDE setting, not per-profile. Changing the maturity level for one child affects content gating for all profiles on the account. For per-child enforcement, Phosra must rely on Kids profile type (Younger/Older) rather than the account-wide slider |

### 5. `setTitleRestrictions(profileId, titles[])`

| Aspect | Detail |
|---|---|
| **Implementation** | Not possible |
| **API Accessibility Verdict** | N/A -- Feature does not exist on the platform |
| **Approach** | N/A |
| **API Alternative** | N/A |
| **Auth Required** | N/A |
| **Data Available** | N/A |
| **Data NOT Available** | N/A |
| **Complexity** | N/A |
| **Risk Level** | N/A |
| **Recommendation** | Return `UnsupportedOperationError`. Paramount+ does not support per-title blocking. The only content restriction mechanism is the account-wide rating slider. Phosra should clearly communicate this limitation to parents: "Paramount+ does not allow blocking individual shows. Content is filtered by rating level only." |

### 6. `setProfilePIN(profileId, pin)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright |
| **API Accessibility Verdict** | Level 0 -- No API exists. Browser automation is the only path |
| **Approach** | Navigate to paramountplus.com/account > Parental Controls section > enter or change the 4-digit PIN. If parental controls are not enabled, enable them first (requires account password). To change an existing PIN, use "Forgot PIN" flow (requires account password) |
| **API Alternative** | None |
| **Auth Required** | Session cookie + account password (for initial setup or PIN reset) |
| **Data Available** | PIN change confirmation |
| **Data NOT Available** | Current PIN value (cannot be read, only set/changed) |
| **Complexity** | Medium |
| **Risk Level** | Medium -- PIN is account-wide. Changing it affects all profile switching and content access gates |
| **Recommendation** | Playwright with password handling. Store the Phosra-set PIN securely. Critical: this is a SINGLE account-wide PIN, not per-profile. If Phosra manages the PIN, it must communicate the current PIN to the parent for their own use |

### 7. `supportsNativeScreenTime() -> false`

| Aspect | Detail |
|---|---|
| **Implementation** | Static return |
| **API Accessibility Verdict** | N/A |
| **Approach** | Return `false` |
| **API Alternative** | N/A |
| **Auth Required** | N/A |
| **Data Available** | N/A |
| **Data NOT Available** | N/A |
| **Complexity** | None |
| **Risk Level** | None |
| **Recommendation** | Return false. Paramount+ has zero native screen time features. Autoplay is disabled by default on Kids profiles, which is a passive measure but not active screen time management. Document screen time enforcement strategy separately |

### 8. `getWatchHistory(profileId) -> WatchEntry[]`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (scrape Continue Watching / Watch History page) |
| **API Accessibility Verdict** | Level 0 -- No known API endpoint for viewing history. Unlike Netflix (Shakti viewingactivity endpoint), no internal API has been documented for Paramount+ watch history |
| **Approach** | Switch to the target profile, navigate to home page or Watch History section, scrape the "Keep Watching" carousel for title names and progress indicators |
| **API Alternative** | None discovered |
| **Auth Required** | Session cookie + profile switch (may require PIN to switch to Kids profile if coming from Standard) |
| **Data Available** | Title name, episode/season info, playback progress (percentage or timestamp) |
| **Data NOT Available** | Date/time watched, watch duration per session, historical log, total viewing time, export |
| **Complexity** | Medium |
| **Risk Level** | Low -- read-only scrape. But data quality is very poor |
| **Recommendation** | Playwright scrape as fallback, but set expectations: Paramount+ viewing history is extremely sparse compared to Netflix. No timestamps, no dates, no duration. Phosra can only report "what has been partially/fully watched" not "when" or "for how long." This severely limits the value of Phosra's monitoring for Paramount+ |

### 9. `lockProfile(profileId) / unlockProfile(profileId)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright |
| **API Accessibility Verdict** | Level 0 -- No API exists. Browser automation is the only path |
| **Approach** | Lock: Change the account PIN to a Phosra-managed value, preventing the child from entering it. The child cannot switch profiles or access restricted content without the PIN. Unlock: Restore the original PIN or communicate the new PIN to the parent. Alternative: Toggle parental controls off/on (requires account password, more disruptive) |
| **API Alternative** | None |
| **Auth Required** | Session cookie + account password (for PIN change or toggle) |
| **Data Available** | PIN change confirmation |
| **Data NOT Available** | Current active viewing sessions |
| **Complexity** | Medium-High |
| **Risk Level** | High -- PIN is account-wide. Changing it affects ALL users, not just the target child. If the parent is also watching with PIN-gated content, they will be locked out too |
| **Recommendation** | Use with extreme caution. The account-wide PIN is a blunt instrument for per-child screen time enforcement. Document the limitation clearly: locking one child's access may disrupt the entire family's Paramount+ experience. Consider deferring to device-level controls (iOS Screen Time, Android Digital Wellbeing) as a more surgical alternative |

### 10. `createKidsProfile(name, maturityLevel)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright |
| **API Accessibility Verdict** | Level 0 -- No API exists for profile creation. Browser automation is the only path |
| **Approach** | Navigate to profile picker > Add Profile > enter name > toggle Kids Mode on > select age range (Younger Kids or Older Kids) > save. If parental controls are active, the account PIN is required to create a new profile |
| **API Alternative** | None |
| **Auth Required** | Session cookie + PIN (if parental controls active) |
| **Data Available** | Profile creation confirmation, new profile visible in picker |
| **Data NOT Available** | Internal profile ID (must be inferred from DOM) |
| **Complexity** | Medium |
| **Risk Level** | Low -- additive action |
| **Recommendation** | Playwright. Verify profile count before attempting (max 6). Map Phosra maturity level to Paramount+ Kids tier: "all_ages" -> Younger Kids, "ages_7_plus" -> Older Kids. Note: there is no "Teens" Kids profile option -- only Younger Kids and Older Kids. Teen-level content gating must use the account-wide rating slider |

---

## Overall Architecture

### Recommended Architecture

```
Phosra Paramount+ Adapter
  |
  +-- Session Manager
  |     +-- Login via Playwright (stealth mode)
  |     +-- Cookie extraction & caching
  |     +-- Re-auth detection & handling
  |     +-- No MFA handler needed (simpler than Netflix)
  |
  +-- Read Layer (Playwright scrape -- no API available)
  |     +-- listProfiles() -- scrape profile picker
  |     +-- getProfileSettings() -- scrape account page
  |     +-- getWatchHistory() -- scrape Continue Watching
  |     All reads require browser context (no API shortcut)
  |
  +-- Write Layer (Playwright)
  |     +-- setContentRestrictions() -- account-wide slider
  |     +-- setProfilePIN() -- account-wide PIN
  |     +-- lockProfile() / unlockProfile() -- PIN change
  |     +-- createKidsProfile() -- profile wizard
  |     Requires: password handling for parental control changes
  |
  +-- Screen Time Enforcer
  |     +-- Monitor via Continue Watching scrape (very limited)
  |     +-- Lock via account PIN change (account-wide, blunt)
  |     +-- Recommendation: defer to device-level controls
  |     No native Paramount+ support -- Phosra-managed
  |
  +-- NOT SUPPORTED
        +-- setTitleRestrictions() -- platform does not offer
        +-- Per-profile maturity (account-wide only)
        +-- Per-channel live TV filtering (binary only)
```

### Development Effort Estimate

| Component | Effort | Priority |
|---|---|---|
| Session Manager (login + cookie cache) | 1-2 days | P0 |
| Read Layer (Playwright scrape for profiles, settings, history) | 2-3 days | P0 |
| Write Layer (Playwright for parental controls, PIN, Kids profiles) | 2-3 days | P1 |
| Screen Time Enforcer (limited -- defer to device-level) | 1 day | P2 |
| Testing & hardening | 2-3 days | P1 |
| **Total** | **8-12 days** | |

**Note:** Development is simpler than Netflix (no MFA, no Falcor protocol, no MSL tokens) but read operations are less reliable (no API, all scraping) and enforcement is less granular (account-wide controls).

### Detection Vectors and Mitigations

| Vector | Risk Level | Mitigation |
|---|---|---|
| Headless browser detection | Medium | Use Playwright stealth plugin (playwright-extra) |
| Request frequency | Low | Rate limit to 1 action per 5-10 seconds, cache aggressively |
| Login from new device/IP | Low-Medium | Maintain persistent browser profile/cookies |
| Unusual navigation patterns | Low | Randomize delays, follow natural page flow |
| CAPTCHA on login | Low | Monitor for CAPTCHA challenges, implement solver or user-assisted flow |
| Google Cloud Armor WAF | Low-Medium | Standard stealth mode, residential proxy if needed |

### Terms of Service Summary

Paramount+ Terms of Use (via `legal.paramount.com/us/en/pplus/terms-of-use`) prohibit:

1. **Automated access:** "Use of any robot, bot, scraper, site search/retrieval application, proxy, VPN or other manual or automatic device, method, system or process to access, retrieve, index, 'data mine', or in any way reproduce or circumvent the navigational structure or presentation of the Service"
2. **Reverse engineering:** Modifying, interfering with, or altering any portion of the video player or underlying technology
3. **Commercial use:** Building a business or enterprise utilizing the Service

**Risk assessment:** Medium. Lower than Netflix because:
- Paramount+ has not demonstrated aggressive bot detection or account suspension for automation
- No password sharing crackdown in effect (unlike Netflix)
- Standard Google Cloud Armor WAF is easier to navigate than Netflix's custom detection
- No known precedent of Paramount+ blocking parental control tool access

**However:** All browser automation constitutes a ToS violation. Account suspension remains a theoretical risk.
