# Microsoft Copilot -- Adapter Assessment

**Platform:** Microsoft Copilot
**Assessment Date:** 2026-02-27
**Framework Version:** 1.0
**Assessed By:** Agent A (Phosra Research)

This document assesses all 10 standard Phosra adapter methods for Microsoft Copilot. The assessment covers both the consumer Copilot (copilot.microsoft.com -- the primary surface children use) and the enterprise Microsoft 365 Copilot (M365 Copilot Chat via Microsoft Graph API).

---

## Platform Context

Microsoft Copilot has two fundamentally different integration surfaces:

1. **Consumer Copilot (copilot.microsoft.com):** Free web product. No public API for account management, safety settings, or conversation access. Browser automation is explicitly prohibited by ToS. Guest access (no login) bypasses all controls.

2. **Enterprise/Educational M365 Copilot:** Requires Microsoft 365 commercial or education license. The Microsoft Graph API provides authenticated read access to interaction history and usage analytics. IT admins can configure safety settings via M365 admin center. This is the viable integration path for educational deployments.

All method assessments below distinguish between these two surfaces where relevant.

---

## 1. `authenticate(credentials) -> Session`

| Aspect | Detail |
|--------|--------|
| **Implementation** | Consumer: Playwright (browser automation). M365 Enterprise: Azure AD OAuth 2.0 via Microsoft Graph API. |
| **API Accessibility Verdict** | Consumer: Level 0 (Walled Garden). Enterprise: Level 4 (Full Partner API) for OAuth. |
| **Approach** | **Consumer path:** Phosra stores the child's Microsoft Account credentials (email + password) and uses Playwright to navigate to copilot.microsoft.com, complete the sign-in flow (including any MFA challenges), and capture the authenticated session cookies for subsequent operations. Session cookies are then used for any subsequent unofficial API calls. **Enterprise/M365 path:** Phosra uses Azure AD OAuth 2.0 (MSAL) to obtain an access token on behalf of the organization. Requires admin consent grants for the required Microsoft Graph scopes (e.g., `AIInteractionHistory.Read.All`). Token refresh is handled by MSAL token cache. |
| **API Alternative** | Enterprise: Microsoft Graph OAuth -- this IS the primary path for enterprise. Consumer: No API alternative. |
| **Auth Required** | Consumer: Microsoft Account email + password + optional MFA. Enterprise: Azure AD tenant admin consent + service principal or user OAuth token. |
| **Data Available** | Consumer: Authenticated session enabling web UI interaction. Enterprise: OAuth access token with delegated Graph API permissions. |
| **Data NOT Available** | Consumer: No API token returned -- only browser session state. No way to programmatically verify session validity without a web request. |
| **Complexity** | Consumer: High (MFA handling, session refresh, Cloudflare detection). Enterprise: Medium (standard OAuth 2.0 MSAL flow with admin consent). |
| **Risk Level** | Consumer: High -- ToS explicitly prohibits bots and scrapers; Cloudflare bot detection active; account suspension risk. Enterprise: Low -- uses documented, supported OAuth flow. |
| **Latency** | Consumer: 5-15 seconds (full browser launch + sign-in). Enterprise: <500ms (OAuth token refresh via MSAL). |
| **Recommendation** | **Implement enterprise path as primary.** Consumer browser authentication should only be used as a fallback for families without M365 and with explicit acknowledgment of ToS risk. Phosra should actively seek a Microsoft Family Safety API partnership to gain official integration access. |

---

## 2. `getAccountSettings() -> SafetySettings`

| Aspect | Detail |
|--------|--------|
| **Implementation** | Consumer: Playwright (browser automation to read settings page). Enterprise: Not available via Graph API -- admin center settings not exposed via Graph read API. |
| **API Accessibility Verdict** | Level 0-1 (Walled Garden / Unofficial Read-Only) |
| **Approach** | **Consumer path:** Phosra uses Playwright to navigate to the user's Microsoft Account profile settings and the Copilot-specific settings within the web UI. Settings that can be read include: model training opt-out status, personalization status, SafeSearch level, memory settings, and privacy controls. These settings are read from the rendered HTML of the settings pages -- not via a formal API. **Enterprise path:** M365 admin center settings (content protection levels, Copilot availability) are not exposed via Microsoft Graph read API as of the research date. Admin portal UI is the only access method. |
| **API Alternative** | No public API for reading Copilot consumer settings. Microsoft Family Safety API does not expose Copilot-specific settings. |
| **Auth Required** | User's Microsoft Account session (Playwright). |
| **Data Available** | Model training preference, personalization preference, SafeSearch setting, memory enabled/disabled status. |
| **Data NOT Available** | Content safety filter thresholds (not user-configurable, fixed at platform level), conversation history settings, feature availability differences between user tiers. |
| **Complexity** | Medium -- requires Playwright navigation across multiple settings pages; settings page structure may change without notice. |
| **Risk Level** | Medium -- reading settings via Playwright is less likely to trigger detection than writing, but still violates ToS; page structure changes would break the implementation. |
| **Latency** | 3-10 seconds (Playwright navigation across settings pages). |
| **Recommendation** | **Implement as best-effort read.** Cache the read results and re-read on a scheduled basis (e.g., daily). Flag when settings do not match Phosra's configured profile. Do not rely on this for real-time enforcement -- use conversation-layer monitoring instead. |

---

## 3. `setContentSafetyLevel(level)`

| Aspect | Detail |
|--------|--------|
| **Implementation** | Consumer: Not Supported -- no user-configurable content safety levels in consumer Copilot. Enterprise: Playwright (M365 admin center). |
| **API Accessibility Verdict** | Consumer: Not Supported. Enterprise: Level 1 (Unofficial Read-Only, Playwright for Write). |
| **Approach** | **Consumer path:** Microsoft Copilot consumer does not offer user-configurable content safety levels. The safety filter is fixed at the platform default (Medium-High blocking threshold). The only content-adjacent setting a user can configure is the Bing SafeSearch level (Safe/Moderate/Strict), which affects web-grounded responses. Phosra can set SafeSearch to Strict via Playwright to maximize content filtering in Copilot's web-search-backed responses. **Enterprise path:** M365 tenant admins can configure the Harmful Content Protection setting via the M365 admin center. This can be set (with appropriate admin role) to relax filtering for specific authorized use cases. For a child safety context, Phosra would want to KEEP this at the maximum (default) setting, not relax it. Phosra's role would be to verify the setting is at maximum and alert if it has been changed. |
| **API Alternative** | No API for content safety levels in consumer Copilot. Azure OpenAI API allows content filter configuration but only for applications built on Azure OpenAI, not consumer Copilot. |
| **Auth Required** | Consumer: User session (for SafeSearch setting). Enterprise: M365 Global Admin or Security Admin credentials. |
| **Data Available** | Consumer SafeSearch can be set to Strict (via Playwright). Enterprise: harmful content protection level can be read and set via admin center. |
| **Data NOT Available** | Per-category content filter thresholds are not user-configurable in consumer Copilot. Cannot enable/disable specific content categories independently. |
| **Complexity** | Consumer: Low (setting SafeSearch via Playwright). Enterprise: Medium (admin center navigation). |
| **Risk Level** | Consumer: Low-Medium (SafeSearch setting via Playwright). Enterprise: Medium (ToS risk of automated admin center access). |
| **Latency** | 3-8 seconds (Playwright interaction). |
| **Recommendation** | **Consumer:** Implement SafeSearch-to-Strict as the primary content safety configuration. This is the only actionable content filter control available for consumer Copilot. **Enterprise:** Implement a settings verification flow (read-only, via Playwright) to confirm content protection is at maximum. Alert Phosra parent dashboard if the setting has been lowered. Do not write to enterprise admin settings via automation -- defer to school IT admin for any enterprise-level changes. |

---

## 4. `setConversationLimits(config)`

| Aspect | Detail |
|--------|--------|
| **Implementation** | Not Supported (platform-native). Phosra-managed via Device-Level + Conversation-Layer. |
| **API Accessibility Verdict** | Not Supported (on-platform). |
| **Approach** | Microsoft Copilot has no native daily time limits, quiet hours, break reminders, or session cooldowns. All time-based conversation limiting must be implemented externally. Phosra implements this through two mechanisms: **1. Device-Level (Microsoft Family Safety):** Phosra configures Microsoft Family Safety screen time limits for Windows/Android devices or instructs parents to use iOS Screen Time for Apple devices. This blocks all Copilot access after a daily time budget is exhausted. Phosra can automate Microsoft Family Safety configuration via the Microsoft Family Safety app (which has limited API-like configuration capabilities via the family.microsoft.com portal). **2. Conversation-Layer Monitoring:** Phosra monitors Copilot conversation sessions (where access permits) and tracks active usage time. When the daily limit is reached, Phosra sends a notification to the parent and, if possible, terminates the session by logging out the user via Playwright. |
| **API Alternative** | Microsoft Family Safety's screen time configuration may be partially automatable via the Microsoft Family Safety REST API (used by the Family Safety app) -- this requires research into the Family Safety internal API. |
| **Auth Required** | Parent Microsoft Account credentials for Microsoft Family Safety configuration. |
| **Data Available** | Device-level screen time limits enforceable via Microsoft Family Safety (for Windows, Xbox, Android). |
| **Data NOT Available** | No per-app time limit specifically for Copilot within Microsoft Family Safety (device-wide limits only in most configurations). No Copilot-native quiet hours or schedule restrictions. |
| **Complexity** | High -- requires coordination between Microsoft Family Safety configuration, conversation monitoring, and notification systems. |
| **Risk Level** | Medium -- Microsoft Family Safety integration is the sanctioned method; conversation monitoring carries ToS risk. |
| **Latency** | Device-level enforcement: near-instant (network-level block). Conversation-layer enforcement: depends on polling interval (30-60 seconds typical). |
| **Recommendation** | **Implement as Phosra-managed device-level control.** Set up Microsoft Family Safety screen time schedules as the primary enforcement mechanism. Use conversation-layer monitoring as a complementary signal for usage analytics. Communicate to parents that Phosra's time limits for Copilot are enforced at the device level, not within the Copilot app itself. |

---

## 5. `getConversationHistory(dateRange) -> Conversation[]`

| Aspect | Detail |
|--------|--------|
| **Implementation** | Consumer: Playwright (browser automation to read conversation list and transcripts). Enterprise: Public API (Microsoft Graph aiInteractionHistory API). |
| **API Accessibility Verdict** | Consumer: Level 1 (Unofficial Read-Only). Enterprise: Level 3 (Public Read API). |
| **Approach** | **Consumer path:** Phosra uses Playwright to navigate to copilot.microsoft.com and read the conversation history from the sidebar and individual conversation views. Conversations are rendered in the browser DOM and can be scraped. This approach captures conversation text but not metadata (message IDs, exact timestamps). **Enterprise path (M365 Copilot):** The `aiInteractionHistory.getAllEnterpriseInteractions` Graph API endpoint (public preview as of May 2025) returns all Copilot prompts and responses for an organization. This requires: Azure AD app registration, admin consent for `AIInteractionHistory.Read.All` permission, and the user must have an M365 Copilot license. The API supports date filtering. |
| **API Alternative** | Microsoft Graph `GET /beta/copilot/aiInteractionHistory` -- available for enterprise M365 Copilot. |
| **Auth Required** | Consumer: Child's Microsoft Account session (Playwright). Enterprise: Azure AD access token with `AIInteractionHistory.Read.All` scope (admin-consented). |
| **Data Available** | Consumer: Conversation text (user prompts + Copilot responses), conversation titles, approximate dates. Enterprise: Full prompts and responses with metadata (timestamps, user IDs, Copilot surface used). |
| **Data NOT Available** | Consumer: Session metadata, message IDs, exact timestamps. Enterprise: Available for M365 Copilot only, not consumer Copilot. Consumer conversations cannot be accessed via Graph API. |
| **Complexity** | Consumer: Medium-High (Playwright DOM scraping with dynamic content loading). Enterprise: Low-Medium (standard Graph API call with pagination). |
| **Risk Level** | Consumer: High -- ToS prohibits scraping; detection risk via Cloudflare; conversation transcript access is a significant privacy concern requiring parental consent disclosure. Enterprise: Low -- using documented, admin-consented API. |
| **Latency** | Consumer: 5-30 seconds per conversation page (Playwright). Enterprise: <2 seconds per API call (Graph). |
| **Recommendation** | **Enterprise: Implement via Graph API as primary path.** This is genuinely valuable for school deployments. **Consumer: Implement Playwright path with explicit parental consent disclosure.** Flag the ToS risk to Phosra legal team. Implement rate limiting (read history once daily, not continuously) to minimize detection risk. Use conversation transcripts for content analysis and parent reporting, not real-time monitoring. |

---

## 6. `getUsageAnalytics(dateRange) -> UsageStats`

| Aspect | Detail |
|--------|--------|
| **Implementation** | Consumer: Playwright (limited -- read session count from conversation history). Enterprise: Public API (Microsoft Graph Usage Report API). |
| **API Accessibility Verdict** | Consumer: Level 1 (Unofficial Read-Only -- limited data). Enterprise: Level 3 (Public Read API). |
| **Approach** | **Consumer path:** Phosra uses Playwright to read the conversation list from copilot.microsoft.com and derive basic usage statistics: number of conversations in a date range, approximate frequency of use. True time-spent metrics are not available without active session monitoring. **Enterprise path:** The Microsoft 365 Copilot Usage Report API (GA October 2025) provides organizational-level usage analytics. User-level data (messages sent, features used, active days) is available via Graph API with appropriate admin permissions. |
| **API Alternative** | Microsoft Graph Usage Reports (`/reports/getMicrosoft365CopilotUsageUserDetail`) for enterprise. |
| **Auth Required** | Consumer: Child's Microsoft Account session. Enterprise: Azure AD token with `Reports.Read.All` or equivalent scope. |
| **Data Available** | Consumer: Conversation count, approximate dates, conversation titles. Enterprise: Messages sent, features used (Chat, Designer, etc.), active days, Teams/Outlook Copilot usage. |
| **Data NOT Available** | Consumer: Exact time spent, message count, feature-level breakdown. Enterprise: Conversation content (content requires aiInteractionHistory, not usage reports). |
| **Complexity** | Consumer: Medium (Playwright with conversation counting). Enterprise: Low (standard Graph API). |
| **Risk Level** | Consumer: Medium-High (Playwright ToS violation). Enterprise: Low (documented API). |
| **Latency** | Consumer: 10-30 seconds (full conversation list load via Playwright). Enterprise: <2 seconds (Graph API call). |
| **Recommendation** | **Enterprise: Implement via Graph Usage Report API.** Provides structured analytics data with minimal risk. **Consumer: Derive from conversation history scraping.** Supplement with device-level usage data from Microsoft Family Safety (which does provide device screen time data that approximates Copilot usage time if Copilot is the primary app). |

---

## 7. `toggleFeature(feature, enabled)`

| Aspect | Detail |
|--------|--------|
| **Implementation** | Playwright (for user-level features accessible via settings). Some features: Not Supported (no user-level toggle exists). |
| **API Accessibility Verdict** | Level 1 (Playwright-Required for available toggles; Not Supported for unavailable ones). |
| **Approach** | Phosra uses Playwright to navigate to Copilot's settings pages and toggle features. Available toggles vary by feature: **Memory:** Can be toggled in Copilot settings (Settings > Privacy > Memory). Phosra can read the current state and set it to disabled via Playwright. **Personalization:** Can be toggled in Microsoft Account privacy settings. **Model Training:** Can be toggled in Microsoft Account privacy settings (opt-out). **SafeSearch Level:** Can be set in Copilot/Bing settings. **Features NOT toggleable by users:** Voice mode, image generation, web search -- these are platform-level features available to all users and cannot be disabled per-user in consumer Copilot settings. |

| Feature | Toggle Available? | Method | Notes |
|---------|-----------------|--------|-------|
| Memory (cross-session) | Yes | Playwright > Copilot Settings > Privacy > Memory | Important child safety control |
| Model training opt-out | Yes | Playwright > Microsoft Account > Privacy | Already off for teens; configure for adults |
| Personalization | Yes | Playwright > Copilot Settings | Already off for teens by default |
| SafeSearch level | Yes | Playwright > Bing/Copilot Settings | Set to Strict for child accounts |
| Voice mode (Copilot Voice) | No | Not user-toggleable in consumer Copilot | Platform-level feature |
| Image generation (Designer) | No | Not user-toggleable in consumer Copilot | Platform-level feature |
| Web search grounding | No | Not user-toggleable | Always on |
| File upload | No | Not available in consumer Copilot by default | Enterprise feature |

| **Auth Required** | User's Microsoft Account session. |
| **Data Available** | Can toggle memory, personalization, model training, SafeSearch. |
| **Data NOT Available** | Cannot toggle voice, image generation, or web search in consumer Copilot. |
| **Complexity** | Low-Medium per toggle (simple Playwright form interaction). |
| **Risk Level** | Medium -- ToS violation for automated settings changes; page structure changes break implementation. |
| **Latency** | 3-8 seconds per toggle (Playwright interaction). |
| **Recommendation** | **Implement Memory disable, SafeSearch Strict, personalization off, and model training opt-out as the four standard Phosra configuration steps for consumer Copilot.** Execute these once on onboarding and verify monthly. Voice and image generation controls must be implemented at the device level (Microsoft Family Safety can block Copilot apps that provide those features). |

---

## 8. `setParentalControls(config)`

| Aspect | Detail |
|--------|--------|
| **Implementation** | Playwright (parent's Microsoft Family Safety portal). Partial platform-native support (Microsoft Family Safety app). |
| **API Accessibility Verdict** | Level 1 (Playwright-Required for most controls; Limited Platform-Native for block/allow). |
| **Approach** | Microsoft Family Safety is the platform-native parental control system. It provides: **(a) App blocking:** Phosra uses the parent's Microsoft Family Safety credentials to navigate to family.microsoft.com and configure app blocks for Copilot on Windows/Xbox/Android devices. This is achievable via Playwright and is the most reliable enforcement mechanism. **(b) Website blocking:** Phosra adds copilot.microsoft.com to the blocked sites list in Microsoft Family Safety content filters. **(c) Screen time limits:** Phosra sets daily device screen time budgets for the child's Windows/Xbox/Android device. These serve as Copilot time limits by proxy. **Microsoft Family Safety API:** The Microsoft Family Safety mobile app communicates with a backend API (family.microsoft.com) that may have undocumented endpoints. Phosra could use these unofficial endpoints to automate Family Safety configuration without the Playwright overhead -- but this carries higher risk of detection and API instability. |
| **API Alternative** | Microsoft Family Safety internal REST API (unofficial; high risk). No public API for Family Safety configuration. |
| **Auth Required** | Parent's Microsoft Account credentials (not the child's). |
| **Data Available** | Can block Copilot app, block copilot.microsoft.com, set device screen time limits. |
| **Data NOT Available** | Cannot configure Copilot-specific content filters, cannot access conversation transcripts, cannot set Copilot-only time limits (only device-wide). |
| **Complexity** | Medium -- requires parent credential management; Microsoft Family Safety portal navigation has multiple steps per control. |
| **Risk Level** | Medium -- Microsoft Family Safety is the sanctioned tool; using it via Playwright is technically a ToS violation but serves the intended purpose of the tool |
| **Latency** | 5-20 seconds per configuration action (Playwright). |
| **Recommendation** | **Implement as the primary parental control configuration mechanism for consumer Copilot.** This is the most defensible integration path since it uses Microsoft's own parental control system. Phosra's value-add is automating the Family Safety configuration (which parents find complex) and augmenting it with conversation-layer monitoring that Family Safety cannot provide. |

---

## 9. `deleteConversations(conversationIds)`

| Aspect | Detail |
|--------|--------|
| **Implementation** | Playwright (user-initiated conversation deletion via web UI). Enterprise: Not available via Graph API (read-only). |
| **API Accessibility Verdict** | Level 1 (Playwright-Required). |
| **Approach** | Phosra uses Playwright to navigate to copilot.microsoft.com, access the conversation history sidebar, and delete specific conversations or all conversations. The consumer Copilot web UI provides conversation deletion controls: individual conversations can be deleted via a context menu, and all conversations can be cleared from settings. There is no API endpoint for conversation deletion in consumer Copilot. |
| **API Alternative** | No public API for consumer Copilot conversation deletion. Microsoft Graph API (enterprise) does not provide conversation deletion. |
| **Auth Required** | Child's Microsoft Account session (Playwright). |
| **Data Available** | Can delete individual conversations by ID (as identified in the UI) or delete all conversations. |
| **Data NOT Available** | Cannot confirm permanent deletion (server-side retention timeline not publicly documented). Cannot delete conversations by content or date range programmatically without first reading the conversation list. |
| **Complexity** | Medium -- requires conversation list reading (to identify IDs), then individual or bulk deletion via UI interaction. |
| **Risk Level** | Medium-High -- iterating through conversation deletion is a recognizable automation pattern; Cloudflare detection risk is higher than single page reads. |
| **Latency** | 5-15 seconds for bulk delete; 3-8 seconds per conversation for targeted deletion. |
| **Recommendation** | **Implement as periodic cleanup for parent-requested deletion.** Do not implement as continuous automation. Use the "clear all conversations" feature rather than per-conversation deletion to minimize the number of automated interactions. Instruct parents that deletion removes conversations from the UI but server-side retention (up to 18 months) is controlled by Microsoft. |

---

## 10. `getActiveSession() -> SessionInfo`

| Aspect | Detail |
|--------|--------|
| **Implementation** | Not Supported (no real-time session detection API). Approximated via Conversation-Layer monitoring or Device-Level signals. |
| **API Accessibility Verdict** | Not Supported (direct). Partial via Device-Level or Conversation-Layer. |
| **Approach** | Microsoft provides no API for detecting whether a user is currently in an active Copilot conversation. There is no presence API, no WebSocket connection that can be monitored externally, and no real-time session event webhook for consumer Copilot. **Device-Level approximation:** Microsoft Family Safety provides device activity reports (Windows, Xbox, Android) showing which apps are active and for how long. This can indicate that Copilot is open but cannot distinguish active conversation from idle browser tab. **Enterprise approximation:** The Microsoft Graph Change Notifications API provides webhooks for new Copilot interactions in M365 Copilot. This would fire when the user sends a message or receives a response, effectively detecting an active session (with slight delay). This is the best available real-time signal for enterprise deployments. **Consumer approximation:** If Phosra maintains a Playwright browser session connected to the child's Copilot account, it can poll the conversation list endpoint to detect when a new conversation appears or when an existing conversation gains new messages -- approximating real-time session detection with 30-60 second latency. |
| **API Alternative** | Microsoft Graph Change Notifications (enterprise only): `POST /subscriptions` to receive webhooks for new Copilot interactions. Requires M365 license and Azure AD admin consent. |
| **Auth Required** | Enterprise: Azure AD token with Change Notifications subscription scope. Consumer: Child's session (for Playwright polling). |
| **Data Available** | Enterprise: Real-time webhooks for each new Copilot interaction (message sent/received). Consumer: Approximate session detection via conversation list polling. |
| **Data NOT Available** | Neither method provides exact session start/stop times. Neither method works for guest (unauthenticated) Copilot use. |
| **Complexity** | High -- requires infrastructure for webhook subscription management (enterprise) or continuous polling (consumer). |
| **Risk Level** | Enterprise: Low (documented API). Consumer: High (continuous Playwright polling is easily detected). |
| **Latency** | Enterprise: <5 seconds (webhook). Consumer: 30-60 seconds (polling interval). |
| **Recommendation** | **Enterprise: Implement via Change Notifications webhook.** This is genuinely viable and provides near-real-time session detection for M365 Copilot deployments. **Consumer: Do not implement continuous polling** -- the ToS risk is too high and the detection risk too significant. Instead, use Device-Level screen time data from Microsoft Family Safety as a proxy for active Copilot usage. For crisis response, rely on post-hoc conversation analysis rather than real-time session detection. |

---

## Overall Architecture

### Recommended Architecture (Consumer Copilot -- Primary Child Safety Surface)

```
PHOSRA COPILOT INTEGRATION (Consumer)
======================================

[Parent Dashboard] <--- Phosra Backend <--- [Device-Level Layer]
                                               |
                                   Microsoft Family Safety API/UI
                                   - Block Copilot app
                                   - Block copilot.microsoft.com
                                   - Set device screen time
                                               |
                              [Session Manager] (Playwright -- LOW FREQUENCY)
                                   |
                              copilot.microsoft.com (authenticated session)
                                   |
                    +----------------------------------+
                    |         Read Layer               |
                    |  (daily batch -- not real-time)  |
                    |  - getConversationHistory()      |
                    |  - getUsageAnalytics()           |
                    |  - getAccountSettings()          |
                    +----------------------------------+
                                   |
                    +----------------------------------+
                    |         Write Layer              |
                    |  (onboarding + monthly verify)   |
                    |  - toggleFeature(memory, off)    |
                    |  - toggleFeature(safesearch,     |
                    |    strict)                       |
                    |  - setParentalControls()         |
                    |    (Family Safety blocking)      |
                    +----------------------------------+
                                   |
                    +----------------------------------+
                    |     Conversation-Layer           |
                    |  (async content analysis)        |
                    |  - Content classification        |
                    |  - Crisis detection              |
                    |  - PII detection                 |
                    |  - Academic pattern detection    |
                    |  - Parent alert generation       |
                    +----------------------------------+
```

### Recommended Architecture (Enterprise M365 Copilot)

```
PHOSRA COPILOT INTEGRATION (Enterprise M365)
=============================================

[Admin Dashboard] <--- Phosra Backend <--- [Microsoft Graph API Layer]
                                               |
                                   Azure AD OAuth 2.0 (admin-consented)
                                               |
                    +----------------------------------+
                    |         Read Layer (API)         |
                    |  - aiInteractionHistory API      |
                    |    (daily batch export)          |
                    |  - Usage Report API              |
                    |    (weekly analytics)            |
                    +----------------------------------+
                                   |
                    +----------------------------------+
                    |      Real-Time Layer (API)       |
                    |  - Change Notifications webhook  |
                    |    (session detection)           |
                    |  - Content scanning on new       |
                    |    interactions                  |
                    +----------------------------------+
                                   |
                    +----------------------------------+
                    |     Conversation-Layer           |
                    |  (content analysis from API)     |
                    |  - Crisis detection              |
                    |  - PII detection                 |
                    |  - Academic pattern detection    |
                    |  - Emotional dependency signals  |
                    |  - Parent/admin alert generation |
                    +----------------------------------+
```

### Real-Time Monitoring Strategy

| Context | Method | Frequency | Latency |
|---------|--------|-----------|---------|
| Consumer Copilot | Daily conversation history batch read via Playwright | Once per day (night batch) | 24-hour delay |
| M365 Copilot | Change Notifications webhook from Microsoft Graph | Per-interaction (real-time) | <5 seconds |
| Device activity | Microsoft Family Safety device activity report | As provided by Family Safety | Variable |

**Critical limitation:** Real-time monitoring of consumer Copilot is not feasible without violating ToS. Phosra's consumer Copilot monitoring operates on a daily batch basis -- conversations from the prior day are reviewed, not live conversations. For crisis response, this delay is significant. Phosra should prominently communicate this limitation to parents and encourage Microsoft 365 Education deployment for superior monitoring capabilities.

### Development Effort Estimate

| Component | Effort (Days) | Priority | Notes |
|-----------|-------------|---------|-------|
| Microsoft Family Safety integration (block/allow) | 5 | P0 | Most reliable control; use official app UI automation |
| Consumer Playwright session manager | 8 | P1 | Handle MFA, session refresh, Cloudflare |
| Conversation history scraper (consumer) | 5 | P1 | Daily batch; build robust DOM parser |
| Content classification pipeline | 10 | P0 | Crisis, PII, academic, emotional detection |
| Parent notification system | 5 | P0 | Email, SMS, in-app alerts |
| Azure AD OAuth / Graph API client (enterprise) | 5 | P1 | Standard MSAL implementation |
| aiInteractionHistory API integration (enterprise) | 3 | P1 | Straightforward REST with pagination |
| Change Notifications webhook (enterprise) | 5 | P1 | Webhook server + subscription management |
| Usage analytics dashboard | 5 | P2 | Aggregate and present usage data |
| Settings verification (account settings read) | 3 | P2 | Monthly verification of safety settings |
| **Total** | **54** | | |

### Detection Vectors & Mitigations

| Vector | Risk Level | Mitigation |
|--------|-----------|------------|
| Playwright session automation detected by Cloudflare | High | Use real Chrome browser (not headless); randomize interaction timing; limit operation frequency |
| Microsoft Account flagged for unusual sign-in (Playwright) | Medium | Use residential IP addresses; authenticate from the same geographic region as the user |
| Conversation history scraping detected by rate limiting | Medium | Batch reads once daily; use realistic delays between page interactions |
| Azure AD app blocked by tenant admin (enterprise) | Low | Follow documented admin consent flow; use principle of least privilege |
| Microsoft Family Safety portal automation detected | Low | Microsoft Family Safety is designed for parental use; automation risk is lower than consumer Copilot |
| Child creating new Microsoft Account to bypass | Low | Platform-level issue; Phosra cannot prevent account creation; alert parent if new account detected |

### Terms of Service Summary

| ToS Clause | Risk | Source |
|-----------|------|--------|
| "Don't use tools or computer programs (like bots or scrapers) to access Copilot" | High -- explicitly prohibits Playwright use on consumer Copilot | Microsoft Copilot Terms of Use |
| Microsoft may "suspend, limit, or permanently revoke access" for ToS violations | High -- account suspension risk for automated access | Microsoft Copilot Terms of Use |
| Microsoft Graph API Terms of Use: generally permissive for enterprise documented use | Low -- official API use within documented scope | M365 Copilot API Terms |
| Microsoft Family Safety: no explicit prohibition on third-party configuration automation | Low-Medium -- gray area; parental control use case is aligned with the product's purpose | Microsoft Family Safety documentation |
