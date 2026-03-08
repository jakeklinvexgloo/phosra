# Paramount+ Parental Controls Research Findings

**Platform:** Paramount+
**Research Date:** 2026-03-01
**Account Type:** Premium (formerly "Paramount+ with Showtime")
**Research Method:** Web research, documentation analysis, community addon reverse-engineering review
**Artifacts:** 22 web searches, official help center documentation, SlyGuy Kodi addon analysis

---

## 1. Profile Management

### Profile Structure
- **Max profiles:** 6 per account
- **Profile types:**
  - **Standard profile** -- Full access, maturity level configurable via account-wide parental controls
  - **Kids profile** -- Restricted UI with Kids Mode enabled, content locked to age-appropriate ratings
- **Profile creation:** Any logged-in user can add profiles from the profile picker. When parental controls are enabled with a PIN, creating or deleting profiles requires the PIN. Without parental controls enabled, profile creation is **unprotected** -- a potential security gap.
- **Avatar system:** Library of character avatars from Paramount brands (Nickelodeon, CBS, etc.) plus default icons
- **Kids UI:** Significantly different interface -- larger icons, minimal text for younger kids, autoplay disabled by default, browse and search only return age-appropriate content. A PIN is required to exit Kids Mode and switch to a non-Kids profile.

### Profile Settings (per profile)
- Display name
- Avatar image
- Kids Mode toggle (on/off)
- Kids age range (Younger Kids or Older Kids) -- only applicable to Kids profiles

### Account-Level Settings (not per-profile)
- Parental controls toggle (on/off)
- 4-digit PIN
- Content rating restriction level (account-wide slider)
- Live TV lock (on/off)
- Autoplay (device-specific, not profile-specific)

### Key Observations
- Unlike Netflix (per-profile maturity) or Peacock (account-wide), Paramount+ uses a **hybrid model**: Kids profiles have their own fixed maturity ceiling, while a single account-wide PIN and rating slider gate all non-Kids content.
- When parental controls are enabled, the PIN is required to: switch from a Kids profile to a Standard profile, watch content above the rating threshold, and access live TV (if locked).
- Profile creation is gated behind the PIN only when parental controls are active. If a parent forgets to enable parental controls, any user can create an unrestricted Standard profile.

---

## 2. Content Restrictions

### Maturity Rating Tiers
Paramount+ uses a 4-level restriction system on its parental controls slider:

| Paramount+ Tier | MPAA Ratings | TV Ratings | Description | Age Range |
|---|---|---|---|---|
| **All Kids** (Younger Kids profile) | G | TV-Y, TV-G | Youngest viewers only. Nickelodeon Jr., preschool content | 2-6 |
| **Older Kids** (Older Kids profile) | G, PG | TV-Y, TV-Y7, TV-Y7-FV, TV-G, TV-PG | School-age children. Nickelodeon, family movies | 7-12 |
| **Teens** | G, PG, PG-13 | TV-Y through TV-14 | Teen-appropriate. MTV reality, CBS dramas | 13+ |
| **Adult** (unrestricted) | G through R/NC-17 | All ratings including TV-MA | All content including Showtime originals, South Park, Comedy Central | 18+ |

### Phosra Rating System Mapping

| Phosra System | Paramount+ Support | Notes |
|---|---|---|
| **MPAA (Film)** | Full | G, PG, PG-13, R all recognized. NC-17 rare but supported |
| **TV Parental Guidelines** | Full | TV-Y, TV-Y7, TV-Y7-FV, TV-G, TV-PG, TV-14, TV-MA |
| **ESRB (Games)** | N/A | Paramount+ has no gaming content |
| **PEGI (EU Games)** | N/A | Not applicable |
| **Common Sense Media** | None | No CSM integration observed |

### Title-Specific Restrictions
- **Not supported.** Paramount+ does not offer per-title blocking. Parents cannot block individual shows like South Park while allowing other TV-MA content.
- This is a significant gap given the platform's content mix: TV-MA Showtime originals and South Park coexist with Nickelodeon's PAW Patrol and SpongeBob.
- The only mechanism is rating-based filtering -- if you block TV-MA, ALL TV-MA content is blocked.

### Content Descriptor Filtering
- **Not supported.** Paramount+ does not allow filtering by content descriptors (violence, language, nudity) independently of the overall maturity tier.
- No profanity filter or content editing feature is available natively.

### Live TV Restrictions
- Parents can toggle "Require PIN to watch live TV streams" separately from on-demand content ratings.
- This is a binary lock (all live TV or none) -- there is no per-channel restriction.
- Live TV includes CBS local affiliates, CBS News, CBS Sports, and other live feeds.
- Live sports (NFL on CBS, UEFA Champions League, UFC) are included in live TV and subject to the same binary lock.

---

## 3. PIN / Lock Protection

### Account PIN
- **Type:** 4-digit numeric PIN
- **Scope:** Account-wide (single PIN for the entire account, not per-profile)
- **Purpose:** Gates content above the selected rating threshold, profile switching from Kids to Standard, live TV access, and profile creation/deletion (when parental controls are active)
- **Setting location:** paramountplus.com/account > Parental Controls section
- **Reset:** "Forgot PIN" option available on the account page; requires account password to reset

### Password Gate
- Enabling or disabling parental controls requires the account password (not just the PIN)
- This is a stronger protection than PIN alone -- a child who discovers the 4-digit PIN still cannot disable parental controls without the account password

### Platform Availability for PIN Setup
- **Web browser:** Full parental control setup available
- **Mobile app:** Cannot set up parental controls through the app; must use web browser
- **TV app:** Cannot set up parental controls through TV apps; must use web browser
- This is a significant platform gap -- parents must know to go to the web to enable controls

### MFA
- **No MFA** is required for changing parental control settings beyond the account password
- No email verification, no SMS code, no authenticator app
- Once logged in with the account password, parental controls can be freely modified
- This is simpler than Netflix (which requires MFA for parental control changes) but potentially less secure

### Key Observations
- The PIN is the primary barrier for children. It protects content access, profile switching, and live TV.
- The password provides a secondary barrier for enabling/disabling the entire parental controls system.
- No biometric or device-level protection is available.
- The 4-digit PIN is relatively weak (10,000 combinations) with no lockout after failed attempts observed.

---

## 4. Screen Time Controls

### Native Support: **NONE**

Paramount+ does **not** offer any native screen time management features:
- No daily/weekly time limits
- No scheduling (e.g., "no streaming after 9pm")
- No usage reports or dashboards
- No bedtime/school-time restrictions
- No session duration alerts

### Autoplay Controls
- Autoplay next episode can be toggled on/off
- **Autoplay is disabled by default on Kids profiles** -- this is a proactive child safety measure
- Autoplay settings are **device-specific, not profile-specific** -- settings do not sync across devices
- On web browsers, autoplay cannot be toggled (must stop video manually)
- On mobile and TV apps, autoplay can be toggled in Settings > Video > Autoplay

### Workaround Strategies for Phosra
1. **Profile lock approach:** Disable the child's access by changing the account PIN (disruptive, account-wide impact)
2. **Device-level controls:** Defer to OS-level screen time (iOS Screen Time, Android Digital Wellbeing, router schedules)
3. **Autoplay disable:** Already default on Kids profiles, but can be enforced on Standard profiles
4. **Viewing history monitoring:** Track Continue Watching carousel for activity patterns (limited data)

---

## 5. Viewing History & Monitoring

### Viewing Activity
- **Location:** "Keep Watching" carousel on the home screen; "Watch History" accessible via profile settings
- **Data available:**
  - Title name
  - Episode/season for series
  - Playback progress (resume position)
- **Data NOT available:**
  - Date/time watched (no timestamps)
  - Watch duration per session
  - Chronological viewing log with dates
  - Export capability (no CSV, no download)
- **Per-profile:** Each profile has its own Continue Watching / Watch History
- **Editing:** Users can remove individual titles from Keep Watching (web only)
- **Deletion:** Children can remove items from their Keep Watching list, potentially hiding viewing activity

### Limitations
- No real-time viewing alerts
- No weekly/monthly summary reports
- No watch duration data
- No "currently watching" indicator
- No historical log with dates -- only current Continue Watching state
- No export or API for viewing data
- The viewing history is primarily a resume feature, not a monitoring feature

### Comparison to Netflix
Netflix provides title + date in viewing activity with CSV export. Paramount+ provides only title + resume position with no dates and no export. This makes Paramount+ significantly harder to monitor.

---

## 6. API / Technical Architecture

### Platform Infrastructure
- **Cloud:** Google Cloud Platform (GKE -- Google Kubernetes Engine)
- **CDN:** Multi-CDN strategy: Amazon CloudFront (primary, 21K+ IPs), Akamai (7K IPs), Fastly, Qwilt, Google Edge CDN
- **Architecture:** Microservices-based, deployed on GKE with blue-green deployment strategy
- **Database:** Distributed multi-region database on Google Cloud
- **Upcoming:** Unified backend with Pluto TV and BET+ planned for mid-2026 (Skydance merger)

### Primary Domains
- `paramountplus.com` -- Main application
- `cbsivideo.com` -- Video delivery (legacy CBS Interactive)
- `cbsi.com` -- CBS Interactive services
- `cbsistatic.com` -- Static assets
- `pplusstatic.com` -- Static assets

### Key API Endpoints (Discovered via Community Research)

| Endpoint Pattern | Purpose | Auth Required |
|---|---|---|
| `www.paramountplus.com/account/` | Account settings and parental controls | Session cookie |
| `www.paramountplus.com/account/parental-controls/` | Parental controls configuration | Session cookie + PIN |
| `link.theplatform.com/*` | Video manifest/playback (legacy thePlatform MPX) | Session token |
| `*.cbsivideo.com/*` | Video streaming delivery | CDN token |
| `www.paramountplus.com/shows/*` | Content catalog/metadata | None (public) |
| `www.paramountplus.com/brands/*` | Brand hub pages (Nickelodeon, CBS, etc.) | None (public) |

### Authentication
- **Primary auth:** Session cookies set at login
- **Session management:** Standard cookie-based sessions; "invalid token" errors occur when sessions expire or multi-device conflicts arise
- **Profile context:** Profile switching does not require re-authentication (just PIN if parental controls are active)
- **Token type:** Standard session tokens (no proprietary protocol like Netflix MSL)

### Rate Limiting / Detection
- Standard Google Cloud Armor (WAF) for bot detection
- No aggressive anti-automation measures documented (less hostile than Netflix)
- CAPTCHA may appear on login under suspicious conditions
- No device fingerprinting specifically documented for Paramount+

### Mobile App Architecture
- Native iOS and Android apps
- Mobile apps have separate settings paths (e.g., autoplay is device-specific)
- No known cross-platform framework (likely native or React Native)

---

## 7. Account Structure & Integration Points

### Account Hierarchy
```
Paramount+ Account (1 per subscription)
  |
  +-- Account Settings
  |     +-- Parental Controls (account-wide toggle + PIN)
  |     +-- Content Rating Slider (account-wide)
  |     +-- Live TV Lock (account-wide toggle)
  |
  +-- Profile 1 (Standard - account owner)
  |     +-- Watch History / Keep Watching
  |     +-- Watchlist
  |     +-- Recommendations
  |
  +-- Profile 2 (Kids - Younger Kids)
  |     +-- Restricted to TV-Y, G
  |     +-- Kids UI (large icons, no text)
  |     +-- Autoplay OFF by default
  |     +-- PIN required to exit
  |
  +-- Profile 3 (Kids - Older Kids)
  |     +-- Restricted to TV-Y through TV-PG, G through PG
  |     +-- Kids UI
  |     +-- Autoplay OFF by default
  |     +-- PIN required to exit
  |
  +-- Profile 4-6 (Standard or Kids, same structure)
```

### Subscription Tiers (as of January 2026)

| Plan | Monthly | Annual | Streams | Resolution | Downloads | Ads |
|---|---|---|---|---|---|---|
| **Essential** | $8.99 | $89.99/yr | 3 | 1080p | No | Yes |
| **Premium** | $13.99 | $139.99/yr | 3 | 4K UHD | Yes (25 max) | No |

- Both tiers include the same parental control features
- Both tiers include live sports (NFL on CBS, UEFA Champions League, UFC)
- Premium includes Showtime content library (previously "Paramount+ with Showtime")
- Both tiers allow 3 simultaneous streams

### Content Brand Libraries
Paramount+ aggregates content from multiple Paramount-owned brands, creating a uniquely wide content rating spectrum:

| Brand | Typical Ratings | Content Type |
|---|---|---|
| **Nickelodeon / Nick Jr.** | TV-Y, TV-Y7, TV-G | PAW Patrol, SpongeBob, Dora, Blue's Clues |
| **CBS** | TV-PG, TV-14, TV-MA | Dramas, procedurals, news, live sports |
| **MTV** | TV-14, TV-MA | Reality shows, RuPaul's Drag Race |
| **Comedy Central** | TV-14, TV-MA | South Park, stand-up specials, The Daily Show |
| **BET** | TV-14, TV-MA | Dramas, reality shows |
| **Showtime** | TV-MA | Premium dramas, Dexter, Yellowjackets |
| **Smithsonian Channel** | TV-G, TV-PG | Documentaries, nature, history |
| **Paramount Pictures** | G through R | Theatrical films |

### Key Integration Points for Phosra
1. **Profile as unit of child mapping** -- Phosra maps child to Paramount+ profile (1:1). Kids profiles with Younger/Older Kids setting are the primary control mechanism.
2. **Account-wide PIN is the enforcement gate** -- Unlike Netflix (per-profile PIN + MFA), Paramount+ uses a single PIN for all protections. This is simpler but less granular.
3. **No per-title blocking** -- Phosra cannot selectively block South Park while allowing other Comedy Central content. Only rating-based filtering is available.
4. **Live TV binary lock** -- Phosra can lock/unlock live TV entirely but cannot filter specific channels.
5. **No OAuth** -- Credential storage required. No partner/third-party authentication flow.
6. **Session management** -- Standard cookie-based sessions. Simpler than Netflix (no MSL, no Falcor).
7. **Web-only control setup** -- All parental control changes must go through the web interface. Mobile/TV apps are read-only for settings.
8. **Upcoming infrastructure change** -- Paramount+, Pluto TV, and BET+ are merging to a unified backend by mid-2026. Any automation built today may need updates after the migration.

---

## 8. API Accessibility & Third-Party Integration

### Public API Status

Paramount+ does **not** offer a public API for developers. There is no developer portal, no API documentation, no API keys, and no self-service access of any kind. The platform has never had a public API (unlike Netflix, which had one from 2008-2014).

### Partner Program

No partner program exists for parental control apps, child safety tools, or account management integrations. Paramount's partner relationships are limited to content distribution deals (cable/satellite/device manufacturers) and advertising partnerships.

### OAuth / Delegated Access

Paramount+ provides **no OAuth flow, no delegated access mechanism, and no token-based third-party authentication**. Users authenticate with email/password directly. Social login (Google, Apple) may be available but does not extend to third-party API access.

### Unofficial API Landscape

#### SlyGuy Kodi Addon
- The most sophisticated community effort to interface with Paramount+ APIs
- Open-source Kodi addon at `github.com/matthuisman/slyguy.addons` (slyguy.paramount.plus)
- Uses undocumented internal APIs including `link.theplatform.com` for video manifests
- **Actively maintained** (unlike Netflix community efforts which are abandoned)
- Provides evidence that internal APIs are accessible with session credentials
- Focused on content playback, not parental control management

#### thePlatform / MPX
- Paramount+ video delivery uses legacy infrastructure from thePlatform (now Comcast Technology Solutions)
- `link.theplatform.com` endpoints serve video manifests
- This is primarily for content delivery, not account/settings management

#### Content Metadata
- Third-party aggregators (Reelgood) provide catalog metadata APIs
- These are read-only content discovery services, not account management

### What Existing Parental Control Apps Actually Do

| App | Paramount+ Integration Approach | API Usage |
|---|---|---|
| **Bark** | Device-level monitoring; can detect Paramount+ is open but cannot see specific content | None |
| **Qustodio** | Device-level app time limits; can block Paramount+ app entirely on schedule | None |
| **Net Nanny** | Device-level web/app filtering; binary allow/block for Paramount+ | None |
| **Google Family Link** | OS-level app management and screen time on Android | None |
| **Apple Screen Time** | OS-level app time limits and content restrictions on iOS | None |
| **Circle** | DNS/network-level filtering; can block paramountplus.com domain | None |

**Key takeaway:** No parental control product on the market integrates with Paramount+ APIs. The industry standard is device/OS-level control only.

### Per-Capability API Accessibility

| Capability | Feature Exists? | Public API? | Unofficial API? | Access Method | Auth Required | 3rd Party Can Control? | Verdict |
|---|---|---|---|---|---|---|---|
| Profile creation | Yes | No | No | Playwright | Session cookie + PIN | With risk | Browser automation, PIN handling needed |
| Profile types (kids) | Yes (2 kids tiers) | No | No | Playwright | Session cookie | With risk | Toggle Kids Mode via browser |
| Content rating filters | Yes (4 levels, account-wide) | No | No | Playwright | Session cookie + password | With risk | Account-wide slider via browser |
| Per-title blocking | **No** | N/A | N/A | Not possible | N/A | No | Platform does not offer this |
| Account PIN | Yes (account-wide) | No | No | Playwright | Session cookie + password | With risk | Web-only setup via browser |
| Live TV lock | Yes (binary) | No | No | Playwright | Session cookie + PIN | With risk | Toggle via browser |
| Viewing history | Partial (Continue Watching) | No | Unknown | Playwright scrape | Session cookie | Read-only with risk | Sparse data, no timestamps |
| Autoplay controls | Yes (device-specific) | No | No | Playwright | Session cookie | With risk | Device-specific, limited scope |
| Screen time limits | **No** | N/A | N/A | Not possible | N/A | No | Platform gap |
| Parental notifications | **No** | N/A | N/A | Not possible | N/A | No | Platform gap |

### API Accessibility Score

**Level 0 -- Walled Garden**

Paramount+ has no public API, no partner program, no documented unofficial API access for account management, and no OAuth flow. The platform is a black box from an integration perspective. While the SlyGuy Kodi addon demonstrates that internal APIs exist for content playback, no one has documented APIs for parental control or account settings management.

### Terms of Service Constraints

Paramount+ Terms of Use (via `legal.paramount.com/us/en/pplus/terms-of-use`) explicitly prohibit:

> Use of any robot, bot, scraper, site search/retrieval application, proxy, VPN or other manual or automatic device, method, system or process to access, retrieve, index, "data mine", or in any way reproduce or circumvent the navigational structure or presentation of the Service.

Additional prohibitions include:
- Modifying, interfering with, or altering any portion of the video player or its underlying technology
- Building a business or enterprise utilizing the Service
- Reverse engineering or decompiling any software used to provide the Service

**Implications for Phosra:**
1. Every method of integration (browser automation, API access) constitutes a ToS violation
2. Account suspension is a theoretical risk, though Paramount+ enforcement appears less aggressive than Netflix
3. No "approved" pathway exists for child safety tool integration
4. The Skydance merger and potential infrastructure changes add uncertainty
5. Legislative pressure (KOSA, EU DSA) may eventually force API openness

### Overall Phosra Enforcement Level

**Browser-Automated** -- Paramount+ offers no API access. All Phosra integration must go through Playwright browser automation of the web interface. The simpler authentication model (no MFA, no MSL tokens) makes automation less complex than Netflix, but the account-wide nature of parental controls limits per-child enforcement granularity.

### Third-Party Integration Reality Check

1. **No third party has achieved direct API integration with Paramount+.** The SlyGuy Kodi addon is the closest community effort, but it focuses on content playback, not account management.
2. **All parental control apps operate at device/OS level only.** None control Paramount+ settings directly.
3. **The Skydance-Paramount merger (closed August 2025) introduces uncertainty.** A unified Paramount+/Pluto TV/BET+ backend by mid-2026 may change API surfaces.
4. **Paramount has a Children's Privacy Policy** in accordance with COPPA, but this does not extend to third-party tool access.
5. **No password sharing crackdown yet.** Unlike Netflix, Paramount+ has not implemented household verification, reducing risk of Phosra server access being flagged as sharing violations.
