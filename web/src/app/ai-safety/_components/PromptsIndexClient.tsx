"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight, Filter, Download, AlertTriangle, ArrowRight } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { ScorePopover } from "./ScorePopover"
import { SCORE_LEGEND, scoreBg, severityBadge } from "./score-utils"

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

interface ScoreEntry {
  platformId: string
  platformName: string
  score: number | null
  notes: string
  response: string
  redFlags: string[]
  isMultiTurn: boolean
  escalationTurn?: number
}

interface PromptData {
  id: string
  category: string
  categoryLabel: string
  severity: string
  prompt: string
  expected: string
  scores: ScoreEntry[]
}

export function PromptsIndexClient({
  prompts,
  platformNames,
}: {
  prompts: PromptData[]
  platformNames: { id: string; name: string }[]
}) {
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null)

  const categories = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of prompts) {
      if (!map.has(p.category)) map.set(p.category, p.categoryLabel)
    }
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }))
  }, [prompts])

  const filtered = useMemo(() => {
    if (categoryFilter === "all") return prompts
    return prompts.filter((p) => p.category === categoryFilter)
  }, [prompts, categoryFilter])

  // Top failures: worst prompt×platform combos (score 3-4)
  const topFailures = useMemo(() => {
    const failures: { promptId: string; promptText: string; platformId: string; platformName: string; score: number; severity: string; categoryLabel: string; redFlags: string[] }[] = []
    for (const p of prompts) {
      for (const s of p.scores) {
        if (s.score !== null && s.score >= 3) {
          failures.push({
            promptId: p.id,
            promptText: p.prompt,
            platformId: s.platformId,
            platformName: s.platformName,
            score: s.score,
            severity: p.severity,
            categoryLabel: p.categoryLabel,
            redFlags: s.redFlags,
          })
        }
      }
    }
    // Sort by score desc, then by severity
    const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
    failures.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4)
    })
    return failures.slice(0, 8)
  }, [prompts])

  function handleExportCSV() {
    const headers = ["Prompt", "Category", ...platformNames.map((pn) => pn.name)]
    const rows = prompts.map((prompt) => [
      prompt.prompt,
      prompt.categoryLabel,
      ...platformNames.map((pn) => {
        const entry = prompt.scores.find((s) => s.platformId === pn.id)
        return entry?.score != null ? entry.score.toString() : ""
      }),
    ])
    downloadCSV(toCSV(headers, rows), "ai-safety-test-prompts.csv")
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-display font-bold">Test Prompt Index</h1>
          <p className="text-white/50 mt-2 text-sm">
            All {prompts.length} safety test prompts with per-platform scores — hover for preview, click for full analysis
          </p>
          {/* Score legend — always visible including mobile */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-4">
            {SCORE_LEGEND.map(({ score, label, color }) => (
              <div key={score} className="flex items-center gap-1.5">
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold text-white ${color}`}>
                  {score}
                </span>
                <span className="text-[11px] text-white/60 whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Failures Section */}
      {topFailures.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 border-b border-border">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-semibold text-foreground">Top Safety Failures</h2>
            <span className="text-[11px] text-muted-foreground">
              Worst prompt × platform combinations
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {topFailures.map((f, i) => (
              <Link
                key={`${f.promptId}-${f.platformName}-${i}`}
                href={`/ai-safety/prompts/${f.promptId}?platform=${f.platformId}`}
                className={`group rounded-lg border bg-card p-3 hover:bg-red-500/5 transition-all border-l-4 ${
                  f.score >= 4 ? "border-l-red-500 border-red-500/30" : "border-l-orange-500 border-border hover:border-orange-500/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs font-bold ${scoreBg(f.score)}`}>
                    {f.score}
                  </span>
                  <span className="text-xs font-medium text-foreground">{f.platformName}</span>
                  <span className={`ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${severityBadge(f.severity)}`}>
                    {f.severity}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed group-hover:text-foreground/70 transition-colors">
                  {f.promptText}
                </p>
                {f.redFlags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {f.redFlags.slice(0, 2).map((flag, fi) => (
                      <span key={fi} className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                        {flag.length > 25 ? flag.substring(0, 25) + "..." : flag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="sticky top-[calc(3.5rem+37px)] z-30 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2 flex items-center gap-3 overflow-x-auto">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-border rounded px-2 py-1.5 bg-background text-foreground"
          >
            <option value="all">All Categories ({prompts.length})</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label} ({prompts.filter((p) => p.category === cat.id).length})
              </option>
            ))}
          </select>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {filtered.length} prompt{filtered.length !== 1 ? "s" : ""}
          </span>

          <div className="flex-1" />

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 text-xs border border-border rounded px-2.5 py-1 bg-background text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors flex-shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Prompts Table */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="relative overflow-x-auto -webkit-overflow-scrolling-touch rounded-lg border border-border">
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background/80 to-transparent z-20 sm:hidden" />
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/30">
                <th className="sticky left-0 z-10 bg-muted/30 px-3 py-2.5 text-left font-medium text-foreground min-w-[200px] sm:min-w-[250px]">Prompt</th>
                <th className="px-2 py-2.5 text-left font-medium text-foreground min-w-[100px] hidden sm:table-cell">Category</th>
                {platformNames.map((pn) => (
                  <th key={pn.id} className="px-2 py-2.5 text-center font-medium text-foreground min-w-[70px]">
                    <Link href={`/ai-safety/${pn.id}`} className="hover:text-brand-green transition-colors">
                      {pn.name.length > 10 ? pn.name.substring(0, 10) + "..." : pn.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map((prompt) => (
                <tr key={prompt.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="sticky left-0 z-10 bg-background px-3 py-2.5">
                    <button
                      onClick={() => setExpandedPrompt(expandedPrompt === prompt.id ? null : prompt.id)}
                      className="text-left text-foreground flex items-start gap-1.5"
                    >
                      <ChevronRight className={`w-3 h-3 mt-0.5 text-muted-foreground transition-transform flex-shrink-0 ${expandedPrompt === prompt.id ? "rotate-90" : ""}`} />
                      <span className="line-clamp-2">{prompt.prompt}</span>
                    </button>
                    <AnimatePresence>
                      {expandedPrompt === prompt.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 pl-5 text-[11px] text-muted-foreground space-y-1.5">
                            <p><strong>Expected:</strong> {prompt.expected}</p>
                            <p>
                              <strong>Severity:</strong>{" "}
                              <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${severityBadge(prompt.severity)}`}>
                                {prompt.severity}
                              </span>
                            </p>
                            <p className="sm:hidden"><strong>Category:</strong> {prompt.categoryLabel}</p>

                            {/* Show red flags from all platforms that have them */}
                            {(() => {
                              const allFlags = prompt.scores.flatMap((s) =>
                                s.redFlags.map((f) => ({ flag: f, platform: s.platformName }))
                              )
                              if (allFlags.length === 0) return null
                              const uniqueFlags = Array.from(new Set(allFlags.map((f) => f.flag))).slice(0, 5)
                              return (
                                <div>
                                  <strong>Red Flags:</strong>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {uniqueFlags.map((flag, i) => (
                                      <span key={i} className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                        <AlertTriangle className="w-2 h-2" />
                                        {flag.length > 35 ? flag.substring(0, 35) + "..." : flag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )
                            })()}

                            {/* Response preview from first platform that has one */}
                            {(() => {
                              const firstResponse = prompt.scores.find((s) => s.response)
                              if (!firstResponse) return null
                              return (
                                <div className="mt-1.5">
                                  <strong>Sample response ({firstResponse.platformName}):</strong>
                                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 line-clamp-2 italic">
                                    &ldquo;{firstResponse.response.substring(0, 150)}{firstResponse.response.length > 150 ? "..." : ""}&rdquo;
                                  </p>
                                </div>
                              )
                            })()}

                            <Link
                              href={`/ai-safety/prompts/${prompt.id}`}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-green hover:underline mt-1"
                            >
                              View Full Analysis
                              <ArrowRight className="w-2.5 h-2.5" />
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                  <td className="px-2 py-2.5 hidden sm:table-cell">
                    <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground whitespace-nowrap">
                      {prompt.categoryLabel}
                    </span>
                  </td>
                  {platformNames.map((pn) => {
                    const scoreEntry = prompt.scores.find((s) => s.platformId === pn.id)
                    const score = scoreEntry?.score ?? null
                    return (
                      <td key={pn.id} className="px-2 py-2.5 text-center">
                        {score !== null && scoreEntry ? (
                          <ScorePopover
                            score={score}
                            platformName={pn.name}
                            promptId={prompt.id}
                            platformId={pn.id}
                            response={scoreEntry.response}
                            notes={scoreEntry.notes}
                            redFlags={scoreEntry.redFlags}
                            isMultiTurn={scoreEntry.isMultiTurn}
                          >
                            <Link
                              href={`/ai-safety/prompts/${prompt.id}?platform=${pn.id}`}
                              className={`inline-flex items-center justify-center w-7 h-7 rounded text-[10px] font-bold leading-7 transition-transform hover:scale-125 ${scoreBg(score)}`}
                              aria-label={`${pn.name}: score ${score}`}
                            >
                              {score}
                            </Link>
                          </ScorePopover>
                        ) : (
                          <span className="text-muted-foreground/40">&mdash;</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
