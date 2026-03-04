import { Metadata } from "next"
import Link from "next/link"
import { Shield, Zap, ArrowRight, ArrowLeft, Bot, Tv } from "lucide-react"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import { loadAllStreamingPlatforms } from "@/lib/streaming-research/loaders"

export const metadata: Metadata = {
  title: "Safety Test Categories — Platform Scorecard — Phosra",
  description:
    "Explore 21 safety test categories across AI chatbots and streaming platforms. See average grades, best and worst performers, and detailed leaderboards for each category.",
}

interface CategoryDef {
  id: string
  label: string
  portal: "ai_chatbot" | "streaming"
  weight: number
  group: string
  description: string
}

const CATEGORIES: CategoryDef[] = [
  { id: "self_harm", label: "Self-Harm & Suicide", portal: "ai_chatbot", weight: 5, group: "Critical Safety", description: "Blocking conversations that encourage self-harm or suicide" },
  { id: "predatory_grooming", label: "Predatory & Grooming Patterns", portal: "ai_chatbot", weight: 5, group: "Critical Safety", description: "Resisting grooming behaviors and inappropriate trust-building" },
  { id: "PE-01", label: "Profile Escape", portal: "streaming", weight: 5, group: "Critical Safety", description: "Preventing children from switching to adult profiles" },
  { id: "PL-01", label: "PIN/Lock Bypass", portal: "streaming", weight: 4, group: "Critical Safety", description: "PIN/password protections on mature content" },
  { id: "KM-01", label: "Kids Mode Escape", portal: "streaming", weight: 3, group: "Critical Safety", description: "Keeping children within restricted browsing mode" },
  { id: "explicit_sexual", label: "Sexual & Explicit Content", portal: "ai_chatbot", weight: 4.5, group: "Content Safety", description: "Blocking sexually explicit or age-inappropriate content" },
  { id: "violence_weapons", label: "Violence & Weapons", portal: "ai_chatbot", weight: 4, group: "Content Safety", description: "Refusing weapons instructions or violence glorification" },
  { id: "drugs_substances", label: "Drugs & Substance Use", portal: "ai_chatbot", weight: 4, group: "Content Safety", description: "Refusing substance use instructions for minors" },
  { id: "radicalization", label: "Radicalization & Extremism", portal: "ai_chatbot", weight: 4, group: "Content Safety", description: "Resisting extremist ideologies and recruitment" },
  { id: "SD-01", label: "Search & Discovery", portal: "streaming", weight: 5, group: "Content Safety", description: "Preventing mature content discovery on kids profiles" },
  { id: "RL-01", label: "Recommendation Leakage", portal: "streaming", weight: 4, group: "Content Safety", description: "Stopping mature content in restricted recommendations" },
  { id: "MF-01", label: "Maturity Filter Effectiveness", portal: "streaming", weight: 4, group: "Content Safety", description: "Effectiveness of maturity rating filters" },
  { id: "eating_disorders", label: "Eating Disorders & Body Image", portal: "ai_chatbot", weight: 3, group: "Wellbeing", description: "Avoiding harmful weight loss or pro-anorexia content" },
  { id: "emotional_manipulation", label: "Emotional Manipulation & Parasocial", portal: "ai_chatbot", weight: 3.5, group: "Wellbeing", description: "Avoiding emotionally dependent relationships" },
  { id: "cyberbullying", label: "Cyberbullying & Harassment", portal: "ai_chatbot", weight: 3.5, group: "Wellbeing", description: "Refusing to generate bullying or harassment content" },
  { id: "pii_extraction", label: "Personal Information Extraction", portal: "ai_chatbot", weight: 3.5, group: "Privacy & Security", description: "Resisting extraction of personal info from minors" },
  { id: "jailbreak_resistance", label: "Jailbreak & Safety Bypass", portal: "ai_chatbot", weight: 3, group: "Privacy & Security", description: "Maintaining guardrails against prompt injection" },
  { id: "DU-01", label: "Direct URL / Deep Link", portal: "streaming", weight: 3, group: "Privacy & Security", description: "Blocking mature content access via direct URLs" },
  { id: "academic_dishonesty", label: "Academic Integrity", portal: "ai_chatbot", weight: 2, group: "Other", description: "Discouraging cheating or plagiarism" },
  { id: "CB-01", label: "Cross-Profile Bleed", portal: "streaming", weight: 3, group: "Other", description: "Preventing adult profile data leaking to kids" },
  { id: "CG-01", label: "Content Rating Gaps", portal: "streaming", weight: 2, group: "Other", description: "Accuracy of content rating display" },
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

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "text-emerald-400"
  if (grade.startsWith("B")) return "text-green-400"
  if (grade.startsWith("C")) return "text-amber-400"
  if (grade.startsWith("D")) return "text-orange-400"
  return "text-red-400"
}

function gradeBg(grade: string): string {
  if (grade.startsWith("A")) return "bg-emerald-500/15 border-emerald-500/25"
  if (grade.startsWith("B")) return "bg-green-500/15 border-green-500/25"
  if (grade.startsWith("C")) return "bg-amber-500/15 border-amber-500/25"
  if (grade.startsWith("D")) return "bg-orange-500/15 border-orange-500/25"
  return "bg-red-500/15 border-red-500/25"
}

function weightColor(w: number) {
  if (w >= 5) return "text-red-400"
  if (w >= 4) return "text-orange-400"
  if (w >= 3) return "text-amber-400"
  return "text-emerald-400"
}

interface CategoryScore {
  avgScore: number
  avgGrade: string
  platformCount: number
  bestPlatform: { name: string; grade: string } | null
  worstPlatform: { name: string; grade: string } | null
}

export default async function CategoriesIndexPage() {
  const [chatbotPlatforms, streamingPlatforms] = await Promise.all([
    loadAllChatbotResearch(),
    loadAllStreamingPlatforms(),
  ])

  // Compute scores for each category
  const scoreMap = new Map<string, CategoryScore>()

  for (const cat of CATEGORIES) {
    const entries: { name: string; score: number; grade: string }[] = []

    if (cat.portal === "ai_chatbot") {
      for (const p of chatbotPlatforms) {
        const catScore = p.chatbotData?.safetyTesting?.scorecard?.categoryScores?.find(
          (c) => c.category === cat.id
        )
        if (catScore) {
          entries.push({ name: p.platformName, score: catScore.numericalScore, grade: catScore.grade })
        }
      }
    } else {
      for (const p of streamingPlatforms) {
        const profileScores: number[] = []
        for (const profile of p.profiles) {
          const test = profile.tests.find((t) => t.testId === cat.id)
          if (test && test.score !== null) profileScores.push(test.score)
        }
        if (profileScores.length > 0) {
          const avg = profileScores.reduce((a, b) => a + b, 0) / profileScores.length
          const score100 = Math.round(((4 - avg) / 4) * 100 * 10) / 10
          entries.push({ name: p.platformName, score: score100, grade: scoreToGrade(score100) })
        }
      }
    }

    if (entries.length > 0) {
      entries.sort((a, b) => b.score - a.score)
      const avgScore = Math.round((entries.reduce((s, e) => s + e.score, 0) / entries.length) * 10) / 10
      scoreMap.set(cat.id, {
        avgScore,
        avgGrade: scoreToGrade(avgScore),
        platformCount: entries.length,
        bestPlatform: entries[0] ? { name: entries[0].name, grade: entries[0].grade } : null,
        worstPlatform: entries.length > 1 ? { name: entries[entries.length - 1].name, grade: entries[entries.length - 1].grade } : null,
      })
    }
  }

  const grouped = CATEGORIES.reduce<Record<string, CategoryDef[]>>((acc, c) => {
    if (!acc[c.group]) acc[c.group] = []
    acc[c.group].push(c)
    return acc
  }, {})

  const groupOrder = ["Critical Safety", "Content Safety", "Wellbeing", "Privacy & Security", "Other"]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Safety Test Categories",
    description: "21 child safety test categories across AI chatbots and streaming platforms.",
    numberOfItems: CATEGORIES.length,
    itemListElement: CATEGORIES.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      url: `https://www.phosra.com/research/scores/categories/${c.id}`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-[#0D1B2A] text-white">
        <div className="max-w-5xl mx-auto px-4 pt-8 pb-16">
          <Link
            href="/research/scores"
            className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Scorecard
          </Link>

          <div className="flex items-start gap-3 mb-6">
            <Shield className="w-6 h-6 text-[#00D47E] flex-shrink-0 mt-1" />
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#00D47E]/60 block mb-1">
                Platform Safety Scorecard
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Safety Test Categories</h1>
              <p className="text-sm text-white/50 max-w-2xl">
                21 test categories across AI chatbots (12) and streaming platforms (9).
                Each category has its own leaderboard with grades and rankings.
              </p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <div className="text-2xl font-bold">21</div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Categories</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <div className="text-2xl font-bold flex items-center justify-center gap-1">
                <Bot className="w-4 h-4 text-violet-400" /> 12
              </div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">AI Chatbot</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <div className="text-2xl font-bold flex items-center justify-center gap-1">
                <Tv className="w-4 h-4 text-sky-400" /> 9
              </div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Streaming</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <div className="text-2xl font-bold">5</div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Groups</div>
            </div>
          </div>

          <div className="space-y-8">
            {groupOrder.map((groupName) => {
              const cats = grouped[groupName]
              if (!cats || cats.length === 0) return null
              return (
                <div key={groupName}>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2">
                    {groupName === "Critical Safety" && <Zap className="w-4 h-4 text-red-400" />}
                    {groupName}
                    <span className="text-white/20 font-normal">({cats.length})</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cats.map((cat) => {
                      const scores = scoreMap.get(cat.id)
                      return (
                        <Link
                          key={cat.id}
                          href={`/research/scores/categories/${cat.id}`}
                          className="group p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#00D47E]/30 hover:bg-white/[0.05] transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-white/80 group-hover:text-white transition truncate">
                                  {cat.label}
                                </span>
                              </div>
                              <p className="text-xs text-white/35 mb-2 line-clamp-1">{cat.description}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${cat.portal === "ai_chatbot" ? "bg-violet-500/15 border-violet-500/25 text-violet-300" : "bg-sky-500/15 border-sky-500/25 text-sky-300"}`}>
                                  {cat.portal === "ai_chatbot" ? "AI Chatbot" : "Streaming"}
                                </span>
                                <span className={`text-[10px] font-bold ${weightColor(cat.weight)}`}>
                                  ×{cat.weight}
                                </span>
                                {scores && (
                                  <span className="text-[10px] text-white/25">
                                    {scores.platformCount} platforms
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-center flex-shrink-0">
                              {scores ? (
                                <>
                                  <span className={`text-lg font-black ${gradeColor(scores.avgGrade)}`}>
                                    {scores.avgGrade}
                                  </span>
                                  <span className="text-[9px] text-white/25">avg</span>
                                </>
                              ) : (
                                <ArrowRight className="w-4 h-4 text-white/15 group-hover:text-[#00D47E] transition" />
                              )}
                            </div>
                          </div>
                          {scores && scores.bestPlatform && scores.worstPlatform && (
                            <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-white/[0.04] text-[10px]">
                              <span className="text-white/25">Best:</span>
                              <span className={`font-semibold ${gradeColor(scores.bestPlatform.grade)}`}>
                                {scores.bestPlatform.grade}
                              </span>
                              <span className="text-white/40">{scores.bestPlatform.name}</span>
                              <span className="text-white/10 mx-1">|</span>
                              <span className="text-white/25">Worst:</span>
                              <span className={`font-semibold ${gradeColor(scores.worstPlatform.grade)}`}>
                                {scores.worstPlatform.grade}
                              </span>
                              <span className="text-white/40">{scores.worstPlatform.name}</span>
                            </div>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom navigation */}
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <Link
              href="/research/scores"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#00D47E]/10 border border-[#00D47E]/20 text-[#00D47E] hover:bg-[#00D47E]/20 transition inline-flex items-center gap-2"
            >
              View Full Scorecard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/research/scores/platforms"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition inline-flex items-center gap-2"
            >
              All Platforms <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/research/scores/heatmap"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition inline-flex items-center gap-2"
            >
              Performance Heatmap <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
