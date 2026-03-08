# Apple TV+ Adapter Assessment for Phosra

**Platform:** Apple TV+ (rebranded to "Apple TV" October 2025)
**Assessment Date:** 2026-03-01
**Existing Adapter:** None (new platform)
**Recommended Approach:** Dual-path (Screen Time API for device-level + Playwright for web-level)

---

## API Accessibility Context

**Before evaluating individual adapter methods, it is critical to understand the unique API landscape of Apple TV+:**

Apple TV+ exists within Apple's tightly controlled ecosystem. Unlike Netflix or Peacock where the only integration path is browser automation against a web app, Apple offers a **partial sanctioned integration path** via the Screen Time API (FamilyControls, ManagedSettings, DeviceActivity frameworks) -- but this operates at the device/OS level, not the content level.

There is **no public API for Apple TV+ account management, parental control settings, or viewing history**. The web player at tv.apple.com has its own independent parental controls system that does not sync with device-level controls.

### What This Means for Each Method

| Access Pattern | API Accessibility | Stability | ToS Status |
|---|---|---|---|
| **Read/Write via Screen Time API (iOS)** | Official API with FamilyControls entitlement | Stable -- Apple-maintained, versioned | **Compliant** -- requires entitlement approval |
| **Read via web scraping (tv.apple.com)** | No API -- browser automation required | Fragile -- Apple changes web UI without notice | Violation of Apple Media Services ToS |
| **Write via Playwright (tv.apple.com)** | No API -- browser automation required | Fragile -- Apple ID 2FA makes automation very difficult | Violation of Apple Media Services ToS |
| **Authentication (Apple ID)** | No OAuth for Apple TV+ data | Apple ID 2FA is mandatory and robust | Credential-based access violates ToS |

### Industry Benchmark

No parental control app integrates directly with Apple TV+ content controls. The industry standard is:
- **Device-level:** Apps like Canopy and Bark use Apple's Screen Time API (FamilyControls entitlement) for iOS device-level time limits and app blocking
- **Content-level:** No third party can read or modify Apple TV+ rating filters, viewing history, or profile settings. All platforms defer to Apple's native Screen Time for content restrictions

### Unique Apple Ecosystem Risk

**Account suspension for Apple ID affects the ENTIRE Apple ecosystem** -- iCloud, App Store, Apple Music, iMessage, Photos, and more. This is a qualitatively different risk than Netflix (loss of streaming service only) or Peacock (loss of one streaming service). Automated access that triggers Apple ID security could cause catastrophic user impact.

---

## Adapter Method Assessment

### 1. `authenticate(credentials) -> Session`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright browser automation (web) or Screen Time API authorization (iOS) |
| **API Accessibility Verdict** | **Level 0 (web) / Level 4 (iOS Screen Time)** -- No OAuth for Apple TV+ data; Screen Time API uses FamilyControls authorization |
| **Approach** | **Web path:** Navigate to tv.apple.com, sign in with Apple ID + password, handle mandatory 2FA (6-digit code to trusted device), extract session cookies. **iOS path:** Request FamilyControls authorization (user grants permission on device). |
| **API Alternative** | Sign in with Apple (OAuth) exists but provides identity only -- no Apple TV+ data access. Not useful for this purpose. |
| **Auth Required** | Apple ID email + password + 2FA code (web); FamilyControls entitlement + user authorization (iOS) |
| **Data Available** | Web: session cookies for tv.apple.com. iOS: FamilyControls authorization status |
| **Data NOT Available** | No API tokens, no persistent session tokens for Apple TV+ data access |
| **Complexity** | **High (web)** -- Apple ID 2FA is mandatory and requires a code from the user's trusted device, making fully automated login nearly impossible without user interaction. **Medium (iOS)** -- FamilyControls authorization is a one-time prompt. |
| **Risk Level** | **Critical (web)** -- Apple ID security flags unusual logins aggressively; account lock risk is high. **Low (iOS)** -- Sanctioned API path. |
| **Recommendation** | **Strongly prefer iOS Screen Time API path.** For web automation, require user to manually provide 2FA code (cannot be automated). Cache web session as long as possible to minimize re-authentication. |

### 2. `listProfiles() -> Profile[]`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (web) or Apple TV app profile enumeration (device) |
| **API Accessibility Verdict** | **Level 0 (Walled Garden)** -- No API endpoint exists for listing Apple TV profiles. No unofficial API discovered. |
| **Approach** | **Web path:** Navigate to tv.apple.com account settings page, scrape profile information if visible. Note: the web player is primarily single-user and may not expose the full managed profile list. **Device path:** The Apple TV app shows profiles, but there is no API to enumerate them programmatically. |
| **API Alternative** | None. Screen Time API provides device-level app data but does not enumerate Apple TV profiles. |
| **Auth Required** | Apple ID session (web) |
| **Data Available** | Profile name, kid designation (if visible in settings UI) |
| **Data NOT Available** | Profile GUIDs, maturity level per profile, detailed profile metadata |
| **Complexity** | **High** -- The web player does not have a clear profile listing page like Netflix's profile picker |
| **Risk Level** | **Medium** -- Read-only scraping, but Apple ID session required |
| **Recommendation** | This method has limited utility for Apple TV+ because the platform uses Family Sharing (separate Apple IDs) rather than in-account profiles. Phosra should map children to Apple IDs in the Family Sharing group, not to managed profiles. For managed profiles on the Apple TV device, no practical remote enumeration path exists. |

### 3. `getProfileSettings(profileId) -> Settings`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (web parental controls page) |
| **API Accessibility Verdict** | **Level 0 (Walled Garden)** -- No API endpoint exists for reading parental control settings |
| **Approach** | Navigate to tv.apple.com > Account > Settings > Parental Controls. Read the current state of content restrictions (enabled/disabled), rating levels for TV shows and movies. Requires entering the 4-digit web passcode to view settings. |
| **API Alternative** | None |
| **Auth Required** | Apple ID session + web parental controls passcode |
| **Data Available** | Content restrictions on/off, TV show rating level, movie rating level |
| **Data NOT Available** | Per-profile settings (web is single-user), device-level Screen Time settings, managed profile restrictions |
| **Complexity** | **Medium** -- Straightforward page navigation, but passcode entry required |
| **Risk Level** | **Medium** -- Read-only on web, but requires active session |
| **Recommendation** | Implement as Playwright scrape of tv.apple.com settings page. Store the web passcode securely to automate passcode entry. Note: this only reads web-specific settings, not device-level settings. |

### 4. `setContentRestrictions(profileId, maturityLevel)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (web) or Screen Time API (iOS device-level) |
| **API Accessibility Verdict** | **Level 0 (web) / Level 4 (iOS)** |
| **Approach** | **Web path:** Navigate to tv.apple.com > Settings > Parental Controls > enter passcode > change TV show and/or movie rating level > save. **iOS path:** Use ManagedSettings framework to set Content & Privacy Restrictions on the child's device, including the maximum allowed rating for movies and TV shows. |
| **API Alternative** | Screen Time API (ManagedSettings) is the sanctioned alternative for device-level restrictions |
| **Auth Required** | Web: Apple ID session + web passcode. iOS: FamilyControls authorization |
| **Data Available** | TV show rating level (TV-Y through TV-MA), movie rating level (G through NC-17) -- settable independently |
| **Data NOT Available** | Per-title blocking (not supported by Apple TV+), content descriptor filtering |
| **Complexity** | **Medium (web)** -- Simple form interaction behind passcode. **Low (iOS)** -- Direct API call via ManagedSettings. |
| **Risk Level** | **Medium (web)** -- ToS violation, automation detectable. **Low (iOS)** -- Sanctioned API. |
| **Recommendation** | **Prefer iOS Screen Time API for device-level content restrictions.** Use web automation only for web-specific controls. The Screen Time API approach is the only method that is both reliable and ToS-compliant. |

### 5. `setTitleRestrictions(profileId, titles[])`

| Aspect | Detail |
|---|---|
| **Implementation** | **Not possible** |
| **API Accessibility Verdict** | **N/A -- Feature does not exist** |
| **Approach** | Apple TV+ does not offer per-title blocking. There is no mechanism -- web, device, or API -- to block a specific movie or TV show by title. Restrictions are rating-based only. |
| **API Alternative** | None |
| **Auth Required** | N/A |
| **Data Available** | N/A |
| **Data NOT Available** | Per-title block list (feature does not exist) |
| **Complexity** | N/A |
| **Risk Level** | N/A |
| **Recommendation** | Return `UnsupportedOperationError`. Document this as a platform limitation. Phosra can approximate title-level control only by adjusting the rating threshold (e.g., to block a TV-MA show, set the rating limit to TV-14), but this is a blunt instrument that affects all content at that rating level. |

### 6. `setProfilePIN(profileId, pin)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (web passcode) |
| **API Accessibility Verdict** | **Level 0 (Walled Garden)** -- No API for PIN/passcode management |
| **Approach** | Navigate to tv.apple.com > Settings > Parental Controls. The web parental controls have a 4-digit passcode that can be set or changed. On initial setup, the user creates a passcode. To change it, the current passcode must be entered first. A recovery email can be set. |
| **API Alternative** | None. Screen Time passcode on iOS is separate and managed through Settings, not through any third-party API. |
| **Auth Required** | Apple ID session + current web passcode (to change) |
| **Data Available** | Passcode set/change, recovery email set |
| **Data NOT Available** | Cannot read the current passcode; can only set/change it |
| **Complexity** | **Medium** |
| **Risk Level** | **Medium** -- Changing the passcode is a sensitive operation |
| **Recommendation** | Implement via Playwright for the web passcode only. Note that this passcode is distinct from the Screen Time passcode (device) and the Apple TV restrictions passcode (tvOS device). Phosra would need to manage multiple passcodes for comprehensive control. |

### 7. `supportsNativeScreenTime() -> boolean`

| Aspect | Detail |
|---|---|
| **Implementation** | Static return |
| **API Accessibility Verdict** | N/A |
| **Value** | `true` (conditionally) -- Apple TV+ itself has no in-service screen time features, but Apple's ecosystem provides robust device-level screen time via Screen Time. This is the only major streaming platform where the answer is conditionally true. |
| **Alternative Enforcement** | Screen Time API (FamilyControls, ManagedSettings, DeviceActivity) on iOS provides app-level time limits, downtime scheduling, and usage monitoring -- all applicable to the Apple TV app. |
| **Complexity** | None |
| **Risk Level** | None |
| **Recommendation** | Return `true` with context: "Native screen time available via Apple Screen Time (device-level, iOS/macOS/tvOS). Not available within Apple TV+ web player." The Screen Time API is the strongest sanctioned integration path for Phosra on any streaming platform. |

### 8. `getWatchHistory(profileId) -> WatchEntry[]`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (web -- very limited) or Screen Time API (device -- app usage only) |
| **API Accessibility Verdict** | **Level 0 (Walled Garden)** -- No API for viewing history; extremely sparse data even via scraping |
| **Approach** | **Web path:** Scrape the "Continue Watching" row on tv.apple.com home page. This shows only in-progress titles, not a complete history. **iOS path:** DeviceActivity framework can monitor Apple TV app usage time but not specific content titles. |
| **API Alternative** | None for content-level history. Screen Time DeviceActivity provides app-level usage duration only. |
| **Auth Required** | Apple ID session (web); FamilyControls authorization (iOS) |
| **Data Available** | Continue Watching titles (web), total Apple TV app usage time (iOS DeviceActivity) |
| **Data NOT Available** | Complete historical viewing log, watch timestamps, watch duration per title, specific content titles watched (iOS), episode/season detail for completed shows |
| **Complexity** | **Medium (web scrape)** / **Low (iOS DeviceActivity)** |
| **Risk Level** | **Low-Medium** -- Read-only operations |
| **Recommendation** | This is the weakest capability for Apple TV+. The web provides almost no historical viewing data, and the iOS Screen Time API provides time-in-app but not content-specific information. Phosra should set expectations accordingly: meaningful viewing history reports are not achievable for Apple TV+ with current access methods. Use DeviceActivity for app-level usage tracking as the best available option. |

### 9. `lockProfile(profileId) / unlockProfile(profileId)`

| Aspect | Detail |
|---|---|
| **Implementation** | Screen Time API (iOS -- preferred) or Playwright (web -- limited) |
| **API Accessibility Verdict** | **Level 4 (iOS Screen Time API)** -- ManagedSettings can block/allow the Apple TV app |
| **Approach** | **iOS path (preferred):** Use ManagedSettings to add the Apple TV app to the blocked list, or use DeviceActivity schedules to block the app during specific time windows. This effectively "locks" the child's access to Apple TV+. **Web path:** Change the web parental controls to "Don't Allow" for all ratings, effectively hiding all content. Requires passcode. |
| **API Alternative** | Screen Time API is the primary (and sanctioned) approach |
| **Auth Required** | FamilyControls authorization (iOS); Apple ID session + web passcode (web) |
| **Data Available** | App block/allow status (iOS); content restriction level (web) |
| **Data NOT Available** | Profile-level lock (Apple TV+ does not have Netflix-style profile locks) |
| **Complexity** | **Low (iOS)** -- Direct API call. **Medium (web)** -- Playwright with passcode entry. |
| **Risk Level** | **Low (iOS)** -- Sanctioned API. **Medium (web)** -- ToS violation. |
| **Recommendation** | **Use Screen Time API on iOS as the primary lock/unlock mechanism.** This is the most reliable and ToS-compliant approach. The iOS ManagedSettings framework can block the Apple TV app entirely or enforce time-based restrictions. For web-only enforcement, toggle the content restriction to "Don't Allow" all content as a blunt lock mechanism. |

### 10. `createKidsProfile(name, maturityLevel)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (Apple TV app device management or Apple ID Family Sharing web pages) |
| **API Accessibility Verdict** | **Level 0 (Walled Garden)** -- No API for profile or Apple ID creation |
| **Approach** | **Managed profile (tvOS 26.2+):** On the Apple TV device, navigate to Settings > Profiles > Add New Profile > Create Profile > enter name, set rating, mark as Kid. This does not require an Apple Account. **Child Apple ID:** Creating a child Apple ID requires the Family Sharing organizer to go through Apple's child account creation flow, which involves age verification and parental consent. This is a complex multi-step process. |
| **API Alternative** | None. Apple does not provide an API for creating Apple IDs or managed profiles. |
| **Auth Required** | Apple ID of Family Sharing organizer + 2FA |
| **Data Available** | Profile creation confirmation |
| **Data NOT Available** | Programmatic profile creation -- this must go through Apple's UI |
| **Complexity** | **High** -- Multi-step process with 2FA, consent flows, and Apple's proprietary UI |
| **Risk Level** | **High** -- Creating Apple IDs or profiles programmatically is a highly sensitive operation in Apple's ecosystem |
| **Recommendation** | Do NOT attempt to automate child Apple ID creation -- this involves identity verification and legal consent steps that should not be automated. For managed profiles on the Apple TV device, automation would require physical device access or tvOS-level automation, which is impractical remotely. Recommend guiding parents through manual profile creation with Phosra documentation/wizards instead. |

---

## Overall Architecture

### Recommended Architecture Diagram

```
Phosra Apple TV+ Adapter
  |
  +-- iOS Native Companion App (SANCTIONED PATH)
  |     |
  |     +-- FamilyControls Authorization
  |     |     +-- One-time user authorization
  |     |     +-- Entitlement approved by Apple
  |     |
  |     +-- ManagedSettings (Write Layer)
  |     |     +-- Block/allow Apple TV app
  |     |     +-- Set content rating restrictions (device-level)
  |     |     +-- Time window enforcement
  |     |
  |     +-- DeviceActivity (Monitor Layer)
  |     |     +-- Monitor Apple TV app usage time
  |     |     +-- Schedule-based triggers (Downtime equivalent)
  |     |     +-- Usage threshold alerts
  |     |
  |     +-- Screen Time Enforcer
  |           +-- Daily time limits for Apple TV app
  |           +-- Bedtime/Downtime scheduling
  |           +-- Lock app when limit reached
  |           +-- Notify parent
  |
  +-- Web Automation Layer (UNSANCTIONED, SUPPLEMENTAL)
  |     |
  |     +-- Session Manager
  |     |     +-- Apple ID login via Playwright (requires user-provided 2FA code)
  |     |     +-- Session cookie caching (extended TTL)
  |     |     +-- Re-auth detection
  |     |
  |     +-- Read Layer (Playwright scraping)
  |     |     +-- getProfileSettings() -- web parental control state
  |     |     +-- getWatchHistory() -- Continue Watching scrape (very limited)
  |     |
  |     +-- Write Layer (Playwright)
  |           +-- setContentRestrictions() -- web rating changes
  |           +-- setProfilePIN() -- web passcode management
  |           +-- lockProfile() -- set restrictions to "Don't Allow"
  |
  +-- NOT SUPPORTED
        +-- setTitleRestrictions() -- platform does not offer this
        +-- createKidsProfile() -- too complex/risky to automate
        +-- Viewing history detail -- platform does not expose this
```

### Development Effort Estimate

| Component | Effort | Priority | Notes |
|---|---|---|---|
| iOS Companion App (FamilyControls scaffold) | 5-7 days | P0 | Requires Apple Developer Program membership + FamilyControls entitlement application |
| Screen Time Integration (ManagedSettings + DeviceActivity) | 3-5 days | P0 | Core enforcement mechanism; direct API calls |
| Apple entitlement approval process | 2-4 weeks (Apple review) | P0 (blocker) | FamilyControls is a privileged entitlement; approval timeline is Apple-dependent |
| Web Session Manager (Playwright + 2FA handling) | 3-4 days | P1 | 2FA makes this significantly harder than Netflix/Peacock |
| Web Read Layer (settings scrape, Continue Watching) | 1-2 days | P1 | Limited data available |
| Web Write Layer (rating changes, passcode) | 2-3 days | P2 | Supplemental to iOS path |
| Testing & hardening | 3-4 days | P1 | Cross-device testing required (iOS + web) |
| **Total** | **17-25 days** + Apple approval | | Longer than Netflix due to iOS app development + approval process |

### Detection Vectors and Mitigations

| Vector | Risk Level | Mitigation |
|---|---|---|
| Apple ID 2FA challenge | **Critical** | Cannot bypass -- require user to provide 2FA code for web automation; prefer iOS Screen Time API path which avoids this |
| Apple ID suspicious login detection | **High** | Maintain persistent session; minimize re-authentication; use user's own network when possible |
| Headless browser detection (tv.apple.com) | **Medium** | Playwright stealth mode; Apple's detection is less documented than Netflix's but likely robust |
| Rate limiting on Apple ID auth | **Medium** | Apple locks accounts after repeated failed attempts; never retry failed auth automatically |
| FamilyControls entitlement rejection | **Medium** | Submit clear, well-documented application to Apple; emphasize child safety purpose |
| Web UI changes breaking selectors | **Medium** | Robust selector strategy; automated regression testing |
| Apple ecosystem account suspension | **Critical** | This is the highest-risk outcome -- losing an Apple ID affects everything. Never use aggressive automation; always have user consent and fallback plan |

### Terms of Service Summary

**Apple Media Services Terms and Conditions (applicable to Apple TV+):**

1. **Automated access prohibition:** "You may not use any software, device, automated process, or any similar or equivalent manual process to scrape, copy, or perform measurement, analysis, or monitoring of, any portion of the Content or Services."

2. **Software restriction:** "You may access our Services only using Apple's software, and may not modify or use modified versions of such software."

3. **Bot/script prohibition:** "You may not manipulate play counts, downloads, ratings, or reviews via any means -- such as (i) using a bot, script, or automated process."

4. **Reverse engineering:** The Apple terms prohibit users from attempting to "reverse-engineer, disassemble, attempt to derive the source code of, modify, or create derivative works."

5. **Enforcement:** Apple reserves authority to "monitor your use of the Services and Content to ensure that you are following these Usage Rules," with violations constituting "a material breach of this Agreement."

**Key distinction from Netflix:** While Netflix ToS violations risk loss of a streaming subscription, Apple ToS violations risk loss of the user's entire Apple ecosystem (Apple ID suspension). This dramatically increases the risk calculus for web automation.

**Screen Time API path is ToS-compliant** when used with an approved FamilyControls entitlement. This is the only integration approach that does not violate Apple's terms.
