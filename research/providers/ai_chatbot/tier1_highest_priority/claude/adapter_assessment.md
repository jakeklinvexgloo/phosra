# Claude -- Phosra Adapter Assessment

**Platform:** Claude (Anthropic)
**Assessment Date:** 2026-02-27
**Overall Feasibility:** 3/10
**Recommended Strategy:** Device-Level + Browser Extension + Network-Level (No Platform Integration)

---

## Executive Summary

Claude presents the most challenging integration scenario among Tier 1 AI chatbot platforms for Phosra. The fundamental problem is twofold: (1) Claude has zero parental control features to integrate with, and (2) Anthropic actively and aggressively blocks third-party automation of consumer accounts.

Unlike ChatGPT, where Phosra faces a "controls exist but no API" problem, Claude presents a "controls do not exist AND automation is blocked" problem. There are no safety settings to read, no parent dashboard to scrape, no feature toggles to sync, and no alert system to forward. The only platform-side features Phosra could interact with are conversation history and memory -- both accessible only through the user's own session on claude.ai, and both subject to Anthropic's anti-automation enforcement.

Anthropic clarified in February 2026 that consumer account OAuth tokens cannot be used in any third-party tool, and implemented technical blocks in January 2026 against third-party harnesses. This is the most hostile integration environment among major AI chatbot platforms.

The recommended strategy is entirely external to the platform: device-level controls, browser extension monitoring, network-level enforcement, and Phosra-managed conversation analysis using Claude's own developer API for content classification.

---

## API Inventory

### Available APIs (Developer-Facing)

| API | Endpoint | Auth | Relevance to Phosra |
|-----|----------|------|---------------------|
| Messages | `POST /v1/messages` | API Key | **Medium** -- can be used for content classification and NLP analysis of captured conversation text |
| Admin (Organization) | `GET /v1/organizations/{id}/members` | Admin API Key | None -- organizational management only |
| Admin (API Keys) | `GET /v1/organizations/{id}/api_keys` | Admin API Key | None |
| Compliance | Enterprise-specific | Enterprise auth | None for consumer monitoring |

### Unavailable APIs (Parental Controls / Consumer)

| Needed Capability | API Status | Alternative |
|-------------------|-----------|-------------|
| Parent-teen account linking | No feature exists | Not possible -- feature does not exist on Claude |
| Safety settings configuration | No feature exists | Not possible -- no configurable safety settings |
| Quiet hours management | No feature exists | Device-level (Screen Time/Family Link) or network-level (DNS blocking) |
| Feature toggles | No parent-facing feature | Not possible -- no parent account |
| Usage statistics retrieval | No parent-facing feature | Browser extension tracking |
| Conversation transcript access | No parent-facing API | Browser extension capture (risky) |
| Safety alert webhooks | No feature exists | Browser extension detection |
| Memory management | No parent-facing feature | Not possible -- only the user can manage their own memory |
| Account-level content filter config | No feature exists | Not possible -- single safety posture for all users |

---

## Adapter Architecture

### Recommended: External-Only Multi-Layer Approach

```
+---------------------------------------------------+
|                 Phosra Platform                     |
|                                                     |
|  +-----------+  +----------+  +-----------------+  |
|  | Extension |  | Network  |  | Claude Messages |  |
|  | Manager   |  | Controls |  | API (NLP/Class) |  |
|  +-----+-----+  +----+-----+  +--------+--------+  |
|        |              |                 |            |
+--------+--------------+-----------------+------------+
         |              |                 |
    +----v----+   +-----v-----+    +------v------+
    | Browser |   | DNS/Router|    | Anthropic   |
    |Extension|   |  Control  |    | Messages API|
    |(client) |   | (network) |    | (developer) |
    +----+----+   +-----+-----+    +------+------+
         |              |                 |
         +------+-------+                 |
                |                          |
          +-----v------+                   |
          |  claude.ai  |                  |
          | (consumer)  |     Content classification
          +-------------+     (not consumer monitoring)
```

### Layer 1: Browser Extension (Monitoring + Enforcement)

**Capabilities:**
- Track message count per session and per day
- Track session duration (active time on claude.ai)
- Capture visible conversation text for content analysis
- Detect crisis banner display (ThroughLine resources)
- Inject break reminders and time warnings
- Block the page when limits are exceeded
- Detect Incognito Chat mode activation
- Monitor which Claude model is being used

**Limitations:**
- Desktop browsers only (Chrome, Firefox, Edge, Safari)
- Cannot monitor mobile apps (iOS/Android Claude app)
- Cannot monitor Electron desktop app (unless injection is viable, which is uncertain)
- Can be disabled by the user (Phosra can detect missing heartbeat)
- Anthropic may detect and block extension-based DOM monitoring if it interferes with normal operation
- Only captures text visible in the viewport, not full conversation history

**Risk Assessment:**
- Higher detection risk than ChatGPT extension due to Anthropic's aggressive anti-automation posture
- Browser extensions that only observe (read-only DOM monitoring) are less likely to trigger anti-bot measures than those that modify page behavior
- Extension should be designed as purely passive monitoring where possible, with active intervention (blocking overlays) kept minimal

### Layer 2: Network-Level Controls (Hard Enforcement)

**Capabilities:**
- Block `claude.ai`, `api.anthropic.com`, and related domains
- Enforce schedule restrictions (quiet hours) at the network level
- Block after time/message limits exceeded (triggered by extension or Phosra backend)
- Cannot be bypassed by switching browsers or disabling extension (on home network)

**Limitations:**
- Requires Phosra router/DNS integration or device-level DNS configuration
- Blocks the entire Claude platform, not granular
- VPN or cellular data bypasses network controls
- Also blocks legitimate API usage if the family uses Claude's developer API

**Domain Blocklist:**
```
claude.ai
api.anthropic.com
cdn.anthropic.com
console.anthropic.com
code.claude.com
```

### Layer 3: Claude Messages API (Content Classification)

**Capabilities:**
- Use Claude's own Messages API to analyze captured conversation text
- Content classification, topic detection, sentiment analysis
- Homework detection (classify whether a conversation is academic task completion)
- Distress detection (NLP analysis for emotional distress indicators)
- PII detection (identify personal information sharing)
- More capable than OpenAI's Moderation API for nuanced content analysis (Claude excels at reasoning about context)

**Limitations:**
- Costs per token (unlike OpenAI's free Moderation API) -- Haiku is cheapest at $1/$5 per million tokens
- Requires captured text from the browser extension
- Privacy concern: sending child's conversation text to Anthropic's API for classification
- Latency: ~500ms-2s depending on model and prompt complexity

**Cost Estimate:**
- Using Claude Haiku 4.5 for classification: ~$0.01-0.05 per conversation analysis
- Monthly cost for active monitoring: ~$5-20 per child depending on usage volume

### Layer 4: Device-Level Controls (iOS/Android/macOS/Windows)

**Capabilities:**
- iOS Screen Time: limit Claude app time, block during schedules
- Android Family Link: limit Claude app time, block app entirely
- macOS Screen Time: limit Claude desktop app and browser access
- Windows Family Safety: limit browser access to claude.ai
- Most reliable enforcement method -- cannot be bypassed at the application level

**Limitations:**
- Requires device-level setup by parent (one-time but technically involved)
- Cannot provide content-level monitoring (only time/access controls)
- Cannot distinguish Claude usage from other browser activity (unless app-specific restrictions)
- Teen with admin access to device can modify Screen Time/Family Link settings

---

## Adapter Method Assessments

### 1. `authenticate(credentials) -> Session`

| Aspect | Detail |
|---|---|
| **Implementation** | API Key (Phosra-owned, for Messages API) -- NO consumer account authentication |
| **API Accessibility Verdict** | Level 0 -- Consumer authentication explicitly prohibited for third parties |
| **Approach** | Phosra does NOT authenticate as the child's Claude account. Instead: (a) Phosra uses its own API key for the Messages API (content classification only). (b) The browser extension runs in the context of the child's existing browser session -- no separate authentication needed. (c) No Playwright login, no credential storage, no session cookie management for the child's account. This is a fundamental design decision driven by Anthropic's explicit prohibition on third-party consumer account access. |
| **API Alternative** | None. Anthropic's Consumer Terms Section 3.7 explicitly prohibits using consumer OAuth tokens in third-party tools. Playwright-based login would violate ToS and trigger anti-automation measures. |
| **Auth Required** | Phosra-owned API key for Messages API (developer authentication only) |
| **Data Available** | Messages API: full conversation generation and analysis capability. Extension: ambient monitoring of the child's active session. |
| **Data NOT Available** | Consumer account settings, conversation history (beyond visible text), usage statistics, memory contents, account metadata |
| **Complexity** | Low -- API key authentication is trivial; extension requires no authentication |
| **Risk Level** | Low -- Phosra uses its own API key (fully permitted) and a browser extension (no ToS violation for read-only monitoring) |
| **Latency** | Instant (API key) |
| **Recommendation** | Do NOT implement consumer account authentication. Use Phosra-owned API key for Messages API and browser extension for ambient monitoring. This avoids all ToS issues and Anthropic's anti-automation enforcement. |

### 2. `getAccountSettings() -> SafetySettings`

| Aspect | Detail |
|---|---|
| **Implementation** | Static Return -- SafetySettings object returns fixed values representing Claude's non-configurable safety posture |
| **API Accessibility Verdict** | Level 0 -- No configurable safety settings exist |
| **Approach** | Claude has a single, non-configurable safety posture for all users. There are no content sensitivity levels, no feature toggles for parents, no schedule settings, and no parental control options. The adapter returns a static `SafetySettings` object that documents Claude's fixed safety state: content filtering (on, not configurable), crisis detection (on, not configurable), memory (on by default, user-toggleable but not parent-toggleable), Learning Mode (available, not enforced). |
| **API Alternative** | None -- there are no settings to read. |
| **Auth Required** | None |
| **Data Available** | Static knowledge of Claude's safety posture (documented in findings.md) |
| **Data NOT Available** | Per-user safety settings (do not exist), per-conversation safety configuration (does not exist), memory contents, model training opt-in/out status |
| **Complexity** | None -- returns constant values |
| **Risk Level** | None |
| **Latency** | Instant (local return) |
| **Recommendation** | Implement as a static return documenting Claude's fixed safety posture. Update when Anthropic changes platform-wide safety features. Use this to inform the Phosra dashboard display: "Claude Safety: Platform-managed (not configurable)" |

### 3. `setContentSafetyLevel(level)`

| Aspect | Detail |
|---|---|
| **Implementation** | Not Supported -- returns `UnsupportedOperationError` |
| **API Accessibility Verdict** | Level 0 -- Feature does not exist |
| **Approach** | Claude has no configurable content safety levels. There is no user-facing setting, no parent-facing setting, and no API to adjust content filtering strictness. The platform has a single safety posture governed by Constitutional AI training and cannot be modified by users or third parties. Phosra cannot make Claude stricter or more lenient. |
| **API Alternative** | None. The closest alternative is Phosra's own conversation-layer content analysis: the browser extension captures conversation text and Phosra classifies it using Claude's Messages API. This provides monitoring and alerting but not enforcement -- Phosra cannot prevent Claude from generating a response. |
| **Auth Required** | N/A |
| **Data Available** | N/A |
| **Data NOT Available** | Content filter configuration (does not exist) |
| **Complexity** | N/A |
| **Risk Level** | N/A |
| **Latency** | N/A |
| **Recommendation** | Return `UnsupportedOperationError`. Document in Phosra's parent-facing UI that Claude's content safety is platform-managed and cannot be adjusted. Provide conversation-layer monitoring (extension + Messages API classification) as defense-in-depth alerting. |

### 4. `setConversationLimits(config)`

| Aspect | Detail |
|---|---|
| **Implementation** | Phosra-managed (browser extension + network-level enforcement + device-level) |
| **API Accessibility Verdict** | Level 0 -- Claude has NO native conversation limits |
| **Approach** | This is Phosra's primary and most critical value-add for Claude. The browser extension tracks: (a) session duration (active conversation time on claude.ai), (b) daily message count, (c) session message count. When limits are reached, the extension injects a blocking overlay on claude.ai. As hard enforcement backup, Phosra triggers network-level DNS blocking of claude.ai. For schedule restrictions (quiet hours, school hours), Phosra uses device-level controls (Screen Time/Family Link) as the primary enforcement and network-level DNS blocking as supplementary. |
| **API Alternative** | None. Claude has no native time limits, message limits, quiet hours, or schedule restrictions. |
| **Auth Required** | None for extension enforcement; device-level setup required for Screen Time/Family Link |
| **Data Available** | Extension-tracked: messages sent, session duration, active/idle time, time-of-day patterns |
| **Data NOT Available** | Server-side usage data; Claude does not expose message counts or session duration via any mechanism |
| **Complexity** | Medium -- Extension counting is straightforward; device-level setup requires parent action |
| **Risk Level** | Low-Medium -- Extension-based limits are reliable on desktop; mobile gap exists; Anthropic may detect active page modification (blocking overlay) |
| **Latency** | Real-time (extension tracking) |
| **Recommendation** | Implement as P0 priority. This is Claude's biggest gap and Phosra's strongest differentiator. Claude has literally zero conversation controls. Device-level controls (Screen Time/Family Link) are the most reliable enforcement. Extension + network as supplementary layers. |

### 5. `getConversationHistory(dateRange) -> Conversation[]`

| Aspect | Detail |
|---|---|
| **Implementation** | Browser extension (partial -- active view only) |
| **API Accessibility Verdict** | Level 0 -- No API for consumer conversation history |
| **Approach** | The browser extension captures conversation text visible in the active claude.ai tab using DOM scraping. When a user scrolls through a conversation, the extension captures visible messages. For active conversations, streaming responses are captured via MutationObserver on the chat container. Captured text is sent to Phosra's backend for storage and analysis. Anthropic's anti-automation enforcement adds risk to this approach -- DOM monitoring must be purely passive to avoid detection. |
| **API Alternative** | None for consumer conversation history. The developer Messages API creates developer-owned conversations, NOT consumer claude.ai conversations. There is no API, official or unofficial, to access a consumer user's claude.ai conversation history. Reverse-engineered internal APIs would violate Consumer Terms Section 3.7 and are subject to active technical blocking. |
| **Auth Required** | None -- extension runs in the browser with the child's existing session |
| **Data Available** | Visible conversation text (user messages + AI responses), conversation titles, approximate timestamps |
| **Data NOT Available** | Full conversation history (only captures active visible text), older conversations not currently displayed, system prompts, model used per response, Incognito Chat content (not saved), memory contents |
| **Complexity** | High -- DOM scraping is fragile; Anthropic's anti-automation stance may complicate extension operation |
| **Risk Level** | Medium-High -- Anthropic's aggressive anti-automation posture means even read-only DOM monitoring carries risk. If Anthropic updates claude.ai to detect extension-based monitoring, the entire conversation capture pipeline breaks. |
| **Latency** | Real-time for active conversations; no historical access |
| **Recommendation** | Implement extension-based capture for active monitoring but design for graceful degradation. Accept that full historical conversation access is not achievable. Feed captured text to Claude Messages API (Haiku) for content classification. Prioritize device-level controls as the reliable enforcement layer. |

### 6. `getUsageAnalytics(dateRange) -> UsageStats`

| Aspect | Detail |
|---|---|
| **Implementation** | Browser extension (sole data source) |
| **API Accessibility Verdict** | Level 0 -- No usage analytics feature exists for parents |
| **Approach** | The browser extension is the only data source, tracking: messages sent per session/day, session duration, time-of-day patterns, model used (if detectable from UI), Incognito Chat usage (detection of mode activation). All data is reported to Phosra's backend for aggregation. There is no parent dashboard on Claude to scrape -- usage analytics do not exist on the platform in any form accessible to parents. |
| **API Alternative** | None. Claude has no consumer-facing usage analytics. The Admin API provides organizational usage data (for API console admins), but this is irrelevant to consumer monitoring. |
| **Auth Required** | None -- extension runs in-browser |
| **Data Available** | Extension-tracked: message count, session duration, timestamps, active model (partial), Incognito Chat activation |
| **Data NOT Available** | Server-side accurate time tracking, mobile app usage, desktop app usage (unless extension covers Electron), voice conversation data (N/A -- Claude has no voice mode on consumer), token-level usage, comprehensive feature usage breakdown |
| **Complexity** | Low-Medium -- Extension data collection is straightforward; aggregation and visualization on Phosra side |
| **Risk Level** | Low -- Read-only DOM monitoring for analytics is the least risky extension operation |
| **Latency** | Real-time (extension) |
| **Recommendation** | Implement as P0. This is the only way to provide parents with any Claude usage data. Focus on message count and session duration as the primary metrics. |

### 7. `toggleFeature(feature, enabled)`

| Aspect | Detail |
|---|---|
| **Implementation** | Not Supported for most features -- Playwright for user-level memory toggle (high risk) |
| **API Accessibility Verdict** | Level 0 -- No parent-facing feature toggles exist |
| **Approach** | Claude has no parent-configurable feature toggles. The only user-facing toggles relevant to child safety are: (a) Memory on/off (user can toggle in Settings), (b) Model training opt-in/out (user can toggle in Privacy Settings), (c) Learning Mode style selection (user can switch conversation styles). None of these can be toggled by a parent because there is no parent account. Phosra could theoretically use Playwright to toggle these via the child's own session, but this would require the child's credentials and violate Anthropic's Consumer Terms. |
| **API Alternative** | None. No API for feature toggles exists. |
| **Auth Required** | Child's own session (if Playwright used -- high risk, ToS violation) |
| **Data Available** | N/A |
| **Data NOT Available** | All feature toggle states (no parent access) |
| **Complexity** | High if attempted (Playwright + credential management + anti-automation evasion) |
| **Risk Level** | Very High -- Violates Consumer Terms Section 3.7; Anthropic actively blocks automation; requires child's credentials |
| **Latency** | N/A |
| **Recommendation** | Return `UnsupportedOperationError` for all feature toggles. Do NOT implement Playwright-based toggle automation -- the risk/reward ratio is terrible. Instead, provide parent education: guide parents on asking their child to toggle Memory off, opt out of training, and use Learning Mode. Phosra's browser extension can detect if these settings are changed. |

### 8. `setParentalControls(config)`

| Aspect | Detail |
|---|---|
| **Implementation** | Not Supported -- returns `UnsupportedOperationError` |
| **API Accessibility Verdict** | Level 0 -- Parental controls do not exist on the platform |
| **Approach** | Claude has no parental control system whatsoever. There is no parent account, no parent dashboard, no parent-child linking, no parent-configurable settings, and no parent notification system. This method cannot be implemented because the underlying platform capability does not exist. There is nothing to configure, no API to call, and no UI to automate. |
| **API Alternative** | None. The feature does not exist at the platform level. |
| **Auth Required** | N/A |
| **Data Available** | N/A |
| **Data NOT Available** | Everything -- parental controls do not exist |
| **Complexity** | N/A |
| **Risk Level** | N/A |
| **Latency** | N/A |
| **Recommendation** | Return `UnsupportedOperationError`. This is the correct answer -- the platform does not support parental controls. Phosra's value is providing the parental control layer that Claude lacks, entirely through external mechanisms (extension, device-level, network-level). Document this clearly in the parent-facing UI. |

### 9. `deleteConversations(conversationIds)`

| Aspect | Detail |
|---|---|
| **Implementation** | Not reliably possible from a parent context |
| **API Accessibility Verdict** | Level 0 -- No API for consumer conversation deletion; no parent access |
| **Approach** | Claude allows users to delete their own conversations from the sidebar. However: (a) There is no parent account to initiate deletion, (b) No API exists for conversation deletion, (c) Playwright automation of the child's account would require the child's credentials and violate Consumer Terms, (d) Anthropic's anti-automation enforcement would likely block Playwright-based deletion. The browser extension could theoretically trigger deletion by simulating clicks on the delete button in the child's active session, but this crosses from monitoring to active account manipulation -- a significant escalation in risk. |
| **API Alternative** | None. GDPR data deletion requests can be made by the account holder but not by a third party. |
| **Auth Required** | Child's own session (if attempted -- high risk) |
| **Data Available** | N/A |
| **Data NOT Available** | Remote conversation deletion, parent-initiated deletion, selective message deletion |
| **Complexity** | High -- Would require child's session + active DOM manipulation + anti-automation evasion |
| **Risk Level** | Very High -- Active account manipulation via extension is detectable and violates ToS |
| **Latency** | N/A |
| **Recommendation** | Do NOT implement automated conversation deletion. Instead: (a) Educate parents about Claude's Incognito Chat mode, (b) Provide a "suggest deletion" notification to the child via Phosra, (c) Guide parents on how to request account deletion from Anthropic if needed. Mark as `UnsupportedOperationError` in the adapter. |

### 10. `getActiveSession() -> SessionInfo`

| Aspect | Detail |
|---|---|
| **Implementation** | Browser extension (real-time session detection) |
| **API Accessibility Verdict** | Level 0 -- No API for consumer session status |
| **Approach** | The browser extension detects whether the child is actively using Claude by monitoring: (a) tab focus on claude.ai, (b) DOM state indicating an active conversation (message input focused, streaming response in progress), (c) last user message timestamp, (d) Incognito Chat mode indicator. The extension reports session status to Phosra in real-time via heartbeat messages (every 30-60 seconds). Session info includes: active (yes/no), conversation visible (yes/no), duration, messages in current session, Incognito mode active (yes/no). |
| **API Alternative** | None for consumer session status. |
| **Auth Required** | None -- extension runs in the browser with the child's existing session |
| **Data Available** | Active tab status, conversation visibility, message input activity, streaming response detection, session duration (extension-tracked), Incognito Chat mode |
| **Data NOT Available** | Mobile app session status, desktop Electron app session status (unless extension covers it), multi-device session detection, voice mode status (N/A -- no voice mode on consumer) |
| **Complexity** | Low -- Tab activity and DOM monitoring are basic extension capabilities |
| **Risk Level** | Low -- Passive read-only monitoring is the lowest-risk extension operation |
| **Latency** | Real-time (extension heartbeat every 30-60 seconds) |
| **Recommendation** | Implement as P0. Session detection powers time limits, break reminders, and parent "currently active" indicators. This is the most reliable extension capability. |

---

## Recommended Architecture Diagram

```
+-----------------------------------------------------------------+
|                        Phosra Platform                           |
|                                                                   |
|  +----------------+  +--------------+  +---------------------+  |
|  | Session Manager|  | Content      |  | Notification Engine |  |
|  | (Extension     |  | Classifier   |  | (Parent Alerts)     |  |
|  |  heartbeats)   |  | (Messages    |  |                     |  |
|  |                |  |  API/Haiku)  |  |                     |  |
|  +-------+--------+  +------+-------+  +---------+-----------+  |
|          |                  |                     |              |
|  +-------v--------+  +-----v--------+  +---------v-----------+  |
|  | Time/Message   |  | Topic/Safety |  | Email / Push /      |  |
|  | Limit Engine   |  | Classification|  | SMS Alerts          |  |
|  +-------+--------+  +--------------+  +---------+-----------+  |
|          |                                        |              |
+----------+----------------------------------------+--------------+
           |                                        |
     +-----v------+                           +-----v------+
     | Browser    |                           | Parent     |
     | Extension  |                           | Dashboard  |
     | (claude.ai)|                           | (Phosra)   |
     +-----+------+                           +------------+
           |
     +-----v------+     +-------------+     +-------------+
     |  claude.ai  |    | DNS/Router  |     | Device-Level|
     | (consumer)  |    | (Network)   |     | (Screen     |
     +-------------+    +-------------+     |  Time/etc.) |
                                             +-------------+
```

---

## Real-Time Monitoring Strategy

### Monitoring Pipeline

1. **Extension captures message text** as it appears in the DOM (MutationObserver on chat container)
2. **Local keyword check** in the extension for high-priority keywords (self-harm, explicit terms) -- zero latency
3. **Text sent to Phosra backend** via authenticated API call
4. **Backend routes to Claude Messages API (Haiku)** for content classification -- ~500ms latency
5. **Classification results evaluated against parent's alert thresholds**
6. **Parent notification triggered** if threshold exceeded -- push notification + email

### Polling/Monitoring Frequencies

| Data Point | Frequency | Method |
|---|---|---|
| Session heartbeat | Every 30 seconds | Extension -> Phosra API |
| Message capture | Real-time (per message) | Extension MutationObserver |
| Content classification | Per message (batched if high volume) | Phosra -> Claude Messages API |
| Session duration update | Every 60 seconds | Extension -> Phosra API |
| Limit enforcement check | Per message + per minute | Extension local + Phosra API |

### Failure Modes

| Failure | Detection | Fallback |
|---|---|---|
| Extension disabled/removed | Missing heartbeat > 5 minutes | Parent alert: "Claude monitoring inactive" + network-level controls remain active |
| claude.ai DOM changes | Extension error log | Phosra engineering update; parent alerted that monitoring may be degraded |
| Messages API unavailable | API error response | Local keyword detection in extension only (degraded classification) |
| Network controls bypassed (VPN) | Extension still reports if active | Extension monitoring continues; network controls ineffective |
| Mobile app usage | No heartbeat from extension | Parent notification: "Claude usage detected outside monitored browsers" (device-level detection) |

---

## Development Effort Estimate

| Component | Effort (days) | Priority |
|---|---|---|
| Browser extension (Chrome) - message/time tracking | 10-15 | P0 |
| Browser extension - DOM observer for claude.ai | 5-8 | P0 |
| Network-level DNS enforcement integration | 5-8 | P0 |
| Extension heartbeat + Phosra API endpoints | 3-5 | P0 |
| Claude Messages API content classification pipeline | 5-8 | P0 |
| Parent notification pipeline (email/push/SMS) | 5-8 | P0 |
| Extension - break reminder injection | 3-5 | P1 |
| Extension - blocking overlay for limits | 3-5 | P1 |
| Extension - Incognito Chat detection | 2-3 | P1 |
| Parent dashboard (Claude-specific analytics) | 8-12 | P1 |
| Device-level setup guide (Screen Time/Family Link) | 3-5 | P1 |
| Firefox/Edge extension ports | 5-8 | P2 |
| Extension - homework detection NLP | 8-12 | P2 |
| Extension - emotional distress detection NLP | 8-12 | P2 |
| **Total** | **75-120 days** | |

---

## Detection Vectors and Mitigations

| Vector | Risk Level | Mitigation |
|---|---|---|
| Anthropic detects browser extension DOM monitoring | Medium | Design extension as purely passive (read-only MutationObserver). Do not modify DOM unless injecting blocking overlay. Avoid intercepting API calls. |
| Cloudflare blocks extension network requests | Low | Extension-to-Phosra communication uses Phosra's own API endpoint, not claude.ai. Extension does not make requests to Anthropic servers beyond normal page operation. |
| Claude.ai UI update breaks DOM selectors | High | Versioned selectors with fallback patterns. Automated testing against claude.ai. Rapid update deployment process (< 24 hours). |
| Child disables browser extension | Medium | Phosra detects missing heartbeat within 5 minutes. Parent alerted. Network-level controls remain active. Device-level controls remain active. |
| Child uses Electron desktop app | High | Browser extension may not cover Electron app. Device-level controls (Screen Time app limits) are the fallback. |
| Child uses mobile app | High | Browser extension cannot monitor mobile. Device-level controls (Screen Time/Family Link) are the only enforcement mechanism. |
| Child uses third-party Claude wrapper (HIX AI, etc.) | High | Network-level DNS blocking of known wrapper domains. Phosra maintains wrapper domain list. |
| Child uses VPN to bypass network controls | Medium | Extension monitoring continues (VPN does not affect browser extension). Device-level controls remain active. |

---

## Terms of Service Summary

### Key Clauses

| Clause | Text/Summary | Implication for Phosra |
|---|---|---|
| **Consumer Terms Section 3.7** | Prohibits automated access, scraping, and use of consumer OAuth tokens in third-party tools | Phosra CANNOT use Playwright to automate the child's Claude account. Phosra CANNOT use the child's session credentials. |
| **Feb 2026 Clarification** | "Using OAuth tokens obtained through Claude Free, Pro, or Max accounts in any other product, tool, or service -- including the Agent SDK -- is not permitted" | Even indirect authentication via Anthropic's own SDK is prohibited for consumer accounts |
| **Technical Enforcement (Jan 2026)** | Anthropic blocked third-party harnesses from impersonating official clients | Automation attempts may be actively detected and blocked |
| **API Terms** | Standard developer API terms allowing programmatic access via API keys | Phosra CAN use its own API key for the Messages API (content classification). This is fully permitted. |
| **Privacy Policy** | Data not sold to third parties; 30-day retention for opted-out users | Phosra must handle any captured conversation data in compliance with both Anthropic's and its own privacy policy |

### Bottom Line

Phosra's Claude adapter MUST NOT:
- Authenticate as the child's Claude account
- Use Playwright to automate claude.ai
- Use the child's session cookies or OAuth tokens
- Make API calls using the child's credentials
- Intercept or modify API calls between the child's browser and Anthropic's servers

Phosra's Claude adapter CAN:
- Monitor the child's claude.ai usage via a browser extension (read-only DOM observation)
- Use Phosra's own API key for content classification via Claude Messages API
- Enforce time/message limits via extension overlays and network-level controls
- Block claude.ai domains via DNS/network controls
- Provide parent analytics based on extension-captured data

---

## Verdict

Claude is the most difficult Tier 1 platform for Phosra to integrate with, but paradoxically the one where Phosra adds the most value. The platform has zero parental controls, zero age-graduated features, and the most hostile third-party integration environment. Every safety control must be provided by Phosra from the outside.

The adapter is necessarily external-only: browser extension for monitoring, device-level for enforcement, network-level for blocking, and Phosra's own AI for content classification. This approach is less capable than the ChatGPT adapter (which can at least sync with OpenAI's parent dashboard via Playwright) but still provides meaningful protection.

**Overall Adapter Score: 3/10** -- reflecting the fundamental impossibility of platform integration combined with the value of external monitoring and enforcement.

**Recommended next steps:**
1. Build a Chrome extension prototype for passive DOM monitoring on claude.ai
2. Test Claude Messages API (Haiku) for content classification accuracy and cost
3. Document device-level setup guides for Screen Time/Family Link with Claude-specific instructions
4. Build network-level DNS blocking integration for claude.ai domains
5. Monitor Anthropic's announcements for any parental control features or teen account tier (none expected in near term)
6. Assess Electron desktop app for extension compatibility
7. Maintain a list of third-party Claude wrapper domains for network-level blocking
