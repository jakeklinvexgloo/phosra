package handler

import (
	"net/http"

	"github.com/guardiangate/api/internal/handler/middleware"
	"github.com/guardiangate/api/internal/service"
	"github.com/guardiangate/api/pkg/httputil"
	"github.com/guardiangate/api/pkg/validation"
)

type AuthHandler struct {
	auth *service.AuthService
}

func NewAuthHandler(auth *service.AuthService) *AuthHandler {
	return &AuthHandler{auth: auth}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		Name     string `json:"name"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := validation.ValidateEmail(req.Email); err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := validation.ValidatePassword(req.Password); err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := validation.ValidateName(req.Name); err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	user, tokens, err := h.auth.Register(r.Context(), req.Email, req.Password, req.Name)
	if err != nil {
		switch err {
		case service.ErrEmailTaken:
			httputil.Error(w, http.StatusConflict, err.Error())
		default:
			httputil.Error(w, http.StatusInternalServerError, "registration failed")
		}
		return
	}

	httputil.Created(w, map[string]any{
		"user":   user,
		"tokens": tokens,
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	user, tokens, err := h.auth.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		httputil.Error(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	httputil.JSON(w, http.StatusOK, map[string]any{
		"user":   user,
		"tokens": tokens,
	})
}

func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	var req struct {
		RefreshToken string `json:"refresh_token"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	tokens, err := h.auth.RefreshAccessToken(r.Context(), req.RefreshToken)
	if err != nil {
		httputil.Error(w, http.StatusUnauthorized, "invalid refresh token")
		return
	}

	httputil.JSON(w, http.StatusOK, tokens)
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if err := h.auth.Logout(r.Context(), userID); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "logout failed")
		return
	}
	httputil.NoContent(w)
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	user, err := h.auth.GetUserByID(r.Context(), userID)
	if err != nil {
		httputil.Error(w, http.StatusNotFound, "user not found")
		return
	}
	httputil.JSON(w, http.StatusOK, user)
}
