// ── Admin Dashboard Types ───────────────────────────────────────

export type OutreachContactType = "advocacy" | "tech_company" | "legislator" | "academic" | "investor" | "think_tank" | "other"
export type OutreachStatus = "not_contacted" | "draft_ready" | "reached_out" | "in_conversation" | "partnership" | "declined"
export type EmailStatus = "none" | "draft_ready" | "emailed" | "awaiting_reply" | "replied" | "bounced"
export type OutreachActivityType = "email_sent" | "linkedin_message" | "call" | "meeting" | "note" | "auto_followup_sent" | "intent_classified" | "meeting_proposed" | "email_received"

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
  intent_classification?: string
  confidence_score?: number
  created_at: string
}

// ── Outreach Autopilot ─────────────────────────────────────────

export type SequenceStatus = "active" | "paused" | "completed" | "cancelled"
export type PendingEmailStatus = "pending_review" | "approved" | "rejected" | "sent" | "failed"

export interface OutreachSequence {
  id: string
  contact_id: string
  status: SequenceStatus
  current_step: number
  next_action_at?: string
  last_sent_at?: string
  gmail_thread_id?: string
  created_at: string
  updated_at: string
  contact_name?: string
  contact_org?: string
  contact_email?: string
}

export interface OutreachPendingEmail {
  id: string
  contact_id: string
  sequence_id?: string
  step_number: number
  to_email: string
  subject: string
  body: string
  status: PendingEmailStatus
  gmail_message_id?: string
  generation_model?: string
  google_account_key?: string
  created_at: string
  updated_at: string
  contact_name?: string
  contact_org?: string
}

export interface OutreachConfig {
  autopilot_enabled: boolean
  sender_name: string
  sender_title: string
  sender_email: string
  sender_phone: string
  sender_linkedin: string
  company_brief: string
  email_signature: string
  send_hour_utc: number
  max_emails_per_day: number
  follow_up_delay_days: number
  google_account_key: string
  active_persona: string
  created_at: string
  updated_at: string
}

export interface AutopilotStats {
  active_sequences: number
  pending_review: number
  sent_today: number
  total_replies: number
  total_meetings: number
}

export interface OutreachActivityWithContact extends OutreachActivity {
  contact_name: string
  contact_org: string
}

export interface OutreachActivitySummary {
  emails_drafted: number
  emails_sent: number
  replies_received: number
  meetings_proposed: number
  new_interested: number
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

export interface GoogleAccountInfo {
  account_key: string
  email: string
  connected: boolean
}

export interface PersonaAccountMapping {
  persona_key: string
  google_account_key: string
  calendar_account_key: string
  display_name: string
  sender_email: string
  created_at: string
  updated_at: string
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

// ── Pitch Coaching ─────────────────────────────────────────────

export type PitchPersona = "investor" | "partner" | "legislator"
export type PitchSessionStatus = "configuring" | "active" | "processing" | "completed" | "failed"

export interface PitchSession {
  id: string
  user_id: string
  persona: PitchPersona
  persona_config: Record<string, unknown>
  status: PitchSessionStatus
  started_at?: string
  ended_at?: string
  duration_seconds?: number
  recording_path?: string
  recording_size_bytes?: number
  transcript?: TranscriptEntry[]
  feedback?: PitchFeedback
  overall_score?: number
  created_at: string
  updated_at: string
  metrics?: PitchSessionMetrics
}

export interface TranscriptEntry {
  speaker: "user" | "ai"
  text: string
  start_ms?: number
  end_ms?: number
}

export interface PitchFeedback {
  summary: string
  strengths: string[]
  improvements: string[]
  specific_moments: FeedbackMoment[]
  recommended_practice: string
}

export interface FeedbackMoment {
  timestamp_ms: number
  note: string
}

export interface PitchSessionMetrics {
  id: string
  session_id: string
  filler_word_count: number
  filler_words: string[]
  words_per_minute?: number
  silence_percentage?: number
  clarity_score?: number
  persuasion_score?: number
  confidence_score?: number
  structure_score?: number
  emotion_data?: EmotionAnalysis | null
  dominant_emotions?: EmotionDimension[] | null
  created_at: string
}

// ── Emotion Analysis (Hume AI) ──────────────────────────────────

export interface EmotionDimension {
  name: string
  score: number
}

export interface EmotionFrame {
  start_ms: number
  end_ms: number
  emotions: EmotionDimension[]
}

export interface EmotionAnalysis {
  frames: EmotionFrame[]
  dominant_emotions: EmotionDimension[]
  confidence_avg: number
  confidence_min: number
  confidence_min_ms: number
  enthusiasm_avg: number
  nervousness_avg: number
  nervousness_peaks: number[]
  calm_avg: number
}

// ── Pitch Difficulty & Scenario Config ──────────────────────────

export type PitchDifficulty = "easy" | "medium" | "hard"
export type PitchScenario = "cold_pitch" | "warm_intro" | "board_update" | "committee_hearing" | "partnership_negotiation"

export interface PitchPersonaConfig {
  difficulty?: PitchDifficulty
  scenario?: PitchScenario
  custom_context?: string
  focus_areas?: string[]
}

export const DIFFICULTY_META: Record<PitchDifficulty, { label: string; description: string; color: string }> = {
  easy: {
    label: "Easy",
    description: "Friendly and encouraging, softball questions",
    color: "text-brand-green",
  },
  medium: {
    label: "Medium",
    description: "Interested but probing, standard due diligence",
    color: "text-amber-500",
  },
  hard: {
    label: "Hard",
    description: "Skeptical, interrupts, pushes back hard",
    color: "text-red-500",
  },
}

export const SCENARIO_META: Record<PitchScenario, { label: string; description: string }> = {
  cold_pitch: {
    label: "Cold Pitch",
    description: "First meeting — they don't know you or your product",
  },
  warm_intro: {
    label: "Warm Introduction",
    description: "Introduced through a mutual connection, some context already shared",
  },
  board_update: {
    label: "Board Update",
    description: "Presenting to existing investors or board members on progress",
  },
  committee_hearing: {
    label: "Committee Hearing",
    description: "Formal legislative setting with multiple questioners",
  },
  partnership_negotiation: {
    label: "Partnership Negotiation",
    description: "Discussing specific terms and integration details",
  },
}

export const PERSONA_META: Record<PitchPersona, {
  label: string
  description: string
  icon: string
  bgColor: string
  textColor: string
}> = {
  investor: {
    label: "VC Investor",
    description: "Series A partner evaluating market size, unit economics, team, and competitive moat",
    icon: "💰",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    textColor: "text-emerald-700 dark:text-emerald-300",
  },
  partner: {
    label: "Tech Partner",
    description: "VP of Trust & Safety evaluating API integration, reliability, compliance coverage",
    icon: "🤝",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-700 dark:text-blue-300",
  },
  legislator: {
    label: "Legislator",
    description: "US Senator on Commerce Committee focused on child safety enforcement gaps",
    icon: "🏛️",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-700 dark:text-purple-300",
  },
}

export const PITCH_STATUS_META: Record<PitchSessionStatus, { label: string; color: string }> = {
  configuring: { label: "Setting Up", color: "text-muted-foreground" },
  active: { label: "In Progress", color: "text-blue-600 dark:text-blue-400" },
  processing: { label: "Generating Feedback", color: "text-amber-600 dark:text-amber-400" },
  completed: { label: "Completed", color: "text-brand-green" },
  failed: { label: "Failed", color: "text-destructive" },
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
  investor: "Investors",
  think_tank: "Think Tanks",
  other: "Other",
}
