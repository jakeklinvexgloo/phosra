# ChatGPT — Phosra Adapter Assessment

**Platform:** ChatGPT (OpenAI)
**Assessment Date:** 2026-02-26
**Overall Feasibility:** 5/10
**Recommended Strategy:** Hybrid (Browser Extension + Network-Level + Moderation API)

---

## Executive Summary

ChatGPT presents a paradox for Phosra integration: OpenAI operates the most capable and well-documented API in the AI industry, but provides **zero API access to parental control features**. The developer API (Chat Completions, Moderation, Assistants) is world-class; the parental control surface is web-dashboard-only with no programmatic access.

This means the Phosra ChatGPT adapter must rely on a combination of client-side monitoring (browser extension), network-level enforcement (DNS/router blocking), and creative use of OpenAI's public APIs (Moderation API for content classification).

---

## API Inventory

### Available APIs (Developer-Facing)

| API | Endpoint | Auth | Relevance to Phosra |
|-----|----------|------|---------------------|
| Chat Completions | `POST /v1/chat/completions` | API Key | Low — developer API, not consumer |
| Moderation | `POST /v1/moderations` | API Key | **High** — free content classification |
| Responses | `POST /v1/responses` | API Key | Low — developer API |
| Assistants | Multiple endpoints | API Key | Low — developer API |
| Models | `GET /v1/models` | API Key | None |
| Images (DALL-E) | `POST /v1/images/generations` | API Key | None |
| Audio | Multiple endpoints | API Key | None |

### Unavailable APIs (Parental Controls)

| Needed Capability | API Status | Alternative |
|-------------------|-----------|-------------|
| Parent-teen account linking | No API | Playwright automation of web dashboard |
| Safety settings configuration | No API | Playwright automation |
| Quiet hours management | No API | Playwright automation |
| Feature toggles (DALL-E, voice, etc.) | No API | Playwright automation |
| Usage statistics retrieval | No API | Browser extension tracking |
| Conversation transcript access | No API | Browser extension capture (partial) |
| Safety alert webhooks | No API | Browser extension detection |
| Memory management | No API | No viable alternative |
| Account-level content filter config | No API | No viable alternative |

---

## Adapter Architecture

### Recommended: Hybrid Multi-Layer Approach

```
┌─────────────────────────────────────────────────┐
│                 Phosra Platform                   │
│                                                   │
│  ┌───────────┐  ┌──────────┐  ┌───────────────┐ │
│  │ Extension  │  │ Network  │  │  Config Sync  │ │
│  │ Manager    │  │ Controls │  │  (Playwright) │ │
│  └─────┬─────┘  └────┬─────┘  └──────┬────────┘ │
│        │              │               │           │
└────────┼──────────────┼───────────────┼───────────┘
         │              │               │
    ┌────▼────┐   ┌─────▼─────┐  ┌─────▼──────┐
    │ Browser │   │ DNS/Router│  │   OpenAI    │
    │Extension│   │  Control  │  │  Dashboard  │
    │(client) │   │ (network) │  │ (Playwright)│
    └────┬────┘   └─────┬─────┘  └─────┬──────┘
         │              │               │
         └──────────────┼───────────────┘
                        │
                  ┌─────▼─────┐
                  │  ChatGPT  │
                  │(consumer) │
                  └───────────┘
```

### Layer 1: Browser Extension (Monitoring + Enforcement)

**Capabilities:**
- Track message count per session and per day
- Track session duration (time spent on chat.openai.com)
- Capture visible conversation text for content analysis
- Detect crisis UI elements (988 hotline display)
- Inject break reminders and time warnings
- Block the page when limits are exceeded
- Detect which model/GPT is being used

**Limitations:**
- Desktop browsers only (Chrome, Firefox, Edge, Safari)
- Cannot monitor mobile apps (iOS/Android ChatGPT app)
- Can be disabled by the user (though Phosra can detect this)
- Only captures text visible in the viewport, not full conversation history
- Does not intercept API-level data

**Implementation Notes:**
- Use `MutationObserver` to detect new messages in the ChatGPT DOM
- ChatGPT's React-based UI has relatively stable DOM structure but changes with updates
- WebSocket monitoring can detect streaming responses
- Extension-to-Phosra communication via authenticated API calls

### Layer 2: Network-Level Controls (Hard Enforcement)

**Capabilities:**
- Block `chat.openai.com`, `chatgpt.com`, and `api.openai.com` domains
- Enforce schedule restrictions (quiet hours) at the network level
- Block after time/message limits exceeded (triggered by extension or Phosra backend)
- Cannot be bypassed by switching browsers or disabling extension

**Limitations:**
- Requires Phosra router/DNS integration OR device-level DNS configuration
- Blocks the entire ChatGPT platform, not granular (can't allow homework help but block roleplay)
- VPN can bypass DNS-level blocks
- Mobile data (cellular) bypasses home network controls

**Implementation Notes:**
- Integrate with Phosra's existing DNS/router control infrastructure
- Domain list: `chat.openai.com`, `chatgpt.com`, `cdn.openai.com`, `api.openai.com`
- Time-based rules: Block domains during quiet hours
- Event-triggered rules: Block domains when extension reports limit exceeded

### Layer 3: OpenAI Moderation API (Content Classification)

**Capabilities:**
- Classify any text against OpenAI's 11-category taxonomy
- Free, no usage limits disclosed (generous rate limits)
- Consistent, reliable scoring
- Categories: hate, harassment, self-harm (3 sub-types), sexual (2 sub-types), violence (2 sub-types)

**Limitations:**
- Requires text to be sent to OpenAI's API (privacy consideration — sending child's conversations to OpenAI for classification)
- Only classifies text, not images or voice
- Does not detect manipulation, emotional exploitation, or academic dishonesty
- Latency: ~200ms per request

**Implementation Notes:**
- Feed captured conversation text from the browser extension to the Moderation API
- Use classification scores to trigger parent alerts
- Map OpenAI categories to Phosra's safety policy configuration
- Consider privacy implications: conversations sent to Moderation API are not stored by OpenAI (per docs)

### Layer 4: Playwright Configuration Sync (Settings Management)

**Capabilities:**
- Automate the OpenAI parent dashboard to:
  - Set quiet hours
  - Toggle features (DALL-E, voice, web browsing)
  - Check current settings
- Sync Phosra safety policy → ChatGPT parent settings

**Limitations:**
- Fragile — any UI change breaks automation
- Requires parent's OpenAI credentials
- Slow (browser automation is inherently slow)
- May trigger anti-automation detection (Cloudflare, CAPTCHA)
- Cannot access features that don't exist in the dashboard

**Implementation Notes:**
- Run as a periodic sync (not real-time)
- Use headless Chromium with stealth plugins
- Implement robust error handling and retry logic
- Alert Phosra if sync fails (so parent knows settings may be out of sync)
- Consider: is this worth the maintenance cost given the limited settings available?

---

## Capability Matrix

| Phosra Control Category | ChatGPT Native? | Phosra Adapter? | Method | Reliability |
|------------------------|-----------------|-----------------|--------|------------|
| **Content Safety** | | | | |
| Explicit content filter | Yes (teen default) | Monitor | Extension + Moderation API | Medium |
| Violence filter | Yes (teen default) | Monitor | Extension + Moderation API | Medium |
| Self-harm detection | Yes | Alert forwarding | Extension detects crisis UI | Medium |
| Custom topic blocking | No | Yes | Extension + client-side NLP | Low |
| Jailbreak detection | Partial | Monitor | Moderation API on responses | Low |
| **Conversation Controls** | | | | |
| Daily time limit | No | Yes | Extension + network block | High |
| Message limit | No | Yes | Extension counting | High |
| Session cooldown | No | Yes | Extension timer | High |
| Break reminders | No | Yes | Extension injection | High |
| Quiet hours | Yes (parent) | Sync | Playwright + network block | High |
| Schedule (weekday/weekend) | No | Yes | Extension + network | High |
| **Emotional Safety** | | | | |
| Block romantic roleplay | Yes (teen) | Monitor | Extension + NLP | Medium |
| Dependency detection | No | Partial | Extension session analysis | Low |
| AI identity enforcement | Partial | No | Cannot modify model behavior | None |
| **Privacy** | | | | |
| PII sharing detection | No | Partial | Extension + NLP | Low |
| Block image uploads | Yes (teen DALL-E) | Sync | Playwright | Medium |
| Memory management | Manual | No | No API or viable automation | None |
| Data deletion | Manual | No | No API | None |
| **Academic** | | | | |
| Homework detection | No | Partial | Extension + NLP | Low |
| Learning mode enforcement | No | No | Cannot modify model behavior | None |
| **Monitoring** | | | | |
| Usage statistics | Yes (parent) | Yes | Extension tracking | High |
| Conversation summaries | Yes (parent) | Partial | Extension + NLP | Medium |
| Full transcripts | No | Partial | Extension capture (active view) | Low |
| Safety alerts | Partial | Yes | Extension + Moderation API | Medium |

---

## Risk Analysis

### Integration Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| ChatGPT UI changes break extension | High | High | Versioned selectors, rapid update process, DOM mutation strategy |
| Cloudflare blocks Playwright automation | Medium | Medium | Stealth plugins, cookie persistence, fallback to manual instructions |
| Mobile app usage bypasses extension | High | High | Network-level controls, parent education |
| OpenAI adds API for parental controls | Low (positive) | Medium | Migration path from extension to API |
| VPN bypasses network controls | Medium | Low | Device-level controls, education |
| Teen disables extension | Medium | Medium | Phosra detects missing heartbeat, alerts parent |

### Privacy Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Sending child conversations to Moderation API | Medium | Clear disclosure in Phosra privacy policy; OpenAI states Moderation API doesn't retain data |
| Storing conversation captures on Phosra servers | High | End-to-end encryption, minimal retention, parent consent |
| Parent accessing teen conversation content | Medium | Summary-only default, full access opt-in with teen disclosure |

---

## Implementation Priority

### Phase 1 (MVP) — High Value, High Feasibility
1. **Browser extension with message/time counting** — Fills ChatGPT's biggest gap
2. **Network-level quiet hours enforcement** — Hard enforcement parents can trust
3. **Usage statistics dashboard** — Extension-tracked data on Phosra dashboard

### Phase 2 — Medium Value, Medium Feasibility
4. **Moderation API integration** — Content classification for parent alerts
5. **Break reminders injection** — Wellness prompts during long sessions
6. **Playwright settings sync** — Keep Phosra settings in sync with ChatGPT parent dashboard

### Phase 3 — High Value, Low Feasibility
7. **Client-side NLP for topic detection** — Custom topic blocking, homework detection
8. **Conversation capture and summarization** — Partial transcript access for parents
9. **Emotional dependency analysis** — Session pattern analysis over time

---

## Maintenance Burden

| Component | Update Frequency | Effort |
|-----------|-----------------|--------|
| Browser extension (DOM selectors) | Monthly (ChatGPT updates frequently) | Medium |
| Playwright automation | Monthly+ (dashboard changes) | High |
| Moderation API integration | Rare (stable API) | Low |
| Network-level controls | Rare (domain list stable) | Low |
| Client-side NLP models | Quarterly | Medium |

**Estimated maintenance cost:** Medium-High — ChatGPT's frequent UI updates will require ongoing attention to keep the extension functional.

---

## Verdict

ChatGPT is a **must-have** platform for Phosra given its dominant market share among minors. The adapter will require significant engineering investment in browser extension technology rather than clean API integration. The good news is that ChatGPT's gaps (no time limits, no message limits, limited monitoring) are exactly where Phosra adds the most value.

**Recommended next steps:**
1. Build a Chrome extension prototype that tracks message count and session duration on chat.openai.com
2. Test the Moderation API for content classification reliability and latency
3. Map the ChatGPT parent dashboard UI for Playwright automation feasibility
4. Monitor OpenAI's API roadmap for any parental control API announcements
