package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/jackc/pgx/v5"
)

type ConfigAgentStateRepo struct {
	*DB
}

func NewConfigAgentStateRepo(db *DB) *ConfigAgentStateRepo {
	return &ConfigAgentStateRepo{DB: db}
}

// Upsert saves or updates the config agent state for a user+platform.
func (r *ConfigAgentStateRepo) Upsert(ctx context.Context, s *domain.ConfigAgentState) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	now := time.Now()
	s.UpdatedAt = now

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO config_agent_states (id, user_id, platform, state, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 ON CONFLICT (user_id, platform) DO UPDATE
		   SET state = EXCLUDED.state, updated_at = EXCLUDED.updated_at`,
		s.ID, s.UserID, s.Platform, s.State, now, now,
	)
	return err
}

// Get retrieves the config agent state for a user+platform, or nil if none exists.
func (r *ConfigAgentStateRepo) Get(ctx context.Context, userID uuid.UUID, platform string) (*domain.ConfigAgentState, error) {
	var s domain.ConfigAgentState
	err := r.Pool.QueryRow(ctx,
		`SELECT id, user_id, platform, state, created_at, updated_at
		 FROM config_agent_states
		 WHERE user_id = $1 AND platform = $2`,
		userID, platform,
	).Scan(&s.ID, &s.UserID, &s.Platform, &s.State, &s.CreatedAt, &s.UpdatedAt)

	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &s, nil
}

// Delete removes the config agent state for a user+platform.
func (r *ConfigAgentStateRepo) Delete(ctx context.Context, userID uuid.UUID, platform string) error {
	_, err := r.Pool.Exec(ctx,
		`DELETE FROM config_agent_states WHERE user_id = $1 AND platform = $2`,
		userID, platform,
	)
	return err
}
