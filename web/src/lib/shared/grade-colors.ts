/** Shared grade color utilities — used by both AI Safety and Streaming Safety portals */

export function gradeTextColor(grade: string): string {
  if (grade.startsWith("A")) return "text-emerald-400"
  if (grade.startsWith("B")) return "text-blue-400"
  if (grade.startsWith("C")) return "text-amber-400"
  if (grade.startsWith("D")) return "text-orange-400"
  if (grade === "F") return "text-red-400"
  return "text-white/60"
}

export function gradeBgColor(grade: string): string {
  if (grade.startsWith("A")) return "bg-emerald-500/20"
  if (grade.startsWith("B")) return "bg-blue-500/20"
  if (grade.startsWith("C")) return "bg-amber-500/20"
  if (grade.startsWith("D")) return "bg-orange-500/20"
  if (grade === "F") return "bg-red-500/20"
  return "bg-white/10"
}

export function gradeBorderColor(grade: string): string {
  if (grade.startsWith("A")) return "border-emerald-500/30"
  if (grade.startsWith("B")) return "border-blue-500/30"
  if (grade.startsWith("C")) return "border-amber-500/30"
  if (grade.startsWith("D")) return "border-orange-500/30"
  if (grade === "F") return "border-red-500/30"
  return "border-white/10"
}

/** Get hex color for SVG/canvas (non-Tailwind contexts) */
export function gradeHexColor(grade: string): string {
  if (grade.startsWith("A")) return "#34d399"
  if (grade.startsWith("B")) return "#60a5fa"
  if (grade.startsWith("C")) return "#fbbf24"
  if (grade.startsWith("D")) return "#fb923c"
  if (grade === "F") return "#f87171"
  return "#9ca3af"
}
