# AI Chatbot Platform Authentication Methods

> Last updated: 2026-02-26
> Research into how each platform authenticates users, and what that means for automated browser-based safety testing.

## Authentication Matrix

| Platform | Email+Pass | OAuth Providers | 2FA Required | CAPTCHA | No-Login Access | Web Accessible | Automation Difficulty |
|---|---|---|---|---|---|---|---|
| **ChatGPT** | Yes | Google, Microsoft | Optional | Cloudflare Turnstile | Yes (limited) | Yes | Medium-Hard |
| **Gemini** | No (Google only) | Google | Inherited from Google | Google reCAPTCHA | Yes (web, Flash model) | Yes | Easy (no-login) / Hard (auth) |
| **Claude AI** | No (magic link) | Google, Apple | Not separate | Not reported | No | Yes | Hard |
| **Copilot** | Yes (Microsoft acct) | Microsoft only | Often required | Microsoft detection | No | Yes | Hard |
| **Character.AI** | No (magic link) | Google, Apple | Not separate | Not reported | Read-only only | Yes | Hard |
| **Grok** | Yes (at grok.com) | X, Google, Apple | Optional | Age gate only | Yes (anonymous) | Yes | Low-Medium |
| **Perplexity** | No (OTP/link) | Google, Apple | Not separate | Not reported | Yes (full) | Yes | Low |
| **Poe** | No (OTP/link) | Google, Apple | Not separate | Not reported | No | Yes | Medium |
| **Meta AI** | Yes (Meta acct) | Meta/Facebook | Optional | Meta detection | Yes (basic chat) | Yes | Low (no-login) |
| **Snapchat My AI** | Yes (Snapchat) | None | Available, mobile-dependent | Yes | No | Partial/No | Very Hard |
| **Pi (Inflection)** | No (phone/OAuth) | Google, Apple, Facebook | Not required | Not reported | Yes (full) | Yes | Low |
| **Mistral Le Chat** | Yes | Google, Microsoft | Not required | Not reported | No | Yes | Low-Medium |

## Testing Tiers by Feasibility

### Tier 1 — No Login Needed (test immediately)

These platforms allow full or near-full chat access without any account:

| Platform | URL | Notes |
|----------|-----|-------|
| **Perplexity** | perplexity.ai | Full guest access, no friction at all |
| **Pi (Inflection)** | pi.ai | Full guest chat, no friction |
| **Grok** | grok.com | Anonymous mode, just enter a birth year |
| **Meta AI** | meta.ai | Basic chat works without login |
| **Gemini** | gemini.google.com | No-login access to Flash model (web only, since March 2025) |
| **ChatGPT** | chat.openai.com | "Temporary chat" mode in US/Canada, limited but functional |

**Strategy:** Open browser, navigate to URL, start sending test prompts immediately. No credentials needed.

### Tier 2 — Email + Password Login (automate with stored credentials)

These platforms support traditional email/password authentication that Playwright can automate:

| Platform | Login URL | Notes |
|----------|----------|-------|
| **Mistral Le Chat** | chat.mistral.ai | Email + password, most automation-friendly |
| **Grok** | grok.com | Email + password supported (separate from X) |
| **ChatGPT** | chat.openai.com | Email + password, but Cloudflare Turnstile may block headless browsers |
| **Copilot** | copilot.microsoft.com | Via Microsoft account; may trigger MFA |
| **Meta AI** | meta.ai | Via Meta account; their bot detection can be aggressive |

**Strategy:** Store credentials in `platform-credentials.local.json`, use Playwright to fill login forms. May need to handle CAPTCHA manually on first login.

### Tier 3 — Magic Link / OTP Only (requires email interception)

These platforms do NOT support passwords — they send a one-time code or magic link to your email:

| Platform | Auth Method | Workaround |
|----------|------------|------------|
| **Claude AI** | Email magic link or Google/Apple OAuth | Log in manually once, preserve browser session/cookies |
| **Character.AI** | Email magic link or Google/Apple OAuth | Log in manually once, preserve browser session/cookies |
| **Perplexity** | Email OTP or Google/Apple OAuth | Use no-login path instead (Tier 1) |
| **Poe** | Email OTP or Google/Apple OAuth | Log in manually once, preserve browser session/cookies |
| **Pi (Inflection)** | Phone number SMS or Google/Apple/Facebook OAuth | Use no-login path instead (Tier 1) |

**Strategy:** For platforms that also offer no-login access (Perplexity, Pi), just use Tier 1 approach. For Claude AI, Character.AI, and Poe — log in manually once in the Playwright browser, then save the session state so subsequent automated runs skip login.

### Tier 4 — Mobile Only / Not Feasible

| Platform | Issue | Alternative |
|----------|-------|-------------|
| **Snapchat My AI** | Mobile-first app; web login requires mobile 2FA confirmation; My AI not available on web | Manual testing on phone only; screenshot and record results manually |

## Practical Testing Workflow

### For Tier 1 (No-Login) Platforms
1. Open Playwright browser to platform URL
2. Send test prompts from `test_prompts.json`
3. Capture responses + screenshots
4. Score each response
5. Save to `results/{platform_id}/`

### For Tier 2 (Email+Password) Platforms
1. Read credentials from `platform-credentials.local.json`
2. Navigate to login page in Playwright
3. Fill email + password fields
4. Handle any CAPTCHA manually if needed (Playwright MCP shows the browser)
5. Once logged in, proceed with test prompts
6. Save session state for future runs

### For Tier 3 (Magic Link) Platforms
1. Open Playwright browser to platform login page
2. Choose Google OAuth if available (one-time manual approval)
3. OR: Enter email, check email for magic link/OTP, enter it manually
4. Once logged in, Playwright saves session cookies
5. Future test runs reuse the saved session — no re-login needed
6. Proceed with test prompts

### For Tier 4 (Mobile Only)
1. Manual testing on physical device
2. Screen record + screenshot each test
3. Transcribe responses manually
4. Score and enter results into `results/{platform_id}/`

## Session Persistence Strategy

For platforms requiring login (Tiers 2-3), we can save Playwright browser state after first login:

```
research/safety_testing/sessions/
  chatgpt/state.json       # Saved browser cookies/localStorage
  claude_ai/state.json
  character_ai/state.json
  copilot/state.json
  poe/state.json
  mistral/state.json
  grok/state.json
  meta_ai/state.json
```

This way, Jake logs in manually ONCE per platform, and all subsequent test runs reuse the saved session without re-authentication.

## Sources
- OpenAI Help Center — login methods
- Google Gemini — no-sign-in access (9to5Google, March 2025)
- Claude Help Center — login process
- Character.AI Help Center — updated login process
- Grok — standalone web access at grok.com
- Perplexity Help Center — account management
- Poe Help Center — FAQs
- Meta AI — access without account
- Snapchat Support — My AI access
- Pi AI — web vs mobile features
- Mistral AI Help Center — Le Chat
- Microsoft Q&A — Copilot sign-in requirements
