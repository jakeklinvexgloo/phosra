package handler

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/handler/middleware"
	"github.com/guardiangate/api/internal/service"
	"github.com/guardiangate/api/pkg/httputil"
	"github.com/guardiangate/api/pkg/validation"
)

type ChildHandler struct {
	children *service.ChildService
}

func NewChildHandler(children *service.ChildService) *ChildHandler {
	return &ChildHandler{children: children}
}

func (h *ChildHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	familyID, err := uuid.Parse(chi.URLParam(r, "familyID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid family ID")
		return
	}

	var req struct {
		Name      string `json:"name"`
		BirthDate string `json:"birth_date"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := validation.ValidateName(req.Name); err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	birthDate, err := time.Parse("2006-01-02", req.BirthDate)
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid birth_date format, use YYYY-MM-DD")
		return
	}
	if err := validation.ValidateBirthDate(birthDate); err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	child, err := h.children.Create(r.Context(), userID, familyID, req.Name, birthDate)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.Created(w, child)
}

func (h *ChildHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	childID, err := uuid.Parse(chi.URLParam(r, "childID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid child ID")
		return
	}

	child, err := h.children.GetByID(r.Context(), userID, childID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, child)
}

func (h *ChildHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	childID, err := uuid.Parse(chi.URLParam(r, "childID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid child ID")
		return
	}

	var req struct {
		Name      string `json:"name"`
		BirthDate string `json:"birth_date"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	birthDate, err := time.Parse("2006-01-02", req.BirthDate)
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid birth_date format")
		return
	}

	child, err := h.children.Update(r.Context(), userID, childID, req.Name, birthDate)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, child)
}

func (h *ChildHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	childID, err := uuid.Parse(chi.URLParam(r, "childID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid child ID")
		return
	}

	if err := h.children.Delete(r.Context(), userID, childID); err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.NoContent(w)
}

func (h *ChildHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	familyID, err := uuid.Parse(chi.URLParam(r, "familyID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid family ID")
		return
	}

	children, err := h.children.ListByFamily(r.Context(), userID, familyID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, children)
}

func (h *ChildHandler) GetAgeRatings(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	childID, err := uuid.Parse(chi.URLParam(r, "childID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid child ID")
		return
	}

	ratings, err := h.children.GetAgeRatings(r.Context(), userID, childID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, ratings)
}
