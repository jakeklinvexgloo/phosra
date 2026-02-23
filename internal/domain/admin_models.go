package domain

import (
	"time"

	"github.com/google/uuid"
)

// ── Outreach CRM ────────────────────────────────────────────────

// OutreachContactType categorizes outreach contacts.
type OutreachContactType string

const (
	ContactTypeAdvocacy    OutreachContactType = "advocacy"
	ContactTypeTechCompany OutreachContactType = "tech_company"
	ContactTypeLegislator  OutreachContactType = "legislator"
	ContactTypeAcademic    OutreachContactType = "academic"
	ContactTypeInvestor    OutreachContactType = "investor"
	ContactTypeThinkTank   OutreachContactType = "think_tank"
	ContactTypeOther       OutreachContactType = "other"
)

// OutreachStatus tracks pipeline position.
type OutreachStatus string

const (
	OutreachNotContacted  OutreachStatus = "not_contacted"
	OutreachDraftReady    OutreachStatus = "draft_ready"
	OutreachReachedOut    OutreachStatus = "reached_out"
	OutreachInConversation OutreachStatus = "in_conversation"
	OutreachPartnership   OutreachStatus = "partnership"
	OutreachDeclined      OutreachStatus = "declined"
)

// EmailStatus tracks per-contact email workflow.
type EmailStatus string

const (
	EmailNone         EmailStatus = "none"
	EmailDraftReady   EmailStatus = "draft_ready"
	EmailEmailed      EmailStatus = "emailed"
	EmailAwaitingReply EmailStatus = "awaiting_reply"
	EmailReplied      EmailStatus = "replied"
	EmailBounced      EmailStatus = "bounced"
)

// OutreachContact represents a person in the outreach pipeline.
type OutreachContact struct {
	ID             uuid.UUID           `json:"id"`
	Name           string              `json:"name"`
	Org            string              `json:"org"`
	Title          string              `json:"title"`
	ContactType    OutreachContactType `json:"contact_type"`
	Email          *string             `json:"email,omitempty"`
	LinkedinURL    *string             `json:"linkedin_url,omitempty"`
	TwitterHandle  *string             `json:"twitter_handle,omitempty"`
	Phone          *string             `json:"phone,omitempty"`
	Status         OutreachStatus      `json:"status"`
	Notes          *string             `json:"notes,omitempty"`
	RelevanceScore *int                `json:"relevance_score,omitempty"`
	Tags           []string            `json:"tags,omitempty"`
	EmailStatus    EmailStatus         `json:"email_status"`
	PriorityTier   int                 `json:"priority_tier"`
	LastContactAt  *time.Time          `json:"last_contact_at,omitempty"`
	NextFollowupAt *time.Time          `json:"next_followup_at,omitempty"`
	CreatedAt      time.Time           `json:"created_at"`
	UpdatedAt      time.Time           `json:"updated_at"`
}

// OutreachActivityType categorizes outreach activities.
type OutreachActivityType string

const (
	ActivityEmailSent        OutreachActivityType = "email_sent"
	ActivityLinkedInMessage  OutreachActivityType = "linkedin_message"
	ActivityCall             OutreachActivityType = "call"
	ActivityMeeting          OutreachActivityType = "meeting"
	ActivityNote             OutreachActivityType = "note"
	ActivityAutoFollowup     OutreachActivityType = "auto_followup_sent"
	ActivityIntentClassified OutreachActivityType = "intent_classified"
	ActivityMeetingProposed  OutreachActivityType = "meeting_proposed"
	ActivityEmailReceived    OutreachActivityType = "email_received"
)

// OutreachActivity records a single touchpoint with a contact.
type OutreachActivity struct {
	ID                   uuid.UUID            `json:"id"`
	ContactID            uuid.UUID            `json:"contact_id"`
	ActivityType         OutreachActivityType `json:"activity_type"`
	Subject              string               `json:"subject,omitempty"`
	Body                 string               `json:"body,omitempty"`
	IntentClassification *string              `json:"intent_classification,omitempty"`
	ConfidenceScore      *float64             `json:"confidence_score,omitempty"`
	CreatedAt            time.Time            `json:"created_at"`
}

// ── Outreach Autopilot ─────────────────────────────────────────

// SequenceStatus tracks the state of an outreach sequence.
type SequenceStatus string

const (
	SequenceActive    SequenceStatus = "active"
	SequencePaused    SequenceStatus = "paused"
	SequenceCompleted SequenceStatus = "completed"
	SequenceCancelled SequenceStatus = "cancelled"
)

// OutreachSequence tracks an automated email sequence for a contact.
type OutreachSequence struct {
	ID            uuid.UUID      `json:"id"`
	ContactID     uuid.UUID      `json:"contact_id"`
	Status        SequenceStatus `json:"status"`
	CurrentStep   int            `json:"current_step"`
	NextActionAt  *time.Time     `json:"next_action_at,omitempty"`
	LastSentAt    *time.Time     `json:"last_sent_at,omitempty"`
	GmailThreadID *string        `json:"gmail_thread_id,omitempty"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`

	// Joined fields (from contact)
	ContactName  string  `json:"contact_name,omitempty"`
	ContactOrg   string  `json:"contact_org,omitempty"`
	ContactEmail *string `json:"contact_email,omitempty"`
}

// PendingEmailStatus tracks approval workflow.
type PendingEmailStatus string

const (
	PendingReview  PendingEmailStatus = "pending_review"
	PendingApproved PendingEmailStatus = "approved"
	PendingRejected PendingEmailStatus = "rejected"
	PendingSent     PendingEmailStatus = "sent"
	PendingFailed   PendingEmailStatus = "failed"
)

// OutreachPendingEmail represents an email awaiting review/approval.
type OutreachPendingEmail struct {
	ID              uuid.UUID          `json:"id"`
	ContactID       uuid.UUID          `json:"contact_id"`
	SequenceID      *uuid.UUID         `json:"sequence_id,omitempty"`
	StepNumber      int                `json:"step_number"`
	ToEmail         string             `json:"to_email"`
	Subject         string             `json:"subject"`
	Body            string             `json:"body"`
	Status          PendingEmailStatus `json:"status"`
	GmailMessageID  *string            `json:"gmail_message_id,omitempty"`
	GenerationModel *string            `json:"generation_model,omitempty"`
	CreatedAt       time.Time          `json:"created_at"`
	UpdatedAt       time.Time          `json:"updated_at"`

	// Joined fields
	ContactName string `json:"contact_name,omitempty"`
	ContactOrg  string `json:"contact_org,omitempty"`
}

// OutreachConfig holds the autopilot configuration.
type OutreachConfig struct {
	AutopilotEnabled  bool   `json:"autopilot_enabled"`
	SenderName        string `json:"sender_name"`
	SenderTitle       string `json:"sender_title"`
	SenderEmail       string `json:"sender_email"`
	SenderPhone       string `json:"sender_phone"`
	SenderLinkedIn    string `json:"sender_linkedin"`
	CompanyBrief      string `json:"company_brief"`
	EmailSignature    string `json:"email_signature"`
	SendHourUTC       int    `json:"send_hour_utc"`
	MaxEmailsPerDay   int    `json:"max_emails_per_day"`
	FollowUpDelayDays int    `json:"follow_up_delay_days"`
	GoogleAccountKey  string `json:"google_account_key"`
	ActivePersona     string `json:"active_persona"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// AutopilotStats aggregates autopilot metrics for the dashboard.
type AutopilotStats struct {
	ActiveSequences int `json:"active_sequences"`
	PendingReview   int `json:"pending_review"`
	SentToday       int `json:"sent_today"`
	TotalReplies    int `json:"total_replies"`
	TotalMeetings   int `json:"total_meetings"`
}

// OutreachActivityWithContact is an activity joined with contact info.
type OutreachActivityWithContact struct {
	OutreachActivity
	ContactName string `json:"contact_name"`
	ContactOrg  string `json:"contact_org"`
}

// OutreachActivitySummary aggregates activity counts since a given timestamp.
type OutreachActivitySummary struct {
	EmailsDrafted    int `json:"emails_drafted"`
	EmailsSent       int `json:"emails_sent"`
	RepliesReceived  int `json:"replies_received"`
	MeetingsProposed int `json:"meetings_proposed"`
	NewInterested    int `json:"new_interested"`
}

// OutreachStats holds aggregate counts for the outreach pipeline.
type OutreachStats struct {
	Total           int `json:"total"`
	NotContacted    int `json:"not_contacted"`
	ReachedOut      int `json:"reached_out"`
	InConversation  int `json:"in_conversation"`
	Partnership     int `json:"partnership"`
	Declined        int `json:"declined"`
	NeedsFollowUp  int `json:"needs_follow_up"`
}

// ── Worker Runs ─────────────────────────────────────────────────

// WorkerRunStatus tracks the state of a worker execution.
type WorkerRunStatus string

const (
	WorkerRunning   WorkerRunStatus = "running"
	WorkerCompleted WorkerRunStatus = "completed"
	WorkerFailed    WorkerRunStatus = "failed"
)

// WorkerTriggerType indicates how a worker run was initiated.
type WorkerTriggerType string

const (
	TriggerCron   WorkerTriggerType = "cron"
	TriggerManual WorkerTriggerType = "manual"
)

// WorkerRun records a single execution of a worker.
type WorkerRun struct {
	ID             uuid.UUID         `json:"id"`
	WorkerID       string            `json:"worker_id"`
	Status         WorkerRunStatus   `json:"status"`
	TriggerType    WorkerTriggerType `json:"trigger_type"`
	StartedAt      time.Time         `json:"started_at"`
	CompletedAt    *time.Time        `json:"completed_at,omitempty"`
	OutputSummary  string            `json:"output_summary,omitempty"`
	ItemsProcessed int               `json:"items_processed"`
	ErrorMessage   string            `json:"error_message,omitempty"`
}

// ── News Feed ───────────────────────────────────────────────────

// NewsItem represents a single industry news entry.
type NewsItem struct {
	ID             uuid.UUID  `json:"id"`
	Title          string     `json:"title"`
	Source         string     `json:"source"`
	URL            string     `json:"url,omitempty"`
	PublishedAt    *time.Time `json:"published_at,omitempty"`
	RelevanceScore *int       `json:"relevance_score,omitempty"`
	Summary        string     `json:"summary,omitempty"`
	Tags           []string   `json:"tags,omitempty"`
	IsSaved        bool       `json:"is_saved"`
	IsRead         bool       `json:"is_read"`
	CreatedAt      time.Time  `json:"created_at"`
}

// ── Compliance Alerts ───────────────────────────────────────────

// ComplianceAlertUrgency indicates deadline proximity.
type ComplianceAlertUrgency string

const (
	UrgencyLow      ComplianceAlertUrgency = "low"
	UrgencyMedium   ComplianceAlertUrgency = "medium"
	UrgencyHigh     ComplianceAlertUrgency = "high"
	UrgencyCritical ComplianceAlertUrgency = "critical"
)

// ComplianceAlertStatus tracks resolution state.
type ComplianceAlertStatus string

const (
	AlertPending      ComplianceAlertStatus = "pending"
	AlertAcknowledged ComplianceAlertStatus = "acknowledged"
	AlertActionNeeded ComplianceAlertStatus = "action_needed"
	AlertResolved     ComplianceAlertStatus = "resolved"
)

// ComplianceAlert tracks an upcoming compliance deadline.
type ComplianceAlert struct {
	ID           uuid.UUID              `json:"id"`
	LawID        string                 `json:"law_id"`
	LawName      string                 `json:"law_name"`
	DeadlineDate time.Time              `json:"deadline_date"`
	Description  string                 `json:"description,omitempty"`
	Urgency      ComplianceAlertUrgency `json:"urgency"`
	Status       ComplianceAlertStatus  `json:"status"`
	CreatedAt    time.Time              `json:"created_at"`
	UpdatedAt    time.Time              `json:"updated_at"`
}

// ── Admin Dashboard Stats ───────────────────────────────────────

// AdminStats aggregates metrics for the admin command center.
type AdminStats struct {
	Outreach   OutreachStats     `json:"outreach"`
	NewsUnread int               `json:"news_unread"`
	Deadlines  int               `json:"deadlines_approaching"`
	Workers    AdminWorkerStats  `json:"workers"`
}

// AdminWorkerStats summarizes worker health.
type AdminWorkerStats struct {
	Total   int `json:"total"`
	Healthy int `json:"healthy"`
	Failed  int `json:"failed"`
	Idle    int `json:"idle"`
}
