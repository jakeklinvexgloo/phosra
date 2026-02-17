package middleware

import (
	"context"
	"net/http"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/pkg/httputil"
)

const (
	DeviceKey   contextKey = "device"
	DeviceIDKey contextKey = "device_id"
)

// DeviceAuthenticator is the interface the middleware needs to validate device API keys.
type DeviceAuthenticator interface {
	AuthenticateDevice(ctx context.Context, apiKey string) (*domain.DeviceRegistration, error)
}

// DeviceAuth validates requests using the X-Device-Key header.
// On success, it sets the DeviceRegistration, device ID, child ID, and family ID in context.
func DeviceAuth(auth DeviceAuthenticator) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			apiKey := r.Header.Get("X-Device-Key")
			if apiKey == "" {
				httputil.Error(w, http.StatusUnauthorized, "missing X-Device-Key header")
				return
			}

			device, err := auth.AuthenticateDevice(r.Context(), apiKey)
			if err != nil {
				httputil.Error(w, http.StatusUnauthorized, "invalid or revoked device key")
				return
			}

			ctx := r.Context()
			ctx = context.WithValue(ctx, DeviceKey, device)
			ctx = context.WithValue(ctx, DeviceIDKey, device.ID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetDevice extracts the DeviceRegistration from context.
func GetDevice(ctx context.Context) *domain.DeviceRegistration {
	d, _ := ctx.Value(DeviceKey).(*domain.DeviceRegistration)
	return d
}

// GetDeviceID extracts the device UUID from context.
func GetDeviceID(ctx context.Context) uuid.UUID {
	id, _ := ctx.Value(DeviceIDKey).(uuid.UUID)
	return id
}
