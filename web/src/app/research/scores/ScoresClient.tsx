"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
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

export function ScoresClient({
  entries,
  totalPlatforms,
  totalTests,
  testCategories,
  landscape,
}: ScoresClientProps) {
  const [filter, setFilter] = useState<FilterCategory>("all")
  const [sort, setSort] = useState<SortOption>("rank")
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

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
    </div>
  )
}
