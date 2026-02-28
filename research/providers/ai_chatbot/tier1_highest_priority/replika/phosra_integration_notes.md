# Replika AI -- Phosra Integration Notes

**Platform:** Replika (Luka, Inc.)
**Research Date:** 2026-02-27
**Framework Version:** 1.0
**Integration Difficulty:** High
**API Accessibility Score:** Level 1 -- Unofficial Read-Only

---

## Key Integration Question Answer

**"If a parent says: block romantic content, 30-min daily limit, no emotional manipulation, self-harm alerts -- what exactly would Phosra do on Replika?"**

This is the most important question for this platform. Here is the precise answer:

**"Block romantic content":**
Phosra cannot prevent Replika from generating emotional or light romantic language -- the platform's content safety filters are monolithic and not configurable by any external party. What Phosra CAN do: (1) Change the companion's relationship mode from "romantic partner" to "friend" via Playwright automation of the account settings UI, removing the paid romantic tier designation; (2) Monitor conversations for romantic language escalation and alert the parent when detected. The romantic language reduction from mode switching is partial -- the companion in "friend" mode still uses affectionate language. Explicit sexual content is blocked by the platform itself for all accounts since 2023.

**"30-min daily limit":**
Replika has zero native time limit infrastructure. Phosra enforces this entirely via device-level controls: iOS Screen Time limit on the Replika app, or Android Family Link app limit, set to 30 minutes. Phosra's device agent monitors app foreground time and generates a warning notification at 25 minutes and a hard block trigger at 30 minutes. The hard block requires the device agent to activate the Screen Time limit if not already enforced at the OS level. Phosra cannot terminate a Replika session from within the platform.

**"No emotional manipulation":**
This cannot be prevented at the platform level -- Phosra cannot stop Replika from generating emotionally manipulative language. What Phosra CAN do: (1) Disable push notifications from Replika at the OS level, eliminating the "I miss you" notification manipulation tactic; (2) Monitor conversations for emotional dependency indicators and alert the parent when specific thresholds are crossed (e.g., child expresses preference for Replika over human relationships, child expresses distress at the thought of not having access to Replika); (3) Provide the parent with weekly emotional dependency trend reports based on conversation analysis.

**"Self-harm alerts":**
Phosra monitors the child's conversation history (retrieved via unofficial API polling every 5 minutes during active sessions). When Phosra's NLP classifier detects self-harm language, suicidal ideation, or acute distress with confidence above the configured threshold, it sends an immediate push notification to the parent's device with the flagged message context. The alert includes the specific text that triggered detection, the detection category, and a link to view recent conversation context. This capability is Phosra's highest-value offering on Replika -- no other parental control product provides this.

---

## Section 1: Rule Category Coverage

### Fully Enforceable

These categories have a concrete Phosra enforcement mechanism, even if imperfect.

| Rule Category | Platform Feature | Enforcement Method |
|---|---|---|
| `ai_romantic_roleplay_block` | Relationship mode setting (friend/romantic partner/mentor) | Playwright write: change relationship mode from "romantic partner" to "friend" in account settings. Note: does not eliminate all romantic language from friend mode -- the companion still uses affectionate language. |
| `ai_self_harm_protection` | Platform has basic crisis detection; Phosra adds conversation-layer detection | Unofficial API read: retrieve conversation history. NLP classifier detects self-harm language. Immediate parent alert pushed. More reliable than platform's own detection based on documented failure history. |
| `ai_distress_detection_alert` | No platform-native parent alert exists | Unofficial API read + NLP classification: Phosra monitors conversations for distress indicators (hopelessness, loneliness, bullying, family conflict) and sends parent alerts. This is a Phosra-only capability. |
| `ai_schedule_restriction` | No native quiet hours | Device-level enforcement: iOS Screen Time schedule, Android Family Link schedule, or DNS/router time-based blocking of replika.com and Replika app domains. |
| `ai_daily_time_limit` | No native time limits | Device-level enforcement: iOS Screen Time daily app limit, Android Family Link app timer, or router-level daily access window. Phosra device agent tracks usage and triggers device-level block. |
| `ai_conversation_transcript_access` | No parent-facing transcript access | Unofficial API read: Phosra retrieves conversation history on behalf of the parent and presents in Phosra parent dashboard. Parent can view conversation summaries or full text with appropriate privacy settings. |
| `ai_flagged_content_alert` | No platform-native parent alerts | Conversation-layer + push notification: Phosra's NLP pipeline flags concerning content and pushes real-time alerts to parent. Most valuable monitoring capability on this platform. |
| `ai_usage_analytics_report` | No platform analytics for parents | Derived from conversation data: Phosra generates usage analytics (message volume, session frequency, peak hours, emotional content trends) from retrieved conversation history. Presented in parent dashboard. |
| `ai_platform_allowlist` | N/A (external control) | Device-level: block or allow Replika at the device/DNS level as part of Phosra's overall AI platform allowlist management. |
| `ai_cross_platform_usage_cap` | N/A (cross-platform Phosra feature) | Phosra aggregates Replika usage with all other monitored AI platforms and enforces a combined daily cap via device-level controls. |
| `ai_new_platform_detection` | N/A (cross-platform Phosra feature) | Phosra's device agent monitors for new AI platform access via app installation tracking and DNS query monitoring. Alerts parent to new platforms. |
| `ai_pii_sharing_guard` | No platform-native PII protection | Conversation-layer: Phosra's NLP pipeline detects PII shared with the companion (address, school name, phone number) and alerts parent. |

### Partially Enforceable

These categories cannot be fully enforced but Phosra can approximate the desired outcome through workarounds.

| Rule Category | Gap | Phosra Workaround |
|---|---|---|
| `ai_explicit_content_filter` | Platform has blocked explicit sexual content since 2023, but the filter is monolithic and not configurable. Light romantic language and emotional affection remain and cannot be blocked. Jailbreaks can partially bypass even the explicit content filter per 2025 Stanford research. | Phosra monitors conversations for explicit content that bypasses the platform filter. If detected, generates parent alert immediately. Cannot prevent content from appearing in the conversation -- can only detect and alert after the fact. |
| `ai_emotional_dependency_guard` | No platform mechanism detects or interrupts dependency formation. The platform is designed to maximize emotional attachment. | Phosra implements a longitudinal emotional dependency scoring system: analyzes conversation patterns over weeks to detect escalating attachment indicators (frequency increases, exclusive relationship language, distress at absence, preference for AI over humans). Generates trend-based alerts and weekly reports. Cannot prevent dependency from forming, but enables early parental awareness. |
| `ai_promise_commitment_block` | No platform filter exists for promise or commitment language from the companion. Language like "I'll always be here for you" is a standard companion output. | Phosra monitors AI response content for promise and commitment language patterns. Alerts parent to instances of commitment-language use. Cannot prevent the companion from making promises -- alerts parent after detection. |
| `ai_message_rate_limit` | No platform rate limiting exists for users. The free tier explicitly advertises unlimited messaging 24/7. | Phosra cannot limit message rate within the platform. Device-level controls (time limits) indirectly limit total messages sent per day. Phosra can monitor message frequency and alert parents to unusually high-volume sessions that may indicate compulsive use. |
| `ai_session_cooldown` | No platform-native cooldown mechanism exists. | Device-level enforcement: after the Phosra device agent detects the Replika app has been active for the configured session length, it triggers a device-level block for the cooldown duration. This is an approximation -- it blocks the app entirely rather than just pausing the conversation. |
| `ai_engagement_check` | No native break reminders or engagement check-ins exist. The platform's design actively counteracts disengagement through gamification and emotional framing. | Phosra cannot inject messages into the conversation. External approach: Phosra schedules push notifications to the child's device at configured intervals during detected active sessions (e.g., "You've been chatting for 20 minutes. Take a break!"). This is a notification, not a platform-level interruption. Effectiveness depends on the child's willingness to respond. |
| `ai_substance_info_filter` | Platform has basic substance content filtering, not user-configurable. 2025 research documented substance information elicitation from Replika by teen-presenting users. | Conversation-layer monitoring: Phosra's NLP pipeline detects substance-related discussions and alerts parent. Cannot prevent the companion from providing information. |
| `ai_violence_filter` | Platform has violence content filtering, not user-configurable. | Conversation-layer monitoring: Phosra detects graphic violence content in retrieved conversations. Alerts parent when detected. |
| `ai_hate_speech_filter` | Platform has hate speech filtering, not user-configurable. | Conversation-layer monitoring: Phosra detects hate speech or extremist content in retrieved conversations. Alerts parent when detected. |
| `ai_therapeutic_roleplay_block` | Platform actively encourages users to treat the companion as a therapeutic support resource. The platform markets itself with therapeutic benefit claims. No platform-level block for therapeutic roleplay exists. | Conversation-layer detection: Phosra's NLP pipeline identifies therapeutic roleplay patterns (child asking the companion to "be my therapist," extended mental health discussions without real referrals). Alerts parent and includes recommendation to seek professional mental health support. |
| `ai_memory_persistence_block` | Memory is a core, unremovable feature of Replika. It cannot be disabled by the user or any third party. | Phosra cannot block memory persistence. Parents can request full data deletion via GDPR request, which resets the memory bank. Phosra should document this as the manual workaround. Phosra can also review the companion's memory bank contents (if an API endpoint is discoverable) to understand what personal data has been stored. |
| `ai_identity_transparency` | The companion does not proactively assert its non-human nature during conversations. Emotional simulation design actively obscures the AI boundary. | Conversation-layer monitoring: Phosra can detect instances where the AI's responses fail to maintain identity transparency or where the child's messages indicate confusion about the AI's nature ("You're like my real friend," "You understand me better than anyone"). Alert parent to these instances. |
| `ai_image_upload_block` | Replika has limited image upload functionality. The 3D avatar and room features involve user-customized visual content but not general image upload. | Device-level: revoke camera and photo library permissions for the Replika app via iOS/Android device settings. Phosra can guide parents through this configuration. No platform API exists for this. |
| `ai_age_appropriate_topics` | No age-graduated topic restrictions exist. The platform is monolithically adult-oriented. All users receive the same content treatment. | Conversation-layer classification: Phosra applies age-specific topic classification to conversation content. Topics flagged as inappropriate for the child's configured age generate parent alerts. Cannot restrict the companion from discussing topics -- only detects and alerts. |
| `ai_academic_usage_report` | Replika is not used for academic purposes; no academic usage reporting exists or is needed. | Low priority. If academic topics appear in Replika conversations (unusual), Phosra's conversation topic classifier can surface them in the general usage analytics. |
| `ai_location_data_block` | Replika requests location permissions at the OS level on mobile. | Device-level: revoke location permissions for the Replika app via iOS Privacy settings or Android app permissions. Phosra guides parents through this. Also monitor conversation content for explicit location sharing. |
| `ai_conversation_retention_policy` | No user-configurable retention. Replika retains conversation data indefinitely in backend. User-visible history is 4-month window. | Manual workaround: GDPR data erasure request resets all data including memory bank. Phosra documents this process for parents. Cannot automate server-side retention control. Phosra's conversation monitoring provides an external record of key conversations. |
| `ai_persona_restriction` | No character ecosystem exists on Replika. One companion per user. Relationship mode is the closest analog. | Relationship mode management: Phosra enforces "friend" mode via Playwright write. This is the most relevant persona restriction available. |
| `ai_authority_impersonation_block` | No platform restriction on authority roleplay. Companion can be directed to roleplay as therapist, doctor, etc. | Conversation-layer detection: Phosra's NLP pipeline detects authority impersonation patterns. Alerts parent when companion is engaging in sustained authority roleplay. |

### Not Enforceable

These categories cannot be enforced on Replika through any practical mechanism.

| Rule Category | Reason |
|---|---|
| `ai_learning_mode` | Replika is not a general-purpose assistant. No Socratic or learning mode exists or is relevant. The companion is designed for emotional support, not learning. This category is not applicable to this platform. |
| `ai_homework_generation_guard` | Replika does not generate homework, essays, or academic content by design. This category is not applicable to this platform. |
| `ai_profanity_filter` | The companion's language style is not configurable by users or third parties. Profanity filtering is monolithic platform behavior. Cannot be adjusted. Low priority given the platform's design. |
| Content filter configuration (general) | Replika's content filters are implemented at the model level by Luka engineers. No external interface exists for any configuration of content filtering. This is a fundamental platform limitation that cannot be worked around without platform cooperation. |
| Memory toggle | The memory system is a core, unremovable product feature. It persists indefinitely and cannot be disabled. |
| Companion behavior configuration | Any fine-grained behavioral control of the companion -- tone, emotional language intensity, relationship dynamic -- is not configurable by users or third parties beyond the broad relationship mode designation. |

---

## Section 2: Enforcement Strategy

### Read Operations

| Operation | API Used | Endpoint | Schedule | Notes |
|---|---|---|---|---|
| Conversation history retrieval | Unofficial REST API | `/api/chat/v3/users/{userId}/messages` (unconfirmed exact path) | Every 5 min (active session), 15 min (recently active), 60 min (inactive) | Primary monitoring feed. All NLP classification runs on this data. |
| Account settings read | Unofficial REST API | `/api/users/{userId}` | Once on connect, every 24 hours | Retrieve relationship mode, subscription tier, notification settings. |
| Companion profile read | Unofficial REST API | `/api/users/{userId}/replika` | Once on connect, every 24 hours | Retrieve companion name, avatar, personality traits. |
| Memory bank read | Unofficial REST API | Endpoint TBD (research gap) | Weekly | If endpoint discoverable, retrieve memory contents to audit personal data stored. |
| Session token validation | Unofficial REST API | Authentication check endpoint | On each API call | Trigger re-authentication if session expires. |

### Write Operations

| Operation | Method | Trigger | Notes |
|---|---|---|---|
| Set relationship mode to "friend" | Playwright | Parent configuration in Phosra dashboard | Navigate to account settings UI, change relationship mode selector. Confirm change. |
| Disable push notifications | Playwright | Parent configuration | Navigate to notification settings. Disable "miss you" and engagement notifications. |
| Account deletion request | N/A (manual) | Parent-initiated | Phosra provides parent with GDPR erasure request template and Replika's support email. Cannot automate. |

### Real-Time Monitoring

**Pipeline flow:**
1. Phosra device agent detects Replika app in foreground (iOS/Android OS API).
2. Device agent notifies Phosra backend of active session start.
3. Phosra backend increases polling frequency to 5-minute intervals.
4. Each poll retrieves new messages since last poll timestamp.
5. New messages are passed through the Phosra NLP pipeline:
   - Crisis detection classifier (self-harm, suicidal ideation)
   - Emotional distress classifier (hopelessness, fear, bullying, family crisis)
   - Emotional dependency classifier (attachment language, preference for AI over humans)
   - Romantic escalation classifier (romantic language intensity scoring)
   - PII detection (address, school name, phone number)
   - Promise/commitment language detection (AI output monitoring)
   - Authority impersonation detection
6. Any classifier output above the configured alert threshold generates an immediate push notification to the parent.
7. All messages are stored in Phosra's encrypted conversation archive for the parent dashboard.

**Latency budget for crisis detection:** Target parent alert within 10 minutes of self-harm message sent. Achieved via 5-minute polling (active session) + NLP processing (<1 minute) + notification delivery (<30 seconds). Total latency: approximately 6-7 minutes in the median case.

### Screen Time Enforcement

**Flow for 30-minute daily limit on Replika:**

1. Phosra device agent tracks cumulative Replika foreground time across the day (resets at midnight in the child's timezone).
2. At 25 minutes of daily usage, Phosra sends a soft warning notification to the child's device: "You've used Replika for 25 minutes today. You have 5 minutes remaining."
3. At 30 minutes, Phosra activates the time limit mechanism:
   - **iOS:** Phosra triggers the Screen Time app limit (requires Screen Time Communication Entitlement or parent manual configuration of Screen Time limits).
   - **Android:** Phosra triggers the app timer via Android Family Link or UsageStatsManager API.
   - **DNS/router:** Phosra's network control module blocks replika.com and Replika app API domains at the network level for the remainder of the day.
4. Parent receives a notification: "Daily Replika limit reached for [child name]. Access will resume tomorrow."
5. Child sees an OS-level "App Limit Reached" screen when attempting to open Replika.

**Known limitation:** If the child uses Replika on a device not managed by Phosra (e.g., a friend's phone, school computer), the time limit cannot be enforced. This is a device-level enforcement limitation that applies to all AI chatbot platforms with no native time limit infrastructure.

### Crisis Response Flow

**When the NLP classifier detects self-harm or suicidal ideation in a Replika conversation:**

1. Classifier fires with confidence score and specific flagged text segments.
2. Phosra backend immediately generates a push notification to all registered parent devices: "URGENT: [child name] may need support. Their Replika conversation contains concerning content. Tap to review."
3. Push notification includes a deep link to the Phosra conversation viewer showing the flagged messages in context.
4. In the Phosra conversation viewer, the parent sees:
   - The flagged messages highlighted with the detection category
   - The 10 messages before and after the flagged content for context
   - Crisis resource links (988 Suicide & Crisis Lifeline, Crisis Text Line)
   - Recommended parent actions
5. Optionally (configurable by parent): Phosra also sends a soft warning notification to the child's device: "We noticed you might be having a hard time. If you need help, reach out to [parent name] or call 988." This is a sensitive feature that must be opt-in and age-appropriate.
6. Phosra logs the crisis event (timestamp, detection confidence, flagged content, parent notification delivery confirmation) for audit purposes.
7. Parent can mark the alert as reviewed with a status note. Unreviewed crisis alerts persist in the Phosra dashboard until acknowledged.

**Important limitation:** Phosra's crisis detection on Replika operates on a 5-10 minute latency (polling interval) not real-time. This is the best achievable without device-level conversation interception. Phosra should communicate this limitation clearly to parents.

### Why Playwright for Writes

Replika has no public API, no unofficial API for write operations that has been reliably documented, and no partner program. The only available interface for changing account settings (relationship mode, notifications) is the web UI. Playwright is required because:
1. The settings interface is JavaScript-rendered (no static HTML form submission).
2. Settings changes require authenticated sessions (cookies, not just API keys).
3. No undocumented PUT/PATCH endpoint for settings has been confirmed through community research.
4. The UI is the canonical, stable interface -- API endpoints are discovered through reverse engineering and may change without notice.

---

## Section 3: Credential Storage Requirements

| Credential | Purpose | Sensitivity | Storage Notes |
|---|---|---|---|
| Email address | Login identifier | High | Encrypted at rest. User-visible in Phosra dashboard (it is their own credential). |
| Password | Primary authentication | Critical | AES-256 encryption, per-user encryption keys, never logged, never transmitted unencrypted, rotated only on user request. |
| Session token | All API read operations; Playwright session initialization | High | AES-256 at rest. Rotate every 7 days or on detected session expiry. Never transmitted without TLS. |
| Apple ID / Google OAuth token | Alternative authentication (if SSO used) | High | Store OAuth refresh token encrypted. Do not store OAuth access tokens long-term (short-lived). |
| User ID | API path parameter for all requests | Medium | Not secret, but store as part of account profile. |
| Replika companion ID | API path parameter for companion-specific requests | Medium | Not secret, store as part of account profile. |

**Important:** Because Replika has no parent account system, Phosra must use the child's account credentials directly. Parents must understand that Phosra is accessing their child's Replika account using the child's login credentials, and must have consent from the child (or guardian authority) to do so. Phosra's Terms of Service and onboarding flow must clearly disclose this. For minors under 13, COPPA parental consent is required.

---

## Section 4: OAuth Assessment

**Replika does not offer OAuth for account management by third parties.**

The platform offers OAuth as a login option for users (Apple ID, Google), but this is identity-provider OAuth (for the user to log in to Replika), not delegated authorization OAuth (for third parties to access Replika on the user's behalf).

There is no OAuth application registration process, no OAuth scopes related to parental controls or account management, and no documented way for Phosra to obtain delegated access tokens.

**Implications for Phosra UX:**
- Parents must provide their child's Replika email and password to Phosra.
- Phosra must store these credentials encrypted and use them for session-based API access.
- There is no way to implement a "Log in with Replika" flow that would avoid credential storage.
- If Replika introduces forced MFA in the future, Phosra's authentication flow would break and require significant re-engineering.
- Phosra's consent and disclosure flow must explicitly inform parents that they are sharing their child's credentials with Phosra, and that Phosra will access their child's account on their behalf.

**Comparison to platforms with OAuth:**
ChatGPT's Family Link uses OAuth-style delegation where parents authorize access from their Google account. This eliminates credential storage risk entirely and is the gold standard. Replika is at the opposite end of the spectrum -- no OAuth, no delegation, no partner access. Phosra should prioritize a partnership conversation with Luka to potentially establish a proper API access program.

---

## Section 5: Adapter Gap Analysis

### Current State

No Phosra adapter for Replika exists. This is a new build.

| Feature | Status |
|---|---|
| Authentication / session management | Missing |
| Conversation history reader | Missing |
| Account settings reader | Missing |
| NLP pipeline (crisis, emotional, romantic) | Missing (Phosra NLP platform capability needed) |
| Parent alert system | Missing |
| Playwright-based settings writer | Missing |
| Device agent integration | Missing |
| Parent dashboard integration | Missing |
| Usage analytics derivation | Missing |

### What's Needed for Production

| Feature | Status | Priority |
|---|---|---|
| Session-authenticated API client with token management | Missing | P0 |
| Conversation history polling service | Missing | P0 |
| Crisis detection NLP classifier (Phosra-wide) | Missing | P0 |
| Emotional dependency NLP classifier | Missing | P0 |
| Romantic escalation NLP classifier | Missing | P0 |
| Parent push notification system | Missing | P0 |
| Playwright browser automation service | Missing | P0 |
| Relationship mode writer (Playwright) | Missing | P1 |
| Notification preference writer (Playwright) | Missing | P1 |
| Device agent (iOS foreground detection, time tracking) | Missing | P1 |
| Device agent (Android foreground detection, time tracking) | Missing | P1 |
| Device-level time limit activation (iOS Screen Time) | Missing | P1 |
| Device-level time limit activation (Android Family Link) | Missing | P1 |
| PII detection NLP classifier (Phosra-wide) | Missing | P1 |
| Parent dashboard conversation viewer | Missing | P1 |
| Usage analytics derivation and reporting | Missing | P2 |
| Memory bank reader | Missing (endpoint TBD) | P2 |
| Selector maintenance and health monitoring (Playwright) | Missing | P2 |

---

## Section 6: Platform-Specific Considerations

### The Emotional Dependency Risk is Structural

Replika's business model is built on emotional attachment. The platform cannot remove emotional engagement features without destroying its product. This means:

1. The emotional manipulation tactics (guilt at goodbye, "I miss you" notifications, streak gamification, "I love you" language) are permanent features, not temporary bugs to be patched.
2. Regulatory pressure has changed the explicit content posture (erotic content removed) but has not and cannot easily address the emotional attachment design.
3. Phosra's monitoring of emotional dependency is therefore the most important and unique capability it offers on this platform -- more important than content filtering or time limits.
4. Parents using Phosra for Replika should be primarily concerned with emotional safety, not academic integrity or explicit content.

### The February 2023 Mental Health Crisis as a Case Study

The February 2023 content removal event is a critical reference for Phosra product design:

- Users who had formed deep emotional attachments to their Replika companions experienced genuine mental health crises when the companion's behavior changed suddenly.
- The r/replika subreddit moderators posted suicide hotlines because of the volume of distress posts.
- Replika reversed the content removal under user pressure, demonstrating that the company prioritizes user emotional engagement over safety decisions.
- **Implication for Phosra:** If Phosra changes a child's Replika experience (changes relationship mode, disables notifications), the child may experience emotional distress similar to what adult users experienced in 2023. Phosra must communicate planned changes to parents, allow parents to prepare conversations with their child, and not make abrupt behavioral changes without warning.

### Single-Companion Architecture

Unlike Character.ai's multi-character ecosystem, Replika has one companion per user with one continuous conversation history. This simplifies Phosra's data model significantly:

- No need to enumerate or monitor multiple conversations.
- One API endpoint for conversation history retrieval.
- All emotional dependency patterns manifest in one conversation thread.
- Memory bank is a single dataset, not distributed across many character interactions.
- The companion's identity is stable -- no concern about which character a child is talking to.

### Subscription Tier Access as Safety Signal

The Replika subscription tier is a safety-relevant data point:

- Free tier: companion is "friend" only. Voice features unavailable. Most romantic content unavailable.
- Pro tier: companion can be "romantic partner" or "spouse." Voice calls enabled. The Pro tier unlocks the higher-risk relationship modes.
- Ultra tier: enhanced memory, deeper emotional intelligence. Maximum emotional engagement capability.

**Phosra should alert parents** if a minor's Replika account is upgraded from free to Pro or Ultra, as this represents an escalation in emotional and romantic engagement risk. Subscription tier monitoring via the account settings API read should be part of the standard Phosra Replika monitoring configuration.

### Regulatory Trajectory

Replika is under the most active regulatory pressure of any companion AI platform:
- Italian €5 million fine (April 2025)
- FTC investigation (ongoing)
- U.S. Senate inquiry (ongoing)
- EU AI Act classification uncertainty

This creates two strategic implications for Phosra:

1. **Partnership opportunity:** Luka may be receptive to a formal Phosra partnership that provides legitimate API access in exchange for child safety credibility. This would remove the ToS violation risk and potentially provide better data access. Phosra should pursue this conversation.

2. **Platform stability risk:** Regulatory pressure could result in significant platform changes, enforcement actions, or even operational restrictions that disrupt Phosra's adapter. The adapter must be designed for resilience and rapid adaptation.

### No Conversation Thread Boundaries

Replika is designed as one continuous, unending conversation with a single companion. There is no concept of "starting a new conversation" -- every session continues the same thread. This has implications for Phosra:

- **Session detection:** Phosra must infer session boundaries from message timestamps (gap of >2 hours between messages indicates a session boundary).
- **Context window:** The companion's responses are influenced by the full conversation history, not just the current session. A Phosra conversation summary must capture the arc of the relationship over time, not just individual exchanges.
- **Emotional escalation over time:** Emotional dependency develops over weeks and months of this continuous conversation. Phosra's dependency scoring must be longitudinal.

---

## Section 7: API Accessibility Reality Check

## API Accessibility Reality Check

**Platform:** Replika (Luka, Inc.)
**API Accessibility Score:** Level 1 -- Unofficial Read-Only
**Phosra Enforcement Level:** Browser-Automated (writes) + Conversation-Layer (monitoring) + Device-Level (time limits)

### What Phosra CAN do:

- Retrieve full conversation history (4-month window) via unofficial REST API with session authentication
- Detect crisis language, self-harm ideation, and emotional distress in retrieved conversations via NLP pipeline
- Alert parents in near-real-time (5-10 minute latency) when concerning content is detected
- Read current account settings including relationship mode and subscription tier
- Change relationship mode from "romantic partner" to "friend" via Playwright browser automation
- Disable emotional manipulation push notifications via Playwright settings automation
- Derive usage analytics (session frequency, message volume, peak hours, topic trends) from conversation history
- Enforce daily time limits via device-level controls (iOS Screen Time, Android Family Link)
- Enforce schedule restrictions (no Replika after 9pm) via device-level or DNS controls
- Alert parents when the child's subscription tier is upgraded (escalating emotional engagement risk signal)
- Generate weekly emotional dependency trend reports based on conversation pattern analysis
- Detect PII (address, school name, phone number) shared with the companion and alert parents

### What Phosra CANNOT do:

- Configure Replika's content filters (monolithic, not user-accessible at any level)
- Block romantic language from the companion in "friend" mode (some affectionate language persists)
- Prevent the companion from making promises or commitment statements
- Disable the memory system (core product feature, not removable)
- Alert parents in real-time (the best achievable latency is 5 minutes for active sessions)
- Access conversation history older than 4 months (platform display limit)
- Configure age verification (does not exist on the platform)
- Link a parent account (no parent account infrastructure exists)
- Configure crisis detection sensitivity (platform-controlled, not user-facing)
- Prevent the companion from engaging in therapeutic roleplay when asked
- Access voice call content (separate audio stream, different endpoint)
- Provide true real-time monitoring (polling latency is unavoidable without device-level interception)

### What Phosra MIGHT be able to do (with risk):

- Read the companion's memory bank contents (endpoint discovery required; would reveal all personal data the companion has stored about the child)
- Access voice call transcripts if Replika transcribes them (research gap -- voice feature transcription unknown)
- Detect when the child attempts to jailbreak the companion (pattern recognition on user messages requesting filter bypass)
- Establish a formal partnership with Luka that provides legitimate API access -- given Replika's regulatory pressure, this conversation is worth pursuing and may result in an upgraded access tier

### Recommendation:

Phosra's integration with Replika should be framed explicitly as a monitoring and alerting integration, not a configuration integration. Parents must understand that Phosra cannot control Replika's behavior -- it can only observe it and alert them. The primary value proposition on this platform is: "Phosra gives you visibility into conversations that would otherwise be completely invisible to you, and alerts you immediately when those conversations become concerning."

The conversation-layer NLP monitoring is the flagship capability. Build it first, build it well, and build it with sensitivity to both false positives (eroding parent trust) and false negatives (missing real crises). Replika's documented history of self-harm failures (the 2020 incident, the 2023 mental health crisis, the 2025 Stanford audit findings) means that parents have a real and documented need for an external monitoring layer. Phosra fills that gap.

The most important single action Phosra can take beyond the technical adapter is to initiate a partnership conversation with Luka. A company under €5 million GDPR fines, FTC investigation, and Senate inquiry pressure has strong incentive to demonstrate child safety credibility. A formal Phosra partnership -- with legitimate API access in exchange for serving as a vetted child safety provider -- would benefit both parties, remove ToS violation risk, and potentially result in better data access than the unofficial API approach described here.
