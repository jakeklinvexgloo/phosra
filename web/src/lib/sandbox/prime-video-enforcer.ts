import type { ChangeDelta, SandboxRule } from "./types"
import type { PrimeVideoMaturityTier, PrimeVideoProfile } from "./prime-video-types"
import { getPrimeVideoCapability } from "./prime-video-rule-mappings"

/** MPAA rating -> Prime Video maturity tier mapping */
const MPAA_TO_PRIME: Record<string, PrimeVideoMaturityTier> = {
  G: "All",
  PG: "7+",
  "PG-13": "13+",
  R: "16+",
  "NC-17": "18+",
}

/** Enforce enabled rules against Prime Video profiles with optional per-profile config overrides. */
export function enforcePrimeVideoRules(
  rules: SandboxRule[],
  profiles: PrimeVideoProfile[],
  profileOverrides?: Record<string, Record<string, Record<string, unknown>>>
): { profiles: PrimeVideoProfile[]; changes: ChangeDelta[]; applied: number; skipped: number } {
  const changes: ChangeDelta[] = []
  let applied = 0
  let skipped = 0

  // Deep clone profiles
  let updated = profiles.map((p) => ({
    ...p,
    viewingActivity: [...p.viewingActivity],
    watchlist: [...p.watchlist],
    rentals: [...p.rentals],
    purchasePin: { ...p.purchasePin },
    profilePin: { ...p.profilePin },
  }))

  for (const rule of rules) {
    if (!rule.enabled) continue

    const cap = getPrimeVideoCapability(rule.category)
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
      case "purchase_approval":
        updated = applyPurchasePin(updated, rule, changes)
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
          description: "Watch history now visible to parents",
        })
        applied++
        break
      case "targeted_ad_block":
        updated = applyAdBlock(updated, changes)
        applied++
        break
      default:
        skipped++
    }
  }

  return { profiles: updated, changes, applied, skipped }
}

function applyContentRating(
  profiles: PrimeVideoProfile[],
  rule: SandboxRule,
  changes: ChangeDelta[],
  profileOverrides?: Record<string, Record<string, Record<string, unknown>>>
): PrimeVideoProfile[] {
  return profiles.map((p) => {
    if (p.type === "adult") return p

    // Kids profiles are hardcoded to <=12 content (7+ tier)
    // Content rating rule still applies but cannot exceed "7+" for kids
    const profileConfig = profileOverrides?.[p.id]?.[rule.category]
    const mpaaRating = (profileConfig?.maxRating as string) || (rule.config.maxRating as string) || "PG-13"
    let primeTier = MPAA_TO_PRIME[mpaaRating] || "13+"

    // Enforce kids profile ceiling
    if (p.type === "kids") {
      const tierOrder: PrimeVideoMaturityTier[] = ["All", "7+", "13+", "16+", "18+"]
      const targetIdx = tierOrder.indexOf(primeTier)
      const kidsMax = tierOrder.indexOf("7+")
      if (targetIdx > kidsMax) {
        primeTier = "7+"
      }
    }

    const oldRating = p.maturityRating
    if (oldRating === primeTier) return p

    changes.push({
      profileId: p.id,
      profileName: p.name,
      field: "maturityRating",
      oldValue: oldRating,
      newValue: primeTier,
      description: `Viewing restriction changed from ${oldRating} to ${primeTier}`,
    })

    return { ...p, maturityRating: primeTier }
  })
}

function applyPurchasePin(
  profiles: PrimeVideoProfile[],
  rule: SandboxRule,
  changes: ChangeDelta[]
): PrimeVideoProfile[] {
  // Purchase PIN is account-wide, applied to the adult profile
  return profiles.map((p) => {
    if (p.type !== "adult") return p
    if (p.purchasePin.enabled) return p

    changes.push({
      profileId: p.id,
      profileName: p.name,
      field: "purchasePin",
      oldValue: { enabled: false },
      newValue: { enabled: true },
      description: "PIN on Purchase enabled (account-wide)",
    })

    return { ...p, purchasePin: { enabled: true } }
  })
}

function applyAdBlock(
  profiles: PrimeVideoProfile[],
  changes: ChangeDelta[]
): PrimeVideoProfile[] {
  return profiles.map((p) => {
    if (p.type !== "kids") return p
    if (p.adFree) return p // Already ad-free

    changes.push({
      profileId: p.id,
      profileName: p.name,
      field: "adFree",
      oldValue: false,
      newValue: true,
      description: "Kids profile set to ad-free experience",
    })

    return { ...p, adFree: true }
  })
}

function applyTimeLimitBadge(
  profiles: PrimeVideoProfile[],
  changes: ChangeDelta[]
): PrimeVideoProfile[] {
  return profiles.map((p) => {
    if (p.type === "adult") return p
    if (p.timeLimitManaged) return p

    changes.push({
      profileId: p.id,
      profileName: p.name,
      field: "timeLimitManaged",
      oldValue: false,
      newValue: true,
      description: "Time limit managed by Phosra (not natively supported by Prime Video)",
    })

    return { ...p, timeLimitManaged: true }
  })
}
