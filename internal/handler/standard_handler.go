package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/handler/middleware"
	"github.com/guardiangate/api/internal/service"
	"github.com/guardiangate/api/pkg/httputil"
)

type StandardHandler struct {
	standards *service.StandardService
}

func NewStandardHandler(standards *service.StandardService) *StandardHandler {
	return &StandardHandler{standards: standards}
}

// List returns all published community standards (public).
func (h *StandardHandler) List(w http.ResponseWriter, r *http.Request) {
	standards, err := h.standards.ListPublished(r.Context())
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "internal server error")
		return
	}
	httputil.JSON(w, http.StatusOK, standards)
}

// GetBySlug returns a single standard by slug (public).
func (h *StandardHandler) GetBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	if slug == "" {
		httputil.Error(w, http.StatusBadRequest, "slug is required")
		return
	}

	std, err := h.standards.GetBySlug(r.Context(), slug)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, std)
}

// Adopt adopts a standard for a child (protected).
func (h *StandardHandler) Adopt(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	childID, err := uuid.Parse(chi.URLParam(r, "childID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid child ID")
		return
	}

	var req struct {
		StandardID uuid.UUID `json:"standard_id"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	adoption, err := h.standards.Adopt(r.Context(), userID, childID, req.StandardID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.Created(w, adoption)
}

// Unadopt removes a standard from a child (protected).
func (h *StandardHandler) Unadopt(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	childID, err := uuid.Parse(chi.URLParam(r, "childID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid child ID")
		return
	}
	standardID, err := uuid.Parse(chi.URLParam(r, "standardID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid standard ID")
		return
	}

	if err := h.standards.Unadopt(r.Context(), userID, childID, standardID); err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.NoContent(w)
}

// ListByChild returns all standards adopted by a child (protected).
func (h *StandardHandler) ListByChild(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	childID, err := uuid.Parse(chi.URLParam(r, "childID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid child ID")
		return
	}

	standards, err := h.standards.ListByChild(r.Context(), userID, childID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, standards)
}
