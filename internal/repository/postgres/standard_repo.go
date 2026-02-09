package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type StandardRepo struct {
	*DB
}

func NewStandardRepo(db *DB) *StandardRepo {
	return &StandardRepo{DB: db}
}

func (r *StandardRepo) List(ctx context.Context, publishedOnly bool) ([]domain.Standard, error) {
	query := `SELECT id, slug, name, organization, description, long_description,
	           COALESCE(icon_url, ''), version, published, min_age, max_age, created_at, updated_at
	          FROM standards`
	if publishedOnly {
		query += ` WHERE published = true`
	}
	query += ` ORDER BY name`

	rows, err := r.Pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var standards []domain.Standard
	for rows.Next() {
		var s domain.Standard
		err := rows.Scan(
			&s.ID, &s.Slug, &s.Name, &s.Organization, &s.Description, &s.LongDescription,
			&s.IconURL, &s.Version, &s.Published, &s.MinAge, &s.MaxAge, &s.CreatedAt, &s.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		standards = append(standards, s)
	}
	return standards, rows.Err()
}

func (r *StandardRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Standard, error) {
	var s domain.Standard
	err := r.Pool.QueryRow(ctx,
		`SELECT id, slug, name, organization, description, long_description,
		 COALESCE(icon_url, ''), version, published, min_age, max_age, created_at, updated_at
		 FROM standards WHERE id = $1`, id,
	).Scan(
		&s.ID, &s.Slug, &s.Name, &s.Organization, &s.Description, &s.LongDescription,
		&s.IconURL, &s.Version, &s.Published, &s.MinAge, &s.MaxAge, &s.CreatedAt, &s.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *StandardRepo) GetBySlug(ctx context.Context, slug string) (*domain.Standard, error) {
	var s domain.Standard
	err := r.Pool.QueryRow(ctx,
		`SELECT id, slug, name, organization, description, long_description,
		 COALESCE(icon_url, ''), version, published, min_age, max_age, created_at, updated_at
		 FROM standards WHERE slug = $1`, slug,
	).Scan(
		&s.ID, &s.Slug, &s.Name, &s.Organization, &s.Description, &s.LongDescription,
		&s.IconURL, &s.Version, &s.Published, &s.MinAge, &s.MaxAge, &s.CreatedAt, &s.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *StandardRepo) GetRulesByStandard(ctx context.Context, standardID uuid.UUID) ([]domain.StandardRule, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, standard_id, category, label, enabled, config, sort_order
		 FROM standard_rules WHERE standard_id = $1 ORDER BY sort_order`, standardID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rules []domain.StandardRule
	for rows.Next() {
		var rule domain.StandardRule
		err := rows.Scan(&rule.ID, &rule.StandardID, &rule.Category, &rule.Label, &rule.Enabled, &rule.Config, &rule.SortOrder)
		if err != nil {
			return nil, err
		}
		rules = append(rules, rule)
	}
	return rules, rows.Err()
}

func (r *StandardRepo) GetAdoptionCount(ctx context.Context, standardID uuid.UUID) (int, error) {
	var count int
	err := r.Pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM child_standard_adoptions WHERE standard_id = $1`, standardID,
	).Scan(&count)
	return count, err
}

// ── StandardAdoptionRepo ───────────────────────────────────────────

type StandardAdoptionRepo struct {
	*DB
}

func NewStandardAdoptionRepo(db *DB) *StandardAdoptionRepo {
	return &StandardAdoptionRepo{DB: db}
}

func (r *StandardAdoptionRepo) Adopt(ctx context.Context, adoption *domain.StandardAdoption) error {
	if adoption.ID == uuid.Nil {
		adoption.ID = uuid.New()
	}
	adoption.AdoptedAt = time.Now()

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO child_standard_adoptions (id, child_id, standard_id, adopted_at)
		 VALUES ($1, $2, $3, $4)
		 ON CONFLICT (child_id, standard_id) DO NOTHING`,
		adoption.ID, adoption.ChildID, adoption.StandardID, adoption.AdoptedAt,
	)
	return err
}

func (r *StandardAdoptionRepo) Unadopt(ctx context.Context, childID, standardID uuid.UUID) error {
	_, err := r.Pool.Exec(ctx,
		`DELETE FROM child_standard_adoptions WHERE child_id = $1 AND standard_id = $2`,
		childID, standardID,
	)
	return err
}

func (r *StandardAdoptionRepo) ListByChild(ctx context.Context, childID uuid.UUID) ([]domain.StandardAdoption, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, child_id, standard_id, adopted_at
		 FROM child_standard_adoptions WHERE child_id = $1 ORDER BY adopted_at`, childID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var adoptions []domain.StandardAdoption
	for rows.Next() {
		var a domain.StandardAdoption
		err := rows.Scan(&a.ID, &a.ChildID, &a.StandardID, &a.AdoptedAt)
		if err != nil {
			return nil, err
		}
		adoptions = append(adoptions, a)
	}
	return adoptions, rows.Err()
}

func (r *StandardAdoptionRepo) IsAdopted(ctx context.Context, childID, standardID uuid.UUID) (bool, error) {
	var exists bool
	err := r.Pool.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM child_standard_adoptions WHERE child_id = $1 AND standard_id = $2)`,
		childID, standardID,
	).Scan(&exists)
	return exists, err
}
