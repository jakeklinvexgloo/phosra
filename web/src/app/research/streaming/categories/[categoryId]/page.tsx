import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { loadAllStreamingPlatforms } from "@/lib/streaming-research/loaders"
import { STREAMING_TEST_CATEGORIES } from "@/lib/streaming-research/streaming-data-types"
import { CategoryCrosscutClient } from "../../_components/CategoryCrosscutClient"

const PROFILE_LABELS: Record<string, string> = {
  TestChild7: "Child (7)",
  TestChild12: "Child (12)",
  TestTeen16: "Teen (16)",
}

export function generateStaticParams() {
  return STREAMING_TEST_CATEGORIES.map((cat) => ({
    categoryId: cat.id,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoryId: string }>
}): Promise<Metadata> {
  const { categoryId } = await params
  const category = STREAMING_TEST_CATEGORIES.find((c) => c.id === categoryId)
  if (!category) return { title: "Category Not Found — Phosra" }

  return {
    title: `${category.category} — Streaming Safety — Phosra`,
    description: `See how streaming platforms score on ${category.category}: ${category.description}`,
  }
}

export default async function CategoryCrosscutPage({
  params,
}: {
  params: Promise<{ categoryId: string }>
}) {
  const { categoryId } = await params
  const category = STREAMING_TEST_CATEGORIES.find((c) => c.id === categoryId)
  if (!category) notFound()

  const allPlatforms = await loadAllStreamingPlatforms()
  const prefix = categoryId.replace(/-\d+$/, "")

  const platforms = allPlatforms.map((platform) => ({
    platformId: platform.platformId,
    platformName: platform.platformName,
    overallGrade: platform.overallGrade,
    profiles: platform.profiles.map((profile) => {
      // Find test by exact ID or prefix match
      const test =
        profile.tests.find((t) => t.testId === categoryId) ??
        profile.tests.find((t) => t.testId.startsWith(prefix + "-")) ??
        null

      return {
        profileId: profile.profileId,
        profileLabel: PROFILE_LABELS[profile.profileId] ?? profile.profileId,
        overallGrade: profile.overallGrade,
        gradeCap: profile.gradeCap,
        test: test
          ? {
              testId: test.testId,
              score: test.score,
              label: test.label,
              description: test.description,
            }
          : null,
      }
    }),
  }))

  return <CategoryCrosscutClient category={category} platforms={platforms} />
}
