# YouTube Parental Controls Research Findings

**Platform:** YouTube / YouTube Kids
**Research Date:** 2026-03-01
**Account Type:** Google Account with YouTube Premium Family Plan + Family Link supervised accounts
**Research Method:** Web research, YouTube Data API v3 documentation analysis, Google support documentation review
**Artifacts:** YouTube Data API v3 endpoint catalog, YouTube Kids content level mapping, supervised account content tier analysis

---

## 1. Profile Management

### Account & Profile Structure

YouTube does not use traditional "profiles" the way Netflix or Peacock do. Instead, YouTube's identity model is built on **Google Accounts**, with parental controls layered through **Google Family Link supervision** and a separate **YouTube Kids** app.

- **No profile-per-account model:** Each Google Account IS the YouTube identity. There are no sub-profiles within a single YouTube account.
- **Family group:** A Google Family group can include up to 6 members (1 family manager + 5 members). Each member has their own Google Account.
- **Channels per account:** A single Google Account can manage up to 100 YouTube channels (personal + Brand Account channels), but this is for content creation, not viewing profiles.
- **Supervised accounts:** Children under 13 (or applicable age) get supervised Google Accounts managed through Family Link. Children 13+ can have regular accounts with optional teen supervision via Family Center.

### YouTube Kids Profiles

YouTube Kids operates differently from the main YouTube app:
- Parents can create **multiple YouTube Kids profiles** under their Google Account
- Each profile is configured with a name, age, and content level
- Profile creation requires the parent's Google Account password
- Profiles are tied to the parent's Google Account, not a separate child account

### Profile Types

| Profile Type | Description | Who Controls It |
|---|---|---|
| **Regular Google Account** | Full YouTube access, no restrictions unless self-configured | Account holder |
| **Supervised Child Account (under 13)** | Google Account managed via Family Link, restricted YouTube experience | Parent via Family Link |
| **Supervised Teen Account (13-17)** | Google Account with optional Family Center supervision | Parent + teen (collaborative) |
| **YouTube Kids Profile** | Separate app/site profile for young children | Parent |

### Key Security Consideration

Profile creation for YouTube Kids requires the parent's Google Account password. However, a child with a supervised Google Account can still access youtube.com directly (with supervised restrictions) unless the parent specifically blocks the YouTube app via Family Link and restricts to YouTube Kids only. **The gap is that supervised accounts give more access than YouTube Kids profiles.**

---

## 2. Content Restrictions

### YouTube's Unique Content Model

Unlike traditional streaming platforms with curated, professionally rated content, YouTube hosts **user-generated content (UGC)** with no standard industry rating system (MPAA, TV Parental Guidelines). Content filtering relies on:

1. **YouTube's automated classification system** (machine learning)
2. **Creator self-designation** ("Made for Kids" flag, required by COPPA)
3. **Community Guidelines enforcement** (human + automated review)
4. **Restricted Mode** (binary toggle)
5. **Supervised account content levels** (3 tiers for YouTube, 3 tiers + "Approved Only" for YouTube Kids)

### YouTube Kids Content Levels

| Content Level | Target Age | Description | Content Examples |
|---|---|---|---|
| **Preschool** | 4 & under | Simplest content for youngest viewers | Nursery rhymes, cartoons, read-alongs, circle time, yoga |
| **Younger** | 5-8 | Wider variety for early elementary | Gaming, family vloggers, DIY, learning, how-tos, plus all Preschool content |
| **Older** | 9-12 | More grown-up filtered content | Music, gaming, vlogs, comedy, sports, plus all Younger content |
| **Approved Content Only** | Any age | Parent hand-picks every channel/video | Only content the parent has explicitly approved |

### YouTube Supervised Account Content Levels

| Content Level | Target Age | Description | Content Included |
|---|---|---|---|
| **Explore** | 9+ | Content generally suitable for ages 9+ | Vlogs, tutorials, gaming, music, news, educational, DIY |
| **Explore More** | 13+ | Broader range including some mature themes | Everything in Explore + content rated for 13+, live streams, some sexual education content |
| **Most of YouTube** | Older teens | Nearly all YouTube content | Almost everything except age-gated 18+ content |

### Restricted Mode

- **Type:** Binary toggle (on/off) -- NOT tiered like Netflix
- **Scope:** Per-browser, per-device, or per-account (lockable via Family Link)
- **Mechanism:** Hides videos flagged as potentially mature based on metadata, title, language, age restrictions, and automated signals
- **Limitations:** Not 100% accurate; some mature content may slip through, some appropriate content may be hidden
- **Comments:** Restricted Mode also hides all video comments
- **Network enforcement:** Can be enforced at DNS level by pointing to `restrict.youtube.com` (strict) or `restrictmoderate.youtube.com` (moderate)

### Age-Gated Content (18+)

- Videos deemed inappropriate for viewers under 18 are age-gated
- Viewers must be signed in and have their age verified (via date of birth on Google Account)
- As of August 2025, YouTube uses **AI-powered age estimation** to detect likely underage users regardless of their stated birthday
- Users incorrectly flagged as minors can verify age with government-issued ID

### Phosra Rating System Mapping

| Phosra System | YouTube Support | Notes |
|---|---|---|
| **MPAA (Film)** | Indirect via API | `contentDetails.contentRating.mpaatRating` available for professionally rated trailers/films only |
| **TV Parental Guidelines** | N/A | Not applicable -- YouTube content is not TV-rated |
| **ESRB (Games)** | N/A | Not applicable |
| **PEGI (EU Games)** | N/A | Not applicable |
| **Common Sense Media** | External | CSM independently rates some YouTube channels/content but YouTube does not integrate these |

### Content Descriptor Filtering

YouTube does **not** expose content descriptors (violence, language, nudity) as filterable categories. Content filtering is entirely tier-based (YouTube Kids levels, supervised account levels, or Restricted Mode on/off). There is no granular "block violence but allow mild language" control.

---

## 3. PIN / Lock Protection

### YouTube Kids Passcode

- **Type:** Custom passcode (parent-set) or multiplication problem (default)
- **Scope:** Per YouTube Kids app instance
- **Purpose:** Prevents children from accessing YouTube Kids settings, including content level changes, search toggle, timer settings
- **Set on:** Mobile apps (iOS/Android), smart TVs, web (youtubekids.com)

### Family Link / Family Center Controls

- **Type:** Parent's Google Account password required for Family Link changes
- **Scope:** Account-wide (affects all Google services including YouTube)
- **MFA:** Google Account 2-step verification protects the parent account
- **PIN for purchases:** Google Play purchase approval controls (separate from YouTube content controls)

### Restricted Mode Lock

- **Via Family Link:** Parents can lock Restricted Mode ON for supervised accounts -- child cannot turn it off
- **Via Network/DNS:** Restrict Mode can be enforced at the DNS level, making it impossible to bypass on that network
- **Via Google Workspace:** Network administrators (schools) can enforce Restricted Mode

### Key Consideration

There is **no per-profile PIN system** like Netflix. YouTube's protection model relies on:
1. Google Account authentication (parent's password)
2. Family Link app controls (parent's device)
3. YouTube Kids passcode (simple, not PIN-per-profile)

A motivated teen could potentially bypass YouTube controls by:
- Creating a new Google Account without parental supervision
- Using a different device/browser not under Family Link
- Using a VPN to bypass DNS-level Restricted Mode enforcement

---

## 4. Screen Time Controls

### Native Support: **YES (Partial)**

Unlike most streaming platforms, YouTube offers several native screen time management features:

#### Take a Break Reminders
- Users can set reminders at 15, 30, 60, 90, or 180-minute intervals
- Video pauses when reminder triggers
- Parents of supervised accounts can set non-dismissible reminders (rolling out 2026)

#### Bedtime Reminders
- Configurable start and end time
- Pauses video playback during bedtime hours
- Parents of supervised accounts can set these via Family Center

#### Shorts Timer
- Daily time limit specifically for YouTube Shorts scrolling
- Parents can set the timer from 2 hours down to **0 minutes** (complete Shorts block)
- When limit is reached, Shorts feed is paused (pop-up notification)
- As of early 2026, the pop-up is dismissible for regular accounts but non-dismissible for supervised teen accounts

#### YouTube Kids Timer
- Built-in timer that locks the YouTube Kids app after a set duration
- Parent configures via YouTube Kids settings
- App locks and requires parent passcode to continue

#### Autoplay Controls
- **YouTube:** Autoplay next video can be toggled on/off per account
- **YouTube Kids:** Parents can disable autoplay; child cannot re-enable it
- YouTube Premium removes all ads, reducing passive watching triggers

#### School Time (Android, 2026)
- New feature allowing parents to set school-time restrictions on Android devices
- Blocks or limits YouTube during specified school hours

### What Phosra Can Leverage

YouTube's native screen time features are **significantly more advanced** than Netflix, Peacock, or most streaming platforms. Phosra can:
1. Read and set these controls via Family Link (if API access available)
2. Supplement with Phosra-managed time tracking
3. Use Family Center visibility to provide unified cross-platform time reports

---

## 5. Viewing History & Monitoring

### YouTube Watch History

- **Location:** youtube.com/feed/history or YouTube app > Library > History
- **Data available:**
  - Video title
  - Channel name
  - Thumbnail
  - Date/time watched
  - Video URL/ID
- **Data NOT available:**
  - Watch duration per video (how much of the video was watched)
  - Exact session length
  - Real-time "currently watching" indicator
- **Per-account:** Each Google Account has its own watch history
- **Pause/clear:** Users (or parents via Family Link) can pause or clear watch history
- **Search history:** Separate search history is also available

### YouTube Kids Watch History

- Parents can view their child's YouTube Kids watch history
- History can be paused (stops recommendations based on recent views)
- More limited data than full YouTube

### Google Takeout Export

- Full watch history can be exported via Google Takeout (takeout.google.com)
- Export formats: JSON or HTML
- Data includes: video ID, title, channel title, timestamp
- Does NOT include watch duration
- Bulk export -- not real-time

### YouTube Data API v3 (Watch History)

**CRITICAL: Watch history API access was DEPRECATED in 2016-2017.**

- The `activities.list` method's `home` parameter (which returned the user's activity feed) returns empty lists since September 2016
- Requests to retrieve a channel's watch history playlist (`playlists.list`) also return empty since September 2016
- **There is no API method to read a user's watch history** -- this is a major gap for Phosra

### Family Center Activity Monitoring

- Parents can see shared insights into teens' channel activity
- Includes: number of uploads, subscriptions, comments
- Proactive email notifications for key events (uploads, livestreams)
- Does NOT provide detailed watch history or watch time data to parents via API

### Limitations

- No real-time viewing alerts via API
- No watch duration data (only title + timestamp)
- Watch history API deprecated since 2016
- Child can clear or pause their own watch history (unless parent locks this via Family Link)
- Google Takeout is batch export only, not suitable for real-time monitoring

---

## 6. API / Technical Architecture

### YouTube Data API v3 (Public API)

YouTube is **unique among streaming platforms** in having a fully documented, publicly available API. This is a fundamental differentiator from Netflix, Peacock, and most other platforms.

**Developer Portal:** https://developers.google.com/youtube/v3
**Authentication:** API Key (public data) or OAuth 2.0 (user data)

#### Key API Endpoints

| Endpoint | Purpose | Auth Required | Quota Cost |
|---|---|---|---|
| `GET /youtube/v3/search` | Search videos with safeSearch filter | API Key or OAuth | 100 units |
| `GET /youtube/v3/videos` | Video metadata, content ratings, contentDetails | API Key or OAuth | 1 unit per video |
| `GET /youtube/v3/channels` | Channel information | API Key or OAuth | 1 unit |
| `GET /youtube/v3/playlists` | Playlist data | API Key or OAuth | 1 unit |
| `GET /youtube/v3/activities` | Channel activities (uploads, likes, subscriptions) | OAuth | 1 unit |
| `GET /youtube/v3/subscriptions` | User's subscriptions | OAuth | 1 unit |
| `GET /youtube/v3/commentThreads` | Video comments | API Key or OAuth | 1 unit |

#### Search safeSearch Parameter

| Value | Behavior |
|---|---|
| `none` | No content filtering |
| `moderate` | Filter some restricted content (default) |
| `strict` | Exclude all restricted content |

#### Video Content Rating Data

The `videos.list` endpoint with `part=contentDetails` returns a `contentRating` object containing:
- `mpaatRating` -- MPAA rating for movie trailers
- `ytRating` -- YouTube's own age restriction (`ytAgeRestricted`)
- Various country-specific ratings (BBFC, FSK, etc.)
- `madeForKids` flag (COPPA compliance)

#### Quota System

- Default: 10,000 units per day per project
- Search costs 100 units per request
- Most other read operations cost 1 unit
- Write operations cost 50+ units
- Can request quota increase via Google Cloud Console

### YouTube IFrame Player API

| Feature | Purpose | Parental Control Relevance |
|---|---|---|
| Embed player in web pages | Controlled video playback | Can restrict which videos play |
| Player parameters | Autoplay, loop, controls | Can disable autoplay |
| Event listeners | onStateChange, onError | Can detect playback state |
| No safeSearch/Restricted Mode param | Cannot enforce restricted mode via embed | Limitation |

### YouTube oEmbed API

- Endpoint: `GET https://www.youtube.com/oembed?url={video_url}`
- Returns: title, author, thumbnail, embed HTML
- No authentication required
- Useful for content metadata without API key
- No content rating or maturity data returned

### Authentication Architecture

| Method | Use Case | Scope |
|---|---|---|
| **API Key** | Public data (search, video metadata) | Read-only, no user context |
| **OAuth 2.0** | User-specific data (subscriptions, likes, playlists) | Read/write with user consent |
| **Google Account session** | Full YouTube web app access | All features including settings |
| **Family Link session** | Parental control management | Supervised account controls |

### Infrastructure

- **Platform:** Google Cloud Platform (GCP)
- **CDN:** Google Global Cache
- **Mobile:** Native apps (iOS/Android) with proprietary Innertube API
- **Web:** youtube.com uses Innertube API (internal, undocumented) + Polymer/Web Components
- **Bot detection:** reCAPTCHA, behavioral analysis, fingerprinting (Google-grade)

---

## 7. Account Structure & Integration Points

### Account Hierarchy

```
Google Account (Parent/Family Manager)
  |
  +-- YouTube Premium Family Plan (up to 6 members)
  |     +-- Ad-free, background play, downloads for all members
  |
  +-- Google Family Group
  |     +-- Family Manager (parent)
  |     +-- Member 1 (child, supervised via Family Link)
  |     |     +-- YouTube Kids Profile(s) (separate app)
  |     |     |     +-- Content level: Preschool/Younger/Older/Approved Only
  |     |     |     +-- Search: on/off
  |     |     |     +-- Timer: configurable
  |     |     |     +-- Autoplay: on/off
  |     |     +-- Supervised YouTube Experience
  |     |           +-- Content level: Explore/Explore More/Most of YouTube
  |     |           +-- Restricted Mode: lockable
  |     |           +-- Shorts timer: configurable
  |     |           +-- Bedtime/Take a break reminders
  |     +-- Member 2 (teen, supervised via Family Center)
  |     |     +-- Full YouTube with optional supervision
  |     |     +-- Shared activity insights with parent
  |     |     +-- Removable by teen
  |     +-- Member 3-5 (additional family members)
  |
  +-- YouTube Channels (up to 100)
        +-- Personal channel
        +-- Brand Account channels
```

### Subscription Tiers

| Plan | Price (US) | Members | Key Features |
|---|---|---|---|
| **Free** | $0 | 1 | Ad-supported, full YouTube with ads |
| **Premium Lite** | $7.99/mo | 1 | Ad-free videos only (no YouTube Music) |
| **Premium** | $13.99/mo | 1 | Ad-free, background play, downloads, YouTube Music |
| **Premium Family** | $22.99/mo | Up to 6 | All Premium features for family group |

### Key Integration Points for Phosra

1. **YouTube Data API v3** -- Public API with OAuth 2.0. Phosra can read video metadata, content ratings, search with safeSearch. **This is a major advantage over Netflix/Peacock.**
2. **Google OAuth 2.0** -- Delegated access with user consent. No credential storage needed for API reads.
3. **Family Link / Family Center** -- Parental controls are managed here, but **no public API exists** for Family Link.
4. **YouTube Kids** -- Separate app with its own controls, no API access.
5. **DNS-level Restricted Mode** -- Network-level enforcement via `restrict.youtube.com` CNAME.
6. **Made for Kids flag** -- API-accessible COPPA designation on videos.
7. **Watch history gap** -- API access to watch history was deprecated in 2016; Google Takeout is batch-only.

---

## 8. API Accessibility & Third-Party Integration

### API Accessibility Score: **Level 3 (Public Read API)**

YouTube is the **most API-accessible streaming platform** Phosra has researched. The YouTube Data API v3 provides:
- Authenticated public API with OAuth 2.0
- Video metadata, content ratings, madeForKids status
- Search with safeSearch filtering (none/moderate/strict)
- Channel and playlist data
- Subscription management (read/write)

However, critical **parental control features are NOT exposed via the public API**:
- No API for Family Link / supervised account controls
- No API for Restricted Mode toggle
- No API for YouTube Kids settings
- No API for screen time / bedtime settings
- Watch history API deprecated since 2016

### Per-Capability Accessibility Matrix

| Capability | Feature Exists? | Public API? | Unofficial API? | Access Method | Auth Required | 3rd Party Can Control? | Verdict |
|---|---|---|---|---|---|---|---|
| Video metadata + ratings | Yes | Yes (Data API v3) | N/A | Public API | API Key or OAuth | Yes (read-only) | Best-case: official API reads |
| Search with safe filter | Yes | Yes (safeSearch param) | N/A | Public API | API Key or OAuth | Yes (read-only) | Official API with 3 filter levels |
| Restricted Mode toggle | Yes | No | No known endpoint | Family Link app or browser | Google Account | No | Parent must configure manually or via Family Link |
| Content level (supervised) | Yes (3 tiers) | No | No known endpoint | Family Link app | Google Account | No | Parent must configure via Family Link |
| YouTube Kids settings | Yes | No | No known endpoint | YouTube Kids app | Parent passcode | No | Parent must configure in app |
| Shorts timer | Yes | No | No known endpoint | Family Center | Google Account | No | Parent must configure via Family Center |
| Bedtime/Take a break | Yes | No | No known endpoint | Family Center | Google Account | No | Parent must configure via Family Center |
| Watch history | Yes (in UI) | Deprecated (2016) | Innertube (risky) | Google Takeout (batch) or Playwright | OAuth or session | Read-only (Takeout) | API deprecated; Takeout is batch-only |
| Autoplay control | Yes | No | No known endpoint | YouTube settings or Family Link | Google Account | No | Parent must configure |
| Channel/video blocking | Partial (YouTube Kids only) | No | No known endpoint | YouTube Kids app | Parent passcode | No | Only in YouTube Kids, not main YouTube |
| Subscriptions | Yes | Yes (Data API v3) | N/A | Public API | OAuth | Yes (read/write) | Official API with OAuth |
| Activity notifications | Partial (Family Center emails) | No | No | Family Center | Google Account | No | Email-only, no API |

### Third-Party Integration Reality Check

#### What Existing Parental Control Apps Do

| App | YouTube Integration | API Usage |
|---|---|---|
| **Google Family Link** | Native first-party integration -- manages supervised accounts, content levels, Restricted Mode, screen time | Internal Google APIs (not available to third parties) |
| **Bark** | Monitors YouTube activity on device; alerts on concerning content in videos watched | Device-level monitoring, no YouTube API integration |
| **Qustodio** | Reports 5 most recent YouTube videos watched + search history from mobile app | Device-level app monitoring, no YouTube API integration |
| **Net Nanny** | YouTube monitoring: video names, search history, video links | Device-level monitoring, no YouTube API integration |
| **Circle** | DNS-level time limits and content filtering for YouTube | Network/DNS level (can enforce Restricted Mode via DNS CNAME) |
| **Apple Screen Time** | Can limit YouTube app usage time, block app entirely | OS-level app management |

**Key insight:** Google Family Link has achieved the **only direct platform integration** with YouTube parental controls. All other parental control apps operate at the device or network level. No third-party app uses the YouTube Data API v3 for parental control purposes, because the API does not expose parental control endpoints.

#### Has Any Third Party Achieved API Integration?

- **Google Family Link** is the only product with direct YouTube parental control integration, but it is a first-party Google product, not a third-party integration
- The YouTube Data API v3 is widely used for content metadata, but **no third party uses it for parental controls**
- The Google issue tracker contains a request for developer access to the Family Link API (issue #302210616) -- it remains unresolved

### Legal / ToS Assessment

| Assessment Area | Detail |
|---|---|
| **ToS on automated access** | YouTube API Services Terms of Service govern all API access. Automated access outside the API (scraping, Playwright) violates Google ToS. However, **YouTube explicitly provides an API** -- usage within API limits is legitimate |
| **API Developer Policies** | Developers must create high-quality, transparent apps. Must obtain user consent. Must not automate actions without user's express consent. Compliance violations risk API access termination |
| **Anti-bot detection** | Google-grade: reCAPTCHA, behavioral analysis, device fingerprinting, IP reputation. Among the most sophisticated bot detection in the industry |
| **Account suspension risk** | Low for API usage within quotas and policies. High for Playwright/scraping outside the API |
| **OAuth approach** | YouTube provides OAuth 2.0 -- Phosra can get legitimate delegated access with user consent. **This is a massive advantage over Netflix/Peacock** |
| **Regulatory context** | YouTube's $170M FTC COPPA settlement (2019) and ongoing regulatory pressure (KOSA, DSA) create incentive for YouTube to expand parental control APIs |
| **Precedent** | Google Family Link demonstrates that direct parental control integration is technically feasible. The barrier is access, not technology |

### Overall Phosra Enforcement Level

YouTube presents a **split integration model**:

- **Content metadata, search filtering, video ratings:** Platform-Native via official API (Level 3-5)
- **Parental controls (Restricted Mode, content levels, screen time):** Not API-accessible (Level 0 for parental control writes)
- **Watch history:** Deprecated API, batch export only (Level 0.5)

**Verdict:** YouTube is simultaneously the most open and most restricted platform Phosra has researched. The public API provides unprecedented content intelligence, but the actual parental control levers are locked behind Google Family Link with no third-party access. Phosra's strategy should maximize the API advantage for content analysis while exploring partnership with Google for Family Link integration.
