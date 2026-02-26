# Phosra Platform Research Framework

**Version:** 1.0
**Created:** 2026-02-25
**Status:** THE standard for all platform research

This document defines the authoritative methodology, templates, and scoring systems for researching any streaming, social, or gaming platform that Phosra may integrate with. It encodes **API accessibility as a first-class concern** — every research effort must systematically assess not just what parental controls exist, but whether third-party software like Phosra can actually reach them.

All platform research MUST follow this framework. Research that does not cover every section is considered incomplete.

---

## Table of Contents

1. [Research Methodology Template](#1-research-methodology-template)
2. [API Accessibility Assessment Framework](#2-api-accessibility-assessment-framework)
3. [Adapter Assessment Template](#3-adapter-assessment-template)
4. [Integration Notes Template](#4-integration-notes-template)
5. [Scoring System](#5-scoring-system)
6. [File Structure Convention](#6-file-structure-convention)
7. [Examples & Reference](#7-examples--reference)

---

## 1. Research Methodology Template

Every platform research report (`findings.md`) MUST cover these eight sections in order. The eighth section — API Accessibility & Third-Party Integration — is the key addition that elevates Phosra research above generic feature inventories.

### Section 1: Profile Management

Document the platform's profile system, which is the fundamental unit of parental control.

**Required information:**
- Maximum number of profiles per account
- Profile types available (Standard, Kids, Admin/Account Holder, etc.)
- Profile creation flow and authentication requirements
  - Can any profile create new profiles? (security gap if yes — see Peacock)
  - Is account password or PIN required to create profiles?
- Per-profile settings list (display name, avatar, language, maturity, etc.)
- Kids profile behavior (restricted UI, content catalog, settings access)
- Avatar/customization system

**Key question:** Is profile creation gated behind authentication, or can a child create an unrestricted profile to bypass controls?

**Examples:**
- Netflix: 5 profiles max, Standard + Kids types, profile creation from account owner
- Peacock: 6 profiles max, Account Holder + Standard + Kids types, **unprotected profile creation** (security gap — any user can create non-Kids profiles without authentication)

### Section 2: Content Restrictions

Document all content filtering mechanisms the platform offers.

**Required information:**
- Maturity rating tier system (table format with tier name, MPAA ratings, TV ratings, description, age range)
- Phosra rating system mapping (MPAA, TV Parental Guidelines, ESRB, PEGI, Common Sense Media)
- Per-title blocking capability (yes/no, and if yes, the flow)
- Content descriptor filtering (violence, language, nudity — independent of overall maturity tier)
- Scope of restrictions (per-profile vs account-wide)
- Content filtering limitations

**Key question:** Can restrictions be set per-profile, or are they account-wide? Account-wide restrictions are a blunt instrument that affects all family members equally.

**Examples:**
- Netflix: 4 maturity tiers, per-profile maturity, per-profile title blocking (behind MFA)
- Peacock: 5 maturity tiers, account-wide maturity for non-Kids profiles, **no per-title blocking**

### Section 3: PIN / Lock Protection

Document all PIN, password, and lock mechanisms that protect parental controls from tampering.

**Required information:**
- PIN type (numeric digits, alphanumeric, biometric)
- PIN scope (per-profile vs account-wide)
- What the PIN protects (settings changes, content access, profile switching)
- PIN setup platforms (web, mobile app, TV app — note any platform gaps)
- MFA presence and methods (email, SMS, password re-entry, authenticator app)
- Reset/recovery flow

**Key question:** How hard is it for a child to bypass the PIN/lock? Is there MFA, or just a simple 4-digit PIN?

**Examples:**
- Netflix: 4-digit per-profile PIN + MFA gate (email/SMS/password) for control changes
- Peacock: 4-digit account-wide PIN, no MFA, web-only setup

### Section 4: Screen Time Controls

Document native screen time management features. Most streaming platforms have NONE, but this must be explicitly documented.

**Required information:**
- Native daily/weekly time limits (yes/no)
- Scheduling/bedtime features (yes/no)
- Usage reports or dashboards (yes/no)
- Session duration alerts (yes/no)
- Autoplay controls (relevant to passive binge-watching)
- Workaround strategies for Phosra if native support is absent

**Key question:** Does the platform offer ANY native mechanism for time-based control, or must Phosra enforce this entirely through external means?

**Examples:**
- Netflix: No native screen time. Autoplay toggle exists. Phosra workaround: profile lock/unlock via PIN change.
- Peacock: No native screen time. No autoplay toggle. Phosra workaround: device-level controls or PIN/maturity changes.

### Section 5: Viewing History & Monitoring

Document what parental visibility the platform provides into a child's activity.

**Required information:**
- Viewing history availability and location
- Data fields available (title, date, time, duration, episode/season, progress)
- Data fields NOT available (explicitly list gaps)
- Export capabilities (CSV, API, none)
- Per-profile vs cross-profile visibility
- Real-time "currently watching" indicators
- History deletion/hiding capabilities (can the child cover their tracks?)

**Key question:** Can Phosra build meaningful parental reports from the data this platform exposes, or is the data too sparse?

**Examples:**
- Netflix: Per-profile viewing activity with title + date, CSV export, no duration data
- Peacock: Per-profile Continue Watching only, no timestamps, no export, no historical log

### Section 6: API / Technical Architecture

Document the platform's technical infrastructure from an integration perspective.

**Required information:**
- Primary API protocol (REST, GraphQL, proprietary — e.g., Netflix Falcor)
- Key API endpoints discovered (table: endpoint, purpose, auth required)
- Authentication mechanism (session cookies, JWT, OAuth tokens, API keys, MSL tokens)
- Required headers (CSRF tokens, profile context headers, custom headers)
- Rate limiting and detection observations
- Infrastructure (AWS, GCP, custom — relevant for detection patterns)
- Mobile app architecture (native vs cross-platform — relevant for mobile automation)
- Session duration and re-authentication frequency

**Key question:** Can Phosra interact with this platform's APIs directly (using cached session tokens), or must every interaction go through a full browser?

**Examples:**
- Netflix: Custom Falcor protocol via single pathEvaluator endpoint. Session cookies + MSL tokens. Aggressive bot detection.
- Peacock: Standard GraphQL via AWS AppSync. Session cookies/tokens. Standard AWS WAF detection.

### Section 7: Account Structure & Integration Points

Document the account hierarchy and identify where Phosra hooks in.

**Required information:**
- Account hierarchy diagram (text tree format)
- Subscription tiers and feature differences relevant to parental controls
- Sharing/household model (family plans, extra members, stream limits)
- Key integration points for Phosra (numbered list)

**Key question:** What is the mapping from "Phosra child" to "platform entity"? Is it a 1:1 profile mapping, or something more complex?

**Examples:**
- Netflix: Account > Profiles (1:1 child-to-profile mapping). No family plan. 2-4 streams by tier.
- Peacock: Account > Profiles (1:1 mapping). No family plan. 1-3 streams by tier. Account-wide settings complicate per-child enforcement.

### Section 8: API Accessibility & Third-Party Integration (NEW)

This is the section that distinguishes Phosra research from generic feature documentation. It answers the fundamental question: **Can Phosra actually control this platform programmatically, and if so, how?**

This section is covered in full detail in [Section 2 of this framework](#2-api-accessibility-assessment-framework) below. In the `findings.md` file, include a summary with:

- API Accessibility Score (Level 0-5, see [Scoring System](#5-scoring-system))
- Per-Capability Accessibility Matrix (abbreviated)
- Third-party integration reality check
- Legal/ToS risk summary
- Overall Phosra Enforcement Level verdict

**Key question:** What is the highest-fidelity integration Phosra can achieve with this platform without getting blocked or violating ToS in ways that risk account suspension?

**Examples:**
- Netflix: Level 1 (Unofficial Read-Only). Falcor/Shakti APIs for reads. Playwright for writes. No public API or partner program. ToS prohibits automation. Phosra Enforcement Level: Browser-Automated.
- Peacock: Level 0 (Walled Garden). GraphQL readable but no documented API. No partner program. No title-level control. Phosra Enforcement Level: Browser-Automated (limited scope).

---

## 2. API Accessibility Assessment Framework

For each platform, complete this entire assessment systematically. This framework is the core intellectual contribution of Phosra research — it converts "what features does this platform have?" into "what can Phosra actually do?"

### 2.1 Platform API Landscape

Answer every question. "Unknown" is acceptable only if documented as a research gap requiring follow-up.

#### Public API Assessment

| Question | Answer | Evidence / Source |
|---|---|---|
| Does a public API exist? | Yes / No / Deprecated | Link to docs or evidence |
| Historical context (was there ever a public API?) | | |
| Is there a developer portal? | Yes / No | URL if exists |
| Is there API documentation? | Official / Unofficial / None | Link if exists |
| Is there a partner program? | Yes / No | Types of partners accepted |
| What is the partner program scope? | Read-only / Read-write / Custom | |
| Is there an OAuth/delegated access flow? | Yes / No | Scopes available |
| Can third parties request parental control access? | Yes / No | |

#### Internal API Assessment

| Question | Answer | Evidence / Source |
|---|---|---|
| What internal API protocol is used? | REST / GraphQL / Proprietary / Multiple | |
| Primary API endpoint(s) | | Discovered via HAR/network analysis |
| Authentication mechanism | Cookies / JWT / HMAC / OAuth / API keys / MSL / Other | |
| Are internal APIs stable? (versioned, or do they break frequently) | | |
| Is API schema discoverable? (GraphQL introspection, Swagger, etc.) | | |
| Are there undocumented but useful endpoints? | | Discovered via research |

#### Examples

**Netflix API Landscape:**
- No public API. Netflix shut down its public API in 2014.
- No developer portal, no partner program for parental controls.
- No OAuth flow for third parties.
- Internal API: Custom Falcor JSON Graph protocol via `/nq/website/memberapi/release/pathEvaluator`.
- Additional Shakti API endpoints for specific features (`/api/shakti/*/parentalControls`, `/api/shakti/*/viewingactivity`).
- Authentication: Session cookies (`NetflixId`, `SecureNetflixId`) + MSL tokens + CSRF headers.
- APIs appear stable (versioned via Shakti build numbers) but undocumented.

**Peacock API Landscape:**
- No public API. No developer portal. No partner program.
- No OAuth flow.
- Internal API: Standard GraphQL via AWS AppSync.
- Authentication: Session cookies/tokens (simpler than Netflix).
- GraphQL schema may be partially discoverable via introspection.
- No MSL or custom protocol layers.

### 2.2 Per-Capability Accessibility Matrix

For every parental control capability, fill in this table. This is the single most valuable artifact in the research — it tells Phosra engineers exactly what is and is not possible.

| Capability | Feature Exists? | Public API? | Unofficial API? | Access Method | Auth Required | 3rd Party Can Control? | Verdict |
|---|---|---|---|---|---|---|---|
| Profile creation/management | | | | | | | |
| Profile types (kids vs standard) | | | | | | | |
| Content rating filters | | | | | | | |
| Per-title blocking | | | | | | | |
| Profile PIN/lock | | | | | | | |
| Viewing history access | | | | | | | |
| Autoplay controls | | | | | | | |
| Screen time limits | | | | | | | |
| Parental event notifications | | | | | | | |
| Account settings | | | | | | | |

#### Column definitions

- **Feature Exists?** — Does the platform natively offer this capability? (Yes / No / Partial)
- **Public API?** — Is there a documented, supported API for this? (Yes / No / Deprecated)
- **Unofficial API?** — Can this be accessed via undocumented internal APIs? (Yes / Read-only / No)
- **Access Method** — How would Phosra access this? (Public API / Unofficial API / Playwright / Device-level / Not possible)
- **Auth Required** — What authentication is needed? (Session cookie / OAuth / MFA / PIN / Password / None)
- **3rd Party Can Control?** — Bottom line: can Phosra set/change this? (Yes / Read-only / With risk / No)
- **Verdict** — One-line summary of the integration reality.

#### Example: Netflix Per-Capability Matrix

| Capability | Feature Exists? | Public API? | Unofficial API? | Access Method | Auth Required | 3rd Party Can Control? | Verdict |
|---|---|---|---|---|---|---|---|
| Profile creation | Yes | No | No | Playwright | Session cookie | With risk | Browser automation, detectable |
| Profile types (kids) | Yes | No | Read-only (Falcor) | Playwright for write | Session cookie | With risk | Read via API, write via browser |
| Content rating filters | Yes (4 tiers, per-profile) | No | Read-only (Shakti) | Playwright for write | Session + MFA | With risk | MFA gate makes writes complex |
| Per-title blocking | Yes | No | Read-only (Shakti) | Playwright for write | Session + MFA | With risk | MFA gate, title search UI required |
| Profile PIN/lock | Yes (per-profile) | No | No | Playwright | Session + password | With risk | Password re-entry needed |
| Viewing history | Yes (title + date) | No | Yes (Shakti API) | Unofficial API | Session cookie | Read-only | Best-case scenario — API reads work |
| Autoplay controls | Yes (2 toggles) | No | No | Playwright | Session cookie | With risk | Low-priority write |
| Screen time limits | No | N/A | N/A | Not possible | N/A | No | Platform gap — Phosra-managed only |
| Parental event notifications | No | N/A | N/A | Not possible | N/A | No | Platform gap — Phosra-managed only |
| Account settings | Yes | No | Partial (Falcor) | Playwright for write | Session + password | With risk | Standard browser automation |

#### Example: Peacock Per-Capability Matrix

| Capability | Feature Exists? | Public API? | Unofficial API? | Access Method | Auth Required | 3rd Party Can Control? | Verdict |
|---|---|---|---|---|---|---|---|
| Profile creation | Yes (unprotected) | No | No | Playwright | None | With risk | Easy but also a bypass vector |
| Profile types (kids) | Yes | No | Read-only (GraphQL) | Playwright for write | None | With risk | No auth barrier for creation |
| Content rating filters | Yes (5 tiers, account-wide) | No | Read-only (GraphQL) | Playwright for write | PIN | With risk | Account-wide scope limits usefulness |
| Per-title blocking | No | N/A | N/A | Not possible | N/A | No | Platform does not offer this |
| Profile PIN/lock | Yes (account-wide) | No | No | Playwright | Current PIN or password | With risk | Web-only setup |
| Viewing history | Partial (Continue Watching) | No | Read-only (GraphQL) | GraphQL API | Session token | Read-only | Sparse data — no timestamps |
| Autoplay controls | No | N/A | N/A | Not possible | N/A | No | Platform gap |
| Screen time limits | No | N/A | N/A | Not possible | N/A | No | Platform gap |
| Parental event notifications | No | N/A | N/A | Not possible | N/A | No | Platform gap |
| Account settings | Yes | No | Partial (GraphQL) | Playwright for write | PIN/password | With risk | Web-only controls |

### 2.3 Third-Party Integration Reality Check

This section grounds the research in what existing parental control products have actually achieved. Do not assume Phosra can do something novel without evidence.

**Questions to answer:**

1. **What do existing parental control apps do with this platform?**
   - Bark, Qustodio, Net Nanny, Circle, Google Family Link, Apple Screen Time — research each.
   - Document their actual enforcement level (platform API integration, browser monitoring, device-level block, DNS filtering, nothing).

2. **Has any third party achieved direct API integration with this platform?**
   - Search for developer partnerships, press releases, API access programs.
   - If no third party has achieved API integration, that is a strong signal that Phosra will face the same barriers.

3. **What is the actual enforcement level of existing products?**
   Use this classification:

   | Enforcement Level | Description | Example |
   |---|---|---|
   | **Platform API** | Direct integration via official API | YouTube Family Link integration with Google |
   | **Browser automation** | Playwright/Selenium-style control of web UI | No known examples for streaming parental controls |
   | **Device/OS level** | Block the app entirely or limit screen time at the OS level | Apple Screen Time blocking Netflix app after 2 hours |
   | **DNS/Network level** | Block domains at the router or DNS level | Circle blocking peacocktv.com after 9pm |
   | **Not possible** | Cannot enforce this control through any method | Filtering specific Peacock titles (platform doesn't support it) |

4. **What has changed recently?** (Last 12 months)
   - New partner programs announced?
   - API deprecations or shutdowns?
   - New parental control features added?
   - Regulatory pressure (COPPA, KOSA, state laws) creating API openness?

### 2.4 Legal & Risk Assessment

Every platform research must include a concrete legal and risk analysis.

| Assessment Area | Detail |
|---|---|
| **ToS on automated access** | Quote the specific clause. Every major platform prohibits it; the question is how strictly they enforce. |
| **ToS on credential sharing with services** | Does the ToS specifically prohibit sharing login credentials with third-party services? |
| **Anti-bot/automation detection measures** | What is known about their detection stack? (Fingerprinting, CAPTCHAs, behavioral analysis, IP reputation) |
| **Account suspension risk** | What happens if detected? (Warning, temporary ban, permanent suspension, loss of content) |
| **Household sharing/IP monitoring** | Does the platform monitor for password sharing or multi-location access? Relevant because Phosra's servers are not in the user's home. |
| **Regulatory safe harbor argument** | Could Phosra argue that its automation serves a child safety purpose protected by COPPA/KOSA? |
| **Precedent** | Have other parental control services been blocked or allowed by this platform? |

#### Example: Netflix Legal & Risk

- ToS Section 6 explicitly prohibits automated access and scraping.
- Aggressive bot detection: device fingerprinting, behavioral analysis, headless browser detection.
- Account suspension risk: Medium. Netflix primarily targets piracy/sharing automation, not parental control tools.
- Household sharing: Netflix implemented paid sharing in 2023; extra-household access from Phosra servers could trigger sharing enforcement.
- Mitigation: Stealth mode, human-like timing, minimal request frequency, residential proxy consideration.

#### Example: Peacock Legal & Risk

- Standard streaming platform ToS prohibiting automated access.
- Detection: Standard AWS WAF, less aggressive than Netflix.
- Account suspension risk: Low-Medium. Less enforcement history than Netflix.
- No known household sharing enforcement.
- Simpler mitigation: Playwright stealth mode sufficient.

---

## 3. Adapter Assessment Template

For each platform, assess the standard Phosra adapter methods. This goes in `adapter_assessment.md`.

### Standard Method List

Every adapter assessment MUST evaluate these 10 methods:

| # | Method | Description |
|---|---|---|
| 1 | `authenticate(credentials) -> Session` | Login and establish a session |
| 2 | `listProfiles() -> Profile[]` | List all profiles on the account |
| 3 | `getProfileSettings(profileId) -> Settings` | Read parental control settings for a profile |
| 4 | `setContentRestrictions(profileId, maturityLevel)` | Set maturity rating filter |
| 5 | `setTitleRestrictions(profileId, titles[])` | Block specific titles |
| 6 | `setProfilePIN(profileId, pin)` | Set or change profile PIN/lock |
| 7 | `supportsNativeScreenTime() -> boolean` | Does the platform have native screen time? |
| 8 | `getWatchHistory(profileId) -> WatchEntry[]` | Retrieve viewing history |
| 9 | `lockProfile(profileId) / unlockProfile(profileId)` | Lock/unlock a profile (screen time enforcement) |
| 10 | `createKidsProfile(name, maturityLevel)` | Create a new kids profile |

### Per-Method Assessment Format

For each of the 10 methods, document the following in a consistent table format:

```markdown
### N. `methodName(params) -> ReturnType`

| Aspect | Detail |
|---|---|
| **Implementation** | Public API / Unofficial API / Playwright / Not possible |
| **API Accessibility Verdict** | See scoring system — Level 0-5 for this specific capability |
| **Approach** | Detailed description of how Phosra would implement this |
| **API Alternative** | If Playwright is primary, is there an API that could work? |
| **Auth Required** | What authentication/authorization is needed |
| **Data Available** | What data can be read/written |
| **Data NOT Available** | Explicit gaps |
| **Complexity** | Low / Medium / High |
| **Risk Level** | Low / Medium / High — with explanation |
| **Recommendation** | Final recommendation for implementation |
```

### Method-Level Verdict Categories

For each method, assign one of these verdicts:

- **API-Native** — Can be implemented with a direct (public or unofficial) API call. Lowest risk, highest reliability.
- **Playwright-Required** — Must use browser automation. Higher risk, more complex, but functional.
- **Playwright + MFA** — Browser automation with additional MFA/PIN challenge. Highest complexity for a functional method.
- **Not Supported** — Platform does not offer this feature. Return `UnsupportedOperationError`.
- **Static Return** — Method returns a constant (e.g., `supportsNativeScreenTime() -> false`).

### Overall Architecture Section

After assessing all 10 methods, include:

1. **Recommended architecture diagram** (text format showing Session Manager, Read Layer, Write Layer, Monitor Layer)
2. **Development effort estimate** (table: component, effort in days, priority)
3. **Detection vectors and mitigations** (table: vector, risk level, mitigation)
4. **Terms of Service summary** (specific clause references)

---

## 4. Integration Notes Template

This goes in `phosra_integration_notes.md`. It bridges the gap between "what the platform offers" and "what Phosra can deliver to families."

### Section 1: Rule Category Coverage

Map Phosra's 45 enforcement rule categories against this platform. Use three tiers:

**Fully Enforceable** — Feature exists on the platform and Phosra can control it (via API or Playwright).

| Rule Category | Platform Feature | Enforcement Method |
|---|---|---|
| `category_name` | What platform feature maps to this | API read / Playwright write / etc. |

**Partially Enforceable** — Feature does not exist natively, but Phosra can approximate it through workarounds.

| Rule Category | Gap | Phosra Workaround |
|---|---|---|
| `category_name` | What is missing | How Phosra works around it |

**Not Enforceable** — Feature does not exist and cannot be approximated.

| Rule Category | Reason |
|---|---|
| `category_name` | Why this cannot be enforced on this platform |

### Section 2: Enforcement Strategy

Document the concrete technical strategy, separated into:

- **Read Operations** — What Phosra reads from the platform, via what API, on what schedule.
- **Write Operations** — What Phosra changes on the platform, via what method, with what authentication.
- **Screen Time Enforcement** — Detailed flow for Phosra-managed screen time (if platform has no native support).
- **Why Playwright for Writes** — Justify why direct API writes are not used (if applicable).

Include polling frequency, rate limits, and latency expectations.

### Section 3: Credential Storage Requirements

Table format:

| Credential | Purpose | Sensitivity | Storage Notes |
|---|---|---|---|
| Email | Login | High | Encrypted at rest |
| Password | Login + MFA/PIN | Critical | AES-256, per-user keys, never logged |
| Session tokens | API reads | High | Rotate on schedule |
| Profile IDs | Child mapping | Low | Can be stored in plain DB |
| Platform PIN | Write operations | High | Encrypted, needed for automation |

### Section 4: OAuth Assessment

Explicitly document:
- Whether the platform offers OAuth (almost all streaming platforms: No)
- What this means for Phosra's UX (credential storage consent, re-authentication frequency)
- Comparison to platforms that do offer OAuth (for context)

### Section 5: Adapter Gap Analysis

Compare the platform's capabilities to the research adapter (if one exists) and identify what is needed for a production adapter.

**What Exists** (current state of research/production adapter):

| Feature | Status |
|---|---|
| Feature name | Implemented / Missing / Partial |

**What's Needed** (for production Phosra integration):

| Feature | Status | Priority |
|---|---|---|
| Feature name | Missing / Partial | P0 / P1 / P2 |

### Section 6: Platform-Specific Considerations

Document anything unique to this platform that does not fit in the standard sections:
- Security gaps (e.g., Peacock's unprotected profile creation)
- Platform-specific features (e.g., Netflix Games)
- Known quirks or bugs in the platform's parental controls
- Recent or upcoming changes to the platform

### Section 7: API Accessibility Reality Check

Summarize the entire API accessibility picture in a concise format:

```markdown
## API Accessibility Reality Check

**Platform:** [Name]
**API Accessibility Score:** Level [0-5] — [Label]
**Phosra Enforcement Level:** [Platform-Native / Browser-Automated / Device-Level / Not Possible]

### What Phosra CAN do:
- [Bulleted list of capabilities with access method]

### What Phosra CANNOT do:
- [Bulleted list of capabilities that are impossible or too risky]

### What Phosra MIGHT be able to do (with risk):
- [Bulleted list of capabilities that are technically possible but carry ToS/detection risk]

### Recommendation:
[1-2 paragraph summary of the recommended integration strategy and its limitations]
```

---

## 5. Scoring System

### API Accessibility Score (Level 0-5)

This score classifies how open a platform is to third-party parental control integration. Assign ONE score per platform.

| Level | Label | Description | Parental Control Integration | Example |
|---|---|---|---|---|
| **Level 0** | **Walled Garden** | No API, no partner program, no documented unofficial access. The platform is a black box. | Playwright-only (if even possible). Maximum ToS risk. | Peacock — no public API, no partner program, no documented internal APIs, web-only parental controls |
| **Level 1** | **Unofficial Read-Only** | No public API, but internal APIs have been reverse-engineered and can be used for reading data. Write operations still require browser automation. | API reads + Playwright writes. Moderate ToS risk. | Netflix — Shakti/Falcor APIs allow reading profiles, settings, viewing history. Writes require Playwright + MFA. |
| **Level 2** | **Limited Partner API** | A partner API exists but with restricted scope (e.g., content metadata only, no parental control access). Or an unofficial API exists with both read and write capability. | Partial API integration. Partner application required. | Hypothetical: A streaming platform with a content catalog API but no parental control endpoints. |
| **Level 3** | **Public Read API** | Public API available for reading user data (profiles, settings, history) but no write access for parental controls. | Full API reads, Playwright writes. Lower risk for reads. | Hypothetical: A platform with a public profile/activity API but no settings mutation endpoints. |
| **Level 4** | **Full Partner API** | Partner program with both read and write API access relevant to parental controls. Requires application and approval. | Full API integration (once approved). Low ToS risk. | Hypothetical: A platform with a "Family Safety Partner" program granting OAuth-scoped parental control access. |
| **Level 5** | **Open API** | Public API with OAuth for delegated parental control access. Any developer can build integrations. | Full API integration, self-service. Minimal risk. | YouTube via Google Family Link APIs (closest real-world example, though still limited in scope). |

**Current landscape reality:** As of 2026, virtually all major streaming platforms are Level 0 or Level 1. No streaming platform offers a Level 4 or Level 5 API for parental controls. This is the core challenge Phosra faces.

### Phosra Enforcement Level

This scale classifies how Phosra actually enforces each parental control capability on a given platform. Assign per-capability, not per-platform.

| Level | Label | Description | Reliability | Risk |
|---|---|---|---|---|
| **Platform-Native** | Feature exists and is API-accessible | Phosra calls a platform API (public or unofficial) to read or write this setting. | High | Low (public API) to Medium (unofficial API) |
| **Browser-Automated** | Feature exists but requires Playwright automation | The platform has this feature in its web UI, but there is no API. Phosra must automate a browser to interact with it. | Medium | Medium to High (ToS violation, detection risk, MFA complexity) |
| **Device-Level** | No platform integration; enforce via OS/DNS/router | The platform does not offer this feature, and it cannot be automated. Phosra defers to device-level controls (iOS Screen Time, router schedules, DNS filtering). | Medium | Low (no platform ToS risk, but requires device-level setup) |
| **Not Possible** | Feature does not exist on the platform | Neither the platform nor any external mechanism can provide this capability for this specific platform. | N/A | N/A |

#### Mapping Examples

**Netflix enforcement levels by capability:**

| Capability | Enforcement Level | Detail |
|---|---|---|
| Read profiles | Platform-Native (unofficial) | Falcor API with session cookies |
| Read viewing history | Platform-Native (unofficial) | Shakti API with session cookies |
| Read parental settings | Platform-Native (unofficial) | Shakti API with session cookies |
| Set maturity level | Browser-Automated | Playwright + MFA verification |
| Set title restrictions | Browser-Automated | Playwright + MFA verification |
| Set profile PIN | Browser-Automated | Playwright + password re-entry |
| Screen time limits | Device-Level | No native support; defer to OS/router |
| Parental notifications | Not Possible | No native support; Phosra polls history as workaround |

**Peacock enforcement levels by capability:**

| Capability | Enforcement Level | Detail |
|---|---|---|
| Read profiles | Platform-Native (unofficial) | GraphQL API with session tokens |
| Read viewing history | Platform-Native (unofficial) | GraphQL API (Continue Watching only) |
| Set maturity level | Browser-Automated | Playwright + PIN entry (account-wide) |
| Per-title blocking | Not Possible | Platform does not offer this feature |
| Set account PIN | Browser-Automated | Playwright (web-only controls) |
| Screen time limits | Device-Level | No native support |
| Autoplay controls | Not Possible | Platform does not expose autoplay toggle |

---

## 6. File Structure Convention

All platform research MUST follow this directory structure. No exceptions.

### Directory Layout

```
research/providers/{tier}/{platform}/
├── findings.md                    # Research report (Sections 1-8 from methodology)
├── adapter_assessment.md          # Method-by-method assessment (10 methods)
├── phosra_integration_notes.md    # Integration strategy + gap analysis (7 sections)
├── rating_mapping.json            # Rating tier mappings (platform tiers -> MPAA/TV ratings)
├── section_data.json              # Structured data for UI components (profile trees, API tables)
├── api_endpoints.json             # (optional) Full catalog of discovered API endpoints
├── api_endpoints_cleaned.json     # (optional) Cleaned/deduplicated endpoint catalog
└── screenshots/                   # (optional) Research screenshots
    ├── 001-login-page.png
    ├── 002-profile-picker.png
    └── ...
```

### Tier Classification

```
research/providers/
├── tier1_adapter_exists/          # Platforms with existing Phosra adapters
│   ├── netflix/
│   └── peacock/
├── tier2_research_complete/       # Fully researched, no adapter yet
│   └── {platform}/
├── tier3_research_in_progress/    # Research started, not complete
│   └── {platform}/
└── tier4_planned/                 # Planned for research, not started
    └── {platform}/
```

### File Descriptions

| File | Required? | Description |
|---|---|---|
| `findings.md` | **Required** | The primary research report. Sections 1-8 from the methodology template. This is the most important file — it should be comprehensive enough that someone can understand the platform's parental control landscape without looking at any other file. |
| `adapter_assessment.md` | **Required** | Method-by-method assessment of the 10 standard adapter methods. Includes architecture diagram, effort estimate, risk assessment. |
| `phosra_integration_notes.md` | **Required** | How Phosra specifically integrates with this platform. Rule category coverage, enforcement strategy, credential requirements, gap analysis. |
| `rating_mapping.json` | **Required** | Machine-readable mapping of platform maturity tiers to standard rating systems (MPAA, TV Parental Guidelines). Used by Phosra's rating normalization engine. |
| `section_data.json` | **Required** | Structured data for the Phosra platform research UI. Includes profile hierarchy, API endpoint tables, rating tiers, and other data rendered in the dashboard. |
| `api_endpoints.json` | Optional | Full catalog of API endpoints discovered during research. Include endpoint path, HTTP method, purpose, auth requirements, request/response examples. |
| `api_endpoints_cleaned.json` | Optional | Deduplicated and organized version of the endpoint catalog. Preferred over the raw version for ongoing reference. |
| `screenshots/` | Optional | Browser screenshots captured during research. Numbered sequentially. Useful for documenting UI flows that are hard to describe in text. |

### JSON File Schemas

#### `rating_mapping.json`

```json
{
  "platform": "Platform Name",
  "tiers": [
    {
      "tierName": "Little Kids",
      "tierLevel": 1,
      "mpaa": ["G"],
      "tv": ["TV-Y", "TV-G"],
      "description": "Content for youngest viewers",
      "ageRange": "2-6"
    }
  ],
  "notes": "Any platform-specific rating notes"
}
```

#### `section_data.json`

```json
{
  "profileStructure": {
    "accountLabel": "Platform Account",
    "accountDescription": "Subscription tier",
    "accountMeta": "Max N profiles",
    "accountBorderColor": "#hex",
    "accountLabelColor": "#hex",
    "hierarchyDescription": "Account > Profiles > Settings hierarchy",
    "profiles": [
      { "name": "Profile Name", "maturity": "Tier", "type": "standard|kids", "pinEnabled": false }
    ],
    "settings": [
      { "setting": "Setting Name", "configurable": true }
    ],
    "subscriptionTiers": [
      { "plan": "Plan Name", "streams": "N", "resolution": "1080p|4K" }
    ]
  },
  "technicalRecon": {
    "subtitle": "Brief description of API architecture",
    "apiArchitecture": {
      "title": "Protocol Name",
      "description": "Multi-sentence description of the API architecture",
      "codeExample": {
        "comment": "// Code comment",
        "method": "GET|POST",
        "endpoint": "/api/endpoint",
        "exampleComment": "// Example description",
        "exampleCode": "{ \"example\": \"request body\" }"
      }
    },
    "endpoints": [
      { "endpoint": "/path", "purpose": "Description", "auth": "Auth method" }
    ]
  }
}
```

### Naming Conventions

- Platform directory names: lowercase, no spaces, no special characters (e.g., `netflix`, `peacock`, `disney_plus`, `youtube`, `apple_tv_plus`)
- Screenshot files: numbered with leading zeros, descriptive suffix (e.g., `001-login-page.png`, `042-maturity-slider.png`)
- JSON files: snake_case (e.g., `rating_mapping.json`, `section_data.json`, `api_endpoints.json`)
- Markdown files: snake_case (e.g., `findings.md`, `adapter_assessment.md`, `phosra_integration_notes.md`)

---

## 7. Examples & Reference

### Completed Research (use as templates)

The following platforms have completed research that follows this framework. Use them as concrete examples when starting research on a new platform.

| Platform | Location | API Score | Key Learnings |
|---|---|---|---|
| **Netflix** | `research/providers/tier1_adapter_exists/netflix/` | Level 1 (Unofficial Read-Only) | Falcor/Shakti APIs for reads. MFA gate on writes. Aggressive bot detection. Per-profile control granularity. |
| **Peacock** | `research/providers/tier1_adapter_exists/peacock/` | Level 0 (Walled Garden) | GraphQL via AppSync. PIN-only write gate. Account-wide restrictions. No per-title blocking. Unprotected profile creation. |

### Research Checklist

Use this checklist to verify completeness before marking research as done.

```
[ ] findings.md — All 8 sections complete
    [ ] Section 1: Profile Management
    [ ] Section 2: Content Restrictions (with rating mapping table)
    [ ] Section 3: PIN / Lock Protection
    [ ] Section 4: Screen Time Controls
    [ ] Section 5: Viewing History & Monitoring
    [ ] Section 6: API / Technical Architecture (with endpoint table)
    [ ] Section 7: Account Structure & Integration Points (with hierarchy diagram)
    [ ] Section 8: API Accessibility & Third-Party Integration

[ ] adapter_assessment.md — All 10 methods assessed
    [ ] authenticate()
    [ ] listProfiles()
    [ ] getProfileSettings()
    [ ] setContentRestrictions()
    [ ] setTitleRestrictions()
    [ ] setProfilePIN()
    [ ] supportsNativeScreenTime()
    [ ] getWatchHistory()
    [ ] lockProfile() / unlockProfile()
    [ ] createKidsProfile()
    [ ] Overall architecture diagram
    [ ] Development effort estimate
    [ ] Detection vectors and mitigations
    [ ] ToS summary

[ ] phosra_integration_notes.md — All 7 sections complete
    [ ] Rule Category Coverage (fully/partially/not enforceable)
    [ ] Enforcement Strategy (reads vs writes + screen time)
    [ ] Credential Storage Requirements
    [ ] OAuth Assessment
    [ ] Adapter Gap Analysis
    [ ] Platform-Specific Considerations
    [ ] API Accessibility Reality Check

[ ] rating_mapping.json — Valid JSON, all tiers mapped
[ ] section_data.json — Valid JSON, profile + technical sections
[ ] API Accessibility Score assigned (Level 0-5)
[ ] Phosra Enforcement Level assigned per capability
```

### Platforms Prioritized for Research

The following platforms are prioritized based on market reach, child usage data, and compliance requirements:

**Streaming:**
- Netflix (done), Peacock (done)
- Disney+, Hulu, HBO Max, Amazon Prime Video, Apple TV+, Paramount+, YouTube/YouTube Kids

**Social:**
- TikTok, Instagram, Snapchat, Facebook, X (Twitter), Reddit, Discord

**Gaming:**
- Roblox, Fortnite (Epic Games), Minecraft, PlayStation Network, Xbox Live, Nintendo Online, Steam

### Research Execution Tips

1. **Start with HAR recording.** Use Playwright with HAR recording enabled to capture all network traffic during a manual research session. This reveals internal APIs that are not visible from the UI alone.

2. **Check for GraphQL introspection.** Many platforms using GraphQL accidentally leave introspection enabled. Try sending an introspection query before reverse-engineering individual queries.

3. **Test with a real subscription.** Free tiers often have different (or no) parental controls. Always research with a paid account that has full parental control features.

4. **Document what does NOT exist.** Gaps are as important as features. If a platform does not offer screen time controls, explicitly state that — do not leave the section blank.

5. **Cross-reference with existing parental control apps.** Before assuming Phosra can do something novel, check what Bark, Qustodio, and Net Nanny actually do with this platform. If they defer to device-level controls, that is a strong signal.

6. **Capture screenshots for UI flows.** Parental control UIs change frequently. Screenshots create a point-in-time record that helps when platform updates break automation flows.

7. **Note the date.** Platform features, APIs, and detection mechanisms change. Always include the research date prominently. Research older than 6 months should be verified before relying on it.

8. **Assess API accessibility as you go.** Do not save the API accessibility assessment for last. Fill in the per-capability matrix as you discover each feature — this ensures you are thinking about integration feasibility from the start, not as an afterthought.

---

## Appendix: Rule Category Reference

For reference, Phosra's 45 enforcement rule categories are defined in `internal/domain/models.go`. The categories most relevant to streaming platform research are:

| Category | Description | Typically Enforceable on Streaming? |
|---|---|---|
| `content_rating_filter` | Filter content by maturity rating | Yes |
| `title_restriction` | Block specific titles | Sometimes (Netflix yes, Peacock no) |
| `profile_lock` | PIN/lock on profiles | Yes |
| `parental_consent_gate` | Require parental consent for changes | Usually built-in |
| `age_gate` | Age-based access restriction | Yes (via maturity tiers) |
| `viewing_history_access` | Parental access to watch history | Yes |
| `autoplay_control` | Control autoplay behavior | Sometimes |
| `screen_time_limit` | Daily/weekly time limits | Rarely (must be Phosra-managed) |
| `screen_time_report` | Usage reports for parents | Rarely (Phosra-generated) |
| `bedtime_schedule` | Time-of-day restrictions | Rarely (Phosra-managed or device-level) |
| `parental_event_notification` | Alerts to parents | Rarely (Phosra-managed) |
| `kids_profile` | Dedicated kids experience | Usually |
| `purchase_control` | In-app purchase restrictions | N/A for subscription-only platforms |
| `social_control` | Social interaction restrictions | N/A for most streaming platforms |
| `commercial_data_ban` | Ban commercial use of minor data | Not controllable from consumer side |
| `algorithmic_audit` | Algorithm transparency | Not controllable from consumer side |

---

*This framework is the authoritative standard for all Phosra platform research. Every new platform research effort MUST follow the templates, scoring systems, and file conventions defined here. Research that deviates from this framework without documented justification is considered incomplete.*
