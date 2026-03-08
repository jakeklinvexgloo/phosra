# YouTube Adapter Assessment for Phosra

**Platform:** YouTube / YouTube Kids
**Assessment Date:** 2026-03-01
**Existing Adapter:** None (new platform)
**Recommended Approach:** Hybrid (YouTube Data API v3 for content reads + Family Link browser automation for parental control writes)

---

## API Accessibility Context

**Before evaluating individual adapter methods, it is critical to understand the unique API landscape:**

YouTube is fundamentally different from Netflix, Peacock, and other streaming platforms in one crucial way: it has a **fully documented, publicly available API** (YouTube Data API v3) with **OAuth 2.0 delegated access**. This eliminates credential storage for read operations and provides legitimate, ToS-compliant content intelligence.

However, YouTube's **parental control features** (Restricted Mode, content levels, screen time, YouTube Kids settings) are managed exclusively through **Google Family Link** and **YouTube Family Center**, neither of which exposes a public API. This creates a paradox: YouTube is the most API-open platform for content data, but the most closed for parental control management.

### What This Means for Each Method

| Access Pattern | API Accessibility | Stability | ToS Status |
|---|---|---|---|
| **Read via YouTube Data API v3** | Official public API, OAuth 2.0 auth | Stable, versioned, documented | Fully legitimate within quota limits |
| **Read via Google Takeout** | Official export tool, batch only | Stable but manual/batch | Legitimate |
| **Write via Family Link/Family Center** | No API exists (first-party Google app only) | N/A | Playwright would violate Google ToS |
| **YouTube Kids settings** | No API exists | N/A | Playwright would violate Google ToS |
| **Authentication** | OAuth 2.0 (official) | Stable, industry standard | Fully legitimate |

### Industry Benchmark

Google Family Link is the only product with direct YouTube parental control integration -- and it is Google's own first-party product. Bark, Qustodio, and Net Nanny all monitor YouTube at the device level only. No third-party application has achieved API-level parental control integration with YouTube.

---

## Adapter Method Assessment

### 1. `authenticate(credentials) -> Session`

| Aspect | Detail |
|---|---|
| **Implementation** | Public API (OAuth 2.0) |
| **API Accessibility Verdict** | Level 5 -- YouTube provides full OAuth 2.0 with delegated access |
| **Approach** | Standard Google OAuth 2.0 flow: redirect user to Google consent screen, receive authorization code, exchange for access + refresh tokens. **No credential storage required.** |
| **API Alternative** | N/A -- OAuth IS the primary approach. This is a major advantage over Netflix/Peacock |
| **Auth Required** | User grants OAuth consent; Phosra stores refresh token only |
| **Data Available** | Access token (1-hour TTL), refresh token (long-lived), user profile, scopes granted |
| **Data NOT Available** | User's Google password (not needed -- this is a feature, not a gap) |
| **Complexity** | Low |
| **Risk Level** | Low -- standard OAuth flow, fully ToS-compliant |
| **Recommendation** | Implement standard Google OAuth 2.0 with YouTube-specific scopes. Request `youtube.readonly` for content reads and `youtube` for subscription management. Store refresh tokens encrypted. Re-authenticate only when refresh token is revoked |

### 2. `listProfiles() -> Profile[]`

| Aspect | Detail |
|---|---|
| **Implementation** | Public API (YouTube Data API v3) for channels; NOT applicable for Family Link profiles |
| **API Accessibility Verdict** | Level 3 -- Can list channels/accounts via API but cannot list supervised child accounts or YouTube Kids profiles |
| **Approach** | Use `channels.list` with `mine=true` to get the authenticated user's YouTube channels. For family context, Phosra would need the parent to manually map their children's Google Accounts during setup |
| **API Alternative** | Google People API can list family group members (limited data) |
| **Auth Required** | OAuth 2.0 with `youtube.readonly` scope |
| **Data Available** | Channel ID, title, description, thumbnail, subscriber count, video count |
| **Data NOT Available** | Supervised child account list, YouTube Kids profiles, Family Link family group members, content level settings |
| **Complexity** | Low (for channel listing) / High (for family mapping -- requires manual parent input) |
| **Risk Level** | Low |
| **Recommendation** | Use YouTube Data API to get channel info for each family member. Parent manually connects each child's Google Account via separate OAuth consent (if child is old enough for OAuth) or manually in Phosra's setup wizard. For YouTube Kids profiles, store parent-provided profile info (no API access) |

### 3. `getProfileSettings(profileId) -> Settings`

| Aspect | Detail |
|---|---|
| **Implementation** | Not possible via API for parental control settings |
| **API Accessibility Verdict** | Level 0 -- Family Link and YouTube Kids settings are completely walled off from third-party API access |
| **Approach** | Phosra cannot read supervised account content levels, Restricted Mode status, YouTube Kids settings, or screen time configurations via any API. The only options are: (a) Playwright automation of Family Link web or (b) parent manually reports settings to Phosra |
| **API Alternative** | None. Family Link has no public API. Google issue tracker #302210616 requesting developer access remains unresolved |
| **Auth Required** | Parent's Google Account session (for Playwright) or manual input |
| **Data Available** | Via Playwright: content level, Restricted Mode status, Shorts timer, bedtime settings. Via API: nothing |
| **Data NOT Available** | All parental control settings via any API |
| **Complexity** | High (Playwright against Google services carries maximum detection risk) |
| **Risk Level** | High -- Google has the most sophisticated bot detection in the industry. Automating Family Link/Family Center is extremely risky |
| **Recommendation** | Do NOT attempt Playwright automation of Google Family Link. Instead, build a manual settings sync where parents report their current YouTube settings to Phosra. Explore Google partnership for Family Link API access as a medium-term strategy |

### 4. `setContentRestrictions(profileId, maturityLevel)`

| Aspect | Detail |
|---|---|
| **Implementation** | Not possible via API |
| **API Accessibility Verdict** | Level 0 -- No write access to content restriction settings |
| **Approach** | YouTube content restrictions are set via Family Link (supervised accounts) or YouTube Kids app. No API or unofficial endpoint exists for changing content levels. Phosra alternatives: (a) Guide parents through Family Link settings changes via in-app instructions, (b) Use DNS-level Restricted Mode enforcement (`restrict.youtube.com` CNAME), (c) Explore Google partnership |
| **API Alternative** | DNS-level Restricted Mode is the only third-party-enforceable content restriction. Set DNS CNAME for `youtube.com` and `www.youtube.com` to `restrict.youtube.com` for strict filtering or `restrictmoderate.youtube.com` for moderate |
| **Auth Required** | N/A for DNS; Google Account for Family Link |
| **Data Available** | N/A |
| **Data NOT Available** | Content level read/write, Restricted Mode toggle, YouTube Kids content level |
| **Complexity** | Low (DNS) / Not possible (API) |
| **Risk Level** | Low (DNS approach) / Not applicable (no API approach exists) |
| **Recommendation** | Primary: DNS-level Restricted Mode enforcement for households using Phosra router integration. Secondary: In-app guided walkthroughs for parents to configure Family Link settings. Long-term: Partnership with Google for Family Link API access |

### 5. `setTitleRestrictions(profileId, titles[])`

| Aspect | Detail |
|---|---|
| **Implementation** | Not possible (feature does not exist on YouTube in the Netflix sense) |
| **API Accessibility Verdict** | N/A -- YouTube does not offer per-title blocking for the main YouTube app |
| **Approach** | YouTube Kids allows parents to block specific channels (not individual videos on the main YouTube app). On the main YouTube app, there is no per-video or per-channel blocking mechanism for supervised accounts. Phosra alternatives: (a) Use YouTube Data API to identify concerning content and alert parents, (b) Use DNS/network-level blocking of specific video URLs, (c) Build Phosra's own content allowlist/blocklist that controls playback via browser extension |
| **API Alternative** | YouTube Data API `search.list` with `safeSearch=strict` can pre-filter search results. `videos.list` returns `contentRating` and `madeForKids` status for content analysis |
| **Auth Required** | API Key for content analysis |
| **Data Available** | Video metadata, content ratings, madeForKids flag, channel info |
| **Data NOT Available** | Write access to block/allow specific videos or channels |
| **Complexity** | High (workaround approaches are complex) |
| **Risk Level** | Medium (content analysis is low risk; network-level blocking is medium) |
| **Recommendation** | Build a Phosra content intelligence layer using YouTube Data API v3 to classify videos and channels. Alert parents to concerning content. For blocking, recommend YouTube Kids "Approved Content Only" mode for young children. For teens, recommend DNS-level controls |

### 6. `setProfilePIN(profileId, pin)`

| Aspect | Detail |
|---|---|
| **Implementation** | Not possible via API |
| **API Accessibility Verdict** | Level 0 -- YouTube does not have a per-profile PIN system. YouTube Kids has a parent passcode but no API to set/change it |
| **Approach** | YouTube's security model is based on Google Account authentication (password + 2FA), not PINs. YouTube Kids has a parent passcode, but it is managed entirely within the YouTube Kids app with no external API. Phosra cannot set or change any YouTube authentication mechanism |
| **API Alternative** | None |
| **Auth Required** | N/A |
| **Data Available** | N/A |
| **Data NOT Available** | PIN/passcode management |
| **Complexity** | Not applicable |
| **Risk Level** | Not applicable |
| **Recommendation** | Return `UnsupportedOperationError`. Document that YouTube uses Google Account authentication rather than per-profile PINs. Phosra's own lock/unlock mechanism can serve as a supplementary access control |

### 7. `supportsNativeScreenTime() -> boolean`

| Aspect | Detail |
|---|---|
| **Implementation** | Static return |
| **API Accessibility Verdict** | N/A |
| **Value** | `true` -- YouTube has native screen time features (Take a Break, Bedtime Reminders, Shorts Timer, YouTube Kids Timer) |
| **Nuance** | YouTube has screen time features, but they are not API-accessible. Phosra knows they exist but cannot read or write their settings programmatically |
| **Alternative Enforcement** | Phosra can supplement with device-level screen time (iOS Screen Time, Android Digital Wellbeing) and guide parents to configure YouTube's native features |
| **Complexity** | None |
| **Risk Level** | None |
| **Recommendation** | Return `true` with metadata indicating features exist but are not API-controllable. Include links to Family Link setup instructions |

### 8. `getWatchHistory(profileId) -> WatchEntry[]`

| Aspect | Detail |
|---|---|
| **Implementation** | Google Takeout (batch) -- API watch history access was deprecated in 2016 |
| **API Accessibility Verdict** | Level 0.5 -- Was Level 3 before 2016 deprecation. Now only available via batch export (Google Takeout) or device-level monitoring |
| **Approach** | Options: (a) Guide users to export via Google Takeout and import into Phosra (manual, batch), (b) Use YouTube Data API `activities.list` for public activity (uploads, likes, subscriptions -- NOT watch history), (c) Device-level monitoring (like Bark/Qustodio) |
| **API Alternative** | `activities.list` returns channel activity (uploads, likes, subscriptions) but NOT watch history. `playlistItems.list` for "Liked Videos" playlist provides partial signal |
| **Auth Required** | OAuth 2.0 for activities; Google Account for Takeout |
| **Data Available** | Via Takeout: video ID, title, channel, timestamp. Via API activities: uploads, likes, subscriptions, comments |
| **Data NOT Available** | Real-time watch history via API, watch duration, session length, currently watching status |
| **Complexity** | High (no good automated solution exists) |
| **Risk Level** | Low (Takeout and API activities are legitimate) |
| **Recommendation** | Build a multi-signal approach: (1) YouTube Data API `activities.list` for public activity signals, (2) `playlistItems.list` for "Liked Videos" as a content preference signal, (3) Optional Google Takeout import for historical analysis, (4) Device-level monitoring partnership for real-time data. Accept that real-time watch history is not achievable via API |

### 9. `lockProfile(profileId) / unlockProfile(profileId)`

| Aspect | Detail |
|---|---|
| **Implementation** | Not possible via YouTube API |
| **API Accessibility Verdict** | Level 0 -- YouTube does not have a profile lock/unlock mechanism accessible to third parties |
| **Approach** | YouTube does not have a concept of "locking" a profile the way Netflix does (PIN-based profile lock). Phosra alternatives for screen time enforcement: (a) Device-level app blocking via Family Link, iOS Screen Time, or Android Digital Wellbeing, (b) DNS-level blocking of youtube.com during restricted hours, (c) Phosra browser extension that blocks YouTube access |
| **API Alternative** | None |
| **Auth Required** | N/A |
| **Data Available** | N/A |
| **Data NOT Available** | Profile lock/unlock capability |
| **Complexity** | Not applicable for YouTube API; Medium for device-level workarounds |
| **Risk Level** | Low for device-level approaches |
| **Recommendation** | Implement via device/OS-level controls rather than YouTube-level controls. Phosra should integrate with Family Link (manually guided) and provide DNS-based blocking for router-level enforcement. Return `UnsupportedOperationError` for direct YouTube profile locking |

### 10. `createKidsProfile(name, maturityLevel)`

| Aspect | Detail |
|---|---|
| **Implementation** | Not possible via API |
| **API Accessibility Verdict** | Level 0 -- No API for creating YouTube Kids profiles or supervised accounts |
| **Approach** | YouTube Kids profiles are created within the YouTube Kids app by the parent. Supervised Google Accounts are created via Family Link. Neither has an API. Phosra alternative: Guided setup wizard that walks parents through creating YouTube Kids profiles and supervised accounts, then syncs the resulting configuration into Phosra |
| **API Alternative** | None |
| **Auth Required** | Parent's Google Account |
| **Data Available** | N/A |
| **Data NOT Available** | Profile creation capability |
| **Complexity** | Not applicable |
| **Risk Level** | Not applicable |
| **Recommendation** | Return `UnsupportedOperationError`. Build an onboarding wizard that guides parents through YouTube Kids / Family Link setup and imports the resulting profile configuration into Phosra manually |

---

## Overall Architecture

### Recommended Architecture Diagram

```
Phosra YouTube Adapter
  |
  +-- OAuth 2.0 Session Manager
  |     +-- Google OAuth consent flow (standard, no credentials stored)
  |     +-- Access + refresh token management
  |     +-- Scopes: youtube.readonly, youtube (subscriptions)
  |     +-- Token refresh on expiry (automatic)
  |
  +-- Content Intelligence Layer (YouTube Data API v3)
  |     +-- search.list with safeSearch (content filtering)
  |     +-- videos.list (metadata, contentRating, madeForKids)
  |     +-- channels.list (channel info, subscriber data)
  |     +-- activities.list (uploads, likes, subscriptions)
  |     +-- playlistItems.list (Liked Videos as signal)
  |     Uses: OAuth tokens or API key, official API, fully legitimate
  |
  +-- Parental Control Guide Layer (NO API -- human-in-the-loop)
  |     +-- Guided Family Link setup wizard
  |     +-- YouTube Kids profile configuration walkthrough
  |     +-- Settings sync (parent reports current config to Phosra)
  |     +-- Change recommendations (Phosra suggests settings, parent applies manually)
  |     Uses: In-app instructions, no automation
  |
  +-- Network Enforcement Layer (DNS)
  |     +-- Restricted Mode via DNS CNAME (restrict.youtube.com)
  |     +-- Time-based DNS blocking (youtube.com blocked during bedtime)
  |     +-- Router-level integration for household enforcement
  |     Uses: DNS configuration, no YouTube API
  |
  +-- Activity Monitor Layer
        +-- YouTube Data API activities for public signals
        +-- Google Takeout import for historical analysis
        +-- Device-level monitoring integration (partnership)
        +-- Content classification engine (Phosra-built)
        No real-time watch history -- API deprecated since 2016
```

### Development Effort Estimate

| Component | Effort | Priority |
|---|---|---|
| OAuth 2.0 integration (Google) | 1-2 days | P0 |
| Content Intelligence Layer (Data API v3) | 3-5 days | P0 |
| Content classification engine (safeSearch + madeForKids + ratings) | 3-4 days | P0 |
| Parental Control Guide wizard (Family Link + YouTube Kids) | 3-5 days | P1 |
| Settings sync UI (parent reports config) | 2-3 days | P1 |
| DNS-level Restricted Mode enforcement | 2-3 days | P1 |
| Google Takeout import pipeline | 2-3 days | P2 |
| Activity monitor (API activities + Liked Videos) | 2-3 days | P2 |
| Device-level monitoring integration | 5-7 days | P2 |
| Testing & hardening | 3-4 days | P1 |
| **Total** | **26-39 days** | |

### Detection Vectors and Mitigations

| Vector | Risk Level | Mitigation |
|---|---|---|
| YouTube Data API quota exhaustion | Medium | Stay within 10,000 units/day default; request increase if needed; cache aggressively |
| OAuth token revocation by user | Low | Handle gracefully; prompt re-authorization |
| Google detects Playwright automation | Critical | **Do NOT use Playwright against Google services.** Google has the most sophisticated bot detection in the industry. Use official API only |
| API policy violation (e.g., excessive writes) | Low | Follow developer policies strictly; no automated actions without user consent |
| Rate limiting on API requests | Low | Implement exponential backoff; respect Retry-After headers |
| DNS-level enforcement bypassed by VPN | Medium | Document limitation; recommend additional device-level controls |

### Terms of Service Summary

**YouTube API Services Terms of Service** (last updated August 28, 2025):

1. **API usage is explicitly permitted** within the terms -- this is fundamentally different from Netflix/Peacock where all automation violates ToS
2. Developers must comply with **YouTube API Developer Policies** including:
   - Obtain user consent for all data access and actions
   - Protect user data; limit storage; provide deletion on request
   - Must not automate actions (views, uploads, comments, likes) without user's express consent
   - Must not share API credentials with third parties
   - Must have a privacy policy
3. **Compliance audits:** YouTube can request an audit of API usage at any time
4. **Access termination:** YouTube can terminate API access for policy violations
5. **No credential storage needed:** OAuth 2.0 means Phosra never sees the user's Google password

**Risk assessment: LOW** for API-based operations. This is a transformative advantage over Netflix (where every operation is a ToS violation) and Peacock (where no public API exists). Phosra should maximize usage of the official YouTube Data API v3 and avoid any browser automation of Google services.
