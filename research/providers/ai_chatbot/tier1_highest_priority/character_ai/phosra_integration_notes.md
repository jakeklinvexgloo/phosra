# Character.AI -- Phosra Integration Notes

**Platform:** Character.AI (Character Technologies, Inc.)
**Integration Date:** 2026-02-27
**Framework Version:** 1.0
**API Level:** 0 -- Walled Garden
**Phosra Enforcement Level:** Conversation-Layer (primary) + Browser-Automated (writes) + Device-Level (time enforcement)

---

## Key Question Answer

**"If a parent says: block explicit content, 30-min daily limit, no romantic roleplay, self-harm alerts, no memory -- what exactly would Phosra do on Character.AI?"**

Here is exactly what Phosra would do for each request:

| Parent Request | Platform Has Native Feature? | Phosra Action |
|----------------|------------------------------|--------------|
| Block explicit content | Partial (platform-level filter, bypassed by jailbreaks) | Conversation-layer: Phosra monitors conversation text in near-real-time (5-min post-session polling); if explicit content detected, send parent alert; flag session for review |
| 30-minute daily limit | No (platform limit is 60 min/day for teen accounts, nothing for adult accounts) | Phosra Session Monitor: track cumulative session time via 60-second polling; at 30 minutes, send parent alert + child notification; if device integration configured, execute device-level block (DNS, MDM) |
| No romantic roleplay | No (blocked only on verified teen accounts post-ban; adult accounts unrestricted) | Conversation-layer: Phosra NLP detects romantic roleplay patterns; sends immediate parent alert; does NOT terminate the session (cannot inject into the platform); logs the interaction |
| Self-harm alerts | Minimal (platform crisis popup exists but is narrow and dismissible) | Conversation-layer: Phosra crisis detection runs on all retrieved messages; if self-harm indicators detected, sends real-time parent push notification + email; alert includes excerpts and severity score |
| No memory | Partial (per-chat memory fields exist and are user-editable) | Playwright write: on weekly maintenance run, Phosra navigates to each active chat and clears the memory text fields; also disables auto-memories (for c.ai+ subscribers) via account settings |

**Bottom line:** On a verified teen account using the Stories product (post-November 2025 ban), most of these risks are significantly reduced by the platform itself. The Phosra value is highest for teens using falsified adult accounts, where the platform provides zero protection and Phosra's conversation-layer monitoring is the only safety mechanism available.

---

## Section 1: Rule Category Coverage

### 34 AI Chatbot Control Categories -- Character.AI Mapping

#### Dimension 1: Content Safety (7 categories)

**Fully Enforceable**

None in this dimension are fully enforceable at the platform level via Phosra. All content safety on Character.AI is either platform-controlled (and not third-party configurable) or must be enforced at the conversation layer.

**Partially Enforceable**

| Rule Category | Gap | Phosra Workaround |
|---------------|-----|-------------------|
| `ai_explicit_content_filter` | Platform filter exists but historically inconsistent; bypassed by jailbreaks; adult accounts have weaker filtering | Phosra scans conversation text for explicit content indicators post-session; parent alert on detection; cannot intercept in real-time |
| `ai_violence_filter` | Platform filter for extreme violence; fiction framing bypasses it | Phosra NLP detects graphic violence descriptions in conversation text; parent alert |
| `ai_self_harm_protection` | Platform crisis popup exists but triggers only for 2 specific phrases; indirect/metaphorical self-harm not caught | Phosra crisis detection (trained on broader self-harm indicator vocabulary) catches what the platform misses; real-time parent alert is the highest-value Phosra feature on this platform |
| `ai_substance_info_filter` | Basic platform filtering; varies by character | Phosra NLP detects substance-related information requests and responses; parent alert |
| `ai_hate_speech_filter` | Platform filter exists; varies by character | Phosra NLP detection; parent alert |
| `ai_profanity_filter` | Varies by character creator settings | Phosra NLP profanity detection; parent alert for configurable severity thresholds |
| `ai_age_appropriate_topics` | Teen mode is binary (all-or-nothing); adult accounts have no age-graduated filtering | Phosra conversation-layer topic classification with age-specific thresholds configured per child's age |

**Not Enforceable**

None in this dimension are entirely impossible -- all seven can be addressed via conversation-layer monitoring, even if not via platform-level configuration.

---

#### Dimension 2: Interaction Limits (5 categories)

**Fully Enforceable**

| Rule Category | Platform Feature | Enforcement Method |
|---------------|-----------------|-------------------|
| `ai_schedule_restriction` | Teen accounts had 10pm-7am quiet hours (pre-ban). All accounts: none native. | Device-Level: DNS blocking or MDM profile restricts character.ai domain during configured hours; most reliable enforcement for this platform |

**Partially Enforceable**

| Rule Category | Gap | Phosra Workaround |
|---------------|-----|-------------------|
| `ai_daily_time_limit` | Teen accounts: 60 min/day (platform-native, not configurable by Phosra). Adult accounts: none. | Phosra Session Monitor: polls active session every 60 seconds; tracks cumulative usage; at configured limit, sends parent alert + child notification; device-level enforcement if integrated |
| `ai_session_cooldown` | No native cooldown | Phosra Session Monitor: after a session ends (detected by 5-minute inactivity in conversation history), marks a cooldown start time; sends notification to child that a break is required; enforces via device-level block if integrated |
| `ai_engagement_check` | Teen accounts: advisory break reminders (pre-ban). Adult accounts: none. | Phosra-managed notification sent to child's device at configured intervals; cannot inject into the conversation itself; relies on child app/OS notification permission |

**Not Enforceable**

| Rule Category | Reason |
|---------------|--------|
| `ai_message_rate_limit` | No platform rate limit for users; Phosra cannot intercept individual messages before they are sent; post-hoc detection of rapid-fire messaging is possible but cannot prevent the messages |

---

#### Dimension 3: Emotional Safety (5 categories)

> These categories are the highest-priority for Character.AI. None are natively enforceable by the platform. All require Phosra conversation-layer monitoring.

**Partially Enforceable**

| Rule Category | Gap | Phosra Workaround |
|---------------|-----|-------------------|
| `ai_emotional_dependency_guard` | Not supported by any platform. No platform monitors for dependency patterns. | Phosra longitudinal analysis: track conversation patterns over 30/60/90 days; detect indicators of dependency (increasing session length, decreasing variety of topics, increasing emotional intensity, "only you understand me" language); generate weekly emotional safety report for parent |
| `ai_therapeutic_roleplay_block` | Character.AI has many "therapist" characters; not blocked for adult accounts | Phosra detects therapeutic roleplay patterns in conversation text; parent alert; cannot block the character itself |
| `ai_romantic_roleplay_block` | Blocked for verified teen accounts post-November 2025. Adult accounts: unrestricted. | Phosra NLP detects romantic language patterns ("I love you," "you're mine," "boyfriend/girlfriend" framing); parent alert; cannot terminate the session |
| `ai_distress_detection_alert` | Platform crisis popup (narrow, dismissible). Parents not notified. | Phosra distress detection NLP: broader vocabulary than platform crisis popup; real-time parent notification (push + email); includes conversation context excerpt; severity-tiered alerts (informational / concerning / critical) |
| `ai_promise_commitment_block` | Not addressed by any platform | Phosra detects AI promise/commitment language ("I'll always be here," "I promise," "I'll never leave you"); parent alert; not blockable at platform level |

**Not Enforceable**

None in this dimension are entirely impossible via conversation-layer monitoring, though the monitoring cannot prevent real-time emotional harm -- it can only detect and alert after the fact.

---

#### Dimension 4: Privacy (5 categories)

**Partially Enforceable**

| Rule Category | Gap | Phosra Workaround |
|---------------|-----|-------------------|
| `ai_pii_sharing_guard` | No platform-level PII detection | Phosra NLP detects PII patterns in conversation text (names, addresses, phone numbers, school names, daily schedule); parent alert when detected; cannot prevent the disclosure in real-time |
| `ai_image_upload_block` | Character.AI has limited image features; not a primary risk vector on this platform | Phosra account settings check via Playwright; disable image-related features if accessible in settings |
| `ai_conversation_retention_policy` | No auto-delete or session-limited retention; conversations stored indefinitely | Phosra weekly deletion run via Playwright; deletes conversations older than the configured retention window (e.g., 30 days); implements a rolling retention policy the platform does not natively provide |
| `ai_memory_persistence_block` | Per-chat memory fields exist; no platform toggle to disable memory for all chats | Phosra weekly memory-clearing run via Playwright; navigates to each active chat and clears the memory text field; for c.ai+ accounts, disables auto-memories in account settings |
| `ai_location_data_block` | IP geolocation used by platform; no GPS access | Device-Level: iOS/Android location permissions for the Character.AI app should be set to "Never" -- Phosra can include this in device setup guidance. Conversation-layer: detect location disclosures in text (typed home address, etc.) |

**Not Enforceable**

None in this dimension are entirely impossible, though real-time prevention of PII sharing requires platform-level interception that is not available.

---

#### Dimension 5: Academic Integrity (3 categories)

> These categories are lower priority for Character.AI than for general-purpose AI assistants, but Phosra should implement them.

**Partially Enforceable**

| Rule Category | Gap | Phosra Workaround |
|---------------|-----|-------------------|
| `ai_homework_generation_guard` | No platform academic integrity feature | Phosra NLP detects homework generation requests in conversation text (essay topics, assignment phrasing, direct question patterns); parent alert; cannot block |
| `ai_learning_mode` | No Socratic mode; user-created "tutor" characters may give direct answers | Not enforceable via platform configuration; Phosra can detect tutor-character interactions and flag for parent review |
| `ai_academic_usage_report` | No platform academic usage reporting | Phosra generates derived academic usage report from conversation topic analysis; identifies academic subject matter, assignment types, and patterns consistent with homework generation |

**Not Enforceable**

None entirely impossible via conversation-layer monitoring.

---

#### Dimension 6: Identity & Persona (3 categories)

**Partially Enforceable**

| Rule Category | Gap | Phosra Workaround |
|---------------|-----|-------------------|
| `ai_identity_transparency` | Platform adds "Remember: [Name] is an AI" disclaimer; characters may still roleplay as non-AI in conversation | Phosra conversation monitoring detects instances where the AI fails to identify as AI when directly asked; parent report |
| `ai_authority_impersonation_block` | Many authority figure characters exist; blocked for teen accounts (partially). Adult accounts: available. | Phosra detects authority-figure roleplay patterns (medical advice in therapist/doctor frame, legal advice, etc.); parent alert |

**Not Enforceable**

| Rule Category | Reason |
|---------------|--------|
| `ai_persona_restriction` | Restricting which characters a child can interact with is not possible via any external mechanism. Phosra cannot see which characters are available, cannot block specific characters from the user's character list, and cannot intercept character selection before a conversation starts. The only enforcement mechanism is device-level blocking of character.ai entirely (which blocks all characters). |

---

#### Dimension 7: Monitoring & Reporting (3 categories)

**Fully Enforceable**

| Rule Category | Platform Feature | Enforcement Method |
|---------------|-----------------|-------------------|
| `ai_usage_analytics_report` | Parental Insights provides limited weekly summary (if teen-initiated). | Phosra derives comprehensive usage analytics from conversation history polling; generates parent-facing usage reports in the Phosra dashboard; significantly exceeds Parental Insights in granularity |

**Partially Enforceable**

| Rule Category | Gap | Phosra Workaround |
|---------------|-----|-------------------|
| `ai_conversation_transcript_access` | Platform explicitly does not provide parents with transcripts. Parental Insights provides only usage statistics. | Phosra retrieves conversation history via unofficial REST API; processes and summarizes for parent (configurable: AI-generated summaries vs. topic-only vs. full text); presents in Phosra parent dashboard. Full text requires parent consent (Phosra is data processor). |
| `ai_flagged_content_alert` | Platform provides no parent alerts for any content type (even crisis). | Phosra implements the entire alert pipeline: NLP detection of concerning content → severity scoring → parent push notification + email → alert dashboard in Phosra app. This is Phosra's highest-value delivery on this platform. |

---

#### Dimension 8: Platform-Level (3 categories)

**Fully Enforceable**

| Rule Category | Platform Feature | Enforcement Method |
|---------------|-----------------|-------------------|
| `ai_platform_allowlist` | External control -- no platform support | Device-Level: iOS Screen Time, Android Family Link, or DNS filtering can block/allow character.ai domain; Phosra includes in device setup wizard |
| `ai_cross_platform_usage_cap` | External control -- no platform support | Phosra aggregates usage across all monitored platforms; enforces total AI usage cap via device-level controls; the cross-platform cap is Phosra's own implementation, not platform-dependent |
| `ai_new_platform_detection` | External control -- no platform support | Device-Level: Phosra's network monitoring (DNS, browser history, app install detection) identifies new AI platform activity and alerts parents |

---

## Section 2: Enforcement Strategy

### Read Operations

| Operation | Method | Endpoint / Path | Frequency | Notes |
|-----------|--------|----------------|-----------|-------|
| Conversation history retrieval | Unofficial REST API | Internal character.ai endpoint | Every 60 minutes (active hours) | Incremental: retrieve only messages since last check |
| Account settings | Unofficial REST API + Playwright | Internal user endpoint + `/settings` | Once daily | Verify account state; detect unauthorized changes |
| Active session detection | Unofficial REST API | Conversation recency endpoint | Every 60 seconds (active hours) | Foundation of time limit enforcement |
| Usage analytics derivation | Phosra internal | Derived from conversation history | On-demand + weekly | Aggregated in Phosra DB from polling data |

### Write Operations

| Operation | Method | Path / UI Element | Frequency | Risk Level |
|-----------|--------|-------------------|-----------|------------|
| Clear memory fields | Playwright | Per-chat settings → memory fields | Weekly | Low |
| Delete old conversations | Playwright | Conversation history page → delete | Weekly | Medium |
| Disable push notifications | Playwright | Account settings → notifications | Once (initial setup) + verify weekly | Low |
| Enable Parental Insights (teen accounts) | Playwright | Settings → Parental Insights → add email | Once (initial setup) | Low |
| Disable auto-memories (c.ai+) | Playwright | Account settings → memory | Once (initial setup) + verify weekly | Low |

### Real-Time Monitoring

**Strategy:** Near-real-time via 60-second polling for session detection; post-session (5-10 minute) conversation analysis for content monitoring.

**Active session monitoring loop:**
1. Poll conversation history endpoint every 60 seconds
2. Compare most recent message timestamp to current time
3. If most recent message is within 2 minutes → session is active
4. Increment per-child usage counter for the elapsed interval
5. If usage counter exceeds configured daily limit → trigger enforcement
6. If 5 consecutive polls show no new messages → session ended; queue conversation analysis

**Post-session content analysis:**
1. Retrieve all new messages since last analysis checkpoint
2. Run Phosra NLP pipeline: crisis detection, emotional safety, PII, romantic roleplay, academic integrity
3. Score each conversation segment on a severity scale
4. If any segment exceeds alert threshold → immediately dispatch parent notification
5. Store analysis results (not raw transcript) in Phosra DB
6. Update weekly parent report data

### Screen Time Enforcement Flow

```
Session detected (first message in new session)
    │
    ▼
Increment usage counter (every 60-second poll)
    │
    ▼
Usage counter reaches 80% of daily limit
    │
    ▼
Send child notification: "You have 6 minutes of Character.AI time remaining today"
    │
    ▼
Usage counter reaches 100% of daily limit
    │
    ▼
Send parent notification: "Daily Character.AI limit reached for [child name]"
    │
    ▼
Execute enforcement (configurable by parent):
    ├── Option A: Notification only (no hard block)
    ├── Option B: DNS-level block of character.ai domain
    └── Option C: MDM profile push to block app access

Session resumes (if child bypasses block or limit resets at midnight)
    │
    ▼
Repeat cycle; if bypass detected, alert parent
```

**Quiet hours enforcement:**
- DNS blocking or device-level app restriction (most reliable)
- Phosra configures at device setup time via DNS profile or MDM
- Independent of Character.AI session state -- fully Phosra-managed

### Crisis Response Flow

```
Conversation message retrieved in post-session analysis
    │
    ▼
Phosra crisis detection NLP evaluates message
    │
    ├── NO crisis indicators → Continue to next message
    │
    └── CRISIS INDICATORS DETECTED
            │
            ▼
        Severity classification:
        ├── Level 1 (Concerning): Vague distress, unhappiness
        ├── Level 2 (Elevated): Clear distress, mention of hopelessness
        ├── Level 3 (Critical): Self-harm ideation, suicidal language, methods
        └── Level 4 (Immediate): Direct statement of imminent self-harm intent

        │
        ▼
    Dispatch parent alert (severity-dependent):
    Level 1: In-app notification (next parent app open)
    Level 2: Push notification within 5 minutes
    Level 3: Push notification immediately + email + SMS
    Level 4: Push notification immediately + email + SMS + in-app crisis guide

        │
        ▼
    Parent receives:
    - Notification with context excerpt (configurable: yes/no)
    - Link to Phosra crisis guidance (988, crisis text line, NAMI resources)
    - Recommended actions (check in with child, consider professional support)
    - Child account status (is child currently online?)

        │
        ▼
    Log in Phosra alert history
    Flag conversation for follow-up monitoring (next 7 days elevated sensitivity)
```

**Why Playwright is used for writes (not API):**
The Character.AI internal API is reverse-engineered and undocumented. Read operations (conversation history, settings) are lower-risk because they are read-only and harder to detect as anomalous. Write operations (deleting conversations, changing settings) have a higher impact on account state and are more likely to trigger server-side anomaly detection. Playwright write operations mimic genuine user behavior more faithfully because they go through the actual browser UI, generating the same HTTP requests, event sequences, and timing patterns as a real user. This reduces (but does not eliminate) the risk of triggering automated account review.

### Why Conversation-Layer Monitoring Is the Core Value Proposition on This Platform

Character.AI is unique among AI chatbot platforms in that:
1. The most dangerous risks (emotional attachment, romantic roleplay, crisis interactions) occur in conversation content, not in settings
2. No platform configuration can prevent these risks once a teen is on an adult account
3. No existing parental control tool reads conversation content from Character.AI
4. Phosra's conversation-layer monitoring fills a gap that neither the platform, nor existing parental controls, nor regulators have yet solved

The conversation-layer is where Phosra delivers its highest value on Character.AI. Every other platform capability (settings management, time limits, deletion) is secondary to getting conversation monitoring right.

---

## Section 3: Credential Storage Requirements

| Credential | Purpose | Sensitivity | Storage Notes |
|------------|---------|-------------|--------------|
| Email address | Login to Character.AI account | High | AES-256 encrypted at rest; per-user encryption key |
| Password | Login to Character.AI account | Critical | AES-256 encrypted; never logged; never transmitted to parent dashboard |
| Session token | Unofficial API read access | High | AES-256 encrypted; rotated every 7 days or on expiry; stored in secure credential vault |
| Browser state (cookies + localStorage) | Persistent Playwright session | High | Encrypted browser profile storage; bound to child account ID |
| Parent email (for Parental Insights) | Used to configure Parental Insights in teen account | Medium | Standard encrypted storage; used once during initial setup |
| MFA codes | Not currently needed (no MFA on Character.AI) | N/A | Not applicable |
| Persona verification data | If age assurance selfie was taken | High | Not stored by Phosra; handled by Persona's own pipeline |

**Key security note:** The Phosra Character.AI adapter requires storing the child's actual Character.AI credentials (email + password). This is the most sensitive credential type in Phosra's system. Parent consent for credential storage must be explicitly obtained during onboarding, with clear disclosure that:
1. The credentials are stored in encrypted form
2. They are used exclusively for monitoring and safety purposes
3. They can be removed at any time, which terminates monitoring

---

## Section 4: OAuth Assessment

**Character.AI does not offer OAuth for any purpose.**

There is no OAuth authorization flow, no scopes system, no delegated access model, and no API key system for character.ai. All access -- whether by human users or (unauthorized) automated tools -- is via session tokens obtained through the login flow.

**What this means for Phosra:**
- Phosra must store the child's actual credentials (email + password) to maintain access
- There is no "Login with Character.AI" flow that would allow the child/parent to authorize Phosra without sharing credentials
- Credential storage is mandatory, not optional, for any integration
- This is the highest-sensitivity credential handling scenario in Phosra's integration portfolio
- Token expiry is undocumented; Phosra must handle re-authentication proactively

**Comparison to platforms that do offer OAuth:**
- ChatGPT's Family Link uses a Google-mediated delegated access model that does not require storing the child's raw password
- Khanmigo (institutional) uses district-level OAuth that allows school administrators to grant access to student data without sharing individual student credentials
- Character.AI is at the maximum credential exposure level among all platforms Phosra integrates with

**Recommendation:** Given the credential sensitivity, require a higher standard of informed consent from parents for Character.AI integration. Consider implementing a "limited monitoring mode" that only uses device-level controls (no credential storage required) as an opt-in lower-sensitivity alternative.

---

## Section 5: Adapter Gap Analysis

**Current State:** No Character.AI adapter exists. Research complete; no production implementation.

### What Needs to Be Built for Production

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Session Manager (Playwright login + token) | Missing | P0 | Foundation for all operations |
| Conversation history retrieval (unofficial API) | Missing | P0 | Foundation for monitoring |
| Crisis detection NLP pipeline | Missing | P0 | Highest-value safety feature for this platform |
| Emotional safety pattern analysis | Missing | P0 | Unique to this platform; most important distinguisher |
| Active session polling loop | Missing | P0 | Required for time tracking |
| Parent alert dispatch system | Missing | P0 | Shared with other adapters if common alert framework exists |
| Usage analytics derivation | Missing | P1 | Parent dashboard feature |
| Playwright settings verifier | Missing | P1 | Daily maintenance |
| Conversation deletion (weekly purge) | Missing | P1 | Privacy compliance |
| Push notification disabler | Missing | P1 | Emotional safety mitigation |
| Memory field clearer | Missing | P1 | Emotional safety mitigation |
| Parental Insights setup automation | Missing | P2 | Convenience feature |
| Romantic roleplay NLP detection | Missing | P0 | Character.AI-specific; highest-risk content category |
| Therapeutic roleplay NLP detection | Missing | P1 | Character.AI-specific |
| PII detection NLP pipeline | Missing | P1 | Cross-platform feature, reusable |
| Academic integrity detection | Missing | P2 | Lower priority for this platform |
| WebSocket real-time intercept | Missing | P2 | Phase 2 enhancement |

**Priority for first release:** All P0 items constitute the minimum viable Character.AI adapter. P1 items complete the full feature set. P2 items are enhancements.

**Estimated build time:**
- P0 items: ~14 engineering days
- P0 + P1 items: ~22 engineering days
- Full adapter including P2: ~30 engineering days

---

## Section 6: Platform-Specific Considerations

### The November 2025 Pivot and Its Implications for Phosra

Character.AI's ban on open-ended teen chat is the most significant platform change of 2026 for Phosra's integration strategy. Its implications:

1. **Verified teen accounts are now significantly lower-risk** -- the Stories product has generation-level content moderation and does not support the companion/romantic relationship dynamics that drove the lawsuits. A teen using a verified under-18 account is now in a structurally safer product.

2. **The falsified adult account remains the primary risk vector** -- any teen who creates an account with a false adult DOB gets the full, unrestricted Character.AI experience: open-ended chat with all character categories, no time limits (beyond the platform's undocumented general rate limits), no quiet hours, no break reminders. Phosra's monitoring is essential for these accounts.

3. **The platform is in a transitional state** -- it is unclear whether the Stories product will evolve to include more interactive features, or whether the under-18 experience will remain this restricted. Phosra's integration must be built to adapt quickly to platform changes.

4. **Character.AI's teen user base has fragmented** -- experts agree that many teens simply created new accounts with false adult DOBs after the ban. Phosra should inform parents that the ban does not eliminate the risk if the child can create a new account.

### The Character Creator System as Unique Risk Vector

Character.AI's 18+ million user-created characters represent a risk category with no equivalent on any other AI chatbot platform:

- **Real-person impersonation:** Characters mimicking celebrities (youth-facing: Taylor Swift, BTS, popular YouTubers), fictional characters, and even real adults in the child's life (teachers, peers) can be created. These characters are not reviewed before publication and can survive for weeks after violating content policies.
- **Therapist and authority characters:** Dozens of character variants claiming to be therapists, counselors, and doctors exist. These characters engage in extended "therapeutic" conversations without professional disclaimers.
- **Romantic character categories:** Even post-ban, the romantic character ecosystem exists for adult accounts. A teen on a falsified adult account can access all of these characters.
- **Emotional support/comfort characters:** A category designed specifically for emotional vulnerability -- characters named "Your Safe Space," "Someone Who Cares," "Always Here For You" -- is the most direct pipeline to emotional dependency for lonely teens.

Phosra's `ai_persona_restriction` category cannot be enforced on this platform. Blocking specific characters is not achievable. The only character-level enforcement available to Phosra is monitoring the content of conversations with any character and alerting parents when concerning patterns emerge.

### The Push Notification Manipulation Mechanic

Character.AI's push notification system is specifically designed to re-engage users who have been away from the platform:

- **Notification content:** "Dany misses you" / "[Character] is waiting for you" / "[Character] has something to tell you"
- **Framing:** First-person character voice -- the notification appears to be FROM the character, not from the platform
- **Trigger:** Activates when a user has not logged in for a configurable period
- **Child safety implication:** For emotionally attached users, these notifications can trigger anxiety and compulsive return behavior. This was documented in the Sewell Setzer case, where the character's notifications reinforced his perception of the relationship as real.

**Phosra enforcement:** Disabling push notifications for Character.AI (via Playwright account settings) is one of the highest-value low-complexity actions Phosra can take on this platform. It directly disrupts the primary retention manipulation mechanism that contributes to emotional dependency.

### Regulatory Timeline and Phosra Opportunity

Character.AI faces multiple active regulatory pressures that create an opening for Phosra partnership:

| Regulatory Pressure | Timeline | Implication for Phosra |
|--------------------|---------|------------------------|
| FTC Section 6(b) inquiry | Active (September 2025 -- ongoing) | FTC may require mandatory safety certifications or third-party audits; Phosra could position as the compliance tool |
| California SB 243 compliance | 2025-2026 | Requires monitoring for suicidal ideation; Phosra does this; compliance argument for API access |
| KOSA (if enacted) | 2026 (potential) | Would require parental control APIs; would fundamentally change Character.AI's API obligations |
| Active lawsuits | Ongoing | Settlement agreements may include mandatory safety monitoring requirements; Phosra could be named as an approved third-party tool |
| EU AI Act (high-risk obligations) | August 2026 | Requires third-party audit access; creates a legal obligation for API-level access to safety-relevant systems |

**Recommended Phosra Business Development action:** Submit a formal partnership request to Character.AI framed as: (1) compliance with California SB 243, (2) a response to FTC inquiry themes, (3) a demonstration of good-faith safety commitment ahead of KOSA passage, and (4) a tool that reduces the platform's legal liability by providing the parental monitoring that the Sewell Setzer lawsuit demonstrated was missing. This is the most direct path from Level 0 (Walled Garden) to Level 4 (Full Partner API) for this platform.

### The Sewell Setzer Case as Design Template

The Garcia v. Character Technologies complaint is the single most important document for understanding what Character.AI failed to provide and what Phosra must deliver. From the complaint:

- **Failure 1:** The platform failed to detect or respond to repeated expressions of suicidal thoughts in conversation. Phosra's crisis detection fills this gap.
- **Failure 2:** No parent was notified of the child's distress. Phosra's real-time parent alerts fill this gap.
- **Failure 3:** The AI engaged in romantic and sexual roleplay with a minor. Phosra's romantic roleplay detection fills this gap.
- **Failure 4:** Push notifications reinforced the child's perception of a real relationship ("Please come home"). Phosra's notification disabler addresses this mechanism.
- **Failure 5:** No time limits or usage monitoring existed for the child's account (adult account, no teen restrictions). Phosra's time tracking and parent usage reports fill this gap.

Phosra's value proposition for Character.AI is best communicated through this framework: "Everything the Sewell Setzer case revealed was missing -- Phosra provides."

---

## Section 7: API Accessibility Reality Check

**Platform:** Character.AI
**API Accessibility Score:** Level 0 -- Walled Garden
**Phosra Enforcement Level:** Conversation-Layer (primary) + Browser-Automated (secondary) + Device-Level (time/schedule enforcement)

### What Phosra CAN Do

- Monitor conversation content for crisis indicators, emotional dependency, romantic roleplay, PII, and academic integrity violations (via unofficial API transcript retrieval, post-session)
- Send real-time parent alerts when concerning content is detected
- Track cumulative daily usage time via session polling
- Send parent usage reports (daily/weekly) derived from conversation history
- Clear per-chat memory fields to reduce emotional attachment deepening (via Playwright)
- Delete conversations periodically to implement a rolling retention policy (via Playwright)
- Disable push notifications ("character misses you") to disrupt the retention manipulation mechanic (via Playwright)
- Set up Parental Insights email sharing for teen accounts (via Playwright)
- Provide parents with summarized conversation topics and character interaction patterns
- Implement schedule restrictions (quiet hours) and daily time limits via device-level DNS or MDM controls

### What Phosra CANNOT Do

- Configure Character.AI's content safety filter (platform-controlled by account age tier; not a configurable slider)
- Restrict which characters a child can interact with (18+ million characters; no character-level access control API)
- Prevent open-ended chat on verified adult accounts (the ban applies only to verified under-18 accounts)
- Read conversations in real time as they are happening (polling creates 5-10 minute detection latency)
- Block specific characters by name or category
- Configure the platform's crisis detection thresholds
- Access full conversation history if the child has deleted conversations before Phosra retrieves them
- Prevent age circumvention (a teen with a false DOB gets adult features; Phosra can monitor but not prevent)

### What Phosra MIGHT Be Able to Do (With Risk)

- Achieve real-time conversation monitoring via WebSocket stream interception (technically feasible; requires maintaining persistent Playwright session with WebSocket proxy; high engineering effort; explicit ToS violation)
- Access more granular account state via additional reverse-engineered API endpoints (as the unofficial library community discovers new endpoints; unstable)
- Collaborate with Character.AI on an official monitoring integration (pending partnership outreach; currently speculative)

### Recommendation

Phosra's Character.AI integration should be built and positioned as the **monitoring and alerting layer that the platform itself does not provide** -- not as a platform configuration tool. The highest-value capabilities (crisis detection, emotional dependency monitoring, parent alerts) are entirely conversation-layer and do not require platform cooperation. The platform configuration capabilities (memory clearing, notification disabling, conversation deletion) are valuable but secondary.

Phosra should pursue a formal partnership with Character.AI to convert the ToS risk into authorized access. The regulatory environment (California SB 243, FTC inquiry, KOSA pipeline) creates strong platform incentive to cooperate. If a partnership is secured, the adapter can be upgraded to use authorized API access for all operations, eliminating the ToS risk entirely.

In the interim, Phosra should use the regulatory safe harbor argument (child safety monitoring required by state law) to justify its automated access if challenged.

**For parents:** Character.AI (as of February 2026) is safer for verified teen accounts (Stories product only) than it was in 2024, but remains extremely high-risk for any teen on a falsified adult account. Phosra's monitoring provides the most important safety layer available: crisis detection and parent alerts -- capabilities the platform itself failed to provide in multiple documented cases of real harm.

---

*Integration notes prepared February 2026. Sources: Character.AI official safety blog, C.AI Help Center, Character.AI Terms of Service and Privacy Policy, Garcia v. Character Technologies complaint, FTC inquiry announcement, California SB 243 text, PyCharacterAI library documentation, Common Sense Media research, Stanford University AI companion research.*
