package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/guardiangate/api/pkg/httputil"
	"github.com/lestrrat-go/jwx/v2/jwa"
	"github.com/lestrrat-go/jwx/v2/jwt"
)

type contextKey string

const UserIDKey contextKey = "user_id"

func JWTAuth(secret []byte) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				httputil.Error(w, http.StatusUnauthorized, "missing authorization header")
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || !strings.EqualFold(parts[0], "bearer") {
				httputil.Error(w, http.StatusUnauthorized, "invalid authorization format")
				return
			}

			token, err := jwt.Parse([]byte(parts[1]), jwt.WithKey(jwa.HS256, secret))
			if err != nil {
				httputil.Error(w, http.StatusUnauthorized, "invalid or expired token")
				return
			}

			userID, err := uuid.Parse(token.Subject())
			if err != nil {
				httputil.Error(w, http.StatusUnauthorized, "invalid token subject")
				return
			}

			ctx := context.WithValue(r.Context(), UserIDKey, userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func GetUserID(ctx context.Context) uuid.UUID {
	id, _ := ctx.Value(UserIDKey).(uuid.UUID)
	return id
}
