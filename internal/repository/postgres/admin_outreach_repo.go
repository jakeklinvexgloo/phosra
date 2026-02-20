package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type AdminOutreachRepo struct {
	*DB
}

func NewAdminOutreachRepo(db *DB) *AdminOutreachRepo {
	return &AdminOutreachRepo{DB: db}
}

func (r *AdminOutreachRepo) List(ctx context.Context, contactType string, status string) ([]domain.OutreachContact, error) {
	query := `SELECT id, name, org, title, contact_type, email, linkedin_url, twitter_handle, phone,
	           status, notes, relevance_score, tags, last_contact_at, next_followup_at, created_at, updated_at
	           FROM admin_outreach_contacts WHERE 1=1`
	args := []interface{}{}
	argIdx := 1

	if contactType != "" {
		query += ` AND contact_type = $` + placeholder(argIdx)
		args = append(args, contactType)
		argIdx++
	}
	if status != "" {
		query += ` AND status = $` + placeholder(argIdx)
		args = append(args, status)
		argIdx++
	}

	query += ` ORDER BY relevance_score DESC NULLS LAST, name ASC`

	rows, err := r.Pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var contacts []domain.OutreachContact
	for rows.Next() {
		var c domain.OutreachContact
		if err := rows.Scan(
			&c.ID, &c.Name, &c.Org, &c.Title, &c.ContactType, &c.Email,
			&c.LinkedinURL, &c.TwitterHandle, &c.Phone, &c.Status, &c.Notes,
			&c.RelevanceScore, &c.Tags, &c.LastContactAt, &c.NextFollowupAt,
			&c.CreatedAt, &c.UpdatedAt,
		); err != nil {
			return nil, err
		}
		contacts = append(contacts, c)
	}
	return contacts, rows.Err()
}

func (r *AdminOutreachRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.OutreachContact, error) {
	var c domain.OutreachContact
	err := r.Pool.QueryRow(ctx,
		`SELECT id, name, org, title, contact_type, email, linkedin_url, twitter_handle, phone,
		 status, notes, relevance_score, tags, last_contact_at, next_followup_at, created_at, updated_at
		 FROM admin_outreach_contacts WHERE id = $1`, id,
	).Scan(
		&c.ID, &c.Name, &c.Org, &c.Title, &c.ContactType, &c.Email,
		&c.LinkedinURL, &c.TwitterHandle, &c.Phone, &c.Status, &c.Notes,
		&c.RelevanceScore, &c.Tags, &c.LastContactAt, &c.NextFollowupAt,
		&c.CreatedAt, &c.UpdatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *AdminOutreachRepo) Update(ctx context.Context, c *domain.OutreachContact) error {
	c.UpdatedAt = time.Now()
	_, err := r.Pool.Exec(ctx,
		`UPDATE admin_outreach_contacts
		 SET status = $1, notes = $2, last_contact_at = $3, next_followup_at = $4, updated_at = $5
		 WHERE id = $6`,
		c.Status, c.Notes, c.LastContactAt, c.NextFollowupAt, c.UpdatedAt, c.ID,
	)
	return err
}

// Create inserts a new outreach contact (e.g. from Google Contacts sync).
func (r *AdminOutreachRepo) Create(ctx context.Context, c *domain.OutreachContact) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	now := time.Now()
	c.CreatedAt = now
	c.UpdatedAt = now
	_, err := r.Pool.Exec(ctx,
		`INSERT INTO admin_outreach_contacts
		 (id, name, org, title, contact_type, email, linkedin_url, twitter_handle, phone,
		  status, notes, relevance_score, tags, last_contact_at, next_followup_at, created_at, updated_at)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
		c.ID, c.Name, c.Org, c.Title, c.ContactType, c.Email,
		c.LinkedinURL, c.TwitterHandle, c.Phone, c.Status, c.Notes,
		c.RelevanceScore, c.Tags, c.LastContactAt, c.NextFollowupAt,
		c.CreatedAt, c.UpdatedAt,
	)
	return err
}

func (r *AdminOutreachRepo) CreateActivity(ctx context.Context, a *domain.OutreachActivity) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	a.CreatedAt = time.Now()
	_, err := r.Pool.Exec(ctx,
		`INSERT INTO admin_outreach_activities (id, contact_id, activity_type, subject, body, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		a.ID, a.ContactID, a.ActivityType, a.Subject, a.Body, a.CreatedAt,
	)
	return err
}

func (r *AdminOutreachRepo) ListActivities(ctx context.Context, contactID uuid.UUID) ([]domain.OutreachActivity, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, contact_id, activity_type, subject, body, created_at
		 FROM admin_outreach_activities WHERE contact_id = $1
		 ORDER BY created_at DESC`, contactID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var activities []domain.OutreachActivity
	for rows.Next() {
		var a domain.OutreachActivity
		if err := rows.Scan(&a.ID, &a.ContactID, &a.ActivityType, &a.Subject, &a.Body, &a.CreatedAt); err != nil {
			return nil, err
		}
		activities = append(activities, a)
	}
	return activities, rows.Err()
}

func (r *AdminOutreachRepo) Stats(ctx context.Context) (*domain.OutreachStats, error) {
	var s domain.OutreachStats
	err := r.Pool.QueryRow(ctx,
		`SELECT
		   COUNT(*) AS total,
		   COUNT(*) FILTER (WHERE status = 'not_contacted') AS not_contacted,
		   COUNT(*) FILTER (WHERE status = 'reached_out') AS reached_out,
		   COUNT(*) FILTER (WHERE status = 'in_conversation') AS in_conversation,
		   COUNT(*) FILTER (WHERE status = 'partnership') AS partnership,
		   COUNT(*) FILTER (WHERE status = 'declined') AS declined,
		   COUNT(*) FILTER (WHERE next_followup_at IS NOT NULL AND next_followup_at < NOW()) AS needs_follow_up
		 FROM admin_outreach_contacts`,
	).Scan(&s.Total, &s.NotContacted, &s.ReachedOut, &s.InConversation, &s.Partnership, &s.Declined, &s.NeedsFollowUp)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

// placeholder returns a PostgreSQL placeholder like $1, $2, etc.
func placeholder(n int) string {
	return fmt.Sprintf("$%d", n)
}
