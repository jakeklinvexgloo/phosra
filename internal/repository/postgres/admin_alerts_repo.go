package postgres

import (
	"context"
	"fmt"

	"github.com/google/uuid"

	"github.com/guardiangate/api/internal/domain"
)

type AdminAlertsRepo struct {
	*DB
}

func NewAdminAlertsRepo(db *DB) *AdminAlertsRepo {
	return &AdminAlertsRepo{DB: db}
}

// alertCols is the SELECT column list with COALESCE for nullable text fields.
const alertCols = `id, law_id, law_name, deadline_date, COALESCE(description, ''),
	urgency, status, created_at, updated_at`

func scanAlert(row interface{ Scan(dest ...any) error }, alert *domain.ComplianceAlert) error {
	return row.Scan(
		&alert.ID, &alert.LawID, &alert.LawName, &alert.DeadlineDate,
		&alert.Description, &alert.Urgency, &alert.Status,
		&alert.CreatedAt, &alert.UpdatedAt,
	)
}

// List returns all non-resolved compliance alerts ordered by deadline_date ASC.
func (r *AdminAlertsRepo) List(ctx context.Context) ([]domain.ComplianceAlert, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT `+alertCols+`
		 FROM admin_compliance_alerts
		 WHERE status != 'resolved'
		 ORDER BY deadline_date ASC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var alerts []domain.ComplianceAlert
	for rows.Next() {
		var alert domain.ComplianceAlert
		if err := scanAlert(rows, &alert); err != nil {
			return nil, err
		}
		alerts = append(alerts, alert)
	}
	return alerts, rows.Err()
}

// UpdateStatus changes the status of a compliance alert and bumps updated_at.
func (r *AdminAlertsRepo) UpdateStatus(ctx context.Context, id uuid.UUID, status domain.ComplianceAlertStatus) error {
	tag, err := r.Pool.Exec(ctx,
		`UPDATE admin_compliance_alerts SET status = $1, updated_at = NOW() WHERE id = $2`,
		status, id,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("compliance alert not found")
	}
	return nil
}
