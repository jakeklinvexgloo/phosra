# Pre-Launch Checklist

## GitHub Repo Readiness

- [ ] `pcss-spec` repo is public at `github.com/jakeklinvexgloo/pcss-spec`
- [ ] README includes: spec overview, data model summary, quickstart, CC-BY-4.0 badge
- [ ] `law-registry.json` exported and committed (67 laws, machine-readable)
- [ ] `rule-categories.json` with all 45 categories and descriptions
- [ ] LICENSE file present (CC-BY-4.0)
- [ ] CONTRIBUTING.md with guidelines for law submissions
- [ ] At least 1 GitHub Release / tag (e.g., `v1.0.0`)
- [ ] No secrets, API keys, or internal references in the repo
- [ ] Repo description and topics set (e.g., `child-safety`, `compliance`, `open-standard`)

## Blog Post Review

- [ ] Blog post live at `www.phosra.com/blog/pcss-v1`
- [ ] Title is specific and technical, not marketing-heavy
- [ ] Includes actual data: 67 laws, 45 rule categories, 7 jurisdiction groups
- [ ] Architecture diagram or data model illustration included
- [ ] Links to GitHub repo, compliance checker, and API
- [ ] No broken links or placeholder text
- [ ] Open Graph / meta tags set for good HN preview card
- [ ] Read through once aloud for tone (technical, not salesy)

## Compliance Checker Testing

- [ ] Checker live at `www.phosra.com/check`
- [ ] Selecting a jurisdiction filters laws correctly
- [ ] Selecting a platform category shows relevant rule categories
- [ ] Results display law names, statuses, and rule categories
- [ ] Mobile responsive -- HN readers will test on phones
- [ ] No loading errors, no blank states for valid inputs
- [ ] Edge case: selecting all jurisdictions returns all 67 laws

## API Sandbox Verification

- [ ] `GET /api/compliance/laws` returns 67 laws (no auth required)
- [ ] `GET /api/compliance/laws?jurisdiction=us-federal` filters correctly
- [ ] `GET /api/compliance/laws?status=enacted` filters correctly
- [ ] `GET /api/compliance/laws/kosa` returns single law detail
- [ ] `GET /api/compliance/map` returns rule category -> law mapping
- [ ] All routes return proper JSON with correct Content-Type headers
- [ ] No auth headers required (verified: routes read from in-memory registry, no middleware)

**API Auth Status:** All three compliance API routes (`/api/compliance/laws`, `/api/compliance/laws/[lawId]`, `/api/compliance/map`) are PUBLIC. They read directly from the in-memory `LAW_REGISTRY` array with no authentication middleware, no session checks, and no API key requirements. No modifications needed.

## HN Comment Prepared

- [ ] First comment saved in `hn-launch/first-comment.md`
- [ ] All numbers verified against source code (67 laws, 45 categories, 7 groups, 5 platform categories)
- [ ] Links are correct and live (GitHub, checker, blog post)
- [ ] Tone check: reads like an engineer, not a marketer
- [ ] No "we're excited" or "game-changing" language

## Timing Recommendation

- **Best days:** Tuesday, Wednesday, or Thursday
- **Best time:** 8:00-9:30 AM ET (when US East Coast + Europe are both active)
- **Avoid:** Fridays (low engagement), weekends, US holidays, major tech news days
- **Format:** Post the blog URL as a regular link, not a Show HN (unless linking directly to the GitHub repo)
- **Recommended:** Tuesday or Wednesday at ~8:30 AM ET

## First 6 Hours Response Plan

### Hour 0-1: Post + Monitor
- [ ] Submit the link to HN
- [ ] Post the prepared first comment immediately (within 60 seconds)
- [ ] Set a timer to check HN every 15 minutes
- [ ] Have the objection response playbook open (`hn-launch/objection-responses.md`)

### Hour 1-3: Active Engagement
- [ ] Reply to every substantive comment within 30 minutes
- [ ] For technical questions: give specific data (law counts, category names, API endpoints)
- [ ] For "this is just marketing" comments: point to CC-BY-4.0 license and GitHub repo
- [ ] For "does this work" comments: share live API curl commands they can try
- [ ] Do NOT argue with trolls. One factual reply, then move on
- [ ] If on the front page: tweet/post the HN link for additional upvotes from your network

### Hour 3-6: Sustained Presence
- [ ] Check every 30 minutes
- [ ] Reply to new threads, especially technical deep-dives
- [ ] If someone files a GitHub issue or PR on the spec repo: respond immediately (this is gold)
- [ ] Track which objections come up -- update the playbook for next time
- [ ] If the post gains traction: consider a follow-up "Author here" edit with additional context

### Post-Launch (6-24 hours)
- [ ] Continue checking hourly
- [ ] Write down any feedback that should inform spec v1.1
- [ ] Thank anyone who contributed constructive criticism
- [ ] If a prominent commenter engages positively, consider reaching out directly
