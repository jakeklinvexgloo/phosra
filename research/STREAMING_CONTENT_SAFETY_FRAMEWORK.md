# Phosra Streaming Content Safety Testing Framework

**Version:** 1.0
**Created:** 2026-02-28
**Status:** THE standard for all streaming content safety testing

This document defines the authoritative methodology for actively testing whether children can find, access, and play age-inappropriate content on streaming platforms despite parental controls being enabled. It produces quantitative safety scores, not feature inventories.

Unlike RESEARCH_FRAMEWORK.md (which documents what controls exist) and AI_CHATBOT_RESEARCH_FRAMEWORK.md (which tests AI-generated content safety), this framework tests whether streaming platform parental controls actually work — from the perspective of a determined child.

All streaming content safety testing MUST follow this framework.

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
   1. [What This Framework Is](#11-what-this-framework-is)
   2. [What This Framework Is NOT](#12-what-this-framework-is-not)
   3. [Relationship to Other Frameworks](#13-relationship-to-other-frameworks)
   4. [Threat Model](#14-threat-model)
   5. [Ethical & Legal Boundaries](#15-ethical--legal-boundaries)

2. [Test Account Setup Protocol](#2-test-account-setup-protocol)
   1. [Account Provisioning Requirements](#21-account-provisioning-requirements)
   2. [Profile Configuration Matrix](#22-profile-configuration-matrix)
   3. [PIN & Lock Configuration](#23-pin--lock-configuration)
   4. [Test Content Library](#24-test-content-library)
   5. [Pre-Test Verification Checklist](#25-pre-test-verification-checklist)

3. [Test Category Definitions](#3-test-category-definitions)
   1. [Category 1: Profile Escape](#31-category-1-profile-escape)
   2. [Category 2: Search & Discovery](#32-category-2-search--discovery)
   3. [Category 3: Direct URL / Deep Link Access](#33-category-3-direct-url--deep-link-access)
   4. [Category 4: Maturity Filter Circumvention](#34-category-4-maturity-filter-circumvention)
   5. [Category 5: PIN / Lock Bypass](#35-category-5-pin--lock-bypass)
   6. [Category 6: Recommendation & Autoplay Leakage](#36-category-6-recommendation--autoplay-leakage)
   7. [Category 7: Cross-Profile Content Bleed](#37-category-7-cross-profile-content-bleed)
   8. [Category 8: Kids Mode Escape](#38-category-8-kids-mode-escape)
   9. [Category 9: Age Gate & Account Creation](#39-category-9-age-gate--account-creation)
   10. [Category 10: Content Rating Gaps & Edge Cases](#310-category-10-content-rating-gaps--edge-cases)
   11. [Category Weight Table](#311-category-weight-table)

4. [Test Scenario Library](#4-test-scenario-library)
   1. [Scenario Template](#41-scenario-template)
   2. [Single-Action Scenarios](#42-single-action-scenarios)
   3. [Multi-Step Escalation Sequences](#43-multi-step-escalation-sequences)
   4. [Platform-Specific Scenario Overrides](#44-platform-specific-scenario-overrides)

5. [Scoring & Grading System](#5-scoring--grading-system)
   1. [Per-Scenario Scoring Rubric (0-4 Scale)](#51-per-scenario-scoring-rubric-04-scale)
   2. [Category Aggregation Method](#52-category-aggregation-method)
   3. [Overall Platform Grade (A-F)](#53-overall-platform-grade-af)
   4. [Severity Classification](#54-severity-classification)
   5. [Critical Failure Override Rules](#55-critical-failure-override-rules)
   6. [Score Interpretation Guide](#56-score-interpretation-guide)

6. [Agent Execution Guide](#6-agent-execution-guide)
   1. [Pre-Flight Checklist](#61-pre-flight-checklist)
   2. [Chrome MCP Step-by-Step Protocol](#62-chrome-mcp-step-by-step-protocol)
   3. [Navigation & Interaction Patterns](#63-navigation--interaction-patterns)
   4. [Handling Authentication Walls](#64-handling-authentication-walls)
   5. [Handling CAPTCHAs & Bot Detection](#65-handling-captchas--bot-detection)
   6. [Timing & Pacing Rules](#66-timing--pacing-rules)
   7. [Error Recovery Procedures](#67-error-recovery-procedures)
   8. [Execution Order](#68-execution-order)

7. [Evidence Collection Standards](#7-evidence-collection-standards)
   1. [Required Evidence Per Scenario](#71-required-evidence-per-scenario)
   2. [Screenshot Naming Convention](#72-screenshot-naming-convention)
   3. [Response Text Logging](#73-response-text-logging)
   4. [Network Request Capture](#74-network-request-capture)
   5. [Evidence Completeness Checklist](#75-evidence-completeness-checklist)

8. [Results File Structure](#8-results-file-structure)
   1. [Directory Layout](#81-directory-layout)
   2. [content_safety_results.json Schema](#82-content_safety_resultsjson-schema)
   3. [test_execution_log.json Schema](#83-test_execution_logjson-schema)
   4. [platform_scorecard.json Schema](#84-platform_scorecardjson-schema)
   5. [File Descriptions](#85-file-descriptions)

9. [Platform-Specific Test Matrices](#9-platform-specific-test-matrices)
   1. [Netflix](#91-netflix)
   2. [Disney+](#92-disney)
   3. [Amazon Prime Video](#93-amazon-prime-video)
   4. [Apple TV+](#94-apple-tv)
   5. [Peacock](#95-peacock)
   6. [Max (HBO)](#96-max-hbo)
   7. [Hulu](#97-hulu)
   8. [Paramount+](#98-paramount)
   9. [YouTube / YouTube Kids](#99-youtube--youtube-kids)
   10. [Adding a New Platform](#910-adding-a-new-platform)

10. [Cross-Platform Comparison Methodology](#10-cross-platform-comparison-methodology)
    1. [Normalization Rules](#101-normalization-rules)
    2. [Unified Maturity Tier Model](#102-unified-maturity-tier-model)
    3. [Comparison Scorecard Template](#103-comparison-scorecard-template)
    4. [Generating the Comparison Report](#104-generating-the-comparison-report)

11. [Example: Complete Netflix Test Run](#11-example-complete-netflix-test-run)
    1. [Account Setup](#111-account-setup)
    2. [Test Execution (Abbreviated)](#112-test-execution-abbreviated)
    3. [Results JSON (Abbreviated)](#113-results-json-abbreviated)
    4. [Scorecard Output](#114-scorecard-output)
    5. [Key Findings](#115-key-findings)

[Appendix A: Content Rating Systems Reference](#appendix-a-content-rating-systems-reference)
[Appendix B: Explicit Content Definitions](#appendix-b-explicit-content-definitions)
[Appendix C: Glossary of Terms](#appendix-c-glossary-of-terms)
[Appendix D: Research Checklist](#appendix-d-research-checklist)

---

## 1. Purpose & Scope

### 1.1 What This Framework Is

This framework is a structured, repeatable testing methodology for evaluating whether children can access age-inappropriate content on streaming platforms despite parental controls being enabled. It is designed to answer one question: **Do parental controls actually work?**

Specifically, this framework:

- **Produces quantitative scores**, not feature inventories. Every test scenario yields a numeric result (0-4), every category yields a weighted average, and every platform yields a letter grade (A-F).
- **Tests from the child's perspective.** Every scenario is modeled on what a real child would actually try -- searching for a forbidden show, switching profiles, clicking a shared link, guessing a PIN.
- **Is executed by Claude agents using Chrome MCP browser automation.** Tests are reproducible, timestamped, and evidence-backed. Human testers can run the same scenarios manually for validation.
- **Produces structured, machine-readable results.** All outputs conform to defined JSON schemas so they can feed directly into Phosra compliance dashboards, comparison reports, and enforcement-level assessments.
- **Is designed for periodic re-execution.** Monthly test runs are recommended. Platforms update their controls frequently; a passing grade in January does not guarantee a passing grade in March.
- **Is platform-agnostic by design.** The same categories, scoring rubric, and evidence standards apply to Netflix, Disney+, YouTube, and any platform added in the future. Platform-specific variations are handled through override matrices, not separate frameworks.

### 1.2 What This Framework Is NOT

This framework has a deliberately narrow scope. It does **not** cover:

| Out of Scope | Covered By | Reason |
|---|---|---|
| Documenting what parental controls exist | `RESEARCH_FRAMEWORK.md` | Feature inventories are prerequisites, not test results |
| API accessibility or developer tool compliance | `RESEARCH_FRAMEWORK.md` Section 2 | Different domain (platform APIs vs. content access) |
| AI chatbot safety and generated content risks | `AI_CHATBOT_RESEARCH_FRAMEWORK.md` | Different threat model (generative vs. catalog content) |
| Content appropriateness ratings | Common Sense Media, ESRB, MPAA | Phosra tests enforcement of ratings, not the ratings themselves |
| Penetration testing or security audits | Platform security teams | This framework simulates a child, not a professional attacker |
| Device-level controls (Screen Time, Family Link) | Future device-level framework | OS-level parental controls are a separate layer |

If a test scenario naturally crosses into one of these domains (for example, a search query that triggers an AI-generated content recommendation), document the finding but do not score it under this framework. File a cross-reference note for the appropriate framework instead.

### 1.3 Relationship to Other Frameworks

This framework operates as one layer in Phosra's multi-framework research system. Each framework has a distinct purpose, but their outputs feed into each other.

| Framework | Purpose | Relationship to This Framework |
|---|---|---|
| `RESEARCH_FRAMEWORK.md` | Documents what parental controls each platform offers (feature inventory, settings taxonomy, API surface) | **Upstream dependency.** Must be completed first. Provides the baseline knowledge of what controls exist so this framework can test whether they work. |
| `AI_CHATBOT_RESEARCH_FRAMEWORK.md` | Tests whether AI chatbots generate harmful content when prompted by minors | **Sibling framework.** Shares the 0-4 scoring scale, agent execution patterns, and evidence collection standards. Adapted for streaming-specific scenarios. |
| This framework | Tests whether streaming platform parental controls actually prevent content access | **Downstream output.** Results feed back into RESEARCH_FRAMEWORK.md integration notes, enforcement-level assessments, and Phosra compliance dashboards. |

The 0-4 per-scenario scoring scale is **intentionally aligned** across this framework and `AI_CHATBOT_RESEARCH_FRAMEWORK.md`. This alignment enables cross-domain comparisons: a platform's chatbot safety score and streaming content safety score can be placed side by side on the same scale, producing a unified child safety posture assessment.

**Data flow:**

```
RESEARCH_FRAMEWORK.md (feature inventory)
        |
        v
This Framework (active testing) <---> AI_CHATBOT_RESEARCH_FRAMEWORK.md (chatbot testing)
        |                                          |
        v                                          v
Phosra Compliance Dashboard (unified scores, enforcement levels, comparison reports)
```

### 1.4 Threat Model

Every test in this framework is designed around a specific adversary. Without a clearly defined threat model, tests become arbitrary.

**Primary adversary: The Determined Child**

- **Who:** A tech-literate child aged 10-14 who wants to watch content their parents have restricted.
- **Motivation:** Curiosity, peer pressure ("everyone at school has seen Squid Game"), desire to feel mature, boredom, or simply testing boundaries.
- **Knowledge:** Knows how to use a web browser, search engine, and the platform's basic UI. May have Googled "how to watch [show] on kids profile" or received tips from friends. Does not have formal technical training.
- **Access:** Has unsupervised access to a shared family device (laptop, tablet, smart TV) where the streaming platform is already logged in. May also have their own device with the platform app installed.

**Capability Tiers**

Not all children have the same technical skills. This framework tests against three tiers, with Tier 2 as the primary target.

| Tier | Age Range | Capabilities | Test Relevance |
|---|---|---|---|
| **Tier 1: Basic** | 7-9 | Can browse, click, search using on-screen keyboard. Can select profiles from a profile picker. Cannot type URLs directly or use browser developer tools. | Tests profile escape via UI-only paths (clicking, browsing). Baseline scenarios. |
| **Tier 2: Intermediate** | 10-12 | All Tier 1 capabilities, plus: can type URLs in the address bar, switch profiles independently, use incognito/private browsing mode, clear browser history, and share/receive links via messaging apps. May have heard of developer tools but cannot use them effectively. | **Primary test target.** Most scenarios are designed for this tier. |
| **Tier 3: Advanced** | 13-15 | All Tier 2 capabilities, plus: can search for and follow bypass tutorials, modify URL parameters, inspect network requests in DevTools, use browser extensions, and create new accounts with false age information. | Escalation scenarios and edge cases. Tests platform resilience against intentional circumvention. |

**Explicitly out of scope:**

- Professional penetration testers or security researchers (different threat model entirely)
- DRM circumvention or video stream interception (illegal under DMCA; not a child behavior)
- Network-level exploitation (packet sniffing, DNS manipulation, proxy servers)
- Device jailbreaking or rooting
- Social engineering of platform support staff

### 1.5 Ethical & Legal Boundaries

This framework involves testing content access on commercial platforms. The following boundaries are absolute and non-negotiable.

**No minors involved.** All testing uses adult-owned accounts with researcher-created child profiles. No actual children participate in, observe, or are exposed to any testing activity.

**Content interaction minimization.** When a test scenario requires confirming that restricted content is playable, the agent confirms playback initiation (3-5 seconds of the player loading and stream starting) and then stops. The agent never watches, analyzes, or records explicit content beyond confirming that the access control failed.

**Screenshot discipline.** Screenshots capture the platform UI elements that demonstrate the test result: the title card, the progress bar, the rating badge, the "now playing" overlay, or the access-denied message. Screenshots must **not** capture explicit visual content from the video stream itself. If a frame of explicit content is unavoidable in a screenshot, it must be blurred or redacted before storage. The agent should pause the video before taking screenshots whenever possible.

**No DRM circumvention.** Tests interact only with the platform's standard web interface. No video streams are intercepted, downloaded, decrypted, or recorded. No Widevine, FairPlay, or PlayReady protections are bypassed. No browser extensions that modify DRM behavior are used.

**Non-destructive testing only.** All test actions are limited to browsing, searching, clicking, and attempting playback -- the same actions any user would perform. No content is uploaded, no settings on other users' profiles are modified, no accounts are compromised, and no platform infrastructure is disrupted.

**Responsible disclosure.** If testing reveals a critical vulnerability -- defined as a kids profile being able to play TV-MA/R/NC-17 content with zero barriers (no PIN prompt, no age verification, no warning) -- the finding is reported to the platform's trust and safety team before any public disclosure. Platforms receive a 90-day remediation window. Disclosure timeline:

| Severity | Disclosure Timeline |
|---|---|
| Critical (unrestricted access to NC-17/explicit content from kids profile) | Report immediately; 90-day remediation window before public disclosure |
| High (unrestricted access to TV-MA/R content from kids profile) | Report within 7 days; 90-day remediation window |
| Medium (access via multi-step bypass to teen-rated content) | Include in quarterly research report; no advance disclosure required |
| Low (minor UI inconsistencies or rating label discrepancies) | Include in quarterly research report |

**Terms of Service considerations.** Automated browser testing may technically violate certain platform Terms of Service. This research is conducted in the public interest of child safety, under principles analogous to security research safe harbors. All interactions are minimal, non-destructive, and generate negligible load on platform infrastructure (fewer requests than a single human browsing session).

**Evidence retention.** All screenshots, logs, and result files are stored in private, access-controlled repositories (never in public GitHub repos). Evidence is retained for 6 months after the test run date, then permanently deleted unless required for an active responsible disclosure case.

---

## 2. Test Account Setup Protocol

Correct account setup is the foundation of valid test results. If profiles are misconfigured, maturity ratings are wrong, or PINs are missing, every subsequent test produces meaningless data. This section defines the exact account state required before any testing begins.

### 2.1 Account Provisioning Requirements

Each target platform requires one dedicated subscription account at the highest content-access tier available. Lower tiers may gate parental controls or content libraries, which would introduce confounding variables.

**General requirements:**

- One subscription per platform, paid monthly (not trial accounts, which may have restricted features).
- Accounts registered to a research-specific email address: `streaming-test@phosra.com` (or per-platform variants if required).
- Account credentials stored exclusively in `CLAUDE.local.md` (gitignored). Credentials must never appear in test scripts, evidence files, result JSONs, or commit history.
- Two-factor authentication disabled on test accounts (it blocks automated agent access). Acknowledge this is a security trade-off; these accounts contain no personal data.
- Each account must be in a **clean state** before testing: watch history cleared, recommendations reset (where possible), and no lingering profile modifications from previous test runs.

**Tier 1 Platform Matrix (priority order):**

| Platform | Subscription Tier | URL | Monthly Cost (approx.) | Notes |
|---|---|---|---|---|
| Netflix | Standard or Premium | `netflix.com` | $15-23 | Kids profile toggle, granular maturity ratings (Little Kids through All Maturity Ratings) |
| Disney+ | Disney+ Premium | `disneyplus.com` | $14 | Added mature content in 2023 (Deadpool, Logan, etc.); content rating system overhauled |
| Amazon Prime Video | Prime membership | `primevideo.com` | $15 | Complex library: owned content + Freevee (ad-supported) + third-party Channels |
| Apple TV+ | Apple TV+ | `tv.apple.com` | $10 | Smaller library but web-based controls may differ significantly from device controls |
| Peacock | Peacock Premium | `peacocktv.com` | $14 | Known gap: historically allowed unprotected child profile creation without PIN |
| Max (HBO) | Max Ad-Free | `max.com` | $17 | HBO catalog is heavily adult-oriented; highest concentration of TV-MA content |
| Hulu | Hulu (No Ads) | `hulu.com` | $18 | No dedicated "Kids" profile type historically; relies on content filters |
| Paramount+ | Paramount+ with Showtime | `paramountplus.com` | $13 | Showtime content is explicitly adult; tests boundary between Paramount+ and Showtime catalogs |
| YouTube | Free (with Google account) | `youtube.com` | Free | Restricted Mode + age-gated video system; YouTube Kids is a separate app/site |

### 2.2 Profile Configuration Matrix

Every platform account must contain exactly **four profiles**, configured identically across all platforms to enable cross-platform comparison. If a platform supports fewer than four profiles, document the limitation and create the maximum number possible.

| Profile Name | Display Name | Profile Type | Target Maturity Ceiling | Test Role |
|---|---|---|---|---|
| **Child-7** | `TestChild7` | Kids profile (if available) | Youngest tier: TV-Y, G, or equivalent only | Strictest restriction. Should block everything above G-rated content. Primary "victim" profile for most scenarios. |
| **Child-12** | `TestChild12` | Kids or age-restricted profile | Middle tier: up to TV-PG, PG, or equivalent | Pre-teen restriction. Should block TV-14+, PG-13+, and all mature content. |
| **Teen-16** | `TestTeen16` | Standard profile (with restrictions) | Teen tier: up to TV-14, PG-13, or equivalent | Teenager restriction. Should block TV-MA, R, NC-17, and unrated content. |
| **Adult** | `TestAdult` | Standard profile (unrestricted) | All content / no restrictions | **Positive control.** Used to confirm that target content actually exists on the platform and is playable. If content cannot be played on the Adult profile, it cannot be used as a test target. |

**Platform-specific maturity tier mapping:**

| Platform | Child-7 Setting | Child-12 Setting | Teen-16 Setting | Adult Setting |
|---|---|---|---|---|
| Netflix | "Little Kids" (TV-Y, G) | "Older Kids" (TV-Y7, TV-G, TV-PG, PG) | "Teens" (adds TV-14, PG-13) | "All Maturity Ratings" |
| Disney+ | Content rating: 6+ | Content rating: 9+ | Content rating: 14+ | Content rating: 18+ |
| Amazon Prime Video | Age restriction: 7 | Age restriction: 12 | Age restriction: 16 | No restrictions |
| Apple TV+ | Kids profile ON | Age restriction to PG | Age restriction to PG-13 | No restrictions |
| Peacock | Kids profile ON | Parental controls: PG | Parental controls: PG-13 | No restrictions |
| Max | Kids profile ON | Age restriction: 12 | Age restriction: 16 | No restrictions |
| Hulu | Content filters: Kids only | Content filters: up to PG | Content filters: up to PG-13 | No filters |
| Paramount+ | Kids profile ON | Parental controls: PG | Parental controls: PG-13 | No restrictions |
| YouTube | Restricted Mode ON + Supervised (9-12 "Explore More") | Restricted Mode ON + Supervised (13+) | Restricted Mode ON | Restricted Mode OFF |

**Important:** These mappings must be verified during account setup, as platforms frequently rename or restructure their maturity settings. If a platform's settings do not map cleanly to the four-profile model, document the closest approximation and note the discrepancy in the test execution log.

### 2.3 PIN & Lock Configuration

PINs and profile locks are the primary barrier between a child profile and adult content. This framework uses standardized PINs across all platforms to ensure consistency and to enable PIN bypass testing.

**Standard PIN assignments:**

| Profile | PIN | Lock Behavior | Rationale |
|---|---|---|---|
| TestChild7 | No PIN | Unlocked | This is the "victim" profile. The child is already inside it. No PIN needed. |
| TestChild12 | No PIN | Unlocked | Same as above. Tests start from within this profile. |
| TestTeen16 | `8524` | PIN-locked (if supported) | Tests whether a child on a lower-restriction profile can switch to the teen profile and whether the PIN is enforced. |
| TestAdult | `9731` | PIN-locked (required) | Tests PIN bypass resistance. A child attempting to access adult content may try switching to this profile. |
| Account-level PIN (if supported) | `5500` | Master lock | Some platforms support an account-level PIN that overrides all profile access. Test its enforcement. |

**Platform PIN support matrix:**

| Platform | Profile-Level PIN | Account-Level PIN | Notes |
|---|---|---|---|
| Netflix | Yes (per profile) | No | PIN required to switch to locked profiles |
| Disney+ | Yes (per profile, 2023+) | No | Originally no PINs; added after mature content expansion |
| Amazon Prime Video | Yes | Yes (purchase PIN) | Purchase PIN is separate from profile PIN |
| Apple TV+ | Limited (device-level) | No | Web interface PIN support may differ from device |
| Peacock | Yes | No | PIN enforcement has had historical gaps |
| Max | Yes (per profile) | No | Kids profile exit requires PIN |
| Hulu | No dedicated PIN | No | Relies on account password for profile switching |
| Paramount+ | Yes | No | PIN for exiting Kids mode |
| YouTube | No profile PIN | No | Relies on Google account switching + Supervised accounts |

Platforms that do not support PINs represent a **structural vulnerability**: the only barrier between a child and adult content is the profile selection screen. This absence is itself a testable finding and should be documented as a Category 5 (PIN/Lock Bypass) automatic score of 0.

### 2.4 Test Content Library

Each platform must have a curated set of **target content** that spans all maturity tiers. This content is what the agent attempts to access from restricted profiles. The content must be verified as available on the platform before testing begins (the "Scout" phase).

**Universal content tier definitions:**

| Tier | US TV Rating | US Film Rating | Example Titles | Test Purpose |
|---|---|---|---|---|
| **Baseline** | TV-Y, TV-Y7 | G | "Bluey," "Cocomelon," "Frozen," "Moana" | Positive control: confirms the kids profile can access appropriate content. If baseline content is blocked, the profile is misconfigured. |
| **Moderate** | TV-PG | PG | "Stranger Things" S1, "The Hunger Games," "Jurassic Park" | Should be accessible on Child-12 and above. Must be blocked on Child-7. |
| **Teen** | TV-14 | PG-13 | "Wednesday," "The Batman," "Cobra Kai" | Should be accessible on Teen-16 only. Must be blocked on Child-7 and Child-12. |
| **Mature** | TV-MA | R | "Squid Game," "Dahmer," "Deadpool," "The Bear" | Must be blocked on ALL restricted profiles (Child-7, Child-12, Teen-16). Accessible only on Adult. |
| **Extreme** | TV-MA (explicit) | NC-17 / Unrated | "Blonde," explicit standup specials, unrated horror | Must be blocked everywhere except Adult. Tests the most restrictive enforcement boundary. |
| **Edge Cases** | Unrated / NR | Unrated / Foreign | Foreign-language films without US ratings, live events, documentaries, user-uploaded content (YouTube) | Tests default behavior for content that falls outside standard rating systems. Platforms may fail open (allow) or fail closed (block). |

**Content verification ("Scout" phase):** Before each test run, a Scout agent must confirm that at least **three titles per tier** are currently available on the target platform. Streaming libraries change frequently; a title available last month may have been removed. The Scout agent records its findings in `scout_report.json`, which the test execution agent consumes as input.

**Platform-specific content selection notes:**
- **Netflix:** Frequently rotates library. Verify all titles within 48 hours of testing.
- **Disney+:** Mature content (Deadpool, Logan, Alien) was added starting in 2023. Verify these titles are still on the platform and properly rated.
- **Amazon Prime Video:** Distinguish between Prime-included content, Freevee content, and channel add-on content. All three catalogs may have different parental control enforcement.
- **YouTube:** "Content" includes standard uploads, YouTube Originals, live streams, Shorts, and embedded videos. Test all content types.

### 2.5 Pre-Test Verification Checklist

This checklist must be completed by the executing agent (or human operator) before beginning any test scenario. Every item must pass. If any item fails, resolve it before proceeding. Do not begin testing with a partially configured account.

```
PRE-TEST VERIFICATION CHECKLIST
================================

Account State:
  [ ] Subscription is active and at the correct tier (verify billing page)
  [ ] Account email matches expected research address
  [ ] Two-factor authentication is disabled
  [ ] Account is not in a trial period or grace period

Profile Configuration:
  [ ] Exactly 4 profiles exist: TestChild7, TestChild12, TestTeen16, TestAdult
  [ ] TestChild7 maturity setting matches Platform Configuration Matrix
  [ ] TestChild12 maturity setting matches Platform Configuration Matrix
  [ ] TestTeen16 maturity setting matches Platform Configuration Matrix
  [ ] TestAdult has no content restrictions
  [ ] Profile avatars are distinct (prevents visual confusion during testing)

PIN & Lock State:
  [ ] TestChild7 has NO PIN
  [ ] TestChild12 has NO PIN
  [ ] TestTeen16 PIN is set to 8524
  [ ] TestAdult PIN is set to 9731
  [ ] Account-level PIN (if supported) is set to 5500

Content & History:
  [ ] Watch history is cleared on ALL profiles (or profiles are freshly created)
  [ ] "Continue Watching" row is empty on all profiles
  [ ] Autoplay is DISABLED on all profiles (where configurable)
  [ ] Scout report confirms 3+ titles per content tier are available

Browser & Agent Environment:
  [ ] Browser profile is loaded with valid session cookies for the platform
  [ ] Chrome MCP is connected and responding to commands
  [ ] Browser window is sized to 1920x1080 (standard desktop viewport)
  [ ] No VPN or proxy is active (unless testing geo-specific behavior)
  [ ] Ad blocker is DISABLED (may interfere with platform UI)

Evidence Infrastructure:
  [ ] Screenshot output directory exists and is empty
  [ ] Result JSON files from previous runs are archived or deleted
  [ ] Sufficient disk space for screenshots (estimate 500MB per full platform test)

Sign-off:
  [ ] Checklist completed by: ____________
  [ ] Date/time: ____________
  [ ] Platform: ____________
  [ ] Ready to proceed: YES / NO
```

If the platform's UI has changed significantly since the last test run (major redesign, new parental control features, rebranded settings), pause and update the platform-specific test matrix (Section 9) before proceeding. Running stale test scenarios against a redesigned UI produces invalid results.agentId: af0a974ba6a44735f (for resuming to continue this agent's work if needed)


## 3. Test Category Definitions

This section defines the ten categories used to evaluate content safety controls on streaming platforms. Each category targets a distinct bypass vector, weighted by the likelihood a child will attempt it and the severity of the resulting exposure.

---

### 3.1 Profile Escape (Weight: 5x)

**Definition:** Tests whether a child on a restricted profile can navigate to an unrestricted profile without encountering authentication. Profile escape is the single most common bypass vector because it requires no technical knowledge — a child simply taps a different avatar on the profile picker screen.

**Bypass Vector:** Unrestricted profile selection from within or adjacent to a kids-mode context.

**Key Question:** *"Can my kid switch to my profile without entering a PIN?"*

**PASS Criteria:** Every transition from a restricted profile to a less-restricted or unrestricted profile requires a PIN, password, or equivalent parental credential. The profile picker either hides adult profiles entirely or gates them behind authentication.

**FAIL Criteria:** A child can tap an adult profile avatar and land on that profile's homepage with no challenge whatsoever, or the challenge is trivially bypassable (e.g., a "Are you an adult? Yes / No" prompt).

**Applicable Profiles:** Child-7, Child-12, Teen-16

---

### 3.2 Search & Discovery (Weight: 5x)

**Definition:** Tests whether the platform's search functionality surfaces explicit or age-inappropriate content when queried from a restricted profile. Children routinely search for titles they hear about at school, making this a high-frequency bypass vector that requires zero technical sophistication.

**Bypass Vector:** Platform search index returning unfiltered results regardless of the active profile's maturity restrictions.

**Key Question:** *"If my kid searches for 'Euphoria,' what happens?"*

**PASS Criteria:** Search returns zero results for titles outside the profile's maturity tier, or returns a filtered result set that excludes all restricted content. Autocomplete does not suggest explicit titles.

**FAIL Criteria:** Explicit titles appear in search results and the child can navigate to the content detail page or initiate playback.

**Applicable Profiles:** Child-7, Child-12, Teen-16

---

### 3.3 Direct URL / Deep Link Access (Weight: 3x)

**Definition:** Tests whether a child can bypass profile-level restrictions by navigating directly to a content URL obtained from an external source such as a text message, social media post, or search engine result. This vector requires the child to receive or discover a URL, making it less spontaneous than profile escape or search but increasingly common among school-age children.

**Bypass Vector:** Direct HTTP navigation to a content detail or playback page that circumvents the profile-scoped browsing layer.

**Key Question:** *"If someone texts my kid a link to Squid Game, can they watch it?"*

**PASS Criteria:** The platform intercepts the URL, detects the active restricted profile, and redirects the user to the kids homepage or displays an access-denied message. No content metadata, thumbnail, or playback is rendered.

**FAIL Criteria:** The content detail page renders with full metadata and artwork, and/or playback initiates without a maturity challenge.

**Applicable Profiles:** Child-7, Child-12, Teen-16

---

### 3.4 Maturity Filter Circumvention (Weight: 4x)

**Definition:** Tests whether the maturity rating assigned to a profile can be changed, reset, or bypassed without parental authentication. While more technical than profile escape, the steps to change maturity settings are easily discoverable via a web search, making this a realistic vector for children aged 10 and older.

**Bypass Vector:** Unauthorized modification of profile maturity settings, or session/state manipulation that resets restrictions to their default (often unrestricted) state.

**Key Question:** *"Can my kid change their own profile's maturity rating?"*

**PASS Criteria:** Profile settings that control maturity level are gated behind PIN or password authentication. Clearing cookies, using incognito mode, or manipulating browser state does not elevate the maturity tier of the active session.

**FAIL Criteria:** A child can navigate to settings and raise the maturity level without any credential challenge, or a session reset (cookies cleared, incognito) defaults to an unrestricted state.

**Applicable Profiles:** Child-12, Teen-16

---

### 3.5 PIN / Lock Bypass (Weight: 4x)

**Definition:** Tests the robustness and enforcement consistency of PIN or lock mechanisms that protect restricted actions. PINs are the primary gatekeeper on most platforms, so their strength, lockout behavior, and recovery flow directly determine the overall integrity of parental controls.

**Bypass Vector:** Brute-force guessing, trivial recovery flows, or inconsistent enforcement across different interaction paths within the same platform.

**Key Question:** *"Can my kid guess or reset the PIN?"*

**PASS Criteria:** Incorrect PIN entries trigger a progressive lockout (e.g., 3–5 attempts before a cooldown or account-level lock). PIN recovery requires full parental credentials (email + password or equivalent). PIN is enforced on every restricted action, not just the profile picker.

**FAIL Criteria:** Unlimited PIN attempts with no lockout, PIN recoverable via a child-accessible method (e.g., SMS to a shared family phone), or PIN enforcement is inconsistent — required for profile switch but not for settings access.

**Applicable Profiles:** Child-7, Child-12, Teen-16

---

### 3.6 Recommendation & Autoplay Leakage (Weight: 4x)

**Definition:** Tests whether the platform's recommendation engine, editorial placements, or autoplay functionality surfaces content outside the active profile's maturity tier. Unlike search, this is a passive exposure vector — the child does not need to seek anything; the platform delivers it. This makes it especially concerning because parents cannot anticipate or prevent the exposure through behavioral monitoring.

**Bypass Vector:** Algorithmic or editorial content surfacing that ignores or improperly applies profile-level maturity filters.

**Key Question:** *"Will the algorithm show my kid something they shouldn't see?"*

**PASS Criteria:** Every title displayed on the homepage, in recommendation rows, in "Up Next" queues, and in auto-playing previews falls within the profile's maturity cap. No editorial override (e.g., "Trending Now") bypasses the filter.

**FAIL Criteria:** A title rated above the profile's maturity cap appears anywhere in the browsing or post-playback experience, including thumbnails, previews, trailers, and "More Like This" sections.

**Applicable Profiles:** Child-7, Child-12, Teen-16

---

### 3.7 Cross-Profile Content Bleed (Weight: 3x)

**Definition:** Tests whether activity on one profile (typically an adult profile) leaks into or contaminates the experience of a restricted profile in the same household account. This vector is specific to multi-profile platforms and reflects the common household pattern where parents and children share a single account.

**Bypass Vector:** Shared account state (watch history, recommendations, "Continue Watching" queues, shared lists) that crosses profile boundaries.

**Key Question:** *"After I watch something explicit, will my kid see traces of it?"*

**PASS Criteria:** Complete data isolation between profiles. No "Continue Watching" entries, watchlist items, recommendation signals, or viewing history from one profile appear on another. Kids profiles show zero evidence of adult viewing activity.

**FAIL Criteria:** Adult content appears in the child profile's "Continue Watching" row, recommendation carousels reference adult viewing patterns, or a shared watchlist exposes adult titles to the kids profile.

**Applicable Profiles:** Child-7, Child-12, Teen-16

---

### 3.8 Kids Mode Escape (Weight: 3x)

**Definition:** Tests whether a child can exit a platform's dedicated kids environment (e.g., Netflix Kids, Disney+ Junior, YouTube Kids) and reach the unrestricted main platform interface. Dedicated kids modes are designed as walled gardens, but the wall is only as strong as the exit mechanism.

**Bypass Vector:** Exiting or navigating out of a sandboxed kids environment to the unrestricted parent platform.

**Key Question:** *"Can my kid exit Netflix Kids or Disney+ Junior without me?"*

**PASS Criteria:** Exiting kids mode requires parental authentication (PIN, password, or non-trivial challenge such as a math problem calibrated above the target age). Browser navigation (back button, address bar) cannot escape the kids-mode context.

**FAIL Criteria:** Exit requires no authentication, or the authentication challenge is trivially solvable by the target age group (e.g., "Enter your birth year" for a 12-year-old who knows their parents' ages).

**Applicable Profiles:** Child-7, Child-12

---

### 3.9 Age Gate & Account Creation (Weight: 2x)

**Definition:** Tests whether a child can create a new, unrestricted account or profile by providing false age information, and whether free-tier platforms enforce any restrictions on unauthenticated access. This vector requires more initiative than other categories — the child must actively create a new identity — but it completely sidesteps all parental controls configured on the family account.

**Bypass Vector:** Account or profile creation with false demographic information, or unrestricted access via free/anonymous tiers.

**Key Question:** *"Can my kid just make a new account with a fake age?"*

**PASS Criteria:** Age verification catches obviously false ages (e.g., through credit card verification, ID upload, or persistent device-level age signals). New profiles created within a managed account inherit the account's restriction level. Free tiers default to restricted content unless age is verified.

**FAIL Criteria:** A child can enter any birthdate during account creation and receive an unrestricted account, or a free-tier platform serves explicit content without any age check.

**Applicable Profiles:** Child-12, Teen-16

---

### 3.10 Content Rating Gaps & Edge Cases (Weight: 2x)

**Definition:** Tests whether content that falls outside the platform's standard rating taxonomy — including unrated titles, foreign-language content, standup specials, documentaries, live TV, bonus content, and platform-specific content types — is properly gated by parental controls. Rating gaps are a platform-side issue rather than a child-initiative issue, but they represent real exposure risk when they exist.

**Bypass Vector:** Content that lacks a maturity rating or is categorized in a way that escapes the standard maturity filter logic.

**Key Question:** *"What about standup specials, foreign films, and documentaries?"*

**PASS Criteria:** Unrated content defaults to the most restrictive tier. All content types (including live channels, games, bonus features, and platform-specific formats) are subject to the same maturity filter as standard titles.

**FAIL Criteria:** Unrated, miscategorized, or non-standard content types are accessible on a kids profile because they fall outside the filter's scope.

**Applicable Profiles:** Child-7, Child-12, Teen-16

---

### 3.11 Category Weight Summary

| # | Category | Code | Weight | Rationale |
|---|----------|------|--------|-----------|
| 1 | Profile Escape | PE | 5x | First thing kids try; immediate access to all content |
| 2 | Search & Discovery | SD | 5x | Kids actively search for titles they hear about at school |
| 3 | Direct URL / Deep Link | DU | 3x | Requires knowing or receiving a URL — less spontaneous |
| 4 | Maturity Filter Circumvention | MF | 4x | More technical but easily Googleable by preteens |
| 5 | PIN / Lock Bypass | PL | 4x | PIN is the primary defense mechanism on most platforms |
| 6 | Recommendation & Autoplay Leakage | RL | 4x | Passive exposure — zero effort from the child |
| 7 | Cross-Profile Content Bleed | CB | 3x | Requires specific household usage pattern |
| 8 | Kids Mode Escape | KM | 3x | Platform-specific; not all platforms have a dedicated mode |
| 9 | Age Gate & Account Creation | AG | 2x | Requires creating a new account — higher initiative threshold |
| 10 | Content Rating Gaps | CG | 2x | Platform-side issue; less about child initiative |

**Total weighted score denominator:** Sum of (category weight x number of scenarios tested per category) across all categories, normalized to a 0–100 scale as defined in Section 5.

---

## 4. Test Scenario Library

### 4.1 Scenario Template

Every test scenario follows this structure:

```
Scenario ID:       {category-code}-{number}
Category:          {Category name}
Title:             {Brief descriptive title}
Severity:          Critical / High / Medium
Profiles Tested:   Child-7, Child-12, Teen-16 (or subset)
Platforms:         All / {specific list}
Preconditions:     {What must be true before the test starts}
Steps:
  1. {Step 1}
  2. {Step 2}
  ...
Expected (PASS):   {What should happen if controls work}
Failure Indicators:{What constitutes a FAIL}
```

---

### 4.2 Single-Action Scenarios

#### Profile Escape (PE)

**Scenario ID:** PE-01
**Category:** Profile Escape
**Title:** Switch from Kids profile to unprotected Adult profile via profile picker
**Severity:** Critical
**Profiles Tested:** Child-7, Child-12, Teen-16
**Platforms:** All
**Preconditions:** Account has at least two profiles: one restricted Kids profile (active) and one Adult profile with no PIN protection. The tester is logged in and viewing the Kids profile homepage.
**Steps:**
1. Navigate to the profile picker (typically accessible via avatar icon in top-right corner or via platform menu).
2. Identify the Adult profile in the profile list.
3. Tap or click the Adult profile avatar.
4. Observe whether any authentication challenge (PIN, password, biometric) appears.
5. If no challenge appears, confirm that the Adult profile homepage loads with unrestricted content.
**Expected (PASS):** A PIN, password, or equivalent credential prompt appears before the profile switch completes. If the challenge is dismissed or failed, the user remains on the Kids profile.
**Failure Indicators:** The Adult profile homepage loads immediately with no authentication prompt. The child now has access to the full unrestricted content catalog.

---

**Scenario ID:** PE-02
**Category:** Profile Escape
**Title:** Switch from Kids profile to PIN-protected Adult profile
**Severity:** High
**Profiles Tested:** Child-7, Child-12, Teen-16
**Platforms:** All
**Preconditions:** Account has a Kids profile (active) and an Adult profile protected by a 4-digit PIN. The tester does not know the PIN.
**Steps:**
1. Navigate to the profile picker from the Kids profile.
2. Select the PIN-protected Adult profile.
3. Observe the PIN entry screen. Confirm it appears.
4. Enter an incorrect PIN (e.g., 0000). Observe the response.
5. Attempt to dismiss or bypass the PIN screen (tap outside the modal, press back button, press Escape).
6. Verify that the Kids profile remains active after all bypass attempts.
**Expected (PASS):** PIN entry screen appears and cannot be dismissed without entering the correct PIN. Incorrect PINs are rejected and the user remains on the Kids profile.
**Failure Indicators:** The PIN screen can be dismissed (returning to a profile-less state or the Adult profile), or the Adult profile loads despite an incorrect PIN.

---

**Scenario ID:** PE-03
**Category:** Profile Escape
**Title:** Create new unrestricted profile from Kids profile context
**Severity:** Critical
**Profiles Tested:** Child-12, Teen-16
**Platforms:** All
**Preconditions:** Logged into a Kids profile. The account has not reached the maximum number of profiles.
**Steps:**
1. Navigate to the profile picker from the Kids profile.
2. Look for an "Add Profile" or "Create Profile" option.
3. If available, tap it and observe whether any authentication is required.
4. If profile creation proceeds, check whether the new profile defaults to restricted or unrestricted maturity settings.
5. If the new profile is unrestricted, switch to it and verify access to explicit content.
**Expected (PASS):** Profile creation is either unavailable from the Kids profile context, or requires parental authentication. If a new profile is created, it inherits the account's restriction level or defaults to the most restrictive tier.
**Failure Indicators:** A new unrestricted profile can be created without any parental credential. The child can immediately switch to it and browse unrestricted content.

---

**Scenario ID:** PE-04
**Category:** Profile Escape
**Title:** Delete Kids profile to escape to profile selection
**Severity:** High
**Profiles Tested:** Child-12, Teen-16
**Platforms:** All
**Preconditions:** Logged into a Kids profile. Account has at least one other profile.
**Steps:**
1. From the Kids profile, navigate to profile management or account settings.
2. Attempt to locate the "Delete Profile" or "Remove Profile" option for the currently active Kids profile.
3. If accessible, attempt to delete the Kids profile.
4. Observe what state the platform enters after deletion — does it fall back to the profile picker with unrestricted profiles visible?
**Expected (PASS):** Profile deletion is gated behind parental authentication (PIN or password), or is entirely unavailable from within a Kids profile.
**Failure Indicators:** The Kids profile is deleted without authentication, and the user lands on the profile picker where they can select an unrestricted profile.

---

**Scenario ID:** PE-05
**Category:** Profile Escape
**Title:** Access account settings from Kids profile
**Severity:** High
**Profiles Tested:** Child-7, Child-12, Teen-16
**Platforms:** All
**Preconditions:** Logged into a Kids profile.
**Steps:**
1. Navigate to account settings, profile settings, or any administrative page from the Kids profile.
2. Check whether the settings page is accessible at all.
3. If accessible, check whether parental controls, maturity settings, or profile management options are visible and editable.
4. Attempt to modify any setting that would weaken restrictions.
**Expected (PASS):** Account-level settings are entirely inaccessible from the Kids profile, or require parental authentication to view or modify.
**Failure Indicators:** Account settings are accessible without authentication, and restriction-related settings (maturity level, PIN management, profile controls) can be viewed or changed.

---

#### Search & Discovery (SD)

**Scenario ID:** SD-01
**Category:** Search & Discovery
**Title:** Search for explicit movie title from Kids profile
**Severity:** Critical
**Profiles Tested:** Child-7, Child-12, Teen-16
**Platforms:** All
**Preconditions:** Logged into a Kids profile with maturity set to the age-appropriate tier. The platform's catalog includes "Deadpool" (R-rated) or equivalent explicit movie.
**Steps:**
1. Open the platform's search interface from the Kids profile.
2. Type the full title "Deadpool" and submit the search.
3. Observe the search results page.
4. If any results appear, check whether the explicit title is listed.
5. If listed, tap the title and check whether the content detail page loads and/or playback is available.
**Expected (PASS):** Search returns zero results for "Deadpool," or returns only age-appropriate titles with similar keywords. No explicit content detail page is accessible.
**Failure Indicators:** "Deadpool" appears in search results with its artwork and metadata visible. Tapping the result loads the content detail page or initiates playback.

---

**Scenario ID:** SD-02
**Category:** Search & Discovery
**Title:** Search for explicit TV series from Kids profile
**Severity:** Critical
**Profiles Tested:** Child-7, Child-12, Teen-16
**Platforms:** All
**Preconditions:** Logged into a Kids profile. Platform catalog includes "Euphoria" (TV-MA) or equivalent explicit series.
**Steps:**
1. Open the search interface from the Kids profile.
2. Type "Euphoria" and submit.
3. Review the results list for the TV-MA series.
4. If present, attempt to navigate to the series page and select an episode for playback.
**Expected (PASS):** "Euphoria" does not appear in search results. If a different, age-appropriate title with a similar name exists, only that title is shown.
**Failure Indicators:** The TV-MA series "Euphoria" appears in results and the series detail page is accessible from the Kids profile.

---

**Scenario ID:** SD-03
**Category:** Search & Discovery
**Title:** Search for actor known for explicit roles from Kids profile
**Severity:** High
**Profiles Tested:** Child-12, Teen-16
**Platforms:** All
**Preconditions:** Logged into a Kids profile. Platform catalog includes titles starring an actor primarily known for R-rated or TV-MA roles (e.g., search "Ryan Reynolds," "Zendaya").
**Steps:**
1. Open search from the Kids profile.
2. Type the actor's name (e.g., "Ryan Reynolds") and submit.
3. Review the results — check whether the returned titles are filtered to the profile's maturity tier.
4. If explicit titles appear (e.g., "Deadpool" under Ryan Reynolds), attempt to access the content detail page.
**Expected (PASS):** Actor search returns only titles within the profile's maturity tier. If the actor has no age-appropriate titles on the platform, zero results are returned.
**Failure Indicators:** Explicit titles associated with the actor appear in results and are accessible.

---

**Scenario ID:** SD-04
**Category:** Search & Discovery
**Title:** Search for genre keyword from Kids profile
**Severity:** High
**Profiles Tested:** Child-7, Child-12, Teen-16
**Platforms:** All
**Preconditions:** Logged into a Kids profile.
**Steps:**
1. Open search from the Kids profile.
2. Search for genre keywords one at a time: "horror," "thriller," "crime," "violent," "adult," "erotic."
3. For each keyword, review the returned results.
4. Check whether any title rated above the profile's maturity tier appears in the results.
**Expected (PASS):** Genre keyword searches return only age-appropriate titles, or return no results if no appropriate titles match the keyword.
**Failure Indicators:** Titles rated above the profile's maturity tier appear in results for genre keyword searches.

---

**Scenario ID:** SD-05
**Category:** Search & Discovery
**Title:** Check autocomplete suggestions for partial explicit title
**Severity:** High
**Profiles Tested:** Child-7, Child-12, Teen-16
**Platforms:** All
**Preconditions:** Logged into a Kids profile. Platform has autocomplete/typeahead enabled in search.
**Steps:**
1. Open search from the Kids profile.
2. Begin typing the first few characters of an explicit title: "Dead" (for Deadpool), "Euph" (for Euphoria), "Squid" (for Squid Game).
3. Observe the autocomplete dropdown suggestions as each character is typed.
4. Check whether any explicit title appears in the suggestions.
**Expected (PASS):** Autocomplete suggestions are filtered to the profile's maturity tier. No explicit titles appear in the dropdown.
**Failure Indicators:** Explicit titles appear as autocomplete suggestions, potentially leading the child to content they would not have found otherwise.

---

#### Direct URL / Deep Link (DU)

**Scenario ID:** DU-01
**Category:** Direct URL / Deep Link Access
**Title:** Navigate to direct URL of R-rated content detail page while on Kids profile
**Severity:** High
**Profiles Tested:** Child-7, Child-12, Teen-16
**Platforms:** All (web browser)
**Preconditions:** Logged into a Kids profile in a web browser. Tester has the direct URL of an R-rated or TV-MA title's detail page (obtained from the Adult profile or an external source).
**Steps:**
1. While the Kids profile is active, copy the direct URL of an explicit title's detail page into the browser address bar (e.g., `https://www.netflix.com/title/80057281` for an R-rated title).
2. Press Enter to navigate to the URL.
3. Observe whether the content detail page loads, is blocked, or redirects.
4. If the page loads, check whether playback controls are available.
**Expected (PASS):** The platform detects the active Kids profile and either redirects to the Kids homepage, displays an access-denied message, or shows a PIN/password challenge.
**Failure Indicators:** The content detail page renders fully with artwork, synopsis, and episode list. Playback is available or auto-starts.

---

**Scenario ID:** DU-02
**Category:** Direct URL / Deep Link Access
**Title:** Navigate to direct playback URL while on Kids profile
**Severity:** Critical
**Profiles Tested:** Child-7, Child-12, Teen-16
**Platforms:** All (web browser)
**Preconditions:** Logged into a Kids profile. Tester has a direct playback/watch URL for an explicit title (e.g., `https://www.netflix.com/watch/80057281`).
**Steps:**
1. Paste the direct playback URL into the browser address bar while the Kids profile is active.
2. Press Enter.
3. Observe whether playback initiates, is blocked, or the user is redirected.
**Expected (PASS):** Playback does not initiate. The user is redirected to the Kids homepage or shown an error/access-denied page.
**Failure Indicators:** Video playback begins for the explicit title. The child is watching restricted content.

---

**Scenario ID:** DU-03
**Category:** Direct URL / Deep Link Access
**Title:** Open Google search result that deep-links to explicit content
**Severity:** High
**Profiles Tested:** Child-12, Teen-16
**Platforms:** All (web browser)
**Preconditions:** Logged into a Kids profile in a web browser. A separate browser tab or window has Google search open.
**Steps:**
1. In a new tab, search Google for "[Platform name] Squid Game" (e.g., "Netflix Squid Game").
2. Click the first result that links directly to the platform's content page for Squid Game.
3. The link opens in the browser where the Kids profile session is active.
4. Observe whether the platform respects the active Kids profile restrictions.
**Expected (PASS):** The platform detects the active Kids profile session and blocks access to the restricted content, redirecting to the Kids homepage or displaying a restriction notice.
**Failure Indicators:** The Google-sourced deep link loads the content detail page or initiates playback, bypassing the Kids profile restrictions entirely.

---

#### Maturity Filter (MF)

**Scenario ID:** MF-01
**Category:** Maturity Filter Circumvention
**Title:** Attempt to change maturity rating from Kids profile settings
**Severity:** Critical
**Profiles Tested:** Child-12, Teen-16
**Platforms:** All
**Preconditions:** Logged into a Kids profile that has maturity set to an age-appropriate tier (e.g., PG or TV-Y7).
**Steps:**
1. Navigate to profile settings or account settings from the Kids profile.
2. Locate the maturity rating or viewing restrictions control.
3. Attempt to change the maturity level to a higher tier (e.g., from PG to R, or from TV-Y7 to TV-MA).
4. If a change is made, confirm whether it takes effect by searching for previously restricted content.
**Expected (PASS):** Maturity settings are either invisible from the Kids profile, or require PIN/password authentication before any change is accepted.
**Failure Indicators:** The maturity rating is changed without any authentication challenge. Previously restricted content becomes searchable and playable.

---

**Scenario ID:** MF-02
**Category:** Maturity Filter Circumvention
**Title:** Open incognito window with platform URL while Kids profile is active
**Severity:** Medium
**Profiles Tested:** Child-12, Teen-16
**Platforms:** All (web browser)
**Preconditions:** Logged into a Kids profile in a standard browser window.
**Steps:**
1. Open a new incognito/private browsing window.
2. Navigate to the platform's URL (e.g., `netflix.com`).
3. Observe what state the platform loads in — does it require login, or does it land on a profile with no restrictions?
4. If login is required, attempt to log in with the same account credentials.
5. After login, check which profile is selected by default and what maturity level it operates at.
**Expected (PASS):** Incognito window requires full re-authentication. After login, the platform either prompts for profile selection (with PIN enforcement on restricted profiles) or defaults to the most restricted profile.
**Failure Indicators:** The incognito window loads an unrestricted session, or login defaults to an Adult profile without PIN enforcement.

---

**Scenario ID:** MF-03
**Category:** Maturity Filter Circumvention
**Title:** Clear browser cookies and revisit platform
**Severity:** Medium
**Profiles Tested:** Child-12, Teen-16
**Platforms:** All (web browser)
**Preconditions:** Logged into a Kids profile in a web browser.
**Steps:**
1. Clear all browser cookies and site data for the platform domain.
2. Navigate to the platform's URL.
3. Observe the landing state — does it require login, show the profile picker, or default to an unrestricted state?
4. If the profile picker appears, check whether Kids profile restrictions are still enforced.
5. If login is required, log in and check the default profile state.
**Expected (PASS):** Cookie clearance forces full re-authentication. Restrictions are server-side and persist regardless of client state.
**Failure Indicators:** Cookie clearance resets the session to an unrestricted default, or the platform loads without login in an unrestricted mode.

---

#### PIN / Lock (PL)

**Scenario ID:** PL-01
**Category:** PIN / Lock Bypass
**Title:** Enter incorrect PIN on protected profile — check for lockout
**Severity:** High
**Profiles Tested:** Child-7, Child-12, Teen-16
**Platforms:** All
**Preconditions:** Account has a PIN-protected Adult profile. Tester is on the profile picker from a Kids profile or logged-out state.
**Steps:**
1. Select the PIN-protected Adult profile.
2. Enter an incorrect PIN (e.g., 0000). Note the error message.
3. Enter a second incorrect PIN (e.g., 1111). Note any change in messaging.
4. Continue entering incorrect PINs up to 10 attempts, noting the response after each.
5. Record whether a lockout is triggered, and if so, after how many attempts and for how long.
**Expected (PASS):** After 3–5 incorrect attempts, the platform imposes a temporary lockout (minimum 30 seconds, ideally escalating). The lockout message does not reveal the correct PIN or provide a trivially accessible recovery path.
**Failure Indicators:** Unlimited incorrect PIN entries with no lockout, cooldown, or escalating delay. A 7-year-old could brute-force a 4-digit PIN (10,000 combinations) within hours.

---

**Scenario ID:** PL-02
**Category:** PIN / Lock Bypass
**Title:** Navigate to PIN reset/recovery flow — assess information requirements
**Severity:** High
**Profiles Tested:** Child-12, Teen-16
**Platforms:** All
**Preconditions:** Account has a PIN set. Tester is on the PIN entry screen.
**Steps:**
1. On the PIN entry screen, look for a "Forgot PIN" or "Reset PIN" link.
2. If available, tap it and observe what information is required to reset the PIN.
3. Document the full recovery flow: Does it require the account password? Email verification? SMS to a phone number?
4. Assess whether a child could complete the recovery flow (e.g., if recovery sends an email to a shared family email, or SMS to a phone the child has access to).
**Expected (PASS):** PIN recovery requires the full account password (not just email verification or SMS). The recovery flow is not completable by a child who only has access to the device.
**Failure Indicators:** PIN can be reset via SMS to a shared family phone, via email to a family email accessible on the device, or via security questions with guessable answers.

---

**Scenario ID:** PL-03
**Category:** PIN / Lock Bypass
**Title:** Check if PIN is required for ALL restricted actions
**Severity:** High
**Profiles Tested:** Child-7, Child-12, Teen-16
**Platforms:** All
**Preconditions:** Account has PIN protection enabled. Tester has identified all actions that should require PIN (profile switch, settings change, maturity override, kids mode exit).
**Steps:**
1. Attempt to switch to the Adult profile — confirm PIN is required.
2. Attempt to access account settings — check if PIN is required.
3. Attempt to exit kids mode (if applicable) — check if PIN is required.
4. Attempt to change maturity settings — check if PIN is required.
5. Attempt to initiate playback of a restricted title via deep link — check if PIN is required.
6. Document every action where PIN is enforced and every action where it is not.
**Expected (PASS):** PIN is required for every action that could result in a child accessing restricted content or weakening restrictions.
**Failure Indicators:** PIN is enforced for profile switching but not for settings access, or enforced on the main flow but not on deep links. Any inconsistency in PIN enforcement is a failure.

---

#### Recommendation & Autoplay Leakage (RL)

**Scenario ID:** RL-01
**Category:** Recommendation & Autoplay Leakage
**Title:** Browse "Trending" / "Popular" / "Top 10" on Kids profile — check for out-of-tier content
**Severity:** High
**Profiles Tested:** Child-7, Child-12, Teen-16
**Platforms:** All
**Preconditions:** Logged into a Kids profile. The platform has editorial or algorithmic content rows on the homepage (e.g., "Trending Now," "Top 10 in Your Country," "Popular on [Platform]").
**Steps:**
1. Navigate to the Kids profile homepage.
2. Scroll through all visible content rows, focusing on editorially curated sections: "Trending Now," "Top 10," "Popular," "New Releases," "Most Watched."
3. For each title visible in these rows, check its maturity rating (hover for tooltip, or note the rating badge).
4. Record any title whose maturity rating exceeds the Kids profile's configured tier.
**Expected (PASS):** Every title in every content row falls within the profile's maturity cap. Editorial and algorithmic sections respect the same filters as search.
**Failure Indicators:** One or more titles in trending/popular rows are rated above the profile's maturity tier. Common offenders: "Top 10" lists that reflect platform-wide popularity rather than filtered popularity.

---

**Scenario ID:** RL-02
**Category:** Recommendation & Autoplay Leakage
**Title:** After playing Kids content, check "Up Next" / "More Like This" for leakage
**Severity:** High
**Profiles Tested:** Child-7, Child-12, Teen-16
**Platforms:** All
**Preconditions:** Logged into a Kids profile with a viewing history of age-appropriate content.
**Steps:**
1. Play an age-appropriate title to completion (or near-completion) on the Kids profile.
2. When playback ends, observe the "Up Next" recommendation or autoplay queue.
3. Navigate back to the title's detail page and review the "More Like This" or "Similar Titles" section.
4. Check every recommended title's maturity rating against the profile's tier.
5. If autoplay is enabled, let it proceed and verify the next title is within the maturity cap.
**Expected (PASS):** All "Up Next," "More Like This," and autoplay recommendations are within the profile's maturity tier.
**Failure Indicators:** An out-of-tier title appears in post-playback recommendations or autoplay begins on a restricted title.

---

**Scenario ID:** RL-03
**Category:** Recommendation & Autoplay Leakage
**Title:** Check if trailers/previews for explicit content auto-play on Kids profile
**Severity:** High
**Profiles Tested:** Child-7, Child-12, Teen-16
**Platforms:** All (especially Netflix, Max, Disney+)
**Preconditions:** Logged into a Kids profile. Platform has auto-playing trailers or previews on browse pages.
**Steps:**
1. Navigate to the Kids profile homepage.
2. Slowly scroll through content rows, pausing on each row to observe if preview/trailer auto-play triggers.
3. For any auto-playing preview, identify the title and its maturity rating.
4. Navigate to the search page and hover over or focus on different titles to trigger preview playback.
5. Record any instance of a preview for content above the profile's maturity tier.
**Expected (PASS):** All auto-playing previews and trailers are for content within the profile's maturity tier.
**Failure Indicators:** A trailer or preview for an R-rated or TV-MA title auto-plays while browsing on the Kids profile.

---

#### Cross-Profile Bleed (CB)

**Scenario ID:** CB-01
**Category:** Cross-Profile Content Bleed
**Title:** Watch explicit content on Adult profile, switch to Kids — check "Continue Watching"
**Severity:** High
**Profiles Tested:** Child-7, Child-12, Teen-16
**Platforms:** All
**Preconditions:** Account has both an Adult and Kids profile. The Kids profile has no prior viewing history.
**Steps:**
1. Switch to the Adult profile (using PIN if required).
2. Begin playback of an explicit title (e.g., a TV-MA series). Watch for at least 5 minutes, then stop.
3. Switch back to the Kids profile.
4. On the Kids profile homepage, check the "Continue Watching" row.
5. Check whether the explicit title appears anywhere on the Kids profile homepage.
**Expected (PASS):** The Kids profile homepage shows no trace of the Adult profile's viewing activity. "Continue Watching" is either empty or contains only titles previously watched on the Kids profile.
**Failure Indicators:** The explicit title appears in the Kids profile's "Continue Watching" row, or its artwork/metadata is visible anywhere on the Kids homepage.

---

**Scenario ID:** CB-02
**Category:** Cross-Profile Content Bleed
**Title:** Add explicit title to Adult watchlist — check if visible on Kids profile
**Severity:** Medium
**Profiles Tested:** Child-7, Child-12, Teen-16
**Platforms:** All platforms with watchlist/My List features
**Preconditions:** Account has both profiles. Adult profile has a watchlist with explicit titles.
**Steps:**
1. On the Adult profile, add several explicit titles to the watchlist / "My List."
2. Switch to the Kids profile.
3. Navigate to the Kids profile's watchlist or "My List" section.
4. Check whether any titles from the Adult profile's watchlist appear.
5. Also check if there is a "Family Watchlist" or shared list feature that might expose adult selections.
**Expected (PASS):** Watchlists are completely isolated between profiles. No Adult watchlist titles appear on the Kids profile.
**Failure Indicators:** Adult watchlist titles are visible on the Kids profile, or a shared/family list feature exposes explicit titles.

---

**Scenario ID:** CB-03
**Category:** Cross-Profile Content Bleed
**Title:** Check if adult viewing history contaminates Kids recommendations
**Severity:** Medium
**Profiles Tested:** Child-7, Child-12, Teen-16
**Platforms:** All
**Preconditions:** Adult profile has extensive viewing history of horror, thriller, and crime content. Kids profile has minimal or no viewing history.
**Steps:**
1. On the Adult profile, watch several horror and crime titles over multiple sessions to establish strong genre signals.
2. Switch to the Kids profile.
3. Browse the Kids profile homepage and note the themes, genres, and titles recommended.
4. Compare against a control (a fresh Kids profile on an account with no adult viewing history, if available).
5. Look for any recommendation row titles or themes that seem influenced by the Adult profile's preferences.
**Expected (PASS):** Kids profile recommendations are entirely independent of Adult viewing history. Recommendations reflect only the Kids profile's own history and age-appropriate editorial picks.
**Failure Indicators:** Kids profile shows an unusual concentration of dark-themed but technically age-appropriate content (e.g., spooky kids shows) that correlates with the Adult profile's horror viewing, or explicit titles surface directly.

---

#### Kids Mode Escape (KM)

**Scenario ID:** KM-01
**Category:** Kids Mode Escape
**Title:** Find and attempt to exit Kids mode
**Severity:** High
**Profiles Tested:** Child-7, Child-12
**Platforms:** Netflix (Netflix Kids), Disney+ (Junior mode), YouTube (YouTube Kids), Amazon (Kids profile)
**Preconditions:** Platform is in its dedicated Kids mode/environment. The tester is viewing the Kids-mode homepage.
**Steps:**
1. Examine the Kids mode interface for any visible "Exit" button, back arrow, profile switcher, or settings gear.
2. Tap/click any element that could lead out of Kids mode.
3. When the exit mechanism is found, observe what authentication is required (PIN, password, birth year, math problem, or nothing).
4. If a challenge is presented, assess its difficulty for the target age group (e.g., "Enter your birth year" is trivially solvable by a 12-year-old).
5. Attempt to complete the challenge with plausible child guesses.
**Expected (PASS):** Exit requires parental authentication that is genuinely difficult for the target age group. A 4-digit PIN or account password qualifies. A birth-year entry does not qualify for Child-12 or Teen-16 profiles.
**Failure Indicators:** Exit requires no challenge, or the challenge is solvable by the target age group (e.g., a birth-year entry that a 10-year-old who knows their parent's approximate age can guess within 3 attempts).

---

**Scenario ID:** KM-02
**Category:** Kids Mode Escape
**Title:** Use browser back button to escape Kids mode
**Severity:** Medium
**Profiles Tested:** Child-7, Child-12
**Platforms:** All (web browser)
**Preconditions:** Kids mode is active in a web browser. Browser history includes pages from before Kids mode was activated.
**Steps:**
1. From the Kids mode homepage, click the browser's back button repeatedly.
2. Observe whether the browser navigates to a non-Kids-mode page (e.g., the main platform homepage, profile picker, or account settings).
3. If a non-Kids page loads, check whether it is unrestricted.
4. Try pressing and holding the back button to see the history dropdown, and select a pre-Kids-mode URL.
**Expected (PASS):** Browser back-button navigation either stays within Kids mode (all prior pages are also Kids-mode pages) or triggers the Kids-mode exit authentication challenge.
**Failure Indicators:** The browser back button navigates to the unrestricted platform homepage or any page outside Kids mode without an authentication challenge.

---

**Scenario ID:** KM-03
**Category:** Kids Mode Escape
**Title:** Type main platform URL in address bar while in Kids mode
**Severity:** Medium
**Profiles Tested:** Child-12, Teen-16
**Platforms:** All (web browser)
**Preconditions:** Kids mode is active in a web browser.
**Steps:**
1. While in Kids mode, click the browser address bar.
2. Type the platform's main URL (e.g., `netflix.com/browse` instead of `netflix.com/kids`).
3. Press Enter and observe whether the platform redirects back to Kids mode or loads the main unrestricted interface.
4. Try additional URL variations: the platform root (`netflix.com`), a specific content URL, the settings page URL.
**Expected (PASS):** All URL navigation attempts while Kids mode is active redirect to the Kids mode homepage or trigger an exit authentication challenge.
**Failure Indicators:** Typing the main platform URL loads the unrestricted interface, bypassing Kids mode entirely.

---

#### Age Gate (AG)

**Scenario ID:** AG-01
**Category:** Age Gate & Account Creation
**Title:** Attempt to create new account with child birthdate
**Severity:** High
**Profiles Tested:** Child-12, Teen-16
**Platforms:** All
**Preconditions:** Tester has a fresh email address not associated with any platform account. A web browser or the platform app is open to the signup page.
**Steps:**
1. Navigate to the platform's account creation / sign-up page.
2. Enter a valid email address and password.
3. When prompted for birthdate, enter a date that makes the user 10 years old.
4. Complete the remaining sign-up steps.
5. Observe whether the platform blocks account creation, applies automatic restrictions, or creates an unrestricted account.
**Expected (PASS):** The platform either blocks account creation for users under 13 (COPPA compliance) or automatically applies maximum maturity restrictions to the new account.
**Failure Indicators:** An unrestricted account is created for a user who declared they are 10 years old, with full access to all content.

---

**Scenario ID:** AG-02
**Category:** Age Gate & Account Creation
**Title:** Attempt to create new account with false adult birthdate
**Severity:** High
**Profiles Tested:** Child-12, Teen-16
**Platforms:** All
**Preconditions:** Tester has a fresh email address.
**Steps:**
1. Navigate to the sign-up page.
2. Enter a valid email and password.
3. When prompted for birthdate, enter a date that makes the user 25 years old.
4. Complete sign-up. Do not configure any parental controls.
5. Search for and attempt to play explicit content (TV-MA or R-rated).
6. Assess the entire flow: could a 12-year-old complete this process?
**Expected (PASS):** Account creation requires payment (credit card as a soft age gate), or includes additional age verification beyond a self-reported birthdate. The platform prompts the user to set up parental controls if minors will use the account.
**Failure Indicators:** A fully unrestricted account is created with no verification beyond the self-reported birthdate. A child who enters a false age gets full access to all content.

---

**Scenario ID:** AG-03
**Category:** Age Gate & Account Creation
**Title:** Access platform without any account (free tiers)
**Severity:** Medium
**Profiles Tested:** Child-7, Child-12, Teen-16
**Platforms:** Tubi, Pluto TV, Peacock (free tier), Roku Channel, Freevee
**Preconditions:** Browser with no platform cookies or authentication. No account created.
**Steps:**
1. Navigate to the platform's URL in a clean browser session (no cookies, no login).
2. Observe whether any age gate, registration, or authentication is required before content is browsable.
3. Browse the content catalog — check whether explicit or mature content is visible.
4. Attempt to play an explicit title without logging in or creating an account.
5. If playback is allowed, record the maturity rating of the content accessed.
**Expected (PASS):** Free-tier access either requires age verification, defaults to restricted content only, or requires account creation (with age gate) before any playback.
**Failure Indicators:** Explicit content is browsable and playable without any account, login, or age verification. A child can access TV-MA or R-rated content by simply navigating to the platform URL.

---

#### Content Rating Gaps (CG)

**Scenario ID:** CG-01
**Category:** Content Rating Gaps & Edge Cases
**Title:** Search for and attempt to play unrated content on Kids profile
**Severity:** Medium
**Profiles Tested:** Child-7, Child-12, Teen-16
**Platforms:** All
**Preconditions:** Logged into a Kids profile. Platform catalog includes unrated content (common on platforms with large catalogs like Prime Video, Tubi).
**Steps:**
1. From the Kids profile, search for titles known to be unrated or to have inconsistent ratings across platforms (independent films, international acquisitions, short-form content).
2. If unrated titles appear in search results, attempt to access the content detail page.
3. Check the displayed rating — is it marked "NR" (Not Rated), "Unrated," or simply missing a rating badge?
4. Attempt to play the unrated content.
**Expected (PASS):** Unrated content is either excluded from search results on Kids profiles or defaults to the most restrictive maturity tier and is blocked.
**Failure Indicators:** Unrated content appears in search results and is playable on the Kids profile. The absence of a rating is treated as "no restriction" rather than "maximum restriction."

---

**Scenario ID:** CG-02
**Category:** Content Rating Gaps & Edge Cases
**Title:** Access standup comedy specials on Kids profile
**Severity:** Medium
**Profiles Tested:** Child-12, Teen-16
**Platforms:** Netflix, Max, Prime Video, Hulu, Paramount+, Apple TV+
**Preconditions:** Logged into a Kids profile. Platform catalog includes standup comedy specials (many are TV-MA but sometimes miscategorized or inconsistently rated).
**Steps:**
1. From the Kids profile, search for "standup" or "comedy special."
2. Browse any comedy-specific category or genre section if available.
3. Check the maturity ratings of any standup specials that appear.
4. Attempt to play any standup special that appears in results.
5. If a special plays, note whether its actual content includes profanity, sexual references, or other adult material despite its displayed rating.
**Expected (PASS):** Standup specials rated TV-MA are excluded from Kids profile search and browse. Any specials that appear are rated appropriately for the profile's maturity tier.
**Failure Indicators:** TV-MA standup specials appear in search or browse on the Kids profile, or specials with family-friendly ratings contain adult material (indicating a misrating).

---

**Scenario ID:** CG-03
**Category:** Content Rating Gaps & Edge Cases
**Title:** Access foreign-language content on Kids profile
**Severity:** Medium
**Profiles Tested:** Child-7, Child-12, Teen-16
**Platforms:** Netflix, Prime Video, Tubi, Rakuten Viki
**Preconditions:** Logged into a Kids profile. Platform has foreign-language content that may use different rating systems or lack US-equivalent ratings.
**Steps:**
1. From the Kids profile, browse for foreign-language content (search for "Korean drama," "anime," "French film," or browse international content categories).
2. Check whether returned titles have US-equivalent maturity ratings displayed.
3. For titles with missing or unfamiliar ratings (e.g., a Korean age rating but no US MPAA/TV equivalent), attempt to play the content.
4. Record any instance where foreign content with mature themes is accessible due to rating gaps.
**Expected (PASS):** All foreign-language content has been mapped to US-equivalent maturity ratings. Content without a reliable rating mapping is excluded from Kids profiles or defaults to the most restrictive tier.
**Failure Indicators:** Foreign-language content with mature themes is accessible on Kids profiles because the platform failed to map its regional rating to a US equivalent, or the content lacks any rating and defaults to unrestricted.

---

**Scenario ID:** CG-04
**Category:** Content Rating Gaps & Edge Cases
**Title:** Check if trailers for R-rated content are viewable on Kids profile
**Severity:** Medium
**Profiles Tested:** Child-7, Child-12, Teen-16
**Platforms:** All
**Preconditions:** Logged into a Kids profile.
**Steps:**
1. From the Kids profile, navigate to any "Coming Soon" or "New & Noteworthy" section.
2. Check whether trailers or previews for upcoming R-rated or TV-MA titles are displayed.
3. Attempt to search for a known R-rated title and check if its trailer is accessible even if the full content is blocked.
4. On platforms with separate trailer/preview sections, browse the trailer library from the Kids profile.
**Expected (PASS):** Trailers inherit the maturity rating of their parent content. Trailers for R-rated or TV-MA titles are not viewable on Kids profiles.
**Failure Indicators:** Trailers for restricted content are viewable on the Kids profile even though the full content is blocked. The platform treats trailers as separate, unrated content.

---

**Scenario ID:** CG-05
**Category:** Content Rating Gaps & Edge Cases
**Title:** Check live TV / linear channels for maturity filtering
**Severity:** Medium
**Profiles Tested:** Child-7, Child-12, Teen-16
**Platforms:** Peacock, Hulu (Live TV), Paramount+, Pluto TV, Tubi
**Preconditions:** Logged into a Kids profile on a platform that offers live TV or linear channel streaming.
**Steps:**
1. From the Kids profile, navigate to the live TV or linear channels section.
2. Browse the channel guide. Check whether adult-oriented channels are visible (e.g., true-crime channels, adult comedy channels, news channels with graphic content).
3. Attempt to tune into a channel that is known to air mature content.
4. If the channel loads, observe whether the currently airing content is filtered or if the child sees whatever is live.
**Expected (PASS):** Adult-oriented channels are hidden from the Kids profile channel guide. If a live channel is accessible, its content is screened against the profile's maturity tier in real-time or the channel is pre-classified and blocked.
**Failure Indicators:** Adult-oriented live channels are visible and accessible from the Kids profile. The child can watch unfiltered live programming.

---

### 4.3 Multi-Step Escalation Sequences

These sequences chain multiple bypass vectors to simulate realistic child behavior. Each sequence represents a plausible escalation path a child might follow.

---

**Scenario ID:** ESC-01
**Category:** Multi-Step Escalation
**Title:** The Profile Swap
**Severity:** Critical
**Profiles Tested:** Child-12, Teen-16
**Platforms:** All
**Preconditions:** Account has a Kids profile (active) and at least one Adult profile. PIN protection status varies by test variant.
**Steps:**
1. From the Kids profile, navigate to the profile picker.
2. Identify the Adult profile. Attempt to switch to it.
3. If PIN is required, attempt common PINs: 0000, 1234, 1111, the child's birth year, the parent's birth year.
4. If PIN fails, check for a "Forgot PIN" recovery option and attempt to use it.
5. If PIN is bypassed or the Adult profile has no PIN, confirm landing on the Adult homepage.
6. Use the search function to find an explicit title (e.g., "Squid Game").
7. Navigate to the title's detail page and initiate playback.
8. After viewing, switch back to the Kids profile and check whether any evidence remains (watch history on Adult profile, "Continue Watching" bleed to Kids profile).
**Expected (PASS):** The escalation is blocked at step 2 or 3. PIN enforcement prevents profile switch. If PIN is bypassed (vulnerability), the sequence documents the full chain of access.
**Failure Indicators:** The child completes the entire sequence — switching profiles, finding explicit content, watching it, and returning to the Kids profile. Bonus failure: no evidence of the activity is visible to the parent.

---

**Scenario ID:** ESC-02
**Category:** Multi-Step Escalation
**Title:** The New Account
**Severity:** Critical
**Profiles Tested:** Child-12, Teen-16
**Platforms:** All (especially free-tier platforms)
**Preconditions:** The child has access to an email address (personal, school, or throwaway) and a web browser.
**Steps:**
1. Open a new browser window or incognito tab.
2. Navigate to the platform's sign-up page.
3. Enter an email address and create a password.
4. When prompted for birthdate, enter a date making the user 21 years old.
5. Complete account creation. Skip or decline parental control setup if prompted.
6. On the new unrestricted account, search for an explicit title.
7. Navigate to the content detail page and initiate playback.
8. Assess whether payment was required at any point (credit card as soft age gate) or if the entire flow was free.
**Expected (PASS):** Account creation requires payment (credit card verification) which a child cannot provide, or age verification catches the false birthdate through additional checks (ID verification, device-level age signals).
**Failure Indicators:** A child creates a fully unrestricted account using only an email address and a false birthdate. No payment or additional verification is required. On free-tier platforms, this sequence may be trivially completable.

---

**Scenario ID:** ESC-03
**Category:** Multi-Step Escalation
**Title:** The Settings Change
**Severity:** Critical
**Profiles Tested:** Child-12, Teen-16
**Platforms:** All
**Preconditions:** Logged into a Kids profile with maturity set to an age-appropriate tier.
**Steps:**
1. From the Kids profile, navigate to profile settings or account settings.
2. Locate the maturity rating control.
3. Attempt to change the maturity level from the current tier (e.g., PG) to unrestricted (e.g., TV-MA / R).
4. If the change succeeds without authentication, return to the homepage.
5. Search for an explicit title that was previously blocked.
6. Navigate to the content detail page and initiate playback.
7. After viewing, navigate back to settings and revert the maturity level to its original value.
8. Check whether any evidence of the temporary change or viewing activity is visible to the parent (e.g., change log, watch history, email notification).
**Expected (PASS):** Settings change at step 3 requires parental authentication. The escalation cannot proceed.
**Failure Indicators:** Maturity settings are changed without authentication, explicit content is accessed, and the child successfully reverts settings — leaving no visible evidence for the parent.

---

**Scenario ID:** ESC-04
**Category:** Multi-Step Escalation
**Title:** The Link Forwarding
**Severity:** High
**Profiles Tested:** Child-12, Teen-16
**Platforms:** All (web browser)
**Preconditions:** Account has both Adult and Kids profiles. The child has access to a messaging app or can receive links from friends.
**Steps:**
1. On the Adult profile (or from a friend's message / Google search), obtain the direct URL of an explicit title's playback page.
2. Copy the URL.
3. Switch to the Kids profile (or have the Kids profile already active).
4. Paste the URL into the browser address bar and press Enter.
5. Observe whether the platform intercepts the URL and enforces Kids profile restrictions.
6. If blocked, try variations: the content detail URL instead of the playback URL, a universal link, a shortened URL, a platform share link.
**Expected (PASS):** All URL variants are intercepted. The platform detects the active Kids profile and blocks access regardless of URL format.
**Failure Indicators:** Any URL variant loads the content detail page or initiates playback while the Kids profile is active.

---

**Scenario ID:** ESC-05
**Category:** Multi-Step Escalation
**Title:** The Evidence Cleanup
**Severity:** High
**Profiles Tested:** Teen-16
**Platforms:** All
**Preconditions:** The teen has already accessed explicit content on their profile (through any bypass method). The parent periodically reviews viewing history.
**Steps:**
1. After watching explicit content, navigate to the profile's viewing history or activity page.
2. Locate the explicit title in the history.
3. Attempt to delete or remove the title from viewing history.
4. Check whether the deletion also removes the title from "Continue Watching," recommendation signals, and any parent-facing activity reports.
5. If the platform sends viewing activity emails or push notifications, check whether those can be deleted or if they have already been sent.
6. Switch to the parent's perspective: log in as the parent or access the parental controls dashboard and verify whether any trace of the viewing activity remains.
**Expected (PASS):** Either viewing history cannot be deleted from the child/teen profile, or deletion from the profile-level history does not remove the record from the parent-facing activity log or dashboard. Parents retain visibility into all viewing activity regardless of the child's actions.
**Failure Indicators:** The teen deletes the explicit title from their viewing history, and no trace remains visible to the parent — no activity log entry, no email notification, no "Continue Watching" residue. The bypass is completely undetectable.

---

### 4.4 Platform-Specific Scenario Overrides

The following platform-specific scenarios supplement the universal scenarios above. They address features, behaviors, or design decisions unique to individual platforms that create additional bypass vectors or modify how universal scenarios should be executed.

---

#### Netflix

- **Profile Transfer bypass (PE-variant):** Netflix allows users to "Transfer Profile" to a new account. Test whether a child on a Kids profile can initiate a profile transfer that creates a new, unrestricted account from their existing profile data.
- **Netflix Games maturity filtering (CG-variant):** Netflix Games are accessible from the same profile interface. Test whether games rated above the Kids profile's maturity tier are visible and launchable. Navigate to the Games tab and audit all visible titles against the profile's maturity cap.
- **"Kids" row escape (KM-variant):** Netflix Kids mode uses a simplified UI. Test whether the "Exit Kids" button at the bottom-right of the Netflix Kids screen requires a PIN or account password, and whether the challenge is enforced consistently across web, mobile, and TV apps.

#### Peacock

- **Unprotected profile creation (PE/AG-variant):** Peacock allows profile creation from within the app. Test whether a child can create a new profile that defaults to unrestricted maturity settings without any authentication.
- **Live TV channel filtering (CG-05 extension):** Peacock offers live channels including true-crime and news. Verify that the Kids profile channel guide excludes channels that regularly air violent or mature content.
- **Free tier access (AG-03 extension):** Peacock's free tier allows content browsing and playback without account creation. Test whether explicit content is accessible on the free tier without any age gate.

#### Disney+

- **"Kid-Proof Exit" birth year challenge (KM-01 extension):** Disney+ uses a birth-year entry to exit kids profiles. Test the effectiveness of this challenge: a 7-year-old is unlikely to guess correctly, but a 12-year-old who knows their parent's approximate age can narrow it to 2–3 guesses. Document the number of allowed attempts and whether lockout occurs.
- **GroupWatch restrictions (RL-variant):** Disney+ GroupWatch allows synchronized viewing. Test whether a child on a Kids profile can join a GroupWatch session where an adult is watching restricted content.
- **Profile maturity settings tiers:** Disney+ offers discrete content rating tiers (TV-Y, TV-Y7, TV-G, TV-PG, PG-13, R). Verify that each tier correctly filters content and that no tier-inappropriate content leaks through.

#### Prime Video

- **Freevee content mixing (CG-variant):** Prime Video integrates Freevee (ad-supported) content into the same interface. Test whether Freevee content respects Kids profile maturity filters or bypasses them because it is treated as a separate content source.
- **Channel subscriptions leaking (CG-variant):** Prime Video offers add-on channel subscriptions (Showtime, Starz, etc.). Test whether content from these channels is filtered by the Kids profile's maturity settings or is accessible simply because the channel subscription exists.
- **X-Ray metadata exposure (SD-variant):** Prime Video's X-Ray feature shows actor information, trivia, and related titles during playback. Test whether X-Ray on a Kids profile title surfaces information about or links to restricted titles featuring the same actors.

#### Max (HBO)

- **HBO content isolation (CG-variant):** Max combines HBO content (often TV-MA) with Warner Bros. family content. Test whether the Kids profile completely isolates HBO originals, or whether any HBO content appears in Kids browse or search due to shared metadata or recommendation signals.
- **"Just for Kids" vs. profile restrictions (KM-variant):** Max offers a "Just for Kids" mode in addition to profile-level maturity settings. Test whether these are redundant or if one can be bypassed while the other remains active. Specifically, test whether exiting "Just for Kids" mode lands on a profile that may still have higher maturity settings.

#### YouTube

- **Restricted Mode toggle (MF-variant):** YouTube's Restricted Mode is a toggle, not a profile-level setting. Test how easily a child can disable Restricted Mode — is it gated behind authentication or accessible with a single toggle? Document whether the setting persists across sessions or resets.
- **Age-gated video bypass (DU-variant):** YouTube age-gates certain videos, requiring sign-in to view. Test whether a child with a YouTube account (associated with a family plan) can access age-gated videos, and whether the family plan's parental controls affect age-gate enforcement.
- **Shorts filtering (RL-variant):** YouTube Shorts uses a separate recommendation algorithm. Test whether Shorts served on a Kids or restricted account include age-inappropriate content that would be filtered from the main feed. Scroll through at least 50 Shorts and audit for maturity.

#### Hulu

- **Live TV filtering (CG-05 extension):** Hulu with Live TV includes channels that air unfiltered programming. Test whether Kids profile restrictions apply to the live TV guide, or whether all channels are accessible regardless of profile settings.
- **Lack of dedicated kids mode (KM-variant):** Hulu does not have a dedicated kids app or mode equivalent to Netflix Kids. Test whether Hulu's profile-level maturity settings alone are sufficient to prevent access to explicit content, or whether the absence of a walled-garden mode creates additional bypass surface area.

#### Paramount+

- **Showtime content gating (CG-variant):** Paramount+ with Showtime includes TV-MA content from the Showtime catalog. Test whether this content is properly gated by Kids profile maturity settings, or whether the Showtime integration creates a gap where Showtime titles bypass the standard maturity filter.

#### Apple TV+

- **Web vs. device control differences (MF-variant):** Apple TV+ parental controls are configured at the device level (Screen Time) on Apple devices but at the account/profile level on the web. Test whether restrictions configured on an Apple device are enforced when the same account is accessed via the web browser, and vice versa. Document any discrepancy between device-level and web-level enforcement.


## 5. Scoring & Grading System

### 5.1 Per-Scenario Scoring Rubric (0–4 Scale)

This scoring scale is intentionally aligned with `AI_CHATBOT_RESEARCH_FRAMEWORK.md` so that cross-domain comparisons between chatbot safety and streaming content safety are directly meaningful. A score of 0 represents perfect protection; a score of 4 represents the platform actively undermining child safety.

| Score | Label | Description | Example |
|---|---|---|---|
| 0 | **Full Block** | Content completely inaccessible. No evidence of restricted content in any form. The child has no indication the content exists on the platform. | Search returns zero results for explicit title. Direct URL redirects to Kids homepage with no flash of restricted content. Profile picker does not display adult profiles. |
| 1 | **Partial Block** | Content metadata is visible but playback is blocked. The child can see that restricted content exists (title, thumbnail, rating badge) but cannot watch, listen to, or meaningfully engage with it. | Title card and TV-MA rating visible in search results, but clicking shows "This title is not available on your profile." Trailer thumbnails appear but clicking yields a PIN prompt. |
| 2 | **Soft Barrier** | Content is accessible after a minor, easily circumvented obstacle. The barrier does not require the parent's actual credential or any privileged knowledge. | Content plays after clicking through a single warning dialog that requires no PIN or password. Exit Kids mode by entering any 4-digit number as a birth year. Maturity setting changeable without re-authentication. |
| 3 | **Unprotected** | Content fully accessible with zero barriers. No warning, no prompt, no age gate, no authentication. The child simply navigates to or clicks on the content and it plays. | Explicit content plays immediately on a Kids profile after clicking the play button. Direct URL loads the full content detail page with a functional play button on a child's profile. |
| 4 | **Facilitated** | The platform actively surfaces restricted content to the child without the child seeking it. The platform's own systems (recommendations, autoplay, trending) push age-inappropriate content into the child's experience. | Recommendation algorithm shows R-rated films on the Kids profile homepage carousel. Autoplay queues a TV-MA episode after a Kids show ends. "Trending" row on a child profile includes explicit content. |

**Edge Case Scoring Guidance:**

- **Infrastructure failure (page crash, timeout, element not found):** Score as `N/A`. Document the failure in the scenario notes field. Do not count toward category aggregation. If more than 30% of scenarios in a category are N/A, flag the category result as LOW_CONFIDENCE.
- **Surface-specific inconsistency:** If a control works on one platform surface (e.g., web app search) but fails on another (e.g., direct URL navigation), score the specific surface tested by that scenario. Note the inconsistency in the scenario notes. Do not average across surfaces.
- **Ambiguous playback state:** If it is unclear whether video actually started playing (e.g., a black screen with controls visible but no frame rendered), take a second screenshot after 10 seconds. If still ambiguous, score as 2 (soft barrier) and note "Playback state ambiguous — controls rendered but content delivery unconfirmed."
- **Partial content exposure:** If a platform blocks the full video but exposes a significant preview (e.g., 30-second unblocked trailer of R-rated content with violence), score as 2 if the preview contains age-inappropriate material, 1 if the preview is sanitized.
- **Critical Failure Override trigger:** A score of 3 or 4 on ANY scenario classified as Critical severity immediately triggers the Critical Failure Override rules defined in Section 5.5. This is evaluated before grade calculation.

### 5.2 Category Aggregation Method

Each test category (Search & Discovery, Direct URL Access, Profile Escape, etc.) produces a single category score derived from the weighted average of its constituent scenario scores.

**Formula:**

```
Category Score = Σ(scenario_score_i × severity_multiplier_i) / Σ(max_possible_score × severity_multiplier_i)
```

Where:
- `scenario_score_i` is the 0–4 score for scenario i
- `max_possible_score` is always 4
- `severity_multiplier_i` is determined by the scenario's severity tier:

| Severity | Multiplier | Rationale |
|---|---|---|
| Critical | 3.0x | Direct exposure to explicit content; must dominate the score |
| High | 2.0x | Bypass enabling further exploitation; significant weight |
| Medium | 1.0x | Edge cases and information leakage; baseline weight |

**Normalization:** The result is scaled to the 0–4 range so that category scores are directly comparable to individual scenario scores and use the same interpretive labels (Full Block through Facilitated).

**Worked Example:**

A category with three scenarios:
- Scenario A (Critical): score 0 → 0 × 3.0 = 0.0
- Scenario B (High): score 2 → 2 × 2.0 = 4.0
- Scenario C (Medium): score 1 → 1 × 1.0 = 1.0

Numerator: 0.0 + 4.0 + 1.0 = 5.0
Denominator: (4 × 3.0) + (4 × 2.0) + (4 × 1.0) = 12.0 + 8.0 + 4.0 = 24.0
Category Score: (5.0 / 24.0) × 4.0 = **0.83**

This score of 0.83 falls in the "Partial Block" range, reflecting that the critical scenario passed but a high-severity scenario exposed a soft barrier.

**N/A Handling:** Scenarios scored as N/A are excluded from both the numerator and denominator. If exclusion drops a category below 2 scoreable scenarios, the category result is marked LOW_CONFIDENCE.

### 5.3 Overall Platform Grade (A–F)

The overall platform score is a weighted combination of all category scores, using the category weights defined in Section 3.

**Formula:**

```
Overall Score = Σ(category_score_j × category_weight_j) / Σ(4.0 × category_weight_j)
```

The result is a value between 0.0 and 4.0, mapped to a letter grade as follows:

| Grade | Score Range | Interpretation |
|---|---|---|
| A | 0.00 – 0.12 | Near-perfect protection (0–3% of max failure) |
| A- | 0.13 – 0.25 | Excellent protection with negligible edge cases |
| B+ | 0.26 – 0.40 | Strong protection, minor non-critical gaps |
| B | 0.41 – 0.60 | Good protection, some gaps in secondary controls |
| B- | 0.61 – 0.80 | Above average, but noticeable weaknesses |
| C+ | 0.81 – 1.00 | Moderate protection, several gaps identified |
| C | 1.01 – 1.50 | Significant gaps requiring immediate attention |
| C- | 1.51 – 2.00 | Poor protection, critical failure override likely active |
| D | 2.01 – 2.75 | Inadequate protection across multiple vectors |
| F | 2.76 – 4.00 | No effective protection; controls absent or trivially bypassed |

**Per-Profile Grading:** The overall grade is computed separately for each test profile (Child-7, Child-12, Teen-16). The platform's headline grade is the WORST of the three profile grades, because a platform is only as safe as its weakest age tier. All three profile grades are reported in the scorecard.

### 5.4 Severity Classification

Every test scenario is pre-assigned a severity tier that reflects the real-world harm if the control fails. Severity is fixed per scenario and does not change based on the platform being tested.

| Severity | Definition | Example Scenarios | Weight in Aggregation |
|---|---|---|---|
| **Critical** | A child gains direct, unblocked playback access to explicit content (TV-MA, R, NC-17, or equivalent) on a Kids or Teen profile. This represents the highest-impact failure: the parental control system has completely failed its core purpose. | SD-01 (search explicit title, play succeeds), DU-01 (direct URL to explicit content, plays), PE-01 (switch to unrestricted adult profile without PIN), KM-01 (exit Kids mode with no challenge) | 3.0x multiplier. Triggers Critical Failure Override if score >= 3. |
| **High** | A child bypasses a control mechanism in a way that enables further exploitation, or gains significant exposure to restricted content metadata/previews. The failure does not directly result in full playback but materially weakens the safety posture. | MF-01 (change maturity filter without re-auth), PL-01 (no PIN lockout after failed attempts), PE-02 (profile switch shows adult titles in picker), RL-01 (autoplay queues restricted content) | 2.0x multiplier. Two or more High-severity fails with score >= 3 add a grade penalty notation. |
| **Medium** | Minor information leakage, edge case content exposure, or evidence concealment failures. The child does not gain direct access to explicit content but may be exposed to borderline material, or parental oversight is undermined. | CG-01 (unrated content plays without restriction), CB-02 (adult watchlist visible on child profile), RL-03 (restricted trailer thumbnail in recommendation row), CB-01 (continue watching leaks adult viewing) | 1.0x multiplier (baseline). |

### 5.5 Critical Failure Override Rules

These overrides exist to prevent a single catastrophic failure from being mathematically diluted by passing scores elsewhere. A platform that lets a 7-year-old watch explicit content in one click cannot receive a B just because search filtering works well.

| Rule | Condition | Effect |
|---|---|---|
| **CFO-1** | Any Critical-severity scenario scores 3 or 4 on any profile | Platform grade capped at **C-** regardless of calculated overall score |
| **CFO-2** | Any Critical-severity scenario scores 3 or 4 specifically on the **Child-7** profile | Platform grade capped at **D** (youngest children deserve strongest protection) |
| **CFO-3** | Two or more Critical-severity scenarios score 2 or higher on the same profile | Platform grade capped at **C** (multiple soft barriers to explicit content is systemic) |
| **CFO-4** | Profile Escape scenario PE-01 scores 3 on any profile | Platform grade capped at **C** (unprotected profile switching is a fundamental bypass that invalidates all content filtering) |
| **CFO-5** | Any scenario scores 4 (Facilitated) on any profile at any severity | Platform grade capped at **C-** (platform actively surfacing inappropriate content is a design-level failure) |

**Application order:** Evaluate all five rules. Apply the most restrictive cap. If the calculated grade is already at or below the cap, the override has no effect but is still noted in the scorecard for transparency.

**Scorecard notation:** When a Critical Failure Override is active, the scorecard MUST display:
```
⚠ CRITICAL FAILURE OVERRIDE ACTIVE
Rule: CFO-2
Trigger: SD-01 scored 3 on Child-7 profile
Effect: Grade capped at D (calculated grade was B-)
```

### 5.6 Score Interpretation Guide

**A / A- (0.00–0.25):** The platform demonstrates robust, layered content protection. No critical bypasses were found across any test profile. Content filtering is comprehensive: explicit titles do not appear in search, direct URLs are redirected, profile switching requires PIN authentication, and Kids mode is well-isolated from the broader catalog. Recommendation engines respect profile maturity settings. Minor imperfections (e.g., an occasional borderline-rated title appearing in search results without playback access) may exist but do not constitute meaningful risk. Parents can rely on the platform's built-in controls as a primary safeguard.

**B+ / B / B- (0.26–0.80):** Controls are fundamentally solid but exhibit gaps in secondary or edge-case scenarios. The primary protection layer (content filtering, profile PINs) works as intended, and no direct access to explicit content was achieved. However, some restricted content metadata leaks through (e.g., title cards visible in search, autocomplete suggestions for explicit titles, thumbnail previews in recommendation rows). Kids mode exit may require only a trivial challenge. Parents should supplement platform controls with periodic manual review.

**C+ / C / C- (0.81–2.00):** Significant gaps exist in the platform's content safety controls. At least one test vector allows a child to access restricted content through a soft barrier or no barrier at all, OR a Critical Failure Override has been triggered. The platform's controls may work for passive, non-curious children but will not withstand deliberate attempts to find restricted content. This grade range indicates the platform cannot be trusted as a standalone parental control. Parents must use external parental control tools or direct supervision.

**D (2.01–2.75):** Protection is inadequate across multiple vectors. A moderately determined child can access explicit content within minutes using basic techniques (searching, URL manipulation, profile switching). Multiple control mechanisms are either absent or trivially bypassed. The platform has some nominal safety features (e.g., a Kids mode exists) but they fail under even casual testing. This grade typically indicates a Critical Failure Override is active on the youngest profile tier.

**F (2.76–4.00):** No effective content protection exists. Controls are absent, non-functional, or actively undermined by platform design (e.g., recommendation algorithms surface explicit content to child profiles). A child on any profile tier can access the full adult catalog without meaningful obstacles. This grade indicates either a complete absence of parental controls or controls so poorly implemented that they provide a false sense of security, which is arguably worse than no controls at all.

---

## 6. Agent Execution Guide

### 6.1 Pre-Flight Checklist

Before starting any test run, the executing agent MUST verify every item on this checklist. Do not proceed until all items are confirmed. Record the checklist completion timestamp in the execution log.

```
PRE-FLIGHT CHECKLIST
====================

Browser Environment:
[ ] Chrome MCP or Playwright MCP is connected and responding to tool calls
[ ] Browser window is sized to 1920x1080 (call resize_page or browser_resize)
[ ] No stale tabs or sessions from previous runs (close all tabs, open fresh)

Credentials & Accounts:
[ ] Test account credentials for target platform are available
[ ] Credentials include: email, password, profile names, profile PINs (if set)
[ ] Confirm account subscription is active (some platforms disable profiles on lapsed accounts)

Platform Accessibility:
[ ] Navigate to platform login page; confirm it loads without CAPTCHA or geo-block
[ ] If Cloudflare challenge appears, wait 10 seconds for auto-resolution
[ ] If platform requires VPN or geo-specific access, configure before proceeding

Test Content Verification:
[ ] Scout agent has produced a content_availability_manifest for this platform
[ ] Manifest confirms at least one explicit title (TV-MA/R) is available on the adult profile
[ ] Manifest includes direct URLs for explicit content (needed for DU-* scenarios)
[ ] Manifest includes specific search terms that return explicit results on adult profile

File System:
[ ] Screenshot directory exists: research/content_safety/results/{platform}/screenshots/
[ ] Results JSON file path is defined: research/content_safety/results/{platform}/results.json
[ ] Previous run results are archived (renamed with timestamp) if they exist

Profile Configuration:
[ ] Pre-Test Verification Checklist (Section 2.5) is complete for all test profiles
[ ] Child-7 profile confirmed: maturity set to youngest tier, PIN protection on profile switch
[ ] Child-12 profile confirmed: maturity set to PG-13/TV-PG equivalent
[ ] Teen-16 profile confirmed: maturity set to PG-13 or TV-14 equivalent
[ ] Adult profile confirmed: no maturity restrictions, full catalog access
```

### 6.2 Chrome MCP Step-by-Step Protocol

This section defines exact tool call sequences using actual Chrome MCP and Playwright MCP tool names. The agent MUST follow these sequences precisely, including all wait steps and screenshot captures.

**Phase 1: Login and Profile Verification**

```
Step 1:  navigate_page(url: "{platform_login_url}")
Step 2:  wait_for(text: ["Sign In", "Log In", "Email", "Username"], timeout: 10000)
Step 3:  take_snapshot() → Parse snapshot to find email input UID and password input UID
Step 4:  fill(uid: "{email_field_uid}", value: "{test_email}")
Step 5:  fill(uid: "{password_field_uid}", value: "{test_password}")
Step 6:  take_snapshot() → Find and confirm sign-in button UID
Step 7:  click(uid: "{sign_in_button_uid}")
Step 8:  wait_for(text: ["Who's watching", "Choose a profile", "Profiles", "Home"],
                  timeout: 15000)
Step 9:  take_screenshot(filePath: "screenshots/00_login_success.png")
Step 10: take_snapshot() → Verify profile picker is displayed
         - Record all visible profile names and their UIDs
         - Confirm target test profiles exist (Child-7, Child-12, Teen-16, Adult)
         - If profile picker does not appear (auto-redirected to homepage),
           navigate to profile management URL manually
```

**Phase 2: Switch to Target Profile**

```
Step 1:  take_snapshot() → Find UID for target profile (e.g., "Child-7")
Step 2:  click(uid: "{target_profile_uid}")
Step 3:  wait_for(text: ["Home", "For You", "Kids", "Search"], timeout: 10000)
         - If PIN prompt appears, enter the profile PIN only if this is the
           SETUP phase (not a test scenario). Record that PIN was required.
Step 4:  take_snapshot() → Verify the active profile matches the target
         - Look for profile name/avatar indicator in the navigation bar
         - Confirm the content catalog reflects the expected maturity tier
Step 5:  take_screenshot(filePath: "screenshots/01_{profile_name}_home.png")
Step 6:  Record in execution log:
         {
           "phase": "profile_switch",
           "target_profile": "{profile_name}",
           "switch_successful": true/false,
           "pin_required": true/false,
           "homepage_content_appropriate": true/false
         }
```

**Phase 3: Execute Test Scenario**

The execution pattern varies by scenario category. The following are complete, step-by-step protocols for each major pattern.

### 6.2.1 SEARCH Test Protocol (SD-* Scenarios)

```
Step 1:  take_snapshot() → Find search icon or search bar UID
         - Common locations: top navigation, header bar
         - Common labels in snapshot: "Search", magnifying glass icon
Step 2:  click(uid: "{search_icon_uid}")
Step 3:  Pause 2 seconds (allow search interface to render)
Step 4:  take_snapshot() → Find search text input field UID
Step 5:  fill(uid: "{search_input_uid}", value: "{search_term}")
         - Search term comes from the content_availability_manifest
         - Use the exact title of the target explicit content
Step 6:  Pause 3 seconds (allow search API to return results)
Step 7:  take_snapshot() → Capture full search results
Step 8:  take_screenshot(filePath: "screenshots/{scenario_id}_search_results.png")
Step 9:  EVALUATE search results from snapshot:

         IF snapshot contains NO results or "No results found":
           → outcome = "SEARCH_NO_RESULTS"
           → score = 0 (Full Block)
           → STOP — scenario complete

         IF snapshot contains results but target explicit title is ABSENT:
           → outcome = "SEARCH_FILTERED"
           → score = 0 (Full Block)
           → STOP — scenario complete

         IF snapshot contains target explicit title:
           → outcome = "SEARCH_TITLE_VISIBLE"
           → Record: title text, rating badge (if visible), thumbnail description
           → CONTINUE to access attempt

Step 10: click(uid: "{target_content_uid}") — click the explicit title card
Step 11: Pause 3 seconds (allow detail page to load)
Step 12: take_snapshot() → Capture content detail page
Step 13: take_screenshot(filePath: "screenshots/{scenario_id}_detail_page.png")
Step 14: EVALUATE detail page from snapshot:

         IF snapshot shows block message ("Not available", "Restricted", etc.):
           → outcome = "DETAIL_BLOCKED"
           → score = 1 (Partial Block — title was visible but access denied)
           → STOP — scenario complete

         IF snapshot shows PIN prompt:
           → outcome = "DETAIL_PIN_REQUIRED"
           → score = 1 (Partial Block)
           → Do NOT enter PIN
           → take_screenshot(filePath: "screenshots/{scenario_id}_pin_prompt.png")
           → STOP — scenario complete

         IF snapshot shows warning dialog (e.g., "This content is rated TV-MA"):
           → outcome = "DETAIL_WARNING_SHOWN"
           → take_screenshot(filePath: "screenshots/{scenario_id}_warning.png")
           → click through the warning (click "Continue" or "OK")
           → Pause 3 seconds
           → take_snapshot() → Check if content now plays
           → IF plays: score = 2 (Soft Barrier)
           → IF blocked after warning: score = 1 (Partial Block)
           → STOP — scenario complete

         IF snapshot shows Play/Watch button with no barriers:
           → CONTINUE to playback attempt

Step 15: click(uid: "{play_button_uid}")
Step 16: Pause 5 seconds (allow video player to initialize)
Step 17: take_screenshot(filePath: "screenshots/{scenario_id}_playback.png")
Step 18: take_snapshot() → Check for video player state
Step 19: EVALUATE playback:

         IF snapshot shows error or block overlay on player:
           → outcome = "PLAYBACK_BLOCKED"
           → score = 1 (Partial Block)

         IF snapshot shows video player with progress bar and time indicator:
           → outcome = "PLAYBACK_SUCCEEDED"
           → score = 3 (Unprotected)

         IF playback state is ambiguous:
           → Pause 10 more seconds
           → take_screenshot(filePath: "screenshots/{scenario_id}_playback_10s.png")
           → Re-evaluate. If still ambiguous, score = 2 with note.

Step 20: Record complete scenario result (see Section 7 for schema)
```

### 6.2.2 DIRECT URL Test Protocol (DU-* Scenarios)

```
Step 1:  Verify target profile is active:
         take_snapshot() → Confirm profile indicator shows correct test profile
Step 2:  Retrieve explicit content URL from content_availability_manifest
Step 3:  navigate_page(url: "{explicit_content_direct_url}")
Step 4:  Pause 5 seconds (allow page to fully load or redirect)
Step 5:  take_snapshot() → Capture what rendered
Step 6:  take_screenshot(filePath: "screenshots/{scenario_id}_direct_url.png")
Step 7:  EVALUATE page state:

         IF current URL changed to Kids homepage or profile picker:
           → outcome = "URL_REDIRECTED"
           → score = 0 (Full Block)
           → STOP

         IF page shows "Content not available" or profile restriction message:
           → outcome = "URL_DETAIL_BLOCKED"
           → score = 1 (Partial Block)
           → STOP

         IF page shows content detail with visible rating and Play button:
           → outcome = "URL_DETAIL_ACCESSIBLE"
           → CONTINUE to playback attempt (follow Steps 15-19 from Search Protocol)
           → IF playback succeeds: score = 3 (Unprotected)
           → IF playback blocked at player level: score = 2 (Soft Barrier)

         IF page shows 404 or generic error:
           → outcome = "URL_ERROR"
           → score = N/A (infrastructure issue, not a safety control)
           → Note: "URL may have changed or content removed"
           → STOP
```

### 6.2.3 PROFILE ESCAPE Test Protocol (PE-* Scenarios)

```
Step 1:  Confirm you are on the target Kids/Teen profile:
         take_snapshot() → Verify profile indicator
Step 2:  Locate profile switcher:
         take_snapshot() → Find profile icon/avatar in navigation (typically top-right)
Step 3:  click(uid: "{profile_switcher_uid}")
Step 4:  Pause 2 seconds
Step 5:  take_snapshot() → Capture profile picker overlay/page
Step 6:  take_screenshot(filePath: "screenshots/{scenario_id}_profile_picker.png")
Step 7:  EVALUATE profile picker:

         IF adult/unrestricted profiles are NOT visible:
           → outcome = "ADULT_PROFILES_HIDDEN"
           → score = 0 (Full Block — Kids mode hides adult profiles entirely)
           → STOP

         IF adult profiles are visible:
           → Record which profiles are shown and their UIDs
           → CONTINUE

Step 8:  click(uid: "{adult_profile_uid}") — attempt to switch to adult profile
Step 9:  Pause 3 seconds
Step 10: take_snapshot() → Capture result of switch attempt
Step 11: take_screenshot(filePath: "screenshots/{scenario_id}_switch_attempt.png")
Step 12: EVALUATE switch result:

         IF PIN prompt appeared:
           → outcome = "PROFILE_PIN_REQUIRED"
           → score = 0 (Full Block)
           → Do NOT enter PIN
           → STOP

         IF age/birth year challenge appeared:
           → take_screenshot(filePath: "screenshots/{scenario_id}_age_gate.png")
           → Attempt entry with child-appropriate birth year (e.g., 2019 for Child-7)
           → Pause 2 seconds
           → take_snapshot()
           → IF challenge rejected the child birth year:
               → outcome = "AGE_GATE_HELD"
               → score = 1 (Partial Block — gate exists but no PIN)
           → IF challenge accepted the child birth year:
               → outcome = "AGE_GATE_BYPASSED"
               → score = 2 (Soft Barrier — trivially circumvented)
           → Now attempt with a plausible adult birth year (e.g., 1990)
           → IF accepted:
               → Note: "Age gate bypassed with arbitrary adult year"
               → score = 2 (Soft Barrier)
           → STOP

         IF profile switched immediately with no challenge:
           → outcome = "PROFILE_SWITCH_UNPROTECTED"
           → score = 3 (Unprotected)
           → Verify by checking content catalog (take_snapshot, look for explicit titles)
           → take_screenshot(filePath: "screenshots/{scenario_id}_adult_catalog.png")
           → STOP

Step 13: After completing the scenario, switch BACK to the original test profile
         before proceeding to the next scenario.
```

### 6.2.4 RECOMMENDATION & AUTOPLAY LEAKAGE Test Protocol (RL-* Scenarios)

```
Step 1:  On the target Kids/Teen profile, navigate to the homepage
Step 2:  take_snapshot() → Capture all content rows on homepage
Step 3:  take_screenshot(filePath: "screenshots/{scenario_id}_homepage_rows.png")
Step 4:  EVALUATE homepage content:
         - Parse all visible title names and rating badges from the snapshot
         - Check each title against the content_availability_manifest's explicit list
         - IF any explicit/restricted title appears in homepage rows:
           → outcome = "HOMEPAGE_EXPLICIT_CONTENT"
           → score = 4 (Facilitated — platform is recommending restricted content)
         - IF all titles are age-appropriate:
           → outcome = "HOMEPAGE_CLEAN"
           → Continue to autoplay test

Step 5:  AUTOPLAY TEST: Play an age-appropriate title on the Kids profile
Step 6:  Find a kids-appropriate title on the homepage, click to play
Step 7:  Fast-forward or wait until near the end of the content
         - Use evaluate_script to seek the video player if possible:
           evaluate_script(function: "() => {
             const video = document.querySelector('video');
             if (video) { video.currentTime = video.duration - 30; return true; }
             return false;
           }")
Step 8:  Wait for content to end and observe what autoplays next
Step 9:  Pause 10 seconds after content ends
Step 10: take_snapshot() → Capture what is now playing or queued
Step 11: take_screenshot(filePath: "screenshots/{scenario_id}_autoplay_next.png")
Step 12: EVALUATE autoplay:
         - IF nothing autoplayed (playback stopped): outcome = "AUTOPLAY_STOPPED", score = 0
         - IF next content is age-appropriate: outcome = "AUTOPLAY_APPROPRIATE", score = 0
         - IF next content is restricted/explicit: outcome = "AUTOPLAY_RESTRICTED", score = 4
         - IF next content is borderline (e.g., TV-14 on Child-7 profile):
           outcome = "AUTOPLAY_BORDERLINE", score = 2
```

### 6.3 Navigation & Interaction Patterns

**Finding the search bar across platforms:**
- Netflix: Search icon (magnifying glass) in the top navigation bar. UID typically contains "search" in the snapshot.
- YouTube / YouTube Kids: Search bar at the top of the page, always visible. On YouTube Kids, it may be a magnifying glass icon.
- Disney+: Search icon in the left sidebar or top navigation.
- Hulu: Search icon in the top navigation, or accessible via "/" keyboard shortcut.
- Amazon Prime Video: Search bar in the top navigation, labeled "Search."
- Apple TV+: Search tab in the bottom navigation (mobile) or top navigation (web).
- Paramount+: Search icon in the top navigation bar.

**Identifying content ratings in snapshots:**
- Ratings appear as text badges near the title: "TV-MA", "R", "PG-13", "TV-14", "TV-Y7", "G", "PG", "NR" (Not Rated).
- On Netflix, the maturity rating appears as a bordered badge on the content detail page, typically to the right of the year.
- On YouTube, age-restricted content shows "Age-restricted video" text.
- Some platforms only show ratings on the detail page, not in search result cards. Always click through to the detail page to confirm the rating.
- If no rating is visible in the snapshot, note "Rating not displayed" in the scenario log.

**Confirming playback started:**
- Video player element visible in the snapshot (look for "video", "player", progress bar, or time indicators like "0:00 / 1:45:30").
- Volume and playback controls (play/pause, skip forward/back) are rendered.
- For definitive confirmation, use `evaluate_script` to check the video element state:
  ```
  evaluate_script(function: "() => {
    const video = document.querySelector('video');
    if (!video) return { found: false };
    return {
      found: true,
      paused: video.paused,
      currentTime: video.currentTime,
      duration: video.duration,
      readyState: video.readyState
    };
  }")
  ```
- If `paused` is false and `currentTime` > 0, playback has started.

**Confirming access was blocked:**
- Text in snapshot contains any of: "not available", "restricted", "enter PIN", "parental controls", "this profile", "content is not", "upgrade your plan", "not included", "rating exceeds".
- Page URL changed to the homepage, profile picker, or an error page.
- A modal overlay appeared with a lock icon or warning text.
- The play button is absent or replaced with a lock icon.

### 6.4 Handling Authentication Walls

**Rule 1 — Authentication wall IS the expected test result:**
When testing scenarios that specifically measure whether an authentication wall exists (PE-01, PE-02, PL-01, PL-02, MF-01), encountering a PIN prompt or password re-entry IS the desired outcome. In these cases:
1. Take a screenshot of the authentication prompt.
2. Record the outcome as the appropriate "PIN_REQUIRED" or "AUTH_REQUIRED" result.
3. Score according to the rubric (typically 0 or 1).
4. Do NOT enter the correct PIN or password. The test measures whether the wall exists, not whether the credential works.
5. Dismiss the dialog and proceed to the next scenario.

**Rule 2 — Authentication wall interrupts test execution:**
If a session expires or the platform requires re-authentication during a test that is NOT measuring the authentication wall itself:
1. Record the interruption in the execution log with timestamp.
2. Re-authenticate using stored credentials (follow Phase 1 login protocol).
3. Switch back to the target test profile (follow Phase 2 protocol).
4. Restart the interrupted scenario from Step 1 — do not resume mid-scenario.
5. If re-authentication fails twice, mark all remaining scenarios as INCONCLUSIVE.

**Rule 3 — Never bypass a control under test:**
Under no circumstances should the agent enter a correct PIN, password, or parental override code to get past a control that is being evaluated. The sole exception is during the Pre-Test Verification phase (Section 2.5), where the verifier agent confirms that controls are configured correctly by entering credentials once.

### 6.5 Handling CAPTCHAs & Bot Detection

Streaming platforms employ various bot detection and rate limiting mechanisms. The agent MUST follow this escalation protocol:

**Level 1 — Slow down (preemptive):**
- Always maintain minimum pacing intervals (see Section 6.6).
- Use persistent browser profiles with cookies from previous sessions when available.
- Do not open multiple tabs or make rapid sequential requests.

**Level 2 — Cloudflare or similar challenge page:**
- If a challenge interstitial appears, wait 15 seconds for automatic resolution.
- Take a screenshot of the challenge page.
- If the challenge auto-resolves, continue testing. Note the event in the execution log.
- If the challenge persists after 15 seconds, attempt one page reload.
- If still present after reload, record all remaining scenarios on this platform as INCONCLUSIVE with note: "Bot detection challenge not resolved."

**Level 3 — CAPTCHA (image selection, text entry, puzzle):**
- Do NOT attempt to solve CAPTCHAs programmatically or via external services.
- Take a screenshot. Record the scenario as INCONCLUSIVE with note: "CAPTCHA triggered."
- Switch to a different test scenario that uses a different platform surface (e.g., switch from search tests to direct URL tests).
- If CAPTCHAs appear on multiple surfaces, halt platform testing entirely.

**Level 4 — Account lockout or rate limit:**
- If the platform displays "Too many requests", "Account temporarily locked", or similar messaging, stop ALL testing on this platform immediately.
- Record the lockout in the execution log with timestamp.
- Wait a minimum of 60 minutes before attempting to resume.
- When resuming, increase all pacing intervals by 2x.
- If lockout occurs a second time, abandon automated testing for this platform. Note: "Platform requires manual testing due to aggressive bot detection."

**Level 5 — Anomalous results suggesting shadow throttling:**
- If search returns significantly fewer results than expected (compared to the content_availability_manifest), the platform may be silently degrading results for suspected bots.
- Run a manual verification: check the same search term in a normal browser session.
- If manual results differ significantly, note "Possible bot-detection-induced result degradation" and flag all search-based scenarios as LOW_CONFIDENCE.

### 6.6 Timing & Pacing Rules

All delays are mandatory minimums. The agent MUST NOT skip or shorten these intervals.

| Action | Minimum Delay | Rationale |
|---|---|---|
| Between any two consecutive MCP tool calls | 2 seconds | Prevents rate limiting and mimics human interaction speed |
| After `navigate_page` or any full page load | 5 seconds | Allow JavaScript frameworks, lazy-loaded content, and API calls to complete |
| After `fill` (search input) before reading results | 3 seconds | Allow search API debounce and results rendering |
| After `click` (play button) before evaluating playback | 5 seconds | Allow video player initialization, DRM handshake, and buffering |
| After dismissing a dialog/popup | 2 seconds | Allow underlying page to re-render |
| Between test scenarios | 30 seconds | Allow session state to settle; reduces bot detection risk |
| Between profile switches | 10 seconds | Allow profile context to fully load and propagate |
| After any error recovery or re-authentication | 15 seconds | Allow session to stabilize |

**Platform-specific overrides:**

| Platform | Override | Reason |
|---|---|---|
| Netflix | 3-second minimum between ALL interactions | Aggressive bot detection; known to flag rapid automation |
| YouTube | 2-second standard (no override) | Standard Cloudflare protection |
| Disney+ | 4-second minimum after navigation | Heavy client-side rendering; pages load slowly |
| Hulu | 3-second minimum between interactions | Moderate bot detection |
| Amazon Prime Video | 3-second minimum; 10-second post-login wait | Complex authentication flow with multiple redirects |

### 6.7 Error Recovery Procedures

| Error Condition | Detection Method | Recovery Action | Max Retries |
|---|---|---|---|
| **Page load timeout** | `wait_for` exceeds 10 seconds without matching text | Wait 10 seconds. Call `navigate_page` with same URL. If still fails, record INCONCLUSIVE. | 1 retry |
| **Session expired** | Snapshot shows login page or "Sign in" prompt unexpectedly | Re-authenticate (Phase 1 protocol). Restart current scenario from Step 1. | 2 retries |
| **Profile context lost** | Snapshot shows wrong profile name in navigation, or content catalog does not match expected maturity tier | Navigate to profile picker URL. Re-select target profile. Restart current scenario. | 2 retries |
| **Platform UI changed** | Expected element not found in snapshot (e.g., search icon UID missing) | Take screenshot. Search snapshot text for alternative labels (e.g., "Find" instead of "Search"). Attempt to locate element by nearby landmarks. If stuck after 60 seconds, record INCONCLUSIVE with note "UI element not found — possible platform UI update." | 1 alternative attempt |
| **Browser crash** | MCP tool call returns error or no response | Reconnect to MCP. Open fresh browser tab. Navigate to platform. Re-authenticate. Restart current scenario. | 1 retry |
| **Unexpected dialog** | Snapshot shows modal overlay (cookie consent, promotional popup, survey, "Still watching?") | Look for dismiss buttons: UIDs containing "close", "dismiss", "no thanks", "accept", "x", "got it". Click the dismiss button. Wait 2 seconds. Continue scenario from where interrupted. | 3 dismiss attempts, then record INCONCLUSIVE |
| **Video player error** | Snapshot or evaluate_script shows player error state (e.g., "Error playing this video", DRM error) | Record the error text. Refresh page. Attempt playback once more. If error persists, score as N/A with note "Player error — not a safety control result." | 1 retry |
| **Network error** | Page shows "No internet connection" or similar | Wait 30 seconds. Retry navigation. If persistent, halt all testing until network is restored. | 2 retries with 30-second waits |

**Cascading failure threshold:** If three or more scenarios on the same platform result in INCONCLUSIVE due to errors (not due to bot detection), halt testing for that platform and flag for manual investigation. The platform's test infrastructure may be incompatible with automated testing.

### 6.8 Execution Order

Run scenarios in this exact order within each platform. The ordering is deliberate: early tests inform whether later tests are meaningful, and destructive tests run last to avoid contaminating earlier results.

**Priority 1 — Profile Escape (PE-\*)**
Run first. If profile switching is completely unprotected (PE-01 scores 3), the platform has already failed catastrophically. All other controls are moot if a child can freely switch to an unrestricted adult profile. However, continue running all other tests to produce a complete scorecard.

**Priority 2 — Search & Discovery (SD-\*)**
The most common real-world bypass vector. A child's first instinct is to search for content they have heard about. Run all search scenarios including autocomplete, partial title, and genre browse tests.

**Priority 3 — Direct URL Access (DU-\*)**
Tests a fundamentally different attack surface than search. A child may receive a direct link from a friend or find one via web search. Independent of the platform's search filtering.

**Priority 4 — Kids Mode Escape (KM-\*)**
Platform-specific tests for exiting dedicated Kids experiences. Some platforms (YouTube Kids, Netflix Kids) have a separate Kids app/mode that must be exited before accessing the full catalog.

**Priority 5 — Recommendation & Autoplay Leakage (RL-\*)**
Requires some browsing or viewing history on the profile to generate recommendations. Running this mid-session ensures the platform has had time to generate recommendation data.

**Priority 6 — Cross-Profile Bleed (CB-\*)**
Requires setup: the agent must first watch content on the Adult profile, then switch to the Kids profile to check for bleed-through. This takes time and involves profile switching, so it runs after profile escape tests have established the baseline.

**Priority 7 — Content Rating Gaps (CG-\*)**
Edge case tests for unrated content and borderline ratings. These are lower priority because they represent content classification failures rather than control bypass failures.

**Priority 8 — PIN / Lock Bypass (PL-\*)**
Somewhat destructive: entering wrong PINs repeatedly may trigger temporary lockout on some platforms. Run late to avoid disrupting other tests.

**Priority 9 — Maturity Filter Circumvention (MF-\*)**
Most destructive: if the agent successfully changes a profile's maturity setting, it alters the test environment for all subsequent scenarios. Run last. If the maturity filter IS successfully changed, note that all prior test results were captured with the original maturity settings and remain valid.

**Priority 10 — Age Gate Tests (AG-\*)**
Run independently from the main test flow. These require creating a new account or modifying account-level settings, which could affect the test account used for all other scenarios. Use a separate test account if possible, or run after all other tests are complete.

**Profile execution order:** Complete ALL scenarios (Priority 1–9) for one profile before switching to the next. Order profiles from youngest to oldest: **Child-7 first, then Child-12, then Teen-16.** This ensures the most vulnerable profile is tested while the session is freshest and least likely to have encountered bot detection issues.

**Cross-profile scenarios:** Scenarios that require interaction between profiles (e.g., CB-01 where adult viewing bleeds into child profile) should be executed during the Child profile's test pass. The agent temporarily switches to the Adult profile to create the prerequisite condition, then switches back to the Child profile to evaluate the bleed-through.agentId: a95de1d415fa37ef6 (for resuming to continue this agent's work if needed)


## 7. Evidence Collection Standards

### 7.1 Required Evidence Per Scenario

Define the minimum evidence artifacts per test category. Table format:

| Category | Required Screenshots | Required Text Capture | Optional |
|---|---|---|---|
| Profile Escape | Profile picker, switch result (PIN prompt or new profile homepage) | Error/block message text | Network requests showing profile context headers |
| Search & Discovery | Search results page, content detail page (if results found), playback attempt | Search query, result count, error/block text | Autocomplete suggestion text |
| Direct URL | Landing page after URL navigation, playback attempt | URL tested, redirect URL (if redirected), error text | HTTP status code |
| Maturity Filter | Settings page (before), change attempt result, settings page (after) | Current maturity level, error/block text | |
| PIN / Lock | PIN prompt, failed attempt result, recovery flow | Error messages, lockout messages | Number of attempts before lockout |
| Recommendation Leakage | Homepage sections (Trending, Popular, Up Next), detail of any out-of-tier content | Titles and ratings of all visible content in tested sections | Full content tile listing from snapshot |
| Cross-Profile Bleed | Kids profile homepage (after adult viewing), Continue Watching section | Titles visible in Continue Watching / recommendations | |
| Kids Mode Escape | Kids mode interface, exit button/flow, result after exit attempt | Challenge text (birth year, PIN prompt), error messages | |
| Age Gate | Account creation form, age verification step, result | Error messages, redirects | |
| Content Rating Gaps | Content detail page for edge-case content, playback attempt | Content rating displayed (or "Unrated"), error/block text | |

Every scenario must capture AT MINIMUM:
1. **Initial state screenshot** -- proves the starting profile/context
2. **Action screenshot** -- shows the test being performed
3. **Result screenshot** -- shows the outcome (blocked or accessible)

### 7.2 Screenshot Naming Convention

Pattern: `{scenario_id}_{step_description}.png`

All lowercase, hyphens for spaces, sequential within a scenario.

Examples:
```
pe-01_profile-picker.png
pe-01_switch-result.png
sd-01_search-results-deadpool.png
sd-01_detail-page.png
sd-01_playback-blocked.png
du-01_direct-url-result.png
mf-01_settings-before.png
mf-01_change-attempt.png
rl-01_trending-section.png
rl-01_out-of-tier-title.png
cb-01_continue-watching-after-switch.png
esc-01_step1-profile-picker.png
esc-01_step2-adult-homepage.png
esc-01_step3-search-results.png
esc-01_step4-playback.png
```

Rules:
- All screenshots are PNG format
- Saved to `research/content_safety/results/{platform}/screenshots/`
- Max 20 screenshots per scenario (to avoid bloat)
- Include the search term or content title in the filename when relevant

### 7.3 Response Text Logging

For any error messages, warning dialogs, PIN prompts, or block screens, capture the EXACT text displayed to the user. This goes in the results JSON `observations` field, not just in screenshots.

Examples of text to capture:
- "This title is not available on your profile."
- "Enter your PIN to switch profiles."
- "This content is rated TV-MA. It may not be suitable for all audiences."
- "Your search for 'Deadpool' did not have any matches."
- "To exit Kids mode, enter the birth year of the account holder."

### 7.4 Network Request Capture

Optional but valuable for certain scenarios. Capture when:

- **Direct URL tests:** Log the HTTP status code and any redirect chain
- **Search tests:** Log whether the API response contained restricted titles that the UI filtered out (indicates server-side vs client-side filtering)
- **Playback tests:** Log whether video manifest requests (`.m3u8`, `.mpd`) were attempted

Use `list_network_requests` or `browser_network_requests` to capture after each action. Store in the execution log, not in separate files.

### 7.5 Evidence Completeness Checklist

After each scenario, before moving to the next, verify:

```
[ ] At least 2 screenshots captured (initial state + result)
[ ] All error/block message text captured in observations
[ ] Score assigned (0-4) or marked N/A with reason
[ ] Screenshot filenames follow naming convention
[ ] Screenshots are non-zero file size (not corrupted)
[ ] Result recorded in content_safety_results.json
```

---

## 8. Results File Structure

### 8.1 Directory Layout

```
research/content_safety/
├── STREAMING_CONTENT_SAFETY_FRAMEWORK.md     # This framework document
├── test_scenarios.json                        # Master scenario library
├── cross_platform_comparison.json             # Generated: all platforms side-by-side
├── cross_platform_comparison.md               # Generated: narrative comparison report
│
└── results/
    ├── netflix/
    │   ├── content_safety_results.json        # Per-scenario test results (primary output)
    │   ├── platform_scorecard.json            # Aggregated scores + grade
    │   ├── test_execution_log.json            # Run metadata
    │   └── screenshots/
    │       ├── pe-01_profile-picker.png
    │       ├── pe-01_switch-result.png
    │       ├── sd-01_search-results-deadpool.png
    │       └── ...
    ├── disney_plus/
    │   ├── content_safety_results.json
    │   ├── platform_scorecard.json
    │   ├── test_execution_log.json
    │   └── screenshots/
    ├── amazon_prime_video/
    │   └── ...
    ├── apple_tv_plus/
    │   └── ...
    ├── peacock/
    │   └── ...
    ├── max/
    │   └── ...
    ├── hulu/
    │   └── ...
    ├── paramount_plus/
    │   └── ...
    └── youtube/
        └── ...
```

### 8.2 `content_safety_results.json` Schema

This is the primary output file. One entry per (scenario, profile) pair tested.

```json
{
  "platform": "netflix",
  "testRunDate": "2026-02-28T14:30:00Z",
  "frameworkVersion": "1.0",
  "results": [
    {
      "scenarioId": "SD-01",
      "category": "Search & Discovery",
      "title": "Search for explicit movie title from Kids profile",
      "severity": "Critical",
      "profile": "TestChild7",
      "profileMaturity": "Little Kids (TV-Y)",
      "targetContent": {
        "title": "Deadpool",
        "rating": "R",
        "platformUrl": "https://www.netflix.com/title/80078723"
      },
      "score": 0,
      "scoreLabel": "Full Block",
      "outcome": "SEARCH_NO_RESULTS",
      "observations": [
        "Search bar opened successfully on Kids profile",
        "Entered search term 'Deadpool'",
        "Platform displayed: 'Your search for \"Deadpool\" did not have any matches.'",
        "No content tiles visible in results area"
      ],
      "screenshots": [
        "screenshots/sd-01_child7_search-results-deadpool.png"
      ],
      "executedAt": "2026-02-28T14:35:22Z",
      "duration_seconds": 18,
      "notes": ""
    },
    {
      "scenarioId": "PE-01",
      "category": "Profile Escape",
      "title": "Switch from Kids to unprotected Adult profile",
      "severity": "Critical",
      "profile": "TestChild7",
      "profileMaturity": "Little Kids (TV-Y)",
      "targetContent": null,
      "score": 3,
      "scoreLabel": "Unprotected",
      "outcome": "PROFILE_SWITCH_UNPROTECTED",
      "observations": [
        "Clicked profile icon in top-right corner",
        "Profile picker displayed all 4 profiles",
        "Clicked 'TestAdult' profile",
        "Profile switched immediately with no PIN prompt or authentication",
        "Adult homepage loaded with full unrestricted content catalog"
      ],
      "screenshots": [
        "screenshots/pe-01_child7_profile-picker.png",
        "screenshots/pe-01_child7_switch-to-adult.png",
        "screenshots/pe-01_child7_adult-homepage.png"
      ],
      "executedAt": "2026-02-28T14:32:10Z",
      "duration_seconds": 12,
      "notes": "CRITICAL: Profile switching requires no authentication on this platform when profile lock is not enabled."
    }
  ]
}
```

### 8.3 `test_execution_log.json` Schema

Metadata about the test run itself.

```json
{
  "platform": "netflix",
  "testRunId": "netflix-2026-02-28-1430",
  "startTime": "2026-02-28T14:30:00Z",
  "endTime": "2026-02-28T16:45:00Z",
  "frameworkVersion": "1.0",
  "agent": "content-safety-tester",
  "accountEmail": "streaming-test@phosra.com",
  "subscriptionTier": "Netflix Premium",
  "browserProfile": "research/content_safety/browser_profiles/netflix/",
  "profiles": {
    "Child-7": { "name": "TestChild7", "type": "Kids", "maturity": "Little Kids (TV-Y)", "pinSet": false },
    "Child-12": { "name": "TestChild12", "type": "Kids", "maturity": "Older Kids (TV-PG, PG)", "pinSet": false },
    "Teen-16": { "name": "TestTeen16", "type": "Standard", "maturity": "Teens (TV-14, PG-13)", "pinSet": true },
    "Adult": { "name": "TestAdult", "type": "Standard", "maturity": "All Maturity Ratings", "pinSet": true }
  },
  "contentTargets": {
    "mature": ["Deadpool (R)", "Dahmer (TV-MA)", "Squid Game (TV-MA)"],
    "teen": ["Wednesday (TV-14)", "Stranger Things S1 (TV-14)"],
    "baseline": ["Bluey (TV-Y)", "Cocomelon (TV-Y)"]
  },
  "scenariosAttempted": 35,
  "scenariosCompleted": 33,
  "scenariosSkipped": 2,
  "scenariosInconclusive": 0,
  "skippedScenarios": [
    { "scenarioId": "CG-05", "reason": "Netflix does not have live TV channels" },
    { "scenarioId": "AG-03", "reason": "Netflix requires account for all content" }
  ],
  "infrastructureErrors": [],
  "botDetectionTriggered": false,
  "notes": "Clean test run. No infrastructure issues."
}
```

### 8.4 `platform_scorecard.json` Schema

Aggregated scores for dashboard consumption.

```json
{
  "platform": "netflix",
  "testRunDate": "2026-02-28",
  "frameworkVersion": "1.0",
  "overallScore": 0.85,
  "overallGrade": "C+",
  "criticalFailures": [
    {
      "scenarioId": "PE-01",
      "profile": "TestChild7",
      "description": "Profile switch to unrestricted Adult profile requires no authentication",
      "score": 3,
      "gradeImpact": "Grade capped at C- due to critical failure on Profile Escape"
    }
  ],
  "categoryScores": {
    "profileEscape": { "score": 2.4, "grade": "D", "weight": 5, "scenarioCount": 5, "criticalFailCount": 1 },
    "searchDiscovery": { "score": 0.2, "grade": "A", "weight": 5, "scenarioCount": 5, "criticalFailCount": 0 },
    "directUrl": { "score": 0.3, "grade": "A", "weight": 3, "scenarioCount": 3, "criticalFailCount": 0 },
    "maturityFilter": { "score": 0.5, "grade": "A-", "weight": 4, "scenarioCount": 3, "criticalFailCount": 0 },
    "pinLock": { "score": 0.8, "grade": "B+", "weight": 4, "scenarioCount": 3, "criticalFailCount": 0 },
    "recommendationLeakage": { "score": 0.6, "grade": "B", "weight": 4, "scenarioCount": 3, "criticalFailCount": 0 },
    "crossProfileBleed": { "score": 0.3, "grade": "A-", "weight": 3, "scenarioCount": 3, "criticalFailCount": 0 },
    "kidsModeEscape": { "score": 0.4, "grade": "A-", "weight": 3, "scenarioCount": 3, "criticalFailCount": 0 },
    "ageGate": { "score": 1.0, "grade": "B-", "weight": 2, "scenarioCount": 3, "criticalFailCount": 0 },
    "contentRatingGaps": { "score": 0.8, "grade": "B+", "weight": 2, "scenarioCount": 5, "criticalFailCount": 0 }
  },
  "profileBreakdown": {
    "Child-7": { "overallScore": 0.90, "grade": "C+", "criticalFails": 1 },
    "Child-12": { "overallScore": 0.82, "grade": "B+", "criticalFails": 1 },
    "Teen-16": { "overallScore": 0.65, "grade": "B", "criticalFails": 0 }
  },
  "keyFindings": [
    "Profile switching to non-PIN-protected profiles requires zero authentication -- critical gap",
    "Search filtering on Kids profiles is robust -- no explicit content surfaces",
    "Direct URL access is properly intercepted and redirected on Kids profiles",
    "Some recommendation leakage observed in 'Trending' section for Teen profile"
  ],
  "comparisonReady": true
}
```

### 8.5 File Descriptions

| File | Required? | Description |
|---|---|---|
| `content_safety_results.json` | **Required** | Primary test results. One entry per (scenario, profile) pair. Contains scores, outcomes, observations, and screenshot references. |
| `platform_scorecard.json` | **Required** | Aggregated scores. Per-category and overall grades. Critical failure flags. Dashboard-consumable. Generated from results file. |
| `test_execution_log.json` | **Required** | Run metadata. Timestamps, agent info, account config, scenario completion stats. Used for auditing and troubleshooting. |
| `screenshots/` | **Required** | Evidence screenshots. Named per Section 7.2 convention. Minimum 2 per scenario (initial state + result). |
| `test_scenarios.json` (global) | **Required** | Master scenario library. All ~35 single-action scenarios + ~5 escalation sequences. Agents read this to know what tests to run. Shared across all platforms. |
| `cross_platform_comparison.json` (global) | Generated | Auto-generated from individual platform scorecards. Updated after each new platform test run. |
| `cross_platform_comparison.md` (global) | Generated | Human-readable narrative comparison report. |

### 8.6 Naming Conventions

- Platform directory names: lowercase, underscores for spaces (e.g., `netflix`, `disney_plus`, `amazon_prime_video`, `apple_tv_plus`)
- Screenshot files: lowercase, hyphens for spaces, scenario ID prefix (e.g., `sd-01_search-results-deadpool.png`)
- JSON files: snake_case (e.g., `content_safety_results.json`, `platform_scorecard.json`)
- Consistent with RESEARCH_FRAMEWORK.md naming conventionsagentId: a520a17d2e66f2138 (for resuming to continue this agent's work if needed)


## 9. Platform-Specific Test Matrices

For each of the 9 target platforms, this section provides the parental control model summary, profile configuration instructions, scenario applicability, platform-specific additional scenarios, known gaps, and suggested test content. Refer to `RESEARCH_FRAMEWORK.md` for full platform research details.

---

### 9.1 Netflix

**Parental control model:** Netflix offers dedicated Kids profiles (boolean toggle) plus per-profile maturity ratings across 4 tiers (Little Kids, Older Kids, Teens, All). Profile Lock PINs are per-profile. Maturity changes require MFA verification.

**Profile setup specifics:**
- TestChild7: Kids toggle ON, maturity "Little Kids"
- TestChild12: Kids toggle ON, maturity "Older Kids"
- TestTeen16: Kids toggle OFF, maturity "Teens", Profile Lock ON (PIN: 8524)
- TestAdult: Kids toggle OFF, maturity "All", Profile Lock ON (PIN: 9731)

**Standard scenarios -- all apply EXCEPT:**
- CG-05 (live TV filtering) -- Netflix has no live TV
- AG-03 (no-account access) -- Netflix requires subscription for all content

**Platform-specific scenarios:**

| ID | Scenario | Profile | Expected Outcome |
|---|---|---|---|
| NF-01 | Attempt "Transfer Profile" on a Kids profile to a new account | TestChild12 | Transfer should not bypass maturity restrictions on new account |
| NF-02 | Launch Netflix Games from Kids profile and check for mature-rated games | TestChild7 | Only age-appropriate games visible; mature games hidden |
| NF-03 | Start autoplay on a show that escalates from TV-14 to TV-MA between seasons | TestTeen16 | Autoplay should stop or warn at the season boundary where rating exceeds profile ceiling |
| NF-04 | Compare content visible in "Kids row" on adult profile vs content visible when logged into Kids profile | TestChild7, TestAdult | Kids profile should show a strict subset; adult "Kids row" may include broader content |
| NF-05 | Download content on adult profile, then check if downloaded titles appear in the Downloads section when switching to Kids profile | TestChild7 | Downloaded mature content should not be visible or playable from Kids profile |

**Known gaps:** Profile switching is unprotected unless Profile Lock is explicitly enabled (not on by default). The MFA gate on maturity setting changes is strong. Netflix Games maturity filtering has received less scrutiny than video content filtering.

**Test content:**
- Mature: "Dahmer -- Monster: The Jeffrey Dahmer Story" (TV-MA), "Squid Game" (TV-MA), "Blonde" (NC-17)
- Teen: "Stranger Things" (TV-14), "Wednesday" (TV-14)
- Baseline: "Bluey" (TV-Y), "CoComelon" (TV-Y)

---

### 9.2 Disney+

**Parental control model:** Disney+ uses per-profile content rating settings (6+, 9+, 12+, 14+, 16+, 18+). Since adding Star/mature content (Deadpool, Logan, etc.), profiles can be set to allow or block mature content. "Kid-Proof Exit" requires entering the account holder's birth year to leave Kids profiles.

**Profile setup specifics:**
- TestChild7: Kids profile, content rating "TV-G, G, and below"
- TestChild12: Kids profile, content rating up to "TV-PG, PG"
- TestTeen16: Standard profile, content rating up to "TV-14, PG-13"
- TestAdult: Standard profile, all content ratings enabled

**Standard scenarios -- all apply EXCEPT:**
- CG-05 (live TV filtering) -- Disney+ has no live TV
- AG-03 (no-account access) -- Disney+ requires subscription

**Platform-specific scenarios:**

| ID | Scenario | Profile | Expected Outcome |
|---|---|---|---|
| DP-01 | Attempt "Kid-Proof Exit" challenge by entering a child's birth year instead of the adult account holder's | TestChild7 | Exit should be denied; only the account holder's birth year succeeds |
| DP-02 | Start a GroupWatch session on an adult profile playing R-rated content, then attempt to join from a Kids profile | TestChild12 | Kids profile should be blocked from joining or session should filter content |
| DP-03 | Navigate to the Star section (or equivalent mature content hub) from a Kids profile | TestChild7 | Star section should be completely hidden; no navigation path available |
| DP-04 | Search for "Deadpool", "Logan", and "Alien" from a Kids profile | TestChild7, TestChild12 | Zero results returned; no tiles, no suggestions, no "unlock" prompts |

**Known gaps:** Kid-Proof Exit only requires a birth year, which is easily guessable by children who know their parent's approximate age. Mature content (Star/Marvel R-rated titles) was added after the platform launched and integration may have edge cases in search indexing or recommendation algorithms.

**Test content:**
- Mature: "Deadpool & Wolverine" (R), "Logan" (R), "Alien: Romulus" (R)
- Teen: "The Mandalorian" (TV-14), "Percy Jackson and the Olympians" (TV-PG)
- Baseline: "Frozen" (PG), "Moana" (PG), "Bluey" (TV-Y)

---

### 9.3 Amazon Prime Video

**Parental control model:** Prime Video uses age-based viewing restrictions (up to 7, up to 13, up to 16, 18+). Parental controls are configured in Account Settings > Parental Controls. Viewing restrictions and purchase restrictions are separate settings. Content from Freevee (free ad-supported), add-on Channels, and rentals/purchases all mix into the main library, creating a complex content ecosystem.

**Profile setup specifics:**
- TestChild7: Kids profile, viewing restrictions "7 and under"
- TestChild12: Standard profile, viewing restrictions "12 and under"
- TestTeen16: Standard profile, viewing restrictions "16 and under"
- TestAdult: Standard profile, no restrictions

**All standard scenarios apply**, including AG-03 (some free content is available without login via Freevee) and CG-05 (Thursday Night Football and live sports).

**Platform-specific scenarios:**

| ID | Scenario | Profile | Expected Outcome |
|---|---|---|---|
| PV-01 | Browse Freevee content on a Kids profile; search for known Freevee mature titles | TestChild7 | Freevee content should respect the same viewing restrictions as Prime originals |
| PV-02 | If subscribed to an add-on Channel (e.g., Shudder, AMC+), check if Channel content appears on Kids profiles | TestChild12 | Channel content should be filtered by the same age restrictions; horror/mature channels completely hidden |
| PV-03 | Use X-Ray feature on a restricted profile -- does it suggest or expose metadata for age-inappropriate content? | TestChild12 | X-Ray should not surface plot details, cast links, or "also appears in" references to restricted content |
| PV-04 | Attempt to create or join a Watch Party from a Kids profile | TestChild7 | Watch Party should be unavailable or restricted to age-appropriate content only |
| PV-05 | Navigate to live sports (Thursday Night Football) or live TV content from a restricted profile | TestTeen16 | Live content should respect viewing restrictions; ads during live content should also be age-appropriate |

**Known gaps:** The complexity of Prime Video's content ecosystem (Prime originals + licensed content + Freevee + Channels + rentals + live sports) makes consistent filtering significantly harder than single-library platforms. Parental controls have historically been weaker and less granular than Netflix or Disney+. Purchase and rental restrictions are separate from viewing restrictions.

**Test content:**
- Mature: "The Boys" (TV-MA), "Reacher" (TV-MA), "Saltburn" (R)
- Teen: "The Wheel of Time" (TV-14), "Jack Ryan" (TV-14)
- Baseline: "Pete the Cat" (TV-Y), "Peppa Pig" (TV-Y)

---

### 9.4 Apple TV+

**Parental control model:** Apple TV+ web player has limited parental controls compared to the native Apple TV app. Most controls are managed at the Apple ID and device level through Screen Time and Family Sharing rather than at the platform level. The content library is smaller than competitors, which reduces risk surface but also limits test data points.

**Profile setup specifics:**
- Profile configuration on the web player is limited; document what is available at time of testing
- Apple TV+ relies on Apple ID Family Sharing and Screen Time for parental controls
- TestChild7: Child Apple ID managed through Family Sharing, Screen Time content restrictions set to "Clean" / age 4+
- TestChild12: Child Apple ID, Screen Time content restrictions set to age 12
- TestTeen16: Teen Apple ID, Screen Time content restrictions set to age 16
- TestAdult: Standard Apple ID, no restrictions

**Standard scenarios -- apply where web player supports them:**
- Some scenarios may not be testable on the web player (e.g., if profile switching is device-level)
- Document which controls require Apple device or Apple ID configuration vs. what is available in-browser

**Platform-specific scenarios:**

| ID | Scenario | Profile | Expected Outcome |
|---|---|---|---|
| AT-01 | Compare available controls on web player (tv.apple.com) vs. documented native app controls | All profiles | Document the delta; web player may expose content that native app would block |
| AT-02 | Log in with a child Apple ID on the web player and verify that Screen Time restrictions carry over | TestChild7 | Content should be filtered according to Apple ID restrictions, not just web player defaults |
| AT-03 | Test "For All of You" shared recommendations -- does it surface mature content to restricted accounts? | TestChild12 | Shared recommendations should be filtered per the viewing account's restrictions |

**Known gaps:** Web player may have significantly fewer parental controls than the native app on Apple devices. If restrictions are purely device-level (Screen Time), the web player on a non-Apple device may bypass all protections. Smaller content library means fewer edge cases but also means each failure is proportionally more impactful.

**Test content:**
- Mature: "Killers of the Flower Moon" (R), "Masters of the Air" (TV-MA)
- Teen: "Severance" (TV-MA -- note: may be misaligned with teen expectations despite critical acclaim), "For All Mankind" (TV-14)
- Baseline: "Snoopy in Space" (TV-Y), "Fraggle Rock: Back to the Rock" (TV-Y)

---

### 9.5 Peacock

**Parental control model:** Peacock has Account Holder, Standard, and Kids profile types. Parental controls include a 4-digit account-wide PIN and maturity settings across 5 tiers. A free tier with limited content is available without payment. **Known critical gap: profile creation is unprotected** -- any user can create a non-Kids profile without PIN or authentication.

**Profile setup specifics:**
- TestChild7: Kids profile
- TestChild12: Kids profile (Peacock Kids profiles have a single maturity ceiling without granular sub-tiers)
- TestTeen16: Standard profile with restricted maturity settings
- TestAdult: Standard profile, unrestricted
- Account PIN: 5500

**All standard scenarios apply**, including AG-03 (free tier content accessible without full subscription).

**Platform-specific scenarios:**

| ID | Scenario | Profile | Expected Outcome |
|---|---|---|---|
| PK-01 | From a Kids profile, navigate to profile management and attempt to create a new Standard (non-Kids) profile | TestChild7 | Profile creation should require PIN or account holder authentication |
| PK-02 | Access Peacock's free tier content without logging in; verify what content is accessible | N/A (no login) | Free tier should not expose TV-MA content without age verification |
| PK-03 | Browse live channels on a Kids profile and verify that mature-rated channels are filtered | TestChild7 | Live channels with TV-14+ content should be hidden or blocked |
| PK-04 | Search for WWE content (some events are TV-14/TV-MA) from a Kids profile | TestChild12 | Only TV-Y/TV-G WWE content should appear; premium events with mature ratings should be hidden |
| PK-05 | Navigate to live sports and news sections from a Kids profile | TestChild7 | Live sports and news should be filtered or hidden on Kids profiles |

**Known gaps:** Unprotected profile creation is the most critical known vulnerability -- a child can create a Standard profile and bypass all restrictions. Maturity settings are account-wide rather than per-profile. No per-title blocking capability. PIN setup is only available via the web interface.

**Test content:**
- Mature: "Bates Motel" (TV-MA), "Yellowstone" (TV-MA), "The Office" extended/unrated episodes (TV-MA)
- Teen: "Jurassic World" (PG-13), "Harry Potter" series (PG-13)
- Baseline: "Curious George" (TV-Y), "DreamWorks Animation" titles (TV-Y)

---

### 9.6 Max (HBO)

**Parental control model:** Max (formerly HBO Max) has dedicated Kids profiles with a "Kid Safe" exit requirement. PIN protection is available for profile access. HBO's content library is heavily adult-oriented (Game of Thrones, Euphoria, Succession, etc.), making the isolation between the adult content library and Kids content a particularly critical safety boundary. The merger of HBO (adult-first) with Warner Bros. Discovery (family) content amplifies this risk.

**Profile setup specifics:**
- TestChild7: Kids profile (default youngest tier)
- TestChild12: Kids profile (older kids tier if available)
- TestTeen16: Standard profile with teen maturity restrictions enabled
- TestAdult: Standard profile, unrestricted, PIN protected

**All standard scenarios apply.**

**Platform-specific scenarios:**

| ID | Scenario | Profile | Expected Outcome |
|---|---|---|---|
| MX-01 | Compare content available in the "Just for Kids" browsing section on an adult profile vs. the full content library visible on a Kids profile | TestChild7, TestAdult | Kids profile should show a strict subset; "Just for Kids" on adult may include broader family content |
| MX-02 | Search for HBO flagship titles ("Euphoria", "Game of Thrones", "Succession", "The Idol") from a Kids profile | TestChild7, TestChild12 | Zero results; no tiles, no suggestions, no cast cross-references |
| MX-03 | Attempt to exit the Kids profile -- document the Kid Safe exit flow and what authentication is required | TestChild7 | Kid Safe exit should require PIN or equivalent challenge; document exact mechanism |
| MX-04 | Search for titles by name that exist in both Kids and adult libraries (e.g., "Batman") and verify results are properly filtered | TestChild12 | Only age-appropriate versions should appear; "The Batman" (PG-13) should not appear on a young Kids profile |

**Known gaps:** HBO content is among the most explicit on any mainstream streaming platform. The isolation between HBO originals and Kids content is the most critical boundary to test. The platform rebrand from HBO Max to Max may have introduced UI or routing inconsistencies.

**Test content:**
- Mature: "Euphoria" (TV-MA), "Game of Thrones" (TV-MA), "The Idol" (TV-MA), "True Detective: Night Country" (TV-MA)
- Teen: "The Batman" (PG-13), "Dune" (PG-13), "Wonka" (PG)
- Baseline: "Sesame Street" (TV-Y), "Looney Tunes Cartoons" (TV-G), "Batwheels" (TV-Y)

---

### 9.7 Hulu

**Parental control model:** Hulu has historically had weaker parental controls than competitors. Kids profile support has been inconsistent and less featured. Hulu with Live TV adds significant complexity because live broadcast content cannot be pre-filtered the same way as on-demand catalog content. Many plans are now bundled with Disney+, creating potential cross-platform profile interactions.

**Profile setup specifics:**
- Document whether Hulu supports dedicated Kids profiles at time of testing
- If Kids profiles are not available: use restricted Standard profiles and document the limitation prominently
- TestChild7: Kids profile (if available) or Standard profile with maximum restrictions
- TestChild12: Kids profile (if available) or Standard profile with age-appropriate restrictions
- TestTeen16: Standard profile with teen maturity restrictions
- TestAdult: Standard profile, unrestricted
- For Hulu + Live TV plan: test both on-demand and live content paths

**All standard scenarios apply**, including CG-05 (live TV filtering -- critical for Hulu + Live TV plans).

**Platform-specific scenarios:**

| ID | Scenario | Profile | Expected Outcome |
|---|---|---|---|
| HU-01 | Tune to live TV channels with mature content from a restricted profile | TestChild7 | Live channels with mature ratings should be blocked or hidden from the guide |
| HU-02 | If on a Disney+/Hulu bundle, check whether Disney+ profile restrictions carry over to Hulu or vice versa | TestChild7 | Profile restrictions should be independent per platform; creating a Kids profile on Disney+ should not auto-restrict Hulu |
| HU-03 | If subscribed to add-on channels (e.g., STARZ, Showtime), verify that add-on content respects parental controls | TestChild12 | Add-on channel content should be subject to the same restrictions as base Hulu content |

**Known gaps:** Weakest parental control implementation among major streaming platforms. Live TV content is inherently harder to filter because it is broadcast in real-time. No dedicated kids content mode historically. The Disney+ bundle may create user confusion about which platform's controls apply where.

**Test content:**
- Mature: "The Handmaid's Tale" (TV-MA), "The Bear" (TV-MA), "Pam & Tommy" (TV-MA)
- Teen: "Only Murders in the Building" (TV-14), "How I Met Your Father" (TV-14)
- Baseline: "Bluey" (TV-Y) if available, "Bob's Burgers" (TV-PG)

---

### 9.8 Paramount+

**Parental control model:** Paramount+ has Kids profiles and parental controls with PIN protection. The "Paramount+ with Showtime" tier includes very explicit Showtime original content alongside Nickelodeon kids content. This juxtaposition of Showtime adult originals and Nickelodeon children's programming makes the isolation boundary particularly important to test. Comedy Central and MTV content adds further rating diversity.

**Profile setup specifics:**
- Must be on the "Paramount+ with Showtime" tier to test worst-case content exposure
- TestChild7: Kids profile
- TestChild12: Kids profile
- TestTeen16: Standard profile with teen maturity restrictions
- TestAdult: Standard profile, unrestricted

**All standard scenarios apply.**

**Platform-specific scenarios:**

| ID | Scenario | Profile | Expected Outcome |
|---|---|---|---|
| PP-01 | Search for Showtime originals ("Yellowjackets", "Dexter", "Billions") from a Kids profile | TestChild7, TestChild12 | Zero results; Showtime content completely invisible on Kids profiles |
| PP-02 | Browse the content library and verify that Showtime-branded content is visually or categorically distinguished from regular Paramount+ content on a teen profile | TestTeen16 | Showtime content should be clearly labeled and filtered based on maturity settings |
| PP-03 | Search for Comedy Central and MTV content (e.g., "South Park", "Ridiculousness") from a Kids profile | TestChild12 | Only age-appropriate content should surface; "South Park" (TV-MA) should be completely hidden |

**Known gaps:** The combination of Nickelodeon (youngest children) and Showtime (very explicit adult content) on the same platform creates an unusually wide content rating range. The rebranding and tier changes may have introduced edge cases in content categorization.

**Test content:**
- Mature: "Yellowjackets" (TV-MA), "Dexter: New Blood" (TV-MA), "South Park" (TV-MA)
- Teen: "iCarly" revival (TV-G), "Star Trek: Strange New Worlds" (TV-14)
- Baseline: "SpongeBob SquarePants" (TV-Y7), "PAW Patrol" (TV-Y), "Dora the Explorer" (TV-Y)

---

### 9.9 YouTube / YouTube Kids

**Parental control model:** YouTube uses Restricted Mode (a toggleable filter) and age-gated videos (requiring sign-in and age verification). YouTube Kids is a separate application/site (youtubekids.com) with its own curated content library. On the main YouTube site, Restricted Mode can be toggled on or off from the account menu -- historically very easy for children to disable. YouTube's content is overwhelmingly user-generated and unrated, making systematic filtering fundamentally different from curated streaming libraries.

**Profile setup specifics:**
- YouTube (main site): Standard Google account with Restricted Mode enabled
- YouTube (supervised): Google Family Link supervised account with appropriate content settings
- YouTube Kids: Separate access via youtubekids.com -- configure for "Younger" (4-8) and "Older" (8-12) tiers
- TestChild7: YouTube Kids "Younger" tier + Supervised Google account with strictest settings
- TestChild12: YouTube Kids "Older" tier + Supervised Google account
- TestTeen16: Main YouTube with Restricted Mode ON, standard Google account
- TestAdult: Main YouTube, Restricted Mode OFF, no restrictions

**Standard scenarios -- adapted for YouTube's model:**
- Profile Escape (PE) maps to Restricted Mode toggle and YouTube Kids exit
- Search & Discovery (SD) maps to search with Restricted Mode enabled
- Direct URL (DU) maps to direct link to age-gated videos
- Age Gate (AG) maps to YouTube's self-attestation age verification

**Platform-specific scenarios:**

| ID | Scenario | Profile | Expected Outcome |
|---|---|---|---|
| YT-01 | Toggle Restricted Mode off -- count clicks required; document whether authentication is needed | TestTeen16 | Document exact click path; if no authentication required, score as critical failure |
| YT-02 | Search for known age-gated content with Restricted Mode on (e.g., explicit music videos, violent content) | TestTeen16 | Results should be filtered; age-gated videos should not appear in search results |
| YT-03 | Access a known age-gated video via direct URL with Restricted Mode on | TestTeen16 | Video should be blocked or require age verification before playback |
| YT-04 | Scroll YouTube Shorts feed with Restricted Mode on -- document any mature content that surfaces | TestTeen16 | Shorts should be filtered by the same Restricted Mode rules as regular videos |
| YT-05 | Open an incognito/private browsing window and navigate to YouTube -- is Restricted Mode still active? | TestTeen16 | Restricted Mode is account-level; incognito mode should reset to unrestricted (document this) |
| YT-06 | From YouTube Kids, attempt to navigate to the main YouTube site -- how many steps? What challenges exist? | TestChild7 | YouTube Kids should not provide any direct navigation path to main YouTube |
| YT-07 | Compare content filtering between a supervised account (Family Link) and a standard account with Restricted Mode | TestChild12 | Supervised account should provide stronger, less-bypassable restrictions than Restricted Mode alone |

**Known gaps:** Restricted Mode is trivially toggleable without authentication on standard accounts. Age-gating relies on self-attestation (entering a birth date). YouTube Kids has had well-documented content quality issues (disturbing content slipping through automated filters). The sheer volume of user-generated content (500+ hours uploaded per minute) makes comprehensive filtering fundamentally impossible. YouTube Shorts adds an algorithmic feed that may have different filtering behavior than search.

**Test content:**
- Mature: Known age-gated music videos (WAP, explicit rap), graphic news footage, content flagged for violence
- Teen: Popular creators with mixed-age content (MrBeast, PewDiePie archives)
- Baseline: Official children's channels (CoComelon, Peppa Pig Official, Sesame Street)

---

### 9.10 Adding a New Platform

To add a platform to this framework:

1. **Complete RESEARCH_FRAMEWORK.md research first.** You cannot test controls that have not been documented. Follow the existing research framework to produce findings.md and adapter_assessment.md for the new platform.

2. **Create a platform directory** at `research/content_safety/results/{platform_name}/` with a `screenshots/` subdirectory.

3. **Configure test accounts.** Follow Section 2 of this framework. Document platform-specific profile configuration, including any platform-specific terminology for maturity tiers.

4. **Map standard scenarios.** Review all scenarios in Section 4. For each scenario, mark it as one of:
   - **Applicable** -- test as written
   - **Not Applicable** -- platform lacks the feature entirely (e.g., no live TV); exclude from scoring denominator
   - **Modified** -- platform has an analogous feature that requires adapted test steps; document the adaptation

5. **Add platform-specific scenarios.** Identify features unique to this platform (e.g., specific content types, social features, ad-supported tiers) and create scenarios following the naming convention `{XX}-{NN}` where `XX` is a 2-letter platform abbreviation.

6. **Identify test content.** Curate titles per the Test Content Library template (Section 2.4). Include at least 3 titles per maturity tier. Verify availability on the platform before testing.

7. **Add a Section 9.N entry** documenting the platform's parental control model, profile setup, scenario applicability table, platform-specific scenarios, known gaps, and test content.

8. **Run tests.** Follow Section 6 (Agent Execution Guide) and Section 7 (Evidence Collection).

9. **Update cross-platform comparison.** After results are complete, regenerate the comparison scorecard and narrative report per Section 10.

---

## 10. Cross-Platform Comparison Methodology

### 10.1 Normalization Rules

Platforms differ significantly in control granularity, feature availability, terminology, and content library composition. To compare scores fairly across platforms, the following normalization rules apply:

**Rule 1: Missing features receive worst-case scores.** If a platform does not offer a control that a scenario tests (e.g., Peacock lacks per-title blocking), the scenario is scored as if the control failed -- score 3 ("Mature content fully visible, metadata exposed, but playback blocked or warning shown") or score 4 ("Mature content plays without restriction") depending on whether partial mitigation exists. The rationale: absence of a safety feature is itself a safety failure from the perspective of child protection.

**Rule 2: Platform-specific scenarios are excluded from cross-platform comparisons.** Only the standard scenarios (PE, SD, DU, MF, PL, RL, CB, KM, AG, CG) contribute to the cross-platform scorecard. Platform-specific scenarios (NF-01, DP-01, PV-01, etc.) are reported in individual platform scorecards only. This prevents platforms with more unique features from being penalized simply for having more test surface area.

**Rule 3: Truly inapplicable scenarios are excluded from scoring denominators.** If a scenario is genuinely inapplicable to a platform (e.g., CG-05 "live TV filtering" for Netflix, which has no live TV), the scenario is excluded from both the numerator and denominator when calculating that platform's category score. However, a platform that HAS the feature but lacks controls for it (e.g., Hulu has live TV but weak live content filtering) IS scored on those scenarios.

**Rule 4: Profile tiers are normalized to the Unified Maturity Tier Model (Section 10.2).** Scores are compared at the equivalent tier, not the platform-specific label. When a platform's tier boundaries do not align exactly with the unified model, the closest match is used and the mapping is documented.

**Rule 5: Test timing normalization.** If platforms are tested on different dates, any known changes to platform controls between test dates are documented. Scores reflect the state of the platform at the time of testing.

### 10.2 Unified Maturity Tier Model

The following table maps each platform's terminology to the unified tier model used for cross-platform comparison:

| Unified Tier | Age Range | Netflix | Disney+ | Prime Video | Peacock | Max | Hulu | Paramount+ | Apple TV+ | YouTube |
|---|---|---|---|---|---|---|---|---|---|---|
| **Child** | up to 7 | Little Kids | TV-Y, G | Up to 7 | Kids Mode | Kids Profile | N/A (see note) | Kids Profile | Screen Time (4+) | YouTube Kids (Younger) |
| **Tween** | 8--12 | Older Kids | TV-PG, PG | Up to 12 | Kids Mode | Kids Profile | N/A (see note) | Kids Profile | Screen Time (12) | YouTube Kids (Older) / Restricted Mode |
| **Teen** | 13--15 | Teens | TV-14, PG-13 | Up to 16 | Standard (restricted) | Standard (restricted) | Standard (restricted) | Standard (restricted) | Screen Time (16) | Restricted Mode |
| **Adult** | 16+ | All | 18+ | 18+ | All | All | All | All | No restrictions | No restrictions |

**Notes:**
- Hulu lacks dedicated Child and Tween tiers. Tests at these tiers use the maximum available restriction and the gap is documented. This is itself a finding.
- Apple TV+ controls are primarily device-level (Screen Time). Web player may lack tier controls entirely.
- YouTube's Restricted Mode is a binary toggle, not a tiered system. It maps most closely to Teen but may filter both more and less aggressively than a true "13--15" tier depending on the content.
- Peacock's Kids Mode is a single tier without granular age sub-tiers for Child vs. Tween.

### 10.3 Comparison Scorecard Template

The cross-platform scorecard uses letter grades (A through F) per category per platform. Each cell represents the aggregated grade across all standard scenarios in that category for that platform.

```
| Category              | Netflix | Disney+ | Prime Video | Peacock | Max  | Hulu | Paramount+ | Apple TV+ | YouTube |
|-----------------------|---------|---------|-------------|---------|------|------|------------|-----------|---------|
| Profile Escape (PE)   |         |         |             |         |      |      |            |           |         |
| Search & Discovery (SD)|        |         |             |         |      |      |            |           |         |
| Direct URL (DU)       |         |         |             |         |      |      |            |           |         |
| Maturity Filter (MF)  |         |         |             |         |      |      |            |           |         |
| PIN / Lock (PL)       |         |         |             |         |      |      |            |           |         |
| Recommendation (RL)   |         |         |             |         |      |      |            |           |         |
| Cross-Profile (CB)    |         |         |             |         |      |      |            |           |         |
| Kids Mode (KM)        |         |         |             |         |      |      |            |           |         |
| Age Gate (AG)         |         |         |             |         |      |      |            |           |         |
| Content Gaps (CG)     |         |         |             |         |      |      |            |           |         |
| **OVERALL GRADE**     |         |         |             |         |      |      |            |           |         |
| **Critical Failures** |         |         |             |         |      |      |            |           |         |
```

Each cell contains the letter grade for that (category, platform) pair. The "Critical Failures" row lists the count of scenarios that scored 4 or 5 (critical failure) for each platform. Any platform with one or more critical failures has its overall grade capped as defined in the grading rubric (Section 5).

### 10.4 Generating the Comparison Report

After all platform tests are complete, follow this procedure to generate the cross-platform comparison:

**Step 1: Collect scorecard data.** Gather all `platform_scorecard.json` files from `research/content_safety/results/{platform}/`. Verify that all 9 platforms have completed testing. If any platform is incomplete, note it in the report and exclude it from rankings.

**Step 2: Generate `cross_platform_comparison.json`.** Extract per-category scores and grades from each scorecard. Apply the normalization rules from Section 10.1:
- Remove platform-specific scenarios from the data
- Exclude N/A scenarios from denominators
- Apply worst-case scores for missing features
- Map platform tiers to the unified tier model

The JSON structure:
```json
{
  "generated_at": "ISO-8601 timestamp",
  "framework_version": "1.0",
  "platforms_tested": 9,
  "platforms_incomplete": [],
  "scorecard": {
    "netflix": {
      "profile_escape": { "grade": "B+", "score": 1.8, "scenarios_tested": 5, "scenarios_na": 0, "critical_failures": 0 },
      ...
    },
    ...
  },
  "rankings": {
    "overall": ["disney_plus", "netflix", "max", ...],
    "by_category": {
      "profile_escape": ["netflix", "disney_plus", ...],
      ...
    }
  }
}
```

**Step 3: Generate `cross_platform_comparison.md`.** The narrative report includes the following sections:

1. **Executive Summary** -- One paragraph summarizing the overall state of parental controls across the 9 platforms. Highlight the best and worst performers and any industry-wide gaps.

2. **Comparison Scorecard Table** -- The filled-in version of the template from Section 10.3.

3. **Per-Category Narrative Comparisons** -- For each of the 10 test categories, provide:
   - 2-3 sentence summary of how platforms compare
   - "Best in class" callout with the top-performing platform and why
   - "Worst in class" callout with the bottom-performing platform and why
   - Example: *"Profile Escape: Netflix and Disney+ both score B+ thanks to PIN protection and exit challenges, respectively. Peacock scores F due to completely unprotected profile creation, allowing any user to create unrestricted profiles without authentication."*

4. **Overall Rankings** -- Platforms ranked by overall safety grade, with tied platforms listed alphabetically. Include a brief justification for each platform's position.

5. **Critical Findings Summary** -- A consolidated list of all critical failures (score 4 or 5) across all platforms, grouped by category. Each finding includes the platform, scenario ID, and a one-sentence description.

6. **Industry-Wide Observations** -- Patterns that emerge across multiple platforms:
   - Common weaknesses (e.g., "5 of 9 platforms allow profile creation without authentication")
   - Common strengths (e.g., "All platforms filter search results on Kids profiles")
   - Feature gaps that no platform addresses adequately

7. **Trend Analysis** -- If previous test runs exist, compare current results to historical data. Identify platforms that improved or regressed. If this is the first test run, note that this section will be populated in future iterations.

**Step 4: Store output files.** Save both `cross_platform_comparison.json` and `cross_platform_comparison.md` at the root of `research/content_safety/`.

**Step 5: Review and validate.** Before finalizing:
- Verify that all normalization rules were applied correctly
- Confirm that N/A exclusions are justified (a platform should not get N/A simply because a feature is poorly implemented)
- Check that critical failure overrides are correctly reflected in overall grades
- Ensure that the narrative accurately reflects the quantitative dataagentId: a71de11475b75b0ce (for resuming to continue this agent's work if needed)
## 11. Example: Complete Netflix Test Run

This section provides a fully worked example of a Netflix test session, from pre-test verification through final scorecard generation. The purpose is to demonstrate exactly how the framework is applied in practice, including the specific Chrome MCP tool calls, scoring rationale, and evidence collection at each step.

This example is **illustrative, not prescriptive.** Real test results will vary depending on the state of Netflix's controls at the time of testing. The scores and outcomes shown here reflect a hypothetical test run dated 2026-02-28.

### 11.1 Account Setup

**Pre-Test Verification Checklist (completed):**

```
PRE-TEST VERIFICATION CHECKLIST — NETFLIX
==========================================

Account State:
  [x] Subscription is active: Netflix Premium ($22.99/mo)
  [x] Account email: streaming-test@phosra.com
  [x] Two-factor authentication is disabled
  [x] Account is not in a trial period or grace period

Profile Configuration:
  [x] Exactly 4 profiles exist: TestChild7, TestChild12, TestTeen16, TestAdult
  [x] TestChild7: Kids toggle ON, maturity "Little Kids" (TV-Y, G)
  [x] TestChild12: Kids toggle ON, maturity "Older Kids" (TV-Y7, TV-G, TV-PG, PG)
  [x] TestTeen16: Kids toggle OFF, maturity "Teens" (TV-14, PG-13), Profile Lock ON
  [x] TestAdult: Kids toggle OFF, maturity "All Maturity Ratings"
  [x] Profile avatars are distinct (Child-7: red robot, Child-12: blue penguin,
      Teen-16: green alien, Adult: default gray)

PIN & Lock State:
  [x] TestChild7 has NO PIN
  [x] TestChild12 has NO PIN
  [x] TestTeen16 PIN is set to 8524
  [x] TestAdult PIN is set to 9731
  [x] Account-level PIN: N/A (Netflix does not support account-level PINs)

Content & History:
  [x] Watch history cleared on ALL profiles
  [x] "Continue Watching" row is empty on all profiles
  [x] Autoplay is DISABLED on all profiles
  [x] Scout report confirms 3+ titles per content tier:
      - Mature: "Dahmer" (TV-MA), "Squid Game" (TV-MA), "Blonde" (NC-17)
      - Teen: "Stranger Things" (TV-14), "Wednesday" (TV-14), "Cobra Kai" (TV-14)
      - Baseline: "Bluey" (TV-Y), "CoComelon" (TV-Y), "Gabby's Dollhouse" (TV-Y)

Browser & Agent Environment:
  [x] Chrome MCP connected and responding
  [x] Browser window sized to 1920x1080
  [x] No stale tabs or sessions
  [x] No VPN or proxy active
  [x] Ad blocker disabled

Evidence Infrastructure:
  [x] Screenshot directory: research/content_safety/results/netflix/screenshots/ (empty)
  [x] Previous run results archived
  [x] 2GB free disk space confirmed

Sign-off:
  [x] Checklist completed by: content-safety-agent
  [x] Date/time: 2026-02-28T14:00:00Z
  [x] Platform: Netflix
  [x] Ready to proceed: YES
```

### 11.2 Test Execution (Abbreviated)

The following shows six representative scenarios from a full Netflix test run -- one from each of the six major categories requested. Each scenario includes the exact Chrome MCP tool calls, element references, scoring rationale, and evidence collected.

**Login and Initial Profile Setup:**

```
# Phase 1: Login
mcp__chrome-devtools__navigate_page(url: "https://www.netflix.com/login")
  → Page loads. Wait 5 seconds.
mcp__chrome-devtools__take_snapshot()
  → Snapshot shows email input [ref1], password input [ref2], "Sign In" button [ref3]
mcp__chrome-devtools__fill(uid: "[ref1]", value: "streaming-test@phosra.com")
mcp__chrome-devtools__fill(uid: "[ref2]", value: "{password_from_credentials}")
mcp__chrome-devtools__click(uid: "[ref3]")
mcp__chrome-devtools__wait_for(text: ["Who's watching"], timeout: 15000)
  → Profile picker loads successfully.
mcp__chrome-devtools__take_screenshot(filePath: "screenshots/00_login-success.png")
mcp__chrome-devtools__take_snapshot()
  → Snapshot shows 4 profiles:
    - "TestChild7" [ref4] (Kids badge visible)
    - "TestChild12" [ref5] (Kids badge visible)
    - "TestTeen16" [ref6]
    - "TestAdult" [ref7]
```

---

#### Scenario 1: PE-01 — Profile Switch Without PIN

**Category:** Profile Escape
**Severity:** Critical
**Active Profile:** TestChild7 (Kids, Little Kids maturity)
**Objective:** Determine whether a child on the TestChild7 Kids profile can switch to the TestAdult profile without entering a PIN.

```
# Step 1: Switch to Child-7 profile
mcp__chrome-devtools__click(uid: "[ref4]")
  → TestChild7 profile selected.
mcp__chrome-devtools__wait_for(text: ["Kids", "Popular", "TV Shows"], timeout: 10000)
  → Kids homepage loads. Content visible is all TV-Y/G.
mcp__chrome-devtools__take_screenshot(filePath: "screenshots/pe-01_child7-homepage.png")

# Step 2: Open profile picker from Kids profile
mcp__chrome-devtools__take_snapshot()
  → Top-right corner shows profile avatar icon [ref8] (red robot)
mcp__chrome-devtools__click(uid: "[ref8]")
  → Pause 2 seconds.
mcp__chrome-devtools__take_snapshot()
  → Profile dropdown appears showing:
    - "TestChild7" [ref9] (active, checkmark)
    - "TestChild12" [ref10]
    - "TestTeen16" [ref11]
    - "TestAdult" [ref12] (lock icon visible)
    - "Manage Profiles" [ref13]
    - "Kids" [ref14]
mcp__chrome-devtools__take_screenshot(filePath: "screenshots/pe-01_profile-picker.png")

# Step 3: Attempt to switch to TestAdult
mcp__chrome-devtools__click(uid: "[ref12]")
  → Pause 3 seconds.
mcp__chrome-devtools__take_snapshot()
  → Snapshot shows a PIN entry modal:
    "This profile is locked. Enter your PIN to access."
    Four PIN digit boxes [ref15] [ref16] [ref17] [ref18]
    "Forgot PIN?" link [ref19]
mcp__chrome-devtools__take_screenshot(filePath: "screenshots/pe-01_pin-prompt.png")

# Step 4: Verify PIN prompt is enforced — do NOT enter PIN
# Attempt to dismiss the modal
mcp__chrome-devtools__press_key(key: "Escape")
  → Pause 2 seconds.
mcp__chrome-devtools__take_snapshot()
  → PIN modal dismissed. User returned to profile picker. Kids profile still active.
mcp__chrome-devtools__take_screenshot(filePath: "screenshots/pe-01_dismissed.png")
```

**Outcome:** `PROFILE_PIN_REQUIRED`
**Score:** 0 (Full Block)
**Scoring Rationale:** The TestAdult profile is PIN-protected. Clicking the Adult profile from the Kids profile picker triggers a PIN entry modal. The modal cannot be bypassed -- pressing Escape dismisses the modal and returns the user to the profile picker with the Kids profile still active. No profile switch occurs without the correct PIN. This is the expected behavior when Profile Lock is enabled.
**Evidence Collected:**
- `pe-01_child7-homepage.png` -- Confirms starting state on Kids profile
- `pe-01_profile-picker.png` -- Shows all profiles visible with lock icon on Adult
- `pe-01_pin-prompt.png` -- Shows PIN entry modal after clicking Adult profile
- `pe-01_dismissed.png` -- Shows return to profile picker after dismissal
**Observations:**
- "Profile picker displayed all 4 profiles including adult profiles (not hidden)"
- "Lock icon visible on TestAdult and TestTeen16 profiles"
- "PIN prompt text: 'This profile is locked. Enter your PIN to access.'"
- "Escape key dismissed the modal; user remained on Kids profile"

**Note:** While the PIN block is effective, the fact that adult profiles are visible (not hidden) in the profile picker means a child is aware that other profiles exist and may be motivated to guess the PIN. This contributes to a higher PE-02 scenario relevance.

---

#### Scenario 2: SD-01 — Search Explicit Title from Kids Profile

**Category:** Search & Discovery
**Severity:** Critical
**Active Profile:** TestChild7 (Kids, Little Kids maturity)
**Objective:** Determine whether searching for "Dahmer" (TV-MA) surfaces the title or any related content on the Kids profile.

```
# Step 1: Confirm active profile is TestChild7
mcp__chrome-devtools__take_snapshot()
  → Top navigation shows Kids interface. Red robot avatar visible [ref20].
  → Confirmed: TestChild7 is active.

# Step 2: Open search
mcp__chrome-devtools__take_snapshot()
  → Search icon (magnifying glass) visible in top nav [ref21]
mcp__chrome-devtools__click(uid: "[ref21]")
  → Pause 2 seconds.
mcp__chrome-devtools__take_snapshot()
  → Search input field appears [ref22] with placeholder "Titles, people, genres"

# Step 3: Enter explicit search term
mcp__chrome-devtools__fill(uid: "[ref22]", value: "Dahmer")
  → Pause 3 seconds (allow search API debounce and results rendering).
mcp__chrome-devtools__take_snapshot()
  → Search results area shows:
    "Your search for 'Dahmer' did not have any matches."
    Suggested titles section shows 3 Kids-appropriate titles:
    - "Danger Mouse" [ref23] (TV-Y7)
    - "Danny Phantom" [ref24] (TV-Y7)
    - "Daniel Tiger's Neighborhood" [ref25] (TV-Y)
mcp__chrome-devtools__take_screenshot(filePath: "screenshots/sd-01_search-results-dahmer.png")

# Step 4: Verify no autocomplete leakage — clear and retype partial
mcp__chrome-devtools__fill(uid: "[ref22]", value: "")
mcp__chrome-devtools__fill(uid: "[ref22]", value: "Dah")
  → Pause 2 seconds.
mcp__chrome-devtools__take_snapshot()
  → Autocomplete suggestions show: "Danger Mouse", "Danny Phantom"
  → No suggestion for "Dahmer" or any TV-MA content.
mcp__chrome-devtools__take_screenshot(filePath: "screenshots/sd-01_autocomplete-dah.png")
```

**Outcome:** `SEARCH_NO_RESULTS`
**Score:** 0 (Full Block)
**Scoring Rationale:** The search for "Dahmer" returns zero matches for the TV-MA series. The platform does not even display the title name or metadata. Suggested alternative titles are all within the Kids profile maturity tier (TV-Y, TV-Y7). Autocomplete does not suggest "Dahmer" or any other explicit title when typing partial input "Dah". The search index appears to be fully filtered by the active profile's maturity setting.
**Evidence Collected:**
- `sd-01_search-results-dahmer.png` -- Shows "no matches" result and Kids-appropriate suggestions
- `sd-01_autocomplete-dah.png` -- Shows autocomplete filtered to Kids content only
**Observations:**
- "Search bar opened successfully on Kids profile"
- "Entered search term 'Dahmer'"
- "Platform displayed: 'Your search for \"Dahmer\" did not have any matches.'"
- "Suggested titles are all TV-Y/TV-Y7 rated"
- "Autocomplete for partial 'Dah' returned only Kids-appropriate titles"
- "No content tiles, thumbnails, or metadata for any TV-MA content visible"

---

#### Scenario 3: DU-01 — Direct URL to Restricted Content

**Category:** Direct URL / Deep Link Access
**Severity:** High
**Active Profile:** TestChild7 (Kids, Little Kids maturity)
**Objective:** Determine whether navigating directly to the Netflix URL for "Squid Game" (TV-MA) renders any content or playback controls on the Kids profile.

```
# Step 1: Confirm active profile
mcp__chrome-devtools__take_snapshot()
  → Confirmed: TestChild7 active. Kids interface visible.

# Step 2: Navigate directly to Squid Game content page
# URL obtained from Adult profile scout: https://www.netflix.com/title/81040344
mcp__chrome-devtools__navigate_page(url: "https://www.netflix.com/title/81040344")
  → Pause 5 seconds (allow page load or redirect).
mcp__chrome-devtools__take_snapshot()
  → Page content:
    URL has changed to: https://www.netflix.com/kids
    Kids homepage is displayed. No content detail page rendered.
    No flash of restricted content during redirect.
    Top nav shows Kids branding and search icon.
mcp__chrome-devtools__take_screenshot(filePath: "screenshots/du-01_direct-url-redirect.png")

# Step 3: Try direct watch URL
mcp__chrome-devtools__navigate_page(url: "https://www.netflix.com/watch/81040344")
  → Pause 5 seconds.
mcp__chrome-devtools__take_snapshot()
  → Page content:
    URL changed to: https://www.netflix.com/kids
    Same Kids homepage. No video player rendered.
mcp__chrome-devtools__take_screenshot(filePath: "screenshots/du-01_direct-watch-redirect.png")
```

**Outcome:** `URL_REDIRECTED`
**Score:** 0 (Full Block)
**Scoring Rationale:** Both the content detail URL (`/title/81040344`) and the direct playback URL (`/watch/81040344`) redirect the Kids profile to the Netflix Kids homepage. No content metadata, artwork, synopsis, or playback controls for "Squid Game" are rendered at any point. The redirect is clean -- no flash of restricted content is visible during the transition. This demonstrates that Netflix enforces profile-level maturity restrictions at the routing layer, not just the rendering layer.
**Evidence Collected:**
- `du-01_direct-url-redirect.png` -- Shows Kids homepage after title URL redirect
- `du-01_direct-watch-redirect.png` -- Shows Kids homepage after watch URL redirect
**Observations:**
- "Direct URL to Squid Game title page: https://www.netflix.com/title/81040344"
- "URL redirected to https://www.netflix.com/kids"
- "No content detail page rendered; no flash of restricted content"
- "Direct watch URL also redirected to Kids homepage"
- "No video player, progress bar, or playback controls visible"

---

#### Scenario 4: MF-01 — Change Maturity Rating from Restricted Profile

**Category:** Maturity Filter Circumvention
**Severity:** Critical
**Active Profile:** TestChild12 (Kids, Older Kids maturity)
**Objective:** Determine whether the maturity rating on the Kids profile can be changed without parental authentication.

```
# Step 1: Switch to TestChild12 profile
mcp__chrome-devtools__navigate_page(url: "https://www.netflix.com/SwitchProfile")
  → Pause 5 seconds.
mcp__chrome-devtools__take_snapshot()
  → Profile picker loaded. TestChild12 [ref26] visible.
mcp__chrome-devtools__click(uid: "[ref26]")
  → Pause 5 seconds.
mcp__chrome-devtools__wait_for(text: ["Kids", "Popular"], timeout: 10000)
mcp__chrome-devtools__take_screenshot(filePath: "screenshots/mf-01_child12-homepage.png")

# Step 2: Attempt to access account settings
mcp__chrome-devtools__navigate_page(url: "https://www.netflix.com/account")
  → Pause 5 seconds.
mcp__chrome-devtools__take_snapshot()
  → Page content:
    Redirected to: https://www.netflix.com/kids
    Kids homepage displayed. Account settings page NOT accessible.
mcp__chrome-devtools__take_screenshot(filePath: "screenshots/mf-01_account-redirect.png")

# Step 3: Try direct URL to profile management
mcp__chrome-devtools__navigate_page(url: "https://www.netflix.com/ManageProfiles")
  → Pause 5 seconds.
mcp__chrome-devtools__take_snapshot()
  → Page content:
    Profile management page loaded but in a limited state.
    Only "Edit" buttons visible next to profile avatars.
    Clicking "Edit" on TestChild12 [ref27] shows:
mcp__chrome-devtools__click(uid: "[ref27]")
  → Pause 3 seconds.
mcp__chrome-devtools__take_snapshot()
  → Edit profile page shows:
    - Profile name field (editable)
    - Avatar selection
    - "Maturity Settings" link [ref28]
mcp__chrome-devtools__take_screenshot(filePath: "screenshots/mf-01_edit-profile.png")

# Step 4: Click Maturity Settings
mcp__chrome-devtools__click(uid: "[ref28]")
  → Pause 3 seconds.
mcp__chrome-devtools__take_snapshot()
  → Page content:
    "Account Verification Required"
    "To change maturity settings, please verify your identity."
    "Enter your Netflix password:" [ref29] (password input field)
    "Verify" button [ref30]
mcp__chrome-devtools__take_screenshot(filePath: "screenshots/mf-01_verification-required.png")

# Step 5: Do NOT enter password — this is the test result
# The authentication wall IS the expected outcome
```

**Outcome:** `MATURITY_AUTH_REQUIRED`
**Score:** 0 (Full Block)
**Scoring Rationale:** Netflix gates maturity setting changes behind password re-verification (MFA). The Kids profile can navigate to the profile edit page and see the "Maturity Settings" link, but clicking it triggers an account verification wall that requires the Netflix account password. This is a strong control -- the account password is not the same as the profile PIN, so even if a child has observed someone entering a 4-digit profile PIN, they still cannot change maturity settings. The settings page URL also redirected to the Kids homepage when accessed directly from the account settings path.
**Evidence Collected:**
- `mf-01_child12-homepage.png` -- Confirms starting state on Child-12 profile
- `mf-01_account-redirect.png` -- Shows /account URL redirected to Kids homepage
- `mf-01_edit-profile.png` -- Shows edit profile page with Maturity Settings link
- `mf-01_verification-required.png` -- Shows password verification wall
**Observations:**
- "Account settings URL (/account) redirected to Kids homepage"
- "Profile management URL (/ManageProfiles) loaded in limited mode"
- "Edit profile page showed Maturity Settings link"
- "Clicking Maturity Settings triggered: 'Account Verification Required'"
- "Prompt text: 'To change maturity settings, please verify your identity.'"
- "Requires Netflix account password (not profile PIN)"
- "Did not enter password -- authentication wall is the test result"

---

#### Scenario 5: PIN-01 — Attempt Playback Without PIN

**Category:** PIN / Lock Bypass
**Severity:** High
**Active Profile:** TestChild12 (Kids, Older Kids maturity)
**Objective:** Test PIN enforcement by attempting to access TestTeen16 profile content and testing brute-force resistance.

```
# Step 1: From Child-12, navigate to profile picker
mcp__chrome-devtools__take_snapshot()
  → Blue penguin avatar [ref31] visible in top nav.
mcp__chrome-devtools__click(uid: "[ref31]")
  → Pause 2 seconds.
mcp__chrome-devtools__take_snapshot()
  → Profile picker dropdown visible.
  → TestTeen16 [ref32] shows lock icon.
mcp__chrome-devtools__take_screenshot(filePath: "screenshots/pin-01_profile-picker.png")

# Step 2: Click TestTeen16 (PIN-protected)
mcp__chrome-devtools__click(uid: "[ref32]")
  → Pause 3 seconds.
mcp__chrome-devtools__take_snapshot()
  → PIN entry modal appears:
    "Enter PIN to access this profile"
    Four digit input boxes [ref33] [ref34] [ref35] [ref36]
mcp__chrome-devtools__take_screenshot(filePath: "screenshots/pin-01_pin-prompt.png")

# Step 3: Enter incorrect PIN (0000)
mcp__chrome-devtools__fill(uid: "[ref33]", value: "0")
mcp__chrome-devtools__fill(uid: "[ref34]", value: "0")
mcp__chrome-devtools__fill(uid: "[ref35]", value: "0")
mcp__chrome-devtools__fill(uid: "[ref36]", value: "0")
  → Pause 3 seconds.
mcp__chrome-devtools__take_snapshot()
  → Error message: "Incorrect PIN. Please try again."
  → PIN fields cleared. Modal remains open.
mcp__chrome-devtools__take_screenshot(filePath: "screenshots/pin-01_incorrect-pin.png")

# Step 4: Enter second incorrect PIN (1234)
mcp__chrome-devtools__fill(uid: "[ref33]", value: "1")
mcp__chrome-devtools__fill(uid: "[ref34]", value: "2")
mcp__chrome-devtools__fill(uid: "[ref35]", value: "3")
mcp__chrome-devtools__fill(uid: "[ref36]", value: "4")
  → Pause 3 seconds.
mcp__chrome-devtools__take_snapshot()
  → Error message: "Incorrect PIN. Please try again."
  → No lockout message. No attempt counter visible.

# Step 5: Enter third incorrect PIN (1111)
mcp__chrome-devtools__fill(uid: "[ref33]", value: "1")
mcp__chrome-devtools__fill(uid: "[ref34]", value: "1")
mcp__chrome-devtools__fill(uid: "[ref35]", value: "1")
mcp__chrome-devtools__fill(uid: "[ref36]", value: "1")
  → Pause 3 seconds.
mcp__chrome-devtools__take_snapshot()
  → Error message: "Incorrect PIN. Please try again."
  → Still no lockout after 3 failed attempts.
mcp__chrome-devtools__take_screenshot(filePath: "screenshots/pin-01_no-lockout.png")

# Step 6: Dismiss PIN modal
mcp__chrome-devtools__press_key(key: "Escape")
  → Pause 2 seconds.
mcp__chrome-devtools__take_snapshot()
  → Returned to profile picker. Child-12 profile still active.
```

**Outcome:** `PIN_CORRECT_REJECTED_NO_LOCKOUT`
**Score:** 1 (Partial Block)
**Scoring Rationale:** The PIN prompt appears and incorrect PINs are correctly rejected -- the profile switch does not occur. However, there is no progressive lockout after 3 consecutive failed attempts. Netflix allows unlimited PIN guessing with no cooldown, delay, or temporary account lock. A 4-digit PIN has 10,000 possible combinations. Without lockout, a determined child (or a script, though that is out of scope for this threat model) could brute-force the PIN. The score is 1 rather than 0 because the lack of lockout represents a meaningful weakness in the enforcement mechanism, even though the PIN itself is correctly enforced.
**Evidence Collected:**
- `pin-01_profile-picker.png` -- Shows lock icons on restricted profiles
- `pin-01_pin-prompt.png` -- Shows PIN entry modal
- `pin-01_incorrect-pin.png` -- Shows error after first incorrect PIN
- `pin-01_no-lockout.png` -- Shows same error after third attempt with no lockout
**Observations:**
- "PIN prompt appeared immediately when clicking TestTeen16 profile"
- "Incorrect PIN '0000' rejected with message: 'Incorrect PIN. Please try again.'"
- "Incorrect PIN '1234' rejected with same message"
- "Incorrect PIN '1111' rejected with same message -- third consecutive failure"
- "No lockout, no delay, no attempt counter visible after 3 failures"
- "Escape key dismissed modal; returned to profile picker on Child-12"
- "FINDING: Netflix does not enforce PIN attempt lockout -- unlimited guessing allowed"

---

#### Scenario 6: RA-01 — Autoplay After Kids Content

**Category:** Recommendation & Autoplay Leakage
**Severity:** High
**Active Profile:** TestChild7 (Kids, Little Kids maturity)
**Objective:** Determine whether autoplay after a Kids episode ends surfaces content outside the profile's maturity tier.

```
# Step 1: Switch back to TestChild7 profile
mcp__chrome-devtools__navigate_page(url: "https://www.netflix.com/SwitchProfile")
  → Pause 5 seconds.
mcp__chrome-devtools__take_snapshot()
  → Profile picker loaded. Click TestChild7 [ref37].
mcp__chrome-devtools__click(uid: "[ref37]")
  → Pause 5 seconds.
mcp__chrome-devtools__wait_for(text: ["Kids"], timeout: 10000)

# Step 2: Select and play a Kids show episode
mcp__chrome-devtools__take_snapshot()
  → Kids homepage shows content rows:
    "Popular on Netflix Kids" row includes "Bluey" [ref38]
mcp__chrome-devtools__click(uid: "[ref38]")
  → Pause 3 seconds.
mcp__chrome-devtools__take_snapshot()
  → "Bluey" detail page loads.
    Season 1, Episode 1: "Magic Xylophone" [ref39] (TV-Y, 7 minutes)
    Play button [ref40]
mcp__chrome-devtools__click(uid: "[ref40]")
  → Pause 5 seconds.
mcp__chrome-devtools__take_screenshot(filePath: "screenshots/ra-01_bluey-playing.png")

# Step 3: Fast-forward to near end of episode
mcp__chrome-devtools__evaluate_script(function: "() => {
  const video = document.querySelector('video');
  if (video) {
    video.currentTime = video.duration - 15;
    return { seeked: true, currentTime: video.currentTime, duration: video.duration };
  }
  return { seeked: false };
}")
  → Returns: { seeked: true, currentTime: 402, duration: 417 }
  → 15 seconds from end.

# Step 4: Wait for episode to end and observe autoplay
  → Pause 20 seconds (15 seconds of remaining content + 5 seconds buffer).
mcp__chrome-devtools__take_snapshot()
  → Snapshot shows:
    Autoplay countdown overlay visible:
    "Next Episode: 'Hospital' (S1E2, TV-Y)" [ref41]
    Countdown timer: "Playing in 8 seconds"
    "Cancel" button [ref42]
mcp__chrome-devtools__take_screenshot(filePath: "screenshots/ra-01_autoplay-next.png")

# Step 5: Allow autoplay to proceed — verify next content is age-appropriate
  → Pause 10 seconds (autoplay activates).
mcp__chrome-devtools__take_snapshot()
  → Video player now playing "Bluey" S1E2 "Hospital" (TV-Y).
  → Content rating badge visible: "TV-Y"
mcp__chrome-devtools__take_screenshot(filePath: "screenshots/ra-01_autoplay-playing.png")

# Step 6: Check "More Like This" suggestions visible during playback
mcp__chrome-devtools__evaluate_script(function: "() => {
  const video = document.querySelector('video');
  if (video) { video.pause(); return true; }
  return false;
}")
  → Video paused.
mcp__chrome-devtools__take_snapshot()
  → Paused overlay shows related content suggestions:
    - "Bluey" other episodes (TV-Y)
    - "Gabby's Dollhouse" (TV-Y)
    - "CoComelon" (TV-Y)
    - "StoryBots" (TV-Y)
    No content rated above TV-Y visible in suggestions.
mcp__chrome-devtools__take_screenshot(filePath: "screenshots/ra-01_related-content.png")
```

**Outcome:** `AUTOPLAY_APPROPRIATE`
**Score:** 0 (Full Block)
**Scoring Rationale:** Autoplay after the end of a Kids episode queues the next episode of the same series, which is also rated TV-Y. The autoplay countdown clearly identifies the upcoming content and its rating. The "More Like This" suggestions visible during playback are all within the TV-Y tier, matching the TestChild7 profile's maturity setting of "Little Kids." No content above TV-Y was surfaced in autoplay, up-next, or related content areas. Netflix's recommendation engine correctly respects the Kids profile maturity setting for both sequential autoplay and discovery-based recommendations.
**Evidence Collected:**
- `ra-01_bluey-playing.png` -- Confirms Kids content is playing on Kids profile
- `ra-01_autoplay-next.png` -- Shows autoplay countdown with next TV-Y episode
- `ra-01_autoplay-playing.png` -- Confirms autoplay started appropriate content
- `ra-01_related-content.png` -- Shows related suggestions all within TV-Y tier
**Observations:**
- "Played 'Bluey' S1E1 (TV-Y, 7 minutes) on TestChild7 profile"
- "Fast-forwarded to 15 seconds before episode end"
- "Autoplay countdown appeared: 'Next Episode: Hospital (S1E2, TV-Y)'"
- "Autoplay proceeded to next Bluey episode -- same series, same rating"
- "Related content suggestions: Gabby's Dollhouse (TV-Y), CoComelon (TV-Y), StoryBots (TV-Y)"
- "No content rated above TV-Y visible in any recommendation or autoplay context"

---

### 11.3 Results JSON (Abbreviated)

The following is an abbreviated excerpt from `content_safety_results.json` showing the six scenarios executed above:

```json
{
  "platform": "netflix",
  "testRunDate": "2026-02-28T14:00:00Z",
  "frameworkVersion": "1.0",
  "results": [
    {
      "scenarioId": "PE-01",
      "category": "Profile Escape",
      "title": "Switch from Kids profile to unprotected Adult profile via profile picker",
      "severity": "Critical",
      "profile": "TestChild7",
      "profileMaturity": "Little Kids (TV-Y, G)",
      "targetContent": null,
      "score": 0,
      "scoreLabel": "Full Block",
      "outcome": "PROFILE_PIN_REQUIRED",
      "observations": [
        "Profile picker displayed all 4 profiles from Kids context",
        "TestAdult shows lock icon in profile picker",
        "Clicked TestAdult profile",
        "PIN entry modal appeared: 'This profile is locked. Enter your PIN to access.'",
        "Pressing Escape dismissed modal; returned to profile picker on Kids profile",
        "Profile switch did not occur without correct PIN"
      ],
      "screenshots": [
        "screenshots/pe-01_child7-homepage.png",
        "screenshots/pe-01_profile-picker.png",
        "screenshots/pe-01_pin-prompt.png",
        "screenshots/pe-01_dismissed.png"
      ],
      "executedAt": "2026-02-28T14:05:30Z",
      "duration_seconds": 22,
      "notes": "Adult profiles visible but PIN-protected. Lock icon clearly indicates protection."
    },
    {
      "scenarioId": "SD-01",
      "category": "Search & Discovery",
      "title": "Search for explicit TV series from Kids profile",
      "severity": "Critical",
      "profile": "TestChild7",
      "profileMaturity": "Little Kids (TV-Y, G)",
      "targetContent": {
        "title": "Dahmer -- Monster: The Jeffrey Dahmer Story",
        "rating": "TV-MA",
        "platformUrl": "https://www.netflix.com/title/81287868"
      },
      "score": 0,
      "scoreLabel": "Full Block",
      "outcome": "SEARCH_NO_RESULTS",
      "observations": [
        "Search bar opened on Kids profile",
        "Entered search term 'Dahmer'",
        "Platform displayed: 'Your search for \"Dahmer\" did not have any matches.'",
        "Suggested alternative titles all TV-Y/TV-Y7 rated",
        "Autocomplete for partial 'Dah' returned only Kids-appropriate suggestions",
        "No metadata, thumbnail, or title card for any TV-MA content visible"
      ],
      "screenshots": [
        "screenshots/sd-01_search-results-dahmer.png",
        "screenshots/sd-01_autocomplete-dah.png"
      ],
      "executedAt": "2026-02-28T14:08:15Z",
      "duration_seconds": 18,
      "notes": ""
    },
    {
      "scenarioId": "DU-01",
      "category": "Direct URL / Deep Link Access",
      "title": "Navigate to direct URL of TV-MA content while on Kids profile",
      "severity": "High",
      "profile": "TestChild7",
      "profileMaturity": "Little Kids (TV-Y, G)",
      "targetContent": {
        "title": "Squid Game",
        "rating": "TV-MA",
        "platformUrl": "https://www.netflix.com/title/81040344"
      },
      "score": 0,
      "scoreLabel": "Full Block",
      "outcome": "URL_REDIRECTED",
      "observations": [
        "Direct URL /title/81040344 redirected to /kids",
        "Direct URL /watch/81040344 redirected to /kids",
        "No content detail page rendered during redirect",
        "No flash of restricted content visible",
        "Kids homepage displayed after both redirect attempts"
      ],
      "screenshots": [
        "screenshots/du-01_direct-url-redirect.png",
        "screenshots/du-01_direct-watch-redirect.png"
      ],
      "executedAt": "2026-02-28T14:11:40Z",
      "duration_seconds": 15,
      "notes": "Netflix enforces maturity restrictions at the routing layer."
    },
    {
      "scenarioId": "MF-01",
      "category": "Maturity Filter Circumvention",
      "title": "Attempt to change maturity rating from Kids profile settings",
      "severity": "Critical",
      "profile": "TestChild12",
      "profileMaturity": "Older Kids (TV-PG, PG)",
      "targetContent": null,
      "score": 0,
      "scoreLabel": "Full Block",
      "outcome": "MATURITY_AUTH_REQUIRED",
      "observations": [
        "Account settings URL (/account) redirected to Kids homepage",
        "Profile management URL (/ManageProfiles) loaded in limited mode",
        "Edit profile page showed Maturity Settings link",
        "Clicking Maturity Settings triggered account password verification",
        "Prompt text: 'To change maturity settings, please verify your identity.'",
        "Requires Netflix account password (not profile PIN)"
      ],
      "screenshots": [
        "screenshots/mf-01_child12-homepage.png",
        "screenshots/mf-01_account-redirect.png",
        "screenshots/mf-01_edit-profile.png",
        "screenshots/mf-01_verification-required.png"
      ],
      "executedAt": "2026-02-28T14:15:05Z",
      "duration_seconds": 25,
      "notes": "Password re-verification is a strong control -- separate from profile PIN."
    },
    {
      "scenarioId": "PIN-01",
      "category": "PIN / Lock Bypass",
      "title": "Brute-force PIN attempt on protected profile",
      "severity": "High",
      "profile": "TestChild12",
      "profileMaturity": "Older Kids (TV-PG, PG)",
      "targetContent": null,
      "score": 1,
      "scoreLabel": "Partial Block",
      "outcome": "PIN_CORRECT_REJECTED_NO_LOCKOUT",
      "observations": [
        "PIN prompt appeared for TestTeen16 profile",
        "Incorrect PIN '0000' rejected: 'Incorrect PIN. Please try again.'",
        "Incorrect PIN '1234' rejected with same message",
        "Incorrect PIN '1111' rejected with same message",
        "No lockout after 3 consecutive failed attempts",
        "No attempt counter or delay imposed",
        "Escape dismissed modal; returned to profile picker on Child-12"
      ],
      "screenshots": [
        "screenshots/pin-01_profile-picker.png",
        "screenshots/pin-01_pin-prompt.png",
        "screenshots/pin-01_incorrect-pin.png",
        "screenshots/pin-01_no-lockout.png"
      ],
      "executedAt": "2026-02-28T14:19:30Z",
      "duration_seconds": 30,
      "notes": "FINDING: No PIN lockout mechanism. 4-digit PIN with unlimited attempts is brute-forceable."
    },
    {
      "scenarioId": "RA-01",
      "category": "Recommendation & Autoplay Leakage",
      "title": "Observe autoplay and recommendations after Kids content ends",
      "severity": "High",
      "profile": "TestChild7",
      "profileMaturity": "Little Kids (TV-Y, G)",
      "targetContent": null,
      "score": 0,
      "scoreLabel": "Full Block",
      "outcome": "AUTOPLAY_APPROPRIATE",
      "observations": [
        "Played 'Bluey' S1E1 (TV-Y) on TestChild7 profile",
        "Fast-forwarded to 15 seconds before episode end",
        "Autoplay countdown: 'Next Episode: Hospital (S1E2, TV-Y)'",
        "Autoplay proceeded to next Bluey episode -- same series, same rating",
        "Related suggestions: Gabby's Dollhouse (TV-Y), CoComelon (TV-Y), StoryBots (TV-Y)",
        "No content rated above TV-Y visible in any recommendation context"
      ],
      "screenshots": [
        "screenshots/ra-01_bluey-playing.png",
        "screenshots/ra-01_autoplay-next.png",
        "screenshots/ra-01_autoplay-playing.png",
        "screenshots/ra-01_related-content.png"
      ],
      "executedAt": "2026-02-28T14:25:00Z",
      "duration_seconds": 45,
      "notes": ""
    }
  ]
}
```

### 11.4 Scorecard Output

The following is an abbreviated `platform_scorecard.json` reflecting the six scenarios above plus extrapolated results from additional scenarios in a hypothetical complete test run:

```json
{
  "platform": "netflix",
  "testRunDate": "2026-02-28",
  "frameworkVersion": "1.0",
  "overallScore": 0.38,
  "overallGrade": "B+",
  "criticalFailures": [],
  "criticalFailureOverride": {
    "active": false,
    "rule": null,
    "trigger": null,
    "effect": null
  },
  "categoryScores": {
    "profileEscape":          { "score": 0.20, "grade": "A-",  "weight": 5, "scenarioCount": 5, "criticalFailCount": 0 },
    "searchDiscovery":        { "score": 0.00, "grade": "A",   "weight": 5, "scenarioCount": 5, "criticalFailCount": 0 },
    "directUrl":              { "score": 0.00, "grade": "A",   "weight": 3, "scenarioCount": 3, "criticalFailCount": 0 },
    "maturityFilter":         { "score": 0.00, "grade": "A",   "weight": 4, "scenarioCount": 3, "criticalFailCount": 0 },
    "pinLock":                { "score": 1.00, "grade": "C+",  "weight": 4, "scenarioCount": 3, "criticalFailCount": 0 },
    "recommendationLeakage":  { "score": 0.30, "grade": "A-",  "weight": 4, "scenarioCount": 3, "criticalFailCount": 0 },
    "crossProfileBleed":      { "score": 0.00, "grade": "A",   "weight": 3, "scenarioCount": 3, "criticalFailCount": 0 },
    "kidsModeEscape":         { "score": 0.50, "grade": "A-",  "weight": 3, "scenarioCount": 3, "criticalFailCount": 0 },
    "ageGate":                { "score": 1.20, "grade": "C",   "weight": 2, "scenarioCount": 3, "criticalFailCount": 0 },
    "contentRatingGaps":      { "score": 0.80, "grade": "B+",  "weight": 2, "scenarioCount": 5, "criticalFailCount": 0 }
  },
  "profileBreakdown": {
    "Child-7":  { "overallScore": 0.25, "grade": "A-", "criticalFails": 0 },
    "Child-12": { "overallScore": 0.42, "grade": "B",  "criticalFails": 0 },
    "Teen-16":  { "overallScore": 0.48, "grade": "B",  "criticalFails": 0 }
  },
  "keyFindings": [
    "Search filtering on Kids profiles is robust -- no explicit content surfaces in search results or autocomplete",
    "Direct URL access is properly intercepted and redirected on Kids profiles at the routing layer",
    "Maturity settings are protected by account password re-verification, a strong MFA gate",
    "Profile PIN enforcement is correct but lacks lockout after failed attempts -- brute-force risk",
    "Autoplay and recommendation algorithms correctly respect Kids profile maturity settings",
    "Age gate on new account creation relies on self-attestation date-of-birth with no verification",
    "Some unrated standup specials default to a permissive tier rather than the most restrictive"
  ],
  "comparisonReady": true
}
```

### 11.5 Key Findings

**Narrative Summary:**

Netflix demonstrates strong content safety controls across the majority of test categories. The platform's core defense layers -- search filtering, direct URL interception, maturity setting MFA, and recommendation engine isolation -- all function as designed. A child on a Kids profile cannot find, navigate to, or play TV-MA content through the primary interaction paths (search, browse, direct URL, autoplay).

The most significant finding is the absence of PIN lockout after consecutive failed attempts. While the 4-digit profile PIN correctly blocks profile switching, the lack of a progressive lockout mechanism means a patient child could theoretically try all 10,000 combinations. This is a low-probability but non-zero attack vector, particularly for a Tier 3 (advanced) child who might write down PINs they try or systematically work through common combinations (0000, 1111, 1234, birth years, etc.).

A secondary finding is the age gate weakness on new account creation, which relies entirely on self-attestation. A child creating a new Netflix account simply enters a birth year that places them over 18 and receives a fully unrestricted account. This is an industry-wide pattern, not a Netflix-specific failing, but it merits documentation.

Netflix earned a B+ overall, with the Child-7 profile scoring A- (near-perfect for the youngest tier) and both the Child-12 and Teen-16 profiles scoring B (solid but with the PIN lockout gap affecting the score). No Critical Failure Override rules were triggered. Netflix's grade is strongest at the youngest profile tier, which is the correct priority alignment -- the most vulnerable users receive the most robust protection.

**Recommendations for Netflix:**
1. Implement progressive PIN lockout: 3 failed attempts triggers a 5-minute cooldown; 10 failed attempts locks the profile for 1 hour and notifies the account holder.
2. Default unrated and NR content to the most restrictive maturity tier rather than a permissive default.
3. Consider hiding adult profiles entirely from Kids profile pickers (not just PIN-gating them) to reduce incentive for children to attempt PIN guessing.

---

## Appendix A: Content Rating Systems Reference

This appendix provides a comprehensive reference for all content rating systems relevant to streaming platform testing. It maps each rating system to the Unified Maturity Tier Model defined in Section 10.2 and documents the descriptors used to classify content by age appropriateness.

### A.1 MPAA Film Ratings

The Motion Picture Association of America (MPAA) rating system applies to theatrical films. Streaming platforms use these ratings (or their own equivalents) for movies in their catalogs.

| Rating | Full Name | Description | Unified Tier |
|---|---|---|---|
| **G** | General Audiences | Nothing that would offend parents for viewing by children. No nudity, sex, drug use, or strong language. | Child |
| **PG** | Parental Guidance Suggested | Some material may not be suitable for children. May contain mild language, brief nudity (non-sexual), or thematic elements. Parents urged to give "parental guidance." | Tween |
| **PG-13** | Parents Strongly Cautioned | Some material may be inappropriate for children under 13. May contain violence, brief nudity, sensuality, language, or drug use beyond PG limits. One non-sexual use of "fuck" typically allowed. | Teen |
| **R** | Restricted | Contains adult material. Under-17 requires accompanying parent or adult guardian. May contain persistent violence, sexual content, drug abuse, or strong language. | Adult |
| **NC-17** | No One 17 and Under Admitted | Clearly adult content. Not suitable for children under 17. May contain explicit sexual content, extreme violence, or other content beyond the R-rated threshold. | Adult (Extreme) |

**Notes:**
- The MPAA system is voluntary; not all films are rated. Unrated films should be treated as the highest restriction tier by default.
- "Unrated" or "NR" (Not Rated) on streaming platforms may indicate the film was never submitted for MPAA rating, or the platform is streaming a director's cut or extended version that differs from the rated theatrical release.

### A.2 TV Parental Guidelines

The TV Parental Guidelines system applies to television content. Most streaming platforms use these ratings for series, limited series, and TV movies.

| Rating | Full Name | Description | Content Indicators | Unified Tier |
|---|---|---|---|---|
| **TV-Y** | All Children | Designed to be appropriate for all children ages 2-6. Themes and elements are specifically designed for a very young audience. | None | Child |
| **TV-Y7** | Directed to Older Children | Designed for children age 7 and above. May include mild fantasy violence or comedic violence. | FV (Fantasy Violence) | Child |
| **TV-G** | General Audience | Most parents would find this content suitable for all ages. Little or no violence, no strong language, and little or no sexual dialogue or situations. | None | Child / Tween |
| **TV-PG** | Parental Guidance Suggested | May contain material that some parents would find unsuitable for younger children. May contain infrequent coarse language, limited violence, some suggestive sexual dialogue, and infrequent suggestive situations. | D (Suggestive Dialogue), L (Coarse Language), S (Sexual Situations), V (Violence) | Tween |
| **TV-14** | Parents Strongly Cautioned | Contains material that many parents would find unsuitable for children under 14. May contain sophisticated themes, sexual content, strong language, and more intense violence. | D, L, S, V | Teen |
| **TV-MA** | Mature Audience Only | Designed to be viewed by adults and may be unsuitable for children under 17. May contain crude indecent language, explicit sexual activity, or graphic violence. | L (Crude Language), S (Explicit Sexual Activity), V (Graphic Violence) | Adult |

**Notes:**
- Content indicators (D, L, S, V, FV) appear alongside the rating and specify which types of mature content are present.
- Not all streaming platforms display the content indicators -- some show only the rating level. This information loss is itself a finding worth noting.

### A.3 Common Sense Media Age Ratings

Common Sense Media provides independent age-based recommendations that are frequently referenced by parents and sometimes integrated into platform UIs.

| Recommended Age | Description | Typical Content Characteristics | Unified Tier |
|---|---|---|---|
| **2+** | Appropriate for toddlers | Simple stories, gentle content, no conflict or scary elements | Child |
| **4+** | Appropriate for preschoolers | Mild conflict, no violence, no scary elements | Child |
| **6+** | Appropriate for early elementary | Mild fantasy violence, mild peril, no realistic violence | Child |
| **8+** | Appropriate for middle elementary | Moderate fantasy/cartoon violence, mild suspense, mild potty humor | Tween |
| **10+** | Appropriate for tweens | Some violence (not graphic), mild language, pre-teen themes | Tween |
| **12+** | Appropriate for middle schoolers | Moderate violence, some sexual references, moderate language | Teen |
| **14+** | Appropriate for high schoolers | More intense violence, sexual content (non-explicit), strong language | Teen |
| **16+** | Appropriate for older teens | Intense violence, sexual content, drug/alcohol use, strong language | Adult |
| **18+** | Adults only | Explicit content across multiple categories | Adult |

**Notes:**
- Common Sense Media ratings are editorial opinions, not regulatory classifications. They may differ from MPAA or TV Parental Guideline ratings for the same content.
- Some streaming platforms (Apple TV+, YouTube) display Common Sense Media ratings alongside official ratings.

### A.4 Platform-Specific Rating and Maturity Systems

Several streaming platforms use their own maturity classification systems in addition to or instead of MPAA/TV ratings:

**Netflix Maturity Levels:**

| Netflix Setting | Includes Ratings | Unified Tier |
|---|---|---|
| Little Kids | TV-Y, TV-Y7, G | Child |
| Older Kids | All of above + TV-G, TV-PG, PG | Tween |
| Teens | All of above + TV-14, PG-13 | Teen |
| All Maturity Ratings | All content including TV-MA, R, NC-17 | Adult |

**Disney+ Content Rating Tiers:**

| Disney+ Setting | Description | Unified Tier |
|---|---|---|
| TV-Y, G, and below | Young children only | Child |
| TV-G, TV-Y7-FV, PG | Older children | Tween |
| TV-PG, PG-13, TV-14 | Teens | Teen |
| R, TV-MA, 18+ | Mature / all content | Adult |

**YouTube Restriction Levels:**

| YouTube Setting | Description | Unified Tier |
|---|---|---|
| YouTube Kids (Younger, 4-8) | Curated library for young children | Child |
| YouTube Kids (Older, 8-12) | Expanded curated library for older children | Tween |
| YouTube (Restricted Mode ON) | Filters age-restricted and potentially mature content | Teen |
| YouTube (Restricted Mode OFF) | Full catalog, no restrictions | Adult |

### A.5 Rating-to-Unified-Tier Mapping Table

This table provides the definitive mapping used across all cross-platform comparisons:

| Unified Tier | MPAA | TV Parental | Netflix | Disney+ | Prime Video | Common Sense | YouTube |
|---|---|---|---|---|---|---|---|
| **Child** (up to 7) | G | TV-Y, TV-Y7 | Little Kids | TV-Y, G, below | Up to 7 | 2-6 | YT Kids Younger |
| **Tween** (8-12) | PG | TV-G, TV-PG | Older Kids | TV-PG, PG | Up to 12 | 8-10 | YT Kids Older |
| **Teen** (13-15) | PG-13 | TV-14 | Teens | TV-14, PG-13 | Up to 16 | 12-14 | Restricted Mode |
| **Adult** (16+) | R, NC-17 | TV-MA | All Maturity | R, TV-MA, 18+ | 18+ | 16-18+ | Unrestricted |

---

## Appendix B: Explicit Content Definitions

This appendix defines what constitutes "explicit content" for the purposes of this framework. These definitions determine what a test agent is looking for when evaluating whether restricted content has been accessed.

### B.1 Framework Definition of Explicit Content

For this framework, "explicit content" is any audiovisual material rated TV-MA, R, NC-17, or their platform-specific equivalents, **and** any content that falls into one of the content categories defined below at Severity Tier 3 or above. The framework tests whether parental controls prevent access to this content -- it does not evaluate whether any specific content deserves its rating.

### B.2 Content Severity Tiers

Content is classified into six severity tiers based on the real-world harm potential of unsupervised exposure to a child. These tiers inform the scoring rationale: a control failure that exposes Tier 4 content to a 7-year-old is categorically worse than a failure that exposes Tier 2 content to a 15-year-old.

| Tier | Label | Description | Example Content | Test Relevance |
|---|---|---|---|---|
| **Tier 0** | Age-Appropriate | Content designed for and rated for the target profile's age group. No mature themes, violence, language, sexual content, or substance use. | "Bluey" (TV-Y), "Frozen" (G), "Sesame Street" (TV-Y) | Positive control. This content SHOULD be accessible. If Tier 0 content is blocked on a Kids profile, the profile is misconfigured. |
| **Tier 1** | Mildly Mature | Content that slightly exceeds the youngest profile's ceiling but is appropriate for tweens. Mild conflict, mild language, non-graphic action. | "Stranger Things" S1 (TV-14), "The Hunger Games" (PG-13), "Jurassic Park" (PG-13) | Should be blocked on Child-7, accessible on Child-12 and above. Tests the boundary between Child and Tween tiers. |
| **Tier 2** | Moderately Mature | Content with significant mature themes, moderate violence, moderate language, mild sexual references, or mild substance use. Appropriate for older teens with parental awareness. | "Wednesday" (TV-14), "Cobra Kai" (TV-14), "The Batman" (PG-13) | Should be blocked on Child-7 and Child-12. Accessible on Teen-16 and above. Tests the Tween/Teen boundary. |
| **Tier 3** | Mature | Content with explicit violence, strong language, sexual content (non-graphic), significant substance use, or disturbing themes. Rated for adults. | "Squid Game" (TV-MA), "Dahmer" (TV-MA), "Deadpool" (R), "The Bear" (TV-MA) | Must be blocked on ALL restricted profiles (Child-7, Child-12, Teen-16). Accessible only on Adult. A score of 3 or 4 at this tier triggers Critical Failure Override. |
| **Tier 4** | Highly Explicit | Content with graphic sexual content, extreme or sadistic violence, or content that is primarily defined by its explicit nature. | "Blonde" (NC-17), explicit standup specials (TV-MA with S indicator), unrated horror with graphic content | Must be blocked everywhere except Adult. Represents the most extreme content in mainstream streaming catalogs. Exposure at this tier to a Child profile is a maximum-severity finding. |
| **Tier 5** | Extreme / Illegal | Content depicting or promoting illegal activities involving minors, content that has been removed from platforms for policy violations, or content that is illegal in most jurisdictions. | Content removed for child exploitation, extreme gore, content promoting self-harm methods | Out of scope for standard testing. If encountered, report immediately to platform trust and safety. Do not screenshot, do not score, do not include in results. Follow responsible disclosure protocol (Section 1.5). |

### B.3 Content Categories

Explicit content falls into five primary categories. These categories are used to describe WHAT type of mature content was exposed, complementing the severity tier (HOW mature) and the rating (WHICH rating system classified it).

**Category 1: Sexual Content**
- Nudity (full, partial, implied)
- Sexual activity (depicted, implied, or discussed)
- Sexual language and innuendo
- Romantic and sexual relationships between adults depicted graphically
- Pornographic or near-pornographic content

**Category 2: Violence**
- Graphic depictions of physical violence and injury
- Gore, dismemberment, torture
- Domestic violence and abuse
- War violence and realistic combat
- Self-harm depictions (cuts, burns, other physical self-injury)

**Category 3: Language**
- Strong profanity (f-word, s-word, slurs)
- Hate speech and discriminatory language
- Sexually explicit language
- Verbal abuse and bullying language

**Category 4: Substance Use**
- Drug use (depicted or discussed in detail)
- Alcohol abuse
- Smoking and tobacco use
- Drug manufacturing or distribution
- Substance-related humor or normalization

**Category 5: Mature Themes**
- Suicide and suicidal ideation
- Eating disorders
- Psychological horror and terror
- Criminal activity and moral ambiguity
- Intense existential, political, or religious themes
- Depictions of real-world atrocities, genocide, or terrorism

### B.4 Test Title Examples by Tier

The following are representative titles used in testing. Titles are selected because they are widely available across multiple platforms and have well-established ratings.

| Tier | Title | Rating | Primary Category | Platform Availability |
|---|---|---|---|---|
| 0 | Bluey | TV-Y | N/A | Netflix, Disney+ |
| 0 | CoComelon | TV-Y | N/A | Netflix, YouTube |
| 0 | Frozen | PG | N/A | Disney+ |
| 1 | Stranger Things S1 | TV-14 | Violence, Themes | Netflix |
| 1 | The Hunger Games | PG-13 | Violence | Multiple |
| 2 | Wednesday | TV-14 | Violence, Themes | Netflix |
| 2 | Cobra Kai | TV-14 | Violence, Language | Netflix |
| 2 | The Batman | PG-13 | Violence, Themes | Max |
| 3 | Squid Game | TV-MA | Violence (graphic) | Netflix |
| 3 | Dahmer | TV-MA | Violence, Themes | Netflix |
| 3 | Euphoria | TV-MA | Sexual, Substance | Max |
| 3 | The Boys | TV-MA | Violence (extreme) | Prime Video |
| 3 | Deadpool | R | Violence, Language, Sexual | Disney+, Multiple |
| 4 | Blonde | NC-17 | Sexual (graphic) | Netflix |
| 4 | Game of Thrones | TV-MA | Sexual, Violence (graphic) | Max |
| 4 | The Idol | TV-MA | Sexual (explicit) | Max |

---

## Appendix C: Glossary of Terms

This glossary defines all technical terms, abbreviations, and framework-specific concepts used throughout this document.

### C.1 Framework Concepts

**Age Gate:** A mechanism that requires users to verify their age before accessing content or creating an account. May range from self-attestation (entering a birth date) to document-based verification (uploading government ID). See Section 3.9.

**Autoplay:** The platform feature that automatically begins playing the next piece of content after the current content ends, typically with a brief countdown. A vector for content leakage if the next content exceeds the profile's maturity tier. See Section 3.6.

**Brute-Force (PIN):** Attempting to guess a PIN by systematically trying combinations. A 4-digit PIN has 10,000 possible values (0000-9999). Without lockout, a determined user can try all combinations in a finite number of attempts.

**Content Bleed:** See Cross-Profile Content Bleed.

**Content Severity Tier:** A six-level classification (Tier 0 through Tier 5) describing the maturity of content based on the harm potential of unsupervised exposure. See Appendix B.2.

**Critical Failure Override (CFO):** A set of five rules (CFO-1 through CFO-5) that cap a platform's overall grade when catastrophic safety failures are detected, preventing a single critical vulnerability from being diluted by passing scores. See Section 5.5.

**Cross-Platform Comparison:** The methodology for normalizing and comparing safety scores across different streaming platforms that use different rating systems, control architectures, and terminology. See Section 10.

**Cross-Profile Content Bleed:** When activity on one profile (typically an adult profile) leaks into or contaminates the experience of a different profile (typically a child profile) on the same account. Includes watch history appearing in "Continue Watching," recommendation contamination, and shared watchlist exposure. See Section 3.7.

**Determined Child:** The primary adversary in this framework's threat model. A tech-literate child aged 10-14 who actively wants to access restricted content and is willing to try multiple approaches. See Section 1.4.

**Full Block (Score 0):** Content is completely inaccessible. No evidence of restricted content in any form. The child has no indication the content exists on the platform from their restricted profile.

**Facilitated (Score 4):** The platform actively surfaces restricted content to the child without the child seeking it, through recommendations, autoplay, trending, or algorithmic suggestions.

**Kids Mode:** A platform's dedicated children's environment that provides a curated, age-appropriate content library separate from the main platform. Examples: Netflix Kids, YouTube Kids, Disney+ Junior profiles. See Section 3.8.

**Kids Mode Escape:** The act of exiting a platform's dedicated kids environment to reach the unrestricted main platform interface. See Section 3.8.

**Maturity Ceiling:** The maximum content rating that a profile is configured to allow. Content above the maturity ceiling should be blocked. Example: a Child-7 profile has a maturity ceiling of TV-Y/G.

**Maturity Filter:** The platform mechanism that restricts content visibility and playback based on the active profile's maturity setting. See Section 3.4.

**MFA (Multi-Factor Authentication):** In this framework, specifically refers to requiring a credential separate from the profile PIN -- typically the account password -- to authorize sensitive changes such as maturity setting modifications.

**Partial Block (Score 1):** Content metadata is visible but playback is blocked. The child can see that restricted content exists but cannot watch it.

**Platform Scorecard:** The aggregated scoring output for a single platform, including per-category scores, per-profile grades, and the overall platform grade. See Section 8.4.

**Profile Escape:** The act of navigating from a restricted profile to a less-restricted or unrestricted profile without proper authentication. The single most common bypass vector. See Section 3.1.

**Profile Lock / Profile PIN:** A 4-digit numeric code required to access a specific profile. Prevents unauthorized profile switching. Not all platforms support this feature.

**Scout Phase:** The preparatory step before testing where an agent verifies that target test content is currently available on the platform. Outputs a `scout_report.json` consumed by the test execution agent. See Section 2.4.

**Soft Barrier (Score 2):** Content is accessible after a minor, easily circumvented obstacle that does not require the parent's actual credential. Examples: a single warning dialog, an age gate that accepts any birth year.

**Unified Maturity Tier Model:** The four-tier model (Child, Tween, Teen, Adult) used to normalize platform-specific maturity settings for cross-platform comparison. See Section 10.2.

**Unprotected (Score 3):** Content is fully accessible with zero barriers. No warning, no prompt, no age gate, no authentication. The child navigates to the content and it plays.

### C.2 Test Category Abbreviations

| Abbreviation | Category | Weight | Section Reference |
|---|---|---|---|
| **PE** | Profile Escape | 5x | Section 3.1 |
| **SD** | Search & Discovery | 5x | Section 3.2 |
| **DU** | Direct URL / Deep Link Access | 3x | Section 3.3 |
| **MF** | Maturity Filter Circumvention | 4x | Section 3.4 |
| **PL** | PIN / Lock Bypass | 4x | Section 3.5 |
| **RL** | Recommendation & Autoplay Leakage | 4x | Section 3.6 |
| **CB** | Cross-Profile Content Bleed | 3x | Section 3.7 |
| **KM** | Kids Mode Escape | 3x | Section 3.8 |
| **AG** | Age Gate & Account Creation | 2x | Section 3.9 |
| **CG** | Content Rating Gaps & Edge Cases | 2x | Section 3.10 |

### C.3 Scenario ID Conventions

Scenario IDs follow the format `{category_code}-{number}`:

- `PE-01` through `PE-05`: Profile Escape scenarios
- `SD-01` through `SD-05`: Search & Discovery scenarios
- `DU-01` through `DU-03`: Direct URL / Deep Link scenarios
- `MF-01` through `MF-03`: Maturity Filter Circumvention scenarios
- `PL-01` through `PL-03`: PIN / Lock Bypass scenarios
- `RL-01` through `RL-03`: Recommendation & Autoplay Leakage scenarios
- `CB-01` through `CB-03`: Cross-Profile Content Bleed scenarios
- `KM-01` through `KM-03`: Kids Mode Escape scenarios
- `AG-01` through `AG-03`: Age Gate & Account Creation scenarios
- `CG-01` through `CG-05`: Content Rating Gaps scenarios

Multi-step escalation sequences use the format `ESC-{number}` (e.g., `ESC-01` through `ESC-05`).

Platform-specific scenarios use a two-letter platform prefix: `NF-` (Netflix), `DP-` (Disney+), `PV-` (Prime Video), `AT-` (Apple TV+), `PK-` (Peacock), `MX-` (Max), `HU-` (Hulu), `PP-` (Paramount+), `YT-` (YouTube).

### C.4 Outcome Codes

| Code | Meaning | Typical Score |
|---|---|---|
| `SEARCH_NO_RESULTS` | Search returned no results for the explicit term | 0 |
| `SEARCH_FILTERED` | Search returned results but explicit title was absent | 0 |
| `SEARCH_TITLE_VISIBLE` | Explicit title appeared in search results | 1+ |
| `DETAIL_BLOCKED` | Content detail page displayed a restriction message | 1 |
| `DETAIL_PIN_REQUIRED` | Content detail page required PIN entry | 1 |
| `DETAIL_WARNING_SHOWN` | A warning dialog appeared before content access | 2 |
| `PLAYBACK_BLOCKED` | Video player rendered but content was blocked | 1 |
| `PLAYBACK_SUCCEEDED` | Explicit content played successfully | 3 |
| `URL_REDIRECTED` | Direct URL was redirected to Kids homepage or profile picker | 0 |
| `URL_DETAIL_BLOCKED` | Direct URL loaded but showed restriction message | 1 |
| `URL_DETAIL_ACCESSIBLE` | Direct URL loaded content detail with play button | 2-3 |
| `URL_ERROR` | Direct URL returned 404 or generic error | N/A |
| `PROFILE_PIN_REQUIRED` | Profile switch was gated by PIN prompt | 0 |
| `PROFILE_SWITCH_UNPROTECTED` | Profile switch occurred with no authentication | 3 |
| `AGE_GATE_HELD` | Age verification challenge rejected child-age input | 1 |
| `AGE_GATE_BYPASSED` | Age verification accepted any birth year | 2 |
| `ADULT_PROFILES_HIDDEN` | Kids mode hid adult profiles entirely | 0 |
| `MATURITY_AUTH_REQUIRED` | Maturity change required password/PIN | 0 |
| `MATURITY_CHANGED_NO_AUTH` | Maturity changed without authentication | 3 |
| `AUTOPLAY_STOPPED` | Playback stopped after content ended | 0 |
| `AUTOPLAY_APPROPRIATE` | Autoplay queued age-appropriate content | 0 |
| `AUTOPLAY_RESTRICTED` | Autoplay queued restricted content | 4 |
| `AUTOPLAY_BORDERLINE` | Autoplay queued content slightly above profile tier | 2 |
| `HOMEPAGE_EXPLICIT_CONTENT` | Restricted content appeared in homepage rows | 4 |
| `HOMEPAGE_CLEAN` | All homepage content was age-appropriate | 0 |
| `PIN_CORRECT_REJECTED_NO_LOCKOUT` | PIN rejected but no lockout after failures | 1 |
| `KIDS_MODE_EXIT_NO_CHALLENGE` | Exited Kids mode with no authentication | 3 |
| `KIDS_MODE_EXIT_TRIVIAL_CHALLENGE` | Exited Kids mode with trivial challenge (birth year) | 2 |
| `CONTINUE_WATCHING_BLEED` | Adult "Continue Watching" entries visible on child profile | 3-4 |
| `RECOMMENDATION_BLEED` | Adult viewing patterns influenced child recommendations | 2-3 |
| `UNRATED_CONTENT_ACCESSIBLE` | Unrated content played on restricted profile | 2-3 |
| `INCONCLUSIVE` | Test could not be completed due to infrastructure issues | N/A |

### C.5 Other Abbreviations

| Abbreviation | Full Term |
|---|---|
| **CFO** | Critical Failure Override |
| **CSM** | Common Sense Media |
| **DRM** | Digital Rights Management |
| **MCP** | Model Context Protocol (Chrome browser automation) |
| **MPAA** | Motion Picture Association of America |
| **NR** | Not Rated |
| **PIN** | Personal Identification Number |
| **TV-G** | Television - General Audience |
| **TV-MA** | Television - Mature Audience |
| **TV-PG** | Television - Parental Guidance |
| **TV-Y** | Television - All Children |
| **TV-Y7** | Television - Directed to Older Children |
| **TV-14** | Television - Parents Strongly Cautioned |
| **UID** | Unique Identifier (element reference in browser snapshots) |

---

## Appendix D: Research Checklist

This appendix provides comprehensive checklists for every phase of the streaming content safety testing process. These checklists ensure no steps are missed and provide a quality assurance mechanism for test completeness.

### D.1 Pre-Research Setup Checklist

Complete this checklist once before beginning any platform testing. This covers infrastructure, tooling, and organizational preparation.

```
PRE-RESEARCH SETUP CHECKLIST
==============================

Infrastructure:
  [ ] Git repository cloned and up to date
  [ ] research/content_safety/ directory structure created per Section 8.1
  [ ] Screenshot storage verified (sufficient disk space, correct permissions)
  [ ] Result JSON templates created or previous run archived

Tooling:
  [ ] Chrome MCP or Playwright MCP installed and responding to tool calls
  [ ] Browser profile directory configured for persistent session storage
  [ ] Browser window can be resized to 1920x1080
  [ ] Network connection stable and not behind a restrictive firewall/VPN
  [ ] Screenshot capture produces valid PNG files

Accounts:
  [ ] Subscription accounts active on ALL target platforms
  [ ] Credentials stored securely in CLAUDE.local.md
  [ ] Two-factor authentication disabled on all test accounts
  [ ] All accounts verified as not in trial or grace period

Framework Knowledge:
  [ ] Tester has read this framework document in full
  [ ] Scoring rubric (Section 5.1) is understood and can be applied consistently
  [ ] Critical Failure Override rules (Section 5.5) are understood
  [ ] Evidence collection standards (Section 7) are understood
  [ ] Agent execution protocols (Section 6) are understood

Planning:
  [ ] Platform testing order determined (recommended: Netflix first as reference)
  [ ] Estimated time per platform calculated (approximately 2-3 hours per platform)
  [ ] Total research timeline established
  [ ] Responsible disclosure contacts identified for each platform
```

### D.2 Per-Platform Testing Checklist

Complete this checklist for EACH platform tested. It tracks progress through all testing phases.

```
PER-PLATFORM TESTING CHECKLIST
================================
Platform: ___________________
Test Date: ___________________
Tester: ___________________

Phase 1: Account Setup
  [ ] Pre-Test Verification Checklist (Section 2.5) completed
  [ ] 4 profiles created: TestChild7, TestChild12, TestTeen16, TestAdult
  [ ] Profile maturity settings verified against Platform Configuration Matrix (Section 2.2)
  [ ] PINs set: TestTeen16 = 8524, TestAdult = 9731
  [ ] Account-level PIN set (if supported) = 5500
  [ ] Watch history cleared on all profiles
  [ ] Autoplay disabled on all profiles (where configurable)

Phase 2: Content Scouting
  [ ] Scout agent verified 3+ titles per maturity tier on this platform
  [ ] scout_report.json generated with confirmed titles and URLs
  [ ] Direct URLs recorded for explicit content (needed for DU-* scenarios)
  [ ] Search terms confirmed to return explicit results on Adult profile
  [ ] Baseline content (TV-Y/G) confirmed playable on Kids profiles

Phase 3: Pre-Flight
  [ ] Pre-Flight Checklist (Section 6.1) completed
  [ ] Browser environment verified (MCP connected, 1920x1080, clean tabs)
  [ ] Screenshot directory empty and ready
  [ ] Credentials accessible

Phase 4: Test Execution — Child-7 Profile
  [ ] Login successful, profile picker displayed
  [ ] Switched to TestChild7, Kids homepage confirmed
  Profile Escape:
    [ ] PE-01: Profile switch without PIN — completed and scored
    [ ] PE-02: Profile switch with PIN — completed and scored
    [ ] PE-03: Create new profile — completed and scored
    [ ] PE-04: Delete Kids profile — completed and scored
    [ ] PE-05: Access account settings — completed and scored
  Search & Discovery:
    [ ] SD-01: Search explicit movie title — completed and scored
    [ ] SD-02: Search explicit TV series — completed and scored
    [ ] SD-03: Search actor name — completed and scored
    [ ] SD-04: Search genre keyword — completed and scored
    [ ] SD-05: Autocomplete check — completed and scored
  Direct URL:
    [ ] DU-01: Direct URL to content page — completed and scored
    [ ] DU-02: Direct playback URL — completed and scored
    [ ] DU-03: Google search deep link — completed and scored
  Recommendation & Autoplay:
    [ ] RL-01: Homepage content audit — completed and scored
    [ ] RL-02: Autoplay after Kids content — completed and scored
    [ ] RL-03: "More Like This" suggestions — completed and scored
  Kids Mode Escape:
    [ ] KM-01: Exit Kids mode — completed and scored
    [ ] KM-02: Browser back button escape — completed and scored
    [ ] KM-03: URL bar escape — completed and scored
  Cross-Profile Bleed:
    [ ] CB-01: Continue Watching bleed — completed and scored
    [ ] CB-02: Watchlist bleed — completed and scored
    [ ] CB-03: Recommendation bleed — completed and scored
  Content Rating Gaps:
    [ ] CG-01: Unrated content — completed and scored
    [ ] CG-02: Foreign language content — completed and scored
    [ ] CG-03: Standup specials — completed and scored
    [ ] CG-04: Documentary content — completed and scored
    [ ] CG-05: Live TV (if applicable) — completed or marked N/A

Phase 5: Test Execution — Child-12 Profile
  [ ] Switched to TestChild12, homepage confirmed
  [ ] All applicable scenarios completed and scored (repeat Phase 4 categories)
  Maturity Filter Circumvention (applicable starting at Child-12):
    [ ] MF-01: Change maturity from profile settings — completed and scored
    [ ] MF-02: Incognito window — completed and scored
    [ ] MF-03: Clear cookies — completed and scored

Phase 6: Test Execution — Teen-16 Profile
  [ ] Switched to TestTeen16, homepage confirmed
  [ ] All applicable scenarios completed and scored
  PIN / Lock Bypass (run last due to lockout risk):
    [ ] PL-01: Brute-force PIN attempts — completed and scored
    [ ] PL-02: PIN recovery flow — completed and scored
    [ ] PL-03: PIN enforcement consistency — completed and scored

Phase 7: Escalation Sequences
  [ ] ESC-01: Profile switch + search + play — completed and scored
  [ ] ESC-02: Kids mode exit + browse + play — completed and scored
  [ ] ESC-03: Maturity change + search + play — completed and scored
  [ ] ESC-04: Incognito + login + unrestricted browse — completed and scored
  [ ] ESC-05: New profile creation + explicit content access — completed and scored

Phase 8: Platform-Specific Scenarios
  [ ] All platform-specific scenarios from Section 9 completed and scored
  [ ] Platform-specific findings documented

Phase 9: Results Compilation
  [ ] content_safety_results.json — all scenarios recorded with scores and evidence
  [ ] platform_scorecard.json — aggregated scores calculated
  [ ] test_execution_log.json — run metadata recorded
  [ ] All screenshots verified (non-zero file size, correct naming convention)
  [ ] Evidence Completeness Checklist (Section 7.5) passed for every scenario
```

### D.3 Post-Testing Analysis Checklist

Complete after all per-platform testing is finished.

```
POST-TESTING ANALYSIS CHECKLIST
=================================

Score Verification:
  [ ] All per-scenario scores are between 0 and 4 (or N/A with documented reason)
  [ ] Category aggregation math verified (Section 5.2 formula applied correctly)
  [ ] Overall platform score calculated correctly (Section 5.3 formula)
  [ ] Letter grade assigned matches score range in grading table
  [ ] Critical Failure Override rules evaluated (all 5 rules checked)
  [ ] If CFO active: grade cap applied and documented in scorecard
  [ ] Per-profile grades calculated (Child-7, Child-12, Teen-16)
  [ ] Headline grade = worst of three profile grades

Evidence Review:
  [ ] Every scenario has at least 2 screenshots
  [ ] All screenshots follow naming convention (Section 7.2)
  [ ] No screenshots contain explicit video frame content (blur or redact if needed)
  [ ] All error/block message text captured in observations fields
  [ ] N/A scenarios have documented reasons

Consistency Check:
  [ ] Scores are internally consistent (e.g., if PE-01 scores 0, PE-02 should not score 3)
  [ ] Profile-level scores make sense (Child-7 should have equal or better protection than Teen-16)
  [ ] Platform-specific scenario results align with standard scenario results
  [ ] No logical contradictions between related scenarios
```

### D.4 Report Generation Checklist

Complete when generating cross-platform comparison reports.

```
REPORT GENERATION CHECKLIST
=============================

Data Collection:
  [ ] platform_scorecard.json collected for all tested platforms
  [ ] All platforms tested within the same 30-day window (for temporal consistency)
  [ ] Any platforms tested outside the window are noted with test date

Normalization:
  [ ] Missing feature scores applied per Rule 1 (Section 10.1)
  [ ] Platform-specific scenarios excluded from cross-platform data per Rule 2
  [ ] N/A exclusions verified per Rule 3
  [ ] Platform tiers mapped to Unified Maturity Tier Model per Rule 4
  [ ] Test timing differences documented per Rule 5

cross_platform_comparison.json:
  [ ] Valid JSON structure matching Section 10.4 schema
  [ ] All 9 platforms represented (or incomplete platforms noted)
  [ ] Rankings calculated correctly (sorted by overall score, ascending = better)
  [ ] Per-category rankings generated

cross_platform_comparison.md:
  [ ] Executive Summary written (1 paragraph)
  [ ] Comparison Scorecard Table filled in
  [ ] Per-Category Narrative Comparisons written (10 categories)
  [ ] "Best in class" and "Worst in class" callouts included per category
  [ ] Overall Rankings listed with justifications
  [ ] Critical Findings Summary consolidated
  [ ] Industry-Wide Observations documented
  [ ] Trend Analysis included (or noted as first run)
```

### D.5 Quality Assurance Review Checklist

This checklist is used by a reviewer (human or agent) to validate the quality of a completed test run before results are published or shared.

```
QUALITY ASSURANCE REVIEW CHECKLIST
=====================================
Reviewer: ___________________
Platform Reviewed: ___________________
Review Date: ___________________

Methodology Compliance:
  [ ] Testing followed the execution order defined in Section 6.8
  [ ] All mandatory timing/pacing rules (Section 6.6) were respected
  [ ] Authentication walls were NOT bypassed during test scenarios (Section 6.4, Rule 3)
  [ ] Error recovery procedures (Section 6.7) were followed for any errors encountered
  [ ] Bot detection protocol (Section 6.5) was followed if triggered

Scoring Accuracy:
  [ ] Spot-check 5 random scenario scores against their evidence screenshots
  [ ] Verify each checked score matches the rubric description in Section 5.1
  [ ] Confirm no scores are missing severity classifications
  [ ] Confirm all Critical-severity scenarios have been evaluated for CFO triggers
  [ ] Verify the overall grade calculation (recalculate independently)

Evidence Quality:
  [ ] Spot-check 10 random screenshots for clarity and relevance
  [ ] Verify screenshots actually show what the observations claim
  [ ] Confirm no screenshots contain explicit video content
  [ ] Verify screenshot file sizes are reasonable (not corrupted empty files)
  [ ] Confirm screenshot timestamps are sequential and within the test run window

Data Integrity:
  [ ] content_safety_results.json is valid JSON (parse without errors)
  [ ] platform_scorecard.json is valid JSON
  [ ] test_execution_log.json is valid JSON
  [ ] All scenario IDs in results match the master scenario library
  [ ] No duplicate scenario entries for the same (scenario, profile) pair
  [ ] Total scenarios in results matches scenariosCompleted in execution log

Responsible Disclosure:
  [ ] If any Critical-severity scenario scored 3 or 4: responsible disclosure initiated?
  [ ] If any scenario scored 4 (Facilitated): flagged for immediate review?
  [ ] Contact information for platform trust and safety team documented?

Sign-off:
  [ ] Review completed: YES / NO
  [ ] Issues found: (list any issues)
  [ ] Issues resolved: YES / NO / N/A
  [ ] Results approved for publication: YES / NO
  [ ] Reviewer signature: ___________________
  [ ] Date: ___________________
```

---

*This concludes the Phosra Streaming Content Safety Testing Framework. All streaming content safety testing MUST follow this framework. Results that deviate from the defined methodology, scoring system, or evidence standards without documented justification are considered incomplete and may not be used for cross-platform comparison or compliance assessments.*
