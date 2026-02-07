package main

import (
	"context"
	"os"

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

	// The seed data is in migration 009_seed_data.sql
	// This command runs it explicitly if needed outside of migrations

	sql, err := os.ReadFile("migrations/009_seed_data.sql")
	if err != nil {
		// Try Docker path
		sql, err = os.ReadFile("/migrations/009_seed_data.sql")
		if err != nil {
			log.Fatal().Err(err).Msg("failed to read seed data file")
		}
	}

	_, err = pool.Exec(ctx, string(sql))
	if err != nil {
		log.Fatal().Err(err).Msg("failed to apply seed data")
	}

	log.Info().Msg("seed data applied successfully")
}
