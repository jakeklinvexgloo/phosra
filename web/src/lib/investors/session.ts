import { SignJWT, jwtVerify } from "jose"
import { createHash, randomUUID } from "crypto"

const ALGORITHM = "HS256"

function getSecret(): Uint8Array {
  const secret = process.env.INVESTOR_JWT_SECRET
  if (!secret) throw new Error("INVESTOR_JWT_SECRET is not set")
  return new TextEncoder().encode(secret)
}

function getSessionDays(): number {
  return parseInt(process.env.INVESTOR_SESSION_DAYS ?? "30", 10)
}

export interface InvestorTokenPayload {
  phone: string
  name: string
  company: string
  jti: string
}

/**
 * Create a signed JWT for an investor session.
 */
export async function createSessionToken(payload: {
  phone: string
  name: string
  company: string
}): Promise<{ token: string; jti: string; expiresAt: Date }> {
  const jti = randomUUID()
  const days = getSessionDays()
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

  const token = await new SignJWT({
    phone: payload.phone,
    name: payload.name,
    company: payload.company,
    jti,
  })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .setSubject(payload.phone)
    .sign(getSecret())

  return { token, jti, expiresAt }
}

/**
 * Verify and decode an investor JWT.
 */
export async function verifySessionToken(
  token: string,
): Promise<InvestorTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: [ALGORITHM],
    })
    return {
      phone: payload.phone as string,
      name: payload.name as string,
      company: payload.company as string,
      jti: payload.jti as string,
    }
  } catch {
    return null
  }
}

/**
 * SHA-256 hash of JWT jti (for DB storage — never store full JWT).
 */
export function hashToken(jti: string): string {
  return createHash("sha256").update(jti).digest("hex")
}
