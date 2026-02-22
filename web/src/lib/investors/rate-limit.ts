import { query } from "./db"

const MAX_OTPS_PER_WINDOW = 3
const WINDOW_MINUTES = 10

/**
 * Check if a phone number has exceeded the OTP rate limit.
 * Returns true if the request should be BLOCKED.
 */
export async function isRateLimited(phoneE164: string): Promise<boolean> {
  const rows = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM investor_otp_codes
     WHERE phone_e164 = $1 AND created_at > NOW() - INTERVAL '${WINDOW_MINUTES} minutes'`,
    [phoneE164],
  )
  const count = parseInt(rows[0]?.count ?? "0", 10)
  return count >= MAX_OTPS_PER_WINDOW
}
