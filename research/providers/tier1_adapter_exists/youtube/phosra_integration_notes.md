# YouTube -- Phosra Integration Notes

**Platform:** YouTube / YouTube Kids
**Assessment Date:** 2026-03-01
**Integration Priority:** Tier 1 (unique platform with public API -- highest content intelligence potential)
**Recommended Approach:** YouTube Data API v3 for content reads + DNS enforcement + guided parent setup for parental controls

---

## 1. Phosra Rule Category Coverage

Of Phosra's 45 enforcement rule categories, YouTube coverage is as follows:

### Fully Enforceable (via existing YouTube features accessible to Phosra)

| Rule Category | YouTube Feature | Enforcement Method |
|---|---|---|
| `content_rating_filter` | safeSearch API parameter (none/moderate/strict) + Restricted Mode via DNS | Public API read + DNS write |
| `viewing_history_access` | YouTube Data API activities + Google Takeout import | Public API read + batch import |
| `kids_profile` | YouTube Kids profiles (separate app) | Parent-configured (Phosra guides setup) |
| `autoplay_control` | Autoplay toggle in YouTube + YouTube Kids | Parent-configured via Family Link (Phosra guides) |

### Partially Enforceable (Phosra-managed workaround)

| Rule Category | Gap | Phosra Workaround |
|---|---|---|
| `title_restriction` | No per-video blocking on main YouTube; only channel blocking in YouTube Kids | Phosra content intelligence layer classifies videos via Data API (madeForKids, contentRating, safeSearch); alerts parents to concerning content. DNS-level blocking for specific domains. YouTube Kids "Approved Content Only" mode for young children |
| `profile_lock` | No PIN system; authentication is Google Account-based | Phosra provides its own access control layer. Recommend device-level app locks (iOS Screen Time, Android Digital Wellbeing). DNS-level blocking during restricted hours |
| `screen_time_limit` | Native features exist (Take a Break, Shorts Timer) but not API-accessible | Guide parents to configure native YouTube screen time via Family Link. Supplement with device-level time limits. Phosra tracks activity signals (API activities, Takeout imports) for reporting |
| `screen_time_report` | Family Center shows activity insights but no API export | Phosra aggregates YouTube Data API activity signals + Takeout imports into unified cross-platform reports |
| `bedtime_schedule` | Native bedtime reminders exist but not API-accessible | Guide parents to configure via Family Center. Supplement with DNS-level blocking of youtube.com during bedtime hours. Device-level scheduling |
| `parental_event_notification` | Family Center sends email notifications for uploads/livestreams but no API | Phosra monitors API activity signals (new subscriptions, likes) and generates alerts. Supplement with device-level monitoring |
| `parental_consent_gate` | Family Link requires parent approval for app installs and settings changes | Native feature via Family Link -- Phosra documents and leverages |
| `age_gate` | YouTube age-gating (18+) + AI age estimation (2025) | Native feature; Phosra supplements with content analysis via Data API to identify borderline content below the age-gate threshold |
| `social_control` | YouTube comments, live chat, messaging -- controllable via supervised accounts | Restricted Mode hides comments. Family Link can restrict comment posting. Phosra guides parents through configuration |

### Not Enforceable on YouTube

| Rule Category | Reason |
|---|---|
| `purchase_control` | YouTube is free/ad-supported; Premium is subscription-only. No in-app purchases to control (Super Chat donations are separate and require age verification) |
| `location_tracking` | Not applicable to video streaming |
| `web_filtering` | YouTube IS the content -- not a browser for external websites |
| `safe_search` | YouTube's search is the only search; safeSearch parameter covers this (moved to Fully Enforceable) |
| `app_control` | Not applicable -- YouTube is one platform, not an app store |
| `custom_blocklist` / `custom_allowlist` | Limited to YouTube Kids "Approved Content Only" mode. No equivalent for main YouTube |
| `commercial_data_ban` | Not controllable from consumer side (YouTube handles ad targeting internally; COPPA "Made for Kids" flag disables personalized ads automatically) |
| `algorithmic_audit` | Not controllable from consumer side (YouTube's recommendation algorithm is proprietary; teen content quality principles announced but not auditable by third parties) |

---

## 2. Enforcement Strategy

### Read Operations (YouTube Data API v3 -- fully legitimate)

```
GET video metadata          -> videos.list (part=snippet,contentDetails,status)
GET content ratings         -> videos.list (part=contentDetails) -> contentRating object
GET madeForKids status      -> videos.list (part=status) -> madeForKids flag
GET search with safe filter -> search.list (safeSearch=strict|moderate|none)
GET channel info            -> channels.list (part=snippet,statistics)
GET user activity           -> activities.list (mine=true)
GET liked videos            -> playlistItems.list (playlistId=LL)
GET subscriptions           -> subscriptions.list (mine=true)
```
- Use OAuth 2.0 tokens (auto-refresh via refresh token)
- Lightweight, fast, fully ToS-compliant
- Quota: 10,000 units/day default (search=100 units; most reads=1 unit)
- Run content analysis on schedule (every 1-2 hours for activity monitoring)
- Cache video metadata aggressively (videos rarely change ratings)

### Write Operations (NOT possible via API -- guided parent actions)

```
SET content level           -> GUIDE parent through Family Link UI
SET Restricted Mode         -> DNS CNAME to restrict.youtube.com (network-level)
SET Shorts timer            -> GUIDE parent through Family Center UI
SET bedtime reminder        -> GUIDE parent through Family Center UI
SET autoplay                -> GUIDE parent through YouTube settings
BLOCK channel (YT Kids)    -> GUIDE parent through YouTube Kids app
```
- No Playwright automation against Google services (too risky)
- Phosra provides step-by-step in-app guides with screenshots
- Settings sync: parent confirms current settings in Phosra after applying changes
- DNS-level Restricted Mode is the ONE write operation Phosra can perform directly

### Screen Time Enforcement (Hybrid: Native + Phosra-managed)

```
1. Parent configures YouTube native screen time features via Family Link
   (Take a Break, Bedtime, Shorts Timer -- guided by Phosra)
2. Phosra supplements with:
   a. DNS-level blocking of youtube.com during bedtime hours
   b. Device-level time limits (iOS Screen Time / Android integration)
   c. Activity monitoring via Data API for reporting
3. Phosra reports:
   a. Activity signals (new likes, subscriptions, comments)
   b. Content analysis (video ratings, madeForKids flags)
   c. Google Takeout import for historical watch time
4. Parent receives unified cross-platform report in Phosra dashboard
```

### Why No Playwright for Writes

Google operates the most sophisticated bot detection infrastructure in the industry. Unlike Netflix (where Playwright is risky but feasible), automating Google services (Family Link, Family Center, YouTube settings) is:

1. **Almost certainly detectable** -- Google's reCAPTCHA, behavioral analysis, and device fingerprinting are industry-leading
2. **High account risk** -- Google Account suspension would affect ALL Google services (Gmail, Drive, Photos, etc.), not just YouTube
3. **Unnecessary** -- YouTube already has a public API for content reads, and DNS-level enforcement handles the most important write (Restricted Mode)
4. **Strategically unwise** -- Phosra should pursue Google partnership for Family Link API access rather than antagonize Google with automation

---

## 3. Credential Storage Requirements

Phosra's YouTube integration has **dramatically simpler** credential requirements than Netflix or Peacock, thanks to OAuth 2.0:

| Credential | Purpose | Sensitivity | Storage Notes |
|---|---|---|---|
| OAuth refresh token | API access without re-login | High | Encrypted at rest (AES-256); auto-rotates when Google issues new token |
| OAuth access token | Short-lived API calls | Medium | In-memory only; 1-hour TTL; regenerated from refresh token |
| YouTube API key | Public data reads (no user context) | Low | Stored in environment config; not per-user |
| Family member mapping | Which Google Account maps to which Phosra child | Low | Standard DB storage |
| DNS configuration | restrict.youtube.com CNAME setting | Low | Router/network configuration |

### Security Advantages Over Netflix/Peacock

- **No password storage** -- OAuth means Phosra NEVER sees the user's Google password
- **No session cookie management** -- Google handles session lifecycle
- **No MFA complexity** -- Google's OAuth handles 2FA internally during consent flow
- **User-revocable** -- User can revoke Phosra's access at any time from Google Account settings
- **Scoped access** -- Phosra only gets the specific permissions the user grants

---

## 4. OAuth Assessment

### YouTube Provides Full OAuth 2.0

This is a **transformative differentiator** from Netflix and Peacock:

| Feature | YouTube | Netflix | Peacock |
|---|---|---|---|
| OAuth available | Yes (Google OAuth 2.0) | No | No |
| Credential storage required | No (refresh token only) | Yes (email + password) | Yes (email + password) |
| Delegated access scopes | Yes (youtube.readonly, youtube, etc.) | N/A | N/A |
| User can revoke access | Yes (Google Account settings) | N/A | N/A |
| MFA handled by platform | Yes (Google handles 2FA) | Must automate MFA | Must automate PIN |
| ToS-compliant API access | Yes | No | No |

### Available OAuth Scopes

| Scope | Purpose | Phosra Need |
|---|---|---|
| `https://www.googleapis.com/auth/youtube.readonly` | Read-only access to YouTube account | P0 -- content analysis, activity monitoring |
| `https://www.googleapis.com/auth/youtube` | Manage YouTube account (includes writes) | P1 -- subscription management |
| `https://www.googleapis.com/auth/youtube.force-ssl` | Same as youtube but requires SSL | P0 -- secure API calls |
| `https://www.googleapis.com/auth/youtube.upload` | Upload videos | Not needed |

### OAuth UX Flow

1. Parent clicks "Connect YouTube" in Phosra dashboard
2. Phosra redirects to Google OAuth consent screen
3. Parent signs in with their Google Account (Google handles 2FA)
4. Parent reviews and approves Phosra's requested scopes
5. Google redirects back to Phosra with authorization code
6. Phosra exchanges code for access + refresh tokens
7. Phosra stores refresh token (encrypted) -- no password ever touches Phosra's servers
8. For each family member, repeat OAuth flow with child's account (if supervised account allows OAuth) or parent connects on behalf of child

---

## 5. Adapter Gap Analysis

### What Exists (current state)

| Feature | Status |
|---|---|
| YouTube adapter code | Not started |
| OAuth integration | Not implemented |
| YouTube Data API client | Not implemented |
| Family Link automation | N/A (not recommended) |
| Content intelligence engine | Not implemented |
| DNS enforcement | Not implemented |

### What's Needed (for production Phosra integration)

| Feature | Status | Priority |
|---|---|---|
| Google OAuth 2.0 flow | Missing | P0 |
| YouTube Data API v3 client | Missing | P0 |
| Content classification engine (safeSearch + madeForKids + contentRating) | Missing | P0 |
| Video/channel safety scoring | Missing | P0 |
| Activity monitoring (activities.list, Liked Videos) | Missing | P1 |
| Parental control setup wizard (Family Link guide) | Missing | P1 |
| Settings sync UI (parent reports config) | Missing | P1 |
| DNS Restricted Mode enforcement | Missing | P1 |
| Google Takeout import pipeline | Missing | P2 |
| YouTube Kids configuration guide | Missing | P2 |
| Content alert system (flag concerning videos) | Missing | P1 |
| Cross-platform reporting (YouTube data in unified dashboard) | Missing | P1 |
| Device-level monitoring integration | Missing | P2 |
| Google partnership exploration (Family Link API) | Missing | P2 |

### Migration Path

1. Build YouTube adapter as a new module in `web/src/lib/platform-adapters/youtube/`
2. Core: OAuth + Data API client + content classification engine
3. Phase 2: Activity monitoring + parental control guide wizard + DNS enforcement
4. Phase 3: Takeout import + device-level monitoring + partnership exploration
5. YouTube adapter architecture is fundamentally different from Netflix/Peacock (API-first vs browser-automation-first) -- do not try to share adapter infrastructure

---

## 6. Platform-Specific Considerations

### User-Generated Content Challenge

YouTube's content is **fundamentally different** from Netflix/Peacock:
- 500+ hours of video uploaded every minute
- No standard industry ratings (MPAA, TV-PG) for most content
- Creator self-designation ("Made for Kids") is the primary classification signal
- Automated content moderation catches egregious violations but misses nuance
- The "Elsagate" problem (disturbing content disguised as kid-friendly) persists despite improvements
- YouTube Shorts algorithmic feed can surface unexpected content rapidly

**Phosra opportunity:** Build a content intelligence layer that goes beyond YouTube's own classification. Use the Data API to analyze video metadata, channel history, comment sentiment, and cross-reference with Common Sense Media ratings where available.

### YouTube Shorts Risk

YouTube Shorts presents unique risks for minors:
- Infinite scroll algorithmic feed (similar to TikTok)
- Content appears rapidly with minimal preview
- Algorithmic recommendations can drift toward increasingly edgy content
- YouTube has acknowledged this by adding Shorts-specific parental controls (timer, ability to set to zero)
- As of 2026, parents of supervised accounts can disable Shorts entirely

**Phosra approach:** Highlight Shorts as a specific risk area in parental reports. Guide parents to use Family Center Shorts timer. Recommend setting Shorts timer to zero for younger children.

### YouTube Premium Impact

YouTube Premium ($13.99/mo individual, $22.99/mo family) affects parental controls:
- **Removes ads** -- eliminates ad-based content exposure (some ads may be inappropriate)
- **Background play** -- audio continues when app is minimized (harder for parents to monitor)
- **Downloads** -- offline content can be watched without network-level controls
- **No ad-supported content filtering** -- Premium does not change content recommendations or restrictions

**Phosra note:** YouTube Premium Family plan is required for Phosra's family-wide integration to work smoothly. Free YouTube accounts with ads may see different content behavior.

### COPPA Compliance History

YouTube's $170M FTC settlement (2019) for COPPA violations fundamentally changed the platform:
- All channels must declare if content is "Made for Kids"
- Made for Kids videos disable personalized ads, comments, notifications, and more
- This `madeForKids` flag is **accessible via the YouTube Data API** -- Phosra can leverage it
- Disney's $10M FTC settlement (2025) for similar YouTube-related COPPA violations reinforces ongoing regulatory pressure

### AI Age Estimation (2025)

YouTube's rollout of AI-powered age estimation in August 2025:
- Uses viewing patterns, account age, content preferences to estimate user age
- Automatically applies teen protections if user is estimated to be under 18
- Users can appeal with government-issued ID
- Disables personalized advertising for estimated minors
- Enables default screen time and bedtime reminders

**Phosra impact:** This is a positive development -- YouTube is doing more automated age-appropriate filtering. Phosra should document this as a native platform strength and focus on supplementing areas where YouTube's estimation may be incorrect or insufficient.

---

## 7. API Accessibility Reality Check

**Platform:** YouTube / YouTube Kids
**API Accessibility Score:** Level 3 (Public Read API) -- highest of any platform researched
**Phosra Enforcement Level:** Split model -- Platform-Native for content reads, Device-Level for parental control writes

### What Phosra CAN do (via official, legitimate API):

- Read video metadata, content ratings, madeForKids status for any public video
- Search with safeSearch filtering (none/moderate/strict) -- official API parameter
- Read user's YouTube activity (uploads, likes, subscriptions, comments)
- Read user's Liked Videos playlist as content preference signal
- Read channel information and statistics
- Manage user's subscriptions (read/write with OAuth)
- Build comprehensive content intelligence / safety scoring engine
- Classify videos and channels for age-appropriateness using API data
- Alert parents to concerning content their child has interacted with
- Enforce Restricted Mode at DNS level (restrict.youtube.com CNAME)

### What Phosra CANNOT do:

- Read or write Family Link supervised account settings (no API)
- Read or write YouTube Kids profile settings (no API)
- Read real-time watch history (API deprecated since 2016)
- Toggle Restricted Mode per-account (only via Family Link or DNS)
- Set content levels for supervised accounts (Explore/Explore More/Most of YouTube)
- Set or read screen time limits (Take a Break, Shorts Timer, Bedtime)
- Block specific videos or channels on the main YouTube app
- Create YouTube Kids profiles or supervised accounts
- Lock/unlock a YouTube profile (concept does not exist)

### What Phosra MIGHT be able to do (with partnership or workaround):

- Google Takeout import for historical watch data (legitimate but batch/manual)
- Google partnership for Family Link API access (exploratory -- no precedent for third-party access)
- Device-level monitoring integration (via Bark/Qustodio-style device agent)
- Browser extension for YouTube that adds Phosra-managed restrictions (content blocking, time limits)
- Router-level integration for DNS-based Restricted Mode + time-of-day blocking

### Recommendation

YouTube requires a fundamentally different Phosra adapter strategy than Netflix or Peacock:

**For Netflix/Peacock:** Phosra must automate the platform's web UI (Playwright) because no API exists. This is high-risk, ToS-violating, and fragile.

**For YouTube:** Phosra should build a **content intelligence platform** on top of the official YouTube Data API v3. Instead of trying to directly control YouTube's parental settings (which requires Google Family Link and has no third-party API), Phosra should:

1. **Maximize API reads** -- Build the best content analysis and safety scoring engine in the market using YouTube's rich API data
2. **Guide, don't automate** -- Help parents configure YouTube's native controls (Family Link, YouTube Kids) through step-by-step in-app walkthroughs instead of trying to automate Google services
3. **Enforce at the network level** -- Use DNS-based Restricted Mode enforcement for household-wide protection
4. **Report across platforms** -- Aggregate YouTube activity data into Phosra's unified family dashboard alongside Netflix, Peacock, and other platforms
5. **Pursue Google partnership** -- YouTube's regulatory environment (COPPA settlement, KOSA pressure, AI age estimation) suggests Google may eventually open Family Link APIs for authorized child safety partners. Phosra should position as a potential partner

This approach is lower risk, fully ToS-compliant, more reliable, and plays to YouTube's unique strength as the most API-open streaming platform. The trade-off is less direct control -- but the content intelligence capabilities more than compensate.
