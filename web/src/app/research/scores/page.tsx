import { Metadata } from "next"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import { loadAllStreamingPlatforms } from "@/lib/streaming-research/loaders"
import {
  computeAllExposures,
  computeRegulatoryLandscape,
  type RegulatoryExposure,
} from "@/lib/platform-research/regulatory-exposure"
import { computeComplianceGap } from "@/lib/platform-research/compliance-gap"
import { ScoresClient } from "./ScoresClient"

export const metadata: Metadata = {
  title: "Platform Safety Scorecard — Phosra",
  description:
    "The first independent child safety accountability index. See how 11 major platforms rank in protecting children, with standardized safety testing across AI chatbots and streaming services.",
  openGraph: {
    title: "Platform Safety Scorecard — Phosra",
    description:
      "Independent child safety rankings for 11 major platforms. Standardized testing, transparent methodology, published results.",
  },
}

export interface PlatformScoreEntry {
  rank: number
  platformId: string
  platformName: string
  category: "ai_chatbot" | "streaming"
  categoryLabel: string
  overallGrade: string
  numericalScore: number
  totalTests: number
  criticalFailures: number
  gradeCapped: boolean
  gradeCapReasons: string[]
  testDate: string
  detailUrl: string
  topCategories: { name: string; grade: string; score: number }[]
  regulatory: {
    exposureLevel: string
    applicableLawCount: number
    enactedCount: number
    pendingCount: number
    requiredCategoryCount: number
    jurisdictionCount: number
    topLaws: { id: string; shortName: string; status: string; jurisdiction: string }[]
  }
  complianceGap: {
    coveragePercent: number
    totalRequired: number
    totalCovered: number
    totalGaps: number
    topGaps: { category: string; label: string }[]
    entries: { ruleCategory: string; label: string; status: "covered" | "partial" | "gap" }[]
  }
}

export interface RegulatoryLandscapeData {
  totalLaws: number
  enactedCount: number
  pendingCount: number
  totalRuleCategories: number
  topCategories: { category: string; count: number }[]
  jurisdictionBreakdown: { jurisdiction: string; count: number }[]
}

export default async function ScoresPage() {
  const [chatbotPlatforms, streamingPlatforms] = await Promise.all([
    loadAllChatbotResearch(),
    loadAllStreamingPlatforms(),
  ])

  const entries: PlatformScoreEntry[] = []

  // Build entries from chatbot platforms
  for (const p of chatbotPlatforms) {
    const scorecard = p.chatbotData?.safetyTesting?.scorecard
    if (!scorecard) continue

    // Get top 5 category scores by weight
    const sortedCategories = [...(scorecard.categoryScores ?? [])]
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5)

    // Extract test categories and scores for compliance gap analysis
    const chatbotTestCategories = (scorecard.categoryScores ?? []).map((c) => c.category)
    const chatbotTestScores = new Map<string, number>()
    for (const c of scorecard.categoryScores ?? []) {
      chatbotTestScores.set(c.category, c.avgScore)
    }
    const gap = computeComplianceGap(p.platformId, "ai_chatbot", chatbotTestCategories, chatbotTestScores)

    entries.push({
      rank: 0, // will be assigned after sorting
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

  // Build entries from streaming platforms
  for (const p of streamingPlatforms) {
    // Count total tests across all profiles
    const totalTests = p.profiles.reduce(
      (sum, profile) => sum + profile.tests.length,
      0
    )

    // Build top categories from profile grades
    const topCategories = p.profiles.map((profile) => ({
      name:
        profile.profileType === "kids"
          ? `Kids (${profile.profileId})`
          : profile.profileType === "teen"
            ? `Teen (${profile.profileId})`
            : `Standard (${profile.profileId})`,
      grade: profile.overallGrade,
      score: profile.weightedScore,
    }))

    // Extract unique streaming test categories and avg scores for compliance gap
    const streamingTestCats = Array.from(
      new Set(p.profiles.flatMap((pr) => pr.tests.map((t) => t.category)))
    )
    const streamingScoreMap = new Map<string, number>()
    for (const cat of streamingTestCats) {
      const scores = p.profiles
        .flatMap((pr) => pr.tests.filter((t) => t.category === cat && t.score !== null))
        .map((t) => t.score as number)
      if (scores.length > 0) {
        streamingScoreMap.set(cat, scores.reduce((a, b) => a + b, 0) / scores.length)
      }
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
      gradeCapReasons: p.profiles
        .flatMap((pr) => pr.gradeCapReasons ?? [])
        .filter((v, i, a) => a.indexOf(v) === i),
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

  // Compute regulatory exposure for all platforms
  const platformIds = entries.map((e) => e.platformId)
  const exposureMap = computeAllExposures(platformIds)

  // Attach regulatory data to entries
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

  // Compute regulatory landscape
  const landscape = computeRegulatoryLandscape()

  // Sort by numerical score descending
  entries.sort((a, b) => b.numericalScore - a.numericalScore)

  // Assign ranks (ties get same rank)
  let currentRank = 1
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && entries[i].numericalScore < entries[i - 1].numericalScore) {
      currentRank = i + 1
    }
    entries[i].rank = currentRank
  }

  // Compute total tests and test categories
  const totalTests = entries.reduce((sum, e) => sum + e.totalTests, 0)
  const testCategories = 21 // 12 AI + 9 streaming

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Phosra Platform Safety Scorecard",
    description:
      "Independent child safety rankings for major digital platforms",
    creator: { "@type": "Organization", name: "Phosra" },
    license: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
    dateModified: "2026-03-01",
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ScoresClient
        entries={entries}
        totalPlatforms={entries.length}
        totalTests={totalTests}
        testCategories={testCategories}
        landscape={landscape}
      />
    </>
  )
}
