import { Metadata } from "next"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import { loadAllStreamingPlatforms } from "@/lib/streaming-research/loaders"
import { HeatmapClient } from "./HeatmapClient"

export const metadata: Metadata = {
  title: "Safety Performance Heatmap — Platform Scorecard — Phosra",
  description:
    "Visual heatmap of child safety performance across 11 platforms and 21 test categories. Instantly spot strengths, weaknesses, and patterns.",
}

/* ── Category registry ───────────────────────────────────────────── */
interface CategoryMeta {
  id: string
  label: string
  shortLabel: string
  portal: "ai_chatbot" | "streaming"
  weight: number
  group: string
}

const CATEGORY_REGISTRY: CategoryMeta[] = [
  { id: "self_harm", label: "Self-Harm & Suicide", shortLabel: "Self-Harm", portal: "ai_chatbot", weight: 5, group: "Critical Safety" },
  { id: "predatory_grooming", label: "Predatory & Grooming", shortLabel: "Grooming", portal: "ai_chatbot", weight: 5, group: "Critical Safety" },
  { id: "explicit_sexual", label: "Sexual & Explicit", shortLabel: "Sexual", portal: "ai_chatbot", weight: 4.5, group: "Content Safety" },
  { id: "violence_weapons", label: "Violence & Weapons", shortLabel: "Violence", portal: "ai_chatbot", weight: 4, group: "Content Safety" },
  { id: "drugs_substances", label: "Drugs & Substances", shortLabel: "Drugs", portal: "ai_chatbot", weight: 4, group: "Content Safety" },
  { id: "radicalization", label: "Radicalization", shortLabel: "Radical.", portal: "ai_chatbot", weight: 4, group: "Content Safety" },
  { id: "eating_disorders", label: "Eating Disorders", shortLabel: "Eating D.", portal: "ai_chatbot", weight: 3, group: "Wellbeing" },
  { id: "emotional_manipulation", label: "Emotional Manipulation", shortLabel: "Emotional", portal: "ai_chatbot", weight: 3.5, group: "Wellbeing" },
  { id: "cyberbullying", label: "Cyberbullying", shortLabel: "Bullying", portal: "ai_chatbot", weight: 3.5, group: "Wellbeing" },
  { id: "pii_extraction", label: "PII Extraction", shortLabel: "PII", portal: "ai_chatbot", weight: 3.5, group: "Privacy & Security" },
  { id: "jailbreak_resistance", label: "Jailbreak Resistance", shortLabel: "Jailbreak", portal: "ai_chatbot", weight: 3, group: "Privacy & Security" },
  { id: "academic_dishonesty", label: "Academic Integrity", shortLabel: "Academic", portal: "ai_chatbot", weight: 2, group: "Other" },
  { id: "PE-01", label: "Profile Escape", shortLabel: "Prof. Esc.", portal: "streaming", weight: 5, group: "Critical Safety" },
  { id: "SD-01", label: "Search & Discovery", shortLabel: "Search", portal: "streaming", weight: 5, group: "Content Safety" },
  { id: "PL-01", label: "PIN/Lock Bypass", shortLabel: "PIN Lock", portal: "streaming", weight: 4, group: "Critical Safety" },
  { id: "RL-01", label: "Recommendation Leak", shortLabel: "Rec. Leak", portal: "streaming", weight: 4, group: "Content Safety" },
  { id: "MF-01", label: "Maturity Filter", shortLabel: "Mat. Filter", portal: "streaming", weight: 4, group: "Content Safety" },
  { id: "DU-01", label: "Direct URL / Deep Link", shortLabel: "Deep Link", portal: "streaming", weight: 3, group: "Privacy & Security" },
  { id: "KM-01", label: "Kids Mode Escape", shortLabel: "Kids Mode", portal: "streaming", weight: 3, group: "Critical Safety" },
  { id: "CB-01", label: "Cross-Profile Bleed", shortLabel: "Xprof Bleed", portal: "streaming", weight: 3, group: "Other" },
  { id: "CG-01", label: "Content Rating Gaps", shortLabel: "Rating Gaps", portal: "streaming", weight: 2, group: "Other" },
]

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

/* ── Data shapes for client ──────────────────────────────────────── */
export interface HeatmapPlatform {
  platformId: string
  platformName: string
  category: "ai_chatbot" | "streaming"
  overallGrade: string
  overallScore: number
  rank: number
}

export interface HeatmapCell {
  platformId: string
  categoryId: string
  grade: string
  score: number
}

export interface HeatmapCategory {
  id: string
  label: string
  shortLabel: string
  portal: "ai_chatbot" | "streaming"
  weight: number
  group: string
}

/* ── Page ─────────────────────────────────────────────────────────── */
export default async function HeatmapPage() {
  const [chatbotPlatforms, streamingPlatforms] = await Promise.all([
    loadAllChatbotResearch(),
    loadAllStreamingPlatforms(),
  ])

  const platforms: HeatmapPlatform[] = []
  const cells: HeatmapCell[] = []

  // AI Chatbot platforms
  for (const p of chatbotPlatforms) {
    const sc = p.chatbotData?.safetyTesting?.scorecard
    if (!sc) continue

    platforms.push({
      platformId: p.platformId,
      platformName: p.platformName,
      category: "ai_chatbot",
      overallGrade: sc.overallGrade,
      overallScore: sc.numericalScore,
      rank: 0,
    })

    for (const catScore of sc.categoryScores ?? []) {
      cells.push({
        platformId: p.platformId,
        categoryId: catScore.category,
        grade: catScore.grade,
        score: catScore.numericalScore,
      })
    }
  }

  // Streaming platforms
  for (const p of streamingPlatforms) {
    platforms.push({
      platformId: p.platformId,
      platformName: p.platformName,
      category: "streaming",
      overallGrade: p.overallGrade,
      overallScore: p.overallScore,
      rank: 0,
    })

    for (const catMeta of CATEGORY_REGISTRY.filter((c) => c.portal === "streaming")) {
      const scores: number[] = []
      for (const profile of p.profiles) {
        const test = profile.tests.find((t) => t.testId === catMeta.id)
        if (test && test.score !== null) {
          scores.push(test.score)
        }
      }
      if (scores.length === 0) continue
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      const score100 = Math.round(((4 - avg) / 4) * 100 * 10) / 10
      cells.push({
        platformId: p.platformId,
        categoryId: catMeta.id,
        grade: scoreToGrade(score100),
        score: score100,
      })
    }
  }

  // Sort platforms by score and assign ranks
  platforms.sort((a, b) => b.overallScore - a.overallScore)
  let currentRank = 1
  for (let i = 0; i < platforms.length; i++) {
    if (i > 0 && platforms[i].overallScore < platforms[i - 1].overallScore) currentRank = i + 1
    platforms[i].rank = currentRank
  }

  const categories: HeatmapCategory[] = CATEGORY_REGISTRY.map((c) => ({
    id: c.id,
    label: c.label,
    shortLabel: c.shortLabel,
    portal: c.portal,
    weight: c.weight,
    group: c.group,
  }))

  return (
    <HeatmapClient
      platforms={platforms}
      categories={categories}
      cells={cells}
    />
  )
}
