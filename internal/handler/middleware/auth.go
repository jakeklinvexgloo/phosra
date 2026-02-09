package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/workos/workos-go/v6/pkg/usermanagement"

	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/repository"
	"github.com/guardiangate/api/pkg/httputil"
)

type contextKey string

const UserIDKey contextKey = "user_id"
const SandboxKey contextKey = "sandbox_mode"

// IsSandbox returns true if the request context indicates sandbox mode.
func IsSandbox(ctx context.Context) bool {
	v, _ := ctx.Value(SandboxKey).(bool)
	return v
}

// WorkOSAuth validates WorkOS access tokens via JWKS and resolves the WorkOS
// user ID to a local UUID. If the user doesn't exist locally, it creates one
// (just-in-time provisioning).
func WorkOSAuth(clientID string, userRepo repository.UserRepository) func(http.Handler) http.Handler {
	// Set up JWKS key function for WorkOS token validation
	jwksURL := fmt.Sprintf("https://api.workos.com/sso/jwks/%s", clientID)
	jwks, err := keyfunc.NewDefault([]string{jwksURL})
	if err != nil {
		log.Fatal().Err(err).Msg("failed to create JWKS keyfunc for WorkOS")
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Extract Bearer token from Authorization header
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				httputil.Error(w, http.StatusUnauthorized, "missing authorization header")
				return
			}

			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			if tokenString == authHeader {
				httputil.Error(w, http.StatusUnauthorized, "invalid authorization header format")
				return
			}

			// Parse and validate the JWT using WorkOS JWKS
			token, err := jwt.Parse(tokenString, jwks.KeyfuncCtx(r.Context()),
				jwt.WithIssuer("https://api.workos.com/"),
			)
			if err != nil || !token.Valid {
				httputil.Error(w, http.StatusUnauthorized, "invalid or expired token")
				return
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				httputil.Error(w, http.StatusUnauthorized, "invalid token claims")
				return
			}

			workosUserID, ok := claims["sub"].(string)
			if !ok || workosUserID == "" {
				httputil.Error(w, http.StatusUnauthorized, "missing subject in token")
				return
			}

			// Look up local user by WorkOS user ID
			user, err := userRepo.GetByExternalAuthID(r.Context(), workosUserID)
			if err != nil {
				httputil.Error(w, http.StatusInternalServerError, "failed to look up user")
				return
			}

			// Just-in-time user creation if no local mapping exists
			if user == nil {
				workosUsr, workosErr := usermanagement.GetUser(r.Context(),
					usermanagement.GetUserOpts{User: workosUserID})
				if workosErr != nil {
					httputil.Error(w, http.StatusInternalServerError, "failed to fetch user from WorkOS")
					return
				}

				name := strings.TrimSpace(workosUsr.FirstName + " " + workosUsr.LastName)

				now := time.Now()
				user = &domain.User{
					ID:             uuid.New(),
					ExternalAuthID: workosUserID,
					Email:          workosUsr.Email,
					Name:           name,
					CreatedAt:      now,
					UpdatedAt:      now,
				}
				if createErr := userRepo.Create(r.Context(), user); createErr != nil {
					httputil.Error(w, http.StatusInternalServerError, "failed to create user")
					return
				}
			}

			ctx := context.WithValue(r.Context(), UserIDKey, user.ID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetUserID extracts the local user UUID from context.
func GetUserID(ctx context.Context) uuid.UUID {
	id, _ := ctx.Value(UserIDKey).(uuid.UUID)
	return id
}
