# ChatGPT — Phosra Integration Notes

**Platform:** ChatGPT (OpenAI)
**Last Updated:** 2026-02-27

---

## Quick Reference

| Item | Value |
|------|-------|
| Platform | ChatGPT (OpenAI) |
| Tier | 1 — Highest Priority |
| Adapter Strategy | Hybrid (Extension + Network + Moderation API) |
| Adapter Feasibility | 5/10 |
| Safety Rating | 6/10 |
| Common Sense Rating | High Risk |
| Priority | HIGH — largest teen user base |

---

## What Phosra Adds (ChatGPT's Gaps)

### Controls ChatGPT Doesn't Have That Phosra Can Provide

1. **Daily time limits** — ChatGPT has none. Phosra can enforce via extension + network block.
2. **Message limits per day** — ChatGPT only has rate limits (billing). Phosra can set custom per-day caps.
3. **Break reminders** — ChatGPT has zero wellness check-ins. Phosra can inject "take a break" prompts.
4. **Session cooldown** — Force a gap between sessions (e.g., 30 min break after 1 hour).
5. **Custom topic blocking** — ChatGPT has fixed filters. Phosra can add NLP-based topic detection.
6. **Homework detection** — ChatGPT doesn't detect or restrict academic misuse. Phosra can flag patterns.
7. **Cross-platform monitoring** — Parents see ChatGPT alongside other AI platforms in one dashboard.
8. **Engagement pattern analysis** — Track usage trends over weeks/months, detect escalating dependency.
9. **Real-time parent alerts** — ChatGPT's safety notifications are limited. Phosra can push alerts instantly.
10. **Schedule granularity** — Weekday vs. weekend schedules, school hours blocking.

---

## Rule Category Coverage (34 Categories)

### Fully Enforceable (8 categories)

Feature exists on ChatGPT and Phosra can control it via API or Playwright.

| Rule Category | Platform Feature | Enforcement Method |
|---|---|---|
| `ai_explicit_content_filter` | Built-in teen content filter + parental "block sensitive content" toggle | Playwright sync (parent dashboard toggle) + Moderation API (omni-moderation-latest) for defense-in-depth |
| `ai_violence_filter` | Built-in teen content filter + parental "reduce/block violent content" toggle | Playwright sync (parent dashboard) + Moderation API violence categories |
| `ai_self_harm_protection` | Built-in crisis detection (988 hotline display) + parent safety notifications | Extension detects crisis UI + Moderation API self-harm categories + Phosra parent alert pipeline |
| `ai_schedule_restriction` | Parent-configurable quiet hours (start/end time) | Playwright sync (set quiet hours in parent dashboard) + network-level DNS blocking as hard enforcement backup |
| `ai_image_upload_block` | Parent can disable image generation for teen account | Playwright toggle in parent dashboard to disable DALL-E/image features |
| `ai_memory_persistence_block` | Parent can disable memory for teen account | Playwright toggle in parent dashboard to turn off memory |
| `ai_romantic_roleplay_block` | Built-in teen restriction: reduced romantic/roleplay content + parent can block | Playwright sync (block romantic content toggle) + Extension NLP detection for subtle romantic patterns |
| `ai_conversation_retention_policy` | Temporary Chat mode available; manual conversation deletion; model training opt-out | Playwright sync (enable training opt-out) + educate parents on Temporary Chat |

### Partially Enforceable (18 categories)

Feature does not exist natively on ChatGPT, but Phosra can approximate through workarounds.

| Rule Category | Gap | Phosra Workaround |
|---|---|---|
| `ai_profanity_filter` | No dedicated profanity toggle; ChatGPT generally avoids profanity by default but no parent control | Extension captures messages + Phosra NLP profanity detection + parent alert if threshold exceeded |
| `ai_age_appropriate_topics` | Binary teen/adult mode only; no age-graduated topic restrictions (e.g., 9 vs 15 year old) | Extension captures conversations + Phosra age-specific topic classification + parent alerts for age-inappropriate topics |
| `ai_daily_time_limit` | No native time limit feature | Extension tracks active session time + injects blocking overlay when limit reached + network-level DNS block as hard enforcement |
| `ai_message_rate_limit` | No native message rate limit (only infrastructure rate limits) | Extension counts messages per hour/day + injects blocking overlay when limit reached |
| `ai_session_cooldown` | No native session cooldown | Extension tracks session duration + enforces mandatory break between sessions + network-level block during cooldown |
| `ai_engagement_check` | No native break reminders or check-ins | Extension injects "take a break" prompts at configurable intervals during active conversations |
| `ai_emotional_dependency_guard` | No native dependency detection | Extension tracks longitudinal session patterns (frequency, duration, time-of-day) + Phosra NLP analyzes conversation content for dependency indicators over weeks/months |
| `ai_therapeutic_roleplay_block` | ChatGPT disclaims professional advice but engages in extended mental health discussion | Extension + Phosra NLP detect therapeutic interaction patterns (therapy language, diagnosis-seeking, treatment advice) + parent alert |
| `ai_distress_detection_alert` | Only crisis-level self-harm detection (not general distress: loneliness, anxiety, bullying) | Extension captures conversation text + Phosra NLP distress classifier (beyond self-harm) + configurable parent alert thresholds |
| `ai_pii_sharing_guard` | No native PII prevention; ChatGPT's memory feature actively stores shared personal info | Extension runs PII detection (regex + NLP) on outgoing user messages + parent alert when PII detected |
| `ai_location_data_block` | No platform-level location restriction for minors | Device-level location permissions (iOS/Android) + Extension detects explicit location sharing in text |
| `ai_homework_generation_guard` | No native academic integrity features | Extension + Phosra NLP detect homework-completion patterns (essay generation, math solutions, code generation) + parent alert |
| `ai_academic_usage_report` | No native academic usage reporting | Extension classifies conversation topics (academic vs non-academic) + Phosra generates periodic parent reports on AI academic usage patterns |
| `ai_conversation_transcript_access` | Parent dashboard shows usage summaries but not full transcripts | Extension captures visible conversation text + Phosra stores + generates summaries and flagged-content excerpts for parents |
| `ai_flagged_content_alert` | Parent safety notifications limited to self-harm crises only | Extension + Moderation API + Phosra NLP classify all conversations + configurable multi-category parent alerts (self-harm, explicit, PII, distress, dependency, academic) |
| `ai_usage_analytics_report` | Parent dashboard shows basic usage summary | Extension tracks detailed usage (messages, duration, time-of-day, model used, features) + Phosra aggregates into cross-platform analytics dashboard |
| `ai_platform_allowlist` | No native platform allowlisting | Phosra DNS filtering + device-level app restrictions (Screen Time/Family Link) to block unapproved AI platforms |
| `ai_cross_platform_usage_cap` | No cross-platform awareness | Phosra aggregates usage across all integrated AI platforms + enforces total daily AI time cap |

### Not Enforceable (8 categories)

Feature does not exist on ChatGPT and cannot be approximated.

| Rule Category | Reason |
|---|---|
| `ai_substance_info_filter` | ChatGPT blocks manufacturing instructions but allows educational substance discussion. No parent toggle for substance topics. Extension NLP could detect substance conversations but cannot prevent ChatGPT from responding. Classification only (alert-based), not enforcement. |
| `ai_hate_speech_filter` | ChatGPT has robust built-in hate speech filters but no parent-configurable toggle. Phosra cannot modify filter sensitivity. Extension + Moderation API can detect and alert but not prevent generation. |
| `ai_learning_mode` | No native Socratic/learning mode. Cannot inject system prompts into consumer ChatGPT. Custom Instructions exist but teen can override them. True enforcement requires model-level changes only OpenAI can make. |
| `ai_persona_restriction` | Custom GPTs have a review process but no parent control over which GPTs a teen can access. Phosra cannot restrict GPT Store access or filter characters via any mechanism. Extension could detect GPT usage and alert. |
| `ai_identity_transparency` | ChatGPT identifies as AI when asked; UI labels it as ChatGPT. No additional enforcement needed or possible — this is model-level behavior. Custom GPTs may obscure identity, but Phosra cannot modify GPT behavior. |
| `ai_authority_impersonation_block` | ChatGPT disclaims professional advice but will discuss topics from professional perspectives when asked. Cannot prevent the model from engaging in authority-figure discussions. Alert-only via NLP. |
| `ai_promise_commitment_block` | No platform prevents AI promise-making. Cannot modify model output to remove promises/commitments. Extension NLP could detect and alert but cannot prevent generation. |
| `ai_new_platform_detection` | Not a ChatGPT-specific feature — this is a Phosra device/network-level capability. Implemented via browser history analysis, DNS monitoring, and app installation tracking, independent of any single platform. |

---

## Integration Architecture Decision Log

### Decision 1: Browser Extension as Primary Monitoring

**Why:** No API access to consumer ChatGPT data. Extension is the only way to observe conversations and enforce client-side rules.

**Trade-offs:**
- PRO: Full visibility into visible conversation content
- PRO: Can inject UI elements (break reminders, warnings, blocks)
- CON: Desktop browsers only — no mobile app coverage
- CON: Can be disabled by the user
- CON: Requires ongoing maintenance as ChatGPT UI evolves

**Mobile gap mitigation:** Network-level controls (DNS blocking) cover mobile when on home network. Device-level controls (Screen Time, Family Link) can restrict the ChatGPT mobile app.

### Decision 2: OpenAI Moderation API for Content Classification

**Why:** Free, reliable, consistent content classification. No need to build our own. Now supports multi-modal (text + image) via `omni-moderation-latest`.

**Trade-offs:**
- PRO: Industry-standard classification, 11+ categories (omni-moderation adds new text-only harm categories)
- PRO: Multi-modal — text + image classification in a single request (new 2025)
- PRO: Free (no API cost), including omni-moderation model
- PRO: Low latency (~200ms), 42% better multilingual accuracy, calibrated scores
- CON: Sends child's conversation text/images to OpenAI (privacy consideration)
- CON: Missing categories: manipulation, emotional exploitation, academic dishonesty

**Privacy mitigation:** OpenAI states Moderation API inputs are not stored or used for training. Phosra privacy policy must disclose this processing. Consider offering parents opt-out of Moderation API classification (with degraded alerting).

### Decision 3: Network-Level Enforcement for Hard Blocking

**Why:** Extension-only enforcement is bypassable. Network-level provides hard enforcement.

**Trade-offs:**
- PRO: Cannot be bypassed by disabling extension or switching browsers
- PRO: Works for mobile apps on home network
- CON: Binary (blocks entire platform, not granular)
- CON: Bypassed by VPN or cellular data
- CON: Requires router/DNS integration

### Decision 4: Playwright Automation Deprioritized

**Why:** High maintenance, fragile, limited capability (only quiet hours and feature toggles).

**Decision:** Build but keep as supplementary. Primary enforcement through extension + network. Playwright is a "nice to have" for settings sync, not a "must have."

---

## Domain Blocklist

When enforcing network-level controls, block these domains:

```
chat.openai.com
chatgpt.com
cdn.oaistatic.com
api.openai.com
auth0.openai.com
platform.openai.com
```

**Note:** Blocking `api.openai.com` also blocks developer API access. If the family uses OpenAI APIs for other purposes, this domain should be excluded from the blocklist.

---

## ChatGPT DOM Structure Notes (for Extension Development)

> These are subject to change with ChatGPT UI updates. Last verified 2026-02-26.

- **Chat messages container:** React-rendered, messages appear as child divs with data attributes
- **User messages vs AI messages:** Distinguished by CSS classes and container structure
- **Streaming responses:** Arrive via WebSocket/EventSource, text is progressively appended
- **New conversation detection:** URL changes to `/c/{conversation-id}` pattern
- **Model selector:** Dropdown in the header area, accessible via DOM
- **Session state:** Managed via React context, accessible through `__next` data attributes

**Extension strategy:** Use `MutationObserver` on the chat container to detect new messages. Avoid relying on specific CSS class names (change frequently). Instead, target structural patterns (nesting depth, element roles).

---

## OpenAI API Keys Needed

| API | Key Type | Cost | Purpose |
|-----|----------|------|---------|
| Moderation API | Standard API key | Free | Content classification of captured messages |
| Chat Completions (optional) | Standard API key | Usage-based | NLP topic detection, conversation summarization |

**Note:** These are Phosra's API keys, not the family's. The family does not need to provide their OpenAI credentials for Phosra to use the Moderation API.

---

## Competitive Landscape

### How Other Parental Control Apps Handle ChatGPT

| App | Approach | Limitations |
|-----|----------|-------------|
| Bark | Network monitoring, keyword alerts | Cannot see ChatGPT conversation content (encrypted) |
| Qustodio | App blocking, time limits | Blocks entire app, no content monitoring |
| Net Nanny | Web filtering, time limits | Can block chat.openai.com, no content insight |
| Google Family Link | App-level time limits | Can restrict ChatGPT app time, no content monitoring |
| Apple Screen Time | App-level time limits, web content filter | Can restrict app time and web access, no content monitoring |

**Phosra's differentiation:** Browser extension provides actual conversation-level monitoring and content classification — no other parental control tool offers this for ChatGPT.

---

## Feature Parity Tracking

Track what OpenAI adds natively vs. what Phosra provides:

| Feature | OpenAI Status | Phosra Status | Notes |
|---------|-------------|---------------|-------|
| Parent account linking | Shipped (Sep 2025) | Detect | Phosra detects if linked, encourages linking |
| Quiet hours | Shipped (Sep 2025) | Sync + enforce | Playwright sync + network-level backup |
| Feature toggles (voice, memory, DALL-E) | Shipped (Sep 2025) | Sync | Playwright automation of parent dashboard |
| Content sensitivity controls | Shipped (Sep 2025) | Sync + enhance | Playwright sync + Moderation API layer |
| Model training opt-out | Shipped (Sep 2025) | Sync | Playwright toggle |
| Safety notifications (self-harm) | Shipped (Sep 2025) | Enhance | Phosra adds broader distress detection |
| Age prediction | Shipped (Jan 2026) | Independent | Phosra enforcement independent of OpenAI's detection |
| Time limits | Not available | Phosra provides | Key differentiator |
| Message limits | Not available | Phosra provides | Key differentiator |
| Break reminders | Not available | Phosra provides | Key differentiator |
| Conversation monitoring | Summary only (parent) | Phosra enhances | Extension captures more detail |
| Topic blocking | Not available | Phosra provides | NLP-based topic detection |
| Homework detection | Not available | Phosra provides | Academic integrity support |
| Usage analytics | Basic (parent summary) | Phosra enhances | Cross-platform analytics |
| Cross-platform usage cap | Not available | Phosra provides | Aggregate across all AI platforms |

---

## Enforcement Strategy

### Read Operations

| Data Source | Method | Schedule | Rate Limits |
|---|---|---|---|
| Parent dashboard settings | Playwright scrape | Every 6-12 hours or on-demand | N/A (browser automation) |
| Active conversation text | Browser extension DOM capture | Real-time (MutationObserver) | N/A (client-side) |
| Session status (active/idle) | Browser extension heartbeat | Every 30-60 seconds | N/A |
| Message count / session duration | Browser extension tracking | Real-time (per-message) | N/A |
| Content classification | Moderation API (`omni-moderation-latest`) | Per-message (after extension capture) | Free, generous (undisclosed limits) |
| Parent usage summary | Playwright scrape of parent dashboard | Daily | N/A |

### Write Operations

| Setting | Method | Auth | Frequency |
|---|---|---|---|
| Quiet hours (start/end) | Playwright → parent dashboard | Parent email/password | On policy change |
| Voice mode toggle | Playwright → parent dashboard | Parent email/password | On policy change |
| Memory toggle | Playwright → parent dashboard | Parent email/password | On policy change |
| Image generation toggle | Playwright → parent dashboard | Parent email/password | On policy change |
| Model training opt-out | Playwright → parent dashboard | Parent email/password | One-time setup |
| Content sensitivity | Playwright → parent dashboard | Parent email/password | On policy change |

### Real-Time Monitoring

- **Extension heartbeat:** Every 30-60 seconds reports session status to Phosra backend
- **Per-message analysis:** Each captured message is sent to Moderation API for classification (~200ms latency)
- **Keyword/topic detection:** Client-side NLP in the extension for fast local detection (no network round-trip for obvious keywords)
- **Crisis UI detection:** Extension monitors DOM for 988 hotline display elements (immediate parent alert)
- **Streaming response monitoring:** MutationObserver + WebSocket monitoring captures AI responses as they stream

### Screen Time Enforcement Flow

1. Extension detects active session start (tab focus + first message)
2. Extension tracks cumulative session time and daily total time
3. At 80% of limit: Extension injects soft warning ("10 minutes remaining")
4. At 100% of limit: Extension injects blocking overlay (full-page block)
5. If extension is bypassed (disabled/different browser): Phosra backend triggers network-level DNS block on ChatGPT domains
6. Next day / after cooldown: Extension and network block are automatically lifted

### Crisis Response Flow

1. **Detection:** Extension detects crisis UI (988 hotline display) OR Moderation API returns self-harm score above threshold
2. **Immediate action:** Phosra logs the event with conversation context (sanitized)
3. **Parent notification:** Push notification + email to parent within 60 seconds
4. **Notification content:** "ChatGPT detected a safety concern in [teen name]'s conversation. Crisis resources were shown." (does not include conversation text by default; parent can view flagged excerpt in Phosra dashboard)
5. **Escalation:** If parent does not acknowledge within 30 minutes, send follow-up notification
6. **No auto-block:** Do not automatically block ChatGPT during a crisis — the teen may be engaging with crisis resources shown by ChatGPT

### Why Playwright for Writes

Direct API writes are not used because:
- OpenAI provides zero API endpoints for parental control configuration
- Consumer account settings are only accessible via the web dashboard at chatgpt.com
- No OAuth scope exists for parental control management
- Internal/unofficial APIs for settings changes are undocumented and require consumer session tokens (ToS violation risk)
- Playwright automation of the parent dashboard is the only viable approach for settings sync

**Failure modes:**
- Cloudflare/CAPTCHA blocks Playwright → Phosra alerts parent that sync failed; parent must manually verify settings
- Dashboard DOM changes → Phosra's Playwright selectors fail silently or throw errors → Alert parent + engineering update required
- Session expiry → Re-authentication needed → May trigger MFA if enabled
- Rate limiting → Space Playwright operations; maximum 1 full sync per 6 hours

---

## Credential Storage Requirements

| Credential | Purpose | Sensitivity | Storage Notes |
|---|---|---|---|
| Parent's OpenAI email | Playwright login to parent dashboard | High | Encrypted at rest (AES-256) |
| Parent's OpenAI password | Playwright login to parent dashboard | Critical | AES-256, per-user encryption key, never logged, never displayed |
| Parent session cookies | Reuse Playwright sessions to avoid frequent login | High | Encrypted, rotate every 24 hours, invalidate on logout |
| Phosra Moderation API key | Content classification via Moderation API | High | Encrypted, managed by Phosra (not per-user); rotated quarterly |
| Phosra Chat Completions API key (optional) | NLP topic detection, conversation summarization | High | Encrypted, managed by Phosra; usage-based billing |

**Notes:**
- Families do NOT need to provide their own OpenAI API keys. Phosra uses its own API keys for Moderation and Chat Completions.
- Parent's OpenAI credentials are only needed if Playwright settings sync is enabled. Phosra can operate without them (extension + network enforcement still work).
- MFA tokens/recovery codes are NOT stored. If the parent has MFA enabled on their OpenAI account, Playwright login will require manual MFA approval — Phosra alerts the parent to complete the MFA challenge.

---

## OAuth Assessment

- **Does ChatGPT offer OAuth for account management?** No. OpenAI offers OAuth for developer API access (API keys, organization management) but NOT for consumer account management or parental control settings.
- **What this means for Phosra UX:** Parents must provide their OpenAI email and password to Phosra for Playwright-based settings sync. This is a high-friction, high-trust UX. Clear consent disclosure is required. Alternative: parents manually configure ChatGPT settings and Phosra only provides monitoring + enforcement (extension + network), without settings sync.
- **Does OpenAI's public API OAuth cover parental control scopes?** No. The developer OAuth grants access to Chat Completions, Moderation, Responses, and other developer APIs. No scope exists for consumer account settings, parental controls, or conversation history.
- **Comparison to platforms with OAuth:** Google (Gemini) offers Family Link with some OAuth-like delegation. No AI chatbot platform currently offers OAuth for parental control management. ChatGPT is typical in this regard.

---

## Adapter Gap Analysis

### What Exists (current research adapter state)

| Feature | Status |
|---|---|
| Moderation API integration | Assessed — ready for implementation |
| Parental control dashboard mapping | Assessed — Playwright targets identified |
| Browser extension architecture | Designed — DOM strategy documented |
| Network-level enforcement strategy | Designed — domain blocklist documented |
| 10 adapter method assessments | Complete |
| 34 rule category mappings | Complete |

### What's Needed (for production Phosra integration)

| Feature | Status | Priority |
|---|---|---|
| Chrome extension prototype (message/time tracking) | Missing | P0 |
| Moderation API pipeline (extension → API → alert) | Missing | P0 |
| Network-level DNS enforcement integration | Missing | P0 |
| Playwright settings sync (quiet hours, toggles) | Missing | P1 |
| Client-side NLP models (topic detection, PII, distress) | Missing | P1 |
| Conversation capture and storage pipeline | Missing | P1 |
| Parent dashboard (ChatGPT-specific analytics) | Missing | P1 |
| Conversation summarization (AI-generated summaries) | Missing | P2 |
| Desktop app monitoring (macOS/Windows Electron) | Missing | P2 |
| Mobile app coverage strategy (MDM/VPN integration) | Missing | P2 |

---

## Platform-Specific Considerations

### Age Prediction System (Jan 2026)
OpenAI rolled out an age prediction system that uses behavioral signals (conversation topics, time-of-day usage) to estimate whether a user is under 18. When detected, ChatGPT automatically applies teen safety restrictions. Users misclassified as teens can verify age via Persona (third-party identity verification). This system operates independently of Phosra but may provide a baseline of protection even for unlinked teen accounts.

### "Adult Mode" (Expected Q1 2026)
OpenAI plans to launch an explicit "adult mode" in ChatGPT, gated behind age verification. This would loosen content restrictions for verified adults. Implications for Phosra: teens who successfully age-verify could bypass all ChatGPT-native protections. Phosra's extension + network enforcement remains the safety net.

### Custom GPTs / GPT Store
Teens can access user-created Custom GPTs in the GPT Store. Some Custom GPTs may have weaker safety guardrails than base ChatGPT. No parental control exists to restrict which GPTs a teen can use. Phosra's extension monitors all conversations regardless of which GPT is active, but cannot prevent GPT Store access.

### ChatGPT Desktop Apps (macOS/Windows)
OpenAI offers native desktop apps built on Electron. These apps cannot be monitored by a Chrome extension. Investigation needed: Electron apps may support injection of monitoring scripts, or may need device-level controls (app time limits via Screen Time/Family Link).

### Model Training Opt-Out
Parents can opt out of model training for their teen's conversations via parental controls. This is a privacy win but does not affect real-time safety. Phosra should enable this toggle by default via Playwright sync.

### Assistants API Deprecation (Aug 2026)
The Assistants API is being sunset in favor of the Responses API and Conversations API. This is irrelevant to the consumer adapter (which does not use developer APIs for consumer monitoring) but matters if Phosra builds any developer-API-based features (e.g., using Chat Completions for conversation summarization). Ensure all Phosra backend code uses the Responses API.

---

## API Accessibility Reality Check

**Platform:** ChatGPT (OpenAI)
**API Accessibility Score:** Level 1 — Developer API Only (no consumer/parental control API)
**Phosra Enforcement Level:** Browser-Automated + Device-Level

### What Phosra CAN do:
- Monitor active conversations in real-time via browser extension (desktop only)
- Classify conversation content via Moderation API (omni-moderation-latest, free, text + image)
- Enforce time limits, message limits, session cooldowns via extension + network DNS blocking
- Inject break reminders and blocking overlays via extension
- Sync parental control settings (quiet hours, feature toggles) via Playwright automation
- Track usage analytics (messages, session time, model used) via extension
- Detect crisis events (self-harm UI, Moderation API flags) and alert parents
- Detect PII sharing, distress, dependency patterns via NLP on captured conversation text

### What Phosra CANNOT do:
- Access full conversation history (only captures active visible text)
- Monitor mobile app usage (extension is desktop-browser-only)
- Monitor voice conversations (not visible in DOM)
- Delete conversations remotely (requires teen's own session)
- Modify ChatGPT's model behavior (cannot inject system prompts into consumer ChatGPT)
- Restrict Custom GPT / GPT Store access
- Enforce Socratic/learning mode (no model-level control)
- Override ChatGPT's built-in filters (can only add layers on top)
- Access age prediction confidence scores or override age classification

---

## Open Questions

1. **Will OpenAI release a parental control API?** — No public roadmap as of Feb 2026. OpenAI's focus remains on built-in features (parent dashboard, age prediction) rather than third-party integration. The Responses API and Conversations API are developer-facing only. Monitor blog.openai.com and developer changelog.

2. **Mobile app monitoring?** — iOS and Android ChatGPT apps cannot be monitored by a browser extension. Options: MDM integration, VPN-based content inspection (complex), or accept the mobile gap and rely on device-level time limits (Screen Time/Family Link). Parents can also disable voice mode via ChatGPT parental controls.

3. **Guest access blocking?** — A child can use ChatGPT without an account, though OpenAI's age prediction system (Jan 2026) now uses behavioral signals to detect minors even without account verification. Network-level controls can block the domain entirely. The browser extension can detect guest mode and block it.

4. **Voice mode monitoring?** — Voice conversations are not visible in the DOM. Parents can now disable voice mode entirely via ChatGPT parental controls (Sep 2025). For families that keep voice enabled, the extension cannot capture voice-to-voice interactions. Consider system audio capture (high privacy concern) or rely on OpenAI's built-in voice safety controls.

5. **ChatGPT desktop app?** — OpenAI has macOS and Windows desktop apps. These are Electron-based, which may support extension-like injection, but this needs investigation.

6. **Impact of OpenAI's "adult mode" (Q1 2026)?** — OpenAI plans to launch an adult mode with age verification via Persona. If a teen successfully verifies as 18+, ChatGPT restrictions would be lifted. Phosra's extension + network enforcement remains independent of ChatGPT's internal mode. Monitor for launch details.

7. **Age prediction false negatives?** — OpenAI's age prediction defaults to safer experience when uncertain. However, sophisticated teens may evade detection. Phosra's enforcement model does not depend on OpenAI's age classification — extension and network controls apply regardless.
