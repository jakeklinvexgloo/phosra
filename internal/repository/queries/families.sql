-- name: CreateFamily :exec
INSERT INTO families (id, name, created_at, updated_at) VALUES ($1, $2, $3, $4);

-- name: GetFamilyByID :one
SELECT id, name, created_at, updated_at FROM families WHERE id = $1;

-- name: UpdateFamily :exec
UPDATE families SET name = $2, updated_at = $3 WHERE id = $1;

-- name: DeleteFamily :exec
DELETE FROM families WHERE id = $1;

-- name: ListFamiliesByUser :many
SELECT f.id, f.name, f.created_at, f.updated_at
FROM families f
JOIN family_members fm ON fm.family_id = f.id
WHERE fm.user_id = $1;

-- name: AddFamilyMember :exec
INSERT INTO family_members (id, family_id, user_id, role, joined_at) VALUES ($1, $2, $3, $4, $5);

-- name: RemoveFamilyMember :exec
DELETE FROM family_members WHERE family_id = $1 AND user_id = $2;

-- name: ListFamilyMembers :many
SELECT id, family_id, user_id, role, joined_at FROM family_members WHERE family_id = $1;

-- name: GetFamilyMemberRole :one
SELECT id, family_id, user_id, role, joined_at FROM family_members WHERE family_id = $1 AND user_id = $2;
