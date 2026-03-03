import { Metadata } from "next"
import { notFound } from "next/navigation"
import { loadPlatformResearch, AI_CHATBOT_PLATFORM_IDS } from "@/lib/platform-research/loaders"
import { computeRegulatoryExposure } from "@/lib/platform-research/regulatory-exposure"
import { computeComplianceGap } from "@/lib/platform-research/compliance-gap"
import { PlatformDetailClient } from "../_components/PlatformDetailClient"

export function generateStaticParams() {
  return AI_CHATBOT_PLATFORM_IDS.map((id) => ({ platformId: id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ platformId: string }>
}): Promise<Metadata> {
  const { platformId } = await params
  const data = await loadPlatformResearch(platformId)
  if (!data) return { title: "Platform Not Found — Phosra" }
  return {
    title: `${data.platformName} Safety Report — Phosra AI Safety Research`,
    description: `Comprehensive safety analysis of ${data.platformName}: ${data.chatbotData?.safetyTesting?.scorecard.overallGrade ?? "N/A"} safety grade, age verification, parental controls, privacy practices, and more.`,
  }
}

export default async function PlatformDetailPage({
  params,
}: {
  params: Promise<{ platformId: string }>
}) {
  const { platformId } = await params
  const data = await loadPlatformResearch(platformId)
  if (!data) notFound()

  // Compute regulatory exposure
  const regulatory = computeRegulatoryExposure(platformId)

  // Compute compliance gap from safety test data
  const scorecard = data.chatbotData?.safetyTesting?.scorecard
  const testCategories = (scorecard?.categoryScores ?? []).map((c) => c.category)
  const testScores = new Map<string, number>()
  for (const c of scorecard?.categoryScores ?? []) {
    testScores.set(c.category, c.avgScore)
  }
  const complianceGap = computeComplianceGap(platformId, "ai_chatbot", testCategories, testScores)

  return (
    <PlatformDetailClient
      data={data}
      regulatory={{
        exposureLevel: regulatory.exposureLevel,
        applicableLawCount: regulatory.applicableLawCount,
        enactedCount: regulatory.enactedCount,
        pendingCount: regulatory.pendingCount,
        jurisdictionCount: regulatory.jurisdictionCount,
        topLaws: regulatory.topLaws,
      }}
      complianceGap={{
        coveragePercent: complianceGap.coveragePercent,
        totalRequired: complianceGap.totalRequired,
        totalCovered: complianceGap.totalCovered,
        totalGaps: complianceGap.totalGaps,
        topGaps: complianceGap.topGaps,
        entries: complianceGap.entries.map((e) => ({
          ruleCategory: e.ruleCategory,
          label: e.label,
          status: e.status,
        })),
      }}
    />
  )
}
