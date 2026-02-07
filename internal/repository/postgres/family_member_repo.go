package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type FamilyMemberRepo struct {
	*DB
}

func NewFamilyMemberRepo(db *DB) *FamilyMemberRepo {
	return &FamilyMemberRepo{DB: db}
}

func (r *FamilyMemberRepo) Add(ctx context.Context, member *domain.FamilyMember) error {
	if member.ID == uuid.Nil {
		member.ID = uuid.New()
	}
	member.JoinedAt = time.Now()

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO family_members (id, family_id, user_id, role, joined_at)
		 VALUES ($1, $2, $3, $4, $5)`,
		member.ID, member.FamilyID, member.UserID, member.Role, member.JoinedAt,
	)
	return err
}

func (r *FamilyMemberRepo) Remove(ctx context.Context, familyID, userID uuid.UUID) error {
	_, err := r.Pool.Exec(ctx,
		`DELETE FROM family_members WHERE family_id = $1 AND user_id = $2`,
		familyID, userID,
	)
	return err
}

func (r *FamilyMemberRepo) ListByFamily(ctx context.Context, familyID uuid.UUID) ([]domain.FamilyMember, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, family_id, user_id, role, joined_at
		 FROM family_members WHERE family_id = $1
		 ORDER BY joined_at`, familyID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []domain.FamilyMember
	for rows.Next() {
		var m domain.FamilyMember
		if err := rows.Scan(&m.ID, &m.FamilyID, &m.UserID, &m.Role, &m.JoinedAt); err != nil {
			return nil, err
		}
		members = append(members, m)
	}
	return members, rows.Err()
}

func (r *FamilyMemberRepo) GetRole(ctx context.Context, familyID, userID uuid.UUID) (*domain.FamilyMember, error) {
	var m domain.FamilyMember
	err := r.Pool.QueryRow(ctx,
		`SELECT id, family_id, user_id, role, joined_at
		 FROM family_members WHERE family_id = $1 AND user_id = $2`,
		familyID, userID,
	).Scan(&m.ID, &m.FamilyID, &m.UserID, &m.Role, &m.JoinedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}
