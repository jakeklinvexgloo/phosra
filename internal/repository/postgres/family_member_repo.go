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
		`INSERT INTO family_members (id, family_id, user_id, role, joined_at, display_name)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		member.ID, member.FamilyID, member.UserID, member.Role, member.JoinedAt, member.DisplayName,
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

func (r *FamilyMemberRepo) Update(ctx context.Context, member *domain.FamilyMember) error {
	_, err := r.Pool.Exec(ctx,
		`UPDATE family_members SET display_name = $1, role = $2 WHERE id = $3 AND family_id = $4`,
		member.DisplayName, member.Role, member.ID, member.FamilyID,
	)
	return err
}

func (r *FamilyMemberRepo) ListByFamily(ctx context.Context, familyID uuid.UUID) ([]domain.FamilyMember, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT fm.id, fm.family_id, fm.user_id, fm.role, fm.joined_at,
		        u.email, COALESCE(u.name, ''), COALESCE(fm.display_name, '')
		 FROM family_members fm
		 JOIN users u ON u.id = fm.user_id
		 WHERE fm.family_id = $1
		 ORDER BY fm.joined_at`, familyID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []domain.FamilyMember
	for rows.Next() {
		var m domain.FamilyMember
		if err := rows.Scan(&m.ID, &m.FamilyID, &m.UserID, &m.Role, &m.JoinedAt, &m.Email, &m.Name, &m.DisplayName); err != nil {
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
