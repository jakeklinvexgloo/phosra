# Journalist Outreach Tool: Critical Evaluation & 10/10 Improvement Plan

**Author:** Product Strategy Review
**Date:** February 26, 2026
**Current State:** Solid foundation (7/10) -- well-structured data model, good pitch framework, comprehensive journalist list. Missing the intelligence layer, automation, and workflow polish that would make this a daily-driver tool rather than a glorified spreadsheet.

---

## Executive Summary

The current journalist CRM has strong bones: a well-designed Postgres schema with proper JSONB fields, a clean Next.js UI with sorting/filtering, and an excellent pitch angle framework document. However, it functions primarily as a *static contact database* rather than an *intelligence-driven outreach engine*. The gap between what exists and a 10/10 tool can be summarized in three words: **enrichment, automation, and workflow**.

What follows is a prioritized plan to close that gap.

---

## Part 1: Data Richness -- What's Missing

### 1.1 Missing Fields on Each Journalist Profile

**Currently tracked:** name, publication, title, beat, sub_beats, email, twitter_handle, linkedin_url, signal_handle, phone, relevance_score, tier, relationship_status, pitch_angles, recent_articles, coverage_preferences, notes, timestamps.

**What's missing and why it matters:**

| Field | Why It Matters | How to Get It |
|-------|---------------|---------------|
| `bluesky_handle` | Many journalists have migrated from X; Bluesky is now the primary social channel for tech/policy press | Manual entry + scrape from journalist's personal site |
| `mastodon_handle` | Casey Newton, Zack Whittaker, and others are active on Mastodon | Manual entry from profile pages |
| `personal_site_url` | Many journalists have personal sites with contact forms, newsletters, and bio info (e.g., laurenfeiner.com, zackwhittaker.com) | Web search during research phase |
| `newsletter_url` | Journalists with newsletters (Casey Newton's Platformer, Reed Albergotti's Semafor Tech) are reachable through newsletter replies | Manual research |
| `podcast_name` | Identifies podcast guest opportunities (e.g., Jedidiah Bracy's Privacy Advisor Podcast, Casey Newton's Hard Fork) | Manual research |
| `photo_url` | Humanizes the profile -- seeing a face makes outreach feel personal, not transactional | Pull from Twitter/LinkedIn API or publication bio page |
| `location` | Timezone awareness for outreach timing; identifies local event opportunities | LinkedIn or publication bio |
| `timezone` | Currently buried in `coverage_preferences` JSONB -- should be a first-class field for scheduling | Derived from location |
| `estimated_audience_size` | Publication + personal following combined; helps prioritize outreach | Twitter followers + publication monthly uniques (SimilarWeb) |
| `domain_authority` | Publication's SEO authority -- determines backlink value of coverage | Moz/Ahrefs API or manual lookup |
| `last_article_date` | When did they last publish anything? Stale = may have changed roles | RSS feed monitoring or manual check |
| `article_frequency` | How often do they publish? Daily = responsive to pitches; monthly = selective | Derived from article monitoring |
| `previous_publications` | Career history -- helps understand their network and what angles they've covered before | LinkedIn or manual research |
| `mutual_connections` | Who in Jake's network knows this person? LinkedIn shared connections | LinkedIn API or manual check |
| `response_time_avg` | How fast do they typically reply to pitches? Informs follow-up timing | Calculated from activity log data |
| `preferred_pitch_length` | Some journalists want 2 sentences; some want full data packages | Learned over time from interactions |
| `email_verified` | Is the email confirmed working? Bounced? Guessed? | Track bounce-backs from Gmail integration |
| `email_source` | Where did we find this email? (publication page, Hunter.io, guess, direct from journalist) | Manual tag at data entry |
| `tags` | Free-form tags beyond beat/sub_beats -- e.g., "covers Meta specifically", "sympathetic to startups", "skeptical of compliance tech" | Manual curation |

### 1.2 What Would Make Opening a Profile Feel Like "I Know Everything"

Opening a journalist profile should answer five questions instantly:

1. **Who are they right now?** Name, photo, publication, title, beat, social handles -- all visible without scrolling.
2. **What have they written recently?** Auto-updating feed of their last 10-20 articles, with Phosra-relevant ones highlighted.
3. **What do they care about?** Topics they cover most frequently (word cloud or tag frequency from recent articles), plus any stated preferences.
4. **What's our history with them?** Full timeline of every touchpoint: pitches sent, responses, calls, DMs, coverage produced. At a glance.
5. **What should I do next?** AI-generated "next best action" -- e.g., "They published a COPPA article yesterday. Send a congratulatory note with our latest data."

**Concrete UI changes needed on the detail page (`[id]/page.tsx`):**

- Add a **header card** with photo, name, publication logo, and all social links as clickable icons (currently social handles are buried in form fields)
- Add an **"AI Summary" card** at the top of the right column: a 2-3 sentence AI-generated briefing on who this journalist is, what they cover, and what angle would work best right now
- Add a **"Recent Activity Feed"** card that pulls their latest tweets/posts about child safety topics
- Move **Quick Stats** to be more prominent -- currently it's a small card in the right column; make it a horizontal stat bar under the header
- Add a **"Suggested Actions"** section with one-click buttons (see Workflow section below)

### 1.3 Social Media Activity & Article Tracking

**Current state:** `recent_articles` is a manually-maintained JSONB array. No social media tracking at all.

**What's needed:**

**Article monitoring (automated):**
- Set up RSS feed ingestion for each journalist's publication author page (most publications have per-author RSS feeds)
- Store articles in a new `journalist_articles` table (not JSONB) with: `id`, `journalist_id`, `title`, `url`, `published_at`, `summary`, `is_relevant` (AI-scored), `relevance_score`, `relevance_reason`
- Run a daily cron job that fetches new articles, scores them for Phosra-relevance using Claude, and surfaces relevant ones as notifications
- **Specific RSS patterns by publication:**
  - Axios: `https://www.axios.com/authors/[slug]/feed`
  - TechCrunch: `https://techcrunch.com/author/[slug]/feed/`
  - Wired: `https://www.wired.com/author/[slug]/rss`
  - K-12 Dive: `https://www.k12dive.com/editors/[slug]/rss/`
  - IAPP: Manual -- no per-author RSS, but the main feed can be filtered

**Social media monitoring (semi-automated):**
- For Twitter/X: Use the (paid) X API v2 to monitor tweets from tracked journalists containing keywords: "COPPA", "child safety", "kids online", "age verification", "FTC", "privacy", "children"
- For Bluesky: Use the Bluesky AT Protocol API (free) to monitor posts
- Store in a `journalist_social_posts` table: `id`, `journalist_id`, `platform`, `post_url`, `content`, `posted_at`, `is_relevant`, `engagement_count`
- Surface relevant social posts as "engagement opportunities" -- e.g., "Ashley Gold just tweeted about COPPA. Reply with our data?"

**Practical first step:** Before building full automation, add a "Last Checked" field and a manual "Refresh Articles" button that triggers an AI-powered web search for recent articles by that journalist.

---

## Part 2: Contact Finding -- Creative Strategies

### 2.1 Email Discovery Techniques

**Tier 1: Direct sources (highest confidence)**

| Method | How | Success Rate |
|--------|-----|-------------|
| Publication "Contact" / "About" page | Check the journalist's author bio page on their publication's website. Many include email directly. | ~40% for niche publications (IAPP, K-12 Dive), ~10% for major outlets |
| Personal website contact page | Check `[name].com` or the URL in their social bio. Many have contact forms or direct email. | ~30% of journalists who have personal sites |
| Newsletter signup reply | Subscribe to their newsletter and reply to a real email they sent you | 90%+ (you get their actual sending address) |
| Twitter/X DM → ask for email | Send a brief, professional DM saying you have data relevant to their beat and ask for the best email | ~25% response rate for relevant pitches |
| LinkedIn InMail | Send via LinkedIn with a short, value-first message | ~15-20% response rate |
| Conference speaker pages | Check speaker bios at events they've presented at (many include email) | Varies -- check IAPP Global Privacy Summit, RightsCon, etc. |
| FOIA/public records | For government-adjacent reporters, sometimes their contact is in public hearing records | Niche use case |

**Tier 2: Email pattern guessing (medium confidence)**

Common email patterns by publication -- these are the most likely patterns to try:

| Publication | Most Likely Pattern | Example |
|-------------|-------------------|---------|
| TechCrunch | `firstname.lastname@techcrunch.com` | `marina.temkin@techcrunch.com` (confirmed) |
| Axios | `firstname@axios.com` | `ashley@axios.com` or `ashley.gold@axios.com` |
| Washington Post | `firstname.lastname@washpost.com` | `cat.zakrzewski@washpost.com` |
| Wall Street Journal | `firstname.lastname@wsj.com` | `julie.jargon@wsj.com` |
| Wired | `firstname_lastname@wired.com` | `matt_burgess@wired.com` |
| Bloomberg/BNA | `firstname.lastname@bloomberg.net` | `tonya.riley@bloomberg.net` or `bloomberg.com` |
| Ars Technica | `firstname.lastname@arstechnica.com` | `ashley.belanger@arstechnica.com` |
| Semafor | `firstname.lastname@semafor.com` | `reed.albergotti@semafor.com` |
| The Information | `firstname@theinformation.com` | `stephanie@theinformation.com` |
| EdSurge | `firstname@edsurge.com` | `nadia@edsurge.com` |
| K-12 Dive | `firstname.lastname@industrydive.com` | `anna.merod@industrydive.com` |
| Pittsburgh Business Times | `firstname.lastname@bizjournals.com` | `tim.schooley@bizjournals.com` |
| IAPP | `firstname.lastname@iapp.org` | `alex.lacasse@iapp.org` |
| Technical.ly | `firstname@technical.ly` | `alice@technical.ly` |

**Tier 3: Email verification tools**

| Tool | Cost | What It Does |
|------|------|-------------|
| Hunter.io | Free tier: 25 searches/mo; Starter: $49/mo for 500 | Find and verify professional emails by name + domain |
| Apollo.io | Free tier: 600 credits/yr | Email + phone discovery with company data |
| Snov.io | Free tier: 50 credits/mo; $39/mo for 1,000 | Email finder + verifier + drip campaigns |
| Voila Norbert | $49/mo for 1,000 leads | Email finding + verification |
| Clearbit (now part of HubSpot) | Contact sales | Email enrichment tied to company data |

**Recommended approach for Phosra (39 journalists, budget-conscious):**
1. Use Hunter.io free tier to verify guessed email patterns for all 39 journalists
2. For the 10 Tier 1 journalists without emails, manually check personal websites + publication bios
3. For remaining unknowns, use Twitter DMs or LinkedIn InMail
4. Track email confidence level in the database: `verified`, `pattern_guess`, `unverified`, `bounced`

### 2.2 When Direct Email Isn't Available

**Ranked alternative channels:**

1. **Twitter/X DM** -- Still the #1 channel for journalist-founder contact in tech. Send a brief, value-first message. Key: engage with their content first (like/retweet/quote their articles for 1-2 weeks before DMing).
2. **LinkedIn InMail** -- More formal, lower response rate, but leaves a visible profile trail so they can vet you.
3. **Bluesky DM** -- Growing in importance for tech/policy journalists who've left X. Lower volume = higher visibility.
4. **Publication tip line / contact form** -- Many publications have generic tip submission forms. Less personal but gets logged.
5. **Reply to their newsletter** -- If they have a personal newsletter, subscribe and reply to a real issue with a relevant data point. High-quality signal.
6. **Event attendance** -- Attend events where they're speaking (IAPP Global Privacy Summit, CES, RightsCon) and introduce yourself. Best for converting to warm contact.
7. **Mutual introduction** -- Ask your network if anyone knows the journalist. A warm intro from a trusted source is 5-10x more effective than cold outreach.

### 2.3 Getting Attention Without Cold Email

**The "value-first" engagement ladder:**

1. **Week 1-2: Become a visible reader.** Follow on all platforms. Like, thoughtfully reply to, and share their articles. Quote-tweet with a relevant data point from Phosra's research. Don't pitch -- just be valuable.

2. **Week 2-3: Provide unsolicited value.** When they write about a topic Phosra has data on, reply with a relevant stat: "Your point about state-level fragmentation is borne out by the data -- we track 78 laws across 25 jurisdictions and the compliance conflicts are real. Happy to share our mapping if useful." No pitch attached.

3. **Week 3-4: Soft DM.** "I've been following your coverage of [X] -- your piece on [Y] was the most accurate breakdown I've read. I run a compliance infrastructure company in this space and have data on [Z] that might be useful for a future piece. No pitch, just offering to be a resource."

4. **Week 4+: The pitch.** By now they've seen your name, know you're credible, and have a sense that you add value. The cold email is no longer cold.

**This approach should be built into the tool as a "Warm-Up Sequence"** -- a checklist on each journalist profile that tracks: followed on social, engaged with 3+ posts, shared an article, sent value-first DM, ready to pitch.

---

## Part 3: Pitch Tracking -- What's Missing

### 3.1 Beyond Status Tracking

**Currently tracked:** `pitch_status` (draft → ready → sent → opened → replied → interested → declined → covered → no_response), `follow_up_count`, `last_follow_up_at`, `next_follow_up_at`.

**What's missing:**

| Missing Metric | Why It Matters | Implementation |
|---------------|---------------|----------------|
| `email_open_count` | Not just "opened once" -- how many times? Multiple opens = high interest | Gmail pixel tracking (see 3.2) |
| `email_open_timestamps` | When did they open? Morning = checking routine; late night = researching | Array of timestamps from tracking pixel |
| `email_link_clicks` | Did they click through to the PCSS spec? The website? The data? | Tracked link redirects |
| `email_forward_detected` | Did they forward it to an editor? (Sudden spike in opens from new IPs) | Tracking pixel analytics |
| `pitch_version` | Which version of the pitch was sent? A/B testing subject lines and angles | Version field + A/B tracking |
| `subject_line` | Track which subject lines get opens | Already have `pitch_subject` but should analyze performance |
| `send_time` | What time was the pitch sent? Correlate with open rates | Timestamp (already tracked via `created_at`) |
| `send_day_of_week` | Tuesdays and Wednesdays tend to perform best for media pitches | Derived from send timestamp |
| `competitor_mentions` | Did the journalist recently cover a competing product or related startup? | Article monitoring |
| `news_peg_used` | Which news hook was used in the pitch? Track which pegs convert | Free-text or enum field |
| `attachment_included` | Was a press release, data sheet, or other attachment included? | Boolean + file reference |
| `personalization_quality` | AI-scored: how personalized was this pitch? (1-5 scale based on specific article references) | AI analysis of pitch body |

### 3.2 Email Open Tracking Implementation

**Option A: Gmail API + tracking pixel (recommended for a solo founder)**

1. Send pitches through Gmail (which Jake already uses)
2. Embed a 1x1 tracking pixel in each email: `<img src="https://phosra-api.fly.dev/track/open/{pitch_id}/{unique_token}" width="1" height="1" />`
3. The API endpoint logs the open event with timestamp and IP
4. Store in `admin_journalist_pitch_events` table: `id`, `pitch_id`, `event_type` (open, click, bounce), `timestamp`, `ip_address`, `user_agent`
5. Update the pitch record's `email_open_count` and move status to "opened" on first open

**Option B: Use a transactional email service with built-in tracking**

Services like Mailgun, SendGrid, or Postmark provide open/click tracking out of the box. Cost: $15-35/mo for low volume. This is easier but loses the "sent from Jake's personal Gmail" authenticity.

**Option C: Gmail + Mailtrack/Streak (quickest)**

Use a Gmail extension like Mailtrack (free tier), Streak CRM (free tier for basic tracking), or Mixmax. These add tracking pixels automatically. Downside: data lives in the extension, not in Phosra's database.

**Recommended:** Start with Option C (Streak or Mailtrack) for immediate visibility, then build Option A into Phosra as a proper integration.

### 3.3 Follow-Up Reminder System

**Current state:** `next_follow_up_at` field exists but there's no notification system.

**What's needed:**

1. **Dashboard widget:** "Follow-ups due today" card on the main journalists page showing all journalists with `next_follow_up_at <= today`
2. **Auto-scheduling:** When a pitch is sent, automatically set `next_follow_up_at` to +3 business days (configurable per journalist based on their responsiveness)
3. **Smart rescheduling:** If the journalist opens the email (detected via tracking), delay the follow-up by 2 days (they're thinking about it; don't pressure them)
4. **Follow-up template generation:** When the follow-up is due, auto-generate a follow-up draft using AI based on the original pitch + the follow-up cadence rules from `pitch-angle-framework.md` (use a different angle each time)
5. **Escalation:** After 3 follow-ups with no response, automatically move status to `no_response` and remove from active pipeline
6. **Calendar integration:** Sync follow-up dates to Google Calendar so Jake gets native calendar reminders

### 3.4 Metrics That Matter for Measuring Outreach Effectiveness

**Dashboard metrics to add:**

| Metric | Formula | Target |
|--------|---------|--------|
| **Response rate** | (replied + interested) / sent | >15% is good for cold outreach |
| **Coverage rate** | covered / sent | >5% is good |
| **Time to response** | avg(first_reply_date - pitch_sent_date) | Track per beat/tier |
| **Follow-up conversion** | responses that came after follow-up / total follow-ups | Shows if follow-ups work |
| **Open rate** | opened / sent | >40% = good subject lines |
| **Best send time** | open rate by hour of day / day of week | Optimize timing |
| **Best angle** | response rate by pitch angle category | Optimize messaging |
| **Pipeline velocity** | avg time from identified → pitched → covered | Shows overall efficiency |
| **Coverage value** | sum(estimated_reach * phosra_prominence_weight) | Aggregate media impact |
| **Relationship depth** | weighted score: identified=0, researching=1, pitched=2, in_dialogue=3, warm=4, champion=5 | Track relationship portfolio health |

---

## Part 4: Workflow -- What Would Make This 10/10

### 4.1 One-Click Actions on Each Profile

**Add these buttons to the journalist detail page header area:**

| Action | What It Does | Priority |
|--------|-------------|----------|
| **Generate Pitch** | Opens AI pitch generator with journalist context pre-loaded (uses the prompt template from `pitch-angle-framework.md`) | P0 |
| **Send Pitch** | Composes a Gmail draft with the generated pitch, tracking pixel, and proper signature | P1 |
| **Log Activity** | Quick-add a note, call, or DM to the activity timeline without leaving the page | P0 |
| **Research with AI** | Triggers an AI-powered research workflow (see 4.4) that finds recent articles, social posts, and news hooks | P1 |
| **View on Twitter** | Opens their Twitter profile in a new tab | P0 (simple link) |
| **View on LinkedIn** | Opens their LinkedIn profile in a new tab | P0 (simple link) |
| **Copy Email** | Copies their email to clipboard with one click | P0 |
| **Schedule Follow-up** | Sets `next_follow_up_at` with a date picker | P0 |
| **Mark as Pitched** | Updates relationship status + creates activity log entry in one click | P0 |

### 4.2 AI Pitch Generation -- How It Should Work

**Current state:** The `pitch-angle-framework.md` has an excellent AI prompt template, but it's a static document. It's not integrated into the UI.

**How it should work in the tool:**

1. User clicks "Generate Pitch" on a journalist profile
2. A modal opens showing:
   - **Journalist context** (auto-populated): name, publication, beat, recent articles, social handles
   - **Press release selector**: dropdown of available press releases to pitch
   - **Angle selector**: radio buttons for the 7 beat categories (child_safety_regulation, privacy_data_protection, etc.)
   - **Exclusivity toggle**: none / exclusive / embargoed
   - **Ask type**: interview / briefing / embargo / contributed_article / expert_source
   - **Additional context** (free text): any timely hooks or personal notes
3. User clicks "Generate" -- the system calls Claude API with:
   - The system prompt from `pitch-angle-framework.md` Section 5
   - The journalist's profile data, recent articles, and pitch history
   - The selected press release
   - The beat-specific variant instructions
4. Claude generates: subject line + email body + suggested follow-up angle
5. The output appears in the modal with:
   - "Copy to clipboard" button
   - "Open in Gmail" button (pre-composes a Gmail draft via `mailto:` or Gmail API)
   - "Save as draft pitch" button (saves to `admin_journalist_pitches` with status `draft`)
   - "Regenerate" button (tries again with different phrasing)
6. After sending, the pitch is automatically logged as an activity

**Technical implementation:**
- New API route: `POST /api/journalists/[id]/generate-pitch`
- Uses the Anthropic API key already configured in the environment
- Streams the response for real-time display
- Stores the generated pitch in the `admin_journalist_pitches` table

### 4.3 Integrations -- What Would Be Most Valuable

**Ranked by impact/effort ratio:**

| Integration | Impact | Effort | Priority |
|-------------|--------|--------|----------|
| **Gmail send + tracking** | Tracks opens, clicks, replies automatically. Eliminates manual pitch logging. | Medium (Gmail API OAuth) | P1 |
| **Twitter/X profile links** | Simple external links to journalist profiles. Already have handles. | Trivial | P0 |
| **LinkedIn profile links** | Simple external links. Already have URLs. | Trivial | P0 |
| **Google Calendar** | Sync follow-up dates as calendar events. Never miss a follow-up. | Low (Google Calendar API) | P2 |
| **RSS article ingestion** | Auto-update journalist profiles with their latest articles. | Medium (RSS parser + cron) | P1 |
| **Claude API pitch generation** | AI-generated personalized pitches. Already have the prompt templates. | Medium (API integration) | P0 |
| **Twitter/X monitoring** | Track when journalists tweet about relevant topics. Surface engagement opportunities. | Medium-High (X API v2, paid) | P2 |
| **Bluesky monitoring** | Free API, growing journalist adoption. | Medium | P3 |
| **Hunter.io email verification** | Verify guessed emails before sending. Avoid bounces. | Low (simple API call) | P2 |
| **Slack notifications** | "Ashley Gold just published a COPPA article" sent to a Slack channel. | Low | P3 |

### 4.4 "Research with AI" Feature -- How It Should Work

This is the highest-leverage feature for a solo founder. Here's the spec:

**Trigger:** User clicks "Research with AI" on a journalist profile.

**What happens:**

1. System sends the journalist's name, publication, beat, and social handles to Claude
2. Claude generates a structured research prompt that would find:
   - Their 5 most recent articles (titles, URLs, dates)
   - Their Twitter/Bluesky activity in the last 30 days related to child safety, COPPA, privacy
   - Any recent podcast appearances or speaking engagements
   - Their stated opinions on child safety regulation (supportive? skeptical? nuanced?)
   - Any mutual connections with Jake or Phosra's network
   - The best pitch angle based on their recent coverage
3. The system executes web searches (using the same approach as the legislation scanner: Claude API with web search tool)
4. Results are structured and saved to the journalist profile:
   - `recent_articles` JSONB array is updated
   - A research summary is saved to the `notes` field (or a new `ai_research_summary` field)
   - An activity log entry is created: "AI research completed"
5. A "Research Results" card appears on the journalist detail page showing:
   - Summary of findings
   - Recommended pitch angle (with reasoning)
   - Suggested subject line
   - Key talking points based on their recent coverage
   - Confidence score (how much relevant coverage did they find?)

**Technical implementation:**
- New API route: `POST /api/journalists/[id]/research`
- Uses Claude API with tool_use for web search
- Caches results for 7 days (journalist coverage doesn't change hourly)
- Add `last_researched_at` and `ai_research_summary` fields to the journalist table

### 4.5 Dashboards/Views a PR Person Would Want

**Current views:** Directory (table), Pitch Pipeline (filtered table), Coverage (empty placeholder).

**Missing views:**

1. **"Today" Dashboard** (should be the default landing view)
   - Follow-ups due today (with one-click "snooze" or "mark done")
   - Recent journalist activity (articles published, tweets about relevant topics)
   - Pitches waiting for response (sent > 3 days ago, no reply)
   - Coverage published this week
   - Quick stats: pitches sent this week, response rate, coverage rate

2. **Pipeline Board View** (Kanban-style, like Trello/Linear)
   - Columns: Identified | Researching | Pitched | In Dialogue | Warm Contact | Champion
   - Drag-and-drop to change status
   - Cards show: name, publication, tier badge, days since last contact, next follow-up date
   - Click card to open profile

3. **Outreach Calendar** (calendar view)
   - Shows: scheduled follow-ups, pitch send dates, embargo dates, exclusive deadlines
   - Color-coded by tier
   - Click a day to see all activities for that day

4. **Coverage Report** (for sharing with investors/advisors)
   - Total coverage pieces with links
   - Estimated total reach
   - Breakdown by publication tier and tone
   - Key messages that appeared in coverage
   - "Media kit" export: PDF or shareable link with all coverage clips

5. **Analytics Dashboard**
   - Response rate over time
   - Best-performing pitch angles
   - Best send times (day of week, time of day)
   - Pipeline conversion funnel: identified → pitched → responded → covered
   - Tier 1 vs Tier 2 vs Tier 3 performance comparison

---

## Part 5: Data Quality -- Current Profile Gaps

### 5.1 Audit of Current 39 Journalist Profiles

**Systematic gaps across almost all profiles:**

| Data Gap | How Many Affected | Severity |
|----------|------------------|----------|
| **No email address** | ~30 of 39 (only Marina Temkin and Sarah Perez have confirmed emails) | CRITICAL -- can't pitch without email |
| **No article URLs** | All 39 (recent_articles in the markdown have titles but many lack URLs) | HIGH -- can't verify coverage or reference specific pieces |
| **No Bluesky handle** | All 39 (field doesn't even exist in the data model) | MEDIUM -- growing platform for journalists |
| **No personal site URL** | ~35 of 39 | MEDIUM -- key for email discovery |
| **No photo** | All 39 (field doesn't exist in data model) | LOW-MEDIUM -- humanization |
| **No location** | All 39 (field doesn't exist) | MEDIUM -- timezone/event planning |
| **No audience size estimate** | All 39 (field doesn't exist) | MEDIUM -- prioritization |
| **Vague contact methods** | ~25 say "Via [publication]" or "Via [outlet] editorial" -- not actionable | HIGH -- these are not real contact methods |

### 5.2 Profile-by-Profile Priority Fixes

**Tier 1 journalists (must fix immediately):**

1. **Ashley Gold (Axios)** -- Missing: email (try ashley.gold@axios.com), Bluesky handle, recent article URLs. The markdown has Twitter but no other contact.

2. **Casey Newton (Platformer)** -- Missing: email (try casey@platformer.news -- he runs the publication). Has Mastodon handle listed. Missing Bluesky.

3. **Cristiano Lima-Strong (TechPolicy.Press)** -- Missing: email (try cristiano@techpolicy.press or clstrong@techpolicy.press). Contact listed as "Via TechPolicy.Press editorial" which is not actionable.

4. **Tonya Riley (Bloomberg Law)** -- Missing: email (try tonya.riley@bloomberg.net or tronya.riley@bloombergindustry.com). Contact listed as "Via Bloomberg Law" which is not actionable.

5. **Alex LaCasse (IAPP)** -- Missing: email (try alex.lacasse@iapp.org). Contact listed as "Via IAPP editorial."

6. **Anna Merod (K-12 Dive)** -- Missing: email (try anna.merod@industrydive.com). Contact listed as "Via K-12 Dive editorial."

7. **Alice Crow (Technical.ly Pittsburgh)** -- Missing: email (try alice@technical.ly). Has LinkedIn listed.

8. **Maria Curi (Axios)** -- Missing: email (try maria.curi@axios.com or maria@axios.com). Has Twitter.

9. **Suzanne Smalley (The Record)** -- Missing: email. Has Twitter and Bluesky.

10. **Justin Hendrix (Tech Policy Press)** -- Missing: email (try justin@techpolicy.press). CEO/Editor so likely reachable.

11. **Anna Edgerton (Bloomberg)** -- Missing: email (try anna.edgerton@bloomberg.net). Contact listed as "Via Bloomberg."

### 5.3 What Makes Each Profile Feel Complete and Actionable

A "complete" profile should have:

- [ ] Verified email OR confirmed alternative contact channel
- [ ] At least 3 recent articles with working URLs (published in last 6 months)
- [ ] At least 2 social handles (Twitter + one other)
- [ ] Personal website URL (if they have one)
- [ ] At least 1 pitch angle with specific article reference
- [ ] Location and timezone
- [ ] Email confidence level (verified / guessed / unknown)
- [ ] Notes on their editorial preferences (exclusives? embargoes? preferred pitch length?)
- [ ] Mutual connections identified (if any)

**Completion scoring:** Show a "Profile Completeness" percentage on each card in the directory view. This gamifies data entry and makes gaps visible at a glance.

### 5.4 Handling Journalists Who Change Publications

**Current problem:** The data model has a single `publication` field. When Lauren Feiner moved from The Verge to Epic Games, or when Makena Kelly moved from The Verge to Wired, the profile needs to track both the current and previous publication.

**Solution:**

1. Add a `previous_publications` JSONB array: `[{ publication: "The Verge", title: "Senior Policy Reporter", from: "2022-01", to: "2025-06" }]`
2. Add a `publication_verified_at` timestamp -- when was their current role last confirmed?
3. Add a `publication_status` enum: `active` | `moved` | `unknown` | `freelance`
4. Build a quarterly "Stale Profile Check" workflow:
   - Flag profiles where `publication_verified_at` is > 90 days old
   - For flagged profiles, trigger an AI research check to verify current role
   - Surface stale profiles in a "Needs Verification" dashboard widget

---

## Part 6: Implementation Priority Roadmap

### Phase 1: "Make It Useful Today" (1-2 weeks)

These are changes that make the tool immediately more usable with minimal engineering:

1. **Add one-click social links** to the journalist detail page header (Twitter, LinkedIn, personal site) -- just render the existing handles as clickable external links
2. **Add "Copy Email" button** next to the email field
3. **Add "Follow-ups Due" widget** to the main journalists page -- query `WHERE next_followup_at <= NOW()` and show as a card above the directory
4. **Add profile completeness indicator** -- calculate percentage based on filled fields, show on directory cards
5. **Add bulk email pattern guess** -- button that auto-generates email guesses based on publication patterns for all journalists without emails
6. **Add missing fields to the DB schema:** `bluesky_handle`, `mastodon_handle`, `personal_site_url`, `location`, `photo_url`, `email_confidence` (enum: verified/guessed/unknown), `email_source`, `previous_publications` (JSONB)

### Phase 2: "AI-Powered Intelligence" (2-4 weeks)

7. **Build the AI pitch generator** -- integrate Claude API with the prompt template from `pitch-angle-framework.md`, add modal UI to the journalist detail page
8. **Build the "Research with AI" feature** -- web search + structured output saved to the profile
9. **Add the "Today" dashboard** as the default landing view with follow-ups, recent activity, and pipeline stats
10. **Add article URL auto-discovery** -- when a journalist profile is opened, offer to search for URLs matching the article titles already listed

### Phase 3: "Automated Pipeline" (4-8 weeks)

11. **Gmail integration** -- OAuth connection, send from Gmail, open/click tracking
12. **RSS article monitoring** -- daily cron that fetches new articles and scores them for relevance
13. **Pipeline Kanban board** -- drag-and-drop view of the relationship pipeline
14. **Analytics dashboard** -- response rates, best angles, send time optimization
15. **Smart follow-up automation** -- auto-generate follow-up drafts, auto-schedule based on pitch-angle-framework.md cadence rules

### Phase 4: "Best-in-Class" (8-12 weeks)

16. **Social media monitoring** -- track journalist tweets/posts about relevant topics
17. **Coverage report generator** -- exportable PDF/link with all coverage clips and metrics
18. **Warm-up sequence tracker** -- per-journalist checklist for the value-first engagement ladder
19. **Calendar integration** -- sync follow-ups and embargo dates to Google Calendar
20. **Email A/B testing** -- track subject line performance across pitches

---

## Part 7: Database Schema Additions

```sql
-- Add missing columns to admin_journalists
ALTER TABLE admin_journalists ADD COLUMN IF NOT EXISTS bluesky_handle VARCHAR(255);
ALTER TABLE admin_journalists ADD COLUMN IF NOT EXISTS mastodon_handle VARCHAR(255);
ALTER TABLE admin_journalists ADD COLUMN IF NOT EXISTS personal_site_url VARCHAR(500);
ALTER TABLE admin_journalists ADD COLUMN IF NOT EXISTS newsletter_url VARCHAR(500);
ALTER TABLE admin_journalists ADD COLUMN IF NOT EXISTS podcast_name VARCHAR(255);
ALTER TABLE admin_journalists ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500);
ALTER TABLE admin_journalists ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE admin_journalists ADD COLUMN IF NOT EXISTS estimated_audience_size INTEGER;
ALTER TABLE admin_journalists ADD COLUMN IF NOT EXISTS publication_domain_authority INTEGER;
ALTER TABLE admin_journalists ADD COLUMN IF NOT EXISTS email_confidence VARCHAR(20) DEFAULT 'unknown'
    CHECK (email_confidence IN ('verified', 'pattern_guess', 'unknown', 'bounced'));
ALTER TABLE admin_journalists ADD COLUMN IF NOT EXISTS email_source VARCHAR(100);
ALTER TABLE admin_journalists ADD COLUMN IF NOT EXISTS previous_publications JSONB NOT NULL DEFAULT '[]';
ALTER TABLE admin_journalists ADD COLUMN IF NOT EXISTS publication_verified_at TIMESTAMPTZ;
ALTER TABLE admin_journalists ADD COLUMN IF NOT EXISTS publication_status VARCHAR(20) DEFAULT 'active'
    CHECK (publication_status IN ('active', 'moved', 'unknown', 'freelance'));
ALTER TABLE admin_journalists ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE admin_journalists ADD COLUMN IF NOT EXISTS ai_research_summary TEXT;
ALTER TABLE admin_journalists ADD COLUMN IF NOT EXISTS last_researched_at TIMESTAMPTZ;
ALTER TABLE admin_journalists ADD COLUMN IF NOT EXISTS warmup_stage VARCHAR(20) DEFAULT 'none'
    CHECK (warmup_stage IN ('none', 'following', 'engaging', 'dm_sent', 'ready_to_pitch'));

-- New table: article monitoring (replaces JSONB array for scalability)
CREATE TABLE admin_journalist_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journalist_id UUID NOT NULL REFERENCES admin_journalists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    published_at TIMESTAMPTZ,
    summary TEXT,
    is_relevant BOOLEAN DEFAULT FALSE,
    relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 100),
    relevance_reason TEXT,
    source VARCHAR(50) DEFAULT 'manual'
        CHECK (source IN ('manual', 'rss', 'ai_research', 'web_search')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_journalist_articles_journalist ON admin_journalist_articles(journalist_id, published_at DESC);
CREATE INDEX idx_journalist_articles_relevant ON admin_journalist_articles(journalist_id) WHERE is_relevant = TRUE;

-- New table: email open/click tracking
CREATE TABLE admin_journalist_pitch_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pitch_id UUID NOT NULL REFERENCES admin_journalist_pitches(id) ON DELETE CASCADE,
    event_type VARCHAR(20) NOT NULL
        CHECK (event_type IN ('open', 'click', 'bounce', 'reply', 'forward')),
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    link_url TEXT,
    metadata JSONB
);

CREATE INDEX idx_pitch_events_pitch ON admin_journalist_pitch_events(pitch_id, event_timestamp DESC);

-- New table: social media posts monitoring
CREATE TABLE admin_journalist_social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journalist_id UUID NOT NULL REFERENCES admin_journalists(id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL
        CHECK (platform IN ('twitter', 'bluesky', 'mastodon', 'linkedin', 'threads')),
    post_url TEXT,
    content TEXT,
    posted_at TIMESTAMPTZ,
    is_relevant BOOLEAN DEFAULT FALSE,
    engagement_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_social_posts_journalist ON admin_journalist_social_posts(journalist_id, posted_at DESC);
CREATE INDEX idx_social_posts_relevant ON admin_journalist_social_posts(journalist_id) WHERE is_relevant = TRUE;
```

---

## Part 8: Competitive Comparison

### What the Best Tools Do That Phosra's Tool Doesn't (Yet)

| Feature | Muck Rack | Cision | Prowly | JustReachOut | Phosra (current) | Phosra (proposed) |
|---------|-----------|--------|--------|-------------|-----------------|------------------|
| Journalist database | 1M+ profiles | 1.6M+ profiles | 1M+ | 5K+ curated | 39 curated | 39 curated (quality > quantity) |
| Email finding | Built-in | Built-in | Built-in | AI-powered | Manual | Pattern guess + Hunter.io |
| Article monitoring | Real-time | Real-time | RSS + AI | AI alerts | Manual | RSS + AI |
| Social monitoring | Twitter/X | Multi-platform | Multi-platform | No | None | Twitter + Bluesky |
| AI pitch generation | No | Basic | AI assistant | AI-powered | Prompt template (doc only) | Claude API integrated |
| Email send + tracking | Gmail integration | Built-in | Built-in | Gmail | None | Gmail API |
| Pipeline/CRM | Full CRM | Full CRM | CRM + timeline | Basic | Basic CRM | Enhanced CRM |
| Analytics | Comprehensive | Comprehensive | Good | Basic | Minimal | Phase 3 |
| Pricing | $10K+/yr | $5K-20K+/yr | $300-700/mo | $99-399/mo | Free (internal) | Free (internal) |

**Phosra's advantage:** The tool is purpose-built for Phosra's specific 39-journalist target list, not a generic media database. It can be deeply customized. The AI pitch generation uses Phosra's own pitch framework and company data, which is far more specific than any generic tool. The cost is $0 beyond Claude API usage.

**The key insight:** Phosra doesn't need to compete with Muck Rack on database size. It needs to compete on *intelligence per journalist* -- knowing more about each of its 39 targets than Muck Rack knows about any single journalist in its database.

---

## Summary: The 10/10 Vision

A 10/10 journalist outreach tool for Phosra would mean:

1. **Opening any journalist profile gives you everything:** photo, social links, recent articles with URLs, AI-generated briefing, complete interaction history, and a recommended next action.

2. **Generating a pitch takes 30 seconds:** Select the journalist, select the press release, select the angle, click "Generate." Claude produces a personalized, beat-matched pitch using the journalist's recent coverage. Click "Send via Gmail" to deliver it.

3. **You never forget a follow-up:** Follow-ups are auto-scheduled, surface on the "Today" dashboard, and include AI-generated follow-up drafts with shifted angles per the cadence rules.

4. **The tool tells you when to act:** "Ashley Gold just published a COPPA article. Here's a suggested reply with Phosra data." "Your pitch to Tonya Riley was opened 3 times but no reply -- send follow-up 2 with the compliance data angle."

5. **Every pitch is tracked end-to-end:** Sent, opened, clicked, replied, covered. Response rates by angle, by beat, by send time. You know what works.

6. **Data stays fresh without manual work:** RSS monitoring surfaces new articles. AI research refreshes profiles quarterly. Stale contacts are flagged automatically.

The current tool is a solid 7/10 -- well-structured data, clean UI, excellent strategic framework. The path to 10/10 is: integrate the AI pitch generation, add the intelligence layer (article monitoring + research), and build the workflow automation (follow-ups + tracking). The pitch-angle-framework.md is excellent strategy -- the tool just needs to make that strategy executable with one click.
