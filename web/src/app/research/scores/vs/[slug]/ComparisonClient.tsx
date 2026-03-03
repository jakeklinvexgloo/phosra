"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Trophy,
  Shield,
  AlertTriangle,
  Activity,
  Scale,
  Target,
  CheckCircle2,
  XCircle,
  Circle,
  Minus,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import {
  gradeTextColor,
  gradeBgColor,
  gradeBorderColor,
} from "@/lib/shared/grade-colors"
import type { PlatformScoreEntry } from "../../page"

interface ComparisonClientProps {
  platformA: PlatformScoreEntry
  platformB: PlatformScoreEntry
  otherPlatforms: { id: string; name: string }[]
}

function gradeValue(grade: string): number {
  const map: Record<string, number> = {
    "A+": 13, A: 12, "A-": 11,
    "B+": 10, B: 9, "B-": 8,
    "C+": 7, C: 6, "C-": 5,
    "D+": 4, D: 3, "D-": 2,
    F: 1,
  }
  return map[grade] ?? 0
}

function WinnerIndicator({ winner }: { winner: "a" | "b" | "tie" }) {
  if (winner === "tie") return <Minus className="w-4 h-4 text-white/30" />
  if (winner === "a") return <TrendingUp className="w-4 h-4 text-emerald-400" />
  return <TrendingDown className="w-4 h-4 text-red-400" />
}

function MetricRow({
  label,
  valueA,
  valueB,
  winner,
  suffix,
}: {
  label: string
  valueA: string | number
  valueB: string | number
  winner: "a" | "b" | "tie"
  suffix?: string
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center py-3 border-b border-white/[0.06] last:border-0">
      <div className="text-right">
        <span className={`text-sm font-semibold ${winner === "a" ? "text-emerald-400" : winner === "b" ? "text-red-400" : "text-white/70"}`}>
          {valueA}{suffix}
        </span>
      </div>
      <div className="flex flex-col items-center gap-1 min-w-[120px]">
        <WinnerIndicator winner={winner} />
        <span className="text-[11px] text-white/40 text-center leading-tight">{label}</span>
      </div>
      <div className="text-left">
        <span className={`text-sm font-semibold ${winner === "b" ? "text-emerald-400" : winner === "a" ? "text-red-400" : "text-white/70"}`}>
          {valueB}{suffix}
        </span>
      </div>
    </div>
  )
}

function GradeCompare({ gradeA, gradeB }: { gradeA: string; gradeB: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
      <div className="flex justify-end">
        <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black ${gradeBgColor(gradeA)} ${gradeBorderColor(gradeA)} border ${gradeTextColor(gradeA)}`}>
          {gradeA}
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-bold text-white/30 uppercase tracking-widest">vs</span>
      </div>
      <div className="flex justify-start">
        <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black ${gradeBgColor(gradeB)} ${gradeBorderColor(gradeB)} border ${gradeTextColor(gradeB)}`}>
          {gradeB}
        </div>
      </div>
    </div>
  )
}

export function ComparisonClient({ platformA, platformB, otherPlatforms }: ComparisonClientProps) {
  const router = useRouter()

  const scoreWinner = platformA.numericalScore > platformB.numericalScore ? "a" : platformA.numericalScore < platformB.numericalScore ? "b" : "tie"
  const gradeWinner = gradeValue(platformA.overallGrade) > gradeValue(platformB.overallGrade) ? "a" : gradeValue(platformA.overallGrade) < gradeValue(platformB.overallGrade) ? "b" : "tie"
  const testWinner = platformA.totalTests > platformB.totalTests ? "a" : platformA.totalTests < platformB.totalTests ? "b" : "tie"
  const criticalWinner = platformA.criticalFailures < platformB.criticalFailures ? "a" : platformA.criticalFailures > platformB.criticalFailures ? "b" : "tie"
  const complianceWinner = platformA.complianceGap.coveragePercent > platformB.complianceGap.coveragePercent ? "a" : platformA.complianceGap.coveragePercent < platformB.complianceGap.coveragePercent ? "b" : "tie"
  const regulatoryWinnerRaw = platformA.regulatory.applicableLawCount > platformB.regulatory.applicableLawCount ? "a" : platformA.regulatory.applicableLawCount < platformB.regulatory.applicableLawCount ? "b" : "tie"

  // Count wins to determine overall winner
  const metrics = [scoreWinner, gradeWinner, criticalWinner, complianceWinner]
  const aWins = metrics.filter((m) => m === "a").length
  const bWins = metrics.filter((m) => m === "b").length
  const overallWinner = aWins > bWins ? "a" : bWins > aWins ? "b" : "tie"

  // Shared compliance gap categories for side-by-side
  const allCategories = useMemo(() => {
    const catMap = new Map<string, { label: string; statusA?: string; statusB?: string }>()
    for (const e of platformA.complianceGap.entries) {
      catMap.set(e.ruleCategory, { label: e.label, statusA: e.status })
    }
    for (const e of platformB.complianceGap.entries) {
      const existing = catMap.get(e.ruleCategory)
      if (existing) {
        existing.statusB = e.status
      } else {
        catMap.set(e.ruleCategory, { label: e.label, statusB: e.status })
      }
    }
    return Array.from(catMap.entries()).sort((a, b) => a[1].label.localeCompare(b[1].label))
  }, [platformA, platformB])

  function handleSwapPlatform(which: "a" | "b", newId: string) {
    const [idA, idB] = which === "a" ? [newId, platformB.platformId] : [platformA.platformId, newId]
    const slug = [idA, idB].sort().join("-vs-")
    router.push(`/research/scores/vs/${slug}`)
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        <Link
          href="/research/scores"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Scorecard
        </Link>

        <div className="text-center mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#00D47E]/60">
            Head-to-Head Safety Comparison
          </span>
        </div>

        {/* Platform names */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-8">
          <div className="text-right">
            <Link href={platformA.detailUrl} className="group">
              <h1 className="text-2xl sm:text-3xl font-bold group-hover:text-[#00D47E] transition">
                {platformA.platformName}
              </h1>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${platformA.category === "ai_chatbot" ? "bg-violet-500/15 border-violet-500/25 text-violet-300" : "bg-sky-500/15 border-sky-500/25 text-sky-300"}`}>
                {platformA.categoryLabel}
              </span>
            </Link>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
              <span className="text-sm font-bold text-white/40">VS</span>
            </div>
          </div>

          <div className="text-left">
            <Link href={platformB.detailUrl} className="group">
              <h1 className="text-2xl sm:text-3xl font-bold group-hover:text-[#00D47E] transition">
                {platformB.platformName}
              </h1>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${platformB.category === "ai_chatbot" ? "bg-violet-500/15 border-violet-500/25 text-violet-300" : "bg-sky-500/15 border-sky-500/25 text-sky-300"}`}>
                {platformB.categoryLabel}
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16 space-y-8">
        {/* Grade comparison hero */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-8">
          <GradeCompare gradeA={platformA.overallGrade} gradeB={platformB.overallGrade} />
          <div className="grid grid-cols-[1fr_auto_1fr] gap-6 mt-6">
            <div className="text-right">
              <span className="text-3xl font-bold text-white">{platformA.numericalScore.toFixed(1)}</span>
              <span className="text-sm text-white/40">/100</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-xs text-white/30">Score</span>
            </div>
            <div className="text-left">
              <span className="text-3xl font-bold text-white">{platformB.numericalScore.toFixed(1)}</span>
              <span className="text-sm text-white/40">/100</span>
            </div>
          </div>

          {/* Winner callout */}
          {overallWinner !== "tie" && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Trophy className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">
                  {overallWinner === "a" ? platformA.platformName : platformB.platformName} scores higher overall
                </span>
              </div>
            </div>
          )}
          {overallWinner === "tie" && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1]">
                <Minus className="w-4 h-4 text-white/40" />
                <span className="text-sm font-medium text-white/50">
                  These platforms are closely matched
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Key metrics comparison */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[#00D47E]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/50">Key Metrics</h2>
          </div>

          <MetricRow label="Safety Score" valueA={platformA.numericalScore.toFixed(1)} valueB={platformB.numericalScore.toFixed(1)} winner={scoreWinner} suffix="/100" />
          <MetricRow label="Safety Grade" valueA={platformA.overallGrade} valueB={platformB.overallGrade} winner={gradeWinner} />
          <MetricRow label="Critical Failures" valueA={platformA.criticalFailures} valueB={platformB.criticalFailures} winner={criticalWinner} />
          <MetricRow label="Tests Completed" valueA={platformA.totalTests} valueB={platformB.totalTests} winner={testWinner} />
          <MetricRow label="Grade Capped" valueA={platformA.gradeCapped ? "Yes" : "No"} valueB={platformB.gradeCapped ? "Yes" : "No"} winner={platformA.gradeCapped === platformB.gradeCapped ? "tie" : platformA.gradeCapped ? "b" : "a"} />
        </div>

        {/* Category breakdown */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-[#00D47E]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/50">Category Breakdown</h2>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-4">
            <div className="text-right text-xs text-white/30 font-medium">{platformA.platformName}</div>
            <div className="text-center text-xs text-white/30 font-medium">Category</div>
            <div className="text-left text-xs text-white/30 font-medium">{platformB.platformName}</div>
          </div>

          {(() => {
            // Merge categories from both platforms
            const catMapA = new Map(platformA.topCategories.map((c) => [c.name, c]))
            const catMapB = new Map(platformB.topCategories.map((c) => [c.name, c]))
            const allCatNames = Array.from(new Set([
              ...platformA.topCategories.map((c) => c.name),
              ...platformB.topCategories.map((c) => c.name),
            ]))

            return allCatNames.map((catName) => {
              const catA = catMapA.get(catName)
              const catB = catMapB.get(catName)
              const scoreA = catA?.score ?? null
              const scoreB = catB?.score ?? null
              const winner = scoreA !== null && scoreB !== null ? (scoreA > scoreB ? "a" : scoreA < scoreB ? "b" : "tie") : "tie"

              return (
                <div key={catName} className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center py-2.5 border-b border-white/[0.04] last:border-0">
                  <div className="text-right">
                    {catA ? (
                      <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${gradeTextColor(catA.grade)}`}>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${gradeBgColor(catA.grade)}`}>{catA.grade}</span>
                        {catA.score.toFixed(0)}
                      </span>
                    ) : (
                      <span className="text-sm text-white/20">—</span>
                    )}
                  </div>
                  <div className="text-center min-w-[140px]">
                    <span className="text-xs text-white/50">{catName}</span>
                  </div>
                  <div className="text-left">
                    {catB ? (
                      <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${gradeTextColor(catB.grade)}`}>
                        {catB.score.toFixed(0)}
                        <span className={`text-xs px-1.5 py-0.5 rounded ${gradeBgColor(catB.grade)}`}>{catB.grade}</span>
                      </span>
                    ) : (
                      <span className="text-sm text-white/20">—</span>
                    )}
                  </div>
                </div>
              )
            })
          })()}
        </div>

        {/* Regulatory exposure */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="w-4 h-4 text-[#00D47E]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/50">Regulatory Exposure</h2>
          </div>

          <MetricRow
            label="Applicable Laws"
            valueA={platformA.regulatory.applicableLawCount}
            valueB={platformB.regulatory.applicableLawCount}
            winner={regulatoryWinnerRaw}
          />
          <MetricRow
            label="Enacted Laws"
            valueA={platformA.regulatory.enactedCount}
            valueB={platformB.regulatory.enactedCount}
            winner={platformA.regulatory.enactedCount > platformB.regulatory.enactedCount ? "a" : platformA.regulatory.enactedCount < platformB.regulatory.enactedCount ? "b" : "tie"}
          />
          <MetricRow
            label="Pending Laws"
            valueA={platformA.regulatory.pendingCount}
            valueB={platformB.regulatory.pendingCount}
            winner={platformA.regulatory.pendingCount > platformB.regulatory.pendingCount ? "a" : platformA.regulatory.pendingCount < platformB.regulatory.pendingCount ? "b" : "tie"}
          />
          <MetricRow
            label="Jurisdictions"
            valueA={platformA.regulatory.jurisdictionCount}
            valueB={platformB.regulatory.jurisdictionCount}
            winner={platformA.regulatory.jurisdictionCount > platformB.regulatory.jurisdictionCount ? "a" : platformA.regulatory.jurisdictionCount < platformB.regulatory.jurisdictionCount ? "b" : "tie"}
          />
        </div>

        {/* Compliance gap comparison */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-[#00D47E]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/50">Compliance Coverage</h2>
          </div>

          <MetricRow
            label="Coverage"
            valueA={`${platformA.complianceGap.coveragePercent}%`}
            valueB={`${platformB.complianceGap.coveragePercent}%`}
            winner={complianceWinner}
          />
          <MetricRow
            label="Categories Covered"
            valueA={platformA.complianceGap.totalCovered}
            valueB={platformB.complianceGap.totalCovered}
            winner={platformA.complianceGap.totalCovered > platformB.complianceGap.totalCovered ? "a" : platformA.complianceGap.totalCovered < platformB.complianceGap.totalCovered ? "b" : "tie"}
          />
          <MetricRow
            label="Gaps Found"
            valueA={platformA.complianceGap.totalGaps}
            valueB={platformB.complianceGap.totalGaps}
            winner={platformA.complianceGap.totalGaps < platformB.complianceGap.totalGaps ? "a" : platformA.complianceGap.totalGaps > platformB.complianceGap.totalGaps ? "b" : "tie"}
          />

          {/* Category-by-category compliance status */}
          {allCategories.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Category-by-Category</h3>
              <div className="space-y-1">
                {allCategories.map(([cat, { label, statusA, statusB }]) => (
                  <div key={cat} className="grid grid-cols-[auto_1fr_auto] gap-3 items-center py-1.5">
                    <div className="flex justify-end w-6">
                      {statusA === "covered" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : statusA === "partial" ? <Circle className="w-4 h-4 text-amber-400" /> : statusA === "gap" ? <XCircle className="w-4 h-4 text-red-400" /> : <Minus className="w-3.5 h-3.5 text-white/15" />}
                    </div>
                    <span className="text-xs text-white/50 text-center truncate">{label}</span>
                    <div className="flex justify-start w-6">
                      {statusB === "covered" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : statusB === "partial" ? <Circle className="w-4 h-4 text-amber-400" /> : statusB === "gap" ? <XCircle className="w-4 h-4 text-red-400" /> : <Minus className="w-3.5 h-3.5 text-white/15" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Compare with another platform */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-4">Compare Another Matchup</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/30 mb-1.5 block">Replace {platformA.platformName}</label>
              <select
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-[#00D47E]/40"
                value=""
                onChange={(e) => {
                  if (e.target.value) handleSwapPlatform("a", e.target.value)
                }}
              >
                <option value="">Select platform...</option>
                {otherPlatforms.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/30 mb-1.5 block">Replace {platformB.platformName}</label>
              <select
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-[#00D47E]/40"
                value=""
                onChange={(e) => {
                  if (e.target.value) handleSwapPlatform("b", e.target.value)
                }}
              >
                <option value="">Select platform...</option>
                {otherPlatforms.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bottom links */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href={platformA.detailUrl}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white/80 transition inline-flex items-center gap-2"
          >
            {platformA.platformName} Full Report <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={platformB.detailUrl}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white/80 transition inline-flex items-center gap-2"
          >
            {platformB.platformName} Full Report <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/research/scores/vs"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white/80 transition inline-flex items-center gap-2"
          >
            All Comparisons <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/research/scores"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[#00D47E]/10 border border-[#00D47E]/20 text-[#00D47E] hover:bg-[#00D47E]/20 transition inline-flex items-center gap-2"
          >
            View Full Scorecard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
