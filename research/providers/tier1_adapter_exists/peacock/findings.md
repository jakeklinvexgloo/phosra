# Peacock Parental Controls Research Findings

**Platform:** Peacock (NBCUniversal)
**Research Date:** 2026-02-25
**Account Type:** Premium Plus (3 streams, ad-free)
**Research Method:** Manual browser testing + network traffic analysis
**Artifacts:** Research data documented below

---

## 1. Profile Management

### Profile Structure
- **Max profiles:** 6 per account
- **Profile types:**
  - **Account Holder** — Main profile, cannot be designated as a Kids profile. Manages account settings and billing.
  - **Kids Profile** — Auto-restricts content to TV-PG/PG and below. Simplified UI with child-friendly navigation.
  - **Standard Profile** — Full access, maturity level configurable at the account level.
- **Profile creation:** Any user can create a profile without entering the account password. This is a **significant security gap** — a child could create a non-Kids profile to bypass restrictions.
- **Avatar system:** Predefined avatars from NBCUniversal properties (characters from shows like The Office, etc.)
- **Kids UI:** Simplified interface with larger thumbnails and restricted content catalog. No access to account settings.

### Profile Settings (per profile)
- Display name
- Avatar image
- Kids toggle (on/off at creation time)
- Separate Continue Watching list
- Separate viewing history

### Security Gap: Unprotected Profile Creation
Unlike Netflix (which requires account password to create new profiles in some configurations), Peacock allows any profile user to create additional profiles without any authentication. A child could:
1. Navigate to the profile picker
2. Create a new Standard (non-Kids) profile
3. Access unrestricted content

This makes profile-based parental controls significantly weaker unless combined with PIN protection.

---

## 2. Content Restrictions

### Maturity Rating Tiers
Peacock uses 5 maturity tiers (cumulative — each tier includes all ratings from lower tiers):

| Peacock Tier | MPAA Ratings | TV Ratings | Description | Age Range |
|---|---|---|---|---|
| **Little Kids** | (none) | TV-Y | Content for youngest viewers only | 2-5 |
| **Older Kids** | G | TV-Y, TV-Y7, TV-Y7-FV, TV-G | Mild content, no mature themes | 6-8 |
| **Family** | G, PG | TV-Y, TV-Y7, TV-Y7-FV, TV-G, TV-PG | Family-friendly content, may include mild language | 9-12 |
| **Teen** | G, PG, PG-13 | TV-Y, TV-Y7, TV-Y7-FV, TV-G, TV-PG, TV-14 | Some mature content, moderate violence/language | 13-17 |
| **Adult** (DEFAULT) | G, PG, PG-13, R, NC-17, NR | TV-Y, TV-Y7, TV-Y7-FV, TV-G, TV-PG, TV-14, TV-MA | No restrictions — all content including unrated | 18+ |

### Key Differences from Netflix
- Peacock has **5 tiers** vs Netflix's 4 tiers
- Peacock includes an **NR (Not Rated)** category in the Adult tier
- Peacock separates "Little Kids" (TV-Y only) from "Older Kids" (adds TV-Y7, TV-G, G)
- Peacock has a **Family** tier (PG/TV-PG) that Netflix lacks — Netflix jumps from "Older Kids" (PG) to "Teens" (PG-13)
- Content restrictions are set **account-wide** for non-Kids profiles, not per-profile

### Title-Specific Restrictions
- **NOT SUPPORTED** — Peacock does not offer per-title blocking
- No ability to block individual movies or series
- Only maturity tier-based filtering is available
- This is a significant gap compared to Netflix's per-profile title block list

### Content Filtering Limitations
- No profanity filter or audio muting for language
- No content descriptor-based filtering (cannot filter by "violence" or "language" independently)
- Maturity tier is the sole mechanism for content restriction

---

## 3. PIN / Lock Protection

### Parental Control PIN
- **Type:** 4-digit numeric PIN
- **Setup location:** Web browser only (desktop or mobile browser). **Cannot be set via mobile apps.**
- **PIN protects:**
  - Changing parental control settings
  - Accessing content above the set maturity restriction
  - Switching from a Kids profile to a non-Kids profile

### PIN Limitations
- **Web-only setup:** Parents must use a web browser to configure the PIN. The mobile app (iOS/Android) does not expose parental control settings.
- **Account-wide:** The PIN is a single account-level PIN, not per-profile
- **No profile lock equivalent:** Unlike Netflix's per-profile PIN that prevents unauthorized profile switching entirely, Peacock's PIN only gates specific actions
- **No MFA:** Peacock does not have a multi-factor authentication gate for parental control changes beyond the PIN itself

### Comparison to Netflix
| Feature | Netflix | Peacock |
|---|---|---|
| PIN type | 4-digit, per-profile | 4-digit, account-wide |
| Setup platforms | Web + mobile apps | Web browser only |
| MFA for changes | Yes (email/SMS/password) | No (PIN only) |
| Profile lock | Yes (prevents profile switch) | Partial (gates Kids-to-non-Kids) |

---

## 4. Screen Time Controls

### Native Support: **NONE**

Peacock does **not** offer any native screen time management features:
- No daily/weekly time limits
- No scheduling (e.g., "no Peacock after 9pm")
- No usage reports or dashboards
- No bedtime/school-time restrictions
- No session duration alerts
- No autoplay toggle for managing binge-watching

### Workaround Strategies for Phosra
1. **PIN change approach:** Change the account PIN when time limit is hit, preventing access to non-Kids content
2. **Device-level controls:** Defer to OS-level screen time (iOS Screen Time, Android Digital Wellbeing, router schedules)
3. **Viewing history monitoring:** Track Continue Watching activity and alert parents when usage thresholds are exceeded
4. **Profile-level enforcement:** For Kids profiles, content is already restricted; combine with device-level time controls

### Key Gap
The absence of screen time controls is a critical gap for child safety compliance. Peacock has no equivalent to even basic features like session reminders or autoplay management. This places the full burden of screen time enforcement on Phosra or device-level controls.

---

## 5. Viewing History & Monitoring

### Continue Watching
- **Per-profile:** Each profile maintains its own "Continue Watching" rail
- **Clear options:**
  - Clear individual titles from Continue Watching
  - Clear all items from Continue Watching at once
- **Location:** Accessible from the main browse page and profile settings

### Viewing History
- **Per-profile:** Separate viewing histories per profile
- **Data available:**
  - Title name
  - Episode/season for series
  - Last watched position (implicit from Continue Watching)
- **Data NOT available:**
  - Exact watch date/time (not exposed in UI)
  - Watch duration per session
  - Real-time "currently watching" status
  - Downloadable export (no CSV/data export option)

### Limitations
- **No granular per-title deletion from full history** — Can clear Continue Watching but not fine-grained viewing history entries
- No real-time viewing alerts
- No weekly/monthly summary reports
- No watch duration tracking
- No cross-profile viewing dashboard
- No data export functionality

### Comparison to Netflix
| Feature | Netflix | Peacock |
|---|---|---|
| Per-profile history | Yes | Yes |
| Date/time stamps | Yes | Not exposed |
| CSV export | Yes | No |
| Hide individual titles | Yes | Continue Watching only |
| Watch duration | No | No |
| Real-time alerts | No | No |

---

## 6. API / Technical Architecture

### Infrastructure: AWS
Peacock runs primarily on Amazon Web Services:
- **Compute:** EC2 instances for backend services
- **API Layer:** AWS AppSync (managed GraphQL service)
- **Data protocol:** GraphQL (contrast with Netflix's custom Falcor protocol)

### Mobile Applications
- **Migration (2023):** Peacock migrated from React Native to fully native mobile apps
- **Android:** Jetpack Compose UI framework + Kotlin Coroutines for async operations
- **iOS:** UIKit + CoreAnimation for smooth playback and UI transitions
- **Implication for Phosra:** No cross-platform web bridge to exploit; mobile automation would require platform-specific tooling

### API Architecture
- **GraphQL via AppSync:** Primary data fetching uses GraphQL queries
- **Authentication:** Session-based with cookies/tokens
- **No public API:** Peacock does not offer any public API, developer portal, or partner program
- **No API keys:** All access requires authenticated user sessions

### Key Technical Observations
- GraphQL is more structured and discoverable than Netflix's Falcor — schema introspection may be possible
- AppSync provides standard GraphQL endpoints vs Netflix's custom pathEvaluator
- Session management likely simpler than Netflix (no MSL token layer)
- Web-only parental controls mean all control automation goes through browser

### Rate Limiting / Detection
- No specific rate limiting patterns documented during research
- Standard AWS WAF protections likely in place
- Headless browser detection: Less aggressive than Netflix based on initial testing
- Session duration: Standard cookie-based sessions

---

## 7. Account Structure & Integration Points

### Account Plans

| Plan | Price | Ads | Streams | Downloads | Key Feature |
|---|---|---|---|---|---|
| **Peacock Select** | $7.99/mo | Yes | 1 | No | Basic tier |
| **Peacock Premium** | $10.99/mo | Yes | 3 | No | Multi-stream |
| **Peacock Premium Plus** | $16.99/mo | No | 3 | Yes (25 titles) | Ad-free + downloads |

### Sharing & Household
- **No family plan:** Peacock does not offer a family-specific subscription tier
- **Household sharing:** Single set of credentials shared within a household
- **No extra member slots:** Unlike Netflix's paid extra member feature, Peacock relies on profile-based sharing
- **Stream limits:** 1-3 simultaneous streams depending on plan

### Account Hierarchy
```
Peacock Account (1 per subscription)
  |
  +-- Account Holder Profile (cannot be Kids)
  |     +-- Maturity: Account-wide setting
  |     +-- Continue Watching
  |     +-- Viewing History
  |
  +-- Profile 2 (Standard or Kids)
  |     +-- If Kids: auto-restricted to TV-PG/PG and below
  |     +-- If Standard: uses account-wide maturity setting
  |     +-- Continue Watching
  |     +-- Viewing History
  |
  +-- Profiles 3-6 (same structure, max 6 total)
```

### Key Integration Points for Phosra
1. **Profile as unit of control** — Phosra should map child to Peacock Kids profile (1:1)
2. **No MFA barrier** — Parental controls only require PIN (simpler than Netflix's MFA)
3. **GraphQL API for reads** — Profile info, viewing data can likely be read via GraphQL API
4. **Playwright for writes** — All parental control changes are web-only, making Playwright the natural choice
5. **No OAuth** — Peacock has no partner/third-party OAuth; credential storage required
6. **Session management** — Standard cookie-based sessions, simpler than Netflix
7. **Profile creation gap** — Phosra should monitor for new profile creation as a bypass vector
8. **Account-wide restrictions** — Non-Kids profiles all share the same maturity setting, limiting per-child customization
