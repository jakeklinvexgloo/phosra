import { Metadata } from "next"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import { CompareClient } from "../_components/CompareClient"

export const metadata: Metadata = {
  title: "Compare Platforms — AI Safety Research — Phosra",
  description: "Side-by-side safety comparison of AI chatbot platforms across all research dimensions.",
}

export default async function ComparePage() {
  const platforms = await loadAllChatbotResearch()

  const summaries = platforms.map((p) => ({
    platformId: p.platformId,
    platformName: p.platformName,
    scorecard: p.chatbotData?.safetyTesting?.scorecard ?? null,
    ageVerification: p.chatbotData?.ageVerificationDetail ?? null,
    parentalControls: p.chatbotData?.parentalControlsDetail ?? null,
    conversationControls: p.chatbotData?.conversationControls ?? null,
    emotionalSafety: p.chatbotData?.emotionalSafety ?? null,
    academicIntegrity: p.chatbotData?.academicIntegrity ?? null,
    privacyData: p.chatbotData?.privacyDataDetail ?? null,
  }))

  return <CompareClient platforms={summaries} />
}
