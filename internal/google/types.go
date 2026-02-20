package google

import "time"

// ── Gmail Types ─────────────────────────────────────────────────

// GmailMessage represents a single Gmail message.
type GmailMessage struct {
	ID            string   `json:"id"`
	ThreadID      string   `json:"thread_id"`
	From          string   `json:"from"`
	To            []string `json:"to"`
	Subject       string   `json:"subject"`
	Snippet       string   `json:"snippet"`
	BodyHTML      string   `json:"body_html,omitempty"`
	BodyText      string   `json:"body_text,omitempty"`
	Date          string   `json:"date"`
	LabelIDs      []string `json:"labels"`
	HasAttachments bool    `json:"has_attachments"`
}

// GmailListResponse wraps a page of Gmail messages.
type GmailListResponse struct {
	Messages       []GmailMessage `json:"messages"`
	NextPageToken  string         `json:"next_page_token,omitempty"`
	TotalEstimate  int            `json:"total_estimate"`
}

// GmailSendResponse returned after sending a message.
type GmailSendResponse struct {
	ID       string `json:"id"`
	ThreadID string `json:"thread_id"`
}

// ── Google Contacts Types ───────────────────────────────────────

// GoogleContact represents a person from the People API.
type GoogleContact struct {
	ResourceName string `json:"resource_name"`
	Name         string `json:"name"`
	Email        string `json:"email,omitempty"`
	Phone        string `json:"phone,omitempty"`
	Org          string `json:"org,omitempty"`
	Title        string `json:"title,omitempty"`
}

// ContactListResponse wraps a page of contacts.
type ContactListResponse struct {
	Contacts      []GoogleContact `json:"contacts"`
	NextPageToken string          `json:"next_page_token,omitempty"`
	TotalPeople   int             `json:"total_people"`
}

// ContactSyncPreview shows what would happen during a sync.
type ContactSyncPreview struct {
	ToCreate []GoogleContact `json:"to_create"`
	ToUpdate []struct {
		Contact    GoogleContact `json:"contact"`
		ExistingID string       `json:"existing_id"`
	} `json:"to_update"`
	Skipped int `json:"skipped"`
}

// ── Calendar Types ──────────────────────────────────────────────

// CalendarEvent represents a Google Calendar event.
type CalendarEvent struct {
	ID          string    `json:"id,omitempty"`
	Summary     string    `json:"summary"`
	Description string    `json:"description,omitempty"`
	Location    string    `json:"location,omitempty"`
	Start       time.Time `json:"start"`
	End         time.Time `json:"end"`
	Attendees   []string  `json:"attendees,omitempty"`
	HtmlLink    string    `json:"html_link,omitempty"`
	Status      string    `json:"status,omitempty"`
}

// CalendarListResponse wraps a page of calendar events.
type CalendarListResponse struct {
	Events        []CalendarEvent `json:"events"`
	NextPageToken string          `json:"next_page_token,omitempty"`
}

// ── Token Types ─────────────────────────────────────────────────

// GoogleTokens holds encrypted OAuth tokens.
type GoogleTokens struct {
	AccountKey            string    `json:"account_key"`
	GoogleEmail           string    `json:"google_email"`
	AccessTokenEncrypted  string    `json:"-"`
	RefreshTokenEncrypted string    `json:"-"`
	TokenExpiry           time.Time `json:"token_expiry"`
	Scopes                []string  `json:"scopes"`
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt             time.Time `json:"updated_at"`
}
