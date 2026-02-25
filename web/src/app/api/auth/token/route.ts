import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Returns the Stytch session JWT from the HttpOnly cookie.
 *
 * The Stytch SDK sets stytch_session_jwt as HttpOnly, so client-side
 * JavaScript cannot read it via document.cookie. This endpoint lets
 * the useApi hook retrieve the JWT for Authorization headers to our
 * Go backend.
 */
export async function GET(request: NextRequest) {
  const jwt = request.cookies.get("stytch_session_jwt")?.value
  if (!jwt) {
    return NextResponse.json({ token: null }, { status: 401 })
  }
  return NextResponse.json({ token: jwt })
}
