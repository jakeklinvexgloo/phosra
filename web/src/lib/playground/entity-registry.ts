/**
 * Entity registry for the Playground Timeline.
 *
 * As tool calls execute, we extract human-readable labels from their
 * results (e.g. a child's name, a family name, an enforcement job status)
 * so that subsequent tool calls that reference those IDs can display
 * friendly annotations instead of raw UUIDs.
 */

export interface EntityLabel {
  /** e.g. "child", "family", "policy", "enforcement_job", "platform_link" */
  type: string
  /** Human-readable display label, e.g. "Emma", "Emma's Family" */
  label: string
  /** Optional additional context, e.g. "age 8", "completed" */
  detail?: string
}

/** Map of UUID → EntityLabel */
export type EntityMap = Map<string, EntityLabel>

// UUID regex for matching values in tool inputs
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Given a tool call's name and result, extract any entities (ID → label mappings)
 * and merge them into the provided entity map.
 */
export function extractEntities(
  toolName: string,
  result: unknown,
  entities: EntityMap
): void {
  if (!result || typeof result !== "object") return

  const data = result as Record<string, unknown>

  // quick_setup returns a nested structure with family, child, policy
  if (toolName === "quick_setup") {
    extractFromQuickSetup(data, entities)
    return
  }

  // Generic entity extraction based on result shape
  extractGenericEntity(toolName, data, entities)

  // Handle array results (list endpoints)
  if (Array.isArray(result)) {
    for (const item of result) {
      if (item && typeof item === "object") {
        extractGenericEntity(toolName, item as Record<string, unknown>, entities)
      }
    }
  }
}

function extractFromQuickSetup(
  data: Record<string, unknown>,
  entities: EntityMap
): void {
  // Family
  const family = data.family as Record<string, unknown> | undefined
  if (family?.id && family?.name) {
    entities.set(String(family.id), {
      type: "family",
      label: String(family.name),
    })
  }

  // Child
  const child = data.child as Record<string, unknown> | undefined
  if (child?.id && child?.name) {
    const age = child.age_group ? ` (${child.age_group})` : ""
    entities.set(String(child.id), {
      type: "child",
      label: String(child.name),
      detail: age ? String(child.age_group) : undefined,
    })
  }

  // Policy
  const policy = data.policy as Record<string, unknown> | undefined
  if (policy?.id && policy?.name) {
    entities.set(String(policy.id), {
      type: "policy",
      label: String(policy.name),
      detail: policy.status ? String(policy.status) : undefined,
    })
  }

  // Platforms connected
  const platforms = data.platforms_connected as unknown[] | undefined
  if (Array.isArray(platforms)) {
    for (const p of platforms) {
      if (p && typeof p === "object") {
        const pl = p as Record<string, unknown>
        if (pl.link_id && pl.platform_id) {
          entities.set(String(pl.link_id), {
            type: "platform_link",
            label: String(pl.platform_id),
          })
        }
      }
    }
  }
}

function extractGenericEntity(
  toolName: string,
  data: Record<string, unknown>,
  entities: EntityMap
): void {
  // Enforcement jobs — from trigger_enforcement or get_enforcement_job
  if (
    (toolName === "trigger_enforcement" ||
      toolName === "get_enforcement_job" ||
      toolName === "retry_enforcement") &&
    data.id
  ) {
    const status = data.status ? String(data.status) : undefined
    const childId = data.child_id ? String(data.child_id) : undefined
    const childLabel = childId ? entities.get(childId)?.label : undefined
    entities.set(String(data.id), {
      type: "enforcement_job",
      label: childLabel
        ? `Enforce → ${childLabel}`
        : "Enforcement job",
      detail: status,
    })
  }

  // Families
  if (data.id && data.name && (toolName.includes("family") || toolName === "create_family")) {
    entities.set(String(data.id), {
      type: "family",
      label: String(data.name),
    })
  }

  // Children
  if (data.id && data.name && data.birth_date) {
    const ageGroup = data.age_group ? String(data.age_group) : undefined
    entities.set(String(data.id), {
      type: "child",
      label: String(data.name),
      detail: ageGroup,
    })
  }

  // Policies
  if (data.id && data.name && data.status && (toolName.includes("policy") || toolName === "create_policy")) {
    entities.set(String(data.id), {
      type: "policy",
      label: String(data.name),
      detail: String(data.status),
    })
  }

  // Compliance links
  if (data.id && data.platform_id && data.family_id) {
    entities.set(String(data.id), {
      type: "platform_link",
      label: String(data.platform_id),
    })
  }

  // Webhooks
  if (data.id && data.url && toolName.includes("webhook")) {
    entities.set(String(data.id), {
      type: "webhook",
      label: String(data.url),
    })
  }

  // Rules
  if (data.id && data.category) {
    entities.set(String(data.id), {
      type: "rule",
      label: formatCategory(String(data.category)),
    })
  }
}

/**
 * For a tool call's input params, resolve any UUID values to human-readable labels.
 * Returns an array of { key, value, label? } for rendering.
 */
export function annotateInput(
  input: Record<string, unknown>,
  entities: EntityMap
): AnnotatedParam[] {
  const result: AnnotatedParam[] = []

  for (const [key, value] of Object.entries(input)) {
    const strVal = typeof value === "string" ? value : undefined

    // Check if this value is a UUID that we can resolve
    if (strVal && UUID_RE.test(strVal)) {
      const entity = entities.get(strVal)
      if (entity) {
        result.push({
          key,
          value: strVal,
          entity,
        })
        continue
      }
    }

    result.push({ key, value })
  }

  return result
}

export interface AnnotatedParam {
  key: string
  value: unknown
  entity?: EntityLabel
}

/** Summarize a tool call's purpose in plain English */
export function summarizeToolCall(
  toolName: string,
  input: Record<string, unknown>,
  entities: EntityMap
): string | null {
  const resolve = (key: string): string | null => {
    const val = input[key]
    if (typeof val === "string" && UUID_RE.test(val)) {
      return entities.get(val)?.label ?? null
    }
    return typeof val === "string" ? val : null
  }

  switch (toolName) {
    case "quick_setup": {
      const name = input.child_name
      const strictness = input.strictness || "recommended"
      return `Set up ${name} with ${strictness} protections`
    }
    case "trigger_enforcement": {
      const child = resolve("child_id")
      const platformIds = input.platform_ids as string[] | undefined
      if (platformIds?.length) {
        const names = platformIds.map(formatPlatformId).join(", ")
        return child ? `Push rules to ${names} for ${child}` : `Push rules to ${names}`
      }
      return child ? `Push rules to all platforms for ${child}` : null
    }
    case "get_enforcement_job": {
      const job = resolve("job_id")
      return job ? `Check status: ${job}` : "Check enforcement job status"
    }
    case "get_enforcement_results": {
      const job = resolve("job_id")
      return job ? `Get results: ${job}` : "Get enforcement results"
    }
    case "create_family":
      return `Create family "${input.name}"`
    case "create_child": {
      const family = resolve("family_id")
      return family
        ? `Add ${input.name} to ${family}`
        : `Add child ${input.name}`
    }
    case "list_children": {
      const family = resolve("family_id")
      return family ? `List children in ${family}` : null
    }
    case "list_policies": {
      const child = resolve("child_id")
      return child ? `List policies for ${child}` : null
    }
    case "create_policy": {
      const child = resolve("child_id")
      return child
        ? `Create policy "${input.name}" for ${child}`
        : null
    }
    case "activate_policy": {
      const policy = resolve("policy_id")
      return policy ? `Activate ${policy}` : null
    }
    case "connect_platform": {
      const family = resolve("family_id")
      return family
        ? `Connect ${input.platform_id} to ${family}`
        : `Connect ${input.platform_id}`
    }
    case "list_compliance_links": {
      const family = resolve("family_id")
      return family ? `List connected platforms for ${family}` : null
    }
    case "get_child": {
      const child = resolve("child_id")
      return child ? `Get details for ${child}` : null
    }
    case "get_family": {
      const family = resolve("family_id")
      return family ? `Get details for ${family}` : null
    }
    case "get_policy": {
      const policy = resolve("policy_id")
      return policy ? `Get details for ${policy}` : null
    }
    case "list_rules": {
      const policy = resolve("policy_id")
      return policy ? `List rules in ${policy}` : null
    }
    case "get_current_user":
      return "Get current user profile"
    case "list_families":
      return "List all families"
    case "list_platforms":
      return "List available platforms"
    case "family_overview_report": {
      const family = resolve("family_id")
      return family ? `Overview report for ${family}` : null
    }
    case "retry_enforcement": {
      const job = resolve("job_id")
      return job ? `Retry: ${job}` : "Retry enforcement"
    }
    case "list_enforcement_jobs": {
      const child = resolve("child_id")
      return child ? `Enforcement history for ${child}` : "List enforcement jobs"
    }
    case "update_family": {
      const family = resolve("family_id")
      return family ? `Update ${family}` : "Update family"
    }
    case "delete_family": {
      const family = resolve("family_id")
      return family ? `Delete ${family}` : "Delete family"
    }
    case "update_child": {
      const child = resolve("child_id")
      return child ? `Update ${child}` : "Update child"
    }
    case "delete_child": {
      const child = resolve("child_id")
      return child ? `Delete ${child}` : "Delete child"
    }
    case "get_child_age_ratings": {
      const child = resolve("child_id")
      return child ? `Get age ratings for ${child}` : "Get age-based ratings"
    }
    case "update_policy": {
      const policy = resolve("policy_id")
      return policy ? `Update ${policy}` : "Update policy"
    }
    case "delete_policy": {
      const policy = resolve("policy_id")
      return policy ? `Delete ${policy}` : "Delete policy"
    }
    case "pause_policy": {
      const policy = resolve("policy_id")
      return policy ? `Pause ${policy}` : "Pause policy"
    }
    case "generate_rules_from_age": {
      const policy = resolve("policy_id")
      return policy ? `Generate age rules for ${policy}` : "Generate age-based rules"
    }
    case "create_rule": {
      const category = input.category ? String(input.category) : "rule"
      return `Create ${formatCategory(category)} rule`
    }
    case "bulk_upsert_rules": {
      const policy = resolve("policy_id")
      return policy ? `Bulk update rules for ${policy}` : "Bulk update rules"
    }
    case "update_rule":
      return "Update rule"
    case "delete_rule":
      return "Delete rule"
    case "get_platform":
      return `Get details for ${input.platform_id || "platform"}`
    case "list_platforms_by_category":
      return `List ${input.category || ""} platforms`
    case "list_platforms_by_capability":
      return `Platforms with ${input.capability || ""}`
    case "disconnect_platform": {
      const link = resolve("link_id")
      return link ? `Disconnect ${link}` : "Disconnect platform"
    }
    case "verify_connection": {
      const link = resolve("link_id")
      return link ? `Verify ${link}` : "Verify connection"
    }
    case "list_family_members": {
      const family = resolve("family_id")
      return family ? `List members of ${family}` : "List family members"
    }
    case "add_family_member": {
      const family = resolve("family_id")
      return family ? `Add member to ${family}` : "Add family member"
    }
    case "remove_family_member":
      return "Remove family member"
    case "list_rating_systems":
      return "List rating systems"
    case "get_ratings_for_age":
      return input.age ? `Ratings for age ${input.age}` : "Get ratings by age"
    case "convert_rating":
      return "Convert rating across systems"
    case "list_webhooks": {
      const family = resolve("family_id")
      return family ? `List webhooks for ${family}` : "List webhooks"
    }
    case "create_webhook":
      return `Register webhook: ${input.url || ""}`
    case "test_webhook":
      return "Test webhook delivery"
    default:
      return null
  }
}

function formatCategory(category: string): string {
  return category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const PLATFORM_DISPLAY_NAMES: Record<string, string> = {
  netflix: "Netflix",
  paramount_plus: "Paramount+",
  youtube_tv: "YouTube TV",
  peacock: "Peacock",
  prime_video: "Prime Video",
  youtube: "YouTube",
  nextdns: "NextDNS",
  android: "Android",
  fire_tablet: "Fire Tablet",
  apple_watch: "Apple Watch",
  fire_tv_stick: "Fire TV Stick",
}

export function formatPlatformId(id: string): string {
  return PLATFORM_DISPLAY_NAMES[id] || formatCategory(id)
}
