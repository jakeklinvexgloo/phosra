import type { MovementEntry, MovementRule } from "./types"
import type { CodeExample } from "@/lib/compliance/types"

/* ── Category → human-friendly feature map ─────────────────────── */

const CATEGORY_FEATURES: Record<string, { feature: string; description: string }> = {
  social_media_min_age: {
    feature: "Social Media Age Gate",
    description: "Blocks social media account access until the child reaches the minimum age.",
  },
  privacy_account_creation: {
    feature: "Account Creation Control",
    description: "Prevents new account sign-ups on restricted platforms.",
  },
  time_scheduled_hours: {
    feature: "Scheduled Access Windows",
    description: "Restricts device or app access to approved time windows.",
  },
  time_daily_limit: {
    feature: "Daily Screen Time Limit",
    description: "Caps total daily screen time across all connected platforms.",
  },
  content_rating: {
    feature: "Content Rating Filter",
    description: "Enforces age-appropriate content ratings across apps and media.",
  },
  web_filter_level: {
    feature: "Web Content Filter",
    description: "Applies category-based web filtering to block inappropriate sites.",
  },
  web_safesearch: {
    feature: "Safe Search Enforcement",
    description: "Forces safe search on all supported search engines.",
  },
  monitoring_activity: {
    feature: "Activity Monitoring",
    description: "Enables parent-visible activity reports across platforms.",
  },
  social_chat_control: {
    feature: "Chat & Messaging Control",
    description: "Restricts messaging to known, parent-approved contacts.",
  },
  purchase_approval: {
    feature: "Purchase Approval Gate",
    description: "Requires parental approval for all in-app and digital purchases.",
  },
  privacy_data_sharing: {
    feature: "Data Sharing Restriction",
    description: "Minimizes third-party data sharing for the child's accounts.",
  },
  privacy_location: {
    feature: "Location Privacy",
    description: "Controls which apps can access the child's location data.",
  },
  monitoring_location: {
    feature: "Location Monitoring",
    description: "Enables parent-visible location tracking across devices.",
  },
  social_friend_approval: {
    feature: "Friend Request Approval",
    description: "Requires parental approval for new friend and follower requests.",
  },
  content_block_explicit: {
    feature: "Explicit Content Block",
    description: "Blocks sexually explicit and graphic violence content.",
  },
  time_bedtime: {
    feature: "Bedtime Enforcement",
    description: "Disables device access during designated sleep hours.",
  },
  notification_control: {
    feature: "Notification Control",
    description: "Limits or silences notifications outside approved hours.",
  },
  social_profile_visibility: {
    feature: "Profile Visibility Control",
    description: "Forces child profiles to private/friends-only visibility.",
  },
  app_install_approval: {
    feature: "App Install Approval",
    description: "Requires parental approval before installing new apps.",
  },
  algorithmic_feed_opt_out: {
    feature: "Algorithmic Feed Opt-Out",
    description: "Disables algorithmic recommendation feeds in favor of chronological.",
  },
}

function getCategoryFeature(category: string): { feature: string; description: string } {
  if (CATEGORY_FEATURES[category]) return CATEGORY_FEATURES[category]
  // Fallback: humanize the category key
  const feature = category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
  return { feature, description: `Enforces the ${feature.toLowerCase()} rule via the Phosra API.` }
}

/* ── Hero snippet: adopt entire movement ───────────────────────── */

export function generateFullMovementSnippet(movement: MovementEntry): CodeExample {
  const code = `curl -X POST https://api.phosra.com/v1/enforcement/movements \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "child_id": "ch_emma_01",
    "movement_id": "${movement.slug}",
    "enforce_all_rules": true
  }'`

  const platformList = ['"youtube"', '"instagram"', '"tiktok"', '"roblox"']
  const response = JSON.stringify(
    {
      enforcement_id: `enf_${movement.slug.replace(/-/g, "_")}_01`,
      status: "active",
      standard: movement.name,
      rules_applied: movement.rules.length,
      platforms_enforced: JSON.parse(`[${platformList.join(", ")}]`),
    },
    null,
    2,
  )

  return {
    title: `POST /v1/enforcement/movements`,
    language: "bash",
    code,
    response,
  }
}

/* ── Per-rule snippet ──────────────────────────────────────────── */

export function generateRuleSnippet(movement: MovementEntry, rule: MovementRule): CodeExample {
  const body: Record<string, unknown> = {
    child_id: "ch_emma_01",
    rule_category: rule.category,
    value: rule.value,
    platforms: ["*"],
  }
  if (rule.maxAge) {
    body.max_age = rule.maxAge
  }

  const code = `curl -X POST https://api.phosra.com/v1/rules \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(body, null, 4).split("\n").join("\n  ")}'`

  const response = JSON.stringify(
    {
      rule_id: `rl_${rule.category}_01`,
      status: "active",
      category: rule.category,
      label: rule.label,
      platforms_enforced: ["youtube", "instagram", "tiktok", "roblox"],
    },
    null,
    2,
  )

  return {
    title: `POST /v1/rules — ${rule.label}`,
    language: "bash",
    code,
    response,
  }
}

/* ── Convenience: get feature metadata for a rule ──────────────── */

export { getCategoryFeature }
