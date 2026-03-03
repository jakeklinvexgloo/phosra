import { Metadata } from "next"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import { loadAllStreamingPlatforms } from "@/lib/streaming-research/loaders"
import { ScoresClient } from "./ScoresClient"

export const metadata: Metadata = {
  title: "Platform Safety Scorecard — Phosra",
  description:
    "The first independent child safety accountability index. See how 11 major platforms rank in protecting children, with standardized safety testing across AI chatbots and streaming services.",
  openGraph: {
    title: "Platform Safety Scorecard — Phosra",
    description:
      "Independent child safety rankings for 11 major platforms. Standardized testing, transparent methodology, published results.",
  },
}

export interface PlatformScoreEntry {
  rank: number
  platformId: string
  platformName: string
  category: "ai_chatbot" | "streaming"
  categoryLabel: string
  overallGrade: string
  numericalScore: number
  totalTests: number
  criticalFailures: number
  gradeCapped: boolean
  gradeCapReasons: string[]
  testDate: string
  detailUrl: string
  topCategories: { name: string; grade: string; score: number }[]
}

export default async function ScoresPage() {
  const [chatbotPlatforms, streamingPlatforms] = await Promise.all([
    loadAllChatbotResearch(),
    loadAllStreamingPlatforms(),
  ])

  const entries: PlatformScoreEntry[] = []

  // Build entries from chatbot platforms
  for (const p of chatbotPlatforms) {
    const scorecard = p.chatbotData?.safetyTesting?.scorecard
    if (!scorecard) continue

    // Get top 5 category scores by weight
    const sortedCategories = [...(scorecard.categoryScores ?? [])]
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5)

    entries.push({
      rank: 0, // will be assigned after sorting
      platformId: p.platformId,
      platformName: p.platformName,
      category: "ai_chatbot",
      categoryLabel: "AI Chatbot",
      overallGrade: scorecard.overallGrade,
      numericalScore: scorecard.numericalScore,
      totalTests: scorecard.completedTests,
      criticalFailures: scorecard.criticalFailures?.length ?? 0,
      gradeCapped: !!scorecard.gradeCap,
      gradeCapReasons: scorecard.gradeCapReasons ?? [],
      testDate: scorecard.testDate ?? "March 2026",
      detailUrl: `/research/ai-chatbots/${p.platformId}`,
      topCategories: sortedCategories.map((c) => ({
        name: c.label,
        grade: c.grade,
        score: c.numericalScore,
      })),
    })
  }

  // Build entries from streaming platforms
  for (const p of streamingPlatforms) {
    // Count total tests across all profiles
    const totalTests = p.profiles.reduce(
      (sum, profile) => sum + profile.tests.length,
      0
    )

    // Build top categories from profile grades
    const topCategories = p.profiles.map((profile) => ({
      name:
        profile.profileType === "kids"
          ? `Kids (${profile.profileId})`
          : profile.profileType === "teen"
            ? `Teen (${profile.profileId})`
            : `Standard (${profile.profileId})`,
      grade: profile.overallGrade,
      score: profile.weightedScore,
    }))

    entries.push({
      rank: 0,
      platformId: p.platformId,
      platformName: p.platformName,
      category: "streaming",
      categoryLabel: "Streaming",
      overallGrade: p.overallGrade,
      numericalScore: p.overallScore,
      totalTests,
      criticalFailures: p.criticalFailures?.length ?? 0,
      gradeCapped: p.profiles.some((pr) => !!pr.gradeCap),
      gradeCapReasons: p.profiles
        .flatMap((pr) => pr.gradeCapReasons ?? [])
        .filter((v, i, a) => a.indexOf(v) === i),
      testDate: p.testDate || "February 2026",
      detailUrl: `/research/streaming/${p.platformId}`,
      topCategories,
    })
  }

  // Sort by numerical score descending
  entries.sort((a, b) => b.numericalScore - a.numericalScore)

  // Assign ranks (ties get same rank)
  let currentRank = 1
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && entries[i].numericalScore < entries[i - 1].numericalScore) {
      currentRank = i + 1
    }
    entries[i].rank = currentRank
  }

  // Compute total tests and test categories
  const totalTests = entries.reduce((sum, e) => sum + e.totalTests, 0)
  const testCategories = 21 // 12 AI + 9 streaming

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Phosra Platform Safety Scorecard",
    description:
      "Independent child safety rankings for major digital platforms",
    creator: { "@type": "Organization", name: "Phosra" },
    license: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
    dateModified: "2026-03-01",
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ScoresClient
        entries={entries}
        totalPlatforms={entries.length}
        totalTests={totalTests}
        testCategories={testCategories}
      />
    </>
  )
}
