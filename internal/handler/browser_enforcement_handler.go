package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"

	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/handler/middleware"
	"github.com/guardiangate/api/internal/repository"
	"github.com/guardiangate/api/internal/repository/postgres"
	"github.com/guardiangate/api/pkg/httputil"
)

// BrowserEnforcementHandler serves the browser enforcement API endpoints.
type BrowserEnforcementHandler struct {
	repo       *postgres.BrowserEnforcementRepo
	familyRepo repository.FamilyRepository
}

func NewBrowserEnforcementHandler(repo *postgres.BrowserEnforcementRepo, familyRepo repository.FamilyRepository) *BrowserEnforcementHandler {
	return &BrowserEnforcementHandler{repo: repo, familyRepo: familyRepo}
}

// resolveFamily returns the first family for the authenticated user.
func (h *BrowserEnforcementHandler) resolveFamily(w http.ResponseWriter, r *http.Request) (uuid.UUID, bool) {
	userID := middleware.GetUserID(r.Context())
	families, err := h.familyRepo.ListByUser(r.Context(), userID)
	if err != nil || len(families) == 0 {
		httputil.Error(w, http.StatusBadRequest, "no family found for user")
		return uuid.Nil, false
	}
	return families[0].ID, true
}

// CreateJob creates a new browser enforcement job.
// POST /api/v1/enforce
func (h *BrowserEnforcementHandler) CreateJob(w http.ResponseWriter, r *http.Request) {
	familyID, ok := h.resolveFamily(w, r)
	if !ok {
		return
	}

	var req domain.CreateBrowserEnforcementJobRequest
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.PlatformID == "" {
		httputil.Error(w, http.StatusBadRequest, "platform_id is required")
		return
	}
	if req.ChildName == "" {
		httputil.Error(w, http.StatusBadRequest, "child_name is required")
		return
	}
	if req.ChildAge < 0 || req.ChildAge > 17 {
		httputil.Error(w, http.StatusBadRequest, "child_age must be between 0 and 17")
		return
	}

	rules := req.Rules
	if rules == nil {
		rules = json.RawMessage("[]")
	}

	job := &domain.BrowserEnforcementJob{
		FamilyID:   familyID,
		ChildName:  req.ChildName,
		ChildAge:   req.ChildAge,
		PlatformID: req.PlatformID,
		Rules:      rules,
		Screenshots: json.RawMessage("[]"),
	}

	created, err := h.repo.CreateJob(r.Context(), job)
	if err != nil {
		log.Error().Err(err).Msg("failed to create browser enforcement job")
		httputil.Error(w, http.StatusInternalServerError, "failed to create enforcement job")
		return
	}

	httputil.Created(w, created)
}

// GetJob returns a single browser enforcement job.
// GET /api/v1/enforce/{jobId}
func (h *BrowserEnforcementHandler) GetJob(w http.ResponseWriter, r *http.Request) {
	familyID, ok := h.resolveFamily(w, r)
	if !ok {
		return
	}

	jobID, err := uuid.Parse(chi.URLParam(r, "jobId"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid job ID")
		return
	}

	job, err := h.repo.GetJob(r.Context(), jobID)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to get enforcement job")
		return
	}
	if job == nil || job.FamilyID != familyID {
		httputil.Error(w, http.StatusNotFound, "enforcement job not found")
		return
	}

	httputil.JSON(w, http.StatusOK, job)
}

// ListJobs returns enforcement job history for the authenticated user's family.
// GET /api/v1/enforce/history
func (h *BrowserEnforcementHandler) ListJobs(w http.ResponseWriter, r *http.Request) {
	familyID, ok := h.resolveFamily(w, r)
	if !ok {
		return
	}

	limit := 20
	if n, err := strconv.Atoi(r.URL.Query().Get("limit")); err == nil && n > 0 && n <= 100 {
		limit = n
	}
	offset := 0
	if n, err := strconv.Atoi(r.URL.Query().Get("offset")); err == nil && n >= 0 {
		offset = n
	}

	jobs, err := h.repo.ListJobs(r.Context(), familyID, limit, offset)
	if err != nil {
		log.Error().Err(err).Msg("failed to list browser enforcement jobs")
		httputil.Error(w, http.StatusInternalServerError, "failed to list enforcement jobs")
		return
	}
	if jobs == nil {
		jobs = []domain.BrowserEnforcementJob{}
	}

	httputil.JSON(w, http.StatusOK, jobs)
}

// GetJobAuditLog returns the audit log for a browser enforcement job.
// GET /api/v1/enforce/{jobId}/audit
func (h *BrowserEnforcementHandler) GetJobAuditLog(w http.ResponseWriter, r *http.Request) {
	familyID, ok := h.resolveFamily(w, r)
	if !ok {
		return
	}

	jobID, err := uuid.Parse(chi.URLParam(r, "jobId"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid job ID")
		return
	}

	// Verify the job belongs to the user's family
	job, err := h.repo.GetJob(r.Context(), jobID)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to get enforcement job")
		return
	}
	if job == nil || job.FamilyID != familyID {
		httputil.Error(w, http.StatusNotFound, "enforcement job not found")
		return
	}

	entries, err := h.repo.GetJobAuditLog(r.Context(), jobID)
	if err != nil {
		log.Error().Err(err).Msg("failed to get enforcement audit log")
		httputil.Error(w, http.StatusInternalServerError, "failed to get audit log")
		return
	}
	if entries == nil {
		entries = []domain.BrowserEnforcementAuditEntry{}
	}

	httputil.JSON(w, http.StatusOK, entries)
}

// CancelJob cancels a pending browser enforcement job.
// DELETE /api/v1/enforce/{jobId}
func (h *BrowserEnforcementHandler) CancelJob(w http.ResponseWriter, r *http.Request) {
	familyID, ok := h.resolveFamily(w, r)
	if !ok {
		return
	}

	jobID, err := uuid.Parse(chi.URLParam(r, "jobId"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid job ID")
		return
	}

	job, err := h.repo.GetJob(r.Context(), jobID)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to get enforcement job")
		return
	}
	if job == nil || job.FamilyID != familyID {
		httputil.Error(w, http.StatusNotFound, "enforcement job not found")
		return
	}
	if job.Status != domain.BrowserEnforcementPending {
		httputil.Error(w, http.StatusBadRequest, "only pending jobs can be cancelled")
		return
	}

	if err := h.repo.UpdateJobStatus(r.Context(), jobID, domain.BrowserEnforcementCancelled, nil, nil); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to cancel enforcement job")
		return
	}

	httputil.JSON(w, http.StatusOK, map[string]string{"status": "cancelled"})
}
