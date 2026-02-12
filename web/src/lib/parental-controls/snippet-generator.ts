import type { ParentalControlEntry, CapabilityEntry } from "./types"
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
  time_per_app_limit: {
    feature: "Per-App Time Limit",
    description: "Sets individual time limits for each app or game.",
  },
  time_downtime: {
    feature: "Device Downtime",
    description: "Enforces device-wide downtime during specified periods.",
  },
  time_bedtime: {
    feature: "Bedtime Enforcement",
    description: "Disables device access during designated sleep hours.",
  },
  content_rating: {
    feature: "Content Rating Filter",
    description: "Enforces age-appropriate content ratings across apps and media.",
  },
  content_block_explicit: {
    feature: "Explicit Content Block",
    description: "Blocks sexually explicit and graphic violence content.",
  },
  web_filter_level: {
    feature: "Web Content Filter",
    description: "Applies category-based web filtering to block inappropriate sites.",
  },
  web_category_block: {
    feature: "Category Blocking",
    description: "Blocks entire web content categories like gambling, violence, or adult content.",
  },
  web_safesearch: {
    feature: "Safe Search Enforcement",
    description: "Forces safe search on all supported search engines.",
  },
  monitoring_activity: {
    feature: "Activity Monitoring",
    description: "Enables parent-visible activity reports across platforms.",
  },
  monitoring_alerts: {
    feature: "Smart Alerts",
    description: "Sends real-time alerts when concerning activity is detected.",
  },
  monitoring_location: {
    feature: "Location Monitoring",
    description: "Enables parent-visible location tracking across devices.",
  },
  social_chat_control: {
    feature: "Chat & Messaging Control",
    description: "Restricts messaging to known, parent-approved contacts.",
  },
  social_friend_approval: {
    feature: "Friend Request Approval",
    description: "Requires parental approval for new friend and follower requests.",
  },
  social_profile_visibility: {
    feature: "Profile Visibility Control",
    description: "Forces child profiles to private/friends-only visibility.",
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
  app_install_approval: {
    feature: "App Install Approval",
    description: "Requires parental approval before installing new apps.",
  },
  app_block: {
    feature: "App Blocking",
    description: "Blocks specific apps from being used on the child's device.",
  },
  notification_control: {
    feature: "Notification Control",
    description: "Limits or silences notifications outside approved hours.",
  },
  notification_curfew: {
    feature: "Notification Curfew",
    description: "Silences all notifications during curfew hours.",
  },
  algorithmic_feed_opt_out: {
    feature: "Algorithmic Feed Opt-Out",
    description: "Disables algorithmic recommendation feeds in favor of chronological.",
  },
  dm_restriction: {
    feature: "DM Restriction",
    description: "Restricts direct messaging to approved contacts only.",
  },
  geofence: {
    feature: "Geofence Alerts",
    description: "Sends alerts when the child enters or leaves designated areas.",
  },
  sos_panic: {
    feature: "SOS Panic Button",
    description: "Provides a one-tap emergency alert with location sharing.",
  },
  driving_safety: {
    feature: "Driving Safety",
    description: "Monitors and restricts phone usage while driving.",
  },
}

export function getCategoryFeature(category: string): { feature: string; description: string } {
  if (CATEGORY_FEATURES[category]) return CATEGORY_FEATURES[category]
  const feature = category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
  return { feature, description: `Manages the ${feature.toLowerCase()} capability via the Phosra API.` }
}

/* ── Helpers ────────────────────────────────────────────────────── */

function getSourceId(entry: ParentalControlEntry): string {
  return `src_${entry.slug.replace(/-/g, "_")}_01`
}

function getCredentialBlock(
  apiAvailability: ParentalControlEntry["apiAvailability"],
  slug: string,
): Record<string, unknown> {
  switch (apiAvailability) {
    case "public_api":
      return { api_key: `${slug}_ak_...`, account_id: `${slug}_acct_01` }
    case "partner_api":
      return { partner_token: `${slug}_ptr_...` }
    case "undocumented":
      return { partner_token: `${slug}_ptr_...` }
    case "no_api":
    default:
      return {}
  }
}

function getPartialLimitation(entry: ParentalControlEntry, category: string): string {
  return `${entry.name} supports ${category.replace(/_/g, " ")} with limitations. Some advanced rule options may not be available through this source.`
}

function getGuideSteps(slug: string, category: string): string[] {
  const appName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
  const featureName = category.replace(/_/g, " ")
  return [
    `Open ${appName} on the child's device or parent dashboard.`,
    `Navigate to Settings → ${featureName.charAt(0).toUpperCase() + featureName.slice(1)}.`,
    `Apply the Phosra-recommended configuration shown below.`,
    `Confirm changes and verify the rule is active.`,
    `Return to Phosra and mark the step as complete.`,
  ]
}

/* ── Hero snippet: connect source ──────────────────────────────── */

export function generateConnectSnippet(entry: ParentalControlEntry): CodeExample {
  const sourceId = getSourceId(entry)

  if (entry.apiAvailability === "no_api") {
    const code = `curl -X POST https://api.phosra.com/v1/sources \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "child_id": "ch_emma_01",
    "source": "${entry.slug}",
    "mode": "guided"
  }'`

    const response = JSON.stringify(
      {
        source_id: sourceId,
        status: "guide_mode",
        source: entry.slug,
        setup_steps: entry.capabilities.filter((c) => c.support !== "none").length,
        guide_url: `https://app.phosra.com/guides/${entry.slug}/setup`,
      },
      null,
      2,
    )

    return { title: "POST /v1/sources", language: "bash", code, response }
  }

  const credentials = getCredentialBlock(entry.apiAvailability, entry.slug)
  const body: Record<string, unknown> = {
    child_id: "ch_emma_01",
    source: entry.slug,
    credentials,
    auto_sync: true,
  }

  const code = `curl -X POST https://api.phosra.com/v1/sources \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(body, null, 4).split("\n").join("\n  ")}'`

  const capLinked = entry.capabilities.filter((c) => c.support !== "none").length
  const responseObj: Record<string, unknown> = {
    source_id: sourceId,
    status: "connected",
    source: entry.slug,
    capabilities_linked: capLinked,
  }

  if (entry.apiAvailability === "partner_api") {
    responseObj.api_tier = "partner"
    responseObj.note = "Connected via partner integration"
  } else if (entry.apiAvailability === "undocumented") {
    responseObj.api_tier = "undocumented"
    responseObj.note = "Integration availability may vary"
  }

  const response = JSON.stringify(responseObj, null, 2)
  return { title: "POST /v1/sources", language: "bash", code, response }
}

/* ── Sync snippet ──────────────────────────────────────────────── */

export function generateSyncSnippet(entry: ParentalControlEntry): CodeExample {
  const sourceId = getSourceId(entry)

  if (entry.apiAvailability === "no_api") {
    const code = `curl -X POST https://api.phosra.com/v1/sources/${sourceId}/sync \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "sync_mode": "guide_refresh"
  }'`

    const steps = entry.capabilities
      .filter((c) => c.support !== "none")
      .slice(0, 3)
      .map((c) => ({
        category: c.category,
        status: c.support === "full" ? "guide_ready" : "guide_ready_with_limitations",
      }))

    const response = JSON.stringify(
      {
        status: "guide_refreshed",
        total_steps: entry.capabilities.filter((c) => c.support !== "none").length,
        steps,
      },
      null,
      2,
    )

    return { title: `POST /v1/sources/${sourceId}/sync`, language: "bash", code, response }
  }

  const code = `curl -X POST https://api.phosra.com/v1/sources/${sourceId}/sync \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "sync_mode": "full"
  }'`

  const fullCount = entry.capabilities.filter((c) => c.support === "full").length
  const partialCount = entry.capabilities.filter((c) => c.support === "partial").length
  const noneCount = entry.capabilities.filter((c) => c.support === "none").length

  const results = entry.capabilities.slice(0, 3).map((c) => ({
    category: c.category,
    status: c.support === "full" ? "applied" : c.support === "partial" ? "applied_with_limitations" : "skipped",
  }))

  const response = JSON.stringify(
    {
      status: "completed",
      rules_pushed: fullCount + partialCount,
      rules_skipped: noneCount,
      results,
    },
    null,
    2,
  )

  return { title: `POST /v1/sources/${sourceId}/sync`, language: "bash", code, response }
}

/* ── Per-capability snippet ────────────────────────────────────── */

export function generateCapabilitySnippet(
  entry: ParentalControlEntry,
  cap: CapabilityEntry,
): CodeExample {
  const sourceId = getSourceId(entry)

  // ── No-API: guide-based ──
  if (entry.apiAvailability === "no_api") {
    const code = `curl -X GET https://api.phosra.com/v1/sources/${sourceId}/guide/${cap.category} \\
  -H "Authorization: Bearer sk_live_..."`

    if (cap.support === "none") {
      const response = JSON.stringify(
        {
          category: cap.category,
          support: "none",
          message: `${entry.name} does not support ${cap.category.replace(/_/g, " ")}. Consider alternative sources.`,
          alternative_sources: ["qustodio", "bark", "apple-screen-time"],
        },
        null,
        2,
      )
      return { title: `GET /v1/sources/${sourceId}/guide/${cap.category}`, language: "bash", code, response }
    }

    const steps = getGuideSteps(entry.slug, cap.category)
    const responseObj: Record<string, unknown> = {
      category: cap.category,
      support: cap.support,
      steps,
      estimated_time: "2 minutes",
    }
    if (cap.support === "partial") {
      responseObj.limitation = getPartialLimitation(entry, cap.category)
    }

    const response = JSON.stringify(responseObj, null, 2)
    return { title: `GET /v1/sources/${sourceId}/guide/${cap.category}`, language: "bash", code, response }
  }

  // ── API-based (public, partner, undocumented) ──
  if (cap.support === "none") {
    const body = {
      category: cap.category,
      value: "enabled",
    }

    const code = `curl -X POST https://api.phosra.com/v1/sources/${sourceId}/rules \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(body, null, 4).split("\n").join("\n  ")}'`

    const response = JSON.stringify(
      {
        category: cap.category,
        status: "unsupported",
        message: `${entry.name} does not support ${cap.category.replace(/_/g, " ")}.`,
        alternative_sources: ["qustodio", "bark", "apple-screen-time"],
      },
      null,
      2,
    )

    return { title: `POST /v1/sources/${sourceId}/rules`, language: "bash", code, response }
  }

  const body: Record<string, unknown> = {
    category: cap.category,
    value: "enabled",
  }

  const code = `curl -X POST https://api.phosra.com/v1/sources/${sourceId}/rules \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(body, null, 4).split("\n").join("\n  ")}'`

  const responseObj: Record<string, unknown> = {
    category: cap.category,
    status: cap.support === "full" ? "applied" : "applied_with_limitations",
    support: cap.support,
    verified: cap.support === "full",
  }

  if (cap.support === "partial") {
    responseObj.limitation = getPartialLimitation(entry, cap.category)
  }

  if (entry.apiAvailability === "partner_api" || entry.apiAvailability === "undocumented") {
    responseObj.note = entry.apiAvailability === "partner_api"
      ? "Applied via partner integration"
      : "Applied via undocumented integration — availability may vary"
  }

  const response = JSON.stringify(responseObj, null, 2)
  return { title: `POST /v1/sources/${sourceId}/rules`, language: "bash", code, response }
}
