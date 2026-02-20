package middleware

import (
	"net/http"

	"github.com/guardiangate/api/internal/repository"
	"github.com/guardiangate/api/pkg/httputil"
)

// RequireAdmin is middleware that checks the authenticated user's is_admin flag.
// It must be used after an auth middleware that sets UserIDKey in context.
func RequireAdmin(userRepo repository.UserRepository) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userID := GetUserID(r.Context())
			if userID.String() == "00000000-0000-0000-0000-000000000000" {
				httputil.Error(w, http.StatusUnauthorized, "authentication required")
				return
			}

			user, err := userRepo.GetByID(r.Context(), userID)
			if err != nil {
				httputil.Error(w, http.StatusInternalServerError, "failed to look up user")
				return
			}
			if user == nil || !user.IsAdmin {
				httputil.Error(w, http.StatusForbidden, "admin access required")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
