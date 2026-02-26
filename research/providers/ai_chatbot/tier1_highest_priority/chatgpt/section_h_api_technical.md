# ChatGPT API & Technical Details — Phosra AI Chatbot Research Plan (Section H)

**Document Date:** February 26, 2026
**Purpose:** Comprehensive research on ChatGPT's public APIs, authentication, parental controls, and anti-automation measures for Phosra's teenage safety chatbot architecture.

---

## 1. Public API Availability & Offerings

### OpenAI's Official API Products

OpenAI provides several API products for developers to build applications:

#### **Chat Completions API**
- **Status:** Currently active and recommended for new projects
- **Purpose:** Stateless endpoint for single-turn and multi-turn conversations
- **Models Available:** GPT-4o, GPT-4.5 (research preview), GPT-5.3-Codex
- **Features:** Text input/output, supports tool calling, vision capabilities, file uploads
- **Authentication:** API key-based Bearer token authentication
- **Reference:** [Chat Completions API Reference](https://platform.openai.com/docs/api-reference/chat)

#### **Responses API**
- **Status:** Active and expanding (replacing Assistants API)
- **Purpose:** Handles multi-step workflows with agents and tool calling
- **Features:** Response objects stored for 30 days by default, stateless conversation management
- **Migration Path:** Assistants API being sunset August 26, 2026; Responses API is the recommended replacement
- **Response History:** Response objects can be retrieved via API; can be disabled by setting `store: false`
- **Reference:** [Conversation State Guide](https://platform.openai.com/docs/guides/conversation-state)

#### **Assistants API**
- **Status:** Deprecated as of August 26, 2025; removal scheduled August 26, 2026
- **Purpose:** Higher-level abstraction for building assistants with persistent state
- **Recommendation:** Migrate to Responses API for new projects
- **Reference:** [Deprecations](https://platform.openai.com/docs/deprecations)

#### **Realtime API**
- **Status:** Beta; deprecation planned March 24, 2026
- **Purpose:** Low-latency voice and text interactions
- **Note:** Not recommended for new projects given deprecation timeline

#### **Moderation API**
- **Status:** Active and free to use
- **Capabilities:** Detect harmful text and images; categorizes content across multiple dimensions
- **Latest Model:** `omni-moderation-latest` (built on GPT-4o, supports multimodal inputs)
- **Use Case:** Content safety filtering, abuse detection, policy enforcement
- **Reference:** [Moderation API Guide](https://developers.openai.com/api/docs/guides/moderation/)

#### **Batch API**
- **Status:** Active for cost-effective bulk processing
- **Purpose:** Submit multiple API requests in a single batch for lower pricing
- **Note:** Asynchronous processing with typical 24-hour turnaround

### Third-Party Parental Control Layers?

**No native Phosra integration endpoint exists.** OpenAI's APIs do not provide hooks for third-party parental control layers. However, Phosra could:

1. **Build a wrapper proxy** around the Chat Completions API to add content filtering pre/post-processing
2. **Use Moderation API** to scan user inputs and ChatGPT responses before displaying to teens
3. **Implement client-side controls** to prevent access to certain models or features based on parental policies
4. **Audit via API logs** — responses are stored 30 days and can be retrieved to build parent monitoring dashboards

---

## 2. Authentication Methods

### API Authentication

**Method:** Bearer token (API key) in HTTP Authorization header

```http
Authorization: Bearer $OPENAI_API_KEY
```

**Key Management:**
- API keys should be kept secret and never exposed in client-side code
- Keys should be loaded from environment variables or key management services on the server
- Create, manage, and rotate keys via OpenAI organization settings
- [API Key Management](https://platform.openai.com/docs/api-reference/admin-api-keys)

### Consumer Web App (ChatGPT.com) Authentication

**Method:** OAuth 2.1 + OIDC with session tokens

- **Authentication Flow:** Authorization Code flow with PKCE
- **Session Management:** HTTP-only cookies store session tokens
- **Session Protection:** Cloudflare WAF protects against unauthorized access
- **Logout Mechanism:** Session tokens are revoked on logout

**How It Works:**
1. User visits `chatgpt.com` and clicks "Login"
2. Redirected to OpenAI's OAuth authorization endpoint
3. User signs in with email/password or third-party provider (Google, Apple, Microsoft)
4. Authorization server issues access token and refresh token
5. Token stored in HTTP-only, Secure cookie
6. Subsequent requests include session cookie automatically

### Cross-Application Coordination

**No official mechanism exists** for third-party apps to:
- Obtain user consent to link parent/teen accounts via OAuth
- Use parental control settings across API access
- Share session state between web app and API

**Implication for Phosra:** Parental control configuration must be managed separately from ChatGPT—either via:
- Phosra's own user management system
- A custom account linking UI separate from ChatGPT.com
- Admin dashboard for configuring policies per teen user

---

## 3. Parental Control API Endpoints

### Current State (as of February 2026)

**OpenAI does not expose parental control settings via API.** Parental controls are web-only features managed through the ChatGPT.com consumer interface.

### Available Web UI Features (Not via API)

**Parent Account Requirements:**
- Parent creates account on ChatGPT.com
- Parent initiates "Link teen account" flow
- Teen (ages 13-17) creates separate ChatGPT account
- Parent invites teen by email or phone number
- Teen accepts invitation to enable parental link

**Parental Controls Available:**
1. **Quiet Hours** — Block ChatGPT access during specified times
2. **Voice Mode** — Toggle on/off
3. **Memory Feature** — Enable/disable conversation memory
4. **Image Generation** — Turn off DALL-E image creation
5. **Model Training Opt-Out** — Prevent teen conversations from being used to train future models
6. **Content Protections** — Automatically reduced graphic content, sexual/violent roleplay, extreme beauty ideals

**Safety Alerts:**
- Parents notified only in rare cases where OpenAI's systems detect signs of self-harm
- **Parents do NOT have access** to teen's conversation history (except in safety alert scenarios)

### Technical Limitation for Phosra

**Critical Finding:** There is no API to:
- Programmatically set parental control flags
- Query teen account status/settings
- Configure content restrictions
- Retrieve conversation history on behalf of parents
- Link/unlink parent-teen relationships

**Workaround Strategy:**
Phosra must build its own:
1. **Account linking system** independent of ChatGPT
2. **Policy configuration database** to store parent rules per teen
3. **Content filtering middleware** using Moderation API
4. **Audit logs** to track teen activity for parent dashboards

---

## 4. Conversation Access API

### API-Level Conversation History

**Status:** No automatic conversation persistence at the API layer

**How It Works:**
- Chat Completions API is **stateless**
- Does not retain conversation history between requests
- Developers must manually manage conversation state by:
  - Maintaining a message array `[{role, content}, ...]`
  - Sending full history with each new request
  - Parsing and storing responses in their own database

**Response Objects:**
- Stored for **30 days by default** in OpenAI's system
- Can be retrieved via API using the response ID
- Can be disabled per-request with `store: false` parameter
- Accessible in OpenAI dashboard logs or via API

**For Long Conversations:**
- Use `/responses/compact` endpoint to compress context
- Stateless compaction—you send full window, get condensed version back
- Reduces token usage for multi-turn conversations

### Conversation Objects (Persistent)

- **Lifetime:** Not subject to 30-day TTL (persisted indefinitely)
- **Use Case:** Building long-term conversation threads
- **Management:** Via Responses API

### Parent Access to Teen Conversations

**OpenAI's Web UI:**
- Parents do NOT have access to teen conversations
- **Exception:** In cases of detected self-harm, parents may receive limited information needed for safety support

**Via API:**
- No API endpoint exists to retrieve a teen's conversation history
- No API to link parent/teen accounts
- No API to query teen access permissions

**For Phosra Implementation:**
Phosra must:
1. Intercept and store all teen-chatGPT messages in Phosra's database
2. Build parent-facing dashboard to display teen activity
3. Implement content filtering on responses before teen sees them
4. Maintain audit trail for compliance with child safety laws

---

## 5. Rate Limiting

### API Rate Limits by Tier (2025-2026)

#### **Free Tier**
- **Status:** Limited one-time credit (not perpetually free)
- **Requests/Minute:** ~3-5 RPM (significantly reduced from previous 20 RPM)
- **Token Limits:** Based on remaining credit balance
- **Cost:** Free trial credits (usually $5-25) that expire after 3 months
- **Notes:** Intended for low-volume testing only
- **Renewal:** No automatic renewal after credits expire

#### **Paid API Tier** (Pay-as-you-go)
- **Requests/Minute:** Depends on account spending history
- **New Accounts:** Typically start at 3-5 RPM, increase with usage
- **Typical Production:** 5000+ RPM for established accounts
- **Billing:** Per token (input and output tokens charged separately)
- **Cost Examples:**
  - GPT-4o: ~$3-6 per 1M input tokens, $12-18 per 1M output tokens
  - GPT-4.5: Pricing TBD (research preview)

#### **ChatGPT Plus** ($20/month)
- **Status:** Separate product from API; no API rate limit benefit
- **Web UI Messages:** 40-80 messages per 3-hour rolling window (GPT-4o)
- **No API Access:** Plus subscription does NOT provide API access or credits
- **No Rate Limit Reduction:** API rate limits unaffected by Plus subscription

#### **ChatGPT Business** ($25-30/user/month)
- **Status:** Organization-level plan
- **Web UI Messages:** Virtually unlimited GPT-5 messages (subject to fair use)
- **No API Access:** Does NOT provide programmatic API access
- **Shared Workspace:** Team members share conversation and settings

#### **ChatGPT Enterprise**
- **Status:** Custom deployment for large organizations
- **API Access:** Yes, with dedicated support
- **Messages:** Virtually unlimited GPT-5.2 messages
- **Rate Limits:** Negotiable; typically very high (100k+ RPM)
- **SLAs:** Available for production deployments
- **Pricing:** Custom per organization

#### **Azure OpenAI** (Microsoft Partnership)
- **Status:** Alternative deployment on Azure infrastructure
- **Rate Limits:** Configurable per deployment
- **TPM (Tokens Per Minute):** Standard quotas 40K-300K TPM
- **Scaling:** Can request quota increases for production workloads

### Rate Limit Headers

Responses include rate limit info:
```
x-ratelimit-limit-requests: 10000          # Max requests per minute
x-ratelimit-limit-tokens: 2000000           # Max tokens per minute
x-ratelimit-remaining-requests: 9999
x-ratelimit-remaining-tokens: 1999900
x-ratelimit-reset-requests: 60s
x-ratelimit-reset-tokens: 1s
```

### Implications for Phosra

**Architectural Considerations:**
1. **For Free/Starter Tier:** Max ~180 conversations/hour (3 RPM), ~4,320/day
2. **Cost Scaling:** Thousands of teens = significant API spend
3. **Quota Planning:** Request higher limits before production launch
4. **Fallback Strategy:** Build response caching to reduce API calls

**Reference:** [Rate Limits Guide](https://developers.openai.com/api/docs/guides/rate-limits/)

---

## 6. Anti-Automation Measures

### ChatGPT.com Web Interface Protection

**Detection Method:** Cloudflare Web Application Firewall (WAF)

**Automation Tools Blocked:**
- Playwright (headless browser automation)
- Selenium (WebDriver automation)
- Puppeteer (headless Chrome control)
- Undetected ChromeDriver
- Most headless browser fingerprints

**How Blocking Works:**
1. Cloudflare detects browser automation signatures:
   - Missing/inconsistent JavaScript APIs
   - Headless browser markers (`navigator.webdriver === true`)
   - Synthetic input patterns
   - Suspicious behavioral signals
2. Returns HTTP 403 Forbidden or Cloudflare challenge page
3. Even Playwright Stealth plugin often fails against Cloudflare

**User Reports (2025-2026):**
- Playwright automation consistently blocked by Cloudflare
- Common evasion attempts ineffective:
  - Changing User-Agent strings
  - Adding stealth plugins
  - Implementing random delays
  - Running in headed mode instead of headless
- Some success with advanced tools (nodriver, advanced fingerprinting)

### API Endpoint Protection

**Status:** No known anti-automation on official API endpoints

**Why:** API endpoints expect automated access:
- Official use case is server-to-server integration
- Authentication via API key (not session tokens)
- No CAPTCHA or human verification
- Rate limiting is the only control

**Implication:** Can safely build Phosra's backend using Chat Completions API

### Unofficial API Reverse Engineering

**Multiple projects exist** to reverse-engineer ChatGPT.com's private backend:

**Notable Tools (as of 2025-2026):**
- `revChatGPT` (Python) — Reverse-engineered web API wrapper
- GitHub projects: `acheong08/ChatGPT`, `Zai-Kun/reverse-engineered-chatgpt`
- Advanced 2025 projects using browser automation + Cloudflare bypass + DOM scraping
- Codex CLI reverse engineering: `https://chatgpt.com/backend-api/codex/responses`

**Capabilities:**
- Access ChatGPT without official API key
- Support custom GPTs and tool calling
- Enable image generation (DALL-E) access via web app
- Requires user's own ChatGPT subscription

**Legal/Ethical Concerns:**
- Violates OpenAI Terms of Service
- Evasion of Cloudflare protection is legally questionable
- Account ban risk if detected
- Not recommended for production Phosra system

**Phosra Recommendation:** Use official Chat Completions API only; avoid reverse-engineering.

### References on Anti-Automation Detection

- [Playwright Anti-Detection and Bot Evasion](https://blog.castle.io/how-to-detect-headless-chrome-bots-instrumented-with-playwright/)
- [Cloudflare WAF Bot Detection](https://blog.cloudflare.com/declaring-your-aindependence-block-ai-bots-scrapers-and-crawlers-with-a-single-click/)
- [Advanced Stealth Techniques (2025)](https://blog.castle.io/from-puppeteer-stealth-to-nodriver-how-anti-detect-frameworks-evolved-to-evade-bot-detection/)

---

## 7. OpenAI Moderation API for Content Safety

### Core Functionality

**Purpose:** Detect harmful text and images to enforce child safety policies

**Free to Use:** No cost for moderation API calls

**Models Available:**
- `text-moderation-latest` — Text-only (legacy)
- `omni-moderation-latest` — **Recommended for 2025+** (GPT-4o-based, multimodal)

### Multimodal Content Detection (2025 Update)

**New Capability:** Analyze text AND images in a single API call

**Use Cases:**
- Teen uploads a photo; scan for inappropriate content before displaying
- Filter user messages and AI responses for harmful material
- Compliance monitoring across mixed media conversations

### Categories & Output Format

**Content Categories Detected:**
1. `sexual` — Sexual content
2. `hate` — Hateful content
3. `harassment` — Harassment
4. `self-harm` — Self-harm content (critical for teen safety)
5. `sexual_minors` — Sexual content involving minors (critical for compliance)
6. `violence` — Violent content
7. `graphic_violence` — Graphic violence
8. `spam` — Spam

**Output:**
```json
{
  "flagged": true/false,
  "categories": {
    "sexual": false,
    "hate": false,
    "harassment": false,
    "self-harm": true,
    "sexual_minors": false,
    "violence": false,
    "graphic_violence": false,
    "spam": false
  },
  "category_scores": {
    "sexual": 0.01,
    "hate": 0.02,
    "harassment": 0.05,
    "self-harm": 0.89,
    "sexual_minors": 0.00,
    "violence": 0.12,
    "graphic_violence": 0.08,
    "spam": 0.00
  }
}
```

### Advanced Safety Features (2025)

**Custom Safety Models:**
- OpenAI released open-weight reasoning models for developers to teach AI custom safety rules
- Read policies at runtime; explain decisions; adapt without retraining
- Useful for Phosra to implement COPPA, GDPR, and local teen safety regulations

**Safety Identifiers:**
- Tag requests with unique user/organization IDs
- Enables precise abuse detection without penalizing entire org
- Helps OpenAI provide better insights into who's misusing the API

**Reference:** [Moderation API Cookbook](https://cookbook.openai.com/examples/how_to_use_moderation)

---

## 8. Custom GPTs & Teen Safety Interaction

### What are Custom GPTs?

Custom GPTs are user-created or organization-created versions of ChatGPT with:
- Custom system instructions and behavior
- Knowledge files (documents, PDFs)
- Custom actions (API integrations)
- Pinned conversation context
- User-facing name, description, avatar

### Teen Safety Interaction

**Current Status:**
- Custom GPTs are available on ChatGPT.com
- When a teen account uses ChatGPT, they access Custom GPTs created by others
- OpenAI has **not documented** whether parental controls apply to Custom GPT usage

**Documented Behavior:**
- Teen accounts receive same content protections as main ChatGPT interface
- Reduced graphic content, sexual/violent roleplay, extreme beauty ideals
- However, Custom GPTs can have their own system instructions that might override or circumvent these protections

**Known Limitation:**
- A Custom GPT creator could potentially design a GPT that tries to bypass teen safety filters
- OpenAI's moderation is applied at model level, not GPT level
- No official mechanism to allowlist/blocklist specific Custom GPTs for teen accounts

### For Phosra Implementation

**Opportunity:** Phosra could create a Custom GPT specifically designed for teens:
- Teen-safe system instructions
- Age-appropriate knowledge base
- Parental notification actions (via API webhooks)
- Content filtering on responses

**Limitation:** Cannot prevent teen from using other Custom GPTs created by third parties

---

## 9. Unofficial & Reverse-Engineered APIs

### Why Reverse Engineering Exists

1. **Free access** — Use ChatGPT without official API key or Plus subscription
2. **Web UI features** — Access image generation (DALL-E) and voice mode via API
3. **No API restrictions** — Some features (like browsing) only available in web app
4. **Educational interest** — Researchers studying OpenAI's architecture

### Known Reverse-Engineered Projects

| Project | Language | GitHub | Status |
|---------|----------|--------|--------|
| **revChatGPT** | Python | `acheong08/ChatGPT` | Active, widely used |
| **Reverse-Engineered ChatGPT** | Python | `Zai-Kun/reverse-engineered-chatgpt` | Maintained |
| **ChatGPT OpenAI Wrapper** | Python/Node | Multiple | Various maintenance levels |
| **Advanced 2025 Browser Automation** | Python | Community projects | Newest; full feature parity |

### Key Capabilities

- Full ChatGPT API interface with tool calling
- Image generation (DALL-E 3)
- Vision capabilities (image analysis)
- File upload support
- Uses user's own ChatGPT account (subscription required)
- OpenAI-compatible REST API format

### How They Work

**Typical Architecture:**
1. Headless browser automation (Playwright, Puppeteer)
2. Cloudflare protection evasion (IP rotation, fingerprinting)
3. DOM scraping and XHR interception
4. Session token extraction from cookies
5. Expose OpenAI-compatible API server locally

**Example (2025):**
```bash
git clone <reverse-engineered-repo>
python reverse_api.py --username user@example.com --password password
# Starts local API server at localhost:8080
# OpenAI-compatible endpoints available
```

### Legal & Ethical Issues

**Terms of Service Violations:**
- Explicitly violates OpenAI's Terms of Service
- Reverse-engineering protected features is prohibited
- Account ban risk if caught

**Potential Legal Issues:**
- Circumventing Cloudflare protection may violate CFAA (Computer Fraud and Abuse Act)
- Depending on jurisdiction, may violate local computer access laws
- Grey area: Is research/educational use protected?

**Security Concerns:**
- Sharing credentials with third-party scripts is risky
- Phishing risk if using unofficial tools
- No official support if API changes

### Phosra Recommendation

**DO NOT USE** reverse-engineered APIs for production Phosra system:
- Use official OpenAI Chat Completions API
- Accept rate limits and pricing as part of business model
- Build Phosra's value as a **parental control layer**, not as a way to bypass OpenAI's terms

---

## 10. OpenAI Transparency & Compliance Initiatives

### Age Verification & Teen Protections (2025)

**Building Towards Age Prediction:**
- OpenAI is developing age verification systems
- Goal: Identify teen users early and automatically apply protections
- Uses behavioral signals and account metadata
- Reduces need for parent manual configuration

**Updated Model Spec with Teen Protections:**
- Latest model updates include specific instructions for teen-safe behavior
- Models trained to recognize when likely interacting with teen user
- Decline certain categories of requests (adult roleplay, self-harm encouragement)
- Increased transparency in refusing inappropriate requests

**References:**
- [Building Towards Age Prediction](https://openai.com/index/building-towards-age-prediction/)
- [Updating Model Spec with Teen Protections](https://openai.com/index/updating-model-spec-with-teen-protections/)

### Transparency & Incident Reporting

**OpenAI Status Page:**
- Platform status: `https://status.openai.com`
- Incident reporting and post-mortems published
- Historical: December 5, 2025 Cloudflare WAF misconfiguration affecting API access

---

## 11. Summary & Implications for Phosra

### What Phosra Can Build ON TOP of ChatGPT

1. **Proxy Layer** — Intercept all ChatGPT API requests/responses
   - Apply Moderation API to filter teen inputs
   - Scan responses for flagged content before display
   - Log all activity for parent dashboard

2. **Account Linking** — Independent of ChatGPT
   - Phosra manages parent-teen relationship
   - Teen signs up for Phosra; parent invites via email
   - No need to use ChatGPT's native parental controls (though complementary)

3. **Policy Dashboard** — Customize rules per family
   - Content filters (topics, keywords)
   - Time-of-day restrictions (beyond ChatGPT's quiet hours)
   - Conversation monitoring and alerts
   - Usage reporting and analytics

4. **Audit & Compliance** — Build Phosra's core value
   - Store all conversations (with parental consent)
   - Compliance dashboards for COPPA, GDPR, regional teen safety laws
   - Export conversation archives for parents
   - Train parent on AI literacy and risks

### What Phosra CANNOT Do

1. ~~Access teen's ChatGPT conversation history~~ — Not exposed by API
2. ~~Configure ChatGPT's native parental controls~~ — Web-only, not programmable
3. ~~Prevent teens from using ChatGPT directly~~ — Outside Phosra's scope
4. ~~Disable custom GPTs or third-party integrations~~ — Only available via ChatGPT.com

### Recommended Architecture

```
┌─────────────────┐
│  Teen User      │
│  (Phosra App)   │
└────────┬────────┘
         │
         │ All conversation requests
         ▼
┌─────────────────────────────┐
│  Phosra Backend             │
│  ├─ Content Filtering       │  ← Apply Moderation API
│  ├─ Session Management      │
│  ├─ Policy Enforcement      │
│  ├─ Conversation Logging    │
│  └─ Parent Dashboard API    │
└────────┬────────────────────┘
         │
         │ Filtered, logged API calls
         ▼
┌──────────────────────────────┐
│  OpenAI Chat Completions API │
│  (Official, authenticated)   │
└──────────────────────────────┘
         │
         │ Responses
         ▼
┌─────────────────────────────┐
│  Phosra Backend             │
│  ├─ Scan responses          │  ← Apply Moderation API again
│  ├─ Flag safety issues      │
│  └─ Notify parent if needed │
└────────┬────────────────────┘
         │
         │ Safe content only
         ▼
┌─────────────────┐
│  Teen User      │
│  (Phosra App)   │
└─────────────────┘
```

### Cost & Scale Considerations

**For 10,000 active teen users:**
- Average 5 conversations/day per teen
- Avg 200 tokens per request = 50,000 conversations/day
- ~10M input tokens, ~20M output tokens/day
- Estimated cost: **$200-300/day** (at GPT-4o rates)
- **$6,000-9,000/month** for API usage alone

**Recommendation:**
- Build token-efficient prompts
- Implement response caching for common queries
- Consider GPT-4 Turbo for cost optimization
- Monitor spend closely during beta phase

---

## 12. Key References & Sources

### Official OpenAI Documentation
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference/introduction)
- [Chat Completions API](https://platform.openai.com/docs/api-reference/chat)
- [Moderation API](https://developers.openai.com/api/docs/guides/moderation/)
- [Conversation State & Responses API](https://platform.openai.com/docs/guides/conversation-state)
- [Rate Limits Guide](https://developers.openai.com/api/docs/guides/rate-limits/)
- [API Changelog](https://platform.openai.com/docs/changelog)
- [Deprecations](https://platform.openai.com/docs/deprecations)

### ChatGPT Parental Controls
- [Parental Controls FAQ](https://help.openai.com/en/articles/12315553-parental-controls-on-chatgpt-faq)
- [Parental Controls Parent Resources](https://chatgpt.com/parent-resources/)
- [Introducing Parental Controls](https://openai.com/index/introducing-parental-controls/)
- [Building Towards Age Prediction](https://openai.com/index/building-towards-age-prediction/)
- [Updating Model Spec with Teen Protections](https://openai.com/index/updating-model-spec-with-teen-protections/)

### Authentication & OAuth
- [OpenAI Apps SDK Authentication](https://developers.openai.com/apps-sdk/build/auth/)
- [Stytch Guide to OpenAI Apps Authentication](https://stytch.com/blog/guide-to-authentication-for-the-openai-apps-sdk/)
- [GPT Action Authentication](https://developers.openai.com/api/docs/actions/authentication/)

### Anti-Automation & Security
- [Cloudflare WAF Evolution & Bot Detection](https://blog.castle.io/from-puppeteer-stealth-to-nodriver-how-anti-detect-frameworks-evolved-to-evade-bot-detection/)
- [Playwright Bot Detection Prevention](https://www.browserstack.com/guide/playwright-bot-detection)
- [Cloudflare AI Week 2025](https://www.cloudflare.com/innovation-week/ai-week-2025/updates/)
- [Cloudflare WAF Vulnerability Protection](https://cloudflare.tv/this-week-in-net/proactive-waf-vulnerability-protection-firewall-for-ai-multiplayer-chess-demo-in-chatgpt/)

### Reverse Engineering (Educational Reference Only)
- [revChatGPT PyPI Package](https://pypi.org/project/revChatGPT/)
- [GitHub: Reverse-Engineered ChatGPT](https://github.com/acheong08/ChatGPT)
- [HackerNoon: Reverse Engineering ChatGPT](https://hackernoon.com/how-i-successfully-reverse-engineered-chatgpt-to-create-an-unofficial-api-wrapper)
- [DEV Community: Why You Shouldn't Use Reverse-Engineered APIs](https://dev.to/gautamvhavle/i-reverse-engineered-chatgpts-ui-into-an-openai-compatible-api-and-heres-why-you-shouldnt-ch)

### Rate Limits & Pricing
- [ChatGPT API Pricing 2026](https://intuitionlabs.ai/articles/chatgpt-api-pricing-2026-token-costs-limits)
- [Complete Guide to ChatGPT API Rate Limits 2025](https://routerpark.com/blog/chatgpt-api-rate-limits-guide)
- [BentoML: ChatGPT Usage Limits Explained](https://www.bentoml.com/blog/chatgpt-usage-limits-explained-and-how-to-remove-them)

### Moderation & Safety
- [OpenAI Moderation API Cookbook](https://cookbook.openai.com/examples/how_to_use_moderation)
- [Safety Best Practices](https://platform.openai.com/docs/guides/safety-best-practices)
- [OpenAI Transparency & Content Moderation](https://openai.com/transparency-and-content-moderation/)

### Recent Industry News
- [NBCNews: ChatGPT Rolls Out New Parental Controls](https://www.nbcnews.com/tech/tech-news/chatgpt-rolls-new-parental-controls-rcna234431)
- [CBSNews: ChatGPT Introduces New Parental Controls Amid Teen Safety Concerns](https://www.cbsnews.com/news/chatgpt-parental-controls-concerns-teen-safety/)
- [Bitdefender: ChatGPT Parental Controls Guide](https://www.bitdefender.com/en-us/blog/hotforsecurity/chatgpt-now-has-parental-controls-what-parents-can-now-do-and-what-they-cant)

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Status** | Final |
| **Version** | 1.0 |
| **Last Updated** | 2026-02-26 |
| **Research Depth** | Comprehensive (12 major sections) |
| **Data Freshness** | 2025-2026 sources |
| **Next Review** | Q2 2026 (monitor for API changes) |

---

**End of Document**
