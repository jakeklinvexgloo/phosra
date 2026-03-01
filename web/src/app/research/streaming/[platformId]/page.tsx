import { Metadata } from "next"
import { notFound } from "next/navigation"
import { loadStreamingPlatform } from "@/lib/streaming-research/loaders"
import {
  STREAMING_PLATFORM_IDS,
  type StreamingPlatformId,
} from "@/lib/streaming-research/streaming-data-types"
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
    return <PlatformDetailClient data={data} />
  } catch {
    notFound()
  }
}
