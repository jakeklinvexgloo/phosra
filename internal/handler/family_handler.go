package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/handler/middleware"
	"github.com/guardiangate/api/internal/service"
	"github.com/guardiangate/api/pkg/httputil"
)

type FamilyHandler struct {
	families *service.FamilyService
}

func NewFamilyHandler(families *service.FamilyService) *FamilyHandler {
	return &FamilyHandler{families: families}
}

func (h *FamilyHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	var req struct {
		Name string `json:"name"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Name == "" {
		httputil.Error(w, http.StatusBadRequest, "name is required")
		return
	}

	family, err := h.families.Create(r.Context(), userID, req.Name)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to create family")
		return
	}
	httputil.Created(w, family)
}

func (h *FamilyHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	familyID, err := uuid.Parse(chi.URLParam(r, "familyID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid family ID")
		return
	}

	family, err := h.families.GetByID(r.Context(), familyID, userID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, family)
}

func (h *FamilyHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	familyID, err := uuid.Parse(chi.URLParam(r, "familyID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid family ID")
		return
	}

	var req struct {
		Name string `json:"name"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	family, err := h.families.Update(r.Context(), familyID, userID, req.Name)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, family)
}

func (h *FamilyHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	familyID, err := uuid.Parse(chi.URLParam(r, "familyID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid family ID")
		return
	}

	if err := h.families.Delete(r.Context(), familyID, userID); err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.NoContent(w)
}

func (h *FamilyHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	families, err := h.families.ListByUser(r.Context(), userID)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to list families")
		return
	}
	httputil.JSON(w, http.StatusOK, families)
}

func (h *FamilyHandler) AddMember(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	familyID, err := uuid.Parse(chi.URLParam(r, "familyID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid family ID")
		return
	}

	var req struct {
		UserID string `json:"user_id"`
		Role   string `json:"role"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	memberUserID, err := uuid.Parse(req.UserID)
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid user ID")
		return
	}

	if err := h.families.AddMember(r.Context(), familyID, userID, memberUserID, domain.FamilyRole(req.Role)); err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, map[string]string{"status": "member added"})
}

func (h *FamilyHandler) RemoveMember(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	familyID, err := uuid.Parse(chi.URLParam(r, "familyID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid family ID")
		return
	}
	memberID, err := uuid.Parse(chi.URLParam(r, "memberID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid member ID")
		return
	}

	if err := h.families.RemoveMember(r.Context(), familyID, userID, memberID); err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.NoContent(w)
}

func (h *FamilyHandler) ListMembers(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	familyID, err := uuid.Parse(chi.URLParam(r, "familyID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid family ID")
		return
	}

	members, err := h.families.ListMembers(r.Context(), familyID, userID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, members)
}

func handleServiceError(w http.ResponseWriter, err error) {
	switch err {
	case service.ErrFamilyNotFound, service.ErrChildNotFound, service.ErrPolicyNotFound,
		service.ErrRuleNotFound, service.ErrProviderNotFound, service.ErrConnectionNotFound,
		service.ErrSyncJobNotFound, service.ErrWebhookNotFound, service.ErrUserNotFound,
		service.ErrRatingNotFound:
		httputil.Error(w, http.StatusNotFound, err.Error())
	case service.ErrNotFamilyMember:
		httputil.Error(w, http.StatusForbidden, err.Error())
	case service.ErrInsufficientRole:
		httputil.Error(w, http.StatusForbidden, err.Error())
	case service.ErrNoActivePolicy:
		httputil.Error(w, http.StatusBadRequest, err.Error())
	case service.ErrEmailTaken:
		httputil.Error(w, http.StatusConflict, err.Error())
	case service.ErrInvalidCredentials:
		httputil.Error(w, http.StatusUnauthorized, err.Error())
	default:
		httputil.Error(w, http.StatusInternalServerError, "internal server error")
	}
}
