/**
 * Adapter: Converts LAW_REGISTRY entries to the ComplianceLaw[] shape
 * used by the marketing Compliance.tsx section.
 *
 * This maintains backward compatibility while the unified registry
 * is the single source of truth.
 */
import { LAW_REGISTRY } from "../law-registry"
import type { LawEntry } from "../types"

export interface ComplianceLaw {
  id: string
  name: string
  fullName: string
  jurisdiction: string
  stage: string
  stageColor: "enacted" | "passed" | "pending"
  summary: string
  categories: { id: string; name: string; group: string }[]
  platforms: string[]
  mcpSnippet: string
}

// Rule category display names and groups for the marketing badges
const CATEGORY_DISPLAY: Record<string, { name: string; group: string }> = {
  algo_feed_control: { name: "Algorithm Feed Control", group: "algorithmic" },
  addictive_design_control: { name: "Addictive Design Control", group: "algorithmic" },
  targeted_ad_block: { name: "Targeted Ad Block", group: "advertising" },
  data_deletion_request: { name: "Data Deletion Request", group: "privacy" },
  geolocation_opt_in: { name: "Geolocation Opt-In", group: "privacy" },
  notification_curfew: { name: "Notification Curfew", group: "notifications" },
  usage_timer_notification: { name: "Usage Timer", group: "notifications" },
  dm_restriction: { name: "DM Restriction", group: "access_control" },
  age_gate: { name: "Age Gate", group: "access_control" },
  content_rating: { name: "Content Rating", group: "content" },
  web_safesearch: { name: "Safe Search", group: "content" },
  web_category_block: { name: "Web Category Block", group: "content" },
  web_filter_level: { name: "Web Filter Level", group: "content" },
  time_daily_limit: { name: "Daily Time Limit", group: "time" },
  time_scheduled_hours: { name: "Scheduled Hours", group: "time" },
  privacy_data_sharing: { name: "Data Sharing Control", group: "privacy" },
  monitoring_activity: { name: "Activity Monitoring", group: "monitoring" },
  social_media_min_age: { name: "Social Media Min Age", group: "access_control" },
  csam_reporting: { name: "CSAM Reporting", group: "reporting" },
  library_filter_compliance: { name: "Library Filter", group: "content" },
  ai_minor_interaction: { name: "AI Minor Interaction", group: "algorithmic" },
  image_rights_minor: { name: "Image Rights", group: "privacy" },
}

function mapStageColor(status: LawEntry["status"]): "enacted" | "passed" | "pending" {
  if (status === "enacted") return "enacted"
  if (status === "passed") return "passed"
  return "pending"
}

function toLaw(entry: LawEntry): ComplianceLaw {
  return {
    id: entry.id,
    name: entry.shortName,
    fullName: entry.fullName,
    jurisdiction: entry.jurisdiction,
    stage: entry.statusLabel,
    stageColor: mapStageColor(entry.status),
    summary: entry.summary,
    categories: entry.ruleCategories.map((catId) => {
      const display = CATEGORY_DISPLAY[catId]
      return {
        id: catId,
        name: display?.name ?? catId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        group: display?.group ?? "other",
      }
    }),
    platforms: entry.platforms,
    mcpSnippet: entry.mcpSnippet,
  }
}

export const COMPLIANCE_LAWS: ComplianceLaw[] = LAW_REGISTRY.map(toLaw)

export const GROUP_COLORS: Record<string, { bg: string; text: string }> = {
  algorithmic: { bg: "bg-purple-50", text: "text-purple-700" },
  notifications: { bg: "bg-rose-50", text: "text-rose-700" },
  advertising: { bg: "bg-green-50", text: "text-green-700" },
  access_control: { bg: "bg-orange-50", text: "text-orange-700" },
  content: { bg: "bg-blue-50", text: "text-blue-700" },
  privacy: { bg: "bg-teal-50", text: "text-teal-700" },
  time: { bg: "bg-yellow-50", text: "text-yellow-700" },
  monitoring: { bg: "bg-indigo-50", text: "text-indigo-700" },
  reporting: { bg: "bg-red-50", text: "text-red-700" },
  other: { bg: "bg-slate-50", text: "text-slate-700" },
}
