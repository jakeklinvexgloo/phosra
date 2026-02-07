package sync

import (
	"context"
	"math"
	"time"

	"github.com/rs/zerolog/log"
)

// RetryConfig controls retry behavior.
type RetryConfig struct {
	MaxRetries     int
	InitialBackoff time.Duration
	MaxBackoff     time.Duration
	Multiplier     float64
}

// DefaultRetryConfig provides sensible defaults.
var DefaultRetryConfig = RetryConfig{
	MaxRetries:     5,
	InitialBackoff: time.Second,
	MaxBackoff:     5 * time.Minute,
	Multiplier:     2.0,
}

// CalculateBackoff returns the backoff duration for a given attempt number.
func CalculateBackoff(attempt int, config RetryConfig) time.Duration {
	if attempt <= 0 {
		return config.InitialBackoff
	}
	backoff := float64(config.InitialBackoff) * math.Pow(config.Multiplier, float64(attempt))
	if backoff > float64(config.MaxBackoff) {
		backoff = float64(config.MaxBackoff)
	}
	return time.Duration(backoff)
}

// WithRetry executes fn with exponential backoff retries.
func WithRetry(ctx context.Context, config RetryConfig, name string, fn func(ctx context.Context) error) error {
	var lastErr error
	for attempt := 0; attempt <= config.MaxRetries; attempt++ {
		if attempt > 0 {
			backoff := CalculateBackoff(attempt-1, config)
			log.Info().
				Str("operation", name).
				Int("attempt", attempt).
				Dur("backoff", backoff).
				Msg("retrying operation")

			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(backoff):
			}
		}

		if err := fn(ctx); err != nil {
			lastErr = err
			log.Warn().
				Str("operation", name).
				Int("attempt", attempt).
				Err(err).
				Msg("operation failed")
			continue
		}

		return nil
	}

	return lastErr
}

// WorkerPool manages concurrent sync operations.
type WorkerPool struct {
	workers int
	jobs    chan func()
}

// NewWorkerPool creates a pool with the specified concurrency.
func NewWorkerPool(workers int) *WorkerPool {
	return &WorkerPool{
		workers: workers,
		jobs:    make(chan func(), workers*10),
	}
}

// Start begins processing jobs.
func (p *WorkerPool) Start(ctx context.Context) {
	for i := 0; i < p.workers; i++ {
		go func(id int) {
			for {
				select {
				case <-ctx.Done():
					return
				case job, ok := <-p.jobs:
					if !ok {
						return
					}
					job()
				}
			}
		}(i)
	}
}

// Submit adds a job to the pool.
func (p *WorkerPool) Submit(fn func()) {
	p.jobs <- fn
}

// Stop closes the job channel.
func (p *WorkerPool) Stop() {
	close(p.jobs)
}
