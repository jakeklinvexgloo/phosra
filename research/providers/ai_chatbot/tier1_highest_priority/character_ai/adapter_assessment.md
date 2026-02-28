# Character.AI -- Adapter Assessment

**Platform:** Character.AI (Character Technologies, Inc.)
**Assessment Date:** 2026-02-27
**Framework Version:** 1.0
**API Accessibility Level:** 0 -- Walled Garden
**Phosra Enforcement Level:** Browser-Automated (writes) + Conversation-Layer (monitoring)

> **Summary:** Character.AI has no public API, no developer program, and explicitly prohibits all forms of automation in its Terms of Service. Every adapter method must be implemented via either Playwright browser automation (for write operations and settings) or the reverse-engineered unofficial REST/WebSocket internal API (for read operations, with higher reliability but equal ToS risk). The highest-value Phosra capabilities on this platform are conversation-layer monitoring -- crisis detection, emotional dependency monitoring, and PII detection -- which require transcript access but not platform-level configuration capability.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                    PHOSRA CHARACTER.AI ADAPTER                      │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────┐                       │
│  │  SESSION MANAGER  │    │   CREDENTIAL STORE│                      │
│  │                  │    │                  │                        │
│  │ - Login via      │◄───│ - Email (enc.)   │                       │
│  │   Playwright     │    │ - Password (AES) │                       │
│  │ - Token harvest  │    │ - Session token  │                       │
│  │ - Token refresh  │    │   (rotated)      │                       │
│  └────────┬─────────┘    └──────────────────┘                       │
│           │                                                          │
│           ▼                                                          │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │                    READ LAYER                             │       │
│  │                                                          │       │
│  │  Unofficial REST API (session token auth)                │       │
│  │  ├── GET /chat/history/{chat_id}   → transcript          │       │
│  │  ├── GET /chat/conversations       → conversation list   │       │
│  │  ├── GET /chat/characters          → character list      │       │
│  │  └── GET /user/settings            → account settings    │       │
│  │                                                          │       │
│  │  Polling interval: 60 seconds (conversation monitoring)  │       │
│  └──────────────────────────────────────────────────────────┘       │
│           │                                                          │
│           ▼                                                          │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │                   WRITE LAYER                             │       │
│  │                                                          │       │
│  │  Playwright Browser Automation (Chromium)                │       │
│  │  ├── account settings page         → time/safety changes │       │
│  │  ├── conversation history page     → delete conversations│       │
│  │  ├── parental insights settings    → add parent email    │       │
│  │  └── memory settings per-chat     → clear memory fields  │       │
│  └──────────────────────────────────────────────────────────┘       │
│           │                                                          │
│           ▼                                                          │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │               CONVERSATION-LAYER MONITOR                  │       │
│  │                                                          │       │
│  │  Phosra NLP Engine (runs server-side on Phosra infra)    │       │
│  │  ├── Crisis detection (self-harm, suicide)               │       │
│  │  ├── Emotional dependency pattern analysis               │       │
│  │  ├── Romantic/sexual roleplay detection                  │       │
│  │  ├── PII detection (name, address, school, phone)        │       │
│  │  ├── Distress indicator analysis                         │       │
│  │  └── Academic integrity detection                        │       │
│  │                                                          │       │
│  │  Output → Parent alert queue → Push notification         │       │
│  └──────────────────────────────────────────────────────────┘       │
│           │                                                          │
│           ▼                                                          │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │                  REAL-TIME LAYER                          │       │
│  │  (Future state -- not in initial implementation)         │       │
│  │                                                          │       │
│  │  WebSocket interception or polling at 15-second          │       │
│  │  intervals for active session detection                  │       │
│  └──────────────────────────────────────────────────────────┘       │
│                                                                      │
└────────────────────────────────────────────────────────────────────┘
```

---

## Method Assessments

### 1. `authenticate(credentials) -> Session`

| Aspect | Detail |
|--------|--------|
| **Implementation** | Playwright (primary) + Unofficial API token harvest |
| **API Accessibility Verdict** | Level 0 -- Walled Garden. No public auth API. |
| **Approach** | Launch Playwright/Chromium browser in headless mode. Navigate to `character.ai`. Fill email and password fields. Submit login form. On success, extract the session token from browser cookies or local storage (`accessToken` or equivalent). Store token for subsequent unofficial API calls. Fall back to full Playwright for operations where the token alone is insufficient. |
| **API Alternative** | None official. The unofficial PyCharacterAI library uses the same approach programmatically via curl-cffi to extract and store the session token. |
| **Auth Required** | Email + password (or Google OAuth, which is harder to automate). Recommend email/password for automation. |
| **Data Available** | Session token. User account ID. Subscription tier (c.ai+). |
| **Data NOT Available** | MFA codes (no MFA implemented; less of an issue). Google OAuth token (avoid). |
| **Complexity** | Medium -- Standard Playwright login, but Cloudflare bot detection may require additional fingerprint management (user-agent, viewport, cursor simulation). |
| **Risk Level** | Medium -- Cloudflare detection is the primary risk. Using `curl-cffi` or Playwright with realistic browser fingerprinting mitigates this. Repeated rapid logins from the same IP trigger flags. |
| **Latency** | 3-8 seconds for initial Playwright login. Sub-second for subsequent unofficial API calls using the stored token. |
| **Recommendation** | Implement with Playwright using a persistent browser context (avoids re-login on every session). Rotate sessions proactively every 7 days or on token expiry. Store the session token in Phosra's credential vault for API reuse. Cache the browser state (cookies + localStorage) to avoid full Playwright login overhead on each use. |

---

### 2. `getAccountSettings() -> SafetySettings`

| Aspect | Detail |
|--------|--------|
| **Implementation** | Unofficial API (REST) + Playwright fallback |
| **API Accessibility Verdict** | Level 0 -- Walled Garden. No public settings API. Internal REST endpoint accessible with session token. |
| **Approach** | With session token in hand, call the internal user settings endpoint (e.g., `GET /chat/user/` or equivalent discovered via the PyCharacterAI library). Parse response JSON for account details: age tier, subscription status, notification settings. For settings not exposed via the internal API, navigate to `character.ai/settings` via Playwright and scrape the current state of relevant settings fields. |
| **API Alternative** | Unofficial REST endpoint (discovered via reverse engineering). Subject to schema changes. |
| **Auth Required** | Session token (Bearer header) |
| **Data Available** | Account age tier (teen vs. adult), subscription status (c.ai+ vs. free), notification preferences (limited), account creation date. |
| **Data NOT Available** | Time limit setting (not a configurable UI field on adult accounts), content safety level (not a per-account configurable setting -- platform-controlled by age tier), character interaction history (separate endpoint), memory contents. |
| **Complexity** | Low -- Single API call if the endpoint is identified. Medium if requiring Playwright scraping for some fields. |
| **Risk Level** | Low to Medium -- Reading settings is less suspicious than modifying them. Session token reuse is standard. |
| **Latency** | Sub-second for API call. 2-5 seconds for Playwright scrape. |
| **Recommendation** | Implement the internal API read as the primary method. Schedule a full settings sync once per day (not on every Phosra operation). Cache the result and compare against expected state to detect unauthorized changes (e.g., teen disabling Parental Insights). Alert parent if settings deviate from Phosra-configured baseline. |

---

### 3. `setContentSafetyLevel(level)`

| Aspect | Detail |
|--------|--------|
| **Implementation** | Not Supported (for substantive changes) + Playwright (for limited account-level settings) |
| **API Accessibility Verdict** | Level 0 -- Not possible for meaningful content safety configuration. |
| **Approach** | Character.AI's content safety level is determined by the account's age tier and by per-character settings controlled by the character creator -- neither is externally configurable by Phosra. For adult accounts, there is no "safety level" slider that Phosra can set. For teen accounts (pre-ban), the safety level was platform-fixed. Phosra cannot configure content safety to be stricter than the platform default for a given account type. The only actionable lever is to ensure the account remains classified in the most restrictive tier (i.e., the account is flagged as a teen account rather than an adult account). |
| **API Alternative** | None. This operation is not possible via any API path. |
| **Auth Required** | N/A |
| **Data Available** | N/A |
| **Data NOT Available** | Content safety configuration is entirely platform-controlled by account type. |
| **Complexity** | N/A -- Implementation should return `UnsupportedOperationError` with explanation. |
| **Risk Level** | N/A |
| **Latency** | N/A |
| **Recommendation** | Return `UnsupportedOperationError`. Document clearly to parents that Character.AI's content safety is determined by account age classification and cannot be increased by Phosra. For adult accounts used by minors (false DOB), Phosra's conversation-layer monitoring is the only content safety mechanism available. The `ai_explicit_content_filter` and related categories should be mapped to Phosra's own conversation-layer enforcement for this platform. |

---

### 4. `setConversationLimits(config)`

| Aspect | Detail |
|--------|--------|
| **Implementation** | Not Possible (natively) + Device-Level (as fallback) + Phosra Session Monitor |
| **API Accessibility Verdict** | Level 0 -- No native configurable time limits for adult accounts. Teen accounts had fixed 1-hour limits (not configurable by third parties). |
| **Approach** | Three-tier enforcement strategy: (A) **Teen account (pre-ban):** Platform-native 1-hour daily limit applies automatically. Phosra cannot change this value, but can verify it is active by checking account age tier. (B) **Adult account (used by minor):** No platform-native limit exists. Phosra must implement Phosra-managed session monitoring: poll for active conversation at intervals; when total active time exceeds the configured limit, execute the enforcement action (options: lock the device via MDM integration, block character.ai via router/DNS, send parent alert, or send child notification). (C) **Quiet hours:** Similar enforcement -- DNS or device-level blocking during restricted hours is the only reliable mechanism for adult accounts. |
| **API Alternative** | None. No time limit configuration API exists. |
| **Auth Required** | For session monitoring: session token for polling active session status. For enforcement: device management or DNS integration. |
| **Data Available** | Active session detection via conversation recency polling. |
| **Data NOT Available** | Real-time session duration (requires polling reconstruction, not a native metric). |
| **Complexity** | High -- Requires Phosra-managed session tracking, cross-platform time aggregation, and an enforcement mechanism (device-level or notification). |
| **Risk Level** | Low for monitoring. Medium for enforcement (device-level integration required). |
| **Latency** | Detection latency depends on polling interval. At 60-second intervals: up to 1 minute to detect a limit breach. At 15-second intervals: better granularity but more API calls. |
| **Recommendation** | Implement as a Phosra Session Monitor: poll the conversation recency endpoint every 60 seconds during Phosra's monitoring window. Maintain a per-child, per-platform cumulative usage counter in Phosra's database. When daily limit is reached, send parent alert AND attempt device-level enforcement (if device integration is configured). For quiet hours, implement DNS-based blocking (via Phosra router integration or Circle-compatible API) as the most reliable mechanism. Document to parents that Phosra-managed limits on Character.AI adult accounts require device/network integration to enforce hard cutoffs. |

---

### 5. `getConversationHistory(dateRange) -> Conversation[]`

| Aspect | Detail |
|--------|--------|
| **Implementation** | Unofficial API (REST) -- primary method |
| **API Accessibility Verdict** | Level 0 -- No public API. Internal REST endpoint accessible with session token. Moderate ToS risk. |
| **Approach** | Using the stored session token, call the internal conversation history endpoint. The PyCharacterAI library documents a `get_history()` method that accesses chat history for a given character conversation. Paginate through all conversations within the date range. Parse the response JSON for message content, timestamps, character name, and turn direction (user vs. AI). Return structured `Conversation[]` objects to Phosra's NLP monitoring layer for analysis. |
| **API Alternative** | Playwright could scrape the conversation history UI as a fallback, but the unofficial API is more reliable and faster for bulk retrieval. |
| **Auth Required** | Session token (Bearer header) |
| **Data Available** | Full conversation text (user messages and AI responses), timestamps per message, character name, chat ID, conversation metadata. |
| **Data NOT Available** | Real-time streaming messages (the API returns completed messages; in-progress AI responses would require WebSocket monitoring). Deleted conversations (once deleted by the user, they are gone). |
| **Complexity** | Medium -- The API endpoint exists and is used by unofficial libraries. Pagination and schema stability are the primary complexities. |
| **Risk Level** | Medium -- Accessing conversation history is less visible than writing operations, but still requires a valid session and hits internal endpoints. Rate limiting is a risk for large history retrievals. |
| **Latency** | Sub-second to a few seconds depending on conversation volume. Pagination may add latency for large histories. |
| **Recommendation** | Implement conversation history retrieval as the foundation of Phosra's Character.AI monitoring stack. Schedule incremental retrieval every 60 minutes during active hours, processing new messages since the last check. Store retrieved conversation metadata (not full text) in Phosra's database for pattern analysis. Full conversation text should be processed by Phosra's NLP engine and discarded after analysis -- avoid storing raw conversation text to minimize Phosra's own data retention exposure. Alert thresholds should be configurable per family. |

---

### 6. `getUsageAnalytics(dateRange) -> UsageStats`

| Aspect | Detail |
|--------|--------|
| **Implementation** | Phosra-Derived (from conversation history polling) + Parental Insights email parsing |
| **API Accessibility Verdict** | Level 0 -- No analytics API. Usage data must be reconstructed from conversation history. |
| **Approach** | Two-track approach: (A) **Phosra-derived analytics:** Reconstruct usage from the conversation history retrieved via Method 5. Calculate time-on-platform from message timestamp ranges; message count; active days; character interaction frequency. Generate Phosra's own usage report from this derived data. (B) **Parental Insights parsing:** If the teen has opted into Parental Insights sharing, the parent receives a weekly email from Character.AI with time-on-platform and top characters. Phosra can parse this email (if the parent forwards it to a Phosra monitoring address, or if Phosra has email API access) for supplemental data. Track trend over time to detect increasing usage or concerning character engagement patterns. |
| **API Alternative** | No analytics endpoint exists in the unofficial library documentation. |
| **Auth Required** | Session token (for conversation history retrieval). Email access (for Parental Insights parsing). |
| **Data Available** | Message count by day, active hours (reconstructed from timestamps), character interaction frequency, topic indicators (from conversation content NLP). |
| **Data NOT Available** | Platform's own time-on-platform metric (session duration tracking), in-app purchases/Charms activity, precise session start/end times (only inferred from message gaps). |
| **Complexity** | Medium -- The analytics must be derived from raw data rather than a native analytics endpoint. |
| **Risk Level** | Low to Medium -- Same risk as conversation history retrieval (Method 5). |
| **Latency** | Report generation: seconds (from cached conversation history data). |
| **Recommendation** | Generate Phosra's own usage analytics from conversation history data rather than relying on Parental Insights (which is teen-controlled and limited to weekly summaries). The Phosra usage report can be more granular: hourly activity heatmaps, character category analysis, usage trend over 30/60/90 days. Present this in the Phosra parent dashboard as the primary usage visibility for Character.AI. |

---

### 7. `toggleFeature(feature, enabled)`

| Aspect | Detail |
|--------|--------|
| **Implementation** | Playwright (for the limited settings available) + Static Return (for non-existent settings) |
| **API Accessibility Verdict** | Level 0 -- No feature toggle API. Limited feature toggles exist in the account settings UI. |
| **Approach** | Navigate via Playwright to `character.ai/settings` (or equivalent). Identify available feature toggles. For Character.AI, the relevant toggleable features are: notification settings (push notifications on/off), language preference, and memory controls (per-chat). Toggle the relevant setting by clicking the UI element. Verify the setting persisted by re-reading the settings page. For features that do not have a UI toggle (e.g., voice input -- not currently available; image generation -- not a general feature), return `UnsupportedOperationError`. |
| **API Alternative** | None official. Unofficial API may support some settings writes but these are less documented than reads. |
| **Auth Required** | Session cookie + Playwright browser session |
| **Data Available** | Can disable push notifications (critical for reducing "character misses you" retention manipulation). Can manage memory per-chat. |
| **Data NOT Available** | Cannot disable character chat access (only platform-level bans apply). Cannot toggle NSFW filter on/off (platform-controlled). Cannot restrict character categories. |
| **Complexity** | Medium -- Playwright UI navigation for settings pages. Risk of UI changes breaking selectors. |
| **Risk Level** | Medium -- Writing to settings is more detectable than reads. Changes persist in the account. |
| **Latency** | 3-8 seconds per toggle operation via Playwright. |
| **Recommendation** | Priority toggles to implement: (1) **Disable push notifications** -- eliminates the "character misses you" manipulation mechanic that reinforces emotional dependency. (2) **Clear memory fields** -- reduces the AI's ability to maintain the illusion of remembering the child across sessions. (3) **Enable Parental Insights sharing** (from teen account, if applicable) -- automates the opt-in step that teens may not take voluntarily. All three are high-value for child safety and achievable via Playwright. Implement with selector-based UI detection and periodic verification (weekly settings check). |

---

### 8. `setParentalControls(config)`

| Aspect | Detail |
|--------|--------|
| **Implementation** | Playwright (limited) + Static Return (for non-existent controls) |
| **API Accessibility Verdict** | Level 0 -- Parental controls are non-existent on adult accounts. The Parental Insights feature exists but is teen-initiated and provides no configuration capability to parents. |
| **Approach** | For **teen accounts** that have opted into Parental Insights: Phosra can automate the initial opt-in from the teen account settings page (navigate to settings → parental insights → enter parent email). This is a one-time setup action. Beyond initial setup, there is nothing for Phosra to configure at the platform level -- all parental controls are read-only statistical summaries. For **adult accounts used by minors:** No parental controls exist. Phosra must operate entirely through its own monitoring and enforcement stack. Return partial results: `{ success: true, configuredItems: ['parental_insights_enabled'], unsupportedItems: ['content_restrictions', 'time_limits', 'character_blocks', 'transcript_access'] }` |
| **API Alternative** | None. |
| **Auth Required** | Teen account session cookie + Playwright |
| **Data Available** | Can initiate Parental Insights email sharing from teen account settings. |
| **Data NOT Available** | Cannot configure any content controls, time limits, character restrictions, or alert thresholds from the parent side. |
| **Complexity** | Low for Parental Insights setup. N/A for everything else. |
| **Risk Level** | Low -- Account settings navigation is standard user behavior. |
| **Latency** | 3-5 seconds for Playwright settings navigation. |
| **Recommendation** | Implement the Parental Insights auto-setup as a first-run action when Phosra is connected to a Character.AI teen account. This gives parents the platform's native (limited) visibility without requiring them to ask their teen to configure it. Clearly communicate to parents via the Phosra dashboard that Character.AI's native parental controls are limited to a weekly time/character summary and that Phosra's conversation-layer monitoring provides the substantive visibility and alerts they need. |

---

### 9. `deleteConversations(conversationIds)`

| Aspect | Detail |
|--------|--------|
| **Implementation** | Playwright (primary) + Unofficial API (if DELETE endpoint exists) |
| **API Accessibility Verdict** | Level 0 -- No public delete API. UI deletion available via Playwright. |
| **Approach** | Navigate to the conversation history page on `character.ai` via Playwright. For each conversation in the `conversationIds` list, locate the conversation entry and click the delete/remove option (via the conversation menu or settings). Confirm deletion in any dialog that appears. Verify deletion by checking that the conversation no longer appears in the history. For bulk deletion (e.g., Phosra's automated weekly history purge), implement a full history clear option if the platform provides one (check for a "clear all history" option). |
| **API Alternative** | Unofficial API libraries may expose a delete endpoint (e.g., `delete_chat()`); if confirmed, use as the primary method for lower latency. |
| **Auth Required** | Session cookie + Playwright browser session. Password confirmation may be required for bulk deletion. |
| **Data Available** | Can delete individual conversations or groups of conversations by character. |
| **Data NOT Available** | Cannot delete conversations from the server-side backup (30-day buffer remains); cannot delete data used for model training (if applicable). |
| **Complexity** | Medium -- Playwright UI navigation for each delete operation; potential for UI structure changes. Bulk deletion may be higher complexity if no "clear all" button exists. |
| **Risk Level** | Medium -- Delete operations are more destructive and potentially more flagged than reads. Rapid sequential deletes may trigger rate limiting. |
| **Latency** | 2-5 seconds per conversation deletion via Playwright. Bulk deletion (10+ conversations) may take 30-120 seconds. |
| **Recommendation** | Implement conversation deletion as a weekly scheduled operation (parents can configure "clear conversations older than X days"). This implements a de facto rolling retention policy that the platform does not natively offer. Pace deletion operations at 1 per 3 seconds to avoid rate limit triggers. Confirm each deletion before proceeding to the next. Log all deletions to Phosra's audit trail with timestamps (for parent review). |

---

### 10. `getActiveSession() -> SessionInfo`

| Aspect | Detail |
|--------|--------|
| **Implementation** | Unofficial API (polling-based) |
| **API Accessibility Verdict** | Level 0 -- No real-time session API. Active session must be inferred from conversation recency polling. |
| **Approach** | Poll the conversation history endpoint at a configurable interval (recommended: 60 seconds during monitored hours, 5 minutes outside monitored hours). If a new message has been sent within the last 2 minutes, infer that a session is active. Return `SessionInfo { isActive: true, lastMessageAt: timestamp, characterName: string, chatId: string }`. When a session transitions from active to inactive (no new messages for 5+ minutes), record session end and update the cumulative usage counter. This forms the basis for Phosra's session-based time limit enforcement (Method 4). For true real-time detection: a WebSocket intercept approach could detect message transmission in progress, but this requires maintaining a persistent WebSocket connection, which is more complex and resource-intensive. |
| **API Alternative** | No native "is user online" API exists. WebSocket intercept is the only near-real-time alternative to polling. |
| **Auth Required** | Session token |
| **Data Available** | Last message timestamp (from conversation history). Inferred session start/end. Character being conversed with. |
| **Data NOT Available** | Exact session start time (only inferred from first message in a gap). Time spent reading (vs. typing). Whether the app is open but no messages are being sent. |
| **Complexity** | Medium -- Polling logic is straightforward. Accurate session boundary detection requires heuristic gap analysis. |
| **Risk Level** | Low to Medium -- Polling at moderate intervals (60 seconds) is unlikely to trigger rate limits if a genuine session token is used. |
| **Latency** | Up to 60 seconds to detect a new session (at 60-second poll interval). Up to 5 minutes to detect a session end. |
| **Recommendation** | Implement as the core of Phosra's usage tracking loop. Run as a background job per-monitored-child. Use the active session detection to: (1) track cumulative daily usage toward the configured time limit, (2) trigger conversation history retrieval 5 minutes after a session ends (to analyze the completed conversation), (3) send parent "session started" and "session ended" notifications if the parent has enabled activity notifications. The 60-second polling interval provides acceptable granularity without excessive API load. |

---

## Overall Architecture

### Recommended Implementation Architecture

```
Phosra Background Worker (per child account)
├── Session Manager
│   ├── Maintains authenticated browser context (Playwright/Chromium)
│   ├── Maintains session token for unofficial API calls
│   ├── Rotates session every 7 days or on 401 response
│   └── Rate limit tracking (avoid triggering Cloudflare)
│
├── Monitor Loop (runs every 60 seconds during monitored hours)
│   ├── getActiveSession() -- poll conversation recency
│   ├── If session active: increment usage counter
│   ├── If usage exceeds daily limit: trigger enforcement
│   └── If session ended: queue conversation analysis
│
├── Conversation Analysis Queue (async, post-session)
│   ├── getConversationHistory() -- retrieve new messages since last check
│   ├── NLP pipeline: crisis detection, emotional safety, PII, academic
│   ├── If alert triggered: send parent notification (push + email)
│   └── Store analysis result in Phosra DB (not raw transcript)
│
├── Settings Verifier (runs daily)
│   ├── getAccountSettings() -- verify account state
│   ├── Compare to Phosra-configured expected state
│   ├── If settings deviated: alert parent + re-apply via Playwright
│   └── Check Parental Insights status (teen accounts)
│
└── Maintenance Jobs (weekly)
    ├── deleteConversations() -- purge conversations per retention policy
    ├── toggleFeature(notifications, disabled) -- verify notifications off
    └── Session token refresh and credential rotation
```

### Real-Time Monitoring Strategy

**For Character.AI, true real-time monitoring is not achievable without ToS risk and engineering complexity.** The recommended strategy is near-real-time through polling:

| Monitoring Mode | Poll Interval | Latency to Detect | Notes |
|----------------|---------------|------------------|-------|
| Active session detection | 60 seconds | Up to 60 seconds | Acceptable for time limit enforcement |
| Crisis content detection | Post-session (5 min after end) | 5-10 minutes | Acceptable for most cases; real-time would require WebSocket |
| PII sharing detection | Post-session | 5-10 minutes | Acceptable |
| Emotional dependency detection | Daily analysis | Up to 24 hours | Pattern detection requires historical data; latency is acceptable |

**WebSocket intercept (future state):** A more ambitious implementation could intercept the WebSocket connection between the Playwright browser and the Character.AI server, reading message content in real time as it arrives. This would reduce crisis detection latency from 5-10 minutes to near-zero, but requires: (1) a persistent browser instance per child account, (2) WebSocket proxy setup within the Playwright context, (3) stream parsing of the AI response token stream. This is architecturally possible but resource-intensive. Recommend as a Phase 2 enhancement for high-risk accounts.

### Development Effort Estimate

| Component | Effort | Priority | Notes |
|-----------|--------|----------|-------|
| Session Manager (Playwright login + token harvest) | 3 days | P0 | Foundation for all other methods |
| Conversation history retrieval (unofficial API) | 2 days | P0 | Foundation for monitoring |
| Active session polling loop | 2 days | P0 | Foundation for time tracking |
| NLP pipeline integration (crisis, emotional, PII) | 5 days | P0 | Core value delivery |
| Parent alert system (push + email) | 2 days | P0 | Core value delivery |
| Playwright settings verifier | 2 days | P1 | Daily maintenance |
| Conversation deletion (weekly purge) | 1 day | P1 | Privacy compliance |
| Push notification disabler | 1 day | P1 | Retention manipulation mitigation |
| Memory field clearer | 1 day | P1 | Emotional safety mitigation |
| Usage analytics report generation | 2 days | P1 | Parent dashboard |
| Parental Insights auto-setup (teen accounts) | 1 day | P2 | One-time setup assist |
| WebSocket real-time intercept | 8 days | P2 | Future enhancement |
| **Total (P0+P1)** | **~22 days** | -- | Excluding WebSocket enhancement |

### Detection Vectors and Mitigations

| Vector | Risk Level | Mitigation |
|--------|-----------|-----------|
| Cloudflare TLS fingerprint detection | High | Use curl-cffi (mimics real browser TLS fingerprint); or use Playwright with real Chrome binary |
| Behavioral analysis (superhuman click timing) | Medium | Add randomized delays (50-300ms) between Playwright interactions; randomize mouse movement paths |
| IP reputation / rate limiting | Medium | Use residential proxy rotation or a stable dedicated IP with low request volume |
| Session token anomaly (multiple logins) | Medium | Maintain a single persistent session per child account; avoid parallel logins |
| User-Agent fingerprinting | Medium | Set a realistic User-Agent matching actual Chrome version |
| Login frequency detection | Low | Login once, cache session; re-login only on token expiry |
| API endpoint changes | High | Monitor unofficial library changelogs; implement endpoint health checks; alert on 404/401 responses |
| Account suspension | Medium | Keep automation minimal and paced; avoid bulk operations during Character.AI peak hours |

### Terms of Service Summary

| ToS Clause | Implication for Phosra |
|-----------|----------------------|
| "You will not engage in or use any data mining, robots, scraping or similar automated data gathering or extraction methods." | Phosra's conversation history retrieval and settings scraping are explicitly prohibited. ToS risk is real. |
| "You will not use unauthorized third-party tools, bots, automation, or scripts on the Services." | Playwright automation is prohibited. |
| Violation consequences: "suspension of access to the Services, termination of your User Account, and/or legal action" | Account suspension is the enforcement action, not legal action (legal action is reserved for egregious violations). Child safety monitoring is unlikely to trigger legal action. |
| No API clause or partner exception | No safe harbor within the ToS for child safety use cases. |

**Phosra's mitigation argument:** California SB 243 (AI Companion Safety Act, 2025) explicitly requires Character.AI to "monitor chats for signs of suicidal ideation and take steps to prevent users from harming themselves." Phosra's monitoring performs this legally required function. A legal argument exists that Phosra's access serves the purpose the law mandates. This is not a watertight defense against ToS enforcement, but it significantly raises the reputational and legal cost for Character.AI to block a child safety monitoring tool.

**Recommended approach:** Pursue a formal partnership request with Character.AI framed as a child safety compliance tool. The platform's legal exposure (multiple wrongful death lawsuits, FTC inquiry) creates strong incentive to cooperate with legitimate child safety tools. A partnership would convert the ToS risk from "violation" to "authorized access," eliminating it entirely.

---

*Assessment conducted February 2026. Sources: PyCharacterAI (GitHub), kramcat/CharacterAI (GitHub), C.AI Help Center, Character.AI Terms of Service, Character.AI Privacy Policy, Character.AI blog posts on safety features.*
