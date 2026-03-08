package domain

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// BrowserEnforcementJobStatus tracks the state of a browser enforcement job.
type BrowserEnforcementJobStatus string

const (
	BrowserEnforcementPending   BrowserEnforcementJobStatus = "pending"
	BrowserEnforcementRunning   BrowserEnforcementJobStatus = "running"
	BrowserEnforcementCompleted BrowserEnforcementJobStatus = "completed"
	BrowserEnforcementFailed    BrowserEnforcementJobStatus = "failed"
	BrowserEnforcementCancelled BrowserEnforcementJobStatus = "cancelled"
)

// BrowserEnforcementJob represents a browser-based enforcement operation.
type BrowserEnforcementJob struct {
	ID              uuid.UUID                   `json:"id" db:"id"`
	FamilyID        uuid.UUID                   `json:"family_id" db:"family_id"`
	ChildID         *uuid.UUID                  `json:"child_id,omitempty" db:"child_id"`
	ChildName       string                      `json:"child_name" db:"child_name"`
	ChildAge        int                         `json:"child_age" db:"child_age"`
	PlatformID      string                      `json:"platform_id" db:"platform_id"`
	Rules           json.RawMessage             `json:"rules" db:"rules"`
	Status          BrowserEnforcementJobStatus `json:"status" db:"status"`
	Result          *json.RawMessage            `json:"result,omitempty" db:"result"`
	ErrorMessage    *string                     `json:"error_message,omitempty" db:"error_message"`
	Screenshots     json.RawMessage             `json:"screenshots" db:"screenshots"`
	DeploymentModel string                      `json:"deployment_model" db:"deployment_model"`
	StartedAt       *time.Time                  `json:"started_at,omitempty" db:"started_at"`
	CompletedAt     *time.Time                  `json:"completed_at,omitempty" db:"completed_at"`
	DurationMs      *int                        `json:"duration_ms,omitempty" db:"duration_ms"`
	CreatedAt       time.Time                   `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time                   `json:"updated_at" db:"updated_at"`
}

// CreateBrowserEnforcementJobRequest is the API request to create a browser enforcement job.
type CreateBrowserEnforcementJobRequest struct {
	PlatformID string          `json:"platform_id"`
	ChildName  string          `json:"child_name"`
	ChildAge   int             `json:"child_age"`
	Rules      json.RawMessage `json:"rules,omitempty"`
}

// BrowserEnforcementAuditEntry records a single action within a browser enforcement job.
type BrowserEnforcementAuditEntry struct {
	ID             uuid.UUID        `json:"id" db:"id"`
	JobID          uuid.UUID        `json:"job_id" db:"job_id"`
	Action         string           `json:"action" db:"action"`
	RuleCategory   *string          `json:"rule_category,omitempty" db:"rule_category"`
	Status         string           `json:"status" db:"status"`
	Details        *json.RawMessage `json:"details,omitempty" db:"details"`
	ScreenshotPath *string          `json:"screenshot_path,omitempty" db:"screenshot_path"`
	CreatedAt      time.Time        `json:"created_at" db:"created_at"`
}
