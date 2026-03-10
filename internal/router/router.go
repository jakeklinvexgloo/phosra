package router

import (
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/handler"
	"github.com/guardiangate/api/internal/handler/middleware"
	"github.com/guardiangate/api/internal/repository"
)

type options struct {
	sandboxMode     bool
	corsOrigins     string
	stytchProjectID string
	workerAPIKey     string
}

// Option configures the router.
type Option func(*options)

// WithSandboxMode enables sandbox authentication (session-based users).
func WithSandboxMode() Option {
	return func(o *options) { o.sandboxMode = true }
}

// WithStytchProjectID sets the Stytch project ID for JWT validation.
func WithStytchProjectID(projectID string) Option {
	return func(o *options) { o.stytchProjectID = projectID }
}

// WithCORSOrigins sets the allowed CORS origins (comma-separated).
func WithCORSOrigins(origins string) Option {
	return func(o *options) { o.corsOrigins = origins }
}

// WithWorkerAPIKey sets the shared secret for worker authentication.
func WithWorkerAPIKey(key string) Option {
	return func(o *options) { o.workerAPIKey = key }
}

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
	Feedback    *handler.FeedbackHandler
	Standard    *handler.StandardHandler
	Device      *handler.DeviceHandler
	Admin      *handler.AdminHandler
	AdminPitch *handler.AdminPitchHandler
	Developer  *handler.DeveloperHandler
	Source              *handler.SourceHandler
	BrowserEnforcement *handler.BrowserEnforcementHandler
	ConfigAgent        *handler.ConfigAgentHandler
	ViewingHistory     *handler.ViewingHistoryHandler
}

func New(h Handlers, userRepo repository.UserRepository, deviceAuth middleware.DeviceAuthenticator, devKeyAuth middleware.DeveloperKeyAuthenticator, rateLimitRPS int, opts ...Option) http.Handler {
	o := &options{}
	for _, opt := range opts {
		opt(o)
	}

	// Build the auth middleware once based on config priority:
	// 1. Sandbox mode (dev/playground)
	// 2. Stytch JWT validation (production)
	var authMiddleware func(http.Handler) http.Handler
	if o.sandboxMode {
		authMiddleware = middleware.SandboxAuth(userRepo)
	} else if o.stytchProjectID != "" {
		authMiddleware = middleware.StytchAuth(o.stytchProjectID, userRepo)
	} else {
		authMiddleware = middleware.SandboxAuth(userRepo) // fallback for local dev
	}

	r := chi.NewRouter()

	// Global middleware
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(middleware.SentryRecovery)
	r.Use(middleware.Logging)
	r.Use(chimiddleware.Recoverer)
	corsOrigins := []string{"http://localhost:3000"}
	if o.corsOrigins != "" {
		corsOrigins = strings.Split(o.corsOrigins, ",")
	}
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   corsOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Sandbox-Session", "X-Device-Key", "X-Worker-Key", "X-Api-Key"},
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
			// Public rating lookups
			r.Get("/ratings/systems", h.Rating.GetSystems)
			r.Get("/ratings/systems/{systemId}", h.Rating.GetBySystem)
			r.Get("/ratings/by-age", h.Rating.GetByAge)
			r.Get("/ratings/{ratingId}/convert", h.Rating.Convert)
			r.Get("/ratings/systems/{systemId}/descriptors", h.Rating.GetDescriptors)

			// Public platform listing
			r.Get("/platforms", h.Platform.List)
			r.Get("/platforms/{platformId}", h.Platform.Get)
			r.Get("/platforms/by-category", h.Platform.ListByCategory)
			r.Get("/platforms/by-capability", h.Platform.ListByCapability)

			// OAuth callbacks
			r.Get("/platforms/{platformId}/oauth/authorize", h.Platform.OAuthAuthorize)
			r.Get("/platforms/{platformId}/oauth/callback", h.Platform.OAuthCallback)

			// UI Feedback (public: reviewers submit without auth)
			r.Post("/feedback", h.Feedback.Create)
			r.Get("/feedback", h.Feedback.List)

			// Public community standards/movements (browsable without auth)
			r.Get("/standards", h.Standard.List)
			r.Get("/standards/{slug}", h.Standard.GetBySlug)
			r.Get("/movements", h.Standard.List)
			r.Get("/movements/{slug}", h.Standard.GetBySlug)

			// Public platform mappings (Apple bundle IDs, age ratings, etc.)
			r.Get("/platform-mappings/{platformId}", h.Device.GetMappings)

			// Inbound webhooks from source integrations (verified by webhook secret, no auth)
			r.Post("/webhooks/inbound/{sourceSlug}", h.Source.InboundWebhook)
		})

		// Protected routes
		r.Group(func(r chi.Router) {
			r.Use(authMiddleware)

			// Auth
			r.Post("/auth/logout", h.Auth.Logout)
			r.Get("/auth/me", h.Auth.Me)

			// Quick Setup
			r.Post("/setup/quick", h.Setup.QuickSetup)

			// Families
			r.Route("/families", func(r chi.Router) {
				r.Get("/", h.Family.List)
				r.Post("/", h.Family.Create)

				r.Route("/{familyId}", func(r chi.Router) {
					r.Get("/", h.Family.Get)
					r.Put("/", h.Family.Update)
					r.Delete("/", h.Family.Delete)

					// Members
					r.Get("/members", h.Family.ListMembers)
					r.Post("/members", h.Family.AddMember)
					r.Put("/members/{memberId}", h.Family.UpdateMember)
					r.Delete("/members/{memberId}", h.Family.RemoveMember)

					// Children under family
					r.Get("/children", h.Child.List)
					r.Post("/children", h.Child.Create)

					// Compliance links under family
					r.Get("/compliance", h.Platform.ListComplianceLinks)

					// Webhooks under family
					r.Get("/webhooks", h.Webhook.ListByFamily)

					// Reports
					r.Get("/reports/overview", h.Report.FamilyOverview)

					// Sources under family
					r.Get("/sources", h.Source.ListByFamily)
				})
			})

			// Children (direct access)
			r.Route("/children/{childId}", func(r chi.Router) {
				r.Get("/", h.Child.Get)
				r.Put("/", h.Child.Update)
				r.Delete("/", h.Child.Delete)
				r.Get("/age-ratings", h.Child.GetAgeRatings)

				// Policies under child
				r.Get("/policies", h.Policy.List)
				r.Post("/policies", h.Policy.Create)

				// Device registrations under child (parent-auth)
				r.Post("/devices", h.Device.RegisterDevice)
				r.Get("/devices", h.Device.ListDevices)

				// Community standards/movements under child
				r.Get("/standards", h.Standard.ListByChild)
				r.Post("/standards", h.Standard.Adopt)
				r.Delete("/standards/{standardId}", h.Standard.Unadopt)
				r.Get("/movements", h.Standard.ListByChild)
				r.Post("/movements", h.Standard.Adopt)
				r.Delete("/movements/{standardId}", h.Standard.Unadopt)

				// Enforcement for child
				r.Post("/enforce", h.Enforcement.TriggerChildEnforcement)
				r.Get("/enforcement/jobs", h.Enforcement.ListChildJobs)

				// Emergency pause/resume
				r.Post("/emergency-pause", h.Enforcement.EmergencyPause)
				r.Post("/emergency-resume", h.Enforcement.EmergencyResume)

				// Routines
				r.Post("/routines/{routineName}/activate", h.Enforcement.ActivateRoutine)
				r.Post("/routines/{routineName}/deactivate", h.Enforcement.DeactivateRoutine)

				// Sources under child
				r.Get("/sources", h.Source.ListByChild)
			})

			// Device direct access (parent-auth)
			r.Route("/devices/{deviceId}", func(r chi.Router) {
				r.Put("/", h.Device.UpdateDevice)
				r.Delete("/", h.Device.RevokeDevice)
			})

			// Policies (direct access)
			r.Route("/policies/{policyId}", func(r chi.Router) {
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
			r.Route("/rules/{ruleId}", func(r chi.Router) {
				r.Put("/", h.Policy.UpdateRule)
				r.Delete("/", h.Policy.DeleteRule)
			})

			// Compliance
			r.Post("/compliance", h.Platform.VerifyCompliance)
			r.Route("/compliance/{linkId}", func(r chi.Router) {
				r.Delete("/", h.Platform.RevokeCertification)
				r.Post("/verify", h.Platform.VerifyLink)
				r.Post("/enforce", h.Enforcement.TriggerLinkEnforcement)
			})

			// Enforcement jobs
			r.Route("/enforcement/jobs/{jobId}", func(r chi.Router) {
				r.Get("/", h.Enforcement.GetJob)
				r.Get("/results", h.Enforcement.GetJobResults)
				r.Post("/retry", h.Enforcement.RetryJob)
			})

			// Sources API
			r.Route("/sources", func(r chi.Router) {
				r.Get("/available", h.Source.ListAvailable)
				r.Post("/", h.Source.ConnectSource)
				r.Route("/{sourceId}", func(r chi.Router) {
					r.Get("/", h.Source.GetSource)
					r.Delete("/", h.Source.DisconnectSource)
					r.Post("/sync", h.Source.SyncSource)
					r.Post("/rules", h.Source.PushRule)
					r.Get("/guide/{category}", h.Source.GetGuidedSteps)
					r.Route("/jobs", func(r chi.Router) {
						r.Get("/", h.Source.ListSyncJobs)
						r.Route("/{jobId}", func(r chi.Router) {
							r.Get("/", h.Source.GetSyncJob)
							r.Get("/results", h.Source.GetSyncResults)
							r.Post("/retry", h.Source.RetrySyncJob)
						})
					})
				})
			})

			// UI Feedback (protected: only owner can change status)
			r.Patch("/feedback/{feedbackId}/status", h.Feedback.UpdateStatus)

			// Webhooks
			r.Post("/webhooks", h.Webhook.Create)
			r.Route("/webhooks/{webhookId}", func(r chi.Router) {
				r.Get("/", h.Webhook.Get)
				r.Put("/", h.Webhook.Update)
				r.Delete("/", h.Webhook.Delete)
				r.Post("/test", h.Webhook.Test)
				r.Get("/deliveries", h.Webhook.ListDeliveries)
			})
		})

		// Viewing History & CSM
		r.Route("/viewing-history", func(r chi.Router) {
			r.Use(authMiddleware)
			r.Post("/sync", h.ViewingHistory.SyncHistory)
			r.Post("/link-csm", h.ViewingHistory.LinkCSM)
			r.Get("/{childId}", h.ViewingHistory.GetChildHistory)
			r.Delete("/{childId}", h.ViewingHistory.DeleteChildHistory)
		})
		r.Route("/csm", func(r chi.Router) {
			r.Use(authMiddleware)
			r.Get("/review/{slug}", h.ViewingHistory.GetCSMReview)
			r.Post("/reviews/bulk", h.ViewingHistory.BulkUpsertReviews)
			r.Get("/reviews/by-family/{familyId}", h.ViewingHistory.GetCSMReviewsByFamily)
		})
		r.Group(func(r chi.Router) {
			r.Use(authMiddleware)
			r.Get("/viewing-analytics/{childId}", h.ViewingHistory.GetAnalytics)
		})

		// Config Agent State
		r.Route("/config-agent/state", func(r chi.Router) {
			r.Use(authMiddleware)
			r.Route("/{platform}", func(r chi.Router) {
				r.Get("/", h.ConfigAgent.GetState)
				r.Put("/", h.ConfigAgent.SaveState)
				r.Delete("/", h.ConfigAgent.DeleteState)
			})
		})

		// Browser Enforcement
		r.Route("/enforce", func(r chi.Router) {
			r.Use(authMiddleware)

			r.Post("/", h.BrowserEnforcement.CreateJob)
			r.Get("/history", h.BrowserEnforcement.ListJobs)
			r.Route("/{jobId}", func(r chi.Router) {
				r.Get("/", h.BrowserEnforcement.GetJob)
				r.Get("/audit", h.BrowserEnforcement.GetJobAuditLog)
				r.Delete("/", h.BrowserEnforcement.CancelJob)
			})
		})

		// Developer Portal (user JWT auth)
		r.Route("/developers", func(r chi.Router) {
			r.Use(authMiddleware)

			r.Post("/orgs", h.Developer.CreateOrg)
			r.Get("/orgs", h.Developer.ListOrgs)
			r.Route("/orgs/{orgId}", func(r chi.Router) {
				r.Get("/", h.Developer.GetOrg)
				r.Put("/", h.Developer.UpdateOrg)
				r.Delete("/", h.Developer.DeleteOrg)
				r.Get("/members", h.Developer.ListMembers)
				r.Post("/keys", h.Developer.CreateKey)
				r.Get("/keys", h.Developer.ListKeys)
				r.Delete("/keys/{keyId}", h.Developer.RevokeKey)
				r.Post("/keys/{keyId}/regenerate", h.Developer.RegenerateKey)
				r.Get("/usage", h.Developer.GetUsage)
			})
		})

		// Admin routes (auth + admin role required)
		r.Route("/admin", func(r chi.Router) {
			r.Use(authMiddleware)
			r.Use(middleware.RequireAdmin(userRepo))

			r.Get("/stats", h.Admin.GetStats)

			// Outreach CRM
			r.Get("/outreach", h.Admin.ListOutreach)
			r.Route("/outreach/{contactId}", func(r chi.Router) {
				r.Get("/", h.Admin.GetOutreachContact)
				r.Patch("/", h.Admin.UpdateOutreach)
				r.Post("/activity", h.Admin.CreateOutreachActivity)
			})

			// Workers
			r.Get("/workers", h.Admin.ListWorkers)
			r.Get("/workers/{workerId}/runs", h.Admin.ListWorkerRuns)
			r.Post("/workers/{workerId}/trigger", h.Admin.TriggerWorker)

			// News
			r.Get("/news", h.Admin.ListNews)
			r.Post("/news/{newsId}/read", h.Admin.MarkNewsRead)
			r.Post("/news/{newsId}/save", h.Admin.ToggleNewsSaved)
			r.Delete("/news/{newsId}", h.Admin.DeleteNewsItem)

			// Compliance Alerts
			r.Get("/alerts", h.Admin.ListAlerts)
			r.Patch("/alerts/{alertId}", h.Admin.UpdateAlertStatus)

			// Google OAuth
			r.Get("/google/auth-url", h.Admin.GetGoogleAuthURL)
			r.Post("/google/callback", h.Admin.GoogleCallback)
			r.Get("/google/status", h.Admin.GetGoogleStatus)
			r.Delete("/google/disconnect", h.Admin.DisconnectGoogle)

			// Gmail
			r.Get("/gmail/messages", h.Admin.ListGmailMessages)
			r.Get("/gmail/messages/{messageId}", h.Admin.GetGmailMessage)
			r.Get("/gmail/threads/{threadId}", h.Admin.GetGmailThread)
			r.Post("/gmail/send", h.Admin.SendGmailMessage)
			r.Get("/gmail/search", h.Admin.SearchGmail)

			// Google Contacts
			r.Get("/google/contacts", h.Admin.ListGoogleContacts)
			r.Get("/google/contacts/search", h.Admin.SearchGoogleContacts)
			r.Get("/google/contacts/sync/preview", h.Admin.SyncGoogleContactsPreview)
			r.Post("/google/contacts/sync", h.Admin.SyncGoogleContacts)

			// Google Calendar
			r.Get("/calendar/events", h.Admin.ListCalendarEvents)
			r.Post("/calendar/events", h.Admin.CreateCalendarEvent)
			r.Delete("/calendar/events/{eventId}", h.Admin.DeleteCalendarEvent)

			// Autopilot Config
			r.Get("/outreach/autopilot/config", h.Admin.GetAutopilotConfig)
			r.Put("/outreach/autopilot/config", h.Admin.UpdateAutopilotConfig)
			r.Post("/outreach/autopilot/toggle", h.Admin.ToggleAutopilot)
			r.Get("/outreach/autopilot/stats", h.Admin.GetAutopilotStats)

			// Activity Feed
			r.Get("/outreach/activities/recent", h.Admin.ListRecentActivities)
			r.Get("/outreach/activities/summary", h.Admin.GetActivitySummary)

			// Sequences
			r.Get("/outreach/sequences", h.Admin.ListSequences)
			r.Post("/outreach/{contactId}/sequence", h.Admin.StartSequence)
			r.Post("/outreach/sequences/{sequenceId}/pause", h.Admin.PauseSequence)
			r.Post("/outreach/sequences/{sequenceId}/resume", h.Admin.ResumeSequence)
			r.Post("/outreach/sequences/{sequenceId}/cancel", h.Admin.CancelSequence)
			r.Post("/outreach/sequences/bulk-start", h.Admin.BulkStartSequences)

			// Pending Emails
			r.Get("/outreach/pending-emails", h.Admin.ListPendingEmails)
			r.Post("/outreach/pending-emails/{emailId}/approve", h.Admin.ApprovePendingEmail)
			r.Post("/outreach/pending-emails/{emailId}/queue", h.Admin.QueuePendingEmail)
			r.Post("/outreach/pending-emails/{emailId}/send", h.Admin.SendQueuedEmail)
			r.Post("/outreach/pending-emails/{emailId}/reject", h.Admin.RejectPendingEmail)
			r.Put("/outreach/pending-emails/{emailId}", h.Admin.EditPendingEmail)

			// Outreach Google OAuth (legacy single-account)
			r.Get("/outreach/google/auth-url", h.Admin.GetOutreachGoogleAuthURL)
			r.Post("/outreach/google/callback", h.Admin.OutreachGoogleCallback)
			r.Get("/outreach/google/status", h.Admin.GetOutreachGoogleStatus)
			r.Delete("/outreach/google/disconnect", h.Admin.DisconnectOutreachGoogle)

			// Multi-account Google management
			r.Get("/google/accounts", h.Admin.ListGoogleAccounts)
			r.Get("/google/accounts/{accountKey}/auth-url", h.Admin.GetGoogleAccountAuthURL)
			r.Post("/google/accounts/{accountKey}/callback", h.Admin.GoogleAccountCallback)
			r.Get("/google/accounts/{accountKey}/status", h.Admin.GetGoogleAccountStatus)
			r.Delete("/google/accounts/{accountKey}", h.Admin.DisconnectGoogleAccount)

			// Persona-to-account mapping
			r.Get("/outreach/persona-accounts", h.Admin.ListPersonaAccounts)
			r.Put("/outreach/persona-accounts/{personaKey}", h.Admin.UpsertPersonaAccount)

			// Pitch Coaching
			r.Route("/pitch", func(r chi.Router) {
				r.Post("/sessions", h.AdminPitch.CreateSession)
				r.Get("/sessions", h.AdminPitch.ListSessions)
				r.Route("/sessions/{sessionId}", func(r chi.Router) {
					r.Get("/", h.AdminPitch.GetSession)
					r.Delete("/", h.AdminPitch.DeleteSession)
					r.Get("/ws", h.AdminPitch.HandleRealtimeWS)
					r.Post("/end", h.AdminPitch.EndSession)
					r.Post("/recording", h.AdminPitch.UploadRecording)
					r.Get("/recording", h.AdminPitch.StreamRecording)
				})
			})
		})

		// Worker API routes (X-Worker-Key auth)
		r.Route("/worker", func(r chi.Router) {
			r.Use(middleware.WorkerAuth(o.workerAPIKey))

			// Gmail (via outreach account)
			r.Post("/gmail/send", h.Admin.WorkerSendGmail)
			r.Get("/gmail/search", h.Admin.WorkerSearchGmail)
			r.Get("/gmail/messages/{messageId}", h.Admin.WorkerGetGmailMessage)

			// Calendar (via outreach account)
			r.Get("/calendar/events", h.Admin.WorkerListCalendarEvents)
			r.Post("/calendar/events", h.Admin.WorkerCreateCalendarEvent)

			// Sequences
			r.Get("/outreach/sequences/active", h.Admin.WorkerListActiveSequences)
			r.Post("/outreach/sequences/{sequenceId}/advance", h.Admin.WorkerAdvanceSequence)

			// Pending emails
			r.Post("/outreach/pending-emails", h.Admin.WorkerCreatePendingEmail)
			r.Get("/outreach/sent-today", h.Admin.WorkerCountSentToday)

			// Contact management
			r.Post("/outreach/contacts/upsert-by-email", h.Admin.WorkerUpsertContactByEmail)
			r.Get("/outreach/{contactId}", h.Admin.WorkerGetContact)
			r.Patch("/outreach/{contactId}", h.Admin.WorkerUpdateContact)
			r.Post("/outreach/{contactId}/activity", h.Admin.WorkerCreateActivity)

			// Gmail sync state
			r.Get("/gmail/sync-state/{accountKey}", h.Admin.WorkerGetSyncState)
			r.Put("/gmail/sync-state/{accountKey}", h.Admin.WorkerSetSyncState)

			// Activity dedup check
			r.Get("/outreach/activity-exists/{gmailMessageId}", h.Admin.WorkerCheckActivityExists)

			// Google accounts listing
			r.Get("/google/accounts", h.Admin.WorkerListGoogleAccounts)

			// Config
			r.Get("/outreach/config", h.Admin.WorkerGetConfig)
		})

		// Device-auth routes (X-Device-Key header)
		r.Group(func(r chi.Router) {
			r.Use(middleware.DeviceAuth(deviceAuth))

			r.Get("/device/policy", h.Device.GetPolicy)
			r.Post("/device/report", h.Device.IngestReport)
			r.Post("/device/ack", h.Device.AckVersion)
		})

		// Developer API key routes (Bearer phosra_* or X-Api-Key)
		r.Route("/developer", func(r chi.Router) {
			r.Use(middleware.DeveloperKeyAuth(devKeyAuth))
			r.Use(middleware.DeveloperRateLimit(devKeyAuth))

			// Families
			r.Group(func(r chi.Router) {
				r.Use(middleware.RequireScopes(domain.ScopeReadFamilies))
				r.Get("/families", h.Family.List)
				r.Get("/families/{familyId}", h.Family.Get)
			})
			r.Group(func(r chi.Router) {
				r.Use(middleware.RequireScopes(domain.ScopeWriteFamilies))
				r.Post("/families", h.Family.Create)
				r.Put("/families/{familyId}", h.Family.Update)
			})

			// Children
			r.Group(func(r chi.Router) {
				r.Use(middleware.RequireScopes(domain.ScopeReadFamilies))
				r.Get("/families/{familyId}/children", h.Child.List)
				r.Get("/children/{childId}", h.Child.Get)
			})
			r.Group(func(r chi.Router) {
				r.Use(middleware.RequireScopes(domain.ScopeWriteFamilies))
				r.Post("/families/{familyId}/children", h.Child.Create)
				r.Put("/children/{childId}", h.Child.Update)
			})

			// Policies
			r.Group(func(r chi.Router) {
				r.Use(middleware.RequireScopes(domain.ScopeReadPolicies))
				r.Get("/children/{childId}/policies", h.Policy.List)
				r.Get("/policies/{policyId}", h.Policy.Get)
				r.Get("/policies/{policyId}/rules", h.Policy.ListRules)
			})
			r.Group(func(r chi.Router) {
				r.Use(middleware.RequireScopes(domain.ScopeWritePolicies))
				r.Post("/children/{childId}/policies", h.Policy.Create)
				r.Put("/policies/{policyId}", h.Policy.Update)
				r.Post("/policies/{policyId}/rules", h.Policy.CreateRule)
				r.Put("/policies/{policyId}/rules/bulk", h.Policy.BulkUpsertRules)
			})

			// Enforcement
			r.Group(func(r chi.Router) {
				r.Use(middleware.RequireScopes(domain.ScopeReadEnforcement))
				r.Get("/enforcement/jobs/{jobId}", h.Enforcement.GetJob)
				r.Get("/enforcement/jobs/{jobId}/results", h.Enforcement.GetJobResults)
				r.Get("/children/{childId}/enforcement/jobs", h.Enforcement.ListChildJobs)
			})
			r.Group(func(r chi.Router) {
				r.Use(middleware.RequireScopes(domain.ScopeWriteEnforcement))
				r.Post("/children/{childId}/enforce", h.Enforcement.TriggerChildEnforcement)
			})

			// Ratings (read-only)
			r.Group(func(r chi.Router) {
				r.Use(middleware.RequireScopes(domain.ScopeReadRatings))
				r.Get("/ratings/systems", h.Rating.GetSystems)
				r.Get("/ratings/systems/{systemId}", h.Rating.GetBySystem)
				r.Get("/ratings/by-age", h.Rating.GetByAge)
			})

			// Platforms (read-only)
			r.Group(func(r chi.Router) {
				r.Use(middleware.RequireScopes(domain.ScopeReadPlatforms))
				r.Get("/platforms", h.Platform.List)
				r.Get("/platforms/{platformId}", h.Platform.Get)
			})

			// Compliance
			r.Group(func(r chi.Router) {
				r.Use(middleware.RequireScopes(domain.ScopeWriteCompliance))
				r.Post("/compliance", h.Platform.VerifyCompliance)
			})

			// Devices
			r.Group(func(r chi.Router) {
				r.Use(middleware.RequireScopes(domain.ScopeDeviceManage))
				r.Post("/children/{childId}/devices", h.Device.RegisterDevice)
				r.Get("/children/{childId}/devices", h.Device.ListDevices)
			})

			// Webhooks
			r.Group(func(r chi.Router) {
				r.Use(middleware.RequireScopes(domain.ScopeWebhookManage))
				r.Post("/webhooks", h.Webhook.Create)
				r.Get("/webhooks/{webhookId}", h.Webhook.Get)
				r.Put("/webhooks/{webhookId}", h.Webhook.Update)
				r.Delete("/webhooks/{webhookId}", h.Webhook.Delete)
			})
		})
	})

	return r
}
