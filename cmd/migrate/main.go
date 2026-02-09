package main

import (
	"context"
	"os"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/guardiangate/api/internal/config"
	"github.com/guardiangate/api/internal/migrate"
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	cfg := config.Load()

	if err := migrate.Run(context.Background(), cfg.DatabaseURL); err != nil {
		log.Fatal().Err(err).Msg("migration failed")
	}
}
