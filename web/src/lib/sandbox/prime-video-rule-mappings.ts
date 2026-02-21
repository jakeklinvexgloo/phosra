import type { ProviderCapability, SandboxRule } from "./types"

/** Maps all 45 rule categories to Prime Video provider capabilities */
export const PRIME_VIDEO_CAPABILITIES: ProviderCapability[] = [
  // Content Rules — 5
  { category: "content_rating", supported: true, providerSetting: "Viewing Restrictions", targetProfiles: ["teen", "kids"], description: "Set max maturity rating; Kids profile hardcoded to 12-and-under" },
  { category: "content_block_title", supported: false, targetProfiles: [], description: "Prime Video does not support blocking individual titles" },
  { category: "content_allow_title", supported: false, targetProfiles: [], description: "No allowlist mechanism exists" },
  { category: "content_allowlist_mode", supported: false, targetProfiles: [], description: "Not supported" },
  { category: "content_descriptor_block", supported: false, targetProfiles: [], description: "Not supported" },

  // Time Rules — 4
  { category: "time_daily_limit", supported: false, providerSetting: "Time Limit (Phosra-managed)", targetProfiles: ["teen", "kids"], description: "Not natively supported — managed by Phosra" },
  { category: "time_scheduled_hours", supported: false, targetProfiles: [], description: "Not supported" },
  { category: "time_per_app_limit", supported: false, targetProfiles: [], description: "Not applicable to Prime Video" },
  { category: "time_downtime", supported: false, targetProfiles: [], description: "Not supported" },

  // Purchase Rules — 3
  { category: "purchase_approval", supported: true, providerSetting: "PIN on Purchase", targetProfiles: ["adult"], description: "Require Account PIN for all purchases/rentals (account-wide)" },
  { category: "purchase_spending_cap", supported: false, targetProfiles: [], description: "No spending limit feature" },
  { category: "purchase_block_iap", supported: false, targetProfiles: [], description: "No in-app purchases; purchases are explicit buy/rent" },

  // Social Rules — 3
  { category: "social_contacts", supported: false, targetProfiles: [], description: "No social contact features" },
  { category: "social_chat_control", supported: false, targetProfiles: [], description: "Watch Party has chat but no parental restrictions" },
  { category: "social_multiplayer", supported: false, targetProfiles: [], description: "Not applicable" },

  // Web Rules — 5
  { category: "web_safesearch", supported: false, targetProfiles: [], description: "Not applicable to Prime Video" },
  { category: "web_category_block", supported: false, targetProfiles: [], description: "Not applicable" },
  { category: "web_custom_allowlist", supported: false, targetProfiles: [], description: "Not applicable" },
  { category: "web_custom_blocklist", supported: false, targetProfiles: [], description: "Not applicable" },
  { category: "web_filter_level", supported: false, targetProfiles: [], description: "Not applicable" },

  // Privacy Rules — 4
  { category: "privacy_location", supported: false, targetProfiles: [], description: "Prime Video does not expose location tracking controls" },
  { category: "privacy_profile_visibility", supported: false, targetProfiles: [], description: "Profiles are account-internal" },
  { category: "privacy_data_sharing", supported: false, targetProfiles: [], description: "Managed at Amazon account level" },
  { category: "privacy_account_creation", supported: false, targetProfiles: [], description: "One Amazon account owner controls all" },

  // Monitoring Rules — 2
  { category: "monitoring_activity", supported: true, providerSetting: "Watch History", targetProfiles: ["teen", "kids"], description: "View watch history per profile; items removable individually" },
  { category: "monitoring_alerts", supported: false, targetProfiles: [], description: "No parental alert/notification system" },

  // Algorithmic Safety — 2
  { category: "algo_feed_control", supported: false, targetProfiles: [], description: "Recommendations algorithm not configurable" },
  { category: "addictive_design_control", supported: false, targetProfiles: [], description: "Autoplay toggle exists but not exposed as parental control" },

  // Notification Rules — 2
  { category: "notification_curfew", supported: false, targetProfiles: [], description: "Not supported" },
  { category: "usage_timer_notification", supported: false, targetProfiles: [], description: "Not supported" },

  // Advertising & Data — 5
  { category: "targeted_ad_block", supported: true, providerSetting: "Kids Profile Ad-Free", targetProfiles: ["kids"], description: "Kids profiles never see ads; ad-free upgrade is account-level" },
  { category: "dm_restriction", supported: false, targetProfiles: [], description: "No DMs on Prime Video" },
  { category: "age_gate", supported: false, targetProfiles: [], description: "Uses profile types, not age gates" },
  { category: "data_deletion_request", supported: false, targetProfiles: [], description: "Account-level Amazon operation" },
  { category: "geolocation_opt_in", supported: false, targetProfiles: [], description: "Not applicable" },

  // Compliance Expansion — 5
  { category: "csam_reporting", supported: false, targetProfiles: [], description: "Platform responsibility" },
  { category: "library_filter_compliance", supported: false, targetProfiles: [], description: "Not applicable" },
  { category: "ai_minor_interaction", supported: false, targetProfiles: [], description: "Prime Video has no AI interactions" },
  { category: "social_media_min_age", supported: false, targetProfiles: [], description: "Not social media" },
  { category: "image_rights_minor", supported: false, targetProfiles: [], description: "Not applicable" },

  // Legislation-Driven Expansion — 5
  { category: "parental_consent_gate", supported: false, targetProfiles: [], description: "Amazon account owner implicitly consents" },
  { category: "parental_event_notification", supported: false, targetProfiles: [], description: "Not supported" },
  { category: "screen_time_report", supported: false, targetProfiles: [], description: "Not supported (only on Amazon Kids/Fire)" },
  { category: "commercial_data_ban", supported: false, targetProfiles: [], description: "Platform-level compliance" },
  { category: "algorithmic_audit", supported: false, targetProfiles: [], description: "Platform-level compliance" },
]

/** Capability lookup by category */
const capabilityMap = new Map(PRIME_VIDEO_CAPABILITIES.map((c) => [c.category, c]))

export function getPrimeVideoCapability(category: string): ProviderCapability | undefined {
  return capabilityMap.get(category)
}

/** Human-readable labels for rule categories (shared with Netflix) */
export const PRIME_VIDEO_RULE_LABELS: Record<string, string> = {
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

/** Build initial sandbox rules for Prime Video */
export function buildPrimeVideoSandboxRules(): SandboxRule[] {
  return PRIME_VIDEO_CAPABILITIES.map((cap) => ({
    category: cap.category,
    label: PRIME_VIDEO_RULE_LABELS[cap.category] || cap.category,
    description: cap.description,
    enabled: false,
    config: getPrimeVideoDefaultConfig(cap.category),
    appliesToProvider: cap.supported,
  }))
}

function getPrimeVideoDefaultConfig(category: string): Record<string, unknown> {
  switch (category) {
    case "content_rating":
      return { maxRating: "PG-13" }
    case "time_daily_limit":
      return { minutes: 120 }
    case "purchase_approval":
      return { requirePin: true }
    case "monitoring_activity":
      return { enabled: true }
    case "targeted_ad_block":
      return { kidsAdFree: true }
    default:
      return {}
  }
}
