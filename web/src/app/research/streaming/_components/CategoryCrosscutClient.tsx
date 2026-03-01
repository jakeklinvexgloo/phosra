"use client"

import Link from "next/link"
import {
  gradeTextColor,
  gradeBgColor,
  gradeBorderColor,
} from "@/lib/shared/grade-colors"
import type { StreamingTestCategory } from "@/lib/streaming-research/streaming-data-types"

// ── Types ──────────────────────────────────────────────────────────

interface CategoryTestResult {
  testId: string
  score: number | null
  label: string
  description: string
}

interface CategoryProfileData {
  profileId: string
  profileLabel: string
  overallGrade: string
  gradeCap?: string
  test: CategoryTestResult | null
}

interface CategoryPlatformData {
  platformId: string
  platformName: string
  overallGrade: string
  profiles: CategoryProfileData[]
}

interface CategoryCrosscutClientProps {
  category: StreamingTestCategory
  platforms: CategoryPlatformData[]
}

// ── Score display helpers ──────────────────────────────────────────

function scoreBgLight(score: number | null): string {
  if (score === null || score === undefined) return "bg-muted/40 text-muted-foreground"
  if (score === 0) return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200"
  if (score === 1) return "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
  if (score === 2) return "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200"
  if (score === 3) return "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200"
  return "bg-red-200 dark:bg-red-900/60 text-red-900 dark:text-red-100"
}

function scoreLabelText(score: number | null): string {
  if (score === null) return "N/A"
  const labels: Record<number, string> = {
    0: "Full Block",
    1: "Partial Block",
    2: "Soft Barrier",
    3: "Unprotected",
    4: "Facilitated",
  }
  return labels[score] ?? String(score)
}

function weightColor(weight: number): string {
  if (weight >= 5) return "bg-red-500/20 text-red-400 border-red-500/30"
  if (weight >= 4) return "bg-orange-500/20 text-orange-400 border-orange-500/30"
  if (weight >= 3) return "bg-amber-500/20 text-amber-400 border-amber-500/30"
  return "bg-blue-500/20 text-blue-400 border-blue-500/30"
}

// ── Component ──────────────────────────────────────────────────────

export function CategoryCrosscutClient({
  category,
  platforms,
}: CategoryCrosscutClientProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      {/* Back link */}
      <Link
        href="/research/streaming/categories"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-flex items-center gap-1"
      >
        <span aria-hidden>&larr;</span> All Categories
      </Link>

      {/* Header */}
      <div className="mb-8 mt-4">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
            {category.category}
          </h1>
          <span
            className={`text-xs px-2 py-1 rounded border font-medium ${weightColor(category.weight)}`}
          >
            Weight {category.weight}
          </span>
        </div>
        <p className="text-muted-foreground">
          {category.description}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Test ID: <span className="font-mono">{category.id}</span> &middot;{" "}
          <Link
            href="/research/streaming/methodology"
            className="underline hover:text-foreground transition-colors"
          >
            Learn how scoring works
          </Link>
        </p>
      </div>

      {/* Platform cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {platforms.map((platform) => {
          // Compute worst score across profiles for this category
          let worstScore: number | null = null
          for (const p of platform.profiles) {
            if (p.test && p.test.score !== null) {
              if (worstScore === null || p.test.score > worstScore)
                worstScore = p.test.score
            }
          }

          return (
            <div
              key={platform.platformId}
              className="border border-border bg-card rounded-lg overflow-hidden"
            >
              {/* Card header */}
              <div className="px-5 py-4 border-b border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/research/streaming/${platform.platformId}`}
                    className="font-semibold text-foreground hover:text-brand-green transition-colors"
                  >
                    {platform.platformName}
                  </Link>
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-bold rounded border ${gradeBgColor(platform.overallGrade)} ${gradeTextColor(platform.overallGrade)} ${gradeBorderColor(platform.overallGrade)}`}
                  >
                    {platform.overallGrade}
                  </span>
                </div>
                {/* Worst score for this category */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Category score:</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${scoreBgLight(worstScore)}`}
                  >
                    {worstScore === null ? "N/A" : worstScore} &mdash;{" "}
                    {scoreLabelText(worstScore)}
                  </span>
                </div>
              </div>

              {/* Per-profile breakdown */}
              <div className="divide-y divide-border/50">
                {platform.profiles.map((profile) => (
                  <div key={profile.profileId} className="px-5 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {profile.profileLabel}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${gradeBgColor(profile.overallGrade)} ${gradeTextColor(profile.overallGrade)} ${gradeBorderColor(profile.overallGrade)}`}
                        >
                          {profile.overallGrade}
                          {profile.gradeCap ? ` (capped)` : ""}
                        </span>
                      </div>
                      {profile.test && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${scoreBgLight(profile.test.score)}`}
                        >
                          {profile.test.score === null ? "N/A" : profile.test.score}
                        </span>
                      )}
                    </div>
                    {profile.test ? (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {profile.test.description}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Not tested for this profile.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Score legend */}
      <div className="mt-8 flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
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

      <p className="mt-4 text-xs text-muted-foreground">
        Lower scores are better. 0 means the platform fully blocks the attack vector.
        The category score shown on each card is the worst (highest) score across all profiles.
      </p>
    </div>
  )
}
