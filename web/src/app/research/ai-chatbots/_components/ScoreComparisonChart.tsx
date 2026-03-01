"use client"

import { motion } from "framer-motion"
import { SCORE_LABELS, scoreBarGradient, scoreBadge } from "./score-utils"

interface ChartPlatform {
  platformId: string
  platformName: string
  score: number | null
}

export function ScoreComparisonChart({
  results,
  focusedPlatformId,
  onSelectPlatform,
}: {
  results: ChartPlatform[]
  focusedPlatformId: string | undefined
  onSelectPlatform: (id: string) => void
}) {
  const sorted = [...results]
    .filter((r) => r.score !== null)
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))

  return (
    <div className="space-y-1">
      {sorted.map((r, i) => {
        const score = r.score ?? 0
        // Map score to width: 0 → 12%, 4 → 100%
        const widthPercent = Math.max(12, ((score + 0.5) / 4.5) * 100)
        const isFocused = r.platformId === focusedPlatformId

        return (
          <motion.button
            key={r.platformId}
            onClick={() => onSelectPlatform(r.platformId)}
            className={`
              group w-full flex items-center gap-3 py-1.5 rounded-lg px-2
              transition-colors duration-150
              ${isFocused ? "bg-muted/40" : "hover:bg-muted/20"}
            `}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
          >
            {/* Platform name — fixed width column */}
            <span className={`
              w-28 text-right text-xs font-medium truncate flex-shrink-0
              ${isFocused ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/70"}
              transition-colors
            `}>
              {r.platformName}
            </span>

            {/* Bar track */}
            <div className="flex-1 h-7 rounded-md bg-muted/20 relative overflow-hidden">
              {/* Filled bar */}
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-md ${scoreBarGradient(score)}`}
                initial={{ width: 0 }}
                animate={{ width: `${widthPercent}%` }}
                transition={{
                  delay: i * 0.04 + 0.15,
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              />
              {/* Score + label overlaid on bar */}
              <div className="absolute inset-y-0 left-2.5 flex items-center gap-2">
                <span className="text-[11px] font-bold text-white/90 drop-shadow-sm tabular-nums">
                  {score}
                </span>
                <span className="text-[10px] text-white/60 font-medium hidden sm:inline">
                  {SCORE_LABELS[score]}
                </span>
              </div>
            </div>

            {/* Focus indicator */}
            {isFocused && (
              <motion.div
                layoutId="bar-focus-indicator"
                className="w-1 h-5 rounded-full bg-brand-green flex-shrink-0"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
              />
            )}
            {!isFocused && <div className="w-1 flex-shrink-0" />}
          </motion.button>
        )
      })}
    </div>
  )
}

/** Compact SVG dot strip for related prompts */
export function ScoreStrip({
  scores,
  focusPlatformId,
}: {
  scores: { platformId: string; platformName: string; score: number | null }[]
  focusPlatformId?: string
}) {
  const r = 5
  const gap = 14
  const height = r * 2 + 4
  const width = scores.length * gap

  const scoreColor = (score: number | null): string => {
    if (score === null) return "hsl(0, 0%, 60%)"
    const colors: Record<number, string> = {
      0: "hsl(160, 84%, 39%)",
      1: "hsl(217, 91%, 60%)",
      2: "hsl(45, 93%, 47%)",
      3: "hsl(25, 95%, 53%)",
      4: "hsl(0, 84%, 60%)",
    }
    return colors[score] ?? "hsl(0, 84%, 60%)"
  }

  return (
    <svg width={width} height={height} className="block flex-shrink-0">
      {scores.map((s, i) => {
        const isFocused = s.platformId === focusPlatformId
        return (
          <g key={s.platformId}>
            <circle
              cx={i * gap + r + 2}
              cy={r + 2}
              r={r}
              fill={scoreColor(s.score)}
              opacity={isFocused ? 1 : 0.75}
              stroke={isFocused ? "hsl(157, 100%, 42%)" : "none"}
              strokeWidth={isFocused ? 1.5 : 0}
            />
            {s.score !== null && (
              <text
                x={i * gap + r + 2}
                y={r + 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize={7}
                fontWeight={700}
              >
                {s.score}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
