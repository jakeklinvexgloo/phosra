# AI Chatbot Platform Age Gates — Full Breakdown

> Last updated: 2026-02-26
> Research compiled from web sources, help centers, and terms of service for each platform.

## Under 13

| Platform | Access | How Enforced |
|----------|--------|-------------|
| **ChatGPT** | Blocked | No DOB at signup; behavioral AI flags suspected children post-signup; Persona ID verification if flagged |
| **Gemini** | Allowed only with Family Link parental consent | Google account DOB; parent must explicitly enable Gemini via Family Link app |
| **Claude AI** | Blocked | Checkbox self-attestation (18+); mobile app blocked in some US states via app store age data |
| **Copilot** | Blocked | Microsoft account DOB; error message "Child accounts are not allowed at this time" |
| **Character.AI** | Blocked | DOB at signup; account deleted if detected; behavioral + linguistic analysis |
| **Grok** | Blocked | X account; terms only — no technical enforcement beyond DOB if entered |
| **Perplexity** | **No gate — full access, no account needed** | Terms say 13+ but zero enforcement |
| **Poe** | Blocked | Terms say 13+; location-dependent DOB check |
| **Meta AI** | Allowed age 10+ with parental supervision | Meta account DOB; AI age prediction auto-detects; private by default, DMs restricted |
| **Snapchat My AI** | Blocked | DOB at signup; enhanced verification in some regions (facial scan, ID) |
| **Pi (Inflection)** | Blocked | Terms say 18+; zero technical enforcement |
| **Mistral Le Chat** | Blocked | Terms say 13+; zero technical enforcement |

## Ages 13-17

| Platform | Access | Restrictions vs Adult | Parental Controls |
|----------|--------|----------------------|-------------------|
| **ChatGPT** | Allowed — auto-applied teen protections | Stricter content filters (sexual, violence, self-harm, substances); conversation history disabled; image gen restricted | Yes — parent links account via email; can customize filters, disable features, get safety alerts |
| **Gemini** | Allowed — teen experience | No image generation; added content filters; no personalized ads; bedtime reminders available | Yes — Family Link oversight; parent can toggle Gemini on/off |
| **Claude AI** | **Blocked — 18+ only** | N/A — no teen access allowed | None — no teen pathway exists |
| **Copilot** | **Blocked on personal accounts**; allowed on school accounts (13+) if admin enables | School: no personalized experiences, no targeted ads, no model training on inputs | Family Safety can block Copilot app/website; screen time limits |
| **Character.AI** | **Open-ended chat BANNED** (Nov 2025); can only create videos/stories/streams | No 1-on-1 chatbot conversations at all | "Parental Insights" — weekly emails with usage stats and top characters (no conversation content) |
| **Grok** | Allowed with parental consent (terms) | "Baby Grok" kids mode available but easily bypassed; DOB locked once set under 18 | X parental settings; can block Grok access |
| **Perplexity** | **Full unrestricted access — identical to adult** | None | None |
| **Poe** | Allowed — parental consent required (not verified) | NSFW content filters; data not used for training without consent | Terms require parental consent but no verification mechanism |
| **Meta AI** | Main Meta AI assistant available; **AI character chats paused globally** (Jan 2026) | No AI character conversations; content guardrails on self-harm, romance, substances | Family Center — can disable AI characters, see conversation topics, set time limits |
| **Snapchat My AI** | Allowed — age-aware responses | Content blocking (drugs, self-harm); age-appropriate response tailoring using DOB signal | Family Center — can fully disable My AI, see interaction frequency, set time restrictions |
| **Pi (Inflection)** | **Blocked — 18+ only** | N/A — no teen access allowed | None |
| **Mistral Le Chat** | Allowed — parental consent required (not verified) | None — identical experience to adult | None — policy only, no technical controls |

## 18+ (Adult)

| Platform | Access | Notable Features |
|----------|--------|-----------------|
| **ChatGPT** | Full access | "Adult-Verified" content tier rolling out Q1 2026 for opt-in mature content |
| **Gemini** | Full access | Image generation enabled; all features unlocked |
| **Claude AI** | Full access | Constitutional AI safety still applies to all users |
| **Copilot** | Full access | Strict/Balanced/Creative modes; all features |
| **Character.AI** | Full access | Open-ended chat with any character; no time limits |
| **Grok** | Full access | "Spicy Mode" (NSFW) available with SuperGrok subscription + age verification |
| **Perplexity** | Full access | Identical to teen/child experience — no differentiation |
| **Poe** | Full access | NSFW bots accessible (UK requires age assurance) |
| **Meta AI** | Full access | AI character chats; unrestricted topics |
| **Snapchat My AI** | Full access | No age-aware filtering; no parental visibility |
| **Pi (Inflection)** | Full access | Emotional companion features; no content restrictions |
| **Mistral Le Chat** | Full access | More permissive content policy than US competitors |

## Ease of Lying About Age

| Platform | Difficulty to Bypass | Method a Teen Would Use | What Happens If Caught |
|----------|---------------------|------------------------|----------------------|
| **ChatGPT** | **Medium** | Create account without DOB, use normally | Behavioral AI flags, forced Persona ID verification (selfie + gov ID) |
| **Gemini** | **Medium** | Fake DOB on Google account | Google AI detects teen behavior, auto-downgrades to teen account |
| **Claude AI** | **Easy** (web) | Check the "I'm 18+" box | Account suspended if they mention being a minor in conversation |
| **Copilot** | **Easy** | Fake DOB on Microsoft account | Repeated verification prompts; may get locked out |
| **Character.AI** | **Medium-Hard** | Fake DOB, but behavioral analysis + selfie/ID verification rolling out | Forced into teen restrictions or account closed |
| **Grok** | **Easy** | Fake DOB on X signup | DOB gets locked — can't change it again, but VPN/appeal workarounds exist |
| **Perplexity** | **Trivial** | Don't even need an account | Nothing — no detection |
| **Poe** | **Easy** | Fake DOB if asked | Device fingerprinting may flag; permanent ban if caught |
| **Meta AI** | **Hard** | Fake DOB on Meta account | AI behavioral detection, auto-enrolled into Teen Account regardless of stated age |
| **Snapchat My AI** | **Easy at signup** | Fake DOB at registration | Can't change DOB later to age up; Family Center may catch |
| **Pi** | **Trivial** | Accept terms | Nothing — no detection |
| **Mistral** | **Trivial** | Accept terms | Nothing — no detection |

## Testing Strategy

| What to Test | Platforms |
|-------------|----------|
| **Teen account (honest age)** vs **Adult account** | ChatGPT, Gemini, Character.AI, Meta AI, Snapchat My AI |
| **Adult account only** (teen-who-lied = same as adult) | Claude AI, Copilot, Grok, Poe |
| **Default/anonymous** (no age gate at all) | Perplexity, Pi, Mistral Le Chat |

## Authentication Methods

See `platform_auth_methods.md` for details on how each platform authenticates (password, magic link, OAuth, etc.) and implications for automated testing.
