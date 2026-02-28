"use client"

import { motion } from "framer-motion"
import { X, Check } from "lucide-react"

interface ComparisonRow {
  left: string
  right: string
}

interface ComparisonCardProps {
  leftHeader: string
  rightHeader: string
  rows: ComparisonRow[]
}

export function ComparisonCard({ leftHeader, rightHeader, rows }: ComparisonCardProps) {
  return (
    <div className="my-3 rounded-lg border border-white/[0.08] bg-white/[0.03] overflow-hidden">
      {/* Headers */}
      <div className="grid grid-cols-2">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-red-400 bg-red-500/10 border-b border-white/[0.06]">
          {leftHeader}
        </div>
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border-b border-white/[0.06] border-l border-white/[0.06]">
          {rightHeader}
        </div>
      </div>
      {/* Rows */}
      {rows.map((row, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          className="grid grid-cols-2 border-b border-white/[0.04] last:border-0"
        >
          <div className="px-3 py-2 text-sm text-white/60 flex items-center gap-2">
            <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            <span>{row.left}</span>
          </div>
          <div className="px-3 py-2 text-sm text-white/80 flex items-center gap-2 border-l border-white/[0.06]">
            <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>{row.right}</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/** Parse comparison code fence: "Header1|Header2\nLeft1|Right1\n..." */
export function parseComparison(text: string): ComparisonCardProps | null {
  const lines = text.trim().split("\n").map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return null

  const [headerLine, ...rowLines] = lines
  const headers = headerLine.split("|").map(h => h.trim())
  if (headers.length !== 2) return null

  const rows: ComparisonRow[] = []
  for (const line of rowLines) {
    const parts = line.split("|").map(p => p.trim())
    if (parts.length === 2) {
      rows.push({ left: parts[0], right: parts[1] })
    }
  }

  if (rows.length === 0) return null

  return {
    leftHeader: headers[0],
    rightHeader: headers[1],
    rows,
  }
}
