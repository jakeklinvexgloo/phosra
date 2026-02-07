package postgres

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type RatingRepo struct {
	*DB
}

func NewRatingRepo(db *DB) *RatingRepo {
	return &RatingRepo{DB: db}
}

func (r *RatingRepo) GetSystems(ctx context.Context) ([]domain.RatingSystem, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, name, country, media_type, description
		 FROM rating_systems ORDER BY name`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var systems []domain.RatingSystem
	for rows.Next() {
		var s domain.RatingSystem
		if err := rows.Scan(&s.ID, &s.Name, &s.Country, &s.MediaType, &s.Description); err != nil {
			return nil, err
		}
		systems = append(systems, s)
	}
	return systems, rows.Err()
}

func (r *RatingRepo) GetRatingsBySystem(ctx context.Context, systemID string) ([]domain.Rating, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, system_id, code, name, description, min_age, display_order, restrictive_idx
		 FROM ratings WHERE system_id = $1
		 ORDER BY display_order`, systemID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ratings []domain.Rating
	for rows.Next() {
		var rt domain.Rating
		if err := rows.Scan(&rt.ID, &rt.SystemID, &rt.Code, &rt.Name, &rt.Description,
			&rt.MinAge, &rt.DisplayOrder, &rt.RestrictiveIdx); err != nil {
			return nil, err
		}
		ratings = append(ratings, rt)
	}
	return ratings, rows.Err()
}

func (r *RatingRepo) GetRatingByID(ctx context.Context, id uuid.UUID) (*domain.Rating, error) {
	var rt domain.Rating
	err := r.Pool.QueryRow(ctx,
		`SELECT id, system_id, code, name, description, min_age, display_order, restrictive_idx
		 FROM ratings WHERE id = $1`, id,
	).Scan(&rt.ID, &rt.SystemID, &rt.Code, &rt.Name, &rt.Description,
		&rt.MinAge, &rt.DisplayOrder, &rt.RestrictiveIdx)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &rt, nil
}

func (r *RatingRepo) GetRatingsForAge(ctx context.Context, age int) ([]domain.AgeRatingMap, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, min_age, max_age, system_id, rating_id
		 FROM age_rating_map
		 WHERE min_age <= $1 AND max_age >= $1
		 ORDER BY system_id`, age,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var mappings []domain.AgeRatingMap
	for rows.Next() {
		var m domain.AgeRatingMap
		if err := rows.Scan(&m.ID, &m.MinAge, &m.MaxAge, &m.SystemID, &m.RatingID); err != nil {
			return nil, err
		}
		mappings = append(mappings, m)
	}
	return mappings, rows.Err()
}

func (r *RatingRepo) GetEquivalences(ctx context.Context, ratingID uuid.UUID) ([]domain.RatingEquivalence, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, rating_a, rating_b, strength
		 FROM rating_equivalences
		 WHERE rating_a = $1 OR rating_b = $1
		 ORDER BY strength DESC`, ratingID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var equivalences []domain.RatingEquivalence
	for rows.Next() {
		var e domain.RatingEquivalence
		if err := rows.Scan(&e.ID, &e.RatingA, &e.RatingB, &e.Strength); err != nil {
			return nil, err
		}
		equivalences = append(equivalences, e)
	}
	return equivalences, rows.Err()
}

func (r *RatingRepo) GetDescriptors(ctx context.Context, systemID string) ([]domain.ContentDescriptor, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, system_id, code, name, category
		 FROM content_descriptors WHERE system_id = $1
		 ORDER BY category, name`, systemID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var descriptors []domain.ContentDescriptor
	for rows.Next() {
		var d domain.ContentDescriptor
		if err := rows.Scan(&d.ID, &d.SystemID, &d.Code, &d.Name, &d.Category); err != nil {
			return nil, err
		}
		descriptors = append(descriptors, d)
	}
	return descriptors, rows.Err()
}

func (r *RatingRepo) GetAgeRatingMap(ctx context.Context) ([]domain.AgeRatingMap, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, min_age, max_age, system_id, rating_id
		 FROM age_rating_map
		 ORDER BY min_age, system_id`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var mappings []domain.AgeRatingMap
	for rows.Next() {
		var m domain.AgeRatingMap
		if err := rows.Scan(&m.ID, &m.MinAge, &m.MaxAge, &m.SystemID, &m.RatingID); err != nil {
			return nil, err
		}
		mappings = append(mappings, m)
	}
	return mappings, rows.Err()
}
