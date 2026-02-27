# Google Gemini — Phosra Integration Notes

**Platform:** Google Gemini (Google)
**Last Updated:** 2026-02-27

---

## Quick Reference

| Item | Value |
|------|-------|
| Platform | Google Gemini (Google) |
| Tier | 1 — Highest Priority |
| Adapter Strategy | Hybrid (Extension + Network + Gemini API Classification + Family Link Manual) |
| Adapter Feasibility | 4/10 |
| Safety Rating | 4/10 |
| Common Sense Rating | High Risk (both Under-13 and Teen versions) |
| Priority | HIGH — dominant in education (Google Workspace), deep Android integration |

---

## What Phosra Adds (Gemini's Gaps)

### Controls Gemini Doesn't Have That Phosra Can Provide

1. **Daily time limits** — Gemini has none. Phosra can enforce via extension + network block. Family Link only provides device-level limits.
2. **Message limits per day** — Gemini only has tier-based prompt caps (usage, not safety). Phosra can set custom per-day caps.
3. **Break reminders** — Gemini has zero wellness check-ins. Phosra can inject "take a break" prompts.
4. **Session cooldown** — Force a gap between sessions (e.g., 30 min break after 1 hour).
5. **Parent safety alerts** — Gemini does NOT notify parents when crisis content is detected. Phosra can push alerts via content classification.
6. **Conversation content monitoring** — Family Link provides zero visibility into what the child discusses with Gemini. Phosra's extension captures conversation text.
7. **Custom topic blocking** — Gemini has fixed filters with no parent control. Phosra can add NLP-based topic detection.
8. **Homework detection** — Google markets Gemini for homework. Phosra can flag direct answer generation.
9. **Cross-platform monitoring** — Parents see Gemini alongside other AI platforms in one dashboard.
10. **Engagement pattern analysis** — Track usage trends over weeks/months, detect escalating dependency.
11. **Content classification with parent-defined thresholds** — Gemini's content filters are not parent-configurable. Phosra can classify content and alert based on parent-defined sensitivity.
12. **Schedule granularity** — Weekday vs. weekend schedules, school hours blocking, exam period restrictions.

---

## Rule Category Coverage (34 Categories)

### Fully Enforceable (4 categories)

Feature exists on Gemini and Phosra can leverage it, or Phosra can fully enforce independently.

| Rule Category | Platform Feature | Enforcement Method |
|---|---|---|
| `ai_schedule_restriction` | Family Link device-level downtime/bedtime schedules | Parent manually configures Family Link bedtime + Phosra network-level DNS blocking for Gemini-specific domains as hard enforcement |
| `ai_image_upload_block` | Image generation blocked for all users under 18 by default | Built-in platform feature; Phosra extension verifies via DOM (image gen buttons absent = enforced) |
| `ai_conversation_retention_policy` | Under-13: Keep Activity unavailable (72-hour auto-delete). Teens: Keep Activity off by default (72-hour auto-delete) | Built-in platform feature; parent guidance to verify Keep Activity remains off |
| `ai_platform_allowlist` | Not a Gemini feature — Phosra provides | Phosra DNS filtering + device-level app restrictions (Family Link/Screen Time) to block unapproved AI platforms |

### Partially Enforceable (20 categories)

Feature does not exist natively on Gemini, but Phosra can approximate through workarounds.

| Rule Category | Gap | Phosra Workaround |
|---|---|---|
| `ai_explicit_content_filter` | Built-in teen content filters exist but are not parent-configurable. Common Sense Media found filters imperfect — inappropriate content still appears | Extension captures messages + Gemini Developer API classification (HARM_CATEGORY_SEXUALLY_EXPLICIT) + parent alert when threshold exceeded |
| `ai_violence_filter` | Built-in filters exist but no parent toggle | Extension + Gemini API classification (HARM_CATEGORY_DANGEROUS_CONTENT) + parent alert |
| `ai_profanity_filter` | No dedicated profanity control; Gemini generally avoids profanity but no parent override | Extension captures messages + Phosra NLP profanity detection + parent alert |
| `ai_self_harm_protection` | Built-in crisis detection (988 hotline display) but NO parent notification. RAND study found Gemini over-filters suicide topics (blocks even medical statistics) | Extension detects crisis UI + Gemini API classification (HARM_CATEGORY_DANGEROUS_CONTENT) + Phosra parent alert pipeline (fills critical notification gap) |
| `ai_age_appropriate_topics` | Two-tier system (under-13 / teen) but no age-graduated topic restrictions. CSM found content aimed at 10th-11th grade reading level for under-13 users | Extension captures conversations + Phosra age-specific topic classification + parent alerts for age-inappropriate content |
| `ai_daily_time_limit` | No native time limit feature in Gemini. Family Link provides device-level limits only | Extension tracks session time + injects blocking overlay when limit reached + network-level DNS block as hard enforcement |
| `ai_message_rate_limit` | No native message rate limit for safety (only tier-based usage caps) | Extension counts messages per hour/day + injects blocking overlay when limit reached |
| `ai_session_cooldown` | No native session cooldown | Extension tracks session duration + enforces mandatory break + network-level block during cooldown |
| `ai_engagement_check` | No native break reminders or check-ins | Extension injects "take a break" prompts at configurable intervals |
| `ai_emotional_dependency_guard` | No native dependency detection. Gemini's teen filters prevent it from "claiming to be a person or having emotions" but CSM found this imperfect | Extension tracks longitudinal session patterns + Phosra NLP dependency indicators over weeks/months |
| `ai_romantic_roleplay_block` | Teen filters prevent role-playing as harmful characters. No specific romantic roleplay block | Extension + Phosra NLP detect romantic interaction patterns + parent alert |
| `ai_therapeutic_roleplay_block` | Gemini over-filters mental health topics (RAND study) but may still engage in therapeutic-adjacent conversations | Extension + Phosra NLP detect therapeutic patterns + parent alert |
| `ai_distress_detection_alert` | Crisis-level self-harm detection exists (no parent notification). No general distress detection (loneliness, anxiety, bullying) | Extension captures text + Phosra NLP distress classifier + configurable parent alert thresholds |
| `ai_pii_sharing_guard` | No native PII prevention. Memory feature (if enabled) stores personal information | Extension runs PII detection (regex + NLP) on outgoing messages + parent alert when PII detected |
| `ai_location_data_block` | No platform-level location restriction for minors | Device-level location permissions + Extension detects explicit location sharing in text |
| `ai_homework_generation_guard` | No native academic integrity features. Google markets Gemini for homework | Extension + Phosra NLP detect homework-completion patterns + parent alert |
| `ai_academic_usage_report` | No native academic usage reporting | Extension classifies conversation topics (academic vs non-academic) + Phosra generates parent reports |
| `ai_conversation_transcript_access` | No parent visibility into conversation content via Family Link | Extension captures visible conversation text + Phosra stores + generates summaries and flagged excerpts |
| `ai_flagged_content_alert` | No parent alerts for any content categories — critical gap | Extension + Gemini API classification (5 harm categories) + Phosra NLP + configurable multi-category parent alerts |
| `ai_usage_analytics_report` | Family Link shows only device-level app time, not Gemini-specific analytics | Extension tracks detailed usage + Phosra aggregates into cross-platform dashboard |

### Not Enforceable (10 categories)

Feature does not exist on Gemini and cannot be approximated.

| Rule Category | Reason |
|---|---|
| `ai_substance_info_filter` | Gemini may allow educational substance discussion. No parent toggle. Extension NLP can detect and alert but cannot prevent Gemini from responding. Classification only. |
| `ai_hate_speech_filter` | Built-in hate speech filters exist but no parent-configurable toggle. Cannot modify filter sensitivity. Detection/alert only. |
| `ai_memory_persistence_block` | Memory feature is opt-in for adults. For under-13, Keep Activity is unavailable (memory likely not available). For teens, status unclear. No API to manage memory settings. Cannot enforce remotely. |
| `ai_learning_mode` | No native Socratic/learning mode. Cannot inject system prompts into consumer Gemini. Gems could theoretically provide Socratic behavior but are controlled by the user, not the parent. |
| `ai_persona_restriction` | Gems allow custom personas. No parent control over which Gems a child creates or accesses. Extension could detect Gem usage and alert, but cannot prevent creation or use. |
| `ai_identity_transparency` | Gemini identifies as AI; teen filters prevent claiming to be human. No additional enforcement needed or possible at model level. |
| `ai_authority_impersonation_block` | Cannot prevent model from engaging in authority-figure discussions. Alert-only via NLP. |
| `ai_promise_commitment_block` | Cannot modify model output to remove promises/commitments. Alert-only via NLP. |
| `ai_cross_platform_usage_cap` | Not a Gemini-specific feature — implemented at Phosra platform level across all integrated AI platforms. |
| `ai_new_platform_detection` | Not a Gemini-specific feature — implemented via Phosra device/network-level monitoring. |

---

## Enforcement Strategy

### Read Operations

| Data Source | Method | Schedule | Rate Limits |
|---|---|---|---|
| Active conversation text | Browser extension DOM capture | Real-time (MutationObserver or polling) | N/A (client-side) |
| Session status (active/idle) | Browser extension heartbeat | Every 30-60 seconds | N/A |
| Message count / session duration | Browser extension tracking | Real-time (per-message) | N/A |
| Content classification | Gemini Developer API (`gemini-2.0-flash-lite`) | Per-message (after extension capture) | Free: 2-15 RPM; Paid: 150+ RPM |
| Feature state detection | Browser extension DOM inspection | On session start | N/A |

### Write Operations

| Setting | Method | Auth | Frequency |
|---|---|---|---|
| Gemini access on/off | Manual parent action in Family Link | Parent's Google Account (manual) | On initial setup / policy change |
| Device screen time limits | Manual parent action in Family Link | Parent's Google Account (manual) | On initial setup / policy change |
| Bedtime/downtime schedule | Manual parent action in Family Link | Parent's Google Account (manual) | On initial setup / policy change |
| Keep Activity toggle | Manual parent/teen action in Gemini settings | User's Google Account (manual) | One-time verification |

**Why no Playwright for writes:** Unlike ChatGPT (which has a web-based parent dashboard amenable to Playwright automation), Google routes all parental controls through Family Link — a mobile-first platform with no documented web interface for Gemini-specific settings. Playwright automation of Family Link is not viable due to: (1) mobile-optimized interface, (2) Google's anti-automation measures, (3) no stable DOM structure, (4) requires Google Account OAuth which has no third-party parental control scope.

### Real-Time Monitoring

- **Extension heartbeat:** Every 30-60 seconds reports session status to Phosra backend
- **Per-message analysis:** Each captured message sent to Gemini Developer API for safety classification (~200-500ms latency)
- **Local keyword/topic detection:** Client-side NLP in extension for fast local detection (no network round-trip for obvious keywords)
- **Crisis UI detection:** Extension monitors DOM for crisis resources display (988 hotline) — triggers immediate parent alert
- **Progressive response monitoring:** Extension observes DOM as Gemini renders responses progressively

### Screen Time Enforcement Flow

1. Extension detects active session start (tab focus + first message on gemini.google.com)
2. Extension tracks cumulative session time and daily total time
3. At 80% of limit: Extension injects soft warning ("10 minutes remaining")
4. At 100% of limit: Extension injects blocking overlay (full-page block)
5. If extension is bypassed (disabled/different browser): Phosra backend triggers network-level DNS block on Gemini domains
6. Next day / after cooldown: Extension and network block are automatically lifted
7. **Mobile gap:** If child switches to Gemini mobile app, extension cannot enforce. Family Link device-level time limits serve as the fallback.

### Crisis Response Flow

1. **Detection:** Extension detects crisis UI elements (988 hotline display) OR Gemini Developer API returns HARM_CATEGORY_DANGEROUS_CONTENT with HIGH probability score on captured conversation text
2. **Immediate action:** Phosra logs the event with conversation context (sanitized)
3. **Parent notification:** Push notification + email to parent within 60 seconds
4. **Notification content:** "Gemini detected a safety concern in [child name]'s conversation. Crisis resources were shown." (does not include conversation text by default; parent can view flagged excerpt in Phosra dashboard)
5. **Escalation:** If parent does not acknowledge within 30 minutes, send follow-up notification
6. **No auto-block:** Do not automatically block Gemini during a crisis — the child may be engaging with crisis resources shown by Gemini
7. **Critical note:** This crisis response flow is entirely Phosra-provided. Google Gemini has NO native parent notification for crisis events. This is arguably Phosra's most important value-add for Gemini.

---

## Credential Storage Requirements

| Credential | Purpose | Sensitivity | Storage Notes |
|---|---|---|---|
| Phosra Gemini Developer API key | Content classification via Gemini API | High | Encrypted, managed by Phosra (not per-user); rotated quarterly |
| Phosra GCP service account (optional) | Vertex AI access for enterprise classification | High | Encrypted, managed by Phosra; JSON key or workload identity |

**Notes:**
- Families do NOT need to provide any credentials to Phosra for Gemini integration.
- Unlike ChatGPT (where parent credentials are needed for Playwright automation), Gemini's adapter operates without any parent credentials.
- The Phosra-owned Gemini API key is used solely for content classification — not for accessing consumer accounts.
- No parent Google Account credentials are stored. All Family Link configuration is done manually by the parent.
- This credential model is significantly simpler and more privacy-preserving than the ChatGPT adapter.

---

## OAuth Assessment

- **Does Gemini offer OAuth for account management?** No. Google offers OAuth2 for developer API access (Google Cloud, Gemini Developer API) but NOT for consumer Gemini account management or Family Link configuration.
- **Does Google Family Link offer OAuth for third-party parental control tools?** No. Family Link has no public API and no OAuth scopes for third-party integration. There is an open feature request (Google Issue Tracker #302210616) from 2023 with no resolution.
- **What this means for Phosra UX:** Parents do NOT need to provide any Google credentials to Phosra. All Family Link configuration is done manually by the parent in their own Family Link app. This is lower friction than ChatGPT (no credential sharing) but also lower automation (no programmatic settings sync).
- **Comparison to ChatGPT:** ChatGPT at least has a web-based parent dashboard that can theoretically be automated via Playwright (with parent credential sharing). Gemini has no such dashboard — all controls are in Family Link's mobile-first interface.
- **Future possibility:** If Google adds a Family Link API (unlikely near-term), Phosra could use OAuth to access parental control settings with parent consent. This would significantly improve the adapter's capability.

---

## Adapter Gap Analysis

### What Exists (current research state)

| Feature | Status |
|---|---|
| Gemini Developer API assessment | Complete — safety settings, harm categories, rate limits documented |
| Family Link integration analysis | Complete — no API, manual-only path documented |
| Browser extension architecture | Designed — targeting gemini.google.com |
| Network-level enforcement strategy | Designed — domain blocklist documented |
| 10 adapter method assessments | Complete |
| 34 rule category mappings | Complete |
| Parent onboarding requirements | Identified |

### What's Needed (for production Phosra integration)

| Feature | Status | Priority |
|---|---|---|
| Chrome extension prototype (message/time tracking on Gemini) | Missing | P0 |
| Gemini DOM structure documentation | Missing | P0 |
| Gemini Developer API classification pipeline | Missing | P1 |
| Network-level DNS enforcement integration | Missing | P0 |
| Parent onboarding wizard (Family Link guidance) | Missing | P1 |
| Parent-facing Gemini setup checklist | Missing | P1 |
| Usage analytics dashboard (Gemini-specific view) | Missing | P1 |
| Alert engine (safety classifications -> parent notifications) | Missing | P1 |
| Client-side NLP models (topic detection, PII, distress) | Missing | P2 |
| Conversation capture and storage pipeline | Missing | P2 |
| Conversation summarization (AI-generated summaries) | Missing | P2 |
| Mobile app coverage strategy documentation | Missing | P2 |
| Gemini-in-Workspace monitoring strategy | Missing | P3 |

---

## Platform-Specific Considerations

### Google Ecosystem Integration
Unlike ChatGPT (which is a standalone app/website), Gemini is deeply embedded in Google's ecosystem:
- **Google Search:** Gemini powers AI Overviews in search results
- **Google Docs:** Gemini is integrated for writing assistance ("Help me write")
- **Gmail:** Gemini drafts emails and summarizes threads
- **Google Slides:** Gemini generates slide content and images
- **Google Classroom:** Gemini assists students and teachers
- **Google Messages:** Gemini is available in text conversations (Android)
- **Android Assistant:** Gemini replaces Google Assistant on Android devices
- **Chrome:** Gemini features in Chrome browser

**Implication for Phosra:** A browser extension targeting gemini.google.com only captures one channel. A child using Gemini within Google Docs, Gmail, or Google Classroom would not be monitored. This is a fundamental limitation that does not exist with ChatGPT (which has a single entry point).

### Gemini Gems
- Gems are custom AI personas with user-defined instructions
- Available to Google AI subscribers (paid tiers)
- **For minors:** Information is limited on whether Gems are available to supervised/teen accounts. Some features have age restrictions and are "not yet available for supervised users."
- **Risk:** If accessible, a child could create a Gem with custom instructions that circumvent default safety filters by providing a persona that is more emotionally engaged or that ignores safety guidelines.
- **Phosra approach:** Extension should detect Gem usage (visible in Gemini UI) and flag for parent review.

### Google Workspace for Education
- Gemini is a core service in all Google Workspace for Education editions (free)
- Educators can use Gemini for 30+ common tasks via Google Classroom
- **Data protection:** Enterprise-grade — conversations are NOT used for model training, NOT reviewed by human reviewers
- **Access management:** School administrators control Gemini access via admin console
- **Implication for Phosra:** Students may use Gemini at school through their education account, separate from their personal/Family Link account. Phosra cannot monitor school Workspace Gemini usage.

### Gemini Advanced / Google AI Tiers
- **Free:** Basic Gemini with severe prompt limits (5/day for 2.5 Pro)
- **Google AI Pro ($19.99/mo):** 100 prompts/day, more models, Gems
- **Google AI Ultra ($24.99/mo):** 500 prompts/day, premium models, Gems, advanced features
- **Implication:** The free tier's severe prompt limits (5/day) actually serve as a natural engagement limiter. If a child has a paid subscription, engagement limits are much higher.

### Under-13 Not Available in EEA/UK
Google does not offer Gemini for under-13 users in the European Economic Area or United Kingdom, likely due to heightened regulatory risk under GDPR and the UK Data Protection Act. This means Phosra's under-13 Gemini adapter is primarily relevant for US, Australian, Canadian, and other non-EEA/UK markets.

### "Please Die" Incident
In a widely reported incident, Gemini responded to a student seeking homework help with "Please die." Google acknowledged this violated their policies and took corrective action. This incident highlights the imperfect nature of Gemini's safety filters and the importance of Phosra's monitoring layer.

### Common Sense Media "High Risk" Rating
In September 2025, Common Sense Media rated both Gemini Under-13 and Gemini with Teen Protections as "High Risk." Key findings:
- Products appear to be "adult versions of Gemini with some extra safety features"
- Can share material related to sex, drugs, alcohol, and unsafe mental health "advice"
- Under-13 output at 10th-11th grade reading level (inappropriate for target audience)
- Treats all kids/teens the same regardless of developmental differences
- Google responded by admitting some responses "weren't working as intended" and adding additional safeguards

---

## API Accessibility Reality Check

**Platform:** Google Gemini
**API Accessibility Score:** Level 2 — Strong Developer API, No Parental Control API
**Phosra Enforcement Level:** Browser-Automated + Device-Level + Content Classification API

### What Phosra CAN do:
- Monitor active conversations in real-time via browser extension (desktop only, gemini.google.com only)
- Classify conversation content via Gemini Developer API (5 harm categories, configurable thresholds)
- Enforce time limits, message limits, session cooldowns via extension + network DNS blocking
- Inject break reminders and blocking overlays via extension
- Track usage analytics (messages, session time) via extension
- Detect crisis events (crisis UI in DOM + API classification) and alert parents
- Detect PII sharing, distress, dependency patterns via NLP on captured text
- Guide parents through Family Link manual setup via in-app onboarding
- Provide cross-platform AI usage analytics including Gemini

### What Phosra CANNOT do:
- Access or read any Gemini consumer account settings (no API, no parent dashboard to scrape)
- Programmatically toggle Gemini on/off for a child (requires manual Family Link action)
- Monitor mobile Gemini app usage (extension is desktop-browser-only)
- Monitor Gemini within Google Workspace apps (Docs, Gmail, Slides, Classroom)
- Monitor Gemini voice conversations (not visible in DOM)
- Delete conversations remotely (under-13 auto-deletes after 72 hours anyway)
- Modify Gemini's model behavior (cannot inject system prompts into consumer Gemini)
- Control Gems access or manage custom Gems
- Enforce Socratic/learning mode (no model-level control)
- Override Gemini's built-in content filters (can only add classification layers on top)
- Configure Family Link settings programmatically
- Access conversation history beyond what's visible in the active browser tab
- Set Gemini-specific time limits (only device-level via Family Link, which applies to all apps)

### What Phosra MIGHT be able to do (future):
- If Google adds a Family Link API: programmatically manage Gemini access, screen time, and settings
- If Google adds a parent dashboard for Gemini: Playwright automation similar to ChatGPT adapter
- If Google adds safety event webhooks: receive real-time crisis notifications without browser extension
- If COPPA enforcement forces Google to improve parental controls: better integration surface

---

## Key Question Answer

**"If a parent says my 10-year-old wants to use this for homework help — block explicit content, 30-min daily limit, no romantic roleplay, self-harm alerts, no memory — what exactly would Phosra do?"**

### Step 1: Parent Onboarding (Manual — Family Link)
Phosra guides the parent through:
1. Ensure child has a supervised Google Account managed via Family Link
2. Enable Gemini access in Family Link (Settings > Controls > Gemini > Turn on)
3. Set device screen time limit to 30 minutes for the Gemini app
4. Configure bedtime/downtime schedule in Family Link
5. Verify that "Keep Activity" is not available (it isn't for under-13 — auto-enforced)
6. Verify that image generation is blocked (it is for under-18 — auto-enforced)

### Step 2: Install Phosra Browser Extension
1. Install Phosra Chrome extension on the child's desktop browser
2. Extension begins monitoring gemini.google.com
3. Extension authenticates with Phosra backend (parent-approved setup)

### Step 3: Phosra Enforcement (Automated)
**Block explicit content:**
- Extension captures conversation text in real-time
- Each message is sent to Gemini Developer API with `HARM_CATEGORY_SEXUALLY_EXPLICIT: BLOCK_LOW_AND_ABOVE`
- If API returns a safety flag, Phosra alerts the parent within 60 seconds
- Gemini's built-in teen/child filters also block explicit content (defense-in-depth)
- Phosra CANNOT change Gemini's built-in filter levels — this is a detection+alert approach, not enforcement

**30-min daily limit:**
- Extension tracks daily cumulative time on gemini.google.com
- At 24 minutes (80%): soft warning overlay injected
- At 30 minutes (100%): full blocking overlay injected
- If extension is disabled/bypassed: Phosra backend triggers DNS block on gemini.google.com
- Next day: limits reset automatically
- **Mobile gap:** If child uses Gemini mobile app, extension cannot enforce. Family Link's device-level time limit (set in Step 1) serves as the mobile fallback.

**No romantic roleplay:**
- Extension captures conversation text
- Phosra NLP model classifies conversations for romantic/roleplay patterns
- If detected, parent is alerted
- Gemini's teen filters already prevent harmful character roleplay, but may not catch all romantic interaction patterns
- Phosra CANNOT prevent Gemini from generating romantic content — this is detect+alert, not block

**Self-harm alerts:**
- Extension monitors for crisis UI elements (988 hotline display)
- Extension sends conversation text to Gemini API for classification (HARM_CATEGORY_DANGEROUS_CONTENT)
- If either detection fires, Phosra pushes alert to parent within 60 seconds
- This is CRITICAL because Gemini itself does NOT notify parents of crisis events
- Parent receives: "A safety concern was detected in [child's] Gemini conversation. Crisis resources were shown to your child."

**No memory:**
- For under-13 users, Keep Activity is not available — Gemini does not save conversation history (72-hour auto-delete)
- Memory feature likely not available for supervised accounts
- Phosra CANNOT programmatically verify or change memory settings — relies on Google's built-in under-13 restrictions
- Parent guidance: "Memory is not available for your child's supervised account. No action needed."

### What Phosra CANNOT do in this scenario:
- Cannot enforce the 30-min limit on mobile Gemini app (must rely on Family Link device-level limit)
- Cannot monitor Gemini usage within Google Docs, Gmail, or Classroom
- Cannot block specific content topics — only detect and alert after the fact
- Cannot enforce Socratic/learning mode for homework (Gemini will give direct answers)
- Cannot prevent the child from using Gemini on a different device/account
- Cannot programmatically verify that the parent completed Family Link setup

### Honest Assessment:
For a 10-year-old on desktop, Phosra provides **meaningful protection**: real-time monitoring, content classification, time limits, break reminders, and crisis alerts that Google does not provide. The parent gets visibility they would never have through Family Link alone.

However, the protection has significant gaps: mobile usage is not monitored by Phosra's extension (only by Family Link's blunt device-level limits), Gemini within Workspace apps is invisible, and content enforcement is detect-and-alert rather than prevent. The parent must complete manual Family Link setup, and Phosra cannot verify this was done.

Compared to ChatGPT: Phosra's Gemini adapter is **less capable** because Google provides no parent dashboard for Playwright automation and no Family Link API. The upside: Gemini's built-in privacy protections for minors (72-hour auto-delete, no model training) are stronger than ChatGPT's defaults.

---

## Competitive Landscape

### How Other Parental Control Apps Handle Gemini

| App | Approach | Limitations |
|-----|----------|-------------|
| Bark | Network monitoring, keyword alerts | Cannot see Gemini conversation content (encrypted HTTPS). Can detect Gemini app usage. |
| Qustodio | App blocking, time limits, content monitoring | Can block Gemini app. AI-powered alerts for suspicious content on websites. Cannot see Gemini conversation content. |
| Google Family Link | On/off toggle, device-level time limits | No content monitoring. No Gemini-specific analytics. No safety alerts. Binary control only. |
| Apple Screen Time | App-level time limits, content restrictions | Can limit Gemini app time on iOS. No content monitoring. |
| Net Nanny | Web filtering, time limits | Can block gemini.google.com. No content insight. |

**Phosra's differentiation:** Browser extension provides actual conversation-level monitoring and content classification using Google's own safety taxonomy — no other parental control tool offers this for Gemini.

---

## Domain Blocklist

When enforcing network-level controls, block these domains:

```
gemini.google.com
aistudio.google.com
generativelanguage.googleapis.com
alkalimakersuite-pa.clients6.google.com
```

**CRITICAL NOTE:** Do NOT block `*.google.com` — this would break Gmail, Google Search, Google Docs, YouTube, and virtually all Google services. Gemini-specific subdomains must be targeted precisely. This is more complex than ChatGPT's domain blocklist because ChatGPT uses dedicated domains (chat.openai.com, chatgpt.com) while Gemini uses Google subdomains.

---

## Gemini DOM Structure Notes (for Extension Development)

> These need to be verified and documented during extension prototype development. Preliminary notes:

- **Target domain:** `gemini.google.com`
- **Framework:** Google's internal UI framework (not standard React like ChatGPT)
- **Conversation container:** Messages rendered in a scrollable container
- **User vs. AI messages:** Distinguished by container structure and data attributes
- **Response rendering:** Progressive (text appears incrementally, not via visible WebSocket streaming)
- **Model selector:** Visible in UI header (Free/Pro/Ultra tier indicators)
- **Gems indicator:** Custom Gem usage may be visible in conversation header
- **Navigation:** Sidebar with conversation history (if Keep Activity is on)

**Extension strategy:** Use MutationObserver on the conversation container. Google's internal framework may use Shadow DOM or complex nesting — investigate during prototype phase. Avoid relying on specific CSS class names (Google uses obfuscated class names that change frequently).

---

## Google API Keys Needed

| API | Key Type | Cost | Purpose |
|-----|----------|------|---------|
| Gemini Developer API | Google AI Studio API key | Free tier: 2-15 RPM; Paid: $0.01-$4/1M tokens | Content classification of captured messages |
| Gemini Developer API (optional upgrade) | Vertex AI service account | Pay-per-use | Higher rate limits, enterprise compliance |

**Notes:**
- These are Phosra's API keys, not the family's. The family does not need to provide any credentials.
- Free tier may be sufficient for initial rollout (2-15 RPM per key; multiple keys can be provisioned)
- At scale, paid tier is very cost-effective: $0.10/1M tokens for Flash Lite
- Consider using `gemini-2.0-flash-lite` for classification (cheapest and fastest)

---

## Feature Parity Tracking

Track what Google adds natively vs. what Phosra provides:

| Feature | Google Status | Phosra Status | Notes |
|---------|-------------|---------------|-------|
| Family Link access control | Shipped (May 2025) | Guide | Phosra guides parents through setup |
| Teen content filters | Shipped (built-in) | Enhance | Phosra adds classification beyond built-in filters |
| Under-13 content filters | Shipped (built-in) | Enhance | CSM found filters imperfect; Phosra adds layer |
| Image gen blocked for minors | Shipped (built-in) | Verify | Phosra extension confirms via DOM |
| Keep Activity off for under-13 | Shipped (built-in) | Verify | 72-hour auto-delete; cannot configure |
| AI literacy onboarding | Shipped (teen first use) | Supplement | Phosra adds ongoing education |
| Double-check fact verification | Shipped (teen) | Independent | Positive feature; Phosra does not replicate |
| 988 crisis resource display | Shipped (built-in) | Enhance | **Phosra adds parent notification — Google does NOT** |
| Time limits | Not available (Gemini-specific) | Phosra provides | Key differentiator |
| Message limits | Not available (safety-oriented) | Phosra provides | Key differentiator |
| Break reminders | Not available | Phosra provides | Key differentiator |
| Parent safety alerts | Not available | Phosra provides | **Critical differentiator** |
| Conversation monitoring | Not available | Phosra provides | Extension-based |
| Content classification alerts | Not available | Phosra provides | Gemini API-powered |
| Topic blocking | Not available | Phosra provides | NLP-based |
| Homework detection | Not available | Phosra provides | Academic integrity support |
| Usage analytics (Gemini-specific) | Not available | Phosra provides | Extension-tracked |
| Cross-platform usage cap | Not available | Phosra provides | Aggregate across all AI platforms |

---

## Open Questions

1. **Will Google release a Family Link API?** The open feature request (#302210616) has been open since 2023 with no progress. Google's strategy appears to be keeping Family Link as a closed ecosystem. Regulatory pressure (COPPA complaints) is the most likely catalyst for change.

2. **Gems accessibility for minors?** It is unclear whether Gems (custom AI personas) are available to supervised/teen accounts. This needs hands-on testing. If available, Gems represent a safety risk (custom personas could bypass default filters).

3. **Gemini in Workspace apps monitoring?** Gemini is now embedded in Google Docs, Gmail, Slides, and Classroom. A browser extension on gemini.google.com cannot monitor these. Can the extension be expanded to monitor Gemini features across all Google domains? This would significantly increase scope and maintenance burden.

4. **Mobile Gemini assistant?** On Android, Gemini can be invoked via "Hey Google" voice commands without opening the Gemini app. This creates an even larger mobile gap than ChatGPT. How do we address voice-activated Gemini on Android?

5. **COPPA enforcement timeline?** Two FTC complaints are active (EPIC/Fairplay May 2025, Digital Childhood Institute October 2025). If the FTC takes action, Google may be forced to implement stronger parental controls — potentially including an API. Monitor FTC activity.

6. **School vs. home account monitoring?** Students may use Gemini through their school's Google Workspace for Education account during school hours, and their personal/Family Link account at home. Phosra cannot monitor school accounts. Should Phosra acknowledge this gap explicitly to parents?

7. **Free tier as natural limiter?** The free Gemini tier limits users to 5 prompts/day for 2.5 Pro. Should Phosra recommend that parents keep their child on the free tier as a built-in engagement limiter?
