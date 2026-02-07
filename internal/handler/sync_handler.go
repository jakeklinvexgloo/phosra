package handler

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/handler/middleware"
	"github.com/guardiangate/api/internal/service"
	"github.com/guardiangate/api/pkg/httputil"
)

type EnforcementHandler struct {
	enforcement *service.EnforcementService
}

func NewEnforcementHandler(enforcement *service.EnforcementService) *EnforcementHandler {
	return &EnforcementHandler{enforcement: enforcement}
}

func (h *EnforcementHandler) TriggerChildEnforcement(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	childID, err := uuid.Parse(chi.URLParam(r, "childID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid child ID")
		return
	}

	job, err := h.enforcement.TriggerEnforcement(r.Context(), userID, childID, "manual")
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusAccepted, job)
}

func (h *EnforcementHandler) TriggerLinkEnforcement(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	linkID, err := uuid.Parse(chi.URLParam(r, "linkID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid compliance link ID")
		return
	}

	job, err := h.enforcement.TriggerLinkEnforcement(r.Context(), userID, linkID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusAccepted, job)
}

func (h *EnforcementHandler) GetJob(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	jobID, err := uuid.Parse(chi.URLParam(r, "jobID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid job ID")
		return
	}

	job, err := h.enforcement.GetJob(r.Context(), userID, jobID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, job)
}

func (h *EnforcementHandler) GetJobResults(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	jobID, err := uuid.Parse(chi.URLParam(r, "jobID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid job ID")
		return
	}

	results, err := h.enforcement.GetJobResults(r.Context(), userID, jobID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, results)
}

func (h *EnforcementHandler) ListChildJobs(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	childID, err := uuid.Parse(chi.URLParam(r, "childID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid child ID")
		return
	}

	limit := 20
	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	jobs, err := h.enforcement.ListJobsByChild(r.Context(), userID, childID, limit)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, jobs)
}

func (h *EnforcementHandler) RetryJob(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	jobID, err := uuid.Parse(chi.URLParam(r, "jobID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid job ID")
		return
	}

	job, err := h.enforcement.RetryJob(r.Context(), userID, jobID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusAccepted, job)
}
