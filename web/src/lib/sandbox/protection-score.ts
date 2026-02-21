import type { NetflixProfile, SandboxRule, ProtectionScore } from "./types"
import { getCapability } from "./rule-mappings"

/** Severity weights per rule category */
const RULE_WEIGHTS: Record<string, number> = {
  content_rating: 3,
  content_block_title: 2,
  content_allow_title: 1,
  time_daily_limit: 2,
  purchase_approval: 2,
  monitoring_activity: 2,
}

/**
 * Compute protection score for a single profile.
 * Returns null for adult profiles (adults don't get scored).
 */
export function computeProtectionScore(
  profile: NetflixProfile,
  rules: SandboxRule[]
): ProtectionScore | null {
  if (profile.type === "adult") return null

  let totalWeight = 0
  let enabledWeight = 0
  let applicableCount = 0
  let enabledCount = 0

  for (const rule of rules) {
    const cap = getCapability(rule.category)
    if (!cap) continue

    // Check if this rule applies to this profile type
    const applies =
      (cap.supported && cap.targetProfiles.includes(profile.type)) ||
      (rule.category === "time_daily_limit" &&
        (profile.type === "standard" || profile.type === "kids"))

    if (!applies) continue

    const weight = RULE_WEIGHTS[rule.category] || 1
    totalWeight += weight
    applicableCount++

    if (rule.enabled) {
      enabledWeight += weight
      enabledCount++
    }
  }

  if (totalWeight === 0) {
    return { value: 0, level: "at-risk", applicableCount: 0, enabledCount: 0, gapCount: 0 }
  }

  const rawScore = (enabledWeight / totalWeight) * 10
  const value = Math.round(rawScore)
  const level: ProtectionScore["level"] =
    value <= 3 ? "at-risk" : value <= 6 ? "partial" : "protected"

  return {
    value,
    level,
    applicableCount,
    enabledCount,
    gapCount: applicableCount - enabledCount,
  }
}

/**
 * Compute scores for all profiles. Returns a Map keyed by profileId.
 */
export function computeAllProtectionScores(
  profiles: NetflixProfile[],
  rules: SandboxRule[]
): Map<string, ProtectionScore> {
  const scores = new Map<string, ProtectionScore>()
  for (const profile of profiles) {
    const score = computeProtectionScore(profile, rules)
    if (score) scores.set(profile.id, score)
  }
  return scores
}
