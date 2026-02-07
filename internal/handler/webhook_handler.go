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

type WebhookHandler struct {
	webhooks *service.WebhookService
}

func NewWebhookHandler(webhooks *service.WebhookService) *WebhookHandler {
	return &WebhookHandler{webhooks: webhooks}
}

func (h *WebhookHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	var req struct {
		FamilyID string   `json:"family_id"`
		URL      string   `json:"url"`
		Events   []string `json:"events"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	familyID, err := uuid.Parse(req.FamilyID)
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid family_id")
		return
	}

	webhook, err := h.webhooks.Create(r.Context(), userID, familyID, req.URL, req.Events)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.Created(w, webhook)
}

func (h *WebhookHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	webhookID, err := uuid.Parse(chi.URLParam(r, "webhookID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid webhook ID")
		return
	}

	webhook, err := h.webhooks.GetByID(r.Context(), userID, webhookID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, webhook)
}

func (h *WebhookHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	webhookID, err := uuid.Parse(chi.URLParam(r, "webhookID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid webhook ID")
		return
	}

	var req struct {
		URL    string   `json:"url"`
		Events []string `json:"events"`
		Active bool     `json:"active"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	webhook, err := h.webhooks.Update(r.Context(), userID, webhookID, req.URL, req.Events, req.Active)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, webhook)
}

func (h *WebhookHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	webhookID, err := uuid.Parse(chi.URLParam(r, "webhookID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid webhook ID")
		return
	}

	if err := h.webhooks.Delete(r.Context(), userID, webhookID); err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.NoContent(w)
}

func (h *WebhookHandler) ListByFamily(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	familyID, err := uuid.Parse(chi.URLParam(r, "familyID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid family ID")
		return
	}

	webhooks, err := h.webhooks.ListByFamily(r.Context(), userID, familyID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, webhooks)
}

func (h *WebhookHandler) Test(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	webhookID, err := uuid.Parse(chi.URLParam(r, "webhookID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid webhook ID")
		return
	}

	delivery, err := h.webhooks.TestWebhook(r.Context(), userID, webhookID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, delivery)
}

func (h *WebhookHandler) ListDeliveries(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	webhookID, err := uuid.Parse(chi.URLParam(r, "webhookID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid webhook ID")
		return
	}

	limit := 50
	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	deliveries, err := h.webhooks.ListDeliveries(r.Context(), userID, webhookID, limit)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, deliveries)
}
