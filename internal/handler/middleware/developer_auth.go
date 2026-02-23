package middleware

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"

	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/pkg/httputil"
)

const (
	DeveloperOrgIDKey  contextKey = "developer_org_id"
	DeveloperScopesKey contextKey = "developer_scopes"
	DeveloperKeyIDKey  contextKey = "developer_key_id"
)

// DeveloperKeyAuthenticator is the interface the middleware needs to look up and
// update developer API keys.
type DeveloperKeyAuthenticator interface {
	GetKeyByHash(ctx context.Context, hash string) (*domain.DeveloperAPIKey, error)
	UpdateKeyLastUsed(ctx context.Context, id uuid.UUID, ip string) error
}

// DeveloperKeyAuth validates requests using Bearer phosra_live_* / phosra_test_*
// tokens in the Authorization header, or an X-Api-Key header as fallback.
// If the key prefix does not match, the request is passed through to the next
// handler (allowing JWT auth middleware to handle it).
func DeveloperKeyAuth(repo DeveloperKeyAuthenticator) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Extract the API key from Authorization header or X-Api-Key fallback.
			apiKey := ""

			if auth := r.Header.Get("Authorization"); strings.HasPrefix(auth, "Bearer phosra_") {
				apiKey = strings.TrimPrefix(auth, "Bearer ")
			} else if xKey := r.Header.Get("X-Api-Key"); strings.HasPrefix(xKey, "phosra_") {
				apiKey = xKey
			}

			// If no phosra_ prefixed key found, pass through to other auth middleware.
			if apiKey == "" {
				next.ServeHTTP(w, r)
				return
			}

			// SHA-256 hash the key for lookup.
			hash := sha256.Sum256([]byte(apiKey))
			keyHash := hex.EncodeToString(hash[:])

			key, err := repo.GetKeyByHash(r.Context(), keyHash)
			if err != nil {
				log.Error().Err(err).Msg("developer key lookup failed")
				httputil.Error(w, http.StatusInternalServerError, "internal error")
				return
			}
			if key == nil {
				httputil.Error(w, http.StatusUnauthorized, "invalid API key")
				return
			}

			// Reject revoked keys.
			if key.RevokedAt != nil {
				httputil.Error(w, http.StatusUnauthorized, "API key has been revoked")
				return
			}

			// Reject expired keys.
			if key.ExpiresAt != nil && key.ExpiresAt.Before(time.Now()) {
				httputil.Error(w, http.StatusUnauthorized, "API key has expired")
				return
			}

			// Update last_used_at and last_used_ip in a goroutine (non-blocking).
			ip := r.RemoteAddr
			if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
				ip = strings.Split(forwarded, ",")[0]
				ip = strings.TrimSpace(ip)
			}
			go func() {
				if err := repo.UpdateKeyLastUsed(context.Background(), key.ID, ip); err != nil {
					log.Error().Err(err).Str("key_id", key.ID.String()).Msg("failed to update key last_used")
				}
			}()

			// Store org ID, scopes, and key ID in the request context.
			ctx := r.Context()
			ctx = context.WithValue(ctx, DeveloperOrgIDKey, key.OrgID)
			ctx = context.WithValue(ctx, DeveloperScopesKey, key.Scopes)
			ctx = context.WithValue(ctx, DeveloperKeyIDKey, key.ID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireScopes returns middleware that verifies the developer API key in context
// has all of the required scopes. Returns 403 if any scope is missing.
func RequireScopes(required ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			scopes := GetDeveloperScopes(r.Context())
			if scopes == nil {
				httputil.Error(w, http.StatusForbidden, "no API scopes in context")
				return
			}

			scopeSet := make(map[string]struct{}, len(scopes))
			for _, s := range scopes {
				scopeSet[s] = struct{}{}
			}

			for _, req := range required {
				if _, ok := scopeSet[req]; !ok {
					httputil.Error(w, http.StatusForbidden, "missing required scope: "+req)
					return
				}
			}

			next.ServeHTTP(w, r)
		})
	}
}

// GetDeveloperOrgID extracts the developer org UUID from context.
func GetDeveloperOrgID(ctx context.Context) uuid.UUID {
	id, _ := ctx.Value(DeveloperOrgIDKey).(uuid.UUID)
	return id
}

// GetDeveloperScopes extracts the developer API key scopes from context.
func GetDeveloperScopes(ctx context.Context) []string {
	scopes, _ := ctx.Value(DeveloperScopesKey).([]string)
	return scopes
}

// GetDeveloperKeyID extracts the developer API key UUID from context.
func GetDeveloperKeyID(ctx context.Context) uuid.UUID {
	id, _ := ctx.Value(DeveloperKeyIDKey).(uuid.UUID)
	return id
}
