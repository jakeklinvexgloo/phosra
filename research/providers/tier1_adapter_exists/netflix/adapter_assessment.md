# Netflix Adapter Assessment for Phosra

**Platform:** Netflix
**Assessment Date:** 2026-02-25
**Existing Adapter:** `web/src/lib/platform-research/adapters/netflix.ts`
**Recommended Approach:** Hybrid (Falcor API for reads, Playwright for writes)

---

## Adapter Method Assessment

### 1. `authenticate(credentials) -> Session`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright browser automation |
| **Approach** | Navigate to netflix.com/login, fill email + password, handle profile picker |
| **API Alternative** | Netflix login API exists but has strong bot detection (captcha, device fingerprint) |
| **MFA Handling** | May encounter MFA on new devices — need email/SMS code flow |
| **Session Output** | Extract `NetflixId` + `SecureNetflixId` cookies for API reuse |
| **Complexity** | Medium |
| **Risk Level** | Medium — login automation is the most detectable action |
| **Recommendation** | Use Playwright with stealth mode. Cache session cookies for 7-14 days to minimize login frequency |

### 2. `listProfiles() -> Profile[]`

| Aspect | Detail |
|---|---|
| **Implementation** | Falcor API (preferred) or Playwright |
| **API Endpoint** | `/nq/website/memberapi/release/pathEvaluator` with profile path queries |
| **Data Available** | Profile name, GUID, avatar URL, maturity level, isKids flag, language |
| **Auth Required** | Session cookies only (no MFA) |
| **Complexity** | Low |
| **Risk Level** | Low — read-only API call |
| **Recommendation** | Use Falcor API directly with cached session cookies |

### 3. `getProfileSettings(profileId) -> Settings`

| Aspect | Detail |
|---|---|
| **Implementation** | Falcor API |
| **API Endpoint** | `/api/shakti/*/parentalControls` + `/api/shakti/*/maturityRestrictions` |
| **Data Available** | Maturity level, title restrictions list, profile lock status, autoplay settings |
| **Auth Required** | Session cookies (reads don't require MFA) |
| **Complexity** | Low |
| **Risk Level** | Low — read-only |
| **Recommendation** | API call. Parse Falcor JSON graph response |

### 4. `setContentRestrictions(profileId, maturityLevel)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (required) |
| **Why Not API** | MFA gate — Netflix requires email/SMS/password verification before changes |
| **Flow** | Navigate to parental controls > select profile > complete MFA > change maturity slider > save |
| **MFA Challenge** | Need to handle 3 possible MFA methods (email code, SMS, password re-entry) |
| **Complexity** | High |
| **Risk Level** | Medium — involves MFA automation |
| **Recommendation** | Playwright with MFA code retrieval (either email API integration or user-provided code). Consider storing password for password-based MFA path as simplest option |

### 5. `setTitleRestrictions(profileId, titles[])`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (required) |
| **Why Not API** | Behind same MFA gate as maturity settings |
| **Flow** | Navigate to viewing restrictions > complete MFA > search/add titles to block list > save |
| **Complexity** | High |
| **Risk Level** | Medium |
| **Recommendation** | Playwright. Batch title changes in a single MFA-verified session |

### 6. `setProfilePIN(profileId, pin) / removeProfilePIN(profileId)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright |
| **Flow** | Account settings > Profile Lock > toggle on/off > enter 4-digit PIN |
| **Auth Required** | Password re-entry (not full MFA) |
| **Complexity** | Medium |
| **Risk Level** | Low-Medium |
| **Recommendation** | Playwright with password re-entry handling |

### 7. `supportsNativeScreenTime() -> false`

| Aspect | Detail |
|---|---|
| **Implementation** | Static return |
| **Value** | `false` — Netflix has zero native screen time features |
| **Alternative Enforcement** | Profile lock/unlock as time-based gate (change PIN when limit hit) |
| **Complexity** | None |
| **Risk Level** | None |
| **Recommendation** | Return false. Document screen time enforcement strategy separately |

### 8. `getWatchHistory(profileId) -> WatchEntry[]`

| Aspect | Detail |
|---|---|
| **Implementation** | Falcor API or Playwright scrape |
| **API Endpoint** | `/api/shakti/*/viewingactivity` or Falcor path query |
| **Data Available** | Title name, date watched, series/episode info |
| **Data NOT Available** | Watch duration, exact timestamps, real-time status |
| **Auth Required** | Session cookies + profile switch |
| **Complexity** | Low-Medium |
| **Risk Level** | Low — read-only |
| **Recommendation** | Try API first; fall back to Playwright scrape of viewing activity page |

### 9. `lockProfile(profileId) / unlockProfile(profileId)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright |
| **Approach** | Toggle Profile Lock on/off with a known PIN |
| **Use Case** | Screen time enforcement — lock profile when daily limit reached |
| **Complexity** | Medium |
| **Risk Level** | Medium — changes user's PIN state |
| **Recommendation** | Use cautiously. Store original PIN to restore later. This is the primary screen time enforcement mechanism |

### 10. `createKidsProfile(name, maturityLevel)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright |
| **Flow** | Manage Profiles > Add Profile > toggle Kids > set name > save |
| **Constraint** | Max 5 profiles per account — must check available slots |
| **Complexity** | Medium |
| **Risk Level** | Low — additive action |
| **Recommendation** | Playwright. Verify profile count before attempting |

---

## Overall Risk Assessment

### Terms of Service
- Netflix ToS Section 6 prohibits automated access and scraping
- No public API or partner program for parental control integration
- Risk of account suspension if automation is detected
- **Mitigation:** Stealth mode, human-like timing, minimal request frequency

### Detection Vectors
| Vector | Risk | Mitigation |
|---|---|---|
| Headless browser detection | Medium | Use Playwright stealth plugin (`playwright-extra`) |
| Request frequency | Low | Rate limit to 1 action per 5-10 seconds, cache aggressively |
| Login from new device/IP | Medium | Maintain persistent browser profile/cookies |
| Unusual navigation patterns | Low | Randomize delays, follow natural page flow |
| Multiple rapid setting changes | Medium | Batch changes, add jitter between actions |

### Recommended Architecture

```
Phosra Netflix Adapter
  |
  +-- Session Manager
  |     +-- Login via Playwright (stealth mode)
  |     +-- Cookie extraction & caching (7-14 day TTL)
  |     +-- Re-auth detection & handling
  |
  +-- Read Layer (Falcor API)
  |     +-- listProfiles()
  |     +-- getProfileSettings()
  |     +-- getWatchHistory()
  |     Uses: cached session cookies, no browser needed
  |
  +-- Write Layer (Playwright)
  |     +-- setContentRestrictions()
  |     +-- setTitleRestrictions()
  |     +-- setProfilePIN()
  |     +-- lockProfile() / unlockProfile()
  |     +-- createKidsProfile()
  |     Requires: MFA handling, browser context
  |
  +-- Screen Time Enforcer
        +-- Monitor watch time from history
        +-- Lock profile when daily limit hit
        +-- Unlock profile when new day starts
        No native Netflix support — Phosra-managed
```

### Development Effort Estimate

| Component | Effort | Priority |
|---|---|---|
| Session Manager (login + cookie cache) | 2-3 days | P0 |
| Read Layer (Falcor API integration) | 1-2 days | P0 |
| Write Layer (Playwright + MFA) | 3-5 days | P1 |
| Screen Time Enforcer | 2-3 days | P2 |
| Testing & hardening | 2-3 days | P1 |
| **Total** | **10-16 days** | |
