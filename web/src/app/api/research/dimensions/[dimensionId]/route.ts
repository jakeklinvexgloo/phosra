import { NextResponse } from "next/server"

import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"

export const runtime = "nodejs"

const VALID_DIMENSIONS = [
  "safety-testing",
  "age-verification",
  "parental-controls",
  "conversation-controls",
  "emotional-safety",
  "academic-integrity",
  "privacy-data",
] as const

type DimensionId = (typeof VALID_DIMENSIONS)[number]

const DIMENSION_LABELS: Record<DimensionId, string> = {
  "safety-testing": "Safety Testing",
  "age-verification": "Age Verification",
  "parental-controls": "Parental Controls",
  "conversation-controls": "Conversation Controls",
  "emotional-safety": "Emotional Safety",
  "academic-integrity": "Academic Integrity",
  "privacy-data": "Privacy & Data",
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
}

/** GET /api/research/dimensions/:dimensionId — Cross-platform data for a single research dimension */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ dimensionId: string }> }
) {
  const { dimensionId } = await params

  if (!VALID_DIMENSIONS.includes(dimensionId as DimensionId)) {
    return NextResponse.json(
      {
        error: `Dimension "${dimensionId}" not found. Valid dimensions: ${VALID_DIMENSIONS.join(", ")}`,
      },
      { status: 404, headers: CORS_HEADERS }
    )
  }

  const dim = dimensionId as DimensionId
  const allPlatforms = await loadAllChatbotResearch()

  const platforms = allPlatforms.map((platform) => {
    const chatbotData = platform.chatbotData

    let data: unknown = null

    if (chatbotData) {
      switch (dim) {
        case "safety-testing":
          data = chatbotData.safetyTesting?.scorecard ?? null
          break
        case "age-verification":
          data = chatbotData.ageVerificationDetail ?? null
          break
        case "parental-controls":
          data = chatbotData.parentalControlsDetail ?? null
          break
        case "conversation-controls":
          data = chatbotData.conversationControls ?? null
          break
        case "emotional-safety":
          data = chatbotData.emotionalSafety ?? null
          break
        case "academic-integrity":
          data = chatbotData.academicIntegrity ?? null
          break
        case "privacy-data":
          data = chatbotData.privacyDataDetail ?? null
          break
      }
    }

    return {
      platformId: platform.platformId,
      platformName: platform.platformName,
      data,
    }
  })

  return NextResponse.json(
    {
      dimension: dim,
      dimensionLabel: DIMENSION_LABELS[dim],
      platforms,
    },
    { headers: CORS_HEADERS }
  )
}
