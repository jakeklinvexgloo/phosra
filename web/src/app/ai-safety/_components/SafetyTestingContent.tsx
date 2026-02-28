"use client"

import { useState } from "react"
import {
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import type { SafetyTestingData, SafetyTestResult } from "@/lib/platform-research/research-data-types"

function gradeColor(grade: string): string {
  const g = grade.toUpperCase().replace("+", "").replace("-", "")
  switch (g) {
    case "A": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
    case "B": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
    case "C": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
    case "D": case "F": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    default: return "bg-muted text-muted-foreground"
  }
}

function scoreBarColor(score: number): string {
  switch (score) {
    case 0: return "bg-emerald-500"
    case 1: return "bg-blue-500"
    case 2: return "bg-amber-500"
    case 3: return "bg-orange-500"
    case 4: return "bg-red-500"
    default: return "bg-muted"
  }
}

function scoreLabel(score: number): string {
  switch (score) {
    case 0: return "Full Block"
    case 1: return "Partial Block"
    case 2: return "Soft Warning"
    case 3: return "Compliant"
    case 4: return "Enthusiastic"
    default: return "Unknown"
  }
}

export function SafetyTestingContent({ data }: { data: SafetyTestingData }) {
  const { scorecard, results } = data
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Score Distribution Bar */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">Score Distribution</h3>
        <div className="flex h-6 rounded-lg overflow-hidden border border-border">
          {[0, 1, 2, 3, 4].map((score) => {
            const count = score === 0 ? scorecard.scoreDistribution.fullBlock
              : score === 1 ? scorecard.scoreDistribution.partialBlock
              : score === 2 ? scorecard.scoreDistribution.softWarning
              : score === 3 ? scorecard.scoreDistribution.compliant
              : scorecard.scoreDistribution.enthusiastic
            if (count === 0) return null
            const pct = (count / scorecard.completedTests) * 100
            return (
              <div
                key={score}
                className={`${scoreBarColor(score)} flex items-center justify-center text-[10px] font-medium text-white`}
                style={{ width: `${pct}%` }}
                title={`${scoreLabel(score)}: ${count}`}
              >
                {pct >= 8 && count}
              </div>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-3 text-[10px]">
          {[
            { label: "Full Block", color: "bg-emerald-500", count: scorecard.scoreDistribution.fullBlock },
            { label: "Partial Block", color: "bg-blue-500", count: scorecard.scoreDistribution.partialBlock },
            { label: "Soft Warning", color: "bg-amber-500", count: scorecard.scoreDistribution.softWarning },
            { label: "Compliant", color: "bg-orange-500", count: scorecard.scoreDistribution.compliant },
            { label: "Enthusiastic", color: "bg-red-500", count: scorecard.scoreDistribution.enthusiastic },
          ].map((item) => (
            <span key={item.label} className="flex items-center gap-1 text-muted-foreground">
              <span className={`w-2 h-2 rounded-full ${item.color}`} />
              {item.label} ({item.count})
            </span>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">Category Breakdown</h3>
        <div className="space-y-1.5">
          {scorecard.categoryScores.map((cat) => (
            <div key={cat.category} className="space-y-1">
              <button
                onClick={() => setExpandedCategory(expandedCategory === cat.category ? null : cat.category)}
                className="flex items-center gap-2 w-full text-left group"
              >
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${gradeColor(cat.grade)}`}>
                  {cat.grade}
                </span>
                <span className="text-sm text-foreground flex-1">{cat.label}</span>
                <span className="text-[10px] text-muted-foreground">
                  avg {cat.avgScore.toFixed(1)} / 4.0
                </span>
                <span className="text-[10px] text-muted-foreground">({cat.testCount} tests)</span>
                <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform ${expandedCategory === cat.category ? "rotate-90" : ""}`} />
              </button>

              <AnimatePresence>
                {expandedCategory === cat.category && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-4 py-2 space-y-2 border-l-2 border-border ml-4">
                      {results
                        .filter((r) => r.category === cat.category && r.score !== null)
                        .map((r) => (
                          <div key={r.id} className="text-xs space-y-1">
                            <div className="flex items-start gap-2">
                              <span className={`inline-block w-5 h-5 rounded text-center text-[10px] font-bold leading-5 flex-shrink-0 ${scoreBarColor(r.score!)} text-white`}>
                                {r.score}
                              </span>
                              <p className="text-muted-foreground">{r.prompt}</p>
                            </div>
                            {r.notes && (
                              <p className="text-[10px] text-muted-foreground/70 ml-7">{r.notes}</p>
                            )}
                          </div>
                        ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Failures */}
      {scorecard.criticalFailures.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Critical Failures
          </h3>
          <div className="space-y-2">
            {scorecard.criticalFailures.map((f) => (
              <div key={f.testId} className="rounded-lg border border-border bg-red-50/50 dark:bg-red-900/10 p-3 text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${scoreBarColor(f.score)} text-white`}>
                    {f.score}
                  </span>
                  <span className="font-medium text-foreground">{f.category}</span>
                  <span className={`text-[10px] font-medium ${f.riskLevel === "HIGH" ? "text-red-600" : "text-amber-600"}`}>
                    {f.riskLevel}
                  </span>
                </div>
                <p className="text-muted-foreground">{f.prompt}</p>
                {f.explanation && (
                  <p className="text-muted-foreground/70 mt-1">{f.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grade Cap Info */}
      {scorecard.gradeCap && scorecard.gradeCapReasons && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10 p-3">
          <h4 className="text-xs font-medium text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Grade Cap Applied: {scorecard.gradeCap}
          </h4>
          <ul className="text-[10px] text-amber-700 dark:text-amber-400 space-y-0.5">
            {scorecard.gradeCapReasons.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
