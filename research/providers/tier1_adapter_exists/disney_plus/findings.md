# Disney+ Parental Controls Research Findings

**Platform:** Disney+
**Research Date:** 2026-03-01
**Account Type:** Premium (7 profiles, 4 simultaneous streams)
**Research Method:** Web research, unofficial API client analysis, community reverse-engineering review
**Artifacts:** Official help documentation, two open-source API wrapper projects analyzed, Disney ToS reviewed

---

## 1. Profile Management

### Profile Structure
- **Max profiles:** 7 per account
- **Profile types:**
  - **Standard profile** -- Full access, content rating configurable up to TV-MA/R, autoplay enabled by default
  - **Junior Mode profile (Kids)** -- Simplified UI, content locked to all-ages-appropriate content (up to TV-Y7-FV/G), ads disabled, autoplay disabled, Background Video disabled, Kid-Proof Exit enabled
- **Profile creation:** Any user with account access can create profiles by default. Disney+ offers a **Restrict Profile Creation** toggle (under Account Settings) that requires the account password before any new profile can be created. This is a meaningful security improvement over platforms like Peacock where profile creation is entirely unprotected.
- **Avatar system:** Large library of Disney character avatars organized by franchise (Disney, Pixar, Marvel, Star Wars, National Geographic)
- **Junior Mode UI:** Completely different interface -- simplified navigation, larger thumbnails, colorful design, only Disney-branded content sections visible (no Marvel violence, no Star Wars combat, no intense documentaries). Standard sections like Disney, Pixar, Marvel, Star Wars, and National Geographic are replaced with kid-safe curated rows.

### Profile Settings (per profile)
- Display name
- Avatar image
- Content rating level (TV-Y through TV-MA, password required to change)
- Junior Mode toggle (kids profile)
- Kid-Proof Exit toggle (kids profiles only)
- Profile PIN (4-digit, password required to set/change)
- Autoplay next episode (toggle, disabled by default on Junior Mode)
- Autoplay previews / Background Video (toggle, disabled by default on Junior Mode)
- Language preference
- App language
- Subtitle appearance

### Key Security Features
- **Restrict Profile Creation:** Requires account password to create new profiles (must be manually enabled)
- **Profile PIN:** 4-digit PIN can be set on any profile, requires account password to configure
- **Kid-Proof Exit:** Requires entering spelled-out numbers (e.g., "One, Two, Three, Four" -> 1234) to exit Junior Mode, preventing younger children from navigating to other profiles
- **Content Rating changes require password:** Changing a profile's content rating level requires re-entry of the account password

---

## 2. Content Restrictions

### Content Rating Tiers (US Market)

Disney+ uses standard US content rating systems. The platform allows setting a maximum content rating per profile, which acts as a ceiling -- content rated above the selected level is hidden from browsing, search, and Continue Watching.

| Disney+ Rating Level | MPAA Ratings Included | TV Ratings Included | Description | Age Range |
|---|---|---|---|---|
| **TV-Y** | -- | TV-Y | Youngest children only | 2-6 |
| **TV-Y7 / TV-Y7-FV** | -- | TV-Y, TV-Y7, TV-Y7-FV | Older children, may include mild fantasy violence | 7+ |
| **G / TV-G** | G | TV-Y, TV-Y7, TV-Y7-FV, TV-G | General audiences | All ages |
| **PG / TV-PG** | G, PG | TV-Y through TV-PG | Parental guidance suggested | 7+ |
| **PG-13 / TV-14** | G, PG, PG-13 | TV-Y through TV-14 | Some material inappropriate for children under 13/14 | 13+ |
| **R / TV-MA** | G through R | All ratings including TV-MA | Restricted/Mature audiences | 17+ |

**Default content rating:** TV-14 for adult profiles (age 18+ based on date of birth). This is notably more restrictive than Netflix's default of "All Maturity Ratings."

**Junior Mode profiles** are locked to all-ages content and cannot have their rating adjusted.

### Phosra Rating System Mapping

| Phosra System | Disney+ Support | Notes |
|---|---|---|
| **MPAA (Film)** | Full | G, PG, PG-13, R all recognized and filterable |
| **TV Parental Guidelines** | Full | TV-Y, TV-Y7, TV-Y7-FV, TV-G, TV-PG, TV-14, TV-MA |
| **ESRB (Games)** | N/A | Disney+ has no gaming content |
| **PEGI (EU Games)** | N/A | Not applicable |
| **Common Sense Media** | None | Disney+ does not display or filter by CSM ratings |

### Title-Specific Restrictions
- Disney+ does **not** offer per-title blocking in the way Netflix does
- Content filtering is exclusively tier-based (set a maximum rating level and everything above it is hidden)
- Items can be removed from "Continue Watching" but this is per-profile cosmetic management, not a parental restriction
- There is no mechanism to block a specific PG movie while allowing other PG movies

### Content Filtering Scope
- **Per-profile** -- Each profile has its own content rating level
- Content above the selected rating is completely hidden from browsing, search results, and recommendations
- Changing content rating requires the account password

### R-Rated / TV-MA Content Context
Disney+ added its first R-rated content in 2022:
- **Movies:** Deadpool, Deadpool 2, Logan
- **TV Series:** Daredevil, Jessica Jones, The Punisher, Luke Cage, Iron Fist, The Defenders (all TV-MA)
- In international markets, the Star brand hub within Disney+ hosts additional mature content (Alien, Terminator, Die Hard, Kingsman, Atlanta, etc.)
- The default TV-14 rating means new profiles do NOT see R-rated or TV-MA content unless the account holder explicitly raises the rating (with password verification)

---

## 3. PIN / Lock Protection

### Profile PIN
- **Type:** 4-digit numeric PIN
- **Scope:** Per-profile (each profile can have its own PIN)
- **Purpose:** Prevents unauthorized access to a specific profile -- kids cannot switch to parent's profile without knowing the PIN
- **Setting location:** Edit Profiles > [Profile] > Profile PIN
- **Platforms:** Available on web, mobile (iOS/Android), TV apps, and gaming consoles
- **Setup requirement:** Account password must be entered to set, change, or remove a Profile PIN
- **Reset flow:** Can be reset using the account email address and following on-screen instructions

### Kid-Proof Exit
- **Type:** Simple challenge question (enter spelled-out numbers as digits)
- **Scope:** Per Junior Mode profile
- **Purpose:** Prevents younger children (who cannot read or do not understand the challenge) from exiting Junior Mode to access other profiles
- **Limitation:** Not a strong security mechanism -- older children (7+) can easily solve the challenge
- **Setup requirement:** Account password required to enable/disable

### Content Rating Change Protection
- **Gate:** Account password required to change any profile's content rating
- **Strength:** Moderate -- password is a stronger gate than a 4-digit PIN, but there is no MFA layer like Netflix's email/SMS verification
- **Note:** Unlike Netflix, Disney+ does not use MFA (email/SMS code) for parental control changes. The account password is the sole authentication barrier.

### Restrict Profile Creation
- **Gate:** Account password (when enabled)
- **Default:** OFF -- must be manually enabled by account holder
- **Strength:** Good when enabled, but the default-off state means many families leave this unprotected

---

## 4. Screen Time Controls

### Native Support: **NONE**

Disney+ does **not** offer any native screen time management features:
- No daily/weekly time limits
- No scheduling (e.g., "no Disney+ after 9pm")
- No usage reports or dashboards
- No session duration alerts or warnings
- No bedtime mode that actually enforces limits (there is a cosmetic "bedtime" placeholder image but it does not stop playback)

### Autoplay Controls
- **Autoplay next episode:** Toggle per profile (enabled by default on standard profiles, disabled by default on Junior Mode profiles)
- **Background Video / Autoplay previews:** Toggle per profile (disabled by default on Junior Mode)
- These settings are relevant to passive binge-watching but are not screen time controls

### Workaround Strategies for Phosra
1. **Profile Lock approach:** Lock the profile by enabling/changing the PIN when time limit is reached
2. **Content rating approach:** Lower the content rating to TV-Y (effectively removing most content) when limit is hit, then restore when unlocked
3. **Device-level controls:** Defer to OS-level screen time (iOS Screen Time, Android Digital Wellbeing, router schedules)
4. **Autoplay disable:** Turning off autoplay next episode reduces passive binge-watching
5. **Viewing activity monitoring:** Track what is being watched via Continue Watching and alert parents

---

## 5. Viewing History & Monitoring

### Viewing Activity
- **No dedicated viewing history page:** Unlike Netflix, Disney+ does not have an explicit "Viewing Activity" or "Watch History" page
- **Continue Watching row:** The home screen shows a "Continue Watching" row with titles the profile has started but not finished
- **Watchlist:** Users can add titles to a personal Watchlist (not the same as viewing history)
- **Data available via Continue Watching:**
  - Title name
  - Progress indicator (how far through the title)
  - Episode/season for series
- **Data NOT available:**
  - Date/time watched
  - Watch duration per session
  - Historical log of completed titles
  - No chronological viewing history
  - No CSV or data export
  - No "currently watching" indicator

### Monitoring Limitations
- **No viewing history export** -- Disney+ provides no download or export of watch data
- **No timestamps** -- Cannot determine when content was watched, only that it was partially watched
- **No completed content log** -- Once a title is finished, it disappears from Continue Watching with no trace
- **Per-profile isolation** -- Each profile's Continue Watching is separate; a parent must switch to the child's profile to see their Continue Watching row
- **Removal possible** -- Items can be removed from Continue Watching (right-click/long-press > Remove), but watch progress is retained internally even after removal

### Comparison to Netflix
Disney+ viewing history is significantly weaker than Netflix:
- Netflix: Per-profile viewing activity with title + date, CSV export
- Disney+: Continue Watching row only, no timestamps, no export, no historical log

---

## 6. API / Technical Architecture

### Platform API Architecture

Disney+ uses a **private REST API** built on the BAMTech (now Disney Streaming) infrastructure. The API has been partially reverse-engineered by community developers.

### Authentication Architecture
- **Login flow:** Device grant token > OAuth token exchange > User login (email + password)
- **Token type:** OAuth 2.0 Bearer tokens
- **Refresh tokens:** Supported, with caching capability
- **Session duration:** Access tokens have limited TTL; refresh tokens extend the session
- **No public OAuth:** Disney+ provides no third-party OAuth flow or delegated access mechanism

### Key API Endpoints Discovered (via community reverse engineering)

| Endpoint Category | Purpose | Auth Required |
|---|---|---|
| Device Grant | Register device and obtain initial token | API key only |
| Token Exchange | Exchange device grant for OAuth token | Device grant token |
| Login | Authenticate with email/password | OAuth token |
| Profile Management | List profiles, get profile details | Bearer token |
| Profile Selection | Set active profile (including PIN-protected) | Bearer token + PIN |
| Content Search | Search catalog by query | Bearer token |
| Content Metadata | Movie/series details, cast, duration | Bearer token |
| Media Streams | Video/audio stream URLs (DRM protected) | Bearer token + DRM |

### Community Reverse-Engineering Projects
1. **jonbarrow/disneyplus-client** (Node.js) -- Reverse-engineered from iOS app on iPhone 8+ / iOS 14. Supports device grants, OAuth exchange, login, and `getUserProfiles()`. Explicitly does not support streaming/content extraction.
2. **pam-param-pam/Disney-Plus-api-wrapper** (Python, `pydisney` on PyPI) -- More feature-rich. Supports authentication (email/password, token caching), `get_profiles()`, `set_active_profile()`, profile language settings, PIN-protected profile access, content search, and metadata retrieval. Focused on audio/subtitle download.

### Infrastructure
- **CDN:** Akamai
- **Cloud:** AWS (EKS, S3, Kinesis, EMR)
- **Compute:** Amazon EKS (Elastic Kubernetes Service) for container orchestration
- **Data processing:** Apache Flink + Kafka for real-time telemetry
- **Streaming format:** 100% HLS CMAF (inherited from BAMTech)
- **Scale:** Designed for 59M+ concurrent viewers (demonstrated on Disney+ Hotstar)
- **Mobile apps:** Native (not React Native)
- **DRM:** Widevine + FairPlay

### Rate Limiting / Detection
- Disney+ uses standard anti-bot measures including device fingerprinting
- No specific rate limiting documentation available
- The reverse-engineered API clients report that Disney+ requires a valid device grant token before any API interaction, adding a layer of device registration
- Disney has historically enforced ToS against scraping services (e.g., shutting down Disney Dining reservation scrapers)

---

## 7. Account Structure & Integration Points

### Account Hierarchy
```
Disney+ Account (1 per subscription)
  |
  +-- Profile 1 (Standard - account owner)
  |     +-- Content Rating: TV-MA (default for 18+)
  |     +-- Profile PIN: Optional (4-digit)
  |     +-- Continue Watching
  |     +-- Watchlist
  |     +-- Autoplay Settings
  |
  +-- Profile 2 (Standard or Junior Mode)
  |     +-- Content Rating: Configurable (password required)
  |     +-- Profile PIN: Optional
  |     +-- Junior Mode: Optional toggle
  |     +-- Kid-Proof Exit: Available if Junior Mode enabled
  |     +-- ...
  |
  +-- Profiles 3-7 (same structure, max 7 total)
  |
  +-- Extra Member (optional, 1 max, paid add-on)
        +-- Separate profile outside household
        +-- $6.99/mo (Basic) or $9.99/mo (Premium)
```

### Subscription Tiers (relevant to features)
| Plan | Price (US) | Ads | Streams | Resolution | Downloads |
|---|---|---|---|---|---|
| **Basic (with Ads)** | $9.99/mo | Yes | 2 | 1080p | No |
| **Premium (no Ads)** | $18.99/mo | No | 4 | 4K UHD + HDR | Yes (10 devices) |

Note: Disney+ also offers bundle plans with Hulu and ESPN+ at various price points.

### Sharing / Household Model
- **Household restriction:** Disney+ is limited to a single household (devices on the same home network)
- **Paid sharing crackdown:** Launched September 2024. Disney+ monitors device links and internet connections to detect out-of-household usage
- **Extra Member:** One additional user outside the household can be added for a monthly fee
- **Verification:** Out-of-household access triggers a verification prompt with a one-time passcode sent to the account holder's email
- **Implication for Phosra:** Phosra's servers accessing Disney+ from a non-household IP address could trigger sharing enforcement. This is a significant operational risk.

### Key Integration Points for Phosra
1. **Profile as unit of control** -- Phosra maps child to Disney+ profile (1:1)
2. **Password gate on settings changes** -- Content rating and PIN changes require account password (no separate MFA, simpler than Netflix)
3. **Unofficial API for reads** -- Community-developed API clients demonstrate that profiles, content metadata, and active profile selection are accessible via the private API
4. **Playwright for settings writes** -- Parental control settings changes (content rating, PIN, Junior Mode) are not exposed via known API endpoints and require browser automation
5. **No OAuth** -- No partner/third-party OAuth; credential storage required
6. **Session management** -- OAuth tokens with refresh capability; longer-lived than Netflix session cookies
7. **Household detection** -- Phosra must consider the paid sharing crackdown when accessing from external servers

---

## 8. API Accessibility & Third-Party Integration

### API Accessibility Score: **Level 1 -- Unofficial Read-Only**

Disney+ has no public API for developers. However, two independent community projects have successfully reverse-engineered the private API for authentication, profile listing, and content metadata reads. Write operations for parental controls have not been achieved via API and require browser automation.

### Public API Assessment

| Question | Answer | Evidence / Source |
|---|---|---|
| Does a public API exist? | No | Disney+ keeps its API private for consumer privacy, UX, and content protection |
| Historical context | Never had a public API | Disney+ launched in 2019 with no public API and has never offered one |
| Is there a developer portal? | No (for Disney+ streaming) | Disney has an ADK for licensed device distributors only |
| Is there API documentation? | Unofficial only | jonbarrow/disneyplus-client and pam-param-pam/Disney-Plus-api-wrapper |
| Is there a partner program? | Limited (affiliate only) | Disney+ Partner Program is for affiliate marketing, not API access |
| Partner program scope? | Marketing/referral only | No API access, no parental control scope |
| Is there an OAuth/delegated access flow? | No | No third-party OAuth flow exists |
| Can third parties request parental control access? | No | No mechanism exists to request API access for parental controls |

### Internal API Assessment

| Question | Answer | Evidence / Source |
|---|---|---|
| What internal API protocol is used? | REST (private) | Reverse-engineered from iOS app (jonbarrow) |
| Primary API endpoint(s) | Multiple REST endpoints behind device grant + OAuth | Community projects demonstrate auth, profiles, search, metadata |
| Authentication mechanism | Device grant > OAuth 2.0 Bearer tokens | Both open-source clients implement this flow |
| Are internal APIs stable? | Unknown, likely moderately stable | API clients have been functional across multiple Disney+ versions |
| Is API schema discoverable? | No (no GraphQL introspection) | REST API, not GraphQL -- no introspection available |
| Are there undocumented but useful endpoints? | Yes | Profile listing, profile selection, content search, metadata |

### Per-Capability Accessibility Matrix

| Capability | Feature Exists? | Public API? | Unofficial API? | Access Method | Auth Required | 3rd Party Can Control? | Verdict |
|---|---|---|---|---|---|---|---|
| Profile creation | Yes (password-gated when restricted) | No | No | Playwright | Password | With risk | Browser automation, password gate |
| Profile types (Junior Mode) | Yes | No | Read-only | Playwright for write | Password | With risk | Read via API, write via browser |
| Content rating filters | Yes (per-profile, password-gated) | No | No | Playwright for write | Password | With risk | Password gate simpler than Netflix MFA |
| Per-title blocking | No | N/A | N/A | Not possible | N/A | No | Platform does not offer this feature |
| Profile PIN/lock | Yes (per-profile) | No | No | Playwright | Password | With risk | Password re-entry needed to set PIN |
| Viewing history | Partial (Continue Watching only) | No | Partial (profile activity) | Unofficial API / Playwright | Bearer token | Read-only | Sparse data -- no timestamps or history log |
| Autoplay controls | Yes (2 toggles) | No | No | Playwright | Bearer token | With risk | Low-priority write |
| Screen time limits | No | N/A | N/A | Not possible | N/A | No | Platform gap -- Phosra-managed only |
| Parental event notifications | No | N/A | N/A | Not possible | N/A | No | Platform gap -- Phosra-managed only |
| Account settings | Yes | No | Partial | Playwright for write | Password | With risk | Standard browser automation |

### Third-Party Integration Reality Check

Every major parental control application operates at the **device or OS level only** when it comes to Disney+. None integrate with Disney+ APIs:

| App | Disney+ Integration Approach | API Usage |
|---|---|---|
| **Bark** | Device-level app time limits and scheduling; can restrict Disney+ to certain hours or daily limits. Cannot see what is being watched within Disney+. | None |
| **Qustodio** | Device-level time limits and app blocking. Can block Disney+ entirely or limit total screen time. No content-level visibility. | None |
| **Net Nanny** | Device-level web/app filtering. Binary allow/block for Disney+ app. | None |
| **Mobicip** | Device-level app scheduling and blocking for Disney+. | None |
| **Apple Screen Time** | OS-level app time limits for Disney+ on iOS/iPadOS/macOS. Can restrict by time of day or daily limit. | None |
| **Google Family Link** | OS-level app management on Android. Can set daily limits for Disney+ app. | None |

**Key takeaway:** No parental control product has achieved direct API integration with Disney+. The industry standard is to treat Disney+ as an opaque app controllable only at the device level.

### Legal / ToS Risk Summary

**Disney Terms of Use, Section 2.B.x** explicitly prohibits:

> "access, monitor, copy or extract the Disney Products using a robot, spider, script, or other automated means, including, for the avoidance of doubt, for the purposes of creating or developing any AI Tool, data mining or web scraping or otherwise compiling, building, creating or contributing to any collection of data, data set or database"

**Section 2.B.v** further prohibits:

> "move, decompile, reverse-engineer, disassemble, or otherwise reduce to human-readable form the Disney Products and/or the video player(s), underlying technology, any digital rights management mechanism, device, or other content protection or access control measure"

**Risk assessment:**
- **ToS violation:** All API access and browser automation constitute violations of Disney's Terms of Use
- **Enforcement precedent:** Disney has enforced ToS against scraping services (Disney Dining reservation scrapers were shut down)
- **COPPA settlement:** Disney paid $10M in December 2025 to settle FTC COPPA violations related to YouTube children's content labeling. This heightened sensitivity to child data privacy may make Disney more aggressive toward third-party tools accessing child profiles
- **Household sharing enforcement:** Disney's paid sharing crackdown (September 2024) includes device monitoring and IP-based household detection, which could flag Phosra's server-based access
- **Account suspension risk:** Medium-High. Disney monitors for out-of-household access and has a track record of enforcing ToS

### Overall Phosra Enforcement Level: **Browser-Automated**

Disney+ offers robust parental controls natively (Junior Mode, content ratings, profile PINs, profile creation restrictions), but no API access exists for third-party tools to manage these controls programmatically. Phosra must rely on browser automation for all write operations, with unofficial API reads possible for profile information.
