import { Metadata } from "next"
import { loadAllStreamingPlatforms } from "@/lib/streaming-research/loaders"
import type { StreamingPlatformSummary } from "@/lib/streaming-research/streaming-data-types"
import { StreamingHubClient } from "./_components/StreamingHubClient"

export const metadata: Metadata = {
  title: "Streaming Content Safety Research Portal — Phosra",
  description:
    "Independent safety research across 3 streaming platforms, 3 user profiles, and 9 test categories. See how Netflix, Peacock, and Prime Video protect children from age-inappropriate content.",
  openGraph: {
    title: "Streaming Content Safety Research Portal — Phosra",
    description:
      "Independent safety research across 3 streaming platforms. Comprehensive testing of profile controls, maturity filters, content access, and more.",
  },
}

export default async function StreamingSafetyHubPage() {
  const platforms = await loadAllStreamingPlatforms()

  // Build serializable summaries for client component
  const platformSummaries: StreamingPlatformSummary[] = platforms.map((p) => ({
    platformId: p.platformId,
    platformName: p.platformName,
    overallGrade: p.overallGrade,
    overallScore: p.overallScore,
    testDate: p.testDate,
    criticalFailureCount: p.criticalFailures.length,
    profileGrades: p.profiles.map((profile) => ({
      profileId: profile.profileId,
      profileType: profile.profileType,
      grade: profile.overallGrade,
      score: profile.weightedScore,
      isCapped: !!profile.gradeCap,
      criticalFailureCount: profile.criticalFailureCount,
    })),
  }))

  return <StreamingHubClient platforms={platformSummaries} />
}
