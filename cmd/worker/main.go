package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/guardiangate/api/internal/config"
	"github.com/guardiangate/api/internal/provider"
	"github.com/guardiangate/api/internal/provider/android"
	"github.com/guardiangate/api/internal/provider/apple"
	"github.com/guardiangate/api/internal/provider/cleanbrowsing"
	"github.com/guardiangate/api/internal/provider/microsoft"
	"github.com/guardiangate/api/internal/provider/nextdns"
	"github.com/guardiangate/api/internal/provider/stubs"
	"github.com/guardiangate/api/internal/repository/postgres"
	"github.com/guardiangate/api/internal/service"
	syncpkg "github.com/guardiangate/api/internal/sync"
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	cfg := config.Load()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Database
	db, err := postgres.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to connect to database")
	}
	defer db.Close()

	// Platform registry
	registry := provider.NewRegistry()
	registry.Register(nextdns.New())
	registry.Register(cleanbrowsing.New())
	registry.Register(android.New(cfg.MicrosoftClientID, cfg.MicrosoftClientSecret))
	registry.Register(microsoft.New(cfg.MicrosoftClientID, cfg.MicrosoftClientSecret))
	registry.Register(apple.New())
	stubs.RegisterAll(registry.Register)

	// Repos
	enforcementJobRepo := &postgres.EnforcementJobRepo{DB: db}
	enforcementResultRepo := &postgres.EnforcementResultRepo{DB: db}
	complianceLinkRepo := &postgres.ComplianceLinkRepo{DB: db}
	policyRepo := &postgres.PolicyRepo{DB: db}
	ruleRepo := &postgres.PolicyRuleRepo{DB: db}
	childRepo := &postgres.ChildRepo{DB: db}
	memberRepo := &postgres.FamilyMemberRepo{DB: db}

	enforcementSvc := service.NewEnforcementService(enforcementJobRepo, enforcementResultRepo, complianceLinkRepo, policyRepo, ruleRepo, childRepo, memberRepo, registry)

	// Worker pool
	pool := syncpkg.NewWorkerPool(5)
	pool.Start(ctx)

	log.Info().Msg("background enforcement worker started")

	// Poll for pending enforcement jobs
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	for {
		select {
		case <-done:
			log.Info().Msg("shutting down worker...")
			cancel()
			pool.Stop()
			return
		case <-ticker.C:
			jobs, err := enforcementJobRepo.ListPending(ctx, 10)
			if err != nil {
				log.Error().Err(err).Msg("failed to list pending enforcement jobs")
				continue
			}
			for _, job := range jobs {
				j := job
				pool.Submit(func() {
					log.Info().Str("job_id", j.ID.String()).Msg("processing enforcement job")
					// Re-trigger via service (it handles fan-out)
					_, err := enforcementSvc.RetryJob(ctx, j.ChildID, j.ID)
					if err != nil {
						log.Error().Err(err).Str("job_id", j.ID.String()).Msg("enforcement job failed")
					}
				})
			}
		}
	}
}
