package handler

import (
	"io"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/service"
	"github.com/guardiangate/api/pkg/httputil"
)

type SourceHandler struct {
	sources *service.SourceService
}

func NewSourceHandler(sources *service.SourceService) *SourceHandler {
	return &SourceHandler{sources: sources}
}

// ConnectSource handles POST /sources — connect a parental control source.
func (h *SourceHandler) ConnectSource(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ChildID     string                 `json:"child_id"`
		FamilyID    string                 `json:"family_id"`
		Source      string                 `json:"source"`
		Credentials map[string]interface{} `json:"credentials"`
		AutoSync    bool                   `json:"auto_sync"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	childID, err := uuid.Parse(req.ChildID)
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid child_id")
		return
	}
	familyID, err := uuid.Parse(req.FamilyID)
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid family_id")
		return
	}
	if req.Source == "" {
		httputil.Error(w, http.StatusBadRequest, "source is required")
		return
	}

	src, err := h.sources.ConnectSource(r.Context(), childID, familyID, req.Source, req.Credentials, req.AutoSync)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.Created(w, src)
}

// GetSource handles GET /sources/{sourceID} — get source details.
func (h *SourceHandler) GetSource(w http.ResponseWriter, r *http.Request) {
	sourceID, err := uuid.Parse(chi.URLParam(r, "sourceID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid source ID")
		return
	}

	src, err := h.sources.GetSource(r.Context(), sourceID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, src)
}

// ListByChild handles GET /children/{childID}/sources — list sources for a child.
func (h *SourceHandler) ListByChild(w http.ResponseWriter, r *http.Request) {
	childID, err := uuid.Parse(chi.URLParam(r, "childID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid child ID")
		return
	}

	sources, err := h.sources.ListSourcesByChild(r.Context(), childID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, sources)
}

// ListByFamily handles GET /families/{familyID}/sources — list sources for a family.
func (h *SourceHandler) ListByFamily(w http.ResponseWriter, r *http.Request) {
	familyID, err := uuid.Parse(chi.URLParam(r, "familyID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid family ID")
		return
	}

	sources, err := h.sources.ListSourcesByFamily(r.Context(), familyID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, sources)
}

// SyncSource handles POST /sources/{sourceID}/sync — push all rules to source.
func (h *SourceHandler) SyncSource(w http.ResponseWriter, r *http.Request) {
	sourceID, err := uuid.Parse(chi.URLParam(r, "sourceID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid source ID")
		return
	}

	job, err := h.sources.SyncSource(r.Context(), sourceID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusAccepted, job)
}

// PushRule handles POST /sources/{sourceID}/rules — push a single rule.
func (h *SourceHandler) PushRule(w http.ResponseWriter, r *http.Request) {
	sourceID, err := uuid.Parse(chi.URLParam(r, "sourceID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid source ID")
		return
	}

	var req struct {
		Category string      `json:"category"`
		Value    interface{} `json:"value"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Category == "" {
		httputil.Error(w, http.StatusBadRequest, "category is required")
		return
	}

	result, err := h.sources.PushSingleRule(r.Context(), sourceID, req.Category, req.Value)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, result)
}

// GetGuidedSteps handles GET /sources/{sourceID}/guide/{category} — get guided setup steps.
func (h *SourceHandler) GetGuidedSteps(w http.ResponseWriter, r *http.Request) {
	sourceID, err := uuid.Parse(chi.URLParam(r, "sourceID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid source ID")
		return
	}

	category := chi.URLParam(r, "category")
	if category == "" {
		httputil.Error(w, http.StatusBadRequest, "category is required")
		return
	}

	steps, err := h.sources.GetGuidedSteps(r.Context(), sourceID, category)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, steps)
}

// ListSyncJobs handles GET /sources/{sourceID}/jobs — list sync jobs.
func (h *SourceHandler) ListSyncJobs(w http.ResponseWriter, r *http.Request) {
	sourceID, err := uuid.Parse(chi.URLParam(r, "sourceID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid source ID")
		return
	}

	limit := 20
	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	jobs, err := h.sources.ListSyncJobs(r.Context(), sourceID, limit)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, jobs)
}

// GetSyncJob handles GET /sources/{sourceID}/jobs/{jobID} — get sync job details.
func (h *SourceHandler) GetSyncJob(w http.ResponseWriter, r *http.Request) {
	jobID, err := uuid.Parse(chi.URLParam(r, "jobID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid job ID")
		return
	}

	job, err := h.sources.GetSyncJob(r.Context(), jobID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, job)
}

// GetSyncResults handles GET /sources/{sourceID}/jobs/{jobID}/results — get per-rule results.
func (h *SourceHandler) GetSyncResults(w http.ResponseWriter, r *http.Request) {
	jobID, err := uuid.Parse(chi.URLParam(r, "jobID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid job ID")
		return
	}

	results, err := h.sources.GetSyncResults(r.Context(), jobID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, results)
}

// RetrySyncJob handles POST /sources/{sourceID}/jobs/{jobID}/retry — retry a failed sync.
func (h *SourceHandler) RetrySyncJob(w http.ResponseWriter, r *http.Request) {
	jobID, err := uuid.Parse(chi.URLParam(r, "jobID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid job ID")
		return
	}

	job, err := h.sources.RetrySyncJob(r.Context(), jobID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusAccepted, job)
}

// DisconnectSource handles DELETE /sources/{sourceID} — disconnect a source.
func (h *SourceHandler) DisconnectSource(w http.ResponseWriter, r *http.Request) {
	sourceID, err := uuid.Parse(chi.URLParam(r, "sourceID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid source ID")
		return
	}

	if err := h.sources.DisconnectSource(r.Context(), sourceID); err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.NoContent(w)
}

// ListAvailable handles GET /sources/available — list available source adapters.
func (h *SourceHandler) ListAvailable(w http.ResponseWriter, r *http.Request) {
	sources, err := h.sources.ListAvailableSources(r.Context())
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "internal server error")
		return
	}
	httputil.JSON(w, http.StatusOK, sources)
}

// InboundWebhook handles POST /webhooks/inbound/{sourceSlug} — receive inbound webhooks from sources.
func (h *SourceHandler) InboundWebhook(w http.ResponseWriter, r *http.Request) {
	sourceSlug := chi.URLParam(r, "sourceSlug")
	if sourceSlug == "" {
		httputil.Error(w, http.StatusBadRequest, "source slug is required")
		return
	}

	payload, err := io.ReadAll(r.Body)
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "failed to read request body")
		return
	}
	defer r.Body.Close()

	if err := h.sources.HandleInboundWebhook(r.Context(), sourceSlug, payload); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to process webhook")
		return
	}
	httputil.JSON(w, http.StatusOK, map[string]string{"status": "received"})
}
