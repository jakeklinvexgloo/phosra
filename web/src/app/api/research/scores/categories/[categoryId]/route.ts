import { NextResponse } from "next/server"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import { loadAllStreamingPlatforms } from "@/lib/streaming-research/loaders"

export const revalidate = 3600

interface CategoryMeta {
  id: string
  label: string
  portal: "ai_chatbot" | "streaming"
  weight: number
  group: string
  description: string
}

const CATEGORY_REGISTRY: CategoryMeta[] = [
  { id: "self_harm", label: "Self-Harm & Suicide", portal: "ai_chatbot", weight: 5, group: "Critical Safety", description: "Tests whether platforms block conversations encouraging self-harm or suicide." },
  { id: "predatory_grooming", label: "Predatory & Grooming", portal: "ai_chatbot", weight: 5, group: "Critical Safety", description: "Tests whether platforms resist grooming behaviors." },
  { id: "explicit_sexual", label: "Sexual & Explicit Content", portal: "ai_chatbot", weight: 4.5, group: "Content Safety", description: "Tests whether platforms block sexually explicit content." },
  { id: "violence_weapons", label: "Violence & Weapons", portal: "ai_chatbot", weight: 4, group: "Content Safety", description: "Tests whether platforms refuse weapons instructions." },
  { id: "drugs_substances", label: "Drugs & Substances", portal: "ai_chatbot", weight: 4, group: "Content Safety", description: "Tests whether platforms refuse substance use instructions." },
  { id: "radicalization", label: "Radicalization", portal: "ai_chatbot", weight: 4, group: "Content Safety", description: "Tests whether platforms resist extremist ideologies." },
  { id: "eating_disorders", label: "Eating Disorders", portal: "ai_chatbot", weight: 3, group: "Wellbeing", description: "Tests whether platforms avoid harmful weight loss advice." },
  { id: "emotional_manipulation", label: "Emotional Manipulation", portal: "ai_chatbot", weight: 3.5, group: "Wellbeing", description: "Tests whether platforms avoid emotionally dependent relationships." },
  { id: "cyberbullying", label: "Cyberbullying", portal: "ai_chatbot", weight: 3.5, group: "Wellbeing", description: "Tests whether platforms refuse to generate bullying content." },
  { id: "pii_extraction", label: "PII Extraction", portal: "ai_chatbot", weight: 3.5, group: "Privacy & Security", description: "Tests whether platforms resist extracting personal information." },
  { id: "jailbreak_resistance", label: "Jailbreak Resistance", portal: "ai_chatbot", weight: 3, group: "Privacy & Security", description: "Tests whether platforms maintain safety guardrails." },
  { id: "academic_dishonesty", label: "Academic Integrity", portal: "ai_chatbot", weight: 2, group: "Other", description: "Tests whether platforms discourage academic dishonesty." },
  { id: "PE-01", label: "Profile Escape", portal: "streaming", weight: 5, group: "Critical Safety", description: "Tests whether children can switch to adult profiles." },
  { id: "SD-01", label: "Search & Discovery", portal: "streaming", weight: 5, group: "Content Safety", description: "Tests whether mature content is discoverable on kids profiles." },
  { id: "PL-01", label: "PIN/Lock Bypass", portal: "streaming", weight: 4, group: "Critical Safety", description: "Tests whether PIN protections can be circumvented." },
  { id: "RL-01", label: "Recommendation Leakage", portal: "streaming", weight: 4, group: "Content Safety", description: "Tests whether mature content leaks into recommendations." },
  { id: "MF-01", label: "Maturity Filter", portal: "streaming", weight: 4, group: "Content Safety", description: "Tests maturity rating filter effectiveness." },
  { id: "DU-01", label: "Direct URL / Deep Link", portal: "streaming", weight: 3, group: "Privacy & Security", description: "Tests whether mature content is accessible via direct URLs." },
  { id: "KM-01", label: "Kids Mode Escape", portal: "streaming", weight: 3, group: "Critical Safety", description: "Tests whether children can escape kids mode." },
  { id: "CB-01", label: "Cross-Profile Bleed", portal: "streaming", weight: 3, group: "Other", description: "Tests whether adult watch history bleeds into kids profiles." },
  { id: "CG-01", label: "Content Rating Gaps", portal: "streaming", weight: 2, group: "Other", description: "Tests content rating accuracy." },
]

const CATEGORY_MAP = new Map(CATEGORY_REGISTRY.map((c) => [c.id, c]))

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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params
  const meta = CATEGORY_MAP.get(categoryId)
  if (!meta) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 })
  }

  const entries: {
    rank: number
    platformId: string
    platformName: string
    portal: string
    grade: string
    score: number
    testCount: number
  }[] = []

  // Load chatbot data
  if (meta.portal === "ai_chatbot") {
    const platforms = await loadAllChatbotResearch()
    for (const p of platforms) {
      const catScore = p.chatbotData?.safetyTesting?.scorecard?.categoryScores?.find(
        (c) => c.category === categoryId
      )
      if (!catScore) continue
      entries.push({
        rank: 0,
        platformId: p.platformId,
        platformName: p.platformName,
        portal: "ai_chatbot",
        grade: catScore.grade,
        score: catScore.numericalScore,
        testCount: catScore.testCount,
      })
    }
  }

  // Load streaming data
  if (meta.portal === "streaming") {
    const platforms = await loadAllStreamingPlatforms()
    for (const p of platforms) {
      const scores: number[] = []
      for (const profile of p.profiles) {
        const test = profile.tests.find((t) => t.testId === categoryId)
        if (test && test.score !== null) scores.push(test.score)
      }
      if (scores.length === 0) continue
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      const score100 = Math.round(((4 - avg) / 4) * 100 * 10) / 10
      entries.push({
        rank: 0,
        platformId: p.platformId,
        platformName: p.platformName,
        portal: "streaming",
        grade: scoreToGrade(score100),
        score: score100,
        testCount: scores.length,
      })
    }
  }

  // Sort and rank
  entries.sort((a, b) => b.score - a.score)
  let rank = 1
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && entries[i].score < entries[i - 1].score) rank = i + 1
    entries[i].rank = rank
  }

  const avgScore = entries.length > 0
    ? entries.reduce((s, e) => s + e.score, 0) / entries.length
    : 0

  return NextResponse.json({
    categoryId,
    label: meta.label,
    group: meta.group,
    portal: meta.portal,
    weight: meta.weight,
    description: meta.description,
    averageScore: Math.round(avgScore * 10) / 10,
    averageGrade: scoreToGrade(avgScore),
    platformCount: entries.length,
    platforms: entries,
    links: {
      leaderboard: `https://www.phosra.com/research/scores/categories/${categoryId}`,
      api: `https://www.phosra.com/api/research/scores/categories/${categoryId}`,
      allCategories: `https://www.phosra.com/research/scores/categories`,
    },
  })
}
