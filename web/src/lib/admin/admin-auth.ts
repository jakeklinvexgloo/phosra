/**
 * Admin authentication helper.
 * Checks the is_admin flag returned from the backend user object.
 */
export function isAdmin(user: { is_admin?: boolean } | null | undefined): boolean {
  return user?.is_admin === true
}
