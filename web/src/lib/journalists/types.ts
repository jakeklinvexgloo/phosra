// ─── Journalist CRM Types ────────────────────────────────────────────────────

export type JournalistBeat =
  | "child_safety"
  | "tech_policy"
  | "privacy"
  | "edtech"
  | "parenting"
  | "cybersecurity"
  | "startup"
  | "regulation"
  | "social_media"
  | "ai_ethics"
  | "other"

export type JournalistRelationshipStatus =
  | "identified"
  | "researching"
  | "pitched"
  | "in_dialogue"
  | "warm_contact"
  | "champion"
  | "inactive"

export type PitchStatus =
  | "draft"
  | "ready"
  | "sent"
  | "opened"
  | "replied"
  | "interested"
  | "declined"
  | "covered"
  | "no_response"

export type CoverageTone = "positive" | "neutral" | "negative" | "mixed"

export type PhosraProminence = "primary_subject" | "featured" | "mentioned" | "brief_mention"

export type JournalistActivityType =
  | "pitch_sent"
  | "follow_up_sent"
  | "reply_received"
  | "phone_call"
  | "meeting"
  | "dm_sent"
  | "dm_received"
  | "coverage_published"
  | "note"
  | "status_change"

export type JournalistTier = 1 | 2 | 3

export type EmailConfidence = "verified" | "pattern_guess" | "unknown" | "bounced"

export type PublicationStatus = "active" | "moved" | "unknown" | "freelance"

export type WarmupStage = "none" | "following" | "engaging" | "dm_sent" | "ready_to_pitch"

export type ArticleSource = "manual" | "rss" | "ai_research" | "web_search"

export type SocialPlatform = "twitter" | "bluesky" | "mastodon" | "linkedin" | "threads"

export type PitchEventType = "open" | "click" | "bounce" | "reply" | "forward"

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface PitchAngle {
  angle: string
  context: string
  relevance: string
  press_release_id?: string
}

export interface RecentArticle {
  title: string
  url: string
  date: string
  relevance_note: string
}

export interface CoveragePreferences {
  prefers_exclusive?: boolean
  preferred_contact_method?: string
  timezone?: string
  deadlines_note?: string
}

export interface PreviousPublication {
  publication: string
  title?: string
  from?: string
  to?: string
}

export interface JournalistArticle {
  id: string
  journalist_id: string
  title: string
  url: string
  published_at: string | null
  summary: string | null
  is_relevant: boolean
  relevance_score: number | null
  relevance_reason: string | null
  source: ArticleSource
  created_at: string
}

export interface JournalistPitchEvent {
  id: string
  pitch_id: string
  event_type: PitchEventType
  event_timestamp: string
  ip_address: string | null
  user_agent: string | null
  link_url: string | null
  metadata: Record<string, unknown> | null
}

export interface JournalistSocialPost {
  id: string
  journalist_id: string
  platform: SocialPlatform
  post_url: string | null
  content: string | null
  posted_at: string | null
  is_relevant: boolean
  engagement_count: number
  created_at: string
}

export interface Journalist {
  id: string
  name: string
  publication: string
  title: string | null
  beat: JournalistBeat | null
  sub_beats: string[]
  email: string | null
  twitter_handle: string | null
  linkedin_url: string | null
  signal_handle: string | null
  phone: string | null
  relevance_score: number | null
  tier: JournalistTier
  relationship_status: JournalistRelationshipStatus
  pitch_angles: PitchAngle[]
  recent_articles: RecentArticle[]
  coverage_preferences: CoveragePreferences
  notes: string | null
  last_contact_at: string | null
  next_followup_at: string | null
  // New enrichment fields
  bluesky_handle: string | null
  mastodon_handle: string | null
  personal_site_url: string | null
  newsletter_url: string | null
  podcast_name: string | null
  photo_url: string | null
  location: string | null
  estimated_audience_size: number | null
  publication_domain_authority: number | null
  email_confidence: EmailConfidence
  email_source: string | null
  previous_publications: PreviousPublication[]
  publication_verified_at: string | null
  publication_status: PublicationStatus
  tags: string[]
  ai_research_summary: string | null
  last_researched_at: string | null
  warmup_stage: WarmupStage
  created_at: string
  updated_at: string
}

export interface JournalistPitch {
  id: string
  journalist_id: string
  press_release_id: string
  pitch_status: PitchStatus
  offered_exclusive: boolean
  exclusive_deadline: string | null
  embargo_agreed: boolean
  embargo_date: string | null
  pitch_subject: string | null
  pitch_body: string | null
  pitch_angle: string | null
  gmail_thread_id: string | null
  gmail_message_id: string | null
  follow_up_count: number
  last_follow_up_at: string | null
  next_follow_up_at: string | null
  coverage_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Joined fields (optional, populated by queries)
  journalist_name?: string
  journalist_publication?: string
  press_release_title?: string
}

export interface PressCoverage {
  id: string
  journalist_id: string
  press_release_id: string | null
  pitch_id: string | null
  article_title: string
  article_url: string
  publication: string
  published_at: string
  tone: CoverageTone
  phosra_prominence: PhosraProminence
  quotes_used: { quote: string; attributed_to: string }[]
  key_messages_included: string[]
  estimated_reach: number | null
  domain_authority: number | null
  notes: string | null
  created_at: string
  updated_at: string
  // Joined fields (optional)
  journalist_name?: string
  press_release_title?: string
}

export interface JournalistActivity {
  id: string
  journalist_id: string
  pitch_id: string | null
  activity_type: JournalistActivityType
  subject: string | null
  body: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface JournalistStats {
  total: number
  by_tier: { tier1: number; tier2: number; tier3: number }
  by_status: Record<JournalistRelationshipStatus, number>
  pitched: number       // total journalists who have been pitched at least once
  responded: number     // journalists who replied or showed interest
  covered: number       // journalists who published coverage
}

export interface PitchStats {
  total: number
  by_status: Record<PitchStatus, number>
  response_rate: number   // (replied + interested + covered) / (sent + opened + replied + interested + declined + covered + no_response)
  coverage_rate: number   // covered / total sent+
}

// ─── Labels & Display ────────────────────────────────────────────────────────

export const RELATIONSHIP_STATUS_LABELS: Record<JournalistRelationshipStatus, string> = {
  identified: "Identified",
  researching: "Researching",
  pitched: "Pitched",
  in_dialogue: "In Dialogue",
  warm_contact: "Warm Contact",
  champion: "Champion",
  inactive: "Inactive",
}

export const PITCH_STATUS_LABELS: Record<PitchStatus, string> = {
  draft: "Draft",
  ready: "Ready",
  sent: "Sent",
  opened: "Opened",
  replied: "Replied",
  interested: "Interested",
  declined: "Declined",
  covered: "Covered",
  no_response: "No Response",
}

export const TONE_LABELS: Record<CoverageTone, string> = {
  positive: "Positive",
  neutral: "Neutral",
  negative: "Negative",
  mixed: "Mixed",
}

export const PROMINENCE_LABELS: Record<PhosraProminence, string> = {
  primary_subject: "Primary Subject",
  featured: "Featured",
  mentioned: "Mentioned",
  brief_mention: "Brief Mention",
}

export const BEAT_LABELS: Record<JournalistBeat, string> = {
  child_safety: "Child Safety",
  tech_policy: "Tech Policy",
  privacy: "Privacy",
  edtech: "EdTech",
  parenting: "Parenting",
  cybersecurity: "Cybersecurity",
  startup: "Startups",
  regulation: "Regulation",
  social_media: "Social Media",
  ai_ethics: "AI Ethics",
  other: "Other",
}

export const ACTIVITY_TYPE_LABELS: Record<JournalistActivityType, string> = {
  pitch_sent: "Pitch Sent",
  follow_up_sent: "Follow-up Sent",
  reply_received: "Reply Received",
  phone_call: "Phone Call",
  meeting: "Meeting",
  dm_sent: "DM Sent",
  dm_received: "DM Received",
  coverage_published: "Coverage Published",
  note: "Note",
  status_change: "Status Change",
}

export const EMAIL_CONFIDENCE_LABELS: Record<EmailConfidence, string> = {
  verified: "Verified",
  pattern_guess: "Pattern Guess",
  unknown: "Unknown",
  bounced: "Bounced",
}

export const WARMUP_STAGE_LABELS: Record<WarmupStage, string> = {
  none: "Not Started",
  following: "Following",
  engaging: "Engaging",
  dm_sent: "DM Sent",
  ready_to_pitch: "Ready to Pitch",
}

export const PUBLICATION_STATUS_LABELS: Record<PublicationStatus, string> = {
  active: "Active",
  moved: "Moved",
  unknown: "Unknown",
  freelance: "Freelance",
}
