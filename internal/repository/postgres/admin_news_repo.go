package postgres

import (
	"context"
	"fmt"

	"github.com/google/uuid"

	"github.com/guardiangate/api/internal/domain"
)

type AdminNewsRepo struct {
	*DB
}

func NewAdminNewsRepo(db *DB) *AdminNewsRepo {
	return &AdminNewsRepo{DB: db}
}

// newsItemCols is the SELECT column list with COALESCE for nullable text fields.
const newsItemCols = `id, title, source, COALESCE(url, ''), published_at, relevance_score,
	COALESCE(summary, ''), tags, is_saved, is_read, created_at`

func scanNewsItem(row interface{ Scan(dest ...any) error }, item *domain.NewsItem) error {
	return row.Scan(
		&item.ID, &item.Title, &item.Source, &item.URL,
		&item.PublishedAt, &item.RelevanceScore, &item.Summary,
		&item.Tags, &item.IsSaved, &item.IsRead, &item.CreatedAt,
	)
}

// List returns news items ordered by created_at DESC. When saved is true, only
// bookmarked items are returned. Limit caps the result set size (0 = 50 default).
func (r *AdminNewsRepo) List(ctx context.Context, limit int, saved bool) ([]domain.NewsItem, error) {
	if limit <= 0 {
		limit = 50
	}

	query := `SELECT ` + newsItemCols + ` FROM admin_news_items WHERE 1=1`
	args := []interface{}{}
	argIdx := 1

	if saved {
		query += fmt.Sprintf(` AND is_saved = $%d`, argIdx)
		args = append(args, true)
		argIdx++
	}

	query += ` ORDER BY created_at DESC`
	query += fmt.Sprintf(` LIMIT $%d`, argIdx)
	args = append(args, limit)

	rows, err := r.Pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []domain.NewsItem
	for rows.Next() {
		var item domain.NewsItem
		if err := scanNewsItem(rows, &item); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

// MarkRead sets is_read = true for the given news item.
func (r *AdminNewsRepo) MarkRead(ctx context.Context, id uuid.UUID) error {
	tag, err := r.Pool.Exec(ctx,
		`UPDATE admin_news_items SET is_read = true WHERE id = $1`, id,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("news item not found")
	}
	return nil
}

// ToggleSaved flips the is_saved boolean for the given news item.
func (r *AdminNewsRepo) ToggleSaved(ctx context.Context, id uuid.UUID) error {
	tag, err := r.Pool.Exec(ctx,
		`UPDATE admin_news_items SET is_saved = NOT is_saved WHERE id = $1`, id,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("news item not found")
	}
	return nil
}

// Delete removes a news item by ID.
func (r *AdminNewsRepo) Delete(ctx context.Context, id uuid.UUID) error {
	tag, err := r.Pool.Exec(ctx,
		`DELETE FROM admin_news_items WHERE id = $1`, id,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("news item not found")
	}
	return nil
}
