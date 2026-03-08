# Apple TV+ — Phosra Integration Notes

**Platform:** Apple TV+ (rebranded to "Apple TV" October 2025)
**Assessment Date:** 2026-03-01
**Integration Priority:** Tier 1 (adapter already exists)
**Recommended Approach:** Guide-based (setup instructions) + iOS Screen Time API (device-level enforcement)

---

## 1. Phosra Rule Category Coverage

Of Phosra's 45 enforcement rule categories, Apple TV+ can enforce the following:

### Fully Enforceable (via Apple Screen Time API — iOS native app only)

| Rule Category | Apple Feature | Enforcement Method |
|---|---|---|
| `screen_time_limit` | Screen Time daily app limits | Screen Time API (ManagedSettings) — set daily time limit for Apple TV app |
| `bedtime_schedule` | Screen Time Downtime scheduling | Screen Time API (DeviceActivity) — block app during specified hours |
| `content_rating_filter` | Screen Time Content & Privacy Restrictions | Screen Time API (ManagedSettings) — device-level rating tiers (4+, 9+, 12+, 17+) |
| `parental_consent_gate` | Apple ID 2FA + Family Sharing Ask to Buy | Built-in (no Phosra action needed) |
| `age_gate` | Apple's proprietary age tiers (4+, 9+, 12+, 17+) act as age gate | Screen Time API (ManagedSettings) |

### Partially Enforceable (Phosra-managed workaround)

| Rule Category | Gap | Phosra Workaround |
|---|---|---|
| `screen_time_report` | Screen Time provides app-level usage time, not content-specific | Aggregate DeviceActivity data into Phosra reports (iOS only); no web equivalent |
| `parental_event_notification` | No native alerts within Apple TV+ | DeviceActivity threshold alerts for app usage; Phosra generates notifications from usage triggers (iOS only) |
| `profile_lock` | Web has a 4-digit passcode; no Netflix-style per-profile lock | Playwright for web passcode management; Screen Time API to block Apple TV app entirely on device |
| `autoplay_control` | Device-only setting (Settings > Apps > TV > Play Next Episode); no web autoplay setting | Guide-based — instruct parents to toggle on Apple TV device; not automatable on web |
| `viewing_history_access` | No comprehensive history — only "Continue Watching" on web (no timestamps, no duration) | Scrape Continue Watching titles via Playwright (very sparse data); DeviceActivity provides app usage time only |
| `purchase_control` | Ask to Buy exists via Family Sharing for child Apple IDs | Built-in for child accounts; Phosra guides setup |

### Not Enforceable on Apple TV+

| Rule Category | Reason |
|---|---|
| `title_restriction` | Apple TV+ does NOT support per-title blocking — restrictions are rating-based only |
| `social_control` | Apple TV+ has no social features (no messaging, comments, friends) |
| `location_tracking` | Not applicable to streaming |
| `web_filtering` | Not applicable (content is curated, not user-generated) |
| `safe_search` | Not applicable |
| `app_control` | Not applicable (Apple TV+ is one service, not an app store) |
| `custom_blocklist` / `custom_allowlist` | No per-title blocking mechanism exists |
| `commercial_data_ban` | Not controllable from consumer side |
| `algorithmic_audit` | Not controllable from consumer side |

---

## 2. Enforcement Strategy

### Primary Approach: Guide-Based Setup Instructions

Given Apple's closed ecosystem and the severe risk of Apple ID suspension from automation, the **primary integration for most families is guide-based** — Phosra provides personalized setup instructions rather than automation:

```
1. Parent connects Apple TV+ in Phosra dashboard
2. Phosra generates personalized setup instructions based on:
   a. Child's age -> recommended Apple TV+ rating tier (4+, 9+, 12+, 17+)
   b. Family's device mix (Apple TV 4K, iPhone, iPad, Mac, web only)
   c. Phosra's active rules -> mapped to Screen Time + Apple TV settings
3. Step-by-step walkthrough for:
   a. Creating kid managed profiles on Apple TV device (tvOS 26.2+)
   b. Configuring Screen Time settings on child's iOS device
   c. Setting content restrictions per profile (using Apple's 4+, 9+, 12+, 17+ tiers)
   d. Enabling Ask to Buy in Family Sharing
   e. Setting up the web parental controls passcode at tv.apple.com
4. Phosra periodically reminds parent to verify settings are still in place
```

**Why guide-based is primary:**
- Zero risk of Apple ID suspension
- No ToS violation
- Works across all Apple devices (not just iOS)
- Parents retain full control through Apple's native UI
- No credentials to store

### Device-Level Enforcement: Screen Time API (iOS native app)

Apple's Screen Time API is the **only sanctioned third-party integration point** for controlling Apple TV+ access. This requires a native iOS companion app with Apple's FamilyControls entitlement.

```
AUTHORIZE   FamilyControls         -> One-time user authorization on device
SET         app time limit         -> ManagedSettings (daily limit for Apple TV app)
SET         downtime schedule      -> ManagedSettings (block app during specified hours)
SET         content restrictions   -> ManagedSettings (device-level rating tier: 4+, 9+, 12+, 17+)
BLOCK/ALLOW Apple TV app           -> ManagedSettings (add/remove from blocked list)
MONITOR     app usage duration     -> DeviceActivity (time-in-app, NOT content titles)
TRIGGER     usage threshold alert  -> DeviceActivity schedule triggers
```
- ToS-compliant — Apple approves FamilyControls entitlements for legitimate parental control apps
- Stable, versioned, Apple-maintained API
- iOS/macOS/tvOS only — does not extend to web
- Requires Apple Developer Program membership + FamilyControls entitlement approval (2-4 week review)
- **Limitation:** Cannot see what specific content was watched — only total app usage time

### Supplemental: Web Automation (Playwright — very limited, high risk)

```
READ  web parental control state  -> Playwright scrape of tv.apple.com settings
READ  Continue Watching titles    -> Playwright scrape of tv.apple.com home (very sparse data)
SET   web content rating level    -> Playwright + web passcode entry
SET   web parental passcode       -> Playwright + current passcode required
LOCK  web access (blunt)          -> Set restrictions to "Don't Allow" for all ratings
```
- Requires Apple ID session (cookie-based after login + mandatory 2FA)
- 2FA cannot be automated — user must provide 6-digit code from trusted device each session
- Web controls are account-wide (not per-profile)
- Web and device controls are **independent** — changes on one do not propagate to the other
- **Very low automation feasibility** due to Apple's closed ecosystem
- Rate limit: max 1 web session per day

### Screen Time Enforcement Flow (iOS — sanctioned path)
```
1. Parent sets daily Apple TV limit in Phosra (e.g., 2 hours)
2. Phosra iOS companion app uses ManagedSettings to set App Limit on Apple TV app
3. DeviceActivity monitors usage and triggers when threshold approaches
4. When limit reached:
   a. Apple TV app automatically blocked by Screen Time (native OS behavior)
   b. Phosra companion app receives DeviceActivity callback
   c. Parent notified via Phosra notification
5. Next day: App Limit resets automatically (Screen Time native behavior)
```

**Advantages over Netflix screen time enforcement:**
- Native OS-level enforcement — child cannot bypass by switching profiles or clearing history
- No 30-minute polling delay — real-time enforcement at the OS level
- Sanctioned by Apple — no ToS violation, no account suspension risk

**Limitations:**
- Device-level only — does not control the web player at tv.apple.com
- No content-level granularity — total app time, not "2 hours kids content + 0 hours teen content"
- Requires iOS companion app with FamilyControls entitlement
- Child must have their own Apple ID in the Family Sharing group

---

## 3. Credential Storage Requirements

Phosra needs to store the following per family connection:

### iOS Screen Time API Path (Preferred — minimal credential storage)

| Credential | Purpose | Sensitivity |
|---|---|---|
| FamilyControls authorization status | Confirm Phosra companion app is authorized | Low |
| Child's device identifier | Map Phosra child to iOS device | Medium |
| Child's Apple ID mapping | Map Phosra child to Apple ID in Family Sharing | Low |

No Apple ID credentials are stored for the Screen Time API path — authorization is granted on-device via FamilyControls.

### Web Automation Path (Supplemental — high-sensitivity credentials)

| Credential | Purpose | Sensitivity |
|---|---|---|
| Apple ID email | Login to tv.apple.com | High |
| Apple ID password | Login (2FA still required every session) | Critical |
| Session cookies | Avoid re-login; extended TTL (weeks) | High (rotate when session expires) |
| Web parental controls passcode (4-digit) | Access/modify web parental controls | Medium |

### Security Considerations
- All credentials must be encrypted at rest (AES-256)
- Session cookies should be stored encrypted with per-user keys
- Apple ID password should never be logged or included in error reports
- **Critical risk distinction:** Apple ID suspension affects the **entire Apple ecosystem** — iCloud, App Store, Apple Music, iMessage, Photos, device activation. This is qualitatively different from Netflix (loss of streaming only). Credential handling carries categorically higher risk.
- 2FA codes are ephemeral (6-digit, sent to trusted device) — no storage needed, cannot be automated
- iOS FamilyControls authorization tokens are managed by the OS keychain — Phosra's companion app does not store them separately
- Consider using Phosra's vault service for credential management
- **Strongly recommend the Screen Time API path** to avoid storing Apple ID credentials entirely

---

## 4. OAuth Assessment

**Apple TV+ does not offer OAuth or any delegated access for parental controls or account data.**

- **Sign in with Apple** exists as an OAuth-like identity mechanism but is **identity only** — it does NOT provide access to Apple TV+ settings, viewing history, or parental controls
- No OAuth scopes exist for Apple TV+ account management
- Sign in with Apple is **not available for children under 13** (child Apple IDs cannot create Sign in with Apple accounts)
- No developer portal or API exists for Apple TV+ account management
- No API keys or partner tokens for parental control access
- The **Apple Video Partner Program** (tvpartners.apple.com) exists but is for content providers, not parental control tools

This means:
- **iOS path (preferred):** Phosra uses FamilyControls authorization (native iOS framework, one-time on-device) — no Apple ID credentials needed
- **Web path (supplemental):** Phosra must store user's Apple ID email + password — user must explicitly consent
- 2FA is mandatory for all Apple IDs — fully automated web login is not possible without user interaction for every new session
- Web sessions persist for extended periods (weeks) with periodic re-authentication, reducing 2FA frequency

---

## 5. Existing Adapter Gap Analysis

There is currently **no existing adapter** for Apple TV+ in the Phosra codebase. Unlike Netflix (which has a research adapter at `web/src/lib/platform-research/adapters/netflix.ts`), Apple TV+ is a greenfield implementation requiring a fundamentally different architecture.

### What Exists (current state)
- Research findings document (`findings.md`)
- Adapter assessment document (`adapter_assessment.md`)
- Rating mapping (`rating_mapping.json`)
- No code adapter exists

### What's Needed (production adapter)

| Feature | Status | Priority | Path |
|---|---|---|---|
| Guide-based setup instruction generator | Missing | P0 | Phosra web dashboard |
| iOS companion app scaffold (FamilyControls) | Missing | P0 | iOS native (Swift/SwiftUI) |
| FamilyControls entitlement application to Apple | Not started | P0 (blocker — 2-4 week Apple review) | Apple Developer Program |
| ManagedSettings integration (app blocking, time limits, content restrictions) | Missing | P0 | Screen Time API |
| DeviceActivity integration (usage monitoring, schedule triggers) | Missing | P0 | Screen Time API |
| Rating tier mapper (Apple 4+/9+/12+/17+ to Phosra tiers) | Missing | P1 | Both paths |
| Web session manager (Apple ID login + 2FA handling) | Missing | P1 | Playwright |
| Web read layer (settings scrape, Continue Watching) | Missing | P2 | Playwright |
| Web write layer (rating changes, passcode management) | Missing | P2 | Playwright |
| Stealth mode configuration for Playwright | Missing | P2 | Playwright |
| Error recovery & retry logic | Missing | P1 | Both paths |

### Architecture Decision

**The Apple TV+ adapter is fundamentally different from the Netflix adapter.**

For Netflix, the adapter is a server-side component using Playwright browser automation (reads via Falcor API, writes via Playwright). For Apple TV+, the primary adapter should be:
1. **Guide-based instructions** generated in the Phosra web dashboard (P0, no native app needed)
2. **Native iOS companion app** using Apple's Screen Time API (P0, requires Apple Developer Program + entitlement)
3. **Optional web automation** as a supplemental layer for web-only families (P2)

### Migration Path
1. Build guide-based setup wizard in Phosra dashboard (no external dependencies)
2. Build iOS companion app with FamilyControls + ManagedSettings + DeviceActivity
3. Submit FamilyControls entitlement to Apple for review (blocking step)
4. Optionally build web automation layer for supplemental web-only enforcement
5. Production adapter lives in `web/src/lib/platform-adapters/apple-tv-plus/` (new directory)

---

## 6. Apple TV+ Platform-Specific Considerations

### Dual Control Surface Problem

Apple TV+ has the most fragmented parental control landscape of any streaming platform:

1. **Web (tv.apple.com):** Own parental controls system (4-digit passcode + rating restrictions). Independent of device settings. Account-wide, not per-user.
2. **Apple TV device (tvOS):** Restrictions passcode + managed profiles with kid designation + content ratings per profile (tvOS 26.2+). Kids Mode added December 2025.
3. **iOS/macOS (Screen Time):** FamilyControls + ManagedSettings + DeviceActivity — the most robust controls, but per-device and require Family Sharing with child Apple ID.
4. **Non-Apple devices (smart TVs, Roku, Fire TV):** Apple TV app available but with limited parental controls dependent on the device's own system.

**Critical:** Setting restrictions on one surface does NOT propagate to others. A child restricted via Screen Time on an iPad can still watch unrestricted content on the web player at tv.apple.com.

### Content Rating System

Apple uses proprietary age tiers that differ from Netflix's maturity levels:

| Apple Tier | Phosra Tier | TV Ratings Included | Movie Ratings Included |
|---|---|---|---|
| **4+** | All Ages | TV-Y, TV-G | G |
| **9+** | Ages 7+ | TV-Y, TV-Y7, TV-G, TV-PG | G, PG |
| **12+** | Ages 13+ | TV-Y through TV-14 | G through PG-13 |
| **17+** | Adults Only | All ratings including TV-MA | All ratings including R, NC-17 |

Screen Time is the primary parental control mechanism, and it uses these same 4+/9+/12+/17+ tiers for content restrictions at the device level.

### Per-Title Blocking: Not Available

Unlike Netflix (which offers per-profile title restrictions), Apple TV+ has **no mechanism to block specific titles by name**. All restrictions are rating-based only. This is a significant gap — Phosra cannot implement `title_restriction` for Apple TV+ by any method.

### Web Player Limitations (tv.apple.com)

The web player is a **very limited experience**:
- No profile switching — single Apple ID session
- No autoplay controls
- Parental controls are independent from device controls
- No comprehensive viewing history page (only Continue Watching)
- No parental control settings exposed beyond basic rating restrictions + 4-digit passcode
- A child accessing tv.apple.com on a non-Apple device **bypasses all Screen Time restrictions**

**Recommendation:** Advise parents to restrict web access to tv.apple.com on non-Apple devices via network-level controls if Screen Time is the primary enforcement mechanism.

### tvOS 26.2 Kids Mode (December 2025)

Recent addition of dedicated Kids Mode on Apple TV device:
- Kid profiles can be created **without an Apple Account**
- Kid profiles show only age-appropriate content and filtered search results
- No access to mature content or account settings
- Closest Apple equivalent to Netflix's Kids profile

---

## 7. API Accessibility Reality Check

### Complete Absence of Direct Apple TV+ API Access

Apple TV+ operates within Apple's tightly controlled ecosystem. There is **no public API for Apple TV+ account management, parental control settings, or viewing history**. The web player at tv.apple.com uses Apple's proprietary web infrastructure (AMP API at `amp-api.media.apple.com` for content catalog, `identity.apple.com` for auth), but none of these provide parental control endpoints.

### Unique Advantage: Screen Time API

Unlike Netflix (fully closed, zero third-party API), Apple provides a **sanctioned device-level API** via Screen Time:
- **FamilyControls:** Authorization framework for parental control apps
- **ManagedSettings:** Set app restrictions, content restrictions, time limits
- **DeviceActivity:** Monitor app usage, schedule-based triggers
- **Requires FamilyControls entitlement** — a privileged entitlement that must be approved by Apple
- **iOS/macOS/tvOS only** — does not extend to web browsers

### What Phosra Wants vs. What's Actually Available

| Phosra Goal | What's Needed | What's Available | Gap |
|---|---|---|---|
| Set content rating level | API to set rating restriction per child | Screen Time API (device-level, iOS) + web parental controls (Playwright, with risk) | Device: sanctioned. Web: ToS violation |
| Enforce screen time limits | Native time limit enforcement | Screen Time API (ManagedSettings) — app-level time limits | **Sanctioned path available (iOS only)** |
| Enforce bedtime/downtime | Schedule-based access blocking | Screen Time API (DeviceActivity) — downtime scheduling | **Sanctioned path available (iOS only)** |
| Block specific titles | Per-title block list | Nothing — Apple TV+ does not support per-title blocking | Not achievable by any method |
| Monitor viewing history | Detailed watch log with timestamps and duration | Continue Watching on web (no timestamps, no duration); DeviceActivity provides app time only | Meaningful viewing reports not achievable |
| Lock/unlock child's access | Remote profile lock | Screen Time API: block Apple TV app entirely (iOS). Web: set restrictions to "Don't Allow" (blunt) | Partial — app-level block, not profile lock |
| Create kid profile | Programmatic profile creation | Nothing — must go through Apple's UI | Guide-based only |
| Real-time viewing alerts | Streaming/webhook for current activity | DeviceActivity can trigger on usage thresholds, not content-specific | Partial — time triggers only |

### Current State of the Art: What Competitors Actually Do

Every major parental control product treats Apple TV+ as part of the Apple ecosystem, leveraging Screen Time rather than integrating with the streaming service directly:

**Apple Screen Time (native):**
- Full device-level control: app time limits, content restrictions, downtime, Ask to Buy
- The gold standard for Apple TV+ parental controls
- Not a third-party integration — built into iOS/macOS/tvOS

**Bark:**
- Monitors device-level app usage via MDM profile on iOS
- Can detect that Apple TV app is open but cannot see what content is being watched
- Cannot modify any Apple TV+ settings
- Approach: iOS monitoring, no direct Apple TV+ integration

**Qustodio:**
- Device-level app time limits and blocking on iOS
- No content-level Apple TV+ integration
- Approach: Treat Apple TV app as a black box, control at OS level

**Canopy:**
- Uses Apple's Screen Time API (FamilyControls) on iOS for device-level time limits
- Closest any third party has come to sanctioned Apple integration
- Still cannot access Apple TV+ content controls directly
- Approach: Screen Time API for device-level enforcement

**Net Nanny / Mobicip / FamiSafe:**
- Device-level web/app filtering and time management
- Binary control: allow or block the Apple TV app
- No visibility into Apple TV+ content or settings
- Approach: All-or-nothing device-level blocking

**Key insight:** The industry standard for Apple TV+ parental control integration is device-level Screen Time. No competitor has achieved content-level integration with Apple TV+ (reading what a child watches, setting rating filters remotely within the service). Phosra's guide-based approach combined with Screen Time API integration aligns with and extends this industry standard.

### Regulatory Context: Forces That Could Change the Landscape

**Apple's Unique Regulatory Posture:**
- Apple has **publicly supported KOSA**, distinguishing itself from Google and Meta
- Apple already provides the Screen Time API — a stronger third-party integration story than any other streaming platform
- Apple's existing ecosystem controls (Family Sharing, Screen Time, Ask to Buy, Communication Safety) demonstrate proactive compliance intent

**KOSA (Kids Online Safety Act — US):**
- Could require platforms to provide enhanced parental control tools
- Apple is better positioned than competitors given existing Screen Time infrastructure
- Status: Passed Senate in 2024, reintroduced with bipartisan support

**COPPA Rule Modernization (FTC, April 2025):**
- Compliance deadline: April 22, 2026
- May require additional parental consent mechanisms and data protections for minors
- Apple will need to ensure Family Sharing and Screen Time controls meet updated requirements

**EU Digital Services Act (DSA) + UK Online Safety Act:**
- Could create frameworks for standardized third-party parental control APIs
- Apple may extend Screen Time API to include content-level controls if legislation mandates it

**Timeline estimate:** If legislation forces content-level APIs, the earliest realistic implementation would be **2027-2028**. In the meantime, Phosra should build on the sanctioned Screen Time API path and position as an early adopter when/if Apple extends API access.

### Risk Matrix: Integration Approaches

| Risk | Likelihood | Impact | Severity | Mitigation |
|---|---|---|---|---|
| **Apple rejects FamilyControls entitlement** | Low-Medium | High — blocks the sanctioned device-level integration path | **High** | Submit clear, well-documented application emphasizing child safety; reference competitors with approved entitlements (Canopy, Bark) |
| **Apple ID suspension from web automation** | Medium | Critical — user loses entire Apple ecosystem (iCloud, App Store, Music, iMessage, Photos, device activation) | **Critical** | Minimize web automation; prefer guide-based + Screen Time API; never retry failed auth; always require explicit user consent |
| **Apple changes Screen Time API behavior** | Low | Medium — sanctioned integration breaks until adapter updated | **Medium** | Track WWDC announcements and Apple developer release notes; maintain version-specific adapter branches |
| **Apple changes tv.apple.com UI** | Medium-High | Low-Medium — web automation breaks (supplemental path only) | **Medium** | Web automation is supplemental, not primary; robust selector strategy |
| **Apple ID 2FA blocks automated web login** | High (by design) | High — web automation requires user interaction every new session | **High** | Cache sessions aggressively; accept that web path requires user-in-the-loop for 2FA; recommend Screen Time API path instead |
| **User credential compromise** | Low | Critical — Apple ID exposure affects entire ecosystem | **Critical** | Prefer Screen Time API path (no credentials stored); AES-256 encryption for web path; per-user keys; HSM for key management |
| **Apple extends Screen Time API to content-level controls** | Low (but desirable) | Positive — eliminates need for web automation and guide-based workarounds | **Positive** | Design adapter interface to extend when new API capabilities become available |
| **Legal action from Apple** | Very Low | Critical — existential threat to Apple TV+ integration | **Critical** | Screen Time API path is compliant; guide-based path has zero legal risk; web automation carries ToS violation risk |
