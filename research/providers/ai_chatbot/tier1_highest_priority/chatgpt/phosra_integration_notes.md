# ChatGPT — Phosra Integration Notes

**Platform:** ChatGPT (OpenAI)
**Last Updated:** 2026-02-26

---

## Quick Reference

| Item | Value |
|------|-------|
| Platform | ChatGPT (OpenAI) |
| Tier | 1 — Highest Priority |
| Adapter Strategy | Hybrid (Extension + Network + Moderation API) |
| Adapter Feasibility | 5/10 |
| Safety Rating | 6/10 |
| Common Sense Rating | High Risk |
| Priority | HIGH — largest teen user base |

---

## What Phosra Adds (ChatGPT's Gaps)

### Controls ChatGPT Doesn't Have That Phosra Can Provide

1. **Daily time limits** — ChatGPT has none. Phosra can enforce via extension + network block.
2. **Message limits per day** — ChatGPT only has rate limits (billing). Phosra can set custom per-day caps.
3. **Break reminders** — ChatGPT has zero wellness check-ins. Phosra can inject "take a break" prompts.
4. **Session cooldown** — Force a gap between sessions (e.g., 30 min break after 1 hour).
5. **Custom topic blocking** — ChatGPT has fixed filters. Phosra can add NLP-based topic detection.
6. **Homework detection** — ChatGPT doesn't detect or restrict academic misuse. Phosra can flag patterns.
7. **Cross-platform monitoring** — Parents see ChatGPT alongside other AI platforms in one dashboard.
8. **Engagement pattern analysis** — Track usage trends over weeks/months, detect escalating dependency.
9. **Real-time parent alerts** — ChatGPT's safety notifications are limited. Phosra can push alerts instantly.
10. **Schedule granularity** — Weekday vs. weekend schedules, school hours blocking.

---

## Integration Architecture Decision Log

### Decision 1: Browser Extension as Primary Monitoring

**Why:** No API access to consumer ChatGPT data. Extension is the only way to observe conversations and enforce client-side rules.

**Trade-offs:**
- PRO: Full visibility into visible conversation content
- PRO: Can inject UI elements (break reminders, warnings, blocks)
- CON: Desktop browsers only — no mobile app coverage
- CON: Can be disabled by the user
- CON: Requires ongoing maintenance as ChatGPT UI evolves

**Mobile gap mitigation:** Network-level controls (DNS blocking) cover mobile when on home network. Device-level controls (Screen Time, Family Link) can restrict the ChatGPT mobile app.

### Decision 2: OpenAI Moderation API for Content Classification

**Why:** Free, reliable, consistent content classification. No need to build our own.

**Trade-offs:**
- PRO: Industry-standard classification, 11 categories
- PRO: Free (no API cost)
- PRO: Low latency (~200ms)
- CON: Sends child's conversation text to OpenAI (privacy consideration)
- CON: Missing categories: manipulation, emotional exploitation, academic dishonesty

**Privacy mitigation:** OpenAI states Moderation API inputs are not stored or used for training. Phosra privacy policy must disclose this processing. Consider offering parents opt-out of Moderation API classification (with degraded alerting).

### Decision 3: Network-Level Enforcement for Hard Blocking

**Why:** Extension-only enforcement is bypassable. Network-level provides hard enforcement.

**Trade-offs:**
- PRO: Cannot be bypassed by disabling extension or switching browsers
- PRO: Works for mobile apps on home network
- CON: Binary (blocks entire platform, not granular)
- CON: Bypassed by VPN or cellular data
- CON: Requires router/DNS integration

### Decision 4: Playwright Automation Deprioritized

**Why:** High maintenance, fragile, limited capability (only quiet hours and feature toggles).

**Decision:** Build but keep as supplementary. Primary enforcement through extension + network. Playwright is a "nice to have" for settings sync, not a "must have."

---

## Domain Blocklist

When enforcing network-level controls, block these domains:

```
chat.openai.com
chatgpt.com
cdn.oaistatic.com
api.openai.com
auth0.openai.com
platform.openai.com
```

**Note:** Blocking `api.openai.com` also blocks developer API access. If the family uses OpenAI APIs for other purposes, this domain should be excluded from the blocklist.

---

## ChatGPT DOM Structure Notes (for Extension Development)

> These are subject to change with ChatGPT UI updates. Last verified 2026-02-26.

- **Chat messages container:** React-rendered, messages appear as child divs with data attributes
- **User messages vs AI messages:** Distinguished by CSS classes and container structure
- **Streaming responses:** Arrive via WebSocket/EventSource, text is progressively appended
- **New conversation detection:** URL changes to `/c/{conversation-id}` pattern
- **Model selector:** Dropdown in the header area, accessible via DOM
- **Session state:** Managed via React context, accessible through `__next` data attributes

**Extension strategy:** Use `MutationObserver` on the chat container to detect new messages. Avoid relying on specific CSS class names (change frequently). Instead, target structural patterns (nesting depth, element roles).

---

## OpenAI API Keys Needed

| API | Key Type | Cost | Purpose |
|-----|----------|------|---------|
| Moderation API | Standard API key | Free | Content classification of captured messages |
| Chat Completions (optional) | Standard API key | Usage-based | NLP topic detection, conversation summarization |

**Note:** These are Phosra's API keys, not the family's. The family does not need to provide their OpenAI credentials for Phosra to use the Moderation API.

---

## Competitive Landscape

### How Other Parental Control Apps Handle ChatGPT

| App | Approach | Limitations |
|-----|----------|-------------|
| Bark | Network monitoring, keyword alerts | Cannot see ChatGPT conversation content (encrypted) |
| Qustodio | App blocking, time limits | Blocks entire app, no content monitoring |
| Net Nanny | Web filtering, time limits | Can block chat.openai.com, no content insight |
| Google Family Link | App-level time limits | Can restrict ChatGPT app time, no content monitoring |
| Apple Screen Time | App-level time limits, web content filter | Can restrict app time and web access, no content monitoring |

**Phosra's differentiation:** Browser extension provides actual conversation-level monitoring and content classification — no other parental control tool offers this for ChatGPT.

---

## Feature Parity Tracking

Track what OpenAI adds natively vs. what Phosra provides:

| Feature | OpenAI Status | Phosra Status | Notes |
|---------|-------------|---------------|-------|
| Parent account linking | Shipped | Detect | Phosra detects if linked, encourages linking |
| Quiet hours | Shipped | Sync + enforce | Network-level backup to OpenAI's quiet hours |
| Time limits | Not available | Phosra provides | Key differentiator |
| Message limits | Not available | Phosra provides | Key differentiator |
| Break reminders | Not available | Phosra provides | Key differentiator |
| Conversation monitoring | Summary only | Phosra enhances | Extension captures more detail |
| Safety alerts | Basic | Phosra enhances | Faster, more configurable alerts |
| Topic blocking | Not available | Phosra provides | NLP-based topic detection |
| Homework detection | Not available | Phosra provides | Academic integrity support |
| Usage analytics | Basic | Phosra enhances | Cross-platform analytics |

---

## Open Questions

1. **Will OpenAI release a parental control API?** — No public roadmap. OpenAI's focus appears to be on built-in features, not third-party integration. Monitor blog.openai.com and API changelog.

2. **Mobile app monitoring?** — iOS and Android ChatGPT apps cannot be monitored by a browser extension. Options: MDM integration, VPN-based content inspection (complex), or accept the mobile gap and rely on device-level time limits.

3. **Guest access blocking?** — A child can use ChatGPT without an account. The browser extension can detect guest mode and block it. Network-level controls can block the domain entirely. But a determined child can access ChatGPT from a friend's device or school computer.

4. **Voice mode monitoring?** — Voice conversations are not visible in the DOM. The extension cannot capture voice-to-voice interactions. Consider: system audio capture (high privacy concern) or rely on OpenAI's built-in voice safety controls.

5. **ChatGPT desktop app?** — OpenAI has macOS and Windows desktop apps. These are Electron-based, which may support extension-like injection, but this needs investigation.
