import { NextResponse } from "next/server"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import { loadAllStreamingPlatforms } from "@/lib/streaming-research/loaders"
import { computeAllExposures } from "@/lib/platform-research/regulatory-exposure"
import { computeComplianceGap } from "@/lib/platform-research/compliance-gap"

export const revalidate = 3600

const CATEGORY_LABELS: Record<string, string> = {
  self_harm: "Self-Harm & Suicide",
  predatory_grooming: "Predatory & Grooming",
  explicit_sexual: "Sexual & Explicit Content",
  violence_weapons: "Violence & Weapons",
  drugs_substances: "Drugs & Substances",
  radicalization: "Radicalization",
  eating_disorders: "Eating Disorders",
  emotional_manipulation: "Emotional Manipulation",
  cyberbullying: "Cyberbullying",
  pii_extraction: "PII Extraction",
  jailbreak_resistance: "Jailbreak Resistance",
  academic_dishonesty: "Academic Integrity",
  "PE-01": "Profile Escape",
  "SD-01": "Search & Discovery",
  "PL-01": "PIN/Lock Bypass",
  "RL-01": "Recommendation Leakage",
  "MF-01": "Maturity Filter",
  "DU-01": "Direct URL / Deep Link",
  "KM-01": "Kids Mode Escape",
  "CB-01": "Cross-Profile Bleed",
  "CG-01": "Content Rating Gaps",
}

function scoreToGrade(score: number): string {
  if (score >= 97) return "A+"
  if (score >= 93) return "A"
  if (score >= 90) return "A-"
  if (score >= 87) return "B+"
  if (score >= 83) return "B"
  if (score >= 80) return "B-"
  if (score >= 77) return "C+"
  if (score >= 73) return "C"
  if (score >= 70) return "C-"
  if (score >= 67) return "D+"
  if (score >= 63) return "D"
  if (score >= 60) return "D-"
  return "F"
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ platformId: string }> }
) {
  const { platformId } = await params

  const [chatbotPlatforms, streamingPlatforms] = await Promise.all([
    loadAllChatbotResearch(),
    loadAllStreamingPlatforms(),
  ])

  // Try chatbot first
  const chatbot = chatbotPlatforms.find((p) => p.platformId === platformId)
  if (chatbot) {
    const sc = chatbot.chatbotData?.safetyTesting?.scorecard
    if (!sc) {
      return NextResponse.json({ error: "No scorecard data for this platform" }, { status: 404 })
    }

    const testCategories = (sc.categoryScores ?? []).map((c) => c.category)
    const testScores = new Map<string, number>()
    for (const c of sc.categoryScores ?? []) {
      testScores.set(c.category, c.avgScore)
    }
    const gap = computeComplianceGap(platformId, "ai_chatbot", testCategories, testScores)
    const exposureMap = computeAllExposures([platformId])
    const exp = exposureMap.get(platformId)

    return NextResponse.json({
      platformId,
      platformName: chatbot.platformName,
      category: "ai_chatbot",
      overallGrade: sc.overallGrade,
      numericalScore: sc.numericalScore,
      totalTests: sc.completedTests,
      criticalFailures: (sc.criticalFailures ?? []).map((f) => ({
        category: f.category,
        testId: f.testId,
        score: f.score,
      })),
      gradeCapped: !!sc.gradeCap,
      gradeCap: sc.gradeCap ?? null,
      testDate: sc.testDate ?? "March 2026",
      categoryScores: (sc.categoryScores ?? []).map((c) => ({
        categoryId: c.category,
        label: c.label,
        grade: c.grade,
        score: c.numericalScore,
        avgRawScore: c.avgScore,
        weight: c.weight,
        testCount: c.testCount,
      })),
      regulatory: exp
        ? {
            exposureLevel: exp.exposureLevel,
            applicableLawCount: exp.applicableLawCount,
            enactedCount: exp.enactedCount,
            pendingCount: exp.pendingCount,
            jurisdictionCount: exp.jurisdictionCount,
            topLaws: exp.topLaws,
          }
        : null,
      complianceGap: {
        coveragePercent: gap.coveragePercent,
        totalRequired: gap.totalRequired,
        totalCovered: gap.totalCovered,
        totalGaps: gap.totalGaps,
        entries: gap.entries,
      },
      links: {
        scorecard: `https://www.phosra.com/research/scores/platforms/${platformId}`,
        fullReport: `https://www.phosra.com/research/ai-chatbots/${platformId}`,
        api: `https://www.phosra.com/api/research/scores/platforms/${platformId}`,
      },
    })
  }

  // Try streaming
  const streaming = streamingPlatforms.find((p) => p.platformId === platformId)
  if (streaming) {
    const categoryScores: { categoryId: string; label: string; grade: string; score: number; testCount: number }[] = []
    for (const [catId, label] of Object.entries(CATEGORY_LABELS)) {
      if (!catId.includes("-")) continue // streaming categories have hyphens
      const scores: number[] = []
      for (const profile of streaming.profiles) {
        const test = profile.tests.find((t) => t.testId === catId)
        if (test && test.score !== null) scores.push(test.score)
      }
      if (scores.length === 0) continue
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      const score100 = Math.round(((4 - avg) / 4) * 100 * 10) / 10
      categoryScores.push({
        categoryId: catId,
        label,
        grade: scoreToGrade(score100),
        score: score100,
        testCount: scores.length,
      })
    }

    const exposureMap = computeAllExposures([platformId])
    const exp = exposureMap.get(platformId)
    const testCats = Array.from(new Set(streaming.profiles.flatMap((pr) => pr.tests.map((t) => t.category))))
    const scoreMap = new Map<string, number>()
    for (const cat of testCats) {
      const scores = streaming.profiles
        .flatMap((pr) => pr.tests.filter((t) => t.category === cat && t.score !== null))
        .map((t) => t.score as number)
      if (scores.length > 0) scoreMap.set(cat, scores.reduce((a, b) => a + b, 0) / scores.length)
    }
    const gap = computeComplianceGap(platformId, "streaming", testCats, scoreMap)

    return NextResponse.json({
      platformId,
      platformName: streaming.platformName,
      category: "streaming",
      overallGrade: streaming.overallGrade,
      numericalScore: streaming.overallScore,
      totalTests: streaming.profiles.reduce((s, pr) => s + pr.tests.length, 0),
      criticalFailures: (streaming.criticalFailures ?? []).map((f) => ({
        description: f.description,
      })),
      gradeCapped: streaming.profiles.some((pr) => !!pr.gradeCap),
      testDate: streaming.testDate || "February 2026",
      profileGrades: streaming.profiles.map((pr) => ({
        profileId: pr.profileId,
        profileType: pr.profileType,
        grade: pr.overallGrade,
        score: pr.weightedScore,
      })),
      categoryScores,
      regulatory: exp
        ? {
            exposureLevel: exp.exposureLevel,
            applicableLawCount: exp.applicableLawCount,
            enactedCount: exp.enactedCount,
            pendingCount: exp.pendingCount,
            jurisdictionCount: exp.jurisdictionCount,
            topLaws: exp.topLaws,
          }
        : null,
      complianceGap: {
        coveragePercent: gap.coveragePercent,
        totalRequired: gap.totalRequired,
        totalCovered: gap.totalCovered,
        totalGaps: gap.totalGaps,
        entries: gap.entries,
      },
      links: {
        scorecard: `https://www.phosra.com/research/scores/platforms/${platformId}`,
        fullReport: `https://www.phosra.com/research/streaming/${platformId}`,
        api: `https://www.phosra.com/api/research/scores/platforms/${platformId}`,
      },
    })
  }

  return NextResponse.json({ error: "Platform not found" }, { status: 404 })
}
