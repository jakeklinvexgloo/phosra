package postgres

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type CSMReviewRepo struct {
	*DB
}

func NewCSMReviewRepo(db *DB) *CSMReviewRepo {
	return &CSMReviewRepo{DB: db}
}

func (r *CSMReviewRepo) GetBySlug(ctx context.Context, slug string) (*domain.CSMReview, error) {
	var rev domain.CSMReview
	err := r.Pool.QueryRow(ctx,
		`SELECT id, csm_slug, csm_url, csm_media_type, title, age_rating,
		        age_range_min, quality_stars, is_family_friendly,
		        review_summary, review_body, parent_summary, age_explanation,
		        descriptors_json, positive_content, date_published, scraped_at, updated_at
		 FROM csm_reviews WHERE csm_slug = $1`, slug,
	).Scan(
		&rev.ID, &rev.CSMSlug, &rev.CSMURL, &rev.CSMMediaType, &rev.Title, &rev.AgeRating,
		&rev.AgeRangeMin, &rev.QualityStars, &rev.IsFamilyFriendly,
		&rev.ReviewSummary, &rev.ReviewBody, &rev.ParentSummary, &rev.AgeExplanation,
		&rev.DescriptorsJSON, &rev.PositiveContent, &rev.DatePublished, &rev.ScrapedAt, &rev.UpdatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &rev, nil
}

func (r *CSMReviewRepo) UpsertBatch(ctx context.Context, reviews []domain.CSMReview) error {
	if len(reviews) == 0 {
		return nil
	}

	now := time.Now()

	// Build batch insert with ON CONFLICT
	var b strings.Builder
	b.WriteString(`INSERT INTO csm_reviews (
		id, csm_slug, csm_url, csm_media_type, title, age_rating,
		age_range_min, quality_stars, is_family_friendly,
		review_summary, review_body, parent_summary, age_explanation,
		descriptors_json, positive_content, date_published, scraped_at, updated_at
	) VALUES `)

	const cols = 18
	args := make([]any, 0, len(reviews)*cols)
	for i, rev := range reviews {
		if rev.ID == uuid.Nil {
			rev.ID = uuid.New()
		}
		if rev.PositiveContent == nil {
			rev.PositiveContent = []byte("[]")
		}
		if i > 0 {
			b.WriteString(", ")
		}
		base := i * cols
		b.WriteString(fmt.Sprintf(
			"($%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d)",
			base+1, base+2, base+3, base+4, base+5, base+6,
			base+7, base+8, base+9, base+10, base+11, base+12,
			base+13, base+14, base+15, base+16, base+17, base+18,
		))
		args = append(args,
			rev.ID, rev.CSMSlug, rev.CSMURL, rev.CSMMediaType, rev.Title, rev.AgeRating,
			rev.AgeRangeMin, rev.QualityStars, rev.IsFamilyFriendly,
			rev.ReviewSummary, rev.ReviewBody, rev.ParentSummary, rev.AgeExplanation,
			rev.DescriptorsJSON, rev.PositiveContent, rev.DatePublished, now, now,
		)
	}

	b.WriteString(` ON CONFLICT (csm_slug) DO UPDATE SET
		csm_url = EXCLUDED.csm_url,
		csm_media_type = EXCLUDED.csm_media_type,
		title = EXCLUDED.title,
		age_rating = EXCLUDED.age_rating,
		age_range_min = EXCLUDED.age_range_min,
		quality_stars = EXCLUDED.quality_stars,
		is_family_friendly = EXCLUDED.is_family_friendly,
		review_summary = EXCLUDED.review_summary,
		review_body = EXCLUDED.review_body,
		parent_summary = EXCLUDED.parent_summary,
		age_explanation = EXCLUDED.age_explanation,
		descriptors_json = EXCLUDED.descriptors_json,
		positive_content = EXCLUDED.positive_content,
		date_published = EXCLUDED.date_published,
		scraped_at = EXCLUDED.scraped_at,
		updated_at = EXCLUDED.updated_at`)

	_, err := r.Pool.Exec(ctx, b.String(), args...)
	if err != nil {
		return err
	}

	// Populate normalized csm_descriptors table from descriptors_json
	r.populateDescriptors(ctx, reviews)

	return nil
}

func (r *CSMReviewRepo) SearchByTitle(ctx context.Context, query string, limit int) ([]domain.CSMReview, error) {
	if limit <= 0 {
		limit = 20
	}

	rows, err := r.Pool.Query(ctx,
		`SELECT id, csm_slug, csm_url, csm_media_type, title, age_rating,
		        age_range_min, quality_stars, is_family_friendly,
		        review_summary, review_body, parent_summary, age_explanation,
		        descriptors_json, positive_content, date_published, scraped_at, updated_at
		 FROM csm_reviews
		 WHERE to_tsvector('english', title) @@ plainto_tsquery('english', $1)
		 ORDER BY ts_rank(to_tsvector('english', title), plainto_tsquery('english', $1)) DESC
		 LIMIT $2`, query, limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []domain.CSMReview
	for rows.Next() {
		var rev domain.CSMReview
		if err := rows.Scan(
			&rev.ID, &rev.CSMSlug, &rev.CSMURL, &rev.CSMMediaType, &rev.Title, &rev.AgeRating,
			&rev.AgeRangeMin, &rev.QualityStars, &rev.IsFamilyFriendly,
			&rev.ReviewSummary, &rev.ReviewBody, &rev.ParentSummary, &rev.AgeExplanation,
			&rev.DescriptorsJSON, &rev.PositiveContent, &rev.DatePublished, &rev.ScrapedAt, &rev.UpdatedAt,
		); err != nil {
			return nil, err
		}
		results = append(results, rev)
	}
	return results, rows.Err()
}

func (r *CSMReviewRepo) ListByFamilyViewingHistory(ctx context.Context, familyID uuid.UUID) ([]domain.CSMReview, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT DISTINCT cr.id, cr.csm_slug, cr.csm_url, cr.csm_media_type, cr.title, cr.age_rating,
		        cr.age_range_min, cr.quality_stars, cr.is_family_friendly,
		        cr.review_summary, cr.review_body, cr.parent_summary, cr.age_explanation,
		        cr.descriptors_json, cr.positive_content, cr.date_published, cr.scraped_at, cr.updated_at
		 FROM csm_reviews cr
		 JOIN viewing_history vh ON vh.csm_review_id = cr.id
		 WHERE vh.family_id = $1`, familyID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []domain.CSMReview
	for rows.Next() {
		var rev domain.CSMReview
		if err := rows.Scan(
			&rev.ID, &rev.CSMSlug, &rev.CSMURL, &rev.CSMMediaType, &rev.Title, &rev.AgeRating,
			&rev.AgeRangeMin, &rev.QualityStars, &rev.IsFamilyFriendly,
			&rev.ReviewSummary, &rev.ReviewBody, &rev.ParentSummary, &rev.AgeExplanation,
			&rev.DescriptorsJSON, &rev.PositiveContent, &rev.DatePublished, &rev.ScrapedAt, &rev.UpdatedAt,
		); err != nil {
			return nil, err
		}
		results = append(results, rev)
	}
	return results, rows.Err()
}

// populateDescriptors upserts normalized descriptor rows from descriptors_json.
// Best-effort: failures here don't block the main upsert.
func (r *CSMReviewRepo) populateDescriptors(ctx context.Context, reviews []domain.CSMReview) {
	for _, rev := range reviews {
		if len(rev.DescriptorsJSON) == 0 {
			continue
		}

		// Look up the review ID by slug (it may have been generated during upsert)
		var reviewID uuid.UUID
		err := r.Pool.QueryRow(ctx,
			`SELECT id FROM csm_reviews WHERE csm_slug = $1`, rev.CSMSlug,
		).Scan(&reviewID)
		if err != nil {
			continue
		}

		var descriptors []domain.CSMDescriptor
		if err := json.Unmarshal(rev.DescriptorsJSON, &descriptors); err != nil {
			continue
		}

		for _, d := range descriptors {
			if d.Category == "" {
				continue
			}
			_, _ = r.Pool.Exec(ctx,
				`INSERT INTO csm_descriptors (id, csm_review_id, category, level_text, numeric_level, description)
				 VALUES ($1, $2, $3, $4, $5, $6)
				 ON CONFLICT (csm_review_id, category) DO UPDATE SET
				   level_text = EXCLUDED.level_text,
				   numeric_level = EXCLUDED.numeric_level,
				   description = EXCLUDED.description`,
				uuid.New(), reviewID, d.Category, d.Level, d.NumericLevel, d.Description,
			)
		}
	}
}
