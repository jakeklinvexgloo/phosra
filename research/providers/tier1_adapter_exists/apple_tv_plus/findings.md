# Apple TV+ Parental Controls Research Findings

**Platform:** Apple TV+ (rebranded to "Apple TV" in October 2025)
**Research Date:** 2026-03-01
**Account Type:** Apple TV+ subscription via Apple ID with Family Sharing
**Research Method:** Web research, Apple Support documentation, developer documentation analysis
**Artifacts:** Apple Support pages, Apple Media Services ToS, developer portal documentation

> **Note on naming:** Apple rebranded "Apple TV+" to "Apple TV" in October 2025, dropping the plus sign. Throughout this document we use "Apple TV+" to refer to the streaming service to distinguish it from the Apple TV hardware device and the Apple TV app. The web player remains at tv.apple.com.

---

## 1. Profile Management

### Profile Structure
- **Max profiles:** 1 Apple Account profile + up to 5 managed profiles = **6 total profiles** per household
- **Profile types:**
  - **Apple Account profile** -- Full access, tied to an Apple ID, manages the account and subscription
  - **Managed profile** -- Created by the Apple Account holder for household members who do not have their own Apple ID
  - **Kid profile** -- A managed profile with the "child" setting enabled; presents only age-appropriate content and search results based on content restrictions set by the account holder
- **Profile creation:** The Apple Account holder creates managed profiles within the Apple TV app. As of tvOS 26.2 (December 2025), profiles can be created **without requiring an Apple Account**, which is a significant recent change. On the Apple TV device, go to Settings > Profiles > Add New Profile.
- **Profile creation authentication:** Profile creation requires being signed in as the Apple Account holder. There is no explicit PIN or password gate on creating a new managed profile beyond being authenticated as the account owner.
- **Avatar/customization system:** Name and profile image (from a set of Apple-provided images or custom photo)
- **Kids UI:** Kid profiles present a restricted content catalog showing only age-appropriate content. Search results are filtered. No access to mature content or account settings.

### Profile Settings (per managed profile)
- Display name
- Profile image
- Content restrictions (separate for TV shows and movies)
- Purchase and rental permissions
- Child/Kid designation (toggle)
- 4-digit access passcode (optional, for profile access protection)

### Web vs. Device Profiles
- **Critical distinction:** The web player at tv.apple.com has a **separate, independent parental controls system** from the device-level (tvOS, iOS, macOS) controls. Web parental controls set at tv.apple.com **only apply to web playback** and do not propagate to other devices.
- The profile system in the Apple TV app (on devices) and the web player are **not the same**. The web player is primarily a single-user experience tied to the signed-in Apple ID, with its own web-specific content restrictions.

### Key Security Consideration
Profile creation on the Apple TV device now requires no Apple Account (tvOS 26.2+), making it easier to set up kid profiles but also potentially allowing anyone with physical device access to create profiles. However, content restrictions on those profiles are set by the managing account holder.

---

## 2. Content Restrictions

### Maturity Rating Tiers

Apple TV+ uses the standard US TV Parental Guidelines and MPA (formerly MPAA) rating systems. On the web, TV show and movie ratings can be configured **separately**.

#### TV Show Ratings

| Rating | Description | Age Range |
|---|---|---|
| **TV-Y** | Designed for all children ages 2-6 | 2-6 |
| **TV-Y7** | Directed to children age 7 and above | 7+ |
| **TV-G** | Suitable for all audiences | All ages |
| **TV-PG** | Parental guidance suggested; may contain mild violence, language, or suggestive themes | 8+ |
| **TV-14** | Parents strongly cautioned; may contain intense violence, language, sexual situations | 14+ |
| **TV-MA** | Mature audiences only; may contain graphic violence, explicit sexual activity, crude language | 17+ |

#### Movie Ratings

| Rating | Description | Age Range |
|---|---|---|
| **G** | General audiences; suitable for all ages | All ages |
| **PG** | Parental guidance suggested; some material may not be suitable for children | 8+ |
| **PG-13** | Parents strongly cautioned; some material may be inappropriate for children under 13 | 13+ |
| **R** | Restricted; under 17 requires accompanying parent or adult guardian | 17+ |
| **NC-17** | No one 17 and under admitted | 18+ |

#### Phosra Tier Mapping

| Phosra Tier | TV Ratings Included | Movie Ratings Included | Description |
|---|---|---|---|
| **All Ages** | TV-Y, TV-G | G | Youngest viewers only |
| **Ages 7+** | TV-Y, TV-Y7, TV-G, TV-PG | G, PG | Older children; mild content |
| **Ages 13+** | TV-Y through TV-14 | G through PG-13 | Teen-appropriate content |
| **Adults Only** | All ratings including TV-MA | All ratings including R, NC-17 | No restrictions |

### Phosra Rating System Mapping

| Phosra System | Apple TV+ Support | Notes |
|---|---|---|
| **MPAA / MPA (Film)** | Full | G, PG, PG-13, R, NC-17 all recognized |
| **TV Parental Guidelines** | Full | TV-Y, TV-Y7, TV-G, TV-PG, TV-14, TV-MA |
| **ESRB (Games)** | N/A | Apple TV+ has no gaming content |
| **PEGI (EU Games)** | N/A | Not applicable |
| **Common Sense Media** | None | Apple does not display CSM ratings |

### Per-Title Blocking
- **Apple TV+ does NOT support per-title blocking.** There is no mechanism to block a specific show or movie by name. Restrictions are entirely rating-based.
- This is a significant gap compared to Netflix, which offers per-profile title restrictions.

### Content Descriptor Filtering
- Apple TV+ does not offer filtering by individual content descriptors (violence, language, nudity, etc.) independent of the overall rating tier.
- Content advisories are displayed on title detail pages but are informational only, not filterable.

### Scope of Restrictions
- **Web (tv.apple.com):** Restrictions are **account-wide** for the signed-in Apple ID. There is a single set of web parental controls per Apple ID session.
- **Device (tvOS, iOS, macOS):** Restrictions can be set **per managed profile** (including kid profiles) through the Apple TV app's profile system.
- **Cross-device:** Web and device restrictions are **independent** -- setting restrictions on the web does not affect device restrictions and vice versa.

---

## 3. PIN / Lock Protection

### Web Parental Controls Passcode
- **Type:** 4-digit numeric passcode
- **Scope:** Account-wide (applies to the signed-in Apple ID on the web)
- **Purpose:** Protects parental control settings from being changed; required to access content that exceeds the set rating
- **Setup platform:** Web only (tv.apple.com > Settings > Parental Controls)
- **Recovery:** Recovery email address can be set during passcode creation
- **MFA:** No additional MFA beyond the 4-digit passcode for web parental controls. However, signing into tv.apple.com itself may require Apple ID two-factor authentication (2FA).

### Device-Level Restrictions Passcode (tvOS)
- **Type:** 4-digit numeric passcode
- **Scope:** Device-wide (applies to the Apple TV hardware device)
- **Purpose:** Locks the Restrictions settings on the tvOS device
- **Setting location:** Settings > General > Restrictions on Apple TV 4K
- **Note:** This is a separate system from the web parental controls passcode

### Apple ID Two-Factor Authentication
- Apple ID accounts use mandatory two-factor authentication (2FA)
- Login to tv.apple.com triggers 2FA verification (code sent to trusted device or phone number)
- This provides a natural authentication gate -- a child would need access to the parent's trusted device to sign in
- 2FA codes are 6-digit numeric codes

### Screen Time Passcode (iOS/macOS)
- Separate from both the web passcode and device restrictions passcode
- Set through Settings > Screen Time on iPhone/iPad/Mac
- 4-digit code
- Can be managed remotely via Family Sharing

---

## 4. Screen Time Controls

### Native Support: **PARTIAL (device-level only, NOT platform-level)**

Apple TV+ itself has **no native screen time controls within the streaming service**. However, Apple's ecosystem provides robust device-level screen time management through Screen Time:

#### Apple Screen Time Features (device-level, not Apple TV+ specific)
- **Daily time limits:** Per-app time limits (can limit the Apple TV app specifically)
- **Downtime scheduling:** Block all apps during specified hours (e.g., bedtime)
- **App Limits:** Set daily time limits for categories of apps or individual apps
- **Always Allowed:** Specify apps that are always accessible during Downtime
- **Content & Privacy Restrictions:** Device-wide content filtering by rating
- **Remote management:** Parents can manage child's Screen Time settings from their own device via Family Sharing

#### Apple TV 4K (tvOS) Screen Time
- Screen Time is available on Apple TV 4K running tvOS 15+
- Supports Downtime, App Limits, and Content & Privacy Restrictions
- Configurable remotely from parent's iPhone via Family Sharing

#### Screen Time API (third-party developer access)
- Apple opened the Screen Time API to third-party developers in iOS 15 (2021)
- Three frameworks: **FamilyControls**, **ManagedSettings**, **DeviceActivity**
- Third-party apps can: set app restrictions, monitor device activity, create custom time windows, lock down apps when time limits are reached
- **Requires FamilyControls entitlement** -- a privileged entitlement that must be approved by Apple for App Store/TestFlight distribution
- **iOS/macOS only** -- the Screen Time API does not extend to web browsers or non-Apple platforms

#### Autoplay Controls
- The Apple TV app (on device) has a "Play Next Episode" toggle
- The web player at tv.apple.com has **no autoplay setting** -- autoplay behavior cannot be controlled on the web
- On device: Settings > Apps > TV > Play Next Episode (toggle)

### Workaround Strategies for Phosra
1. **Device-level Screen Time:** Defer to Apple's Screen Time for time-based controls (most reliable approach)
2. **Screen Time API integration:** Build a native iOS companion app that uses FamilyControls/ManagedSettings to control Apple TV app time limits (requires Apple entitlement approval)
3. **Web session management:** For web-only enforcement, Phosra could change the web passcode or toggle restrictions, but this is blunt and affects all web viewing
4. **Profile-based restriction changes:** Change managed profile restrictions via Playwright on device management pages

---

## 5. Viewing History & Monitoring

### Viewing History
- **Location:** "Recently Watched" row at the bottom of the Home tab in the Apple TV app (device)
- **Web visibility:** The web player shows a "Continue Watching" row, but there is **no comprehensive viewing history page** on tv.apple.com
- **Data available:**
  - Title name (movie or show)
  - Episode/season for series (in Continue Watching)
  - Watch progress (partially watched indicator)
- **Data NOT available:**
  - No date/time stamps for when content was watched
  - No watch duration data
  - No detailed historical log (only recent/in-progress items)
  - No export capability (no CSV, no API)
  - No per-profile viewing history on the web (web is single-user per Apple ID)

### Continue Watching
- Shows titles that are in-progress
- Synced across devices via Apple ID (iCloud sync)
- Can be cleared: Settings > Apps > TV > Clear Play History (on device), or via account settings in the app

### History Deletion
- Users can clear their entire play history
- "Removing information about what you've watched removes TV shows and movies from your Continue Watching and Watchlist rows"
- A child could clear their viewing history to cover tracks

### Limitations
- No real-time "currently watching" indicator
- No weekly/monthly summary reports within Apple TV+
- No parental dashboard or activity feed
- No per-child activity view within the service (requires device-level Screen Time reports)
- Screen Time on iOS/macOS does provide app usage duration reports, but these show total Apple TV app usage time, not specific content watched

---

## 6. API / Technical Architecture

### Primary Architecture: Apple's Proprietary Ecosystem

Apple TV+ at tv.apple.com uses Apple's proprietary web infrastructure. Unlike Netflix (Falcor) or Peacock (AppSync GraphQL), Apple's web APIs are deeply integrated into its broader media services ecosystem.

### Key API Endpoints Discovered

| Endpoint Domain | Purpose | Auth Required |
|---|---|---|
| `tv.apple.com` | Web player, settings, parental controls UI | Apple ID session (cookies + 2FA) |
| `amp-api.media.apple.com` | Apple Media Products API -- content catalog, metadata, recommendations | Bearer token (JWT) |
| `play.itunes.apple.com` | Playback and streaming infrastructure | Apple ID session + DRM tokens |
| `buy.itunes.apple.com` | Purchase and subscription management | Apple ID session |
| `identity.apple.com` | Apple ID authentication | Apple ID credentials + 2FA |
| `gsa.apple.com` | Grand Slam Authentication (Apple's auth service) | Apple ID credentials |

### Authentication
- **Primary auth:** Apple ID session (cookie-based after successful login + 2FA)
- **2FA:** Mandatory for all Apple ID accounts -- 6-digit code sent to trusted device or phone
- **Bearer tokens:** The Apple Media Products (AMP) API uses JWT bearer tokens for content catalog requests
- **DRM:** Apple uses FairPlay DRM for content protection, with separate DRM token negotiation
- **Session duration:** Apple ID web sessions typically persist for extended periods (weeks) with periodic re-authentication

### Anti-Automation Posture
- Apple does not use standard WAF products like AWS WAF or Cloudflare
- Apple operates its own CDN infrastructure and security stack
- Apple ID authentication includes sophisticated device trust, behavioral analysis, and risk scoring
- Apple's ecosystem is designed to be accessed only through Apple's own software -- the ToS explicitly states "You may access our Services only using Apple's software"
- Headless browser detection: Apple likely employs JavaScript-based fingerprinting, though specifics are not publicly documented

### Mobile App Architecture
- Native iOS/tvOS apps using Apple's frameworks (UIKit, SwiftUI, AVKit)
- No cross-platform framework (no React Native, Flutter, etc.)
- Screen Time API (FamilyControls, ManagedSettings, DeviceActivity) available for iOS native apps only

### Infrastructure
- Apple operates its own global CDN (Apple CDN / Apple Edge Cache)
- Does not rely on third-party cloud providers (AWS, GCP) for its primary services
- This makes Apple's infrastructure harder to analyze compared to platforms using standard cloud stacks

---

## 7. Account Structure & Integration Points

### Account Hierarchy
```
Apple ID Account (parent/organizer)
  |
  +-- Family Sharing Group (up to 6 members)
  |     |
  |     +-- Family Organizer (parent Apple ID)
  |     |     +-- Apple TV+ subscription (shared with family)
  |     |     +-- Screen Time management for children
  |     |     +-- Purchase approval (Ask to Buy)
  |     |
  |     +-- Adult Family Member (own Apple ID)
  |     |     +-- Own profile, own viewing history
  |     |     +-- Shares subscription
  |     |
  |     +-- Child Family Member (child Apple ID, under 13)
  |     |     +-- Restricted by Screen Time settings
  |     |     +-- Content restrictions enforced at device level
  |     |     +-- Ask to Buy enabled
  |     |     +-- Sign in with Apple restricted
  |     |
  |     +-- Managed Profile (no Apple ID, tvOS 26.2+)
  |           +-- Created by account holder
  |           +-- Kid designation possible
  |           +-- Content restrictions set by account holder
  |
  +-- Web Player (tv.apple.com)
        +-- Single Apple ID session
        +-- Independent web-only parental controls
        +-- 4-digit passcode + rating restrictions
        +-- Does NOT share settings with device-level controls
```

### Subscription Structure
- **Single tier:** $12.99/month or $99.99/year (US, as of August 2025)
- **No ad-supported tier** (as of research date, though Apple has discussed ad-supported plans for 2026)
- **Streams:** Up to 6 simultaneous streams
- **Downloads:** Unlimited offline downloads
- **Resolution:** 4K HDR with Dolby Vision and Dolby Atmos
- **Family Sharing:** Subscription automatically shared with up to 5 additional family members
- **Apple One:** Apple TV+ is included in Apple One bundles (Individual, Family, Premier)

### Key Integration Points for Phosra
1. **Dual control surfaces** -- Phosra must consider both the web player (tv.apple.com) and device-level controls (Screen Time + Apple TV app profiles) as separate integration targets
2. **Family Sharing as the primary model** -- Unlike Netflix (1 account, multiple profiles), Apple TV+ uses Family Sharing where each family member has their own Apple ID. The child-to-platform mapping is 1:1 Apple ID, not 1:1 profile
3. **Screen Time API opportunity** -- Apple's Screen Time API (FamilyControls, ManagedSettings, DeviceActivity) is the closest thing to a sanctioned third-party parental control integration. This requires a native iOS app with Apple's entitlement approval
4. **Web controls are limited** -- The web player's parental controls are basic (rating filter + 4-digit passcode) and account-wide, not per-user
5. **No OAuth but Sign in with Apple** -- Apple offers "Sign in with Apple" for third-party apps, but it does NOT provide access to Apple TV+ settings, viewing history, or parental controls. It is an identity-only mechanism
6. **2FA gate** -- Apple ID 2FA provides a strong natural barrier to unauthorized access, but also makes automated login complex

---

## 8. API Accessibility & Third-Party Integration

### API Accessibility Score: **Level 1 (Unofficial Read-Only)**

Despite Apple being a notoriously closed ecosystem, the existence of the Screen Time API for iOS developers elevates Apple TV+ slightly above Level 0. The Screen Time API provides a **sanctioned but limited** pathway for third-party parental control integration at the device level, though it does not extend to web or content-level controls within Apple TV+ itself.

### Public API Assessment

| Question | Answer | Evidence / Source |
|---|---|---|
| Does a public API exist? | **No** (for Apple TV+ parental controls) | No developer documentation for Apple TV+ account/parental control APIs |
| Historical context | Apple has never offered a public API for Apple TV+ account management | N/A |
| Is there a developer portal? | **Yes** (Apple Developer Portal) but not for Apple TV+ user account access | developer.apple.com |
| Is there API documentation? | **Partial** -- Screen Time API is documented; Apple Media Products API is partially documented for content catalog | Apple Developer Documentation |
| Is there a partner program? | **Yes** -- Apple Video Partner Program and Apple TV for Partners, but for content providers, not parental control tools | tvpartners.apple.com |
| Partner program scope | Content catalog integration, universal search, subscription registration -- no parental control access | tvpartners.apple.com/support/3705 |
| Is there an OAuth/delegated access flow? | **Partial** -- Sign in with Apple provides identity only, no Apple TV+ data access | developer.apple.com/sign-in-with-apple |
| Can third parties request parental control access? | **Partial** -- Via Screen Time API on iOS (FamilyControls entitlement required), but not for Apple TV+ content-level controls | developer.apple.com/documentation/screentime |

### Internal API Assessment

| Question | Answer | Evidence / Source |
|---|---|---|
| What internal API protocol is used? | REST-like APIs with proprietary authentication | Network analysis of tv.apple.com |
| Primary API endpoint(s) | `amp-api.media.apple.com` (content), `play.itunes.apple.com` (playback), `identity.apple.com` (auth) | Domain analysis |
| Authentication mechanism | Apple ID cookies + 2FA + JWT bearer tokens | Apple ecosystem standard |
| Are internal APIs stable? | Unknown -- Apple does not document internal web APIs and changes them without notice | N/A |
| Is API schema discoverable? | No -- no GraphQL introspection, no Swagger/OpenAPI documentation for internal APIs | N/A |
| Are there undocumented but useful endpoints? | Likely -- the AMP API serves content catalog data, but parental control endpoints are not documented | amp-api.media.apple.com |

### Per-Capability Accessibility Matrix

| Capability | Feature Exists? | Public API? | Unofficial API? | Access Method | Auth Required | 3rd Party Can Control? | Verdict |
|---|---|---|---|---|---|---|---|
| Profile creation | Yes (managed profiles) | No | No | Playwright (device mgmt pages) | Apple ID + 2FA | With risk | Browser automation on Apple ID pages, heavily guarded |
| Profile types (kids) | Yes (kid managed profiles) | No | No | Playwright | Apple ID + 2FA | With risk | Must toggle kid designation in profile settings |
| Content rating filters | Yes (per-profile on device, per-account on web) | No | No | Playwright (web: tv.apple.com settings) | Apple ID + web passcode | With risk | Web controls are simpler target than device |
| Per-title blocking | **No** | N/A | N/A | Not possible | N/A | No | Platform does not offer this feature |
| Profile PIN/lock | Partial (web passcode, device restrictions passcode) | No | No | Playwright | Apple ID session | With risk | Separate passcodes for web vs. device |
| Viewing history | Partial (Continue Watching only, no historical log) | No | No | Playwright scrape | Apple ID session | Read-only with risk | Very sparse data -- no timestamps, no duration |
| Autoplay controls | Partial (device only, not web) | No | No | Not possible on web | N/A | No (web) | No web autoplay setting exists |
| Screen time limits | Yes (device-level via Screen Time) | **Yes** (Screen Time API -- iOS only) | N/A | Screen Time API (iOS native app) | FamilyControls entitlement | **Yes (iOS only)** | Best integration path -- sanctioned API |
| Parental event notifications | No (within Apple TV+) | Partial (Screen Time alerts) | N/A | Screen Time API | FamilyControls entitlement | Partial | Device-level only, not content-specific |
| Account settings | Yes | No | No | Playwright | Apple ID + 2FA | With risk | Apple ID 2FA makes automation very difficult |

### Third-Party Integration Reality Check

#### What Existing Parental Control Apps Do with Apple TV+

| App | Apple TV+ Integration Approach | API Usage |
|---|---|---|
| **Apple Screen Time** | Native device-level controls: app time limits, content restrictions, downtime scheduling | Native OS integration (not third-party) |
| **Bark** | Device-level monitoring via MDM profile on iOS; can detect Apple TV app usage but not content | No Apple TV+ API; relies on iOS monitoring |
| **Qustodio** | Device-level app time limits and blocking on iOS/Android; no content-level Apple TV+ integration | No Apple TV+ API; iOS MDM/Screen Time adjacent |
| **Net Nanny** | Device-level web/app filtering; binary allow/block of Apple TV app | No Apple TV+ API |
| **Canopy** | OS-level screen time management; uses Screen Time API on iOS | Screen Time API (FamilyControls) for iOS |
| **Mobicip** | Device-level app scheduling and blocking | No Apple TV+ API |
| **Google Family Link** | Not applicable (Google ecosystem, no Apple integration) | N/A |

**Key takeaway:** The Screen Time API on iOS is the **only sanctioned third-party integration point** in Apple's ecosystem. Apps like Canopy use it for device-level time limits. No third-party app has achieved content-level integration with Apple TV+ (e.g., reading what a child watches, setting rating filters remotely). The industry standard is device-level control only.

#### Has Any Third Party Achieved Direct API Integration?

- **Yes, but only at the device level via Screen Time API.** Apple opened the Screen Time API in iOS 15 (2021) with three frameworks: FamilyControls, ManagedSettings, and DeviceActivity. This allows third-party parental control apps to set app restrictions, monitor usage, and enforce time limits.
- **No third party has achieved integration with Apple TV+ content controls** (rating filters, viewing history, profile management). These remain accessible only through Apple's own UI.
- The Screen Time API requires Apple's FamilyControls entitlement, which is a **privileged entitlement** that must be specifically approved by Apple for App Store distribution.

#### What Has Changed Recently? (Last 12 months)

1. **tvOS 26.2 (December 2025):** Added dedicated Kids Mode and the ability to create profiles without an Apple Account. Significant improvement in parental controls on the Apple TV device.
2. **Apple TV+ rebranded to Apple TV (October 2025):** Name change only; no functional changes to parental controls.
3. **Apple supports KOSA:** Apple publicly announced support for the Kids Online Safety Act, distinguishing itself from Google and Meta.
4. **Subscription price increase (August 2025):** $12.99/month, no feature changes to parental controls.
5. **COPPA Rule updates (April 2025):** FTC finalized COPPA Rule modernization with compliance deadline of April 22, 2026. Apple will need to comply.

### Legal & Risk Assessment

| Assessment Area | Detail |
|---|---|
| **ToS on automated access** | Apple Media Services ToS: "You may not use any software, device, automated process, or any similar or equivalent manual process to scrape, copy, or perform measurement, analysis, or monitoring of, any portion of the Content or Services." Additionally: "You may access our Services only using Apple's software." |
| **ToS on credential sharing** | Not explicitly addressed in Apple Media Services ToS, but Apple ID terms prohibit sharing credentials. Family Sharing is the approved mechanism for household access. |
| **Anti-bot/automation detection** | Apple operates its own security infrastructure (no standard WAF). Apple ID authentication includes device trust, behavioral analysis, risk scoring, and mandatory 2FA. Significantly harder to automate than most streaming platforms. |
| **Account suspension risk** | **High.** Apple ID suspension affects not just Apple TV+ but the entire Apple ecosystem (iCloud, App Store, Apple Music, iMessage, etc.). The blast radius is far larger than any other streaming platform. |
| **Household sharing/IP monitoring** | Family Sharing is Apple's approved sharing model. Apple does not enforce location-based sharing restrictions in the same way Netflix does, but Apple ID security will flag unusual login locations. |
| **Regulatory safe harbor argument** | Apple's public support of KOSA and its existing Screen Time API suggest a more favorable regulatory posture than competitors. However, no child safety exemption exists in the ToS for automated access. |
| **Precedent** | Apple opened the Screen Time API to third-party developers (iOS 15, 2021) after developer pressure. Apple approves FamilyControls entitlements for legitimate parental control apps. This is a positive signal, but the entitlement is specifically for device-level controls, not Apple TV+ content access. |

### Overall Phosra Enforcement Level Verdict

**Apple TV+ presents a unique dual-path integration opportunity:**

1. **Sanctioned path (iOS Screen Time API):** Phosra can build a native iOS companion app using FamilyControls/ManagedSettings/DeviceActivity to control Apple TV app time limits, enforce downtime, and monitor device-level usage. This is **legitimate, low-risk, and Apple-approved** (with entitlement).

2. **Unsanctioned path (web automation):** Phosra can use Playwright to automate tv.apple.com parental control settings (rating changes, passcode management). This is **higher risk** due to Apple ID 2FA complexity and Apple's ToS prohibition on automated access. Account suspension risk is **critical** because it affects the entire Apple ecosystem.

**Recommendation:** Prioritize the Screen Time API path for device-level controls. Use web automation only as a supplement for web-specific parental controls, with extreme caution around Apple ID authentication.
