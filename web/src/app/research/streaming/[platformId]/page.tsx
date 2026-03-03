import { Metadata } from "next"
import { notFound } from "next/navigation"
import { loadStreamingPlatform } from "@/lib/streaming-research/loaders"
import {
  STREAMING_PLATFORM_IDS,
  type StreamingPlatformId,
} from "@/lib/streaming-research/streaming-data-types"
import { computeRegulatoryExposure } from "@/lib/platform-research/regulatory-exposure"
import { computeComplianceGap } from "@/lib/platform-research/compliance-gap"
import { PlatformDetailClient } from "../_components/PlatformDetailClient"

function isValidPlatformId(id: string): id is StreamingPlatformId {
  return (STREAMING_PLATFORM_IDS as readonly string[]).includes(id)
}

export function generateStaticParams() {
  return STREAMING_PLATFORM_IDS.map((id) => ({ platformId: id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ platformId: string }>
}): Promise<Metadata> {
  const { platformId } = await params
  if (!isValidPlatformId(platformId)) {
    return { title: "Platform Not Found — Phosra" }
  }
  try {
    const data = await loadStreamingPlatform(platformId)
    return {
      title: `${data.platformName} Streaming Safety Report — Phosra Research`,
      description: `Content safety analysis of ${data.platformName}: ${data.overallGrade} overall grade across ${data.profiles.length} user profiles and 9 test categories. ${data.criticalFailures.length} critical failure${data.criticalFailures.length !== 1 ? "s" : ""} found.`,
    }
  } catch {
    return { title: "Platform Not Found — Phosra" }
  }
}

export default async function StreamingPlatformDetailPage({
  params,
}: {
  params: Promise<{ platformId: string }>
}) {
  const { platformId } = await params
  if (!isValidPlatformId(platformId)) notFound()

  try {
    const data = await loadStreamingPlatform(platformId)

    // Compute regulatory exposure
    const regulatory = computeRegulatoryExposure(platformId)

    // Compute compliance gap from streaming test data
    const testCats = Array.from(
      new Set(data.profiles.flatMap((pr) => pr.tests.map((t) => t.category)))
    )
    const scoreMap = new Map<string, number>()
    for (const cat of testCats) {
      const scores = data.profiles
        .flatMap((pr) => pr.tests.filter((t) => t.category === cat && t.score !== null))
        .map((t) => t.score as number)
      if (scores.length > 0) scoreMap.set(cat, scores.reduce((a, b) => a + b, 0) / scores.length)
    }
    const complianceGap = computeComplianceGap(platformId, "streaming", testCats, scoreMap)

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
  } catch {
    notFound()
  }
}
