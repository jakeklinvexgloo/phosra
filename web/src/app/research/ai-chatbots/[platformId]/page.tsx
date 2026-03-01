import { Metadata } from "next"
import { notFound } from "next/navigation"
import { loadPlatformResearch, AI_CHATBOT_PLATFORM_IDS } from "@/lib/platform-research/loaders"
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

  return <PlatformDetailClient data={data} />
}
