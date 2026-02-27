# Grok — Phosra Adapter Assessment

**Platform:** Grok (xAI / Elon Musk)
**Assessment Date:** 2026-02-27
**Overall Feasibility:** 3/10
**Recommended Strategy:** Browser Extension + Network-Level + Device-Level (No Platform Cooperation)

---

## Executive Summary

Grok presents the most challenging adapter integration in Phosra's portfolio. Unlike ChatGPT, which offers a parent dashboard with configurable controls (quiet hours, feature toggles, content sensitivity) that Phosra can sync via Playwright, Grok offers **effectively no native parental controls to configure**. The sole exception is Kids Mode, which is mobile-app-only and not accessible via web or API.

This means the Phosra Grok adapter must be almost entirely independent of the platform — providing controls, monitoring, and enforcement that Grok itself does not offer. Phosra's value-add for Grok is not "sync and enhance" (as with ChatGPT) but "build from scratch on top of."

Key challenge: Grok's companion character system with gamified NSFW progression creates a category of harm that requires conversation-level monitoring to detect — simply blocking the platform is not granular enough for families that want to allow educational Grok use while blocking companion interactions.

xAI's developer API is OpenAI-compatible and well-documented, but it covers only conversation generation — not account management, safety settings, or parental controls. The API is irrelevant for adapter purposes except as a content classification tool (similar to how Phosra uses OpenAI's Moderation API).

---

## API Inventory

### Available APIs (Developer-Facing)

| API | Endpoint | Auth | Relevance to Phosra |
|-----|----------|------|---------------------|
| Responses API | `POST /v1/responses` | API Key | Low — developer API, not consumer |
| Chat Completions (deprecated) | `POST /v1/chat/completions` | API Key | Low — developer API |
| Image Generation | `POST /v1/images/generations` | API Key | None |
| Voice Agent | WebSocket | API Key | None |
| Models | `GET /v1/models` | API Key | None |

### Unavailable APIs (Parental Controls / Safety)

| Needed Capability | API Status | Alternative |
|-------------------|-----------|-------------|
| Parent-child account linking | Feature does not exist | Not possible |
| Safety settings configuration | No API (minimal feature exists) | Playwright (mode toggle only) |
| Kids Mode management | No API (app-only feature) | Not possible via web |
| Quiet hours management | Feature does not exist | Not possible |
| Feature toggles | No API | Not possible |
| Usage statistics | Feature does not exist | Browser extension tracking only |
| Conversation transcript access | No API | Browser extension capture / manual data export |
| Safety alert webhooks | Feature does not exist | Not possible |
| Memory management | No API | Playwright (toggle only) |
| Companion character access control | No API | Not possible |
| Content filter level | No API (mode toggle only) | Playwright (mode toggle only) |

---

## Adapter Architecture

### Recommended: Independent Multi-Layer Approach

```
┌──────────────────────────────────────────────────────┐
│                   Phosra Platform                      │
│                                                        │
│  ┌───────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │ Extension  │  │ Network  │  │ Content Classifier │ │
│  │ Manager    │  │ Controls │  │ (xAI or OpenAI API)│ │
│  └─────┬─────┘  └────┬─────┘  └────────┬───────────┘ │
│        │              │                  │             │
└────────┼──────────────┼──────────────────┼─────────────┘
         │              │                  │
    ┌────▼────┐   ┌─────▼─────┐     ┌─────▼──────┐
    │ Browser │   │ DNS/Router│     │  xAI API   │
    │Extension│   │  Control  │     │ (classify) │
    │(client) │   │ (network) │     │            │
    └────┬────┘   └─────┬─────┘     └────────────┘
         │              │
         └──────┬───────┘
                │
          ┌─────▼─────┐
          │   Grok    │
          │(consumer) │
          └───────────┘
```

**Key difference from ChatGPT adapter:** No "Config Sync (Playwright)" layer. There are no meaningful settings to sync. Playwright's only role would be toggling memory or the Kids/Standard/Spicy mode selector — neither of which provides real safety configuration.

### Layer 1: Browser Extension (Primary — Monitoring + Enforcement)

**Capabilities:**
- Track message count per session and per day
- Track session duration on grok.com
- Capture visible conversation text for content analysis
- **Detect companion character activation** (Ani, Valentine, Mika, Rudi) — critical for Grok-specific safety
- Detect mode changes (Kids/Standard/Unhinged/Spicy)
- Inject break reminders and time warnings
- Block the page when limits are exceeded
- Detect NSFW content in companion interactions
- Detect affection level progression

**Limitations:**
- Desktop browsers only (Chrome, Firefox, Edge, Safari)
- Cannot monitor Grok mobile app (iOS/Android)
- Cannot monitor Grok within X/Twitter app
- Can be disabled by the user
- Only captures text visible in the viewport

**Grok-Specific DOM Considerations:**
- grok.com is a React-based web application
- Companion character mode has distinct UI elements (affection bar, character avatars)
- Mode selector (Kids/Fun/Standard/Unhinged) visible in UI
- Image generation results visible in chat stream

### Layer 2: Network-Level Controls (Hard Enforcement)

**Capabilities:**
- Block `grok.com`, `api.x.ai`, and related X domains
- Enforce schedule restrictions (quiet hours / bedtime)
- Block after time/message limits exceeded
- Cannot be bypassed by switching browsers or disabling extension

**Domain Blocklist:**
```
grok.com
x.ai
api.x.ai
console.x.ai
accounts.x.ai
x.com (optional — blocks entire X platform, which also blocks Grok via X)
```

**Note:** Blocking `x.com` also blocks all X/Twitter access. Families may want to allow X but block Grok. This requires the browser extension approach (detect Grok usage within X and block it) rather than domain-level blocking.

### Layer 3: Content Classification (xAI API or OpenAI Moderation API)

**Capabilities:**
- Classify conversation text captured by the extension against moderation taxonomies
- Two options:
  - **xAI API with LlamaGuard:** Use xAI's own API to classify content (may have fewer categories)
  - **OpenAI Moderation API (omni-moderation-latest):** Use OpenAI's free, well-documented 11-category taxonomy (recommended for consistency across Phosra's platform portfolio)
- Detect companion character NSFW escalation patterns
- Classify image generation prompts for appropriateness

**Recommendation:** Use OpenAI's Moderation API for consistency across all Phosra-monitored platforms. The xAI API could be used as a supplementary classifier.

### Layer 4: Device-Level Controls (Mobile Coverage)

**Capabilities:**
- iOS Screen Time: Restrict Grok app installation or limit usage time
- Android Family Link: Restrict Grok app, set time limits
- MDM (school/enterprise): Block Grok app and grok.com domain

**Critical for Grok:** Since Kids Mode is mobile-app-only, and the browser extension cannot monitor the mobile app, device-level controls are essential for mobile coverage. This is a larger gap for Grok than for ChatGPT (where the parent dashboard provides some mobile coverage).

---

## Adapter Method Assessments

### 1. `authenticate(credentials) -> Session`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (consumer login) + API Key (content classification) |
| **API Accessibility Verdict** | Level 1 — No public API for consumer account authentication |
| **Approach** | Two paths: (a) For content classification, use a Phosra-owned xAI or OpenAI API key directly — no consumer auth needed. (b) For any web UI interaction (mode toggle, memory toggle), use Playwright to log into the user's grok.com account via email/password. Session cookies are captured and reused. Alternatively, if the user accesses Grok via X, Playwright must navigate to x.com login. |
| **API Alternative** | xAI API offers API key authentication for developer endpoints. No OAuth flow exists for consumer account management. |
| **Auth Required** | User's grok.com email + password (or X credentials) for Playwright; Phosra-owned API key for content classification |
| **Data Available** | Session cookies, auth tokens, basic account info visible in settings page |
| **Data NOT Available** | Programmatic session tokens, refresh tokens, API-level consumer account access |
| **Complexity** | Medium — Playwright login to grok.com is straightforward; X.com login is more complex due to multi-step flow |
| **Risk Level** | Medium — standard anti-bot detection on grok.com; Cloudflare on x.com; session cookies expire |
| **Latency** | 3-8 seconds (Playwright login) vs. instant (API key) |
| **Recommendation** | Use API key for content classification (no consumer auth needed). Playwright login only if needed for the mode toggle or memory toggle — run infrequently to minimize detection risk. For most families, Phosra can operate without consumer credentials (extension + network enforcement). |

### 2. `getAccountSettings() -> SafetySettings`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (scrape settings page) — but almost nothing to read |
| **API Accessibility Verdict** | Level 0 — No API; virtually no settings exist |
| **Approach** | After Playwright authentication, navigate to grok.com settings page. Scrape the DOM to extract: current mode (Kids/Standard/etc.), memory enabled/disabled, Private Chat mode status. That is the extent of available settings — there are no content filter levels, quiet hours, feature toggles, or parental control configurations to read. |
| **API Alternative** | None. xAI has no API for reading consumer account settings. |
| **Auth Required** | User's grok.com session (via Playwright) |
| **Data Available** | Current mode (Kids/Standard/Spicy), memory toggle state, Private Chat state |
| **Data NOT Available** | Content filter levels (none exist), quiet hours (none exist), feature toggles (none exist), companion access restrictions (none exist), usage statistics (none exist), parent link status (feature doesn't exist) |
| **Complexity** | Low — very few settings to scrape |
| **Risk Level** | Low — minimal interaction with the platform |
| **Latency** | 3-8 seconds (Playwright page load) |
| **Recommendation** | Implement as supplementary. The return value will be sparse — essentially just mode and memory status. Phosra should display this alongside what Phosra itself enforces (time limits, content monitoring, etc.) to show the contrast between platform-native and Phosra-provided controls. |

### 3. `setContentSafetyLevel(level)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (mode toggle only) + Content classification API (defense-in-depth) |
| **API Accessibility Verdict** | Level 0 — No API; no granular content safety levels exist on the platform |
| **Approach** | Grok's content safety is binary: Kids Mode (stricter, proven ineffective) vs. standard modes. There is no granular "content safety level" comparable to ChatGPT's parental content sensitivity controls. Phosra can: (a) Use Playwright to ensure Kids Mode is active (mobile app only — not available on web, so even this is limited). (b) Use the browser extension + content classification API (OpenAI Moderation API or xAI API) to implement Phosra's own content safety layer on top of Grok's conversation stream. This is Phosra-generated content filtering, not platform-native configuration. |
| **API Alternative** | No API exists for content safety configuration. The xAI developer API has no endpoint for modifying consumer content filters. |
| **Auth Required** | None for extension-based filtering; user session for Playwright mode toggle |
| **Data Available** | Current mode state (Kids/Standard/Spicy) |
| **Data NOT Available** | Per-category filter sensitivity, topic-level blocking, age-appropriate content tiers |
| **Complexity** | Medium — Extension + classification API is straightforward; the challenge is that Phosra is building the entire content safety layer |
| **Risk Level** | Low — Extension-based content classification carries no platform ToS risk |
| **Latency** | ~200ms (per-message classification via API) |
| **Recommendation** | Implement as P0. This is Phosra's highest-value capability for Grok. The platform's content safety is so weak that Phosra's conversation-layer classification is the primary defense for children. Map Phosra's content safety levels to moderation API thresholds. |

### 4. `setConversationLimits(config)`

| Aspect | Detail |
|---|---|
| **Implementation** | Phosra-managed (browser extension + network-level enforcement) |
| **API Accessibility Verdict** | Level 0 — Grok has NO native conversation limits whatsoever |
| **Approach** | Identical to the ChatGPT adapter approach, but with even higher priority because Grok has no quiet hours or any time-based restriction. The browser extension tracks: (a) session duration, (b) daily message count, (c) session message count, (d) companion character session time (tracked separately — parents may want stricter limits for companion interactions). When limits are reached, the extension injects a blocking overlay on grok.com. Network-level DNS blocking enforces hard limits. For Grok specifically, add a companion-character-specific limit: parents may want to allow 30 minutes of general Grok use but 0 minutes of companion character interaction. |
| **API Alternative** | None. Grok has zero native conversation limits. |
| **Auth Required** | None for extension enforcement; none for network enforcement |
| **Data Available** | Extension-tracked: messages sent, session duration, active/idle time, mode changes, companion activation |
| **Data NOT Available** | Server-side usage data; Grok exposes no usage statistics via any mechanism |
| **Complexity** | Medium — Extension counting is straightforward; companion detection adds Grok-specific complexity |
| **Risk Level** | Low — Extension-based limits are reliable on desktop; mobile/X-app gap remains |
| **Latency** | Real-time (extension tracking) |
| **Recommendation** | Implement as P0. This is the single most important Phosra feature for Grok. The platform has ZERO conversation controls. Include companion-character-specific time limits as a Grok-specific feature. |

### 5. `getConversationHistory(dateRange) -> Conversation[]`

| Aspect | Detail |
|---|---|
| **Implementation** | Browser extension (partial — active view only) + manual data export |
| **API Accessibility Verdict** | Level 0 — No API for consumer conversation history |
| **Approach** | The browser extension captures conversation text visible in the active grok.com tab using DOM scraping. MutationObserver on the chat container detects new messages (including streaming responses). Captured text is sent to Phosra's backend. For historical conversations, the only option is the manual data export at accounts.x.ai/data, which provides a JSON dump. This is manual and not automatable. Community-developed browser extensions (enhanced-grok-export) exist for Grok conversation export but are unofficial. |
| **API Alternative** | The xAI developer API manages developer-created conversations only, not consumer Grok conversations. No API endpoint exists for consumer conversation history access. |
| **Auth Required** | None for extension capture; user session for data export |
| **Data Available** | Visible conversation text, conversation titles, approximate timestamps, companion character identity, affection levels (visible in UI), mode indicators |
| **Data NOT Available** | Full conversation history (only captures active view), older conversations, voice conversation content, image generation prompts/results (partially capturable), server-side metadata |
| **Complexity** | High — DOM scraping is fragile; streaming response capture requires careful DOM observation |
| **Risk Level** | Medium — Incomplete data; DOM changes break capture; privacy implications of storing child's conversations |
| **Latency** | Real-time for active conversations; no historical access without manual export |
| **Recommendation** | Implement extension-based capture for active monitoring (P0). Do NOT invest in automating the manual data export (too fragile, manual auth required). Feed captured text to content classification API for real-time analysis. Prioritize capturing companion character interactions. |

### 6. `getUsageAnalytics(dateRange) -> UsageStats`

| Aspect | Detail |
|---|---|
| **Implementation** | Browser extension (primary — sole data source) |
| **API Accessibility Verdict** | Level 0 — No API; no native usage analytics exist on the platform |
| **Approach** | Grok provides zero usage analytics to users. The browser extension is the only data source. Track: messages sent per session/day, session duration, time-of-day patterns, mode used (Kids/Standard/Spicy), companion character interactions (which companion, duration, affection level changes), image generation requests, voice mode activation. Report to Phosra backend for aggregation. |
| **API Alternative** | None. No usage analytics exist on the platform in any form. |
| **Auth Required** | None for extension tracking |
| **Data Available** | Extension-tracked: message count, session duration, timestamps, mode, companion identity, companion affection level, image generation events |
| **Data NOT Available** | Server-side accurate usage data, mobile app usage (extension cannot monitor), voice conversation duration, X-integrated Grok usage (unless extension covers x.com) |
| **Complexity** | Low-Medium — Extension data collection is straightforward; Grok-specific metrics (companion tracking) add complexity |
| **Risk Level** | Low — Extension data is reliable for desktop browser usage |
| **Latency** | Real-time (extension) |
| **Recommendation** | Implement as P0. This powers Phosra's Grok usage dashboard. Without Phosra, parents have ZERO visibility into their child's Grok usage — not even basic "time spent" data. Include companion-specific analytics (which companion, affection level progression) as a Grok differentiator. |

### 7. `toggleFeature(feature, enabled)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (extremely limited) + Not possible (most features) |
| **API Accessibility Verdict** | Level 0 — No API; almost no toggleable features exist |
| **Approach** | Grok has very few parent-configurable features. The only meaningful toggles are: (a) Memory on/off (via grok.com settings — Playwright), (b) Mode selection (Kids/Standard/etc. — but Kids Mode is app-only). The following features CANNOT be toggled by any mechanism: voice mode, image generation, companion characters, Spicy Mode (per-user), web search, code execution. Phosra cannot disable companion characters, cannot block image generation, and cannot restrict voice mode through any platform mechanism. |
| **API Alternative** | None. No feature toggle API exists. |
| **Auth Required** | User's grok.com session (Playwright) for memory toggle |
| **Data Available** | Memory toggle state |
| **Data NOT Available** | Voice mode state, image generation state, companion access state, Spicy Mode state |
| **Complexity** | Low — one toggle to automate (memory) |
| **Risk Level** | Low — minimal platform interaction |
| **Latency** | 3-8 seconds (Playwright) |
| **Recommendation** | Implement memory toggle via Playwright as P2. The value is low because there are so few features to toggle. For features Phosra cannot toggle natively (voice, image gen, companions), use the browser extension to detect and block these features client-side. For example: extension detects companion character activation and injects a blocking overlay. This is a Phosra-enforced feature toggle, not a platform-native one. |

### 8. `setParentalControls(config)`

| Aspect | Detail |
|---|---|
| **Implementation** | Static Return — `UnsupportedOperationError` (feature does not exist on platform) |
| **API Accessibility Verdict** | Level 0 — Parental controls do not exist on Grok |
| **Approach** | Grok has no parental control system. There is no parent account, no parent dashboard, no parent-child linking, no parent-configurable settings. The only quasi-parental feature is Kids Mode, which is app-only and has no web or API interface. This method returns `UnsupportedOperationError` and Phosra's own parental control system operates independently. |
| **API Alternative** | None — the feature does not exist. |
| **Auth Required** | N/A |
| **Data Available** | N/A |
| **Data NOT Available** | Everything — parent linking, quiet hours, feature toggles, content sensitivity, usage summaries, safety alerts |
| **Complexity** | N/A |
| **Risk Level** | N/A |
| **Latency** | N/A |
| **Recommendation** | Return `UnsupportedOperationError`. Document clearly for parents that Grok has no native parental controls. Phosra IS the parental control system for Grok — all controls are Phosra-managed. This is the starkest "Phosra fills the gap" story in the portfolio. |

### 9. `deleteConversations(conversationIds)`

| Aspect | Detail |
|---|---|
| **Implementation** | Playwright (user's own account) — with significant limitations |
| **API Accessibility Verdict** | Level 0 — No API for consumer conversation deletion |
| **Approach** | Grok allows users to delete conversations from grok.com Settings/Data Controls. Playwright could automate this by navigating to the settings page and triggering deletion. However: (a) This requires the child's own account credentials, (b) bulk deletion may not be granular (individual conversation deletion vs. "clear all"), (c) the child can also re-access deleted data within the 30-day server retention window. A more practical approach: Phosra guides parents to use the data download + deletion feature at accounts.x.ai/data, rather than automating it. |
| **API Alternative** | None. The xAI developer API manages developer-created conversations only. |
| **Auth Required** | User's grok.com session (Playwright) |
| **Data Available** | Conversation list visible on grok.com sidebar |
| **Data NOT Available** | Remote deletion from a parent account (feature doesn't exist); selective message deletion (only full conversation delete) |
| **Complexity** | Medium — Playwright navigation to settings is straightforward; but operating on the child's account raises trust issues |
| **Risk Level** | High — modifying the child's account; ToS concerns; privacy implications |
| **Latency** | 5-15 seconds (Playwright navigation + deletion confirmation) |
| **Recommendation** | Do NOT implement automated deletion. Instead, provide parents with a guide to manual conversation deletion via Settings/Data Controls. Suggest enabling Private Chat mode for future conversations. Mark as `UnsupportedOperationError` in the production adapter. |

### 10. `getActiveSession() -> SessionInfo`

| Aspect | Detail |
|---|---|
| **Implementation** | Browser extension (real-time session detection) |
| **API Accessibility Verdict** | Level 0 — No API for consumer session status |
| **Approach** | The browser extension detects active Grok usage by monitoring: (a) tab focus on grok.com, (b) DOM state indicating active conversation, (c) companion character interaction (detect affection bar, character UI elements), (d) mode indicators (Kids/Standard/Spicy/Unhinged), (e) voice mode activation, (f) image generation in progress. Heartbeat messages (every 30-60 seconds) report to Phosra backend. Grok-specific session info includes: which companion character is active (if any), current mode, and whether image generation or voice mode is in use. |
| **API Alternative** | None for consumer session status. |
| **Auth Required** | None — extension runs in the browser with the user's existing session |
| **Data Available** | Active tab status, current conversation, companion character identity, mode, voice/image feature usage |
| **Data NOT Available** | Mobile app session status, X-integrated Grok session status, multi-device detection |
| **Complexity** | Low-Medium — Standard extension capabilities; Grok-specific companion detection adds complexity |
| **Risk Level** | Low — Reliable for desktop browser usage |
| **Latency** | Real-time (30-60 second heartbeat) |
| **Recommendation** | Implement as P0. Session detection powers time limits, break reminders, and the "currently active" parent indicator. Include companion character detection as a Grok-specific feature — parents need to know not just "my child is on Grok" but "my child is talking to Ani." |

---

## Real-Time Monitoring Strategy

### Extension Heartbeat
- Every 30-60 seconds: report session status, current mode, companion status
- Per-message: capture visible message text, send to content classification API

### Content Classification Pipeline
1. Extension captures message text from grok.com DOM
2. Text sent to Phosra backend
3. Phosra backend classifies via OpenAI Moderation API (omni-moderation-latest)
4. Classification results checked against family's safety policy
5. If threshold exceeded: parent alert (push + email within 60 seconds)
6. If companion NSFW detected: immediate parent alert + optional auto-block

### Companion Character Monitoring (Grok-Specific)
- Detect companion activation (Ani, Valentine, Mika, Rudi) via DOM UI elements
- Track affection level changes (visible in companion UI)
- Monitor for NSFW escalation patterns (Level 4-5 interactions)
- Alert parents when companion interaction begins (configurable)
- Alert parents when affection level increases (configurable)
- Optional: auto-block companion interactions entirely

### Crisis Response Flow
1. **Detection:** Extension captures concerning text + OpenAI Moderation API returns self-harm score above threshold
2. **Critical context:** Grok itself does NOT reliably display crisis resources (unlike ChatGPT which shows 988 hotline). Phosra must be the crisis response mechanism.
3. **Immediate action:** Phosra logs the event with conversation context
4. **Phosra-generated crisis display:** Extension injects crisis resource overlay (988 hotline, Crisis Text Line) into the grok.com page — compensating for Grok's failure to display these
5. **Parent notification:** Push + email within 60 seconds
6. **Escalation:** If parent does not acknowledge within 30 minutes, send follow-up
7. **No auto-block:** Do not block Grok during a crisis — the teen may need the conversation, and Phosra's injected crisis resources should remain visible

---

## Development Effort Estimate

| Component | Effort (Days) | Priority | Notes |
|-----------|--------------|----------|-------|
| Browser extension (grok.com DOM monitoring) | 8 | P0 | Core monitoring infrastructure |
| Companion character detection module | 4 | P0 | Grok-specific; high value for parents |
| Extension-based time/message limit enforcement | 5 | P0 | Primary value proposition |
| Network-level DNS enforcement integration | 3 | P0 | Hard enforcement backup |
| Content classification pipeline (OpenAI Moderation API) | 4 | P0 | Defense-in-depth content safety |
| Break reminder injection | 2 | P0 | SB 243 compliance helper |
| Crisis resource injection | 2 | P0 | Compensates for Grok's failure |
| Usage analytics dashboard (Grok tab) | 5 | P1 | Parent visibility |
| Playwright settings sync (memory toggle, mode) | 3 | P2 | Low value — few settings |
| Companion-specific analytics and alerting | 4 | P1 | Grok differentiator |
| X-integrated Grok detection | 5 | P1 | Covers Grok usage within X |
| **Total** | **45 days** | | |

---

## Detection Vectors and Mitigations

| Vector | Risk Level | Mitigation |
|--------|-----------|-----------|
| Grok.com UI changes break extension selectors | High | Versioned selectors, structural pattern matching, rapid update process |
| Mobile app usage bypasses extension | High | Network-level DNS controls, device-level app restrictions (Screen Time / Family Link) |
| X-integrated Grok bypasses extension (if extension only monitors grok.com) | High | Extend extension to detect Grok usage on x.com OR block x.com/grok via network |
| Teen disables extension | Medium | Phosra detects missing heartbeat, alerts parent within 5 minutes |
| VPN bypasses network controls | Medium | Device-level controls (MDM), parent education |
| Teen creates new grok.com account (no parent linking to prevent this) | High | Network-level blocking (blocks all grok.com access), extension monitors any account |
| Anti-bot detection on grok.com blocks Playwright | Low | Playwright only used for rare settings sync; extension is primary |
| xAI changes its stance and blocks parental control extensions | Low | No precedent; regulatory pressure makes this unlikely |

---

## Terms of Service Summary

| Clause Area | Detail |
|---|---|
| **Consumer ToS (current)** | Prohibits "using bots to access, reverse engineering" the service |
| **January 2026 update** | Added prohibition on "circumventing, manipulating, or disabling" systems including "jailbreaking" and "prompt engineering or injection" |
| **Automation prohibition** | Standard language prohibiting automated access to grok.com web interface |
| **API ToS** | Standard API access via api.x.ai is permitted; prohibits competitive use and reverse engineering |
| **Credential sharing** | Standard prohibition on sharing login credentials with third parties |
| **Enforcement history** | No documented enforcement against parental control or child safety tools |
| **Regulatory defense** | Strong: Grok is under active regulatory investigation globally. Phosra's child safety automation has a compelling regulatory safe harbor argument under COPPA, KOSA, SB 243, and EU AI Act. xAI's failure to implement adequate child safety measures (documented by Common Sense Media, state AGs, and EU regulators) strengthens Phosra's position. |

---

## Verdict

Grok is a **critical-priority** platform for Phosra due to its extreme danger to children and near-total absence of native safety controls. The adapter is technically challenging (3/10 feasibility) but strategically essential — Phosra's value proposition for Grok is the strongest in the portfolio because the platform provides almost nothing.

**Recommended next steps:**
1. Build a Chrome extension prototype targeting grok.com with message tracking, session timing, and companion character detection
2. Test OpenAI Moderation API for classifying Grok conversation content (validate accuracy on Grok's characteristically provocative output)
3. Design the companion-character-specific monitoring and alerting system (unique to Grok)
4. Implement crisis resource injection (compensating for Grok's failure to display 988 hotline)
5. Map grok.com DOM structure for extension development — document companion UI elements, mode selectors, and conversation containers
6. Test network-level blocking of grok.com and related domains
7. Evaluate whether extending the extension to x.com is feasible for detecting X-integrated Grok usage
8. Monitor regulatory developments — the California AG cease and desist, EU DSA investigation, and FTC scrutiny may force xAI to add parental controls, which would change the adapter strategy
