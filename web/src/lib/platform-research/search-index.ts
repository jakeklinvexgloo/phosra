// ── Fuse.js Search Index for AI Safety Research Portal ──────────────
import Fuse from "fuse.js"

// ── Types ────────────────────────────────────────────────────────────

export type SearchResultType =
  | "platform"
  | "dimension"
  | "category"
  | "prompt"
  | "finding"
  | "control"

export interface SearchResultItem {
  type: SearchResultType
  title: string
  description: string
  url: string
  tags: string[]
  grade?: string
  score?: number
  category?: string
}

/** Minimal input shape — mirrors PlatformSummary from the hub page. */
interface PlatformInput {
  platformId: string
  platformName: string
  overallGrade: string
  numericalScore: number
  completedTests: number
  categoryScores: {
    category: string
    categoryLabel?: string
    label?: string
    grade: string
    averageScore?: number
    avgScore?: number
    testCount: number
    numericalScore?: number
  }[]
  hasParentalDashboard: boolean
  hasTimeLimits: boolean
  hasQuietHours: boolean
  minimumAge: number | null
  gapStats: { label: string; value: number; color: string }[]
}

// ── Static dimension items ───────────────────────────────────────────

const DIMENSION_ITEMS: SearchResultItem[] = [
  {
    type: "dimension",
    title: "Safety Testing",
    description:
      "Safety test results across 12 harm categories and 35+ test prompts",
    url: "/ai-safety/dimensions/safety-testing",
    tags: ["safety", "testing", "scores", "grades"],
  },
  {
    type: "dimension",
    title: "Age Verification",
    description:
      "How platforms verify user age and prevent underage access",
    url: "/ai-safety/dimensions/age-verification",
    tags: ["age", "verification", "underage", "minors"],
  },
  {
    type: "dimension",
    title: "Parental Controls",
    description:
      "Parent dashboards, visibility, configurable controls, and bypass vulnerabilities",
    url: "/ai-safety/dimensions/parental-controls",
    tags: ["parental", "controls", "dashboard", "family"],
  },
  {
    type: "dimension",
    title: "Conversation Controls",
    description:
      "Time limits, message limits, quiet hours, and break reminders",
    url: "/ai-safety/dimensions/conversation-controls",
    tags: ["conversation", "time", "limits", "breaks"],
  },
  {
    type: "dimension",
    title: "Emotional Safety",
    description:
      "Attachment research, retention tactics, AI identity disclosure, sycophancy",
    url: "/ai-safety/dimensions/emotional-safety",
    tags: ["emotional", "attachment", "sycophancy", "identity"],
  },
  {
    type: "dimension",
    title: "Academic Integrity",
    description:
      "Homework capabilities, study mode, detection methods, teacher visibility",
    url: "/ai-safety/dimensions/academic-integrity",
    tags: ["academic", "homework", "cheating", "school"],
  },
  {
    type: "dimension",
    title: "Privacy & Data",
    description:
      "Data collection, model training policies, regulatory actions, memory features",
    url: "/ai-safety/dimensions/privacy-data",
    tags: ["privacy", "data", "GDPR", "training"],
  },
]

// ── Static special-page items ────────────────────────────────────────

const SPECIAL_PAGE_ITEMS: SearchResultItem[] = [
  {
    type: "dimension",
    title: "Compare Platforms",
    description: "Side-by-side comparison of 2-4 AI chatbot platforms",
    url: "/ai-safety/compare",
    tags: ["compare", "versus", "side-by-side"],
  },
  {
    type: "prompt",
    title: "Test Prompt Index",
    description: "All safety test prompts with per-platform scores",
    url: "/ai-safety/prompts",
    tags: ["prompts", "tests", "questions"],
  },
  {
    type: "dimension",
    title: "Methodology",
    description: "Testing framework, scoring rubric, and grading algorithm",
    url: "/ai-safety/methodology",
    tags: ["methodology", "scoring", "algorithm", "rubric"],
  },
  {
    type: "control",
    title: "Phosra Controls Overview",
    description:
      "What controls each platform lacks and what Phosra enforces",
    url: "/ai-safety/phosra-controls",
    tags: ["phosra", "controls", "enforcement", "gaps"],
  },
]

// ── Builders ─────────────────────────────────────────────────────────

function buildPlatformItems(platforms: PlatformInput[]): SearchResultItem[] {
  return platforms.map((p) => ({
    type: "platform" as const,
    title: p.platformName,
    description: `Safety grade: ${p.overallGrade} (${p.numericalScore}/100) \u2014 ${p.completedTests} tests scored`,
    url: `/ai-safety/${p.platformId}`,
    tags: [p.overallGrade, p.platformId],
    grade: p.overallGrade,
    score: p.numericalScore,
  }))
}

function buildCategoryItems(platforms: PlatformInput[]): SearchResultItem[] {
  const seen = new Map<string, { label: string; count: number }>()
  for (const p of platforms) {
    for (const cs of p.categoryScores) {
      if (!seen.has(cs.category)) {
        seen.set(cs.category, {
          label: cs.categoryLabel ?? cs.label ?? cs.category,
          count: 1,
        })
      } else {
        seen.get(cs.category)!.count++
      }
    }
  }

  return Array.from(seen.entries()).map(([slug, { label, count }]) => ({
    type: "category" as const,
    title: label,
    description: `Safety testing category \u2014 scores across ${count} platform${count === 1 ? "" : "s"}`,
    url: `/ai-safety/categories/${slug}`,
    tags: slug.split("_"),
    category: slug,
  }))
}

function buildFindingItems(platforms: PlatformInput[]): SearchResultItem[] {
  const total = platforms.length
  const items: SearchResultItem[] = []

  const dashboardCount = platforms.filter((p) => p.hasParentalDashboard).length
  items.push({
    type: "finding",
    title: `Only ${dashboardCount}/${total} platforms have parental dashboards`,
    description:
      "Most AI chatbots lack a dedicated parent dashboard for monitoring and controls",
    url: "/ai-safety/dimensions/parental-controls",
    tags: ["parental", "dashboard", "monitoring"],
  })

  const timeLimitCount = platforms.filter((p) => p.hasTimeLimits).length
  items.push({
    type: "finding",
    title: `Only ${timeLimitCount}/${total} platforms offer time limits`,
    description:
      "Few AI chatbots provide built-in time or usage limits for minors",
    url: "/ai-safety/dimensions/conversation-controls",
    tags: ["time", "limits", "usage", "screen time"],
  })

  const quietHoursCount = platforms.filter((p) => p.hasQuietHours).length
  items.push({
    type: "finding",
    title: `${quietHoursCount}/${total} platforms offer quiet hours`,
    description:
      "Quiet hours restrict chatbot access during nighttime or school hours",
    url: "/ai-safety/dimensions/conversation-controls",
    tags: ["quiet hours", "nighttime", "scheduling"],
  })

  const ages = platforms
    .map((p) => p.minimumAge)
    .filter((a): a is number => a !== null)
  if (ages.length > 0) {
    const minAge = Math.min(...ages)
    const maxAge = Math.max(...ages)
    items.push({
      type: "finding",
      title: `Minimum age ranges from ${minAge} to ${maxAge}`,
      description: `Platform-stated minimum ages vary from ${minAge} to ${maxAge} years old`,
      url: "/ai-safety/dimensions/age-verification",
      tags: ["age", "minimum", "requirement", "verification"],
    })
  }

  // Grade distribution findings
  const gradeGroups: Record<string, string[]> = {}
  for (const p of platforms) {
    const letter = p.overallGrade.charAt(0)
    if (!gradeGroups[letter]) gradeGroups[letter] = []
    gradeGroups[letter].push(p.platformName)
  }
  for (const [letter, names] of Object.entries(gradeGroups)) {
    items.push({
      type: "finding",
      title: `${names.length} platform${names.length === 1 ? "" : "s"} received ${letter}-range grades`,
      description: names.join(", "),
      url: "/ai-safety",
      tags: ["grade", letter, "safety", "score"],
    })
  }

  return items
}

function buildControlItems(platforms: PlatformInput[]): SearchResultItem[] {
  const gapMap = new Map<
    string,
    { totalValue: number; count: number; color: string }
  >()

  for (const p of platforms) {
    for (const gap of p.gapStats) {
      const existing = gapMap.get(gap.label)
      if (existing) {
        existing.totalValue += gap.value
        existing.count++
      } else {
        gapMap.set(gap.label, {
          totalValue: gap.value,
          count: 1,
          color: gap.color,
        })
      }
    }
  }

  return Array.from(gapMap.entries()).map(([label, { count }]) => ({
    type: "control" as const,
    title: label,
    description: `Control gap identified across ${count} platform${count === 1 ? "" : "s"} \u2014 Phosra provides enforcement`,
    url: "/ai-safety/phosra-controls",
    tags: label
      .toLowerCase()
      .split(/[\s/]+/)
      .filter((w) => w.length > 2),
  }))
}

// ── Public API ───────────────────────────────────────────────────────

/**
 * Transform platform data into a flat list of searchable items.
 * Accepts the same PlatformSummary[] that the hub page uses.
 */
export function buildSearchItems(platforms: PlatformInput[]): SearchResultItem[] {
  return [
    ...buildPlatformItems(platforms),
    ...DIMENSION_ITEMS,
    ...buildCategoryItems(platforms),
    ...buildFindingItems(platforms),
    ...buildControlItems(platforms),
    ...SPECIAL_PAGE_ITEMS,
  ]
}

/** Create a configured Fuse.js search index over the given items. */
export function createSearchIndex(
  items: SearchResultItem[],
): Fuse<SearchResultItem> {
  return new Fuse(items, {
    keys: [
      { name: "title", weight: 2 },
      { name: "description", weight: 1 },
      { name: "tags", weight: 1.5 },
    ],
    threshold: 0.35,
    includeScore: true,
    minMatchCharLength: 2,
  })
}
