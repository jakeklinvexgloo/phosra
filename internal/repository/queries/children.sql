-- name: CreateChild :exec
INSERT INTO children (id, family_id, name, birth_date, avatar_url, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7);

-- name: GetChildByID :one
SELECT id, family_id, name, birth_date, avatar_url, created_at, updated_at
FROM children WHERE id = $1;

-- name: UpdateChild :exec
UPDATE children SET name = $2, birth_date = $3, avatar_url = $4, updated_at = $5 WHERE id = $1;

-- name: DeleteChild :exec
DELETE FROM children WHERE id = $1;

-- name: ListChildrenByFamily :many
SELECT id, family_id, name, birth_date, avatar_url, created_at, updated_at
FROM children WHERE family_id = $1 ORDER BY created_at;
