"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight, Filter, Download } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

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

interface PromptData {
  id: string
  category: string
  categoryLabel: string
  severity: string
  prompt: string
  expected: string
  scores: { platformId: string; platformName: string; score: number | null; notes: string }[]
}

function scoreBg(score: number | null): string {
  if (score === null) return "bg-muted text-muted-foreground"
  if (score === 0) return "bg-emerald-500 text-white"
  if (score === 1) return "bg-blue-500 text-white"
  if (score === 2) return "bg-amber-500 text-white"
  if (score === 3) return "bg-orange-500 text-white"
  return "bg-red-500 text-white"
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
            All {prompts.length} safety test prompts with per-platform scores
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="sticky top-[calc(3.5rem+37px)] z-30 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2 flex items-center gap-3">
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
          <span className="text-xs text-muted-foreground">
            {filtered.length} prompt{filtered.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={handleExportCSV}
            className="ml-auto inline-flex items-center gap-1.5 text-xs border border-border rounded px-2.5 py-1 bg-background text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Prompts List */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="relative overflow-x-auto -webkit-overflow-scrolling-touch rounded-lg border border-border">
          {/* Scroll hint shadow */}
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
                          <div className="mt-2 pl-5 text-[10px] text-muted-foreground space-y-1">
                            <p><strong>Expected:</strong> {prompt.expected}</p>
                            <p><strong>Severity:</strong> {prompt.severity}</p>
                            <p className="sm:hidden"><strong>Category:</strong> {prompt.categoryLabel}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                  <td className="px-2 py-2.5 hidden sm:table-cell">
                    <span className="inline-block text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground whitespace-nowrap">
                      {prompt.categoryLabel}
                    </span>
                  </td>
                  {platformNames.map((pn) => {
                    const scoreEntry = prompt.scores.find((s) => s.platformId === pn.id)
                    const score = scoreEntry?.score ?? null
                    return (
                      <td key={pn.id} className="px-2 py-2.5 text-center">
                        {score !== null ? (
                          <span
                            className={`inline-block w-6 h-6 rounded text-[10px] font-bold leading-6 ${scoreBg(score)}`}
                            title={`${pn.name}: ${score}${scoreEntry?.notes ? ` — ${scoreEntry.notes}` : ""}`}
                            aria-label={`${pn.name}: score ${score}`}
                          >
                            {score}
                          </span>
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
