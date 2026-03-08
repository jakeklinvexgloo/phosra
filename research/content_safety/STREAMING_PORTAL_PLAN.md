# Streaming Content Safety Portal — FINAL Implementation Plan

> Synthesized from 5-agent debate: Architect, Navigator, Data-Modeler, Critic, Synthesizer
> Date: 2026-02-28

## Executive Summary

Build a Streaming Content Safety Portal at `/streaming-safety` as a sibling to the existing `/ai-safety` portal. The streaming research data (per-profile x per-category with evidence screenshots) is fundamentally different from AI chatbot data (per-platform x per-prompt with response text), so it gets its own type file and loader. However, the scoring system (0-4 scale, letter grades, grade caps from critical failures) and UI patterns (SubNav, layout structure, grade color utilities) are shared. Phase 1 ships 3 platforms (Netflix, Peacock, Prime Video) with a hub page, platform detail pages, a compare page, and a methodology page. Navigation is updated with a "Research" dropdown in the header linking both portals. This is ~18 files, shippable in a focused sprint.

---

## 1. Architecture Decision Records

### ADR-1: Navigation — Sibling Route with Research Dropdown

**Decision:** Keep `/ai-safety` as-is. Add `/streaming-safety` as a sibling route. Replace the "AI Safety" link in `PublicPageHeader` with a "Research" dropdown.

**Rationale:**
- `/ai-safety` is live, externally linked, and has SEO value. Moving it to `/research/ai-chatbots` breaks links and gains nothing for Phase 1.
- We only have 2 research verticals — a `/research` hub with 2 cards is underwhelming.
- A dropdown in the header is a ~40-line change that immediately communicates "we have two research portals."
- Defer the full `/research/*` restructuring until a 3rd vertical arrives (social media, gaming).

**Implementation in `PublicPageHeader.tsx`:**

Current `NAV_LINKS` array (line 10-19) has `{ href: "/ai-safety", label: "AI Safety" }`. Replace with a dropdown item. The dropdown uses the same hover/click pattern as the existing user menu. `isNavActive` returns true when pathname starts with `/ai-safety` or `/streaming-safety`.

Mobile nav: show both links under a "Research" section header.

### ADR-2: Types — Separate Type File, Shared Scoring Utilities

**Decision:** Create `web/src/lib/streaming-research/streaming-data-types.ts` with streaming-specific interfaces. Extract grade color utilities to `web/src/lib/shared/grade-colors.ts` for reuse.

**Rationale:**
- Streaming data shape (profiles -> categories -> scores with evidence arrays, critical failure overrides) is structurally incompatible with chatbot shape (prompts -> responses -> scores per platform).
- Forcing both into one type hierarchy creates awkward discriminated unions and runtime checks.
- The grade display system (0-4 scale, letter grades A+ through F, grade-to-color mapping) IS shared.

**Shared utilities to extract:**
- `web/src/app/ai-safety/_components/chat/grade-colors.ts` -> move to `web/src/lib/shared/grade-colors.ts`, re-export from original location for backward compat.
- Create `web/src/lib/shared/scoring.ts` with `scoreToGrade()` function.

### ADR-3: Routing — Mirror AI Safety Structure Exactly

**Decision:** The streaming portal mirrors `/ai-safety`'s proven route and component architecture.

```
/streaming-safety              -> Hub page (server component + client component)
/streaming-safety/compare      -> Side-by-side comparison
/streaming-safety/methodology  -> Testing framework explanation
/streaming-safety/[platformId] -> Platform detail page
```

Each route follows the same pattern: `page.tsx` is a server component that calls a loader, builds serializable summaries, and passes them to a `*Client.tsx` component. SubNav tabs: Portal, Compare, Methodology. Layout wraps with `PublicPageHeader`, `SubNav`, `Footer`.

### ADR-4: Hub Page Layout — Platform x Profile Matrix

**Decision:** Hub page shows a matrix with platform rows and profile columns (Child 7, Child 12, Teen 16, Overall), each cell showing a letter grade badge. Below the matrix: highlighted critical findings and platform summary cards.

**Rationale:**
- The per-profile dimension is THE key differentiator from AI chatbot research.
- Parents want to know: "Is Netflix safe for my 7-year-old?" — this requires per-profile grades.
- A Platform x Category heatmap (like AI Safety) would need 27 cells per platform (3 profiles x 9 categories) — too dense for a hub page. That detail belongs on the platform detail page.

### ADR-5: Platform Detail — Profile Tabs with Category Score Grid

**Decision:** Platform detail uses horizontal tabs: Summary, Child (7), Child (12), Teen (16). Each profile tab shows a 9-category score grid with expandable findings.

**Rationale:**
- Side-by-side of all 3 profiles is too wide on mobile.
- Tabs are proven — AI Safety platform detail uses dimension tabs (7 dimensions) with the same pattern.
- The "Summary" tab shows the cross-profile comparison matrix and platformNotes.

---

## 2. Data Normalization

### JSON Format Differences

The three existing JSON files have different structures that the loader must normalize:

| Aspect | Netflix | Peacock / Prime Video |
|--------|---------|----------------------|
| Profile definitions | `profilesUsed` (metadata only) | `profiles` with nested `results` |
| Test results | Flat `testResults[]` array with `profile` field | Nested under `profiles.{name}.results.{testId}` |
| Critical failures key | `criticalFindings` | `criticalFailures` |
| Existing scorecard | `scoreSummary` + `platform_scorecard.json` | None (computed) |
| Multi-profile tests | DU-01 covers 3 profiles in one entry | One entry per profile |

**Recommended approach:** Normalize at loader time. The loader detects the format and transforms both variants into the canonical `StreamingPlatformData` shape. This avoids modifying the raw research data files.

Key normalization logic:
1. If `testResults` array exists (Netflix format): group by `profile` field, map to per-profile results.
2. If `profiles.{name}.results` exists (Peacock/PV format): iterate profiles, expand each `results` object.
3. Netflix DU-01/DU-02 tests cover multiple profiles — split into per-profile entries or store as platform-level findings.
4. Unify `criticalFindings` / `criticalFailures` into one `criticalFailures` array.

---

## 3. Phase 1 — MVP File Inventory

### 3.1 New Files to Create

```
web/src/lib/shared/
├── grade-colors.ts                          # Extracted from ai-safety/_components/chat/grade-colors.ts
└── scoring.ts                               # scoreToGrade(), shared 0-4 scale logic

web/src/lib/streaming-research/
├── streaming-data-types.ts                  # All TypeScript interfaces
├── loaders.ts                               # loadStreamingPlatform(), loadAllStreamingPlatforms()
└── scoring.ts                               # computeProfileGrade(), computePlatformGrade()

web/src/app/streaming-safety/
├── layout.tsx                               # PublicPageHeader + SubNav + Footer
├── page.tsx                                 # Hub page server component
├── compare/
│   └── page.tsx                             # Compare page server component
├── methodology/
│   └── page.tsx                             # Testing methodology (static)
├── [platformId]/
│   └── page.tsx                             # Platform detail server component
└── _components/
    ├── SubNav.tsx                            # Portal, Compare, Methodology tabs
    ├── StreamingHubClient.tsx                # Hub matrix + findings + platform cards
    ├── PlatformDetailClient.tsx              # Profile tabs + category grids
    ├── CompareClient.tsx                     # Side-by-side platform comparison
    ├── ProfileScoreCard.tsx                  # Compact profile grade + key stats
    ├── CategoryResultRow.tsx                 # Single category: score badge + description + evidence
    └── CriticalFailureBanner.tsx             # Prominent CFO alert
```

### 3.2 Files to Modify

| File | Change |
|------|--------|
| `web/src/components/layout/PublicPageHeader.tsx` | Replace "AI Safety" link with "Research" dropdown |
| `web/src/app/ai-safety/_components/chat/grade-colors.ts` | Re-export from `lib/shared/grade-colors.ts` |

### 3.3 Route Table

| Route | Server Page | Client Component | Loader |
|-------|-------------|-----------------|--------|
| `/streaming-safety` | `page.tsx` | `StreamingHubClient` | `loadAllStreamingPlatforms()` |
| `/streaming-safety/[platformId]` | `[platformId]/page.tsx` | `PlatformDetailClient` | `loadStreamingPlatform(id)` |
| `/streaming-safety/compare` | `compare/page.tsx` | `CompareClient` | `loadAllStreamingPlatforms()` |
| `/streaming-safety/methodology` | `methodology/page.tsx` | (none, static) | (none) |

### 3.4 SubNav Configuration

```typescript
const TABS = [
  { label: "Portal", href: "/streaming-safety" },
  { label: "Compare", href: "/streaming-safety/compare" },
  { label: "Methodology", href: "/streaming-safety/methodology" },
] as const
```

---

## 4. TypeScript Data Model

```typescript
// web/src/lib/streaming-research/streaming-data-types.ts

/** Score labels matching the 0-4 scale */
export type StreamingScoreLabel =
  | "Full Block"
  | "Partial Block"
  | "Soft Barrier"
  | "Unprotected"
  | "Full Block / N/A"
  | "N/A"
  | "Not Testable"

/** Profile types in streaming platform testing */
export type StreamingProfileType = "kids" | "teen" | "standard" | "adult"

/** A single test result for one category on one profile */
export interface StreamingTestResult {
  testId: string                      // "PE-01", "SD-01", etc.
  category: string                    // "Profile Escape", "Search & Discovery"
  weight: number                      // 2-5 severity weight
  score: number | null                // 0-4 (null = not testable)
  label: StreamingScoreLabel
  description: string                 // Detailed finding
  evidence: string[]                  // Screenshot filenames
  cfoTriggered?: string               // "CFO-2" if critical failure
  cfoEffect?: string                  // "Grade capped at D"
}

/** Results for a single profile on a platform */
export interface StreamingProfileResult {
  profileId: string                   // "TestChild7", "TestChild12", "TestTeen16"
  profileType: StreamingProfileType
  maturitySetting: string             // "Family (TVPG, PG)"
  notes?: string                      // "Identical to TestChild7..."
  tests: StreamingTestResult[]
  // Computed at load time:
  weightedScore: number               // 0-100 (higher = safer)
  overallGrade: string                // Letter grade A+ through F
  gradeCap?: string                   // e.g., "D" if CFO triggered
  gradeCapReasons?: string[]
  criticalFailureCount: number
}

/** Platform-level critical failure override */
export interface StreamingCriticalFailure {
  cfoId: string                       // "CFO-2"
  description: string
  affectedProfiles: string[]
  gradeCap: string                    // "D"
  testId: string                      // "PE-01"
  score: number
  evidence?: string
}

/** Full platform research data (loaded + computed) */
export interface StreamingPlatformData {
  platformId: string                  // "netflix", "peacock", "prime_video"
  platformName: string                // "Netflix", "Peacock", "Prime Video"
  testDate: string
  tester: string
  frameworkVersion?: string
  profiles: StreamingProfileResult[]
  criticalFailures: StreamingCriticalFailure[]
  platformNotes: Record<string, string>
  crossPlatformComparison?: Record<string, Record<string, string>>
  // Computed:
  overallGrade: string                // Worst profile grade
  overallScore: number                // Min of profile scores
}

/** Hub page summary (subset for serialization to client) */
export interface StreamingPlatformSummary {
  platformId: string
  platformName: string
  overallGrade: string
  overallScore: number
  testDate: string
  criticalFailureCount: number
  profileGrades: {
    profileId: string
    profileType: StreamingProfileType
    grade: string
    score: number
    isCapped: boolean
    criticalFailureCount: number
  }[]
}

/** Test category metadata (for column headers) */
export interface StreamingTestCategory {
  id: string
  category: string
  shortLabel: string
  weight: number
  description: string
}

/** The canonical set of 9 test categories */
export const STREAMING_TEST_CATEGORIES: StreamingTestCategory[] = [
  { id: "PE-01", category: "Profile Escape", shortLabel: "Profile Esc.", weight: 5,
    description: "Can a child switch to an unrestricted profile?" },
  { id: "SD-01", category: "Search & Discovery", shortLabel: "Search", weight: 5,
    description: "Can mature content be found via search?" },
  { id: "DU-01", category: "Direct URL / Deep Link", shortLabel: "Direct URL", weight: 3,
    description: "Can mature content be accessed via direct URL?" },
  { id: "KM-01", category: "Kids Mode Escape", shortLabel: "Kids Mode", weight: 3,
    description: "Can children escape the restricted browsing experience?" },
  { id: "RL-01", category: "Recommendation Leakage", shortLabel: "Rec. Leak", weight: 4,
    description: "Does mature content appear in recommendations?" },
  { id: "CB-01", category: "Cross-Profile Bleed", shortLabel: "X-Profile", weight: 3,
    description: "Does watch history bleed across profiles?" },
  { id: "CG-01", category: "Content Rating Gaps", shortLabel: "Rating Gaps", weight: 2,
    description: "Are content ratings displayed accurately?" },
  { id: "PL-01", category: "PIN/Lock Bypass", shortLabel: "PIN/Lock", weight: 4,
    description: "Can PIN/password protections be bypassed?" },
  { id: "MF-01", category: "Maturity Filter Effectiveness", shortLabel: "Maturity", weight: 4,
    description: "Overall maturity filter effectiveness" },
]

/** Platform registry */
export const STREAMING_PLATFORM_IDS = ["netflix", "peacock", "prime_video"] as const
export type StreamingPlatformId = (typeof STREAMING_PLATFORM_IDS)[number]

export const STREAMING_PLATFORM_NAMES: Record<StreamingPlatformId, string> = {
  netflix: "Netflix",
  peacock: "Peacock",
  prime_video: "Prime Video",
}

/** Score label map */
export const STREAMING_SCORE_LABELS: Record<number, string> = {
  0: "Full Block",
  1: "Partial Block",
  2: "Soft Barrier",
  3: "Unprotected",
  4: "Facilitated",
}
```

---

## 5. Scoring Algorithm

### Per-Profile Grade

```typescript
function computeProfileGrade(tests: StreamingTestResult[]): {
  score: number; grade: string; capped: boolean
} {
  // Filter out null scores (not testable)
  const scorable = tests.filter(t => t.score !== null)
  const totalWeight = scorable.reduce((sum, t) => sum + t.weight, 0)
  const weightedSum = scorable.reduce((sum, t) => sum + (t.score! * t.weight), 0)
  const weightedAvg = weightedSum / totalWeight          // 0.0 (perfect) to 4.0 (worst)

  // Convert to 0-100 scale (higher = safer)
  const rawScore = ((4 - weightedAvg) / 4) * 100

  // Apply exponential penalty (same as AI chatbot portal)
  const penalizedAvg = Math.pow(weightedAvg / 4, 1.5)   // 0-1 range, penalized
  const penalizedScore = Math.max(0, (1 - penalizedAvg) * 100)

  let grade = scoreToGrade(penalizedScore)

  // Apply grade caps from critical failure overrides
  let capped = false
  for (const t of tests) {
    if (t.cfoTriggered) {
      const capGrade = extractGradeCap(t.cfoEffect)
      if (capGrade && gradeRank(capGrade) > gradeRank(grade)) {
        grade = capGrade
        capped = true
      }
    }
  }

  return { score: penalizedScore, grade, capped }
}
```

### Grade Thresholds (shared with AI chatbot portal)

```
95-100  -> A+     75-79 -> B+     55-59 -> C      30-39 -> D
85-94   -> A      70-74 -> B      50-54 -> C-     0-29  -> F
80-84   -> A-     65-69 -> B-     40-49 -> D+
                  60-64 -> C+
```

### Per-Platform Grade

```typescript
// Platform grade = worst profile grade (conservative)
// A platform is only as safe as its weakest profile
const platformGrade = worstGrade(profileGrades)
const platformScore = Math.min(...profileScores)
```

---

## 6. Hub Page Design

```
┌──────────────────────────────────────────────────────────────────┐
│ STREAMING CONTENT SAFETY                                         │
│ Research Portal                                                  │
│ Independent safety research across 3 streaming platforms,        │
│ 3 user profiles, and 9 test categories.                         │
├──────────────────────────────────────────────────────────────────┤
│ [3 Platforms]  [9 Categories]  [X Critical Failures]             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Platform Safety Matrix                                          │
│  ┌──────────────┬──────────┬──────────┬──────────┬─────────────┐ │
│  │ Platform     │ Child(7) │ Child(12)│ Teen(16) │ Overall     │ │
│  ├──────────────┼──────────┼──────────┼──────────┼─────────────┤ │
│  │ Netflix      │ [B-*]    │ [D*]     │ [D*]     │ [C-]        │ │
│  │ Peacock      │ [D*]     │ [D*]     │ [C-]     │ [D*]        │ │
│  │ Prime Video  │ [D*]     │ [D*]     │ [C-]     │ [D*]        │ │
│  └──────────────┴──────────┴──────────┴──────────┴─────────────┘ │
│  * = grade capped due to critical failure                        │
│  Click any grade to view platform details                        │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ Critical Findings Across All Platforms                            │
│ ⚠ All 3 platforms allow zero-auth profile switching (PE-01)      │
│ ⚠ Netflix /watch/ endpoint bypasses ALL maturity controls        │
│ ✓ All platforms properly filter Kids profile search results      │
│ ✓ No recommendation leakage on Kids profiles                     │
├──────────────────────────────────────────────────────────────────┤
│ Platform Cards (sortable by grade)                               │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐                        │
│ │ Netflix  │  │ Peacock  │  │ Prime    │                        │
│ │ Grade: C-│  │ Grade: D*│  │ Video    │                        │
│ │ 3 CF     │  │ 1 CF     │  │ Grade: D*│                        │
│ │ Key: URL │  │ Key: PE  │  │ 1 CF     │                        │
│ │ bypass   │  │ escape   │  │ Key: PE  │                        │
│ └──────────┘  └──────────┘  └──────────┘                        │
├──────────────────────────────────────────────────────────────────┤
│ What Parents Should Know                                         │
│ [Actionable guidance derived from platformNotes]                 │
└──────────────────────────────────────────────────────────────────┘
```

---

## 7. Platform Detail Design

```
┌──────────────────────────────────────────────────────────────────┐
│ ← Back to Portal                                                 │
│ Netflix Content Safety Report                                    │
│ Overall Grade: C-  |  Tested: 2026-02-28  |  10/11 tests scored │
├──────────────────────────────────────────────────────────────────┤
│ ⚠ CRITICAL: Direct /watch/ URL bypasses ALL maturity controls    │
│ ⚠ CRITICAL: Direct /title/ URL bypasses standard profile filters │
│ ⚠ HIGH: Kids profile escape via Exit Kids button                 │
├──────────────────────────────────────────────────────────────────┤
│ [Summary]  [Child (7)]  [Child (12)]  [Teen (16)]                │
│                                                                  │
│ ─── Summary Tab ───                                              │
│ Cross-profile matrix (3 profiles x 9 categories)                 │
│ Platform architecture notes                                      │
│ Strengths / Weaknesses                                           │
│ Parent guidance                                                  │
│                                                                  │
│ ─── Child (7) Tab ───                                            │
│ Profile: Kids  |  Grade: B-* (capped)  |  Maturity: TV-Y/G      │
│ ┌────────────────────────┬───────┬─────┬────────────────────────┐│
│ │ Category               │ Score │ Wt  │ Finding                ││
│ ├────────────────────────┼───────┼─────┼────────────────────────┤│
│ │ PE-01 Profile Escape   │ 3 [F] │ 5   │ Exit Kids button...   ││
│ │   ⚠ CFO: Grade capped at D                                   ││
│ ├────────────────────────┼───────┼─────┼────────────────────────┤│
│ │ SD-01 Search & Disc    │ 0 [A+]│ 5   │ Full Block — mature...││
│ ├────────────────────────┼───────┼─────┼────────────────────────┤│
│ │ DU-01 Direct URL       │ 0 [A+]│ 3   │ /title/ redirects to..││
│ │ ...                                                           ││
│ └───────────────────────────────────────────────────────────────┘│
│                                                                  │
│ Evidence Screenshots (expandable)                                │
│ [PE01_01.png] [PE01_02.png] [PE01_03.png]                       │
├──────────────────────────────────────────────────────────────────┤
│ Platform Architecture                                            │
│ Two-tier protection model:                                       │
│ - Kids profiles: server-side filtering (strong)                  │
│ - Standard profiles: UI-layer only (weak)                        │
└──────────────────────────────────────────────────────────────────┘
```

---

## 8. Component Inventory

### Shared (reusable across both portals)

| Component/Utility | Current Location | Action |
|-------------------|-----------------|--------|
| `gradeTextColor()`, `gradeBgColor()`, `gradeBorderColor()`, `gradeHexColor()` | `ai-safety/_components/chat/grade-colors.ts` | Move to `lib/shared/grade-colors.ts`, re-export from old location |
| `scoreToGrade()` | New | Create in `lib/shared/scoring.ts` |
| `PublicPageHeader` | `components/layout/PublicPageHeader.tsx` | Modify: add Research dropdown |
| `Footer` | `components/marketing/Footer.tsx` | Reuse as-is |

### New (streaming-specific)

| Component | Purpose |
|-----------|---------|
| `SubNav` | Tab nav: Portal, Compare, Methodology (copied from AI Safety pattern) |
| `StreamingHubClient` | Hub matrix + critical findings + platform cards |
| `PlatformDetailClient` | Profile tabs + category score grids + evidence |
| `CompareClient` | Side-by-side comparison (2 or 3 platforms) |
| `ProfileScoreCard` | Compact grade badge + score + capped indicator |
| `CategoryResultRow` | Expandable row: score badge, weight, description, evidence links |
| `CriticalFailureBanner` | Red banner showing CFO details + affected profiles |

### AI Safety Components NOT Shared

These are chatbot-specific and should NOT be generalized:
- `SafetyTestingContent` — prompt/response format
- `ConversationThread` — multi-turn chat display
- `PromptDetailClient` — individual prompt detail
- `ResearchChatModal` / `ResearchChatWidget` — AI chat interface
- `DimensionCrosscut` — 7 chatbot-specific dimensions
- `ScorePopover` — could potentially be shared but is tightly coupled to chatbot score distribution

---

## 9. Data Flow

```
research/content_safety/results/{platformId}/
  ├── content_safety_results.json      <- Raw test data
  ├── platform_scorecard.json          <- (Netflix only, optional)
  ├── scout_report.json                <- Account metadata (optional)
  └── screenshots/                     <- Evidence PNGs
         |
         v
web/src/lib/streaming-research/loaders.ts (server-side, build time)
  -> Reads JSON from filesystem (path.resolve(cwd, "../research/..."))
  -> Detects format (Netflix vs Peacock/PV)
  -> Normalizes to StreamingPlatformData shape
  -> Computes weighted scores and letter grades per profile
  -> Applies grade caps from critical failure overrides
  -> Computes platform overall grade (worst profile grade)
  -> Returns typed data
         |
         v
Server Components (page.tsx files)
  -> Call loadAllStreamingPlatforms() or loadStreamingPlatform(id)
  -> Build serializable summaries for client components
  -> Pass as props to *Client.tsx components
         |
         v
Client Components (interactive)
  -> Tab switching, sorting, expanding/collapsing
  -> Grade color rendering via shared grade-colors.ts
  -> Evidence screenshot display
```

### Screenshot Serving

Evidence screenshots live at `research/content_safety/results/{platformId}/screenshots/`. Two options:

**Option A (recommended):** Symlink `web/public/streaming-screenshots` -> `../../research/content_safety/results` and reference images as `/streaming-screenshots/{platformId}/screenshots/{filename}`.

**Option B:** Copy screenshots into `web/public/streaming-screenshots/` at build time.

Option A avoids file duplication but requires the symlink to exist in the repo.

---

## 10. Phase 2 — Research Hub Restructuring (Deferred)

**Trigger:** When a 3rd research vertical is added (social media, gaming) OR when the team decides the /ai-safety URL is ready to retire.

### Changes:
1. Create `/research` hub page listing all verticals with cards
2. Move `/ai-safety/*` to `/research/ai-chatbots/*` with 301 redirects
3. Move `/streaming-safety/*` to `/research/streaming/*` with 301 redirects
4. Replace "Research" dropdown with single link to `/research`
5. Update internal links, sitemaps, og:url tags

### URL Redirects (in `next.config.js`):
```
/ai-safety             -> /research/ai-chatbots
/ai-safety/:path*      -> /research/ai-chatbots/:path*
/streaming-safety      -> /research/streaming
/streaming-safety/:path* -> /research/streaming/:path*
```

---

## 11. Phase 3 — Polish (Future)

- **Categories crosscut:** `/streaming-safety/categories/[categoryId]` — how all platforms score on one category
- **Research Chat:** Extend AI chat widget to answer streaming questions
- **Cross-portal comparison:** "Is Netflix Kids safer than ChatGPT for a 7-year-old?"
- **Cmd+K search:** Include streaming platforms in the search index

---

## 12. Implementation Order

| Step | File(s) | Description |
|------|---------|-------------|
| 1 | `lib/shared/grade-colors.ts` | Extract grade color utilities |
| 2 | `lib/shared/scoring.ts` | Create shared scoreToGrade() |
| 3 | `lib/streaming-research/streaming-data-types.ts` | Define all interfaces + constants |
| 4 | `lib/streaming-research/scoring.ts` | Profile and platform grade computation |
| 5 | `lib/streaming-research/loaders.ts` | JSON loader with format normalization |
| 6 | `streaming-safety/layout.tsx` + `_components/SubNav.tsx` | Layout shell |
| 7 | `streaming-safety/page.tsx` + `StreamingHubClient.tsx` | Hub page |
| 8 | `_components/ProfileScoreCard.tsx`, `CategoryResultRow.tsx`, `CriticalFailureBanner.tsx` | Shared display components |
| 9 | `streaming-safety/[platformId]/page.tsx` + `PlatformDetailClient.tsx` | Platform detail |
| 10 | `streaming-safety/compare/page.tsx` + `CompareClient.tsx` | Comparison page |
| 11 | `streaming-safety/methodology/page.tsx` | Static methodology content |
| 12 | `PublicPageHeader.tsx` | Add Research dropdown |
| 13 | Screenshots setup | Symlink or copy evidence images |
| 14 | Build verification | `cd web && npx next build --no-lint` |

---

## 13. Key Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Netflix JSON format differs from Peacock/PV | Loader detects format via key presence and normalizes both |
| Only 3 platforms (hub page may feel sparse) | Design grid to accommodate 6-9+ platforms; current 3 is fine for launch |
| Grade computation may not match manual calculations | Validate loader output against Netflix's `platform_scorecard.json` |
| Screenshot paths may break in Next.js | Use symlink or copy to `public/`; test in dev server |
| Research dropdown with 2 items feels sparse | Keep it clean — 2 focused items with descriptions is better than a sprawling mega-menu |

---

## 14. Open Questions (Resolve During Implementation)

1. **Netflix multi-profile tests (DU-01, DU-02):** These test entries cover 3 profiles in one object. Should the loader split into per-profile entries or store as platform-level findings? **Recommendation:** Store as platform-level `criticalFindings` separate from per-profile results, and reference them from affected profiles via `cfoTriggered`.

2. **N/A vs Not Testable display:** KM-01 is "N/A" for teen profiles (no kids mode to escape) while CB-01 is "Not Testable" on Netflix (DRM limitation). Display N/A as a gray dash, Not Testable as a yellow warning with tooltip.

3. **Peacock TestChild7/TestChild12 deduplication:** These profiles have identical results ("Identical to TestChild7"). Show both in the matrix for completeness but add a note badge saying "Same as Child (7) — no age granularity below 13."
