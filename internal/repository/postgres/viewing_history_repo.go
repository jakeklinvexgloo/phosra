package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type ViewingHistoryRepo struct {
	*DB
}

func NewViewingHistoryRepo(db *DB) *ViewingHistoryRepo {
	return &ViewingHistoryRepo{DB: db}
}

func (r *ViewingHistoryRepo) UpsertBatch(ctx context.Context, entries []domain.ViewingHistoryEntry) error {
	if len(entries) == 0 {
		return nil
	}

	var b strings.Builder
	b.WriteString(`INSERT INTO viewing_history (
		id, child_id, family_id, platform, title, series_title,
		watched_date, netflix_profile, csm_review_id, match_confidence
	) VALUES `)

	args := make([]any, 0, len(entries)*10)
	for i, e := range entries {
		if e.ID == uuid.Nil {
			e.ID = uuid.New()
		}
		if i > 0 {
			b.WriteString(", ")
		}
		base := i * 10
		b.WriteString(fmt.Sprintf(
			"($%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d)",
			base+1, base+2, base+3, base+4, base+5,
			base+6, base+7, base+8, base+9, base+10,
		))
		args = append(args,
			e.ID, e.ChildID, e.FamilyID, e.Platform, e.Title, e.SeriesTitle,
			e.WatchedDate, e.NetflixProfile, e.CSMReviewID, e.MatchConfidence,
		)
	}

	b.WriteString(` ON CONFLICT (child_id, platform, title, COALESCE(watched_date, '1970-01-01'::date))
		DO UPDATE SET
			csm_review_id = EXCLUDED.csm_review_id,
			match_confidence = EXCLUDED.match_confidence,
			series_title = EXCLUDED.series_title,
			netflix_profile = EXCLUDED.netflix_profile`)

	_, err := r.Pool.Exec(ctx, b.String(), args...)
	return err
}

func (r *ViewingHistoryRepo) ListByChild(ctx context.Context, childID uuid.UUID, limit, offset int) ([]domain.ViewingHistoryEntry, error) {
	if limit <= 0 {
		limit = 50
	}

	rows, err := r.Pool.Query(ctx,
		`SELECT id, child_id, family_id, platform, title, series_title,
		        watched_date, netflix_profile, csm_review_id, match_confidence, created_at
		 FROM viewing_history
		 WHERE child_id = $1
		 ORDER BY watched_date DESC NULLS LAST, created_at DESC
		 LIMIT $2 OFFSET $3`, childID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []domain.ViewingHistoryEntry
	for rows.Next() {
		var e domain.ViewingHistoryEntry
		if err := rows.Scan(
			&e.ID, &e.ChildID, &e.FamilyID, &e.Platform, &e.Title, &e.SeriesTitle,
			&e.WatchedDate, &e.NetflixProfile, &e.CSMReviewID, &e.MatchConfidence, &e.CreatedAt,
		); err != nil {
			return nil, err
		}
		entries = append(entries, e)
	}
	return entries, rows.Err()
}

func (r *ViewingHistoryRepo) ListByFamily(ctx context.Context, familyID uuid.UUID, limit, offset int) ([]domain.ViewingHistoryEntry, error) {
	if limit <= 0 {
		limit = 50
	}

	rows, err := r.Pool.Query(ctx,
		`SELECT id, child_id, family_id, platform, title, series_title,
		        watched_date, netflix_profile, csm_review_id, match_confidence, created_at
		 FROM viewing_history
		 WHERE family_id = $1
		 ORDER BY watched_date DESC NULLS LAST, created_at DESC
		 LIMIT $2 OFFSET $3`, familyID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []domain.ViewingHistoryEntry
	for rows.Next() {
		var e domain.ViewingHistoryEntry
		if err := rows.Scan(
			&e.ID, &e.ChildID, &e.FamilyID, &e.Platform, &e.Title, &e.SeriesTitle,
			&e.WatchedDate, &e.NetflixProfile, &e.CSMReviewID, &e.MatchConfidence, &e.CreatedAt,
		); err != nil {
			return nil, err
		}
		entries = append(entries, e)
	}
	return entries, rows.Err()
}

func (r *ViewingHistoryRepo) DeleteByChild(ctx context.Context, childID uuid.UUID) error {
	_, err := r.Pool.Exec(ctx,
		`DELETE FROM viewing_history WHERE child_id = $1`, childID,
	)
	return err
}

func (r *ViewingHistoryRepo) GetAnalytics(ctx context.Context, childID uuid.UUID) (*domain.ViewingAnalytics, error) {
	var a domain.ViewingAnalytics
	err := r.Pool.QueryRow(ctx,
		`SELECT
			vh.child_id,
			vh.family_id,
			c.name AS child_name,
			COUNT(*) AS total_titles,
			COUNT(CASE WHEN cr.age_range_min IS NOT NULL
			           AND EXTRACT(YEAR FROM AGE(c.birth_date)) < cr.age_range_min
			      THEN 1 END) AS above_age_count,
			COUNT(CASE WHEN cr.quality_stars >= 4 THEN 1 END) AS high_quality_count,
			COUNT(CASE WHEN cr.is_family_friendly = true THEN 1 END) AS family_friendly_count,
			COUNT(cr.id) AS csm_matched_count
		 FROM viewing_history vh
		 JOIN children c ON c.id = vh.child_id
		 LEFT JOIN csm_reviews cr ON cr.id = vh.csm_review_id
		 WHERE vh.child_id = $1
		 GROUP BY vh.child_id, vh.family_id, c.name`, childID,
	).Scan(
		&a.ChildID, &a.FamilyID, &a.ChildName,
		&a.TotalTitles, &a.AboveAgeCount, &a.HighQualityCount,
		&a.FamilyFriendlyCount, &a.CSMMatchedCount,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &a, nil
}

// LinkCSMReviews matches unlinked viewing_history entries to csm_reviews
// by comparing the series_title (or title) against the CSM review title.
// Scoped to the user's families.
func (r *ViewingHistoryRepo) LinkCSMReviews(ctx context.Context, userID uuid.UUID) (int, error) {
	tag, err := r.Pool.Exec(ctx, `
		UPDATE viewing_history vh
		SET csm_review_id = matched.csm_id,
		    match_confidence = matched.confidence
		FROM (
			SELECT DISTINCT ON (vh2.id)
				vh2.id as vh_id,
				cr.id as csm_id,
				CASE
					WHEN LOWER(TRIM(vh2.series_title)) = LOWER(TRIM(cr.title)) THEN 1.0
					WHEN LOWER(TRIM(vh2.title)) = LOWER(TRIM(cr.title)) THEN 1.0
					WHEN LOWER(TRIM(SPLIT_PART(vh2.title, ':', 1))) = LOWER(TRIM(cr.title)) THEN 0.95
				END as confidence
			FROM viewing_history vh2
			CROSS JOIN csm_reviews cr
			WHERE vh2.csm_review_id IS NULL
			  AND vh2.family_id IN (
				SELECT fm.family_id FROM family_members fm WHERE fm.user_id = $1
			  )
			  AND (
				LOWER(TRIM(vh2.series_title)) = LOWER(TRIM(cr.title))
				OR LOWER(TRIM(vh2.title)) = LOWER(TRIM(cr.title))
				OR LOWER(TRIM(SPLIT_PART(vh2.title, ':', 1))) = LOWER(TRIM(cr.title))
			  )
			ORDER BY vh2.id, confidence DESC
		) matched
		WHERE vh.id = matched.vh_id
	`, userID)
	if err != nil {
		return 0, err
	}
	return int(tag.RowsAffected()), nil
}
