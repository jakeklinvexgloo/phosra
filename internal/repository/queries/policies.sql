-- name: CreatePolicy :exec
INSERT INTO child_policies (id, child_id, name, status, priority, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7);

-- name: GetPolicyByID :one
SELECT id, child_id, name, status, priority, created_at, updated_at
FROM child_policies WHERE id = $1;

-- name: UpdatePolicy :exec
UPDATE child_policies SET name = $2, status = $3, priority = $4, updated_at = $5 WHERE id = $1;

-- name: DeletePolicy :exec
DELETE FROM child_policies WHERE id = $1;

-- name: ListPoliciesByChild :many
SELECT id, child_id, name, status, priority, created_at, updated_at
FROM child_policies WHERE child_id = $1 ORDER BY priority DESC, created_at;

-- name: CreatePolicyRule :exec
INSERT INTO policy_rules (id, policy_id, category, enabled, config, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7);

-- name: GetPolicyRuleByID :one
SELECT id, policy_id, category, enabled, config, created_at, updated_at
FROM policy_rules WHERE id = $1;

-- name: UpdatePolicyRule :exec
UPDATE policy_rules SET enabled = $2, config = $3, updated_at = $4 WHERE id = $1;

-- name: DeletePolicyRule :exec
DELETE FROM policy_rules WHERE id = $1;

-- name: ListPolicyRules :many
SELECT id, policy_id, category, enabled, config, created_at, updated_at
FROM policy_rules WHERE policy_id = $1 ORDER BY category;

-- name: UpsertPolicyRule :exec
INSERT INTO policy_rules (id, policy_id, category, enabled, config, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT (policy_id, category) DO UPDATE
SET enabled = EXCLUDED.enabled, config = EXCLUDED.config, updated_at = EXCLUDED.updated_at;
