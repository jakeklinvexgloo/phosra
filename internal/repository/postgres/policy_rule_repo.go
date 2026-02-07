package postgres

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type PolicyRuleRepo struct {
	*DB
}

func NewPolicyRuleRepo(db *DB) *PolicyRuleRepo {
	return &PolicyRuleRepo{DB: db}
}

func (r *PolicyRuleRepo) Create(ctx context.Context, rule *domain.PolicyRule) error {
	if rule.ID == uuid.Nil {
		rule.ID = uuid.New()
	}
	now := time.Now()
	rule.CreatedAt = now
	rule.UpdatedAt = now

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO policy_rules (id, policy_id, category, enabled, config, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		rule.ID, rule.PolicyID, rule.Category, rule.Enabled, rule.Config, rule.CreatedAt, rule.UpdatedAt,
	)
	return err
}

func (r *PolicyRuleRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.PolicyRule, error) {
	var rule domain.PolicyRule
	err := r.Pool.QueryRow(ctx,
		`SELECT id, policy_id, category, enabled, config, created_at, updated_at
		 FROM policy_rules WHERE id = $1`, id,
	).Scan(&rule.ID, &rule.PolicyID, &rule.Category, &rule.Enabled, &rule.Config, &rule.CreatedAt, &rule.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &rule, nil
}

func (r *PolicyRuleRepo) Update(ctx context.Context, rule *domain.PolicyRule) error {
	rule.UpdatedAt = time.Now()
	_, err := r.Pool.Exec(ctx,
		`UPDATE policy_rules SET category = $1, enabled = $2, config = $3, updated_at = $4
		 WHERE id = $5`,
		rule.Category, rule.Enabled, rule.Config, rule.UpdatedAt, rule.ID,
	)
	return err
}

func (r *PolicyRuleRepo) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.Pool.Exec(ctx,
		`DELETE FROM policy_rules WHERE id = $1`, id,
	)
	return err
}

func (r *PolicyRuleRepo) ListByPolicy(ctx context.Context, policyID uuid.UUID) ([]domain.PolicyRule, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, policy_id, category, enabled, config, created_at, updated_at
		 FROM policy_rules WHERE policy_id = $1
		 ORDER BY category`, policyID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rules []domain.PolicyRule
	for rows.Next() {
		var rule domain.PolicyRule
		if err := rows.Scan(&rule.ID, &rule.PolicyID, &rule.Category, &rule.Enabled, &rule.Config, &rule.CreatedAt, &rule.UpdatedAt); err != nil {
			return nil, err
		}
		rules = append(rules, rule)
	}
	return rules, rows.Err()
}

func (r *PolicyRuleRepo) BulkUpsert(ctx context.Context, policyID uuid.UUID, rules []domain.PolicyRule) error {
	if len(rules) == 0 {
		return nil
	}

	now := time.Now()
	var b strings.Builder
	args := make([]interface{}, 0, len(rules)*6)

	b.WriteString(`INSERT INTO policy_rules (id, policy_id, category, enabled, config, created_at, updated_at) VALUES `)

	for i, rule := range rules {
		if rule.ID == uuid.Nil {
			rule.ID = uuid.New()
		}

		if i > 0 {
			b.WriteString(", ")
		}
		offset := i * 7
		b.WriteString(fmt.Sprintf("($%d, $%d, $%d, $%d, $%d, $%d, $%d)",
			offset+1, offset+2, offset+3, offset+4, offset+5, offset+6, offset+7))

		args = append(args, rule.ID, policyID, rule.Category, rule.Enabled, rule.Config, now, now)
	}

	b.WriteString(` ON CONFLICT (policy_id, category) DO UPDATE SET enabled = EXCLUDED.enabled, config = EXCLUDED.config, updated_at = EXCLUDED.updated_at`)

	_, err := r.Pool.Exec(ctx, b.String(), args...)
	return err
}
