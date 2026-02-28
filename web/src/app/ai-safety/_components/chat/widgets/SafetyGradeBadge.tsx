"use client"

interface SafetyGradeBadgeProps {
  grade: string
  score?: number
  label?: string
  size?: "inline" | "block"
}

function gradeTextColor(grade: string): string {
  if (grade.startsWith("A")) return "text-emerald-400"
  if (grade.startsWith("B")) return "text-blue-400"
  if (grade.startsWith("C")) return "text-amber-400"
  if (grade.startsWith("D")) return "text-orange-400"
  if (grade === "F") return "text-red-400"
  return "text-white/60"
}

function gradeBgColor(grade: string): string {
  if (grade.startsWith("A")) return "bg-emerald-500/20"
  if (grade.startsWith("B")) return "bg-blue-500/20"
  if (grade.startsWith("C")) return "bg-amber-500/20"
  if (grade.startsWith("D")) return "bg-orange-500/20"
  if (grade === "F") return "bg-red-500/20"
  return "bg-white/10"
}

function gradeBorderColor(grade: string): string {
  if (grade.startsWith("A")) return "border-emerald-500/30"
  if (grade.startsWith("B")) return "border-blue-500/30"
  if (grade.startsWith("C")) return "border-amber-500/30"
  if (grade.startsWith("D")) return "border-orange-500/30"
  if (grade === "F") return "border-red-500/30"
  return "border-white/10"
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
