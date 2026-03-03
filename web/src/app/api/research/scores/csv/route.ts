import { NextResponse } from "next/server"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import { loadAllStreamingPlatforms } from "@/lib/streaming-research/loaders"
import { computeAllExposures } from "@/lib/platform-research/regulatory-exposure"
import { computeComplianceGap } from "@/lib/platform-research/compliance-gap"

export const revalidate = 3600

interface Row {
  rank: number
  platformName: string
  category: string
  grade: string
  score: number
  totalTests: number
  criticalFailures: number
  gradeCapped: boolean
  applicableLaws: number
  exposureLevel: string
  complianceCoverage: number
  complianceGaps: number
  testDate: string
  detailUrl: string
}

export async function GET() {
  const [chatbotPlatforms, streamingPlatforms] = await Promise.all([
    loadAllChatbotResearch(),
    loadAllStreamingPlatforms(),
  ])

  const rows: Row[] = []

  for (const p of chatbotPlatforms) {
    const scorecard = p.chatbotData?.safetyTesting?.scorecard
    if (!scorecard) continue

    const testCategories = (scorecard.categoryScores ?? []).map((c) => c.category)
    const testScores = new Map<string, number>()
    for (const c of scorecard.categoryScores ?? []) {
      testScores.set(c.category, c.avgScore)
    }
    const gap = computeComplianceGap(p.platformId, "ai_chatbot", testCategories, testScores)

    rows.push({
      rank: 0,
      platformName: p.platformName,
      category: "AI Chatbot",
      grade: scorecard.overallGrade,
      score: scorecard.numericalScore,
      totalTests: scorecard.completedTests,
      criticalFailures: scorecard.criticalFailures?.length ?? 0,
      gradeCapped: !!scorecard.gradeCap,
      applicableLaws: 0,
      exposureLevel: "",
      complianceCoverage: gap.coveragePercent,
      complianceGaps: gap.totalGaps,
      testDate: scorecard.testDate ?? "March 2026",
      detailUrl: `https://www.phosra.com/research/ai-chatbots/${p.platformId}`,
    })
  }

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

    rows.push({
      rank: 0,
      platformName: p.platformName,
      category: "Streaming",
      grade: p.overallGrade,
      score: p.overallScore,
      totalTests,
      criticalFailures: p.criticalFailures?.length ?? 0,
      gradeCapped: p.profiles.some((pr) => !!pr.gradeCap),
      applicableLaws: 0,
      exposureLevel: "",
      complianceCoverage: gap.coveragePercent,
      complianceGaps: gap.totalGaps,
      testDate: p.testDate || "February 2026",
      detailUrl: `https://www.phosra.com/research/streaming/${p.platformId}`,
    })
  }

  // Sort by score descending
  rows.sort((a, b) => b.score - a.score)

  // Assign ranks
  let rank = 1
  for (let i = 0; i < rows.length; i++) {
    if (i > 0 && rows[i].score < rows[i - 1].score) rank = i + 1
    rows[i].rank = rank
  }

  // Add regulatory data
  const platformIds = rows.map((r) => r.platformName.toLowerCase().replace(/\s+/g, "_").replace(/\./g, ""))
  const nameToId: Record<string, string> = {
    "Claude": "claude", "Microsoft Copilot": "copilot", "Perplexity": "perplexity",
    "ChatGPT": "chatgpt", "Character.AI": "character_ai", "Gemini": "gemini",
    "Grok": "grok", "Replika": "replika", "Netflix": "netflix",
    "Peacock": "peacock", "Prime Video": "prime_video",
  }
  const ids = rows.map((r) => nameToId[r.platformName] ?? r.platformName.toLowerCase())
  const exposureMap = computeAllExposures(ids)
  for (let i = 0; i < rows.length; i++) {
    const exp = exposureMap.get(ids[i])
    if (exp) {
      rows[i].applicableLaws = exp.applicableLawCount
      rows[i].exposureLevel = exp.exposureLevel
    }
  }

  // Build CSV
  const headers = [
    "Rank", "Platform", "Category", "Grade", "Score", "Total Tests",
    "Critical Failures", "Grade Capped", "Applicable Laws", "Exposure Level",
    "Compliance Coverage %", "Compliance Gaps", "Test Date", "Report URL",
  ]

  const csvRows = rows.map((r) => [
    r.rank,
    `"${r.platformName}"`,
    r.category,
    r.grade,
    r.score,
    r.totalTests,
    r.criticalFailures,
    r.gradeCapped ? "Yes" : "No",
    r.applicableLaws,
    r.exposureLevel,
    r.complianceCoverage,
    r.complianceGaps,
    `"${r.testDate}"`,
    r.detailUrl,
  ].join(","))

  const csv = [headers.join(","), ...csvRows].join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=phosra-safety-scorecard.csv",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
