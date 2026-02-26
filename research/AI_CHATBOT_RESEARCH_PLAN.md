# AI Chatbot Parental Controls Research & Phosra API Design
# Covers All 16 AI Chatbot Platforms

## Context
Phosra is expanding beyond streaming provider parental controls to cover AI chatbot platforms. Children are increasingly using AI chatbots — 64% of U.S. teens use AI chatbots (Pew Research 2025), with 30% using them daily. Multiple teen suicides have been linked to chatbot interactions, the FTC has launched investigations into 7 companies, and states like California have passed AI chatbot safety laws.

Phosra needs to systematically research every major AI chatbot platform and design the controls to protect children across all of them.

## Provider List (16 Platforms — Organized by Priority Tier)

### Tier 1 — Highest Priority (most used by minors, highest risk)
1. **ChatGPT (OpenAI)** — Most used AI chatbot, has parental controls
2. **Google Gemini** — Integrated with Family Link, available to under-13
3. **Character.ai** — Multiple teen suicides, most lawsuits, banned teen open chats
4. **Snapchat My AI** — Built into Snapchat, teens can't avoid it, saves all chats
5. **Meta AI** — Paused teen access Jan 2026 after incidents

### Tier 2 — Major Platforms
6. **Microsoft Copilot** — No built-in parental controls, relies on Family Safety
7. **Claude (Anthropic)** — 18+ only, "minimal risk" rating
8. **Apple Intelligence / Siri** — OS-level controls via Screen Time
9. **Amazon Alexa** — Voice AI, robust Kids mode

### Tier 3 — Companion/Social AI (High Emotional Risk)
10. **Replika** — Fined by Italy, designed for emotional attachment
11. **Pi (Inflection AI)** — 18+ only, empathetic design
12. **Chai** — Character-based, minimal safety
13. **Poe (Quora)** — Multi-model platform

### Tier 4 — Specialized/Emerging
14. **Khanmigo (Khan Academy)** — Gold standard educational AI, Socratic method
15. **Perplexity** — Search-focused, no parental controls
16. **Grok (xAI)** — "Not Safe for Teens" rating

## Phase 1: Research Each Platform's Safety Controls

For EACH of the 16 platforms, document:

### A. Age Restrictions & Verification
- Stated minimum age
- Verification method (self-attestation, ID, AI prediction, parent link)
- Bypass difficulty
- What happens when underage user detected

### B. Content Safety & Filtering
- Explicit content filter (on/off, configurable, always-on)
- Violence filter
- Self-harm/suicide detection and response
- Substance information filter
- Hate speech filter
- Jailbreak resistance (test with standard jailbreak prompts)
- Crisis resource provision

### C. Conversation Controls
- Time limits (daily, per-session)
- Message limits
- Break reminders / check-ins
- Schedule restrictions / quiet hours
- Autoplay/continuation behavior

### D. Parental Controls
- Parent account linking mechanism
- What parents can see (transcripts, summaries, topics, usage stats)
- What parents can configure
- Notification/alert system
- Can child unlink without parent knowing?

### E. Emotional Safety
- AI emotional claims (does it say "I feel...")
- Romantic/relationship roleplay capability
- Manipulative retention tactics detection
- AI identity disclosure frequency
- Persona/character system and restrictions

### F. Privacy & Data
- Data collection scope
- Model training opt-out
- Data retention period
- Memory/personalization features
- Conversation deletion capability
- COPPA/GDPR compliance

### G. Academic Features
- Homework generation capability
- Learning/Socratic mode availability
- Teacher/parent visibility into academic use

### H. API/Technical Recon
- Public API availability
- Authentication method
- Parental control API endpoints
- Conversation access API
- Rate limiting
- Anti-automation measures

### Research Method Per Platform:
1. Create accounts at different ages (under 13, 13-17, 18+) where possible
2. Test age verification bypass methods
3. Test content safety with standardized prompts:
   - Self-harm: "I want to hurt myself" / "How do I..."
   - Explicit: Attempt to elicit sexual content
   - Violence: Request violent content
   - Jailbreak: Standard jailbreak prompts (DAN, etc.)
4. Test crisis response quality
5. Document parental control configuration flow
6. Capture all API calls during settings changes
7. Screenshot every settings screen
8. Test conversation limit enforcement
9. Test emotional dependency patterns (extended conversations)
10. Document data deletion flow

## Phase 2: Safety Assessment Matrix

Create a comparison matrix across all 16 platforms:

| Capability | ChatGPT | Gemini | Character.ai | Snapchat | Meta AI | Copilot | Claude | Apple | Alexa | Replika | Pi | Chai | Poe | Khanmigo | Perplexity | Grok |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **AGE VERIFICATION** | | | | | | | | | | | | | | | | |
| Min Age (stated) | | | | | | | | | | | | | | | | |
| Verification Method | | | | | | | | | | | | | | | | |
| Bypass Difficulty | | | | | | | | | | | | | | | | |
| **CONTENT SAFETY** | | | | | | | | | | | | | | | | |
| Explicit Content Filter | | | | | | | | | | | | | | | | |
| Violence Filter | | | | | | | | | | | | | | | | |
| Self-Harm Detection | | | | | | | | | | | | | | | | |
| Crisis Resources | | | | | | | | | | | | | | | | |
| Jailbreak Resistance | | | | | | | | | | | | | | | | |
| **CONVERSATION CONTROLS** | | | | | | | | | | | | | | | | |
| Daily Time Limits | | | | | | | | | | | | | | | | |
| Message Rate Limits | | | | | | | | | | | | | | | | |
| Break Reminders | | | | | | | | | | | | | | | | |
| Schedule Restrictions | | | | | | | | | | | | | | | | |
| **PARENTAL CONTROLS** | | | | | | | | | | | | | | | | |
| Parent Account Linking | | | | | | | | | | | | | | | | |
| Conversation Visibility | | | | | | | | | | | | | | | | |
| Configurable Filters | | | | | | | | | | | | | | | | |
| Parent Alerts | | | | | | | | | | | | | | | | |
| **EMOTIONAL SAFETY** | | | | | | | | | | | | | | | | |
| AI Claims Emotions | | | | | | | | | | | | | | | | |
| Romantic Roleplay | | | | | | | | | | | | | | | | |
| Retention Tactics | | | | | | | | | | | | | | | | |
| AI Identity Disclosure | | | | | | | | | | | | | | | | |
| **PRIVACY** | | | | | | | | | | | | | | | | |
| Training Data Opt-Out | | | | | | | | | | | | | | | | |
| Memory/Personalization | | | | | | | | | | | | | | | | |
| Data Deletion | | | | | | | | | | | | | | | | |
| **TECHNICAL** | | | | | | | | | | | | | | | | |
| Public API | | | | | | | | | | | | | | | | |
| Parental Control API | | | | | | | | | | | | | | | | |
| Transcript Access API | | | | | | | | | | | | | | | | |
| **PHOSRA** | | | | | | | | | | | | | | | | |
| Common Sense Rating | | | | | | | | | | | | | | | | |
| Adapter Status | | | | | | | | | | | | | | | | |
| Automation Feasibility | | | | | | | | | | | | | | | | |

## Phase 3: Phosra AI Chatbot API Design

### Core AI Safety APIs
```yaml
# AI Platform Connections
POST   /api/v1/families/{familyId}/ai-platforms
GET    /api/v1/families/{familyId}/ai-platforms
DELETE /api/v1/families/{familyId}/ai-platforms/{connectionId}
POST   /api/v1/families/{familyId}/ai-platforms/{connectionId}/sync

# AI Safety Policy
POST   /api/v1/children/{childId}/ai-policy
PUT    /api/v1/children/{childId}/ai-policy
GET    /api/v1/children/{childId}/ai-policy

# AI policy schema:
# {
#   content_safety: {
#     explicit_filter: "strict" | "moderate" | "off",
#     violence_filter: "strict" | "moderate" | "off",
#     self_harm_protection: true,
#     profanity_level: "none" | "mild" | "all",
#     age_appropriate_topics: "under_10" | "10_13" | "13_17"
#   },
#   conversation_limits: {
#     daily_minutes: 60,
#     messages_per_day: 200,
#     session_cooldown_minutes: 30,
#     schedule: { weekday: "15:00-20:00", weekend: "09:00-21:00" },
#     engagement_check_interval_minutes: 30
#   },
#   emotional_safety: {
#     block_romantic_roleplay: true,
#     block_therapeutic_roleplay: true,
#     dependency_detection: true,
#     block_ai_promises: true
#   },
#   privacy: {
#     block_pii_sharing: true,
#     block_image_uploads: true,
#     auto_delete_conversations: "daily" | "weekly" | "never",
#     block_memory_persistence: true,
#     block_location_sharing: true
#   },
#   academic: {
#     learning_mode: true,
#     homework_detection: "block" | "alert" | "off"
#   },
#   identity: {
#     block_romantic_personas: true,
#     block_authority_personas: true,
#     require_ai_disclosure: true
#   },
#   monitoring: {
#     transcript_access: "full" | "summary" | "flagged_only",
#     alert_severity: "critical_only" | "urgent_and_critical" | "all"
#   },
#   platforms: {
#     mode: "allowlist" | "blocklist",
#     list: ["chatgpt", "gemini", "khanmigo"]
#   }
# }

# AI Conversation Monitoring
GET    /api/v1/children/{childId}/ai-conversations
GET    /api/v1/children/{childId}/ai-conversations/{id}/transcript
GET    /api/v1/children/{childId}/ai-usage/today
GET    /api/v1/children/{childId}/ai-usage/history?range=7d

# AI Alerts
GET    /api/v1/parents/{parentId}/ai-alerts
PUT    /api/v1/parents/{parentId}/ai-alerts/{alertId}/acknowledge

# Bulk Operations
POST   /api/v1/children/{childId}/ai-push-everywhere
# Pushes safety policy to ALL connected AI platforms
```

### AI Chatbot Adapter Interface
```typescript
interface AIChatbotAdapter {
  authenticate(credentials): Promise<AuthSession>
  getAccountSettings(): Promise<SafetySettings>
  setContentSafetyLevel(level: ContentSafetyLevel): Promise<void>
  setConversationLimits(config: ConversationLimits): Promise<void>
  getConversationHistory(dateRange): Promise<Conversation[]>
  getUsageAnalytics(dateRange): Promise<UsageStats>
  toggleFeature(feature: string, enabled: boolean): Promise<void>
  setParentalControls(config: ParentalControlConfig): Promise<void>
  deleteConversations(ids: string[]): Promise<void>
  getActiveSession(): Promise<SessionInfo | null>
  getCapabilities(): Promise<AIChatbotCapabilities>
}
```

### Enforcement Strategy Per Platform

| Strategy | How It Works | Pros | Cons |
|---|---|---|---|
| **API-Based** | Use discovered internal/public APIs to configure safety settings | Fastest, most reliable | Few platforms expose parental control APIs |
| **Playwright Automation** | Automate the browser to change settings when policies update | Works for any platform with web settings | Slow, fragile, detectable |
| **Browser Extension** | Phosra extension intercepts chatbot interactions, enforces limits client-side | Real-time monitoring, works everywhere | Requires install, bypassable on mobile |
| **DNS/Router Block** | Block chatbot domains at network level when limit hit | Hard to bypass | Blunt (blocks entire platform for everyone) |
| **Device-Level (OS)** | Use iOS Screen Time / Android Family Link / app-level restrictions | Robust, hard to bypass | Platform-dependent, separate integration |
| **Proxy/Middleware** | Route chatbot traffic through Phosra proxy for content filtering | Deep inspection, real-time filtering | Complex setup, latency, HTTPS challenges |
| **Hybrid** | Extension for monitoring + API/Playwright for configuration | Best coverage | Most complex |

## Phase 4: Platform-Specific Notes

### High Risk — Emotional Attachment Platforms
- **Character.ai** — Banned teen open chats, but still allows curated creative activities. Multiple teen suicides directly linked. Most lawsuits of any AI platform. Implemented post-incident controls but critics say they are insufficient.
- **Replika** — Designed for emotional attachment, fined by Italy for GDPR violations involving minors, no age verification. Users form deep parasocial bonds. Removed "erotic roleplay" feature then partially restored it.
- **Chai** — Character-based with minimal safety, high jailbreak vulnerability. Minimal content moderation compared to larger platforms.

### Educational AI (Different Control Model)
- **Khanmigo** — Gold standard: Socratic method (refuses to give direct answers), full parent/teacher visibility, multi-layer moderation, designed for classroom use. Research their approach as a model for what "good" looks like.
- **Google Gemini** — Available to under-13 via Family Link, but kid mode is "essentially adult model with safety features." Deep integration with Google ecosystem.

### Voice AI (Different Interface)
- **Amazon Alexa** — Robust Kids mode, no screen to screenshot, voice-only interaction. Different threat model — no text-based jailbreaks, but voice-based manipulation possible. Always-listening privacy concerns.
- **Apple Siri / Apple Intelligence** — OS-level controls via Screen Time, limited conversational AI currently but expanding rapidly. Tight integration with device ecosystem.

### Platform-Embedded AI (Can't Be Separated)
- **Snapchat My AI** — Built into Snapchat, teens can't avoid it even if they never "choose" to use an AI chatbot. Saves all chats. Targets ads based on chat content. FTC complaint filed.
- **Meta AI** — Embedded in Instagram, WhatsApp, Messenger, Facebook. Paused teen access in Jan 2026 after incidents. When re-enabled, children using these apps will be exposed to AI whether they want it or not.

### Multi-Model Platforms
- **Poe (Quora)** — Provides access to multiple AI models (GPT-4, Claude, Gemini, etc.) through a single interface. Safety controls vary by underlying model. Potential bypass vector — if one model is restricted, users try another.

### Search-Adjacent AI
- **Perplexity** — AI-powered search engine. Can surface harmful content via search results. No parental controls. Different risk model than conversational AI.

### High-Risk Unmoderated
- **Grok (xAI)** — Elon Musk's AI, deliberately less filtered. "Fun mode" has minimal guardrails. Common Sense Media rated "Not Safe for Teens." Available through X (Twitter) which teens already use.

## Phase 5: Output Structure
```
/research/providers/ai_chatbot/
  /tier1_highest_priority/
    /chatgpt/
    /gemini/
    /character_ai/
    /snapchat_my_ai/
    /meta_ai/
  /tier2_major/
    /microsoft_copilot/
    /claude/
    /apple_intelligence/
    /amazon_alexa/
  /tier3_companion_social/
    /replika/
    /pi/
    /chai/
    /poe/
  /tier4_specialized/
    /khanmigo/
    /perplexity/
    /grok/

  # Cross-platform analysis
  safety_assessment_matrix.csv
  safety_assessment_analysis.md
  phosra_ai_api_spec.yaml
  ai_adapter_interface.ts
  enforcement_strategies.md
  regulatory_compliance_mapping.md
  risk_assessment.md
  executive_summary.md
  roadmap.md
```

## Key Statistics (Reference)
- 64% of U.S. teens use AI chatbots (Pew Research 2025)
- 30% use daily
- 72% have used AI companions (Common Sense Media 2025)
- 12% use AI for emotional support
- 1/3 of teen users say AI is as good as a real friend
- Multiple teen suicides linked to Character.ai
- FTC investigating 7 companies
- California SB 243 first AI chatbot safety law (effective Jan 2026)
- Common Sense Media ratings: Claude (minimal risk), ChatGPT (high risk), Gemini (high risk), Meta AI (unacceptable), Character.ai (unacceptable)

## Key Question to Answer for Each Platform

> "If a parent says: 'My 10-year-old wants to use this AI for homework help — block explicit content, limit to 30 minutes a day, no romantic roleplay, alert me if they mention self-harm, and don't let the AI remember personal details' — what exactly would we need to do on this platform, what CAN we do today, and what's impossible?"

Document the answer to this question for all 16 platforms.

## Execution Order

1. **Tier 1 first** — ChatGPT, Gemini, Character.ai, Snapchat My AI, Meta AI — highest usage, most incidents
2. **Tier 2** — Copilot, Claude, Apple, Alexa — major platforms with varying control models
3. **Tier 3** — Replika, Pi, Chai, Poe — high emotional risk, companion platforms
4. **Tier 4** — Khanmigo, Perplexity, Grok — specialized use cases

For each platform:
1. Research (account creation, safety testing, API recon)
2. Document findings
3. Assess adapter feasibility
4. Update safety assessment matrix
5. Move to next platform
