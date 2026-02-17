package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type DeviceRegistrationRepo struct{ *DB }

func NewDeviceRegistrationRepo(db *DB) *DeviceRegistrationRepo {
	return &DeviceRegistrationRepo{DB: db}
}

func (r *DeviceRegistrationRepo) Create(ctx context.Context, reg *domain.DeviceRegistration) error {
	if reg.ID == uuid.Nil {
		reg.ID = uuid.New()
	}
	now := time.Now()
	reg.CreatedAt = now
	reg.UpdatedAt = now

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO device_registrations
		 (id, child_id, family_id, platform_id, device_name, device_model, os_version, app_version, apns_token, api_key_hash, last_seen_at, last_policy_version, status, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
		reg.ID, reg.ChildID, reg.FamilyID, reg.PlatformID,
		reg.DeviceName, reg.DeviceModel, reg.OSVersion, reg.AppVersion,
		reg.APNsToken, reg.APIKeyHash, reg.LastSeenAt, reg.LastPolicyVersion,
		reg.Status, reg.CreatedAt, reg.UpdatedAt,
	)
	return err
}

func (r *DeviceRegistrationRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.DeviceRegistration, error) {
	var reg domain.DeviceRegistration
	err := r.Pool.QueryRow(ctx,
		`SELECT id, child_id, family_id, platform_id, device_name, device_model,
		        os_version, app_version, apns_token, api_key_hash, last_seen_at,
		        last_policy_version, status, created_at, updated_at
		 FROM device_registrations WHERE id = $1`, id,
	).Scan(
		&reg.ID, &reg.ChildID, &reg.FamilyID, &reg.PlatformID,
		&reg.DeviceName, &reg.DeviceModel, &reg.OSVersion, &reg.AppVersion,
		&reg.APNsToken, &reg.APIKeyHash, &reg.LastSeenAt,
		&reg.LastPolicyVersion, &reg.Status, &reg.CreatedAt, &reg.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &reg, nil
}

func (r *DeviceRegistrationRepo) GetByAPIKeyHash(ctx context.Context, hash string) (*domain.DeviceRegistration, error) {
	var reg domain.DeviceRegistration
	err := r.Pool.QueryRow(ctx,
		`SELECT id, child_id, family_id, platform_id, device_name, device_model,
		        os_version, app_version, apns_token, api_key_hash, last_seen_at,
		        last_policy_version, status, created_at, updated_at
		 FROM device_registrations WHERE api_key_hash = $1 AND status = 'active'`, hash,
	).Scan(
		&reg.ID, &reg.ChildID, &reg.FamilyID, &reg.PlatformID,
		&reg.DeviceName, &reg.DeviceModel, &reg.OSVersion, &reg.AppVersion,
		&reg.APNsToken, &reg.APIKeyHash, &reg.LastSeenAt,
		&reg.LastPolicyVersion, &reg.Status, &reg.CreatedAt, &reg.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &reg, nil
}

func (r *DeviceRegistrationRepo) Update(ctx context.Context, reg *domain.DeviceRegistration) error {
	reg.UpdatedAt = time.Now()
	_, err := r.Pool.Exec(ctx,
		`UPDATE device_registrations
		 SET device_name = $1, device_model = $2, os_version = $3, app_version = $4,
		     apns_token = $5, last_seen_at = $6, last_policy_version = $7, status = $8, updated_at = $9
		 WHERE id = $10`,
		reg.DeviceName, reg.DeviceModel, reg.OSVersion, reg.AppVersion,
		reg.APNsToken, reg.LastSeenAt, reg.LastPolicyVersion, reg.Status, reg.UpdatedAt,
		reg.ID,
	)
	return err
}

func (r *DeviceRegistrationRepo) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.Pool.Exec(ctx, `DELETE FROM device_registrations WHERE id = $1`, id)
	return err
}

func (r *DeviceRegistrationRepo) ListByChild(ctx context.Context, childID uuid.UUID) ([]domain.DeviceRegistration, error) {
	return r.list(ctx,
		`SELECT id, child_id, family_id, platform_id, device_name, device_model,
		        os_version, app_version, apns_token, api_key_hash, last_seen_at,
		        last_policy_version, status, created_at, updated_at
		 FROM device_registrations WHERE child_id = $1 ORDER BY created_at`, childID)
}

func (r *DeviceRegistrationRepo) ListByFamily(ctx context.Context, familyID uuid.UUID) ([]domain.DeviceRegistration, error) {
	return r.list(ctx,
		`SELECT id, child_id, family_id, platform_id, device_name, device_model,
		        os_version, app_version, apns_token, api_key_hash, last_seen_at,
		        last_policy_version, status, created_at, updated_at
		 FROM device_registrations WHERE family_id = $1 ORDER BY created_at`, familyID)
}

func (r *DeviceRegistrationRepo) list(ctx context.Context, query string, args ...any) ([]domain.DeviceRegistration, error) {
	rows, err := r.Pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []domain.DeviceRegistration
	for rows.Next() {
		var reg domain.DeviceRegistration
		if err := rows.Scan(
			&reg.ID, &reg.ChildID, &reg.FamilyID, &reg.PlatformID,
			&reg.DeviceName, &reg.DeviceModel, &reg.OSVersion, &reg.AppVersion,
			&reg.APNsToken, &reg.APIKeyHash, &reg.LastSeenAt,
			&reg.LastPolicyVersion, &reg.Status, &reg.CreatedAt, &reg.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, reg)
	}
	return items, rows.Err()
}
