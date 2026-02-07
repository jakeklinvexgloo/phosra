package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/handler/middleware"
	"github.com/guardiangate/api/internal/service"
	"github.com/guardiangate/api/pkg/httputil"
)

type PolicyHandler struct {
	policies *service.PolicyService
}

func NewPolicyHandler(policies *service.PolicyService) *PolicyHandler {
	return &PolicyHandler{policies: policies}
}

func (h *PolicyHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	childID, err := uuid.Parse(chi.URLParam(r, "childID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid child ID")
		return
	}

	var req struct {
		Name string `json:"name"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	policy, err := h.policies.Create(r.Context(), userID, childID, req.Name)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.Created(w, policy)
}

func (h *PolicyHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	policyID, err := uuid.Parse(chi.URLParam(r, "policyID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid policy ID")
		return
	}

	policy, err := h.policies.GetByID(r.Context(), userID, policyID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, policy)
}

func (h *PolicyHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	policyID, err := uuid.Parse(chi.URLParam(r, "policyID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid policy ID")
		return
	}

	var req struct {
		Name     string `json:"name"`
		Priority int    `json:"priority"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	policy, err := h.policies.Update(r.Context(), userID, policyID, req.Name, req.Priority)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, policy)
}

func (h *PolicyHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	policyID, err := uuid.Parse(chi.URLParam(r, "policyID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid policy ID")
		return
	}

	if err := h.policies.Delete(r.Context(), userID, policyID); err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.NoContent(w)
}

func (h *PolicyHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	childID, err := uuid.Parse(chi.URLParam(r, "childID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid child ID")
		return
	}

	policies, err := h.policies.ListByChild(r.Context(), userID, childID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, policies)
}

func (h *PolicyHandler) Activate(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	policyID, err := uuid.Parse(chi.URLParam(r, "policyID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid policy ID")
		return
	}

	policy, err := h.policies.Activate(r.Context(), userID, policyID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, policy)
}

func (h *PolicyHandler) Pause(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	policyID, err := uuid.Parse(chi.URLParam(r, "policyID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid policy ID")
		return
	}

	policy, err := h.policies.Pause(r.Context(), userID, policyID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, policy)
}

func (h *PolicyHandler) GenerateFromAge(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	policyID, err := uuid.Parse(chi.URLParam(r, "policyID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid policy ID")
		return
	}

	rules, err := h.policies.GenerateFromAge(r.Context(), userID, policyID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, rules)
}

// Rule handlers

func (h *PolicyHandler) CreateRule(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	policyID, err := uuid.Parse(chi.URLParam(r, "policyID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid policy ID")
		return
	}

	var req struct {
		Category string          `json:"category"`
		Enabled  bool            `json:"enabled"`
		Config   json.RawMessage `json:"config"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	rule, err := h.policies.CreateRule(r.Context(), userID, policyID, domain.RuleCategory(req.Category), req.Enabled, req.Config)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.Created(w, rule)
}

func (h *PolicyHandler) UpdateRule(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	ruleID, err := uuid.Parse(chi.URLParam(r, "ruleID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid rule ID")
		return
	}

	var req struct {
		Enabled bool            `json:"enabled"`
		Config  json.RawMessage `json:"config"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	rule, err := h.policies.UpdateRule(r.Context(), userID, ruleID, req.Enabled, req.Config)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, rule)
}

func (h *PolicyHandler) DeleteRule(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	ruleID, err := uuid.Parse(chi.URLParam(r, "ruleID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid rule ID")
		return
	}

	if err := h.policies.DeleteRule(r.Context(), userID, ruleID); err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.NoContent(w)
}

func (h *PolicyHandler) ListRules(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	policyID, err := uuid.Parse(chi.URLParam(r, "policyID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid policy ID")
		return
	}

	rules, err := h.policies.ListRules(r.Context(), userID, policyID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, rules)
}

func (h *PolicyHandler) BulkUpsertRules(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	policyID, err := uuid.Parse(chi.URLParam(r, "policyID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid policy ID")
		return
	}

	var req struct {
		Rules []domain.PolicyRule `json:"rules"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	rules, err := h.policies.BulkUpsertRules(r.Context(), userID, policyID, req.Rules)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, rules)
}
