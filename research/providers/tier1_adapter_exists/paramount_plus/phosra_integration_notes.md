# Paramount+ -- Phosra Integration Notes

**Platform:** Paramount+
**Assessment Date:** 2026-03-01
**Integration Priority:** Tier 1 (adapter assessment complete)
**Recommended Approach:** Playwright-only (no known unofficial API for account management)

---

## 1. Rule Category Coverage

Of Phosra's 45 enforcement rule categories, Paramount+ can enforce the following:

### Fully Enforceable (via existing Paramount+ features)

| Rule Category | Paramount+ Feature | Enforcement Method |
|---|---|---|
| `content_rating_filter` | Account-wide maturity slider (4 levels) | Playwright write |
| `profile_lock` | 4-digit account-wide PIN | Playwright write |
| `parental_consent_gate` | Password required to enable/disable parental controls | Built-in (no Phosra action needed) |
| `age_gate` | Kids profiles (Younger Kids / Older Kids) act as age gates | Playwright write (profile creation) |
| `kids_profile` | Dedicated Kids Mode with restricted UI and content | Playwright write (profile creation) |
| `autoplay_control` | Autoplay toggle (disabled by default on Kids profiles) | Device-specific settings (limited Phosra control) |

### Partially Enforceable (Phosra-managed workaround)

| Rule Category | Gap | Phosra Workaround |
|---|---|---|
| `screen_time_limit` | No native support | Monitor Continue Watching via scrape; lock profile via account PIN change. Highly limited: no timestamps, account-wide PIN affects all users. Recommend device-level enforcement instead |
| `screen_time_report` | No usage dashboard | Aggregate Continue Watching data into Phosra reports. Data is extremely sparse (no dates, no durations). Reports will show "titles watched" not "time spent" |
| `bedtime_schedule` | No native support | Lock/unlock via account PIN change on schedule via cron-triggered Playwright. Account-wide impact makes this disruptive to the whole family |
| `parental_event_notification` | No native alerts | Phosra periodically scrapes Continue Watching and compares against known catalog ratings. Alerts parent if content above expected rating appears. Limited by scraping frequency and data quality |
| `viewing_history_access` | Partial (Continue Watching only) | Playwright scrape of Continue Watching carousel. Title + progress only. No dates, no duration, no historical log |

### Not Enforceable on Paramount+

| Rule Category | Reason |
|---|---|
| `title_restriction` | Paramount+ does not support per-title blocking. Only rating-based filtering is available |
| `purchase_control` | Paramount+ is subscription-only; no in-app purchases to control |
| `social_control` | Paramount+ has no social features (no messaging, comments, friends, user-generated content) |
| `location_tracking` | Not applicable to streaming |
| `web_filtering` | Not applicable (content is curated, not user-generated) |
| `safe_search` | Not applicable. Kids profiles already restrict search results to age-appropriate content |
| `app_control` | Not applicable (Paramount+ is one app, not an app store) |
| `custom_blocklist` / `custom_allowlist` | No per-title or per-category customization available |
| `commercial_data_ban` | Not controllable from consumer side |
| `algorithmic_audit` | Not controllable from consumer side |

---

## 2. Enforcement Strategy

### Read Operations (Playwright scrape -- no API available)
```
SCRAPE profile list        -> Playwright: profile picker page
SCRAPE parental settings   -> Playwright: account settings page
SCRAPE viewing history     -> Playwright: Continue Watching carousel (per-profile)
SCRAPE profile type        -> Playwright: profile attributes (Kids/Standard)
```
- All reads require a full browser context (no API shortcut, unlike Netflix Shakti)
- Use cached session cookies to avoid re-login
- Run on schedule (every 4-6 hours) for monitoring
- Higher resource cost per read than Netflix (browser vs API call)

### Write Operations (Playwright -- browser required)
```
SET content rating level   -> Playwright + password entry (account-wide slider)
ENABLE parental controls   -> Playwright + password entry (first-time setup)
SET/CHANGE account PIN     -> Playwright + password entry
TOGGLE live TV lock        -> Playwright + PIN entry
CREATE kids profile        -> Playwright + PIN entry (if parental controls active)
TOGGLE autoplay            -> Not automatable via web (device-specific in mobile/TV apps)
```
- Requires browser context with stealth mode
- No MFA (simpler than Netflix) -- password is the strongest gate
- Account-wide scope limits per-child granularity
- Rate limit: max 1 write session per hour

### Screen Time Enforcement (Phosra-managed -- NOT recommended)
```
1. Parent sets daily limit in Phosra (e.g., 2 hours)
2. Phosra scrapes Continue Watching every 30-60 minutes via Playwright
3. Check for new content entries (indicates activity)
4. When activity exceeds threshold:
   a. Change account PIN to Phosra-managed value (LOCKS ALL USERS)
   b. Notify parent via Phosra notification
5. On parent's command or next day:
   a. Restore original PIN
   b. Reset daily counter
```

**Critical limitations of this approach:**
- Continue Watching shows no timestamps or durations -- Phosra cannot calculate actual watch time
- PIN change is account-wide -- locking one child locks the entire family out of restricted content
- 30-60 minute scraping interval means significant overshoot
- Mid-stream lockout is impossible (PIN only affects content access initiation)
- **Recommendation: defer screen time enforcement to device-level controls (iOS Screen Time, Android Digital Wellbeing, Circle router)**

### Why Playwright for Everything
Unlike Netflix (where Shakti/Falcor APIs provide read access), Paramount+ has **no known internal API endpoints for account settings, profiles, or viewing history**. The SlyGuy Kodi addon reverse-engineers content playback APIs only (video manifests via thePlatform/MPX), not account management. Without even read-only API access, every operation requires Playwright browser automation.

---

## 3. Credential Storage Requirements

Phosra needs to store the following per family connection:

| Credential | Purpose | Sensitivity | Storage Notes |
|---|---|---|---|
| Paramount+ email | Login | High | Encrypted at rest (AES-256) |
| Paramount+ password | Login + parental control changes | Critical | AES-256, per-user keys, never logged |
| Session cookies | Browser session reuse | High | Encrypted, rotate on expiry |
| Profile names/IDs | Map Phosra child to Paramount+ profile | Low | Can be stored in plain DB |
| Account PIN | Phosra-managed screen time enforcement | High | Encrypted, needed for automation |
| Kids profile tier | Younger Kids vs Older Kids mapping | Low | Can be stored in plain DB |

### Security Considerations
- All credentials must be encrypted at rest (AES-256)
- Password should never be logged or included in error reports
- Session cookies should be stored encrypted with per-user keys
- Account PIN is more sensitive on Paramount+ than Netflix profile PINs because it is account-wide
- Consider Phosra vault service for credential management
- No MFA codes to manage (simplifies credential flow vs Netflix)

---

## 4. OAuth Assessment

**Paramount+ does not offer any partner OAuth or third-party API access.**

- No developer portal or API program
- No OAuth redirect flow
- No API keys or partner tokens
- All integration requires credential-based authentication

This means:
- Phosra must store user's Paramount+ email + password
- User must explicitly consent to credential storage
- Re-authentication needed when session cookies expire (frequency unknown, likely 1-4 weeks)
- Higher UX friction vs platforms with OAuth (e.g., YouTube via Google)
- Standard cookie-based sessions are simpler than Netflix MSL tokens

### Comparison to Other Platforms

| Platform | OAuth Available? | Credential Storage Needed? | Re-auth Frequency |
|---|---|---|---|
| Paramount+ | No | Yes (email + password) | Unknown (1-4 weeks est.) |
| Netflix | No | Yes (email + password) | ~2 weeks |
| Peacock | No | Yes (email + password) | Unknown |
| YouTube | Yes (Google OAuth) | No (token-based) | Token refresh |
| Apple TV+ | Yes (Sign in with Apple) | No (token-based) | Token refresh |

---

## 5. Adapter Gap Analysis

### What Exists (current state)
No adapter exists for Paramount+. This is a greenfield implementation.

| Feature | Status |
|---|---|
| Session management / login | Missing |
| Profile listing | Missing |
| Parental control reading | Missing |
| Parental control writing | Missing |
| Watch history reading | Missing |
| Kids profile creation | Missing |
| Screen time enforcement | Missing |
| Stealth mode | Missing |

### What's Needed (for production Phosra integration)

| Feature | Status | Priority | Notes |
|---|---|---|---|
| Playwright login + cookie caching | Missing | P0 | Foundation -- everything depends on this |
| Profile listing (scrape) | Missing | P0 | Map Phosra children to Paramount+ profiles |
| Parental control settings reader | Missing | P0 | Read current state before making changes |
| Parental controls enable/toggle | Missing | P1 | First-time setup for families |
| Content rating slider setter | Missing | P1 | Account-wide, limited per-child value |
| Account PIN management | Missing | P1 | Set/change PIN for enforcement |
| Kids profile creator | Missing | P1 | Onboarding new children |
| Live TV lock toggle | Missing | P1 | Binary lock/unlock |
| Continue Watching scraper | Missing | P2 | Limited monitoring capability |
| Stealth mode configuration | Missing | P0 | Required for all browser operations |
| Error recovery & retry logic | Missing | P1 | Handle session expiry, UI changes |
| UnsupportedOperationError for title blocking | Missing | P1 | Clear error for unsupported features |

### Implementation Plan

1. Build Playwright-based session manager with stealth mode (P0)
2. Implement profile listing and settings reading (P0)
3. Implement parental control write operations (P1)
4. Implement Kids profile creation (P1)
5. Implement Continue Watching monitoring (P2)
6. Add screen time enforcement with device-level fallback recommendation (P2)

---

## 6. Platform-Specific Considerations

### The South Park / PAW Patrol Problem
Paramount+ uniquely hosts both TV-MA content (South Park, Showtime originals, Comedy Central) and the youngest children's content (PAW Patrol, Blue's Clues via Nickelodeon/Nick Jr.) on a single platform. This extreme content rating spread (TV-Y to TV-MA) makes robust parental controls essential, yet Paramount+ lacks per-title blocking. A parent cannot block South Park specifically while allowing other TV-14 Comedy Central content.

### Account-Wide Controls Limit Per-Child Granularity
The single biggest limitation of Paramount+ for Phosra integration is the **account-wide** nature of parental controls. The rating slider, PIN, and live TV lock all apply to the entire account. If a family has a 6-year-old and a 14-year-old, the account-wide slider must be set to the lowest common denominator (Older Kids / TV-PG) to protect the younger child, which overly restricts the teenager.

**Workaround:** Use Kids profiles (Younger/Older) for children who fit those age ranges, and rely on the PIN to gate content above the slider level for teens using Standard profiles. This is imperfect but functional.

### Live TV is Unrated and Uncontrollable
Live CBS feeds include sports, news, and entertainment. Content during live broadcasts is not individually rated and cannot be filtered by content type. The binary live TV lock is either on (all live TV blocked) or off (all live TV accessible). A child watching NFL football on CBS could encounter violent game footage, suggestive advertisements, or news coverage with graphic content -- none of which can be filtered.

### Autoplay: A Good Default, Device-Specific Limitation
Autoplay is disabled by default on Kids profiles -- a proactive child safety measure not found on all platforms. However, autoplay settings are device-specific and do not sync. A child's iPad may have autoplay off while the family smart TV has it on. Phosra cannot control this via web automation since autoplay settings are only available in mobile/TV app settings.

### Upcoming Platform Changes (Skydance Merger)
The Skydance-Paramount merger (closed August 2025) has announced plans for:
- Unified Paramount+ / Pluto TV / BET+ backend by mid-2026
- Potential technology migration (Oracle involvement)
- Cost-cutting infrastructure changes

**Impact on Phosra:** Any Playwright automation built against the current Paramount+ web UI may break during the backend/frontend unification. Phosra should design the adapter with robust selector strategies and be prepared for rapid updates during the migration period (estimated mid-2026).

### Kids Profile UI Enhancements
Paramount+ has been actively improving its Kids experience:
- Younger Kids interface uses much larger icons and minimal text for pre-readers
- Autoplay off by default for all Kids profiles
- AI-generated playlists of kid-friendly content may be coming
- These improvements suggest Paramount+ is investing in child safety, which could eventually lead to better parental control APIs

### No Content Descriptor Filtering
Unlike Netflix (which shows content descriptors like "violence, language, nudity" on titles), Paramount+ does not appear to offer content descriptor filtering. The only filtering axis is the overall maturity rating. This means a parent cannot say "allow PG-13 but block anything with nudity."

---

## 7. API Accessibility Reality Check

## API Accessibility Reality Check

**Platform:** Paramount+
**API Accessibility Score:** Level 0 -- Walled Garden
**Phosra Enforcement Level:** Browser-Automated (with significant limitations)

### What Phosra CAN do:
- Read profile list via Playwright scrape of profile picker
- Read current parental control settings via Playwright scrape of account page
- Set account-wide content rating level via Playwright (requires password)
- Set/change account-wide PIN via Playwright (requires password)
- Toggle live TV lock via Playwright (requires PIN)
- Create Kids profiles (Younger Kids / Older Kids) via Playwright
- Read Continue Watching carousel via Playwright (title + progress only)
- Detect Kids profile type (Younger/Older) via Playwright

### What Phosra CANNOT do:
- Block specific titles (platform does not support per-title blocking)
- Set per-profile maturity levels (account-wide only)
- Filter live TV by channel (binary lock only)
- Access viewing history with timestamps or durations (data does not exist)
- Export viewing data (no export capability)
- Control autoplay via web (device-specific mobile/TV app settings only)
- Get real-time viewing status or alerts (no capability exists)
- Access any Paramount+ data via API (no known API for account management)

### What Phosra MIGHT be able to do (with risk):
- Enforce screen time via account PIN changes (account-wide, disrupts all users, not just target child)
- Monitor viewing activity via periodic Continue Watching scrapes (sparse data, high resource cost)
- Reverse-engineer internal APIs from web app network traffic (significant R&D effort, fragile, ToS violation)

### Recommendation:
Paramount+ is a Level 0 Walled Garden with no API access and account-wide parental controls that limit per-child enforcement granularity. Phosra's integration should focus on **initial setup and configuration** (creating Kids profiles, enabling parental controls, setting the rating slider) rather than ongoing enforcement. For day-to-day screen time management and monitoring, Phosra should recommend device-level controls (iOS Screen Time, Android Digital Wellbeing, Circle router) as the primary enforcement mechanism.

The adapter is simpler to build than Netflix (no MFA, no Falcor protocol, standard web UI) but delivers less value (no API reads, no per-title blocking, account-wide controls, sparse viewing data). Development effort is estimated at 8-12 days, with the highest risk being the upcoming Skydance-era platform migration that may break automation selectors.

Phosra should also monitor for regulatory developments (KOSA, EU DSA) and Paramount+'s own child safety roadmap, as the platform has shown willingness to improve its Kids experience and may eventually offer partner APIs for child safety tools.
