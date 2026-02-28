# Perplexity AI — Phosra Integration Notes

**Platform:** Perplexity AI
**Research Date:** 2026-02-27
**Framework Version:** 1.0
**API Accessibility Score:** Level 2 — Limited Public API
**Phosra Enforcement Level:** Primarily Device-Level, with Playwright-Possible Conversation Monitoring

---

## The Core Question

**If a parent configures Phosra to: block explicit content, enforce a 30-minute daily limit, and send self-harm alerts — what exactly would Phosra do on Perplexity?**

- **Block explicit content:** Phosra cannot configure Perplexity's content filters (none exist). Phosra would monitor the child's Threads for explicit content after the fact (if the child has an account). If explicit content is detected in a Thread, Phosra alerts the parent. If the parent wants proactive blocking, Phosra implements a DNS/device-level block of perplexity.ai entirely, or the parent configures a Perplexity-native search filter from within their account manually.
- **Enforce 30-minute daily limit:** Phosra cannot set a session limit within Perplexity. Phosra would: (1) monitor DNS queries to detect when the child begins using Perplexity; (2) track cumulative usage time via DNS query frequency; (3) at the 30-minute mark, trigger a DNS block of perplexity.ai for the remainder of the day. This requires Phosra's network/router integration module. Thread polling can provide a usage duration approximation as a backup signal.
- **Send self-harm alerts:** Phosra monitors the child's Threads via periodic Playwright reads (every 15-30 minutes). When Thread content contains self-harm keywords or patterns matching Phosra's NLP classifier, Phosra sends a push notification to the parent with the flagged Thread content. The delay between the query and the alert is 0-30 minutes (depending on polling interval). This does not prevent the child from receiving harmful information from Perplexity — it alerts the parent after the fact.

---

## Section 1: Rule Category Coverage

### Fully Enforceable

Phosra can enforce or meaningfully approximate these categories on Perplexity.

| Rule Category | Platform Feature | Enforcement Method |
|---|---|---|
| `ai_conversation_transcript_access` | Threads (conversation history) stored in account | Playwright read of Thread content; periodic polling; parent dashboard display |
| `ai_flagged_content_alert` | No native alert — Phosra-generated | NLP scan of Threads; push notification to parent on trigger detection |
| `ai_usage_analytics_report` | No native analytics — Phosra-derived | Thread polling pipeline derives: query count, topic distribution, usage time estimate |
| `ai_memory_persistence_block` | Memory toggle exists in account settings | Playwright write to disable Memory toggle; weekly verification |
| `ai_conversation_retention_policy` | Manual Thread deletion available | Playwright delete of specific Threads or all history; on-demand from parent dashboard |
| `ai_platform_allowlist` | External control (no platform feature) | DNS/router block of perplexity.ai; iOS Screen Time / Android Family Link app block |
| `ai_cross_platform_usage_cap` | External control | Phosra cross-platform time tracker; DNS enforcement |
| `ai_new_platform_detection` | External control | DNS query monitoring; new domain detection |

### Partially Enforceable

Phosra can approximate these categories with meaningful but imperfect coverage.

| Rule Category | Gap | Phosra Workaround |
|---|---|---|
| `ai_self_harm_protection` | No platform-native crisis detection; documented as insufficient even when present; self-harm information can be retrieved from the web. Phosra cannot prevent the child from asking or Perplexity from answering. | Retrospective: NLP scan of Threads flags self-harm queries and AI responses. Alert parent with 0-30 minute delay. Parent can then intervene. Not real-time prevention. |
| `ai_explicit_content_filter` | No configurable filter on Perplexity; platform applies a baseline that is not documented or audited. Cannot be strengthened. | Retrospective: scan Threads for explicit content. Alert parent. Proactive option: block perplexity.ai via DNS if the family's risk tolerance is low. |
| `ai_violence_filter` | Same as explicit content — no configurable filter. | Retrospective Thread scanning for violent content keywords. Alert and/or delete Thread. |
| `ai_substance_info_filter` | No configurable filter. Perplexity can surface drug information from web sources. | Retrospective Thread scanning. Alert parent if substance queries detected. |
| `ai_hate_speech_filter` | No configurable filter. | Retrospective Thread scanning. Alert parent. |
| `ai_pii_sharing_guard` | Perplexity has no PII detection. Children can freely share personal information in queries. | NLP PII detection on Thread content (full name, address, phone, school name patterns). Alert parent when PII sharing detected. Cannot prevent in real-time. |
| `ai_daily_time_limit` | No native time limit. | DNS query monitoring to detect usage; cumulative time tracking; DNS block enforcement at limit threshold. Accuracy depends on DNS monitoring fidelity. Cross-device usage may not be fully captured without device-level agents on all devices. |
| `ai_schedule_restriction` | No native quiet hours. | DNS-level block of perplexity.ai on a parent-configured schedule (e.g., block after 9pm). No Perplexity ToS risk. |
| `ai_homework_generation_guard` | No native academic guard. Perplexity actively markets homework completion via Comet. | Retrospective: detect academic dishonesty patterns in Threads (essay requests, code generation for classes, book report queries). Alert parent with sample content. Cannot prevent the generation. |
| `ai_academic_usage_report` | No native academic report. | Phosra derives academic usage from Thread NLP analysis: topic classification, query-type categorization, academic keyword detection. Produces a weekly academic integrity report for parents. |
| `ai_age_appropriate_topics` | No age-differentiated topic filtering on Perplexity. Single safety baseline for all users. | Phosra's conversation-layer analysis applies age-appropriate topic detection based on the child's configured age. More granular than the platform's binary approach. Retrospective detection only. |
| `ai_image_upload_block` | No parental control for image upload. Image upload is a feature of the consumer interface. | Phosra cannot disable Perplexity's image upload via settings. Workaround: device-level camera/photo library access restriction (iOS/Android) prevents image selection in the Perplexity app. Does not affect the web browser interface. |
| `ai_location_data_block` | Location access managed at OS level. | Phosra's device-level integration: revoke location permission for Perplexity app via iOS/Android settings. Conversation-layer monitoring: flag when child explicitly shares location information in a Thread. |
| `ai_distress_detection_alert` | No platform-native distress detection beyond rudimentary self-harm response. | Phosra's NLP distress classifier scans Thread content for: loneliness indicators, hopelessness language, bullying disclosures, family conflict references. Alert parent with flagged content. Lower precision than crisis detection — tunable sensitivity required. |

### Not Enforceable

Phosra cannot meaningfully enforce these categories on Perplexity through any method.

| Rule Category | Reason |
|---|---|
| `ai_message_rate_limit` | Platform has no user-configurable rate limits. No API surface for message counting. Cannot be implemented at conversation level without real-time access. Not possible. |
| `ai_session_cooldown` | No native session cooldown. Cannot inject cooldown into Perplexity sessions via any method. Device-level approach (block the app for 15 minutes) is a rough approximation but does not track session time accurately. |
| `ai_engagement_check` | No mechanism for Phosra to inject messages into a Perplexity conversation. Cannot interrupt an active session with a check-in prompt. Only approach is a push notification outside the Perplexity app, which the child can ignore. |
| `ai_emotional_dependency_guard` | Very low priority on Perplexity given its non-companion design. The platform does not create emotional dependency conditions. If monitoring is implemented, retrospective Thread analysis would show low risk. However, real-time dependency pattern detection across sessions requires longitudinal analysis not feasible at this integration level. |
| `ai_therapeutic_roleplay_block` | Cannot configure Perplexity to refuse therapeutic roleplay framing. Retrospective Thread detection possible but Perplexity's search-synthesis model makes true therapeutic roleplay unlikely. Low priority. |
| `ai_romantic_roleplay_block` | Perplexity does not support romantic roleplay and the CEO has explicitly opposed companion features. This category is not applicable in practice. |
| `ai_promise_commitment_block` | Not applicable — Perplexity does not make commitments or relationship statements by design. No enforcement needed. |
| `ai_persona_restriction` | Perplexity has no persona or character system. Not applicable. |
| `ai_identity_transparency` | Perplexity consistently presents itself as a search tool, not a sentient entity. Not a risk vector on this platform. |
| `ai_authority_impersonation_block` | Cannot configure Perplexity to refuse authority framing. Retrospective detection possible (scan Threads for "as a doctor/therapist/lawyer" patterns). Low-priority given search-synthesis architecture tends to cite actual authority sources rather than impersonate them. |
| `ai_learning_mode` | No Socratic mode exists. No mechanism to inject learning-mode behavior via Phosra. Khanmigo is the only viable alternative if this mode is required. |
| `ai_data_collection_minimization` | Phosra can disable AI Data Usage (training opt-out) and Memory, but cannot minimize what data Perplexity collects at the infrastructure level (logs, metadata, IP). Full data minimization requires Perplexity's cooperation. |

---

## Section 2: Enforcement Strategy

### Read Operations

| What Phosra Reads | Via | Schedule | Purpose |
|---|---|---|---|
| Thread list (titles + timestamps) | Playwright web UI | Every 15-30 minutes during active hours | Detect new activity; compute usage time approximation |
| Thread content (queries + responses) | Playwright web UI | On new Thread detection; or full sweep every 24 hours | NLP safety analysis; academic integrity analysis; PII detection |
| Account settings (AI Data Usage state, Memory state) | Playwright web UI | Weekly | Verify privacy settings have not been re-enabled by child |
| DNS query log | Router/DNS integration | Real-time | Activity detection; time limit tracking; session detection |

### Write Operations

| What Phosra Changes | Via | When | ToS Risk |
|---|---|---|---|
| AI Data Usage toggle → OFF | Playwright web UI | Initial setup; verify weekly | Medium |
| Memory toggle → OFF | Playwright web UI | Initial setup; verify weekly | Medium |
| Delete specific Threads | Playwright web UI | On parent request from dashboard; post-alert action | Medium |
| DNS block of perplexity.ai | Router/DNS integration | Daily time limit reached; quiet hours schedule | None |

### Real-Time Monitoring

Perplexity cannot be monitored in real time at the conversation layer via any documented integration method. Phosra's monitoring is retrospective:

- **Polling interval:** 15 minutes (standard); 5 minutes (elevated monitoring for flagged accounts)
- **Maximum detection lag:** Equal to the polling interval (up to 30 minutes on standard)
- **Trigger for immediate read:** DNS query to perplexity.ai detected → schedule next Thread read in 5 minutes (increased priority)
- **Keyword detection:** Phosra's NLP pipeline scans Thread content for: crisis keywords (self-harm, suicide, methods), PII patterns (address, phone, name), academic patterns (essay titles, homework phrases, code submission language), substance keywords, explicit content terms
- **Alert pipeline:** On trigger detection → extract flagged Thread snippet → compose parent alert → push notification via Phosra mobile app → store in parent dashboard timeline

### Screen Time Enforcement

Detailed flow for Perplexity daily time limits:

1. Parent configures: "Max 30 minutes of Perplexity per day"
2. Phosra monitors DNS queries to `perplexity.ai` and subdomains
3. When first DNS query detected for the day: start timer
4. Timer runs while DNS queries to Perplexity continue at activity frequency threshold (>1 query per 2 minutes = active session)
5. At 25 minutes: Phosra sends parent notification "Child has used Perplexity for 25 of 30 allowed minutes today"
6. At 30 minutes: Phosra pushes a DNS block rule to the home router, blocking `perplexity.ai` for the remainder of the day
7. Block is cleared at midnight (or parent-configured daily reset time)
8. Child on the Perplexity app sees a "network error" or "cannot connect" — the block is at the network layer, not inside the app
9. **Bypass risk:** Child can switch to mobile data (cellular), bypassing the home router DNS block. Mitigations: (a) Phosra's device-level agent (if installed) can detect mobile data usage and apply an in-app restriction; (b) Parent can use iOS Screen Time / Android Family Link to enforce the 30-minute limit at the device level, which follows the device regardless of network.

### Crisis Response Flow

When Phosra's NLP scanner detects self-harm, suicide ideation, or crisis content in a Perplexity Thread:

1. **Detection:** NLP classifier triggers on Thread content during scheduled poll (within 0-30 minutes of query)
2. **Classification:** Severity rating applied (low: concerning language; medium: explicit ideation; high: method inquiry, detailed harmful content)
3. **Parent notification:**
   - Low: In-app notification with flagged Thread summary (next Phosra session open)
   - Medium: Push notification immediately with summary and link to full Thread in Phosra dashboard
   - High: Push notification + SMS to parent's phone number; Thread snippet included; crisis resources (988, Crisis Text Line) provided to parent for sharing with child
4. **Dashboard record:** Flagged Thread stored in Phosra's parent dashboard timeline with severity label, timestamp, and Thread content
5. **Intervention options from parent dashboard:**
   - View full Thread conversation
   - Delete Thread from Perplexity (Method 9)
   - Block Perplexity access immediately (DNS block, platform-level)
   - Share 988 / Crisis Text Line with child via Phosra's messaging feature
   - Mark as reviewed (clears alert)
6. **Escalation path:** If multiple high-severity flags occur within 24 hours, Phosra escalates to "crisis mode": continuous polling (every 5 minutes), immediate SMS for each flag, optional auto-block of Perplexity after the second high-severity flag

**Critical limitation to communicate to parents:** Phosra CANNOT prevent the child from receiving harmful information from Perplexity. Perplexity's self-harm safety filters are documented as bypassable. Phosra's monitoring is retrospective. A child can receive a detailed response about self-harm methods, and the parent may not be alerted for up to 30 minutes. The highest-fidelity safety intervention for self-harm on Perplexity is blocking access entirely via DNS.

### Why Browser Automation for Writes

The Sonar API (Perplexity's only public API) is a conversation generation API. It has no endpoints for:
- Reading account settings
- Writing account settings
- Accessing conversation history
- Managing AI Data Usage preferences
- Disabling memory

Every write operation on Perplexity requires browser automation because these features are only exposed in the consumer web UI. Phosra accepts the ToS risk because:
1. The child safety use case is ethically defensible
2. No enforcement action against parental control tools has been documented on Perplexity
3. The automation footprint is minimal (infrequent writes, low detection risk)
4. No API alternative exists or is likely to exist absent regulatory pressure

---

## Section 3: Credential Storage Requirements

| Credential | Purpose | Sensitivity | Storage Notes |
|---|---|---|---|
| Child's email address | Login to Perplexity web UI via Playwright | High | Encrypted at rest in Phosra database; per-child-account record |
| Child's Perplexity password | Playwright web UI login | Critical | AES-256 encryption; per-user keys; never logged; displayed to parents in masked form only |
| Google OAuth refresh token (if child uses Google login) | Playwright web UI login via Google OAuth | Critical | Encrypted; rotate on schedule; re-consent on expiry |
| Playwright session cookie | Maintain authenticated web UI session | High | Encrypted; refresh before expiry; invalidated on password change |
| Phosra Sonar API key (Phosra's own, not child's) | If Phosra uses Sonar API for content classification enrichment | High | Encrypted; Phosra-owned (not child credential) |
| Router/DNS admin credentials | DNS block enforcement for time limits and quiet hours | High | Encrypted; per-family configuration |
| MFA codes / recovery codes (if child has MFA enabled) | Re-authentication after session expiry | Critical | Encrypted; stored with strict access controls; used only when session expires |

**Note on anonymous access:** If the child uses Perplexity without an account (anonymous/guest mode), no credentials are relevant but monitoring is also impossible. Phosra should detect and alert on anonymous Perplexity usage.

---

## Section 4: OAuth Assessment

**Does Perplexity offer OAuth for account management?** No. Perplexity offers Google and Apple OAuth as login methods (for the child to log in), but there is no OAuth delegation flow that allows a third party (Phosra) to obtain delegated access to a Perplexity account on behalf of a user.

**What this means for Phosra's UX:**
- Parents must provide the child's Perplexity credentials (email + password) to Phosra, which creates friction and trust concerns.
- Parents who are uncomfortable storing their child's password in Phosra can opt for DNS-only monitoring (no account access), sacrificing Thread monitoring for time-limit enforcement only.
- If the child uses Google OAuth to log in to Perplexity, Phosra would need to automate the Google OAuth flow via Playwright — adding complexity and requiring the parent to provide Google account credentials or a Google OAuth refresh token.

**Does the Sonar API's OAuth cover parental control scopes?** The Sonar API does not use OAuth at all — it uses bearer token (API key) authentication. The API key grants access to conversation generation only, not to any account management or parental control feature.

**Comparison to platforms with parental control OAuth:**
- Khanmigo offers institutional API with administrative delegation — a parent or school administrator can configure student settings via API.
- No major consumer AI chatbot platform offers Level 5 (OAuth for delegated parental control access). Perplexity's absence of OAuth for account management places it at the same level as most other platforms on this dimension.
- Regulatory pressure (KOSA, EU AI Act) may eventually require platforms to offer OAuth-based parental control delegation. Phosra should position this as a partnership opportunity if Perplexity faces increased regulatory scrutiny.

---

## Section 5: Adapter Gap Analysis

**Current state:** No Phosra adapter exists for Perplexity. This is a greenfield implementation.

### What Needs to Be Built (for production Phosra integration)

| Feature | Status | Priority |
|---|---|---|
| Playwright session manager (web UI login) | Missing | P0 |
| Thread list reader (conversation enumeration) | Missing | P0 |
| Thread content reader (full query/response text) | Missing | P0 |
| NLP safety scanner (self-harm, PII, academic, explicit) | Missing | P0 |
| Parent alert pipeline (from NLP results) | Missing | P0 |
| AI Data Usage opt-out writer | Missing | P0 |
| Memory toggle writer | Missing | P0 |
| DNS monitoring integration (activity detection) | Missing | P0 — shared with device-level module |
| DNS block enforcement (time limits, quiet hours) | Missing | P0 — shared with device-level module |
| Thread deletion writer | Missing | P1 |
| Derived usage analytics pipeline | Missing | P1 |
| Account settings reader | Missing | P1 |
| Parent dashboard UI — Perplexity-specific panels | Missing | P1 |
| Anonymous usage detection + parent alert | Missing | P1 |
| Incognito mode detection + parent alert | Missing | P2 |
| Sonar API integration (optional: Phosra-powered search enrichment) | Missing | P3 — not for parental controls; for potential Phosra product feature |

---

## Section 6: Platform-Specific Considerations

### The Anonymity Problem

Perplexity's anonymous (no-account) access is Phosra's most significant integration challenge. A child who uses Perplexity without logging in produces no Thread history accessible to Phosra. Anonymous Threads expire after 14 days without any access mechanism. This means:

- If the child learns that not logging in prevents parental monitoring, they have a trivially easy bypass.
- Phosra should detect anonymous Perplexity usage via DNS monitoring and alert the parent.
- Phosra should recommend that parents configure their network so the child must use a family-managed browser profile that stays logged in to their Perplexity account.

### The Incognito Mode Problem

Perplexity's incognito mode, while designed for privacy, defeats Phosra's Thread monitoring:
- Incognito mode prevents Threads from being saved to the account
- Incognito mode disables Memory
- Phosra cannot monitor conversations conducted in incognito mode via Thread polling

Detection: Phosra can detect if incognito mode is enabled by reading account settings (Method 2) and alert the parent. However, the child can enable incognito mode at any time during a session. Phosra's settings read is not real-time, so there may be a delay before incognito mode detection.

Recommendation: Document for parents that incognito mode on Perplexity is equivalent to private browsing — it defeats monitoring. If the parent is concerned about this, the enforcement option is device-level browser control or blocking Perplexity entirely.

### Comet AI Browser as a Separate Surface

Perplexity's Comet browser (launched October 2025) is a separate application from the Perplexity web app. It is a Chromium-based browser with an agentic AI assistant built in. It connects to the user's Perplexity account.

**Additional concerns for children using Comet:**
- Comet can autonomously complete tasks including filling out assignments (documented via the October 2025 ads incident)
- Comet has Gmail and Google Calendar read/write access if the user grants it
- Comet's autonomous actions may not leave a Thread record in the way that manual Perplexity queries do
- Comet's "tasks" may be harder to monitor than manual query/response threads

**Phosra's current Comet coverage:** No specific Comet integration. DNS monitoring covers Comet (same domain). Thread monitoring may partially capture Comet-initiated conversations. However, Comet's agentic task completion (autonomous form-filling, autonomous web navigation) may not create Thread records in the standard Perplexity interface.

**Recommendation:** Flag Comet as a separate risk surface requiring dedicated research. For now, recommend parents who have academic integrity concerns block the Comet app at the device level.

### Perplexity as a Search Tool vs. Chatbot

Perplexity's search-synthesis architecture creates a fundamentally different risk profile from companion chatbots:
- **Lower emotional safety risk:** No companion features, no memory-driven relationship, no romantic roleplay.
- **Higher academic integrity risk:** The citation system makes AI-generated content appear researched. Perplexity's CEO response to the cheating advertisements ("absolutely don't do this") demonstrated awareness of the problem without remediation.
- **Different self-harm risk:** Perplexity can surface harmful information from the web, sometimes in more credible-appearing form (with cited sources) than a generative chatbot that might add disclaimers. The Northeastern study found Perplexity particularly susceptible to academic reframing because it retrieves information from web sources, which bypasses the model's self-harm filter.

### CEO's Stance on AI Safety for Children

Perplexity's CEO has:
- Publicly criticized AI companion features as dangerous for children (November 2025)
- Responded with "absolutely don't do this" when confronted with the homework cheating ad (October 2025)
- Not implemented any child safety features despite these public statements

This creates a reputational gap that Phosra could exploit in a partnership conversation: Perplexity's CEO has stated values aligned with child safety but has not built features to support those values. Phosra could position itself as the infrastructure for Perplexity to deliver on its CEO's stated safety commitments without building a parental control system from scratch.

### Copyright Litigation Volume

Perplexity is one of the most actively litigated AI companies as of 2026-02 (Reddit, NYT, Chicago Tribune, Encyclopedia Britannica, Merriam-Webster, Nikkei, Amazon threat). This litigation posture indicates:
- Perplexity may face existential legal risk that could affect platform continuity
- Phosra should plan for Perplexity integration to potentially become unavailable
- Phosra should not invest in deep Perplexity integration until the platform's legal stability improves
- The high litigation risk makes a formal Perplexity partnership more valuable (reduces legal exposure for both parties)

---

## Section 7: API Accessibility Reality Check

```
## API Accessibility Reality Check

**Platform:** Perplexity AI
**API Accessibility Score:** Level 2 — Limited Public API
**Phosra Enforcement Level:** Primarily Device-Level, with Playwright-Possible Conversation Monitoring

### What Phosra CAN do:

- Read the child's Perplexity Threads (conversation history) via Playwright on a polling schedule
- Scan Thread content for safety signals: self-harm queries, PII sharing, academic dishonesty, explicit content
- Alert parents when safety signals are detected in Thread content (15-30 minute detection lag)
- Disable AI Data Usage (training opt-out) and Memory for the child's account via Playwright
- Delete specific Threads from the child's account via Playwright on parent request
- Block perplexity.ai entirely via DNS/router on a parent-configured schedule or daily time limit
- Detect active Perplexity usage via DNS query monitoring (no ToS risk)
- Provide derived usage analytics from Thread polling (query count, topic distribution, usage time approximation)
- Alert parents when the child uses Perplexity without a signed-in account (anonymous mode)

### What Phosra CANNOT do:

- Configure Perplexity's content safety filters (they are not configurable by anyone)
- Prevent a child from receiving harmful search results from Perplexity in real time
- Set native time limits, message rate limits, or session cooldowns on Perplexity
- Link a parent account to a child account in Perplexity (feature does not exist)
- Monitor conversations conducted in anonymous (no-account) mode
- Monitor conversations conducted in Perplexity's incognito mode
- Access conversation history via the Sonar API (zero data retention)
- Receive real-time alerts from Perplexity when a child asks about dangerous topics
- Configure per-topic restrictions or age-appropriate topic filtering
- Enforce a learning/Socratic mode to prevent homework cheating
- Monitor Comet browser autonomous task completions that may not create Thread records

### What Phosra MIGHT be able to do (with risk):

- Use the Sonar API to send search queries through Perplexity — enabling Phosra to optionally power its own
  search features with Perplexity (not a parental control capability; product feature only)
- Detect when the child re-enables Memory or AI Data Usage after Phosra disabled them (via periodic
  settings read), and re-disable them — but this creates a monitoring burden and the child can keep
  re-enabling them in a cycle
- Negotiate a formal partnership with Perplexity that grants elevated API access given the child safety
  use case — the CEO's stated values suggest openness, but no partner program currently exists

### Recommendation:

Phosra should implement Perplexity integration as a two-layer architecture: (1) DNS/device-level control for
time limits, quiet hours, and access blocking — this carries no ToS risk and is the most reliable enforcement
mechanism; and (2) Playwright-based Thread monitoring for conversation-layer safety analysis — this carries
ToS risk but provides the unique value Phosra delivers that no device-level tool can (conversation content
visibility and academic integrity analysis).

The most important parent-facing message for Perplexity is that Phosra's protections are retrospective, not
preventive. Phosra cannot stop a child from receiving harmful information from Perplexity; it can alert the
parent after the fact and enforce access restrictions. For parents who need real-time prevention on this
specific platform, Phosra's recommendation should be to block Perplexity access entirely until the platform
implements meaningful child safety features.

Phosra should pursue a formal partnership with Perplexity, leveraging the CEO's stated safety values
and the absence of existing child safety infrastructure as the pitch: Phosra offers Perplexity a way to
deliver on its safety commitments without building a parental control system from scratch.
```
