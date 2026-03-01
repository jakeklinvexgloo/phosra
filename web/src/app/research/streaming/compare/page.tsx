import type { Metadata } from "next"
import { loadAllStreamingPlatforms } from "@/lib/streaming-research/loaders"
import { STREAMING_TEST_CATEGORIES } from "@/lib/streaming-research/streaming-data-types"
import { CompareClient } from "../_components/CompareClient"

export const metadata: Metadata = {
  title: "Compare Streaming Platforms — Phosra",
  description:
    "Side-by-side comparison of parental control effectiveness across Netflix, Peacock, and Prime Video.",
}

export default async function ComparePage() {
  const platforms = await loadAllStreamingPlatforms()

  // Serialize platform data for client component
  const platformData = platforms.map((p) => ({
    platformId: p.platformId,
    platformName: p.platformName,
    overallGrade: p.overallGrade,
    profiles: p.profiles.map((pr) => ({
      profileId: pr.profileId,
      overallGrade: pr.overallGrade,
      gradeCap: pr.gradeCap,
      tests: pr.tests.map((t) => ({
        testId: t.testId,
        category: t.category,
        score: t.score,
        label: t.label,
      })),
    })),
  }))

  return <CompareClient platforms={platformData} categories={STREAMING_TEST_CATEGORIES} />
}
