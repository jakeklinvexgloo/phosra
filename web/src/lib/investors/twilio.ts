import twilio from "twilio"

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) throw new Error("Twilio credentials not configured")
  return twilio(sid, token)
}

function getVerifyServiceSid(): string {
  const sid = process.env.TWILIO_VERIFY_SERVICE_SID
  if (!sid) throw new Error("TWILIO_VERIFY_SERVICE_SID is not set")
  return sid
}

/**
 * Send an OTP code via Twilio Verify.
 * Twilio generates, stores, rate-limits, and delivers the code.
 */
export async function sendVerifyOtp(to: string): Promise<void> {
  const client = getClient()
  await client.verify.v2
    .services(getVerifyServiceSid())
    .verifications.create({ to, channel: "sms" })
}

/**
 * Check an OTP code via Twilio Verify.
 * Returns true if the code is valid.
 */
export async function checkVerifyOtp(to: string, code: string): Promise<boolean> {
  const client = getClient()
  try {
    const check = await client.verify.v2
      .services(getVerifyServiceSid())
      .verificationChecks.create({ to, code })
    return check.status === "approved"
  } catch {
    return false
  }
}

/**
 * Send an invite SMS to a newly approved investor.
 * Best-effort: uses messaging service if available, falls back to direct send.
 * May fail if A2P 10DLC registration is not complete.
 */
export async function sendInviteSms(
  to: string,
  inviterName: string,
): Promise<void> {
  const client = getClient()
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : process.env.NEXTAUTH_URL ?? "https://phosra.com"

  const body = `${inviterName} from Phosra invited you to our investor data room: ${baseUrl}/investors/portal`

  const msgServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID
  if (msgServiceSid) {
    await client.messages.create({ to, messagingServiceSid: msgServiceSid, body })
  } else {
    const from = process.env.TWILIO_PHONE_NUMBER
    if (!from) throw new Error("TWILIO_PHONE_NUMBER is not set")
    await client.messages.create({ to, from, body })
  }
}
