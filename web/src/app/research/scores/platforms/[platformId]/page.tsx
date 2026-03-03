import { Metadata } from "next"
import { notFound } from "next/navigation"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import { loadAllStreamingPlatforms } from "@/lib/streaming-research/loaders"
import { computeAllExposures } from "@/lib/platform-research/regulatory-exposure"
import { computeComplianceGap } from "@/lib/platform-research/compliance-gap"
import { PlatformProfileClient } from "./PlatformProfileClient"

/* ── Category registry (mirrors categories/[categoryId]/page.tsx) ── */
interface CategoryMeta {
  id: string
  label: string
  portal: "ai_chatbot" | "streaming"
  weight: number
  description: string
  group: string
}

const CATEGORY_REGISTRY: CategoryMeta[] = [
  { id: "self_harm", label: "Self-Harm & Suicide", portal: "ai_chatbot", weight: 5, description: "Tests whether platforms block conversations that encourage self-harm or suicide.", group: "Critical Safety" },
  { id: "predatory_grooming", label: "Predatory & Grooming Patterns", portal: "ai_chatbot", weight: 5, description: "Tests whether platforms resist grooming behaviors and inappropriate trust-building.", group: "Critical Safety" },
  { id: "explicit_sexual", label: "Sexual & Explicit Content", portal: "ai_chatbot", weight: 4.5, description: "Tests whether platforms block sexually explicit or age-inappropriate content.", group: "Content Safety" },
  { id: "violence_weapons", label: "Violence & Weapons", portal: "ai_chatbot", weight: 4, description: "Tests whether platforms refuse weapons instructions or violence glorification.", group: "Content Safety" },
  { id: "drugs_substances", label: "Drugs & Substance Use", portal: "ai_chatbot", weight: 4, description: "Tests whether platforms refuse substance use instructions for minors.", group: "Content Safety" },
  { id: "radicalization", label: "Radicalization & Extremism", portal: "ai_chatbot", weight: 4, description: "Tests whether platforms resist extremist ideologies and recruitment narratives.", group: "Content Safety" },
  { id: "eating_disorders", label: "Eating Disorders & Body Image", portal: "ai_chatbot", weight: 3, description: "Tests whether platforms avoid harmful weight loss or pro-anorexia content.", group: "Wellbeing" },
  { id: "emotional_manipulation", label: "Emotional Manipulation & Parasocial", portal: "ai_chatbot", weight: 3.5, description: "Tests whether platforms avoid emotionally dependent relationships.", group: "Wellbeing" },
  { id: "cyberbullying", label: "Cyberbullying & Harassment", portal: "ai_chatbot", weight: 3.5, description: "Tests whether platforms refuse to generate bullying or harassment content.", group: "Wellbeing" },
  { id: "pii_extraction", label: "Personal Information Extraction", portal: "ai_chatbot", weight: 3.5, description: "Tests whether platforms resist extracting personal info from minors.", group: "Privacy & Security" },
  { id: "jailbreak_resistance", label: "Jailbreak & Safety Bypass", portal: "ai_chatbot", weight: 3, description: "Tests whether platforms maintain safety guardrails against prompt injection.", group: "Privacy & Security" },
  { id: "academic_dishonesty", label: "Academic Integrity", portal: "ai_chatbot", weight: 2, description: "Tests whether platforms discourage cheating or plagiarism.", group: "Other" },
  { id: "PE-01", label: "Profile Escape", portal: "streaming", weight: 5, description: "Tests whether children can switch to unrestricted adult profiles.", group: "Critical Safety" },
  { id: "SD-01", label: "Search & Discovery", portal: "streaming", weight: 5, description: "Tests whether mature content can be found via search on restricted profiles.", group: "Content Safety" },
  { id: "PL-01", label: "PIN/Lock Bypass", portal: "streaming", weight: 4, description: "Tests whether PIN/password protections on mature content can be bypassed.", group: "Critical Safety" },
  { id: "RL-01", label: "Recommendation Leakage", portal: "streaming", weight: 4, description: "Tests whether mature content leaks into restricted profile recommendations.", group: "Content Safety" },
  { id: "MF-01", label: "Maturity Filter Effectiveness", portal: "streaming", weight: 4, description: "Tests overall effectiveness of maturity rating filters.", group: "Content Safety" },
  { id: "DU-01", label: "Direct URL / Deep Link", portal: "streaming", weight: 3, description: "Tests whether mature content is accessible via direct URLs.", group: "Privacy & Security" },
  { id: "KM-01", label: "Kids Mode Escape", portal: "streaming", weight: 3, description: "Tests whether children can escape kids mode to access main catalog.", group: "Critical Safety" },
  { id: "CB-01", label: "Cross-Profile Bleed", portal: "streaming", weight: 3, description: "Tests whether adult profile data bleeds into kids profiles.", group: "Other" },
  { id: "CG-01", label: "Content Rating Gaps", portal: "streaming", weight: 2, description: "Tests accuracy of content rating display.", group: "Other" },
]

/* ── Profile data shape passed to client ─────────────────────────── */
export interface PlatformProfileData {
  platformId: string
  platformName: string
  category: "ai_chatbot" | "streaming"
  categoryLabel: string
  overallGrade: string
  numericalScore: number
  totalTests: number
  criticalFailures: number
  criticalFailureDetails: string[]
  gradeCapped: boolean
  gradeCapReasons: string[]
  testDate: string
  detailUrl: string
  rank: number
  totalPlatforms: number
  categoryScores: {
    categoryId: string
    label: string
    grade: string
    score: number
    weight: number
    group: string
    testCount: number
  }[]
  regulatory: {
    exposureLevel: string
    applicableLawCount: number
    enactedCount: number
    pendingCount: number
    requiredCategoryCount: number
    jurisdictionCount: number
    jurisdictions: string[]
    topLaws: { id: string; shortName: string; status: string; jurisdiction: string }[]
  }
  complianceGap: {
    coveragePercent: number
    totalRequired: number
    totalCovered: number
    totalGaps: number
    topGaps: { category: string; label: string }[]
    entries: { ruleCategory: string; label: string; status: "covered" | "partial" | "gap" }[]
  }
  peers: { platformId: string; platformName: string; grade: string; score: number }[]
}

/* ── Helpers ──────────────────────────────────────────────────────── */
function scoreToGrade(score: number): string {
  if (score >= 97) return "A+"
  if (score >= 93) return "A"
  if (score >= 90) return "A-"
  if (score >= 87) return "B+"
  if (score >= 83) return "B"
  if (score >= 80) return "B-"
  if (score >= 77) return "C+"
  if (score >= 73) return "C"
  if (score >= 70) return "C-"
  if (score >= 67) return "D+"
  if (score >= 63) return "D"
  if (score >= 60) return "D-"
  return "F"
}

/* ── Static params for all 11 platforms ──────────────────────────── */
const PLATFORM_IDS = [
  "chatgpt", "claude", "gemini", "grok",
  "character_ai", "copilot", "perplexity", "replika",
  "netflix", "prime_video", "peacock",
]

export function generateStaticParams() {
  return PLATFORM_IDS.map((id) => ({ platformId: id }))
}

/* ── Metadata ────────────────────────────────────────────────────── */
const PLATFORM_NAMES: Record<string, string> = {
  chatgpt: "ChatGPT", claude: "Claude", gemini: "Gemini", grok: "Grok",
  character_ai: "Character.AI", copilot: "Microsoft Copilot",
  perplexity: "Perplexity", replika: "Replika",
  netflix: "Netflix", prime_video: "Prime Video", peacock: "Peacock",
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ platformId: string }>
}): Promise<Metadata> {
  const { platformId } = await params
  const name = PLATFORM_NAMES[platformId]
  if (!name) return { title: "Platform Not Found — Phosra" }
  return {
    title: `${name} Safety Report Card — Platform Scorecard — Phosra`,
    description: `How does ${name} score on child safety? See the full breakdown: safety grade, category scores, regulatory exposure, compliance gaps, and how ${name} compares to other platforms.`,
  }
}

/* ── Page ─────────────────────────────────────────────────────────── */
export default async function PlatformProfilePage({
  params,
}: {
  params: Promise<{ platformId: string }>
}) {
  const { platformId } = await params
  if (!PLATFORM_IDS.includes(platformId)) notFound()

  const [chatbotPlatforms, streamingPlatforms] = await Promise.all([
    loadAllChatbotResearch(),
    loadAllStreamingPlatforms(),
  ])

  // Build all scored entries for ranking
  interface ScoredEntry {
    platformId: string
    platformName: string
    category: "ai_chatbot" | "streaming"
    score: number
    grade: string
  }
  const allScored: ScoredEntry[] = []

  for (const p of chatbotPlatforms) {
    const sc = p.chatbotData?.safetyTesting?.scorecard
    if (!sc) continue
    allScored.push({
      platformId: p.platformId,
      platformName: p.platformName,
      category: "ai_chatbot",
      score: sc.numericalScore,
      grade: sc.overallGrade,
    })
  }
  for (const p of streamingPlatforms) {
    allScored.push({
      platformId: p.platformId,
      platformName: p.platformName,
      category: "streaming",
      score: p.overallScore,
      grade: p.overallGrade,
    })
  }
  allScored.sort((a, b) => b.score - a.score)

  // Assign ranks
  let currentRank = 1
  for (let i = 0; i < allScored.length; i++) {
    if (i > 0 && allScored[i].score < allScored[i - 1].score) currentRank = i + 1
    ;(allScored[i] as ScoredEntry & { rank: number }).rank = currentRank
  }

  const thisEntry = allScored.find((e) => e.platformId === platformId)
  if (!thisEntry) notFound()

  const rank = (thisEntry as ScoredEntry & { rank: number }).rank

  // Build full profile data
  let profileData: PlatformProfileData | null = null

  // Try chatbot
  const chatbot = chatbotPlatforms.find((p) => p.platformId === platformId)
  if (chatbot) {
    const sc = chatbot.chatbotData?.safetyTesting?.scorecard
    if (!sc) notFound()

    const categoryScores = (sc.categoryScores ?? []).map((c) => {
      const meta = CATEGORY_REGISTRY.find((r) => r.id === c.category)
      return {
        categoryId: c.category,
        label: c.label,
        grade: c.grade,
        score: c.numericalScore,
        weight: c.weight,
        group: meta?.group ?? "Other",
        testCount: c.testCount,
      }
    })

    const testCategories = (sc.categoryScores ?? []).map((c) => c.category)
    const testScores = new Map<string, number>()
    for (const c of sc.categoryScores ?? []) {
      testScores.set(c.category, c.avgScore)
    }
    const gap = computeComplianceGap(platformId, "ai_chatbot", testCategories, testScores)

    const exposureMap = computeAllExposures([platformId])
    const exp = exposureMap.get(platformId)

    profileData = {
      platformId,
      platformName: chatbot.platformName,
      category: "ai_chatbot",
      categoryLabel: "AI Chatbot",
      overallGrade: sc.overallGrade,
      numericalScore: sc.numericalScore,
      totalTests: sc.completedTests,
      criticalFailures: sc.criticalFailures?.length ?? 0,
      criticalFailureDetails: (sc.criticalFailures ?? []).map((f) => `${f.category}: ${f.testId}`),
      gradeCapped: !!sc.gradeCap,
      gradeCapReasons: sc.gradeCapReasons ?? [],
      testDate: sc.testDate ?? "March 2026",
      detailUrl: `/research/ai-chatbots/${platformId}`,
      rank,
      totalPlatforms: allScored.length,
      categoryScores,
      regulatory: {
        exposureLevel: exp?.exposureLevel ?? "low",
        applicableLawCount: exp?.applicableLawCount ?? 0,
        enactedCount: exp?.enactedCount ?? 0,
        pendingCount: exp?.pendingCount ?? 0,
        requiredCategoryCount: exp?.requiredCategoryCount ?? 0,
        jurisdictionCount: exp?.jurisdictionCount ?? 0,
        jurisdictions: exp?.jurisdictions ?? [],
        topLaws: exp?.topLaws ?? [],
      },
      complianceGap: {
        coveragePercent: gap.coveragePercent,
        totalRequired: gap.totalRequired,
        totalCovered: gap.totalCovered,
        totalGaps: gap.totalGaps,
        topGaps: gap.topGaps,
        entries: gap.entries.map((e) => ({ ruleCategory: e.ruleCategory, label: e.label, status: e.status })),
      },
      peers: allScored
        .filter((e) => e.platformId !== platformId)
        .map((e) => ({ platformId: e.platformId, platformName: e.platformName, grade: e.grade, score: e.score })),
    }
  }

  // Try streaming
  const streaming = streamingPlatforms.find((p) => p.platformId === platformId)
  if (streaming && !profileData) {
    const categoryScores: PlatformProfileData["categoryScores"] = []
    for (const catMeta of CATEGORY_REGISTRY.filter((c) => c.portal === "streaming")) {
      const scores: number[] = []
      let testCount = 0
      for (const profile of streaming.profiles) {
        const test = profile.tests.find((t) => t.testId === catMeta.id)
        if (test && test.score !== null) {
          scores.push(test.score)
          testCount++
        }
      }
      if (scores.length === 0) continue
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      const score100 = Math.round(((4 - avg) / 4) * 100 * 10) / 10
      categoryScores.push({
        categoryId: catMeta.id,
        label: catMeta.label,
        grade: scoreToGrade(score100),
        score: score100,
        weight: catMeta.weight,
        group: catMeta.group,
        testCount,
      })
    }

    const totalTests = streaming.profiles.reduce(
      (sum, profile) => sum + profile.tests.length, 0
    )
    const streamingTestCats = Array.from(
      new Set(streaming.profiles.flatMap((pr) => pr.tests.map((t) => t.category)))
    )
    const streamingScoreMap = new Map<string, number>()
    for (const cat of streamingTestCats) {
      const sc = streaming.profiles
        .flatMap((pr) => pr.tests.filter((t) => t.category === cat && t.score !== null))
        .map((t) => t.score as number)
      if (sc.length > 0) {
        streamingScoreMap.set(cat, sc.reduce((a, b) => a + b, 0) / sc.length)
      }
    }
    const gap = computeComplianceGap(platformId, "streaming", streamingTestCats, streamingScoreMap)

    const exposureMap = computeAllExposures([platformId])
    const exp = exposureMap.get(platformId)

    profileData = {
      platformId,
      platformName: streaming.platformName,
      category: "streaming",
      categoryLabel: "Streaming",
      overallGrade: streaming.overallGrade,
      numericalScore: streaming.overallScore,
      totalTests,
      criticalFailures: streaming.criticalFailures?.length ?? 0,
      criticalFailureDetails: (streaming.criticalFailures ?? []).map((f) => f.description),
      gradeCapped: streaming.profiles.some((pr) => !!pr.gradeCap),
      gradeCapReasons: streaming.profiles
        .flatMap((pr) => pr.gradeCapReasons ?? [])
        .filter((v, i, a) => a.indexOf(v) === i),
      testDate: streaming.testDate || "February 2026",
      detailUrl: `/research/streaming/${platformId}`,
      rank,
      totalPlatforms: allScored.length,
      categoryScores,
      regulatory: {
        exposureLevel: exp?.exposureLevel ?? "low",
        applicableLawCount: exp?.applicableLawCount ?? 0,
        enactedCount: exp?.enactedCount ?? 0,
        pendingCount: exp?.pendingCount ?? 0,
        requiredCategoryCount: exp?.requiredCategoryCount ?? 0,
        jurisdictionCount: exp?.jurisdictionCount ?? 0,
        jurisdictions: exp?.jurisdictions ?? [],
        topLaws: exp?.topLaws ?? [],
      },
      complianceGap: {
        coveragePercent: gap.coveragePercent,
        totalRequired: gap.totalRequired,
        totalCovered: gap.totalCovered,
        totalGaps: gap.totalGaps,
        topGaps: gap.topGaps,
        entries: gap.entries.map((e) => ({ ruleCategory: e.ruleCategory, label: e.label, status: e.status })),
      },
      peers: allScored
        .filter((e) => e.platformId !== platformId)
        .map((e) => ({ platformId: e.platformId, platformName: e.platformName, grade: e.grade, score: e.score })),
    }
  }

  if (!profileData) notFound()

  return <PlatformProfileClient data={profileData} />
}
