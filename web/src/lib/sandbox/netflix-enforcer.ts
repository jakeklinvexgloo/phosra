import type { ChangeDelta, NetflixMaturityTier, NetflixProfile, SandboxRule } from "./types"
import { getCapability } from "./rule-mappings"

/** MPAA rating → Netflix maturity tier mapping */
const MPAA_TO_NETFLIX: Record<string, NetflixMaturityTier> = {
  G: "All",
  PG: "7+",
  "PG-13": "13+",
  R: "16+",
  "NC-17": "18+",
}

/** Enforce enabled rules against profiles with optional per-profile config overrides. */
export function enforceRules(
  rules: SandboxRule[],
  profiles: NetflixProfile[],
  profileOverrides?: Record<string, Record<string, Record<string, unknown>>>
): { profiles: NetflixProfile[]; changes: ChangeDelta[]; applied: number; skipped: number } {
  const changes: ChangeDelta[] = []
  let applied = 0
  let skipped = 0

  // Deep clone profiles
  let updated = profiles.map((p) => ({
    ...p,
    blockedTitles: [...p.blockedTitles],
    profileLock: { ...p.profileLock },
    viewingActivity: [...p.viewingActivity],
  }))

  for (const rule of rules) {
    if (!rule.enabled) continue

    const cap = getCapability(rule.category)
    if (!cap || !cap.supported) {
      // Special case: time_daily_limit shows managed badge even though unsupported
      if (rule.category === "time_daily_limit") {
        updated = applyTimeLimitBadge(updated, changes)
        applied++
      } else {
        skipped++
      }
      continue
    }

    switch (rule.category) {
      case "content_rating":
        updated = applyContentRating(updated, rule, changes, profileOverrides)
        applied++
        break
      case "content_block_title":
        updated = applyBlockTitles(updated, rule, changes, profileOverrides)
        applied++
        break
      case "content_allow_title":
        updated = applyAllowTitles(updated, rule, changes, profileOverrides)
        applied++
        break
      case "purchase_approval":
        updated = applyProfileLock(updated, rule, changes)
        applied++
        break
      case "monitoring_activity":
        // Activity monitoring is a read-only toggle — just log it
        changes.push({
          profileId: "all-children",
          profileName: "All child profiles",
          field: "viewingActivity",
          oldValue: "hidden",
          newValue: "visible",
          description: "Viewing activity now visible to parents",
        })
        applied++
        break
      default:
        skipped++
    }
  }

  return { profiles: updated, changes, applied, skipped }
}

function applyContentRating(
  profiles: NetflixProfile[],
  rule: SandboxRule,
  changes: ChangeDelta[],
  profileOverrides?: Record<string, Record<string, Record<string, unknown>>>
): NetflixProfile[] {
  return profiles.map((p) => {
    if (p.type === "adult") return p

    // Use per-profile config override if available, otherwise fall back to rule.config
    const profileConfig = profileOverrides?.[p.id]?.[rule.category]
    const mpaaRating = (profileConfig?.maxRating as string) || (rule.config.maxRating as string) || "PG-13"
    const netflixTier = MPAA_TO_NETFLIX[mpaaRating] || "13+"

    const oldRating = p.maturityRating
    if (oldRating === netflixTier) return p

    changes.push({
      profileId: p.id,
      profileName: p.name,
      field: "maturityRating",
      oldValue: oldRating,
      newValue: netflixTier,
      description: `Maturity rating changed from ${oldRating} to ${netflixTier}`,
    })

    return { ...p, maturityRating: netflixTier }
  })
}

function applyBlockTitles(
  profiles: NetflixProfile[],
  rule: SandboxRule,
  changes: ChangeDelta[],
  profileOverrides?: Record<string, Record<string, Record<string, unknown>>>
): NetflixProfile[] {
  return profiles.map((p) => {
    if (p.type === "adult") return p

    const profileConfig = profileOverrides?.[p.id]?.[rule.category]
    const titles = (profileConfig?.titles as string[]) || (rule.config.titles as string[]) || []
    if (titles.length === 0) return p

    const newTitles = titles.filter((t) => !p.blockedTitles.includes(t))
    if (newTitles.length === 0) return p

    changes.push({
      profileId: p.id,
      profileName: p.name,
      field: "blockedTitles",
      oldValue: [...p.blockedTitles],
      newValue: [...p.blockedTitles, ...newTitles],
      description: `Blocked ${newTitles.length} title(s): ${newTitles.join(", ")}`,
    })

    return { ...p, blockedTitles: [...p.blockedTitles, ...newTitles] }
  })
}

function applyAllowTitles(
  profiles: NetflixProfile[],
  rule: SandboxRule,
  changes: ChangeDelta[],
  profileOverrides?: Record<string, Record<string, Record<string, unknown>>>
): NetflixProfile[] {
  return profiles.map((p) => {
    if (p.type === "adult") return p

    const profileConfig = profileOverrides?.[p.id]?.[rule.category]
    const titles = (profileConfig?.titles as string[]) || (rule.config.titles as string[]) || []
    if (titles.length === 0) return p

    const removedTitles = titles.filter((t) => p.blockedTitles.includes(t))
    if (removedTitles.length === 0) return p

    changes.push({
      profileId: p.id,
      profileName: p.name,
      field: "blockedTitles",
      oldValue: [...p.blockedTitles],
      newValue: p.blockedTitles.filter((t) => !titles.includes(t)),
      description: `Unblocked ${removedTitles.length} title(s): ${removedTitles.join(", ")}`,
    })

    return { ...p, blockedTitles: p.blockedTitles.filter((t) => !titles.includes(t)) }
  })
}

function applyProfileLock(
  profiles: NetflixProfile[],
  rule: SandboxRule,
  changes: ChangeDelta[]
): NetflixProfile[] {
  return profiles.map((p) => {
    if (p.type !== "adult") return p
    if (p.profileLock.enabled) return p

    const pin = String(Math.floor(1000 + Math.random() * 9000))

    changes.push({
      profileId: p.id,
      profileName: p.name,
      field: "profileLock",
      oldValue: { enabled: false, pin: "" },
      newValue: { enabled: true, pin },
      description: `Profile lock enabled with PIN ${pin}`,
    })

    return { ...p, profileLock: { enabled: true, pin } }
  })
}

function applyTimeLimitBadge(
  profiles: NetflixProfile[],
  changes: ChangeDelta[]
): NetflixProfile[] {
  return profiles.map((p) => {
    if (p.type === "adult") return p
    if (p.timeLimitManaged) return p

    changes.push({
      profileId: p.id,
      profileName: p.name,
      field: "timeLimitManaged",
      oldValue: false,
      newValue: true,
      description: "Time limit managed by Phosra (not natively supported by Netflix)",
    })

    return { ...p, timeLimitManaged: true }
  })
}
