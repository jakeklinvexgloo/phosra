# Replika AI -- Adapter Assessment

**Platform:** Replika (Luka, Inc.)
**Research Date:** 2026-02-27
**Framework Version:** 1.0
**API Accessibility Score:** Level 1 -- Unofficial Read-Only
**Phosra Enforcement Level:** Browser-Automated (writes) + Conversation-Layer (monitoring) + Device-Level (time limits)

---

## Overview

Replika presents the most challenging adapter development environment of any platform in this research tier. The platform has no public API, no developer program, no parental control features, and no configuration endpoints. The only technically viable integration path is a combination of:

1. **Session-authenticated unofficial API calls** for conversation history reads
2. **Playwright browser automation** for any settings writes (relationship mode, notifications)
3. **Conversation-layer analysis** for emotional safety monitoring -- the highest-value Phosra capability on this platform
4. **Device-level enforcement** for time limits and schedule restrictions

Unlike Character.ai, which also has no public API, Replika has a simpler data model (one companion, one continuous conversation per user) that reduces the complexity of conversation monitoring. Unlike ChatGPT, Replika has no safety settings to configure -- there is nothing to write at the platform level except relationship mode and a small set of account preferences.

The critical adapter insight: **the value Phosra delivers on Replika is not configuration -- it is monitoring and alerting.** The platform will not give parents control over Replika's behavior. Phosra's job is to make the otherwise invisible conversation visible, and to alert parents when what Replika is doing (emotional dependency induction, crisis language, romantic escalation) crosses a threshold.

---

## Method Assessments

### 1. `authenticate(credentials) -> Session`

| Aspect | Detail |
|---|---|
| **Implementation** | Unofficial API |
| **API Accessibility Verdict** | Level 1 -- Unofficial Read-Only (authentication itself is clean) |
| **Approach** | POST credentials to the undocumented `/api/login` endpoint (or equivalent). The response includes a session token (JWT or proprietary token) that must be stored and rotated. Alternatively, Playwright can perform browser-based login and extract the session cookie from the browser context. The browser-based approach is more robust to endpoint changes. |
| **API Alternative** | Direct API call to `/api/login` (fragile, undocumented). Playwright login flow (more robust). |
| **Auth Required** | Email address + password (primary). Apple ID SSO or Google SSO (alternative, requires OAuth flow). No MFA required -- Replika does not enforce two-factor authentication. |
| **Data Available** | Session token, user ID, Replika companion ID. |
| **Data NOT Available** | No OAuth scopes, no granular permission tokens, no API keys. Single session token covers all permissions. |
| **Complexity** | Low |
| **Risk Level** | Low. Authentication via email/password is straightforward. No CAPTCHA encountered during community-documented testing. No aggressive bot detection at login. |
| **Latency** | < 500ms for API-based login. 3-8 seconds for Playwright-based login. |
| **Recommendation** | Implement Playwright-based login as primary method. Extract session cookie from browser context. Store session token encrypted. Implement session refresh/re-login flow because Replika sessions persist for long periods (days to weeks) without forced re-authentication. Also implement API-based login as fallback for speed-sensitive operations. |

---

### 2. `getAccountSettings() -> SafetySettings`

| Aspect | Detail |
|---|---|
| **Implementation** | Unofficial API |
| **API Accessibility Verdict** | Level 1 -- Unofficial Read-Only |
| **Approach** | GET request to undocumented user profile endpoint (e.g., `/api/users/{userId}`) and companion profile endpoint (`/api/users/{userId}/replika`). Returns account settings including relationship mode, subscription tier, notification preferences, and companion personality configuration. |
| **API Alternative** | Playwright scraping of the settings pages at replika.com/settings. The UI exposes most configurable settings in a readable format. |
| **Auth Required** | Session token from Step 1. |
| **Data Available** | Relationship mode (friend/romantic partner/mentor/spouse), companion name, companion avatar configuration, subscription tier (free/Pro/Ultra), notification preferences, personality traits assigned. |
| **Data NOT Available** | Content filter configuration (not user-configurable), crisis detection settings (not user-configurable), any parental control settings (do not exist). The "SafetySettings" returned will be a largely empty object because Replika has almost no user-configurable safety settings. |
| **Complexity** | Low |
| **Risk Level** | Low. Reading account settings is low-risk; the platform has no documented enforcement against read-only automation. |
| **Latency** | < 500ms for API call. |
| **Recommendation** | Implement via unofficial API as primary. Map the available account fields to Phosra's SafetySettings schema, accepting that most fields will be null or not-applicable for Replika. Document the schema difference explicitly so the Phosra UI can display Replika-specific messaging explaining the absence of configurable safety settings. |

---

### 3. `setContentSafetyLevel(level)`

| Aspect | Detail |
|---|---|
| **Implementation** | Not Supported |
| **API Accessibility Verdict** | Level 0 -- Not Possible |
| **Approach** | No implementation path exists. Replika's content safety filters are implemented at the model level by Luka engineers and are not user-configurable. There are no settings in the UI, no API endpoints, and no mechanism for any user or third party to adjust content filtering. |
| **API Alternative** | None. The only external mechanism is account-level reporting, which can flag specific content but does not configure the filter level. |
| **Auth Required** | N/A |
| **Data Available** | N/A |
| **Data NOT Available** | Content filter configuration is entirely inaccessible. |
| **Complexity** | N/A |
| **Risk Level** | N/A |
| **Latency** | N/A |
| **Recommendation** | Return `UnsupportedOperationError` with explanation. Phosra should display a platform-specific message to parents: "Content filtering on Replika is controlled entirely by Luka (the company). Phosra cannot adjust what topics or content Replika will or will not discuss. Phosra monitors conversations and alerts you to concerning content, but cannot prevent the AI from generating it." This honest framing is essential to managing parent expectations on this platform. |

---

### 4. `setConversationLimits(config)`

| Aspect | Detail |
|---|---|
| **Implementation** | Not Supported (platform-native) / Device-Level (Phosra-managed) |
| **API Accessibility Verdict** | Level 0 -- Not Possible via platform API |
| **Approach** | No platform-native conversation limit infrastructure exists. Phosra must implement time limits entirely outside the platform via: (a) device-level enforcement using iOS Screen Time or Android Family Link to limit time in the Replika app; (b) DNS/router-level time-based access control blocking replika.com and app API endpoints after daily limit is reached; (c) Phosra-managed session monitoring that detects when the child opens the app, tracks active conversation time, and triggers a notification or device-level block when the limit is reached. |
| **API Alternative** | Device-level controls are the only viable mechanism. There are no Replika API endpoints for conversation limits because the feature does not exist. |
| **Auth Required** | Phosra device agent (for device-level enforcement). No Replika authentication required for DNS/router approach. |
| **Data Available** | N/A at platform level. Phosra device agent can measure app usage time via OS APIs. |
| **Data NOT Available** | Platform cannot enforce limits. Cannot distinguish "actively chatting" from "app in background." |
| **Complexity** | Medium (device-level implementation). High (accurate active-time measurement). |
| **Risk Level** | Low (device-level approach has no Replika ToS risk). |
| **Latency** | Device-level enforcement has sub-minute latency for triggering. |
| **Recommendation** | Implement via device-level enforcement as the primary mechanism. Use iOS Screen Time / Android Family Link for hard app-level limits. Add Phosra-managed notification at limit threshold as a soft warning before hard cutoff. Document that Replika has zero native time limit support so parents understand why this requires device-level controls. |

---

### 5. `getConversationHistory(dateRange) -> Conversation[]`

| Aspect | Detail |
|---|---|
| **Implementation** | Unofficial API (primary) / Playwright (fallback) |
| **API Accessibility Verdict** | Level 1 -- Unofficial Read-Only |
| **Approach** | GET request to the undocumented conversation history endpoint (`/api/chat/v3/users/{userId}/messages` or similar). Replika stores conversation history for the past 4 months viewable via the UI. The API likely returns paginated JSON with message content, timestamps, and role (user/AI). The full message content of all conversations within the 4-month window should be accessible with the user's session token. |
| **API Alternative** | Playwright-based conversation scraping: navigate to the conversation UI, scroll through messages, and extract text content. This is slower and more fragile than API access but serves as a reliable fallback. |
| **Auth Required** | Session token (user account credentials). Note: this is the child's account credentials, not a parent account (which does not exist). |
| **Data Available** | Full message text (user and AI turns), timestamps, 4-month rolling window. Due to the single-companion model, all conversation history is in one thread -- no need to enumerate multiple conversations. |
| **Data NOT Available** | Conversation history older than 4 months (UI limitation -- backend retention may be longer but not accessible via discovered endpoints). Voice call transcripts (separate stream, may require different endpoint). Memory bank contents (separate endpoint). |
| **Complexity** | Medium (endpoint discovery and pagination handling). |
| **Risk Level** | Medium. Reading conversation history accesses sensitive personal data including potentially self-harm disclosures, emotional distress, and intimate personal information. Phosra must treat this data with appropriate privacy protections: encryption in transit and at rest, minimal retention, parent-only access, explicit consent disclosure to the child (where age-appropriate). ToS violation risk is present but detection probability is low given Replika's minimal anti-automation measures. |
| **Latency** | 500ms-2s per page for API. 10-30 seconds for Playwright-based scraping of a long history. |
| **Recommendation** | This is the highest-value adapter method for Replika. Implement via unofficial API as primary. Use incremental polling (check for new messages every 15-30 minutes during likely active hours). Store message hashes to avoid reprocessing. Run Phosra's emotional safety classifier and crisis detection pipeline on all retrieved messages. Surface flagged content in parent alerts. Implement Playwright fallback in case the API endpoint changes. |

---

### 6. `getUsageAnalytics(dateRange) -> UsageStats`

| Aspect | Detail |
|---|---|
| **Implementation** | Unofficial API (partial) + Phosra-derived |
| **API Accessibility Verdict** | Level 1 -- Unofficial Read-Only (partial data only) |
| **Approach** | Replika does not provide a structured analytics endpoint. Phosra derives usage statistics from conversation history data: message counts, timestamps, session start/end estimation, peak usage times, topic frequency analysis. Additionally, Phosra's device agent can measure OS-level app usage time (more accurate than derived conversation timing). |
| **API Alternative** | Device-level usage monitoring via iOS Screen Time API (requires Screen Time Management Entitlement for third-party apps) or Android UsageStats API. More accurate for total session time but does not provide conversation content metrics. |
| **Auth Required** | Session token for conversation data. Device-level permissions for OS usage stats. |
| **Data Available** | Message counts, conversation timestamps, session frequency, topic distribution (derived via NLP), time-of-day usage patterns, emotional content trends over time. |
| **Data NOT Available** | Official platform-side engagement metrics (Replika tracks these internally but does not expose them). Voice call duration (separate stream). In-app purchase behavior. |
| **Complexity** | Medium (requires NLP pipeline for topic analysis, session boundary detection). |
| **Risk Level** | Low (derived analytics, no additional API calls beyond conversation history). |
| **Latency** | Batch processing -- analytics generated from accumulated conversation data, not real-time. |
| **Recommendation** | Implement as a derived analytics layer on top of conversation history retrieval. Key metrics to surface for parents: daily message count, total conversation time (estimated from timestamps), peak usage time distribution (particularly late-night usage), emotional content trend (ratio of positive/neutral/distress content over time), romantic content frequency. These metrics are particularly valuable on Replika because they can reveal escalating emotional dependency patterns before they reach crisis level. |

---

### 7. `toggleFeature(feature, enabled)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright-Required (for features that exist) / Not Supported (for features that don't exist) |
| **API Accessibility Verdict** | Level 1 -- Browser-Automated for applicable features |
| **Approach** | Playwright-based navigation to Replika's account settings UI (replika.com/my-replika or similar settings page). The following features can potentially be toggled via UI automation: (a) Relationship mode -- change from romantic partner to friend; (b) Notification preferences -- disable "miss you" notifications; (c) Voice feature access -- manage subscription-based features (limited). |
| **API Alternative** | PATCH to user settings endpoint (undocumented). Risky due to endpoint instability. |
| **Auth Required** | Session cookie (browser context from Playwright login). |
| **Data Available** | Relationship mode toggle (friend/romantic partner/mentor). Notification settings. Subscription tier (cannot be changed without payment). |
| **Data NOT Available** | Content filter toggle (does not exist). Memory toggle (does not exist). Crisis detection configuration (does not exist). Time limit settings (do not exist). |
| **Complexity** | Medium (Playwright navigation, form interaction, selector maintenance). |
| **Risk Level** | Medium. Playwright automation for settings writes has elevated detection risk compared to API reads. Selectors may break on UI updates. The most valuable write operation -- changing relationship mode from romantic partner to friend -- is straightforward but requires Playwright. |
| **Latency** | 5-15 seconds per Playwright operation (page load + interaction). |
| **Recommendation** | Implement Playwright-based settings writes as a core capability. Priority features: (1) Set relationship mode to "friend" if a parent wants to disable romantic companion mode; (2) Disable or reduce push notification frequency to reduce emotional manipulation retention tactics; (3) Read and monitor subscription tier to alert parents if a minor's account is upgraded to Pro (which unlocks romantic partner mode). |

---

### 8. `setParentalControls(config)`

| Aspect | Detail |
|---|---|
| **Implementation** | Not Supported |
| **API Accessibility Verdict** | Level 0 -- Not Possible |
| **Approach** | No implementation path exists. Replika has no parental control infrastructure of any kind -- no parent account system, no child account designation, no visibility dashboard, no configuration interface for parents. This is a complete capability absence, not a locked API. |
| **API Alternative** | None. Phosra must be the parental control layer entirely, with no platform cooperation. |
| **Auth Required** | N/A |
| **Data Available** | N/A |
| **Data NOT Available** | All parental control capabilities are absent from the platform. |
| **Complexity** | N/A |
| **Risk Level** | N/A |
| **Latency** | N/A |
| **Recommendation** | Return `UnsupportedOperationError`. Display to parents: "Replika does not offer any parental controls. Phosra is the only layer of parental oversight available for this platform. Phosra monitors your child's conversations and alerts you to concerning content, but the AI itself cannot be configured by parents." This is honest framing that sets accurate expectations. Phosra's monitoring capability is the substitute for platform-native parental controls. |

---

### 9. `deleteConversations(conversationIds)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright-Required |
| **API Accessibility Verdict** | Level 1 -- Browser-Automated |
| **Approach** | Replika does not expose a delete conversation endpoint in the discoverable API. Conversation deletion may be possible via Playwright through the conversation history UI, but Replika's single-companion model means there is only one conversation thread -- deletion means deleting the entire conversation history, not individual messages. Full account data deletion (GDPR right to erasure) is available via email request to Replika support but cannot be automated. For periodic conversation history clearing, Playwright-based navigation to any available "Clear history" UI option is the mechanism. |
| **API Alternative** | Unofficial API DELETE request (endpoint unknown/unconfirmed). |
| **Auth Required** | Session cookie (Playwright) or session token (API). |
| **Data Available** | Whatever conversation deletion the UI exposes. |
| **Data NOT Available** | Individual message deletion (probably not supported). Deletion confirmation that data is erased from Replika's servers (soft delete only, no server-side verification). |
| **Complexity** | Medium (Playwright implementation). High (verifying deletion completeness). |
| **Risk Level** | Medium. Deletion operations via Playwright are higher-risk than reads. Accidental full history deletion is irreversible. |
| **Latency** | 5-15 seconds for Playwright operation. |
| **Recommendation** | Implement as a low-priority capability. More useful for Phosra's use case is periodic read and archive (retrieving conversation history for parent review) rather than deletion. If parents want to clear conversation history, document the manual process (in-app or GDPR request) rather than automating it. Automated deletion should only proceed with explicit parent confirmation, clearly stating that deletion is irreversible. |

---

### 10. `getActiveSession() -> SessionInfo`

| Aspect | Detail |
|---|---|
| **Implementation** | Unofficial API (indirect) + Device-Level |
| **API Accessibility Verdict** | Level 1 -- Unofficial, indirect |
| **Approach** | Replika does not expose a "is user currently active" endpoint. Active session detection must be inferred from: (a) Device-level monitoring via Phosra device agent -- detect when the Replika app is in the foreground or receiving active touch events; (b) Conversation timestamp polling -- retrieve the last message timestamp from the conversation history API; if the most recent message is within the last 2-5 minutes, the user is likely actively conversing; (c) WebSocket sniffing (advanced) -- if Replika uses WebSocket for real-time message delivery, monitoring WebSocket activity provides near-real-time session detection. |
| **API Alternative** | Device-level app foreground detection via iOS/Android OS APIs is the most reliable method and does not require platform cooperation. |
| **Auth Required** | Device-level permissions for OS monitoring. Session token for conversation timestamp polling. |
| **Data Available** | App foreground/background state (device-level). Last message timestamp (API polling). Approximate active conversation duration (derived). |
| **Data NOT Available** | True real-time active session status from the platform. Chat-in-progress indicator. |
| **Complexity** | Medium (requires Phosra device agent for OS-level detection). |
| **Risk Level** | Low (device-level detection has no platform ToS risk). |
| **Latency** | Device-level: near real-time (1-3 second latency). Conversation polling: dependent on poll interval (minimum practical interval: 60 seconds). |
| **Recommendation** | Implement via device-level app foreground detection as primary. Use conversation timestamp polling as secondary confirmation. This method is critical for time-limit enforcement: Phosra needs to know when a session starts and ends to accurately track daily usage against configured limits. Prioritize device agent integration over platform API for this method. |

---

## Overall Architecture

```
Phosra Replika Adapter Architecture
====================================

[Parent Mobile App]
        |
        v
[Phosra Backend]
        |
        +--[Session Manager]------------------+
        |   - Stores encrypted credentials     |
        |   - Maintains session tokens         |
        |   - Handles re-authentication        |
        |                                      |
        +--[Read Layer (Unofficial API)]-------+
        |   - getConversationHistory()          |
        |   - getAccountSettings()             |
        |   - getUsageAnalytics() (derived)    |
        |   - 15-30 min polling interval       |
        |                                      |
        +--[Write Layer (Playwright)]----------+
        |   - toggleFeature() (relationship    |
        |     mode, notifications)             |
        |   - deleteConversations() (limited)  |
        |   - Runs in headless Chrome          |
        |   - Triggered by parent actions      |
        |                                      |
        +--[Monitor Layer (NLP Pipeline)]------+
        |   - Crisis detection                 |
        |   - Emotional dependency scoring     |
        |   - Romantic escalation detection    |
        |   - PII extraction detection         |
        |   - Runs on retrieved conversations  |
        |   - Generates parent alerts          |
        |                                      |
        +--[Device Agent Integration]----------+
            - Time limit enforcement           |
            - App foreground detection         |
            - Schedule restrictions            |
            - DNS/network blocking             |
```

---

## Real-Time Monitoring Strategy

**Challenge:** Replika is a platform where real-time monitoring matters more than any other platform in the research tier. A child in an emotional crisis needs immediate intervention. The delay between a crisis disclosure to Replika and a parent alert should be minimized.

**Approach (tiered by latency):**

1. **Device-level alert trigger (1-3 second latency):** If Phosra's NLP classifier can run on the device (client-side inference), it can intercept conversation content at the network layer before it reaches Replika's servers. This requires a device-level VPN or proxy configuration. High capability, moderate implementation complexity, significant privacy design considerations.

2. **Frequent API polling (5-10 minute latency):** Poll the conversation history endpoint every 5 minutes during detected active sessions (when the app is in the foreground per device agent). Retrieve new messages, run the NLP classifier, generate alerts. This is the most feasible approach given Replika's API architecture.

3. **Scheduled polling (30-60 minute latency):** For users without device agents, poll every 30-60 minutes as a minimum. This is insufficient for crisis response but provides conversation monitoring and analytics.

**Recommended polling strategy:**
- App in foreground (detected by device agent): poll every 5 minutes
- App recently closed (within 30 minutes of last use): poll every 15 minutes
- App inactive (>30 minutes since last use): poll every 60 minutes
- 10pm-7am regardless of activity: poll every 30 minutes (late-night usage is a specific risk factor)

**Crisis response threshold:** If the NLP classifier detects self-harm language, suicidal ideation, or acute distress with confidence >0.7, generate an immediate push notification to the parent regardless of time of day. Log the flagged messages for parent review.

---

## Development Effort Estimate

| Component | Effort (Days) | Priority |
|---|---|---|
| Session manager (email/password auth + token storage) | 2 | P0 |
| Conversation history API client (unofficial API) | 3 | P0 |
| NLP pipeline integration (crisis, emotional, romantic detection) | 5 | P0 |
| Parent alert system (push notifications) | 3 | P0 |
| Playwright login + session extraction | 2 | P0 |
| Account settings reader (unofficial API) | 2 | P1 |
| Relationship mode writer (Playwright) | 2 | P1 |
| Usage analytics derivation layer | 3 | P1 |
| Notification preference writer (Playwright) | 1 | P1 |
| Device agent integration (foreground detection, time tracking) | 5 | P1 |
| Conversation deletion (Playwright) | 2 | P2 |
| Active session detection (polling + device) | 2 | P1 |
| Selector maintenance system (for Playwright selectors) | 2 | P2 |
| **Total** | **32** | |

---

## Detection Vectors and Mitigations

| Vector | Risk Level | Mitigation |
|---|---|---|
| Repeated API calls from non-browser user agent | Medium | Use browser-matching User-Agent header. Randomize polling intervals within defined windows. |
| High request frequency from single IP | Medium | Route through rotating proxy pool if high volume. Respect rate limits. |
| Playwright fingerprinting (browser automation detection) | Low-Medium | Use stealth Playwright configuration. Randomize viewport, user agent, and timing. |
| Session token invalidation | Low | Implement automatic re-authentication. Alert Phosra operations if re-auth fails repeatedly. |
| UI selector breakage (Playwright) | High (operational) | Implement selector health checks. Alert engineering on selector failures. Degrade gracefully to read-only mode. |
| Account suspension for ToS violation | Low | No documented enforcement history against third-party tools. Low platform priority for anti-automation. |
| Endpoint URL changes (undocumented API) | Medium | Monitor community sources for endpoint changes. Implement endpoint version fallbacks. |

---

## Terms of Service Summary

**Relevant ToS clauses (replika.com/legal/terms):**

- "The Application is licensed to you on a limited, non-exclusive, non-transferrable, non-sublicensable basis, solely to be used in connection with the Services for your private, personal, non-commercial use." -- Phosra's integration is not personal, non-commercial use. This clause is violated.
- "You agree not to modify, copy, frame, scrape, rent, lease, loan, sell, distribute or create derivative works based on the Services or the Service Content." -- Conversation history retrieval for monitoring may constitute "scraping" under this clause.
- No specific clause prohibiting bots, automated access, or credential sharing was identified, but the general personal-use restriction functionally prohibits all of the above.

**Risk assessment:** The ToS violation risk is real but the enforcement probability is low. Replika has no documented enforcement program against third-party automation tools. The platform is under regulatory pressure that may make it receptive to child safety partnerships. Phosra should proactively approach Luka for a partnership agreement that would provide legitimate API access and remove ToS risk.
