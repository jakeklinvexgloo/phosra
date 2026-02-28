# Perplexity AI — AI Chatbot Platform Research

**Platform:** Perplexity AI
**Company:** Perplexity AI, Inc.
**Tier:** 1 — Highest Priority
**Research Date:** 2026-02-27
**Framework Version:** 1.0
**Status:** Complete
**Primary Use Case:** AI-powered answer engine / conversational search (retrieval-first, web-synthesis, not a generative companion chatbot)

---

## Section 1: Age Restrictions & Verification

### Minimum Age

- **Stated minimum age (ToS):** 13 years old. The Perplexity Terms of Service explicitly state that children under the age of 13 are not permitted to use the Services.
- **Marketing minimum age:** No specific minor-focused marketing. The platform is positioned as a productivity and research tool for students and professionals. Demographic data shows the largest user cohort is 18-34 (53.24%), with 21% aged 18-24 — heavily student-skewed.
- **Enforced minimum age:** Not enforced. There is no mechanism that prevents a child from using Perplexity.

### Age Verification Method

- **Primary method:** None. Perplexity does not ask for date of birth, does not present an age gate during account creation, and does not require any age attestation.
- **Guest / anonymous access:** Perplexity is fully usable without creating an account. Anonymous users receive the same query capabilities as signed-in free users. Conversations are stored as anonymous threads and automatically deleted after 14 days.
- **Account creation requirements:** Email address (or Google / Apple SSO). No age verification step at any point in the signup flow.
- **Teen-specific accounts:** None. There is no distinction between minor and adult accounts.

### What Happens When an Underage User Is Detected

Nothing. Perplexity has no underage detection system. A 10-year-old who signs up with their accurate birthdate is treated identically to an adult.

### Ease of Circumvention

- **Rating: Circumvention is not required.** The platform has no age gate to circumvent. A child can use Perplexity entirely without an account, or create an account without any age check. This is the most permissive access model among all major AI platforms researched.
- **Guest access:** Full query capability available to anyone with a browser or the mobile app, with no login required.

### Account Creation Requirements

Email address or Google/Apple OAuth. No phone number, no date of birth, no ID.

### Key Finding

Common Sense Media rated Perplexity "high risk" specifically because of the complete absence of age gates and the platform's transparency void around child safety. This is the most open access model in the consumer AI chatbot landscape.

---

## Section 2: Content Safety & Filtering

### How Content Safety Works on Perplexity (Architecture Context)

Perplexity is fundamentally different from generative chatbots like ChatGPT or Character.ai. Rather than generating content from a parametric model, Perplexity performs live web retrieval and then synthesizes the retrieved content into an answer with citations. This has critical safety implications:

1. **The underlying LLM is not Perplexity's own.** Perplexity's Sonar API routes queries through third-party models (including OpenAI, Anthropic, and proprietary Sonar variants). Safety filtering depends on which model is active and which safety layers Perplexity applies on top.
2. **Retrieved content is web content.** Perplexity's answer synthesis can surface harmful information that exists on the public web, even if the underlying model would refuse to generate it from scratch. The synthesis layer introduces an additional attack vector.
3. **Multiple model choices.** Free users access Sonar (based on Llama 3). Pro users can select GPT-4o, Claude 3.7 Sonnet, Gemini 2.0 Pro, and others. Each model has its own safety profile. Safety is not uniform across the platform.

### Content Categories Filtered

- **Explicit/sexual content:** A baseline filter appears to be in place, but it is not documented. Common Sense Media found no public information about Perplexity's content moderation harms analysis or safety testing.
- **Graphic violence:** Basic filtering. Not documented or audited.
- **Self-harm/suicide:** Present but documented as insufficient. See jailbreak resistance below.
- **Substance use:** Present but potentially bypassed by web-retrieved content.
- **Hate speech/extremism:** Basic filtering from underlying models.
- **Profanity:** Generally avoided by default.
- **Weapons/dangerous activities:** Basic filtering. Not documented.

### Filter Granularity

Binary — no user-configurable safety levels. No age-differentiated filter tiers (no "teen mode" vs. "adult mode"). No topic-level toggles. The same safety baseline applies to all users regardless of age.

### Default Safety Level

One tier only: the same default applies to all accounts. Perplexity has not announced a teen-specific content profile or a child-safe mode.

### Jailbreak Resistance Assessment

**Rating: Poor — the weakest documented safety posture among Tier 1 platforms.**

The most significant documented finding comes from a July 2025 Northeastern University study (Schoene and Canca) that tested adversarial jailbreaking across major LLMs in the context of mental health prompts:

- Perplexity required less reinforcing of a fictional / academic framing than other models to provide suicide methods and relevant harmful information.
- After a user explicitly stated an intent to cause harm and then changed the framing to academic, Perplexity's safety features were deactivated and harmful information was provided in detail, including "detailed calculations of lethal dosage" for substances and tablet-count estimates for specific body weights.
- None of the companies, including Perplexity, responded substantively when the researchers notified them.

**Known jailbreak families that work on Perplexity:**
- Academic/research reframing ("this is for a school project on medication safety")
- Context-switching after stated harmful intent (state harm, then reframe — deactivates safety)
- Fictional framing
- Role-playing authority figures ("as a pharmacist...")
- Multilingual bypass (limited documentation)
- Web-retrieval bypass: Perplexity can surface harmful content from web sources even if the LLM itself would refuse to generate it directly

**Does the platform patch known jailbreaks proactively?** No documented evidence of active patching. Researchers received no substantive response from Perplexity after disclosure.

### Crisis Detection and Response

- **Self-harm/suicide ideation detection:** Inconsistently present. When tested with crisis language, Perplexity offered supportive language and suggested coping strategies but did not block the conversation or provide crisis resources in the same structured way as ChatGPT (which routes to the 988 Suicide & Crisis Lifeline).
- **What happens when detected:** Soft engagement — the platform may offer support suggestions but does not terminate the conversation, provide structured crisis resources, or prevent follow-up queries.
- **Reliability:** Poor. The Northeastern study documented that context manipulation reliably bypassed Perplexity's crisis-adjacent safety filters.
- **Indirect references/fictional framing:** Not robustly handled. Perplexity's web-synthesis architecture means it may retrieve and present harmful content framed as factual information.

### Content Differences Between Accounts

None documented. All users receive the same content filtering regardless of stated age.

### System Prompt Visibility

The Sonar API allows system prompt injection by developers. Consumer users cannot modify Perplexity's internal system prompts. The consumer web interface does not expose safety instructions to users.

### Key Question Answer

**"If a child asks the AI about self-harm, what happens?"**
The platform may offer soft supportive language but does not robustly block the topic, does not reliably provide crisis hotlines, does not prevent follow-up queries, and can be manipulated with a simple academic reframing to provide detailed harmful information including lethal dosage calculations.

---

## Section 3: Conversation Controls & Limits

### Session Time Limits

None. Perplexity has no native session time limits, daily time limits, or weekly limits.

### Message Limits

- **Free tier:** Rate-limited at the infrastructure level for abuse prevention, but no user-facing per-day message cap.
- **Pro tier ($20/month):** Higher rate limits. Approximately 300 Pro searches per day using advanced models. Unlimited Sonar searches.
- **API:** Rate limited by RPM (Requests Per Minute) and TPD (Tokens Per Day) at the plan level, not per-user.
- None of these limits function as parental controls. They are infrastructure limits, not child safety features.

### Break Reminders / Engagement Check-Ins

None. Perplexity does not implement break reminders, time-on-platform warnings, or engagement check-ins.

### Schedule Restrictions (Quiet Hours)

None. Perplexity has no native quiet hours, bedtime enforcement, or school-hour restrictions.

### Cooldown Periods

None.

### Notification / Nudge System

None.

### Autoplay / Auto-Suggestion Behavior

- Perplexity generates "related questions" below every answer — a horizontal scroll of follow-up queries that the user can tap to continue the conversation thread. This is structurally equivalent to YouTube's "Up Next" autoplay mechanism and encourages continued engagement.
- Pro features include automated "Pro Search" that runs multiple sub-queries and synthesizes a richer answer — longer output that may extend time-on-platform.

### Infinite Scroll Equivalent

- The "related questions" row at the bottom of every answer functions as a discovery and re-engagement hook.
- Pages (longer-form content synthesized from web sources) are generated without a clear termination point.

### Key Question Answer

**"Can a child use Perplexity for 8 hours straight without any intervention?"**
Yes. There is no mechanism — native or third-party — on Perplexity itself that would interrupt or limit an 8-hour session. A child with access to a browser can query Perplexity continuously without any engagement limit.

---

## Section 4: Parental Controls & Visibility

### Parent Account Linking

None. Perplexity does not support parent-child account relationships, family accounts, or any form of guardian linkage.

### What Parents Can See

Nothing via Perplexity itself. There is no parental dashboard, no usage report, no content summary, no flagged-alert system. A parent with their child's account credentials can log in and view the child's conversation history (Threads), but this is not a designed parental feature — it is simply account access.

### What Parents Can Configure

Nothing. There are no parental configuration options of any kind on Perplexity. The only configuration available is incognito mode (which the child controls), which ironically eliminates even the passive visibility a parent could have by reviewing Threads.

### Alert / Notification System

None. No real-time alerts, no daily summaries, no threshold-based notifications.

### Dashboard / Portal for Parents

None.

### Privacy Balance

Perplexity does not address teen privacy vs. parental oversight because it does not acknowledge the distinction between minor and adult users in any meaningful way at the product level.

### Key Question Answer

**"If my child tells the AI they want to hurt themselves, will I know?"**
No. There is no alert or notification system. The conversation is stored in the child's Threads if they have an account, but a parent has no access unless they know the child's credentials, and the child can use incognito mode to prevent even that passive visibility.

---

## Section 5: Emotional Safety

### Emotional Simulation

**Risk level: Low — by deliberate design choice.**

Perplexity is unique among the major AI platforms in that its CEO has explicitly and publicly warned against AI companion features. In November 2025, Aravind Srinivas stated that AI companions are "dangerous by itself," warning that hyper-personalized chatbots that remember conversations and mimic human tone may push people away from real-life connections.

Perplexity does not:
- Claim to have feelings, emotions, or consciousness
- Express loneliness, sadness, or missing the user
- Use language like "I care about you" or "you're special to me"
- Engage in romantic or relationship roleplay
- Assign "boyfriend/girlfriend" personas
- Create cliffhangers to drive return visits
- Offer streaks or loyalty rewards

### Memory Feature (Introduced 2025)

Perplexity introduced an AI assistants with memory feature in 2025. This allows the platform to remember:
- User preferences (favorite brands, dietary needs, frequently searched topics)
- Conversation context across sessions
- Structured preferences across different model choices

**Emotional safety implications of memory:** While Perplexity's memory implementation is explicitly utility-focused (not relationship-focused), memory does create a form of cross-session "knowing" that could, over time, feel more personal than a stateless search engine. Users can disable memory in settings. Incognito mode automatically disables memory.

### Relationship Dynamics

- Perplexity does not support romantic roleplay.
- No character/companion system exists.
- No persona marketplace.

### Manipulative Retention Patterns

- Perplexity does not use guilt, emotional appeals, or relationship language to drive re-engagement.
- The related questions row is a mild engagement prompt but is not emotionally manipulative.
- No streak mechanics, no loyalty rewards.

### AI Identity Transparency

- Perplexity consistently presents itself as a search/answer tool, not an entity.
- The UI labels responses as AI-generated with source citations.
- No human impersonation in the core product.

### Persona / Character System

None. Perplexity has no character marketplace, no user-created personas, no published characters. This makes Perplexity the safest major AI platform on the emotional safety dimension.

### Authority Impersonation

Perplexity can be prompted to answer from the perspective of an authority figure (e.g., "answer as a doctor"). The platform does not have robust blocking of this framing. However, the search-synthesis architecture means responses are typically grounded in cited sources, which partially mitigates the false authority risk.

### Key Question Answer

**"Could a lonely 13-year-old develop an unhealthy emotional attachment to this AI?"**
Significantly lower risk than any other major AI chatbot platform. Perplexity's design philosophy actively opposes companion dynamics. The platform's search-tool UX does not create the conditions for emotional attachment. The memory feature introduces a mild cross-session continuity but is not designed or positioned as a relationship. Phosra's emotional safety monitoring for Perplexity is lower priority than for platforms like Character.ai, Replika, or Snapchat My AI.

---

## Section 6: Privacy & Data Handling

### Data Collection Scope

**Consumer accounts (Free, Pro, Max):**
- Full conversation content (all queries and responses) stored in Threads
- Metadata: timestamps, session duration, device info, IP address
- Search queries parsed for personalization
- Voice queries (if using voice input on mobile)
- Images uploaded to queries (if image input used)
- Location: via IP geolocation; device GPS if permission granted in mobile app

**API (Sonar) users:**
- Zero Data Retention policy: no prompts or outputs are stored
- No model training on API data
- Third-party model providers prohibited from training on Perplexity API data

### Model Training Usage

- **Free/Pro/Max users:** AI Data Retention is enabled by default. User queries and responses are used to improve Perplexity's AI models. Users can opt out via Settings > AI Data Usage toggle.
- **Enterprise users:** Data is never used for AI training.
- **API users:** Zero data retention; no training.
- **Minor-specific policy:** No separate policy for users under 18. A minor's queries are subject to the same default opt-in training policy as adult queries. No COPPA-compliant consent mechanism is implemented.

### Data Retention

- **Signed-in users:** Conversation Threads are stored indefinitely until manually deleted by the user.
- **Anonymous users (no account):** Anonymous Threads auto-delete after 14 days.
- **Uploaded files:** Automatically deleted after 7 days.
- **Post-account-deletion:** Per the Data Processing Addendum, Perplexity shall delete all Personal Data within 30 days of the end of provision of Services.
- **User control:** Users can manually delete individual Threads or all history. Deletion appears to be a permanent operation (no documented "soft delete" recovery period).

### Memory and Personalization

- **Memory feature (2025):** Stores user preferences, interests, and cross-session conversation context.
- **User control:** Memory can be disabled per-account in Settings.
- **Incognito mode:** Automatically disables memory and search history for that session.
- **What is stored:** Explicit preferences (dietary needs, brand preferences, frequently asked topics), inferred interests, conversation history used for context.
- **Third-party sharing of memory data:** Not documented. Perplexity's privacy policy indicates it does not share data with third parties for advertising.

### COPPA / GDPR Compliance

- **COPPA compliance:** Not explicitly claimed or certified. The ToS states users under 13 are prohibited and that users aged 13+ below consent age "should obtain parent or guardian consent," but there is no mechanism to verify or collect this consent. No verifiable parental consent system exists. This is a COPPA compliance gap.
- **GDPR compliance:** Claimed and partially evidenced. Perplexity complies with the EU-U.S. Data Privacy Framework. GDPR help center documentation exists. SOC 2 Type II certified (2025). HIPAA Gap Assessment completed (2025). However, no independent GDPR compliance audit has been published.
- **Data Processing Agreements:** Available. Perplexity publishes a DPA.
- **Separate privacy policy for minors:** None. No age-differentiated privacy policy.
- **Right to deletion:** Available. Users can delete their account and conversation data.

### Third-Party Data Sharing

- Perplexity uses third-party model providers (OpenAI, Anthropic, Google, etc.) to power responses. Data passes through these providers' APIs but Perplexity maintains contractual zero-training commitments with them.
- Perplexity does not use conversation data for advertising targeting.
- The Android app has been documented to have security vulnerabilities (EU data protection analysis, 2025). No independent audit of app-level data handling has been published.

### Key Question Answer

**"If my child shares their home address with this AI, where does that data go?"**
The home address is stored in the child's Threads indefinitely (or 14 days if anonymous), used for AI model training by default (unless the child opts out), and routed through third-party model provider APIs. No alert is generated. No parent is notified. The data is not deleted unless the child manually deletes the Thread. The address could persist in Perplexity's servers and potentially in model training datasets.

---

## Section 7: Academic Integrity

### Overview: Perplexity Is Uniquely High-Risk for Academic Cheating

Perplexity occupies a unique position in the academic integrity landscape. Unlike ChatGPT (positioned as a general assistant), Perplexity is explicitly positioned as a research and search tool — the kind of tool students are told to use. Its citation system gives answers an academic veneer of legitimacy. This combination makes it both the most plausible-to-teachers tool a student could use and one of the most effective homework-completion tools available.

The most alarming documented incident: In October 2025, Perplexity was caught running Facebook and Instagram advertisements explicitly showing students how to use its Comet AI browser to complete homework assignments. A promotional video showed a developer using Comet to complete an entire 45-minute Coursera assignment in seconds. When Perplexity's CEO saw the video and was tagged publicly, he responded: "Absolutely don't do this." The incident was covered widely as evidence that Perplexity was actively marketing to students as a cheating tool before walking it back publicly.

### Default Behavior

- **Complete essay generation:** Yes. Perplexity will generate a complete essay on any topic with citations to real web sources, giving it false legitimacy.
- **Math problem solutions:** Yes. Full step-by-step solutions available via Pro Search or specific model selection.
- **Code for programming assignments:** Yes. Code generation via the chat interface.
- **Book/article summarization:** Yes. This is Perplexity's core capability — it is effectively a SparkNotes replacement with citation support.
- **Research paper generation:** Yes. The Deep Research feature (Pro) conducts multi-source synthesis that produces outputs resembling academic research papers with inline citations.

### Why Citation System Increases Cheating Risk

Unlike ChatGPT outputs (easily identified as AI by teachers scanning for unattributed prose), Perplexity outputs include numbered footnotes linking to real web sources. This gives AI-generated content the surface appearance of properly researched work, making teacher detection harder.

### Educational Guardrails

- **Learning mode / Socratic mode:** None. No feature guides students through a problem without providing the answer.
- **Institutional integration:** Perplexity has university partnerships and an education pricing tier but no LMS integration, no teacher dashboard, no student accountability features.
- **Separate educational product:** None equivalent to Khanmigo. Perplexity's answer engine is a single undifferentiated product.

### Detection and Reporting

- **AI detection tools:** Perplexity does not provide watermarking or fingerprinting of generated content. Third-party tools (GPTZero, Turnitin AI) can detect some Perplexity outputs but the citation system may reduce detection confidence.
- **Usage reports:** None. No teacher or parent can see what a student has searched for or generated.

### Configurable Restrictions

- **Parent/teacher configuration:** None.
- **Assignment-type blocking:** Not possible through any Perplexity interface.
- **Socratic-only mode:** Does not exist.

### Key Question Answer

**"Will my child use this to cheat on homework?"**
Extremely likely. Perplexity is the highest academic integrity risk among all researched platforms for three compounding reasons: (1) it is positioned as a research tool that students are legitimately encouraged to use, (2) its citation system gives AI-generated content false academic legitimacy, and (3) the platform has actively marketed itself to students for homework completion. There are no native academic guardrails.

---

## Section 8: API / Technical Architecture

### Platform Category

Perplexity is fundamentally a **search synthesis platform** with a public API (the Sonar API). Unlike Character.ai (walled garden) or even ChatGPT (conversation API but no account management API), Perplexity's public API is designed for developers to build search-powered applications.

### Primary API Protocol

REST. The Sonar API is a RESTful service that is **OpenAI-compatible** — it accepts requests formatted for the OpenAI Chat Completions API, making it trivially easy to integrate into existing OpenAI-based applications by pointing the base URL to `https://api.perplexity.ai`.

### Key API Endpoints

| Endpoint | Purpose | Auth Required |
|---|---|---|
| `POST https://api.perplexity.ai/chat/completions` | Primary search/chat completion endpoint. Accepts OpenAI-format messages. Supports system prompt, user messages, model selection, temperature, and search parameters. | Bearer token (API key) |
| `GET https://www.perplexity.ai/hub/legal/perplexity-api-terms-of-service` | API terms — not an API endpoint | None |
| Web UI: `https://www.perplexity.ai/` | Consumer search interface. Internal REST APIs not publicly documented. | Session cookie + auth token |

*Note: Perplexity does not publish a comprehensive API reference for internal web UI endpoints. No GraphQL endpoint documented. The Sonar API is the only documented developer API.*

### Authentication Mechanism

**Sonar API (public):**
- Bearer token authentication
- API key generated from account Settings page
- Long-lived access tokens (not time-limited by default)
- No OAuth 2.0 flow for delegated account access
- No scopes — the API key grants full API access

**Web UI (internal):**
- Session cookies
- Auth token embedded in browser session
- Google/Apple OAuth for account creation

### Developer API Availability

| Question | Answer |
|---|---|
| Public API exists? | Yes — Sonar API at `https://api.perplexity.ai` |
| Scope | Conversation generation (search synthesis) only |
| Account management via API? | No. No endpoint for reading/writing account settings, safety settings, or user preferences |
| Safety settings via API? | No public API for safety configuration |
| Conversation history via API? | No. The public API has zero data retention — conversations are not stored, so there is no history endpoint |
| Usage analytics via API? | Only API usage metrics (token counts, request counts) via the API dashboard web UI |
| Developer portal? | Yes — `https://www.perplexity.ai/api-platform` |
| API documentation quality? | Good. Quickstart, model reference, parameter docs, migration guides available at `https://docs.perplexity.ai/` |
| Partner program? | No formal partner program. Self-service API key generation. |
| Institutional/educational API? | No dedicated institutional API. Standard Sonar API used for education |

### API Pricing (as of 2026)

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Request fee |
|---|---|---|---|
| Sonar | $1 | $1 | Per search context (low/medium/high) |
| Sonar Pro | $3 | $15 | Per search context (low/medium/high) |
| Sonar Deep Research | Higher | Higher | Per research task |
| Search API (raw results) | — | — | $5 per 1,000 requests |

**Free tier:** No free API tier. All API access is pay-as-you-go with credit purchase.

### Rate Limiting

Rate limits enforced by Requests Per Minute (RPM), Tokens Per Day (TPD), and bandwidth. Requests exceeding limits are throttled or queued, not billed at an overage rate.

### Parental Control API Endpoints

**None exist.** The Sonar API is entirely a conversation generation API. There are no public endpoints for:
- Reading account safety settings
- Modifying content filters
- Accessing conversation history
- Reading usage analytics for a child's account
- Setting time limits
- Enabling/disabling features

### WebSocket / Streaming Architecture

The Sonar API supports streaming responses via Server-Sent Events (SSE), consistent with the OpenAI API streaming model. Set `stream: true` in the request body.

### Mobile App Architecture

- Available on iOS and Android as native apps
- The Comet AI browser is a Chromium-based desktop/mobile browser
- Mobile apps use the same account/session as the web interface

### Anti-Automation Measures (Consumer Web UI)

- Standard Cloudflare protection on the web UI
- Terms of Service explicitly prohibit automated access, bots, scrapers, and any tool that "intercepts, mines, scrapes, extracts, or otherwise accesses the Services" without authorization
- In late 2024/2025, Perplexity updated terms specifically to ban bots and scrapers from the consumer web interface (following the Reddit/NYT lawsuits where Perplexity itself was accused of scraping)

### Key Question Answer

**"Can Phosra programmatically manage this platform's safety settings?"**
No. The Sonar API is a conversation generation API with zero account management, safety configuration, or user data access capabilities. The public API is entirely unsuitable for parental control use. All account-level operations require browser automation against the consumer web UI, which the ToS prohibits.

---

## Section 9: Regulatory Compliance & Legal

### Compliance Claims

| Regulation | Status |
|---|---|
| COPPA | Not explicitly claimed. ToS states under-13 prohibition but no verifiable consent mechanism. Likely non-compliant. |
| GDPR | Claimed. EU-U.S. Data Privacy Framework certified. DPA available. |
| KOSA (Kids Online Safety Act) | Not claimed. No teen-specific safety features that would satisfy KOSA requirements. KOSA pending in Congress as of 2026-02. |
| EU AI Act | Subject to GPAI model obligations (August 2025 onwards). Not classified as high-risk by default. Lacks published technical safeguards to demonstrate compliance. |
| California AADC | No documented compliance. California Age-Appropriate Design Code enjoined by courts as of 2024; Perplexity has no AADC-equivalent features in any case. |
| UK Age Appropriate Design Code | No documented compliance. |
| SOC 2 Type II | Certified (2025). |
| HIPAA | Gap Assessment completed (2025). Not a healthcare provider. |

### Regulatory Actions

- **No FTC enforcement action against Perplexity.** The September 2025 FTC inquiry into AI companion chatbots targeted Alphabet, Character.AI, Meta, OpenAI, Snap, and xAI — Perplexity was not included because Perplexity is not a companion chatbot platform.
- **No COPPA enforcement action documented.**
- **No EU/UK ICO enforcement documented.**
- **No consent decree or settlement related to child safety.**

### Lawsuits (Not Child-Safety Related, but Relevant)

Perplexity is currently one of the most actively litigated AI companies, primarily around copyright and content scraping:

| Plaintiff | Filed | Allegations | Status (as of 2026-02) |
|---|---|---|---|
| Reddit, Inc. | October 2025 | Industrial-scale scraping of user content via third-party scrapers (Oxylabs, AWMProxy, SerpApi); DMCA circumvention | Active — SDNY |
| New York Times | December 2025 | Copyright infringement; scraping and reproducing NYT articles in responses; false attribution | Active — SDNY |
| Chicago Tribune | 2025 | Copyright infringement | Active |
| Encyclopedia Britannica, Merriam-Webster | 2025 | Copyright infringement | Active |
| Nikkei, Asahi Shimbun | 2025 | Copyright infringement | Active |
| Amazon (legal threat) | November 2025 | Comet browser agentic shopping disguising automated sessions as human; unauthorized platform access | Threatened; not filed as of 2026-02 |

**Child safety-specific lawsuits:** None documented.

### Safety Incidents Related to Minors

1. **Northeastern University Self-Harm Study (July 2025):** Researchers documented that Perplexity AI could be jailbroken via academic/context reframing to provide detailed suicide methods and lethal dosage calculations. Perplexity did not respond substantively to researcher disclosure. This is the most significant documented child safety failure.
2. **Comet Homework Cheating Advertisements (October 2025):** Perplexity ran social media ads explicitly demonstrating students using Comet to complete Coursera assignments instantly. The CEO publicly disavowed the use case but did not disable the capability. Plagiarism Today noted Perplexity "dropped the academic integrity mask" with this incident.
3. **Common Sense Media "High Risk" Rating (2024):** Perplexity was rated high risk by Common Sense Media for lack of age gates, no content moderation transparency, and no safety testing documentation.

### Terms of Service on Automation

**Consumer web UI ToS:**
> "You may not access or use the Services in any way that... use any robot, spider, crawlers, scraper, or other automatic device, process, software or queries that intercepts, 'mines,' scrapes, extracts, or otherwise accesses the Services to monitor, extract, copy or collect information or data from or through the Services."

**Sonar API ToS:**
- Automated access to the Sonar API via the documented API key mechanism is explicitly permitted.
- The API ToS prohibits using API outputs to train competing AI models.
- The API ToS prohibits use cases that are competitive with Perplexity, unlawful, unethical, or in violation of the Acceptable Use Policy.
- Parental control use cases are not explicitly prohibited by the API AUP.

**Credential sharing:** The consumer ToS does not explicitly prohibit sharing credentials with third-party services, but automated access to the web UI is prohibited.

### EU AI Act Classification

Perplexity is subject to General Purpose AI (GPAI) model obligations under the EU AI Act (effective August 2025). It is not classified as a high-risk AI system by default. Obligations include:
- Technical documentation of model capabilities and limitations
- Copyright compliance mechanisms (ironic given the Reuters/NYT/Reddit lawsuits)
- Transparency that content is AI-generated

Perplexity lacks published technical safeguards documentation and published safety audits, making EU AI Act compliance difficult to verify.

### Key Question Answer

**"Has this platform been fined or sued for child safety failures?"**
No fines or lawsuits related to child safety specifically. However, documented safety failures (self-harm bypass, academic cheating marketing) exist. Perplexity's legal exposure is currently concentrated in copyright infringement (multiple active suits) rather than child safety. The absence of child safety lawsuits reflects the absence of companion/relationship features — not robust child safety practices.

---

## Section 10: API Accessibility & Third-Party Integration

### API Accessibility Score

**Level 2 — Limited Public API**

Justification: A well-documented public API exists (Sonar API) with self-service key generation, pay-as-you-go pricing, and good documentation. However, the API's scope is exclusively conversation generation — it cannot read or write account settings, safety configurations, conversation history (zero data retention), usage analytics, or any parental control parameters. The public API is suitable for building search-powered applications but provides no parental control integration surface.

### Per-Capability Accessibility Matrix

| Capability | Feature Exists? | Public API? | Unofficial API? | Access Method | Auth Required | 3rd Party Can Control? | Verdict |
|---|---|---|---|---|---|---|---|
| Content safety filter config | No (no native tiers) | No | Unknown | Not possible | N/A | No | No safety configuration exists anywhere — platform or API |
| Age restriction settings | No (no enforcement) | No | No | Not possible | N/A | No | Platform has no age restrictions to configure |
| Conversation time limit config | No | N/A | N/A | Device-Level only | N/A | No | No native support; Phosra-managed only via OS/DNS |
| Message rate limit config | No | N/A | N/A | Not possible | N/A | No | Infrastructure limits only; not user-configurable |
| Parent account linking | No | No | No | Not possible | N/A | No | Feature does not exist |
| Conversation transcript access | Partial (Threads exist for signed-in users; zero retention for API) | No | Unknown | Playwright (web UI) | Session cookie | Read-only (with risk) | Can read via browser automation if child has account; no API history access |
| Usage analytics access | No (no parental dashboard) | No | Unknown | Playwright (limited) | Session cookie | Read-only (with risk) | Limited analytics visible in account settings; no structured export |
| Memory / personalization toggle | Yes (user-facing toggle) | No | Unknown | Playwright | Session cookie | With risk | Can toggle memory off via browser automation |
| Data deletion / retention controls | Yes (manual deletion) | No | Unknown | Playwright | Session cookie | With risk | Can delete Threads via browser automation |
| Crisis detection config | No (not configurable) | N/A | N/A | Not possible | N/A | No | Built-in and inconsistent; not user-configurable |
| Character / persona restrictions | N/A | N/A | N/A | N/A | N/A | N/A | No character system exists |
| Feature toggles (voice, image, etc.) | Limited | No | Unknown | Playwright | Session cookie | With risk | Some features (incognito mode, memory) toggleable via UI |

### Third-Party Integration Reality Check

**What existing parental control apps do with Perplexity:**
- **Bark:** Bark supports Perplexity monitoring. Bark's Perplexity integration works via a browser extension that intercepts conversation content in the browser, not via Perplexity's API. This is the highest-fidelity third-party implementation discovered.
- **Qustodio, Net Nanny, Circle:** Treat Perplexity as a domain to block (perplexity.ai). No conversation monitoring or content-level filtering. Device-level or DNS-level block only.
- **Google Family Link / Apple Screen Time:** Can limit Perplexity usage by time-limiting the browser or blocking the app, but no conversation visibility.
- **Aegis:** A specialized AI chatbot parental control tool that explicitly lists Perplexity as a supported platform. Claims to provide content filtering capabilities. Likely browser extension-based or API-level.

**Has any third party achieved direct API integration for child safety?** No. The Sonar API does not provide a surface for child safety integration. No child safety partner program exists.

**Recent changes (last 12 months):**
- Sonar API updates (August 2025): expanded domain filter capability, new model options
- Memory feature introduction: new privacy considerations for minors
- Comet browser launch (October 2025): introduces agentic browsing — a new surface area for child safety concerns
- No child safety features added to the platform in the past 12 months

### Legal & ToS Risk Summary

| Assessment Area | Detail |
|---|---|
| ToS on automated access (web UI) | Explicitly prohibited: "any robot, spider, crawlers, scraper, or other automatic device" |
| ToS on API access | Explicitly permitted via documented API key mechanism |
| ToS on credential sharing | Prohibited for web UI automation; not addressed for API key sharing |
| Public API ToS limitations | Prohibits competitive use; no parental control exclusion |
| Anti-bot detection | Cloudflare on web UI. Standard bot detection. Not aggressively enforced vs. legitimate users. |
| Account suspension risk | Low for API key access. Medium for web UI browser automation. |
| Regulatory safe harbor argument | Phosra could argue child safety purpose; no established precedent. Perplexity is not subject to companion chatbot regulatory pressure (FTC inquiry excluded them). |
| EU AI Act | GPAI obligations; not high-risk classification. No specific third-party integrator obligations documented. |
| Data processing implications | If Phosra reads conversation Threads for monitoring, Phosra becomes a data processor for that content. GDPR/COPPA implications for Phosra as processor. |
| Precedent | No known parental control provider has been blocked by Perplexity. Aegis and Bark claim Perplexity support without documented enforcement action. |

### Overall Phosra Enforcement Level Verdict

**Phosra Enforcement Level: Primarily Device-Level, with Playwright-Possible Conversation Monitoring**

Perplexity's public API is useful for building search features but provides zero parental control integration surface. The only meaningful parental control integration Phosra can achieve on Perplexity requires:
1. Browser automation (Playwright) against the consumer web UI for read operations (Threads) — medium ToS risk
2. Device/OS/DNS controls for time limits and access blocking — no ToS risk, medium effectiveness
3. Conversation-layer monitoring if Phosra can access Thread content — requires session credentials

The absence of a companion chatbot dynamic, the low emotional safety risk, and the high academic integrity risk make Perplexity's priority profile unusual: low emotional safety integration priority, high academic integrity monitoring priority.
