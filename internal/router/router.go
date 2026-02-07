package router

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/guardiangate/api/internal/handler"
	"github.com/guardiangate/api/internal/handler/middleware"
)

type Handlers struct {
	Auth        *handler.AuthHandler
	Family      *handler.FamilyHandler
	Child       *handler.ChildHandler
	Policy      *handler.PolicyHandler
	Platform    *handler.PlatformHandler
	Enforcement *handler.EnforcementHandler
	Rating      *handler.RatingHandler
	Webhook     *handler.WebhookHandler
	Report      *handler.ReportHandler
	Setup       *handler.SetupHandler
}

func New(h Handlers, jwtSecret []byte, rateLimitRPS int) http.Handler {
	r := chi.NewRouter()

	// Global middleware
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(middleware.Logging)
	r.Use(chimiddleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "https://*.guardiangate.io"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
	if rateLimitRPS > 0 {
		r.Use(middleware.RateLimit(rateLimitRPS))
	}

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})

	// API v1
	r.Route("/api/v1", func(r chi.Router) {
		// Public routes
		r.Group(func(r chi.Router) {
			r.Post("/auth/register", h.Auth.Register)
			r.Post("/auth/login", h.Auth.Login)
			r.Post("/auth/refresh", h.Auth.Refresh)

			// Public rating lookups
			r.Get("/ratings/systems", h.Rating.GetSystems)
			r.Get("/ratings/systems/{systemID}", h.Rating.GetBySystem)
			r.Get("/ratings/by-age", h.Rating.GetByAge)
			r.Get("/ratings/{ratingID}/convert", h.Rating.Convert)
			r.Get("/ratings/systems/{systemID}/descriptors", h.Rating.GetDescriptors)

			// Public platform listing
			r.Get("/platforms", h.Platform.List)
			r.Get("/platforms/{platformID}", h.Platform.Get)
			r.Get("/platforms/by-category", h.Platform.ListByCategory)
			r.Get("/platforms/by-capability", h.Platform.ListByCapability)

			// OAuth callbacks
			r.Get("/platforms/{platformID}/oauth/authorize", h.Platform.OAuthAuthorize)
			r.Get("/platforms/{platformID}/oauth/callback", h.Platform.OAuthCallback)
		})

		// Protected routes
		r.Group(func(r chi.Router) {
			r.Use(middleware.JWTAuth(jwtSecret))

			// Auth
			r.Post("/auth/logout", h.Auth.Logout)
			r.Get("/auth/me", h.Auth.Me)

			// Quick Setup
			r.Post("/setup/quick", h.Setup.QuickSetup)

			// Families
			r.Route("/families", func(r chi.Router) {
				r.Get("/", h.Family.List)
				r.Post("/", h.Family.Create)

				r.Route("/{familyID}", func(r chi.Router) {
					r.Get("/", h.Family.Get)
					r.Put("/", h.Family.Update)
					r.Delete("/", h.Family.Delete)

					// Members
					r.Get("/members", h.Family.ListMembers)
					r.Post("/members", h.Family.AddMember)
					r.Delete("/members/{memberID}", h.Family.RemoveMember)

					// Children under family
					r.Get("/children", h.Child.List)
					r.Post("/children", h.Child.Create)

					// Compliance links under family
					r.Get("/compliance", h.Platform.ListComplianceLinks)

					// Webhooks under family
					r.Get("/webhooks", h.Webhook.ListByFamily)

					// Reports
					r.Get("/reports/overview", h.Report.FamilyOverview)
				})
			})

			// Children (direct access)
			r.Route("/children/{childID}", func(r chi.Router) {
				r.Get("/", h.Child.Get)
				r.Put("/", h.Child.Update)
				r.Delete("/", h.Child.Delete)
				r.Get("/age-ratings", h.Child.GetAgeRatings)

				// Policies under child
				r.Get("/policies", h.Policy.List)
				r.Post("/policies", h.Policy.Create)

				// Enforcement for child
				r.Post("/enforce", h.Enforcement.TriggerChildEnforcement)
				r.Get("/enforcement/jobs", h.Enforcement.ListChildJobs)
			})

			// Policies (direct access)
			r.Route("/policies/{policyID}", func(r chi.Router) {
				r.Get("/", h.Policy.Get)
				r.Put("/", h.Policy.Update)
				r.Delete("/", h.Policy.Delete)
				r.Post("/activate", h.Policy.Activate)
				r.Post("/pause", h.Policy.Pause)
				r.Post("/generate-from-age", h.Policy.GenerateFromAge)

				// Rules under policy
				r.Get("/rules", h.Policy.ListRules)
				r.Post("/rules", h.Policy.CreateRule)
				r.Put("/rules/bulk", h.Policy.BulkUpsertRules)
			})

			// Rules (direct access)
			r.Route("/rules/{ruleID}", func(r chi.Router) {
				r.Put("/", h.Policy.UpdateRule)
				r.Delete("/", h.Policy.DeleteRule)
			})

			// Compliance
			r.Post("/compliance", h.Platform.VerifyCompliance)
			r.Route("/compliance/{linkID}", func(r chi.Router) {
				r.Delete("/", h.Platform.RevokeCertification)
				r.Post("/verify", h.Platform.VerifyLink)
				r.Post("/enforce", h.Enforcement.TriggerLinkEnforcement)
			})

			// Enforcement jobs
			r.Route("/enforcement/jobs/{jobID}", func(r chi.Router) {
				r.Get("/", h.Enforcement.GetJob)
				r.Get("/results", h.Enforcement.GetJobResults)
				r.Post("/retry", h.Enforcement.RetryJob)
			})

			// Webhooks
			r.Post("/webhooks", h.Webhook.Create)
			r.Route("/webhooks/{webhookID}", func(r chi.Router) {
				r.Get("/", h.Webhook.Get)
				r.Put("/", h.Webhook.Update)
				r.Delete("/", h.Webhook.Delete)
				r.Post("/test", h.Webhook.Test)
				r.Get("/deliveries", h.Webhook.ListDeliveries)
			})
		})
	})

	return r
}
