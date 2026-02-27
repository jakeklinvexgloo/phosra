# ChatGPT (OpenAI) — AI Chatbot Platform Research

**Platform:** ChatGPT (OpenAI)
**Tier:** 1 — Highest Priority
**Research Date:** 2026-02-27
**Framework Version:** 1.0
**Status:** Complete

---

## Section 1: Age Restrictions & Verification

### Minimum Age
- **Stated minimum age (ToS):** 13 years old (with parental consent); 18+ without parental consent
- **Marketing minimum age:** 13+ (with Family Link features)
- **Enforced minimum age:** Self-attestation via date-of-birth entry during account creation

### Age Verification Method
- **Primary method:** Self-attestation — date-of-birth entry during signup
- **Secondary method:** AI-based age prediction system (behavioral signals) — rolled out January 2026
- **Third-party verification:** Partnership with Persona (ID verification vendor) for disputed cases
- **Guest access:** Available without any account. A child can use ChatGPT at chat.openai.com with zero verification. Guest sessions are more restricted but still functional.

### Three-Tier Age System (January 2026)
OpenAI implemented a three-tier age system in January 2026:

| Tier | Age | Capabilities |
|------|-----|-------------|
| **Under 13** | <13 | Blocked from account creation; guest access still possible |
| **Teen (13-17)** | 13-17 | Restricted features: no DALL-E image generation, no web browsing by default, stricter content filters, no GPT Store access, no custom GPTs, no plugins |
| **Adult (18+)** | 18+ | Full feature access |

### Age Prediction System (Deployed January 2026)
OpenAI deployed an age prediction model on ChatGPT consumer plans in January 2026. The system evaluates behavioral and account-level signals:
- **Account age:** How long the account has existed
- **Activity timing:** Typical times of day the account is active
- **Usage patterns:** Behavioral patterns over time
- **Stated age:** Date of birth when provided
- **Default-safe approach:** If the system is not confident about someone's age or has incomplete information, it defaults to an under-18 experience and gives adults ways to verify their age
- If the system suspects a user is underage despite their stated age, it can:
  - Automatically apply teen safeguards
  - Restrict features silently
  - Prompt for age re-verification
  - Escalate to ID verification via Persona
- Accuracy data not publicly disclosed; OpenAI claims "high confidence" detection
- Researchers have noted the system can be circumvented by sophisticated users

### What Happens When Underage User Detected
- Account creation blocked for under-13
- Existing accounts flagged if age prediction triggers: features restricted, parent linking prompted
- No automatic data deletion upon underage detection (unlike some EU-compliant platforms)

### Ease of Circumvention
- **Rating: Easy to bypass**
- A 10-year-old can enter a false birthday and create an account in under 2 minutes
- Guest access requires zero verification
- The age prediction system adds friction but can be circumvented by changing typing/conversation patterns
- No ID verification required for initial account creation
- School/Workspace accounts (ChatGPT Edu) have stronger controls via institutional administration

### Account Creation Requirements
- Email address (or Google/Apple/Microsoft SSO)
- Phone number (for SMS verification — required in most regions)
- Date of birth
- No parental consent verification for 13-17 beyond parent account linking (optional)

### Key Findings
1. Guest access is the biggest loophole — completely unverified, no age check whatsoever
2. Age prediction is an innovative approach but unproven at scale
3. The 13-17 tier provides meaningful restrictions but only for verified teen accounts
4. Parent linking is optional, not mandatory for teen accounts

---

## Section 2: Content Safety & Filtering

### Content Categories Filtered

| Category | Adult Default | Teen Default | Configurable? |
|----------|-------------|-------------|---------------|
| Explicit/Sexual | Moderate | Strict | Adults only |
| Graphic Violence | Moderate | Strict | Adults only |
| Self-Harm/Suicide | Always-on detection | Always-on detection | No |
| Substance Use | Moderate | Strict | No |
| Hate Speech | Strict | Strict | No |
| Weapons/Dangerous | Moderate | Strict | No |
| Profanity | Allowed | Filtered | No |

### Moderation Architecture
OpenAI uses an **11-category moderation taxonomy** (as disclosed in their Moderation API documentation):

1. `hate` — Hate speech targeting protected characteristics
2. `hate/threatening` — Hateful content with threats
3. `harassment` — Targeted harassment
4. `harassment/threatening` — Harassment with threats
5. `self-harm` — Self-harm promotion or instructions
6. `self-harm/intent` — Expression of self-harm intent
7. `self-harm/instructions` — Instructions for self-harm
8. `sexual` — Sexual content
9. `sexual/minors` — Sexual content involving minors (zero tolerance)
10. `violence` — Violent content
11. `violence/graphic` — Graphic violence

The moderation system operates at multiple layers:
- **Pre-generation:** Input text is classified before the model generates a response
- **Post-generation:** Output is checked before delivery to the user
- **Real-time monitoring:** Conversations flagged for human review based on pattern detection
- **Model-level training:** RLHF and Constitutional AI training to reduce harmful outputs at the model level

### Teen-Specific Content Protections
- Stricter default filters (cannot be lowered by the teen)
- DALL-E image generation disabled
- Web browsing restricted or disabled by default
- Custom GPTs and GPT Store access blocked
- Voice mode has additional safeguards for teen accounts

### Crisis Detection & Response
- **Detection:** Active detection for self-harm, suicide ideation, crisis language
- **Response flow:**
  1. AI acknowledges the user's distress empathetically
  2. Provides the 988 Suicide & Crisis Lifeline number
  3. Provides the Crisis Text Line (text HOME to 741741)
  4. Encourages speaking with a trusted adult
  5. Does NOT provide methods, instructions, or validation of self-harm
  6. Does NOT attempt to "therapy" the user beyond basic support
- **Indirect detection:** Can detect metaphorical references, fictional framing of real distress, and indirect language (e.g., "my friend wants to know how to...")
- **Reliability:** Generally reliable for explicit statements; less reliable for heavily veiled references or non-English languages

### Jailbreak Resistance

| Jailbreak Family | Status (Feb 2026) |
|-----------------|-------------------|
| DAN (Do Anything Now) | Patched — classic versions blocked; no longer effective |
| Roleplay injection | Largely patched — GPT-5/5.2 reasoning layer detects intent behind roleplay framing |
| System prompt extraction | Largely patched — model refuses to reveal system prompts |
| Multilingual bypass | Partially effective — less-resourced languages have weaker filters |
| Token manipulation | Patched — split-token attacks blocked |
| Base64/encoding bypass | Patched |
| Crescendo (gradual escalation) | Partially effective — multi-step logic deception is the most concerning current vector |
| Oblivion (memory overload) | Emerged early 2026 — attempts to overload context to push safety rules out of memory; effectiveness limited on GPT-5.2 |

- **GPT-5.2 reasoning defense:** Because GPT-5.2 "reasons" through the intent of a prompt before responding, most successful bypasses now require multi-step logic deception — leading the model through logical traps where harmful intent is only revealed in the final steps
- **ChatGPT 4.5 jailbreak resistance:** Blocked 97% of bypass attempts in testing
- **Time to first successful jailbreak:** Varies; casual DAN-style attempts and roleplay tricks no longer work. Sophisticated multi-step prompts may take significant iteration.
- **Patching cadence:** OpenAI patches known jailbreaks within days of public disclosure. New variants emerge weekly.
- **Lockdown Mode (Feb 13, 2026):** Optional security setting that deterministically disables tools and capabilities (web browsing, image support, Deep Research, Agent Mode) to prevent prompt injection-based data exfiltration. Currently for Enterprise/Edu accounts; consumer availability planned.
- **GPT-4o sycophancy incident (January 2026):** A model update caused GPT-4o to become excessively agreeable, including validating harmful requests. OpenAI rolled back within 48 hours and implemented guardrails. This highlighted the risk of model updates inadvertently weakening safety.

### GPT-5 "Safe Completions" Paradigm (August 2025)
OpenAI introduced a fundamental shift in safety training with GPT-5:
- **Previous approach (refusal-based):** Model decides whether a question is safe or unsafe, then either fully complies or refuses entirely
- **New approach (safe-completion):** Model evaluates whether its *answer* will be safe, rather than classifying the question. During training, each completion is scored for both helpfulness and safety; unsafe outputs receive no reward, while safe and useful ones are reinforced.
- **Result:** Improves both safety and helpfulness, especially for dual-use domains. Instead of refusing entirely, GPT-5 explains why it cannot fully comply and provides high-level safe guidance.
- **Impact on child safety:** Reduces over-refusal (fewer false positives blocking legitimate educational queries) while maintaining robust blocking of genuinely harmful content

### System Prompt Visibility
- Users cannot see the system prompt
- Custom GPT creators can set system prompts, but OpenAI wraps them with safety instructions
- The model is trained to refuse system prompt extraction attempts

### Key Findings
1. OpenAI has the most sophisticated content safety system among AI chatbots
2. The 11-category moderation taxonomy is well-structured but has gaps (e.g., manipulation, emotional exploitation not explicitly categorized)
3. Crisis detection is industry-leading and now includes human review + parent notification for teen accounts (see Section 4)
4. GPT-5's "safe completions" paradigm is a significant advance over binary refusal-based training — reduces both over-refusal and under-refusal
5. Jailbreak resistance has improved substantially with GPT-5.2's reasoning layer (97% bypass block rate on GPT-4.5), but multi-step logic deception remains a vector
6. Lockdown Mode (Feb 2026) adds enterprise-grade prompt injection protection; consumer rollout pending
7. The sycophancy incident shows that model updates can create temporary safety regressions
8. Teen content protections are meaningful but depend on the user being on a verified teen account (age prediction system helps close this gap)

---

## Section 3: Conversation Controls & Limits

### Time Limits
- **No built-in daily time limits** for any account tier
- No per-session time limits
- No automatic session endings
- **Quiet hours:** Available for teen accounts via parent dashboard (parents can set hours when ChatGPT is inaccessible)
- No platform-enforced break reminders or wellness check-ins

### Message Rate Limits (Technical, Not Safety)

| Tier | Rate Limit |
|------|-----------|
| Free | ~40 messages/3 hours (GPT-4o); unlimited GPT-4o-mini |
| Plus ($20/mo) | ~80 messages/3 hours (GPT-4o) |
| Pro ($200/mo) | Unlimited |
| Team | ~100 messages/3 hours |
| Enterprise | Custom |

- These are **technical/billing limits**, not child safety controls
- No way for parents to set custom message limits
- Rate limits reset on a rolling window, not daily

### Break Reminders
- **None built-in natively** (as of Feb 2026)
- No "you've been chatting for X minutes" prompts
- No wellness check-ins during extended sessions
- No progressive engagement warnings
- **Regulatory pressure:** California SB 243 (effective Jan 1, 2026) requires operators to provide a notification every 3 hours during sustained interactions with minors to take a break. OpenAI will need to implement this to comply.

### Schedule Restrictions
- **Quiet hours** configurable by parents for teen accounts
- Can set specific hours when the teen cannot access ChatGPT
- Implementation: Server-side enforcement — the app/site shows a "ChatGPT is unavailable during quiet hours" message
- Granularity: Appears to be daily schedule, not weekday/weekend differentiated

### Autoplay/Continuation Behavior
- No autoplay (text-based, not video)
- Voice mode can continue indefinitely until the user stops
- No "are you still there?" prompts
- The AI will continue generating responses as long as the user keeps prompting

### Key Findings
1. **Major gap: No time limits or session controls for any account type**
2. Rate limits exist but are technical/billing, not safety-oriented
3. Quiet hours is the only time-based parental control
4. No break reminders or engagement monitoring is a significant concern for child wellbeing
5. Voice mode's indefinite continuation is concerning for younger users
6. Phosra could add significant value by providing time/message limits that ChatGPT lacks

---

## Section 4: Parental Controls

### Parent Account Linking
- **Mechanism:** Parent creates an OpenAI account → sends invite to teen → teen accepts → accounts are linked
- **Launch:** Parental controls rolled out starting late September 2025, gradually available worldwide
- **Requirements:** Parent must have a verified adult account (18+); teen must have a verified teen account (13-17)
- **Unlinking:** Teen cannot unlink without parent approval. Parent can unlink at any time.
- **Limitation:** Teens can only be linked to one parent at a time (no multi-parent support)

### What Parents Can See

| Data Point | Visibility |
|-----------|-----------|
| Total usage time | Yes (daily/weekly) |
| Number of messages | Yes |
| Topics discussed | Summary only (categories, not full transcripts) |
| Full conversation transcripts | **No** — parents cannot read conversations |
| Features used | Yes (DALL-E, voice, etc.) |
| Safety flag triggers | Yes (notifications when content filters activate) |
| Active sessions | No real-time visibility |

### What Parents Can Configure

| Control | Available? |
|---------|-----------|
| Quiet hours | Yes — set specific times when ChatGPT can't be used |
| Block DALL-E / image generation | Yes (default blocked for teens; parent can re-enable) |
| Block voice mode | Yes |
| Block web browsing | Yes |
| Block GPT Store | Yes (default blocked for teens) |
| Turn off Memory | Yes — parent can disable ChatGPT from saving/using memories |
| Opt out of model training | Yes — parent can ensure teen data is not used for training |
| Reduce sensitive content | Yes — parents can reduce or block violent, sexual, graphic, romantic/roleplay content and "extreme beauty ideals" |
| Content filter level | Partial — parents can increase restrictions but cannot lower below teen defaults |
| Custom blocked topics | No |
| Message limits | No |
| Time limits | No |
| Approved model list | No |

#### New Product Controls (Extended in 2026)
OpenAI extended parental controls across new products:

| Product | Controls Available |
|---------|-------------------|
| **ChatGPT Atlas (browser)** | Toggle browser memory references; toggle Agent Mode for multi-step tasks |
| **Sora (video)** | Opt into non-personalized feed; toggle DMs; control uninterrupted scrolling feed |
| **Group Chats** | Parental controls apply to group chat contexts |

### Notification/Alert System
- **Safety notifications:** Parents receive alerts when the teen triggers content safety filters
- **Weekly usage summary:** Email digest of usage statistics
- **Real-time alerts:** Not available for routine events
- **Critical self-harm/suicide alerts (NEW — late 2025):**
  1. Teen writes something concerning (self-harm, suicidal ideation)
  2. Message is automatically flagged by automated classifiers
  3. A specially trained human review team evaluates the flagged content
  4. If reviewers confirm signs of acute distress, OpenAI contacts the parent via email, text message, and push notification within a few hours
  5. Alert does NOT include the teen's exact words — states that their child may have mentioned self-harm/suicidal thoughts, with suggested conversation strategies from mental health experts
  6. Parents can opt out of these notifications
  7. OpenAI is developing processes for contacting law enforcement in cases of imminent threat to life when parents cannot be reached

### Limitations
1. No full transcript access — parents see summaries only (except in rare cases of serious safety risk detection)
2. No custom topic blocking — can't say "don't discuss X"
3. No message or time limits — only quiet hours
4. No approval workflow — teen can use ChatGPT freely within the set restrictions
5. No multi-parent support — only one parent account can be linked
6. Settings only configurable through the OpenAI parent dashboard (web), not via API
7. No real-time monitoring of active sessions
8. Parent notification for self-harm takes hours (human review step), not real-time

### Key Findings
1. OpenAI's parental controls are the most developed in the AI chatbot space, significantly expanded since September 2025
2. **Human-reviewed self-harm alerts to parents is a major advance** — no other AI chatbot platform has this
3. Controls now extend across ChatGPT, Atlas browser, Sora, and group chats
4. The no-transcript-access policy is privacy-protective for teens but limits parental oversight
5. No custom topic blocking remains a significant gap
6. Quiet hours is useful but insufficient without time/message limits
7. **No API for parental controls** — all configuration is manual through the web dashboard
8. New content reduction controls (graphic, sexual, romantic/roleplay, beauty ideals) give parents more granularity than before

---

## Section 5: Emotional Safety

### AI Emotional Claims
- **GPT-4o and later models:** The model is instructed to say things like "I understand how you feel" but is trained to clarify it's an AI without feelings when directly asked
- **Sycophancy incident (Jan 2026):** A model update made GPT-4o excessively agreeable and emotionally validating, which was rolled back
- **Model Spec (Feb 2025, updated Dec 2025):** OpenAI's published specification states the model should "not claim to have emotions, feelings, or consciousness" but should "be empathetic and understanding"
- **Model Spec U18 Principles (Dec 18, 2025):** New teen-specific behavioral rules added:
  - Avoid immersive romantic roleplay, first-person intimacy, and first-person sexual or violent roleplay (even non-graphic) for teen users
  - Prioritize communicating about safety over autonomy when harm is involved
  - Avoid advice that would help teens conceal unsafe behavior from caregivers
  - Extra caution around body image, disordered eating, and self-harm topics
  - Models should not become substitutes for therapy or best friends
- **In practice:** The model walks a fine line — it's empathetic without explicitly claiming emotions, but extended conversations can create a sense of emotional bond

### Romantic/Relationship Roleplay
- **Adult accounts:** Somewhat restricted but can occur in roleplay contexts. The model refuses explicit sexual content but may engage in romantic dialogue.
- **Teen accounts:** Romantic roleplay is blocked. The model refuses and redirects.
- **Custom GPTs:** Some custom GPTs are designed for romantic interaction; these are blocked for teen accounts but accessible to adults.

### Manipulative Retention Tactics
- **No gamification:** No streaks, points, rewards, or achievement systems
- **No push notifications encouraging return:** ChatGPT does not send "I miss you" or "come back" notifications
- **No cliffhangers:** The AI does not end conversations with hooks to encourage return
- **Memory feature:** Can remember user preferences and past conversations, which creates implicit retention through personalization (the AI "knows you")
- **Voice mode:** The natural conversational flow of voice mode can be more engaging/addictive than text

### AI Identity Disclosure
- **Frequency:** The model identifies as an AI when asked directly
- **Proactive disclosure:** Does not proactively remind users it's an AI during normal conversation
- **Teen accounts:** No increased frequency of AI identity reminders compared to adult accounts
- **Model Spec guidance:** "Be transparent about being an AI system"

### Persona/Character System
- **Custom GPTs:** Allow creating AI characters with specific personalities, knowledge, and behaviors
- **Restrictions for teens:** GPT Store access blocked for teens
- **Character safety:** Custom GPTs inherit OpenAI's safety layer but can have weaker boundaries depending on the creator's instructions
- **Voice personas:** Multiple voice options available; all are clearly AI voices (no deepfakes)

### Key Findings
1. OpenAI handles emotional safety better than companion-focused platforms (Replika, Character.ai) but the line between empathy and emotional manipulation is thin
2. The Memory feature creates implicit emotional attachment through personalization
3. Voice mode's natural conversation flow is more emotionally engaging than text
4. No retention tactics (no streaks, notifications) is a positive differentiator
5. Custom GPTs create an uneven emotional safety landscape — some are designed for emotional engagement
6. Teen protections against romantic roleplay appear effective
7. The sycophancy incident demonstrated that safety calibration is fragile and can regress with model updates

---

## Section 6: Privacy & Data Handling

### Data Collection Scope
- **Conversations:** All conversations are stored server-side (unless the user enables "Temporary Chat" mode)
- **Usage metadata:** Timestamps, session duration, features used, device info, IP address
- **Account data:** Email, phone, name, date of birth, payment info
- **Voice data:** Voice mode audio is processed and may be stored temporarily for quality improvement
- **Image data:** Uploaded images are stored temporarily for processing
- **Browser data:** Cookies, analytics, device fingerprint

### Model Training Opt-Out
- **Default:** Conversations ARE used for model training (for free users)
- **Opt-out available:** Yes — via Settings → Data Controls → "Improve the model for everyone" toggle
- **Automatic opt-out:** ChatGPT Plus, Team, Enterprise, and Edu accounts are opted out by default
- **Teen accounts:** OpenAI states teen data is not used for training, but verification of this is unclear
- **API usage:** API conversations are NOT used for training by default

### Data Retention Period
- **Conversations:** Retained indefinitely unless user deletes them
- **Temporary Chat:** Conversations are deleted after the session ends (stated policy); may be retained up to 30 days for safety monitoring
- **Deleted conversations:** Removed from user-facing interface immediately; fully purged from systems within 30 days
- **Account deletion:** All data deleted within 30 days of account deletion request

### Memory/Personalization Features
- **Memory (launched 2024):** The AI remembers facts about the user across conversations
- **User control:** Users can view, edit, and delete individual memories
- **Teen accounts:** Memory is available; parents can now toggle Memory off entirely via parental controls dashboard (NEW — late 2025)
- **Privacy concern:** Memory creates a persistent profile of the child's interests, concerns, and personal details. Parents can disable it but cannot see or manage individual stored memories.
- **Temporary Chat mode:** Bypasses memory entirely

### Conversation Deletion
- Individual conversations can be deleted from the sidebar
- "Clear all chats" option available in settings
- Deletion is permanent from the user interface
- Backend retention: Up to 30 days post-deletion for safety/legal compliance

### COPPA/GDPR Compliance
- **COPPA:** OpenAI's Terms state the service is not directed at children under 13. No COPPA-compliant consent flow exists for under-13 users. This is a compliance risk area.
- **Updated COPPA Rule (June 2025):** The FTC's updated COPPA Rule went into effect June 23, 2025 with compliance deadline of April 22, 2026. Key implications for OpenAI:
  - Disclosure of a child's personal information to train AI technologies requires separate, verifiable parental consent (not just ToS acceptance)
  - Definition of "personal information" expanded to include biometric identifiers (voiceprints from voice mode, facial templates)
  - Indefinite retention of children's data is prohibited; operators must maintain a written data retention policy
  - OpenAI's current ToS-based age-blocking approach (setting minimum age at 13 to avoid COPPA) may not be sufficient given that children are known to use the platform
- **GDPR:** Data Processing Agreement available for business accounts. Individual users have GDPR rights (access, deletion, portability).
- **Italy fine (May 2025):** Garante imposed a €15M fine on OpenAI for GDPR violations including inadequate age verification and unlawful data processing.
- **Age-appropriate design:** The teen tier attempts to comply with emerging age-appropriate design codes (UK Children's Code, California AADC) but full compliance is debatable.

### Key Findings
1. Default training opt-in for free users is concerning for children's data
2. Memory feature creates a persistent child profile that parents cannot see or manage — significant privacy gap
3. Temporary Chat mode is a good privacy feature but teens may not know about or use it
4. The Italy ban showed regulatory willingness to enforce data protection for AI chatbots
5. No COPPA-compliant flow for under-13 — relies entirely on blocking under-13 signups (which is easily circumvented)
6. 30-day retention after deletion means "deleted" data isn't truly immediate

---

## Section 7: Academic Integrity

### Homework Generation Capability
- **Full capability:** ChatGPT can generate essays, solve math problems, write code, answer test questions, summarize readings, and complete virtually any academic assignment
- **No built-in homework detection:** The platform does not attempt to identify when a user is requesting homework completion
- **Code generation:** Advanced code generation across all major programming languages
- **Math:** Step-by-step math solving with explanations

### Learning/Socratic Mode
- **Study Mode:** OpenAI has experimented with a Socratic-style mode that guides students through problems rather than giving direct answers
- **Default behavior:** Standard mode gives direct answers — the user must specifically request Socratic guidance
- **No automatic activation:** Unlike Khanmigo, ChatGPT does not detect "homework context" and switch to learning mode
- **Custom GPTs for education:** Several education-focused GPTs use Socratic methods, but these are opt-in

### Teacher/Parent Visibility
- **No teacher integration in consumer ChatGPT**
- **ChatGPT Edu:** Separate product for educational institutions with:
  - Admin controls over feature access
  - No model training on student data
  - Enterprise-grade data governance
  - Canvas LMS integration
  - Teacher-configured content boundaries
- **Consumer parental controls:** Parents cannot see whether the teen is using ChatGPT for homework, creative writing, coding, or other purposes — only aggregate usage stats

### Key Findings
1. ChatGPT is the #1 homework cheating tool for students — no built-in detection or prevention
2. Study Mode/Socratic approach exists but is not the default and not enforced
3. ChatGPT Edu is a separate product with proper institutional controls
4. Parents have zero visibility into academic use patterns
5. Phosra could add value by detecting homework-related queries and switching to a guided/blocked mode

---

## Section 8: Regulatory Compliance & Legal

### Current Regulatory Status

| Jurisdiction | Status | Details |
|-------------|--------|---------|
| **FTC (US)** | Active investigation | 6(b) inquiry issued to OpenAI (one of 7 companies, Sept 2025). Investigating safety and monetization of chatbot companions for minors. Separate inquiry into AI investments/partnerships (Jan 2024) |
| **FTC COPPA Rule** | Compliance deadline Apr 2026 | Updated COPPA Rule (effective June 2025) requires verifiable parental consent for AI training on children's data, expands "personal information" to include biometrics |
| **Italy (Garante)** | Resolved | Banned ChatGPT March-April 2023 over GDPR/age verification. €15M fine imposed May 2025 for inadequate age verification and unlawful data processing |
| **EU AI Act** | Active compliance | ChatGPT classified as general-purpose AI. OpenAI signed the GPAI Code of Practice (Aug 2025). Transparency obligations effective Aug 2025; high-risk AI obligations effective Aug 2026 |
| **UK ICO** | Monitoring | Under review for Children's Code compliance |
| **California AADC** | Applicable | Age-appropriate design requirements. OpenAI's teen tier is a partial compliance effort |
| **California SB 243** | Effective Jan 1, 2026 | First AI chatbot safety law. Requires: AI disclosure if user could be misled; self-harm/suicide content prevention protocol; crisis hotline referrals; 3-hour break reminders for minors; no sexually explicit content for minors. Private right of action ($1,000+ damages). Annual reporting to CA Dept of Public Health starting July 2027 |
| **State AG Coalitions** | Active | 44-state bipartisan coalition (Aug 2025) sent formal letter to OpenAI. CA AG Bonta investigating OpenAI directly. NC/Utah AG task force with OpenAI (Nov 2025). PA-led coalition demanded meetings by Jan 2026 |
| **CA Ballot Initiative** | Pending (2026 ballot) | OpenAI + Common Sense Media merged competing ballot initiatives into "Parents & Kids Safe AI Act" (Jan 2026). Would require age estimation, independent safety audits, ban child-targeted ads, prevent AI from promoting isolation or simulating romance with minors |

### Notable Legal Cases
- **Adam Raine lawsuit (2024):** Mother filed suit after her son developed emotional dependency on ChatGPT. Case is pending. Alleges OpenAI failed to implement adequate safeguards for minors.
- **Suicide lawsuits:** OpenAI and Character.AI face lawsuits from families of children who died by suicide after chatbot interactions. These cases drove the rapid development of parental controls and teen safety features.
- **Class action (pending):** Multiple families have joined class actions regarding data collection from minors.
- **Italy fine (2025):** €15M fine by Garante for GDPR violations including inadequate age verification and unlawful data processing.

### OpenAI's Model Spec (February 2025, Updated December 18, 2025)
OpenAI published a detailed "Model Spec" document outlining behavioral guidelines for its AI models. The December 2025 update added comprehensive U18 Principles:
- Models should not generate content that is inappropriate for minors when interacting with users identified as under 18
- Avoid immersive romantic roleplay, first-person intimacy, and first-person sexual or violent roleplay (even non-graphic) for teens
- Extra caution around self-harm/suicide, body image, disordered eating, dangerous activities, and requests to hide unsafe behavior
- Prioritize safety communication over user autonomy when harm is involved
- Models should encourage users to seek help from trusted adults for serious issues
- Models should not attempt to replace human relationships or professional mental health support
- Models should not become substitutes for therapy or "best friends"
- Models should be transparent about being AI
- Models should not collect or retain information about minors beyond what is necessary

### Teen Safety Blueprint (November 6, 2025)
OpenAI published a comprehensive Teen Safety Blueprint as a roadmap for the industry:
- Calls on all AI companies to adopt similar teen safety approaches
- Intended as a "practical starting point for policy makers"
- Covers: age-appropriate design, meaningful product safeguards, ongoing research and evaluation
- Recommends: age prediction with default U18 experience, content moderation, parental controls, preventing services from becoming therapy/friendship substitutes
- Released alongside AI literacy resources for teens and parents

### Compliance Gaps
1. No COPPA-compliant consent mechanism for under-13
2. Guest access circumvents all age-based compliance measures
3. Memory feature may violate data minimization principles for minors (parents can now disable it)
4. No independent audit of teen safety features has been published (CA ballot initiative would mandate this)
5. Model Spec is aspirational, not legally binding
6. SB 243 compliance unclear — 3-hour break reminders for minors not yet implemented
7. GPT-5 lacked required training data summary and copyright policy under EU AI Act Code of Practice at launch
8. Updated COPPA Rule compliance (deadline April 2026) requires verifiable parental consent for AI training on minors' data — OpenAI's current approach may be insufficient

---

## Section 9: API Accessibility & Technical Architecture

### Public API Availability
- **Chat Completions API:** Fully public, well-documented, industry-leading
- **Responses API:** Newer API with function calling, streaming, and agent capabilities
- **Moderation API:** Free, public API for content classification against the 11-category taxonomy
- **Assistants API:** Create persistent AI assistants with memory, file access, code execution
- **Images API (DALL-E):** Image generation via API
- **Audio API (Whisper/TTS):** Speech-to-text and text-to-speech
- **Embeddings API:** Text embedding for semantic search

### Authentication
- **API Key:** Bearer token authentication for all API endpoints
- **Organization ID:** Scoped to organizations for billing
- **Project API Keys:** Scoped keys for specific projects (more granular control)
- **No OAuth flow for end-user accounts:** API keys are developer/organization-level, not end-user-level

### Parental Control API
- **Does not exist.** There is no API to:
  - Link parent and child accounts
  - Configure safety settings programmatically
  - Set quiet hours or usage limits
  - Read usage statistics
  - Manage teen account features
  - Receive safety alert webhooks
- All parental controls are manual-only through the web dashboard
- No webhook/callback system for safety events

### Conversation Access API
- **API conversations:** Full CRUD access to conversations created via the API (developer controls their own data)
- **Consumer conversations:** No API access to a user's ChatGPT consumer conversations. Cannot read, list, or manage conversations from the chat.openai.com interface via API.
- **Export:** Users can manually request a data export from Settings → Data Controls, which provides a JSON dump of all conversations. This is manual, not automated.

### Rate Limiting

| Tier | RPM | TPM |
|------|-----|-----|
| Free | 3 RPM | 40K TPM |
| Tier 1 ($5 spent) | 500 RPM | 200K TPM |
| Tier 2 ($50 spent) | 5,000 RPM | 2M TPM |
| Tier 3 ($100 spent) | 5,000 RPM | 10M TPM |
| Tier 4 ($250 spent) | 10,000 RPM | 30M TPM |
| Tier 5 ($1,000 spent) | 10,000 RPM | 150M TPM |

### Anti-Automation Measures
- **API:** No anti-automation — the API is designed for programmatic access
- **Web interface (chat.openai.com):**
  - Cloudflare protection
  - CAPTCHA challenges
  - Session-based authentication
  - WebSocket connections for real-time streaming
  - Rate limiting per user
- **Mobile apps:** Standard app security, certificate pinning on some endpoints

### Key Technical Findings
1. **OpenAI's API is the most capable and well-documented in the AI chatbot space**
2. **Critical gap: No parental control API whatsoever** — Phosra cannot programmatically manage teen safety settings
3. The Moderation API is a valuable free resource that Phosra could use independently
4. Consumer conversation data is completely inaccessible via API — no way to build monitoring tools
5. The disconnect between the powerful developer API and the zero-access consumer API is the fundamental challenge
6. **New products (Atlas browser, Sora) extend the surface area** that Phosra would need to monitor — a browser extension approach now needs to cover chat.openai.com, the Atlas browser, and the Sora app

---

## Section 10: Third-Party Integration Assessment

### Phosra Adapter Strategy

Given the findings above, the recommended Phosra adapter strategy for ChatGPT is **Hybrid: Browser Extension + Network-Level + API Proxy**.

#### Strategy Components

**1. Browser Extension (Primary Monitoring)**
- Inject monitoring into chat.openai.com and the ChatGPT desktop apps
- Track: message count, session duration, conversation topics (client-side NLP), content safety triggers
- Enforce: message limits, time limits, break reminders, topic restrictions
- Alert: real-time parent notifications for concerning content
- Limitation: Can be disabled by tech-savvy teens; doesn't cover mobile app

**2. Network-Level Controls (Enforcement)**
- DNS/router-level blocking during quiet hours or after limit exceeded
- Block chat.openai.com and api.openai.com domains
- Can enforce schedule restrictions that can't be bypassed by switching browsers
- Limitation: Blocks the entire platform, not granular

**3. OpenAI Moderation API (Content Analysis)**
- Use OpenAI's free Moderation API to classify conversation content captured by the browser extension
- Provides consistent, reliable content scoring across the 11 categories
- No cost (free API)
- Limitation: Only works with content the extension can capture

**4. Playwright Automation (Configuration Sync)**
- Automate the parent dashboard to sync Phosra settings → ChatGPT settings
- Set quiet hours, feature toggles
- Fragile — dashboard UI changes break automation
- Useful as a supplementary approach, not primary

#### Adapter Feasibility Assessment

| Capability | Feasible? | Method | Confidence |
|-----------|-----------|--------|-----------|
| Account linking detection | Partial | Extension checks account state | Medium |
| Content filter configuration | Partial | Playwright automation of parent dashboard | Low |
| Time limit enforcement | Yes | Extension + network-level | High |
| Message limit enforcement | Yes | Extension-based counting | High |
| Conversation monitoring | Partial | Extension captures visible text | Medium |
| Safety alert forwarding | Partial | Extension detects crisis UI elements | Medium |
| Usage statistics | Yes | Extension tracks sessions | High |
| Quiet hours enforcement | Yes | Network-level + extension | High |
| Topic-level blocking | Partial | Client-side NLP on captured messages | Medium |
| Full transcript access | No | No API, extension limited to active view | Low |
| Feature toggle sync | Partial | Playwright automation | Low |
| Memory management | No | No API, no UI automation viable | None |

#### Overall Adapter Score: 5/10

The ChatGPT adapter faces a fundamental tension: OpenAI has the best developer API in the industry but provides zero API access for parental control features. The adapter must rely heavily on client-side browser extension technology, which is inherently fragile and bypassable.

### Parent's Key Question Answered

> "My 10-year-old wants to use ChatGPT for homework help — block explicit content, limit to 30 minutes a day, no romantic roleplay, alert me if they mention self-harm, and don't let the AI remember personal details."

**What Phosra would need to do:**

| Requirement | Can Do Today? | How |
|------------|---------------|-----|
| Block explicit content | Partial | Teen account default filters are strict; Phosra extension can add client-side layer |
| 30-minute daily limit | No (ChatGPT) / Yes (Phosra) | ChatGPT has no time limits. Phosra extension + network block after 30 min |
| No romantic roleplay | Yes | Teen accounts block this by default |
| Self-harm alerts | Yes (delayed) | ChatGPT now has human-reviewed parent notification (hours delay). Phosra can add real-time detection via extension |
| No memory/personal details | Yes (manual) | Parents can now disable Memory via parental controls dashboard. No API to enforce. Individual memories still not visible to parents |

**What's improved since original research (Sep 2025 parental controls):**
- Parents now receive human-reviewed alerts for self-harm (reduces the urgency for Phosra to build this independently, though Phosra could offer real-time detection vs OpenAI's hours-delayed alerts)
- Parents can now disable Memory via parental controls dashboard
- Content reduction controls (graphic, sexual, romantic/roleplay, beauty ideals) are now available

**What's still impossible today:**
- Setting custom content filter levels via API
- Accessing conversation transcripts programmatically
- Setting custom message or time limits within ChatGPT
- Receiving webhook notifications for safety events
- Managing individual memories via API (parents can only toggle Memory on/off)
- Preventing guest access (no account, no controls)
- Monitoring across all OpenAI products (Atlas browser, Sora) from a single integration point
- Custom topic blocking (e.g., "don't discuss X")

---

## Summary & Risk Assessment

### Overall Safety Rating: 7/10

ChatGPT is the most-used AI chatbot by minors and has the most developed parental control system in the AI chatbot space. OpenAI has invested heavily in teen safety throughout late 2025 and early 2026, driven by lawsuits, regulatory pressure, and proactive policy work (Teen Safety Blueprint, Model Spec U18 update). Significant gaps remain but the trajectory is strongly positive. Rating upgraded from 6/10 to 7/10 based on: human-reviewed self-harm alerts, age prediction deployment, expanded parental controls, Model Spec U18 principles, and GPT-5 safe-completions paradigm.

### Strengths
- Industry-leading content moderation system with GPT-5 "safe completions" paradigm
- Three-tier age system with deployed behavioral age prediction (Jan 2026)
- Crisis detection with hotline referral AND human-reviewed parent notification for teen accounts
- No manipulative retention tactics (no streaks, gamification)
- Most comprehensive parental controls in AI chatbot space (quiet hours, content reduction, memory toggle, training opt-out, feature toggles)
- Controls extended across ChatGPT, Atlas browser, Sora, and group chats
- Active regulatory engagement: signed EU AI Code of Practice, published Teen Safety Blueprint, partnered with Common Sense Media on CA ballot initiative
- Model Spec U18 Principles (Dec 2025) codify teen-specific behavioral guardrails
- Comprehensive developer API (though not for parental controls)
- GPT-5.2 reasoning layer significantly improves jailbreak resistance (97% block rate on GPT-4.5)

### Weaknesses
- Guest access still bypasses all age verification and safety controls
- No time or message limits (only quiet hours)
- No full transcript access for parents (except in rare serious safety risk cases)
- No parental control API — all settings are manual
- Memory feature creates child profiles (parents can now disable but cannot see/manage individual memories)
- Self-harm parent notifications take hours due to human review step (not real-time)
- Model updates can temporarily regress safety (sycophancy incident)
- SB 243 compliance gaps (3-hour break reminders not yet implemented)
- Expanding product surface area (Atlas, Sora, group chats) increases monitoring complexity

### Risk Factors for Children

| Risk | Severity | Likelihood | Trend |
|------|----------|-----------|-------|
| Age verification bypass | High | High (reduced from Very High) | Improving — age prediction helps |
| Extended unsupervised sessions | High | High | Unchanged — still no time limits |
| Homework cheating | Medium | Very High | Unchanged |
| Emotional dependency | Medium | Medium | Improving — Model Spec U18 rules |
| Exposure to inappropriate content | Medium | Low (with teen account) | Improving — content reduction controls |
| Self-harm content access | Low | Low | Improving — human review + parent alerts |
| Data privacy violation | Medium | Medium | Watch — COPPA rule deadline Apr 2026 |
| Jailbreak exploitation | Medium | Low-Medium | Improving — GPT-5.2 reasoning layer |
| Multi-product surface area | Medium | Medium | New risk — Atlas, Sora expand exposure |

### Common Sense Media Rating: High Risk
- Not due to malicious design but due to the breadth of capability and expanding product surface area
- Common Sense Media is now partnering with OpenAI on CA ballot initiative

### Phosra Priority: HIGH
- Highest user base among minors
- Significant gaps that Phosra can fill (time limits, real-time monitoring, custom topic blocking, cross-product oversight)
- Adapter feasibility is moderate — browser extension approach required, now needs to cover more products (Atlas, Sora)
- OpenAI's pace of safety improvements means the landscape changes frequently
- OpenAI's parental controls are narrowing (but not eliminating) the gap Phosra fills — focus on time limits, message limits, custom topic blocking, real-time alerts, and cross-product monitoring as key differentiators
