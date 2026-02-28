"use client"

import { gradeTextColor, gradeBgColor, gradeBorderColor } from "../grade-colors"

interface SafetyGradeBadgeProps {
  grade: string
  score?: number
  label?: string
  size?: "inline" | "block"
}

export function SafetyGradeBadge({ grade, score, label, size = "inline" }: SafetyGradeBadgeProps) {
  if (size === "block") {
    return (
      <div className="inline-flex items-center gap-2">
        <span
          className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-base font-bold border ${gradeTextColor(grade)} ${gradeBgColor(grade)} ${gradeBorderColor(grade)}`}
        >
          {grade}
        </span>
        <div className="flex flex-col">
          {label && <span className="text-xs text-white/70">{label}</span>}
          {score !== undefined && (
            <span className="text-xs text-white/50 font-mono">{score}/100</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-semibold border ${gradeTextColor(grade)} ${gradeBgColor(grade)} ${gradeBorderColor(grade)}`}
    >
      {grade}
      {score !== undefined && (
        <span className="text-[10px] font-mono opacity-70">{score}</span>
      )}
    </span>
  )
}

/** Test if a string looks like a safety grade */
export function isGradeValue(text: string): boolean {
  return /^[A-F][+-]?$/.test(text.trim())
}
