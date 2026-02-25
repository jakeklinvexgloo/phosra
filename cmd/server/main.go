package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/guardiangate/api/internal/config"
	"github.com/guardiangate/api/internal/engine"
	googleapi "github.com/guardiangate/api/internal/google"
	"github.com/guardiangate/api/internal/handler"
	"github.com/guardiangate/api/internal/migrate"
	"github.com/guardiangate/api/internal/provider"
	"github.com/guardiangate/api/internal/provider/android"
	"github.com/guardiangate/api/internal/provider/apple"
	"github.com/guardiangate/api/internal/provider/cleanbrowsing"
	"github.com/guardiangate/api/internal/provider/controld"
	"github.com/guardiangate/api/internal/provider/microsoft"
	"github.com/guardiangate/api/internal/provider/nextdns"
	"github.com/guardiangate/api/internal/provider/stubs"
	"github.com/guardiangate/api/internal/push"
	"github.com/guardiangate/api/internal/repository/postgres"
	"github.com/guardiangate/api/internal/router"
	"github.com/guardiangate/api/internal/service"
	"github.com/guardiangate/api/internal/source"
	sourcestubs "github.com/guardiangate/api/internal/source/stubs"
)

func main() {
	// Logging
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	cfg := config.Load()

	// Set log level
	level, err := zerolog.ParseLevel(cfg.LogLevel)
	if err == nil {
		zerolog.SetGlobalLevel(level)
	}

	// Sentry error tracking (optional — only enabled if SENTRY_DSN is set)
	if cfg.SentryDSN != "" {
		if err := sentry.Init(sentry.ClientOptions{
			Dsn:              cfg.SentryDSN,
			TracesSampleRate: 0.2,
			Environment:      envOrDefault("FLY_APP_NAME", "development"),
		}); err != nil {
			log.Warn().Err(err).Msg("Sentry initialization failed")
		} else {
			log.Info().Msg("Sentry error tracking enabled")
			defer sentry.Flush(2 * time.Second)
		}
	}

	// Auto-migrate if enabled
	ctx := context.Background()
	if cfg.AutoMigrate {
		log.Info().Msg("AUTO_MIGRATE enabled, running pending migrations...")
		if err := migrate.Run(ctx, cfg.DatabaseURL); err != nil {
			log.Fatal().Err(err).Msg("auto-migration failed, refusing to start server")
		}
		log.Info().Msg("migrations complete")
	}

	// Database
	db, err := postgres.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to connect to database")
	}
	defer db.Close()
	log.Info().Msg("connected to database")

	// Repositories
	userRepo := &postgres.UserRepo{DB: db}
	familyRepo := &postgres.FamilyRepo{DB: db}
	memberRepo := &postgres.FamilyMemberRepo{DB: db}
	childRepo := &postgres.ChildRepo{DB: db}
	ratingRepo := &postgres.RatingRepo{DB: db}
	policyRepo := &postgres.PolicyRepo{DB: db}
	ruleRepo := &postgres.PolicyRuleRepo{DB: db}
	platformRepo := &postgres.PlatformRepo{DB: db}
	complianceLinkRepo := &postgres.ComplianceLinkRepo{DB: db}
	enforcementJobRepo := &postgres.EnforcementJobRepo{DB: db}
	enforcementResultRepo := &postgres.EnforcementResultRepo{DB: db}
	webhookRepo := &postgres.WebhookRepo{DB: db}
	webhookDeliveryRepo := &postgres.WebhookDeliveryRepo{DB: db}
	feedbackRepo := postgres.NewFeedbackRepo(db)
	standardRepo := postgres.NewStandardRepo(db)
	standardAdoptionRepo := postgres.NewStandardAdoptionRepo(db)

	deviceRegRepo := postgres.NewDeviceRegistrationRepo(db)
	deviceReportRepo := postgres.NewDeviceReportRepo(db)

	// Developer portal repository
	developerRepo := postgres.NewDeveloperRepo(db)

	// Admin repositories
	adminOutreachRepo := postgres.NewAdminOutreachRepo(db)
	adminWorkerRepo := postgres.NewAdminWorkerRepo(db)
	adminNewsRepo := postgres.NewAdminNewsRepo(db)
	adminAlertsRepo := postgres.NewAdminAlertsRepo(db)
	adminGoogleRepo := postgres.NewAdminGoogleRepo(db)
	adminPitchRepo := postgres.NewAdminPitchRepo(db)

	// Source repository
	sourceRepo := postgres.NewSourceRepo(db)

	// Phosra service-layer repositories
	notificationScheduleRepo := postgres.NewNotificationScheduleRepo(db)
	activityLogRepo := postgres.NewActivityLogRepo(db)
	ageVerificationRepo := postgres.NewAgeVerificationRepo(db)
	privacyRequestRepo := postgres.NewPrivacyRequestRepo(db)
	complianceAttestRepo := postgres.NewComplianceAttestationRepo(db)
	socialPolicyRepo := postgres.NewSocialPolicyRepo(db)
	locationLogRepo := postgres.NewLocationLogRepo(db)
	purchaseApprovalRepo := postgres.NewPurchaseApprovalRepo(db)
	contentClassRepo := postgres.NewContentClassificationRepo(db)

	// Platform registry
	registry := provider.NewRegistry()
	registry.Register(nextdns.New())
	registry.Register(cleanbrowsing.New())
	registry.Register(controld.New())
	registry.Register(android.New(cfg.MicrosoftClientID, cfg.MicrosoftClientSecret))
	registry.Register(microsoft.New(cfg.MicrosoftClientID, cfg.MicrosoftClientSecret))
	registry.Register(apple.New())
	stubs.RegisterAll(registry.Register)
	log.Info().Int("platforms", len(registry.List())).Msg("registered platform adapters")

	// Source adapter registry (parental control integrations)
	sourceRegistry := source.NewRegistry()
	sourcestubs.RegisterAll(sourceRegistry)
	log.Info().Int("sources", len(sourceRegistry.List())).Msg("registered source adapters")

	// APNs silent push (optional — only created when APNS_TEAM_ID is set)
	var pushSvc service.PolicyUpdateNotifier
	apnsSvc, err := push.NewAPNsService(push.APNsConfig{
		TeamID:        cfg.APNsTeamID,
		KeyID:         cfg.APNsKeyID,
		AuthKeyPath:   cfg.APNsAuthKeyPath,
		AuthKeyBase64: cfg.APNsAuthKeyBase64,
		BundleID:      cfg.APNsBundleID,
		Production:    cfg.APNsProduction,
	}, deviceRegRepo)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to initialize APNs service")
	}
	if apnsSvc != nil {
		pushSvc = apnsSvc
		log.Info().Str("bundle_id", cfg.APNsBundleID).Msg("APNs silent push enabled")
	}

	// Services
	authSvc := service.NewAuthService(userRepo)
	familySvc := service.NewFamilyService(familyRepo, memberRepo)
	childSvc := service.NewChildService(childRepo, familyRepo, memberRepo, ratingRepo)
	webhookSvc := service.NewWebhookService(webhookRepo, webhookDeliveryRepo, memberRepo)
	policySvc := service.NewPolicyService(policyRepo, ruleRepo, childRepo, memberRepo, ratingRepo, webhookSvc, pushSvc)
	ratingSvc := service.NewRatingService(ratingRepo)
	platformSvc := service.NewPlatformService(platformRepo, complianceLinkRepo, memberRepo, registry)
	devicePolicySvc := service.NewDevicePolicyService(childRepo, policyRepo, ruleRepo, deviceRegRepo, deviceReportRepo, activityLogRepo, memberRepo)

	// Phosra service layer
	notificationSvc := service.NewPhosraNotificationService(notificationScheduleRepo)
	analyticsSvc := service.NewPhosraAnalyticsService(activityLogRepo)
	ageVerifySvc := service.NewPhosraAgeVerificationService(ageVerificationRepo, childRepo)
	contentClassSvc := service.NewPhosraContentClassifyService(contentClassRepo)
	privacyConsentSvc := service.NewPhosraPrivacyConsentService(privacyRequestRepo)
	complianceAttestSvc := service.NewPhosraComplianceAttestService(complianceAttestRepo)
	socialSvc := service.NewPhosraSocialService(socialPolicyRepo)
	locationSvc := service.NewPhosraLocationService(locationLogRepo)
	purchaseSvc := service.NewPhosraPurchaseService(purchaseApprovalRepo)

	compositeEng := engine.NewCompositeEngine(
		notificationSvc, analyticsSvc, ageVerifySvc, contentClassSvc,
		privacyConsentSvc, complianceAttestSvc, socialSvc, locationSvc, purchaseSvc,
	)
	log.Info().Msg("composite enforcement engine initialized with 9 Phosra services")

	enforcementSvc := service.NewEnforcementService(enforcementJobRepo, enforcementResultRepo, complianceLinkRepo, policyRepo, ruleRepo, childRepo, memberRepo, registry, compositeEng)
	reportSvc := service.NewReportService(childRepo, policyRepo, enforcementJobRepo, enforcementResultRepo, complianceLinkRepo, memberRepo)
	setupSvc := service.NewQuickSetupService(familyRepo, memberRepo, childRepo, policyRepo, ruleRepo, ratingRepo, policySvc, complianceLinkRepo)
	standardSvc := service.NewStandardService(standardRepo, standardAdoptionRepo, childRepo, memberRepo)
	developerSvc := service.NewDeveloperService(developerRepo)
	sourceSvc := service.NewSourceService(sourceRepo, policyRepo, childRepo, sourceRegistry)

	// Google Workspace clients (optional — only configured when GOOGLE_CLIENT_ID is set)
	var googlePersonal, googleOutreach *googleapi.Client
	if cfg.GoogleClientID != "" {
		googlePersonal = googleapi.NewClient(
			cfg.GoogleClientID,
			cfg.GoogleClientSecret,
			cfg.GoogleRedirectURI,
			cfg.EncryptionKey,
			"personal",
			adminGoogleRepo,
		)
		googleOutreach = googleapi.NewClient(
			cfg.GoogleClientID,
			cfg.GoogleClientSecret,
			cfg.GoogleOutreachRedirectURI,
			cfg.EncryptionKey,
			"outreach",
			adminGoogleRepo,
		)
		log.Info().Str("redirect_uri", cfg.GoogleRedirectURI).Msg("Google Workspace integration enabled (personal + outreach)")
	}

	// Handlers
	handlers := router.Handlers{
		Auth:        handler.NewAuthHandler(authSvc),
		Family:      handler.NewFamilyHandler(familySvc),
		Child:       handler.NewChildHandler(childSvc),
		Policy:      handler.NewPolicyHandler(policySvc),
		Platform:    handler.NewPlatformHandler(platformSvc, registry),
		Enforcement: handler.NewEnforcementHandler(enforcementSvc),
		Rating:      handler.NewRatingHandler(ratingSvc),
		Webhook:     handler.NewWebhookHandler(webhookSvc),
		Report:      handler.NewReportHandler(reportSvc),
		Setup:       handler.NewSetupHandler(setupSvc),
		Feedback:    handler.NewFeedbackHandler(feedbackRepo),
		Standard:    handler.NewStandardHandler(standardSvc),
		Device:      handler.NewDeviceHandler(devicePolicySvc),
		Admin:      handler.NewAdminHandler(adminOutreachRepo, adminWorkerRepo, adminNewsRepo, adminAlertsRepo, googlePersonal, googleOutreach, cfg.WorkerAPIKey),
		AdminPitch: handler.NewAdminPitchHandler(adminPitchRepo, cfg.OpenAIAPIKey, service.NewTranscriptionService(cfg.AssemblyAIKey), service.NewEmotionService(cfg.HumeAIKey)),
		Developer:  handler.NewDeveloperHandler(developerSvc),
		Source:     handler.NewSourceHandler(sourceSvc),
	}

	// Router
	var routerOpts []router.Option
	if cfg.SandboxMode {
		routerOpts = append(routerOpts, router.WithSandboxMode())
		log.Info().Msg("sandbox mode enabled — using session-based auth")
	} else if cfg.StytchProjectID != "" {
		routerOpts = append(routerOpts, router.WithStytchProjectID(cfg.StytchProjectID))
		log.Info().Str("project_id", cfg.StytchProjectID).Msg("Stytch authentication enabled")
	}
	if cfg.CORSOrigins != "" {
		routerOpts = append(routerOpts, router.WithCORSOrigins(cfg.CORSOrigins))
		log.Info().Str("origins", cfg.CORSOrigins).Msg("CORS origins configured")
	}
	if cfg.WorkerAPIKey != "" {
		routerOpts = append(routerOpts, router.WithWorkerAPIKey(cfg.WorkerAPIKey))
		log.Info().Msg("Worker API key configured")
	}
	r := router.New(handlers, userRepo, devicePolicySvc, cfg.RateLimitRPS, routerOpts...)

	// Server
	// Note: WriteTimeout set to 0 to support long-running WebSocket connections
	// (pitch coaching relay). Individual HTTP handlers still have request-level timeouts.
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Port),
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 0,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown
	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		log.Info().Str("port", cfg.Port).Msg("starting server")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("server failed")
		}
	}()

	<-done
	log.Info().Msg("shutting down server...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatal().Err(err).Msg("server forced to shutdown")
	}

	log.Info().Msg("server stopped")
}

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
