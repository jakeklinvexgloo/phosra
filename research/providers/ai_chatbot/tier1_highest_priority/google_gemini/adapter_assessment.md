# Google Gemini — Phosra Adapter Assessment

**Platform:** Google Gemini (Google)
**Assessment Date:** 2026-02-27
**Overall Feasibility:** 4/10
**Recommended Strategy:** Hybrid (Browser Extension + Network-Level + Gemini API Content Classification + Family Link Manual Setup)

---

## Executive Summary

Google Gemini presents a unique integration challenge for Phosra. Unlike ChatGPT, where OpenAI at least provides a parental control web dashboard for Playwright automation, Google routes all parental controls through Family Link — a cross-platform parental control system with **zero public API**. The developer-facing Gemini API (Google AI Studio / Vertex AI) is well-documented and includes configurable safety settings per request, which is more capable than OpenAI's classification-only Moderation API. However, this developer API cannot read or modify consumer Gemini account settings, Family Link configurations, or conversation history.

Key facts:
- Google Family Link has no public API (open feature request since 2023, no resolution)
- Consumer Gemini has no documented internal API endpoints for account management
- Gemini Developer API offers configurable safety thresholds (BLOCK_NONE to BLOCK_LOW_AND_ABOVE) — useful for content classification
- No parent notification system exists for safety events (self-harm, distress)
- Under-13 data is retained for only 72 hours and not used for training
- Gemini for under-13 is not available in the EEA/UK

The Phosra Gemini adapter must rely on: browser extension monitoring (desktop), network-level enforcement (DNS blocking), manual Family Link setup (parent-guided), and creative use of the Gemini Developer API for content classification of captured text.

---

## API Inventory

### Available APIs (Developer-Facing)

| API | Endpoint | Auth | Relevance to Phosra |
|-----|----------|------|---------------------|
| Gemini Developer API | `POST /v1beta/models/{model}:generateContent` | API Key / OAuth2 | **High** — content classification with configurable safety settings |
| Gemini Streaming API | `POST /v1beta/models/{model}:streamGenerateContent` | API Key / OAuth2 | Low — developer use only |
| Token Counter | `POST /v1beta/models/{model}:countTokens` | API Key / OAuth2 | Low |
| Models List | `GET /v1beta/models` | API Key / OAuth2 | None |
| Context Caching | `POST /v1beta/cachedContents` | API Key / OAuth2 | None |
| Vertex AI (Enterprise) | Multiple endpoints | Service Account | Low — enterprise/cloud only |

### Unavailable APIs (Parental Controls)

| Needed Capability | API Status | Alternative |
|-------------------|-----------|-------------|
| Family Link account management | No API (open feature request #302210616) | Manual parent setup via Family Link app |
| Gemini on/off toggle for child | No API | Manual Family Link app toggle |
| Content safety level configuration | No API (consumer app) | Browser extension detection + Gemini API classification |
| Conversation history access | No API | Browser extension DOM capture |
| Usage statistics | No API | Browser extension tracking |
| Safety alert webhooks | No API | Browser extension + Gemini API classification |
| Memory management | No API | No viable alternative |
| Gems access control | No API | No viable alternative |
| Device screen time limits | No API | Manual Family Link configuration |
| Keep Activity toggle | No API | Manual parent/teen configuration |

---

## Adapter Architecture

### Recommended: Hybrid Multi-Layer Approach

```
+---------------------------------------------------+
|                 Phosra Platform                     |
|                                                     |
|  +-----------+  +----------+  +-----------------+  |
|  | Extension |  | Network  |  | Content Classifier| |
|  | Manager   |  | Controls |  | (Gemini API)    |  |
|  +-----+-----+  +----+-----+  +--------+--------+  |
|        |              |                 |            |
+--------+--------------+-----------------+------------+
         |              |                 |
    +----v----+   +-----v-----+    +------v-------+
    | Browser |   | DNS/Router|    | Gemini       |
    |Extension|   |  Control  |    | Developer API|
    |(client) |   | (network) |    | (classify)   |
    +----+----+   +-----+-----+    +------+-------+
         |              |                 |
         +--------------+---------+-------+
                        |
                  +-----v-----+
                  |  Gemini   |
                  | (consumer)|
                  +-----------+
```

### Layer 1: Browser Extension (Monitoring + Enforcement)

**Capabilities:**
- Track message count per session and per day
- Track session duration (time spent on gemini.google.com)
- Capture visible conversation text for content analysis
- Inject break reminders and time warnings
- Block the page when limits are exceeded
- Detect which model is being used (Free vs. Pro)

**Limitations:**
- Desktop browsers only (Chrome, Firefox, Edge)
- Cannot monitor Gemini Android/iOS apps (unlike ChatGPT which has similar limitation)
- Cannot monitor Gemini integrated into Google Workspace apps (Docs, Gmail, Slides)
- Can be disabled by the user
- Gemini's web interface may use different DOM structures than ChatGPT

**Implementation Notes:**
- Target `gemini.google.com` domain
- Gemini uses a server-rendered React-like framework; DOM structure may differ from ChatGPT's client-heavy React
- Conversation text is rendered in standard HTML elements
- No WebSocket streaming visible to extensions — responses appear as progressive DOM updates
- Extension-to-Phosra communication via authenticated API calls

### Layer 2: Network-Level Controls (Hard Enforcement)

**Capabilities:**
- Block `gemini.google.com` and related Gemini domains
- Enforce schedule restrictions at the network level
- Block after time/message limits exceeded
- Cannot be bypassed by switching browsers or disabling extension

**Limitations:**
- Blocks the entire Gemini platform, not granular
- VPN can bypass DNS-level blocks
- Mobile data (cellular) bypasses home network controls
- Blocking Google domains broadly could affect other Google services

**Domain Blocklist:**
```
gemini.google.com
generativelanguage.googleapis.com
aistudio.google.com
alkali-crosswise.sandbox.google.com (Gemini sandbox)
```

**Note:** Be careful not to block `*.google.com` broadly, as this would block Gmail, Google Docs, Google Search, and other essential services. Gemini-specific subdomains must be targeted precisely.

### Layer 3: Gemini Developer API (Content Classification)

**Capabilities:**
- Classify captured conversation text using Gemini's own safety framework
- Configure safety thresholds per category (harassment, hate, sexual, dangerous, civic integrity)
- Get safety ratings (probability scores) for each harm category
- **Advantage over OpenAI Moderation API:** Gemini's API can both classify content AND be configured to respond with safety-aware guidance, not just flag content

**Limitations:**
- Requires sending child's conversation text to Google's API (privacy consideration)
- API has rate limits (free tier: 2-15 RPM)
- Costs money at scale beyond free tier
- Cannot modify consumer Gemini's built-in filters

**Implementation Notes:**
- Use `gemini-2.0-flash-lite` for classification (cheapest, fastest)
- Configure maximum safety settings (BLOCK_LOW_AND_ABOVE for all categories)
- Parse `safetyRatings` in API response for per-category scores
- Feed captured text from browser extension to Gemini API for classification
- Cost estimate: ~$0.10 per 1M tokens (Flash Lite) — very cost-effective

### Layer 4: Family Link Manual Setup (Parent-Guided Configuration)

**Capabilities:**
- Guide parents through enabling/disabling Gemini access
- Guide parents through setting device screen time limits
- Guide parents through configuring bedtime/downtime schedules
- Provide step-by-step instructions within Phosra's onboarding flow

**Limitations:**
- Not automatable — requires manual parent action
- No programmatic verification that parent completed the setup
- Parent may not follow through on all recommended settings

**Implementation Notes:**
- Create Phosra onboarding wizard with Family Link setup instructions
- Include screenshots and step-by-step guides
- Provide a checklist for parents to confirm completion
- Periodically remind parents to verify Family Link settings

---

## Adapter Method Assessments

### 1. `authenticate(credentials) -> Session`

| Aspect | Detail |
|---|---|
| **Implementation** | Gemini Developer API Key (content classification) + No consumer auth |
| **API Accessibility Verdict** | Level 2 — Developer API key works; no consumer account API exists |
| **Approach** | Two authentication scenarios: (a) For content classification via Gemini Developer API, use a Phosra-owned API key — no consumer auth needed. Obtain from Google AI Studio (aistudio.google.com). (b) For consumer account management — **not possible**. Google does not provide any consumer account API or OAuth flow for Gemini. Family Link has no API. Playwright automation of Family Link web interface could theoretically work but Family Link's web interface is minimal and mobile-first, making it unreliable. |
| **API Alternative** | Google OAuth2 exists for Google Cloud APIs (Vertex AI) but grants developer API access only, not consumer Gemini account management or Family Link access. |
| **Auth Required** | Phosra-owned Google AI Studio API key for content classification. No consumer credentials needed or storable. |
| **Data Available** | API key grants access to text generation with safety ratings |
| **Data NOT Available** | Consumer session tokens, Family Link tokens, account metadata, parental control state |
| **Complexity** | Low — API key creation is straightforward via Google AI Studio |
| **Risk Level** | Low — Standard API key authentication; no consumer credential risk |
| **Latency** | Instant (API key auth) |
| **Recommendation** | Use Phosra-owned API key for Gemini Developer API. Do NOT attempt to authenticate as consumer users. Accept that consumer account management is not automatable. |

### 2. `getAccountSettings() -> SafetySettings`

| Aspect | Detail |
|---|---|
| **Implementation** | Not possible via API |
| **API Accessibility Verdict** | Level 0 — No API for reading consumer Gemini settings or Family Link configuration |
| **Approach** | There is no mechanism — API, Playwright, or otherwise — to reliably read a child's current Gemini safety settings. Family Link's web interface (familylink.google.com) shows limited settings but has no documented DOM structure for scraping and is heavily mobile-optimized. The consumer Gemini settings page (gemini.google.com/settings) requires the user's own Google session and shows only personal settings, not parent-configurable safety settings. |
| **API Alternative** | None. Google has no equivalent to OpenAI's parent dashboard that could be automated. |
| **Auth Required** | Would require parent's Google Account session for Family Link, or child's Google Account session for Gemini settings — neither is practically obtainable |
| **Data Available** | None programmatically |
| **Data NOT Available** | Gemini on/off status, Keep Activity status, content filter configuration, device screen time limits, bedtime/downtime schedule, memory settings |
| **Complexity** | N/A — not implementable |
| **Risk Level** | N/A |
| **Latency** | N/A |
| **Recommendation** | Mark as `UnsupportedOperationError`. Instead, guide parents through a manual setup checklist and rely on the browser extension to infer some settings (e.g., whether the child can generate images indicates age bracket). |

### 3. `setContentSafetyLevel(level)`

| Aspect | Detail |
|---|---|
| **Implementation** | Gemini Developer API (defense-in-depth classification) + Manual Family Link guidance |
| **API Accessibility Verdict** | Level 1 — Can classify content via Developer API; cannot change consumer Gemini filters |
| **Approach** | Google Gemini's consumer app does not expose content safety settings to parents or third parties. The binary Family Link toggle (Gemini on/off) is the only parent control. However, Phosra can implement defense-in-depth by: (1) Capturing conversation text via browser extension, (2) Running it through the Gemini Developer API with strict safety settings (BLOCK_LOW_AND_ABOVE for all categories), (3) Using the safety ratings to trigger parent alerts for concerning content. This approach classifies content using Google's own safety framework but cannot modify the consumer app's built-in filter behavior. |
| **API Alternative** | Gemini Developer API's safety feedback (safetyRatings per response) provides per-category probability scores: harassment, hate speech, sexually explicit, dangerous content, civic integrity. |
| **Auth Required** | Phosra API key for Gemini Developer API |
| **Data Available** | Safety classification scores per harm category |
| **Data NOT Available** | Ability to change consumer Gemini filter levels; parent-configurable content thresholds |
| **Complexity** | Medium — API classification is straightforward; mapping to parent alerts requires threshold tuning |
| **Risk Level** | Low — Using standard API; no ToS violation |
| **Latency** | ~200-500ms per classification request (Gemini Flash) |
| **Recommendation** | Implement Gemini API classification as P1. This provides content safety monitoring even though it cannot enforce filter changes on the consumer app. Guide parents to use Family Link's on/off toggle as the nuclear option. |

### 4. `setConversationLimits(config)`

| Aspect | Detail |
|---|---|
| **Implementation** | Phosra-managed (browser extension + network-level enforcement) |
| **API Accessibility Verdict** | Level 0 — Gemini has NO native conversation limits for safety purposes |
| **Approach** | This is a major Phosra value-add. Gemini's only "limits" are tier-based prompt caps (5/day free, 100/day Pro, 500/day Ultra), which are usage-management features, not safety controls. Phosra's browser extension tracks: (a) session duration, (b) daily message count, (c) session message count. When limits are reached, the extension injects a blocking overlay on gemini.google.com. As a hard enforcement backup, Phosra triggers network-level DNS blocking of Gemini domains. For schedule enforcement (quiet hours, bedtime), Phosra uses network-level blocking combined with guidance for parents to configure Family Link's device-level downtime. |
| **API Alternative** | None. Gemini has no native time/message limits for child safety. Family Link provides device-level time limits but not Gemini-specific limits. |
| **Auth Required** | None for extension enforcement |
| **Data Available** | Extension-tracked: messages sent, session duration, active/idle time |
| **Data NOT Available** | Server-side usage data; Gemini does not expose message counts or session duration via any API |
| **Complexity** | Medium — Extension counting is straightforward; network enforcement requires Phosra infrastructure |
| **Risk Level** | Low — Extension-based limits are reliable on desktop |
| **Latency** | Real-time (extension tracking) |
| **Recommendation** | Implement as P0 priority. Gemini's complete lack of conversation limits is its biggest safety gap for children. Extension-based counting + network-level hard enforcement provides reliable protection on desktop. Document mobile gap clearly for parents. |

### 5. `getConversationHistory(dateRange) -> Conversation[]`

| Aspect | Detail |
|---|---|
| **Implementation** | Browser extension (partial — active view only) |
| **API Accessibility Verdict** | Level 0 — No API for consumer Gemini conversation history |
| **Approach** | The browser extension captures conversation text visible in the active Gemini tab using DOM scraping. When a user scrolls through a conversation, the extension captures visible messages. For active conversations, response text is captured as it appears in the DOM (Gemini renders responses progressively). Captured text is sent to Phosra's backend for storage and analysis. |
| **API Alternative** | The Gemini Developer API manages developer-created API conversations, NOT consumer Gemini app conversations. There are no known reverse-engineered internal APIs for Gemini consumer conversation history (unlike ChatGPT's `backend-api/conversations`). |
| **Auth Required** | None for extension capture (runs in-browser with the user's existing session) |
| **Data Available** | Visible conversation text (user messages + AI responses), conversation titles (if visible in sidebar) |
| **Data NOT Available** | Full conversation history (only captures active view), older/archived conversations, system instructions, model used per response, token counts, conversation metadata, Gem context |
| **Complexity** | High — DOM scraping is fragile; Gemini's interface may change frequently |
| **Risk Level** | Medium — Incomplete data; DOM changes break capture; privacy implications of storing child's conversations |
| **Latency** | Real-time for active conversations; no historical access |
| **Recommendation** | Implement extension-based capture for active monitoring. Feed captured text to Gemini Developer API for safety classification. Do NOT attempt to reverse-engineer Gemini internal APIs. Accept that full historical conversation access is not achievable. |

### 6. `getUsageAnalytics(dateRange) -> UsageStats`

| Aspect | Detail |
|---|---|
| **Implementation** | Browser extension (primary) |
| **API Accessibility Verdict** | Level 0 — No API for consumer usage statistics |
| **Approach** | The browser extension is the sole data source, tracking: messages sent per session/day, session duration, time-of-day patterns, model used (Free/Pro/Ultra), feature usage. This data is reported to Phosra's backend for aggregation. Unlike ChatGPT, there is no parent dashboard to scrape as a supplementary data source — Family Link shows only device-level app time, not Gemini-specific analytics. |
| **API Alternative** | The Developer API provides token usage per API call, which is irrelevant to consumer monitoring. Family Link's web interface shows basic device screen time data but not Gemini conversation analytics. |
| **Auth Required** | None for extension tracking |
| **Data Available** | Extension-tracked: message count, session duration, timestamps, features used |
| **Data NOT Available** | Server-side accurate time tracking, mobile app usage, voice conversation duration, Gemini usage within Google Workspace apps (Docs, Gmail), token-level usage |
| **Complexity** | Low-Medium — Extension data collection is straightforward; aggregation on Phosra side |
| **Risk Level** | Low — Extension data is reliable for desktop usage |
| **Latency** | Real-time (extension) |
| **Recommendation** | Implement extension-based analytics as P0. This powers Phosra's usage dashboard. There is no supplementary data source to cross-validate against (unlike ChatGPT's parent dashboard). |

### 7. `toggleFeature(feature, enabled)`

| Aspect | Detail |
|---|---|
| **Implementation** | Not reliably possible |
| **API Accessibility Verdict** | Level 0 — No API for feature toggles in consumer Gemini or Family Link |
| **Approach** | The only feature toggle available to parents is the binary Gemini on/off in Family Link. There are no granular feature toggles (unlike ChatGPT's parent dashboard with voice, memory, DALL-E, and training opt-out toggles). Even this single toggle has no API — it must be set manually in the Family Link app. Playwright automation of the Family Link web interface is theoretically possible but practically unreliable due to the interface's mobile-first design, Google's anti-automation measures, and the interface's reliance on JavaScript rendering. |
| **API Alternative** | None. Google does not expose consumer feature toggles via any API. |
| **Auth Required** | Would require parent's Google Account session (not obtainable programmatically) |
| **Data Available** | None programmatically |
| **Data NOT Available** | Gemini on/off state, memory settings, Keep Activity status, Gems access, image generation status, voice mode settings |
| **Complexity** | N/A — not practically implementable |
| **Risk Level** | N/A |
| **Latency** | N/A |
| **Recommendation** | Mark as `UnsupportedOperationError` for programmatic toggle. Instead, provide in-app guidance for parents to manually configure Family Link. Include step-by-step instructions and screenshots. Phosra's browser extension can detect some feature states indirectly (e.g., if image generation buttons are present, the child has adult-level access). |

### 8. `setParentalControls(config)`

| Aspect | Detail |
|---|---|
| **Implementation** | Manual parent guidance only |
| **API Accessibility Verdict** | Level 0 — No API for parental control configuration |
| **Approach** | Unlike ChatGPT where Playwright can automate the parent dashboard, Google offers no equivalent web-based parent dashboard for Gemini-specific settings. All parental controls flow through Family Link, which has no API. Phosra's approach: (1) In-app onboarding wizard guides parents through Family Link setup, (2) Checklist of recommended settings (Gemini on/off, device time limits, bedtime schedules), (3) Periodic reminders to verify Family Link settings, (4) Extension + network enforcement layers operate independently of Family Link. |
| **API Alternative** | None. The open feature request (Google Issue Tracker #302210616) for Family Link API access has been open since 2023 with no resolution. An unofficial Python `familylink` package exists on GitHub but is community-maintained and likely ToS-violating. |
| **Auth Required** | Would require parent's Google Account session |
| **Data Available** | None programmatically |
| **Data NOT Available** | All Family Link settings, Gemini configuration, device management, screen time rules |
| **Complexity** | N/A for API implementation; Medium for parent guidance workflow |
| **Risk Level** | N/A for API; Low for parent guidance |
| **Latency** | N/A — manual process |
| **Recommendation** | Invest heavily in parent guidance UX within Phosra. Since automated configuration is impossible, the quality of Phosra's setup instructions becomes critical. Include video tutorials, step-by-step screenshots, and a verification checklist. Consider in-app Family Link deep-links where possible (e.g., `familylink.google.com` links). |

### 9. `deleteConversations(conversationIds)`

| Aspect | Detail |
|---|---|
| **Implementation** | Not possible |
| **API Accessibility Verdict** | Level 0 — No API for consumer conversation deletion |
| **Approach** | Gemini allows users to delete their own conversations from the sidebar. There is no way for a parent to remotely delete a child's conversations. No internal API endpoints have been identified for Gemini conversation management (unlike ChatGPT's `backend-api/conversation/{id}`). Under-13 accounts have Keep Activity disabled by default, meaning conversations are auto-deleted after 72 hours. For teens, if Keep Activity is off (default), conversations are also auto-deleted after 72 hours. |
| **API Alternative** | None. The Developer API manages developer-created content, not consumer conversations. |
| **Auth Required** | Would require child's own Google Account session |
| **Data Available** | N/A |
| **Data NOT Available** | Remote conversation deletion; parent-initiated deletion; selective message deletion |
| **Complexity** | N/A — not implementable |
| **Risk Level** | N/A |
| **Latency** | N/A |
| **Recommendation** | Mark as `UnsupportedOperationError`. Educate parents that under-13 and teen accounts (with Keep Activity off) auto-delete conversations after 72 hours. If parents want ongoing data deletion, advise keeping Keep Activity disabled. This is actually better than ChatGPT, where conversations persist indefinitely unless manually deleted. |

### 10. `getActiveSession() -> SessionInfo`

| Aspect | Detail |
|---|---|
| **Implementation** | Browser extension (real-time session detection) |
| **API Accessibility Verdict** | Level 1 — No API for consumer session status |
| **Approach** | The browser extension detects whether the child is actively using Gemini by monitoring: (a) tab focus on gemini.google.com, (b) DOM state indicating an active conversation (message input focused, response rendering in progress), (c) last user message timestamp. The extension reports session status to Phosra in real-time via heartbeat messages (every 30-60 seconds). Session info includes: active (yes/no), current conversation context, duration, messages in current session. |
| **API Alternative** | None for consumer session status. |
| **Auth Required** | None — extension runs in the browser with the child's existing session |
| **Data Available** | Active tab status, conversation activity, message input state, session duration (extension-tracked) |
| **Data NOT Available** | Mobile app session status, Gemini usage within Workspace apps (Docs, Gmail, Slides), voice mode session data, multi-device session detection |
| **Complexity** | Low — Tab activity and DOM monitoring are basic extension capabilities |
| **Risk Level** | Low — Reliable for desktop browser usage |
| **Latency** | Real-time (extension heartbeat every 30-60 seconds) |
| **Recommendation** | Implement as P0. Session detection powers time limits, break reminders, and parent "currently active" indicators. Critical for the extension-based enforcement model. |

---

## Recommended Architecture Diagram

```
+-----------------------------------------------------------------------+
|                          PHOSRA BACKEND                                |
|                                                                        |
|  +----------------+  +------------------+  +------------------------+ |
|  | Session Tracker |  | Content Analyzer  |  | Alert Engine           | |
|  | (msg counts,    |  | (Gemini API       |  | (parent notifications, | |
|  |  time tracking) |  |  classification)  |  |  crisis response)     | |
|  +-------+--------+  +--------+---------+  +-----------+------------+ |
|          |                     |                        |              |
|  +-------+---------------------+------------------------+            |
|  |                    API Gateway                        |            |
|  +-------+---------------------+------------------------+            |
+----------+---------------------+------------------------+-------------+
           |                     |                        |
     +-----v------+       +-----v------+          +------v-------+
     | Browser     |       | Gemini     |          | DNS/Network  |
     | Extension   |       | Dev API    |          | Controller   |
     | (client)    |       | (classify) |          | (hard block) |
     +-----+------+       +-----+------+          +------+-------+
           |                     |                        |
           |                     |                        |
     +-----v------+       +-----v------+          +------v-------+
     | gemini.     |       | generative |          | Router/DNS   |
     | google.com  |       | language.  |          | Firewall     |
     | (consumer)  |       | googleapis |          |              |
     +-------------+       +------------+          +--------------+

     +-------------------------------------------------------------+
     |                    PARENT'S DEVICE                           |
     |                                                              |
     |  +------------------+  +----------------------------------+ |
     |  | Family Link App  |  | Phosra App                       | |
     |  | (manual config)  |  | (alerts, analytics, guidance)    | |
     |  +------------------+  +----------------------------------+ |
     +-------------------------------------------------------------+
```

---

## Real-Time Monitoring Strategy

### Data Flow

1. **Extension captures** message text from Gemini DOM (real-time)
2. **Extension reports** message count, session duration, active status to Phosra backend (every 30-60 seconds)
3. **Phosra backend sends** captured text to Gemini Developer API for safety classification (~200-500ms)
4. **Gemini API returns** safety ratings per harm category (harassment, hate, sexual, dangerous, civic integrity)
5. **Alert engine evaluates** safety ratings against parent-configured thresholds
6. **If threshold exceeded:** Push notification + email to parent within 60 seconds
7. **If time limit exceeded:** Extension injects blocking overlay; if extension is bypassed, Phosra triggers DNS block

### Monitoring Coverage

| Channel | Monitored? | Method |
|---------|-----------|--------|
| Gemini web (gemini.google.com) | Yes | Browser extension |
| Gemini Android app | No | Not possible (no extension) |
| Gemini iOS app | No | Not possible (no extension) |
| Gemini in Google Docs | No | Different domain/interface |
| Gemini in Gmail | No | Different interface |
| Gemini in Google Classroom | No | Different interface |
| Gemini voice mode | Partial | Extension detects voice UI but cannot capture audio |

### Mobile Gap
The mobile gap for Gemini is more severe than for ChatGPT because:
1. Gemini is deeply integrated into Android (especially Pixel devices) as the default AI assistant
2. "Hey Google" voice invocations can trigger Gemini on Android without opening the app
3. Gemini is integrated into Google Messages, Google Search, and other mobile-first Google services
4. Family Link's device-level controls can restrict screen time but not Gemini-specific content

**Mitigation:** Parents should use Family Link to set strict device-level app time limits for the Gemini app. On Android, parents can disable "Hey Google" Gemini activation. On iOS, parents can use Screen Time to limit the Gemini app.

---

## Development Effort Estimate

| Component | Effort (Person-Weeks) | Priority | Dependencies |
|---|---|---|---|
| Browser extension (Gemini DOM monitoring) | 3-4 weeks | P0 | Gemini DOM analysis |
| Extension-to-backend API pipeline | 1-2 weeks | P0 | Backend API design |
| Gemini Developer API content classification | 2-3 weeks | P1 | API key provisioning |
| Network-level DNS enforcement integration | 1-2 weeks | P0 | Phosra DNS infrastructure |
| Parent onboarding wizard (Family Link guidance) | 2-3 weeks | P1 | UX design, screenshots |
| Usage analytics dashboard (Gemini view) | 2-3 weeks | P1 | Extension data pipeline |
| Alert engine (safety thresholds, notifications) | 2-3 weeks | P1 | Content classification pipeline |
| Break reminder injection (extension UI) | 1 week | P2 | Extension framework |
| Client-side NLP (topic detection, PII) | 3-4 weeks | P2 | NLP model selection |
| Conversation capture and storage | 2-3 weeks | P2 | Privacy policy, encryption |
| **Total** | **20-28 weeks** | | |

---

## Detection Vectors and Mitigations

| Detection Vector | Risk | Mitigation |
|---|---|---|
| Gemini DOM structure changes | High | Versioned selectors, rapid update process, structural pattern matching over specific class names |
| Google detects extension as automated tool | Low | Extension behaves as passive observer, no automated clicks or form submissions |
| Child disables extension | Medium | Phosra detects missing heartbeat within 60 seconds, alerts parent |
| Child uses mobile Gemini app | High | Network-level controls on home WiFi; Family Link app time limits; parent education |
| Child uses Gemini in Google Docs/Gmail | Medium | Cannot monitor; parent education about integrated Gemini features |
| VPN bypasses DNS blocking | Low | Device-level controls, parent education |
| Child creates unmanaged Google Account | Medium | Google's age verification prevents under-13 accounts without parent; teens can create unsupervised accounts |
| Gemini API rate limits exceeded | Low | Batch classification requests; use cheapest model (Flash Lite) |

---

## Terms of Service Summary

| Provision | Relevant ToS | Impact on Phosra |
|---|---|---|
| Automated access to Google services | Google ToS prohibits automated access unless specifically permitted | Browser extension is passive observation (gray area); Gemini Developer API is fully permitted |
| Family Link third-party access | No official third-party API; ToS implies Google-controlled ecosystem | Cannot automate Family Link; must rely on manual parent setup |
| Gemini Developer API usage | Acceptable Use Policy permits content classification use cases | Phosra's content classification is a valid use case |
| Data processing of minor's conversations | Google privacy policies apply; COPPA requirements | Phosra must disclose sending captured text to Gemini API; obtain parent consent |
| Rate limits and fair use | API rate limits enforce fair use; free tier has strict limits | Must stay within rate limits; may need paid tier at scale |
| Reselling or redistribution | Cannot resell or redistribute Gemini API outputs | Phosra's use (classification scores for parent alerts) is likely permissible |

---

## Risk Analysis

### Integration Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Gemini web UI changes break extension | High | High | Versioned selectors, rapid update process |
| Family Link adds Gemini-specific controls | Low (positive) | Low | Monitor Google announcements; if API added, migrate from manual to automated |
| Google adds public Family Link API | Low (positive) | Very Low | Open feature request since 2023 with no progress; unlikely near-term |
| Mobile Gemini usage bypasses extension | High | High | Network controls, Family Link device limits, parent education |
| Gemini integration into Workspace apps expands | Medium | High | Cannot monitor; focus on gemini.google.com as primary target |
| Google blocks browser extensions on Gemini | Medium | Low | Would affect all extensions; unlikely broad action |
| COPPA enforcement forces Google to add parental APIs | Low (positive) | Medium | FTC complaints are active; regulatory pressure may force API creation |

### Privacy Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Sending child conversations to Gemini API | Medium | Clear disclosure in Phosra privacy policy; Google does not retain API inputs for training when configured properly |
| Storing conversation captures on Phosra servers | High | End-to-end encryption, minimal retention, parent consent |
| Parent accessing teen conversation content | Medium | Summary-only default, full access opt-in with teen disclosure |
| Extension capturing sensitive Google Account data | Medium | Extension scoped strictly to gemini.google.com; no Google Account credential capture |

---

## Implementation Priority

### Phase 1 (MVP) — High Value, High Feasibility
1. **Browser extension with message/time counting** — Fills Gemini's biggest gap (no time limits)
2. **Network-level quiet hours enforcement** — Hard enforcement parents can trust
3. **Parent onboarding wizard for Family Link** — Critical since no automation is possible
4. **Usage statistics dashboard** — Extension-tracked data on Phosra dashboard

### Phase 2 — Medium Value, Medium Feasibility
5. **Gemini Developer API content classification** — Safety monitoring with Google's own taxonomy
6. **Break reminders injection** — Wellness prompts during long sessions
7. **Alert engine for safety events** — Parent notifications for concerning content

### Phase 3 — High Value, Low Feasibility
8. **Client-side NLP for topic detection** — Custom topic blocking, homework detection, PII detection
9. **Conversation capture and summarization** — Partial transcript access for parents
10. **Emotional dependency analysis** — Session pattern analysis over time

---

## Maintenance Burden

| Component | Update Frequency | Effort |
|-----------|-----------------|--------|
| Browser extension (DOM selectors) | Monthly+ (Google updates frequently) | High |
| Gemini Developer API integration | Rare (stable API, versioned) | Low |
| Network-level controls | Rare (domain list relatively stable) | Low |
| Parent onboarding guide | Quarterly (Family Link UI changes) | Medium |
| Client-side NLP models | Quarterly | Medium |

**Estimated maintenance cost:** Medium — Gemini's web interface updates may be less frequent than ChatGPT's, but Google's broader ecosystem changes (Workspace integration, Family Link updates) add maintenance surface area.

---

## Verdict

Google Gemini is a **must-have** platform for Phosra due to Google's dominant presence in education (Google Workspace for Education is the most widely used K-12 platform in the US) and Gemini's deep integration into the Android ecosystem. The adapter is more challenging than ChatGPT because Google routes all parental controls through Family Link (no API) rather than providing a platform-specific parent dashboard.

The silver lining: Gemini's Developer API with configurable safety settings is more capable for content classification than OpenAI's Moderation API. And Gemini's shorter data retention for minors (72 hours) and Keep Activity off by default for teens is actually better privacy practice than ChatGPT.

**Recommended next steps:**
1. Build a Chrome extension prototype targeting gemini.google.com — verify DOM structure and message capture reliability
2. Test Gemini Developer API content classification accuracy and latency with representative teen conversation scenarios
3. Document Gemini's complete DOM structure for extension development
4. Design the parent onboarding wizard for Family Link manual configuration
5. Evaluate Gemini's integration surface area: how many Google services now embed Gemini, and which ones can we monitor?
6. Monitor FTC activity on COPPA complaints — regulatory action could force Google to create parental control APIs
7. Assess whether the unofficial `familylink` Python package could serve as an interim automation path (ToS risk must be evaluated)
