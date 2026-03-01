import { scoreToGrade, gradeRank, worstGrade } from "@/lib/shared/scoring"
import type { StreamingTestResult, StreamingProfileResult } from "./streaming-data-types"

/** Extract grade cap from CFO effect string like "Grade capped at D" */
function extractGradeCap(cfoEffect?: string): string | null {
  if (!cfoEffect) return null
  const match = cfoEffect.match(/capped at (\w[+-]?)/i)
  return match ? match[1] : null
}

/** Compute grade for a single profile from its test results */
export function computeProfileGrade(tests: StreamingTestResult[]): {
  score: number
  grade: string
  capped: boolean
  gradeCap?: string
  gradeCapReasons: string[]
} {
  // Filter out null scores (not testable)
  const scorable = tests.filter(t => t.score !== null)

  if (scorable.length === 0) {
    return { score: 0, grade: "F", capped: false, gradeCapReasons: [] }
  }

  const totalWeight = scorable.reduce((sum, t) => sum + t.weight, 0)
  const weightedSum = scorable.reduce((sum, t) => sum + (t.score! * t.weight), 0)
  const weightedAvg = weightedSum / totalWeight  // 0.0 (perfect) to 4.0 (worst)

  // Apply exponential penalty (same as AI chatbot portal)
  const penalizedAvg = Math.pow(weightedAvg / 4, 1.5)  // 0-1 range, penalized
  const penalizedScore = Math.max(0, (1 - penalizedAvg) * 100)

  let grade = scoreToGrade(penalizedScore)

  // Apply grade caps from critical failure overrides
  let capped = false
  let gradeCap: string | undefined
  const gradeCapReasons: string[] = []

  for (const t of tests) {
    if (t.cfoTriggered) {
      const cap = extractGradeCap(t.cfoEffect)
      if (cap && gradeRank(cap) > gradeRank(grade)) {
        grade = cap
        gradeCap = cap
        capped = true
        gradeCapReasons.push(`${t.cfoTriggered}: ${t.category} (${t.testId})`)
      }
    }
  }

  return { score: penalizedScore, grade, capped, gradeCap, gradeCapReasons }
}

/** Compute platform-level grade from all profile grades (worst profile = platform grade) */
export function computePlatformGrade(profiles: StreamingProfileResult[]): {
  overallGrade: string
  overallScore: number
} {
  if (profiles.length === 0) {
    return { overallGrade: "F", overallScore: 0 }
  }

  const grades = profiles.map(p => p.overallGrade)
  const scores = profiles.map(p => p.weightedScore)

  return {
    overallGrade: worstGrade(grades),
    overallScore: Math.min(...scores),
  }
}
