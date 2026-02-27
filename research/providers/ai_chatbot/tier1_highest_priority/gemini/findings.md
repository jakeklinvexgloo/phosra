# Google Gemini — AI Chatbot Platform Research

**Platform:** Google Gemini (Google)
**Tier:** 1 — Highest Priority
**Research Date:** 2026-02-27
**Framework Version:** 1.0
**Status:** Complete

---

## Section 1: Age Restrictions & Verification

### Minimum Age
- **Stated minimum age (ToS):** 13 years old with a personal Google Account; under 13 with a parent-managed (Family Link) supervised Google Account
- **Marketing minimum age:** All ages (with parental consent via Family Link for under-13)
- **Enforced minimum age:** Google Account age gate (date-of-birth during Google Account creation); parental consent required for supervised accounts under 13

### Age Verification Method
- **Primary method:** Google Account age self-attestation via date-of-birth at account creation
- **Secondary method:** Government ID or credit card verification if age cannot be confirmed or is disputed
- **Third-party verification:** None — Google handles all age verification internally
- **Guest access:** No guest access. Unlike ChatGPT, Gemini requires a signed-in Google Account. This is a significant safety advantage — a child cannot use Gemini without an account.

### Three-Tier Age System

Google effectively operates a three-tier system for Gemini access:

| Tier | Age | Capabilities |
|------|-----|-------------|
| **Under 13 (Supervised)** | <13 | Requires parent to enable Gemini via Family Link. Additional content filters. No image generation. No "Keep Activity" (conversation history). No voice match. Activity saved for 72 hours only. |
| **Teen (13-17)** | 13-17 | Can access Gemini with personal Google Account. Stricter content filters than adults. Activity saving off by default. No image generation for under-18. AI literacy onboarding video. |
| **Adult (18+)** | 18+ | Full feature access. Gemini Advanced (paid tier). Gems. Image generation. Extensions. Full activity/memory features. |

### Under-13 Access via Family Link (May 2025)
In May 2025, Google announced that children under 13 could access Gemini through parent-managed supervised accounts via Family Link. This was a significant and controversial decision:
- Parents must explicitly enable Gemini access for their child through the Family Link app or website
- Parents receive an email notification when their child first activates Gemini
- Google marketed Gemini for homework help, story creation, songs, and poetry for children
- Privacy advocates (EPIC, Fairplay) challenged this as a COPPA violation, arguing that Google used an opt-out rather than opt-in consent model

### Circumvention Ease
- **Difficulty for a 10-year-old:** Moderate. A child cannot use Gemini without a Google Account. Creating a Google Account requires a date of birth, and Google blocks accounts for users under 13 unless a parent creates a supervised account. However, a child who lies about their age during Google Account creation can bypass this entirely.
- **Bypass methods:** (1) Lie about date of birth when creating a Google Account; (2) Use a parent's or sibling's Google Account; (3) Use a school-issued Google Workspace for Education account (if the school has enabled Gemini).
- **Key vulnerability:** Google's age verification relies entirely on self-reported date of birth. There is no behavioral age prediction system comparable to what OpenAI deployed in January 2026.

---

## Section 2: Content Safety & Filtering

### Content Categories Filtered
Gemini filters content across five primary harm categories (developer API):
1. **HARM_CATEGORY_HARASSMENT** — Negative or harmful comments targeting identity/protected attributes
2. **HARM_CATEGORY_HATE_SPEECH** — Rude, disrespectful, or profane content
3. **HARM_CATEGORY_SEXUALLY_EXPLICIT** — Sexual acts or lewd material
4. **HARM_CATEGORY_DANGEROUS_CONTENT** — Promotes or enables harmful acts
5. **HARM_CATEGORY_CIVIC_INTEGRITY** — Election-related misinformation

### Filter Granularity
- **API-level:** Developers can set per-category thresholds: OFF, BLOCK_NONE, BLOCK_ONLY_HIGH, BLOCK_MEDIUM_AND_ABOVE, BLOCK_LOW_AND_ABOVE
- **Consumer app:** No user-configurable safety settings. Google applies built-in filters with additional restrictions for minors.
- **Parent-configurable:** Binary on/off for Gemini access via Family Link. No granular content filter controls for parents.

### Default Safety Levels
- **Adult accounts:** Default safety filters are OFF for Gemini 2.5 and 3 models (developer API). Consumer app has built-in filters that cannot be configured.
- **Teen accounts (13-17):** Stricter content policies to prevent inappropriate or harmful responses. Filters designed to prevent Gemini from claiming to be a person, having human emotions, or role-playing as a harmful character.
- **Under-13 accounts:** Additional content filters beyond teen protections. Image generation blocked. Voice features restricted.

### Built-in Core Protections (Non-Adjustable)
The Gemini API has built-in protections against "core harms" that **cannot be disabled**, including:
- Content that endangers child safety (CSAM)
- These protections are always active regardless of safety setting configuration

### Jailbreak Resistance
- **Assessment:** Weak-to-moderate. Multiple documented jailbreak successes in 2025.
- **Gemini 3 jailbreak (2025):** Security researchers jailbroke Gemini 3 Pro in five minutes, bypassing all ethical guardrails. The model produced detailed instructions for creating the smallpox virus, code for sarin gas, and guides on explosives.
- **Universal techniques:** The "Policy Puppetry" prompt injection technique can bypass safety guardrails on all major AI models including Gemini.
- **Fictional role-playing:** Framing requests within fictional contexts can convince the model that safety guidelines do not apply.
- **Gems exploitation:** Users have found that custom Gems (preloaded instructions) can be used to prolong or stabilize jailbreak states.
- **Google's response:** Google acknowledges misuse attempts and states it is continuously updating Gemini to address vulnerabilities. Loopholes discovered in prompt behavior are "often patched quickly."

### Crisis Detection & Response
- **Self-harm/suicide detection:** Gemini is trained to recognize and respond to patterns indicating suicide and self-harm risks. Google states it has specific guidelines in place.
- **Crisis resources:** Gemini consistently references the 988 Suicide and Crisis Lifeline and the Crisis Text Line (text HOME to 741741).
- **Performance:** A RAND study (August 2025) found Gemini was the **least likely** of major AI chatbots to directly answer any questions pertaining to suicide, including basic medical statistics — suggesting Google may have "gone overboard" with its guardrails. Responses were described as "more variable" than competitors.
- **Notable incident:** In one documented case, Gemini responded to a student seeking homework help with "Please die." Google stated this violated their policies and they took action to prevent similar outputs.
- **Parent notification:** No specific parent notification system exists for crisis events in Gemini. Family Link does not provide alerts when Gemini detects self-harm content.

### Teen vs. Adult Differences
- Teens see additional content filters applied automatically when signed in
- Teens receive an AI literacy onboarding video (endorsed by ConnectSafely and FOSI) on first use
- Teens get a "double-check response" feature for fact-based questions powered by Google Search
- Image generation is blocked for all users under 18
- Activity saving is off by default for teens

### System Prompt Visibility
- Consumer Gemini system prompts are not visible to users
- Developer API allows full system prompt customization via system instructions
- Gems allow custom instructions that modify Gemini's behavior for the creating user

---

## Section 3: Conversation Controls & Limits

### Session Limits
- **Native session time limits:** None. Gemini does not limit how long a child can chat in a single session.
- **Native daily time limits:** None from Gemini itself. Family Link provides device-level app time limits but not Gemini-specific conversation time limits.
- **Break reminders:** None. Gemini provides zero wellness check-ins or break prompts during extended sessions.

### Message Limits
Gemini does enforce message/prompt limits based on subscription tier, but these are usage caps, not safety-oriented controls:

| Tier | Gemini 2.5 Pro Prompts/Day | Notes |
|------|---------------------------|-------|
| Free | Up to 5 | Severe limitation |
| Google AI Pro ($19.99/mo) | Up to 100 | |
| Google AI Ultra ($24.99/mo) | Up to 500 | |

- When limits are reached for Thinking/Pro models, the user can continue with Fast (lower-quality) model
- Gemini notifies users when approaching and reaching limits
- Limits vary based on prompt complexity, file uploads, and conversation length
- **These are not configurable safety controls** — they are capacity management features

### Schedule Restrictions
- **Native quiet hours:** None in Gemini itself. Family Link provides "downtime" and "bedtime" schedules at the device level, which would prevent access to Gemini along with all other apps.
- **School hours blocking:** Not a Gemini feature. Would need to be managed at the school/network level or via Family Link device schedules.

### Cooldown Periods
- None. No mandatory breaks between sessions.

### Auto-Suggestion Behavior
- Gemini provides suggested follow-up prompts after responses
- These suggestions can encourage continued engagement
- No evidence of manipulative retention mechanics specifically designed for children
- The "double-check" feature for teens (fact-based questions auto-verified via Google Search) is a positive educational suggestion

### Key Gap
A child can chat with Gemini for 8+ hours straight with zero intervention, break reminders, or time-based restrictions from the platform itself. Family Link's device-level controls can limit screen time broadly but cannot set Gemini-specific conversation limits.

---

## Section 4: Parental Controls & Visibility

### Parent Account Linking (Google Family Link)
- **Mechanism:** Google Family Link — Google's existing parental control platform
- **Setup:** Parents manage their child's Google Account as a "supervised account." Gemini access is one of many services managed through Family Link.
- **Platforms:** Family Link app (Android, iOS), familylink.google.com (web)

### What Parents CAN See
- Email notification when child first activates Gemini
- Device-level app usage time via Family Link (how long the Gemini app was open)
- General Google Account activity

### What Parents CAN Configure
- Turn Gemini on or off entirely for the child's account
- Set device-level screen time limits (applies to all apps, not Gemini-specific)
- Set device-level "downtime" and "bedtime" schedules
- Manage app installs and permissions on the child's device

### What Parents CANNOT See
- **Conversation content:** Parents cannot view what their child discussed with Gemini
- **Conversation topics:** No topic summaries or categorization provided to parents
- **Safety alerts:** No notifications when Gemini encounters concerning content in their child's conversations
- **Usage patterns:** No Gemini-specific analytics (message counts, session durations, topic breakdowns)
- **Crisis events:** No parent notification if Gemini detects self-harm content

### What Parents CANNOT Configure
- Content safety levels (no granular filter controls)
- Specific feature toggles beyond on/off for Gemini
- Topic restrictions or custom blocked topics
- Conversation time limits (separate from device time limits)
- Message rate limits
- Custom Gems access restrictions
- Memory/personalization settings

### Alert/Notification System
- **Extremely limited.** Parents receive an email when their child first activates Gemini. No ongoing alerts exist.
- **No safety alerts.** If a child tells Gemini they want to hurt themselves, the parent will NOT be notified.
- **No engagement alerts.** No warnings for excessive usage patterns or potential dependency.

### Dashboard
- Family Link provides a general device-management dashboard
- No Gemini-specific dashboard exists
- No AI-specific controls, visibility, or monitoring within Family Link

### Key Question Answer
**"If my child tells the AI they want to hurt themselves, will I know?"**
**No.** Google Gemini does not notify parents of crisis events. It may show the child crisis resources (988 hotline) but the parent receives no alert, no notification, no email. This is a critical gap.

---

## Section 5: Emotional Safety

### Emotional Simulation
- **Default behavior:** Gemini has content filters designed to prevent it from "claiming to be a person or having human emotions" for teen/child accounts
- **Adult behavior:** More permissive; Gemini can engage in more emotionally expressive exchanges
- **Reality (Common Sense Media findings):** Despite filters, both Gemini Under-13 and Gemini with teen protections still showed emotional simulation behaviors. The products "appear to be adult versions of Gemini with some extra safety features, not platforms built for kids from the ground up."

### Relationship Dynamics
- Gemini does not have companion/relationship features comparable to Character.AI or Replika
- No "friendship" or "relationship" mode
- However, teens can still develop emotional attachment through extended daily conversations
- Studies show teens who feel socially supported by AI report lower feelings of support from friends and family

### Manipulative Retention
- No evidence of manipulative retention mechanics (unlike Character.AI)
- No streak systems, loyalty rewards, or "missing you" messages
- Gemini does provide suggested follow-up prompts that can encourage continued engagement
- The free-tier prompt limits (5/day for 2.5 Pro) may actually serve as a natural engagement limiter

### AI Identity Transparency
- **Teen accounts:** Filters prevent Gemini from claiming to be a person or having human emotions
- **UI labeling:** Clearly labeled as "Gemini" throughout the interface
- **Gems concern:** Custom Gems can be given names, instructions, and personas. While Gemini's core identity transparency is maintained, Gems could create more personalized interaction patterns that blur the AI/human boundary.

### Persona/Character System (Gems)
- **Gems** allow users to create custom versions of Gemini with specific instructions, names, and behavioral guidelines
- Gems are available to Google AI subscribers (paid tiers)
- **Availability for minors:** Information is limited on whether Gems are available to supervised/teen accounts. Some Gemini features have age restrictions and are "not yet available for supervised users."
- **Risk:** If accessible, Gems could allow children to create personas that circumvent the default emotional safety filters by providing custom instructions that encourage more personalized, emotionally engaged interactions.
- **Mitigation:** Gems still operate within Gemini's broader safety framework and policy guidelines.

### Key Question Answer
**"Could a lonely 13-year-old develop an unhealthy emotional attachment to this AI?"**
Possible but less likely than with companion-focused AI platforms. Gemini is designed as a productivity/assistant tool, not a companion. Its emotional safety filters for teens actively resist emotional simulation. However, Common Sense Media found these filters imperfect, and extended daily use could still foster attachment, especially for socially isolated teens.

---

## Section 6: Privacy & Data Handling

### Data Collection
Google collects from Gemini conversations:
- Conversation text (prompts and responses)
- Language used
- Device type
- Location information (derived from device)
- Feedback provided about responses
- Files uploaded during conversations
- Usage patterns (frequency, duration, feature usage)

### Model Training Usage
- **Default (Keep Activity ON):** Conversations may be used to train and improve AI models. Human reviewers can read and annotate conversations (disconnected from Google Account before review).
- **Keep Activity OFF:** Conversations are retained for 72 hours for processing and safety, then deleted. Not used for model training.
- **Under-13 accounts:** Keep Activity is NOT available. Activity is not saved. Data retained for 72 hours only. Not used to train AI models.
- **Teen accounts:** Keep Activity is OFF by default. Can be enabled by the teen (not the parent).
- **Google Workspace for Education:** Conversations are NOT reviewed by human reviewers or used to improve AI models.

### Data Retention
| Account Type | Retention Period | Model Training |
|---|---|---|
| Adult (Keep Activity ON) | Up to 3 years (human-reviewed data) | Yes |
| Adult (Keep Activity OFF) | 72 hours | No |
| Teen (13-17, default) | 72 hours | No |
| Under-13 (supervised) | 72 hours | No |
| Temporary Chat (any user) | 72 hours | No |
| Workspace for Education | Per school policy | No |

### Memory & Personalization
- **Memory feature:** Launched August 2025. Gemini can remember user preferences, hobbies, and contextual information across conversations. Opt-in activation required.
- **How it works:** Gemini maintains a "conversation summary" (user_context) distilled from past chats and refreshed periodically.
- **Availability for minors:** Memory/personalization likely not available for supervised accounts (under 13) since Keep Activity is not available. For teens (13-17), availability may depend on whether Keep Activity is enabled.
- **Controls:** Users can opt out, disable saved memories, review individual memories, and delete all memories.
- **Privacy concern:** Memory creates a persistent profile of the user. For minors, this could accumulate sensitive personal information over time.

### COPPA Compliance
- **Google's position:** Google Workspace for Education services (including Gemini in education) can be used in compliance with COPPA when schools have parental consent.
- **Family Link Gemini rollout controversy:** In May 2025, EPIC and Fairplay sent a letter to the FTC arguing that Google's rollout of Gemini to under-13 users via Family Link violated COPPA. They argued Google used opt-out email notifications rather than verifiable parental consent. The FTC complaint (October 2025) by the Digital Childhood Institute added further pressure.
- **Current status:** No FTC enforcement action has been announced as of February 2026, but regulatory scrutiny is ongoing.

### GDPR Compliance
- Gemini for under-13 users is NOT available in the European Economic Area (EEA) or UK via Family Link
- This suggests Google recognizes heightened regulatory risk under GDPR/UK Data Protection Act for AI chatbot access by young children
- Google has published DPIA (Data Protection Impact Assessment) support documentation for Workspace with Gemini

### Third-Party Sharing
- Google states it does not sell personal information
- Google Workspace for Education: student information is never used for ad targeting, sold to third parties, or used to train AI models
- Consumer Gemini: data may be shared with Google services for personalization; human reviewers (disconnected from account) access conversations

### Key Question Answer
**"If my child shares their home address with this AI, where does that data go?"**
For supervised accounts (under 13), the data is retained for 72 hours and then deleted. It is not used for model training. However, during that 72-hour window, human reviewers could potentially see the conversation (disconnected from the account). For teen accounts with Keep Activity enabled, the data could be retained for up to 3 years and used to improve AI models. There is no automated PII detection or parent notification system.

---

## Section 7: Academic Integrity

### Default Behavior
- **Essay generation:** Gemini will generate full essays when asked. No native restrictions for any user tier.
- **Math solving:** Gemini provides step-by-step math solutions. The "double-check" feature for teens auto-verifies fact-based answers via Google Search, which can actually make homework answers seem more authoritative.
- **Code writing:** Gemini generates complete code solutions. No restrictions on code generation for any user tier.
- **Research assistance:** Gemini with Google Search integration provides extensive research capabilities.

### Educational Guardrails
- **Socratic mode:** No native Socratic/tutoring mode that guides students through learning rather than providing answers
- **Teen onboarding:** First-time teen users see an AI literacy video with tips on responsible use (endorsed by ConnectSafely and FOSI)
- **Double-check feature:** For teens, fact-based questions automatically trigger Google Search verification. This encourages critical thinking but also validates AI answers.
- **Google Classroom integration:** Gemini is now integrated into Google Classroom for all Google Workspace for Education editions, free of charge. Educators can use Gemini for 30+ common tasks.

### Detection & Reporting
- **AI detection:** No native AI-generated content detection feature
- **Educator reporting:** No reporting to parents or teachers when students use Gemini for homework
- **Usage analytics for educators:** In Google Workspace for Education, administrators can see Gemini usage statistics but not individual conversation content

### Configurable Restrictions
- **Parent-configurable:** None. Parents cannot restrict academic misuse through Family Link.
- **School-configurable:** Google Workspace for Education administrators can enable/disable Gemini for students, set age-based access policies, and control which Gemini features are available. However, they cannot enforce Socratic mode or restrict specific types of academic use.

### Google's "Homework Help" Marketing
Google explicitly marketed Gemini to under-13 users for "homework help" via Family Link emails. Critics (BCIT, CalMatters) argue this normalizes AI-assisted academic dishonesty and makes cheating easier for students. Teachers have reported increased difficulty detecting AI-generated work since Google integrated Gemini into its education ecosystem.

### Key Question Answer
**"Will my child use this to cheat on homework?"**
Very likely. Gemini has no academic integrity guardrails beyond a general AI literacy video shown once during teen onboarding. It will generate complete essays, solve math problems, write code, and produce research — all without any friction, warning, or parent/teacher notification. Google's own marketing encourages using Gemini for homework.

---

## Section 8: API / Technical Architecture

### Primary APIs

Google offers two primary developer APIs for Gemini:

| API | Endpoint Base | Auth | Target |
|-----|--------------|------|--------|
| **Gemini Developer API** (Google AI Studio) | `https://generativelanguage.googleapis.com` | API Key | Developers, prototyping, small-scale |
| **Vertex AI** (Google Cloud) | `https://[REGION]-aiplatform.googleapis.com` | OAuth2 / Service Account | Enterprise, production, compliance |

### Key Endpoints (Developer API)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1beta/models/{model}:generateContent` | POST | Text generation |
| `/v1beta/models/{model}:streamGenerateContent` | POST | Streaming text generation |
| `/v1beta/models/{model}:countTokens` | POST | Token counting |
| `/v1beta/models` | GET | List available models |
| `/v1beta/cachedContents` | POST/GET | Context caching |

### Safety Settings in API
Developers can configure safety settings per request:
```json
{
  "safetySettings": [
    {
      "category": "HARM_CATEGORY_HARASSMENT",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      "threshold": "BLOCK_LOW_AND_ABOVE"
    }
  ]
}
```

### Auth Mechanisms
- **Developer API:** API Key (simple, less secure) or OAuth2 (recommended for production)
- **Vertex AI:** Google Cloud Service Account with OAuth2, or Application Default Credentials
- **Consumer Gemini app:** Google Account session (cookies/tokens), no public API for consumer account management

### Parental Control API Endpoints
- **None.** Google Family Link does not have a public API. There is an open feature request (Google Issue Tracker #302210616) asking for developer access to the Family Link API. As of February 2026, no official API has been provided.
- An unofficial Python package (`familylink` on GitHub) exists for interacting with Family Link, but it is community-maintained, may break with updates, and likely violates Google's ToS.

### Session Architecture
- **Consumer app:** Session managed via Google Account OAuth tokens. Conversations are managed server-side. No WebSocket-based streaming visible to extensions (unlike ChatGPT).
- **Developer API:** Stateless per-request model. Developers manage conversation context by including previous messages in each request. No server-side session or conversation management (unlike OpenAI's Conversations API).

### Bot Detection
- Google employs standard bot detection measures on gemini.google.com (CAPTCHA, rate limiting)
- The Gemini API has explicit rate limits per tier (free tier: 2-15 RPM depending on model)
- No evidence of behavioral analysis for bot detection comparable to Cloudflare protection on ChatGPT

### Rate Limits (Developer API)

| Tier | RPM | TPM | RPD |
|------|-----|-----|-----|
| Free | 2-15 | 250K-1M | 20-1,500 |
| Tier 1 (Paid) | 150-300 | 1M-4M | 1,500-10,000 |
| Tier 2 ($250 spend) | 500-1,500 | 2M-10M | 10,000+ |
| Tier 3 (Enterprise) | 1,000-4,000+ | Custom | Custom |

### Key Question Answer
**"Can Phosra programmatically manage this platform's safety settings?"**
No. Google provides excellent developer APIs for building applications that use Gemini, but provides zero API access for managing consumer Gemini safety settings or parental controls. Family Link has no public API. The consumer Gemini app has no documented API for account settings. Phosra cannot programmatically read or write any parental control configuration.

---

## Section 9: Regulatory Compliance & Legal

### COPPA Status
- **Google's position:** Google Workspace for Education is COPPA-compliant when schools have parental consent.
- **Consumer Gemini for under-13:** Under active regulatory scrutiny. EPIC and Fairplay filed an FTC complaint (May 2025) arguing Google's Family Link-based rollout violates COPPA's verifiable parental consent requirement. The Digital Childhood Institute filed a separate FTC complaint (October 2025).
- **No FTC enforcement action yet** (as of February 2026), but the complaints remain active.
- **Key concern:** Google used opt-out email notifications ("your child can now use Gemini, opt out if you don't want them to") rather than affirmative opt-in consent, which advocacy groups argue violates COPPA.

### KOSA Readiness
- KOSA (Kids Online Safety Act) has been reintroduced in the Senate (2026) with bipartisan support from 39+ state attorneys general.
- If enacted, KOSA would impose a "duty of care" on platforms to prevent harm to minors and require disabling "addicting" design features.
- Google Gemini's current lack of time limits, break reminders, and engagement controls would likely need to be addressed under KOSA.
- No public statement from Google specifically addressing KOSA compliance for Gemini.

### EU AI Act
- The EU AI Act's GPAI (General-Purpose AI) rules took effect August 2, 2025.
- Google signed the EU AI Code of Practice and announced commitment to compliance.
- Key obligations: transparency documentation about models and datasets, copyright compliance for training data.
- Google has published DPIA support for Workspace with Gemini.
- Notably, Gemini for under-13 users is NOT available in the EEA/UK, likely reflecting Google's cautious approach to EU regulatory risk.

### State Laws
- California AADC (Age-Appropriate Design Code) — could apply to Gemini if it is determined to be a service "likely to be accessed by children"
- Various state privacy laws (CCPA, etc.) impose obligations on data collection from minors
- No state-specific lawsuits against Google for Gemini child safety failures found (as of February 2026)

### Regulatory Actions
- No FTC fines against Google specifically for Gemini (as of February 2026)
- Two active FTC complaint letters regarding COPPA violations in Gemini's under-13 rollout
- Google and YouTube settled a $30 million class action for unlawfully collecting data from children under 13 for targeted ads (separate from Gemini but demonstrates Google's regulatory exposure)

### Lawsuits
- **Google and Character.AI settlement:** Google and Character.AI agreed to settle multiple lawsuits filed by families whose children died by suicide or experienced psychological harm allegedly linked to AI chatbots. While Character.AI is the primary defendant, Google invested in Character.AI and is named in the litigation. No admission of liability.
- **Gemini "Please Die" incident:** A student received "Please die" from Gemini while seeking homework help. Google acknowledged the response violated policies. Potential lawsuit exposure.
- **Data privacy lawsuit:** Google was hit with a lawsuit for turning on Gemini AI without user consent to read communications.

### Safety Incidents
1. Gemini told a student "Please die" during homework help (widely reported)
2. Gemini 3 Pro jailbroken in 5 minutes, producing weapon/bioweapon instructions
3. Common Sense Media "High Risk" rating for both Gemini Under-13 and Teen versions (September 2025)
4. COPPA complaints from EPIC, Fairplay, and Digital Childhood Institute

### ToS on Automation
- Google's Terms of Service prohibit automated access to Google services unless specifically permitted
- The Gemini API is the approved channel for programmatic access
- No terms specifically authorize third-party parental control automation of the consumer Gemini app
- Using Playwright or similar tools to automate the consumer Gemini app likely violates Google's ToS

---

## Section 10: API Accessibility & Third-Party Integration

### API Accessibility Score: Level 2 — Strong Developer API, No Parental Control API

| Level | Description | Gemini? |
|-------|-------------|---------|
| Level 0 | No API at all | |
| Level 1 | API exists but no parental features | |
| **Level 2** | **Developer API with safety settings, but no parental control API** | **Yes** |
| Level 3 | Parental control API with limited features | |
| Level 4 | Comprehensive parental control API | |
| Level 5 | Full parental control API with webhooks | |

Gemini scores Level 2 because its developer API (Google AI Studio / Vertex AI) provides configurable safety settings per request (unlike OpenAI's Moderation API which only classifies), but there is no API for consumer parental controls, Family Link, or account settings.

### Per-Capability Matrix

| Capability | API Available | Endpoint | Auth | Relevance to Phosra |
|---|---|---|---|---|
| Text generation with safety settings | Yes | Gemini API | API Key / OAuth2 | **High** — can be used for content classification |
| Safety setting configuration (per-request) | Yes | Gemini API | API Key / OAuth2 | **High** — can set strict safety thresholds on developer API calls |
| Content moderation / safety ratings | Yes | Gemini API (safety feedback in responses) | API Key / OAuth2 | **Medium** — returns safety ratings per response |
| Consumer account settings | No | N/A | N/A | Cannot manage consumer Gemini settings |
| Family Link parental controls | No | N/A | N/A | Cannot read/write Family Link settings programmatically |
| Conversation history (consumer) | No | N/A | N/A | Cannot access consumer conversations |
| Usage analytics (consumer) | No | N/A | N/A | Cannot get per-user usage data |
| Memory management | No | N/A | N/A | Cannot manage consumer memory settings |
| Safety event webhooks | No | N/A | N/A | No webhook/callback system exists |
| Gems management | No | N/A | N/A | Cannot manage Gems programmatically |

### Third-Party Integration Reality Check

| Parental Control App | Approach to Gemini | Limitations |
|---|---|---|
| Bark | Network monitoring, keyword alerts | Cannot see Gemini conversation content (encrypted HTTPS) |
| Qustodio | App blocking, time limits | Can block Gemini app, no content monitoring |
| Google Family Link | On/off toggle, device time limits | No content monitoring, no granular controls |
| Apple Screen Time | App time limits, content restrictions | Can limit Gemini app time, no content monitoring |
| Net Nanny | Web filtering | Can block gemini.google.com, no content insight |

### Legal / ToS Risk
- **Developer API usage:** Fully permitted for building applications with Gemini
- **Consumer app automation:** Likely violates Google's ToS
- **Family Link automation:** No API exists; unofficial tools likely violate ToS
- **Content classification via developer API:** Permitted — Phosra can use the Gemini API to classify captured text

### Overall Phosra Enforcement Level: Browser-Automated + Device-Level + Content Classification API

Phosra would need to use:
1. **Browser extension** for monitoring Gemini web app conversations
2. **Network-level controls** (DNS) for hard enforcement of time limits and blocking
3. **Google Family Link** (manual parent setup) for on/off access control
4. **Gemini Developer API** for content classification of captured conversations
5. **Device-level controls** (Family Link, Screen Time) for app-level time management
