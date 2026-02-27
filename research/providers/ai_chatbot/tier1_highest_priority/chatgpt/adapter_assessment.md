# ChatGPT — Phosra Adapter Assessment

**Platform:** ChatGPT (OpenAI)
**Assessment Date:** 2026-02-27
**Overall Feasibility:** 5/10
**Recommended Strategy:** Hybrid (Browser Extension + Network-Level + Moderation API)

---

## Executive Summary

ChatGPT presents a paradox for Phosra integration: OpenAI operates the most capable and well-documented API in the AI industry, but provides **zero API access to parental control features**. The developer API (Responses, Conversations, Moderation) is world-class; the parental control surface is web-dashboard-only with no programmatic access.

Key 2025-2026 developments: OpenAI launched parental controls (Sep 2025) with quiet hours, feature toggles, and safety notifications. The Assistants API is being deprecated (sunset Aug 2026) in favor of the Responses API and Conversations API. The omni-moderation model now supports multi-modal (text + image) classification. An age prediction system (Jan 2026) uses behavioral signals to auto-detect teens. None of these developments introduced a parental control API.

This means the Phosra ChatGPT adapter must rely on a combination of client-side monitoring (browser extension), network-level enforcement (DNS/router blocking), and creative use of OpenAI's public APIs (Moderation API for content classification).

---

## API Inventory

### Available APIs (Developer-Facing)

| API | Endpoint | Auth | Relevance to Phosra |
|-----|----------|------|---------------------|
| Chat Completions | `POST /v1/chat/completions` | API Key | Low — developer API, not consumer |
| Moderation | `POST /v1/moderations` | API Key | **High** — free content classification (text + image via omni-moderation) |
| Responses | `POST /v1/responses` | API Key | Low — developer API (replacing Assistants) |
| Conversations | `POST /v1/conversations` | API Key | Low — developer API (stateful conversation management) |
| Assistants | Multiple endpoints | API Key | **Deprecated** — sunset Aug 2026, replaced by Responses API |
| Models | `GET /v1/models` | API Key | None |
| Images (DALL-E/GPT-4o) | `POST /v1/images/generations` | API Key | None |
| Audio (Realtime) | WebSocket + REST | API Key | None |

### Unavailable APIs (Parental Controls)

| Needed Capability | API Status | Alternative |
|-------------------|-----------|-------------|
| Parent-teen account linking | No API | Playwright automation of web dashboard |
| Safety settings configuration | No API | Playwright automation |
| Quiet hours management | No API | Playwright automation |
| Feature toggles (DALL-E, voice, etc.) | No API | Playwright automation |
| Usage statistics retrieval | No API | Browser extension tracking |
| Conversation transcript access | No API | Browser extension capture (partial) |
| Safety alert webhooks | No API | Browser extension detection |
| Memory management | No API | No viable alternative |
| Account-level content filter config | No API | No viable alternative |

---

## Adapter Architecture

### Recommended: Hybrid Multi-Layer Approach

```
┌─────────────────────────────────────────────────┐
│                 Phosra Platform                   │
│                                                   │
│  ┌───────────┐  ┌──────────┐  ┌───────────────┐ │
│  │ Extension  │  │ Network  │  │  Config Sync  │ │
│  │ Manager    │  │ Controls │  │  (Playwright) │ │
│  └─────┬─────┘  └────┬─────┘  └──────┬────────┘ │
│        │              │               │           │
└────────┼──────────────┼───────────────┼───────────┘
         │              │               │
    ┌────▼────┐   ┌─────▼─────┐  ┌─────▼──────┐
    │ Browser │   │ DNS/Router│  │   OpenAI    │
    │Extension│   │  Control  │  │  Dashboard  │
    │(client) │   │ (network) │  │ (Playwright)│
    └────┬────┘   └─────┬─────┘  └─────┬──────┘
         │              │               │
         └──────────────┼───────────────┘
                        │
                  ┌─────▼─────┐
                  │  ChatGPT  │
                  │(consumer) │
                  └───────────┘
```

### Layer 1: Browser Extension (Monitoring + Enforcement)

**Capabilities:**
- Track message count per session and per day
- Track session duration (time spent on chat.openai.com)
- Capture visible conversation text for content analysis
- Detect crisis UI elements (988 hotline display)
- Inject break reminders and time warnings
- Block the page when limits are exceeded
- Detect which model/GPT is being used

**Limitations:**
- Desktop browsers only (Chrome, Firefox, Edge, Safari)
- Cannot monitor mobile apps (iOS/Android ChatGPT app)
- Can be disabled by the user (though Phosra can detect this)
- Only captures text visible in the viewport, not full conversation history
- Does not intercept API-level data

**Implementation Notes:**
- Use `MutationObserver` to detect new messages in the ChatGPT DOM
- ChatGPT's React-based UI has relatively stable DOM structure but changes with updates
- WebSocket monitoring can detect streaming responses
- Extension-to-Phosra communication via authenticated API calls

### Layer 2: Network-Level Controls (Hard Enforcement)

**Capabilities:**
- Block `chat.openai.com`, `chatgpt.com`, and `api.openai.com` domains
- Enforce schedule restrictions (quiet hours) at the network level
- Block after time/message limits exceeded (triggered by extension or Phosra backend)
- Cannot be bypassed by switching browsers or disabling extension

**Limitations:**
- Requires Phosra router/DNS integration OR device-level DNS configuration
- Blocks the entire ChatGPT platform, not granular (can't allow homework help but block roleplay)
- VPN can bypass DNS-level blocks
- Mobile data (cellular) bypasses home network controls

**Implementation Notes:**
- Integrate with Phosra's existing DNS/router control infrastructure
- Domain list: `chat.openai.com`, `chatgpt.com`, `cdn.openai.com`, `api.openai.com`
- Time-based rules: Block domains during quiet hours
- Event-triggered rules: Block domains when extension reports limit exceeded

### Layer 3: OpenAI Moderation API (Content Classification)

**Capabilities:**
- Classify text and images against OpenAI's taxonomy using `omni-moderation-latest` model (built on GPT-4o)
- Multi-modal: text + image analysis in a single request (new as of late 2025)
- Free, no usage limits disclosed (generous rate limits)
- Consistent, calibrated scoring (confidence scores now reflect real probability of violation)
- Categories: hate, harassment, self-harm (3 sub-types), sexual (2 sub-types), violence (2 sub-types), plus new text-only harm categories
- 42% better multilingual accuracy than previous model; state-of-the-art across 40+ languages

**Limitations:**
- Requires text to be sent to OpenAI's API (privacy consideration — sending child's conversations to OpenAI for classification)
- Image moderation requires sending images to OpenAI (additional privacy concern for uploaded photos)
- Does not detect manipulation, emotional exploitation, or academic dishonesty
- Latency: ~200ms per request

**Implementation Notes:**
- Feed captured conversation text from the browser extension to the Moderation API
- Use classification scores to trigger parent alerts
- Map OpenAI categories to Phosra's safety policy configuration
- Consider privacy implications: conversations sent to Moderation API are not stored by OpenAI (per docs)

### Layer 4: Playwright Configuration Sync (Settings Management)

**Capabilities:**
- Automate the OpenAI parent dashboard to:
  - Set quiet hours
  - Toggle features (DALL-E, voice, web browsing)
  - Check current settings
- Sync Phosra safety policy → ChatGPT parent settings

**Limitations:**
- Fragile — any UI change breaks automation
- Requires parent's OpenAI credentials
- Slow (browser automation is inherently slow)
- May trigger anti-automation detection (Cloudflare, CAPTCHA)
- Cannot access features that don't exist in the dashboard

**Implementation Notes:**
- Run as a periodic sync (not real-time)
- Use headless Chromium with stealth plugins
- Implement robust error handling and retry logic
- Alert Phosra if sync fails (so parent knows settings may be out of sync)
- Consider: is this worth the maintenance cost given the limited settings available?

---

## Capability Matrix

| Phosra Control Category | ChatGPT Native? | Phosra Adapter? | Method | Reliability |
|------------------------|-----------------|-----------------|--------|------------|
| **Content Safety** | | | | |
| Explicit content filter | Yes (teen default) | Monitor | Extension + Moderation API | Medium |
| Violence filter | Yes (teen default) | Monitor | Extension + Moderation API | Medium |
| Self-harm detection | Yes | Alert forwarding | Extension detects crisis UI | Medium |
| Custom topic blocking | No | Yes | Extension + client-side NLP | Low |
| Jailbreak detection | Partial | Monitor | Moderation API on responses | Low |
| **Conversation Controls** | | | | |
| Daily time limit | No | Yes | Extension + network block | High |
| Message limit | No | Yes | Extension counting | High |
| Session cooldown | No | Yes | Extension timer | High |
| Break reminders | No | Yes | Extension injection | High |
| Quiet hours | Yes (parent) | Sync | Playwright + network block | High |
| Schedule (weekday/weekend) | No | Yes | Extension + network | High |
| **Emotional Safety** | | | | |
| Block romantic roleplay | Yes (teen) | Monitor | Extension + NLP | Medium |
| Dependency detection | No | Partial | Extension session analysis | Low |
| AI identity enforcement | Partial | No | Cannot modify model behavior | None |
| **Privacy** | | | | |
| PII sharing detection | No | Partial | Extension + NLP | Low |
| Block image uploads | Yes (teen DALL-E) | Sync | Playwright | Medium |
| Memory management | Manual | No | No API or viable automation | None |
| Data deletion | Manual | No | No API | None |
| **Academic** | | | | |
| Homework detection | No | Partial | Extension + NLP | Low |
| Learning mode enforcement | No | No | Cannot modify model behavior | None |
| **Monitoring** | | | | |
| Usage statistics | Yes (parent) | Yes | Extension tracking | High |
| Conversation summaries | Yes (parent) | Partial | Extension + NLP | Medium |
| Full transcripts | No | Partial | Extension capture (active view) | Low |
| Safety alerts | Partial | Yes | Extension + Moderation API | Medium |

---

## Adapter Method Assessments

### 1. `authenticate(credentials) -> Session`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (consumer login) + API Key (Moderation API) |
| **API Accessibility Verdict** | Level 1 — No public API for consumer account authentication |
| **Approach** | Two authentication paths: (a) For Moderation API access, use a Phosra-owned API key directly — no consumer auth needed. (b) For parent dashboard automation, use Playwright to log into the parent's OpenAI account via email/password flow on `chat.openai.com/auth/login`. Session cookies are captured and reused for subsequent Playwright operations. |
| **API Alternative** | OpenAI offers OAuth for developer API access but NOT for consumer account management. No OAuth flow exists that grants access to parental control settings. |
| **Auth Required** | Parent's OpenAI email + password for Playwright; Phosra-owned API key for Moderation API |
| **Data Available** | Session cookies, auth tokens, account metadata visible in the dashboard |
| **Data NOT Available** | Programmatic session tokens, refresh tokens, API-level consumer account access |
| **Complexity** | Medium — Playwright login is straightforward but Cloudflare/CAPTCHA challenges add complexity |
| **Risk Level** | Medium — Cloudflare anti-bot detection may block automated login; MFA adds friction; session cookies expire |
| **Latency** | 3-8 seconds (Playwright login) vs. instant (API key) |
| **Recommendation** | Use API key for Moderation API (no consumer auth needed). Playwright login only for parent dashboard settings sync — run infrequently (daily or on-demand) to minimize detection risk. |

### 2. `getAccountSettings() -> SafetySettings`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (scrape parent dashboard) |
| **API Accessibility Verdict** | Level 1 — No API for reading parental control settings |
| **Approach** | After Playwright authentication, navigate to the parent dashboard settings page. Scrape the DOM to extract current settings: quiet hours (start/end time), voice mode (on/off), memory (on/off), image generation (on/off), model training opt-out (on/off), and content sensitivity level. Parse the DOM elements to build a `SafetySettings` object. |
| **API Alternative** | None. OpenAI has no API endpoint for reading consumer account settings or parental controls. |
| **Auth Required** | Parent's OpenAI account session (via Playwright) |
| **Data Available** | Quiet hours config, feature toggles (voice, memory, DALL-E), content sensitivity settings, model training opt-out status |
| **Data NOT Available** | Internal safety classifier thresholds, per-conversation safety flags, teen's actual usage data via API, age prediction confidence score |
| **Complexity** | High — Dashboard DOM structure changes with ChatGPT UI updates; selectors must be maintained |
| **Risk Level** | Medium — DOM changes can silently return incorrect data; must validate scraped values |
| **Latency** | 3-10 seconds (Playwright page load + DOM parsing) |
| **Recommendation** | Implement but treat as supplementary. Cache results and sync periodically (every 6-12 hours). Alert Phosra if scraping fails so parent knows settings may be out of sync. |

### 3. `setContentSafetyLevel(level)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (parent dashboard) + Moderation API (defense-in-depth) |
| **API Accessibility Verdict** | Level 1 — No API for setting content safety level |
| **Approach** | ChatGPT parental controls allow parents to "reduce or block sensitive content" across categories: violent, sexual, romantic/roleplay, and extreme beauty ideals. Phosra maps its content safety levels to these toggles and uses Playwright to set them in the parent dashboard. Additionally, Phosra's browser extension runs captured conversation text through the omni-moderation API as a second layer of content classification. |
| **API Alternative** | The Moderation API (`POST /v1/moderations` with `omni-moderation-latest`) can classify content but cannot change ChatGPT's built-in filters. It serves as a detection layer, not an enforcement layer. |
| **Auth Required** | Parent's OpenAI account session (Playwright); Phosra API key (Moderation API) |
| **Data Available** | Toggle states for sensitive content categories in parent dashboard |
| **Data NOT Available** | Granular per-topic filter thresholds; cannot set custom content rules beyond OpenAI's predefined categories |
| **Complexity** | Medium — Limited number of toggles to automate; Moderation API integration is straightforward |
| **Risk Level** | Medium — Playwright-based toggles may silently fail if UI changes; teen could create a new unlinked account |
| **Latency** | 3-8 seconds (Playwright) + ~200ms (Moderation API per message) |
| **Recommendation** | Implement Playwright toggle sync for native settings. Layer the Moderation API on top via the browser extension for real-time content classification that goes beyond ChatGPT's built-in filters. |

### 4. `setConversationLimits(config)`

| Aspect | Detail |
|---|---|
| **Implementation** | Phosra-managed (browser extension + network-level enforcement) |
| **API Accessibility Verdict** | Level 0 — ChatGPT has NO native conversation limits (no time limits, no message limits) |
| **Approach** | This is Phosra's primary value-add for ChatGPT. The browser extension tracks: (a) session duration (active conversation time), (b) daily message count, (c) session message count. When limits are reached, the extension injects a blocking overlay on chat.openai.com. As a hard enforcement backup, Phosra triggers network-level DNS blocking of ChatGPT domains. Quiet hours enforcement uses a combination of Playwright (syncing to ChatGPT's native quiet hours setting) and network-level blocking. |
| **API Alternative** | None. ChatGPT's native quiet hours (parent dashboard only) is the closest feature, but it has no API. |
| **Auth Required** | None for extension enforcement; parent session for quiet hours Playwright sync |
| **Data Available** | Extension-tracked: messages sent, session duration, active/idle time |
| **Data NOT Available** | Server-side usage data; ChatGPT does not expose message counts or session duration via any API |
| **Complexity** | Medium — Extension counting is straightforward; network enforcement requires Phosra infrastructure |
| **Risk Level** | Low — Extension-based limits are reliable on desktop; mobile gap remains |
| **Latency** | Real-time (extension tracking) |
| **Recommendation** | Implement as a P0 priority. This is ChatGPT's biggest gap and Phosra's strongest differentiator. Extension-based counting + network-level hard enforcement provides reliable protection on desktop. Document mobile gap clearly for parents. |

### 5. `getConversationHistory(dateRange) -> Conversation[]`

| Aspect | Detail |
|---|---|
| **Implementation** | Browser extension (partial — active view only) |
| **API Accessibility Verdict** | Level 1 — No API for consumer conversation history |
| **Approach** | The browser extension captures conversation text visible in the active ChatGPT tab using DOM scraping. When a user scrolls through a conversation, the extension captures the visible messages. For active conversations, streaming responses are captured via MutationObserver on the chat container. Captured text is sent to Phosra's backend for storage and analysis. |
| **API Alternative** | The developer Conversations API (`POST /v1/conversations`) manages developer-created conversations, NOT consumer ChatGPT conversations. There is no API to access a consumer user's ChatGPT conversation history. Reverse-engineered internal APIs exist (e.g., `chatgpt.com/backend-api/conversations`) but are undocumented, authenticated via session tokens, and violate ToS. |
| **Auth Required** | None for extension capture (runs in-browser); session token for internal API (not recommended) |
| **Data Available** | Visible conversation text (user messages + AI responses), conversation titles, timestamps (approximate from page load time) |
| **Data NOT Available** | Full conversation history (only captures what's visible), older archived conversations, system prompts, model used per response, token counts, conversation metadata |
| **Complexity** | High — DOM scraping is fragile; streaming response capture requires WebSocket/EventSource monitoring |
| **Risk Level** | Medium — Incomplete data (only captures active view); DOM changes break capture; privacy implications of storing child's conversations |
| **Latency** | Real-time for active conversations; no historical access without scrolling |
| **Recommendation** | Implement extension-based capture for active monitoring. Do NOT rely on reverse-engineered internal APIs (ToS violation, unstable). Accept that full historical conversation access is not achievable. Feed captured text to Moderation API for content classification. |

### 6. `getUsageAnalytics(dateRange) -> UsageStats`

| Aspect | Detail |
|---|---|
| **Implementation** | Browser extension (primary) + Playwright (supplementary) |
| **API Accessibility Verdict** | Level 1 — No API for consumer usage statistics |
| **Approach** | The browser extension is the primary data source, tracking: messages sent per session/day, session duration, time-of-day patterns, model/GPT used, feature usage (image generation, voice mode, file uploads). This data is reported to Phosra's backend for aggregation and analytics. Supplementary: ChatGPT's parent dashboard shows basic usage summaries; Playwright can scrape these for cross-validation. |
| **API Alternative** | None for consumer usage data. The developer API provides token usage per API call, which is irrelevant to consumer monitoring. |
| **Auth Required** | None for extension tracking; parent session for dashboard scraping |
| **Data Available** | Extension-tracked: message count, session duration, timestamps, active model, features used. Dashboard-scraped: OpenAI's summary view of teen activity. |
| **Data NOT Available** | Server-side accurate time tracking, mobile app usage (extension cannot monitor), voice conversation duration, token-level usage, cost data (consumer, not billed per-token) |
| **Complexity** | Low-Medium — Extension data collection is straightforward; aggregation and visualization on Phosra side |
| **Risk Level** | Low — Extension data is reliable for desktop usage; mobile gap is documented |
| **Latency** | Real-time (extension) to daily (Playwright dashboard scrape) |
| **Recommendation** | Implement extension-based analytics as P0. This powers Phosra's usage dashboard. Playwright dashboard scraping is P2 (supplementary validation only). |

### 7. `toggleFeature(feature, enabled)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (parent dashboard) |
| **API Accessibility Verdict** | Level 1 — No API for feature toggles |
| **Approach** | ChatGPT parental controls allow toggling: voice mode (on/off), memory (on/off), image generation (on/off), model training opt-out (on/off). Phosra uses Playwright to navigate the parent dashboard and toggle these features to match the Phosra safety policy. Each toggle maps to a specific DOM element on the parent settings page. |
| **API Alternative** | None. Feature toggles are only available through the parent web dashboard. No internal API endpoints have been identified for these settings. |
| **Auth Required** | Parent's OpenAI account session (via Playwright) |
| **Data Available** | Current toggle states (voice, memory, image gen, training opt-out) |
| **Data NOT Available** | Web browsing toggle (unclear if parent-configurable), Custom GPT access restrictions, advanced voice features granularity |
| **Complexity** | Low-Medium — Small number of binary toggles; Playwright click operations |
| **Risk Level** | Medium — UI changes break selectors; silent failures if toggles move or rename; teen could re-enable via their own account settings (unclear if parent lock prevents this) |
| **Latency** | 3-8 seconds per toggle (Playwright page interaction) |
| **Recommendation** | Implement as P1. Batch all toggles into a single Playwright session for efficiency. Run after initial parent setup and on policy changes. Verify toggle state after setting to confirm success. |

### 8. `setParentalControls(config)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (parent dashboard — full settings sync) |
| **API Accessibility Verdict** | Level 1 — No API for parental control configuration |
| **Approach** | This method orchestrates a comprehensive Playwright session to sync Phosra's safety policy to ChatGPT's parent dashboard. It combines `setContentSafetyLevel`, `setConversationLimits` (quiet hours only), and `toggleFeature` into a single atomic operation. Steps: (1) Playwright login, (2) navigate to parent dashboard, (3) verify linked teen account, (4) set quiet hours start/end, (5) toggle voice/memory/image-gen/training, (6) set content sensitivity, (7) verify all settings, (8) report success/failure to Phosra. |
| **API Alternative** | None. The entire parental control surface is web-dashboard-only. OpenAI has shown no indication of building an API for third-party parental control integration. |
| **Auth Required** | Parent's OpenAI email + password; potentially MFA if configured |
| **Data Available** | All parent dashboard settings: quiet hours, feature toggles, content sensitivity, training opt-out |
| **Data NOT Available** | Safety notification preferences (cannot configure what triggers parent notifications), age prediction overrides, account linking management via API |
| **Complexity** | High — Multi-step Playwright workflow with many potential failure points (auth, navigation, DOM changes, Cloudflare) |
| **Risk Level** | High — Fragile end-to-end workflow; any step failing can leave settings in a partial state; anti-bot detection; credential storage for parent's account |
| **Latency** | 15-45 seconds (full Playwright workflow) |
| **Recommendation** | Implement as P1 but with robust error handling. Run as an infrequent sync (daily or on-demand), not real-time. Implement atomic rollback if any step fails. Clearly communicate to parents that this is a "best effort" sync that may fail. |

### 9. `deleteConversations(conversationIds)`

| Aspect | Detail |
|---|---|
| **Implementation** | Not reliably possible |
| **API Accessibility Verdict** | Level 0 — No API for consumer conversation deletion |
| **Approach** | ChatGPT allows users to delete their own conversations from the sidebar. However, there is no way for a parent to remotely delete a teen's conversations. Playwright automation of the teen's account would require the teen's credentials, which is a separate trust/privacy concern. The ChatGPT "Clear all chats" option exists in settings but is account-owner-only. Reverse-engineered internal API (`DELETE /backend-api/conversation/{id}`) exists but requires the teen's session token and violates ToS. |
| **API Alternative** | None. The developer API's conversation management endpoints only manage developer-created API conversations, not consumer ChatGPT conversations. |
| **Auth Required** | Teen's own account session (not parent-accessible) |
| **Data Available** | N/A |
| **Data NOT Available** | Remote conversation deletion; parent-initiated deletion; selective message deletion (only full conversation delete is available natively) |
| **Complexity** | High — Would require teen's credentials or browser extension executing deletion on the teen's behalf |
| **Risk Level** | High — Privacy concerns (modifying teen's account); ToS violation via internal API; trust implications |
| **Latency** | N/A |
| **Recommendation** | Do NOT implement automated conversation deletion. Instead, educate parents about ChatGPT's "Temporary Chat" mode and guide them on conversation retention policies. Phosra can offer a "suggest deletion" notification to the teen. Mark as `UnsupportedOperationError` in the adapter. |

### 10. `getActiveSession() -> SessionInfo`

| Aspect | Detail |
|---|---|
| **Implementation** | Browser extension (real-time session detection) |
| **API Accessibility Verdict** | Level 1 — No API for consumer session status |
| **Approach** | The browser extension detects whether the teen is actively using ChatGPT by monitoring: (a) tab focus on chat.openai.com/chatgpt.com, (b) DOM state indicating an active conversation (message input focused, streaming response in progress), (c) last user message timestamp. The extension reports session status to Phosra in real-time via heartbeat messages (every 30-60 seconds). Session info includes: active (yes/no), current conversation ID (from URL), duration, messages in current session, model/GPT being used. |
| **API Alternative** | None for consumer session status. OpenAI's age prediction system uses behavioral signals (including time-of-day usage patterns) but does not expose session status. |
| **Auth Required** | None — extension runs in the browser with the teen's existing session |
| **Data Available** | Active tab status, current conversation URL, message input activity, streaming response detection, session duration (extension-tracked) |
| **Data NOT Available** | Mobile app session status, whether the teen is in voice mode (partially detectable via DOM), multi-device session detection |
| **Complexity** | Low — Tab activity and DOM monitoring are basic extension capabilities |
| **Risk Level** | Low — Reliable for desktop browser usage; cannot detect mobile sessions |
| **Latency** | Real-time (extension heartbeat every 30-60 seconds) |
| **Recommendation** | Implement as P0. Session detection powers time limits, break reminders, and parent "currently active" indicators. Critical for the extension-based enforcement model. |

---

## Risk Analysis

### Integration Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| ChatGPT UI changes break extension | High | High | Versioned selectors, rapid update process, DOM mutation strategy |
| Cloudflare blocks Playwright automation | Medium | Medium | Stealth plugins, cookie persistence, fallback to manual instructions |
| Mobile app usage bypasses extension | High | High | Network-level controls, parent education |
| OpenAI adds API for parental controls | Low (positive) | Medium | Migration path from extension to API |
| VPN bypasses network controls | Medium | Low | Device-level controls, education |
| Teen disables extension | Medium | Medium | Phosra detects missing heartbeat, alerts parent |
| OpenAI age prediction misclassifies teen as adult | Medium | Low | Phosra enforcement is independent of OpenAI's age detection; extension + network controls remain active regardless |
| OpenAI's "adult mode" (Q1 2026) loosens restrictions for verified adults | Low | Medium | Phosra's extension monitors content regardless of ChatGPT mode; age prediction should prevent teens from accessing adult mode |

### Privacy Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Sending child conversations to Moderation API | Medium | Clear disclosure in Phosra privacy policy; OpenAI states Moderation API doesn't retain data |
| Storing conversation captures on Phosra servers | High | End-to-end encryption, minimal retention, parent consent |
| Parent accessing teen conversation content | Medium | Summary-only default, full access opt-in with teen disclosure |

---

## Implementation Priority

### Phase 1 (MVP) — High Value, High Feasibility
1. **Browser extension with message/time counting** — Fills ChatGPT's biggest gap
2. **Network-level quiet hours enforcement** — Hard enforcement parents can trust
3. **Usage statistics dashboard** — Extension-tracked data on Phosra dashboard

### Phase 2 — Medium Value, Medium Feasibility
4. **Moderation API integration** — Content classification for parent alerts
5. **Break reminders injection** — Wellness prompts during long sessions
6. **Playwright settings sync** — Keep Phosra settings in sync with ChatGPT parent dashboard

### Phase 3 — High Value, Low Feasibility
7. **Client-side NLP for topic detection** — Custom topic blocking, homework detection
8. **Conversation capture and summarization** — Partial transcript access for parents
9. **Emotional dependency analysis** — Session pattern analysis over time

---

## Maintenance Burden

| Component | Update Frequency | Effort |
|-----------|-----------------|--------|
| Browser extension (DOM selectors) | Monthly (ChatGPT updates frequently) | Medium |
| Playwright automation | Monthly+ (dashboard changes) | High |
| Moderation API integration | Rare (stable API) | Low |
| Network-level controls | Rare (domain list stable) | Low |
| Client-side NLP models | Quarterly | Medium |

**Estimated maintenance cost:** Medium-High — ChatGPT's frequent UI updates will require ongoing attention to keep the extension functional.

---

## Verdict

ChatGPT is a **must-have** platform for Phosra given its dominant market share among minors. The adapter will require significant engineering investment in browser extension technology rather than clean API integration. The good news is that ChatGPT's gaps (no time limits, no message limits, limited monitoring) are exactly where Phosra adds the most value.

**Recommended next steps:**
1. Build a Chrome extension prototype that tracks message count and session duration on chatgpt.com
2. Test the omni-moderation model for content classification reliability (text + image) and latency
3. Map the ChatGPT parent dashboard UI (launched Sep 2025) for Playwright automation feasibility
4. Monitor OpenAI's API roadmap for parental control API announcements — watch for age prediction API exposure
5. Evaluate impact of OpenAI's age prediction system on Phosra's enforcement model (teens auto-detected may already have restrictions)
6. Plan for Assistants API deprecation (Aug 2026) — ensure any developer-API integrations use Responses API
