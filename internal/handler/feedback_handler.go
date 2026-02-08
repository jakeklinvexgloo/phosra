package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/repository"
	"github.com/guardiangate/api/pkg/httputil"
)

type FeedbackHandler struct {
	repo repository.UIFeedbackRepository
}

func NewFeedbackHandler(repo repository.UIFeedbackRepository) *FeedbackHandler {
	return &FeedbackHandler{repo: repo}
}

type createFeedbackRequest struct {
	PageRoute      string  `json:"page_route"`
	CSSSelector    string  `json:"css_selector"`
	ComponentHint  *string `json:"component_hint,omitempty"`
	Comment        string  `json:"comment"`
	ReviewerName   string  `json:"reviewer_name,omitempty"`
	ViewportWidth  *int    `json:"viewport_width,omitempty"`
	ViewportHeight *int    `json:"viewport_height,omitempty"`
	ClickX         *int    `json:"click_x,omitempty"`
	ClickY         *int    `json:"click_y,omitempty"`
}

func (h *FeedbackHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req createFeedbackRequest
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.PageRoute == "" {
		httputil.Error(w, http.StatusBadRequest, "page_route is required")
		return
	}
	if req.Comment == "" {
		httputil.Error(w, http.StatusBadRequest, "comment is required")
		return
	}

	fb := &domain.UIFeedback{
		PageRoute:      req.PageRoute,
		CSSSelector:    req.CSSSelector,
		ComponentHint:  req.ComponentHint,
		Comment:        req.Comment,
		ReviewerName:   req.ReviewerName,
		ViewportWidth:  req.ViewportWidth,
		ViewportHeight: req.ViewportHeight,
		ClickX:         req.ClickX,
		ClickY:         req.ClickY,
	}

	if err := h.repo.Create(r.Context(), fb); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to save feedback")
		return
	}

	httputil.Created(w, fb)
}

func (h *FeedbackHandler) List(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")

	items, err := h.repo.List(r.Context(), status)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to list feedback")
		return
	}
	if items == nil {
		items = []domain.UIFeedback{}
	}

	httputil.JSON(w, http.StatusOK, items)
}

type updateStatusRequest struct {
	Status string `json:"status"`
}

func (h *FeedbackHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "feedbackID")
	id, err := uuid.Parse(idStr)
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid feedback ID")
		return
	}

	var req updateStatusRequest
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	switch req.Status {
	case "open", "approved", "dismissed", "fixed":
		// valid
	default:
		httputil.Error(w, http.StatusBadRequest, "status must be one of: open, approved, dismissed, fixed")
		return
	}

	if err := h.repo.UpdateStatus(r.Context(), id, req.Status); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to update feedback status")
		return
	}

	httputil.JSON(w, http.StatusOK, map[string]string{"status": req.Status})
}
