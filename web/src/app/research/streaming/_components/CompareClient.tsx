"use client"

import { useState } from "react"
import Link from "next/link"
import { gradeTextColor, gradeBgColor, gradeBorderColor } from "@/lib/shared/grade-colors"
import type { StreamingTestCategory } from "@/lib/streaming-research/streaming-data-types"

// ── Types ──────────────────────────────────────────────────────────

interface CompareTest {
  testId: string
  category: string
  score: number | null
  label: string
}

interface CompareProfile {
  profileId: string
  overallGrade: string
  gradeCap?: string
  tests: CompareTest[]
}

interface ComparePlatform {
  platformId: string
  platformName: string
  overallGrade: string
  profiles: CompareProfile[]
}

type ProfileMode = "overall" | "TestChild7" | "TestChild12" | "TestTeen16"

const PROFILE_OPTIONS: { value: ProfileMode; label: string }[] = [
  { value: "overall", label: "Overall" },
  { value: "TestChild7", label: "Child (7)" },
  { value: "TestChild12", label: "Child (12)" },
  { value: "TestTeen16", label: "Teen (16)" },
]

// ── Score cell colors ──────────────────────────────────────────────

function scoreBgLight(score: number | null): string {
  if (score === null || score === undefined) return "bg-muted/40 text-muted-foreground"
  if (score === 0) return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200"
  if (score === 1) return "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
  if (score === 2) return "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200"
  if (score === 3) return "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200"
  return "bg-red-200 dark:bg-red-900/60 text-red-900 dark:text-red-100"
}

function scoreLabel(score: number | null): string {
  if (score === null) return "N/A"
  const labels: Record<number, string> = {
    0: "Full Block",
    1: "Partial",
    2: "Soft Barrier",
    3: "Unprotected",
    4: "Facilitated",
  }
  return labels[score] ?? String(score)
}

// ── Component ──────────────────────────────────────────────────────

interface CompareClientProps {
  platforms: ComparePlatform[]
  categories: StreamingTestCategory[]
}

export function CompareClient({ platforms, categories }: CompareClientProps) {
  const [mode, setMode] = useState<ProfileMode>("overall")

  /** Find a test by exact ID or category prefix (Netflix uses SD-01/SD-02/SD-03 per profile) */
  function findTest(tests: CompareTest[], categoryId: string): CompareTest | undefined {
    const exact = tests.find((t) => t.testId === categoryId)
    if (exact) return exact
    const prefix = categoryId.replace(/-\d+$/, "")
    return tests.find((t) => t.testId.startsWith(prefix + "-"))
  }

  /** Get the score for a platform + category in the current mode */
  function getScore(platform: ComparePlatform, categoryId: string): number | null {
    if (mode === "overall") {
      // Worst score across all profiles for this category
      let worst: number | null = null
      for (const profile of platform.profiles) {
        const test = findTest(profile.tests, categoryId)
        if (test && test.score !== null) {
          if (worst === null || test.score > worst) worst = test.score
        }
      }
      return worst
    }

    const profile = platform.profiles.find((p) => p.profileId === mode)
    if (!profile) return null
    const test = findTest(profile.tests, categoryId)
    return test?.score ?? null
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
          Compare Streaming Platforms
        </h1>
        <p className="mt-2 text-muted-foreground">
          Side-by-side comparison of parental control effectiveness across {platforms.length}{" "}
          streaming platforms and 9 test categories.
        </p>
      </div>

      {/* Profile selector */}
      <div className="mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground mr-1">View as:</span>
          {PROFILE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMode(opt.value)}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                mode === opt.value
                  ? "border-brand-green bg-brand-green/10 text-brand-green font-medium"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {mode === "overall"
            ? "Showing worst score across all profiles for each category."
            : `Showing scores for the ${PROFILE_OPTIONS.find((o) => o.value === mode)?.label} profile.`}
        </p>
      </div>

      {/* Comparison matrix */}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground sticky left-0 bg-muted/30 z-10 min-w-[180px]">
                Category
              </th>
              {platforms.map((p) => (
                <th key={p.platformId} className="text-center px-4 py-3 min-w-[140px]">
                  <Link
                    href={`/research/streaming/${p.platformId}`}
                    className="hover:underline"
                  >
                    <span className="font-medium text-foreground">{p.platformName}</span>
                  </Link>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${gradeBgColor(p.overallGrade)} ${gradeTextColor(p.overallGrade)} ${gradeBorderColor(p.overallGrade)} border`}
                    >
                      {p.overallGrade}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, idx) => (
              <tr
                key={cat.id}
                className={`border-b border-border/50 ${idx % 2 === 0 ? "" : "bg-muted/10"}`}
              >
                <td className="px-4 py-3 sticky left-0 bg-background z-10">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground text-xs">{cat.shortLabel}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                      w{cat.weight}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                    {cat.description}
                  </p>
                </td>
                {platforms.map((platform) => {
                  const score = getScore(platform, cat.id)
                  return (
                    <td key={platform.platformId} className="px-4 py-3 text-center">
                      <div
                        className={`inline-flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md ${scoreBgLight(score)}`}
                      >
                        <span className="text-lg font-bold">
                          {score === null ? "—" : score}
                        </span>
                        <span className="text-[10px] opacity-80">
                          {scoreLabel(score)}
                        </span>
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
        <span className="font-medium">Score key:</span>
        {[
          { score: 0, label: "Full Block", color: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200" },
          { score: 1, label: "Partial Block", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" },
          { score: 2, label: "Soft Barrier", color: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200" },
          { score: 3, label: "Unprotected", color: "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200" },
          { score: 4, label: "Facilitated", color: "bg-red-200 dark:bg-red-900/60 text-red-900 dark:text-red-100" },
        ].map((item) => (
          <span key={item.score} className={`px-2 py-1 rounded ${item.color}`}>
            {item.score} = {item.label}
          </span>
        ))}
      </div>

      {/* Note about scoring */}
      <p className="mt-4 text-xs text-muted-foreground">
        Lower scores are better. 0 means the platform fully blocks the attack vector.
        4 means the platform actively facilitates access to restricted content.
        Overall mode shows the worst score across all three test profiles (Child 7, Child 12, Teen 16).
      </p>
    </div>
  )
}
