"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Shield,
  AlertTriangle,
  ArrowRight,
  Monitor,
  CheckCircle2,
  XCircle,
  Download,
} from "lucide-react"
import { AnimatedSection, WaveTexture, PhosraBurst } from "@/components/marketing/shared"
import { gradeTextColor, gradeBgColor, gradeBorderColor } from "@/lib/shared/grade-colors"
import type { StreamingPlatformSummary } from "@/lib/streaming-research/streaming-data-types"
import { STREAMING_TEST_CATEGORIES } from "@/lib/streaming-research/streaming-data-types"
import { ProfileScoreCard } from "./ProfileScoreCard"
import { StreamingSearchBar } from "./StreamingSearchBar"

// ── Types ───────────────────────────────────────────────────────────

interface StreamingHubClientProps {
  platforms: StreamingPlatformSummary[]
}

type SortOption = "grade" | "name"

// ── Profile label helpers ───────────────────────────────────────────

const PROFILE_LABELS: Record<string, string> = {
  TestChild7: "Child (7)",
  TestChild12: "Child (12)",
  TestTeen16: "Teen (16)",
}

function profileLabel(profileId: string): string {
  return PROFILE_LABELS[profileId] ?? profileId
}

// ── Grade badge ─────────────────────────────────────────────────────

function GradeBadge({ grade, isCapped }: { grade: string; isCapped?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-sm font-bold border ${gradeBgColor(grade)} ${gradeTextColor(grade)} ${gradeBorderColor(grade)}`}
    >
      {grade}
      {isCapped && <span className="text-[10px] text-orange-400">*</span>}
    </span>
  )
}

// ── Stat Card ───────────────────────────────────────────────────────

function StatCard({ value, label, warn }: { value: string; label: string; warn?: boolean }) {
  return (
    <div className={`rounded-lg px-4 py-3 text-center ${warn ? "bg-red-500/10 border border-red-500/20" : "bg-white/[0.05] border border-white/[0.08]"}`}>
      <div className={`text-2xl sm:text-3xl font-display font-bold ${warn ? "text-red-400" : "text-white"}`}>{value}</div>
      <div className="text-xs text-white/50 mt-0.5">{label}</div>
    </div>
  )
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

// ── Main Component ──────────────────────────────────────────────────

export function StreamingHubClient({ platforms }: StreamingHubClientProps) {
  const [sortBy, setSortBy] = useState<SortOption>("grade")

  const sortedPlatforms = useMemo(() => {
    const sorted = [...platforms]
    switch (sortBy) {
      case "grade":
        sorted.sort((a, b) => a.overallScore - b.overallScore)
        break
      case "name":
        sorted.sort((a, b) => a.platformName.localeCompare(b.platformName))
        break
    }
    return sorted
  }, [platforms, sortBy])

  function handleExportCSV() {
    const profileIds = ["TestChild7", "TestChild12", "TestTeen16"]
    const headers = ["Platform", "Overall Grade", "Overall Score", ...profileIds.map(id => profileLabel(id) + " Grade"), ...profileIds.map(id => profileLabel(id) + " Score")]
    const rows = platforms.map((p) => {
      const profileMap = new Map(p.profileGrades.map((pg) => [pg.profileId, pg]))
      return [
        p.platformName,
        p.overallGrade,
        p.overallScore.toFixed(1),
        ...profileIds.map(id => profileMap.get(id)?.grade ?? ""),
        ...profileIds.map(id => {
          const pg = profileMap.get(id)
          return pg ? pg.score.toFixed(1) : ""
        }),
      ]
    })
    downloadCSV(toCSV(headers, rows), "streaming-safety-scores.csv")
  }

  // Stats
  const totalPlatforms = platforms.length
  const totalCategories = STREAMING_TEST_CATEGORIES.length
  const totalCriticalFailures = platforms.reduce((sum, p) => sum + p.criticalFailureCount, 0)

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
                <Monitor className="w-3.5 h-3.5 text-brand-green" />
                <span className="text-xs text-white/60">Research Portal</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-[1.1] mb-6">
                Streaming Content{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-300">
                  Safety
                </span>
              </h1>
              <p className="text-lg text-white/60 leading-relaxed max-w-2xl mb-8">
                Independent safety research across {totalPlatforms} streaming platforms,
                {" "}{3} user profiles, and {totalCategories} test categories.
                How well do Netflix, Peacock, and Prime Video protect children from
                age-inappropriate content?
              </p>

              {/* Search Bar */}
              <StreamingSearchBar platforms={platforms} />
            </div>
          </AnimatedSection>

          {/* Stats Row */}
          <AnimatedSection direction="up" className="mt-14">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard value={`${totalPlatforms}`} label="Platforms Tested" />
              <StatCard value={`${totalCategories}`} label="Test Categories" />
              <StatCard value={`${totalCriticalFailures}`} label="Critical Failures" warn={totalCriticalFailures > 0} />
              <StatCard value="3" label="Profiles Per Platform" />
            </div>
            <p className="text-[11px] text-white/40 mt-4 text-center">Research conducted: February 2026</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Platform Safety Matrix */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-display font-bold text-foreground mb-6">Platform Safety Matrix</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/30">
                  <th className="text-left text-xs font-medium text-foreground px-3 py-2.5">
                    Platform
                  </th>
                  <th className="text-center text-xs font-medium text-foreground px-3 py-2.5">
                    Child (7)
                  </th>
                  <th className="text-center text-xs font-medium text-foreground px-3 py-2.5">
                    Child (12)
                  </th>
                  <th className="text-center text-xs font-medium text-foreground px-3 py-2.5">
                    Teen (16)
                  </th>
                  <th className="text-center text-xs font-medium text-foreground px-3 py-2.5">
                    Overall
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedPlatforms.map((platform) => {
                  const child7 = platform.profileGrades.find(p => p.profileId === "TestChild7")
                  const child12 = platform.profileGrades.find(p => p.profileId === "TestChild12")
                  const teen16 = platform.profileGrades.find(p => p.profileId === "TestTeen16")

                  return (
                    <tr
                      key={platform.platformId}
                      className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/research/streaming/${platform.platformId}`}
                          className="text-sm font-medium text-foreground hover:text-brand-green transition-colors flex items-center gap-1.5"
                        >
                          {platform.platformName}
                          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {child7 ? (
                          <GradeBadge grade={child7.grade} isCapped={child7.isCapped} />
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {child12 ? (
                          <GradeBadge grade={child12.grade} isCapped={child12.isCapped} />
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {teen16 ? (
                          <GradeBadge grade={teen16.grade} isCapped={teen16.isCapped} />
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <GradeBadge grade={platform.overallGrade} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          <div className="px-4 py-2 bg-muted/30 border-t border-border">
            <p className="text-[10px] text-muted-foreground">
              * = grade capped due to critical failure. Click any platform to view details.
            </p>
          </div>
        </div>
      </section>

      {/* Critical Findings */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-12">
        <AnimatedSection direction="up">
          <h2 className="text-2xl font-display font-bold text-foreground mb-6">
            Critical Findings Across All Platforms
          </h2>
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  All {totalPlatforms} platforms allow zero-authentication profile switching
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  PE-01: Children can switch to adult profiles without any PIN or password verification.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Netflix /watch/ endpoint bypasses ALL maturity controls
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  DU-01: Direct URL access plays R-rated and TV-MA content on Kids profiles without restriction.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  PIN protection is inconsistent or absent
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  PL-01: Profile switching PINs are optional and often not enabled by default.
                </p>
              </div>
            </div>
            <div className="border-t border-border pt-4 mt-4 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    All platforms properly filter Kids profile search results
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    SD-01: Mature content titles do not appear in Kids profile search.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    No recommendation leakage on Kids profiles
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    RL-01: Kids profiles show only age-appropriate recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Platform Summary Cards */}
      <section id="platforms" className="max-w-7xl mx-auto px-6 lg:px-8 pb-12">
        <AnimatedSection direction="up">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">Platform Reports</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Click any platform for the full research report
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
                  <option value="grade">Grade</option>
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
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPlatforms.map((platform) => (
            <Link
              key={platform.platformId}
              href={`/research/streaming/${platform.platformId}`}
              className="group"
            >
              <div className="rounded-lg border border-border bg-card p-5 h-full hover:border-brand-green/30 hover:shadow-sm transition-all">
                {/* Header: Name + Grade */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-brand-green transition-colors">
                    {platform.platformName}
                  </h3>
                  <div className={`flex flex-col items-center px-3 py-1.5 rounded-lg ${gradeBgColor(platform.overallGrade)}`}>
                    <span className={`text-xl font-bold ${gradeTextColor(platform.overallGrade)}`}>
                      {platform.overallGrade}
                    </span>
                    <span className={`text-[10px] font-semibold ${gradeTextColor(platform.overallGrade)}`}>
                      {platform.overallScore.toFixed(0)}/100
                    </span>
                  </div>
                </div>

                {/* Grade cap warning */}
                {platform.profileGrades.some(pg => pg.isCapped) && (
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 mb-3">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    <span>Grade capped due to critical failures</span>
                  </div>
                )}

                {/* Profile grade cards */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {platform.profileGrades.map((pg) => (
                    <ProfileScoreCard
                      key={pg.profileId}
                      profileName={profileLabel(pg.profileId)}
                      grade={pg.grade}
                      score={pg.score}
                      isCapped={pg.isCapped}
                      criticalFailureCount={pg.criticalFailureCount}
                    />
                  ))}
                </div>

                {/* Critical failure count */}
                {platform.criticalFailureCount > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-red-400 mb-2">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {platform.criticalFailureCount} critical failure{platform.criticalFailureCount > 1 ? "s" : ""}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-end pt-2 border-t border-border/50">
                  <span className="text-[10px] text-brand-green font-medium group-hover:underline flex items-center gap-1">
                    View full report <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* What Parents Should Know → Dark CTA Section */}
      <section className="bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <AnimatedSection direction="up">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <Shield className="w-8 h-8 text-brand-green mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-display font-bold mb-4">
                What Parents{" "}
                <span className="text-brand-green">Should Know</span>
              </h2>
              <p className="text-white/60">
                Based on our research, here are the most important actions and takeaways
                for keeping children safe on streaming platforms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                  <Shield className="h-4 w-4 text-brand-green" />
                  Immediate Actions
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-brand-green mt-0.5 text-xs font-bold">1.</span>
                    <span className="text-sm text-white/70">Enable profile PINs on all platforms that support them to prevent
                      children from switching to unrestricted profiles.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-green mt-0.5 text-xs font-bold">2.</span>
                    <span className="text-sm text-white/70">Use dedicated Kids profiles rather than standard profiles with
                      maturity filters, as Kids profiles have stronger server-side protections.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-green mt-0.5 text-xs font-bold">3.</span>
                    <span className="text-sm text-white/70">Be aware that direct URL/deep link access can bypass maturity controls
                      on some platforms, especially when sharing links.</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                  <Shield className="h-4 w-4 text-brand-green" />
                  Key Takeaways
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-brand-green mt-0.5 text-xs font-bold">1.</span>
                    <span className="text-sm text-white/70">No streaming platform earned above a C grade overall. Content safety
                      for children remains a significant challenge across the industry.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-green mt-0.5 text-xs font-bold">2.</span>
                    <span className="text-sm text-white/70">Kids profiles (age 7) are generally safer than teen profiles, but
                      profile-switching vulnerabilities undermine these protections.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-green mt-0.5 text-xs font-bold">3.</span>
                    <span className="text-sm text-white/70">Platform protections often rely on UI-level controls rather than
                      server-side enforcement, creating exploitable gaps.</span>
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
