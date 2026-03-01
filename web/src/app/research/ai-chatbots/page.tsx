import { Metadata } from "next"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import { AISafetyHubClient } from "./_components/AISafetyHubClient"

export const metadata: Metadata = {
  title: "AI Safety Research Portal — Phosra",
  description:
    "Independent safety research across 8 AI chatbot platforms, 7 research dimensions, and 40 test prompts. See how ChatGPT, Claude, Gemini, and more protect children.",
  openGraph: {
    title: "AI Safety Research Portal — Phosra",
    description:
      "Independent safety research across 8 AI chatbot platforms. Comprehensive testing of age verification, parental controls, content safety, and more.",
  },
}

export default async function AISafetyHubPage() {
  const platforms = await loadAllChatbotResearch()

  // Build serializable summaries for client component
  const platformSummaries = platforms.map((p) => {
    const scorecard = p.chatbotData?.safetyTesting?.scorecard
    const ageVerification = p.chatbotData?.ageVerificationDetail
    const parentalControls = p.chatbotData?.parentalControlsDetail
    const conversationControls = p.chatbotData?.conversationControls
    const emotionalSafety = p.chatbotData?.emotionalSafety
    const academicIntegrity = p.chatbotData?.academicIntegrity
    const privacyData = p.chatbotData?.privacyDataDetail

    return {
      platformId: p.platformId,
      platformName: p.platformName,
      overallGrade: scorecard?.overallGrade ?? "N/A",
      numericalScore: scorecard?.numericalScore ?? 0,
      gradeCap: scorecard?.gradeCap,
      gradeCapReasons: scorecard?.gradeCapReasons,
      totalTests: scorecard?.totalTests ?? 0,
      completedTests: scorecard?.completedTests ?? 0,
      categoryScores: scorecard?.categoryScores ?? [],
      scoreDistribution: scorecard?.scoreDistribution ?? {
        fullBlock: 0,
        partialBlock: 0,
        softWarning: 0,
        compliant: 0,
        enthusiastic: 0,
      },
      // Dimension availability flags
      hasAgeVerification: !!ageVerification,
      hasParentalControls: !!parentalControls,
      hasConversationControls: !!conversationControls,
      hasEmotionalSafety: !!emotionalSafety,
      hasAcademicIntegrity: !!academicIntegrity,
      hasPrivacyData: !!privacyData,
      // Key dimension data points
      minimumAge: ageVerification?.minimumAge ?? null,
      circumventionEase: ageVerification?.circumventionEase ?? null,
      hasParentalDashboard: parentalControls ? (parentalControls.visibilityMatrix ?? []).some((v) => v.visible) : false,
      hasTimeLimits: conversationControls ? (conversationControls.timeLimits ?? []).some((t) => t.available) : false,
      hasQuietHours: conversationControls?.quietHours?.available ?? false,
      // Integration gap stats
      gapStats: p.sectionData?.integrationGap?.stats ?? [],
    }
  })

  return <AISafetyHubClient platforms={platformSummaries} />
}
