package handler

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/repository/postgres"
	"github.com/guardiangate/api/pkg/httputil"
)

// AdminHandler serves the admin dashboard API endpoints.
type AdminHandler struct {
	outreach *postgres.AdminOutreachRepo
	workers  *postgres.AdminWorkerRepo
}

func NewAdminHandler(outreach *postgres.AdminOutreachRepo, workers *postgres.AdminWorkerRepo) *AdminHandler {
	return &AdminHandler{outreach: outreach, workers: workers}
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
		contact.Notes = *req.Notes
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

func (h *AdminHandler) TriggerWorker(w http.ResponseWriter, r *http.Request) {
	workerID := chi.URLParam(r, "workerID")

	run := &domain.WorkerRun{
		WorkerID:    workerID,
		Status:      domain.WorkerRunning,
		TriggerType: domain.TriggerManual,
	}
	if err := h.workers.CreateRun(r.Context(), run); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to create worker run")
		return
	}

	// TODO: Actually trigger the worker script via exec or GitHub API
	// For now we just record the run — the worker scripts themselves will
	// pick up pending runs or be triggered by GitHub Actions.

	httputil.Created(w, run)
}
