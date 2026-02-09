package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/guardiangate/api/internal/config"
	"github.com/guardiangate/api/internal/handler"
	"github.com/guardiangate/api/internal/migrate"
	"github.com/guardiangate/api/internal/provider"
	"github.com/guardiangate/api/internal/provider/android"
	"github.com/guardiangate/api/internal/provider/apple"
	"github.com/guardiangate/api/internal/provider/cleanbrowsing"
	"github.com/guardiangate/api/internal/provider/microsoft"
	"github.com/guardiangate/api/internal/provider/nextdns"
	"github.com/guardiangate/api/internal/provider/stubs"
	"github.com/guardiangate/api/internal/repository/postgres"
	"github.com/guardiangate/api/internal/router"
	"github.com/guardiangate/api/internal/service"
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

	// Platform registry
	registry := provider.NewRegistry()
	registry.Register(nextdns.New())
	registry.Register(cleanbrowsing.New())
	registry.Register(android.New(cfg.MicrosoftClientID, cfg.MicrosoftClientSecret))
	registry.Register(microsoft.New(cfg.MicrosoftClientID, cfg.MicrosoftClientSecret))
	registry.Register(apple.New())
	stubs.RegisterAll(registry.Register)
	log.Info().Int("platforms", len(registry.List())).Msg("registered platform adapters")

	// Services
	authSvc := service.NewAuthService(userRepo)
	familySvc := service.NewFamilyService(familyRepo, memberRepo)
	childSvc := service.NewChildService(childRepo, familyRepo, memberRepo, ratingRepo)
	policySvc := service.NewPolicyService(policyRepo, ruleRepo, childRepo, memberRepo, ratingRepo)
	ratingSvc := service.NewRatingService(ratingRepo)
	platformSvc := service.NewPlatformService(platformRepo, complianceLinkRepo, memberRepo, registry)
	enforcementSvc := service.NewEnforcementService(enforcementJobRepo, enforcementResultRepo, complianceLinkRepo, policyRepo, ruleRepo, childRepo, memberRepo, registry)
	webhookSvc := service.NewWebhookService(webhookRepo, webhookDeliveryRepo, memberRepo)
	reportSvc := service.NewReportService(childRepo, policyRepo, enforcementJobRepo, enforcementResultRepo, complianceLinkRepo, memberRepo)
	setupSvc := service.NewQuickSetupService(familyRepo, memberRepo, childRepo, policyRepo, ruleRepo, ratingRepo, policySvc, complianceLinkRepo)
	standardSvc := service.NewStandardService(standardRepo, standardAdoptionRepo, childRepo, memberRepo)

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
	}

	// Router
	var routerOpts []router.Option
	if cfg.SandboxMode {
		routerOpts = append(routerOpts, router.WithSandboxMode())
		log.Info().Msg("sandbox mode enabled — using session-based auth (no WorkOS)")
	} else if cfg.WorkOSClientID != "" {
		routerOpts = append(routerOpts, router.WithWorkOSClientID(cfg.WorkOSClientID))
		log.Info().Msg("WorkOS authentication enabled")
	}
	if cfg.CORSOrigins != "" {
		routerOpts = append(routerOpts, router.WithCORSOrigins(cfg.CORSOrigins))
		log.Info().Str("origins", cfg.CORSOrigins).Msg("CORS origins configured")
	}
	r := router.New(handlers, userRepo, cfg.RateLimitRPS, routerOpts...)

	// Server
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Port),
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
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
