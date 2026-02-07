package postgres

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type PlatformRepo struct {
	*DB
}

func NewPlatformRepo(db *DB) *PlatformRepo {
	return &PlatformRepo{DB: db}
}

func (r *PlatformRepo) GetByID(ctx context.Context, id string) (*domain.Platform, error) {
	var p domain.Platform
	err := r.Pool.QueryRow(ctx,
		`SELECT id, name, category, tier, description, icon_url, auth_type, enabled
		 FROM platforms WHERE id = $1`, id,
	).Scan(&p.ID, &p.Name, &p.Category, &p.Tier, &p.Description, &p.IconURL, &p.AuthType, &p.Enabled)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PlatformRepo) List(ctx context.Context) ([]domain.Platform, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, name, category, tier, description, icon_url, auth_type, enabled
		 FROM platforms ORDER BY category, name`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var platforms []domain.Platform
	for rows.Next() {
		var p domain.Platform
		if err := rows.Scan(&p.ID, &p.Name, &p.Category, &p.Tier, &p.Description, &p.IconURL, &p.AuthType, &p.Enabled); err != nil {
			return nil, err
		}
		platforms = append(platforms, p)
	}
	return platforms, rows.Err()
}

func (r *PlatformRepo) ListByCategory(ctx context.Context, category domain.PlatformCategory) ([]domain.Platform, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, name, category, tier, description, icon_url, auth_type, enabled
		 FROM platforms WHERE category = $1
		 ORDER BY name`, category,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var platforms []domain.Platform
	for rows.Next() {
		var p domain.Platform
		if err := rows.Scan(&p.ID, &p.Name, &p.Category, &p.Tier, &p.Description, &p.IconURL, &p.AuthType, &p.Enabled); err != nil {
			return nil, err
		}
		platforms = append(platforms, p)
	}
	return platforms, rows.Err()
}
