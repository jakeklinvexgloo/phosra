package middleware

import (
	"context"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/repository"
	"github.com/guardiangate/api/pkg/httputil"
)

// sandboxUsers maps session IDs to pre-created user UUIDs for sandbox mode.
var (
	sandboxUsers = make(map[string]uuid.UUID)
	sandboxMu    sync.RWMutex
)

// SandboxAuth is a lightweight auth middleware for sandbox/playground mode.
// Instead of validating WorkOS JWTs, it accepts an X-Sandbox-Session header
// and creates or retrieves a sandbox user keyed by that session ID.
// If no session header is provided, it falls back to a default sandbox session.
func SandboxAuth(userRepo repository.UserRepository) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			sessionID := r.Header.Get("X-Sandbox-Session")
			if sessionID == "" {
				// Also accept from Authorization header for compatibility
				auth := r.Header.Get("Authorization")
				if strings.HasPrefix(auth, "Bearer sandbox-") {
					sessionID = strings.TrimPrefix(auth, "Bearer ")
				} else {
					sessionID = "default"
				}
			}

			sandboxMu.RLock()
			userID, exists := sandboxUsers[sessionID]
			sandboxMu.RUnlock()

			if !exists {
				// Create a sandbox user
				now := time.Now()
				user := &domain.User{
					ID:        uuid.New(),
					ExternalAuthID: "sandbox-" + sessionID,
					Email:     "sandbox-" + sessionID + "@playground.phosra.dev",
					Name:      "Playground User",
					CreatedAt: now,
					UpdatedAt: now,
				}

				// Check if already exists in DB (e.g., from a previous server restart)
				existing, _ := userRepo.GetByExternalAuthID(r.Context(), user.ExternalAuthID)
				if existing != nil {
					user = existing
					// Ensure sandbox users are admins
					if !user.IsAdmin {
						user.IsAdmin = true
						_ = userRepo.Update(r.Context(), user)
					}
				} else {
					// Sandbox users are always admins (playground environment)
					user.IsAdmin = true
					if err := userRepo.Create(r.Context(), user); err != nil {
						httputil.Error(w, http.StatusInternalServerError, "failed to create sandbox user")
						return
					}
				}

				sandboxMu.Lock()
				sandboxUsers[sessionID] = user.ID
				sandboxMu.Unlock()
				userID = user.ID
			}

			ctx := context.WithValue(r.Context(), UserIDKey, userID)
			ctx = context.WithValue(ctx, SandboxKey, true)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
