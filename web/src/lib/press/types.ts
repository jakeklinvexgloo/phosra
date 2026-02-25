export type PressReleaseStatus =
  | "idea" | "draft" | "in_review" | "approved"
  | "scheduled" | "distributed" | "archived"

export type ReleaseType =
  | "product_launch" | "partnership" | "funding" | "executive_hire"
  | "regulatory" | "research" | "event" | "expansion" | "milestone" | "other"

export const RELEASE_TYPE_LABELS: Record<ReleaseType, string> = {
  product_launch: "Product Launch",
  partnership: "Partnership",
  funding: "Funding",
  executive_hire: "Executive Hire",
  regulatory: "Regulatory",
  research: "Research",
  event: "Event",
  expansion: "Expansion",
  milestone: "Milestone",
  other: "Other",
}

export const STATUS_LABELS: Record<PressReleaseStatus, string> = {
  idea: "Idea",
  draft: "Draft",
  in_review: "In Review",
  approved: "Approved",
  scheduled: "Scheduled",
  distributed: "Distributed",
  archived: "Archived",
}

export const STATUS_COLORS: Record<PressReleaseStatus, string> = {
  idea: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  draft: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  in_review: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  approved: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  scheduled: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  distributed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  archived: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500",
}

export interface PressReleaseQuote {
  text: string
  attribution: string
}

export interface DraftInputs {
  release_type?: string
  key_message?: string
  product_name?: string
  audience?: string
  quote_attribution?: string
  additional_context?: string
}

export interface RevisionEntry {
  version: number
  timestamp: string
  action: "ai_draft" | "feedback_redraft" | "manual_edit"
  feedback?: string
  snapshot: { headline: string; body: string; quotes: PressReleaseQuote[] }
}

export interface PressRelease {
  [key: string]: unknown
  id: string
  title: string
  subtitle: string
  slug: string
  status: PressReleaseStatus
  release_type: ReleaseType
  dateline_city: string
  dateline_state: string
  publish_date: string | null
  embargo_date: string | null
  headline: string
  body: string
  quotes: PressReleaseQuote[]
  boilerplate: string
  contact_name: string
  contact_email: string
  contact_phone: string
  draft_inputs: DraftInputs
  revision_history: RevisionEntry[]
  notes: string
  word_count: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface PressStats {
  total: number
  drafts: number
  scheduled: number
  distributed: number
}
