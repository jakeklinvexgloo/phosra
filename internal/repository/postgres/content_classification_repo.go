package postgres

import (
	"context"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
)

type ContentClassificationRepo struct{ *DB }

func NewContentClassificationRepo(db *DB) *ContentClassificationRepo {
	return &ContentClassificationRepo{DB: db}
}

func (r *ContentClassificationRepo) Upsert(ctx context.Context, c *domain.ContentClassification) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	_, err := r.Pool.Exec(ctx,
		`INSERT INTO content_classifications (id, content_type, content_id, rating_system, rating, confidence, source, classified_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
		 ON CONFLICT (content_type, content_id, rating_system)
		 DO UPDATE SET rating = EXCLUDED.rating, confidence = EXCLUDED.confidence, source = EXCLUDED.source, classified_at = NOW()`,
		c.ID, c.ContentType, c.ContentID, c.RatingSystem, c.Rating, c.Confidence, c.Source,
	)
	return err
}

func (r *ContentClassificationRepo) GetByContentID(ctx context.Context, contentType, contentID, ratingSystem string) (*domain.ContentClassification, error) {
	var c domain.ContentClassification
	err := r.Pool.QueryRow(ctx,
		`SELECT id, content_type, content_id, rating_system, rating, confidence, source, classified_at
		 FROM content_classifications WHERE content_type = $1 AND content_id = $2 AND rating_system = $3`,
		contentType, contentID, ratingSystem,
	).Scan(&c.ID, &c.ContentType, &c.ContentID, &c.RatingSystem, &c.Rating, &c.Confidence, &c.Source, &c.ClassifiedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}
