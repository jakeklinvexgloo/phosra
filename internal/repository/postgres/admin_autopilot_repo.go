package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

// ── Sequences ──────────────────────────────────────────────────

// CreateSequence inserts a new outreach sequence.
func (r *AdminOutreachRepo) CreateSequence(ctx context.Context, s *domain.OutreachSequence) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	now := time.Now()
	s.CreatedAt = now
	s.UpdatedAt = now
	_, err := r.Pool.Exec(ctx,
		`INSERT INTO admin_outreach_sequences
		 (id, contact_id, status, current_step, next_action_at, last_sent_at, gmail_thread_id, created_at, updated_at)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
		s.ID, s.ContactID, s.Status, s.CurrentStep, s.NextActionAt, s.LastSentAt, s.GmailThreadID,
		s.CreatedAt, s.UpdatedAt,
	)
	return err
}

// GetSequenceByContactID returns the sequence for a contact, or nil.
func (r *AdminOutreachRepo) GetSequenceByContactID(ctx context.Context, contactID uuid.UUID) (*domain.OutreachSequence, error) {
	var s domain.OutreachSequence
	err := r.Pool.QueryRow(ctx,
		`SELECT id, contact_id, status, current_step, next_action_at, last_sent_at, gmail_thread_id, created_at, updated_at
		 FROM admin_outreach_sequences WHERE contact_id = $1`, contactID,
	).Scan(&s.ID, &s.ContactID, &s.Status, &s.CurrentStep, &s.NextActionAt, &s.LastSentAt, &s.GmailThreadID, &s.CreatedAt, &s.UpdatedAt)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &s, nil
}

// GetSequenceByID returns a sequence by its ID, or nil.
func (r *AdminOutreachRepo) GetSequenceByID(ctx context.Context, id uuid.UUID) (*domain.OutreachSequence, error) {
	var s domain.OutreachSequence
	err := r.Pool.QueryRow(ctx,
		`SELECT id, contact_id, status, current_step, next_action_at, last_sent_at, gmail_thread_id, created_at, updated_at
		 FROM admin_outreach_sequences WHERE id = $1`, id,
	).Scan(&s.ID, &s.ContactID, &s.Status, &s.CurrentStep, &s.NextActionAt, &s.LastSentAt, &s.GmailThreadID, &s.CreatedAt, &s.UpdatedAt)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &s, nil
}

// ListActiveSequences returns sequences with status='active' and next_action_at <= now.
func (r *AdminOutreachRepo) ListActiveSequences(ctx context.Context) ([]domain.OutreachSequence, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT s.id, s.contact_id, s.status, s.current_step, s.next_action_at, s.last_sent_at, s.gmail_thread_id, s.created_at, s.updated_at,
		        c.name, c.org, c.email
		 FROM admin_outreach_sequences s
		 JOIN admin_outreach_contacts c ON c.id = s.contact_id
		 WHERE s.status = 'active' AND s.next_action_at <= NOW()
		 ORDER BY s.next_action_at ASC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var seqs []domain.OutreachSequence
	for rows.Next() {
		var s domain.OutreachSequence
		if err := rows.Scan(
			&s.ID, &s.ContactID, &s.Status, &s.CurrentStep, &s.NextActionAt, &s.LastSentAt, &s.GmailThreadID,
			&s.CreatedAt, &s.UpdatedAt, &s.ContactName, &s.ContactOrg, &s.ContactEmail,
		); err != nil {
			return nil, err
		}
		seqs = append(seqs, s)
	}
	return seqs, rows.Err()
}

// ListSequencesWithContacts returns all sequences with contact info.
func (r *AdminOutreachRepo) ListSequencesWithContacts(ctx context.Context) ([]domain.OutreachSequence, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT s.id, s.contact_id, s.status, s.current_step, s.next_action_at, s.last_sent_at, s.gmail_thread_id, s.created_at, s.updated_at,
		        c.name, c.org, c.email
		 FROM admin_outreach_sequences s
		 JOIN admin_outreach_contacts c ON c.id = s.contact_id
		 ORDER BY s.updated_at DESC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var seqs []domain.OutreachSequence
	for rows.Next() {
		var s domain.OutreachSequence
		if err := rows.Scan(
			&s.ID, &s.ContactID, &s.Status, &s.CurrentStep, &s.NextActionAt, &s.LastSentAt, &s.GmailThreadID,
			&s.CreatedAt, &s.UpdatedAt, &s.ContactName, &s.ContactOrg, &s.ContactEmail,
		); err != nil {
			return nil, err
		}
		seqs = append(seqs, s)
	}
	return seqs, rows.Err()
}

// UpdateSequence updates a sequence record.
func (r *AdminOutreachRepo) UpdateSequence(ctx context.Context, s *domain.OutreachSequence) error {
	s.UpdatedAt = time.Now()
	_, err := r.Pool.Exec(ctx,
		`UPDATE admin_outreach_sequences
		 SET status = $1, current_step = $2, next_action_at = $3, last_sent_at = $4,
		     gmail_thread_id = $5, updated_at = $6
		 WHERE id = $7`,
		s.Status, s.CurrentStep, s.NextActionAt, s.LastSentAt, s.GmailThreadID, s.UpdatedAt, s.ID,
	)
	return err
}

// ── Pending Emails ─────────────────────────────────────────────

// CreatePendingEmail inserts a new pending email.
func (r *AdminOutreachRepo) CreatePendingEmail(ctx context.Context, pe *domain.OutreachPendingEmail) error {
	if pe.ID == uuid.Nil {
		pe.ID = uuid.New()
	}
	now := time.Now()
	pe.CreatedAt = now
	pe.UpdatedAt = now
	_, err := r.Pool.Exec(ctx,
		`INSERT INTO admin_outreach_pending_emails
		 (id, contact_id, sequence_id, step_number, to_email, subject, body, status, gmail_message_id, generation_model, created_at, updated_at)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
		pe.ID, pe.ContactID, pe.SequenceID, pe.StepNumber, pe.ToEmail, pe.Subject, pe.Body,
		pe.Status, pe.GmailMessageID, pe.GenerationModel, pe.CreatedAt, pe.UpdatedAt,
	)
	return err
}

// ListPendingEmails returns pending emails filtered by status.
func (r *AdminOutreachRepo) ListPendingEmails(ctx context.Context, status string) ([]domain.OutreachPendingEmail, error) {
	query := `SELECT pe.id, pe.contact_id, pe.sequence_id, pe.step_number, pe.to_email, pe.subject, pe.body,
	                  pe.status, pe.gmail_message_id, pe.generation_model, pe.created_at, pe.updated_at,
	                  c.name, c.org
	           FROM admin_outreach_pending_emails pe
	           JOIN admin_outreach_contacts c ON c.id = pe.contact_id`
	args := []interface{}{}

	if status != "" {
		query += ` WHERE pe.status = $1`
		args = append(args, status)
	}

	query += ` ORDER BY pe.created_at DESC`

	rows, err := r.Pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var emails []domain.OutreachPendingEmail
	for rows.Next() {
		var pe domain.OutreachPendingEmail
		if err := rows.Scan(
			&pe.ID, &pe.ContactID, &pe.SequenceID, &pe.StepNumber, &pe.ToEmail, &pe.Subject, &pe.Body,
			&pe.Status, &pe.GmailMessageID, &pe.GenerationModel, &pe.CreatedAt, &pe.UpdatedAt,
			&pe.ContactName, &pe.ContactOrg,
		); err != nil {
			return nil, err
		}
		emails = append(emails, pe)
	}
	return emails, rows.Err()
}

// GetPendingEmailByID returns a pending email by ID, or nil.
func (r *AdminOutreachRepo) GetPendingEmailByID(ctx context.Context, id uuid.UUID) (*domain.OutreachPendingEmail, error) {
	var pe domain.OutreachPendingEmail
	err := r.Pool.QueryRow(ctx,
		`SELECT pe.id, pe.contact_id, pe.sequence_id, pe.step_number, pe.to_email, pe.subject, pe.body,
		        pe.status, pe.gmail_message_id, pe.generation_model, pe.created_at, pe.updated_at,
		        c.name, c.org
		 FROM admin_outreach_pending_emails pe
		 JOIN admin_outreach_contacts c ON c.id = pe.contact_id
		 WHERE pe.id = $1`, id,
	).Scan(
		&pe.ID, &pe.ContactID, &pe.SequenceID, &pe.StepNumber, &pe.ToEmail, &pe.Subject, &pe.Body,
		&pe.Status, &pe.GmailMessageID, &pe.GenerationModel, &pe.CreatedAt, &pe.UpdatedAt,
		&pe.ContactName, &pe.ContactOrg,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &pe, nil
}

// UpdatePendingEmail updates a pending email record.
func (r *AdminOutreachRepo) UpdatePendingEmail(ctx context.Context, pe *domain.OutreachPendingEmail) error {
	pe.UpdatedAt = time.Now()
	_, err := r.Pool.Exec(ctx,
		`UPDATE admin_outreach_pending_emails
		 SET subject = $1, body = $2, status = $3, gmail_message_id = $4, updated_at = $5
		 WHERE id = $6`,
		pe.Subject, pe.Body, pe.Status, pe.GmailMessageID, pe.UpdatedAt, pe.ID,
	)
	return err
}

// CountSentToday returns how many emails have been sent today.
func (r *AdminOutreachRepo) CountSentToday(ctx context.Context) (int, error) {
	var count int
	err := r.Pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM admin_outreach_pending_emails
		 WHERE status = 'sent' AND updated_at >= CURRENT_DATE`,
	).Scan(&count)
	return count, err
}

// ── Config ─────────────────────────────────────────────────────

// GetConfig returns the autopilot config (single row).
func (r *AdminOutreachRepo) GetConfig(ctx context.Context) (*domain.OutreachConfig, error) {
	var c domain.OutreachConfig
	err := r.Pool.QueryRow(ctx,
		`SELECT autopilot_enabled, sender_name, sender_title, sender_email, company_brief,
		        email_signature, send_hour_utc, max_emails_per_day, follow_up_delay_days,
		        google_account_key, created_at, updated_at
		 FROM admin_outreach_config WHERE id = 1`,
	).Scan(
		&c.AutopilotEnabled, &c.SenderName, &c.SenderTitle, &c.SenderEmail, &c.CompanyBrief,
		&c.EmailSignature, &c.SendHourUTC, &c.MaxEmailsPerDay, &c.FollowUpDelayDays,
		&c.GoogleAccountKey, &c.CreatedAt, &c.UpdatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &c, nil
}

// UpdateConfig updates the autopilot config.
func (r *AdminOutreachRepo) UpdateConfig(ctx context.Context, c *domain.OutreachConfig) error {
	c.UpdatedAt = time.Now()
	_, err := r.Pool.Exec(ctx,
		`UPDATE admin_outreach_config
		 SET autopilot_enabled = $1, sender_name = $2, sender_title = $3, sender_email = $4,
		     company_brief = $5, email_signature = $6, send_hour_utc = $7, max_emails_per_day = $8,
		     follow_up_delay_days = $9, google_account_key = $10, updated_at = $11
		 WHERE id = 1`,
		c.AutopilotEnabled, c.SenderName, c.SenderTitle, c.SenderEmail, c.CompanyBrief,
		c.EmailSignature, c.SendHourUTC, c.MaxEmailsPerDay, c.FollowUpDelayDays,
		c.GoogleAccountKey, c.UpdatedAt,
	)
	return err
}

// ── Autopilot Stats ────────────────────────────────────────────

// AutopilotStats returns aggregate metrics for the autopilot dashboard.
func (r *AdminOutreachRepo) AutopilotStats(ctx context.Context) (*domain.AutopilotStats, error) {
	var s domain.AutopilotStats
	err := r.Pool.QueryRow(ctx,
		`SELECT
		   (SELECT COUNT(*) FROM admin_outreach_sequences WHERE status = 'active'),
		   (SELECT COUNT(*) FROM admin_outreach_pending_emails WHERE status = 'pending_review'),
		   (SELECT COUNT(*) FROM admin_outreach_pending_emails WHERE status = 'sent' AND updated_at >= CURRENT_DATE),
		   (SELECT COUNT(*) FROM admin_outreach_contacts WHERE email_status = 'replied'),
		   (SELECT COUNT(*) FROM admin_outreach_activities WHERE activity_type = 'meeting')`,
	).Scan(&s.ActiveSequences, &s.PendingReview, &s.SentToday, &s.TotalReplies, &s.TotalMeetings)
	if err != nil {
		return nil, err
	}
	return &s, nil
}
