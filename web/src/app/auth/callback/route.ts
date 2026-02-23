import { NextRequest, NextResponse } from "next/server"
import { getStytchClient } from "@/lib/stytch-server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get("token")
  const tokenType = searchParams.get("stytch_token_type")

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing_token", request.url))
  }

  try {
    const client = getStytchClient()
    const sessionDuration = 60 * 24 * 7 // 7 days

    let sessionToken: string
    let sessionJwt: string

    if (tokenType === "oauth") {
      const response = await client.oauth.authenticate({
        token,
        session_duration_minutes: sessionDuration,
      })
      sessionToken = response.session_token
      sessionJwt = response.session_jwt
    } else if (tokenType === "magic_links") {
      const response = await client.magicLinks.authenticate({
        token,
        session_duration_minutes: sessionDuration,
      })
      sessionToken = response.session_token
      sessionJwt = response.session_jwt
    } else {
      // Default to oauth
      const response = await client.oauth.authenticate({
        token,
        session_duration_minutes: sessionDuration,
      })
      sessionToken = response.session_token
      sessionJwt = response.session_jwt
    }

    const redirectUrl = new URL("/dashboard", request.url)
    const res = NextResponse.redirect(redirectUrl)

    // Set Stytch session cookies
    res.cookies.set("stytch_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    res.cookies.set("stytch_session_jwt", sessionJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return res
  } catch (err) {
    console.error("Stytch auth callback error:", err)
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url))
  }
}
