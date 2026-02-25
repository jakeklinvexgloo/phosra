package handler

import (
	"net/http"

	"github.com/guardiangate/api/internal/handler/middleware"
	"github.com/guardiangate/api/internal/service"
	"github.com/guardiangate/api/pkg/httputil"
)

type AuthHandler struct {
	auth *service.AuthService
}

func NewAuthHandler(auth *service.AuthService) *AuthHandler {
	return &AuthHandler{auth: auth}
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	// Stytch handles session invalidation client-side.
	// This endpoint is kept for API compatibility.
	httputil.NoContent(w)
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	user, err := h.auth.GetUserByID(r.Context(), userID)
	if err != nil || user == nil {
		httputil.Error(w, http.StatusNotFound, "user not found")
		return
	}
	httputil.JSON(w, http.StatusOK, user)
}
