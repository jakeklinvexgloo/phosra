# Netflix Parental Controls Research Findings

**Platform:** Netflix
**Research Date:** 2026-02-25
**Account Type:** Premium (5 profiles)
**Research Method:** Playwright browser automation (headless, HAR recording)
**Artifacts:** 120 screenshots, 51 unique API endpoints captured

---

## 1. Profile Management

### Profile Structure
- **Max profiles:** 5 per account
- **Account researched:** 5 profiles total, 3 configured as Kids profiles
- **Profile types:**
  - **Standard profile** — Full access, maturity level configurable
  - **Kids profile** — Restricted UI, locked to "Little Kids" or "Older Kids" content
- **Profile creation:** Account owner can create profiles with name, avatar, language, maturity level, and autoplay preferences
- **Avatar system:** Large library of character avatars from Netflix originals
- **Kids UI:** Completely different interface — simplified navigation, larger thumbnails, colorful design, no access to account settings or search for mature content

### Profile Settings (per profile)
- Display name
- Avatar image
- Language preference
- Maturity rating level
- Autoplay next episode (toggle)
- Autoplay previews (toggle)
- Viewing restrictions (maturity level + title blocks)
- Profile Lock (PIN)

---

## 2. Content Restrictions

### Maturity Rating Tiers
Netflix uses 4 maturity tiers, each mapping to US content rating systems:

| Netflix Tier | MPAA Ratings | TV Ratings | Description |
|---|---|---|---|
| **Little Kids** | G | TV-Y, TV-G | Ages 0-6. Youngest viewers only |
| **Older Kids** | G, PG | TV-Y, TV-Y7, TV-Y7-FV, TV-G, TV-PG | Ages 7-12. No violence/mature themes |
| **Teens** | G, PG, PG-13 | TV-Y through TV-14 | Ages 13+. Some mature content filtered |
| **All Maturity Ratings** | G through NC-17 | All ratings including TV-MA | No restrictions |

### Phosra Rating System Mapping

| Phosra System | Netflix Support | Notes |
|---|---|---|
| **MPAA (Film)** | Full | G, PG, PG-13, R, NC-17 all recognized |
| **TV Parental Guidelines** | Full | TV-Y, TV-Y7, TV-Y7-FV, TV-G, TV-PG, TV-14, TV-MA |
| **ESRB (Games)** | N/A | Netflix has no gaming rating integration (Netflix Games use separate system) |
| **PEGI (EU Games)** | N/A | Not applicable |
| **Common Sense Media** | Indirect | Netflix shows CSM age ratings on some titles but doesn't filter by them |

### Title-Specific Restrictions
- Individual titles can be blocked by name on a per-profile basis
- Located under: Account > Profile & Parental Controls > [Profile] > Viewing Restrictions
- Title restrictions are **behind MFA** — changing them requires re-authentication
- Supports both movies and series

---

## 3. PIN / Lock Protection

### Profile Lock
- **Type:** 4-digit numeric PIN
- **Scope:** Per-profile (each profile can have its own PIN)
- **Purpose:** Prevents unauthorized profile switching — kids can't switch to an adult profile
- **Setting location:** Account > Profile & Parental Controls > [Profile] > Profile Lock
- **Reset:** Account owner can remove/change PIN via account settings

### MFA Gate for Parental Controls
- Modifying maturity settings or title restrictions triggers MFA verification
- **MFA options observed:**
  - Email verification code
  - Text message (SMS) code
  - Account password re-entry
- This prevents children from changing their own restrictions even if they access the settings page
- MFA is session-based — once verified, changes can be made for that session

---

## 4. Screen Time Controls

### Native Support: **NONE**

Netflix does **not** offer any native screen time management features:
- No daily/weekly time limits
- No scheduling (e.g., "no Netflix after 9pm")
- No usage reports or dashboards
- No bedtime/school-time restrictions
- No session duration alerts

### Workaround Strategies for Phosra
1. **Profile Lock approach:** Lock the profile PIN and change it when time limit is hit (disruptive)
2. **Device-level controls:** Defer to OS-level screen time (iOS Screen Time, Android Digital Wellbeing, router schedules)
3. **Autoplay disable:** Turning off autoplay next episode reduces passive binge-watching
4. **Viewing Activity monitoring:** Track watch time from viewing history and alert parents

---

## 5. Viewing History & Monitoring

### Viewing Activity
- **Location:** Account > Profile & Parental Controls > [Profile] > Viewing Activity
- **Data available:**
  - Title name
  - Date watched
  - Episode/season for series
  - Chronological order (most recent first)
- **Export:** Download option available (CSV format)
- **Hide:** Individual titles can be hidden from viewing history
- **Per-profile:** Each profile has separate viewing activity — no cross-profile view

### Limitations
- No real-time viewing alerts
- No weekly/monthly summary reports
- No watch duration per session (only title + date)
- No "currently watching" indicator via web UI
- Hidden titles are permanently removed from history

---

## 6. API / Technical Recon

### Primary API: Falcor (Netflix's Custom Graph API)

**Endpoint:** `/nq/website/memberapi/release/pathEvaluator`
- Netflix uses a custom JSON Graph protocol called Falcor
- All data fetching goes through this single endpoint with different path queries
- Request format: POST with `path` parameter arrays
- Response format: Nested JSON graph with `$type` references

### Key API Endpoints Discovered (51 unique paths from HAR)

| Endpoint | Purpose | Auth Required |
|---|---|---|
| `/nq/website/memberapi/release/pathEvaluator` | Primary data API (Falcor) | Session cookie |
| `/nq/website/memberapi/release/profiles/switch` | Switch active profile | Session cookie |
| `/api/shakti/*/profiles` | Profile management | Session cookie + tokens |
| `/api/shakti/*/parentalControls` | Read parental control settings | Session cookie |
| `/api/shakti/*/parentalControls/pin` | PIN management | Session cookie + MFA |
| `/api/shakti/*/viewingactivity` | Viewing history data | Session cookie |
| `/api/shakti/*/maturityRestrictions` | Maturity level settings | Session cookie + MFA |
| `/api/shakti/*/titleRestrictions` | Title block list | Session cookie + MFA |

### Authentication
- **Primary auth:** Session cookies (`NetflixId`, `SecureNetflixId`)
- **MSL tokens:** Netflix uses Message Security Layer (MSL) for DRM and secure API calls
- **CSRF:** `x-netflix-request-client-atag` header required
- **Profile context:** `x-netflix-profileguid` header for profile-specific requests

### Rate Limiting / Detection
- No explicit rate limiting observed during research
- Netflix uses device fingerprinting and behavioral analysis
- Headless browser detection: Netflix checks for automation signals (Playwright stealth mode recommended)
- Session duration: Cookies appear to last ~2 weeks before re-auth required

---

## 7. Account Structure & Integration Points

### Account Hierarchy
```
Netflix Account (1 per subscription)
  |
  +-- Profile 1 (Standard - account owner)
  |     +-- Maturity: All Maturity Ratings
  |     +-- Profile Lock: Optional PIN
  |     +-- Viewing Activity
  |     +-- Title Restrictions
  |
  +-- Profile 2 (Standard or Kids)
  |     +-- Maturity: Configurable
  |     +-- ...
  |
  +-- Profile 3-5 (same structure)
```

### Subscription Tiers (relevant to features)
- **Standard with Ads:** 2 simultaneous streams, 1080p
- **Standard:** 2 simultaneous streams, 1080p, downloads
- **Premium:** 4 simultaneous streams, 4K UHD, 6 download devices

### Key Integration Points for Phosra
1. **Profile as unit of control** — Phosra should map child to Netflix profile (1:1)
2. **MFA bypass needed** — Parental control changes require MFA, making pure API approach difficult
3. **Falcor API for reads** — Profile info, viewing activity, current settings can be read via API
4. **Playwright for writes** — Setting changes (maturity, PIN, title blocks) likely need browser automation
5. **No OAuth** — Netflix has no partner/third-party OAuth; credential storage required
6. **Session management** — Phosra needs to maintain valid session cookies and handle re-auth

---

## 8. API Accessibility & Third-Party Integration

### Public API Status

Netflix shut down its public API in **November 2014**. There has been no replacement, no successor program, and no indication that Netflix intends to re-open API access to third parties. The original public API provided catalog search and user queue management but never included parental controls or account management features.

### Partner Program

Netflix operates **Open Connect**, an ISP/device partner program for CDN appliance placement and streaming device certification. This program is exclusively for content delivery optimization and hardware partnerships. There is **no partner program** for parental control apps, child safety tools, or account management integrations of any kind.

### OAuth / Delegated Access

Netflix provides **no OAuth flow, no delegated access mechanism, and no token-based third-party authentication** of any kind. Unlike platforms such as YouTube (Google OAuth), Apple TV+ (Sign in with Apple), or even Spotify, Netflix offers zero pathways for a third-party application to obtain authorized access to a user's account on their behalf.

### Unofficial API Landscape

#### Shakti / Falcor (Internal Web API)
- Netflix's web application uses an internal API surface known as **Shakti** (the endpoint namespace) and **Falcor** (Netflix's custom JSON Graph protocol)
- These endpoints are undocumented, unauthenticated for third parties, and subject to change without notice
- The Falcor pathEvaluator endpoint (`/nq/website/memberapi/release/pathEvaluator`) serves as the primary data layer for the Netflix web app
- **Stability:** Low. Netflix has historically changed API structures, endpoint paths, and authentication requirements without warning. The Shakti build version (the `*` in `/api/shakti/*/...`) changes with every Netflix deployment

#### Migration to Federated GraphQL (Mobile)
- In **2022**, Netflix migrated its mobile applications from Falcor to a **federated GraphQL** architecture
- The web application still uses Falcor as of this research date, but a similar migration is anticipated
- This means any integration built on Falcor endpoints faces a **ticking clock** — when Netflix migrates the web app to GraphQL, all Falcor-based read operations will break simultaneously

#### Community / Open Source Efforts
- **CastagnaIT Kodi Plugin:** The most sophisticated community effort to interface with Netflix APIs. Development was **suspended** due to Netflix repeatedly breaking the integration with infrastructure changes
- **node-netflix2 (npm):** An unofficial Node.js library for Netflix API interaction. **Unmaintained** since approximately 2019-2020. Non-functional with current Netflix infrastructure
- No actively maintained open-source library exists for Netflix API interaction

### What Existing Parental Control Apps Actually Do

Every major parental control application operates at the **device or OS level only** when it comes to Netflix. None integrate with Netflix APIs:

| App | Netflix Integration Approach | API Usage |
|---|---|---|
| **Bark** | Monitors device-level activity; can detect Netflix is open but cannot see what's being watched | None |
| **Qustodio** | Time limits via device-level app blocking; cannot control Netflix content settings | None |
| **Net Nanny** | Device-level web/app filtering; blocks Netflix entirely or allows entirely | None |
| **Canopy** | OS-level screen time management only | None |
| **Mobicip** | Device-level app scheduling and blocking | None |
| **FamiSafe** | Device-level app usage monitoring and time limits | None |

**Key takeaway:** No parental control product on the market has solved the Netflix API access problem. The industry standard is to treat Netflix as an opaque app that can only be allowed, blocked, or time-limited at the device level.

### Per-Capability API Accessibility

| Capability | Feature Exists in Netflix | Public API | Unofficial API (Shakti/Falcor) | 3rd Party Access Method | Verdict |
|---|---|---|---|---|---|
| **View profiles** | Yes | None | Read-only via Falcor (fragile) | Session cookie injection | Unofficial read possible, ToS violation |
| **View maturity settings** | Yes | None | Read-only via Shakti (fragile) | Session cookie injection | Unofficial read possible, ToS violation |
| **Change maturity level** | Yes | None | No known write endpoint | Browser automation only | No API access — Playwright required |
| **Set/change profile PIN** | Yes | None | No known write endpoint | Browser automation only | No API access — Playwright required |
| **Block specific titles** | Yes | None | No known write endpoint | Browser automation only | No API access — Playwright required |
| **View watching history** | Yes | None | Read-only via Shakti (fragile) | Session cookie injection | Unofficial read possible, ToS violation |
| **Screen time limits** | No (feature does not exist) | N/A | N/A | N/A | Not possible at any level |
| **Create/delete profile** | Yes | None | No known endpoint even unofficially | Browser automation only | No API access — Playwright required |
| **Autoplay settings** | Yes | None | No known write endpoint | Browser automation only | No API access — Playwright required |
| **Real-time viewing status** | No (not exposed in web UI) | None | No known endpoint | None | Not possible |

### Terms of Service Constraints

Netflix Terms of Use **Section 4.6** explicitly prohibits:

> - Use of **robots, spiders, scrapers**, or other automated means to access the Netflix service
> - **Reverse engineering**, decompiling, or disassembling Netflix software
> - Use of the service via any **automated means** (including scripts or web crawlers)
> - Using **machine learning tools** against Netflix content or infrastructure

**Implications for Phosra:**
1. **Every method of integration** (Falcor API reads, Playwright browser automation) constitutes a ToS violation
2. Account suspension is a real risk if Netflix's detection systems flag automated access
3. There is no "approved" pathway to build the integration Phosra needs
4. This is not unique to Phosra — every competitor faces the identical constraint, which is why none have solved it
5. Legislative pressure (KOSA, EU DSA, UK Online Safety Act) may eventually force Netflix to provide APIs for child safety tools, but no such mandate exists today
