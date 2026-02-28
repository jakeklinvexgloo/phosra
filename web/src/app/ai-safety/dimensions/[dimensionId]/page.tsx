import { Metadata } from "next"
import { notFound } from "next/navigation"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import { DimensionCrosscut } from "../../_components/DimensionCrosscut"

const DIMENSIONS: Record<string, { title: string; description: string }> = {
  "safety-testing": {
    title: "Safety Testing",
    description: "Compare safety test scores across all platforms",
  },
  "age-verification": {
    title: "Age Verification",
    description: "How each platform verifies user age and prevents underage access",
  },
  "parental-controls": {
    title: "Parental Controls",
    description: "Parent dashboard, visibility, configurable controls across all platforms",
  },
  "conversation-controls": {
    title: "Conversation Controls",
    description: "Time limits, message caps, quiet hours, and break reminders compared",
  },
  "emotional-safety": {
    title: "Emotional Safety",
    description: "Attachment patterns, retention tactics, and sycophancy incidents",
  },
  "academic-integrity": {
    title: "Academic Integrity",
    description: "Homework generation, study modes, and detection methods",
  },
  "privacy-data": {
    title: "Privacy & Data",
    description: "Data collection, model training policies, and regulatory actions",
  },
}

export function generateStaticParams() {
  return Object.keys(DIMENSIONS).map((id) => ({ dimensionId: id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dimensionId: string }>
}): Promise<Metadata> {
  const { dimensionId } = await params
  const dim = DIMENSIONS[dimensionId]
  if (!dim) return { title: "Not Found" }
  return {
    title: `${dim.title} — Cross-Platform Comparison — Phosra AI Safety`,
    description: dim.description,
  }
}

export default async function DimensionPage({
  params,
}: {
  params: Promise<{ dimensionId: string }>
}) {
  const { dimensionId } = await params
  const dim = DIMENSIONS[dimensionId]
  if (!dim) notFound()

  const platforms = await loadAllChatbotResearch()

  return (
    <DimensionCrosscut
      dimensionId={dimensionId}
      title={dim.title}
      description={dim.description}
      platforms={platforms}
    />
  )
}
