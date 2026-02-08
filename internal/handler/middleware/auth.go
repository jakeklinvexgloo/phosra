package middleware

import (
	"context"
	"net/http"
	"time"

	"github.com/clerk/clerk-sdk-go/v2"
	clerkhttp "github.com/clerk/clerk-sdk-go/v2/http"
	clerkuser "github.com/clerk/clerk-sdk-go/v2/user"
	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/repository"
	"github.com/guardiangate/api/pkg/httputil"
)

type contextKey string

const UserIDKey contextKey = "user_id"

// ClerkAuth validates Clerk session tokens and resolves the Clerk user ID
// to a local UUID. If the user doesn't exist locally, it creates one (just-in-time sync).
func ClerkAuth(userRepo repository.UserRepository) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return clerkhttp.WithHeaderAuthorization()(
			http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				claims, ok := clerk.SessionClaimsFromContext(r.Context())
				if !ok {
					httputil.Error(w, http.StatusUnauthorized, "unauthorized")
					return
				}

				clerkID := claims.Subject

				// Look up local user by Clerk ID
				user, err := userRepo.GetByClerkID(r.Context(), clerkID)
				if err != nil {
					httputil.Error(w, http.StatusInternalServerError, "failed to look up user")
					return
				}

				// Just-in-time user creation if no local mapping exists
				if user == nil {
					clerkUsr, clerkErr := clerkuser.Get(r.Context(), clerkID)
					if clerkErr != nil {
						httputil.Error(w, http.StatusInternalServerError, "failed to fetch user from Clerk")
						return
					}

					emailAddr := ""
					if len(clerkUsr.EmailAddresses) > 0 {
						emailAddr = clerkUsr.EmailAddresses[0].EmailAddress
					}
					name := ""
					if clerkUsr.FirstName != nil {
						name = *clerkUsr.FirstName
					}
					if clerkUsr.LastName != nil {
						if name != "" {
							name += " "
						}
						name += *clerkUsr.LastName
					}

					now := time.Now()
					user = &domain.User{
						ID:        uuid.New(),
						ClerkID:   clerkID,
						Email:     emailAddr,
						Name:      name,
						CreatedAt: now,
						UpdatedAt: now,
					}
					if createErr := userRepo.Create(r.Context(), user); createErr != nil {
						httputil.Error(w, http.StatusInternalServerError, "failed to create user")
						return
					}
				}

				ctx := context.WithValue(r.Context(), UserIDKey, user.ID)
				next.ServeHTTP(w, r.WithContext(ctx))
			}),
		)
	}
}

// GetUserID extracts the local user UUID from context (same signature as before).
func GetUserID(ctx context.Context) uuid.UUID {
	id, _ := ctx.Value(UserIDKey).(uuid.UUID)
	return id
}
