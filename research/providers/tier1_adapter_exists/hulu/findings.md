# Hulu Parental Controls Research Findings

**Platform:** Hulu (Disney subsidiary; standalone app being phased out into Disney+ in 2026)
**Research Date:** 2026-03-01
**Account Type:** Hulu (No Ads) with Live TV bundle
**Research Method:** Web research, public documentation, community reports, Hulu Help Center
**Key Context:** Hulu standalone app shutting down in 2026; full integration into Disney+ app underway. All Hulu content already available on Disney+ as of October 2025.

---

## 1. Profile Management

### Profile Structure
- **Max profiles:** 7 per account (1 primary account holder + 6 additional profiles)
- **Profile types:**
  - **Standard profile** -- Full access to all content; maturity restrictions based on age entered at profile creation
  - **Kids profile** -- Restricted UI; content limited to TV-Y, TV-Y7, TV-G, TV-PG, and G-rated movies only; no access to Hulu + Live TV channels
- **Profile creation:** Any user who can access the account can create profiles from the "Who's Watching" screen or Manage Profiles page
  - When PIN Protection is enabled, creating a **non-Kids profile** requires the PIN
  - Creating a **Kids profile** does not require a PIN (this is a deliberate choice to make it easy to add kids profiles)
  - Profile creation requires a name, optional avatar, and date of birth
  - If the date of birth indicates the user is under 18, a parental consent checkbox is required
- **Age-based restrictions:** When a standard (non-Kids) profile is created with a birthday indicating age under 17, R-rated and TV-MA content is automatically blocked. Children under 13 are further restricted from R-rated films and TV-MA shows. However, a 17-year-old profile can access TV-MA content.
- **Avatar system:** Basic selection of avatars from Hulu/Disney properties
- **Kids UI:** Simplified interface showing only the Kids Hub content. No access to Live TV channels, account settings, or mature content categories. No ability to search for or discover adult content.

### Profile Settings (per profile)
- Display name
- Avatar image
- Date of birth (determines content restrictions for non-Kids profiles)
- Kids toggle (on/off at creation time)
- Autoplay next episode (per-profile, per-device)
- Language/subtitle preferences

### Security Gaps
- **Birth year cannot be changed by user** -- must contact Hulu support, which provides a modest safeguard against children aging themselves up
- **Birth year workaround** -- a child could create a new profile with a false birthdate if PIN protection is not enabled
- **Single PIN for all profiles** -- the same PIN that locks adult profiles also gates profile creation, meaning a teen who learns the PIN gains access to everything
- **Kids profile is one-size-fits-all** -- no way to distinguish between a 3-year-old and an 11-year-old within the Kids profile; a preschooler sees the same content as a tween

---

## 2. Content Restrictions

### Maturity Rating Tiers

Hulu uses a binary system rather than Netflix's tiered slider. There are effectively two modes:

| Hulu Mode | MPAA Ratings Included | TV Ratings Included | Description | Age Range |
|---|---|---|---|---|
| **Kids Profile** | G | TV-Y, TV-Y7, TV-G, TV-PG | Restricted to Kids Hub content only. No live TV access. | 2-12 |
| **Under-13 Standard** | G, PG | TV-Y, TV-Y7, TV-G, TV-PG | Age-gated; R and TV-MA blocked based on birthdate | 0-12 |
| **Under-17 Standard** | G, PG, PG-13 | TV-Y through TV-14 | Age-gated; R and TV-MA blocked based on birthdate | 13-16 |
| **Adult / 17+ Standard** | G, PG, PG-13, R, NC-17 | All including TV-MA | Full access to all content | 17+ |

**Critical limitation:** Unlike Netflix (4 configurable tiers per profile) or Disney+ (content rating selector), Hulu provides **no configurable maturity level**. It is either a Kids profile or it is not. For non-Kids profiles, restrictions are determined solely by the birthdate entered at profile creation. Parents cannot manually set a maturity ceiling.

### Phosra Rating System Mapping

| Phosra System | Hulu Support | Notes |
|---|---|---|
| **MPAA (Film)** | Full | G, PG, PG-13, R, NC-17 all present in catalog |
| **TV Parental Guidelines** | Full | TV-Y, TV-Y7, TV-G, TV-PG, TV-14, TV-MA |
| **ESRB (Games)** | N/A | No gaming content on Hulu |
| **PEGI (EU Games)** | N/A | Not applicable |
| **Common Sense Media** | None | Hulu does not display CSM ratings |

### Title-Specific Restrictions
- **Hulu does NOT support per-title blocking.** There is no mechanism to block individual shows or movies by name.
- This is a significant gap compared to Netflix, which offers per-profile title blocking.
- Parents cannot hide, remove, or block specific titles from appearing.
- The only workaround is the binary Kids profile vs. standard profile distinction.

### Advertising Content Gap
- **Ads are not rated or filtered by profile maturity.** On ad-supported plans, a child watching a TV-PG show can see advertisements for TV-MA content (horror movies, adult dramas, etc.). These ads cannot be skipped immediately.
- This is a well-documented complaint and a significant parental control gap unique to ad-supported plans.

### FX on Hulu / Premium Content
- FX on Hulu includes heavily mature content (The Bear, Shogun, American Horror Story, etc.) rated TV-MA
- This content is automatically blocked on Kids profiles and under-17 standard profiles
- However, no granular control exists to allow some FX content while blocking others

### Add-On Channel Content (Showtime, STARZ, Max)
- Premium add-on content follows the same profile-level restrictions
- Kids profiles cannot access any add-on channel content
- Standard profiles with age-based restrictions apply the same rating filter to add-on content
- No separate parental control exists for individual add-on channels

---

## 3. PIN / Lock Protection

### PIN Protection System
- **Type:** 4-digit numeric PIN
- **Scope:** Account-wide (single PIN applies to all profiles on the account)
- **Purpose:**
  - Prevents access to non-Kids profiles (any adult/teen profile requires PIN entry)
  - Prevents creation of new non-Kids profiles without authorization
  - Does NOT protect Kids profiles (Kids profiles are always accessible without PIN)
- **Setting location:** hulu.com > Profile icon > Manage Profiles > Parental Controls > PIN Protection toggle
- **Setup platforms:** Web (hulu.com) primarily; also available on some device apps running the latest Hulu version
- **Reset/Change:** Requires account password to change or disable PIN

### MFA / Multi-Factor Authentication
- **Hulu does NOT offer native 2FA/MFA for account access or parental control changes**
- No email verification codes for settings changes
- No SMS verification
- No authenticator app support
- Password re-entry is required to change or disable the PIN, but no additional verification layer exists
- This is a significant security gap compared to Netflix (MFA for parental control changes)

### PIN Vulnerabilities
- Same PIN for all profiles -- a teen who discovers the PIN can access any adult profile and create new unrestricted profiles
- No lockout after failed PIN attempts (no brute-force protection documented)
- PIN is only 4 digits (10,000 possible combinations)
- No MFA backup -- if a child sees the parent enter the PIN, there is no second factor

---

## 4. Screen Time Controls

### Native Support: **NONE**

Hulu does **not** offer any native screen time management features:
- No daily/weekly time limits
- No scheduling (e.g., "no Hulu after 9pm")
- No usage reports or dashboards
- No bedtime/school-time restrictions
- No session duration alerts
- No "are you still watching?" prompt (unlike Netflix)

### Autoplay Controls
- **Autoplay next episode:** Can be toggled on/off per profile AND per device
- This is a useful but limited control -- it reduces passive binge-watching but does not enforce time limits
- Setting location: Account > Playback & Accessibility > Playback Settings > Autoplay next episode

### Workaround Strategies for Phosra
1. **Profile lock approach:** Enable/disable PIN protection on schedule to block access during restricted hours
2. **Device-level controls:** Defer to iOS Screen Time, Android Digital Wellbeing, or router-level scheduling
3. **Autoplay disable:** Turn off autoplay to reduce passive viewing
4. **Viewing history monitoring:** Poll watch history and alert parents when usage exceeds thresholds

---

## 5. Viewing History & Monitoring

### Watch History Access
- **Location:** Home page > "Keep Watching" section (shows in-progress content only)
- **Full history:** Navigate to Profile icon > History to see complete watch history
- **Data available:**
  - Title name
  - Episode/season for series
  - Progress indicator (percentage or "completed")
  - Chronological order (most recent first)
- **Data NOT available:**
  - Exact watch date/timestamp (not shown in UI)
  - Duration watched per session
  - Time of day viewing occurred
  - Device used for viewing
- **Per-profile:** Each profile has separate viewing history; no cross-profile view

### Export Capabilities
- **No export feature.** Hulu does not offer CSV download, API export, or any bulk data export for watch history.
- To get a full history export, users must submit a California Privacy Rights data request through Account settings. This is a manual process with turnaround time, not an automated or on-demand feature.
- This is significantly worse than Netflix (which offers CSV export of viewing activity)

### History Management
- Individual titles can be removed from history (from the History page)
- A child could theoretically delete items from their history to cover tracks
- No "undo" for history deletion

### Real-Time Monitoring
- No "currently watching" indicator available to other profiles
- No real-time notifications or alerts
- No parental dashboard

---

## 6. API / Technical Architecture

### Platform Infrastructure
- **Cloud Provider:** AWS (primary infrastructure since 2017)
- **Backend:** Microservice architecture hosted on "Donki" PaaS (hybrid AWS + on-premise)
- **Web Framework:** Node.js + React (Next.js) for server-side rendering
- **Mobile:** Native iOS and Android apps
- **Authentication:** Email/password login; session cookies for web; OAuth-like device activation for TVs and consoles
- **Login URL:** `https://auth.hulu.com/web/login`

### Public API Status
- **No public API exists.** Hulu has never offered a public developer API.
- No developer portal, no API documentation, no partner program
- Third-party content metadata APIs exist (Watchmode, Reelgood) but these provide catalog data only, not account/parental control access
- A now-defunct `hulu-content-api` by PBS exists on GitHub but is deprecated and was limited to content metadata

### Internal API Assessment

| Question | Answer | Evidence / Source |
|---|---|---|
| Does a public API exist? | No | Confirmed by multiple sources; Hulu deliberately withholds API access |
| Historical context | No public API has ever existed for account features | Unlike Netflix (which had a public API until 2014), Hulu never opened one |
| Developer portal? | No | No developer.hulu.com or equivalent |
| API documentation? | None | No official or unofficial documentation |
| Partner program? | No | No parental control or child safety partner program |
| OAuth/delegated access? | No | No third-party OAuth flow |
| Can third parties request parental control access? | No | No mechanism exists |

### Internal API Observations
- Hulu's web app (React/Next.js) communicates with backend services via REST-style API calls
- Authentication appears to use session cookies set after login at `auth.hulu.com`
- No GraphQL introspection evidence found (unlike Peacock's AppSync GraphQL)
- API endpoints are not publicly documented and change with deployments
- As Hulu transitions into Disney+, the internal API surface is likely migrating to Disney's unified backend architecture

### Key API Endpoints (Inferred)

| Endpoint Pattern | Purpose | Auth Required |
|---|---|---|
| `auth.hulu.com/web/login` | Account authentication | None (produces session) |
| `home.hulu.com/v*/users/self/profiles` | Profile management | Session cookie |
| `home.hulu.com/v*/users/self/watch_history` | Watch history | Session cookie |
| `guide.hulu.com/v*/channels` | Live TV guide (Live TV plan) | Session cookie |
| `discover.hulu.com/content/v*/search` | Content search/discovery | Session cookie |

Note: These endpoints are inferred from web app behavior analysis and third-party research. They are undocumented, unstable, and subject to change without notice.

### Rate Limiting / Detection
- No explicit rate limiting documentation
- AWS WAF likely in place (standard for AWS-hosted services)
- No known CAPTCHA challenges during normal web browsing sessions
- Hulu does monitor for password sharing via IP address analysis and device fingerprinting (crackdown started March 2024)
- Session cookies appear to have standard TTL; exact duration unknown

---

## 7. Account Structure & Integration Points

### Account Hierarchy
```
Hulu Account (1 per subscription)
  |
  +-- Primary Profile (account owner)
  |     +-- Full access to all content + account settings
  |     +-- Billing and subscription management
  |     +-- PIN Protection control
  |     +-- Can create/delete other profiles
  |
  +-- Standard Profile (up to 6 additional, age-gated)
  |     +-- Content filtered by birthdate
  |     +-- Under 13: No R/TV-MA content
  |     +-- Under 17: No R/TV-MA content
  |     +-- 17+: Full content access
  |     +-- PIN required to access (if PIN enabled)
  |
  +-- Kids Profile (counted toward 6 additional)
        +-- Restricted to Kids Hub content only
        +-- No Live TV access
        +-- No account settings access
        +-- No PIN required to access
```

### Subscription Tiers (relevant to parental control features)

| Plan | Price/mo | Streams | Live TV | Ads | Notes |
|---|---|---|---|---|---|
| Hulu (With Ads) | $11.99 | 2 | No | Yes | Ad content not filtered by profile maturity |
| Hulu (No Ads) | $18.99 | 2 | No | No | Eliminates ad maturity gap |
| Hulu + Live TV (With Ads) | $89.99 | 2 | Yes (95+ channels) | Yes | Includes Disney+ and ESPN Select |
| Hulu + Live TV (No Ads) | $99.99 | 2 | Yes (95+ channels) | No | Includes Disney+ and ESPN Select |
| Unlimited Screens Add-on | +$9.99 | Unlimited (home WiFi) + 3 mobile | -- | -- | Only for Live TV plans |

**Parental control implications by tier:**
- **Ad-supported plans:** Ads are NOT filtered by profile maturity -- a child can see ads for mature content. This is a significant gap that Phosra should document prominently for parents.
- **Live TV plans:** Kids profiles block Live TV access entirely. Standard profiles can access live TV without content filtering on live broadcasts.
- **Disney+ bundle:** Live TV plans include Disney+, which has its own separate parental controls (more granular than Hulu's). Profile settings are NOT shared between Hulu and Disney+ -- they are managed independently.

### Sharing/Household Model
- Hulu defines "household" as the primary personal residence associated with the account
- Password sharing crackdown began March 14, 2024
- IP address analysis and device fingerprinting used to detect out-of-household access
- Accounts suspected of sharing outside the household may be limited or terminated
- **Implication for Phosra:** Automation from Phosra servers (not in the user's home) could trigger sharing detection

### Key Integration Points for Phosra
1. **Profile as unit of control** -- Phosra maps child to Hulu profile (1:1)
2. **PIN as primary gate** -- Account-wide PIN is the only mechanism to restrict profile access
3. **No API access** -- All operations must go through browser automation
4. **No MFA** -- Simpler than Netflix for writes (no MFA gate), but also less secure
5. **No per-title blocking** -- Phosra cannot implement title-level restrictions
6. **Binary maturity model** -- Kids profile or not; no configurable maturity slider
7. **Imminent Disney+ migration** -- Hulu standalone app shutting down in 2026; adapter must account for transition to Disney+ parental controls

---

## 8. API Accessibility & Third-Party Integration

### API Accessibility Score: Level 0 (Walled Garden)

Hulu represents one of the most closed platforms in the streaming landscape:
- No public API has ever existed for account/user features
- No developer portal, no partner program, no OAuth
- No documented internal APIs (unlike Netflix's well-studied Falcor/Shakti)
- Minimal community reverse-engineering effort (far less than Netflix)
- Transitioning to Disney+ backend, making current API surface even more volatile

### Per-Capability Accessibility Matrix

| Capability | Feature Exists? | Public API? | Unofficial API? | Access Method | Auth Required | 3rd Party Can Control? | Verdict |
|---|---|---|---|---|---|---|---|
| Profile creation | Yes | No | Unknown | Playwright | Session cookie + PIN | With risk | Browser automation; PIN gate for non-Kids |
| Profile types (kids) | Yes (binary) | No | Unknown | Playwright | Session cookie | With risk | Toggle at creation only; no slider |
| Content rating filters | Partial (age-gated, not configurable) | No | No | Not directly controllable | N/A | No | Birthdate-based; cannot override |
| Per-title blocking | No | N/A | N/A | Not possible | N/A | No | Platform does not offer this |
| Account PIN | Yes (account-wide) | No | Unknown | Playwright | Password | With risk | Web-based setup; password needed to change |
| Viewing history | Partial (no timestamps/duration) | No | Possibly (REST) | Playwright or unofficial API | Session cookie | Read-only (with risk) | Sparse data; no export |
| Autoplay controls | Yes (per-profile, per-device) | No | Unknown | Playwright | Session cookie | With risk | Per-device complicates automation |
| Screen time limits | No | N/A | N/A | Not possible | N/A | No | Platform gap |
| Parental event notifications | No | N/A | N/A | Not possible | N/A | No | Platform gap |
| Account settings | Yes | No | Unknown | Playwright | Session cookie + password | With risk | Standard browser automation |

### Third-Party Integration Reality Check

#### What Existing Parental Control Apps Do with Hulu

| App | Hulu Integration Approach | API Usage |
|---|---|---|
| **Bark** | Device-level app monitoring; detects Hulu is open but cannot see content | None |
| **Qustodio** | Device-level time limits; can block Hulu app entirely or by schedule | None |
| **Net Nanny** | Device-level web/app filtering; binary allow/block for Hulu | None |
| **Mobicip** | Device-level app scheduling and blocking | None |
| **FamiSafe** | Device-level app usage monitoring and time limits | None |
| **Apple Screen Time** | OS-level app time limits and scheduling for Hulu app | None |
| **Google Family Link** | Device-level app approval and time limits | None |

**Key takeaway:** No parental control product integrates with Hulu APIs. All operate at the device/OS level, treating Hulu as an opaque black box. This is identical to the Netflix situation.

#### Has Any Third Party Achieved API Integration?
- **No.** No parental control service, no monitoring tool, and no third-party application has achieved direct API integration with Hulu for account management or parental control purposes.
- The few third-party "Hulu APIs" that exist (e.g., Watchmode, Reelgood) provide **content catalog metadata only** -- not account, profile, or parental control access.

### Terms of Service Constraints

Hulu's Subscriber Agreement explicitly prohibits:

> Accessing, monitoring, copying, or extracting the Services using a robot, spider, script or other automated means, including for the purposes of creating or developing any AI Tool, data mining or web scraping.

> Using any technology or technique to obscure or disguise your location.

> Bypassing, modifying, defeating, tampering with or circumventing any of the functions or protections of the Services.

**Additional risk factors:**
- Hulu actively monitors for password sharing (crackdown since March 2024)
- IP-based household detection could flag Phosra server access
- Account termination is an explicit consequence for ToS violations
- Disney (Hulu's parent company) has significant legal resources

### Legal & Risk Assessment

| Assessment Area | Detail |
|---|---|
| **ToS on automated access** | Explicitly prohibited. Subscriber Agreement bans robots, scripts, automated means, AI tools, scraping. |
| **ToS on credential sharing** | Subscriber Agreement restricts use to "household" members. Sharing credentials with a third-party service is a gray area. |
| **Anti-bot detection** | Standard AWS WAF. IP-based sharing detection active since March 2024. Less aggressive than Netflix but increasing. |
| **Account suspension risk** | Medium-High. Hulu has stated it will "terminate violators" of sharing/automation policies "at its sole discretion." |
| **Household sharing/IP monitoring** | Active. Hulu monitors IP patterns and device fingerprints. Phosra server access from non-household IP is a risk. |
| **Regulatory safe harbor argument** | Possible but untested. KOSA/COPPA could be cited for child safety purpose, but no precedent exists. |
| **Precedent** | No parental control service has been publicly blocked or allowed by Hulu. No known enforcement actions. |

### Overall Phosra Enforcement Level

| Capability | Enforcement Level | Detail |
|---|---|---|
| Read profiles | Browser-Automated | Playwright to scrape profile list; no known API |
| Read viewing history | Browser-Automated | Playwright to scrape History page; sparse data |
| Set content maturity | Not Possible | Birthdate-based; cannot be changed without support ticket |
| Toggle Kids profile | Browser-Automated | Playwright to create/delete Kids profiles |
| Set account PIN | Browser-Automated | Playwright + password re-entry |
| Per-title blocking | Not Possible | Feature does not exist on platform |
| Screen time limits | Device-Level | No native support; defer to OS/router |
| Autoplay control | Browser-Automated | Playwright per-profile toggle |
| Parental notifications | Not Possible | No native support; Phosra polls history as workaround |

### Hulu-to-Disney+ Transition Impact

**This is the single most important consideration for Hulu adapter development.**

The standalone Hulu app is being shut down in 2026. All Hulu content is migrating into the Disney+ app. This means:

1. **Any Hulu-specific adapter has a limited lifespan** -- it will become obsolete when the Hulu app is discontinued
2. **Disney+ parental controls are more granular** than Hulu's -- Disney+ offers content rating selectors (7 levels), per-profile maturity, and Junior Mode
3. **The correct long-term strategy is to build a Disney+ adapter** that covers both Disney+ and Hulu content within the unified app
4. **Short-term:** A Hulu adapter provides value to families who still use the standalone Hulu app before shutdown
5. **API surface will change** -- Hulu's backend APIs will be replaced by Disney's Streaming API infrastructure, invalidating any current endpoint knowledge
