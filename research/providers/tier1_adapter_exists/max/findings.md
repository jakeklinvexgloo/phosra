# Max (HBO Max) Parental Controls Research Findings

**Platform:** Max (formerly HBO Max; reverting to HBO Max branding July 2025)
**Research Date:** 2026-03-01
**Account Type:** Standard (5 profiles, 2 simultaneous streams)
**Research Method:** Web research, help center documentation, reverse engineering blog analysis, community GitHub projects
**Artifacts:** Help center pages, reverse engineering analysis (abhishekbanthia.com), DmanCoder/hbo-max-api GitHub project

---

## 1. Profile Management

### Profile Structure
- **Max profiles:** 5 per account
- **Profile types:**
  - **Adult profile** -- Full access, maturity level configurable, can be PIN-locked
  - **Kids profile** -- Restricted UI ("Kids Mode"), locked to one of 4 maturity tiers, optional Kid-Proof Exit PIN requirement
- **Profile creation:** Any user can navigate to Manage Profiles and create a new profile. Creating a Kids profile requires toggling "Kids Mode" on and selecting a ratings group. No account password is required to create a profile (this is a **security gap** -- similar to Peacock, any household member can create an unrestricted Adult profile without authentication)
- **Avatar system:** Library of 120+ character avatars from Warner Bros. properties (DC, Looney Tunes, Cartoon Network, HBO originals). Users can also upload custom images. Kids profiles see age-appropriate avatar selections based on their maturity tier
- **Profile name:** 1-14 characters
- **Kids Mode lock:** If a profile's registered birthdate shows the user is under 18, Kids Mode cannot be disabled. This is a notable safety mechanism
- **Default Kids profile:** New accounts include a default Kids profile set to Pre-teens (TV-PG/PG). This can be customized or removed

### Profile Settings (per profile)
- Display name
- Avatar image (select from library or upload custom)
- Kids Mode toggle (on/off -- locked on if birthdate < 18)
- Content ratings group (Little Kids, Big Kids, Pre-teens, Teens -- Kids profiles only)
- Kid-Proof Exit (on/off -- requires Parent Code to exit Kids profile)
- Birthdate (changes require contacting support)
- Profile PIN (Adult profiles only -- 4-digit)
- Autoplay Next Episode (toggle)
- Autoplay Previews (toggle)
- Autoplay Recommended Movies & Series (toggle)
- Language preference
- My List (watchlist)
- Continue Watching

### Kids UI
- Completely separate interface: Kids Home screen shows only content at or below the profile's maturity tier
- Character-based content discovery (browse by character rather than genre)
- Personalized Continue Watching and My List sections
- No access to account management, billing, subscription settings, or password changes
- No ability to search for or view mature content
- Kid-Proof Exit (when enabled) requires Parent Code to leave the Kids profile

**Key question answer:** Profile creation is NOT gated behind authentication. Any household member accessing the profile picker can create an unrestricted Adult profile without entering a password or PIN. This is a security gap that Phosra should flag to parents.

---

## 2. Content Restrictions

### Maturity Rating Tiers

Max uses 4 maturity tiers for Kids profiles, each mapping to US content rating systems:

| Max Tier | TV Ratings | MPAA Ratings | Description | Age Range |
|---|---|---|---|---|
| **Little Kids** | TV-Y | -- | Content designed for the youngest viewers. Animated, simple stories | 2-6 |
| **Big Kids** | TV-Y7, TV-G | G | May include mild fantasy or comedic violence. Little or no strong language or sexual content | 6-9 |
| **Pre-teens** | TV-PG | PG | May contain mild language, suggestive dialogue, sexual situations, and/or moderate violence. **Default for new Kids profiles** | 9-12 |
| **Teens** | TV-14 | PG-13 | May contain coarse language, suggestive dialogue, sexual situations, and/or intense violence | 13-17 |

Adult profiles can access all content by default, including R, NC-17, and TV-MA rated content.

### Phosra Rating System Mapping

| Phosra System | Max Support | Notes |
|---|---|---|
| **MPAA (Film)** | Full | G, PG, PG-13, R, NC-17 all recognized |
| **TV Parental Guidelines** | Full | TV-Y, TV-Y7, TV-Y7-FV, TV-G, TV-PG, TV-14, TV-MA |
| **ESRB (Games)** | N/A | Max has no gaming component |
| **PEGI (EU Games)** | N/A | Not applicable |
| **Common Sense Media** | None | Max does not display or integrate CSM ratings |

### Title-Specific Restrictions
- **Max does NOT offer per-title blocking.** Unlike Netflix, there is no mechanism to block a specific show or movie by name on any profile
- Content filtering is tier-based only -- you set a maximum maturity tier and the profile sees everything at or below that tier
- This is a significant limitation: a parent cannot, for example, allow TV-PG content generally but block a specific TV-PG show they find objectionable
- Third-party parental control apps (Canopy, Mobicip) are recommended by guides as supplements for this gap

### Content Library: The HBO Challenge
Max's content library is uniquely challenging for parental controls because it combines:
- **Heavily adult HBO originals:** Game of Thrones, Euphoria, Succession, The Last of Us, True Detective, Westworld, The Wire
- **Family/kids content:** Sesame Street (licensed through 2027), Looney Tunes, Cartoon Network shows, Studio Ghibli films, DC animated series
- **2025 strategy shift:** Warner Bros. Discovery is actively reducing kids content. Dozens of Cartoon Network shows removed in 2025. HBO Family channel shut down August 2025. Only 11 Cartoon Network shows remain on the platform

---

## 3. PIN / Lock Protection

### Parent Code (Account-Wide)
- **Type:** 4-digit numeric PIN
- **Scope:** Account-wide -- one Parent Code per account, applies to all Kids profiles
- **Purpose:** Required for Kid-Proof Exit (leaving a Kids profile), and for managing Kids profile settings
- **Setup:** Via account settings or hbomax.com/parentcode
- **Platforms:** Available on all platforms (web, mobile, TV, tablet)

### Profile PIN (Per Adult Profile)
- **Type:** 4-digit numeric PIN
- **Scope:** Per Adult profile -- each Adult profile can have its own PIN
- **Purpose:** Prevents unauthorized access to an Adult profile. When locked, the PIN must be entered to switch to that profile
- **Visual indicator:** Locked profiles show a Lock icon beside the avatar
- **Setup:** Manage Profiles > select Adult profile > Lock Profile > enter account password > create 4-digit PIN > Save
- **Password required:** Yes -- setting or changing a Profile PIN requires entering the account password first
- **Reset flow:** Manage Profiles > Reset Profile PIN > enter account password > enter new PIN > Save
- **Forgot PIN flow:** Select "Forgot PIN?" when prompted > verify account password > create new PIN. Confirmation email sent to account email
- **Email notification:** An email is sent to the account email whenever a Profile PIN is added, changed, or reset

### Key Differences from Netflix
- Max has TWO PIN systems: Parent Code (for Kids profile exit) and Profile PIN (for Adult profile access)
- Netflix has one per-profile PIN system
- Max's Parent Code is account-wide; Netflix PINs are per-profile
- Max requires account password to set/change Profile PIN (similar security to Netflix)
- Max does NOT have MFA (email/SMS verification codes) for parental control changes -- only password re-entry

**Key question answer:** The Profile PIN combined with Kid-Proof Exit provides moderate security. A child would need to know the 4-digit Parent Code to exit their Kids profile AND the Adult profile's PIN to access unrestricted content. However, there is no MFA beyond the PIN itself, and the 4-digit space (10,000 combinations) is vulnerable to brute-force if the platform does not rate-limit attempts.

---

## 4. Screen Time Controls

### Native Support: **NONE (with one notable exception)**

Max does **not** offer meaningful native screen time management:
- No daily/weekly time limits
- No scheduling (e.g., "no Max after 9pm")
- No usage reports or dashboards
- No session duration alerts
- No bedtime/school-time restrictions

**Note:** One search result mentioned a screen time slider feature for kids profiles, but this appears to be either a very limited feature, region-specific, or recently added. The official help documentation does not prominently feature screen time limits as a core capability. Further live testing is needed to confirm.

### Autoplay Controls
Max offers three autoplay toggles per profile:
1. **Autoplay Next Episode** -- When credits begin, next episode appears with 15-second countdown
2. **Autoplay Previews** -- Auto-playing preview trailers while browsing
3. **Autoplay Recommended Movies & Series** -- Auto-playing recommended content after a title ends

These can be toggled off to reduce passive binge-watching behavior.

### Workaround Strategies for Phosra
1. **Profile lock approach:** Lock the Kids profile by changing the Parent Code or adding a Profile PIN to a temporary "locked" state (disruptive but functional)
2. **Device-level controls:** Defer to OS-level screen time (iOS Screen Time, Android Digital Wellbeing, router schedules)
3. **Autoplay disable:** Turning off all three autoplay settings reduces passive consumption
4. **Continue Watching monitoring:** Track the Continue Watching list as a proxy for viewing activity

---

## 5. Viewing History & Monitoring

### Viewing History: **SEVERELY LIMITED**

Max is one of the weakest major streaming platforms for viewing history:

- **No dedicated viewing history page.** Unlike Netflix, Max does not have a "Viewing Activity" page that lists everything watched
- **Continue Watching:** The only built-in indicator of past viewing. Shows titles currently in progress. Items automatically removed after 90 days
- **My List:** User-curated watchlist (what they intend to watch, not what they have watched)
- **Search history:** Some record of past searches exists in the app
- **No export capability.** No CSV export, no data download, no API endpoint for viewing history
- **No timestamps.** Continue Watching does not show when a title was watched or for how long
- **No per-profile viewing log.** No chronological history of completed titles

### Clearing/Hiding Capabilities
- Users can remove items from Continue Watching (Edit > Remove or Clear All)
- On mobile: Profile icon > Continue Watching > Edit > X to remove items
- Items auto-expire from Continue Watching after 90 days
- A child could easily clear their Continue Watching to cover their tracks

### Implications for Phosra
- **Phosra cannot build meaningful parental reports** from Max's native data. The platform exposes almost no viewing history data
- The Continue Watching section provides only titles-in-progress, not a historical viewing log
- No duration, no timestamps, no completed-title log
- This is the single biggest monitoring gap on Max compared to Netflix

**Key question answer:** Phosra cannot build meaningful parental reports from Max's native data. The platform's viewing history is functionally nonexistent. Phosra would need to poll Continue Watching frequently and maintain its own viewing log, but even this approach misses completed titles and provides no duration data.

---

## 6. API / Technical Architecture

### Primary API: Comet REST API

**Base URL:** `comet.api.hbo.com`
- Max uses a REST API architecture (not GraphQL, not a proprietary protocol like Netflix's Falcor)
- The API handles authentication, content delivery, profile management, and settings
- Analytics/telemetry goes to a separate endpoint: `telegraph.api.hbo.com`

### Key API Endpoints Discovered

| Endpoint | Purpose | Auth Required |
|---|---|---|
| `comet.api.hbo.com/tokens` | Authentication -- login with credentials | None (creates token) |
| `comet.api.hbo.com/content` | Content catalog and metadata | Session token |
| `telegraph.api.hbo.com/events/v1` | Analytics and telemetry events | Session token |
| `play.max.com` / `play.hbomax.com` | Web player application | Session cookie |

### Authentication
- **Login endpoint:** `POST /tokens` -- sends username and password in the request payload
- **Security concern:** Research (abhishekbanthia.com, 2021) found credentials transmitted in plaintext format in the payload body. HTTPS protects the transport layer, but the credential format within the payload is notable
- **Token-based auth:** After login, the API returns tokens used for subsequent requests
- **Session management:** Token-based sessions (not cookie-only like Netflix)
- **Profile context:** API supports profile switching, subscription status queries, and PIN configuration

### Platform Architecture
- Originally built on **BAMTech** framework (same technology stack as Disney+, since BAMTech was acquired by Disney)
- HBO later migrated off BAMTech to their own in-house platform
- Uses MPEG-DASH and HLS with DRM for streaming
- Custom in-house DRM system (post-2021)
- Analytics tracks: app launches, viewport changes, error metrics, profile switching, page load timing (renderStart, loadingDotsRemoved, viewPortReady), navigation events

### CAPTCHA / Bot Detection
- Max implemented a CAPTCHA system during the May 2023 rebrand (HBO Max to Max)
- The CAPTCHA was widely criticized as extremely difficult (dice-based math puzzles, animal sound identification)
- Users reported being locked out after ~5 failed attempts
- Max indicated the CAPTCHA would be removed but timeline was unclear
- Current bot detection posture: Moderate. Less aggressive than Netflix but more than Peacock
- No known WAF vendor identified (unlike Peacock's AWS WAF)

### Mobile Architecture
- iOS app uses a JavaScript framework (non-native UIKit)
- The app makes requests to the same `comet.api.hbo.com` backend
- Feature flags control analytics and certain UI elements

### Rate Limiting / Detection
- No explicit rate limiting documented in community research
- CAPTCHA challenges observed during login flows
- Account password required for sensitive operations (PIN changes)
- Email notifications sent on PIN changes (creates audit trail)

### Community API Projects
- **DmanCoder/hbo-max-api (GitHub):** A community reverse-engineering project that documents HBO Max API endpoints. Includes API routes, utilities, and validation logic. However, the project may be outdated given the HBO Max to Max to HBO Max rebranding cycles
- **abhishekbanthia.com/reverse-engineering-hbo-max/:** Detailed technical blog post documenting the API architecture, authentication flow, and endpoint discovery via iOS app traffic analysis

---

## 7. Account Structure & Integration Points

### Account Hierarchy
```
Max Account (1 per subscription)
  |
  +-- Profile 1 (Adult - account owner)
  |     +-- Maturity: All ratings (default)
  |     +-- Profile PIN: Optional 4-digit
  |     +-- Continue Watching
  |     +-- My List
  |     +-- Autoplay settings (3 toggles)
  |
  +-- Profile 2 (Adult or Kids)
  |     +-- If Kids: Maturity tier (Little Kids/Big Kids/Pre-teens/Teens)
  |     +-- If Kids: Kid-Proof Exit (optional, uses Parent Code)
  |     +-- If Adult: Profile PIN (optional)
  |     +-- Continue Watching
  |     +-- My List
  |
  +-- Profiles 3-5 (same structure as Profile 2)
  |
  +-- Account-Level Settings
        +-- Parent Code (4-digit, account-wide)
        +-- Account email & password
        +-- Subscription tier
        +-- Extra Member management (2025+)
```

### Subscription Tiers (relevant to features)

| Plan | Monthly Price | Streams | Resolution | Downloads | Ads |
|---|---|---|---|---|---|
| **With Ads** | $10.99/mo | 2 | 1080p | No | Yes |
| **Standard** | $16.99/mo ($18.49 after Oct 2025 increase) | 2 | 1080p | Up to 30 | No |
| **Premium/Ultimate** | $20.99/mo ($22.99 after Oct 2025 increase) | 4 | 4K UHD | Up to 100 | No |

**Parental controls are available on all tiers** -- there is no tier restriction on Kids profiles, PINs, or maturity settings.

### Sharing / Household Model
- **Extra Member Add-On** ($7.99/month): Introduced April 2025. Allows sharing with one person outside the household. Extra member gets their own account, password, and profile
- **Password sharing crackdown:** Began September 2025 with soft messaging, escalating to forced action. Uses IP address, device ID, and user activity to detect multi-household usage
- **Phosra implication:** Phosra's server-side access (from data center IPs) could trigger sharing enforcement. This is a **critical risk** for browser automation from non-residential IPs

### Key Integration Points for Phosra
1. **Profile as unit of control** -- Phosra maps child to Max Kids profile (1:1)
2. **Parent Code for Kid-Proof Exit** -- Phosra should ensure Kid-Proof Exit is enabled and manage the Parent Code
3. **Profile PIN for Adult profile lock** -- Phosra can lock Adult profiles to prevent kids from accessing them
4. **No per-title blocking** -- Phosra cannot block specific titles; must rely on maturity tier settings
5. **No viewing history** -- Phosra cannot build meaningful watch reports; must poll Continue Watching
6. **No OAuth** -- Credential storage required (same as Netflix)
7. **Token-based auth** -- REST API with token auth may be more accessible than Netflix's Falcor
8. **Password sharing detection** -- Phosra server access may trigger household enforcement

---

## 8. API Accessibility & Third-Party Integration

### API Accessibility Score: **Level 1 (Unofficial Read-Only)**

Max sits between Level 0 (Peacock) and Level 1 (Netflix). The REST API at `comet.api.hbo.com` is more discoverable than Netflix's Falcor protocol and uses standard REST patterns, making it easier to reverse-engineer. However, there is no public API, no developer portal, no partner program, and no OAuth flow.

**Justification for Level 1:**
- Internal API (`comet.api.hbo.com`) has been reverse-engineered by community projects
- REST architecture is more standard and discoverable than Netflix's Falcor
- Token-based authentication is simpler than Netflix's MSL + session cookies
- Write operations (PIN changes, profile settings) likely require Playwright due to CAPTCHA and password gates
- No public API or partner program of any kind

### Per-Capability Accessibility Matrix

| Capability | Feature Exists? | Public API? | Unofficial API? | Access Method | Auth Required | 3rd Party Can Control? | Verdict |
|---|---|---|---|---|---|---|---|
| Profile creation | Yes (unprotected) | No | Possible (REST) | Playwright or API | Token | With risk | Unprotected creation is both easy to automate and a bypass vector |
| Profile types (kids) | Yes | No | Read-only (REST) | Playwright for write | Token | With risk | Read via API, write via browser |
| Content rating filters | Yes (4 tiers, per-profile) | No | Read-only (REST) | Playwright for write | Token + password | With risk | Password gate on changes, no MFA |
| Per-title blocking | **No** | N/A | N/A | Not possible | N/A | **No** | Platform does not offer this feature |
| Profile PIN (Adult) | Yes (per-profile) | No | Unknown | Playwright | Token + password | With risk | Password re-entry required |
| Parent Code | Yes (account-wide) | No | Unknown | Playwright | Token + password | With risk | Account-wide, password gated |
| Kid-Proof Exit | Yes (per Kids profile) | No | Unknown | Playwright | Token + Parent Code | With risk | Requires Parent Code management |
| Viewing history | **Partial** (Continue Watching only) | No | Possibly (REST) | API or Playwright | Token | Read-only | Sparse data -- no timestamps, no historical log |
| Autoplay controls | Yes (3 toggles) | No | Unknown | Playwright | Token | With risk | Low-priority write |
| Screen time limits | **No** | N/A | N/A | Not possible | N/A | **No** | Platform gap -- Phosra-managed only |
| Parental event notifications | **No** | N/A | N/A | Not possible | N/A | **No** | Platform gap -- Phosra-managed only |
| Account settings | Yes | No | Partial (REST) | Playwright for write | Token + password | With risk | Standard browser automation |

### Third-Party Integration Reality Check

**What existing parental control apps do with Max:**

| App | Max Integration Approach | API Usage |
|---|---|---|
| **Bark** | Device-level monitoring; detects Max app is open but cannot see content | None |
| **Qustodio** | Device-level app blocking and time limits | None |
| **Net Nanny** | Device-level web/app filtering; blocks Max entirely or allows entirely | None |
| **Canopy** | OS-level screen time management; recommended by guides as supplement for Max's weak native controls | None |
| **Mobicip** | Device-level app scheduling and blocking; has specific HBO Max setup guide | None |
| **FamiSafe** | Device-level app usage monitoring and time limits | None |

**Key takeaway:** No parental control product integrates with Max APIs. All operate at the device/OS level only. The industry treats Max as an opaque app.

### Terms of Service Constraints

HBO Max Terms of Use explicitly prohibit:
- Use of "**data mining, robots, viruses, worms, bugs, or other data gathering and extraction tools** on the Platform"
- Attempts to "**circumvent, disable, or otherwise tamper with any security technology** protecting any Content, system resources, accounts or any other part of the Platform"

| Assessment Area | Detail |
|---|---|
| **ToS on automated access** | Explicitly prohibited: robots, data mining, automated extraction tools |
| **ToS on credential sharing** | Password sharing crackdown in effect since September 2025. Extra Member add-on is the sanctioned path |
| **Anti-bot/automation detection** | CAPTCHA system (dice puzzles, animal sounds) implemented at login. ~5 attempts before lockout. Less aggressive than Netflix overall |
| **Account suspension risk** | Medium. Password sharing enforcement is active; automated access from data center IPs could trigger household violation flags |
| **Household sharing/IP monitoring** | Active enforcement since September 2025. Uses IP address, device ID, and user activity patterns |
| **Regulatory safe harbor** | Same KOSA/DSA/UK OSA landscape as Netflix. No specific exemption for parental control tools |
| **Precedent** | No parental control service has been blocked or granted access by Max/HBO Max |

### Overall Phosra Enforcement Level: **Browser-Automated**

Max's REST API architecture offers slightly better prospects than Netflix's Falcor for unofficial reads. However, the absence of a public API, the active password sharing crackdown, and CAPTCHA login gates mean that Phosra must rely on browser automation for all write operations and may face challenges even with read operations. The lack of viewing history is the most critical gap -- Phosra's monitoring capabilities on Max will be significantly weaker than on Netflix.
