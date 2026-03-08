package domain

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// CSMReview caches a Common Sense Media review for a title.
type CSMReview struct {
	ID               uuid.UUID       `json:"id"`
	CSMSlug          string          `json:"csm_slug"`
	CSMURL           string          `json:"csm_url"`
	CSMMediaType     string          `json:"csm_media_type"`
	Title            string          `json:"title"`
	AgeRating        string          `json:"age_rating"`
	AgeRangeMin      *int            `json:"age_range_min"`
	QualityStars     *int            `json:"quality_stars"`
	IsFamilyFriendly *bool           `json:"is_family_friendly"`
	ReviewSummary    string          `json:"review_summary"`
	ReviewBody       string          `json:"review_body"`
	ParentSummary    string          `json:"parent_summary"`
	AgeExplanation   string          `json:"age_explanation"`
	DescriptorsJSON  json.RawMessage `json:"descriptors_json"`
	PositiveContent  json.RawMessage `json:"positive_content"`
	DatePublished    *time.Time      `json:"date_published"`
	ScrapedAt        time.Time       `json:"scraped_at"`
	UpdatedAt        time.Time       `json:"updated_at"`
}

// CSMDescriptor represents a single content descriptor from a CSM review.
type CSMDescriptor struct {
	Category     string `json:"category"`
	Level        string `json:"level"`
	NumericLevel int    `json:"numericLevel"`
	Description  string `json:"description"`
}

// CSMPositiveContent represents a positive content entry from a CSM review.
type CSMPositiveContent struct {
	Category    string `json:"category"`
	Description string `json:"description"`
}

// ViewingHistoryEntry records a single title watched by a child.
type ViewingHistoryEntry struct {
	ID              uuid.UUID  `json:"id"`
	ChildID         uuid.UUID  `json:"child_id"`
	FamilyID        uuid.UUID  `json:"family_id"`
	Platform        string     `json:"platform"`
	Title           string     `json:"title"`
	SeriesTitle     *string    `json:"series_title"`
	WatchedDate     *time.Time `json:"watched_date"`
	NetflixProfile  string     `json:"netflix_profile"`
	CSMReviewID     *uuid.UUID `json:"csm_review_id"`
	MatchConfidence *float32   `json:"match_confidence"`
	CreatedAt       time.Time  `json:"created_at"`
}

// ViewingAnalytics aggregates viewing history metrics for a child.
type ViewingAnalytics struct {
	ChildID             uuid.UUID `json:"child_id"`
	FamilyID            uuid.UUID `json:"family_id"`
	ChildName           string    `json:"child_name"`
	TotalTitles         int       `json:"total_titles"`
	AboveAgeCount       int       `json:"above_age_count"`
	HighQualityCount    int       `json:"high_quality_count"`
	FamilyFriendlyCount int       `json:"family_friendly_count"`
	CSMMatchedCount     int       `json:"csm_matched_count"`
}
