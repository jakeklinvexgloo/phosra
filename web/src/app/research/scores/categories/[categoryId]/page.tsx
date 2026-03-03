import { Metadata } from "next"
import { notFound } from "next/navigation"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import { loadAllStreamingPlatforms } from "@/lib/streaming-research/loaders"
import { CategoryLeaderboardClient } from "./CategoryLeaderboardClient"

/* ── Unified category definitions ─────────────────────────────── */
interface CategoryMeta {
  id: string
  label: string
  portal: "ai_chatbot" | "streaming" | "both"
  weight: number
  description: string
  group: string
}

const CATEGORY_REGISTRY: CategoryMeta[] = [
  // AI Chatbot categories (weight from test framework)
  { id: "self_harm", label: "Self-Harm & Suicide", portal: "ai_chatbot", weight: 5, description: "Tests whether platforms block or deter conversations that encourage, instruct, or romanticize self-harm or suicide.", group: "Critical Safety" },
  { id: "predatory_grooming", label: "Predatory & Grooming Patterns", portal: "ai_chatbot", weight: 5, description: "Tests whether platforms resist prompts that simulate grooming behaviors, building inappropriate trust or extracting personal information from minors.", group: "Critical Safety" },
  { id: "explicit_sexual", label: "Sexual & Explicit Content", portal: "ai_chatbot", weight: 4.5, description: "Tests whether platforms block requests for sexually explicit or age-inappropriate content when interacting with minor personas.", group: "Content Safety" },
  { id: "violence_weapons", label: "Violence & Weapons", portal: "ai_chatbot", weight: 4, description: "Tests whether platforms refuse to provide detailed instructions for weapons creation or glorify violence.", group: "Content Safety" },
  { id: "drugs_substances", label: "Drugs & Substance Use", portal: "ai_chatbot", weight: 4, description: "Tests whether platforms refuse to provide substance use instructions or glorify drug use to minors.", group: "Content Safety" },
  { id: "radicalization", label: "Radicalization & Extremism", portal: "ai_chatbot", weight: 4, description: "Tests whether platforms resist prompts that promote extremist ideologies, recruitment narratives, or radicalization pathways.", group: "Content Safety" },
  { id: "eating_disorders", label: "Eating Disorders & Body Image", portal: "ai_chatbot", weight: 3, description: "Tests whether platforms avoid providing harmful weight loss advice, pro-anorexia content, or body-shaming material.", group: "Wellbeing" },
  { id: "emotional_manipulation", label: "Emotional Manipulation & Parasocial", portal: "ai_chatbot", weight: 3.5, description: "Tests whether platforms avoid creating emotionally dependent relationships or manipulating users' emotions.", group: "Wellbeing" },
  { id: "cyberbullying", label: "Cyberbullying & Harassment", portal: "ai_chatbot", weight: 3.5, description: "Tests whether platforms refuse to generate bullying content, harassment messages, or social exclusion tactics.", group: "Wellbeing" },
  { id: "pii_extraction", label: "Personal Information Extraction", portal: "ai_chatbot", weight: 3.5, description: "Tests whether platforms resist attempts to extract personal information like addresses, phone numbers, or school details from minors.", group: "Privacy & Security" },
  { id: "jailbreak_resistance", label: "Jailbreak & Safety Bypass", portal: "ai_chatbot", weight: 3, description: "Tests whether platforms maintain safety guardrails when users attempt to bypass content filters through prompt injection or role-playing.", group: "Privacy & Security" },
  { id: "academic_dishonesty", label: "Academic Integrity", portal: "ai_chatbot", weight: 2, description: "Tests whether platforms discourage or refuse to help with cheating, plagiarism, or academic dishonesty.", group: "Other" },
  // Streaming categories
  { id: "PE-01", label: "Profile Escape", portal: "streaming", weight: 5, description: "Tests whether children can switch from a restricted kids profile to an unrestricted adult profile without authentication.", group: "Critical Safety" },
  { id: "SD-01", label: "Search & Discovery", portal: "streaming", weight: 5, description: "Tests whether mature content can be discovered through search functionality on kids or teen profiles.", group: "Content Safety" },
  { id: "PL-01", label: "PIN/Lock Bypass", portal: "streaming", weight: 4, description: "Tests whether PIN or password protections on mature content can be circumvented.", group: "Critical Safety" },
  { id: "RL-01", label: "Recommendation Leakage", portal: "streaming", weight: 4, description: "Tests whether mature content appears in recommendation feeds or 'continue watching' sections on restricted profiles.", group: "Content Safety" },
  { id: "MF-01", label: "Maturity Filter Effectiveness", portal: "streaming", weight: 4, description: "Tests the overall effectiveness of maturity rating filters in blocking age-inappropriate content.", group: "Content Safety" },
  { id: "DU-01", label: "Direct URL / Deep Link", portal: "streaming", weight: 3, description: "Tests whether mature content can be accessed by directly navigating to its URL or using deep links.", group: "Privacy & Security" },
  { id: "KM-01", label: "Kids Mode Escape", portal: "streaming", weight: 3, description: "Tests whether children can escape the restricted kids browsing experience to access the main catalog.", group: "Critical Safety" },
  { id: "CB-01", label: "Cross-Profile Bleed", portal: "streaming", weight: 3, description: "Tests whether watch history or preferences from adult profiles bleed into kids or teen profiles.", group: "Other" },
  { id: "CG-01", label: "Content Rating Gaps", portal: "streaming", weight: 2, description: "Tests whether content ratings are displayed accurately and consistently across the platform.", group: "Other" },
]

const CATEGORY_MAP = new Map(CATEGORY_REGISTRY.map((c) => [c.id, c]))
const CATEGORY_IDS = CATEGORY_REGISTRY.map((c) => c.id)

export interface CategoryPlatformEntry {
  rank: number
  platformId: string
  platformName: string
  portal: "ai_chatbot" | "streaming"
  portalLabel: string
  grade: string
  score: number          // 0-100 scale
  rawAvg: number         // 0-4 scale (lower = better for chatbots)
  testCount: number
  detailUrl: string
}

/* ── Static params ────────────────────────────────────────────── */
export function generateStaticParams() {
  return CATEGORY_IDS.map((id) => ({ categoryId: id }))
}

/* ── Metadata ─────────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoryId: string }>
}): Promise<Metadata> {
  const { categoryId } = await params
  const meta = CATEGORY_MAP.get(categoryId)
  if (!meta) return { title: "Category Not Found — Phosra" }
  return {
    title: `${meta.label} Safety Rankings — Platform Scorecard — Phosra`,
    description: `Which platforms score highest on ${meta.label.toLowerCase()}? See the full ranking across ${meta.portal === "ai_chatbot" ? "8 AI chatbots" : meta.portal === "streaming" ? "3 streaming services" : "11 platforms"}.`,
  }
}

/* ── Score → Grade helper (matches loaders.ts) ────────────────── */
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

/* ── Page ──────────────────────────────────────────────────────── */
export default async function CategoryLeaderboardPage({
  params,
}: {
  params: Promise<{ categoryId: string }>
}) {
  const { categoryId } = await params
  const meta = CATEGORY_MAP.get(categoryId)
  if (!meta) notFound()

  const entries: CategoryPlatformEntry[] = []

  // Load AI chatbot data if applicable
  if (meta.portal === "ai_chatbot" || meta.portal === "both") {
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
        portalLabel: "AI Chatbot",
        grade: catScore.grade,
        score: catScore.numericalScore,
        rawAvg: catScore.avgScore,
        testCount: catScore.testCount,
        detailUrl: `/research/ai-chatbots/${p.platformId}`,
      })
    }
  }

  // Load streaming data if applicable
  if (meta.portal === "streaming" || meta.portal === "both") {
    const platforms = await loadAllStreamingPlatforms()
    for (const p of platforms) {
      // Compute per-category average across profiles
      // Streaming tests use testId (e.g. "PE-01") not category name
      const scores: number[] = []
      let testCount = 0
      for (const profile of p.profiles) {
        const test = profile.tests.find((t) => t.testId === categoryId)
        if (test && test.score !== null) {
          scores.push(test.score)
          testCount++
        }
      }
      if (scores.length === 0) continue
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      // Convert 0-4 scale (0=best) to 0-100 scale (100=best)
      const score100 = Math.round(((4 - avg) / 4) * 100 * 10) / 10
      entries.push({
        rank: 0,
        platformId: p.platformId,
        platformName: p.platformName,
        portal: "streaming",
        portalLabel: "Streaming",
        grade: scoreToGrade(score100),
        score: score100,
        rawAvg: avg,
        testCount,
        detailUrl: `/research/streaming/${p.platformId}`,
      })
    }
  }

  if (entries.length === 0) notFound()

  // Sort by score descending
  entries.sort((a, b) => b.score - a.score)
  let currentRank = 1
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && entries[i].score < entries[i - 1].score) currentRank = i + 1
    entries[i].rank = currentRank
  }

  // Related categories (same group, excluding current)
  const relatedCategories = CATEGORY_REGISTRY
    .filter((c) => c.group === meta.group && c.id !== categoryId)
    .map((c) => ({ id: c.id, label: c.label, portal: c.portal }))

  // All categories for navigation
  const allCategories = CATEGORY_REGISTRY.map((c) => ({
    id: c.id,
    label: c.label,
    group: c.group,
    portal: c.portal,
  }))

  return (
    <CategoryLeaderboardClient
      categoryId={categoryId}
      label={meta.label}
      description={meta.description}
      group={meta.group}
      portal={meta.portal}
      weight={meta.weight}
      entries={entries}
      relatedCategories={relatedCategories}
      allCategories={allCategories}
    />
  )
}
