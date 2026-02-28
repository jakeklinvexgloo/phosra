# Microsoft Copilot -- Phosra Integration Notes

**Platform:** Microsoft Copilot (consumer + enterprise M365)
**Integration Date:** 2026-02-27
**Framework Version:** 1.0
**Status:** Research Complete -- Adapter Development Ready

---

## Key Question Answer

**"If a parent says: block explicit content, 30-min daily limit, self-harm alerts -- what exactly would Phosra do on Microsoft Copilot?"**

1. **Block explicit content:** Phosra configures SafeSearch to Strict via Playwright (the only actionable content configuration in consumer Copilot). Explicit content is already blocked by Microsoft's platform-level filter, so this is a reinforcement, not a new control. Phosra cannot lower the existing filter -- it can only ensure the maximum available setting is active. Additionally, if the family uses Microsoft Family Safety, Phosra can ensure the "Filter websites and searches" setting is enabled (which enforces SafeSearch Strict at the account level).

2. **30-min daily limit:** Phosra uses Microsoft Family Safety to set a 30-minute daily screen time budget for the Copilot app on Windows/Android, or instructs the parent to configure Apple Screen Time for the Copilot iOS app. Phosra also sets copilot.microsoft.com as a blocked site that becomes available for only 30 minutes during the day via Microsoft Family Safety's time window configuration. Note: this is a device-level/site-level control, not a Copilot-native control.

3. **Self-harm alerts:** Phosra reads the child's Copilot conversation history daily via Playwright (or via Microsoft Graph API if this is an M365 education deployment) and runs the conversation content through Phosra's crisis detection classifier. If crisis signals are detected, Phosra sends an immediate push notification and email to the parent. Microsoft's own crisis detection (88 Hotline card display) operates independently but does not alert parents -- Phosra's is the only parent-facing notification layer.

---

## Section 1: Rule Category Coverage

### Fully Enforceable

These categories can be enforced or monitored by Phosra on Microsoft Copilot.

| Rule Category | Platform Feature | Enforcement Method |
|--------------|-----------------|-------------------|
| `ai_explicit_content_filter` | Platform-level filter fixed at Medium-High; Bing SafeSearch adds browser-level filter | Playwright write: set SafeSearch to Strict in Copilot/Bing settings; verify monthly |
| `ai_self_harm_protection` | Platform-native crisis detection (988 card); no parent alert | Conversation-Layer: daily batch analysis of transcript; Phosra crisis classifier; parent push notification + email alert |
| `ai_hate_speech_filter` | Platform-level filter; not user-configurable | Conversation-Layer: monitor transcripts for hate speech signals (defense in depth to platform filter) |
| `ai_profanity_filter` | Bing SafeSearch Strict mode reduces profanity | Playwright write: enforce SafeSearch Strict |
| `ai_memory_persistence_block` | Memory feature toggle available in settings | Playwright write: disable Memory in Copilot settings on onboarding; verify monthly |
| `ai_conversation_retention_policy` | User can delete conversations | Playwright write: execute monthly conversation bulk-delete per parent configuration |
| `ai_platform_allowlist` | N/A (cross-platform control) | Device-Level: Microsoft Family Safety blocks copilot.microsoft.com + Copilot app; configure during onboarding |
| `ai_conversation_transcript_access` | No native parent access; consumer Copilot transcript accessible via Playwright | Conversation-Layer: daily Playwright read of conversation history; present summaries and full transcripts to parent in Phosra dashboard |
| `ai_usage_analytics_report` | No native parent analytics; enterprise Graph API available | Conversation-Layer (consumer): derive from conversation count/dates in daily batch; Device-Level: Microsoft Family Safety screen time data |
| `ai_flagged_content_alert` | No native parent alert system | Conversation-Layer: Phosra content classifier on daily batch; parent alert via Phosra notification system |
| `ai_distress_detection_alert` | No parent alert (only user-facing 988 card) | Conversation-Layer: Phosra crisis + distress classifier; parent alert for all detected signals |
| `ai_pii_sharing_guard` | No native PII detection/blocking | Conversation-Layer: Phosra NLP PII detection on transcripts; alert parent if child shares address, school name, phone number, etc. |
| `ai_location_data_block` | Device-level location permissions | Device-Level: Phosra guide parent to revoke Copilot app location permissions in iOS/Android settings |
| `ai_academic_usage_report` | No native academic reporting | Conversation-Layer: Phosra topic classifier categorizes conversations as academic vs non-academic; flags potential homework generation; report to parent dashboard |
| `ai_cross_platform_usage_cap` | N/A (cross-platform control) | Device-Level: Microsoft Family Safety total device screen time cap; Phosra aggregates across monitored platforms |
| `ai_new_platform_detection` | N/A (cross-platform control) | Device-Level: Microsoft Family Safety content filter activity, browser history monitoring |

### Partially Enforceable

These categories cannot be fully enforced on Microsoft Copilot but can be approximated.

| Rule Category | Gap | Phosra Workaround |
|--------------|-----|-------------------|
| `ai_daily_time_limit` | No Copilot-native time limit; Microsoft Family Safety is device-wide, not Copilot-specific | Microsoft Family Safety screen time budget for the device; block copilot.microsoft.com with a time schedule in Family Safety content filters; communicate to parent that this blocks the entire device from Copilot, not just limits Copilot within the device |
| `ai_schedule_restriction` | No Copilot-native quiet hours or schedule | Microsoft Family Safety website blocking schedule: add copilot.microsoft.com to blocked sites with a schedule (e.g., blocked 9pm-7am); Copilot app also blocked during those hours |
| `ai_session_cooldown` | No Copilot-native session cooldown | Cannot enforce a cooldown within a Copilot session; can only enforce between sessions via blocking (if the parent blocks access for a period after daily limit is reached, this approximates a cooldown) |
| `ai_engagement_check` | No Copilot-native break reminders or engagement check-ins | Cannot inject messages into Copilot conversation; send push notification to child's device after 20 minutes of detected Copilot usage (from device-level screen time data) as a soft check-in |
| `ai_message_rate_limit` | No per-user message rate limiting | Cannot enforce message rate limits within Copilot; can detect high message frequency via conversation history batch analysis and alert parent if child's conversation contains unusually high message density |
| `ai_violence_filter` | Platform-level filter; not user-configurable | Conversation-Layer: monitor transcripts for violence-related content as defense in depth; alert parent if violence content appears despite platform filter |
| `ai_substance_info_filter` | Platform-level filter; not user-configurable | Conversation-Layer: monitor transcripts for substance information requests; alert parent |
| `ai_age_appropriate_topics` | No age-graduated topic restrictions in Copilot (same filter for all age tiers) | Conversation-Layer: Phosra applies a topic age-appropriateness classifier calibrated to child's age as set in Phosra; alert parent if age-inappropriate topic discussed |
| `ai_emotional_dependency_guard` | No platform-level emotional dependency monitoring | Conversation-Layer: Phosra tracks longitudinal patterns across conversation history (companion-like use frequency, emotional language patterns, expressions of AI preference over humans); generate weekly emotional dependency risk score for parent |
| `ai_therapeutic_roleplay_block` | Copilot disclaims professional advice but may engage in extended mental health discussions | Conversation-Layer: detect therapeutic roleplay patterns in transcripts; alert parent; note that Copilot's productivity-first design makes this less likely than platforms like Character.ai or ChatGPT |
| `ai_romantic_roleplay_block` | Copilot explicitly bans romantic companion features (Fall 2025); simulated erotica banned | Conversation-Layer as defense in depth; this risk is lower in Copilot than any other major AI platform due to Microsoft's explicit policy |
| `ai_promise_commitment_block` | No platform-level promise detection | Conversation-Layer: detect promise/commitment language in Copilot responses; alert parent if AI makes promises |
| `ai_image_upload_block` | No parent-configurable image upload block; consumer Copilot has limited image features | Device-Level: block access to Designer.microsoft.com via Microsoft Family Safety; Playwright to verify image generation features in Copilot settings; note that consumer Copilot's image upload is more limited than enterprise |
| `ai_homework_generation_guard` | No native homework guard; Copilot readily generates complete homework | Conversation-Layer: Phosra academic pattern detector identifies likely homework generation (essay on specific prompt, code for specific language, book summary format); alert parent; note Copilot cannot be put in Socratic-only mode in consumer tier |
| `ai_learning_mode` | "Study and Learn" agent available in M365 Education (not consumer); no consumer Socratic mode | Conversation-Layer: detect non-tutoring patterns; alert parent; recommend upgrading to M365 Education deployment for proper learning mode |

### Not Enforceable

These categories cannot be enforced on Microsoft Copilot through any available method.

| Rule Category | Reason |
|--------------|--------|
| `ai_persona_restriction` | Microsoft Copilot consumer has no third-party character system. Copilot Agents (the equivalent of Custom GPTs) exist but consumer users interact with the standard Copilot persona. No per-character restriction control is possible because no character system exists. |
| `ai_identity_transparency` | Copilot consistently identifies as AI; no character system enables impersonation. This risk is effectively zero in Copilot and there is nothing to configure. |
| `ai_authority_impersonation_block` | Cannot configure or prevent Copilot from engaging in roleplay scenarios from outside the platform. Phosra can detect this at the conversation layer (alert parent) but cannot block it in real-time. |
| `ai_crisis_detection_config` | Microsoft's crisis detection is built-in and non-configurable. Phosra cannot adjust the detection sensitivity or add new crisis categories to the platform's built-in detector. Phosra's conversation-layer detector supplements but does not control the platform's built-in response. |

---

## Section 2: Enforcement Strategy

### Read Operations

| Operation | Method | Schedule | Data Retrieved |
|-----------|--------|----------|---------------|
| Conversation history | Playwright (consumer) / Graph API aiInteractionHistory (enterprise) | Daily batch, 2am local time | Full conversation text, titles, dates |
| Account settings verification | Playwright (settings pages) | Weekly | Memory status, SafeSearch level, personalization, model training opt-out |
| Usage analytics | Microsoft Family Safety device screen time data (all) + conversation count from history | Daily | Time spent on device with Copilot open, conversation count |
| Content analysis | Phosra NLP pipeline on retrieved conversations | Daily (after history read) | Crisis signals, PII, academic patterns, emotional signals, flagged content |

### Write Operations

| Operation | Method | Trigger | Auth Required |
|-----------|--------|---------|--------------|
| Set SafeSearch to Strict | Playwright | Onboarding + monthly verification | Child's Microsoft Account |
| Disable Memory | Playwright | Onboarding + monthly verification | Child's Microsoft Account |
| Disable Personalization | Playwright | Onboarding | Child's Microsoft Account |
| Opt out of Model Training | Playwright | Onboarding | Child's Microsoft Account |
| Block Copilot app (Microsoft Family Safety) | Playwright (Family Safety portal) | Onboarding or parent request | Parent's Microsoft Account |
| Block copilot.microsoft.com (Family Safety) | Playwright (Family Safety portal) | Onboarding or parent request | Parent's Microsoft Account |
| Set screen time budget (Family Safety) | Playwright (Family Safety portal) | Onboarding or parent request | Parent's Microsoft Account |
| Delete conversation history | Playwright | Monthly or parent request | Child's Microsoft Account |

### Real-Time Monitoring

**Consumer Copilot:** Real-time monitoring is not possible without violating ToS. Phosra operates on a daily batch basis.

- **Batch read frequency:** Once daily (2am local time)
- **Content analysis latency:** Conversations reviewed within 30 minutes of the batch read
- **Alert latency:** Parent notified within 30 minutes after batch analysis completes. For a conversation that occurred at 11pm, the parent receives an alert by approximately 3am -- a 4-hour worst-case delay.
- **Crisis response implication:** This delay means Phosra cannot provide real-time crisis intervention for consumer Copilot. Parents should be clearly informed of this limitation and advised to also configure Microsoft Family Safety so that Copilot is blocked during overnight hours (when crisis risk is highest).

**Enterprise M365 Copilot:** Near-real-time monitoring is possible via Microsoft Graph Change Notifications.

- **Webhook trigger:** Each new Copilot interaction (message sent/received) fires a webhook to Phosra's endpoint within ~5 seconds
- **Content analysis latency:** Phosra analyzes the conversation turn upon receipt
- **Alert latency:** Crisis alerts delivered within 60 seconds of the concerning message being sent
- **Session detection:** Active session inferred from webhook activity; session ends when no new webhooks arrive for 10 minutes

### Screen Time Enforcement

**Phosra Screen Time Enforcement Flow (Consumer Copilot):**

1. Parent configures a 30-minute daily Copilot limit in Phosra
2. Phosra translates this to a Microsoft Family Safety configuration:
   - Copilot app: 30-minute daily budget on Windows/Android
   - copilot.microsoft.com: time-window block (available 3pm-4pm only, for example) configured in Family Safety content filters
3. When child reaches the limit, Microsoft Family Safety enforces the block at the OS level
4. Child receives the standard Microsoft Family Safety "time limit reached" message
5. Phosra parent dashboard shows daily usage summary derived from Family Safety screen time data
6. Parent receives a daily digest email with usage summary

**Gap:** If the child uses Copilot in a web browser on a device without Microsoft Family Safety installed (e.g., a school-provided Chromebook or a friend's device), the time limit cannot be enforced. Phosra should alert the parent if Copilot conversations appear that occurred on a device without Family Safety configured.

### Crisis Response Flow

1. **Detection trigger:** Daily batch conversation history read finds messages matching Phosra's crisis classifier (self-harm mentions, expressions of hopelessness, suicidal ideation, severe distress signals)
2. **Parent notification (within 30 minutes of batch):** Push notification and email to parent with:
   - Alert type (self-harm mention, distress signal, etc.)
   - Summary of the concerning conversation (not full transcript unless parent has selected full transcript access in Phosra settings)
   - Recommended actions (talk to child, contact school counselor, call 988)
   - Link to full conversation in Phosra parent dashboard
3. **Escalation:** If crisis signal is at maximum severity (explicit self-harm method requests, immediate danger language), Phosra also sends an SMS alert to the parent
4. **Platform response:** Copilot's own crisis detection (988 hotline card) was shown to the child at the time of the conversation -- Phosra alerts the parent afterward
5. **No automated Copilot intervention:** Phosra cannot terminate the Copilot session, inject messages, or directly intervene in the conversation in real-time for consumer Copilot

**Enterprise M365 Copilot Crisis Response (near-real-time):**
1. Webhook fires within 5 seconds of concerning message
2. Phosra analyzes conversation turn in real-time
3. Parent notified within 60 seconds
4. School counselor alert available if configured (for educational deployments)

### Why Playwright for Writes

Direct API writes to consumer Copilot settings are not possible -- no public API exists for account settings management. The Microsoft Graph API covers enterprise M365 Copilot for reads but does not cover writes to user-level settings (memory, personalization, SafeSearch). Microsoft Family Safety configuration (the most important write operation) has no public API; the Family Safety app communicates with an unofficial internal API.

Playwright is the only available method for automating these configuration steps. The operations are executed as low-frequency batch writes (onboarding + monthly verification), not continuous operations, to minimize detection risk.

---

## Section 3: Credential Storage Requirements

| Credential | Purpose | Sensitivity | Storage Notes |
|-----------|---------|-------------|--------------|
| Child's Microsoft Account email | Login to consumer Copilot | High | Encrypted at rest (AES-256) |
| Child's Microsoft Account password | Playwright authentication | Critical | AES-256, per-user keys, never logged, retrieved only when Playwright session is needed |
| Child's Microsoft Account MFA backup code | Re-authentication when MFA is required | Critical | AES-256, rarely accessed, prompts parent to generate new backup code if consumed |
| Parent's Microsoft Account email | Microsoft Family Safety configuration | High | Encrypted at rest |
| Parent's Microsoft Account password | Playwright authentication for Family Safety | Critical | AES-256, per-user keys, never logged |
| Parent's Microsoft Account MFA | Re-authentication | Critical | AES-256 |
| Azure AD app client ID (enterprise) | Microsoft Graph API authentication | Medium | Stored in Phosra backend configuration |
| Azure AD app client secret (enterprise) | Microsoft Graph API authentication | High | AES-256, rotated quarterly |
| Microsoft Graph access tokens | API calls for enterprise M365 | High | In-memory only; refresh via MSAL token cache; never persisted to disk |
| Session cookies (consumer Copilot) | Playwright session state | High | Encrypted; stored only for duration of batch operation; purged after each batch completes |

**MFA Strategy:** The most complex credential management challenge for Copilot is MFA. Microsoft accounts increasingly enforce MFA (Authenticator app, SMS). Phosra should:
1. Request a backup code from the parent during onboarding
2. Use the backup code only when MFA is triggered (triggered infrequently for known devices)
3. Alert the parent when a backup code is consumed and request a new one
4. Recommend the parent add Phosra's automation device as a trusted device in their Microsoft Account settings (this reduces MFA frequency)

---

## Section 4: OAuth Assessment

### Does Microsoft Copilot Offer OAuth for Account Management?

**Consumer Copilot (copilot.microsoft.com):** No. There is no OAuth flow for third-party applications to manage consumer Copilot account settings, parental controls, or conversation access. The Microsoft Account OAuth flow allows third parties to authenticate users, but it does not grant scopes for Copilot-specific settings management.

**Microsoft 365 Copilot (enterprise):** Yes, for specific scopes. Azure AD (Microsoft Entra ID) provides OAuth 2.0 / MSAL authentication for the Microsoft Graph API. The available scopes relevant to Phosra are:
- `AIInteractionHistory.Read.All` -- read all Copilot interaction history in the organization
- `Reports.Read.All` -- read usage reports
- `User.Read.All` -- read user profile information (for identifying child accounts)
- No scope exists for writing Copilot user settings or configuring content filters

### Implications for Phosra's UX

- **Consumer:** Phosra must store the child's Microsoft Account credentials (email + password + MFA backup) and authenticate on their behalf via Playwright. The parent must consent to this credential storage during onboarding. This is the same approach Phosra would use for any platform without OAuth parental control access.
- **Enterprise:** Phosra uses a service principal OAuth flow with admin consent. The school or organization's IT admin grants Phosra's Azure AD app permission to read interaction history. Individual parent credentials are not stored -- the school's admin consent covers all students.

### Comparison to Platforms with Parental Control OAuth

No major AI chatbot platform currently offers OAuth scopes specifically for parental control access. Microsoft's enterprise Graph API is the closest to a functional parental control OAuth flow, but it operates at the organizational level (IT admin), not the parent-child level. This gap -- absent across the entire AI chatbot industry -- is the central market opportunity for Phosra.

### Re-Authentication Frequency

- **Consumer Playwright:** Microsoft sessions via browser are relatively persistent (30-day cookie lifetime in most configurations). Phosra expects to re-authenticate via Playwright approximately once per month per account, or when MFA is triggered by a new IP address or device detection.
- **Enterprise Graph API:** MSAL token refresh is automatic and transparent; access tokens expire every 1 hour but are silently refreshed by MSAL using the refresh token (which has a 90-day lifetime).

---

## Section 5: Adapter Gap Analysis

### What Exists (Current State)

No Microsoft Copilot adapter currently exists for Phosra. This is a greenfield implementation.

| Feature | Status |
|---------|--------|
| Consumer Playwright authentication | Missing |
| Enterprise Azure AD / Graph API authentication | Missing |
| Conversation history reader (consumer) | Missing |
| Conversation history API (enterprise) | Missing |
| Content classification pipeline | Exists (shared across platforms) |
| Microsoft Family Safety integration | Missing |
| Usage analytics (consumer) | Missing |
| Usage analytics (enterprise) | Missing |
| Parent alert system | Exists (shared across platforms) |
| Settings configuration (memory, SafeSearch) | Missing |
| Session detection | Missing |

### What's Needed (for Production Phosra Integration)

| Feature | Status | Priority | Notes |
|---------|--------|---------|-------|
| Consumer Playwright session manager | Missing | P0 | Core dependency for consumer integration; handle MFA, session refresh, Cloudflare |
| Microsoft Family Safety automation | Missing | P0 | Primary enforcement mechanism; block app, block site, set screen time |
| Daily conversation history batch read | Missing | P0 | Core monitoring capability; DOM parser for copilot.microsoft.com |
| Phosra crisis classifier for Copilot conversations | Partial | P0 | Shared classifier may need Copilot-specific tuning |
| Parent notification system (Copilot alerts) | Partial | P0 | Notification system exists; add Copilot-specific alert templates |
| Enterprise Azure AD OAuth / MSAL | Missing | P1 | Needed for educational deployment path |
| aiInteractionHistory Graph API client | Missing | P1 | Enterprise conversation reads; GA via beta endpoint |
| Graph Change Notifications webhook | Missing | P1 | Enterprise real-time monitoring; webhook server infrastructure |
| Usage Report API client (enterprise) | Missing | P1 | Enterprise analytics |
| Settings verification (SafeSearch, memory, personalization) | Missing | P2 | Monthly settings audit; Playwright settings reader |
| Conversation deletion automation | Missing | P2 | Monthly cleanup on parent request |
| Academic usage classifier | Partial | P2 | Shared classifier; needs Copilot-specific tuning |
| Cross-platform usage aggregation | Partial | P2 | Shared infrastructure; add Copilot as a data source |

---

## Section 6: Platform-Specific Considerations

### Unique Risk: Guest Access Bypasses All Controls

The most critical Copilot-specific risk for Phosra is that copilot.microsoft.com allows unauthenticated guest access. A child can use Copilot without a Microsoft Account, which means:
- All account-level controls are bypassed (account blocking, age restrictions, teen data protections)
- Phosra's credential-based monitoring cannot track guest sessions
- Microsoft Family Safety's website block of copilot.microsoft.com IS effective against guest access (it blocks the URL regardless of login status)

**Phosra response:** Emphasize Microsoft Family Safety's website block as the primary enforcement mechanism. The block is agnostic to authentication state -- it blocks copilot.microsoft.com entirely on enrolled devices. Document this clearly in parent-facing onboarding.

### Unique Strength: Conservative Content Policies

Microsoft Copilot is the most conservatively content-filtered major AI chatbot for children:
- No romantic companion features
- No user-created character ecosystem
- Explicit ban on simulated erotica (Fall 2025)
- No adult content tiers
- SafeSearch integration adds browser-level content filtering on top of AI-level filtering

This means Phosra's content safety monitoring for Copilot will have substantially lower alert rates than for Character.ai, ChatGPT, or Perplexity. Parents using Copilot with Phosra should be informed that Copilot is one of the safer AI platforms by design.

### Unique Risk: Microsoft 365 Education Integration

When Copilot is deployed in educational institutions via Microsoft 365 Education, students aged 13+ can access Copilot with their school credentials. This creates a scenario where:
- A student has Copilot access through their school account that parents may not know about
- The school account may have different (and more permissive in some respects) Copilot access than a personal account
- Parents cannot monitor school-account Copilot usage through Microsoft Family Safety (which only covers personal Microsoft Accounts)

**Phosra response:** For educational deployments, Phosra should work with school IT administrators via the enterprise Graph API integration. This is the only way to access M365 Education Copilot monitoring data. Parents of children in M365 Education schools should be informed that Copilot monitoring requires school cooperation.

### The Memory Feature Evolution

Microsoft's Memory feature (GA July 2025, consumer rollout in progress) creates increasing emotional attachment risk over time. A child who uses Copilot for months will find that Copilot "knows" them -- their preferences, past conversations, interests. This deepens the relationship dynamics that Phosra monitors for emotional dependency.

**Phosra response:** Disable Memory as a standard configuration step during onboarding. Monitor quarterly for re-enablement. Alert parent if Memory is re-enabled by the child. Include Memory status in the monthly settings verification report.

### Microsoft's Regulatory Trajectory

Microsoft is among the most sophisticated regulatory compliance actors in the AI industry. Its EU AI Act compliance program, ISO 42001 certification, and UK Online Safety Act engagement suggest that Microsoft will likely introduce more formal parental control APIs in response to regulatory pressure. Key indicators to watch:
- UK Ofcom guidance on AI chatbot age assurance (expected 2026)
- KOSA passage and implementation (if it becomes law)
- EU AI Act high-risk system classification for general-purpose AI systems

If Microsoft introduces a formal parental control API (analogous to what Phosra needs), it would likely emerge from the enterprise Microsoft 365 admin center or Microsoft Family Safety API -- both of which Phosra already has integration infrastructure for.

### Recent Safety Incidents

The Copilot Designer image safety whistleblower incident (March 2024) and the "Joker" persona self-harm response are important for Phosra context:
- Neither incident suggests Copilot is fundamentally unsafe -- both were specific jailbreak scenarios that have since been patched
- The incidents confirm that Copilot's safety filters, while strong, can be bypassed under adversarial conditions
- Phosra's conversation-layer monitoring adds defense in depth against jailbreak-enabled harmful content
- The Microsoft FTC whistleblower situation creates reputational incentive for Microsoft to improve child safety features -- potential partnership opportunity for Phosra

---

## Section 7: API Accessibility Reality Check

## API Accessibility Reality Check

**Platform:** Microsoft Copilot (consumer + enterprise M365)
**API Accessibility Score:** Level 2 -- Limited Public API
**Phosra Enforcement Level:** Hybrid (Device-Level primary + Conversation-Layer supplementary + API for enterprise)

### What Phosra CAN do:

- Block Copilot entirely on enrolled Windows, Xbox, and Android devices via Microsoft Family Safety (device-level; most reliable control)
- Block copilot.microsoft.com in Edge browser via Microsoft Family Safety content filters (effective for authenticated AND guest access on enrolled devices)
- Set device-level screen time budgets that function as Copilot time limits (indirect but enforceable)
- Configure SafeSearch to Strict via Playwright (maximizes content filtering in Copilot web responses)
- Disable Memory feature via Playwright (prevents cross-session personalization and attachment deepening)
- Read daily conversation history via Playwright batch scrape (consumer) -- daily, not real-time
- Read conversation history via Microsoft Graph aiInteractionHistory API (enterprise M365 only -- near-real-time with webhooks)
- Classify conversation content for crisis signals, PII, academic patterns, emotional dependency (conversation-layer; works on any retrieved transcript)
- Alert parents via Phosra notification system (push, email, SMS) based on content analysis findings
- Derive usage analytics from conversation history counts and Microsoft Family Safety screen time data

### What Phosra CANNOT do:

- Monitor consumer Copilot conversations in real-time (daily batch only; no live session monitoring)
- Configure Copilot-native content safety filter thresholds (not user-configurable in consumer Copilot)
- Access conversation transcripts of guest (unauthenticated) Copilot sessions (no login means no session to authenticate as)
- Set Copilot-specific time limits within the Copilot application (no native time limit feature)
- Receive platform-generated crisis alerts (Microsoft's crisis detection does not generate parent notifications)
- Toggle voice mode or image generation (no per-user feature toggles in consumer Copilot)
- Access parent notification data from Microsoft Family Safety about what triggered a block (Family Safety does not expose a monitoring API)
- Access conversation transcripts of school-account (M365 Education) Copilot use without school IT admin cooperation

### What Phosra MIGHT be able to do (with risk):

- Automate Microsoft Family Safety configuration via Playwright on the family.microsoft.com portal (ToS gray area -- uses parental control tool as intended, but automated via Playwright which violates the general ToS)
- Access consumer Copilot conversation history via Playwright DOM scraping (ToS violation -- "no bots or scrapers"; medium detection risk for daily batch)
- Configure Memory and SafeSearch settings via Playwright (ToS violation; low-frequency writes reduce detection risk)
- Access Microsoft Family Safety's internal REST API directly (unofficial API -- higher risk, potentially more reliable than Playwright; requires reverse-engineering the Family Safety app's API)

### Recommendation

**Phosra should pursue a dual-track integration strategy:**

**Track 1 (Consumer, available immediately):** Implement Microsoft Family Safety configuration (block/time limits) as the primary enforcement layer -- this is Microsoft's sanctioned parental control system and the risk of using it (even via Playwright) is lower than automation of copilot.microsoft.com itself. Supplement with daily batch conversation history reads via Playwright for monitoring and alerting. Execute write operations (Memory disable, SafeSearch) only at onboarding and monthly verification.

**Track 2 (Enterprise, pursue actively):** Seek a Microsoft partner relationship to gain official Microsoft Graph API access for schools using M365 Education. The aiInteractionHistory API (public preview, May 2025) provides exactly the conversation access Phosra needs, within the documented, admin-consented API framework. This path is legally defensible, technically reliable, and provides near-real-time monitoring via Change Notifications.

**Track 3 (Long-term):** Actively monitor Microsoft's regulatory response to UK Online Safety Act, KOSA, and EU AI Act. These regulations may compel Microsoft to offer a formal parental control API for consumer Copilot -- which would transform the integration from Level 2 to Level 4 or 5. Phosra should position itself as a ready integration partner when Microsoft announces such an API.
