import { loadAllStreamingPlatforms } from "@/lib/streaming-research/loaders"
import type {
  StreamingPlatformData,
  StreamingProfileResult,
  StreamingCriticalFailure,
} from "@/lib/streaming-research/streaming-data-types"

/**
 * Build a structured text context block containing all streaming platform
 * safety data, suitable for injection into an LLM system prompt.
 */
export async function buildStreamingResearchContext(): Promise<string> {
  const platforms = await loadAllStreamingPlatforms()
  if (platforms.length === 0) return ""

  const sections: string[] = []

  sections.push(formatOverviewTable(platforms))
  sections.push(formatProfileBreakdown(platforms))
  sections.push(formatCriticalFailures(platforms))
  sections.push(formatCrossComparison(platforms))
  sections.push(formatKeyFindings(platforms))
  sections.push(formatParentGuidance(platforms))

  return sections.filter(Boolean).join("\n\n")
}

// ── Helpers ──────────────────────────────────────────────────────────

function pName(p: StreamingPlatformData): string {
  return p.platformName
}

// ── Section Formatters ───────────────────────────────────────────────

function formatOverviewTable(platforms: StreamingPlatformData[]): string {
  const lines = [
    "## STREAMING PLATFORM OVERVIEW",
    "| Platform | Overall Grade | Score | Test Date |",
    "|----------|---------------|-------|-----------|",
  ]
  for (const p of platforms) {
    lines.push(`| ${pName(p)} | ${p.overallGrade} | ${p.overallScore}/100 | ${p.testDate} |`)
  }
  return lines.join("\n")
}

function formatProfileBreakdown(platforms: StreamingPlatformData[]): string {
  const lines = ["## PER-PROFILE BREAKDOWN"]

  for (const p of platforms) {
    lines.push(`### ${pName(p)}`)
    for (const pr of p.profiles) {
      const capNote = pr.gradeCap
        ? ` — CAPPED at ${pr.gradeCap}${pr.gradeCapReasons?.length ? ` (${pr.gradeCapReasons[0]})` : ""}`
        : ""
      lines.push(`- ${pr.profileId} (${pr.profileType}, ${pr.maturitySetting}): ${pr.overallGrade} (${pr.weightedScore}/100)${capNote}`)

      // Worst categories for this profile (top 3 by score, higher = worse)
      const worst = [...pr.tests]
        .filter(t => t.score !== null)
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, 3)
      if (worst.length > 0) {
        lines.push("  Worst categories:")
        for (const t of worst) {
          lines.push(`    - ${t.category}: score ${t.score}/4 (${t.label}) — ${t.description.substring(0, 100)}`)
        }
      }
    }
  }
  return lines.join("\n")
}

function formatCriticalFailures(platforms: StreamingPlatformData[]): string {
  const lines = ["## CRITICAL FAILURES"]

  for (const p of platforms) {
    if (p.criticalFailures.length === 0) {
      lines.push(`### ${pName(p)}: No critical failures`)
      continue
    }
    lines.push(`### ${pName(p)} (${p.criticalFailures.length} critical failures)`)
    for (const cf of p.criticalFailures) {
      lines.push(`- [${cf.cfoId}] ${cf.description} — affects: ${cf.affectedProfiles.join(", ")} — grade cap: ${cf.gradeCap}`)
    }
  }
  return lines.join("\n")
}

function formatCrossComparison(platforms: StreamingPlatformData[]): string {
  const lines = ["## CROSS-PLATFORM COMPARISON"]

  // Build a per-category comparison across platforms
  const categoryScores = new Map<string, { platform: string; avgScore: number }[]>()

  for (const p of platforms) {
    // Aggregate per-category averages across all profiles
    const catScores = new Map<string, number[]>()
    for (const pr of p.profiles) {
      for (const t of pr.tests) {
        if (t.score === null) continue
        if (!catScores.has(t.category)) catScores.set(t.category, [])
        catScores.get(t.category)!.push(t.score)
      }
    }
    for (const [cat, scores] of Array.from(catScores)) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      if (!categoryScores.has(cat)) categoryScores.set(cat, [])
      categoryScores.get(cat)!.push({ platform: pName(p), avgScore: avg })
    }
  }

  for (const [cat, entries] of Array.from(categoryScores)) {
    const sorted = entries.sort((a, b) => a.avgScore - b.avgScore)
    const best = sorted[0]
    const worst = sorted[sorted.length - 1]
    lines.push(`- ${cat}: Best=${best.platform} (avg ${best.avgScore.toFixed(1)}/4), Worst=${worst.platform} (avg ${worst.avgScore.toFixed(1)}/4)`)
  }

  return lines.join("\n")
}

function formatKeyFindings(platforms: StreamingPlatformData[]): string {
  const lines = ["## KEY FINDINGS"]

  // Find common vulnerabilities (categories where most platforms score >= 2)
  const catVulns = new Map<string, string[]>()
  for (const p of platforms) {
    for (const pr of p.profiles) {
      for (const t of pr.tests) {
        if (t.score !== null && t.score >= 2) {
          if (!catVulns.has(t.category)) catVulns.set(t.category, [])
          const entry = `${pName(p)} (${pr.profileId})`
          if (!catVulns.get(t.category)!.includes(entry)) {
            catVulns.get(t.category)!.push(entry)
          }
        }
      }
    }
  }

  const commonVulns = Array.from(catVulns)
    .filter(([, ps]) => ps.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)

  if (commonVulns.length > 0) {
    lines.push("### Common vulnerabilities (score >= 2 on multiple platforms)")
    for (const [cat, ps] of commonVulns) {
      lines.push(`- ${cat}: ${ps.join(", ")}`)
    }
  }

  // Best performer per category (lowest avg score = safest)
  lines.push("### Best performer per category")
  const catBest = new Map<string, { platform: string; avgScore: number }>()
  for (const p of platforms) {
    const catScores = new Map<string, number[]>()
    for (const pr of p.profiles) {
      for (const t of pr.tests) {
        if (t.score === null) continue
        if (!catScores.has(t.category)) catScores.set(t.category, [])
        catScores.get(t.category)!.push(t.score)
      }
    }
    for (const [cat, scores] of Array.from(catScores)) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      const existing = catBest.get(cat)
      if (!existing || avg < existing.avgScore) {
        catBest.set(cat, { platform: pName(p), avgScore: avg })
      }
    }
  }

  for (const [cat, best] of Array.from(catBest)) {
    lines.push(`- ${cat}: ${best.platform} (avg ${best.avgScore.toFixed(1)}/4)`)
  }

  return lines.join("\n")
}

function formatParentGuidance(platforms: StreamingPlatformData[]): string {
  const lines = [
    "## PARENT GUIDANCE SUMMARY",
    "Based on our streaming platform safety research:",
  ]

  // Sort platforms by overall score (highest = safest)
  const sorted = [...platforms].sort((a, b) => b.overallScore - a.overallScore)

  for (const p of sorted) {
    const safestProfile = [...p.profiles].sort((a, b) => b.weightedScore - a.weightedScore)[0]
    const leastSafe = [...p.profiles].sort((a, b) => a.weightedScore - b.weightedScore)[0]

    lines.push(`### ${pName(p)} (${p.overallGrade}, ${p.overallScore}/100)`)

    if (safestProfile && leastSafe && safestProfile.profileId !== leastSafe.profileId) {
      lines.push(`- Safest profile: ${safestProfile.profileId} (${safestProfile.overallGrade}, ${safestProfile.weightedScore}/100)`)
      lines.push(`- Least safe profile: ${leastSafe.profileId} (${leastSafe.overallGrade}, ${leastSafe.weightedScore}/100)`)
    }

    if (p.criticalFailures.length > 0) {
      lines.push(`- CAUTION: ${p.criticalFailures.length} critical failure(s) found`)
    }

    // Extract key notes if present
    const archNote = p.platformNotes["architecture"] || p.platformNotes["Architecture"]
    if (archNote) {
      lines.push(`- Architecture: ${archNote.substring(0, 150)}`)
    }
  }

  return lines.join("\n")
}
