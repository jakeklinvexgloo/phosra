"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, AlertTriangle, Calendar, FlaskConical, ChevronRight, Info, Users } from "lucide-react"
import { gradeTextColor, gradeBgColor } from "@/lib/shared/grade-colors"
import type {
  StreamingPlatformData,
  StreamingProfileResult,
  StreamingTestResult,
} from "@/lib/streaming-research/streaming-data-types"
import { STREAMING_TEST_CATEGORIES } from "@/lib/streaming-research/streaming-data-types"
import { CriticalFailureBanner } from "./CriticalFailureBanner"
import { CategoryResultRow } from "./CategoryResultRow"

// ── Score color helpers (for the comparison grid) ────────────────────

function scoreCellColor(score: number | null): string {
  if (score === null) return "bg-muted/40 text-muted-foreground"
  if (score === 0) return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200"
  if (score === 1) return "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
  if (score === 2) return "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200"
  if (score === 3) return "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200"
  return "bg-red-200 dark:bg-red-900/60 text-red-900 dark:text-red-100"
}

// ── Profile display names ────────────────────────────────────────────

function profileDisplayName(profileId: string): string {
  if (profileId === "TestChild7") return "Child (7)"
  if (profileId === "TestChild12") return "Child (12)"
  if (profileId === "TestTeen16") return "Teen (16)"
  return profileId
}

function profileTabLabel(profileId: string): string {
  if (profileId === "TestChild7") return "Child (7)"
  if (profileId === "TestChild12") return "Child (12)"
  if (profileId === "TestTeen16") return "Teen (16)"
  return profileId
}

// ── Score distribution ───────────────────────────────────────────────

interface ScoreDistribution {
  label: string
  count: number
  color: string
}

function computeScoreDistribution(tests: StreamingTestResult[]): ScoreDistribution[] {
  const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }
  let nullCount = 0
  for (const t of tests) {
    if (t.score === null) {
      nullCount++
    } else {
      counts[t.score] = (counts[t.score] || 0) + 1
    }
  }
  const result: ScoreDistribution[] = [
    { label: "Full Block (0)", count: counts[0], color: "bg-emerald-500" },
    { label: "Partial Block (1)", count: counts[1], color: "bg-blue-500" },
    { label: "Soft Barrier (2)", count: counts[2], color: "bg-amber-500" },
    { label: "Unprotected (3)", count: counts[3], color: "bg-orange-500" },
    { label: "Facilitated (4)", count: counts[4], color: "bg-red-500" },
  ]
  if (nullCount > 0) {
    result.push({ label: "N/A", count: nullCount, color: "bg-muted" })
  }
  return result.filter((d) => d.count > 0)
}

// ── Lookup test score for profile x category ─────────────────────────

function findTestScore(profile: StreamingProfileResult, testId: string): number | null {
  // Exact match first
  const exact = profile.tests.find((t) => t.testId === testId)
  if (exact) return exact.score
  // Prefix match: SD-01 matches SD-02, SD-03 (Netflix uses different IDs per profile)
  const prefix = testId.replace(/-\d+$/, "")
  const prefixMatch = profile.tests.find((t) => t.testId.startsWith(prefix + "-"))
  return prefixMatch ? prefixMatch.score : null
}

// ── Main Component ──────────────────────────────────────────────────

interface PlatformDetailClientProps {
  data: StreamingPlatformData
}

type TabId = "summary" | string

export function PlatformDetailClient({ data }: PlatformDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("summary")

  const tabs = useMemo(() => {
    const t: { id: TabId; label: string }[] = [{ id: "summary", label: "Summary" }]
    for (const profile of data.profiles) {
      t.push({ id: profile.profileId, label: profileTabLabel(profile.profileId) })
    }
    return t
  }, [data.profiles])

  const activeProfile = useMemo(
    () => data.profiles.find((p) => p.profileId === activeTab) ?? null,
    [data.profiles, activeTab]
  )

  const completedTests = useMemo(() => {
    let count = 0
    for (const p of data.profiles) {
      count += p.tests.filter((t) => t.score !== null).length
    }
    return count
  }, [data.profiles])

  const totalTests = useMemo(() => {
    let count = 0
    for (const p of data.profiles) {
      count += p.tests.length
    }
    return count
  }, [data.profiles])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-white/40 mb-6">
            <Link
              href="/research/streaming"
              className="hover:text-white/70 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Streaming Safety
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/70">{data.platformName}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold">
                {data.platformName} Content Safety Report
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-white/50">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Tested {data.testDate}
                </span>
                {data.frameworkVersion && (
                  <span className="flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5" />
                    Framework v{data.frameworkVersion}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {completedTests}/{totalTests} tests scored
                </span>
              </div>
            </div>

            {/* Overall grade badge */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div
                className={`flex flex-col items-center px-5 py-3 rounded-xl ${gradeBgColor(data.overallGrade)}`}
              >
                <span className={`text-3xl font-bold ${gradeTextColor(data.overallGrade)}`}>
                  {data.overallGrade}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {data.overallScore.toFixed(0)}/100
                </span>
              </div>
              {data.criticalFailures.length > 0 && (
                <div className="text-sm text-white/60 space-y-1">
                  <div className="flex items-center gap-1 text-red-400 text-xs">
                    <AlertTriangle className="w-3 h-3" />
                    {data.criticalFailures.length} critical failure{data.criticalFailures.length !== 1 ? "s" : ""}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Critical Failure Banners */}
      {data.criticalFailures.length > 0 && (
        <div className="max-w-4xl mx-auto px-6 lg:px-8 -mt-4 mb-0">
          <div className="space-y-3">
            {data.criticalFailures.map((cf) => (
              <CriticalFailureBanner
                key={cf.cfoId}
                cfoId={cf.cfoId}
                description={cf.description}
                affectedProfiles={cf.affectedProfiles}
                gradeCap={cf.gradeCap}
                testId={cf.testId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab row */}
      <div className="sticky top-14 z-30 bg-background border-b border-border mt-4">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-brand-green/10 text-brand-green"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-10">
        {activeTab === "summary" ? (
          <SummaryTab data={data} />
        ) : activeProfile ? (
          <ProfileTab profile={activeProfile} platformId={data.platformId} />
        ) : null}
      </div>

      {/* Back navigation */}
      <div className="border-t border-border bg-muted/20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-6">
          <Link
            href="/research/streaming"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Platforms
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Summary Tab ─────────────────────────────────────────────────────

function SummaryTab({ data }: { data: StreamingPlatformData }) {
  return (
    <div className="space-y-8">
      {/* Cross-profile comparison grid */}
      <section>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">
          Cross-Profile Comparison
        </h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30">
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">
                    Category
                  </th>
                  {data.profiles.map((p) => (
                    <th
                      key={p.profileId}
                      className="text-center px-3 py-2 font-medium text-muted-foreground text-xs"
                    >
                      {profileDisplayName(p.profileId)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STREAMING_TEST_CATEGORIES.map((cat) => (
                  <tr key={cat.id} className="border-t border-border/50">
                    <td className="px-3 py-2 text-xs text-foreground/80">
                      <span className="font-medium">{cat.shortLabel}</span>
                      <span className="ml-1.5 text-[10px] text-muted-foreground font-mono">
                        {cat.weight}x
                      </span>
                    </td>
                    {data.profiles.map((p) => {
                      const score = findTestScore(p, cat.id)
                      return (
                        <td key={p.profileId} className="text-center px-3 py-2">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${scoreCellColor(score)}`}
                          >
                            {score === null ? "--" : score}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
                {/* Grade row */}
                <tr className="border-t-2 border-border bg-muted/20">
                  <td className="px-3 py-2 text-xs font-semibold text-foreground">
                    Overall Grade
                  </td>
                  {data.profiles.map((p) => (
                    <td key={p.profileId} className="text-center px-3 py-2">
                      <span className={`text-sm font-bold ${gradeTextColor(p.overallGrade)}`}>
                        {p.overallGrade}
                      </span>
                      {p.gradeCap && (
                        <span className="ml-0.5 text-[10px] text-orange-400">*</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {data.profiles.some((p) => p.gradeCap) && (
          <p className="text-[10px] text-muted-foreground mt-2">
            * Grade capped due to critical failure override
          </p>
        )}
      </section>

      {/* Platform notes */}
      {Object.keys(data.platformNotes).length > 0 && (
        <section>
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">
            Platform Architecture Notes
          </h2>
          <div className="grid gap-3">
            {Object.entries(data.platformNotes).map(([key, value]) => (
              <div
                key={key}
                className="rounded-lg border border-border bg-card p-4"
              >
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  {formatNoteKey(key)}
                </h3>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cross-platform comparison */}
      {data.crossPlatformComparison &&
        Object.keys(data.crossPlatformComparison).length > 0 && (
          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">
              Cross-Platform Comparison
            </h2>
            <div className="space-y-4">
              {Object.entries(data.crossPlatformComparison).map(([vsKey, comparisons]) => (
                <div
                  key={vsKey}
                  className="rounded-lg border border-border bg-card p-5"
                >
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    {formatComparisonKey(vsKey)}
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(comparisons).map(([aspect, text]) => (
                      <div key={aspect}>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                          {formatNoteKey(aspect)}
                        </h4>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
    </div>
  )
}

// ── Profile Tab ─────────────────────────────────────────────────────

function ProfileTab({ profile, platformId }: { profile: StreamingProfileResult; platformId: string }) {
  const distribution = useMemo(
    () => computeScoreDistribution(profile.tests),
    [profile.tests]
  )
  const totalScored = profile.tests.filter((t) => t.score !== null).length

  return (
    <div className="space-y-8">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div
              className={`flex flex-col items-center px-4 py-2 rounded-lg ${gradeBgColor(profile.overallGrade)}`}
            >
              <span
                className={`text-2xl font-bold ${gradeTextColor(profile.overallGrade)}`}
              >
                {profile.overallGrade}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {profile.weightedScore.toFixed(0)}/100
              </span>
            </div>
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground">
                {profileDisplayName(profile.profileId)}
              </h2>
              <p className="text-xs text-muted-foreground">
                {profile.profileType.charAt(0).toUpperCase() + profile.profileType.slice(1)} profile
                {" "}&#183;{" "}
                {profile.maturitySetting}
              </p>
            </div>
          </div>
          {profile.gradeCap && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-orange-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              Grade capped at {profile.gradeCap}
              {profile.gradeCapReasons && profile.gradeCapReasons.length > 0 && (
                <span className="text-muted-foreground">
                  ({profile.gradeCapReasons.join("; ")})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile notes */}
      {profile.notes && (
        <div className="rounded-lg border border-border/50 bg-muted/30 p-4 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/70">{profile.notes}</p>
        </div>
      )}

      {/* Score distribution */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Score Distribution ({totalScored}/{profile.tests.length} tests scored)
        </h3>
        <div className="flex flex-wrap gap-3">
          {distribution.map((d) => (
            <div
              key={d.label}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
            >
              <span className={`w-3 h-3 rounded-full ${d.color}`} />
              <span className="text-xs text-foreground/80">{d.label}</span>
              <span className="text-xs font-bold text-foreground">{d.count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Category results */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Test Results by Category
        </h3>
        <div className="space-y-2">
          {profile.tests.map((test) => (
            <CategoryResultRow key={test.testId} test={test} platformId={platformId} />
          ))}
        </div>
      </section>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────

/** Convert camelCase key to human-readable label */
function formatNoteKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/_/g, " ")
    .trim()
}

/** Format comparison key like "vs_prime_video" -> "vs. Prime Video" */
function formatComparisonKey(key: string): string {
  return key
    .replace(/^vs_/, "vs. ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (s) => s.toUpperCase())
}
