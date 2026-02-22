import { createHash, randomInt, timingSafeEqual } from "crypto"

/**
 * Generate a 6-digit OTP code.
 */
export function generateOtp(): string {
  return randomInt(100_000, 999_999).toString()
}

/**
 * SHA-256 hash of a code (for storage — never store plaintext).
 */
export function hashOtp(code: string): string {
  return createHash("sha256").update(code).digest("hex")
}

/**
 * Timing-safe comparison of OTP code against stored hash.
 */
export function verifyOtp(code: string, storedHash: string): boolean {
  const candidateHash = hashOtp(code)
  const a = Buffer.from(candidateHash, "hex")
  const b = Buffer.from(storedHash, "hex")
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
