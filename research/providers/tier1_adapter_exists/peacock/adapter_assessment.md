# Peacock Adapter Assessment for Phosra

**Platform:** Peacock (NBCUniversal)
**Assessment Date:** 2026-02-25
**Recommended Approach:** Hybrid (GraphQL API for reads, Playwright for writes)

---

## Adapter Method Assessment

### 1. `authenticate(credentials) -> Session`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright browser automation |
| **Approach** | Navigate to peacocktv.com/signin, fill email + password, handle profile picker |
| **API Alternative** | Direct login API likely exists but undocumented; browser approach is safer |
| **MFA Handling** | No MFA observed during testing — Peacock does not appear to trigger MFA on login |
| **Session Output** | Extract session cookies/tokens for GraphQL API reuse |
| **Complexity** | Medium |
| **Risk Level** | Medium — login automation is always the most detectable action |
| **Recommendation** | Use Playwright with stealth mode. Simpler than Netflix since no MFA challenge expected. Cache session cookies to minimize login frequency |

### 2. `listProfiles() -> Profile[]`

| Aspect | Detail |
|---|---|
| **Implementation** | GraphQL API (preferred) or Playwright |
| **API Endpoint** | AppSync GraphQL endpoint with profile query |
| **Data Available** | Profile name, ID, avatar, isKids flag, creation date |
| **Auth Required** | Session cookies/tokens only |
| **Complexity** | Low |
| **Risk Level** | Low — read-only API call |
| **Recommendation** | Use GraphQL API directly with cached session tokens. Schema may be discoverable via introspection |

### 3. `getProfileSettings(profileId) -> Settings`

| Aspect | Detail |
|---|---|
| **Implementation** | GraphQL API |
| **API Endpoint** | AppSync GraphQL endpoint with settings query |
| **Data Available** | Maturity level (account-wide), Kids profile status, PIN status |
| **Auth Required** | Session cookies/tokens (reads do not require PIN) |
| **Complexity** | Low |
| **Risk Level** | Low — read-only |
| **Recommendation** | API call. Note: maturity settings are account-wide for non-Kids profiles, so this returns the same restriction level for all Standard profiles |

### 4. `setContentRestrictions(profileId, maturityLevel)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (required — web-only controls) |
| **Why Not API** | Parental control settings are only exposed in the web UI, not in the mobile app. Direct API endpoint for writes is undocumented |
| **Flow** | Navigate to account settings > parental controls > enter PIN > change maturity level > save |
| **PIN Challenge** | Must enter 4-digit PIN before changes (simpler than Netflix's MFA) |
| **Account-Wide Impact** | Changing maturity level affects ALL non-Kids profiles (cannot set per-profile) |
| **Complexity** | High |
| **Risk Level** | Medium — changes affect all profiles on the account |
| **Recommendation** | Playwright with PIN entry. Warn Phosra users that changes are account-wide. For per-child restrictions, recommend using Kids profiles instead |

### 5. `setTitleRestrictions(profileId, titles[])`

| Aspect | Detail |
|---|---|
| **Implementation** | **NOT SUPPORTED** |
| **Reason** | Peacock does not offer per-title blocking functionality |
| **No Workaround** | There is no UI or API mechanism to block specific titles |
| **Complexity** | N/A |
| **Risk Level** | N/A |
| **Recommendation** | Return `UnsupportedOperationError`. Document in Phosra UI that Peacock does not support title-level blocking. Suggest maturity tier adjustment as alternative |

### 6. `setProfilePIN(pin) / removeProfilePIN()`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright |
| **Flow** | Account settings > parental controls > set/change 4-digit PIN |
| **Auth Required** | Current PIN (if one exists) or account password for initial setup |
| **Scope** | Account-wide PIN (single PIN for entire account, not per-profile) |
| **Complexity** | Medium |
| **Risk Level** | Low-Medium |
| **Recommendation** | Playwright with current PIN/password handling. Note that Peacock uses a single account-wide PIN, unlike Netflix's per-profile PINs |

### 7. `supportsNativeScreenTime() -> false`

| Aspect | Detail |
|---|---|
| **Implementation** | Static return |
| **Value** | `false` — Peacock has zero native screen time features |
| **Alternative Enforcement** | Device-level controls or Phosra-managed PIN changes to gate access |
| **Complexity** | None |
| **Risk Level** | None |
| **Recommendation** | Return false. Screen time enforcement must be fully Phosra-managed or deferred to device-level controls |

### 8. `getWatchHistory(profileId) -> WatchEntry[]`

| Aspect | Detail |
|---|---|
| **Implementation** | GraphQL API (Continue Watching data) |
| **API Endpoint** | AppSync GraphQL query for Continue Watching rail per profile |
| **Data Available** | Title name, series/episode info, watch progress position |
| **Data NOT Available** | Exact timestamps, watch duration, historical viewing log |
| **Auth Required** | Session cookies/tokens + profile context |
| **Complexity** | Low-Medium |
| **Risk Level** | Low — read-only |
| **Recommendation** | Use GraphQL API. Note that Peacock's history is primarily Continue Watching rather than a full viewing log, so data will be less comprehensive than Netflix's viewing activity export |

### 9. `lockProfile(profileId) / unlockProfile(profileId)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright |
| **Approach** | Change the account-wide PIN to lock out content access, or modify maturity level to restrict content |
| **Use Case** | Screen time enforcement — change PIN or lower maturity tier when daily limit reached |
| **Account-Wide Impact** | Locking via PIN change affects all profiles, not just the target child |
| **Complexity** | Medium |
| **Risk Level** | Medium — account-wide impact makes this a blunt instrument |
| **Recommendation** | Use maturity level change (lower to "Little Kids") as profile-level lockout for Kids profiles. For non-Kids profiles, PIN change is the only mechanism. Document account-wide side effects |

### 10. `createKidsProfile(name, maturityLevel)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright |
| **Flow** | Profile picker > Add Profile > set name, avatar, toggle Kids > save |
| **Constraint** | Max 6 profiles per account — must check available slots |
| **Auth Required** | None — profile creation does NOT require account password or PIN |
| **Security Note** | Easier than Netflix since no password/PIN gate, but this same gap means children can also create profiles |
| **Complexity** | Medium |
| **Risk Level** | Low — additive action, no authentication barrier |
| **Recommendation** | Playwright. Verify profile count before attempting. Consider immediately setting up PIN protection after creating the profile to prevent the child from creating additional non-Kids profiles |

---

## Overall Risk Assessment

### Terms of Service
- Peacock ToS prohibits automated access and scraping (standard streaming platform language)
- No public API or partner program for parental control integration
- Risk of account suspension if automation is detected
- **Mitigation:** Stealth mode, human-like timing, minimal request frequency

### Detection Vectors

| Vector | Risk | Mitigation |
|---|---|---|
| Headless browser detection | Low-Medium | Use Playwright stealth plugin (`playwright-extra`). Peacock's detection appears less aggressive than Netflix |
| Request frequency | Low | Rate limit to 1 action per 5-10 seconds, cache aggressively |
| Login from new device/IP | Low | Peacock does not appear to trigger MFA on new devices |
| Unusual navigation patterns | Low | Randomize delays, follow natural page flow |
| Multiple rapid setting changes | Low | Batch changes, add jitter between actions |
| GraphQL introspection | Low | Use captured queries only, avoid schema introspection in production |

### Architecture Notes

Peacock's adapter is **simpler than Netflix's** in several key ways:
1. **No MFA:** PIN-only gate vs Netflix's email/SMS/password MFA
2. **GraphQL:** Standard protocol vs Netflix's proprietary Falcor — better tooling, more predictable responses
3. **No MSL tokens:** Standard session management vs Netflix's Message Security Layer
4. **Less aggressive detection:** AWS WAF vs Netflix's custom bot detection
5. **No password for profile creation:** Easier Kids profile setup, but also a security concern

However, Peacock is **more limited** in capabilities:
1. **No per-title blocking:** Cannot implement fine-grained content restrictions
2. **Account-wide maturity:** Non-Kids profiles cannot have individual maturity settings
3. **Web-only controls:** All parental settings must be managed via browser
4. **Weaker viewing history:** No timestamps, no export, limited to Continue Watching

### Recommended Architecture

```
Phosra Peacock Adapter
  |
  +-- Session Manager
  |     +-- Login via Playwright (stealth mode)
  |     +-- Cookie/token extraction & caching
  |     +-- Re-auth detection & handling
  |
  +-- Read Layer (GraphQL API)
  |     +-- listProfiles()
  |     +-- getProfileSettings()
  |     +-- getWatchHistory()
  |     Uses: cached session tokens, no browser needed
  |
  +-- Write Layer (Playwright)
  |     +-- setContentRestrictions() [account-wide]
  |     +-- setProfilePIN()
  |     +-- lockProfile() / unlockProfile()
  |     +-- createKidsProfile()
  |     Requires: PIN entry, browser context
  |     Note: No MFA — simpler than Netflix write layer
  |
  +-- Monitor Layer
        +-- Poll Continue Watching for activity
        +-- Detect new profile creation (bypass vector)
        +-- Alert on unexpected maturity level changes
```

### Development Effort Estimate

| Component | Effort | Priority |
|---|---|---|
| Session Manager (login + cookie cache) | 1-2 days | P0 |
| Read Layer (GraphQL API integration) | 1-2 days | P0 |
| Write Layer (Playwright + PIN) | 2-3 days | P1 |
| Profile creation monitor | 1 day | P1 |
| Testing & hardening | 2-3 days | P1 |
| **Total** | **7-11 days** | |

### Comparison to Netflix Adapter Effort

| Aspect | Netflix | Peacock |
|---|---|---|
| Total effort | 10-16 days | 7-11 days |
| MFA handling | 3 methods, complex | PIN only, simple |
| API protocol | Falcor (proprietary) | GraphQL (standard) |
| Write complexity | High (MFA + per-profile) | Medium (PIN + account-wide) |
| Feature coverage | Higher (title blocks, per-profile) | Lower (no title blocks, account-wide) |
