// ── Admin Dashboard Types ───────────────────────────────────────

export type OutreachContactType = "advocacy" | "tech_company" | "legislator" | "academic" | "other"
export type OutreachStatus = "not_contacted" | "draft_ready" | "reached_out" | "in_conversation" | "partnership" | "declined"
export type EmailStatus = "none" | "draft_ready" | "emailed" | "awaiting_reply" | "replied" | "bounced"
export type OutreachActivityType = "email_sent" | "linkedin_message" | "call" | "meeting" | "note"

export interface OutreachContact {
  id: string
  name: string
  org: string
  title: string
  contact_type: OutreachContactType
  email?: string
  linkedin_url?: string
  twitter_handle?: string
  phone?: string
  status: OutreachStatus
  email_status: EmailStatus
  priority_tier: number
  notes?: string
  relevance_score?: number
  tags?: string[]
  last_contact_at?: string
  next_followup_at?: string
  created_at: string
  updated_at: string
  activities?: OutreachActivity[]
}

export interface OutreachActivity {
  id: string
  contact_id: string
  activity_type: OutreachActivityType
  subject?: string
  body?: string
  created_at: string
}

export interface OutreachStats {
  total: number
  not_contacted: number
  reached_out: number
  in_conversation: number
  partnership: number
  declined: number
  needs_follow_up: number
}

// ── Workers ─────────────────────────────────────────────────────

export type WorkerRunStatus = "running" | "completed" | "failed"
export type WorkerTriggerType = "cron" | "manual"

export interface WorkerRun {
  id: string
  worker_id: string
  status: WorkerRunStatus
  trigger_type: WorkerTriggerType
  started_at: string
  completed_at?: string
  output_summary?: string
  items_processed: number
  error_message?: string
}

export interface WorkerDef {
  id: string
  name: string
  description: string
  script: string
  cron: string
  enabled: boolean
}

// ── News ────────────────────────────────────────────────────────

export interface NewsItem {
  id: string
  title: string
  source: string
  url?: string
  published_at?: string
  relevance_score?: number
  summary?: string
  tags?: string[]
  is_saved: boolean
  is_read: boolean
  created_at: string
}

// ── Compliance Alerts ───────────────────────────────────────────

export type ComplianceAlertUrgency = "low" | "medium" | "high" | "critical"
export type ComplianceAlertStatus = "pending" | "acknowledged" | "action_needed" | "resolved"

export interface ComplianceAlert {
  id: string
  law_id: string
  law_name: string
  deadline_date: string
  description?: string
  urgency: ComplianceAlertUrgency
  status: ComplianceAlertStatus
  created_at: string
  updated_at: string
}

// ── Admin Stats ─────────────────────────────────────────────────

export interface AdminWorkerStats {
  total: number
  healthy: number
  failed: number
  idle: number
}

export interface AdminStats {
  outreach: OutreachStats
  news_unread: number
  deadlines_approaching: number
  workers: AdminWorkerStats
}

// ── Google Workspace ────────────────────────────────────────────

export interface GoogleConnectionStatus {
  connected: boolean
  email: string
  scopes: string[]
}

export interface GmailMessage {
  id: string
  thread_id: string
  from: string
  to: string[]
  subject: string
  snippet: string
  body_html?: string
  body_text?: string
  date: string
  labels: string[]
  has_attachments: boolean
}

export interface GmailListResponse {
  messages: GmailMessage[]
  next_page_token?: string
  total_estimate: number
}

export interface GmailSendResponse {
  id: string
  thread_id: string
}

export interface GoogleContact {
  resource_name: string
  name: string
  email?: string
  phone?: string
  org?: string
  title?: string
}

export interface ContactListResponse {
  contacts: GoogleContact[]
  next_page_token?: string
  total_people: number
}

export interface ContactSyncPreview {
  to_create: GoogleContact[]
  to_update: { contact: GoogleContact; existing_id: string }[]
  skipped: number
}

export interface ContactSyncResult {
  created: number
  updated: number
  skipped: number
  total: number
}

export interface CalendarEvent {
  id?: string
  summary: string
  description?: string
  location?: string
  start: string
  end: string
  attendees?: string[]
  html_link?: string
  status?: string
}

export interface CalendarListResponse {
  events: CalendarEvent[]
  next_page_token?: string
}

// ── Status Display Helpers ──────────────────────────────────────

export const OUTREACH_STATUS_META: Record<OutreachStatus, { label: string; color: string; dotColor: string }> = {
  not_contacted: { label: "Not Contacted", color: "bg-muted text-muted-foreground", dotColor: "bg-muted-foreground" },
  draft_ready: { label: "Draft Ready", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", dotColor: "bg-purple-500" },
  reached_out: { label: "Reached Out", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", dotColor: "bg-blue-500" },
  in_conversation: { label: "In Conversation", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", dotColor: "bg-amber-500" },
  partnership: { label: "Partnership", color: "bg-brand-green/10 text-brand-green", dotColor: "bg-brand-green" },
  declined: { label: "Declined", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", dotColor: "bg-red-500" },
}

export const EMAIL_STATUS_META: Record<EmailStatus, { label: string; color: string }> = {
  none: { label: "—", color: "text-muted-foreground" },
  draft_ready: { label: "Draft Ready", color: "text-purple-600 dark:text-purple-400" },
  emailed: { label: "Emailed", color: "text-blue-600 dark:text-blue-400" },
  awaiting_reply: { label: "Awaiting Reply", color: "text-amber-600 dark:text-amber-400" },
  replied: { label: "Replied", color: "text-brand-green" },
  bounced: { label: "Bounced", color: "text-red-600 dark:text-red-400" },
}

export const CONTACT_TYPE_LABELS: Record<OutreachContactType, string> = {
  advocacy: "Advocacy",
  tech_company: "Tech Companies",
  legislator: "Legislators",
  academic: "Academics",
  other: "Other",
}
