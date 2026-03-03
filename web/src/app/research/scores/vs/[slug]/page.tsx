import { Metadata } from "next"
import { notFound } from "next/navigation"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import { loadAllStreamingPlatforms } from "@/lib/streaming-research/loaders"
import {
  computeAllExposures,
} from "@/lib/platform-research/regulatory-exposure"
import { computeComplianceGap } from "@/lib/platform-research/compliance-gap"
import type { PlatformScoreEntry } from "../../page"
import { ComparisonClient } from "./ComparisonClient"

/* ── Platform ID → display name map ───────────────────────────── */
const PLATFORM_NAMES: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  grok: "Grok",
  character_ai: "Character.AI",
  copilot: "Microsoft Copilot",
  perplexity: "Perplexity",
  replika: "Replika",
  netflix: "Netflix",
  peacock: "Peacock",
  prime_video: "Prime Video",
}

const ALL_IDS = Object.keys(PLATFORM_NAMES)

/* ── Slug helpers ─────────────────────────────────────────────── */
function parseSlug(slug: string): [string, string] | null {
  const parts = slug.split("-vs-")
  if (parts.length !== 2) return null
  const [a, b] = parts
  if (!ALL_IDS.includes(a) || !ALL_IDS.includes(b)) return null
  if (a === b) return null
  return [a, b]
}

function makeSlug(a: string, b: string): string {
  return [a, b].sort().join("-vs-")
}

/* ── Static params: generate top matchups ─────────────────────── */
export function generateStaticParams() {
  const slugs = new Set<string>()
  for (let i = 0; i < ALL_IDS.length; i++) {
    for (let j = i + 1; j < ALL_IDS.length; j++) {
      slugs.add(makeSlug(ALL_IDS[i], ALL_IDS[j]))
    }
  }
  return Array.from(slugs).map((slug) => ({ slug }))
}

/* ── Metadata ─────────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const pair = parseSlug(slug)
  if (!pair) return { title: "Comparison Not Found — Phosra" }
  const [a, b] = pair
  const nameA = PLATFORM_NAMES[a]
  const nameB = PLATFORM_NAMES[b]
  return {
    title: `${nameA} vs ${nameB} Child Safety Comparison — Phosra`,
    description: `Head-to-head child safety comparison of ${nameA} and ${nameB}. See which platform scores higher across safety testing, regulatory exposure, and compliance gap analysis.`,
    openGraph: {
      title: `${nameA} vs ${nameB} — Child Safety Comparison`,
      description: `Independent safety comparison: ${nameA} vs ${nameB}. Scores, grades, critical failures, and regulatory compliance side by side.`,
    },
  }
}

/* ── Data loader (reuse scores page logic) ────────────────────── */
async function loadAllEntries(): Promise<PlatformScoreEntry[]> {
  const [chatbotPlatforms, streamingPlatforms] = await Promise.all([
    loadAllChatbotResearch(),
    loadAllStreamingPlatforms(),
  ])

  const entries: PlatformScoreEntry[] = []

  for (const p of chatbotPlatforms) {
    const scorecard = p.chatbotData?.safetyTesting?.scorecard
    if (!scorecard) continue
    const sortedCategories = [...(scorecard.categoryScores ?? [])]
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5)
    const chatbotTestCategories = (scorecard.categoryScores ?? []).map((c) => c.category)
    const chatbotTestScores = new Map<string, number>()
    for (const c of scorecard.categoryScores ?? []) {
      chatbotTestScores.set(c.category, c.avgScore)
    }
    const gap = computeComplianceGap(p.platformId, "ai_chatbot", chatbotTestCategories, chatbotTestScores)
    entries.push({
      rank: 0,
      platformId: p.platformId,
      platformName: p.platformName,
      category: "ai_chatbot",
      categoryLabel: "AI Chatbot",
      overallGrade: scorecard.overallGrade,
      numericalScore: scorecard.numericalScore,
      totalTests: scorecard.completedTests,
      criticalFailures: scorecard.criticalFailures?.length ?? 0,
      gradeCapped: !!scorecard.gradeCap,
      gradeCapReasons: scorecard.gradeCapReasons ?? [],
      testDate: scorecard.testDate ?? "March 2026",
      detailUrl: `/research/ai-chatbots/${p.platformId}`,
      topCategories: sortedCategories.map((c) => ({
        name: c.label,
        grade: c.grade,
        score: c.numericalScore,
      })),
      regulatory: { exposureLevel: "low", applicableLawCount: 0, enactedCount: 0, pendingCount: 0, requiredCategoryCount: 0, jurisdictionCount: 0, topLaws: [] },
      complianceGap: {
        coveragePercent: gap.coveragePercent,
        totalRequired: gap.totalRequired,
        totalCovered: gap.totalCovered,
        totalGaps: gap.totalGaps,
        topGaps: gap.topGaps,
        entries: gap.entries.map((e) => ({ ruleCategory: e.ruleCategory, label: e.label, status: e.status })),
      },
    })
  }

  for (const p of streamingPlatforms) {
    const totalTests = p.profiles.reduce((sum, profile) => sum + profile.tests.length, 0)
    const topCategories = p.profiles.map((profile) => ({
      name: profile.profileType === "kids" ? `Kids (${profile.profileId})` : profile.profileType === "teen" ? `Teen (${profile.profileId})` : `Standard (${profile.profileId})`,
      grade: profile.overallGrade,
      score: profile.weightedScore,
    }))
    const streamingTestCats = Array.from(new Set(p.profiles.flatMap((pr) => pr.tests.map((t) => t.category))))
    const streamingScoreMap = new Map<string, number>()
    for (const cat of streamingTestCats) {
      const scores = p.profiles.flatMap((pr) => pr.tests.filter((t) => t.category === cat && t.score !== null)).map((t) => t.score as number)
      if (scores.length > 0) streamingScoreMap.set(cat, scores.reduce((a, b) => a + b, 0) / scores.length)
    }
    const sGap = computeComplianceGap(p.platformId, "streaming", streamingTestCats, streamingScoreMap)
    entries.push({
      rank: 0,
      platformId: p.platformId,
      platformName: p.platformName,
      category: "streaming",
      categoryLabel: "Streaming",
      overallGrade: p.overallGrade,
      numericalScore: p.overallScore,
      totalTests,
      criticalFailures: p.criticalFailures?.length ?? 0,
      gradeCapped: p.profiles.some((pr) => !!pr.gradeCap),
      gradeCapReasons: p.profiles.flatMap((pr) => pr.gradeCapReasons ?? []).filter((v, i, a) => a.indexOf(v) === i),
      testDate: p.testDate || "February 2026",
      detailUrl: `/research/streaming/${p.platformId}`,
      topCategories,
      regulatory: { exposureLevel: "low", applicableLawCount: 0, enactedCount: 0, pendingCount: 0, requiredCategoryCount: 0, jurisdictionCount: 0, topLaws: [] },
      complianceGap: {
        coveragePercent: sGap.coveragePercent,
        totalRequired: sGap.totalRequired,
        totalCovered: sGap.totalCovered,
        totalGaps: sGap.totalGaps,
        topGaps: sGap.topGaps,
        entries: sGap.entries.map((e) => ({ ruleCategory: e.ruleCategory, label: e.label, status: e.status })),
      },
    })
  }

  // Attach regulatory data
  const platformIds = entries.map((e) => e.platformId)
  const exposureMap = computeAllExposures(platformIds)
  for (const entry of entries) {
    const exp = exposureMap.get(entry.platformId)
    if (exp) {
      entry.regulatory = {
        exposureLevel: exp.exposureLevel,
        applicableLawCount: exp.applicableLawCount,
        enactedCount: exp.enactedCount,
        pendingCount: exp.pendingCount,
        requiredCategoryCount: exp.requiredCategoryCount,
        jurisdictionCount: exp.jurisdictionCount,
        topLaws: exp.topLaws,
      }
    }
  }

  // Sort and assign ranks
  entries.sort((a, b) => b.numericalScore - a.numericalScore)
  let currentRank = 1
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && entries[i].numericalScore < entries[i - 1].numericalScore) currentRank = i + 1
    entries[i].rank = currentRank
  }

  return entries
}

/* ── Page ──────────────────────────────────────────────────────── */
export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const pair = parseSlug(slug)
  if (!pair) notFound()

  const [idA, idB] = pair
  const entries = await loadAllEntries()

  const entryA = entries.find((e) => e.platformId === idA)
  const entryB = entries.find((e) => e.platformId === idB)
  if (!entryA || !entryB) notFound()

  // All other platforms for "compare with another" dropdown
  const otherPlatforms = entries
    .filter((e) => e.platformId !== idA && e.platformId !== idB)
    .map((e) => ({ id: e.platformId, name: e.platformName }))

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${entryA.platformName} vs ${entryB.platformName} Child Safety Comparison`,
    description: `Independent head-to-head child safety comparison between ${entryA.platformName} (${entryA.overallGrade}) and ${entryB.platformName} (${entryB.overallGrade}).`,
    publisher: { "@type": "Organization", name: "Phosra" },
    datePublished: "2026-03-01",
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ComparisonClient
        platformA={entryA}
        platformB={entryB}
        otherPlatforms={otherPlatforms}
      />
    </>
  )
}
