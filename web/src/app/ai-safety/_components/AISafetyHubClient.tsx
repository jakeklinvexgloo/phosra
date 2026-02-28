"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Shield,
  UserCheck,
  Lock,
  MessageSquare,
  Heart,
  BookOpen,
  Database,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Zap,
  AlertTriangle,
  Download,
} from "lucide-react"
import { AnimatedSection, WaveTexture, PhosraBurst } from "@/components/marketing/shared"
import { SearchBar } from "./SearchBar"
import { buildSearchItems } from "@/lib/platform-research/search-index"
import type { SafetyCategoryScore } from "@/lib/platform-research/research-data-types"

// ── Types ───────────────────────────────────────────────────────────

interface PlatformSummary {
  platformId: string
  platformName: string
  overallGrade: string
  numericalScore: number
  gradeCap?: string
  gradeCapReasons?: string[]
  totalTests: number
  completedTests: number
  categoryScores: SafetyCategoryScore[]
  scoreDistribution: {
    fullBlock: number
    partialBlock: number
    softWarning: number
    compliant: number
    enthusiastic: number
  }
  hasAgeVerification: boolean
  hasParentalControls: boolean
  hasConversationControls: boolean
  hasEmotionalSafety: boolean
  hasAcademicIntegrity: boolean
  hasPrivacyData: boolean
  minimumAge: number | null
  circumventionEase: string | null
  hasParentalDashboard: boolean
  hasTimeLimits: boolean
  hasQuietHours: boolean
  gapStats: { label: string; value: number; color: string }[]
}

interface AISafetyHubClientProps {
  platforms: PlatformSummary[]
}

// ── Grade Colors ────────────────────────────────────────────────────

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "text-emerald-500"
  if (grade.startsWith("B")) return "text-blue-500"
  if (grade.startsWith("C")) return "text-amber-500"
  if (grade.startsWith("D")) return "text-orange-500"
  if (grade === "F") return "text-red-500"
  return "text-muted-foreground"
}

function gradeBg(grade: string): string {
  if (grade.startsWith("A")) return "bg-emerald-100 dark:bg-emerald-900/30"
  if (grade.startsWith("B")) return "bg-blue-100 dark:bg-blue-900/30"
  if (grade.startsWith("C")) return "bg-amber-100 dark:bg-amber-900/30"
  if (grade.startsWith("D")) return "bg-orange-100 dark:bg-orange-900/30"
  if (grade === "F") return "bg-red-100 dark:bg-red-900/30"
  return "bg-muted"
}

function scoreColor(score: number): string {
  if (score === 0) return "bg-emerald-500"
  if (score === 1) return "bg-blue-500"
  if (score === 2) return "bg-amber-500"
  if (score === 3) return "bg-orange-500"
  if (score === 4) return "bg-red-500"
  return "bg-muted"
}

function scoreBgLight(score: number): string {
  if (score < 0.5) return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200"
  if (score < 1.0) return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
  if (score < 1.5) return "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
  if (score < 2.0) return "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
  if (score < 2.5) return "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200"
  if (score < 3.0) return "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200"
  if (score < 3.5) return "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200"
  return "bg-red-200 dark:bg-red-900/60 text-red-900 dark:text-red-100"
}

// ── CSV helpers ─────────────────────────────────────────────────────

function toCSV(headers: string[], rows: string[][]): string {
  const escape = (v: string) => v.includes(",") || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v
  return [headers.map(escape).join(","), ...rows.map(r => r.map(escape).join(","))].join("\n")
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Sort Options ────────────────────────────────────────────────────

type SortOption = "grade" | "name" | "score"

// ── Main Component ──────────────────────────────────────────────────

export function AISafetyHubClient({ platforms }: AISafetyHubClientProps) {
  const [sortBy, setSortBy] = useState<SortOption>("score")
  const [showHeatmap, setShowHeatmap] = useState(true)

  const sortedPlatforms = useMemo(() => {
    const sorted = [...platforms]
    switch (sortBy) {
      case "grade":
        sorted.sort((a, b) => b.numericalScore - a.numericalScore)
        break
      case "name":
        sorted.sort((a, b) => a.platformName.localeCompare(b.platformName))
        break
      case "score":
        sorted.sort((a, b) => b.numericalScore - a.numericalScore)
        break
    }
    return sorted
  }, [platforms, sortBy])

  // Get all unique categories across all platforms
  const allCategories = useMemo(() => {
    const catMap = new Map<string, string>()
    for (const p of platforms) {
      for (const cs of p.categoryScores) {
        if (!catMap.has(cs.category)) {
          catMap.set(cs.category, cs.label)
        }
      }
    }
    return Array.from(catMap.entries()).map(([id, label]) => ({ id, label }))
  }, [platforms])

  // Search items
  const searchItems = useMemo(() => buildSearchItems(platforms), [platforms])

  function handleExportCSV() {
    const headers = ["Platform", "Overall Grade", "Score", ...allCategories.map((c) => c.label)]
    const rows = platforms.map((p) => {
      const catScoreMap = new Map(p.categoryScores.map((cs) => [cs.category, cs]))
      return [
        p.platformName,
        p.overallGrade,
        p.numericalScore.toString(),
        ...allCategories.map((c) => {
          const cs = catScoreMap.get(c.id)
          return cs ? cs.avgScore.toFixed(2) : ""
        }),
      ]
    })
    downloadCSV(toCSV(headers, rows), "ai-safety-platform-scores.csv")
  }

  // Stats
  const totalTests = platforms.length > 0 ? platforms[0].totalTests : 40
  const totalCategories = allCategories.length

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

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
          <AnimatedSection direction="up">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/[0.12] mb-6">
                <Shield className="w-3.5 h-3.5 text-brand-green" />
                <span className="text-xs text-white/60">Independent Research</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-[1.1] mb-6">
                AI Chatbot{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-300">
                  Safety Research
                </span>
              </h1>
              <p className="text-lg text-white/60 leading-relaxed max-w-2xl mb-8">
                Comprehensive, independent safety analysis of {platforms.length} major AI chatbot platforms.
                Testing across {totalCategories} harm categories with {totalTests} test prompts &mdash;
                plus deep-dive research into age verification, parental controls, privacy, and more.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="#platforms"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-green text-white font-medium text-sm hover:bg-brand-green/90 transition-colors"
                >
                  View Platform Reports
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/ai-safety/methodology"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/[0.08] text-white/80 font-medium text-sm hover:bg-white/[0.12] transition-colors border border-white/[0.12]"
                >
                  Methodology
                </Link>
              </div>

              {/* Search Bar */}
              <div className="mt-8">
                <SearchBar items={searchItems} />
              </div>
            </div>
          </AnimatedSection>

          {/* Stats Row */}
          <AnimatedSection direction="up" className="mt-14">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard value={platforms.length.toString()} label="Platforms Tested" />
              <StatCard value={totalTests.toString()} label="Test Prompts" />
              <StatCard value="7" label="Research Dimensions" />
              <StatCard value={totalCategories.toString()} label="Harm Categories" />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Safety Heatmap */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Safety Heatmap</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Average scores across {totalCategories} harm categories (lower is safer)
            </p>
          </div>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showHeatmap ? "Collapse" : "Expand"}
            {showHeatmap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showHeatmap && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/30">
                  <th className="px-3 py-2.5 text-left font-medium text-foreground sticky left-0 bg-muted/30 z-10 min-w-[120px]">
                    Platform
                  </th>
                  {allCategories.map((cat) => (
                    <th key={cat.id} className="px-2 py-2.5 text-center font-medium text-foreground min-w-[80px]">
                      <Link
                        href={`/ai-safety/categories/${cat.id}`}
                        className="hover:text-brand-green transition-colors"
                        title={cat.label}
                      >
                        {cat.label.length > 12 ? cat.label.substring(0, 12) + "..." : cat.label}
                      </Link>
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-center font-bold text-foreground min-w-[70px]">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {sortedPlatforms.map((platform) => {
                  const catScoreMap = new Map(
                    platform.categoryScores.map((cs) => [cs.category, cs])
                  )
                  return (
                    <tr key={platform.platformId} className="hover:bg-muted/20 transition-colors">
                      <td className="px-3 py-2 font-medium text-foreground sticky left-0 bg-background z-10">
                        <Link
                          href={`/ai-safety/${platform.platformId}`}
                          className="hover:text-brand-green transition-colors"
                        >
                          {platform.platformName}
                        </Link>
                      </td>
                      {allCategories.map((cat) => {
                        const cs = catScoreMap.get(cat.id)
                        if (!cs) {
                          return (
                            <td key={cat.id} className="px-2 py-2 text-center">
                              <span className="text-muted-foreground">—</span>
                            </td>
                          )
                        }
                        return (
                          <td key={cat.id} className="px-2 py-2 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${scoreBgLight(cs.avgScore)}`}
                              title={`${cs.label}: avg ${cs.avgScore} / 4.0`}
                            >
                              {cs.avgScore.toFixed(1)}
                            </span>
                          </td>
                        )
                      })}
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${gradeBg(platform.overallGrade)} ${gradeColor(platform.overallGrade)}`}>
                          {platform.overallGrade}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Research Dimensions Overview */}
      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <AnimatedSection direction="up">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">Research Dimensions</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Our research goes beyond safety testing — each platform is evaluated across 7 critical dimensions.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DimensionCard
              icon={Shield}
              title="Safety Testing"
              description={`${totalTests} prompts across ${totalCategories} harm categories with scores 0–4`}
              stat={`${platforms.filter((p) => p.completedTests > 0).length}/${platforms.length} platforms tested`}
              href="/ai-safety/dimensions/safety-testing"
              color="text-red-500"
            />
            <DimensionCard
              icon={UserCheck}
              title="Age Verification"
              description="Minimum age requirements, verification methods, circumvention ease"
              stat={`${platforms.filter((p) => p.minimumAge && p.minimumAge <= 13).length}/${platforms.length} allow users under 14`}
              href="/ai-safety/dimensions/age-verification"
              color="text-blue-500"
            />
            <DimensionCard
              icon={Lock}
              title="Parental Controls"
              description="Parent linking, visibility matrix, configurable controls, bypass risks"
              stat={`${platforms.filter((p) => p.hasParentalDashboard).length}/${platforms.length} have any parent dashboard`}
              href="/ai-safety/dimensions/parental-controls"
              color="text-purple-500"
            />
            <DimensionCard
              icon={MessageSquare}
              title="Conversation Controls"
              description="Time limits, message caps, quiet hours, break reminders"
              stat={`${platforms.filter((p) => p.hasTimeLimits).length}/${platforms.length} offer any time limits`}
              href="/ai-safety/dimensions/conversation-controls"
              color="text-teal-500"
            />
            <DimensionCard
              icon={Heart}
              title="Emotional Safety"
              description="Attachment research, retention tactics, sycophancy, AI identity disclosure"
              stat={`${platforms.filter((p) => p.hasEmotionalSafety).length}/${platforms.length} platforms analyzed`}
              href="/ai-safety/dimensions/emotional-safety"
              color="text-pink-500"
            />
            <DimensionCard
              icon={BookOpen}
              title="Academic Integrity"
              description="Homework generation, study mode, detection methods, teacher visibility"
              stat={`${platforms.filter((p) => p.hasAcademicIntegrity).length}/${platforms.length} platforms analyzed`}
              href="/ai-safety/dimensions/academic-integrity"
              color="text-indigo-500"
            />
            <DimensionCard
              icon={Database}
              title="Privacy & Data"
              description="Data collection scope, model training policies, regulatory actions, memory"
              stat={`${platforms.filter((p) => p.hasPrivacyData).length}/${platforms.length} platforms analyzed`}
              href="/ai-safety/dimensions/privacy-data"
              color="text-amber-500"
              className="sm:col-span-2 lg:col-span-1"
            />
          </div>
        </div>
      </section>

      {/* Platform Cards */}
      <section id="platforms" className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Platform Reports</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Click any platform for the full 7-dimension research report
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-xs border border-border rounded px-2 py-1 bg-background text-foreground"
              >
                <option value="score">Safety Score</option>
                <option value="name">Name</option>
              </select>
            </div>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 text-xs border border-border rounded px-2.5 py-1 bg-background text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sortedPlatforms.map((platform) => (
            <PlatformCard key={platform.platformId} platform={platform} />
          ))}
        </div>
      </section>

      {/* Phosra CTA */}
      <section className="bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <AnimatedSection direction="up">
            <div className="text-center max-w-2xl mx-auto">
              <Zap className="w-8 h-8 text-brand-green mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-display font-bold mb-4">
                Every platform has safety gaps.
                <br />
                <span className="text-brand-green">Phosra fills them.</span>
              </h2>
              <p className="text-white/60 mb-6">
                See exactly what controls each platform lacks natively and how Phosra enforces
                parental controls, time limits, content filtering, and more — across all {platforms.length} platforms.
              </p>
              <Link
                href="/ai-safety/phosra-controls"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-green text-white font-medium hover:bg-brand-green/90 transition-colors"
              >
                View Phosra Controls Matrix
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg bg-white/[0.05] border border-white/[0.08] px-4 py-3 text-center">
      <div className="text-2xl sm:text-3xl font-display font-bold text-white">{value}</div>
      <div className="text-xs text-white/50 mt-0.5">{label}</div>
    </div>
  )
}

function DimensionCard({
  icon: Icon,
  title,
  description,
  stat,
  href,
  color,
  className = "",
}: {
  icon: typeof Shield
  title: string
  description: string
  stat: string
  href: string
  color: string
  className?: string
}) {
  return (
    <Link href={href} className={`group ${className}`}>
      <div className="rounded-lg border border-border bg-card p-5 h-full hover:border-brand-green/30 hover:shadow-sm transition-all">
        <div className="flex items-center gap-2.5 mb-3">
          <Icon className={`w-5 h-5 ${color}`} />
          <h3 className="text-sm font-semibold text-foreground group-hover:text-brand-green transition-colors">
            {title}
          </h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{description}</p>
        <div className="text-[11px] font-medium text-foreground/70 bg-muted/50 rounded px-2 py-1 inline-block">
          {stat}
        </div>
      </div>
    </Link>
  )
}

function PlatformCard({ platform }: { platform: PlatformSummary }) {
  const dimensions = [
    { key: "safety", has: platform.completedTests > 0, label: "Safety" },
    { key: "age", has: platform.hasAgeVerification, label: "Age" },
    { key: "parental", has: platform.hasParentalControls, label: "Parental" },
    { key: "conversation", has: platform.hasConversationControls, label: "Conv." },
    { key: "emotional", has: platform.hasEmotionalSafety, label: "Emotional" },
    { key: "academic", has: platform.hasAcademicIntegrity, label: "Academic" },
    { key: "privacy", has: platform.hasPrivacyData, label: "Privacy" },
  ]
  const coveredDimensions = dimensions.filter((d) => d.has).length

  return (
    <Link href={`/ai-safety/${platform.platformId}`} className="group">
      <div className="rounded-lg border border-border bg-card p-5 h-full hover:border-brand-green/30 hover:shadow-sm transition-all">
        {/* Header: Name + Grade */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-semibold text-foreground group-hover:text-brand-green transition-colors">
            {platform.platformName}
          </h3>
          <div className={`flex flex-col items-center px-3 py-1.5 rounded-lg ${gradeBg(platform.overallGrade)}`}>
            <span className={`text-xl font-bold ${gradeColor(platform.overallGrade)}`}>
              {platform.overallGrade}
            </span>
            <span className="text-[9px] text-muted-foreground">{platform.numericalScore}/100</span>
          </div>
        </div>

        {/* Grade cap warning */}
        {platform.gradeCap && (
          <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 mb-3">
            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
            <span>Grade capped at {platform.gradeCap}</span>
          </div>
        )}

        {/* Score Distribution Mini Bar */}
        <div className="flex h-2 rounded-full overflow-hidden mb-3">
          {platform.scoreDistribution.fullBlock > 0 && (
            <div
              className="bg-emerald-500"
              style={{ width: `${(platform.scoreDistribution.fullBlock / platform.completedTests) * 100}%` }}
              title={`${platform.scoreDistribution.fullBlock} full blocks`}
            />
          )}
          {platform.scoreDistribution.partialBlock > 0 && (
            <div
              className="bg-blue-500"
              style={{ width: `${(platform.scoreDistribution.partialBlock / platform.completedTests) * 100}%` }}
              title={`${platform.scoreDistribution.partialBlock} partial blocks`}
            />
          )}
          {platform.scoreDistribution.softWarning > 0 && (
            <div
              className="bg-amber-500"
              style={{ width: `${(platform.scoreDistribution.softWarning / platform.completedTests) * 100}%` }}
              title={`${platform.scoreDistribution.softWarning} soft warnings`}
            />
          )}
          {platform.scoreDistribution.compliant > 0 && (
            <div
              className="bg-orange-500"
              style={{ width: `${(platform.scoreDistribution.compliant / platform.completedTests) * 100}%` }}
              title={`${platform.scoreDistribution.compliant} compliant`}
            />
          )}
          {platform.scoreDistribution.enthusiastic > 0 && (
            <div
              className="bg-red-500"
              style={{ width: `${(platform.scoreDistribution.enthusiastic / platform.completedTests) * 100}%` }}
              title={`${platform.scoreDistribution.enthusiastic} enthusiastic`}
            />
          )}
        </div>

        {/* Dimension badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {dimensions.map((dim) => (
            <span
              key={dim.key}
              className={`inline-block text-[9px] px-1.5 py-0.5 rounded ${
                dim.has
                  ? "bg-brand-green/10 text-brand-green font-medium"
                  : "bg-muted text-muted-foreground/50"
              }`}
            >
              {dim.label}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-[10px] text-muted-foreground">
            {coveredDimensions}/7 dimensions
          </span>
          <span className="text-[10px] text-brand-green font-medium group-hover:underline flex items-center gap-1">
            Full Report <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}
