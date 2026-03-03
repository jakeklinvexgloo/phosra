"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Trophy,
  Shield,
  AlertTriangle,
  Activity,
  Scale,
  Globe,
  CheckCircle2,
  XCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  ExternalLink,
} from "lucide-react"
import {
  gradeTextColor,
  gradeBgColor,
  gradeBorderColor,
} from "@/lib/shared/grade-colors"
import type { PlatformProfileData } from "./page"

/* ── Shared helpers ──────────────────────────────────────────────── */
function formatDate(raw: string): string {
  try {
    const d = new Date(raw)
    if (isNaN(d.getTime())) return raw
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  } catch {
    return raw
  }
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

function ScoreBar({ score, color }: { score: number; color?: string }) {
  const barColor = color ?? (score >= 90 ? "bg-emerald-500" : score >= 80 ? "bg-blue-500" : score >= 70 ? "bg-amber-500" : score >= 60 ? "bg-orange-500" : "bg-red-500")
  return (
    <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
      <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${Math.min(score, 100)}%` }} />
    </div>
  )
}

function StatusIcon({ status }: { status: "covered" | "partial" | "gap" }) {
  if (status === "covered") return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
  if (status === "partial") return <Circle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
  return <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
}

/* ── Main Component ──────────────────────────────────────────────── */
export function PlatformProfileClient({ data }: { data: PlatformProfileData }) {
  const [showAllCompliance, setShowAllCompliance] = useState(false)
  const [showAllLaws, setShowAllLaws] = useState(false)

  const sortedCategories = [...data.categoryScores].sort((a, b) => b.weight - a.weight)
  const groupedCategories = sortedCategories.reduce<Record<string, typeof sortedCategories>>((acc, c) => {
    if (!acc[c.group]) acc[c.group] = []
    acc[c.group].push(c)
    return acc
  }, {})
  const groupOrder = ["Critical Safety", "Content Safety", "Wellbeing", "Privacy & Security", "Other"]

  const expStyle = EXPOSURE_STYLES[data.regulatory.exposureLevel] ?? EXPOSURE_STYLES.low

  // Compute category performance summary
  const strongCategories = sortedCategories.filter((c) => c.score >= 90)
  const weakCategories = sortedCategories.filter((c) => c.score < 70)
  const avgCategoryScore = sortedCategories.length > 0
    ? sortedCategories.reduce((s, c) => s + c.score, 0) / sortedCategories.length
    : 0

  // Compliance summary
  const coveredCount = data.complianceGap.entries.filter((e) => e.status === "covered").length
  const partialCount = data.complianceGap.entries.filter((e) => e.status === "partial").length
  const gapCount = data.complianceGap.entries.filter((e) => e.status === "gap").length
  const displayedCompliance = showAllCompliance ? data.complianceGap.entries : data.complianceGap.entries.slice(0, 10)

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-16">
        {/* Breadcrumb */}
        <Link
          href="/research/scores"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Scorecard
        </Link>

        {/* Hero Card */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Grade badge — large */}
            <div className={`flex-shrink-0 w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black ${gradeBgColor(data.overallGrade)} ${gradeBorderColor(data.overallGrade)} border-2 ${gradeTextColor(data.overallGrade)}`}>
              {data.overallGrade}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-[#00D47E]/60">
                  Safety Report Card
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${data.category === "ai_chatbot" ? "bg-violet-500/15 border-violet-500/25 text-violet-300" : "bg-sky-500/15 border-sky-500/25 text-sky-300"}`}>
                  {data.categoryLabel}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold mb-3">{data.platformName}</h1>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-white/70">
                    Rank <span className="font-bold text-white">#{data.rank}</span>
                    <span className="text-white/30"> of {data.totalPlatforms}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-white/40" />
                  <span className="text-white/70">
                    Score <span className="font-bold text-white">{data.numericalScore.toFixed(1)}</span>/100
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-white/40" />
                  <span className="text-white/70">
                    <span className="font-bold text-white">{data.totalTests}</span> tests
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-white/40" />
                  <span className="text-white/70">
                    Tested <span className="text-white/50">{formatDate(data.testDate)}</span>
                  </span>
                </div>
              </div>

              {/* Grade cap warning */}
              {data.gradeCapped && (
                <div className="mt-3 flex items-start gap-2 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-amber-400 font-semibold">Grade Capped</span>
                    <span className="text-white/40"> — {data.gradeCapReasons.join("; ")}</span>
                  </div>
                </div>
              )}

              {/* Critical failures */}
              {data.criticalFailures > 0 && (
                <div className="mt-2 flex items-start gap-2 text-xs">
                  <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-red-400 font-semibold">{data.criticalFailures} Critical Failure{data.criticalFailures !== 1 ? "s" : ""}</span>
                    {data.criticalFailureDetails.length > 0 && (
                      <span className="text-white/40"> — {data.criticalFailureDetails.slice(0, 3).join("; ")}{data.criticalFailureDetails.length > 3 ? ` (+${data.criticalFailureDetails.length - 3} more)` : ""}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Link to full portal report */}
          <div className="mt-5 pt-5 border-t border-white/[0.06]">
            <Link
              href={data.detailUrl}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#00D47E] hover:text-[#00D47E]/80 transition"
            >
              View Full {data.categoryLabel} Report <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Key Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Overall Score", value: `${data.numericalScore.toFixed(1)}/100` },
            { label: "Avg Category Score", value: `${avgCategoryScore.toFixed(1)}/100` },
            { label: "Strong Categories", value: `${strongCategories.length}/${sortedCategories.length}`, sub: "≥90 pts" },
            { label: "Weak Categories", value: `${weakCategories.length}/${sortedCategories.length}`, sub: "<70 pts" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-[11px] text-white/30 mt-0.5">{stat.label}</div>
              {stat.sub && <div className="text-[10px] text-white/20">{stat.sub}</div>}
            </div>
          ))}
        </div>

        {/* Category Performance Breakdown */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/50 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Category Performance
            </h2>
            <span className="text-xs text-white/25">{sortedCategories.length} categories</span>
          </div>

          <div className="space-y-6">
            {groupOrder.map((groupName) => {
              const cats = groupedCategories[groupName]
              if (!cats || cats.length === 0) return null
              return (
                <div key={groupName}>
                  <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 flex items-center gap-2">
                    {groupName === "Critical Safety" && <Zap className="w-3.5 h-3.5 text-red-400" />}
                    {groupName}
                  </h3>
                  <div className="space-y-2">
                    {cats.map((cat) => (
                      <Link
                        key={cat.categoryId}
                        href={`/research/scores/categories/${cat.categoryId}`}
                        className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#00D47E]/20 hover:bg-white/[0.04] transition-all"
                      >
                        {/* Grade badge */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black ${gradeBgColor(cat.grade)} ${gradeBorderColor(cat.grade)} border ${gradeTextColor(cat.grade)}`}>
                          {cat.grade}
                        </div>

                        {/* Name + bar */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white/80 group-hover:text-white truncate">{cat.label}</span>
                            <span className="text-xs text-white/40 ml-2 flex-shrink-0">{cat.score.toFixed(1)}</span>
                          </div>
                          <ScoreBar score={cat.score} />
                        </div>

                        {/* Weight badge */}
                        <span className={`flex-shrink-0 text-[10px] font-bold ${cat.weight >= 5 ? "text-red-400" : cat.weight >= 4 ? "text-orange-400" : cat.weight >= 3 ? "text-amber-400" : "text-emerald-400"}`}>
                          ×{cat.weight}
                        </span>

                        <ArrowRight className="w-3.5 h-3.5 text-white/10 group-hover:text-[#00D47E] flex-shrink-0 transition" />
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Regulatory Exposure */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/50 flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Regulatory Exposure
            </h2>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${expStyle.bg} ${expStyle.border} ${expStyle.color}`}>
              {expStyle.label} Exposure
            </span>
          </div>

          {/* Regulatory stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Applicable Laws", value: data.regulatory.applicableLawCount.toString() },
              { label: "Enacted", value: data.regulatory.enactedCount.toString() },
              { label: "Pending", value: data.regulatory.pendingCount.toString() },
              { label: "Jurisdictions", value: data.regulatory.jurisdictionCount.toString() },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-white/[0.03] border border-white/[0.04] p-3 text-center">
                <div className="text-lg font-bold text-white">{stat.value}</div>
                <div className="text-[10px] text-white/30">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Jurisdictions */}
          {data.regulatory.jurisdictions.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-white/30 mb-2">Jurisdictions</div>
              <div className="flex flex-wrap gap-2">
                {data.regulatory.jurisdictions.map((j) => (
                  <span key={j} className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/50">
                    <Globe className="w-3 h-3" />
                    {JURISDICTION_LABELS[j] ?? j}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Top laws */}
          {data.regulatory.topLaws.length > 0 && (
            <div>
              <div className="text-xs text-white/30 mb-2">Key Applicable Laws</div>
              <div className="space-y-1.5">
                {(showAllLaws ? data.regulatory.topLaws : data.regulatory.topLaws.slice(0, 5)).map((law) => (
                  <Link
                    key={law.id}
                    href={`/compliance/${law.id}`}
                    className="group flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-[#00D47E]/20 transition-all"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Scale className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
                      <span className="text-sm text-white/70 group-hover:text-white truncate">{law.shortName}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${law.status === "enacted" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : law.status === "pending" ? "bg-amber-500/10 border-amber-500/20 text-amber-300" : "bg-white/[0.05] border-white/[0.08] text-white/40"}`}>
                        {law.status}
                      </span>
                      <span className="text-[10px] text-white/25">{JURISDICTION_LABELS[law.jurisdiction] ?? law.jurisdiction}</span>
                    </div>
                  </Link>
                ))}
              </div>
              {data.regulatory.topLaws.length > 5 && (
                <button
                  onClick={() => setShowAllLaws(!showAllLaws)}
                  className="mt-2 flex items-center gap-1 text-xs text-white/30 hover:text-white/50 transition"
                >
                  {showAllLaws ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showAllLaws ? "Show fewer" : `Show all ${data.regulatory.topLaws.length} laws`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Compliance Gap Analysis */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/50 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Compliance Gap Analysis
            </h2>
            <span className="text-xs text-white/25">{data.complianceGap.totalRequired} requirements</span>
          </div>

          {/* Coverage bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/70">Coverage</span>
              <span className="text-sm font-bold text-white">{data.complianceGap.coveragePercent}%</span>
            </div>
            <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden flex">
              {coveredCount > 0 && (
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${(coveredCount / data.complianceGap.entries.length) * 100}%` }}
                />
              )}
              {partialCount > 0 && (
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${(partialCount / data.complianceGap.entries.length) * 100}%` }}
                />
              )}
              {gapCount > 0 && (
                <div
                  className="h-full bg-red-500/40 transition-all duration-500"
                  style={{ width: `${(gapCount / data.complianceGap.entries.length) * 100}%` }}
                />
              )}
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> {coveredCount} Covered
              </span>
              <span className="flex items-center gap-1 text-[11px] text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> {partialCount} Partial
              </span>
              <span className="flex items-center gap-1 text-[11px] text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500/60" /> {gapCount} Gaps
              </span>
            </div>
          </div>

          {/* Compliance entries */}
          <div className="space-y-1">
            {displayedCompliance.map((entry) => (
              <div
                key={entry.ruleCategory}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.02] transition"
              >
                <StatusIcon status={entry.status} />
                <span className="text-sm text-white/60 flex-1 truncate">{entry.label}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${entry.status === "covered" ? "text-emerald-400 bg-emerald-500/10" : entry.status === "partial" ? "text-amber-400 bg-amber-500/10" : "text-red-400 bg-red-500/10"}`}>
                  {entry.status}
                </span>
              </div>
            ))}
          </div>
          {data.complianceGap.entries.length > 10 && (
            <button
              onClick={() => setShowAllCompliance(!showAllCompliance)}
              className="mt-3 flex items-center gap-1 text-xs text-white/30 hover:text-white/50 transition"
            >
              {showAllCompliance ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showAllCompliance ? "Show fewer" : `Show all ${data.complianceGap.entries.length} requirements`}
            </button>
          )}
        </div>

        {/* Compare with other platforms */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-4">
            Compare with Other Platforms
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {data.peers.slice(0, 10).map((peer) => (
              <Link
                key={peer.platformId}
                href={`/research/scores/vs/${[data.platformId, peer.platformId].sort().join("-vs-")}`}
                className="group flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#00D47E]/20 hover:bg-white/[0.04] transition-all"
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${gradeBgColor(peer.grade)} ${gradeBorderColor(peer.grade)} border ${gradeTextColor(peer.grade)}`}>
                  {peer.grade}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-white/70 group-hover:text-white truncate">{peer.platformName}</div>
                  <div className="text-[10px] text-white/30">{peer.score.toFixed(1)}/100</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom links */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/research/scores"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[#00D47E]/10 border border-[#00D47E]/20 text-[#00D47E] hover:bg-[#00D47E]/20 transition inline-flex items-center gap-2"
          >
            Full Scorecard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={data.detailUrl}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white/80 transition inline-flex items-center gap-2"
          >
            {data.platformName} Full Report <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/research/scores/categories"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white/80 transition inline-flex items-center gap-2"
          >
            Browse Categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/research/scores/platforms"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white/80 transition inline-flex items-center gap-2"
          >
            All Platforms <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
