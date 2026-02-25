# Peacock Adapter Assessment for Phosra

**Platform:** Peacock (NBCUniversal)
**Assessment Date:** 2026-02-25
**Recommended Approach:** Hybrid (GraphQL API for reads, Playwright for writes)

---

## API Accessibility Context

**Critical reality check:** Peacock has **zero API accessibility** for any capability — public or unofficial. This fundamentally shapes every method assessment below.

### The Core Problem

| Barrier | Detail |
|---|---|
| **No public API** | Peacock has never offered a public API. NBCUniversal's developer portal (`developer.nbcuniversal.com`) no longer resolves |
| **No partner program** | No OAuth flow, no delegated access, no API keys, no partner tokens |
| **HMAC-signed requests** | Internal GraphQL APIs require HMAC signatures computed with runtime keys — not just session cookies |
| **Disabled introspection** | GraphQL schema introspection is disabled in production, preventing schema discovery |
| **HMAC key extraction** | Requires runtime key extraction via tools like Frida (dynamic instrumentation) or JavaScript bundle analysis |
| **JWT token lifecycle** | Access tokens expire ~4 hours, refresh tokens ~30 days |
| **Web-only parental controls** | All parental control settings are web-only — not available in mobile apps |

### Third-Party Integration Reality

No parental control app (Bark, Qustodio, Mobicip, Canopy, Safes) has direct Peacock integration. All operate at the device/OS level only — blocking the Peacock app entirely or setting device-level time limits, with zero visibility into Peacock content or settings.

### Implication for Every Method Below

Every adapter method that references "GraphQL API" must be understood with this caveat: accessing the GraphQL API requires either (a) extracting HMAC signing keys from the JavaScript bundle and implementing the signature protocol, or (b) using Playwright to execute requests within an authenticated browser context where the signing happens automatically. Option (b) is significantly more reliable but eliminates the performance advantage of direct API calls.

### ToS & Legal Risk

Peacock ToS explicitly prohibits: automated access (robots/spiders/scrapers), reverse engineering, AI training, and unauthorized infrastructure load. While enforcement against low-volume parental control automation is unlikely, this creates legal exposure that must be acknowledged in Phosra's risk framework.

### Household Sharing Detection Risk

Since November 2024, Peacock monitors IP addresses, geolocation, and device telemetry to enforce household sharing restrictions. Server-side API calls from data center IPs risk triggering anti-sharing detection, potentially resulting in account verification prompts or access blocks. This affects both GraphQL API calls and Playwright sessions originating from non-household IPs.

---

## Adapter Method Assessment

### 1. `authenticate(credentials) -> Session`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright browser automation |
| **Approach** | Navigate to peacocktv.com/signin, fill email + password, handle profile picker |
| **API Alternative** | Direct login API likely exists but undocumented and HMAC-signed; browser approach is the only reliable path |
| **MFA Handling** | No MFA observed during testing — Peacock does not appear to trigger MFA on login |
| **Session Output** | Extract session cookies/tokens for GraphQL API reuse |
| **Complexity** | Medium |
| **Risk Level** | Medium — login automation is always the most detectable action |
| **Recommendation** | Use Playwright with stealth mode. Simpler than Netflix since no MFA challenge expected. Cache session cookies to minimize login frequency |
| **API Accessibility Note** | No public login API. Internal login endpoint requires HMAC-signed requests. Browser automation is the only viable approach. Household sharing detection may flag logins from data center IPs — consider residential proxy or local agent |

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
| **API Accessibility Note** | GraphQL introspection is **disabled in production** — schema is NOT discoverable. Queries must be reverse-engineered from network traffic. HMAC signatures required on all requests. Realistically, Playwright-based reads may be more reliable than direct API calls given the HMAC barrier |

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
| **API Accessibility Note** | Same HMAC barrier as `listProfiles()`. Settings queries require proper HMAC-signed headers. Reads do not require PIN, but the API authentication layer (HMAC + JWT) must be properly implemented |

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
| **API Accessibility Note** | Even if the underlying GraphQL mutation were discovered, it would require HMAC signatures plus additional server-side validation tokens generated by the web UI. Playwright is the only realistic path. ToS explicitly prohibits automated access to these controls |

### 5. `setTitleRestrictions(profileId, titles[])`

| Aspect | Detail |
|---|---|
| **Implementation** | **NOT SUPPORTED** |
| **Reason** | Peacock does not offer per-title blocking functionality |
| **No Workaround** | There is no UI or API mechanism to block specific titles |
| **Complexity** | N/A |
| **Risk Level** | N/A |
| **Recommendation** | Return `UnsupportedOperationError`. Document in Phosra UI that Peacock does not support title-level blocking. Suggest maturity tier adjustment as alternative |
| **API Accessibility Note** | Not an API accessibility issue — this feature simply does not exist at any level (UI, API, or internal). No amount of API access would enable this capability |

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
| **API Accessibility Note** | PIN management is exclusively web-based (not even available in mobile apps). The web UI generates additional validation tokens for PIN operations. Direct API mutation is impractical |

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
| **API Accessibility Note** | HMAC barrier applies to all GraphQL reads. Unlike Netflix, where session cookies alone enable viewing history reads, Peacock requires proper HMAC-signed requests. No unofficial read-only API access has been documented for viewing history — this is worse than Netflix's accessibility for this specific capability |

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
| **API Accessibility Note** | Lock/unlock operations require write access, which means Playwright is mandatory. The account-wide impact combined with no API access makes this a high-friction operation. Household sharing detection may flag rapid setting changes from non-household IPs |

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
| **API Accessibility Note** | Profile creation has no API path. The web UI is the only creation mechanism (mobile apps may also support creation, but not parental control configuration). No authentication gate simplifies automation but also means no API token is needed for this specific action |

---

## Overall Risk Assessment

### Terms of Service & Legal Risk

**ToS risk is the single largest non-technical risk for the Peacock adapter.** Peacock's Terms of Service (Section 4) explicitly prohibit:

| Prohibition | Phosra Violation | Severity |
|---|---|---|
| "Use any robot, spider, scraper, or other automated means" | Playwright automation of parental controls | **High** — directly applicable |
| "Decompile, reverse engineer, or disassemble the software" | HMAC key extraction, GraphQL query reverse-engineering | **High** — directly applicable |
| "Use the Services for training AI or machine learning" | N/A (Phosra does not train models on Peacock data) | None |
| "Impose unreasonable load on infrastructure" | Low-volume API/browser calls | **Low** — Phosra's volume is minimal |
| "Circumvent security-related features" | Automating PIN entry, bypassing web-only restriction | **Medium** — arguable |

- No public API or partner program exists — there is no legitimate API path to take instead
- Risk of account suspension if automation is detected
- No legal precedent for parental control automation being exempt from ToS
- **Mitigation:** Stealth mode, human-like timing, minimal request frequency, user consent for automated account access
- **Strategic consideration:** If KOSA or EU DSA mandates platform interoperability for parental controls, ToS prohibitions may become unenforceable — but this is speculative

### Household Sharing Detection Risk

**Since November 2024, Peacock actively monitors for non-household access.** This is a new and significant risk vector:

| Detection Method | Risk to Phosra | Mitigation |
|---|---|---|
| **IP monitoring** | High — server-side automation from data center IPs will be flagged | Use residential proxy or local agent running on household network |
| **Geolocation tracking** | Medium — Phosra servers are geographically distant from most households | Route traffic through household IP or nearby residential proxy |
| **Device telemetry** | Medium — Playwright browser fingerprint differs from user's real devices | Stealth mode + consistent browser fingerprint across sessions |
| **Session anomalies** | Low-Medium — automated navigation patterns may differ from human patterns | Human-like delays, natural page flow, randomized timing |

**Recommended architecture change:** Consider a local agent model (lightweight process running on the household's network) rather than cloud-based Playwright execution. This eliminates IP-based household detection entirely.

### Bot Detection Vectors

| Vector | Risk | Mitigation |
|---|---|---|
| Headless browser detection | Low-Medium | Use Playwright stealth plugin (`playwright-extra`). Peacock's detection appears less aggressive than Netflix |
| Request frequency | Low | Rate limit to 1 action per 5-10 seconds, cache aggressively |
| Login from new device/IP | Low-Medium | Peacock does not trigger MFA, but household sharing detection may flag new IPs |
| Unusual navigation patterns | Low | Randomize delays, follow natural page flow |
| Multiple rapid setting changes | Low | Batch changes, add jitter between actions |
| GraphQL introspection | N/A | Introspection is disabled in production — not a detection vector because it simply fails |
| HMAC signature mismatch | Medium | If attempting direct API calls, incorrect HMAC signatures will result in 401/403 errors, potentially flagging the account |

### Architecture Notes

Peacock's adapter is **simpler than Netflix's** in several key ways:
1. **No MFA:** PIN-only gate vs Netflix's email/SMS/password MFA
2. **GraphQL:** Standard protocol vs Netflix's proprietary Falcor — better tooling, more predictable responses
3. **No MSL tokens:** Standard session management vs Netflix's Message Security Layer
4. **Less aggressive bot detection:** AWS WAF vs Netflix's custom bot detection
5. **No password for profile creation:** Easier Kids profile setup, but also a security concern

However, Peacock has **unique API accessibility barriers** that Netflix does not:
1. **HMAC-signed requests:** Every API call requires HMAC signatures with runtime keys — Netflix only requires session cookies for reads
2. **Disabled introspection:** Cannot discover GraphQL schema in production — Netflix's Falcor paths can at least be explored
3. **No historical API precedent:** Netflix had a public API from 2008-2014; Peacock has never had one
4. **Zero third-party integration:** No parental control app has ever integrated with Peacock at any level
5. **Household sharing detection:** Server-side access from non-household IPs risks triggering Nov 2024 anti-sharing systems

And Peacock is **more limited** in capabilities:
1. **No per-title blocking:** Cannot implement fine-grained content restrictions
2. **Account-wide maturity:** Non-Kids profiles cannot have individual maturity settings
3. **Web-only controls:** All parental settings must be managed via browser
4. **Weaker viewing history:** No timestamps, no export, limited to Continue Watching

### Recommended Architecture

**Updated to reflect API accessibility constraints:** Given the HMAC signature barrier on all GraphQL requests, the recommended architecture shifts to Playwright-first for all operations, with optional direct API integration if HMAC signing is implemented.

```
Phosra Peacock Adapter
  |
  +-- Session Manager
  |     +-- Login via Playwright (stealth mode)
  |     +-- Cookie/token extraction & caching
  |     +-- Re-auth detection & handling
  |     +-- Household IP management (residential proxy or local agent)
  |     Note: JWT tokens expire ~4hrs, refresh tokens ~30 days
  |
  +-- Read Layer (Playwright-first, optional GraphQL upgrade)
  |     +-- listProfiles()         — Playwright DOM scraping (or GraphQL if HMAC implemented)
  |     +-- getProfileSettings()   — Playwright DOM scraping (or GraphQL if HMAC implemented)
  |     +-- getWatchHistory()      — Playwright DOM scraping (or GraphQL if HMAC implemented)
  |     Default: Playwright reads within authenticated browser context
  |     Upgrade path: Extract HMAC keys from JS bundle for direct GraphQL calls
  |     Note: GraphQL introspection disabled — queries must be reverse-engineered
  |
  +-- Write Layer (Playwright — only viable approach)
  |     +-- setContentRestrictions() [account-wide]
  |     +-- setProfilePIN()
  |     +-- lockProfile() / unlockProfile()
  |     +-- createKidsProfile()
  |     Requires: PIN entry, browser context
  |     Note: No MFA — simpler than Netflix write layer
  |     Risk: ToS explicitly prohibits automated access
  |
  +-- Monitor Layer
  |     +-- Poll Continue Watching for activity
  |     +-- Detect new profile creation (bypass vector)
  |     +-- Alert on unexpected maturity level changes
  |
  +-- Household Detection Mitigation
        +-- Option A: Local agent on household network (eliminates IP risk)
        +-- Option B: Residential proxy routing (reduces IP risk)
        +-- Option C: Cloud execution with consistent fingerprint (highest risk)
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
