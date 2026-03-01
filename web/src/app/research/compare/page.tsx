import { Metadata } from "next"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import { loadAllStreamingPlatforms } from "@/lib/streaming-research/loaders"
import { CrossPortalClient, type UnifiedPlatform } from "@/app/research/_components/CrossPortalClient"

export const metadata: Metadata = {
  title: "Cross-Portal Safety Comparison — Phosra Research",
  description:
    "Compare child safety across AI chatbots and streaming platforms side by side. See how ChatGPT, Netflix, Claude, Peacock, and more stack up on a unified 0-100 safety scale.",
}

export default async function CrossPortalComparePage() {
  const [chatbots, streamingPlatforms] = await Promise.all([
    loadAllChatbotResearch(),
    loadAllStreamingPlatforms(),
  ])

  const unified: UnifiedPlatform[] = []

  // Map chatbot platforms
  for (const p of chatbots) {
    const scorecard = p.chatbotData?.safetyTesting?.scorecard
    unified.push({
      id: p.platformId,
      name: p.platformName,
      type: "ai-chatbot",
      overallGrade: scorecard?.overallGrade ?? "N/A",
      overallScore: scorecard?.numericalScore ?? 0,
      gradeCap: scorecard?.gradeCap,
      gradeCapReasons: scorecard?.gradeCapReasons,
      detailHref: `/research/ai-chatbots/${p.platformId}`,
      testCount: scorecard?.completedTests ?? 0,
    })
  }

  // Map streaming platforms
  for (const p of streamingPlatforms) {
    const totalTests = p.profiles.reduce((sum, pr) => sum + pr.tests.length, 0)
    unified.push({
      id: p.platformId,
      name: p.platformName,
      type: "streaming",
      overallGrade: p.overallGrade,
      overallScore: p.overallScore,
      detailHref: `/research/streaming/${p.platformId}`,
      testCount: totalTests,
    })
  }

  return <CrossPortalClient platforms={unified} />
}
