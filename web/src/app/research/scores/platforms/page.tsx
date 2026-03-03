import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Shield, Bot, Tv, AlertTriangle } from "lucide-react"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import { loadAllStreamingPlatforms } from "@/lib/streaming-research/loaders"

export const metadata: Metadata = {
  title: "All Platforms — Platform Safety Scorecard — Phosra",
  description:
    "Browse all 11 platforms tested in the Phosra Safety Scorecard. See overall grades, scores, and safety report cards for AI chatbots and streaming services.",
}

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

interface PlatformEntry {
  platformId: string
  platformName: string
  category: "ai_chatbot" | "streaming"
  grade: string
  score: number
  totalTests: number
  criticalFailures: number
  gradeCapped: boolean
  rank: number
}

export default async function PlatformsIndexPage() {
  const [chatbotPlatforms, streamingPlatforms] = await Promise.all([
    loadAllChatbotResearch(),
    loadAllStreamingPlatforms(),
  ])

  const entries: PlatformEntry[] = []

  for (const p of chatbotPlatforms) {
    const sc = p.chatbotData?.safetyTesting?.scorecard
    if (!sc) continue
    entries.push({
      platformId: p.platformId,
      platformName: p.platformName,
      category: "ai_chatbot",
      grade: sc.overallGrade,
      score: sc.numericalScore,
      totalTests: sc.completedTests,
      criticalFailures: sc.criticalFailures?.length ?? 0,
      gradeCapped: !!sc.gradeCap,
      rank: 0,
    })
  }

  for (const p of streamingPlatforms) {
    const totalTests = p.profiles.reduce((sum, pr) => sum + pr.tests.length, 0)
    entries.push({
      platformId: p.platformId,
      platformName: p.platformName,
      category: "streaming",
      grade: p.overallGrade,
      score: p.overallScore,
      totalTests,
      criticalFailures: p.criticalFailures?.length ?? 0,
      gradeCapped: p.profiles.some((pr) => !!pr.gradeCap),
      rank: 0,
    })
  }

  // Sort by score descending
  entries.sort((a, b) => b.score - a.score)
  let currentRank = 1
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && entries[i].score < entries[i - 1].score) currentRank = i + 1
    entries[i].rank = currentRank
  }

  const chatbots = entries.filter((e) => e.category === "ai_chatbot")
  const streaming = entries.filter((e) => e.category === "streaming")
  const avgScore = entries.reduce((s, e) => s + e.score, 0) / entries.length
  const avgGrade = scoreToGrade(avgScore)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Platform Safety Scorecard — All Platforms",
    description: `Safety grades for ${entries.length} platforms: ${chatbots.length} AI chatbots and ${streaming.length} streaming services.`,
    numberOfItems: entries.length,
    itemListElement: entries.map((e) => ({
      "@type": "ListItem",
      position: e.rank,
      name: `${e.platformName} — ${e.grade} (${e.score}/100)`,
      url: `https://www.phosra.com/research/scores/platforms/${e.platformId}`,
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
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">All Platforms</h1>
              <p className="text-sm text-white/50 max-w-2xl">
                {entries.length} platforms tested across {chatbots.length} AI chatbots and {streaming.length} streaming services.
                Click any platform for a full safety report card.
              </p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <div className="text-2xl font-bold">{entries.length}</div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Platforms</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <div className={`text-2xl font-bold ${gradeColor(avgGrade)}`}>{avgGrade}</div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Average Grade</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <div className="text-2xl font-bold">{chatbots.length}</div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">AI Chatbots</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <div className="text-2xl font-bold">{streaming.length}</div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Streaming</div>
            </div>
          </div>

          {/* AI Chatbots */}
          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2">
              <Bot className="w-4 h-4 text-violet-400" />
              AI Chatbots
              <span className="text-white/20 font-normal">({chatbots.length})</span>
            </h2>
            <div className="space-y-2">
              {chatbots.map((p) => (
                <Link
                  key={p.platformId}
                  href={`/research/scores/platforms/${p.platformId}`}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#00D47E]/30 hover:bg-white/[0.05] transition-all"
                >
                  <div className="flex items-center justify-center w-8 text-sm font-mono text-white/30">
                    #{p.rank}
                  </div>
                  <div className={`text-xl font-bold w-12 text-center ${gradeColor(p.grade)}`}>
                    {p.grade}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white/80 group-hover:text-white transition">
                      {p.platformName}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/40 mt-0.5">
                      <span>{p.score}/100</span>
                      <span>{p.totalTests} tests</span>
                      {p.criticalFailures > 0 && (
                        <span className="flex items-center gap-1 text-red-400">
                          <AlertTriangle className="w-3 h-3" />
                          {p.criticalFailures} critical
                        </span>
                      )}
                      {p.gradeCapped && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${gradeBg(p.grade)}`}>
                          Grade capped
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/15 group-hover:text-[#00D47E] flex-shrink-0 transition" />
                </Link>
              ))}
            </div>
          </div>

          {/* Streaming Services */}
          <div className="mb-10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2">
              <Tv className="w-4 h-4 text-sky-400" />
              Streaming Services
              <span className="text-white/20 font-normal">({streaming.length})</span>
            </h2>
            <div className="space-y-2">
              {streaming.map((p) => (
                <Link
                  key={p.platformId}
                  href={`/research/scores/platforms/${p.platformId}`}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#00D47E]/30 hover:bg-white/[0.05] transition-all"
                >
                  <div className="flex items-center justify-center w-8 text-sm font-mono text-white/30">
                    #{p.rank}
                  </div>
                  <div className={`text-xl font-bold w-12 text-center ${gradeColor(p.grade)}`}>
                    {p.grade}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white/80 group-hover:text-white transition">
                      {p.platformName}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/40 mt-0.5">
                      <span>{p.score}/100</span>
                      <span>{p.totalTests} tests</span>
                      {p.criticalFailures > 0 && (
                        <span className="flex items-center gap-1 text-red-400">
                          <AlertTriangle className="w-3 h-3" />
                          {p.criticalFailures} critical
                        </span>
                      )}
                      {p.gradeCapped && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${gradeBg(p.grade)}`}>
                          Grade capped
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/15 group-hover:text-[#00D47E] flex-shrink-0 transition" />
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom navigation */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/research/scores"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#00D47E]/10 border border-[#00D47E]/20 text-[#00D47E] hover:bg-[#00D47E]/20 transition inline-flex items-center gap-2"
            >
              View Full Scorecard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/research/scores/categories"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition inline-flex items-center gap-2"
            >
              Browse Categories <ArrowRight className="w-3.5 h-3.5" />
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
