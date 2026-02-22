import twilio from "twilio"

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) throw new Error("Twilio credentials not configured")
  return twilio(sid, token)
}

function getFromNumber(): string {
  const num = process.env.TWILIO_PHONE_NUMBER
  if (!num) throw new Error("TWILIO_PHONE_NUMBER is not set")
  return num
}

/**
 * Send a 6-digit OTP code via SMS.
 */
export async function sendOtpSms(to: string, code: string): Promise<void> {
  const client = getClient()
  await client.messages.create({
    to,
    from: getFromNumber(),
    body: `Your Phosra investor portal code is: ${code}. Expires in 5 minutes.`,
  })
}

/**
 * Send an invite SMS to a newly approved investor.
 */
export async function sendInviteSms(
  to: string,
  inviterName: string,
): Promise<void> {
  const client = getClient()
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : process.env.NEXTAUTH_URL ?? "https://phosra.com"

  await client.messages.create({
    to,
    from: getFromNumber(),
    body: `${inviterName} from Phosra invited you to our investor data room: ${baseUrl}/investors/portal`,
  })
}
