# Streaming Provider Parental Controls Research & Phosra API Design
# Covers All 20 Providers in Phosra Dashboard

## Context
We are building Phosra.com, a unified parental controls platform that lets parents define a child profile ONCE (e.g., "Ramsay, age 7, 60 min/day screen time") and push that configuration across all streaming providers — creating kid profiles, setting age restrictions, enforcing cross-platform screen time limits, and locking adult profiles with PINs.

We have a dashboard tracking 20 streaming providers. Some already have adapters built (YouTube, Netflix, Disney+, Hulu). All are currently marked "Not Researched." We need to systematically research every provider and design the APIs to support them all.

## Provider List (All 20 — Organized by Priority Tier)

### Tier 1 — Adapter Exists, Research Ready (have adapters, have Research buttons)
1. **YouTube** — Adapter ✅, Research button active
2. **Netflix** — Adapter ✅, Research button active
3. **Disney+** — Adapter ✅ (no Research button yet)
4. **Hulu** — Adapter ✅, Research button active

### Tier 2 — Major Providers, No Adapter Yet
5. **Max** (HBO Max)
6. **Paramount+**
7. **Peacock**
8. **Apple TV+**
9. **Prime Video**
10. **YouTube TV**

### Tier 3 — Sports & Niche Streaming
11. **ESPN+**
12. **Crunchyroll**
13. **Tubi**
14. **Pluto TV**
15. **Sling TV**
16. **FuboTV**

### Tier 4 — Smaller/Add-On Services
17. **Discovery+**
18. **Starz**
19. **AMC+**
20. **BET+**

## Phase 1: Research Each Provider's Parental Controls

Using Playwright with logged-in browser sessions, systematically document the parental controls for EACH of the 20 providers. Take screenshots and capture network traffic for everything.

### For Each Provider, Document These Categories:

#### A. Profile Management
- Can you create child/kids profiles? How?
- What info does a kid profile require (name, age/birthday, avatar)?
- Max number of profiles allowed?
- Can you designate a profile as "Kids" vs regular?
- Is there a maturity rating system per profile? What are the tiers?
- Can profiles be created/modified programmatically (API calls observed in network tab)?

#### B. Age/Content Restrictions
- What content rating filters exist (TV-Y, TV-G, PG, PG-13, TV-MA, R, etc.)?
- Can you set a max maturity rating per profile?
- Are restrictions customizable per profile or account-wide?
- Is there a "Kids Mode" or "Kids Experience" that changes the UI?
- Can you block specific titles or categories?

#### C. PIN/Lock Protection
- Can you add a PIN to the main/adult profile?
- Can you require a PIN to switch OUT of a kids profile?
- Can you PIN-lock specific content or profiles?
- What's the PIN format (4-digit, alphanumeric, etc.)?
- Is PIN management exposed via any API endpoints?

#### D. Screen Time Controls
- Does the provider offer ANY built-in screen time limits?
- If so, what's the granularity (daily, per-session, per-profile)?
- Are there bedtime/schedule controls?
- Is there a "time's up" notification or hard cutoff?
- Can screen time be managed via their API or only through UI?
- Does the provider have any "Are you still watching?" / idle timeout features?

#### E. Viewing History & Monitoring
- Can parents view watch history per kid profile?
- Are there activity reports or dashboards?
- Can you see what was searched?
- Is watch history accessible via API endpoints?

#### F. API/Technical Recon
- Does the provider have any public or partner API for parental controls?
- Capture ALL API calls made during: profile creation, settings changes, PIN setup, content restriction changes
- Document authentication method (OAuth, session cookies, tokens, API keys)
- Are there any documented developer/partner programs?
- What are the base API URLs and patterns?
- Document request headers, payloads, and response schemas for key endpoints
- Note any rate limiting, CSRF tokens, or anti-automation measures

#### G. Account Structure
- Is it a single account with multiple profiles, or sub-accounts?
- Does the provider support family plans?
- Can parental controls be managed from web, mobile, or both?
- Are settings synced across devices?

### Research Method Per Provider:
1. Open the provider in Playwright with a logged-in session
2. Enable `page.on('request')` and `page.on('response')` listeners to capture ALL network traffic
3. Navigate to: Account Settings → Parental Controls (or equivalent path)
4. Screenshot EVERY screen: profile list, profile creation, edit profile, content restrictions, PIN setup, screen time settings (if any), viewing history
5. Create a test kid profile if one doesn't exist — capture the full flow and all API calls
6. Set content restrictions — capture the API calls
7. Set/change a PIN — capture the API calls
8. Browse as the kid profile to see what the restricted experience looks like — screenshot it
9. Check for any "Family" or "Kids" section in the provider's settings
10. Save HAR file of the entire session
11. Document the exact navigation path to reach each feature (for adapter automation later)

## Phase 2: Gap Analysis Matrix

Create a detailed comparison matrix across all 20 providers. Use this exact structure:

### Feature Matrix (gap_analysis.csv)

| Capability | YouTube | Netflix | Disney+ | Hulu | Max | Paramount+ | Peacock | Apple TV+ | Prime Video | YouTube TV | ESPN+ | Crunchyroll | Tubi | Pluto TV | Sling TV | FuboTV | Discovery+ | Starz | AMC+ | BET+ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **PROFILES** | | | | | | | | | | | | | | | | | | | | |
| Kids Profile Creation | | | | | | | | | | | | | | | | | | | | |
| Max Profiles Allowed | | | | | | | | | | | | | | | | | | | | |
| Age/Birthday on Profile | | | | | | | | | | | | | | | | | | | | |
| Custom Avatar | | | | | | | | | | | | | | | | | | | | |
| Dedicated Kids UI | | | | | | | | | | | | | | | | | | | | |
| **CONTENT RESTRICTIONS** | | | | | | | | | | | | | | | | | | | | |
| Rating-Based Filter | | | | | | | | | | | | | | | | | | | | |
| Per-Profile Ratings | | | | | | | | | | | | | | | | | | | | |
| Title-Level Blocking | | | | | | | | | | | | | | | | | | | | |
| Category Blocking | | | | | | | | | | | | | | | | | | | | |
| **PIN/LOCK** | | | | | | | | | | | | | | | | | | | | |
| PIN on Adult Profile | | | | | | | | | | | | | | | | | | | | |
| PIN to Exit Kids Profile | | | | | | | | | | | | | | | | | | | | |
| PIN on Specific Content | | | | | | | | | | | | | | | | | | | | |
| **SCREEN TIME** | | | | | | | | | | | | | | | | | | | | |
| Built-in Time Limits | | | | | | | | | | | | | | | | | | | | |
| Per-Profile Time Limits | | | | | | | | | | | | | | | | | | | | |
| Schedule/Bedtime | | | | | | | | | | | | | | | | | | | | |
| Hard Cutoff vs Warning | | | | | | | | | | | | | | | | | | | | |
| **MONITORING** | | | | | | | | | | | | | | | | | | | | |
| Watch History per Profile | | | | | | | | | | | | | | | | | | | | |
| Search History | | | | | | | | | | | | | | | | | | | | |
| Activity Reports | | | | | | | | | | | | | | | | | | | | |
| **TECHNICAL** | | | | | | | | | | | | | | | | | | | | |
| Public/Partner API | | | | | | | | | | | | | | | | | | | | |
| Usable Internal APIs Found | | | | | | | | | | | | | | | | | | | | |
| Auth Method | | | | | | | | | | | | | | | | | | | | |
| Anti-Automation Measures | | | | | | | | | | | | | | | | | | | | |
| Web-Based Settings | | | | | | | | | | | | | | | | | | | | |
| **PHOSRA ADAPTER** | | | | | | | | | | | | | | | | | | | | |
| Adapter Status | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Automation Feasibility | | | | | | | | | | | | | | | | | | | | |

### Gap Summary Document (gap_analysis.md)
- **Universal gaps**: Features NO provider offers (likely: cross-platform screen time, unified profiles)
- **Common gaps**: Features most providers lack (likely: screen time limits, API access)
- **Provider-specific strengths**: Which providers are most parent-friendly?
- **Provider-specific weaknesses**: Which providers have zero parental controls?
- **Phosra value-add by provider**: What does Phosra bring to each one?
- **Provider difficulty ranking**: Easiest to hardest to automate/integrate

## Phase 3: Phosra API Design

### Layer 1: Phosra Core APIs
```yaml
# Family & Child Management
POST   /api/v1/families
POST   /api/v1/families/{familyId}/members
GET    /api/v1/families/{familyId}/members
PUT    /api/v1/members/{memberId}
DELETE /api/v1/members/{memberId}

# Policy Engine — The Core of Phosra
POST   /api/v1/children/{childId}/policies
PUT    /api/v1/children/{childId}/policies/{policyId}
GET    /api/v1/children/{childId}/policies
DELETE /api/v1/children/{childId}/policies/{policyId}

# Provider Connections
POST   /api/v1/families/{familyId}/providers
GET    /api/v1/families/{familyId}/providers
DELETE /api/v1/families/{familyId}/providers/{connectionId}
POST   /api/v1/families/{familyId}/providers/{connectionId}/sync
GET    /api/v1/families/{familyId}/providers/{connectionId}/status

# Screen Time Tracking (real-time)
POST   /api/v1/screentime/heartbeat
GET    /api/v1/children/{childId}/screentime/today
POST   /api/v1/children/{childId}/screentime/check
GET    /api/v1/children/{childId}/screentime/history?range=7d

# Enforcement Actions
POST   /api/v1/enforcement/lock-profile
POST   /api/v1/enforcement/unlock-profile
POST   /api/v1/enforcement/parent-override

# Monitoring & Alerts
GET    /api/v1/children/{childId}/activity
GET    /api/v1/children/{childId}/reports/daily
GET    /api/v1/children/{childId}/reports/weekly
POST   /api/v1/parents/{parentId}/notification-preferences
GET    /api/v1/parents/{parentId}/notifications

# Bulk Operations (the key Phosra value prop)
POST   /api/v1/children/{childId}/push-everywhere
```

### Layer 2: Provider Adapter Interface

Each provider adapter must implement this standard interface:
```yaml
interface ProviderAdapter {
  authenticate(credentials): Promise<AuthSession>
  refreshAuth(session): Promise<AuthSession>
  checkAuthHealth(): Promise<{ valid: boolean, expires_at: string }>
  listProfiles(): Promise<Profile[]>
  createKidsProfile(config: KidsProfileConfig): Promise<Profile>
  updateProfile(profileId, config): Promise<Profile>
  deleteProfile(profileId): Promise<void>
  switchToProfile(profileId): Promise<void>
  getContentRestrictions(profileId): Promise<Restrictions>
  setContentRestrictions(profileId, restrictions): Promise<Restrictions>
  getAvailableRatings(): Promise<Rating[]>
  setProfilePIN(profileId, pin): Promise<void>
  removeProfilePIN(profileId): Promise<void>
  setPINRequiredForProfile(profileId, required: boolean): Promise<void>
  supportsScreenTime(): boolean
  getScreenTimeSettings(profileId): Promise<ScreenTimeConfig | null>
  setScreenTimeLimit(profileId, config): Promise<void>
  getWatchHistory(profileId, dateRange): Promise<WatchEvent[]>
  getSearchHistory(profileId, dateRange): Promise<SearchEvent[]>
  lockProfile(profileId): Promise<void>
  unlockProfile(profileId): Promise<void>
  isProfileActive(profileId): Promise<boolean>
  getCapabilities(): Promise<AdapterCapabilities>
}
```

### Layer 3: Enforcement Strategy Per Provider

| Strategy | How It Works | Pros | Cons |
|---|---|---|---|
| **API-Based** | Use discovered internal APIs to lock/restrict profiles | Fastest, most reliable | Few providers expose this |
| **Playwright Automation** | Automate the browser to change settings when limits are hit | Works for any provider with web settings | Slow, fragile, detectable |
| **Browser Extension** | Phosra extension intercepts playback, enforces limits client-side | Works everywhere, real-time | Requires install, bypassable |
| **DNS/Router Block** | Block provider domains at network level when limit hit | Hard to bypass | Blunt (blocks entire provider for everyone) |
| **Device-Level (OS)** | Use iOS Screen Time / Android Family Link APIs alongside Phosra | Robust, hard to bypass | Platform-dependent, separate integration |
| **Hybrid** | Extension for tracking + Playwright for profile management | Best coverage | Most complex |

## Phase 4: Provider-Specific Notes

### Providers That Are Likely Ad-Supported/Free (Different Parental Control Models):
- **Tubi** — Free, ad-supported. May have minimal parental controls.
- **Pluto TV** — Free, live TV style. Likely minimal profile support.
- **YouTube** (free tier) — YouTube Kids is separate app; research both.

### Providers That Are Add-Ons/Bundles:
- **ESPN+** — Often bundled with Disney+. Check if parental controls are shared.
- **Discovery+** — Now merged with Max in some markets. Research current state.
- **BET+** — Paramount+ add-on. Check if controls are inherited.
- **Starz** — Available standalone and as add-on. Research both paths.
- **AMC+** — Similar add-on model.

### Providers With Known Unique Features:
- **YouTube / YouTube TV** — Google Family Link integration, Supervised accounts
- **Apple TV+** — Apple Screen Time integration, Family Sharing
- **Prime Video** — Amazon Kids+ / Amazon Household, FreeTime
- **Netflix** — Most mature parental controls in the industry (likely the gold standard)
- **Disney+** — Junior/Kids profiles, Disney-specific content ratings

### Sports-Focused Providers (Unique Challenges):
- **ESPN+** — Live sports content; screen time during live events is tricky
- **FuboTV** — Live TV; similar live content challenges
- **Sling TV** — Live TV channels; may not have profile-level controls
- **YouTube TV** — Live TV; limited kid profile support expected

### Anime/Niche:
- **Crunchyroll** — Anime-specific; may have mature content filters but research their rating system (it may differ from standard TV ratings)

## Phase 5: Output Structure
```
/research/
  /providers/
    /tier1_adapter_exists/
      /youtube/
      /netflix/
      /disney_plus/
      /hulu/
    /tier2_major/
      /max/
      /paramount_plus/
      /peacock/
      /apple_tv_plus/
      /prime_video/
      /youtube_tv/
    /tier3_sports_niche/
      /espn_plus/
      /crunchyroll/
      /tubi/
      /pluto_tv/
      /sling_tv/
      /fubotv/
    /tier4_addon/
      /discovery_plus/
      /starz/
      /amc_plus/
      /bet_plus/

  # Analysis & Design Docs
  gap_analysis.csv
  gap_analysis.md
  phosra_api_spec.yaml
  adapter_interface.ts
  enforcement_strategies.md
  rating_systems_mapping.md
  roadmap.md
  executive_summary.md
  risk_assessment.md
```

## Key Question to Answer for Each Provider

> "If a parent says: 'Ramsay is 7, give him 60 minutes a day, nothing above PG, PIN-lock the adult profile' — what exactly would we need to do on this provider, what CAN we do today, and what's impossible?"

Document the answer to this question for all 20 providers.
