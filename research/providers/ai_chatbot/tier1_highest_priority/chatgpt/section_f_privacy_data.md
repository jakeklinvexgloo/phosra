# ChatGPT Privacy & Data Practices Research
## Section F: Phosra AI Chatbot Comparative Analysis

**Research Date:** February 26, 2026
**Status:** Comprehensive Research Document for AI Chatbot Compliance Planning

---

## Table of Contents

1. [Data Collection Scope](#1-data-collection-scope)
2. [Model Training & Opt-Out](#2-model-training--opt-out)
3. [Data Retention & Deletion](#3-data-retention--deletion)
4. [Memory & Personalization Features](#4-memory--personalization-features)
5. [Conversation Deletion Capability](#5-conversation-deletion-capability)
6. [COPPA & GDPR Compliance](#6-coppa--gdpr-compliance)
7. [Teen Account Protections](#7-teen-account-protections)
8. [Parental Controls](#8-parental-controls)
9. [Regulatory Investigations & Violations](#9-regulatory-investigations--violations)
10. [Key Takeaways for Phosra](#10-key-takeaways-for-phosra)

---

## 1. Data Collection Scope

### What ChatGPT Collects

OpenAI collects extensive data from ChatGPT users, including:

- **Conversation Content:** Every query, instruction, and interaction with ChatGPT is stored
- **Account Metadata:** User email, account creation date, authentication data
- **Device Information:** Device fingerprints, browser type, operating system
- **Network Data:** IP address, location information (derived from IP)
- **Usage Patterns:** Chat history, interaction frequency, feature usage
- **Uploaded Files:** Any files shared during conversations are logged and linked to the conversation
- **Third-Party Data:** OpenAI may integrate data from other sources for model improvement

### Data Collection by User Type

| User Type | Data Retained | Model Training | Details |
|-----------|--------------|-----------------|---------|
| **Free/Plus Users** | Indefinite (unless deleted) | Yes (default, opt-out available) | All conversations stored by default; training enabled by default |
| **Enterprise/Business** | Admin-controlled (typically 30 days) | No (default) | Data NOT used for model training unless explicitly opted in |
| **ChatGPT Edu** | Admin-controlled | No | Educational institutions have full data control |
| **API Users** | Per API terms | No | Business data not used for training |
| **Teen Accounts (13-17)** | Indefinite (unless deleted) | Depends on parental controls | Stored same as regular users; parents can disable training |

### Teen-Specific Data Collection

According to OpenAI's parental controls and teen account features:

- **Same collection scope as adult accounts**, but with additional safeguards
- **Parents can control** whether teen data is used for training
- **Restricted content filtration** applied automatically
- **Acute distress detection** uses conversation analysis, which may involve additional monitoring

---

## 2. Model Training & Opt-Out

### Default Behavior

**Critical fact:** By default, free and Plus user conversations **ARE used to train OpenAI's models** unless explicitly opted out.

- **Free tier:** Data used for model training by default
- **Plus tier:** Data used for model training by default
- **Enterprise/Business:** Data NOT used for training by default
- **API:** Data NOT used for training by default

### How to Opt Out (For Free/Plus Users)

Users can disable model training through the privacy portal:

1. Navigate to **Settings > Data Controls**
2. Find **"Improve the model for everyone"** toggle
3. **Switch OFF** to disable training on future conversations
4. Click to confirm

**Important limitations:**
- This opt-out is **NOT retroactive** — only applies to new conversations after the setting change
- Existing conversations already used for training cannot be excluded
- Setting must be manually enabled for each new account

### Teen Account Model Training

When parents link to a teen account through parental controls:

- Parents can toggle model training **off** for the teen
- **Default behavior:** Same as free/Plus users (training enabled)
- **With parental controls:** Parents have full control over this setting
- **Automatic protections:** If parents disable training, teen conversations are not used for improvement

### Temporary Chat Feature

OpenAI offers a workaround for privacy-conscious users:

- **Temporary Chat mode** prevents conversations from:
  - Appearing in chat history
  - Being used for training
  - Being used to create or reference memories
- **Auto-deletion:** Temporary chats are deleted after **30 days**

---

## 3. Data Retention & Deletion

### Standard Retention Policy

**Free & Plus Users:**
- Conversations stored **indefinitely** until user manually deletes them
- No automatic deletion after inactivity period
- Explicit user action required for removal

**Enterprise & Business Users:**
- Workspace admins determine retention policy
- Typical enterprise policy: **30-day auto-deletion** of conversation data
- More granular control than consumer accounts

### Deletion Timeline

When a user deletes a conversation:

1. **Immediate removal:** Chat is removed from the user's account dashboard immediately
2. **Scheduled deletion:** Conversation scheduled for **permanent deletion within 30 days**
3. **Legal holds:** OpenAI may retain data longer if required by law or court order
4. **De-identification exception:** Already de-identified data may not be deleted

### File Retention

- Uploaded files are tied to the conversation lifecycle
- If a conversation containing a file is deleted, the file is **immediately scheduled for deletion**
- Files follow the same 30-day permanent deletion timeline

### Special Cases

**Operator AI (OpenAI's Web Browsing Agent):**
- Screenshots and browsing activity persists for **90 days post-deletion**
- Justification: "abuse monitoring" purposes
- **Note:** This longer retention is unique among OpenAI features

**Temporary Chat Deletion:**
- Temporary chats auto-deleted after **30 days**
- Never stored in conversation history
- Most privacy-protective option available

### Teen Account Data Retention

- **Same retention policy** as standard free/Plus accounts
- **With parental controls:** Parents can set deletion preferences
- **No special teen deletion timeline**

---

## 4. Memory & Personalization Features

### How ChatGPT Memory Works

ChatGPT has two distinct memory mechanisms:

#### Type 1: Saved Memories

- **User-initiated:** Explicit facts users tell ChatGPT to remember
- **Examples:** Preferences ("I'm vegetarian"), goals, personal interests
- **Scope:** Remembers specific details across **all future conversations**
- **User activation:** Users must explicitly request memory saving

#### Type 2: Chat History Reference

- **Automatic learning:** ChatGPT learns from past conversations without explicit instruction
- **Scope:** References previous chats to recall preferences, interests, and context
- **Personalization:** Uses learned patterns to tailor future responses
- **Control:** Can be toggled on/off in Settings

### Personalization Benefits

When memory is enabled, ChatGPT:

- Remembers user's **tone, voice, and format preferences**
- Applies preferences automatically to drafts and responses
- Recalls **past topics of interest** for relevant suggestions
- Maintains context about **ongoing projects**
- Learns about **fitness, tech, hobby interests** and tailors responses accordingly

### User Control of Memory

Users can manage memory through **Settings > Personalization > Manage Memory:**

- **View specific memories** — See what ChatGPT has learned
- **Delete specific memories** — Remove individual remembered facts
- **Clear all memories** — Wipe entire memory database
- **Toggle memory features** on/off

### Teen Account Memory

**Default behavior with teen accounts:**
- Memory features work the same as adult accounts
- **Parental control available:** Parents can **disable memory** entirely

**When parents disable teen memory:**
- ChatGPT will not store new memories
- Previously stored memories are **deleted within 30 days**
- Conversation references are disabled
- User must enable memory for it to function

### Memory Data Persistence

- Saved memories are stored **indefinitely** unless deleted
- Memories are tied to account, not to individual conversations
- If user deletes a conversation, associated memories may persist
- **No automatic memory expiration policy**

---

## 5. Conversation Deletion Capability

### User Deletion Controls

#### Individual Conversation Deletion

- **Available to:** All free, Plus, and Enterprise users
- **How:** Users can delete any single conversation from their chat history
- **Timeline:** Immediate removal from account, permanent deletion within 30 days
- **Availability:** Simple delete button in chat interface

#### Bulk/All Conversation Deletion

- **Available to:** All users
- **How:** Clear entire chat history through Settings
- **Timeline:** All conversations scheduled for permanent deletion within 30 days
- **Caution:** This action is **not easily reversible**

### Deletion Permanence

**Important caveat from regulatory research:**

- OpenAI **cannot guarantee permanent deletion** in all cases
- **Legal holds:** Court orders, litigation, or regulatory demands may prevent deletion
- **Evidence preservation:** Deleted conversations can be preserved by court order
- **Regulatory retention:** Legal obligations may require data retention beyond user deletion request

**Quote from research:** "Deleted ChatGPT Conversations Can Be Preserved by Court Order — Your ChatGPT chats can't be erased and can end up in a courtroom"

### Temporary Chat Auto-Deletion

- **Automatic deletion:** Temporary chats auto-delete after **30 days**
- **No manual action needed**
- **Complete deletion:** Not stored in history, not used for training, not included in memories
- **Most privacy-protective deletion method available**

### Teen Account Deletion

- **Same deletion capability** as adult accounts
- **With parental controls:** Parents can delete teen's conversations
- **Parental visibility:** Parents **cannot view conversation contents** during normal usage
- **Exceptions:** If acute distress detected, trained reviewers may see limited content

---

## 6. COPPA & GDPR Compliance

### COPPA (Children's Online Privacy Protection Act)

#### The COPPA Gap Problem

- **COPPA protects:** Children under 13 years old
- **The gap:** Teens 13-17 are **NOT protected by COPPA** (falls in regulatory gap)
- **Industry response:** Many platforms use age 13+ requirement specifically to avoid COPPA compliance

#### ChatGPT's COPPA Approach

- **Minimum age:** 13 years old (at edge of COPPA protection)
- **Parental consent required:** Users under 18 must have parent/legal guardian permission
- **No clear COPPA compliance:** OpenAI has not published detailed COPPA compliance documentation

#### Documentation Gaps

- OpenAI **lacks transparent COPPA compliance mechanisms** for teen accounts
- **Age verification:** System attempts to predict age using signals, but process is not transparent
- **Parental consent process:** Not formally documented in COPPA-compliant manner

### GDPR (General Data Protection Regulation) — EU

#### Key GDPR Violations (Documented)

**Italy's €15 Million Fine (2024):**

1. **Training Without Legal Basis:** OpenAI trained ChatGPT on personal data without proper GDPR legal basis
2. **Data breach notification failure:** OpenAI failed to notify Italian data protection authority (Garante) about March 2023 data breach
3. **Insufficient age verification:** OpenAI did not implement proper age verification for users under 13
4. **Right to access violation:** OpenAI cannot disclose what data is collected or where it comes from
5. **Data accuracy issues:** Users cannot correct false information about themselves generated by ChatGPT

#### Current GDPR Compliance Issues

- **Right to be forgotten (Article 17):** OpenAI cannot reliably delete all personal data upon request
- **Data transparency:** Users cannot obtain copies of data processed about them
- **Source traceability:** OpenAI cannot disclose data sources or what data is used for training
- **Automated decision-making:** Unclear if ChatGPT responses constitute automated decisions subject to GDPR Article 22

#### Investigations Across EU

- **Italy:** €15 million fine (2024)
- **France:** Active investigation
- **Germany:** Active investigation
- **Spain:** Active investigation
- **EU (General):** Multiple investigations underway

---

## 7. Teen Account Protections

### Age Restrictions & Verification

**Account Requirements:**
- **Minimum age:** 13 years old
- **Maximum for teen account:** 18 years old
- **Age detection method:** OpenAI uses algorithmic signals to predict user age
- **Default safeguard:** If age cannot be confirmed, defaults to under-18 protections

### Age Prediction System

OpenAI's age prediction approach:

- Uses **multiple signals** to estimate user age (behavioral, account data, etc.)
- If signals suggest user is under 18, automatically activates U18 experience
- If incomplete information, **defaults to protective U18 mode**
- Provides verification mechanism for adults to confirm age

### Automatic Content Protections (Teen Accounts)

When account is identified or linked as teen (13-17):

- **Graphic content reduction:** Filters explicit/violent content
- **Sexual content blocking:** Blocks sexual, romantic, violent roleplay
- **Viral challenge filtering:** Prevents harmful trend suggestions
- **Beauty standard protection:** Filters extreme beauty/body ideal messaging
- **Jailbreak resistance:** Enhanced resistance to prompt injection attempts

### Safety Monitoring (Acute Distress Detection)

OpenAI implements monitoring for serious safety risks:

- **Automated detection:** Systems monitor for potential self-harm indicators
- **Human review:** Small team of trained specialists reviews flagged conversations
- **Parental notification:** If acute distress detected, parents receive:
  - **Email notification**
  - **Text message alert**
  - **Push notification** to parent's app

**Important limitation:**
- Parents do NOT have general access to teen conversations
- Parental notification only triggered by serious safety concerns
- Review process focuses on safety risk, not general monitoring

---

## 8. Parental Controls

### Setup Process

1. **Parent initiates:** Parent sends invite to teen via email
2. **Teen accepts:** Teen accepts parental control link
3. **Accounts linked:** Parent can now manage teen settings from parent's account
4. **Continuous management:** Parent adjusts settings as needed

### Parental Control Settings Available

| Control | Options | Notes |
|---------|---------|-------|
| **Quiet Hours** | Set specific times | ChatGPT unavailable during these hours |
| **Voice Mode** | Enable/Disable | Can turn off voice interaction completely |
| **Image Generation** | Enable/Disable | Remove DALL-E image creation capability |
| **Memory Features** | Enable/Disable | Control saved memories and chat history reference |
| **Model Training** | Enable/Disable | Opt teen out of data used for model improvement |
| **Content Filters** | Toggle | Can optionally disable safety filters (not recommended) |

### Parental Visibility & Access

**What parents can see:**
- Usage activity (frequency, timing)
- Feature usage
- Safety notifications if distress detected

**What parents CANNOT see:**
- Conversation contents (in normal operation)
- Specific queries or responses
- Chat history details
- Personal information shared with ChatGPT

**Exception for safety:**
- If system detects acute distress, trained reviewers may assess conversation content
- Parent notified only if serious risk identified
- Content review focused on safety, not surveillance

### Notification Settings

Parents receive alerts for:

- **Acute distress detection:** Email, text, push notification
- **Critical safety concerns:** Multiple notification channels
- **Usage activity:** Optional activity summaries (depends on OpenAI feature rollout)

---

## 9. Regulatory Investigations & Violations

### FTC Investigation (US)

#### Timeline & Status

- **Initiated:** July 2023
- **Status:** Ongoing (as of February 2026)
- **No formal violations announced yet**

#### Investigation Focus

**Two main areas:**

1. **Reputational Harm & Misinformation**
   - ChatGPT's tendency to "hallucinate" (generate false information)
   - False information about real people
   - No mechanism for correction

2. **Privacy & Data Security**
   - Data collection, sourcing, and retention practices
   - March 2023 data breach response
   - "Prompt injection" attack vulnerabilities
   - Data security safeguards

#### Investigation Scope

- 20-page Civil Investigative Demand (CID) issued to OpenAI
- Questions about accuracy and reliability evaluation
- Data collection and evaluation methodologies

### European Investigations & Fines

#### Italy's €15 Million GDPR Fine (2024)

**Violations identified:**

1. **Unlawful training:** Used personal data to train models without valid GDPR legal basis
2. **Data breach negligence:** Failed to notify data protection authority of March 2023 breach
3. **Age verification gaps:** No adequate age verification for under-13 users
4. **Lack of transparency:** Cannot disclose what data is collected or sources
5. **No correction mechanism:** Cannot correct false information in generated responses

**Fine amount:** €15 million (largest GDPR fine against AI company at time of issuance)

#### Ongoing Investigations

- **France:** Active investigation ongoing
- **Germany:** Active investigation ongoing
- **Spain:** Active investigation ongoing
- **EU Commission:** Broader AI compliance review

### Key Violations & Unresolved Issues

| Issue | Status | Details |
|-------|--------|---------|
| **Unlawful Model Training** | Fined (Italy) | Training on personal data without legal basis |
| **Data Breach Notification** | Fined (Italy) | Failed to notify authorities of 2023 breach |
| **Right to Access** | Unresolved | Cannot provide users data copies |
| **Right to Correction** | Unresolved | Cannot correct false information generated |
| **Data Accuracy** | Ongoing FTC Investigation | Hallucination/false information issues |
| **Age Verification** | Fined (Italy) | Inadequate protections for under-13 users |
| **Right to be Forgotten** | Unresolved | Cannot reliably delete all personal data |
| **Transparent Data Sourcing** | Unresolved | Cannot explain data origins or usage |

---

## 10. Key Takeaways for Phosra

### Privacy-by-Design Recommendations

Based on ChatGPT's gaps and violations, Phosra should implement:

1. **Default Data Minimization**
   - Collect only essential data needed for chatbot functionality
   - Clear, explicit user consent for all data types
   - Avoid indefinite retention defaults

2. **Model Training Transparency**
   - Make opt-out the default (opposite of ChatGPT)
   - Clear documentation of what data is used for training
   - Retroactive opt-out capability for historical conversations
   - Special protections for teen accounts

3. **Robust Deletion Capability**
   - Permanent deletion on request (not just scheduling)
   - Guaranteed deletion for teen users
   - No indefinite retention periods
   - Clear communication about legal hold exceptions

4. **Teen Account Protections**
   - Exceed COPPA requirements (ChatGPT's gap area)
   - Documented parental consent process
   - Transparent age verification mechanism
   - More extensive parental visibility than ChatGPT
   - Automatic content filtering without opt-out

5. **Memory/Personalization Control**
   - Make memory opt-in (not default)
   - Full transparency about what is remembered
   - Easy memory deletion for users
   - Parental controls for teen memory features
   - Clear distinction between conversation history and persistent memory

6. **GDPR Compliance**
   - Implement right to access from day one
   - Design data deletion to be reliable and verifiable
   - Maintain transparent data sourcing documentation
   - Support user correction of inaccurate information
   - EU data residency for EU users

7. **Regulatory Positioning**
   - Engage proactively with regulators (FTC, data authorities)
   - Publish comprehensive privacy documentation
   - Conduct regular privacy impact assessments
   - Maintain detailed compliance audit trails

### Competitive Advantage

By addressing ChatGPT's documented compliance gaps, Phosra can:

- Position as **privacy-first alternative** to ChatGPT
- Appeal to **privacy-conscious users** and institutions
- Build trust with **regulators and policymakers**
- Demonstrate **child safety leadership** (vs. ChatGPT's COPPA gap)
- Establish **data control standards** for AI industry

### Risk Mitigation

Avoid ChatGPT's regulatory exposure:

- Don't rely on age verification algorithms alone
- Don't make data collection indefinite by default
- Don't make model training opt-out the default for consumers
- Don't eliminate parental visibility for teen accounts
- Don't ignore GDPR/COPPA requirements
- Don't create "hallucination" liability by training on questionable sources

---

## Research Sources

### Official OpenAI Resources

- [OpenAI Privacy Policy (Row/Global)](https://openai.com/policies/row-privacy-policy/)
- [OpenAI US Privacy Policy](https://openai.com/policies/us-privacy-policy/)
- [OpenAI Consumer Privacy Portal](https://openai.com/consumer-privacy/)
- [How Your Data is Used to Improve Model Performance](https://help.openai.com/en/articles/5722486-how-your-data-is-used-to-improve-model-performance)
- [Data Controls FAQ](https://help.openai.com/en/articles/7730893-data-controls-faq)
- [Chat and File Retention Policies](https://help.openai.com/en/articles/8983778-chat-and-file-retention-policies-in-chatgpt)
- [Memory FAQ](https://help.openai.com/en/articles/8590148-memory-faq)
- [Parental Controls on ChatGPT FAQ](https://help.openai.com/en/articles/12315553-parental-controls-on-chatgpt-faq)
- [Age Prediction in ChatGPT](https://help.openai.com/en/articles/12652064-age-prediction-in-chatgpt)
- [Introducing Parental Controls](https://openai.com/index/introducing-parental-controls/)
- [Updating Our Model Spec with Teen Protections](https://openai.com/index/updating-model-spec-with-teen-protections/)
- [Introducing the Teen Safety Blueprint](https://openai.com/index/introducing-the-teen-safety-blueprint/)
- [Memory and New Controls for ChatGPT](https://openai.com/index/memory-and-new-controls-for-chatgpt/)

### Privacy & Compliance Research

- [NordVPN: Is ChatGPT Private? 2026 Guide](https://nordvpn.com/blog/is-chatgpt-private/)
- [Nightfall AI: Does ChatGPT Store Your Data in 2025?](https://www.nightfall.ai/blog/does-chatgpt-store-your-data-in-2025)
- [DataStudios: ChatGPT Data Retention Policies 2025](https://www.datastudios.org/post/chatgpt-data-retention-policies-updated-rules-and-user-controls-in-2025)
- [Usercentrics: ChatGPT Privacy Policy Guide](https://usercentrics.com/guides/privacy-policies-of-major-platforms/chatgpt-privacy-policy/)
- [MDPI: Privacy Concerns in ChatGPT Data Collection](https://www.mdpi.com/1999-5903/17/11/511)

### Teen Safety & Parental Controls

- [Techlicious: Teen Accounts at ChatGPT](https://www.techlicious.com/blog/teen-accounts-come-to-chatfpt-heres-what-parents-need-to-know/)
- [Canopy: ChatGPT Parental Controls Guide](https://canopy.us/blog/chatgpt-parental-controls/)
- [Bitdefender: ChatGPT Parental Controls Analysis](https://www.bitdefender.com/en-us/blog/hotforsecurity/chatgpt-now-has-parental-controls-what-parents-can-now-do-and-what-they-cant/)
- [Cyberbullying Research Center: Teen Safety Blueprint](https://cyberbullying.org/open-ai-teen-safety-blueprint-takeaways/)
- [CBS News: ChatGPT Teen Account Safety](https://www.cbsnews.com/news/openai-chatgpt-under18-safety-controls-teens/)

### Regulatory & Compliance Issues

- [Federal Trade Commission: OpenAI Investigation](https://www.caidp.org/cases/openai/)
- [National Law Review: Italy €15M GDPR Fine](https://natlawreview.com/article/dont-forget-eu-italy-issued-first-genai-fine-eu15-million-alleging-gdpr-violations)
- [EPIC: FTC Complaint Against OpenAI (Oct 2024)](https://epic.org/wp-content/uploads/2024/10/EPIC-FTC-OpenAI-complaint.pdf)
- [Washington Post: FTC Investigates OpenAI Data Leak](https://www.washingtonpost.com/technology/2023/07/13/ftc-openai-chatgpt-sam-altman-lina-khan/)
- [Legal Nodes: GDPR Compliance of OpenAI's API](https://www.legalnodes.com/article/chatgpt-privacy-risks)
- [ComplyDog: OpenAI's GDPR Fine Analysis](https://complydog.com/blog/openai-gdpr-fine)
- [Noyb.eu: ChatGPT Right to Correction Issues](https://noyb.eu/en/chatgpt-provides-false-information-about-people-and-openai-cant-correct-it)
- [FTC: AI Companies Uphold Privacy Commitments](https://www.ftc.gov/policy/advocacy-research/tech-at-ftc/2024/01/ai-companies-uphold-your-privacy-confidentiality-commitments)
- [The Regulatory Review: FTC's OpenAI Investigation](https://www.theregreview.org/2023/09/25/lin-openai-investigation-puts-ai-companies-on-notice/)

### COPPA & Age Restrictions

- [Technical.ly: Why COPPA Doesn't Protect ChatGPT Users](https://technical.ly/civics/ai-social-media-child-privacy-coppa-guest-post/)
- [National Centre for AI: Age Restrictions & Consent in GenAI](https://nationalcentreforai.jiscinvolve.org/wp/2025/08/28/age-restrictions-and-consent-to-use-generative-ai/)

---

**Document Status:** Complete
**Last Updated:** February 26, 2026
**For:** Phosra AI Chatbot Research Plan (Section F)
