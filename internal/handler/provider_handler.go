package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/handler/middleware"
	"github.com/guardiangate/api/internal/provider"
	"github.com/guardiangate/api/internal/service"
	"github.com/guardiangate/api/pkg/httputil"
)

type PlatformHandler struct {
	platforms *service.PlatformService
	registry  *provider.Registry
}

func NewPlatformHandler(platforms *service.PlatformService, registry *provider.Registry) *PlatformHandler {
	return &PlatformHandler{platforms: platforms, registry: registry}
}

func (h *PlatformHandler) List(w http.ResponseWriter, r *http.Request) {
	platforms, err := h.platforms.List(r.Context())
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to list platforms")
		return
	}
	httputil.JSON(w, http.StatusOK, platforms)
}

func (h *PlatformHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "platformID")
	p, err := h.platforms.GetByID(r.Context(), id)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, p)
}

func (h *PlatformHandler) ListByCategory(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	if category == "" {
		httputil.Error(w, http.StatusBadRequest, "category query parameter required")
		return
	}
	platforms, err := h.platforms.ListByCategory(r.Context(), domain.PlatformCategory(category))
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to list platforms")
		return
	}
	httputil.JSON(w, http.StatusOK, platforms)
}

func (h *PlatformHandler) ListByCapability(w http.ResponseWriter, r *http.Request) {
	cap := r.URL.Query().Get("capability")
	if cap == "" {
		httputil.Error(w, http.StatusBadRequest, "capability query parameter required")
		return
	}
	platforms, err := h.platforms.ListByCapability(r.Context(), provider.Capability(cap))
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to list platforms")
		return
	}
	httputil.JSON(w, http.StatusOK, platforms)
}

func (h *PlatformHandler) VerifyCompliance(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	var req struct {
		FamilyID    string `json:"family_id"`
		PlatformID  string `json:"platform_id"`
		Credentials string `json:"credentials"`
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

	link, err := h.platforms.VerifyCompliance(r.Context(), userID, familyID, req.PlatformID, req.Credentials)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.Created(w, link)
}

func (h *PlatformHandler) RevokeCertification(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	linkID, err := uuid.Parse(chi.URLParam(r, "linkID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid compliance link ID")
		return
	}

	if err := h.platforms.RevokeCertification(r.Context(), userID, linkID); err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.NoContent(w)
}

func (h *PlatformHandler) VerifyLink(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	linkID, err := uuid.Parse(chi.URLParam(r, "linkID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid compliance link ID")
		return
	}

	if err := h.platforms.VerifyLink(r.Context(), userID, linkID); err != nil {
		httputil.Error(w, http.StatusBadGateway, "compliance verification failed: "+err.Error())
		return
	}
	httputil.JSON(w, http.StatusOK, map[string]string{"status": "verified"})
}

func (h *PlatformHandler) ListComplianceLinks(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	familyID, err := uuid.Parse(chi.URLParam(r, "familyID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid family ID")
		return
	}

	links, err := h.platforms.ListComplianceLinks(r.Context(), userID, familyID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, links)
}

func (h *PlatformHandler) OAuthAuthorize(w http.ResponseWriter, r *http.Request) {
	platformID := chi.URLParam(r, "platformID")
	oauth, ok := h.registry.GetOAuth(platformID)
	if !ok {
		httputil.Error(w, http.StatusBadRequest, "platform does not support OAuth")
		return
	}

	state := r.URL.Query().Get("state")
	redirectURI := r.URL.Query().Get("redirect_uri")
	url := oauth.AuthorizeURL(state, redirectURI)
	httputil.JSON(w, http.StatusOK, map[string]string{"authorize_url": url})
}

func (h *PlatformHandler) OAuthCallback(w http.ResponseWriter, r *http.Request) {
	platformID := chi.URLParam(r, "platformID")
	oauth, ok := h.registry.GetOAuth(platformID)
	if !ok {
		httputil.Error(w, http.StatusBadRequest, "platform does not support OAuth")
		return
	}

	code := r.URL.Query().Get("code")
	redirectURI := r.URL.Query().Get("redirect_uri")

	auth, err := oauth.ExchangeCode(r.Context(), code, redirectURI)
	if err != nil {
		httputil.Error(w, http.StatusBadGateway, "OAuth exchange failed: "+err.Error())
		return
	}
	httputil.JSON(w, http.StatusOK, auth)
}
