package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/go-chi/httprate"
	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/pkg/httputil"
	"github.com/rs/zerolog/log"
)

func RateLimit(requestsPerMinute int) func(http.Handler) http.Handler {
	return httprate.LimitByIP(requestsPerMinute, time.Minute)
}

// DeveloperRateLimit enforces per-org rate limits using the rate_limit_rpm value
// stored in the developer_orgs table. Each org gets its own limiter instance,
// lazily created on first request.
func DeveloperRateLimit(repo DeveloperKeyAuthenticator) func(http.Handler) http.Handler {
	var mu sync.RWMutex
	type limiterEntry struct {
		limiter http.Handler
		rpm     int
	}
	limiters := make(map[uuid.UUID]*limiterEntry)

	getLimiter := func(orgID uuid.UUID, rpm int) http.Handler {
		mu.RLock()
		entry, ok := limiters[orgID]
		mu.RUnlock()
		if ok && entry.rpm == rpm {
			return entry.limiter
		}

		mu.Lock()
		defer mu.Unlock()
		// Double-check after acquiring write lock.
		if entry, ok := limiters[orgID]; ok && entry.rpm == rpm {
			return entry.limiter
		}

		// Create a per-org key function limiter. We use a dummy handler
		// and wrap it with httprate's limiter keyed by org ID string.
		lim := httprate.Limit(rpm, time.Minute, httprate.WithKeyFuncs(
			func(r *http.Request) (string, error) {
				return orgID.String(), nil
			},
		))
		limiters[orgID] = &limiterEntry{limiter: lim(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {})), rpm: rpm}
		return limiters[orgID].limiter
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			orgID := GetDeveloperOrgID(r.Context())
			if orgID == uuid.Nil {
				next.ServeHTTP(w, r)
				return
			}

			// Look up org to get current rate limit.
			org, err := repo.GetOrg(r.Context(), orgID)
			if err != nil {
				log.Error().Err(err).Str("org_id", orgID.String()).Msg("failed to look up org for rate limit")
				next.ServeHTTP(w, r)
				return
			}

			rpm := domain.DefaultFreeRateLimitRPM
			if org != nil && org.RateLimitRPM > 0 {
				rpm = org.RateLimitRPM
			}

			// Use the per-org limiter as a gate: serve a test request to it,
			// and if it writes a 429, we stop.
			rec := &rateLimitRecorder{}
			limHandler := getLimiter(orgID, rpm)
			limHandler.ServeHTTP(rec, r)
			if rec.status == http.StatusTooManyRequests {
				httputil.Error(w, http.StatusTooManyRequests, "rate limit exceeded")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// rateLimitRecorder captures the status code from httprate's limiter.
type rateLimitRecorder struct {
	status int
	header http.Header
}

func (r *rateLimitRecorder) Header() http.Header {
	if r.header == nil {
		r.header = make(http.Header)
	}
	return r.header
}

func (r *rateLimitRecorder) Write(b []byte) (int, error) {
	return len(b), nil
}

func (r *rateLimitRecorder) WriteHeader(code int) {
	r.status = code
}
