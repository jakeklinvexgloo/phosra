# Perplexity AI — Adapter Assessment

**Platform:** Perplexity AI
**Research Date:** 2026-02-27
**Framework Version:** 1.0
**API Accessibility Score:** Level 2 — Limited Public API
**Phosra Enforcement Level:** Primarily Device-Level, with Playwright-Possible Conversation Monitoring

---

## Architecture Context

Perplexity presents a unique adapter challenge. A public API (Sonar API) exists and is well-documented, but its scope is exclusively conversation generation for search synthesis. It has zero data retention — meaning there is no server-side conversation history to read. There are no account management endpoints, no safety configuration endpoints, no parental control surfaces. The public API is entirely the wrong tool for parental control integration.

All meaningful parental control operations therefore require browser automation against the consumer web UI (`perplexity.ai`), which the Terms of Service explicitly prohibit for automated tools. This creates a fundamental conflict: the only integration path that could provide value is the one explicitly prohibited by the ToS.

The practical implication: Phosra's integration with Perplexity is primarily device/network-level control augmented by conversation monitoring IF the parent has the child's account credentials and Phosra can periodically read Threads via browser automation.

---

## Method 1: `authenticate(credentials) -> Session`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (web UI) for consumer account; API key (no user context) for Sonar API |
| **API Accessibility Verdict** | Level 2 — The Sonar API authenticates with a bearer token (API key) but carries no user identity or account context. Web UI login requires Playwright. |
| **Approach** | **Path A — API Key (Sonar API):** Generate a Sonar API key from account settings. Store as a bearer token. Use for search generation only — no account data access. This is trivial to implement and carry no ToS risk. **Path B — Session Cookie (Web UI):** Use Playwright to automate the login flow at `perplexity.ai/login`. Accept Google OAuth or email/password. Capture session cookies for subsequent requests. This path is ToS-prohibited but is the only path to account data. |
| **API Alternative** | No OAuth flow for delegated user account access. No way to obtain a session token without going through the web login UI. |
| **Auth Required** | Path A: Perplexity API key (generated from account settings, stored in Phosra). Path B: Email + password or Google OAuth credentials for the child's account. |
| **Data Available** | Path A: Only the ability to make Sonar API calls (search generation). Path B: Full web UI session — access to Threads, settings, account information. |
| **Data NOT Available** | Path A: No account settings, no conversation history, no usage data, no user profile. Path B: Nothing is structurally unavailable via the web UI, but ToS prohibits automated access. |
| **Complexity** | Path A: Low. Standard OpenAI-compatible bearer token auth. Path B: Medium. Standard Playwright web login. Google OAuth requires handling OAuth redirect flow in a Playwright browser. |
| **Risk Level** | Path A: Low — fully permitted by Sonar API ToS. Path B: Medium — explicitly prohibited by consumer web UI ToS. Perplexity has no documented history of blocking parental control tools, but the ToS prohibition is unambiguous. |
| **Latency** | Path A: Instant (API key is static). Path B: 3-8 seconds for Playwright login flow. |
| **Recommendation** | Implement Path A immediately for any Sonar API calls Phosra makes. Implement Path B only after legal review confirms the child safety safe harbor argument or after obtaining explicit permission from Perplexity. Store the API key (Path A) and session credentials (Path B) separately — they serve different purposes. |

---

## Method 2: `getAccountSettings() -> SafetySettings`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (web UI) — no public API for account settings |
| **API Accessibility Verdict** | Level 0 for safety-specific settings (no settings exist). Level 1 (Unofficial Read-Only) for general account settings accessible via web UI. |
| **Approach** | Navigate to `perplexity.ai/settings` with an authenticated Playwright session. Parse the settings page to extract: AI Data Usage toggle state (on/off), Memory toggle state (on/off), Incognito mode state, Subscription tier, Account email, API key existence. There is no safety configuration to read because Perplexity has no content safety settings, age-differentiated profiles, or parental control configuration. |
| **API Alternative** | None. No public API for account settings. |
| **Auth Required** | Authenticated session (Playwright web UI). Session cookie from Method 1 Path B. |
| **Data Available** | AI Data Retention toggle state, Memory toggle state, Subscription tier (Free/Pro/Max/Enterprise). |
| **Data NOT Available** | Content safety level (does not exist), parental control settings (do not exist), age verification status (does not exist), crisis detection configuration (does not exist). The `SafetySettings` return type for Perplexity will be nearly empty because the platform has no meaningful safety settings. |
| **Complexity** | Low — basic page scraping from a predictable settings URL. |
| **Risk Level** | Medium — ToS prohibits automated access. Low detection risk for infrequent reads. |
| **Latency** | 2-4 seconds per read (Playwright page load + DOM parsing). |
| **Recommendation** | Implement as a lightweight read that returns a `PerplexityAccountState` object with the available fields. Set the safety settings response to reflect that no configurable safety exists. Run on a low-frequency schedule (daily or weekly) since settings change rarely and reads carry ToS risk. Document clearly in the Phosra dashboard that Perplexity has no native safety configuration. |

---

## Method 3: `setContentSafetyLevel(level)`

| Aspect | Detail |
|---|---|
| **Implementation** | Not possible — no safety level configuration exists on Perplexity |
| **API Accessibility Verdict** | Level 0 — feature does not exist on this platform |
| **Approach** | N/A. Perplexity does not offer content safety tiers, content filter configuration, age-appropriate mode toggles, or any user-facing safety settings. There is no setting to read or write. |
| **API Alternative** | None exists. |
| **Auth Required** | N/A |
| **Data Available** | N/A |
| **Data NOT Available** | The entire concept of user-configurable content safety does not apply to Perplexity. |
| **Complexity** | N/A |
| **Risk Level** | N/A |
| **Latency** | N/A |
| **Recommendation** | Return `UnsupportedOperationError` with a detailed message: "Perplexity AI does not offer content safety level configuration. The platform applies a single fixed safety baseline to all users. Phosra cannot increase this baseline. Consider using device-level DNS blocking or the Perplexity allowlist capability to restrict access entirely if the platform's content safety level is insufficient." The Phosra dashboard should prominently note that this control is not available and that Perplexity's safety baseline (particularly for self-harm and crisis response) is documented as insufficient for child use. |

---

## Method 4: `setConversationLimits(config)`

| Aspect | Detail |
|---|---|
| **Implementation** | Not possible via platform API or browser automation. Device-Level only for time limits. |
| **API Accessibility Verdict** | Level 0 for platform-native limits (do not exist). Device-Level enforcement is the only viable path. |
| **Approach** | **Time limits:** Phosra must implement these entirely outside Perplexity. Options: (1) iOS Screen Time / Android Digital Wellbeing app-level time limits for the Perplexity app; (2) DNS/router-level time restrictions that block `perplexity.ai` after a specified daily duration; (3) Phosra-managed session detection via periodic Thread polling to measure active usage time — a proxy measure with gaps. **Message limits:** No platform support and no API access to enforce. Not feasible. **Schedule restrictions (quiet hours):** DNS/router-level blocking of `perplexity.ai` on a schedule. Most reliable approach. |
| **API Alternative** | None exists within Perplexity. |
| **Auth Required** | Device-level controls: OS-level parental control credentials (iOS Screen Time, Google Family Link). DNS controls: router admin credentials. |
| **Data Available** | Device-level: on/off enforcement only, no usage metrics. DNS-level: blocked/unblocked status. |
| **Data NOT Available** | Accurate per-session usage time from within Perplexity (not accessible). Per-message counts (not accessible). |
| **Complexity** | Medium — requires device-level integration or DNS control, which are separate from the Perplexity adapter. |
| **Risk Level** | Low — device/DNS controls carry no Perplexity ToS risk. |
| **Latency** | Enforcement is near-real-time for DNS and device-level controls. |
| **Recommendation** | Implement time limits via Phosra's existing device-level control modules (iOS Screen Time, Android Family Link integration). Document in the Phosra dashboard that conversation-level limits on Perplexity are not possible and that enforcement is at the device/network level. Periodic Thread polling (Method 5) can provide a usage duration approximation but is not a reliable enforcement mechanism. |

---

## Method 5: `getConversationHistory(dateRange) -> Conversation[]`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (web UI) for signed-in accounts. Not possible for anonymous/guest sessions. |
| **API Accessibility Verdict** | Level 1 — Unofficial Read-Only via browser automation. No public API for conversation history. |
| **Approach** | Use an authenticated Playwright session to navigate to `perplexity.ai`. The left sidebar lists the child's Threads (conversation history). Phosra can: (1) enumerate Thread titles and timestamps from the sidebar; (2) click into each Thread to read the full query/response content; (3) scan content for safety signals (self-harm keywords, PII, academic dishonesty indicators, concerning topics). **Critical limitation:** This approach only works if the child has a Perplexity account and is signed in on the monitored device. Anonymous (no-account) usage produces no persistent Threads — history is deleted after 14 days and is not accessible via the account. **Incognito mode:** If the child uses Perplexity's incognito mode, Threads are not saved to the account. Phosra loses visibility entirely. |
| **API Alternative** | The Sonar API has zero data retention. There is no API endpoint for conversation history. This is not a gap that can be filled with an API call. |
| **Auth Required** | Authenticated Playwright session with child's account credentials. |
| **Data Available** | Thread titles, timestamps, full query text, full response text (including cited sources), related questions suggested by the platform. |
| **Data NOT Available** | Anonymous session history. Incognito mode history. History from other devices where the child was not signed into their Perplexity account. The actual model used for each response (not always exposed in the UI). |
| **Complexity** | Medium — standard Playwright DOM scraping. Thread pagination may require scrolling. Response content may include Markdown, citations, and structured formats that need parsing. |
| **Risk Level** | Medium — ToS prohibits automated access to the web UI. Reading Threads is lower risk than writing settings, but still technically prohibited. |
| **Latency** | 3-8 seconds per Thread read. For a child with many Threads, full history read can take minutes. Recommend incremental reads (only new Threads since last check). |
| **Recommendation** | Implement as a read-only monitoring capability with the following constraints clearly documented: (1) Only works for signed-in accounts, not anonymous/guest use; (2) Child can defeat monitoring by using incognito mode; (3) Monitoring is periodic (not real-time) due to Playwright latency; (4) Recommend polling at 15-30 minute intervals during active hours. This is the highest-value integration Phosra can achieve on Perplexity — conversation-layer analysis of what the child searched for and what answers they received. |

---

## Method 6: `getUsageAnalytics(dateRange) -> UsageStats`

| Aspect | Detail |
|---|---|
| **Implementation** | Partially Playwright (web UI); primarily Phosra-derived from Thread polling |
| **API Accessibility Verdict** | Level 1 — Unofficial Read-Only (derived). No native analytics dashboard for consumer accounts. |
| **Approach** | **Derived analytics from Thread polling:** By reading the child's Threads (Method 5), Phosra can derive: daily query count, daily active time (approximated from Thread timestamps), topic distribution (what categories of questions were asked), peak usage hours (from Thread timestamps), and whether academic queries are present. **Direct account analytics:** The Perplexity account settings page shows subscription tier and basic API usage statistics (for API users). No consumer-facing usage dashboard exists with time-on-platform metrics. |
| **API Alternative** | No public analytics API for consumer accounts. The Sonar API dashboard tracks API key usage (token counts, request counts) but this is irrelevant for monitoring a child's consumer account. |
| **Auth Required** | Authenticated Playwright session with child's account credentials. |
| **Data Available** | Derived: Thread count by date, topic/query content, timestamp-derived active periods. Direct: Subscription tier. |
| **Data NOT Available** | Precise session duration (cannot distinguish between 30 seconds and 30 minutes on the platform for a single Thread). Cross-device usage aggregation (Threads from mobile vs. desktop are merged, but without device disambiguation). Anonymous session analytics (completely invisible). |
| **Complexity** | Medium — requires Thread data aggregation logic on top of the Playwright Thread read implementation. |
| **Risk Level** | Medium — same ToS risk as Method 5. |
| **Latency** | Same as Thread polling (Method 5). |
| **Recommendation** | Implement as a secondary output of the Thread polling pipeline. After reading Threads (Method 5), compute derived analytics: query count, topic categories, time distribution. Return a `UsageStats` object with honest gaps documented (no precise session duration, no anonymous session data). Present to parents with clear caveats about what is and is not measurable. |

---

## Method 7: `toggleFeature(feature, enabled)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (web UI) for the features that do have toggles |
| **API Accessibility Verdict** | Level 1 — Unofficial API (write) via browser automation |
| **Approach** | Navigate to `perplexity.ai/settings` with an authenticated Playwright session and toggle available settings. Supported toggles: **AI Data Usage (training opt-out):** Toggle to off to prevent Perplexity from training on the child's queries. This is the highest-value toggle from a privacy perspective. **Memory:** Toggle to disable cross-session memory for the child's account. Recommended for all child accounts to prevent accumulation of personal data. **Incognito mode:** Enable/disable. Note: Enabling incognito mode (from a Phosra perspective) would prevent Phosra from monitoring Threads — counterproductive. Phosra should NOT enable incognito mode. Features that cannot be toggled: content safety level (does not exist), web search toggle (core product feature), image upload toggle (no such setting), voice input toggle (no separate setting). |
| **API Alternative** | None. Settings are only in the web UI. |
| **Auth Required** | Authenticated Playwright session with child's account credentials. |
| **Data Available** | Toggle states for: AI Data Usage, Memory. |
| **Data NOT Available** | Content safety toggle (does not exist), time limit toggle (does not exist), feature access restrictions (do not exist). |
| **Complexity** | Low — straightforward button/checkbox toggling via Playwright. Settings page is a standard web form. |
| **Risk Level** | Medium — ToS prohibits automated access. Infrequent writes (initial setup, periodic verification) minimize detection risk. |
| **Latency** | 3-5 seconds per toggle operation. |
| **Recommendation** | Implement as part of initial Perplexity account setup. On first Phosra configuration: automatically disable AI Data Usage (opt out of training) and disable Memory. Verify these settings on a weekly basis to detect if the child has re-enabled them. This is the most privacy-protective intervention Phosra can make on Perplexity and directly protects the child's data even if conversation monitoring is limited. |

---

## Method 8: `setParentalControls(config)`

| Aspect | Detail |
|---|---|
| **Implementation** | Not possible — no parental control system exists on Perplexity |
| **API Accessibility Verdict** | Level 0 — feature does not exist on this platform |
| **Approach** | N/A. Perplexity has no parent account linking, no parental dashboard, no parental configuration interface, no family account system, no child account designation, and no guardian consent mechanism. The concept of "parental controls" does not exist in any form on Perplexity. |
| **API Alternative** | None. |
| **Auth Required** | N/A |
| **Data Available** | N/A |
| **Data NOT Available** | Everything — the feature does not exist. |
| **Complexity** | N/A |
| **Risk Level** | N/A |
| **Recommendation** | Return `UnsupportedOperationError`. Document in the Phosra dashboard that Perplexity is one of the only major AI platforms with zero native parental controls. This should be surfaced to parents as a key finding when they configure Perplexity in Phosra — they need to understand that all protections come from Phosra and device-level controls, not from the platform itself. |

---

## Method 9: `deleteConversations(conversationIds)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (web UI) |
| **API Accessibility Verdict** | Level 1 — Unofficial API (write) via browser automation |
| **Approach** | Use an authenticated Playwright session to navigate to the Thread list at `perplexity.ai`. For each Thread to delete: (1) hover over the Thread in the sidebar to reveal the delete/options menu; (2) click the options icon; (3) select "Delete thread"; (4) confirm the deletion. For bulk deletion: navigate to Settings and locate "Clear all threads" if available. **Limitation:** This only works for signed-in accounts. Anonymous Threads cannot be accessed or deleted by Phosra (they auto-expire in 14 days). |
| **API Alternative** | No public API for conversation deletion. |
| **Auth Required** | Authenticated Playwright session with child's account credentials. |
| **Data Available** | Ability to delete specific named Threads or all Threads in the account. |
| **Data NOT Available** | Ability to delete anonymous Threads (auto-expire). Ability to delete data from model training that was already submitted (opt-out only affects future use). |
| **Complexity** | Low to Medium — sequential UI automation. Deleting many Threads requires iterating through the sidebar list. |
| **Risk Level** | Medium — ToS risk from browser automation. Low practical detection risk for infrequent operations. |
| **Latency** | 2-4 seconds per Thread deletion. Bulk deletion faster if a "clear all" option exists. |
| **Recommendation** | Implement as an on-demand capability that parents can trigger from the Phosra dashboard. Use cases: (1) Parent wants to remove Threads containing sensitive PII shared by the child; (2) Parent wants to clear all history after a concerning conversation. Also implement as an automatic post-monitoring action: after Phosra flags a Thread as containing sensitive content and the parent reviews it, offer a one-click delete option from the Phosra alert interface. |

---

## Method 10: `getActiveSession() -> SessionInfo`

| Aspect | Detail |
|---|---|
| **Implementation** | Not directly possible. Proxy detection only. |
| **API Accessibility Verdict** | Level 0 — no real-time session detection API exists |
| **Approach** | Perplexity has no real-time session API. Phosra cannot directly detect whether the child is actively querying Perplexity at any given moment. Proxy approaches: (1) **DNS query monitoring:** If Phosra manages the home network DNS (via router integration or DNS-level product), it can detect DNS queries to `perplexity.ai` in real time, indicating the child is accessing the platform. This provides "is the child on Perplexity?" without conversation content. (2) **Thread recency polling:** Phosra polls the Thread list periodically. If a new Thread appeared since the last poll, the child is or was recently active. The timestamp of the newest Thread provides an approximate "last active" time. (3) **Device-level monitoring:** App usage monitoring on iOS/Android (if Phosra has device-level access) can detect the Perplexity app or browser tab as active. |
| **API Alternative** | None within Perplexity. |
| **Auth Required** | For Thread polling: authenticated Playwright session. For DNS monitoring: router/DNS admin access. For device-level: device management profile. |
| **Data Available** | Proxy "is active" signal from DNS queries or Thread recency. Approximate last-active timestamp from Thread polling. |
| **Data NOT Available** | Real-time conversation content during an active session. Precise session start/end times. |
| **Complexity** | Medium — requires integration with DNS or device-level monitoring systems, not with Perplexity directly. |
| **Risk Level** | Low (DNS/device monitoring has no Perplexity ToS implications). Medium for Thread polling (ToS risk). |
| **Latency** | DNS monitoring: near-real-time (sub-second). Thread polling: 15-30 minute polling interval. Device-level: depends on OS monitoring API. |
| **Recommendation** | Implement via DNS query monitoring as the primary real-time signal (no Perplexity ToS risk). Use Thread polling (Method 5) as the secondary signal for approximate last-active time. Do not attempt to read active conversation content in real time — the Playwright approach would require continuous browser automation that is too high-risk and impractical. The active session detection is most useful for triggering time-limit enforcement: when DNS monitoring confirms Perplexity usage has reached the daily limit, Phosra enforces the cut-off via DNS block. |

---

## Overall Architecture

```
Phosra Perplexity Adapter
│
├── SESSION MANAGER
│   ├── API Key (Sonar API) — for search generation only, no user data
│   └── Session Cookie (Playwright) — for web UI operations; ToS risk documented
│
├── READ LAYER (periodic polling, Playwright)
│   ├── Thread Enumeration — list Threads with titles/timestamps (every 30 min during active hours)
│   ├── Thread Content Read — full query/response text for flagged or recent Threads
│   ├── Account Settings Read — AI Data Usage state, Memory state (weekly)
│   └── Derived Analytics — query count, topic distribution, usage time approximation
│
├── WRITE LAYER (on-demand, Playwright; ToS risk)
│   ├── Toggle AI Data Usage → OFF (initial setup + weekly verification)
│   ├── Toggle Memory → OFF (initial setup + weekly verification)
│   └── Delete Threads (on-demand from parent dashboard or post-alert action)
│
├── MONITOR LAYER (conversation-layer analysis)
│   ├── NLP scanning of Thread content for:
│   │   ├── Self-harm / crisis keywords (critical priority)
│   │   ├── Academic dishonesty patterns (high priority)
│   │   ├── PII sharing detection (medium priority)
│   │   ├── Substance / dangerous content queries (medium priority)
│   │   └── Hate speech / radicalization content (medium priority)
│   └── Alert generation → Parent notification pipeline
│
├── DEVICE/NETWORK LAYER (no Perplexity ToS risk)
│   ├── DNS block of perplexity.ai on schedule (quiet hours / time limits)
│   ├── iOS Screen Time / Android Family Link app-level time limits
│   └── DNS query monitoring for real-time activity detection
│
└── NOT POSSIBLE ON THIS PLATFORM
    ├── Content safety level configuration (feature does not exist)
    ├── Parental controls (feature does not exist)
    ├── Real-time conversation monitoring (no streaming API access)
    ├── Anonymous session monitoring (no account; auto-expires)
    └── Message rate limiting (no native support; no API surface)
```

---

## Real-Time Monitoring Strategy

Perplexity does not offer real-time conversation monitoring. Phosra's monitoring is necessarily **retrospective** — Threads are analyzed after the fact. Strategy:

1. **Polling interval:** Poll Thread list every 15-30 minutes during active hours (configurable per family). During quiet hours (10pm-7am), poll every 60 minutes or not at all.
2. **Priority read:** When the Thread list shows a new Thread since the last poll, immediately read its content for safety analysis.
3. **Latency to detection:** Worst case is the polling interval (30 minutes). This means if a child asks Perplexity for self-harm information at 2pm, the parent may not be alerted until 2:30pm. This is a fundamental limitation of the architecture.
4. **Mitigation:** For higher-priority families or flagged accounts, reduce polling interval to 5 minutes. Note: more frequent polling increases ToS violation exposure.
5. **Anonymous session gap:** If the child uses Perplexity without a signed-in account, Threads are not accessible and monitoring is impossible. Phosra should detect when the child uses Perplexity anonymously (via DNS monitoring) and alert the parent that monitoring visibility is lost.

---

## Development Effort Estimate

| Component | Effort (Days) | Priority |
|---|---|---|
| Playwright session manager (Perplexity web login) | 1 | P1 |
| Thread enumeration and content reader | 2 | P1 |
| NLP safety scanner (self-harm, academic, PII keywords) | 3 | P1 |
| Account settings reader (AI Data Usage, Memory) | 1 | P1 |
| AI Data Usage opt-out writer | 1 | P1 |
| Memory toggle writer | 0.5 | P1 |
| Thread deletion capability | 1 | P2 |
| DNS query monitoring integration | 2 | P1 |
| Device-level time limit integration (iOS/Android) | 2 | P1 |
| Derived analytics pipeline (from Thread data) | 2 | P2 |
| Parent alert pipeline (from NLP scanner) | 2 | P1 |
| Phosra dashboard — Perplexity-specific panels | 1.5 | P2 |
| **Total** | **~19** | |

---

## Detection Vectors and Mitigations

| Vector | Risk Level | Mitigation |
|---|---|---|
| High-frequency Playwright automation on web UI | High | Keep polling interval at 15-30 min minimum; use existing browser session with realistic headers; do not run concurrent Playwright sessions |
| Cloudflare bot detection on perplexity.ai | Medium | Use full browser (Playwright Chromium) not headless; inject realistic user-agent; add human-like timing delays between DOM interactions |
| Child using incognito mode | High — defeats monitoring | Alert parent when incognito mode is detected as enabled (monitor via account settings read); do not enable incognito mode as part of Phosra setup |
| Child using Perplexity without an account | High — defeats monitoring | Detect via DNS monitoring that anonymous Perplexity access is occurring; alert parent; recommend requiring account login (device-level policy) |
| Child switching to a different device | Medium | Phosra must have monitoring on all child devices; thread history is account-synced so threads from any device appear in the account |
| Perplexity API/UI changes breaking scraper | Medium | Implement resilient CSS selector + text-based DOM parsing; alert Phosra engineering team on parse failures; version-pin Playwright |
| ToS enforcement by Perplexity | Low (currently) | No documented enforcement against parental control tools; child safety safe harbor argument available; maintain low automation footprint |

---

## Terms of Service Summary

| Document | Relevant Clause | Risk to Phosra |
|---|---|---|
| Consumer ToS | Prohibits "any robot, spider, crawlers, scraper, or other automatic device... that intercepts, mines, scrapes, extracts, or otherwise accesses the Services" | Applies to all Playwright web UI automation. Medium risk if detected. |
| API ToS | Permits automated access via documented API key mechanism | No risk for Sonar API usage. Phosra may use the API freely for its documented purposes. |
| API AUP | Prohibits competitive use; prohibits unlawful or unethical use | Parental control use case is neither competitive nor unethical. Low AUP risk. |
| Privacy Policy | Data processing as described above | Phosra becomes a data processor if it reads and stores Thread content. Requires GDPR/COPPA analysis for Phosra's own data handling. |
| Enterprise ToS | Not applicable to consumer child accounts | N/A |
