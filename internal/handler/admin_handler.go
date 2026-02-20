package handler

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"

	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/google"
	"github.com/guardiangate/api/internal/repository/postgres"
	"github.com/guardiangate/api/pkg/httputil"
)

// AdminHandler serves the admin dashboard API endpoints.
type AdminHandler struct {
	outreach *postgres.AdminOutreachRepo
	workers  *postgres.AdminWorkerRepo
	news     *postgres.AdminNewsRepo
	alerts   *postgres.AdminAlertsRepo
	google   *google.Client // nil when Google is not configured
}

func NewAdminHandler(outreach *postgres.AdminOutreachRepo, workers *postgres.AdminWorkerRepo, news *postgres.AdminNewsRepo, alerts *postgres.AdminAlertsRepo, googleClient *google.Client) *AdminHandler {
	return &AdminHandler{outreach: outreach, workers: workers, news: news, alerts: alerts, google: googleClient}
}

// ── Stats ───────────────────────────────────────────────────────

func (h *AdminHandler) GetStats(w http.ResponseWriter, r *http.Request) {
	outreachStats, err := h.outreach.Stats(r.Context())
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to get outreach stats")
		return
	}

	newsUnread, err := h.workers.CountNewsUnread(r.Context())
	if err != nil {
		// Non-fatal: table may be empty
		newsUnread = 0
	}

	deadlines, err := h.workers.CountApproachingDeadlines(r.Context())
	if err != nil {
		deadlines = 0
	}

	latestRuns, err := h.workers.LatestRunPerWorker(r.Context())
	if err != nil {
		latestRuns = make(map[string]*domain.WorkerRun)
	}

	var healthy, failed, idle int
	workerIDs := []string{
		"legislation-monitor", "outreach-tracker", "news-monitor",
		"competitive-intel", "compliance-alerter", "provider-api-monitor",
	}
	for _, wid := range workerIDs {
		run, ok := latestRuns[wid]
		if !ok {
			idle++
			continue
		}
		switch run.Status {
		case domain.WorkerFailed:
			failed++
		case domain.WorkerRunning:
			healthy++
		case domain.WorkerCompleted:
			healthy++
		default:
			idle++
		}
	}

	stats := domain.AdminStats{
		Outreach:   *outreachStats,
		NewsUnread: newsUnread,
		Deadlines:  deadlines,
		Workers: domain.AdminWorkerStats{
			Total:   len(workerIDs),
			Healthy: healthy,
			Failed:  failed,
			Idle:    idle,
		},
	}

	httputil.JSON(w, http.StatusOK, stats)
}

// ── Outreach ────────────────────────────────────────────────────

func (h *AdminHandler) ListOutreach(w http.ResponseWriter, r *http.Request) {
	contactType := r.URL.Query().Get("type")
	status := r.URL.Query().Get("status")

	contacts, err := h.outreach.List(r.Context(), contactType, status)
	if err != nil {
		log.Error().Err(err).Msg("failed to list outreach contacts")
		httputil.Error(w, http.StatusInternalServerError, "failed to list contacts")
		return
	}
	if contacts == nil {
		contacts = []domain.OutreachContact{}
	}
	httputil.JSON(w, http.StatusOK, contacts)
}

func (h *AdminHandler) GetOutreachContact(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "contactID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid contact ID")
		return
	}
	contact, err := h.outreach.GetByID(r.Context(), id)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to get contact")
		return
	}
	if contact == nil {
		httputil.Error(w, http.StatusNotFound, "contact not found")
		return
	}

	// Include activities
	activities, _ := h.outreach.ListActivities(r.Context(), id)
	if activities == nil {
		activities = []domain.OutreachActivity{}
	}

	httputil.JSON(w, http.StatusOK, struct {
		*domain.OutreachContact
		Activities []domain.OutreachActivity `json:"activities"`
	}{contact, activities})
}

func (h *AdminHandler) UpdateOutreach(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "contactID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid contact ID")
		return
	}

	var req struct {
		Status         *string    `json:"status"`
		Notes          *string    `json:"notes"`
		EmailStatus    *string    `json:"email_status"`
		PriorityTier   *int       `json:"priority_tier"`
		LastContactAt  *time.Time `json:"last_contact_at"`
		NextFollowupAt *time.Time `json:"next_followup_at"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	contact, err := h.outreach.GetByID(r.Context(), id)
	if err != nil || contact == nil {
		httputil.Error(w, http.StatusNotFound, "contact not found")
		return
	}

	if req.Status != nil {
		contact.Status = domain.OutreachStatus(*req.Status)
	}
	if req.Notes != nil {
		contact.Notes = req.Notes
	}
	if req.EmailStatus != nil {
		contact.EmailStatus = domain.EmailStatus(*req.EmailStatus)
	}
	if req.PriorityTier != nil {
		contact.PriorityTier = *req.PriorityTier
	}
	if req.LastContactAt != nil {
		contact.LastContactAt = req.LastContactAt
	}
	if req.NextFollowupAt != nil {
		contact.NextFollowupAt = req.NextFollowupAt
	}

	if err := h.outreach.Update(r.Context(), contact); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to update contact")
		return
	}
	httputil.JSON(w, http.StatusOK, contact)
}

func (h *AdminHandler) CreateOutreachActivity(w http.ResponseWriter, r *http.Request) {
	contactID, err := uuid.Parse(chi.URLParam(r, "contactID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid contact ID")
		return
	}

	var req struct {
		ActivityType string `json:"activity_type"`
		Subject      string `json:"subject"`
		Body         string `json:"body"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	activity := &domain.OutreachActivity{
		ContactID:    contactID,
		ActivityType: domain.OutreachActivityType(req.ActivityType),
		Subject:      req.Subject,
		Body:         req.Body,
	}
	if err := h.outreach.CreateActivity(r.Context(), activity); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to create activity")
		return
	}
	httputil.Created(w, activity)
}

// ── Workers ─────────────────────────────────────────────────────

func (h *AdminHandler) ListWorkers(w http.ResponseWriter, r *http.Request) {
	latestRuns, err := h.workers.LatestRunPerWorker(r.Context())
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to list workers")
		return
	}
	httputil.JSON(w, http.StatusOK, latestRuns)
}

func (h *AdminHandler) ListWorkerRuns(w http.ResponseWriter, r *http.Request) {
	workerID := chi.URLParam(r, "workerID")
	runs, err := h.workers.ListRuns(r.Context(), workerID, 20)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to list worker runs")
		return
	}
	if runs == nil {
		runs = []domain.WorkerRun{}
	}
	httputil.JSON(w, http.StatusOK, runs)
}

// workerScripts maps worker IDs to their script paths (relative to repo root).
var workerScripts = map[string]string{
	"legislation-monitor":  "scripts/legislation-scanner.mjs",
	"outreach-tracker":     "scripts/workers/outreach-tracker.mjs",
	"news-monitor":         "scripts/workers/news-monitor.mjs",
	"competitive-intel":    "scripts/workers/competitive-intel.mjs",
	"compliance-alerter":   "scripts/workers/compliance-alerter.mjs",
	"provider-api-monitor": "scripts/workers/provider-api-monitor.mjs",
}

func (h *AdminHandler) TriggerWorker(w http.ResponseWriter, r *http.Request) {
	workerID := chi.URLParam(r, "workerID")

	scriptPath, ok := workerScripts[workerID]
	if !ok {
		httputil.Error(w, http.StatusBadRequest, "unknown worker: "+workerID)
		return
	}

	run := &domain.WorkerRun{
		WorkerID:    workerID,
		Status:      domain.WorkerRunning,
		TriggerType: domain.TriggerManual,
	}
	if err := h.workers.CreateRun(r.Context(), run); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to create worker run")
		return
	}

	// Spawn the worker script in a background goroutine.
	go h.executeWorker(run.ID, workerID, scriptPath)

	httputil.Created(w, run)
}

// executeWorker runs the Node.js worker script as a subprocess and records the result.
func (h *AdminHandler) executeWorker(runID uuid.UUID, workerID, scriptPath string) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	// Resolve script path relative to working directory
	absPath, err := filepath.Abs(scriptPath)
	if err != nil {
		h.completeWorkerRun(runID, domain.WorkerFailed, "", 0, "failed to resolve script path: "+err.Error())
		return
	}

	if _, err := os.Stat(absPath); os.IsNotExist(err) {
		h.completeWorkerRun(runID, domain.WorkerFailed, "", 0, "script not found: "+scriptPath)
		return
	}

	cmd := exec.CommandContext(ctx, "node", absPath)
	cmd.Env = append(os.Environ(),
		fmt.Sprintf("RUN_ID=%s", runID.String()),
		fmt.Sprintf("WORKER_ID=%s", workerID),
	)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	log.Info().Str("worker", workerID).Str("run_id", runID.String()).Msg("executing worker script")

	if err := cmd.Run(); err != nil {
		errMsg := strings.TrimSpace(stderr.String())
		if errMsg == "" {
			errMsg = err.Error()
		}
		// Truncate to 2000 chars
		if len(errMsg) > 2000 {
			errMsg = errMsg[:2000]
		}
		h.completeWorkerRun(runID, domain.WorkerFailed, strings.TrimSpace(stdout.String()), 0, errMsg)
		log.Error().Str("worker", workerID).Err(err).Str("stderr", errMsg).Msg("worker script failed")
		return
	}

	// The script itself updates the run record with output_summary and items_processed.
	// But if it didn't (e.g. for simple scripts), we mark it completed here as a fallback.
	latest, _ := h.workers.GetLatestRun(context.Background(), workerID)
	if latest != nil && latest.ID == runID && latest.Status == domain.WorkerRunning {
		output := strings.TrimSpace(stdout.String())
		if len(output) > 2000 {
			output = output[:2000]
		}
		h.completeWorkerRun(runID, domain.WorkerCompleted, output, 0, "")
	}

	log.Info().Str("worker", workerID).Str("run_id", runID.String()).Msg("worker script completed")
}

func (h *AdminHandler) completeWorkerRun(runID uuid.UUID, status domain.WorkerRunStatus, summary string, items int, errMsg string) {
	if err := h.workers.CompleteRun(context.Background(), runID, status, summary, items, errMsg); err != nil {
		log.Error().Err(err).Str("run_id", runID.String()).Msg("failed to update worker run status")
	}
}

// ── News ─────────────────────────────────────────────────────────

func (h *AdminHandler) ListNews(w http.ResponseWriter, r *http.Request) {
	limit := 50
	if n, err := strconv.Atoi(r.URL.Query().Get("limit")); err == nil && n > 0 && n <= 200 {
		limit = n
	}
	saved := r.URL.Query().Get("saved") == "true"

	items, err := h.news.List(r.Context(), limit, saved)
	if err != nil {
		log.Error().Err(err).Msg("failed to list news items")
		httputil.Error(w, http.StatusInternalServerError, "failed to list news items")
		return
	}
	if items == nil {
		items = []domain.NewsItem{}
	}
	httputil.JSON(w, http.StatusOK, items)
}

func (h *AdminHandler) MarkNewsRead(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "newsID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid news item ID")
		return
	}
	if err := h.news.MarkRead(r.Context(), id); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to mark news item as read")
		return
	}
	httputil.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h *AdminHandler) ToggleNewsSaved(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "newsID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid news item ID")
		return
	}
	if err := h.news.ToggleSaved(r.Context(), id); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to toggle news item saved status")
		return
	}
	httputil.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h *AdminHandler) DeleteNewsItem(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "newsID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid news item ID")
		return
	}
	if err := h.news.Delete(r.Context(), id); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to delete news item")
		return
	}
	httputil.NoContent(w)
}

// ── Compliance Alerts ────────────────────────────────────────────

func (h *AdminHandler) ListAlerts(w http.ResponseWriter, r *http.Request) {
	alerts, err := h.alerts.List(r.Context())
	if err != nil {
		log.Error().Err(err).Msg("failed to list compliance alerts")
		httputil.Error(w, http.StatusInternalServerError, "failed to list compliance alerts")
		return
	}
	if alerts == nil {
		alerts = []domain.ComplianceAlert{}
	}
	httputil.JSON(w, http.StatusOK, alerts)
}

func (h *AdminHandler) UpdateAlertStatus(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "alertID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid alert ID")
		return
	}

	var req struct {
		Status string `json:"status"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Validate status value
	status := domain.ComplianceAlertStatus(req.Status)
	switch status {
	case domain.AlertPending, domain.AlertAcknowledged, domain.AlertActionNeeded, domain.AlertResolved:
		// valid
	default:
		httputil.Error(w, http.StatusBadRequest, "invalid status: must be pending, acknowledged, action_needed, or resolved")
		return
	}

	if err := h.alerts.UpdateStatus(r.Context(), id, status); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to update alert status")
		return
	}
	httputil.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// ── Google OAuth ────────────────────────────────────────────────

func (h *AdminHandler) requireGoogle(w http.ResponseWriter) bool {
	if h.google == nil {
		httputil.Error(w, http.StatusServiceUnavailable, "Google integration not configured")
		return false
	}
	return true
}

// GetGoogleAuthURL returns the OAuth consent URL for Google.
func (h *AdminHandler) GetGoogleAuthURL(w http.ResponseWriter, r *http.Request) {
	if !h.requireGoogle(w) {
		return
	}
	state := "phosra-admin-google" // simple state; single-admin, no CSRF concern
	url := h.google.AuthorizeURL(state)
	httputil.JSON(w, http.StatusOK, map[string]string{"url": url})
}

// GoogleCallback exchanges the OAuth code for tokens.
func (h *AdminHandler) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	if !h.requireGoogle(w) {
		return
	}

	var req struct {
		Code string `json:"code"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil || req.Code == "" {
		httputil.Error(w, http.StatusBadRequest, "missing authorization code")
		return
	}

	tokens, err := h.google.ExchangeCode(r.Context(), req.Code)
	if err != nil {
		log.Error().Err(err).Msg("Google OAuth code exchange failed")
		httputil.Error(w, http.StatusBadRequest, "failed to exchange code: "+err.Error())
		return
	}

	httputil.JSON(w, http.StatusOK, map[string]interface{}{
		"connected": true,
		"email":     tokens.GoogleEmail,
		"scopes":    tokens.Scopes,
	})
}

// GetGoogleStatus returns the current Google connection status.
func (h *AdminHandler) GetGoogleStatus(w http.ResponseWriter, r *http.Request) {
	if !h.requireGoogle(w) {
		return
	}

	connected, email, err := h.google.IsConnected(r.Context())
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to check Google status")
		return
	}

	httputil.JSON(w, http.StatusOK, map[string]interface{}{
		"connected": connected,
		"email":     email,
		"scopes":    google.Scopes(),
	})
}

// DisconnectGoogle removes stored Google tokens.
func (h *AdminHandler) DisconnectGoogle(w http.ResponseWriter, r *http.Request) {
	if !h.requireGoogle(w) {
		return
	}

	if err := h.google.Disconnect(r.Context()); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to disconnect Google")
		return
	}
	httputil.JSON(w, http.StatusOK, map[string]string{"status": "disconnected"})
}

// ── Gmail ───────────────────────────────────────────────────────

func (h *AdminHandler) ListGmailMessages(w http.ResponseWriter, r *http.Request) {
	if !h.requireGoogle(w) {
		return
	}

	query := r.URL.Query().Get("q")
	pageToken := r.URL.Query().Get("pageToken")
	maxResults := 20
	if n, err := strconv.Atoi(r.URL.Query().Get("maxResults")); err == nil && n > 0 && n <= 100 {
		maxResults = n
	}

	msgs, err := h.google.ListMessages(r.Context(), query, maxResults, pageToken)
	if err != nil {
		if errors.Is(err, google.ErrGoogleDisconnected) {
			httputil.Error(w, http.StatusUnauthorized, "Google account disconnected — please reconnect")
			return
		}
		httputil.Error(w, http.StatusInternalServerError, "failed to list Gmail messages")
		return
	}

	httputil.JSON(w, http.StatusOK, msgs)
}

func (h *AdminHandler) GetGmailMessage(w http.ResponseWriter, r *http.Request) {
	if !h.requireGoogle(w) {
		return
	}

	messageID := chi.URLParam(r, "messageID")
	if messageID == "" {
		httputil.Error(w, http.StatusBadRequest, "missing message ID")
		return
	}

	msg, err := h.google.GetMessage(r.Context(), messageID)
	if err != nil {
		if errors.Is(err, google.ErrGoogleDisconnected) {
			httputil.Error(w, http.StatusUnauthorized, "Google account disconnected — please reconnect")
			return
		}
		httputil.Error(w, http.StatusInternalServerError, "failed to get Gmail message")
		return
	}

	httputil.JSON(w, http.StatusOK, msg)
}

func (h *AdminHandler) GetGmailThread(w http.ResponseWriter, r *http.Request) {
	if !h.requireGoogle(w) {
		return
	}

	threadID := chi.URLParam(r, "threadID")
	if threadID == "" {
		httputil.Error(w, http.StatusBadRequest, "missing thread ID")
		return
	}

	messages, err := h.google.GetThread(r.Context(), threadID)
	if err != nil {
		if errors.Is(err, google.ErrGoogleDisconnected) {
			httputil.Error(w, http.StatusUnauthorized, "Google account disconnected — please reconnect")
			return
		}
		httputil.Error(w, http.StatusInternalServerError, "failed to get Gmail thread")
		return
	}

	httputil.JSON(w, http.StatusOK, messages)
}

func (h *AdminHandler) SendGmailMessage(w http.ResponseWriter, r *http.Request) {
	if !h.requireGoogle(w) {
		return
	}

	var req struct {
		To               string `json:"to"`
		Subject          string `json:"subject"`
		Body             string `json:"body"`
		ReplyToMessageID string `json:"reply_to_message_id,omitempty"`
		ContactID        string `json:"contact_id,omitempty"` // optional outreach contact link
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.To == "" || req.Subject == "" {
		httputil.Error(w, http.StatusBadRequest, "to and subject are required")
		return
	}

	sent, err := h.google.SendMessage(r.Context(), req.To, req.Subject, req.Body, req.ReplyToMessageID)
	if err != nil {
		if errors.Is(err, google.ErrGoogleDisconnected) {
			httputil.Error(w, http.StatusUnauthorized, "Google account disconnected — please reconnect")
			return
		}
		httputil.Error(w, http.StatusInternalServerError, "failed to send Gmail message")
		return
	}

	// Optionally log as outreach activity
	if req.ContactID != "" {
		contactUUID, err := uuid.Parse(req.ContactID)
		if err == nil {
			activity := &domain.OutreachActivity{
				ContactID:    contactUUID,
				ActivityType: domain.ActivityEmailSent,
				Subject:      req.Subject,
				Body:         req.Body,
			}
			if createErr := h.outreach.CreateActivity(r.Context(), activity); createErr != nil {
				log.Warn().Err(createErr).Str("contact_id", req.ContactID).Msg("failed to log outreach activity for sent email")
			}
		}
	}

	httputil.JSON(w, http.StatusOK, sent)
}

func (h *AdminHandler) SearchGmail(w http.ResponseWriter, r *http.Request) {
	if !h.requireGoogle(w) {
		return
	}

	query := r.URL.Query().Get("q")
	if query == "" {
		httputil.Error(w, http.StatusBadRequest, "query parameter 'q' is required")
		return
	}
	maxResults := 20
	if n, err := strconv.Atoi(r.URL.Query().Get("maxResults")); err == nil && n > 0 && n <= 100 {
		maxResults = n
	}

	msgs, err := h.google.SearchMessages(r.Context(), query, maxResults)
	if err != nil {
		if errors.Is(err, google.ErrGoogleDisconnected) {
			httputil.Error(w, http.StatusUnauthorized, "Google account disconnected — please reconnect")
			return
		}
		httputil.Error(w, http.StatusInternalServerError, "failed to search Gmail")
		return
	}

	httputil.JSON(w, http.StatusOK, msgs)
}

// ── Google Contacts ─────────────────────────────────────────────

func (h *AdminHandler) ListGoogleContacts(w http.ResponseWriter, r *http.Request) {
	if !h.requireGoogle(w) {
		return
	}

	pageToken := r.URL.Query().Get("pageToken")
	pageSize := 100
	if n, err := strconv.Atoi(r.URL.Query().Get("pageSize")); err == nil && n > 0 && n <= 1000 {
		pageSize = n
	}

	contacts, err := h.google.ListContacts(r.Context(), pageSize, pageToken)
	if err != nil {
		if errors.Is(err, google.ErrGoogleDisconnected) {
			httputil.Error(w, http.StatusUnauthorized, "Google account disconnected — please reconnect")
			return
		}
		httputil.Error(w, http.StatusInternalServerError, "failed to list Google contacts")
		return
	}

	httputil.JSON(w, http.StatusOK, contacts)
}

func (h *AdminHandler) SearchGoogleContacts(w http.ResponseWriter, r *http.Request) {
	if !h.requireGoogle(w) {
		return
	}

	query := r.URL.Query().Get("q")
	if query == "" {
		httputil.Error(w, http.StatusBadRequest, "query parameter 'q' is required")
		return
	}

	contacts, err := h.google.SearchContacts(r.Context(), query, 30)
	if err != nil {
		if errors.Is(err, google.ErrGoogleDisconnected) {
			httputil.Error(w, http.StatusUnauthorized, "Google account disconnected — please reconnect")
			return
		}
		httputil.Error(w, http.StatusInternalServerError, "failed to search Google contacts")
		return
	}

	httputil.JSON(w, http.StatusOK, contacts)
}

// SyncGoogleContactsPreview returns a dry-run preview of what a contact sync would do.
func (h *AdminHandler) SyncGoogleContactsPreview(w http.ResponseWriter, r *http.Request) {
	if !h.requireGoogle(w) {
		return
	}

	// Fetch all Google contacts
	allContacts := []google.GoogleContact{}
	pageToken := ""
	for {
		page, err := h.google.ListContacts(r.Context(), 500, pageToken)
		if err != nil {
			if errors.Is(err, google.ErrGoogleDisconnected) {
				httputil.Error(w, http.StatusUnauthorized, "Google account disconnected — please reconnect")
				return
			}
			httputil.Error(w, http.StatusInternalServerError, "failed to fetch Google contacts")
			return
		}
		allContacts = append(allContacts, page.Contacts...)
		if page.NextPageToken == "" {
			break
		}
		pageToken = page.NextPageToken
	}

	// Get existing outreach contacts for matching
	existingContacts, err := h.outreach.List(r.Context(), "", "")
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to list outreach contacts")
		return
	}

	// Build email→contact map for matching
	emailMap := make(map[string]*domain.OutreachContact)
	for i := range existingContacts {
		if existingContacts[i].Email != nil && *existingContacts[i].Email != "" {
			emailMap[*existingContacts[i].Email] = &existingContacts[i]
		}
	}

	preview := google.ContactSyncPreview{}
	for _, gc := range allContacts {
		if gc.Email == "" && gc.Name == "" {
			preview.Skipped++
			continue
		}
		if gc.Email != "" {
			if existing, ok := emailMap[gc.Email]; ok {
				preview.ToUpdate = append(preview.ToUpdate, struct {
					Contact    google.GoogleContact `json:"contact"`
					ExistingID string               `json:"existing_id"`
				}{Contact: gc, ExistingID: existing.ID.String()})
				continue
			}
		}
		preview.ToCreate = append(preview.ToCreate, gc)
	}

	httputil.JSON(w, http.StatusOK, preview)
}

// SyncGoogleContacts imports Google Contacts into the outreach pipeline.
func (h *AdminHandler) SyncGoogleContacts(w http.ResponseWriter, r *http.Request) {
	if !h.requireGoogle(w) {
		return
	}

	// Fetch all Google contacts
	allContacts := []google.GoogleContact{}
	pageToken := ""
	for {
		page, err := h.google.ListContacts(r.Context(), 500, pageToken)
		if err != nil {
			if errors.Is(err, google.ErrGoogleDisconnected) {
				httputil.Error(w, http.StatusUnauthorized, "Google account disconnected — please reconnect")
				return
			}
			httputil.Error(w, http.StatusInternalServerError, "failed to fetch Google contacts")
			return
		}
		allContacts = append(allContacts, page.Contacts...)
		if page.NextPageToken == "" {
			break
		}
		pageToken = page.NextPageToken
	}

	// Get existing outreach contacts for matching
	existingContacts, err := h.outreach.List(r.Context(), "", "")
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to list outreach contacts")
		return
	}

	emailMap := make(map[string]*domain.OutreachContact)
	for i := range existingContacts {
		if existingContacts[i].Email != nil && *existingContacts[i].Email != "" {
			emailMap[*existingContacts[i].Email] = &existingContacts[i]
		}
	}

	var created, updated, skipped int
	for _, gc := range allContacts {
		if gc.Email == "" && gc.Name == "" {
			skipped++
			continue
		}

		if gc.Email != "" {
			if _, ok := emailMap[gc.Email]; ok {
				// Update existing — just skip for now (could update org/title)
				updated++
				continue
			}
		}

		// Create new outreach contact
		gcEmail := gc.Email
		gcPhone := gc.Phone
		newContact := &domain.OutreachContact{
			Name:        gc.Name,
			Org:         gc.Org,
			Title:       gc.Title,
			ContactType: domain.ContactTypeOther,
			Email:       &gcEmail,
			Phone:       &gcPhone,
			Status:      domain.OutreachNotContacted,
		}
		if err := h.outreach.Create(r.Context(), newContact); err != nil {
			log.Warn().Err(err).Str("email", gc.Email).Msg("failed to create outreach contact from Google sync")
			skipped++
			continue
		}
		created++
	}

	httputil.JSON(w, http.StatusOK, map[string]int{
		"created": created,
		"updated": updated,
		"skipped": skipped,
		"total":   len(allContacts),
	})
}

// ── Google Calendar ─────────────────────────────────────────────

func (h *AdminHandler) ListCalendarEvents(w http.ResponseWriter, r *http.Request) {
	if !h.requireGoogle(w) {
		return
	}

	// Default: next 30 days
	timeMin := time.Now()
	timeMax := timeMin.AddDate(0, 1, 0)

	if v := r.URL.Query().Get("timeMin"); v != "" {
		if t, err := time.Parse(time.RFC3339, v); err == nil {
			timeMin = t
		}
	}
	if v := r.URL.Query().Get("timeMax"); v != "" {
		if t, err := time.Parse(time.RFC3339, v); err == nil {
			timeMax = t
		}
	}

	maxResults := 50
	if n, err := strconv.Atoi(r.URL.Query().Get("maxResults")); err == nil && n > 0 && n <= 250 {
		maxResults = n
	}

	events, err := h.google.ListEvents(r.Context(), timeMin, timeMax, maxResults, r.URL.Query().Get("pageToken"))
	if err != nil {
		if errors.Is(err, google.ErrGoogleDisconnected) {
			httputil.Error(w, http.StatusUnauthorized, "Google account disconnected — please reconnect")
			return
		}
		httputil.Error(w, http.StatusInternalServerError, "failed to list calendar events")
		return
	}

	httputil.JSON(w, http.StatusOK, events)
}

func (h *AdminHandler) CreateCalendarEvent(w http.ResponseWriter, r *http.Request) {
	if !h.requireGoogle(w) {
		return
	}

	var req struct {
		Summary     string   `json:"summary"`
		Description string   `json:"description,omitempty"`
		Location    string   `json:"location,omitempty"`
		Start       string   `json:"start"` // RFC3339
		End         string   `json:"end"`   // RFC3339
		Attendees   []string `json:"attendees,omitempty"`
		ContactID   string   `json:"contact_id,omitempty"` // optional outreach contact link
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Summary == "" || req.Start == "" || req.End == "" {
		httputil.Error(w, http.StatusBadRequest, "summary, start, and end are required")
		return
	}

	startTime, err := time.Parse(time.RFC3339, req.Start)
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid start time format (use RFC3339)")
		return
	}
	endTime, err := time.Parse(time.RFC3339, req.End)
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid end time format (use RFC3339)")
		return
	}

	// If contact_id provided, add their email as attendee
	if req.ContactID != "" {
		contactUUID, parseErr := uuid.Parse(req.ContactID)
		if parseErr == nil {
			contact, getErr := h.outreach.GetByID(r.Context(), contactUUID)
			if getErr == nil && contact != nil && contact.Email != nil && *contact.Email != "" {
				req.Attendees = append(req.Attendees, *contact.Email)
			}
		}
	}

	event := google.CalendarEvent{
		Summary:     req.Summary,
		Description: req.Description,
		Location:    req.Location,
		Start:       startTime,
		End:         endTime,
		Attendees:   req.Attendees,
	}

	created, err := h.google.CreateEvent(r.Context(), event)
	if err != nil {
		if errors.Is(err, google.ErrGoogleDisconnected) {
			httputil.Error(w, http.StatusUnauthorized, "Google account disconnected — please reconnect")
			return
		}
		httputil.Error(w, http.StatusInternalServerError, "failed to create calendar event")
		return
	}

	// Log as outreach meeting activity
	if req.ContactID != "" {
		contactUUID, parseErr := uuid.Parse(req.ContactID)
		if parseErr == nil {
			activity := &domain.OutreachActivity{
				ContactID:    contactUUID,
				ActivityType: domain.ActivityMeeting,
				Subject:      req.Summary,
				Body:         req.Description,
			}
			if createErr := h.outreach.CreateActivity(r.Context(), activity); createErr != nil {
				log.Warn().Err(createErr).Str("contact_id", req.ContactID).Msg("failed to log outreach activity for calendar event")
			}
		}
	}

	httputil.Created(w, created)
}

func (h *AdminHandler) DeleteCalendarEvent(w http.ResponseWriter, r *http.Request) {
	if !h.requireGoogle(w) {
		return
	}

	eventID := chi.URLParam(r, "eventID")
	if eventID == "" {
		httputil.Error(w, http.StatusBadRequest, "missing event ID")
		return
	}

	if err := h.google.DeleteEvent(r.Context(), eventID); err != nil {
		if errors.Is(err, google.ErrGoogleDisconnected) {
			httputil.Error(w, http.StatusUnauthorized, "Google account disconnected — please reconnect")
			return
		}
		httputil.Error(w, http.StatusInternalServerError, "failed to delete calendar event")
		return
	}

	httputil.NoContent(w)
}
