package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/handler/middleware"
	"github.com/guardiangate/api/internal/repository"
	"github.com/guardiangate/api/pkg/httputil"
)

type ConfigAgentHandler struct {
	repo repository.ConfigAgentStateRepository
}

func NewConfigAgentHandler(repo repository.ConfigAgentStateRepository) *ConfigAgentHandler {
	return &ConfigAgentHandler{repo: repo}
}

// SaveState upserts the config agent state for the authenticated user.
// PUT /api/v1/config-agent/state/{platform}
func (h *ConfigAgentHandler) SaveState(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	platform := chi.URLParam(r, "platform")
	if platform == "" {
		platform = "netflix"
	}

	var body struct {
		State json.RawMessage `json:"state"`
	}
	if err := httputil.DecodeJSON(r, &body); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if len(body.State) == 0 {
		httputil.Error(w, http.StatusBadRequest, "state is required")
		return
	}

	s := &domain.ConfigAgentState{
		UserID:   userID,
		Platform: platform,
		State:    body.State,
	}
	if err := h.repo.Upsert(r.Context(), s); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to save state")
		return
	}
	httputil.JSON(w, http.StatusOK, s)
}

// GetState retrieves the saved config agent state.
// GET /api/v1/config-agent/state/{platform}
func (h *ConfigAgentHandler) GetState(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	platform := chi.URLParam(r, "platform")
	if platform == "" {
		platform = "netflix"
	}

	s, err := h.repo.Get(r.Context(), userID, platform)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to get state")
		return
	}
	if s == nil {
		httputil.JSON(w, http.StatusOK, nil)
		return
	}
	httputil.JSON(w, http.StatusOK, s)
}

// DeleteState removes the saved config agent state.
// DELETE /api/v1/config-agent/state/{platform}
func (h *ConfigAgentHandler) DeleteState(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	platform := chi.URLParam(r, "platform")
	if platform == "" {
		platform = "netflix"
	}

	if err := h.repo.Delete(r.Context(), userID, platform); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to delete state")
		return
	}
	httputil.NoContent(w)
}
