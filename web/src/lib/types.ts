export interface User {
  id: string
  email: string
  name: string
  created_at: string
}

export interface Family {
  id: string
  name: string
  created_at: string
}

export interface FamilyMember {
  id: string
  family_id: string
  user_id: string
  role: "owner" | "parent" | "guardian"
  joined_at: string
}

export interface Child {
  id: string
  family_id: string
  name: string
  birth_date: string
  avatar_url?: string
  created_at: string
}

export interface ChildPolicy {
  id: string
  child_id: string
  name: string
  status: "active" | "paused" | "draft"
  priority: number
  created_at: string
}

export interface PolicyRule {
  id: string
  policy_id: string
  category: string
  enabled: boolean
  config: any
  created_at: string
}

export type RuleCategory =
  | "content_rating" | "content_block_title" | "content_allow_title" | "content_allowlist_mode" | "content_descriptor_block"
  | "time_daily_limit" | "time_scheduled_hours" | "time_per_app_limit" | "time_downtime"
  | "purchase_approval" | "purchase_spending_cap" | "purchase_block_iap"
  | "social_contacts" | "social_chat_control" | "social_multiplayer"
  | "web_safesearch" | "web_category_block" | "web_custom_allowlist" | "web_custom_blocklist" | "web_filter_level"
  | "privacy_location" | "privacy_profile_visibility" | "privacy_data_sharing" | "privacy_account_creation"
  | "monitoring_activity" | "monitoring_alerts"
  | "algo_feed_control" | "addictive_design_control"
  | "notification_curfew" | "usage_timer_notification"
  | "targeted_ad_block" | "dm_restriction" | "age_gate"
  | "data_deletion_request" | "geolocation_opt_in"

export const RULE_GROUPS: Record<string, { label: string; categories: { value: RuleCategory; label: string }[] }> = {
  content: {
    label: "Content",
    categories: [
      { value: "content_rating", label: "Content Rating" },
      { value: "content_block_title", label: "Block Specific Titles" },
      { value: "content_allow_title", label: "Allow Specific Titles" },
      { value: "content_allowlist_mode", label: "Allowlist Mode" },
      { value: "content_descriptor_block", label: "Block by Descriptor" },
    ],
  },
  time: {
    label: "Time",
    categories: [
      { value: "time_daily_limit", label: "Daily Screen Time" },
      { value: "time_scheduled_hours", label: "Scheduled Hours" },
      { value: "time_per_app_limit", label: "Per-App Limits" },
      { value: "time_downtime", label: "Downtime" },
    ],
  },
  purchase: {
    label: "Purchases",
    categories: [
      { value: "purchase_approval", label: "Purchase Approval" },
      { value: "purchase_spending_cap", label: "Spending Cap" },
      { value: "purchase_block_iap", label: "Block In-App Purchases" },
    ],
  },
  social: {
    label: "Social",
    categories: [
      { value: "social_contacts", label: "Contact Restrictions" },
      { value: "social_chat_control", label: "Chat Control" },
      { value: "social_multiplayer", label: "Multiplayer" },
    ],
  },
  web: {
    label: "Web Filtering",
    categories: [
      { value: "web_safesearch", label: "Safe Search" },
      { value: "web_category_block", label: "Category Blocking" },
      { value: "web_custom_allowlist", label: "Custom Allowlist" },
      { value: "web_custom_blocklist", label: "Custom Blocklist" },
      { value: "web_filter_level", label: "Filter Level" },
    ],
  },
  privacy: {
    label: "Privacy",
    categories: [
      { value: "privacy_location", label: "Location Sharing" },
      { value: "privacy_profile_visibility", label: "Profile Visibility" },
      { value: "privacy_data_sharing", label: "Data Sharing" },
      { value: "privacy_account_creation", label: "Account Creation" },
    ],
  },
  monitoring: {
    label: "Monitoring",
    categories: [
      { value: "monitoring_activity", label: "Activity Reports" },
      { value: "monitoring_alerts", label: "Alerts" },
    ],
  },
  algorithmic_safety: {
    label: "Algorithmic Safety",
    categories: [
      { value: "algo_feed_control", label: "Feed Algorithm Control" },
      { value: "addictive_design_control", label: "Addictive Design Control" },
    ],
  },
  notifications: {
    label: "Notifications",
    categories: [
      { value: "notification_curfew", label: "Notification Curfew" },
      { value: "usage_timer_notification", label: "Usage Timer" },
    ],
  },
  advertising_data: {
    label: "Advertising & Data",
    categories: [
      { value: "targeted_ad_block", label: "Targeted Ad Blocking" },
      { value: "data_deletion_request", label: "Data Deletion Request" },
      { value: "geolocation_opt_in", label: "Geolocation Opt-In" },
    ],
  },
  access_control: {
    label: "Access Control",
    categories: [
      { value: "age_gate", label: "Age Gate" },
      { value: "dm_restriction", label: "DM Restriction" },
    ],
  },
}

export interface Platform {
  id: string
  name: string
  category: string
  tier: "compliant" | "provisional" | "pending"
  description: string
  auth_type: string
  capabilities: string[]
}

export interface ComplianceLink {
  id: string
  family_id: string
  platform_id: string
  status: "verified" | "unverified" | "error"
  last_enforcement_at?: string
  last_enforcement_status?: string
  verified_at: string
}

export interface EnforcementJob {
  id: string
  child_id: string
  policy_id: string
  trigger_type: string
  status: "pending" | "running" | "completed" | "failed" | "partial"
  started_at?: string
  completed_at?: string
  created_at: string
}

export interface EnforcementResult {
  id: string
  enforcement_job_id: string
  platform_id: string
  status: string
  rules_applied: number
  rules_skipped: number
  rules_failed: number
  error_message?: string
}

export interface RatingSystem {
  id: string
  name: string
  country: string
  media_type: string
}

export interface Rating {
  id: string
  system_id: string
  code: string
  name: string
  min_age: number
}

export interface FamilyOverview {
  children: {
    child: Child
    active_policies: number
    last_enforcement_at?: string
    enforcement_status: string
  }[]
  total_platforms: number
  enforcement_health: "healthy" | "warning" | "error"
  recent_enforcements: EnforcementJob[]
}

export interface UIFeedback {
  id: string
  page_route: string
  css_selector: string
  component_hint?: string
  comment: string
  reviewer_name: string
  status: "open" | "approved" | "dismissed" | "fixed"
  viewport_width?: number
  viewport_height?: number
  click_x?: number
  click_y?: number
  created_at: string
  resolved_at?: string
}

export type Strictness = "recommended" | "strict" | "relaxed"

export interface QuickSetupRequest {
  family_id?: string
  family_name?: string
  child_name: string
  birth_date: string
  strictness: Strictness
}

export interface RuleSummary {
  screen_time_minutes: number
  bedtime_hour: number
  web_filter_level: string
  content_rating: string
  total_rules_enabled: number
}

export interface QuickSetupResponse {
  family: Family
  child: Child
  policy: ChildPolicy
  rules: PolicyRule[]
  age_group: string
  max_ratings: Record<string, string>
  rule_summary: RuleSummary
}

// Developer Portal
export interface DeveloperOrg {
  id: string
  name: string
  slug: string
  description: string
  website_url: string
  logo_url: string
  owner_user_id: string
  tier: 'free' | 'growth' | 'enterprise'
  rate_limit_rpm: number
  created_at: string
  updated_at: string
}

export interface DeveloperOrgMember {
  id: string
  org_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  created_at: string
}

export interface DeveloperAPIKey {
  id: string
  org_id: string
  name: string
  key_prefix: string
  environment: 'live' | 'test'
  scopes: string[]
  last_used_at: string | null
  last_used_ip: string | null
  expires_at: string | null
  revoked_at: string | null
  created_by: string
  created_at: string
}

export interface DeveloperAPIKeyWithSecret extends DeveloperAPIKey {
  key: string  // only returned on creation
}

export interface DeveloperAPIUsage {
  key_id: string
  org_id: string
  hour: string
  endpoint: string
  status_2xx: number
  status_4xx: number
  status_5xx: number
  total_requests: number
}

export const API_SCOPES = [
  'read:families',
  'write:families',
  'read:children',
  'write:children',
  'read:policies',
  'write:policies',
  'read:enforcement',
  'write:enforcement',
  'read:devices',
  'write:devices',
  'read:webhooks',
  'write:webhooks',
  'read:ratings',
  'read:platforms',
] as const

export type APIScope = typeof API_SCOPES[number]

// Sources API
export interface Source {
  id: string
  child_id: string
  family_id: string
  source_slug: string
  display_name: string
  api_tier: 'managed' | 'guided'
  status: 'pending' | 'connected' | 'syncing' | 'error' | 'disconnected'
  auto_sync: boolean
  capabilities: SourceCapabilityEntry[]
  config: Record<string, unknown>
  last_sync_at: string | null
  last_sync_status: string | null
  sync_version: number
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface SourceCapabilityEntry {
  category: RuleCategory
  support_level: 'full' | 'partial' | 'none'
  read_write: 'push_only' | 'pull_only' | 'bidirectional'
  notes?: string
}

export interface SourceSyncJob {
  id: string
  source_id: string
  sync_mode: 'full' | 'incremental' | 'single_rule'
  trigger_type: 'manual' | 'auto' | 'webhook' | 'policy_change'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'partial'
  rules_pushed: number
  rules_skipped: number
  rules_failed: number
  error_message: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export interface SourceSyncResult {
  id: string
  job_id: string
  source_id: string
  rule_category: RuleCategory
  status: 'pushed' | 'skipped' | 'failed' | 'unsupported'
  source_value: unknown
  source_response: unknown
  error_message: string | null
  created_at: string
}

export interface AvailableSource {
  slug: string
  display_name: string
  api_tier: 'managed' | 'guided'
  auth_type: string
  website: string
  description: string
}

export interface GuidedStep {
  step_number: number
  title: string
  description: string
  image_url: string
  deep_link: string
}
