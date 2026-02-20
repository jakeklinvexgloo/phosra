// ── Admin Dashboard Types ───────────────────────────────────────

export type OutreachContactType = "advocacy" | "tech_company" | "legislator" | "academic" | "other"
export type OutreachStatus = "not_contacted" | "reached_out" | "in_conversation" | "partnership" | "declined"
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

// ── Status Display Helpers ──────────────────────────────────────

export const OUTREACH_STATUS_META: Record<OutreachStatus, { label: string; color: string; dotColor: string }> = {
  not_contacted: { label: "Not Contacted", color: "bg-muted text-muted-foreground", dotColor: "bg-muted-foreground" },
  reached_out: { label: "Reached Out", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", dotColor: "bg-blue-500" },
  in_conversation: { label: "In Conversation", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", dotColor: "bg-amber-500" },
  partnership: { label: "Partnership", color: "bg-brand-green/10 text-brand-green", dotColor: "bg-brand-green" },
  declined: { label: "Declined", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", dotColor: "bg-red-500" },
}

export const CONTACT_TYPE_LABELS: Record<OutreachContactType, string> = {
  advocacy: "Advocacy",
  tech_company: "Tech Companies",
  legislator: "Legislators",
  academic: "Academics",
  other: "Other",
}
