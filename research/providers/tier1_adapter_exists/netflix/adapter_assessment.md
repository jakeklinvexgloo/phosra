# Netflix Adapter Assessment for Phosra

**Platform:** Netflix
**Assessment Date:** 2026-02-25
**Existing Adapter:** `web/src/lib/platform-research/adapters/netflix.ts`
**Recommended Approach:** Hybrid (Falcor API for reads, Playwright for writes)

---

## API Accessibility Context

**Before evaluating individual adapter methods, it is critical to understand the API landscape reality:**

Netflix shut down its public API in **November 2014**. There is no public API, no partner program for parental control apps, no OAuth flow, and no delegated access mechanism of any kind. Every integration method described below operates against **undocumented internal APIs** (Shakti/Falcor) or via **browser automation** (Playwright), both of which violate Netflix ToS Section 4.6.

### What This Means for Each Method

| Access Pattern | API Accessibility | Stability | ToS Status |
|---|---|---|---|
| **Read via Falcor/Shakti** | Unofficial internal API, session cookie auth | Fragile — Netflix migrated mobile to federated GraphQL in 2022; web migration anticipated | Violation of Section 4.6 (automated means, scraping) |
| **Write via Playwright** | No API exists (even unofficially) — browser automation required | Breaks whenever Netflix changes UI/DOM structure | Violation of Section 4.6 (robots, automated means) |
| **Authentication** | No OAuth/token flow — must use credential-based browser login | Subject to captcha, device fingerprinting, MFA challenges | Violation of Section 4.6 |

### Industry Benchmark

No parental control app (Bark, Qustodio, Net Nanny, Canopy, Mobicip, FamiSafe) integrates with Netflix APIs. All operate at the device/OS level only (app blocking, time limits). Phosra's proposed approach of direct Netflix integration is **unprecedented** and carries risk that no competitor has accepted.

### Unofficial API Details

- **Shakti/Falcor:** Netflix's internal web API. Undocumented, unstable. The Shakti build version changes with every Netflix deployment. The CastagnaIT Kodi plugin (the most sophisticated community integration effort) had development **suspended** due to Netflix repeatedly breaking compatibility
- **node-netflix2 (npm):** Unmaintained since ~2019-2020. Non-functional
- **GraphQL migration:** Netflix moved mobile clients to federated GraphQL in 2022. When this migration reaches the web app, all Falcor-based integrations will break simultaneously

---

## Adapter Method Assessment

### 1. `authenticate(credentials) -> Session`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright browser automation |
| **Approach** | Navigate to netflix.com/login, fill email + password, handle profile picker |
| **API Alternative** | Netflix login API exists but has strong bot detection (captcha, device fingerprint) |
| **API Accessibility** | **None** — No OAuth, no token exchange, no delegated auth. Credential-based browser login is the only option |
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
| **API Accessibility** | **Unofficial read-only** — Falcor internal API with session cookie auth. Fragile, subject to breakage on Netflix deployments |
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
| **API Accessibility** | **Unofficial read-only** — Shakti internal API. The `*` in the path is a build version that changes with every Netflix deployment |
| **Data Available** | Maturity level, title restrictions list, profile lock status, autoplay settings |
| **Auth Required** | Session cookies (reads don't require MFA) |
| **Complexity** | Low |
| **Risk Level** | Low — read-only |
| **Recommendation** | API call. Parse Falcor JSON graph response |

### 4. `setContentRestrictions(profileId, maturityLevel)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (required) |
| **API Accessibility** | **None** — No write endpoint exists, even unofficially. Browser automation is the only path |
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
| **API Accessibility** | **None** — No write endpoint exists, even unofficially. Browser automation is the only path |
| **Why Not API** | Behind same MFA gate as maturity settings |
| **Flow** | Navigate to viewing restrictions > complete MFA > search/add titles to block list > save |
| **Complexity** | High |
| **Risk Level** | Medium |
| **Recommendation** | Playwright. Batch title changes in a single MFA-verified session |

### 6. `setProfilePIN(profileId, pin) / removeProfilePIN(profileId)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright |
| **API Accessibility** | **None** — No write endpoint exists, even unofficially. Browser automation is the only path |
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
| **API Accessibility** | **Unofficial read-only** — This is the one capability with the most evidence of working via Shakti, but it remains fragile and a ToS violation |
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
| **API Accessibility** | **None** — No write endpoint exists, even unofficially. Browser automation is the only path |
| **Approach** | Toggle Profile Lock on/off with a known PIN |
| **Use Case** | Screen time enforcement — lock profile when daily limit reached |
| **Complexity** | Medium |
| **Risk Level** | Medium — changes user's PIN state |
| **Recommendation** | Use cautiously. Store original PIN to restore later. This is the primary screen time enforcement mechanism |

### 10. `createKidsProfile(name, maturityLevel)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright |
| **API Accessibility** | **None** — No known API endpoint exists for profile creation/deletion, even in the unofficial Shakti/Falcor surface. Browser automation is the only path |
| **Flow** | Manage Profiles > Add Profile > toggle Kids > set name > save |
| **Constraint** | Max 5 profiles per account — must check available slots |
| **Complexity** | Medium |
| **Risk Level** | Low — additive action |
| **Recommendation** | Playwright. Verify profile count before attempting |

---

## Overall Risk Assessment

### Terms of Service & Legal Risk

**This is the single greatest risk to the Netflix adapter and must be weighed carefully.**

Netflix Terms of Use **Section 4.6** explicitly prohibits:
- Use of **robots, spiders, scrapers**, or other automated means to access the service
- **Reverse engineering**, decompiling, or disassembling Netflix software
- Access via any **automated means** (including scripts or web crawlers)
- Use of **machine learning tools** against Netflix content or infrastructure

**Risk severity: HIGH.** Unlike platforms where ToS violations are theoretical concerns, Netflix actively invests in bot detection and has a history of terminating accounts and blocking integrations (e.g., the CastagnaIT Kodi plugin). Key considerations:

1. **Account suspension** — Netflix can and does suspend accounts flagged for automated access. This would disrupt the family's Netflix service entirely, not just Phosra's integration
2. **No safe harbor** — There is no "approved" pathway for child safety tool integration. No partner program, no API, no exemption
3. **Legal exposure** — Depending on jurisdiction, circumventing access controls may implicate CFAA (US) or Computer Misuse Act (UK) provisions, though enforcement against parental control tools is unlikely
4. **Reputational risk** — If Netflix publicly objects to Phosra's approach, it could damage trust with users and partners
5. **Industry precedent** — No parental control company (Bark, Qustodio, Net Nanny, Canopy, Mobicip, FamiSafe) has attempted direct Netflix API integration. All operate at device/OS level only. Phosra would be first, carrying all first-mover risk

**Mitigations:**
- Stealth mode, human-like timing, minimal request frequency
- Prominent user consent and disclosure that Phosra accesses Netflix on their behalf
- Monitor legislative developments (KOSA, EU DSA, UK Online Safety Act) that may force Netflix to open APIs
- Maintain device-level fallback strategy so Phosra retains value if Netflix blocks the integration

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
