package postgres

import (
	"context"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
)

type NotificationScheduleRepo struct{ *DB }

func NewNotificationScheduleRepo(db *DB) *NotificationScheduleRepo {
	return &NotificationScheduleRepo{DB: db}
}

func (r *NotificationScheduleRepo) Upsert(ctx context.Context, s *domain.NotificationSchedule) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	_, err := r.Pool.Exec(ctx,
		`INSERT INTO notification_schedules (id, child_id, family_id, rule_category, config, active, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
		 ON CONFLICT (child_id, rule_category)
		 DO UPDATE SET config = EXCLUDED.config, active = EXCLUDED.active, updated_at = NOW()`,
		s.ID, s.ChildID, s.FamilyID, s.RuleCategory, s.Config, s.Active,
	)
	return err
}

func (r *NotificationScheduleRepo) GetByChildAndCategory(ctx context.Context, childID uuid.UUID, category domain.RuleCategory) (*domain.NotificationSchedule, error) {
	var s domain.NotificationSchedule
	err := r.Pool.QueryRow(ctx,
		`SELECT id, child_id, family_id, rule_category, config, active, created_at, updated_at
		 FROM notification_schedules WHERE child_id = $1 AND rule_category = $2`,
		childID, category,
	).Scan(&s.ID, &s.ChildID, &s.FamilyID, &s.RuleCategory, &s.Config, &s.Active, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *NotificationScheduleRepo) ListByChild(ctx context.Context, childID uuid.UUID) ([]domain.NotificationSchedule, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, child_id, family_id, rule_category, config, active, created_at, updated_at
		 FROM notification_schedules WHERE child_id = $1 ORDER BY created_at`, childID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []domain.NotificationSchedule
	for rows.Next() {
		var s domain.NotificationSchedule
		if err := rows.Scan(&s.ID, &s.ChildID, &s.FamilyID, &s.RuleCategory, &s.Config, &s.Active, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, s)
	}
	return items, rows.Err()
}

func (r *NotificationScheduleRepo) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.Pool.Exec(ctx, `DELETE FROM notification_schedules WHERE id = $1`, id)
	return err
}
