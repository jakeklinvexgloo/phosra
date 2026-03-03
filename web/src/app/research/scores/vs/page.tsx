import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Scale, Bot, Tv, Swords } from "lucide-react"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import { loadAllStreamingPlatforms } from "@/lib/streaming-research/loaders"

export const metadata: Metadata = {
  title: "Head-to-Head Comparisons — Platform Safety Scorecard — Phosra",
  description:
    "55 head-to-head child safety comparisons across 11 platforms. Compare AI chatbots and streaming services side-by-side on safety grades, scores, and compliance.",
}

const PLATFORM_NAMES: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  grok: "Grok",
  character_ai: "Character.AI",
  copilot: "Microsoft Copilot",
  perplexity: "Perplexity",
  replika: "Replika",
  netflix: "Netflix",
  prime_video: "Prime Video",
  peacock: "Peacock",
}

const AI_IDS = ["chatgpt", "claude", "gemini", "grok", "character_ai", "copilot", "perplexity", "replika"]
const STREAMING_IDS = ["netflix", "prime_video", "peacock"]

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "text-emerald-400"
  if (grade.startsWith("B")) return "text-green-400"
  if (grade.startsWith("C")) return "text-amber-400"
  if (grade.startsWith("D")) return "text-orange-400"
  return "text-red-400"
}

interface PlatformScore {
  platformId: string
  name: string
  grade: string
  score: number
  category: "ai_chatbot" | "streaming"
}

export default async function ComparisonsIndexPage() {
  const [chatbotPlatforms, streamingPlatforms] = await Promise.all([
    loadAllChatbotResearch(),
    loadAllStreamingPlatforms(),
  ])

  const scoreMap = new Map<string, PlatformScore>()

  for (const p of chatbotPlatforms) {
    const sc = p.chatbotData?.safetyTesting?.scorecard
    if (!sc) continue
    scoreMap.set(p.platformId, {
      platformId: p.platformId,
      name: p.platformName,
      grade: sc.overallGrade,
      score: sc.numericalScore,
      category: "ai_chatbot",
    })
  }

  for (const p of streamingPlatforms) {
    scoreMap.set(p.platformId, {
      platformId: p.platformId,
      name: p.platformName,
      grade: p.overallGrade,
      score: p.overallScore,
      category: "streaming",
    })
  }

  function makeSlug(a: string, b: string): string {
    return [a, b].sort().join("-vs-")
  }

  // Featured comparisons (same as main scorecard)
  const featured = [
    ["claude", "chatgpt"],
    ["claude", "gemini"],
    ["chatgpt", "gemini"],
    ["claude", "copilot"],
    ["character_ai", "replika"],
    ["netflix", "prime_video"],
    ["chatgpt", "grok"],
    ["copilot", "perplexity"],
    ["netflix", "peacock"],
  ]

  // AI vs AI comparisons (excluding featured)
  const featuredSlugs = new Set(featured.map(([a, b]) => makeSlug(a, b)))
  const aiVsAi: [string, string][] = []
  for (let i = 0; i < AI_IDS.length; i++) {
    for (let j = i + 1; j < AI_IDS.length; j++) {
      const slug = makeSlug(AI_IDS[i], AI_IDS[j])
      if (!featuredSlugs.has(slug)) {
        aiVsAi.push([AI_IDS[i], AI_IDS[j]])
      }
    }
  }

  // Streaming vs Streaming (excluding featured)
  const streamVsStream: [string, string][] = []
  for (let i = 0; i < STREAMING_IDS.length; i++) {
    for (let j = i + 1; j < STREAMING_IDS.length; j++) {
      const slug = makeSlug(STREAMING_IDS[i], STREAMING_IDS[j])
      if (!featuredSlugs.has(slug)) {
        streamVsStream.push([STREAMING_IDS[i], STREAMING_IDS[j]])
      }
    }
  }

  // Cross-portal comparisons
  const crossPortal: [string, string][] = []
  for (const ai of AI_IDS) {
    for (const st of STREAMING_IDS) {
      crossPortal.push([ai, st])
    }
  }

  function renderMatchup(a: string, b: string) {
    const pA = scoreMap.get(a)
    const pB = scoreMap.get(b)
    if (!pA || !pB) return null
    const slug = makeSlug(a, b)
    const delta = Math.abs(pA.score - pB.score)
    return (
      <Link
        key={slug}
        href={`/research/scores/vs/${slug}`}
        className="group flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#00D47E]/30 hover:bg-white/[0.05] transition-all"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className={`text-lg font-black ${gradeColor(pA.grade)} w-8 text-center`}>{pA.grade}</span>
          <span className="text-sm text-white/70 truncate">{pA.name}</span>
        </div>
        <div className="flex flex-col items-center flex-shrink-0 px-1">
          <span className="text-[10px] font-bold text-white/20">VS</span>
          <span className="text-[9px] text-white/15">{delta > 0 ? `${delta.toFixed(1)}pt` : "tie"}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
          <span className="text-sm text-white/70 truncate text-right">{pB.name}</span>
          <span className={`text-lg font-black ${gradeColor(pB.grade)} w-8 text-center`}>{pB.grade}</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-white/15 group-hover:text-[#00D47E] flex-shrink-0 transition" />
      </Link>
    )
  }

  const totalComparisons = featured.length + aiVsAi.length + streamVsStream.length + crossPortal.length

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Head-to-Head Safety Comparisons",
    description: `${totalComparisons} side-by-side child safety comparisons across 11 platforms.`,
    numberOfItems: totalComparisons,
    isPartOf: {
      "@type": "WebPage",
      name: "Platform Safety Scorecard",
      url: "https://www.phosra.com/research/scores",
    },
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
            <Scale className="w-6 h-6 text-[#00D47E] flex-shrink-0 mt-1" />
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#00D47E]/60 block mb-1">
                Platform Safety Scorecard
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Head-to-Head Comparisons</h1>
              <p className="text-sm text-white/50 max-w-2xl">
                {totalComparisons} side-by-side comparisons across {scoreMap.size} platforms.
                Each comparison shows grades, scores, category breakdowns, regulatory exposure, and compliance gaps.
              </p>
            </div>
          </div>

          {/* Featured Comparisons */}
          <div className="mb-10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2">
              <Swords className="w-4 h-4 text-[#00D47E]" />
              Popular Matchups
              <span className="text-white/20 font-normal">({featured.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {featured.map(([a, b]) => renderMatchup(a, b))}
            </div>
          </div>

          {/* AI vs AI */}
          {aiVsAi.length > 0 && (
            <div className="mb-10">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2">
                <Bot className="w-4 h-4 text-violet-400" />
                AI Chatbot vs AI Chatbot
                <span className="text-white/20 font-normal">({aiVsAi.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {aiVsAi.map(([a, b]) => renderMatchup(a, b))}
              </div>
            </div>
          )}

          {/* Streaming vs Streaming */}
          {streamVsStream.length > 0 && (
            <div className="mb-10">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2">
                <Tv className="w-4 h-4 text-sky-400" />
                Streaming vs Streaming
                <span className="text-white/20 font-normal">({streamVsStream.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {streamVsStream.map(([a, b]) => renderMatchup(a, b))}
              </div>
            </div>
          )}

          {/* Cross-Portal */}
          <div className="mb-10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              Cross-Portal (AI vs Streaming)
              <span className="text-white/20 font-normal">({crossPortal.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {crossPortal.map(([a, b]) => renderMatchup(a, b))}
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
