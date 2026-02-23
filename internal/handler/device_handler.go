package handler

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/handler/middleware"
	androidProvider "github.com/guardiangate/api/internal/provider/android"
	appleProvider "github.com/guardiangate/api/internal/provider/apple"
	"github.com/guardiangate/api/internal/service"
	"github.com/guardiangate/api/pkg/httputil"
)

type DeviceHandler struct {
	devicePolicy *service.DevicePolicyService
}

func NewDeviceHandler(dp *service.DevicePolicyService) *DeviceHandler {
	return &DeviceHandler{devicePolicy: dp}
}

// ── Parent-auth endpoints (JWT) ─────────────────────────────────

func (h *DeviceHandler) RegisterDevice(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	childID, err := uuid.Parse(chi.URLParam(r, "childID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid child ID")
		return
	}

	var req service.RegisterDeviceRequest
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	resp, err := h.devicePolicy.RegisterDevice(r.Context(), userID, childID, req)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusCreated, resp)
}

func (h *DeviceHandler) ListDevices(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	childID, err := uuid.Parse(chi.URLParam(r, "childID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid child ID")
		return
	}

	devices, err := h.devicePolicy.ListDevices(r.Context(), userID, childID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, devices)
}

func (h *DeviceHandler) UpdateDevice(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	deviceID, err := uuid.Parse(chi.URLParam(r, "deviceID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid device ID")
		return
	}

	var req service.UpdateDeviceRequest
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	device, err := h.devicePolicy.UpdateDevice(r.Context(), userID, deviceID, req)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, device)
}

func (h *DeviceHandler) RevokeDevice(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	deviceID, err := uuid.Parse(chi.URLParam(r, "deviceID"))
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid device ID")
		return
	}

	if err := h.devicePolicy.RevokeDevice(r.Context(), userID, deviceID); err != nil {
		handleServiceError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ── Device-auth endpoints (X-Device-Key) ────────────────────────

func (h *DeviceHandler) GetPolicy(w http.ResponseWriter, r *http.Request) {
	device := middleware.GetDevice(r.Context())
	if device == nil {
		httputil.Error(w, http.StatusUnauthorized, "device not authenticated")
		return
	}

	// Check since_version for conditional fetch
	if sinceStr := r.URL.Query().Get("since_version"); sinceStr != "" {
		sinceVersion, err := strconv.Atoi(sinceStr)
		if err == nil {
			currentVersion, err := h.devicePolicy.GetPolicyVersion(r.Context(), device.ChildID)
			if err == nil && currentVersion <= sinceVersion {
				w.WriteHeader(http.StatusNotModified)
				return
			}
		}
	}

	compiled, err := h.devicePolicy.CompilePolicy(r.Context(), device.ChildID)
	if err != nil {
		handleServiceError(w, err)
		return
	}
	httputil.JSON(w, http.StatusOK, compiled)
}

func (h *DeviceHandler) IngestReport(w http.ResponseWriter, r *http.Request) {
	device := middleware.GetDevice(r.Context())
	if device == nil {
		httputil.Error(w, http.StatusUnauthorized, "device not authenticated")
		return
	}

	var req service.DeviceReportRequest
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.devicePolicy.IngestReport(r.Context(), device, req); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to process report")
		return
	}
	httputil.JSON(w, http.StatusAccepted, map[string]string{"status": "accepted"})
}

func (h *DeviceHandler) AckVersion(w http.ResponseWriter, r *http.Request) {
	device := middleware.GetDevice(r.Context())
	if device == nil {
		httputil.Error(w, http.StatusUnauthorized, "device not authenticated")
		return
	}

	var req struct {
		Version int `json:"version"`
	}
	if err := httputil.DecodeJSON(r, &req); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.devicePolicy.AckPolicyVersion(r.Context(), device, req.Version); err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to acknowledge version")
		return
	}
	httputil.JSON(w, http.StatusOK, map[string]any{
		"acknowledged_version": req.Version,
	})
}

// ── Public endpoint ─────────────────────────────────────────────

func (h *DeviceHandler) GetMappings(w http.ResponseWriter, r *http.Request) {
	platformID := chi.URLParam(r, "platformID")
	switch platformID {
	case "apple":
		httputil.JSON(w, http.StatusOK, appleProvider.GetPlatformMappings())
	case "android":
		httputil.JSON(w, http.StatusOK, androidProvider.GetPlatformMappings())
	default:
		httputil.Error(w, http.StatusNotFound, "platform mappings not available for: "+platformID)
	}
}
