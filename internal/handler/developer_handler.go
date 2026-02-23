package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/handler/middleware"
	"github.com/guardiangate/api/internal/service"
	"github.com/guardiangate/api/pkg/httputil"
)

// DeveloperHandler handles developer portal HTTP requests.
type DeveloperHandler struct {
	developers *service.DeveloperService
}

// NewDeveloperHandler creates a new DeveloperHandler.
func NewDeveloperHandler(developers *service.DeveloperService) *DeveloperHandler {
	return &DeveloperHandler{developers: developers}
}

// CreateOrg handles POST /developers/orgs
func (h *DeveloperHandler) CreateOrg(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())

	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		WebsiteURL  string `json:"website_url"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Name == "" {
		httputil.Error(w, http.StatusBadRequest, "name is required")
		return
	}

	org, err := h.developers.CreateOrg(r.Context(), userID, req.Name, req.Description, req.WebsiteURL)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to create organization")
		return
	}
	httputil.Created(w, org)
}

// ListOrgs handles GET /developers/orgs
func (h *DeveloperHandler) ListOrgs(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())

	orgs, err := h.developers.ListOrgs(r.Context(), userID)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to list organizations")
		return
	}
	httputil.JSON(w, http.StatusOK, orgs)
}

// GetOrg handles GET /developers/orgs/{orgID}
func (h *DeveloperHandler) GetOrg(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	orgID, err := uuid.Parse(chi.URLParam(r, "orgID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid org ID")
		return
	}

	// Verify the user has access to this org
	if _, err := h.developers.CheckOrgAccess(r.Context(), orgID, userID); err != nil {
		handleDeveloperServiceError(w, err)
		return
	}

	org, err := h.developers.GetOrg(r.Context(), orgID)
	if err != nil {
		handleDeveloperServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, org)
}

// UpdateOrg handles PUT /developers/orgs/{orgID}
func (h *DeveloperHandler) UpdateOrg(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	orgID, err := uuid.Parse(chi.URLParam(r, "orgID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid org ID")
		return
	}

	if err := h.developers.CheckOrgAdmin(r.Context(), orgID, userID); err != nil {
		handleDeveloperServiceError(w, err)
		return
	}

	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		WebsiteURL  string `json:"website_url"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	org, err := h.developers.UpdateOrg(r.Context(), orgID, req.Name, req.Description, req.WebsiteURL)
	if err != nil {
		handleDeveloperServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, org)
}

// DeleteOrg handles DELETE /developers/orgs/{orgID}
func (h *DeveloperHandler) DeleteOrg(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	orgID, err := uuid.Parse(chi.URLParam(r, "orgID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid org ID")
		return
	}

	if err := h.developers.CheckOrgAdmin(r.Context(), orgID, userID); err != nil {
		handleDeveloperServiceError(w, err)
		return
	}

	if err := h.developers.DeleteOrg(r.Context(), orgID); err != nil {
		handleDeveloperServiceError(w, err)
		return
	}
	httputil.NoContent(w)
}

// ListMembers handles GET /developers/orgs/{orgID}/members
func (h *DeveloperHandler) ListMembers(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	orgID, err := uuid.Parse(chi.URLParam(r, "orgID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid org ID")
		return
	}

	if _, err := h.developers.CheckOrgAccess(r.Context(), orgID, userID); err != nil {
		handleDeveloperServiceError(w, err)
		return
	}

	members, err := h.developers.ListMembers(r.Context(), orgID)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to list members")
		return
	}
	httputil.JSON(w, http.StatusOK, members)
}

// CreateKey handles POST /developers/orgs/{orgID}/keys
func (h *DeveloperHandler) CreateKey(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	orgID, err := uuid.Parse(chi.URLParam(r, "orgID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid org ID")
		return
	}

	if err := h.developers.CheckOrgAdmin(r.Context(), orgID, userID); err != nil {
		handleDeveloperServiceError(w, err)
		return
	}

	var req struct {
		Name        string   `json:"name"`
		Environment string   `json:"environment"`
		Scopes      []string `json:"scopes"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Name == "" {
		httputil.Error(w, http.StatusBadRequest, "name is required")
		return
	}
	if req.Environment == "" {
		httputil.Error(w, http.StatusBadRequest, "environment is required")
		return
	}

	key, rawKey, err := h.developers.CreateAPIKey(r.Context(), orgID, userID, req.Name, domain.DeveloperEnv(req.Environment), req.Scopes)
	if err != nil {
		handleDeveloperServiceError(w, err)
		return
	}

	// Include the raw key in the response (shown only once)
	resp := struct {
		*domain.DeveloperAPIKey
		Key string `json:"key"`
	}{
		DeveloperAPIKey: key,
		Key:             rawKey,
	}
	httputil.Created(w, resp)
}

// ListKeys handles GET /developers/orgs/{orgID}/keys
func (h *DeveloperHandler) ListKeys(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	orgID, err := uuid.Parse(chi.URLParam(r, "orgID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid org ID")
		return
	}

	if _, err := h.developers.CheckOrgAccess(r.Context(), orgID, userID); err != nil {
		handleDeveloperServiceError(w, err)
		return
	}

	keys, err := h.developers.ListAPIKeys(r.Context(), orgID)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to list API keys")
		return
	}
	httputil.JSON(w, http.StatusOK, keys)
}

// RevokeKey handles DELETE /developers/orgs/{orgID}/keys/{keyID}
func (h *DeveloperHandler) RevokeKey(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	orgID, err := uuid.Parse(chi.URLParam(r, "orgID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid org ID")
		return
	}
	keyID, err := uuid.Parse(chi.URLParam(r, "keyID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid key ID")
		return
	}

	if err := h.developers.CheckOrgAdmin(r.Context(), orgID, userID); err != nil {
		handleDeveloperServiceError(w, err)
		return
	}

	if err := h.developers.RevokeKey(r.Context(), orgID, keyID, userID); err != nil {
		handleDeveloperServiceError(w, err)
		return
	}
	httputil.NoContent(w)
}

// RegenerateKey handles POST /developers/orgs/{orgID}/keys/{keyID}/regenerate
func (h *DeveloperHandler) RegenerateKey(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	orgID, err := uuid.Parse(chi.URLParam(r, "orgID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid org ID")
		return
	}
	keyID, err := uuid.Parse(chi.URLParam(r, "keyID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid key ID")
		return
	}

	if err := h.developers.CheckOrgAdmin(r.Context(), orgID, userID); err != nil {
		handleDeveloperServiceError(w, err)
		return
	}

	key, rawKey, err := h.developers.RegenerateKey(r.Context(), orgID, keyID, userID)
	if err != nil {
		handleDeveloperServiceError(w, err)
		return
	}

	// Include the raw key in the response (shown only once)
	resp := struct {
		*domain.DeveloperAPIKey
		Key string `json:"key"`
	}{
		DeveloperAPIKey: key,
		Key:             rawKey,
	}
	httputil.Created(w, resp)
}

// GetUsage handles GET /developers/orgs/{orgID}/usage
func (h *DeveloperHandler) GetUsage(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	orgID, err := uuid.Parse(chi.URLParam(r, "orgID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid org ID")
		return
	}

	if _, err := h.developers.CheckOrgAccess(r.Context(), orgID, userID); err != nil {
		handleDeveloperServiceError(w, err)
		return
	}

	days := 30 // default
	if d := r.URL.Query().Get("days"); d != "" {
		parsed, err := strconv.Atoi(d)
		if err != nil || parsed < 1 || parsed > 365 {
			httputil.Error(w, http.StatusBadRequest, "days must be between 1 and 365")
			return
		}
		days = parsed
	}

	usage, err := h.developers.GetUsage(r.Context(), orgID, days)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to get usage data")
		return
	}
	httputil.JSON(w, http.StatusOK, usage)
}

// handleDeveloperServiceError maps developer service errors to HTTP responses.
func handleDeveloperServiceError(w http.ResponseWriter, err error) {
	switch err {
	case service.ErrOrgNotFound, service.ErrKeyNotFound:
		httputil.Error(w, http.StatusNotFound, err.Error())
	case service.ErrNotOrgMember:
		httputil.Error(w, http.StatusForbidden, err.Error())
	case service.ErrInsufficientOrgRole:
		httputil.Error(w, http.StatusForbidden, err.Error())
	case service.ErrInvalidEnvironment:
		httputil.Error(w, http.StatusBadRequest, err.Error())
	default:
		// Check for wrapped ErrInvalidScope
		if errors.Is(err, service.ErrInvalidScope) {
			httputil.Error(w, http.StatusBadRequest, err.Error())
			return
		}
		httputil.Error(w, http.StatusInternalServerError, "internal server error")
	}
}
