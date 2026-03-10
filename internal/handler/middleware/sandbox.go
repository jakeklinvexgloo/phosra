package middleware

import (
	"context"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/repository"
	"github.com/guardiangate/api/pkg/httputil"
	"github.com/rs/zerolog/log"
)

// sandboxUsers maps session IDs to pre-created user UUIDs for sandbox mode.
var (
	sandboxUsers = make(map[string]uuid.UUID)
	sandboxMu    sync.RWMutex
)

// SandboxAuth is a lightweight auth middleware for sandbox/playground mode.
// Instead of validating JWTs, it accepts an X-Sandbox-Session header
// and creates or retrieves a sandbox user keyed by that session ID.
// If no session header is provided, it falls back to a default sandbox session.
//
// SECURITY: This middleware must NEVER be active in production. The router
// guards against this, but we add a fatal check here as defense-in-depth.
func SandboxAuth(userRepo repository.UserRepository) func(http.Handler) http.Handler {
	if os.Getenv("PHOSRA_ENV") == "production" {
		log.Fatal().Msg("FATAL: SandboxAuth middleware activated in production — refusing to start")
	}

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
					// Sandbox users must never have admin privileges
					if user.IsAdmin {
						user.IsAdmin = false
						_ = userRepo.Update(r.Context(), user)
					}
				} else {
					// Sandbox users are never admins — admin routes require real auth
					user.IsAdmin = false
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
