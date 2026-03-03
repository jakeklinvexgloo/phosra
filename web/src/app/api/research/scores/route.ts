import { NextResponse } from "next/server"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import { loadAllStreamingPlatforms } from "@/lib/streaming-research/loaders"
import {
  computeAllExposures,
  computeRegulatoryLandscape,
} from "@/lib/platform-research/regulatory-exposure"
import { computeComplianceGap } from "@/lib/platform-research/compliance-gap"

export const revalidate = 3600 // cache for 1 hour

export async function GET() {
  const [chatbotPlatforms, streamingPlatforms] = await Promise.all([
    loadAllChatbotResearch(),
    loadAllStreamingPlatforms(),
  ])

  const entries: Record<string, unknown>[] = []

  // Chatbot platforms
  for (const p of chatbotPlatforms) {
    const scorecard = p.chatbotData?.safetyTesting?.scorecard
    if (!scorecard) continue

    const testCategories = (scorecard.categoryScores ?? []).map((c) => c.category)
    const testScores = new Map<string, number>()
    for (const c of scorecard.categoryScores ?? []) {
      testScores.set(c.category, c.avgScore)
    }
    const gap = computeComplianceGap(p.platformId, "ai_chatbot", testCategories, testScores)

    entries.push({
      platformId: p.platformId,
      platformName: p.platformName,
      category: "ai_chatbot",
      overallGrade: scorecard.overallGrade,
      numericalScore: scorecard.numericalScore,
      totalTests: scorecard.completedTests,
      criticalFailures: scorecard.criticalFailures?.length ?? 0,
      gradeCapped: !!scorecard.gradeCap,
      testDate: scorecard.testDate ?? "March 2026",
      detailUrl: `/research/ai-chatbots/${p.platformId}`,
      categoryScores: (scorecard.categoryScores ?? []).map((c) => ({
        category: c.category,
        label: c.label,
        grade: c.grade,
        score: c.numericalScore,
        weight: c.weight,
      })),
      complianceGap: {
        coveragePercent: gap.coveragePercent,
        totalRequired: gap.totalRequired,
        totalCovered: gap.totalCovered,
        totalGaps: gap.totalGaps,
        topGaps: gap.topGaps,
      },
    })
  }

  // Streaming platforms
  for (const p of streamingPlatforms) {
    const totalTests = p.profiles.reduce((sum, pr) => sum + pr.tests.length, 0)
    const testCats = Array.from(new Set(p.profiles.flatMap((pr) => pr.tests.map((t) => t.category))))
    const scoreMap = new Map<string, number>()
    for (const cat of testCats) {
      const scores = p.profiles
        .flatMap((pr) => pr.tests.filter((t) => t.category === cat && t.score !== null))
        .map((t) => t.score as number)
      if (scores.length > 0) scoreMap.set(cat, scores.reduce((a, b) => a + b, 0) / scores.length)
    }
    const gap = computeComplianceGap(p.platformId, "streaming", testCats, scoreMap)

    entries.push({
      platformId: p.platformId,
      platformName: p.platformName,
      category: "streaming",
      overallGrade: p.overallGrade,
      numericalScore: p.overallScore,
      totalTests,
      criticalFailures: p.criticalFailures?.length ?? 0,
      gradeCapped: p.profiles.some((pr) => !!pr.gradeCap),
      testDate: p.testDate || "February 2026",
      detailUrl: `/research/streaming/${p.platformId}`,
      profileGrades: p.profiles.map((pr) => ({
        profileId: pr.profileId,
        profileType: pr.profileType,
        grade: pr.overallGrade,
        score: pr.weightedScore,
      })),
      complianceGap: {
        coveragePercent: gap.coveragePercent,
        totalRequired: gap.totalRequired,
        totalCovered: gap.totalCovered,
        totalGaps: gap.totalGaps,
        topGaps: gap.topGaps,
      },
    })
  }

  // Sort by score descending
  entries.sort((a, b) => (b.numericalScore as number) - (a.numericalScore as number))

  // Assign ranks
  let rank = 1
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && (entries[i].numericalScore as number) < (entries[i - 1].numericalScore as number)) {
      rank = i + 1
    }
    entries[i].rank = rank
  }

  // Compute regulatory data
  const platformIds = entries.map((e) => e.platformId as string)
  const exposureMap = computeAllExposures(platformIds)
  for (const entry of entries) {
    const exp = exposureMap.get(entry.platformId as string)
    if (exp) {
      entry.regulatory = {
        exposureLevel: exp.exposureLevel,
        applicableLawCount: exp.applicableLawCount,
        enactedCount: exp.enactedCount,
        pendingCount: exp.pendingCount,
        jurisdictionCount: exp.jurisdictionCount,
        topLaws: exp.topLaws,
      }
    }
  }

  const landscape = computeRegulatoryLandscape()

  return NextResponse.json({
    meta: {
      totalPlatforms: entries.length,
      totalTests: entries.reduce((sum, e) => sum + (e.totalTests as number), 0),
      testCategories: 21,
      testingPeriod: "March 2026",
      generatedAt: new Date().toISOString(),
      version: "1.0",
    },
    platforms: entries,
    regulatoryLandscape: landscape,
  })
}
