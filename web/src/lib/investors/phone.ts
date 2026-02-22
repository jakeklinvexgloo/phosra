/**
 * Normalize a phone number to E.164 format.
 * Handles: US 10-digit, +1, and international formats.
 */
export function normalizePhone(input: string): string | null {
  // Strip everything except digits and leading +
  const stripped = input.replace(/[^\d+]/g, "")

  // Already E.164 with country code
  if (stripped.startsWith("+")) {
    const digits = stripped.slice(1)
    if (digits.length >= 10 && digits.length <= 15) {
      return `+${digits}`
    }
    return null
  }

  // US: 10 digits → +1
  if (stripped.length === 10) {
    return `+1${stripped}`
  }

  // US: 11 digits starting with 1
  if (stripped.length === 11 && stripped.startsWith("1")) {
    return `+${stripped}`
  }

  return null
}

/**
 * Format E.164 for display: +12125551234 → (212) 555-1234
 */
export function formatPhoneDisplay(e164: string): string {
  if (e164.startsWith("+1") && e164.length === 12) {
    const area = e164.slice(2, 5)
    const prefix = e164.slice(5, 8)
    const line = e164.slice(8, 12)
    return `(${area}) ${prefix}-${line}`
  }
  return e164
}
