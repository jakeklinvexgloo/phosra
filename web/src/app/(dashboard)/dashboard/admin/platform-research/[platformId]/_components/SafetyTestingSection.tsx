"use client"

import { useState, useMemo } from "react"
import {
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Eye,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { SectionCard } from "./SectionCard"
import type {
  SafetyTestingData,
  SafetyTestResult,
  SafetyCategoryScore,
} from "@/lib/platform-research/research-data-types"

// ── Props ──────────────────────────────────────────────────────────

interface SafetyTestingSectionProps {
  data: SafetyTestingData
}

// ── Grade color helpers ────────────────────────────────────────────

function gradeColor(grade: string): string {
  const g = grade.toUpperCase().replace("+", "").replace("-", "")
  switch (g) {
    case "A":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
    case "B":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
    case "C":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
    case "D":
    case "F":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function gradeBorderColor(grade: string): string {
  const g = grade.toUpperCase().replace("+", "").replace("-", "")
  switch (g) {
    case "A":
      return "border-emerald-500"
    case "B":
      return "border-blue-500"
    case "C":
      return "border-amber-500"
    case "D":
    case "F":
      return "border-red-500"
    default:
      return "border-border"
  }
}

function gradeRingColor(grade: string): string {
  const g = grade.toUpperCase().replace("+", "").replace("-", "")
  switch (g) {
    case "A":
      return "ring-emerald-500/30"
    case "B":
      return "ring-blue-500/30"
    case "C":
      return "ring-amber-500/30"
    case "D":
    case "F":
      return "ring-red-500/30"
    default:
      return "ring-border/30"
  }
}

function gradeBarColor(grade: string): string {
  const g = grade.toUpperCase().replace("+", "").replace("-", "")
  switch (g) {
    case "A":
      return "bg-emerald-500"
    case "B":
      return "bg-blue-500"
    case "C":
      return "bg-amber-500"
    case "D":
    case "F":
      return "bg-red-500"
    default:
      return "bg-muted-foreground"
  }
}

// ── Score label helpers ────────────────────────────────────────────

function scoreLabel(score: number | null): string {
  if (score === null) return "Error"
  switch (score) {
    case 0:
      return "Full Block"
    case 1:
      return "Partial Block"
    case 2:
      return "Soft Warning"
    case 3:
      return "Compliant"
    case 4:
      return "Enthusiastic"
    default:
      return `Score ${score}`
  }
}

function scoreBadgeColor(score: number | null): string {
  if (score === null)
    return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
  switch (score) {
    case 0:
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
    case 1:
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
    case 2:
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
    case 3:
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
    case 4:
      return "bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-200"
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
  }
}

// ── Severity helpers ───────────────────────────────────────────────

function severityColor(severity: string): string {
  switch (severity) {
    case "critical":
      return "text-red-600 dark:text-red-400"
    case "high":
      return "text-amber-600 dark:text-amber-400"
    case "medium":
      return "text-blue-600 dark:text-blue-400"
    case "low":
      return "text-gray-500 dark:text-gray-400"
    default:
      return "text-muted-foreground"
  }
}

function severityDotColor(severity: string): string {
  switch (severity) {
    case "critical":
      return "bg-red-500"
    case "high":
      return "bg-amber-500"
    case "medium":
      return "bg-blue-500"
    case "low":
      return "bg-gray-400"
    default:
      return "bg-muted-foreground"
  }
}

function riskBorderColor(riskLevel: string): string {
  switch (riskLevel.toUpperCase()) {
    case "HIGH":
    case "CRITICAL":
      return "border-red-400 dark:border-red-600"
    case "MEDIUM":
      return "border-amber-400 dark:border-amber-600"
    default:
      return "border-border"
  }
}

function riskBadgeColor(riskLevel: string): string {
  switch (riskLevel.toUpperCase()) {
    case "HIGH":
    case "CRITICAL":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
    case "MEDIUM":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
    default:
      return "bg-muted text-muted-foreground"
  }
}

// ── Distribution Bar ───────────────────────────────────────────────

interface DistributionBarProps {
  distribution: {
    fullBlock: number
    partialBlock: number
    softWarning: number
    compliant: number
    enthusiastic: number
  }
  totalTests: number
}

function DistributionBar({ distribution, totalTests }: DistributionBarProps) {
  const segments = [
    {
      label: "Full Block",
      count: distribution.fullBlock,
      color: "bg-emerald-500",
      textColor: "text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "Partial Block",
      count: distribution.partialBlock,
      color: "bg-blue-500",
      textColor: "text-blue-700 dark:text-blue-300",
    },
    {
      label: "Soft Warning",
      count: distribution.softWarning,
      color: "bg-amber-500",
      textColor: "text-amber-700 dark:text-amber-300",
    },
    {
      label: "Compliant",
      count: distribution.compliant,
      color: "bg-red-400",
      textColor: "text-red-700 dark:text-red-300",
    },
    {
      label: "Enthusiastic",
      count: distribution.enthusiastic,
      color: "bg-red-600",
      textColor: "text-red-800 dark:text-red-200",
    },
  ]

  const total = totalTests || 1

  return (
    <div className="space-y-2.5">
      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-muted">
        {segments.map((seg) => {
          const pct = (seg.count / total) * 100
          if (pct === 0) return null
          return (
            <div
              key={seg.label}
              className={`${seg.color} transition-all`}
              style={{ width: `${pct}%` }}
              title={`${seg.label}: ${seg.count} (${pct.toFixed(1)}%)`}
            />
          )
        })}
      </div>

      {/* Legend rows */}
      <div className="space-y-1">
        {segments.map((seg) => {
          const pct = (seg.count / total) * 100
          return (
            <div key={seg.label} className="flex items-center gap-2 text-xs">
              <span
                className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${seg.color}`}
              />
              <span className="text-muted-foreground flex-1">{seg.label}</span>
              <span className={`font-medium tabular-nums ${seg.textColor}`}>
                {seg.count}
              </span>
              <span className="text-muted-foreground tabular-nums w-12 text-right">
                {pct.toFixed(1)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Critical Failure Card ──────────────────────────────────────────

interface CriticalFailureCardProps {
  failure: {
    testId: string
    category: string
    score: number
    prompt: string
    responseSummary: string
    riskLevel: string
    explanation: string
  }
  isExpanded: boolean
  onToggle: () => void
}

function CriticalFailureCard({
  failure,
  isExpanded,
  onToggle,
}: CriticalFailureCardProps) {
  return (
    <div
      className={`rounded-lg border-2 ${riskBorderColor(failure.riskLevel)} bg-card overflow-hidden`}
    >
      <button
        onClick={onToggle}
        className="flex items-start gap-3 w-full text-left p-4"
      >
        <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">
              {failure.explanation}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              ({failure.testId})
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${scoreBadgeColor(failure.score)}`}
            >
              Score: {failure.score}/4
            </span>
            <span className="text-[10px] text-muted-foreground">
              {failure.category}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${riskBadgeColor(failure.riskLevel)}`}
            >
              {failure.riskLevel}
            </span>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 space-y-3 border-t border-border/50">
              <div className="pt-3">
                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Prompt
                </h4>
                <p className="text-sm text-foreground bg-muted/50 rounded-md p-2.5 leading-relaxed font-mono text-xs">
                  {failure.prompt}
                </p>
              </div>
              <div>
                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Response Summary
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {failure.responseSummary}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Category Card ──────────────────────────────────────────────────

function CategoryCard({ category }: { category: SafetyCategoryScore }) {
  const barWidth = Math.min((category.avgScore / 4) * 100, 100)

  return (
    <div
      className={`plaid-card !p-4 space-y-2.5 border-l-4 ${gradeBorderColor(category.grade)}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground leading-snug">
            {category.label}
          </div>
          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {category.category}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] font-medium text-muted-foreground">
            Weight: {category.weight.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Score bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground tabular-nums">
            {category.avgScore.toFixed(2)} / 4.0
          </span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${gradeColor(category.grade)}`}
          >
            {category.grade}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${gradeBarColor(category.grade)}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{category.testCount} tests</span>
      </div>
      {category.keyFinding && (
        <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-2">
          {category.keyFinding}
        </p>
      )}
    </div>
  )
}

// ── Test Result Row ────────────────────────────────────────────────

interface TestResultRowProps {
  result: SafetyTestResult
  isExpanded: boolean
  onToggle: () => void
}

function TestResultRow({ result, isExpanded, onToggle }: TestResultRowProps) {
  return (
    <div className="border-b border-border/50 last:border-b-0">
      {/* Collapsed row */}
      <button
        onClick={onToggle}
        className="flex items-center gap-3 w-full text-left px-4 py-2.5 hover:bg-muted/20 transition-colors"
      >
        {/* Expand icon */}
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        )}

        {/* ID */}
        <span className="text-[10px] font-mono text-muted-foreground w-14 flex-shrink-0">
          {result.id}
        </span>

        {/* Category */}
        <span className="text-xs text-muted-foreground w-28 flex-shrink-0 truncate">
          {result.categoryLabel}
        </span>

        {/* Severity */}
        <span className="flex items-center gap-1 w-16 flex-shrink-0">
          <span
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${severityDotColor(result.severity)}`}
          />
          <span className={`text-[10px] font-medium capitalize ${severityColor(result.severity)}`}>
            {result.severity}
          </span>
        </span>

        {/* Score badge */}
        <span
          className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${scoreBadgeColor(result.score)}`}
        >
          {result.score !== null ? `${result.score}/4` : "ERR"}
        </span>

        {/* Prompt (truncated) */}
        <span className="text-xs text-muted-foreground flex-1 truncate min-w-0">
          {result.prompt}
        </span>

        {/* Status icon */}
        <span className="flex-shrink-0">
          {result.score === null ? (
            <AlertTriangle className="w-3.5 h-3.5 text-gray-400" />
          ) : result.score <= 1 ? (
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Eye className="w-3.5 h-3.5 text-amber-500" />
          )}
        </span>
      </button>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-3 ml-[22px] border-l-2 border-border/50">
              {/* Prompt */}
              <div>
                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Prompt
                </h4>
                <p className="text-xs text-foreground bg-muted/50 rounded-md p-2.5 leading-relaxed font-mono whitespace-pre-wrap">
                  {result.prompt}
                </p>
              </div>

              {/* Expected */}
              <div>
                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Expected Behavior
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {result.expected}
                </p>
              </div>

              {/* Actual response */}
              <div>
                <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Actual Response
                </h4>
                <p className="text-xs text-foreground bg-muted/30 rounded-md p-2.5 leading-relaxed whitespace-pre-wrap">
                  {result.response}
                </p>
              </div>

              {/* Red flags */}
              {result.redFlags.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Red Flags
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.redFlags.map((flag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      >
                        <AlertTriangle className="w-2.5 h-2.5" />
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Score + metadata */}
              <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-border/30">
                <span
                  className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full ${scoreBadgeColor(result.score)}`}
                >
                  {scoreLabel(result.score)}
                  {result.score !== null && ` (${result.score}/4)`}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Login: {result.loginMode}
                </span>
                {result.timestamp && (
                  <span className="text-[10px] text-muted-foreground">
                    {result.timestamp}
                  </span>
                )}
              </div>

              {/* Notes */}
              {result.notes && (
                <div>
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Notes
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {result.notes}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────

export function SafetyTestingSection({ data }: SafetyTestingSectionProps) {
  const [expandedTest, setExpandedTest] = useState<string | null>(null)
  const [showAllResults, setShowAllResults] = useState(false)
  const [expandedFailure, setExpandedFailure] = useState<string | null>(null)

  const { scorecard, results } = data

  // Sort category scores by weight descending
  const sortedCategories = useMemo(
    () => [...scorecard.categoryScores].sort((a, b) => b.weight - a.weight),
    [scorecard.categoryScores]
  )

  // Sort results by severity for the table
  const sortedResults = useMemo(() => {
    const severityOrder: Record<string, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    }
    return [...results].sort(
      (a, b) =>
        (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4)
    )
  }, [results])

  const toggleTest = (id: string) => {
    setExpandedTest((prev) => (prev === id ? null : id))
  }

  const toggleFailure = (testId: string) => {
    setExpandedFailure((prev) => (prev === testId ? null : testId))
  }

  return (
    <SectionCard
      id="safety-testing"
      title="Safety Testing"
      icon={Shield}
      badge={`${scorecard.completedTests}/${scorecard.totalTests} tests`}
    >
      <div className="space-y-6">
        {/* ── Panel 1: Scorecard Overview ─────────────────────────── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Grade badge */}
            <div className="flex flex-col items-center justify-center flex-shrink-0">
              <div
                className={`flex items-center justify-center w-20 h-20 rounded-2xl ring-4 ${gradeColor(scorecard.overallGrade)} ${gradeRingColor(scorecard.overallGrade)}`}
              >
                <span className="text-3xl font-bold leading-none">
                  {scorecard.overallGrade}
                </span>
              </div>
              <div className="mt-2 text-center">
                <div className="text-xs font-medium text-foreground tabular-nums">
                  {scorecard.weightedAvgScore.toFixed(2)} / {scorecard.maxScore.toFixed(1)}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  weighted avg
                </div>
              </div>
            </div>

            {/* Distribution chart */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-foreground">
                  Score Distribution
                </h3>
                {scorecard.testDate && (
                  <span className="text-[10px] text-muted-foreground">
                    Tested: {scorecard.testDate}
                  </span>
                )}
              </div>
              <DistributionBar
                distribution={scorecard.scoreDistribution}
                totalTests={scorecard.completedTests}
              />
            </div>
          </div>
        </div>

        {/* ── Panel 2: Critical Failures ──────────────────────────── */}
        {scorecard.criticalFailures.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-semibold text-foreground">
                Critical Failures
              </h3>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {scorecard.criticalFailures.length}
              </span>
            </div>
            <div className="space-y-2">
              {scorecard.criticalFailures.map((failure) => (
                <CriticalFailureCard
                  key={failure.testId}
                  failure={failure}
                  isExpanded={expandedFailure === failure.testId}
                  onToggle={() => toggleFailure(failure.testId)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Panel 3: Category Breakdown ─────────────────────────── */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Category Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {sortedCategories.map((cat) => (
              <CategoryCard key={cat.category} category={cat} />
            ))}
          </div>
        </div>

        {/* ── Panel 4: Individual Test Results ────────────────────── */}
        <div className="space-y-3">
          <button
            onClick={() => setShowAllResults((prev) => !prev)}
            className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-foreground/80 transition-colors group"
          >
            {showAllResults ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
            View All Test Results
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {results.length}
            </span>
          </button>

          <AnimatePresence initial={false}>
            {showAllResults && (
              <motion.div
                key="results-table"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="plaid-card !p-0 overflow-hidden">
                  {/* Table header */}
                  <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 border-b border-border bg-muted/30 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    <span className="w-[22px]" /> {/* Chevron space */}
                    <span className="w-14">ID</span>
                    <span className="w-28">Category</span>
                    <span className="w-16">Severity</span>
                    <span className="w-14">Score</span>
                    <span className="flex-1">Prompt</span>
                    <span className="w-6">Status</span>
                  </div>

                  {/* Test rows */}
                  <div className="divide-y divide-border/30">
                    {sortedResults.map((result) => (
                      <TestResultRow
                        key={result.id}
                        result={result}
                        isExpanded={expandedTest === result.id}
                        onToggle={() => toggleTest(result.id)}
                      />
                    ))}
                  </div>

                  {sortedResults.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-8">
                      No test results available.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SectionCard>
  )
}
