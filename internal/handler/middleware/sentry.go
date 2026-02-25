package middleware

import (
	"net/http"

	"github.com/getsentry/sentry-go"
)

// SentryRecovery captures panics and reports them to Sentry, then re-panics
// so the default recovery middleware can handle the response.
func SentryRecovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		hub := sentry.GetHubFromContext(r.Context())
		if hub == nil {
			hub = sentry.CurrentHub().Clone()
		}
		hub.Scope().SetRequest(r)
		ctx := sentry.SetHubOnContext(r.Context(), hub)

		defer func() {
			if err := recover(); err != nil {
				hub.RecoverWithContext(ctx, err)
				panic(err)
			}
		}()

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
