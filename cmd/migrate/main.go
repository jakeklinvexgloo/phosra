package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/guardiangate/api/internal/config"
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	cfg := config.Load()
	ctx := context.Background()

	pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to connect to database")
	}
	defer pool.Close()

	// Create migrations tracking table
	_, err = pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version VARCHAR(255) PRIMARY KEY,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to create migrations table")
	}

	// Find migration files
	migrationsDir := "migrations"
	if _, err := os.Stat(migrationsDir); os.IsNotExist(err) {
		migrationsDir = "/migrations" // Docker path
	}

	files, err := filepath.Glob(filepath.Join(migrationsDir, "*.sql"))
	if err != nil {
		log.Fatal().Err(err).Msg("failed to glob migrations")
	}
	sort.Strings(files)

	for _, file := range files {
		version := filepath.Base(file)
		version = strings.TrimSuffix(version, ".sql")

		// Check if already applied
		var count int
		err := pool.QueryRow(ctx, "SELECT COUNT(*) FROM schema_migrations WHERE version = $1", version).Scan(&count)
		if err != nil {
			log.Fatal().Err(err).Str("version", version).Msg("failed to check migration")
		}

		if count > 0 {
			log.Info().Str("version", version).Msg("skipping (already applied)")
			continue
		}

		// Read and execute
		sql, err := os.ReadFile(file)
		if err != nil {
			log.Fatal().Err(err).Str("file", file).Msg("failed to read migration")
		}

		_, err = pool.Exec(ctx, string(sql))
		if err != nil {
			log.Fatal().Err(err).Str("version", version).Msg("failed to apply migration")
		}

		_, err = pool.Exec(ctx, "INSERT INTO schema_migrations (version) VALUES ($1)", version)
		if err != nil {
			log.Fatal().Err(err).Str("version", version).Msg("failed to record migration")
		}

		fmt.Printf("Applied: %s\n", version)
		log.Info().Str("version", version).Msg("applied migration")
	}

	log.Info().Msg("all migrations applied")
}
