/**
 * PCSS Regulatory Exposure — computes which laws apply to each tested platform
 * and what PCSS rule categories they're required to implement.
 */

import { LAW_REGISTRY } from "@/lib/compliance"
import type { LawEntry } from "@/lib/compliance/types"

// ── Platform aliases: scorecard platformId → registry platform names ──

const PLATFORM_ALIASES: Record<string, string[]> = {
  chatgpt: ["ChatGPT"],
  claude: [],
  gemini: ["Google Gemini"],
  grok: [],
  character_ai: ["Character.ai"],
  copilot: [],
  perplexity: [],
  replika: [],
  netflix: ["Netflix"],
  peacock: [],
  prime_video: [],
}

// AI chatbot platform IDs — these also get laws with ai_minor_interaction category
const AI_CHATBOT_IDS = new Set([
  "chatgpt",
  "claude",
  "gemini",
  "grok",
  "character_ai",
  "copilot",
  "perplexity",
  "replika",
])

// Streaming platform IDs — these also get laws targeting streaming/content platforms
const STREAMING_IDS = new Set(["netflix", "peacock", "prime_video"])

// Rule categories that indicate a law targets AI platforms
const AI_RULE_CATEGORIES = new Set(["ai_minor_interaction"])

// Rule categories that indicate a law targets content/streaming platforms
const CONTENT_RULE_CATEGORIES = new Set([
  "content_rating",
  "content_block_title",
  "content_descriptor_block",
])

export interface RegulatoryExposure {
  platformId: string
  applicableLawCount: number
  enactedCount: number
  pendingCount: number
  requiredCategories: string[]
  requiredCategoryCount: number
  jurisdictionCount: number
  jurisdictions: string[]
  exposureLevel: "low" | "medium" | "high" | "very-high"
  topLaws: { id: string; shortName: string; status: string; jurisdiction: string }[]
}

function lawMatchesPlatform(law: LawEntry, platformId: string): boolean {
  // Laws with ["all"] apply to everyone
  if (law.platforms.includes("all")) return true

  // Direct name matching via aliases
  const aliases = PLATFORM_ALIASES[platformId] ?? []
  if (aliases.some((alias) => law.platforms.includes(alias))) return true

  // AI chatbot platforms also get laws with AI-focused rule categories
  if (AI_CHATBOT_IDS.has(platformId)) {
    if (law.ruleCategories.some((cat) => AI_RULE_CATEGORIES.has(cat))) return true
  }

  // Streaming platforms also get laws with content-focused rule categories
  // that list any streaming platform (Netflix, YouTube, etc.)
  if (STREAMING_IDS.has(platformId)) {
    const hasContentRules = law.ruleCategories.some((cat) =>
      CONTENT_RULE_CATEGORIES.has(cat)
    )
    const targetsStreamingPlatform = law.platforms.some((p) =>
      ["Netflix", "YouTube", "Spotify", "Twitch"].includes(p)
    )
    if (hasContentRules && targetsStreamingPlatform) return true
  }

  return false
}

function computeExposureLevel(
  lawCount: number,
  enactedCount: number
): RegulatoryExposure["exposureLevel"] {
  if (lawCount >= 20 || enactedCount >= 10) return "very-high"
  if (lawCount >= 10 || enactedCount >= 5) return "high"
  if (lawCount >= 5 || enactedCount >= 2) return "medium"
  return "low"
}

export function computeRegulatoryExposure(
  platformId: string
): RegulatoryExposure {
  const applicableLaws = LAW_REGISTRY.filter((law) =>
    lawMatchesPlatform(law, platformId)
  )

  const enacted = applicableLaws.filter(
    (l) => l.status === "enacted" || l.status === "passed"
  )
  const pending = applicableLaws.filter(
    (l) => l.status === "pending" || l.status === "proposed"
  )

  const requiredCategories = new Set<string>()
  for (const law of applicableLaws) {
    for (const cat of law.ruleCategories) {
      requiredCategories.add(cat)
    }
  }

  const jurisdictions = Array.from(
    new Set(applicableLaws.map((l) => l.jurisdictionGroup))
  )

  // Top 5 most relevant laws (enacted first, then by name)
  const topLaws = [...applicableLaws]
    .sort((a, b) => {
      const statusOrder: Record<string, number> = {
        enacted: 0,
        passed: 1,
        injunction: 2,
        pending: 3,
        proposed: 4,
      }
      return (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5)
    })
    .slice(0, 5)
    .map((l) => ({
      id: l.id,
      shortName: l.shortName,
      status: l.status,
      jurisdiction: l.jurisdiction,
    }))

  return {
    platformId,
    applicableLawCount: applicableLaws.length,
    enactedCount: enacted.length,
    pendingCount: pending.length,
    requiredCategories: Array.from(requiredCategories),
    requiredCategoryCount: requiredCategories.size,
    jurisdictionCount: jurisdictions.length,
    jurisdictions,
    exposureLevel: computeExposureLevel(applicableLaws.length, enacted.length),
    topLaws,
  }
}

/** Compute exposure for all tested platforms at once */
export function computeAllExposures(
  platformIds: string[]
): Map<string, RegulatoryExposure> {
  const map = new Map<string, RegulatoryExposure>()
  for (const id of platformIds) {
    map.set(id, computeRegulatoryExposure(id))
  }
  return map
}

/** Aggregate stats across all laws */
export function computeRegulatoryLandscape() {
  const enacted = LAW_REGISTRY.filter(
    (l) => l.status === "enacted" || l.status === "passed"
  )
  const pending = LAW_REGISTRY.filter(
    (l) => l.status === "pending" || l.status === "proposed"
  )

  // Category frequency
  const categoryFreq = new Map<string, number>()
  for (const law of LAW_REGISTRY) {
    for (const cat of law.ruleCategories) {
      categoryFreq.set(cat, (categoryFreq.get(cat) ?? 0) + 1)
    }
  }

  const topCategories = Array.from(categoryFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([category, count]) => ({ category, count }))

  // Jurisdiction breakdown
  const jurisdictionFreq = new Map<string, number>()
  for (const law of LAW_REGISTRY) {
    jurisdictionFreq.set(
      law.jurisdictionGroup,
      (jurisdictionFreq.get(law.jurisdictionGroup) ?? 0) + 1
    )
  }

  const jurisdictionBreakdown = Array.from(jurisdictionFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([jurisdiction, count]) => ({ jurisdiction, count }))

  return {
    totalLaws: LAW_REGISTRY.length,
    enactedCount: enacted.length,
    pendingCount: pending.length,
    totalRuleCategories: 45,
    topCategories,
    jurisdictionBreakdown,
  }
}
