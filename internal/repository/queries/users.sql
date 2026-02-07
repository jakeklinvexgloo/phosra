-- name: CreateUser :exec
INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: GetUserByID :one
SELECT id, email, password_hash, name, created_at, updated_at, deleted_at
FROM users WHERE id = $1 AND deleted_at IS NULL;

-- name: GetUserByEmail :one
SELECT id, email, password_hash, name, created_at, updated_at, deleted_at
FROM users WHERE email = $1 AND deleted_at IS NULL;

-- name: UpdateUser :exec
UPDATE users SET email = $2, name = $3, updated_at = $4 WHERE id = $1;

-- name: SoftDeleteUser :exec
UPDATE users SET deleted_at = NOW() WHERE id = $1;
