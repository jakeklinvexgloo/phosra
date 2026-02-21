import type { ProviderCapability, SandboxRule } from "./types"

/** Maps all 45 rule categories to Netflix provider capabilities */
export const NETFLIX_CAPABILITIES: ProviderCapability[] = [
  // Content Rules — 5
  { category: "content_rating", supported: true, netflixSetting: "Maturity Rating", targetProfiles: ["standard", "kids"], description: "Set maturity tier on child profiles" },
  { category: "content_block_title", supported: true, netflixSetting: "Blocked Titles", targetProfiles: ["standard", "kids"], description: "Block specific titles from appearing" },
  { category: "content_allow_title", supported: true, netflixSetting: "Blocked Titles", targetProfiles: ["standard", "kids"], description: "Remove titles from block list" },
  { category: "content_allowlist_mode", supported: false, targetProfiles: [], description: "Netflix does not support allowlist-only mode" },
  { category: "content_descriptor_block", supported: false, targetProfiles: [], description: "Netflix does not support descriptor-level blocking" },

  // Time Rules — 4
  { category: "time_daily_limit", supported: false, netflixSetting: "Time Limit (Phosra-managed)", targetProfiles: ["standard", "kids"], description: "Not natively supported — managed by Phosra" },
  { category: "time_scheduled_hours", supported: false, targetProfiles: [], description: "Netflix does not support scheduled hours" },
  { category: "time_per_app_limit", supported: false, targetProfiles: [], description: "Not applicable to Netflix" },
  { category: "time_downtime", supported: false, targetProfiles: [], description: "Netflix does not support downtime" },

  // Purchase Rules — 3
  { category: "purchase_approval", supported: true, netflixSetting: "Profile Lock", targetProfiles: ["adult"], description: "Enable profile lock with PIN on parent profiles" },
  { category: "purchase_spending_cap", supported: false, targetProfiles: [], description: "Netflix subscription is flat-rate" },
  { category: "purchase_block_iap", supported: false, targetProfiles: [], description: "Netflix has no in-app purchases" },

  // Social Rules — 3
  { category: "social_contacts", supported: false, targetProfiles: [], description: "Netflix has no social features" },
  { category: "social_chat_control", supported: false, targetProfiles: [], description: "Netflix has no chat" },
  { category: "social_multiplayer", supported: false, targetProfiles: [], description: "Netflix has no multiplayer" },

  // Web Rules — 5
  { category: "web_safesearch", supported: false, targetProfiles: [], description: "Not applicable to Netflix" },
  { category: "web_category_block", supported: false, targetProfiles: [], description: "Not applicable to Netflix" },
  { category: "web_custom_allowlist", supported: false, targetProfiles: [], description: "Not applicable to Netflix" },
  { category: "web_custom_blocklist", supported: false, targetProfiles: [], description: "Not applicable to Netflix" },
  { category: "web_filter_level", supported: false, targetProfiles: [], description: "Not applicable to Netflix" },

  // Privacy Rules — 4
  { category: "privacy_location", supported: false, targetProfiles: [], description: "Netflix does not track location" },
  { category: "privacy_profile_visibility", supported: false, targetProfiles: [], description: "Netflix profiles are account-internal" },
  { category: "privacy_data_sharing", supported: false, targetProfiles: [], description: "Managed at account level, not per-profile" },
  { category: "privacy_account_creation", supported: false, targetProfiles: [], description: "Netflix requires one account owner" },

  // Monitoring Rules — 2
  { category: "monitoring_activity", supported: true, netflixSetting: "Viewing Activity", targetProfiles: ["standard", "kids"], description: "Toggle viewing activity visibility for child profiles" },
  { category: "monitoring_alerts", supported: false, targetProfiles: [], description: "Netflix does not support parental alerts" },

  // Algorithmic Safety — 2
  { category: "algo_feed_control", supported: false, targetProfiles: [], description: "Netflix algorithm is not configurable per-profile" },
  { category: "addictive_design_control", supported: false, targetProfiles: [], description: "Netflix does not expose addictive design controls" },

  // Notification Rules — 2
  { category: "notification_curfew", supported: false, targetProfiles: [], description: "Netflix does not support notification curfews" },
  { category: "usage_timer_notification", supported: false, targetProfiles: [], description: "Netflix does not support usage timer notifications" },

  // Advertising & Data — 5
  { category: "targeted_ad_block", supported: false, targetProfiles: [], description: "Netflix ad tier is account-level" },
  { category: "dm_restriction", supported: false, targetProfiles: [], description: "Netflix has no DMs" },
  { category: "age_gate", supported: false, targetProfiles: [], description: "Netflix uses profile types, not age gates" },
  { category: "data_deletion_request", supported: false, targetProfiles: [], description: "Account-level operation" },
  { category: "geolocation_opt_in", supported: false, targetProfiles: [], description: "Not applicable to Netflix" },

  // Compliance Expansion — 5
  { category: "csam_reporting", supported: false, targetProfiles: [], description: "Platform responsibility, not parental control" },
  { category: "library_filter_compliance", supported: false, targetProfiles: [], description: "Not applicable to Netflix" },
  { category: "ai_minor_interaction", supported: false, targetProfiles: [], description: "Netflix has no AI interactions" },
  { category: "social_media_min_age", supported: false, targetProfiles: [], description: "Netflix is not social media" },
  { category: "image_rights_minor", supported: false, targetProfiles: [], description: "Not applicable to Netflix" },

  // Legislation-Driven Expansion — 5
  { category: "parental_consent_gate", supported: false, targetProfiles: [], description: "Netflix account owner implicitly consents" },
  { category: "parental_event_notification", supported: false, targetProfiles: [], description: "Netflix does not support event notifications" },
  { category: "screen_time_report", supported: false, targetProfiles: [], description: "Netflix does not generate time reports" },
  { category: "commercial_data_ban", supported: false, targetProfiles: [], description: "Platform-level compliance" },
  { category: "algorithmic_audit", supported: false, targetProfiles: [], description: "Platform-level compliance" },
]

/** Capability lookup by category */
const capabilityMap = new Map(NETFLIX_CAPABILITIES.map((c) => [c.category, c]))

export function getCapability(category: string): ProviderCapability | undefined {
  return capabilityMap.get(category)
}

/** Human-readable labels for rule categories */
const RULE_LABELS: Record<string, string> = {
  content_rating: "Content Rating",
  content_block_title: "Block Specific Titles",
  content_allow_title: "Allow Specific Titles",
  content_allowlist_mode: "Allowlist-Only Mode",
  content_descriptor_block: "Descriptor Block",
  time_daily_limit: "Daily Time Limit",
  time_scheduled_hours: "Scheduled Hours",
  time_per_app_limit: "Per-App Limit",
  time_downtime: "Downtime",
  purchase_approval: "Purchase Approval",
  purchase_spending_cap: "Spending Cap",
  purchase_block_iap: "Block In-App Purchases",
  social_contacts: "Contact Control",
  social_chat_control: "Chat Control",
  social_multiplayer: "Multiplayer Control",
  web_safesearch: "Safe Search",
  web_category_block: "Category Block",
  web_custom_allowlist: "Custom Allowlist",
  web_custom_blocklist: "Custom Blocklist",
  web_filter_level: "Filter Level",
  privacy_location: "Location Sharing",
  privacy_profile_visibility: "Profile Visibility",
  privacy_data_sharing: "Data Sharing",
  privacy_account_creation: "Account Creation",
  monitoring_activity: "Activity Monitoring",
  monitoring_alerts: "Monitoring Alerts",
  algo_feed_control: "Feed Control",
  addictive_design_control: "Addictive Design Control",
  notification_curfew: "Notification Curfew",
  usage_timer_notification: "Usage Timer",
  targeted_ad_block: "Targeted Ad Block",
  dm_restriction: "DM Restriction",
  age_gate: "Age Gate",
  data_deletion_request: "Data Deletion",
  geolocation_opt_in: "Geolocation Opt-In",
  csam_reporting: "CSAM Reporting",
  library_filter_compliance: "Library Filter",
  ai_minor_interaction: "AI Interaction",
  social_media_min_age: "Minimum Age",
  image_rights_minor: "Image Rights",
  parental_consent_gate: "Parental Consent Gate",
  parental_event_notification: "Event Notification",
  screen_time_report: "Screen Time Report",
  commercial_data_ban: "Commercial Data Ban",
  algorithmic_audit: "Algorithmic Audit",
}

/** Build initial sandbox rules — only Netflix-relevant rules shown with full controls */
export function buildNetflixSandboxRules(): SandboxRule[] {
  return NETFLIX_CAPABILITIES.map((cap) => ({
    category: cap.category,
    label: RULE_LABELS[cap.category] || cap.category,
    description: cap.description,
    enabled: false,
    config: getDefaultConfig(cap.category),
    appliesToProvider: cap.supported,
  }))
}

function getDefaultConfig(category: string): Record<string, unknown> {
  switch (category) {
    case "content_rating":
      return { maxRating: "PG-13" }
    case "content_block_title":
      return { titles: ["Squid Game", "Dahmer"] }
    case "content_allow_title":
      return { titles: [] }
    case "time_daily_limit":
      return { minutes: 120 }
    case "purchase_approval":
      return { requirePin: true }
    case "monitoring_activity":
      return { enabled: true }
    default:
      return {}
  }
}
