"use client"

import { motion } from "framer-motion"
import { gradeTextColor, gradeHexColor } from "../grade-colors"

interface ScoreGaugeProps {
  platform: string
  grade: string
  score: number
  size?: number
}

export function ScoreGauge({ platform, grade, score, size = 100 }: ScoreGaugeProps) {
  const strokeWidth = size * 0.08
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)
  const center = size / 2
  const color = gradeHexColor(grade)

  return (
    <div className="relative inline-flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
          />
        </svg>
        {/* Center text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-lg font-bold ${gradeTextColor(grade)}`}>{grade}</span>
          <span className="text-[10px] font-mono text-white/50">{score}/100</span>
        </div>
      </div>
      <span className="text-xs text-white/70 font-medium">{platform}</span>
    </div>
  )
}

/** Parse gauge code fence content: "Platform\nGrade\nScore" */
export function parseGauge(text: string): ScoreGaugeProps | null {
  const lines = text.trim().split("\n").map(l => l.trim()).filter(Boolean)
  if (lines.length < 3) return null
  const score = parseInt(lines[2])
  if (isNaN(score)) return null
  return { platform: lines[0], grade: lines[1], score }
}
