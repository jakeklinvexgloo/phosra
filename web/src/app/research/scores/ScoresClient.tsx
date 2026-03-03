"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import {
  ArrowRight,
  AlertTriangle,
  Trophy,
  Shield,
  Activity,
  Calendar,
  ChevronDown,
  ChevronUp,
  Info,
  Scale,
  Globe,
  Bookmark,
  Target,
  CheckCircle2,
  XCircle,
  Circle,
  Copy,
  Check,
  Share2,
  Code,
  ExternalLink,
  Download,
} from "lucide-react"
import { AnimatedSection, WaveTexture, PhosraBurst } from "@/components/marketing/shared"
import {
  gradeTextColor,
  gradeBgColor,
  gradeBorderColor,
} from "@/lib/shared/grade-colors"
import type { PlatformScoreEntry, RegulatoryLandscapeData } from "./page"

function formatDate(raw: string): string {
  try {
    const d = new Date(raw)
    if (isNaN(d.getTime())) return raw
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  } catch {
    return raw
  }
}

type FilterCategory = "all" | "ai_chatbot" | "streaming"
type SortOption = "rank" | "grade" | "score" | "name"

interface ScoresClientProps {
  entries: PlatformScoreEntry[]
  totalPlatforms: number
  totalTests: number
  testCategories: number
  landscape: RegulatoryLandscapeData
}

const EXPOSURE_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  "very-high": { label: "Very High", color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/25" },
  high: { label: "High", color: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/25" },
  medium: { label: "Medium", color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/25" },
  low: { label: "Low", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/25" },
}

const JURISDICTION_LABELS: Record<string, string> = {
  "us-federal": "US Federal",
  "us-state": "US State",
  eu: "European Union",
  uk: "United Kingdom",
  "asia-pacific": "Asia-Pacific",
  americas: "Americas",
  "middle-east-africa": "Middle East & Africa",
}

function categoryBadgeClasses(category: "ai_chatbot" | "streaming"): string {
  if (category === "ai_chatbot") {
    return "bg-violet-500/15 border-violet-500/25 text-violet-300"
  }
  return "bg-sky-500/15 border-sky-500/25 text-sky-300"
}

function BadgeEmbed({ entries }: { entries: PlatformScoreEntry[] }) {
  const [selectedPlatform, setSelectedPlatform] = useState(entries[0]?.platformId ?? "claude")
  const [badgeStyle, setBadgeStyle] = useState<"flat" | "flat-square" | "plastic">("flat")
  const [copiedType, setCopiedType] = useState<string | null>(null)

  const badgeUrl = `https://www.phosra.com/api/research/badge/${selectedPlatform}?style=${badgeStyle}`
  const linkUrl = `https://www.phosra.com/research/scores`

  const htmlEmbed = `<a href="${linkUrl}"><img src="${badgeUrl}" alt="Phosra Safety Grade" /></a>`
  const mdEmbed = `[![Phosra Safety Grade](${badgeUrl})](${linkUrl})`

  const copyEmbed = useCallback((type: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedType(type)
    setTimeout(() => setCopiedType(null), 2000)
  }, [])

  const selectedEntry = entries.find((e) => e.platformId === selectedPlatform)

  return (
    <div className="mt-6 space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="rounded-lg bg-white/[0.06] border border-white/[0.1] text-sm text-white/80 px-3 py-2 outline-none focus:border-brand-green/40 transition-colors"
        >
          {entries.map((e) => (
            <option key={e.platformId} value={e.platformId} className="bg-[#0D1B2A]">
              {e.platformName}
            </option>
          ))}
        </select>

        <div className="flex rounded-lg border border-white/[0.1] overflow-hidden">
          {(["flat", "flat-square", "plastic"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setBadgeStyle(s)}
              className={`px-3 py-1.5 text-xs transition-colors ${
                badgeStyle === s
                  ? "bg-white/[0.12] text-white font-medium"
                  : "bg-white/[0.03] text-white/40 hover:text-white/60"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Badge Preview */}
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-6">
        <div className="text-xs text-white/30 mb-3">Preview</div>
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/research/badge/${selectedPlatform}?style=${badgeStyle}`}
            alt={`${selectedEntry?.platformName ?? selectedPlatform} safety badge`}
            className="h-5"
          />
          <a
            href={`/api/research/badge/${selectedPlatform}?style=${badgeStyle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/30 hover:text-white/50 flex items-center gap-1 transition-colors"
          >
            Open SVG
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Embed Code */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-white/60">HTML</span>
            <button
              onClick={() => copyEmbed("html", htmlEmbed)}
              className="flex items-center gap-1 text-xs text-white/30 hover:text-brand-green transition-colors"
            >
              {copiedType === "html" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copiedType === "html" ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="text-[11px] text-white/40 bg-black/20 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
            {htmlEmbed}
          </pre>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-white/60">Markdown</span>
            <button
              onClick={() => copyEmbed("md", mdEmbed)}
              className="flex items-center gap-1 text-xs text-white/30 hover:text-brand-green transition-colors"
            >
              {copiedType === "md" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copiedType === "md" ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="text-[11px] text-white/40 bg-black/20 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
            {mdEmbed}
          </pre>
        </div>
      </div>

      {/* All badges gallery */}
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-5">
        <div className="text-xs text-white/30 mb-4">All Platform Badges</div>
        <div className="flex flex-wrap gap-3">
          {entries.map((e) => (
            <a
              key={e.platformId}
              href={`/api/research/badge/${e.platformId}?style=${badgeStyle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/research/badge/${e.platformId}?style=${badgeStyle}`}
                alt={`${e.platformName} safety badge`}
                className="h-5"
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ScoresClient({
  entries,
  totalPlatforms,
  totalTests,
  testCategories,
  landscape,
}: ScoresClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [filter, setFilter] = useState<FilterCategory>("all")
  const [sort, setSort] = useState<SortOption>("rank")
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  // Initialize compare state from URL ?compare= param
  const [compareMode, setCompareMode] = useState(() => {
    const param = searchParams.get("compare")
    return !!param
  })
  const [compareIds, setCompareIds] = useState<Set<string>>(() => {
    const param = searchParams.get("compare")
    if (!param) return new Set<string>()
    const ids = param.split(",").filter((id) =>
      entries.some((e) => e.platformId === id)
    )
    return new Set(ids.slice(0, 4))
  })

  // Sync compareIds to URL
  const updateUrl = useCallback((ids: Set<string>, mode: boolean) => {
    const url = new URL(window.location.href)
    if (mode && ids.size > 0) {
      url.searchParams.set("compare", Array.from(ids).join(","))
    } else {
      url.searchParams.delete("compare")
    }
    router.replace(url.pathname + url.search, { scroll: false })
  }, [router])

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < 4) {
        next.add(id)
      }
      updateUrl(next, true)
      return next
    })
  }

  const copyCompareLink = async () => {
    const url = new URL(window.location.href)
    url.searchParams.set("compare", Array.from(compareIds).join(","))
    await navigator.clipboard.writeText(url.toString())
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const compareEntries = useMemo(
    () => entries.filter((e) => compareIds.has(e.platformId)),
    [entries, compareIds]
  )

  const filtered = useMemo(() => {
    let list = [...entries]
    if (filter !== "all") {
      list = list.filter((e) => e.category === filter)
    }
    switch (sort) {
      case "rank":
        list.sort((a, b) => a.rank - b.rank)
        break
      case "grade":
        list.sort((a, b) => a.rank - b.rank) // same as rank (grade-based)
        break
      case "score":
        list.sort((a, b) => b.numericalScore - a.numericalScore)
        break
      case "name":
        list.sort((a, b) => a.platformName.localeCompare(b.platformName))
        break
    }
    return list
  }, [entries, filter, sort])

  // Grade distribution
  const gradeDistribution = useMemo(() => {
    const dist = { A: 0, B: 0, C: 0, D: 0, F: 0 }
    for (const e of entries) {
      if (e.overallGrade.startsWith("A")) dist.A++
      else if (e.overallGrade.startsWith("B")) dist.B++
      else if (e.overallGrade.startsWith("C")) dist.C++
      else if (e.overallGrade.startsWith("D")) dist.D++
      else if (e.overallGrade === "F") dist.F++
    }
    return dist
  }, [entries])

  const avgScore = useMemo(() => {
    if (entries.length === 0) return 0
    return Math.round(
      entries.reduce((s, e) => s + e.numericalScore, 0) / entries.length * 10
    ) / 10
  }, [entries])

  const filterButtons: { label: string; value: FilterCategory }[] = [
    { label: "All Platforms", value: "all" },
    { label: "AI Chatbots", value: "ai_chatbot" },
    { label: "Streaming", value: "streaming" },
  ]

  const sortOptions: { label: string; value: SortOption }[] = [
    { label: "Rank", value: "rank" },
    { label: "Score", value: "score" },
    { label: "Name", value: "name" },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628]">
        <div className="absolute inset-0">
          <WaveTexture />
        </div>
        <div className="absolute top-10 right-10 opacity-5">
          <PhosraBurst size={400} color="#ffffff" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20 lg:pt-28 lg:pb-28">
          <AnimatedSection direction="up">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/[0.12] mb-6">
                <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                <span className="text-xs text-white/60">
                  Independent Safety Research
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-[1.1] mb-6">
                Platform Safety{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-300">
                  Scorecard
                </span>
              </h1>
              <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
                The first independent child safety accountability index. We test
                how major platforms protect children using standardized
                methodologies — and publish every result.
              </p>
            </div>
          </AnimatedSection>

          {/* Stats */}
          <AnimatedSection direction="up" className="mt-14">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-lg px-4 py-3 text-center bg-white/[0.05] border border-white/[0.08]">
                <div className="text-2xl sm:text-3xl font-display font-bold text-white">
                  {totalPlatforms}
                </div>
                <div className="text-xs text-white/50 mt-0.5">
                  Platforms Tested
                </div>
              </div>
              <div className="rounded-lg px-4 py-3 text-center bg-white/[0.05] border border-white/[0.08]">
                <div className="text-2xl sm:text-3xl font-display font-bold text-white">
                  {totalTests}
                </div>
                <div className="text-xs text-white/50 mt-0.5">Total Tests</div>
              </div>
              <div className="rounded-lg px-4 py-3 text-center bg-white/[0.05] border border-white/[0.08]">
                <div className="text-2xl sm:text-3xl font-display font-bold text-white">
                  {testCategories}
                </div>
                <div className="text-xs text-white/50 mt-0.5">
                  Test Categories
                </div>
              </div>
              <div className="rounded-lg px-4 py-3 text-center bg-white/[0.05] border border-white/[0.08]">
                <div className="text-2xl sm:text-3xl font-display font-bold text-white">
                  Mar 2026
                </div>
                <div className="text-xs text-white/50 mt-0.5">
                  Testing Period
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Filter Bar + Leaderboard */}
      <section className="bg-[#0D1B2A]">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
          {/* Filters */}
          <AnimatedSection direction="up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-2">
                {filterButtons.map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => setFilter(btn.value)}
                    className={[
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      filter === btn.value
                        ? "bg-brand-green/20 text-brand-green border border-brand-green/30"
                        : "bg-white/[0.05] text-white/60 border border-white/[0.08] hover:text-white/80 hover:bg-white/[0.08]",
                    ].join(" ")}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCompareMode(!compareMode)
                    if (compareMode) setCompareIds(new Set())
                  }}
                  className={[
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all mr-2",
                    compareMode
                      ? "bg-brand-green/20 text-brand-green border border-brand-green/30"
                      : "bg-white/[0.05] text-white/50 border border-white/[0.08] hover:text-white/70",
                  ].join(" ")}
                >
                  {compareMode ? `Compare (${compareIds.size})` : "Compare"}
                </button>
                <a
                  href="/api/research/scores/csv"
                  download="phosra-safety-scorecard.csv"
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-white/[0.05] text-white/50 border border-white/[0.08] hover:text-white/70 transition-all inline-flex items-center gap-1.5 mr-2"
                >
                  <Download className="w-3 h-3" />
                  CSV
                </a>
                <span className="text-xs text-white/40 mr-1">Sort:</span>
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSort(opt.value)}
                    className={[
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                      sort === opt.value
                        ? "bg-white/[0.12] text-white"
                        : "text-white/50 hover:text-white/70",
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Leaderboard */}
          <div className="space-y-3">
            {filtered.map((entry, idx) => {
              const isExpanded = expandedCard === entry.platformId
              const isFirst = entry.rank === 1

              return (
                <AnimatedSection
                  key={entry.platformId}
                  direction="up"
                  delay={Math.min(idx * 0.03, 0.3)}
                >
                  <div
                    className={[
                      "rounded-xl border transition-all",
                      "bg-white/[0.03] border-white/[0.08]",
                      "hover:border-white/[0.15] hover:bg-white/[0.05]",
                      isFirst ? "border-l-2 border-l-amber-400/50" : "",
                    ].join(" ")}
                  >
                    {/* Main row */}
                    <div className="flex items-center gap-4 p-4 sm:p-5">
                      {/* Compare checkbox */}
                      {compareMode && (
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleCompare(entry.platformId) }}
                          className={[
                            "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                            compareIds.has(entry.platformId)
                              ? "bg-brand-green border-brand-green"
                              : "border-white/20 hover:border-white/40",
                          ].join(" ")}
                        >
                          {compareIds.has(entry.platformId) && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          )}
                        </button>
                      )}

                      {/* Rank */}
                      <div className="flex-shrink-0 w-10 sm:w-12 text-center">
                        {isFirst ? (
                          <div className="flex flex-col items-center">
                            <Trophy className="w-5 h-5 text-amber-400 mb-0.5" />
                            <span className="text-lg sm:text-xl font-display font-bold text-amber-400">
                              {entry.rank}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl sm:text-2xl font-display font-bold text-white/40">
                            {entry.rank}
                          </span>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="w-px h-12 bg-white/[0.08] flex-shrink-0 hidden sm:block" />

                      {/* Platform info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                            {entry.platformName}
                          </h3>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${categoryBadgeClasses(entry.category)}`}
                          >
                            {entry.categoryLabel}
                          </span>
                          {entry.gradeCapped && (
                            <span className="inline-flex items-center gap-1 text-orange-400/80 group relative">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-medium hidden sm:inline">
                                Grade Capped
                              </span>
                              {/* Tooltip */}
                              <span className="absolute left-0 top-full mt-1 z-50 hidden group-hover:block w-56 p-2 rounded-lg bg-[#1a2d42] border border-white/10 text-xs text-white/70 shadow-xl">
                                {entry.gradeCapReasons.length > 0
                                  ? entry.gradeCapReasons.join("; ")
                                  : "Grade capped due to critical safety failures"}
                              </span>
                            </span>
                          )}
                          {entry.regulatory.applicableLawCount > 0 && (() => {
                            const style = EXPOSURE_STYLES[entry.regulatory.exposureLevel] ?? EXPOSURE_STYLES.low
                            return (
                              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${style.bg} ${style.border} ${style.color} hidden sm:inline-flex`}>
                                {entry.regulatory.applicableLawCount} laws
                              </span>
                            )
                          })()}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/40">
                          <span className="inline-flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {entry.totalTests} tests
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {entry.criticalFailures} critical{" "}
                            {entry.criticalFailures === 1
                              ? "failure"
                              : "failures"}
                          </span>
                          <span className="inline-flex items-center gap-1 hidden sm:inline-flex">
                            <Calendar className="w-3 h-3" />
                            {formatDate(entry.testDate)}
                          </span>
                        </div>
                      </div>

                      {/* Grade + Score */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-sm font-semibold text-white/70">
                            {entry.numericalScore.toFixed(1)}
                            <span className="text-white/30">/100</span>
                          </div>
                        </div>
                        <div
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-display font-bold text-lg sm:text-xl ${gradeBgColor(entry.overallGrade)} ${gradeBorderColor(entry.overallGrade)} border ${gradeTextColor(entry.overallGrade)}`}
                        >
                          {entry.overallGrade}
                        </div>
                      </div>

                      {/* Expand toggle */}
                      <button
                        onClick={() =>
                          setExpandedCard(isExpanded ? null : entry.platformId)
                        }
                        className="flex-shrink-0 p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-colors"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Expanded section */}
                    {isExpanded && (
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                        <div className="border-t border-white/[0.06] pt-4">
                          {/* Category scores */}
                          {entry.topCategories.length > 0 && (
                            <div className="mb-4">
                              <div className="text-xs text-white/40 mb-2">
                                {entry.category === "ai_chatbot"
                                  ? "Top Categories by Weight"
                                  : "Profile Grades"}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {entry.topCategories.map((cat) => (
                                  <span
                                    key={cat.name}
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${gradeBgColor(cat.grade)} ${gradeBorderColor(cat.grade)} ${gradeTextColor(cat.grade)}`}
                                  >
                                    <span className="text-white/50 max-w-[120px] truncate">
                                      {cat.name}
                                    </span>
                                    <span className="font-bold">
                                      {cat.grade}
                                    </span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Score bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs text-white/40 mb-1.5">
                              <span>Score</span>
                              <span>
                                {entry.numericalScore.toFixed(1)} / 100
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  entry.overallGrade.startsWith("A")
                                    ? "bg-emerald-500"
                                    : entry.overallGrade.startsWith("B")
                                      ? "bg-blue-500"
                                      : entry.overallGrade.startsWith("C")
                                        ? "bg-amber-500"
                                        : entry.overallGrade.startsWith("D")
                                          ? "bg-orange-500"
                                          : "bg-red-500"
                                }`}
                                style={{
                                  width: `${Math.min(entry.numericalScore, 100)}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Grade cap reasons */}
                          {entry.gradeCapped &&
                            entry.gradeCapReasons.length > 0 && (
                              <div className="mb-4 rounded-lg bg-orange-500/5 border border-orange-500/10 p-3">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-orange-400 mb-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Grade Cap Applied
                                </div>
                                <ul className="text-xs text-white/50 space-y-0.5">
                                  {entry.gradeCapReasons.map((reason, i) => (
                                    <li key={i}>- {reason}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                          {/* Regulatory exposure */}
                          {entry.regulatory.applicableLawCount > 0 && (() => {
                            const style = EXPOSURE_STYLES[entry.regulatory.exposureLevel] ?? EXPOSURE_STYLES.low
                            return (
                              <div className="mb-4 rounded-lg bg-white/[0.03] border border-white/[0.08] p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <Scale className="w-3.5 h-3.5 text-white/40" />
                                  <span className="text-xs font-medium text-white/60">Regulatory Exposure</span>
                                  <span className={`ml-auto inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${style.bg} ${style.border} ${style.color}`}>
                                    {style.label}
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-3">
                                  <div className="text-center">
                                    <div className="text-lg font-display font-bold text-white">{entry.regulatory.applicableLawCount}</div>
                                    <div className="text-[10px] text-white/40">Applicable Laws</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg font-display font-bold text-emerald-400">{entry.regulatory.enactedCount}</div>
                                    <div className="text-[10px] text-white/40">Enacted</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg font-display font-bold text-amber-400">{entry.regulatory.pendingCount}</div>
                                    <div className="text-[10px] text-white/40">Pending</div>
                                  </div>
                                </div>

                                {entry.regulatory.topLaws.length > 0 && (
                                  <div className="space-y-1.5">
                                    <div className="text-[10px] text-white/30 uppercase tracking-wider">Key Legislation</div>
                                    {entry.regulatory.topLaws.map((law) => (
                                      <Link
                                        key={law.id}
                                        href={`/compliance/${law.id}`}
                                        className="flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] transition-colors group"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <Bookmark className="w-3 h-3 text-white/20 flex-shrink-0" />
                                          <span className="text-xs text-white/60 group-hover:text-white/80 truncate">{law.shortName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          <span className="text-[10px] text-white/30">{law.jurisdiction}</span>
                                          <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                                            law.status === "enacted" || law.status === "passed"
                                              ? "bg-emerald-500/15 text-emerald-400"
                                              : law.status === "injunction"
                                                ? "bg-red-500/15 text-red-400"
                                                : "bg-amber-500/15 text-amber-400"
                                          }`}>
                                            {law.status}
                                          </span>
                                        </div>
                                      </Link>
                                    ))}
                                  </div>
                                )}

                                <div className="flex items-center gap-1.5 mt-3">
                                  <Link
                                    href="/compliance"
                                    className="text-[11px] text-white/40 hover:text-brand-green transition-colors"
                                  >
                                    View all {entry.regulatory.applicableLawCount} applicable laws →
                                  </Link>
                                </div>
                              </div>
                            )
                          })()}

                          {/* Compliance gap analysis */}
                          {entry.complianceGap.totalRequired > 0 && (
                            <div className="mb-4 rounded-lg bg-white/[0.03] border border-white/[0.08] p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Target className="w-3.5 h-3.5 text-white/40" />
                                <span className="text-xs font-medium text-white/60">Compliance Coverage</span>
                                <span className={`ml-auto inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                                  entry.complianceGap.coveragePercent >= 60
                                    ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-400"
                                    : entry.complianceGap.coveragePercent >= 35
                                      ? "bg-amber-500/15 border-amber-500/25 text-amber-400"
                                      : "bg-red-500/15 border-red-500/25 text-red-400"
                                }`}>
                                  {entry.complianceGap.coveragePercent}% tested
                                </span>
                              </div>

                              {/* Coverage bar */}
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-[10px] text-white/40 mb-1">
                                  <span>{entry.complianceGap.totalCovered} of {entry.complianceGap.totalRequired} required categories covered by testing</span>
                                  <span>{entry.complianceGap.totalGaps} gaps</span>
                                </div>
                                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden flex">
                                  {entry.complianceGap.entries.length > 0 && (() => {
                                    const covered = entry.complianceGap.entries.filter((e) => e.status === "covered").length
                                    const partial = entry.complianceGap.entries.filter((e) => e.status === "partial").length
                                    const total = entry.complianceGap.entries.length
                                    return (
                                      <>
                                        {covered > 0 && (
                                          <div
                                            className="h-full bg-emerald-500/70 transition-all"
                                            style={{ width: `${(covered / total) * 100}%` }}
                                          />
                                        )}
                                        {partial > 0 && (
                                          <div
                                            className="h-full bg-amber-500/70 transition-all"
                                            style={{ width: `${(partial / total) * 100}%` }}
                                          />
                                        )}
                                      </>
                                    )
                                  })()}
                                </div>
                                <div className="flex items-center gap-3 mt-1.5">
                                  <span className="flex items-center gap-1 text-[10px] text-white/30">
                                    <span className="w-2 h-2 rounded-sm bg-emerald-500/70" />
                                    Covered
                                  </span>
                                  <span className="flex items-center gap-1 text-[10px] text-white/30">
                                    <span className="w-2 h-2 rounded-sm bg-amber-500/70" />
                                    Partial
                                  </span>
                                  <span className="flex items-center gap-1 text-[10px] text-white/30">
                                    <span className="w-2 h-2 rounded-sm bg-white/[0.06]" />
                                    Gap
                                  </span>
                                </div>
                              </div>

                              {/* Top gaps */}
                              {entry.complianceGap.topGaps.length > 0 && (
                                <div>
                                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Top Untested Requirements</div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {entry.complianceGap.topGaps.map((gap) => (
                                      <span
                                        key={gap.category}
                                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] bg-red-500/8 border border-red-500/15 text-red-400/80"
                                      >
                                        <XCircle className="w-2.5 h-2.5" />
                                        {gap.label}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* View details link */}
                          <Link
                            href={entry.detailUrl}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-green hover:text-brand-green/80 transition-colors"
                          >
                            View Full Report
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </AnimatedSection>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-white/40">
              <Shield className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                No platforms match the selected filter.
              </p>
            </div>
          )}

          {/* Comparison Panel */}
          {compareMode && compareEntries.length >= 2 && (
            <AnimatedSection direction="up" className="mt-8">
              <div className="rounded-xl border border-brand-green/20 bg-brand-green/[0.03] p-5 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-display font-bold text-white">
                    Platform Comparison
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={copyCompareLink}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] border border-white/[0.1] text-white/60 hover:text-white hover:bg-white/[0.1] transition-all"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3 h-3 text-brand-green" />
                          <span className="text-brand-green">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3 h-3" />
                          Share link
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => { setCompareMode(false); setCompareIds(new Set()); updateUrl(new Set(), false) }}
                      className="text-xs text-white/40 hover:text-white/60 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Comparison table */}
                <div className="overflow-x-auto -mx-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.08]">
                        <th className="text-left text-xs text-white/40 font-normal pb-3 pr-4 pl-2 w-[140px]">Metric</th>
                        {compareEntries.map((e) => (
                          <th key={e.platformId} className="text-center text-xs font-semibold text-white pb-3 px-2">
                            {e.platformName}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {/* Grade */}
                      <tr>
                        <td className="py-2.5 pr-4 pl-2 text-xs text-white/50">Grade</td>
                        {compareEntries.map((e) => (
                          <td key={e.platformId} className="py-2.5 px-2 text-center">
                            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-display font-bold text-base ${gradeBgColor(e.overallGrade)} ${gradeBorderColor(e.overallGrade)} border ${gradeTextColor(e.overallGrade)}`}>
                              {e.overallGrade}
                            </span>
                          </td>
                        ))}
                      </tr>
                      {/* Score */}
                      <tr>
                        <td className="py-2.5 pr-4 pl-2 text-xs text-white/50">Score</td>
                        {compareEntries.map((e) => {
                          const best = Math.max(...compareEntries.map((c) => c.numericalScore))
                          const isBest = e.numericalScore === best
                          return (
                            <td key={e.platformId} className="py-2.5 px-2 text-center">
                              <span className={`text-sm font-semibold ${isBest ? "text-brand-green" : "text-white/70"}`}>
                                {e.numericalScore.toFixed(1)}
                              </span>
                              <span className="text-white/30 text-xs">/100</span>
                            </td>
                          )
                        })}
                      </tr>
                      {/* Rank */}
                      <tr>
                        <td className="py-2.5 pr-4 pl-2 text-xs text-white/50">Rank</td>
                        {compareEntries.map((e) => (
                          <td key={e.platformId} className="py-2.5 px-2 text-center text-sm text-white/60">
                            #{e.rank}
                          </td>
                        ))}
                      </tr>
                      {/* Category */}
                      <tr>
                        <td className="py-2.5 pr-4 pl-2 text-xs text-white/50">Type</td>
                        {compareEntries.map((e) => (
                          <td key={e.platformId} className="py-2.5 px-2 text-center">
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${categoryBadgeClasses(e.category)}`}>
                              {e.categoryLabel}
                            </span>
                          </td>
                        ))}
                      </tr>
                      {/* Tests */}
                      <tr>
                        <td className="py-2.5 pr-4 pl-2 text-xs text-white/50">Tests Run</td>
                        {compareEntries.map((e) => (
                          <td key={e.platformId} className="py-2.5 px-2 text-center text-sm text-white/60">
                            {e.totalTests}
                          </td>
                        ))}
                      </tr>
                      {/* Critical Failures */}
                      <tr>
                        <td className="py-2.5 pr-4 pl-2 text-xs text-white/50">Critical Failures</td>
                        {compareEntries.map((e) => {
                          const worst = Math.max(...compareEntries.map((c) => c.criticalFailures))
                          const isWorst = e.criticalFailures === worst && worst > 0
                          return (
                            <td key={e.platformId} className="py-2.5 px-2 text-center">
                              <span className={`text-sm font-semibold ${isWorst ? "text-red-400" : e.criticalFailures === 0 ? "text-emerald-400" : "text-white/60"}`}>
                                {e.criticalFailures}
                              </span>
                            </td>
                          )
                        })}
                      </tr>
                      {/* Grade Capped */}
                      <tr>
                        <td className="py-2.5 pr-4 pl-2 text-xs text-white/50">Grade Capped</td>
                        {compareEntries.map((e) => (
                          <td key={e.platformId} className="py-2.5 px-2 text-center">
                            {e.gradeCapped ? (
                              <span className="text-orange-400 text-xs font-medium">Yes</span>
                            ) : (
                              <span className="text-emerald-400 text-xs font-medium">No</span>
                            )}
                          </td>
                        ))}
                      </tr>
                      {/* Applicable Laws */}
                      <tr>
                        <td className="py-2.5 pr-4 pl-2 text-xs text-white/50">Applicable Laws</td>
                        {compareEntries.map((e) => {
                          const style = EXPOSURE_STYLES[e.regulatory.exposureLevel] ?? EXPOSURE_STYLES.low
                          return (
                            <td key={e.platformId} className="py-2.5 px-2 text-center">
                              <span className={`text-sm font-semibold ${style.color}`}>{e.regulatory.applicableLawCount}</span>
                            </td>
                          )
                        })}
                      </tr>
                      {/* Regulatory Exposure */}
                      <tr>
                        <td className="py-2.5 pr-4 pl-2 text-xs text-white/50">Exposure Level</td>
                        {compareEntries.map((e) => {
                          const style = EXPOSURE_STYLES[e.regulatory.exposureLevel] ?? EXPOSURE_STYLES.low
                          return (
                            <td key={e.platformId} className="py-2.5 px-2 text-center">
                              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${style.bg} ${style.border} ${style.color}`}>
                                {style.label}
                              </span>
                            </td>
                          )
                        })}
                      </tr>
                      {/* Compliance Coverage */}
                      <tr>
                        <td className="py-2.5 pr-4 pl-2 text-xs text-white/50">Compliance Coverage</td>
                        {compareEntries.map((e) => {
                          const best = Math.max(...compareEntries.map((c) => c.complianceGap.coveragePercent))
                          const isBest = e.complianceGap.coveragePercent === best
                          return (
                            <td key={e.platformId} className="py-2.5 px-2 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className={`text-sm font-semibold ${isBest ? "text-brand-green" : "text-white/60"}`}>
                                  {e.complianceGap.coveragePercent}%
                                </span>
                                <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${isBest ? "bg-brand-green/70" : "bg-white/20"}`}
                                    style={{ width: `${e.complianceGap.coveragePercent}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                      {/* Compliance Gaps */}
                      <tr>
                        <td className="py-2.5 pr-4 pl-2 text-xs text-white/50">Untested Gaps</td>
                        {compareEntries.map((e) => {
                          const fewest = Math.min(...compareEntries.map((c) => c.complianceGap.totalGaps))
                          const isBest = e.complianceGap.totalGaps === fewest
                          return (
                            <td key={e.platformId} className="py-2.5 px-2 text-center">
                              <span className={`text-sm font-semibold ${isBest ? "text-emerald-400" : "text-red-400/70"}`}>
                                {e.complianceGap.totalGaps}
                              </span>
                            </td>
                          )
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Links to full reports */}
                <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-white/[0.06]">
                  {compareEntries.map((e) => (
                    <Link
                      key={e.platformId}
                      href={e.detailUrl}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-green hover:text-brand-green/80 transition-colors"
                    >
                      {e.platformName} Report
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          )}

          {compareMode && compareEntries.length < 2 && (
            <div className="mt-6 text-center py-8 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02]">
              <Target className="w-8 h-8 mx-auto mb-2 text-white/20" />
              <p className="text-sm text-white/40">
                Select {compareEntries.length === 0 ? "2-4" : `${2 - compareEntries.length} more`} platforms to compare
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Grade Distribution Summary */}
      <section className="bg-[#0A1628] border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-14">
          <AnimatedSection direction="up">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-8">
              Grade Distribution
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {(
                [
                  {
                    label: "A Grades",
                    count: gradeDistribution.A,
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                    border: "border-emerald-500/20",
                  },
                  {
                    label: "B Grades",
                    count: gradeDistribution.B,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    border: "border-blue-500/20",
                  },
                  {
                    label: "C Grades",
                    count: gradeDistribution.C,
                    color: "text-amber-400",
                    bg: "bg-amber-500/10",
                    border: "border-amber-500/20",
                  },
                  {
                    label: "D Grades",
                    count: gradeDistribution.D,
                    color: "text-orange-400",
                    bg: "bg-orange-500/10",
                    border: "border-orange-500/20",
                  },
                  {
                    label: "F Grades",
                    count: gradeDistribution.F,
                    color: "text-red-400",
                    bg: "bg-red-500/10",
                    border: "border-red-500/20",
                  },
                  {
                    label: "Avg Score",
                    count: avgScore,
                    color: "text-white",
                    bg: "bg-white/[0.05]",
                    border: "border-white/[0.08]",
                    suffix: "/100",
                  },
                ] as const
              ).map((item) => (
                <div
                  key={item.label}
                  className={`rounded-lg px-3 py-3 text-center border ${item.bg} ${item.border}`}
                >
                  <div
                    className={`text-2xl font-display font-bold ${item.color}`}
                  >
                    {item.count}
                    {"suffix" in item && (
                      <span className="text-sm text-white/30">
                        {item.suffix}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-white/40 mt-0.5">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Stacked bar chart */}
            <div className="rounded-lg bg-white/[0.03] border border-white/[0.08] p-4">
              <div className="text-xs text-white/40 mb-3">
                Distribution across {entries.length} platforms
              </div>
              <div className="h-6 rounded-full bg-white/[0.04] overflow-hidden flex">
                {entries.length > 0 && (
                  <>
                    {gradeDistribution.A > 0 && (
                      <div
                        className="bg-emerald-500/60 transition-all duration-500 flex items-center justify-center"
                        style={{
                          width: `${(gradeDistribution.A / entries.length) * 100}%`,
                        }}
                      >
                        {gradeDistribution.A > 0 && (
                          <span className="text-[10px] font-bold text-white/90">
                            A
                          </span>
                        )}
                      </div>
                    )}
                    {gradeDistribution.B > 0 && (
                      <div
                        className="bg-blue-500/60 transition-all duration-500 flex items-center justify-center"
                        style={{
                          width: `${(gradeDistribution.B / entries.length) * 100}%`,
                        }}
                      >
                        <span className="text-[10px] font-bold text-white/90">
                          B
                        </span>
                      </div>
                    )}
                    {gradeDistribution.C > 0 && (
                      <div
                        className="bg-amber-500/60 transition-all duration-500 flex items-center justify-center"
                        style={{
                          width: `${(gradeDistribution.C / entries.length) * 100}%`,
                        }}
                      >
                        <span className="text-[10px] font-bold text-white/90">
                          C
                        </span>
                      </div>
                    )}
                    {gradeDistribution.D > 0 && (
                      <div
                        className="bg-orange-500/60 transition-all duration-500 flex items-center justify-center"
                        style={{
                          width: `${(gradeDistribution.D / entries.length) * 100}%`,
                        }}
                      >
                        <span className="text-[10px] font-bold text-white/90">
                          D
                        </span>
                      </div>
                    )}
                    {gradeDistribution.F > 0 && (
                      <div
                        className="bg-red-500/60 transition-all duration-500 flex items-center justify-center"
                        style={{
                          width: `${(gradeDistribution.F / entries.length) * 100}%`,
                        }}
                      >
                        <span className="text-[10px] font-bold text-white/90">
                          F
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {[
                  {
                    label: "A",
                    color: "bg-emerald-500/60",
                    count: gradeDistribution.A,
                  },
                  {
                    label: "B",
                    color: "bg-blue-500/60",
                    count: gradeDistribution.B,
                  },
                  {
                    label: "C",
                    color: "bg-amber-500/60",
                    count: gradeDistribution.C,
                  },
                  {
                    label: "D",
                    color: "bg-orange-500/60",
                    count: gradeDistribution.D,
                  },
                  {
                    label: "F",
                    color: "bg-red-500/60",
                    count: gradeDistribution.F,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-1.5 text-xs text-white/40"
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-sm ${item.color}`}
                    />
                    {item.label} ({item.count})
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Regulatory Landscape */}
      <section className="bg-[#0D1B2A] border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-14">
          <AnimatedSection direction="up">
            <div className="flex items-start gap-3 mb-8">
              <Scale className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                  Regulatory Landscape
                </h2>
                <p className="text-sm text-white/40 mt-1">
                  Child safety legislation tracked across jurisdictions worldwide
                </p>
              </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="rounded-lg px-4 py-3 text-center bg-white/[0.05] border border-white/[0.08]">
                <div className="text-2xl font-display font-bold text-white">{landscape.totalLaws}</div>
                <div className="text-[10px] text-white/40 mt-0.5">Total Laws Tracked</div>
              </div>
              <div className="rounded-lg px-4 py-3 text-center bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-2xl font-display font-bold text-emerald-400">{landscape.enactedCount}</div>
                <div className="text-[10px] text-white/40 mt-0.5">Enacted / Passed</div>
              </div>
              <div className="rounded-lg px-4 py-3 text-center bg-amber-500/10 border border-amber-500/20">
                <div className="text-2xl font-display font-bold text-amber-400">{landscape.pendingCount}</div>
                <div className="text-[10px] text-white/40 mt-0.5">Pending / Proposed</div>
              </div>
              <div className="rounded-lg px-4 py-3 text-center bg-violet-500/10 border border-violet-500/20">
                <div className="text-2xl font-display font-bold text-violet-400">{landscape.totalRuleCategories}</div>
                <div className="text-[10px] text-white/40 mt-0.5">PCSS Rule Categories</div>
              </div>
            </div>

            {/* Jurisdiction breakdown + Top categories side by side */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Jurisdictions */}
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-4 h-4 text-white/40" />
                  <h3 className="text-sm font-semibold text-white">By Jurisdiction</h3>
                </div>
                <div className="space-y-2">
                  {landscape.jurisdictionBreakdown.slice(0, 7).map((j) => {
                    const pct = landscape.totalLaws > 0 ? (j.count / landscape.totalLaws) * 100 : 0
                    return (
                      <div key={j.jurisdiction}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-white/60">{JURISDICTION_LABELS[j.jurisdiction] ?? j.jurisdiction}</span>
                          <span className="text-white/40">{j.count}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-brand-green/50 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Top rule categories */}
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-white/40" />
                  <h3 className="text-sm font-semibold text-white">Top Rule Categories</h3>
                </div>
                <div className="space-y-2">
                  {landscape.topCategories.slice(0, 7).map((cat) => {
                    const pct = landscape.totalLaws > 0 ? (cat.count / landscape.totalLaws) * 100 : 0
                    return (
                      <div key={cat.category}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-white/60">{cat.category.replace(/_/g, " ")}</span>
                          <span className="text-white/40">{cat.count} laws</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-violet-500/50 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/compliance"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-sm text-white/70 hover:text-white hover:bg-white/[0.1] transition-all"
              >
                Explore Full Compliance Hub
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Methodology Note */}
      <section className="bg-[#0A1628] border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-14">
          <AnimatedSection direction="up">
            <div className="flex items-start gap-3 mb-6">
              <Info className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                Methodology
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-5">
                <h3 className="text-sm font-semibold text-white mb-3">
                  How Scores Work
                </h3>
                <ul className="space-y-2 text-xs text-white/50 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-white/20 mt-0.5">-</span>
                    Scores are computed independently for each platform category
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white/20 mt-0.5">-</span>
                    AI chatbots: 40 test prompts across 12 harm categories
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white/20 mt-0.5">-</span>
                    Streaming: 9 test categories across 3-4 user profiles
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white/20 mt-0.5">-</span>
                    Critical safety failures trigger automatic grade caps
                  </li>
                </ul>
              </div>

              <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-5">
                <h3 className="text-sm font-semibold text-white mb-3">
                  Learn More
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/research/ai-chatbots/methodology"
                      className="flex items-center gap-2 text-xs text-white/50 hover:text-brand-green transition-colors"
                    >
                      <ArrowRight className="w-3 h-3" />
                      AI Chatbot Testing Methodology
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/research/streaming/methodology"
                      className="flex items-center gap-2 text-xs text-white/50 hover:text-brand-green transition-colors"
                    >
                      <ArrowRight className="w-3 h-3" />
                      Streaming Testing Methodology
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/research/ai-chatbots"
                      className="flex items-center gap-2 text-xs text-white/50 hover:text-brand-green transition-colors"
                    >
                      <ArrowRight className="w-3 h-3" />
                      AI Chatbot Safety Portal
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/research/streaming"
                      className="flex items-center gap-2 text-xs text-white/50 hover:text-brand-green transition-colors"
                    >
                      <ArrowRight className="w-3 h-3" />
                      Streaming Safety Portal
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Embeddable Badges */}
      <section className="bg-[#0D1B2A] border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-14">
          <AnimatedSection direction="up">
            <div className="flex items-start gap-3 mb-2">
              <Code className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                  Embed Safety Badges
                </h2>
                <p className="text-sm text-white/40 mt-1">
                  Add safety grade badges to articles, reports, and documentation
                </p>
              </div>
            </div>

            <BadgeEmbed entries={entries} />
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
