package handler

import (
	"net/http"

	"github.com/guardiangate/api/internal/handler/middleware"
	"github.com/guardiangate/api/internal/service"
	"github.com/guardiangate/api/pkg/httputil"
)

type SetupHandler struct {
	setup *service.QuickSetupService
}

func NewSetupHandler(setup *service.QuickSetupService) *SetupHandler {
	return &SetupHandler{setup: setup}
}

func (h *SetupHandler) QuickSetup(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())

	var req service.QuickSetupRequest
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.ChildName == "" {
		httputil.Error(w, http.StatusBadRequest, "child_name is required")
		return
	}
	if req.BirthDate == "" {
		httputil.Error(w, http.StatusBadRequest, "birth_date is required")
		return
	}

	resp, err := h.setup.QuickSetup(r.Context(), userID, req)
	if err != nil {
		handleServiceError(w, err)
		return
	}

	httputil.Created(w, resp)
}
