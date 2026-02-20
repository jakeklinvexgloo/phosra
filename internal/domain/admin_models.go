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
	ContactTypeOther       OutreachContactType = "other"
)

// OutreachStatus tracks pipeline position.
type OutreachStatus string

const (
	OutreachNotContacted  OutreachStatus = "not_contacted"
	OutreachReachedOut    OutreachStatus = "reached_out"
	OutreachInConversation OutreachStatus = "in_conversation"
	OutreachPartnership   OutreachStatus = "partnership"
	OutreachDeclined      OutreachStatus = "declined"
)

// OutreachContact represents a person in the outreach pipeline.
type OutreachContact struct {
	ID             uuid.UUID           `json:"id"`
	Name           string              `json:"name"`
	Org            string              `json:"org"`
	Title          string              `json:"title"`
	ContactType    OutreachContactType `json:"contact_type"`
	Email          string              `json:"email,omitempty"`
	LinkedinURL    string              `json:"linkedin_url,omitempty"`
	TwitterHandle  string              `json:"twitter_handle,omitempty"`
	Phone          string              `json:"phone,omitempty"`
	Status         OutreachStatus      `json:"status"`
	Notes          string              `json:"notes,omitempty"`
	RelevanceScore *int                `json:"relevance_score,omitempty"`
	Tags           []string            `json:"tags,omitempty"`
	LastContactAt  *time.Time          `json:"last_contact_at,omitempty"`
	NextFollowupAt *time.Time          `json:"next_followup_at,omitempty"`
	CreatedAt      time.Time           `json:"created_at"`
	UpdatedAt      time.Time           `json:"updated_at"`
}

// OutreachActivityType categorizes outreach activities.
type OutreachActivityType string

const (
	ActivityEmailSent       OutreachActivityType = "email_sent"
	ActivityLinkedInMessage OutreachActivityType = "linkedin_message"
	ActivityCall            OutreachActivityType = "call"
	ActivityMeeting         OutreachActivityType = "meeting"
	ActivityNote            OutreachActivityType = "note"
)

// OutreachActivity records a single touchpoint with a contact.
type OutreachActivity struct {
	ID           uuid.UUID            `json:"id"`
	ContactID    uuid.UUID            `json:"contact_id"`
	ActivityType OutreachActivityType `json:"activity_type"`
	Subject      string               `json:"subject,omitempty"`
	Body         string               `json:"body,omitempty"`
	CreatedAt    time.Time            `json:"created_at"`
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
