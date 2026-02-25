// ────────────────────────────────────────────────────────────────────────────
// @phosra/sdk — Type definitions
// ────────────────────────────────────────────────────────────────────────────

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  is_admin?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

// ── Families ─────────────────────────────────────────────────────────────────

export interface Family {
  id: string;
  name: string;
  created_at: string;
  updated_at?: string;
}

export type FamilyRole = "owner" | "parent" | "guardian";

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  role: FamilyRole;
  joined_at: string;
}

// ── Children ─────────────────────────────────────────────────────────────────

export interface Child {
  id: string;
  family_id: string;
  name: string;
  birth_date: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

// ── Policies ─────────────────────────────────────────────────────────────────

export type PolicyStatus = "active" | "paused" | "draft";

export interface ChildPolicy {
  id: string;
  child_id: string;
  name: string;
  status: PolicyStatus;
  priority: number;
  version?: number;
  created_at: string;
  updated_at?: string;
}

// ── Rule Categories (all 45) ─────────────────────────────────────────────────

export type RuleCategory =
  // Content rules
  | "content_rating"
  | "content_block_title"
  | "content_allow_title"
  | "content_allowlist_mode"
  | "content_descriptor_block"
  // Time rules
  | "time_daily_limit"
  | "time_scheduled_hours"
  | "time_per_app_limit"
  | "time_downtime"
  // Purchase rules
  | "purchase_approval"
  | "purchase_spending_cap"
  | "purchase_block_iap"
  // Social rules
  | "social_contacts"
  | "social_chat_control"
  | "social_multiplayer"
  // Web rules
  | "web_safesearch"
  | "web_category_block"
  | "web_custom_allowlist"
  | "web_custom_blocklist"
  | "web_filter_level"
  // Privacy rules
  | "privacy_location"
  | "privacy_profile_visibility"
  | "privacy_data_sharing"
  | "privacy_account_creation"
  // Monitoring rules
  | "monitoring_activity"
  | "monitoring_alerts"
  // Algorithmic Safety rules
  | "algo_feed_control"
  | "addictive_design_control"
  // Notification rules
  | "notification_curfew"
  | "usage_timer_notification"
  // Advertising & Data rules
  | "targeted_ad_block"
  | "dm_restriction"
  | "age_gate"
  | "data_deletion_request"
  | "geolocation_opt_in"
  // Compliance expansion rules
  | "csam_reporting"
  | "library_filter_compliance"
  | "ai_minor_interaction"
  | "social_media_min_age"
  | "image_rights_minor"
  // Legislation-driven expansion (2025)
  | "parental_consent_gate"
  | "parental_event_notification"
  | "screen_time_report"
  | "commercial_data_ban"
  | "algorithmic_audit";

// ── Policy Rules ─────────────────────────────────────────────────────────────

export interface PolicyRule {
  id: string;
  policy_id: string;
  category: RuleCategory;
  enabled: boolean;
  config: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface BulkRuleInput {
  category: RuleCategory;
  enabled: boolean;
  config: Record<string, unknown>;
}

// ── Platforms ─────────────────────────────────────────────────────────────────

export type PlatformCategory = "dns" | "streaming" | "gaming" | "device" | "browser";
export type ComplianceLevel = "compliant" | "provisional" | "pending";

export interface Platform {
  id: string;
  name: string;
  category: PlatformCategory;
  tier: ComplianceLevel;
  description: string;
  icon_url?: string;
  auth_type: string;
  capabilities: string[];
  enabled?: boolean;
}

// ── Compliance Links ─────────────────────────────────────────────────────────

export type ComplianceLinkStatus = "verified" | "unverified" | "error";

export interface ComplianceLink {
  id: string;
  family_id: string;
  platform_id: string;
  status: ComplianceLinkStatus;
  external_id?: string;
  last_enforcement_at?: string;
  last_enforcement_status?: string;
  verified_at: string;
}

// ── Enforcement ──────────────────────────────────────────────────────────────

export type EnforcementStatus = "pending" | "running" | "completed" | "failed" | "partial";

export interface EnforcementJob {
  id: string;
  child_id: string;
  policy_id: string;
  trigger_type: string;
  status: EnforcementStatus;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface EnforcementResult {
  id: string;
  enforcement_job_id: string;
  compliance_link_id?: string;
  platform_id: string;
  status: EnforcementStatus;
  rules_applied: number;
  rules_skipped: number;
  rules_failed: number;
  details?: Record<string, unknown>;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
}

// ── Ratings ──────────────────────────────────────────────────────────────────

export interface RatingSystem {
  id: string;
  name: string;
  country: string;
  media_type: string;
  description?: string;
}

export interface Rating {
  id: string;
  system_id: string;
  code: string;
  name: string;
  description?: string;
  min_age: number;
  display_order?: number;
  restrictive_idx?: number;
}

export interface AgeRatings {
  age: number;
  ratings: Record<string, Rating>;
}

// ── Webhooks ─────────────────────────────────────────────────────────────────

export interface Webhook {
  id: string;
  family_id: string;
  url: string;
  events: string[];
  active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event: string;
  payload: Record<string, unknown>;
  response_code?: number;
  success: boolean;
  attempts: number;
  next_retry_at?: string;
  created_at: string;
}

// ── Community Standards ──────────────────────────────────────────────────────

export interface StandardRule {
  id: string;
  standard_id: string;
  category: RuleCategory;
  label: string;
  enabled: boolean;
  config: Record<string, unknown>;
  sort_order: number;
}

export interface Standard {
  id: string;
  slug: string;
  name: string;
  organization: string;
  description: string;
  long_description?: string;
  icon_url?: string;
  version: string;
  published: boolean;
  min_age?: number;
  max_age?: number;
  adoption_count: number;
  rules?: StandardRule[];
  created_at: string;
  updated_at?: string;
}

export interface StandardAdoption {
  id: string;
  child_id: string;
  standard_id: string;
  adopted_at: string;
}

// ── Quick Setup ──────────────────────────────────────────────────────────────

export type Strictness = "recommended" | "strict" | "relaxed";

export interface QuickSetupRequest {
  family_id?: string;
  family_name?: string;
  child_name: string;
  birth_date: string;
  strictness?: Strictness;
}

export interface RuleSummary {
  screen_time_minutes: number;
  bedtime_hour: number;
  web_filter_level: string;
  content_rating: string;
  total_rules_enabled: number;
}

export interface QuickSetupResponse {
  family: Family;
  child: Child;
  policy: ChildPolicy;
  rules: PolicyRule[];
  age_group: string;
  max_ratings: Record<string, string>;
  rule_summary: RuleSummary;
}

// ── Devices ──────────────────────────────────────────────────────────────────

export interface DeviceRegistration {
  id: string;
  child_id: string;
  family_id: string;
  platform_id: string;
  device_name: string;
  device_model: string;
  os_version: string;
  app_version: string;
  apns_token?: string;
  last_seen_at?: string;
  last_policy_version: number;
  status: string;
  capabilities: string[];
  enforcement_summary: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface CompiledPolicy {
  version: number;
  child_id: string;
  policy_id: string;
  rules: PolicyRule[];
}

export interface DeviceReport {
  id: string;
  device_id: string;
  child_id: string;
  report_type: string;
  payload: Record<string, unknown>;
  reported_at: string;
  created_at: string;
}

// ── Reports ──────────────────────────────────────────────────────────────────

export interface FamilyOverview {
  children: {
    child: Child;
    active_policies: number;
    last_enforcement_at?: string;
    enforcement_status: string;
  }[];
  total_platforms: number;
  enforcement_health: "healthy" | "warning" | "error";
  recent_enforcements: EnforcementJob[];
}

// ── Sources ─────────────────────────────────────────────────────────────────

export interface Source {
  id: string;
  child_id: string;
  family_id: string;
  source_slug: string;
  display_name: string;
  api_tier: "managed" | "guided";
  status: "pending" | "connected" | "syncing" | "error" | "disconnected";
  auto_sync: boolean;
  capabilities: SourceCapabilityEntry[];
  config: Record<string, unknown>;
  last_sync_at: string | null;
  last_sync_status: string | null;
  sync_version: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface SourceCapabilityEntry {
  category: RuleCategory;
  support_level: "full" | "partial" | "none";
  read_write: "push_only" | "pull_only" | "bidirectional";
  notes?: string;
}

export interface SourceSyncJob {
  id: string;
  source_id: string;
  sync_mode: "full" | "incremental" | "single_rule";
  trigger_type: "manual" | "auto" | "webhook" | "policy_change";
  status: "pending" | "running" | "completed" | "failed" | "partial";
  rules_pushed: number;
  rules_skipped: number;
  rules_failed: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface SourceSyncResult {
  id: string;
  job_id: string;
  source_id: string;
  rule_category: RuleCategory;
  status: "pushed" | "skipped" | "failed" | "unsupported";
  source_value: unknown;
  source_response: unknown;
  error_message: string | null;
  created_at: string;
}

export interface AvailableSource {
  slug: string;
  display_name: string;
  api_tier: "managed" | "guided";
  auth_type: string;
  website: string;
  description: string;
}

export interface GuidedStep {
  step_number: number;
  title: string;
  description: string;
  image_url: string;
  deep_link: string;
}

// ── Client Config ────────────────────────────────────────────────────────────

export interface PhosraClientConfig {
  /** API base URL. Defaults to https://phosra-api.fly.dev/api/v1 */
  baseUrl?: string;
  /** Bearer token for user-authenticated requests. */
  accessToken?: string;
  /** Device key for device-authenticated requests (X-Device-Key header). */
  deviceKey?: string;
  /** API key for server-to-server requests (X-Api-Key header). */
  apiKey?: string;
  /** Callback invoked on 401. Return a new access token to retry the request. */
  onTokenExpired?: () => Promise<string>;
}

export interface RequestOptions {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
}
