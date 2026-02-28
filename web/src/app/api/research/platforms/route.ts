import { NextResponse } from "next/server"

import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"

export const runtime = "nodejs"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
}

/** GET /api/research/platforms — All chatbot platform research as JSON */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")
  const sort = searchParams.get("sort") // "score" | "name"

  const allPlatforms = await loadAllChatbotResearch()

  let platforms = allPlatforms.map((p) => {
    const scorecard = p.chatbotData?.safetyTesting?.scorecard ?? null
    const sectionData = p.sectionData ?? null

    const categoryScores = (scorecard?.categoryScores ?? []).map((cs) => ({
      category: cs.category,
      label: cs.label,
      grade: cs.grade,
      avgScore: cs.avgScore,
      numericalScore: cs.numericalScore,
    }))

    const dimensionSummary = {
      hasSafetyTesting: p.chatbotData?.safetyTesting != null,
      hasConversationControls: p.chatbotData?.conversationControls != null,
      hasEmotionalSafety: p.chatbotData?.emotionalSafety != null,
      hasAcademicIntegrity: p.chatbotData?.academicIntegrity != null,
      hasParentalControls: p.chatbotData?.parentalControlsDetail != null,
      hasAgeVerification: p.chatbotData?.ageVerificationDetail != null,
      hasPrivacyData: p.chatbotData?.privacyDataDetail != null,
    }

    const gapStats = sectionData?.integrationGap?.stats ?? []

    return {
      platformId: p.platformId,
      platformName: p.platformName,
      overallGrade: scorecard?.overallGrade ?? null,
      numericalScore: scorecard?.numericalScore ?? null,
      completedTests: scorecard?.completedTests ?? null,
      totalTests: scorecard?.totalTests ?? null,
      categoryScores,
      dimensionSummary,
      gapStats,
    }
  })

  if (q) {
    const query = q.toLowerCase()
    platforms = platforms.filter((p) =>
      [p.platformId, p.platformName].join(" ").toLowerCase().includes(query)
    )
  }

  if (sort === "score") {
    platforms = platforms.sort((a, b) => {
      const aScore = a.numericalScore ?? -1
      const bScore = b.numericalScore ?? -1
      return bScore - aScore
    })
  } else if (sort === "name") {
    platforms = platforms.sort((a, b) =>
      a.platformName.localeCompare(b.platformName)
    )
  }

  return NextResponse.json(
    { total: platforms.length, platforms },
    { headers: CORS_HEADERS }
  )
}
