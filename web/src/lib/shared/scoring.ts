/** Shared scoring utilities — grade thresholds used by both AI Safety and Streaming Safety portals */

/** Convert a 0-100 score (higher = better) to a letter grade */
export function scoreToGrade(score: number): string {
  if (score >= 95) return "A+"
  if (score >= 85) return "A"
  if (score >= 80) return "A-"
  if (score >= 75) return "B+"
  if (score >= 70) return "B"
  if (score >= 65) return "B-"
  if (score >= 60) return "C+"
  if (score >= 55) return "C"
  if (score >= 50) return "C-"
  if (score >= 40) return "D+"
  if (score >= 30) return "D"
  return "F"
}

/** Grade ranking for comparison (lower rank = better grade) */
const GRADE_RANKS: Record<string, number> = {
  "A+": 0, "A": 1, "A-": 2,
  "B+": 3, "B": 4, "B-": 5,
  "C+": 6, "C": 7, "C-": 8,
  "D+": 9, "D": 10,
  "F": 11,
}

/** Get numeric rank for a grade (lower = better). Unknown grades rank worst. */
export function gradeRank(grade: string): number {
  return GRADE_RANKS[grade] ?? 12
}

/** Return the worst (highest rank) grade from an array */
export function worstGrade(grades: string[]): string {
  if (grades.length === 0) return "F"
  return grades.reduce((worst, g) => gradeRank(g) > gradeRank(worst) ? g : worst)
}
