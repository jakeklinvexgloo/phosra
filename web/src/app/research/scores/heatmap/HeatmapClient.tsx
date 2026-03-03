"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Grid3X3,
  Filter,
} from "lucide-react"
import {
  gradeTextColor,
  gradeBgColor,
  gradeBorderColor,
  gradeHexColor,
} from "@/lib/shared/grade-colors"
import type { HeatmapPlatform, HeatmapCell, HeatmapCategory } from "./page"

type PortalFilter = "all" | "ai_chatbot" | "streaming"
type CellDisplay = "grade" | "score"

interface HeatmapClientProps {
  platforms: HeatmapPlatform[]
  categories: HeatmapCategory[]
  cells: HeatmapCell[]
}

function scoreToColor(score: number): string {
  if (score >= 90) return "rgba(52, 211, 153, 0.25)"
  if (score >= 80) return "rgba(96, 165, 250, 0.2)"
  if (score >= 70) return "rgba(251, 191, 36, 0.15)"
  if (score >= 60) return "rgba(251, 146, 60, 0.15)"
  return "rgba(248, 113, 113, 0.15)"
}

function scoreToBorderColor(score: number): string {
  if (score >= 90) return "rgba(52, 211, 153, 0.35)"
  if (score >= 80) return "rgba(96, 165, 250, 0.3)"
  if (score >= 70) return "rgba(251, 191, 36, 0.25)"
  if (score >= 60) return "rgba(251, 146, 60, 0.25)"
  return "rgba(248, 113, 113, 0.25)"
}

export function HeatmapClient({ platforms, categories, cells }: HeatmapClientProps) {
  const [portalFilter, setPortalFilter] = useState<PortalFilter>("all")
  const [cellDisplay, setCellDisplay] = useState<CellDisplay>("grade")
  const [hoveredCell, setHoveredCell] = useState<{ platformId: string; categoryId: string } | null>(null)

  // Build cell lookup
  const cellMap = useMemo(() => {
    const map = new Map<string, HeatmapCell>()
    for (const c of cells) {
      map.set(`${c.platformId}::${c.categoryId}`, c)
    }
    return map
  }, [cells])

  // Filter platforms and categories based on portal filter
  const filteredPlatforms = useMemo(() => {
    if (portalFilter === "all") return platforms
    return platforms.filter((p) => p.category === portalFilter)
  }, [platforms, portalFilter])

  const filteredCategories = useMemo(() => {
    if (portalFilter === "all") return categories
    return categories.filter((c) => c.portal === portalFilter)
  }, [categories, portalFilter])

  // Group categories by group
  const groupOrder = ["Critical Safety", "Content Safety", "Wellbeing", "Privacy & Security", "Other"]
  const groupedCategories = useMemo(() => {
    const grouped: { group: string; cats: HeatmapCategory[] }[] = []
    for (const g of groupOrder) {
      const cats = filteredCategories.filter((c) => c.group === g)
      if (cats.length > 0) grouped.push({ group: g, cats })
    }
    return grouped
  }, [filteredCategories])

  const flatCategories = groupedCategories.flatMap((g) => g.cats)

  // Compute column averages for the summary row
  const categoryAverages = useMemo(() => {
    const avgs = new Map<string, number>()
    for (const cat of flatCategories) {
      const scores = filteredPlatforms
        .map((p) => cellMap.get(`${p.platformId}::${cat.id}`))
        .filter((c): c is HeatmapCell => !!c)
        .map((c) => c.score)
      if (scores.length > 0) {
        avgs.set(cat.id, scores.reduce((a, b) => a + b, 0) / scores.length)
      }
    }
    return avgs
  }, [flatCategories, filteredPlatforms, cellMap])

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      <div className="max-w-[1400px] mx-auto px-4 pt-8 pb-16">
        {/* Breadcrumb */}
        <Link
          href="/research/scores"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Scorecard
        </Link>

        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <Grid3X3 className="w-6 h-6 text-[#00D47E] flex-shrink-0 mt-1" />
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#00D47E]/60 block mb-1">
              Platform Safety Scorecard
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Performance Heatmap</h1>
            <p className="text-sm text-white/50 max-w-2xl">
              Color-coded matrix of {platforms.length} platforms × {categories.length} safety categories.
              Darker green = safer. Red = critical weakness. Click any cell for details.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-white/30" />
            {(["all", "ai_chatbot", "streaming"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setPortalFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  portalFilter === f
                    ? "bg-[#00D47E]/20 text-[#00D47E] border border-[#00D47E]/30"
                    : "bg-white/[0.04] text-white/40 border border-white/[0.06] hover:text-white/60"
                }`}
              >
                {f === "all" ? "All" : f === "ai_chatbot" ? "AI Chatbots" : "Streaming"}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-1">
            {(["grade", "score"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setCellDisplay(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  cellDisplay === d
                    ? "bg-white/[0.12] text-white border border-white/[0.15]"
                    : "bg-white/[0.04] text-white/40 border border-white/[0.06] hover:text-white/60"
                }`}
              >
                {d === "grade" ? "Grades" : "Scores"}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="ml-auto flex items-center gap-2 text-[10px] text-white/30">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ background: "rgba(52, 211, 153, 0.25)", border: "1px solid rgba(52, 211, 153, 0.35)" }} /> 90+
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ background: "rgba(96, 165, 250, 0.2)", border: "1px solid rgba(96, 165, 250, 0.3)" }} /> 80–89
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ background: "rgba(251, 191, 36, 0.15)", border: "1px solid rgba(251, 191, 36, 0.25)" }} /> 70–79
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ background: "rgba(251, 146, 60, 0.15)", border: "1px solid rgba(251, 146, 60, 0.25)" }} /> 60–69
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ background: "rgba(248, 113, 113, 0.15)", border: "1px solid rgba(248, 113, 113, 0.25)" }} /> &lt;60
            </span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr>
                  {/* Platform column header */}
                  <th className="sticky left-0 z-20 bg-[#0D1B2A] p-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/30 border-b border-white/[0.06] min-w-[140px]">
                    Platform
                  </th>
                  {/* Category group headers */}
                  {groupedCategories.map((g) => (
                    <th
                      key={g.group}
                      colSpan={g.cats.length}
                      className="p-2 text-center text-[10px] font-bold uppercase tracking-wider text-white/20 border-b border-white/[0.06] border-l border-white/[0.04]"
                    >
                      {g.group}
                    </th>
                  ))}
                  <th className="p-2 text-center text-[10px] font-bold uppercase tracking-wider text-white/20 border-b border-white/[0.06] border-l border-white/[0.04] min-w-[60px]">
                    Overall
                  </th>
                </tr>
                <tr>
                  <th className="sticky left-0 z-20 bg-[#0D1B2A] p-2 border-b border-white/[0.08]" />
                  {flatCategories.map((cat) => (
                    <th
                      key={cat.id}
                      className="p-1.5 text-center border-b border-white/[0.08] border-l border-white/[0.04] min-w-[60px]"
                    >
                      <Link
                        href={`/research/scores/categories/${cat.id}`}
                        className="text-[10px] text-white/40 hover:text-[#00D47E] transition leading-tight block"
                        title={cat.label}
                      >
                        {cat.shortLabel}
                        <span className={`block text-[9px] mt-0.5 ${cat.weight >= 5 ? "text-red-400/50" : cat.weight >= 4 ? "text-orange-400/50" : "text-white/15"}`}>
                          ×{cat.weight}
                        </span>
                      </Link>
                    </th>
                  ))}
                  <th className="p-1.5 text-center border-b border-white/[0.08] border-l border-white/[0.04]">
                    <span className="text-[10px] text-white/40">Grade</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPlatforms.map((platform, idx) => (
                  <tr
                    key={platform.platformId}
                    className={idx % 2 === 0 ? "bg-white/[0.01]" : ""}
                  >
                    {/* Platform name (sticky) */}
                    <td className={`sticky left-0 z-10 p-2.5 border-b border-white/[0.04] ${idx % 2 === 0 ? "bg-[#0e1d2f]" : "bg-[#0D1B2A]"}`}>
                      <Link
                        href={`/research/scores/platforms/${platform.platformId}`}
                        className="flex items-center gap-2 group"
                      >
                        <span className="text-xs font-bold text-white/30 w-5 text-right">
                          {platform.rank}
                        </span>
                        <span className="text-sm font-medium text-white/70 group-hover:text-[#00D47E] transition truncate">
                          {platform.platformName}
                        </span>
                      </Link>
                    </td>

                    {/* Category cells */}
                    {flatCategories.map((cat) => {
                      const cell = cellMap.get(`${platform.platformId}::${cat.id}`)
                      const isHovered = hoveredCell?.platformId === platform.platformId && hoveredCell?.categoryId === cat.id

                      if (!cell) {
                        return (
                          <td
                            key={cat.id}
                            className="p-1 text-center border-b border-white/[0.04] border-l border-white/[0.04]"
                          >
                            <span className="text-[10px] text-white/10">—</span>
                          </td>
                        )
                      }

                      return (
                        <td
                          key={cat.id}
                          className="p-1 text-center border-b border-white/[0.04] border-l border-white/[0.04]"
                          onMouseEnter={() => setHoveredCell({ platformId: platform.platformId, categoryId: cat.id })}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          <Link
                            href={`/research/scores/categories/${cat.id}`}
                            className="block rounded-md p-1.5 transition-all"
                            style={{
                              background: scoreToColor(cell.score),
                              border: `1px solid ${isHovered ? gradeHexColor(cell.grade) : scoreToBorderColor(cell.score)}`,
                              transform: isHovered ? "scale(1.1)" : "scale(1)",
                            }}
                            title={`${platform.platformName} — ${cat.label}: ${cell.grade} (${cell.score.toFixed(1)})`}
                          >
                            <span className={`text-xs font-bold ${gradeTextColor(cell.grade)}`}>
                              {cellDisplay === "grade" ? cell.grade : cell.score.toFixed(0)}
                            </span>
                          </Link>
                        </td>
                      )
                    })}

                    {/* Overall grade */}
                    <td className="p-1 text-center border-b border-white/[0.04] border-l border-white/[0.06]">
                      <Link
                        href={`/research/scores/platforms/${platform.platformId}`}
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-xs font-black ${gradeBgColor(platform.overallGrade)} ${gradeBorderColor(platform.overallGrade)} border ${gradeTextColor(platform.overallGrade)}`}
                      >
                        {platform.overallGrade}
                      </Link>
                    </td>
                  </tr>
                ))}

                {/* Average row */}
                <tr className="bg-white/[0.03]">
                  <td className="sticky left-0 z-10 p-2.5 bg-[#101f33] border-t border-white/[0.08]">
                    <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Avg</span>
                  </td>
                  {flatCategories.map((cat) => {
                    const avg = categoryAverages.get(cat.id)
                    if (!avg) {
                      return (
                        <td key={cat.id} className="p-1 text-center border-t border-white/[0.08] border-l border-white/[0.04]">
                          <span className="text-[10px] text-white/10">—</span>
                        </td>
                      )
                    }
                    return (
                      <td key={cat.id} className="p-1 text-center border-t border-white/[0.08] border-l border-white/[0.04]">
                        <span className="text-[11px] font-bold text-white/40">
                          {avg.toFixed(0)}
                        </span>
                      </td>
                    )
                  })}
                  <td className="p-1 text-center border-t border-white/[0.08] border-l border-white/[0.06]" />
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights */}
        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          {(() => {
            // Compute insights
            const bestCell = cells.reduce((best, c) => c.score > best.score ? c : best, cells[0])
            const worstCell = cells.reduce((worst, c) => c.score < worst.score ? c : worst, cells[0])
            const bestPlatform = platforms.find((p) => p.platformId === bestCell?.platformId)
            const worstPlatform = platforms.find((p) => p.platformId === worstCell?.platformId)
            const bestCat = categories.find((c) => c.id === bestCell?.categoryId)
            const worstCat = categories.find((c) => c.id === worstCell?.categoryId)

            // Most consistent platform (lowest std dev)
            const platformStdDevs = platforms.map((p) => {
              const pCells = cells.filter((c) => c.platformId === p.platformId)
              if (pCells.length < 2) return { platform: p, stdDev: 999 }
              const avg = pCells.reduce((s, c) => s + c.score, 0) / pCells.length
              const variance = pCells.reduce((s, c) => s + (c.score - avg) ** 2, 0) / pCells.length
              return { platform: p, stdDev: Math.sqrt(variance) }
            })
            const mostConsistent = platformStdDevs.reduce((best, p) => p.stdDev < best.stdDev ? p : best, platformStdDevs[0])

            return [
              {
                label: "Highest Category Score",
                value: `${bestCell?.score.toFixed(1)}`,
                detail: `${bestPlatform?.platformName} in ${bestCat?.shortLabel}`,
                color: "text-emerald-400",
              },
              {
                label: "Lowest Category Score",
                value: `${worstCell?.score.toFixed(1)}`,
                detail: `${worstPlatform?.platformName} in ${worstCat?.shortLabel}`,
                color: "text-red-400",
              },
              {
                label: "Most Consistent",
                value: mostConsistent?.platform.platformName ?? "—",
                detail: `σ = ${mostConsistent?.stdDev.toFixed(1)} pts`,
                color: "text-blue-400",
              },
            ].map((insight) => (
              <div key={insight.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                <div className="text-[11px] text-white/30 mb-1">{insight.label}</div>
                <div className={`text-lg font-bold ${insight.color}`}>{insight.value}</div>
                <div className="text-xs text-white/40 mt-0.5">{insight.detail}</div>
              </div>
            ))
          })()}
        </div>

        {/* Bottom links */}
        <div className="flex flex-wrap gap-4 justify-center mt-10">
          <Link
            href="/research/scores"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[#00D47E]/10 border border-[#00D47E]/20 text-[#00D47E] hover:bg-[#00D47E]/20 transition inline-flex items-center gap-2"
          >
            Full Scorecard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/research/scores/categories"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white/80 transition inline-flex items-center gap-2"
          >
            Browse Categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/research/scores/methodology"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white/80 transition inline-flex items-center gap-2"
          >
            Methodology <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
