package middleware

import (
	"net/http"

	"github.com/guardiangate/api/pkg/httputil"
)

// WorkerAuth validates the X-Worker-Key header against the configured API key.
func WorkerAuth(apiKey string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if apiKey == "" {
				httputil.Error(w, http.StatusServiceUnavailable, "worker API key not configured")
				return
			}

			key := r.Header.Get("X-Worker-Key")
			if key == "" || key != apiKey {
				httputil.Error(w, http.StatusUnauthorized, "invalid or missing X-Worker-Key")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
